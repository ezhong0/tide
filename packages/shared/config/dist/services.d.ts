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
export declare const vectorDBConfig: VectorDBConfig | null;
/**
 * Email service configuration
 */
export declare const emailServiceConfig: {
    smtp: {
        host: string;
        port: number;
        user: string;
        password: string;
        from: string;
    } | null;
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
