// core/input.js
export function attachPointer(canvas, onMove, onDown, onUp) {
  const rectOf = () => canvas.getBoundingClientRect();
  const getPoint = (e) => {
    const r = rectOf();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // enable unified pointer events
  canvas.style.touchAction = 'none';

  let isDown = false;

  const down = (e) => { isDown = true; onDown(getPoint(e)); };
  const move = (e) => { if (!isDown && e.pointerType === 'mouse' && e.buttons === 0) return;
                         onMove(getPoint(e)); };
  const up   = () => { if (!isDown) return; isDown = false; onUp(); };

  canvas.addEventListener('pointerdown', down, { passive: true });
  canvas.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerup',    up,   { passive: true });

  // capture lost pointer (e.g., alt-tab)
  window.addEventListener('pointercancel', up, { passive: true });
}
