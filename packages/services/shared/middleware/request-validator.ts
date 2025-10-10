/**
 * Request Validation Middleware
 * Validates request body, query params, and headers using Zod schemas
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from './error-handler.js';
import { createLogger } from '@tide/logger';

const logger = createLogger({ component: 'RequestValidator' });

export interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
}

/**
 * Validate request against Zod schemas
 */
export function validateRequest(schemas: ValidationSchemas) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      // Validate query params
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }

      // Validate URL params
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }

      // Validate headers
      if (schemas.headers) {
        req.headers = schemas.headers.parse(req.headers) as any;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        logger.warn('Request validation failed', {
          url: req.url,
          method: req.method,
          errors: validationErrors,
        });

        throw new BadRequestError('Validation failed', validationErrors);
      }

      throw error;
    }
  };
}

/**
 * Sanitize request input to prevent XSS and injection attacks
 */
export function sanitizeInput() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Sanitize query params
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    next();
  };
}

/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Sanitize a string value
 */
function sanitizeString(str: string): string {
  // Remove potential XSS patterns
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .trim();
}

/**
 * Validate pagination parameters
 */
export function validatePagination(options: {
  maxLimit?: number;
  defaultLimit?: number;
} = {}) {
  const { maxLimit = 100, defaultLimit = 20 } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Parse and validate limit
    const limit = parseInt(req.query.limit as string) || defaultLimit;
    req.query.limit = Math.min(Math.max(limit, 1), maxLimit).toString();

    // Parse and validate offset
    const offset = parseInt(req.query.offset as string) || 0;
    req.query.offset = Math.max(offset, 0).toString();

    next();
  };
}

/**
 * Validate required headers
 */
export function requireHeaders(headers: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = headers.filter((header) => !req.headers[header.toLowerCase()]);

    if (missing.length > 0) {
      throw new BadRequestError(
        'Missing required headers',
        { missing }
      );
    }

    next();
  };
}

/**
 * Validate content type
 */
export function requireContentType(contentType: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestContentType = req.headers['content-type'];

    if (!requestContentType || !requestContentType.includes(contentType)) {
      throw new BadRequestError(
        `Invalid content type. Expected ${contentType}`,
        { received: requestContentType }
      );
    }

    next();
  };
}

