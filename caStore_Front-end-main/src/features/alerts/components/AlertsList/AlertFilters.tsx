'use client';

import React from 'react';
import { Search, Calendar } from 'lucide-react';
import styles from './AlertFilters.module.css';
import { Input } from '@/src/components/ui/Input';
import { Select } from '@/src/components/ui/Select';

interface AlertFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
  typeFilter: string;
  onTypeChange: (val: string) => void;
}

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Todas las alertas' },
  { value: 'LOW_STOCK', label: 'Stock bajo' },
  { value: 'EXPIRY_30D', label: 'Vence en 30 días' },
  { value: 'EXPIRY_15D', label: 'Vence en 15 días' },
  { value: 'EXPIRY_7D', label: 'Vence en 7 días' },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'ACTIVE', label: 'Activa' },
  { value: 'RESOLVED', label: 'Resuelta' },
  { value: 'DISMISSED', label: 'Descartada' },
];

export function AlertFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange
}: AlertFiltersProps) {
  return (
    <div className={styles.filtersContainer}>
      <div className={styles.searchWrapper}>
        <Input
          placeholder="Buscar producto..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          icon={Search}
        />
      </div>
      <div className={styles.filterGroup}>
        <Select
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
        <div className={styles.dateDemo}>
          <Calendar size={16} className={styles.dateIcon}/>
          <span className={styles.dateText}>Cualquier fecha</span>
        </div>
      </div>
    </div>
  );
}
