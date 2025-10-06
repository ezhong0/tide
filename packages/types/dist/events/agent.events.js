"use strict";
/**
 * Agent domain events for multi-agent reasoning system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfidenceThresholdAdjusted = exports.PerformanceMetricRecorded = exports.AgentRecovered = exports.AgentErrorOccurred = exports.MemoryConsolidated = exports.MemoryRetrieved = exports.MemoryStored = exports.SkillImproved = exports.PatternLearned = exports.FeedbackReceived = exports.CollaborationCompleted = exports.CollaborationStarted = exports.TaskFailed = exports.TaskCompleted = exports.TaskAssigned = exports.ReflectionCompleted = exports.ObservationMade = exports.ActionExecuted = exports.ActionPlanned = exports.ThoughtGenerated = exports.ResponseGenerated = exports.IntentClassified = exports.RequestReceived = exports.AgentTerminated = exports.AgentStatusChanged = exports.AgentCreated = exports.AgentEvent = void 0;
const base_types_1 = require("../base.types");
// Base agent event
class AgentEvent {
    aggregateId;
    userId;
    data;
    eventVersion = 1;
    eventId;
    timestamp;
    metadata;
    constructor(aggregateId, userId, data, metadata) {
        this.aggregateId = aggregateId;
        this.userId = userId;
        this.data = data;
        this.eventId = (0, base_types_1.UUID)(crypto.randomUUID());
        this.timestamp = (0, base_types_1.Timestamp)(Date.now());
        this.metadata = {
            correlationId: metadata?.correlationId || (0, base_types_1.UUID)(crypto.randomUUID()),
            causationId: metadata?.causationId || (0, base_types_1.UUID)(crypto.randomUUID()),
            userId: this.userId,
            source: metadata?.source || 'agent-service',
            ...metadata
        };
    }
}
exports.AgentEvent = AgentEvent;
// Agent lifecycle events
class AgentCreated extends AgentEvent {
    data;
    eventType = 'AgentCreated';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.AgentCreated = AgentCreated;
class AgentStatusChanged extends AgentEvent {
    data;
    eventType = 'AgentStatusChanged';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.AgentStatusChanged = AgentStatusChanged;
class AgentTerminated extends AgentEvent {
    data;
    eventType = 'AgentTerminated';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.AgentTerminated = AgentTerminated;
// Request processing events
class RequestReceived extends AgentEvent {
    data;
    eventType = 'RequestReceived';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.RequestReceived = RequestReceived;
class IntentClassified extends AgentEvent {
    data;
    eventType = 'IntentClassified';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.IntentClassified = IntentClassified;
class ResponseGenerated extends AgentEvent {
    data;
    eventType = 'ResponseGenerated';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.ResponseGenerated = ResponseGenerated;
// ReAct pattern events
class ThoughtGenerated extends AgentEvent {
    data;
    eventType = 'ThoughtGenerated';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.ThoughtGenerated = ThoughtGenerated;
class ActionPlanned extends AgentEvent {
    data;
    eventType = 'ActionPlanned';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.ActionPlanned = ActionPlanned;
class ActionExecuted extends AgentEvent {
    data;
    eventType = 'ActionExecuted';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.ActionExecuted = ActionExecuted;
class ObservationMade extends AgentEvent {
    data;
    eventType = 'ObservationMade';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.ObservationMade = ObservationMade;
class ReflectionCompleted extends AgentEvent {
    data;
    eventType = 'ReflectionCompleted';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.ReflectionCompleted = ReflectionCompleted;
// Multi-agent collaboration events
class TaskAssigned extends AgentEvent {
    data;
    eventType = 'TaskAssigned';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.TaskAssigned = TaskAssigned;
class TaskCompleted extends AgentEvent {
    data;
    eventType = 'TaskCompleted';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.TaskCompleted = TaskCompleted;
class TaskFailed extends AgentEvent {
    data;
    eventType = 'TaskFailed';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.TaskFailed = TaskFailed;
class CollaborationStarted extends AgentEvent {
    data;
    eventType = 'CollaborationStarted';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.CollaborationStarted = CollaborationStarted;
class CollaborationCompleted extends AgentEvent {
    data;
    eventType = 'CollaborationCompleted';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.CollaborationCompleted = CollaborationCompleted;
// Learning events
class FeedbackReceived extends AgentEvent {
    data;
    eventType = 'FeedbackReceived';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.FeedbackReceived = FeedbackReceived;
class PatternLearned extends AgentEvent {
    data;
    eventType = 'PatternLearned';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.PatternLearned = PatternLearned;
class SkillImproved extends AgentEvent {
    data;
    eventType = 'SkillImproved';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.SkillImproved = SkillImproved;
// Memory events
class MemoryStored extends AgentEvent {
    data;
    eventType = 'MemoryStored';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.MemoryStored = MemoryStored;
class MemoryRetrieved extends AgentEvent {
    data;
    eventType = 'MemoryRetrieved';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.MemoryRetrieved = MemoryRetrieved;
class MemoryConsolidated extends AgentEvent {
    data;
    eventType = 'MemoryConsolidated';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.MemoryConsolidated = MemoryConsolidated;
// Error and recovery events
class AgentErrorOccurred extends AgentEvent {
    data;
    eventType = 'AgentErrorOccurred';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.AgentErrorOccurred = AgentErrorOccurred;
class AgentRecovered extends AgentEvent {
    data;
    eventType = 'AgentRecovered';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.AgentRecovered = AgentRecovered;
// Performance monitoring events
class PerformanceMetricRecorded extends AgentEvent {
    data;
    eventType = 'PerformanceMetricRecorded';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.PerformanceMetricRecorded = PerformanceMetricRecorded;
class ConfidenceThresholdAdjusted extends AgentEvent {
    data;
    eventType = 'ConfidenceThresholdAdjusted';
    constructor(aggregateId, userId, data, metadata) {
        super(aggregateId, userId, data, metadata);
        this.data = data;
    }
}
exports.ConfidenceThresholdAdjusted = ConfidenceThresholdAdjusted;
//# sourceMappingURL=agent.events.js.map