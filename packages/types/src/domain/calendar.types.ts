/**
 * Calendar domain types for comprehensive calendar and scheduling functionality
 */

import {
  UUID, Timestamp, Email, UserId, EventId, TimeSlot, TimeRange
} from '../base.types';

// Calendar provider types
export type CalendarProvider = 'google' | 'outlook' | 'apple' | 'caldav';

// Event types
export type EventType = 'meeting' | 'appointment' | 'task' | 'reminder' | 'focus' | 'out-of-office';

// Event status
export type EventStatus = 'tentative' | 'confirmed' | 'cancelled';

// Recurrence types
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

// Meeting response status
export type ResponseStatus = 'accepted' | 'declined' | 'tentative' | 'pending';

// Calendar visibility
export type CalendarVisibility = 'public' | 'private' | 'confidential';

// Main calendar event entity
export interface CalendarEvent {
  // Identifiers
  eventId: EventId;
  userId: UserId;
  calendarId: UUID;
  provider: CalendarProvider;

  // Event details
  title: string;
  description?: string;
  location?: EventLocation;
  type: EventType;
  status: EventStatus;
  visibility: CalendarVisibility;

  // Time information
  startTime: Timestamp;
  endTime: Timestamp;
  timezone: string;
  isAllDay: boolean;

  // Participants
  organizer: Participant;
  attendees?: Participant[];
  optionalAttendees?: Participant[];

  // Recurrence
  recurrence?: RecurrenceRule;
  recurringEventId?: EventId;  // Parent event if this is an instance

  // Reminders
  reminders?: Reminder[];

  // Conference details
  conferenceData?: ConferenceData;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: UserId;
  color?: string;
  categories?: string[];

  // Flags
  isPrivate: boolean;
  isBusy: boolean;
  isRecurring: boolean;
  isCancelled: boolean;

  // AI-enhanced fields
  importance?: EventImportance;
  preparationTime?: number;  // Minutes needed before event
  travelTime?: number;       // Minutes for travel
  followUpRequired?: boolean;
  relatedDocuments?: string[];
}

// Event location
export interface EventLocation {
  type: 'physical' | 'virtual' | 'hybrid';
  name: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  room?: string;
  floor?: string;
  meetingUrl?: string;
}

// Participant information
export interface Participant {
  userId?: UserId;
  email: Email;
  name: string;
  role: 'organizer' | 'required' | 'optional' | 'resource';
  responseStatus: ResponseStatus;
  responseTime?: Timestamp;
  comment?: string;
  isResource?: boolean;  // Room, equipment, etc.
}

// Recurrence rule
export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number;  // Every N days/weeks/months/years
  count?: number;    // Number of occurrences
  until?: Timestamp; // End date
  byDay?: DayOfWeek[];
  byMonthDay?: number[];
  byMonth?: number[];
  bySetPos?: number[];
  exceptions?: Timestamp[];  // Dates to skip
  modifications?: EventModification[];  // Changed instances
}

export type DayOfWeek = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

export interface EventModification {
  date: Timestamp;
  changes: Partial<CalendarEvent>;
}

// Reminder configuration
export interface Reminder {
  type: 'email' | 'popup' | 'sms' | 'push';
  minutesBefore: number;
  message?: string;
}

// Conference/video call data
export interface ConferenceData {
  type: 'zoom' | 'teams' | 'meet' | 'webex' | 'other';
  url: string;
  meetingId?: string;
  passcode?: string;
  phoneNumbers?: PhoneAccess[];
  notes?: string;
}

export interface PhoneAccess {
  number: string;
  region: string;
  pin?: string;
}

// Event importance analysis
export interface EventImportance {
  score: number;  // 0-100
  factors: ImportanceFactor[];
}

export interface ImportanceFactor {
  type: 'attendees' | 'organizer' | 'title' | 'recurring' | 'duration';
  weight: number;
  reason: string;
}

// Availability checking parameters
export interface AvailabilityParams {
  userId: UserId;
  timeRange: TimeRange;
  duration: number;  // Minutes
  constraints?: SchedulingConstraints;
  excludeEvents?: EventId[];
  includeBufferTime?: boolean;
  workingHoursOnly?: boolean;
}

// Scheduling constraints
export interface SchedulingConstraints {
  earliestTime?: string;  // "09:00"
  latestTime?: string;    // "17:00"
  preferredTimes?: TimePreference[];
  avoidDays?: DayOfWeek[];
  bufferBefore?: number;  // Minutes
  bufferAfter?: number;   // Minutes
  maxConsecutiveHours?: number;
  preferredLocation?: 'remote' | 'office' | 'any';
}

export interface TimePreference {
  start: string;  // "14:00"
  end: string;    // "16:00"
  weight: number; // 0-1 preference strength
}

// Meeting time finding
export interface MeetingConstraints extends SchedulingConstraints {
  duration: number;
  requiredAttendees: Email[];
  optionalAttendees?: Email[];
  roomRequired?: boolean;
  equipmentRequired?: string[];
  title?: string;
  description?: string;
}

export interface MeetingOption {
  slot: TimeSlot;
  score: number;  // 0-100, higher is better
  conflicts: ConflictInfo[];
  attendeeAvailability: AttendeeAvailability[];
  room?: ResourceAvailability;
}

export interface ConflictInfo {
  attendeeEmail: Email;
  conflictType: 'busy' | 'tentative' | 'out-of-office';
  eventTitle?: string;
}

export interface AttendeeAvailability {
  email: Email;
  available: boolean;
  responseTime?: number;  // Typical response time in hours
}

export interface ResourceAvailability {
  resourceId: UUID;
  name: string;
  available: boolean;
  capacity?: number;
  equipment?: string[];
}

// Calendar health analysis
export interface CalendarHealth {
  userId: UserId;
  period: TimeRange;

  // Meeting statistics
  totalMeetings: number;
  totalHours: number;
  averageMeetingLength: number;
  backToBackCount: number;

  // Time distribution
  focusTimeHours: number;
  meetingTimeHours: number;
  bufferTimeHours: number;

  // Health scores (0-100)
  overallScore: number;
  workLifeBalance: number;
  meetingEfficiency: number;
  focusTime: number;

  // Recommendations
  recommendations: CalendarRecommendation[];

  // Patterns
  busiestDays: DayOfWeek[];
  busiestHours: number[];
  frequentAttendees: Participant[];
  longestMeetings: CalendarEvent[];
}

export interface CalendarRecommendation {
  type: 'reduce-meetings' | 'add-focus-time' | 'add-buffer' | 'delegate' | 'batch-meetings';
  priority: 'low' | 'medium' | 'high';
  description: string;
  impact: string;
  actionable: boolean;
  suggestedAction?: string;
}

// Calendar sync status
export interface CalendarSyncStatus {
  userId: UserId;
  provider: CalendarProvider;
  lastSync: Timestamp;
  nextSync: Timestamp;
  status: 'idle' | 'syncing' | 'error';
  totalEvents: number;
  syncedEvents: number;
  error?: string;
}

// Working hours configuration
export interface WorkingHours {
  userId: UserId;
  timezone: string;
  schedule: DaySchedule[];
  exceptions?: DateException[];
}

export interface DaySchedule {
  day: DayOfWeek;
  isWorkingDay: boolean;
  start?: string;  // "09:00"
  end?: string;    // "17:00"
  breaks?: TimeRange[];
}

export interface DateException {
  date: Timestamp;
  isWorkingDay: boolean;
  reason?: string;
}

// Calendar preferences
export interface CalendarPreferences {
  userId: UserId;
  defaultCalendarId: UUID;
  defaultMeetingDuration: number;
  defaultReminders: Reminder[];
  workingHours: WorkingHours;
  autoDeclineConflicts: boolean;
  showDeclinedEvents: boolean;
  weekStartsOn: DayOfWeek;
  timeZone: string;
  preferredMeetingTypes: EventType[];
}