"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemErrors = exports.DatabaseErrors = exports.IntegrationErrors = exports.MessageErrors = exports.WorkflowErrors = exports.AIErrors = exports.CalendarErrors = exports.EmailErrors = exports.AuthErrors = void 0;
const tide_error_1 = require("./tide-error");
const codes_1 = require("./codes");
/**
 * Authentication error factories
 */
class AuthErrors {
    static invalidCredentials() {
        return new tide_error_1.TideError(codes_1.ErrorCode.AUTH_INVALID_CREDENTIALS, 'Invalid email or password');
    }
    static tokenExpired() {
        return new tide_error_1.TideError(codes_1.ErrorCode.AUTH_TOKEN_EXPIRED, 'Authentication token has expired. Please log in again.');
    }
    static tokenInvalid() {
        return new tide_error_1.TideError(codes_1.ErrorCode.AUTH_TOKEN_INVALID, 'Authentication token is invalid');
    }
    static insufficientPermissions(requiredPermission) {
        return new tide_error_1.TideError(codes_1.ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS, 'You do not have permission to perform this action', requiredPermission ? { requiredPermission } : undefined);
    }
    static userNotFound(identifier) {
        return new tide_error_1.TideError(codes_1.ErrorCode.AUTH_USER_NOT_FOUND, 'User not found', { identifier });
    }
    static userAlreadyExists(email) {
        return new tide_error_1.TideError(codes_1.ErrorCode.AUTH_USER_ALREADY_EXISTS, 'A user with this email already exists', { email });
    }
    static verificationRequired() {
        return new tide_error_1.TideError(codes_1.ErrorCode.AUTH_VERIFICATION_REQUIRED, 'Email verification required. Please check your email.');
    }
    static accountLocked(reason) {
        return new tide_error_1.TideError(codes_1.ErrorCode.AUTH_ACCOUNT_LOCKED, 'Account has been locked', { reason });
    }
    static missingToken() {
        return new tide_error_1.TideError(codes_1.ErrorCode.AUTH_TOKEN_INVALID, 'Authentication token is required');
    }
    // Aliases for compatibility
    static invalidToken() {
        return this.tokenInvalid();
    }
    static accountSuspended() {
        return new tide_error_1.TideError(codes_1.ErrorCode.AUTH_ACCOUNT_LOCKED, 'Account has been suspended');
    }
}
exports.AuthErrors = AuthErrors;
/**
 * Email error factories
 */
class EmailErrors {
    static notFound(emailId) {
        return new tide_error_1.TideError(codes_1.ErrorCode.EMAIL_NOT_FOUND, 'Email not found', { emailId });
    }
    static sendFailed(reason) {
        return new tide_error_1.TideError(codes_1.ErrorCode.EMAIL_SEND_FAILED, 'Failed to send email', { reason });
    }
    static fetchFailed(reason) {
        return new tide_error_1.TideError(codes_1.ErrorCode.EMAIL_FETCH_FAILED, 'Failed to fetch emails', { reason });
    }
    static quotaExceeded(limit) {
        return new tide_error_1.TideError(codes_1.ErrorCode.EMAIL_QUOTA_EXCEEDED, 'Email quota exceeded', { limit });
    }
    static attachmentTooLarge(size, maxSize) {
        return new tide_error_1.TideError(codes_1.ErrorCode.EMAIL_ATTACHMENT_TOO_LARGE, 'Attachment size exceeds maximum allowed', { size, maxSize });
    }
}
exports.EmailErrors = EmailErrors;
/**
 * Calendar error factories
 */
class CalendarErrors {
    static eventNotFound(eventId) {
        return new tide_error_1.TideError(codes_1.ErrorCode.CALENDAR_EVENT_NOT_FOUND, 'Calendar event not found', { eventId });
    }
    static eventConflict(conflictingEventId) {
        return new tide_error_1.TideError(codes_1.ErrorCode.CALENDAR_EVENT_CONFLICT, 'Event conflicts with existing calendar entry', { conflictingEventId });
    }
    static participantUnavailable(participantEmail) {
        return new tide_error_1.TideError(codes_1.ErrorCode.CALENDAR_PARTICIPANT_UNAVAILABLE, 'One or more participants are unavailable', { participantEmail });
    }
    static invalidTimeRange(start, end) {
        return new tide_error_1.TideError(codes_1.ErrorCode.CALENDAR_INVALID_TIME_RANGE, 'Invalid time range for calendar event', { start: start.toISOString(), end: end.toISOString() });
    }
}
exports.CalendarErrors = CalendarErrors;
/**
 * AI error factories
 */
class AIErrors {
    static rateLimitExceeded(retryAfter) {
        return new tide_error_1.TideError(codes_1.ErrorCode.AI_RATE_LIMIT_EXCEEDED, 'AI service rate limit exceeded', { retryAfter });
    }
    static invalidIntent(intent) {
        return new tide_error_1.TideError(codes_1.ErrorCode.AI_INVALID_INTENT, 'Unable to determine valid intent from input', { intent });
    }
    static generationFailed(reason) {
        return new tide_error_1.TideError(codes_1.ErrorCode.AI_GENERATION_FAILED, 'AI generation failed', { reason });
    }
    static contextTooLarge(size, maxSize) {
        return new tide_error_1.TideError(codes_1.ErrorCode.AI_CONTEXT_TOO_LARGE, 'Context size exceeds maximum allowed', { size, maxSize });
    }
    static timeout(operation) {
        return new tide_error_1.TideError(codes_1.ErrorCode.AI_TIMEOUT, 'AI operation timed out', { operation });
    }
    static quotaExceeded() {
        return new tide_error_1.TideError(codes_1.ErrorCode.AI_QUOTA_EXCEEDED, 'AI service quota exceeded for this billing period');
    }
}
exports.AIErrors = AIErrors;
/**
 * Workflow error factories
 */
class WorkflowErrors {
    static notFound(workflowId) {
        return new tide_error_1.TideError(codes_1.ErrorCode.WORKFLOW_NOT_FOUND, 'Workflow not found', { workflowId });
    }
    static executionFailed(workflowId, step, reason) {
        return new tide_error_1.TideError(codes_1.ErrorCode.WORKFLOW_EXECUTION_FAILED, 'Workflow execution failed', { workflowId, step, reason });
    }
    static invalidState(currentState, attemptedTransition) {
        return new tide_error_1.TideError(codes_1.ErrorCode.WORKFLOW_INVALID_STATE, 'Invalid workflow state transition', { currentState, attemptedTransition });
    }
    static timeout(workflowId, duration) {
        return new tide_error_1.TideError(codes_1.ErrorCode.WORKFLOW_TIMEOUT, 'Workflow execution timed out', { workflowId, duration });
    }
    static taskNotFound(taskId) {
        return new tide_error_1.TideError(codes_1.ErrorCode.TASK_NOT_FOUND, 'Task not found', { taskId });
    }
    static taskAlreadyCompleted(taskId) {
        return new tide_error_1.TideError(codes_1.ErrorCode.TASK_ALREADY_COMPLETED, 'Task is already completed', { taskId });
    }
}
exports.WorkflowErrors = WorkflowErrors;
/**
 * Message error factories
 */
class MessageErrors {
    static notFound(messageId) {
        return new tide_error_1.TideError(codes_1.ErrorCode.MESSAGE_NOT_FOUND, 'Message not found', { messageId });
    }
    static sendFailed(reason) {
        return new tide_error_1.TideError(codes_1.ErrorCode.MESSAGE_SEND_FAILED, 'Failed to send message', { reason });
    }
    static conversationNotFound(conversationId) {
        return new tide_error_1.TideError(codes_1.ErrorCode.CONVERSATION_NOT_FOUND, 'Conversation not found', { conversationId });
    }
    static accessDenied(conversationId) {
        return new tide_error_1.TideError(codes_1.ErrorCode.CONVERSATION_ACCESS_DENIED, 'You do not have access to this conversation', { conversationId });
    }
    static messageTooLarge(size, maxSize) {
        return new tide_error_1.TideError(codes_1.ErrorCode.MESSAGE_TOO_LARGE, 'Message size exceeds maximum allowed', { size, maxSize });
    }
}
exports.MessageErrors = MessageErrors;
/**
 * Integration error factories
 */
class IntegrationErrors {
    static oauthFailed(provider, reason) {
        return new tide_error_1.TideError(codes_1.ErrorCode.INTEGRATION_OAUTH_FAILED, `OAuth authentication failed for ${provider}`, { provider, reason });
    }
    static tokenRefreshFailed(provider) {
        return new tide_error_1.TideError(codes_1.ErrorCode.INTEGRATION_TOKEN_REFRESH_FAILED, `Failed to refresh access token for ${provider}`, { provider });
    }
    static providerUnavailable(provider) {
        return new tide_error_1.TideError(codes_1.ErrorCode.INTEGRATION_PROVIDER_UNAVAILABLE, `Integration provider ${provider} is currently unavailable`, { provider });
    }
    static rateLimited(provider, retryAfter) {
        return new tide_error_1.TideError(codes_1.ErrorCode.INTEGRATION_RATE_LIMITED, `Rate limited by ${provider}`, { provider, retryAfter });
    }
}
exports.IntegrationErrors = IntegrationErrors;
/**
 * Database error factories
 */
class DatabaseErrors {
    static connectionFailed(reason) {
        return new tide_error_1.TideError(codes_1.ErrorCode.DATABASE_CONNECTION_FAILED, 'Database connection failed', { reason }, 500, false // Not operational
        );
    }
    static queryFailed(query, reason) {
        return new tide_error_1.TideError(codes_1.ErrorCode.DATABASE_QUERY_FAILED, 'Database query failed', { query: query.substring(0, 100), reason });
    }
    static transactionFailed(reason) {
        return new tide_error_1.TideError(codes_1.ErrorCode.DATABASE_TRANSACTION_FAILED, 'Database transaction failed', { reason });
    }
    static constraintViolation(constraint) {
        return new tide_error_1.TideError(codes_1.ErrorCode.DATABASE_CONSTRAINT_VIOLATION, 'Database constraint violation', { constraint });
    }
    static timeout(query, timeout) {
        return new tide_error_1.TideError(codes_1.ErrorCode.DATABASE_TIMEOUT, 'Database query timed out', { query: query.substring(0, 100), timeout });
    }
}
exports.DatabaseErrors = DatabaseErrors;
/**
 * System error factories
 */
class SystemErrors {
    static internalError(message, details) {
        return new tide_error_1.TideError(codes_1.ErrorCode.INTERNAL_ERROR, message, details, 500, false // Not operational
        );
    }
    static serviceUnavailable(service) {
        return new tide_error_1.TideError(codes_1.ErrorCode.SERVICE_UNAVAILABLE, `Service ${service} is currently unavailable`, { service });
    }
    static timeout(operation, timeout) {
        return new tide_error_1.TideError(codes_1.ErrorCode.SERVICE_TIMEOUT, 'Operation timed out', { operation, timeout });
    }
    static validationFailed(errors) {
        return new tide_error_1.TideError(codes_1.ErrorCode.VALIDATION_FAILED, 'Request validation failed', { validationErrors: errors });
    }
    static notFound(resource, identifier) {
        return new tide_error_1.TideError(codes_1.ErrorCode.NOT_FOUND, `${resource} not found`, { resource, identifier });
    }
    static badRequest(message, details) {
        return new tide_error_1.TideError(codes_1.ErrorCode.BAD_REQUEST, message, details);
    }
    static forbidden(message = 'Access forbidden') {
        return new tide_error_1.TideError(codes_1.ErrorCode.FORBIDDEN, message);
    }
    static conflict(resource, details) {
        return new tide_error_1.TideError(codes_1.ErrorCode.CONFLICT, `Conflict with existing ${resource}`, details);
    }
    static tooManyRequests(retryAfter) {
        return new tide_error_1.TideError(codes_1.ErrorCode.TOO_MANY_REQUESTS, 'Too many requests', { retryAfter });
    }
    static notImplemented(feature) {
        return new tide_error_1.TideError(codes_1.ErrorCode.FEATURE_NOT_IMPLEMENTED, `Feature not yet implemented: ${feature}`, { feature });
    }
    static maintenanceMode(estimatedEnd) {
        return new tide_error_1.TideError(codes_1.ErrorCode.MAINTENANCE_MODE, 'System is currently in maintenance mode', { estimatedEnd: estimatedEnd?.toISOString() });
    }
}
exports.SystemErrors = SystemErrors;
