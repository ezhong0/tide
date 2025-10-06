/**
 * Cache Service Contract
 * Multi-level caching for <300ms latency target
 *
 * Performance Requirements:
 * - L1 (in-memory): <1ms
 * - L2 (Redis): <10ms
 * - Cache invalidation: <20ms
 */

import { Result, Timestamp } from '@tide/types';

export interface ICacheService {
  /**
   * Get value from cache
   * @param key Cache key
   * @returns Cached value if exists
   * @performance <1ms L1, <10ms L2
   */
  get<T>(key: string): Promise<Result<T | null>>;

  /**
   * Set value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds
   * @returns Success status
   * @performance <5ms L1, <15ms L2
   */
  set<T>(key: string, value: T, ttl?: number): Promise<Result<void>>;

  /**
   * Set value only if key doesn't exist
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds
   * @returns True if set, false if already exists
   * @performance <5ms L1, <15ms L2
   */
  setNx<T>(key: string, value: T, ttl?: number): Promise<Result<boolean>>;

  /**
   * Get multiple values at once
   * @param keys Array of cache keys
   * @returns Map of key to value
   * @performance <2ms L1, <20ms L2 for 10 keys
   */
  mget<T>(keys: string[]): Promise<Result<Map<string, T>>>;

  /**
   * Set multiple values at once
   * @param items Map of key to value
   * @param ttl Time to live for all items
   * @returns Success status
   * @performance <10ms L1, <30ms L2 for 10 items
   */
  mset<T>(items: Map<string, T>, ttl?: number): Promise<Result<void>>;

  /**
   * Delete value from cache
   * @param key Cache key to delete
   * @returns Success status
   * @performance <2ms L1, <10ms L2
   */
  delete(key: string): Promise<Result<void>>;

  /**
   * Delete multiple keys at once
   * @param keys Array of keys to delete
   * @returns Number of keys deleted
   * @performance <5ms L1, <20ms L2 for 10 keys
   */
  deleteMany(keys: string[]): Promise<Result<number>>;

  /**
   * Check if key exists
   * @param key Cache key
   * @returns Existence status
   * @performance <1ms L1, <5ms L2
   */
  exists(key: string): Promise<Result<boolean>>;

  /**
   * Set expiration on existing key
   * @param key Cache key
   * @param ttl Time to live in seconds
   * @returns Success status
   * @performance <2ms L1, <10ms L2
   */
  expire(key: string, ttl: number): Promise<Result<void>>;

  /**
   * Get remaining TTL for key
   * @param key Cache key
   * @returns TTL in seconds, -1 if no expiry
   * @performance <1ms L1, <5ms L2
   */
  ttl(key: string): Promise<Result<number>>;

  /**
   * Increment numeric value
   * @param key Cache key
   * @param amount Amount to increment by
   * @returns New value
   * @performance <2ms L1, <10ms L2
   */
  incr(key: string, amount?: number): Promise<Result<number>>;

  /**
   * Decrement numeric value
   * @param key Cache key
   * @param amount Amount to decrement by
   * @returns New value
   * @performance <2ms L1, <10ms L2
   */
  decr(key: string, amount?: number): Promise<Result<number>>;

  /**
   * Clear all cache entries
   * @param pattern Optional pattern to match
   * @returns Number of entries cleared
   * @performance <50ms for pattern, <100ms for all
   */
  clear(pattern?: string): Promise<Result<number>>;

  /**
   * Get cache statistics
   * @returns Cache statistics
   * @performance <10ms
   */
  getStats(): Promise<Result<CacheStats>>;

  /**
   * Invalidate cache by tags
   * @param tags Array of tags to invalidate
   * @returns Number of entries invalidated
   * @performance <20ms for 10 tags
   */
  invalidateByTags(tags: string[]): Promise<Result<number>>;

  /**
   * Tag cache entries for group invalidation
   * @param key Cache key
   * @param tags Array of tags
   * @returns Success status
   * @performance <5ms
   */
  tag(key: string, tags: string[]): Promise<Result<void>>;

  /**
   * Get or set with callback
   * @param key Cache key
   * @param factory Function to generate value if not cached
   * @param ttl Time to live
   * @returns Cached or generated value
   * @performance <1ms if cached, varies if not
   */
  remember<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<Result<T>>;

  /**
   * Lock a key for atomic operations
   * @param key Lock key
   * @param ttl Lock duration in seconds
   * @returns Lock token if acquired
   * @performance <10ms
   */
  lock(key: string, ttl: number): Promise<Result<string | null>>;

  /**
   * Release a lock
   * @param key Lock key
   * @param token Lock token
   * @returns Success status
   * @performance <5ms
   */
  unlock(key: string, token: string): Promise<Result<boolean>>;

  /**
   * Warm cache with preloaded data
   * @param data Map of key to value
   * @returns Number of entries warmed
   * @performance <100ms for 100 entries
   */
  warmCache(data: Map<string, unknown>): Promise<Result<number>>;

  /**
   * Subscribe to cache events
   * @param event Event type to subscribe to
   * @param handler Event handler
   * @returns Unsubscribe function
   * @performance Real-time
   */
  subscribe(
    event: CacheEvent,
    handler: CacheEventHandler
  ): Result<() => void>;

  /**
   * Get cache memory usage
   * @returns Memory usage in bytes
   * @performance <5ms
   */
  getMemoryUsage(): Promise<Result<MemoryUsage>>;

  /**
   * Optimize cache performance
   * @returns Optimization result
   * @performance Async operation
   */
  optimize(): Promise<Result<OptimizationResult>>;
}

// Supporting types
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
  size: number;
  memoryUsed: number;
  keysCount: number;
  l1Stats: LevelStats;
  l2Stats: LevelStats;
}

export interface LevelStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
}

export type CacheEvent = 'hit' | 'miss' | 'set' | 'delete' | 'evict' | 'expire';

export type CacheEventHandler = (event: {
  type: CacheEvent;
  key: string;
  timestamp: Timestamp;
  metadata?: Record<string, unknown>;
}) => void;

export interface MemoryUsage {
  l1: {
    used: number;
    max: number;
    percentage: number;
  };
  l2: {
    used: number;
    max: number;
    percentage: number;
  };
}

export interface OptimizationResult {
  keysEvicted: number;
  memoryReclaimed: number;
  fragmentationReduced: number;
  duration: number;
}