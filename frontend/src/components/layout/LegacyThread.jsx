import React, { useRef, useEffect } from 'react';
import styles from './LegacyThread.module.css';

export default function LegacyThread({ animated = true, height = '100vh' }) {
  const pathRef = useRef(null);

  useEffect(() => {
    if (!animated || !pathRef.current) return;
    const path = pathRef.current;
    const len  = path.getTotalLength?.() ?? 2000;
    path.style.strokeDasharray  = len;
    path.style.strokeDashoffset = len;
    // Trigger animation
    requestAnimationFrame(() => {
      path.style.transition = 'stroke-dashoffset 2.4s cubic-bezier(0.16,1,0.3,1) 0.3s';
      path.style.strokeDashoffset = '0';
    });
  }, [animated]);

  return (
    <div className={styles.thread} style={{ height }} aria-hidden="true">
      <svg className={styles.svg} viewBox="0 0 2 100" preserveAspectRatio="none">
        <line
          ref={pathRef}
          x1="1" y1="0" x2="1" y2="100"
          stroke="#B68D40"
          strokeWidth="0.6"
          className={animated ? styles.animated : styles.static}
        />
      </svg>
    </div>
  );
}
