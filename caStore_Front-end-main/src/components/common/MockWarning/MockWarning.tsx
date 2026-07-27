'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import styles from './MockWarning.module.css';

export function MockWarning() {
  return (
    <div className={styles.warning}>
      <AlertTriangle size={16} />
      <span>
        <strong>Modo Offline / Mocks activos:</strong> No se pudo conectar con el servidor. Estás viendo datos de demostración.
      </span>
    </div>
  );
}
