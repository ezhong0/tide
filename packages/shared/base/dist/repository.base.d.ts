/**
 * Base Repository Class
 * Provides common data access patterns
 *
 * Features:
 * - Standardized CRUD operations
 * - Type-safe queries
 * - Error handling
 * - Logging
 * - Connection management
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Logger } from 'pino';
export interface QueryOptions {
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
}
export interface Repository<T> {
    findById(id: string): Promise<T | null>;
    findAll(options?: QueryOptions): Promise<T[]>;
    create(data: Partial<T>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<void>;
}
/**
 * Abstract base repository implementation
 * Extend this for domain-specific repositories
 */
export declare abstract class RepositoryBase<T extends {
    id: string;
}> implements Repository<T> {
    protected readonly logger: Logger;
    protected readonly db: SupabaseClient;
    protected abstract readonly tableName: string;
    constructor(db: SupabaseClient, entityName: string);
    /**
     * Find entity by ID
     */
    findById(id: string): Promise<T | null>;
    /**
     * Find all entities with optional filtering
     */
    findAll(options?: QueryOptions): Promise<T[]>;
    /**
     * Create new entity
     */
    create(data: Partial<T>): Promise<T>;
    /**
     * Update existing entity
     */
    update(id: string, data: Partial<T>): Promise<T>;
    /**
     * Delete entity
     */
    delete(id: string): Promise<void>;
    /**
     * Execute custom query with error handling
     */
    protected executeQuery<R>(queryFn: () => Promise<{
        data: R | null;
        error: any;
    }>, operation: string): Promise<R>;
}
/**
 * Repository-specific error class
 */
export declare class RepositoryError extends Error {
    readonly cause?: any | undefined;
    constructor(message: string, cause?: any | undefined);
}
//# sourceMappingURL=repository.base.d.ts.map