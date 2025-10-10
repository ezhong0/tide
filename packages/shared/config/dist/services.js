"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoringConfig = exports.retryConfig = exports.circuitBreakerConfig = exports.timeouts = exports.serviceUrls = exports.vectorConfig = exports.aiServiceConfig = void 0;
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
 * Internal service URLs configuration
 */
exports.serviceUrls = {
    ai: env_1.env.AI_SERVICE_URL || 'http://localhost:3001',
    email: env_1.env.EMAIL_SERVICE_URL || 'http://localhost:3003',
    calendar: env_1.env.CALENDAR_SERVICE_URL || 'http://localhost:3004',
    workflow: env_1.env.WORKFLOW_SERVICE_URL || 'http://localhost:3005',
    gateway: env_1.env.GATEWAY_SERVICE_URL || 'http://localhost:4000',
    intelligence: env_1.env.INTELLIGENCE_SERVICE_URL || 'http://localhost:3007',
    actions: env_1.env.ACTIONS_SERVICE_URL || 'http://localhost:3006',
    decisions: env_1.env.DECISIONS_SERVICE_URL || 'http://localhost:3008',
    mobileBff: env_1.env.MOBILE_BFF_URL || 'http://localhost:3009',
};
/**
 * Timeout configurations (milliseconds)
 */
exports.timeouts = {
    /** Default timeout for most operations */
    default: parseInt(process.env.TIMEOUT_DEFAULT || '30000'),
    /** Timeout for AI tool execution */
    toolExecution: parseInt(process.env.TIMEOUT_TOOL_EXECUTION || '45000'),
    /** Timeout for external API calls */
    externalApi: parseInt(process.env.TIMEOUT_EXTERNAL_API || '60000'),
    /** Timeout for database queries */
    database: parseInt(process.env.TIMEOUT_DATABASE || '10000'),
    /** Timeout for LLM API calls (OpenAI, Anthropic, etc.) */
    llm: parseInt(process.env.TIMEOUT_LLM || '90000'),
};
/**
 * Circuit breaker configuration
 */
exports.circuitBreakerConfig = {
    /** Percentage of errors before opening circuit (0-100) */
    errorThresholdPercentage: parseFloat(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD || '50'),
    /** Time in ms to wait before attempting reset */
    resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT || '30000'),
    /** Request timeout in ms */
    timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '30000'),
};
/**
 * Retry configuration for external calls
 */
exports.retryConfig = {
    /** Maximum number of retry attempts */
    maxAttempts: parseInt(process.env.RETRY_MAX_ATTEMPTS || '3'),
    /** Multiplier for exponential backoff (e.g., 2 = double each time) */
    backoffMultiplier: parseFloat(process.env.RETRY_BACKOFF_MULTIPLIER || '2'),
    /** Initial delay in ms before first retry */
    initialDelayMs: parseInt(process.env.RETRY_INITIAL_DELAY || '1000'),
    /** Maximum delay in ms between retries */
    maxDelayMs: parseInt(process.env.RETRY_MAX_DELAY || '30000'),
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
