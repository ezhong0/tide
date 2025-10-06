# Code Quality Standards & Design Principles

## Core Design Principles

### 1. Type Safety First
**Philosophy**: Prevent runtime errors at compile time

```typescript
// ✅ GOOD: Full type safety with Zod
import { z } from 'zod';

const CreateMeetingSchema = z.object({
  userId: z.string().uuid(),
  participant: z.string().email(),
  timeframe: z.enum(['today', 'tomorrow', 'this_week', 'next_week']),
  duration_minutes: z.number().int().min(15).max(480),
  meeting_type: z.enum(['lunch', 'coffee', 'discussion', 'review']).optional()
});

type CreateMeetingInput = z.infer<typeof CreateMeetingSchema>;

async function createMeeting(input: unknown): Promise<Meeting> {
  // Validate and parse - throws if invalid
  const validated = CreateMeetingSchema.parse(input);

  // Now TypeScript knows exact shape
  return await scheduleMeeting(validated);
}

// ❌ BAD: Weak typing
async function createMeeting(input: any) {
  return await scheduleMeeting(input); // No validation, runtime errors
}
```

**Standards**:
- **All external inputs** must be validated with Zod schemas
- **All API responses** must have Zod schemas
- **TypeScript strict mode** enabled in all projects
- **No `any` types** without explicit justification and `// @ts-expect-error` comment
- **No type assertions** (`as Type`) unless absolutely necessary

---

### 2. Functional Core, Imperative Shell
**Philosophy**: Pure functions for logic, side effects at the edges

```typescript
// ✅ GOOD: Pure function for logic
function calculateAvailableSlots(
  events: CalendarEvent[],
  duration: number,
  timeOfDay: TimeOfDay
): TimeSlot[] {
  // Pure logic - no side effects
  const freeSlots = events.reduce((acc, event, idx) => {
    if (idx === 0) return acc;

    const gap = event.start.getTime() - events[idx - 1].end.getTime();
    const gapMinutes = gap / 1000 / 60;

    if (gapMinutes >= duration && isInTimeRange(event.start, timeOfDay)) {
      acc.push({
        start: events[idx - 1].end,
        end: event.start,
        duration: gapMinutes
      });
    }

    return acc;
  }, [] as TimeSlot[]);

  return freeSlots;
}

// Imperative shell - handles I/O
async function findAvailableSlotsForUser(userId: string, params: AvailabilityParams) {
  // Side effect: database read
  const events = await db.calendarEvent.findMany({ where: { userId } });

  // Pure function call
  const slots = calculateAvailableSlots(events, params.duration, params.timeOfDay);

  // Side effect: cache write
  await cache.set(`availability:${userId}`, slots, 300);

  return slots;
}

// ❌ BAD: Side effects mixed with logic
async function calculateAvailableSlots(userId: string) {
  const events = await db.calendarEvent.findMany({ where: { userId } }); // Side effect in "calculation"
  // ... logic mixed with I/O
}
```

**Standards**:
- **Pure functions** for all business logic (calculations, transformations, validations)
- **Side effects** isolated to service layer (I/O, API calls, database)
- **Testability**: Pure functions are easy to test without mocks

---

### 3. Explicit Error Handling
**Philosophy**: Make errors visible, typed, and handleable

```typescript
// ✅ GOOD: Custom error types
export class EmailSendError extends Error {
  constructor(
    message: string,
    public readonly recipient: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'EmailSendError';
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfter: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Result type for operations that can fail
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

async function sendEmail(params: EmailParams): Promise<Result<EmailResult, EmailSendError>> {
  try {
    const result = await gmailAPI.sendEmail(params);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: new EmailSendError(
        'Failed to send email',
        params.to,
        error as Error
      )
    };
  }
}

// Usage
const result = await sendEmail({ to: 'user@example.com', ... });

if (!result.success) {
  // TypeScript knows result.error is EmailSendError
  logger.error('Email send failed', {
    recipient: result.error.recipient,
    cause: result.error.cause
  });

  // Handle gracefully
  await notifyUser('Failed to send email, please try again');
  return;
}

// TypeScript knows result.data is EmailResult
await auditLog.create({ emailId: result.data.messageId });

// ❌ BAD: Silent failures, unclear errors
async function sendEmail(params: any) {
  try {
    return await gmailAPI.sendEmail(params);
  } catch (error) {
    console.error(error); // Lost in logs
    return null; // Caller doesn't know what failed
  }
}
```

**Standards**:
- **Custom error classes** for different failure types
- **No silent failures** - always propagate or handle errors explicitly
- **Result types** for operations with expected failures
- **Error context** - include relevant data (user ID, operation, etc.)
- **Centralized error handling** in Express middleware

---

### 4. Dependency Injection
**Philosophy**: Loose coupling, easy testing, clear dependencies

```typescript
// ✅ GOOD: Dependencies injected
export class CommandProcessorService {
  constructor(
    private readonly speechService: SpeechService,
    private readonly contextEngine: ContextEngine,
    private readonly emailService: EmailService,
    private readonly calendarService: CalendarService,
    private readonly logger: Logger
  ) {}

  async processCommand(userId: string, audio: Buffer): Promise<CommandResult> {
    this.logger.info({ userId }, 'Processing command');

    const transcript = await this.speechService.transcribe(audio);
    const context = await this.contextEngine.getUserContext(userId);
    // ... use injected dependencies
  }
}

// Easy to test with mocks
describe('CommandProcessorService', () => {
  it('should process command', async () => {
    const mockSpeech = { transcribe: jest.fn().mockResolvedValue('test') };
    const mockContext = { getUserContext: jest.fn().mockResolvedValue({}) };
    // ... other mocks

    const service = new CommandProcessorService(
      mockSpeech as any,
      mockContext as any,
      // ...
    );

    await service.processCommand('user-123', Buffer.from('audio'));

    expect(mockSpeech.transcribe).toHaveBeenCalled();
  });
});

// ❌ BAD: Hard-coded dependencies
export class CommandProcessorService {
  async processCommand(userId: string, audio: Buffer) {
    const speechService = new SpeechService(); // Hard to test
    const emailService = new EmailService(); // Tight coupling
    // ...
  }
}
```

**Standards**:
- **Constructor injection** for all service dependencies
- **Interface-based** design where possible
- **Dependency Inversion** - depend on abstractions, not concretions
- **IoC Container** (tsyringe or manual) for dependency management

---

### 5. Immutability & Pure Data Transformations
**Philosophy**: Data in, data out - no mutations

```typescript
// ✅ GOOD: Immutable transformations
function addEventToCalendar(calendar: Calendar, event: CalendarEvent): Calendar {
  return {
    ...calendar,
    events: [...calendar.events, event],
    updatedAt: new Date()
  };
}

function updateUserPreferences(
  user: User,
  updates: Partial<UserPreferences>
): User {
  return {
    ...user,
    preferences: {
      ...user.preferences,
      ...updates
    }
  };
}

// ❌ BAD: Mutations
function addEventToCalendar(calendar: Calendar, event: CalendarEvent) {
  calendar.events.push(event); // Mutation!
  calendar.updatedAt = new Date(); // Mutation!
  return calendar;
}
```

**Standards**:
- **Immutable data structures** - never mutate input parameters
- **Use spread operators** and array methods (map, filter, reduce)
- **Immer** for complex nested updates if needed
- **Const by default** - only use `let` when necessary

---

### 6. Single Responsibility Principle
**Philosophy**: Each module does one thing well

```typescript
// ✅ GOOD: Focused, single-purpose functions
// Email validation
function isValidEmail(email: string): boolean {
  return z.string().email().safeParse(email).success;
}

// Email normalization
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Email extraction from text
function extractEmailsFromText(text: string): string[] {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  return text.match(emailRegex) || [];
}

// Service that coordinates
class EmailValidationService {
  validateAndNormalize(email: string): Result<string, ValidationError> {
    if (!isValidEmail(email)) {
      return { success: false, error: new ValidationError('Invalid email') };
    }

    return { success: true, data: normalizeEmail(email) };
  }
}

// ❌ BAD: God function
function processEmail(email: string, shouldSend: boolean, saveToDb: boolean) {
  // Validates
  if (!email.includes('@')) return null;

  // Normalizes
  email = email.toLowerCase();

  // Sends
  if (shouldSend) {
    sendEmailViaAPI(email);
  }

  // Saves
  if (saveToDb) {
    database.save(email);
  }

  return email;
}
```

**Standards**:
- **One responsibility** per function/class/module
- **Small functions** - aim for < 20 lines
- **Clear naming** that describes the single purpose
- **Composability** - build complex behavior from simple pieces

---

## Code Organization

### Project Structure

```
tide/
├── apps/
│   ├── mobile/                 # React Native app
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── screens/
│   │   │   ├── navigation/
│   │   │   ├── store/
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   └── types/
│   │   └── package.json
│   │
│   ├── web/                    # Next.js web app
│   │   ├── src/
│   │   │   ├── app/           # App router
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   └── types/
│   │   └── package.json
│   │
│   └── api/                    # Backend services
│       ├── src/
│       │   ├── services/
│       │   │   ├── command-processor/
│       │   │   │   ├── index.ts
│       │   │   │   ├── tools.ts
│       │   │   │   └── __tests__/
│       │   │   ├── email/
│       │   │   ├── calendar/
│       │   │   ├── context-engine/
│       │   │   └── learning/
│       │   ├── db/
│       │   │   ├── schema.ts
│       │   │   ├── migrations/
│       │   │   └── seed.ts
│       │   ├── middleware/
│       │   ├── routes/
│       │   ├── utils/
│       │   └── types/
│       └── package.json
│
├── packages/
│   ├── shared-types/          # Shared TypeScript types
│   ├── validation/            # Shared Zod schemas
│   ├── design-system/         # Shared UI components
│   └── config/                # Shared configs (ESLint, TS, etc.)
│
├── docs/                      # Documentation
├── scripts/                   # Build/deploy scripts
├── package.json               # Root package.json (pnpm workspace)
└── pnpm-workspace.yaml
```

### File Naming Conventions

```
# Components (PascalCase)
VoiceInput.tsx
DraftReview.tsx
MeetingCard.tsx

# Services/Utils (camelCase)
commandProcessor.ts
emailService.ts
dateUtils.ts

# Types (PascalCase with .types suffix)
command.types.ts
email.types.ts

# Tests (same name + .test or .spec)
commandProcessor.test.ts
emailService.spec.ts

# Constants (UPPER_SNAKE_CASE file, const exports)
API_ENDPOINTS.ts
ERROR_MESSAGES.ts
```

---

## TypeScript Standards

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"],
      "@tide/types": ["../packages/shared-types/src"],
      "@tide/validation": ["../packages/validation/src"]
    }
  }
}
```

### Type Safety Rules

```typescript
// ✅ Use discriminated unions for state
type CommandState =
  | { status: 'idle' }
  | { status: 'processing'; progress: number }
  | { status: 'success'; result: CommandResult }
  | { status: 'error'; error: Error };

function handleCommand(state: CommandState) {
  switch (state.status) {
    case 'idle':
      // TypeScript knows: no other properties
      break;
    case 'processing':
      // TypeScript knows: has progress
      console.log(state.progress);
      break;
    case 'success':
      // TypeScript knows: has result
      console.log(state.result);
      break;
    case 'error':
      // TypeScript knows: has error
      console.error(state.error);
      break;
  }
}

// ✅ Use branded types for IDs
type UserId = string & { readonly __brand: 'UserId' };
type EmailId = string & { readonly __brand: 'EmailId' };

function createUserId(id: string): UserId {
  return id as UserId;
}

function getUser(id: UserId): Promise<User> { /* ... */ }

const userId = createUserId('123');
const emailId = 'abc' as EmailId;

getUser(userId); // ✅ Works
getUser(emailId); // ❌ Type error - prevents mixing IDs

// ✅ Use const assertions for literal types
const COMMAND_INTENTS = ['schedule_meeting', 'draft_email', 'search'] as const;
type CommandIntent = typeof COMMAND_INTENTS[number];
// Type is: "schedule_meeting" | "draft_email" | "search"
```

---

## Validation with Zod

### Standard Patterns

```typescript
// src/validation/schemas.ts

import { z } from 'zod';

// Reusable primitives
const EmailSchema = z.string().email();
const UUIDSchema = z.string().uuid();
const DateTimeSchema = z.string().datetime();
const UrlSchema = z.string().url();

// Entity schemas
export const UserSchema = z.object({
  id: UUIDSchema,
  email: EmailSchema,
  name: z.string().min(1).max(100),
  createdAt: DateTimeSchema
});

export const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true });
export const UpdateUserSchema = UserSchema.partial().required({ id: true });

// API request/response schemas
export const ScheduleMeetingRequestSchema = z.object({
  participant: EmailSchema,
  timeframe: z.enum(['today', 'tomorrow', 'this_week', 'next_week']),
  duration_minutes: z.number().int().min(15).max(480).default(30),
  meeting_type: z.enum(['lunch', 'coffee', 'discussion']).optional()
});

export const ScheduleMeetingResponseSchema = z.object({
  success: z.boolean(),
  draft: z.object({
    to: EmailSchema,
    subject: z.string(),
    body: z.string(),
    proposed_times: z.array(DateTimeSchema)
  }).optional(),
  error: z.string().optional()
});

// Validation middleware
export function validateRequest<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: result.error.format()
      });
    }

    req.body = result.data; // Now typed!
    next();
  };
}

// Usage in route
app.post('/api/commands/schedule-meeting',
  authenticateRequest,
  validateRequest(ScheduleMeetingRequestSchema),
  async (req, res) => {
    // req.body is now typed as z.infer<typeof ScheduleMeetingRequestSchema>
    const result = await commandProcessor.scheduleMeeting(req.user.id, req.body);

    // Validate response
    const validated = ScheduleMeetingResponseSchema.parse(result);
    res.json(validated);
  }
);
```

---

## Testing Standards

### Unit Tests

```typescript
// src/services/__tests__/calendar.test.ts

import { CalendarService } from '../calendar';
import { mockDeep } from 'jest-mock-extended';

describe('CalendarService', () => {
  let service: CalendarService;
  let mockProvider: jest.Mocked<CalendarProvider>;

  beforeEach(() => {
    mockProvider = mockDeep<CalendarProvider>();
    service = new CalendarService(mockProvider);
  });

  describe('checkAvailability', () => {
    it('should return free slots for given timeframe', async () => {
      const events = [
        { start: new Date('2024-01-15T09:00:00'), end: new Date('2024-01-15T10:00:00') },
        { start: new Date('2024-01-15T14:00:00'), end: new Date('2024-01-15T15:00:00') }
      ];

      mockProvider.getEvents.mockResolvedValue(events);

      const result = await service.checkAvailability('user-123', {
        timeframe: { start: new Date('2024-01-15T08:00:00'), end: new Date('2024-01-15T17:00:00') },
        duration_minutes: 60,
        time_of_day: 'afternoon'
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        start: new Date('2024-01-15T10:00:00'),
        end: new Date('2024-01-15T14:00:00')
      });
    });

    it('should handle no free slots', async () => {
      mockProvider.getEvents.mockResolvedValue([
        { start: new Date('2024-01-15T08:00:00'), end: new Date('2024-01-15T17:00:00') }
      ]);

      const result = await service.checkAvailability('user-123', {
        timeframe: { start: new Date('2024-01-15T08:00:00'), end: new Date('2024-01-15T17:00:00') },
        duration_minutes: 60
      });

      expect(result).toHaveLength(0);
    });
  });
});
```

### Integration Tests

```typescript
// src/__tests__/integration/command-flow.test.ts

import request from 'supertest';
import { app } from '../../app';
import { db } from '../../db';

describe('Command Flow Integration', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Setup test user
    const user = await db.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        emailProvider: 'gmail',
        emailCredentials: { /* test creds */ }
      }
    });

    userId = user.id;
    authToken = generateTestToken(userId);
  });

  afterAll(async () => {
    await db.user.delete({ where: { id: userId } });
  });

  it('should process schedule meeting command end-to-end', async () => {
    const response = await request(app)
      .post('/api/commands')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        transcript: 'Schedule lunch with sarah@example.com next week'
      })
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'pending_approval',
      draft: {
        to: ['sarah@example.com'],
        subject: expect.stringContaining('lunch'),
        body: expect.any(String)
      }
    });

    // Verify database state
    const command = await db.command.findFirst({
      where: { userId, transcript: expect.stringContaining('Schedule lunch') }
    });

    expect(command).toBeDefined();
    expect(command?.status).toBe('pending_approval');
  });
});
```

### E2E Tests

```typescript
// e2e/voice-command-flow.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Voice Command Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword');
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible();
  });

  test('user can schedule meeting via voice command', async ({ page }) => {
    // Start voice input
    await page.click('[data-testid="voice-button"]');
    await expect(page.locator('[data-testid="listening-indicator"]')).toBeVisible();

    // Simulate voice input
    await page.fill('[data-testid="voice-input"]', 'Schedule lunch with Sarah next week');
    await page.click('[data-testid="submit-voice-command"]');

    // Wait for processing
    await expect(page.locator('[data-testid="processing-indicator"]')).toBeVisible();

    // Verify draft shown
    await expect(page.locator('[data-testid="draft-preview"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="draft-recipient"]')).toContainText('Sarah');
    await expect(page.locator('[data-testid="draft-body"]')).toContainText('lunch');

    // Approve and send
    await page.click('[data-testid="approve-button"]');

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('sent');
  });
});
```

### Test Coverage Requirements

- **Unit tests**: 80% coverage minimum
- **Integration tests**: All critical paths
- **E2E tests**: Core user journeys (top 5 features)
- **API tests**: All endpoints with error cases

---

## Linting & Formatting

### ESLint Configuration

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint", "import"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": ["warn", {
      "allowExpressions": true
    }],
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/await-thenable": "error",
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "always",
      "alphabetize": { "order": "asc" }
    }],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### Pre-commit Hooks (Husky)

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm lint-staged
pnpm type-check
pnpm test:changed
```

---

## Documentation Standards

### Code Comments

```typescript
// ✅ GOOD: Document "why", not "what"
/**
 * Calculates available time slots by analyzing calendar events.
 *
 * Uses a gap-finding algorithm to identify free periods between events.
 * Only considers slots within the specified time-of-day range to avoid
 * suggesting early morning or late evening meetings.
 *
 * @param events - Calendar events sorted by start time (must be pre-sorted)
 * @param duration - Required duration in minutes
 * @param timeOfDay - Preferred time range (morning, lunch, afternoon, evening)
 * @returns Array of available time slots matching criteria
 *
 * @example
 * const slots = calculateAvailableSlots(
 *   events,
 *   60, // 1 hour meeting
 *   'afternoon' // Only 12pm-5pm
 * );
 */
function calculateAvailableSlots(
  events: CalendarEvent[],
  duration: number,
  timeOfDay: TimeOfDay
): TimeSlot[] {
  // ...
}

// ❌ BAD: Obvious or redundant comments
// Set the name variable to the user's name
const name = user.name;

// Loop through events
for (const event of events) {
  // ...
}
```

### API Documentation

```typescript
// Use OpenAPI/Swagger annotations
/**
 * @swagger
 * /api/commands:
 *   post:
 *     summary: Process a voice command
 *     description: |
 *       Processes a voice command and returns either a draft for approval
 *       or an executed action result.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transcript:
 *                 type: string
 *                 example: "Schedule lunch with Sarah next week"
 *     responses:
 *       200:
 *         description: Command processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommandResult'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
app.post('/api/commands', ...);
```

---

## Performance Best Practices

### Database Queries

```typescript
// ✅ GOOD: Select only needed fields
const users = await db.user.findMany({
  select: {
    id: true,
    email: true,
    name: true
  },
  where: { active: true }
});

// ❌ BAD: Select everything
const users = await db.user.findMany({
  where: { active: true }
}); // Returns all fields, including sensitive data

// ✅ GOOD: Batch queries
const userIds = ['id1', 'id2', 'id3'];
const users = await db.user.findMany({
  where: { id: { in: userIds } }
});

// ❌ BAD: N+1 queries
for (const userId of userIds) {
  const user = await db.user.findUnique({ where: { id: userId } });
}

// ✅ GOOD: Use database indices
// In migration
await db.schema.createIndex('idx_emails_user_date', {
  table: 'emails',
  columns: ['user_id', 'date']
});

// Query benefits from index
const recentEmails = await db.email.findMany({
  where: { userId, date: { gte: lastWeek } },
  orderBy: { date: 'desc' }
});
```

### Caching Strategy

```typescript
// src/utils/cache.ts

type CacheOptions = {
  ttl: number; // seconds
  prefix?: string;
};

export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  options: CacheOptions
): Promise<T> {
  const cacheKey = options.prefix ? `${options.prefix}:${key}` : key;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as T;
  }

  // Execute function
  const result = await fn();

  // Store in cache
  await redis.setex(cacheKey, options.ttl, JSON.stringify(result));

  return result;
}

// Usage
async function getUserPreferences(userId: string): Promise<UserPreferences> {
  return withCache(
    `user:${userId}:prefs`,
    () => db.userPreferences.findUnique({ where: { userId } }),
    { ttl: 3600 } // 1 hour
  );
}
```

### Async Patterns

```typescript
// ✅ GOOD: Parallel execution when possible
const [user, preferences, recentCommands] = await Promise.all([
  db.user.findUnique({ where: { id: userId } }),
  db.userPreferences.findUnique({ where: { userId } }),
  db.command.findMany({ where: { userId }, take: 10 })
]);

// ❌ BAD: Sequential when not needed
const user = await db.user.findUnique({ where: { id: userId } });
const preferences = await db.userPreferences.findUnique({ where: { userId } });
const recentCommands = await db.command.findMany({ where: { userId }, take: 10 });

// ✅ GOOD: Handle errors in Promise.all
const results = await Promise.allSettled([
  riskyOperation1(),
  riskyOperation2(),
  riskyOperation3()
]);

results.forEach((result, idx) => {
  if (result.status === 'rejected') {
    logger.error(`Operation ${idx} failed`, result.reason);
  }
});
```

---

## Security Best Practices

### Input Sanitization

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML content
function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
}

// Escape SQL-like patterns (if using raw queries)
function escapeLike(str: string): string {
  return str.replace(/[%_]/g, '\\$&');
}

// Validate and sanitize file uploads
async function validateFileUpload(file: File): Promise<void> {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

  if (file.size > MAX_SIZE) {
    throw new ValidationError('File too large');
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ValidationError('Invalid file type');
  }

  // Check magic bytes (actual file type)
  const buffer = await file.arrayBuffer();
  const actual = await fileTypeFromBuffer(buffer);

  if (!actual || !ALLOWED_TYPES.includes(actual.mime)) {
    throw new ValidationError('File type mismatch');
  }
}
```

### Authentication & Authorization

```typescript
// Row-level security check
async function checkEmailAccess(userId: string, emailId: string): Promise<void> {
  const email = await db.email.findUnique({
    where: { id: emailId },
    select: { userId: true }
  });

  if (!email || email.userId !== userId) {
    throw new ForbiddenError('Access denied');
  }
}

// Use in route
app.get('/api/emails/:id', authenticateRequest, async (req, res) => {
  await checkEmailAccess(req.user.id, req.params.id);

  const email = await db.email.findUnique({ where: { id: req.params.id } });
  res.json(email);
});
```

---

## Monitoring & Observability Standards

### Structured Logging

```typescript
// Always use structured logging
logger.info({
  userId: user.id,
  action: 'email_sent',
  recipient: email.to,
  emailId: email.id,
  duration_ms: Date.now() - startTime
}, 'Email sent successfully');

// NOT: logger.info('Email sent to ' + email.to);
```

### Metrics Collection

```typescript
// Instrument key operations
async function processCommand(userId: string, transcript: string): Promise<CommandResult> {
  const startTime = Date.now();
  const timer = commandLatency.startTimer({ intent: 'unknown' });

  try {
    const intent = await classifyIntent(transcript);

    // Update metric with actual intent
    timer({ intent: intent.intent });

    const result = await executeCommand(intent);

    commandsProcessed.inc({ intent: intent.intent, status: 'success' });

    return result;
  } catch (error) {
    commandsProcessed.inc({ intent: 'unknown', status: 'error' });
    throw error;
  }
}
```

---

## Git Workflow

### Commit Messages

```bash
# Format: <type>(<scope>): <subject>

# Types:
# feat: New feature
# fix: Bug fix
# docs: Documentation only
# style: Code style (formatting, no logic change)
# refactor: Code restructuring
# perf: Performance improvement
# test: Adding tests
# chore: Build process, dependencies

# Examples:
git commit -m "feat(command-processor): add meeting scheduling support"
git commit -m "fix(email): handle bounced email errors gracefully"
git commit -m "perf(calendar): optimize availability query with index"
git commit -m "docs(api): add OpenAPI specs for command endpoints"
```

### Branch Naming

```bash
# Format: <type>/<ticket-id>-<short-description>

feature/TIDE-123-voice-command-processing
fix/TIDE-456-email-send-error
refactor/TIDE-789-calendar-service-cleanup
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally

## Related Issues
Closes #123
```

---

## Continuous Improvement

### Code Review Checklist

**Functionality**
- [ ] Code does what it's supposed to do
- [ ] Edge cases handled
- [ ] Error handling implemented

**Code Quality**
- [ ] Follows design principles
- [ ] Type-safe (no `any`)
- [ ] Properly validated (Zod)
- [ ] Well-tested

**Performance**
- [ ] No N+1 queries
- [ ] Caching used appropriately
- [ ] Async operations optimized

**Security**
- [ ] Input sanitized
- [ ] Authorization checks
- [ ] Sensitive data protected

**Maintainability**
- [ ] Clear naming
- [ ] Documented when needed
- [ ] DRY principle followed

### Refactoring Guidelines

**When to Refactor**:
- Code repeated 3+ times
- Function > 50 lines
- Cyclomatic complexity > 10
- Test coverage < 80%
- Performance bottleneck identified

**How to Refactor**:
1. Write tests first (if not existing)
2. Make small, incremental changes
3. Run tests after each change
4. Document breaking changes
5. Update related documentation

---

## Key Metrics to Track

### Code Quality Metrics
- **Type coverage**: 100% (no `any`)
- **Test coverage**: >80% overall, >95% for critical paths
- **Cyclomatic complexity**: <10 per function
- **Code duplication**: <3% (SonarQube)
- **Technical debt**: <5% (SonarQube)

### Performance Metrics
- **API latency (p95)**: <500ms
- **Database query time (p95)**: <100ms
- **Bundle size**: <500KB (web app)
- **App startup time**: <2s (mobile)

### Developer Experience Metrics
- **Build time**: <30s (incremental)
- **Test run time**: <5min (full suite)
- **Time to first PR**: <1 day (new developer)
- **PR review time**: <24 hours (average)
