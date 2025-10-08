-- Calendar Intelligence Tables
-- Phase 3: Meeting intelligence, smart scheduling, and calendar optimization

-- Meeting Briefs table
CREATE TABLE meeting_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Scheduling Preferences table
CREATE TABLE scheduling_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  focus_time_blocks JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{day: 'monday', start: '09:00', end: '12:00'}]
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

-- Calendar Optimizations table
CREATE TABLE calendar_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  optimization_type TEXT NOT NULL CHECK (optimization_type IN ('batch_meetings', 'reduce_conflicts', 'protect_focus_time', 'balance_load', 'reschedule_suggestion')),
  current_state JSONB NOT NULL,
  suggested_state JSONB NOT NULL,
  reasoning TEXT NOT NULL,
  impact_score DOUBLE PRECISION NOT NULL, -- 0-1, higher is better
  estimated_time_saved_minutes INTEGER,
  affected_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'applied')),
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Meeting Conflicts table
CREATE TABLE meeting_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Smart Scheduling Suggestions table
CREATE TABLE smart_scheduling_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meeting_title TEXT NOT NULL,
  attendees JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_minutes INTEGER NOT NULL,
  suggested_time_slots JSONB NOT NULL DEFAULT '[]'::jsonb, -- Ranked list of optimal times
  reasoning JSONB NOT NULL, -- Explanation for each suggestion
  optimization_factors JSONB NOT NULL, -- What was optimized (focus time, attendee availability, etc.)
  confidence DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Meeting Analytics table
CREATE TABLE meeting_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_meetings INTEGER NOT NULL DEFAULT 0,
  total_meeting_hours DOUBLE PRECISION NOT NULL DEFAULT 0,
  average_meeting_duration_minutes INTEGER,
  meetings_per_day DOUBLE PRECISION,
  focus_time_hours DOUBLE PRECISION,
  context_switches INTEGER,
  back_to_back_meetings INTEGER,
  conflicts_detected INTEGER,
  conflicts_resolved INTEGER,
  optimization_opportunities INTEGER,
  time_saved_minutes INTEGER,
  productivity_score DOUBLE PRECISION, -- 0-1, calculated metric
  meeting_load_balance JSONB, -- Distribution across week
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Previous Meeting Notes table (for context)
CREATE TABLE previous_meeting_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Indexes for performance
CREATE INDEX idx_meeting_briefs_user_id ON meeting_briefs(user_id);
CREATE INDEX idx_meeting_briefs_event_id ON meeting_briefs(event_id);
CREATE INDEX idx_meeting_briefs_start_time ON meeting_briefs(start_time);

CREATE INDEX idx_scheduling_preferences_user_id ON scheduling_preferences(user_id);

CREATE INDEX idx_calendar_optimizations_user_id ON calendar_optimizations(user_id);
CREATE INDEX idx_calendar_optimizations_status ON calendar_optimizations(status);
CREATE INDEX idx_calendar_optimizations_type ON calendar_optimizations(optimization_type);

CREATE INDEX idx_meeting_conflicts_user_id ON meeting_conflicts(user_id);
CREATE INDEX idx_meeting_conflicts_resolved ON meeting_conflicts(resolved);
CREATE INDEX idx_meeting_conflicts_event_id_1 ON meeting_conflicts(event_id_1);

CREATE INDEX idx_smart_scheduling_user_id ON smart_scheduling_suggestions(user_id);
CREATE INDEX idx_smart_scheduling_status ON smart_scheduling_suggestions(status);

CREATE INDEX idx_meeting_analytics_user_id ON meeting_analytics(user_id);
CREATE INDEX idx_meeting_analytics_period ON meeting_analytics(period_start, period_end);

CREATE INDEX idx_previous_meeting_notes_user_id ON previous_meeting_notes(user_id);
CREATE INDEX idx_previous_meeting_notes_event_id ON previous_meeting_notes(event_id);
CREATE INDEX idx_previous_meeting_notes_date ON previous_meeting_notes(meeting_date);

-- Row Level Security (RLS) Policies
ALTER TABLE meeting_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_scheduling_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE previous_meeting_notes ENABLE ROW LEVEL SECURITY;

-- Meeting Briefs policies
CREATE POLICY "Users can view their own meeting briefs"
  ON meeting_briefs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meeting briefs"
  ON meeting_briefs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meeting briefs"
  ON meeting_briefs FOR UPDATE
  USING (auth.uid() = user_id);

-- Scheduling Preferences policies
CREATE POLICY "Users can view their own scheduling preferences"
  ON scheduling_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduling preferences"
  ON scheduling_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduling preferences"
  ON scheduling_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Calendar Optimizations policies
CREATE POLICY "Users can view their own calendar optimizations"
  ON calendar_optimizations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendar optimizations"
  ON calendar_optimizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar optimizations"
  ON calendar_optimizations FOR UPDATE
  USING (auth.uid() = user_id);

-- Meeting Conflicts policies
CREATE POLICY "Users can view their own meeting conflicts"
  ON meeting_conflicts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meeting conflicts"
  ON meeting_conflicts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meeting conflicts"
  ON meeting_conflicts FOR UPDATE
  USING (auth.uid() = user_id);

-- Smart Scheduling policies
CREATE POLICY "Users can view their own scheduling suggestions"
  ON smart_scheduling_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduling suggestions"
  ON smart_scheduling_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduling suggestions"
  ON smart_scheduling_suggestions FOR UPDATE
  USING (auth.uid() = user_id);

-- Meeting Analytics policies
CREATE POLICY "Users can view their own meeting analytics"
  ON meeting_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meeting analytics"
  ON meeting_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Previous Meeting Notes policies
CREATE POLICY "Users can view their own previous meeting notes"
  ON previous_meeting_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own previous meeting notes"
  ON previous_meeting_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own previous meeting notes"
  ON previous_meeting_notes FOR UPDATE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_meeting_briefs_updated_at
  BEFORE UPDATE ON meeting_briefs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduling_preferences_updated_at
  BEFORE UPDATE ON scheduling_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_optimizations_updated_at
  BEFORE UPDATE ON calendar_optimizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_conflicts_updated_at
  BEFORE UPDATE ON meeting_conflicts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_smart_scheduling_updated_at
  BEFORE UPDATE ON smart_scheduling_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_previous_meeting_notes_updated_at
  BEFORE UPDATE ON previous_meeting_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
