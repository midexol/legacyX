import React from 'react';

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const wrap = (children, size = 20) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>{children}</svg>
);

export const Icon = {
  home: (p) => wrap(<><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" /></>, p?.size),
  lock: (p) => wrap(<><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>, p?.size),
  users: (p) => wrap(<><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" /><path d="M16 8.2a3.2 3.2 0 1 1 3.6 3.17" /><path d="M15.5 14.3c2.6.5 4.5 2.7 4.5 5.7" /></>, p?.size),
  barChart: (p) => wrap(<><line x1="4" y1="20" x2="4" y2="12" /><line x1="10" y1="20" x2="10" y2="6" /><line x1="16" y1="20" x2="16" y2="14" /><line x1="21" y1="20" x2="21" y2="9" /></>, p?.size),
  bell: (p) => wrap(<><path d="M6 9a6 6 0 0 1 12 0c0 4.2 1.5 5.5 1.5 5.5H4.5S6 13.2 6 9Z" /><path d="M10 19a2 2 0 0 0 4 0" /></>, p?.size),
  settings: (p) => wrap(<><circle cx="12" cy="12" r="3" /><path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.06.07a2.06 2.06 0 1 1-2.9 2.9l-.07-.06a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.55V19.7a2.06 2.06 0 1 1-4.12 0v-.1a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.9.3l-.07.06a2.06 2.06 0 1 1-2.9-2.9l.06-.07a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.55-1H4.3a2.06 2.06 0 1 1 0-4.12h.1a1.7 1.7 0 0 0 1.55-1.1 1.7 1.7 0 0 0-.3-1.9l-.06-.07a2.06 2.06 0 1 1 2.9-2.9l.07.06a1.7 1.7 0 0 0 1.9.3H10.6a1.7 1.7 0 0 0 1-1.55V4.3a2.06 2.06 0 1 1 4.12 0v.1a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.9-.3l.07-.06a2.06 2.06 0 1 1 2.9 2.9l-.06.07a1.7 1.7 0 0 0-.3 1.9V10.6a1.7 1.7 0 0 0 1.55 1h.1a2.06 2.06 0 1 1 0 4.12h-.1a1.7 1.7 0 0 0-1.55 1Z" /></>, p?.size),
  clock: (p) => wrap(<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>, p?.size),
  calendar: (p) => wrap(<><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><line x1="3.5" y1="9.5" x2="20.5" y2="9.5" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" /></>, p?.size),
  check: (p) => wrap(<path d="M4 12.5 9.5 18 20 6" />, p?.size),
  zap: (p) => wrap(<path d="M12.5 3 5 13.5h6l-1 7.5L19 10.5h-6.5L12.5 3Z" />, p?.size),
  wallet: (p) => wrap(<><rect x="3" y="6.5" width="18" height="13" rx="2.2" /><path d="M3 10h18" /><circle cx="16.5" cy="14" r="1" fill="currentColor" stroke="none" /></>, p?.size),
  shield: (p) => wrap(<><path d="M12 3.5 5 6.3v5.4C5 16.4 8 19.8 12 21c4-1.2 7-4.6 7-9.3V6.3L12 3.5Z" /><path d="M9 12l2.2 2.2L15.5 9.5" /></>, p?.size),
  coins: (p) => wrap(<><ellipse cx="9" cy="7.5" rx="6" ry="3" /><path d="M3 7.5V12c0 1.66 2.69 3 6 3s6-1.34 6-3V7.5" /><path d="M3 12v4.5c0 1.66 2.69 3 6 3 .34 0 .68-.02 1-.05" /><ellipse cx="16" cy="14.5" rx="5" ry="2.5" opacity="0.9" /><path d="M11 14.5V19c0 1.1 2.24 2 5 2s5-.9 5-2v-4.5" /></>, p?.size),
  unlock: (p) => wrap(<><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 7.2-2.4" /></>, p?.size),
};

export default function Icn({ name, size = 20, style, className }) {
  const fn = Icon[name];
  if (!fn) return null;
  return <span className={className} style={{ display:'inline-flex', ...style }}>{fn({ size })}</span>;
}
