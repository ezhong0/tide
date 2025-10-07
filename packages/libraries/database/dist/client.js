"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupabase = createSupabase;
exports.createPool = createPool;
exports.query = query;
exports.queryOne = queryOne;
exports.transaction = transaction;
exports.closePool = closePool;
exports.healthCheck = healthCheck;
const pg_1 = require("pg");
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("@tide/config");
const logger_1 = require("@tide/logger");
/**
 * Database Client
 *
 * Week 3 Alpha: Services use Supabase client by default.
 * Direct PostgreSQL connection is optional for advanced use cases.
 */
/**
 * Create a Supabase client (recommended for Week 3)
 */
function createSupabase(useServiceRole = true) {
    const key = useServiceRole ? config_1.supabaseConfig.serviceRoleKey : config_1.supabaseConfig.anonKey;
    return (0, supabase_js_1.createClient)(config_1.supabaseConfig.url, key);
}
/**
 * Create a PostgreSQL pool (optional - requires DATABASE_URL)
 */
function createPool(config) {
    if (!config_1.databaseConfig && !config) {
        logger_1.logger.warn('No DATABASE_URL configured - use createSupabase() instead');
        return null;
    }
    const poolConfig = config || {
        connectionString: config_1.databaseConfig.url,
        ssl: config_1.databaseConfig.ssl ? { rejectUnauthorized: true } : false,
        min: config_1.databaseConfig.pool.min,
        max: config_1.databaseConfig.pool.max,
        idleTimeoutMillis: config_1.databaseConfig.pool.idleTimeoutMillis,
        connectionTimeoutMillis: config_1.databaseConfig.pool.connectionTimeoutMillis,
        statement_timeout: config_1.databaseConfig.statement_timeout,
        query_timeout: config_1.databaseConfig.query_timeout,
    };
    const pool = new pg_1.Pool(poolConfig);
    // Log pool events
    pool.on('connect', () => {
        logger_1.logger.debug('Database pool: new client connected');
    });
    pool.on('error', (err) => {
        logger_1.logger.error({ error: err }, 'Database pool error');
    });
    return pool;
}
/**
 * Execute a query using a pool
 */
async function query(pool, text, params) {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        logger_1.logger.debug({ text, duration, rows: result.rowCount }, 'Executed query');
        return result.rows;
    }
    catch (error) {
        logger_1.logger.error({ error, text, params }, 'Query error');
        throw error;
    }
}
/**
 * Execute a query and return the first row
 */
async function queryOne(pool, text, params) {
    const rows = await query(pool, text, params);
    return rows[0] || null;
}
/**
 * Execute a transaction
 */
async function transaction(pool, callback) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
}
/**
 * Close a database pool
 */
async function closePool(pool) {
    await pool.end();
    logger_1.logger.info('Database pool closed');
}
/**
 * Health check
 */
async function healthCheck(pool) {
    try {
        await query(pool, 'SELECT 1');
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=client.js.map