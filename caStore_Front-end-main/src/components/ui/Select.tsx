import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import styles from './Select.module.css';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, className, children, ...props }, ref) => {
    return (
      <div className={clsx(styles.wrapper, className)}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={styles.selectContainer}>
          <select
            ref={ref}
            className={clsx(styles.select, { [styles.hasError]: !!error })}
            {...props}
          >
            {children}
          </select>
          <span className={styles.iconWrapper}>
            <ChevronDown size={16} />
          </span>
        </div>
        {(error || hint) && (
          <span className={clsx(styles.helperText, { [styles.errorText]: !!error })}>
            {error || hint}
          </span>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';
