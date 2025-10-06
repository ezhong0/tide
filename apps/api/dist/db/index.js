import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import * as schema from './schema.js';
/**
 * PostgreSQL connection pool
 */
const pool = new Pool({
    connectionString: env.DATABASE_URL,
    min: env.DATABASE_POOL_MIN,
    max: env.DATABASE_POOL_MAX,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});
pool.on('error', (err) => {
    logger.error({ err }, 'Unexpected database pool error');
});
pool.on('connect', () => {
    logger.debug('New database connection established');
});
/**
 * Drizzle ORM instance
 */
export const db = drizzle(pool, { schema, logger: false });
/**
 * Check database connection
 */
export async function checkDatabaseConnection() {
    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        logger.info('✅ Database connection successful');
        return true;
    }
    catch (error) {
        logger.error({ err: error }, '❌ Database connection failed');
        return false;
    }
}
/**
 * Close database connection pool
 */
export async function closeDatabaseConnection() {
    await pool.end();
    logger.info('Database connection pool closed');
}
//# sourceMappingURL=index.js.map