// Тюль-Охота — мобильная игра без зависимостей
// v1:

(() => {
  const CANVAS = document.getElementById('game');
  const CTX = CANVAS.getContext('2d', { alpha: false });
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
  const WORLD = { w: 0, h: 0 };
  const STATE = { running: false, over: false, paused: false };
  const SCORE = { now: 0, best: 0 };
  const POINTER = { x: 0, y: 0, active: false };
  const FISH = [];

  // --- Звук с переключателем
  const FX = {
    enabled: (localStorage.getItem('seal_hunt_sound') ?? '1') === '1'
  };

  let audioCtx = null;
  function pop() {
    if (!FX.enabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 660 + Math.random() * 60;
      g.gain.value = 0.12;
      o.connect(g); g.connect(ctx.destination);
      o.start();
      o.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.12);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      o.stop(ctx.currentTime + 0.13);
    } catch {}
  }

  // --- Вспомогательные
  const lerp = (a,b,t) => a + (b - a) * t;

  function makeSpots(seed = 1, count = 28) {
    let x = seed;
    function rnd() { x = (x * 1664525 + 1013904223) % 2**32; return (x/2**32); }
    const arr = [];
    for (let i=0;i<count;i++) {
      const rx = (rnd()*1.6 - 0.8);
      const ry = (rnd()*1.2 - 0.6);
      const r  = 0.05 + rnd()*0.08;
      arr.push({rx, ry, r, a: 0.45 + rnd()*0.25});
    }
    return arr;
  }

  const seal = {
    x: 0, y: 0, r: 30,
    px: 0, py: 0,      // прошлые координаты (для свип-коллизии)
    vx: 0, vy: 0,
    maxSpeed: 240,
    accel: 900,
    facing: 1,
    spots: makeSpots(7, 34),
    draw() {
      const r = this.r;
      CTX.save();
      CTX.translate(this.x, this.y);
      CTX.scale(this.facing, 1);

      // soft shadow
      CTX.globalAlpha = 0.25;
      CTX.fillStyle = '#001018';
      CTX.beginPath();
      CTX.ellipse(0, r*0.40, r*1.20, r*0.48, 0, 0, Math.PI*2);
      CTX.fill();
      CTX.globalAlpha = 1;

      // CHONKY BODY — simple oval
      CTX.fillStyle = '#bcd2da';
      CTX.beginPath();
      CTX.ellipse(0, 0, r*1.35, r*1.05, 0, 0, Math.PI*2);
      CTX.fill();

      // back flipper (small)
      CTX.fillStyle = '#9bb8c4';
      CTX.beginPath();
      CTX.ellipse(-r*1.05, r*0.45, r*0.55, r*0.28, 0.4, 0, Math.PI*2);
      CTX.fill();

      // front flipper (small)
      CTX.beginPath();
      CTX.ellipse(r*0.15, r*0.58, r*0.50, r*0.22, -0.35, 0, Math.PI*2);
      CTX.fill();

      // black eye (minimal)
      CTX.fillStyle = '#0b1b23';
      CTX.beginPath();
      CTX.arc(r*1.05, -r*0.22, r*0.12, 0, Math.PI*2);
      CTX.fill();

      CTX.restore();
    }
  };

  function spawnFish(n = 1) {
    for (let i = 0; i < n; i++) {
      const edge = Math.floor(Math.random() * 4);
      let x, y, vx, vy;
      const speed = 60 + Math.random() * 120;
      const r = 12 + Math.random() * 10;
      if (edge === 0) { x = -20; y = Math.random() * WORLD.h; vx = speed; vy = (Math.random()-0.5)*speed; }
      else if (edge === 1) { x = WORLD.w + 20; y = Math.random() * WORLD.h; vx = -speed; vy = (Math.random()-0.5)*speed; }
      else if (edge === 2) { x = Math.random() * WORLD.w; y = -20; vx = (Math.random()-0.5)*speed; vy = speed; }
      else { x = Math.random() * WORLD.w; y = WORLD.h + 20; vx = (Math.random()-0.5)*speed; vy = -speed; }
      FISH.push({ x, y, px: x, py: y, vx, vy, r, t: 0 });
    }
  }

  function drawFish(f) {
    const { x, y, r } = f;
    CTX.save();
    CTX.translate(x, y);
    CTX.fillStyle = '#ffd166';
    CTX.beginPath();
    CTX.ellipse(0, 0, r*0.9, r*0.6, 0, 0, Math.PI*2);
    CTX.fill();
    CTX.fillStyle = '#f9c74f';
    CTX.beginPath();
    CTX.moveTo(-r*0.9, 0);
    CTX.lineTo(-r*1.4, -r*0.6);
    CTX.lineTo(-r*1.4, r*0.6);
    CTX.closePath();
    CTX.fill();
    CTX.fillStyle = '#09202d';
    CTX.beginPath();
    CTX.arc(r*0.5, -r*0.1, r*0.1, 0, Math.PI*2);
    CTX.fill();
    CTX.restore();
  }

  function resize() {
    WORLD.w = CANVAS.clientWidth = window.innerWidth;
    WORLD.h = CANVAS.clientHeight = window.innerHeight;
    CANVAS.width = Math.floor(WORLD.w * DPR);
    CANVAS.height = Math.floor(WORLD.h * DPR);
    CTX.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  function drawBackground() {
    const g = CTX.createLinearGradient(0, 0, 0, WORLD.h);
    g.addColorStop(0, '#043049');
    g.addColorStop(1, '#021a28');
    CTX.fillStyle = g;
    CTX.fillRect(0, 0, WORLD.w, WORLD.h);
    CTX.globalAlpha = 0.12;
    for (let i=0;i<40;i++){
      const r = 1 + Math.random() * 3;
      CTX.beginPath();
      CTX.arc(Math.random()*WORLD.w, Math.random()*WORLD.h, r, 0, Math.PI*2);
      CTX.fillStyle = '#cbefff';
      CTX.fill();
    }
    CTX.globalAlpha = 1;
  }

  function setPointer(x, y) { POINTER.x = x; POINTER.y = y; }
  function onPointerDown(e) {
    POINTER.active = true;
    const p = getPoint(e);
    setPointer(p.x, p.y);
    e.preventDefault();
  }
  function onPointerMove(e) {
    if (!POINTER.active && e.type.startsWith('mouse')) return;
    const p = getPoint(e);
    setPointer(p.x, p.y);
  }
  function onPointerUp() { POINTER.active = false; }

  function getPoint(e) {
    const rect = CANVAS.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    } else {
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  }

  CANVAS.addEventListener('mousedown', onPointerDown);
  CANVAS.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);
  CANVAS.addEventListener('touchstart', onPointerDown, { passive: false });
  CANVAS.addEventListener('touchmove', onPointerMove, { passive: false });
  window.addEventListener('touchend', onPointerUp);

  UI.btnStart.addEventListener('click', startGame);
  UI.btnAgain.addEventListener('click', startGame);
  UI.btnPause.addEventListener('click', () => {
    if (!STATE.running) return;
    STATE.paused = !STATE.paused;
    UI.btnPause.textContent = STATE.paused ? 'Продолжить' : 'Пауза';
    UI.btnPause.setAttribute('aria-pressed', String(STATE.paused));
    if (!STATE.paused) lastTime = performance.now();
    loop();
  });
  UI.btnShareEnd.addEventListener('click', shareScore);

  // --- Переключатель звука
  function refreshSoundButton() {
    if (!UI.btnSound) return;
    UI.btnSound.textContent = FX.enabled ? '🔊' : '🔈';
    UI.btnSound.setAttribute('aria-pressed', String(!FX.enabled));
    UI.btnSound.title = FX.enabled ? 'Звук: вкл' : 'Звук: выкл';
  }
  if (UI.btnSound) {
    refreshSoundButton();
    UI.btnSound.addEventListener('click', () => {
      FX.enabled = !FX.enabled;
      localStorage.setItem('seal_hunt_sound', FX.enabled ? '1' : '0');
      refreshSoundButton();
    });
  }

  // --- Счёт/приветствие
  SCORE.best = Number(localStorage.getItem('seal_hunt_best')||0);
  UI.best.textContent = SCORE.best;

  const params = new URLSearchParams(location.search);
  if (params.has('s')) {
    const friendScore = Number(params.get('s'));
    const friendBest  = Number(params.get('b')||friendScore);
    UI.overlay.hidden = false;
    UI.message.innerHTML = `Ваш друг(подруга) набрал(а) <b>${friendScore}</b> очков (рекорд: <b>${friendBest}</b>). Сможете больше?`;
    UI.btnShareEnd.hidden = true;
    UI.btnAgain.textContent = 'Играть';
  } else {
    // Приветственный экран вместо «чёрного»
    UI.overlay.hidden = false;
    UI.message.innerHTML = 'Лови как можно больше 🐟 за <b>60 секунд</b>.<br>Управление: удерживайте палец/мышь — тюлень плывёт за касанием.';
    UI.btnShareEnd.hidden = true;
    UI.btnAgain.textContent = 'Играть';
  }

  // Нарисуем фон сразу, чтобы не было пустого экрана
  drawFrame(0);

  // --- Игровой цикл
  let lastTime = 0;
  let timeLeft = GAME_DURATION;
  let spawnTimer = 0;

  function startGame() {
    STATE.running = true; STATE.over = false; STATE.paused = false;
    UI.overlay.hidden = true;
    UI.btnShareEnd.hidden = true;
    UI.btnPause.textContent = 'Пауза';
    SCORE.now = 0; UI.score.textContent = '0';
    timeLeft = GAME_DURATION;
    spawnTimer = 0;
    FISH.length = 0;
    seal.x = WORLD.w * 0.3; seal.y = WORLD.h * 0.5;
    seal.px = seal.x; seal.py = seal.y;
    seal.vx = seal.vy = 0;
    POINTER.active = false;
    lastTime = performance.now();
    loop();
  }

  function endGame() {
    STATE.running = false; STATE.over = true;
    UI.overlay.hidden = false;
    if (SCORE.now > SCORE.best) {
      SCORE.best = SCORE.now;
      localStorage.setItem('seal_hunt_best', String(SCORE.best));
      UI.best.textContent = SCORE.best;
      UI.message.innerHTML = `Время вышло! Ваш счёт: <b>${SCORE.now}</b> 🐟 — <b>Новый рекорд!</b> 🏆`;
    } else {
      UI.message.innerHTML = `Время вышло! Ваш счёт: <b>${SCORE.now}</b> 🐟 рекорд: <b>${SCORE.best}</b> 🏆`;
    }
    UI.btnShareEnd.hidden = false;
    UI.btnAgain.textContent = 'Играть ещё';
  }

  function loop() {
    if (!STATE.running) { drawFrame(0); return; }
    const now = performance.now();
    let dt = (now - lastTime) / 1000;
    lastTime = now;
    if (STATE.paused) { drawFrame(0); return; }
    dt = Math.min(dt, 0.033);

    update(dt);
    drawFrame(dt);
    if (STATE.running) requestAnimationFrame(loop);
  }

  function update(dt) {
    timeLeft -= dt * 1000;
    if (timeLeft <= 0) { UI.time.textContent = '0'; endGame(); return; }
    UI.time.textContent = Math.ceil(timeLeft / 1000);

    spawnTimer -= dt;
    const targetRate = 1.0 + Math.min(1.5, (1 - timeLeft/GAME_DURATION) * 1.5);
    if (spawnTimer <= 0) {
      spawnFish( Math.ceil(targetRate) );
      spawnTimer = 0.9 / targetRate;
    }

    // --- Сохраняем предыдущую позицию тюленя для свип-коллизии
    seal.px = seal.x; seal.py = seal.y;

    if (POINTER.active) {
      const dx = POINTER.x - seal.x;
      const dy = POINTER.y - seal.y;
      const dist = Math.hypot(dx, dy) || 1;
      const ax = (dx / dist) * seal.accel;
      const ay = (dy / dist) * seal.accel;
      seal.vx += ax * dt;
      seal.vy += ay * dt;
      const sp = Math.hypot(seal.vx, seal.vy);
      if (sp > seal.maxSpeed) {
        const k = seal.maxSpeed / sp;
        seal.vx *= k; seal.vy *= k;
      }
      if (dx !== 0) seal.facing = dx >= 0 ? 1 : -1;
    } else {
      seal.vx *= 0.98; seal.vy *= 0.98;
    }
    seal.x += seal.vx * dt;
    seal.y += seal.vy * dt;
    seal.x = Math.max(seal.r, Math.min(WORLD.w - seal.r, seal.x));
    seal.y = Math.max(seal.r, Math.min(WORLD.h - seal.r, seal.y));

    // --- Рыба + коллизии
    for (let i = FISH.length - 1; i >= 0; i--) {
      const f = FISH[i];

      // сохраним прошлую позицию рыбы
      f.px = f.x; f.py = f.y;

      f.t += dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.vx += Math.sin(f.t * 6 + i) * 5 * dt;
      f.vy += Math.cos(f.t * 5 + i) * 5 * dt;

      if (f.x < -60 || f.x > WORLD.w + 60 || f.y < -60 || f.y > WORLD.h + 60) {
        FISH.splice(i, 1);
        continue;
      }

      // --- Свип-коллизия: проверяем расстояние в t=0, 0.5, 1
      const eatR = f.r + seal.r * 0.90; // чуть "шире рта"
      const eatR2 = eatR * eatR;

      let hit = false;
      for (const t of [0, 0.5, 1]) {
        const sx = lerp(seal.px, seal.x, t);
        const sy = lerp(seal.py, seal.y, t);
        const fx = lerp(f.px, f.x, t);
        const fy = lerp(f.py, f.y, t);
        const dx = fx - sx, dy = fy - sy;
        if (dx*dx + dy*dy < eatR2) { hit = true; break; }
      }

      if (hit) {
        FISH.splice(i, 1);
        SCORE.now++; UI.score.textContent = SCORE.now;
        pop();
      }
    }
  }

  function drawFrame(dt) {
    drawBackground();
    CTX.save();
    CTX.strokeStyle = 'rgba(57, 124, 113, 0.5)';
    CTX.lineWidth = 3;
    for (let x=0; x<WORLD.w; x+=40) {
      CTX.beginPath();
      CTX.moveTo(x, WORLD.h);
      const h = 30 + 20 * Math.sin((performance.now()/1000) + x*0.02);
      CTX.quadraticCurveTo(x+10, WORLD.h - h*0.6, x+0, WORLD.h - h);
      CTX.stroke();
    }
    CTX.restore();

    for (const f of FISH) drawFish(f);
    seal.draw();

    if (!STATE.running) {
      CTX.save();
      CTX.fillStyle = 'rgba(0,0,0,0.2)';
      CTX.fillRect(0,0,WORLD.w,WORLD.h);
      CTX.restore();
    }
  }

  async function shareScore() {
    const url = new URL(location.href);
    url.searchParams.delete('s');
    url.searchParams.delete('b');
    const link = url.toString() + (url.search ? '&' : '?') + 's=' + (SCORE.now || 0) + '&b=' + (SCORE.best || 0);
    const isNewRecord = SCORE.now === SCORE.best;
    const tag = isNewRecord ? ' — новый рекорд!' : '';
    const shareData = {
      title: 'Тюль-Охота',
      text: `Мой счёт: ${SCORE.now} 🐟 рекорд: ${SCORE.best} 🏆 за 60 секунд${tag}`,
      url: link
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        toast('Ссылка скопирована!');
      } else {
        prompt('Скопируйте и поделитесь:', `${shareData.text}\n${shareData.url}`);
      }
    } catch {}
  }

  let toastId;
  function toast(msg) {
    clearTimeout(toastId);
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      Object.assign(el.style, {
        position:'fixed', left:'50%', bottom:'12vh', transform:'translateX(-50%)',
        background:'rgba(2,22,34,.9)', color:'#e6f7ff', padding:'10px 14px',
        borderRadius:'12px', zIndex: 20, fontWeight:600
      });
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    toastId = setTimeout(()=> el.style.opacity = '0', 1600);
  }

  window.addEventListener('load', () => {
    CANVAS.focus();
  });
})();
