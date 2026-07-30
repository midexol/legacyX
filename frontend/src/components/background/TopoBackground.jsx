import React, { useRef, useEffect } from 'react';
import styles from './TopoBackground.module.css';

// Generates SVG path for a gentle sine-wave contour line
function makePath(W, H, yBase, freq, amp, phase) {
  const pts = [];
  const steps = 80;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * W;
    const y = yBase + Math.sin((i / steps) * Math.PI * 2 * freq + phase) * amp
                    + Math.sin((i / steps) * Math.PI * 3.7 * freq + phase * 1.3) * amp * 0.4;
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

export default function TopoBackground() {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);

    // Clear
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // Generate 10-14 contour lines
    const lineCount = 13;
    const driftClasses = [styles.drift1, styles.drift2, styles.drift3];

    for (let i = 0; i < lineCount; i++) {
      const yBase = (H / (lineCount + 1)) * (i + 1);
      const freq  = 0.8 + (i % 4) * 0.25;
      const amp   = 18 + (i % 3) * 14;
      const phase = (i * 0.7);

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', makePath(W, H, yBase, freq, amp, phase));
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#F4F2EE');
      path.setAttribute('stroke-width', '1');

      // Assign drift animation class
      path.setAttribute('class', driftClasses[i % 3]);

      // Stagger animation delay
      path.style.animationDelay = `${-(i * 2.8)}s`;

      svg.appendChild(path);
    }

    const handleResize = () => {
      const nW = window.innerWidth;
      const nH = window.innerHeight;
      svg.setAttribute('viewBox', `0 0 ${nW} ${nH}`);
      svg.setAttribute('width', nW);
      svg.setAttribute('height', nH);
      // Rebuild paths
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      for (let i = 0; i < lineCount; i++) {
        const yBase = (nH / (lineCount + 1)) * (i + 1);
        const freq  = 0.8 + (i % 4) * 0.25;
        const amp   = 18 + (i % 3) * 14;
        const phase = (i * 0.7);
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', makePath(nW, nH, yBase, freq, amp, phase));
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#F4F2EE');
        path.setAttribute('stroke-width', '1');
        path.setAttribute('class', driftClasses[i % 3]);
        path.style.animationDelay = `${-(i * 2.8)}s`;
        svg.appendChild(path);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.wrapper}>
      <svg ref={svgRef} className={styles.svg} aria-hidden="true" />
    </div>
  );
}
