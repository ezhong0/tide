/**
 * Reasoning Engine
 * Executes multi-step reasoning chains with verification
 */
import type { AIRequest, Intent, ReasoningChain } from '@tide/contracts';
import type { ModelClient } from '../types/index.js';
import type { BaseAgent } from '../agents/base-agent.js';
export declare class ReasoningEngine {
    private chainBuilder;
    private verifier;
    constructor();
    /**
     * Process request with multi-step reasoning
     */
    process(request: AIRequest, intents: Intent[], agents: BaseAgent[], modelClient: ModelClient): Promise<ReasoningChain>;
    /**
     * Execute a single reasoning step
     */
    private executeStep;
    /**
     * Find alternative reasoning approach
     */
    private findAlternativeApproach;
    /**
     * Extract reasoning from output
     */
    private extractReasoning;
    /**
     * Extract factual claims from content
     */
    private extractClaims;
    /**
     * Synthesize conclusion from all steps
     */
    private synthesizeConclusion;
}
//# sourceMappingURL=reasoning-engine.d.ts.map