/**
 * Model Client Factory
 */
import type { ModelClient } from '../../types/index.js';
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
export { OpenAIClient } from './openai-client.js';
export { AnthropicClient } from './anthropic-client.js';
//# sourceMappingURL=index.d.ts.map