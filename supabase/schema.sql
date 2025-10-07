-- =====================================================
-- Tide Supabase Database Schema
-- =====================================================
-- This schema replaces the custom auth + PostgreSQL setup
-- with Supabase's built-in auth.users table and RLS policies
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- USER PROFILES
-- =====================================================
-- Extends Supabase auth.users with Tide-specific profile data
-- One-to-one relationship with auth.users (id matches)

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Display info
  full_name TEXT NOT NULL,
  avatar_url TEXT,

  -- OAuth provider info
  primary_provider TEXT NOT NULL CHECK (primary_provider IN ('google', 'microsoft')),

  -- Preferences
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- OAUTH TOKENS
-- =====================================================
-- Stores OAuth access/refresh tokens for Gmail/Calendar APIs
-- Encrypted at rest by Supabase, additional app-level encryption recommended

CREATE TABLE IF NOT EXISTS public.oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft')),

  -- OAuth tokens (store encrypted)
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ NOT NULL,

  -- Scopes granted by user
  scopes TEXT[] NOT NULL,

  -- Provider-specific identifiers
  provider_user_id TEXT,
  provider_email TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, provider)
);

-- RLS Policies for oauth_tokens
ALTER TABLE public.oauth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own OAuth tokens"
  ON public.oauth_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all OAuth tokens"
  ON public.oauth_tokens
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE TRIGGER update_oauth_tokens_updated_at
  BEFORE UPDATE ON public.oauth_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- CONVERSATIONS
-- =====================================================
-- AI chat conversations

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT,
  summary TEXT,

  -- Conversation metadata
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON public.conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_deleted_at ON public.conversations(deleted_at) WHERE deleted_at IS NULL;

-- RLS Policies for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON public.conversations
  FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own conversations"
  ON public.conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON public.conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can soft-delete own conversations"
  ON public.conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- MESSAGES
-- =====================================================
-- Individual messages in conversations

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,

  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- Message metadata
  tokens_used INTEGER,
  model TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- RLS Policies for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own conversations"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own conversations"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to update conversation message count
CREATE OR REPLACE FUNCTION public.update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.conversations
    SET
      message_count = message_count + 1,
      last_message_at = NEW.created_at
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

CREATE TRIGGER update_conversation_on_message_insert
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_message_count();

CREATE TRIGGER update_conversation_on_message_delete
  AFTER DELETE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_message_count();

-- =====================================================
-- CALENDAR EVENTS
-- =====================================================
-- Synced calendar events from Google Calendar / Outlook

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- External provider info
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
  is_recurring BOOLEAN DEFAULT false,

  -- Status
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'tentative', 'cancelled')),

  -- Attendees (JSONB array)
  attendees JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, provider, provider_event_id)
);

-- Indexes for calendar_events
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_provider ON public.calendar_events(provider, provider_event_id);

-- RLS Policies for calendar_events
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calendar events"
  ON public.calendar_events
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all calendar events"
  ON public.calendar_events
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- EMAIL THREADS
-- =====================================================
-- Synced email threads from Gmail / Outlook

CREATE TABLE IF NOT EXISTS public.email_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- External provider info
  provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft')),
  provider_thread_id TEXT NOT NULL,

  -- Thread details
  subject TEXT NOT NULL,
  snippet TEXT,

  -- Participants
  participants JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  message_count INTEGER DEFAULT 0,
  is_unread BOOLEAN DEFAULT true,
  is_starred BOOLEAN DEFAULT false,
  labels TEXT[] DEFAULT '{}',

  -- Timestamps
  last_message_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, provider, provider_thread_id)
);

-- Indexes for email_threads
CREATE INDEX IF NOT EXISTS idx_email_threads_user_id ON public.email_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_last_message_at ON public.email_threads(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_threads_unread ON public.email_threads(is_unread) WHERE is_unread = true;

-- RLS Policies for email_threads
ALTER TABLE public.email_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email threads"
  ON public.email_threads
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all email threads"
  ON public.email_threads
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE TRIGGER update_email_threads_updated_at
  BEFORE UPDATE ON public.email_threads
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- EMAIL MESSAGES
-- =====================================================
-- Individual email messages (multiple per thread)

CREATE TABLE IF NOT EXISTS public.email_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES public.email_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- External provider info
  provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft')),
  provider_message_id TEXT NOT NULL,

  -- Message details
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  snippet TEXT,

  -- Sender/Recipients
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_emails TEXT[] NOT NULL,
  cc_emails TEXT[] DEFAULT '{}',
  bcc_emails TEXT[] DEFAULT '{}',

  -- Metadata
  is_unread BOOLEAN DEFAULT true,
  is_starred BOOLEAN DEFAULT false,
  labels TEXT[] DEFAULT '{}',

  -- Attachments (JSONB array)
  attachments JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  sent_at TIMESTAMPTZ NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, provider, provider_message_id)
);

-- Indexes for email_messages
CREATE INDEX IF NOT EXISTS idx_email_messages_thread_id ON public.email_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_user_id ON public.email_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_sent_at ON public.email_messages(sent_at DESC);

-- RLS Policies for email_messages
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email messages"
  ON public.email_messages
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all email messages"
  ON public.email_messages
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE TRIGGER update_email_messages_updated_at
  BEFORE UPDATE ON public.email_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- WORKFLOWS (NEW - Track 04)
-- =====================================================
-- Workflow definitions created by users

CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Workflow details
  name TEXT NOT NULL,
  description TEXT,

  -- Workflow definition (JSONB)
  trigger_config JSONB NOT NULL,
  action_config JSONB NOT NULL,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Stats
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for workflows
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON public.workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_active ON public.workflows(is_active) WHERE is_active = true;

-- RLS Policies for workflows
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workflows"
  ON public.workflows
  FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create own workflows"
  ON public.workflows
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workflows"
  ON public.workflows
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- TASKS (NEW - Track 04)
-- =====================================================
-- Tasks created by users or AI

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,

  -- Task details
  title TEXT NOT NULL,
  description TEXT,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  -- Due date
  due_at TIMESTAMPTZ,

  -- Completion
  completed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for tasks
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON public.tasks(due_at) WHERE due_at IS NOT NULL;

-- RLS Policies for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON public.tasks
  FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create own tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON public.tasks
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- PATTERNS (NEW - Track 02)
-- =====================================================
-- Learned patterns from user behavior

CREATE TABLE IF NOT EXISTS public.patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Pattern details
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('email_response', 'meeting_preference', 'task_priority', 'workflow', 'other')),
  name TEXT NOT NULL,
  description TEXT,

  -- Pattern data (JSONB)
  pattern_data JSONB NOT NULL,

  -- Confidence & usage
  confidence_score DECIMAL(3,2) DEFAULT 0.50 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for patterns
CREATE INDEX IF NOT EXISTS idx_patterns_user_id ON public.patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_patterns_type ON public.patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_patterns_confidence ON public.patterns(confidence_score DESC);

-- RLS Policies for patterns
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own patterns"
  ON public.patterns
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage patterns"
  ON public.patterns
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE TRIGGER update_patterns_updated_at
  BEFORE UPDATE ON public.patterns
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- ANALYTICS EVENTS (NEW - Track 06)
-- =====================================================
-- User activity analytics

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Event details
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,

  -- Event data (JSONB)
  event_data JSONB DEFAULT '{}'::jsonb,

  -- Session tracking
  session_id UUID,

  -- Device info
  platform TEXT,
  app_version TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics_events
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);

-- RLS Policies for analytics_events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert analytics events"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role' OR auth.jwt()->>'role' = 'authenticated');

CREATE POLICY "Users can view own analytics events"
  ON public.analytics_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to create user profile automatically when auth.users record is created
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

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- =====================================================
-- Enable realtime for key tables

ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_threads;

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================
