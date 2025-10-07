"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.query = query;
exports.queryOne = queryOne;
exports.transaction = transaction;
exports.closePool = closePool;
exports.healthCheck = healthCheck;
const pg_1 = require("pg");
const config_1 = require("@tide/config");
const logger_1 = require("@tide/logger");
/**
 * PostgreSQL connection pool
 */
exports.pool = new pg_1.Pool({
    connectionString: config_1.databaseConfig.url,
    ssl: config_1.databaseConfig.ssl ? { rejectUnauthorized: true } : false,
    min: config_1.databaseConfig.pool.min,
    max: config_1.databaseConfig.pool.max,
    idleTimeoutMillis: config_1.databaseConfig.pool.idleTimeoutMillis,
    connectionTimeoutMillis: config_1.databaseConfig.pool.connectionTimeoutMillis,
    statement_timeout: config_1.databaseConfig.statement_timeout,
    query_timeout: config_1.databaseConfig.query_timeout,
});
// Log pool events
exports.pool.on('connect', () => {
    logger_1.logger.debug('Database pool: new client connected');
});
exports.pool.on('error', (err) => {
    logger_1.logger.error({ error: err }, 'Database pool error');
});
/**
 * Execute a query
 */
async function query(text, params) {
    const start = Date.now();
    try {
        const result = await exports.pool.query(text, params);
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
async function queryOne(text, params) {
    const rows = await query(text, params);
    return rows[0] || null;
}
/**
 * Execute a transaction
 */
async function transaction(callback) {
    const client = await exports.pool.connect();
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
 * Close the database pool
 */
async function closePool() {
    await exports.pool.end();
    logger_1.logger.info('Database pool closed');
}
/**
 * Health check
 */
async function healthCheck() {
    try {
        await query('SELECT 1');
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=client.js.map