import React from 'react';
import styles from './styles.module.css';

export default function Badge({ children, variant = 'neutral' }) {
  const variantClass = styles[variant] || styles.neutral;
  return <span className={`${styles.badge} ${variantClass}`}>{children}</span>;
}
