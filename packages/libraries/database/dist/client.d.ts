import { Pool, PoolClient } from 'pg';
/**
 * PostgreSQL connection pool
 */
export declare const pool: Pool;
/**
 * Execute a query
 */
export declare function query<T = any>(text: string, params?: any[]): Promise<T[]>;
/**
 * Execute a query and return the first row
 */
export declare function queryOne<T = any>(text: string, params?: any[]): Promise<T | null>;
/**
 * Execute a transaction
 */
export declare function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
/**
 * Close the database pool
 */
export declare function closePool(): Promise<void>;
/**
 * Health check
 */
export declare function healthCheck(): Promise<boolean>;
//# sourceMappingURL=client.d.ts.map