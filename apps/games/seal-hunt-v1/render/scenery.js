// render/scenery.js
// Calm underwater scenery with higher-contrast vertical gradient.
// No light rays; respects prefers-reduced-motion.

let bubbles = [], kelp = [], rocks = [];
let cachedGrad = null;

function makeSeaGradient(ctx, world){
  const g = ctx.createLinearGradient(0, 0, 0, world.h);
  // brighter/cooler near surface → darker/deeper toward bottom
  g.addColorStop(0.00, '#0e6f9f');  // surface glow
  g.addColorStop(0.25,'#0a537b');
  g.addColorStop(0.60,'#073b56');
  g.addColorStop(1.00,'#021a28');  // deep blue
  return g;
}

export function initScenery(world, ctx){
  // background gradient cache
  cachedGrad = makeSeaGradient(ctx, world);

  // bubbles
  bubbles = Array.from({length: 28}, ()=>({
    x: Math.random()*world.w, y: Math.random()*world.h,
    r: 1 + Math.random()*3, s: 8 + Math.random()*12
  }));

  // kelp patches (slow sway)
  const kelpCols = Math.max(3, Math.round(world.w/320));
  kelp = Array.from({length: kelpCols}, (_,i)=>({
    x: (i+0.5)*world.w/(kelpCols+1),
    h: world.h*(0.25+Math.random()*0.25),
    c: `rgba(52,126,109,${0.25+Math.random()*0.25})`
  }));

  // rocks
  const rockCount = Math.max(2, Math.round(world.w/500));
  rocks = Array.from({length: rockCount}, ()=>({
    x: Math.random()*world.w, w: 60+Math.random()*120, h: 20+Math.random()*30
  }));
}

export function drawBackground(ctx, world, t, reducedMotion=false){
  // sea (main vertical gradient)
  ctx.fillStyle = cachedGrad || '#032538';
  ctx.fillRect(0,0,world.w,world.h);

  // subtle surface glow (still just a gradient overlay)
  const topH = Math.min(160, world.h*0.22);
  const gTop = ctx.createLinearGradient(0,0,0,topH);
  gTop.addColorStop(0,'rgba(255,255,255,0.08)');
  gTop.addColorStop(1,'rgba(255,255,255,0.00)');
  ctx.fillStyle = gTop;
  ctx.fillRect(0,0,world.w,topH);

  // darker foot near bottom (depth feeling, not overloaded)
  const botY = world.h*0.68;
  const gBot = ctx.createLinearGradient(0,botY,0,world.h);
  gBot.addColorStop(0,'rgba(0,0,0,0.00)');
  gBot.addColorStop(1,'rgba(0,0,0,0.25)');
  ctx.fillStyle = gBot;
  ctx.fillRect(0,botY,world.w,world.h-botY);

  // bubbles (slow rise)
  ctx.globalAlpha=0.15;
  for(const b of bubbles){
    ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
    ctx.fillStyle='#cbefff'; ctx.fill();
    b.y -= (reducedMotion?0.2:0.6) + b.s*0.005;
    if(b.y<-10){ b.y=world.h+10; b.x=Math.random()*world.w; }
  }
  ctx.globalAlpha=1;

  // kelp near bottom
  ctx.strokeStyle='rgba(57,124,113,0.45)'; ctx.lineWidth=6;
  for(const k of kelp){
    ctx.beginPath();
    ctx.moveTo(k.x, world.h);
    const sway = reducedMotion ? 0 : Math.sin(t + k.x*0.02)*18;
    ctx.quadraticCurveTo(k.x+sway*0.3, world.h-k.h*0.6, k.x+sway, world.h-k.h);
    ctx.stroke();
  }

  // seabed
  ctx.fillStyle='rgba(30,60,70,0.6)';
  for(const r of rocks){
    ctx.beginPath();
    ctx.ellipse(r.x, world.h-8, r.w, r.h, 0, 0, Math.PI*2);
    ctx.fill();
  }
}