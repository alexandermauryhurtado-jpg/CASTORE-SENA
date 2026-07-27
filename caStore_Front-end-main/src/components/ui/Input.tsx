import React, { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './Input.module.css';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
  prefixNode?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon: Icon, prefixNode, className, ...props }, ref) => {
    return (
      <div className={clsx(styles.wrapper, className)}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={styles.inputContainer}>
          {Icon && (
            <span className={styles.iconWrapper}>
              <Icon size={16} />
            </span>
          )}
          {prefixNode && <span className={styles.prefixWrapper}>{prefixNode}</span>}
          <input
            ref={ref}
            className={clsx(styles.input, { [styles.hasIcon]: !!Icon, [styles.hasPrefix]: !!prefixNode, [styles.hasError]: !!error })}
            {...props}
          />
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
Input.displayName = 'Input';
