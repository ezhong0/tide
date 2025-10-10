/**
 * Supabase Adapter for Workflow Engine
 *
 * This adapter allows the workflow engine (originally built for PostgreSQL Pool)
 * to work with Supabase client
 */
import { logger } from '@tide/logger';
/**
 * Simple adapter to make Supabase client work like a Pool for the workflow engine
 * This allows us to use the existing workflow engine code with minimal changes
 */
export class SupabasePoolAdapter {
    constructor(supabase) {
        this.supabase = supabase;
    }
    /**
     * Execute a SQL query (wrapper for Supabase RPC or raw SQL)
     */
    async query(sql, params) {
        try {
            // For simple queries, we'll use the Supabase RPC or client methods
            // For now, this is a placeholder - in production, you'd use Supabase's query methods
            logger.warn({ sql }, 'Direct SQL query attempted - consider using Supabase client methods');
            // Return empty result for now - we'll use Supabase client methods directly
            return { rows: [], rowCount: 0 };
        }
        catch (error) {
            logger.error({ error, sql }, 'Query failed');
            throw error;
        }
    }
    /**
     * End connection (no-op for Supabase)
     */
    async end() {
        // Supabase client doesn't need to be closed
        return Promise.resolve();
    }
}
/**
 * Supabase-native task repository
 * Uses Supabase client methods instead of raw SQL
 * Updated for optimized schema with JSONB structure and intelligence fields
 */
export class SupabaseTaskRepository {
    constructor(supabase) {
        this.supabase = supabase;
        // Mock pool for interface compatibility
        this.pool = null;
    }
    async createTask(task) {
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
            structure: {
                subtasks: [],
                dependencies: [],
                blockers: [],
            },
            intelligence: {
                complexity: null,
                estimated_duration_minutes: task.estimatedDuration || null,
                ai_suggestions: [],
                related_emails: [],
                related_events: [],
            },
        })
            .select()
            .single();
        if (error)
            throw error;
        return this.mapTaskFromDb(data);
    }
    async getTask(taskId) {
        const { data, error } = await this.supabase
            .from('tasks')
            .select('*')
            .eq('id', taskId)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null; // Not found
            throw error;
        }
        return this.mapTaskFromDb(data);
    }
    async getReadyTasks(userId) {
        const { data, error } = await this.supabase
            .from('tasks')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'pending')
            .order('priority_score', { ascending: false })
            .order('due_at', { ascending: true });
        if (error)
            throw error;
        return (data || []).map(this.mapTaskFromDb);
    }
    async updateTask(task) {
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
        if (error)
            throw error;
    }
    async deleteTask(taskId) {
        const { error } = await this.supabase
            .from('tasks')
            .delete()
            .eq('id', taskId);
        if (error)
            throw error;
    }
    async createSubtask(subtask) {
        // Get current task
        const { data: task, error: getError } = await this.supabase
            .from('tasks')
            .select('structure')
            .eq('id', subtask.parentId)
            .single();
        if (getError)
            throw getError;
        const structure = task.structure || { subtasks: [], dependencies: [], blockers: [] };
        // Add subtask to JSONB structure
        structure.subtasks.push({
            id: this.generateId(),
            title: subtask.title,
            description: subtask.description || null,
            order_index: subtask.order || structure.subtasks.length,
            status: subtask.status || 'pending',
        });
        // Update task with new structure
        const { error } = await this.supabase
            .from('tasks')
            .update({ structure })
            .eq('id', subtask.parentId);
        if (error)
            throw error;
    }
    async addDependency(dependency) {
        // Get current task
        const { data: task, error: getError } = await this.supabase
            .from('tasks')
            .select('structure')
            .eq('id', dependency.taskId)
            .single();
        if (getError)
            throw getError;
        const structure = task.structure || { subtasks: [], dependencies: [], blockers: [] };
        // Add dependency to JSONB structure
        structure.dependencies.push({
            task_id: dependency.dependsOnTaskId,
            type: dependency.type || 'blocks',
        });
        // Update task with new structure
        const { error } = await this.supabase
            .from('tasks')
            .update({ structure })
            .eq('id', dependency.taskId);
        if (error)
            throw error;
    }
    async getDependentTasks(taskId) {
        // Get the task to find its user_id
        const { data: task } = await this.supabase
            .from('tasks')
            .select('user_id')
            .eq('id', taskId)
            .single();
        if (!task)
            return [];
        // Get all tasks for this user
        const { data: tasks, error } = await this.supabase
            .from('tasks')
            .select('id, structure')
            .eq('user_id', task.user_id);
        if (error)
            throw error;
        // Filter tasks that have this taskId in their dependencies
        return (tasks || [])
            .filter((t) => {
            const deps = t.structure?.dependencies || [];
            return deps.some((d) => d.task_id === taskId);
        })
            .map((t) => t.id);
    }
    // Interface compatibility methods
    async getTasksByUser(userId) {
        const { data, error } = await this.supabase
            .from('tasks')
            .select('*')
            .eq('user_id', userId);
        if (error)
            throw error;
        return (data || []).map(this.mapTaskFromDb);
    }
    async getSubtasksByParent(taskId) {
        const { data, error } = await this.supabase
            .from('tasks')
            .select('structure')
            .eq('id', taskId)
            .single();
        if (error)
            throw error;
        return data?.structure?.subtasks || [];
    }
    async getTaskDependencies(taskId) {
        const { data, error } = await this.supabase
            .from('tasks')
            .select('structure')
            .eq('id', taskId)
            .single();
        if (error)
            throw error;
        return data?.structure?.dependencies || [];
    }
    async updateSubtask(subtask) {
        // Get the parent task
        const { data: task, error: getError } = await this.supabase
            .from('tasks')
            .select('structure')
            .eq('id', subtask.parentId)
            .single();
        if (getError)
            throw getError;
        const structure = task.structure || { subtasks: [], dependencies: [], blockers: [] };
        // Update the subtask in the array
        const subtaskIndex = structure.subtasks.findIndex((st) => st.id === subtask.id);
        if (subtaskIndex >= 0) {
            structure.subtasks[subtaskIndex] = { ...structure.subtasks[subtaskIndex], ...subtask };
            const { error } = await this.supabase
                .from('tasks')
                .update({ structure })
                .eq('id', subtask.parentId);
            if (error)
                throw error;
        }
    }
    async deleteSubtask(subtaskId, parentId) {
        // Get the parent task
        const { data: task, error: getError } = await this.supabase
            .from('tasks')
            .select('structure')
            .eq('id', parentId)
            .single();
        if (getError)
            throw getError;
        const structure = task.structure || { subtasks: [], dependencies: [], blockers: [] };
        // Remove the subtask from the array
        structure.subtasks = structure.subtasks.filter((st) => st.id !== subtaskId);
        const { error } = await this.supabase
            .from('tasks')
            .update({ structure })
            .eq('id', parentId);
        if (error)
            throw error;
    }
    async recordExecution(execution) {
        // Task executions are now tracked via workflow_executions or task metadata
        // For backward compatibility, this is a no-op
        logger.warn('recordExecution called - task executions are now tracked via workflow_executions');
    }
    // Utility methods for interface compatibility
    mapRowToTask(row) {
        return this.mapTaskFromDb(row);
    }
    mapRowToSubtask(row) {
        return row;
    }
    generateId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    mapTaskFromDb(dbTask) {
        const intelligence = dbTask.intelligence || {};
        const structure = dbTask.structure || {};
        return {
            id: dbTask.id,
            userId: dbTask.user_id,
            title: dbTask.title,
            description: dbTask.description,
            priority: dbTask.priority_score || 0.5,
            dueDate: dbTask.due_at ? new Date(dbTask.due_at) : undefined,
            estimatedDuration: intelligence.estimated_duration_minutes,
            assignee: dbTask.assignee,
            tags: dbTask.tags || [],
            project: dbTask.project,
            status: dbTask.status,
            progress: dbTask.progress || 0,
            complexity: intelligence.complexity,
            metadata: dbTask.metadata || {},
            structure: structure,
            intelligence: intelligence,
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
    constructor(supabase) {
        this.supabase = supabase;
    }
    async saveWorkflow(workflow) {
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
        if (error)
            throw error;
    }
    async getWorkflow(workflowId) {
        const { data, error } = await this.supabase
            .from('workflows')
            .select('*')
            .eq('id', workflowId)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw error;
        }
        return this.mapWorkflowFromDb(data);
    }
    async getActiveExecutions() {
        const { data, error } = await this.supabase
            .from('workflow_executions')
            .select('*')
            .eq('status', 'running')
            .order('started_at', { ascending: false });
        if (error)
            throw error;
        return data || [];
    }
    async createExecution(execution) {
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
        if (error)
            throw error;
        return data;
    }
    async updateExecution(executionId, updates) {
        const { error } = await this.supabase
            .from('workflow_executions')
            .update(updates)
            .eq('id', executionId);
        if (error)
            throw error;
    }
    mapWorkflowFromDb(dbWorkflow) {
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
 * Updated for optimized schema using user_intelligence table
 */
export class SupabasePatternRepository {
    constructor(supabase) {
        this.supabase = supabase;
        // Mock pool for interface compatibility
        this.pool = null;
    }
    async getBehaviors(userId, days) {
        // Behaviors are now stored as user_intelligence entries with type 'behavior'
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const { data, error } = await this.supabase
            .from('user_intelligence')
            .select('*')
            .eq('user_id', userId)
            .eq('type', 'behavior')
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false });
        if (error) {
            logger.warn({ error }, 'Failed to get behaviors from user_intelligence');
            return [];
        }
        return (data || []).map((b) => ({
            userId: b.user_id,
            action: b.data?.action || b.subtype,
            timestamp: new Date(b.created_at),
            metadata: b.data || {},
        }));
    }
    async savePattern(pattern) {
        // Patterns are now stored in user_intelligence table
        const { error } = await this.supabase
            .from('user_intelligence')
            .upsert({
            id: pattern.id,
            user_id: pattern.userId,
            type: 'pattern',
            subtype: pattern.subtype || pattern.type,
            data: {
                pattern_data: pattern.patternData,
                frequency: pattern.frequency,
                value_estimate: pattern.value,
                description: pattern.description,
                suggestion: pattern.suggestion,
            },
            confidence: pattern.confidence,
            status: pattern.status || 'detected',
        });
        if (error)
            throw error;
    }
    async recordSequence(userId, actions, signature) {
        // Sequences can be stored as user_intelligence with type 'pattern' and subtype 'sequence'
        const { error } = await this.supabase
            .from('user_intelligence')
            .upsert({
            user_id: userId,
            type: 'pattern',
            subtype: 'sequence',
            data: {
                actions,
                signature,
                count: 1,
            },
            confidence: 0.5,
            status: 'detected',
        });
        if (error)
            logger.warn({ error }, 'Failed to record sequence');
    }
    // Interface compatibility methods
    async recordBehavior(behavior) {
        const { error } = await this.supabase
            .from('user_intelligence')
            .insert({
            user_id: behavior.userId,
            type: 'behavior',
            subtype: behavior.action,
            data: {
                action: behavior.action,
                day_of_week: new Date(behavior.timestamp).getDay(),
                hour: new Date(behavior.timestamp).getHours(),
                time_of_day: this.getTimeOfDay(new Date(behavior.timestamp).getHours()),
                metadata: behavior.metadata || {},
            },
            confidence: 0.5,
            status: 'detected',
        });
        if (error)
            logger.warn({ error }, 'Failed to record behavior');
    }
    async getPatternsByUser(userId) {
        const { data, error } = await this.supabase
            .from('user_intelligence')
            .select('*')
            .eq('user_id', userId)
            .eq('type', 'pattern');
        if (error) {
            logger.warn({ error }, 'Failed to get patterns');
            return [];
        }
        return data || [];
    }
    async updatePatternStatus(patternId, status) {
        const { error } = await this.supabase
            .from('user_intelligence')
            .update({ status })
            .eq('id', patternId);
        if (error)
            logger.warn({ error }, 'Failed to update pattern status');
    }
    async getTemporalPatterns(userId) {
        const { data, error } = await this.supabase
            .from('user_intelligence')
            .select('*')
            .eq('user_id', userId)
            .eq('type', 'pattern')
            .eq('subtype', 'temporal');
        if (error) {
            logger.warn({ error }, 'Failed to get temporal patterns');
            return [];
        }
        return data || [];
    }
    async getSequentialPatterns(userId) {
        const { data, error } = await this.supabase
            .from('user_intelligence')
            .select('*')
            .eq('user_id', userId)
            .eq('type', 'pattern')
            .eq('subtype', 'sequence');
        if (error) {
            logger.warn({ error }, 'Failed to get sequential patterns');
            return [];
        }
        return data || [];
    }
    async saveTemporalPattern(pattern) {
        const { error } = await this.supabase
            .from('user_intelligence')
            .insert({
            user_id: pattern.userId || pattern.user_id,
            type: 'pattern',
            subtype: 'temporal',
            data: pattern,
            confidence: pattern.confidence || 0.5,
            status: 'detected',
        });
        if (error)
            logger.warn({ error }, 'Failed to save temporal pattern');
    }
    async saveSequentialPattern(pattern) {
        const { error } = await this.supabase
            .from('user_intelligence')
            .insert({
            user_id: pattern.userId || pattern.user_id,
            type: 'pattern',
            subtype: 'sequence',
            data: pattern,
            confidence: pattern.confidence || 0.5,
            status: 'detected',
        });
        if (error)
            logger.warn({ error }, 'Failed to save sequential pattern');
    }
    async updateSequence(userId, signature, updates) {
        // Find the sequence by user_id and signature in the data field
        const { data: sequences } = await this.supabase
            .from('user_intelligence')
            .select('*')
            .eq('user_id', userId)
            .eq('type', 'pattern')
            .eq('subtype', 'sequence');
        const sequence = (sequences || []).find((s) => s.data?.signature === signature);
        if (sequence) {
            const { error } = await this.supabase
                .from('user_intelligence')
                .update({ data: { ...sequence.data, ...updates } })
                .eq('id', sequence.id);
            if (error)
                logger.warn({ error }, 'Failed to update sequence');
        }
    }
    async getAutomationSuggestions(userId) {
        const { data, error } = await this.supabase
            .from('user_intelligence')
            .select('*')
            .eq('user_id', userId)
            .eq('type', 'automation_suggestion');
        if (error) {
            logger.warn({ error }, 'Failed to get automation suggestions');
            return [];
        }
        return data || [];
    }
    async createAutomationSuggestion(suggestion) {
        const { error } = await this.supabase
            .from('user_intelligence')
            .insert({
            user_id: suggestion.userId || suggestion.user_id,
            type: 'automation_suggestion',
            subtype: suggestion.type || null,
            data: suggestion,
            confidence: suggestion.confidence || 0.5,
            status: 'detected',
        });
        if (error)
            logger.warn({ error }, 'Failed to create automation suggestion');
    }
    async acceptSuggestion(suggestionId) {
        const { error } = await this.supabase
            .from('user_intelligence')
            .update({ status: 'accepted' })
            .eq('id', suggestionId);
        if (error)
            logger.warn({ error }, 'Failed to accept suggestion');
    }
    async rejectSuggestion(suggestionId) {
        const { error } = await this.supabase
            .from('user_intelligence')
            .update({ status: 'rejected' })
            .eq('id', suggestionId);
        if (error)
            logger.warn({ error }, 'Failed to reject suggestion');
    }
    async saveSuggestion(suggestion) {
        return this.createAutomationSuggestion(suggestion);
    }
    async getSuggestionsByUser(userId) {
        return this.getAutomationSuggestions(userId);
    }
    async getFrequentSequences(userId, minCount = 3) {
        // Get sequences and filter by count in data field
        const { data, error } = await this.supabase
            .from('user_intelligence')
            .select('*')
            .eq('user_id', userId)
            .eq('type', 'pattern')
            .eq('subtype', 'sequence');
        if (error) {
            logger.warn({ error }, 'Failed to get frequent sequences');
            return [];
        }
        return (data || [])
            .filter((s) => (s.data?.count || 0) >= minCount)
            .sort((a, b) => (b.data?.count || 0) - (a.data?.count || 0));
    }
    // Utility methods for interface compatibility
    mapRowToBehavior(row) {
        return {
            userId: row.user_id,
            action: row.action,
            timestamp: new Date(row.timestamp),
            metadata: row.metadata || {},
        };
    }
    mapRowToPattern(row) {
        return row;
    }
    mapRowToSequence(row) {
        return row;
    }
    generateId() {
        return `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getTimeOfDay(hour) {
        if (hour < 6)
            return 'night';
        if (hour < 12)
            return 'morning';
        if (hour < 18)
            return 'afternoon';
        return 'evening';
    }
}
//# sourceMappingURL=supabase-adapter.js.map