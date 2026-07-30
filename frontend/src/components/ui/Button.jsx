import React, { useRef } from 'react';
import styles from './Button.module.css';

export default function Button({
  children,
  variant = 'primary', // primary | ghost | bronze | danger
  size = 'md',         // sm | md | lg
  onClick,
  disabled,
  type = 'button',
  className = '',
  id,
  as: Tag = 'button',
  href,
  ...rest
}) {
  const cls = [
    styles.btn,
    styles[variant],
    styles[size],
    disabled ? styles.disabled : '',
    className,
  ].filter(Boolean).join(' ');

  if (Tag === 'a' || href) {
    return (
      <a href={href} className={cls} id={id} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={cls}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      id={id}
      {...rest}
    >
      <span className={styles.mercury} aria-hidden="true" />
      <span className={styles.label}>{children}</span>
    </button>
  );
}
