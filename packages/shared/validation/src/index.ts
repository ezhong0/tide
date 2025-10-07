import { z } from 'zod';
import { SystemErrors } from '@tide/errors';

// Export all schemas
export * from './schemas';

/**
 * Validation helper function
 */
export function validate<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw SystemErrors.validationFailed(result.error.format());
  }

  return result.data;
}

/**
 * Async validation helper
 */
export async function validateAsync<T extends z.ZodType>(
  schema: T,
  data: unknown
): Promise<z.infer<T>> {
  const result = await schema.safeParseAsync(data);

  if (!result.success) {
    throw SystemErrors.validationFailed(result.error.format());
  }

  return result.data;
}

/**
 * Validation middleware for Express
 */
export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: any, res: any, next: any) => {
    try {
      req.body = validate(schema, req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Validation middleware for query parameters
 */
export function validateQuery<T extends z.ZodType>(schema: T) {
  return (req: any, res: any, next: any) => {
    try {
      req.query = validate(schema, req.query);
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Validation middleware for route parameters
 */
export function validateParams<T extends z.ZodType>(schema: T) {
  return (req: any, res: any, next: any) => {
    try {
      req.params = validate(schema, req.params);
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check if data matches schema without throwing
 */
export function isValid<T extends z.ZodType>(
  schema: T,
  data: unknown
): boolean {
  return schema.safeParse(data).success;
}

/**
 * Get validation errors without throwing
 */
export function getValidationErrors<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.ZodError | null {
  const result = schema.safeParse(data);
  return result.success ? null : result.error;
}
