import { query, queryOne } from '../../config/database';
import { User, Permissions } from '../../shared/types';

export interface UserWithRole extends User {
  roleName: string;
  permissions: Permissions;
}

export interface PasswordReset {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export class AuthRepository {
  async findUserByEmail(email: string): Promise<UserWithRole | null> {
    const sql = `
      SELECT u.id, u.full_name as fullName, u.email, u.password_hash as passwordHash, 
             u.is_active as isActive, u.first_login as firstLogin, u.role_id as roleId, 
             u.last_login_at as lastLoginAt, u.created_at as createdAt, u.updated_at as updatedAt,
             r.name as roleName, r.permissions
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.email = ?
    `;
    return queryOne<UserWithRole>(sql, [email]);
  }

  async findUserById(id: string): Promise<UserWithRole | null> {
    const sql = `
      SELECT u.id, u.full_name as fullName, u.email, u.password_hash as passwordHash, 
             u.is_active as isActive, u.first_login as firstLogin, u.role_id as roleId, 
             u.last_login_at as lastLoginAt, u.created_at as createdAt, u.updated_at as updatedAt,
             r.name as roleName, r.permissions
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `;
    return queryOne<UserWithRole>(sql, [id]);
  }

  async updateLastLogin(userId: string): Promise<void> {
    const sql = 'UPDATE users SET last_login_at = NOW() WHERE id = ?';
    await query(sql, [userId]);
  }

  async createPasswordReset(data: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    const sql = `
      INSERT INTO password_resets (id, user_id, token_hash, expires_at)
      VALUES (?, ?, ?, ?)
    `;
    await query(sql, [data.id, data.userId, data.tokenHash, data.expiresAt]);
  }

  async findPasswordReset(tokenHash: string): Promise<PasswordReset | null> {
    const sql = `
      SELECT id, user_id as userId, token_hash as tokenHash, expires_at as expiresAt, 
             used_at as usedAt, created_at as createdAt
      FROM password_resets
      WHERE token_hash = ?
      AND used_at IS NULL
      AND expires_at > NOW()
    `;
    return queryOne<PasswordReset>(sql, [tokenHash]);
  }

  async markPasswordResetAsUsed(id: string): Promise<void> {
    const sql = 'UPDATE password_resets SET used_at = NOW() WHERE id = ?';
    await query(sql, [id]);
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    const sql = 'UPDATE users SET password_hash = ?, first_login = 0, updated_at = NOW() WHERE id = ?';
    await query(sql, [passwordHash, userId]);
  }

  async invalidateAllUserResets(userId: string): Promise<void> {
    const sql = 'UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL';
    await query(sql, [userId]);
  }
}
