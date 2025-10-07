/**
 * OpenAI Model Client
 */

import OpenAI from 'openai';
import { createLogger } from '@tide/logger';
import type { ModelClient, CompletionOptions, CompletionResult } from '../../types/index.js';

const logger = createLogger({ component: 'OpenAIClient' });

export class OpenAIClient implements ModelClient {
  provider = 'openai';
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async complete(prompt: string, options: CompletionOptions = {}): Promise<CompletionResult> {
    const startTime = Date.now();

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          ...(options.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
          { role: 'user' as const, content: prompt },
        ],
        temperature: options.temperature ?? 0.7,
        max_completion_tokens: options.maxTokens ?? 1000,
        stop: options.stopSequences,
      });

      const latency = Date.now() - startTime;
      const content = response.choices[0]?.message?.content || '';

      logger.debug('OpenAI completion', {
        model: this.model,
        tokensUsed: response.usage?.total_tokens || 0,
        latency,
      });

      return {
        content,
        tokensUsed: response.usage?.total_tokens || 0,
        model: this.model,
        latency,
        finishReason: response.choices[0]?.finish_reason,
      };
    } catch (error) {
      logger.error('OpenAI completion failed', { error, model: this.model });
      throw error;
    }
  }

  async *stream(prompt: string, options: CompletionOptions = {}): AsyncIterable<string> {
    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          ...(options.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
          { role: 'user' as const, content: prompt },
        ],
        temperature: options.temperature ?? 0.7,
        max_completion_tokens: options.maxTokens ?? 1000,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      logger.error('OpenAI stream failed', { error, model: this.model });
      throw error;
    }
  }
}
