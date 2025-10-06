# Module 00: Foundation & Contracts

## 🤖 Claude Instance Prompt

```
You are Claude Instance #0, the Foundation Architect for Tide.

Your mission: Build the complete foundation that enables 10 other Claude instances to work in parallel without any blocking dependencies. You have 2 weeks to create all contracts, types, mocks, and infrastructure.

Key principles you must follow:
1. Every interface must be complete and well-documented
2. Every mock must behave realistically with edge cases
3. Every type must use TypeScript strict mode with no 'any'
4. Every decision must optimize for <300ms latency
5. Every contract must be immutable after Phase 0

You are building for a single-user AI Executive Assistant that:
- Responds to voice commands in <300ms
- Works offline for 80% of commands
- Uses event sourcing for complete audit trail
- Employs multi-agent reasoning for complex tasks

Read the CORE-PHILOSOPHY.md and STREAMLINED-ARCHITECTURE-FINAL.md before starting.
Your work blocks nobody, but if you fail, everyone fails.
```

## 📋 Module Overview

**Duration**: 2 weeks (14 days)
**Dependencies**: None
**Blocks**: All 10 other modules
**Critical**: This is THE most critical module

## 🎯 Success Criteria

```typescript
// All must pass before Phase 1 can begin
const successCriteria = {
  contracts: {
    defined: 12, // All service interfaces
    documented: "100%",
    immutable: true
  },
  types: {
    coverage: "100%", // Every data structure
    strictMode: true,
    anyCount: 0
  },
  mocks: {
    implementations: 12,
    realisticBehavior: true,
    edgeCases: "handled",
    latency: "<10ms" // Mocks must be fast
  },
  infrastructure: {
    monorepo: "pnpm workspaces",
    typescript: "strict mode",
    testing: "jest configured",
    ci: "github actions",
    docker: "compose ready"
  }
};
```

## 🏗️ Architecture Decisions

### 1. Monorepo Structure
```
tide/
├── packages/               # Shared packages
│   ├── contracts/         # All interfaces
│   ├── types/            # All TypeScript types
│   ├── schemas/          # Zod validation
│   └── mocks/            # Mock implementations
├── apps/                  # Applications
│   ├── api/              # Core API server
│   ├── mobile/           # React Native
│   └── web/              # Next.js
└── services/             # Microservices (if needed)
```

### 2. Contract Design Principles
- **Immutable**: Once defined, contracts never change in Phase 0
- **Complete**: Include all methods needed for the module
- **Typed**: Full TypeScript types with generics where appropriate
- **Documented**: TSDoc comments on every method
- **Versioned**: Prepared for future v2 without breaking v1

### 3. Mock Behavior Requirements
- **Stateful**: Mocks maintain state between calls
- **Realistic Delays**: Simulate network latency (10-50ms)
- **Error Scenarios**: Can simulate failures
- **Data Persistence**: In-memory but consistent
- **Deterministic**: Same input = same output (unless randomness needed)

## 📁 Detailed File Structure

### Week 1: Core Contracts & Types

#### Day 1-2: Type System Foundation
```typescript
// packages/types/src/base.types.ts
export type UUID = string & { readonly __brand: unique symbol };
export type Timestamp = number & { readonly __brand: unique symbol };
export type Email = string & { readonly __brand: unique symbol };

// Branded types for type safety
export const UUID = (id: string): UUID => id as UUID;
export const Timestamp = (ts: number): Timestamp => ts as Timestamp;
export const Email = (email: string): Email => email as Email;

// Result type for error handling
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Event sourcing types
export interface DomainEvent {
  aggregateId: UUID;
  eventId: UUID;
  eventType: string;
  eventVersion: number;
  timestamp: Timestamp;
  userId: UUID;
  data: unknown;
  metadata: EventMetadata;
}

export interface EventMetadata {
  correlationId: UUID;
  causationId: UUID;
  userId: UUID;
  source: string;
}
```

#### Day 3-4: Service Contracts
```typescript
// packages/contracts/src/IEmailService.ts
export interface IEmailService {
  /**
   * Send an email through the user's provider
   * @returns EmailId if successful
   */
  sendEmail(params: SendEmailParams): Promise<Result<EmailId>>;

  /**
   * Search emails with semantic understanding
   * @param query Natural language or semantic query
   */
  searchEmails(query: EmailQuery): Promise<Result<Email[]>>;

  /**
   * Monitor a thread for responses
   * @param threadId The email thread to monitor
   * @param callback Function called when response detected
   */
  monitorThread(
    threadId: ThreadId,
    callback: (response: EmailResponse) => void
  ): Promise<Result<void>>;

  /**
   * Get email drafting suggestions based on context
   */
  getDraftSuggestions(context: DraftContext): Promise<Result<DraftSuggestion[]>>;
}

// packages/contracts/src/ICalendarService.ts
export interface ICalendarService {
  /**
   * Check availability using pure functional approach
   * Performance requirement: <50ms for 30-day window
   */
  checkAvailability(params: AvailabilityParams): Promise<Result<TimeSlot[]>>;

  /**
   * Find overlapping availability for multiple participants
   * Uses parallel processing for performance
   */
  findMeetingTimes(
    participants: Participant[],
    constraints: MeetingConstraints
  ): Promise<Result<MeetingOption[]>>;

  /**
   * Create calendar event with conflict detection
   */
  createEvent(event: CalendarEvent): Promise<Result<EventId>>;

  /**
   * Analyze calendar health and suggest optimizations
   */
  analyzeCalendarHealth(userId: UUID): Promise<Result<CalendarHealth>>;
}

// packages/contracts/src/IAgentService.ts
export interface IAgentService {
  /**
   * Process a user request through multi-agent reasoning
   * Must use ReAct pattern with self-reflection
   */
  process(request: UserRequest): Promise<Result<AgentResponse>>;

  /**
   * Get agent's confidence in its response
   */
  getConfidence(): number;

  /**
   * Learn from user feedback
   */
  learn(feedback: UserFeedback): Promise<Result<void>>;

  /**
   * Get agent's reasoning trace for debugging
   */
  getReasoningTrace(): ReasoningStep[];
}
```

#### Day 5-6: Event & Domain Types
```typescript
// packages/types/src/domain/email.types.ts
export interface EmailDomain {
  // Aggregate root
  emailId: EmailId;
  userId: UUID;
  threadId: ThreadId;

  // Email properties
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  body: EmailBody;

  // Metadata
  provider: 'gmail' | 'outlook';
  status: 'draft' | 'sent' | 'failed';
  createdAt: Timestamp;
  sentAt?: Timestamp;

  // Relationships
  inReplyTo?: EmailId;
  references?: EmailId[];
  attachments?: Attachment[];

  // Learning
  tone: ToneAnalysis;
  importance: ImportanceScore;
  category: EmailCategory;
}

// Domain Events
export class EmailDraftCreated implements DomainEvent {
  readonly eventType = 'EmailDraftCreated';
  constructor(
    public readonly aggregateId: UUID,
    public readonly data: {
      to: EmailAddress[];
      subject: string;
      body: string;
    }
  ) {}
}

export class EmailSent implements DomainEvent {
  readonly eventType = 'EmailSent';
  constructor(
    public readonly aggregateId: UUID,
    public readonly data: {
      messageId: string;
      sentAt: Timestamp;
    }
  ) {}
}
```

### Week 2: Mocks & Infrastructure

#### Day 7-8: Realistic Mock Services
```typescript
// packages/mocks/src/MockEmailService.ts
export class MockEmailService implements IEmailService {
  private emails: Map<EmailId, EmailDomain> = new Map();
  private threads: Map<ThreadId, EmailId[]> = new Map();
  private latency = { min: 10, max: 50 }; // Simulate network

  async sendEmail(params: SendEmailParams): Promise<Result<EmailId>> {
    await this.simulateLatency();

    // Simulate validation
    if (!this.isValidEmail(params.to[0])) {
      return {
        success: false,
        error: new Error('Invalid email address')
      };
    }

    // Simulate rate limiting
    if (this.isSendingTooFast()) {
      return {
        success: false,
        error: new Error('Rate limit exceeded')
      };
    }

    const emailId = UUID(crypto.randomUUID());
    const email: EmailDomain = {
      emailId,
      userId: params.userId,
      threadId: params.threadId || UUID(crypto.randomUUID()),
      from: params.from,
      to: params.to,
      subject: params.subject,
      body: params.body,
      provider: 'gmail',
      status: 'sent',
      createdAt: Timestamp(Date.now()),
      sentAt: Timestamp(Date.now()),
      tone: this.analyzeTone(params.body),
      importance: this.calculateImportance(params),
      category: this.categorizeEmail(params)
    };

    this.emails.set(emailId, email);
    this.updateThread(email.threadId, emailId);

    // Emit event (for event sourcing mock)
    this.emitEvent(new EmailSent(emailId, {
      messageId: `mock-${emailId}`,
      sentAt: email.sentAt!
    }));

    return { success: true, data: emailId };
  }

  async searchEmails(query: EmailQuery): Promise<Result<Email[]>> {
    await this.simulateLatency();

    // Simulate semantic search
    const results = Array.from(this.emails.values())
      .filter(email => {
        // Simple text matching for mock
        const searchText = `${email.subject} ${email.body.text}`.toLowerCase();
        return searchText.includes(query.text.toLowerCase());
      })
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, query.limit || 10);

    return { success: true, data: results };
  }

  private async simulateLatency(): Promise<void> {
    const delay = Math.random() * (this.latency.max - this.latency.min) + this.latency.min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private analyzeTone(body: string): ToneAnalysis {
    // Simple mock tone analysis
    const formal = /dear|sincerely|regards/i.test(body);
    const urgent = /urgent|asap|immediately/i.test(body);
    const friendly = /thanks|appreciate|great/i.test(body);

    return {
      formality: formal ? 0.8 : 0.3,
      urgency: urgent ? 0.9 : 0.2,
      sentiment: friendly ? 0.7 : 0.5
    };
  }
}
```

#### Day 9-10: Mock Agent System
```typescript
// packages/mocks/src/MockAgentService.ts
export class MockAgentService implements IAgentService {
  private reasoningSteps: ReasoningStep[] = [];
  private confidence: number = 0;

  async process(request: UserRequest): Promise<Result<AgentResponse>> {
    this.reasoningSteps = [];

    // Step 1: Understanding
    this.addReasoningStep('understanding', {
      input: request.text,
      interpretation: this.interpretRequest(request)
    });

    // Step 2: Planning
    const plan = this.createPlan(request);
    this.addReasoningStep('planning', { plan });

    // Step 3: Execution
    const result = await this.executePlan(plan);
    this.addReasoningStep('execution', { result });

    // Step 4: Validation
    this.confidence = this.validateResult(result);
    this.addReasoningStep('validation', { confidence: this.confidence });

    // Simulate thinking time
    await this.simulateThinking(request.complexity || 'simple');

    return {
      success: true,
      data: {
        response: result,
        confidence: this.confidence,
        reasoning: this.reasoningSteps
      }
    };
  }

  private interpretRequest(request: UserRequest): IntentInterpretation {
    // Mock intent classification
    const intents = {
      'schedule': /schedule|meeting|calendar|book/i,
      'email': /email|send|reply|draft/i,
      'search': /find|search|what|when|where/i,
      'analyze': /analyze|summary|insights/i
    };

    for (const [intent, pattern] of Object.entries(intents)) {
      if (pattern.test(request.text)) {
        return {
          primary: intent,
          confidence: 0.85,
          entities: this.extractEntities(request.text)
        };
      }
    }

    return { primary: 'unknown', confidence: 0.3, entities: [] };
  }

  private async simulateThinking(complexity: string): Promise<void> {
    const delays = {
      simple: 50,
      moderate: 150,
      complex: 300
    };
    await new Promise(resolve => setTimeout(resolve, delays[complexity] || 100));
  }
}
```

#### Day 11-12: Infrastructure Setup
```typescript
// pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'services/*'

// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowJs": false,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true
  }
}

// .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

#### Day 13-14: Validation & Documentation
```typescript
// packages/contracts/validation/validate-all.test.ts
describe('Contract Validation', () => {
  it('should have all mocks implement their contracts', () => {
    // Test each mock implements interface correctly
    const emailService = new MockEmailService();
    expect(emailService).toImplement(IEmailService);
  });

  it('should have zero TypeScript errors', async () => {
    const { exitCode } = await execa('pnpm', ['typecheck']);
    expect(exitCode).toBe(0);
  });

  it('should have all mocks respond within 100ms', async () => {
    const start = performance.now();
    await mockEmailService.sendEmail(testParams);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it('should handle edge cases properly', async () => {
    // Test null, undefined, empty strings
    const result = await mockService.process({ text: '' });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

## 🧪 Testing Requirements

```typescript
// Every mock must pass these tests
interface MockRequirements {
  latency: {
    p50: "<20ms",
    p95: "<50ms",
    p99: "<100ms"
  };

  behavior: {
    stateful: true,        // Maintains state between calls
    deterministic: true,   // Same input = same output
    errorHandling: true,   // Handles errors gracefully
    edgeCases: true       // Handles null/undefined/empty
  };

  coverage: {
    branches: ">95%",
    functions: "100%",
    lines: ">95%",
    statements: ">95%"
  };
}
```

## 🎯 Performance Targets

All mocks must meet these performance targets:

```typescript
const performanceTargets = {
  // Mock response times (not including artificial delay)
  mockProcessing: {
    simple: "<5ms",
    moderate: "<10ms",
    complex: "<20ms"
  },

  // Memory usage
  memory: {
    perMock: "<10MB",
    total: "<100MB"
  },

  // Startup time
  initialization: {
    cold: "<100ms",
    warm: "<10ms"
  }
};
```

## ✅ Deliverables Checklist

### Week 1 Deliverables
- [ ] All base types defined with branded types
- [ ] All 12 service contracts complete
- [ ] All domain types and events defined
- [ ] All validation schemas (Zod) created
- [ ] Contract documentation complete
- [ ] Type coverage 100%

### Week 2 Deliverables
- [ ] All 12 mock services implemented
- [ ] Mock state management working
- [ ] Mock error scenarios handled
- [ ] Infrastructure setup complete
- [ ] CI/CD pipeline running
- [ ] All tests passing
- [ ] Documentation complete

## 🚨 Common Pitfalls to Avoid

1. **Don't use 'any' type** - Every type must be explicit
2. **Don't forget error cases** - Mocks must simulate failures
3. **Don't make mocks too simple** - They must be realistic
4. **Don't break contracts after Phase 0** - They're immutable
5. **Don't forget latency simulation** - Mocks should feel real
6. **Don't skip edge cases** - Handle null, undefined, empty
7. **Don't forget event sourcing** - Every state change = event

## 📚 Required Reading

Before starting, you must read:
1. `/docs/CORE-PHILOSOPHY.md` - Understand the principles
2. `/docs/STREAMLINED-ARCHITECTURE-FINAL.md` - Understand the architecture
3. `/docs/LATENCY-OPTIMIZATION-ARCHITECTURE.md` - Understand performance requirements

## 🎬 Day-by-Day Execution Plan

**Day 1**: Setup monorepo, create base types
**Day 2**: Define email and calendar contracts
**Day 3**: Define agent and context contracts
**Day 4**: Define event sourcing contracts
**Day 5**: Create all domain types
**Day 6**: Create all event types
**Day 7**: Implement email and calendar mocks
**Day 8**: Implement agent and context mocks
**Day 9**: Implement event sourcing mocks
**Day 10**: Implement remaining mocks
**Day 11**: Setup CI/CD and testing
**Day 12**: Create validation suite
**Day 13**: Documentation and cleanup
**Day 14**: Final validation and handoff

## 🏁 Success Validation

Run these commands to validate success:

```bash
# All must pass before Phase 1
pnpm install          # No errors
pnpm typecheck        # Zero errors
pnpm lint             # Zero warnings
pnpm test:contracts   # All mocks implement contracts
pnpm test:performance # All mocks meet targets
pnpm test:e2e         # Mock integration works
pnpm build            # Builds successfully
```

## 💡 Architecture Notes

Remember these key architectural decisions:

1. **Event Sourcing**: Every state change must emit an event
2. **CQRS**: Separate read and write models in contracts
3. **Multi-Agent**: Agents must support ReAct reasoning pattern
4. **Latency First**: Every decision should consider <300ms target
5. **Offline First**: 80% of operations should work offline
6. **Type Safety**: No 'any', branded types for domain concepts
7. **Pure Functions**: Business logic separate from I/O

Your foundation enables 10 parallel workstreams. Build it right, and the project succeeds. Build it wrong, and everything fails.

Good luck, Claude Instance #0. The entire project depends on you.