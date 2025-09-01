// game.js (ESM entrypoint)
import { BASE, BAL, recomputeBalance } from './core/balance.js';
import { attachPointer } from './core/input.js';
import { initScenery, drawBackground } from './render/scenery.js';
import { PREY, spawnPrey, updatePrey, drawPrey } from './entities/prey.js';
import { makeSeal } from './entities/seal.js';

const { sin, cos, hypot, min, max, PI } = Math;

// Reusable sweep samples (avoid recreating [0,0.5,1] each frame in prey.js)
export const SWEEP_T = [0, 0.5, 1];

// ——— DOM/Canvas
const CANVAS = document.getElementById('game');
const CTX = CANVAS.getContext('2d', { alpha:false });
const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

const UI = {
  time: document.getElementById('time'),
  score: document.getElementById('score'),
  best: document.getElementById('best'),
  overlay: document.getElementById('overlay'),
  message: document.getElementById('message'),
  btnStart: document.getElementById('btnStart'),
  btnAgain: document.getElementById('btnAgain'),
  btnPause: document.getElementById('btnPause'),
  btnShareEnd: document.getElementById('btnShareEnd'),
  btnSound: document.getElementById('btnSound'),
};

const GAME_DURATION = 60_000;
const WORLD = { w:0, h:0 };
const STATE = { running:false, over:false, paused:false };
const SCORE = { now:0, best:0 };
const POINTER = { x:0, y:0, active:false };

// ——— Audio (gentle pop) — warm up on first user gesture to avoid hitch
const FX = { enabled: (localStorage.getItem('seal_hunt_sound') ?? '1') === '1' };
let audioCtx = null;
let audioReady = false;

async function initAudio() {
  if (audioReady || !FX.enabled) return;
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC({ latencyHint: 'interactive' });
    }
    // Some browsers need an explicit resume() within a gesture
    if (audioCtx.state === 'suspended') await audioCtx.resume();

    // Warm up: start/stop a nearly silent node so the graph is “hot”
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    g.gain.value = 0.00001;      // effectively silent
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + 0.05);

    audioReady = true;
  } catch {}
}

function pop() {
  if (!FX.enabled) return;
  // If not warmed yet, do it asynchronously and fire the pop next tick
  if (!audioReady) { initAudio().then(() => setTimeout(pop, 0)); return; }
  try {
    const ctx = audioCtx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 660 + Math.random() * 60;
    g.gain.value = 0.12;
    o.connect(g); g.connect(ctx.destination);
    const t0 = ctx.currentTime;
    o.start(t0);
    o.frequency.exponentialRampToValueAtTime(120, t0 + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
    o.stop(t0 + 0.13);
  } catch {}
}

// ——— Helpers
const lerp=(a,b,t)=>a+(b-a)*t;
function makeSpots(seed=1,count=28){ let x=seed;
  const rnd=()=> (x=(x*1664525+1013904223)%2**32, (x/2**32));
  const arr=[]; for(let i=0;i<count;i++){
    const rx=(rnd()*1.6-0.8), ry=(rnd()*1.2-0.6), r=0.05+rnd()*0.08;
    arr.push({rx,ry,r,a:0.45+rnd()*0.25});
  } return arr;
}

// ——— Seal
const seal = makeSeal(makeSpots);

// ——— Resize + scenery
function resize(){
  // read the CSS size (style.css already sets 100vw/100vh)
  const cssW = CANVAS.clientWidth || window.innerWidth;
  const cssH = CANVAS.clientHeight || window.innerHeight;

  WORLD.w = cssW;
  WORLD.h = cssH;

  // set the backing store size for high-DPI rendering
  CANVAS.width  = Math.floor(cssW * DPR);
  CANVAS.height = Math.floor(cssH * DPR);
  CTX.setTransform(DPR, 0, 0, DPR, 0, 0);

  recomputeBalance(WORLD.w, WORLD.h);
  initScenery(WORLD, CTX);
}

let resizePend = false;
window.addEventListener('resize', () => {
  if (resizePend) return;
  resizePend = true;
  requestAnimationFrame(() => { resizePend = false; resize(); });
}, { passive: true });

resize();

// ——— Input
attachPointer(CANVAS,
  p=>{ POINTER.x=p.x; POINTER.y=p.y; },
  p=>{ POINTER.active=true; POINTER.x=p.x; POINTER.y=p.y; },
  ()=>{ POINTER.active=false; }
);
let didWarmAudio = false;
const warmOnce = () => { if (!didWarmAudio) { didWarmAudio = true; initAudio(); } };
CANVAS.addEventListener('touchstart', warmOnce, { passive: true });
CANVAS.addEventListener('mousedown',  warmOnce);

// ——— UI
function refreshSoundButton(){
  if(!UI.btnSound) return;
  UI.btnSound.textContent = FX.enabled ? '🔊' : '🔈';
  UI.btnSound.setAttribute('aria-pressed', String(!FX.enabled));
  UI.btnSound.title = FX.enabled ? 'Звук: вкл' : 'Звук: выкл';
}
if(UI.btnSound){
  refreshSoundButton();
  UI.btnSound.addEventListener('click', ()=>{
    FX.enabled = !FX.enabled;
    localStorage.setItem('seal_hunt_sound', FX.enabled?'1':'0');
    refreshSoundButton();
    if (FX.enabled) initAudio();   // warm immediately when turning sound back on
  });
}

SCORE.best = Number(localStorage.getItem('seal_hunt_best')||0);
UI.best.textContent = SCORE.best;

const params=new URLSearchParams(location.search);
if(params.has('s')){
  const friendScore=Number(params.get('s'));
  const friendBest =Number(params.get('b')||friendScore);
  UI.overlay.hidden=false;
  UI.message.innerHTML=`Ваш друг (подруга) набрал(а) <b>${friendScore}</b> очков (рекорд: <b>${friendBest}</b>). Сможете больше?`;
  UI.btnShareEnd.hidden=true; UI.btnAgain.textContent='Играть';
}else{
  UI.overlay.hidden=false;
  UI.message.innerHTML='Лови как можно больше 🐟 за <b>60 секунд</b>.<br>Управление: удерживай палец/мышь — тюлень плывёт за касанием.';
  UI.btnShareEnd.hidden=true; UI.btnAgain.textContent='Играть';
}

UI.btnStart.addEventListener('click', startGame);
UI.btnAgain.addEventListener('click', startGame);
UI.btnPause.addEventListener('click', ()=>{
  if(!STATE.running) return;
  STATE.paused = !STATE.paused;
  UI.btnPause.textContent = STATE.paused ? 'Продолжить' : 'Пауза';
  UI.btnPause.setAttribute('aria-pressed', String(STATE.paused));
  if(!STATE.paused) lastTime = performance.now();
  loop();
});
UI.btnShareEnd.addEventListener('click', shareScore);
UI.btnStart.addEventListener('click', () => { initAudio(); startGame(); });
UI.btnAgain.addEventListener('click', () => { initAudio(); startGame(); });


// ——— Game loop state
let lastTime=0, timeLeft=GAME_DURATION, spawnTimer=0;

function startGame(){
  STATE.running=true; STATE.over=false; STATE.paused=false;
  UI.overlay.hidden=true; UI.btnShareEnd.hidden=true;
  UI.btnPause.textContent='Пауза';
  SCORE.now=0; UI.score.textContent='0';
  timeLeft=GAME_DURATION; spawnTimer=0; PREY.length=0;

  // apply balance
  recomputeBalance(WORLD.w,WORLD.h);
  seal.maxSpeed = BAL.sealSpeed;
  seal.accel    = BAL.sealAccel;

  // place seal
  seal.x = WORLD.w*0.3; seal.y = WORLD.h*0.5;
  seal.px=seal.x; seal.py=seal.y; seal.vx=seal.vy=0;
  POINTER.active=false;

  lastTime = performance.now();
  loop();
}

function endGame(){
  STATE.running=false; STATE.over=true; UI.overlay.hidden=false;
  if(SCORE.now > SCORE.best){
    SCORE.best=SCORE.now; localStorage.setItem('seal_hunt_best', String(SCORE.best));
    UI.best.textContent=SCORE.best;
    UI.message.innerHTML=`Время вышло! Ваш счёт: <b>${SCORE.now}</b> 🐟 — <b>Новый рекорд!</b> 🏆`;
  }else{
    UI.message.innerHTML=`Время вышло! Ваш счёт: <b>${SCORE.now}</b> 🐟 рекорд: <b>${SCORE.best}</b> 🏆`;
  }
  UI.btnShareEnd.hidden=false; UI.btnAgain.textContent='Играть ещё';
}

function loop(){
  if(!STATE.running){ drawFrame(0); return; }
  const now=performance.now(); let dt=(now-lastTime)/1000; lastTime=now;
  if(STATE.paused){ drawFrame(0); return; }
  dt=Math.min(dt,0.033);
  update(dt); drawFrame(dt);
  if(STATE.running) requestAnimationFrame(loop);
}

function update(dt){
  timeLeft -= dt*1000;
  if(timeLeft<=0){ UI.time.textContent='0'; endGame(); return; }
  UI.time.textContent = Math.ceil(timeLeft/1000);

  // population control (calm)
  spawnTimer -= dt;
  const progress = 1 - Math.max(0,timeLeft)/GAME_DURATION; // 0..1
  const targetPop = Math.min(BAL.maxPreyCap, Math.round((BAL.maxPreyCap*0.6)+progress*(BAL.maxPreyCap*0.4)));
  if(PREY.length < targetPop && spawnTimer<=0){
    const need = targetPop - PREY.length;
    const batch = Math.min(2, need);
    spawnPrey(WORLD, batch);
    const catchup = need>6 ? 0.35 : 0.55;
    const diagK = BAL.diag/BASE.diag;
    spawnTimer = (catchup / Math.max(0.85, Math.min(1.3, diagK)));
  }

  // seal physics — ARRIVE: плавное замедление + демпфер, без кручения на месте
  seal.px = seal.x; seal.py = seal.y;

  if (POINTER.active) {
    const dx = POINTER.x - seal.x;
    const dy = POINTER.y - seal.y;
    const dist = Math.hypot(dx, dy) || 1;

    // Радиусы прибытия:
    //  - stopR: «магнитная зона» у цели — тут полностью гасим скорость
    //  - slowR: зона замедления — скорость уменьшается пропорционально расстоянию
    const stopR = Math.max(16, seal.r * (0.55 + Math.min(0.1, (1.0 - Math.min(1, BAL.diag / BASE.diag)) * 0.25)));
    const slowR = Math.max(stopR + 60, Math.min(BAL.diag * 0.13, 180));

    // Желаемая скорость по направлению к цели с плавным падением в slowR
    let desiredSpeed;
    if (dist <= stopR) {
      desiredSpeed = 0;
    } else if (dist < slowR) {
      desiredSpeed = seal.maxSpeed * ((dist - stopR) / (slowR - stopR));
    } else {
      desiredSpeed = seal.maxSpeed;
    }

    const nx = dx / dist, ny = dy / dist;           // нормаль к цели
    const dvx = nx * desiredSpeed - seal.vx;        // steering velocity
    const dvy = ny * desiredSpeed - seal.vy;

    // Ограничиваем изменение скорости за кадр максимальным ускорением
    const maxDeltaV = seal.accel * dt;
    const dLen = Math.hypot(dvx, dvy);
    if (dLen > 1e-4) {
      const k = Math.min(1, maxDeltaV / dLen);
      seal.vx += dvx * k;
      seal.vy += dvy * k;
    }

    // В «магнитной зоне» дополнительно гасим скорость, чтобы не было «вертушки»
    if (dist <= stopR) {
      // Быстрое экспоненциальное затухание
      const damp = Math.pow(0.35, dt * 60); // ~сильный тормоз при удержании в точке
      seal.vx *= damp;
      seal.vy *= damp;

      // если почти стоим — прижимаемся полностью (убирает микродрожь)
      if (Math.hypot(seal.vx, seal.vy) < 8) {
        seal.vx = 0; seal.vy = 0;
      }
    }
  } else {
    // Свободное затухание, когда палец/мышь отпущены
    seal.vx *= 0.985; seal.vy *= 0.985;
  }

  // Интеграция позиции + границы
  seal.x += seal.vx * dt;
  seal.y += seal.vy * dt;
  seal.x = Math.max(seal.r, Math.min(WORLD.w - seal.r, seal.x));
  seal.y = Math.max(seal.r, Math.min(WORLD.h - seal.r, seal.y));


  // prey update + sweep collision
  updatePrey(dt, seal, WORLD, ()=>{
    SCORE.now++; UI.score.textContent=SCORE.now; pop();
  });
}

function drawFrame(dt){
  const reduced = PREFERS_REDUCED.matches;
  const t = performance.now()/1000;
  drawBackground(CTX, WORLD, t, reduced);
  drawPrey(CTX);
  seal.draw(CTX);

  if(!STATE.running){
    CTX.save(); CTX.fillStyle='rgba(0,0,0,0.2)'; CTX.fillRect(0,0,WORLD.w,WORLD.h); CTX.restore();
  }
}

async function shareScore(){
  const url=new URL(location.href); url.searchParams.delete('s'); url.searchParams.delete('b');
  const link = url.toString() + (url.search?'&':'?') + 's='+(SCORE.now||0)+'&b='+(SCORE.best||0);
  const isNew = SCORE.now===SCORE.best; const tag=isNew?' — новый рекорд!':'';
  const shareData={ title:'Тюль-Охота', text:`Мой счёт: ${SCORE.now} 🐟 рекорд: ${SCORE.best} 🏆 за 60 секунд${tag}`, url:link };
  try{
    if(navigator.share){ await navigator.share(shareData); }
    else if(navigator.clipboard){ await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`); toast('Ссылка скопирована!'); }
    else{ prompt('Скопируйте и поделитесь:', `${shareData.text}\n${shareData.url}`); }
  }catch{}
}

let toastId;
function toast(msg){
  clearTimeout(toastId);
  let el=document.getElementById('toast');
  if(!el){ el=document.createElement('div'); el.id='toast';
    Object.assign(el.style,{position:'fixed',left:'50%',bottom:'12vh',transform:'translateX(-50%)',
      background:'rgba(2,22,34,.9)',color:'#e6f7ff',padding:'10px 14px',borderRadius:'12px',zIndex:20,fontWeight:600});
    document.body.appendChild(el);
  }
  el.textContent=msg; el.style.opacity='1'; toastId=setTimeout(()=>el.style.opacity='0',1600);
}

window.addEventListener('load', ()=> CANVAS.focus());
