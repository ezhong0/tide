# 🚀 Radical Refactoring Plan: Production-Grade Architecture Transformation

**Goal**: Transform Tide into a world-class, beautifully architected codebase with hexagonal architecture, dependency injection, event-driven design, and comprehensive E2E testing.

**Timeline**: 6 weeks of focused, radical refactoring

**Philosophy**: Build it right, build it once. No shortcuts, no technical debt.

---

## 🎯 Vision

Transform from **service-oriented monoliths** to **domain-driven hexagonal architecture** across the entire codebase:

```
┌──────────────────────────────────────────────────────────────┐
│                       CURRENT STATE                           │
│  ❌ Singletons everywhere                                    │
│  ❌ Direct dependencies                                       │
│  ❌ No interfaces                                             │
│  ❌ Hardcoded config                                          │
│  ❌ Can't test in isolation                                   │
│  ❌ Global state                                              │
└──────────────────────────────────────────────────────────────┘
                            ↓
                    TRANSFORMATION
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                        TARGET STATE                           │
│  ✅ Hexagonal architecture (ports & adapters)                │
│  ✅ Full dependency injection                                │
│  ✅ Interface-driven design                                   │
│  ✅ Event-driven tracing                                      │
│  ✅ Domain-driven design                                      │
│  ✅ Zero global state                                         │
│  ✅ 100% testable in isolation                                │
│  ✅ Comprehensive E2E testing system                          │
└──────────────────────────────────────────────────────────────┘
```

---

## 🏛️ Architecture Principles

### 1. Hexagonal Architecture (Ports & Adapters)

Every service follows this structure:

```
packages/services/{service}/
├── src/
│   ├── domain/              # Pure business logic (ZERO external deps)
│   │   ├── entities/        # Domain entities
│   │   ├── value-objects/   # Immutable value objects
│   │   ├── events/          # Domain events
│   │   └── errors/          # Domain-specific errors
│   │
│   ├── application/         # Use cases & ports
│   │   ├── use-cases/       # Business operations
│   │   └── ports/           # Interfaces (repositories, services, etc)
│   │
│   ├── infrastructure/      # Adapters (implementation of ports)
│   │   ├── adapters/        # External service adapters
│   │   ├── repositories/    # Database repositories
│   │   └── clients/         # HTTP/API clients
│   │
│   ├── di/                  # Dependency injection setup
│   │   ├── container.ts     # DI container configuration
│   │   └── tokens.ts        # Injection tokens
│   │
│   └── api/                 # HTTP layer (thin, just routing)
│       ├── routes/
│       ├── controllers/     # Thin controllers (call use cases)
│       └── middleware/
```

### 2. SOLID Principles

- **S**ingle Responsibility: Each class does one thing
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Interfaces are substitutable
- **I**nterface Segregation: Small, focused interfaces
- **D**ependency Inversion: Depend on abstractions, not concretions

### 3. Domain-Driven Design

- Rich domain models with business logic
- Value objects for domain concepts
- Aggregates to maintain invariants
- Domain events for cross-aggregate communication
- Repositories for persistence abstraction

### 4. Event-Driven Architecture

- All important operations emit events
- Loose coupling between components
- Tracing via event subscription (no code mutation)
- Async communication between services

---

## 📦 New Shared Packages

### 1. `@tide/core` - Core Abstractions

```typescript
packages/libraries/core/
├── src/
│   ├── domain/
│   │   ├── Entity.ts              # Base entity class
│   │   ├── ValueObject.ts         # Base value object
│   │   ├── AggregateRoot.ts       # Base aggregate
│   │   └── DomainEvent.ts         # Base domain event
│   │
│   ├── application/
│   │   ├── UseCase.ts             # Base use case interface
│   │   └── ports/
│   │       ├── IRepository.ts     # Generic repository
│   │       ├── IEventBus.ts       # Event bus interface
│   │       ├── ILogger.ts         # Logger interface
│   │       └── IUnitOfWork.ts     # Transaction handling
│   │
│   └── infrastructure/
│       ├── Result.ts              # Result type (success/failure)
│       ├── Either.ts              # Either type
│       └── Maybe.ts               # Maybe type (null safety)
```

### 2. `@tide/di` - Dependency Injection

```typescript
packages/libraries/di/
├── src/
│   ├── Container.ts               # DI container
│   ├── decorators.ts              # @Injectable, @Inject decorators
│   ├── Scope.ts                   # Singleton, Transient, Scoped
│   ├── ServiceLifetime.ts         # Lifetime management
│   └── types.ts                   # DI types
```

**Features**:
- Constructor injection
- Property injection
- Method injection
- Scoped lifetimes
- Child containers (test isolation)
- Decorator-based registration

### 3. `@tide/events` - Event Bus

```typescript
packages/libraries/events/
├── src/
│   ├── EventBus.ts                # In-memory event bus
│   ├── KafkaEventBus.ts           # Kafka-based event bus
│   ├── DomainEvent.ts             # Base domain event
│   ├── EventHandler.ts            # Event handler interface
│   ├── EventStore.ts              # Event sourcing support
│   └── decorators.ts              # @EventHandler decorator
```

**Features**:
- Sync and async event handling
- Event store for replay
- Dead letter queue
- Retry logic
- Event versioning

### 4. `@tide/interfaces` - Shared Interfaces

```typescript
packages/libraries/interfaces/
├── src/
│   ├── orchestration/
│   │   ├── IOrchestrator.ts
│   │   └── IAIClient.ts
│   │
│   ├── tools/
│   │   ├── IToolRegistry.ts
│   │   ├── ITool.ts
│   │   └── IToolExecutor.ts
│   │
│   ├── persistence/
│   │   ├── IEmailRepository.ts
│   │   ├── ICalendarRepository.ts
│   │   ├── IWorkflowRepository.ts
│   │   └── ITaskRepository.ts
│   │
│   ├── services/
│   │   ├── IEmailService.ts
│   │   ├── ICalendarService.ts
│   │   └── IWorkflowService.ts
│   │
│   └── clients/
│       ├── IHttpClient.ts
│       ├── ISupabaseClient.ts
│       └── IRedisClient.ts
```

### 5. `@tide/testing` - E2E Testing Framework

Complete implementation from `E2E_TESTING_SYSTEM_REDESIGN.md`:

```typescript
packages/testing/
├── core/                          # Testing domain & use cases
│   ├── domain/
│   ├── application/
│   └── infrastructure/
│
├── infrastructure/                # Testing adapters
│   ├── adapters/
│   ├── generators/                # Mock data generators
│   ├── seeders/                   # Database seeders
│   └── scorers/                   # LLM-based scorers
│
└── runner/                        # Test execution
    ├── cli.ts
    ├── test-suite.ts
    └── reporters/
```

---

## 🔧 Service-by-Service Transformation

### Week 1-2: AI Service - The Foundation

**Priority**: Highest (most complex, sets the pattern)

#### Phase 1: Domain Layer (Days 1-2)

**Create domain entities**:

```typescript
// packages/services/ai/src/domain/entities/AIRequest.ts
export class AIRequest extends Entity<AIRequestId> {
  constructor(
    id: AIRequestId,
    public readonly userId: UserId,
    public readonly content: PromptContent,
    public readonly context: AIContext,
    public readonly metadata: RequestMetadata,
  ) {
    super(id);
    this.validate();
  }

  private validate(): void {
    if (!this.content.isValid()) {
      throw new InvalidPromptError('Prompt content is invalid');
    }
    if (this.content.length() > 10000) {
      throw new PromptTooLongError('Prompt exceeds maximum length');
    }
  }

  static create(params: CreateAIRequestParams): AIRequest {
    return new AIRequest(
      AIRequestId.generate(),
      UserId.from(params.userId),
      PromptContent.from(params.content),
      AIContext.from(params.context),
      RequestMetadata.empty(),
    );
  }
}

// Value objects
export class PromptContent extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static from(value: string): PromptContent {
    if (!value || value.trim().length === 0) {
      throw new EmptyPromptError();
    }
    return new PromptContent(value.trim());
  }

  length(): number {
    return this.value.length;
  }

  isValid(): boolean {
    return this.value.length > 0 && this.value.length <= 10000;
  }
}

// Domain events
export class AIRequestProcessedEvent extends DomainEvent {
  constructor(
    public readonly requestId: AIRequestId,
    public readonly response: AIResponse,
    public readonly toolsUsed: readonly ToolName[],
    public readonly duration: Duration,
    timestamp: Date = new Date(),
  ) {
    super(timestamp);
  }

  get eventName(): string {
    return 'ai.request.processed';
  }
}
```

**Create domain services**:

```typescript
// packages/services/ai/src/domain/services/PromptOptimizer.ts
export class PromptOptimizer {
  optimize(prompt: PromptContent, context: AIContext): OptimizedPrompt {
    // Pure domain logic - no external dependencies
    const tokens = this.tokenize(prompt);
    const compressed = this.compress(tokens, context);
    return OptimizedPrompt.from(compressed);
  }

  private tokenize(prompt: PromptContent): readonly Token[] {
    // Tokenization logic
  }

  private compress(tokens: readonly Token[], context: AIContext): string {
    // Compression logic based on context
  }
}
```

#### Phase 2: Application Layer (Days 3-4)

**Define ports (interfaces)**:

```typescript
// packages/services/ai/src/application/ports/IOrchestrator.ts
export interface IOrchestrator {
  process(request: AIRequest): Promise<AIResponse>;
  healthCheck(): Promise<HealthStatus>;
}

// packages/services/ai/src/application/ports/IToolRegistry.ts
export interface IToolRegistry {
  register(tool: ITool): void;
  execute(name: ToolName, params: ToolParams, context: ToolContext): Promise<ToolResult>;
  getAll(): readonly ITool[];
  has(name: ToolName): boolean;
}

// packages/services/ai/src/application/ports/IAIClient.ts
export interface IAIClient {
  complete(request: CompletionRequest): Promise<CompletionResponse>;
  stream(request: CompletionRequest): AsyncIterable<CompletionChunk>;
}

// packages/services/ai/src/application/ports/repositories/IAIRequestRepository.ts
export interface IAIRequestRepository extends IRepository<AIRequest, AIRequestId> {
  findByUserId(userId: UserId): Promise<readonly AIRequest[]>;
  findRecentByUserId(userId: UserId, limit: number): Promise<readonly AIRequest[]>;
}
```

**Create use cases**:

```typescript
// packages/services/ai/src/application/use-cases/ProcessAIRequestUseCase.ts
@Injectable()
export class ProcessAIRequestUseCase implements IUseCase<AIRequest, AIResponse> {
  constructor(
    @Inject('IOrchestrator') private readonly orchestrator: IOrchestrator,
    @Inject('IAIRequestRepository') private readonly repository: IAIRequestRepository,
    @Inject('IEventBus') private readonly eventBus: IEventBus,
    @Inject('ILogger') private readonly logger: ILogger,
  ) {}

  async execute(request: AIRequest): Promise<Result<AIResponse, Error>> {
    this.logger.info('Processing AI request', {
      requestId: request.id.value,
      userId: request.userId.value,
    });

    try {
      // Emit domain event
      await this.eventBus.publish(
        new AIRequestReceivedEvent(request.id, request.userId, new Date())
      );

      // Process through orchestrator
      const response = await this.orchestrator.process(request);

      // Save to repository
      await this.repository.save(request);

      // Emit success event
      await this.eventBus.publish(
        new AIRequestProcessedEvent(
          request.id,
          response,
          response.toolsUsed,
          response.duration,
        )
      );

      return Result.ok(response);

    } catch (error) {
      this.logger.error('AI request processing failed', {
        requestId: request.id.value,
        error,
      });

      await this.eventBus.publish(
        new AIRequestFailedEvent(request.id, ExecutionError.from(error), new Date())
      );

      return Result.fail(error);
    }
  }
}
```

#### Phase 3: Infrastructure Layer (Days 5-7)

**Implement adapters**:

```typescript
// packages/services/ai/src/infrastructure/adapters/GPT5Orchestrator.ts
@Injectable()
export class GPT5Orchestrator implements IOrchestrator {
  constructor(
    @Inject('IAIClient') private readonly client: IAIClient,
    @Inject('IToolRegistry') private readonly toolRegistry: IToolRegistry,
    @Inject('IEventBus') private readonly eventBus: IEventBus,
    @Inject('ILogger') private readonly logger: ILogger,
    @Inject('OrchestratorConfig') private readonly config: OrchestratorConfig,
  ) {}

  async process(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    // Emit orchestration started
    await this.eventBus.publish(
      new OrchestrationStartedEvent(request.id, new Date())
    );

    // Build messages
    const messages = this.buildMessages(request);

    // Get available tools
    const tools = this.toolRegistry.getAll().map(t => t.toOpenAIFormat());

    // Call AI
    const completion = await this.client.complete({
      model: this.config.model,
      messages,
      tools,
      temperature: this.config.temperature,
    });

    // Process tool calls
    const toolResults = await this.processToolCalls(
      completion.toolCalls,
      request.context
    );

    // Build final response
    const response = AIResponse.from({
      content: completion.content,
      toolsUsed: toolResults.map(r => r.toolName),
      duration: Duration.milliseconds(Date.now() - startTime),
      metadata: completion.metadata,
    });

    return response;
  }

  private async processToolCalls(
    toolCalls: readonly ToolCall[],
    context: ToolContext,
  ): Promise<readonly ToolResult[]> {
    const results: ToolResult[] = [];

    for (const call of toolCalls) {
      const toolName = ToolName.from(call.function.name);
      const params = ToolParams.from(call.function.arguments);

      // Tool registry emits events internally
      const result = await this.toolRegistry.execute(toolName, params, context);
      results.push(result);
    }

    return results;
  }

  async healthCheck(): Promise<HealthStatus> {
    try {
      await this.client.complete({
        model: this.config.model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5,
      });
      return HealthStatus.healthy();
    } catch (error) {
      return HealthStatus.unhealthy(`Orchestrator unhealthy: ${error}`);
    }
  }
}

// packages/services/ai/src/infrastructure/adapters/OpenAIClient.ts
@Injectable()
export class OpenAIClient implements IAIClient {
  private client: OpenAI;

  constructor(
    @Inject('OpenAIConfig') private readonly config: OpenAIConfig,
    @Inject('ILogger') private readonly logger: ILogger,
  ) {
    this.client = new OpenAI({ apiKey: config.apiKey });
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    this.logger.debug('Calling OpenAI', {
      model: request.model,
      messageCount: request.messages.length,
    });

    const response = await this.client.chat.completions.create({
      model: request.model,
      messages: request.messages,
      tools: request.tools,
      temperature: request.temperature,
    });

    return CompletionResponse.from(response);
  }

  async *stream(request: CompletionRequest): AsyncIterable<CompletionChunk> {
    const stream = await this.client.chat.completions.create({
      ...request,
      stream: true,
    });

    for await (const chunk of stream) {
      yield CompletionChunk.from(chunk);
    }
  }
}

// packages/services/ai/src/infrastructure/adapters/EventEmittingToolRegistry.ts
@Injectable()
export class EventEmittingToolRegistry implements IToolRegistry {
  private readonly tools = new Map<string, ITool>();

  constructor(
    @Inject('IEventBus') private readonly eventBus: IEventBus,
    @Inject('ILogger') private readonly logger: ILogger,
  ) {}

  register(tool: ITool): void {
    this.tools.set(tool.name.value, tool);
    this.logger.debug('Tool registered', { toolName: tool.name.value });
  }

  async execute(
    name: ToolName,
    params: ToolParams,
    context: ToolContext,
  ): Promise<ToolResult> {
    const tool = this.tools.get(name.value);
    if (!tool) {
      throw new ToolNotFoundError(`Tool not found: ${name.value}`);
    }

    // Emit start event
    await this.eventBus.publish(
      new ToolExecutionStartedEvent(name, params, context, new Date())
    );

    const startTime = Date.now();

    try {
      const result = await tool.execute(params, context);

      // Emit success event
      await this.eventBus.publish(
        new ToolExecutionCompletedEvent(
          name,
          params,
          result,
          Duration.milliseconds(Date.now() - startTime),
          true,
          new Date(),
        )
      );

      return result;

    } catch (error) {
      // Emit failure event
      await this.eventBus.publish(
        new ToolExecutionFailedEvent(
          name,
          params,
          ExecutionError.from(error),
          Duration.milliseconds(Date.now() - startTime),
          new Date(),
        )
      );

      throw error;
    }
  }

  getAll(): readonly ITool[] {
    return Array.from(this.tools.values());
  }

  has(name: ToolName): boolean {
    return this.tools.has(name.value);
  }
}
```

**Implement repositories**:

```typescript
// packages/services/ai/src/infrastructure/repositories/SupabaseAIRequestRepository.ts
@Injectable()
export class SupabaseAIRequestRepository implements IAIRequestRepository {
  constructor(
    @Inject('ISupabaseClientFactory') private readonly clientFactory: ISupabaseClientFactory,
    @Inject('ILogger') private readonly logger: ILogger,
  ) {}

  async save(request: AIRequest): Promise<void> {
    const client = this.clientFactory.create(true);

    const { error } = await client.from('ai_requests').insert({
      id: request.id.value,
      user_id: request.userId.value,
      content: request.content.value,
      context: request.context.toJSON(),
      metadata: request.metadata.toJSON(),
      created_at: request.createdAt.toISOString(),
    });

    if (error) {
      throw new RepositoryError('Failed to save AI request', error);
    }
  }

  async findById(id: AIRequestId): Promise<AIRequest | null> {
    const client = this.clientFactory.create(true);

    const { data, error } = await client
      .from('ai_requests')
      .select('*')
      .eq('id', id.value)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new RepositoryError('Failed to find AI request', error);
    }

    return this.toDomain(data);
  }

  async findByUserId(userId: UserId): Promise<readonly AIRequest[]> {
    const client = this.clientFactory.create(true);

    const { data, error } = await client
      .from('ai_requests')
      .select('*')
      .eq('user_id', userId.value)
      .order('created_at', { ascending: false });

    if (error) {
      throw new RepositoryError('Failed to find AI requests by user', error);
    }

    return data.map(d => this.toDomain(d));
  }

  private toDomain(data: any): AIRequest {
    return new AIRequest(
      AIRequestId.from(data.id),
      UserId.from(data.user_id),
      PromptContent.from(data.content),
      AIContext.from(data.context),
      RequestMetadata.from(data.metadata),
    );
  }
}
```

#### Phase 4: DI Setup (Days 8-9)

```typescript
// packages/services/ai/src/di/container.ts
import { Container } from '@tide/di';
import { TOKENS } from './tokens';

export function setupAIServiceContainer(config: AIServiceConfig): Container {
  const container = new Container();

  // ============================================================
  // INFRASTRUCTURE - Core Dependencies
  // ============================================================

  container.bindValue(TOKENS.CONFIG, config);

  container.bindSingleton(TOKENS.LOGGER, () =>
    createLogger(config.logging)
  );

  container.bindSingleton(TOKENS.EVENT_BUS, () =>
    new EventBus()
  );

  container.bindSingleton(TOKENS.SUPABASE_CLIENT_FACTORY, (c) => {
    const logger = c.resolve<ILogger>(TOKENS.LOGGER);
    return new SupabaseClientFactory(config.supabase, logger);
  });

  // ============================================================
  // DOMAIN SERVICES
  // ============================================================

  container.bindTransient(TOKENS.PROMPT_OPTIMIZER, () =>
    new PromptOptimizer()
  );

  // ============================================================
  // APPLICATION - Repositories
  // ============================================================

  container.bindSingleton(TOKENS.AI_REQUEST_REPOSITORY, (c) => {
    const factory = c.resolve<ISupabaseClientFactory>(TOKENS.SUPABASE_CLIENT_FACTORY);
    const logger = c.resolve<ILogger>(TOKENS.LOGGER);
    return new SupabaseAIRequestRepository(factory, logger);
  });

  // ============================================================
  // INFRASTRUCTURE - AI Clients
  // ============================================================

  container.bindSingleton(TOKENS.OPENAI_CLIENT, (c) => {
    const logger = c.resolve<ILogger>(TOKENS.LOGGER);
    return new OpenAIClient(config.openai, logger);
  });

  container.bindSingleton(TOKENS.ANTHROPIC_CLIENT, (c) => {
    const logger = c.resolve<ILogger>(TOKENS.LOGGER);
    return new AnthropicClient(config.anthropic, logger);
  });

  // Multi-model router
  container.bindSingleton(TOKENS.AI_CLIENT, (c) => {
    const openai = c.resolve<IAIClient>(TOKENS.OPENAI_CLIENT);
    const anthropic = c.resolve<IAIClient>(TOKENS.ANTHROPIC_CLIENT);
    const logger = c.resolve<ILogger>(TOKENS.LOGGER);
    return new MultiModelRouter([openai, anthropic], config.routing, logger);
  });

  // ============================================================
  // INFRASTRUCTURE - Tool Registry
  // ============================================================

  container.bindSingleton(TOKENS.TOOL_REGISTRY, (c) => {
    const eventBus = c.resolve<IEventBus>(TOKENS.EVENT_BUS);
    const logger = c.resolve<ILogger>(TOKENS.LOGGER);
    return new EventEmittingToolRegistry(eventBus, logger);
  });

  // ============================================================
  // INFRASTRUCTURE - Orchestrator
  // ============================================================

  container.bindSingleton(TOKENS.ORCHESTRATOR, (c) => {
    const client = c.resolve<IAIClient>(TOKENS.AI_CLIENT);
    const toolRegistry = c.resolve<IToolRegistry>(TOKENS.TOOL_REGISTRY);
    const eventBus = c.resolve<IEventBus>(TOKENS.EVENT_BUS);
    const logger = c.resolve<ILogger>(TOKENS.LOGGER);
    return new GPT5Orchestrator(client, toolRegistry, eventBus, logger, config.orchestrator);
  });

  // ============================================================
  // APPLICATION - Use Cases
  // ============================================================

  container.bindTransient(TOKENS.PROCESS_AI_REQUEST, (c) => {
    const orchestrator = c.resolve<IOrchestrator>(TOKENS.ORCHESTRATOR);
    const repository = c.resolve<IAIRequestRepository>(TOKENS.AI_REQUEST_REPOSITORY);
    const eventBus = c.resolve<IEventBus>(TOKENS.EVENT_BUS);
    const logger = c.resolve<ILogger>(TOKENS.LOGGER);
    return new ProcessAIRequestUseCase(orchestrator, repository, eventBus, logger);
  });

  // ============================================================
  // INFRASTRUCTURE - Tools Registration
  // ============================================================

  const toolRegistry = container.resolve<IToolRegistry>(TOKENS.TOOL_REGISTRY);
  const httpClient = new HttpClient(config.services);

  // Register all tools
  toolRegistry.register(new SearchEmailsTool(httpClient));
  toolRegistry.register(new CreateEventTool(httpClient));
  toolRegistry.register(new SearchContactsTool(httpClient));
  toolRegistry.register(new CreateTaskTool(httpClient));
  // ... register all tools

  return container;
}
```

```typescript
// packages/services/ai/src/di/tokens.ts
export const TOKENS = {
  // Config
  CONFIG: Symbol('AIServiceConfig'),

  // Core
  LOGGER: Symbol('ILogger'),
  EVENT_BUS: Symbol('IEventBus'),

  // Clients
  SUPABASE_CLIENT_FACTORY: Symbol('ISupabaseClientFactory'),
  OPENAI_CLIENT: Symbol('OpenAIClient'),
  ANTHROPIC_CLIENT: Symbol('AnthropicClient'),
  AI_CLIENT: Symbol('IAIClient'),

  // Repositories
  AI_REQUEST_REPOSITORY: Symbol('IAIRequestRepository'),

  // Domain Services
  PROMPT_OPTIMIZER: Symbol('PromptOptimizer'),

  // Application Services
  TOOL_REGISTRY: Symbol('IToolRegistry'),
  ORCHESTRATOR: Symbol('IOrchestrator'),

  // Use Cases
  PROCESS_AI_REQUEST: Symbol('ProcessAIRequestUseCase'),
} as const;
```

#### Phase 5: API Layer (Days 10-11)

```typescript
// packages/services/ai/src/api/controllers/AIController.ts
@Controller('/api/ai')
export class AIController {
  constructor(
    @Inject(TOKENS.PROCESS_AI_REQUEST)
    private readonly processAIRequest: ProcessAIRequestUseCase,
    @Inject(TOKENS.LOGGER)
    private readonly logger: ILogger,
  ) {}

  @Post('/process')
  @Authenticated()
  async process(
    @Body() body: ProcessAIRequestDTO,
    @User() user: AuthenticatedUser,
  ): Promise<AIResponseDTO> {
    // Validate DTO
    const validation = ProcessAIRequestDTO.validate(body);
    if (!validation.isValid) {
      throw new BadRequestException(validation.errors);
    }

    // Create domain entity
    const request = AIRequest.create({
      userId: user.id,
      content: body.content,
      context: body.context || {},
    });

    // Execute use case
    const result = await this.processAIRequest.execute(request);

    if (result.isFailure) {
      throw new InternalServerException(result.error);
    }

    // Map to DTO
    return AIResponseDTO.from(result.value);
  }

  @Get('/health')
  async health(): Promise<{ status: string }> {
    return { status: 'healthy' };
  }
}
```

#### Phase 6: Testing (Days 12-14)

```typescript
// packages/services/ai/src/__tests__/unit/ProcessAIRequestUseCase.test.ts
describe('ProcessAIRequestUseCase', () => {
  let useCase: ProcessAIRequestUseCase;
  let mockOrchestrator: jest.Mocked<IOrchestrator>;
  let mockRepository: jest.Mocked<IAIRequestRepository>;
  let mockEventBus: jest.Mocked<IEventBus>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    // Create mocks
    mockOrchestrator = createMock<IOrchestrator>();
    mockRepository = createMock<IAIRequestRepository>();
    mockEventBus = createMock<IEventBus>();
    mockLogger = createMock<ILogger>();

    // Create use case with injected mocks
    useCase = new ProcessAIRequestUseCase(
      mockOrchestrator,
      mockRepository,
      mockEventBus,
      mockLogger,
    );
  });

  it('should process AI request successfully', async () => {
    // Arrange
    const request = AIRequest.create({
      userId: 'user-123',
      content: 'Find my emails from john@example.com',
      context: {},
    });

    const expectedResponse = AIResponse.from({
      content: 'Found 5 emails from john@example.com',
      toolsUsed: [ToolName.from('search_emails')],
      duration: Duration.milliseconds(500),
      metadata: {},
    });

    mockOrchestrator.process.mockResolvedValue(expectedResponse);

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(expectedResponse);
    expect(mockRepository.save).toHaveBeenCalledWith(request);
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      expect.any(AIRequestProcessedEvent)
    );
  });

  // ... more tests
});

// packages/services/ai/src/__tests__/integration/ai-service.integration.test.ts
describe('AI Service Integration', () => {
  let container: Container;
  let useCase: ProcessAIRequestUseCase;

  beforeAll(async () => {
    // Setup integration test container
    const config = loadTestConfig();
    container = setupAIServiceContainer(config);

    // Use in-memory implementations for tests
    container.rebind(TOKENS.AI_REQUEST_REPOSITORY, () =>
      new InMemoryAIRequestRepository()
    );

    useCase = container.resolve<ProcessAIRequestUseCase>(TOKENS.PROCESS_AI_REQUEST);
  });

  it('should process request end-to-end', async () => {
    const request = AIRequest.create({
      userId: 'user-123',
      content: 'Test prompt',
      context: {},
    });

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
  });
});
```

---

### Week 3: Email, Calendar, Workflow Services

Apply the same transformation pattern to other services in parallel:

#### Email Service Refactoring (Week 3, Days 1-5)
- Domain: Email, Thread, Draft, Attachment value objects
- Use Cases: SendEmail, SearchEmails, TriageEmail, ComposeSmartReply
- Adapters: GmailProvider, ExchangeProvider, SupabaseEmailRepository
- Tools: Refactor email tools to use DI

#### Calendar Service Refactoring (Week 3, Days 1-5)
- Domain: CalendarEvent, TimeSlot, Availability, Conflict value objects
- Use Cases: CreateEvent, FindConflicts, OptimizeCalendar, SuggestTimeSlots
- Adapters: GoogleCalendarProvider, ExchangeCalendarProvider
- Tools: Refactor calendar tools to use DI

#### Workflow Service Refactoring (Week 3, Days 1-5)
- Domain: Workflow, WorkflowStep, WorkflowExecution aggregates
- Use Cases: ExecuteWorkflow, DetectPattern, CompensateFailure
- Adapters: SupabaseWorkflowRepository, KafkaEventBus
- State machine with event sourcing

---

### Week 4: E2E Testing System Implementation

Implement the complete E2E testing system from `E2E_TESTING_SYSTEM_REDESIGN.md`:

#### Days 1-2: Testing Core
- Domain layer (TestCase, ExecutionTrace, ScoringResult entities)
- Value objects (TestCaseId, Prompt, Score, etc.)
- Use cases (ExecuteTest, ScoreExecution, GenerateReport)

#### Days 3-4: Testing Infrastructure
- Mock data generators (EmailGenerator, CalendarGenerator)
- Data seeders (SupabaseDataSeeder, InMemoryDataSeeder)
- Execution engine (InstrumentedExecutionEngine)
- Event-driven tracer (EventDrivenTracer)

#### Days 5-6: Scoring & Reporting
- LLM scorer (Claude-based evaluation)
- Rule-based scorer (fallback)
- HTML/JSON reporters
- Test runner CLI

#### Day 7: Integration
- Connect E2E system to refactored services
- Create test suites
- Run full test battery

---

### Week 5: Gateway & Cross-Cutting Concerns

#### Gateway Refactoring
- Thin routing layer only
- All business logic in services
- Authentication middleware
- Request/response DTOs
- GraphQL schema aligned with domain

#### Cross-Cutting Concerns
- Distributed tracing (OpenTelemetry)
- Logging (structured logging to all services)
- Error handling (domain-specific errors)
- Validation (DTO validation at API boundary)

---

### Week 6: Polish, Performance & Documentation

#### Days 1-2: Performance Optimization
- Database query optimization
- Caching strategy (Redis)
- Connection pooling
- Batch operations

#### Days 3-4: Developer Experience
- Code generation scripts
- CLI tools for common tasks
- Development environment setup
- Hot reload configuration

#### Days 5-6: Documentation
- Architecture decision records (ADRs)
- API documentation (OpenAPI/GraphQL schema)
- Domain model diagrams
- Onboarding guide

#### Day 7: Launch Preparation
- Production deployment checklist
- Monitoring setup
- Alerting configuration
- Rollback procedures

---

## 🎯 Success Metrics

### Architecture Quality
- [ ] Zero global state (no singletons)
- [ ] 100% interface-based dependencies
- [ ] All use cases testable in isolation
- [ ] Event-driven tracing (no monkey-patching)
- [ ] Full dependency injection throughout

### Test Coverage
- [ ] Unit tests: >90% coverage
- [ ] Integration tests: All use cases
- [ ] E2E tests: >50 test cases covering key scenarios
- [ ] Performance tests: Response time <500ms p95

### Developer Experience
- [ ] New developer onboarding: <2 hours
- [ ] Test execution: <30 seconds for unit tests
- [ ] Hot reload: <2 seconds
- [ ] Type safety: Zero `any` types in domain/application layers

### Production Readiness
- [ ] Distributed tracing enabled
- [ ] Structured logging throughout
- [ ] Health checks for all services
- [ ] Graceful shutdown handling
- [ ] Circuit breakers for external services

---

## ⚠️ Risk Mitigation

### Strategy 1: Feature Flags
- Use feature flags to gradually roll out refactored code
- Keep old code path until new path is validated
- A/B test performance and correctness

### Strategy 2: Parallel Run
- Run old and new implementations in parallel
- Compare results in production (shadow mode)
- Switch over only when confidence is high

### Strategy 3: Service-by-Service Rollout
- AI service first (most complex)
- Email/Calendar in parallel
- Workflow last (depends on others)
- Gateway updates continuously

### Strategy 4: Automated Testing
- E2E tests run on every commit
- Performance regression detection
- Automatic rollback on failures

---

## 🚀 Quick Start Checklist

### Week 0 (Prep)
- [ ] Create feature branch `refactor/radical-transformation`
- [ ] Set up development environment
- [ ] Install dependencies for new packages
- [ ] Create base packages (@tide/core, @tide/di, @tide/events, @tide/interfaces)

### Week 1 - AI Service
- [ ] Day 1-2: Domain layer (entities, value objects, events)
- [ ] Day 3-4: Application layer (use cases, ports)
- [ ] Day 5-7: Infrastructure layer (adapters, repositories)
- [ ] Day 8-9: DI container setup
- [ ] Day 10-11: API layer (controllers, routes)
- [ ] Day 12-14: Testing (unit, integration)

### Week 2 - AI Service (cont.) + Foundation
- [ ] Complete AI service refactoring
- [ ] Migrate all tools to new architecture
- [ ] Deploy to staging
- [ ] Run smoke tests

### Week 3 - Email, Calendar, Workflow
- [ ] Refactor Email service
- [ ] Refactor Calendar service
- [ ] Refactor Workflow service
- [ ] All services deployed to staging

### Week 4 - E2E Testing
- [ ] Implement E2E testing framework
- [ ] Create test suites (>50 test cases)
- [ ] Run full E2E battery
- [ ] Fix any discovered issues

### Week 5 - Gateway & Integration
- [ ] Refactor Gateway
- [ ] Add distributed tracing
- [ ] Implement caching
- [ ] Performance optimization

### Week 6 - Polish & Launch
- [ ] Documentation
- [ ] Performance tuning
- [ ] Security audit
- [ ] Production deployment

---

## 📚 Learning Resources

As you implement this transformation, refer to:

1. **Hexagonal Architecture**: Alistair Cockburn's original paper
2. **Domain-Driven Design**: Eric Evans' "DDD" book
3. **Clean Architecture**: Robert C. Martin's "Clean Architecture"
4. **Dependency Injection**: Martin Fowler's articles on IoC
5. **Event-Driven Architecture**: Chris Richardson's microservices patterns

---

## 🎉 The End Result

After 6 weeks, you'll have:

✅ **World-class architecture** - Hexagonal, clean, maintainable
✅ **100% testable** - Every component isolated and testable
✅ **Event-driven tracing** - Complete visibility into execution
✅ **Comprehensive E2E tests** - LLM-scored, production-like scenarios
✅ **Zero technical debt** - Clean slate, best practices throughout
✅ **Production-ready** - Monitoring, logging, performance optimized
✅ **Developer happiness** - Easy to understand, modify, extend

This is **not** a quick fix. This is **radical transformation** to a production-grade, enterprise-quality codebase that will scale with your business and team.

**Ready to build something beautiful?** 🚀
