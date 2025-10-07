/**
 * Chain Builder
 * Constructs multi-step reasoning chains from requests
 */
import type { AIRequest, Intent } from '@tide/contracts';
import type { BaseAgent } from '../agents/base-agent.js';
export interface ReasoningLink {
    id: string;
    step: number;
    description: string;
    agentTypes: string[];
    dependencies: string[];
    critical: boolean;
    input: any;
    expectedOutput: string;
}
export interface ReasoningChainPlan {
    chainId: string;
    totalSteps: number;
    links: ReasoningLink[];
    estimatedDuration: number;
    complexity: 'simple' | 'moderate' | 'complex';
}
export declare class ChainBuilder {
    /**
     * Build a reasoning chain from request and agents
     */
    build(request: AIRequest, agents: BaseAgent[], intents: Intent[]): Promise<ReasoningChainPlan>;
    /**
     * Determine complexity of reasoning required
     */
    private determineComplexity;
    /**
     * Build reasoning links
     */
    private buildLinks;
    /**
     * Calculate dependencies between links
     */
    private calculateDependencies;
    /**
     * Map intent to agent types
     */
    private mapIntentToAgents;
}
//# sourceMappingURL=chain-builder.d.ts.map