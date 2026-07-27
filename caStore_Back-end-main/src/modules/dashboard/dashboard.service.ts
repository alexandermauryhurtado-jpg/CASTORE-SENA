import { 
  DashboardRepository, 
  ProductStats, 
  MovementStats, 
  AlertStats, 
  UserStats,
  RecentAlert,
  RecentProduct,
  MovementByDay,
  StockByCategory,
  TopSupplier
} from './dashboard.repository';

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

export class DashboardService {
  constructor(private repo: DashboardRepository = new DashboardRepository()) {}

  async getKPIs(): Promise<DashboardKPIs> {
    const [products, movements, alerts, users] = await Promise.all([
      this.repo.getProductStats(),
      this.repo.getMovementStats(),
      this.repo.getAlertStats(),
      this.repo.getUserStats()
    ]);

    return { products, movements, alerts, users };
  }

  async getCharts(): Promise<DashboardCharts> {
    const [movementsByDay, stockByCategory, topSuppliers] = await Promise.all([
      this.repo.getMovementsByDay(30),
      this.repo.getStockByCategory(),
      this.repo.getTopSuppliers(5)
    ]);

    return { movementsByDay, stockByCategory, topSuppliers };
  }

  async getWidgets(): Promise<DashboardWidgets> {
    const [recentAlerts, recentProducts] = await Promise.all([
      this.repo.getRecentAlerts(5),
      this.repo.getRecentProducts(10)
    ]);

    return { recentAlerts, recentProducts };
  }

  async getAll(): Promise<DashboardData> {
    const [kpis, charts, widgets] = await Promise.all([
      this.getKPIs(),
      this.getCharts(),
      this.getWidgets()
    ]);

    return { kpis, charts, widgets };
  }
}
