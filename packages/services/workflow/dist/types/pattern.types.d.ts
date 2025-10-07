import { UserId } from '@tide/types';
import { WorkflowDefinition } from './workflow.types';
import { TaskId } from './task.types';
/**
 * Pattern Detection Types
 * Type definitions for behavioral pattern recognition and automation
 */
export type BehaviorId = string & {
    readonly __brand: 'BehaviorId';
};
export type ActionType = 'email_sent' | 'email_read' | 'email_archived' | 'calendar_created' | 'calendar_updated' | 'task_created' | 'task_completed' | 'file_uploaded' | 'file_shared' | 'workflow_executed' | 'message_sent' | string;
export interface UserBehavior {
    userId: UserId;
    action: string;
    timestamp: Date;
    location?: string;
    device?: string;
    emailId?: string;
    calendarEventId?: string;
    taskId?: TaskId;
    workflowId?: string;
    metadata?: Record<string, unknown>;
}
export type PatternId = string & {
    readonly __brand: 'PatternId';
};
export type PatternType = 'temporal' | 'sequential' | 'conditional' | 'collaborative';
export type PatternStatus = 'detected' | 'confirmed' | 'dismissed' | 'automated';
export interface DetectedPattern {
    id: PatternId;
    userId: UserId;
    type: PatternType;
    subtype?: string;
    patternData: any;
    confidence: number;
    frequency: number;
    value: number;
    description: string;
    suggestion: string;
    status?: PatternStatus;
    discoveredAt?: Date;
    lastObservedAt?: Date;
    metadata?: Record<string, unknown>;
}
export interface PatternMetadata {
    sampleSize: number;
    consistency: number;
    timeSaved?: number;
    errorRate?: number;
    [key: string]: unknown;
}
export interface TemporalPattern extends DetectedPattern {
    type: 'temporal';
    subtype: 'daily' | 'weekly' | 'monthly' | 'yearly';
    trigger: TemporalTrigger;
    actions: ActionSequence[];
}
export interface TemporalTrigger {
    time?: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    month?: number;
    days?: number[];
}
export interface ActionSequence {
    action: ActionType;
    order: number;
    avgDuration?: number;
    metadata?: Record<string, unknown>;
}
export interface SequentialPattern extends DetectedPattern {
    type: 'sequential';
    steps: PatternStep[];
    avgDuration: number;
    automation: WorkflowDefinition;
}
export interface PatternStep {
    action: ActionType;
    order: number;
    avgTimeSincePrevious?: number;
    conditions?: PatternCondition[];
    metadata?: Record<string, unknown>;
}
export interface PatternCondition {
    field: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'matches';
    value: unknown;
}
export interface ConditionalPattern extends DetectedPattern {
    type: 'conditional';
    condition: TriggerCondition;
    thenActions: ActionSequence[];
    elseActions?: ActionSequence[];
}
export interface TriggerCondition {
    type: 'event' | 'time' | 'state' | 'composite';
    conditions: ConditionExpression[];
    operator: 'AND' | 'OR';
}
export interface ConditionExpression {
    field: string;
    operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'matches';
    value: unknown;
}
export interface CollaborativePattern extends DetectedPattern {
    type: 'collaborative';
    participants: UserId[];
    workflow: CollaborativeWorkflow;
    handoffs: HandoffPoint[];
}
export interface CollaborativeWorkflow {
    steps: CollaborativeStep[];
    avgDuration: number;
    successRate: number;
}
export interface CollaborativeStep {
    actor: UserId | 'any';
    action: ActionType;
    order: number;
    waitForPrevious: boolean;
    avgDuration?: number;
}
export interface HandoffPoint {
    fromUser: UserId;
    toUser: UserId;
    afterStep: number;
    avgHandoffTime: number;
    metadata?: Record<string, unknown>;
}
export interface PatternDetectionConfig {
    minFrequency: number;
    minConfidence: number;
    windowDays: number;
    enabledPatternTypes: PatternType[];
}
export interface DetectionResult {
    patterns: DetectedPattern[];
    analyzed: {
        behaviorCount: number;
        timeRange: {
            start: Date;
            end: Date;
        };
        patternsFound: number;
    };
    suggestions: AutomationSuggestion[];
}
export type AutomationId = string & {
    readonly __brand: 'AutomationId';
};
export interface AutomationSuggestion {
    id: string;
    patternId: PatternId;
    userId: UserId;
    name: string;
    description: string;
    category: 'time_saving' | 'quality' | 'consistency' | 'collaboration';
    confidence: number;
    expectedValue: any;
    workflowDefinition: any;
    riskLevel: 'low' | 'medium' | 'high';
    status: 'suggested' | 'accepted' | 'rejected' | 'active' | 'paused';
    suggestedAt: Date;
    acceptedAt?: Date;
    metadata?: Record<string, unknown>;
}
export interface ExpectedValue {
    timeSaved: number;
    frequency: number;
    totalTimeSaved: number;
    errorReduction?: number;
    consistency?: number;
}
export interface Sequence {
    steps: ActionType[];
    count: number;
    avgDuration: number;
    consistency: number;
    description: string;
    timeSaved?: number;
}
export interface TimeGroup {
    time: string;
    day?: number;
    behaviors: UserBehavior[];
    count: number;
}
export interface DailyPattern {
    time: string;
    days: number[];
    actions: ActionType[];
    count: number;
    consistency: number;
    description: string;
}
export interface WeeklyPattern {
    day: number;
    time: string;
    actions: ActionType[];
    count: number;
    consistency: number;
    description: string;
}
export interface MLPatternDetector {
    detect(behaviors: UserBehavior[]): Promise<DetectedPattern[]>;
    train(behaviors: UserBehavior[], patterns: DetectedPattern[]): Promise<void>;
    predict(behavior: UserBehavior): Promise<PatternPrediction>;
}
export interface PatternPrediction {
    nextAction: ActionType;
    confidence: number;
    alternatives: Array<{
        action: ActionType;
        confidence: number;
    }>;
    reasoning?: string;
}
export interface PatternLibrary {
    getPattern(id: PatternId): Promise<DetectedPattern | null>;
    savePattern(pattern: DetectedPattern): Promise<void>;
    getUserPatterns(userId: UserId): Promise<DetectedPattern[]>;
    searchPatterns(query: PatternQuery): Promise<DetectedPattern[]>;
}
export interface PatternQuery {
    userId?: UserId;
    type?: PatternType;
    minConfidence?: number;
    minFrequency?: number;
    tags?: string[];
    dateRange?: {
        start: Date;
        end: Date;
    };
}
//# sourceMappingURL=pattern.types.d.ts.map