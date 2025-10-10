# Tide Supabase Database

**Current Schema:** Optimized 15-table design with JSONB denormalization

---

## Files

### `optimized_schema.sql`
**Your production database schema** - 15 tables with JSONB intelligence fields

This is the result of migrating from the old 42-table over-normalized schema.

**Key Features:**
- 15 core tables (down from 42)
- JSONB fields for flexible intelligence data
- GIN indexes for fast JSONB queries
- Full-text search on emails
- Row Level Security (RLS) policies

**Tables:**
1. `users` - User profiles with settings JSONB
2. `emails` - Emails with intelligence JSONB
3. `contacts` - Contacts with relationship intelligence JSONB
4. `events` - Calendar events with intelligence JSONB
5. `tasks` - Tasks with structure & intelligence JSONB
6. `workflows` - Workflows with definition JSONB
7. `workflow_executions` - Execution tracking
8. `conversations` - AI conversations with metadata JSONB
9. `messages` - Conversation messages
10. `oauth_tokens` - OAuth integrations
11. `user_intelligence` - Unified intelligence store (patterns, preferences, snapshots)
12. `decisions` - Decision tracking
13. `actions` - Action execution
14. `notifications` - User notifications
15. `audit_logs` - Audit trail

### `config.toml`
Supabase CLI configuration file

### `.env.example`
Environment variable template for local development

---

## Schema Application

To apply this schema to your Supabase instance:

```bash
# Using Supabase CLI
supabase db reset

# Or using psql directly
psql $DATABASE_URL < optimized_schema.sql
```

---

## JSONB Intelligence Architecture

### Email Intelligence
```sql
emails.intelligence JSONB {
  category: string,              -- urgent, important, etc.
  priority: number,              -- 1-10 scale
  urgency: string,               -- critical, high, medium, low
  requires_response: boolean,
  ai_summary: string,
  suggested_actions: array,
  autonomous_actions_taken: array
}
```

### Event Intelligence
```sql
events.intelligence JSONB {
  brief: object,                 -- Meeting preparation
  preparation: array,
  conflicts: array,
  optimization_suggestions: array,
  previous_meetings: array,
  related_emails: array,
  notes: string
}
```

### Task Structure & Intelligence
```sql
tasks.structure JSONB {
  subtasks: array,               -- Nested subtasks
  dependencies: array,           -- Task dependencies
  blockers: array               -- Blocking issues
}

tasks.intelligence JSONB {
  complexity: number,
  estimated_duration_minutes: number,
  ai_suggestions: array,
  related_emails: array,
  related_events: array
}
```

### User Intelligence
```sql
user_intelligence.data JSONB {
  -- Flexible schema for:
  -- - Patterns (temporal, sequential)
  -- - Behaviors (user actions)
  -- - Preferences (learned)
  -- - Daily snapshots
  -- - Automation suggestions
}
```

---

## Query Examples

### Find urgent unread emails
```sql
SELECT * FROM emails
WHERE user_id = $1
  AND is_unread = true
  AND intelligence->>'category' = 'urgent'
  AND (intelligence->>'priority')::int >= 7
ORDER BY sent_at DESC;
```

### Find events with meeting briefs
```sql
SELECT * FROM events
WHERE user_id = $1
  AND intelligence->'brief' IS NOT NULL
  AND start_time >= NOW()
ORDER BY start_time;
```

### Find tasks with subtasks
```sql
SELECT * FROM tasks
WHERE user_id = $1
  AND jsonb_array_length(structure->'subtasks') > 0
ORDER BY priority_score DESC;
```

### Get user patterns
```sql
SELECT * FROM user_intelligence
WHERE user_id = $1
  AND type = 'pattern'
  AND confidence >= 0.7
ORDER BY confidence DESC;
```

---

## Performance

**GIN Indexes** enable fast JSONB queries:
- `idx_emails_intelligence` on `emails.intelligence`
- `idx_events_intelligence` on `events.intelligence`
- `idx_tasks_structure` on `tasks.structure`
- `idx_tasks_intelligence` on `tasks.intelligence`
- `idx_user_intelligence_data` on `user_intelligence.data`

**Full-Text Search:**
- `emails_search_vector` on `emails` (title, body, from_email)

---

## Migration History

**Previous:** 42-table over-normalized schema
**Current:** 15-table optimized schema with JSONB
**Migration Date:** October 10, 2025

See `MIGRATION-COMPLETE.md` in project root for full details.

---

## Development

### Local Supabase Setup
```bash
# Start local Supabase
supabase start

# Apply schema
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > types/supabase.ts
```

### Testing Schema
```bash
# Run integration tests
pnpm test packages/services/__tests__/migration-integration.test.ts

# Run schema validation
pnpm test packages/services/__tests__/schema-validation.test.ts
```

---

## Related Documentation

- `/MIGRATION-COMPLETE.md` - Full migration documentation
- `/packages/libraries/database/src/helpers.ts` - JSONB helper functions
- `/packages/shared/types/src/database.ts` - TypeScript type definitions

---

**Schema Status:** ✅ Production Ready
**Last Updated:** October 10, 2025
