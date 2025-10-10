/**
 * Supabase Adapter for Workflow Engine
 *
 * This adapter allows the workflow engine (originally built for PostgreSQL Pool)
 * to work with Supabase client
 */
import { SupabaseClient } from '@supabase/supabase-js';
/**
 * Simple adapter to make Supabase client work like a Pool for the workflow engine
 * This allows us to use the existing workflow engine code with minimal changes
 */
export declare class SupabasePoolAdapter {
    private supabase;
    constructor(supabase: SupabaseClient);
    /**
     * Execute a SQL query (wrapper for Supabase RPC or raw SQL)
     */
    query(sql: string, params?: any[]): Promise<any>;
    /**
     * End connection (no-op for Supabase)
     */
    end(): Promise<void>;
}
/**
 * Supabase-native task repository
 * Uses Supabase client methods instead of raw SQL
 * Updated for optimized schema with JSONB structure and intelligence fields
 */
export declare class SupabaseTaskRepository {
    private supabase;
    pool: any;
    constructor(supabase: SupabaseClient);
    createTask(task: any): Promise<any>;
    getTask(taskId: string): Promise<any | null>;
    getReadyTasks(userId: string): Promise<any[]>;
    updateTask(task: any): Promise<void>;
    deleteTask(taskId: string): Promise<void>;
    createSubtask(subtask: any): Promise<void>;
    addDependency(dependency: any): Promise<void>;
    getDependentTasks(taskId: string): Promise<string[]>;
    getTasksByUser(userId: string): Promise<any[]>;
    getSubtasksByParent(taskId: string): Promise<any[]>;
    getTaskDependencies(taskId: string): Promise<any[]>;
    updateSubtask(subtask: any): Promise<void>;
    deleteSubtask(subtaskId: string, parentId: string): Promise<void>;
    recordExecution(execution: any): Promise<void>;
    mapRowToTask(row: any): any;
    mapRowToSubtask(row: any): any;
    generateId(): string;
    private mapTaskFromDb;
}
/**
 * Supabase-native workflow repository
 */
export declare class SupabaseWorkflowRepository {
    private supabase;
    constructor(supabase: SupabaseClient);
    saveWorkflow(workflow: any): Promise<void>;
    getWorkflow(workflowId: string): Promise<any | null>;
    getActiveExecutions(): Promise<any[]>;
    createExecution(execution: any): Promise<any>;
    updateExecution(executionId: string, updates: any): Promise<void>;
    private mapWorkflowFromDb;
}
/**
 * Supabase-native pattern repository
 * Updated for optimized schema using user_intelligence table
 */
export declare class SupabasePatternRepository {
    private supabase;
    pool: any;
    constructor(supabase: SupabaseClient);
    getBehaviors(userId: string, days: number): Promise<any[]>;
    savePattern(pattern: any): Promise<void>;
    recordSequence(userId: string, actions: string[], signature: string): Promise<void>;
    recordBehavior(behavior: any): Promise<void>;
    getPatternsByUser(userId: string): Promise<any[]>;
    updatePatternStatus(patternId: string, status: string): Promise<void>;
    getTemporalPatterns(userId: string): Promise<any[]>;
    getSequentialPatterns(userId: string): Promise<any[]>;
    saveTemporalPattern(pattern: any): Promise<void>;
    saveSequentialPattern(pattern: any): Promise<void>;
    updateSequence(userId: string, signature: string, updates: any): Promise<void>;
    getAutomationSuggestions(userId: string): Promise<any[]>;
    createAutomationSuggestion(suggestion: any): Promise<void>;
    acceptSuggestion(suggestionId: string): Promise<void>;
    rejectSuggestion(suggestionId: string): Promise<void>;
    saveSuggestion(suggestion: any): Promise<void>;
    getSuggestionsByUser(userId: string): Promise<any[]>;
    getFrequentSequences(userId: string, minCount?: number): Promise<any[]>;
    mapRowToBehavior(row: any): any;
    mapRowToPattern(row: any): any;
    mapRowToSequence(row: any): any;
    generateId(): string;
    private getTimeOfDay;
}
//# sourceMappingURL=supabase-adapter.d.ts.map