-- Intelligence Service Tables
-- Daily snapshots and action suggestions

-- Daily Snapshots Table
CREATE TABLE IF NOT EXISTS daily_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Action Suggestions Table
CREATE TABLE IF NOT EXISTS action_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN (
    'email_response',
    'schedule_meeting',
    'delegate_task',
    'decline_meeting',
    'archive_email',
    'send_reminder',
    'update_task',
    'reschedule_meeting'
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

-- Indexes for daily_snapshots
CREATE INDEX idx_daily_snapshots_user_date ON daily_snapshots(user_id, snapshot_date DESC);
CREATE INDEX idx_daily_snapshots_generated_at ON daily_snapshots(generated_at DESC);

-- Indexes for action_suggestions
CREATE INDEX idx_action_suggestions_user_id ON action_suggestions(user_id);
CREATE INDEX idx_action_suggestions_status ON action_suggestions(status);
CREATE INDEX idx_action_suggestions_user_status ON action_suggestions(user_id, status);
CREATE INDEX idx_action_suggestions_created_at ON action_suggestions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE daily_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_snapshots
CREATE POLICY "Users can view their own snapshots"
  ON daily_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all snapshots"
  ON daily_snapshots FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for action_suggestions
CREATE POLICY "Users can view their own action suggestions"
  ON action_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own action suggestions"
  ON action_suggestions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all action suggestions"
  ON action_suggestions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_daily_snapshots_updated_at
  BEFORE UPDATE ON daily_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_action_suggestions_updated_at
  BEFORE UPDATE ON action_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE daily_snapshots IS 'Daily intelligence snapshots aggregating priority items, decisions, meetings, and predictions';
COMMENT ON TABLE action_suggestions IS 'AI-generated action suggestions requiring user approval or autonomous execution';
COMMENT ON COLUMN daily_snapshots.priority_items IS 'Array of priority items (emails, tasks, meetings) ranked by urgency and importance';
COMMENT ON COLUMN daily_snapshots.pending_decisions IS 'Array of decisions awaiting user input with context and recommendations';
COMMENT ON COLUMN daily_snapshots.meeting_previews IS 'Array of upcoming meetings with brief summaries';
COMMENT ON COLUMN daily_snapshots.predictions IS 'Array of predicted actions based on user patterns';
COMMENT ON COLUMN action_suggestions.confidence IS 'AI confidence score (0-1) for the suggested action';
COMMENT ON COLUMN action_suggestions.requires_approval IS 'Whether this action requires explicit user approval before execution';
