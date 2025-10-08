-- Email Intelligence Tables
-- Phase 2: Email Intelligence features including drafts, triage, and relationship tracking

-- Email Drafts table
CREATE TABLE email_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_id TEXT NOT NULL, -- Reference to original email
  version TEXT NOT NULL CHECK (version IN ('detailed', 'balanced', 'brief', 'custom')),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  confidence DOUBLE PRECISION NOT NULL,
  tone TEXT NOT NULL CHECK (tone IN ('professional', 'friendly', 'formal', 'casual')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'selected', 'sent', 'discarded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Email Triage table
CREATE TABLE email_triage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Relationship Intelligence table
CREATE TABLE relationship_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Email Patterns table (for learning)
CREATE TABLE email_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('auto_archive', 'auto_respond', 'delegation', 'prioritization', 'categorization')),
  trigger_conditions JSONB NOT NULL, -- Conditions that trigger this pattern
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

-- Autonomous Email Actions Log
CREATE TABLE autonomous_email_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Indexes for performance
CREATE INDEX idx_email_drafts_user_id ON email_drafts(user_id);
CREATE INDEX idx_email_drafts_email_id ON email_drafts(email_id);
CREATE INDEX idx_email_drafts_status ON email_drafts(status);

CREATE INDEX idx_email_triage_user_id ON email_triage(user_id);
CREATE INDEX idx_email_triage_email_id ON email_triage(email_id);
CREATE INDEX idx_email_triage_category ON email_triage(category);
CREATE INDEX idx_email_triage_priority ON email_triage(priority);

CREATE INDEX idx_relationship_intelligence_user_id ON relationship_intelligence(user_id);
CREATE INDEX idx_relationship_intelligence_contact_email ON relationship_intelligence(contact_email);
CREATE INDEX idx_relationship_intelligence_vip_status ON relationship_intelligence(vip_status);
CREATE INDEX idx_relationship_intelligence_strength ON relationship_intelligence(relationship_strength);

CREATE INDEX idx_email_patterns_user_id ON email_patterns(user_id);
CREATE INDEX idx_email_patterns_type ON email_patterns(pattern_type);
CREATE INDEX idx_email_patterns_enabled ON email_patterns(enabled);

CREATE INDEX idx_autonomous_actions_user_id ON autonomous_email_actions(user_id);
CREATE INDEX idx_autonomous_actions_email_id ON autonomous_email_actions(email_id);
CREATE INDEX idx_autonomous_actions_executed_at ON autonomous_email_actions(executed_at);

-- Row Level Security (RLS) Policies
ALTER TABLE email_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_triage ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE autonomous_email_actions ENABLE ROW LEVEL SECURITY;

-- Email Drafts policies
CREATE POLICY "Users can view their own email drafts"
  ON email_drafts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email drafts"
  ON email_drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email drafts"
  ON email_drafts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email drafts"
  ON email_drafts FOR DELETE
  USING (auth.uid() = user_id);

-- Email Triage policies
CREATE POLICY "Users can view their own email triage"
  ON email_triage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email triage"
  ON email_triage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email triage"
  ON email_triage FOR UPDATE
  USING (auth.uid() = user_id);

-- Relationship Intelligence policies
CREATE POLICY "Users can view their own relationship intelligence"
  ON relationship_intelligence FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own relationship intelligence"
  ON relationship_intelligence FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own relationship intelligence"
  ON relationship_intelligence FOR UPDATE
  USING (auth.uid() = user_id);

-- Email Patterns policies
CREATE POLICY "Users can view their own email patterns"
  ON email_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email patterns"
  ON email_patterns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email patterns"
  ON email_patterns FOR UPDATE
  USING (auth.uid() = user_id);

-- Autonomous Actions policies
CREATE POLICY "Users can view their own autonomous actions"
  ON autonomous_email_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own autonomous actions"
  ON autonomous_email_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own autonomous actions"
  ON autonomous_email_actions FOR UPDATE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_email_drafts_updated_at
  BEFORE UPDATE ON email_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_triage_updated_at
  BEFORE UPDATE ON email_triage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relationship_intelligence_updated_at
  BEFORE UPDATE ON relationship_intelligence
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_patterns_updated_at
  BEFORE UPDATE ON email_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
