/**
 * Domain types aggregation
 */

// Export all from each domain, letting TypeScript handle any conflicts
export * from './email.types';
export * from './calendar.types';
export * from './agent.types';
export * from './context.types';
export * from './conversation.types';

// Re-export specific conflicting types to resolve ambiguity
export type { ImportanceFactor } from './calendar.types';
export type {
  DateException,
  DayOfWeek,
  DaySchedule,
  WorkingHours
} from './context.types';