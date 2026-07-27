'use client';

import React from 'react';
import type { SupplierApi } from '../types/suppliers.types';
import styles from './SupplierList.module.css';

interface SupplierListProps {
  suppliers: SupplierApi[];
}

export function SupplierList({ suppliers }: SupplierListProps) {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {suppliers.map((s) => (
          <div key={s.id} className={styles.card}>
            <h3>{s.tradeName}</h3>
            <p className={styles.nit}>NIT: {s.taxId}</p>
            <div className={styles.info}>
              <span>{s.city}</span>
              <span className={styles.type}>{String(s.type)}</span>
            </div>
            <p className={styles.contact}>{s.contactName} - {s.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
