/**
 * OpenAI Model Client
 */
import type { ModelClient, CompletionOptions, CompletionResult } from '../../types/index.js';
export declare class OpenAIClient implements ModelClient {
    provider: string;
    private client;
    private model;
    constructor(apiKey: string, model: string);
    complete(prompt: string, options?: CompletionOptions): Promise<CompletionResult>;
    stream(prompt: string, options?: CompletionOptions): AsyncIterable<string>;
}
//# sourceMappingURL=openai-client.d.ts.map