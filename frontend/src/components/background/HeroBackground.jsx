import React, { useEffect, useRef, useState } from 'react';

const MEDIA = [
  { type: 'image', src: '/hero/vault-door.jpg',        pos: 'center',      filter: 'saturate(0.75) sepia(0.35) hue-rotate(-8deg) brightness(0.62) contrast(1.05)' },
  { type: 'image', src: '/hero/gold-texture.jpg',       pos: 'center',      filter: 'saturate(0.9)  sepia(0.15) hue-rotate(-4deg) brightness(0.55) contrast(1.1)'  },
  { type: 'image', src: '/hero/box-handoff.jpg',        pos: 'center',      filter: 'saturate(0.55) sepia(0.55) hue-rotate(-10deg) brightness(0.6) contrast(1.05)' },
  { type: 'image', src: '/hero/key-handoff.jpg',        pos: 'center',      filter: 'saturate(0.5)  sepia(0.6)  hue-rotate(-8deg) brightness(0.65) contrast(1.05)' },
  { type: 'image', src: '/hero/gold-engraving.jpg',     pos: 'center',      filter: 'saturate(0.9)  sepia(0.2)  hue-rotate(-4deg) brightness(0.6) contrast(1.1)'   },
  { type: 'image', src: '/hero/blockchain-blue.jpg',    pos: 'center',      filter: 'saturate(0.35) sepia(0.65) hue-rotate(-24deg) brightness(0.62) contrast(1.05)'},
  { type: 'image', src: '/hero/handshake.jpg',          pos: 'center',      filter: 'saturate(0.5)  sepia(0.5)  hue-rotate(-8deg) brightness(0.6) contrast(1.05)'  },
  { type: 'image', src: '/hero/gold-wave.jpg',          pos: 'center',      filter: 'saturate(0.85) sepia(0.15) hue-rotate(-4deg) brightness(0.6) contrast(1.1)'   },
  { type: 'image', src: '/hero/blue-network.jpg',       pos: 'center',      filter: 'saturate(0.3)  sepia(0.7)  hue-rotate(-26deg) brightness(0.6) contrast(1.05)' },
  { type: 'image', src: '/hero/vault-cinematic.jpg',    pos: 'center',      filter: 'saturate(0.8)  sepia(0.3)  hue-rotate(-8deg) brightness(0.6) contrast(1.08)'  },
  { type: 'image', src: '/hero/hands-family.jpg',       pos: 'center',      filter: 'saturate(0.55) sepia(0.5)  hue-rotate(-8deg) brightness(0.62) contrast(1.05)' },
  { type: 'image', src: '/hero/vault-illustrated.jpg',  pos: 'center',      filter: 'saturate(0.4)  sepia(0.6)  hue-rotate(-20deg) brightness(0.65) contrast(1.05)'},
  { type: 'image', src: '/hero/gift-box.jpg',           pos: 'center 62%',  filter: 'saturate(0.5)  sepia(0.55) hue-rotate(-8deg) brightness(0.62) contrast(1.05)' },
  { type: 'video', src: '/hero/gold-dust.mp4',          pos: 'center',      filter: 'saturate(0.85) sepia(0.25) hue-rotate(-6deg) brightness(0.7)'                 },
];

const ROTATE_MS = 4500;
const COLLAPSE_DISTANCE = 420; // px of scroll over which the band fully collapses

export default function HeroBackground() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0); // 0 = expanded, 1 = collapsed
  const wrapRef = useRef(null);

  // Crossfade cycle
  useEffect(() => {
    const id = setInterval(() => setActive(i => (i + 1) % MEDIA.length), ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  // Scroll-driven collapse
  useEffect(() => {
    const onScroll = () => {
      const p = Math.min(window.scrollY / COLLAPSE_DISTANCE, 1);
      setProgress(p);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={wrapRef}
      className="hero-media"
      style={{
        height: `${56 - progress * 46}vh`,
        filter: `blur(${progress * 6}px)`,
      }}
      aria-hidden="true"
    >
      {MEDIA.map((m, i) => (
        m.type === 'image' ? (
          <div
            key={m.src}
            className={`hero-media-frame${i === active ? ' active' : ''}`}
            style={{ backgroundImage: `url('${m.src}')`, backgroundPosition: m.pos, filter: m.filter }}
          />
        ) : (
          <video
            key={m.src}
            className={`hero-media-frame hero-media-video${i === active ? ' active' : ''}`}
            style={{ filter: m.filter }}
            muted loop playsInline
            autoPlay={i === active}
          >
            <source src={m.src} type="video/mp4" />
          </video>
        )
      ))}
      <div className="hero-media-fade" />
    </div>
  );
}
