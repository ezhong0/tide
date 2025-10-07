/**
 * Recommendation Engine Agent
 * Generates personalized recommendations based on context and history
 */
import type { AgentTask } from '@tide/contracts';
import type { AgentExecutionContext } from '../../types';
import { BaseAgent } from '../base-agent';
export declare class RecommendationEngineAgent extends BaseAgent {
    constructor();
    protected run(task: AgentTask, context: AgentExecutionContext): Promise<any>;
    protected calculateConfidence(output: any): number;
}
//# sourceMappingURL=recommendation-engine-agent.d.ts.map