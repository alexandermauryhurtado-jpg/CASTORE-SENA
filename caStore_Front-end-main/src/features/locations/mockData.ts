import type { Location, LocationTreeNode } from './types/locations.types';

export type { Location, LocationTreeNode, LocationType } from './types/locations.types';

export const mockLocations: Location[] = [
  // WAREHOUSE
  { id: 'loc-0', code: 'ALM-01', name: 'Almacén Principal', type: 'WAREHOUSE', productCount: 45, capacity: 500, occupancyPercent: 9 },

  // ZONES
  { id: 'loc-1', parentId: 'loc-0', code: 'ZA-01', name: 'Zona A', type: 'ZONE', productCount: 15, capacity: 100, occupancyPercent: 15 },
  { id: 'loc-2', parentId: 'loc-0', code: 'ZB-01', name: 'Zona B', type: 'ZONE', productCount: 12, capacity: 100, occupancyPercent: 12 },
  { id: 'loc-3', parentId: 'loc-0', code: 'ZC-01', name: 'Zona C', type: 'ZONE', productCount: 8, capacity: 100, occupancyPercent: 8 },
  { id: 'loc-4', parentId: 'loc-0', code: 'ZD-01', name: 'Zona D', type: 'ZONE', productCount: 10, capacity: 100, occupancyPercent: 10 },

  // AISLES
  { id: 'loc-1-1', parentId: 'loc-1', code: 'ZA-P1', name: 'Pasillo 1', type: 'AISLE', productCount: 10, capacity: 50, occupancyPercent: 20 },
  { id: 'loc-1-2', parentId: 'loc-1', code: 'ZA-P2', name: 'Pasillo 2', type: 'AISLE', productCount: 5, capacity: 50, occupancyPercent: 10 },
  { id: 'loc-2-1', parentId: 'loc-2', code: 'ZB-P1', name: 'Pasillo 1', type: 'AISLE', productCount: 8, capacity: 50, occupancyPercent: 16 },
  { id: 'loc-2-2', parentId: 'loc-2', code: 'ZB-P2', name: 'Pasillo 2', type: 'AISLE', productCount: 4, capacity: 50, occupancyPercent: 8 },
  { id: 'loc-3-1', parentId: 'loc-3', code: 'ZC-P1', name: 'Pasillo 1', type: 'AISLE', productCount: 8, capacity: 50, occupancyPercent: 16 },
  { id: 'loc-4-1', parentId: 'loc-4', code: 'ZD-P1', name: 'Pasillo 1', type: 'AISLE', productCount: 10, capacity: 50, occupancyPercent: 20 },

  // SHELVES
  { id: 'loc-1-1-1', parentId: 'loc-1-1', code: 'ZA-P1-E1', name: 'Estante 1', type: 'SHELF', productCount: 6, capacity: 10, occupancyPercent: 60 },
  { id: 'loc-1-1-2', parentId: 'loc-1-1', code: 'ZA-P1-E2', name: 'Estante 2', type: 'SHELF', productCount: 4, capacity: 10, occupancyPercent: 40 },
  { id: 'loc-1-2-1', parentId: 'loc-1-2', code: 'ZA-P2-E1', name: 'Estante 1', type: 'SHELF', productCount: 5, capacity: 10, occupancyPercent: 50 },
  { id: 'loc-2-1-1', parentId: 'loc-2-1', code: 'ZB-P1-E1', name: 'Estante 1', type: 'SHELF', productCount: 5, capacity: 10, occupancyPercent: 50 },
  { id: 'loc-2-1-2', parentId: 'loc-2-1', code: 'ZB-P1-E2', name: 'Estante 2', type: 'SHELF', productCount: 3, capacity: 10, occupancyPercent: 30 },
  { id: 'loc-3-1-1', parentId: 'loc-3-1', code: 'ZC-P1-E1', name: 'Estante 1', type: 'SHELF', productCount: 8, capacity: 10, occupancyPercent: 80 },
  { id: 'loc-4-1-1', parentId: 'loc-4-1', code: 'ZD-P1-E1', name: 'Estante 1', type: 'SHELF', productCount: 10, capacity: 10, occupancyPercent: 100 },
];

/** Construye árbol de ubicaciones desde la lista plana (para fallback mock). */
function buildMockTree(parentId: string | null | undefined, list: Location[]): LocationTreeNode[] {
  return list
    .filter((l) => (l.parentId ?? null) === parentId)
    .map((loc) => ({
      ...loc,
      children: buildMockTree(loc.id, list),
    }));
}

/** Árbol de ubicaciones para mapa/selectores cuando la API falla. */
export const mockLocationsTree: LocationTreeNode[] = buildMockTree(null, mockLocations);
