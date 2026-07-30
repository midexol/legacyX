import React, { useRef, useEffect } from 'react';

export default function ParticleCanvas() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, particles, nodes, mouse, animId;
    const PARTICLE_COUNT = 70;
    const NODE_COUNT = 14;
    const MAX_DIST = 160;
    const SPEED = 0.4;
    const PARTICLE_RGB = '212,160,23';  // gold
    const NODE_RGB     = '255,209,102'; // bright gold
    mouse = { x: -9999, y: -9999 };

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function initParticles() {
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r: Math.random() * 1.8 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.02,
      }));
    }

    function initNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * SPEED * 0.4,
        vy: (Math.random() - 0.5) * SPEED * 0.4,
        r: Math.random() * 3 + 3,
        alpha: 0,
        targetAlpha: Math.random() * 0.7 + 0.3,
        phase: Math.random() * Math.PI * 2,
        connections: [],
      }));
      // connections
      const maxNodeDist = 280;
      nodes.forEach((n, i) => {
        nodes.forEach((m, j) => {
          if (i >= j) return;
          const dx = n.x - m.x, dy = n.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxNodeDist) {
            n.connections.push({ node: m, dist, progress: 0, speed: 0.003 + Math.random() * 0.005 });
          }
        });
      });
    }

    function drawParticles() {
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.pulse += p.pulseSpeed;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) { p.x += dx * 0.02; p.y += dy * 0.02; }
        const pulseAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));
        particles.forEach(q => {
          const ddx = p.x - q.x, ddy = p.y - q.y;
          const d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < MAX_DIST && d > 0) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${PARTICLE_RGB},${(1 - d / MAX_DIST) * 0.16})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        });
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${PARTICLE_RGB},${pulseAlpha})`;
        ctx.fill();
      });
    }

    function drawNodes() {
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.phase += 0.008;
        if (n.x < 30 || n.x > W - 30) n.vx *= -1;
        if (n.y < 30 || n.y > H - 30) n.vy *= -1;
        if (n.alpha < n.targetAlpha) n.alpha = Math.min(n.targetAlpha, n.alpha + 0.005);
        n.connections.forEach(c => {
          c.progress = Math.min(1, c.progress + c.speed);
          const endX = n.x + (c.node.x - n.x) * c.progress;
          const endY = n.y + (c.node.y - n.y) * c.progress;
          const lineAlpha = 0.3 * n.alpha * (0.5 + 0.5 * Math.sin(n.phase + c.dist * 0.01));
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${PARTICLE_RGB},${lineAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(n.x, n.y); ctx.lineTo(endX, endY); ctx.stroke();
          if (c.progress > 0.1) {
            const t = (Date.now() / 2000 + c.dist * 0.001) % 1;
            const px = n.x + (c.node.x - n.x) * t;
            const py = n.y + (c.node.y - n.y) * t;
            ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${NODE_RGB},${0.85 * n.alpha})`; ctx.fill();
          }
        });
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${PARTICLE_RGB},${0.18 * n.alpha})`;
        ctx.lineWidth = 1; ctx.stroke();
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 2);
        g.addColorStop(0, `rgba(${NODE_RGB},${n.alpha})`); g.addColorStop(1, 'rgba(255,209,102,0)');
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      });
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);
      drawParticles();
      drawNodes();
      animId = requestAnimationFrame(animate);
    }

    function init() { resize(); initParticles(); initNodes(); animate(); }
    init();

    const onResize = () => { resize(); initParticles(); initNodes(); };
    const onMove   = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMove);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0 }}
      aria-hidden="true"
    />
  );
}
