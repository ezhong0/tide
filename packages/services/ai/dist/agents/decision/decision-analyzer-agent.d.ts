/**
 * Decision Analyzer Agent
 * Analyzes complex decisions with pros/cons and impact assessment
 */
import type { AgentTask } from '@tide/contracts';
import type { AgentExecutionContext } from '../../types';
import { BaseAgent } from '../base-agent';
export declare class DecisionAnalyzerAgent extends BaseAgent {
    constructor();
    protected run(task: AgentTask, context: AgentExecutionContext): Promise<any>;
    protected calculateConfidence(output: any): number;
}
//# sourceMappingURL=decision-analyzer-agent.d.ts.map