'use client';

import React from 'react';
import styles from './SkeletonTable.module.css';

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <div className={styles.tableWrapper}>
      <div className={styles.header}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className={styles.headerCell} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={styles.row}>
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className={styles.cell}>
              <div className={styles.line} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
