import { z } from 'zod';
/**
 * Environment schema with validation
 */
declare const EnvSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "test", "staging", "production"]>>;
    PORT: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error"]>>;
    SUPABASE_URL: z.ZodString;
    SUPABASE_ANON_KEY: z.ZodString;
    SUPABASE_SERVICE_ROLE_KEY: z.ZodString;
    SUPABASE_JWT_SECRET: z.ZodOptional<z.ZodString>;
    DATABASE_URL: z.ZodOptional<z.ZodString>;
    DATABASE_POOL_MIN: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    DATABASE_POOL_MAX: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    DATABASE_SSL: z.ZodDefault<z.ZodEffects<z.ZodString, boolean, string>>;
    REDIS_URL: z.ZodOptional<z.ZodString>;
    REDIS_MAX_RETRIES: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    KAFKA_BROKERS: z.ZodOptional<z.ZodString>;
    KAFKA_CLIENT_ID: z.ZodDefault<z.ZodString>;
    KAFKA_GROUP_ID: z.ZodDefault<z.ZodString>;
    OPENAI_API_KEY: z.ZodOptional<z.ZodString>;
    OPENAI_ORG_ID: z.ZodOptional<z.ZodString>;
    ANTHROPIC_API_KEY: z.ZodOptional<z.ZodString>;
    AI_SERVICE_URL: z.ZodDefault<z.ZodString>;
    EMAIL_SERVICE_URL: z.ZodDefault<z.ZodString>;
    CALENDAR_SERVICE_URL: z.ZodDefault<z.ZodString>;
    WORKFLOW_SERVICE_URL: z.ZodDefault<z.ZodString>;
    GATEWAY_SERVICE_URL: z.ZodDefault<z.ZodString>;
    INTELLIGENCE_SERVICE_URL: z.ZodDefault<z.ZodString>;
    ACTIONS_SERVICE_URL: z.ZodDefault<z.ZodString>;
    DECISIONS_SERVICE_URL: z.ZodDefault<z.ZodString>;
    GOOGLE_CLIENT_ID: z.ZodOptional<z.ZodString>;
    GOOGLE_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
    GOOGLE_REDIRECT_URI: z.ZodOptional<z.ZodString>;
    GOOGLE_IOS_CLIENT_ID: z.ZodOptional<z.ZodString>;
    AZURE_CLIENT_ID: z.ZodOptional<z.ZodString>;
    AZURE_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
    AZURE_TENANT_ID: z.ZodOptional<z.ZodString>;
    SENTRY_DSN: z.ZodOptional<z.ZodString>;
    DATADOG_API_KEY: z.ZodOptional<z.ZodString>;
    ENABLE_AI_FEATURES: z.ZodDefault<z.ZodEffects<z.ZodString, boolean, string>>;
    ENABLE_EMAIL_SYNC: z.ZodDefault<z.ZodEffects<z.ZodString, boolean, string>>;
    ENABLE_CALENDAR_SYNC: z.ZodDefault<z.ZodEffects<z.ZodString, boolean, string>>;
    ENABLE_WORKFLOW_ENGINE: z.ZodDefault<z.ZodEffects<z.ZodString, boolean, string>>;
    ALLOWED_ORIGINS: z.ZodDefault<z.ZodString>;
    RATE_LIMIT_WINDOW_MS: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
    RATE_LIMIT_MAX_REQUESTS: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "test" | "staging" | "production";
    PORT: number;
    LOG_LEVEL: "debug" | "info" | "warn" | "error";
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    DATABASE_POOL_MIN: number;
    DATABASE_POOL_MAX: number;
    DATABASE_SSL: boolean;
    REDIS_MAX_RETRIES: number;
    KAFKA_CLIENT_ID: string;
    KAFKA_GROUP_ID: string;
    AI_SERVICE_URL: string;
    EMAIL_SERVICE_URL: string;
    CALENDAR_SERVICE_URL: string;
    WORKFLOW_SERVICE_URL: string;
    GATEWAY_SERVICE_URL: string;
    INTELLIGENCE_SERVICE_URL: string;
    ACTIONS_SERVICE_URL: string;
    DECISIONS_SERVICE_URL: string;
    ENABLE_AI_FEATURES: boolean;
    ENABLE_EMAIL_SYNC: boolean;
    ENABLE_CALENDAR_SYNC: boolean;
    ENABLE_WORKFLOW_ENGINE: boolean;
    ALLOWED_ORIGINS: string;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    SUPABASE_JWT_SECRET?: string | undefined;
    DATABASE_URL?: string | undefined;
    REDIS_URL?: string | undefined;
    KAFKA_BROKERS?: string | undefined;
    OPENAI_API_KEY?: string | undefined;
    OPENAI_ORG_ID?: string | undefined;
    ANTHROPIC_API_KEY?: string | undefined;
    GOOGLE_CLIENT_ID?: string | undefined;
    GOOGLE_CLIENT_SECRET?: string | undefined;
    GOOGLE_REDIRECT_URI?: string | undefined;
    GOOGLE_IOS_CLIENT_ID?: string | undefined;
    AZURE_CLIENT_ID?: string | undefined;
    AZURE_CLIENT_SECRET?: string | undefined;
    AZURE_TENANT_ID?: string | undefined;
    SENTRY_DSN?: string | undefined;
    DATADOG_API_KEY?: string | undefined;
}, {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    NODE_ENV?: "development" | "test" | "staging" | "production" | undefined;
    PORT?: string | undefined;
    LOG_LEVEL?: "debug" | "info" | "warn" | "error" | undefined;
    SUPABASE_JWT_SECRET?: string | undefined;
    DATABASE_URL?: string | undefined;
    DATABASE_POOL_MIN?: string | undefined;
    DATABASE_POOL_MAX?: string | undefined;
    DATABASE_SSL?: string | undefined;
    REDIS_URL?: string | undefined;
    REDIS_MAX_RETRIES?: string | undefined;
    KAFKA_BROKERS?: string | undefined;
    KAFKA_CLIENT_ID?: string | undefined;
    KAFKA_GROUP_ID?: string | undefined;
    OPENAI_API_KEY?: string | undefined;
    OPENAI_ORG_ID?: string | undefined;
    ANTHROPIC_API_KEY?: string | undefined;
    AI_SERVICE_URL?: string | undefined;
    EMAIL_SERVICE_URL?: string | undefined;
    CALENDAR_SERVICE_URL?: string | undefined;
    WORKFLOW_SERVICE_URL?: string | undefined;
    GATEWAY_SERVICE_URL?: string | undefined;
    INTELLIGENCE_SERVICE_URL?: string | undefined;
    ACTIONS_SERVICE_URL?: string | undefined;
    DECISIONS_SERVICE_URL?: string | undefined;
    GOOGLE_CLIENT_ID?: string | undefined;
    GOOGLE_CLIENT_SECRET?: string | undefined;
    GOOGLE_REDIRECT_URI?: string | undefined;
    GOOGLE_IOS_CLIENT_ID?: string | undefined;
    AZURE_CLIENT_ID?: string | undefined;
    AZURE_CLIENT_SECRET?: string | undefined;
    AZURE_TENANT_ID?: string | undefined;
    SENTRY_DSN?: string | undefined;
    DATADOG_API_KEY?: string | undefined;
    ENABLE_AI_FEATURES?: string | undefined;
    ENABLE_EMAIL_SYNC?: string | undefined;
    ENABLE_CALENDAR_SYNC?: string | undefined;
    ENABLE_WORKFLOW_ENGINE?: string | undefined;
    ALLOWED_ORIGINS?: string | undefined;
    RATE_LIMIT_WINDOW_MS?: string | undefined;
    RATE_LIMIT_MAX_REQUESTS?: string | undefined;
}>;
export type Env = z.infer<typeof EnvSchema>;
/**
 * Validated environment variables
 */
export declare const env: {
    NODE_ENV: "development" | "test" | "staging" | "production";
    PORT: number;
    LOG_LEVEL: "debug" | "info" | "warn" | "error";
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    DATABASE_POOL_MIN: number;
    DATABASE_POOL_MAX: number;
    DATABASE_SSL: boolean;
    REDIS_MAX_RETRIES: number;
    KAFKA_CLIENT_ID: string;
    KAFKA_GROUP_ID: string;
    AI_SERVICE_URL: string;
    EMAIL_SERVICE_URL: string;
    CALENDAR_SERVICE_URL: string;
    WORKFLOW_SERVICE_URL: string;
    GATEWAY_SERVICE_URL: string;
    INTELLIGENCE_SERVICE_URL: string;
    ACTIONS_SERVICE_URL: string;
    DECISIONS_SERVICE_URL: string;
    ENABLE_AI_FEATURES: boolean;
    ENABLE_EMAIL_SYNC: boolean;
    ENABLE_CALENDAR_SYNC: boolean;
    ENABLE_WORKFLOW_ENGINE: boolean;
    ALLOWED_ORIGINS: string;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    SUPABASE_JWT_SECRET?: string | undefined;
    DATABASE_URL?: string | undefined;
    REDIS_URL?: string | undefined;
    KAFKA_BROKERS?: string | undefined;
    OPENAI_API_KEY?: string | undefined;
    OPENAI_ORG_ID?: string | undefined;
    ANTHROPIC_API_KEY?: string | undefined;
    GOOGLE_CLIENT_ID?: string | undefined;
    GOOGLE_CLIENT_SECRET?: string | undefined;
    GOOGLE_REDIRECT_URI?: string | undefined;
    GOOGLE_IOS_CLIENT_ID?: string | undefined;
    AZURE_CLIENT_ID?: string | undefined;
    AZURE_CLIENT_SECRET?: string | undefined;
    AZURE_TENANT_ID?: string | undefined;
    SENTRY_DSN?: string | undefined;
    DATADOG_API_KEY?: string | undefined;
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
export {};
