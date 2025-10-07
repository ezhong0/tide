/**
 * Workflow Orchestrator Agent
 * Designs and manages complex multi-step workflows
 */
import type { AgentTask } from '@tide/contracts';
import type { AgentExecutionContext } from '../../types';
import { BaseAgent } from '../base-agent';
export declare class WorkflowOrchestratorAgent extends BaseAgent {
    constructor();
    protected run(task: AgentTask, context: AgentExecutionContext): Promise<any>;
    protected calculateConfidence(output: any): number;
}
//# sourceMappingURL=workflow-orchestrator-agent.d.ts.map