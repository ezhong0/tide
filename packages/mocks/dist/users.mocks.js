/**
 * Mock user data for testing and development
 */
import { createUserId } from '@tide/shared-types';
// ============================================================================
// Mock Credentials
// ============================================================================
export const mockEncryptedCredentials = {
    accessToken: 'mock_encrypted_access_token',
    refreshToken: 'mock_encrypted_refresh_token',
    expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour from now
    scope: ['email', 'calendar'],
};
// ============================================================================
// Mock Notification Preferences
// ============================================================================
export const mockNotificationPreferences = {
    interruptions: {
        vip_emails: true,
        meeting_reminders: true,
        urgent_deadlines: true,
        tracked_responses: true,
    },
    batch_interval: 30,
    quiet_hours: {
        enabled: true,
        start: '22:00',
        end: '08:00',
    },
};
// ============================================================================
// Mock VIP Contacts
// ============================================================================
export const mockVipContacts = [
    {
        email: 'boss@company.com',
        name: 'Sarah Johnson',
        relationship: 'boss',
    },
    {
        email: 'client@acmecorp.com',
        name: 'John Smith',
        relationship: 'client',
    },
];
// ============================================================================
// Mock Follow-up Defaults
// ============================================================================
export const mockFollowUpDefaults = {
    default_delay_hours: 48,
    auto_follow_up_enabled: true,
    follow_up_conditions: {
        no_response_to_important: true,
        meeting_not_accepted: true,
    },
};
// ============================================================================
// Mock Users
// ============================================================================
export const mockUser1 = {
    id: createUserId('550e8400-e29b-41d4-a716-446655440001'),
    email: 'john.doe@example.com',
    name: 'John Doe',
    emailProvider: 'gmail',
    emailCredentials: mockEncryptedCredentials,
    calendarProvider: 'google',
    calendarCredentials: mockEncryptedCredentials,
    phoneNumber: '+1-555-123-4567',
    timezone: 'America/Los_Angeles',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    lastActiveAt: new Date('2024-01-20T15:30:00Z'),
};
export const mockUser2 = {
    id: createUserId('550e8400-e29b-41d4-a716-446655440002'),
    email: 'jane.smith@company.com',
    name: 'Jane Smith',
    emailProvider: 'outlook',
    emailCredentials: mockEncryptedCredentials,
    calendarProvider: 'outlook',
    calendarCredentials: mockEncryptedCredentials,
    timezone: 'America/New_York',
    createdAt: new Date('2024-01-10T09:00:00Z'),
    lastActiveAt: new Date('2024-01-21T11:45:00Z'),
};
export const mockUsers = [mockUser1, mockUser2];
// ============================================================================
// Mock User Preferences
// ============================================================================
export const mockUserPreferences1 = {
    id: createUserId('660e8400-e29b-41d4-a716-446655440001'),
    userId: mockUser1.id,
    defaultTone: 'professional',
    emailSignature: 'Best regards,\nJohn Doe\nSenior Product Manager',
    signOffPhrase: 'Best,',
    autoAcceptMeetings: false,
    autoAcceptMeetingsFrom: 'vip',
    autoRespondSimple: true,
    autoRespondConfidence: 'high',
    notificationPreferences: mockNotificationPreferences,
    vipContacts: mockVipContacts,
    followUpDefaults: mockFollowUpDefaults,
    createdAt: new Date('2024-01-15T10:05:00Z'),
    updatedAt: new Date('2024-01-20T14:00:00Z'),
};
export const mockUserPreferences2 = {
    id: createUserId('660e8400-e29b-41d4-a716-446655440002'),
    userId: mockUser2.id,
    defaultTone: 'friendly',
    emailSignature: 'Cheers,\nJane',
    signOffPhrase: 'Cheers,',
    autoAcceptMeetings: true,
    autoAcceptMeetingsFrom: 'all',
    autoRespondSimple: false,
    autoRespondConfidence: 'medium',
    notificationPreferences: mockNotificationPreferences,
    vipContacts: [],
    followUpDefaults: mockFollowUpDefaults,
    createdAt: new Date('2024-01-10T09:05:00Z'),
    updatedAt: new Date('2024-01-18T16:30:00Z'),
};
export const mockUserPreferences = [mockUserPreferences1, mockUserPreferences2];
//# sourceMappingURL=users.mocks.js.map