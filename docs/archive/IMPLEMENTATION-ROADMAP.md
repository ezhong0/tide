# 🗺️ Tide Implementation Roadmap (2025 Revision)

**Status**: Week 3 Alpha - Railway Deployment Focus
**Last Updated**: 2025-10-07
**Timeline**: 12 weeks (Week 0 Foundation ✅ + Weeks 1-12 Feature Development 🚧)

> **🚀 REVISION NOTICE**: This roadmap reflects **actual implementation progress** as of Week 3 Alpha, with focus on Railway deployment, Track 3 completion, and approved architecture improvements (ADR-012, ADR-013, ADR-014).

---

## Executive Overview

Tide follows a **Railway-first, Supabase-powered** strategy with **4 parallel feature tracks** building on solid Week 0 infrastructure.

### Current Reality (Week 3 Alpha)

- **Foundation Complete** ✅ - Supabase (Auth, DB, Realtime) + Railway deployment configured
- **3 of 4 Tracks Alpha-Ready** ✅ - Mobile (65%), AI (75%), Workflow (80%)
- **1 Track Needs Work** ⚠️ - Email/Calendar (52%, needs 60% for Alpha)
- **Architecture Improvements Approved** 📋 - Cache invalidation, Mobile BFF, gRPC ready
- **Railway Deployment** 🚧 - Configuration complete, services deploying incrementally

**Critical Path**: Complete Track 3 (Email/Calendar) to 60%+ → Alpha Launch → Implement architecture improvements → Beta Launch

---

## Current Status (Week 3 Alpha)

### Week 0 Foundation: ✅ COMPLETE

**Infrastructure Delivered**:
- ✅ Supabase Auth (OAuth: Google, Microsoft)
- ✅ PostgreSQL 16 with 11 tables + RLS policies
- ✅ Supabase Realtime (WebSocket subscriptions)
- ✅ Redis 7 (caching, rate limiting)
- ✅ Kafka 7.5 (event streaming)
- ✅ Mobile SDK integration (iOS/Android)
- ✅ Docker Compose dev environment
- ✅ Database migrations applied

**Phase 2-3 Completed**:
- ✅ Migrated to Supabase Auth (replaced custom auth service)
- ✅ Migrated to Supabase Realtime (replaced custom realtime service)
- ✅ Removed Apollo GraphQL from mobile apps
- ✅ Integrated Supabase Swift SDK (iOS)
- ✅ Integrated Supabase Kotlin SDK (Android)

### Feature Tracks: 🚧 IN PROGRESS

**Track 1: Mobile Apps** - 30% complete
- ✅ SDK integration
- 🚧 UI screens
- ⏳ Offline support

**Track 2: AI Intelligence** - 40% complete
- ✅ Basic Claude integration
- 🚧 Multi-model routing
- ⏳ Agent swarm

**Track 3: Email & Calendar** - 0% planned
- ⏳ Gmail/Outlook integration
- ⏳ Calendar sync

**Track 4: Task & Workflow** - 0% planned
- ⏳ Workflow engine
- ⏳ Pattern detection

---

## Roadmap Structure

### The Two-Phase Approach

```
PHASE 1: WEEK 0 FOUNDATION (✅ COMPLETE)
┌─────────────────────────────────────────────┐
│  Infrastructure Layer (Tracks 5-6)          │
├─────────────────────────────────────────────┤
│  • Supabase (Auth, DB, Realtime, Storage)   │
│  • PostgreSQL 16 (11 tables, RLS, pgvector) │
│  • Redis 7 (cache, rate limiting, pub/sub)  │
│  • Kafka 7.5 (7 topics, event sourcing)     │
│  • Mobile SDKs (Supabase Swift/Kotlin)      │
│  • Docker Compose dev environment           │
└─────────────────────────────────────────────┘

PHASE 2: FEATURE TRACKS (🚧 WEEKS 1-12)
┌─────────────────────────────────────────────┐
│  4 Parallel Feature Tracks                  │
├─────────────────────────────────────────────┤
│  Track 1: Mobile Apps (iOS/Android)         │
│  Track 2: AI Intelligence Layer             │
│  Track 3: Email & Calendar Integration      │
│  Track 4: Task & Workflow Automation        │
└─────────────────────────────────────────────┘
```

---

## Timeline Overview

### Week 0: Foundation ✅ COMPLETE

**Objective**: Deliver complete backend infrastructure so feature tracks can start immediately

**Completed**:
- ✅ Supabase project setup
- ✅ PostgreSQL schema (11 tables)
- ✅ OAuth providers (Google, Microsoft)
- ✅ Redis and Kafka infrastructure
- ✅ Mobile SDK integration
- ✅ Development environment
- ✅ Integration tests

**Result**: Feature tracks can now build without waiting for infrastructure

---

### Weeks 1-3: Core Intelligence (✅ 50% COMPLETE)

**Objective**: Get AI working and mobile apps functional

**Track 1: Mobile Apps** (30% → 70%):
- ✅ Week 1: SDK integration, OAuth flow
- 🚧 Week 2: UI screens (login, chat, profile)
- ⏳ Week 3: Navigation, state management

**Track 2: AI Intelligence** (40% → 80%):
- ✅ Week 1: Claude API integration, conversation storage
- 🚧 Week 2: Multi-model routing, context management
- ⏳ Week 3: Token tracking, error handling

**Current Status**: Week 3 Alpha
- Supabase OAuth working
- Mobile SDKs integrated
- AI Service 40% complete

---

### Weeks 4-6: Feature Development

**Objective**: Complete AI Service, start Email/Calendar integration

**Track 1: Mobile Apps** (70% → 90%):
- Week 4: Complete core UI, offline caching
- Week 5: Push notifications, background sync
- Week 6: Polish, performance optimization

**Track 2: AI Intelligence** (80% → 100%):
- Week 4: RAG with pgvector, agent swarm foundation
- Week 5: Multi-agent coordination, MCP integration
- Week 6: Prompt templates, model fallback

**Track 3: Email & Calendar** (0% → 40%):
- Week 4: Gmail/Outlook OAuth, API integration
- Week 5: Email parsing, calendar sync
- Week 6: AI triage, smart scheduling

**Track 4: Task & Workflow** (0% → 20%):
- Week 4: Planning and design
- Week 5: Workflow engine foundation
- Week 6: Basic task CRUD

---

### Weeks 7-9: Integration & Completion

**Objective**: Complete Email/Calendar, integrate Workflow engine

**Track 1: Mobile Apps** (90% → 100%):
- Week 7-9: Email/Calendar UI, workflow UI, final polish

**Track 2: AI Intelligence** (100%):
- Week 7-9: Optimization, fine-tuning, testing

**Track 3: Email & Calendar** (40% → 100%):
- Week 7: Email search with embeddings
- Week 8: Thread management, calendar conflict detection
- Week 9: Integration with Workflow Service

**Track 4: Task & Workflow** (20% → 80%):
- Week 7: Workflow engine (state machine, DAG)
- Week 8: Pattern detection, workflow templates
- Week 9: Email/Calendar automation

---

### Weeks 10-12: Polish & Launch

**Objective**: API Gateway, full system integration, MVP launch

**All Tracks**:
- Week 10: Gateway Service (API orchestration, rate limiting)
- Week 11: End-to-end testing, performance optimization
- Week 12: Security audit, production deployment, MVP launch

**Gateway Service** (0% → 100%):
- Week 10: REST + GraphQL Federation
- Week 11: Rate limiting, caching, monitoring
- Week 12: Production configuration, load testing

---

## Architecture Improvements (Planned)

Based on architecture review in Week 3, we've approved **3 key improvements** to enhance performance and scalability while maintaining Railway-first simplicity:

### ADR-012: Event-Driven Cache Invalidation

**Timeline**: Week 4-5 (Email/Calendar Track)
**Impact**: Eliminates stale cache data

**Implementation**:
- Create `CacheInvalidationService` as Railway service
- Define Kafka topic `cache.invalidate` for invalidation events
- Implement tag-based cache keys (`user:{userId}`, `email:{emailId}`)
- Update Email/Calendar services to publish invalidation events

**Benefits**:
- ✅ Eliminates stale data (no more deleted emails showing up)
- ✅ Services don't manage cache complexity
- ✅ Event log provides audit trail
- ✅ Works with existing Railway Kafka infrastructure

**Reference**: [ADR-012](../architecture/DECISIONS.md#adr-012-event-driven-cache-invalidation)

---

### ADR-013: Mobile BFF Pattern

**Timeline**: Week 6-8 (Mobile Track)
**Impact**: 10x faster mobile screen loading, 76% reduction in data usage

**Implementation**:
- Create `MobileBFFService` as Railway service
- Implement `/mobile/v1/screen/{screenName}` endpoints
- Single endpoint aggregates 7-15 backend calls
- Add Redis caching with tag-based invalidation

**Current Problem**:
- Mobile apps make 7-15 separate API calls per screen
- 2-5 seconds loading time
- 500KB data usage per screen
- Poor UX with progressive loading and flickering

**Solution**:
- Single API call per screen (500ms vs. 5s)
- 118KB vs. 500KB (76% reduction)
- Instant screen loading
- Better battery life

**Reference**: [ADR-013](../architecture/DECISIONS.md#adr-013-mobile-bff-pattern)

---

### ADR-014: gRPC for Service-to-Service Communication

**Timeline**: Week 8-10 (AI Track)
**Impact**: 5-10x faster internal service calls, type safety, streaming support

**Implementation**:
- Define `.proto` files for AI Service API
- Generate TypeScript clients for Email/Calendar/Workflow services
- Update AI Service to expose gRPC API
- Update Email/Calendar/Workflow to use gRPC for AI calls

**Use Cases**:
- Email Service → AI Service (triage email)
- Workflow Service → AI Service (execute AI step)
- Calendar Service → AI Service (suggest meeting times)

**Benefits**:
- ✅ 5-10x faster than REST
- ✅ Type-safe generated clients
- ✅ 70% smaller payloads (Protobuf vs. JSON)
- ✅ Streaming for long AI operations

**Important**: gRPC is for **service-to-service only**, NOT mobile apps. Mobile apps continue using Supabase Realtime + REST.

**Reference**: [ADR-014](../architecture/DECISIONS.md#adr-014-grpc-for-service-to-service-communication)

---

### Rejected Improvements

We also evaluated and **rejected** these improvements as inappropriate for Railway-first architecture:

- **❌ Service Mesh** (Istio/Linkerd): Railway provides built-in health checks, load balancing, TLS
- **❌ CQRS Pattern**: Premature optimization for MVP scale (<100 users)
- **❌ Full Event Sourcing**: Kafka events already provide audit trail

**Reference**: [ADR-015](../architecture/DECISIONS.md#adr-015-reject-service-mesh-for-railway-environment), [ADR-016](../architecture/DECISIONS.md#adr-016-reject-cqrs-pattern-for-mvp)

---

## Track Details

### Track 1: Mobile Applications

**Objective**: Native iOS and Android apps with Supabase integration

**Weeks 1-3** (30% → 70%):
- ✅ Supabase SDK integration
- 🚧 OAuth authentication UI
- 🚧 Core screens (login, chat, profile, settings)
- ⏳ Navigation and state management

**Weeks 4-6** (70% → 90%):
- Local caching (CoreData/Room)
- Push notifications (APNs/FCM)
- Background sync
- Offline support

**Weeks 7-9** (90% → 100%):
- Email/Calendar UI
- Workflow UI
- Polish and animations
- Accessibility

**Dependencies**:
- Week 0 Foundation ✅
- AI Service (Track 2) 🚧
- Email/Calendar Service (Track 3) ⏳

**Team**: iOS Developer + Android Developer
**Priority**: High (user-facing)

---

### Track 2: AI Intelligence Layer

**Objective**: Multi-model AI with agent swarm and RAG

**Weeks 1-3** (40% → 80%):
- ✅ Claude API integration
- 🚧 Multi-model routing (Claude, GPT-4, Gemini)
- 🚧 Context management
- ⏳ Token tracking and cost optimization

**Weeks 4-6** (80% → 100%):
- RAG with pgvector
- Agent swarm with MCP
- Multi-agent coordination
- Prompt templates

**Weeks 7-9** (Optimization):
- Response caching (Redis)
- Event publishing (Kafka)
- Performance tuning
- Model fallback logic

**Dependencies**:
- Week 0 Foundation ✅
- PostgreSQL (pgvector) ✅
- Redis ✅ (not yet used)
- Kafka ✅ (not yet used)

**Team**: AI Engineer + Backend Engineer
**Priority**: High (core feature)

---

### Track 3: Email & Calendar Integration

**Objective**: Gmail/Outlook and Google/Microsoft Calendar integration with AI triage

**Weeks 4-6** (0% → 40%):
- Gmail/Outlook OAuth (via Supabase)
- Email API integration
- Calendar API integration
- Basic sync

**Weeks 7-9** (40% → 100%):
- Email parsing and classification
- AI-powered triage (call AI Service)
- Thread management
- Calendar conflict detection
- Smart scheduling

**Dependencies**:
- Week 0 Foundation ✅
- AI Service (Track 2) 🚧
- Mobile UI (Track 1) 🚧

**Team**: Backend Engineer + Integration Specialist
**Priority**: High (core feature)

---

### Track 4: Task & Workflow Automation

**Objective**: Workflow engine with pattern detection and automation

**Weeks 5-6** (0% → 20%):
- Planning and design
- Workflow engine foundation
- Basic task CRUD

**Weeks 7-9** (20% → 80%):
- State machine implementation
- DAG execution
- Pattern detection (analyze user behavior)
- Workflow templates
- Email/Calendar automation

**Weeks 10-12** (80% → 100%):
- Advanced workflows
- Conditional logic
- Error handling and retries
- Integration with all services

**Dependencies**:
- Week 0 Foundation ✅
- AI Service (Track 2) 🚧
- Email/Calendar Service (Track 3) ⏳

**Team**: Backend Engineer + Automation Specialist
**Priority**: Medium (enhances other features)

---

### Track 5-6: Backend Infrastructure & Data Platform

**Status**: ✅ COMPLETE (Delivered as Week 0 Foundation)

**What Was Delivered**:
- Supabase (Auth, Database, Realtime, Storage)
- PostgreSQL 16 (11 tables, RLS, pgvector, pg_cron)
- Redis 7 (cache, rate limiting, pub/sub)
- Kafka 7.5 (7 topics, event sourcing)
- Event-driven architecture (Kafka topics defined)
- Development environment (Docker Compose)
- Integration tests

**Original Plan**: 12-week parallel track
**Revised Plan**: Delivered upfront as Week 0 foundation
**Rationale**: Feature tracks need infrastructure to build on, so deliver it first

---

## Integration Milestones

### Week 3 (Current) ✅
- ✅ Supabase Auth working (OAuth confirmed)
- ✅ Mobile SDKs integrated
- ✅ AI Service basic integration
- ✅ PostgreSQL schema complete

### Week 6
- 🎯 AI Service 100% complete
- 🎯 Mobile UI 90% complete
- 🎯 Email/Calendar 40% complete

### Week 9
- 🎯 Email/Calendar 100% complete
- 🎯 Workflow Service 80% complete
- 🎯 Mobile UI 100% complete

### Week 12 (MVP Launch)
- 🎯 Gateway Service 100% complete
- 🎯 All services integrated
- 🎯 End-to-end testing complete
- 🎯 Production deployment

---

## Success Criteria

### Week 6 Milestone
- [ ] AI conversation working end-to-end (mobile → AI Service → response)
- [ ] Email/Calendar OAuth working
- [ ] Mobile UI 90% complete
- [ ] All integration tests passing

### Week 9 Milestone
- [ ] Email triage with AI working
- [ ] Calendar smart scheduling working
- [ ] Basic workflows executing
- [ ] Mobile app feature-complete

### Week 12 MVP Launch
- [ ] All 4 tracks 100% complete
- [ ] Gateway Service operational
- [ ] Security audit passed
- [ ] Load testing passed (1000 concurrent users)
- [ ] Production deployment successful
- [ ] Beta users onboarded

---

## Risk Mitigation

### Key Risks

1. **AI Service Complexity** (High Risk):
   - Multi-model routing
   - Agent coordination
   - Context management
   - **Mitigation**: Start simple (single model), add complexity incrementally

2. **Email/Calendar API Rate Limits** (Medium Risk):
   - Gmail API: 250 requests/second
   - Outlook API: varies by license
   - **Mitigation**: Implement caching, batch requests, queue processing

3. **Mobile Offline Support** (Medium Risk):
   - Data sync conflicts
   - Merge strategies
   - **Mitigation**: Use operational transform or CRDT

4. **Workflow Engine Complexity** (Medium Risk):
   - State machine edge cases
   - DAG cycles
   - **Mitigation**: Use battle-tested state machine library

### Contingency Plans

- **If AI Service delayed**: Ship with basic Claude integration only
- **If Email/Calendar delayed**: Ship with AI-only features first
- **If Workflow delayed**: Ship with manual task management

---

## Team Structure

### Recommended Team Composition

```
├── Mobile Team (2 engineers)
│   ├── iOS Developer (Swift, SwiftUI)
│   └── Android Developer (Kotlin, Compose)
│
├── Backend Team (3 engineers)
│   ├── AI Engineer (Python/TypeScript, ML)
│   ├── Backend Engineer (TypeScript, Microservices)
│   └── Integration Specialist (APIs, OAuth)
│
├── Infrastructure (1 engineer)
│   └── DevOps Engineer (Docker, Kubernetes, Supabase)
│
└── Product (1 person)
    └── Product Manager (Coordination, QA)

Total: 7 people
```

### Week 0 Foundation Team
- ✅ Solo developer delivered foundation in Week 0-3
- ✅ Supabase eliminated need for dedicated auth/realtime engineers
- ✅ Rapid prototyping with managed services

---

## Technology Stack Summary

### Week 0 Foundation (✅ Complete)
- Supabase (Auth, Database, Realtime, Storage)
- PostgreSQL 16 (managed by Supabase)
- Redis 7 (Docker → Redis Cloud)
- Kafka 7.5 (Docker → Confluent Cloud)
- Docker Compose

### Feature Tracks (🚧 In Progress)
- **Mobile**: SwiftUI (iOS), Jetpack Compose (Android)
- **AI**: Node.js 20, Claude API, OpenAI API, Gemini API
- **Email/Calendar**: Node.js 20, Gmail/Outlook APIs
- **Workflow**: Node.js 20, State machine, DAG execution
- **Gateway**: Node.js 20, GraphQL Federation, REST

---

## Next Steps (Week 4)

**Immediate Priorities**:
1. ✅ Complete documentation refactor (this file)
2. ✅ Architecture improvements approved (ADR-012, ADR-013, ADR-014)
3. 🚧 Complete AI Service → PostgreSQL integration
4. 🚧 Add AI Service → Redis caching
5. 🚧 Implement AI Service → Kafka event publishing
6. 🚧 Complete mobile UI screens (login, chat, profile)
7. ⏳ Start Email/Calendar Service planning
8. ⏳ Implement event-driven cache invalidation (ADR-012)

**Week 4 Goals**:
- AI Service 80% complete
- Mobile UI 70% complete
- Email/Calendar Service 20% complete
- Cache invalidation service deployed (ADR-012)

---

## References

- [Current Architecture](../architecture/CURRENT-ARCHITECTURE.md) - Week 3 Alpha implementation
- [Future Architecture](../architecture/FUTURE-ARCHITECTURE.md) - Production-scale target
- [Current Stack](../current/STACK.md) - Technology details
- [Current Services](../current/SERVICES.md) - Service status
- [Track 1: Mobile Apps](../tracks/track-01-mobile-apps.md)
- [Track 2: AI Intelligence](../tracks/track-02-ai-intelligence.md)
- [Track 3: Email & Calendar](../tracks/track-03-email-calendar.md)
- [Track 4: Task & Workflow](../tracks/track-04-task-workflow.md)
- [Track 5: Backend Infrastructure](../tracks/track-05-backend-infrastructure.md) - ✅ Complete
- [Track 6: Data & Analytics](../tracks/track-06-data-analytics.md) - ✅ Complete

---

**Last Updated**: 2025-10-07
**Current Phase**: Week 3 Alpha - Foundation Complete, Feature Development In Progress
**Next Milestone**: Week 6 - AI Service 100%, Mobile UI 90%, Email/Calendar 40%
