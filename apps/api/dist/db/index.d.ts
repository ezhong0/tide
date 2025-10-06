import * as schema from './schema.js';
/**
 * Drizzle ORM instance
 */
export declare const db: import("drizzle-orm/node-postgres").NodePgDatabase<typeof schema>;
/**
 * Check database connection
 */
export declare function checkDatabaseConnection(): Promise<boolean>;
/**
 * Close database connection pool
 */
export declare function closeDatabaseConnection(): Promise<void>;
//# sourceMappingURL=index.d.ts.map