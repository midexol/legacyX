import React, { useRef, useEffect } from 'react';

export default function CursorGlow() {
  const ref = useRef(null);

  useEffect(() => {
    let mx = 0, my = 0, cx = 0, cy = 0, id;
    const onMove = e => { mx = e.clientX; my = e.clientY; };
    const tick = () => {
      cx += (mx - cx) * 0.08;
      cy += (my - cy) * 0.08;
      if (ref.current) {
        ref.current.style.left = cx + 'px';
        ref.current.style.top  = cy + 'px';
      }
      id = requestAnimationFrame(tick);
    };
    document.addEventListener('mousemove', onMove);
    id = requestAnimationFrame(tick);
    return () => { document.removeEventListener('mousemove', onMove); cancelAnimationFrame(id); };
  }, []);

  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
}
