import { query, queryOne } from '../../config/database';
import { RowDataPacket } from 'mysql2';
import { GetSuppliersDto, CreateSupplierDto, UpdateSupplierDto } from './supplier.schema';

export interface Supplier {
  id: string;
  legalName: string;
  tradeName: string;
  taxId: string;
  type: 'NATIONAL' | 'INTERNATIONAL' | 'MANUFACTURER' | 'DISTRIBUTOR';
  contributorType: 'LARGE' | 'COMMON' | 'SIMPLIFIED' | 'NON_CONTRIBUTOR';
  country: string;
  state: string | null;
  city: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  contactName: string | null;
  paymentTerms: string | null;
  currency: string;
  website: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierWithStats extends Supplier {
  totalMovements: number;
  totalUnits: number;
  lastPurchaseDate: Date | null;
}

export interface PurchaseHistoryItem {
  id: string;
  quantity: number;
  unitCost: number | null;
  totalCost: number | null;
  docReference: string | null;
  lotNumber: string | null;
  createdAt: Date;
  productId: string;
  productSku: string;
  productName: string;
  registeredBy: string;
}

export class SupplierRepository {
  async findAll(filters: GetSuppliersDto): Promise<SupplierWithStats[]> {
    const conditions: string[] = ['1=1'];
    const params: (string | number | boolean | null | undefined)[] = [];

    if (filters.search) {
      conditions.push('(s.legal_name LIKE ? OR s.trade_name LIKE ? OR s.tax_id LIKE ? OR s.city LIKE ?)');
      const searchVal = `%${filters.search}%`;
      params.push(searchVal, searchVal, searchVal, searchVal);
    }

    if (!filters.includeInactive) {
      conditions.push('s.is_active = 1');
    }

    if (filters.type) {
      conditions.push('s.type = ?');
      params.push(filters.type);
    }

    if (filters.contributorType) {
      conditions.push('s.contributor_type = ?');
      params.push(filters.contributorType);
    }

    if (filters.city) {
      conditions.push('s.city LIKE ?');
      params.push(`%${filters.city}%`);
    }

    const limit = parseInt(String(filters.limit)) || 10;
    const page = parseInt(String(filters.page)) || 1;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT s.id, 
             s.legal_name as legalName,
             s.trade_name as tradeName,
             s.tax_id as taxId,
             s.type,
             s.contributor_type as contributorType,
             s.country,
             s.state,
             s.city,
             s.address,
             s.phone,
             s.email,
             s.contact_name as contactName,
             s.payment_terms as paymentTerms,
             s.currency,
             s.website,
             s.notes,
             s.created_at as createdAt,
             s.updated_at as updatedAt,
             COUNT(DISTINCT m.id) as totalMovements,
             COALESCE(SUM(m.quantity), 0) as totalUnits,
             MAX(m.created_at) as lastPurchaseDate
      FROM suppliers s
      LEFT JOIN movements m ON m.supplier_id = s.id
                            AND m.type = 'PURCHASE_ENTRY'
      WHERE ${conditions.join(' AND ')}
      GROUP BY s.id
      ORDER BY s.trade_name ASC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const rows = await query<RowDataPacket>(sql, params);
    return rows.map(row => ({
      ...row,
      totalMovements: Number(row.totalMovements),
      totalUnits: Number(row.totalUnits),
      lastPurchaseDate: row.lastPurchaseDate ? new Date(row.lastPurchaseDate) : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    })) as SupplierWithStats[];
  }

  async count(filters: GetSuppliersDto): Promise<number> {
    const conditions: string[] = ['1=1'];
    const params: (string | number | boolean | null | undefined)[] = [];

    if (filters.search) {
      conditions.push('(s.legal_name LIKE ? OR s.trade_name LIKE ? OR s.tax_id LIKE ? OR s.city LIKE ?)');
      const searchVal = `%${filters.search}%`;
      params.push(searchVal, searchVal, searchVal, searchVal);
    }

    if (!filters.includeInactive) {
      conditions.push('s.is_active = 1');
    }

    if (filters.type) {
      conditions.push('s.type = ?');
      params.push(filters.type);
    }

    if (filters.contributorType) {
      conditions.push('s.contributor_type = ?');
      params.push(filters.contributorType);
    }

    if (filters.city) {
      conditions.push('s.city LIKE ?');
      params.push(`%${filters.city}%`);
    }

    const sql = `SELECT COUNT(*) as total FROM suppliers s WHERE ${conditions.join(' AND ')}`;
    const result = await queryOne<RowDataPacket>(sql, params);
    return parseInt(String(result?.total)) || 0;
  }

  async findById(id: string): Promise<SupplierWithStats | null> {
    const sql = `
      SELECT s.id, 
             s.legal_name as legalName,
             s.trade_name as tradeName,
             s.tax_id as taxId,
             s.type,
             s.contributor_type as contributorType,
             s.country,
             s.state,
             s.city,
             s.address,
             s.phone,
             s.email,
             s.contact_name as contactName,
             s.payment_terms as paymentTerms,
             s.currency,
             s.website,
             s.notes,
             s.created_at as createdAt,
             s.updated_at as updatedAt,
             COUNT(DISTINCT m.id) as totalMovements,
             COALESCE(SUM(m.quantity), 0) as totalUnits,
             MAX(m.created_at) as lastPurchaseDate
      FROM suppliers s
      LEFT JOIN movements m ON m.supplier_id = s.id
                            AND m.type = 'PURCHASE_ENTRY'
      WHERE s.id = ? AND s.is_active = 1
      GROUP BY s.id
    `;

    const row = await queryOne<RowDataPacket>(sql, [id]);
    if (!row) return null;

    return {
      ...row,
      totalMovements: Number(row.totalMovements),
      totalUnits: Number(row.totalUnits),
      lastPurchaseDate: row.lastPurchaseDate ? new Date(row.lastPurchaseDate) : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    } as SupplierWithStats;
  }

  async findByTaxId(taxId: string): Promise<Supplier | null> {
    const sql = `
      SELECT id, legal_name as legalName, trade_name as tradeName, 
             tax_id as taxId, type, contributor_type as contributorType,
             country, state, city, address, phone, email, 
             contact_name as contactName, payment_terms as paymentTerms,
             currency, website, notes, created_at as createdAt, 
             updated_at as updatedAt
      FROM suppliers 
      WHERE tax_id = ?
    `;
    const row = await queryOne<RowDataPacket>(sql, [taxId]);
    return row as Supplier | null;
  }

  async create(data: CreateSupplierDto & { id: string }): Promise<void> {
    const sql = `
      INSERT INTO suppliers (
        id, legal_name, trade_name, tax_id, type, contributor_type,
        country, state, city, address, phone, email, contact_name,
        payment_terms, currency, website, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await query(sql, [
      data.id, data.legalName, data.tradeName, data.taxId, data.type, data.contributorType,
      data.country, data.state || null, data.city, data.address || null, 
      data.phone || null, data.email || null, data.contactName || null,
      data.paymentTerms || null, data.currency, data.website || null, data.notes || null
    ]);
  }

  async update(id: string, data: UpdateSupplierDto): Promise<void> {
    const fields: string[] = [];
    const params: (string | number | boolean | null | undefined)[] = [];

    const fieldMap: Record<string, string> = {
      legalName: 'legal_name',
      tradeName: 'trade_name',
      taxId: 'tax_id',
      type: 'type',
      contributorType: 'contributor_type',
      country: 'country',
      state: 'state',
      city: 'city',
      address: 'address',
      phone: 'phone',
      email: 'email',
      contactName: 'contact_name',
      paymentTerms: 'payment_terms',
      currency: 'currency',
      website: 'website',
      notes: 'notes'
    };

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && fieldMap[key]) {
        fields.push(`${fieldMap[key]} = ?`);
        params.push(value);
      }
    });

    if (fields.length === 0) return;

    const sql = `UPDATE suppliers SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    params.push(id);

    await query(sql, params);
  }

  async deactivate(id: string): Promise<void> {
    const sql = 'UPDATE suppliers SET is_active = 0, updated_at = NOW() WHERE id = ?';
    await query(sql, [id]);
  }

  async delete(id: string): Promise<void> {
    await query('DELETE FROM suppliers WHERE id = ?', [id]);
  }

  async countMovements(supplierId: string): Promise<number> {
    const sql = "SELECT COUNT(*) as total FROM movements WHERE supplier_id = ? AND type = 'PURCHASE_ENTRY'";
    const result = await queryOne<RowDataPacket>(sql, [supplierId]);
    return parseInt(String(result?.total)) || 0;
  }

  async getPurchaseHistory(supplierId: string, filters: {
    page: number;
    limit: number;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<{ data: PurchaseHistoryItem[], total: number }> {
    const conditions: string[] = ["m.supplier_id = ?", "m.type = 'PURCHASE_ENTRY'"];
    const params: (string | number | boolean | null | undefined)[] = [supplierId];

    if (filters.dateFrom) {
      conditions.push('m.created_at >= ?');
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push('m.created_at <= ?');
      params.push(filters.dateTo);
    }
    if (filters.search) {
      conditions.push('(p.name LIKE ? OR p.sku LIKE ? OR m.doc_reference LIKE ?)');
      const searchVal = `%${filters.search}%`;
      params.push(searchVal, searchVal, searchVal);
    }

    const limit = parseInt(String(filters.limit)) || 10;
    const page = parseInt(String(filters.page)) || 1;
    const offset = (page - 1) * limit;

    const dataSql = `
      SELECT m.id, m.quantity, 
             m.unit_cost as unitCost,
             m.total_cost as totalCost,
             m.doc_reference as docReference,
             m.lot_number as lotNumber,
             m.created_at as createdAt,
             p.id as productId,
             p.sku as productSku,
             p.name as productName,
             u.full_name as registeredBy
      FROM movements m
      JOIN products p ON m.product_id = p.id
      JOIN users u ON m.user_id = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT COUNT(*) as total
      FROM movements m
      JOIN products p ON m.product_id = p.id
      WHERE ${conditions.join(' AND ')}
    `;

    const [rows, countResult] = await Promise.all([
      query<RowDataPacket>(dataSql, [...params, limit, offset]),
      queryOne<RowDataPacket>(countSql, params)
    ]);

    return {
      data: rows as PurchaseHistoryItem[],
      total: parseInt(String(countResult?.total)) || 0
    };
  }
}
