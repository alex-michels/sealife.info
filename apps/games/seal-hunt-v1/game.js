// game.js (ESM entrypoint)
import { BASE, BAL, recomputeBalance } from './core/balance.js';
import { attachPointer } from './core/input.js';
import { initScenery, drawBackground } from './render/scenery.js';
import { PREY, spawnPrey, updatePrey, drawPrey } from './entities/prey.js';
import { makeSeal } from './entities/seal.js';

// ——— DOM/Canvas
const CANVAS = document.getElementById('game');
const CTX = CANVAS.getContext('2d', { alpha:false });
const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

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

// ——— Audio (gentle pop)
const FX = { enabled: (localStorage.getItem('seal_hunt_sound') ?? '1') === '1' };
let audioCtx=null;
function pop(){
  if(!FX.enabled) return;
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const ctx=audioCtx,o=ctx.createOscillator(), g=ctx.createGain();
    o.type='sine'; o.frequency.value=660+Math.random()*60; g.gain.value=0.12;
    o.connect(g); g.connect(ctx.destination); o.start();
    o.frequency.exponentialRampToValueAtTime(120, ctx.currentTime+0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+0.12);
    o.stop(ctx.currentTime+0.13);
  }catch{}
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

window.addEventListener('resize', resize, {passive:true});
resize();

// ——— Input
attachPointer(CANVAS,
  p=>{ POINTER.x=p.x; POINTER.y=p.y; },
  p=>{ POINTER.active=true; POINTER.x=p.x; POINTER.y=p.y; },
  ()=>{ POINTER.active=false; }
);

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

  // seal physics
  seal.px=seal.x; seal.py=seal.y;
  if(POINTER.active){
    const dx=POINTER.x-seal.x, dy=POINTER.y-seal.y, dist=Math.hypot(dx,dy)||1;
    const ax=(dx/dist)*seal.accel, ay=(dy/dist)*seal.accel;
    seal.vx+=ax*dt; seal.vy+=ay*dt;
    const sp=Math.hypot(seal.vx,seal.vy);
    if(sp>seal.maxSpeed){ const k=seal.maxSpeed/sp; seal.vx*=k; seal.vy*=k; }
    if(dx!==0) seal.facing = dx>=0 ? 1 : -1;
  }else{ seal.vx*=0.98; seal.vy*=0.98; }
  seal.x+=seal.vx*dt; seal.y+=seal.vy*dt;
  seal.x=Math.max(seal.r, Math.min(WORLD.w-seal.r, seal.x));
  seal.y=Math.max(seal.r, Math.min(WORLD.h-seal.r, seal.y));

  // prey update + sweep collision
  updatePrey(dt, seal, WORLD, ()=>{
    SCORE.now++; UI.score.textContent=SCORE.now; pop();
  });
}

function drawFrame(dt){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; // respect user pref. :contentReference[oaicite:4]{index=4}
  const t=performance.now()/1000;
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
