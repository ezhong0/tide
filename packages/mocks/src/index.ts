/**
 * @tide/mocks - Realistic mock implementations for all Tide services
 *
 * These mocks provide stateful, realistic behavior for development and testing.
 * All mocks simulate latency, handle errors, and maintain state.
 */

export * from './MockEmailService';
export * from './conversation/MockConversationService';
export * from './action/MockActionPreviewService';
export * from './nlp/MockNaturalLanguageProcessor';
export * from './personalization/MockPersonalizationEngine';
export * from './memory/MockContextualMemory';

// Additional mock services would be implemented here:
// export * from './MockCalendarService';
// export * from './MockAgentService';
// export * from './MockContextService';
// export * from './MockEventStore';
// export * from './MockCacheService';
// export * from './MockDatabaseService';
// export * from './MockQueueService';
// export * from './MockAuthService';
// export * from './MockNotificationService';
// export * from './MockLearningService';
// export * from './MockAnalyticsService';