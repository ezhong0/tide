-- Insert test data for mechanical demo
-- Run this in Supabase SQL Editor

-- Test user ID (matches hardcoded ID in iOS app)
-- 00000000-0000-0000-0000-000000000001

-- Insert test user profile if not exists
INSERT INTO user_profiles (id, email, display_name)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test@tide.demo',
  'Test User'
)
ON CONFLICT (id) DO NOTHING;

-- Insert mock OAuth tokens (for demo purposes only)
-- NOTE: These are fake tokens - real OAuth flow needed for production
INSERT INTO oauth_tokens (
  user_id,
  provider,
  service,
  access_token,
  refresh_token,
  expires_at,
  scope
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'google',
  'email',
  'demo_access_token_not_real',
  'demo_refresh_token_not_real',
  NOW() + INTERVAL '1 hour',
  'https://www.googleapis.com/auth/gmail.readonly'
)
ON CONFLICT (user_id, provider, service)
DO UPDATE SET
  access_token = EXCLUDED.access_token,
  refresh_token = EXCLUDED.refresh_token,
  expires_at = EXCLUDED.expires_at,
  scope = EXCLUDED.scope;

-- Insert test email thread
INSERT INTO email_threads (
  id,
  user_id,
  provider,
  external_thread_id,
  subject,
  participants,
  last_message_at
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'google',
  'thread-001',
  'Welcome to Tide - Your Mechanical Demo',
  ARRAY['sarah@company.com', 'test@tide.demo'],
  NOW() - INTERVAL '2 hours'
)
ON CONFLICT (user_id, external_thread_id) DO NOTHING
RETURNING id;

-- Insert test email messages
-- Message 1: High priority
INSERT INTO email_messages (
  user_id,
  provider,
  external_message_id,
  thread_id,
  from_address,
  to_addresses,
  subject,
  body_text,
  received_at,
  is_read
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'google',
  'msg-001',
  'thread-001',
  'Sarah Chen <sarah@company.com>',
  ARRAY['test@tide.demo'],
  'Welcome to Tide - Your Mechanical Demo',
  'Hi! This is a test email fetched from your Supabase database. If you''re seeing this in your iOS simulator, congratulations - your full stack is working!

Backend: ✅ Railway deployment
Database: ✅ Supabase persistence
Mobile: ✅ iOS app integration

Next steps:
1. Add real OAuth flow for Gmail
2. Fetch real emails from Gmail API
3. Add AI email triage
4. Implement calendar sync

You''re now seeing REAL data from your deployed backend. This proves your mechanical demo is working!',
  NOW() - INTERVAL '2 hours',
  false
)
ON CONFLICT (user_id, external_message_id) DO NOTHING;

-- Message 2: Follow-up
INSERT INTO email_messages (
  user_id,
  provider,
  external_message_id,
  thread_id,
  from_address,
  to_addresses,
  subject,
  body_text,
  received_at,
  is_read
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'google',
  'msg-002',
  'thread-001',
  'Mike Johnson <mike@startup.io>',
  ARRAY['test@tide.demo'],
  'Partnership Opportunity - Tide Demo',
  'We noticed you''re building Tide and would love to explore a partnership. This email is also coming from your Supabase database, demonstrating that your backend persistence is working correctly.

Your tech stack:
- Gateway: Railway ✅
- Services: Microservices on Railway ✅
- Database: Supabase PostgreSQL ✅
- Mobile: Swift/SwiftUI ✅

All components are communicating successfully!',
  NOW() - INTERVAL '1 hour',
  false
)
ON CONFLICT (user_id, external_message_id) DO NOTHING;

-- Message 3: Newsletter (low priority)
INSERT INTO email_messages (
  user_id,
  provider,
  external_message_id,
  thread_id,
  from_address,
  to_addresses,
  subject,
  body_text,
  received_at,
  is_read
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'google',
  'msg-003',
  'thread-001',
  'Tide Team <team@tide.demo>',
  ARRAY['test@tide.demo'],
  'Your Mechanical Demo is Complete! 🎉',
  'Congratulations! You successfully completed the Week 0 mechanical demo.

What you built in ~4 hours:
✅ Supabase database schema
✅ Email service with database persistence
✅ iOS app connected to live backend
✅ End-to-end data flow working

Your stack is LIVE and FUNCTIONAL.

From here, you can:
1. Add real Gmail OAuth
2. Implement AI triage
3. Add calendar integration
4. Build out the full MVP

You went from "backend only" to "working full stack" in one day. That''s real progress!',
  NOW() - INTERVAL '30 minutes',
  false
)
ON CONFLICT (user_id, external_message_id) DO NOTHING;

-- Verify the data
SELECT 'Test data inserted successfully!' as message;

SELECT COUNT(*) as email_count FROM email_messages
WHERE user_id = '00000000-0000-0000-0000-000000000001';

SELECT COUNT(*) as token_count FROM oauth_tokens
WHERE user_id = '00000000-0000-0000-0000-000000000001';
