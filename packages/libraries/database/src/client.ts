import { Pool, PoolClient, PoolConfig } from 'pg';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { databaseConfig, supabaseConfig } from '@tide/config';
import { logger } from '@tide/logger';

/**
 * Database Client
 *
 * Week 3 Alpha: Services use Supabase client by default.
 * Direct PostgreSQL connection is optional for advanced use cases.
 */

/**
 * Create a Supabase client (recommended for Week 3)
 */
export function createSupabase(useServiceRole: boolean = true) {
  const key = useServiceRole ? supabaseConfig.serviceRoleKey : supabaseConfig.anonKey;
  return createSupabaseClient(supabaseConfig.url, key);
}

/**
 * Create a PostgreSQL pool (optional - requires DATABASE_URL)
 */
export function createPool(config?: PoolConfig): Pool | null {
  if (!databaseConfig && !config) {
    logger.warn('No DATABASE_URL configured - use createSupabase() instead');
    return null;
  }

  const poolConfig = config || {
    connectionString: databaseConfig!.url,
    ssl: databaseConfig!.ssl ? { rejectUnauthorized: true } : false,
    min: databaseConfig!.pool.min,
    max: databaseConfig!.pool.max,
    idleTimeoutMillis: databaseConfig!.pool.idleTimeoutMillis,
    connectionTimeoutMillis: databaseConfig!.pool.connectionTimeoutMillis,
    statement_timeout: databaseConfig!.statement_timeout,
    query_timeout: databaseConfig!.query_timeout,
  };

  const pool = new Pool(poolConfig);

  // Log pool events
  pool.on('connect', () => {
    logger.debug('Database pool: new client connected');
  });

  pool.on('error', (err) => {
    logger.error({ error: err }, 'Database pool error');
  });

  return pool;
}

/**
 * Execute a query using a pool
 */
export async function query<T = any>(
  pool: Pool,
  text: string,
  params?: any[]
): Promise<T[]> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug({ text, duration, rows: result.rowCount }, 'Executed query');
    return result.rows as T[];
  } catch (error) {
    logger.error({ error, text, params }, 'Query error');
    throw error;
  }
}

/**
 * Execute a query and return the first row
 */
export async function queryOne<T = any>(
  pool: Pool,
  text: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(pool, text, params);
  return rows[0] || null;
}

/**
 * Execute a transaction
 */
export async function transaction<T>(
  pool: Pool,
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close a database pool
 */
export async function closePool(pool: Pool): Promise<void> {
  await pool.end();
  logger.info('Database pool closed');
}

/**
 * Health check
 */
export async function healthCheck(pool: Pool): Promise<boolean> {
  try {
    await query(pool, 'SELECT 1');
    return true;
  } catch {
    return false;
  }
}
