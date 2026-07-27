export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  discontinued: number;
  outOfStock: number;
  lowStock: number;
  expiringIn30Days: number;
  totalInventoryValue: number;
}

export interface MovementStats {
  totalToday: number;
  entriesToday: number;
  exitsToday: number;
  entriesThisMonth: number;
  exitsThisMonth: number;
  valueTodayMoved: number;
}

export interface AlertStats {
  total: number;
  active: number;
  activeLowStock: number;
  activeExpiry: number;
  critical: number;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  activeLastWeek: number;
}

export interface MovementByDay {
  date: string;
  entries: number;
  exits: number;
  total: number;
}

export interface StockByCategory {
  id: string;
  name: string;
  skuPrefix: string;
  productCount: number;
  totalStock: number;
  totalValue: number;
  lowStockCount: number;
}

export interface TopSupplier {
  id: string;
  tradeName: string;
  city: string;
  type: string;
  totalOrders: number;
  totalUnits: number;
  totalValue: number;
  lastPurchaseDate: string | null;
}

export interface RecentAlert {
  id: string;
  type: string;
  status: string;
  currentValue: number;
  threshold: number;
  createdAt: string;
  productName: string;
  productSku: string;
  productId: string;
}

export interface RecentProduct {
  id: string;
  sku: string;
  name: string;
  currentStock: number;
  minStock: number;
  price: number;
  status: string;
  createdAt: string;
  categoryName: string;
}

export interface DashboardKPIs {
  products: ProductStats;
  movements: MovementStats;
  alerts: AlertStats;
  users: UserStats;
}

export interface DashboardCharts {
  movementsByDay: MovementByDay[];
  stockByCategory: StockByCategory[];
  topSuppliers: TopSupplier[];
}

export interface DashboardWidgets {
  recentAlerts: RecentAlert[];
  recentProducts: RecentProduct[];
}

export interface DashboardData {
  kpis: DashboardKPIs;
  charts: DashboardCharts;
  widgets: DashboardWidgets;
}
