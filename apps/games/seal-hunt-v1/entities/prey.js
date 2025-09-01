// entities/prey.js
import { BAL } from '../core/balance.js';
import { SWEEP_T } from '../game.js';

// tiny helper
const lerp = (a,b,t)=>a+(b-a)*t;

// species catalog (shape/color/size/behavior)
// Отобраны по реальному рациону тюленей: сельдевые, анчоусы, корюшка, песчанка/сэндил,
// молодь тресковых; плюс головоногие (кальмар) и криль.
const SPECIES = [
  // базовая «золотая» рыбка — остаётся ради читаемости и разнообразия
  {
    name:'goldie', size:1.0, colors:{body:'#ffd166', tail:'#f9c74f', eye:'#09202d'},
    draw(ctx,r){
      ctx.fillStyle=this.colors.body;
      ctx.beginPath(); ctx.ellipse(0,0,r*0.9,r*0.6,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=this.colors.tail;
      ctx.beginPath(); ctx.moveTo(-r*0.9,0); ctx.lineTo(-r*1.4,-r*0.6); ctx.lineTo(-r*1.4,r*0.6); ctx.closePath(); ctx.fill();
      ctx.fillStyle=this.colors.eye; ctx.beginPath(); ctx.arc(r*0.5,-r*0.1,r*0.1,0,Math.PI*2); ctx.fill();
    },
    wiggle: (f,dt,i)=>{ f.vx += Math.sin(f.t*4.8+i)*4*dt; f.vy += Math.cos(f.t*4.2+i)*4*dt; }
  },

  // сельдь
  {
    name:'herring', size:0.9, colors:{body:'#a8d0f0', tail:'#8bbadf', eye:'#082334'},
    draw(ctx,r){
      ctx.fillStyle=this.colors.body;
      ctx.beginPath(); ctx.ellipse(0,0,r*1.05,r*0.48,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=this.colors.tail;
      ctx.beginPath(); ctx.moveTo(-r*1.0,0); ctx.lineTo(-r*1.45,-r*0.45); ctx.lineTo(-r*1.45,r*0.45); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='rgba(8,35,52,.25)'; ctx.lineWidth=1;
      for(let s=-0.30;s<=0.30;s+=0.15){ ctx.beginPath(); ctx.ellipse(r*0.12, r*s, r*0.58, r*0.23, 0, 0, Math.PI*2); ctx.stroke(); }
      ctx.fillStyle=this.colors.eye; ctx.beginPath(); ctx.arc(r*0.55,-r*0.06,r*0.08,0,Math.PI*2); ctx.fill();
    },
    wiggle: (f,dt,i)=>{ f.vy += Math.sin(f.t*3.6+i)*5*dt; }
  },

  // шпрот
  {
    name:'sprat', size:0.7, colors:{body:'#cfe7ff', tail:'#9fc1e0', eye:'#09233a'},
    draw(ctx,r){
      ctx.fillStyle=this.colors.body;
      ctx.beginPath(); ctx.ellipse(0,0,r*1.0,r*0.42,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(20,40,60,.25)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(-r*0.6,0); ctx.lineTo(r*0.85,0); ctx.stroke(); // латеральная линия
      ctx.fillStyle=this.colors.tail;
      ctx.beginPath(); ctx.moveTo(-r*1.0,0); ctx.lineTo(-r*1.35,-r*0.35); ctx.lineTo(-r*1.35,r*0.35); ctx.closePath(); ctx.fill();
      ctx.fillStyle=this.colors.eye; ctx.beginPath(); ctx.arc(r*0.55,-r*0.03,r*0.07,0,Math.PI*2); ctx.fill();
    },
    wiggle:(f,dt,i)=>{ f.vx += Math.sin(f.t*5.0+i)*3*dt; }
  },

  // анчоус
  {
    name:'anchovy', size:0.75, colors:{body:'#c0e0ff', tail:'#8fb6da', eye:'#0b2336'},
    draw(ctx,r){
      ctx.fillStyle=this.colors.body;
      ctx.beginPath(); ctx.ellipse(0,0,r*1.15,r*0.38,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(10,30,50,.25)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(-r*0.7,-r*0.06); ctx.lineTo(r*0.9,-r*0.06); ctx.stroke();
      ctx.fillStyle=this.colors.tail;
      ctx.beginPath(); ctx.moveTo(-r*1.15,0); ctx.lineTo(-r*1.45,-r*0.35); ctx.lineTo(-r*1.45,r*0.35); ctx.closePath(); ctx.fill();
      ctx.fillStyle=this.colors.eye; ctx.beginPath(); ctx.arc(r*0.6,-r*0.05,r*0.07,0,Math.PI*2); ctx.fill();
    },
    wiggle:(f,dt,i)=>{ f.vy += Math.cos(f.t*4.2+i)*4*dt; }
  },

  // сардина
  {
    name:'sardine', size:0.85, colors:{body:'#b9e2dd', tail:'#92c4bc', eye:'#0b2a2a'},
    draw(ctx,r){
      ctx.fillStyle=this.colors.body; ctx.beginPath(); ctx.ellipse(0,0,r*1.1,r*0.50,0,0,Math.PI*2); ctx.fill();
      // ряд точек вдоль спины
      ctx.fillStyle='rgba(9,32,45,.55)';
      for(let i=-2;i<=2;i++){ ctx.beginPath(); ctx.arc(-r*0.2+i*r*0.2, -r*0.18, r*0.035, 0, Math.PI*2); ctx.fill(); }
      ctx.fillStyle=this.colors.tail;
      ctx.beginPath(); ctx.moveTo(-r*1.1,0); ctx.lineTo(-r*1.5,-r*0.45); ctx.lineTo(-r*1.5,r*0.45); ctx.closePath(); ctx.fill();
      ctx.fillStyle=this.colors.eye; ctx.beginPath(); ctx.arc(r*0.55,-r*0.07,r*0.08,0,Math.PI*2); ctx.fill();
    },
    wiggle:(f,dt,i)=>{ f.vx += Math.sin(f.t*3.8+i)*3.5*dt; }
  },

  // корюшка
  {
    name:'smelt', size:0.8, colors:{body:'#a9e3c2', tail:'#84caa6', eye:'#082a22'},
    draw(ctx,r){
      ctx.fillStyle=this.colors.body;
      ctx.beginPath(); ctx.ellipse(0,0,r*1.05,r*0.42,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(8,42,34,.25)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.ellipse(r*0.2, 0, r*0.5, r*0.2, 0, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle=this.colors.eye; ctx.beginPath(); ctx.arc(r*0.55,-r*0.04,r*0.07,0,Math.PI*2); ctx.fill();
    },
    wiggle:(f,dt,i)=>{ f.vx += Math.sin(f.t*4.6+i)*3*dt; }
  },

  // песчанка / sand lance (sandeel)
  {
    name:'sandlance', size:0.85, colors:{body:'#b6e1f2', tail:'#8ec1df', eye:'#082a3a'},
    draw(ctx,r){
      ctx.fillStyle=this.colors.body;
      ctx.beginPath();
      ctx.moveTo(-r*1.2,0);
      ctx.quadraticCurveTo(r*0.2,-r*0.5, r*1.2,0);
      ctx.quadraticCurveTo(r*0.2, r*0.5, -r*1.2,0);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle=this.colors.eye; ctx.beginPath(); ctx.arc(r*0.7,-r*0.06,r*0.07,0,Math.PI*2); ctx.fill();
    },
    wiggle:(f,dt,i)=>{ f.vy += Math.sin(f.t*5.0+i)*3.5*dt; }
  },

  // молодь трески / gadid juvenile
  {
    name:'codling', size:1.0, colors:{body:'#c9d6b8', tail:'#a9c092', eye:'#0a2216'},
    draw(ctx,r){
      ctx.fillStyle=this.colors.body; ctx.beginPath(); ctx.ellipse(0,0,r*1.0,r*0.55,0,0,Math.PI*2); ctx.fill();
      // крап — «тресковый» узор
      ctx.fillStyle='rgba(20,30,10,.25)';
      for(let i=-2;i<=2;i++){ ctx.beginPath(); ctx.arc(i*r*0.18, -r*0.05+((i%2)?r*0.08:-r*0.04), r*0.05, 0, Math.PI*2); ctx.fill(); }
      ctx.fillStyle=this.colors.tail;
      ctx.beginPath(); ctx.moveTo(-r*1.0,0); ctx.lineTo(-r*1.45,-r*0.5); ctx.lineTo(-r*1.45,r*0.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle=this.colors.eye; ctx.beginPath(); ctx.arc(r*0.5,-r*0.08,r*0.09,0,Math.PI*2); ctx.fill();
    },
    wiggle:(f,dt,i)=>{ f.vx += Math.sin(f.t*3.4+i)*3*dt; f.vy += Math.cos(f.t*3.0+i)*2*dt; }
  },

  // мойва (уже была)
  {
    name:'capelin', size:0.7, colors:{body:'#9fd9b5', tail:'#7dc09d', eye:'#0a2c23'},
    draw(ctx,r){
      ctx.fillStyle=this.colors.body;
      ctx.beginPath(); ctx.moveTo(-r*1.1,0); ctx.quadraticCurveTo(r*0.5,-r*0.5,r*1.0,0);
      ctx.quadraticCurveTo(r*0.5,r*0.5,-r*1.1,0); ctx.closePath(); ctx.fill();
      ctx.fillStyle=this.colors.eye; ctx.beginPath(); ctx.arc(r*0.6,-r*0.05,r*0.07,0,Math.PI*2); ctx.fill();
    },
    wiggle:(f,dt,i)=>{ f.vx += Math.sin(f.t*5.2+i)*3*dt; }
  },

  // кальмар (cephalopod) — остаётся
  {
    name:'squid', size:1.2, colors:{body:'#f08fb0', tail:'#ec6f9a', eye:'#1b0b18'},
    draw(ctx,r){
      ctx.fillStyle=this.colors.body;
      ctx.beginPath(); ctx.ellipse(0,-r*0.1,r*0.65,r*0.9,0,0,Math.PI*2); ctx.fill();
      // щупальца
      ctx.strokeStyle=this.colors.tail; ctx.lineWidth=2;
      for(let k=-2;k<=2;k++){ ctx.beginPath(); ctx.moveTo(-r*0.2+k*r*0.1, r*0.6);
        ctx.quadraticCurveTo(k*r*0.2, r*0.9, k*r*0.25, r*1.2); ctx.stroke(); }
      ctx.fillStyle=this.colors.eye; ctx.beginPath(); ctx.arc(r*0.2,-r*0.2,r*0.08,0,Math.PI*2); ctx.fill();
    },
    wiggle:(f,dt)=>{ f.vy += Math.sin(f.t*2.2)*6*dt; } // мягкий пульс
  },

  // морская звезда — декоративная редкость (можно выключить позже)
  {
    name:'star', size:0.9, colors:{body:'#ffb55a', eye:'#0a1f2a'},
    draw(ctx,r){
      ctx.fillStyle=this.colors.body;
      ctx.beginPath();
      for(let i=0;i<5;i++){ const a = i*(Math.PI*2/5)-Math.PI/2;
        const x=Math.cos(a)*r*0.8, y=Math.sin(a)*r*0.8;
        const ax=Math.cos(a+0.6)*r*0.35, ay=Math.sin(a+0.6)*r*0.35;
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        ctx.lineTo(ax,ay);
      } ctx.closePath(); ctx.fill();
    },
    wiggle:(f,dt)=>{ f.vx*=0.995; f.vy*=0.995; } // дрейфует
  },

  // КРИЛЬ — отрисовываем как «облачко» из 9–12 малых точек, но это один объект (бережём FPS)
  {
    name:'krill', size:0.35, colors:{body:'rgba(255,153,102,0.95)', tint:'rgba(255,153,102,0.45)'},
    draw(ctx,r){
      // «рой» мини-особей вокруг центра
      for(let i=0;i<10;i++){
        const ang = i*(Math.PI*2/10);
        const dist = r* (0.7 + (i%3)*0.2);
        const x = Math.cos(ang)*dist, y = Math.sin(ang)*dist*0.7;
        ctx.fillStyle = (i%2)? this.colors.body : this.colors.tint;
        ctx.beginPath(); ctx.ellipse(x, y, r*0.35, r*0.18, ang+0.4, 0, Math.PI*2); ctx.fill();
      }
    },
    wiggle:(f,dt,i)=>{ f.vx += Math.sin(f.t*2.0+i)*2*dt; f.vy += Math.cos(f.t*2.3+i)*2*dt; }
  },
];
for (const sp of SPECIES) sp.hasMouth = !['star','squid','krill'].includes(sp.name);
Object.freeze(SPECIES);

export const PREY = []; // active list

export function spawnPrey(world, n=1){
  for(let i=0;i<n;i++){
    const sp = SPECIES[(Math.random()*SPECIES.length)|0];
    const edge = (Math.random()*4)|0;
    const speed = BAL.fishSpeedMin + Math.random()*(BAL.fishSpeedMax - BAL.fishSpeedMin);
    const baseR = (12 + Math.random()*10) * sp.size * BAL.fishSizeK;

    let x,y,vx,vy,dir;
    if(edge===0){ x=-20; y=Math.random()*world.h; vx=speed; vy=(Math.random()-0.5)*speed*0.35; dir=1; }
    else if(edge===1){ x=world.w+20; y=Math.random()*world.h; vx=-speed; vy=(Math.random()-0.5)*speed*0.35; dir=-1; }
    else if(edge===2){ x=Math.random()*world.w; y=-20; vx=(Math.random()-0.5)*speed*0.35; vy=speed; dir=Math.sign(vx)||1; }
    else { x=Math.random()*world.w; y=world.h+20; vx=(Math.random()-0.5)*speed*0.35; vy=-speed; dir=Math.sign(vx)||-1; }

    PREY.push({ x,y, px:x,py:y, vx,vy, r:baseR, t:0, dir, sp });
  }
}

export function updatePrey(dt, seal, world, eatCb){
  for(let i=PREY.length-1;i>=0;i--){
    const f = PREY[i];
    f.px=f.x; f.py=f.y;
    f.t+=dt; f.x+=f.vx*dt; f.y+=f.vy*dt;
    f.sp.wiggle(f,dt,i);
    f.dir = Math.sign(f.vx) || f.dir;

    // offscreen cull
    if(f.x<-60 || f.x>world.w+60 || f.y<-60 || f.y>world.h+60){ PREY.splice(i,1); continue; }

    // sweep collision (t=0,0.5,1)
    const eatR = f.r + seal.r*0.90, eatR2 = eatR*eatR;
    let hit = false;
    for (const tt of SWEEP_T) {
    const sx = lerp(seal.px, seal.x, tt), sy = lerp(seal.py, seal.y, tt);
    const fx = lerp(f.px, f.x, tt),       fy = lerp(f.py, f.y, tt);
    const dx = fx - sx, dy = fy - sy;
    if (dx*dx + dy*dy < eatR2) { hit = true; break; }
    }
    if(hit){ PREY.splice(i,1); eatCb(); }
  }
}

export function drawPrey(ctx){
  for(const f of PREY){
    const dir = (f.dir|| (f.vx>=0?1:-1))>=0?1:-1;
    ctx.save(); ctx.translate(f.x,f.y); ctx.scale(dir,1);
    f.sp.draw(ctx, f.r);
    // рот рисуем только у «рыбных» форм (не у кальмара/звезды/кроля)
    if(f.sp.hasMouth){
      ctx.strokeStyle='rgba(9,32,45,.8)'; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.moveTo(f.r*0.65, f.r*0.05);
      ctx.quadraticCurveTo(f.r*0.72, f.r*0.06, f.r*0.78, f.r*0.04); ctx.stroke();
    }
    ctx.restore();
  }
}