/**
 * Database Helper Utilities for Optimized Schema
 * These helpers make it easy to work with JSONB intelligence data
 */
import type { Email, EmailIntelligence, EmailThread, EventIntelligence, TaskStructure, TaskIntelligence, ContactIntelligence, UserIntelligence, IntelligenceType } from '@tide/types';
/**
 * Safely update email intelligence JSONB
 */
export declare function updateEmailIntelligence(current: EmailIntelligence, updates: Partial<EmailIntelligence>): EmailIntelligence;
/**
 * Add an autonomous action to email intelligence
 */
export declare function addAutonomousAction(intelligence: EmailIntelligence, action: {
    action: string;
    details: Record<string, unknown>;
}): EmailIntelligence;
/**
 * Add a suggested action to email intelligence
 */
export declare function addSuggestedAction(intelligence: EmailIntelligence, action: {
    action: string;
    confidence: number;
}): EmailIntelligence;
/**
 * Group emails by thread
 * This replaces the old email_threads table
 */
export declare function groupEmailsByThread(emails: Email[]): EmailThread[];
/**
 * Get default email intelligence
 */
export declare function getDefaultEmailIntelligence(): EmailIntelligence;
/**
 * Update contact intelligence JSONB
 */
export declare function updateContactIntelligence(current: ContactIntelligence, updates: Partial<ContactIntelligence>): ContactIntelligence;
/**
 * Get default contact intelligence
 */
export declare function getDefaultContactIntelligence(): ContactIntelligence;
/**
 * Update event intelligence JSONB
 */
export declare function updateEventIntelligence(current: EventIntelligence, updates: Partial<EventIntelligence>): EventIntelligence;
/**
 * Add a conflict to event intelligence
 */
export declare function addEventConflict(intelligence: EventIntelligence, conflict: {
    type: string;
    description: string;
    suggested_resolution: string;
}): EventIntelligence;
/**
 * Add an optimization suggestion to event intelligence
 */
export declare function addEventOptimization(intelligence: EventIntelligence, optimization: {
    type: string;
    description: string;
    impact_score: number;
}): EventIntelligence;
/**
 * Get default event intelligence
 */
export declare function getDefaultEventIntelligence(): EventIntelligence;
/**
 * Add a subtask to task structure
 */
export declare function addSubtask(structure: TaskStructure, subtask: {
    id: string;
    title: string;
    description?: string;
    order_index: number;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}): TaskStructure;
/**
 * Update a subtask in task structure
 */
export declare function updateSubtask(structure: TaskStructure, subtaskId: string, updates: {
    title?: string;
    description?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    completed_at?: string;
}): TaskStructure;
/**
 * Remove a subtask from task structure
 */
export declare function removeSubtask(structure: TaskStructure, subtaskId: string): TaskStructure;
/**
 * Add a dependency to task structure
 */
export declare function addTaskDependency(structure: TaskStructure, dependency: {
    task_id: string;
    type: 'blocks' | 'related' | 'parent';
}): TaskStructure;
/**
 * Remove a dependency from task structure
 */
export declare function removeTaskDependency(structure: TaskStructure, taskId: string): TaskStructure;
/**
 * Add a blocker to task structure
 */
export declare function addTaskBlocker(structure: TaskStructure, blocker: {
    reason: string;
    created_at: string;
}): TaskStructure;
/**
 * Get default task structure
 */
export declare function getDefaultTaskStructure(): TaskStructure;
/**
 * Update task intelligence
 */
export declare function updateTaskIntelligence(current: TaskIntelligence, updates: Partial<TaskIntelligence>): TaskIntelligence;
/**
 * Get default task intelligence
 */
export declare function getDefaultTaskIntelligence(): TaskIntelligence;
/**
 * Create a user intelligence entry
 */
export declare function createUserIntelligence(userId: string, type: IntelligenceType, data: Record<string, unknown>, options?: {
    subtype?: string;
    confidence?: number;
    status?: 'detected' | 'suggested' | 'accepted' | 'rejected' | 'active';
}): Omit<UserIntelligence, 'id' | 'created_at' | 'updated_at' | 'last_used_at' | 'usage_count'>;
/**
 * Build a JSONB containment query for Supabase
 * Example: buildJSONBContainsQuery('intelligence', { vip: true })
 * Returns: @> operator query
 */
export declare function buildJSONBContainsQuery(field: string, value: Record<string, unknown>): string;
/**
 * Build a JSONB path query for Supabase
 * Example: buildJSONBPathQuery('intelligence', 'category', 'urgent')
 * Returns: intelligence->>'category' = 'urgent'
 */
export declare function buildJSONBPathQuery(field: string, path: string, value: string): string;
/**
 * Validate email intelligence structure
 */
export declare function validateEmailIntelligence(intelligence: unknown): intelligence is EmailIntelligence;
/**
 * Validate task structure
 */
export declare function validateTaskStructure(structure: unknown): structure is TaskStructure;
/**
 * Generate a UUID (for subtasks, etc.)
 */
export declare function generateId(): string;
//# sourceMappingURL=helpers.d.ts.map