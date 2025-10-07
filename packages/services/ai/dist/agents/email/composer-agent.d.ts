/**
 * Email Composer Agent
 * Drafts emails with tone matching and context awareness
 */
import type { AgentTask } from '@tide/contracts';
import type { AgentExecutionContext } from '../../types/index.js';
import { BaseAgent } from '../base-agent.js';
export declare class EmailComposerAgent extends BaseAgent {
    constructor();
    protected run(task: AgentTask, context: AgentExecutionContext): Promise<any>;
    protected calculateConfidence(output: any): number;
}
//# sourceMappingURL=composer-agent.d.ts.map