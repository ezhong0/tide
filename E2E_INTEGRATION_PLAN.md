# 🔌 E2E Testing System - Integration Plan

**Current State**: Your codebase is **NOT** ready for the redesigned E2E testing system.
**Required Work**: Significant refactoring to introduce dependency injection, interfaces, and events.

---

## Gap Analysis

### ❌ **Gap 1: No Dependency Injection**

**Current State**:
```typescript
// packages/services/ai/src/server-gpt5.ts
export class TideAIServer {
  constructor(config: Partial<ServerConfig> = {}) {
    // Hardcoded dependency creation
    this.orchestrator = new GPT5Orchestrator({
      apiKey: this.config.openaiApiKey || 'sk-dummy-key-for-startup',
      model: this.config.model,
    });
  }
}

// packages/services/ai/src/orchestration/gpt5-orchestrator.ts
export class GPT5Orchestrator {
  constructor(config: GPT5OrchestratorConfig) {
    // Creates its own OpenAI client
    this.client = new OpenAI({ apiKey: config.apiKey });
  }

  async process(request: AIRequest, context: ToolContext): Promise<AIResponse> {
    // Uses global singleton
    const result = await toolRegistry.execute(call.function.name, args, context);
  }
}
```

**Problem**:
- Can't inject mock implementations for testing
- Can't swap OpenAI for a test double
- Can't intercept tool executions
- Tightly coupled to concrete implementations

**Required**:
```typescript
// ✅ With DI
export interface IOrchestrator {
  process(request: AIRequest, context: ToolContext): Promise<AIResponse>;
}

export interface IToolRegistry {
  execute(name: string, params: any, context: ToolContext): Promise<ToolExecutionResult>;
  getAll(): TideTool[];
}

export class GPT5Orchestrator implements IOrchestrator {
  constructor(
    private readonly client: OpenAI,  // Injected!
    private readonly toolRegistry: IToolRegistry,  // Injected!
    private readonly config: GPT5OrchestratorConfig,
  ) {}
}
```

---

### ❌ **Gap 2: Singleton Pattern (Global State)**

**Current State**:
```typescript
// packages/services/ai/src/tools/registry.ts
export class ToolRegistry { /* ... */ }

// Singleton instance
export const toolRegistry = new ToolRegistry();
```

**Problem**:
- Global mutable state
- Tests can't run in parallel (shared registry)
- Can't have isolated test environments
- One test's tool registration affects all tests

**Required**:
```typescript
// ✅ Instance-based, injected
export class ToolRegistry implements IToolRegistry {
  // No singleton, just a class
}

// Create instances via DI
container.bind('IToolRegistry', () => new ToolRegistry());

// Each test gets its own
const testContainer = container.createChild();
const isolatedRegistry = testContainer.resolve<IToolRegistry>('IToolRegistry');
```

---

### ❌ **Gap 3: No Interfaces/Abstractions**

**Current State**:
```typescript
// Everything is concrete
export class GPT5Orchestrator { }
export class ToolRegistry { }
export class TideAIServer { }

// Direct imports everywhere
import { toolRegistry } from './tools/registry.js';
import { GPT5Orchestrator } from './orchestration/gpt5-orchestrator.js';
```

**Problem**:
- Can't substitute implementations
- Can't create mocks/stubs
- Violates Dependency Inversion Principle
- Hard to test in isolation

**Required**:
```typescript
// ✅ Define interfaces
export interface IOrchestrator {
  process(request: AIRequest, context: ToolContext): Promise<AIResponse>;
}

export interface IToolRegistry {
  execute(name: string, params: any, context: ToolContext): Promise<ToolExecutionResult>;
  register(tool: TideTool): void;
  getAll(): TideTool[];
}

export interface IAIServer {
  start(): Promise<void>;
  stop(): Promise<void>;
}

// Implementations
export class GPT5Orchestrator implements IOrchestrator { }
export class ToolRegistry implements IToolRegistry { }
export class TideAIServer implements IAIServer { }

// Depend on interfaces, not implementations
class SomeService {
  constructor(private orchestrator: IOrchestrator) {}  // Interface!
}
```

---

### ❌ **Gap 4: No Event Emission (Can't Trace)**

**Current State**:
```typescript
// packages/services/ai/src/tools/registry.ts
async execute(name: string, params: any, context: ToolContext): Promise<ToolExecutionResult> {
  const tool = this.tools.get(name);

  // Just executes, no events
  const result = await tool.handler(params, context);

  return {
    success: true,
    result,
    executionTime,
  };
}
```

**Problem**:
- Can't trace tool executions
- Can't build execution graph
- Have to mutate code to add tracing
- No way to observe without modification

**Required**:
```typescript
// ✅ Event-driven
export interface IEventBus {
  emit<T extends DomainEvent>(event: T): void;
  subscribe<T>(eventType: new (...args) => T, handler: (event: T) => void): void;
}

export class ToolRegistry implements IToolRegistry {
  constructor(private readonly eventBus: IEventBus) {}

  async execute(name: string, params: any, context: ToolContext): Promise<ToolExecutionResult> {
    // Emit start event
    this.eventBus.emit(new ToolExecutionStartedEvent(name, params, context));

    const result = await tool.handler(params, context);

    // Emit completion event
    this.eventBus.emit(new ToolExecutionCompletedEvent(name, params, result));

    return result;
  }
}

// Tracer subscribes to events (no code mutation needed!)
eventBus.subscribe(ToolExecutionStartedEvent, (event) => {
  tracer.recordStep({ type: 'tool_start', toolName: event.toolName });
});
```

---

### ❌ **Gap 5: Hardcoded Configuration Access**

**Current State**:
```typescript
// packages/libraries/database/src/client.ts
import { supabaseConfig } from '@tide/config';

export function createSupabase(useServiceRole: boolean = true): SupabaseClient {
  // Hardcoded access to global config
  if (!supabaseConfig.url) {
    throw new Error('SUPABASE_URL is required');
  }

  return createSupabaseClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);
}
```

**Problem**:
- Can't use different config for tests
- Reads from environment variables directly
- Can't inject test database URL

**Required**:
```typescript
// ✅ Config as dependency
export interface ISupabaseClientFactory {
  create(useServiceRole: boolean): SupabaseClient;
}

export class SupabaseClientFactory implements ISupabaseClientFactory {
  constructor(private readonly config: SupabaseConfig) {}  // Injected!

  create(useServiceRole: boolean = true): SupabaseClient {
    const key = useServiceRole ? this.config.serviceRoleKey : this.config.anonKey;
    return createSupabaseClient(this.config.url, key);
  }
}

// In tests
const testConfig: SupabaseConfig = {
  url: 'http://localhost:54321',  // Test database
  serviceRoleKey: 'test-key',
};
const factory = new SupabaseClientFactory(testConfig);
```

---

### ❌ **Gap 6: HTTP Client in Tools (Can't Mock)**

**Current State**:
```typescript
// packages/services/ai/src/tools/email.tools.ts
handler: async (params, context) => {
  // Direct fetch call - can't intercept
  const response = await fetch(`${serviceUrls.email}/api/emails/search`, {
    method: 'POST',
    headers: { /* ... */ },
    body: JSON.stringify({ /* ... */ }),
  });

  return await response.json();
}
```

**Problem**:
- Makes real HTTP calls in tests
- Can't mock email service responses
- Slow tests (network I/O)
- Need actual services running

**Required**:
```typescript
// ✅ HTTP client as interface
export interface IHttpClient {
  post<T>(url: string, body: any, headers?: Record<string, string>): Promise<T>;
  get<T>(url: string, headers?: Record<string, string>): Promise<T>;
}

export class EmailTool implements ITool {
  constructor(
    private readonly httpClient: IHttpClient,
    private readonly config: ServiceConfig,
  ) {}

  async execute(params: any, context: ToolContext): Promise<any> {
    // Uses injected client
    return await this.httpClient.post(
      `${this.config.emailServiceUrl}/api/emails/search`,
      params
    );
  }
}

// In tests: inject mock
const mockHttp: IHttpClient = {
  post: async () => ({ emails: [/* mock data */] }),
};
const emailTool = new EmailTool(mockHttp, config);
```

---

## Integration Strategy

### Option 1: **Gradual Migration** (Recommended) ⭐

**Approach**: Refactor incrementally without breaking production.

**Steps**:

#### Phase 1: Add Interfaces (2 days)
```typescript
// 1. Define interfaces alongside existing code
// packages/services/ai/src/interfaces/IOrchestrator.ts
export interface IOrchestrator {
  process(request: AIRequest, context: ToolContext): Promise<AIResponse>;
}

// 2. Make existing classes implement interfaces
export class GPT5Orchestrator implements IOrchestrator {
  // Existing code stays the same
}

// 3. No breaking changes yet
```

#### Phase 2: Add DI Container (3 days)
```typescript
// 1. Create DI container (separate from existing code)
// packages/services/ai/src/di/container.ts
export const container = new DIContainer();

// 2. Register existing implementations
container.bind('IOrchestrator', () => new GPT5Orchestrator({
  apiKey: process.env.OPENAI_API_KEY!,
}));

// 3. Add factory function that uses DI
export function createOrchestratorWithDI(): IOrchestrator {
  return container.resolve<IOrchestrator>('IOrchestrator');
}

// 4. Keep existing createOrchestrator() for compatibility
export function createOrchestrator(config: Config): GPT5Orchestrator {
  return new GPT5Orchestrator(config);  // Legacy path
}
```

#### Phase 3: Refactor Constructor Injection (5 days)
```typescript
// 1. Refactor one class at a time
// Before
export class GPT5Orchestrator {
  constructor(config: GPT5OrchestratorConfig) {
    this.client = new OpenAI({ apiKey: config.apiKey });  // Create inside
  }
}

// After
export class GPT5Orchestrator {
  constructor(
    config: GPT5OrchestratorConfig,
    private readonly client?: OpenAI,  // Optional for backward compatibility
    private readonly toolRegistry?: IToolRegistry,
  ) {
    // Use injected OR create (backward compatible)
    this.client = client || new OpenAI({ apiKey: config.apiKey });
    this.toolRegistry = toolRegistry || globalToolRegistry;
  }
}

// 2. Update DI container
container.bind('OpenAI', () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY! }));
container.bind('IOrchestrator', () => {
  const client = container.resolve<OpenAI>('OpenAI');
  const registry = container.resolve<IToolRegistry>('IToolRegistry');
  return new GPT5Orchestrator(config, client, registry);  // Fully injected
});
```

#### Phase 4: Add Event Bus (3 days)
```typescript
// 1. Create event bus
const eventBus = new EventBus();

// 2. Wrap existing registry to emit events
export class EventEmittingToolRegistry implements IToolRegistry {
  constructor(
    private readonly baseRegistry: ToolRegistry,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(name: string, params: any, context: ToolContext): Promise<ToolExecutionResult> {
    this.eventBus.emit(new ToolExecutionStartedEvent(name, params));

    const result = await this.baseRegistry.execute(name, params, context);

    this.eventBus.emit(new ToolExecutionCompletedEvent(name, params, result));

    return result;
  }
}

// 3. Register wrapper in DI
container.bind('IToolRegistry', () => {
  const base = new ToolRegistry();
  const eventBus = container.resolve<IEventBus>('IEventBus');
  return new EventEmittingToolRegistry(base, eventBus);
});
```

#### Phase 5: E2E Testing Integration (2 days)
```typescript
// Now the E2E system can integrate!

// 1. Create test container
const testContainer = container.createChild();

// 2. Override with test implementations
testContainer.bind('IToolRegistry', () => new InMemoryToolRegistry());
testContainer.bind('ISupabaseClientFactory', () => new MockSupabaseClientFactory());
testContainer.bind('IHttpClient', () => new MockHttpClient());

// 3. Execute tests with isolated dependencies
const executor = testContainer.resolve<ExecuteTestUseCase>('ExecuteTestUseCase');
const result = await executor.execute(testCase);
```

**Total Time**: **15 days** (~3 weeks)

---

### Option 2: **Adapter Pattern** (Faster, Less Invasive)

**Approach**: Create adapters for E2E testing without modifying production code.

**Implementation**:
```typescript
// packages/testing/infrastructure/src/adapters/TideOrchestratorAdapter.ts

export class TideOrchestratorAdapter implements IExecutionEngine {
  private orchestrator: GPT5Orchestrator;
  private eventBus: IEventBus;

  constructor(
    config: GPT5OrchestratorConfig,
    eventBus: IEventBus,
  ) {
    this.orchestrator = new GPT5Orchestrator(config);
    this.eventBus = eventBus;

    // Intercept tool execution by wrapping
    this.interceptToolRegistry();
  }

  async execute(params: ExecutionParams): Promise<ExecutionResult> {
    const response = await this.orchestrator.process(
      { content: params.prompt, userId: params.userId, context: {} },
      params.context
    );

    return {
      content: response.content,
      metadata: response.metadata,
    };
  }

  private interceptToolRegistry(): void {
    // HACK: Monkey-patch the singleton (only for tests!)
    const originalExecute = toolRegistry.execute.bind(toolRegistry);

    toolRegistry.execute = async (name: string, params: any, context: ToolContext) => {
      // Emit event
      this.eventBus.emit(new ToolExecutionStartedEvent(name, params, context));

      try {
        const result = await originalExecute(name, params, context);

        // Emit completion
        this.eventBus.emit(new ToolExecutionCompletedEvent(name, params, result, true));

        return result;
      } catch (error: any) {
        this.eventBus.emit(new ToolExecutionCompletedEvent(name, params, null, false, error));
        throw error;
      }
    };
  }
}
```

**Pros**:
- ✅ No changes to production code
- ✅ Fast to implement (2-3 days)
- ✅ Testing system works immediately

**Cons**:
- ❌ Monkey-patching is brittle
- ❌ Harder to maintain
- ❌ Still has global state issues
- ❌ Can't run tests in parallel

**When to use**: If you need E2E testing **immediately** and can't afford refactoring.

---

### Option 3: **Full Rewrite** (Best Long-Term, Most Work)

**Approach**: Rewrite AI service with proper architecture from scratch.

**Steps**:
1. Create new `packages/services/ai-v2/` with clean architecture
2. Implement with DI, interfaces, events from the start
3. Run both services in parallel
4. Gradually migrate endpoints to v2
5. Deprecate v1

**Time**: **4-6 weeks**

**Pros**:
- ✅ Perfect architecture
- ✅ No technical debt
- ✅ Follows all best practices

**Cons**:
- ❌ Significant time investment
- ❌ Risk of breaking production
- ❌ Need to maintain two codebases temporarily

---

## Recommended Path

### **Hybrid Approach**: Start with Adapter, Migrate Gradually

1. **Week 1: Adapter Pattern** (E2E testing works, not perfect)
   - Implement `TideOrchestratorAdapter`
   - Monkey-patch for event emission
   - Get E2E tests running
   - **Deliverable**: Working E2E test suite

2. **Week 2-3: Add Interfaces + DI** (Improve architecture)
   - Define all interfaces
   - Add DI container
   - Refactor constructors (backward compatible)
   - **Deliverable**: Cleaner architecture, still works

3. **Week 4: Event Bus** (Remove monkey-patching)
   - Implement proper event bus
   - Wrap existing code with event emitters
   - Replace adapter's monkey-patching
   - **Deliverable**: Clean event-driven tracing

4. **Week 5: Polish** (Production-ready)
   - Remove backward compatibility
   - Full dependency injection
   - Parallel test execution
   - **Deliverable**: Production-grade testing system

---

## Implementation Checklist

### Phase 1: Quick Start (Adapter Pattern)

- [ ] Create `TideOrchestratorAdapter` class
- [ ] Implement event interception via monkey-patching
- [ ] Test with single E2E test case
- [ ] Verify tracing works
- [ ] Run full test suite

### Phase 2: Interface Definition

- [ ] Define `IOrchestrator` interface
- [ ] Define `IToolRegistry` interface
- [ ] Define `IHttpClient` interface
- [ ] Define `ISupabaseClientFactory` interface
- [ ] Make existing classes implement interfaces

### Phase 3: DI Container

- [ ] Install DI library or create custom container
- [ ] Create container setup
- [ ] Register existing implementations
- [ ] Create factory functions
- [ ] Add tests for DI container

### Phase 4: Constructor Injection

- [ ] Refactor `GPT5Orchestrator` constructor
- [ ] Refactor `ToolRegistry` (remove singleton)
- [ ] Refactor tool handlers (inject HTTP client)
- [ ] Update all tool constructors
- [ ] Add backward compatibility

### Phase 5: Event Bus

- [ ] Implement `IEventBus` interface
- [ ] Create `EventBus` class
- [ ] Define domain events
- [ ] Wrap `ToolRegistry` with event emitter
- [ ] Remove monkey-patching from adapter
- [ ] Test event-driven tracing

### Phase 6: Integration

- [ ] Update E2E testing system to use interfaces
- [ ] Create test doubles (mocks, stubs)
- [ ] Implement parallel test execution
- [ ] Add chaos testing
- [ ] Performance testing
- [ ] Documentation

---

## Code Examples

### Minimal Changes to Get Started

```typescript
// 1. Create adapter (1 hour)
// packages/testing/infrastructure/src/adapters/TideAdapter.ts

import { GPT5Orchestrator } from '@tide/ai-service';
import type { IExecutionEngine, IEventBus } from '@tide/testing-core';

export class TideAdapter implements IExecutionEngine {
  constructor(
    private readonly orchestrator: GPT5Orchestrator,
    private readonly eventBus: IEventBus,
  ) {
    this.interceptToolRegistry();
  }

  async execute(params: ExecutionParams): Promise<ExecutionResult> {
    return await this.orchestrator.process(
      { content: params.prompt, userId: params.userId, context: {} },
      { userId: params.userId, supabaseClient: params.environment.supabaseClient }
    );
  }

  private interceptToolRegistry(): void {
    // Monkey-patch toolRegistry.execute to emit events
    const { toolRegistry } = require('@tide/ai-service');
    const original = toolRegistry.execute.bind(toolRegistry);

    toolRegistry.execute = async (name, params, context) => {
      this.eventBus.emit(new ToolExecutionStartedEvent(name, params));
      const result = await original(name, params, context);
      this.eventBus.emit(new ToolExecutionCompletedEvent(name, params, result));
      return result;
    };
  }
}

// 2. Use in E2E tests (30 minutes)
// packages/testing/e2e-runner/src/setup.ts

const container = setupContainer({
  // ... config
});

// Register adapter as execution engine
container.bind('IExecutionEngine', () => {
  const eventBus = container.resolve<IEventBus>('IEventBus');
  const orchestrator = new GPT5Orchestrator({
    apiKey: process.env.OPENAI_API_KEY!,
  });

  return new TideAdapter(orchestrator, eventBus);
});

// 3. Run tests!
const executor = container.resolve<ExecuteTestUseCase>('ExecuteTestUseCase');
const result = await executor.execute(testCase);
```

**Time to first E2E test**: **~2 hours**

---

## Risk Assessment

### Low Risk (Quick Wins)
- ✅ Add interfaces (no code changes)
- ✅ Create adapter (isolated)
- ✅ Add event bus (isolated)

### Medium Risk (Careful Changes)
- ⚠️ Refactor constructors (backward compatible)
- ⚠️ Wrap with decorators (test thoroughly)

### High Risk (Breaking Changes)
- 🔴 Remove singleton pattern (breaks existing code)
- 🔴 Force DI everywhere (requires coordination)
- 🔴 Change public APIs (affects consumers)

---

## Timeline Summary

| Approach | Time | Risk | E2E Ready | Production Quality |
|----------|------|------|-----------|-------------------|
| **Adapter** | 2 days | Low | ✅ Yes | ⚠️ Brittle |
| **Gradual Migration** | 3 weeks | Medium | ✅ After Week 1 | ✅ Yes (Week 5) |
| **Full Rewrite** | 6 weeks | High | ❌ Not until done | ✅ Perfect |
| **Hybrid (Recommended)** | 5 weeks | Low | ✅ Week 1 | ✅ Week 5 |

---

## Conclusion

**Answer to your question**: **No, your codebase is NOT ready** for the redesigned E2E testing system.

**But**: You can get it working in **2 days** with the Adapter Pattern, then gradually refactor over **5 weeks** to reach production-quality architecture.

**Next Steps**:
1. Decide on approach (recommend: Hybrid)
2. Create `TideOrchestratorAdapter` (Day 1)
3. Run first E2E test (Day 2)
4. Start gradual refactoring (Weeks 2-5)

The testing system design is excellent, but your production code needs architectural improvements to fully leverage it.
