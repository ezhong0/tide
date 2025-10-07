/**
 * Base Agent Class
 * All specialized agents extend this base class
 */
import { createLogger } from '@tide/logger';
import type { AgentConfig, AgentTask, AgentResult } from '@tide/contracts';
import type { AgentExecutionContext } from '../types/index.js';
export declare abstract class BaseAgent {
    protected config: AgentConfig;
    protected logger: ReturnType<typeof createLogger>;
    constructor(config: AgentConfig);
    /**
     * Execute the agent's task
     */
    execute(task: AgentTask, context: AgentExecutionContext): Promise<AgentResult>;
    /**
     * Agent-specific execution logic (implemented by subclasses)
     */
    protected abstract run(task: AgentTask, context: AgentExecutionContext): Promise<any>;
    /**
     * Calculate confidence score for the output
     */
    protected calculateConfidence(output: any): number;
    /**
     * Build a prompt for the model
     */
    protected buildPrompt(instruction: string, data: any, context: AgentTask['context']): string;
    /**
     * Parse JSON response safely
     */
    protected parseJSON<T>(text: string, fallback: T): T;
}
//# sourceMappingURL=base-agent.d.ts.map