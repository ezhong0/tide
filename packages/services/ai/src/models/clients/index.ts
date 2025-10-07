/**
 * Model Client Factory
 *
 * Tide uses GPT-5 models exclusively (gpt-5-mini, gpt-5-nano)
 */

import { createLogger } from '@tide/logger';
import { aiServiceConfig } from '@tide/config';
import type { ModelClient } from '../../types/index.js';
import { OpenAIClient } from './openai-client.js';

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
   *
   * Tide uses GPT-5 models only:
   * - gpt-5-mini: For complex tasks ($0.25/1M tokens)
   * - gpt-5-nano: For fast, simple tasks ($0.05/1M tokens)
   */
  private static createClient(modelId: string): ModelClient {
    // GPT-5 models (only supported models)
    if (modelId.startsWith('gpt-')) {
      const apiKey = aiServiceConfig.openai?.apiKey || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }
      logger.info('Creating OpenAI GPT-5 client', { model: modelId });
      return new OpenAIClient(apiKey, modelId);
    }

    throw new Error(`Unsupported model: ${modelId}. Tide uses GPT-5 models only (gpt-5-mini, gpt-5-nano)`);
  }

  /**
   * Clear all cached clients
   */
  static clearCache(): void {
    this.clients.clear();
  }
}

export { OpenAIClient } from './openai-client.js';
