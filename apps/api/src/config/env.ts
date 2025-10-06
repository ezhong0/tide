import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  API_URL: z.string().url().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MIN: z.coerce.number().default(2),
  DATABASE_POOL_MAX: z.coerce.number().default(10),

  // Redis
  REDIS_URL: z.string().url(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_TLS_ENABLED: z.coerce.boolean().default(false),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // OAuth - Google
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),

  // OAuth - Microsoft
  MICROSOFT_CLIENT_ID: z.string().optional(),
  MICROSOFT_CLIENT_SECRET: z.string().optional(),
  MICROSOFT_REDIRECT_URI: z.string().url().optional(),

  // OpenAI
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_ORGANIZATION: z.string().optional(),

  // Deepgram
  DEEPGRAM_API_KEY: z.string().optional(),

  // Pinecone
  PINECONE_API_KEY: z.string().optional(),
  PINECONE_ENVIRONMENT: z.string().optional(),
  PINECONE_INDEX_NAME: z.string().default('tide-emails'),

  // AWS
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().optional(),

  // Sentry
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_PRETTY: z.coerce.boolean().default(false),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // Encryption
  ENCRYPTION_KEY: z.string().length(64), // 32 bytes as hex

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3001'),
  CORS_CREDENTIALS: z.coerce.boolean().default(true),

  // WebSocket
  WS_HEARTBEAT_INTERVAL: z.coerce.number().default(30000),
  WS_HEARTBEAT_TIMEOUT: z.coerce.number().default(5000),

  // Feature Flags
  ENABLE_VOICE_COMMANDS: z.coerce.boolean().default(true),
  ENABLE_EMAIL_SENDING: z.coerce.boolean().default(true),
  ENABLE_CALENDAR_INTEGRATION: z.coerce.boolean().default(true),
  ENABLE_LEARNING_ENGINE: z.coerce.boolean().default(true),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validated environment variables
 */
export const env = envSchema.parse(process.env);

/**
 * Check if we're in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if we're in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if we're in test
 */
export const isTest = env.NODE_ENV === 'test';
