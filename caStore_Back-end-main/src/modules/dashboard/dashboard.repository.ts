import { query, queryOne } from '../../config/database';
import { RowDataPacket } from 'mysql2';

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

export interface RecentAlert {
  id: string;
  type: string;
  status: string;
  currentValue: number;
  threshold: number;
  createdAt: Date;
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
  createdAt: Date;
  categoryName: string;
}

export interface MovementByDay {
  date: Date;
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
  lastPurchaseDate: Date | null;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  activeLastWeek: number;
}

export class DashboardRepository {
  async getProductStats(): Promise<ProductStats> {
    const sql = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'INACTIVE' THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN status = 'DISCONTINUED' THEN 1 ELSE 0 END) as discontinued,
        SUM(CASE WHEN current_stock = 0 AND status = 'ACTIVE' THEN 1 ELSE 0 END) as outOfStock,
        SUM(CASE WHEN current_stock <= min_stock AND current_stock > 0 AND status = 'ACTIVE' THEN 1 ELSE 0 END) as lowStock,
        SUM(CASE WHEN has_expiry = 1 AND expiry_date <= DATE_ADD(NOW(), INTERVAL 30 DAY) AND expiry_date > NOW() AND status = 'ACTIVE' THEN 1 ELSE 0 END) as expiringIn30Days,
        COALESCE(SUM(current_stock * price), 0) as totalInventoryValue
      FROM products
    `;

    const result = await queryOne<RowDataPacket>(sql);
    return {
      total: Number(result?.total) || 0,
      active: Number(result?.active) || 0,
      inactive: Number(result?.inactive) || 0,
      discontinued: Number(result?.discontinued) || 0,
      outOfStock: Number(result?.outOfStock) || 0,
      lowStock: Number(result?.lowStock) || 0,
      expiringIn30Days: Number(result?.expiringIn30Days) || 0,
      totalInventoryValue: Number(result?.totalInventoryValue) || 0
    };
  }

  async getMovementStats(): Promise<MovementStats> {
    const sql = `
      SELECT
        COUNT(*) as totalToday,
        SUM(CASE WHEN type IN ('PURCHASE_ENTRY','POSITIVE_ADJUSTMENT','RETURN') AND DATE(created_at) = CURDATE() THEN quantity ELSE 0 END) as entriesToday,
        SUM(CASE WHEN type IN ('SALE_EXIT','NEGATIVE_ADJUSTMENT') AND DATE(created_at) = CURDATE() THEN quantity ELSE 0 END) as exitsToday,
        SUM(CASE WHEN type IN ('PURCHASE_ENTRY','POSITIVE_ADJUSTMENT','RETURN') AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW()) THEN quantity ELSE 0 END) as entriesThisMonth,
        SUM(CASE WHEN type IN ('SALE_EXIT','NEGATIVE_ADJUSTMENT') AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW()) THEN quantity ELSE 0 END) as exitsThisMonth,
        COALESCE(SUM(CASE WHEN DATE(created_at) = CURDATE() THEN total_cost ELSE 0 END), 0) as valueTodayMoved
      FROM movements
      WHERE DATE(created_at) = CURDATE()
         OR (MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW()))
    `;

    const result = await queryOne<RowDataPacket>(sql);
    return {
      totalToday: Number(result?.totalToday) || 0,
      entriesToday: Number(result?.entriesToday) || 0,
      exitsToday: Number(result?.exitsToday) || 0,
      entriesThisMonth: Number(result?.entriesThisMonth) || 0,
      exitsThisMonth: Number(result?.exitsThisMonth) || 0,
      valueTodayMoved: Number(result?.valueTodayMoved) || 0
    };
  }

  async getAlertStats(): Promise<AlertStats> {
    const sql = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'ACTIVE' AND type = 'LOW_STOCK' THEN 1 ELSE 0 END) as activeLowStock,
        SUM(CASE WHEN status = 'ACTIVE' AND type LIKE 'EXPIRY%' THEN 1 ELSE 0 END) as activeExpiry,
        SUM(CASE WHEN status = 'ACTIVE' AND (type = 'EXPIRY_7D' OR (type = 'LOW_STOCK' AND current_value = 0)) THEN 1 ELSE 0 END) as critical
      FROM stock_alerts
    `;
    const result = await queryOne<RowDataPacket>(sql);
    return {
      total: Number(result?.total) || 0,
      active: Number(result?.active) || 0,
      activeLowStock: Number(result?.activeLowStock) || 0,
      activeExpiry: Number(result?.activeExpiry) || 0,
      critical: Number(result?.critical) || 0
    };
  }

  async getRecentAlerts(limit: number): Promise<RecentAlert[]> {
    const sql = `
      SELECT sa.id, sa.type, sa.status,
             sa.current_value as currentValue,
             sa.threshold, sa.created_at as createdAt,
             p.name as productName,
             p.sku as productSku,
             p.id as productId
      FROM stock_alerts sa
      JOIN products p ON sa.product_id = p.id
      WHERE sa.status = 'ACTIVE'
      ORDER BY sa.created_at DESC
      LIMIT ?
    `;
    const rows = await query<RowDataPacket>(sql, [limit]);
    return rows.map(row => ({
      ...row,
      currentValue: Number(row.currentValue),
      threshold: Number(row.threshold),
      createdAt: new Date(row.createdAt)
    })) as RecentAlert[];
  }

  async getRecentProducts(limit: number): Promise<RecentProduct[]> {
    const sql = `
      SELECT p.id, p.sku, p.name, p.current_stock as currentStock,
             p.min_stock as minStock, p.price, p.status,
             p.created_at as createdAt,
             c.name as categoryName
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
      LIMIT ?
    `;
    const rows = await query<RowDataPacket>(sql, [limit]);
    return rows.map(row => ({
      ...row,
      currentStock: Number(row.currentStock),
      minStock: Number(row.minStock),
      price: Number(row.price),
      createdAt: new Date(row.createdAt)
    })) as RecentProduct[];
  }

  async getMovementsByDay(days: number): Promise<MovementByDay[]> {
    const sql = `
      SELECT
        DATE(created_at) as date,
        SUM(CASE WHEN type IN ('PURCHASE_ENTRY','POSITIVE_ADJUSTMENT','RETURN') THEN quantity ELSE 0 END) as entries,
        SUM(CASE WHEN type IN ('SALE_EXIT','NEGATIVE_ADJUSTMENT') THEN quantity ELSE 0 END) as exits,
        COUNT(*) as total
      FROM movements
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    const rows = await query<RowDataPacket>(sql, [days]);
    return rows.map(row => ({
      date: new Date(row.date),
      entries: Number(row.entries),
      exits: Number(row.exits),
      total: Number(row.total)
    }));
  }

  async getStockByCategory(): Promise<StockByCategory[]> {
    const sql = `
      SELECT c.id, c.name, c.sku_prefix as skuPrefix,
             COUNT(p.id) as productCount,
             COALESCE(SUM(p.current_stock), 0) as totalStock,
             COALESCE(SUM(p.current_stock * p.price), 0) as totalValue,
             SUM(CASE WHEN p.current_stock <= p.min_stock AND p.status = 'ACTIVE' THEN 1 ELSE 0 END) as lowStockCount
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
                           AND p.status = 'ACTIVE'
      WHERE c.parent_id IS NULL
      AND c.is_active = 1
      GROUP BY c.id, c.name, c.sku_prefix
      ORDER BY totalValue DESC
    `;
    const rows = await query<RowDataPacket>(sql);
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      skuPrefix: row.skuPrefix,
      productCount: Number(row.productCount),
      totalStock: Number(row.totalStock),
      totalValue: Number(row.totalValue),
      lowStockCount: Number(row.lowStockCount)
    }));
  }

  async getTopSuppliers(limit: number): Promise<TopSupplier[]> {
    const sql = `
      SELECT s.id, s.trade_name as tradeName,
             s.city, s.type,
             COUNT(DISTINCT m.id) as totalOrders,
             COALESCE(SUM(m.quantity), 0) as totalUnits,
             COALESCE(SUM(m.total_cost), 0) as totalValue,
             MAX(m.created_at) as lastPurchaseDate
      FROM suppliers s
      JOIN movements m ON m.supplier_id = s.id
                       AND m.type = 'PURCHASE_ENTRY'
      WHERE s.is_active = 1
      GROUP BY s.id, s.trade_name, s.city, s.type
      ORDER BY totalValue DESC
      LIMIT ?
    `;
    const rows = await query<RowDataPacket>(sql, [limit]);
    return rows.map(row => ({
      id: row.id,
      tradeName: row.tradeName,
      city: row.city,
      type: row.type,
      totalOrders: Number(row.totalOrders),
      totalUnits: Number(row.totalUnits),
      totalValue: Number(row.totalValue),
      lastPurchaseDate: row.lastPurchaseDate ? new Date(row.lastPurchaseDate) : null
    }));
  }

  async getUserStats(): Promise<UserStats> {
    const sql = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN last_login_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as activeLastWeek
      FROM users
    `;
    const result = await queryOne<RowDataPacket>(sql);
    return {
      total: Number(result?.total) || 0,
      active: Number(result?.active) || 0,
      inactive: Number(result?.inactive) || 0,
      activeLastWeek: Number(result?.activeLastWeek) || 0
    };
  }
}
