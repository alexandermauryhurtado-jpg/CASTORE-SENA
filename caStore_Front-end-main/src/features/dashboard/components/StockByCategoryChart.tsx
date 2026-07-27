'use client';

import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { StockByCategory } from '../types/dashboard.types';
import { formatCOP } from '../../../utils/format';
import styles from './StockByCategoryChart.module.css';

interface StockByCategoryChartProps {
  data: StockByCategory[];
  isLoading?: boolean;
}

const COLORS = ['#F8623A', '#2563EB', '#16A34A', '#D97706', '#7C3AED'];

interface TooltipPayloadItem { payload: StockByCategory }
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total =
      (payload[0].payload as StockByCategory & { totalPayloadSum?: number }).totalPayloadSum || 1;
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{data.name}</p>
        <div className={styles.tooltipItem}>
          <span>Valor: <strong>{formatCOP(data.totalValue)}</strong></span>
        </div>
        <div className={styles.tooltipItem}>
          <span>Stock: <strong>{data.totalStock} unidades</strong></span>
        </div>
      </div>
    );
  }
  return null;
};

export function StockByCategoryChart({ data, isLoading }: StockByCategoryChartProps) {
  if (isLoading) {
    return <div className={styles.skeleton} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No hay datos por categoría</p>
      </div>
    );
  }

  const totalProducts = data.reduce((acc, curr) => acc + curr.productCount, 0);

  return (
    <div className={styles.container}>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="totalValue"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.2)" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              iconType="circle"
              layout="vertical"
              verticalAlign="middle"
              align="right"
              formatter={(value: string, entry: unknown) => {
                const payload = (entry as { payload?: StockByCategory }).payload;
                return (
                  <span className={styles.legendLabel}>
                    {value} ({payload?.productCount ?? ''})
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className={styles.centerText}>
          <span className={styles.totalNum}>{totalProducts}</span>
          <span className={styles.totalLabel}>Categorías</span>
        </div>
      </div>
    </div>
  );
}
