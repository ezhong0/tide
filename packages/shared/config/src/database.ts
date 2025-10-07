import { env } from './env';

export interface DatabaseConfig {
  url: string;
  ssl: boolean;
  pool: {
    min: number;
    max: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
  };
  statement_timeout: number;
  query_timeout: number;
}

/**
 * PostgreSQL database configuration
 */
export const databaseConfig: DatabaseConfig = {
  url: env.DATABASE_URL,
  ssl: env.DATABASE_SSL,
  pool: {
    min: env.DATABASE_POOL_MIN,
    max: env.DATABASE_POOL_MAX,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  },
  statement_timeout: 30000, // 30 seconds
  query_timeout: 60000, // 60 seconds
};

export interface RedisConfig {
  url: string;
  maxRetriesPerRequest: number;
  retryStrategy: (times: number) => number | void;
  enableReadyCheck: boolean;
  enableOfflineQueue: boolean;
  connectTimeout: number;
}

/**
 * Redis cache configuration
 */
export const redisConfig: RedisConfig = {
  url: env.REDIS_URL,
  maxRetriesPerRequest: env.REDIS_MAX_RETRIES,
  retryStrategy: (times: number) => {
    if (times > env.REDIS_MAX_RETRIES) {
      return undefined; // Stop retrying
    }
    return Math.min(times * 100, 3000); // Exponential backoff up to 3s
  },
  enableReadyCheck: true,
  enableOfflineQueue: false,
  connectTimeout: 10000,
};

export interface KafkaConfig {
  brokers: string[];
  clientId: string;
  groupId: string;
  connectionTimeout: number;
  requestTimeout: number;
  retry: {
    maxRetryTime: number;
    initialRetryTime: number;
    retries: number;
  };
}

/**
 * Kafka event bus configuration
 */
export const kafkaConfig: KafkaConfig = {
  brokers: env.KAFKA_BROKERS.split(',').map(b => b.trim()),
  clientId: env.KAFKA_CLIENT_ID,
  groupId: env.KAFKA_GROUP_ID,
  connectionTimeout: 10000,
  requestTimeout: 30000,
  retry: {
    maxRetryTime: 30000,
    initialRetryTime: 300,
    retries: 8,
  },
};
