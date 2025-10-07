# Architectural Decision Records (ADRs)

**Last Updated**: 2025-10-07
**Status**: Week 3 Alpha

This document records significant architectural decisions made during the development of Tide. Each decision is documented with context, rationale, and consequences.

---

## Table of Contents

1. [ADR-001: Supabase-First Architecture](#adr-001-supabase-first-architecture)
2. [ADR-002: OAuth-Only Authentication](#adr-002-oauth-only-authentication)
3. [ADR-003: Week 0 Foundation-First Approach](#adr-003-week-0-foundation-first-approach)
4. [ADR-004: Microservices for Domain Logic](#adr-004-microservices-for-domain-logic)
5. [ADR-005: Event-Driven Architecture with Kafka](#adr-005-event-driven-architecture-with-kafka)
6. [ADR-006: Mobile-First Development Strategy](#adr-006-mobile-first-development-strategy)
7. [ADR-007: PostgreSQL with pgvector for Embeddings](#adr-007-postgresql-with-pgvector-for-embeddings)
8. [ADR-008: Remove Apollo GraphQL from Mobile Apps](#adr-008-remove-apollo-graphql-from-mobile-apps)
9. [ADR-009: Supabase Realtime for WebSocket](#adr-009-supabase-realtime-for-websocket)
10. [ADR-010: Redis and Kafka via Docker Compose](#adr-010-redis-and-kafka-via-docker-compose)
11. [ADR-011: Railway for Simplified Deployment](#adr-011-railway-for-simplified-deployment)
12. [ADR-012: Event-Driven Cache Invalidation](#adr-012-event-driven-cache-invalidation)
13. [ADR-013: Mobile BFF Pattern](#adr-013-mobile-bff-pattern)
14. [ADR-014: gRPC for Service-to-Service Communication](#adr-014-grpc-for-service-to-service-communication)
15. [ADR-015: Reject Service Mesh for Railway Environment](#adr-015-reject-service-mesh-for-railway-environment)
16. [ADR-016: Reject CQRS Pattern for MVP](#adr-016-reject-cqrs-pattern-for-mvp)

---

## ADR-001: Supabase-First Architecture

**Status**: ✅ Accepted (Phase 2)
**Date**: Week 2 (Phase 2 Migration)
**Decision Makers**: Development Team
**Impact**: High - Replaced custom auth and realtime services

### Context

We initially built custom authentication and realtime services as separate microservices. However, this approach had several issues:
- Increased operational complexity (3 services to maintain)
- Need to implement OAuth flows from scratch
- Custom WebSocket infrastructure with reliability concerns
- Slower development velocity due to infrastructure work

Supabase offers managed Auth, Database, Realtime, and Storage services that could replace our custom infrastructure.

### Decision

**We will adopt a Supabase-first architecture** where:
1. **Supabase Auth** handles all authentication (OAuth with Google, Microsoft)
2. **Supabase Database** (PostgreSQL 16) is our primary database
3. **Supabase Realtime** handles WebSocket subscriptions
4. **Supabase Storage** handles file uploads (future)
5. Custom services (AI, Email, Calendar, Workflow) focus on domain logic only

### Rationale

1. **Faster Development**: Eliminate months of infrastructure work
2. **Better Reliability**: Supabase has 99.9% uptime SLA with automated failover
3. **Reduced Complexity**: 1 managed platform vs. 3+ custom services
4. **OAuth Built-In**: Google, Microsoft, Apple OAuth with token refresh
5. **Real-time Built-In**: PostgreSQL logical replication via WebSocket
6. **Cost-Effective**: Free tier for development, predictable pricing for production

### Consequences

**Positive**:
- ✅ Reduced infrastructure code by ~50%
- ✅ OAuth working in Week 2 instead of Week 6
- ✅ Built-in database migrations and backups
- ✅ Row-Level Security (RLS) for data isolation
- ✅ Automatic API generation (Postgrest)
- ✅ Real-time subscriptions without custom WebSocket code

**Negative**:
- ⚠️ Vendor lock-in to Supabase (mitigated: Supabase is open-source, self-hostable)
- ⚠️ Less control over infrastructure (acceptable trade-off for speed)
- ⚠️ Need to learn Supabase-specific patterns (RLS, Postgrest API)

**Migration Path**:
- Phase 2: Migrate auth and realtime services to Supabase
- Phase 3: Integrate mobile apps with Supabase SDKs
- Archive old services to `packages/services/*-archived/`

### References

- [Supabase Documentation](https://supabase.com/docs)
- [Current Architecture](./CURRENT-ARCHITECTURE.md)
- [Phase 2-3 Completion Report](../../PHASE-2-3-COMPLETE.md)

---

## ADR-002: OAuth-Only Authentication

**Status**: ✅ Accepted (Week 0)
**Date**: Week 0 Foundation
**Decision Makers**: Development Team
**Impact**: High - No email/password authentication

### Context

Traditional authentication systems support email/password, OAuth, and sometimes magic links. This increases complexity:
- Password storage (hashing, salting, rotation)
- Password reset flows
- Email verification
- Account recovery mechanisms
- Security risks (weak passwords, credential stuffing)

Our target users (executives, professionals) already have Google or Microsoft accounts.

### Decision

**We will support OAuth-only authentication** with:
1. Google OAuth (Gmail + Google Calendar scopes)
2. Microsoft OAuth (Outlook + Microsoft Calendar scopes)
3. **No email/password authentication**
4. **No magic links**

### Rationale

1. **Security**: No password storage = no password breaches
2. **UX**: One-click sign-in with existing accounts
3. **Simplicity**: ~70% less auth code
4. **Trust**: Users trust Google/Microsoft more than new apps
5. **Scope Access**: OAuth gives us email/calendar permissions in one flow

### Consequences

**Positive**:
- ✅ Simpler codebase (no password management)
- ✅ Better security (no passwords to steal)
- ✅ Faster onboarding (one-click sign-in)
- ✅ Email/Calendar access included in OAuth
- ✅ No GDPR concerns with password storage

**Negative**:
- ⚠️ Users without Google/Microsoft accounts cannot sign up (rare for target market)
- ⚠️ Dependent on OAuth provider availability

**Implementation Notes**:
- Supabase Auth handles OAuth flows
- Tokens stored in `provider_tokens` table
- Refresh tokens automatically rotated
- RLS policies use `auth.uid()` for data isolation

### References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [OAuth 2.0 Specification](https://oauth.net/2/)

---

## ADR-003: Week 0 Foundation-First Approach

**Status**: ✅ Accepted (Week 0)
**Date**: Week 0 Planning
**Decision Makers**: Development Team
**Impact**: High - Changed from 6 parallel tracks to foundation + 4 feature tracks

### Context

Original plan had **6 parallel tracks** starting simultaneously:
1. Mobile Apps
2. AI Intelligence
3. Email/Calendar
4. Task/Workflow
5. Backend Infrastructure
6. Data Platform

This approach had coordination overhead - feature tracks would be blocked waiting for infrastructure.

### Decision

**We will deliver Tracks 5-6 (Backend + Data) as Week 0 Foundation** before starting feature tracks:

**Phase 1: Week 0 Foundation**
- Supabase setup (Auth, Database, Realtime)
- PostgreSQL schema (11 tables)
- Redis and Kafka infrastructure
- Mobile SDK integration
- Docker Compose dev environment

**Phase 2: 4 Feature Tracks** (Weeks 1-12)
- Track 1: Mobile Apps
- Track 2: AI Intelligence
- Track 3: Email/Calendar
- Track 4: Task/Workflow

### Rationale

1. **Unblock Feature Tracks**: Infrastructure ready from day 1
2. **Parallel Development**: Feature tracks can work independently
3. **Faster Velocity**: No waiting for infrastructure PRs
4. **Better Testing**: Foundation tested before feature work starts
5. **Clearer Ownership**: Infrastructure complete, feature tracks own business logic

### Consequences

**Positive**:
- ✅ Feature tracks unblocked from Week 1
- ✅ Reduced coordination overhead
- ✅ Infrastructure tested and stable
- ✅ Clear separation of concerns
- ✅ Solo developer delivered foundation in 3 weeks

**Negative**:
- ⚠️ 3-week delay before feature development (acceptable for stability)
- ⚠️ Infrastructure changes require migration (rare)

**Metrics**:
- Week 0 completion: 3 weeks
- Feature tracks unblocked: Week 1
- Current status (Week 3): Track 1 at 30%, Track 2 at 40%

### References

- [Implementation Roadmap](../../archive/IMPLEMENTATION-ROADMAP.md)
- [Current Architecture](./CURRENT-ARCHITECTURE.md)

---

## ADR-004: Microservices for Domain Logic

**Status**: ✅ Accepted (Week 0)
**Date**: Week 0 Foundation
**Decision Makers**: Development Team
**Impact**: Medium - Service architecture pattern

### Context

We need to decide between:
1. **Monolith**: Single application with all features
2. **Microservices**: Separate services for AI, Email, Calendar, Workflow
3. **Modular Monolith**: Single deployment with modular code

### Decision

**We will use microservices for domain logic** with:
- **AI Service**: Claude integration, multi-model routing, agent swarm
- **Email Service**: Gmail/Outlook integration, parsing, triage
- **Calendar Service**: Google/Microsoft Calendar, scheduling
- **Workflow Service**: State machine, pattern detection, automation
- **Gateway Service**: API orchestration, rate limiting, GraphQL Federation

### Rationale

1. **Independent Scaling**: AI service can scale separately from Email
2. **Technology Freedom**: Different services can use different tech (Python for AI, TypeScript for Email)
3. **Team Autonomy**: Teams can own services independently
4. **Failure Isolation**: AI failure doesn't break Email
5. **Deployment Flexibility**: Deploy services independently

### Consequences

**Positive**:
- ✅ Independent scaling and deployment
- ✅ Technology freedom per service
- ✅ Clear service boundaries
- ✅ Team autonomy

**Negative**:
- ⚠️ Increased operational complexity
- ⚠️ Need service mesh or API gateway
- ⚠️ More difficult debugging (distributed tracing needed)

**Implementation Notes**:
- All services communicate via Kafka (event-driven)
- Supabase provides shared data layer
- Gateway Service handles API orchestration (Week 10-12)

### References

- [Current Services](../current/SERVICES.md)
- [Microservices Architecture](./FUTURE-ARCHITECTURE.md#microservices)

---

## ADR-005: Event-Driven Architecture with Kafka

**Status**: ✅ Accepted (Week 0)
**Date**: Week 0 Foundation
**Decision Makers**: Development Team
**Impact**: High - Inter-service communication pattern

### Context

Microservices need to communicate. Options:
1. **Synchronous REST**: Direct HTTP calls between services
2. **GraphQL Federation**: Services expose GraphQL, gateway stitches
3. **Event-Driven (Kafka)**: Services publish events, others subscribe
4. **Hybrid**: Events for async, REST for sync

### Decision

**We will use event-driven architecture with Apache Kafka** as the primary communication pattern:

**Kafka Topics**:
- `user.events` - User actions (login, logout, preferences)
- `ai.requests`, `ai.responses` - AI operations
- `email.received`, `email.sent` - Email events
- `calendar.events` - Calendar updates
- `task.events` - Task lifecycle
- `workflow.events` - Workflow execution

**Pattern**: Services publish events to Kafka, other services subscribe and react.

### Rationale

1. **Decoupling**: Services don't need to know about each other
2. **Async Processing**: Email triage doesn't block email receipt
3. **Event Sourcing**: Complete audit log of all events
4. **Scalability**: Consumers can scale independently
5. **Reliability**: Kafka guarantees message delivery (at-least-once)

### Consequences

**Positive**:
- ✅ Loose coupling between services
- ✅ Complete event log for debugging and replay
- ✅ Async processing for better performance
- ✅ Easy to add new consumers

**Negative**:
- ⚠️ Eventual consistency (not immediate)
- ⚠️ More complex than direct REST calls
- ⚠️ Kafka operational overhead (mitigated: Railway-managed Kafka for production)

**Implementation Notes**:
- Development: Kafka 7.5 via Docker Compose (optional)
- Production: Railway-managed Kafka (see ADR-011)
- Outbox pattern for reliable event publishing

### References

- [Kafka Topics](../current/STACK.md#apache-kafka-75)
- [Event Integration](../current/INTEGRATION.md#event-bus-integration-kafka)

---

## ADR-006: Mobile-First Development Strategy

**Status**: ✅ Accepted (Week 0)
**Date**: Week 0 Foundation
**Decision Makers**: Development Team
**Impact**: High - Development prioritization

### Context

We need to decide on the initial focus:
1. **Backend-First**: Build all services, then mobile apps
2. **Web-First**: Build web app, mobile apps later
3. **Mobile-First**: Build iOS/Android apps first, web later

### Decision

**We will build mobile-first** (iOS and Android) with:
- Native apps using SwiftUI (iOS) and Jetpack Compose (Android)
- Supabase SDKs for backend integration
- No web app in MVP (can add later)

### Rationale

1. **Target Market**: Executives use mobile devices constantly
2. **Competitive Advantage**: Mobile AI assistants are underserved
3. **App Store Distribution**: Easier discovery and trust
4. **Native Performance**: Better than web or hybrid
5. **Push Notifications**: Critical for AI assistant

### Consequences

**Positive**:
- ✅ Better UX on mobile devices
- ✅ Native performance and integrations
- ✅ App Store credibility
- ✅ Push notifications for real-time updates

**Negative**:
- ⚠️ No web interface in MVP (can add later)
- ⚠️ Need to build iOS and Android separately
- ⚠️ App Store review process

**Implementation Notes**:
- iOS: SwiftUI, Supabase Swift SDK
- Android: Jetpack Compose, Supabase Kotlin SDK, Hilt DI
- Both apps share same backend (Supabase)

### References

- [Track 1: Mobile Apps](../tracks/track-01-mobile-apps.md)
- [Current Services](../current/SERVICES.md#mobile-applications)

---

## ADR-007: PostgreSQL with pgvector for Embeddings

**Status**: ✅ Accepted (Week 0)
**Date**: Week 0 Foundation
**Decision Makers**: Development Team
**Impact**: Medium - AI/ML architecture

### Context

AI features require vector embeddings for semantic search and RAG. Options:
1. **Pinecone**: Dedicated vector database (SaaS)
2. **Weaviate**: Open-source vector database
3. **pgvector**: PostgreSQL extension for vectors
4. **Separate storage**: Store vectors in different system

### Decision

**We will use pgvector (PostgreSQL extension)** for vector embeddings:
- pgvector extension enabled in Supabase PostgreSQL
- Vectors stored alongside transactional data
- Pinecone reserved for production-scale (future)

### Rationale

1. **Simplicity**: One database for all data (transactional + vectors)
2. **Cost-Effective**: No separate vector DB needed for MVP
3. **Good Enough**: pgvector handles 1M vectors efficiently
4. **Easy Queries**: Join vectors with transactional data
5. **Supabase Support**: pgvector pre-installed in Supabase

### Consequences

**Positive**:
- ✅ Simpler architecture (one database)
- ✅ Lower costs (no separate vector DB)
- ✅ Easier queries (join vectors with data)
- ✅ Fast enough for MVP scale

**Negative**:
- ⚠️ Not as fast as dedicated vector DB (acceptable for MVP)
- ⚠️ May need to migrate to Pinecone at scale (100M+ vectors)

**Migration Path**:
- MVP: pgvector in Supabase PostgreSQL
- Production-scale: Migrate to Pinecone when >10M vectors
- Keep PostgreSQL for transactional data

### References

- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Current Stack](../current/STACK.md#postgresql-16)

---

## ADR-008: Remove Apollo GraphQL from Mobile Apps

**Status**: ✅ Accepted (Phase 3)
**Date**: Week 3 (Phase 3 Migration)
**Decision Makers**: Development Team
**Impact**: Medium - Mobile app data fetching

### Context

Initially, mobile apps used Apollo GraphQL to fetch data from backend. After migrating to Supabase, we have two options:
1. **Keep Apollo GraphQL**: Create GraphQL gateway on top of Supabase
2. **Use Supabase Postgrest**: Native Supabase REST API

### Decision

**We will remove Apollo GraphQL from mobile apps** and use Supabase SDK directly:
- iOS: Supabase Swift SDK with Postgrest
- Android: Supabase Kotlin SDK with Postgrest
- GraphQL Federation reserved for API Gateway (Week 10-12)

### Rationale

1. **Simplicity**: No need for GraphQL gateway layer
2. **Type Safety**: Supabase SDKs provide type-safe queries
3. **Real-time Built-In**: Supabase Realtime works seamlessly
4. **Better Performance**: Direct PostgreSQL queries via Postgrest
5. **Less Code**: Remove Apollo client, schema generation, cache management

### Consequences

**Positive**:
- ✅ Simpler mobile app architecture
- ✅ Removed ~1000 lines of GraphQL code
- ✅ Better real-time integration
- ✅ Type-safe Swift/Kotlin models

**Negative**:
- ⚠️ No GraphQL benefits (over-fetching prevention, query flexibility)
- ⚠️ Separate REST endpoints for each entity (acceptable with Postgrest)

**Implementation Notes**:
- Removed: `apollo-ios`, `apollo-android`, `schema.graphqls`
- Added: Supabase Swift SDK, Supabase Kotlin SDK
- RLS policies ensure data security

### References

- [Phase 3 Completion](../../PHASE-2-3-COMPLETE.md)
- [Mobile Integration](../current/INTEGRATION.md#mobile--supabase-integration)

---

## ADR-009: Supabase Realtime for WebSocket

**Status**: ✅ Accepted (Phase 2)
**Date**: Week 2 (Phase 2 Migration)
**Decision Makers**: Development Team
**Impact**: High - Real-time communication architecture

### Context

Real-time features (live chat, message updates, presence) require WebSocket. Options:
1. **Custom WebSocket Server**: Build Socket.io or ws server
2. **Supabase Realtime**: PostgreSQL logical replication via WebSocket
3. **Third-party (Pusher, Ably)**: SaaS WebSocket services

### Decision

**We will use Supabase Realtime** for all real-time features:
- PostgreSQL logical replication broadcasts database changes
- Mobile apps subscribe to channels
- No custom WebSocket server needed

### Rationale

1. **Built-In**: Included with Supabase (no extra cost)
2. **Database-Driven**: Real-time updates from database changes
3. **Reliable**: Battle-tested with millions of connections
4. **Easy Integration**: Native support in Supabase SDKs
5. **Presence Tracking**: Built-in presence features

### Consequences

**Positive**:
- ✅ No custom WebSocket server to maintain
- ✅ Database changes automatically broadcast
- ✅ Reliable with automatic reconnection
- ✅ Presence tracking built-in

**Negative**:
- ⚠️ Less control over WebSocket protocol (acceptable)
- ⚠️ Tied to database changes (works well for our use case)

**Implementation Notes**:
- Mobile apps subscribe to `messages:{conversationId}` channels
- Database inserts trigger real-time broadcasts
- RLS policies control who can subscribe to channels

**Archived**:
- Custom realtime service moved to `packages/services/realtime-archived/`

### References

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Phase 2 Completion](../../PHASE-2-3-COMPLETE.md)

---

## ADR-010: Redis and Kafka via Docker Compose

**Status**: ✅ Accepted (Week 0)
**Date**: Week 0 Foundation
**Decision Makers**: Development Team
**Impact**: Medium - Development environment

### Context

Redis and Kafka needed for development. Options:
1. **Docker Compose**: Local containers
2. **Cloud Services**: Redis Cloud, Confluent Cloud from day 1
3. **Native Installation**: Install locally without Docker

### Decision

**We will use Docker Compose for Redis and Kafka** in local development:
- Development: Docker containers (Redis 7, Kafka 7.5) - optional
- Production: Railway-managed services (see ADR-011)
- Developers can also use Railway directly for development

### Rationale

1. **Easy Setup**: `docker-compose up` to start all services
2. **Consistent Environment**: Same setup for all developers
3. **Cost-Free**: No cloud costs during development
4. **Fast Iteration**: Local services for faster testing
5. **Clear Migration Path**: Easy to switch to cloud for production

### Consequences

**Positive**:
- ✅ Easy local development setup
- ✅ No cloud costs during development
- ✅ Consistent across team
- ✅ Fast iteration

**Negative**:
- ⚠️ Docker Desktop required (or use Railway directly)
- ⚠️ Different from production Railway services (acceptable for local dev)
- ⚠️ Optional for developers who prefer Railway for development

**Implementation Notes**:
- `docker-compose.yml` in project root
- Redis on port 6379
- Kafka on port 9092
- Zookeeper on port 2181

**Production Migration**:
- Redis: Migrate to Railway-managed Redis
- Kafka: Migrate to Railway-managed Kafka

### References

- [Current Deployment](../current/DEPLOYMENT.md#docker-compose-local-services)
- [Current Stack](../current/STACK.md#redis-7)

---

## ADR-011: Railway for Simplified Deployment

**Status**: ✅ Accepted (Week 3)
**Date**: Week 3 (2025-10-07)
**Decision Makers**: Development Team
**Impact**: High - Deployment architecture and operational complexity

### Context

We need a production deployment strategy for Tide's microservices and infrastructure. Initial considerations included:

1. **Complex Multi-Cloud**: Redis Cloud + Confluent Cloud + AWS ECS/GCP Cloud Run + Kubernetes
2. **Full AWS**: ElastiCache + MSK + ECS + ALB + CloudWatch
3. **Full GCP**: Memorystore + Pub/Sub + Cloud Run + Load Balancer
4. **Railway**: Unified platform for all infrastructure and services

**Challenges with Complex Approach**:
- High operational overhead (managing 5+ cloud services)
- Steep learning curve (Kubernetes, service mesh, cloud-specific tools)
- Slow time-to-market (weeks to set up infrastructure)
- High costs (multiple managed services with minimum fees)
- Coordination complexity (networking, security groups, IAM)

### Decision

**We will use Railway as our unified deployment platform** for:
- **Redis**: Railway-managed Redis (replaces Redis Cloud/ElastiCache)
- **Kafka**: Railway-managed Kafka (replaces Confluent Cloud/MSK)
- **Custom Services**: AI, Email, Calendar, Workflow, Gateway services
- **Infrastructure**: Environment variables, secrets, domains, SSL

**Supabase remains the core platform** for:
- Authentication (OAuth with Google, Microsoft)
- Database (PostgreSQL 16 with pgvector)
- Realtime (WebSocket subscriptions)
- Storage (File uploads)

**Docker Compose** for:
- Local development only (optional - can use Railway directly)

### Rationale

1. **Simplicity**: One platform instead of 5+ cloud services
2. **Speed to Market**: Deploy in minutes instead of weeks
3. **Developer Experience**: Simple CLI (`railway up`, `railway logs`)
4. **Cost-Effective**: Pay-as-you-go, no minimum fees, free tier for development
5. **Startup-Friendly**: Focus on product, not infrastructure
6. **Automatic Scaling**: Services scale based on usage without configuration
7. **Built-in Monitoring**: Logs, metrics, and alerts included
8. **Git Integration**: Automatic deployments from GitHub
9. **Environment Management**: Easy staging/production separation
10. **No Vendor Lock-In**: Can migrate to AWS/GCP later if needed

### Consequences

**Positive**:
- ✅ 90% reduction in infrastructure complexity
- ✅ Deploy to production in 1 day instead of 2 weeks
- ✅ One platform to learn instead of 5+
- ✅ Lower costs (no minimum fees for multiple managed services)
- ✅ Better developer experience (simple CLI, unified dashboard)
- ✅ Faster iteration (deploy with `railway up`)
- ✅ Built-in SSL certificates and custom domains
- ✅ Automatic health checks and restart
- ✅ Easy rollback to previous deployments
- ✅ Environment variables managed in one place

**Negative**:
- ⚠️ Less control over infrastructure (acceptable for MVP/startup)
- ⚠️ Smaller ecosystem than AWS/GCP (mitigated: Railway supports standard protocols)
- ⚠️ May need migration at massive scale (>100M requests/day)
- ⚠️ Railway-specific patterns (mitigated: uses standard Docker/Buildpacks)

**Trade-offs**:
- **Gave Up**: Fine-grained infrastructure control, cloud-specific optimizations
- **Gained**: Speed, simplicity, lower costs, better DX, faster time-to-market

### Implementation Notes

**Railway Services**:
- AI Service: Node.js 20, auto-scaling
- Email Service: Node.js 20, auto-scaling
- Calendar Service: Node.js 20, auto-scaling
- Workflow Service: Node.js 20, auto-scaling
- Gateway Service: Node.js 20, auto-scaling

**Railway Infrastructure**:
- Redis: Railway plugin, automatic persistence
- Kafka: Railway plugin, automatic topic management

**Deployment Flow**:
1. Developer pushes to GitHub
2. Railway auto-deploys from GitHub (CI/CD built-in)
3. Services available with HTTPS immediately
4. Logs and metrics in Railway dashboard

**Environment Variables**:
- Set once in Railway dashboard
- Automatically injected into all services
- Encrypted at rest

**Migration Path** (if needed at scale):
- Railway uses standard Docker containers and environment variables
- Can export services and deploy to AWS/GCP/Azure
- No proprietary lock-in

### Comparison to Alternatives

| Aspect | Railway | Multi-Cloud (Redis Cloud + Confluent + K8s) | Full AWS |
|--------|---------|---------------------------------------------|----------|
| Time to Deploy | 1 day | 2-3 weeks | 1-2 weeks |
| Learning Curve | Low | High | Medium-High |
| Monthly Cost (MVP) | $50-100 | $300-500 | $200-400 |
| Operational Overhead | Low | High | Medium |
| Developer Experience | Excellent | Complex | Good |
| Scaling | Automatic | Manual | Semi-automatic |
| Monitoring | Built-in | Custom setup | CloudWatch |
| Startup Suitability | Excellent | Poor | Good |

### References

- [Railway Documentation](https://docs.railway.app)
- [Current Deployment](../current/DEPLOYMENT.md#railway-deployment)
- [ADR-001: Supabase-First Architecture](#adr-001-supabase-first-architecture)
- [ADR-010: Redis and Kafka via Docker Compose](#adr-010-redis-and-kafka-via-docker-compose)

---

## ADR-012: Event-Driven Cache Invalidation

**Status**: ✅ Accepted (Week 4-5, Planned)
**Date**: 2025-10-07
**Decision Makers**: Development Team
**Impact**: Medium - Cache consistency and performance

### Context

Redis caching improves performance but introduces staleness risks. Current approach requires manual cache invalidation, leading to:
- Stale data shown to users after updates
- Complex cache key management across services
- Risk of showing incorrect data (e.g., deleted emails still appearing)
- No coordination between services on cache invalidation

Options for cache invalidation:
1. **TTL-Only**: Set expiration times, accept staleness
2. **Manual Invalidation**: Services invalidate cache on updates (current)
3. **Event-Driven Invalidation**: Services publish events, cache listener invalidates
4. **Tag-Based Invalidation**: Tag related cache entries, invalidate by tag

### Decision

**We will implement event-driven cache invalidation with tag-based keys** using:
- **Kafka Events**: Services publish `cache.invalidate` events when data changes
- **Tag-Based Keys**: Cache keys include tags like `user:{userId}`, `email:{emailId}`
- **Cache Invalidation Service**: Listens to events and invalidates related cache entries
- **Railway Redis**: Use Railway-managed Redis for cache storage

**Implementation Pattern**:
```typescript
// Email service publishes event when email is deleted
await kafka.publish('cache.invalidate', {
  tags: ['user:123', 'email:456', 'inbox:123'],
  reason: 'email_deleted'
});

// Cache invalidation service listens and invalidates
await redis.del(
  'emails:user:123',
  'email:456',
  'inbox:user:123:unread_count'
);
```

### Rationale

1. **Consistency**: Cache always reflects latest data
2. **Decoupling**: Services don't need to know cache structure
3. **Scalability**: Invalidation service scales independently
4. **Audit Trail**: Events provide invalidation history
5. **Railway Integration**: Works seamlessly with Railway-managed Redis and Kafka

### Consequences

**Positive**:
- ✅ Eliminates stale data issues
- ✅ Services focus on business logic, not cache management
- ✅ Easy to debug (event log shows invalidations)
- ✅ Can batch invalidations for efficiency
- ✅ Works with existing Railway Kafka infrastructure

**Negative**:
- ⚠️ Small latency (event processing time, typically <50ms)
- ⚠️ Additional service to maintain (Cache Invalidation Service)
- ⚠️ Complexity in tag management

**Trade-offs**:
- **Gave Up**: Immediate cache invalidation (TTL=0), manual invalidation complexity
- **Gained**: Consistency, maintainability, better UX

### Implementation Plan

**Week 4-5 (Email/Calendar Track)**:
1. Create `CacheInvalidationService` as Railway service
2. Define Kafka topic `cache.invalidate` with schema
3. Update Email/Calendar services to publish invalidation events
4. Implement tag-based cache key patterns
5. Add monitoring for invalidation latency

**Cache Key Pattern**:
```
user:{userId}:emails
user:{userId}:inbox:unread_count
email:{emailId}
calendar:{userId}:events
task:{taskId}
```

**Invalidation Event Schema**:
```typescript
interface CacheInvalidationEvent {
  tags: string[];           // ['user:123', 'email:456']
  reason: string;           // 'email_deleted', 'task_updated'
  timestamp: number;
  service: string;          // 'email-service'
}
```

### References

- [Current Stack](../current/STACK.md#redis-7)
- [ADR-011: Railway for Simplified Deployment](#adr-011-railway-for-simplified-deployment)
- [Track 3: Email & Calendar](../tracks/track-03-email-calendar.md)

---

## ADR-013: Mobile BFF Pattern

**Status**: ✅ Accepted (Week 6-8, Planned)
**Date**: 2025-10-07
**Decision Makers**: Development Team
**Impact**: High - Mobile app performance and user experience

### Context

Mobile apps currently make 7-15 separate API calls to load a single screen:
1. User profile
2. Unread email count
3. Recent emails (paginated)
4. Today's calendar events
5. Pending tasks
6. AI conversation state
7. Notification preferences

**Problems**:
- **Slow Loading**: 7-15 sequential network requests (2-5 seconds)
- **High Data Usage**: ~500KB per screen load (mostly redundant headers)
- **Poor UX**: Screens load progressively, flickering
- **Battery Drain**: Multiple network radios on

**BFF (Backend for Frontend) Pattern**:
- Single API endpoint aggregates multiple backend calls
- Tailored responses for mobile (only needed fields)
- Server-side composition reduces network overhead

### Decision

**We will implement a Mobile BFF (Backend for Frontend) service** deployed on Railway:
- **Mobile BFF Service**: Aggregates backend calls, returns optimized payloads
- **Single Endpoint**: `/mobile/v1/screen/{screenName}` endpoint per screen
- **GraphQL Alternative**: Consider GraphQL for flexible queries (optional)
- **Railway Deployment**: Deploy as Railway service alongside other services

**Example Request**:
```typescript
GET /mobile/v1/screen/inbox
Response (118KB vs. 500KB):
{
  user: { id, name, email },
  inbox: {
    unread_count: 12,
    emails: [{ id, subject, from, snippet, time }]
  },
  tasks: {
    pending_count: 5,
    urgent: [{ id, title, due }]
  },
  calendar: {
    today_events: [{ id, title, start, end }]
  }
}
```

### Rationale

1. **Performance**: 1 API call instead of 7-15 (10x faster)
2. **Data Efficiency**: 118KB vs. 500KB (~76% reduction)
3. **Better UX**: Screen loads instantly, no flickering
4. **Battery Savings**: Single network request
5. **Mobile-Specific**: Optimize for mobile constraints
6. **Railway Integration**: Simple deployment with `railway up`

### Consequences

**Positive**:
- ✅ 10x faster screen loading (500ms vs. 5s)
- ✅ 76% reduction in data usage
- ✅ Better mobile UX (instant loading)
- ✅ Lower battery consumption
- ✅ Easier to optimize for mobile

**Negative**:
- ⚠️ Additional service to maintain (Mobile BFF)
- ⚠️ Coupling to mobile app screen structure
- ⚠️ Duplicate logic with individual services (acceptable)

**Trade-offs**:
- **Gave Up**: Direct access to individual services from mobile
- **Gained**: Performance, UX, mobile optimization, lower costs

### Implementation Plan

**Week 6-8 (Mobile Track)**:
1. Create `MobileBFFService` as Railway service
2. Implement `/mobile/v1/screen/inbox` endpoint
3. Implement `/mobile/v1/screen/tasks` endpoint
4. Implement `/mobile/v1/screen/calendar` endpoint
5. Update iOS/Android apps to use BFF endpoints
6. Add caching with Redis (with ADR-012 invalidation)
7. Monitor performance improvements

**Technology**:
- **Runtime**: Node.js 20 with TypeScript
- **Framework**: Express.js or Fastify
- **Caching**: Railway Redis with tag-based invalidation
- **Authentication**: Supabase JWT validation
- **Deployment**: Railway (auto-scaling)

**Endpoints**:
```
GET /mobile/v1/screen/inbox       - Inbox screen data
GET /mobile/v1/screen/tasks       - Tasks screen data
GET /mobile/v1/screen/calendar    - Calendar screen data
GET /mobile/v1/screen/ai          - AI conversation screen
GET /mobile/v1/screen/profile     - User profile screen
```

### References

- [Track 1: Mobile Apps](../tracks/track-01-mobile-apps.md)
- [ADR-012: Event-Driven Cache Invalidation](#adr-012-event-driven-cache-invalidation)
- [ADR-011: Railway for Simplified Deployment](#adr-011-railway-for-simplified-deployment)

---

## ADR-014: gRPC for Service-to-Service Communication

**Status**: ✅ Accepted (Week 8-10, Planned)
**Date**: 2025-10-07
**Decision Makers**: Development Team
**Impact**: Medium - Internal service communication

### Context

Microservices need to communicate synchronously for certain operations:
- Email Service → AI Service (triage email)
- Workflow Service → AI Service (execute AI step)
- Calendar Service → AI Service (suggest meeting times)

Current approach uses REST APIs with JSON:
- **Slower**: JSON serialization/deserialization overhead
- **No Type Safety**: Manual typing across services
- **Larger Payloads**: JSON is verbose
- **No Streaming**: Request-response only

gRPC offers:
- **Protocol Buffers**: Binary serialization (faster, smaller)
- **Type Safety**: Generated clients with strong typing
- **Streaming**: Bidirectional streaming support
- **Performance**: 5-10x faster than REST for internal calls

**Important**: This is for **service-to-service only**, NOT mobile apps.

### Decision

**We will use gRPC for internal service-to-service communication**:
- **AI Service**: Expose gRPC API for triage, analysis, suggestions
- **Email/Calendar/Workflow Services**: Use gRPC clients to call AI Service
- **Mobile Apps**: Continue using Supabase Realtime + REST (NOT gRPC)
- **Protocol Buffers**: Define `.proto` files for contracts
- **Railway Deployment**: gRPC services deployed on Railway with HTTP/2

**Example**:
```protobuf
// ai.proto
service AIService {
  rpc TriageEmail(EmailTriageRequest) returns (EmailTriageResponse);
  rpc SuggestMeetingTimes(MeetingRequest) returns (MeetingResponse);
}

message EmailTriageRequest {
  string email_id = 1;
  string subject = 2;
  string body = 3;
}
```

### Rationale

1. **Performance**: 5-10x faster than REST for internal calls
2. **Type Safety**: Generated TypeScript/Swift/Kotlin clients
3. **Smaller Payloads**: Protobuf is 3-10x smaller than JSON
4. **Streaming**: Supports long-running AI operations
5. **Contract-First**: `.proto` files define clear API contracts
6. **Railway Compatible**: Railway supports gRPC over HTTP/2

**Why NOT gRPC for Mobile**:
- Supabase Realtime already provides real-time updates
- gRPC-Web adds complexity for web/mobile
- REST + Supabase Realtime is more mobile-friendly
- Mobile BFF (ADR-013) optimizes mobile performance

### Consequences

**Positive**:
- ✅ 5-10x faster internal service calls
- ✅ Type safety across services (generated clients)
- ✅ 70% smaller payloads (Protobuf vs. JSON)
- ✅ Streaming support for long AI operations
- ✅ Clear API contracts (`.proto` files)

**Negative**:
- ⚠️ Learning curve (Protocol Buffers, gRPC concepts)
- ⚠️ Additional tooling (protoc compiler, generated code)
- ⚠️ Not human-readable (unlike JSON)

**Trade-offs**:
- **Gave Up**: Human-readable REST/JSON for internal calls
- **Gained**: Performance, type safety, streaming, smaller payloads

### Implementation Plan

**Week 8-10 (AI Track)**:
1. Define `.proto` files for AI Service API
2. Set up `protoc` compiler in monorepo
3. Generate TypeScript clients for Email/Calendar/Workflow services
4. Update AI Service to expose gRPC API (alongside REST)
5. Update Email Service to use gRPC for AI calls
6. Monitor performance improvements
7. Add gRPC health checks for Railway

**Technology**:
- **gRPC Runtime**: `@grpc/grpc-js` (Node.js)
- **Protocol Buffers**: `protobufjs`
- **Code Generation**: `protoc` with TypeScript plugin
- **Transport**: HTTP/2 over TLS
- **Deployment**: Railway (supports gRPC natively)

**Services Using gRPC**:
- AI Service (server)
- Email Service (client)
- Calendar Service (client)
- Workflow Service (client)

**NOT Using gRPC**:
- Mobile apps (use Supabase Realtime + REST)
- Mobile BFF (uses REST with mobile apps)

### References

- [gRPC Documentation](https://grpc.io/docs/)
- [ADR-013: Mobile BFF Pattern](#adr-013-mobile-bff-pattern)
- [Track 2: AI Intelligence](../tracks/track-02-ai-intelligence.md)

---

## ADR-015: Reject Service Mesh for Railway Environment

**Status**: ❌ Rejected
**Date**: 2025-10-07
**Decision Makers**: Development Team
**Impact**: High - Infrastructure complexity

### Context

Service meshes (Istio, Linkerd) provide:
- Traffic management (load balancing, retries, circuit breakers)
- Security (mTLS between services)
- Observability (distributed tracing, metrics)
- Health checks and auto-restart

**Proposal**: Add Istio or Linkerd service mesh to Tide architecture.

### Decision

**We will NOT implement a service mesh** because:
1. **Railway Provides These Features**: Railway includes health checks, auto-restart, load balancing
2. **Requires Kubernetes**: Service meshes need Kubernetes, conflicts with Railway simplicity
3. **Overkill for Scale**: Service meshes are for 100+ services, we have 5
4. **Complexity**: Weeks of setup, steep learning curve
5. **Railway Philosophy**: Railway abstracts infrastructure, service mesh contradicts this

### Rationale

**What Railway Already Provides**:
- ✅ **Health Checks**: Automatic health checks and service restart
- ✅ **Load Balancing**: Built-in load balancing across replicas
- ✅ **TLS**: Automatic HTTPS with Let's Encrypt certificates
- ✅ **Observability**: Logs, metrics, and dashboards built-in
- ✅ **Auto-Scaling**: Services scale based on CPU/memory usage

**Service Mesh Would Require**:
- ❌ Migrate from Railway to Kubernetes (GKE, EKS, AKS)
- ❌ Learn Istio/Linkerd (weeks of training)
- ❌ Manage control plane (Pilot, Citadel, Galley)
- ❌ Debug sidecar proxies (Envoy)
- ❌ High operational overhead

**Scale Consideration**:
- Service meshes are designed for 100+ microservices
- Tide has 5 services (AI, Email, Calendar, Workflow, Gateway)
- Massive overkill for current and near-term scale

### Consequences

**Positive (by rejecting)**:
- ✅ Stay on Railway (simple, fast deployment)
- ✅ No Kubernetes complexity
- ✅ Built-in features sufficient for MVP and beyond
- ✅ Focus on product, not infrastructure

**Negative (by rejecting)**:
- ⚠️ No advanced traffic management (acceptable for current scale)
- ⚠️ No mTLS between services (can add later if needed)
- ⚠️ Less granular observability (Railway logs/metrics are sufficient)

**When to Reconsider**:
- Scale reaches 50+ microservices
- Need advanced traffic routing (canary, blue-green)
- Strict compliance requires mTLS everywhere
- Migrate from Railway to self-managed Kubernetes

### Alternative Solutions

Instead of service mesh, we use:
1. **Railway Health Checks**: Automatic restart on failure
2. **gRPC**: Type-safe service-to-service communication (ADR-014)
3. **Kafka**: Event-driven communication for async operations
4. **Railway Monitoring**: Built-in logs, metrics, alerts
5. **Application-Level Retries**: Implement in service code

### References

- [ADR-011: Railway for Simplified Deployment](#adr-011-railway-for-simplified-deployment)
- [Railway Health Checks](https://docs.railway.app/deploy/healthchecks)
- [Why Not Kubernetes Yet](./FUTURE-ARCHITECTURE.md#kubernetes-migration)

---

## ADR-016: Reject CQRS Pattern for MVP

**Status**: ❌ Rejected (for now)
**Date**: 2025-10-07
**Decision Makers**: Development Team
**Impact**: Medium - Data architecture

### Context

CQRS (Command Query Responsibility Segregation) separates:
- **Write Model**: Optimized for commands (create, update, delete)
- **Read Model**: Optimized for queries (list, search, aggregate)

**Proposal**: Implement CQRS with:
- PostgreSQL for writes
- Separate read replicas or read-optimized stores (Elasticsearch, DynamoDB)
- Event sourcing for write model
- Projections for read model

### Decision

**We will NOT implement CQRS for MVP** because:
1. **Premature Optimization**: No evidence of read/write contention
2. **Overkill for Scale**: CQRS is for high-traffic systems (>100k users)
3. **Increased Complexity**: Dual write models, eventual consistency, projections
4. **PostgreSQL is Fast**: Supabase PostgreSQL handles 5000+ req/sec easily
5. **No Performance Issues**: Current queries are <50ms

### Rationale

**Current Architecture (Simple)**:
- PostgreSQL for reads and writes
- Indexed queries are fast (<50ms)
- RLS policies ensure security
- Single source of truth

**CQRS Would Add**:
- Separate read/write databases
- Event sourcing infrastructure
- Projection builders
- Eventual consistency challenges
- Much higher complexity

**When is CQRS Needed?**:
- Read/write ratio >100:1 (our ratio is ~10:1)
- Queries take >200ms (ours are <50ms)
- Need different data models for reads vs. writes
- Scale >100k active users (we're at <100 users in Week 3)

### Consequences

**Positive (by rejecting)**:
- ✅ Simpler architecture (single database)
- ✅ Immediate consistency (no eventual consistency issues)
- ✅ Easier debugging (one source of truth)
- ✅ Faster development (no CQRS infrastructure)
- ✅ Lower operational overhead

**Negative (by rejecting)**:
- ⚠️ May hit scale limits later (>100k users)
- ⚠️ Read/write contention possible at scale (acceptable risk)
- ⚠️ Need to migrate if queries slow down (future decision)

**When to Reconsider**:
- Query latency exceeds 200ms consistently
- Read/write ratio exceeds 100:1
- User scale exceeds 100k active users
- PostgreSQL CPU >80% for extended periods

### Alternative Solutions

Instead of CQRS, we use:
1. **PostgreSQL Indexing**: Proper indexes for fast queries
2. **Redis Caching**: Cache hot queries (ADR-012 for invalidation)
3. **Read Replicas**: Supabase supports read replicas if needed
4. **Materialized Views**: Pre-compute aggregations in PostgreSQL
5. **Query Optimization**: Analyze slow queries with `EXPLAIN`

**Current Performance**:
- User profile queries: <10ms
- Email list queries: <30ms
- Calendar queries: <20ms
- AI conversation queries: <40ms

### References

- [Current Stack](../current/STACK.md#postgresql-16)
- [ADR-012: Event-Driven Cache Invalidation](#adr-012-event-driven-cache-invalidation)
- [Future Architecture: CQRS Consideration](./FUTURE-ARCHITECTURE.md#cqrs-pattern)

---

## Decision-Making Process

### How We Make Architectural Decisions

1. **Identify Need**: Recognize a decision point
2. **Research Options**: Explore alternatives with pros/cons
3. **Draft ADR**: Document context, decision, consequences
4. **Team Review**: Discuss in team meeting
5. **Accept/Reject**: Make final decision
6. **Implement**: Execute the decision
7. **Monitor**: Track consequences and adjust if needed

### When to Create an ADR

Create an ADR for decisions that:
- Affect multiple teams or services
- Are difficult or expensive to reverse
- Impact performance, security, or scalability
- Change technology stack or architecture patterns
- Set precedent for future decisions

### ADR Statuses

- **Proposed**: Under consideration
- **Accepted**: Decision made and implemented
- **Rejected**: Considered but not chosen
- **Superseded**: Replaced by newer decision
- **Deprecated**: No longer relevant

---

## Future Decisions

### Upcoming Architectural Decisions

**Under Consideration**:
1. **API Gateway Technology**: GraphQL Federation vs. REST vs. gRPC
2. **Monitoring Stack**: Prometheus/Grafana vs. Datadog vs. New Relic
3. **ML Model Hosting**: Self-hosted vs. OpenAI API vs. hybrid
4. **Email Parsing**: Custom parser vs. third-party (Nylas, etc.)
5. **Workflow Engine**: Custom state machine vs. Temporal vs. Airflow

---

## References

- [Current Architecture](./CURRENT-ARCHITECTURE.md)
- [Future Architecture](./FUTURE-ARCHITECTURE.md)
- [Implementation Roadmap](../../archive/IMPLEMENTATION-ROADMAP.md)
- [Current Stack](../current/STACK.md)
- [Current Services](../current/SERVICES.md)

---

**Last Updated**: 2025-10-07
**Version**: Week 3 Alpha
**Maintainer**: Tide Development Team
