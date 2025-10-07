/**
 * Model Configuration
 * Defines available models and their characteristics
 *
 * GPT-5 Models Released: August 7, 2025
 * - Context: 272,000 input tokens, 128,000 output tokens
 * - Pricing: See https://openai.com/index/introducing-gpt-5/
 * - 45% fewer factual errors than GPT-4
 * - Knowledge cutoff: September 30, 2024 (GPT-5), May 30, 2024 (mini/nano)
 */

import type { ModelConfig } from '@tide/contracts';

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  // OpenAI GPT-5 Models (Released August 2025)
  'gpt-5': {
    provider: 'openai',
    model: 'gpt-5',
    cost: 0.00125, // $1.25/1M input, $10/1M output (averaged)
    latency: 1000,
    accuracy: 0.98,
    capabilities: ['reasoning', 'creativity', 'analysis', 'coding'],
    contextWindow: 272000, // Input: 272K tokens
    maxTokens: 128000, // Output: 128K tokens (includes reasoning tokens)
  },
  'gpt-5-mini': {
    provider: 'openai',
    model: 'gpt-5-mini',
    cost: 0.00025, // $0.25/1M input, $2.00/1M output (averaged)
    latency: 200,
    accuracy: 0.94,
    capabilities: ['conversation', 'summarization', 'analysis', 'reasoning'],
    contextWindow: 272000, // Input: 272K tokens
    maxTokens: 128000, // Output: 128K tokens
  },
  'gpt-5-nano': {
    provider: 'openai',
    model: 'gpt-5-nano',
    cost: 0.00005, // $0.05/1M input, $0.40/1M output (averaged)
    latency: 50,
    accuracy: 0.88,
    capabilities: ['classification', 'extraction', 'simple_tasks', 'speed'],
    contextWindow: 272000, // Input: 272K tokens
    maxTokens: 128000, // Output: 128K tokens
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

// Default model selections by use case - GPT-5 ONLY
export const DEFAULT_MODELS = {
  fast: 'gpt-5-nano', // Fastest, optimized for speed ($0.05/1M)
  balanced: 'gpt-5-mini', // Best cost/performance balance ($0.25/1M)
  advanced: 'gpt-5', // Full reasoning capabilities ($1.25/1M)
  analysis: 'gpt-5-mini', // GPT-5 mini for analysis tasks
  reasoning: 'gpt-5', // GPT-5 for deep reasoning
};
