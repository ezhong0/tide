# Gmail OAuth Setup Guide

This guide shows you how to set up real Gmail OAuth so you can connect your actual Gmail account.

## Prerequisites

You need a Google Cloud project with OAuth 2.0 credentials. If you don't have one:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable Gmail API
4. Create OAuth 2.0 credentials

## Step 1: Get Your Google OAuth Credentials

### From Google Cloud Console

1. Go to https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "OAuth client ID"
3. Select "iOS" as application type
4. Add bundle ID: `com.tide.app` (or your actual bundle ID)
5. Copy the iOS Client ID (format: `XXXXX-YYYYY.apps.googleusercontent.com`)

### From Railway (Check Existing)

You already have credentials configured in Railway:

```bash
railway variables --service email | grep GOOGLE
```

## Step 2: Configure iOS App

### A. Update Config.swift

Replace the placeholder in `/Users/edwardzhong/Projects/tide/apps/mobile-ios/Core/Config.swift`:

```swift
static let googleIOSClientId = ProcessInfo.processInfo.environment["GOOGLE_IOS_CLIENT_ID"]
    ?? "YOUR_ACTUAL_IOS_CLIENT_ID.apps.googleusercontent.com"  // ← Replace this
```

**Get the actual value:**
```bash
# Export from Railway
railway variables --service email --json | grep GOOGLE_IOS_CLIENT_ID
```

### B. Add URL Scheme to Info.plist

Add this to `apps/mobile-ios/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.googleusercontent.apps.YOUR_CLIENT_ID_PREFIX</string>
        </array>
        <key>CFBundleURLName</key>
        <string>com.tide.app</string>
    </dict>
</array>
```

**Example:** If your iOS client ID is `526055709746-abc123.apps.googleusercontent.com`, use:
```xml
<string>com.googleusercontent.apps.526055709746-abc123</string>
```

## Step 3: Update Backend OAuth Redirect URI

The backend needs to know the iOS app's redirect URI.

### In Google Cloud Console

1. Go to OAuth client credentials
2. Add authorized redirect URI:
   ```
   com.googleusercontent.apps.YOUR_CLIENT_ID_PREFIX:/oauth2redirect
   ```

### Example

If your client ID is `526055709746-abc123.apps.googleusercontent.com`:
```
com.googleusercontent.apps.526055709746-abc123:/oauth2redirect
```

## Step 4: Deploy Updated Backend

The backend already has the OAuth code exchange endpoint. Deploy it:

```bash
cd /Users/edwardzhong/Projects/tide

# Build email service
pnpm --filter @tide/email-service build

# Commit and push (triggers Railway deployment)
git add packages/services/email/
git commit -m "feat: Add Gmail OAuth code exchange endpoint"
git push
```

## Step 5: Test OAuth Flow

### In iOS Simulator or Device

1. Run the app in Xcode
2. Go to Email tab
3. Tap "Connect Gmail"
4. You'll see Google's OAuth consent screen
5. Sign in with your Gmail account
6. Grant permissions
7. You'll be redirected back to the app
8. Emails will load from your actual Gmail!

### Debug Output

Check Xcode console for:
```
✅ OAuth code received: ya29.a0...
✅ Exchanging code for tokens...
✅ Gmail connected successfully
✅ Fetching emails...
```

## Step 6: Verify in Supabase

After successful OAuth:

```sql
-- Check that tokens were stored
SELECT
  provider,
  service,
  scope,
  expires_at,
  created_at
FROM oauth_tokens
WHERE user_id = '00000000-0000-0000-0000-000000000001';
```

You should see a row with:
- provider: `google`
- service: `email`
- scope: Gmail readonly + send scopes

## OAuth Flow Diagram

```
iOS App
  ↓
1. User taps "Connect Gmail"
  ↓
2. ASWebAuthenticationSession opens
  ↓
3. Google OAuth consent screen
  ↓
4. User signs in + grants permissions
  ↓
5. Google redirects: com.googleusercontent.apps.XXX:/oauth2redirect?code=AUTH_CODE
  ↓
6. iOS captures auth code
  ↓
7. POST /api/email/connect/gmail/oauth { authCode, userId }
  ↓
8. Backend exchanges code for access_token + refresh_token
  ↓
9. Backend stores tokens in Supabase
  ↓
10. Backend initializes Gmail API client
  ↓
11. Success response → iOS
  ↓
12. iOS fetches emails from /api/email/emails/USER_ID/gmail
  ↓
13. Backend uses stored tokens to call Gmail API
  ↓
14. Real emails displayed in app! 🎉
```

## Troubleshooting

### "Invalid client ID"

- Check that `Config.googleIOSClientId` matches your Google Cloud Console iOS client ID
- Make sure you created an "iOS" type OAuth client, not "Web" or "Android"

### "Redirect URI mismatch"

- URL scheme in Info.plist must match: `com.googleusercontent.apps.YOUR_PREFIX`
- Authorized redirect URI in Google Cloud Console must be: `com.googleusercontent.apps.YOUR_PREFIX:/oauth2redirect`

### "Failed to exchange authorization code"

Check Railway logs for the email service:
```bash
railway logs --service email
```

Common issues:
- Wrong client secret in Railway environment variables
- Redirect URI doesn't match
- Auth code already used (they're one-time use)

### "No emails showing"

1. Check if OAuth succeeded:
   ```bash
   # Test the backend endpoint directly
   curl "https://gateway-production-caf0.up.railway.app/api/email/emails/00000000-0000-0000-0000-000000000001/gmail"
   ```

2. Check Supabase for stored tokens

3. Check Gmail API is enabled in Google Cloud Console

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit client secrets to git** - They're in Railway environment variables only
2. **Use HTTPS** - OAuth requires secure connections (Railway provides this)
3. **Token Storage** - Tokens are stored in Supabase with encryption at rest
4. **Token Refresh** - Backend will automatically refresh expired tokens
5. **Scope Minimization** - Only request Gmail scopes you actually need

## Next Steps

After OAuth is working:

1. ✅ Test fetching real emails
2. ✅ Add AI email triage on real emails
3. ✅ Implement email sending via Gmail API
4. ✅ Add token refresh logic for expired tokens
5. ✅ Add Outlook OAuth (similar flow)

## Quick Start Checklist

- [ ] Get iOS Client ID from Google Cloud Console
- [ ] Update `Config.googleIOSClientId` in iOS app
- [ ] Add URL scheme to Info.plist
- [ ] Add authorized redirect URI in Google Cloud Console
- [ ] Deploy updated backend to Railway
- [ ] Test OAuth flow in iOS simulator
- [ ] Verify tokens stored in Supabase
- [ ] See real Gmail emails in app!

---

**Estimated time:** 15-20 minutes if you have Google Cloud project set up
**Complexity:** Medium (OAuth setup always takes some debugging)
**Result:** Real Gmail emails in your iOS app! 🚀
