# Tide Implementation Quick Reference

## Purpose

This document provides rapid-access guidance for all implementation phases. Each section includes:

- **What to build**
- **Key files to create**
- **Critical patterns to follow**
- **Success criteria**

For detailed implementation, refer to full guides in `/docs/implementation/`.

---

## Phase 0: Foundation (Week 1-2)

**📄 Full Guide**: `implementation/phase0-foundation-contracts.md`

### Day 1-2: Monorepo Setup

```bash
# Create structure
mkdir -p tide/{apps/{api,mobile,web},packages/{shared-types,validation,api-contracts,mocks,config}}

# Key files
- pnpm-workspace.yaml
- tsconfig.json (strict mode)
- .eslintrc.json (no `any` allowed)
- .prettierrc
- .husky/pre-commit
```

**Success**: `pnpm type-check` passes with zero errors

### Day 3-5: Database Schema

```typescript
// packages/shared-types/src/database.types.ts
export type UserId = string & { readonly __brand: 'UserId' };
export interface UserRow {
  /* all fields */
}
// ... all 10+ tables
```

**Success**: All types exported, no compilation errors

### Day 6-7: API Contracts

```typescript
// packages/api-contracts/src/*.contracts.ts
export const EmailContracts = {
  sendEmail: {
    method: 'POST',
    path: '/api/email/send',
    request: SendEmailRequestSchema, // Zod
    response: SendEmailResponseSchema, // Zod
  },
  // ... all endpoints
};
```

**Success**: OpenAPI spec generated, 40+ endpoints defined

### Day 8-10: Mock Services

```typescript
// packages/mocks/src/email.mocks.ts
export class MockEmailService implements IEmailProvider {
  async sendEmail(params) {
    return { success: true, messageId: `mock_${Date.now()}` };
  }
}
```

**Success**: Frontend can call all APIs and get realistic mock responses

### Day 11-14: Infrastructure

```bash
# Provision
- Supabase (PostgreSQL 16)
- Upstash (Redis 7)
- AWS S3 (email attachments)
- Sentry (error tracking)
- Axiom (logging)

# Deploy boilerplate API
- Express server responding with mocks
- Auth middleware (JWT)
- Health check endpoint
```

**Success**: API deployed, health check returns 200, database connected

---

## Phase 1: Core Modules (Week 3-6, PARALLEL)

### Module 1: Email Service

**📄 Full Guide**: `implementation/phase1-module-email.md`

**Owner**: Engineer #1 + #2 (or 2 Claude instances)

#### Week 3-4: OAuth & Providers

```
Day 15-16: Gmail OAuth
  ├── google-calendar-oauth.service.ts
  ├── getAuthUrl()
  ├── exchangeCodeForTokens()
  └── refreshAccessToken()

Day 17-19: Gmail Provider
  ├── gmail-provider.service.ts
  ├── sendEmail() - MIME message creation
  ├── searchEmails() - Gmail query string
  ├── getEmail() - Parse Gmail format
  └── getThread()

Day 20-21: Gmail Webhooks
  └── Google Cloud Pub/Sub setup

Day 22-25: Outlook (same pattern)
  ├── outlook-oauth.service.ts
  ├── outlook-provider.service.ts (Microsoft Graph)
  └── outlook-webhook.service.ts

Day 26-28: Email Facade
  ├── email.service.ts
  ├── getProviderForUser() - Auto-select Gmail/Outlook
  └── email.routes.ts
```

**Critical Pattern**: Strategy Pattern

```typescript
interface IEmailProvider {
  sendEmail(): Promise<EmailResult>;
  searchEmails(): Promise<Email[]>;
}

class GmailProvider implements IEmailProvider {}
class OutlookProvider implements IEmailProvider {}

class EmailService {
  async sendEmail(userId, params) {
    const provider = await this.getProviderForUser(userId);
    return provider.sendEmail(params);
  }
}
```

**Success Criteria**:

- [ ] OAuth works for both providers
- [ ] Can send/read emails
- [ ] Webhooks trigger on new email
- [ ] Initial sync works (last 30 days)
- [ ] 85%+ test coverage

---

### Module 2: Calendar Service

**📄 Full Guide**: `implementation/phase1-module-calendar.md` (COMPLETE)

**Owner**: Engineer #3 + #4

#### Week 3-4: OAuth & Providers

```
Day 15-16: Google Calendar OAuth (reuse Gmail pattern)
Day 17-19: Google Calendar Provider
  ├── createEvent()
  ├── getEvents()
  ├── updateEvent()
  ├── deleteEvent()
  └── getFreeBusy()

Day 20-21: Availability Calculator (PURE FUNCTIONS)
  ├── calculateFreeSlots() - NO SIDE EFFECTS
  ├── scoreSlots() - Pure scoring logic
  └── findOverlappingSlots() - Multi-participant

Day 22-25: Outlook Calendar (same pattern)
Day 26-28: Calendar Facade
```

**Critical Pattern**: Functional Core, Imperative Shell

```typescript
// Pure function - easy to test
class AvailabilityCalculator {
  calculateFreeSlots(events, timeframe, duration): TimeSlot[] {
    // NO database, NO API calls, NO side effects
    // Just pure logic
  }
}

// Imperative shell - handles I/O
class CalendarService {
  async checkAvailability(userId, params): Promise<TimeSlot[]> {
    const events = await provider.getEvents(); // I/O
    const slots = calculator.calculateFreeSlots(events); // Pure
    await cache.set(slots); // I/O
    return slots;
  }
}
```

**Success Criteria**:

- [ ] OAuth works for both providers
- [ ] CRUD operations working
- [ ] Availability calculator is PURE (100% testable)
- [ ] Timezone handling correct
- [ ] 85%+ test coverage

---

### Module 3: AI Service

**📄 Full Guide**: `implementation/phase1-module-ai.md`

**Owner**: Senior Engineer (or Claude instance)

#### Week 3-4: GPT Integration

```
Day 15-16: OpenAI Client
  ├── callOpenAI() - Retry logic + cost tracking
  └── Track usage in ai_usage table

Day 17-18: Function Definitions
  ├── tools/definitions.ts - ALL tools in Zod
  ├── search_email, draft_email, check_availability
  ├── create_calendar_event, analyze_contact
  └── ALL_TOOLS array

Day 19-20: Intent Classifier
  └── intent-classifier.service.ts
      ├── classifyIntent() - GPT-4 with tools
      └── buildSystemPrompt() - User context

Day 21-28: Function Executor
  └── function-executor.service.ts
      ├── execute() - Switch on tool name
      └── Call Email/Calendar/Context services
```

#### Week 5-6: Orchestration

```
Day 29-35: Command Orchestrator
  └── command-orchestrator.service.ts
      ├── processCommand() - Full lifecycle
      ├── analyzeDependencies() - Parallel vs sequential
      ├── requiresApproval() - User approval logic
      └── executeActions()

Day 36-42: Draft Generator & Learning
  ├── draft-generator.service.ts
  ├── learning.service.ts - Learn from user edits
  └── commands.routes.ts - API endpoints
```

**Critical Pattern**: Orchestration

```typescript
class CommandOrchestrator {
  async processCommand(userId, transcript) {
    // 1. Store command
    // 2. Classify intent with GPT
    // 3. Analyze dependencies
    const { parallel, sequential } = this.analyzeDependencies(toolCalls);

    // 4. Execute parallel
    await Promise.all(parallel.map((tc) => executor.execute(tc)));

    // 5. Execute sequential
    for (const tc of sequential) {
      await executor.execute(tc);
    }

    // 6. Return draft or auto-execute
  }
}
```

**Success Criteria**:

- [ ] Intent classification accurate (test with 20+ examples)
- [ ] Function execution working
- [ ] Parallel execution working
- [ ] User approval flow working
- [ ] Cost tracking working

---

### Module 4: Context Engine

**📄 Full Guide**: `implementation/phase1-module-context.md`

**Owner**: Engineer #5

#### Week 3-4: Context Services

```
Day 15-17: User Context
  └── user-context.service.ts
      ├── getUserContext() - 3-level caching
      ├── L1: In-memory (1 min TTL)
      ├── L2: Redis (10 min TTL)
      └── L3: Database build

Day 18-21: Contact Analyzer
  └── contact-analyzer.service.ts
      ├── analyzeContact() - GPT-4 analysis
      ├── analyzeWithGPT() - Email history → relationship
      └── calculateAverageResponseTime()

Day 22-25: Meeting Pattern Analyzer
  └── meeting-pattern-analyzer.service.ts
      ├── analyzeMeetingPatterns()
      ├── analyzeTimeDistribution()
      ├── detectMeetingFreeDays()
      └── analyzeBackToBackTolerance()
```

#### Week 5-6: Vector DB & Search

```
Day 26-30: Vector Database Setup
  ├── Choose: Pinecone or Weaviate
  ├── vector-db.service.ts
  ├── upsertEmailEmbedding()
  └── searchSemanticEmails()

Day 31-35: Background Indexing
  └── email-indexing-worker.ts
      ├── Listen to email.received events
      ├── Generate embeddings with GPT
      └── Store in vector DB

Day 36-42: Semantic Search API
  └── search.service.ts
      ├── semanticSearch() - Query vector DB
      ├── rankResults()
      └── summarizeWithGPT()
```

**Critical Pattern**: Multi-level Caching

```typescript
async getUserContext(userId: string) {
  // L1: In-memory (fastest)
  const l1 = inMemoryCache.get(userId);
  if (l1) return l1;

  // L2: Redis (fast)
  const l2 = await redis.get(`user:context:${userId}`);
  if (l2) {
    inMemoryCache.set(userId, l2);
    return l2;
  }

  // L3: Build from DB (slow but comprehensive)
  const context = await this.buildUserContext(userId);
  await redis.setex(`user:context:${userId}`, 600, context);
  inMemoryCache.set(userId, context);
  return context;
}
```

**Success Criteria**:

- [ ] User context < 100ms (cached)
- [ ] Contact analysis working
- [ ] Vector DB integrated
- [ ] Semantic search working
- [ ] Background indexing working

---

### Module 5: Mobile App

**📄 Full Guide**: `implementation/phase1-module-mobile.md` (TO CREATE)

**Owner**: Mobile Engineer #1 + #2

#### Week 3-4: Foundation

```
Day 15-17: Expo Setup
  ├── expo init tide-mobile
  ├── React Navigation
  ├── TypeScript strict mode
  └── Import @tide/contracts

Day 18-21: Authentication
  ├── OAuth WebView
  ├── Token storage (SecureStore)
  └── API client setup

Day 22-25: Voice Input
  ├── expo-av (audio recording)
  ├── Device STT or Deepgram API
  └── Waveform visualization
```

#### Week 5-6: Core Screens

```
Day 26-30: Draft Review UI
  ├── Draft preview
  ├── Edit functionality
  ├── Approve/Reject buttons
  └── Real-time status updates

Day 31-35: Command History
  └── List view of past commands

Day 36-42: State Management
  ├── Zustand store
  ├── API integration (swap mocks for real)
  └── Error handling
```

**Critical Pattern**: Optimistic UI

```typescript
// Optimistically update UI, rollback on error
async function submitCommand(transcript: string) {
  const optimisticCommand = {
    id: 'temp-' + Date.now(),
    transcript,
    status: 'processing',
  };

  // Update UI immediately
  addCommand(optimisticCommand);

  try {
    const result = await api.commands.process({ transcript });
    updateCommand(optimisticCommand.id, result);
  } catch (error) {
    removeCommand(optimisticCommand.id);
    showError(error);
  }
}
```

**Success Criteria**:

- [ ] OAuth flow works
- [ ] Can record voice
- [ ] Can submit commands
- [ ] Can review/approve drafts
- [ ] Works against real API

---

## Phase 2: Feature Integration (Week 7-10, PARALLEL)

### Feature 1: Meeting Scheduling Flow

**Owner**: Engineers #1 + #2 + Mobile #1

#### End-to-End Flow

```
Voice: "Schedule lunch with Sarah next week"
  ↓
AI: Classify intent → schedule_meeting
  ↓
AI: Call check_availability (Calendar)
  ↓
AI: Call analyze_contact (Context) for Sarah
  ↓
AI: Generate meeting request email draft
  ↓
User: Approves draft
  ↓
Email: Send via Gmail/Outlook
  ↓
Context: Track response
  ↓
[Sarah responds with time]
  ↓
AI: Extract chosen time
  ↓
Calendar: Create event
  ↓
Email: Send confirmation
```

#### Implementation Tasks

```
Week 7: Backend Integration
  ├── Connect AI → Calendar availability
  ├── Connect AI → Contact analysis
  ├── Connect Calendar → Email drafting
  └── Test end-to-end

Week 8: Response Monitoring
  ├── Email webhook → AI analysis
  ├── Time extraction from reply
  ├── Calendar event creation
  └── Confirmation email

Week 9: Mobile Integration
  ├── Voice → API submission
  ├── Draft display
  ├── Approval flow
  └── Status updates

Week 10: Testing & Polish
  ├── E2E tests (voice → confirmed meeting)
  ├── Error scenarios
  ├── Performance optimization
  └── User feedback loops
```

**Success Criteria**:

- [ ] 90%+ completion rate (coordinations → scheduled meeting)
- [ ] < 30s from voice to draft approval
- [ ] 95%+ of proposed times are actually free
- [ ] Works for Gmail + Outlook users

---

### Feature 2: Email Drafting Flow

**Owner**: Engineers #3 + #4 + Mobile #2

```
Voice: "Tell John I'll have the report ready by Friday"
  ↓
AI: Classify intent → draft_email
  ↓
Context: Analyze John (tone, relationship)
  ↓
AI: Generate email draft
  ↓
User: Reviews (maybe edits)
  ↓
Email: Send
  ↓
Context: Learn from edits
```

**Success Criteria**:

- [ ] Tone matches recipient 95%+ of time
- [ ] User edits < 20% of drafts
- [ ] Learning improves over time

---

### Feature 3: Search & Context Retrieval

**Owner**: Engineer #5 + Mobile (flex)

```
Voice: "What did John say about Q4 timeline?"
  ↓
AI: Classify intent → search_email
  ↓
Context: Semantic search in vector DB
  ↓
AI: Summarize results
  ↓
Display with citations
```

**Success Criteria**:

- [ ] Accurate results 90%+ of time
- [ ] < 2s end-to-end
- [ ] Source citations working

---

## Phase 3: Advanced Features (Week 11-14)

### Quick Implementation Guide

**Feature 4: Follow-up Tracking**

```typescript
// Background job checks pending responses
async function checkFollowUps() {
  const pending = await db.followUp.findMany({
    where: {
      status: 'active',
      follow_up_at: { lte: new Date() },
    },
  });

  for (const followUp of pending) {
    // Check if response received
    const hasResponse = await checkForResponse(followUp.email_thread_id);

    if (!hasResponse) {
      // Notify user, generate draft
      await notifyUser(followUp.user_id);
      await generateFollowUpDraft(followUp);
    }
  }
}
```

**Feature 5: Auto-Response**

```typescript
// Classify incoming emails
async function classifyEmail(email: Email) {
  const classification = await gpt.classify({
    subject: email.subject,
    body: email.snippet,
  });

  if (classification.isSimple && classification.confidence > 0.99) {
    const draft = await gpt.generateResponse(email);
    await queueForUserApproval(draft);
  }
}
```

**Feature 6: Daily Briefing**

```typescript
// Cron job generates briefing
async function generateDailyBrief(userId: string) {
  const [pending, meetings, deadlines] = await Promise.all([
    getPendingItems(userId),
    getTodaysMeetings(userId),
    getUpcomingDeadlines(userId),
  ]);

  const briefing = await gpt.prioritize({
    pending,
    meetings,
    deadlines,
  });

  await sendPushNotification(userId, briefing);
}
```

**Feature 7: Calendar Optimization**

```typescript
// Analyze calendar health
async function analyzeCalendar(userId: string) {
  const events = await getUpcomingEvents(userId);

  const issues = detectIssues(events); // back-to-back, no lunch, etc
  const suggestions = generateSuggestions(issues);

  return { issues, suggestions };
}
```

---

## Phase 4: Beta Launch (Week 15-18)

### Week 15: Comprehensive Testing

```
- E2E tests (all flows)
- Load testing (100 concurrent users)
- Security audit
- Bug bash (whole team)
```

### Week 16: Performance Optimization

```
- API latency < 500ms (p95)
- Database query optimization
- Mobile app startup < 2s
- Bundle size < 500KB
```

### Week 17: Beta Preparation

```
- Onboarding flow
- Help documentation
- Error messages (user-friendly)
- Privacy policy
- Terms of service
- Beta user recruitment (50 users)
```

### Week 18: Launch

```
- Deploy to production
- Onboard beta users
- Monitor (Sentry, Axiom, metrics)
- Collect feedback
- Daily bug fixes
```

---

## Critical Patterns Reference

### 1. Strategy Pattern (Email/Calendar Providers)

```typescript
interface IProvider {
  operation(): Promise<Result>;
}

class ProviderA implements IProvider {}
class ProviderB implements IProvider {}

class Service {
  async run(userId: string) {
    const provider = this.getProvider(userId);
    return provider.operation();
  }
}
```

### 2. Functional Core, Imperative Shell

```typescript
// Pure function - no side effects
function calculateResult(input: Data): Result {
  // Just logic, no I/O
}

// Imperative shell - handles I/O
async function service(userId: string) {
  const data = await fetchData(userId); // I/O
  const result = calculateResult(data); // Pure
  await saveResult(result); // I/O
  return result;
}
```

### 3. Multi-Level Caching

```typescript
async function getData(key: string) {
  // L1: In-memory (fastest)
  if (memCache.has(key)) return memCache.get(key);

  // L2: Redis (fast)
  const cached = await redis.get(key);
  if (cached) {
    memCache.set(key, cached);
    return cached;
  }

  // L3: Database (slow)
  const data = await db.query(key);
  await redis.set(key, data, TTL);
  memCache.set(key, data);
  return data;
}
```

### 4. Dependency Injection

```typescript
class ServiceA {
  constructor(
    private serviceB: ServiceB,
    private serviceC: ServiceC,
    private logger: Logger
  ) {}

  async run() {
    this.logger.info('Running');
    await this.serviceB.doThing();
  }
}

// Easy to test with mocks
const mockB = { doThing: jest.fn() };
const service = new ServiceA(mockB, mockC, mockLogger);
```

### 5. Result Type (Error Handling)

```typescript
type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

async function operation(): Promise<Result<Data, CustomError>> {
  try {
    const data = await riskyOperation();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: new CustomError('Failed', error),
    };
  }
}

// Usage
const result = await operation();
if (!result.success) {
  logger.error(result.error);
  return;
}
// TypeScript knows result.data exists
processData(result.data);
```

---

## Success Metrics Summary

### Phase 0 Exit Criteria

- ✅ 100% of API contracts defined
- ✅ Mock services respond correctly
- ✅ Database schema approved
- ✅ CI/CD working

### Phase 1 Exit Criteria

- ✅ All 5 modules independently working
- ✅ 85%+ test coverage each
- ✅ Performance benchmarks met
- ✅ Zero TypeScript `any` types

### Phase 2 Exit Criteria

- ✅ 3 end-to-end features working
- ✅ 90%+ success rate
- ✅ Mobile app polished
- ✅ E2E tests passing

### Phase 3 Exit Criteria

- ✅ 4 advanced features working
- ✅ Product differentiation clear
- ✅ All features tested

### Beta Launch Criteria

- ✅ 50 beta users onboarded
- ✅ NPS > 40
- ✅ Core flows work 95%+
- ✅ Zero critical bugs

---

## Next Steps

1. **Start Phase 0**: Review `implementation/phase0-foundation-contracts.md`
2. **Assign Modules**: After Phase 0, assign 5 parallel workstreams
3. **Daily Standup**: 15min sync on progress/blockers
4. **Weekly Demo**: Show working features every Friday
5. **Iterate**: Adjust based on learnings

**Remember**: Think first, build better. Quality over speed. No technical debt.

🚀 **Let's build something amazing.**
