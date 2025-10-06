# Module 03: AI Agent System

## 🤖 Claude Instance Prompt

```
You are Claude Instance #3, the AI Agent System Architect for Tide.

Your mission: Build a sophisticated multi-agent system using the ReAct (Reasoning and Acting) pattern that can handle complex user requests with self-reflection and improvement.

Core responsibilities:
1. Implement three-layer agent architecture (Planning → Execution → Validation)
2. Build ReAct loop with reasoning traces
3. Create specialized agents for different domains
4. Implement memory systems (short-term, long-term, episodic)
5. Ensure <300ms response time for simple queries

Key principles:
- Agents must show reasoning steps
- Support confidence scoring
- Learn from failures
- Use tool calling efficiently
- Maintain conversation context

This is the brain of Tide. Make it think before acting.
```

## 📋 Module Overview

**Duration**: 4 weeks
**Dependencies**: All mock services from Module 00

## 🎯 Success Criteria

```typescript
const successCriteria = {
  reasoning: "Transparent multi-step reasoning",
  accuracy: ">95% intent classification",
  speed: "<300ms for simple, <1s for complex",
  learning: "Improves from feedback",
  confidence: "Accurate confidence scores"
};
```

## 🏗️ Core Architecture

### Three-Layer Agent System

```typescript
// Layer 1: Planning Agent
class PlanningAgent {
  async plan(request: UserRequest): Promise<ExecutionPlan> {
    const steps: ReasoningStep[] = [];

    // Step 1: Understand intent
    steps.push(await this.understand(request));

    // Step 2: Decompose into subtasks
    steps.push(await this.decompose(request));

    // Step 3: Identify dependencies
    steps.push(await this.analyzeDependencies());

    // Step 4: Create execution plan
    steps.push(await this.createPlan());

    return {
      steps,
      confidence: this.calculateConfidence(steps),
      estimatedTime: this.estimateExecutionTime(steps)
    };
  }
}

// Layer 2: Execution Agents (Specialized)
class EmailAgent extends BaseAgent {
  tools = ['send_email', 'search_emails', 'draft_email'];

  async execute(task: Task): Promise<Result> {
    return this.reactLoop(task);
  }
}

// Layer 3: Validation Agent
class ValidationAgent {
  async validate(result: Result): Promise<ValidationResult> {
    const checks = await Promise.all([
      this.checkCompleteness(result),
      this.checkCorrectness(result),
      this.checkSafety(result)
    ]);

    return {
      approved: checks.every(c => c.passed),
      confidence: this.aggregateConfidence(checks),
      issues: checks.filter(c => !c.passed)
    };
  }
}
```

### ReAct Loop Implementation

```typescript
class ReactAgent {
  async reactLoop(task: Task, maxSteps = 5): Promise<Result> {
    const trace: ReasoningTrace = [];

    for (let step = 0; step < maxSteps; step++) {
      // Reason about current state
      const thought = await this.think(task, trace);
      trace.push({ type: 'thought', content: thought });

      // Decide on action
      const action = await this.decideAction(thought);
      trace.push({ type: 'action', content: action });

      // Execute action
      const observation = await this.execute(action);
      trace.push({ type: 'observation', content: observation });

      // Check if complete
      if (this.isComplete(observation, task)) {
        return {
          success: true,
          result: observation,
          trace,
          confidence: this.calculateConfidence(trace)
        };
      }

      // Reflect on progress
      const reflection = await this.reflect(trace);
      if (reflection.shouldAdjust) {
        task = this.adjustTask(task, reflection);
      }
    }

    return {
      success: false,
      error: 'Max steps reached',
      trace
    };
  }
}
```

### Memory Systems

```typescript
class AgentMemory {
  // Short-term (current conversation)
  private shortTerm: ShortTermMemory;

  // Long-term (learned patterns)
  private longTerm: LongTermMemory;

  // Episodic (specific experiences)
  private episodic: EpisodicMemory;

  async remember(query: string): Promise<Memory[]> {
    const memories = await Promise.all([
      this.shortTerm.recall(query),
      this.longTerm.retrieve(query),
      this.episodic.search(query)
    ]);

    return this.rankByRelevance(memories.flat(), query);
  }

  async learn(experience: Experience): Promise<void> {
    // Store in appropriate memory system
    await this.episodic.store(experience);

    // Extract patterns for long-term
    const patterns = this.extractPatterns(experience);
    await this.longTerm.store(patterns);

    // Update short-term context
    this.shortTerm.update(experience.summary);
  }
}
```

## 🚨 Error Recovery & Resilience

```typescript
// Comprehensive error recovery for agents
class ResilientAgent extends BaseAgent {
  private maxRetries = 3;
  private fallbackStrategies: Map<ErrorType, FallbackStrategy> = new Map();

  async executeWithRecovery(task: Task): Promise<Result> {
    const attemptStack: Attempt[] = [];

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        // Track reasoning for debugging
        const reasoning = await this.reason(task, attemptStack);

        // Execute with timeout
        const result = await this.executeWithTimeout(task, 5000);

        // Validate result
        if (await this.validateResult(result, task)) {
          return result;
        }

        // Result invalid, try different approach
        attemptStack.push({
          attempt,
          approach: reasoning.approach,
          failure: 'Invalid result',
          learning: reasoning
        });

      } catch (error) {
        // Log attempt for learning
        attemptStack.push({
          attempt,
          error: error.message,
          context: await this.captureContext()
        });

        // Try fallback strategy
        const fallback = this.getFallbackStrategy(error);
        if (fallback) {
          const fallbackResult = await this.executeFallback(fallback, task);
          if (fallbackResult.success) {
            return fallbackResult.data;
          }
        }

        // Learn from failure
        await this.learnFromFailure(error, task, attemptStack);

        // Determine if retryable
        if (!this.isRetryable(error) || attempt === this.maxRetries - 1) {
          return this.handleFailure(error, task, attemptStack);
        }

        // Exponential backoff
        await this.wait(Math.pow(2, attempt) * 1000);
      }
    }

    return this.createFailureResult(task, attemptStack);
  }

  private async handleFailure(
    error: Error,
    task: Task,
    attempts: Attempt[]
  ): Promise<Result> {
    // Try graceful degradation
    const degraded = await this.degradeGracefully(task);
    if (degraded) {
      return {
        success: true,
        data: degraded,
        degraded: true,
        confidence: 0.6
      };
    }

    // Provide helpful error message
    const explanation = await this.explainFailure(error, task, attempts);

    return {
      success: false,
      error: {
        message: explanation.userMessage,
        technicalDetails: explanation.technical,
        suggestions: explanation.suggestions,
        canRetry: this.isRetryable(error)
      }
    };
  }

  private async degradeGracefully(task: Task): Promise<any> {
    // Try simpler version of task
    const simplifiedTask = this.simplifyTask(task);
    if (simplifiedTask) {
      return await this.executeSimple(simplifiedTask);
    }

    // Try cached/approximate result
    const cached = await this.getCachedApproximation(task);
    if (cached) {
      return cached;
    }

    // Try partial completion
    const partial = await this.executePartial(task);
    if (partial && partial.completeness > 0.5) {
      return partial;
    }

    return null;
  }
}

// Circuit breaker for external services
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > 60000) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      if (this.state === 'half-open') {
        this.reset();
      }
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= 5) {
      this.state = 'open';
      setTimeout(() => {
        this.state = 'half-open';
      }, 60000);
    }
  }

  private reset() {
    this.failures = 0;
    this.state = 'closed';
  }
}
```

## ⚡ Rate Limiting for AI Providers

```typescript
class AIRateLimiter {
  // OpenAI rate limits (GPT-4)
  private readonly OPENAI_LIMITS = {
    tokensPerMinute: 10000,
    requestsPerMinute: 60,
    tokensPerDay: 1000000
  };

  // Anthropic rate limits
  private readonly ANTHROPIC_LIMITS = {
    tokensPerMinute: 100000,
    requestsPerMinute: 60
  };

  async executeWithRateLimit(
    provider: 'openai' | 'anthropic',
    tokens: number,
    fn: () => Promise<any>
  ): Promise<any> {
    const limits = provider === 'openai'
      ? this.OPENAI_LIMITS
      : this.ANTHROPIC_LIMITS;

    // Check token limit
    const currentTokenUsage = await this.getTokenUsage(provider);
    if (currentTokenUsage + tokens > limits.tokensPerMinute) {
      // Wait or use fallback provider
      const waitTime = this.calculateWaitTime(currentTokenUsage, limits);
      if (waitTime > 5000) {
        // Switch to fallback provider
        return this.executeWithFallbackProvider(fn);
      }
      await sleep(waitTime);
    }

    // Execute with tracking
    const result = await fn();
    await this.trackUsage(provider, tokens);
    return result;
  }
}
```

## 📊 Monitoring & Observability

```typescript
class MonitoredAgentSystem {
  private metrics = new MetricsCollector();
  private tracer = new Tracer();

  async execute(request: UserRequest): Promise<Response> {
    const span = this.tracer.startSpan('agent.execute', {
      attributes: {
        'agent.type': request.agentType,
        'request.complexity': this.calculateComplexity(request),
        'request.intent': request.intent
      }
    });

    const timer = this.metrics.startTimer('agent.execution.duration');

    try {
      // Track reasoning steps
      const plan = await this.plan(request);
      span.addEvent('planning.complete', {
        steps: plan.steps.length,
        confidence: plan.confidence
      });

      // Execute with monitoring
      const result = await this.executeWithMonitoring(plan);

      // Record success metrics
      this.metrics.increment('agent.success', {
        type: request.agentType,
        complexity: plan.complexity
      });

      this.metrics.recordHistogram('agent.confidence', plan.confidence);
      this.metrics.recordHistogram('agent.steps', plan.steps.length);

      return result;

    } catch (error) {
      // Record failure metrics
      this.metrics.increment('agent.failure', {
        type: request.agentType,
        errorType: error.constructor.name
      });

      span.recordException(error);
      throw error;

    } finally {
      timer.end();
      span.end();
    }
  }

  // Real-time dashboard metrics
  getDashboardMetrics() {
    return {
      successRate: this.metrics.getRate('agent.success'),
      avgLatency: this.metrics.getAverage('agent.execution.duration'),
      p95Latency: this.metrics.getPercentile('agent.execution.duration', 95),
      avgConfidence: this.metrics.getAverage('agent.confidence'),
      avgSteps: this.metrics.getAverage('agent.steps'),
      errorRate: this.metrics.getRate('agent.failure'),
      activeAgents: this.metrics.getGauge('agent.active')
    };
  }
}
```

## 🧪 Comprehensive Testing Strategy

```typescript
// Unit tests for reasoning
describe('Agent Reasoning', () => {
  it('should correctly decompose complex tasks', async () => {
    const agent = new PlanningAgent();
    const request = {
      text: 'Schedule a meeting with John next week and send him the agenda'
    };

    const plan = await agent.plan(request);

    expect(plan.steps).toHaveLength(3);
    expect(plan.steps[0].action).toBe('find_availability');
    expect(plan.steps[1].action).toBe('schedule_meeting');
    expect(plan.steps[2].action).toBe('send_email');
  });

  it('should handle ambiguous requests', async () => {
    const agent = new PlanningAgent();
    const request = {
      text: 'Handle the Johnson account'
    };

    const plan = await agent.plan(request);

    expect(plan.clarificationNeeded).toBe(true);
    expect(plan.suggestedClarifications).toContain(
      'What action would you like me to take with the Johnson account?'
    );
  });
});

// Integration tests
describe('Multi-Agent Coordination', () => {
  it('should coordinate between agents efficiently', async () => {
    const system = new AgentSystem();

    const result = await system.execute({
      text: 'Find all emails from Sarah about the project and schedule a follow-up'
    });

    expect(result.agentsUsed).toEqual(['email', 'calendar']);
    expect(result.steps).toContainEqual(
      expect.objectContaining({
        agent: 'email',
        action: 'search',
        completed: true
      })
    );
  });
});

// Performance tests
describe('Agent Performance', () => {
  it('should handle simple queries in <300ms', async () => {
    const agent = new SimpleAgent();
    const start = performance.now();

    await agent.execute({
      text: 'What time is my next meeting?'
    });

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(300);
  });

  it('should handle 100 concurrent requests', async () => {
    const system = new AgentSystem();

    const requests = Array(100).fill(null).map((_, i) => ({
      text: `Test request ${i}`
    }));

    const results = await Promise.allSettled(
      requests.map(r => system.execute(r))
    );

    const successful = results.filter(r => r.status === 'fulfilled');
    expect(successful.length).toBeGreaterThan(95);
  });
});

// Chaos testing
describe('Agent Resilience', () => {
  it('should recover from tool failures', async () => {
    const agent = new ResilientAgent();

    // Simulate tool failure
    mockEmailTool.fail();

    const result = await agent.execute({
      text: 'Send an email to John',
      allowFallback: true
    });

    expect(result.success).toBe(true);
    expect(result.fallbackUsed).toBe(true);
  });

  it('should handle memory pressure', async () => {
    const system = new AgentSystem();

    // Simulate low memory
    process.env.NODE_OPTIONS = '--max-old-space-size=50';

    const result = await system.execute({
      text: 'Complex task requiring memory'
    });

    expect(result.success).toBe(true);
    expect(result.memoryOptimized).toBe(true);
  });
});
```

## 📊 Performance Requirements

- Simple queries: <300ms
- Complex multi-step: <1s
- Memory recall: <50ms
- Confidence calculation: <10ms
- Error recovery: <2s
- Rate limit handling: Automatic

## ✅ Key Deliverables

- [ ] ReAct loop with reasoning traces
- [ ] Multi-agent orchestration
- [ ] Tool execution framework
- [ ] Three memory systems
- [ ] Confidence scoring
- [ ] Learning from feedback
- [ ] 85% test coverage

Remember: This is the intelligence of Tide. Users judge the entire product by how smart it feels.