import React from 'react';
import styles from './styles.module.css';

export default function TryIt({ children, where }) {
  return (
    <aside className={styles.tryIt}>
      <span className={styles.label}>Try it</span>
      <div className={styles.body}>
        {children || 'Find the answer in Grafana before revealing it below.'}
      </div>
      {where && (
        <div className={styles.where}>
          <span className={styles.whereLabel}>Where to look</span>
          {where}
        </div>
      )}
    </aside>
  );
}
