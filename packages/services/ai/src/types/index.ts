/**
 * AI Service Internal Types
 */

export * from '@tide/contracts';

// Internal execution types
export interface ModelClient {
  provider: string;
  complete(prompt: string, options?: CompletionOptions): Promise<CompletionResult>;
  stream?(prompt: string, options?: CompletionOptions): AsyncIterable<string>;
}

export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  stopSequences?: string[];
}

export interface CompletionResult {
  content: string;
  tokensUsed: number;
  model: string;
  latency: number;
  finishReason?: string;
}

export interface AgentExecutionContext {
  requestId: string;
  userId: string;
  timestamp: number;
  modelClient: ModelClient;
}
