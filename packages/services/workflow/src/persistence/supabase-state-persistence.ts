import { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@tide/logger';
import type { StatePersistence } from '../core/state-machine.js';
import type { WorkflowState } from '../types/index.js';

/**
 * Supabase implementation of StatePersistence
 * Stores workflow execution state in workflow_executions table
 *
 * This adapter allows the WorkflowStateMachine to persist state
 * to the database, enabling pause/resume and failure recovery.
 */
export class SupabaseStatePersistence implements StatePersistence {
  constructor(private supabase: SupabaseClient) {}

  async save(state: WorkflowState): Promise<void> {
    try {
      // Convert state.context.stepResults (Map) to plain object
      const stepResultsObj = Object.fromEntries(state.context.stepResults);

      const { error } = await this.supabase
        .from('workflow_executions')
        .insert({
          id: state.id,
          workflow_id: state.workflowId,
          user_id: state.context.variables.userId || 'unknown',
          current_step: state.currentStep,
          status: state.status,
          context: {
            inputs: state.context.inputs,
            outputs: state.context.outputs,
            variables: state.context.variables,
            stepResults: stepResultsObj,
          },
          execution_history: state.history.map(h => ({
            stepId: h.stepId,
            timestamp: h.timestamp.toISOString(),
            status: h.status,
            result: h.result,
            duration: h.duration,
          })),
          started_at: state.createdAt.toISOString(),
          updated_at: state.updatedAt.toISOString(),
        });

      if (error) {
        logger.error({ error, stateId: state.id }, 'Failed to save workflow state');
        throw new Error(`Failed to save state: ${error.message}`);
      }

      logger.debug({ stateId: state.id, status: state.status }, 'Workflow state saved');
    } catch (error) {
      logger.error({ error }, 'Error in save');
      throw error;
    }
  }

  async load(id: string): Promise<WorkflowState | null> {
    try {
      const { data, error } = await this.supabase
        .from('workflow_executions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          logger.debug({ id }, 'Workflow state not found');
          return null;
        }
        logger.error({ error, id }, 'Failed to load workflow state');
        throw new Error(`Failed to load state: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      // Convert database row to WorkflowState
      const context = data.context || {};
      const stepResultsObj = context.stepResults || {};

      const state: WorkflowState = {
        id: data.id as any,
        workflowId: data.workflow_id as any,
        currentStep: data.current_step as any,
        status: data.status,
        context: {
          inputs: context.inputs || {},
          outputs: context.outputs || {},
          variables: context.variables || {},
          // Convert stepResults object back to Map (with type casting for branded types)
          stepResults: new Map(Object.entries(stepResultsObj)) as any,
        },
        history: (data.execution_history || []).map((h: any) => ({
          stepId: h.stepId as any,
          timestamp: new Date(h.timestamp),
          status: h.status,
          result: h.result,
          duration: h.duration,
        })),
        createdAt: new Date(data.started_at),
        updatedAt: new Date(data.updated_at),
      };

      logger.debug({ id, status: state.status }, 'Workflow state loaded');
      return state;
    } catch (error) {
      logger.error({ error }, 'Error in load');
      throw error;
    }
  }

  async update(state: WorkflowState): Promise<void> {
    try {
      // Convert Map to object
      const stepResultsObj = Object.fromEntries(state.context.stepResults);

      const updateData: any = {
        current_step: state.currentStep,
        status: state.status,
        context: {
          inputs: state.context.inputs,
          outputs: state.context.outputs,
          variables: state.context.variables,
          stepResults: stepResultsObj,
        },
        execution_history: state.history.map(h => ({
          stepId: h.stepId,
          timestamp: h.timestamp.toISOString(),
          status: h.status,
          result: h.result,
          duration: h.duration,
        })),
        updated_at: new Date().toISOString(),
      };

      // Add completed_at if workflow is completed
      if (state.status === 'completed' || state.status === 'failed' || state.status === 'cancelled') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await this.supabase
        .from('workflow_executions')
        .update(updateData)
        .eq('id', state.id);

      if (error) {
        logger.error({ error, stateId: state.id }, 'Failed to update workflow state');
        throw new Error(`Failed to update state: ${error.message}`);
      }

      logger.debug({ stateId: state.id, status: state.status }, 'Workflow state updated');
    } catch (error) {
      logger.error({ error }, 'Error in update');
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('workflow_executions')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error({ error, id }, 'Failed to delete workflow state');
        throw new Error(`Failed to delete state: ${error.message}`);
      }

      logger.debug({ id }, 'Workflow state deleted');
    } catch (error) {
      logger.error({ error }, 'Error in delete');
      throw error;
    }
  }
}
