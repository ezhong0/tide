"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoringConfig = exports.vectorConfig = exports.aiServiceConfig = void 0;
const env_1 = require("./env");
/**
 * AI service configuration
 */
exports.aiServiceConfig = {
    openai: env_1.env.OPENAI_API_KEY
        ? {
            apiKey: env_1.env.OPENAI_API_KEY,
            orgId: env_1.env.OPENAI_ORG_ID,
            model: 'gpt-4-turbo-preview',
            maxTokens: 4096,
            temperature: 0.7,
        }
        : undefined,
    anthropic: env_1.env.ANTHROPIC_API_KEY
        ? {
            apiKey: env_1.env.ANTHROPIC_API_KEY,
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
exports.vectorConfig = {
    dimension: 1536, // OpenAI embedding dimension
    metric: 'cosine',
    // pgvector is available via Supabase PostgreSQL
};
/**
 * Monitoring configuration
 */
exports.monitoringConfig = {
    sentry: env_1.env.SENTRY_DSN
        ? {
            dsn: env_1.env.SENTRY_DSN,
            environment: env_1.env.NODE_ENV,
            tracesSampleRate: env_1.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        }
        : null,
    datadog: env_1.env.DATADOG_API_KEY
        ? {
            apiKey: env_1.env.DATADOG_API_KEY,
            service: 'tide',
            env: env_1.env.NODE_ENV,
        }
        : null,
};
