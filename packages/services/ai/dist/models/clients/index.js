/**
 * Model Client Factory
 */
import { createLogger } from '@tide/logger';
import { aiServiceConfig } from '@tide/config';
import { OpenAIClient } from './openai-client.js';
import { AnthropicClient } from './anthropic-client.js';
const logger = createLogger({ component: 'ModelClientFactory' });
export class ModelClientFactory {
    /**
     * Get or create a model client
     */
    static getClient(modelId) {
        if (this.clients.has(modelId)) {
            return this.clients.get(modelId);
        }
        const client = this.createClient(modelId);
        this.clients.set(modelId, client);
        return client;
    }
    /**
     * Create a new model client
     */
    static createClient(modelId) {
        // OpenAI models
        if (modelId.startsWith('gpt-')) {
            const apiKey = aiServiceConfig.openai?.apiKey || process.env.OPENAI_API_KEY;
            if (!apiKey) {
                throw new Error('OpenAI API key not configured');
            }
            logger.info('Creating OpenAI client', { model: modelId });
            return new OpenAIClient(apiKey, modelId);
        }
        // Anthropic models
        if (modelId.startsWith('claude-')) {
            const apiKey = aiServiceConfig.anthropic?.apiKey || process.env.ANTHROPIC_API_KEY;
            if (!apiKey) {
                throw new Error('Anthropic API key not configured');
            }
            logger.info('Creating Anthropic client', { model: modelId });
            return new AnthropicClient(apiKey, modelId);
        }
        throw new Error(`Unsupported model: ${modelId}`);
    }
    /**
     * Clear all cached clients
     */
    static clearCache() {
        this.clients.clear();
    }
}
ModelClientFactory.clients = new Map();
export { OpenAIClient } from './openai-client.js';
export { AnthropicClient } from './anthropic-client.js';
//# sourceMappingURL=index.js.map