import { query, queryOne } from '../../config/database';
import { RowDataPacket } from 'mysql2';
import { GetAlertsDto } from './alert.schema';

export interface StockAlert {
  id: string;
  type: string;
  threshold: number;
  currentValue: number;
  status: 'ACTIVE' | 'RESOLVED' | 'DISMISSED';
  notes: string | null;
  productId: string;
  resolvedBy: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
}

export interface AlertWithDetails extends StockAlert {
  productName: string;
  productSku: string;
  categoryName: string;
  locationCode: string | null;
  locationName: string | null;
  resolvedByName: string | null;
}

export interface AlertSummary {
  total: number;
  active: number;
  resolved: number;
  dismissed: number;
  activeLowStock: number;
  activeExpiry: number;
}

export class AlertRepository {
  async findAll(filters: GetAlertsDto): Promise<AlertWithDetails[]> {
    const conditions: string[] = ['1=1'];
    const params: any[] = [];

    if (filters.productId) {
      conditions.push('sa.product_id = ?');
      params.push(filters.productId);
    }

    if (filters.type && filters.type !== 'all') {
      conditions.push('sa.type = ?');
      params.push(filters.type);
    }

    if (filters.status && filters.status !== 'all') {
      conditions.push('sa.status = ?');
      params.push(filters.status);
    }

    if (filters.dateFrom) {
      conditions.push('sa.created_at >= ?');
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      conditions.push('sa.created_at <= ?');
      params.push(filters.dateTo);
    }

    const limit = parseInt(String(filters.limit)) || 10;
    const page = parseInt(String(filters.page)) || 1;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT sa.id, sa.type, sa.threshold, sa.current_value as currentValue,
             sa.status, sa.notes, sa.product_id as productId,
             sa.resolved_by as resolvedBy,
             sa.resolved_at as resolvedAt,
             sa.created_at as createdAt,
             p.name as productName,
             p.sku as productSku,
             c.name as categoryName,
             l.code as locationCode,
             l.name as locationName,
             u.full_name as resolvedByName
      FROM stock_alerts sa
      JOIN products p    ON sa.product_id = p.id
      JOIN categories c  ON p.category_id = c.id
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN users u     ON sa.resolved_by = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY
        CASE sa.status WHEN 'ACTIVE' THEN 0 ELSE 1 END ASC,
        sa.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const rows = await query<RowDataPacket>(sql, params);
    return rows.map(row => ({
      ...row,
      threshold: Number(row.threshold),
      currentValue: Number(row.currentValue),
      resolvedAt: row.resolvedAt ? new Date(row.resolvedAt) : null,
      createdAt: new Date(row.createdAt),
    })) as AlertWithDetails[];
  }

  async count(filters: GetAlertsDto): Promise<number> {
    const conditions: string[] = ['1=1'];
    const params: any[] = [];

    if (filters.productId) {
      conditions.push('sa.product_id = ?');
      params.push(filters.productId);
    }

    if (filters.type && filters.type !== 'all') {
      conditions.push('sa.type = ?');
      params.push(filters.type);
    }

    if (filters.status && filters.status !== 'all') {
      conditions.push('sa.status = ?');
      params.push(filters.status);
    }

    if (filters.dateFrom) {
      conditions.push('sa.created_at >= ?');
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      conditions.push('sa.created_at <= ?');
      params.push(filters.dateTo);
    }

    const sql = `SELECT COUNT(*) as total FROM stock_alerts sa WHERE ${conditions.join(' AND ')}`;
    const result = await queryOne<RowDataPacket>(sql, params);
    return parseInt(String(result?.total)) || 0;
  }

  async findById(id: string): Promise<AlertWithDetails | null> {
    const sql = `
      SELECT sa.id, sa.type, sa.threshold, sa.current_value as currentValue,
             sa.status, sa.notes, sa.product_id as productId,
             sa.resolved_by as resolvedBy,
             sa.resolved_at as resolvedAt,
             sa.created_at as createdAt,
             p.name as productName,
             p.sku as productSku,
             c.name as categoryName,
             l.code as locationCode,
             l.name as locationName,
             u.full_name as resolvedByName
      FROM stock_alerts sa
      JOIN products p    ON sa.product_id = p.id
      JOIN categories c  ON p.category_id = c.id
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN users u     ON sa.resolved_by = u.id
      WHERE sa.id = ?
    `;

    const row = await queryOne<RowDataPacket>(sql, [id]);
    if (!row) return null;

    return {
      ...row,
      threshold: Number(row.threshold),
      currentValue: Number(row.currentValue),
      resolvedAt: row.resolvedAt ? new Date(row.resolvedAt) : null,
      createdAt: new Date(row.createdAt),
    } as AlertWithDetails;
  }

  async findActiveByProduct(productId: string, type: string): Promise<AlertWithDetails | null> {
    const sql = `
      SELECT sa.*, p.name as productName, p.sku as productSku, c.name as categoryName,
             l.code as locationCode, l.name as locationName, u.full_name as resolvedByName
      FROM stock_alerts sa
      JOIN products p    ON sa.product_id = p.id
      JOIN categories c  ON p.category_id = c.id
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN users u     ON sa.resolved_by = u.id
      WHERE sa.product_id = ? AND sa.type = ? AND sa.status = 'ACTIVE'
      LIMIT 1
    `;
    const row = await queryOne<RowDataPacket>(sql, [productId, type]);
    if (!row) return null;

    return {
      ...row,
      threshold: Number(row.threshold),
      currentValue: Number(row.currentValue),
      resolvedAt: row.resolvedAt ? new Date(row.resolvedAt) : null,
      createdAt: new Date(row.createdAt),
    } as AlertWithDetails;
  }

  async create(data: {
    id: string;
    type: string;
    productId: string;
    threshold: number;
    currentValue: number;
    notes: string | null;
  }): Promise<void> {
    const sql = `
      INSERT INTO stock_alerts
      (id, type, threshold, current_value, status, notes, product_id)
      VALUES (?, ?, ?, ?, 'ACTIVE', ?, ?)
    `;
    await query(sql, [
      data.id, data.type, data.threshold, data.currentValue,
      data.notes, data.productId
    ]);
  }

  async resolve(id: string, userId: string, notes?: string): Promise<void> {
    const sql = `
      UPDATE stock_alerts
      SET status = 'RESOLVED',
          resolved_by = ?,
          resolved_at = NOW(),
          notes = COALESCE(?, notes)
      WHERE id = ? AND status = 'ACTIVE'
    `;
    await query(sql, [userId, notes || null, id]);
  }

  async dismiss(id: string, userId: string, notes?: string): Promise<void> {
    const sql = `
      UPDATE stock_alerts
      SET status = 'DISMISSED',
          resolved_by = ?,
          resolved_at = NOW(),
          notes = COALESCE(?, notes)
      WHERE id = ? AND status = 'ACTIVE'
    `;
    await query(sql, [userId, notes || null, id]);
  }

  async resolveByProduct(productId: string, type: string): Promise<void> {
    const sql = `
      UPDATE stock_alerts
      SET status = 'RESOLVED', resolved_at = NOW()
      WHERE product_id = ? AND type = ? AND status = 'ACTIVE'
    `;
    await query(sql, [productId, type]);
  }

  async getSummary(): Promise<AlertSummary> {
    const sql = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'DISMISSED' THEN 1 ELSE 0 END) as dismissed,
        SUM(CASE WHEN type = 'LOW_STOCK' AND status = 'ACTIVE'
                 THEN 1 ELSE 0 END) as activeLowStock,
        SUM(CASE WHEN type LIKE 'EXPIRY%' AND status = 'ACTIVE'
                 THEN 1 ELSE 0 END) as activeExpiry
      FROM stock_alerts
    `;
    const result = await queryOne<RowDataPacket>(sql);
    return {
      total: Number(result?.total) || 0,
      active: Number(result?.active) || 0,
      resolved: Number(result?.resolved) || 0,
      dismissed: Number(result?.dismissed) || 0,
      activeLowStock: Number(result?.activeLowStock) || 0,
      activeExpiry: Number(result?.activeExpiry) || 0,
    };
  }
}
