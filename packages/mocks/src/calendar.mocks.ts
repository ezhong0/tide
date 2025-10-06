/**
 * Mock calendar event data for testing and development
 */

import type {
  CalendarEventRow,
  Attendee,
  Organizer,
  ConferenceData,
  AISuggestions,
} from '@tide/shared-types';
import { createCalendarEventId } from '@tide/shared-types';

import { mockUser1 } from './users.mocks.js';

// ============================================================================
// Mock Attendees
// ============================================================================

export const mockAttendee1: Attendee = {
  email: 'client@acmecorp.com',
  name: 'John Smith',
  response_status: 'accepted',
  optional: false,
};

export const mockAttendee2: Attendee = {
  email: 'colleague@example.com',
  name: 'Sarah Johnson',
  response_status: 'tentative',
  optional: true,
};

// ============================================================================
// Mock Organizer
// ============================================================================

export const mockOrganizer: Organizer = {
  email: 'john.doe@example.com',
  name: 'John Doe',
  self: true,
};

// ============================================================================
// Mock Conference Data
// ============================================================================

export const mockConferenceData: ConferenceData = {
  type: 'zoom',
  url: 'https://zoom.us/j/123456789',
  id: '123456789',
  pin: '987654',
};

// ============================================================================
// Mock AI Suggestions
// ============================================================================

export const mockAISuggestions: AISuggestions = {
  suggested_prep: [
    'Review Q1 project proposal document',
    'Prepare budget estimates',
    'Check previous meeting notes',
  ],
  related_emails: ['770e8400-e29b-41d4-a716-446655440001'],
  suggested_action_items: [
    'Share updated timeline',
    'Get approval on budget',
    'Schedule follow-up',
  ],
  meeting_summary: 'Discussion of Q1 project proposal and budget allocation.',
};

// ============================================================================
// Mock Calendar Events
// ============================================================================

export const mockCalendarEvent1: CalendarEventRow = {
  id: createCalendarEventId('880e8400-e29b-41d4-a716-446655440001'),
  userId: mockUser1.id,
  externalId: 'event_ext_001',
  title: 'Q1 Project Kickoff Meeting',
  description: 'Discuss project scope, timeline, and team assignments.',
  location: 'Conference Room A',
  start: new Date('2024-01-23T14:00:00Z'),
  end: new Date('2024-01-23T15:00:00Z'),
  isAllDay: false,
  timezone: 'America/Los_Angeles',
  attendees: [mockAttendee1, mockAttendee2],
  organizer: mockOrganizer,
  status: 'confirmed',
  responseStatus: 'accepted',
  meetingUrl: mockConferenceData.url,
  conferenceData: mockConferenceData,
  aiSuggestions: mockAISuggestions,
  createdAt: new Date('2024-01-20T10:30:00Z'),
  updatedAt: new Date('2024-01-20T10:30:00Z'),
};

export const mockCalendarEvent2: CalendarEventRow = {
  id: createCalendarEventId('880e8400-e29b-41d4-a716-446655440002'),
  userId: mockUser1.id,
  externalId: 'event_ext_002',
  title: 'Team Standup',
  description: 'Daily team sync',
  start: new Date('2024-01-22T10:00:00Z'),
  end: new Date('2024-01-22T10:15:00Z'),
  isAllDay: false,
  timezone: 'America/Los_Angeles',
  attendees: [
    {
      email: 'team@example.com',
      name: 'Team',
      response_status: 'accepted',
      optional: false,
    },
  ],
  organizer: mockOrganizer,
  status: 'confirmed',
  responseStatus: 'accepted',
  meetingUrl: 'https://meet.google.com/abc-defg-hij',
  conferenceData: {
    type: 'meet',
    url: 'https://meet.google.com/abc-defg-hij',
  },
  recurrence: {
    rule: 'RRULE:FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR',
  },
  createdAt: new Date('2024-01-15T09:00:00Z'),
  updatedAt: new Date('2024-01-15T09:00:00Z'),
};

export const mockCalendarEvent3: CalendarEventRow = {
  id: createCalendarEventId('880e8400-e29b-41d4-a716-446655440003'),
  userId: mockUser1.id,
  externalId: 'event_ext_003',
  title: 'Focus Time',
  description: 'Deep work session',
  start: new Date('2024-01-22T13:00:00Z'),
  end: new Date('2024-01-22T15:00:00Z'),
  isAllDay: false,
  timezone: 'America/Los_Angeles',
  attendees: [],
  organizer: mockOrganizer,
  status: 'confirmed',
  responseStatus: 'accepted',
  createdAt: new Date('2024-01-20T08:00:00Z'),
  updatedAt: new Date('2024-01-20T08:00:00Z'),
};

export const mockCalendarEvents = [mockCalendarEvent1, mockCalendarEvent2, mockCalendarEvent3];
