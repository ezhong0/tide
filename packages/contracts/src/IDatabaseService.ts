/**
 * Database Service Contract
 * PostgreSQL abstraction with JSONB and materialized views
 *
 * Performance Requirements:
 * - Simple queries: <50ms
 * - Complex queries: <200ms
 * - Writes: <100ms
 */

import { Result, UUID, Timestamp } from '@tide/types';

export interface IDatabaseService {
  /**
   * Execute a query with parameters
   * @param query SQL query string
   * @param params Query parameters
   * @returns Query results
   * @performance <50ms simple, <200ms complex
   */
  query<T>(query: string, params?: unknown[]): Promise<Result<T[]>>;

  /**
   * Execute a single row query
   * @param query SQL query string
   * @param params Query parameters
   * @returns Single row or null
   * @performance <50ms
   */
  queryOne<T>(query: string, params?: unknown[]): Promise<Result<T | null>>;

  /**
   * Execute a command (INSERT, UPDATE, DELETE)
   * @param command SQL command string
   * @param params Command parameters
   * @returns Affected row count
   * @performance <100ms
   */
  execute(command: string, params?: unknown[]): Promise<Result<number>>;

  /**
   * Insert a record
   * @param table Table name
   * @param data Record data
   * @returns Inserted record with generated fields
   * @performance <50ms
   */
  insert<T>(table: string, data: Partial<T>): Promise<Result<T>>;

  /**
   * Insert multiple records
   * @param table Table name
   * @param data Array of records
   * @returns Inserted records
   * @performance <100ms for 10 records
   */
  insertMany<T>(table: string, data: Partial<T>[]): Promise<Result<T[]>>;

  /**
   * Update records
   * @param table Table name
   * @param data Update data
   * @param where Where conditions
   * @returns Updated record count
   * @performance <100ms
   */
  update<T>(
    table: string,
    data: Partial<T>,
    where: WhereCondition
  ): Promise<Result<number>>;

  /**
   * Delete records
   * @param table Table name
   * @param where Where conditions
   * @returns Deleted record count
   * @performance <50ms
   */
  delete(table: string, where: WhereCondition): Promise<Result<number>>;

  /**
   * Find records by conditions
   * @param table Table name
   * @param where Where conditions
   * @param options Query options
   * @returns Matching records
   * @performance <100ms
   */
  find<T>(
    table: string,
    where?: WhereCondition,
    options?: QueryOptions
  ): Promise<Result<T[]>>;

  /**
   * Find single record
   * @param table Table name
   * @param where Where conditions
   * @returns Single record or null
   * @performance <50ms
   */
  findOne<T>(
    table: string,
    where: WhereCondition
  ): Promise<Result<T | null>>;

  /**
   * Find by ID
   * @param table Table name
   * @param id Record ID
   * @returns Record or null
   * @performance <30ms
   */
  findById<T>(table: string, id: UUID): Promise<Result<T | null>>;

  /**
   * Count records
   * @param table Table name
   * @param where Optional where conditions
   * @returns Record count
   * @performance <50ms
   */
  count(table: string, where?: WhereCondition): Promise<Result<number>>;

  /**
   * Check existence
   * @param table Table name
   * @param where Where conditions
   * @returns Existence status
   * @performance <30ms
   */
  exists(table: string, where: WhereCondition): Promise<Result<boolean>>;

  /**
   * Begin a transaction
   * @returns Transaction handle
   * @performance <10ms
   */
  beginTransaction(): Promise<Result<Transaction>>;

  /**
   * Commit a transaction
   * @param transaction Transaction to commit
   * @returns Success status
   * @performance <50ms
   */
  commit(transaction: Transaction): Promise<Result<void>>;

  /**
   * Rollback a transaction
   * @param transaction Transaction to rollback
   * @returns Success status
   * @performance <30ms
   */
  rollback(transaction: Transaction): Promise<Result<void>>;

  /**
   * Execute in transaction
   * @param callback Function to execute in transaction
   * @returns Callback result
   * @performance Depends on callback
   */
  withTransaction<T>(
    callback: (tx: Transaction) => Promise<T>
  ): Promise<Result<T>>;

  /**
   * Create or update (upsert)
   * @param table Table name
   * @param data Record data
   * @param conflictColumns Columns for conflict detection
   * @returns Upserted record
   * @performance <100ms
   */
  upsert<T>(
    table: string,
    data: Partial<T>,
    conflictColumns: string[]
  ): Promise<Result<T>>;

  /**
   * Bulk upsert
   * @param table Table name
   * @param data Array of records
   * @param conflictColumns Columns for conflict detection
   * @returns Upserted records
   * @performance <200ms for 10 records
   */
  bulkUpsert<T>(
    table: string,
    data: Partial<T>[],
    conflictColumns: string[]
  ): Promise<Result<T[]>>;

  /**
   * Query JSONB field
   * @param table Table name
   * @param column JSONB column name
   * @param path JSON path
   * @param value Value to match
   * @returns Matching records
   * @performance <100ms with GIN index
   */
  queryJsonb<T>(
    table: string,
    column: string,
    path: string,
    value: unknown
  ): Promise<Result<T[]>>;

  /**
   * Update JSONB field
   * @param table Table name
   * @param id Record ID
   * @param column JSONB column name
   * @param path JSON path
   * @param value New value
   * @returns Success status
   * @performance <50ms
   */
  updateJsonb(
    table: string,
    id: UUID,
    column: string,
    path: string,
    value: unknown
  ): Promise<Result<void>>;

  /**
   * Full text search
   * @param table Table name
   * @param columns Columns to search
   * @param query Search query
   * @param options Search options
   * @returns Matching records with relevance
   * @performance <100ms with index
   */
  search<T>(
    table: string,
    columns: string[],
    query: string,
    options?: SearchOptions
  ): Promise<Result<SearchResult<T>[]>>;

  /**
   * Refresh materialized view
   * @param viewName View name
   * @param concurrently Whether to refresh concurrently
   * @returns Success status
   * @performance Varies by view size
   */
  refreshMaterializedView(
    viewName: string,
    concurrently?: boolean
  ): Promise<Result<void>>;

  /**
   * Get database statistics
   * @returns Database statistics
   * @performance <100ms
   */
  getStats(): Promise<Result<DatabaseStats>>;

  /**
   * Vacuum table for optimization
   * @param table Table name
   * @param analyze Whether to update statistics
   * @returns Success status
   * @performance Async operation
   */
  vacuum(table: string, analyze?: boolean): Promise<Result<void>>;

  /**
   * Create index
   * @param table Table name
   * @param columns Columns to index
   * @param options Index options
   * @returns Success status
   * @performance Async operation
   */
  createIndex(
    table: string,
    columns: string[],
    options?: IndexOptions
  ): Promise<Result<void>>;

  /**
   * Stream query results
   * @param query SQL query
   * @param params Query parameters
   * @param handler Row handler
   * @returns Success status
   * @performance Streaming, minimal memory
   */
  stream<T>(
    query: string,
    params: unknown[],
    handler: (row: T) => Promise<void>
  ): Promise<Result<void>>;
}

// Supporting types
export interface WhereCondition {
  [column: string]: WhereOperator;
}

export interface WhereOperator {
  $eq?: unknown;
  $ne?: unknown;
  $gt?: unknown;
  $gte?: unknown;
  $lt?: unknown;
  $lte?: unknown;
  $in?: unknown[];
  $nin?: unknown[];
  $like?: string;
  $ilike?: string;
  $regex?: string;
  $between?: [unknown, unknown];
  $isNull?: boolean;
}

export interface QueryOptions {
  select?: string[];
  orderBy?: OrderBy[];
  limit?: number;
  offset?: number;
  distinct?: boolean;
  lock?: 'FOR UPDATE' | 'FOR SHARE';
}

export interface OrderBy {
  column: string;
  direction: 'ASC' | 'DESC';
  nulls?: 'FIRST' | 'LAST';
}

export interface Transaction {
  id: string;
  query<T>(query: string, params?: unknown[]): Promise<Result<T[]>>;
  execute(command: string, params?: unknown[]): Promise<Result<number>>;
  insert<T>(table: string, data: Partial<T>): Promise<Result<T>>;
  update<T>(table: string, data: Partial<T>, where: WhereCondition): Promise<Result<number>>;
  delete(table: string, where: WhereCondition): Promise<Result<number>>;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  language?: string;
  ranking?: 'relevance' | 'recency';
}

export interface SearchResult<T> {
  record: T;
  relevance: number;
  highlights: string[];
}

export interface DatabaseStats {
  connections: {
    active: number;
    idle: number;
    max: number;
  };
  queries: {
    total: number;
    slow: number;
    failed: number;
  };
  tables: TableStats[];
  size: {
    database: number;
    indices: number;
    cache: number;
  };
}

export interface TableStats {
  name: string;
  rows: number;
  size: number;
  indexSize: number;
  lastVacuum?: Timestamp;
  lastAnalyze?: Timestamp;
}

export interface IndexOptions {
  unique?: boolean;
  concurrent?: boolean;
  method?: 'btree' | 'hash' | 'gin' | 'gist';
  where?: WhereCondition;
  name?: string;
}