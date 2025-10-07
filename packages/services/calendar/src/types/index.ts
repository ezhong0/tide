import type { UserId } from '@tide/types';

/**
 * Calendar provider types
 */
export type CalendarProvider = 'google' | 'exchange' | 'caldav';

/**
 * Meeting status
 */
export type MeetingStatus = 'confirmed' | 'tentative' | 'cancelled';

/**
 * Meeting type
 */
export type MeetingType =
  | 'one-on-one'
  | 'team'
  | 'client'
  | 'internal'
  | 'external'
  | 'focus'
  | 'break';

/**
 * Calendar event interface
 */
export interface CalendarEvent {
  id: string;
  userId: UserId;
  provider: CalendarProvider;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  attendees: Attendee[];
  organizer?: Attendee;
  status: MeetingStatus;
  isRecurring: boolean;
  recurrenceRule?: string;
  reminders?: number[]; // minutes before event
  conferenceLink?: string;
  isAllDay: boolean;
}

/**
 * Attendee interface
 */
export interface Attendee {
  email: string;
  name?: string;
  responseStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  isOrganizer?: boolean;
  isOptional?: boolean;
}

/**
 * Time slot interface
 */
export interface TimeSlot {
  start: Date;
  end: Date;
  score?: number;
  factors?: SlotScoreFactors;
}

/**
 * Slot score factors
 */
export interface SlotScoreFactors {
  timeOfDay: number;
  dayOfWeek: number;
  proximity: number;
  preparation: number;
  focus: number;
  travel: number;
}

/**
 * Meeting request interface
 */
export interface MeetingRequest {
  userId: UserId;
  title: string;
  description?: string;
  duration: number; // minutes
  participants: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  preferences?: MeetingPreferences;
  autoSchedule?: boolean;
}

/**
 * Meeting preferences
 */
export interface MeetingPreferences {
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'any';
  dayOfWeek?: number[]; // 0-6, Sunday-Saturday
  location?: string;
  conferenceRequired?: boolean;
  bufferBefore?: number; // minutes
  bufferAfter?: number; // minutes
}

/**
 * Schedule result interface
 */
export interface ScheduleResult {
  success: boolean;
  event?: CalendarEvent;
  suggestions?: TimeSlot[];
  reasoning?: string;
  conflicts?: CalendarEvent[];
}

/**
 * Calendar conflict interface
 */
export interface CalendarConflict {
  slot: TimeSlot;
  events: CalendarEvent[];
  severity: 'low' | 'medium' | 'high';
}

/**
 * Conflict resolution interface
 */
export interface ConflictResolution {
  keep: CalendarEvent;
  reschedule: Array<{
    event: CalendarEvent;
    alternatives: TimeSlot[];
    autoReschedule: boolean;
  }>;
  explanation: string;
}

/**
 * Meeting brief interface
 */
export interface MeetingBrief {
  meeting: CalendarEvent;
  brief: string;
  agenda?: string[];
  talkingPoints?: TalkingPoint[];
  participants: ParticipantInfo[];
  backgroundInfo?: {
    company?: string;
    news?: string[];
    previousInteractions?: CalendarEvent[];
  };
  suggestedQuestions?: string[];
  possibleObjections?: string[];
  successMetrics?: string[];
}

/**
 * Talking point interface
 */
export interface TalkingPoint {
  topic: string;
  points: any[];
  timing: 'opening' | 'middle' | 'closing' | 'as_needed' | 'throughout';
  importance: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Participant info interface
 */
export interface ParticipantInfo {
  attendee: Attendee;
  profile?: {
    name: string;
    title?: string;
    company?: string;
  };
  interactions?: number;
  importance: number;
  lastContact?: Date;
  relationshipStrength?: number;
  communicationStyle?: string;
  topics?: string[];
}

/**
 * Schedule optimization plan
 */
export interface OptimizationPlan {
  userId: UserId;
  week: Date;
  opportunities: Opportunity[];
  actions: OptimizationAction[];
  estimatedTimeRecovered: number; // minutes
  estimatedFocusTimeCreated: number; // minutes
}

/**
 * Optimization opportunity
 */
export interface Opportunity {
  type:
    | 'consolidate_meetings'
    | 'skip_meeting'
    | 'reschedule_meeting'
    | 'create_focus_block'
    | 'reduce_meeting_time';
  impact: 'low' | 'medium' | 'high';
  timeRecovered?: number; // minutes
  description: string;
  meeting?: CalendarEvent;
  timeSlot?: TimeSlot;
  betterTime?: TimeSlot;
}

/**
 * Optimization action
 */
export interface OptimizationAction {
  type: 'reschedule' | 'decline' | 'batch' | 'protect' | 'shorten';
  meeting?: CalendarEvent;
  newTime?: TimeSlot;
  reasoning: string;
}

/**
 * Schedule analysis
 */
export interface ScheduleAnalysis {
  userId: UserId;
  period: {
    start: Date;
    end: Date;
  };
  totalMeetings: number;
  totalMeetingTime: number; // minutes
  fragmentedTime: number; // minutes
  focusTime: number; // minutes
  meetings: MeetingAnalysis[];
  utilization: number; // 0-1
  balance: {
    internal: number;
    external: number;
    oneOnOne: number;
    group: number;
  };
}

/**
 * Meeting analysis
 */
export interface MeetingAnalysis {
  event: CalendarEvent;
  value: number; // 0-1 score
  required: boolean;
  timing: {
    score: number;
    optimal: boolean;
    conflicts: boolean;
  };
  preparation: {
    adequate: boolean;
    minutes: number;
  };
}

/**
 * Availability interface
 */
export interface Availability {
  userId: UserId;
  dateRange: {
    start: Date;
    end: Date;
  };
  slots: TimeSlot[];
  busySlots: TimeSlot[];
}

/**
 * OAuth tokens interface
 */
export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scope: string[];
}

/**
 * Calendar provider interface
 */
export interface ICalendarProvider {
  initialize(userId: UserId, tokens: OAuthTokens): Promise<void>;
  fetchEvents(start: Date, end: Date): Promise<CalendarEvent[]>;
  createEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent>;
  updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent>;
  deleteEvent(eventId: string): Promise<void>;
  getAvailability(start: Date, end: Date): Promise<Availability>;
}
