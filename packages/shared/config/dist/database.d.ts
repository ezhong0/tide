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
export declare const databaseConfig: DatabaseConfig;
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
export declare const redisConfig: RedisConfig;
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
export declare const kafkaConfig: KafkaConfig;
