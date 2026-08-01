import React from 'react';

/**
 * Shaded, dimensional vault glyph — metallic gradients (not flat linework),
 * with a slowly rotating wheel for a sense of motion.
 */
export default function VaultGlyph({ style, className }) {
  return (
    <svg
      viewBox="0 0 240 240"
      style={style}
      className={className}
      role="img"
      aria-label="Illustration of a vault door with a rotating locking wheel"
    >
      <defs>
        <radialGradient id="vg-wheelBody" cx="35%" cy="30%" r="75%">
          <stop offset="0%"  stopColor="#FFE9A8" />
          <stop offset="45%" stopColor="#D4A017" />
          <stop offset="80%" stopColor="#8A6008" />
          <stop offset="100%" stopColor="#4A3204" />
        </radialGradient>
        <linearGradient id="vg-frameMetal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor="#F3D27A" />
          <stop offset="50%" stopColor="#B8860B" />
          <stop offset="100%" stopColor="#5C3F06" />
        </linearGradient>
        <radialGradient id="vg-hub" cx="35%" cy="30%" r="70%">
          <stop offset="0%"  stopColor="#FFF3CE" />
          <stop offset="60%" stopColor="#C9950F" />
          <stop offset="100%" stopColor="#5C3F06" />
        </radialGradient>
        <radialGradient id="vg-rivet" cx="35%" cy="30%" r="70%">
          <stop offset="0%"  stopColor="#FFE9A8" />
          <stop offset="100%" stopColor="#6B4A08" />
        </radialGradient>
        <radialGradient id="vg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#FFD166" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#D4A017" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient glow, ties the glyph into the page background */}
      <circle cx="120" cy="120" r="118" fill="url(#vg-glow)" />

      {/* Door frame */}
      <rect x="20" y="20" width="200" height="200" rx="24" fill="none" stroke="url(#vg-frameMetal)" strokeWidth="6" />
      <rect x="20" y="20" width="200" height="200" rx="24" fill="none" stroke="#3A2703" strokeWidth="1" opacity="0.4" />

      {/* Corner rivets */}
      <circle cx="35" cy="35" r="6" fill="url(#vg-rivet)" />
      <circle cx="205" cy="35" r="6" fill="url(#vg-rivet)" />
      <circle cx="35" cy="205" r="6" fill="url(#vg-rivet)" />
      <circle cx="205" cy="205" r="6" fill="url(#vg-rivet)" />

      {/* Rotating locking wheel */}
      <g className="vault-wheel-spin">
        <circle cx="120" cy="120" r="72" fill="none" stroke="url(#vg-wheelBody)" strokeWidth="10" />
        <circle cx="120" cy="120" r="72" fill="none" stroke="#3A2703" strokeWidth="1" opacity="0.35" />
        <g stroke="url(#vg-wheelBody)" strokeWidth="9" strokeLinecap="round">
          <line x1="120" y1="60" x2="120" y2="80" />
          <line x1="120" y1="160" x2="120" y2="180" />
          <line x1="60" y1="120" x2="80" y2="120" />
          <line x1="160" y1="120" x2="180" y2="120" />
          <line x1="77" y1="77" x2="91" y2="91" />
          <line x1="149" y1="149" x2="163" y2="163" />
          <line x1="77" y1="163" x2="91" y2="149" />
          <line x1="149" y1="91" x2="163" y2="77" />
        </g>
      </g>

      {/* Center hub, stays still while the wheel turns */}
      <circle cx="120" cy="120" r="30" fill="url(#vg-hub)" />
      <circle cx="120" cy="120" r="30" fill="none" stroke="#3A2703" strokeWidth="1" opacity="0.5" />
      <ellipse cx="112" cy="110" rx="10" ry="6" fill="#FFF7E0" opacity="0.55" />
    </svg>
  );
}
