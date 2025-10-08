/**
 * OpenAI Model Client
 * Supports GPT-5, GPT-4, and GPT-3.5
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

    logger.info('OpenAI client initialized', { model });
  }

  /**
   * Check if model supports function calling
   */
  private supportsFunctionCalling(): boolean {
    return this.model.includes('gpt-5') ||
           this.model.includes('gpt-4') ||
           this.model.includes('gpt-3.5-turbo');
  }

  /**
   * Check if model supports GPT-5 specific features
   */
  private isGPT5Model(): boolean {
    return this.model.includes('gpt-5');
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

  /**
   * Function calling support for GPT-5
   */
  async completeFunctionCall(
    prompt: string,
    tools: OpenAI.Chat.ChatCompletionTool[],
    options: CompletionOptions & {
      toolChoice?: 'auto' | 'none' | 'required';
      messages?: OpenAI.Chat.ChatCompletionMessageParam[];
      reasoningEffort?: 'minimal' | 'low' | 'medium' | 'high';
      verbosity?: 'low' | 'medium' | 'high';
    } = {}
  ): Promise<OpenAI.Chat.ChatCompletion> {
    const startTime = Date.now();

    if (!this.supportsFunctionCalling()) {
      throw new Error(`Model ${this.model} does not support function calling`);
    }

    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = options.messages || [
        ...(options.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
        { role: 'user' as const, content: prompt },
      ];

      const createOptions: any = {
        model: this.model,
        messages,
        tools,
        tool_choice: options.toolChoice || 'auto',
        temperature: options.temperature ?? 0.7,
        max_completion_tokens: options.maxTokens ?? 2000,
      };

      // Add GPT-5 specific parameters
      if (this.isGPT5Model()) {
        if (options.reasoningEffort) {
          createOptions.reasoning_effort = options.reasoningEffort;
        }
        if (options.verbosity) {
          createOptions.verbosity = options.verbosity;
        }
      }

      const response = await this.client.chat.completions.create(createOptions);

      const latency = Date.now() - startTime;

      logger.debug('OpenAI function calling', {
        model: this.model,
        toolsAvailable: tools.length,
        toolsCalled: response.choices[0]?.message?.tool_calls?.length || 0,
        tokensUsed: response.usage?.total_tokens || 0,
        latency,
      });

      return response;
    } catch (error) {
      logger.error('OpenAI function calling failed', { error, model: this.model });
      throw error;
    }
  }

  /**
   * Get the underlying OpenAI client for advanced use cases
   */
  getClient(): OpenAI {
    return this.client;
  }
}
