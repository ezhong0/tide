/**
 * Calendar domain types for comprehensive calendar and scheduling functionality
 */
import { UUID, Timestamp, Email, UserId, EventId, TimeSlot, TimeRange } from '../base.types';
export type CalendarProvider = 'google' | 'outlook' | 'apple' | 'caldav';
export type EventType = 'meeting' | 'appointment' | 'task' | 'reminder' | 'focus' | 'out-of-office';
export type EventStatus = 'tentative' | 'confirmed' | 'cancelled';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ResponseStatus = 'accepted' | 'declined' | 'tentative' | 'pending';
export type CalendarVisibility = 'public' | 'private' | 'confidential';
export interface CalendarEvent {
    eventId: EventId;
    userId: UserId;
    calendarId: UUID;
    provider: CalendarProvider;
    title: string;
    description?: string;
    location?: EventLocation;
    type: EventType;
    status: EventStatus;
    visibility: CalendarVisibility;
    startTime: Timestamp;
    endTime: Timestamp;
    timezone: string;
    isAllDay: boolean;
    organizer: Participant;
    attendees?: Participant[];
    optionalAttendees?: Participant[];
    recurrence?: RecurrenceRule;
    recurringEventId?: EventId;
    reminders?: Reminder[];
    conferenceData?: ConferenceData;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdBy: UserId;
    color?: string;
    categories?: string[];
    isPrivate: boolean;
    isBusy: boolean;
    isRecurring: boolean;
    isCancelled: boolean;
    importance?: EventImportance;
    preparationTime?: number;
    travelTime?: number;
    followUpRequired?: boolean;
    relatedDocuments?: string[];
}
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
export interface Participant {
    userId?: UserId;
    email: Email;
    name: string;
    role: 'organizer' | 'required' | 'optional' | 'resource';
    responseStatus: ResponseStatus;
    responseTime?: Timestamp;
    comment?: string;
    isResource?: boolean;
}
export interface RecurrenceRule {
    frequency: RecurrenceFrequency;
    interval: number;
    count?: number;
    until?: Timestamp;
    byDay?: DayOfWeek[];
    byMonthDay?: number[];
    byMonth?: number[];
    bySetPos?: number[];
    exceptions?: Timestamp[];
    modifications?: EventModification[];
}
export type DayOfWeek = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';
export interface EventModification {
    date: Timestamp;
    changes: Partial<CalendarEvent>;
}
export interface Reminder {
    type: 'email' | 'popup' | 'sms' | 'push';
    minutesBefore: number;
    message?: string;
}
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
export interface EventImportance {
    score: number;
    factors: ImportanceFactor[];
}
export interface ImportanceFactor {
    type: 'attendees' | 'organizer' | 'title' | 'recurring' | 'duration';
    weight: number;
    reason: string;
}
export interface AvailabilityParams {
    userId: UserId;
    timeRange: TimeRange;
    duration: number;
    constraints?: SchedulingConstraints;
    excludeEvents?: EventId[];
    includeBufferTime?: boolean;
    workingHoursOnly?: boolean;
}
export interface SchedulingConstraints {
    earliestTime?: string;
    latestTime?: string;
    preferredTimes?: TimePreference[];
    avoidDays?: DayOfWeek[];
    bufferBefore?: number;
    bufferAfter?: number;
    maxConsecutiveHours?: number;
    preferredLocation?: 'remote' | 'office' | 'any';
}
export interface TimePreference {
    start: string;
    end: string;
    weight: number;
}
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
    score: number;
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
    responseTime?: number;
}
export interface ResourceAvailability {
    resourceId: UUID;
    name: string;
    available: boolean;
    capacity?: number;
    equipment?: string[];
}
export interface CalendarHealth {
    userId: UserId;
    period: TimeRange;
    totalMeetings: number;
    totalHours: number;
    averageMeetingLength: number;
    backToBackCount: number;
    focusTimeHours: number;
    meetingTimeHours: number;
    bufferTimeHours: number;
    overallScore: number;
    workLifeBalance: number;
    meetingEfficiency: number;
    focusTime: number;
    recommendations: CalendarRecommendation[];
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
export interface WorkingHours {
    userId: UserId;
    timezone: string;
    schedule: DaySchedule[];
    exceptions?: DateException[];
}
export interface DaySchedule {
    day: DayOfWeek;
    isWorkingDay: boolean;
    start?: string;
    end?: string;
    breaks?: TimeRange[];
}
export interface DateException {
    date: Timestamp;
    isWorkingDay: boolean;
    reason?: string;
}
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
//# sourceMappingURL=calendar.types.d.ts.map