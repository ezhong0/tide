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
