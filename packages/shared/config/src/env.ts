import { z } from 'zod';

/**
 * Environment schema with validation
 */
const EnvSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()).default('4000'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MIN: z.string().transform(Number).pipe(z.number().int().nonnegative()).default('2'),
  DATABASE_POOL_MAX: z.string().transform(Number).pipe(z.number().int().positive()).default('10'),
  DATABASE_SSL: z.string().transform(val => val === 'true').default('false'),

  // Redis
  REDIS_URL: z.string().url(),
  REDIS_MAX_RETRIES: z.string().transform(Number).pipe(z.number().int().positive()).default('3'),

  // Kafka
  KAFKA_BROKERS: z.string(), // Comma-separated list
  KAFKA_CLIENT_ID: z.string().default('tide-platform'),
  KAFKA_GROUP_ID: z.string().default('tide-consumers'),

  // Authentication
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  BCRYPT_ROUNDS: z.string().transform(Number).pipe(z.number().int().min(10).max(15)).default('12'),

  // External Services
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_ORG_ID: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  // OAuth - Gmail
  GMAIL_CLIENT_ID: z.string().optional(),
  GMAIL_CLIENT_SECRET: z.string().optional(),
  GMAIL_REDIRECT_URI: z.string().url().optional(),

  // OAuth - Microsoft Exchange
  EXCHANGE_CLIENT_ID: z.string().optional(),
  EXCHANGE_CLIENT_SECRET: z.string().optional(),
  EXCHANGE_TENANT_ID: z.string().optional(),
  EXCHANGE_REDIRECT_URI: z.string().url().optional(),

  // OAuth - Google Calendar
  GOOGLE_CALENDAR_CLIENT_ID: z.string().optional(),
  GOOGLE_CALENDAR_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALENDAR_REDIRECT_URI: z.string().url().optional(),

  // Vector Database
  PINECONE_API_KEY: z.string().optional(),
  PINECONE_ENVIRONMENT: z.string().optional(),
  PINECONE_INDEX_NAME: z.string().default('tide-embeddings'),

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

  // WebSocket
  WEBSOCKET_PORT: z.string().transform(Number).pipe(z.number().int().positive()).default('4003'),
  WEBSOCKET_CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
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
  return env.KAFKA_BROKERS.split(',').map(b => b.trim());
}

/**
 * Get allowed CORS origins as array
 */
export function getAllowedOrigins(): string[] {
  return env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
}

/**
 * Get WebSocket CORS origins as array
 */
export function getWebSocketOrigins(): string[] {
  return env.WEBSOCKET_CORS_ORIGINS.split(',').map(o => o.trim());
}
