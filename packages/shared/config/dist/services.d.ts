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
export declare const aiServiceConfig: AIServiceConfig;
/**
 * Vector Embeddings Configuration
 *
 * Week 3 Alpha uses pgvector (PostgreSQL extension) instead of Pinecone.
 * Embeddings are stored directly in PostgreSQL via Supabase.
 */
export declare const vectorConfig: {
    dimension: number;
    metric: string;
};
/**
 * Internal service URLs configuration
 */
export declare const serviceUrls: {
    readonly ai: string;
    readonly email: string;
    readonly calendar: string;
    readonly workflow: string;
    readonly gateway: string;
    readonly intelligence: string;
    readonly actions: string;
    readonly decisions: string;
    readonly mobileBff: string;
};
/**
 * Timeout configurations (milliseconds)
 */
export declare const timeouts: {
    /** Default timeout for most operations */
    readonly default: number;
    /** Timeout for AI tool execution */
    readonly toolExecution: number;
    /** Timeout for external API calls */
    readonly externalApi: number;
    /** Timeout for database queries */
    readonly database: number;
    /** Timeout for LLM API calls (OpenAI, Anthropic, etc.) */
    readonly llm: number;
};
/**
 * Circuit breaker configuration
 */
export declare const circuitBreakerConfig: {
    /** Percentage of errors before opening circuit (0-100) */
    readonly errorThresholdPercentage: number;
    /** Time in ms to wait before attempting reset */
    readonly resetTimeout: number;
    /** Request timeout in ms */
    readonly timeout: number;
};
/**
 * Retry configuration for external calls
 */
export declare const retryConfig: {
    /** Maximum number of retry attempts */
    readonly maxAttempts: number;
    /** Multiplier for exponential backoff (e.g., 2 = double each time) */
    readonly backoffMultiplier: number;
    /** Initial delay in ms before first retry */
    readonly initialDelayMs: number;
    /** Maximum delay in ms between retries */
    readonly maxDelayMs: number;
};
/**
 * Monitoring configuration
 */
export declare const monitoringConfig: {
    sentry: {
        dsn: string;
        environment: "development" | "test" | "staging" | "production";
        tracesSampleRate: number;
    } | null;
    datadog: {
        apiKey: string;
        service: string;
        env: "development" | "test" | "staging" | "production";
    } | null;
};
