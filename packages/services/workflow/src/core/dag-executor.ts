import { logger } from '@tide/logger';
import {
  WorkflowDefinition,
  WorkflowStep,
  WorkflowStepId,
  WorkflowDAG,
  DAGNode,
  ExecutionPlan,
  ExecutionStage,
  WorkflowContext,
  StepResult,
  StepHandler,
} from '../types';

/**
 * DAG Executor
 *
 * Executes workflows as Directed Acyclic Graphs (DAGs).
 * Features:
 * - Topological sorting for optimal execution order
 * - Parallel execution of independent steps
 * - Dependency resolution
 * - Cycle detection
 */
export class DAGExecutor {
  private handlers = new Map<string, StepHandler>();

  constructor() {
    this.registerDefaultHandlers();
  }

  /**
   * Build DAG from workflow definition
   */
  buildDAG(workflow: WorkflowDefinition): WorkflowDAG {
    const nodes = new Map<WorkflowStepId, DAGNode>();
    const edges = new Map<WorkflowStepId, WorkflowStepId[]>();

    // Create nodes
    for (const step of workflow.steps) {
      const node: DAGNode = {
        id: step.id,
        step,
        dependencies: [],
        dependents: [],
        level: 0,
      };
      nodes.set(step.id, node);
      edges.set(step.id, []);
    }

    // Build edges from step relationships
    for (const step of workflow.steps) {
      const nextSteps = this.getNextSteps(step);

      for (const nextStepId of nextSteps) {
        // Add edge from current to next
        const currentEdges = edges.get(step.id) || [];
        currentEdges.push(nextStepId);
        edges.set(step.id, currentEdges);

        // Update dependency relationships
        const nextNode = nodes.get(nextStepId);
        if (nextNode) {
          nextNode.dependencies.push(step.id);
        }

        const currentNode = nodes.get(step.id);
        if (currentNode) {
          currentNode.dependents.push(nextStepId);
        }
      }
    }

    // Calculate levels (for topological sorting)
    this.calculateLevels(nodes);

    // Detect cycles
    this.detectCycles(nodes, edges);

    // Determine entry and exit points
    const entryPoint = this.findEntryPoint(nodes);
    const exitPoints = this.findExitPoints(nodes);

    logger.info(
      {
        workflowId: workflow.id,
        nodeCount: nodes.size,
        edgeCount: Array.from(edges.values()).reduce((sum, e) => sum + e.length, 0),
      },
      'DAG built successfully'
    );

    return {
      nodes,
      edges,
      entryPoint,
      exitPoints,
    };
  }

  /**
   * Create execution plan from DAG
   */
  createExecutionPlan(dag: WorkflowDAG): ExecutionPlan {
    const stages: ExecutionStage[] = [];
    const visited = new Set<WorkflowStepId>();

    // Group steps by level for parallel execution
    const levelGroups = this.groupByLevel(dag.nodes);

    for (const [level, stepIds] of levelGroups.entries()) {
      const stageSteps = stepIds
        .filter(id => !visited.has(id))
        .map(id => dag.nodes.get(id)!.step);

      if (stageSteps.length > 0) {
        stages.push({
          stageNumber: level,
          steps: stageSteps,
          parallel: stageSteps.length > 1, // Execute in parallel if multiple steps
        });

        // Mark as visited
        for (const stepId of stepIds) {
          visited.add(stepId);
        }
      }
    }

    const totalSteps = Array.from(dag.nodes.values()).length;

    logger.info(
      {
        stageCount: stages.length,
        totalSteps,
        parallelStages: stages.filter(s => s.parallel).length,
      },
      'Execution plan created'
    );

    return {
      stages,
      totalSteps,
    };
  }

  /**
   * Execute workflow according to plan
   */
  async execute(
    plan: ExecutionPlan,
    context: WorkflowContext
  ): Promise<Map<WorkflowStepId, StepResult>> {
    const results = new Map<WorkflowStepId, StepResult>();

    logger.info(
      { stageCount: plan.stages.length, totalSteps: plan.totalSteps },
      'Starting DAG execution'
    );

    for (const stage of plan.stages) {
      logger.info(
        {
          stageNumber: stage.stageNumber,
          stepCount: stage.steps.length,
          parallel: stage.parallel,
        },
        'Executing stage'
      );

      if (stage.parallel && stage.steps.length > 1) {
        // Execute steps in parallel
        const stageResults = await this.executeParallel(stage.steps, context);

        // Merge results
        for (const [stepId, result] of stageResults.entries()) {
          results.set(stepId, result);
          context.stepResults.set(stepId, result);
        }

        // Check if any step failed
        const failed = Array.from(stageResults.values()).find(r => !r.success);
        if (failed) {
          logger.error({ stageNumber: stage.stageNumber }, 'Stage execution failed');
          break; // Stop execution on failure
        }
      } else {
        // Execute steps sequentially
        for (const step of stage.steps) {
          const result = await this.executeStep(step, context);
          results.set(step.id, result);
          context.stepResults.set(step.id, result);

          if (!result.success) {
            logger.error(
              { stepId: step.id, stageNumber: stage.stageNumber },
              'Step execution failed'
            );
            break; // Stop execution on failure
          }
        }
      }
    }

    logger.info(
      {
        totalSteps: results.size,
        successCount: Array.from(results.values()).filter(r => r.success).length,
      },
      'DAG execution completed'
    );

    return results;
  }

  /**
   * Execute steps in parallel
   */
  private async executeParallel(
    steps: WorkflowStep[],
    context: WorkflowContext
  ): Promise<Map<WorkflowStepId, StepResult>> {
    const results = new Map<WorkflowStepId, StepResult>();

    const promises = steps.map(async step => {
      const result = await this.executeStep(step, context);
      return { stepId: step.id, result };
    });

    const settled = await Promise.allSettled(promises);

    for (const outcome of settled) {
      if (outcome.status === 'fulfilled') {
        results.set(outcome.value.stepId, outcome.value.result);
      } else {
        // Handle promise rejection
        logger.error({ error: outcome.reason }, 'Parallel step execution failed');
      }
    }

    return results;
  }

  /**
   * Execute a single step
   */
  private async executeStep(
    step: WorkflowStep,
    context: WorkflowContext
  ): Promise<StepResult> {
    logger.info({ stepId: step.id, stepType: step.type }, 'Executing step');

    try {
      const handler = this.getHandler(step);
      const result = await handler(context, step.config);

      // Update context with result
      if (result.success && result.output) {
        context.outputs[step.id] = result.output;
      }

      return result;
    } catch (error) {
      logger.error({ stepId: step.id, error }, 'Step execution error');

      return {
        success: false,
        error: {
          code: 'STEP_EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          recoverable: false,
        },
      };
    }
  }

  /**
   * Get handler for step
   */
  private getHandler(step: WorkflowStep): StepHandler {
    if (step.config.handler && this.handlers.has(step.config.handler)) {
      return this.handlers.get(step.config.handler)!;
    }

    // Return default handler for step type
    const defaultHandler = this.handlers.get(`default:${step.type}`);
    if (defaultHandler) {
      return defaultHandler;
    }

    // Fallback to generic handler
    return this.handlers.get('default:action')!;
  }

  /**
   * Register a custom step handler
   */
  registerHandler(name: string, handler: StepHandler): void {
    this.handlers.set(name, handler);
    logger.info({ handlerName: name }, 'Handler registered');
  }

  /**
   * Register default handlers
   */
  private registerDefaultHandlers(): void {
    // Action handler
    this.handlers.set('default:action', async (context, config) => {
      logger.debug({ config }, 'Default action handler');
      return { success: true, output: { executed: true } };
    });

    // Decision handler
    this.handlers.set('default:decision', async (context, config) => {
      logger.debug({ config }, 'Default decision handler');
      return { success: true, output: { decision: 'default' } };
    });

    // Parallel handler
    this.handlers.set('default:parallel', async (context, config) => {
      logger.debug({ config }, 'Default parallel handler');
      return { success: true, output: { parallelExecuted: true } };
    });

    // Delay handler
    this.handlers.set('default:delay', async (context, config) => {
      const delay = (config.delay as number) || 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return { success: true, output: { delayed: delay } };
    });
  }

  /**
   * Get next steps from current step
   */
  private getNextSteps(step: WorkflowStep): WorkflowStepId[] {
    const nextSteps: WorkflowStepId[] = [];

    if (step.onSuccess) {
      nextSteps.push(step.onSuccess);
    }

    if (step.onFailure) {
      nextSteps.push(step.onFailure);
    }

    if (step.next) {
      if (typeof step.next === 'string') {
        nextSteps.push(step.next);
      } else {
        // Conditional transitions
        for (const transition of step.next) {
          nextSteps.push(transition.target);
        }
      }
    }

    return nextSteps;
  }

  /**
   * Calculate node levels for topological sorting
   */
  private calculateLevels(nodes: Map<WorkflowStepId, DAGNode>): void {
    const visited = new Set<WorkflowStepId>();
    const temp = new Set<WorkflowStepId>();

    const visit = (nodeId: WorkflowStepId): number => {
      const node = nodes.get(nodeId)!;

      if (temp.has(nodeId)) {
        throw new Error('Circular dependency detected');
      }

      if (visited.has(nodeId)) {
        return node.level;
      }

      temp.add(nodeId);

      let maxLevel = 0;
      for (const depId of node.dependencies) {
        const depLevel = visit(depId);
        maxLevel = Math.max(maxLevel, depLevel + 1);
      }

      node.level = maxLevel;
      temp.delete(nodeId);
      visited.add(nodeId);

      return maxLevel;
    };

    // Visit all nodes
    for (const nodeId of nodes.keys()) {
      if (!visited.has(nodeId)) {
        visit(nodeId);
      }
    }
  }

  /**
   * Detect cycles in the DAG
   */
  private detectCycles(
    nodes: Map<WorkflowStepId, DAGNode>,
    edges: Map<WorkflowStepId, WorkflowStepId[]>
  ): void {
    const visited = new Set<WorkflowStepId>();
    const recStack = new Set<WorkflowStepId>();

    const hasCycle = (nodeId: WorkflowStepId): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = edges.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) {
            return true;
          }
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const nodeId of nodes.keys()) {
      if (!visited.has(nodeId)) {
        if (hasCycle(nodeId)) {
          throw new Error('Workflow contains cycles');
        }
      }
    }
  }

  /**
   * Find entry point (node with no dependencies)
   */
  private findEntryPoint(nodes: Map<WorkflowStepId, DAGNode>): WorkflowStepId {
    for (const [nodeId, node] of nodes.entries()) {
      if (node.dependencies.length === 0) {
        return nodeId;
      }
    }

    throw new Error('No entry point found');
  }

  /**
   * Find exit points (nodes with no dependents)
   */
  private findExitPoints(nodes: Map<WorkflowStepId, DAGNode>): WorkflowStepId[] {
    const exitPoints: WorkflowStepId[] = [];

    for (const [nodeId, node] of nodes.entries()) {
      if (node.dependents.length === 0) {
        exitPoints.push(nodeId);
      }
    }

    return exitPoints;
  }

  /**
   * Group nodes by level
   */
  private groupByLevel(
    nodes: Map<WorkflowStepId, DAGNode>
  ): Map<number, WorkflowStepId[]> {
    const groups = new Map<number, WorkflowStepId[]>();

    for (const [nodeId, node] of nodes.entries()) {
      const group = groups.get(node.level) || [];
      group.push(nodeId);
      groups.set(node.level, group);
    }

    return groups;
  }
}
