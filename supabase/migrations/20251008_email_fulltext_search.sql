-- Email Full-Text Search Migration
-- Adds ts_vector column and indices for fast search

-- Add search_vector column for full-text search
ALTER TABLE email_messages
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION email_messages_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.subject, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.body, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.from_address, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
DROP TRIGGER IF EXISTS email_messages_search_vector_trigger ON email_messages;
CREATE TRIGGER email_messages_search_vector_trigger
BEFORE INSERT OR UPDATE ON email_messages
FOR EACH ROW
EXECUTE FUNCTION email_messages_search_vector_update();

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS email_messages_search_vector_idx
ON email_messages USING GIN(search_vector);

-- Create additional search-optimized indices
CREATE INDEX IF NOT EXISTS email_messages_user_received_idx
ON email_messages(user_id, received_at DESC);

CREATE INDEX IF NOT EXISTS email_messages_user_from_idx
ON email_messages(user_id, from_address);

CREATE INDEX IF NOT EXISTS email_messages_user_read_idx
ON email_messages(user_id, is_read, received_at DESC);

CREATE INDEX IF NOT EXISTS email_messages_user_flagged_idx
ON email_messages(user_id, is_flagged, received_at DESC);

CREATE INDEX IF NOT EXISTS email_messages_user_priority_idx
ON email_messages(user_id, priority DESC, received_at DESC);

-- Update existing rows with search vectors
UPDATE email_messages
SET search_vector =
  setweight(to_tsvector('english', COALESCE(subject, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(body, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(from_address, '')), 'C')
WHERE search_vector IS NULL;

-- Add comment
COMMENT ON COLUMN email_messages.search_vector IS 'Full-text search vector (automatically updated)';

-- Grant permissions
GRANT SELECT ON email_messages TO authenticated;
