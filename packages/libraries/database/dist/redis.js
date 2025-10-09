"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisLock = void 0;
exports.initRedis = initRedis;
exports.getRedis = getRedis;
exports.closeRedis = closeRedis;
exports.createLock = createLock;
const redis_1 = require("redis");
const config_1 = require("@tide/config");
const logger_1 = require("@tide/logger");
let redisClient = null;
/**
 * Initialize Redis client
 */
async function initRedis() {
    if (redisClient) {
        return redisClient;
    }
    if (!config_1.env.REDIS_URL) {
        logger_1.logger.warn('REDIS_URL not configured, distributed locking will be disabled');
        throw new Error('Redis URL not configured');
    }
    redisClient = (0, redis_1.createClient)({
        url: config_1.env.REDIS_URL,
        socket: {
            reconnectStrategy: (retries) => {
                if (retries > config_1.env.REDIS_MAX_RETRIES) {
                    logger_1.logger.error('Redis max retries exceeded');
                    return new Error('Redis connection failed');
                }
                return Math.min(retries * 50, 500);
            },
        },
    });
    redisClient.on('error', (err) => {
        logger_1.logger.error({ error: err }, 'Redis client error');
    });
    redisClient.on('connect', () => {
        logger_1.logger.info('Redis client connected');
    });
    redisClient.on('reconnecting', () => {
        logger_1.logger.warn('Redis client reconnecting');
    });
    await redisClient.connect();
    return redisClient;
}
/**
 * Get Redis client (must be initialized first)
 */
function getRedis() {
    if (!redisClient) {
        throw new Error('Redis client not initialized. Call initRedis() first.');
    }
    return redisClient;
}
/**
 * Close Redis connection
 */
async function closeRedis() {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
        logger_1.logger.info('Redis client closed');
    }
}
/**
 * Distributed lock implementation using Redis
 */
class RedisLock {
    constructor(redis, key, ttlMs = 30000 // 30 seconds default
    ) {
        this.redis = redis;
        this.key = key;
        this.ttlMs = ttlMs;
    }
    /**
     * Acquire lock
     * Returns true if lock acquired, false if already locked
     */
    async acquire() {
        const lockValue = `${Date.now()}-${Math.random()}`;
        const result = await this.redis.set(this.key, lockValue, {
            PX: this.ttlMs,
            NX: true,
        });
        return result === 'OK';
    }
    /**
     * Release lock
     */
    async release() {
        await this.redis.del(this.key);
    }
    /**
     * Try to acquire lock with retries
     */
    async acquireWithRetry(maxRetries = 3, retryDelayMs = 100) {
        for (let i = 0; i < maxRetries; i++) {
            const acquired = await this.acquire();
            if (acquired) {
                return true;
            }
            if (i < maxRetries - 1) {
                await new Promise((resolve) => setTimeout(resolve, retryDelayMs * (i + 1)));
            }
        }
        return false;
    }
    /**
     * Execute function with lock
     */
    async withLock(fn) {
        const acquired = await this.acquire();
        if (!acquired) {
            throw new Error(`Failed to acquire lock: ${this.key}`);
        }
        try {
            return await fn();
        }
        finally {
            await this.release();
        }
    }
}
exports.RedisLock = RedisLock;
/**
 * Create a new distributed lock
 */
function createLock(key, ttlMs) {
    const redis = getRedis();
    return new RedisLock(redis, key, ttlMs);
}
//# sourceMappingURL=redis.js.map