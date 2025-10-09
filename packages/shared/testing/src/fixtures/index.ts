import type {
  User,
  AIIntent,
  Entity,
  Email,
  CalendarEvent,
  Task,
  Workflow,
  Message,
} from '../../../contracts/dist/index.js';

/**
 * Test Fixtures
 * Predefined test data for use in tests
 */

export const TEST_USER: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  profile: {
    firstName: 'Test',
    lastName: 'User',
    timezone: 'America/New_York',
  },
  preferences: {
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
  },
  subscription: {
    plan: 'professional',
    status: 'active',
  },
};

export const TEST_ENTITY: Entity = {
  type: 'date',
  value: '2025-01-15',
  confidence: 0.95,
};

export const TEST_INTENT: AIIntent = {
  type: 'schedule_meeting',
  confidence: 0.9,
  entities: [TEST_ENTITY],
};

export const TEST_EMAIL: Email = {
  id: 'test-email-id',
  from: { name: 'John Doe', email: 'john@example.com' },
  to: [{ name: 'Test User', email: 'test@example.com' }],
  subject: 'Test Email',
  body: 'This is a test email body',
  priority: 'normal',
  labels: ['inbox'],
  timestamp: Date.now(),
};

export const TEST_CALENDAR_EVENT: CalendarEvent = {
  id: 'test-event-id',
  title: 'Test Meeting',
  start: new Date('2025-01-15T10:00:00Z'),
  end: new Date('2025-01-15T11:00:00Z'),
  attendees: [{ name: 'Test User', email: 'test@example.com' }],
  location: 'Virtual',
  meetingType: 'one-on-one',
  hasPrep: false,
};

export const TEST_TASK: Task = {
  id: 'test-task-id',
  title: 'Test Task',
  description: 'This is a test task',
  priority: 'normal',
  status: 'pending',
  assignee: TEST_USER.id,
};

export const TEST_WORKFLOW: Workflow = {
  id: 'test-workflow-id',
  name: 'Test Workflow',
  status: 'running',
  currentStep: 1,
  totalSteps: 3,
  completedSteps: 0,
  progress: 0,
};

export const TEST_MESSAGE: Message = {
  id: 'test-message-id',
  userId: TEST_USER.id,
  conversationId: 'test-conversation-id',
  content: 'Test message content',
  role: 'user',
  intent: TEST_INTENT,
  timestamp: Date.now(),
};
