# 🏗️ TIDE MICROSERVICES ARCHITECTURE

**Last Updated:** October 7, 2025
**Architecture Pattern:** Event-Driven Microservices with Shared Infrastructure

---

## TABLE OF CONTENTS

1. [Architecture Overview](#architecture-overview)
2. [Service Catalog](#service-catalog)
3. [Communication Patterns](#communication-patterns)
4. [Data Management](#data-management)
5. [Shared Libraries](#shared-libraries)
6. [Infrastructure Services](#infrastructure-services)
7. [Service Discovery & Routing](#service-discovery--routing)
8. [Scalability Patterns](#scalability-patterns)
9. [Deployment Model](#deployment-model)
10. [Trade-offs & Design Decisions](#trade-offs--design-decisions)

---

## ARCHITECTURE OVERVIEW

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATIONS                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   iOS App    │  │ Android App  │  │  Web App     │             │
│  │  (SwiftUI)   │  │  (Compose)   │  │  (React)     │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│           │                 │                │                       │
│           └─────────────────┴────────────────┘                       │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTPS / WSS
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY (Port 4000)                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  • GraphQL Federation (Apollo Gateway)                        │  │
│  │  • JWT Authentication & Verification                          │  │
│  │  • Request Routing & Load Balancing                           │  │
│  │  • Rate Limiting & CORS                                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│  REALTIME SERVICE (Port 4003)│   │   AUTH SERVICE (Port 4001)  │
│  ┌─────────────────────────┐│   │  ┌─────────────────────────┐│
│  │  • WebSocket Server     ││   │  │  • User Registration    ││
│  │  • Connection Manager   ││   │  │  • Login/Logout         ││
│  │  • Real-time Events     ││   │  │  • JWT Token Management ││
│  │  • Presence Tracking    ││   │  │  • Password Reset       ││
│  └─────────────────────────┘│   │  │  • OAuth Integration    ││
└─────────────┬───────────────┘   │  └─────────────────────────┘│
              │                   └─────────────┬───────────────┘
              │                                 │
              └───────────────┬─────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│   AI SERVICE (Port 3003)    │   │  EMAIL SERVICE (Port 3004)  │
│  ┌─────────────────────────┐│   │  ┌─────────────────────────┐│
│  │  • Multi-Model Router   ││   │  │  • Gmail Integration    ││
│  │  • 16 Specialized Agents││   │  │  • Outlook Integration  ││
│  │  • Intent Classification││   │  │  • Smart Triage         ││
│  │  • Context Builder      ││   │  │  • Smart Composer       ││
│  │  • Reasoning Engine     ││   │  │  • Relationship Intel   ││
│  │  • Learning System      ││   │  │  • Email Automation     ││
│  └─────────────────────────┘│   │  └─────────────────────────┘│
└─────────────┬───────────────┘   └─────────────┬───────────────┘
              │                                 │
              │                                 │
              ▼                                 ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│ CALENDAR SERVICE (Port 3005)│   │ WORKFLOW SERVICE (Port 3006)│
│  ┌─────────────────────────┐│   │  ┌─────────────────────────┐│
│  │  • Google Calendar      ││   │  │  • DAG Workflow Engine  ││
│  │  • Exchange Calendar    ││   │  │  • State Machine        ││
│  │  • Smart Scheduler      ││   │  │  • Task Prioritization  ││
│  │  • Conflict Resolver    ││   │  │  • Pattern Detection    ││
│  │  • Calendar Optimizer   ││   │  │  • Saga Compensation    ││
│  │  • Meeting Preparation  ││   │  │  • Automation Rules     ││
│  └─────────────────────────┘│   │  └─────────────────────────┘│
└─────────────┬───────────────┘   └─────────────┬───────────────┘
              │                                 │
              └─────────────┬───────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EVENT BUS (Kafka - Port 9092)                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Topics:                                                      │  │
│  │  • user-events          • workflow-events                     │  │
│  │  • email-events         • ai-requests                         │  │
│  │  • calendar-events      • ai-responses                        │  │
│  │  • task-events          • system-events                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │    Redis     │  │  Monitoring  │
│  (Port 5432) │  │  (Port 6379) │  │  Stack       │
│              │  │              │  │              │
│  • 11 Tables │  │  • Caching   │  │  • Prometheus│
│  • Event     │  │  • Sessions  │  │  • Grafana   │
│    Sourcing  │  │  • Rate      │  │  • Logs      │
│  • Outbox    │  │    Limiting  │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Architecture Principles

**1. Domain-Driven Design (DDD)**
- Each microservice owns a specific business domain
- Clear bounded contexts with well-defined interfaces
- Services communicate through contracts and events

**2. Event-Driven Architecture (EDA)**
- Asynchronous communication via Kafka event bus
- Services publish domain events, others subscribe
- Eventual consistency for cross-service operations

**3. Database per Service**
- Each service has its own database schema/namespace
- Shared PostgreSQL instance with logical separation
- No direct database access between services

**4. Shared Libraries**
- Common utilities extracted to `@tide/*` packages
- Type-safe contracts for inter-service communication
- Consistent error handling and logging

**5. Horizontal Scalability**
- Stateless services (except WebSocket)
- Can scale independently based on load
- Redis for distributed caching and session management

---

## SERVICE CATALOG

### Core Services

#### 1. Auth Service (Port 4001)
**Responsibility:** User authentication and authorization

**Bounded Context:**
```typescript
// Domain: User Identity & Access Management
interface AuthDomain {
  users: User[];
  refreshTokens: RefreshToken[];
  verificationTokens: VerificationToken[];
  passwordResetTokens: PasswordResetToken[];
  oauthTokens: OAuthToken[];
}
```

**Key Features:**
- ✅ User registration with email/password
- ✅ Login with JWT token generation
- ✅ Token refresh mechanism (access + refresh)
- ✅ Rate limiting (5 attempts per 15 min)
- ✅ Password hashing (bcrypt, 12 rounds)
- ⏳ OAuth integration (Google, Microsoft)
- ⏳ Email verification
- ⏳ Password reset flow

**Dependencies:**
- PostgreSQL (users, refresh_tokens tables)
- Redis (rate limiting)
- Kafka (publish user-events)

**Exposes:**
- REST API: `/auth/register`, `/auth/login`, `/auth/refresh`
- GraphQL: User queries and mutations
- Events: `user.registered`, `user.logged_in`, `user.logged_out`

**Package:**
```json
{
  "name": "@tide/auth-service",
  "dependencies": {
    "@tide/config": "workspace:*",
    "@tide/database": "workspace:*",
    "@tide/errors": "workspace:*",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express-rate-limit": "^7.5.1"
  }
}
```

---

#### 2. AI Service (Port 3003)
**Responsibility:** Multi-model AI orchestration and intelligence

**Bounded Context:**
```typescript
// Domain: Artificial Intelligence & Decision Making
interface AIDomain {
  conversations: Conversation[];
  messages: Message[];
  intents: Intent[];
  agents: Agent[];
  patterns: UserPattern[];
  preferences: AIPreference[];
}
```

**Key Features:**
- ✅ Multi-model routing (OpenAI, Anthropic, Google)
- ✅ 16 specialized agent swarm:
  - Email agents (4): Triage, Composer, Analyzer, Relationship
  - Calendar agents (3): Scheduler, Optimizer, Meeting Prep
  - Task agents (3): Prioritizer, Workflow Orchestrator, Automation Detector
  - Intelligence agents (3): Context, Pattern Learner, Predictive
  - Decision agents (2): Analyzer, Recommender
  - Meta agents (2): Quality Controller, Explainability
- ✅ Intent classification with confidence scoring
- ✅ Chain-of-thought reasoning
- ✅ User preference learning from feedback
- ⏳ Vector search (Pinecone integration)
- ⏳ Long-term memory consolidation

**Dependencies:**
- PostgreSQL (conversations, messages tables)
- Redis (conversation caching)
- Kafka (consume ai-requests, publish ai-responses)
- OpenAI API
- Anthropic API
- Google AI API
- Pinecone (vector DB)

**Exposes:**
- REST API: `/ai/chat`, `/ai/intent`, `/ai/suggest`
- GraphQL: Conversation queries and mutations
- Events: `ai.intent_detected`, `ai.response_generated`, `ai.pattern_learned`

**Architecture Pattern:**
```typescript
// Agent Swarm Coordinator
class IntelligenceOrchestrator {
  async process(request: IntelligenceRequest): Promise<IntelligenceResponse> {
    // 1. Classify intent
    const intent = await this.intentClassifier.classify(request.query);

    // 2. Build context from user history
    const context = await this.contextBuilder.buildContext(request.userId, {
      intent,
      timeWindow: '24h'
    });

    // 3. Select appropriate agents
    const agents = this.agentSelector.selectAgents(intent);

    // 4. Coordinate agent execution
    const agentResults = await Promise.all(
      agents.map(agent => agent.execute(request, context))
    );

    // 5. Route to optimal model
    const model = await this.modelRouter.selectModel({
      query: request.query,
      complexity: this.assessComplexity(intent, context)
    });

    // 6. Generate response
    const response = await model.generate({
      query: request.query,
      context,
      agentResults
    });

    // 7. Learn from interaction
    await this.learningSystem.recordInteraction(request, response);

    return response;
  }
}
```

**Package:**
```json
{
  "name": "@tide/ai-service",
  "dependencies": {
    "openai": "^4.20.0",
    "@anthropic-ai/sdk": "^0.27.0",
    "@google/generative-ai": "^0.19.0",
    "@pinecone-database/pinecone": "^3.0.0",
    "kafkajs": "^2.2.4"
  }
}
```

---

#### 3. Email Service (Port 3004)
**Responsibility:** Email management and automation

**Bounded Context:**
```typescript
// Domain: Email & Communication
interface EmailDomain {
  emails: Email[];
  threads: EmailThread[];
  labels: Label[];
  contacts: Contact[];
  relationships: RelationshipData[];
  automationRules: AutomationRule[];
}
```

**Key Features:**
- ✅ Gmail provider (Google API)
- ✅ Outlook/Exchange provider (Microsoft Graph)
- ✅ Smart triage (priority scoring, categorization)
- ✅ Smart composition (AI-powered drafts, tone adaptation)
- ✅ Relationship intelligence (contact strength, frequency)
- ✅ Email automation (archive, decline, delegate, acknowledge)
- ⏳ OAuth token management (backend ready, frontend partial)
- ⏳ Attachment handling (structure ready, S3 upload incomplete)
- ⏳ Search indexing (Elasticsearch)

**Dependencies:**
- PostgreSQL (emails, contacts tables)
- Redis (email caching)
- Kafka (consume email-events, publish email-events)
- Google APIs (Gmail)
- Microsoft Graph API (Outlook)
- S3/Object Storage (attachments)

**Exposes:**
- REST API: `/email/fetch`, `/email/send`, `/email/triage`
- GraphQL: Email queries and mutations
- Events: `email.received`, `email.triaged`, `email.sent`, `email.automated`

**Provider Pattern:**
```typescript
// Email provider abstraction
interface IEmailProvider {
  initialize(userId: UserId, tokens: OAuthTokens): Promise<void>;
  fetchEmails(filters: EmailFilters): Promise<Email[]>;
  sendEmail(draft: EmailDraft): Promise<Email>;
  deleteEmail(emailId: EmailId): Promise<void>;
  archiveEmail(emailId: EmailId): Promise<void>;
}

// Gmail implementation
class GmailProvider implements IEmailProvider {
  private gmail: gmail_v1.Gmail;

  async initialize(userId: UserId, tokens: OAuthTokens): Promise<void> {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken
    });
    this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  }

  async fetchEmails(filters: EmailFilters): Promise<Email[]> {
    const response = await this.gmail.users.messages.list({
      userId: 'me',
      maxResults: filters.limit || 50,
      q: this.buildQuery(filters)
    });

    return Promise.all(
      response.data.messages?.map(msg => this.transformMessage(msg)) || []
    );
  }
}

// Exchange implementation
class ExchangeProvider implements IEmailProvider {
  private client: Client;

  async initialize(userId: UserId, tokens: OAuthTokens): Promise<void> {
    this.client = Client.init({
      authProvider: (done) => done(null, tokens.accessToken)
    });
  }

  async fetchEmails(filters: EmailFilters): Promise<Email[]> {
    const messages = await this.client
      .api('/me/messages')
      .top(filters.limit || 50)
      .filter(this.buildFilter(filters))
      .get();

    return messages.value.map(msg => this.transformMessage(msg));
  }
}
```

**Package:**
```json
{
  "name": "@tide/email-service",
  "dependencies": {
    "googleapis": "^128.0.0",
    "@microsoft/microsoft-graph-client": "^3.0.7"
  }
}
```

---

#### 4. Calendar Service (Port 3005)
**Responsibility:** Calendar management and scheduling optimization

**Bounded Context:**
```typescript
// Domain: Calendar & Time Management
interface CalendarDomain {
  events: CalendarEvent[];
  calendars: Calendar[];
  availabilities: Availability[];
  meetingPreps: MeetingPrep[];
  conflicts: Conflict[];
  optimizations: OptimizationPlan[];
}
```

**Key Features:**
- ✅ Google Calendar integration
- ✅ Exchange Calendar integration
- ✅ Smart scheduling (availability analysis, optimal slots)
- ✅ Conflict detection (double-booking, back-to-back, travel)
- ✅ Conflict resolution (importance-based prioritization)
- ✅ Calendar optimization (meeting compression, focus time)
- ✅ Meeting preparation (briefs, talking points, attendee insights)
- ⏳ Multi-calendar sync (partial - single calendar works)
- ⏳ Video conferencing integration (Zoom, Teams, Meet)

**Dependencies:**
- PostgreSQL (events, calendars tables)
- Redis (availability caching)
- Kafka (consume calendar-events, publish calendar-events)
- Google Calendar API
- Microsoft Graph API

**Exposes:**
- REST API: `/calendar/events`, `/calendar/schedule`, `/calendar/optimize`
- GraphQL: Calendar queries and mutations
- Events: `calendar.event_created`, `calendar.conflict_detected`, `calendar.optimization_suggested`

**Scheduler Algorithm:**
```typescript
class SmartScheduler {
  async findOptimalSlots(
    existingEvents: CalendarEvent[],
    request: SchedulingRequest,
    userId: UserId
  ): Promise<SchedulingSuggestion[]> {
    // 1. Fetch user's calendar and availability
    const availability = await this.getAvailability(userId);

    // 2. Analyze preferences (work hours, meeting preferences)
    const preferences = await this.getUserPreferences(userId);

    // 3. Find all possible time slots
    const possibleSlots = this.findPossibleSlots(
      existingEvents,
      availability,
      request.duration,
      preferences.workingHours
    );

    // 4. Score each slot based on multiple factors
    const scoredSlots = possibleSlots.map(slot => ({
      ...slot,
      score: this.calculateScore(slot, {
        existingEvents,
        preferences,
        request,
        factors: {
          timeOfDay: 0.3,        // Morning meetings score higher
          adjacentMeetings: 0.2, // Batch meetings together
          focusTime: 0.3,        // Protect deep work blocks
          travelTime: 0.2        // Account for location changes
        }
      })
    }));

    // 5. Return top N suggestions
    return scoredSlots
      .sort((a, b) => b.score - a.score)
      .slice(0, request.maxSuggestions || 5);
  }

  private calculateScore(slot: TimeSlot, context: ScoringContext): number {
    let score = 1.0;

    // Prefer certain times of day
    if (context.preferences.preferredTimes.includes('morning')) {
      const hour = slot.startTime.getHours();
      score *= (hour >= 9 && hour <= 11) ? 1.2 : 0.8;
    }

    // Penalize fragmentation
    const hasAdjacentMeeting = context.existingEvents.some(event =>
      Math.abs(event.endTime.getTime() - slot.startTime.getTime()) < 15 * 60 * 1000
    );
    score *= hasAdjacentMeeting ? 1.1 : 0.9;

    // Protect focus time blocks
    const isLongSlot = slot.duration >= 120; // 2+ hours
    if (isLongSlot && context.request.requiresFocusTime) {
      score *= 1.3;
    }

    return score;
  }
}
```

**Package:**
```json
{
  "name": "@tide/calendar-service",
  "dependencies": {
    "googleapis": "^128.0.0",
    "@microsoft/microsoft-graph-client": "^3.0.7"
  }
}
```

---

#### 5. Workflow Service (Port 3006)
**Responsibility:** Task management and workflow automation

**Bounded Context:**
```typescript
// Domain: Tasks, Workflows & Automation
interface WorkflowDomain {
  tasks: Task[];
  workflows: Workflow[];
  workflowExecutions: WorkflowExecution[];
  dependencies: TaskDependency[];
  patterns: BehaviorPattern[];
  automationRules: AutomationRule[];
}
```

**Key Features:**
- ✅ DAG-based workflow engine (Directed Acyclic Graph)
- ✅ State machine with 12 states and transitions
- ✅ Saga compensation pattern (distributed transactions)
- ✅ Task prioritization engine
- ✅ Pattern detection from user behavior
- ✅ Automation rule execution
- ✅ Task dependencies and blocking
- ⏳ Visual workflow builder (UI)
- ⏳ Workflow scheduling (cron-like triggers)

**Dependencies:**
- PostgreSQL (tasks, workflows, patterns tables - 3 migration files, 28K+ LOC SQL)
- Redis (workflow state caching)
- Kafka (consume workflow-events, publish workflow-events)

**Exposes:**
- REST API: `/workflow/execute`, `/task/create`, `/pattern/detect`
- GraphQL: Task and workflow queries/mutations
- Events: `workflow.started`, `workflow.completed`, `task.created`, `pattern.detected`

**Workflow Engine Architecture:**
```typescript
// DAG Executor with Saga pattern
class WorkflowEngine {
  async executeWorkflowDAG(
    workflow: WorkflowDefinition,
    context: WorkflowContext
  ): Promise<WorkflowExecutionResult> {
    // 1. Build execution DAG
    const dag = this.buildDAG(workflow.steps);

    // 2. Topological sort for execution order
    const executionOrder = this.topologicalSort(dag);

    // 3. Execute steps with compensation tracking
    const results = new Map<WorkflowStepId, StepResult>();
    const compensations: CompensationAction[] = [];

    try {
      for (const stepId of executionOrder) {
        const step = workflow.steps.find(s => s.id === stepId)!;

        // Execute step
        const result = await this.executeStep(step, context, results);
        results.set(stepId, result);

        // Register compensation if step has it
        if (step.compensation) {
          compensations.push({
            stepId,
            compensate: async () => await this.compensateStep(step, result)
          });
        }

        // Update state
        await this.updateWorkflowState(workflow.id, {
          currentStep: stepId,
          completedSteps: results.size,
          status: 'running'
        });
      }

      return { success: true, results, compensations: [] };

    } catch (error) {
      // Execute compensations in reverse order (Saga pattern)
      logger.error({ error, workflowId: workflow.id }, 'Workflow failed, executing compensations');

      for (const compensation of compensations.reverse()) {
        try {
          await compensation.compensate();
        } catch (compensationError) {
          logger.error({ compensationError, stepId: compensation.stepId }, 'Compensation failed');
        }
      }

      return {
        success: false,
        error: error as Error,
        completedSteps: results,
        compensations
      };
    }
  }

  private buildDAG(steps: WorkflowStep[]): Map<WorkflowStepId, WorkflowStepId[]> {
    const dag = new Map<WorkflowStepId, WorkflowStepId[]>();

    for (const step of steps) {
      if (!dag.has(step.id)) {
        dag.set(step.id, []);
      }

      if (step.next) {
        const nextSteps = Array.isArray(step.next) ? step.next : [step.next];
        dag.get(step.id)!.push(...nextSteps);
      }

      if (step.dependencies) {
        for (const dep of step.dependencies) {
          if (!dag.has(dep)) {
            dag.set(dep, []);
          }
          dag.get(dep)!.push(step.id);
        }
      }
    }

    return dag;
  }
}

// Task Prioritization Engine
class TaskEngine {
  async createTask(request: TaskCreationRequest): Promise<Task> {
    const task = {
      ...request,
      priority: await this.calculatePriority(request),
      status: 'pending',
      createdAt: new Date()
    };

    // Persist task
    await this.repository.saveTask(task);

    // Publish event
    await this.eventBus.publish('task.created', task);

    return task;
  }

  private async calculatePriority(request: TaskCreationRequest): Promise<number> {
    let priority = 0.5; // Base priority

    // Factor 1: Urgency (time-based)
    if (request.dueDate) {
      const daysUntilDue = (request.dueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000);
      if (daysUntilDue < 1) priority += 0.4;
      else if (daysUntilDue < 3) priority += 0.3;
      else if (daysUntilDue < 7) priority += 0.2;
    }

    // Factor 2: Importance (user-specified or tag-based)
    if (request.tags?.includes('urgent')) priority += 0.3;
    if (request.tags?.includes('important')) priority += 0.2;
    if (request.tags?.includes('blocking')) priority += 0.2;

    // Factor 3: Dependencies (tasks blocking others are higher priority)
    const dependentTasks = await this.repository.getTasksDependingOn(request.id);
    priority += Math.min(dependentTasks.length * 0.05, 0.2);

    // Factor 4: Historical patterns (learn from user behavior)
    const userPatterns = await this.patternDetector.getUserPatterns(request.userId);
    if (userPatterns.prefersMorningTasks && new Date().getHours() < 12) {
      priority += 0.1;
    }

    return Math.min(priority, 1.0);
  }
}
```

**Package:**
```json
{
  "name": "@tide/workflow-service",
  "dependencies": {
    "kafkajs": "^2.2.4",
    "pg": "^8.11.3"
  }
}
```

---

#### 6. Realtime Service (Port 4003)
**Responsibility:** WebSocket connections and real-time events

**Bounded Context:**
```typescript
// Domain: Real-time Communication
interface RealtimeDomain {
  connections: WebSocketConnection[];
  rooms: Room[];
  presence: PresenceInfo[];
  realtimeEvents: RealtimeEvent[];
}
```

**Key Features:**
- ✅ WebSocket server (ws library)
- ✅ Connection management with JWT auth
- ✅ Automatic reconnection handling
- ✅ Event pub/sub to connected clients
- ✅ Presence tracking
- ⏳ Room-based messaging
- ⏳ Typing indicators
- ⏳ Read receipts

**Dependencies:**
- Redis (connection state, pub/sub)
- Kafka (consume all domain events for real-time push)
- Auth Service (JWT verification)

**Exposes:**
- WebSocket: `wss://api.tide.ai/realtime`
- Events: Pushes all domain events to connected clients

**WebSocket Architecture:**
```typescript
// Connection Manager
class WebSocketManager {
  private connections: Map<UserId, WebSocket> = new Map();

  async handleConnection(ws: WebSocket, request: http.IncomingMessage) {
    // 1. Authenticate via JWT
    const token = this.extractToken(request);
    const authContext = await this.verifyToken(token);

    if (!authContext.isAuthenticated) {
      ws.close(1008, 'Unauthorized');
      return;
    }

    // 2. Store connection
    this.connections.set(authContext.userId, ws);

    // 3. Send connection acknowledgment
    this.send(ws, {
      type: 'connection.established',
      userId: authContext.userId,
      timestamp: Date.now()
    });

    // 4. Subscribe to user's Kafka topics
    await this.subscribeToUserEvents(authContext.userId);

    // 5. Handle disconnection
    ws.on('close', () => {
      this.connections.delete(authContext.userId);
      this.unsubscribeFromUserEvents(authContext.userId);
    });

    // 6. Handle incoming messages
    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      this.handleMessage(authContext.userId, message);
    });
  }

  async subscribeToUserEvents(userId: UserId) {
    // Subscribe to Kafka topics for this user
    const topics = [
      `user.${userId}.email`,
      `user.${userId}.calendar`,
      `user.${userId}.task`,
      `user.${userId}.workflow`,
      `user.${userId}.ai`
    ];

    for (const topic of topics) {
      await this.kafka.subscribe(topic, (event) => {
        this.pushToUser(userId, event);
      });
    }
  }

  pushToUser(userId: UserId, event: DomainEvent) {
    const ws = this.connections.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      this.send(ws, {
        type: 'event',
        event
      });
    }
  }
}
```

**Package:**
```json
{
  "name": "@tide/realtime-service",
  "dependencies": {
    "ws": "^8.16.0",
    "jsonwebtoken": "^9.0.2"
  }
}
```

---

#### 7. Gateway Service (Port 4000)
**Responsibility:** API Gateway and GraphQL Federation

**Bounded Context:**
```typescript
// Domain: API Gateway & Routing
interface GatewayDomain {
  routes: Route[];
  authContexts: AuthContext[];
  requestMetrics: Metric[];
}
```

**Key Features:**
- ✅ GraphQL Federation (Apollo Gateway)
- ✅ JWT token verification (NEW - Oct 7)
- ✅ Request routing to microservices
- ✅ CORS and security headers
- ⏳ Subgraph stitching (template only)
- ⏳ GraphQL subscriptions
- ⏳ Response caching

**Dependencies:**
- All microservices (as subgraphs)
- Redis (response caching)

**Exposes:**
- REST API: `/health`
- GraphQL API: `/graphql`

**Federation Architecture:**
```typescript
// Apollo Gateway setup
const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'auth', url: env.AUTH_SERVICE_URL },
      { name: 'ai', url: env.AI_SERVICE_URL },
      { name: 'email', url: env.EMAIL_SERVICE_URL },
      { name: 'calendar', url: env.CALENDAR_SERVICE_URL },
      { name: 'workflow', url: env.WORKFLOW_SERVICE_URL },
    ],
  }),
  serviceHealthCheck: true,
});

// Context with JWT verification (NEW)
app.use('/graphql', expressMiddleware(server, {
  context: async ({ req }) => {
    const authContext = createAuthContext(
      req.headers.authorization,
      false // Optional auth
    );

    return {
      ...authContext,
      requestId: req.headers['x-request-id'] || `req_${Date.now()}`,
    };
  },
}));
```

**Package:**
```json
{
  "name": "@tide/gateway",
  "dependencies": {
    "@apollo/gateway": "^2.5.6",
    "@apollo/server": "^4.9.5",
    "jsonwebtoken": "^9.0.2"
  }
}
```

---

## COMMUNICATION PATTERNS

### 1. Synchronous Communication (REST/GraphQL)

**Used For:**
- Client-to-Gateway (GraphQL queries/mutations)
- Gateway-to-Services (HTTP/gRPC)
- Request-response patterns

**Example:**
```typescript
// Client -> Gateway -> Auth Service
const response = await fetch('https://api.tide.ai/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    query: `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          user { id, email, name }
          accessToken
          refreshToken
        }
      }
    `,
    variables: { email, password }
  })
});
```

**Pros:**
- Immediate response
- Simple to implement
- Easy to debug
- Strong consistency

**Cons:**
- Services are tightly coupled
- Cascading failures possible
- Harder to scale independently

---

### 2. Asynchronous Communication (Kafka Events)

**Used For:**
- Service-to-Service notifications
- Event sourcing
- Background processing
- Eventual consistency

**Event Types:**
```typescript
// User events (Auth Service)
interface UserRegisteredEvent {
  type: 'user.registered';
  userId: UserId;
  email: string;
  timestamp: number;
}

interface UserLoggedInEvent {
  type: 'user.logged_in';
  userId: UserId;
  timestamp: number;
}

// Email events (Email Service)
interface EmailReceivedEvent {
  type: 'email.received';
  userId: UserId;
  emailId: EmailId;
  from: Contact;
  subject: string;
  timestamp: number;
}

interface EmailTriagedEvent {
  type: 'email.triaged';
  userId: UserId;
  emailId: EmailId;
  priority: 'low' | 'normal' | 'high';
  suggestedAction: string;
  timestamp: number;
}

// Calendar events (Calendar Service)
interface CalendarEventCreatedEvent {
  type: 'calendar.event_created';
  userId: UserId;
  eventId: CalendarEventId;
  title: string;
  startTime: Date;
  endTime: Date;
  timestamp: number;
}

// Task events (Workflow Service)
interface TaskCreatedEvent {
  type: 'task.created';
  userId: UserId;
  taskId: TaskId;
  title: string;
  priority: number;
  dueDate?: Date;
  timestamp: number;
}

// AI events
interface AIResponseGeneratedEvent {
  type: 'ai.response_generated';
  userId: UserId;
  requestId: string;
  intent: string;
  confidence: number;
  responseTime: number;
  timestamp: number;
}
```

**Event Publishing:**
```typescript
// Service publishes event to Kafka
class EmailService {
  async triageEmail(email: Email, userId: UserId): Promise<TriageResult> {
    // 1. Perform triage logic
    const result = await this.triageEngine.triage(email);

    // 2. Store result
    await this.repository.saveTriageResult(result);

    // 3. Publish event
    await this.eventBus.publish('email-events', {
      type: 'email.triaged',
      userId,
      emailId: email.id,
      priority: result.priority,
      suggestedAction: result.strategy.type,
      timestamp: Date.now()
    });

    return result;
  }
}
```

**Event Consumption:**
```typescript
// AI Service consumes email events
class AIService {
  async init() {
    // Subscribe to email events
    await this.kafka.subscribe('email-events', async (event) => {
      if (event.type === 'email.triaged') {
        // Learn from triage patterns
        await this.learningSystem.learnFromTriage(event);

        // Update user preferences
        await this.preferenceEngine.updatePreferences(event.userId, {
          emailPriorities: { [event.emailId]: event.priority }
        });
      }
    });

    // Subscribe to calendar events
    await this.kafka.subscribe('calendar-events', async (event) => {
      if (event.type === 'calendar.event_created') {
        // Detect scheduling patterns
        await this.patternDetector.detectSchedulingPattern(event);
      }
    });
  }
}
```

**Pros:**
- Services are loosely coupled
- Easy to add new services
- Natural scalability
- Fault isolation

**Cons:**
- Eventual consistency
- Harder to debug
- More complex error handling
- Event ordering challenges

---

### 3. Hybrid Pattern (Saga Orchestration)

**Used For:**
- Distributed transactions
- Multi-service workflows
- Long-running processes

**Example: Email-to-Task Workflow**
```typescript
// User asks AI: "Create a task from this email"
// This requires coordination between Email, AI, and Workflow services

class EmailToTaskSaga {
  async execute(userId: UserId, emailId: EmailId): Promise<Task> {
    const compensation: CompensationAction[] = [];

    try {
      // Step 1: Fetch email (Email Service)
      const email = await this.emailService.getEmail(emailId);
      compensation.push(() => this.emailService.markAsUnprocessed(emailId));

      // Step 2: Extract task details (AI Service)
      const taskDetails = await this.aiService.extractTaskFromEmail(email);
      compensation.push(() => this.aiService.rollbackExtraction(emailId));

      // Step 3: Create task (Workflow Service)
      const task = await this.workflowService.createTask({
        userId,
        title: taskDetails.title,
        description: taskDetails.description,
        dueDate: taskDetails.dueDate,
        sourceEmail: emailId
      });
      compensation.push(() => this.workflowService.deleteTask(task.id));

      // Step 4: Link email to task (Email Service)
      await this.emailService.linkToTask(emailId, task.id);

      // Success!
      return task;

    } catch (error) {
      // Execute compensations in reverse order
      for (const compensate of compensation.reverse()) {
        try {
          await compensate();
        } catch (compError) {
          logger.error({ compError }, 'Compensation failed');
        }
      }
      throw error;
    }
  }
}
```

---

## DATA MANAGEMENT

### Database Strategy: Logical Separation

**Approach:**
- Single PostgreSQL instance
- Each service has its own schema namespace
- No direct database access between services

**Schema Structure:**
```sql
-- Auth Service tables
CREATE SCHEMA IF NOT EXISTS tide;

CREATE TABLE tide.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE TABLE tide.refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES tide.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email Service tables (same schema, logically separate)
CREATE TABLE tide.emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES tide.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  message_id VARCHAR(255) NOT NULL,
  subject TEXT,
  from_email VARCHAR(255),
  from_name VARCHAR(255),
  body TEXT,
  html_body TEXT,
  priority VARCHAR(20),
  status VARCHAR(20) DEFAULT 'unread',
  received_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Workflow Service tables
CREATE TABLE tide.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES tide.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  definition JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tide.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES tide.users(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES tide.workflows(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority NUMERIC(3, 2) DEFAULT 0.5,
  status VARCHAR(20) DEFAULT 'pending',
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Data Consistency Patterns

#### 1. Strong Consistency (Within Service)
```typescript
// Transaction within a single service
async function registerUser(data: RegistrationData): Promise<User> {
  return await transaction(async (client) => {
    // Create user
    const user = await client.query(
      'INSERT INTO tide.users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *',
      [data.email, data.passwordHash, data.name]
    );

    // Create user profile (atomic with user creation)
    await client.query(
      'INSERT INTO tide.user_profiles (user_id, preferences) VALUES ($1, $2)',
      [user.id, JSON.stringify({})]
    );

    return user;
  });
}
```

#### 2. Eventual Consistency (Cross-Service)
```typescript
// Email triaged -> AI learns pattern (eventual)
// Step 1: Email service triages and publishes event
await this.eventBus.publish('email-events', {
  type: 'email.triaged',
  userId,
  emailId,
  priority,
  timestamp: Date.now()
});

// Step 2: AI service eventually processes event
// (may be delayed if AI service is down)
```

#### 3. Event Sourcing
```sql
-- Event store table
CREATE TABLE tide.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_id UUID NOT NULL,
  aggregate_type VARCHAR(50) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  version INTEGER NOT NULL,
  occurred_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(aggregate_id, version)
);

-- Outbox pattern for reliable event publishing
CREATE TABLE tide.outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Event Sourcing Example:**
```typescript
class WorkflowEventStore {
  async saveEvent(event: DomainEvent): Promise<void> {
    await transaction(async (client) => {
      // 1. Save to event store
      await client.query(
        `INSERT INTO tide.events (aggregate_id, aggregate_type, event_type, event_data, version)
         VALUES ($1, $2, $3, $4, $5)`,
        [event.aggregateId, event.aggregateType, event.type, event.data, event.version]
      );

      // 2. Save to outbox for reliable publishing
      await client.query(
        `INSERT INTO tide.outbox (aggregate_id, event_type, event_data)
         VALUES ($1, $2, $3)`,
        [event.aggregateId, event.type, event.data]
      );
    });

    // 3. Async publish from outbox (separate process)
    await this.publishFromOutbox();
  }

  async publishFromOutbox(): Promise<void> {
    // Fetch unpublished events
    const unpublished = await this.query(
      'SELECT * FROM tide.outbox WHERE published_at IS NULL ORDER BY created_at LIMIT 100'
    );

    for (const event of unpublished) {
      try {
        // Publish to Kafka
        await this.kafka.send({
          topic: 'workflow-events',
          messages: [{ value: JSON.stringify(event) }]
        });

        // Mark as published
        await this.query(
          'UPDATE tide.outbox SET published_at = NOW() WHERE id = $1',
          [event.id]
        );
      } catch (error) {
        logger.error({ error, eventId: event.id }, 'Failed to publish event');
        // Will retry on next cycle
      }
    }
  }
}
```

---

## SHARED LIBRARIES

### Purpose
- Avoid code duplication
- Ensure consistency
- Simplify service development

### Library Catalog

#### 1. @tide/types
**Purpose:** Branded types and domain models

```typescript
// Branded types for type safety
export type UserId = string & { readonly __brand: 'UserId' };
export type EmailId = string & { readonly __brand: 'EmailId' };
export type TaskId = string & { readonly __brand: 'TaskId' };
export type ConversationId = string & { readonly __brand: 'ConversationId' };

// Factory functions
export function createUserId(id: string): UserId {
  return id as UserId;
}

export function createEmailId(id: string): EmailId {
  return id as EmailId;
}

// Usage prevents mixing different ID types
function getUser(userId: UserId): Promise<User> {
  // TypeScript ensures you can't pass EmailId here
}
```

#### 2. @tide/errors
**Purpose:** Standardized error handling

```typescript
// 90+ error codes across 8 domains
export enum ErrorCode {
  // Auth errors
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',

  // Email errors
  EMAIL_NOT_FOUND = 'EMAIL_NOT_FOUND',
  EMAIL_SEND_FAILED = 'EMAIL_SEND_FAILED',

  // Workflow errors
  WORKFLOW_EXECUTION_FAILED = 'WORKFLOW_EXECUTION_FAILED',
  WORKFLOW_INVALID_STATE = 'WORKFLOW_INVALID_STATE',

  // ... 80+ more
}

// Error factories
export class AuthErrors {
  static invalidCredentials(): TideError {
    return new TideError(ErrorCode.AUTH_INVALID_CREDENTIALS, 'Invalid email or password');
  }

  static tokenExpired(): TideError {
    return new TideError(ErrorCode.AUTH_TOKEN_EXPIRED, 'Token has expired');
  }
}

// Usage in services
throw AuthErrors.invalidCredentials();
```

#### 3. @tide/validation
**Purpose:** Request validation with Zod

```typescript
import { z } from 'zod';

// Schema definitions
export const UserRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  timezone: z.string().optional().default('UTC')
});

export const UserLoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// Express middleware
export function validateBody(schema: z.ZodSchema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: 'Validation failed', details: error });
    }
  };
}

// Usage
app.post('/auth/register', validateBody(UserRegistrationSchema), register);
```

#### 4. @tide/config
**Purpose:** Centralized configuration management

```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  KAFKA_BROKERS: z.string(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional()
});

export const env = envSchema.parse(process.env);

export const jwtConfig = {
  accessTokenSecret: env.JWT_ACCESS_SECRET,
  refreshTokenSecret: env.JWT_REFRESH_SECRET,
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d'
};

export const databaseConfig = {
  url: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production',
  poolMin: 2,
  poolMax: 10
};
```

#### 5. @tide/logger
**Purpose:** Structured logging with Pino

```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['password', 'token', 'accessToken', 'refreshToken'],
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res
  }
});

// Usage
logger.info({ userId, email }, 'User registered successfully');
logger.error({ error, userId }, 'Failed to process request');
logger.debug({ context }, 'Processing step completed');
```

#### 6. @tide/database
**Purpose:** Database client with query helpers

```typescript
import { Pool } from 'pg';
import { databaseConfig } from '@tide/config';

const pool = new Pool({
  connectionString: databaseConfig.url,
  ssl: databaseConfig.ssl,
  min: databaseConfig.poolMin,
  max: databaseConfig.poolMax
});

// Query helpers
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const result = await pool.query(sql, params);
  return result.rows;
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

#### 7. @tide/contracts
**Purpose:** Shared interfaces and types

```typescript
// Base request/response types
export interface BaseRequest {
  userId: string;
  requestId: string;
  timestamp: number;
}

export interface BaseResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ErrorDetail;
  metadata: ResponseMetadata;
}

// Domain types shared across services
export interface User {
  id: string;
  email: string;
  profile: UserProfile;
  preferences: UserPreferences;
}

export interface Message {
  id: string;
  userId: string;
  conversationId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}
```

---

## INFRASTRUCTURE SERVICES

### 1. PostgreSQL (Port 5432)
**Purpose:** Primary data store

**Configuration:**
```yaml
postgres:
  image: postgres:16-alpine
  environment:
    POSTGRES_USER: tide
    POSTGRES_DB: tide
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./migrations:/docker-entrypoint-initdb.d
```

**Schema:**
- 11 tables across all services
- 8 migration files (~30,000 lines SQL)
- Partitioning: Hash (conversations), Range (messages by date)
- Indexes on all foreign keys
- Full-text search enabled

### 2. Redis (Port 6379)
**Purpose:** Caching, sessions, rate limiting

**Configuration:**
```yaml
redis:
  image: redis:7-alpine
  command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
```

**Use Cases:**
- Response caching (TTL-based)
- Session storage
- Rate limiting counters
- WebSocket connection state
- Distributed locks

### 3. Kafka (Port 9092)
**Purpose:** Event streaming

**Configuration:**
```yaml
kafka:
  image: confluentinc/cp-kafka:7.5.0
  environment:
    KAFKA_NUM_PARTITIONS: 3
    KAFKA_LOG_RETENTION_HOURS: 168  # 7 days
    KAFKA_COMPRESSION_TYPE: snappy
```

**Topics:**
- `user-events` - Auth service events
- `email-events` - Email service events
- `calendar-events` - Calendar service events
- `task-events` - Task/workflow service events
- `workflow-events` - Workflow execution events
- `ai-requests` - AI service requests
- `ai-responses` - AI service responses
- `system-events` - System-wide events

### 4. Prometheus + Grafana
**Purpose:** Monitoring and metrics

**Metrics Collected:**
- HTTP request duration (p50, p95, p99)
- Request count by endpoint
- Error rate by service
- Database query duration
- Kafka lag
- CPU/Memory usage
- Custom business metrics

---

## SERVICE DISCOVERY & ROUTING

### Development (Docker Compose)
- Services communicate via Docker network (`tide-network`)
- DNS resolution: `http://auth-service:4001`

### Production (Kubernetes)
- Kubernetes Services for discovery
- Environment variables for service URLs
- Service mesh (Istio/Linkerd) for advanced routing

**Example:**
```yaml
# Kubernetes Service
apiVersion: v1
kind: Service
metadata:
  name: auth-service
spec:
  selector:
    app: auth-service
  ports:
  - port: 4001
    targetPort: 4001
  type: ClusterIP

# Other services access via: http://auth-service:4001
```

---

## SCALABILITY PATTERNS

### 1. Horizontal Scaling
- All services are stateless (except Realtime WebSocket)
- Can add more instances behind load balancer
- Kafka consumer groups for parallel processing

```yaml
# Scale auth service to 3 replicas
kubectl scale deployment/auth-service --replicas=3
```

### 2. Database Scaling
- Read replicas for read-heavy operations
- Connection pooling (pgBouncer)
- Query result caching (Redis)

### 3. Kafka Partitioning
- Events partitioned by `userId`
- Each partition processed independently
- Horizontal scaling of consumers

### 4. Caching Strategy
```typescript
// Multi-level caching
class CachingStrategy {
  async get<T>(key: string): Promise<T | null> {
    // Level 1: In-memory cache (fastest)
    const memory = this.memoryCache.get(key);
    if (memory) return memory;

    // Level 2: Redis cache
    const redis = await this.redis.get(key);
    if (redis) {
      this.memoryCache.set(key, redis, 60); // 1 minute
      return JSON.parse(redis);
    }

    // Level 3: Database (slowest)
    const db = await this.database.query(key);
    if (db) {
      await this.redis.setex(key, 300, JSON.stringify(db)); // 5 minutes
      this.memoryCache.set(key, db, 60);
      return db;
    }

    return null;
  }
}
```

---

## DEPLOYMENT MODEL

### Current: Docker Compose (Development)
```bash
# Start all services
pnpm dev:start

# Services accessible at:
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
# - Kafka: localhost:9092
# - Prometheus: localhost:9090
# - Grafana: localhost:3001
# - Kafka UI: localhost:8080
```

### Production: Kubernetes + Terraform
```
Kubernetes Cluster
├── Ingress (NGINX/Traefik)
│   └── TLS termination
├── API Gateway (3 replicas)
│   └── Service: ClusterIP
├── Auth Service (3 replicas)
│   └── Service: ClusterIP
├── AI Service (2 replicas)
│   └── Service: ClusterIP
├── Email Service (2 replicas)
│   └── Service: ClusterIP
├── Calendar Service (2 replicas)
│   └── Service: ClusterIP
├── Workflow Service (2 replicas)
│   └── Service: ClusterIP
├── Realtime Service (3 replicas with sticky sessions)
│   └── Service: ClusterIP
└── Managed Services (External)
    ├── PostgreSQL (AWS RDS / GCP Cloud SQL)
    ├── Redis (AWS ElastiCache / GCP Memorystore)
    └── Kafka (AWS MSK / Confluent Cloud)
```

---

## TRADE-OFFS & DESIGN DECISIONS

### Decision 1: Shared Database Instance
**Chosen:** Logical separation within single PostgreSQL
**Alternative:** Separate database per service

**Pros:**
- Simpler operations (one backup, one upgrade)
- Lower infrastructure cost
- Easier transactions within domain
- Foreign keys for data integrity

**Cons:**
- Services aren't fully independent
- Harder to scale specific service databases
- Potential for schema conflicts

**Rationale:** For Alpha/Beta with <10,000 users, operational simplicity outweighs theoretical purity

---

### Decision 2: Event-Driven Architecture
**Chosen:** Kafka for async communication
**Alternative:** Direct HTTP calls between services

**Pros:**
- Loose coupling
- Easy to add new services
- Natural pub/sub model
- Event replay capability

**Cons:**
- Eventual consistency
- Harder to debug
- More infrastructure

**Rationale:** Long-term scalability and flexibility more important than initial simplicity

---

### Decision 3: Monorepo with pnpm Workspaces
**Chosen:** Single repository for all services
**Alternative:** Separate repository per service

**Pros:**
- Easy to share code
- Atomic commits across services
- Simplified CI/CD
- Better developer experience

**Cons:**
- Larger repository
- All services deployed together (currently)

**Rationale:** Early stage benefits from tight integration; can split later if needed

---

### Decision 4: GraphQL Federation
**Chosen:** Apollo Gateway with federated subgraphs
**Alternative:** REST API Gateway

**Pros:**
- Single GraphQL endpoint
- Type-safe client queries
- Efficient data fetching
- Service composition

**Cons:**
- More complex setup
- Requires GraphQL knowledge
- Overhead for simple queries

**Rationale:** Better client experience and type safety worth the complexity

---

## CONCLUSION

The Tide microservices architecture is designed for:
- **Modularity**: Clear service boundaries
- **Scalability**: Horizontal scaling of stateless services
- **Resilience**: Fault isolation and graceful degradation
- **Flexibility**: Easy to add new services
- **Developer Experience**: Shared libraries and consistent patterns

**Current State:** Alpha-ready with 68% completion
**Next Steps:** Production deployment, monitoring, and scaling

---

**Document Version:** 1.0
**Last Updated:** October 7, 2025
**Author:** Development Team + Claude Code
