# 🚀 Supabase Migration - Complete Architecture Refactor

**Date:** October 7, 2025  
**Type:** Full architectural migration  
**Breaking Changes:** YES - Complete rebuild of auth/database/realtime  
**Estimated Time:** 2-3 days to complete  
**Status:** READY TO EXECUTE

---

## 📊 Executive Summary

### What We're Doing
Migrating from custom-built infrastructure to Supabase for:
- **Authentication** (OAuth + JWT)
- **Database** (PostgreSQL)
- **Real-time** (WebSocket subscriptions)

### What We're Keeping
Your core competitive advantages:
- AI Service (GPT/Claude integration)
- Email Service (Gmail API)
- Calendar Service (Google Calendar API)
- Workflow Engine

### Impact
- **-70% infrastructure code** (5,000 → 1,500 lines)
- **-4 weeks development time** (ongoing features vs infrastructure)
- **+Better security** (Supabase handles updates)
- **+Better scalability** (Supabase auto-scales)
- **+Better mobile SDKs** (native OAuth support)

---

## 🎯 Architecture Overview

### Before (Current)
```
Mobile Apps
    ↓
Custom Auth Service (4001) ─────┐
Custom Realtime Service (4002) ─┤
    ↓                            ↓
PostgreSQL (Docker)         Redis (Docker)
    ↓
AI/Email/Calendar Services
```

**Problems:**
- 5,000+ lines of auth/db/realtime code to maintain
- Manual OAuth implementation
- Custom WebSocket scaling
- Security updates on you
- 4 weeks to build, test, deploy

### After (Supabase)
```
Mobile Apps (Supabase SDK)
    ↓
Supabase Platform
    ├─ Auth (OAuth + JWT) ✨
    ├─ PostgreSQL ✨
    ├─ Realtime (WebSocket) ✨
    ├─ Storage ✨
    └─ Edge Functions ✨
         ↓
AI/Email/Calendar Services
    (Use Supabase JWT for auth)
```

**Benefits:**
- ~1,500 lines of config/integration code
- OAuth: Click "Enable" in dashboard
- WebSocket: Subscribe to tables
- Security: Supabase handles it
- 2-3 days to setup and deploy

---

## 📋 Detailed Migration Plan

### Phase 1: Supabase Setup (Day 1 - This Session)

#### 1.1 Create Supabase Project
```bash
# Manual step - you'll do this
1. Go to https://supabase.com
2. Create account
3. Create new project: "tide-production"
4. Note credentials:
   - Project URL: https://xxxxx.supabase.co
   - Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (keep secret!)
```

#### 1.2 Configure OAuth Providers
**In Supabase Dashboard → Authentication → Providers:**

**Google OAuth:**
```
1. Enable Google provider
2. Add Client ID from Google Console
3. Add Client Secret
4. Callback URL: https://xxxxx.supabase.co/auth/v1/callback
5. Scopes:
   - email
   - profile
   - https://www.googleapis.com/auth/gmail.modify
   - https://www.googleapis.com/auth/calendar
```

**Microsoft OAuth:**
```
1. Enable Azure provider
2. Add Client ID from Azure Portal
3. Add Client Secret
4. Callback URL: https://xxxxx.supabase.co/auth/v1/callback
5. Scopes:
   - User.Read
   - Mail.ReadWrite
   - Calendars.ReadWrite
   - offline_access
```

#### 1.3 Database Schema
**Run in Supabase SQL Editor:**

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (Supabase auth.users exists, we extend it)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  
  -- Provider info (Supabase tracks this in auth.users)
  primary_provider TEXT, -- 'google' | 'microsoft'
  
  -- Preferences
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'auto', -- 'light' | 'dark' | 'auto'
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OAuth tokens (for Gmail/Calendar API access)
CREATE TABLE public.oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'google' | 'microsoft'
  
  -- Encrypted tokens
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT[],
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, provider)
);

-- Conversations
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Index for user queries
  INDEX idx_conversations_user_id ON conversations(user_id)
);

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL,
  role TEXT NOT NULL, -- 'user' | 'assistant' | 'system'
  
  -- AI metadata
  model TEXT, -- 'gpt-4o' | 'claude-opus'
  tokens_used INTEGER,
  
  -- Status
  status TEXT DEFAULT 'sent', -- 'sent' | 'delivered' | 'failed'
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_messages_conversation_id ON messages(conversation_id),
  INDEX idx_messages_user_id ON messages(user_id),
  INDEX idx_messages_created_at ON messages(created_at)
);

-- Calendar events (cached from Google/Microsoft)
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- External IDs
  provider TEXT NOT NULL, -- 'google' | 'microsoft'
  provider_event_id TEXT NOT NULL,
  
  -- Event data
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  attendees JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, provider, provider_event_id)
);

-- Email threads (cached from Gmail/Outlook)
CREATE TABLE public.email_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- External IDs
  provider TEXT NOT NULL, -- 'google' | 'microsoft'
  provider_thread_id TEXT NOT NULL,
  
  -- Thread data
  subject TEXT,
  participants JSONB, -- [{name, email}]
  last_message_at TIMESTAMPTZ,
  message_count INTEGER DEFAULT 0,
  
  -- AI analysis
  summary TEXT,
  priority TEXT, -- 'high' | 'medium' | 'low'
  category TEXT, -- 'important' | 'social' | 'promotions'
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, provider, provider_thread_id)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_threads ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own OAuth tokens" ON oauth_tokens
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own OAuth tokens" ON oauth_tokens
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON conversations
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own events" ON calendar_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own events" ON calendar_events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own emails" ON email_threads
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own emails" ON email_threads
  FOR ALL USING (auth.uid() = user_id);

-- Realtime subscriptions (enable for mobile apps)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE calendar_events;
```

#### 1.4 Storage Buckets
**In Supabase Dashboard → Storage:**
```
Create buckets:
1. avatars (public)
2. attachments (private)
```

---

### Phase 2: Remove Old Services (This Session)

#### 2.1 Delete Auth Service
```bash
# Remove entire auth service
rm -rf packages/services/auth

# Remove from workspace
# Edit package.json to remove auth service reference
```

#### 2.2 Delete Realtime Service
```bash
# Remove entire realtime service
rm -rf packages/services/realtime

# Remove from workspace
```

#### 2.3 Remove PostgreSQL/Redis Docker
```bash
# Stop containers
docker compose down postgres redis

# Remove from docker-compose.yml
# (Keep if you need for other services)
```

#### 2.4 Clean Up Dependencies
```bash
# Remove unused packages
pnpm remove bcryptjs jsonwebtoken ws
```

---

### Phase 3: Mobile App Integration (This Session)

#### 3.1 iOS - Add Supabase SDK

**Update Package Dependencies:**
```swift
// Package.swift or use CocoaPods
dependencies: [
  .package(url: "https://github.com/supabase/supabase-swift", from: "2.0.0")
]
```

**Create Supabase Client:**
```swift
// Services/SupabaseClient.swift
import Supabase

class SupabaseManager {
    static let shared = SupabaseManager()
    
    let client: SupabaseClient
    
    private init() {
        client = SupabaseClient(
            supabaseURL: URL(string: "https://your-project.supabase.co")!,
            supabaseKey: "your-anon-key"
        )
    }
}
```

**New Auth Service:**
```swift
// Services/AuthService.swift
import Supabase

class AuthService {
    private let supabase = SupabaseManager.shared.client
    
    // Sign in with Google
    func signInWithGoogle() async throws {
        try await supabase.auth.signInWithOAuth(
            provider: .google,
            scopes: "email profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar"
        )
    }
    
    // Sign in with Microsoft
    func signInWithAzure() async throws {
        try await supabase.auth.signInWithOAuth(
            provider: .azure,
            scopes: "User.Read Mail.ReadWrite Calendars.ReadWrite offline_access"
        )
    }
    
    // Get current session
    func getCurrentSession() async throws -> Session? {
        try await supabase.auth.session
    }
    
    // Sign out
    func signOut() async throws {
        try await supabase.auth.signOut()
    }
}
```

**Update TideCore:**
```swift
// Core/TideCore.swift
import Supabase

class TideCore: ObservableObject {
    private let supabase = SupabaseManager.shared.client
    
    @Published var conversations: [Conversation] = []
    @Published var currentConversation: Conversation?
    
    init() {
        setupRealtimeSubscription()
    }
    
    // Subscribe to real-time message updates
    private func setupRealtimeSubscription() {
        Task {
            let channel = await supabase.channel("messages")
            
            await channel
                .on(.postgresChanges(
                    schema: "public",
                    table: "messages"
                )) { [weak self] payload in
                    self?.handleMessageUpdate(payload)
                }
                .subscribe()
        }
    }
    
    // Send message
    func sendMessage(_ content: String) async throws {
        guard let userId = try? await supabase.auth.session?.user.id,
              let conversationId = currentConversation?.id else { return }
        
        // Insert message
        try await supabase
            .from("messages")
            .insert([
                "conversation_id": conversationId.uuidString,
                "user_id": userId.uuidString,
                "content": content,
                "role": "user"
            ])
            .execute()
        
        // AI response handled by backend Edge Function
    }
}
```

#### 3.2 Android - Add Supabase SDK

**Update build.gradle:**
```kotlin
dependencies {
    implementation("io.github.jan-tennert.supabase:postgrest-kt:2.0.0")
    implementation("io.github.jan-tennert.supabase:auth-kt:2.0.0")
    implementation("io.github.jan-tennert.supabase:realtime-kt:2.0.0")
    implementation("io.ktor:ktor-client-android:2.3.5")
}
```

**Create Supabase Client:**
```kotlin
// core/SupabaseClient.kt
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.realtime.Realtime

object SupabaseClient {
    val client = createSupabaseClient(
        supabaseUrl = "https://your-project.supabase.co",
        supabaseKey = "your-anon-key"
    ) {
        install(Auth)
        install(Postgrest)
        install(Realtime)
    }
}
```

**New Auth Repository:**
```kotlin
// data/repository/AuthRepository.kt
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.providers.Google
import io.github.jan.supabase.auth.providers.Azure

class AuthRepository {
    private val supabase = SupabaseClient.client
    
    suspend fun signInWithGoogle() {
        supabase.auth.signInWith(Google) {
            scopes = listOf(
                "email",
                "profile",
                "https://www.googleapis.com/auth/gmail.modify",
                "https://www.googleapis.com/auth/calendar"
            )
        }
    }
    
    suspend fun signInWithMicrosoft() {
        supabase.auth.signInWith(Azure) {
            scopes = listOf(
                "User.Read",
                "Mail.ReadWrite",
                "Calendars.ReadWrite",
                "offline_access"
            )
        }
    }
    
    suspend fun signOut() {
        supabase.auth.signOut()
    }
    
    fun getCurrentUser() = supabase.auth.currentUserOrNull()
}
```

**Update TideCore:**
```kotlin
// core/TideCore.kt
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.realtime.realtime
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach

class TideCore {
    private val supabase = SupabaseClient.client
    
    init {
        setupRealtimeSubscription()
    }
    
    private fun setupRealtimeSubscription() {
        val channel = supabase.realtime.createChannel("messages")
        
        channel.postgresChangeFlow<Message>(schema = "public")
            .onEach { change ->
                handleMessageUpdate(change)
            }
            .launchIn(scope)
        
        channel.subscribe()
    }
    
    suspend fun sendMessage(content: String) {
        val userId = supabase.auth.currentUserOrNull()?.id ?: return
        val conversationId = currentConversation?.id ?: return
        
        supabase.from("messages").insert(
            mapOf(
                "conversation_id" to conversationId,
                "user_id" to userId,
                "content" to content,
                "role" to "user"
            )
        )
    }
}
```

---

### Phase 4: Backend Services Integration (This Session)

#### 4.1 AI Service - Use Supabase JWT

**Update AI Service to validate Supabase JWTs:**

```typescript
// packages/services/ai/src/middleware/auth.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role for backend
);

export async function validateSupabaseAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    // Validate JWT
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Auth failed' });
  }
}
```

**Update AI routes:**
```typescript
import { validateSupabaseAuth } from './middleware/auth';

app.use('/ai', validateSupabaseAuth);
app.post('/ai/chat', async (req, res) => {
  const userId = req.user.id;
  // Process AI request...
});
```

#### 4.2 Email Service - Access OAuth Tokens

```typescript
// packages/services/email/src/services/gmail.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getGmailToken(userId: string) {
  const { data, error } = await supabase
    .from('oauth_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .single();
  
  if (error) throw error;
  
  // Check if token needs refresh
  if (new Date(data.expires_at) < new Date()) {
    return await refreshGoogleToken(data);
  }
  
  return data.access_token;
}

async function fetchEmails(userId: string) {
  const token = await getGmailToken(userId);
  
  // Use Gmail API
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.json();
}
```

#### 4.3 Calendar Service - Similar Pattern

```typescript
// packages/services/calendar/src/services/google-calendar.ts
async function getCalendarToken(userId: string) {
  const { data } = await supabase
    .from('oauth_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .single();
  
  return data.access_token;
}

async function fetchEvents(userId: string) {
  const token = await getCalendarToken(userId);
  
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.json();
}
```

---

### Phase 5: Environment Configuration (This Session)

#### 5.1 Update .env

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # SECRET!

# Remove old variables
# DATABASE_URL - no longer needed
# REDIS_URL - no longer needed
# JWT_ACCESS_SECRET - no longer needed
# JWT_REFRESH_SECRET - no longer needed

# Keep AI service variables
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Google OAuth (for Supabase)
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...

# Microsoft OAuth (for Supabase)
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
MICROSOFT_TENANT_ID=...
```

---

### Phase 6: Documentation Updates (This Session)

#### 6.1 Update Setup Guide
- Remove Docker PostgreSQL/Redis setup
- Add Supabase project setup
- Update OAuth configuration steps
- Update mobile app setup with Supabase SDK

#### 6.2 Update Testing Guide
- Remove password auth tests
- Add OAuth flow tests
- Add real-time subscription tests
- Update API endpoint tests

---

## 🗑️ What Gets Deleted

### Services
```bash
rm -rf packages/services/auth/           # Entire auth service
rm -rf packages/services/realtime/       # Entire realtime service
```

### Database Files
```bash
rm -rf packages/libraries/database/migrations/002_users_tables.sql
rm -rf packages/libraries/database/migrations/003_authentication_tables.sql
# (These are replaced by Supabase schema)
```

### Mobile Code
**iOS:**
```bash
rm apps/mobile-ios/Services/AuthService.swift  # Old password auth
rm apps/mobile-ios/Services/WebSocketManager.swift  # Old WebSocket
# Replace with Supabase integration
```

**Android:**
```bash
rm apps/mobile-android/.../services/WebSocketManager.kt
rm apps/mobile-android/.../repository/AuthRepository.kt  # Old version
# Replace with Supabase integration
```

### Configuration
```bash
# Remove from .env
DATABASE_URL
REDIS_URL  
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
```

---

## ✅ Success Criteria

### Technical
- [ ] User can sign in with Google OAuth
- [ ] User can sign in with Microsoft OAuth
- [ ] Messages sync in real-time between devices
- [ ] AI service receives Supabase JWT
- [ ] Email service accesses Gmail with OAuth token
- [ ] Calendar service accesses Google Calendar
- [ ] Mobile apps use Supabase SDK
- [ ] Row-level security protects user data

### Code Quality
- [ ] No password-related code remains
- [ ] Auth code reduced by 70%
- [ ] All tests pass
- [ ] No security warnings
- [ ] Documentation complete

### User Experience
- [ ] One-click OAuth sign-in
- [ ] Automatic token refresh
- [ ] Real-time message updates
- [ ] Fast app load times

---

## 📊 Metrics

### Before Migration
- **Lines of Code:** ~8,000 (auth + realtime + db)
- **Services:** 2 (auth, realtime)
- **Maintenance:** Manual security updates
- **OAuth Setup:** 2-3 weeks
- **Mobile Integration:** 1 week

### After Migration
- **Lines of Code:** ~2,000 (Supabase integration)
- **Services:** 0 (Supabase handles it)
- **Maintenance:** Supabase handles it
- **OAuth Setup:** 1 hour
- **Mobile Integration:** 1 day

### Savings
- **-75% code to maintain**
- **-4 weeks development time**
- **+Better security**
- **+Better scalability**
- **+Better DX (developer experience)**

---

## 🚨 Risks & Mitigation

### Risk: Vendor Lock-in
**Mitigation:** Supabase is open source. Can self-host if needed. Data is in PostgreSQL (portable).

### Risk: Cost at Scale
**Mitigation:** At 100K users ($3M revenue), $599/mo for Supabase is negligible. Can negotiate enterprise pricing.

### Risk: Feature Limitations
**Mitigation:** Supabase supports Edge Functions for custom logic. Can always run separate services.

### Risk: Migration Downtime
**Mitigation:** This is Alpha with no users. Fresh start.

---

## 📅 Timeline

### Day 1 (This Session) - 4 hours
- Create Supabase project
- Configure OAuth providers
- Set up database schema
- Remove old services
- Update environment config

### Day 2 - 6 hours
- Integrate iOS Supabase SDK
- Integrate Android Supabase SDK
- Update auth screens
- Test OAuth flows

### Day 3 - 4 hours
- Update AI/Email/Calendar services
- Test end-to-end flows
- Update documentation
- Deploy and verify

**Total: 14 hours over 3 days**

---

## 🎯 Execution Steps (This Session)

1. ✅ Create this migration plan
2. ⏳ Set up Supabase configuration files
3. ⏳ Create database schema
4. ⏳ Remove auth service
5. ⏳ Remove realtime service
6. ⏳ Update mobile app structure
7. ⏳ Update backend services
8. ⏳ Update documentation
9. ⏳ Test authentication flow
10. ⏳ Commit changes

**Let's execute! 🚀**
