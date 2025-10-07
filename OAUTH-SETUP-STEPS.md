# 🔐 OAuth-Only Setup Steps

**Goal:** Set up Google & Microsoft OAuth for Tide (skip email invites entirely)

**Time:** ~30 minutes

---

## ✅ Step 1: Apply Database Schema (5 min)

### Option A: Via Supabase Dashboard (Recommended)
1. Go to: https://supabase.com/dashboard/project/ozrocykjomgcuphicqpg/sql
2. Click **New query**
3. Copy entire contents of: `supabase/schema.sql`
4. Paste into SQL Editor
5. Click **Run** (or Cmd+Enter)
6. Should see: "Success. No rows returned"
7. Verify tables created:
   - Go to: **Database** → **Tables**
   - Should see: `user_profiles`, `oauth_tokens`, `conversations`, `messages`, etc.

### Option B: Via CLI
```bash
cd /Users/edwardzhong/Projects/tide
supabase db push
```

---

## 🔐 Step 2: Set Up Google OAuth (10 min)

### 2.1 Google Cloud Console Setup

1. **Go to:** https://console.cloud.google.com

2. **Create/Select Project:**
   - Create new project: "Tide"
   - Or select existing project

3. **Enable APIs:**
   - Go to: **APIs & Services** → **Library**
   - Search & enable:
     - Gmail API
     - Google Calendar API
     - Google People API (for profile)

4. **Configure OAuth Consent Screen:**
   - Go to: **APIs & Services** → **OAuth consent screen**
   - User Type: **External**
   - App name: **Tide**
   - User support email: your email
   - Developer contact: your email
   - Scopes: Click **Add or Remove Scopes**, add:
     - `userinfo.email`
     - `userinfo.profile`
     - `gmail.modify`
     - `calendar`
   - Test users: Add your email (for testing)
   - Click **Save and Continue**

5. **Create OAuth Credentials:**
   - Go to: **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: **Tide Web**
   - Authorized redirect URIs: Add this exact URL:
     ```
     https://ozrocykjomgcuphicqpg.supabase.co/auth/v1/callback
     ```
   - Click **Create**
   - **COPY:** Client ID (looks like `xxx.apps.googleusercontent.com`)
   - **COPY:** Client Secret

### 2.2 Configure in Supabase

1. **Go to:** https://supabase.com/dashboard/project/ozrocykjomgcuphicqpg/auth/providers
2. Find **Google** provider
3. **Enable** the toggle
4. **Paste:**
   - Client ID (from step 2.1)
   - Client Secret (from step 2.1)
5. **Copy the redirect URL shown** (should be same as above)
6. Click **Save**

---

## 🔐 Step 3: Set Up Microsoft OAuth (10 min)

### 3.1 Azure Portal Setup

1. **Go to:** https://portal.azure.com

2. **Register App:**
   - Navigate to: **Azure Active Directory** → **App registrations**
   - Click **New registration**
   - Name: **Tide**
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI:
     - Platform: **Web**
     - URL: `https://ozrocykjomgcuphicqpg.supabase.co/auth/v1/callback`
   - Click **Register**

3. **Copy Application ID:**
   - On the app overview page
   - **COPY:** Application (client) ID

4. **Create Client Secret:**
   - Go to: **Certificates & secrets**
   - Click **New client secret**
   - Description: "Tide OAuth"
   - Expires: 24 months (or choose)
   - Click **Add**
   - **COPY:** The **Value** (not the Secret ID!)
   - ⚠️ You can only see this once!

5. **Add API Permissions:**
   - Go to: **API permissions**
   - Click **Add a permission**
   - Select **Microsoft Graph**
   - Select **Delegated permissions**
   - Add these permissions:
     - `User.Read`
     - `Mail.ReadWrite`
     - `Calendars.ReadWrite`
     - `offline_access`
   - Click **Add permissions**
   - (Optional) Click **Grant admin consent** if you're admin

### 3.2 Configure in Supabase

1. **Go to:** https://supabase.com/dashboard/project/ozrocykjomgcuphicqpg/auth/providers
2. Find **Azure** provider
3. **Enable** the toggle
4. **Paste:**
   - Azure Client ID (Application ID from step 3.1)
   - Azure Secret (Client Secret from step 3.1)
5. Click **Save**

---

## ✅ Step 4: Configure Redirect URLs (2 min)

1. **Go to:** https://supabase.com/dashboard/project/ozrocykjomgcuphicqpg/auth/url-configuration

2. **Site URL:** Set to:
   ```
   https://ozrocykjomgcuphicqpg.supabase.co
   ```

3. **Redirect URLs:** Add these (one per line):
   ```
   https://ozrocykjomgcuphicqpg.supabase.co/**
   http://localhost:3000/**
   exp://localhost:19000
   com.tide.app://
   tideapp://
   ```

4. Click **Save**

---

## 🧪 Step 5: Test OAuth (3 min)

### Test in Supabase Dashboard:

1. **Go to:** https://supabase.com/dashboard/project/ozrocykjomgcuphicqpg/auth/users

2. **Test Google OAuth:**
   - Click the **Sign in with Google** button in the dashboard
   - Or open this URL in incognito window:
     ```
     https://ozrocykjomgcuphicqpg.supabase.co/auth/v1/authorize?provider=google
     ```
   - Complete Google sign-in
   - Should redirect back to Supabase
   - Check **Users** table → should see new user

3. **Test Microsoft OAuth:**
   - Open this URL in incognito window:
     ```
     https://ozrocykjomgcuphicqpg.supabase.co/auth/v1/authorize?provider=azure
     ```
   - Complete Microsoft sign-in
   - Check **Users** table → should see new user

### Verify in Database:

```sql
-- In Supabase SQL Editor:
SELECT * FROM auth.users;
SELECT * FROM public.user_profiles;
SELECT * FROM public.oauth_tokens;
```

Should see:
- ✅ User in `auth.users`
- ✅ Profile in `user_profiles` (auto-created by trigger)
- ✅ OAuth tokens in `oauth_tokens`

---

## 📝 Step 6: Update Environment Variables

Update your `.env` file:

```bash
# Supabase
SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-secret

# Microsoft OAuth
AZURE_CLIENT_ID=your-azure-app-id
AZURE_CLIENT_SECRET=your-azure-secret
```

Get Supabase keys from:
- https://supabase.com/dashboard/project/ozrocykjomgcuphicqpg/settings/api

---

## ✅ Verification Checklist

- [ ] Database schema applied (12 tables created)
- [ ] Google OAuth configured in Supabase
- [ ] Microsoft OAuth configured in Supabase
- [ ] Redirect URLs configured
- [ ] Tested Google sign-in (user created)
- [ ] Tested Microsoft sign-in (user created)
- [ ] Environment variables updated in .env

---

## 🐛 Troubleshooting

### "Redirect URI mismatch"
**Fix:** Make sure redirect URI is **exactly**:
```
https://ozrocykjomgcuphicqpg.supabase.co/auth/v1/callback
```
No trailing slash, check for typos.

### "Invalid client"
**Fix:** Double-check Client ID and Secret in Supabase dashboard.

### "Access denied" (Google)
**Fix:** Add your email as test user in Google OAuth consent screen.

### OAuth tokens not saved
**Fix:** Check trigger exists:
```sql
-- Should see trigger "on_auth_user_created"
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

---

## 🎉 Once Complete

You'll have:
- ✅ OAuth-only authentication (no passwords)
- ✅ Google sign-in working
- ✅ Microsoft sign-in working
- ✅ OAuth tokens stored for Gmail/Calendar API access
- ✅ Database with RLS policies
- ✅ Ready for mobile app integration

**Next:** Update mobile apps to use Supabase SDK (Phase 3)
