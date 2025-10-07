import { z } from 'zod';
/**
 * Environment schema with validation
 */
declare const EnvSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "test", "staging", "production"]>>;
    PORT: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error"]>>;
    DATABASE_URL: z.ZodString;
    DATABASE_POOL_MIN: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    DATABASE_POOL_MAX: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    DATABASE_SSL: z.ZodDefault<z.ZodEffects<z.ZodString, boolean, string>>;
    REDIS_URL: z.ZodString;
    REDIS_MAX_RETRIES: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    KAFKA_BROKERS: z.ZodString;
    KAFKA_CLIENT_ID: z.ZodDefault<z.ZodString>;
    KAFKA_GROUP_ID: z.ZodDefault<z.ZodString>;
    JWT_ACCESS_SECRET: z.ZodString;
    JWT_REFRESH_SECRET: z.ZodString;
    JWT_ACCESS_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    JWT_REFRESH_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    BCRYPT_ROUNDS: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    OPENAI_API_KEY: z.ZodOptional<z.ZodString>;
    OPENAI_ORG_ID: z.ZodOptional<z.ZodString>;
    ANTHROPIC_API_KEY: z.ZodOptional<z.ZodString>;
    GMAIL_CLIENT_ID: z.ZodOptional<z.ZodString>;
    GMAIL_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
    GMAIL_REDIRECT_URI: z.ZodOptional<z.ZodString>;
    EXCHANGE_CLIENT_ID: z.ZodOptional<z.ZodString>;
    EXCHANGE_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
    EXCHANGE_TENANT_ID: z.ZodOptional<z.ZodString>;
    EXCHANGE_REDIRECT_URI: z.ZodOptional<z.ZodString>;
    GOOGLE_CALENDAR_CLIENT_ID: z.ZodOptional<z.ZodString>;
    GOOGLE_CALENDAR_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
    GOOGLE_CALENDAR_REDIRECT_URI: z.ZodOptional<z.ZodString>;
    PINECONE_API_KEY: z.ZodOptional<z.ZodString>;
    PINECONE_ENVIRONMENT: z.ZodOptional<z.ZodString>;
    PINECONE_INDEX_NAME: z.ZodDefault<z.ZodString>;
    SENTRY_DSN: z.ZodOptional<z.ZodString>;
    DATADOG_API_KEY: z.ZodOptional<z.ZodString>;
    ENABLE_AI_FEATURES: z.ZodDefault<z.ZodEffects<z.ZodString, boolean, string>>;
    ENABLE_EMAIL_SYNC: z.ZodDefault<z.ZodEffects<z.ZodString, boolean, string>>;
    ENABLE_CALENDAR_SYNC: z.ZodDefault<z.ZodEffects<z.ZodString, boolean, string>>;
    ENABLE_WORKFLOW_ENGINE: z.ZodDefault<z.ZodEffects<z.ZodString, boolean, string>>;
    ALLOWED_ORIGINS: z.ZodDefault<z.ZodString>;
    RATE_LIMIT_WINDOW_MS: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
    RATE_LIMIT_MAX_REQUESTS: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
    WEBSOCKET_PORT: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    WEBSOCKET_CORS_ORIGINS: z.ZodDefault<z.ZodString>;
    SMTP_HOST: z.ZodOptional<z.ZodString>;
    SMTP_PORT: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    SMTP_USER: z.ZodOptional<z.ZodString>;
    SMTP_PASSWORD: z.ZodOptional<z.ZodString>;
    SMTP_FROM: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "test" | "staging" | "production";
    PORT: number;
    LOG_LEVEL: "debug" | "info" | "warn" | "error";
    DATABASE_URL: string;
    DATABASE_POOL_MIN: number;
    DATABASE_POOL_MAX: number;
    DATABASE_SSL: boolean;
    REDIS_URL: string;
    REDIS_MAX_RETRIES: number;
    KAFKA_BROKERS: string;
    KAFKA_CLIENT_ID: string;
    KAFKA_GROUP_ID: string;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    BCRYPT_ROUNDS: number;
    PINECONE_INDEX_NAME: string;
    ENABLE_AI_FEATURES: boolean;
    ENABLE_EMAIL_SYNC: boolean;
    ENABLE_CALENDAR_SYNC: boolean;
    ENABLE_WORKFLOW_ENGINE: boolean;
    ALLOWED_ORIGINS: string;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    WEBSOCKET_PORT: number;
    WEBSOCKET_CORS_ORIGINS: string;
    OPENAI_API_KEY?: string | undefined;
    OPENAI_ORG_ID?: string | undefined;
    ANTHROPIC_API_KEY?: string | undefined;
    GMAIL_CLIENT_ID?: string | undefined;
    GMAIL_CLIENT_SECRET?: string | undefined;
    GMAIL_REDIRECT_URI?: string | undefined;
    EXCHANGE_CLIENT_ID?: string | undefined;
    EXCHANGE_CLIENT_SECRET?: string | undefined;
    EXCHANGE_TENANT_ID?: string | undefined;
    EXCHANGE_REDIRECT_URI?: string | undefined;
    GOOGLE_CALENDAR_CLIENT_ID?: string | undefined;
    GOOGLE_CALENDAR_CLIENT_SECRET?: string | undefined;
    GOOGLE_CALENDAR_REDIRECT_URI?: string | undefined;
    PINECONE_API_KEY?: string | undefined;
    PINECONE_ENVIRONMENT?: string | undefined;
    SENTRY_DSN?: string | undefined;
    DATADOG_API_KEY?: string | undefined;
    SMTP_HOST?: string | undefined;
    SMTP_PORT?: number | undefined;
    SMTP_USER?: string | undefined;
    SMTP_PASSWORD?: string | undefined;
    SMTP_FROM?: string | undefined;
}, {
    DATABASE_URL: string;
    REDIS_URL: string;
    KAFKA_BROKERS: string;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    NODE_ENV?: "development" | "test" | "staging" | "production" | undefined;
    PORT?: string | undefined;
    LOG_LEVEL?: "debug" | "info" | "warn" | "error" | undefined;
    DATABASE_POOL_MIN?: string | undefined;
    DATABASE_POOL_MAX?: string | undefined;
    DATABASE_SSL?: string | undefined;
    REDIS_MAX_RETRIES?: string | undefined;
    KAFKA_CLIENT_ID?: string | undefined;
    KAFKA_GROUP_ID?: string | undefined;
    JWT_ACCESS_EXPIRES_IN?: string | undefined;
    JWT_REFRESH_EXPIRES_IN?: string | undefined;
    BCRYPT_ROUNDS?: string | undefined;
    OPENAI_API_KEY?: string | undefined;
    OPENAI_ORG_ID?: string | undefined;
    ANTHROPIC_API_KEY?: string | undefined;
    GMAIL_CLIENT_ID?: string | undefined;
    GMAIL_CLIENT_SECRET?: string | undefined;
    GMAIL_REDIRECT_URI?: string | undefined;
    EXCHANGE_CLIENT_ID?: string | undefined;
    EXCHANGE_CLIENT_SECRET?: string | undefined;
    EXCHANGE_TENANT_ID?: string | undefined;
    EXCHANGE_REDIRECT_URI?: string | undefined;
    GOOGLE_CALENDAR_CLIENT_ID?: string | undefined;
    GOOGLE_CALENDAR_CLIENT_SECRET?: string | undefined;
    GOOGLE_CALENDAR_REDIRECT_URI?: string | undefined;
    PINECONE_API_KEY?: string | undefined;
    PINECONE_ENVIRONMENT?: string | undefined;
    PINECONE_INDEX_NAME?: string | undefined;
    SENTRY_DSN?: string | undefined;
    DATADOG_API_KEY?: string | undefined;
    ENABLE_AI_FEATURES?: string | undefined;
    ENABLE_EMAIL_SYNC?: string | undefined;
    ENABLE_CALENDAR_SYNC?: string | undefined;
    ENABLE_WORKFLOW_ENGINE?: string | undefined;
    ALLOWED_ORIGINS?: string | undefined;
    RATE_LIMIT_WINDOW_MS?: string | undefined;
    RATE_LIMIT_MAX_REQUESTS?: string | undefined;
    WEBSOCKET_PORT?: string | undefined;
    WEBSOCKET_CORS_ORIGINS?: string | undefined;
    SMTP_HOST?: string | undefined;
    SMTP_PORT?: string | undefined;
    SMTP_USER?: string | undefined;
    SMTP_PASSWORD?: string | undefined;
    SMTP_FROM?: string | undefined;
}>;
export type Env = z.infer<typeof EnvSchema>;
/**
 * Validated environment variables
 */
export declare const env: {
    NODE_ENV: "development" | "test" | "staging" | "production";
    PORT: number;
    LOG_LEVEL: "debug" | "info" | "warn" | "error";
    DATABASE_URL: string;
    DATABASE_POOL_MIN: number;
    DATABASE_POOL_MAX: number;
    DATABASE_SSL: boolean;
    REDIS_URL: string;
    REDIS_MAX_RETRIES: number;
    KAFKA_BROKERS: string;
    KAFKA_CLIENT_ID: string;
    KAFKA_GROUP_ID: string;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    BCRYPT_ROUNDS: number;
    PINECONE_INDEX_NAME: string;
    ENABLE_AI_FEATURES: boolean;
    ENABLE_EMAIL_SYNC: boolean;
    ENABLE_CALENDAR_SYNC: boolean;
    ENABLE_WORKFLOW_ENGINE: boolean;
    ALLOWED_ORIGINS: string;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    WEBSOCKET_PORT: number;
    WEBSOCKET_CORS_ORIGINS: string;
    OPENAI_API_KEY?: string | undefined;
    OPENAI_ORG_ID?: string | undefined;
    ANTHROPIC_API_KEY?: string | undefined;
    GMAIL_CLIENT_ID?: string | undefined;
    GMAIL_CLIENT_SECRET?: string | undefined;
    GMAIL_REDIRECT_URI?: string | undefined;
    EXCHANGE_CLIENT_ID?: string | undefined;
    EXCHANGE_CLIENT_SECRET?: string | undefined;
    EXCHANGE_TENANT_ID?: string | undefined;
    EXCHANGE_REDIRECT_URI?: string | undefined;
    GOOGLE_CALENDAR_CLIENT_ID?: string | undefined;
    GOOGLE_CALENDAR_CLIENT_SECRET?: string | undefined;
    GOOGLE_CALENDAR_REDIRECT_URI?: string | undefined;
    PINECONE_API_KEY?: string | undefined;
    PINECONE_ENVIRONMENT?: string | undefined;
    SENTRY_DSN?: string | undefined;
    DATADOG_API_KEY?: string | undefined;
    SMTP_HOST?: string | undefined;
    SMTP_PORT?: number | undefined;
    SMTP_USER?: string | undefined;
    SMTP_PASSWORD?: string | undefined;
    SMTP_FROM?: string | undefined;
};
/**
 * Check if running in production
 */
export declare const isProduction: boolean;
/**
 * Check if running in development
 */
export declare const isDevelopment: boolean;
/**
 * Check if running in test
 */
export declare const isTest: boolean;
/**
 * Get Kafka brokers as array
 */
export declare function getKafkaBrokers(): string[];
/**
 * Get allowed CORS origins as array
 */
export declare function getAllowedOrigins(): string[];
/**
 * Get WebSocket CORS origins as array
 */
export declare function getWebSocketOrigins(): string[];
export {};
