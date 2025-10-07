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
 * PostgreSQL database configuration (optional - services use Supabase client)
 */
export const databaseConfig: DatabaseConfig | null = env.DATABASE_URL
  ? {
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
    }
  : null;

export interface RedisConfig {
  url: string;
  maxRetriesPerRequest: number;
  retryStrategy: (times: number) => number | void;
  enableReadyCheck: boolean;
  enableOfflineQueue: boolean;
  connectTimeout: number;
}

/**
 * Redis cache configuration (infrastructure ready, not yet used)
 */
export const redisConfig: RedisConfig | null = env.REDIS_URL
  ? {
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
    }
  : null;

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
 * Kafka event bus configuration (infrastructure ready, not yet used)
 */
export const kafkaConfig: KafkaConfig | null = env.KAFKA_BROKERS
  ? {
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
    }
  : null;
