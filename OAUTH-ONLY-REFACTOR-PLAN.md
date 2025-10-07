# 🔄 OAuth-Only Authentication Refactor

**Date:** October 7, 2025
**Status:** PLANNING → EXECUTION
**Breaking Change:** Yes - removes all password authentication

---

## 🎯 Design Goals

### What We're Building
**OAuth-only authentication** with automatic email/calendar access:
- **Primary:** Google OAuth (Gmail + Google Calendar)
- **Primary:** Microsoft OAuth (Outlook + Outlook Calendar)
- **Fallback:** Magic link (passwordless email verification)
- **Remove:** All password-based authentication

### Why This Design
1. **Simpler:** 40% less auth code
2. **Safer:** No password storage/breaches
3. **Better UX:** One-click sign-in
4. **Pre-authorized:** Already have email/calendar access
5. **Enterprise-ready:** Works with SSO

---

## 📋 Architecture

### Authentication Flow

```
User clicks "Sign in with Google" or "Sign in with Microsoft"
    ↓
Redirect to OAuth provider
    ↓
User authorizes: Email, Calendar, Profile access
    ↓
OAuth callback with authorization code
    ↓
Exchange code for access_token + refresh_token
    ↓
Create/update user in database
    ↓
Generate Tide JWT tokens (access + refresh)
    ↓
Return to mobile app with tokens
    ↓
App uses Tide JWT for API calls
    ↓
Backend uses OAuth tokens for Gmail/Calendar APIs
```

### Token Strategy

**Two token types:**

1. **Tide JWT Tokens** (our internal auth)
   - Access token: 15min expiry
   - Refresh token: 30 days expiry
   - Used for: API authentication, WebSocket auth
   
2. **OAuth Provider Tokens** (for external APIs)
   - Stored encrypted in database
   - Used for: Gmail API, Calendar API
   - Refreshed automatically when expired

---

## 🗄️ Database Changes

### Users Table (Simplified)

```sql
CREATE TABLE tide.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  
  -- Provider info
  primary_provider VARCHAR(50) NOT NULL, -- 'google' | 'microsoft' | 'magic_link'
  provider_user_id VARCHAR(255) NOT NULL,
  
  -- Status
  email_verified BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  deleted_at TIMESTAMP,
  
  UNIQUE(primary_provider, provider_user_id)
);
```

**Removed fields:**
- ❌ `password_hash`
- ❌ `password_salt` (if existed)

### OAuth Tokens Table (Keep & Enhance)

```sql
CREATE TABLE tide.oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES tide.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'google' | 'microsoft'
  
  -- OAuth tokens (encrypted at rest)
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type VARCHAR(50) DEFAULT 'Bearer',
  expires_at TIMESTAMP NOT NULL,
  
  -- Scopes granted
  scopes TEXT[], -- ['email', 'calendar', 'profile']
  
  -- Provider-specific
  provider_user_id VARCHAR(255),
  provider_email VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, provider)
);
```

### Refresh Tokens Table (Keep for Tide JWTs)

```sql
-- Already exists, no changes needed
CREATE TABLE tide.refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES tide.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP
);
```

### Tables to Remove

```sql
DROP TABLE IF EXISTS tide.password_reset_tokens;
DROP TABLE IF EXISTS tide.verification_tokens;
```

---

## 🔧 Backend Changes

### New File Structure

```
packages/services/auth/src/
├── controllers/
│   ├── oauth.controller.ts          # NEW: OAuth callbacks
│   ├── magic-link.controller.ts     # NEW: Magic link auth
│   └── token.controller.ts          # Refactored: JWT refresh only
├── routes/
│   ├── oauth.routes.ts              # NEW: /auth/google, /auth/microsoft
│   ├── magic-link.routes.ts         # NEW: /auth/magic-link
│   └── token.routes.ts              # /auth/refresh
├── services/
│   ├── google-oauth.service.ts      # NEW: Google OAuth logic
│   ├── microsoft-oauth.service.ts   # NEW: Microsoft OAuth logic
│   ├── magic-link.service.ts        # NEW: Magic link logic
│   └── token.service.ts             # JWT generation/validation
├── middleware/
│   ├── auth.middleware.ts           # JWT validation (unchanged)
│   └── rate-limiter.ts              # Rate limiting
└── index.ts
```

### Removed Files

```
❌ controllers/auth.controller.ts (old password-based)
❌ services/password.service.ts
❌ services/email-verification.service.ts
```

### New Endpoints

```typescript
// Google OAuth
GET  /auth/google          → Redirect to Google OAuth
GET  /auth/google/callback → Handle Google callback
POST /auth/google/mobile   → Mobile app token exchange

// Microsoft OAuth
GET  /auth/microsoft          → Redirect to Microsoft OAuth
GET  /auth/microsoft/callback → Handle Microsoft callback
POST /auth/microsoft/mobile   → Mobile app token exchange

// Magic Link (fallback)
POST /auth/magic-link/request → Send magic link email
GET  /auth/magic-link/verify  → Verify magic link

// Token Management
POST /auth/refresh → Refresh Tide JWT (unchanged)
POST /auth/logout  → Revoke tokens

// User Info
GET  /auth/me → Get current user
```

### Removed Endpoints

```
❌ POST /auth/register
❌ POST /auth/login
❌ POST /auth/forgot-password
❌ POST /auth/reset-password
❌ POST /auth/verify-email
```

---

## 📱 Mobile App Changes

### iOS Changes

**Add Dependencies:**
```swift
// Package.swift or Podfile
dependencies: [
  .package(url: "https://github.com/google/GoogleSignIn-iOS", from: "7.0.0"),
  .package(url: "https://github.com/AzureAD/microsoft-authentication-library-for-objc", from: "1.2.0")
]
```

**New Auth Flow:**
```swift
// AuthView.swift
struct AuthView: View {
    @EnvironmentObject var authManager: AuthManager
    
    var body: some View {
        VStack {
            // Google Sign In
            GoogleSignInButton {
                authManager.signInWithGoogle()
            }
            
            // Microsoft Sign In
            MicrosoftSignInButton {
                authManager.signInWithMicrosoft()
            }
            
            // Magic link fallback
            Button("Sign in with Email") {
                authManager.showMagicLinkFlow()
            }
        }
    }
}
```

**Remove:**
- ❌ Registration form
- ❌ Login form
- ❌ Password fields
- ❌ Password validation

### Android Changes

**Add Dependencies:**
```kotlin
// build.gradle
dependencies {
    implementation("com.google.android.gms:play-services-auth:20.7.0")
    implementation("com.microsoft.identity.client:msal:4.9.0")
}
```

**New Auth Flow:**
```kotlin
// AuthScreen.kt
@Composable
fun AuthScreen(authViewModel: AuthViewModel) {
    Column {
        // Google Sign In
        GoogleSignInButton(
            onClick = { authViewModel.signInWithGoogle() }
        )
        
        // Microsoft Sign In  
        MicrosoftSignInButton(
            onClick = { authViewModel.signInWithMicrosoft() }
        )
        
        // Magic link fallback
        OutlinedButton(
            onClick = { authViewModel.showMagicLinkDialog() }
        ) {
            Text("Sign in with Email")
        }
    }
}
```

**Remove:**
- ❌ RegistrationForm composable
- ❌ LoginForm composable
- ❌ Password fields
- ❌ Password validation

---

## 🔐 Security Considerations

### OAuth Token Storage

**Encrypt OAuth tokens at rest:**
```typescript
// Use AES-256-GCM
import { createCipheriv, createDecipheriv } from 'crypto';

const ENCRYPTION_KEY = process.env.OAUTH_ENCRYPTION_KEY; // 32 bytes
const IV_LENGTH = 16;

function encryptToken(token: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(token, 'utf8'),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + encrypted.toString('hex') + ':' + tag.toString('hex');
}
```

### Token Refresh Strategy

**Automatic refresh before expiry:**
```typescript
async function ensureFreshToken(userId: string, provider: string) {
  const token = await getOAuthToken(userId, provider);
  
  // Refresh if expires within 5 minutes
  if (token.expires_at < new Date(Date.now() + 5 * 60 * 1000)) {
    return await refreshOAuthToken(userId, provider);
  }
  
  return token;
}
```

### Scope Management

**Request minimum necessary scopes:**
```typescript
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/calendar'
];

const MICROSOFT_SCOPES = [
  'User.Read',
  'Mail.ReadWrite',
  'Calendars.ReadWrite',
  'offline_access'
];
```

---

## 📝 Validation Schema Changes

### Remove Password Schemas

```typescript
// ❌ REMOVE from user.schema.ts
export const UserRegistrationSchema = z.object({
  email: EmailAddressSchema,
  password: z.string().min(8)..., // DELETE
  firstName: z.string(),
  lastName: z.string()
});

export const UserLoginSchema = z.object({
  email: EmailAddressSchema,
  password: z.string() // DELETE
});
```

### New OAuth Schemas

```typescript
// NEW: oauth.schema.ts
export const OAuthCallbackSchema = z.object({
  code: z.string(),
  state: z.string().optional(),
  error: z.string().optional()
});

export const MobileTokenExchangeSchema = z.object({
  provider: z.enum(['google', 'microsoft']),
  idToken: z.string(),
  accessToken: z.string().optional()
});

export const MagicLinkRequestSchema = z.object({
  email: EmailAddressSchema
});

export const MagicLinkVerifySchema = z.object({
  token: z.string().uuid()
});
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
describe('Google OAuth Controller', () => {
  it('should exchange authorization code for tokens');
  it('should create new user on first sign-in');
  it('should link to existing user by email');
  it('should refresh expired OAuth tokens');
  it('should handle OAuth errors gracefully');
});
```

### Integration Tests

```typescript
describe('OAuth Flow E2E', () => {
  it('should complete Google OAuth flow');
  it('should complete Microsoft OAuth flow');
  it('should refresh Tide JWT with refresh token');
  it('should prevent duplicate accounts');
});
```

---

## 📊 Migration Plan

### Phase 1: Backend (This session)
1. Create new OAuth endpoints
2. Update database schema
3. Remove password endpoints
4. Add magic link fallback
5. Update validation schemas

### Phase 2: Mobile Apps (Next)
1. Add OAuth SDKs
2. Update auth screens
3. Remove password forms
4. Test OAuth flows

### Phase 3: Testing & Deployment
1. Test all OAuth flows
2. Update documentation
3. Deploy to staging
4. User acceptance testing

---

## ⚠️ Breaking Changes

### For Existing Users
**No existing users** - this is Alpha, starting fresh

### For Developers
- All password endpoints removed
- Registration/login flow completely different
- New OAuth setup required (Google/Microsoft credentials)
- Mobile apps must integrate OAuth SDKs

---

## ✅ Success Criteria

- [ ] User can sign in with Google (web + mobile)
- [ ] User can sign in with Microsoft (web + mobile)
- [ ] OAuth tokens automatically refresh
- [ ] Tide JWT tokens work for API auth
- [ ] WebSocket auth works with Tide JWT
- [ ] Magic link fallback works
- [ ] No password-related code remains
- [ ] All tests pass
- [ ] Documentation updated

---

**Ready to execute!**
