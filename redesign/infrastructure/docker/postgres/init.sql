-- Create schemas
CREATE SCHEMA IF NOT EXISTS tide;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS events;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create users table
CREATE TABLE IF NOT EXISTS tide.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    timezone VARCHAR(100) NOT NULL DEFAULT 'UTC',
    locale VARCHAR(10) NOT NULL DEFAULT 'en-US',
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON tide.users(email);
CREATE INDEX idx_users_created_at ON tide.users(created_at);

-- Create conversations table
CREATE TABLE IF NOT EXISTS tide.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES tide.users(id) ON DELETE CASCADE,
    title VARCHAR(500),
    summary TEXT,
    message_count INTEGER NOT NULL DEFAULT 0,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_conversations_user_id ON tide.conversations(user_id);
CREATE INDEX idx_conversations_last_message_at ON tide.conversations(last_message_at DESC);
CREATE INDEX idx_conversations_created_at ON tide.conversations(created_at DESC);

-- Create messages table (partitioned by created_at)
CREATE TABLE IF NOT EXISTS tide.messages (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES tide.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES tide.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    intent JSONB,
    actions JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create partitions for messages (current month and next 3 months)
CREATE TABLE IF NOT EXISTS tide.messages_current PARTITION OF tide.messages
    FOR VALUES FROM (DATE_TRUNC('month', CURRENT_DATE))
    TO (DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month'));

CREATE TABLE IF NOT EXISTS tide.messages_next PARTITION OF tide.messages
    FOR VALUES FROM (DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month'))
    TO (DATE_TRUNC('month', CURRENT_DATE + INTERVAL '2 months'));

CREATE INDEX idx_messages_conversation_id ON tide.messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_user_id ON tide.messages(user_id, created_at DESC);
CREATE INDEX idx_messages_content_search ON tide.messages USING gin(to_tsvector('english', content));

-- Create auth schema tables
CREATE TABLE IF NOT EXISTS auth.credentials (
    user_id UUID PRIMARY KEY REFERENCES tide.users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES tide.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_refresh_tokens_user_id ON auth.refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON auth.refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_token_hash ON auth.refresh_tokens(token_hash);

-- Create events table (for event sourcing)
CREATE TABLE IF NOT EXISTS events.domain_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(255) NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    metadata JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create partitions for events
CREATE TABLE IF NOT EXISTS events.domain_events_current PARTITION OF events.domain_events
    FOR VALUES FROM (DATE_TRUNC('month', CURRENT_DATE))
    TO (DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month'));

CREATE INDEX idx_domain_events_aggregate ON events.domain_events(aggregate_id, aggregate_type);
CREATE INDEX idx_domain_events_type ON events.domain_events(event_type);
CREATE INDEX idx_domain_events_created_at ON events.domain_events(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON tide.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON tide.conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credentials_updated_at BEFORE UPDATE ON auth.credentials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA tide TO tide;
GRANT ALL PRIVILEGES ON SCHEMA auth TO tide;
GRANT ALL PRIVILEGES ON SCHEMA events TO tide;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA tide TO tide;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO tide;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA events TO tide;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA tide TO tide;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth TO tide;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA events TO tide;
