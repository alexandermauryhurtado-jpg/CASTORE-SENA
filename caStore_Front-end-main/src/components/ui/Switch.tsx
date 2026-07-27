import React from 'react';
import clsx from 'clsx';
import styles from './Switch.module.css';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked, onChange, disabled, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={clsx(styles.switch, { [styles.checked]: checked }, className)}
      onClick={() => onChange(!checked)}
    >
      <span className={clsx(styles.thumb, { [styles.thumbChecked]: checked })} />
    </button>
  );
}
