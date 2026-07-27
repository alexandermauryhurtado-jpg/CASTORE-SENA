'use client';

import React from 'react';
import { clsx } from 'clsx';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import styles from './KPICard.module.css';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  onClick?: () => void;
  isLoading?: boolean;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  iconBg,
  trend,
  onClick,
  isLoading
}: KPICardProps) {
  if (isLoading) {
    return (
      <div className={styles.skeleton}>
        <div className={styles.skeletonIcon} />
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonValue} />
        <div className={styles.skeletonFooter} />
      </div>
    );
  }

  return (
    <div 
      className={clsx(styles.card, onClick && styles.clickable)} 
      onClick={onClick}
    >
      <div className={styles.header}>
        <div className={styles.info}>
          <p className={styles.title}>{title}</p>
          <h3 className={styles.value}>{value}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        <div 
          className={styles.iconContainer} 
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          {icon}
        </div>
      </div>

      {trend && (
        <div className={clsx(styles.trend, styles[trend.direction])}>
          {trend.direction === 'up' && <ArrowUpRight size={14} />}
          {trend.direction === 'down' && <ArrowDownRight size={14} />}
          {trend.direction === 'neutral' && <Minus size={14} />}
          <span className={styles.trendValue}>{trend.value}%</span>
          <span className={styles.trendLabel}>{trend.label}</span>
        </div>
      )}
    </div>
  );
}
