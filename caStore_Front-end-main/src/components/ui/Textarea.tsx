import React, { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './Textarea.module.css';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className={clsx(styles.wrapper, className)}>
        {label && <label className={styles.label}>{label}</label>}
        <textarea
          ref={ref}
          className={clsx(styles.textarea, { [styles.hasError]: !!error })}
          {...props}
        />
        {(error || hint) && (
          <span className={clsx(styles.helperText, { [styles.errorText]: !!error })}>
            {error || hint}
          </span>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
