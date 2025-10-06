/**
 * @tide/schemas - Runtime validation with Zod
 *
 * Provides comprehensive validation schemas for all external inputs,
 * API boundaries, and data transformations.
 *
 * Key principles:
 * - Validate ALL external inputs
 * - Fail fast with clear error messages
 * - Type inference from schemas
 * - Reusable primitive schemas
 */

// Primitive schemas
export * from './primitives.schemas';

// Domain schemas
export * from './email.schemas';
export * from './calendar.schemas';
export * from './command.schemas';
export * from './conversation.schemas';

// Middleware and utilities
export * from './middleware';

// Re-export zod for convenience
export { z } from 'zod';
export type { ZodError, ZodIssue, ZodSchema } from 'zod';