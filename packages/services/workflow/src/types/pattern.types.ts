import { UserId } from '@tide/types';
import { WorkflowDefinition, WorkflowStepId } from './workflow.types.js';
import { TaskId } from './task.types.js';

/**
 * Pattern Detection Types
 * Type definitions for behavioral pattern recognition and automation
 */

// ============================================================================
// User Behavior Types
// ============================================================================

export type BehaviorId = string & { readonly __brand: 'BehaviorId' };

export type ActionType =
  | 'email_sent'
  | 'email_read'
  | 'email_archived'
  | 'calendar_created'
  | 'calendar_updated'
  | 'task_created'
  | 'task_completed'
  | 'file_uploaded'
  | 'file_shared'
  | 'workflow_executed'
  | 'message_sent'
  | string; // Allow custom actions

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

// ============================================================================
// Pattern Types
// ============================================================================

export type PatternId = string & { readonly __brand: 'PatternId' };

export type PatternType =
  | 'temporal'
  | 'sequential'
  | 'conditional'
  | 'collaborative';

export type PatternStatus = 'detected' | 'confirmed' | 'dismissed' | 'automated';

export interface DetectedPattern {
  id: PatternId;
  userId: UserId;
  type: PatternType;
  subtype?: string;
  patternData: any;
  confidence: number; // 0.0 - 1.0
  frequency: number; // How many times observed
  value: number; // Estimated value/time saved
  description: string;
  suggestion: string;
  status?: PatternStatus;
  discoveredAt?: Date;
  lastObservedAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface PatternMetadata {
  sampleSize: number;
  consistency: number; // 0.0 - 1.0
  timeSaved?: number; // minutes per occurrence
  errorRate?: number;
  [key: string]: unknown;
}

// ============================================================================
// Temporal Pattern Types
// ============================================================================

export interface TemporalPattern extends DetectedPattern {
  type: 'temporal';
  subtype: 'daily' | 'weekly' | 'monthly' | 'yearly';
  trigger: TemporalTrigger;
  actions: ActionSequence[];
}

export interface TemporalTrigger {
  time?: string; // HH:mm format
  dayOfWeek?: number; // 0-6
  dayOfMonth?: number; // 1-31
  month?: number; // 1-12
  days?: number[]; // Multiple days
}

export interface ActionSequence {
  action: ActionType;
  order: number;
  avgDuration?: number; // milliseconds
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Sequential Pattern Types
// ============================================================================

export interface SequentialPattern extends DetectedPattern {
  type: 'sequential';
  steps: PatternStep[];
  avgDuration: number; // milliseconds
  automation: WorkflowDefinition;
}

export interface PatternStep {
  action: ActionType;
  order: number;
  avgTimeSincePrevious?: number; // milliseconds
  conditions?: PatternCondition[];
  metadata?: Record<string, unknown>;
}

export interface PatternCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'matches';
  value: unknown;
}

// ============================================================================
// Conditional Pattern Types
// ============================================================================

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

// ============================================================================
// Collaborative Pattern Types
// ============================================================================

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
  avgHandoffTime: number; // milliseconds
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Pattern Detection Types
// ============================================================================

export interface PatternDetectionConfig {
  minFrequency: number; // Minimum times pattern must occur
  minConfidence: number; // Minimum confidence threshold (0.0 - 1.0)
  windowDays: number; // Days of history to analyze
  enabledPatternTypes: PatternType[];
}

export interface DetectionResult {
  patterns: DetectedPattern[];
  analyzed: {
    behaviorCount: number;
    timeRange: { start: Date; end: Date };
    patternsFound: number;
  };
  suggestions: AutomationSuggestion[];
}

// ============================================================================
// Automation Suggestion Types
// ============================================================================

export type AutomationId = string & { readonly __brand: 'AutomationId' };

export interface AutomationSuggestion {
  id: string;
  patternId: PatternId;
  userId: UserId;

  // Content
  name: string;
  description: string;
  category: 'time_saving' | 'quality' | 'consistency' | 'collaboration';

  // Value
  confidence: number; // 0.0 - 1.0
  expectedValue: any;

  // Automation
  workflowDefinition: any;
  riskLevel: 'low' | 'medium' | 'high';

  // State
  status: 'suggested' | 'accepted' | 'rejected' | 'active' | 'paused';
  suggestedAt: Date;
  acceptedAt?: Date;

  metadata?: Record<string, unknown>;
}

export interface ExpectedValue {
  timeSaved: number; // minutes per occurrence
  frequency: number; // occurrences per week
  totalTimeSaved: number; // minutes per week
  errorReduction?: number; // percentage
  consistency?: number; // 0.0 - 1.0
}

// ============================================================================
// Pattern Analysis Types
// ============================================================================

export interface Sequence {
  steps: ActionType[];
  count: number;
  avgDuration: number;
  consistency: number;
  description: string;
  timeSaved?: number;
}

export interface TimeGroup {
  time: string; // HH:mm
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

// ============================================================================
// ML Pattern Detection Types
// ============================================================================

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

// ============================================================================
// Pattern Library Types
// ============================================================================

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
  dateRange?: { start: Date; end: Date };
}
