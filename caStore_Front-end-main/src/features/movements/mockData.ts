export type MovementType = 
  | 'purchase_entry' 
  | 'sale_exit' 
  | 'transfer' 
  | 'adjustment_pos' 
  | 'adjustment_neg' 
  | 'return';

export interface Movement {
  id: string;
  type: MovementType;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  originLocation?: string;
  destLocation?: string;
  documentRef: string;
  userId: string;
  userName: string;
  providerId?: string;
  providerName?: string;
  lotNumber?: string;
  observations?: string;
  createdAt: string;
}

// Helper to generate dates in the last 30 days
const getDateAgo = (days: number, hours: number = 10) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
};

export const mockMovements: Movement[] = [
  {
    id: 'mov-00000001',
    type: 'purchase_entry',
    productId: 'prod-1',
    productName: 'Aceite de Motor 5W-30',
    sku: 'MOT-ACE-001',
    quantity: 50,
    destLocation: 'A-15',
    documentRef: 'FAC-2024-001',
    userId: 'user-1',
    userName: 'Juan Pérez',
    providerId: 'prov-1',
    providerName: 'Lubricantes S.A.',
    lotNumber: 'LT-8892',
    observations: 'Ingreso mensual por compra mayorista.',
    createdAt: getDateAgo(25, 9),
  },
  {
    id: 'mov-00000002',
    type: 'sale_exit',
    productId: 'prod-1',
    productName: 'Aceite de Motor 5W-30',
    sku: 'MOT-ACE-001',
    quantity: 4,
    originLocation: 'A-15',
    documentRef: 'VEN-5501',
    userId: 'user-2',
    userName: 'Maria Garcia',
    observations: 'Venta mostrador.',
    createdAt: getDateAgo(24, 11),
  },
  {
    id: 'mov-00000003',
    type: 'transfer',
    productId: 'prod-2',
    productName: 'Pastillas de Freno Delanteras',
    sku: 'FRE-PAS-002',
    quantity: 10,
    originLocation: 'B-02',
    destLocation: 'A-05',
    documentRef: 'TRF-102',
    userId: 'user-1',
    userName: 'Juan Pérez',
    observations: 'Reubicación para despacho rápido.',
    createdAt: getDateAgo(22, 14),
  },
  {
    id: 'mov-00000004',
    type: 'adjustment_pos',
    productId: 'prod-5',
    productName: 'Bujía Iridium Power',
    sku: 'MOT-BUJ-005',
    quantity: 2,
    destLocation: 'C-01',
    documentRef: 'ADJ-202',
    userId: 'user-1',
    userName: 'Juan Pérez',
    observations: 'Encontrado durante conteo cíclico.',
    createdAt: getDateAgo(20, 16),
  },
  {
    id: 'mov-00000005',
    type: 'adjustment_neg',
    productId: 'prod-3',
    productName: 'Filtro de Aire Premium',
    sku: 'MOT-FIL-003',
    quantity: 1,
    originLocation: 'A-10',
    documentRef: 'ADJ-203',
    userId: 'user-2',
    userName: 'Maria Garcia',
    observations: 'Producto con empaque dañado, merma.',
    createdAt: getDateAgo(18, 10),
  },
  {
    id: 'mov-00000006',
    type: 'return',
    productId: 'prod-4',
    productName: 'Amortiguador Hidráulico',
    sku: 'SUS-AMO-004',
    quantity: 2,
    destLocation: 'B-12',
    documentRef: 'DEV-882',
    userId: 'user-1',
    userName: 'Juan Pérez',
    observations: 'Devolución de cliente por error en referencia.',
    createdAt: getDateAgo(15, 12),
  },
  {
    id: 'mov-00000007',
    type: 'purchase_entry',
    productId: 'prod-2',
    productName: 'Pastillas de Freno Delanteras',
    sku: 'FRE-PAS-002',
    quantity: 24,
    destLocation: 'A-05',
    documentRef: 'FAC-2024-045',
    userId: 'user-1',
    userName: 'Juan Pérez',
    providerId: 'prov-2',
    providerName: 'Frenos Seguros Ltda.',
    lotNumber: 'LT-FRE-01',
    createdAt: getDateAgo(12, 15),
  },
  {
    id: 'mov-00000008',
    type: 'sale_exit',
    productId: 'prod-5',
    productName: 'Bujía Iridium Power',
    sku: 'MOT-BUJ-005',
    quantity: 12,
    originLocation: 'C-01',
    documentRef: 'VEN-5602',
    userId: 'user-1',
    userName: 'Juan Pérez',
    createdAt: getDateAgo(10, 17),
  },
  {
    id: 'mov-00000009',
    type: 'transfer',
    productId: 'prod-1',
    productName: 'Aceite de Motor 5W-30',
    sku: 'MOT-ACE-001',
    quantity: 20,
    originLocation: 'A-15',
    destLocation: 'EXPO-1',
    documentRef: 'TRF-105',
    userId: 'user-2',
    userName: 'Maria Garcia',
    observations: 'Movimiento a zona de exhibición.',
    createdAt: getDateAgo(8, 9),
  },
  {
    id: 'mov-00000010',
    type: 'sale_exit',
    productId: 'prod-3',
    productName: 'Filtro de Aire Premium',
    sku: 'MOT-FIL-003',
    quantity: 15,
    originLocation: 'A-10',
    documentRef: 'VEN-5700',
    userId: 'user-2',
    userName: 'Maria Garcia',
    createdAt: getDateAgo(5, 11),
  },
  {
    id: 'mov-00000011',
    type: 'purchase_entry',
    productId: 'prod-4',
    productName: 'Amortiguador Hidráulico',
    sku: 'SUS-AMO-004',
    quantity: 20,
    destLocation: 'B-12',
    documentRef: 'FAC-2024-089',
    userId: 'user-1',
    userName: 'Juan Pérez',
    providerId: 'prov-3',
    providerName: 'Suspensiones Global',
    lotNumber: 'LT-AMO-22',
    createdAt: getDateAgo(3, 13),
  },
  {
    id: 'mov-00000012',
    type: 'adjustment_neg',
    productId: 'prod-2',
    productName: 'Pastillas de Freno Delanteras',
    sku: 'FRE-PAS-002',
    quantity: 2,
    originLocation: 'A-05',
    documentRef: 'ADJ-205',
    userId: 'user-1',
    userName: 'Juan Pérez',
    observations: 'Error en despacho anterior, ajuste manual.',
    createdAt: getDateAgo(1, 10),
  },
  // Adding more entries to reach ~30 for pagination testing
  ...Array.from({ length: 18 }).map((_, i) => ({
    id: `mov-000000${i + 13}`,
    type: (i % 3 === 0 ? 'sale_exit' : i % 3 === 1 ? 'purchase_entry' : 'transfer') as MovementType,
    productId: `prod-${(i % 5) + 1}`,
    productName: ['Aceite', 'Pastillas', 'Filtro', 'Amortiguador', 'Bujía'][i % 5] + ' Mod ' + i,
    sku: ['MOT', 'FRE', 'MOT', 'SUS', 'MOT'][i % 5] + '-SKU-' + i,
    quantity: Math.floor(Math.random() * 20) + 1,
    originLocation: 'A-01',
    destLocation: 'B-01',
    documentRef: `DOC-${1000 + i}`,
    userId: 'user-1',
    userName: 'Juan Pérez',
    createdAt: getDateAgo(Math.floor(i / 2), 11 + (i % 5)),
  }))
];
