# 🏛️ E2E Testing System - Production-Grade Architecture

**Philosophy**: A radically clean, maintainable, and extensible testing system built on hexagonal architecture, SOLID principles, and battle-tested design patterns.

---

## Architecture Philosophy

### Hexagonal Architecture (Ports & Adapters)

```
┌─────────────────────────────────────────────────────────────────┐
│                         DOMAIN CORE                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Pure Business Logic                      │ │
│  │  • TestCase (Entity)                                        │ │
│  │  • ExecutionTrace (Value Object)                            │ │
│  │  • ScoringResult (Value Object)                             │ │
│  │  • No dependencies on external world                        │ │
│  │  • Framework agnostic                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Application Layer                        │ │
│  │  • ExecuteTestUseCase                                       │ │
│  │  • ScoreExecutionUseCase                                    │ │
│  │  • GenerateReportUseCase                                    │ │
│  │  • Orchestrates domain objects                              │ │
│  │  • Defines ports (interfaces)                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Ports (Interfaces)                       │ │
│  │  • IDataGenerator<T>                                        │ │
│  │  • IDataSeeder                                              │ │
│  │  • IExecutionEngine                                         │ │
│  │  • ITracer                                                  │ │
│  │  • IScorer                                                  │ │
│  │  • IReporter                                                │ │
│  │  • IEventBus                                                │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Dependencies point INWARD
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                          │
│                        (Adapters)                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Data Generation                                            │ │
│  │  • EmailGenerator implements IDataGenerator<MockEmail>     │ │
│  │  • CalendarGenerator implements IDataGenerator<MockEvent>  │ │
│  │  • PersonaGenerator implements IDataGenerator<Persona>     │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Data Seeding                                               │ │
│  │  • SupabaseDataSeeder implements IDataSeeder               │ │
│  │  • InMemoryDataSeeder implements IDataSeeder               │ │
│  │  • PostgresDataSeeder implements IDataSeeder               │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Execution & Tracing                                        │ │
│  │  • InstrumentedExecutionEngine implements IExecutionEngine │ │
│  │  • EventDrivenTracer implements ITracer                    │ │
│  │  • OpenTelemetryTracer implements ITracer                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Scoring                                                    │ │
│  │  • LLMScorer implements IScorer                            │ │
│  │  • RuleBasedScorer implements IScorer                      │ │
│  │  • HybridScorer implements IScorer                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Reporting                                                  │ │
│  │  • HTMLReporter implements IReporter                       │ │
│  │  • JSONReporter implements IReporter                       │ │
│  │  • StreamReporter implements IReporter                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Key Principle**: The domain core has ZERO dependencies on infrastructure. All dependencies point inward.

---

## Domain Layer

### Entities & Value Objects

```typescript
// packages/testing/core/domain/entities/TestCase.ts

export class TestCase {
  constructor(
    public readonly id: TestCaseId,
    public readonly name: string,
    public readonly description: string,
    public readonly prompt: Prompt,
    public readonly expectedBehavior: ExpectedBehavior,
    public readonly configuration: TestConfiguration,
  ) {
    this.validate();
  }

  validate(): void {
    if (!this.id.isValid()) {
      throw new InvalidTestCaseError('Invalid test case ID');
    }
    if (!this.prompt.isValid()) {
      throw new InvalidTestCaseError('Invalid prompt');
    }
  }

  static fromJSON(json: TestCaseJSON): TestCase {
    return new TestCase(
      TestCaseId.from(json.id),
      json.name,
      json.description,
      Prompt.from(json.prompt),
      ExpectedBehavior.from(json.expectedBehavior),
      TestConfiguration.from(json.configuration),
    );
  }

  matches(trace: ExecutionTrace): MatchResult {
    return this.expectedBehavior.matches(trace);
  }

  toJSON(): TestCaseJSON {
    return {
      id: this.id.value,
      name: this.name,
      description: this.description,
      prompt: this.prompt.value,
      expectedBehavior: this.expectedBehavior.toJSON(),
      configuration: this.configuration.toJSON(),
    };
  }
}

// Value Objects
export class TestCaseId {
  private constructor(public readonly value: string) {}

  static from(value: string): TestCaseId {
    if (!value || value.length === 0) {
      throw new InvalidTestCaseIdError('Test case ID cannot be empty');
    }
    return new TestCaseId(value);
  }

  static generate(): TestCaseId {
    return new TestCaseId(uuid());
  }

  isValid(): boolean {
    return this.value.length > 0;
  }

  equals(other: TestCaseId): boolean {
    return this.value === other.value;
  }
}

export class Prompt {
  private constructor(public readonly value: string) {}

  static from(value: string): Prompt {
    if (!value || value.trim().length === 0) {
      throw new InvalidPromptError('Prompt cannot be empty');
    }
    return new Prompt(value.trim());
  }

  isValid(): boolean {
    return this.value.length > 0 && this.value.length <= 10000;
  }

  wordCount(): number {
    return this.value.split(/\s+/).length;
  }
}

export class ExpectedBehavior {
  constructor(
    public readonly expectedTools: readonly ToolName[],
    public readonly expectedOutcome: ExpectedOutcome,
    public readonly constraints: readonly Constraint[],
  ) {}

  static from(json: ExpectedBehaviorJSON): ExpectedBehavior {
    return new ExpectedBehavior(
      json.expectedTools.map(t => ToolName.from(t)),
      ExpectedOutcome.from(json.expectedOutcome),
      json.constraints?.map(c => Constraint.from(c)) || [],
    );
  }

  matches(trace: ExecutionTrace): MatchResult {
    const toolsMatch = this.matchTools(trace);
    const outcomeMatch = this.expectedOutcome.matches(trace);
    const constraintsMatch = this.matchConstraints(trace);

    return MatchResult.combine([toolsMatch, outcomeMatch, constraintsMatch]);
  }

  private matchTools(trace: ExecutionTrace): MatchResult {
    const actualTools = trace.toolsUsed;
    const missingTools = this.expectedTools.filter(
      expected => !actualTools.some(actual => actual.equals(expected))
    );
    const extraTools = actualTools.filter(
      actual => !this.expectedTools.some(expected => expected.equals(actual))
    );

    if (missingTools.length === 0 && extraTools.length === 0) {
      return MatchResult.success('All expected tools used correctly');
    }

    return MatchResult.failure(
      `Tool mismatch: missing [${missingTools.join(', ')}], extra [${extraTools.join(', ')}]`
    );
  }

  private matchConstraints(trace: ExecutionTrace): MatchResult {
    const failures = this.constraints
      .map(constraint => constraint.evaluate(trace))
      .filter(result => !result.satisfied);

    if (failures.length === 0) {
      return MatchResult.success('All constraints satisfied');
    }

    return MatchResult.failure(
      `Constraints violated: ${failures.map(f => f.reason).join(', ')}`
    );
  }

  toJSON(): ExpectedBehaviorJSON {
    return {
      expectedTools: this.expectedTools.map(t => t.value),
      expectedOutcome: this.expectedOutcome.toJSON(),
      constraints: this.constraints.map(c => c.toJSON()),
    };
  }
}

export class ExecutionTrace {
  constructor(
    public readonly testId: TestCaseId,
    public readonly executionId: ExecutionId,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly steps: readonly TraceStep[],
    public readonly finalResponse: string,
    public readonly metadata: TraceMetadata,
    public readonly errors: readonly ExecutionError[],
  ) {}

  get duration(): Duration {
    return Duration.between(this.startTime, this.endTime);
  }

  get toolsUsed(): readonly ToolName[] {
    return this.steps
      .filter(step => step.type === StepType.ToolExecution)
      .map(step => (step as ToolExecutionStep).toolName);
  }

  get tokensUsed(): TokenCount {
    return this.steps
      .filter(step => step.type === StepType.AICall)
      .reduce((total, step) => {
        const aiStep = step as AICallStep;
        return total.add(aiStep.tokensUsed);
      }, TokenCount.zero());
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  findStep(predicate: (step: TraceStep) => boolean): TraceStep | undefined {
    return this.steps.find(predicate);
  }

  filterSteps(predicate: (step: TraceStep) => boolean): readonly TraceStep[] {
    return this.steps.filter(predicate);
  }
}

export class ScoringResult {
  constructor(
    public readonly testId: TestCaseId,
    public readonly executionId: ExecutionId,
    public readonly scorerId: ScorerId,
    public readonly scores: DimensionalScores,
    public readonly overallScore: Score,
    public readonly reasoning: string,
    public readonly feedback: Feedback,
    public readonly timestamp: Date,
  ) {}

  passed(threshold: Score = Score.from(70)): boolean {
    return this.overallScore.isGreaterThanOrEqual(threshold);
  }

  static combine(results: readonly ScoringResult[], strategy: CombinationStrategy): ScoringResult {
    return strategy.combine(results);
  }
}

export class DimensionalScores {
  constructor(
    public readonly correctness: Score,
    public readonly efficiency: Score,
    public readonly completeness: Score,
    public readonly userExperience: Score,
  ) {}

  static from(json: DimensionalScoresJSON): DimensionalScores {
    return new DimensionalScores(
      Score.from(json.correctness),
      Score.from(json.efficiency),
      Score.from(json.completeness),
      Score.from(json.userExperience),
    );
  }

  weightedAverage(weights: ScoreWeights): Score {
    return Score.weightedAverage([
      { score: this.correctness, weight: weights.correctness },
      { score: this.efficiency, weight: weights.efficiency },
      { score: this.completeness, weight: weights.completeness },
      { score: this.userExperience, weight: weights.userExperience },
    ]);
  }

  toJSON(): DimensionalScoresJSON {
    return {
      correctness: this.correctness.value,
      efficiency: this.efficiency.value,
      completeness: this.completeness.value,
      userExperience: this.userExperience.value,
    };
  }
}

export class Score {
  private constructor(public readonly value: number) {}

  static from(value: number): Score {
    if (value < 0 || value > 100) {
      throw new InvalidScoreError('Score must be between 0 and 100');
    }
    return new Score(value);
  }

  static zero(): Score {
    return new Score(0);
  }

  static perfect(): Score {
    return new Score(100);
  }

  static weightedAverage(items: Array<{ score: Score; weight: number }>): Score {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const weightedSum = items.reduce((sum, item) => sum + item.score.value * item.weight, 0);
    return Score.from(weightedSum / totalWeight);
  }

  isGreaterThanOrEqual(other: Score): boolean {
    return this.value >= other.value;
  }

  add(other: Score): Score {
    return Score.from(Math.min(100, this.value + other.value));
  }

  multiply(factor: number): Score {
    return Score.from(Math.min(100, this.value * factor));
  }
}
```

---

## Application Layer - Ports (Interfaces)

```typescript
// packages/testing/core/application/ports/IDataGenerator.ts

export interface IDataGenerator<T> {
  /**
   * Generate mock data based on configuration
   */
  generate(config: GenerationConfig): Promise<readonly T[]>;

  /**
   * Validate generated data against schema
   */
  validate(data: readonly T[]): ValidationResult;

  /**
   * Get generator metadata (version, capabilities)
   */
  getMetadata(): GeneratorMetadata;
}

// packages/testing/core/application/ports/IDataSeeder.ts

export interface IDataSeeder {
  /**
   * Seed database with test data
   * Returns a transaction for cleanup
   */
  seed(data: SeedData): Promise<SeedTransaction>;

  /**
   * Cleanup test data by transaction
   */
  cleanup(transaction: SeedTransaction): Promise<void>;

  /**
   * Create isolated test environment
   * Returns environment handle
   */
  createEnvironment(config: EnvironmentConfig): Promise<TestEnvironment>;

  /**
   * Destroy test environment
   */
  destroyEnvironment(environment: TestEnvironment): Promise<void>;

  /**
   * Health check
   */
  isHealthy(): Promise<HealthStatus>;
}

// packages/testing/core/application/ports/IExecutionEngine.ts

export interface IExecutionEngine {
  /**
   * Execute a prompt in the system under test
   */
  execute(request: ExecutionRequest): Promise<ExecutionResult>;

  /**
   * Check if engine is ready
   */
  healthCheck(): Promise<HealthStatus>;

  /**
   * Get engine metadata
   */
  getMetadata(): EngineMetadata;
}

// packages/testing/core/application/ports/ITracer.ts

export interface ITracer {
  /**
   * Start a new trace session
   */
  startTrace(testId: TestCaseId): TraceSession;

  /**
   * Record a step in the trace
   */
  recordStep(session: TraceSession, step: TraceStepData): void;

  /**
   * End trace and build final ExecutionTrace
   */
  endTrace(session: TraceSession): ExecutionTrace;

  /**
   * Get active trace sessions
   */
  getActiveSessions(): readonly TraceSession[];
}

// packages/testing/core/application/ports/IScorer.ts

export interface IScorer {
  /**
   * Score an execution trace
   */
  score(params: ScoringParams): Promise<ScoringResult>;

  /**
   * Batch score multiple traces
   */
  batchScore(params: readonly ScoringParams[]): Promise<readonly ScoringResult[]>;

  /**
   * Get scorer metadata
   */
  getMetadata(): ScorerMetadata;

  /**
   * Health check
   */
  isHealthy(): Promise<HealthStatus>;
}

// packages/testing/core/application/ports/IReporter.ts

export interface IReporter {
  /**
   * Generate test report
   */
  generate(report: TestReport): Promise<ReportOutput>;

  /**
   * Stream report generation
   */
  generateStream(report: TestReport): AsyncIterable<ReportChunk>;

  /**
   * Get supported formats
   */
  getSupportedFormats(): readonly ReportFormat[];

  /**
   * Validate report can be generated
   */
  canGenerate(report: TestReport): ValidationResult;
}

// packages/testing/core/application/ports/IEventBus.ts

export interface IEventBus {
  /**
   * Publish event
   */
  publish<T extends DomainEvent>(event: T): Promise<void>;

  /**
   * Subscribe to event type
   */
  subscribe<T extends DomainEvent>(
    eventType: EventType<T>,
    handler: EventHandler<T>,
  ): Subscription;

  /**
   * Subscribe to multiple event types
   */
  subscribeMany<T extends DomainEvent>(
    eventTypes: readonly EventType<T>[],
    handler: EventHandler<T>,
  ): Subscription;

  /**
   * Get published events (for testing)
   */
  getPublishedEvents<T extends DomainEvent>(
    eventType: EventType<T>,
  ): readonly T[];

  /**
   * Clear event history
   */
  clearHistory(): void;
}
```

---

## Application Layer - Use Cases

```typescript
// packages/testing/core/application/usecases/ExecuteTest.ts

export class ExecuteTestUseCase {
  constructor(
    private readonly dataSeeder: IDataSeeder,
    private readonly executionEngine: IExecutionEngine,
    private readonly tracer: ITracer,
    private readonly eventBus: IEventBus,
    private readonly logger: ILogger,
  ) {}

  async execute(testCase: TestCase): Promise<TestExecutionResult> {
    // Publish domain event
    await this.eventBus.publish(new TestStartedEvent(testCase.id, new Date()));

    const context = new ExecutionContext();
    let environment: TestEnvironment | null = null;

    try {
      // Create isolated environment
      environment = await this.createTestEnvironment(testCase, context);

      // Seed test data
      const transaction = await this.seedTestData(testCase, environment, context);

      // Execute test with tracing
      const trace = await this.executeWithTracing(testCase, environment, context);

      // Cleanup
      await this.cleanup(transaction, context);

      // Publish success event
      await this.eventBus.publish(new TestCompletedEvent(testCase.id, trace, new Date()));

      return TestExecutionResult.success(testCase, trace);

    } catch (error) {
      await this.handleError(testCase, error, context);
      throw error;

    } finally {
      await this.finalCleanup(environment, context);
    }
  }

  private async createTestEnvironment(
    testCase: TestCase,
    context: ExecutionContext,
  ): Promise<TestEnvironment> {
    this.logger.debug('Creating test environment', {
      testId: testCase.id.value,
      persona: testCase.configuration.persona,
    });

    const config = EnvironmentConfig.from(testCase.configuration);
    const environment = await this.dataSeeder.createEnvironment(config);

    context.setEnvironment(environment);

    this.logger.info('Test environment created', {
      testId: testCase.id.value,
      environmentId: environment.id.value,
    });

    return environment;
  }

  private async seedTestData(
    testCase: TestCase,
    environment: TestEnvironment,
    context: ExecutionContext,
  ): Promise<SeedTransaction> {
    this.logger.debug('Seeding test data', {
      testId: testCase.id.value,
      environmentId: environment.id.value,
    });

    const seedData = this.prepareSeedData(testCase, environment);
    const transaction = await this.dataSeeder.seed(seedData);

    await this.eventBus.publish(
      new DataSeededEvent(testCase.id, transaction.id, seedData.stats, new Date())
    );

    this.logger.info('Test data seeded', {
      testId: testCase.id.value,
      transactionId: transaction.id.value,
      stats: seedData.stats,
    });

    return transaction;
  }

  private async executeWithTracing(
    testCase: TestCase,
    environment: TestEnvironment,
    context: ExecutionContext,
  ): Promise<ExecutionTrace> {
    this.logger.debug('Starting execution', {
      testId: testCase.id.value,
      prompt: testCase.prompt.value,
    });

    // Start trace session
    const traceSession = this.tracer.startTrace(testCase.id);
    context.setTraceSession(traceSession);

    // Execute
    const request = ExecutionRequest.from(testCase, environment);
    const result = await this.executionEngine.execute(request);

    // End trace
    const trace = this.tracer.endTrace(traceSession);

    this.logger.info('Execution completed', {
      testId: testCase.id.value,
      duration: trace.duration.milliseconds,
      toolsUsed: trace.toolsUsed.map(t => t.value),
      tokensUsed: trace.tokensUsed.total,
    });

    return trace;
  }

  private async cleanup(
    transaction: SeedTransaction,
    context: ExecutionContext,
  ): Promise<void> {
    this.logger.debug('Cleaning up test data', {
      transactionId: transaction.id.value,
    });

    await this.dataSeeder.cleanup(transaction);

    this.logger.debug('Test data cleaned up');
  }

  private async finalCleanup(
    environment: TestEnvironment | null,
    context: ExecutionContext,
  ): Promise<void> {
    if (!environment) return;

    this.logger.debug('Destroying test environment', {
      environmentId: environment.id.value,
    });

    try {
      await this.dataSeeder.destroyEnvironment(environment);
      this.logger.debug('Test environment destroyed');
    } catch (error) {
      this.logger.error('Failed to destroy test environment', {
        environmentId: environment.id.value,
        error,
      });
    }
  }

  private async handleError(
    testCase: TestCase,
    error: unknown,
    context: ExecutionContext,
  ): Promise<void> {
    this.logger.error('Test execution failed', {
      testId: testCase.id.value,
      error,
    });

    await this.eventBus.publish(
      new TestFailedEvent(
        testCase.id,
        ExecutionError.from(error),
        new Date()
      )
    );
  }

  private prepareSeedData(
    testCase: TestCase,
    environment: TestEnvironment,
  ): SeedData {
    return SeedData.from({
      environmentId: environment.id,
      persona: testCase.configuration.persona,
      dateRange: testCase.configuration.dateRange,
      counts: {
        emails: testCase.configuration.mockDataCounts.emails,
        events: testCase.configuration.mockDataCounts.events,
        tasks: testCase.configuration.mockDataCounts.tasks,
      },
    });
  }
}

// packages/testing/core/application/usecases/ScoreExecution.ts

export class ScoreExecutionUseCase {
  constructor(
    private readonly scorers: readonly IScorer[],
    private readonly strategy: IScoringStrategy,
    private readonly eventBus: IEventBus,
    private readonly logger: ILogger,
  ) {}

  async execute(params: ScoreExecutionParams): Promise<ScoringResult> {
    const { testCase, trace } = params;

    this.logger.debug('Scoring execution', {
      testId: testCase.id.value,
      scorerCount: this.scorers.length,
    });

    await this.eventBus.publish(
      new ScoringStartedEvent(testCase.id, trace.executionId, new Date())
    );

    try {
      // Score with all scorers in parallel
      const scoringResults = await Promise.all(
        this.scorers.map(scorer =>
          this.scoreWithScorer(scorer, testCase, trace)
        )
      );

      // Combine using strategy
      const finalScore = this.strategy.combine(scoringResults);

      await this.eventBus.publish(
        new ScoringCompletedEvent(testCase.id, finalScore, new Date())
      );

      this.logger.info('Scoring completed', {
        testId: testCase.id.value,
        overallScore: finalScore.overallScore.value,
        scorersUsed: scoringResults.map(r => r.scorerId.value),
      });

      return finalScore;

    } catch (error) {
      this.logger.error('Scoring failed', {
        testId: testCase.id.value,
        error,
      });

      await this.eventBus.publish(
        new ScoringFailedEvent(
          testCase.id,
          ExecutionError.from(error),
          new Date()
        )
      );

      throw error;
    }
  }

  private async scoreWithScorer(
    scorer: IScorer,
    testCase: TestCase,
    trace: ExecutionTrace,
  ): Promise<ScoringResult> {
    const metadata = scorer.getMetadata();

    this.logger.debug('Scoring with scorer', {
      scorerId: metadata.id.value,
      scorerName: metadata.name,
    });

    const scoringParams = ScoringParams.from(testCase, trace);
    const result = await scorer.score(scoringParams);

    this.logger.debug('Scorer completed', {
      scorerId: metadata.id.value,
      score: result.overallScore.value,
    });

    return result;
  }
}

// packages/testing/core/application/usecases/GenerateReport.ts

export class GenerateReportUseCase {
  constructor(
    private readonly reporters: Map<ReportFormat, IReporter>,
    private readonly eventBus: IEventBus,
    private readonly logger: ILogger,
  ) {}

  async execute(params: GenerateReportParams): Promise<ReportOutput> {
    const { report, format, outputPath } = params;

    this.logger.debug('Generating report', {
      format: format.value,
      testCount: report.results.length,
    });

    const reporter = this.reporters.get(format);
    if (!reporter) {
      throw new UnsupportedReportFormatError(
        `No reporter registered for format: ${format.value}`
      );
    }

    // Validate
    const validation = reporter.canGenerate(report);
    if (!validation.isValid) {
      throw new InvalidReportError(validation.errors.join(', '));
    }

    await this.eventBus.publish(
      new ReportGenerationStartedEvent(format, new Date())
    );

    try {
      const output = await reporter.generate(report);

      await this.eventBus.publish(
        new ReportGeneratedEvent(format, output.path, new Date())
      );

      this.logger.info('Report generated', {
        format: format.value,
        outputPath: output.path.value,
        size: output.size,
      });

      return output;

    } catch (error) {
      this.logger.error('Report generation failed', {
        format: format.value,
        error,
      });

      throw error;
    }
  }
}
```

---

## Infrastructure Layer - Adapters

```typescript
// packages/testing/infrastructure/adapters/data/SupabaseDataSeeder.ts

export class SupabaseDataSeeder implements IDataSeeder {
  constructor(
    private readonly clientFactory: ISupabaseClientFactory,
    private readonly logger: ILogger,
    private readonly config: DataSeederConfig,
  ) {}

  async seed(data: SeedData): Promise<SeedTransaction> {
    const client = this.clientFactory.create(true);
    const transactionId = TransactionId.generate();

    this.logger.debug('Starting seed transaction', {
      transactionId: transactionId.value,
      environmentId: data.environmentId.value,
    });

    try {
      // Start database transaction
      await this.beginTransaction(client, transactionId);

      // Insert data with transaction ID for cleanup
      await this.insertEmails(client, data.emails, transactionId);
      await this.insertEvents(client, data.events, transactionId);
      await this.insertTasks(client, data.tasks, transactionId);
      await this.insertContacts(client, data.contacts, transactionId);

      // Commit transaction
      await this.commitTransaction(client, transactionId);

      this.logger.info('Seed transaction completed', {
        transactionId: transactionId.value,
        stats: {
          emails: data.emails.length,
          events: data.events.length,
          tasks: data.tasks.length,
          contacts: data.contacts.length,
        },
      });

      return new SeedTransaction(transactionId, data, new Date());

    } catch (error) {
      this.logger.error('Seed transaction failed, rolling back', {
        transactionId: transactionId.value,
        error,
      });

      await this.rollbackTransaction(client, transactionId);
      throw new SeedError('Failed to seed data', error);
    }
  }

  async cleanup(transaction: SeedTransaction): Promise<void> {
    const client = this.clientFactory.create(true);

    this.logger.debug('Cleaning up transaction', {
      transactionId: transaction.id.value,
    });

    try {
      // Delete all data associated with this transaction
      await client
        .from('test_transactions')
        .delete()
        .eq('transaction_id', transaction.id.value);

      this.logger.info('Transaction cleaned up', {
        transactionId: transaction.id.value,
      });

    } catch (error) {
      this.logger.error('Cleanup failed', {
        transactionId: transaction.id.value,
        error,
      });

      throw new CleanupError('Failed to cleanup transaction', error);
    }
  }

  async createEnvironment(config: EnvironmentConfig): Promise<TestEnvironment> {
    const client = this.clientFactory.create(true);
    const environmentId = EnvironmentId.generate();

    this.logger.debug('Creating test environment', {
      environmentId: environmentId.value,
      persona: config.persona.name,
    });

    try {
      // Create test user
      const userId = await this.createTestUser(client, config);

      // Create environment record
      await client.from('test_environments').insert({
        id: environmentId.value,
        user_id: userId.value,
        persona: config.persona.name,
        created_at: new Date().toISOString(),
      });

      this.logger.info('Test environment created', {
        environmentId: environmentId.value,
        userId: userId.value,
      });

      return new SupabaseTestEnvironment(
        environmentId,
        userId,
        this.clientFactory,
        this.logger,
      );

    } catch (error) {
      this.logger.error('Failed to create environment', { error });
      throw new EnvironmentCreationError('Failed to create test environment', error);
    }
  }

  async destroyEnvironment(environment: TestEnvironment): Promise<void> {
    const client = this.clientFactory.create(true);

    this.logger.debug('Destroying test environment', {
      environmentId: environment.id.value,
    });

    try {
      // Delete environment and all associated data (cascades)
      await client
        .from('test_environments')
        .delete()
        .eq('id', environment.id.value);

      this.logger.info('Test environment destroyed', {
        environmentId: environment.id.value,
      });

    } catch (error) {
      this.logger.error('Failed to destroy environment', {
        environmentId: environment.id.value,
        error,
      });

      throw new EnvironmentDestructionError('Failed to destroy environment', error);
    }
  }

  async isHealthy(): Promise<HealthStatus> {
    try {
      const client = this.clientFactory.create(true);
      const { error } = await client.from('test_environments').select('count').limit(1);

      return error
        ? HealthStatus.unhealthy('Database connection failed')
        : HealthStatus.healthy();

    } catch (error) {
      return HealthStatus.unhealthy(`Health check failed: ${error}`);
    }
  }

  private async beginTransaction(
    client: SupabaseClient,
    transactionId: TransactionId,
  ): Promise<void> {
    await client.rpc('begin_test_transaction', {
      transaction_id: transactionId.value,
    });
  }

  private async commitTransaction(
    client: SupabaseClient,
    transactionId: TransactionId,
  ): Promise<void> {
    await client.rpc('commit_test_transaction', {
      transaction_id: transactionId.value,
    });
  }

  private async rollbackTransaction(
    client: SupabaseClient,
    transactionId: TransactionId,
  ): Promise<void> {
    try {
      await client.rpc('rollback_test_transaction', {
        transaction_id: transactionId.value,
      });
    } catch (error) {
      this.logger.error('Rollback failed', { error });
    }
  }

  private async insertEmails(
    client: SupabaseClient,
    emails: readonly MockEmail[],
    transactionId: TransactionId,
  ): Promise<void> {
    if (emails.length === 0) return;

    const records = emails.map(email => ({
      ...email.toDatabase(),
      test_transaction_id: transactionId.value,
    }));

    const { error } = await client.from('emails').insert(records);
    if (error) throw new DatabaseError('Failed to insert emails', error);
  }

  private async insertEvents(
    client: SupabaseClient,
    events: readonly MockEvent[],
    transactionId: TransactionId,
  ): Promise<void> {
    if (events.length === 0) return;

    const records = events.map(event => ({
      ...event.toDatabase(),
      test_transaction_id: transactionId.value,
    }));

    const { error } = await client.from('events').insert(records);
    if (error) throw new DatabaseError('Failed to insert events', error);
  }

  private async createTestUser(
    client: SupabaseClient,
    config: EnvironmentConfig,
  ): Promise<UserId> {
    const userId = UserId.generate();
    const email = `test-${userId.value}@tide-test.com`;

    const { error } = await client.auth.admin.createUser({
      email,
      password: generateSecurePassword(),
      email_confirm: true,
      user_metadata: {
        test_user: true,
        persona: config.persona.name,
      },
    });

    if (error) throw new UserCreationError('Failed to create test user', error);

    return userId;
  }
}

// packages/testing/infrastructure/adapters/data/InMemoryDataSeeder.ts

export class InMemoryDataSeeder implements IDataSeeder {
  private readonly storage = new Map<string, SeedData>();
  private readonly environments = new Map<string, InMemoryTestEnvironment>();

  constructor(private readonly logger: ILogger) {}

  async seed(data: SeedData): Promise<SeedTransaction> {
    const transactionId = TransactionId.generate();

    this.storage.set(transactionId.value, data);

    this.logger.debug('Seeded data to memory', {
      transactionId: transactionId.value,
      stats: data.stats,
    });

    return new SeedTransaction(transactionId, data, new Date());
  }

  async cleanup(transaction: SeedTransaction): Promise<void> {
    this.storage.delete(transaction.id.value);

    this.logger.debug('Cleaned up memory storage', {
      transactionId: transaction.id.value,
    });
  }

  async createEnvironment(config: EnvironmentConfig): Promise<TestEnvironment> {
    const environmentId = EnvironmentId.generate();
    const userId = UserId.generate();

    const environment = new InMemoryTestEnvironment(
      environmentId,
      userId,
      this.storage,
      this.logger,
    );

    this.environments.set(environmentId.value, environment);

    return environment;
  }

  async destroyEnvironment(environment: TestEnvironment): Promise<void> {
    this.environments.delete(environment.id.value);
  }

  async isHealthy(): Promise<HealthStatus> {
    return HealthStatus.healthy();
  }

  getData(transactionId: TransactionId): SeedData | undefined {
    return this.storage.get(transactionId.value);
  }
}

// packages/testing/infrastructure/adapters/execution/InstrumentedExecutionEngine.ts

export class InstrumentedExecutionEngine implements IExecutionEngine {
  constructor(
    private readonly orchestrator: IOrchestrator,
    private readonly eventBus: IEventBus,
    private readonly logger: ILogger,
  ) {}

  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    this.logger.debug('Executing request', {
      prompt: request.prompt.value,
      environmentId: request.environment.id.value,
    });

    // Publish execution started event
    await this.eventBus.publish(
      new ExecutionStartedEvent(
        request.testId,
        request.prompt,
        new Date()
      )
    );

    try {
      // Execute through orchestrator
      const response = await this.orchestrator.process({
        content: request.prompt.value,
        userId: request.environment.userId.value,
        context: request.context,
      });

      // Publish completion event
      await this.eventBus.publish(
        new ExecutionCompletedEvent(
          request.testId,
          response.content,
          response.metadata,
          new Date()
        )
      );

      return ExecutionResult.success(
        response.content,
        ExecutionMetadata.from(response.metadata)
      );

    } catch (error) {
      this.logger.error('Execution failed', { error });

      await this.eventBus.publish(
        new ExecutionFailedEvent(
          request.testId,
          ExecutionError.from(error),
          new Date()
        )
      );

      throw error;
    }
  }

  async healthCheck(): Promise<HealthStatus> {
    // Check if orchestrator is responsive
    try {
      const testRequest = ExecutionRequest.healthCheck();
      await this.execute(testRequest);
      return HealthStatus.healthy();
    } catch (error) {
      return HealthStatus.unhealthy(`Engine health check failed: ${error}`);
    }
  }

  getMetadata(): EngineMetadata {
    return new EngineMetadata(
      'instrumented-execution-engine',
      '1.0.0',
      ['event-driven', 'traced'],
    );
  }
}

// packages/testing/infrastructure/adapters/tracing/EventDrivenTracer.ts

export class EventDrivenTracer implements ITracer {
  private readonly sessions = new Map<string, TraceSessionImpl>();

  constructor(private readonly eventBus: IEventBus) {
    this.subscribeToEvents();
  }

  startTrace(testId: TestCaseId): TraceSession {
    const sessionId = SessionId.generate();
    const session = new TraceSessionImpl(testId, sessionId, new Date());

    this.sessions.set(sessionId.value, session);

    return session;
  }

  recordStep(session: TraceSession, stepData: TraceStepData): void {
    const sessionImpl = this.getSession(session.id);
    sessionImpl.addStep(stepData);
  }

  endTrace(session: TraceSession): ExecutionTrace {
    const sessionImpl = this.getSession(session.id);
    const trace = sessionImpl.build();

    this.sessions.delete(session.id.value);

    return trace;
  }

  getActiveSessions(): readonly TraceSession[] {
    return Array.from(this.sessions.values());
  }

  private subscribeToEvents(): void {
    // Subscribe to all execution events
    this.eventBus.subscribe(AICallStartedEvent, this.onAICallStarted.bind(this));
    this.eventBus.subscribe(AICallCompletedEvent, this.onAICallCompleted.bind(this));
    this.eventBus.subscribe(ToolExecutionStartedEvent, this.onToolStarted.bind(this));
    this.eventBus.subscribe(ToolExecutionCompletedEvent, this.onToolCompleted.bind(this));
    this.eventBus.subscribe(DatabaseQueryEvent, this.onDatabaseQuery.bind(this));
  }

  private async onAICallStarted(event: AICallStartedEvent): Promise<void> {
    const session = this.findSessionByTestId(event.testId);
    if (!session) return;

    session.startStep({
      type: StepType.AICall,
      timestamp: event.timestamp,
      model: event.model,
      prompt: event.prompt,
    });
  }

  private async onAICallCompleted(event: AICallCompletedEvent): Promise<void> {
    const session = this.findSessionByTestId(event.testId);
    if (!session) return;

    session.completeStep({
      response: event.response,
      tokensUsed: event.tokensUsed,
      duration: event.duration,
    });
  }

  private async onToolStarted(event: ToolExecutionStartedEvent): Promise<void> {
    const session = this.findSessionByTestId(event.testId);
    if (!session) return;

    session.startStep({
      type: StepType.ToolExecution,
      timestamp: event.timestamp,
      toolName: event.toolName,
      arguments: event.arguments,
    });
  }

  private async onToolCompleted(event: ToolExecutionCompletedEvent): Promise<void> {
    const session = this.findSessionByTestId(event.testId);
    if (!session) return;

    session.completeStep({
      result: event.result,
      success: event.success,
      error: event.error,
      duration: event.duration,
    });
  }

  private async onDatabaseQuery(event: DatabaseQueryEvent): Promise<void> {
    const session = this.findSessionByTestId(event.testId);
    if (!session) return;

    session.addStep({
      type: StepType.DatabaseQuery,
      timestamp: event.timestamp,
      table: event.table,
      operation: event.operation,
      duration: event.duration,
    });
  }

  private getSession(sessionId: SessionId): TraceSessionImpl {
    const session = this.sessions.get(sessionId.value);
    if (!session) {
      throw new SessionNotFoundError(`Session not found: ${sessionId.value}`);
    }
    return session;
  }

  private findSessionByTestId(testId: TestCaseId): TraceSessionImpl | undefined {
    return Array.from(this.sessions.values()).find(
      session => session.testId.equals(testId)
    );
  }
}

// packages/testing/infrastructure/adapters/scoring/LLMScorer.ts

export class LLMScorer implements IScorer {
  constructor(
    private readonly client: Anthropic,
    private readonly rubric: ScoringRubric,
    private readonly config: LLMScorerConfig,
    private readonly logger: ILogger,
  ) {}

  async score(params: ScoringParams): Promise<ScoringResult> {
    this.logger.debug('Scoring with LLM', {
      testId: params.testCase.id.value,
      model: this.config.model,
    });

    const prompt = this.rubric.buildPrompt(params);

    try {
      const response = await this.callLLM(prompt);
      const judgement = this.parseJudgement(response);

      return new ScoringResult(
        params.testCase.id,
        params.trace.executionId,
        ScorerId.from(this.getMetadata().id.value),
        judgement.scores,
        judgement.overallScore,
        judgement.reasoning,
        judgement.feedback,
        new Date(),
      );

    } catch (error) {
      this.logger.error('LLM scoring failed', {
        testId: params.testCase.id.value,
        error,
      });

      throw new ScoringError('LLM scoring failed', error);
    }
  }

  async batchScore(params: readonly ScoringParams[]): Promise<readonly ScoringResult[]> {
    // Score in parallel with concurrency limit
    const batchSize = this.config.batchSize;
    const results: ScoringResult[] = [];

    for (let i = 0; i < params.length; i += batchSize) {
      const batch = params.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(p => this.score(p))
      );
      results.push(...batchResults);
    }

    return results;
  }

  async isHealthy(): Promise<HealthStatus> {
    try {
      // Quick health check with minimal API call
      await this.client.messages.create({
        model: this.config.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ping' }],
      });

      return HealthStatus.healthy();

    } catch (error) {
      return HealthStatus.unhealthy(`LLM scorer unhealthy: ${error}`);
    }
  }

  getMetadata(): ScorerMetadata {
    return new ScorerMetadata(
      ScorerId.from('llm-scorer-claude'),
      'Claude LLM Scorer',
      '1.0.0',
      ['reasoning', 'nuanced-evaluation', 'natural-language-feedback'],
    );
  }

  private async callLLM(prompt: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: this.config.maxTokens,
      temperature: 0, // Deterministic scoring
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content[0].text;
  }

  private parseJudgement(response: string): Judgement {
    // Extract JSON from markdown code block
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);

    if (!jsonMatch) {
      throw new JudgementParseError('No JSON found in LLM response');
    }

    const json = JSON.parse(jsonMatch[1]);

    return Judgement.from(json);
  }
}
```

---

## Dependency Injection

```typescript
// packages/testing/core/infrastructure/di/Container.ts

export class DIContainer {
  private readonly bindings = new Map<Token, Binding>();
  private readonly singletons = new Map<Token, any>();
  private readonly parent?: DIContainer;

  constructor(parent?: DIContainer) {
    this.parent = parent;
  }

  bind<T>(token: Token, binding: Binding<T>): void {
    this.bindings.set(token, binding);
  }

  bindSingleton<T>(token: Token, factory: Factory<T>): void {
    this.bindings.set(token, {
      factory,
      scope: Scope.Singleton,
    });
  }

  bindTransient<T>(token: Token, factory: Factory<T>): void {
    this.bindings.set(token, {
      factory,
      scope: Scope.Transient,
    });
  }

  bindValue<T>(token: Token, value: T): void {
    this.singletons.set(token, value);
  }

  resolve<T>(token: Token): T {
    // Check if value binding
    if (this.singletons.has(token)) {
      return this.singletons.get(token);
    }

    // Get binding
    const binding = this.bindings.get(token) || this.parent?.bindings.get(token);

    if (!binding) {
      throw new BindingNotFoundError(`No binding found for token: ${token}`);
    }

    // Singleton scope
    if (binding.scope === Scope.Singleton) {
      if (!this.singletons.has(token)) {
        this.singletons.set(token, binding.factory(this));
      }
      return this.singletons.get(token);
    }

    // Transient scope
    return binding.factory(this);
  }

  createChild(): DIContainer {
    return new DIContainer(this);
  }

  clear(): void {
    this.bindings.clear();
    this.singletons.clear();
  }
}

// packages/testing/core/infrastructure/di/tokens.ts

export const TOKENS = {
  // Core
  CONFIG: 'TestingConfig',
  LOGGER: 'ILogger',
  EVENT_BUS: 'IEventBus',

  // Data Generation
  EMAIL_GENERATOR: 'IDataGenerator<MockEmail>',
  CALENDAR_GENERATOR: 'IDataGenerator<MockEvent>',
  TASK_GENERATOR: 'IDataGenerator<MockTask>',
  CONTACT_GENERATOR: 'IDataGenerator<MockContact>',

  // Data Seeding
  DATA_SEEDER: 'IDataSeeder',

  // Execution
  EXECUTION_ENGINE: 'IExecutionEngine',
  ORCHESTRATOR: 'IOrchestrator',

  // Tracing
  TRACER: 'ITracer',

  // Scoring
  PRIMARY_SCORER: 'IScorer:primary',
  FALLBACK_SCORER: 'IScorer:fallback',
  SCORING_STRATEGY: 'IScoringStrategy',

  // Reporting
  HTML_REPORTER: 'IReporter:html',
  JSON_REPORTER: 'IReporter:json',
  STREAM_REPORTER: 'IReporter:stream',

  // Use Cases
  EXECUTE_TEST: 'ExecuteTestUseCase',
  SCORE_EXECUTION: 'ScoreExecutionUseCase',
  GENERATE_REPORT: 'GenerateReportUseCase',
} as const;

// packages/testing/core/infrastructure/di/setup.ts

export function setupContainer(config: TestingConfig): DIContainer {
  const container = new DIContainer();

  // Core
  container.bindValue(TOKENS.CONFIG, config);
  container.bindSingleton(TOKENS.LOGGER, () => createLogger(config.logging));
  container.bindSingleton(TOKENS.EVENT_BUS, () => new EventBus());

  // Data Generation
  container.bindTransient(TOKENS.EMAIL_GENERATOR, (c) => {
    const logger = c.resolve<ILogger>(TOKENS.LOGGER);
    return new EmailGenerator(config.emailGeneration, logger);
  });

  container.bindTransient(TOKENS.CALENDAR_GENERATOR, (c) => {
    const logger = c.resolve<ILogger>(TOKENS.LOGGER);
    return new CalendarGenerator(config.calendarGeneration, logger);
  });

  // Data Seeding
  if (config.dataSeeder === 'supabase') {
    container.bindSingleton(TOKENS.DATA_SEEDER, (c) => {
      const logger = c.resolve<ILogger>(TOKENS.LOGGER);
      const clientFactory = new SupabaseClientFactory(config.supabase);
      return new SupabaseDataSeeder(clientFactory, logger, config.seeding);
    });
  } else {
    container.bindSingleton(TOKENS.DATA_SEEDER, (c) => {
      const logger = c.resolve<ILogger>(TOKENS.LOGGER);
      return new InMemoryDataSeeder(logger);
    });
  }

  // Execution
  container.bindSingleton(TOKENS.EXECUTION_ENGINE, (c) => {
    const orchestrator = c.resolve<IOrchestrator>(TOKENS.ORCHESTRATOR);
    const eventBus = c.resolve<IEventBus>(TOKENS.EVENT_BUS);
    const logger = c.resolve<ILogger>(TOKENS.LOGGER);
    return new InstrumentedExecutionEngine(orchestrator, eventBus, logger);
  });

  // Tracing
  container.bindSingleton(TOKENS.TRACER, (c) => {
    const eventBus = c.resolve<IEventBus>(TOKENS.EVENT_BUS);
    return new EventDrivenTracer(eventBus);
  });

  // Scoring
  container.bindSingleton(TOKENS.PRIMARY_SCORER, (c) => {
    const logger = c.resolve<ILogger>(TOKENS.LOGGER);
    const client = new Anthropic({ apiKey: config.anthropic.apiKey });
    const rubric = new DefaultScoringRubric();
    return new LLMScorer(client, rubric, config.llmScorer, logger);
  });

  container.bindSingleton(TOKENS.FALLBACK_SCORER, () => {
    const rules = createDefaultScoringRules();
    return new RuleBasedScorer(rules);
  });

  container.bindSingleton(TOKENS.SCORING_STRATEGY, (c) => {
    const primary = c.resolve<IScorer>(TOKENS.PRIMARY_SCORER);
    const fallback = c.resolve<IScorer>(TOKENS.FALLBACK_SCORER);
    return new FallbackScoringStrategy(primary, fallback, config.scoringTimeout);
  });

  // Reporting
  container.bindTransient(TOKENS.HTML_REPORTER, (c) => {
    const logger = c.resolve<ILogger>(TOKENS.LOGGER);
    return new HTMLReporter(config.reporting, logger);
  });

  container.bindTransient(TOKENS.JSON_REPORTER, (c) => {
    const logger = c.resolve<ILogger>(TOKENS.LOGGER);
    return new JSONReporter(config.reporting, logger);
  });

  // Use Cases
  container.bindTransient(TOKENS.EXECUTE_TEST, (c) => {
    const dataSeeder = c.resolve<IDataSeeder>(TOKENS.DATA_SEEDER);
    const engine = c.resolve<IExecutionEngine>(TOKENS.EXECUTION_ENGINE);
    const tracer = c.resolve<ITracer>(TOKENS.TRACER);
    const eventBus = c.resolve<IEventBus>(TOKENS.EVENT_BUS);
    const logger = c.resolve<ILogger>(TOKENS.LOGGER);

    return new ExecuteTestUseCase(dataSeeder, engine, tracer, eventBus, logger);
  });

  container.bindTransient(TOKENS.SCORE_EXECUTION, (c) => {
    const primary = c.resolve<IScorer>(TOKENS.PRIMARY_SCORER);
    const strategy = c.resolve<IScoringStrategy>(TOKENS.SCORING_STRATEGY);
    const eventBus = c.resolve<IEventBus>(TOKENS.EVENT_BUS);
    const logger = c.resolve<ILogger>(TOKENS.LOGGER);

    return new ScoreExecutionUseCase([primary], strategy, eventBus, logger);
  });

  container.bindTransient(TOKENS.GENERATE_REPORT, (c) => {
    const htmlReporter = c.resolve<IReporter>(TOKENS.HTML_REPORTER);
    const jsonReporter = c.resolve<IReporter>(TOKENS.JSON_REPORTER);
    const eventBus = c.resolve<IEventBus>(TOKENS.EVENT_BUS);
    const logger = c.resolve<ILogger>(TOKENS.LOGGER);

    const reporters = new Map<ReportFormat, IReporter>([
      [ReportFormat.HTML, htmlReporter],
      [ReportFormat.JSON, jsonReporter],
    ]);

    return new GenerateReportUseCase(reporters, eventBus, logger);
  });

  return container;
}
```

---

## Usage

```typescript
// Setup
const config = TestingConfig.loadFromEnvironment();
const container = setupContainer(config);

// Build test case
const testCase = TestCaseBuilder.create()
  .withId('email-search-01')
  .withPrompt('Find all emails from john@example.com in the last week')
  .expectingTools('search_emails')
  .expectingOutcome(
    ExpectedOutcome.success()
      .mustInclude('john@example.com', 'last week')
  )
  .forPersona(Persona.BUSY_EXECUTIVE)
  .build();

// Execute test
const executeTest = container.resolve<ExecuteTestUseCase>(TOKENS.EXECUTE_TEST);
const executionResult = await executeTest.execute(testCase);

// Score execution
const scoreExecution = container.resolve<ScoreExecutionUseCase>(TOKENS.SCORE_EXECUTION);
const scoringResult = await scoreExecution.execute({
  testCase,
  trace: executionResult.trace,
});

// Generate report
const generateReport = container.resolve<GenerateReportUseCase>(TOKENS.GENERATE_REPORT);
const report = TestReport.from([{ testCase, trace: executionResult.trace, score: scoringResult }]);
const output = await generateReport.execute({
  report,
  format: ReportFormat.HTML,
  outputPath: OutputPath.from('./reports/test-report.html'),
});

console.log(`Report generated: ${output.path.value}`);
console.log(`Test passed: ${scoringResult.passed()}`);
```

---

## Key Principles

1. **Hexagonal Architecture**: Domain is independent of infrastructure
2. **SOLID**: Every class has single responsibility, depends on abstractions
3. **DI**: All dependencies injected, easy to test and swap
4. **Event-Driven**: Tracing via events, no code mutation
5. **Immutability**: Value objects and entities are immutable
6. **Type Safety**: Strong typing throughout, domain-driven design
7. **Testability**: Every component can be tested in isolation
8. **Extensibility**: Add new implementations without modifying existing code

This is a production-grade, enterprise-quality architecture that scales.
