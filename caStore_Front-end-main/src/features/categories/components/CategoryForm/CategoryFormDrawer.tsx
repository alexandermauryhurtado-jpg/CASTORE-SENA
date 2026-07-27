'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Activity, Cog, Shield, Zap, PenTool, Layout, Droplets, Grid, Settings } from 'lucide-react';
import clsx from 'clsx';
import {
  categorySchema,
  CategoryFormData,
  getSuggestedSkuPrefix,
  skuPreviewDisplay,
} from '../../schemas/category.schema';
import styles from './CategoryFormDrawer.module.css';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import type { Category } from '../../types/categories.types';

const DEBOUNCE_MS = 500;

interface CategoryFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => void;
  initialData?: Category | null;
  parentCategory?: Category | null;
  /** Lista plana de categorías para validar unicidad del prefijo (debounce 500ms). */
  treeFlat?: Category[];
  isLoading?: boolean;
}

const CAR_ICONS = [
  { name: 'Engine', icon: Activity },
  { name: 'Wheel', icon: Cog },
  { name: 'Brakes', icon: Shield },
  { name: 'Battery', icon: Zap },
  { name: 'Transmission', icon: Settings },
  { name: 'Body', icon: Grid },
  { name: 'Tools', icon: PenTool },
  { name: 'Oil', icon: Droplets },
  { name: 'Suspension', icon: Layout },
  { name: 'Electrical', icon: Zap },
  { name: 'Exhaust', icon: Activity },
  { name: 'Cooling', icon: Droplets },
];

const PRESET_COLORS = [
  '#F97316', '#0EA5E9', '#EF4444', '#EAB308', '#10B981',
  '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#64748B',
];

export function CategoryFormDrawer({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  parentCategory,
  treeFlat = [],
  isLoading,
}: CategoryFormDrawerProps) {
  const [skuPrefixUniqueError, setSkuPrefixUniqueError] = useState<string | null>(null);

  const defaultSku = useMemo(() => {
    if (initialData?.skuPrefix) return initialData.skuPrefix;
    return '';
  }, [initialData?.skuPrefix]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    values: initialData
      ? {
          name: initialData.name,
          description: initialData.description ?? '',
          skuPrefix: initialData.skuPrefix,
          parentId: initialData.parentId ?? '',
          icon: initialData.icon ?? 'Engine',
          color: initialData.color ?? '#F97316',
        }
      : {
          name: '',
          description: '',
          skuPrefix: defaultSku,
          parentId: parentCategory?.id ?? '',
          icon: 'Engine',
          color: '#F97316',
        },
  });

  const categoryName = watch('name');
  const skuPrefixValue = watch('skuPrefix');
  const selectedIcon = watch('icon');
  const selectedColor = watch('color');
  const descriptionValue = watch('description') || '';

  // Sugerir skuPrefix desde el nombre al crear (solo si está vacío o no tocado)
  useEffect(() => {
    if (initialData || !categoryName) return;
    const suggested = getSuggestedSkuPrefix(categoryName);
    if (suggested.length >= 2) setValue('skuPrefix', suggested);
  }, [categoryName, initialData, setValue]);

  // Validación de unicidad del prefijo con debounce 500ms
  const checkUniqueness = useCallback(() => {
    const prefix = (skuPrefixValue || '').trim().toUpperCase();
    if (prefix.length < 2) {
      setSkuPrefixUniqueError(null);
      return;
    }
    const excludeId = initialData?.id;
    const exists = treeFlat.some(
      (c) => c.skuPrefix.toUpperCase() === prefix && c.id !== excludeId
    );
    setSkuPrefixUniqueError(exists ? 'Este prefijo SKU ya está en uso' : null);
  }, [skuPrefixValue, initialData?.id, treeFlat]);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(checkUniqueness, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [skuPrefixValue, isOpen, checkUniqueness]);

  const preview = useMemo(() => skuPreviewDisplay(skuPrefixValue), [skuPrefixValue]);

  const isEdit = !!initialData;
  const isSubcategory = !!parentCategory || !!initialData?.parentId;
  const canSubmit = !skuPrefixUniqueError;

  return (
    <>
      <div
        className={clsx(styles.overlay, { [styles.overlayOpen]: isOpen })}
        onClick={onClose}
      />
      <div className={clsx(styles.drawer, { [styles.drawerOpen]: isOpen })}>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <h2 className={styles.title}>
                {isEdit
                  ? `Editar ${initialData?.name}`
                  : isSubcategory
                    ? `Nueva subcategoría en ${parentCategory?.name}`
                    : 'Nueva categoría'}
              </h2>
              <p className={styles.subtitle}>
                Configura los detalles y jerarquía. Máximo 2 niveles (categoría principal y subcategoría).
              </p>
            </div>
            <button type="button" className={styles.closeBtn} onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className={styles.content}>
            <div className={styles.fieldGroup}>
              <Input
                label="Nombre de la categoría"
                placeholder="Ej. Transmisión"
                {...register('name')}
                error={errors.name?.message}
              />
            </div>

            <div className={styles.fieldGroup}>
              <Input
                label="Prefijo SKU"
                placeholder="Ej. MOTO, FREN"
                {...register('skuPrefix')}
                error={errors.skuPrefix?.message ?? skuPrefixUniqueError ?? undefined}
              />
              <div className={styles.skuPreviewRow}>
                <span className={styles.skuHelp}>Vista previa SKU:</span>
                <code className={styles.skuBadge}>{preview}</code>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label className={styles.fieldLabel}>Descripción (Opcional)</label>
                <span
                  className={clsx(styles.counter, {
                    [styles.counterError]: descriptionValue.length > 200,
                  })}
                >
                  {descriptionValue.length}/200
                </span>
              </div>
              <textarea
                className={clsx(styles.textarea, { [styles.textareaError]: !!errors.description })}
                placeholder="Describe brevemente el tipo de productos que incluye esta categoría..."
                {...register('description')}
              />
              {errors.description && (
                <span className={styles.errorText}>{errors.description.message}</span>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Icono representativo</label>
              <div className={styles.iconGrid}>
                {CAR_ICONS.map(({ name, icon: Icon }) => (
                  <div
                    key={name}
                    className={clsx(styles.iconItem, {
                      [styles.iconItemSelected]: selectedIcon === name,
                    })}
                    onClick={() => setValue('icon', name)}
                    onKeyDown={(e) => e.key === 'Enter' && setValue('icon', name)}
                    role="button"
                    tabIndex={0}
                    title={name}
                  >
                    <Icon size={20} />
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Color distintivo</label>
              <div className={styles.colorPalette}>
                {PRESET_COLORS.map((color) => (
                  <div
                    key={color}
                    className={clsx(styles.colorCircle, {
                      [styles.colorCircleSelected]: selectedColor === color,
                    })}
                    style={{ backgroundColor: color }}
                    onClick={() => setValue('color', color)}
                    onKeyDown={(e) => e.key === 'Enter' && setValue('color', color)}
                    role="button"
                    tabIndex={0}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <Button variant="secondary" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={!canSubmit}>
              {isEdit ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
