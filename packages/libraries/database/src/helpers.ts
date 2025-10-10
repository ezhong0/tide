/**
 * Database Helper Utilities for Optimized Schema
 * These helpers make it easy to work with JSONB intelligence data
 */

import type {
  Email,
  EmailIntelligence,
  EmailThread,
  Event,
  EventIntelligence,
  Task,
  TaskStructure,
  TaskIntelligence,
  Contact,
  ContactIntelligence,
  UserIntelligence,
  IntelligenceType,
} from '@tide/types';

// =====================================================
// EMAIL HELPERS
// =====================================================

/**
 * Safely update email intelligence JSONB
 */
export function updateEmailIntelligence(
  current: EmailIntelligence,
  updates: Partial<EmailIntelligence>
): EmailIntelligence {
  return {
    ...current,
    ...updates,
  };
}

/**
 * Add an autonomous action to email intelligence
 */
export function addAutonomousAction(
  intelligence: EmailIntelligence,
  action: {
    action: string;
    details: Record<string, unknown>;
  }
): EmailIntelligence {
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
export function addSuggestedAction(
  intelligence: EmailIntelligence,
  action: {
    action: string;
    confidence: number;
  }
): EmailIntelligence {
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
export function groupEmailsByThread(emails: Email[]): EmailThread[] {
  const threads = new Map<string, Email[]>();

  for (const email of emails) {
    const key = `${email.provider}:${email.provider_thread_id}`;
    if (!threads.has(key)) {
      threads.set(key, []);
    }
    threads.get(key)!.push(email);
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
export function getDefaultEmailIntelligence(): EmailIntelligence {
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
export function updateContactIntelligence(
  current: ContactIntelligence,
  updates: Partial<ContactIntelligence>
): ContactIntelligence {
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
export function getDefaultContactIntelligence(): ContactIntelligence {
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
export function updateEventIntelligence(
  current: EventIntelligence,
  updates: Partial<EventIntelligence>
): EventIntelligence {
  return {
    ...current,
    ...updates,
    brief: current.brief || updates.brief || null,
  };
}

/**
 * Add a conflict to event intelligence
 */
export function addEventConflict(
  intelligence: EventIntelligence,
  conflict: {
    type: string;
    description: string;
    suggested_resolution: string;
  }
): EventIntelligence {
  return {
    ...intelligence,
    conflicts: [...intelligence.conflicts, conflict],
  };
}

/**
 * Add an optimization suggestion to event intelligence
 */
export function addEventOptimization(
  intelligence: EventIntelligence,
  optimization: {
    type: string;
    description: string;
    impact_score: number;
  }
): EventIntelligence {
  return {
    ...intelligence,
    optimization_suggestions: [...intelligence.optimization_suggestions, optimization],
  };
}

/**
 * Get default event intelligence
 */
export function getDefaultEventIntelligence(): EventIntelligence {
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
export function addSubtask(
  structure: TaskStructure,
  subtask: {
    id: string;
    title: string;
    description?: string;
    order_index: number;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  }
): TaskStructure {
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
export function updateSubtask(
  structure: TaskStructure,
  subtaskId: string,
  updates: {
    title?: string;
    description?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    completed_at?: string;
  }
): TaskStructure {
  return {
    ...structure,
    subtasks: structure.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, ...updates } : st
    ),
  };
}

/**
 * Remove a subtask from task structure
 */
export function removeSubtask(structure: TaskStructure, subtaskId: string): TaskStructure {
  return {
    ...structure,
    subtasks: structure.subtasks.filter((st) => st.id !== subtaskId),
  };
}

/**
 * Add a dependency to task structure
 */
export function addTaskDependency(
  structure: TaskStructure,
  dependency: {
    task_id: string;
    type: 'blocks' | 'related' | 'parent';
  }
): TaskStructure {
  return {
    ...structure,
    dependencies: [...structure.dependencies, dependency],
  };
}

/**
 * Remove a dependency from task structure
 */
export function removeTaskDependency(
  structure: TaskStructure,
  taskId: string
): TaskStructure {
  return {
    ...structure,
    dependencies: structure.dependencies.filter((d) => d.task_id !== taskId),
  };
}

/**
 * Add a blocker to task structure
 */
export function addTaskBlocker(
  structure: TaskStructure,
  blocker: {
    reason: string;
    created_at: string;
  }
): TaskStructure {
  return {
    ...structure,
    blockers: [...structure.blockers, blocker],
  };
}

/**
 * Get default task structure
 */
export function getDefaultTaskStructure(): TaskStructure {
  return {
    subtasks: [],
    dependencies: [],
    blockers: [],
  };
}

/**
 * Update task intelligence
 */
export function updateTaskIntelligence(
  current: TaskIntelligence,
  updates: Partial<TaskIntelligence>
): TaskIntelligence {
  return {
    ...current,
    ...updates,
  };
}

/**
 * Get default task intelligence
 */
export function getDefaultTaskIntelligence(): TaskIntelligence {
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
export function createUserIntelligence(
  userId: string,
  type: IntelligenceType,
  data: Record<string, unknown>,
  options?: {
    subtype?: string;
    confidence?: number;
    status?: 'detected' | 'suggested' | 'accepted' | 'rejected' | 'active';
  }
): Omit<UserIntelligence, 'id' | 'created_at' | 'updated_at' | 'last_used_at' | 'usage_count'> {
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
export function buildJSONBContainsQuery(field: string, value: Record<string, unknown>): string {
  return JSON.stringify(value);
}

/**
 * Build a JSONB path query for Supabase
 * Example: buildJSONBPathQuery('intelligence', 'category', 'urgent')
 * Returns: intelligence->>'category' = 'urgent'
 */
export function buildJSONBPathQuery(field: string, path: string, value: string): string {
  return `${field}->>'${path}'='${value}'`;
}

// =====================================================
// VALIDATION HELPERS
// =====================================================

/**
 * Validate email intelligence structure
 */
export function validateEmailIntelligence(intelligence: unknown): intelligence is EmailIntelligence {
  if (!intelligence || typeof intelligence !== 'object') return false;

  const i = intelligence as EmailIntelligence;
  return (
    typeof i.priority === 'number' &&
    i.priority >= 1 &&
    i.priority <= 10 &&
    Array.isArray(i.suggested_actions) &&
    Array.isArray(i.autonomous_actions_taken)
  );
}

/**
 * Validate task structure
 */
export function validateTaskStructure(structure: unknown): structure is TaskStructure {
  if (!structure || typeof structure !== 'object') return false;

  const s = structure as TaskStructure;
  return (
    Array.isArray(s.subtasks) &&
    Array.isArray(s.dependencies) &&
    Array.isArray(s.blockers)
  );
}

/**
 * Generate a UUID (for subtasks, etc.)
 */
export function generateId(): string {
  return crypto.randomUUID();
}
