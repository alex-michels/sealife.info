// entities/seal.js
export function makeSeal(makeSpots) {
  return {
    x:0, y:0, r:30,
    px:0, py:0,
    vx:0, vy:0,
    maxSpeed:200,
    accel:600,
    facing:1,
    _spots:null,
    spots: makeSpots(7,34),

    draw(ctx){
      const r=this.r;
      const t = performance.now()/1000;
      const swim = Math.min(1, Math.hypot(this.vx,this.vy)/(this.maxSpeed*0.5));
      const tailAng = Math.sin(t*6.5)*0.22*swim;
      const flapAng = (-0.15) + Math.sin(t*2.8)*0.20*swim;

      ctx.save();
      ctx.translate(this.x,this.y);
      ctx.scale(this.facing,1);

      // shadow
      ctx.globalAlpha=0.25;
      ctx.fillStyle='#001018';
      ctx.beginPath(); ctx.ellipse(0,r*0.40,r*1.22,r*0.50,0,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=1;

      // body
      ctx.fillStyle='#bcd2da';
      ctx.beginPath(); ctx.ellipse(0,0,r*1.45,r*1.10,0,0,Math.PI*2); ctx.fill();

      // back flippers
      ctx.save();
      ctx.rotate(tailAng);
      ctx.fillStyle='#9bb8c4';
      ctx.beginPath();
      ctx.moveTo(-r*1.30,-r*0.3);
      ctx.quadraticCurveTo(-r*1.95,-r*0.60,-r*1.70,-r*0.05);
      ctx.quadraticCurveTo(-r*1.85, r*0.60,-r*1.30, r*0.2);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle='#0b1b23';
      for(let i=0;i<4;i++){ const yy=-r*0.22+i*(r*0.15);
        ctx.beginPath(); ctx.ellipse(-r*1.65,yy,r*0.07,r*0.04,0,0,Math.PI*2); ctx.fill(); }
      ctx.restore();

      // front flipper (анимация)
      ctx.save(); ctx.translate(r*0.00,r*0.15); ctx.rotate(flapAng);
      ctx.fillStyle='#9bb8c4'; ctx.beginPath(); ctx.ellipse(r*0.00, r*0.15, r*0.60, r*0.30, -0.15, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#0b1b23';
      const tipX = r*-0.5;       // near the flipper tip
      const tipY = r*0.05;
      const stepY = r*0.09;      // spacing between “digits”
      for (let i = 0; i < 4; i++) {
        const yy = tipY + i*stepY;
        ctx.beginPath();
        // rotate slightly to match flipper tilt (-0.15 rad)
        ctx.ellipse(tipX, yy, r*0.075, r*0.045, -0.15, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();

      // eye
      ctx.fillStyle='#0b1b23'; ctx.beginPath(); ctx.arc(r*1.18,-r*0.10,r*0.16,0,Math.PI*2); ctx.fill();

      // nose + vibrissae
      ctx.beginPath(); ctx.arc(r*1.22, r*0.02, r*0.05, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(22,37,46,0.85)'; ctx.lineWidth=1; ctx.lineCap='round';
      for(let i=0;i<3;i++){ const yy=r*(0.2+i*0.085);
        ctx.beginPath(); ctx.moveTo(r*1.18,yy); ctx.quadraticCurveTo(r*1.2, yy-r*0.06, r*1.65, yy-r*0.01); ctx.stroke(); }

      ctx.restore();
    }
  };
}
