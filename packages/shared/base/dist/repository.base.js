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
import { createLogger } from '@tide/logger';
/**
 * Abstract base repository implementation
 * Extend this for domain-specific repositories
 */
export class RepositoryBase {
    constructor(db, entityName) {
        this.db = db;
        this.logger = createLogger({ component: `${entityName}Repository` });
    }
    /**
     * Find entity by ID
     */
    async findById(id) {
        try {
            const { data, error } = await this.db
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();
            if (error) {
                if (error.code === 'PGRST116') { // Not found
                    return null;
                }
                throw error;
            }
            return data;
        }
        catch (error) {
            this.logger.error({ error, id }, `Failed to find ${this.tableName} by ID`);
            throw new RepositoryError(`Failed to find ${this.tableName}`, error);
        }
    }
    /**
     * Find all entities with optional filtering
     */
    async findAll(options = {}) {
        try {
            let query = this.db.from(this.tableName).select('*');
            if (options.limit) {
                query = query.limit(options.limit);
            }
            if (options.offset) {
                query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
            }
            if (options.orderBy) {
                query = query.order(options.orderBy, {
                    ascending: options.orderDirection !== 'desc'
                });
            }
            const { data, error } = await query;
            if (error) {
                throw error;
            }
            return (data || []);
        }
        catch (error) {
            this.logger.error({ error, options }, `Failed to find all ${this.tableName}`);
            throw new RepositoryError(`Failed to find all ${this.tableName}`, error);
        }
    }
    /**
     * Create new entity
     */
    async create(data) {
        try {
            const { data: created, error } = await this.db
                .from(this.tableName)
                .insert(data)
                .select()
                .single();
            if (error) {
                throw error;
            }
            this.logger.info({ id: created.id }, `Created ${this.tableName}`);
            return created;
        }
        catch (error) {
            this.logger.error({ error, data }, `Failed to create ${this.tableName}`);
            throw new RepositoryError(`Failed to create ${this.tableName}`, error);
        }
    }
    /**
     * Update existing entity
     */
    async update(id, data) {
        try {
            const { data: updated, error } = await this.db
                .from(this.tableName)
                .update(data)
                .eq('id', id)
                .select()
                .single();
            if (error) {
                throw error;
            }
            this.logger.info({ id }, `Updated ${this.tableName}`);
            return updated;
        }
        catch (error) {
            this.logger.error({ error, id, data }, `Failed to update ${this.tableName}`);
            throw new RepositoryError(`Failed to update ${this.tableName}`, error);
        }
    }
    /**
     * Delete entity
     */
    async delete(id) {
        try {
            const { error } = await this.db
                .from(this.tableName)
                .delete()
                .eq('id', id);
            if (error) {
                throw error;
            }
            this.logger.info({ id }, `Deleted ${this.tableName}`);
        }
        catch (error) {
            this.logger.error({ error, id }, `Failed to delete ${this.tableName}`);
            throw new RepositoryError(`Failed to delete ${this.tableName}`, error);
        }
    }
    /**
     * Execute custom query with error handling
     */
    async executeQuery(queryFn, operation) {
        try {
            const { data, error } = await queryFn();
            if (error) {
                throw error;
            }
            if (!data) {
                throw new Error('No data returned from query');
            }
            return data;
        }
        catch (error) {
            this.logger.error({ error, operation }, `Failed to execute query: ${operation}`);
            throw new RepositoryError(`Failed to execute ${operation}`, error);
        }
    }
}
/**
 * Repository-specific error class
 */
export class RepositoryError extends Error {
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = 'RepositoryError';
    }
}
//# sourceMappingURL=repository.base.js.map