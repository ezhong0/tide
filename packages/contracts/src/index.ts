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
export * from './ICacheService';
export * from './IDatabaseService';
export * from './IQueueService';

// Supporting service contracts
export * from './IAuthService';
export * from './INotificationService';
export * from './ILearningService';
export * from './IAnalyticsService';