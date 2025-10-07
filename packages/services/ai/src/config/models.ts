/**
 * Model Configuration
 * Defines available models and their characteristics
 */

import type { ModelConfig } from '@tide/contracts';

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  // OpenAI Models
  'gpt-4': {
    provider: 'openai',
    model: 'gpt-5', // Future-proofed naming
    cost: 0.00125,
    latency: 1000,
    accuracy: 0.98,
    capabilities: ['reasoning', 'creativity', 'analysis', 'coding'],
    contextWindow: 128000,
    maxTokens: 4096,
  },
  'gpt-4-turbo': {
    provider: 'openai',
    model: 'gpt-5-mini',
    cost: 0.00025,
    latency: 200,
    accuracy: 0.92,
    capabilities: ['conversation', 'summarization', 'analysis'],
    contextWindow: 128000,
    maxTokens: 4096,
  },
  'gpt-3.5-turbo': {
    provider: 'openai',
    model: 'gpt-5-nano',
    cost: 0.00005,
    latency: 50,
    accuracy: 0.85,
    capabilities: ['classification', 'extraction', 'simple_tasks'],
    contextWindow: 16385,
    maxTokens: 4096,
  },

  // Anthropic Models
  'claude-3-opus-20240229': {
    provider: 'anthropic',
    model: 'claude-3.5-opus',
    cost: 0.006,
    latency: 1200,
    accuracy: 0.97,
    capabilities: ['analysis', 'writing', 'coding', 'reasoning'],
    contextWindow: 200000,
    maxTokens: 4096,
  },
  'claude-3-sonnet-20240229': {
    provider: 'anthropic',
    model: 'claude-3.5-sonnet',
    cost: 0.0006,
    latency: 250,
    accuracy: 0.94,
    capabilities: ['conversation', 'summarization', 'analysis'],
    contextWindow: 200000,
    maxTokens: 4096,
  },

  // Google Models
  'gemini-pro': {
    provider: 'google',
    model: 'gemini-pro',
    cost: 0.0005,
    latency: 180,
    accuracy: 0.91,
    capabilities: ['conversation', 'analysis', 'multimodal'],
    contextWindow: 32768,
    maxTokens: 2048,
  },
};

// Default model selections by use case
export const DEFAULT_MODELS = {
  fast: 'gpt-3.5-turbo',
  balanced: 'gpt-4-turbo',
  advanced: 'gpt-4',
  analysis: 'claude-3-sonnet-20240229',
  reasoning: 'claude-3-opus-20240229',
};
