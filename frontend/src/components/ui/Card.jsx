import React from 'react';
import styles from './Card.module.css';

export default function Card({ children, className = '', elevated = false, bronze = false, onClick, id }) {
  return (
    <div
      id={id}
      className={[
        styles.card,
        elevated ? styles.elevated : '',
        bronze ? styles.bronze : '',
        onClick ? styles.clickable : '',
        className,
      ].filter(Boolean).join(' ')}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardLabel({ children }) {
  return <div className={styles.cardLabel}>{children}</div>;
}

export function CardValue({ children, className = '' }) {
  return <div className={`${styles.cardValue} ${className}`}>{children}</div>;
}

export function CardSub({ children }) {
  return <div className={styles.cardSub}>{children}</div>;
}
