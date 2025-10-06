/**
 * Calendar Service Contract
 * Handles all calendar operations including events, scheduling, and availability
 *
 * Performance Requirements:
 * - Check availability: <50ms for 30-day window
 * - Create event: <200ms
 * - Find meeting times: <300ms for 5 participants
 */

import { Result, UUID, UserId, EventId, Email, TimeSlot } from '@tide/types';
import {
  CalendarEvent, AvailabilityParams, MeetingConstraints, MeetingOption,
  CalendarHealth, CalendarSyncStatus, CalendarPreferences, WorkingHours,
  Participant, ResponseStatus, Reminder, ConferenceData, RecurrenceRule
} from '@tide/types';

export interface ICalendarService {
  /**
   * Check user availability using functional approach
   * @param params Availability parameters including time range and constraints
   * @returns Array of available time slots
   * @performance <50ms for 30-day window with caching
   */
  checkAvailability(params: AvailabilityParams): Promise<Result<TimeSlot[]>>;

  /**
   * Find overlapping availability for multiple participants
   * @param participants List of participant emails
   * @param constraints Meeting constraints and preferences
   * @returns Array of meeting options ranked by suitability
   * @performance <300ms for 5 participants
   */
  findMeetingTimes(
    participants: Email[],
    constraints: MeetingConstraints
  ): Promise<Result<MeetingOption[]>>;

  /**
   * Create a calendar event with conflict detection
   * @param event Event details
   * @returns EventId of created event
   * @performance <200ms including conflict check
   */
  createEvent(event: Omit<CalendarEvent, 'eventId' | 'createdAt' | 'updatedAt'>): Promise<Result<EventId>>;

  /**
   * Update an existing calendar event
   * @param eventId Event to update
   * @param updates Partial event data to update
   * @returns Updated calendar event
   * @performance <200ms
   */
  updateEvent(
    eventId: EventId,
    updates: Partial<CalendarEvent>
  ): Promise<Result<CalendarEvent>>;

  /**
   * Cancel a calendar event
   * @param eventId Event to cancel
   * @param reason Optional cancellation reason
   * @param notifyAttendees Whether to notify attendees
   * @returns Success status
   * @performance <100ms
   */
  cancelEvent(
    eventId: EventId,
    reason?: string,
    notifyAttendees?: boolean
  ): Promise<Result<void>>;

  /**
   * Delete a calendar event
   * @param eventId Event to delete
   * @param permanent Whether to permanently delete
   * @returns Success status
   * @performance <100ms
   */
  deleteEvent(eventId: EventId, permanent?: boolean): Promise<Result<void>>;

  /**
   * Get a specific calendar event
   * @param eventId Event identifier
   * @returns Calendar event details
   * @performance <50ms cached, <200ms uncached
   */
  getEvent(eventId: EventId): Promise<Result<CalendarEvent>>;

  /**
   * Get events for a time range
   * @param userId User identifier
   * @param startTime Start of time range
   * @param endTime End of time range
   * @returns Array of calendar events
   * @performance <100ms cached, <300ms uncached
   */
  getEvents(
    userId: UserId,
    startTime: number,
    endTime: number
  ): Promise<Result<CalendarEvent[]>>;

  /**
   * Add participant to an event
   * @param eventId Event to add participant to
   * @param participant Participant details
   * @param sendInvite Whether to send invitation
   * @returns Success status
   * @performance <200ms
   */
  addParticipant(
    eventId: EventId,
    participant: Participant,
    sendInvite?: boolean
  ): Promise<Result<void>>;

  /**
   * Remove participant from an event
   * @param eventId Event to remove participant from
   * @param participantEmail Email of participant to remove
   * @param reason Optional removal reason
   * @returns Success status
   * @performance <200ms
   */
  removeParticipant(
    eventId: EventId,
    participantEmail: Email,
    reason?: string
  ): Promise<Result<void>>;

  /**
   * Update participant response (accept/decline/tentative)
   * @param eventId Event identifier
   * @param participantEmail Participant's email
   * @param response Response status
   * @param comment Optional response comment
   * @returns Success status
   * @performance <100ms
   */
  updateParticipantResponse(
    eventId: EventId,
    participantEmail: Email,
    response: ResponseStatus,
    comment?: string
  ): Promise<Result<void>>;

  /**
   * Add or update conference/video call details
   * @param eventId Event to add conference to
   * @param conferenceData Conference details
   * @returns Success status
   * @performance <200ms
   */
  setConferenceData(
    eventId: EventId,
    conferenceData: ConferenceData
  ): Promise<Result<void>>;

  /**
   * Set or update event reminders
   * @param eventId Event to set reminders for
   * @param reminders Array of reminder configurations
   * @returns Success status
   * @performance <100ms
   */
  setReminders(
    eventId: EventId,
    reminders: Reminder[]
  ): Promise<Result<void>>;

  /**
   * Set recurrence rule for an event
   * @param eventId Event to make recurring
   * @param recurrence Recurrence rule
   * @returns Array of generated event IDs
   * @performance <500ms for generating year of occurrences
   */
  setRecurrence(
    eventId: EventId,
    recurrence: RecurrenceRule
  ): Promise<Result<EventId[]>>;

  /**
   * Modify a single instance of recurring event
   * @param parentEventId Parent recurring event
   * @param instanceDate Date of instance to modify
   * @param modifications Changes to apply
   * @returns Modified instance event ID
   * @performance <200ms
   */
  modifyRecurringInstance(
    parentEventId: EventId,
    instanceDate: number,
    modifications: Partial<CalendarEvent>
  ): Promise<Result<EventId>>;

  /**
   * Block time for focus work
   * @param userId User to block time for
   * @param startTime Start of focus block
   * @param endTime End of focus block
   * @param description Optional description
   * @returns EventId of focus block
   * @performance <200ms
   */
  blockFocusTime(
    userId: UserId,
    startTime: number,
    endTime: number,
    description?: string
  ): Promise<Result<EventId>>;

  /**
   * Set out of office
   * @param userId User setting out of office
   * @param startDate Start date
   * @param endDate End date
   * @param message Optional OOO message
   * @returns EventId of OOO block
   * @performance <200ms
   */
  setOutOfOffice(
    userId: UserId,
    startDate: number,
    endDate: number,
    message?: string
  ): Promise<Result<EventId>>;

  /**
   * Analyze calendar health and suggest optimizations
   * @param userId User to analyze
   * @param startDate Start of analysis period
   * @param endDate End of analysis period
   * @returns Calendar health metrics and recommendations
   * @performance <1000ms for 30-day analysis
   */
  analyzeCalendarHealth(
    userId: UserId,
    startDate: number,
    endDate: number
  ): Promise<Result<CalendarHealth>>;

  /**
   * Get user's calendar preferences
   * @param userId User identifier
   * @returns Calendar preferences
   * @performance <50ms cached
   */
  getPreferences(userId: UserId): Promise<Result<CalendarPreferences>>;

  /**
   * Update user's calendar preferences
   * @param userId User identifier
   * @param preferences Updated preferences
   * @returns Success status
   * @performance <100ms
   */
  updatePreferences(
    userId: UserId,
    preferences: Partial<CalendarPreferences>
  ): Promise<Result<void>>;

  /**
   * Get working hours configuration
   * @param userId User identifier
   * @returns Working hours configuration
   * @performance <50ms cached
   */
  getWorkingHours(userId: UserId): Promise<Result<WorkingHours>>;

  /**
   * Update working hours configuration
   * @param userId User identifier
   * @param workingHours Updated working hours
   * @returns Success status
   * @performance <100ms
   */
  updateWorkingHours(
    userId: UserId,
    workingHours: Partial<WorkingHours>
  ): Promise<Result<void>>;

  /**
   * Sync calendar with provider
   * @param userId User to sync calendar for
   * @param fullSync Whether to perform full sync
   * @returns Sync status
   * @performance Async operation, returns immediately
   */
  syncCalendar(userId: UserId, fullSync?: boolean): Promise<Result<CalendarSyncStatus>>;

  /**
   * Get current sync status
   * @param userId User identifier
   * @returns Current sync status
   * @performance <50ms
   */
  getSyncStatus(userId: UserId): Promise<Result<CalendarSyncStatus>>;

  /**
   * Detect conflicts for a proposed event
   * @param userId User to check conflicts for
   * @param proposedEvent Proposed event details
   * @returns Array of conflicting events
   * @performance <100ms
   */
  detectConflicts(
    userId: UserId,
    proposedEvent: Partial<CalendarEvent>
  ): Promise<Result<CalendarEvent[]>>;

  /**
   * Suggest optimal meeting time using AI
   * @param participants Participant emails
   * @param constraints Meeting constraints
   * @returns Optimal meeting time with reasoning
   * @performance <500ms
   */
  suggestOptimalTime(
    participants: Email[],
    constraints: MeetingConstraints
  ): Promise<Result<OptimalTimeResult>>;

  /**
   * Batch operations for performance
   * @param operations Array of calendar operations
   * @returns Array of results
   * @performance Optimized for bulk operations
   */
  batchOperations(operations: CalendarOperation[]): Promise<Result<BatchResult[]>>;
}

// Supporting types
export interface OptimalTimeResult {
  slot: TimeSlot;
  score: number;
  reasoning: string;
  alternatives: TimeSlot[];
}

export interface CalendarOperation {
  type: 'create' | 'update' | 'delete' | 'cancel';
  data: unknown;
}

export interface BatchResult {
  operation: CalendarOperation;
  success: boolean;
  result?: unknown;
  error?: string;
}