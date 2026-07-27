import { query, queryOne } from '../../config/database';
import { User, Permissions } from '../../shared/types';
import { GetUsersDto } from './user.schema';

export interface UserWithRole extends Omit<User, 'passwordHash'> {
  roleName: string;
  permissions: Permissions;
  roleIsSystem: boolean;
}

export class UserRepository {
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

  private mapIsActive(row: any): void {
    if (row) {
      row.isActive = !!row.isActive;
      row.firstLogin = !!row.firstLogin;
      row.roleIsSystem = !!row.roleIsSystem;
    }
  }

  async findAll(filters: GetUsersDto): Promise<UserWithRole[]> {
    let sql = `
      SELECT u.id, u.full_name as fullName, u.email,
             u.is_active as isActive, u.first_login as firstLogin,
             u.role_id as roleId, u.last_login_at as lastLoginAt,
             u.created_at as createdAt, u.updated_at as updatedAt,
             r.name as roleName, r.permissions, r.is_system as roleIsSystem
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.search) {
      sql += ' AND (u.full_name LIKE ? OR u.email LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.roleId) {
      sql += ' AND u.role_id = ?';
      params.push(filters.roleId);
    }

    if (filters.status === 'active') {
      sql += ' AND u.is_active = 1';
    } else if (filters.status === 'inactive') {
      sql += ' AND u.is_active = 0';
    }

    const limit = parseInt(String(filters.limit)) || 10;
    const page = parseInt(String(filters.page)) || 1;
    const offset = (page - 1) * limit;

    sql += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = await query<any>(sql, params);
    rows.forEach((row) => {
      this.parsePermissions(row);
      this.mapIsActive(row);
    });
    return rows;
  }

  async count(filters: GetUsersDto): Promise<number> {
    let sql = 'SELECT COUNT(*) as total FROM users u WHERE 1=1';
    const params: any[] = [];

    if (filters.search) {
      sql += ' AND (u.full_name LIKE ? OR u.email LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.roleId) {
      sql += ' AND u.role_id = ?';
      params.push(filters.roleId);
    }

    if (filters.status === 'active') {
      sql += ' AND u.is_active = 1';
    } else if (filters.status === 'inactive') {
      sql += ' AND u.is_active = 0';
    }

    const row = await queryOne<{ total: number }>(sql, params);
    return parseInt(String(row?.total)) || 0;
  }

  async findById(id: string): Promise<UserWithRole | null> {
    const sql = `
      SELECT u.id, u.full_name as fullName, u.email,
             u.is_active as isActive, u.first_login as firstLogin,
             u.role_id as roleId, u.last_login_at as lastLoginAt,
             u.created_at as createdAt, u.updated_at as updatedAt,
             r.name as roleName, r.permissions, r.is_system as roleIsSystem
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `;
    const row = await queryOne<any>(sql, [id]);
    if (row) {
      this.parsePermissions(row);
      this.mapIsActive(row);
    }
    return row;
  }

  async findByIdWithPassword(id: string): Promise<(UserWithRole & { passwordHash: string }) | null> {
    const sql = `
      SELECT u.id, u.full_name as fullName, u.email, u.password_hash as passwordHash,
             u.is_active as isActive, u.first_login as firstLogin,
             u.role_id as roleId, u.last_login_at as lastLoginAt,
             u.created_at as createdAt, u.updated_at as updatedAt,
             r.name as roleName, r.permissions, r.is_system as roleIsSystem
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `;
    const row = await queryOne<any>(sql, [id]);
    if (row) {
      this.parsePermissions(row);
      this.mapIsActive(row);
    }
    return row;
  }

  async findByEmail(email: string): Promise<UserWithRole | null> {
    const sql = `
      SELECT u.id, u.full_name as fullName, u.email,
             u.is_active as isActive, u.first_login as firstLogin,
             u.role_id as roleId, u.last_login_at as lastLoginAt,
             u.created_at as createdAt, u.updated_at as updatedAt,
             r.name as roleName, r.permissions, r.is_system as roleIsSystem
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.email = ?
    `;
    const row = await queryOne<any>(sql, [email]);
    if (row) {
      this.parsePermissions(row);
      this.mapIsActive(row);
    }
    return row;
  }

  async create(data: {
    id: string;
    fullName: string;
    email: string;
    passwordHash: string;
    roleId: string;
  }): Promise<void> {
    const sql = `
      INSERT INTO users (id, full_name, email, password_hash, is_active, first_login, role_id)
      VALUES (?, ?, ?, ?, 1, 1, ?)
    `;
    await query(sql, [
      data.id,
      data.fullName,
      data.email,
      data.passwordHash,
      data.roleId,
    ]);
  }

  async update(id: string, data: {
    fullName?: string;
    email?: string;
    roleId?: string;
  }): Promise<void> {
    const fields: string[] = [];
    const params: any[] = [];

    if (data.fullName !== undefined) {
      fields.push('full_name = ?');
      params.push(data.fullName);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      params.push(data.email);
    }
    if (data.roleId !== undefined) {
      fields.push('role_id = ?');
      params.push(data.roleId);
    }

    if (fields.length === 0) return;

    params.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    await query(sql, params);
  }

  async updateStatus(id: string, isActive: boolean): Promise<void> {
    const sql = 'UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?';
    await query(sql, [isActive ? 1 : 0, id]);
  }

  async updatePassword(id: string, passwordHash: string, resetFirstLogin = true): Promise<void> {
    const firstLoginSql = resetFirstLogin ? 'first_login = 0,' : '';
    const sql = `UPDATE users SET password_hash = ?, ${firstLoginSql} updated_at = NOW() WHERE id = ?`;
    await query(sql, [passwordHash, id]);
  }
}
