/**
 * Task Prioritizer Agent
 * Prioritizes tasks based on importance, urgency, and impact
 */
import type { AgentTask } from '@tide/contracts';
import type { AgentExecutionContext } from '../../types';
import { BaseAgent } from '../base-agent';
export declare class TaskPrioritizerAgent extends BaseAgent {
    constructor();
    protected run(task: AgentTask, context: AgentExecutionContext): Promise<any>;
    protected calculateConfidence(output: any): number;
}
//# sourceMappingURL=prioritizer-agent.d.ts.map