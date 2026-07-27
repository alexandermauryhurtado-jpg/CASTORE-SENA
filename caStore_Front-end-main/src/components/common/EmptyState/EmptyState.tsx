'use client';

import React from 'react';
import { Inbox } from 'lucide-react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ 
  title, 
  message, 
  icon = <Inbox size={48} />, 
  action 
}: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        {icon}
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {action && (
        <button className={styles.actionBtn} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
