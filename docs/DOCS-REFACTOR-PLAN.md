# Documentation Refactor Plan

**Date:** October 7, 2025
**Purpose:** Align documentation with actual implementation vs aspirational architecture
**Status:** Ready to execute

---

## Problem Statement

Your docs describe an aspirational "production at scale" architecture, but you're at **Week 3 Alpha** with a much simpler (and correct!) implementation. This creates confusion about:
- What's built vs what's planned
- What to build next vs what to defer
- Technology choices (Kafka, Redis, Pinecone, etc.)

---

## Documentation Audit

### Current Docs Structure

```
docs/
├── PRODUCT-README.md                    # Product vision (OK to keep aspirational)
├── OAUTH-CONSOLIDATION.md              # ✅ Accurate (recent update)
├── architecture/
│   └── ARCHITECTURE.md                  # ⚠️  ASPIRATIONAL - needs reality check
├── archive/                             # ✅ Archived (OK as-is)
│   ├── BUSINESS-STRATEGY-TEXT-FIRST.md
│   ├── PRODUCT-VISION.md
│   └── IMPLEMENTATION-ROADMAP.md
├── guides/                              # ⚠️  Mix of accurate and outdated
│   ├── FOUNDATION-COMPLETE.md           # ✅ Accurate
│   ├── INTEGRATION-TESTING.md           # ⚠️  Needs update
│   └── TESTING-GUIDE.md                 # ⚠️  Needs update
└── tracks/                              # ⚠️  Mix of accurate and outdated
    ├── integration-milestones.md        # ✅ Mostly accurate
    ├── track-01-mobile-apps.md          # ⚠️  Needs reality check
    ├── track-02-ai-intelligence.md      # ⚠️  Needs reality check
    ├── track-03-email-calendar.md       # ⚠️  Needs reality check
    ├── track-04-task-workflow.md        # ⚠️  Needs reality check
    ├── track-05-backend-infrastructure.md # ⚠️  VERY outdated
    └── track-06-data-analytics.md       # ⚠️  Premature
```

---

## Refactor Strategy

### Principle: Two-Tier Documentation

Instead of rewriting everything, **split into Current vs Future**:

```
docs/
├── current/              # NEW: What's built NOW
│   ├── STACK.md         # Actual tech stack (Supabase + 4 services)
│   ├── SERVICES.md      # What services exist and how to run them
│   ├── DEPLOYMENT.md    # How to deploy (Railway)
│   └── INTEGRATION.md   # How services connect
│
├── future/              # NEW: What we'll build LATER
│   ├── SCALING.md       # Redis, Kafka, CDN (when needed)
│   ├── ADVANCED.md      # GraphQL, monitoring, multi-region
│   └── VISION.md        # Long-term architecture (moved from ARCHITECTURE.md)
│
├── PRODUCT-README.md    # Keep as-is (product vision OK)
├── OAUTH-CONSOLIDATION.md # Keep as-is (accurate)
│
├── architecture/        # REFACTOR
│   ├── CURRENT-ARCHITECTURE.md    # NEW: Reality
│   ├── FUTURE-ARCHITECTURE.md     # Rename from ARCHITECTURE.md
│   └── DECISIONS.md               # NEW: Why we chose Supabase, etc.
│
├── guides/              # UPDATE
│   ├── GETTING-STARTED.md         # NEW: Developer onboarding
│   ├── FOUNDATION-COMPLETE.md     # Keep as-is
│   ├── INTEGRATION-TESTING.md     # Update with actual tests
│   └── TESTING-GUIDE.md           # Update with current setup
│
└── tracks/              # UPDATE
    ├── README.md                  # NEW: Track status overview
    ├── COMPLETED.md               # NEW: What's done (AI, Email, Calendar, Workflow)
    ├── track-01-mobile-apps.md    # Update: Remove references to unbuilt infra
    └── track-05-backend-infrastructure.md # Update: Reflect Supabase reality
```

---

## Execution Plan

### Phase 1: Create New "Current State" Docs (1-2 hours)

#### 1.1 Create `docs/current/STACK.md`

**Content:**
```markdown
# Tide Tech Stack (Current - Week 3 Alpha)

## Frontend
- iOS: Swift + SwiftUI + Supabase SDK
- Android: Kotlin + Jetpack Compose + Supabase SDK

## Backend Services
- Gateway Service (Express, port 4000)
- AI Service (Express, port 4003) - Multi-model router, 18 agents
- Email Service (Express, port 4004) - Gmail integration
- Calendar Service (Express, port 4005) - Google Calendar integration
- Workflow Service (Express, port 4006) - Task orchestration

## Data & Infrastructure
- Auth: Supabase Auth (Google OAuth)
- Database: Supabase PostgreSQL
- Realtime: Supabase Realtime
- Storage: Supabase Storage

## External APIs
- AI: OpenAI (GPT-4), Anthropic (Claude)
- Email: Gmail API
- Calendar: Google Calendar API

## Development
- Local: Docker Compose (optional)
- Deployment: Railway (when ready)

## What We're NOT Using Yet
- ❌ Kafka (will add at scale)
- ❌ Redis (will add if DB is slow)
- ❌ Pinecone (using pgvector instead)
- ❌ GraphQL (using REST for now)
- ❌ AWS (using Supabase + Railway)
```

#### 1.2 Create `docs/current/SERVICES.md`

**Content:**
```markdown
# Services Overview (Current)

## Implemented Services

### 1. AI Service (4003)
- **Status:** ✅ Complete
- **Location:** `packages/services/ai/`
- **Features:**
  - Multi-model router (GPT, Claude, Gemini)
  - 18 specialized agents
  - Reasoning engine
  - Learning system
- **How to run:** `pnpm --filter @tide/ai dev`
- **Health check:** GET /health

### 2. Email Service (4004)
- **Status:** ✅ Complete
- **Location:** `packages/services/email/`
- **Features:**
  - Gmail integration
  - Email triage
  - Smart composer
  - Automation engine
- **How to run:** `pnpm --filter @tide/email dev`
- **Dependencies:** Gmail OAuth tokens from Supabase

### 3. Calendar Service (4005)
- **Status:** ✅ Complete
- **Location:** `packages/services/calendar/`
- **Features:**
  - Google Calendar integration
  - Smart scheduling
  - Conflict resolution
  - Meeting preparation
- **How to run:** `pnpm --filter @tide/calendar dev`
- **Dependencies:** Google Calendar OAuth tokens from Supabase

### 4. Workflow Service (4006)
- **Status:** ✅ Complete
- **Location:** `packages/services/workflow/`
- **Features:**
  - Task engine
  - Pattern detection
  - 3 execution modes (State Machine, DAG, Saga)
- **How to run:** `pnpm --filter @tide/workflow dev`

### 5. Gateway Service (4000)
- **Status:** ⏳ Partial
- **Location:** `packages/services/gateway/`
- **Current:** Basic structure
- **Needed:** Route requests to 4 services
- **How to run:** `pnpm --filter @tide/gateway dev`

## Service Communication

### Current: HTTP + Supabase
```typescript
// Service-to-service via HTTP
const response = await fetch('http://ai-service:4003/chat', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${supabaseToken}` },
  body: JSON.stringify(data)
});

// Database via Supabase client
const { data } = await supabase
  .from('conversations')
  .select('*')
  .eq('user_id', userId);
```

### Future: May add message queue
When we have >10K events/sec, consider:
- Kafka for event streaming
- RabbitMQ for task queues
- But not needed for Alpha/Beta!
```

#### 1.3 Create `docs/current/DEPLOYMENT.md`

**Content:**
```markdown
# Deployment Guide (Current)

## Alpha Deployment

### Where We Deploy
- **Frontend:** Not deployed yet (local dev only)
- **Backend:** Railway (when ready)
- **Database:** Supabase (hosted)

### Railway Deployment (Backend)

Each service deploys independently:

\`\`\`bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Link to project
railway link

# 4. Deploy service
cd packages/services/ai
railway up
\`\`\`

### Environment Variables

Each Railway service needs:
\`\`\`bash
NODE_ENV=production
SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<secret>
OPENAI_API_KEY=<secret>
ANTHROPIC_API_KEY=<secret>
\`\`\`

### Cost Estimate
- Supabase Free Tier: $0 (upgrade to Pro $25 when needed)
- Railway: ~$5-20 per service = $25-100/month
- APIs (OpenAI, Anthropic): Pay-per-use, ~$50-100/month
- **Total: $75-225/month for Alpha/Beta**

### What We're NOT Deploying Yet
- No Kubernetes (Railway is simpler)
- No AWS (using Supabase + Railway)
- No multi-region (single region for Alpha)
- No CDN (not needed for <1000 users)
```

#### 1.4 Create `docs/current/INTEGRATION.md`

**Content:**
```markdown
# Integration Guide (Current)

## How Services Connect

### Architecture Flow

\`\`\`
Mobile App (iOS/Android)
  ↓ Supabase Auth Token
Gateway Service (4000)
  ↓ Forward with token
AI/Email/Calendar/Workflow Services
  ↓ Validate token with Supabase
Supabase (auth.getUser)
  ↓ If valid
Service processes request
  ↓ Store data
Supabase PostgreSQL
\`\`\`

### Authentication

All services validate Supabase JWTs:

\`\`\`typescript
// packages/services/ai/src/middleware/auth.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function validateAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = user;
  next();
}
\`\`\`

### Database Access

Services use Supabase client:

\`\`\`typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Bypasses RLS
);

// Query database
const { data, error } = await supabase
  .from('conversations')
  .select('*')
  .eq('user_id', userId);
\`\`\`

### OAuth Token Access

Services get OAuth tokens from Supabase:

\`\`\`typescript
// Get Gmail token
const { data: token } = await supabase
  .from('oauth_tokens')
  .select('*')
  .eq('user_id', userId)
  .eq('provider', 'google')
  .single();

// Use with Gmail API
const gmail = google.gmail({ version: 'v1', auth: token.access_token });
\`\`\`

### Testing Integration

\`\`\`bash
# 1. Start all services
pnpm dev

# 2. Get auth token from Supabase
# (Sign in via test-oauth.html)

# 3. Test API call
curl -X POST http://localhost:4003/chat \\
  -H "Authorization: Bearer <supabase-token>" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello"}'
\`\`\`
```

---

### Phase 2: Update Architecture Docs (2-3 hours)

#### 2.1 Rename `docs/architecture/ARCHITECTURE.md` → `FUTURE-ARCHITECTURE.md`

Add header:
```markdown
# Tide Architecture - Future Vision

> ⚠️ **Note:** This document describes our long-term architecture vision.
> For the current implementation, see [CURRENT-ARCHITECTURE.md](./CURRENT-ARCHITECTURE.md)

**This is where we're going, not where we are.**

## When We Build This
- Redis: When database queries are slow (>100ms p95)
- Kafka: When we have >10K events/second
- Pinecone: When pgvector is slow (>1M vectors)
- CDN: When users report latency issues
- Multi-region: When we have users globally

**For Alpha/Beta:** See CURRENT-ARCHITECTURE.md
```

#### 2.2 Create `docs/architecture/CURRENT-ARCHITECTURE.md`

**Content:**
```markdown
# Tide Architecture - Current Implementation

**Status:** Week 3 Alpha
**Last Updated:** October 7, 2025

---

## System Overview

\`\`\`
┌─────────────────────────────────────────────────┐
│           Mobile Applications                    │
│   ┌──────────────┐    ┌──────────────┐         │
│   │ iOS (Swift)  │    │Android (Kt)  │         │
│   │ + Supabase   │    │ + Supabase   │         │
│   └──────────────┘    └──────────────┘         │
└─────────────────┬───────────────────────────────┘
                  │
                  │ HTTPS + Supabase JWT
                  │
┌─────────────────▼───────────────────────────────┐
│            Gateway Service (4000)                │
│         Simple Express HTTP router               │
└─────────────────┬───────────────────────────────┘
                  │
     ┌────────────┼────────────┬──────────────┐
     │            │            │              │
┌────▼────┐  ┌───▼────┐  ┌───▼─────┐  ┌────▼─────┐
│   AI    │  │ Email  │  │Calendar │  │ Workflow │
│ Service │  │Service │  │ Service │  │  Service │
│  4003   │  │  4004  │  │  4005   │  │   4006   │
└────┬────┘  └───┬────┘  └───┬─────┘  └────┬─────┘
     │           │            │              │
     └───────────┴────────────┴──────────────┘
                  │
                  │ Supabase Client
                  │
┌─────────────────▼───────────────────────────────┐
│                Supabase                          │
│  ┌──────────────────────────────────────┐      │
│  │  PostgreSQL (12 tables + RLS)        │      │
│  ├──────────────────────────────────────┤      │
│  │  Auth (Google OAuth)                 │      │
│  ├──────────────────────────────────────┤      │
│  │  Realtime (WebSocket subscriptions)  │      │
│  ├──────────────────────────────────────┤      │
│  │  Storage (File uploads)              │      │
│  └──────────────────────────────────────┘      │
└──────────────────────────────────────────────────┘
\`\`\`

---

## Services

### AI Service ✅
- Multi-model router (OpenAI, Anthropic)
- 18 specialized agents
- Reasoning engine
- **Lines of Code:** ~3,500
- **Status:** Complete

### Email Service ✅
- Gmail API integration
- Triage, compose, automation
- **Lines of Code:** ~2,500
- **Status:** Complete

### Calendar Service ✅
- Google Calendar integration
- Smart scheduling, conflict resolution
- **Lines of Code:** ~2,600
- **Status:** Complete

### Workflow Service ✅
- Task orchestration
- Pattern detection
- **Lines of Code:** ~2,000
- **Status:** Complete

### Gateway Service ⏳
- HTTP routing to services
- **Status:** Minimal implementation
- **Needed:** Complete routing logic

---

## Data Architecture

### Database (Supabase PostgreSQL)

**12 Tables:**
1. `user_profiles` - User data
2. `oauth_tokens` - OAuth credentials
3. `conversations` - AI chat threads
4. `messages` - Chat messages
5. `calendar_events` - Synced events
6. `email_threads` - Email threads
7. `email_messages` - Individual emails
8. `workflows` - Workflow definitions
9. `tasks` - User tasks
10. `patterns` - Learned patterns
11. `analytics_events` - Usage tracking

**Row-Level Security:**
All tables have RLS policies - users can only access their own data.

### Authentication
- Supabase Auth (managed service)
- OAuth providers: Google (working), Microsoft (configured)
- JWT tokens (auto-generated, auto-refreshed)

### Realtime
- Supabase Realtime (managed WebSocket)
- Subscriptions on: conversations, messages, tasks, calendar_events

---

## Technology Stack

\`\`\`yaml
Frontend:
  iOS: Swift + SwiftUI + Supabase SDK
  Android: Kotlin + Jetpack Compose + Supabase SDK

Backend:
  Language: TypeScript (Node.js 20)
  Framework: Express
  Services: 5 microservices
  Packages: 8 shared packages (monorepo)

Data:
  Database: Supabase PostgreSQL 17
  Auth: Supabase Auth
  Realtime: Supabase Realtime
  Storage: Supabase Storage

External APIs:
  AI: OpenAI GPT-4, Anthropic Claude
  Email: Gmail API
  Calendar: Google Calendar API

Development:
  Monorepo: pnpm workspace
  Local: Docker Compose (optional)
  Testing: Vitest

Deployment (when ready):
  Backend: Railway
  Database: Supabase (hosted)
  Cost: $75-225/month (Alpha/Beta)
\`\`\`

---

## What We're NOT Using (Yet)

### Will Add When Needed
- **Redis:** When database is slow (not yet)
- **Kafka:** When event volume is high (not yet)
- **CDN:** When latency is an issue (not yet)
- **Monitoring:** When debugging is hard (using logs for now)

### Deliberately Skipping
- **Pinecone:** Using Supabase pgvector instead
- **GraphQL:** REST is simpler for now
- **AWS:** Supabase + Railway is simpler
- **Kubernetes:** Railway handles scaling

---

## Performance Targets

### Alpha (Current)
- Response time: <500ms p95
- Throughput: 10 requests/sec
- Users: 10-100

### Beta (Next)
- Response time: <300ms p95
- Throughput: 100 requests/sec
- Users: 100-1,000

### Production (Future)
- Response time: <100ms p95
- Throughput: 10,000 requests/sec
- Users: 10,000+
- *At this point, add Redis, Kafka, CDN*

---

## Migration Path

**Current → Scale:**

1. **At 100 users:** Add Redis for caching
2. **At 1,000 users:** Add Kafka for events
3. **At 5,000 users:** Add CDN for static assets
4. **At 10,000 users:** Multi-region deployment
5. **At 50,000 users:** Consider Kubernetes

**Don't build for scale problems you don't have yet.**

---

See [FUTURE-ARCHITECTURE.md](./FUTURE-ARCHITECTURE.md) for long-term vision.
```

#### 2.3 Create `docs/architecture/DECISIONS.md`

**Content:**
```markdown
# Architecture Decision Records

## ADR-001: Use Supabase Instead of Custom Auth/DB

**Date:** October 7, 2025
**Status:** Accepted ✅

### Context
Need authentication, database, and realtime for Alpha launch.

### Decision
Use Supabase instead of building custom auth + PostgreSQL + WebSocket server.

### Consequences
**Pros:**
- 75% less code to maintain
- OAuth works out of the box
- Auto-scaling database
- Free tier for Alpha

**Cons:**
- Vendor dependency (mitigated: Supabase is open source, can self-host)
- Less control over infrastructure

### Cost
- Alpha: $0 (free tier)
- Beta: $25/month (Pro tier)
- Production: $599/month (Team tier) at 10K users

**Savings vs DIY:** ~$1,500/month in infrastructure + $40K/year in developer time

---

## ADR-002: Skip Kafka for Alpha

**Date:** October 7, 2025
**Status:** Accepted ✅

### Context
Original plan had Kafka for event streaming. But we're at Alpha with <100 users.

### Decision
Use HTTP calls + Supabase Realtime for Alpha. Add Kafka later if needed.

### Rationale
- HTTP handles <1,000 requests/sec easily
- Kafka adds complexity (ZooKeeper, consumers, topics, schemas)
- No scale problem to solve yet

### When to Revisit
- At 10,000 events/second
- When we need replay capability
- When we need event sourcing

---

## ADR-003: Use pgvector Instead of Pinecone

**Date:** October 7, 2025
**Status:** Accepted ✅

### Context
Need vector search for semantic queries. Original plan: Pinecone.

### Decision
Use Supabase pgvector extension.

### Rationale
- Already have Supabase
- pgvector handles <1M vectors easily
- $0 cost vs $70-200/month for Pinecone
- Good enough for Alpha/Beta

### When to Revisit
- At >1M vectors
- When query latency >100ms
- When we need advanced filtering

---

## ADR-004: REST APIs for Alpha (Not GraphQL)

**Date:** October 7, 2025
**Status:** Accepted ✅

### Context
Original plan: GraphQL Federation. But it's complex to set up.

### Decision
Use REST APIs for Alpha. Consider GraphQL later.

### Rationale
- Simpler to implement
- Easier to debug
- Mobile apps don't need complex queries yet
- Can add GraphQL later without breaking REST

### When to Revisit
- When mobile apps make too many round trips
- When we need complex filtering/pagination
- When we want better type safety (or use tRPC)

---

## ADR-005: Deploy to Railway (Not AWS)

**Date:** October 7, 2025
**Status:** Accepted ✅

### Context
Original plan: AWS EKS (Kubernetes). But that's overkill for Alpha.

### Decision
Deploy to Railway for Alpha/Beta.

### Rationale
- $50-100/month vs $1,500/month for AWS
- Zero DevOps needed
- Git push to deploy
- Auto-scaling built-in
- Can migrate to AWS later if needed

### When to Revisit
- At 10,000+ concurrent users
- When we need multi-region
- When we have enterprise contracts requiring specific infrastructure
```

---

### Phase 3: Update Track Documents (2-3 hours)

#### 3.1 Create `docs/tracks/README.md`

**Content:**
```markdown
# Track Status Overview

**Last Updated:** October 7, 2025
**Current Phase:** Week 3 Alpha Integration

---

## Track Completion Status

| Track | Status | Progress | Next Steps |
|-------|--------|----------|------------|
| **Week 0: Foundation** | ✅ Complete | 100% | N/A |
| **Track 1: Mobile Apps** | ⏳ In Progress | 40% | Integrate Supabase SDK |
| **Track 2: AI Intelligence** | ✅ Complete | 100% | Deploy to Railway |
| **Track 3: Email & Calendar** | ✅ Complete | 100% | Deploy to Railway |
| **Track 4: Workflow** | ✅ Complete | 100% | Deploy to Railway |
| **Track 5: Backend Infra** | ✅ Complete | 100% | (Using Supabase) |
| **Track 6: Data Analytics** | ❌ Not Started | 0% | Defer to Beta |

---

## What's Built (COMPLETED.md)

### ✅ Services
- AI Service (4003): Multi-model, agents, reasoning
- Email Service (4004): Gmail integration, triage, compose
- Calendar Service (4005): Google Calendar, scheduling
- Workflow Service (4006): Task engine, patterns

### ✅ Infrastructure
- Supabase: Auth, database, realtime
- Database: 12 tables with RLS
- OAuth: Google (working), Microsoft (configured)

### ✅ Foundation
- 8 shared packages
- Development environment
- Testing infrastructure

---

## What's In Progress

### ⏳ Gateway Service
- **Status:** 30% complete
- **Missing:** Route requests to services
- **Timeline:** Week 4

### ⏳ Mobile Apps
- **iOS Status:** Structure ready, needs Supabase SDK
- **Android Status:** Structure ready, needs Supabase SDK
- **Timeline:** Weeks 4-5

---

## What's Deferred

### Later (Beta Phase)
- Data Analytics Service
- Advanced monitoring
- Performance optimization
- Multi-region deployment

### When Needed (Scale Issues)
- Redis (when DB is slow)
- Kafka (when event volume is high)
- CDN (when latency is high)
- GraphQL (when API complexity grows)

---

## Original Plans vs Reality

| Original Plan | Current Reality | Reason |
|---------------|-----------------|--------|
| Custom auth service | Supabase Auth | Faster, more secure |
| Custom database | Supabase PostgreSQL | Managed, auto-scaling |
| Custom realtime | Supabase Realtime | Built-in, reliable |
| Kafka event bus | HTTP + Realtime | No scale problem yet |
| Pinecone vectors | Supabase pgvector | Cheaper, simpler |
| GraphQL Federation | REST APIs | Simpler for Alpha |
| AWS EKS | Railway | Faster, cheaper |

**Conclusion:** We're building the same product with 70% less infrastructure code.
```

#### 3.2 Create `docs/tracks/COMPLETED.md`

**Summary of what's been built in detail**

#### 3.3 Update Each Track Document

For `track-01-mobile-apps.md`, `track-02-ai-intelligence.md`, etc:

**Add at top:**
```markdown
# Track XX: [Name]

> **Status Update (October 2025):**
> For current implementation status, see [README.md](./README.md) and [COMPLETED.md](./COMPLETED.md)
>
> This document contains original planning. Some details have changed:
> - Using Supabase instead of custom auth/db
> - Using Railway instead of AWS
> - Skipping Kafka, Redis, Pinecone for Alpha
>
> See `docs/current/` for actual implementation.
```

---

### Phase 4: Update Guides (1-2 hours)

#### 4.1 Create `docs/guides/GETTING-STARTED.md`

**New developer onboarding guide**

#### 4.2 Update `docs/guides/INTEGRATION-TESTING.md`

Remove references to unbuilt infrastructure (Kafka, Redis, etc.)

#### 4.3 Update `docs/guides/TESTING-GUIDE.md`

Focus on current testing setup (Vitest, Supabase, manual testing)

---

### Phase 5: Cleanup & Organization (30 minutes)

#### 5.1 Move Aspirational Content

```bash
# Move big vision docs to archive or future/
mv docs/architecture/ARCHITECTURE.md docs/architecture/FUTURE-ARCHITECTURE.md
# Add "FUTURE" disclaimer at top
```

#### 5.2 Create Navigation

**Update `docs/README.md`:**

```markdown
# Tide Documentation

## Start Here

### New Developers
1. [Getting Started](./guides/GETTING-STARTED.md)
2. [Current Stack](./current/STACK.md)
3. [Current Architecture](./architecture/CURRENT-ARCHITECTURE.md)

### Current Implementation
- [Tech Stack](./current/STACK.md)
- [Services](./current/SERVICES.md)
- [Deployment](./current/DEPLOYMENT.md)
- [Integration](./current/INTEGRATION.md)

### Planning
- [Track Status](./tracks/README.md)
- [Completed Work](./tracks/COMPLETED.md)
- [Architecture Decisions](./architecture/DECISIONS.md)

### Future Vision
- [Future Architecture](./architecture/FUTURE-ARCHITECTURE.md)
- [Scaling Plans](./future/SCALING.md)

### Product
- [Product README](./PRODUCT-README.md)
```

---

## Summary of Changes

### New Files (8)
```
docs/current/STACK.md
docs/current/SERVICES.md
docs/current/DEPLOYMENT.md
docs/current/INTEGRATION.md
docs/architecture/CURRENT-ARCHITECTURE.md
docs/architecture/DECISIONS.md
docs/tracks/README.md
docs/tracks/COMPLETED.md
```

### Renamed (1)
```
docs/architecture/ARCHITECTURE.md → FUTURE-ARCHITECTURE.md
```

### Updated (6)
```
docs/tracks/track-01-mobile-apps.md (add disclaimer)
docs/tracks/track-02-ai-intelligence.md (add disclaimer)
docs/tracks/track-03-email-calendar.md (add disclaimer)
docs/tracks/track-04-task-workflow.md (add disclaimer)
docs/tracks/track-05-backend-infrastructure.md (add disclaimer)
docs/guides/INTEGRATION-TESTING.md (remove unbuilt infra)
```

### Kept As-Is (4)
```
docs/PRODUCT-README.md (product vision OK)
docs/OAUTH-CONSOLIDATION.md (accurate)
docs/guides/FOUNDATION-COMPLETE.md (accurate)
docs/archive/* (archived, OK as historical)
```

---

## Timeline

- **Phase 1 (Create Current Docs):** 1-2 hours
- **Phase 2 (Architecture):** 2-3 hours
- **Phase 3 (Tracks):** 2-3 hours
- **Phase 4 (Guides):** 1-2 hours
- **Phase 5 (Cleanup):** 30 minutes

**Total:** 6-10 hours

---

## Success Criteria

After refactor, developers should:
- ✅ Know what's built vs what's planned
- ✅ Understand current tech stack (Supabase + services)
- ✅ Know how to run services locally
- ✅ Know how to deploy to Railway
- ✅ Understand why we chose Supabase over custom infra
- ✅ See the future vision without confusing it with current state

---

## Next Steps

1. Review this plan
2. Execute Phase 1 (create current docs)
3. Execute Phase 2 (update architecture)
4. Execute Phases 3-5 as time permits

**Priority:** Phase 1 & 2 (Current docs + Architecture) are most important.

**Optional:** Phases 3-5 can be done later.

---

**Ready to execute?**
