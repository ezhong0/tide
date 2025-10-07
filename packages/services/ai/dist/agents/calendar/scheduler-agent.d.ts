/**
 * Scheduling Agent
 * Finds optimal meeting times and resolves conflicts
 */
import type { AgentTask } from '@tide/contracts';
import type { AgentExecutionContext } from '../../types/index.js';
import { BaseAgent } from '../base-agent.js';
export declare class SchedulingAgent extends BaseAgent {
    constructor();
    protected run(task: AgentTask, context: AgentExecutionContext): Promise<any>;
    protected calculateConfidence(output: any): number;
}
//# sourceMappingURL=scheduler-agent.d.ts.map