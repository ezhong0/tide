/**
 * Common validation schemas
 *
 * Reusable Zod schemas for common data types
 */

import { z } from 'zod';

// ============================================================================
// Basic Validators
// ============================================================================

export const emailSchema = z.string().email().toLowerCase();

export const uuidSchema = z.string().uuid();

export const datetimeSchema = z.string().datetime();

export const urlSchema = z.string().url();

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (E.164)');

export const timezoneSchema = z.string().refine(
  (tz) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Invalid timezone' }
);

export const timeOfDaySchema = z.enum(['morning', 'lunch', 'afternoon', 'evening']);

export const toneSchema = z.enum(['professional', 'casual', 'friendly', 'formal']);

export const relationshipTypeSchema = z.enum(['colleague', 'client', 'friend', 'boss', 'vendor']);

// ============================================================================
// Pagination Validators
// ============================================================================

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
});

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

// ============================================================================
// Date Range Validators
// ============================================================================

export const dateRangeSchema = z
  .object({
    start: datetimeSchema,
    end: datetimeSchema,
  })
  .refine((data) => new Date(data.start) < new Date(data.end), {
    message: 'Start date must be before end date',
  });

export const optionalDateRangeSchema = z
  .object({
    dateAfter: datetimeSchema.optional(),
    dateBefore: datetimeSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.dateAfter && data.dateBefore) {
        return new Date(data.dateAfter) < new Date(data.dateBefore);
      }
      return true;
    },
    {
      message: 'dateAfter must be before dateBefore',
    }
  );

// ============================================================================
// ID Validators
// ============================================================================

export const idParamSchema = z.object({
  id: uuidSchema,
});

export const threadIdParamSchema = z.object({
  threadId: z.string().min(1),
});

export const emailParamSchema = z.object({
  email: emailSchema,
});

// ============================================================================
// Search Validators
// ============================================================================

export const searchQuerySchema = z.object({
  query: z.string().min(1).max(500).optional(),
  ...paginationSchema.shape,
});

export const semanticSearchSchema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(50).default(10),
  threshold: z.number().min(0).max(1).default(0.7).optional(),
});

// ============================================================================
// File Upload Validators
// ============================================================================

export const attachmentSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().regex(/^[a-z]+\/[a-z0-9\-\+\.]+$/i),
  size: z
    .number()
    .int()
    .positive()
    .max(25 * 1024 * 1024), // Max 25MB
  content: z.string(), // base64 encoded
});

export const attachmentsArraySchema = z.array(attachmentSchema).max(10);

// ============================================================================
// Email Address Validators
// ============================================================================

export const emailAddressSchema = emailSchema;

export const emailAddressArraySchema = z.array(emailAddressSchema).min(1).max(50);

export const optionalEmailAddressArraySchema = z.array(emailAddressSchema).max(50).optional();

// ============================================================================
// Configuration Validators
// ============================================================================

export const quietHoursSchema = z.object({
  enabled: z.boolean(),
  start: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format'),
  end: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format'),
});

export const notificationInterruptionsSchema = z.object({
  vip_emails: z.boolean(),
  meeting_reminders: z.boolean(),
  urgent_deadlines: z.boolean(),
  tracked_responses: z.boolean(),
});

export const notificationPreferencesSchema = z.object({
  interruptions: notificationInterruptionsSchema,
  batch_interval: z.number().int().min(5).max(1440), // 5 minutes to 24 hours
  quiet_hours: quietHoursSchema,
});

// ============================================================================
// Webhook Validators
// ============================================================================

export const webhookHeaderSchema = z.object({
  'x-webhook-signature': z.string(),
  'x-webhook-timestamp': z.string(),
});

// ============================================================================
// Sort Validators
// ============================================================================

export const sortOrderSchema = z.enum(['asc', 'desc']);

export const sortSchema = z.object({
  field: z.string(),
  order: sortOrderSchema,
});

// ============================================================================
// Filter Validators
// ============================================================================

export const statusFilterSchema = z.array(z.string()).optional();

export const tagsFilterSchema = z.array(z.string()).max(20).optional();

export const booleanFilterSchema = z.boolean().optional();
