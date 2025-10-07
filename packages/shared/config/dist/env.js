"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTest = exports.isDevelopment = exports.isProduction = exports.env = void 0;
exports.getKafkaBrokers = getKafkaBrokers;
exports.getAllowedOrigins = getAllowedOrigins;
exports.getWebSocketOrigins = getWebSocketOrigins;
const zod_1 = require("zod");
/**
 * Environment schema with validation
 */
const EnvSchema = zod_1.z.object({
    // Application
    NODE_ENV: zod_1.z.enum(['development', 'test', 'staging', 'production']).default('development'),
    PORT: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().positive()).default('4000'),
    LOG_LEVEL: zod_1.z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    // Database
    DATABASE_URL: zod_1.z.string().url(),
    DATABASE_POOL_MIN: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().nonnegative()).default('2'),
    DATABASE_POOL_MAX: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().positive()).default('10'),
    DATABASE_SSL: zod_1.z.string().transform(val => val === 'true').default('false'),
    // Redis
    REDIS_URL: zod_1.z.string().url(),
    REDIS_MAX_RETRIES: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().positive()).default('3'),
    // Kafka
    KAFKA_BROKERS: zod_1.z.string(), // Comma-separated list
    KAFKA_CLIENT_ID: zod_1.z.string().default('tide-platform'),
    KAFKA_GROUP_ID: zod_1.z.string().default('tide-consumers'),
    // Authentication
    JWT_ACCESS_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('30d'),
    BCRYPT_ROUNDS: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(10).max(15)).default('12'),
    // External Services
    OPENAI_API_KEY: zod_1.z.string().optional(),
    OPENAI_ORG_ID: zod_1.z.string().optional(),
    ANTHROPIC_API_KEY: zod_1.z.string().optional(),
    // OAuth - Google (unified for Gmail, Calendar, Drive, etc.)
    GOOGLE_CLIENT_ID: zod_1.z.string().optional(),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().optional(),
    GOOGLE_REDIRECT_URI: zod_1.z.string().url().optional(),
    GOOGLE_IOS_CLIENT_ID: zod_1.z.string().optional(), // For iOS mobile app
    // OAuth - Microsoft Exchange (unified for Outlook, Calendar, OneDrive, etc.)
    EXCHANGE_CLIENT_ID: zod_1.z.string().optional(),
    EXCHANGE_CLIENT_SECRET: zod_1.z.string().optional(),
    EXCHANGE_TENANT_ID: zod_1.z.string().optional(),
    EXCHANGE_REDIRECT_URI: zod_1.z.string().url().optional(),
    // Vector Database
    PINECONE_API_KEY: zod_1.z.string().optional(),
    PINECONE_ENVIRONMENT: zod_1.z.string().optional(),
    PINECONE_INDEX_NAME: zod_1.z.string().default('tide-embeddings'),
    // Monitoring
    SENTRY_DSN: zod_1.z.string().url().optional(),
    DATADOG_API_KEY: zod_1.z.string().optional(),
    // Feature Flags
    ENABLE_AI_FEATURES: zod_1.z.string().transform(val => val === 'true').default('true'),
    ENABLE_EMAIL_SYNC: zod_1.z.string().transform(val => val === 'true').default('true'),
    ENABLE_CALENDAR_SYNC: zod_1.z.string().transform(val => val === 'true').default('true'),
    ENABLE_WORKFLOW_ENGINE: zod_1.z.string().transform(val => val === 'true').default('true'),
    // CORS
    ALLOWED_ORIGINS: zod_1.z.string().default('http://localhost:3000'), // Comma-separated
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().transform(Number).default('900000'), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.string().transform(Number).default('100'),
    // WebSocket
    WEBSOCKET_PORT: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().positive()).default('4003'),
    WEBSOCKET_CORS_ORIGINS: zod_1.z.string().default('http://localhost:3000'),
    // Email
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().positive()).optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASSWORD: zod_1.z.string().optional(),
    SMTP_FROM: zod_1.z.string().email().optional(),
});
/**
 * Load and validate environment variables
 */
function loadEnv() {
    try {
        return EnvSchema.parse(process.env);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            console.error('❌ Environment validation failed:');
            error.errors.forEach((err) => {
                console.error(`  - ${err.path.join('.')}: ${err.message}`);
            });
            throw new Error('Invalid environment configuration');
        }
        throw error;
    }
}
/**
 * Validated environment variables
 */
exports.env = loadEnv();
/**
 * Check if running in production
 */
exports.isProduction = exports.env.NODE_ENV === 'production';
/**
 * Check if running in development
 */
exports.isDevelopment = exports.env.NODE_ENV === 'development';
/**
 * Check if running in test
 */
exports.isTest = exports.env.NODE_ENV === 'test';
/**
 * Get Kafka brokers as array
 */
function getKafkaBrokers() {
    return exports.env.KAFKA_BROKERS.split(',').map(b => b.trim());
}
/**
 * Get allowed CORS origins as array
 */
function getAllowedOrigins() {
    return exports.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
}
/**
 * Get WebSocket CORS origins as array
 */
function getWebSocketOrigins() {
    return exports.env.WEBSOCKET_CORS_ORIGINS.split(',').map(o => o.trim());
}
