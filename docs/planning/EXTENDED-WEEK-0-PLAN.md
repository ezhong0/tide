# Extended Week 0: Complete Foundation Implementation Plan

## Overview

**Duration**: 15 working days
**Goal**: Build a production-ready foundation that enables Tracks 1-4 to execute in parallel
**Completion Criteria**: All services running, all tests passing, all tracks unblocked

---

## Phase 1: Shared Foundation Packages (Days 1-5)

### Day 1: Core Utilities & Error Handling

#### 1.1 Error Handling Package (`packages/shared/errors`)
```typescript
Key Components:
- Standardized error codes (categorized by domain)
- TideError base class with HTTP status codes
- Error factories for each domain
- Error serialization for API responses
- Error tracking integration hooks

Deliverables:
- packages/shared/errors/src/index.ts
- packages/shared/errors/src/codes.ts
- packages/shared/errors/src/factories.ts
- packages/shared/errors/package.json
- packages/shared/errors/README.md
```

#### 1.2 Validation Package (`packages/shared/validation`)
```typescript
Key Components:
- Zod schemas for all domain types
- Reusable validation utilities
- Request/Response validators
- Custom Zod refinements
- Type-safe validators

Deliverables:
- packages/shared/validation/src/index.ts
- packages/shared/validation/src/schemas/
  - user.schema.ts
  - message.schema.ts
  - email.schema.ts
  - calendar.schema.ts
  - task.schema.ts
  - ai.schema.ts
- packages/shared/validation/package.json
```

#### 1.3 Configuration Package (`packages/shared/config`)
```typescript
Key Components:
- Environment variable management
- Type-safe config objects
- Validation of config at startup
- Default values and overrides
- Secrets management

Deliverables:
- packages/shared/config/src/index.ts
- packages/shared/config/src/env.ts
- packages/shared/config/src/secrets.ts
- .env.example (comprehensive)
```

#### 1.4 Types Package (`packages/shared/types`)
```typescript
Key Components:
- Re-export contracts
- Add utility types
- GraphQL type helpers
- Event type definitions
- Database model types

Deliverables:
- packages/shared/types/src/index.ts
- packages/shared/types/src/graphql.ts
- packages/shared/types/src/events.ts
- packages/shared/types/src/database.ts
```

### Day 2: Logging & Monitoring

#### 2.1 Logger Library (`packages/libraries/logger`)
```typescript
Key Components:
- Structured logging (Pino)
- Request ID correlation
- Log levels and filtering
- JSON output for production
- Pretty printing for development
- Context injection

Deliverables:
- packages/libraries/logger/src/index.ts
- packages/libraries/logger/src/logger.ts
- packages/libraries/logger/src/middleware.ts
- Integration with services
```

#### 2.2 Monitoring Library (`packages/libraries/monitoring`)
```typescript
Key Components:
- Prometheus metrics
- Custom metric helpers
- Health check framework
- Performance monitoring
- Error rate tracking
- Business metrics

Deliverables:
- packages/libraries/monitoring/src/index.ts
- packages/libraries/monitoring/src/metrics.ts
- packages/libraries/monitoring/src/health.ts
- packages/libraries/monitoring/src/middleware.ts
```

### Day 3: Database Infrastructure

#### 3.1 Database Library (`packages/libraries/database`)
```typescript
Key Components:
- PostgreSQL connection pooling
- Transaction management
- Query builder helpers
- Migration system
- Connection health checks
- Read replica support

Deliverables:
- packages/libraries/database/src/index.ts
- packages/libraries/database/src/pool.ts
- packages/libraries/database/src/transaction.ts
- packages/libraries/database/src/migrations.ts
- packages/libraries/database/migrations/
  - 001_initial_schema.sql
  - 002_users_tables.sql
  - 003_conversations_tables.sql
  - 004_events_tables.sql
```

#### 3.2 Redis Library (`packages/libraries/cache`)
```typescript
Key Components:
- Redis client wrapper
- Cache helpers
- Session storage
- Pub/Sub utilities
- TTL management
- Cache invalidation

Deliverables:
- packages/libraries/cache/src/index.ts
- packages/libraries/cache/src/client.ts
- packages/libraries/cache/src/session.ts
- packages/libraries/cache/src/pubsub.ts
```

#### 3.3 Database Schemas & Migrations
```sql
Core Tables:
- users (auth, profile, preferences)
- conversations (chat history)
- messages (partitioned by time)
- events (event sourcing)
- outbox (reliable event publishing)
- sessions (active sessions)

Indexes:
- Performance-critical queries
- Full-text search indexes
- Composite indexes for joins

Deliverables:
- Complete migration scripts
- Seed data for development
- Database documentation
```

### Day 4: AI & External Services

#### 4.1 AI Client Library (`packages/libraries/ai-client`)
```typescript
Key Components:
- OpenAI GPT-5 client
- Anthropic Claude client
- Rate limiting & backoff
- Streaming support
- Token counting
- Cost tracking
- Response caching

Deliverables:
- packages/libraries/ai-client/src/index.ts
- packages/libraries/ai-client/src/openai.ts
- packages/libraries/ai-client/src/anthropic.ts
- packages/libraries/ai-client/src/rate-limiter.ts
- packages/libraries/ai-client/src/streaming.ts
```

#### 4.2 OAuth Library (`packages/libraries/oauth`)
```typescript
Key Components:
- Gmail OAuth flow
- Microsoft Exchange OAuth
- Google Calendar OAuth
- Token refresh logic
- Secure token storage

Deliverables:
- packages/libraries/oauth/src/index.ts
- packages/libraries/oauth/src/gmail.ts
- packages/libraries/oauth/src/exchange.ts
- packages/libraries/oauth/src/calendar.ts
```

### Day 5: Testing Framework

#### 5.1 Testing Library (`packages/shared/testing`)
```typescript
Key Components:
- Test database setup/teardown
- Mock factories
- Integration test helpers
- API test utilities
- Event test utilities
- Snapshot testing helpers

Deliverables:
- packages/shared/testing/src/index.ts
- packages/shared/testing/src/database.ts
- packages/shared/testing/src/factories.ts
- packages/shared/testing/src/api.ts
- packages/shared/testing/src/events.ts
- jest.config.base.js (shared config)
```

---

## Phase 2: Core Services (Days 6-10)

### Day 6: Authentication Service

#### 6.1 Auth Service (`packages/services/auth`)
```typescript
Key Components:
- User registration
- Login with email/password
- JWT token generation (access + refresh)
- Token validation
- Token refresh
- Password reset flow
- Email verification
- Session management

API Endpoints:
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- POST /auth/verify-email
- POST /auth/reset-password
- GET /auth/me

GraphQL Schema:
- Mutation: register, login, logout, refreshToken
- Query: me, validateToken

Database Tables:
- users (id, email, password_hash, verified, created_at)
- refresh_tokens (token, user_id, expires_at)
- verification_tokens (token, user_id, type, expires_at)

Deliverables:
- Full service implementation
- GraphQL schema & resolvers
- REST endpoints
- Integration tests
- Dockerfile
- README with API docs
```

### Day 7: Event Bus Service

#### 7.1 Event Bus Service (`packages/services/events`)
```typescript
Key Components:
- Kafka producer wrapper
- Kafka consumer management
- Event publishing
- Event subscription
- Dead letter queue
- Event replay capability
- Schema validation
- Event versioning

Kafka Topics:
- user.events
- message.events
- email.events
- calendar.events
- task.events
- workflow.events
- ai.events
- system.events

Event Types:
- USER_REGISTERED
- USER_AUTHENTICATED
- MESSAGE_RECEIVED
- MESSAGE_PROCESSED
- EMAIL_RECEIVED
- EMAIL_SENT
- EMAIL_TRIAGED
- CALENDAR_EVENT_CREATED
- MEETING_SCHEDULED
- TASK_CREATED
- WORKFLOW_STARTED
- AI_INTENT_DETECTED

Deliverables:
- Event bus implementation
- Topic management
- Consumer group management
- Event schema registry
- Integration tests
- Event monitoring
```

#### 7.2 Outbox Pattern Implementation
```typescript
Key Components:
- Outbox table for reliable events
- Outbox processor (polls & publishes)
- Transaction integration
- Retry logic
- Monitoring

Deliverables:
- Database table
- Processor service
- Integration with services
```

### Day 8: API Gateway

#### 8.1 API Gateway (`packages/services/gateway`)
```typescript
Key Components:
- GraphQL Federation setup
- Schema composition
- Authentication middleware
- Rate limiting
- Request logging
- Error handling
- CORS configuration
- Response caching
- Request tracing

Federated Services:
- Auth subgraph
- Conversation subgraph (placeholder)
- Email subgraph (placeholder)
- Calendar subgraph (placeholder)
- Workflow subgraph (placeholder)

Middleware Stack:
1. Request ID generation
2. CORS handling
3. Authentication
4. Rate limiting
5. Request logging
6. Error handling
7. Response compression

Deliverables:
- Gateway service
- Federation configuration
- Middleware implementations
- Health check endpoint
- Metrics endpoint
- Integration tests
- API documentation
```

### Day 9: WebSocket Real-time Service

#### 9.1 WebSocket Service (`packages/services/realtime`)
```typescript
Key Components:
- Socket.io server
- Authentication for WS
- Room/channel management
- Message broadcasting
- Presence tracking
- Reconnection handling
- Event forwarding from Kafka

Events:
- connection
- disconnect
- join_room
- leave_room
- message
- typing
- presence_update

Rooms:
- user:{userId} (personal notifications)
- conversation:{conversationId} (chat updates)
- presence (online status)

Integration:
- Kafka consumer for events
- Broadcast events to connected clients
- Store connection state in Redis

Deliverables:
- WebSocket service
- Client SDK (@tide/realtime-client)
- Room management
- Event forwarding
- Integration tests
- Connection monitoring
```

### Day 10: Service Integration & Placeholder Subgraphs

#### 10.1 Create Placeholder GraphQL Subgraphs
```typescript
Services to Create:
- packages/services/conversation (basic schema)
- packages/services/email (basic schema)
- packages/services/calendar (basic schema)
- packages/services/workflow (basic schema)

Each includes:
- GraphQL schema definition
- Placeholder resolvers (use mocks)
- Federation configuration
- Health check
- Docker setup

Purpose:
- Allow gateway to compose full schema
- Provide contract for track teams
- Enable end-to-end testing
```

#### 10.2 Service-to-Service Communication
```typescript
Key Components:
- gRPC for internal calls (optional)
- Event-driven integration (primary)
- Service discovery
- Circuit breaker pattern
- Retry logic

Deliverables:
- Communication patterns documented
- Helper libraries
- Integration examples
```

---

## Phase 3: DevOps & Infrastructure (Days 11-13)

### Day 11: Docker & Local Development

#### 11.1 Dockerfiles for All Services
```dockerfile
Services:
- packages/services/auth/Dockerfile
- packages/services/events/Dockerfile
- packages/services/gateway/Dockerfile
- packages/services/realtime/Dockerfile

Multi-stage builds:
1. Builder stage (TypeScript compilation)
2. Production stage (minimal image)

Optimization:
- Layer caching
- .dockerignore files
- Minimal dependencies
```

#### 11.2 Docker Compose for Local Dev
```yaml
docker-compose.yml includes:
- PostgreSQL (with initialization)
- Redis
- Kafka + Zookeeper
- All services (gateway, auth, events, realtime)
- Prometheus (metrics)
- Grafana (dashboards)
- Jaeger (tracing - optional)

Scripts:
- scripts/dev/start.sh (start all services)
- scripts/dev/stop.sh (stop all services)
- scripts/dev/reset.sh (reset databases)
- scripts/dev/logs.sh (tail logs)
```

### Day 12: Testing & Quality Assurance

#### 12.1 Integration Tests
```typescript
Test Suites:
- Auth flow (register, login, refresh)
- Event publishing & subscription
- Gateway federation
- WebSocket connections
- Database transactions
- Cache operations

Test Database:
- Separate test DB
- Automatic setup/teardown
- Seed data
```

#### 12.2 E2E Tests
```typescript
Scenarios:
1. User registration → Auth → Message send → WebSocket receive
2. Event publish → Multiple subscribers receive
3. Gateway → Auth check → Service call → Response
4. Database transaction → Event publish → Consumer process

Tools:
- Supertest for HTTP
- Socket.io client for WebSocket
- Kafka test utils
```

#### 12.3 Load Testing
```typescript
Scenarios:
- 1000 concurrent users
- 10,000 requests/minute
- 100 events/second

Tools:
- k6 or Artillery
- Metrics collection
- Performance baselines
```

### Day 13: CI/CD Pipeline

#### 13.1 GitHub Actions Workflows
```yaml
.github/workflows/
- test.yml (run on PR)
  - Lint all packages
  - Type check
  - Unit tests
  - Integration tests

- build.yml (run on main)
  - Build all Docker images
  - Tag with commit SHA
  - Push to registry

- deploy-staging.yml (run on main)
  - Deploy to staging K8s
  - Run smoke tests
  - Notify team

- deploy-production.yml (manual trigger)
  - Deploy to production
  - Health checks
  - Rollback on failure
```

#### 13.2 Code Quality Tools
```yaml
Tools:
- ESLint (TypeScript linting)
- Prettier (formatting)
- Husky (Git hooks)
- lint-staged (pre-commit)
- Commitlint (commit messages)

Configuration:
- .eslintrc.js (shared)
- .prettierrc (shared)
- .husky/pre-commit
- .husky/commit-msg
```

---

## Phase 4: Documentation & Track Enablement (Days 14-15)

### Day 14: Bootstrap Guides

#### 14.1 Track Bootstrap Guides
```markdown
Create for each track:
- redesign/tracks/TRACK-01-BOOTSTRAP.md
- redesign/tracks/TRACK-02-BOOTSTRAP.md
- redesign/tracks/TRACK-03-BOOTSTRAP.md
- redesign/tracks/TRACK-04-BOOTSTRAP.md

Each includes:
- Pre-flight checklist
- Available services & endpoints
- Integration points
- Code structure guidelines
- Common patterns
- Testing approach
- Deployment workflow
```

#### 14.2 Developer Documentation
```markdown
Create:
- DEVELOPER-GUIDE.md
  - Getting started
  - Architecture overview
  - Service communication
  - Database access
  - Event publishing
  - Testing strategy

- API-REFERENCE.md
  - GraphQL schema
  - REST endpoints
  - WebSocket events
  - Kafka events

- TROUBLESHOOTING.md
  - Common issues
  - Debug guides
  - Log analysis
  - Performance tuning
```

### Day 15: Verification & Handoff

#### 15.1 Verification Scripts
```bash
scripts/verify/
- verify-foundation.sh
  - Check all services healthy
  - Check databases accessible
  - Check Kafka topics exist
  - Check contracts build
  - Check mocks build

- verify-integration.sh
  - Run integration test suite
  - Verify event flows
  - Check GraphQL federation
  - Test WebSocket connections

- verify-performance.sh
  - Load test gateway
  - Check response times
  - Verify scaling
```

#### 15.2 Final Integration Test
```typescript
End-to-end scenario:
1. User registers via GraphQL
2. User logs in, gets JWT
3. User sends message via WebSocket
4. Message triggers AI intent detection (event)
5. AI service publishes suggested actions (event)
6. Mobile app receives actions via WebSocket
7. User executes action (email/calendar/task)
8. Action completion triggers workflow (event)
9. Analytics service records metrics

Deliverable:
- Full E2E test passing
- All services communicating
- All events flowing
- All logs captured
- All metrics recorded
```

#### 15.3 Handoff Package
```markdown
Create:
- WEEK-0-COMPLETION.md
  - What was built
  - What's available
  - Service endpoints
  - Database schemas
  - Event types
  - Next steps for tracks

- Track assignment emails
  - Track lead assignment
  - Bootstrap guide link
  - Slack channels
  - First sprint planning
```

---

## Success Criteria

### Technical Criteria
- [ ] All 5 core services running (auth, events, gateway, realtime, + placeholders)
- [ ] All 7 shared packages published (@tide/contracts, errors, validation, config, types, testing, mocks)
- [ ] All 5 libraries published (@tide/logger, monitoring, database, cache, ai-client)
- [ ] PostgreSQL schema deployed with migrations
- [ ] Redis configured and accessible
- [ ] Kafka running with all 8 topic categories
- [ ] Docker Compose brings up full stack
- [ ] All integration tests passing (>95% coverage on integration points)
- [ ] E2E test passing
- [ ] CI/CD pipeline functional
- [ ] Performance baseline met (1000 req/s)

### Documentation Criteria
- [ ] 4 track bootstrap guides complete
- [ ] Developer guide complete
- [ ] API reference complete
- [ ] Troubleshooting guide complete
- [ ] All services have README files
- [ ] All packages have README files

### Operational Criteria
- [ ] Health checks on all services
- [ ] Metrics exposed from all services
- [ ] Logs structured and queryable
- [ ] Alerts configured
- [ ] Monitoring dashboards created

---

## Package Dependency Graph

```
Foundation Layer:
├── @tide/contracts (types, interfaces)
├── @tide/errors (error handling)
├── @tide/validation (Zod schemas)
├── @tide/config (environment)
└── @tide/types (utilities)

Library Layer:
├── @tide/logger (uses: config, types)
├── @tide/monitoring (uses: config, types)
├── @tide/database (uses: config, logger, types)
├── @tide/cache (uses: config, logger, types)
└── @tide/ai-client (uses: config, logger, monitoring, types)

Service Layer:
├── @tide/auth (uses: all libraries, contracts, validation, errors)
├── @tide/events (uses: logger, monitoring, config, validation)
├── @tide/gateway (uses: all libraries, contracts, validation, errors)
└── @tide/realtime (uses: all libraries, contracts, cache, events)

Testing Layer:
├── @tide/testing (uses: all libraries, all shared packages)
└── @tide/mocks (uses: contracts) [EXISTING]

Track Layer (Week 1+):
├── Track 1: Mobile Apps
├── Track 2: AI Intelligence
├── Track 3: Email & Calendar
└── Track 4: Task & Workflow
```

---

## Timeline Summary

| Phase | Days | Deliverables |
|-------|------|-------------|
| **Phase 1** | 1-5 | 9 shared packages + libraries |
| **Phase 2** | 6-10 | 5 core services + integration |
| **Phase 3** | 11-13 | Docker, tests, CI/CD |
| **Phase 4** | 14-15 | Docs, verification, handoff |

**Total**: 15 working days (~3 calendar weeks)

---

## Next Steps After Week 0

Once Extended Week 0 is complete:
1. **Track kickoff meetings** (1 day)
2. **Track 1-4 start in parallel** (Week 1)
3. **Daily integration syncs** (15 min, 3pm)
4. **Weekly demos** (Friday 4pm)
5. **Production deployment** (Week 12)

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Services don't integrate | Daily integration tests, continuous deployment |
| Performance issues | Load testing in Week 0, baseline metrics |
| Track dependencies | Clear contracts, placeholder services, mocks |
| Database bottlenecks | Connection pooling, read replicas, caching |
| Event ordering issues | Event versioning, idempotent handlers |
| Auth token issues | Comprehensive auth tests, token refresh logic |
| Monitoring gaps | Metrics from day 1, structured logging |

---

*This plan provides the complete, production-ready foundation needed for parallel track execution.*
