import { TideError } from './tide-error';
/**
 * Authentication error factories
 */
export declare class AuthErrors {
    static invalidCredentials(): TideError;
    static tokenExpired(): TideError;
    static tokenInvalid(): TideError;
    static insufficientPermissions(requiredPermission?: string): TideError;
    static userNotFound(identifier: string): TideError;
    static userAlreadyExists(email: string): TideError;
    static verificationRequired(): TideError;
    static accountLocked(reason?: string): TideError;
    static missingToken(): TideError;
    static invalidToken(): TideError;
    static accountSuspended(): TideError;
}
/**
 * Email error factories
 */
export declare class EmailErrors {
    static notFound(emailId: string): TideError;
    static sendFailed(reason?: string): TideError;
    static fetchFailed(reason?: string): TideError;
    static quotaExceeded(limit: number): TideError;
    static attachmentTooLarge(size: number, maxSize: number): TideError;
}
/**
 * Calendar error factories
 */
export declare class CalendarErrors {
    static eventNotFound(eventId: string): TideError;
    static eventConflict(conflictingEventId: string): TideError;
    static participantUnavailable(participantEmail: string): TideError;
    static invalidTimeRange(start: Date, end: Date): TideError;
}
/**
 * AI error factories
 */
export declare class AIErrors {
    static rateLimitExceeded(retryAfter?: number): TideError;
    static invalidIntent(intent: string): TideError;
    static generationFailed(reason?: string): TideError;
    static contextTooLarge(size: number, maxSize: number): TideError;
    static timeout(operation: string): TideError;
    static quotaExceeded(): TideError;
}
/**
 * Workflow error factories
 */
export declare class WorkflowErrors {
    static notFound(workflowId: string): TideError;
    static executionFailed(workflowId: string, step: number, reason?: string): TideError;
    static invalidState(currentState: string, attemptedTransition: string): TideError;
    static timeout(workflowId: string, duration: number): TideError;
    static taskNotFound(taskId: string): TideError;
    static taskAlreadyCompleted(taskId: string): TideError;
}
/**
 * Message error factories
 */
export declare class MessageErrors {
    static notFound(messageId: string): TideError;
    static sendFailed(reason?: string): TideError;
    static conversationNotFound(conversationId: string): TideError;
    static accessDenied(conversationId: string): TideError;
    static messageTooLarge(size: number, maxSize: number): TideError;
}
/**
 * Integration error factories
 */
export declare class IntegrationErrors {
    static oauthFailed(provider: string, reason?: string): TideError;
    static tokenRefreshFailed(provider: string): TideError;
    static providerUnavailable(provider: string): TideError;
    static rateLimited(provider: string, retryAfter?: number): TideError;
}
/**
 * Database error factories
 */
export declare class DatabaseErrors {
    static connectionFailed(reason?: string): TideError;
    static queryFailed(query: string, reason?: string): TideError;
    static transactionFailed(reason?: string): TideError;
    static constraintViolation(constraint: string): TideError;
    static timeout(query: string, timeout: number): TideError;
}
/**
 * System error factories
 */
export declare class SystemErrors {
    static internalError(message: string, details?: any): TideError;
    static serviceUnavailable(service: string): TideError;
    static timeout(operation: string, timeout: number): TideError;
    static validationFailed(errors: any): TideError;
    static notFound(resource: string, identifier?: string): TideError;
    static badRequest(message: string, details?: any): TideError;
    static forbidden(message?: string): TideError;
    static conflict(resource: string, details?: any): TideError;
    static tooManyRequests(retryAfter?: number): TideError;
    static notImplemented(feature: string): TideError;
    static maintenanceMode(estimatedEnd?: Date): TideError;
}
