/**
 * E2E Test Setup
 * Global setup for end-to-end tests
 */

import { createSupabase } from '@tide/database';
import { initRedis, closeRedis } from '@tide/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@tide/logger';

export interface E2ETestContext {
  supabase: ReturnType<typeof createSupabase>;
  testUserId: string;
  testUserEmail: string;
  authToken: string;
}

let globalContext: E2ETestContext | null = null;

/**
 * Global setup - runs once before all E2E tests
 */
export async function setup(): Promise<void> {
  logger.info('Starting E2E test suite setup...');

  // Initialize Redis
  await initRedis();

  // Initialize Supabase client
  const supabase = createSupabase(true);

  // Create test user
  const testUserEmail = `test-${Date.now()}@tide-e2e.test`;
  const testPassword = 'test-password-123';

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: testUserEmail,
    password: testPassword,
  });

  if (authError || !authData.user) {
    throw new Error(`Failed to create test user: ${authError?.message}`);
  }

  const testUserId = authData.user.id;

  // Create user profile
  const { error: profileError } = await supabase.from('user_profiles').insert({
    id: testUserId,
    full_name: 'E2E Test User',
    primary_provider: 'google',
    timezone: 'America/Los_Angeles',
  });

  if (profileError) {
    throw new Error(`Failed to create user profile: ${profileError.message}`);
  }

  // Get auth token
  const authToken = authData.session?.access_token;
  if (!authToken) {
    throw new Error('Failed to get auth token');
  }

  globalContext = {
    supabase,
    testUserId,
    testUserEmail,
    authToken: `Bearer ${authToken}`,
  };

  logger.info('E2E test suite setup complete', {
    testUserId,
    testUserEmail,
  });
}

/**
 * Global teardown - runs once after all E2E tests
 */
export async function teardown(): Promise<void> {
  logger.info('Starting E2E test suite teardown...');

  if (globalContext) {
    // Delete test user data
    await globalContext.supabase
      .from('user_profiles')
      .delete()
      .eq('id', globalContext.testUserId);

    // Delete auth user
    await globalContext.supabase.auth.admin.deleteUser(globalContext.testUserId);
  }

  // Close Redis connection
  await closeRedis();

  logger.info('E2E test suite teardown complete');
}

/**
 * Get the global test context
 */
export function getE2EContext(): E2ETestContext {
  if (!globalContext) {
    throw new Error('E2E context not initialized. Did you run setup()?');
  }
  return globalContext;
}

/**
 * Helper to create isolated test data that will be cleaned up
 */
export async function createTestData(
  context: E2ETestContext
): Promise<{
  conversationId: string;
  emailId: string;
  eventId: string;
  taskId: string;
}> {
  const { supabase, testUserId } = context;

  // Create test conversation
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({
      user_id: testUserId,
      title: 'E2E Test Conversation',
    })
    .select()
    .single();

  if (convError || !conversation) {
    throw new Error('Failed to create test conversation');
  }

  // Create test email (mock)
  const { data: email, error: emailError } = await supabase
    .from('email_messages')
    .insert({
      user_id: testUserId,
      provider: 'gmail',
      message_id: `e2e-test-msg-${Date.now()}`,
      from_email: 'test@example.com',
      to_emails: [context.testUserEmail],
      subject: 'E2E Test Email',
      body: 'This is a test email for E2E testing',
      received_at: new Date().toISOString(),
      is_read: false,
      intelligence: {
        importance: 0.8,
        urgency: 'high',
        category: 'test',
        sentiment: 'neutral',
        actionRequired: true,
        confidence: 0.95,
      },
    })
    .select()
    .single();

  if (emailError || !email) {
    throw new Error('Failed to create test email');
  }

  // Create test calendar event
  const { data: event, error: eventError } = await supabase
    .from('calendar_events')
    .insert({
      user_id: testUserId,
      provider: 'google',
      event_id: `e2e-test-event-${Date.now()}`,
      title: 'E2E Test Meeting',
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
      attendees: [context.testUserEmail],
      intelligence: {
        conflicts: [],
        optimizations: [],
        preparation: {
          estimatedPrepTime: 0,
          suggestedMaterials: [],
          relatedEmails: [],
          relatedTasks: [],
        },
      },
    })
    .select()
    .single();

  if (eventError || !event) {
    throw new Error('Failed to create test event');
  }

  // Create test task
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert({
      user_id: testUserId,
      title: 'E2E Test Task',
      description: 'Test task for E2E testing',
      status: 'pending',
      priority: 5,
      structure: {
        subtasks: [],
        dependencies: [],
        estimatedDuration: 3600,
        actualDuration: null,
      },
    })
    .select()
    .single();

  if (taskError || !task) {
    throw new Error('Failed to create test task');
  }

  return {
    conversationId: conversation.id,
    emailId: email.id,
    eventId: event.id,
    taskId: task.id,
  };
}

/**
 * Helper to clean up test data
 */
export async function cleanupTestData(
  context: E2ETestContext,
  testData: {
    conversationId?: string;
    emailId?: string;
    eventId?: string;
    taskId?: string;
  }
): Promise<void> {
  const { supabase } = context;

  if (testData.conversationId) {
    await supabase.from('conversations').delete().eq('id', testData.conversationId);
  }

  if (testData.emailId) {
    await supabase.from('email_messages').delete().eq('id', testData.emailId);
  }

  if (testData.eventId) {
    await supabase.from('calendar_events').delete().eq('id', testData.eventId);
  }

  if (testData.taskId) {
    await supabase.from('tasks').delete().eq('id', testData.taskId);
  }
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}

/**
 * Helper to make authenticated HTTP requests
 */
export async function makeAuthenticatedRequest(
  context: E2ETestContext,
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: context.authToken,
      'Content-Type': 'application/json',
    },
  });
}

