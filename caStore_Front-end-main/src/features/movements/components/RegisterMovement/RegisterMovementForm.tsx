'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
  Settings2,
  RotateCcw,
  Search,
  Package,
  Info,
  CheckCircle2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { createMovementSchema, type CreateMovementFormData } from '../../schemas/movement.schema';
import type { MovementTypeApi } from '../../types/movements.types';
import styles from './RegisterMovementForm.module.css';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Select } from '@/src/components/ui/Select';
import { useToast } from '@/src/components/ui/Toast';
import { useProduct } from '@/src/features/products/hooks/useProducts';
import { productsService } from '@/src/services/products.service';
import { locationsService } from '@/src/services/locations.service';
import { suppliersService } from '@/src/services/suppliers.service';
import { useCreateMovement } from '../../hooks/useMovements';
import { useDebounce } from '@/src/hooks/useDebounce';
import type { ProductApi } from '@/src/features/products/types/products.types';

const MOVEMENT_TYPES: { id: MovementTypeApi; label: string; description: string; icon: React.ComponentType<{ size?: number }>; color: string }[] = [
  { id: 'PURCHASE_ENTRY', label: 'Entrada por compra', description: 'Recepción de mercancía de un proveedor.', icon: ArrowDownToLine, color: styles.typeGreen },
  { id: 'SALE_EXIT', label: 'Salida por venta', description: 'Despacho de productos a cliente o consumo.', icon: ArrowUpFromLine, color: styles.typeRed },
  { id: 'TRANSFER', label: 'Transferencia', description: 'Mover productos entre ubicaciones.', icon: ArrowRightLeft, color: styles.typeBlue },
  { id: 'POSITIVE_ADJUSTMENT', label: 'Ajuste positivo', description: 'Corrección por exceso en inventario.', icon: Settings2, color: styles.typeOrange },
  { id: 'NEGATIVE_ADJUSTMENT', label: 'Ajuste negativo', description: 'Corrección por faltante en inventario.', icon: Settings2, color: styles.typeOrange },
  { id: 'RETURN', label: 'Devolución', description: 'Retorno de productos al inventario.', icon: RotateCcw, color: styles.typePurple },
];

export function RegisterMovementForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState<MovementTypeApi | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(productSearch, 300);

  const { product: selectedProductView, refetch: refetchProduct } = useProduct(selectedProductId, { enabled: Boolean(selectedProductId) });
  const currentStock = selectedProductView?.stock ?? 0;

  const { data: productsResponse } = useQuery({
    queryKey: ['products', 'search', debouncedSearch],
    queryFn: () => productsService.getProducts({ search: debouncedSearch, limit: 10 }),
    enabled: debouncedSearch.length >= 2,
  });
  const productOptions: ProductApi[] = productsResponse?.data ?? [];

  const { data: locationsResponse } = useQuery({
    queryKey: ['locations', 'list'],
    queryFn: () => locationsService.getLocations({ limit: 100 }),
  });
  const locations = locationsResponse?.data ?? [];

  const { data: suppliersResponse } = useQuery({
    queryKey: ['suppliers', 'list'],
    queryFn: () => suppliersService.getSuppliers({ limit: 100 }),
  });
  const suppliers = suppliersResponse?.data ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateMovementFormData>({
    resolver: zodResolver(createMovementSchema) as Resolver<CreateMovementFormData>,
    defaultValues: {
      type: 'PURCHASE_ENTRY',
      productId: '',
      quantity: 0,
      createdAt: new Date().toISOString().split('T')[0],
    },
  });

  const quantity = watch('quantity') ?? 0;

  const isExitType = useMemo(
    () =>
      selectedType === 'SALE_EXIT' || selectedType === 'NEGATIVE_ADJUSTMENT',
    [selectedType]
  );
  const stockError = useMemo(
    () => Boolean(selectedProductId && isExitType && quantity > currentStock),
    [selectedProductId, isExitType, quantity, currentStock]
  );
  const stockResult = useMemo(() => {
    if (!selectedProductId) return null;
    if (selectedType === 'PURCHASE_ENTRY' || selectedType === 'POSITIVE_ADJUSTMENT' || selectedType === 'RETURN') {
      return currentStock + quantity;
    }
    if (isExitType) return currentStock - quantity;
    return currentStock;
  }, [selectedProductId, selectedType, quantity, currentStock, isExitType]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const createMovement = useCreateMovement({
    onSuccess: (data) => {
      showToast({
        message: data ? 'Movimiento registrado correctamente.' : 'Movimiento registrado (modo demo).',
        type: 'success',
      });
      router.push('/movements');
    },
    onError: () => {
      showToast({
        message: 'Error al registrar el movimiento. Compruebe stock y datos.',
        type: 'error',
      });
    },
  });

  const handleSelectType = (id: MovementTypeApi) => {
    setSelectedType(id);
    setValue('type', id);
  };

  const handleSelectProduct = (p: ProductApi) => {
    setSelectedProductId(p.id);
    setValue('productId', p.id);
    setProductSearch('');
    setShowProductDropdown(false);
    refetchProduct();
  };

  const onSubmit = (formData: CreateMovementFormData) => {
    if (stockError) return;
    createMovement.mutate({
      type: formData.type,
      productId: formData.productId,
      quantity: formData.quantity,
      docReference: formData.docReference || undefined,
      notes: formData.notes || undefined,
      lotNumber: formData.lotNumber || undefined,
      unitCost: formData.unitCost,
      supplierId: formData.supplierId || undefined,
      fromLocationId: formData.fromLocationId || undefined,
      toLocationId: formData.toLocationId || undefined,
      createdAt: formData.createdAt ? `${formData.createdAt}T12:00:00.000Z` : undefined,
    });
  };

  const isLoading = createMovement.isPending;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/movements" className={styles.backBtn}>
          <ArrowLeft size={20} />
          Volver al listado
        </Link>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>1. Selecciona el tipo de movimiento</h3>
        <div className={styles.typeGrid}>
          {MOVEMENT_TYPES.map((type) => (
            <div
              key={type.id}
              className={clsx(styles.typeCard, { [styles.typeCardActive]: selectedType === type.id })}
              onClick={() => handleSelectType(type.id)}
            >
              <div className={clsx(styles.typeIconBox, type.color)}>
                <type.icon size={24} />
              </div>
              <div className={styles.typeInfo}>
                <span className={styles.typeLabel}>{type.label}</span>
                <p className={styles.typeDesc}>{type.description}</p>
              </div>
              {selectedType === type.id && (
                <div className={styles.checkBadge}>
                  <CheckCircle2 size={16} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedType && (
        <form className={styles.formContent} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>2. Identificación del producto</h3>
            <div className={styles.searchBox} ref={searchRef}>
              <div className={styles.inputWithResults}>
                <Input
                  label="Buscar producto"
                  placeholder="Escribe nombre o SKU (mín. 2 caracteres)..."
                  icon={Search}
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                  }}
                  onFocus={() => productSearch.length >= 2 && setShowProductDropdown(true)}
                  error={errors.productId?.message}
                />
                {showProductDropdown && productSearch.length >= 2 && (
                  <div className={styles.resultsDropdown}>
                    {productOptions.length === 0 ? (
                      <div className={styles.resultEmpty}>Sin resultados</div>
                    ) : (
                      productOptions.map((p) => (
                        <div
                          key={p.id}
                          className={styles.resultItem}
                          onClick={() => handleSelectProduct(p)}
                        >
                          <div className={styles.resultMain}>
                            <span className={styles.resName}>{p.name}</span>
                            <span className={styles.resSku}>{p.sku}</span>
                          </div>
                          <div className={styles.resStock}>Stock: {p.currentStock}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {selectedProductView && (
                <div className={styles.selectedProductCard}>
                  <div className={styles.pCardInfo}>
                    <Package size={32} className={styles.pCardIcon} />
                    <div>
                      <span className={styles.pCardName}>{selectedProductView.name}</span>
                      <span className={styles.pCardSku}>{selectedProductView.sku}</span>
                    </div>
                  </div>
                  <div className={styles.pCardStock}>
                    <span className={styles.stockLabel}>Stock actual</span>
                    <span className={styles.stockValue}>{currentStock}</span>
                  </div>
                  <button
                    type="button"
                    className={styles.removeP}
                    onClick={() => {
                      setSelectedProductId(null);
                      setValue('productId', '');
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.fieldItem}>
              <Input
                label="Cantidad"
                type="number"
                {...register('quantity', { valueAsNumber: true })}
                error={
                  stockError
                    ? `Stock insuficiente. Disponible: ${currentStock} unidades.`
                    : errors.quantity?.message
                }
              />
              {selectedProductId && !stockError && stockResult !== null && (
                <div className={styles.stockPreview}>
                  Stock resultante: <strong>{currentStock}</strong> → <strong className={styles.resValue}> {stockResult}</strong>
                </div>
              )}
            </div>

            <div className={styles.fieldItem}>
              <Input
                label="Fecha del movimiento"
                type="date"
                {...register('createdAt')}
                error={errors.createdAt?.message}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {(selectedType === 'PURCHASE_ENTRY' || selectedType === 'RETURN') && (
              <>
                <div className={styles.fieldItem}>
                  <Input label="Documento de referencia" {...register('docReference')} error={errors.docReference?.message} />
                </div>
                <div className={styles.fieldItem}>
                  <Select
                    label="Proveedor"
                    {...register('supplierId')}
                    error={errors.supplierId?.message}
                  >
                    <option value="">Seleccione proveedor</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.tradeName}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className={styles.fieldItem}>
                  <Input label="Número de lote (opcional)" {...register('lotNumber')} />
                </div>
                <div className={styles.fieldItem}>
                  <Select label="Ubicación destino" {...register('toLocationId')} error={errors.toLocationId?.message}>
                    <option value="">Seleccione ubicación</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.code})
                      </option>
                    ))}
                  </Select>
                </div>
              </>
            )}

            {selectedType === 'SALE_EXIT' && (
              <>
                <div className={styles.fieldItem}>
                  <Input label="Documento de referencia" {...register('docReference')} error={errors.docReference?.message} />
                </div>
                <div className={styles.fieldItem}>
                  <Select label="Ubicación origen" {...register('fromLocationId')} error={errors.fromLocationId?.message}>
                    <option value="">Seleccione ubicación</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.code})
                      </option>
                    ))}
                  </Select>
                </div>
              </>
            )}

            {selectedType === 'TRANSFER' && (
              <>
                <div className={styles.fieldItem}>
                  <Select label="Ubicación origen" {...register('fromLocationId')} error={errors.fromLocationId?.message}>
                    <option value="">Seleccione ubicación</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.code})
                      </option>
                    ))}
                  </Select>
                </div>
                <div className={styles.fieldItem}>
                  <Select label="Ubicación destino" {...register('toLocationId')} error={errors.toLocationId?.message}>
                    <option value="">Seleccione ubicación</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.code})
                      </option>
                    ))}
                  </Select>
                </div>
                <div className={styles.fieldItem}>
                  <Input label="Documento / Guía" {...register('docReference')} error={errors.docReference?.message} />
                </div>
              </>
            )}

            {(selectedType === 'POSITIVE_ADJUSTMENT' || selectedType === 'NEGATIVE_ADJUSTMENT') && (
              <div className={styles.fieldItem}>
                <Input label="Documento de referencia (opcional)" {...register('docReference')} />
              </div>
            )}

            <div className={styles.fieldItemFull}>
              <label className={styles.fieldLabel}>Observaciones</label>
              <textarea
                className={styles.textarea}
                placeholder="Notas adicionales sobre este movimiento..."
                {...register('notes')}
              />
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.sumInfo}>
              <h4 className={styles.sumTitle}>Resumen del registro</h4>
              <div className={styles.sumGrid}>
                <div className={styles.sumItem}>
                  <Info size={16} />
                  <span>{MOVEMENT_TYPES.find((t) => t.id === selectedType)?.label}</span>
                </div>
                {selectedProductView && (
                  <div className={styles.sumItem}>
                    <Package size={16} />
                    <span>{selectedProductView.name} ({quantity} und)</span>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.sumActions}>
              <Button type="button" variant="secondary" onClick={() => router.push('/movements')}>
                Cancelar
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
                disabled={stockError || !selectedProductId}
              >
                Registrar movimiento
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
