"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoringConfig = exports.emailServiceConfig = exports.vectorDBConfig = exports.aiServiceConfig = void 0;
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
 * Pinecone vector database configuration
 */
exports.vectorDBConfig = env_1.env.PINECONE_API_KEY && env_1.env.PINECONE_ENVIRONMENT
    ? {
        apiKey: env_1.env.PINECONE_API_KEY,
        environment: env_1.env.PINECONE_ENVIRONMENT,
        indexName: env_1.env.PINECONE_INDEX_NAME,
        dimension: 1536, // OpenAI embedding dimension
        metric: 'cosine',
    }
    : null;
/**
 * Email service configuration
 */
exports.emailServiceConfig = {
    smtp: env_1.env.SMTP_HOST && env_1.env.SMTP_PORT && env_1.env.SMTP_USER && env_1.env.SMTP_PASSWORD
        ? {
            host: env_1.env.SMTP_HOST,
            port: env_1.env.SMTP_PORT,
            user: env_1.env.SMTP_USER,
            password: env_1.env.SMTP_PASSWORD,
            from: env_1.env.SMTP_FROM || 'noreply@tide.ai',
        }
        : null,
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
