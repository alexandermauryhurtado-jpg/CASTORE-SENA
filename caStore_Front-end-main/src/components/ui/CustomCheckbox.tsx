'use client';

import React from 'react';
import { Check } from 'lucide-react';
import clsx from 'clsx';
import styles from './CustomCheckbox.module.css';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CustomCheckbox({ 
  checked, 
  onChange, 
  disabled, 
  label,
  size = 'md'
}: CustomCheckboxProps) {
  return (
    <label className={clsx(styles.container, { [styles.disabled]: disabled })}>
      <div className={styles.checkboxWrapper}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className={styles.hiddenInput}
        />
        <div className={clsx(styles.circle, styles[size], { [styles.checked]: checked })}>
          {checked && <Check className={styles.icon} />}
        </div>
      </div>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}
