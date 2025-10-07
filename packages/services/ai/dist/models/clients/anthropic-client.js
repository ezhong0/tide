/**
 * Anthropic Model Client
 */
import Anthropic from '@anthropic-ai/sdk';
import { createLogger } from '@tide/logger';
const logger = createLogger({ component: 'AnthropicClient' });
export class AnthropicClient {
    constructor(apiKey, model) {
        this.provider = 'anthropic';
        this.client = new Anthropic({ apiKey });
        this.model = model;
    }
    async complete(prompt, options = {}) {
        const startTime = Date.now();
        try {
            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: options.maxTokens ?? 1000,
                temperature: options.temperature ?? 0.7,
                system: options.systemPrompt,
                messages: [
                    { role: 'user', content: prompt },
                ],
                stop_sequences: options.stopSequences,
            });
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
        }
        catch (error) {
            logger.error('Anthropic completion failed', { error, model: this.model });
            throw error;
        }
    }
    async *stream(prompt, options = {}) {
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
        }
        catch (error) {
            logger.error('Anthropic stream failed', { error, model: this.model });
            throw error;
        }
    }
}
//# sourceMappingURL=anthropic-client.js.map