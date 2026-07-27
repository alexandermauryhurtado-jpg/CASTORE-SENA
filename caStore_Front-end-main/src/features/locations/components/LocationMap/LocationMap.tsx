'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Maximize2,
  Box as BoxIcon,
} from 'lucide-react';
import clsx from 'clsx';
import type { Location, LocationTreeNode } from '../../types/locations.types';
import styles from './LocationMap.module.css';

interface MapZone {
  id: string;
  code: string;
  name: string;
  type: string;
  productCount: number;
  capacity?: number;
  occupancyPercent: number;
  aisles: MapAisle[];
}

interface MapAisle {
  id: string;
  code: string;
  name: string;
  type: string;
  productCount: number;
  capacity?: number;
  occupancyPercent: number;
  shelves: Location[];
}

interface LocationMapProps {
  /** Árbol desde GET /locations/tree (o mock). */
  tree: LocationTreeNode[];
  onShelfClick: (location: Location) => void;
  isLoading?: boolean;
}

/** Convierte árbol API a estructura warehouse → zones → aisles → shelves para el mapa. */
function treeToMapHierarchy(nodes: LocationTreeNode[]): { warehouse: LocationTreeNode; zones: MapZone[] } | null {
  const warehouse = nodes.find((n) => n.type === 'WAREHOUSE');
  if (!warehouse) return null;

  const zones: MapZone[] = warehouse.children.map((z) => ({
    id: z.id,
    code: z.code,
    name: z.name,
    type: z.type,
    productCount: z.productCount,
    capacity: z.capacity ?? undefined,
    occupancyPercent: z.occupancyPercent,
    aisles: z.children.map((a) => ({
      id: a.id,
      code: a.code,
      name: a.name,
      type: a.type,
      productCount: a.productCount,
      capacity: a.capacity ?? undefined,
      occupancyPercent: a.occupancyPercent,
      shelves: a.children.filter((s) => s.type === 'SHELF' || s.type === 'CELL') as Location[],
    })),
  }));

  return { warehouse, zones };
}

export function LocationMap({ tree, onShelfClick, isLoading }: LocationMapProps) {
  const [collapsedZones, setCollapsedZones] = useState<Set<string>>(new Set());

  const hierarchy = useMemo(() => treeToMapHierarchy(tree), [tree]);

  const toggleZone = (id: string) => {
    setCollapsedZones((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className={styles.mapContainer}>
        <div className={styles.warehouseHeader}>
          <div className={styles.skeletonLine} style={{ width: 200, height: 24 }} />
          <div className={styles.skeletonLine} style={{ width: 120, height: 16 }} />
        </div>
        <div className={styles.zonesGrid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.zoneBlock} style={{ minHeight: 80 }}>
              <div className={styles.skeletonLine} style={{ width: '60%', height: 20, margin: 16 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!hierarchy) {
    return (
      <div className={styles.mapContainer}>
        <p className={styles.emptyMap}>No hay almacén configurado. Crea una ubicación tipo Almacén.</p>
      </div>
    );
  }

  const { warehouse, zones } = hierarchy;

  return (
    <div className={styles.mapContainer}>
      <header className={styles.warehouseHeader}>
        <div className={styles.warehouseInfo}>
          <h2 className={styles.warehouseName}>{warehouse.name}</h2>
          <span className={styles.warehouseCode}>{warehouse.code}</span>
        </div>
        <div className={styles.minimap}>
          {zones.map((z) => (
            <div
              key={z.id}
              className={clsx(styles.miniZone, styles[`zoneColorMini_${z.code.split('-')[0]}`] as string)}
              title={z.name}
            />
          ))}
        </div>
      </header>

      <div className={styles.zonesGrid}>
        {zones.map((zone) => {
          const isCollapsed = collapsedZones.has(zone.id);
          const zonePrefix = zone.code.split('-')[0];

          return (
            <div
              key={zone.id}
              className={clsx(
                styles.zoneBlock,
                (styles as Record<string, string>)[`zoneBg_${zonePrefix}`],
                { [styles.collapsed]: isCollapsed }
              )}
            >
              <header className={styles.zoneHeader} onClick={() => toggleZone(zone.id)}>
                <div className={styles.zoneTitleRow}>
                  <span className={styles.zoneCode}>{zone.code}</span>
                  <h3 className={styles.zoneName}>{zone.name}</h3>
                  <button type="button" className={styles.collapseBtn} aria-label={isCollapsed ? 'Expandir' : 'Colapsar'}>
                    {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                  </button>
                </div>

                <div className={styles.zoneOccupancy}>
                  <div className={styles.occupancyText}>
                    <span>Ocupación: {zone.occupancyPercent}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={clsx(styles.progressFill, {
                        [styles.bgRed]: zone.occupancyPercent > 90,
                        [styles.bgYellow]: zone.occupancyPercent > 70 && zone.occupancyPercent <= 90,
                        [styles.bgGreen]: zone.occupancyPercent <= 70,
                      })}
                      style={{ width: `${Math.min(100, zone.occupancyPercent)}%` }}
                    />
                  </div>
                </div>
              </header>

              {!isCollapsed && (
                <div className={styles.zoneContent}>
                  {zone.aisles.map((aisle) => (
                    <div key={aisle.id} className={styles.aisleCol}>
                      <span className={styles.aisleLabel}>{aisle.code}</span>
                      <div className={styles.shelvesList}>
                        {aisle.shelves.map((shelf) => (
                          <div
                            key={shelf.id}
                            className={clsx(styles.shelfBox, { [styles.empty]: shelf.productCount === 0 })}
                            onClick={() => onShelfClick(shelf)}
                            onKeyDown={(e) => e.key === 'Enter' && onShelfClick(shelf)}
                            role="button"
                            tabIndex={0}
                          >
                            <div className={styles.shelfCode}>{shelf.code.split('-').pop()}</div>
                            <div className={styles.shelfOccupancy}>
                              <div
                                className={clsx(styles.occupancyIndicator, {
                                  [styles.dotRed]: shelf.occupancyPercent >= 90,
                                  [styles.dotYellow]: shelf.occupancyPercent >= 70 && shelf.occupancyPercent < 90,
                                  [styles.dotGreen]: shelf.occupancyPercent < 70 && shelf.productCount > 0,
                                  [styles.dotGray]: shelf.productCount === 0,
                                })}
                              />
                              <span>{shelf.productCount}/{shelf.capacity ?? '—'}</span>
                            </div>

                            <div className={styles.tooltip}>
                              <div className={styles.tooltipHeader}>
                                <strong>{shelf.name}</strong>
                                <code>{shelf.code}</code>
                              </div>
                              <div className={styles.tooltipContent}>
                                <div className={styles.tooltipItem}>
                                  <Maximize2 size={12} />
                                  <span>Capacidad: {shelf.capacity ?? '—'}</span>
                                </div>
                                <div className={styles.tooltipItem}>
                                  <BoxIcon size={12} />
                                  <span>Productos: {shelf.productCount}</span>
                                </div>
                              </div>
                              <div className={styles.tooltipFooter}>
                                <span className={styles.tooltipBtnPrimary}>Ver detalle</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
