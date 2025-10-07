/**
 * Meeting Prep Agent
 * Generates meeting briefs, attendee insights, and talking points
 */
import type { AgentTask } from '@tide/contracts';
import type { AgentExecutionContext } from '../../types/index.js';
import { BaseAgent } from '../base-agent.js';
export declare class MeetingPrepAgent extends BaseAgent {
    constructor();
    protected run(task: AgentTask, context: AgentExecutionContext): Promise<any>;
    protected calculateConfidence(output: any): number;
}
//# sourceMappingURL=meeting-prep-agent.d.ts.map