import { query, queryOne } from '../../config/database';
import { RowDataPacket } from 'mysql2';
import { GetProductsDto, UpdateProductDto, CreateProductDto } from './product.schema';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  currentStock: number;
  minStock: number;
  hasExpiry: boolean;
  expiryDate: Date | null;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  imageUrl: string | null;
  categoryId: string;
  locationId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithDetails extends Product {
  categoryName: string;
  categoryPrefix: string;
  parentCategoryName: string | null;
  locationName: string | null;
  locationCode: string | null;
}

export interface ProductStats {
  totalActive: number;
  totalInactive: number;
  totalDiscontinued: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringCount: number;
}

export class ProductRepository {
  async findAll(filters: GetProductsDto): Promise<ProductWithDetails[]> {
    const conditions: string[] = ['1=1'];
    const params: (string | number | boolean | null)[] = [];

    if (filters.search) {
      conditions.push('(p.name LIKE ? OR p.sku LIKE ? OR c.name LIKE ?)');
      const searchVal = `%${filters.search}%`;
      params.push(searchVal, searchVal, searchVal);
    }

    if (filters.categoryId) {
      conditions.push('p.category_id = ?');
      params.push(filters.categoryId);
    }

    if (filters.locationId) {
      conditions.push('p.location_id = ?');
      params.push(filters.locationId);
    }

    if (filters.status && filters.status !== 'all') {
      conditions.push('p.status = ?');
      params.push(filters.status);
    }

    if (filters.lowStock) {
      conditions.push('p.current_stock <= p.min_stock');
    }

    const limit = parseInt(String(filters.limit)) || 10;
    const page = parseInt(String(filters.page)) || 1;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT p.id, p.sku, p.name, p.description, p.price,
             p.current_stock as currentStock,
             p.min_stock as minStock,
             p.has_expiry as hasExpiry,
             p.expiry_date as expiryDate,
             p.status,
             p.image_url as imageUrl,
             p.category_id as categoryId,
             p.location_id as locationId,
             p.created_at as createdAt,
             p.updated_at as updatedAt,
             c.name as categoryName,
             c.sku_prefix as categoryPrefix,
             pc.name as parentCategoryName,
             l.name as locationName,
             l.code as locationCode
      FROM products p
      JOIN categories c  ON p.category_id = c.id
      LEFT JOIN categories pc ON c.parent_id = pc.id
      LEFT JOIN locations l   ON p.location_id = l.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const rows = await query<RowDataPacket>(sql, params);
    return rows.map(row => ({
      ...row,
      currentStock: Number(row.currentStock),
      minStock: Number(row.minStock),
      hasExpiry: Boolean(row.hasExpiry),
      price: Number(row.price),
      expiryDate: row.expiryDate ? new Date(row.expiryDate) : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    })) as ProductWithDetails[];
  }

  async count(filters: GetProductsDto): Promise<number> {
    const conditions: string[] = ['1=1'];
    const params: (string | number | boolean | null)[] = [];

    if (filters.search) {
      conditions.push('(p.name LIKE ? OR p.sku LIKE ? OR c.name LIKE ?)');
      const searchVal = `%${filters.search}%`;
      params.push(searchVal, searchVal, searchVal);
    }

    if (filters.categoryId) {
      conditions.push('p.category_id = ?');
      params.push(filters.categoryId);
    }

    if (filters.locationId) {
      conditions.push('p.location_id = ?');
      params.push(filters.locationId);
    }

    if (filters.status && filters.status !== 'all') {
      conditions.push('p.status = ?');
      params.push(filters.status);
    }

    if (filters.lowStock) {
      conditions.push('p.current_stock <= p.min_stock');
    }

    const sql = `
      SELECT COUNT(*) as total 
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE ${conditions.join(' AND ')}
    `;
    const result = await queryOne<RowDataPacket>(sql, params);
    return parseInt(String(result?.total)) || 0;
  }

  async findById(id: string): Promise<ProductWithDetails | null> {
    const sql = `
      SELECT p.id, p.sku, p.name, p.description, p.price,
             p.current_stock as currentStock,
             p.min_stock as minStock,
             p.has_expiry as hasExpiry,
             p.expiry_date as expiryDate,
             p.status,
             p.image_url as imageUrl,
             p.category_id as categoryId,
             p.location_id as locationId,
             p.created_at as createdAt,
             p.updated_at as updatedAt,
             c.name as categoryName,
             c.sku_prefix as categoryPrefix,
             pc.name as parentCategoryName,
             l.name as locationName,
             l.code as locationCode
      FROM products p
      JOIN categories c  ON p.category_id = c.id
      LEFT JOIN categories pc ON c.parent_id = pc.id
      LEFT JOIN locations l   ON p.location_id = l.id
      WHERE p.id = ?
    `;

    const row = await queryOne<RowDataPacket>(sql, [id]);
    if (!row) return null;

    return {
      ...row,
      currentStock: Number(row.currentStock),
      minStock: Number(row.minStock),
      hasExpiry: Boolean(row.hasExpiry),
      price: Number(row.price),
      expiryDate: row.expiryDate ? new Date(row.expiryDate) : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    } as ProductWithDetails;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const sql = 'SELECT * FROM products WHERE sku = ?';
    const row = await queryOne<RowDataPacket>(sql, [sku]);
    if (!row) return null;
    return {
      ...row,
      currentStock: Number(row.current_stock),
      minStock: Number(row.min_stock),
      hasExpiry: Boolean(row.has_expiry),
      price: Number(row.price),
      expiryDate: row.expiry_date ? new Date(row.expiry_date) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      imageUrl: row.image_url,
      categoryId: row.category_id,
      locationId: row.location_id
    } as Product;
  }

  async create(data: {
    id: string;
    sku: string;
    name: string;
    description: string | null;
    price: number;
    currentStock: number;
    minStock: number;
    hasExpiry: boolean;
    expiryDate: string | null;
    categoryId: string;
    locationId: string | null;
  }): Promise<void> {
    const sql = `
      INSERT INTO products
      (id, sku, name, description, price, current_stock,
       min_stock, has_expiry, expiry_date, status,
       category_id, location_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)
    `;
    await query(sql, [
      data.id, data.sku, data.name, data.description || null,
      data.price, data.currentStock, data.minStock, data.hasExpiry ? 1 : 0,
      data.expiryDate || null, data.categoryId, data.locationId || null
    ]);
  }

  async update(id: string, data: UpdateProductDto): Promise<void> {
    const fields: string[] = [];
    const params: (string | number | boolean | null)[] = [];

    const fieldMap: Record<string, string> = {
      name: 'name',
      description: 'description',
      price: 'price',
      minStock: 'min_stock',
      categoryId: 'category_id',
      locationId: 'location_id',
      hasExpiry: 'has_expiry',
      expiryDate: 'expiry_date'
    };

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && fieldMap[key]) {
        fields.push(`${fieldMap[key]} = ?`);
        params.push(key === 'hasExpiry' ? (value ? 1 : 0) : (value as any));
      }
    });

    if (fields.length === 0) return;

    const sql = `UPDATE products SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    params.push(id);

    await query(sql, params);
  }

  async updateStatus(id: string, status: string): Promise<void> {
    const sql = 'UPDATE products SET status = ?, updated_at = NOW() WHERE id = ?';
    await query(sql, [status, id]);
  }

  async updateStock(id: string, newStock: number): Promise<void> {
    const sql = 'UPDATE products SET current_stock = ?, updated_at = NOW() WHERE id = ?';
    await query(sql, [newStock, id]);
  }

  async updateImageUrl(id: string, imageUrl: string): Promise<void> {
    const sql = 'UPDATE products SET image_url = ?, updated_at = NOW() WHERE id = ?';
    await query(sql, [imageUrl, id]);
  }

  async getNextSkuSequence(categoryId: string): Promise<number> {
    const sql = 'SELECT COUNT(*) as total FROM products WHERE category_id = ?';
    const result = await queryOne<RowDataPacket>(sql, [categoryId]);
    return (parseInt(String(result?.total)) || 0) + 1;
  }

  async findExpiringProducts(daysAhead: number): Promise<Product[]> {
    const sql = `
      SELECT * FROM products
      WHERE has_expiry = 1
      AND status = 'ACTIVE'
      AND expiry_date IS NOT NULL
      AND expiry_date <= DATE_ADD(NOW(), INTERVAL ? DAY)
      AND expiry_date > NOW()
      ORDER BY expiry_date ASC
    `;
    const rows = await query<RowDataPacket>(sql, [daysAhead]);
    return rows as Product[];
  }

  async findLowStockProducts(): Promise<Product[]> {
    const sql = `
      SELECT * FROM products
      WHERE current_stock <= min_stock
      AND status = 'ACTIVE'
      ORDER BY current_stock ASC
    `;
    const rows = await query<RowDataPacket>(sql);
    return rows as Product[];
  }

  async getDashboardStats(): Promise<ProductStats> {
    const sql = `
      SELECT 
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as totalActive,
        SUM(CASE WHEN status = 'INACTIVE' THEN 1 ELSE 0 END) as totalInactive,
        SUM(CASE WHEN status = 'DISCONTINUED' THEN 1 ELSE 0 END) as totalDiscontinued,
        SUM(CASE WHEN current_stock <= min_stock AND status = 'ACTIVE' THEN 1 ELSE 0 END) as lowStockCount,
        SUM(CASE WHEN current_stock = 0 AND status = 'ACTIVE' THEN 1 ELSE 0 END) as outOfStockCount,
        SUM(CASE WHEN has_expiry = 1 AND status = 'ACTIVE' AND expiry_date <= DATE_ADD(NOW(), INTERVAL 30 DAY) AND expiry_date > NOW() THEN 1 ELSE 0 END) as expiringCount
      FROM products
    `;
    const result = await queryOne<RowDataPacket>(sql);
    return {
      totalActive: Number(result?.totalActive) || 0,
      totalInactive: Number(result?.totalInactive) || 0,
      totalDiscontinued: Number(result?.totalDiscontinued) || 0,
      lowStockCount: Number(result?.lowStockCount) || 0,
      outOfStockCount: Number(result?.outOfStockCount) || 0,
      expiringCount: Number(result?.expiringCount) || 0,
    };
  }
}
