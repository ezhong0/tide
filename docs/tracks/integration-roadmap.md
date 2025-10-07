# 🎯 MVP Development Tracks - Vertical Feature Slices

**Philosophy**: Each track = One complete microservice that owns its full stack
**Strategy**: Independent teams ship complete features in parallel
**Timeline**: 4 weeks to working MVP with all features

**Last Updated**: 2025-10-07

---

## Track Organization

Each track is a **complete vertical slice** owning:
- ✅ Backend microservice (Railway deployment)
- ✅ Mobile UI (iOS + Android screens)
- ✅ Database tables (Supabase schema)
- ✅ AI integration (agents, prompts)
- ✅ Testing & monitoring

**Tracks can be built in parallel with minimal coordination.**

---

## Track Overview

| Track | Feature Area | Team Size | Status | Dependencies |
|-------|-------------|-----------|--------|--------------|
| **Track 0** | Auth & Infrastructure | 1 dev | ✅ 100% | None (blocks all) |
| **Track 1** | Email Intelligence | 1-2 devs | ✅ 95% | Track 0 only |
| **Track 2** | Calendar Intelligence | 1-2 devs | 🚧 65% | Track 0 only |
| **Track 3** | AI Chat Interface | 1-2 devs | 🚧 75% | Track 0 only |
| **Track 4** | Task & Workflow | 1 dev | ✅ 80% | Track 0 only |

**Track 0 Status**: ✅ COMPLETE - All feature tracks unblocked

---

## Track 0: Authentication & Core Infrastructure

**Owner**: DevOps + Backend Lead
**Duration**: TODAY (4 hours) → Already 95% done, just needs DB schema
**Deliverable**: Supabase auth + database schema + Railway deployment

### What This Track Owns
- Supabase configuration (Auth, Database, Realtime)
- Database schema (all tables for all tracks)
- Railway deployment infrastructure
- API Gateway service
- Shared packages (@tide/types, @tide/config, etc.)
- Monitoring & error tracking

### Critical Path (TODAY)
```bash
# Hour 1: Database Schema (BLOCKS EVERYTHING)
- Create Supabase tables for all tracks
- RLS policies for data isolation
- Test user for demo

# Hour 2: Verify Deployment
- Check Railway services healthy
- Test API endpoints
- Verify environment variables

# Hour 3-4: Integration Testing
- Test auth flow
- Test database connections
- Test service communication
```

### Deliverables
- [x] Railway services deployed (Gateway, AI, Email, Calendar, Workflow)
- [x] Database schema complete (10 tables)
- [x] Supabase Auth configured
- [x] Health checks passing
- [x] Environment variables configured
- [x] RLS policies active

**See**: [track-auth-infrastructure.md](./track-auth-infrastructure.md)

---

## Track 1: Email Intelligence (Complete Email Feature)

**Owner**: Email Team (1-2 developers)
**Duration**: 4 weeks
**Deliverable**: Users can connect Gmail/Outlook, see AI-triaged emails, respond with AI drafts

### What This Track Owns
- ✅ Email Service (backend microservice on Railway)
- 📱 Email screens in mobile app (iOS + Android)
- 🗄️ Database tables: `email_messages`, `provider_tokens` (Gmail/Outlook)
- 🤖 AI integration: Email triage agent, composition agent
- 📊 Email analytics and insights

### Tech Stack
- Backend: `packages/services/email/` - Node.js service on Railway
- Mobile iOS: `apps/mobile-ios/TideApp/Features/Email/`
- Mobile Android: `apps/mobile-android/app/src/main/kotlin/ai/tide/features/email/`
- Database: Supabase PostgreSQL
- AI: GPT-5-mini and GPT-5-nano for triage and composition

### Development Plan

**Week 1**: OAuth + Email Fetch
```typescript
// Backend: packages/services/email/
- Gmail OAuth flow ✅
- Outlook OAuth flow ✅
- Token storage in Supabase ✅
- Email fetch and sync ✅

// Mobile:
- OAuth web view screens
- Connect Gmail/Outlook buttons
- Loading states

// Database:
CREATE TABLE provider_tokens (...)
CREATE TABLE email_messages (...)
```

**Week 2**: Email Display + Triage
```typescript
// Backend:
- AI triage integration (urgent/important/normal/low)
- Batch processing for performance
- Webhook for real-time sync

// Mobile:
- Email list view (inbox)
- Email detail view
- Category badges (urgent/important)
- Pull-to-refresh

// AI:
- Email triage agent with GPT-5-nano
- Category classification
- Priority scoring
```

**Week 3**: Smart Composition
```typescript
// Backend:
- Multi-draft generation (detailed/balanced/brief)
- Tone analysis
- Relationship-aware drafts

// Mobile:
- Reply composer screen
- Draft selection UI
- Send email action

// AI:
- Composition agent
- Tone control
- Context awareness
```

**Week 4**: Polish + Advanced Features
```typescript
// Backend:
- VIP sender detection
- Auto-archive suggestions
- Email search

// Mobile:
- Swipe actions (archive, delete, snooze)
- Smart filters
- Email search UI

// Performance:
- <3s triage time
- Offline email reading
- Background sync
```

### Team Can Work Independently On
- ✅ Email backend service (no conflicts with other services)
- ✅ Email mobile screens (separate from chat/calendar screens)
- ✅ Email database tables (isolated schema)
- ✅ Email AI agents (independent from calendar agents)

### External Dependencies
- ⚠️ Needs Track 0: Database schema, auth tokens
- ⚠️ Minimal coordination: AI service for triage (can mock initially)

### Success Criteria
- [ ] Gmail connected in <30 seconds
- [ ] Emails triaged in <3 seconds
- [ ] AI drafts generated in <5 seconds
- [ ] 90%+ triage accuracy
- [ ] Works offline (cached emails)

**See**: [track-email-intelligence.md](./track-email-intelligence.md)

---

## Track 2: Calendar Intelligence (Complete Calendar Feature)

**Owner**: Calendar Team (1-2 developers)
**Duration**: 4 weeks
**Deliverable**: Users can view calendar, get meeting briefs, auto-schedule meetings

### What This Track Owns
- ✅ Calendar Service (backend microservice on Railway)
- 📱 Calendar screens in mobile app (iOS + Android)
- 🗄️ Database tables: `calendar_events`
- 🤖 AI integration: Meeting prep agent, scheduling agent
- 📊 Calendar analytics and optimization

### Tech Stack
- Backend: `packages/services/calendar/` - Node.js service on Railway
- Mobile iOS: `apps/mobile-ios/TideApp/Features/Calendar/`
- Mobile Android: `apps/mobile-android/app/src/main/kotlin/ai/tide/features/calendar/`
- Database: Supabase PostgreSQL
- AI: GPT-5-mini for meeting prep and scheduling

### Development Plan

**Week 1**: OAuth + Event Fetch
```typescript
// Backend:
- Google Calendar OAuth ✅
- MS Calendar OAuth ✅
- Event sync ✅

// Mobile:
- Calendar connection flow
- Month/week/day views
- Event list

// Database:
CREATE TABLE calendar_events (...)
```

**Week 2**: Smart Scheduling
```typescript
// Backend:
- Availability detection
- Conflict resolution
- Time zone handling

// Mobile:
- Create event screen
- Smart scheduling suggestions
- Conflict warnings

// AI:
- Scheduling optimization agent
- Best time suggestions
```

**Week 3**: Meeting Prep
```typescript
// Backend:
- Auto-generate meeting briefs
- Find related emails
- Attendee insights

// Mobile:
- Meeting brief screen
- Talking points display
- Document links

// AI:
- Meeting prep agent
- Attendee analysis
```

**Week 4**: Calendar Optimization
```typescript
// Backend:
- Focus block protection
- Travel time calculation
- Energy-based scheduling

// Mobile:
- Calendar settings
- Focus preferences
- Optimization insights

// Performance:
- <2s smart scheduling
- Meeting briefs 2hrs before
```

### Team Can Work Independently On
- ✅ Calendar backend service
- ✅ Calendar mobile screens
- ✅ Calendar database tables
- ✅ Calendar AI agents

### External Dependencies
- ⚠️ Needs Track 0: Database schema, auth tokens
- ⚠️ Needs Track 1: Related emails for meeting prep (can mock)

### Success Criteria
- [ ] Calendar connected in <30 seconds
- [ ] Events synced in real-time
- [ ] Meeting briefs ready 2hrs before
- [ ] Smart scheduling <2 seconds
- [ ] Focus time protected

**See**: [track-calendar-intelligence.md](./track-calendar-intelligence.md)

---

## Track 3: AI Chat Interface (Complete Chat Feature)

**Owner**: AI/Chat Team (1-2 developers)
**Duration**: 4 weeks
**Deliverable**: Users can chat with AI, get summaries, ask questions, execute actions

### What This Track Owns
- ✅ AI Service (backend microservice on Railway)
- 📱 Chat screens in mobile app (iOS + Android)
- 🗄️ Database tables: `conversations`, `messages`
- 🤖 AI integration: Multi-model routing, agent orchestration
- 🧠 Context management and memory

### Tech Stack
- Backend: `packages/services/ai/` - Node.js service on Railway
- Mobile iOS: `apps/mobile-ios/TideApp/Features/Chat/`
- Mobile Android: `apps/mobile-android/app/src/main/kotlin/ai/tide/features/chat/`
- Database: Supabase PostgreSQL
- AI: GPT-5-mini and GPT-5-nano only

### Development Plan

**Week 1**: Basic Chat
```typescript
// Backend:
- GPT-5 integration ✅
- Message processing ✅
- Conversation storage ✅

// Mobile:
- Chat UI (bubbles)
- Message input
- Typing indicators

// Database:
CREATE TABLE conversations (...)
CREATE TABLE messages (...)
```

**Week 2**: Multi-Agent System
```typescript
// Backend:
- Intent classification ✅
- Agent routing ✅
- 16+ specialized agents ✅

// Mobile:
- Action cards
- Agent status display
- Result previews

// AI:
- Email agent
- Calendar agent
- Task agent
- Search agent
```

**Week 3**: Context & Memory
```typescript
// Backend:
- Conversation history
- User preferences
- Relationship memory

// Mobile:
- Conversation list
- Search conversations
- Memory insights

// AI:
- Context building
- Long-term memory
- Personalization
```

**Week 4**: Advanced Features
```typescript
// Backend:
- Voice input processing
- Streaming responses
- Multi-turn reasoning

// Mobile:
- Voice input UI
- Streaming message display
- Suggested actions

// Performance:
- <1s first token
- <5s full response
```

### Team Can Work Independently On
- ✅ AI backend service
- ✅ Chat mobile screens
- ✅ Conversation database tables
- ✅ Agent orchestration

### External Dependencies
- ⚠️ Needs Track 0: Database schema
- ⚠️ Calls Track 1 & 2 services for actions (can mock)

### Success Criteria
- [ ] Chat responds in <1 second
- [ ] 95%+ intent accuracy
- [ ] Multi-turn conversations work
- [ ] Voice input supported
- [ ] Actions execute correctly

**See**: [track-ai-chat-interface.md](./track-ai-chat-interface.md)

---

## Track 4: Task & Workflow Engine (Complete Automation Feature)

**Owner**: Workflow Team (1 developer)
**Duration**: 4 weeks
**Deliverable**: Users can create workflows, automate tasks, detect patterns

### What This Track Owns
- ✅ Workflow Service (backend microservice on Railway)
- 📱 Task/Workflow screens in mobile app
- 🗄️ Database tables: `tasks`, `workflows`, `workflow_executions`
- 🤖 AI integration: Pattern detection, automation suggestions
- 🔄 Workflow orchestration engine

### Tech Stack
- Backend: `packages/services/workflow/` - Node.js service on Railway
- Mobile iOS: `apps/mobile-ios/TideApp/Features/Tasks/`
- Mobile Android: `apps/mobile-android/app/src/main/kotlin/ai/tide/features/tasks/`
- Database: Supabase PostgreSQL
- AI: Pattern detection ML models

### Development Plan

**Week 1**: Task Management
```typescript
// Backend:
- Task CRUD operations ✅
- Task dependencies ✅
- Priority management ✅

// Mobile:
- Task list view
- Create task screen
- Task detail view

// Database:
CREATE TABLE tasks (...)
```

**Week 2**: Workflow Engine
```typescript
// Backend:
- Workflow execution ✅
- State management ✅
- Saga pattern ✅

// Mobile:
- Workflow builder
- Execution status
- Progress tracking

// Database:
CREATE TABLE workflows (...)
CREATE TABLE workflow_executions (...)
```

**Week 3**: Pattern Detection
```typescript
// Backend:
- Detect recurring patterns
- Suggest automations
- Learn from user behavior

// Mobile:
- Automation suggestions
- Pattern insights
- Quick automation setup

// AI:
- Pattern detection ML
- Confidence scoring
```

**Week 4**: Team Workflows
```typescript
// Backend:
- Team workflow support
- Delegation
- Approvals

// Mobile:
- Team task views
- Delegation UI
- Approval workflows

// Performance:
- <3s workflow execution
- 80%+ pattern accuracy
```

### Team Can Work Independently On
- ✅ Workflow backend service
- ✅ Task/workflow mobile screens
- ✅ Workflow database tables
- ✅ Pattern detection ML

### External Dependencies
- ⚠️ Needs Track 0: Database schema
- ⚠️ Minimal: Can trigger email/calendar actions (loose coupling)

### Success Criteria
- [ ] Tasks created in <2 seconds
- [ ] Workflows execute reliably
- [ ] 80%+ pattern detection accuracy
- [ ] Automations save 5+ hours/week

**See**: [track-task-workflow-engine.md](./track-task-workflow-engine.md)

---

## Coordination Points

### Only 3 Sync Points Needed

**1. Database Schema (Hour 1 TODAY)**
- Track 0 creates ALL tables for all tracks upfront
- Each track gets their tables immediately
- No waiting, no blocking

**2. API Contracts (Week 1)**
- Define service-to-service APIs
- Mock responses for development
- Real integration in Week 2

**3. Final Integration (Week 4)**
- All tracks ship independently
- Integration testing
- End-to-end flows

### No Daily Sync Needed
- Tracks work independently
- Communicate via Slack for questions
- Weekly demo on Fridays

---

## Development Flow

```
TODAY (Hour 1): Track 0 creates database schema
  ↓
Week 1-4: All tracks develop in parallel
  - Track 1: Email feature
  - Track 2: Calendar feature
  - Track 3: Chat feature
  - Track 4: Workflow feature
  ↓
Week 4: Integration & Testing
  ↓
SHIP MVP 🚀
```

---

## Track Files

- **[Track 0: Auth & Infrastructure](./track-auth-infrastructure.md)** - Core platform
- **[Track 1: Email Intelligence](./track-email-intelligence.md)** - Complete email feature
- **[Track 2: Calendar Intelligence](./track-calendar-intelligence.md)** - Complete calendar feature
- **[Track 3: AI Chat Interface](./track-ai-chat-interface.md)** - Complete chat feature
- **[Track 4: Task & Workflow Engine](./track-task-workflow-engine.md)** - Complete automation feature

---

**Each track ships a complete, usable feature. No cross-track dependencies. Maximum parallelization.** 🚀
