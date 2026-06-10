import React from 'react';
import styles from './styles.module.css';

export default function TryIt({ children }) {
  return (
    <aside className={styles.tryIt}>
      <span className={styles.label}>Try it</span>
      <div className={styles.body}>
        {children || 'Find the answer in Grafana before revealing it below.'}
      </div>
    </aside>
  );
}
