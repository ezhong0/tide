-- Decision Tracking Tables
-- For managing user decisions with context and AI recommendations

-- Decisions Table
CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  decision_type TEXT NOT NULL CHECK (decision_type IN (
    'approval',
    'choice',
    'prioritization',
    'scheduling',
    'budget',
    'hire',
    'partnership',
    'strategic',
    'operational'
  )),
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_recommendation JSONB,
  user_decision JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'approved',
    'declined',
    'deferred',
    'discussed'
  )),
  urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  deadline TIMESTAMPTZ,
  requester_name TEXT,
  requester_email TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Decision History Table (for analytics and learning)
CREATE TABLE IF NOT EXISTS decision_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  decision_type TEXT NOT NULL,
  ai_recommended TEXT,
  user_chose TEXT,
  outcome TEXT, -- 'positive', 'neutral', 'negative'
  outcome_notes TEXT,
  confidence_score FLOAT,
  decided_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Preferences Table (extends existing or creates new)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  autonomy_level TEXT NOT NULL DEFAULT 'balanced' CHECK (autonomy_level IN ('conservative', 'balanced', 'aggressive')),
  trusted_senders TEXT[] DEFAULT '{}',
  vip_contacts TEXT[] DEFAULT '{}',
  never_automate_categories TEXT[] DEFAULT '{}',
  custom_rules JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for decisions
CREATE INDEX idx_decisions_user_id ON decisions(user_id);
CREATE INDEX idx_decisions_status ON decisions(status);
CREATE INDEX idx_decisions_user_status ON decisions(user_id, status);
CREATE INDEX idx_decisions_urgency ON decisions(urgency);
CREATE INDEX idx_decisions_deadline ON decisions(deadline);
CREATE INDEX idx_decisions_created_at ON decisions(created_at DESC);

-- Indexes for decision_history
CREATE INDEX idx_decision_history_user_id ON decision_history(user_id);
CREATE INDEX idx_decision_history_decision_id ON decision_history(decision_id);
CREATE INDEX idx_decision_history_decided_at ON decision_history(decided_at DESC);

-- Indexes for user_preferences
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for decisions
CREATE POLICY "Users can view their own decisions"
  ON decisions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own decisions"
  ON decisions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all decisions"
  ON decisions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for decision_history
CREATE POLICY "Users can view their own decision history"
  ON decision_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage decision history"
  ON decision_history FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage preferences"
  ON user_preferences FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Triggers for updated_at
CREATE TRIGGER update_decisions_updated_at
  BEFORE UPDATE ON decisions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE decisions IS 'User decisions requiring context and recommendations';
COMMENT ON TABLE decision_history IS 'Historical record of decisions for learning and analytics';
COMMENT ON TABLE user_preferences IS 'User preferences for autonomy and automation';
COMMENT ON COLUMN decisions.context IS 'Decision context including background, stakeholders, impact';
COMMENT ON COLUMN decisions.options IS 'Array of decision options with pros/cons';
COMMENT ON COLUMN decisions.ai_recommendation IS 'AI-generated recommendation with reasoning and confidence';
COMMENT ON COLUMN decisions.user_decision IS 'User''s final decision with reasoning';
