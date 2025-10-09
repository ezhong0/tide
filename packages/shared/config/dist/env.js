"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTest = exports.isDevelopment = exports.isProduction = exports.env = void 0;
exports.getKafkaBrokers = getKafkaBrokers;
exports.getAllowedOrigins = getAllowedOrigins;
const zod_1 = require("zod");
/**
 * Environment schema with validation
 */
const EnvSchema = zod_1.z.object({
    // Application
    NODE_ENV: zod_1.z.enum(['development', 'test', 'staging', 'production']).default('development'),
    PORT: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().positive()).default('4000'),
    LOG_LEVEL: zod_1.z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    // Supabase (Core Infrastructure)
    // Made optional to allow services that don't need Supabase (e.g., AI service)
    SUPABASE_URL: zod_1.z.string().url().optional(),
    SUPABASE_ANON_KEY: zod_1.z.string().optional(), // For mobile apps
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().optional(), // For backend services (bypasses RLS)
    SUPABASE_JWT_SECRET: zod_1.z.string().optional(),
    // Database (Optional - services use Supabase client)
    DATABASE_URL: zod_1.z.string().url().optional(),
    DATABASE_POOL_MIN: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().nonnegative()).default('2'),
    DATABASE_POOL_MAX: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().positive()).default('10'),
    DATABASE_SSL: zod_1.z.string().transform(val => val === 'true').default('false'),
    // Redis (Infrastructure ready, not yet used)
    REDIS_URL: zod_1.z.string().optional(),
    REDIS_MAX_RETRIES: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().positive()).default('3'),
    // Kafka (Infrastructure ready, not yet used)
    KAFKA_BROKERS: zod_1.z.string().optional(),
    KAFKA_CLIENT_ID: zod_1.z.string().default('tide-platform'),
    KAFKA_GROUP_ID: zod_1.z.string().default('tide-consumers'),
    // External Services
    OPENAI_API_KEY: zod_1.z.string().optional(),
    OPENAI_ORG_ID: zod_1.z.string().optional(),
    ANTHROPIC_API_KEY: zod_1.z.string().optional(),
    // Internal Service URLs
    AI_SERVICE_URL: zod_1.z.string().url().default('http://localhost:3001'),
    EMAIL_SERVICE_URL: zod_1.z.string().url().default('http://localhost:3003'),
    CALENDAR_SERVICE_URL: zod_1.z.string().url().default('http://localhost:3004'),
    WORKFLOW_SERVICE_URL: zod_1.z.string().url().default('http://localhost:3005'),
    GATEWAY_SERVICE_URL: zod_1.z.string().url().default('http://localhost:4000'),
    INTELLIGENCE_SERVICE_URL: zod_1.z.string().url().default('http://localhost:3002'),
    ACTIONS_SERVICE_URL: zod_1.z.string().url().default('http://localhost:3006'),
    DECISIONS_SERVICE_URL: zod_1.z.string().url().default('http://localhost:3007'),
    // OAuth - Google (configured in Supabase Dashboard)
    GOOGLE_CLIENT_ID: zod_1.z.string().optional(),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().optional(),
    GOOGLE_REDIRECT_URI: zod_1.z.string().optional(),
    GOOGLE_IOS_CLIENT_ID: zod_1.z.string().optional(), // For iOS mobile app
    // OAuth - Microsoft (configured in Supabase Dashboard)
    AZURE_CLIENT_ID: zod_1.z.string().optional(),
    AZURE_CLIENT_SECRET: zod_1.z.string().optional(),
    AZURE_TENANT_ID: zod_1.z.string().optional(),
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
    if (!exports.env.KAFKA_BROKERS) {
        return [];
    }
    return exports.env.KAFKA_BROKERS.split(',').map(b => b.trim());
}
/**
 * Get allowed CORS origins as array
 */
function getAllowedOrigins() {
    return exports.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
}
