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
export declare const MODEL_CONFIGS: Record<string, ModelConfig>;
export declare const DEFAULT_MODELS: {
    fast: string;
    balanced: string;
    advanced: string;
    analysis: string;
    reasoning: string;
};
//# sourceMappingURL=models.d.ts.map