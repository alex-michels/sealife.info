export function attachPointer(canvas, onMove, onDown, onUp) {
  const getPoint = (e) => {
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const down = (e) => { const p = getPoint(e); onDown(p); e.preventDefault(); };
  const move = (e) => { if (e.type.startsWith('mouse') && !buttons) return; const p = getPoint(e); onMove(p); };
  const up   = ()  => onUp();

  let buttons = 0;
  canvas.addEventListener('mousedown', (e)=>{ buttons=1; down(e); });
  canvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup',   ()=>{ buttons=0; up(); });

  canvas.addEventListener('touchstart', down, { passive:false });
  canvas.addEventListener('touchmove',  move, { passive:false });
  window.addEventListener('touchend',   up);
}
