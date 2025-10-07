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

/**
 * Vector Embeddings Configuration
 *
 * Week 3 Alpha uses pgvector (PostgreSQL extension) instead of Pinecone.
 * Embeddings are stored directly in PostgreSQL via Supabase.
 */
export const vectorConfig = {
  dimension: 1536, // OpenAI embedding dimension
  metric: 'cosine',
  // pgvector is available via Supabase PostgreSQL
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
