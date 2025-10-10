# Complete Schema Migration Plan
**Goal**: Eliminate all architectural debt and fully migrate to the optimized 15-table schema

## Overview

**From**: 42 tables with over-normalized structure
**To**: 15 tables with JSONB intelligence data
**Impact**: 8 backend services, 1 iOS app
**Estimated Effort**: 12-16 hours of focused work
**Risk Level**: Medium (with proper testing)

---

## Phase 1: Service Layer Updates (Critical Path)

### 1.1 Email Service (HIGH PRIORITY)
**Files to Update**: `packages/services/email/src/**/*.ts`

#### Changes Required:

**A. Update Database Queries**
- [x] Replace `email_messages` → `emails`
- [x] Replace `email_threads` → view or group in-memory
- [x] Replace `email_triage` → `emails.intelligence` JSONB updates
- [x] Replace `relationship_intelligence` → `contacts` table
- [x] Replace `autonomous_email_actions` → `emails.intelligence.autonomous_actions_taken` array
- [x] Replace `email_patterns` → `user_intelligence` with type='email_pattern'

**B. Files to Modify**:
```
/src/index.ts                         - Main sync logic
/src/intelligence/relationship-tracker.ts - Contacts intelligence
/src/autonomy/autonomous-email-handler.ts - Intelligence updates
/src/search/email-search.ts          - Use new search_vector
/src/composer/style-analyzer.ts      - Query emails table
```

**C. Key Code Changes**:
```typescript
// OLD: Separate triage insert
await db.from('email_triage').insert({ email_id, category, priority })

// NEW: Update email intelligence JSONB
await db.from('emails').update({
  intelligence: {
    ...currentIntelligence,
    category,
    priority,
    urgency: 'high'
  }
}).eq('id', emailId)

// OLD: Query relationship intelligence
await db.from('relationship_intelligence').select('*').eq('contact_email', email)

// NEW: Query contacts
await db.from('contacts').select('*').eq('email', email)
```

**Estimated Time**: 3-4 hours

---

### 1.2 Calendar Service (HIGH PRIORITY)
**Files to Update**: `packages/services/calendar/src/**/*.ts`

#### Changes Required:

**A. Update Database Queries**
- [x] Replace `calendar_events` → `events`
- [x] Replace `meeting_briefs` → `events.intelligence.brief`
- [x] Replace `scheduling_preferences` → `users.settings`
- [x] Replace `calendar_optimizations` → `events.intelligence.optimization_suggestions`
- [x] Replace `meeting_conflicts` → `events.intelligence.conflicts`
- [x] Replace `smart_scheduling_suggestions` → `user_intelligence` type='scheduling_suggestion'
- [x] Replace `previous_meeting_notes` → `events.intelligence.notes`

**B. Files to Modify**:
```
/src/intelligence/meeting-brief-generator.ts - Generate briefs into JSONB
/src/optimization/calendar-optimizer.ts      - Store optimizations in JSONB
/src/scheduling/smart-scheduler.ts           - User settings for preferences
/src/meeting-prep/meeting-preparation.ts     - Query events table
```

**C. Key Code Changes**:
```typescript
// OLD: Insert meeting brief
await db.from('meeting_briefs').insert({
  event_id,
  key_discussion_points: [],
  preparation_checklist: []
})

// NEW: Update event intelligence
await db.from('events').update({
  intelligence: {
    ...current.intelligence,
    brief: {
      summary: 'Generated summary',
      key_discussion_points: [],
      preparation_checklist: [],
      attendee_insights: []
    }
  }
}).eq('id', eventId)

// OLD: Get scheduling preferences
await db.from('scheduling_preferences').select('*').eq('user_id', userId)

// NEW: Get from user settings
const { data: user } = await db.from('users').select('settings').eq('id', userId).single()
const prefs = user.settings.scheduling_preferences
```

**Estimated Time**: 3-4 hours

---

### 1.3 Workflow Service (MEDIUM PRIORITY)
**Files to Update**: `packages/services/workflow/src/**/*.ts`

#### Changes Required:

**A. Update Database Queries**
- [x] Keep `tasks` table (minimal changes)
- [x] Replace `subtasks` → `tasks.structure.subtasks` JSONB
- [x] Replace `task_dependencies` → `tasks.structure.dependencies` JSONB
- [x] Replace `task_executions` → `workflow_executions` (already correct)
- [x] Replace all pattern tables → `user_intelligence` with type discriminator

**B. Files to Modify**:
```
/src/supabase-adapter.ts - Complete rewrite of repository pattern
```

**C. Key Code Changes**:
```typescript
// OLD: Create subtask in separate table
await db.from('subtasks').insert({
  parent_id: taskId,
  title: 'Subtask',
  order_index: 0
})

// NEW: Update task structure
const task = await db.from('tasks').select('structure').eq('id', taskId).single()
task.data.structure.subtasks.push({
  id: uuid(),
  title: 'Subtask',
  order_index: 0,
  status: 'pending'
})
await db.from('tasks').update({ structure: task.data.structure }).eq('id', taskId)

// OLD: Multiple pattern tables
await db.from('detected_patterns').insert(...)
await db.from('temporal_patterns').insert(...)
await db.from('sequential_patterns').insert(...)

// NEW: Single user_intelligence table
await db.from('user_intelligence').insert({
  user_id,
  type: 'temporal_pattern', // or 'sequence_pattern', 'behavioral_pattern'
  subtype: 'morning_routine',
  data: { /* flexible JSONB */ },
  confidence: 0.8,
  status: 'detected'
})
```

**Estimated Time**: 2-3 hours

---

### 1.4 Intelligence Service (MEDIUM PRIORITY)
**Files to Update**: `packages/services/intelligence/src/**/*.ts`

#### Changes Required:

**A. Update Database Queries**
- [x] Keep `daily_snapshots` (minimal changes)
- [x] Update snapshot data structure to match new JSONB format

**B. Files to Modify**:
```
/src/aggregators/daily-snapshot-aggregator.ts - Query new tables
```

**C. Key Code Changes**:
```typescript
// OLD: Query from user_profiles
await db.from('user_profiles').select('*')

// NEW: Query from users
await db.from('users').select('*')

// Snapshot structure stays mostly the same
await db.from('daily_snapshots').upsert({
  user_id,
  snapshot_date,
  data: {
    priority_items: [],
    pending_decisions: [],
    meeting_previews: [],
    predictions: [],
    stats: {}
  }
})
```

**Estimated Time**: 1-2 hours

---

### 1.5 Actions Service (MEDIUM PRIORITY)
**Files to Update**: `packages/services/actions/src/**/*.ts`

#### Changes Required:

**A. Update Database Queries**
- [x] Keep `action_suggestions` (no changes)
- [x] Update queries to use new table names

**B. Files to Modify**:
```
/src/routes/actions.routes.ts       - Keep as-is
/src/suggestions/action-suggester.ts - Update table references
/src/executor/action-executor.ts     - Update table references
```

**C. Key Code Changes**:
```typescript
// OLD: Query email_messages
await db.from('email_messages').select('*')

// NEW: Query emails
await db.from('emails').select('*')

// OLD: Query calendar_events
await db.from('calendar_events').select('*')

// NEW: Query events
await db.from('events').select('*')

// OLD: Get user preferences
await db.from('user_preferences').select('*')

// NEW: Get from users.settings
await db.from('users').select('settings')
```

**Estimated Time**: 1-2 hours

---

### 1.6 Decisions Service (LOW PRIORITY)
**Files to Update**: `packages/services/decisions/src/**/*.ts`

#### Changes Required:

**A. Update Database Queries**
- [x] Keep `decisions` table (no changes)
- [x] Remove `decision_history` (use audit log instead)
- [x] Replace `user_preferences` → `users.settings`

**B. Files to Modify**:
```
/src/index.ts                    - Keep as-is mostly
/src/analyzer/decision-analyzer.ts - Remove history queries
```

**C. Key Code Changes**:
```typescript
// OLD: Insert decision history
await db.from('decision_history').insert({ ... })

// NEW: Remove - use application-level audit log or just track in decisions table
// Decision history can be reconstructed from decisions.updated_at and metadata
```

**Estimated Time**: 1 hour

---

### 1.7 Mobile BFF Service (HIGH PRIORITY)
**Files to Update**: `packages/services/mobile-bff/src/index.ts`

#### Changes Required:

**A. Update Database Queries**
- [x] Replace all old table names with new ones
- [x] This service touches almost every table, so comprehensive update needed

**B. Key Code Changes**:
```typescript
// Update all queries:
// user_profiles → users
// email_messages → emails
// calendar_events → events
// relationship_intelligence → contacts
```

**Estimated Time**: 2-3 hours

---

### 1.8 AI Service (LOW PRIORITY)
**Files to Update**: `packages/services/ai/src/**/*.ts`

#### Changes Required:

**A. Update Database Queries**
- [x] Minimal changes - mostly queries conversations/messages which are unchanged

**Estimated Time**: 30 minutes

---

## Phase 2: Shared Libraries Update

### 2.1 Database Library
**Files to Update**: `packages/libraries/database/**/*.ts`

#### Changes Required:
- [x] Update any helper functions to use new table names
- [x] Create JSONB helper utilities

**New Helper Functions Needed**:
```typescript
// packages/libraries/database/src/helpers.ts
export function updateEmailIntelligence(
  current: EmailIntelligence,
  updates: Partial<EmailIntelligence>
): EmailIntelligence {
  return { ...current, ...updates }
}

export function addAutonomousAction(
  intelligence: EmailIntelligence,
  action: { action: string; details: Record<string, unknown> }
): EmailIntelligence {
  return {
    ...intelligence,
    autonomous_actions_taken: [
      ...intelligence.autonomous_actions_taken,
      { ...action, timestamp: new Date().toISOString() }
    ]
  }
}

export function updateEventIntelligence(
  current: EventIntelligence,
  updates: Partial<EventIntelligence>
): EventIntelligence {
  return { ...current, ...updates }
}

export function groupEmailsByThread(emails: Email[]): EmailThread[] {
  const threads = new Map<string, Email[]>()

  for (const email of emails) {
    const key = `${email.provider}:${email.provider_thread_id}`
    if (!threads.has(key)) threads.set(key, [])
    threads.get(key)!.push(email)
  }

  return Array.from(threads.values()).map(threadEmails => ({
    user_id: threadEmails[0].user_id,
    provider: threadEmails[0].provider,
    provider_thread_id: threadEmails[0].provider_thread_id,
    subject: threadEmails[0].subject || '',
    message_count: threadEmails.length,
    last_message_at: threadEmails[threadEmails.length - 1].sent_at,
    is_unread: threadEmails.some(e => e.is_unread),
    is_starred: threadEmails.some(e => e.is_starred),
    labels: [...new Set(threadEmails.flatMap(e => e.labels))],
    metadata: {
      participants: [...new Set(threadEmails.map(e => e.from_email))],
      first_message_at: threadEmails[0].sent_at,
      snippet: threadEmails[threadEmails.length - 1].snippet || ''
    }
  }))
}
```

**Estimated Time**: 1-2 hours

---

## Phase 3: iOS App Update

### 3.1 SupabaseManager.swift
**Files to Update**: `apps/app/app/Services/SupabaseManager.swift`

#### Changes Required:
- [x] Update all Supabase queries to use new table names
- [x] Update Swift models to match new schema

**Model Updates**:
```swift
// OLD
struct UserProfile: Codable {
  let id: UUID
  let email: String
  let fullName: String
}

// NEW
struct User: Codable {
  let id: UUID
  let email: String
  let fullName: String
  let avatarUrl: String?
  let settings: UserSettings
  let primaryProvider: String
  let createdAt: Date
  let updatedAt: Date
  let lastSeenAt: Date?
}

struct UserSettings: Codable {
  let theme: String
  let language: String
  let timezone: String
  let autonomyLevel: String
  let notifications: NotificationSettings
}
```

**Query Updates**:
```swift
// OLD
try await supabase.from("user_profiles").select("*")

// NEW
try await supabase.from("users").select("*")

// OLD
try await supabase.from("email_messages").select("*")

// NEW
try await supabase.from("emails").select("*")

// OLD
try await supabase.from("calendar_events").select("*")

// NEW
try await supabase.from("events").select("*")
```

**Estimated Time**: 2-3 hours

---

## Phase 4: Testing Strategy

### 4.1 Unit Tests
**Create/Update**: `packages/services/*/tests/**/*.test.ts`

#### Test Coverage Required:
- [x] Email service: Intelligence JSONB updates
- [x] Calendar service: Event intelligence updates
- [x] Workflow service: Task structure JSONB operations
- [x] Mobile BFF: All endpoint responses match new schema
- [x] Database helpers: JSONB utility functions

**New Test File**:
```typescript
// packages/libraries/database/tests/helpers.test.ts
describe('JSONB Helper Functions', () => {
  it('should update email intelligence correctly', () => {
    const current: EmailIntelligence = {
      category: 'important',
      priority: 7,
      urgency: 'high',
      requires_response: false,
      ai_summary: null,
      suggested_actions: [],
      autonomous_actions_taken: []
    }

    const updated = updateEmailIntelligence(current, {
      ai_summary: 'Test summary',
      requires_response: true
    })

    expect(updated.ai_summary).toBe('Test summary')
    expect(updated.requires_response).toBe(true)
    expect(updated.priority).toBe(7) // Unchanged
  })

  it('should add autonomous action correctly', () => {
    const intelligence: EmailIntelligence = {
      category: null,
      priority: 5,
      urgency: 'medium',
      requires_response: false,
      ai_summary: null,
      suggested_actions: [],
      autonomous_actions_taken: []
    }

    const updated = addAutonomousAction(intelligence, {
      action: 'archived',
      details: { reason: 'low_priority' }
    })

    expect(updated.autonomous_actions_taken).toHaveLength(1)
    expect(updated.autonomous_actions_taken[0].action).toBe('archived')
  })
})
```

**Estimated Time**: 3-4 hours

---

### 4.2 Integration Tests
**Create**: `tests/integration/schema-migration.test.ts`

#### Test Scenarios:
1. **Email Sync Flow**: Gmail → emails table with intelligence
2. **Calendar Sync Flow**: Google Calendar → events with intelligence
3. **Task Creation**: Create task with subtasks (JSONB)
4. **Pattern Detection**: Create user_intelligence entries
5. **Daily Snapshot**: Generate snapshot from new tables
6. **Action Suggestions**: Suggest actions based on new schema

**Estimated Time**: 2-3 hours

---

### 4.3 Manual Testing Checklist

#### Critical User Flows:
- [ ] User signup/login
- [ ] Email sync and display
- [ ] Email intelligence (triage, summary)
- [ ] Calendar sync and display
- [ ] Meeting brief generation
- [ ] Task creation with subtasks
- [ ] Workflow execution
- [ ] AI chat conversation
- [ ] Daily snapshot generation
- [ ] Action suggestions

**Estimated Time**: 2-3 hours

---

## Phase 5: Deployment Plan

### 5.1 Pre-Deployment

#### Database Backup:
```bash
# Backup current Supabase database (if needed for rollback)
# Use Supabase dashboard: Database → Backups → Create Backup
```

#### Feature Flags (Optional):
```typescript
// packages/shared/config/src/feature-flags.ts
export const FEATURE_FLAGS = {
  USE_NEW_SCHEMA: process.env.USE_NEW_SCHEMA === 'true'
}
```

---

### 5.2 Deployment Steps

#### Step 1: Deploy Backend Services
```bash
# Build all services
pnpm -r build

# Deploy to Railway (or your platform)
# Services will automatically use new schema since it's already applied
```

#### Step 2: Deploy iOS App
```bash
# Build and submit to TestFlight
cd apps/app
xcodebuild archive ...
```

#### Step 3: Monitor for Errors
- Check Railway logs for database errors
- Monitor Sentry for application errors
- Check Supabase logs for query errors

---

### 5.3 Rollback Plan

If critical issues arise:

#### Option A: Rollback Code Only
```bash
# Revert Git commits
git revert <commit-hash>
git push

# Redeploy services
railway up
```

#### Option B: Rollback Schema (DESTRUCTIVE)
```sql
-- Drop new schema
DROP SCHEMA public CASCADE;

-- Restore from backup
-- Use Supabase dashboard to restore from backup point
```

**Note**: Option B loses all data since migration. Only use in emergency.

---

## Phase 6: Post-Migration Cleanup

### 6.1 Remove Dead Code

#### Files to Delete:
```
# Old migration files (keep for reference in git history)
supabase/migrations/20251007_*.sql (keep consolidated_schema.sql for rollback)
supabase/schema.sql (old schema)
```

#### Code to Remove:
- Any backward compatibility adapters (if created)
- Old type definitions
- Unused helper functions

**Estimated Time**: 1 hour

---

### 6.2 Documentation Updates

#### Update:
- [x] README.md - Mention new schema
- [x] API documentation - Update response shapes
- [x] Architecture docs - Document JSONB approach

**Estimated Time**: 1 hour

---

## Timeline & Resource Allocation

### Total Estimated Time: 24-30 hours

### Recommended Approach:

#### Week 1: Backend Services (16 hours)
- Day 1-2: Email Service (4h)
- Day 2-3: Calendar Service (4h)
- Day 3-4: Mobile BFF (3h)
- Day 4: Workflow Service (3h)
- Day 5: Intelligence, Actions, Decisions Services (2h)

#### Week 2: Testing & iOS (8 hours)
- Day 1: Database Helpers + Unit Tests (3h)
- Day 2: Integration Tests (2h)
- Day 3: iOS App Updates (3h)

#### Week 3: Deployment & Cleanup (6 hours)
- Day 1: Final testing + Deployment (4h)
- Day 2: Monitoring + Post-deployment cleanup (2h)

---

## Risk Mitigation

### High-Risk Areas:

1. **Email Intelligence Migration**
   - **Risk**: Complex JSONB updates might fail
   - **Mitigation**: Write comprehensive tests for JSONB operations

2. **Workflow Service Subtasks**
   - **Risk**: JSONB array operations are error-prone
   - **Mitigation**: Create helper functions with validation

3. **iOS App Schema Changes**
   - **Risk**: Swift Codable might not handle JSONB well
   - **Mitigation**: Test with real Supabase responses first

4. **Production Data Loss**
   - **Risk**: Schema is already applied, no existing data to migrate
   - **Mitigation**: N/A - fresh start with new schema

---

## Success Metrics

### Post-Migration KPIs:

1. **Performance**
   - [ ] Email queries < 200ms (down from ~500ms with joins)
   - [ ] Calendar queries < 150ms
   - [ ] Task queries < 100ms

2. **Code Quality**
   - [ ] Reduced lines of code by 30%
   - [ ] Fewer database files (15 vs 42 tables)
   - [ ] Test coverage > 80%

3. **Stability**
   - [ ] Zero schema-related errors in first week
   - [ ] No rollbacks required
   - [ ] All critical user flows working

---

## Next Steps

1. **Review this plan** with team
2. **Start with Email Service** (highest complexity)
3. **Create feature branch**: `feat/schema-migration`
4. **Work incrementally** - one service at a time
5. **Test thoroughly** before moving to next service
6. **Deploy to staging** first
7. **Monitor closely** after production deployment

---

## Questions to Answer Before Starting

- [ ] Do we have a staging environment to test on?
- [ ] What's the rollback SLA if production breaks?
- [ ] Who is responsible for iOS app updates?
- [ ] Do we need gradual rollout or can we do big-bang?
- [ ] What monitoring/alerting is in place?

---

## Conclusion

This migration eliminates significant architectural debt by:
- **Simplifying the schema** (42 → 15 tables)
- **Improving performance** (fewer joins, better indexes)
- **Increasing flexibility** (JSONB allows schema evolution)
- **Reducing complexity** (simpler queries, clearer data model)

**Total Effort**: 24-30 hours over 2-3 weeks
**Risk**: Medium (mitigated with good testing)
**Benefit**: High (cleaner architecture, better performance, easier maintenance)
