/**
 * Model Client Factory
 */

import { createLogger } from '@tide/logger';
import { aiServiceConfig } from '@tide/config';
import type { ModelClient } from '../../types/index.js';
import { OpenAIClient } from './openai-client.js';
import { AnthropicClient } from './anthropic-client.js';

const logger = createLogger({ component: 'ModelClientFactory' });

export class ModelClientFactory {
  private static clients = new Map<string, ModelClient>();

  /**
   * Get or create a model client
   */
  static getClient(modelId: string): ModelClient {
    if (this.clients.has(modelId)) {
      return this.clients.get(modelId)!;
    }

    const client = this.createClient(modelId);
    this.clients.set(modelId, client);
    return client;
  }

  /**
   * Create a new model client
   */
  private static createClient(modelId: string): ModelClient {
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
  static clearCache(): void {
    this.clients.clear();
  }
}

export { OpenAIClient } from './openai-client.js';
export { AnthropicClient } from './anthropic-client.js';
