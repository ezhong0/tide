import type { UserId } from '@tide/types';

export interface DailySnapshot {
  id: string;
  userId: UserId;
  snapshotDate: Date;
  priorityItems: PriorityItem[];
  pendingDecisions: PendingDecision[];
  meetingPreviews: MeetingPreview[];
  predictions: Prediction[];
  generatedAt: Date;
}

export interface PriorityItem {
  id: string;
  type: 'email' | 'task' | 'meeting' | 'decision';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  importance: number; // 0-1
  deadline?: Date;
  source: string;
  metadata: Record<string, unknown>;
}

export interface PendingDecision {
  id: string;
  title: string;
  description: string;
  context: DecisionContext;
  recommendation?: AIRecommendation;
  urgency: 'low' | 'medium' | 'high';
  deadline?: Date;
  requester?: {
    name: string;
    email: string;
  };
}

export interface DecisionContext {
  background: string;
  stakeholders: string[];
  impact: 'low' | 'medium' | 'high';
  historicalContext?: string;
  relatedDecisions?: string[];
  financialImplications?: {
    amount: number;
    currency: string;
  };
}

export interface AIRecommendation {
  recommendation: 'approve' | 'decline' | 'discuss' | 'defer';
  reasoning: string;
  confidence: number;
  alternatives?: string[];
  risks?: string[];
}

export interface MeetingPreview {
  id: string;
  eventId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  attendees: Array<{
    name: string;
    email: string;
  }>;
  briefGenerated: boolean;
  briefSummary?: string;
  preparation?: string[];
}

export interface Prediction {
  id: string;
  action: string;
  description: string;
  reasoning: string;
  confidence: number;
  estimatedTimeSaved: number; // minutes
  preview?: string;
  canExecuteAutonomously: boolean;
  basedOnPattern: {
    type: 'temporal' | 'sequential' | 'conditional';
    frequency: number;
    observationPeriod: number;
  };
}

export interface ActionSuggestion {
  id: string;
  userId: UserId;
  suggestionType: 'email_response' | 'schedule_meeting' | 'delegate_task' | 'decline_meeting' | 'archive_email';
  context: Record<string, unknown>;
  preview: string;
  confidence: number;
  requiresApproval: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  createdAt: Date;
}

export interface SnapshotAggregatorOptions {
  includeEmails?: boolean;
  includeCalendar?: boolean;
  includeTasks?: boolean;
  includeWorkflows?: boolean;
  lookAheadDays?: number;
}
