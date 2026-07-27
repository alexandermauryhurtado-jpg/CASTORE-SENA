import { query, queryOne } from '../../config/database';
import { RowDataPacket } from 'mysql2';
import { GetLocationsDto, CreateLocationDto, UpdateLocationDto } from './location.schema';

export interface Location {
  id: string;
  code: string;
  name: string;
  type: 'WAREHOUSE' | 'ZONE' | 'AISLE' | 'SHELF' | 'CELL';
  capacity: number | null;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationWithDetails extends Location {
  parentName: string | null;
  parentCode: string | null;
  productCount: number;
  childCount: number;
  occupancy: number;
}

export interface LocationTree extends Location {
  children: LocationTree[];
  productCount: number;
  occupancy: number;
}

export class LocationRepository {
  async findAll(filters: GetLocationsDto): Promise<LocationWithDetails[]> {
    const conditions: string[] = ['1=1'];
    const params: (string | number | boolean | null)[] = [];

    if (filters.search) {
      conditions.push('(l.name LIKE ? OR l.code LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.type) {
      conditions.push('l.type = ?');
      params.push(filters.type);
    }

    if (filters.parentId === 'null') {
      conditions.push('l.parent_id IS NULL');
      conditions.push('l.parent_id = ?');
      params.push(filters.parentId);
    }

    if (!filters.includeInactive) {
      conditions.push('l.is_active = 1');
    }

    const limit = parseInt(String(filters.limit)) || 10;
    const page = parseInt(String(filters.page)) || 1;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT l.id, l.code, l.name, l.type, l.capacity,
             l.parent_id as parentId,
             l.created_at as createdAt,
             l.updated_at as updatedAt,
             p.name as parentName,
             p.code as parentCode,
             COUNT(DISTINCT pr.id) as productCount,
             COUNT(DISTINCT ch.id) as childCount
      FROM locations l
      LEFT JOIN locations p  ON l.parent_id = p.id
      LEFT JOIN products pr  ON pr.location_id = l.id
      LEFT JOIN locations ch ON ch.parent_id = l.id
      WHERE ${conditions.join(' AND ')}
      GROUP BY l.id, l.code, l.name, l.type, l.capacity,
               l.parent_id, l.created_at, l.updated_at,
               p.name, p.code
      ORDER BY l.type ASC, l.code ASC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const rows = await query<RowDataPacket>(sql, params);
    
    return rows.map(row => {
      const productCount = Number(row.productCount);
      const capacity = row.capacity ? Number(row.capacity) : 0;
      const occupancy = capacity > 0 ? (productCount / capacity) * 100 : 0;
      
      return {
        ...row,
        productCount,
        childCount: Number(row.childCount),
        occupancy: Number(occupancy.toFixed(2)),
      };
    }) as LocationWithDetails[];
  }

  async count(filters: GetLocationsDto): Promise<number> {
    const conditions: string[] = ['1=1'];
    const params: (string | number | boolean | null)[] = [];

    if (filters.search) {
      conditions.push('(l.name LIKE ? OR l.code LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.type) {
      conditions.push('l.type = ?');
      params.push(filters.type);
    }

    if (filters.parentId === 'null') {
      conditions.push('l.parent_id IS NULL');
      conditions.push('l.parent_id = ?');
      params.push(filters.parentId);
    }

    if (!filters.includeInactive) {
      conditions.push('l.is_active = 1');
    }

    const sql = `SELECT COUNT(*) as total FROM locations l WHERE ${conditions.join(' AND ')}`;
    const result = await queryOne<RowDataPacket>(sql, params);
    return parseInt(String(result?.total)) || 0;
  }

  async findById(id: string): Promise<LocationWithDetails | null> {
    const sql = `
      SELECT l.id, l.code, l.name, l.type, l.capacity,
             l.parent_id as parentId,
             l.created_at as createdAt,
             l.updated_at as updatedAt,
             p.name as parentName,
             p.code as parentCode,
             COUNT(DISTINCT pr.id) as productCount,
             COUNT(DISTINCT ch.id) as childCount
      FROM locations l
      LEFT JOIN locations p  ON l.parent_id = p.id
      LEFT JOIN products pr  ON pr.location_id = l.id
      LEFT JOIN locations ch ON ch.parent_id = l.id
      WHERE l.id = ? AND l.is_active = 1
      GROUP BY l.id, l.code, l.name, l.type, l.capacity,
               l.parent_id, l.created_at, l.updated_at,
               p.name, p.code
    `;

    const row = await queryOne<RowDataPacket>(sql, [id]);
    if (!row) return null;

    const productCount = Number(row.productCount);
    const capacity = row.capacity ? Number(row.capacity) : 0;
    const occupancy = capacity > 0 ? (productCount / capacity) * 100 : 0;

    return {
      ...row,
      productCount,
      childCount: Number(row.childCount),
      occupancy: Number(occupancy.toFixed(2)),
    } as LocationWithDetails;
  }

  async findByCode(code: string): Promise<Location | null> {
    const sql = 'SELECT * FROM locations WHERE code = ?';
    return queryOne<RowDataPacket>(sql, [code]) as Promise<Location | null>;
  }

  async findTree(): Promise<LocationTree[]> {
    const sql = `
      SELECT l.id, l.code, l.name, l.type, l.capacity,
             l.parent_id as parentId,
             l.created_at as createdAt,
             l.updated_at as updatedAt,
             (SELECT COUNT(*) FROM products pr WHERE pr.location_id = l.id AND pr.status != 'DISCONTINUED') as productCount
      FROM locations l
      WHERE l.is_active = 1
    `;
    const rows = await query<RowDataPacket>(sql);
    
    const locations = rows.map(row => {
      const productCount = Number(row.productCount);
      const capacity = row.capacity ? Number(row.capacity) : 0;
      const occupancy = capacity > 0 ? (productCount / capacity) * 100 : 0;
      
      return {
        id: row.id,
        code: row.code,
        name: row.name,
        type: row.type,
        capacity: row.capacity,
        parentId: row.parentId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        productCount,
        occupancy: Number(occupancy.toFixed(2)),
        children: []
      };
    }) as LocationTree[];

    const buildTree = (parentId: string | null): LocationTree[] => {
      return locations
        .filter(l => l.parentId === parentId)
        .map(l => ({
          ...l,
          children: buildTree(l.id)
        }));
    };

    return buildTree(null);
  }

  async create(data: CreateLocationDto & { id: string }): Promise<void> {
    const sql = `
      INSERT INTO locations (id, code, name, type, capacity, parent_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await query(sql, [
      data.id,
      data.code,
      data.name,
      data.type,
      data.capacity || null,
      data.parentId || null
    ]);
  }

  async update(id: string, data: UpdateLocationDto): Promise<void> {
    const fields: string[] = [];
    const params: (string | number | null)[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      params.push(data.name);
    }
    if (data.capacity !== undefined) {
      fields.push('capacity = ?');
      params.push(data.capacity);
    }

    if (fields.length === 0) return;

    fields.push('updated_at = NOW()');
    params.push(id);

    const sql = `UPDATE locations SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, params);
  }

  async deactivate(id: string): Promise<void> {
    const sql = 'UPDATE locations SET is_active = 0, updated_at = NOW() WHERE id = ?';
    await query(sql, [id]);
  }

  async delete(id: string): Promise<void> {
    const sql = 'DELETE FROM locations WHERE id = ?';
    await query(sql, [id]);
  }

  async countProducts(locationId: string): Promise<number> {
    const sql = "SELECT COUNT(*) as total FROM products WHERE location_id = ? AND status != 'DISCONTINUED'";
    const result = await queryOne<RowDataPacket>(sql, [locationId]);
    return parseInt(String(result?.total)) || 0;
  }

  async countChildren(locationId: string): Promise<number> {
    const sql = 'SELECT COUNT(*) as total FROM locations WHERE parent_id = ? AND is_active = 1';
    const result = await queryOne<RowDataPacket>(sql, [locationId]);
    return parseInt(String(result?.total)) || 0;
  }

  async validateHierarchy(parentId: string, childType: string): Promise<boolean> {
    const sql = 'SELECT type FROM locations WHERE id = ?';
    const result = await queryOne<RowDataPacket>(sql, [parentId]);
    if (!result) return false;

    const parentType = result.type;
    
    switch (childType) {
      case 'ZONE':
        return parentType === 'WAREHOUSE';
      case 'AISLE':
        return parentType === 'ZONE';
      case 'SHELF':
        return parentType === 'AISLE';
      case 'CELL':
        return parentType === 'SHELF';
      default:
        return false;
    }
  }
}
