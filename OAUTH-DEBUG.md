# 🔍 OAuth Debug Checklist

## Issue: Google OAuth URL not working
**URL tried:** `https://ozrocykjomgcuphicqpg.supabase.co/auth/v1/authorize?provider=google`

---

## Quick Verification Steps

### 1. Check Google Provider is Enabled

Go to: https://supabase.com/dashboard/project/ozrocykjomgcuphicqpg/auth/providers

**Verify:**
- [ ] Google provider has toggle **ON** (green)
- [ ] Client ID is filled in (should end with `.apps.googleusercontent.com`)
- [ ] Client Secret is filled in (should be a long string)

If any are missing, click **Google** and add the credentials.

---

### 2. Check Redirect URL in Google Cloud Console

Go to: https://console.cloud.google.com/apis/credentials

**Find your OAuth 2.0 Client ID** and verify:
- [ ] Authorized redirect URIs includes **EXACTLY**:
  ```
  https://ozrocykjomgcuphicqpg.supabase.co/auth/v1/callback
  ```
  (No trailing slash, no typos)

**If missing:**
1. Click your OAuth client
2. Under "Authorized redirect URIs", click **+ ADD URI**
3. Paste: `https://ozrocykjomgcuphicqpg.supabase.co/auth/v1/callback`
4. Click **SAVE**

---

### 3. Try Different OAuth URL Format

Sometimes the authorize endpoint needs additional parameters. Try this URL instead:

```
https://ozrocykjomgcuphicqpg.supabase.co/auth/v1/authorize?provider=google&redirect_to=https://ozrocykjomgcuphicqpg.supabase.co
```

Or use the Supabase magic link format:
```
https://ozrocykjomgcuphicqpg.supabase.co/auth/v1/magiclink?provider=google
```

---

### 4. Test via Supabase Auth UI (Easiest)

Instead of raw URLs, use Supabase's built-in test:

1. Go to: https://supabase.com/dashboard/project/ozrocykjomgcuphicqpg/auth/users
2. Look for a **"Test authentication"** button or similar
3. Or try the Auth UI preview at bottom of Providers page

---

### 5. Check Site URL Configuration

Go to: https://supabase.com/dashboard/project/ozrocykjomgcuphicqpg/auth/url-configuration

**Verify:**
- [ ] **Site URL** is set to: `https://ozrocykjomgcuphicqpg.supabase.co`
- [ ] **Redirect URLs** includes:
  - `https://ozrocykjomgcuphicqpg.supabase.co/**`
  - `http://localhost:3000/**`

---

### 6. Test with JavaScript (Most Reliable)

Create a simple HTML file to test:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Supabase OAuth Test</title>
    <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
</head>
<body>
    <h1>Tide OAuth Test</h1>
    <button onclick="signInWithGoogle()">Sign in with Google</button>
    <div id="result"></div>

    <script>
        const supabase = window.supabase.createClient(
            'https://ozrocykjomgcuphicqpg.supabase.co',
            'YOUR_ANON_KEY_HERE' // Get from Settings > API
        )

        async function signInWithGoogle() {
            try {
                const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        scopes: 'email profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar',
                        redirectTo: 'https://ozrocykjomgcuphicqpg.supabase.co'
                    }
                })

                if (error) {
                    document.getElementById('result').innerHTML = 'Error: ' + error.message
                } else {
                    document.getElementById('result').innerHTML = 'Redirecting...'
                }
            } catch (err) {
                document.getElementById('result').innerHTML = 'Error: ' + err.message
            }
        }
    </script>
</body>
</html>
```

**To use:**
1. Replace `YOUR_ANON_KEY_HERE` with your anon key from: https://supabase.com/dashboard/project/ozrocykjomgcuphicqpg/settings/api
2. Save as `test-oauth.html`
3. Open in browser
4. Click button

---

## Common Error Messages & Fixes

### "Invalid redirect URI"
**Fix:** Double-check redirect URI in Google Cloud Console matches exactly:
```
https://ozrocykjomgcuphicqpg.supabase.co/auth/v1/callback
```

### "Access blocked: This app's request is invalid"
**Fix:**
1. Go to Google Cloud Console → OAuth consent screen
2. Make sure status is not "Needs Verification"
3. Add your email to Test users
4. Publish the app (or keep in Testing mode with test users)

### "404 Not Found" or blank page
**Fix:**
1. Verify Google provider is **enabled** in Supabase
2. Check Client ID and Secret are correct
3. Try using the JavaScript method instead

### "redirect_uri_mismatch"
**Fix:** The redirect URI in Google Cloud Console doesn't match. Must be exactly:
```
https://ozrocykjomgcuphicqpg.supabase.co/auth/v1/callback
```

### Page just redirects back to same page
**Fix:**
1. Add `redirect_to` parameter
2. Make sure Site URL is configured in Supabase

---

## Verification Commands

### Check if OAuth tokens are being created:

After successful sign-in, run in Supabase SQL Editor:

```sql
-- Check users were created
SELECT id, email, created_at FROM auth.users;

-- Check profiles were created
SELECT * FROM public.user_profiles;

-- Check OAuth tokens were stored
SELECT
    user_id,
    provider,
    expires_at,
    created_at
FROM public.oauth_tokens;
```

---

## Alternative: Use Supabase Auth Helpers

If direct URLs aren't working, the most reliable way is via Supabase client:

```bash
npm install @supabase/supabase-js
```

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ozrocykjomgcuphicqpg.supabase.co',
  'your-anon-key'
)

// This handles all OAuth flow automatically
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
    scopes: 'email profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar'
  }
})
```

---

## Next Steps

1. **First**, verify in Supabase dashboard:
   - Google provider enabled ✅
   - Client ID/Secret filled in ✅
   - Redirect URL configured in Google ✅

2. **Then**, try the JavaScript test method (most reliable)

3. **If still not working**, check browser console for error messages

4. **Report back** with:
   - What error message you see (if any)
   - What happens when you click the URL
   - Browser console errors

I can help debug further once I know the specific error!
