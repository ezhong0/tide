-- ============================================================================
-- TIDE COMPLETE DATABASE SCHEMA
-- All tables for all feature tracks (Track 0-4)
-- Last Updated: 2025-10-07
-- ============================================================================

-- TRACK 0: User Management
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  primary_provider TEXT, -- 'google', 'microsoft'
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- TRACK 1: Email Intelligence - OAuth Tokens
CREATE TABLE IF NOT EXISTS oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'google', 'microsoft'
  service TEXT NOT NULL, -- 'email', 'calendar'
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider, service)
);

ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tokens" ON oauth_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tokens" ON oauth_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tokens" ON oauth_tokens FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access on tokens" ON oauth_tokens FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- TRACK 1: Email Intelligence - Email Threads
CREATE TABLE IF NOT EXISTS email_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  external_thread_id TEXT NOT NULL,
  subject TEXT,
  participants TEXT[],
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, external_thread_id)
);

CREATE INDEX idx_email_threads_user ON email_threads(user_id, last_message_at DESC);
ALTER TABLE email_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own threads" ON email_threads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own threads" ON email_threads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role full access on threads" ON email_threads FOR ALL USING (auth.jwt()->>'role' = 'service_role');

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
  received_at TIMESTAMP WITH TIME ZONE,
  is_read BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  labels TEXT[],
  ai_category TEXT, -- 'urgent', 'important', 'normal', 'low'
  ai_priority INTEGER,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, external_message_id)
);

CREATE INDEX idx_email_messages_user ON email_messages(user_id, received_at DESC);
CREATE INDEX idx_email_messages_category ON email_messages(user_id, ai_category);
CREATE INDEX idx_email_messages_thread ON email_messages(user_id, thread_id);
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own emails" ON email_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own emails" ON email_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role full access on emails" ON email_messages FOR ALL USING (auth.jwt()->>'role' = 'service_role');

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
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  is_all_day BOOLEAN DEFAULT FALSE,
  attendees JSONB, -- [{email, name, response_status}]
  meeting_brief JSONB, -- AI-generated brief
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, external_event_id)
);

CREATE INDEX idx_calendar_events_user ON calendar_events(user_id, start_time);
CREATE INDEX idx_calendar_events_time_range ON calendar_events(user_id, start_time, end_time);
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own events" ON calendar_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own events" ON calendar_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role full access on events" ON calendar_events FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- TRACK 3: AI Chat - Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT,
  summary TEXT,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversations_user ON conversations(user_id, last_message_at DESC);
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON conversations FOR DELETE USING (auth.uid() = user_id);

-- TRACK 3: AI Chat - Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  tokens_used INTEGER,
  model TEXT,
  metadata JSONB, -- Additional data like attachments, actions, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  due_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tasks_user ON tasks(user_id, status, priority);
CREATE INDEX idx_tasks_due ON tasks(user_id, due_at) WHERE status != 'completed';
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workflows_user ON workflows(user_id, is_active);
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own workflows" ON workflows FOR ALL USING (auth.uid() = user_id);

-- TRACK 4: Task & Workflow - Workflow Executions
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'running', -- 'running', 'completed', 'failed', 'cancelled'
  current_step INTEGER DEFAULT 0,
  context JSONB,
  error TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_workflow_executions ON workflow_executions(workflow_id, started_at DESC);
CREATE INDEX idx_workflow_executions_user ON workflow_executions(user_id, status);
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own workflow executions" ON workflow_executions FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oauth_tokens_updated_at BEFORE UPDATE ON oauth_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_threads_updated_at BEFORE UPDATE ON email_threads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_messages_updated_at BEFORE UPDATE ON email_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify all tables created
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

-- List all tables
SELECT table_name,
       (SELECT COUNT(*) FROM information_schema.columns WHERE columns.table_name = tables.table_name) as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
