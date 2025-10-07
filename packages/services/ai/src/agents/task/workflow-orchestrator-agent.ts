/**
 * Workflow Orchestrator Agent
 * Designs and manages complex multi-step workflows
 */

import type { AgentTask, AgentConfig } from '@tide/contracts';
import type { AgentExecutionContext } from '../../types/index.js';
import { BaseAgent } from '../base-agent.js';

export class WorkflowOrchestratorAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      type: 'task.orchestrator',
      name: 'Workflow Orchestrator Agent',
      description: 'Designs and manages complex workflows',
      capabilities: ['workflow_design', 'dependency_management', 'parallel_execution'],
      defaultModel: 'gpt-5-mini',
      priority: 2,
      enabled: true,
    };
    super(config);
  }

  protected async run(task: AgentTask, context: AgentExecutionContext): Promise<any> {
    const { input } = task;

    const prompt = this.buildPrompt(
      `You are a workflow orchestration assistant. Design an efficient workflow for this task.

Return a JSON object with:
- workflowId: Unique identifier
- name: Workflow name
- steps: Array of { id, name, type, dependencies: [], estimatedDuration, canRunInParallel }
- totalEstimatedTime: Total time in minutes
- criticalPath: Array of step IDs on critical path
- parallelizableSteps: Array of arrays of steps that can run in parallel
- requiredResources: Array of resources needed
- successCriteria: Array of criteria to determine workflow success
- rollbackPlan: Steps to rollback if workflow fails

Task description:`,
      input,
      task.context
    );

    const result = await context.modelClient.complete(prompt, {
      temperature: 0.4,
      maxTokens: 1000,
    });

    return this.parseJSON(result.content, {
      workflowId: '',
      name: '',
      steps: [],
      totalEstimatedTime: 0,
      criticalPath: [],
      parallelizableSteps: [],
      requiredResources: [],
      successCriteria: [],
      rollbackPlan: [],
    });
  }

  protected calculateConfidence(output: any): number {
    const hasSteps = output.steps && output.steps.length > 0;
    return hasSteps ? 0.88 : 0.7;
  }
}
