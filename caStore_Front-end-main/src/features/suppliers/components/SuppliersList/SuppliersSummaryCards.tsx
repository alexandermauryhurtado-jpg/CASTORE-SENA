import React from 'react';
import { Building2, Map, Globe, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import styles from './SuppliersSummaryCards.module.css';
import type { SupplierWithStatsApi } from '../../types/suppliers.types';

interface SuppliersSummaryCardsProps {
  suppliers: SupplierWithStatsApi[];
  totalCount?: number;
}

export function SuppliersSummaryCards({ suppliers, totalCount }: SuppliersSummaryCardsProps) {
  const total = totalCount ?? suppliers.length;
  const national = suppliers.filter((s) => s.type === 'NATIONAL').length;
  const international = suppliers.filter((s) => s.type === 'INTERNATIONAL').length;
  const monthlyPurchases = suppliers.reduce(
    (acc, s) => acc + (s.totalUnits ?? 0) * 1000,
    0
  );

  const formatCOP = (val: number) => 
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <div className={clsx(styles.iconWrapper, styles.orange)}>
          <Building2 size={24} />
        </div>
        <div className={styles.info}>
          <span className={styles.label}>Total Proveedores</span>
          <span className={styles.value}>{total}</span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={clsx(styles.iconWrapper, styles.blue)}>
          <Map size={24} />
        </div>
        <div className={styles.info}>
          <span className={styles.label}>Nacionales</span>
          <span className={styles.value}>{national}</span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={clsx(styles.iconWrapper, styles.green)}>
          <Globe size={24} />
        </div>
        <div className={styles.info}>
          <span className={styles.label}>Internacionales</span>
          <span className={styles.value}>{international}</span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={clsx(styles.iconWrapper, styles.blueLight)}>
          <TrendingUp size={24} />
        </div>
        <div className={styles.info}>
          <span className={styles.label}>Compras del Mes</span>
          <span className={styles.value}>{formatCOP(monthlyPurchases)}</span>
        </div>
      </div>
    </div>
  );
}
