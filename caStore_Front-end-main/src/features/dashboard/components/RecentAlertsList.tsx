'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Calendar, Bell, CheckCircle } from 'lucide-react';
import { RecentAlert } from '../types/dashboard.types';
import styles from './RecentAlertsList.module.css';

interface RecentAlertsListProps {
  alerts: RecentAlert[];
  isLoading?: boolean;
}

const AlertIcon = ({ type }: { type: string }) => {
  if (type === 'LOW_STOCK') return <AlertTriangle className={styles.iconLow} size={18} />;
  return <Calendar className={styles.iconExpiry} size={18} />;
};

const getAlertBadgeLabel = (type: string) => {
  switch (type) {
    case 'LOW_STOCK': return 'Stock bajo';
    case 'EXPIRY_30D': return 'Vence en 30 días';
    case 'EXPIRY_15D': return 'Vence en 15 días';
    case 'EXPIRY_7D': return 'Vence en 7 días';
    default: return 'Alerta';
  }
};

const getAlertBadgeClass = (type: string) => {
  if (type === 'LOW_STOCK' || type === 'EXPIRY_7D') return styles.badgeRed;
  if (type === 'EXPIRY_30D') return styles.badgeYellow;
  return styles.badgeOrange;
};

export function RecentAlertsList({ alerts, isLoading }: RecentAlertsListProps) {
  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.skeletonHeader} />
        {[1, 2, 3].map(i => (
          <div key={i} className={styles.skeletonItem} />
        ))}
      </div>
    );
  }

  const activeCount = alerts.length;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>Alertas recientes</h3>
          {activeCount > 0 && <span className={styles.badgeCount}>{activeCount}</span>}
        </div>
        <Link href="/alerts" className={styles.link}>
          Ver todas →
        </Link>
      </div>

      <div className={styles.list}>
        {activeCount === 0 ? (
          <div className={styles.empty}>
            <CheckCircle className={styles.checkIcon} size={32} />
            <p>Todo el inventario está en orden</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <Link 
              key={alert.id} 
              href={`/products/${alert.productId}`} 
              className={styles.item}
            >
              <div className={styles.iconGroup}>
                <AlertIcon type={alert.type} />
                <div className={styles.productInfo}>
                  <span className={styles.productName}>{alert.productName}</span>
                  <span className={styles.productSku}>{alert.productSku}</span>
                </div>
              </div>
              <div className={styles.rightInfo}>
                <span className={getAlertBadgeClass(alert.type)}>
                  {getAlertBadgeLabel(alert.type)}
                </span>
                <span className={styles.stockInfo}>
                  {alert.currentValue} / {alert.threshold}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
