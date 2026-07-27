import { query, queryOne } from '../../config/database';
import { RowDataPacket } from 'mysql2';
import { GetCategoriesDto, CreateCategoryDto, UpdateCategoryDto } from './category.schema';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  skuPrefix: string;
  icon: string | null;
  color: string | null;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
  productCount: number;
}

export interface CategoryWithParent extends Category {
  parentName: string | null;
  productCount: number;
}

export class CategoryRepository {
  async findAll(filters: GetCategoriesDto): Promise<CategoryWithParent[]> {
    const conditions: string[] = ['1=1'];
    const params: (string | number | boolean | null)[] = [];

    if (filters.search) {
      conditions.push('c.name LIKE ?');
      params.push(`%${filters.search}%`);
    }

    if (filters.parentId === 'null') {
      conditions.push('c.parent_id IS NULL');
      params.push(filters.parentId);
    }

    if (!filters.includeInactive) {
      conditions.push('c.is_active = 1');
    }

    const limit = parseInt(String(filters.limit)) || 10;
    const page = parseInt(String(filters.page)) || 1;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT c.id, c.name, c.description, c.sku_prefix as skuPrefix,
             c.icon, c.color, c.parent_id as parentId,
             c.created_at as createdAt, c.updated_at as updatedAt,
             p.name as parentName,
             COUNT(DISTINCT pr.id) as productCount
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN products pr ON pr.category_id = c.id
      WHERE ${conditions.join(' AND ')}
      GROUP BY c.id, c.name, c.description, c.sku_prefix,
               c.icon, c.color, c.parent_id,
               c.created_at, c.updated_at, p.name
      ORDER BY c.parent_id IS NULL DESC, p.name ASC, c.name ASC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const rows = await query<RowDataPacket>(sql, params);
    return rows.map(row => ({
      ...row,
      productCount: Number(row.productCount),
    })) as CategoryWithParent[];
  }

  async count(filters: GetCategoriesDto): Promise<number> {
    const conditions: string[] = ['1=1'];
    const params: (string | number | boolean | null)[] = [];

    if (filters.search) {
      conditions.push('c.name LIKE ?');
      params.push(`%${filters.search}%`);
    }

    if (filters.parentId === 'null') {
      conditions.push('c.parent_id IS NULL');
      params.push(filters.parentId);
    }

    if (!filters.includeInactive) {
      conditions.push('c.is_active = 1');
    }

    const sql = `SELECT COUNT(*) as total FROM categories c WHERE ${conditions.join(' AND ')}`;
    const result = await queryOne<RowDataPacket>(sql, params);
    return parseInt(String(result?.total)) || 0;
  }

  async findById(id: string): Promise<CategoryWithParent | null> {
    const sql = `
      SELECT c.id, c.name, c.description, c.sku_prefix as skuPrefix,
             c.icon, c.color, c.parent_id as parentId,
             c.created_at as createdAt, c.updated_at as updatedAt,
             p.name as parentName,
             COUNT(DISTINCT pr.id) as productCount
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN products pr ON pr.category_id = c.id
      WHERE c.id = ? AND c.is_active = 1
      GROUP BY c.id, c.name, c.description, c.sku_prefix,
               c.icon, c.color, c.parent_id,
               c.created_at, c.updated_at, p.name
    `;

    const row = await queryOne<RowDataPacket>(sql, [id]);
    if (!row) return null;

    return {
      ...row,
      productCount: Number(row.productCount),
    } as CategoryWithParent;
  }

  async findBySkuPrefix(skuPrefix: string): Promise<Category | null> {
    const sql = 'SELECT * FROM categories WHERE sku_prefix = ?';
    return queryOne<RowDataPacket>(sql, [skuPrefix]) as Promise<Category | null>;
  }

  async findTree(): Promise<CategoryWithChildren[]> {
    const sql = `
      SELECT c.id, c.name, c.description, c.sku_prefix as skuPrefix,
             c.icon, c.color, c.parent_id as parentId,
             c.created_at as createdAt, c.updated_at as updatedAt,
             (SELECT COUNT(*) FROM products pr WHERE pr.category_id = c.id AND pr.status != 'DISCONTINUED') as productCount
      FROM categories c
      WHERE c.is_active = 1
    `;
    const rows = await query<RowDataPacket>(sql);
    const categories = rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      skuPrefix: row.skuPrefix,
      icon: row.icon,
      color: row.color,
      parentId: row.parentId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      productCount: Number(row.productCount),
      children: []
    })) as CategoryWithChildren[];

    const rootCategories = categories.filter(c => !c.parentId);
    rootCategories.forEach(root => {
      root.children = categories.filter(c => c.parentId === root.id);
    });

    return rootCategories;
  }

  async create(data: CreateCategoryDto & { id: string }): Promise<void> {
    const sql = `
      INSERT INTO categories 
      (id, name, description, sku_prefix, icon, color, parent_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await query(sql, [
      data.id,
      data.name,
      data.description || null,
      data.skuPrefix,
      data.icon || null,
      data.color || null,
      data.parentId || null
    ]);
  }

  async update(id: string, data: UpdateCategoryDto): Promise<void> {
    const fields: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      params.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      params.push(data.description);
    }
    if (data.skuPrefix !== undefined) {
      fields.push('sku_prefix = ?');
      params.push(data.skuPrefix);
    }
    if (data.icon !== undefined) {
      fields.push('icon = ?');
      params.push(data.icon);
    }
    if (data.color !== undefined) {
      fields.push('color = ?');
      params.push(data.color);
    }
    if (data.parentId !== undefined) {
      fields.push('parent_id = ?');
      params.push(data.parentId);
    }

    if (fields.length === 0) return;

    fields.push('updated_at = NOW()');
    const sql = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);
    await query(sql, params);
  }

  async deactivate(id: string): Promise<void> {
    const sql = 'UPDATE categories SET is_active = 0, updated_at = NOW() WHERE id = ?';
    await query(sql, [id]);
  }

  async delete(id: string): Promise<void> {
    const sql = 'DELETE FROM categories WHERE id = ?';
    await query(sql, [id]);
  }

  async countProducts(categoryId: string): Promise<number> {
    const sql = "SELECT COUNT(*) as total FROM products WHERE category_id = ? AND status != 'DISCONTINUED'";
    const result = await queryOne<RowDataPacket>(sql, [categoryId]);
    return parseInt(String(result?.total)) || 0;
  }

  async countChildren(categoryId: string): Promise<number> {
    const sql = 'SELECT COUNT(*) as total FROM categories WHERE parent_id = ? AND is_active = 1';
    const result = await queryOne<RowDataPacket>(sql, [categoryId]);
    return parseInt(String(result?.total)) || 0;
  }

  async findLastSkuSequence(categoryId: string): Promise<number> {
    const sql = 'SELECT COUNT(*) as total FROM products WHERE category_id = ?';
    const result = await queryOne<RowDataPacket>(sql, [categoryId]);
    return parseInt(String(result?.total)) || 0;
  }
}
