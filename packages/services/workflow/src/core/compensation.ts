import { logger } from '@tide/logger';
import {
  WorkflowTransaction,
  TransactionStep,
  WorkflowExecutionId,
  WorkflowStepId,
  StepResult,
  CompensationHandler,
  WorkflowContext,
} from '../types/index.js';

/**
 * Compensation Manager
 *
 * Implements the Saga pattern for managing distributed transactions.
 * Features:
 * - Automatic compensation on failure
 * - Reverse-order rollback
 * - Compensation logging
 * - Failure recovery
 */
export class CompensationManager {
  private compensationHandlers = new Map<string, CompensationHandler>();

  constructor() {
    this.registerDefaultHandlers();
  }

  /**
   * Start a new transaction
   */
  async startTransaction(
    executionId: WorkflowExecutionId
  ): Promise<WorkflowTransaction> {
    const transaction: WorkflowTransaction = {
      id: this.generateTransactionId(),
      workflowExecutionId: executionId,
      steps: [],
      status: 'active',
      startedAt: new Date(),
    };

    logger.info(
      { transactionId: transaction.id, executionId },
      'Transaction started'
    );

    return transaction;
  }

  /**
   * Record a completed step in the transaction
   */
  async recordStep(
    transaction: WorkflowTransaction,
    stepId: WorkflowStepId,
    result: StepResult
  ): Promise<void> {
    const transactionStep: TransactionStep = {
      stepId,
      status: result.success ? 'executed' : 'failed',
      executedAt: new Date(),
      result,
    };

    transaction.steps.push(transactionStep);

    logger.debug(
      {
        transactionId: transaction.id,
        stepId,
        status: transactionStep.status,
      },
      'Step recorded in transaction'
    );
  }

  /**
   * Commit the transaction
   */
  async commit(transaction: WorkflowTransaction): Promise<void> {
    transaction.status = 'committed';
    transaction.completedAt = new Date();

    logger.info(
      {
        transactionId: transaction.id,
        stepCount: transaction.steps.length,
        duration: transaction.completedAt.getTime() - transaction.startedAt.getTime(),
      },
      'Transaction committed'
    );
  }

  /**
   * Rollback the transaction
   */
  async rollback(
    transaction: WorkflowTransaction,
    context: WorkflowContext
  ): Promise<void> {
    logger.warn(
      {
        transactionId: transaction.id,
        stepCount: transaction.steps.length,
      },
      'Starting transaction rollback'
    );

    // Get successfully executed steps
    const executedSteps = transaction.steps.filter(
      step => step.status === 'executed' && step.result?.success
    );

    // Compensate in reverse order
    for (const step of executedSteps.reverse()) {
      await this.compensateStep(step, context, transaction);
    }

    transaction.status = 'rolled_back';
    transaction.completedAt = new Date();

    logger.info(
      {
        transactionId: transaction.id,
        compensatedSteps: executedSteps.filter(s => s.status === 'compensated').length,
      },
      'Transaction rolled back'
    );
  }

  /**
   * Compensate a single step
   */
  private async compensateStep(
    step: TransactionStep,
    context: WorkflowContext,
    transaction: WorkflowTransaction
  ): Promise<void> {
    logger.info(
      {
        transactionId: transaction.id,
        stepId: step.stepId,
      },
      'Compensating step'
    );

    try {
      const handler = this.getCompensationHandler(step.stepId);

      if (handler && step.result) {
        // Execute compensation
        await handler(context, step.result);

        step.status = 'compensated';
        step.compensatedAt = new Date();

        logger.info(
          {
            transactionId: transaction.id,
            stepId: step.stepId,
          },
          'Step compensated successfully'
        );
      } else {
        logger.warn(
          {
            transactionId: transaction.id,
            stepId: step.stepId,
          },
          'No compensation handler found for step'
        );
      }
    } catch (error) {
      logger.error(
        {
          transactionId: transaction.id,
          stepId: step.stepId,
          error,
        },
        'Compensation failed'
      );

      step.compensationResult = {
        success: false,
        error: {
          code: 'COMPENSATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          recoverable: false,
        },
      };

      // Continue with other compensations even if one fails
    }
  }

  /**
   * Register a compensation handler for a step
   */
  registerCompensationHandler(
    stepId: string,
    handler: CompensationHandler
  ): void {
    this.compensationHandlers.set(stepId, handler);
    logger.debug({ stepId }, 'Compensation handler registered');
  }

  /**
   * Get compensation handler for a step
   */
  private getCompensationHandler(
    stepId: WorkflowStepId
  ): CompensationHandler | undefined {
    return this.compensationHandlers.get(stepId);
  }

  /**
   * Register default compensation handlers
   */
  private registerDefaultHandlers(): void {
    // Email compensation (mark as draft/delete)
    this.compensationHandlers.set('email', async (context, stepResult) => {
      logger.info({ stepResult }, 'Compensating email step');
      // Implementation would depend on email service integration
    });

    // Calendar compensation (delete event)
    this.compensationHandlers.set('calendar', async (context, stepResult) => {
      logger.info({ stepResult }, 'Compensating calendar step');
      // Implementation would depend on calendar service integration
    });

    // Task compensation (delete or reset task)
    this.compensationHandlers.set('task', async (context, stepResult) => {
      logger.info({ stepResult }, 'Compensating task step');
      // Implementation would depend on task service integration
    });

    // File compensation (delete uploaded file)
    this.compensationHandlers.set('file', async (context, stepResult) => {
      logger.info({ stepResult }, 'Compensating file step');
      // Implementation would depend on file service integration
    });

    // Generic compensation handler
    this.compensationHandlers.set('default', async (context, stepResult) => {
      logger.info({ stepResult }, 'Default compensation handler');
      // Log compensation attempt
    });
  }

  /**
   * Generate transaction ID
   */
  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Saga Orchestrator
 *
 * High-level orchestrator for Saga pattern workflows.
 * Manages complex multi-step transactions with automatic compensation.
 */
export class SagaOrchestrator {
  constructor(private compensationManager: CompensationManager) {}

  /**
   * Execute a saga workflow
   */
  async executeSaga(
    executionId: WorkflowExecutionId,
    steps: Array<{
      stepId: WorkflowStepId;
      execute: () => Promise<StepResult>;
      compensate?: CompensationHandler;
    }>,
    context: WorkflowContext
  ): Promise<SagaResult> {
    const transaction = await this.compensationManager.startTransaction(
      executionId
    );

    try {
      // Execute each step
      for (const step of steps) {
        // Register compensation handler if provided
        if (step.compensate) {
          this.compensationManager.registerCompensationHandler(
            step.stepId,
            step.compensate
          );
        }

        // Execute step
        logger.info({ stepId: step.stepId }, 'Executing saga step');
        const result = await step.execute();

        // Record step in transaction
        await this.compensationManager.recordStep(
          transaction,
          step.stepId,
          result
        );

        // Check if step failed
        if (!result.success) {
          throw new SagaExecutionError(
            `Step ${step.stepId} failed: ${result.error?.message}`,
            result.error
          );
        }

        // Update context
        if (result.output) {
          context.outputs[step.stepId] = result.output;
        }
      }

      // All steps succeeded, commit transaction
      await this.compensationManager.commit(transaction);

      return {
        success: true,
        transaction,
      };
    } catch (error) {
      logger.error({ error, transactionId: transaction.id }, 'Saga execution failed');

      // Compensate in reverse order
      await this.compensationManager.rollback(transaction, context);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        transaction,
      };
    }
  }
}

/**
 * Saga execution result
 */
export interface SagaResult {
  success: boolean;
  error?: string;
  transaction: WorkflowTransaction;
}

/**
 * Saga execution error
 */
export class SagaExecutionError extends Error {
  constructor(
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SagaExecutionError';
  }
}
