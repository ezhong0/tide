import { createClient, RedisClientType } from 'redis';
import { env } from '@tide/config';
import { logger } from '@tide/logger';

let redisClient: RedisClientType | null = null;

/**
 * Initialize Redis client
 */
export async function initRedis(): Promise<RedisClientType> {
  if (redisClient) {
    return redisClient;
  }

  if (!env.REDIS_URL) {
    logger.warn('REDIS_URL not configured, distributed locking will be disabled');
    throw new Error('Redis URL not configured');
  }

  redisClient = createClient({
    url: env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > env.REDIS_MAX_RETRIES) {
          logger.error('Redis max retries exceeded');
          return new Error('Redis connection failed');
        }
        return Math.min(retries * 50, 500);
      },
    },
  });

  redisClient.on('error', (err) => {
    logger.error({ error: err }, 'Redis client error');
  });

  redisClient.on('connect', () => {
    logger.info('Redis client connected');
  });

  redisClient.on('reconnecting', () => {
    logger.warn('Redis client reconnecting');
  });

  await redisClient.connect();

  return redisClient;
}

/**
 * Get Redis client (must be initialized first)
 */
export function getRedis(): RedisClientType {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call initRedis() first.');
  }
  return redisClient;
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis client closed');
  }
}

/**
 * Distributed lock implementation using Redis
 */
export class RedisLock {
  constructor(
    private redis: RedisClientType,
    private key: string,
    private ttlMs: number = 30000 // 30 seconds default
  ) {}

  /**
   * Acquire lock
   * Returns true if lock acquired, false if already locked
   */
  async acquire(): Promise<boolean> {
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
  async release(): Promise<void> {
    await this.redis.del(this.key);
  }

  /**
   * Try to acquire lock with retries
   */
  async acquireWithRetry(maxRetries: number = 3, retryDelayMs: number = 100): Promise<boolean> {
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
  async withLock<T>(fn: () => Promise<T>): Promise<T> {
    const acquired = await this.acquire();
    if (!acquired) {
      throw new Error(`Failed to acquire lock: ${this.key}`);
    }

    try {
      return await fn();
    } finally {
      await this.release();
    }
  }
}

/**
 * Create a new distributed lock
 */
export function createLock(key: string, ttlMs?: number): RedisLock {
  const redis = getRedis();
  return new RedisLock(redis, key, ttlMs);
}
