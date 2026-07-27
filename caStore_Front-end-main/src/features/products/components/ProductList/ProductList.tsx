'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Edit2,
  AlertCircle,
  Package,
  AlertTriangle,
  PackageX,
  DollarSign,
} from 'lucide-react';

import { PageWrapper } from '@/src/components/layout/PageWrapper';
import { KPICard } from '@/src/features/dashboard/components/KPICard';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Badge } from '@/src/components/ui/Badge';
import { Switch } from '@/src/components/ui/Switch';
import { Modal } from '@/src/components/ui/Modal';
import { useToast } from '@/src/components/ui/Toast';
import { DataTable } from '@/src/components/tables/DataTable';
import { Pagination } from '@/src/components/tables/Pagination';
import { EmptyState } from '@/src/components/common/EmptyState/EmptyState';
import { SkeletonTable } from '@/src/components/common/Skeleton/SkeletonTable';
import { MockWarning } from '@/src/components/common/MockWarning/MockWarning';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useAuth } from '@/src/hooks/useAuth';
import { formatCOP, formatDate } from '@/src/utils/format';
import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '@/src/services/categories.service';

import { useProductsList, useProductStats, useUpdateProductStatus } from '../../hooks/useProducts';
import type { Product } from '../../mockData';
import type { ProductStatus } from '../../types/products.types';
import type { CategoryTreeItem } from '@/src/features/categories/types/categories.types';

import styles from './ProductList.module.css';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

/** Aplana el árbol de categorías para un select (padre › hijo). */
function flattenCategoriesForSelect(tree: CategoryTreeItem[]): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];
  function walk(nodes: CategoryTreeItem[], parentName?: string) {
    for (const node of nodes) {
      const label = parentName ? `${parentName} › ${node.name}` : node.name;
      out.push({ id: node.id, label });
      if (node.children?.length) walk(node.children, node.name);
    }
  }
  walk(tree);
  return out;
}

export default function ProductList() {
  const router = useRouter();
  const { showToast } = useToast();
  const { canCreate } = useAuth();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'>('all');
  const [categoryId, setCategoryId] = useState<string>('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [productToToggle, setProductToToggle] = useState<Product | null>(null);

  const { data: categoryTree } = useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: () => categoriesService.getTree(),
  });
  const categoryOptions = useMemo(
    () => (categoryTree ? flattenCategoriesForSelect(categoryTree) : []),
    [categoryTree]
  );

  const { data, pagination, isLoading, isFetching, isUsingMock, refetch } = useProductsList({
    page,
    limit: pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter === 'all' ? 'all' : statusFilter,
    categoryId: categoryId || undefined,
    lowStock: lowStockOnly || undefined,
  });

  const { stats, isLoading: statsLoading } = useProductStats();

  const updateStatusMutation = useUpdateProductStatus({
    onSuccess: (_data, variables) => {
      const msg =
        variables.status === 'ACTIVE'
          ? 'Producto activado correctamente.'
          : variables.status === 'INACTIVE'
            ? 'Producto desactivado correctamente.'
            : 'Producto marcado como descontinuado correctamente.';
      showToast({ message: msg, type: 'success' });
      setProductToToggle(null);
    },
    onError: () => {
      showToast({ message: 'Error al cambiar el estado del producto.', type: 'error' });
    },
  });

  const handleToggleClick = (product: Product) => {
    setProductToToggle(product);
  };

  const confirmToggle = () => {
    if (!productToToggle) return;
    if (productToToggle.status === 'discontinued') {
      showToast({
        message: 'No se puede cambiar el estado de un producto descontinuado.',
        type: 'error',
      });
      setProductToToggle(null);
      return;
    }
    const newStatus: ProductStatus =
      productToToggle.status === 'active' ? 'INACTIVE' : 'ACTIVE';
    updateStatusMutation.mutate({ id: productToToggle.id, status: newStatus });
  };

  const columns = [
    {
      key: 'sku',
      header: 'SKU',
      render: (item: Product) => <span className={styles.skuText}>{item.sku}</span>,
    },
    {
      key: 'name',
      header: 'Producto',
      render: (item: Product) => (
        <div className={styles.productCell}>
          <img src={item.image} alt="" className={styles.productImg} />
          <span className={styles.productName}>{item.name}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Categoría',
      render: (item: Product) => (
        <span className={styles.categoryText}>
          {item.parentCategoryName ? `${item.parentCategoryName} › ` : ''}
          {item.categoryName}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Fecha de creación',
      render: (item: Product) => formatDate(item.createdAt),
    },
    {
      key: 'price',
      header: 'Precio',
      render: (item: Product) => formatCOP(item.price),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (item: Product) => {
        if (item.stock === 0) {
          return (
            <div className={styles.stockCell}>
              <span className={styles.stockZero}>{item.stock}</span>
              <Badge variant="inactive">Sin stock</Badge>
            </div>
          );
        }
        if (item.stock < item.minStock) {
          return (
            <div className={styles.stockCell}>
              <span className={styles.stockLow}>{item.stock}</span>
              <Badge variant="warning">Stock bajo</Badge>
            </div>
          );
        }
        return <span className={styles.stockOk}>{item.stock}</span>;
      },
    },
    {
      key: 'status',
      header: 'Estado',
      render: (item: Product) => (
        <Switch
          checked={item.status === 'active'}
          onChange={() => handleToggleClick(item)}
          disabled={item.status === 'discontinued' || updateStatusMutation.isPending}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (item: Product) => (
        <div className={styles.actionsCell}>
          <Link href={`/products/${item.id}`} passHref legacyBehavior>
            <Button variant="secondary" className={styles.iconBtn} aria-label="Editar">
              <Edit2 size={16} />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const totalCount = pagination?.total ?? 0;
  const emptyStateNode = (
    <EmptyState
      title="Sin productos registrados"
      message="Aún no hay productos en el inventario o no coinciden con la búsqueda."
      action={
        canCreate('products')
          ? { label: 'Agregar producto', onClick: () => router.push('/products/new') }
          : undefined
      }
    />
  );

  return (
    <PageWrapper
      title="Gestión de Productos"
      subtitle="Administra el inventario de repuestos y accesorios automotrices."
      actions={
        canCreate('products') ? (
          <Link href="/products/new" passHref legacyBehavior>
            <Button variant="primary">
              <Plus size={16} />
              Agregar producto
            </Button>
          </Link>
        ) : null
      }
    >
      {isUsingMock && <MockWarning />}

      <section className={styles.statsSection} aria-label="Estadísticas de productos">
        <KPICard
          title="Total productos activos"
          value={stats.totalActive}
          icon={<Package size={22} />}
          iconColor="var(--color-primary)"
          iconBg="var(--color-primary-soft)"
          isLoading={statsLoading}
        />
        <KPICard
          title="Productos sin stock"
          value={stats.outOfStockCount}
          icon={<PackageX size={22} />}
          iconColor="var(--color-error)"
          iconBg="var(--color-error-bg)"
          isLoading={statsLoading}
        />
        <KPICard
          title="Stock bajo"
          value={stats.lowStockCount}
          icon={<AlertTriangle size={22} />}
          iconColor="var(--color-warning)"
          iconBg="var(--color-warning-bg)"
          isLoading={statsLoading}
        />
        <KPICard
          title="Valor total del inventario"
          value={stats.totalValue != null ? formatCOP(stats.totalValue) : '—'}
          icon={<DollarSign size={22} />}
          iconColor="var(--color-success)"
          iconBg="var(--color-success-bg)"
          isLoading={statsLoading}
        />
      </section>

      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <Input
            placeholder="Buscar por nombre, SKU o categoría..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filtersWrap}>
          <select
            className={styles.statusSelect}
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            aria-label="Filtrar por categoría"
          >
            <option value="">Todas las categorías</option>
            {categoryOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            className={styles.statusSelect}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as typeof statusFilter);
              setPage(1);
            }}
            aria-label="Filtrar por estado"
          >
            <option value="all">Todos los estados</option>
            <option value="ACTIVE">Activo</option>
            <option value="INACTIVE">Inactivo</option>
            <option value="DISCONTINUED">Descontinuado</option>
          </select>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => {
                setLowStockOnly(e.target.checked);
                setPage(1);
              }}
            />
            Stock bajo
          </label>
          <span className={styles.resultsCount}>
            {pagination
              ? `Mostrando ${pagination.from}-${pagination.to} de ${totalCount} productos`
              : isLoading
                ? '...'
                : '0 productos'}
          </span>
        </div>
      </div>

      {isLoading && data.length === 0 ? (
        <SkeletonTable rows={6} columns={8} />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          loading={isFetching}
          emptyState={emptyStateNode}
        />
      )}

      {!isLoading && pagination && totalCount > 0 && (
        <Pagination
          currentPage={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
        />
      )}

      <Modal
        isOpen={!!productToToggle}
        onClose={() => setProductToToggle(null)}
        title="Confirmar cambio de estado"
        variant="warning"
        footer={
          <>
            <Button variant="secondary" onClick={() => setProductToToggle(null)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={confirmToggle}
              disabled={updateStatusMutation.isPending}
              isLoading={updateStatusMutation.isPending}
            >
              Confirmar
            </Button>
          </>
        }
      >
        <div className={styles.modalContent}>
          <AlertCircle size={24} className={styles.modalIcon} aria-hidden />
          <p>
            ¿Estás seguro de que deseas{' '}
            <strong>
              {productToToggle?.status === 'active' ? 'desactivar' : 'activar'}
            </strong>{' '}
            el producto <strong>{productToToggle?.name}</strong>?
          </p>
        </div>
      </Modal>
    </PageWrapper>
  );
}
