/**
 * Predictive Analyzer Agent
 * Predicts next actions and proactively suggests assistance
 */
import type { AgentTask } from '@tide/contracts';
import type { AgentExecutionContext } from '../../types';
import { BaseAgent } from '../base-agent';
export declare class PredictiveAnalyzerAgent extends BaseAgent {
    constructor();
    protected run(task: AgentTask, context: AgentExecutionContext): Promise<any>;
    protected calculateConfidence(output: any): number;
}
//# sourceMappingURL=predictive-analyzer-agent.d.ts.map