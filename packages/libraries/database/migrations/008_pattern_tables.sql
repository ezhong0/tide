-- Migration: 008_pattern_tables.sql
-- Description: Create tables for behavioral pattern detection and automation
-- Date: 2025-10-06

-- ============================================================================
-- User Behaviors Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS tide.user_behaviors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES tide.users(id) ON DELETE CASCADE,

    -- Action
    action VARCHAR(100) NOT NULL,

    -- Context
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
    time_of_day VARCHAR(20) NOT NULL
        CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'night')),

    -- Location/Device
    location VARCHAR(255),
    device VARCHAR(100),

    -- Related entities
    email_id VARCHAR(255),
    calendar_event_id VARCHAR(255),
    task_id UUID REFERENCES tide.tasks(id) ON DELETE SET NULL,
    workflow_id UUID REFERENCES tide.workflows(id) ON DELETE SET NULL,

    -- Additional context
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,

    -- Timestamp
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_behaviors_user_id ON tide.user_behaviors(user_id);
CREATE INDEX idx_user_behaviors_action ON tide.user_behaviors(action);
CREATE INDEX idx_user_behaviors_timestamp ON tide.user_behaviors(timestamp DESC);
CREATE INDEX idx_user_behaviors_day_hour ON tide.user_behaviors(day_of_week, hour);
CREATE INDEX idx_user_behaviors_metadata ON tide.user_behaviors USING GIN(metadata);

COMMENT ON TABLE tide.user_behaviors IS 'User behavior tracking for pattern detection';

-- ============================================================================
-- Detected Patterns Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS tide.detected_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES tide.users(id) ON DELETE CASCADE,

    -- Pattern type
    type VARCHAR(50) NOT NULL
        CHECK (type IN ('temporal', 'sequential', 'conditional', 'collaborative')),
    subtype VARCHAR(50),

    -- Pattern data
    pattern_data JSONB NOT NULL,

    -- Metrics
    confidence DECIMAL(3,2) NOT NULL
        CHECK (confidence >= 0.00 AND confidence <= 1.00),
    frequency INTEGER NOT NULL DEFAULT 0,
    value_estimate INTEGER, -- estimated minutes saved

    -- Description
    description TEXT NOT NULL,
    suggestion TEXT NOT NULL,

    -- Metadata
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'detected'
        CHECK (status IN ('detected', 'confirmed', 'dismissed', 'automated')),

    -- Timestamps
    discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_observed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_detected_patterns_user_id ON tide.detected_patterns(user_id);
CREATE INDEX idx_detected_patterns_type ON tide.detected_patterns(type);
CREATE INDEX idx_detected_patterns_status ON tide.detected_patterns(status);
CREATE INDEX idx_detected_patterns_confidence ON tide.detected_patterns(confidence DESC);
CREATE INDEX idx_detected_patterns_discovered_at ON tide.detected_patterns(discovered_at DESC);

CREATE TRIGGER update_detected_patterns_updated_at
    BEFORE UPDATE ON tide.detected_patterns
    FOR EACH ROW
    EXECUTE FUNCTION tide.update_updated_at_column();

COMMENT ON TABLE tide.detected_patterns IS 'Behavioral patterns detected from user actions';
COMMENT ON COLUMN tide.detected_patterns.pattern_data IS 'Full pattern definition including triggers, actions, conditions';
COMMENT ON COLUMN tide.detected_patterns.value_estimate IS 'Estimated time saved in minutes per occurrence';

-- ============================================================================
-- Automation Suggestions Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS tide.automation_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_id UUID NOT NULL REFERENCES tide.detected_patterns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES tide.users(id) ON DELETE CASCADE,

    -- Suggestion content
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL
        CHECK (category IN ('time_saving', 'quality', 'consistency', 'collaboration')),

    -- Value proposition
    confidence DECIMAL(3,2) NOT NULL
        CHECK (confidence >= 0.00 AND confidence <= 1.00),
    expected_value JSONB NOT NULL, -- time saved, frequency, etc.

    -- Automation definition
    workflow_definition JSONB NOT NULL,
    risk_level VARCHAR(20) NOT NULL
        CHECK (risk_level IN ('low', 'medium', 'high')),

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'suggested'
        CHECK (status IN ('suggested', 'accepted', 'rejected', 'active', 'paused')),

    -- Timestamps
    suggested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX idx_automation_suggestions_pattern_id ON tide.automation_suggestions(pattern_id);
CREATE INDEX idx_automation_suggestions_user_id ON tide.automation_suggestions(user_id);
CREATE INDEX idx_automation_suggestions_status ON tide.automation_suggestions(status);
CREATE INDEX idx_automation_suggestions_category ON tide.automation_suggestions(category);
CREATE INDEX idx_automation_suggestions_suggested_at ON tide.automation_suggestions(suggested_at DESC);

COMMENT ON TABLE tide.automation_suggestions IS 'AI-generated automation suggestions based on detected patterns';
COMMENT ON COLUMN tide.automation_suggestions.expected_value IS 'JSONB with timeSaved, frequency, totalTimeSaved, etc.';
COMMENT ON COLUMN tide.automation_suggestions.workflow_definition IS 'Complete workflow definition ready to be activated';

-- ============================================================================
-- Pattern Sequences Table (for sequence mining)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tide.pattern_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES tide.users(id) ON DELETE CASCADE,

    -- Sequence
    actions TEXT[] NOT NULL,
    signature VARCHAR(255) NOT NULL, -- Hash of the sequence

    -- Metrics
    count INTEGER NOT NULL DEFAULT 1,
    avg_duration_ms INTEGER,
    consistency DECIMAL(3,2),

    -- Timestamps
    first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pattern_sequence_unique UNIQUE (user_id, signature)
);

CREATE INDEX idx_pattern_sequences_user_id ON tide.pattern_sequences(user_id);
CREATE INDEX idx_pattern_sequences_count ON tide.pattern_sequences(count DESC);
CREATE INDEX idx_pattern_sequences_signature ON tide.pattern_sequences(signature);

COMMENT ON TABLE tide.pattern_sequences IS 'Action sequences for pattern mining and detection';

-- ============================================================================
-- Temporal Patterns Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS tide.temporal_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES tide.users(id) ON DELETE CASCADE,
    pattern_id UUID NOT NULL REFERENCES tide.detected_patterns(id) ON DELETE CASCADE,

    -- Temporal trigger
    time VARCHAR(5), -- HH:mm
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
    day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 31),
    days INTEGER[] DEFAULT ARRAY[]::INTEGER[], -- Multiple days

    -- Actions
    actions JSONB NOT NULL,

    -- Metrics
    count INTEGER NOT NULL DEFAULT 0,
    consistency DECIMAL(3,2),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_temporal_patterns_user_id ON tide.temporal_patterns(user_id);
CREATE INDEX idx_temporal_patterns_pattern_id ON tide.temporal_patterns(pattern_id);
CREATE INDEX idx_temporal_patterns_time ON tide.temporal_patterns(time);
CREATE INDEX idx_temporal_patterns_day_of_week ON tide.temporal_patterns(day_of_week);

COMMENT ON TABLE tide.temporal_patterns IS 'Time-based patterns (daily, weekly, monthly)';

-- ============================================================================
-- Sequential Patterns Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS tide.sequential_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES tide.users(id) ON DELETE CASCADE,
    pattern_id UUID NOT NULL REFERENCES tide.detected_patterns(id) ON DELETE CASCADE,

    -- Steps
    steps JSONB NOT NULL,

    -- Metrics
    avg_duration_ms INTEGER,
    count INTEGER NOT NULL DEFAULT 0,
    consistency DECIMAL(3,2),
    time_saved_estimate INTEGER, -- minutes

    -- Automation
    workflow_id UUID REFERENCES tide.workflows(id) ON DELETE SET NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sequential_patterns_user_id ON tide.sequential_patterns(user_id);
CREATE INDEX idx_sequential_patterns_pattern_id ON tide.sequential_patterns(pattern_id);
CREATE INDEX idx_sequential_patterns_workflow_id ON tide.sequential_patterns(workflow_id);

COMMENT ON TABLE tide.sequential_patterns IS 'Multi-step action sequence patterns';

-- ============================================================================
-- Grant Permissions
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON tide.user_behaviors TO tide;
GRANT SELECT, INSERT, UPDATE, DELETE ON tide.detected_patterns TO tide;
GRANT SELECT, INSERT, UPDATE, DELETE ON tide.automation_suggestions TO tide;
GRANT SELECT, INSERT, UPDATE, DELETE ON tide.pattern_sequences TO tide;
GRANT SELECT, INSERT, UPDATE, DELETE ON tide.temporal_patterns TO tide;
GRANT SELECT, INSERT, UPDATE, DELETE ON tide.sequential_patterns TO tide;
