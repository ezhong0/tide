-- Event sourcing table
CREATE TABLE tide.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR(255) NOT NULL UNIQUE,
  event_type VARCHAR(100) NOT NULL,
  aggregate_id VARCHAR(255) NOT NULL,
  aggregate_type VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES tide.users(id),
  payload JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Outbox pattern for reliable event publishing
CREATE TABLE tide.outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  topic VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  published_at TIMESTAMP,
  failed_at TIMESTAMP,
  retry_count INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_events_event_type ON tide.events(event_type);
CREATE INDEX idx_events_aggregate_id ON tide.events(aggregate_id);
CREATE INDEX idx_events_user_id ON tide.events(user_id);
CREATE INDEX idx_events_created_at ON tide.events(created_at);
CREATE INDEX idx_outbox_published_at ON tide.outbox(published_at);
CREATE INDEX idx_outbox_created_at ON tide.outbox(created_at);
