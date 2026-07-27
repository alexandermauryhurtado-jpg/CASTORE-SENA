'use client';

import React from 'react';
import styles from './SkeletonGrid.module.css';

interface SkeletonGridProps {
  count?: number;
}

export function SkeletonGrid({ count = 4 }: SkeletonGridProps) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.circle} />
          <div className={styles.lineLong} />
          <div className={styles.lineShort} />
        </div>
      ))}
    </div>
  );
}
