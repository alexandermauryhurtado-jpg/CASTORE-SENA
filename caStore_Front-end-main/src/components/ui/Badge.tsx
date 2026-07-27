import React from 'react';
import clsx from 'clsx';
import styles from './Badge.module.css';

interface BadgeProps {
  variant?: 'active' | 'inactive' | 'warning' | 'default';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={clsx(styles.badge, styles[variant], className)}>
      {children}
    </span>
  );
}
