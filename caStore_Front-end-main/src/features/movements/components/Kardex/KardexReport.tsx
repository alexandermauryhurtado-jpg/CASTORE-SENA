'use client';

import React, { useState, useMemo } from 'react';
import {
  Download,
  MapPin,
  Package,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
} from 'lucide-react';
import clsx from 'clsx';
import styles from './KardexReport.module.css';
import { Button } from '@/src/components/ui/Button';
import { useKardex } from '../../hooks/useMovements';
import { useProduct } from '@/src/features/products/hooks/useProducts';
import type { KardexItem } from '../../types/movements.types';

interface KardexReportProps {
  productId: string;
}

function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString('es-CO');
}

/** Genera y descarga CSV del listado de kardex. */
function exportKardexToCsv(
  productName: string,
  productSku: string,
  initialStock: number,
  rows: KardexItem[],
  finalStock: number
) {
  const headers = ['Fecha', 'Tipo', 'Referencia', 'Lote', 'Entradas', 'Salidas', 'Saldo', 'Costo unit.', 'Costo total', 'Valor saldo', 'Registrado por'];
  const escape = (v: string | number | null | undefined): string => {
    if (v == null) return '';
    const s = String(v);
    return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines: string[] = [
    `Kardex - ${productName} (${productSku})`,
    '',
    headers.join(','),
    `-,SALDO INICIAL,-,-,-,-,${initialStock},-,-,-,-`,
    ...rows.map((r) =>
      [
        formatDate(r.date),
        r.type,
        r.docReference ?? '',
        r.lotNumber ?? '',
        r.entries,
        r.exits,
        r.balance,
        r.unitCost ?? '',
        r.totalCost ?? '',
        r.balanceValue ?? '',
        r.registeredBy,
      ].map(escape).join(',')
    ),
    `-,SALDO FINAL,-,-,-,-,${finalStock},-,-,-,-`,
  ];
  const csv = lines.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kardex_${productSku}_${formatDate(new Date()).replace(/\//g, '-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function KardexReport({ productId }: KardexReportProps) {
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { product } = useProduct(productId);
  const { data: kardex, isLoading } = useKardex(productId, {
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    limit,
  });

  const { data: rows, initialStock, finalStock, totalEntries, totalExits } = kardex;
  const net = totalEntries - totalExits;

  const chartPoints = useMemo(() => {
    if (rows.length === 0) return '';
    const allBalances = [initialStock, ...rows.map((r) => r.balance)];
    const maxBalance = Math.max(...allBalances, 1);
    const height = 150;
    const width = 800;
    const stepX = width / (allBalances.length || 1);
    let points = `0,${height - (initialStock / maxBalance) * height}`;
    rows.forEach((row, idx) => {
      const x = (idx + 1) * stepX;
      const y = height - (row.balance / maxBalance) * height;
      points += ` ${x},${y}`;
    });
    return points;
  }, [rows, initialStock]);

  const handleExportCsv = () => {
    exportKardexToCsv(
      product?.name ?? 'Producto',
      product?.sku ?? productId,
      initialStock,
      rows,
      finalStock
    );
  };

  const minStock = product?.minStock ?? 0;
  const currentStock = product?.stock ?? finalStock;

  if (!product && !isLoading) {
    return (
      <div className={styles.container}>
        <p className={styles.errorText}>Producto no encontrado.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.productHeader}>
        <div className={styles.pBasic}>
          <div className={styles.pImgBox}>
            <Package size={40} />
          </div>
          <div className={styles.pTitle}>
            <h2 className={styles.title}>{product?.name ?? '—'}</h2>
            <div className={styles.pMeta}>
              <span className={styles.pSku}>SKU: {product?.sku ?? '—'}</span>
              <span className={styles.pCat}>{product?.categoryName ?? ''}</span>
            </div>
          </div>
        </div>
        <div className={styles.pStats}>
          <div className={styles.stockBox}>
            <span className={styles.stockLabel}>Stock actual</span>
            <span className={clsx(styles.stockVal, { [styles.lowStock]: currentStock <= minStock })}>
              {currentStock}
            </span>
          </div>
          {(product as { locationName?: string } | null)?.locationName && (
            <div className={styles.locationBox}>
              <MapPin size={16} />
              <span>{(product as { locationName?: string }).locationName}</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.periodBar}>
        <div className={styles.periodSelectors}>
          <div className={styles.datePickerRange}>
            <CalendarIcon size={16} />
            <input
              type="date"
              className={styles.dateInput}
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              aria-label="Desde"
            />
            <span>—</span>
            <input
              type="date"
              className={styles.dateInput}
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              aria-label="Hasta"
            />
          </div>
        </div>
        <div className={styles.exportActions}>
          <Button variant="secondary" onClick={handleExportCsv}>
            <Download size={16} /> CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.tableCard}>
          <p className={styles.loadingText}>Cargando kardex...</p>
        </div>
      ) : (
        <>
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo / Referencia</th>
                  <th className={styles.colIn}>Entradas</th>
                  <th className={styles.colOut}>Salidas</th>
                  <th>Saldo Cant.</th>
                  <th>Saldo Valorizado</th>
                </tr>
              </thead>
              <tbody>
                <tr className={styles.initialRow}>
                  <td>-</td>
                  <td><strong>SALDO INICIAL</strong></td>
                  <td className={styles.colIn}>-</td>
                  <td className={styles.colOut}>-</td>
                  <td>{initialStock}</td>
                  <td className={styles.mono}>—</td>
                </tr>
                {rows.map((row, idx) => (
                  <tr key={`${row.date}-${idx}`}>
                    <td>{formatDate(row.date)}</td>
                    <td>
                      <div className={styles.typeCol}>
                        <span className={styles.typeName}>{row.type}</span>
                        <span className={styles.docRef}>{row.docReference ?? ''}</span>
                      </div>
                    </td>
                    <td className={clsx(styles.colIn, styles.qtyIn)}>{row.entries || ''}</td>
                    <td className={clsx(styles.colOut, styles.qtyOut)}>{row.exits || ''}</td>
                    <td className={styles.semibold}>{row.balance}</td>
                    <td className={styles.mono}>
                      {row.balanceValue != null ? `$ ${Number(row.balanceValue).toLocaleString()}` : '—'}
                    </td>
                  </tr>
                ))}
                <tr className={styles.finalRow}>
                  <td>{formatDate(new Date())}</td>
                  <td><strong>SALDO FINAL</strong></td>
                  <td className={styles.colIn}>-</td>
                  <td className={styles.colOut}>-</td>
                  <td><strong>{finalStock}</strong></td>
                  <td className={styles.mono}>—</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.footerPanels}>
            <div className={styles.totalsPanel}>
              <h4 className={styles.panelTitle}>Resumen de movimientos</h4>
              <div className={styles.totalsGrid}>
                <div className={styles.tItem}>
                  <span className={styles.tLabel}>Mcias. ingresadas</span>
                  <div className={styles.tValRow}>
                    <TrendingUp size={20} color="#10B981" /> <span className={styles.tValPos}>{totalEntries}</span>
                  </div>
                </div>
                <div className={styles.tItem}>
                  <span className={styles.tLabel}>Mcias. egresadas</span>
                  <div className={styles.tValRow}>
                    <TrendingDown size={20} color="#EF4444" /> <span className={styles.tValNeg}>{totalExits}</span>
                  </div>
                </div>
                <div className={styles.tItem}>
                  <span className={styles.tLabel}>Variación neta</span>
                  <div className={styles.tValRow}>
                    <span className={net >= 0 ? styles.tValPos : styles.tValNeg}>
                      {net >= 0 ? '+' : ''}{net}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.chartPanel}>
              <h4 className={styles.panelTitle}>Evolución de stock</h4>
              <div className={styles.chartContainer}>
                <svg viewBox="0 0 800 150" className={styles.svg}>
                  <line x1="0" y1="130" x2="800" y2="130" stroke="#E2E8F0" strokeWidth="1" />
                  {minStock > 0 && (
                    <line
                      x1="0"
                      y1={150 - (minStock / Math.max(initialStock, finalStock, minStock, 50)) * 150}
                      x2="800"
                      y2={150 - (minStock / Math.max(initialStock, finalStock, minStock, 50)) * 150}
                      stroke="#EF4444"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  )}
                  {chartPoints && (
                    <polyline
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth="3"
                      points={chartPoints}
                    />
                  )}
                </svg>
                <div className={styles.chartLabels}>
                  <span>Inicio del período</span>
                  <span>Actual</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
