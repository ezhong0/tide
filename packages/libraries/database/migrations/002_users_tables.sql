-- Users table (primary authentication)
CREATE TABLE tide.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  last_login_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  timezone VARCHAR(100) DEFAULT 'UTC',
  locale VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- User profiles
CREATE TABLE tide.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES tide.users(id) ON DELETE CASCADE,
  bio TEXT,
  phone VARCHAR(50),
  company VARCHAR(255),
  role VARCHAR(100),
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON tide.users(email);
CREATE INDEX idx_users_status ON tide.users(status);
CREATE INDEX idx_users_created_at ON tide.users(created_at);
CREATE INDEX idx_user_profiles_user_id ON tide.user_profiles(user_id);

-- Triggers
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON tide.users
FOR EACH ROW
EXECUTE FUNCTION tide.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON tide.user_profiles
FOR EACH ROW
EXECUTE FUNCTION tide.update_updated_at_column();
