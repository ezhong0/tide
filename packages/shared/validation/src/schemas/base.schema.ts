import { z } from 'zod';

/**
 * Base request schema
 */
export const BaseRequestSchema = z.object({
  userId: z.string().uuid(),
  requestId: z.string().uuid(),
  timestamp: z.number().int().positive(),
  context: z.object({
    userAgent: z.string().optional(),
    ipAddress: z.string().ip().optional(),
    sessionId: z.string().uuid().optional(),
  }).optional(),
});

export type BaseRequest = z.infer<typeof BaseRequestSchema>;

/**
 * Base response schema
 */
export const ResponseMetadataSchema = z.object({
  requestId: z.string().uuid(),
  timestamp: z.number().int().positive(),
  duration: z.number().int().nonnegative(),
});

export const ErrorDetailSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.any().optional(),
});

export const BaseResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: ErrorDetailSchema.optional(),
  metadata: ResponseMetadataSchema,
});

export type BaseResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: z.infer<typeof ErrorDetailSchema>;
  metadata: z.infer<typeof ResponseMetadataSchema>;
};

/**
 * Pagination schema
 */
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().optional(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

export const PaginatedResponseSchema = <T extends z.ZodType>(dataSchema: T) => z.object({
  data: z.array(dataSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

/**
 * Common field validators
 */
export const EmailSchema = z.string().email();
export const UUIDSchema = z.string().uuid();
export const URLSchema = z.string().url();
export const DateTimeSchema = z.union([z.string().datetime(), z.date()]);
export const PhoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/); // E.164 format
