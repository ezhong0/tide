import { z } from 'zod';
export * from './schemas';
/**
 * Validation helper function
 */
export declare function validate<T extends z.ZodType>(schema: T, data: unknown): z.infer<T>;
/**
 * Async validation helper
 */
export declare function validateAsync<T extends z.ZodType>(schema: T, data: unknown): Promise<z.infer<T>>;
/**
 * Validation middleware for Express
 */
export declare function validateBody<T extends z.ZodType>(schema: T): (req: unknown, res: unknown, next: unknown) => void;
/**
 * Validation middleware for query parameters
 */
export declare function validateQuery<T extends z.ZodType>(schema: T): (req: unknown, res: unknown, next: unknown) => void;
/**
 * Validation middleware for route parameters
 */
export declare function validateParams<T extends z.ZodType>(schema: T): (req: unknown, res: unknown, next: unknown) => void;
/**
 * Check if data matches schema without throwing
 */
export declare function isValid<T extends z.ZodType>(schema: T, data: unknown): boolean;
/**
 * Get validation errors without throwing
 */
export declare function getValidationErrors<T extends z.ZodType>(schema: T, data: unknown): z.ZodError | null;
