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

## 📊 Performance Requirements

- Simple queries: <300ms
- Complex multi-step: <1s
- Memory recall: <50ms
- Confidence calculation: <10ms

## ✅ Key Deliverables

- [ ] ReAct loop with reasoning traces
- [ ] Multi-agent orchestration
- [ ] Tool execution framework
- [ ] Three memory systems
- [ ] Confidence scoring
- [ ] Learning from feedback
- [ ] 85% test coverage

Remember: This is the intelligence of Tide. Users judge the entire product by how smart it feels.