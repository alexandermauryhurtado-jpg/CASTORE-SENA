'use client';

import React from 'react';
import styles from './DashboardSkeleton.module.css';

export function DashboardSkeleton() {
  return (
    <div className={styles.grid}>
      {/* KPIs */}
      <div className={styles.kpiRow}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={styles.cardSkeleton} />
        ))}
      </div>

      {/* Charts */}
      <div className={styles.chartRow}>
        <div className={styles.largeChartSkeleton} />
        <div className={styles.smallChartSkeleton} />
      </div>

      {/* Widgets */}
      <div className={styles.widgetRow}>
        <div className={styles.widgetSkeleton} />
        <div className={styles.widgetSkeleton} />
      </div>
    </div>
  );
}
