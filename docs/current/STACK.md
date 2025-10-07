# Current Technology Stack

**Status**: Week 3 Alpha - Foundation Complete
**Last Updated**: 2025-10-07

This document describes the **actual technology stack** currently implemented in the Tide system. For future production-scale architecture, see `docs/architecture/FUTURE-ARCHITECTURE.md`.

---

## Authentication & Authorization

### Supabase Auth ✅
- **Status**: Production-ready, OAuth working
- **Implementation**: OAuth-only authentication (Google, Microsoft)
- **Features**:
  - Google OAuth with Gmail + Calendar scopes
  - Microsoft OAuth with Outlook + Calendar scopes
  - Session management with JWT tokens
  - Row-level security (RLS) policies
- **SDK Integration**:
  - iOS: Supabase Swift SDK
  - Android: Supabase Kotlin SDK
- **Migration**: Replaced custom auth service in Phase 2

---

## Database & Storage

### PostgreSQL 16 ✅
- **Status**: Production-ready
- **Provider**: Supabase Managed PostgreSQL
- **Schema**: 11 tables with RLS policies
- **Extensions**:
  - `pgvector` for embeddings (installed)
  - `pg_cron` for scheduled jobs
  - `pg_stat_statements` for performance monitoring
- **Tables**:
  ```
  user_profiles, provider_tokens, conversations, messages,
  calendar_events, email_messages, tasks, workflows,
  workflow_executions, workflow_steps, patterns
  ```

### Redis 7 ✅
- **Status**: Production-ready
- **Provider**: Railway-managed Redis
- **Use Cases**:
  - Session cache
  - Rate limiting
  - Hot data cache (<1ms queries)
  - Pub/sub for real-time features
- **Deployment**:
  - **Local**: Docker Compose (optional, can use Railway directly)
  - **Production**: Railway-managed Redis

---

## Event Streaming

### Apache Kafka 7.5 ✅
- **Status**: Production-ready
- **Provider**: Railway-managed Kafka
- **Topics Defined**:
  - `user.events` - User actions
  - `ai.requests`, `ai.responses` - AI operations
  - `email.received`, `email.sent` - Email events
  - `calendar.events` - Calendar updates
  - `task.events` - Task lifecycle
  - `workflow.events` - Workflow execution
- **Patterns**:
  - Event sourcing with complete event log
  - Outbox pattern for reliable delivery
- **Deployment**:
  - **Local**: Docker Compose (optional, can use Railway directly)
  - **Production**: Railway-managed Kafka

---

## Real-time Communication

### Supabase Realtime ✅
- **Status**: Production-ready
- **Implementation**: PostgreSQL logical replication via WebSocket
- **Features**:
  - Real-time database subscriptions
  - Presence tracking
  - Broadcast channels
- **Use Cases**:
  - Live message updates in conversations
  - Real-time task status changes
  - Calendar event synchronization
- **SDK Integration**:
  - iOS: Built-in Swift SDK support
  - Android: Built-in Kotlin SDK support
- **Migration**: Replaced custom realtime service in Phase 2

---

## AI Services

### Claude AI Integration 🚧 40%
- **Status**: In Development
- **Current**:
  - Basic Claude API integration
  - Simple conversation handling
  - Mock implementations for testing
- **Planned**:
  - Multi-model routing (Claude, GPT-4, Gemini)
  - Agent swarm with MCP
  - RAG with pgvector
  - Context management

---

## Mobile SDKs

### iOS ✅ SDK Integrated
- **Framework**: Supabase Swift SDK
- **Features**:
  - OAuth authentication
  - PostgreSQL queries via Postgrest
  - Realtime subscriptions
  - Type-safe Swift models
- **Status**: SDK integrated, UI in progress

### Android ✅ SDK Integrated
- **Framework**: Supabase Kotlin SDK
- **Features**:
  - OAuth authentication
  - PostgreSQL queries via Postgrest
  - Realtime subscriptions
  - Serializable Kotlin data classes
- **Implementation**: `SupabaseManager.kt` with Hilt DI
- **Status**: SDK integrated, UI in progress

---

## Backend Services

### Current Architecture: Supabase + Railway Microservices
- **Supabase**: Auth, Database, Realtime, Storage (managed platform)
- **Railway**: All custom services deployed on Railway
  - **AI Service**: 40% complete (basic Claude integration)
  - **Email Service**: 0% (planned)
  - **Calendar Service**: 0% (planned)
  - **Workflow Service**: 0% (planned)
  - **Gateway Service**: 0% (planned)

### Deployment Platform: Railway
- **Development**: Local Node.js services
- **Production**: Railway-deployed microservices
- **Benefits**:
  - Simple deployment (`railway up`)
  - Managed Redis and Kafka
  - Automatic scaling
  - Built-in monitoring
  - GitHub integration for CI/CD

### Future Architecture: Production-Scale
See `docs/architecture/FUTURE-ARCHITECTURE.md` for production-scale design.

---

## Development Tools

### Local Development ✅
- **Docker Compose**: Redis, Kafka, Zookeeper
- **Supabase CLI**: Database migrations, local testing
- **Environment**: `.env` with Supabase credentials
- **Scripts**:
  - `scripts/dev-start.sh` - Start development environment
  - `scripts/test-week0-integration.sh` - Integration tests

### Package Manager ✅
- **pnpm**: Monorepo workspace management
- **Workspaces**:
  - `apps/*` - Mobile applications
  - `packages/services/*` - Backend services
  - `packages/libraries/*` - Shared libraries
  - `packages/shared/*` - Shared packages

---

## Testing Infrastructure

### Current Testing
- **Unit Tests**: Jest for TypeScript services
- **Integration Tests**: Week 0 foundation tests
- **Mock Services**: MockConversationService, MockPatternService
- **E2E Tests**: Planned (not yet implemented)

---

## Monitoring & Observability

### Current Monitoring
- **Supabase Dashboard**: Database queries, auth users, API logs
- **Railway Dashboard**: Service metrics, logs, resource usage
- **Docker Logs**: Local development debugging

### Future Enhancements
- **APM**: Sentry for error tracking
- **Logs**: Centralized logging with Railway logs
- **Metrics**: Railway built-in metrics + custom dashboards

**Status**: Railway provides built-in monitoring for all services

---

## Summary

**Production-Ready Components** (Week 0 Foundation):
- ✅ Supabase Auth (OAuth with Google/Microsoft)
- ✅ PostgreSQL 16 with 11 tables + RLS
- ✅ Redis 7 for caching
- ✅ Kafka 7.5 for event streaming
- ✅ Supabase Realtime for WebSocket
- ✅ Mobile SDK integration (iOS/Android)

**In Development** (Feature Tracks):
- 🚧 AI Service (40% - basic Claude integration)
- 🚧 Mobile UI (SDK integrated, screens in progress)
- ⏳ Email Service (0%)
- ⏳ Calendar Service (0%)
- ⏳ Workflow Service (0%)

**Timeline**: Week 3 Alpha → Week 12 MVP
