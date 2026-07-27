'use client';

import React, { useMemo } from 'react';
import {
  Map as MapIcon,
  LayoutList,
  Plus,
  Warehouse,
  Package,
  CheckSquare,
  Search,
} from 'lucide-react';
import clsx from 'clsx';
import type { Location } from '../../types/locations.types';
import { PageWrapper } from '@/src/components/layout/PageWrapper';
import { KPICard } from '@/src/features/dashboard/components/KPICard';
import { Button } from '@/src/components/ui/Button';
import { Select } from '@/src/components/ui/Select';
import { LocationMap } from '../LocationMap/LocationMap';
import { LocationDetailDrawer } from '../LocationDetail/LocationDetailDrawer';
import { LocationFormDrawer } from '../LocationForm/LocationFormDrawer';
import { LocationList } from './LocationList';
import { useLocationsTree, useDeleteLocation } from '../../hooks/useLocations';
import { useToast } from '@/src/components/ui/Toast';
import styles from './LocationsPage.module.css';

function flattenTree(
  nodes: { id: string; productCount: number; capacity?: number | null; children: unknown[] }[]
): { productCount: number; capacity: number }[] {
  const out: { productCount: number; capacity: number }[] = [];
  const visit = (n: (typeof nodes)[0]) => {
    out.push({
      productCount: n.productCount,
      capacity: n.capacity ?? 0,
    });
    n.children.forEach((c) => visit(c as (typeof nodes)[0]));
  };
  nodes.forEach(visit);
  return out;
}

export default function LocationsPage() {
  const { showToast } = useToast();
  const [viewMode, setViewMode] = React.useState<'map' | 'list'>('map');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedLocation, setSelectedLocation] = React.useState<Location | null>(null);
  const [editingLocation, setEditingLocation] = React.useState<Location | null>(null);

  const { tree, isLoading: treeLoading, isUsingMock } = useLocationsTree();
  const deleteMutation = useDeleteLocation({
    onSuccess: () => {
      showToast({ message: 'Ubicación desactivada correctamente', type: 'success' });
      setSelectedLocation(null);
    },
    onError: (err) => {
      showToast({
        message: err?.message ?? 'No se pudo desactivar. Reasigna productos o desactiva primero las ubicaciones hijas.',
        type: 'error',
      });
    },
  });

  const stats = useMemo(() => {
    const flat = flattenTree(tree);
    const total = flat.length;
    const capacity = flat.reduce((acc, n) => acc + n.capacity, 0);
    const withProducts = flat.filter((n) => n.productCount > 0).length;
    const available = flat.filter((n) => n.productCount === 0).length;
    return { total, capacity, withProducts, available };
  }, [tree]);

  const handleEdit = (loc: Location) => {
    setEditingLocation(loc);
    setIsFormOpen(true);
    setSelectedLocation(null);
  };

  const handleNew = () => {
    setEditingLocation(null);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <PageWrapper
      title="Mapa del Almacén"
      subtitle="Gestiona las ubicaciones físicas de tu inventario"
    >
      <div className={styles.topActions}>
        <Button onClick={handleNew}>
          <Plus size={20} />
          <span>Nueva ubicación</span>
        </Button>
      </div>

      <section className={styles.summarySection} aria-label="Resumen de ubicaciones">
        <KPICard
          title="Total ubicaciones"
          value={stats.total}
          icon={<MapIcon size={22} />}
          iconColor="var(--color-primary)"
          iconBg="var(--color-primary-soft)"
        />
        <KPICard
          title="Capacidad total del almacén"
          value={stats.capacity}
          icon={<Warehouse size={22} />}
          iconColor="var(--color-info)"
          iconBg="var(--color-info-bg)"
        />
        <KPICard
          title="Ubicaciones con productos"
          value={stats.withProducts}
          icon={<Package size={22} />}
          iconColor="var(--color-success)"
          iconBg="var(--color-success-bg)"
        />
        <KPICard
          title="Ubicaciones disponibles"
          value={stats.available}
          icon={<CheckSquare size={22} />}
          iconColor="var(--color-mid)"
          iconBg="var(--color-surface-alt)"
        />
      </section>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por código o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <Select
            className={styles.typeSelect}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Todos los tipos</option>
            <option value="WAREHOUSE">Almacén</option>
            <option value="ZONE">Zonas</option>
            <option value="AISLE">Pasillos</option>
            <option value="SHELF">Estantes</option>
            <option value="CELL">Celdas</option>
          </Select>
        </div>

        <div className={styles.viewToggle}>
          <button
            type="button"
            className={clsx(styles.toggleBtn, { [styles.active]: viewMode === 'map' })}
            onClick={() => setViewMode('map')}
          >
            <MapIcon size={18} />
            <span>Vista Mapa</span>
          </button>
          <button
            type="button"
            className={clsx(styles.toggleBtn, { [styles.active]: viewMode === 'list' })}
            onClick={() => setViewMode('list')}
          >
            <LayoutList size={18} />
            <span>Vista Lista</span>
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {viewMode === 'list' && (
          <LocationList
            searchTerm={searchTerm}
            typeFilter={typeFilter}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
          />
        )}
        {viewMode === 'map' && (
          <LocationMap
            tree={tree}
            onShelfClick={setSelectedLocation}
            isLoading={treeLoading}
          />
        )}
      </div>

      <LocationDetailDrawer
        location={selectedLocation}
        tree={tree}
        onClose={() => setSelectedLocation(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
      />

      <LocationFormDrawer
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingLocation}
      />
    </PageWrapper>
  );
}
