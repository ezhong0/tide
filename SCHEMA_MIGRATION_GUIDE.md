# Schema Migration Guide

## Overview

The database has been optimized from **42 tables to 15 tables** by:
1. Consolidating intelligence data into JSONB columns
2. Eliminating unnecessary normalization
3. Improving query performance with better indexes

## Table Mappings

### Renamed Tables

| Old Name | New Name | Notes |
|----------|----------|-------|
| `user_profiles` | `users` | Consolidated with settings |
| `email_messages` | `emails` | Merged with email_threads |
| `email_threads` | `email_threads` (view) | Now a materialized view on `emails` |
| `calendar_events` | `events` | Consolidated with meeting intelligence |
| `analytics_events` | `events_log` | Clearer naming |

### Consolidated Tables

#### Email Intelligence (5 tables → 1 table + JSONB)
- `email_triage` → `emails.intelligence`
- `email_patterns` → `user_intelligence` (type='email_pattern')
- `autonomous_email_actions` → `emails.intelligence.autonomous_actions_taken`
- `relationship_intelligence` → `contacts.intelligence`

#### Calendar Intelligence (7 tables → 1 table + JSONB)
- `meeting_briefs` → `events.intelligence.brief`
- `scheduling_preferences` → `users.settings`
- `calendar_optimizations` → `events.intelligence.optimization_suggestions`
- `meeting_conflicts` → `events.intelligence.conflicts`
- `smart_scheduling_suggestions` → `user_intelligence` (type='scheduling_suggestion')
- `previous_meeting_notes` → `events.intelligence.notes`

#### Pattern Detection (6 tables → 1 table)
- `user_behaviors` → `user_intelligence` (type='behavioral_pattern')
- `detected_patterns` → `user_intelligence`
- `pattern_sequences` → `user_intelligence` (type='sequence_pattern')
- `temporal_patterns` → `user_intelligence` (type='temporal_pattern')
- `sequential_patterns` → `user_intelligence` (type='sequence_pattern')
- `automation_suggestions` → `user_intelligence` (type='automation_suggestion')

#### Task Management (3 tables → JSONB in tasks)
- `subtasks` → `tasks.structure.subtasks`
- `task_dependencies` → `tasks.structure.dependencies`
- `task_executions` → `workflow_executions` (still separate)

#### Decisions
- `decision_history` → removed (use `decisions` table audit log)
- `user_preferences` → `users.settings`

## Code Migration Patterns

### 1. User Profiles → Users

```typescript
// OLD
await supabase.from('user_profiles').select('*')

// NEW
await supabase.from('users').select('*')
```

### 2. Email Messages → Emails

```typescript
// OLD
await supabase
  .from('email_messages')
  .select('*, email_threads(*)')
  .eq('user_id', userId)

// NEW
await supabase
  .from('emails')
  .select('*')
  .eq('user_id', userId)
  .eq('provider_thread_id', threadId) // if you need thread grouping
```

### 3. Email Threads (now a view)

```typescript
// OLD
await supabase
  .from('email_threads')
  .select('*')
  .eq('user_id', userId)

// NEW (view works the same)
await supabase
  .from('email_threads')
  .select('*')
  .eq('user_id', userId)

// OR query emails directly and group in code
const emails = await supabase
  .from('emails')
  .select('*')
  .eq('user_id', userId)
  .order('sent_at', { ascending: false });

const threads = groupEmailsByThread(emails.data);
```

### 4. Email Triage → Email Intelligence

```typescript
// OLD
await supabase.from('email_triage').insert({
  user_id,
  email_id,
  category: 'urgent',
  priority: 9,
  urgency: 'high'
});

// NEW
await supabase.from('emails').update({
  intelligence: {
    category: 'urgent',
    priority: 9,
    urgency: 'high',
    requires_response: true,
    ai_summary: null,
    suggested_actions: [],
    autonomous_actions_taken: []
  }
}).eq('id', emailId);
```

### 5. Relationship Intelligence → Contacts

```typescript
// OLD
await supabase.from('relationship_intelligence')
  .select('*')
  .eq('user_id', userId)
  .eq('contact_email', email);

// NEW
await supabase.from('contacts')
  .select('*')
  .eq('user_id', userId)
  .eq('email', email);

// Access intelligence
const contact = result.data;
const vipStatus = contact.intelligence.vip;
const strength = contact.intelligence.strength;
```

### 6. Calendar Events → Events

```typescript
// OLD
await supabase.from('calendar_events').select('*')

// NEW
await supabase.from('events').select('*')
```

### 7. Meeting Briefs → Event Intelligence

```typescript
// OLD
await supabase.from('meeting_briefs').insert({
  user_id,
  event_id,
  title,
  key_discussion_points: [],
  preparation_checklist: []
});

// NEW
await supabase.from('events').update({
  intelligence: {
    brief: {
      summary: 'Meeting summary',
      key_discussion_points: [],
      preparation_checklist: [],
      attendee_insights: []
    },
    preparation: [],
    conflicts: [],
    optimization_suggestions: [],
    previous_meetings: [],
    related_emails: [],
    notes: null
  }
}).eq('id', eventId);
```

### 8. Patterns → User Intelligence

```typescript
// OLD - Multiple tables
await supabase.from('email_patterns').insert({ ... });
await supabase.from('temporal_patterns').insert({ ... });
await supabase.from('detected_patterns').insert({ ... });

// NEW - Single table with type discriminator
await supabase.from('user_intelligence').insert({
  user_id,
  type: 'email_pattern', // or 'temporal_pattern', 'sequence_pattern', etc.
  subtype: 'auto_archive',
  data: {
    trigger_conditions: { ... },
    action_taken: 'archive',
    // ... flexible data structure
  },
  confidence: 0.8,
  status: 'detected'
});

// Query by type
await supabase
  .from('user_intelligence')
  .select('*')
  .eq('user_id', userId)
  .eq('type', 'email_pattern')
  .eq('status', 'active');
```

### 9. Subtasks → Task Structure

```typescript
// OLD
await supabase.from('subtasks').insert({
  parent_id: taskId,
  title: 'Subtask 1',
  order_index: 0,
  status: 'pending'
});

// NEW
const task = await supabase.from('tasks').select('*').eq('id', taskId).single();
task.data.structure.subtasks.push({
  id: generateId(),
  title: 'Subtask 1',
  order_index: 0,
  status: 'pending'
});
await supabase.from('tasks').update({
  structure: task.data.structure
}).eq('id', taskId);
```

### 10. User Preferences → User Settings

```typescript
// OLD
await supabase.from('user_preferences')
  .update({ autonomy_level: 'balanced' })
  .eq('user_id', userId);

// NEW
await supabase.from('users')
  .update({
    settings: {
      ...currentSettings,
      autonomy_level: 'balanced'
    }
  })
  .eq('id', userId);
```

## Benefits of New Schema

1. **Fewer Joins**: Most data is denormalized for common queries
2. **Flexible Intelligence**: JSONB allows schema evolution without migrations
3. **Better Indexes**: GIN indexes on JSONB for fast queries
4. **Simpler Queries**: No need to join 5+ tables for basic operations
5. **Easier Evolution**: Add new intelligence fields without schema changes

## Migration Steps

1. **Apply new schema**: Run `optimized_schema.sql` in Supabase SQL Editor
2. **Update TypeScript types**: Already done in `@tide/types`
3. **Update service queries**: See code patterns above
4. **Test thoroughly**: Run integration tests
5. **Deploy**: Roll out to production

## Rollback Plan

If issues arise, the old schema can be restored from:
- `/Users/edwardzhong/Projects/tide/supabase/consolidated_schema.sql` (42 tables)

## Performance Considerations

### JSONB Query Performance

```typescript
// Querying JSONB fields uses GIN indexes
await supabase
  .from('emails')
  .select('*')
  .eq('intelligence->>category', 'urgent'); // Fast with GIN index

// Nested JSONB
await supabase
  .from('contacts')
  .select('*')
  .eq('intelligence->>vip', 'true'); // Fast with GIN index
```

### Full-Text Search

```typescript
// Email search uses ts_vector with GIN index
await supabase
  .from('emails')
  .select('*')
  .textSearch('search_vector', 'urgent meeting'); // Very fast
```

## Common Gotchas

1. **JSONB updates**: Must update entire object, not individual fields
2. **Type safety**: Use TypeScript types from `@tide/types` to ensure correct JSONB structure
3. **Indexes**: JSONB queries need GIN indexes (already added in schema)
4. **NULL handling**: JSONB fields default to empty objects, not NULL
5. **Array operations**: Use PostgreSQL array functions for tags/labels

## Helper Functions

Create these helper functions in your codebase:

```typescript
// Helper to update JSONB intelligenc safely
export function updateEmailIntelligence(
  current: EmailIntelligence,
  updates: Partial<EmailIntelligence>
): EmailIntelligence {
  return {
    ...current,
    ...updates
  };
}

// Helper to add action to email intelligence
export function addAutonomousAction(
  intelligence: EmailIntelligence,
  action: string,
  details: Record<string, unknown>
): EmailIntelligence {
  return {
    ...intelligence,
    autonomous_actions_taken: [
      ...intelligence.autonomous_actions_taken,
      { action, timestamp: new Date().toISOString(), details }
    ]
  };
}

// Helper to group emails into threads
export function groupEmailsByThread(emails: Email[]): EmailThread[] {
  const threads = new Map<string, Email[]>();
  for (const email of emails) {
    const key = `${email.provider}:${email.provider_thread_id}`;
    if (!threads.has(key)) threads.set(key, []);
    threads.get(key)!.push(email);
  }

  return Array.from(threads.values()).map(threadEmails => ({
    user_id: threadEmails[0].user_id,
    provider: threadEmails[0].provider,
    provider_thread_id: threadEmails[0].provider_thread_id,
    subject: threadEmails[0].subject,
    message_count: threadEmails.length,
    last_message_at: threadEmails[threadEmails.length - 1].sent_at,
    is_unread: threadEmails.some(e => e.is_unread),
    is_starred: threadEmails.some(e => e.is_starred),
    labels: [...new Set(threadEmails.flatMap(e => e.labels))],
    metadata: {
      participants: [...new Set(threadEmails.map(e => e.from_email))],
      first_message_at: threadEmails[0].sent_at,
      snippet: threadEmails[threadEmails.length - 1].snippet
    }
  }));
}
```
