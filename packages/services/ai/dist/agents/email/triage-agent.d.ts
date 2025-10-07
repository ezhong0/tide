/**
 * Email Triage Agent
 * Analyzes emails and determines priority, urgency, and classification
 */
import type { AgentTask } from '@tide/contracts';
import type { AgentExecutionContext } from '../../types/index.js';
import { BaseAgent } from '../base-agent.js';
export declare class EmailTriageAgent extends BaseAgent {
    constructor();
    protected run(task: AgentTask, context: AgentExecutionContext): Promise<any>;
    protected calculateConfidence(output: any): number;
}
//# sourceMappingURL=triage-agent.d.ts.map