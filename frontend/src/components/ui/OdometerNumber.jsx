import React, { useEffect, useRef, useState } from 'react';
import styles from './OdometerNumber.module.css';

// Splits a number into digit characters and animates each rolling up
export default function OdometerNumber({ value = 0, duration = 1600, prefix = '', suffix = '', decimals = 0 }) {
  const [displayed, setDisplayed] = useState(0);
  const [animating, setAnimating] = useState(false);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const end   = value;
    const startTime = performance.now();
    setAnimating(true);

    const tick = (now) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + (end - start) * eased;
      setDisplayed(current);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        prevRef.current = end;
        setAnimating(false);
      }
    };
    requestAnimationFrame(tick);
  }, [value, duration]);

  const formatted = decimals > 0
    ? displayed.toFixed(decimals)
    : Math.round(displayed).toLocaleString();

  // Split into individual chars for digit-roll effect
  const chars = (prefix + formatted + suffix).split('');

  return (
    <span className={styles.odometer} aria-label={`${prefix}${value}${suffix}`}>
      {chars.map((ch, i) => (
        <span
          key={i}
          className={`${styles.digit} ${
            /[0-9]/.test(ch) && animating ? styles.rolling : ''
          }`}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
