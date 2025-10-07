# 🎯 MVP Parallelized Roadmap to Product Vision

**Created**: 2025-10-07
**Current State**: 60% Complete (Backend infrastructure live, Mobile scaffolded)
**Target**: Full MVP with AI Chief of Staff capabilities
**Timeline**: 4 weeks to working MVP, 8 weeks to full vision

---

## 🎭 Product Vision Recap

Building **Tide** - An AI Chief of Staff that:
- Autonomously manages email (triage, respond, archive)
- Optimizes calendar (scheduling, conflict resolution, prep briefings)
- Orchestrates workflows (detect patterns, automate tasks)
- Makes decisions (queue and recommend with context)
- Learns continuously (adapt to user style and preferences)

**Target User**: Executives spending 15+ hours/week on administrative tasks
**Value Prop**: Save 10+ hours/week, accelerate decisions 5x, reduce email response time 90%

---

## 📊 Current State Assessment

### ✅ What's Working (60% Complete)

**Backend Services (Deployed on Railway)**:
- ✅ Gateway: `https://gateway-production-caf0.up.railway.app`
- ✅ AI Service: Email triage, composition, scheduling AI
- ✅ Email Service: Gmail/Outlook connect, fetch, triage, send
- ✅ Calendar Service: Google/MS Calendar connect, events, scheduling
- ✅ Health checks and monitoring
- ✅ Supabase configured (URL, keys, OAuth credentials)

**Mobile Apps (Scaffolded)**:
- ✅ iOS: SwiftUI structure, auth screens, feature modules
- ✅ Android: Kotlin/Compose structure, similar setup
- ✅ SupabaseManager, APIClient services created

**Infrastructure**:
- ✅ Redis 7, Kafka 7.5 ready (not yet used)
- ✅ PostgreSQL 16 via Supabase
- ✅ Railway deployment working

### ❌ Critical Gaps (40% Missing)

**Database Layer (HIGH PRIORITY)**:
- ❌ No tables in Supabase - data not persisting
- ❌ No user profiles
- ❌ No OAuth token storage
- ❌ No email/calendar/conversation storage

**Authentication (HIGH PRIORITY)**:
- ❌ Signup/login not wired in mobile
- ❌ JWT token management incomplete
- ❌ Session persistence missing

**OAuth Integration (HIGH PRIORITY)**:
- ❌ OAuth SDKs not added to mobile
- ❌ Gmail/Outlook OAuth flow not implemented
- ❌ Token storage not working

**Mobile-Backend Connection (HIGH PRIORITY)**:
- ❌ Apps pointing to localhost, not live gateway
- ❌ API calls using mock data
- ❌ No real data flow

---

## 🎯 4-Week MVP Plan (Minimal Working Product)

**Goal**: User can sign up, connect Gmail, see real emails, get AI triage

### Week 1: Foundation & Auth (Days 1-7)

**TRACK A: Database & Backend** (2 developers)
- [ ] Day 1: Create Supabase schema (users, connections, emails, events, conversations)
- [ ] Day 2: Add RLS policies and test queries
- [ ] Day 3: Update backend services to persist to Supabase
- [ ] Day 4: Test full data flow (API → DB → API)
- [ ] Day 5: Add token refresh logic to services
- [ ] Days 6-7: Integration testing and bug fixes

**TRACK B: Mobile Auth** (2 developers)
- [ ] Days 1-2: Wire Supabase auth in iOS (signup, login, session)
- [ ] Days 3-4: Wire Supabase auth in Android
- [ ] Day 5: Add token storage and refresh
- [ ] Days 6-7: Test auth flows end-to-end

**Dependencies**: None (parallel work)
**Deliverable**: Users can sign up/login, data persists in database

### Week 2: OAuth & Connections (Days 8-14)

**TRACK A: Gmail OAuth** (2 developers)
- [ ] Days 8-9: Add Google Sign-In SDK to iOS
- [ ] Days 10-11: Add Google Sign-In SDK to Android
- [ ] Days 12-13: Implement OAuth flow (iOS & Android)
- [ ] Day 14: Wire to `/api/email/connect/gmail`, test token storage

**TRACK B: Backend OAuth** (1 developer)
- [ ] Days 8-10: Update email service to store tokens in Supabase
- [ ] Days 11-12: Add token refresh logic
- [ ] Days 13-14: Test Gmail fetch with real tokens

**TRACK C: UI Polish** (1 developer)
- [ ] Days 8-14: Polish signup/login screens
- [ ] Add loading states, error handling
- [ ] Design onboarding flow

**Dependencies**: Week 1 complete (database and auth working)
**Deliverable**: Users can connect Gmail, tokens stored securely

### Week 3: Email & AI Integration (Days 15-21)

**TRACK A: Email Display** (2 developers)
- [ ] Days 15-16: Wire email list to real API
- [ ] Days 17-18: Add email detail view
- [ ] Days 19-20: Add triage button and results display
- [ ] Day 21: Polish UI, loading states, pull-to-refresh

**TRACK B: AI Triage** (1 developer)
- [ ] Days 15-16: Test AI service with real emails
- [ ] Days 17-18: Add error handling and retries
- [ ] Days 19-20: Optimize for speed (<3s response)
- [ ] Day 21: Add result caching

**TRACK C: Calendar Start** (1 developer)
- [ ] Days 15-17: Add Google Calendar OAuth
- [ ] Days 18-20: Wire calendar list view
- [ ] Day 21: Basic event display

**Dependencies**: Week 2 complete (Gmail connected)
**Deliverable**: Users see real emails, AI triage works, calendar connected

### Week 4: Polish & Launch Prep (Days 22-28)

**TRACK A: Testing & Bugs** (2 developers)
- [ ] Days 22-24: End-to-end testing
- [ ] Days 25-26: Bug fixes and edge cases
- [ ] Days 27-28: Performance optimization

**TRACK B: Onboarding** (1 developer)
- [ ] Days 22-24: Build onboarding flow
- [ ] Days 25-26: Add tooltips and help
- [ ] Days 27-28: Polish animations

**TRACK C: Monitoring** (1 developer)
- [ ] Days 22-24: Add error tracking (Sentry)
- [ ] Days 25-26: Set up analytics
- [ ] Days 27-28: Create admin dashboard

**Dependencies**: Week 3 complete (all features working)
**Deliverable**: Polished MVP ready for beta users

**End of Week 4**: 🎉 **Working MVP** - Users can signup, connect Gmail/Calendar, see real data, use AI triage

---

## 🚀 Weeks 5-8: Full Product Vision

### Week 5: Autonomous Email (Days 29-35)

**TRACK A: AI Email Composition** (2 developers)
- [ ] Wire compose endpoint
- [ ] Multi-draft system (detailed, balanced, brief)
- [ ] Tone control (professional, casual, urgent)
- [ ] Relationship-aware drafts

**TRACK B: Smart Actions** (1 developer)
- [ ] Archive/delete actions
- [ ] Snooze emails
- [ ] Forward to right person
- [ ] Auto-decline meetings

**TRACK C: Email Intelligence** (1 developer)
- [ ] Urgent email detection
- [ ] VIP sender identification
- [ ] Smart categorization (work, personal, newsletter)

**Deliverable**: AI drafts responses, takes autonomous actions with approval

### Week 6: Calendar Intelligence (Days 36-42)

**TRACK A: Smart Scheduling** (2 developers)
- [ ] Availability detection
- [ ] Meeting time suggestions
- [ ] Conflict resolution
- [ ] Travel time calculation

**TRACK B: Meeting Prep** (1 developer)
- [ ] Auto-generated briefs
- [ ] Attendee insights
- [ ] Talking points
- [ ] Document links

**TRACK C: Calendar Optimization** (1 developer)
- [ ] Focus block protection
- [ ] Energy-based scheduling (morning vs afternoon)
- [ ] Meeting clustering
- [ ] Prep time buffers

**Deliverable**: Calendar optimizes automatically, meeting prep appears before each meeting

### Week 7: Task & Decision Engine (Days 43-49)

**TRACK A: Task Management** (2 developers)
- [ ] Extract tasks from email
- [ ] Task dependencies
- [ ] Priority queue
- [ ] Due date suggestions

**TRACK B: Decision Queue** (2 developers)
- [ ] Decision extraction from email/calendar
- [ ] Context gathering
- [ ] Recommendation engine
- [ ] Approval/decline with reasoning

**Deliverable**: Tasks auto-created, decisions queued with recommendations

### Week 8: Workflow Automation (Days 50-56)

**TRACK A: Pattern Detection** (2 developers)
- [ ] Identify recurring workflows
- [ ] Suggest automations
- [ ] Create workflow templates

**TRACK B: Workflow Engine** (2 developers)
- [ ] Multi-step workflows
- [ ] Conditional logic
- [ ] Error handling
- [ ] Workflow analytics

**Deliverable**: Workflows automate repetitive tasks, save 5+ hours/week

**End of Week 8**: 🏆 **Full Product Vision** - Complete AI Chief of Staff

---

## 📋 Detailed Week 1 Breakdown (Start Here!)

### Day 1: Database Schema (Critical Path)

**Morning (4 hours)**:
```sql
-- In Supabase SQL Editor:

-- 1. Users table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  primary_provider TEXT, -- 'google' | 'microsoft'
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. OAuth tokens
CREATE TABLE provider_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'gmail', 'outlook', 'google_calendar', 'ms_calendar'
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  scopes TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

ALTER TABLE provider_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tokens"
  ON provider_tokens FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage tokens"
  ON provider_tokens FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- 3. Emails
CREATE TABLE email_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  message_id TEXT NOT NULL, -- External ID from Gmail/Outlook
  thread_id TEXT,
  subject TEXT,
  from_email TEXT,
  from_name TEXT,
  to_email TEXT[],
  cc_email TEXT[],
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  labels TEXT[],
  ai_category TEXT, -- 'urgent', 'important', 'normal', 'low'
  ai_priority INT, -- 1-10
  ai_summary TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider, message_id)
);

CREATE INDEX idx_emails_user_received ON email_messages(user_id, received_at DESC);
CREATE INDEX idx_emails_user_category ON email_messages(user_id, ai_category);

ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own emails"
  ON email_messages FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Calendar events
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  attendees JSONB, -- [{email, name, response_status}]
  is_all_day BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider, event_id)
);

CREATE INDEX idx_events_user_time ON calendar_events(user_id, start_time);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own events"
  ON calendar_events FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Conversations (for AI chat)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT,
  summary TEXT,
  message_count INT DEFAULT 0,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_user ON conversations(user_id, updated_at DESC);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

-- 6. Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' | 'assistant' | 'system'
  content TEXT NOT NULL,
  tokens_used INT,
  model TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);

-- RLS: Users can view messages in their conversations
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );
```

**Afternoon (4 hours)**:
- Test schema with sample data
- Update backend services to use new schema
- Test CRUD operations

### Day 2: Backend Integration

**Morning**:
- Update `/api/email/connect/:provider` to store tokens in `provider_tokens`
- Update `/api/email/emails/:userId/:provider` to fetch from `email_messages`
- Update `/api/ai/process` to store conversations in database

**Afternoon**:
- Update calendar service similarly
- Test all endpoints with real database
- Add error handling for DB failures

### Day 3-4: Mobile Auth

**iOS (Day 3)**:
```swift
// Update SupabaseManager.swift
import Supabase

class SupabaseManager {
  static let shared = SupabaseManager()

  let client: SupabaseClient

  init() {
    client = SupabaseClient(
      supabaseURL: URL(string: "https://ozrocykjomgcuphicqpg.supabase.co")!,
      supabaseKey: "YOUR_ANON_KEY"
    )
  }

  // Sign up
  func signUp(email: String, password: String) async throws {
    try await client.auth.signUp(email: email, password: password)
  }

  // Sign in
  func signIn(email: String, password: String) async throws {
    try await client.auth.signIn(email: email, password: password)
  }

  // Sign in with Google
  func signInWithGoogle() async throws {
    try await client.auth.signIn(provider: .google)
  }

  // Sign out
  func signOut() async throws {
    try await client.auth.signOut()
  }

  // Get current session
  func session() async throws -> Session? {
    return try await client.auth.session
  }
}

// Update LoginView.swift
struct LoginView: View {
  @State private var email = ""
  @State private var password = ""
  @State private var isLoading = false
  @State private var errorMessage: String?

  var body: some View {
    VStack {
      TextField("Email", text: $email)
      SecureField("Password", text: $password)

      Button("Sign In") {
        Task {
          isLoading = true
          do {
            try await SupabaseManager.shared.signIn(email: email, password: password)
            // Navigate to main app
          } catch {
            errorMessage = error.localizedDescription
          }
          isLoading = false
        }
      }

      Button("Sign In with Google") {
        Task {
          try await SupabaseManager.shared.signInWithGoogle()
        }
      }
    }
  }
}
```

**Android (Day 4)**: Similar implementation with Supabase Kotlin SDK

### Day 5-7: Testing & Integration

- End-to-end test: Sign up → Login → Session persists
- Test token refresh
- Test logout and re-login
- Fix bugs

---

## 🎲 Risk Mitigation

### High-Risk Items

**1. OAuth Complexity** (Week 2)
- **Risk**: OAuth flows break, tokens don't work
- **Mitigation**: Start with test accounts, test token refresh early
- **Fallback**: Use service account temporarily for development

**2. AI Performance** (Week 3)
- **Risk**: AI responses too slow (>5s), users frustrated
- **Mitigation**: Add caching, use streaming responses
- **Fallback**: Pre-compute triage overnight as batch job

**3. Mobile App Store Review** (Week 4)
- **Risk**: Rejection delays launch
- **Mitigation**: Review Apple/Google guidelines early, test on beta
- **Fallback**: Web app first, native apps v1.1

### Medium-Risk Items

**4. Database Performance**
- **Risk**: Queries too slow with real data
- **Mitigation**: Add indexes proactively, monitor query times
- **Fallback**: Redis caching layer

**5. Token Refresh Bugs**
- **Risk**: Users logged out unexpectedly
- **Mitigation**: Test refresh logic extensively
- **Fallback**: Force re-auth with clear messaging

---

## 📈 Success Metrics

### Week 4 MVP Targets
- ✅ 10 beta users successfully signed up
- ✅ 5+ users connected Gmail and see emails
- ✅ AI triage works <3s for 90% of requests
- ✅ 0 critical bugs
- ✅ App Store beta builds deployed

### Week 8 Full Vision Targets
- ✅ 100 active users
- ✅ 50+ hours saved per week (aggregate)
- ✅ 1000+ emails triaged
- ✅ 500+ AI-drafted responses
- ✅ 200+ meetings auto-scheduled
- ✅ 4.5+ star rating
- ✅ 80% daily active users

---

## 🚦 Go/No-Go Decision Points

### End of Week 1: Database & Auth
**Go Criteria**:
- Users can sign up/login ✅
- Sessions persist ✅
- Data saves to database ✅

**No-Go**: If any criterion fails, spend Week 2 fixing before moving on

### End of Week 2: OAuth
**Go Criteria**:
- Gmail OAuth works ✅
- Tokens stored securely ✅
- Email fetch returns real data ✅

**No-Go**: Don't proceed to AI if data pipeline broken

### End of Week 3: AI Integration
**Go Criteria**:
- Email triage <3s ✅
- Results accurate >80% ✅
- UI shows results clearly ✅

**No-Go**: AI must work well before launch

### End of Week 4: Launch Decision
**Go Criteria**:
- 5+ beta users happy ✅
- 0 critical bugs ✅
- Performance acceptable ✅

**Soft Launch**: Proceed to 100 users in Week 5

---

## 🎯 Immediate Next Steps (Today!)

### 1. Create Database Schema (1 hour)
```bash
# Open Supabase dashboard
open https://app.supabase.com

# Go to SQL Editor
# Copy-paste schema from Day 1 above
# Run query
# Verify tables created
```

### 2. Update Mobile Config (10 minutes)
```swift
// iOS: Core/Config.swift
let API_BASE_URL = "https://gateway-production-caf0.up.railway.app"
let SUPABASE_URL = "https://ozrocykjomgcuphicqpg.supabase.co"
let SUPABASE_ANON_KEY = "YOUR_KEY_HERE"
```

### 3. Test Backend (30 minutes)
```bash
# Test gateway
curl https://gateway-production-caf0.up.railway.app/health

# Test AI
curl -X POST https://gateway-production-caf0.up.railway.app/api/ai/process \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","type":"email_triage","input":{"emails":[]}}'

# Expected: 200 OK with response (not 502)
```

### 4. Wire First API Call (2 hours)
```swift
// iOS: Test real API from mobile
func testGateway() async {
  let url = URL(string: "\(API_BASE_URL)/health")!
  let (data, _) = try await URLSession.shared.data(from: url)
  let health = try JSONDecoder().decode(HealthResponse.self, from: data)
  print("Gateway healthy: \(health.status)")
}
```

**By end of today**: Database created, mobile connected to live backend

---

## 📚 Key Resources

### Documentation
- `MVP_READINESS_ASSESSMENT.md` - Current 60% status
- `WEEK3_ALPHA_GUIDE.md` - All API endpoints
- `docs/current/PRODUCT-VISION.md` - Full product vision
- `docs/architecture/CURRENT-ARCHITECTURE.md` - Technical architecture

### Live Services
- Gateway: https://gateway-production-caf0.up.railway.app
- Supabase: https://ozrocykjomgcuphicqpg.supabase.co
- Railway Dashboard: https://railway.app

### Code Locations
- Backend: `packages/services/{gateway,ai,email,calendar,workflow}/`
- iOS: `apps/mobile-ios/`
- Android: `apps/mobile-android/`
- Database: Supabase dashboard → SQL Editor

---

## 🏆 Summary

**You are 60% done with infrastructure. The 40% gap is wiring, not building.**

**4-Week Plan**:
- Week 1: Database + Auth
- Week 2: OAuth + Connections
- Week 3: Email + AI + Calendar
- Week 4: Polish + Launch

**8-Week Plan**:
- Weeks 5-8: Full AI Chief of Staff features

**Next Action**: Create database schema (1 hour), then start wiring mobile auth.

**You're closer than you think!** 🚀
