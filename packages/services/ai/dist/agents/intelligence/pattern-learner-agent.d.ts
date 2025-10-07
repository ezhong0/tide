/**
 * Pattern Learner Agent
 * Detects and learns behavioral patterns from user interactions
 */
import type { AgentTask } from '@tide/contracts';
import type { AgentExecutionContext } from '../../types/index.js';
import { BaseAgent } from '../base-agent.js';
export declare class PatternLearnerAgent extends BaseAgent {
    constructor();
    protected run(task: AgentTask, context: AgentExecutionContext): Promise<any>;
    protected calculateConfidence(output: any): number;
}
//# sourceMappingURL=pattern-learner-agent.d.ts.map