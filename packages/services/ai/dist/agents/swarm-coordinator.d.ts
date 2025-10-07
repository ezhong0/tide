/**
 * Agent Swarm Coordinator
 * Manages the lifecycle and coordination of all agents
 */
import type { AgentType, AgentTask, AgentResult, Intent } from '@tide/contracts';
import type { AgentExecutionContext } from '../types/index.js';
import { BaseAgent } from './base-agent.js';
export declare class SwarmCoordinator {
    private agents;
    constructor();
    /**
     * Register all available agents
     */
    private registerAgents;
    /**
     * Register a single agent
     */
    private register;
    /**
     * Select agents based on detected intents
     */
    selectAgents(intents: Intent[]): BaseAgent[];
    /**
     * Map intent to agent types
     */
    private mapIntentToAgents;
    /**
     * Execute multiple agents in parallel
     */
    executeParallel(tasks: AgentTask[], context: AgentExecutionContext): Promise<AgentResult[]>;
    /**
     * Execute agents with dependency management
     */
    executeDAG(tasks: AgentTask[], context: AgentExecutionContext): Promise<AgentResult[]>;
    /**
     * Wait for dependencies to complete
     */
    private waitForDependencies;
    /**
     * Get agent by type
     */
    getAgent(type: AgentType): BaseAgent | undefined;
    /**
     * List all registered agents
     */
    listAgents(): AgentType[];
}
//# sourceMappingURL=swarm-coordinator.d.ts.map