import { TideError } from './tide-error';
import { ErrorCode } from './codes';

/**
 * Authentication error factories
 */
export class AuthErrors {
  static invalidCredentials(): TideError {
    return new TideError(
      ErrorCode.AUTH_INVALID_CREDENTIALS,
      'Invalid email or password'
    );
  }

  static tokenExpired(): TideError {
    return new TideError(
      ErrorCode.AUTH_TOKEN_EXPIRED,
      'Authentication token has expired. Please log in again.'
    );
  }

  static tokenInvalid(): TideError {
    return new TideError(
      ErrorCode.AUTH_TOKEN_INVALID,
      'Authentication token is invalid'
    );
  }

  static insufficientPermissions(requiredPermission?: string): TideError {
    return new TideError(
      ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
      'You do not have permission to perform this action',
      requiredPermission ? { requiredPermission } : undefined
    );
  }

  static userNotFound(identifier: string): TideError {
    return new TideError(
      ErrorCode.AUTH_USER_NOT_FOUND,
      'User not found',
      { identifier }
    );
  }

  static userAlreadyExists(email: string): TideError {
    return new TideError(
      ErrorCode.AUTH_USER_ALREADY_EXISTS,
      'A user with this email already exists',
      { email }
    );
  }

  static verificationRequired(): TideError {
    return new TideError(
      ErrorCode.AUTH_VERIFICATION_REQUIRED,
      'Email verification required. Please check your email.'
    );
  }

  static accountLocked(reason?: string): TideError {
    return new TideError(
      ErrorCode.AUTH_ACCOUNT_LOCKED,
      'Account has been locked',
      { reason }
    );
  }

  static missingToken(): TideError {
    return new TideError(
      ErrorCode.AUTH_TOKEN_INVALID,
      'Authentication token is required'
    );
  }

  // Aliases for compatibility
  static invalidToken(): TideError {
    return this.tokenInvalid();
  }

  static accountSuspended(): TideError {
    return new TideError(
      ErrorCode.AUTH_ACCOUNT_LOCKED,
      'Account has been suspended'
    );
  }
}

/**
 * Email error factories
 */
export class EmailErrors {
  static notFound(emailId: string): TideError {
    return new TideError(
      ErrorCode.EMAIL_NOT_FOUND,
      'Email not found',
      { emailId }
    );
  }

  static sendFailed(reason?: string): TideError {
    return new TideError(
      ErrorCode.EMAIL_SEND_FAILED,
      'Failed to send email',
      { reason }
    );
  }

  static fetchFailed(reason?: string): TideError {
    return new TideError(
      ErrorCode.EMAIL_FETCH_FAILED,
      'Failed to fetch emails',
      { reason }
    );
  }

  static quotaExceeded(limit: number): TideError {
    return new TideError(
      ErrorCode.EMAIL_QUOTA_EXCEEDED,
      'Email quota exceeded',
      { limit }
    );
  }

  static attachmentTooLarge(size: number, maxSize: number): TideError {
    return new TideError(
      ErrorCode.EMAIL_ATTACHMENT_TOO_LARGE,
      'Attachment size exceeds maximum allowed',
      { size, maxSize }
    );
  }
}

/**
 * Calendar error factories
 */
export class CalendarErrors {
  static eventNotFound(eventId: string): TideError {
    return new TideError(
      ErrorCode.CALENDAR_EVENT_NOT_FOUND,
      'Calendar event not found',
      { eventId }
    );
  }

  static eventConflict(conflictingEventId: string): TideError {
    return new TideError(
      ErrorCode.CALENDAR_EVENT_CONFLICT,
      'Event conflicts with existing calendar entry',
      { conflictingEventId }
    );
  }

  static participantUnavailable(participantEmail: string): TideError {
    return new TideError(
      ErrorCode.CALENDAR_PARTICIPANT_UNAVAILABLE,
      'One or more participants are unavailable',
      { participantEmail }
    );
  }

  static invalidTimeRange(start: Date, end: Date): TideError {
    return new TideError(
      ErrorCode.CALENDAR_INVALID_TIME_RANGE,
      'Invalid time range for calendar event',
      { start: start.toISOString(), end: end.toISOString() }
    );
  }
}

/**
 * AI error factories
 */
export class AIErrors {
  static rateLimitExceeded(retryAfter?: number): TideError {
    return new TideError(
      ErrorCode.AI_RATE_LIMIT_EXCEEDED,
      'AI service rate limit exceeded',
      { retryAfter }
    );
  }

  static invalidIntent(intent: string): TideError {
    return new TideError(
      ErrorCode.AI_INVALID_INTENT,
      'Unable to determine valid intent from input',
      { intent }
    );
  }

  static generationFailed(reason?: string): TideError {
    return new TideError(
      ErrorCode.AI_GENERATION_FAILED,
      'AI generation failed',
      { reason }
    );
  }

  static contextTooLarge(size: number, maxSize: number): TideError {
    return new TideError(
      ErrorCode.AI_CONTEXT_TOO_LARGE,
      'Context size exceeds maximum allowed',
      { size, maxSize }
    );
  }

  static timeout(operation: string): TideError {
    return new TideError(
      ErrorCode.AI_TIMEOUT,
      'AI operation timed out',
      { operation }
    );
  }

  static quotaExceeded(): TideError {
    return new TideError(
      ErrorCode.AI_QUOTA_EXCEEDED,
      'AI service quota exceeded for this billing period'
    );
  }
}

/**
 * Workflow error factories
 */
export class WorkflowErrors {
  static notFound(workflowId: string): TideError {
    return new TideError(
      ErrorCode.WORKFLOW_NOT_FOUND,
      'Workflow not found',
      { workflowId }
    );
  }

  static executionFailed(workflowId: string, step: number, reason?: string): TideError {
    return new TideError(
      ErrorCode.WORKFLOW_EXECUTION_FAILED,
      'Workflow execution failed',
      { workflowId, step, reason }
    );
  }

  static invalidState(currentState: string, attemptedTransition: string): TideError {
    return new TideError(
      ErrorCode.WORKFLOW_INVALID_STATE,
      'Invalid workflow state transition',
      { currentState, attemptedTransition }
    );
  }

  static timeout(workflowId: string, duration: number): TideError {
    return new TideError(
      ErrorCode.WORKFLOW_TIMEOUT,
      'Workflow execution timed out',
      { workflowId, duration }
    );
  }

  static taskNotFound(taskId: string): TideError {
    return new TideError(
      ErrorCode.TASK_NOT_FOUND,
      'Task not found',
      { taskId }
    );
  }

  static taskAlreadyCompleted(taskId: string): TideError {
    return new TideError(
      ErrorCode.TASK_ALREADY_COMPLETED,
      'Task is already completed',
      { taskId }
    );
  }
}

/**
 * Message error factories
 */
export class MessageErrors {
  static notFound(messageId: string): TideError {
    return new TideError(
      ErrorCode.MESSAGE_NOT_FOUND,
      'Message not found',
      { messageId }
    );
  }

  static sendFailed(reason?: string): TideError {
    return new TideError(
      ErrorCode.MESSAGE_SEND_FAILED,
      'Failed to send message',
      { reason }
    );
  }

  static conversationNotFound(conversationId: string): TideError {
    return new TideError(
      ErrorCode.CONVERSATION_NOT_FOUND,
      'Conversation not found',
      { conversationId }
    );
  }

  static accessDenied(conversationId: string): TideError {
    return new TideError(
      ErrorCode.CONVERSATION_ACCESS_DENIED,
      'You do not have access to this conversation',
      { conversationId }
    );
  }

  static messageTooLarge(size: number, maxSize: number): TideError {
    return new TideError(
      ErrorCode.MESSAGE_TOO_LARGE,
      'Message size exceeds maximum allowed',
      { size, maxSize }
    );
  }
}

/**
 * Integration error factories
 */
export class IntegrationErrors {
  static oauthFailed(provider: string, reason?: string): TideError {
    return new TideError(
      ErrorCode.INTEGRATION_OAUTH_FAILED,
      `OAuth authentication failed for ${provider}`,
      { provider, reason }
    );
  }

  static tokenRefreshFailed(provider: string): TideError {
    return new TideError(
      ErrorCode.INTEGRATION_TOKEN_REFRESH_FAILED,
      `Failed to refresh access token for ${provider}`,
      { provider }
    );
  }

  static providerUnavailable(provider: string): TideError {
    return new TideError(
      ErrorCode.INTEGRATION_PROVIDER_UNAVAILABLE,
      `Integration provider ${provider} is currently unavailable`,
      { provider }
    );
  }

  static rateLimited(provider: string, retryAfter?: number): TideError {
    return new TideError(
      ErrorCode.INTEGRATION_RATE_LIMITED,
      `Rate limited by ${provider}`,
      { provider, retryAfter }
    );
  }
}

/**
 * Database error factories
 */
export class DatabaseErrors {
  static connectionFailed(reason?: string): TideError {
    return new TideError(
      ErrorCode.DATABASE_CONNECTION_FAILED,
      'Database connection failed',
      { reason },
      500,
      false // Not operational
    );
  }

  static queryFailed(query: string, reason?: string): TideError {
    return new TideError(
      ErrorCode.DATABASE_QUERY_FAILED,
      'Database query failed',
      { query: query.substring(0, 100), reason }
    );
  }

  static transactionFailed(reason?: string): TideError {
    return new TideError(
      ErrorCode.DATABASE_TRANSACTION_FAILED,
      'Database transaction failed',
      { reason }
    );
  }

  static constraintViolation(constraint: string): TideError {
    return new TideError(
      ErrorCode.DATABASE_CONSTRAINT_VIOLATION,
      'Database constraint violation',
      { constraint }
    );
  }

  static timeout(query: string, timeout: number): TideError {
    return new TideError(
      ErrorCode.DATABASE_TIMEOUT,
      'Database query timed out',
      { query: query.substring(0, 100), timeout }
    );
  }
}

/**
 * System error factories
 */
export class SystemErrors {
  static internalError(message: string, details?: any): TideError {
    return new TideError(
      ErrorCode.INTERNAL_ERROR,
      message,
      details,
      500,
      false // Not operational
    );
  }

  static serviceUnavailable(service: string): TideError {
    return new TideError(
      ErrorCode.SERVICE_UNAVAILABLE,
      `Service ${service} is currently unavailable`,
      { service }
    );
  }

  static timeout(operation: string, timeout: number): TideError {
    return new TideError(
      ErrorCode.SERVICE_TIMEOUT,
      'Operation timed out',
      { operation, timeout }
    );
  }

  static validationFailed(errors: any): TideError {
    return new TideError(
      ErrorCode.VALIDATION_FAILED,
      'Request validation failed',
      { validationErrors: errors }
    );
  }

  static notFound(resource: string, identifier?: string): TideError {
    return new TideError(
      ErrorCode.NOT_FOUND,
      `${resource} not found`,
      { resource, identifier }
    );
  }

  static badRequest(message: string, details?: any): TideError {
    return new TideError(
      ErrorCode.BAD_REQUEST,
      message,
      details
    );
  }

  static forbidden(message: string = 'Access forbidden'): TideError {
    return new TideError(
      ErrorCode.FORBIDDEN,
      message
    );
  }

  static conflict(resource: string, details?: any): TideError {
    return new TideError(
      ErrorCode.CONFLICT,
      `Conflict with existing ${resource}`,
      details
    );
  }

  static tooManyRequests(retryAfter?: number): TideError {
    return new TideError(
      ErrorCode.TOO_MANY_REQUESTS,
      'Too many requests',
      { retryAfter }
    );
  }

  static notImplemented(feature: string): TideError {
    return new TideError(
      ErrorCode.FEATURE_NOT_IMPLEMENTED,
      `Feature not yet implemented: ${feature}`,
      { feature }
    );
  }

  static maintenanceMode(estimatedEnd?: Date): TideError {
    return new TideError(
      ErrorCode.MAINTENANCE_MODE,
      'System is currently in maintenance mode',
      { estimatedEnd: estimatedEnd?.toISOString() }
    );
  }
}
