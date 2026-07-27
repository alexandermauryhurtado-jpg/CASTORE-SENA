'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  X,
  Warehouse,
  Map as MapIcon,
  Columns,
  StretchVertical,
  Grid2X2,
  Check,
  AlertTriangle,
  Info,
} from 'lucide-react';
import clsx from 'clsx';
import type { Location, LocationTreeNode, LocationType } from '../../types/locations.types';
import { locationSchema, LocationFormData } from '../../schemas/location.schema';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Select } from '@/src/components/ui/Select';
import { useToast } from '@/src/components/ui/Toast';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useLocationsTree, useCreateLocation, useUpdateLocation, useCheckLocationCode } from '../../hooks/useLocations';
import styles from './LocationForm.module.css';

interface LocationFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Location | null;
}

const TYPE_OPTIONS: { value: LocationType; label: string; icon: typeof Warehouse; hint: string }[] = [
  { value: 'WAREHOUSE', label: 'Almacén', icon: Warehouse, hint: 'Contenedor principal' },
  { value: 'ZONE', label: 'Zona', icon: MapIcon, hint: 'Ej: Zona A, Zona B' },
  { value: 'AISLE', label: 'Pasillo', icon: Columns, hint: 'Pasillos dentro de zona' },
  { value: 'SHELF', label: 'Estante', icon: StretchVertical, hint: 'Estantes en pasillo' },
  { value: 'CELL', label: 'Celda', icon: Grid2X2, hint: 'Ubicación granular' },
];

const HIERARCHY_MAP: Record<LocationType, LocationType | null> = {
  WAREHOUSE: null,
  ZONE: 'WAREHOUSE',
  AISLE: 'ZONE',
  SHELF: 'AISLE',
  CELL: 'SHELF',
};

const CODE_HINTS: Record<LocationType, string> = {
  WAREHOUSE: 'Ej: ALM-01',
  ZONE: 'Ej: ZA-01',
  AISLE: 'Ej: ZA-P1',
  SHELF: 'Ej: ZA-P1-E1',
  CELL: 'Ej: ZA-P1-E1-C1',
};

function flattenByType(nodes: LocationTreeNode[], type: LocationType): Location[] {
  const out: Location[] = [];
  const visit = (n: LocationTreeNode) => {
    if (n.type === type) {
      out.push({
        id: n.id,
        code: n.code,
        name: n.name,
        type: n.type,
        productCount: n.productCount,
        occupancyPercent: n.occupancyPercent,
        capacity: n.capacity ?? undefined,
        parentId: n.parentId ?? undefined,
      });
    }
    n.children.forEach(visit);
  };
  nodes.forEach(visit);
  return out;
}

export function LocationFormDrawer({ isOpen, onClose, initialData }: LocationFormDrawerProps) {
  const { showToast } = useToast();
  const { tree } = useLocationsTree({ enabled: isOpen });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      type: 'ZONE',
      code: '',
      name: '',
      parentId: '',
      capacity: undefined,
    },
  });

  const watchedType = watch('type');
  const watchedCode = watch('code');
  const debouncedCode = useDebounce(watchedCode?.trim().toUpperCase() ?? '', 500);

  const { data: codeAvailable, isLoading: isCheckingCode } = useCheckLocationCode(
    debouncedCode,
    initialData?.id
  );

  const codeStatus: 'idle' | 'available' | 'taken' =
    !debouncedCode || debouncedCode.length < 2
      ? 'idle'
      : isCheckingCode
        ? 'idle'
        : codeAvailable === true
          ? 'available'
          : codeAvailable === false
            ? 'taken'
            : 'idle';

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      reset({
        type: initialData.type,
        code: initialData.code,
        name: initialData.name,
        parentId: initialData.parentId ?? '',
        capacity: initialData.capacity ?? undefined,
      });
    } else {
      reset({
        type: 'ZONE',
        code: '',
        name: '',
        parentId: '',
        capacity: undefined,
      });
    }
  }, [initialData, reset, isOpen]);

  const parentType = HIERARCHY_MAP[watchedType];
  const parentOptions = useMemo(() => {
    if (!parentType) return [];
    return flattenByType(tree, parentType);
  }, [tree, parentType]);

  const createMutation = useCreateLocation({
    onSuccess: () => {
      showToast({ message: 'Ubicación creada correctamente', type: 'success' });
      onClose();
    },
    onError: (err) => {
      showToast({
        message: err?.message ?? 'Error al crear la ubicación. Verifica el código y la jerarquía.',
        type: 'error',
      });
    },
  });

  const updateMutation = useUpdateLocation({
    onSuccess: () => {
      showToast({ message: 'Ubicación actualizada correctamente', type: 'success' });
      onClose();
    },
    onError: (err) => {
      showToast({
        message: err?.message ?? 'Error al actualizar la ubicación.',
        type: 'error',
      });
    },
  });

  const onSubmit = (data: LocationFormData) => {
    if (codeStatus === 'taken') return;
    const code = data.code.trim().toUpperCase();
    const payload = {
      code,
      name: data.name.trim(),
      type: data.type,
      capacity: data.capacity,
      parentId: data.parentId || undefined,
    };

    if (initialData) {
      updateMutation.mutate({
        id: initialData.id,
        dto: { name: payload.name, capacity: payload.capacity },
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className={clsx(styles.overlay, { [styles.open]: isOpen })} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            {initialData ? `Editar ${initialData.code}` : 'Nueva ubicación'}
          </h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <X size={24} />
          </button>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.body}>
            <div className={styles.fieldGroup}>
              <span className={styles.label}>Tipo de Ubicación</span>
              <div className={styles.typeGrid}>
                {TYPE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = watchedType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={clsx(styles.typeCard, { [styles.selected]: isSelected })}
                      onClick={() => {
                        setValue('type', opt.value);
                        setValue('parentId', '');
                      }}
                    >
                      <div className={styles.typeIcon}>
                        <Icon size={20} />
                      </div>
                      <span className={styles.typeName}>{opt.label}</span>
                      {isSelected && (
                        <div className={styles.checkBadge}>
                          <Check size={10} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {watchedType !== 'WAREHOUSE' && (
              <div className={styles.fieldGroup}>
                <Select
                  label={`Ubicación Padre (${parentType === 'WAREHOUSE' ? 'Almacén' : parentType})`}
                  {...register('parentId')}
                  error={errors.parentId?.message}
                  required
                >
                  <option value="">Selecciona ubicación padre</option>
                  {parentOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </Select>
                {parentOptions.length === 0 && (
                  <div className={styles.warningBox}>
                    <AlertTriangle size={14} />
                    <span>
                      No hay {parentType} registrados para asignar como padre.
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className={styles.fieldGroup}>
              <div className={styles.codeRow}>
                <Input
                  label="Código de Ubicación"
                  {...register('code')}
                  error={errors.code?.message}
                  placeholder={CODE_HINTS[watchedType]}
                  hint={CODE_HINTS[watchedType]}
                  className={styles.flex1}
                  required
                />
                <div className={styles.statusIndicator}>
                  {isCheckingCode && <div className={styles.spinner} />}
                  {!isCheckingCode && codeStatus === 'available' && (
                    <Check size={18} className={styles.green} />
                  )}
                  {!isCheckingCode && codeStatus === 'taken' && (
                    <AlertTriangle size={18} className={styles.red} />
                  )}
                </div>
              </div>
              {codeStatus === 'taken' && (
                <span className={styles.errorText}>Este código ya está en uso.</span>
              )}
            </div>

            <Input
              label="Nombre de Ubicación"
              {...register('name')}
              error={errors.name?.message}
              placeholder="Ej: Estante de Carga Pesada"
              required
            />

            <Input
              label="Capacidad Máxima (Opcional)"
              type="number"
              {...register('capacity', { valueAsNumber: true })}
              error={errors.capacity?.message}
              placeholder="0"
              hint="Número máximo de unidades que puede almacenar"
            />

            <div className={styles.infoBanner}>
              <Info size={16} />
              <p>
                La jerarquía ayuda a organizar los productos y calcular la ocupación real del
                almacén.
              </p>
            </div>
          </div>

          <footer className={styles.footer}>
            <Button variant="secondary" type="button" onClick={onClose} className={styles.fullWidth}>
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={codeStatus === 'taken' || isCheckingCode}
              className={styles.fullWidth}
            >
              {initialData ? 'Guardar cambios' : 'Guardar ubicación'}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
