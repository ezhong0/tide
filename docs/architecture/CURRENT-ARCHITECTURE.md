# Tide Current Architecture (Week 3 Alpha)

**Status**: Week 3 Alpha - Foundation Complete
**Last Updated**: 2025-10-07
**Phase**: Supabase Migration Complete, Feature Development In Progress

> **Note**: This document describes the **actual current implementation** of the Tide system. For the future production-scale architecture, see [FUTURE-ARCHITECTURE.md](./FUTURE-ARCHITECTURE.md).

---

## Executive Summary

Tide is currently at **Week 3 Alpha** with a **hybrid architecture** that leverages Supabase for core infrastructure while building custom microservices for domain-specific features.

**What's Working**:
- ✅ OAuth authentication (Google, Microsoft) via Supabase Auth
- ✅ PostgreSQL 16 database with 11 tables and RLS policies
- ✅ Real-time subscriptions via Supabase Realtime
- ✅ Redis 7 and Kafka 7.5 infrastructure
- ✅ Mobile SDK integration (iOS/Android)

**What's In Progress**:
- 🚧 AI Service (40% complete - basic Claude integration)
- 🚧 Mobile UI (30% complete - SDK integrated, screens in progress)

**What's Planned**:
- ⏳ Email Service (Gmail/Outlook integration)
- ⏳ Calendar Service (Google/Microsoft Calendar)
- ⏳ Workflow Service (automation engine)
- ⏳ Gateway Service (API orchestration)

---

## Architectural Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├──────────────────────────┬──────────────────────────────────────┤
│  iOS App (SwiftUI)       │  Android App (Jetpack Compose)       │
│  - Supabase Swift SDK    │  - Supabase Kotlin SDK               │
│  - OAuth, DB, Realtime   │  - OAuth, DB, Realtime               │
└────────────┬─────────────┴─────────────┬────────────────────────┘
             │                           │
             └──────────┬────────────────┘
                        │
             ┌──────────▼──────────────────────────────┐
             │     SUPABASE PLATFORM (Managed)         │
             ├─────────────────────────────────────────┤
             │  • Auth (OAuth: Google, Microsoft)      │
             │  • Database (PostgreSQL 16)             │
             │  • Realtime (WebSocket subscriptions)   │
             │  • Storage (not yet used)               │
             └──────────┬──────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼────────┐  ┌──▼──────────┐  ┌▼──────────────┐
│  AI Service    │  │ Email Svc   │  │ Calendar Svc  │
│  (40% done)    │  │ (planned)   │  │ (planned)     │
│  • Claude API  │  │ • Gmail API │  │ • GCal API    │
│  • PostgreSQL  │  │ • Outlook   │  │ • MS Calendar │
└───────┬────────┘  └──┬──────────┘  └┬──────────────┘
        │              │               │
        └──────────────┼───────────────┘
                       │
        ┌──────────────▼──────────────────┐
        │   INFRASTRUCTURE LAYER          │
        ├─────────────────────────────────┤
        │  • Redis 7 (cache, rate limit)  │
        │  • Kafka 7.5 (event streaming)  │
        │  • Zookeeper (Kafka coord)      │
        └─────────────────────────────────┘
```

---

## Core Components

### 1. Supabase Platform ✅

**Status**: Production-ready, fully operational

**Components**:
- **Auth**: OAuth-only authentication (no email/password)
  - Google OAuth with Gmail + Calendar scopes
  - Microsoft OAuth with Outlook + Calendar scopes
  - JWT token management
  - Session persistence

- **Database**: PostgreSQL 16 (managed)
  - 11 tables with Row-Level Security (RLS)
  - Extensions: pgvector, pg_cron, pg_stat_statements
  - Automated daily backups

- **Realtime**: WebSocket subscriptions
  - PostgreSQL logical replication
  - Live message updates
  - Presence tracking

- **Storage**: File storage (not yet used)

**Access**:
- URL: `https://ozrocykjomgcuphicqpg.supabase.co`
- Dashboard: https://app.supabase.com

**Key Decision**: Replaced custom auth and realtime services with Supabase in Phase 2 to reduce complexity and improve reliability.

---

### 2. Database Schema (PostgreSQL 16) ✅

**Status**: Production-ready (11 tables)

**Schema**:

```sql
-- User Management
user_profiles (id, full_name, avatar_url, primary_provider, timezone, language, theme)
provider_tokens (id, user_id, provider, access_token, refresh_token, expires_at)

-- AI Intelligence
conversations (id, user_id, title, summary, message_count, last_message_at)
messages (id, conversation_id, role, content, tokens_used, model)

-- Email & Calendar
email_messages (id, user_id, provider, message_id, thread_id, subject, from, to, body, ...)
calendar_events (id, user_id, provider, event_id, title, start_time, end_time, ...)

-- Task & Workflow
tasks (id, user_id, title, description, status, priority, due_at, completed_at)
workflows (id, user_id, name, description, trigger_type, trigger_config, steps)
workflow_executions (id, workflow_id, status, started_at, completed_at, error)
workflow_steps (id, execution_id, step_index, status, input, output, error)
patterns (id, user_id, pattern_type, pattern_data, confidence_score)
```

**Row-Level Security (RLS)**:
- All tables enforce user-level data isolation
- Policies: `user_id = auth.uid()`
- Service role bypasses RLS for admin operations

**Extensions**:
- `pgvector` (installed, not yet used) - for AI embeddings and RAG
- `pg_cron` (installed, not yet used) - for scheduled jobs
- `pg_stat_statements` (installed) - for query performance monitoring

---

### 3. Mobile Applications 🚧

#### iOS App (30% Complete)

**Location**: `apps/mobile-ios/`
**Framework**: SwiftUI, Supabase Swift SDK

**Implemented**:
- ✅ Supabase SDK integration
- ✅ OAuth authentication (Google, Microsoft)
- ✅ Type-safe Swift models (UserProfile, Conversation, Message, etc.)
- ✅ Database queries via Postgrest
- ✅ Realtime subscriptions

**In Progress**:
- 🚧 UI screens (login, chat, profile)
- 🚧 Navigation (SwiftUI NavigationStack)
- 🚧 State management (@StateObject, @EnvironmentObject)

**Planned**:
- ⏳ Local caching with CoreData
- ⏳ Push notifications (APNs)
- ⏳ Background sync

**Key File**: `apps/mobile-ios/TideApp/Services/SupabaseManager.swift`

---

#### Android App (30% Complete)

**Location**: `apps/mobile-android/`
**Framework**: Jetpack Compose, Supabase Kotlin SDK, Hilt DI

**Implemented**:
- ✅ Supabase SDK integration
- ✅ OAuth authentication (Google, Microsoft)
- ✅ Serializable Kotlin models (UserProfile, Conversation, Message, etc.)
- ✅ Database queries via Postgrest
- ✅ Realtime subscriptions
- ✅ Hilt dependency injection
- ✅ SupabaseManager singleton

**In Progress**:
- 🚧 UI screens (login, chat, profile)
- 🚧 Navigation (Compose Navigation)
- 🚧 ViewModel architecture (MVVM)

**Planned**:
- ⏳ Local caching with Room
- ⏳ Push notifications (FCM)
- ⏳ Background sync with WorkManager

**Key File**: `apps/mobile-android/app/src/main/kotlin/ai/tide/app/services/SupabaseManager.kt:27` (SupabaseManager class)

---

### 4. AI Service 🚧

**Status**: 40% complete (basic Claude integration)

**Location**: `packages/services/ai/`
**Runtime**: Node.js 20
**Port**: 3001

**Implemented**:
- ✅ Claude API integration (Anthropic SDK)
- ✅ Conversation handling
- ✅ Message storage in PostgreSQL
- ✅ MockConversationService for testing
- ✅ Error handling with TideError

**In Progress**:
- 🚧 Multi-model routing (Claude, GPT-4, Gemini)
- 🚧 Context management (conversation history)
- 🚧 Token counting and cost tracking

**Planned**:
- ⏳ Agent swarm with Model Context Protocol (MCP)
- ⏳ RAG with pgvector for long-term memory
- ⏳ Prompt templates and versioning
- ⏳ Model fallback logic (if Claude unavailable)
- ⏳ Redis caching for hot conversations
- ⏳ Kafka event publishing (ai.requests, ai.responses)

**Dependencies**:
- PostgreSQL ✅
- Redis ✅ (infrastructure ready, not yet used)
- Kafka ✅ (infrastructure ready, not yet used)

**Environment**:
```env
ANTHROPIC_API_KEY=<claude_key>
OPENAI_API_KEY=<gpt4_key>
SUPABASE_URL=https://ozrocykjomgcuphicqpg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
REDIS_URL=redis://localhost:6379
KAFKA_BROKERS=localhost:9092
```

---

### 5. Email Service ⏳

**Status**: Not started (planned for Track 3, Weeks 6-9)

**Location**: `packages/services/email/` (not created)
**Runtime**: Node.js 20 (planned)
**Port**: 3002 (planned)

**Planned Features**:
- Gmail API integration (OAuth via Supabase)
- Outlook/Exchange integration (Microsoft Graph API)
- Email parsing and classification
- Intelligent triage with AI Service
- Thread management
- Search with pgvector embeddings

**Dependencies**:
- PostgreSQL ✅
- Kafka ✅
- AI Service 🚧 (for triage and classification)

---

### 6. Calendar Service ⏳

**Status**: Not started (planned for Track 3, Weeks 6-9)

**Location**: `packages/services/calendar/` (not created)
**Runtime**: Node.js 20 (planned)
**Port**: 3003 (planned)

**Planned Features**:
- Google Calendar API integration (OAuth via Supabase)
- Microsoft Calendar integration (Microsoft Graph API)
- Event CRUD operations
- Conflict detection
- Smart scheduling with AI Service
- Availability management

**Dependencies**:
- PostgreSQL ✅
- Kafka ✅
- AI Service 🚧 (for smart scheduling)

---

### 7. Workflow Service ⏳

**Status**: Not started (planned for Track 4, Weeks 9-12)

**Location**: `packages/services/workflow/` (not created)
**Runtime**: Node.js 20 (planned)
**Port**: 3004 (planned)

**Planned Features**:
- Workflow engine (state machine)
- DAG (Directed Acyclic Graph) execution
- Pattern detection (analyze user behavior)
- Conditional logic (if/then/else)
- Error handling and retries
- Workflow templates

**Dependencies**:
- PostgreSQL ✅
- Kafka ✅
- AI Service 🚧
- Email Service ⏳
- Calendar Service ⏳

---

### 8. Gateway Service ⏳

**Status**: Not started (planned for Track 5, Weeks 10-12)

**Location**: `packages/services/gateway/` (not created)
**Runtime**: Node.js 20 (planned)
**Port**: 3000 (planned)

**Planned Features**:
- API Gateway (REST + GraphQL Federation)
- Authentication middleware (JWT validation)
- Rate limiting (Redis-backed)
- Request routing to microservices
- Response caching
- API documentation (OpenAPI/Swagger)

**Dependencies**: All services

---

## Infrastructure Services

### Redis 7 ✅

**Status**: Production-ready
**Provider**: Railway-managed Redis
**Deployment**:
- **Local**: Docker Compose (optional) or Railway directly
- **Production**: Railway-managed Redis
**Port**: 6379 (local), Railway-provided URL (production)

**Current Use Cases**:
- Infrastructure ready, not yet used by services

**Planned Use Cases**:
- Session caching (hot conversations)
- Rate limiting (API requests per user)
- Hot data cache (<1ms queries)
- Pub/sub for service-to-service communication

**Start**:
- Local: `docker-compose up redis` (optional)
- Production: Railway dashboard → Add Redis plugin

---

### Apache Kafka 7.5 ✅

**Status**: Production-ready
**Provider**: Railway-managed Kafka
**Deployment**:
- **Local**: Docker Compose (optional) or Railway directly
- **Production**: Railway-managed Kafka
**Port**: 9092 (local), Railway-provided URL (production)

**Topics Defined**:
```
user.events          - User actions (login, logout, preferences)
ai.requests          - AI service requests
ai.responses         - AI service responses
email.received       - Incoming email events
email.sent           - Outgoing email events
calendar.events      - Calendar event changes
task.events          - Task lifecycle events (created, updated, completed)
workflow.events      - Workflow execution events
```

**Patterns**:
- **Event Sourcing**: Complete event log for audit and replay
- **Outbox Pattern**: Reliable event delivery (write to DB + Kafka atomically)

**Current Status**: Infrastructure ready, events not yet published

**Start**:
- Local: `docker-compose up kafka zookeeper` (optional)
- Production: Railway dashboard → Add Kafka plugin

---

## Data Flow

### Authentication Flow ✅

```
1. User opens iOS/Android app
   ↓
2. Tap "Sign in with Google" or "Sign in with Microsoft"
   ↓
3. Supabase Auth initiates OAuth flow
   ↓
4. User completes OAuth in browser
   ↓
5. Redirect back to app with auth code
   ↓
6. Supabase exchanges code for JWT token
   ↓
7. App stores token and session
   ↓
8. App queries user_profiles table (RLS enforced)
   ↓
9. User is authenticated and ready to use app
```

**Status**: ✅ Working (confirmed with user in `user_profiles` table)

---

### AI Conversation Flow 🚧

```
1. User sends message in mobile app
   ↓
2. App calls Supabase Postgrest API
   ↓
3. Message inserted into messages table
   ↓
4. Supabase Realtime broadcasts message
   ↓
5. AI Service (future) receives webhook/event
   ↓
6. AI Service calls Claude API
   ↓
7. AI Service stores response in messages table
   ↓
8. Supabase Realtime broadcasts AI response
   ↓
9. Mobile app receives real-time update
   ↓
10. User sees AI response in chat
```

**Status**: 🚧 Partial (steps 1-4, 9-10 working; steps 5-8 in progress)

---

### Email/Calendar Sync Flow ⏳

```
1. User connects Gmail/Outlook via OAuth
   ↓
2. Tokens stored in provider_tokens table
   ↓
3. Email Service polls Gmail/Outlook API
   ↓
4. New emails/events fetched
   ↓
5. Data stored in email_messages / calendar_events tables
   ↓
6. Events published to Kafka (email.received, calendar.events)
   ↓
7. AI Service consumes events for triage/classification
   ↓
8. Mobile app queries database for updates
   ↓
9. Real-time updates via Supabase Realtime
```

**Status**: ⏳ Planned for Track 3 (Weeks 6-9)

---

## Development Environment

### Local Setup

**Prerequisites**:
- Node.js 20
- Docker Desktop (optional - for local Redis/Kafka)
- Railway CLI (`npm install -g @railway/cli`) - for production deployment
- pnpm 9
- Supabase CLI
- Xcode 15 (for iOS)
- Android Studio (for Android)

**Start Development Environment**:
```bash
# 1. Start Docker services (Redis, Kafka)
docker-compose up -d

# 2. Load environment variables
set -a && source .env && set +a

# 3. Run database migrations
supabase db push

# 4. Start AI service (when ready)
pnpm --filter @tide/ai dev

# 5. Build mobile apps
cd apps/mobile-ios && xcodebuild
cd apps/mobile-android && ./gradlew build
```

**Or use the dev script**:
```bash
./scripts/dev-start.sh
```

---

### Testing

**Integration Tests**:
```bash
./scripts/test-week0-integration.sh
```

**What it tests**:
- PostgreSQL connection
- Redis connectivity
- Kafka topic creation
- Supabase Auth (OAuth flow simulation)
- Mock services (MockConversationService)

**Unit Tests**:
```bash
pnpm test
```

---

## Deployment

**Current**: Local development (Week 3 Alpha)
**Target**: Railway for simplified production deployment

**Deployment Architecture**:
- **Core Platform**: Supabase (Auth, Database, Realtime, Storage)
- **Infrastructure & Services**: Railway (Redis, Kafka, AI/Email/Calendar/Workflow/Gateway services)
- **Local Development**: Docker Compose (optional) or Railway directly

**Railway Deployment**:
```bash
# Deploy AI service
cd packages/services/ai
railway up

# View logs
railway logs --service ai

# Open dashboard
railway open
```

**Benefits of Railway**:
- ✅ Simple deployment (`railway up`)
- ✅ Managed Redis and Kafka (no Docker in production)
- ✅ Automatic scaling and monitoring
- ✅ One platform instead of 5+ cloud services
- ✅ 90% reduction in infrastructure complexity

See [docs/current/DEPLOYMENT.md](../current/DEPLOYMENT.md) for detailed deployment configuration and [ADR-011](./DECISIONS.md#adr-011-railway-for-simplified-deployment) for the decision rationale.

---

## Monitoring & Observability

**Current**:
- **Supabase Dashboard**: Database queries, auth users, API logs
- **Railway Dashboard**: Service logs, metrics, resource usage (production)
- **Docker Logs**: Local development debugging (`docker-compose logs -f`)
- Manual testing

**Railway Built-in Monitoring**:
- Service health checks
- CPU, memory, network metrics
- Real-time logs (`railway logs`)
- Deployment history and rollback

**Future Enhancements**:
- Sentry for error tracking (APM)
- Custom dashboards (optional)
- Alerting for critical issues

---

## Security

### Current Security Measures ✅

1. **Authentication**: OAuth-only (no passwords stored)
2. **Authorization**: Row-Level Security (RLS) in PostgreSQL
3. **Data Isolation**: User-specific data enforced by RLS
4. **Token Management**: JWT tokens via Supabase Auth
5. **HTTPS**: All external connections over HTTPS
6. **Secrets**: `.env` file (gitignored)

### Planned Security Enhancements ⏳

1. **Rate Limiting**: Redis-backed API rate limiting
2. **Encryption at Rest**: Database encryption (Supabase provides)
3. **Audit Logging**: Complete event log via Kafka
4. **Security Headers**: CORS, CSP, HSTS via Gateway
5. **Secret Management**: AWS Secrets Manager or HashiCorp Vault

---

## Performance

### Current Performance Characteristics

**Database**:
- **Latency**: <50ms (Supabase managed PostgreSQL)
- **Throughput**: Low (Alpha stage, few users)
- **Indexing**: Basic indexes on primary keys and foreign keys

**Redis** (when used):
- **Latency**: <1ms (local Docker)
- **Throughput**: >10k ops/sec (local)

**Mobile Apps**:
- **OAuth**: ~2-3 seconds (depends on Google/Microsoft)
- **Database Queries**: <100ms (via Supabase Postgrest)
- **Realtime**: <50ms (WebSocket latency)

### Planned Performance Optimizations ⏳

1. **Redis Caching**: Cache hot conversations and user context
2. **Database Indexing**: Add indexes for common query patterns
3. **Connection Pooling**: PgBouncer for database connections
4. **CDN**: CloudFront or Cloudflare for static assets
5. **Edge Functions**: Supabase Edge Functions for low-latency operations

---

## Scalability

### Current Scale

**Users**: <10 (Alpha testing)
**Conversations**: <100
**Messages**: <1000
**Events**: <10k

### Planned Scale (MVP at Week 12)

**Users**: 100-1000
**Conversations**: 10k-100k
**Messages**: 100k-1M
**Events**: 1M-10M

### Scaling Strategy

1. **Horizontal Scaling**: Deploy multiple instances of each service
2. **Database Scaling**: PostgreSQL read replicas
3. **Caching**: Redis for hot data
4. **Event Streaming**: Kafka for async communication
5. **Load Balancing**: Nginx or AWS ALB

See [FUTURE-ARCHITECTURE.md](./FUTURE-ARCHITECTURE.md) for production-scale design.

---

## Technology Stack Summary

| Component | Technology | Status |
|-----------|-----------|--------|
| **Auth** | Supabase Auth | ✅ Production-ready |
| **Database** | PostgreSQL 16 | ✅ Production-ready |
| **Realtime** | Supabase Realtime | ✅ Production-ready |
| **Cache** | Redis 7 | ✅ Ready (not used) |
| **Events** | Kafka 7.5 | ✅ Ready (not used) |
| **AI Service** | Node.js 20, Claude API | 🚧 40% complete |
| **Mobile (iOS)** | SwiftUI, Supabase Swift SDK | 🚧 30% complete |
| **Mobile (Android)** | Jetpack Compose, Supabase Kotlin SDK | 🚧 30% complete |
| **Email Service** | Node.js 20, Gmail/Outlook API | ⏳ Planned |
| **Calendar Service** | Node.js 20, Google/MS Calendar API | ⏳ Planned |
| **Workflow Service** | Node.js 20, State Machine | ⏳ Planned |
| **Gateway Service** | Node.js 20, GraphQL Federation | ⏳ Planned |

---

## Key Architectural Decisions

See [DECISIONS.md](./DECISIONS.md) for detailed architectural decision records (ADRs).

**Major Decisions**:

1. **Supabase for Infrastructure** (Phase 2):
   - Replaced custom auth and realtime services
   - Reduced complexity, improved reliability
   - Faster time to market

2. **OAuth-Only Authentication**:
   - No email/password authentication
   - Google and Microsoft OAuth only
   - Simpler, more secure

3. **Microservices for Domain Logic**:
   - Supabase for infrastructure
   - Custom services for AI, Email, Calendar, Workflow
   - Flexibility and scalability

4. **Event-Driven Architecture**:
   - Kafka for event streaming
   - Event sourcing for audit and replay
   - Outbox pattern for reliability

5. **Mobile-First Development**:
   - iOS and Android apps built in parallel
   - Native SDKs for best performance
   - Offline support with local caching (planned)

---

## Migration Path to Production

See [FUTURE-ARCHITECTURE.md](./FUTURE-ARCHITECTURE.md) for the target production architecture.

**Migration Steps** (Week 4-12):

1. **Week 4-5**: Complete AI Service (100%)
2. **Week 6-7**: Complete Mobile UI (100%)
3. **Week 8-9**: Implement Email/Calendar Services
4. **Week 10-11**: Implement Workflow Service
5. **Week 12**: Implement Gateway Service + MVP launch

**Post-MVP** (Week 13+):

- Migrate to production infrastructure (Supabase Pro, Confluent Cloud, Redis Cloud)
- Implement monitoring and observability
- Set up CI/CD pipeline
- Security audit and penetration testing
- Load testing and performance optimization
- Deploy to production

---

## Known Issues & Limitations

**Current Limitations**:

1. **AI Service Incomplete** (40%):
   - No multi-model routing
   - No RAG or long-term memory
   - No agent swarm
   - Limited error handling

2. **Mobile UI Not Complete** (30%):
   - Basic screens only
   - No offline support
   - No push notifications
   - No background sync

3. **No Email/Calendar Integration**:
   - Services not yet implemented
   - Planned for Weeks 6-9

4. **No Workflow Automation**:
   - Service not yet implemented
   - Planned for Weeks 9-12

5. **Redis and Kafka Unused**:
   - Infrastructure ready but not yet integrated into services

6. **No API Gateway**:
   - Direct service-to-service calls (mobile → Supabase)
   - Gateway planned for Weeks 10-12

**Known Bugs**:
- None reported (Alpha stage, limited testing)

---

## Next Steps

**Immediate (Week 4-5)**:
1. ✅ Complete docs/current/ documentation
2. 🚧 Complete AI Service → PostgreSQL integration
3. 🚧 Add AI Service → Redis caching
4. 🚧 Implement AI Service → Kafka event publishing
5. 🚧 Complete mobile UI screens (login, chat, profile)

**Short-term (Week 6-9)**:
1. ⏳ Implement Email Service (Gmail/Outlook)
2. ⏳ Implement Calendar Service (Google/Microsoft)
3. ⏳ Mobile ↔ Email/Calendar sync

**Mid-term (Week 10-12)**:
1. ⏳ Implement Workflow Service
2. ⏳ Implement Gateway Service
3. ⏳ MVP launch preparation

---

## References

- [Current Stack](../current/STACK.md) - Technology stack details
- [Current Services](../current/SERVICES.md) - Service status and implementation
- [Current Deployment](../current/DEPLOYMENT.md) - Deployment configuration
- [Current Integration](../current/INTEGRATION.md) - Integration status
- [Future Architecture](./FUTURE-ARCHITECTURE.md) - Production-scale target architecture
- [Implementation Roadmap](../archive/IMPLEMENTATION-ROADMAP.md) - 12-week development plan
- [Architectural Decisions](./DECISIONS.md) - ADRs and key decisions

---

**Last Updated**: 2025-10-07
**Version**: Week 3 Alpha
**Maintainer**: Tide Development Team
