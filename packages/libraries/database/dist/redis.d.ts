import { RedisClientType } from 'redis';
/**
 * Initialize Redis client
 */
export declare function initRedis(): Promise<RedisClientType>;
/**
 * Get Redis client (must be initialized first)
 */
export declare function getRedis(): RedisClientType;
/**
 * Close Redis connection
 */
export declare function closeRedis(): Promise<void>;
/**
 * Distributed lock implementation using Redis
 */
export declare class RedisLock {
    private redis;
    private key;
    private ttlMs;
    constructor(redis: RedisClientType, key: string, ttlMs?: number);
    /**
     * Acquire lock
     * Returns true if lock acquired, false if already locked
     */
    acquire(): Promise<boolean>;
    /**
     * Release lock
     */
    release(): Promise<void>;
    /**
     * Try to acquire lock with retries
     */
    acquireWithRetry(maxRetries?: number, retryDelayMs?: number): Promise<boolean>;
    /**
     * Execute function with lock
     */
    withLock<T>(fn: () => Promise<T>): Promise<T>;
}
/**
 * Create a new distributed lock
 */
export declare function createLock(key: string, ttlMs?: number): RedisLock;
//# sourceMappingURL=redis.d.ts.map