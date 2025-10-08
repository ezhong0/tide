/**
 * Anthropic Model Client
 */

import Anthropic from '@anthropic-ai/sdk';
import { createLogger } from '@tide/logger';
import type { ModelClient, CompletionOptions, CompletionResult } from '../../types/index.js';

const logger = createLogger({ component: 'AnthropicClient' });

export class AnthropicClient implements ModelClient {
  provider = 'anthropic';
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async complete(prompt: string, options: CompletionOptions = {}): Promise<CompletionResult> {
    const startTime = Date.now();

    try {
      // Add timeout to prevent hanging requests (30 seconds default)
      const timeout = options.timeout ?? 30000;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`AI request timed out after ${timeout}ms`)), timeout)
      );

      const response = await Promise.race([
        this.client.messages.create({
          model: this.model,
          max_tokens: options.maxTokens ?? 1000,
          temperature: options.temperature ?? 0.7,
          system: options.systemPrompt,
          messages: [
            { role: 'user', content: prompt },
          ],
          stop_sequences: options.stopSequences,
        }),
        timeoutPromise,
      ]);

      const latency = Date.now() - startTime;
      const content = response.content[0]?.type === 'text' ? response.content[0].text : '';

      logger.debug('Anthropic completion', {
        model: this.model,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        latency,
      });

      return {
        content,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        model: this.model,
        latency,
        finishReason: response.stop_reason || undefined,
      };
    } catch (error) {
      logger.error('Anthropic completion failed', { error, model: this.model });
      throw error;
    }
  }

  async *stream(prompt: string, options: CompletionOptions = {}): AsyncIterable<string> {
    try {
      const stream = await this.client.messages.create({
        model: this.model,
        max_tokens: options.maxTokens ?? 1000,
        temperature: options.temperature ?? 0.7,
        system: options.systemPrompt,
        messages: [
          { role: 'user', content: prompt },
        ],
        stream: true,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          yield event.delta.text;
        }
      }
    } catch (error) {
      logger.error('Anthropic stream failed', { error, model: this.model });
      throw error;
    }
  }
}
