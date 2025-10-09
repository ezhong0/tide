import { z } from 'zod';

/**
 * Environment schema with validation
 */
const EnvSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()).default('4000'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Supabase (Core Infrastructure)
  // Made optional to allow services that don't need Supabase (e.g., AI service)
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(), // For mobile apps
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(), // For backend services (bypasses RLS)
  SUPABASE_JWT_SECRET: z.string().optional(),

  // Database (Optional - services use Supabase client)
  DATABASE_URL: z.string().url().optional(),
  DATABASE_POOL_MIN: z.string().transform(Number).pipe(z.number().int().nonnegative()).default('2'),
  DATABASE_POOL_MAX: z.string().transform(Number).pipe(z.number().int().positive()).default('10'),
  DATABASE_SSL: z.string().transform(val => val === 'true').default('false'),

  // Redis (Infrastructure ready, not yet used)
  REDIS_URL: z.string().optional(),
  REDIS_MAX_RETRIES: z.string().transform(Number).pipe(z.number().int().positive()).default('3'),

  // Kafka (Infrastructure ready, not yet used)
  KAFKA_BROKERS: z.string().optional(),
  KAFKA_CLIENT_ID: z.string().default('tide-platform'),
  KAFKA_GROUP_ID: z.string().default('tide-consumers'),

  // External Services
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_ORG_ID: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  // Internal Service URLs
  AI_SERVICE_URL: z.string().url().default('http://localhost:3001'),
  EMAIL_SERVICE_URL: z.string().url().default('http://localhost:3003'),
  CALENDAR_SERVICE_URL: z.string().url().default('http://localhost:3004'),
  WORKFLOW_SERVICE_URL: z.string().url().default('http://localhost:3005'),
  GATEWAY_SERVICE_URL: z.string().url().default('http://localhost:4000'),
  INTELLIGENCE_SERVICE_URL: z.string().url().default('http://localhost:3002'),
  ACTIONS_SERVICE_URL: z.string().url().default('http://localhost:3006'),
  DECISIONS_SERVICE_URL: z.string().url().default('http://localhost:3007'),

  // OAuth - Google (configured in Supabase Dashboard)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().optional(),
  GOOGLE_IOS_CLIENT_ID: z.string().optional(), // For iOS mobile app

  // OAuth - Microsoft (configured in Supabase Dashboard)
  AZURE_CLIENT_ID: z.string().optional(),
  AZURE_CLIENT_SECRET: z.string().optional(),
  AZURE_TENANT_ID: z.string().optional(),

  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  DATADOG_API_KEY: z.string().optional(),

  // Feature Flags
  ENABLE_AI_FEATURES: z.string().transform(val => val === 'true').default('true'),
  ENABLE_EMAIL_SYNC: z.string().transform(val => val === 'true').default('true'),
  ENABLE_CALENDAR_SYNC: z.string().transform(val => val === 'true').default('true'),
  ENABLE_WORKFLOW_ENGINE: z.string().transform(val => val === 'true').default('true'),

  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'), // Comma-separated

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
});

export type Env = z.infer<typeof EnvSchema>;

/**
 * Load and validate environment variables
 */
function loadEnv(): Env {
  try {
    return EnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
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
export const env = loadEnv();

/**
 * Check if running in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if running in test
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * Get Kafka brokers as array
 */
export function getKafkaBrokers(): string[] {
  if (!env.KAFKA_BROKERS) {
    return [];
  }
  return env.KAFKA_BROKERS.split(',').map(b => b.trim());
}

/**
 * Get allowed CORS origins as array
 */
export function getAllowedOrigins(): string[] {
  return env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
}
