-- =====================================================
-- Verify OAuth Setup - Run in Supabase SQL Editor
-- =====================================================
-- URL: https://supabase.com/dashboard/project/ozrocykjomgcuphicqpg/sql

-- 1. Check users were created
SELECT
    id,
    email,
    raw_app_meta_data->>'provider' as provider,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Check user profiles were auto-created by trigger
SELECT
    id,
    full_name,
    primary_provider,
    created_at
FROM public.user_profiles
ORDER BY created_at DESC;

-- 3. Check OAuth tokens were stored (if any)
SELECT
    user_id,
    provider,
    expires_at,
    scopes,
    created_at
FROM public.oauth_tokens
ORDER BY created_at DESC;

-- 4. Verify all tables exist
SELECT
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 5. Check RLS policies are enabled
SELECT
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected results:
-- ✅ 1 user in auth.users (Edward Zhong, edwardrzhong@gmail.com)
-- ✅ 1 profile in user_profiles (auto-created by trigger)
-- ✅ 1 entry in oauth_tokens (Google OAuth tokens)
-- ✅ 12 tables in public schema
-- ✅ All tables have RLS enabled (true)
