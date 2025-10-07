# Track 0: Authentication & Core Infrastructure

> **⚠️ CRITICAL PATH**: This track blocks all other tracks. Complete TODAY (4 hours).

**Owner**: Platform/DevOps Team (1 developer)
**Status**: ✅ 95% Complete (Railway deployed, needs database schema)
**Duration**: 4 hours TODAY
**Blocks**: All other tracks

---

## Mission

Create the foundation that all feature tracks depend on: database schema, authentication, and deployment infrastructure.

**What You Own**:
- ✅ Supabase (Auth, PostgreSQL, Realtime)
- ✅ Railway deployment (Gateway, AI, Email, Calendar, Workflow services)
- 🚧 Database schema (11 tables for all features)
- ✅ Shared packages (@tide/types, @tide/config, etc.)
- ✅ Monitoring (Prometheus, Grafana)

**Critical Output**: Database schema created → unblocks 4 feature teams

---

## Hour 1: Database Schema (BLOCKS EVERYTHING)

### Create All Tables for All Features

**Step 1: Open Supabase SQL Editor**
```bash
open https://app.supabase.com
# Navigate to: Your Project → SQL Editor → New Query
```

**Step 2: Run Complete Schema**

```sql
-- ============================================================================
-- TIDE COMPLETE DATABASE SCHEMA
-- All tables for all feature tracks
-- ============================================================================

-- TRACK 0: User Management
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- TRACK 1: Email Intelligence - OAuth Tokens
CREATE TABLE IF NOT EXISTS oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'google', 'microsoft'
  service TEXT NOT NULL, -- 'email', 'calendar'
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  scope TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider, service)
);

ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tokens" ON oauth_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access" ON oauth_tokens FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- TRACK 1: Email Intelligence - Email Threads
CREATE TABLE IF NOT EXISTS email_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  external_thread_id TEXT NOT NULL,
  subject TEXT,
  participants TEXT[],
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, external_thread_id)
);

CREATE INDEX idx_email_threads_user ON email_threads(user_id, last_message_at DESC);
ALTER TABLE email_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own threads" ON email_threads FOR SELECT USING (auth.uid() = user_id);

-- TRACK 1: Email Intelligence - Email Messages
CREATE TABLE IF NOT EXISTS email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  external_message_id TEXT NOT NULL,
  thread_id TEXT,
  from_address TEXT,
  to_addresses TEXT[],
  cc_addresses TEXT[],
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  labels TEXT[],
  ai_category TEXT, -- 'urgent', 'important', 'normal', 'low'
  ai_priority INTEGER,
  ai_summary TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, external_message_id)
);

CREATE INDEX idx_email_messages_user ON email_messages(user_id, received_at DESC);
CREATE INDEX idx_email_messages_category ON email_messages(user_id, ai_category);
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own emails" ON email_messages FOR SELECT USING (auth.uid() = user_id);

-- TRACK 2: Calendar Intelligence - Calendar Events
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  external_event_id TEXT NOT NULL,
  calendar_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  is_all_day BOOLEAN DEFAULT FALSE,
  attendees JSONB, -- [{email, name, response_status}]
  meeting_brief JSONB, -- AI-generated brief
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, external_event_id)
);

CREATE INDEX idx_calendar_events_user ON calendar_events(user_id, start_time);
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own events" ON calendar_events FOR SELECT USING (auth.uid() = user_id);

-- TRACK 3: AI Chat - Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT,
  summary TEXT,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_user ON conversations(user_id, last_message_at DESC);
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- TRACK 3: AI Chat - Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  metadata JSONB, -- model, tokens, etc.
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in own conversations" ON messages FOR SELECT
  USING (conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid()));
CREATE POLICY "Users can create messages in own conversations" ON messages FOR INSERT
  WITH CHECK (conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid()));

-- TRACK 4: Task & Workflow - Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  priority INTEGER DEFAULT 5,
  due_at TIMESTAMP,
  completed_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tasks_user ON tasks(user_id, status, priority);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);

-- TRACK 4: Task & Workflow - Workflows
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT, -- 'manual', 'scheduled', 'email_received', 'calendar_event'
  trigger_config JSONB,
  steps JSONB NOT NULL, -- Workflow step definitions
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workflows_user ON workflows(user_id, is_active);
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own workflows" ON workflows FOR ALL USING (auth.uid() = user_id);

-- TRACK 4: Task & Workflow - Workflow Executions
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'running', -- 'running', 'completed', 'failed', 'cancelled'
  current_step INTEGER DEFAULT 0,
  context JSONB,
  error TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_workflow_executions ON workflow_executions(workflow_id, started_at DESC);

-- Verification
SELECT
  'Schema created successfully!' as status,
  COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'user_profiles', 'oauth_tokens', 'email_threads', 'email_messages',
    'calendar_events', 'conversations', 'messages', 'tasks',
    'workflows', 'workflow_executions'
  );
```

**Step 3: Verify Tables Created**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected Output**: 10 tables created

**⏱️ Time**: 30 minutes

---

## Hour 2: Verify Railway Deployment

### Check All Services Healthy

```bash
# Check Gateway
curl https://gateway-production-caf0.up.railway.app/health

# Check AI Service
curl https://gateway-production-caf0.up.railway.app/api/ai/health

# Check Email Service
curl https://gateway-production-caf0.up.railway.app/api/email/health

# Check Calendar Service
curl https://gateway-production-caf0.up.railway.app/api/calendar/health

# Check Workflow Service
curl https://gateway-production-caf0.up.railway.app/api/workflow/health
```

**All should return**: `{"status":"healthy"}`

### Verify Environment Variables in Railway

```bash
railway variables --service gateway
railway variables --service ai
railway variables --service email
railway variables --service calendar
railway variables --service workflow
```

**Required Variables**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET`

**⏱️ Time**: 30 minutes

---

## Hour 3-4: Integration Testing

### Test Database Connections from Services

```bash
# Test Email Service can query database
curl -X POST https://gateway-production-caf0.up.railway.app/api/email/test-db \
  -H "Content-Type: application/json" \
  -d '{"userId":"00000000-0000-0000-0000-000000000001"}'

# Expected: {"success":true,"tables":["user_profiles","oauth_tokens","email_messages",...]}
```

### Run Integration Test Suite

```bash
cd /Users/edwardzhong/Projects/tide
pnpm test:integration
```

**Expected**: All integration tests pass

**⏱️ Time**: 1 hour

---

## Deliverables Checklist

- [ ] ✅ Database schema created (10 tables)
- [ ] ✅ RLS policies active on all tables
- [ ] ✅ Railway services healthy
- [ ] ✅ Environment variables configured
- [ ] ✅ Integration tests passing
- [ ] ✅ Monitoring dashboards live

---

## Handoff to Feature Tracks

Once complete, notify feature teams:

**📣 Announcement**:
```
@team Database schema is LIVE!

All tables created in Supabase:
✅ Track 1 (Email): oauth_tokens, email_threads, email_messages
✅ Track 2 (Calendar): calendar_events
✅ Track 3 (Chat): conversations, messages
✅ Track 4 (Workflow): tasks, workflows, workflow_executions

Railway services deployed and healthy.

You can now start development! 🚀
```

---

## Claude Code Prompts

**Create database schema:**
```
Create the complete Tide database schema in Supabase with 10 tables for all feature tracks. Include user_profiles, oauth_tokens, email_threads, email_messages, calendar_events, conversations, messages, tasks, workflows, workflow_executions. Add RLS policies for user data isolation. Verify all tables created successfully.
```

**Verify Railway deployment:**
```
Check health of all Railway services (Gateway, AI, Email, Calendar, Workflow). Verify environment variables are configured. Test database connections from each service.
```

---

This track is the **critical path** - complete it TODAY to unblock all feature teams for parallel development.
