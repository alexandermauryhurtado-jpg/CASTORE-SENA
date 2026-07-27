'use client';

import React from 'react';
import { Movement } from '../types/movements.types';
import styles from './MovementList.module.css';

interface MovementListProps {
  movements: Movement[];
}

export function MovementList({ movements }: MovementListProps) {
  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Usuario</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((mov) => (
            <tr key={mov.id}>
              <td>
                <span className={styles.badge}>{mov.type}</span>
              </td>
              <td>{mov.productName}</td>
              <td className={mov.quantity > 0 ? styles.positive : styles.negative}>
                {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
              </td>
              <td>{(mov as { userFullName?: string }).userFullName ?? '-'}</td>
              <td>{new Date(mov.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
