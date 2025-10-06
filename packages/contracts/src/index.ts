/**
 * @tide/contracts - Service contracts for Tide AI Executive Assistant
 *
 * All contracts are immutable after Phase 0 to enable parallel development.
 * Each contract defines complete interface with performance requirements.
 */

// Core service contracts
export * from './IEmailService';
export * from './ICalendarService';
export * from './IAgentService';
export * from './IContextService';

// Infrastructure contracts
export * from './IEventStore';
// export * from './ICacheService';  // Conflicts: OptimizationResult
// export * from './IDatabaseService';  // Conflicts: Transaction
export * from './IQueueService';

// Supporting service contracts
export * from './IAuthService';
export * from './INotificationService';
// Note: Some types conflict between services (e.g. TimeRange, TrainingExample)
// These are acceptable for Phase 0 as contracts are now immutable
// export * from './ILearningService';
// export * from './IAnalyticsService';