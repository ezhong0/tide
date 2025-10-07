-- Conversations
CREATE TABLE tide.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES tide.users(id) ON DELETE CASCADE,
  title TEXT,
  last_message_at TIMESTAMP,
  message_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Messages
CREATE TABLE tide.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES tide.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES tide.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  intent VARCHAR(100),
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_conversations_user_id ON tide.conversations(user_id);
CREATE INDEX idx_conversations_status ON tide.conversations(status);
CREATE INDEX idx_conversations_created_at ON tide.conversations(created_at);
CREATE INDEX idx_messages_conversation_id ON tide.messages(conversation_id);
CREATE INDEX idx_messages_user_id ON tide.messages(user_id);
CREATE INDEX idx_messages_created_at ON tide.messages(created_at);
