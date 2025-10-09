/**
 * Email Service Validation Schemas
 * Zod schemas for input validation
 */

import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// OAuth Tokens validation
export const OAuthTokensSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
  refreshToken: z.string().min(1, 'Refresh token is required'),
  expiresAt: z.union([z.date(), z.string().datetime()]).optional(),
  scope: z.union([z.array(z.string()), z.string()]).optional(),
});

// Connect Provider Request
export const ConnectProviderSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  tokens: OAuthTokensSchema,
});

// Fetch Emails Query Params
export const FetchEmailsParamsSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  provider: z.enum(['gmail', 'exchange'], {
    errorMap: () => ({ message: 'Provider must be either gmail or exchange' }),
  }),
});

export const FetchEmailsQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  unreadOnly: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
});

// Triage Email Request
export const TriageEmailSchema = z.object({
  email: z.object({
    id: z.string(),
    from: z.string().email().optional(),
    subject: z.string(),
    body: z.string(),
    timestamp: z.union([z.date(), z.string().datetime()]).optional(),
  }),
});

// Compose Email Request
export const ComposeRequestSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  recipient: z.string().email('Invalid recipient email format'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  body: z.string().max(10000, 'Body too long').optional(),
  context: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'friendly', 'formal']).optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
});

// Send Email Request
export const SendEmailParamsSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  provider: z.enum(['gmail', 'exchange']),
});

export const SendEmailBodySchema = z.object({
  draft: z.object({
    subject: z.string().min(1, 'Subject is required'),
    body: z.string().min(1, 'Body is required'),
  }),
  to: z.array(z.string().email()).min(1, 'At least one recipient required'),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
});

// Search Emails Request
export const SearchEmailsSchema = z.object({
  query: z.string().max(500).optional(),
  userId: z.string().uuid('Invalid user ID format'),
  filters: z.object({
    from: z.string().email().optional(),
    to: z.string().email().optional(),
    subject: z.string().optional(),
    isRead: z.boolean().optional(),
    hasAttachments: z.boolean().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }).optional(),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
  sort: z.enum(['date', 'from', 'subject']).optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Search Suggestions Query
export const SearchSuggestionsSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  query: z.string().max(100).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(20)).optional(),
});

// Popular Searches Query
export const PopularSearchesSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(50)).optional(),
});

/**
 * Validation middleware factory
 * Creates middleware that validates request data against a schema
 */
export function validate<T extends z.ZodType>(schema: T, source: 'body' | 'params' | 'query' = 'body') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = source === 'body' ? req.body : source === 'params' ? req.params : req.query;
      const validated = await schema.parseAsync(data);

      // Replace request data with validated and transformed data
      if (source === 'body') req.body = validated;
      else if (source === 'params') req.params = validated;
      else if (source === 'query') req.query = validated;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
}
