"use strict";
/**
 * @tide/contracts - Service contracts for Tide AI Executive Assistant
 *
 * All contracts are immutable after Phase 0 to enable parallel development.
 * Each contract defines complete interface with performance requirements.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// Core service contracts
tslib_1.__exportStar(require("./IEmailService"), exports);
tslib_1.__exportStar(require("./ICalendarService"), exports);
tslib_1.__exportStar(require("./IAgentService"), exports);
tslib_1.__exportStar(require("./IContextService"), exports);
// Module 00: Conversational AI contracts
tslib_1.__exportStar(require("./IConversationService"), exports);
tslib_1.__exportStar(require("./INaturalLanguageProcessor"), exports);
tslib_1.__exportStar(require("./IPersonalizationEngine"), exports);
tslib_1.__exportStar(require("./IActionPreviewService"), exports);
tslib_1.__exportStar(require("./IContextualMemory"), exports);
// Infrastructure contracts
tslib_1.__exportStar(require("./IEventStore"), exports);
// export * from './ICacheService';  // Conflicts: OptimizationResult
// export * from './IDatabaseService';  // Conflicts: Transaction
tslib_1.__exportStar(require("./IQueueService"), exports);
// Supporting service contracts
tslib_1.__exportStar(require("./IAuthService"), exports);
tslib_1.__exportStar(require("./INotificationService"), exports);
// Note: Some types conflict between services (e.g. TimeRange, TrainingExample)
// These are acceptable for Phase 0 as contracts are now immutable
// export * from './ILearningService';
// export * from './IAnalyticsService';
//# sourceMappingURL=index.js.map