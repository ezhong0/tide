/**
 * Agent domain events for multi-agent reasoning system
 */

import {
  DomainEvent, UUID, Timestamp, UserId, AgentId, SessionId
} from '../base.types';
import {
  AgentRole, AgentStatus, Intent, Action, Task, UserFeedback,
  Thought, Observation, Reflection
} from '../domain/agent.types';

// Base agent event
export abstract class AgentEvent implements DomainEvent {
  abstract readonly eventType: string;
  readonly eventVersion = 1;
  readonly eventId: UUID;
  readonly timestamp: Timestamp;
  readonly metadata: DomainEvent['metadata'];

  constructor(
    public readonly aggregateId: UUID,
    public readonly userId: UserId,
    public readonly data: unknown,
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    this.eventId = UUID(crypto.randomUUID());
    this.timestamp = Timestamp(Date.now());
    this.metadata = {
      correlationId: metadata?.correlationId ?? UUID(crypto.randomUUID()),
      causationId: metadata?.causationId ?? UUID(crypto.randomUUID()),
      userId: this.userId,
      source: metadata?.source ?? 'agent-service',
      ...metadata
    };
  }
}

// Agent lifecycle events
export class AgentCreated extends AgentEvent {
  readonly eventType = 'AgentCreated';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      agentId: AgentId;
      name: string;
      role: AgentRole;
      capabilities: string[];
      configuration: Record<string, unknown>;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class AgentStatusChanged extends AgentEvent {
  readonly eventType = 'AgentStatusChanged';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      agentId: AgentId;
      previousStatus: AgentStatus;
      newStatus: AgentStatus;
      reason?: string;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class AgentTerminated extends AgentEvent {
  readonly eventType = 'AgentTerminated';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      agentId: AgentId;
      reason: string;
      graceful: boolean;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

// Request processing events
export class RequestReceived extends AgentEvent {
  readonly eventType = 'RequestReceived';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      requestId: UUID;
      sessionId: SessionId;
      text: string;
      complexity: 'simple' | 'moderate' | 'complex';
      priority: 'low' | 'normal' | 'high' | 'urgent';
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class IntentClassified extends AgentEvent {
  readonly eventType = 'IntentClassified';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      requestId: UUID;
      intent: Intent;
      confidence: number;
      classificationTime: number;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class ResponseGenerated extends AgentEvent {
  readonly eventType = 'ResponseGenerated';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      requestId: UUID;
      responseId: UUID;
      agentId: AgentId;
      response: string;
      confidence: number;
      processingTime: number;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

// ReAct pattern events
export class ThoughtGenerated extends AgentEvent {
  readonly eventType = 'ThoughtGenerated';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      requestId: UUID;
      agentId: AgentId;
      thought: Thought;
      step: number;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class ActionPlanned extends AgentEvent {
  readonly eventType = 'ActionPlanned';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      requestId: UUID;
      agentId: AgentId;
      action: Action;
      reasoning: string;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class ActionExecuted extends AgentEvent {
  readonly eventType = 'ActionExecuted';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      requestId: UUID;
      agentId: AgentId;
      actionId: UUID;
      result: {
        success: boolean;
        data?: unknown;
        error?: string;
      };
      executionTime: number;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class ObservationMade extends AgentEvent {
  readonly eventType = 'ObservationMade';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      requestId: UUID;
      agentId: AgentId;
      observation: Observation;
      actionId: UUID;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class ReflectionCompleted extends AgentEvent {
  readonly eventType = 'ReflectionCompleted';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      requestId: UUID;
      agentId: AgentId;
      reflection: Reflection;
      improvementsMade: boolean;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

// Multi-agent collaboration events
export class TaskAssigned extends AgentEvent {
  readonly eventType = 'TaskAssigned';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      taskId: UUID;
      fromAgentId: AgentId;
      toAgentId: AgentId;
      task: Task;
      deadline?: Timestamp;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class TaskCompleted extends AgentEvent {
  readonly eventType = 'TaskCompleted';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      taskId: UUID;
      agentId: AgentId;
      result: unknown;
      completionTime: number;
      success: boolean;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class TaskFailed extends AgentEvent {
  readonly eventType = 'TaskFailed';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      taskId: UUID;
      agentId: AgentId;
      error: string;
      retryable: boolean;
      attempts: number;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class CollaborationStarted extends AgentEvent {
  readonly eventType = 'CollaborationStarted';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      collaborationId: UUID;
      agents: AgentId[];
      objective: string;
      planId: UUID;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class CollaborationCompleted extends AgentEvent {
  readonly eventType = 'CollaborationCompleted';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      collaborationId: UUID;
      success: boolean;
      result?: unknown;
      totalTime: number;
      agentContributions: Record<string, unknown>;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

// Learning events
export class FeedbackReceived extends AgentEvent {
  readonly eventType = 'FeedbackReceived';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      feedbackId: UUID;
      responseId: UUID;
      agentId: AgentId;
      feedback: UserFeedback;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class PatternLearned extends AgentEvent {
  readonly eventType = 'PatternLearned';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      agentId: AgentId;
      patternId: UUID;
      pattern: {
        trigger: string;
        action: string;
        confidence: number;
      };
      evidence: unknown[];
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class SkillImproved extends AgentEvent {
  readonly eventType = 'SkillImproved';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      agentId: AgentId;
      skill: string;
      previousLevel: number;
      newLevel: number;
      improvementReason: string;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

// Memory events
export class MemoryStored extends AgentEvent {
  readonly eventType = 'MemoryStored';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      agentId: AgentId;
      memoryType: 'short-term' | 'long-term' | 'episodic';
      memoryId: UUID;
      content: unknown;
      relevance: number;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class MemoryRetrieved extends AgentEvent {
  readonly eventType = 'MemoryRetrieved';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      agentId: AgentId;
      query: string;
      memoriesFound: number;
      relevanceScores: number[];
      retrievalTime: number;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class MemoryConsolidated extends AgentEvent {
  readonly eventType = 'MemoryConsolidated';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      agentId: AgentId;
      consolidationType: 'compression' | 'abstraction' | 'forgetting';
      memoriesProcessed: number;
      memoriesRetained: number;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

// Error and recovery events
export class AgentErrorOccurred extends AgentEvent {
  readonly eventType = 'AgentErrorOccurred';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      agentId: AgentId;
      errorType: string;
      errorMessage: string;
      context: unknown;
      recoverable: boolean;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class AgentRecovered extends AgentEvent {
  readonly eventType = 'AgentRecovered';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      agentId: AgentId;
      recoveryMethod: string;
      dataLoss: boolean;
      recoveryTime: number;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

// Performance monitoring events
export class PerformanceMetricRecorded extends AgentEvent {
  readonly eventType = 'PerformanceMetricRecorded';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      agentId: AgentId;
      metric: string;
      value: number;
      unit: string;
      threshold?: number;
      withinBounds: boolean;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}

export class ConfidenceThresholdAdjusted extends AgentEvent {
  readonly eventType = 'ConfidenceThresholdAdjusted';

  constructor(
    aggregateId: UUID,
    userId: UserId,
    public readonly data: {
      agentId: AgentId;
      previousThreshold: number;
      newThreshold: number;
      reason: string;
    },
    metadata?: Partial<DomainEvent['metadata']>
  ) {
    super(aggregateId, userId, data, metadata);
  }
}