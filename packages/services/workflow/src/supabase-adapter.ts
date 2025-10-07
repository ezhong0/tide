/**
 * Supabase Adapter for Workflow Engine
 *
 * This adapter allows the workflow engine (originally built for PostgreSQL Pool)
 * to work with Supabase client
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@tide/logger';

/**
 * Simple adapter to make Supabase client work like a Pool for the workflow engine
 * This allows us to use the existing workflow engine code with minimal changes
 */
export class SupabasePoolAdapter {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Execute a SQL query (wrapper for Supabase RPC or raw SQL)
   */
  async query(sql: string, params?: any[]): Promise<any> {
    try {
      // For simple queries, we'll use the Supabase RPC or client methods
      // For now, this is a placeholder - in production, you'd use Supabase's query methods
      logger.warn({ sql }, 'Direct SQL query attempted - consider using Supabase client methods');

      // Return empty result for now - we'll use Supabase client methods directly
      return { rows: [], rowCount: 0 };
    } catch (error) {
      logger.error({ error, sql }, 'Query failed');
      throw error;
    }
  }

  /**
   * End connection (no-op for Supabase)
   */
  async end(): Promise<void> {
    // Supabase client doesn't need to be closed
    return Promise.resolve();
  }
}

/**
 * Supabase-native task repository
 * Uses Supabase client methods instead of raw SQL
 */
export class SupabaseTaskRepository {
  // Mock pool for interface compatibility
  pool: any = null;

  constructor(private supabase: SupabaseClient) {}

  async createTask(task: any): Promise<any> {
    const { data, error } = await this.supabase
      .from('tasks')
      .insert({
        user_id: task.userId,
        title: task.title,
        description: task.description,
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        due_at: task.dueDate,
        metadata: task.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapTaskFromDb(data);
  }

  async getTask(taskId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return this.mapTaskFromDb(data);
  }

  async getReadyTasks(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('priority_score', { ascending: false })
      .order('due_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(this.mapTaskFromDb);
  }

  async updateTask(task: any): Promise<void> {
    const { error } = await this.supabase
      .from('tasks')
      .update({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        progress: task.progress,
        due_at: task.dueDate,
        completed_at: task.completedAt,
        started_at: task.startedAt,
        metadata: task.metadata,
      })
      .eq('id', task.id);

    if (error) throw error;
  }

  async deleteTask(taskId: string): Promise<void> {
    const { error } = await this.supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  }

  async createSubtask(subtask: any): Promise<void> {
    const { error } = await this.supabase
      .from('subtasks')
      .insert({
        parent_id: subtask.parentId,
        title: subtask.title,
        description: subtask.description,
        order_index: subtask.order,
        estimated_time_minutes: subtask.estimatedTime,
        status: subtask.status || 'pending',
      });

    if (error) throw error;
  }

  async addDependency(dependency: any): Promise<void> {
    const { error } = await this.supabase
      .from('task_dependencies')
      .insert({
        task_id: dependency.taskId,
        depends_on_task_id: dependency.dependsOnTaskId,
        dependency_type: dependency.type || 'blocks',
      });

    if (error) throw error;
  }

  async getDependentTasks(taskId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('task_dependencies')
      .select('task_id')
      .eq('depends_on_task_id', taskId);

    if (error) throw error;
    return (data || []).map((d: any) => d.task_id);
  }

  // Interface compatibility methods
  async getTasksByUser(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(this.mapTaskFromDb);
  }

  async getSubtasksByParent(taskId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('subtasks')
      .select('*')
      .eq('parent_id', taskId);

    if (error) throw error;
    return data || [];
  }

  async getTaskDependencies(taskId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('task_dependencies')
      .select('*')
      .eq('task_id', taskId);

    if (error) throw error;
    return data || [];
  }

  async updateSubtask(subtask: any): Promise<void> {
    const { error } = await this.supabase
      .from('subtasks')
      .update(subtask)
      .eq('id', subtask.id);

    if (error) throw error;
  }

  async deleteSubtask(subtaskId: string): Promise<void> {
    const { error } = await this.supabase
      .from('subtasks')
      .delete()
      .eq('id', subtaskId);

    if (error) throw error;
  }

  async recordExecution(execution: any): Promise<void> {
    const { error } = await this.supabase
      .from('task_executions')
      .insert(execution);

    if (error) throw error;
  }

  // Utility methods for interface compatibility
  mapRowToTask(row: any): any {
    return this.mapTaskFromDb(row);
  }

  mapRowToSubtask(row: any): any {
    return row;
  }

  generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private mapTaskFromDb(dbTask: any): any {
    return {
      id: dbTask.id,
      userId: dbTask.user_id,
      title: dbTask.title,
      description: dbTask.description,
      priority: dbTask.priority_score || 0.5,
      dueDate: dbTask.due_at ? new Date(dbTask.due_at) : undefined,
      estimatedDuration: dbTask.estimated_duration_minutes,
      assignee: dbTask.assignee,
      tags: dbTask.tags || [],
      project: dbTask.project,
      status: dbTask.status,
      progress: dbTask.progress || 0,
      complexity: dbTask.complexity,
      metadata: dbTask.metadata || {},
      createdAt: new Date(dbTask.created_at),
      updatedAt: new Date(dbTask.updated_at),
      startedAt: dbTask.started_at ? new Date(dbTask.started_at) : undefined,
      completedAt: dbTask.completed_at ? new Date(dbTask.completed_at) : undefined,
    };
  }
}

/**
 * Supabase-native workflow repository
 */
export class SupabaseWorkflowRepository {
  constructor(private supabase: SupabaseClient) {}

  async saveWorkflow(workflow: any): Promise<void> {
    const { error } = await this.supabase
      .from('workflows')
      .upsert({
        id: workflow.id,
        user_id: workflow.createdBy,
        name: workflow.name,
        description: workflow.description,
        version: workflow.version || 1,
        definition: {
          steps: workflow.steps,
        },
        status: workflow.status || 'active',
        is_active: true,
      });

    if (error) throw error;
  }

  async getWorkflow(workflowId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return this.mapWorkflowFromDb(data);
  }

  async getActiveExecutions(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('workflow_executions')
      .select('*')
      .eq('status', 'running')
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createExecution(execution: any): Promise<any> {
    const { data, error } = await this.supabase
      .from('workflow_executions')
      .insert({
        workflow_id: execution.workflow_id,
        user_id: execution.user_id,
        status: execution.status || 'running',
        context: execution.context || {},
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateExecution(executionId: string, updates: any): Promise<void> {
    const { error } = await this.supabase
      .from('workflow_executions')
      .update(updates)
      .eq('id', executionId);

    if (error) throw error;
  }

  private mapWorkflowFromDb(dbWorkflow: any): any {
    const definition = dbWorkflow.definition || {};
    return {
      id: dbWorkflow.id,
      name: dbWorkflow.name,
      description: dbWorkflow.description,
      version: dbWorkflow.version || 1,
      steps: definition.steps || [],
      createdBy: dbWorkflow.user_id,
      createdAt: new Date(dbWorkflow.created_at),
      updatedAt: new Date(dbWorkflow.updated_at),
      status: dbWorkflow.status,
    };
  }
}

/**
 * Supabase-native pattern repository
 */
export class SupabasePatternRepository {
  // Mock pool for interface compatibility
  pool: any = null;

  constructor(private supabase: SupabaseClient) {}

  async getBehaviors(userId: string, days: number): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await this.supabase
      .from('user_behaviors')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return (data || []).map((b: any) => ({
      userId: b.user_id,
      action: b.action,
      timestamp: new Date(b.timestamp),
      metadata: b.metadata || {},
    }));
  }

  async savePattern(pattern: any): Promise<void> {
    const { error } = await this.supabase
      .from('detected_patterns')
      .upsert({
        id: pattern.id,
        user_id: pattern.userId,
        type: pattern.type,
        subtype: pattern.subtype,
        pattern_data: pattern.patternData,
        confidence: pattern.confidence,
        frequency: pattern.frequency,
        value_estimate: pattern.value,
        description: pattern.description,
        suggestion: pattern.suggestion,
        status: pattern.status || 'detected',
      });

    if (error) throw error;
  }

  async recordSequence(userId: string, actions: string[], signature: string): Promise<void> {
    const { error } = await this.supabase
      .from('pattern_sequences')
      .upsert({
        user_id: userId,
        actions,
        signature,
        count: 1,
        last_seen_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,signature',
      });

    if (error) throw error;
  }

  // Interface compatibility methods
  async recordBehavior(behavior: any): Promise<void> {
    const { error } = await this.supabase
      .from('user_behaviors')
      .insert({
        user_id: behavior.userId,
        action: behavior.action,
        day_of_week: new Date(behavior.timestamp).getDay(),
        hour: new Date(behavior.timestamp).getHours(),
        time_of_day: this.getTimeOfDay(new Date(behavior.timestamp).getHours()),
        metadata: behavior.metadata || {},
        timestamp: behavior.timestamp,
      });

    if (error) throw error;
  }

  async getPatternsByUser(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('detected_patterns')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }

  async updatePatternStatus(patternId: string, status: string): Promise<void> {
    const { error } = await this.supabase
      .from('detected_patterns')
      .update({ status })
      .eq('id', patternId);

    if (error) throw error;
  }

  async getTemporalPatterns(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('temporal_patterns')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }

  async getSequentialPatterns(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('sequential_patterns')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }

  async saveTemporalPattern(pattern: any): Promise<void> {
    const { error } = await this.supabase
      .from('temporal_patterns')
      .insert(pattern);

    if (error) throw error;
  }

  async saveSequentialPattern(pattern: any): Promise<void> {
    const { error } = await this.supabase
      .from('sequential_patterns')
      .insert(pattern);

    if (error) throw error;
  }

  async updateSequence(userId: string, signature: string, updates: any): Promise<void> {
    const { error } = await this.supabase
      .from('pattern_sequences')
      .update(updates)
      .eq('user_id', userId)
      .eq('signature', signature);

    if (error) throw error;
  }

  async getAutomationSuggestions(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('automation_suggestions')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }

  async createAutomationSuggestion(suggestion: any): Promise<void> {
    const { error } = await this.supabase
      .from('automation_suggestions')
      .insert(suggestion);

    if (error) throw error;
  }

  async acceptSuggestion(suggestionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('automation_suggestions')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', suggestionId);

    if (error) throw error;
  }

  async rejectSuggestion(suggestionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('automation_suggestions')
      .update({ status: 'rejected', rejected_at: new Date().toISOString() })
      .eq('id', suggestionId);

    if (error) throw error;
  }

  async saveSuggestion(suggestion: any): Promise<void> {
    return this.createAutomationSuggestion(suggestion);
  }

  async getSuggestionsByUser(userId: string): Promise<any[]> {
    return this.getAutomationSuggestions(userId);
  }

  async getFrequentSequences(userId: string, minCount: number = 3): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('pattern_sequences')
      .select('*')
      .eq('user_id', userId)
      .gte('count', minCount)
      .order('count', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Utility methods for interface compatibility
  mapRowToBehavior(row: any): any {
    return {
      userId: row.user_id,
      action: row.action,
      timestamp: new Date(row.timestamp),
      metadata: row.metadata || {},
    };
  }

  mapRowToPattern(row: any): any {
    return row;
  }

  mapRowToSequence(row: any): any {
    return row;
  }

  generateId(): string {
    return `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getTimeOfDay(hour: number): string {
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }
}
