"use strict";
/**
 * Database Helper Utilities for Optimized Schema
 * These helpers make it easy to work with JSONB intelligence data
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEmailIntelligence = updateEmailIntelligence;
exports.addAutonomousAction = addAutonomousAction;
exports.addSuggestedAction = addSuggestedAction;
exports.groupEmailsByThread = groupEmailsByThread;
exports.getDefaultEmailIntelligence = getDefaultEmailIntelligence;
exports.updateContactIntelligence = updateContactIntelligence;
exports.getDefaultContactIntelligence = getDefaultContactIntelligence;
exports.updateEventIntelligence = updateEventIntelligence;
exports.addEventConflict = addEventConflict;
exports.addEventOptimization = addEventOptimization;
exports.getDefaultEventIntelligence = getDefaultEventIntelligence;
exports.addSubtask = addSubtask;
exports.updateSubtask = updateSubtask;
exports.removeSubtask = removeSubtask;
exports.addTaskDependency = addTaskDependency;
exports.removeTaskDependency = removeTaskDependency;
exports.addTaskBlocker = addTaskBlocker;
exports.getDefaultTaskStructure = getDefaultTaskStructure;
exports.updateTaskIntelligence = updateTaskIntelligence;
exports.getDefaultTaskIntelligence = getDefaultTaskIntelligence;
exports.createUserIntelligence = createUserIntelligence;
exports.buildJSONBContainsQuery = buildJSONBContainsQuery;
exports.buildJSONBPathQuery = buildJSONBPathQuery;
exports.validateEmailIntelligence = validateEmailIntelligence;
exports.validateTaskStructure = validateTaskStructure;
exports.generateId = generateId;
// =====================================================
// EMAIL HELPERS
// =====================================================
/**
 * Safely update email intelligence JSONB
 */
function updateEmailIntelligence(current, updates) {
    return {
        ...current,
        ...updates,
    };
}
/**
 * Add an autonomous action to email intelligence
 */
function addAutonomousAction(intelligence, action) {
    return {
        ...intelligence,
        autonomous_actions_taken: [
            ...intelligence.autonomous_actions_taken,
            {
                ...action,
                timestamp: new Date().toISOString(),
            },
        ],
    };
}
/**
 * Add a suggested action to email intelligence
 */
function addSuggestedAction(intelligence, action) {
    return {
        ...intelligence,
        suggested_actions: [
            ...intelligence.suggested_actions,
            action,
        ],
    };
}
/**
 * Group emails by thread
 * This replaces the old email_threads table
 */
function groupEmailsByThread(emails) {
    const threads = new Map();
    for (const email of emails) {
        const key = `${email.provider}:${email.provider_thread_id}`;
        if (!threads.has(key)) {
            threads.set(key, []);
        }
        threads.get(key).push(email);
    }
    return Array.from(threads.values()).map((threadEmails) => {
        // Sort by sent_at
        threadEmails.sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());
        return {
            user_id: threadEmails[0].user_id,
            provider: threadEmails[0].provider,
            provider_thread_id: threadEmails[0].provider_thread_id,
            subject: threadEmails[0].subject || '',
            message_count: threadEmails.length,
            last_message_at: threadEmails[threadEmails.length - 1].sent_at,
            is_unread: threadEmails.some((e) => e.is_unread),
            is_starred: threadEmails.some((e) => e.is_starred),
            labels: [...new Set(threadEmails.flatMap((e) => e.labels))],
            metadata: {
                participants: [...new Set(threadEmails.map((e) => e.from_email))],
                first_message_at: threadEmails[0].sent_at,
                snippet: threadEmails[threadEmails.length - 1].snippet || '',
            },
        };
    });
}
/**
 * Get default email intelligence
 */
function getDefaultEmailIntelligence() {
    return {
        category: null,
        priority: 5,
        urgency: 'medium',
        requires_response: false,
        ai_summary: null,
        suggested_actions: [],
        autonomous_actions_taken: [],
    };
}
// =====================================================
// CONTACT HELPERS
// =====================================================
/**
 * Update contact intelligence JSONB
 */
function updateContactIntelligence(current, updates) {
    return {
        ...current,
        ...updates,
        stats: {
            ...current.stats,
            ...(updates.stats || {}),
        },
    };
}
/**
 * Get default contact intelligence
 */
function getDefaultContactIntelligence() {
    return {
        strength: 0.5,
        frequency: 'occasional',
        vip: false,
        sentiment: 'neutral',
        topics: [],
        stats: {
            emails_sent: 0,
            emails_received: 0,
            avg_response_time_minutes: null,
        },
        last_interaction_at: null,
    };
}
// =====================================================
// EVENT/CALENDAR HELPERS
// =====================================================
/**
 * Update event intelligence JSONB
 */
function updateEventIntelligence(current, updates) {
    return {
        ...current,
        ...updates,
        brief: current.brief || updates.brief || null,
    };
}
/**
 * Add a conflict to event intelligence
 */
function addEventConflict(intelligence, conflict) {
    return {
        ...intelligence,
        conflicts: [...intelligence.conflicts, conflict],
    };
}
/**
 * Add an optimization suggestion to event intelligence
 */
function addEventOptimization(intelligence, optimization) {
    return {
        ...intelligence,
        optimization_suggestions: [...intelligence.optimization_suggestions, optimization],
    };
}
/**
 * Get default event intelligence
 */
function getDefaultEventIntelligence() {
    return {
        brief: null,
        preparation: [],
        conflicts: [],
        optimization_suggestions: [],
        previous_meetings: [],
        related_emails: [],
        notes: null,
    };
}
// =====================================================
// TASK HELPERS
// =====================================================
/**
 * Add a subtask to task structure
 */
function addSubtask(structure, subtask) {
    return {
        ...structure,
        subtasks: [
            ...structure.subtasks,
            {
                ...subtask,
                status: subtask.status || 'pending',
            },
        ],
    };
}
/**
 * Update a subtask in task structure
 */
function updateSubtask(structure, subtaskId, updates) {
    return {
        ...structure,
        subtasks: structure.subtasks.map((st) => st.id === subtaskId ? { ...st, ...updates } : st),
    };
}
/**
 * Remove a subtask from task structure
 */
function removeSubtask(structure, subtaskId) {
    return {
        ...structure,
        subtasks: structure.subtasks.filter((st) => st.id !== subtaskId),
    };
}
/**
 * Add a dependency to task structure
 */
function addTaskDependency(structure, dependency) {
    return {
        ...structure,
        dependencies: [...structure.dependencies, dependency],
    };
}
/**
 * Remove a dependency from task structure
 */
function removeTaskDependency(structure, taskId) {
    return {
        ...structure,
        dependencies: structure.dependencies.filter((d) => d.task_id !== taskId),
    };
}
/**
 * Add a blocker to task structure
 */
function addTaskBlocker(structure, blocker) {
    return {
        ...structure,
        blockers: [...structure.blockers, blocker],
    };
}
/**
 * Get default task structure
 */
function getDefaultTaskStructure() {
    return {
        subtasks: [],
        dependencies: [],
        blockers: [],
    };
}
/**
 * Update task intelligence
 */
function updateTaskIntelligence(current, updates) {
    return {
        ...current,
        ...updates,
    };
}
/**
 * Get default task intelligence
 */
function getDefaultTaskIntelligence() {
    return {
        complexity: null,
        estimated_duration_minutes: null,
        ai_suggestions: [],
        related_emails: [],
        related_events: [],
    };
}
// =====================================================
// USER INTELLIGENCE HELPERS
// =====================================================
/**
 * Create a user intelligence entry
 */
function createUserIntelligence(userId, type, data, options) {
    return {
        user_id: userId,
        type,
        subtype: options?.subtype || null,
        data,
        confidence: options?.confidence || 0.5,
        status: options?.status || 'detected',
    };
}
// =====================================================
// JSONB QUERY HELPERS
// =====================================================
/**
 * Build a JSONB containment query for Supabase
 * Example: buildJSONBContainsQuery('intelligence', { vip: true })
 * Returns: @> operator query
 */
function buildJSONBContainsQuery(field, value) {
    return JSON.stringify(value);
}
/**
 * Build a JSONB path query for Supabase
 * Example: buildJSONBPathQuery('intelligence', 'category', 'urgent')
 * Returns: intelligence->>'category' = 'urgent'
 */
function buildJSONBPathQuery(field, path, value) {
    return `${field}->>'${path}'='${value}'`;
}
// =====================================================
// VALIDATION HELPERS
// =====================================================
/**
 * Validate email intelligence structure
 */
function validateEmailIntelligence(intelligence) {
    if (!intelligence || typeof intelligence !== 'object')
        return false;
    const i = intelligence;
    return (typeof i.priority === 'number' &&
        i.priority >= 1 &&
        i.priority <= 10 &&
        Array.isArray(i.suggested_actions) &&
        Array.isArray(i.autonomous_actions_taken));
}
/**
 * Validate task structure
 */
function validateTaskStructure(structure) {
    if (!structure || typeof structure !== 'object')
        return false;
    const s = structure;
    return (Array.isArray(s.subtasks) &&
        Array.isArray(s.dependencies) &&
        Array.isArray(s.blockers));
}
/**
 * Generate a UUID (for subtasks, etc.)
 */
function generateId() {
    return crypto.randomUUID();
}
//# sourceMappingURL=helpers.js.map