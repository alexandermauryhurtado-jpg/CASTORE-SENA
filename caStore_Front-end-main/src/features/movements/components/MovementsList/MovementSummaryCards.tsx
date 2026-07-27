'use client';

import React from 'react';
import { Activity, ArrowDownCircle, ArrowUpCircle, DollarSign } from 'lucide-react';
import styles from './MovementSummaryCards.module.css';
import { useMovementsToday } from '../../hooks/useMovements';

export function MovementSummaryCards() {
  const { summary, isLoading } = useMovementsToday();

  const formatCOP = (val: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  if (isLoading) {
    return (
      <div className={styles.grid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.card}>
            <div className={styles.iconWrapperOrange} aria-hidden />
            <div className={styles.content}>
              <span className={styles.label}>—</span>
              <span className={styles.value}>—</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <div className={styles.iconWrapperOrange}>
          <Activity size={24} />
        </div>
        <div className={styles.content}>
          <span className={styles.label}>Movimientos hoy</span>
          <span className={styles.value}>{summary.totalMovements}</span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.iconWrapperGreen}>
          <ArrowDownCircle size={24} />
        </div>
        <div className={styles.content}>
          <span className={styles.label}>Entradas del día</span>
          <span className={styles.value}>{summary.totalEntries}</span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.iconWrapperRed}>
          <ArrowUpCircle size={24} />
        </div>
        <div className={styles.content}>
          <span className={styles.label}>Salidas del día</span>
          <span className={styles.value}>{summary.totalExits}</span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.iconWrapperBlue}>
          <DollarSign size={24} />
        </div>
        <div className={styles.content}>
          <span className={styles.label}>Valor movido hoy</span>
          <span className={styles.value}>{formatCOP(summary.totalValue)}</span>
        </div>
      </div>
    </div>
  );
}
