import { env } from './env';

export interface AIServiceConfig {
  openai?: {
    apiKey: string;
    orgId?: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  anthropic?: {
    apiKey: string;
    model: string;
    maxTokens: number;
  };
}

/**
 * AI service configuration
 */
export const aiServiceConfig: AIServiceConfig = {
  openai: env.OPENAI_API_KEY
    ? {
        apiKey: env.OPENAI_API_KEY,
        orgId: env.OPENAI_ORG_ID,
        model: 'gpt-4-turbo-preview',
        maxTokens: 4096,
        temperature: 0.7,
      }
    : undefined,
  anthropic: env.ANTHROPIC_API_KEY
    ? {
        apiKey: env.ANTHROPIC_API_KEY,
        model: 'claude-3-opus-20240229',
        maxTokens: 4096,
      }
    : undefined,
};

export interface VectorDBConfig {
  apiKey: string;
  environment: string;
  indexName: string;
  dimension: number;
  metric: string;
}

/**
 * Pinecone vector database configuration
 */
export const vectorDBConfig: VectorDBConfig | null = env.PINECONE_API_KEY && env.PINECONE_ENVIRONMENT
  ? {
      apiKey: env.PINECONE_API_KEY,
      environment: env.PINECONE_ENVIRONMENT,
      indexName: env.PINECONE_INDEX_NAME,
      dimension: 1536, // OpenAI embedding dimension
      metric: 'cosine',
    }
  : null;

/**
 * Email service configuration
 */
export const emailServiceConfig = {
  smtp: env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASSWORD
    ? {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        user: env.SMTP_USER,
        password: env.SMTP_PASSWORD,
        from: env.SMTP_FROM || 'noreply@tide.ai',
      }
    : null,
};

/**
 * Monitoring configuration
 */
export const monitoringConfig = {
  sentry: env.SENTRY_DSN
    ? {
        dsn: env.SENTRY_DSN,
        environment: env.NODE_ENV,
        tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
      }
    : null,
  datadog: env.DATADOG_API_KEY
    ? {
        apiKey: env.DATADOG_API_KEY,
        service: 'tide',
        env: env.NODE_ENV,
      }
    : null,
};
