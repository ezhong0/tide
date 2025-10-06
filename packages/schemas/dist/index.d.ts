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
export * from './primitives.schemas';
export * from './email.schemas';
export * from './calendar.schemas';
export * from './command.schemas';
export * from './middleware';
export { z } from 'zod';
export type { ZodError, ZodIssue, ZodSchema } from 'zod';
//# sourceMappingURL=index.d.ts.map