# OAuth Configuration Consolidation

**Date**: October 6, 2025
**Change**: Consolidated separate Gmail and Calendar OAuth into unified Google OAuth

---

## Summary

We've simplified OAuth configuration by using a **single OAuth client** for all Google services instead of separate clients for Gmail and Calendar.

## Before (❌ Old Way - Redundant)

```bash
# Separate OAuth for each Google service
GMAIL_CLIENT_ID=xxxxx.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=xxxxx
GMAIL_REDIRECT_URI=http://localhost:4000/auth/gmail/callback

GOOGLE_CALENDAR_CLIENT_ID=xxxxx.apps.googleusercontent.com  # Same or different?
GOOGLE_CALENDAR_CLIENT_SECRET=xxxxx
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:4000/auth/calendar/callback
```

**Problems:**
- ❌ Redundant configuration
- ❌ User authorizes multiple times
- ❌ Confusing to set up
- ❌ More credentials to manage
- ❌ Harder to add new Google services

---

## After (✅ New Way - Unified)

```bash
# Single OAuth for ALL Google services
GOOGLE_CLIENT_ID=526055709746-xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_REDIRECT_URI=http://localhost:4000/auth/google/callback
GOOGLE_IOS_CLIENT_ID=526055709746-yyyy.apps.googleusercontent.com  # Optional, for mobile
```

**Benefits:**
- ✅ Single OAuth flow for all Google services
- ✅ User authorizes once for Gmail, Calendar, Drive, etc.
- ✅ Simpler configuration
- ✅ Fewer credentials to manage
- ✅ Easy to add more Google services (Drive, Contacts, etc.)
- ✅ Better user experience

---

## Migration Guide

### For Developers

If you have existing `.env` with old variables:

**Old variables (deprecated):**
```bash
GMAIL_CLIENT_ID=xxxxx
GMAIL_CLIENT_SECRET=xxxxx
GMAIL_REDIRECT_URI=http://localhost:4000/auth/gmail/callback
GOOGLE_CALENDAR_CLIENT_ID=xxxxx
GOOGLE_CALENDAR_CLIENT_SECRET=xxxxx
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:4000/auth/calendar/callback
```

**New variables (use these):**
```bash
GOOGLE_CLIENT_ID=xxxxx  # Use your Gmail client ID
GOOGLE_CLIENT_SECRET=xxxxx  # Use your Gmail client secret
GOOGLE_REDIRECT_URI=http://localhost:4000/auth/google/callback  # Update URI
GOOGLE_IOS_CLIENT_ID=xxxxx  # Optional
```

### Google Cloud Console Setup

1. Go to https://console.cloud.google.com/
2. Select your existing project (or create new)
3. **Update OAuth consent screen** with all scopes:
   ```
   https://www.googleapis.com/auth/gmail.modify
   https://www.googleapis.com/auth/gmail.compose
   https://www.googleapis.com/auth/gmail.send
   https://www.googleapis.com/auth/gmail.labels
   https://www.googleapis.com/auth/gmail.settings.basic
   https://www.googleapis.com/auth/calendar
   https://www.googleapis.com/auth/calendar.events
   ```

4. **Update redirect URI** in your OAuth client:
   - Old: `http://localhost:4000/auth/gmail/callback`
   - New: `http://localhost:4000/auth/google/callback`

5. **Enable APIs** (if not already):
   - Gmail API
   - Google Calendar API

### Code Changes

**Configuration (already updated):**
```typescript
// packages/shared/config/src/auth.ts

// New unified config
export const googleOAuthConfig: GoogleOAuthConfig | null = {
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  redirectUri: env.GOOGLE_REDIRECT_URI,
  iosClientId: env.GOOGLE_IOS_CLIENT_ID, // For mobile apps
};

// Backward compatible - services still work
export const gmailOAuthConfig = googleOAuthConfig;
export const googleCalendarOAuthConfig = googleOAuthConfig;
```

**Services (no changes needed):**
- Gmail service continues to use `gmailOAuthConfig` (aliased to unified config)
- Calendar service continues to use `googleCalendarOAuthConfig` (aliased to unified config)
- No code changes required in services!

---

## OAuth Flow Comparison

### Before (Multiple Authorizations)

```
User clicks "Connect Gmail"
  → Authorize Gmail access
  → Redirected back

User clicks "Connect Calendar"
  → Authorize Calendar access (again!)
  → Redirected back

Result: 2 authorization flows, confusing UX
```

### After (Single Authorization)

```
User clicks "Connect Google"
  → Authorize Gmail + Calendar + ... access (once!)
  → Redirected back

Result: 1 authorization flow, all services connected
```

---

## Technical Details

### Scopes Management

With unified OAuth, you request **all scopes** in a single authorization:

```typescript
const scopes = [
  // Gmail scopes
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.labels',

  // Calendar scopes
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',

  // Future: Drive, Contacts, etc.
  // 'https://www.googleapis.com/auth/drive.file',
  // 'https://www.googleapis.com/auth/contacts.readonly',
];

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
  client_id=${GOOGLE_CLIENT_ID}&
  redirect_uri=${GOOGLE_REDIRECT_URI}&
  scope=${scopes.join(' ')}&
  response_type=code&
  access_type=offline&
  prompt=consent`;
```

### Token Storage

Same as before, but now one token set works for all services:

```typescript
{
  "userId": "user_123",
  "provider": "google",
  "accessToken": "ya29.xxx",
  "refreshToken": "1//xxx",
  "expiresAt": "2025-10-07T10:00:00Z",
  "scopes": [
    "gmail.modify",
    "calendar"
  ]
}
```

---

## Mobile App Support

Added `GOOGLE_IOS_CLIENT_ID` for iOS applications:

```bash
# Web client (backend)
GOOGLE_CLIENT_ID=526055709746-web-client.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# iOS client (mobile app)
GOOGLE_IOS_CLIENT_ID=526055709746-ios-client.apps.googleusercontent.com
```

**Why separate iOS client?**
- iOS apps use different OAuth flow (in-app browser)
- Different redirect URI scheme (`com.tide.app:/oauth2callback`)
- No client secret for native apps (more secure)

---

## Future: Adding More Google Services

With unified OAuth, adding new Google services is trivial:

### Want to add Google Drive?

1. Enable Drive API in Google Cloud Console
2. Add scope to OAuth consent screen:
   ```
   https://www.googleapis.com/auth/drive.file
   ```
3. Use existing `googleOAuthConfig` - done!

### Want to add Google Contacts?

1. Enable People API in Google Cloud Console
2. Add scope:
   ```
   https://www.googleapis.com/auth/contacts.readonly
   ```
3. Use existing `googleOAuthConfig` - done!

No new OAuth credentials needed!

---

## Same Approach for Microsoft

We also unified Microsoft services:

```bash
# Single OAuth for Outlook + Calendar + OneDrive
EXCHANGE_CLIENT_ID=xxxxx
EXCHANGE_CLIENT_SECRET=xxxxx
EXCHANGE_TENANT_ID=xxxxx
EXCHANGE_REDIRECT_URI=http://localhost:4000/auth/microsoft/callback
```

**Scopes requested:**
```
Mail.Read Mail.Send Mail.ReadWrite
Calendars.ReadWrite Calendars.Read
User.Read
```

---

## Backward Compatibility

The old config variables are **deprecated but still work**:

```typescript
// ✅ Still works (aliased to googleOAuthConfig)
import { gmailOAuthConfig } from '@tide/config';

// ✅ Still works (aliased to googleOAuthConfig)
import { googleCalendarOAuthConfig } from '@tide/config';

// ✅ Recommended (use directly)
import { googleOAuthConfig } from '@tide/config';
```

**No breaking changes!** Existing services continue to work without modifications.

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| OAuth clients | 2 (Gmail, Calendar) | 1 (Google) |
| Environment vars | 6 | 3-4 |
| User authorizations | 2 separate | 1 unified |
| Scopes requested | Per service | All at once |
| Adding new services | New OAuth setup | Just add scope |
| Mobile app support | Not configured | iOS client ID |
| Code changes | N/A | None required |

---

**Recommendation**: Update your `.env` to use the new unified approach. It's simpler, better UX, and more maintainable!

**Questions?** See `EXTERNAL-SETUP-GUIDE.md` for complete setup instructions.

---

**Last Updated**: October 6, 2025
**Status**: ✅ Implemented and backward compatible
