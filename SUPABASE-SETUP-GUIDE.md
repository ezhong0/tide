# 🌊 Tide Supabase Setup Guide

**Date:** October 7, 2025
**Status:** Ready for setup
**Time Required:** 30-45 minutes

---

## 📋 Overview

This guide walks you through setting up Supabase for Tide, replacing the custom auth/database/realtime infrastructure with Supabase's managed platform.

### What You'll Set Up
- ✅ Supabase project & database
- ✅ OAuth providers (Google & Microsoft)
- ✅ Database schema with RLS policies
- ✅ Environment configuration

---

## 🎯 Prerequisites

1. **Accounts needed:**
   - Supabase account (free tier works for Alpha)
   - Google Cloud Console account (for Google OAuth)
   - Azure Portal account (for Microsoft OAuth)

2. **Tools installed:**
   - Node.js 18+
   - pnpm
   - Supabase CLI (will be installed if missing)

---

## 📝 Step 1: Create Supabase Project

### 1.1 Sign up for Supabase
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub (recommended)

### 1.2 Create New Project
1. Click "New Project"
2. Fill in details:
   - **Name:** `tide-alpha`
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your users (e.g., `us-west-1`)
   - **Plan:** Free (sufficient for Alpha)
3. Click "Create new project"
4. Wait ~2 minutes for provisioning

### 1.3 Get Project Credentials
1. Go to **Settings** → **API**
2. Copy these values (you'll need them):
   - **Project URL** (e.g., `https://xyzproject.supabase.co`)
   - **anon public** key (safe for client-side)
   - **service_role** key (backend only - keep secret!)

---

## 🔐 Step 2: Set Up OAuth Providers

### 2.1 Google OAuth Setup

**Create OAuth Client:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "Tide Alpha"
3. Enable APIs:
   - Google+ API
   - Gmail API
   - Google Calendar API
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **OAuth 2.0 Client ID**
6. Configure OAuth consent screen:
   - User type: External
   - App name: Tide
   - User support email: your email
   - Scopes: email, profile, gmail.modify, calendar
7. Create OAuth client:
   - Application type: Web application
   - Name: Tide Web
   - Authorized redirect URIs:
     ```
     https://xyzproject.supabase.co/auth/v1/callback
     ```
8. Copy **Client ID** and **Client Secret**

**Configure in Supabase:**
1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Google**
3. Paste:
   - Client ID
   - Client Secret
4. Click **Save**

### 2.2 Microsoft OAuth Setup

**Create App Registration:**
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Fill in:
   - Name: Tide Alpha
   - Supported account types: Multitenant
   - Redirect URI: Web, `https://xyzproject.supabase.co/auth/v1/callback`
5. Click **Register**
6. Copy **Application (client) ID**
7. Go to **Certificates & secrets** → **New client secret**
8. Copy the **Value** (not the Secret ID)

**Add API Permissions:**
1. Go to **API permissions** → **Add a permission**
2. Select **Microsoft Graph**
3. Add delegated permissions:
   - `User.Read`
   - `Mail.ReadWrite`
   - `Calendars.ReadWrite`
   - `offline_access`
4. Click **Add permissions**

**Configure in Supabase:**
1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Azure**
3. Paste:
   - Client ID
   - Client Secret
4. Click **Save**

---

## 🗄️ Step 3: Set Up Database Schema

### 3.1 Apply Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Open `/Users/edwardzhong/Projects/tide/supabase/schema.sql`
4. Copy entire contents
5. Paste into SQL Editor
6. Click **Run**
7. Wait for completion (~10 seconds)

**Verify Tables Created:**
Go to **Table Editor** and confirm these tables exist:
- ✅ user_profiles
- ✅ oauth_tokens
- ✅ conversations
- ✅ messages
- ✅ calendar_events
- ✅ email_threads
- ✅ email_messages
- ✅ workflows
- ✅ tasks
- ✅ patterns
- ✅ analytics_events

### 3.2 Verify RLS Policies
1. Go to **Authentication** → **Policies**
2. Confirm each table has Row Level Security enabled
3. Check that policies exist (e.g., "Users can view own profile")

---

## 🔧 Step 4: Configure Environment

### 4.1 Update .env File
1. Open `/Users/edwardzhong/Projects/tide/.env`
2. Replace old variables with:

```bash
# =====================================================
# Supabase Configuration
# =====================================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# =====================================================
# OAuth Provider Configuration
# =====================================================
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret

# =====================================================
# Backend Services (Keep these)
# =====================================================
AI_SERVICE_URL=http://localhost:4003
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

EMAIL_SERVICE_URL=http://localhost:4004
CALENDAR_SERVICE_URL=http://localhost:4005
```

### 4.2 Remove Old Variables
Delete these (no longer needed):
```bash
❌ DATABASE_URL
❌ REDIS_URL
❌ JWT_ACCESS_SECRET
❌ JWT_REFRESH_SECRET
❌ AUTH_SERVICE_PORT
❌ REALTIME_SERVICE_PORT
```

---

## 📱 Step 5: Configure Redirect URLs

### 5.1 Add Mobile Redirect URLs
1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   ```
   exp://localhost:19000
   com.tide.app://
   tideapp://
   http://localhost:3000
   ```
3. Click **Save**

### 5.2 Update Site URL
Set **Site URL** to: `http://localhost:3000` (for web) or your production URL

---

## 🧪 Step 6: Test Setup

### 6.1 Test OAuth Flow (Web Browser)
1. Open Supabase dashboard
2. Go to **Authentication** → **Users**
3. Click **Invite user** → Use Google OAuth
4. Complete sign-in flow
5. Verify user appears in Users table
6. Check `user_profiles` table has corresponding entry

### 6.2 Test Database Access
Run this in SQL Editor:
```sql
-- Test user_profiles
SELECT * FROM public.user_profiles;

-- Test RLS (should only see your profile)
SELECT * FROM public.user_profiles WHERE id = auth.uid();

-- Test conversations
SELECT * FROM public.conversations;
```

### 6.3 Test Realtime
1. Go to **Database** → **Replication**
2. Verify these tables are enabled:
   - ✅ conversations
   - ✅ messages
   - ✅ tasks
   - ✅ calendar_events
   - ✅ email_threads

---

## 🚀 Step 7: Run Setup Script

```bash
cd /Users/edwardzhong/Projects/tide
./scripts/setup-supabase.sh
```

This will:
- ✅ Verify environment variables
- ✅ Check Supabase CLI installation
- ✅ Link local project to Supabase
- ✅ Display next steps

---

## ✅ Verification Checklist

Before proceeding to code changes:

- [ ] Supabase project created
- [ ] Google OAuth configured and tested
- [ ] Microsoft OAuth configured and tested
- [ ] Database schema applied (all tables exist)
- [ ] RLS policies enabled and verified
- [ ] Environment variables updated in .env
- [ ] Redirect URLs configured
- [ ] Test user created via OAuth
- [ ] Setup script runs successfully

---

## 🐛 Troubleshooting

### OAuth "Redirect URI mismatch"
**Problem:** OAuth fails with redirect error
**Solution:**
1. Check redirect URI in Google/Azure exactly matches Supabase callback URL
2. Format: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
3. No trailing slashes!

### "Row Level Security" errors
**Problem:** Can't query tables even when authenticated
**Solution:**
1. Verify RLS policies exist: **Authentication** → **Policies**
2. Check policy uses `auth.uid()` correctly
3. Ensure user is authenticated (check `auth.users` table)

### Schema migration fails
**Problem:** SQL query fails with constraint errors
**Solution:**
1. Drop existing tables if any: `DROP TABLE IF EXISTS public.user_profiles CASCADE;`
2. Re-run schema.sql
3. Check for typos in table names

### Can't access service_role key
**Problem:** Service role key not working
**Solution:**
1. Regenerate key: **Settings** → **API** → **Reset service_role key**
2. Update .env immediately
3. Restart backend services

---

## 📚 Next Steps

After completing this setup:

1. **Update Mobile Apps** → See `SUPABASE-MIGRATION-PLAN.md` Phase 3
2. **Update Backend Services** → See `SUPABASE-MIGRATION-PLAN.md` Phase 4
3. **Remove Old Services** → See `SUPABASE-MIGRATION-PLAN.md` Phase 2
4. **Test Everything** → See `TESTING-VERIFICATION-GUIDE.md`

---

## 📖 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Azure OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-azure)

---

**Status:** ✅ Setup guide complete - ready to execute!
