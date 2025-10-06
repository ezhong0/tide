# 🏗️ Week 0: Foundation Sprint
> Building the unshakeable foundation for Tide's 12-week transformation

## Executive Summary

Week 0 is the most critical week of the entire project. We're not just setting up infrastructure - we're establishing the patterns, principles, and platforms that will enable 6 parallel tracks to build at breakneck speed without stepping on each other.

**Goal**: By Friday at 5pm, every developer should be able to:
1. Deploy code to production in under 10 minutes
2. Access any service through standardized APIs
3. See real-time metrics and logs
4. Run the entire system locally
5. Understand exactly how their track integrates with others

## Timeline: 5 Days to Foundation

### Monday: Architecture & Environment

**Morning (9am - 12pm): Architecture Lock-In**
```yaml
Key Decisions to Finalize:
  - Monorepo structure (pnpm workspaces)
  - Service communication (GraphQL Federation + gRPC)
  - Event bus (Kafka for async, Redis Pub/Sub for real-time)
  - Database strategy (PostgreSQL primary, Redis cache, Pinecone vectors)
  - Authentication (JWT with refresh tokens)
  - Deployment (Kubernetes on AWS EKS)
```

**Afternoon (1pm - 6pm): Development Environment**
```bash
# Every developer runs this single script
./scripts/setup-foundation.sh

# Which executes:
- Install toolchain (Node 20, Python 3.11, Go 1.21, Rust)
- Configure pnpm workspaces
- Set up Docker Desktop with Kubernetes
- Initialize local databases (Postgres, Redis, Kafka)
- Configure IDE settings (VS Code workspace)
- Set up Git hooks (Husky + lint-staged)
```

### Tuesday: Core Services & Contracts

**Morning: Service Scaffolding**
```typescript
// Create base service structure for all tracks
packages/
├── shared/                    # Shared by all tracks
│   ├── types/                 # TypeScript types
│   ├── contracts/             # API contracts
│   ├── utils/                 # Common utilities
│   └── config/                # Shared configuration
├── services/
│   ├── gateway/               # API Gateway (GraphQL)
│   ├── auth/                  # Authentication service
│   ├── events/                # Event bus service
│   └── realtime/              # WebSocket service
└── libraries/
    ├── ai-client/             # GPT-5 client library
    ├── database/              # Database abstractions
    └── monitoring/            # Observability tools
```

**Afternoon: API Contracts & Types**
```typescript
// packages/shared/contracts/base.contract.ts
export interface BaseRequest {
  userId: string;
  requestId: string;
  timestamp: number;
  context?: RequestContext;
}

export interface BaseResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ErrorDetail;
  metadata: ResponseMetadata;
}

// packages/shared/types/domain.types.ts
export interface User {
  id: string;
  email: string;
  profile: UserProfile;
  preferences: UserPreferences;
  subscription: Subscription;
}

export interface Message {
  id: string;
  userId: string;
  conversationId: string;
  content: string;
  intent?: Intent;
  actions?: Action[];
  timestamp: number;
}

export interface Email {
  id: string;
  from: Contact;
  to: Contact[];
  subject: string;
  body: string;
  priority?: Priority;
  labels?: Label[];
  timestamp: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  attendees: Contact[];
  location?: Location;
  meetingType?: MeetingType;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  assignee?: string;
  dueDate?: Date;
  workflow?: WorkflowReference;
}
```

### Wednesday: Data Platform & Event System

**Morning: Database Schema**
```sql
-- Core schema that all services will use
CREATE SCHEMA tide;

-- Users table (source of truth)
CREATE TABLE tide.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table
CREATE TABLE tide.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES tide.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table (partitioned by day)
CREATE TABLE tide.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES tide.conversations(id),
    user_id UUID REFERENCES tide.users(id),
    content TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Events table for event sourcing
CREATE TABLE tide.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    user_id UUID REFERENCES tide.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_messages_conversation ON tide.messages(conversation_id);
CREATE INDEX idx_messages_user_created ON tide.messages(user_id, created_at DESC);
CREATE INDEX idx_events_aggregate ON tide.events(aggregate_id);
CREATE INDEX idx_events_type ON tide.events(event_type);
```

**Afternoon: Event Bus Setup**
```typescript
// packages/services/events/event-bus.ts
import { Kafka, Producer, Consumer } from 'kafkajs';

export class EventBus {
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Map<string, Consumer> = new Map();

  constructor() {
    this.kafka = new Kafka({
      clientId: 'tide-event-bus',
      brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092']
    });

    this.producer = this.kafka.producer();
  }

  async publish(event: DomainEvent): Promise<void> {
    await this.producer.send({
      topic: this.getTopicForEvent(event.type),
      messages: [{
        key: event.aggregateId,
        value: JSON.stringify(event),
        headers: {
          'event-type': event.type,
          'correlation-id': event.correlationId,
          'timestamp': Date.now().toString()
        }
      }]
    });
  }

  async subscribe(
    eventType: string,
    handler: EventHandler
  ): Promise<Subscription> {
    const consumer = this.kafka.consumer({
      groupId: `tide-${eventType}-consumer`
    });

    await consumer.connect();
    await consumer.subscribe({
      topic: this.getTopicForEvent(eventType)
    });

    await consumer.run({
      eachMessage: async ({ message }) => {
        const event = JSON.parse(message.value.toString());
        await handler(event);
      }
    });

    this.consumers.set(eventType, consumer);

    return {
      unsubscribe: async () => {
        await consumer.disconnect();
        this.consumers.delete(eventType);
      }
    };
  }
}

// Event types all tracks will use
export enum EventTypes {
  // User events
  USER_REGISTERED = 'user.registered',
  USER_AUTHENTICATED = 'user.authenticated',

  // Message events
  MESSAGE_RECEIVED = 'message.received',
  MESSAGE_PROCESSED = 'message.processed',

  // Email events
  EMAIL_RECEIVED = 'email.received',
  EMAIL_SENT = 'email.sent',
  EMAIL_TRIAGED = 'email.triaged',

  // Calendar events
  CALENDAR_EVENT_CREATED = 'calendar.event.created',
  CALENDAR_EVENT_UPDATED = 'calendar.event.updated',
  MEETING_SCHEDULED = 'meeting.scheduled',

  // Task events
  TASK_CREATED = 'task.created',
  TASK_COMPLETED = 'task.completed',
  WORKFLOW_STARTED = 'workflow.started',
  WORKFLOW_COMPLETED = 'workflow.completed',

  // AI events
  INTENT_DETECTED = 'ai.intent.detected',
  ACTION_SUGGESTED = 'ai.action.suggested',
  PATTERN_DETECTED = 'ai.pattern.detected'
}
```

### Thursday: Shared Services & Authentication

**Morning: Authentication Service**
```typescript
// packages/services/auth/auth.service.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Redis } from 'ioredis';

export class AuthenticationService {
  private redis: Redis;
  private accessTokenSecret: string;
  private refreshTokenSecret: string;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET!;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET!;
  }

  async authenticate(email: string, password: string): Promise<AuthResult> {
    const user = await this.getUserByEmail(email);

    if (!user) {
      throw new AuthError('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      throw new AuthError('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);

    // Store refresh token
    await this.redis.set(
      `refresh:${user.id}`,
      tokens.refreshToken,
      'EX',
      30 * 24 * 60 * 60 // 30 days
    );

    return {
      user: this.sanitizeUser(user),
      tokens
    };
  }

  private async generateTokens(user: User): Promise<TokenPair> {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles
    };

    const accessToken = jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: '15m'
    });

    const refreshToken = jwt.sign(
      { sub: user.id },
      this.refreshTokenSecret,
      { expiresIn: '30d' }
    );

    return { accessToken, refreshToken };
  }

  async validateToken(token: string): Promise<TokenPayload> {
    try {
      return jwt.verify(token, this.accessTokenSecret) as TokenPayload;
    } catch (error) {
      throw new AuthError('Invalid token');
    }
  }
}
```

**Afternoon: API Gateway**
```typescript
// packages/services/gateway/gateway.ts
import { ApolloServer } from '@apollo/server';
import { ApolloGateway } from '@apollo/gateway';
import { expressMiddleware } from '@apollo/server/express4';

export class APIGateway {
  private server: ApolloServer;
  private gateway: ApolloGateway;

  async initialize() {
    // Set up federation
    this.gateway = new ApolloGateway({
      serviceList: [
        { name: 'auth', url: 'http://auth:4001/graphql' },
        { name: 'conversation', url: 'http://conversation:4002/graphql' },
        { name: 'email', url: 'http://email:4003/graphql' },
        { name: 'calendar', url: 'http://calendar:4004/graphql' },
        { name: 'workflow', url: 'http://workflow:4005/graphql' }
      ]
    });

    this.server = new ApolloServer({
      gateway: this.gateway,
      plugins: [
        this.rateLimitPlugin(),
        this.cachingPlugin(),
        this.tracingPlugin()
      ]
    });

    // Apply middleware
    app.use(
      '/graphql',
      cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') }),
      this.authMiddleware(),
      expressMiddleware(this.server, {
        context: async ({ req }) => ({
          user: req.user,
          requestId: req.headers['x-request-id'] || generateRequestId(),
          startTime: Date.now()
        })
      })
    );
  }

  private authMiddleware() {
    return async (req, res, next) => {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (token) {
        try {
          const payload = await authService.validateToken(token);
          req.user = payload;
        } catch (error) {
          // Continue without user for public endpoints
        }
      }

      next();
    };
  }
}
```

### Friday: Testing, Documentation & Integration

**Morning: Testing Framework**
```typescript
// packages/shared/testing/test-helpers.ts
import { Test } from '@nestjs/testing';
import { Client } from 'pg';

export class TestHelpers {
  static async setupTestDatabase(): Promise<Client> {
    const client = new Client({
      connectionString: process.env.TEST_DATABASE_URL
    });

    await client.connect();
    await client.query('CREATE SCHEMA IF NOT EXISTS tide_test');
    await this.runMigrations(client);

    return client;
  }

  static async cleanupTestDatabase(client: Client): Promise<void> {
    await client.query('DROP SCHEMA tide_test CASCADE');
    await client.end();
  }

  static createMockUser(): User {
    return {
      id: generateId(),
      email: faker.internet.email(),
      profile: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName()
      }
    };
  }

  static async createAuthenticatedRequest(): Promise<AuthenticatedRequest> {
    const user = this.createMockUser();
    const tokens = await authService.generateTokens(user);

    return {
      headers: {
        authorization: `Bearer ${tokens.accessToken}`
      },
      user
    };
  }
}

// Integration test example
describe('Foundation Integration', () => {
  it('should handle end-to-end message flow', async () => {
    // Create test user
    const user = await TestHelpers.createMockUser();

    // Authenticate
    const auth = await authService.authenticate(user.email, 'password');

    // Send message through gateway
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${auth.tokens.accessToken}`)
      .send({
        query: `
          mutation SendMessage($content: String!) {
            sendMessage(content: $content) {
              id
              content
              timestamp
            }
          }
        `,
        variables: { content: 'Test message' }
      });

    expect(response.status).toBe(200);
    expect(response.body.data.sendMessage).toBeDefined();

    // Verify event was published
    const events = await eventStore.getEvents('message.received');
    expect(events).toHaveLength(1);
  });
});
```

**Afternoon: Documentation & Handoff**
```markdown
# Tide Foundation Documentation

## Quick Start

```bash
# Clone and setup
git clone https://github.com/tide/tide.git
cd tide
./scripts/setup-foundation.sh

# Run locally
pnpm dev

# Run tests
pnpm test

# Deploy to staging
pnpm deploy:staging
```

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                 API Gateway                      │
│              (GraphQL Federation)                │
└─────────────────────────────────────────────────┘
                        │
    ┌───────────────────┼───────────────────┐
    │                   │                   │
┌───▼────┐      ┌──────▼──────┐     ┌─────▼─────┐
│  Auth  │      │ Conversation │     │   Email   │
│Service │      │   Service    │     │  Service  │
└────────┘      └──────────────┘     └───────────┘
    │                   │                   │
    └───────────────────┼───────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│                 Event Bus                       │
│                  (Kafka)                        │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│              Data Platform                      │
│   PostgreSQL │ Redis │ Pinecone │ ClickHouse   │
└─────────────────────────────────────────────────┘
```

## Service Communication

1. **Synchronous**: GraphQL for queries, gRPC for internal
2. **Asynchronous**: Kafka events for decoupling
3. **Real-time**: WebSocket for UI updates

## For Each Track

### Track 1: Mobile Apps
- Use `@tide/ai-client` for AI calls
- Subscribe to WebSocket at `wss://api.tide.ai/realtime`
- Auth tokens in `Authorization: Bearer <token>`

### Track 2: AI Intelligence
- Publish events to `ai.*` topics
- Use `@tide/contracts` for type safety
- Store vectors in Pinecone index `tide-embeddings`

### Track 3: Email & Calendar
- OAuth configs in `packages/shared/config/oauth.ts`
- Publish to `email.*` and `calendar.*` topics
- Use transaction pattern for multi-step operations

### Track 4: Task & Workflow
- State management via `@tide/database`
- Workflow definitions in `packages/shared/workflows`
- Use saga pattern for compensations

### Track 5: Backend Infrastructure
- All services extend `BaseService` class
- Health checks at `/health`
- Metrics exposed at `/metrics`

### Track 6: Data & Analytics
- Raw events in Kafka
- Aggregations in ClickHouse
- ML features in `tide.features` table
```

## Deployment Infrastructure

**Docker Compose for Local Development**
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: tide
      POSTGRES_USER: tide
      POSTGRES_PASSWORD: tide_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    depends_on:
      - zookeeper
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    ports:
      - "9092:9092"

  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000

  gateway:
    build: ./packages/services/gateway
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://tide:tide_dev@postgres:5432/tide
      - REDIS_URL=redis://redis:6379
      - KAFKA_BROKERS=kafka:9092
    depends_on:
      - postgres
      - redis
      - kafka

volumes:
  postgres_data:
```

**Kubernetes Manifests for Production**
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: tide-production

---
# k8s/gateway-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: tide-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: gateway
        image: tide/gateway:latest
        ports:
        - containerPort: 4000
        env:
        - name: NODE_ENV
          value: production
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 4000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## CI/CD Pipeline

**.github/workflows/foundation.yml**
```yaml
name: Foundation CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test

      - name: Run type checks
        run: pnpm type-check

      - name: Run linter
        run: pnpm lint

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker images
        run: |
          docker build -t tide/gateway:${{ github.sha }} ./packages/services/gateway
          docker build -t tide/auth:${{ github.sha }} ./packages/services/auth

      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push tide/gateway:${{ github.sha }}
          docker push tide/auth:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/api-gateway gateway=tide/gateway:${{ github.sha }} -n tide-production
          kubectl rollout status deployment/api-gateway -n tide-production
```

## Monitoring & Observability

**Prometheus Metrics**
```typescript
// packages/shared/monitoring/metrics.ts
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

export class Metrics {
  private registry: Registry;

  // Business metrics
  public messagesProcessed: Counter;
  public emailsTriaged: Counter;
  public meetingsScheduled: Counter;
  public workflowsExecuted: Counter;

  // System metrics
  public requestDuration: Histogram;
  public activeUsers: Gauge;
  public errorRate: Counter;

  constructor() {
    this.registry = new Registry();

    this.messagesProcessed = new Counter({
      name: 'tide_messages_processed_total',
      help: 'Total number of messages processed',
      labelNames: ['user_id', 'intent']
    });

    this.requestDuration = new Histogram({
      name: 'tide_request_duration_seconds',
      help: 'Request duration in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.1, 0.3, 0.5, 1, 3, 5, 10]
    });

    this.activeUsers = new Gauge({
      name: 'tide_active_users',
      help: 'Number of active users'
    });

    this.registry.registerMetric(this.messagesProcessed);
    this.registry.registerMetric(this.requestDuration);
    this.registry.registerMetric(this.activeUsers);
  }
}
```

## Security Configuration

**.env.example**
```bash
# Environment
NODE_ENV=development

# Database
DATABASE_URL=postgresql://tide:password@localhost:5432/tide
REDIS_URL=redis://localhost:6379

# Authentication
JWT_ACCESS_SECRET=your-access-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
BCRYPT_ROUNDS=10

# AI Services
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Event Bus
KAFKA_BROKERS=localhost:9092

# Monitoring
SENTRY_DSN=your-sentry-dsn
DATADOG_API_KEY=your-datadog-key

# External Services
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
EXCHANGE_CLIENT_ID=your-exchange-client-id
EXCHANGE_CLIENT_SECRET=your-exchange-client-secret
```

## Success Criteria Checklist

By end of Friday, all developers can:

- [ ] Run entire system locally with one command
- [ ] Deploy to staging with CI/CD
- [ ] Access any service through GraphQL gateway
- [ ] Publish and subscribe to events
- [ ] Run integration tests
- [ ] See metrics and logs in Grafana
- [ ] Authenticate and get JWT tokens
- [ ] Access shared types and contracts
- [ ] Use the design system components
- [ ] Understand how their track integrates

## Team Coordination

### Daily Standups (3:00 PM)
- 15 minutes max
- Each track: blockers only
- Integration issues prioritized

### End-of-Day Sync (5:00 PM)
- Verify integration tests passing
- Commit all changes
- Update documentation

### Friday Demo (4:00 PM)
- Each track demos their foundation
- Full system integration test
- Sign-off from all track leads

## Next Steps for Each Track

### Monday Week 1 - Hit the Ground Running

**Track 1 (Mobile)**: Start building chat UI on top of WebSocket connection
**Track 2 (AI)**: Implement first 5 agents using event bus
**Track 3 (Email)**: Connect Gmail OAuth using auth service
**Track 4 (Workflow)**: Build state machine on top of event sourcing
**Track 5 (Backend)**: Scale testing the gateway
**Track 6 (Data)**: Start streaming events to ClickHouse

---

*Foundation Week 0 - Built to Last, Built to Scale* 🚀