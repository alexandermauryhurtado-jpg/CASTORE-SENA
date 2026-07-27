'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RecentProduct } from '../types/dashboard.types';
import { formatCOP } from '../../../utils/format';
import { clsx } from 'clsx';
import styles from './RecentProductsList.module.css';

interface RecentProductsListProps {
  products: RecentProduct[];
  isLoading?: boolean;
}

export function RecentProductsList({ products, isLoading }: RecentProductsListProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.skeletonHeader} />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={styles.skeletonRow} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Últimos productos</h3>
        <Link href="/products" className={styles.link}>
          Ver todos →
        </Link>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th>Stock</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.empty}>No hay productos recientes</td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p.id}
                  className={styles.rowLink}
                  onClick={() => router.push(`/products/${p.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && router.push(`/products/${p.id}`)}
                >
                  <td className={styles.sku}>{p.sku}</td>
                  <td>
                    <div className={styles.productCell}>
                      <span className={styles.productName}>{p.name}</span>
                      <span className={styles.categoryName}>{p.categoryName}</span>
                    </div>
                  </td>
                  <td>
                    <span className={clsx(
                      styles.stock,
                      p.currentStock === 0 ? styles.outOfStock : (p.currentStock <= p.minStock ? styles.lowStock : '')
                    )}>
                      {p.currentStock === 0 ? 'Sin stock' : p.currentStock}
                    </span>
                  </td>
                  <td className={styles.price}>{formatCOP(p.price)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
