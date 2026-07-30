import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeCtx = createContext(null);
const STORAGE_KEY = 'lx_theme';

function getInitialTheme() {
  const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (saved === 'light' || saved === 'dark') return saved;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const [followsSystem, setFollowsSystem] = useState(() => !localStorage.getItem(STORAGE_KEY));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Track system changes only while the person hasn't made an explicit choice
  useEffect(() => {
    if (!followsSystem || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = e => setTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [followsSystem]);

  const toggleTheme = useCallback(() => {
    setFollowsSystem(false);
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}
