/**
 * Multi-Model Router
 * Intelligently routes requests to optimal AI models based on requirements
 */
import type { AIRequest, ModelSelection, ModelFamily } from '@tide/contracts';
export declare class MultiModelRouter {
    /**
     * Analyze request and select optimal model(s)
     */
    route(request: AIRequest): Promise<ModelSelection>;
    /**
     * Analyze request to determine routing factors
     */
    private analyzeRequest;
    /**
     * Estimate request complexity
     */
    private estimateComplexity;
    /**
     * Select ensemble of models for critical tasks
     */
    private selectEnsemble;
    /**
     * Select privacy-focused model
     */
    private selectPrivate;
    /**
     * Select fastest model
     */
    private selectFastest;
    /**
     * Select advanced reasoning model
     */
    private selectAdvanced;
    /**
     * Select balanced model (default for most requests)
     */
    private selectBalanced;
    /**
     * Get actual model ID from ModelFamily
     *
     * NOTE: GPT-5 models were released August 7, 2025
     * API model names: gpt-5, gpt-5-mini, gpt-5-nano
     */
    getModelId(family: ModelFamily): string;
}
//# sourceMappingURL=multi-model-router.d.ts.map