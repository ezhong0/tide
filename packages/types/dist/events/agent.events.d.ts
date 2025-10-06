/**
 * Agent domain events for multi-agent reasoning system
 */
import { DomainEvent, UUID, Timestamp, UserId, AgentId, SessionId } from '../base.types';
import { AgentRole, AgentStatus, Intent, Action, Task, UserFeedback, Thought, Observation, Reflection } from '../domain/agent.types';
export declare abstract class AgentEvent implements DomainEvent {
    readonly aggregateId: UUID;
    readonly userId: UserId;
    readonly data: unknown;
    abstract readonly eventType: string;
    readonly eventVersion = 1;
    readonly eventId: UUID;
    readonly timestamp: Timestamp;
    readonly metadata: DomainEvent['metadata'];
    constructor(aggregateId: UUID, userId: UserId, data: unknown, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class AgentCreated extends AgentEvent {
    readonly data: {
        agentId: AgentId;
        name: string;
        role: AgentRole;
        capabilities: string[];
        configuration: Record<string, unknown>;
    };
    readonly eventType = "AgentCreated";
    constructor(aggregateId: UUID, userId: UserId, data: {
        agentId: AgentId;
        name: string;
        role: AgentRole;
        capabilities: string[];
        configuration: Record<string, unknown>;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class AgentStatusChanged extends AgentEvent {
    readonly data: {
        agentId: AgentId;
        previousStatus: AgentStatus;
        newStatus: AgentStatus;
        reason?: string;
    };
    readonly eventType = "AgentStatusChanged";
    constructor(aggregateId: UUID, userId: UserId, data: {
        agentId: AgentId;
        previousStatus: AgentStatus;
        newStatus: AgentStatus;
        reason?: string;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class AgentTerminated extends AgentEvent {
    readonly data: {
        agentId: AgentId;
        reason: string;
        graceful: boolean;
    };
    readonly eventType = "AgentTerminated";
    constructor(aggregateId: UUID, userId: UserId, data: {
        agentId: AgentId;
        reason: string;
        graceful: boolean;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class RequestReceived extends AgentEvent {
    readonly data: {
        requestId: UUID;
        sessionId: SessionId;
        text: string;
        complexity: 'simple' | 'moderate' | 'complex';
        priority: 'low' | 'normal' | 'high' | 'urgent';
    };
    readonly eventType = "RequestReceived";
    constructor(aggregateId: UUID, userId: UserId, data: {
        requestId: UUID;
        sessionId: SessionId;
        text: string;
        complexity: 'simple' | 'moderate' | 'complex';
        priority: 'low' | 'normal' | 'high' | 'urgent';
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class IntentClassified extends AgentEvent {
    readonly data: {
        requestId: UUID;
        intent: Intent;
        confidence: number;
        classificationTime: number;
    };
    readonly eventType = "IntentClassified";
    constructor(aggregateId: UUID, userId: UserId, data: {
        requestId: UUID;
        intent: Intent;
        confidence: number;
        classificationTime: number;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class ResponseGenerated extends AgentEvent {
    readonly data: {
        requestId: UUID;
        responseId: UUID;
        agentId: AgentId;
        response: string;
        confidence: number;
        processingTime: number;
    };
    readonly eventType = "ResponseGenerated";
    constructor(aggregateId: UUID, userId: UserId, data: {
        requestId: UUID;
        responseId: UUID;
        agentId: AgentId;
        response: string;
        confidence: number;
        processingTime: number;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class ThoughtGenerated extends AgentEvent {
    readonly data: {
        requestId: UUID;
        agentId: AgentId;
        thought: Thought;
        step: number;
    };
    readonly eventType = "ThoughtGenerated";
    constructor(aggregateId: UUID, userId: UserId, data: {
        requestId: UUID;
        agentId: AgentId;
        thought: Thought;
        step: number;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class ActionPlanned extends AgentEvent {
    readonly data: {
        requestId: UUID;
        agentId: AgentId;
        action: Action;
        reasoning: string;
    };
    readonly eventType = "ActionPlanned";
    constructor(aggregateId: UUID, userId: UserId, data: {
        requestId: UUID;
        agentId: AgentId;
        action: Action;
        reasoning: string;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class ActionExecuted extends AgentEvent {
    readonly data: {
        requestId: UUID;
        agentId: AgentId;
        actionId: UUID;
        result: {
            success: boolean;
            data?: unknown;
            error?: string;
        };
        executionTime: number;
    };
    readonly eventType = "ActionExecuted";
    constructor(aggregateId: UUID, userId: UserId, data: {
        requestId: UUID;
        agentId: AgentId;
        actionId: UUID;
        result: {
            success: boolean;
            data?: unknown;
            error?: string;
        };
        executionTime: number;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class ObservationMade extends AgentEvent {
    readonly data: {
        requestId: UUID;
        agentId: AgentId;
        observation: Observation;
        actionId: UUID;
    };
    readonly eventType = "ObservationMade";
    constructor(aggregateId: UUID, userId: UserId, data: {
        requestId: UUID;
        agentId: AgentId;
        observation: Observation;
        actionId: UUID;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class ReflectionCompleted extends AgentEvent {
    readonly data: {
        requestId: UUID;
        agentId: AgentId;
        reflection: Reflection;
        improvementsMade: boolean;
    };
    readonly eventType = "ReflectionCompleted";
    constructor(aggregateId: UUID, userId: UserId, data: {
        requestId: UUID;
        agentId: AgentId;
        reflection: Reflection;
        improvementsMade: boolean;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class TaskAssigned extends AgentEvent {
    readonly data: {
        taskId: UUID;
        fromAgentId: AgentId;
        toAgentId: AgentId;
        task: Task;
        deadline?: Timestamp;
    };
    readonly eventType = "TaskAssigned";
    constructor(aggregateId: UUID, userId: UserId, data: {
        taskId: UUID;
        fromAgentId: AgentId;
        toAgentId: AgentId;
        task: Task;
        deadline?: Timestamp;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class TaskCompleted extends AgentEvent {
    readonly data: {
        taskId: UUID;
        agentId: AgentId;
        result: unknown;
        completionTime: number;
        success: boolean;
    };
    readonly eventType = "TaskCompleted";
    constructor(aggregateId: UUID, userId: UserId, data: {
        taskId: UUID;
        agentId: AgentId;
        result: unknown;
        completionTime: number;
        success: boolean;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class TaskFailed extends AgentEvent {
    readonly data: {
        taskId: UUID;
        agentId: AgentId;
        error: string;
        retryable: boolean;
        attempts: number;
    };
    readonly eventType = "TaskFailed";
    constructor(aggregateId: UUID, userId: UserId, data: {
        taskId: UUID;
        agentId: AgentId;
        error: string;
        retryable: boolean;
        attempts: number;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class CollaborationStarted extends AgentEvent {
    readonly data: {
        collaborationId: UUID;
        agents: AgentId[];
        objective: string;
        planId: UUID;
    };
    readonly eventType = "CollaborationStarted";
    constructor(aggregateId: UUID, userId: UserId, data: {
        collaborationId: UUID;
        agents: AgentId[];
        objective: string;
        planId: UUID;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class CollaborationCompleted extends AgentEvent {
    readonly data: {
        collaborationId: UUID;
        success: boolean;
        result?: unknown;
        totalTime: number;
        agentContributions: Record<string, unknown>;
    };
    readonly eventType = "CollaborationCompleted";
    constructor(aggregateId: UUID, userId: UserId, data: {
        collaborationId: UUID;
        success: boolean;
        result?: unknown;
        totalTime: number;
        agentContributions: Record<string, unknown>;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class FeedbackReceived extends AgentEvent {
    readonly data: {
        feedbackId: UUID;
        responseId: UUID;
        agentId: AgentId;
        feedback: UserFeedback;
    };
    readonly eventType = "FeedbackReceived";
    constructor(aggregateId: UUID, userId: UserId, data: {
        feedbackId: UUID;
        responseId: UUID;
        agentId: AgentId;
        feedback: UserFeedback;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class PatternLearned extends AgentEvent {
    readonly data: {
        agentId: AgentId;
        patternId: UUID;
        pattern: {
            trigger: string;
            action: string;
            confidence: number;
        };
        evidence: unknown[];
    };
    readonly eventType = "PatternLearned";
    constructor(aggregateId: UUID, userId: UserId, data: {
        agentId: AgentId;
        patternId: UUID;
        pattern: {
            trigger: string;
            action: string;
            confidence: number;
        };
        evidence: unknown[];
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class SkillImproved extends AgentEvent {
    readonly data: {
        agentId: AgentId;
        skill: string;
        previousLevel: number;
        newLevel: number;
        improvementReason: string;
    };
    readonly eventType = "SkillImproved";
    constructor(aggregateId: UUID, userId: UserId, data: {
        agentId: AgentId;
        skill: string;
        previousLevel: number;
        newLevel: number;
        improvementReason: string;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class MemoryStored extends AgentEvent {
    readonly data: {
        agentId: AgentId;
        memoryType: 'short-term' | 'long-term' | 'episodic';
        memoryId: UUID;
        content: unknown;
        relevance: number;
    };
    readonly eventType = "MemoryStored";
    constructor(aggregateId: UUID, userId: UserId, data: {
        agentId: AgentId;
        memoryType: 'short-term' | 'long-term' | 'episodic';
        memoryId: UUID;
        content: unknown;
        relevance: number;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class MemoryRetrieved extends AgentEvent {
    readonly data: {
        agentId: AgentId;
        query: string;
        memoriesFound: number;
        relevanceScores: number[];
        retrievalTime: number;
    };
    readonly eventType = "MemoryRetrieved";
    constructor(aggregateId: UUID, userId: UserId, data: {
        agentId: AgentId;
        query: string;
        memoriesFound: number;
        relevanceScores: number[];
        retrievalTime: number;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class MemoryConsolidated extends AgentEvent {
    readonly data: {
        agentId: AgentId;
        consolidationType: 'compression' | 'abstraction' | 'forgetting';
        memoriesProcessed: number;
        memoriesRetained: number;
    };
    readonly eventType = "MemoryConsolidated";
    constructor(aggregateId: UUID, userId: UserId, data: {
        agentId: AgentId;
        consolidationType: 'compression' | 'abstraction' | 'forgetting';
        memoriesProcessed: number;
        memoriesRetained: number;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class AgentErrorOccurred extends AgentEvent {
    readonly data: {
        agentId: AgentId;
        errorType: string;
        errorMessage: string;
        context: unknown;
        recoverable: boolean;
    };
    readonly eventType = "AgentErrorOccurred";
    constructor(aggregateId: UUID, userId: UserId, data: {
        agentId: AgentId;
        errorType: string;
        errorMessage: string;
        context: unknown;
        recoverable: boolean;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class AgentRecovered extends AgentEvent {
    readonly data: {
        agentId: AgentId;
        recoveryMethod: string;
        dataLoss: boolean;
        recoveryTime: number;
    };
    readonly eventType = "AgentRecovered";
    constructor(aggregateId: UUID, userId: UserId, data: {
        agentId: AgentId;
        recoveryMethod: string;
        dataLoss: boolean;
        recoveryTime: number;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class PerformanceMetricRecorded extends AgentEvent {
    readonly data: {
        agentId: AgentId;
        metric: string;
        value: number;
        unit: string;
        threshold?: number;
        withinBounds: boolean;
    };
    readonly eventType = "PerformanceMetricRecorded";
    constructor(aggregateId: UUID, userId: UserId, data: {
        agentId: AgentId;
        metric: string;
        value: number;
        unit: string;
        threshold?: number;
        withinBounds: boolean;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
export declare class ConfidenceThresholdAdjusted extends AgentEvent {
    readonly data: {
        agentId: AgentId;
        previousThreshold: number;
        newThreshold: number;
        reason: string;
    };
    readonly eventType = "ConfidenceThresholdAdjusted";
    constructor(aggregateId: UUID, userId: UserId, data: {
        agentId: AgentId;
        previousThreshold: number;
        newThreshold: number;
        reason: string;
    }, metadata?: Partial<DomainEvent['metadata']>);
}
//# sourceMappingURL=agent.events.d.ts.map