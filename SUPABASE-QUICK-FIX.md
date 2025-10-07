# 🔧 Supabase Quick Setup Fix

## Issue 1: Config.toml Syntax Errors ✅ FIXED

**Problem:** Invalid config.toml syntax causing link to fail

**Solution:** Updated `supabase/config.toml` with correct syntax:
- ✅ Changed `ip_version = "ipv4"` → `"IPv4"`
- ✅ Removed invalid `realtime.port`
- ✅ Removed `functions` section (optional)
- ✅ Added your project_id: `ozrocykjomgcuphicqpg`

**Now you need to login & link:**

### Step 1: Login to Supabase CLI
Run this in your terminal (requires interactive login):
```bash
supabase login
```
This will open your browser to authenticate. Follow the prompts.

### Step 2: Link to your project
```bash
cd /Users/edwardzhong/Projects/tide
supabase link --project-ref ozrocykjomgcuphicqpg
```

This should now work! ✅

---

## Issue 2: Localhost Redirect (Invite User) ❌ NEEDS FIX

**Problem:** When you click "Invite user" → redirects to localhost → can't connect

**Root cause:** Site URL in Supabase dashboard is set to `http://localhost:3000`

### Fix in Supabase Dashboard:

#### Step 1: Update Site URL
1. Go to: https://supabase.com/dashboard/project/ozrocykjomgcuphicqpg
2. Navigate to: **Authentication** → **URL Configuration**
3. Change **Site URL** from `http://localhost:3000` to:
   ```
   https://ozrocykjomgcuphicqpg.supabase.co
   ```
   (This is your Supabase project URL)
4. Click **Save**

#### Step 2: Add Redirect URLs
In the same **URL Configuration** page:

1. Under **Redirect URLs**, add these:
   ```
   https://ozrocykjomgcuphicqpg.supabase.co/*
   http://localhost:3000/*
   exp://localhost:19000
   com.tide.app://
   tideapp://
   ```

2. Click **Save**

#### Step 3: Test Invite User Again
1. Go to: **Authentication** → **Users**
2. Click **Invite user**
3. Should now redirect to your Supabase project URL (not localhost)

---

## Alternative: Use OAuth Instead of Email Invites

Since we're going OAuth-only, you don't need email invites. Instead:

### Configure Google OAuth:

1. Go to: **Authentication** → **Providers**
2. Enable **Google**
3. Add:
   - **Client ID:** (from Google Cloud Console)
   - **Client Secret:** (from Google Cloud Console)
4. Save

### Configure Microsoft OAuth:

1. Same page: **Authentication** → **Providers**
2. Enable **Azure**
3. Add:
   - **Client ID:** (from Azure Portal)
   - **Client Secret:** (from Azure Portal)
4. Save

### Test OAuth Sign-in:

1. Go to: **Authentication** → **Users**
2. You'll see "Sign in with Google" / "Sign in with Microsoft" buttons
3. Click one to test
4. Should work without localhost issues

---

## OAuth Provider Setup (If Not Done Yet)

### Google Cloud Console:

1. Go to: https://console.cloud.google.com
2. Create project: "Tide Alpha"
3. Enable APIs:
   - Gmail API
   - Google Calendar API
   - Google+ API
4. Go to: **APIs & Services** → **Credentials**
5. Create **OAuth 2.0 Client ID**:
   - Application type: Web application
   - Name: Tide
   - Authorized redirect URIs:
     ```
     https://ozrocykjomgcuphicqpg.supabase.co/auth/v1/callback
     ```
6. Copy **Client ID** and **Client Secret**
7. Paste into Supabase → Authentication → Providers → Google

### Azure Portal:

1. Go to: https://portal.azure.com
2. Navigate to: **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Fill in:
   - Name: Tide Alpha
   - Supported account types: Multitenant
   - Redirect URI:
     ```
     https://ozrocykjomgcuphicqpg.supabase.co/auth/v1/callback
     ```
5. Copy **Application (client) ID**
6. Go to: **Certificates & secrets** → **New client secret**
7. Copy the **Value**
8. Paste into Supabase → Authentication → Providers → Azure

---

## Quick Verification

### After fixing redirect URLs:
```bash
# In Supabase Dashboard:
1. Authentication → Users
2. Click "Invite user"
3. Should NOT redirect to localhost
4. Should show Supabase hosted page
```

### After configuring OAuth:
```bash
# In Supabase Dashboard:
1. Authentication → Users
2. Try "Sign in with Google"
3. Complete OAuth flow
4. Should see new user in Users table
```

---

## Environment Variables Update

After setting up OAuth, update your `.env`:

```bash
# Supabase
SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# OAuth (same values as in Supabase Dashboard)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
```

Get these from:
- Supabase credentials: **Settings** → **API**
- Google credentials: Google Cloud Console → Credentials
- Azure credentials: Azure Portal → App registrations

---

## Summary

✅ **Fixed:** config.toml syntax errors
❌ **Action needed:** Update Site URL in Supabase dashboard
⏳ **Recommended:** Set up OAuth providers (Google + Microsoft)

**Next steps:**
1. Update Site URL to your Supabase project URL
2. Add redirect URLs
3. Configure OAuth providers
4. Test OAuth sign-in

**Time:** ~15 minutes

Once OAuth is configured, you won't need email invites at all.
