/**
 * Model Client Factory
 */
import type { ModelClient } from '../../types';
export declare class ModelClientFactory {
    private static clients;
    /**
     * Get or create a model client
     */
    static getClient(modelId: string): ModelClient;
    /**
     * Create a new model client
     */
    private static createClient;
    /**
     * Clear all cached clients
     */
    static clearCache(): void;
}
export { OpenAIClient } from './openai-client';
export { AnthropicClient } from './anthropic-client';
//# sourceMappingURL=index.d.ts.map