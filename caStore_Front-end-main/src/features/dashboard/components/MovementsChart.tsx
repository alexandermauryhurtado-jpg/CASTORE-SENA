'use client';

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { MovementByDay } from '../types/dashboard.types';
import styles from './MovementsChart.module.css';

interface MovementsChartProps {
  data: MovementByDay[];
  isLoading?: boolean;
}

interface TooltipPayloadItem { value: number }
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        <div className={styles.tooltipDivider} />
        <div className={styles.tooltipItem}>
          <span className={styles.indicator} style={{ backgroundColor: '#16A34A' }} />
          <span>Entradas: <strong>{payload[0].value}</strong></span>
        </div>
        <div className={styles.tooltipItem}>
          <span className={styles.indicator} style={{ backgroundColor: '#DC2626' }} />
          <span>Salidas: <strong>{payload[1].value}</strong></span>
        </div>
      </div>
    );
  }
  return null;
};

export function MovementsChart({ data, isLoading }: MovementsChartProps) {
  if (isLoading) {
    return <div className={styles.skeleton} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No hay datos de movimientos para mostrar</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#64748B' }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#64748B' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            align="right" 
            height={36}
            iconType="circle"
            formatter={(value) => <span style={{ color: '#475569', fontSize: 12 }}>{value === 'entries' ? 'Entradas' : 'Salidas'}</span>}
          />
          <Line 
            type="monotone" 
            dataKey="entries" 
            stroke="#16A34A" 
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="exits" 
            stroke="#DC2626" 
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
