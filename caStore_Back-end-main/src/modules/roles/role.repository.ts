import { query, queryOne } from '../../config/database';
import { RowDataPacket } from 'mysql2';
import { Role } from '../../shared/types';
import { CreateRoleDto, UpdateRoleDto, GetRolesDto } from './role.schema';

export interface RoleWithUserCount extends Role {
  userCount: number;
}

export class RoleRepository {
  private parsePermissions(row: any): void {
    if (row && typeof row.permissions === 'string') {
      try {
        row.permissions = JSON.parse(row.permissions);
      } catch (e) {
        console.error('Error parsing role permissions JSON:', e);
        row.permissions = {};
      }
    }
  }

  async findAll(filters: GetRolesDto): Promise<Role[]> {
    let sql = `
    SELECT id, name, description, permissions,
           is_system as isSystem,
           created_at as createdAt,
           updated_at as updatedAt
    FROM roles WHERE 1=1
  `
    const params: unknown[] = []

    if (filters.search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)'
      params.push(`%${filters.search}%`, `%${filters.search}%`)
    }

    if (filters.type === 'system') {
      sql += ' AND is_system = 1'
    } else if (filters.type === 'custom') {
      sql += ' AND is_system = 0'
    }

    if (!filters.includeInactive) {
      sql += ' AND is_active = 1'
    }

    const limit = parseInt(String(filters.limit)) || 10
    const page = parseInt(String(filters.page)) || 1
    const offset = (page - 1) * limit

    sql += ' ORDER BY is_system DESC, name ASC'
    sql += ' LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const rows = await query<any>(sql, params)
    rows.forEach(row => this.parsePermissions(row))
    return rows
  }

  async count(filters: GetRolesDto): Promise<number> {
    let sql = 'SELECT COUNT(*) as total FROM roles WHERE 1=1'
    const params: unknown[] = []

    if (filters.search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)'
      params.push(`%${filters.search}%`, `%${filters.search}%`)
    }

    if (filters.type === 'system') {
      sql += ' AND is_system = 1'
    } else if (filters.type === 'custom') {
      sql += ' AND is_system = 0'
    }

    if (!filters.includeInactive) {
      sql += ' AND is_active = 1'
    }

    const row = await queryOne<{ total: number }>(sql, params)
    return parseInt(String(row?.total)) || 0
  }

  async findById(id: string): Promise<Role | null> {
    const row = await queryOne<any>('SELECT id, name, description, permissions, is_system as isSystem, created_at as createdAt, updated_at as updatedAt FROM roles WHERE id = ? AND is_active = 1', [id]);
    this.parsePermissions(row);
    return row;
  }

  async findByName(name: string): Promise<Role | null> {
    const row = await queryOne<any>('SELECT id, name, description, permissions, is_system as isSystem, created_at as createdAt, updated_at as updatedAt FROM roles WHERE name = ?', [name]);
    this.parsePermissions(row);
    return row;
  }

  async create(data: CreateRoleDto & { id: string }): Promise<void> {
    const sql = `
      INSERT INTO roles (id, name, description, permissions, is_system)
      VALUES (?, ?, ?, ?, 0)
    `;
    await query(sql, [
      data.id,
      data.name,
      data.description || null,
      JSON.stringify(data.permissions)
    ]);
  }

  async update(id: string, data: UpdateRoleDto): Promise<void> {
    const fields: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      params.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      params.push(data.description || null);
    }
    if (data.permissions !== undefined) {
      fields.push('permissions = ?');
      params.push(JSON.stringify(data.permissions));
    }

    if (fields.length === 0) return;

    params.push(id);
    const sql = `UPDATE roles SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ? AND is_system = 0`;
    await query(sql, params);
  }

  async deactivate(id: string): Promise<void> {
    await query('UPDATE roles SET is_active = 0, updated_at = NOW() WHERE id = ? AND is_system = 0', [id]);
  }

  async delete(id: string): Promise<void> {
    await query('DELETE FROM roles WHERE id = ? AND is_system = 0', [id]);
  }

  async countUsersWithRole(roleId: string): Promise<number> {
    const row = await queryOne<{ total: number }>('SELECT COUNT(*) as total FROM users WHERE role_id = ? AND is_active = 1', [roleId]);
    return row?.total || 0;
  }

  async findWithUserCount(filters: GetRolesDto): Promise<RoleWithUserCount[]> {
    const conditions: string[] = ['1=1'];
    const params: (string | number | boolean | null)[] = [];

    if (filters.search) {
      conditions.push('(r.name LIKE ? OR r.description LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.type === 'system') {
      conditions.push('r.is_system = 1');
    } else if (filters.type === 'custom') {
      conditions.push('r.is_system = 0');
    }

    if (!filters.includeInactive) {
      conditions.push('r.is_active = 1');
    }

    const limit = parseInt(String(filters.limit)) || 10;
    const page = parseInt(String(filters.page)) || 1;
    const offset = (page - 1) * limit;

    params.push(limit, offset);

    const sql = `
      SELECT
        r.id, r.name, r.description, r.permissions,
        r.is_system as isSystem,
        r.created_at as createdAt,
        r.updated_at as updatedAt,
        COUNT(u.id) as userCount
      FROM roles r
      LEFT JOIN users u ON r.id = u.role_id
      WHERE ${conditions.join(' AND ')}
      GROUP BY r.id, r.name, r.description, r.permissions,
               r.is_system, r.created_at, r.updated_at
      ORDER BY r.is_system DESC, r.name ASC
      LIMIT ? OFFSET ?
    `;

    const rows = await query<RowDataPacket>(sql, params);

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      permissions: typeof row.permissions === 'string'
        ? JSON.parse(row.permissions)
        : row.permissions,
      isSystem: Boolean(row.isSystem),
      userCount: Number(row.userCount),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })) as RoleWithUserCount[];
  }
}
