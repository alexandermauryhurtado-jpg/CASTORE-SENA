'use client';

import React from 'react';
import clsx from 'clsx';
import { Bell, PackageMinus, CalendarClock } from 'lucide-react';
import styles from './AlertSummaryCards.module.css';
import type { AlertSummaryApi } from '../../types/alerts.types';

interface AlertSummaryCardsProps {
  summary: AlertSummaryApi | null;
  isLoading?: boolean;
}

export function AlertSummaryCards({ summary, isLoading }: AlertSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className={styles.grid}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.card}>
            <div className={clsx(styles.iconWrapper, styles.skeleton)} />
            <div className={styles.content}>
            <div className={styles.skeletonLine} style={{ width: '70%' }} />
            <div className={styles.skeletonLine} style={{ width: '40%', marginTop: 8 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const active = summary?.active ?? 0;
  const lowStock = summary?.activeLowStock ?? 0;
  const expiring = summary?.activeExpiry ?? 0;

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <div className={clsx(styles.iconWrapper, styles.danger)}>
          <Bell size={24} className={styles.icon} />
        </div>
        <div className={styles.content}>
          <h3 className={styles.label}>Total activas</h3>
          <p className={styles.value}>{active}</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={clsx(styles.iconWrapper, styles.warning)}>
          <PackageMinus size={24} className={styles.icon} />
        </div>
        <div className={styles.content}>
          <h3 className={styles.label}>Stock bajo</h3>
          <p className={styles.value}>{lowStock}</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={clsx(styles.iconWrapper, styles.orange)}>
          <CalendarClock size={24} className={styles.icon} />
        </div>
        <div className={styles.content}>
          <h3 className={styles.label}>Vencimiento próximo</h3>
          <p className={styles.value}>{expiring}</p>
        </div>
      </div>
    </div>
  );
}
