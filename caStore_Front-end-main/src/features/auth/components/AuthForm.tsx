import React from 'react';
import clsx from 'clsx';
import styles from './AuthForm.module.css';

interface AuthFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
}

export function AuthForm({ children, onSubmit, isLoading, className = '', ...props }: AuthFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={clsx(styles.formWrapper, className)}
      {...props}
    >
      <fieldset disabled={isLoading} className={styles.fieldset}>
        {children}
      </fieldset>
    </form>
  );
}
