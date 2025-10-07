# @tide/validation

Type-safe validation schemas using Zod for the Tide platform.

## Features

- Runtime type validation with Zod
- TypeScript type inference from schemas
- Express middleware for request validation
- Comprehensive schemas for all domain models
- Reusable validation helpers

## Installation

```bash
pnpm add @tide/validation
```

## Usage

### Basic Validation

```typescript
import { validate, UserRegistrationSchema } from '@tide/validation';

const userData = {
  email: 'user@example.com',
  password: 'SecurePass123!',
  firstName: 'John',
  lastName: 'Doe'
};

// Validate and get typed result
const validatedUser = validate(UserRegistrationSchema, userData);
// Type: UserRegistration

// Or catch validation errors
try {
  const result = validate(UserRegistrationSchema, invalidData);
} catch (error) {
  // TideError with validation details
  console.error(error.details.validationErrors);
}
```

### Express Middleware

```typescript
import { validateBody, validateQuery, validateParams } from '@tide/validation';
import { CreateTaskSchema, PaginationSchema } from '@tide/validation';

// Validate request body
app.post('/tasks',
  validateBody(CreateTaskSchema),
  async (req, res) => {
    // req.body is now typed as CreateTask
    const task = await taskService.create(req.body);
    res.json(task);
  }
);

// Validate query parameters
app.get('/tasks',
  validateQuery(PaginationSchema),
  async (req, res) => {
    // req.query is typed as Pagination
    const tasks = await taskService.list(req.query);
    res.json(tasks);
  }
);

// Validate route parameters
app.get('/tasks/:id',
  validateParams(z.object({ id: z.string().uuid() })),
  async (req, res) => {
    const task = await taskService.get(req.params.id);
    res.json(task);
  }
);
```

### Available Schemas

#### User Schemas
```typescript
import {
  UserSchema,
  UserRegistrationSchema,
  UserLoginSchema,
  UserUpdateSchema,
  PasswordResetRequestSchema,
  PasswordResetConfirmSchema
} from '@tide/validation';
```

#### Message Schemas
```typescript
import {
  MessageSchema,
  ConversationSchema,
  CreateMessageSchema,
  CreateConversationSchema,
  AIIntentSchema,
  AIResponseSchema
} from '@tide/validation';
```

#### Email Schemas
```typescript
import {
  EmailSchema,
  SendEmailSchema,
  EmailTriageResultSchema,
  EmailDraftRequestSchema,
  EmailFilterSchema
} from '@tide/validation';
```

#### Calendar Schemas
```typescript
import {
  CalendarEventSchema,
  CreateCalendarEventSchema,
  FindAvailableSlotsSchema,
  CalendarOptimizationSchema,
  MeetingPrepSchema
} from '@tide/validation';
```

#### Task & Workflow Schemas
```typescript
import {
  TaskSchema,
  CreateTaskSchema,
  UpdateTaskSchema,
  WorkflowSchema,
  CreateWorkflowSchema,
  WorkflowPatternSchema
} from '@tide/validation';
```

### GraphQL Integration

```typescript
import { validate, CreateMessageSchema } from '@tide/validation';

const resolvers = {
  Mutation: {
    createMessage: async (_, { input }, context) => {
      // Validate input
      const validatedInput = validate(CreateMessageSchema, input);

      return await messageService.create(validatedInput, context.user);
    }
  }
};
```

### Custom Validation

```typescript
import { z } from 'zod';
import { EmailSchema, UUIDSchema } from '@tide/validation';

// Create custom schemas
const CustomRequestSchema = z.object({
  userId: UUIDSchema,
  email: EmailSchema,
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean()
  })
});

// Use with validation helper
const validated = validate(CustomRequestSchema, data);
```

### Partial Updates

```typescript
import { UserUpdateSchema } from '@tide/validation';

// Update only specific fields
const partialUpdate = {
  profile: {
    firstName: 'Jane'
  }
};

const validated = validate(UserUpdateSchema, partialUpdate);
// Only firstName will be updated
```

### Check Validity Without Throwing

```typescript
import { isValid, getValidationErrors, EmailSchema } from '@tide/validation';

// Check if valid
if (isValid(EmailSchema, 'user@example.com')) {
  // Email is valid
}

// Get errors without throwing
const errors = getValidationErrors(EmailSchema, 'invalid-email');
if (errors) {
  console.log(errors.format());
}
```

## Schema Reference

### Base Schemas

- `BaseRequestSchema` - Standard request wrapper
- `BaseResponseSchema` - Standard response wrapper
- `PaginationSchema` - Pagination parameters
- `EmailSchema` - Email address validation
- `UUIDSchema` - UUID validation
- `URLSchema` - URL validation
- `DateTimeSchema` - ISO datetime validation
- `PhoneSchema` - Phone number (E.164 format)

### User Schemas

**UserRegistrationSchema**
```typescript
{
  email: string,
  password: string, // Min 8 chars, uppercase, lowercase, number, special char
  firstName: string,
  lastName: string,
  timezone?: string
}
```

**UserLoginSchema**
```typescript
{
  email: string,
  password: string
}
```

### Message Schemas

**CreateMessageSchema**
```typescript
{
  conversationId: UUID,
  content: string, // Max 10,000 chars
  metadata?: Record<string, any>
}
```

### Email Schemas

**SendEmailSchema**
```typescript
{
  to: Contact[],
  cc?: Contact[],
  bcc?: Contact[],
  subject: string,
  body: string,
  htmlBody?: string,
  priority?: 'low' | 'normal' | 'high' | 'urgent',
  attachments?: Attachment[],
  inReplyTo?: string,
  scheduledAt?: Date
}
```

### Calendar Schemas

**CreateCalendarEventSchema**
```typescript
{
  title: string,
  description?: string,
  start: Date,
  end: Date, // Must be after start
  allDay?: boolean,
  attendees?: Contact[],
  location?: string,
  virtualMeetingUrl?: URL,
  meetingType?: 'internal' | 'external' | 'one-on-one' | 'board' | 'team' | 'client',
  reminders?: Reminder[],
  recurrence?: RecurrenceRule
}
```

### Task Schemas

**CreateTaskSchema**
```typescript
{
  title: string,
  description?: string,
  priority?: 'low' | 'normal' | 'high' | 'urgent',
  assignee?: UUID,
  dueDate?: Date,
  estimatedMinutes?: number,
  tags?: string[],
  workflowId?: UUID,
  dependencies?: UUID[]
}
```

## Validation Rules

### Password Requirements
- Minimum 8 characters
- Maximum 128 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Email Requirements
- Valid email format per RFC 5322
- Maximum 255 characters

### UUID Requirements
- Valid UUID v4 format

### Phone Requirements
- E.164 international format
- Example: +12125551234

## Error Handling

All validation errors throw `TideError` with code `SYSTEM_9005` (VALIDATION_FAILED) and include detailed error information:

```typescript
{
  code: 'SYSTEM_9005',
  message: 'Request validation failed',
  details: {
    validationErrors: {
      email: {
        _errors: ['Invalid email']
      },
      password: {
        _errors: ['Password must contain at least one uppercase letter']
      }
    }
  }
}
```

## Best Practices

1. **Always validate user input** before processing
2. **Use middleware** for route-level validation
3. **Leverage type inference** from schemas
4. **Create custom schemas** for specific use cases
5. **Validate at service boundaries** (API, GraphQL, events)
6. **Use partial schemas** for update operations
7. **Check validity** before expensive operations

## License

MIT
