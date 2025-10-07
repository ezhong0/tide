/**
 * Anthropic Model Client
 */
import type { ModelClient, CompletionOptions, CompletionResult } from '../../types/index.js';
export declare class AnthropicClient implements ModelClient {
    provider: string;
    private client;
    private model;
    constructor(apiKey: string, model: string);
    complete(prompt: string, options?: CompletionOptions): Promise<CompletionResult>;
    stream(prompt: string, options?: CompletionOptions): AsyncIterable<string>;
}
//# sourceMappingURL=anthropic-client.d.ts.map