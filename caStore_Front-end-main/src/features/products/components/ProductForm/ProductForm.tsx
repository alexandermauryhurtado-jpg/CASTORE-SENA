'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import type { AxiosError } from 'axios';

import { productSchema, type ProductFormData } from '../../schemas/product.schema';
import {
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useUpdateProductImage,
} from '../../hooks/useProducts';
import { categoriesService } from '@/src/services/categories.service';
import { locationsService } from '@/src/services/locations.service';
import { Input } from '@/src/components/ui/Input';
import { Textarea } from '@/src/components/ui/Textarea';
import { Select } from '@/src/components/ui/Select';
import { Button } from '@/src/components/ui/Button';
import { Switch } from '@/src/components/ui/Switch';
import { ImageUpload } from '@/src/components/ui/ImageUpload';
import { Badge } from '@/src/components/ui/Badge';
import { Modal } from '@/src/components/ui/Modal';
import { useToast } from '@/src/components/ui/Toast';
import { useModal } from '@/src/hooks/useModal';
import type { CategoryTreeItem } from '@/src/features/categories/types/categories.types';
import type { LocationTreeApi } from '@/src/features/locations/types/locations.types';

import styles from './ProductForm.module.css';

/** Estado del formulario incluye imagen (no enviada en create/update body; se usa PATCH imagen aparte). */
type FormState = ProductFormData & { image?: string | null };

interface ProductFormProps {
  mode: 'create' | 'edit';
  productId?: string;
}

/** Aplana árbol de categorías: padres como optgroup, hijos como options. */
function buildCategoryOptions(tree: CategoryTreeItem[]): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  for (const node of tree) {
    if (node.children?.length) {
      nodes.push(
        <optgroup key={node.id} label={node.name}>
          {node.children.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </optgroup>
      );
    } else {
      nodes.push(
        <option key={node.id} value={node.id}>
          {node.name}
        </option>
      );
    }
  }
  return nodes;
}

/** Aplana árbol de ubicaciones para select: código y nombre. */
function flattenLocations(tree: LocationTreeApi[]): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];
  function walk(nodes: LocationTreeApi[]) {
    for (const n of nodes) {
      out.push({ id: n.id, label: `${n.code} — ${n.name}` });
      if (n.children?.length) walk(n.children);
    }
  }
  walk(tree);
  return out;
}

interface ApiErrorBody {
  code?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export function ProductForm({ mode, productId }: ProductFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { isOpen: showDiscardModal, open: openDiscardModal, close: closeDiscardModal } = useModal();

  const isEdit = mode === 'edit' && Boolean(productId);
  const { productApi, isLoading: loadingProduct } = useProduct(isEdit ? productId ?? null : null, {
    enabled: isEdit,
  });

  const { data: categoryTree } = useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: () => categoriesService.getTree(),
  });
  const { data: locationTree } = useQuery({
    queryKey: ['locations', 'tree'],
    queryFn: () => locationsService.getTree(),
  });

  const categoryOptions = useMemo(
    () => (categoryTree ? buildCategoryOptions(categoryTree) : null),
    [categoryTree]
  );
  const locationOptions = useMemo(
    () => (locationTree ? flattenLocations(locationTree) : []),
    [locationTree]
  );

  const createMutation = useCreateProduct({
    onSuccess: (created) => {
      const name = created?.name;
      showToast({ message: `Producto "${name ?? 'nuevo'}" creado correctamente.`, type: 'success' });
      const imageUrl = getValues('image');
      if (created?.id && imageUrl) {
        updateImageMutation.mutate(
          { id: created.id, imageUrl },
          { onSettled: () => router.push('/products') }
        );
      } else {
        router.push('/products');
      }
    },
    onError: (err, _variables, _context) => handleApiError(err, setError, showToast, router),
  });

  const updateMutation = useUpdateProduct({
    onSuccess: () => {
      showToast({ message: 'Producto actualizado correctamente.', type: 'success' });
      const imageUrl = getValues('image');
      if (isEdit && productId && imageUrl && imageUrl !== productApi?.imageUrl) {
        updateImageMutation.mutate(
          { id: productId, imageUrl },
          { onSettled: () => router.push('/products') }
        );
      } else {
        router.push('/products');
      }
    },
    onError: (err, _variables, _context) => handleApiError(err, setError, showToast, router),
  });

  const updateImageMutation = useUpdateProductImage();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    getValues,
    formState: { errors, isDirty },
  } = useForm<FormState>({
    resolver: zodResolver(productSchema) as Resolver<FormState>,
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      currentStock: 0,
      minStock: 0,
      categoryId: '',
      locationId: '',
      hasExpiry: false,
      expiryDate: '',
      image: null,
    },
  });

  const hasExpiry = watch('hasExpiry');

  useEffect(() => {
    if (isEdit && productId && !loadingProduct && !productApi) {
      showToast({ message: 'Producto no encontrado.', type: 'error' });
      router.push('/products');
    }
  }, [isEdit, productId, loadingProduct, productApi, showToast, router]);

  useEffect(() => {
    if (!isEdit || !productApi) return;
    setValue('name', productApi.name);
    setValue('description', productApi.description ?? '');
    setValue('price', productApi.price);
    setValue('currentStock', productApi.currentStock);
    setValue('minStock', productApi.minStock);
    setValue('categoryId', productApi.categoryId ?? '');
    setValue('locationId', productApi.locationId ?? '');
    setValue('hasExpiry', productApi.hasExpiry ?? false);
    setValue('expiryDate', productApi.expiryDate ?? '');
    setValue('image', productApi.imageUrl ?? null);
  }, [isEdit, productApi, setValue]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: FormState) => {
    if (isEdit && productId) {
      updateMutation.mutate({
        id: productId,
        dto: {
          name: data.name,
          description: data.description || undefined,
          price: data.price,
          minStock: data.minStock,
          categoryId: data.categoryId,
          locationId: data.locationId || undefined,
          hasExpiry: data.hasExpiry,
          expiryDate: data.hasExpiry ? data.expiryDate || undefined : undefined,
        },
      });
    } else {
      createMutation.mutate({
        name: data.name,
        description: data.description || undefined,
        price: data.price,
        currentStock: data.currentStock ?? 0,
        minStock: data.minStock,
        categoryId: data.categoryId,
        locationId: data.locationId || undefined,
        hasExpiry: data.hasExpiry,
        expiryDate: data.hasExpiry ? data.expiryDate || undefined : undefined,
      });
    }
  };

  const handleCancel = () => {
    if (isDirty) openDiscardModal();
    else router.push('/products');
  };

  const confirmDiscard = () => {
    closeDiscardModal();
    router.push('/products');
  };

  if (isEdit && loadingProduct && !productApi) {
    return (
      <div className={styles.form}>
        <p className={styles.loadingText}>Cargando producto…</p>
      </div>
    );
  }

  if (isEdit && productId && !loadingProduct && !productApi) {
    return null; // Redirección y toast se manejan en useEffect
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      {isEdit && productApi && (
        <div className={styles.skuBanner}>
          <div className={styles.skuBannerContent}>
            <span className={styles.skuLabel}>SKU:</span>
            <Badge variant="default" className={styles.skuBadge}>
              {productApi.sku}
            </Badge>
            <span className={styles.skuHint}>
              <Info size={14} className={styles.infoIcon} aria-hidden />
              Generado automáticamente por el sistema. No editable.
            </span>
          </div>
        </div>
      )}

      <div className={styles.grid}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Información básica</h2>
          <div className={styles.fields}>
            <Input
              label="Nombre del producto"
              placeholder="Ej: Filtro de Aceite Bosch"
              {...register('name')}
              error={errors.name?.message}
            />
            <Textarea
              label="Descripción"
              placeholder="Detalles sobre compatibilidad, características, etc."
              {...register('description')}
              error={errors.description?.message}
            />
            <Input
              label="Precio"
              type="number"
              placeholder="0"
              prefixNode="$"
              {...register('price')}
              error={errors.price?.message}
            />
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Imagen del producto</h2>
            <div className={styles.fields}>
              <Controller
                control={control}
                name="image"
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.image?.message}
                  />
                )}
              />
              <p className={styles.imageHint}>
                {mode === 'create'
                  ? 'Puedes subir una imagen por URL o archivo. Se guardará al crear.'
                  : 'En edición se muestra la imagen actual. Puedes reemplazarla.'}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Clasificación</h2>
          <div className={styles.fields}>
            <Select
              label="Categoría"
              {...register('categoryId')}
              error={errors.categoryId?.message}
            >
              <option value="">Selecciona una categoría</option>
              {categoryOptions}
            </Select>

            <Select
              label="Ubicación en almacén"
              {...register('locationId')}
              error={errors.locationId?.message}
            >
              <option value="">Selecciona la ubicación (opcional)</option>
              {locationOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Inventario</h2>
          <div className={styles.fields}>
            <div className={styles.rowFields}>
              <Input
                label="Stock actual"
                type="number"
                hint={
                  isEdit
                    ? 'Solo lectura. El stock se modifica mediante movimientos de inventario.'
                    : 'Cantidad física disponible al crear el producto.'
                }
                {...register('currentStock')}
                error={errors.currentStock?.message}
                disabled={isEdit}
              />
              <Input
                label="Stock mínimo"
                type="number"
                hint="Genera alerta al llegar a este valor"
                {...register('minStock')}
                error={errors.minStock?.message}
              />
            </div>

            <div className={styles.toggleField}>
              <div className={styles.toggleText}>
                <span className={styles.toggleLabel}>Fecha de vencimiento</span>
                <span className={styles.toggleHint}>Activa para productos con fecha de vencimiento</span>
              </div>
              <Controller
                control={control}
                name="hasExpiry"
                render={({ field }) => (
                  <Switch checked={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            {hasExpiry && (
              <Input
                label="Fecha de vencimiento"
                type="date"
                {...register('expiryDate')}
                error={errors.expiryDate?.message}
              />
            )}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <Button variant="secondary" type="button" onClick={handleCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit" isLoading={isSubmitting}>
          {isEdit ? 'Guardar cambios' : 'Guardar producto'}
        </Button>
      </div>

      <Modal
        isOpen={showDiscardModal}
        onClose={closeDiscardModal}
        title="Descartar cambios"
        variant="warning"
        footer={
          <>
            <Button variant="secondary" onClick={closeDiscardModal}>
              Seguir editando
            </Button>
            <Button variant="primary" onClick={confirmDiscard}>
              Descartar
            </Button>
          </>
        }
      >
        <p>¿Estás seguro de que deseas descartar los cambios? No se guardarán las modificaciones.</p>
      </Modal>
    </form>
  );
}

function handleApiError(
  err: unknown,
  setError: (field: keyof FormState, opts: { message: string }) => void,
  showToast: (opts: { message: string; type: 'error' }) => void,
  router: ReturnType<typeof useRouter>
) {
  const axiosError = err as AxiosError<ApiErrorBody>;
  const body = axiosError.response?.data;
  const code = body?.code;
  const message = body?.message ?? 'Ha ocurrido un error. Intenta de nuevo.';

  if (code === 'VALIDATION_ERROR' && body?.errors) {
    const errors = body.errors as Record<string, string[]>;
    for (const [field, messages] of Object.entries(errors)) {
      const msg = Array.isArray(messages) ? messages[0] : String(messages);
      setError(field as keyof FormState, { message: msg });
    }
    return;
  }

  if (code === 'CONFLICT') {
    if (message.toLowerCase().includes('nombre')) setError('name', { message });
    else if (message.toLowerCase().includes('sku')) setError('name', { message });
    else showToast({ message, type: 'error' });
    return;
  }

  if (code === 'NOT_FOUND') {
    showToast({ message: 'Recurso no encontrado.', type: 'error' });
    router.push('/products');
    return;
  }

  if (code === 'BUSINESS_ERROR') {
    showToast({ message, type: 'error' });
    return;
  }

  if (axiosError.response?.status === 500 || code === 'INTERNAL_ERROR') {
    showToast({ message: 'Error del servidor. Intenta más tarde.', type: 'error' });
    return;
  }

  showToast({ message, type: 'error' });
}
