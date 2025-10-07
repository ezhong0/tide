/**
 * AI Orchestrator
 * Main orchestration layer that coordinates all AI operations
 */
import type { AIRequest, AIResponse } from '@tide/contracts';
export declare class AIOrchestrator {
    private router;
    private swarm;
    private intentDetector;
    private reasoningEngine;
    private learningSystem;
    constructor();
    /**
     * Process an AI request end-to-end
     */
    process(request: AIRequest): Promise<AIResponse>;
    /**
     * Build agent tasks from intents
     */
    private buildAgentTasks;
    /**
     * Map intent category to agent type
     */
    private mapIntentToAgentType;
    /**
     * Generate final response
     */
    private generateResponse;
    /**
     * Build suggested actions from agent results
     */
    private buildSuggestedActions;
    /**
     * Calculate overall confidence
     */
    private calculateOverallConfidence;
    /**
     * Calculate cost based on tokens and model
     */
    private calculateCost;
}
//# sourceMappingURL=ai-orchestrator.d.ts.map