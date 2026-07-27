'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  MapPin,
  Package,
  Trash2,
  Edit3,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';
import type { Location, LocationTreeNode } from '../../types/locations.types';
import { Button } from '@/src/components/ui/Button';
import { productsService } from '@/src/services/products.service';
import { productApiToView } from '@/src/features/products/mockData';
import type { Product } from '@/src/features/products/mockData';
import styles from './LocationDetail.module.css';

interface LocationDetailDrawerProps {
  location: Location | null;
  /** Árbol para construir breadcrumb (o lista plana). Si no se pasa, el breadcrumb no se muestra completo. */
  tree?: LocationTreeNode[];
  onClose: () => void;
  onEdit: (location: Location) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

function flattenTree(nodes: LocationTreeNode[]): Map<string, LocationTreeNode> {
  const map = new Map<string, LocationTreeNode>();
  const visit = (n: LocationTreeNode) => {
    map.set(n.id, n);
    n.children.forEach(visit);
  };
  nodes.forEach(visit);
  return map;
}

function buildPathFromTree(location: Location, tree: LocationTreeNode[]): Location[] {
  const path: Location[] = [];
  const byId = flattenTree(tree);
  let current: LocationTreeNode | undefined = byId.get(location.id);
  if (!current) {
    path.push(location);
    return path;
  }
  while (current) {
    path.unshift({
      id: current.id,
      code: current.code,
      name: current.name,
      type: current.type,
      productCount: current.productCount,
      occupancyPercent: current.occupancyPercent,
      capacity: current.capacity,
      parentId: current.parentId,
    });
    const nextParentId: string | null = current.parentId ?? null;
    current = nextParentId ? byId.get(nextParentId) : undefined;
  }
  return path;
}

export function LocationDetailDrawer({
  location,
  tree = [],
  onClose,
  onEdit,
  onDelete,
  isDeleting = false,
}: LocationDetailDrawerProps) {
  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'byLocation', location?.id],
    queryFn: async () => {
      if (!location?.id) return { data: [], pagination: null };
      const res = await productsService.getProducts({
        page: 1,
        limit: 50,
        locationId: location.id,
      });
      if (!res) return { data: [] as Product[], pagination: null };
      return {
        data: res.data.map(productApiToView),
        pagination: res.pagination,
      };
    },
    enabled: !!location?.id,
  });

  const assignedProducts = productsResponse?.data ?? [];

  const path = useMemo(() => {
    if (!location) return [];
    if (tree.length > 0) {
      const flat: LocationTreeNode[] = [];
      const flatten = (nodes: LocationTreeNode[]) => {
        nodes.forEach((n) => {
          flat.push(n);
          flatten(n.children);
        });
      };
      flatten(tree);
      return buildPathFromTree(location, flat);
    }
    return [location];
  }, [location, tree]);

  if (!location) return null;

  const canDelete = (location.productCount ?? 0) === 0 && (location.childCount ?? 0) === 0;

  return (
    <div className={clsx(styles.overlay, { [styles.open]: !!location })} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <span className={styles.typeTag}>{location.type}</span>
            <h2 className={styles.code}>{location.code}</h2>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <X size={24} />
          </button>
        </header>

        <div className={styles.body}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Jerarquía de Ubicación</h3>
            <div className={styles.path}>
              {path.map((item, index) => (
                <React.Fragment key={item.id}>
                  <div className={styles.pathItem}>
                    <MapPin size={14} />
                    <span>{item.name}</span>
                  </div>
                  {index < path.length - 1 && (
                    <ChevronRight size={14} className={styles.pathDivider} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </section>

          <section className={styles.infoGrid}>
            <div className={styles.infoBox}>
              <span className={styles.infoLabel}>Nombre</span>
              <span className={styles.infoValue}>{location.name}</span>
            </div>
            <div className={styles.infoBox}>
              <span className={styles.infoLabel}>Capacidad</span>
              <span className={styles.infoValue}>{location.capacity ?? '—'} unidades</span>
            </div>
            <div className={styles.infoBox}>
              <span className={styles.infoLabel}>Ocupación</span>
              <div className={styles.occupancyBar}>
                <div
                  className={styles.occupancyFill}
                  style={{ width: `${Math.min(100, location.occupancyPercent)}%` }}
                />
              </div>
              <span className={styles.infoValue}>
                {location.occupancyPercent}% ({location.productCount} productos)
              </span>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Productos Asignados</h3>
              <span className={styles.countBadge}>
                {productsLoading ? '…' : assignedProducts.length}
              </span>
            </div>

            <div className={styles.productList}>
              {productsLoading ? (
                <p className={styles.loadingText}>Cargando productos…</p>
              ) : assignedProducts.length > 0 ? (
                assignedProducts.map((product) => (
                  <div key={product.id} className={styles.productCard}>
                    <div className={styles.productImg}>
                      <Package size={20} />
                    </div>
                    <div className={styles.productInfo}>
                      <span className={styles.productSku}>{product.sku}</span>
                      <span className={styles.productName}>{product.name}</span>
                      <span className={styles.productStock}>
                        Stock: {product.stock} un.
                      </span>
                    </div>
                    <a
                      href={`/products/${product.id}`}
                      className={styles.viewProductBtn}
                      aria-label={`Ver ${product.name}`}
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                ))
              ) : (
                <div className={styles.emptyProducts}>
                  <Package size={32} />
                  <p>No hay productos asignados a esta ubicación.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.deleteBtn}
            disabled={!canDelete || isDeleting}
            onClick={() => canDelete && onDelete(location.id)}
            title={
              (location.productCount ?? 0) > 0
                ? 'Reasigna los productos antes de desactivar esta ubicación'
                : (location.childCount ?? 0) > 0
                  ? 'Desactiva primero las ubicaciones que contiene'
                  : 'Desactivar ubicación'
            }
          >
            <Trash2 size={18} />
            <span>Desactivar ubicación</span>
            {(location.productCount ?? 0) > 0 && (
              <div className={styles.deleteTooltip}>
                Reasigna los productos antes de desactivar
              </div>
            )}
            {(location.childCount ?? 0) > 0 && (location.productCount ?? 0) === 0 && (
              <div className={styles.deleteTooltip}>
                Desactiva primero las ubicaciones que contiene
              </div>
            )}
          </button>
          <Button onClick={() => onEdit(location)}>
            <Edit3 size={18} />
            <span>Editar ubicación</span>
          </Button>
        </footer>
      </div>
    </div>
  );
}
