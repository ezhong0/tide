/**
 * Commands API Contracts
 *
 * Zod schemas for all command processing endpoints
 */

import { z } from 'zod';

// ============================================================================
// Request Schemas
// ============================================================================

export const ProcessCommandRequestSchema = z.object({
  transcript: z.string().min(1).max(2000),
  audioFileUrl: z.string().url().optional(),
  deviceType: z.enum(['ios', 'android', 'web']),
  appVersion: z.string(),
});

export const GetCommandRequestSchema = z.object({
  id: z.string().uuid(),
});

export const GetCommandsRequestSchema = z.object({
  status: z
    .enum(['pending', 'processing', 'pending_approval', 'completed', 'failed', 'cancelled'])
    .optional(),
  limit: z.number().int().min(1).max(100).default(50),
  page: z.number().int().min(1).default(1),
});

export const ApproveCommandRequestSchema = z.object({
  commandId: z.string().uuid(),
  edits: z
    .object({
      field: z.string(),
      originalValue: z.unknown(),
      newValue: z.unknown(),
    })
    .array()
    .optional(),
});

export const RejectCommandRequestSchema = z.object({
  commandId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

export const CancelCommandRequestSchema = z.object({
  commandId: z.string().uuid(),
});

export const ProvideCommandFeedbackRequestSchema = z.object({
  commandId: z.string().uuid(),
  feedbackType: z.enum(['approve', 'edit', 'reject', 'rating']),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
  changes: z
    .array(
      z.object({
        field: z.string(),
        originalValue: z.unknown(),
        newValue: z.unknown(),
        reason: z.string().optional(),
      })
    )
    .optional(),
});

// ============================================================================
// Response Schemas
// ============================================================================

export const DraftContentSchema = z.union([
  z.object({
    type: z.literal('email'),
    to: z.array(z.string()),
    cc: z.array(z.string()).optional(),
    subject: z.string(),
    body: z.string(),
    tone: z.string(),
    replyToThreadId: z.string().optional(),
  }),
  z.object({
    type: z.literal('meeting_request'),
    title: z.string(),
    participants: z.array(z.string()),
    proposedTimes: z.array(z.string().datetime()),
    duration: z.number(),
    location: z.string().optional(),
    description: z.string().optional(),
    conferenceType: z.enum(['zoom', 'meet', 'teams']).optional(),
  }),
]);

export const CommandSchema = z.object({
  id: z.string().uuid(),
  transcript: z.string(),
  intent: z.string(),
  intentData: z.record(z.unknown()),
  confidence: z.number().int().min(0).max(100),
  status: z.enum(['pending', 'processing', 'pending_approval', 'completed', 'failed', 'cancelled']),
  result: z.record(z.unknown()).optional(),
  error: z
    .object({
      message: z.string(),
      code: z.string().optional(),
      details: z.record(z.unknown()).optional(),
    })
    .optional(),
  timestamp: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
});

export const ProcessCommandResponseSchema = z.object({
  commandId: z.string().uuid(),
  status: z.enum(['pending_approval', 'processing', 'completed', 'failed']),
  intent: z.string(),
  confidence: z.number().int().min(0).max(100),
  draft: DraftContentSchema.optional(),
  message: z.string().optional(),
  requiresApproval: z.boolean(),
});

export const GetCommandResponseSchema = CommandSchema;

export const GetCommandsResponseSchema = z.object({
  commands: z.array(CommandSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  hasMore: z.boolean(),
});

export const ApproveCommandResponseSchema = z.object({
  success: z.boolean(),
  commandId: z.string().uuid(),
  result: z.record(z.unknown()).optional(),
  message: z.string(),
});

export const RejectCommandResponseSchema = z.object({
  success: z.boolean(),
  commandId: z.string().uuid(),
  message: z.string(),
});

export const CancelCommandResponseSchema = z.object({
  success: z.boolean(),
  commandId: z.string().uuid(),
  cancelledAt: z.string().datetime(),
});

export const ProvideCommandFeedbackResponseSchema = z.object({
  success: z.boolean(),
  feedbackId: z.string().uuid(),
  message: z.string(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type ProcessCommandRequest = z.infer<typeof ProcessCommandRequestSchema>;
export type ProcessCommandResponse = z.infer<typeof ProcessCommandResponseSchema>;

export type GetCommandRequest = z.infer<typeof GetCommandRequestSchema>;
export type GetCommandResponse = z.infer<typeof GetCommandResponseSchema>;

export type GetCommandsRequest = z.infer<typeof GetCommandsRequestSchema>;
export type GetCommandsResponse = z.infer<typeof GetCommandsResponseSchema>;

export type ApproveCommandRequest = z.infer<typeof ApproveCommandRequestSchema>;
export type ApproveCommandResponse = z.infer<typeof ApproveCommandResponseSchema>;

export type RejectCommandRequest = z.infer<typeof RejectCommandRequestSchema>;
export type RejectCommandResponse = z.infer<typeof RejectCommandResponseSchema>;

export type CancelCommandRequest = z.infer<typeof CancelCommandRequestSchema>;
export type CancelCommandResponse = z.infer<typeof CancelCommandResponseSchema>;

export type ProvideCommandFeedbackRequest = z.infer<typeof ProvideCommandFeedbackRequestSchema>;
export type ProvideCommandFeedbackResponse = z.infer<typeof ProvideCommandFeedbackResponseSchema>;

// ============================================================================
// Contract Definitions
// ============================================================================

export const CommandContracts = {
  processCommand: {
    method: 'POST' as const,
    path: '/api/commands',
    request: ProcessCommandRequestSchema,
    response: ProcessCommandResponseSchema,
  },
  getCommand: {
    method: 'GET' as const,
    path: '/api/commands/:id',
    request: GetCommandRequestSchema,
    response: GetCommandResponseSchema,
  },
  getCommands: {
    method: 'GET' as const,
    path: '/api/commands',
    request: GetCommandsRequestSchema,
    response: GetCommandsResponseSchema,
  },
  approveCommand: {
    method: 'POST' as const,
    path: '/api/commands/:id/approve',
    request: ApproveCommandRequestSchema,
    response: ApproveCommandResponseSchema,
  },
  rejectCommand: {
    method: 'POST' as const,
    path: '/api/commands/:id/reject',
    request: RejectCommandRequestSchema,
    response: RejectCommandResponseSchema,
  },
  cancelCommand: {
    method: 'POST' as const,
    path: '/api/commands/:id/cancel',
    request: CancelCommandRequestSchema,
    response: CancelCommandResponseSchema,
  },
  provideFeedback: {
    method: 'POST' as const,
    path: '/api/commands/:id/feedback',
    request: ProvideCommandFeedbackRequestSchema,
    response: ProvideCommandFeedbackResponseSchema,
  },
} as const;
