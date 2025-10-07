/**
 * Relationship Agent
 * Tracks and analyzes professional relationships
 */
import type { AgentTask } from '@tide/contracts';
import type { AgentExecutionContext } from '../../types';
import { BaseAgent } from '../base-agent';
export declare class RelationshipAgent extends BaseAgent {
    constructor();
    protected run(task: AgentTask, context: AgentExecutionContext): Promise<any>;
    protected calculateConfidence(output: any): number;
}
//# sourceMappingURL=relationship-agent.d.ts.map