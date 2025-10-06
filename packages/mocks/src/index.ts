/**
 * Mock data exports
 *
 * Provides mock data for testing and development
 */

export * from './users.mocks.js';
export * from './emails.mocks.js';
export * from './calendar.mocks.js';

// Re-export all mocks as a single object for convenience
import { mockUsers, mockUserPreferences } from './users.mocks.js';
import { mockEmails } from './emails.mocks.js';
import { mockCalendarEvents } from './calendar.mocks.js';

export const MockData = {
  users: mockUsers,
  userPreferences: mockUserPreferences,
  emails: mockEmails,
  calendarEvents: mockCalendarEvents,
} as const;
