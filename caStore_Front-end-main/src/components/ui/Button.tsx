import React from 'react';
import clsx from 'clsx';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export function Button({ variant = 'primary', isLoading, className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(styles.button, styles[variant], className, { [styles.loading]: isLoading })}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <span className={styles.spinner} /> : children}
    </button>
  );
}
