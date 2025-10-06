/**
 * Command and voice input validation schemas
 * Critical for the AI assistant's primary interface
 */

import { z } from 'zod';

import { UUIDSchema, TimestampSchema, EmailSchema } from './primitives.schemas';

// Voice command input - the primary interface
export const VoiceCommandSchema = z.object({
  userId: UUIDSchema,
  transcript: z.string()
    .min(1, 'Command cannot be empty')
    .max(1000, 'Command too long'),
  audioData: z.instanceof(Buffer).optional(),
  confidence: z.number().min(0).max(1).optional(),
  language: z.string().length(2).default('en'),
  sessionId: UUIDSchema.optional(),
  timestamp: TimestampSchema.optional()
});

// Command intents
export const CommandIntentSchema = z.enum([
  'schedule_meeting',
  'draft_email',
  'search_emails',
  'check_calendar',
  'set_reminder',
  'create_task',
  'find_time',
  'reply_email',
  'forward_email',
  'cancel_meeting',
  'reschedule_meeting',
  'unknown'
]);

// Intent classification result
export const IntentClassificationSchema = z.object({
  primary: CommandIntentSchema,
  confidence: z.number().min(0).max(1),
  entities: z.array(z.object({
    type: z.string(),
    value: z.string(),
    position: z.tuple([z.number(), z.number()]),
    confidence: z.number().min(0).max(1)
  })),
  parameters: z.record(z.unknown())
});

// Schedule meeting command
export const ScheduleMeetingCommandSchema = z.object({
  participant: EmailSchema,
  timeframe: z.enum(['today', 'tomorrow', 'this_week', 'next_week', 'custom']),
  customDate: TimestampSchema.optional(),
  duration: z.number().int().min(15).max(480).default(30),
  meetingType: z.enum(['lunch', 'coffee', 'discussion', 'review', 'standup', 'one-on-one']).optional(),
  location: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  isVirtual: z.boolean().default(false)
}).refine(
  data => data.timeframe !== 'custom' || data.customDate !== undefined,
  'Custom date required when timeframe is custom'
);

// Draft email command
export const DraftEmailCommandSchema = z.object({
  to: z.array(EmailSchema).min(1).max(20),
  subject: z.string().max(200).optional(),
  context: z.string().min(1).max(2000),
  tone: z.enum(['formal', 'casual', 'friendly', 'professional']).default('professional'),
  urgency: z.enum(['low', 'normal', 'high']).default('normal'),
  attachContext: z.boolean().default(false)
});

// Search command
export const SearchCommandSchema = z.object({
  query: z.string().min(1).max(500),
  scope: z.enum(['emails', 'calendar', 'contacts', 'all']).default('all'),
  dateRange: z.enum(['today', 'this_week', 'this_month', 'all_time', 'custom']).default('all_time'),
  customDateRange: z.object({
    start: TimestampSchema,
    end: TimestampSchema
  }).optional(),
  limit: z.number().int().min(1).max(50).default(10)
});

// Command result
export const CommandResultSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('success'),
    commandId: UUIDSchema,
    result: z.unknown(),
    executionTime: z.number(),
    confidence: z.number().min(0).max(1)
  }),
  z.object({
    status: z.literal('pending_approval'),
    commandId: UUIDSchema,
    draft: z.unknown(), // Would be specific draft type
    requiresConfirmation: z.array(z.string()),
    alternatives: z.array(z.unknown()).optional()
  }),
  z.object({
    status: z.literal('failed'),
    commandId: UUIDSchema,
    error: z.string(),
    recoverable: z.boolean(),
    suggestions: z.array(z.string()).optional()
  })
]);

// User feedback on command
export const CommandFeedbackSchema = z.object({
  commandId: UUIDSchema,
  userId: UUIDSchema,
  rating: z.number().int().min(1).max(5),
  helpful: z.boolean(),
  correct: z.boolean(),
  feedback: z.string().max(1000).optional(),
  timestamp: TimestampSchema
});

// Command approval/rejection
export const CommandApprovalSchema = z.object({
  commandId: UUIDSchema,
  userId: UUIDSchema,
  approved: z.boolean(),
  modifications: z.record(z.unknown()).optional(),
  reason: z.string().max(500).optional()
});

// Batch command processing
export const BatchCommandSchema = z.object({
  commands: z.array(VoiceCommandSchema).min(1).max(10),
  processInParallel: z.boolean().default(false),
  stopOnError: z.boolean().default(true)
});