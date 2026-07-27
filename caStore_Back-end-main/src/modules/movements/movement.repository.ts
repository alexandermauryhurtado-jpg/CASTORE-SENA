import { query, queryOne } from '../../config/database';
import { RowDataPacket } from 'mysql2';
import { GetMovementsDto, KardexDto } from './movement.schema';

export interface Movement {
  id: string;
  type: string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  lotNumber: string | null;
  docReference: string | null;
  notes: string | null;
  unitCost: number | null;
  totalCost: number | null;
  productId: string;
  userId: string;
  supplierId: string | null;
  fromLocationId: string | null;
  toLocationId: string | null;
  createdAt: Date;
}

export interface MovementWithDetails extends Movement {
  productName: string;
  productSku: string;
  categoryName: string;
  supplierName: string | null;
  fromLocationCode: string | null;
  fromLocationName: string | null;
  toLocationCode: string | null;
  toLocationName: string | null;
  registeredBy: string;
}

export interface KardexItem {
  date: Date;
  type: string;
  docReference: string | null;
  lotNumber: string | null;
  entries: number;
  exits: number;
  balance: number;
  unitCost: number | null;
  totalCost: number | null;
  balanceValue: number | null;
  registeredBy: string;
}

export interface DailySummaryItem {
  date: Date;
  totalEntries: number;
  totalExits: number;
  totalMovements: number;
}

export class MovementRepository {
  async findAll(filters: GetMovementsDto): Promise<MovementWithDetails[]> {
    const conditions: string[] = ['1=1'];
    const params: any[] = [];

    if (filters.search) {
      conditions.push('(p.name LIKE ? OR p.sku LIKE ? OR m.doc_reference LIKE ?)');
      const searchVal = `%${filters.search}%`;
      params.push(searchVal, searchVal, searchVal);
    }

    if (filters.productId) {
      conditions.push('m.product_id = ?');
      params.push(filters.productId);
    }

    if (filters.type && filters.type !== 'all') {
      conditions.push('m.type = ?');
      params.push(filters.type);
    }

    if (filters.supplierId) {
      conditions.push('m.supplier_id = ?');
      params.push(filters.supplierId);
    }

    if (filters.userId) {
      conditions.push('m.user_id = ?');
      params.push(filters.userId);
    }

    if (filters.dateFrom) {
      conditions.push('m.created_at >= ?');
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      conditions.push('m.created_at <= ?');
      params.push(filters.dateTo);
    }

    const limit = parseInt(String(filters.limit)) || 10;
    const page = parseInt(String(filters.page)) || 1;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT m.id, m.type, m.quantity,
             m.stock_before as stockBefore,
             m.stock_after as stockAfter,
             m.lot_number as lotNumber,
             m.doc_reference as docReference,
             m.notes, m.unit_cost as unitCost,
             m.total_cost as totalCost,
             m.product_id as productId,
             m.user_id as userId,
             m.supplier_id as supplierId,
             m.from_location_id as fromLocationId,
             m.to_location_id as toLocationId,
             m.created_at as createdAt,
             p.name as productName,
             p.sku as productSku,
             c.name as categoryName,
             s.trade_name as supplierName,
             fl.code as fromLocationCode,
             fl.name as fromLocationName,
             tl.code as toLocationCode,
             tl.name as toLocationName,
             u.full_name as registeredBy
      FROM movements m
      JOIN products p   ON m.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN users u      ON m.user_id = u.id
      LEFT JOIN suppliers s  ON m.supplier_id = s.id
      LEFT JOIN locations fl ON m.from_location_id = fl.id
      LEFT JOIN locations tl ON m.to_location_id = tl.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const rows = await query<RowDataPacket>(sql, params);
    return rows.map(row => ({
      ...row,
      quantity: Number(row.quantity),
      stockBefore: Number(row.stockBefore),
      stockAfter: Number(row.stockAfter),
      unitCost: row.unitCost ? Number(row.unitCost) : null,
      totalCost: row.totalCost ? Number(row.totalCost) : null,
      createdAt: new Date(row.createdAt),
    })) as MovementWithDetails[];
  }

  async count(filters: GetMovementsDto): Promise<number> {
    const conditions: string[] = ['1=1'];
    const params: any[] = [];

    if (filters.search) {
      conditions.push('(p.name LIKE ? OR p.sku LIKE ? OR m.doc_reference LIKE ?)');
      const searchVal = `%${filters.search}%`;
      params.push(searchVal, searchVal, searchVal);
    }

    if (filters.productId) {
      conditions.push('m.product_id = ?');
      params.push(filters.productId);
    }

    if (filters.type && filters.type !== 'all') {
      conditions.push('m.type = ?');
      params.push(filters.type);
    }

    if (filters.supplierId) {
      conditions.push('m.supplier_id = ?');
      params.push(filters.supplierId);
    }

    if (filters.userId) {
      conditions.push('m.user_id = ?');
      params.push(filters.userId);
    }

    if (filters.dateFrom) {
      conditions.push('m.created_at >= ?');
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      conditions.push('m.created_at <= ?');
      params.push(filters.dateTo);
    }

    const sql = `
      SELECT COUNT(*) as total
      FROM movements m
      JOIN products p ON m.product_id = p.id
      WHERE ${conditions.join(' AND ')}
    `;
    const result = await queryOne<RowDataPacket>(sql, params);
    return parseInt(String(result?.total)) || 0;
  }

  async findById(id: string): Promise<MovementWithDetails | null> {
    const sql = `
      SELECT m.id, m.type, m.quantity,
             m.stock_before as stockBefore,
             m.stock_after as stockAfter,
             m.lot_number as lotNumber,
             m.doc_reference as docReference,
             m.notes, m.unit_cost as unitCost,
             m.total_cost as totalCost,
             m.product_id as productId,
             m.user_id as userId,
             m.supplier_id as supplierId,
             m.from_location_id as fromLocationId,
             m.to_location_id as toLocationId,
             m.created_at as createdAt,
             p.name as productName,
             p.sku as productSku,
             c.name as categoryName,
             s.trade_name as supplierName,
             fl.code as fromLocationCode,
             fl.name as fromLocationName,
             tl.code as toLocationCode,
             tl.name as toLocationName,
             u.full_name as registeredBy
      FROM movements m
      JOIN products p   ON m.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN users u      ON m.user_id = u.id
      LEFT JOIN suppliers s  ON m.supplier_id = s.id
      LEFT JOIN locations fl ON m.from_location_id = fl.id
      LEFT JOIN locations tl ON m.to_location_id = tl.id
      WHERE m.id = ?
    `;

    const row = await queryOne<RowDataPacket>(sql, [id]);
    if (!row) return null;

    return {
      ...row,
      quantity: Number(row.quantity),
      stockBefore: Number(row.stockBefore),
      stockAfter: Number(row.stockAfter),
      unitCost: row.unitCost ? Number(row.unitCost) : null,
      totalCost: row.totalCost ? Number(row.totalCost) : null,
      createdAt: new Date(row.createdAt),
    } as MovementWithDetails;
  }

  async create(data: {
    id: string;
    type: string;
    quantity: number;
    stockBefore: number;
    stockAfter: number;
    lotNumber: string | null;
    docReference: string | null;
    notes: string | null;
    unitCost: number | null;
    totalCost: number | null;
    productId: string;
    userId: string;
    supplierId: string | null;
    fromLocationId: string | null;
    toLocationId: string | null;
    createdAt?: string;
  }): Promise<void> {
    const sql = `
      INSERT INTO movements
      (id, type, quantity, stock_before, stock_after, lot_number,
       doc_reference, notes, unit_cost, total_cost, product_id,
       user_id, supplier_id, from_location_id, to_location_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${data.createdAt ? '?' : 'NOW()'})
    `;
    const params = [
      data.id, data.type, data.quantity, data.stockBefore, data.stockAfter,
      data.lotNumber, data.docReference, data.notes, data.unitCost, data.totalCost,
      data.productId, data.userId, data.supplierId, data.fromLocationId, data.toLocationId
    ];
    if (data.createdAt) {
      params.push(data.createdAt);
    }

    await query(sql, params);
  }

  async getKardex(filters: KardexDto): Promise<{
    data: KardexItem[];
    total: number;
    initialStock: number;
    finalStock: number;
    totalEntries: number;
    totalExits: number;
  }> {
    const conditions = ['m.product_id = ?'];
    const params: any[] = [filters.productId];

    if (filters.dateFrom) {
      conditions.push('m.created_at >= ?');
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push('m.created_at <= ?');
      params.push(filters.dateTo);
    }

    const limit = parseInt(String(filters.limit)) || 10;
    const page = parseInt(String(filters.page)) || 1;
    const offset = (page - 1) * limit;

    const sqlData = `
      SELECT m.created_at as date,
             m.type,
             m.doc_reference as docReference,
             m.lot_number as lotNumber,
             CASE WHEN m.type IN ('PURCHASE_ENTRY','POSITIVE_ADJUSTMENT','RETURN')
                  THEN m.quantity ELSE 0 END as entries,
             CASE WHEN m.type IN ('SALE_EXIT','NEGATIVE_ADJUSTMENT','TRANSFER')
                  THEN m.quantity ELSE 0 END as exits,
             m.stock_after as balance,
             m.unit_cost as unitCost,
             m.total_cost as totalCost,
             u.full_name as registeredBy
      FROM movements m
      JOIN users u ON m.user_id = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY m.created_at ASC
      LIMIT ? OFFSET ?
    `;

    const sqlStats = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN m.type IN ('PURCHASE_ENTRY','POSITIVE_ADJUSTMENT','RETURN')
                 THEN m.quantity ELSE 0 END) as totalEntries,
        SUM(CASE WHEN m.type IN ('SALE_EXIT','NEGATIVE_ADJUSTMENT','TRANSFER')
                 THEN m.quantity ELSE 0 END) as totalExits,
        (SELECT stock_before FROM movements 
         WHERE product_id = ? ${filters.dateFrom ? 'AND created_at >= ?' : ''} 
         ORDER BY created_at ASC LIMIT 1) as initialStock,
        (SELECT stock_after FROM movements 
         WHERE product_id = ? ${filters.dateTo ? 'AND created_at <= ?' : ''} 
         ORDER BY created_at DESC LIMIT 1) as finalStock
      FROM movements m
      WHERE ${conditions.join(' AND ')}
    `;

    const statsParams = [filters.productId];
    if (filters.dateFrom) statsParams.push(filters.dateFrom);
    statsParams.push(filters.productId);
    if (filters.dateTo) statsParams.push(filters.dateTo);
    statsParams.push(...params);

    const [rows, stats] = await Promise.all([
      query<RowDataPacket>(sqlData, [...params, limit, offset]),
      queryOne<RowDataPacket>(sqlStats, statsParams)
    ]);

    const data = rows.map(row => ({
      ...row,
      date: new Date(row.date),
      entries: Number(row.entries),
      exits: Number(row.exits),
      balance: Number(row.balance),
      unitCost: row.unitCost ? Number(row.unitCost) : null,
      totalCost: row.totalCost ? Number(row.totalCost) : null,
      balanceValue: (row.unit_cost && row.balance) ? Number(row.unitCost) * Number(row.balance) : null
    })) as KardexItem[];

    return {
      data,
      total: parseInt(String(stats?.total)) || 0,
      initialStock: parseInt(String(stats?.initialStock)) || 0,
      finalStock: parseInt(String(stats?.finalStock)) || 0,
      totalEntries: parseInt(String(stats?.totalEntries)) || 0,
      totalExits: parseInt(String(stats?.totalExits)) || 0,
    };
  }

  async getDailySummary(days: number): Promise<DailySummaryItem[]> {
    const sql = `
      SELECT DATE(m.created_at) as date,
             SUM(CASE WHEN m.type IN ('PURCHASE_ENTRY','POSITIVE_ADJUSTMENT','RETURN')
                      THEN m.quantity ELSE 0 END) as totalEntries,
             SUM(CASE WHEN m.type IN ('SALE_EXIT','NEGATIVE_ADJUSTMENT')
                      THEN m.quantity ELSE 0 END) as totalExits,
             COUNT(*) as totalMovements
      FROM movements m
      WHERE m.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(m.created_at)
      ORDER BY date ASC
    `;
    const rows = await query<RowDataPacket>(sql, [days]);
    return rows.map(row => ({
      date: new Date(row.date),
      totalEntries: Number(row.totalEntries),
      totalExits: Number(row.totalExits),
      totalMovements: Number(row.totalMovements),
    }));
  }

  async getTodaySummary(): Promise<{
    totalMovements: number;
    totalEntries: number;
    totalExits: number;
    totalValue: number;
  }> {
    const sql = `
      SELECT COUNT(*) as totalMovements,
        SUM(CASE WHEN type IN ('PURCHASE_ENTRY','POSITIVE_ADJUSTMENT','RETURN')
                 THEN quantity ELSE 0 END) as totalEntries,
        SUM(CASE WHEN type IN ('SALE_EXIT','NEGATIVE_ADJUSTMENT')
                 THEN quantity ELSE 0 END) as totalExits,
        COALESCE(SUM(total_cost),0) as totalValue
      FROM movements
      WHERE DATE(created_at) = CURDATE()
    `;
    const result = await queryOne<RowDataPacket>(sql);
    return {
      totalMovements: Number(result?.totalMovements) || 0,
      totalEntries: Number(result?.totalEntries) || 0,
      totalExits: Number(result?.totalExits) || 0,
      totalValue: Number(result?.totalValue) || 0,
    };
  }
}
