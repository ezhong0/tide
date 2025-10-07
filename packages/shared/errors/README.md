# @tide/errors

Standardized error handling for the Tide platform.

## Features

- Typed error codes organized by domain
- HTTP status code mapping
- Error factories for common scenarios
- Consistent error response format
- Operational vs non-operational error distinction
- Request ID correlation support

## Installation

```bash
pnpm add @tide/errors
```

## Usage

### Using Error Factories (Recommended)

```typescript
import { AuthErrors, EmailErrors, SystemErrors } from '@tide/errors';

// Authentication errors
throw AuthErrors.invalidCredentials();
throw AuthErrors.tokenExpired();
throw AuthErrors.insufficientPermissions('admin');

// Email errors
throw EmailErrors.notFound('email_123');
throw EmailErrors.quotaExceeded(1000);

// System errors
throw SystemErrors.validationFailed(validationErrors);
throw SystemErrors.notFound('User', userId);
```

### Using TideError Directly

```typescript
import { TideError, ErrorCode } from '@tide/errors';

throw new TideError(
  ErrorCode.EMAIL_SEND_FAILED,
  'Failed to send email to recipient',
  { recipient: 'user@example.com', reason: 'SMTP timeout' }
);
```

### Error Response Format

All TideErrors serialize to a consistent JSON format:

```typescript
{
  code: 'EMAIL_2001',
  message: 'Email not found',
  details: { emailId: 'email_123' },
  timestamp: 1234567890000,
  requestId: 'req_abc123',
  stack: '...' // Only in development
}
```

### Express Error Handling

```typescript
import { TideError, toTideError } from '@tide/errors';

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const tideError = toTideError(err);

  // Log error
  logger.error('Request error', {
    error: tideError.toJSON(),
    requestId: req.id
  });

  // Send response
  res.status(tideError.statusCode).json(tideError.toJSON());
});
```

### GraphQL Error Handling

```typescript
import { TideError, toTideError } from '@tide/errors';
import { GraphQLError } from 'graphql';

export function formatGraphQLError(error: GraphQLError) {
  const originalError = error.originalError;
  const tideError = toTideError(originalError);

  return {
    message: tideError.message,
    extensions: {
      code: tideError.code,
      statusCode: tideError.statusCode,
      details: tideError.details,
      timestamp: tideError.timestamp
    }
  };
}
```

### Checking Error Types

```typescript
import { TideError } from '@tide/errors';

try {
  await someOperation();
} catch (error) {
  if (error instanceof TideError) {
    if (error.isRetryable()) {
      // Retry the operation
    }

    if (error.isClientError()) {
      // Client made a mistake
    }

    if (error.isServerError()) {
      // Server-side issue
    }
  }
}
```

## Error Code Ranges

- **1000-1999**: Authentication & Authorization
- **2000-2999**: Email operations
- **3000-3999**: Calendar operations
- **4000-4999**: AI services
- **5000-5999**: Workflow & Tasks
- **6000-6999**: Messages & Conversations
- **7000-7999**: External integrations
- **8000-8999**: Database operations
- **9000-9999**: System & Infrastructure

## Error Factories

### AuthErrors
- `invalidCredentials()`: Wrong email/password
- `tokenExpired()`: JWT expired
- `tokenInvalid()`: Invalid JWT
- `insufficientPermissions(permission?)`: Missing permissions
- `userNotFound(identifier)`: User doesn't exist
- `userAlreadyExists(email)`: Duplicate user
- `verificationRequired()`: Email not verified
- `accountLocked(reason?)`: Account locked

### EmailErrors
- `notFound(emailId)`: Email not found
- `sendFailed(reason?)`: Send operation failed
- `fetchFailed(reason?)`: Fetch operation failed
- `quotaExceeded(limit)`: Email quota exceeded
- `attachmentTooLarge(size, maxSize)`: Attachment size limit

### CalendarErrors
- `eventNotFound(eventId)`: Event not found
- `eventConflict(conflictingEventId)`: Time conflict
- `participantUnavailable(email)`: Participant busy
- `invalidTimeRange(start, end)`: Invalid time range

### AIErrors
- `rateLimitExceeded(retryAfter?)`: Rate limited
- `invalidIntent(intent)`: Cannot determine intent
- `generationFailed(reason?)`: AI generation failed
- `contextTooLarge(size, maxSize)`: Context size limit
- `timeout(operation)`: AI operation timeout
- `quotaExceeded()`: API quota exceeded

### WorkflowErrors
- `notFound(workflowId)`: Workflow not found
- `executionFailed(id, step, reason?)`: Execution failed
- `invalidState(current, attempted)`: Invalid state transition
- `timeout(id, duration)`: Workflow timeout
- `taskNotFound(taskId)`: Task not found
- `taskAlreadyCompleted(taskId)`: Task already done

### MessageErrors
- `notFound(messageId)`: Message not found
- `sendFailed(reason?)`: Send failed
- `conversationNotFound(conversationId)`: Conversation not found
- `accessDenied(conversationId)`: No access to conversation
- `messageTooLarge(size, maxSize)`: Message size limit

### IntegrationErrors
- `oauthFailed(provider, reason?)`: OAuth failed
- `tokenRefreshFailed(provider)`: Token refresh failed
- `providerUnavailable(provider)`: Provider down
- `rateLimited(provider, retryAfter?)`: Provider rate limited

### DatabaseErrors
- `connectionFailed(reason?)`: Connection failed
- `queryFailed(query, reason?)`: Query failed
- `transactionFailed(reason?)`: Transaction failed
- `constraintViolation(constraint)`: Constraint violated
- `timeout(query, timeout)`: Query timeout

### SystemErrors
- `internalError(message, details?)`: Internal error
- `serviceUnavailable(service)`: Service down
- `timeout(operation, timeout)`: Operation timeout
- `validationFailed(errors)`: Validation failed
- `notFound(resource, identifier?)`: Resource not found
- `badRequest(message, details?)`: Bad request
- `forbidden(message?)`: Access forbidden
- `conflict(resource, details?)`: Resource conflict
- `tooManyRequests(retryAfter?)`: Rate limited
- `notImplemented(feature)`: Feature not implemented
- `maintenanceMode(estimatedEnd?)`: Maintenance mode

## Best Practices

1. **Use error factories** instead of creating TideError instances directly
2. **Include relevant details** to help with debugging
3. **Mark non-operational errors** for unexpected failures
4. **Add request IDs** for traceability
5. **Log errors** before throwing them in background operations
6. **Handle retryable errors** with exponential backoff
7. **Return user-friendly messages** (don't expose internal details)

## License

MIT
