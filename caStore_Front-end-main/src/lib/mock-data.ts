import { DashboardData } from '../features/dashboard/types/dashboard.types';

// --- MOCK ROLES ---
export const MOCK_ROLES = [
  { id: 'role-1', name: 'Administrador', permissions: { all: { read: true, create: true, update: true, delete: true } } },
  { id: 'role-2', name: 'Supervisor', permissions: { products: { read: true, create: true, update: true, delete: false } } },
  { id: 'role-3', name: 'Operador', permissions: { movements: { read: true, create: true, update: false, delete: false } } },
];

// --- MOCK USERS ---
export const MOCK_USERS = [
  { id: 'user-1', fullName: 'Carlos Rodríguez', email: 'carlos.admin@castore.co', roleName: 'Administrador', status: 'ACTIVE' },
  { id: 'user-2', fullName: 'Juan Pérez', email: 'juan.supervisor@castore.co', roleName: 'Supervisor', status: 'ACTIVE' },
  { id: 'user-3', fullName: 'Andrés Gómez', email: 'andres.ops@castore.co', roleName: 'Operador', status: 'ACTIVE' },
  { id: 'user-4', fullName: 'Martha Lucía', email: 'martha.ops@castore.co', roleName: 'Operador', status: 'ACTIVE' },
  { id: 'user-5', fullName: 'Roberto Casas', email: 'roberto@castore.com', roleName: 'Supervisor', status: 'ACTIVE' },
];

// --- MOCK CATEGORIES ---
export const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'Motor', skuPrefix: 'FILT', productCount: 120 },
  { id: 'cat-2', name: 'Frenos', skuPrefix: 'FREN', productCount: 85 },
  { id: 'cat-3', name: 'Suspensión', skuPrefix: 'SUSP', productCount: 64 },
  { id: 'cat-4', name: 'Eléctrico', skuPrefix: 'ELEC', productCount: 45 },
  { id: 'cat-5', name: 'Accesorios', skuPrefix: 'ACC', productCount: 30 },
];

// --- MOCK PRODUCTS ---
export const MOCK_PRODUCTS = [
  { id: 'prod-1', sku: 'MFIL-00001', name: 'Filtro Aceite Bosch', currentStock: 45, minStock: 20, price: 35000, status: 'ACTIVE', categoryName: 'Motor' },
  { id: 'prod-2', sku: 'SAMO-00001', name: 'Amortiguador Monroe', currentStock: 8, minStock: 10, price: 185000, status: 'ACTIVE', categoryName: 'Suspensión' },
  { id: 'prod-3', sku: 'EBAT-00001', name: 'Batería Bosch 12V', currentStock: 15, minStock: 5, price: 450000, status: 'ACTIVE', categoryName: 'Eléctrico' },
  { id: 'prod-4', sku: 'FPAST-00001', name: 'Pastillas Freno Brembo', currentStock: 24, minStock: 15, price: 210000, status: 'ACTIVE', categoryName: 'Frenos' },
  { id: 'prod-5', sku: 'MLUB-00001', name: 'Aceite Mobil 1 5W-30', currentStock: 0, minStock: 12, price: 145000, status: 'ACTIVE', categoryName: 'Motor' },
];

// --- MOCK ALERTS ---
export const MOCK_ALERTS = [
  { id: 'alt-1', type: 'LOW_STOCK', status: 'ACTIVE', currentValue: 8, threshold: 10, productId: 'prod-2', productName: 'Amortiguador Monroe', productSku: 'SAMO-00001', createdAt: new Date().toISOString() },
  { id: 'alt-2', type: 'OUT_OF_STOCK', status: 'ACTIVE', currentValue: 0, threshold: 12, productId: 'prod-5', productName: 'Aceite Mobil 1 5W-30', productSku: 'MLUB-00001', createdAt: new Date().toISOString() },
  { id: 'alt-3', type: 'EXPIRY_7D', status: 'ACTIVE', currentValue: 7, threshold: 30, productId: 'prod-6', productName: 'Liquido Frenos DOT4', productSku: 'FLIQ-00001', createdAt: new Date().toISOString() },
];

// --- MOCK MOVEMENTS ---
export const MOCK_MOVEMENTS = [
  { id: 'mov-1', type: 'PURCHASE_ENTRY', quantity: 50, productId: 'prod-1', productName: 'Filtro Aceite Bosch', userFullName: 'Juan Pérez', createdAt: new Date().toISOString() },
  { id: 'mov-2', type: 'SALE_EXIT', quantity: 2, productId: 'prod-4', productName: 'Pastillas Freno Brembo', userFullName: 'Andrés Gómez', createdAt: new Date().toISOString() },
];

// --- MOCK SUPPLIERS ---
export const MOCK_SUPPLIERS = [
  { id: 'sup-1', tradeName: 'Bosch Colombia', nit: '860002143-5', contactName: 'Carlos Rodríguez', email: 'contacto@bosch.com.co', phone: '(601) 658 5000', city: 'Bogotá', type: 'MANUFACTURER' as const, status: 'ACTIVE' as const },
  { id: 'sup-2', tradeName: 'Monroe Andina', nit: '900354122-8', contactName: 'Andrea Ospina', email: 'ventas@monroe.co', phone: '(604) 444 1234', city: 'Medellín', type: 'DISTRIBUTOR' as const, status: 'ACTIVE' as const },
  { id: 'sup-3', tradeName: 'Filtros Fram Colombia', nit: '800123456-1', contactName: 'Ricardo Velez', email: 'info@fram.com.co', phone: '(602) 664 7788', city: 'Cali', type: 'MANUFACTURER' as const, status: 'ACTIVE' as const },
];

// --- MOCK LOCATIONS ---
export const MOCK_LOCATIONS = [
  { id: 'loc-1', name: 'Almacén Principal', type: 'WAREHOUSE', status: 'ACTIVE' },
  { id: 'loc-2', name: 'Zona A', type: 'ZONE', status: 'ACTIVE' },
  { id: 'loc-3', name: 'Zona B', type: 'ZONE', status: 'ACTIVE' },
  { id: 'loc-4', name: 'Pasillo 1', type: 'AISLE', status: 'ACTIVE' },
  { id: 'loc-5', name: 'Estante 1', type: 'SHELF', status: 'ACTIVE' },
];

// --- MOCK DASHBOARD ---
export const MOCK_DASHBOARD: DashboardData = {
  kpis: {
    products: {
      total: 150,
      active: 145,
      inactive: 5,
      discontinued: 0,
      outOfStock: 3,
      lowStock: 12,
      expiringIn30Days: 8,
      totalInventoryValue: 45200000
    },
    movements: {
      totalToday: 24,
      entriesToday: 15,
      exitsToday: 9,
      entriesThisMonth: 340,
      exitsThisMonth: 280,
      valueTodayMoved: 12450000
    },
    alerts: {
      total: 25,
      active: 7,
      activeLowStock: 5,
      activeExpiry: 2,
      critical: 3
    },
    users: {
      total: 12,
      active: 10,
      inactive: 2,
      activeLastWeek: 8
    }
  },
  charts: {
    movementsByDay: [
      { date: '2024-03-08', entries: 12, exits: 8, total: 20 },
      { date: '2024-03-09', entries: 15, exits: 10, total: 25 },
      { date: '2024-03-10', entries: 8, exits: 12, total: 20 },
      { date: '2024-03-11', entries: 20, exits: 5, total: 25 },
      { date: '2024-03-12', entries: 18, exits: 14, total: 32 },
      { date: '2024-03-13', entries: 10, exits: 18, total: 28 },
      { date: '2024-03-14', entries: 25, exits: 9, total: 34 },
    ],
    stockByCategory: [
      { id: '1', name: 'Motor', skuPrefix: 'FILT', productCount: 45, totalStock: 850, totalValue: 12000000, lowStockCount: 2 },
      { id: '2', name: 'Suspensión', skuPrefix: 'SUSP', productCount: 30, totalStock: 420, totalValue: 15000000, lowStockCount: 4 },
      { id: '3', name: 'Frenos', skuPrefix: 'FREN', productCount: 25, totalStock: 310, totalValue: 8000000, lowStockCount: 1 },
      { id: '4', name: 'Eléctrico', skuPrefix: 'ELEC', productCount: 20, totalStock: 150, totalValue: 6000000, lowStockCount: 3 },
      { id: '5', name: 'Accesorios', skuPrefix: 'ACC', productCount: 30, totalStock: 500, totalValue: 4200000, lowStockCount: 0 },
    ],
    topSuppliers: [
      { id: '1', tradeName: 'Bosch Colombia', city: 'Bogotá', type: 'MANUFACTURER', totalOrders: 45, totalUnits: 1200, totalValue: 25000000, lastPurchaseDate: '2024-03-10' },
      { id: '2', tradeName: 'Monroe Andina', city: 'Medellín', type: 'DISTRIBUTOR', totalOrders: 32, totalUnits: 800, totalValue: 18000000, lastPurchaseDate: '2024-03-12' },
    ]
  },
  widgets: {
    recentAlerts: [
      { id: '1', type: 'LOW_STOCK', status: 'ACTIVE', currentValue: 8, threshold: 10, productName: 'Amortiguador Monroe', productSku: 'SAMO-00001', productId: 'p1', createdAt: '2024-03-14T10:00:00Z' },
      { id: '2', type: 'OUT_OF_STOCK', status: 'ACTIVE', currentValue: 0, threshold: 5, productName: 'Aceite Mobil 1', productSku: 'MLUB-00001', productId: 'p2', createdAt: '2024-03-14T11:20:00Z' },
    ],
    recentProducts: [
      { id: '1', name: 'Filtro Aire Premium', sku: 'MFIL-00050', currentStock: 100, minStock: 20, price: 45000, status: 'ACTIVE', createdAt: '2024-03-14T09:00:00Z', categoryName: 'Motor' },
      { id: '2', name: 'Disco Freno Trasero', sku: 'FDIS-00102', currentStock: 12, minStock: 4, price: 165000, status: 'ACTIVE', createdAt: '2024-03-13T15:30:00Z', categoryName: 'Frenos' },
    ]
  }
};
