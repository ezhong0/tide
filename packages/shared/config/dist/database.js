"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kafkaConfig = exports.redisConfig = exports.databaseConfig = void 0;
const env_1 = require("./env");
/**
 * PostgreSQL database configuration (optional - services use Supabase client)
 */
exports.databaseConfig = env_1.env.DATABASE_URL
    ? {
        url: env_1.env.DATABASE_URL,
        ssl: env_1.env.DATABASE_SSL,
        pool: {
            min: env_1.env.DATABASE_POOL_MIN,
            max: env_1.env.DATABASE_POOL_MAX,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        },
        statement_timeout: 30000, // 30 seconds
        query_timeout: 60000, // 60 seconds
    }
    : null;
/**
 * Redis cache configuration (infrastructure ready, not yet used)
 */
exports.redisConfig = env_1.env.REDIS_URL
    ? {
        url: env_1.env.REDIS_URL,
        maxRetriesPerRequest: env_1.env.REDIS_MAX_RETRIES,
        retryStrategy: (times) => {
            if (times > env_1.env.REDIS_MAX_RETRIES) {
                return undefined; // Stop retrying
            }
            return Math.min(times * 100, 3000); // Exponential backoff up to 3s
        },
        enableReadyCheck: true,
        enableOfflineQueue: false,
        connectTimeout: 10000,
    }
    : null;
/**
 * Kafka event bus configuration (infrastructure ready, not yet used)
 */
exports.kafkaConfig = env_1.env.KAFKA_BROKERS
    ? {
        brokers: env_1.env.KAFKA_BROKERS.split(',').map(b => b.trim()),
        clientId: env_1.env.KAFKA_CLIENT_ID,
        groupId: env_1.env.KAFKA_GROUP_ID,
        connectionTimeout: 10000,
        requestTimeout: 30000,
        retry: {
            maxRetryTime: 30000,
            initialRetryTime: 300,
            retries: 8,
        },
    }
    : null;
