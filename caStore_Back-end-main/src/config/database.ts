import mysql from 'mysql2/promise';
import { env } from './env';

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: env.DB_POOL_MAX,
  queueLimit: 0,
  timezone: 'Z',
  ssl: env.DB_SSL ? { 
    rejectUnauthorized: false
  } : undefined,
  connectTimeout: 20000,
  enableKeepAlive: true,
});

// Para SELECT — soporta LIMIT y OFFSET como parámetros
export async function query<T>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

// Para SELECT de un solo registro
export async function queryOne<T>(
  sql: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

// Para INSERT, UPDATE, DELETE — usa prepared statements estrictos
export async function execute(
  sql: string,
  params?: any[]
): Promise<mysql.ResultSetHeader> {
  const [result] = await pool.execute(sql, params);
  return result as mysql.ResultSetHeader;
}

export async function getConnection(): Promise<mysql.PoolConnection> {
  return pool.getConnection();
}

export async function testConnection(): Promise<void> {
  const maxRetries = 5;
  const retryInterval = 3000; // 3 seconds

  for (let i = 1; i <= maxRetries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log('✅ Database connected successfully');
      connection.release();
      return;
    } catch (error) {
      if (i === maxRetries) {
        console.error(`❌ Database connection failed after ${maxRetries} attempts:`, error);
        throw error;
      }
      console.warn(`⚠️ Database connection attempt ${i}/${maxRetries} failed. Retrying in ${retryInterval / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }
  }
}