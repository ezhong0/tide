/**
 * Reusable primitive Zod schemas
 * These are the building blocks for all validation
 */

import { z } from 'zod';

// Basic string validations
export const EmailSchema = z
  .string()
  .email('Invalid email format')
  .toLowerCase()
  .trim();

export const UUIDSchema = z
  .string()
  .uuid('Invalid UUID format');

export const PhoneNumberSchema = z
  .string()
  .regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format')
  .min(10, 'Phone number too short')
  .max(20, 'Phone number too long');

export const URLSchema = z
  .string()
  .url('Invalid URL format');

// Date/Time validations
export const TimestampSchema = z
  .number()
  .int('Timestamp must be an integer')
  .positive('Timestamp must be positive')
  .refine(val => val < 253402300800000, 'Timestamp too far in future'); // Year 10000

export const DateTimeStringSchema = z
  .string()
  .datetime('Invalid datetime format');

export const TimeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)');

export const DurationMinutesSchema = z
  .number()
  .int('Duration must be in whole minutes')
  .min(5, 'Duration must be at least 5 minutes')
  .max(480, 'Duration cannot exceed 8 hours');

// Common enums
export const EmailProviderSchema = z.enum(['gmail', 'outlook', 'icloud', 'custom']);
export const CalendarProviderSchema = z.enum(['google', 'outlook', 'apple', 'caldav']);

export const PrioritySchema = z.enum(['low', 'normal', 'high', 'urgent']);
export const StatusSchema = z.enum(['pending', 'in-progress', 'completed', 'failed']);

// Pagination
export const PaginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  orderBy: z.string().optional(),
  orderDirection: z.enum(['asc', 'desc']).default('desc')
});

// Time range
export const TimeRangeSchema = z.object({
  start: TimestampSchema,
  end: TimestampSchema
}).refine(data => data.end > data.start, 'End time must be after start time');

// Result wrapper for error handling
export function ResultSchema<T extends z.ZodType>(dataSchema: T) {
  return z.discriminatedUnion('success', [
    z.object({
      success: z.literal(true),
      data: dataSchema
    }),
    z.object({
      success: z.literal(false),
      error: z.object({
        message: z.string(),
        code: z.string().optional(),
        details: z.unknown().optional()
      })
    })
  ]);
}

// Safe parsing helper
export function safeParse<T>(schema: z.ZodType<T>, data: unknown) {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true as const, data: result.data };
  }
  return {
    success: false as const,
    error: {
      message: result.error.errors.map(e => e.message).join(', '),
      details: result.error.errors
    }
  };
}