-- =====================================================
-- TIDE OPTIMIZED DATABASE SCHEMA
-- Redesigned from 42 tables to 18 tables
-- Principles:
-- 1. Core entities = dedicated tables (emails, events, tasks)
-- 2. Intelligence/metadata = JSONB (flexible, fast)
-- 3. Use PostgreSQL strengths (JSONB, GIN indexes, triggers)
-- 4. Easy to evolve without migrations
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE: USER & AUTH
-- =====================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,

  -- Settings
  settings JSONB NOT NULL DEFAULT '{
    "theme": "auto",
    "language": "en",
    "timezone": "UTC",
    "autonomy_level": "balanced",
    "notifications": {
      "email": true,
      "push": true
    }
  }'::jsonb,

  -- OAuth provider info
  primary_provider TEXT NOT NULL CHECK (primary_provider IN ('google', 'microsoft')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft')),
  service TEXT NOT NULL CHECK (service IN ('email', 'calendar', 'both')),

  -- Tokens (encrypted at rest by Supabase)
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT[] NOT NULL,

  -- Provider metadata
  provider_user_id TEXT,
  provider_email TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, provider, service)
);

-- =====================================================
-- CORE: EMAIL
-- =====================================================

-- Consolidated email storage (no separate threads table)
CREATE TABLE IF NOT EXISTS public.emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Provider info
  provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft')),
  provider_message_id TEXT NOT NULL,
  provider_thread_id TEXT NOT NULL,

  -- Email content
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  snippet TEXT,

  -- Participants
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_emails TEXT[] NOT NULL,
  cc_emails TEXT[] DEFAULT '{}',
  bcc_emails TEXT[] DEFAULT '{}',

  -- Metadata
  is_unread BOOLEAN DEFAULT true,
  is_starred BOOLEAN DEFAULT false,
  labels TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]'::jsonb,

  -- Intelligence (consolidates email_triage, autonomous_actions, etc.)
  intelligence JSONB DEFAULT '{
    "category": null,
    "priority": 5,
    "urgency": "medium",
    "requires_response": false,
    "ai_summary": null,
    "suggested_actions": [],
    "autonomous_actions_taken": []
  }'::jsonb,

  -- Full-text search
  search_vector tsvector,

  -- Timestamps
  sent_at TIMESTAMPTZ NOT NULL,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, provider, provider_message_id)
);

-- Email relationships/contacts (denormalized for speed)
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Contact info
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,

  -- Relationship intelligence
  intelligence JSONB NOT NULL DEFAULT '{
    "strength": 0.5,
    "frequency": "occasional",
    "vip": false,
    "sentiment": "neutral",
    "topics": [],
    "stats": {
      "emails_sent": 0,
      "emails_received": 0,
      "avg_response_time_minutes": null
    },
    "last_interaction_at": null
  }'::jsonb,

  -- Metadata
  notes TEXT,
  tags TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, email)
);

-- =====================================================
-- CORE: CALENDAR
-- =====================================================

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Provider info
  provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft')),
  provider_event_id TEXT NOT NULL,
  provider_calendar_id TEXT NOT NULL,

  -- Event details
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,

  -- Timing
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  is_all_day BOOLEAN DEFAULT false,

  -- Recurrence
  recurrence_rule TEXT,

  -- Status
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'tentative', 'cancelled')),

  -- Participants
  attendees JSONB DEFAULT '[]'::jsonb,

  -- Intelligence (consolidates meeting_briefs, conflicts, etc.)
  intelligence JSONB DEFAULT '{
    "brief": null,
    "preparation": [],
    "conflicts": [],
    "optimization_suggestions": [],
    "previous_meetings": [],
    "related_emails": [],
    "notes": null
  }'::jsonb,

  -- Timestamps
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, provider, provider_event_id)
);

-- =====================================================
-- CORE: TASKS & WORKFLOWS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Task info
  title TEXT NOT NULL,
  description TEXT,

  -- Status & priority
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  priority_score DOUBLE PRECISION DEFAULT 0.5,

  -- Timing
  due_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Organization
  tags TEXT[] DEFAULT '{}',
  project TEXT,

  -- Subtasks & dependencies (embedded)
  structure JSONB DEFAULT '{
    "subtasks": [],
    "dependencies": [],
    "blockers": []
  }'::jsonb,

  -- Intelligence
  intelligence JSONB DEFAULT '{
    "complexity": null,
    "estimated_duration_minutes": null,
    "ai_suggestions": [],
    "related_emails": [],
    "related_events": []
  }'::jsonb,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Workflow info
  name TEXT NOT NULL,
  description TEXT,

  -- Definition
  definition JSONB NOT NULL DEFAULT '{
    "trigger": {},
    "actions": [],
    "version": 1
  }'::jsonb,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Stats
  stats JSONB NOT NULL DEFAULT '{
    "execution_count": 0,
    "success_count": 0,
    "failure_count": 0,
    "last_executed_at": null
  }'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  current_step INTEGER DEFAULT 0,
  context JSONB DEFAULT '{}'::jsonb,
  error TEXT,

  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- =====================================================
-- CORE: CONVERSATIONS (AI Chat)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  title TEXT,
  summary TEXT,

  -- Stats
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,

  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- AI metadata
  metadata JSONB DEFAULT '{
    "model": null,
    "tokens_used": null,
    "attachments": []
  }'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INTELLIGENCE: PATTERNS & SUGGESTIONS
-- =====================================================

-- Consolidated intelligence table (replaces 12+ pattern/behavior tables)
CREATE TABLE IF NOT EXISTS public.user_intelligence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Type discriminator (email_pattern, temporal_pattern, sequence, automation, etc.)
  type TEXT NOT NULL,
  subtype TEXT,

  -- Pattern/intelligence data (flexible JSONB)
  data JSONB NOT NULL,

  -- Confidence & usage
  confidence DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  usage_count INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'detected' CHECK (status IN ('detected', 'suggested', 'accepted', 'rejected', 'active')),

  -- Timestamps
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily snapshots
CREATE TABLE IF NOT EXISTS public.daily_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,

  -- Consolidated snapshot data
  data JSONB NOT NULL DEFAULT '{
    "priority_items": [],
    "pending_decisions": [],
    "meeting_previews": [],
    "predictions": [],
    "stats": {}
  }'::jsonb,

  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, snapshot_date)
);

-- Action suggestions
CREATE TABLE IF NOT EXISTS public.action_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Suggestion type
  type TEXT NOT NULL CHECK (type IN (
    'email_response', 'schedule_meeting', 'delegate_task', 'decline_meeting',
    'archive_email', 'send_reminder', 'update_task', 'reschedule_meeting', 'other'
  )),

  -- Suggestion content
  title TEXT NOT NULL,
  preview TEXT NOT NULL,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Confidence
  confidence DOUBLE PRECISION NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  requires_approval BOOLEAN NOT NULL DEFAULT true,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'executed', 'failed')),

  -- Execution
  execution_result JSONB,
  executed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- DECISIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Decision info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'approval', 'choice', 'prioritization', 'scheduling',
    'budget', 'strategic', 'operational', 'other'
  )),

  -- Decision data
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_recommendation JSONB,
  user_decision JSONB,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'declined', 'deferred'
  )),
  urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),

  -- Timing
  deadline TIMESTAMPTZ,
  decided_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.events_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Event info
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,

  -- Event data
  properties JSONB DEFAULT '{}'::jsonb,

  -- Session & device
  session_id UUID,
  platform TEXT,
  app_version TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Users
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_last_seen ON public.users(last_seen_at DESC);
CREATE INDEX idx_users_settings_gin ON public.users USING GIN(settings);

-- OAuth Tokens
CREATE INDEX idx_oauth_tokens_user_id ON public.oauth_tokens(user_id);
CREATE INDEX idx_oauth_tokens_expires_at ON public.oauth_tokens(expires_at);

-- Emails
CREATE INDEX idx_emails_user_id ON public.emails(user_id, sent_at DESC);
CREATE INDEX idx_emails_thread_id ON public.emails(user_id, provider_thread_id);
CREATE INDEX idx_emails_from_email ON public.emails(user_id, from_email);
CREATE INDEX idx_emails_sent_at ON public.emails(sent_at DESC);
CREATE INDEX idx_emails_is_unread ON public.emails(user_id, is_unread) WHERE is_unread = true;
CREATE INDEX idx_emails_search_vector ON public.emails USING GIN(search_vector);
CREATE INDEX idx_emails_intelligence_gin ON public.emails USING GIN(intelligence);
CREATE INDEX idx_emails_labels ON public.emails USING GIN(labels);

-- Contacts
CREATE INDEX idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_intelligence_gin ON public.contacts USING GIN(intelligence);
-- VIP contacts - query using GIN index instead of predicate
-- Use: SELECT * FROM contacts WHERE intelligence @> '{"vip": true}'

-- Events
CREATE INDEX idx_events_user_id ON public.events(user_id, start_time);
CREATE INDEX idx_events_start_time ON public.events(start_time);
CREATE INDEX idx_events_provider ON public.events(provider, provider_event_id);
CREATE INDEX idx_events_intelligence_gin ON public.events USING GIN(intelligence);
CREATE INDEX idx_events_user_status_time ON public.events(user_id, status, start_time);
-- Upcoming events - use idx_events_user_status_time with WHERE clause in query
-- Use: SELECT * FROM events WHERE user_id = ? AND status != 'cancelled' AND start_time > NOW()

-- Tasks
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_at ON public.tasks(due_at) WHERE due_at IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_tasks_priority_score ON public.tasks(priority_score DESC);
CREATE INDEX idx_tasks_tags ON public.tasks USING GIN(tags);
CREATE INDEX idx_tasks_structure_gin ON public.tasks USING GIN(structure);
CREATE INDEX idx_tasks_active ON public.tasks(user_id, status) WHERE deleted_at IS NULL;

-- Workflows
CREATE INDEX idx_workflows_user_id ON public.workflows(user_id);
CREATE INDEX idx_workflows_active ON public.workflows(is_active) WHERE is_active = true AND deleted_at IS NULL;

-- Workflow Executions
CREATE INDEX idx_workflow_executions_workflow_id ON public.workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_user_id ON public.workflow_executions(user_id, status);
CREATE INDEX idx_workflow_executions_running ON public.workflow_executions(status) WHERE status = 'running';

-- Conversations
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_last_message ON public.conversations(user_id, last_message_at DESC);
CREATE INDEX idx_conversations_active ON public.conversations(user_id) WHERE deleted_at IS NULL;

-- Messages
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id, created_at);

-- User Intelligence
CREATE INDEX idx_user_intelligence_user_id ON public.user_intelligence(user_id);
CREATE INDEX idx_user_intelligence_type ON public.user_intelligence(type, status);
CREATE INDEX idx_user_intelligence_confidence ON public.user_intelligence(confidence DESC);
CREATE INDEX idx_user_intelligence_data_gin ON public.user_intelligence USING GIN(data);

-- Daily Snapshots
CREATE INDEX idx_daily_snapshots_user_date ON public.daily_snapshots(user_id, snapshot_date DESC);
CREATE INDEX idx_daily_snapshots_data_gin ON public.daily_snapshots USING GIN(data);

-- Action Suggestions
CREATE INDEX idx_action_suggestions_user_id ON public.action_suggestions(user_id);
CREATE INDEX idx_action_suggestions_status ON public.action_suggestions(status);
CREATE INDEX idx_action_suggestions_user_status ON public.action_suggestions(user_id, status);
CREATE INDEX idx_action_suggestions_type ON public.action_suggestions(type);

-- Decisions
CREATE INDEX idx_decisions_user_id ON public.decisions(user_id);
CREATE INDEX idx_decisions_status ON public.decisions(status);
CREATE INDEX idx_decisions_urgency ON public.decisions(urgency);
CREATE INDEX idx_decisions_deadline ON public.decisions(deadline) WHERE deadline IS NOT NULL;

-- Events Log
CREATE INDEX idx_events_log_user_id ON public.events_log(user_id, created_at DESC);
CREATE INDEX idx_events_log_event_type ON public.events_log(event_type);
CREATE INDEX idx_events_log_created_at ON public.events_log(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events_log ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- OAuth Tokens
CREATE POLICY "Users can view own tokens" ON public.oauth_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages tokens" ON public.oauth_tokens FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Emails
CREATE POLICY "Users can view own emails" ON public.emails FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages emails" ON public.emails FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Contacts
CREATE POLICY "Users can manage own contacts" ON public.contacts FOR ALL USING (auth.uid() = user_id);

-- Events
CREATE POLICY "Users can view own events" ON public.events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages events" ON public.events FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Tasks
CREATE POLICY "Users can manage own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);

-- Workflows
CREATE POLICY "Users can manage own workflows" ON public.workflows FOR ALL USING (auth.uid() = user_id);

-- Workflow Executions
CREATE POLICY "Users can view own executions" ON public.workflow_executions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages executions" ON public.workflow_executions FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Conversations
CREATE POLICY "Users can manage own conversations" ON public.conversations FOR ALL USING (auth.uid() = user_id);

-- Messages
CREATE POLICY "Users can view messages in own conversations" ON public.messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()));
CREATE POLICY "Users can insert messages in own conversations" ON public.messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()));

-- User Intelligence
CREATE POLICY "Users can view own intelligence" ON public.user_intelligence FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages intelligence" ON public.user_intelligence FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Daily Snapshots
CREATE POLICY "Users can view own snapshots" ON public.daily_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages snapshots" ON public.daily_snapshots FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Action Suggestions
CREATE POLICY "Users can view own suggestions" ON public.action_suggestions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own suggestions" ON public.action_suggestions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role manages suggestions" ON public.action_suggestions FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Decisions
CREATE POLICY "Users can manage own decisions" ON public.decisions FOR ALL USING (auth.uid() = user_id);

-- Events Log
CREATE POLICY "Users can insert events" ON public.events_log FOR INSERT WITH CHECK (auth.jwt()->>'role' IN ('authenticated', 'service_role'));
CREATE POLICY "Users can view own events" ON public.events_log FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_oauth_tokens_updated_at BEFORE UPDATE ON public.oauth_tokens FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON public.emails FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON public.workflows FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_user_intelligence_updated_at BEFORE UPDATE ON public.user_intelligence FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_action_suggestions_updated_at BEFORE UPDATE ON public.action_suggestions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_decisions_updated_at BEFORE UPDATE ON public.decisions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Update conversation message count
CREATE OR REPLACE FUNCTION public.update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.conversations
    SET message_count = message_count + 1, last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.conversations
    SET message_count = message_count - 1
    WHERE id = OLD.conversation_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message_insert AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_conversation_message_count();
CREATE TRIGGER update_conversation_on_message_delete AFTER DELETE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_conversation_message_count();

-- Update email search vector
CREATE OR REPLACE FUNCTION public.update_email_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.subject, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.body_text, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.from_email, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_emails_search_vector BEFORE INSERT OR UPDATE ON public.emails FOR EACH ROW EXECUTE FUNCTION public.update_email_search_vector();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, primary_provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'provider', 'google')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update user last_seen_at
CREATE OR REPLACE FUNCTION public.update_user_last_seen()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users
  SET last_seen_at = NOW()
  WHERE id = auth.uid();
END;
$$;

-- =====================================================
-- REALTIME
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emails;
ALTER PUBLICATION supabase_realtime ADD TABLE public.action_suggestions;

-- =====================================================
-- VIEWS (for backward compatibility and convenience)
-- =====================================================

-- Email threads view (groups emails by thread)
CREATE OR REPLACE VIEW public.email_threads AS
SELECT
  user_id,
  provider,
  provider_thread_id,
  MAX(subject) as subject,
  COUNT(*) as message_count,
  MAX(sent_at) as last_message_at,
  BOOL_OR(is_unread) as is_unread,
  BOOL_OR(is_starred) as is_starred,
  array_agg(DISTINCT label) FILTER (WHERE label IS NOT NULL) as labels,
  jsonb_build_object(
    'participants', array_agg(DISTINCT from_email),
    'first_message_at', MIN(sent_at),
    'snippet', (array_agg(snippet ORDER BY sent_at DESC))[1]
  ) as metadata
FROM public.emails
CROSS JOIN LATERAL unnest(labels) as label
GROUP BY user_id, provider, provider_thread_id;

-- =====================================================
-- SCHEMA COMPLETE
-- Total Tables: 15 (reduced from 42)
-- - Core: users, oauth_tokens, emails, contacts, events, tasks, workflows, workflow_executions
-- - Conversations: conversations, messages
-- - Intelligence: user_intelligence, daily_snapshots, action_suggestions, decisions
-- - Analytics: events_log
-- =====================================================
