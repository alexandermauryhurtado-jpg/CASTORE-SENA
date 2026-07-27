import React from 'react';
import clsx from 'clsx';
import styles from './PageWrapper.module.css';

interface PageWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, title, subtitle, actions, className }: PageWrapperProps) {
  return (
    <div className={clsx(styles.wrapper, className)}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </header>
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}
