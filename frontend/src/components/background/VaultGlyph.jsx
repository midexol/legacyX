import React from 'react';

/**
 * Abstract, line-based vault motif. Deliberately not a literal photo —
 * transparent background, soft strokes and low-opacity fills so it
 * dissolves into the page glow instead of sitting on top of it like a cutout.
 */
export default function VaultGlyph({ style }) {
  return (
    <svg
      viewBox="0 0 600 600"
      style={style}
      role="img"
      aria-label="Abstract illustration of a vault door"
    >
      <defs>
        <radialGradient id="vg-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#FFD166" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#D4A017" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#D4A017" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="vg-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor="#FFD166" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#B87333" stopOpacity="0.55" />
        </linearGradient>
        <filter id="vg-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Soft core glow, ties the glyph into the ambient background glow */}
      <circle cx="300" cy="300" r="230" fill="url(#vg-core)" />

      {/* Outer door frame — rounded, barely-there */}
      <rect x="70" y="70" width="460" height="460" rx="48"
        fill="none" stroke="url(#vg-stroke)" strokeWidth="1.4" opacity="0.35" />

      {/* Concentric dial rings */}
      {[190, 150, 110, 70].map((r, i) => (
        <circle key={r} cx="300" cy="300" r={r}
          fill="none" stroke="url(#vg-stroke)" strokeWidth={i === 0 ? 2 : 1}
          opacity={0.55 - i * 0.09} />
      ))}

      {/* Radiating spokes */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI * 2) / 8;
        const x1 = 300 + Math.cos(a) * 72;
        const y1 = 300 + Math.sin(a) * 72;
        const x2 = 300 + Math.cos(a) * 186;
        const y2 = 300 + Math.sin(a) * 186;
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="url(#vg-stroke)" strokeWidth="1" opacity="0.3" />
        );
      })}

      {/* Center hub */}
      <circle cx="300" cy="300" r="34" fill="none" stroke="url(#vg-stroke)" strokeWidth="1.6" opacity="0.7" />
      <circle cx="300" cy="300" r="34" fill="#FFD166" opacity="0.12" filter="url(#vg-soft)" />

      {/* Two locking bolts, echo the reference photo without literalism */}
      <rect x="120" y="284" width="90" height="10" rx="5" fill="url(#vg-stroke)" opacity="0.35" />
      <rect x="390" y="284" width="90" height="10" rx="5" fill="url(#vg-stroke)" opacity="0.35" />

      {/* Corner rivets, echoing the reference image's studded frame */}
      {[[100,100],[500,100],[100,500],[500,500]].map(([cx,cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill="url(#vg-stroke)" opacity="0.4" />
      ))}
    </svg>
  );
}
