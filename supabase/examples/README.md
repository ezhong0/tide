# Supabase Integration Examples

This directory contains reference implementations for integrating Supabase into Tide's iOS, Android, and backend services.

## 📁 Directory Structure

```
examples/
├── ios/
│   └── SupabaseManager.swift        # iOS/Swift Supabase integration
├── android/
│   └── SupabaseManager.kt           # Android/Kotlin Supabase integration
└── backend/
    └── supabase-client.ts           # Backend TypeScript Supabase client
```

## 🎯 Purpose

These example files demonstrate:
- ✅ OAuth authentication (Google & Microsoft)
- ✅ Database operations with RLS
- ✅ Realtime subscriptions
- ✅ User profile management
- ✅ Conversation & message handling
- ✅ Calendar event integration
- ✅ Task management
- ✅ OAuth token management (backend)

## 📱 iOS Integration

### File: `ios/SupabaseManager.swift`

**Key Features:**
- Singleton pattern with `@Published` properties for SwiftUI
- OAuth sign-in (Google & Microsoft)
- Database CRUD operations
- Realtime message subscriptions
- Type-safe models with Codable

**Usage:**
```swift
// Sign in with Google
try await SupabaseManager.shared.signInWithGoogle()

// Fetch conversations
let conversations = try await SupabaseManager.shared.fetchConversations()

// Subscribe to messages
let channel = SupabaseManager.shared.subscribeToMessages(
    conversationId: conversationId
) { message in
    print("New message: \(message.content)")
}
```

**Dependencies:**
```swift
// Package.swift
dependencies: [
    .package(url: "https://github.com/supabase/supabase-swift", from: "2.0.0")
]
```

## 🤖 Android Integration

### File: `android/SupabaseManager.kt`

**Key Features:**
- Singleton pattern with StateFlow for Compose
- OAuth sign-in (Google & Microsoft)
- Database operations with Postgrest
- Realtime subscriptions with Flow
- Serializable models with kotlinx.serialization

**Usage:**
```kotlin
// Sign in with Google
supabaseManager.signInWithGoogle()

// Fetch conversations
val conversations = supabaseManager.fetchConversations()

// Subscribe to messages
supabaseManager.subscribeToMessages(conversationId) { message ->
    println("New message: ${message.content}")
}
```

**Dependencies:**
```kotlin
// build.gradle.kts
dependencies {
    implementation("io.github.jan-tennert.supabase:postgrest-kt:2.0.0")
    implementation("io.github.jan-tennert.supabase:gotrue-kt:2.0.0")
    implementation("io.github.jan-tennert.supabase:realtime-kt:2.0.0")
}
```

## 🔧 Backend Integration

### File: `backend/supabase-client.ts`

**Key Features:**
- Service role client (bypasses RLS)
- JWT token verification
- OAuth token management & refresh
- Database operations for services
- Analytics event tracking

**Usage:**
```typescript
import { supabase } from './supabase-client';

// Verify user JWT
const userId = await supabase.verifyToken(token);

// Get OAuth tokens for Gmail API
const tokens = await supabase.getOAuthTokens(userId, 'google');

// Create AI message
await supabase.createMessage(
    conversationId,
    'assistant',
    'AI response here',
    { tokens_used: 150, model: 'gpt-4' }
);
```

**Dependencies:**
```json
{
    "dependencies": {
        "@supabase/supabase-js": "^2.38.0"
    }
}
```

## 🔐 Environment Variables

### Mobile Apps (.env or Config)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### Backend Services (.env)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
```

## 📚 Database Schema

These examples assume the database schema defined in `../schema.sql` is applied:

**Core Tables:**
- `user_profiles` - User profile data
- `oauth_tokens` - OAuth access/refresh tokens
- `conversations` - AI chat conversations
- `messages` - Individual messages
- `calendar_events` - Synced calendar events
- `email_threads` - Synced email threads
- `tasks` - User tasks
- `patterns` - Learned user patterns
- `analytics_events` - Usage analytics

## 🔄 Migration Path

### Phase 1: iOS Migration
1. Add Supabase Swift package
2. Replace `AuthService` with `SupabaseManager`
3. Update `TideCore` to use Supabase client
4. Remove old WebSocket code (use Realtime)
5. Test OAuth flows

### Phase 2: Android Migration
1. Add Supabase Kotlin dependencies
2. Replace `AuthRepository` with `SupabaseManager`
3. Update `TideCore` to use Supabase client
4. Remove old WebSocket code (use Realtime)
5. Test OAuth flows

### Phase 3: Backend Migration
1. Add `@supabase/supabase-js` to services
2. Replace JWT validation with Supabase auth
3. Update database queries to use Supabase client
4. Remove auth service
5. Remove realtime service

## ⚠️ Important Notes

### Security
- **NEVER** use `service_role` key in mobile apps
- Mobile apps use `anon` key (safe for client-side)
- Backend services use `service_role` key (full access)
- RLS policies protect data even with `anon` key

### OAuth Tokens
- Stored encrypted in `oauth_tokens` table
- Auto-refresh when expiring (< 5 minutes)
- Backend services access tokens, not mobile apps
- Mobile apps call backend endpoints that use tokens

### Realtime
- Mobile apps subscribe to conversations/messages
- Backend services publish updates
- Automatic reconnection on network changes
- Presence tracking available but not yet implemented

### Error Handling
- All async operations throw errors
- Wrap in try-catch blocks
- Show user-friendly error messages
- Log errors for debugging

## 🧪 Testing

### Test OAuth Flow
1. Click "Sign in with Google"
2. Complete OAuth flow
3. Verify user appears in `auth.users`
4. Verify profile created in `user_profiles`
5. Check OAuth tokens stored in `oauth_tokens`

### Test Database Operations
1. Create conversation
2. Send message
3. Verify RLS (can only see own data)
4. Test updates & deletes

### Test Realtime
1. Open app on two devices
2. Send message from device 1
3. Verify appears on device 2
4. Check latency (should be < 500ms)

## 📖 Additional Resources

- [Supabase Swift Docs](https://github.com/supabase/supabase-swift)
- [Supabase Kotlin Docs](https://github.com/supabase-community/supabase-kt)
- [Supabase JS Docs](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)

---

**Note:** These are reference implementations. Adapt to your specific needs and architecture.
