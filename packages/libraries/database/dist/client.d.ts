import { Pool, PoolClient, PoolConfig } from 'pg';
/**
 * Database Client
 *
 * Week 3 Alpha: Services use Supabase client by default.
 * Direct PostgreSQL connection is optional for advanced use cases.
 */
/**
 * Create a Supabase client (recommended for Week 3)
 */
export declare function createSupabase(useServiceRole?: boolean): import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
/**
 * Create a PostgreSQL pool (optional - requires DATABASE_URL)
 */
export declare function createPool(config?: PoolConfig): Pool | null;
/**
 * Execute a query using a pool
 */
export declare function query<T = any>(pool: Pool, text: string, params?: any[]): Promise<T[]>;
/**
 * Execute a query and return the first row
 */
export declare function queryOne<T = any>(pool: Pool, text: string, params?: any[]): Promise<T | null>;
/**
 * Execute a transaction
 */
export declare function transaction<T>(pool: Pool, callback: (client: PoolClient) => Promise<T>): Promise<T>;
/**
 * Close a database pool
 */
export declare function closePool(pool: Pool): Promise<void>;
/**
 * Health check
 */
export declare function healthCheck(pool: Pool): Promise<boolean>;
//# sourceMappingURL=client.d.ts.map