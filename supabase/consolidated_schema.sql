-- =====================================================
-- TIDE CONSOLIDATED DATABASE SCHEMA
-- All tables consolidated from schema.sql + 6 migration files
-- Optimized and deduplicated
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- User Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  primary_provider TEXT NOT NULL CHECK (primary_provider IN ('google', 'microsoft')),
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OAuth Tokens
CREATE TABLE IF NOT EXISTS public.oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT[] NOT NULL,
  provider_user_id TEXT,
  provider_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- =====================================================
-- EMAIL TABLES
-- =====================================================

-- Email Threads
CREATE TABLE IF NOT EXISTS public.email_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft')),
  provider_thread_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  snippet TEXT,
  participants JSONB DEFAULT '[]'::jsonb,
  message_count INTEGER DEFAULT 0,
  is_unread BOOLEAN DEFAULT true,
  is_starred BOOLEAN DEFAULT false,
  labels TEXT[] DEFAULT '{}',
  last_message_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider, provider_thread_id)
);

-- Email Messages
CREATE TABLE IF NOT EXISTS public.email_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES public.email_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft')),
  provider_message_id TEXT NOT NULL,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  snippet TEXT,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_emails TEXT[] NOT NULL,
  cc_emails TEXT[] DEFAULT '{}',
  bcc_emails TEXT[] DEFAULT '{}',
  is_unread BOOLEAN DEFAULT true,
  is_starred BOOLEAN DEFAULT false,
  labels TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]'::jsonb,
  sent_at TIMESTAMPTZ NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  search_vector tsvector,
  UNIQUE(user_id, provider, provider_message_id)
);

-- Email Triage
CREATE TABLE IF NOT EXISTS public.email_triage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_id TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('urgent', 'important', 'newsletter', 'promotional', 'social', 'spam', 'other')),
  priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 10),
  urgency TEXT NOT NULL CHECK (urgency IN ('critical', 'high', 'medium', 'low')),
  requires_response BOOLEAN NOT NULL DEFAULT false,
  response_by TIMESTAMPTZ,
  suggested_action TEXT,
  action_confidence DOUBLE PRECISION,
  autonomous_action_taken TEXT,
  autonomous_executed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Relationship Intelligence
CREATE TABLE IF NOT EXISTS public.relationship_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_email TEXT NOT NULL,
  contact_name TEXT,
  relationship_strength DOUBLE PRECISION NOT NULL DEFAULT 0.5 CHECK (relationship_strength BETWEEN 0 AND 1),
  interaction_frequency TEXT NOT NULL DEFAULT 'occasional' CHECK (interaction_frequency IN ('daily', 'weekly', 'monthly', 'occasional', 'rare')),
  last_interaction_at TIMESTAMPTZ,
  total_emails_sent INTEGER NOT NULL DEFAULT 0,
  total_emails_received INTEGER NOT NULL DEFAULT 0,
  average_response_time_minutes INTEGER,
  topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  sentiment TEXT DEFAULT 'neutral' CHECK (sentiment IN ('very_positive', 'positive', 'neutral', 'negative', 'very_negative')),
  vip_status BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, contact_email)
);

-- Email Patterns
CREATE TABLE IF NOT EXISTS public.email_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('auto_archive', 'auto_respond', 'delegation', 'prioritization', 'categorization')),
  trigger_conditions JSONB NOT NULL,
  action_taken TEXT NOT NULL,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  user_approved_count INTEGER NOT NULL DEFAULT 0,
  user_rejected_count INTEGER NOT NULL DEFAULT 0,
  confidence DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Autonomous Email Actions
CREATE TABLE IF NOT EXISTS public.autonomous_email_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_id TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('archive', 'respond', 'forward', 'categorize', 'flag', 'delete', 'delegate')),
  action_details JSONB NOT NULL,
  reasoning TEXT NOT NULL,
  confidence DOUBLE PRECISION NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  undone_at TIMESTAMPTZ,
  user_feedback TEXT CHECK (user_feedback IN ('approved', 'rejected', 'modified', 'undone')),
  feedback_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- CALENDAR TABLES
-- =====================================================

-- Calendar Events
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft')),
  provider_event_id TEXT NOT NULL,
  provider_calendar_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  is_all_day BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  is_recurring BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'tentative', 'cancelled')),
  attendees JSONB DEFAULT '[]'::jsonb,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider, provider_event_id)
);

-- Meeting Briefs
CREATE TABLE IF NOT EXISTS public.meeting_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  attendees JSONB NOT NULL DEFAULT '[]'::jsonb,
  attendee_insights JSONB NOT NULL DEFAULT '[]'::jsonb,
  relevant_emails JSONB NOT NULL DEFAULT '[]'::jsonb,
  previous_meetings JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  key_discussion_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  background_context TEXT,
  preparation_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggested_time_allocation JSONB,
  confidence DOUBLE PRECISION NOT NULL DEFAULT 0.8,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scheduling Preferences
CREATE TABLE IF NOT EXISTS public.scheduling_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  focus_time_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  preferred_meeting_times JSONB NOT NULL DEFAULT '[]'::jsonb,
  max_meetings_per_day INTEGER DEFAULT 6,
  min_gap_between_meetings_minutes INTEGER DEFAULT 15,
  preferred_meeting_duration_minutes INTEGER DEFAULT 30,
  batch_meetings BOOLEAN DEFAULT true,
  protect_lunch_time BOOLEAN DEFAULT true,
  lunch_time_start TEXT DEFAULT '12:00',
  lunch_time_end TEXT DEFAULT '13:00',
  no_meeting_days JSONB NOT NULL DEFAULT '[]'::jsonb,
  time_zone TEXT NOT NULL DEFAULT 'UTC',
  working_hours_start TEXT DEFAULT '09:00',
  working_hours_end TEXT DEFAULT '17:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Calendar Optimizations
CREATE TABLE IF NOT EXISTS public.calendar_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  optimization_type TEXT NOT NULL CHECK (optimization_type IN ('batch_meetings', 'reduce_conflicts', 'protect_focus_time', 'balance_load', 'reschedule_suggestion')),
  current_state JSONB NOT NULL,
  suggested_state JSONB NOT NULL,
  reasoning TEXT NOT NULL,
  impact_score DOUBLE PRECISION NOT NULL,
  estimated_time_saved_minutes INTEGER,
  affected_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'applied')),
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Meeting Conflicts
CREATE TABLE IF NOT EXISTS public.meeting_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conflict_type TEXT NOT NULL CHECK (conflict_type IN ('double_booking', 'overlapping', 'back_to_back', 'violates_focus_time', 'exceeds_daily_limit')),
  event_id_1 TEXT NOT NULL,
  event_id_2 TEXT,
  event_1_details JSONB NOT NULL,
  event_2_details JSONB,
  priority_1 INTEGER NOT NULL CHECK (priority_1 BETWEEN 1 AND 10),
  priority_2 INTEGER CHECK (priority_2 BETWEEN 1 AND 10),
  suggested_resolution TEXT NOT NULL,
  resolution_options JSONB NOT NULL DEFAULT '[]'::jsonb,
  auto_resolvable BOOLEAN NOT NULL DEFAULT false,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolution_applied JSONB,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Smart Scheduling Suggestions
CREATE TABLE IF NOT EXISTS public.smart_scheduling_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meeting_title TEXT NOT NULL,
  attendees JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_minutes INTEGER NOT NULL,
  suggested_time_slots JSONB NOT NULL DEFAULT '[]'::jsonb,
  reasoning JSONB NOT NULL,
  optimization_factors JSONB NOT NULL,
  confidence DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Previous Meeting Notes
CREATE TABLE IF NOT EXISTS public.previous_meeting_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  meeting_title TEXT NOT NULL,
  meeting_date TIMESTAMPTZ NOT NULL,
  attendees JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  decisions_made JSONB NOT NULL DEFAULT '[]'::jsonb,
  key_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  follow_up_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- CONVERSATIONS & MESSAGES
-- =====================================================

-- Conversations (AI Chat)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  summary TEXT,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TASKS & WORKFLOWS
-- =====================================================

-- Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  priority_score DOUBLE PRECISION DEFAULT 0.5,
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  progress INTEGER DEFAULT 0,
  estimated_duration_minutes INTEGER,
  assignee TEXT,
  tags TEXT[] DEFAULT '{}',
  project TEXT,
  complexity TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Subtasks
CREATE TABLE IF NOT EXISTS public.subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  estimated_time_minutes INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Dependencies
CREATE TABLE IF NOT EXISTS public.task_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  dependency_type TEXT DEFAULT 'blocks' CHECK (dependency_type IN ('blocks', 'related', 'parent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, depends_on_task_id)
);

-- Task Executions
CREATE TABLE IF NOT EXISTS public.task_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Workflows
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  version INTEGER DEFAULT 1,
  definition JSONB NOT NULL,
  trigger_config JSONB NOT NULL,
  action_config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active',
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Workflow Executions
CREATE TABLE IF NOT EXISTS public.workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  current_step INTEGER DEFAULT 0,
  context JSONB,
  error TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- =====================================================
-- INTELLIGENCE & PATTERNS
-- =====================================================

-- Daily Snapshots
CREATE TABLE IF NOT EXISTS public.daily_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  priority_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  pending_decisions JSONB NOT NULL DEFAULT '[]'::jsonb,
  meeting_previews JSONB NOT NULL DEFAULT '[]'::jsonb,
  predictions JSONB NOT NULL DEFAULT '[]'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);

-- Action Suggestions
CREATE TABLE IF NOT EXISTS public.action_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN (
    'email_response', 'schedule_meeting', 'delegate_task', 'decline_meeting',
    'archive_email', 'send_reminder', 'update_task', 'reschedule_meeting'
  )),
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  preview TEXT NOT NULL,
  confidence FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'executed', 'failed')),
  executed_at TIMESTAMPTZ,
  execution_result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Patterns (Learned User Behavior)
CREATE TABLE IF NOT EXISTS public.patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('email_response', 'meeting_preference', 'task_priority', 'workflow', 'other')),
  name TEXT NOT NULL,
  description TEXT,
  pattern_data JSONB NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.50 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Behaviors (Pattern Detection)
CREATE TABLE IF NOT EXISTS public.user_behaviors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  day_of_week INTEGER,
  hour INTEGER,
  time_of_day TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Detected Patterns
CREATE TABLE IF NOT EXISTS public.detected_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  subtype TEXT,
  pattern_data JSONB NOT NULL,
  confidence DOUBLE PRECISION NOT NULL,
  frequency INTEGER DEFAULT 0,
  value_estimate DOUBLE PRECISION,
  description TEXT,
  suggestion TEXT,
  status TEXT DEFAULT 'detected' CHECK (status IN ('detected', 'suggested', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pattern Sequences
CREATE TABLE IF NOT EXISTS public.pattern_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actions TEXT[] NOT NULL,
  signature TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, signature)
);

-- Temporal Patterns
CREATE TABLE IF NOT EXISTS public.temporal_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL,
  time_of_day TEXT,
  day_of_week INTEGER,
  action TEXT NOT NULL,
  frequency INTEGER DEFAULT 0,
  confidence DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sequential Patterns
CREATE TABLE IF NOT EXISTS public.sequential_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sequence TEXT[] NOT NULL,
  frequency INTEGER DEFAULT 0,
  confidence DOUBLE PRECISION NOT NULL,
  next_action TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automation Suggestions
CREATE TABLE IF NOT EXISTS public.automation_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  pattern_id UUID REFERENCES public.detected_patterns(id) ON DELETE CASCADE,
  automation_type TEXT NOT NULL,
  configuration JSONB NOT NULL,
  confidence DOUBLE PRECISION NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DECISIONS
-- =====================================================

-- Decisions
CREATE TABLE IF NOT EXISTS public.decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  decision_type TEXT NOT NULL CHECK (decision_type IN (
    'approval', 'choice', 'prioritization', 'scheduling', 'budget',
    'hire', 'partnership', 'strategic', 'operational'
  )),
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_recommendation JSONB,
  user_decision JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'declined', 'deferred', 'discussed'
  )),
  urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  deadline TIMESTAMPTZ,
  requester_name TEXT,
  requester_email TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Decision History
CREATE TABLE IF NOT EXISTS public.decision_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decision_type TEXT NOT NULL,
  ai_recommended TEXT,
  user_chose TEXT,
  outcome TEXT,
  outcome_notes TEXT,
  confidence_score FLOAT,
  decided_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  autonomy_level TEXT NOT NULL DEFAULT 'balanced' CHECK (autonomy_level IN ('conservative', 'balanced', 'aggressive')),
  trusted_senders TEXT[] DEFAULT '{}',
  vip_contacts TEXT[] DEFAULT '{}',
  never_automate_categories TEXT[] DEFAULT '{}',
  custom_rules JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- ANALYTICS
-- =====================================================

-- Analytics Events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  session_id UUID,
  platform TEXT,
  app_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- User Profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_primary_provider ON public.user_profiles(primary_provider);

-- OAuth Tokens
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_id ON public.oauth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_expires_at ON public.oauth_tokens(expires_at);

-- Email Threads
CREATE INDEX IF NOT EXISTS idx_email_threads_user_id ON public.email_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_last_message_at ON public.email_threads(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_threads_unread ON public.email_threads(is_unread) WHERE is_unread = true;
CREATE INDEX IF NOT EXISTS idx_email_threads_provider ON public.email_threads(provider, provider_thread_id);

-- Email Messages
CREATE INDEX IF NOT EXISTS idx_email_messages_thread_id ON public.email_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_user_id ON public.email_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_sent_at ON public.email_messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_messages_search_vector ON public.email_messages USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_email_messages_from_email ON public.email_messages(user_id, from_email);

-- Email Triage
CREATE INDEX IF NOT EXISTS idx_email_triage_user_id ON public.email_triage(user_id);
CREATE INDEX IF NOT EXISTS idx_email_triage_category ON public.email_triage(category);
CREATE INDEX IF NOT EXISTS idx_email_triage_priority ON public.email_triage(priority);

-- Relationship Intelligence
CREATE INDEX IF NOT EXISTS idx_relationship_intelligence_user_id ON public.relationship_intelligence(user_id);
CREATE INDEX IF NOT EXISTS idx_relationship_intelligence_contact_email ON public.relationship_intelligence(contact_email);
CREATE INDEX IF NOT EXISTS idx_relationship_intelligence_vip_status ON public.relationship_intelligence(vip_status);

-- Email Patterns
CREATE INDEX IF NOT EXISTS idx_email_patterns_user_id ON public.email_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_email_patterns_enabled ON public.email_patterns(enabled);

-- Autonomous Email Actions
CREATE INDEX IF NOT EXISTS idx_autonomous_actions_user_id ON public.autonomous_email_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_autonomous_actions_email_id ON public.autonomous_email_actions(email_id);
CREATE INDEX IF NOT EXISTS idx_autonomous_actions_executed_at ON public.autonomous_email_actions(executed_at);

-- Calendar Events
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_provider ON public.calendar_events(provider, provider_event_id);

-- Meeting Briefs
CREATE INDEX IF NOT EXISTS idx_meeting_briefs_user_id ON public.meeting_briefs(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_briefs_start_time ON public.meeting_briefs(start_time);

-- Scheduling Preferences
CREATE INDEX IF NOT EXISTS idx_scheduling_preferences_user_id ON public.scheduling_preferences(user_id);

-- Calendar Optimizations
CREATE INDEX IF NOT EXISTS idx_calendar_optimizations_user_id ON public.calendar_optimizations(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_optimizations_status ON public.calendar_optimizations(status);

-- Meeting Conflicts
CREATE INDEX IF NOT EXISTS idx_meeting_conflicts_user_id ON public.meeting_conflicts(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_conflicts_resolved ON public.meeting_conflicts(resolved);

-- Smart Scheduling Suggestions
CREATE INDEX IF NOT EXISTS idx_smart_scheduling_user_id ON public.smart_scheduling_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_scheduling_status ON public.smart_scheduling_suggestions(status);

-- Previous Meeting Notes
CREATE INDEX IF NOT EXISTS idx_previous_meeting_notes_user_id ON public.previous_meeting_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_previous_meeting_notes_meeting_date ON public.previous_meeting_notes(meeting_date);

-- Conversations
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON public.conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_deleted_at ON public.conversations(deleted_at) WHERE deleted_at IS NULL;

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON public.tasks(due_at) WHERE due_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_priority_score ON public.tasks(priority_score DESC);

-- Subtasks
CREATE INDEX IF NOT EXISTS idx_subtasks_parent_id ON public.subtasks(parent_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_status ON public.subtasks(status);

-- Task Dependencies
CREATE INDEX IF NOT EXISTS idx_task_dependencies_task_id ON public.task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends_on ON public.task_dependencies(depends_on_task_id);

-- Task Executions
CREATE INDEX IF NOT EXISTS idx_task_executions_task_id ON public.task_executions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_executions_user_id ON public.task_executions(user_id);

-- Workflows
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON public.workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_active ON public.workflows(is_active) WHERE is_active = true;

-- Workflow Executions
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON public.workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_user_id ON public.workflow_executions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON public.workflow_executions(status);

-- Daily Snapshots
CREATE INDEX IF NOT EXISTS idx_daily_snapshots_user_date ON public.daily_snapshots(user_id, snapshot_date DESC);

-- Action Suggestions
CREATE INDEX IF NOT EXISTS idx_action_suggestions_user_id ON public.action_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_action_suggestions_status ON public.action_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_action_suggestions_user_status ON public.action_suggestions(user_id, status);

-- Patterns
CREATE INDEX IF NOT EXISTS idx_patterns_user_id ON public.patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_patterns_type ON public.patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_patterns_confidence ON public.patterns(confidence_score DESC);

-- User Behaviors
CREATE INDEX IF NOT EXISTS idx_user_behaviors_user_id ON public.user_behaviors(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behaviors_timestamp ON public.user_behaviors(timestamp DESC);

-- Detected Patterns
CREATE INDEX IF NOT EXISTS idx_detected_patterns_user_id ON public.detected_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_detected_patterns_status ON public.detected_patterns(status);

-- Pattern Sequences
CREATE INDEX IF NOT EXISTS idx_pattern_sequences_user_id ON public.pattern_sequences(user_id);
CREATE INDEX IF NOT EXISTS idx_pattern_sequences_count ON public.pattern_sequences(count DESC);

-- Temporal Patterns
CREATE INDEX IF NOT EXISTS idx_temporal_patterns_user_id ON public.temporal_patterns(user_id);

-- Sequential Patterns
CREATE INDEX IF NOT EXISTS idx_sequential_patterns_user_id ON public.sequential_patterns(user_id);

-- Automation Suggestions
CREATE INDEX IF NOT EXISTS idx_automation_suggestions_user_id ON public.automation_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_suggestions_status ON public.automation_suggestions(status);

-- Decisions
CREATE INDEX IF NOT EXISTS idx_decisions_user_id ON public.decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_decisions_status ON public.decisions(status);
CREATE INDEX IF NOT EXISTS idx_decisions_urgency ON public.decisions(urgency);

-- Decision History
CREATE INDEX IF NOT EXISTS idx_decision_history_user_id ON public.decision_history(user_id);
CREATE INDEX IF NOT EXISTS idx_decision_history_decision_id ON public.decision_history(decision_id);

-- User Preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Analytics Events
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_triage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationship_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autonomous_email_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduling_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_scheduling_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.previous_meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detected_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pattern_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temporal_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequential_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- OAuth Tokens Policies
CREATE POLICY "Users can view own OAuth tokens" ON public.oauth_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all OAuth tokens" ON public.oauth_tokens FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Email Threads Policies
CREATE POLICY "Users can view own email threads" ON public.email_threads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all email threads" ON public.email_threads FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Email Messages Policies
CREATE POLICY "Users can view own email messages" ON public.email_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all email messages" ON public.email_messages FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Email Intelligence Policies (Triage, Relationships, Patterns, Actions)
CREATE POLICY "Users can view own email triage" ON public.email_triage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own relationship intelligence" ON public.relationship_intelligence FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own email patterns" ON public.email_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own autonomous actions" ON public.autonomous_email_actions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage email intelligence" ON public.email_triage FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role can manage relationships" ON public.relationship_intelligence FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role can manage patterns" ON public.email_patterns FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role can manage autonomous actions" ON public.autonomous_email_actions FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Calendar Events Policies
CREATE POLICY "Users can view own calendar events" ON public.calendar_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all calendar events" ON public.calendar_events FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Calendar Intelligence Policies
CREATE POLICY "Users can view own meeting briefs" ON public.meeting_briefs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own scheduling preferences" ON public.scheduling_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own calendar optimizations" ON public.calendar_optimizations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own meeting conflicts" ON public.meeting_conflicts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own scheduling suggestions" ON public.smart_scheduling_suggestions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own meeting notes" ON public.previous_meeting_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage calendar intelligence" ON public.meeting_briefs FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role can manage scheduling prefs" ON public.scheduling_preferences FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role can manage optimizations" ON public.calendar_optimizations FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role can manage conflicts" ON public.meeting_conflicts FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role can manage scheduling suggestions" ON public.smart_scheduling_suggestions FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role can manage meeting notes" ON public.previous_meeting_notes FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Conversations Policies
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can insert own conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.conversations FOR UPDATE USING (auth.uid() = user_id);

-- Messages Policies
CREATE POLICY "Users can view messages in own conversations" ON public.messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()));
CREATE POLICY "Users can insert messages in own conversations" ON public.messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()));

-- Tasks Policies
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);

-- Subtasks Policies
CREATE POLICY "Users can manage own subtasks" ON public.subtasks FOR ALL
  USING (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = subtasks.parent_id AND tasks.user_id = auth.uid()));

-- Task Dependencies Policies
CREATE POLICY "Users can manage own task dependencies" ON public.task_dependencies FOR ALL
  USING (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_dependencies.task_id AND tasks.user_id = auth.uid()));

-- Task Executions Policies
CREATE POLICY "Users can view own task executions" ON public.task_executions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage task executions" ON public.task_executions FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Workflows Policies
CREATE POLICY "Users can view own workflows" ON public.workflows FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own workflows" ON public.workflows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workflows" ON public.workflows FOR UPDATE USING (auth.uid() = user_id);

-- Workflow Executions Policies
CREATE POLICY "Users can view own workflow executions" ON public.workflow_executions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage workflow executions" ON public.workflow_executions FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Daily Snapshots Policies
CREATE POLICY "Users can view own snapshots" ON public.daily_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage snapshots" ON public.daily_snapshots FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Action Suggestions Policies
CREATE POLICY "Users can view own action suggestions" ON public.action_suggestions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own action suggestions" ON public.action_suggestions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage action suggestions" ON public.action_suggestions FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Patterns Policies
CREATE POLICY "Users can view own patterns" ON public.patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage patterns" ON public.patterns FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Behavior & Pattern Detection Policies
CREATE POLICY "Users can view own behaviors" ON public.user_behaviors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own detected patterns" ON public.detected_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own sequences" ON public.pattern_sequences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own temporal patterns" ON public.temporal_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own sequential patterns" ON public.sequential_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own automation suggestions" ON public.automation_suggestions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage behaviors" ON public.user_behaviors FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role can manage detected patterns" ON public.detected_patterns FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role can manage sequences" ON public.pattern_sequences FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role can manage temporal patterns" ON public.temporal_patterns FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role can manage sequential patterns" ON public.sequential_patterns FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role can manage automation suggestions" ON public.automation_suggestions FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Decisions Policies
CREATE POLICY "Users can view own decisions" ON public.decisions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own decisions" ON public.decisions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage decisions" ON public.decisions FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Decision History Policies
CREATE POLICY "Users can view own decision history" ON public.decision_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage decision history" ON public.decision_history FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- User Preferences Policies
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage preferences" ON public.user_preferences FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Analytics Events Policies
CREATE POLICY "Service role can insert analytics events" ON public.analytics_events FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role' OR auth.jwt()->>'role' = 'authenticated');
CREATE POLICY "Users can view own analytics events" ON public.analytics_events FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_oauth_tokens_updated_at BEFORE UPDATE ON public.oauth_tokens FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_email_threads_updated_at BEFORE UPDATE ON public.email_threads FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_email_messages_updated_at BEFORE UPDATE ON public.email_messages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_email_triage_updated_at BEFORE UPDATE ON public.email_triage FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_relationship_intelligence_updated_at BEFORE UPDATE ON public.relationship_intelligence FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_email_patterns_updated_at BEFORE UPDATE ON public.email_patterns FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_meeting_briefs_updated_at BEFORE UPDATE ON public.meeting_briefs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_scheduling_preferences_updated_at BEFORE UPDATE ON public.scheduling_preferences FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_calendar_optimizations_updated_at BEFORE UPDATE ON public.calendar_optimizations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_meeting_conflicts_updated_at BEFORE UPDATE ON public.meeting_conflicts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_smart_scheduling_updated_at BEFORE UPDATE ON public.smart_scheduling_suggestions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_previous_meeting_notes_updated_at BEFORE UPDATE ON public.previous_meeting_notes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_subtasks_updated_at BEFORE UPDATE ON public.subtasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON public.workflows FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_daily_snapshots_updated_at BEFORE UPDATE ON public.daily_snapshots FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_action_suggestions_updated_at BEFORE UPDATE ON public.action_suggestions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_patterns_updated_at BEFORE UPDATE ON public.patterns FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_detected_patterns_updated_at BEFORE UPDATE ON public.detected_patterns FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_decisions_updated_at BEFORE UPDATE ON public.decisions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

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

-- Update email messages search vector
CREATE OR REPLACE FUNCTION public.email_messages_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.subject, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.body_text, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.from_email, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_messages_search_vector_trigger BEFORE INSERT OR UPDATE ON public.email_messages FOR EACH ROW EXECUTE FUNCTION public.email_messages_search_vector_update();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, primary_provider)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'provider', 'google')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_threads;

-- =====================================================
-- SCHEMA COMPLETE
-- Total Tables: 42
-- =====================================================
