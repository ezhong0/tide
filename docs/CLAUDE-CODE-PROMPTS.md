# Claude Code Instance Prompts for Tide Development

## Overview

This document contains **copy-paste prompts** for multiple Claude Code instances to work in parallel on the Tide project. Each instance has a specific responsibility and works independently using pre-defined contracts.

**Philosophy**: Contract-first development enables true parallelization. Each Claude instance can work autonomously because all interfaces are defined upfront.

---

## How to Use This Document

### Phase 0: Foundation (Week 1-2)

**Use 1-2 Claude instances** working sequentially on foundation tasks

### Phase 1: Core Modules (Week 3-6)

**Use 5 Claude instances** working in parallel:

1. Email Module Instance
2. Calendar Module Instance
3. AI Module Instance
4. Context Module Instance
5. Mobile Module Instance

### Phase 2: Feature Integration (Week 7-10)

**Use 3 Claude instances** working in parallel on end-to-end features

### Phase 3+: Advanced Features

**Use 4+ Claude instances** for advanced features and polish

---

## Phase 0: Foundation Setup

### Instance 0A: Project Foundation & Database

```markdown
# PROJECT CONTEXT

You are setting up the foundation for "Tide" - an AI-powered email and calendar assistant. This is a production-grade application that will use GPT-5 function calling to help users manage emails and schedule meetings via voice commands.

## YOUR MISSION

Set up the complete project foundation including:

1. Monorepo structure (pnpm workspaces)
2. TypeScript configuration (strict mode)
3. Database schema design and types
4. Development tooling (ESLint, Prettier, Husky)

## PROJECT PHILOSOPHY

- **Think First, Build Better**: Everything is architected before implementation
- **Type Safety First**: Zero `any` types, all inputs/outputs validated with Zod
- **Functional Core, Imperative Shell**: Pure functions for logic, side effects at edges
- **Quality From The Start**: 80%+ test coverage, strict linting, no technical debt

## DETAILED REQUIREMENTS

### 1. Monorepo Structure

Create this exact structure:
```

tide/
├── apps/
│ ├── api/ # Backend Express API
│ ├── mobile/ # React Native (Expo)
│ └── web/ # Next.js web app (future)
├── packages/
│ ├── shared-types/ # TypeScript types shared across all apps
│ ├── validation/ # Zod schemas for validation
│ ├── api-contracts/ # API endpoint contracts
│ ├── mocks/ # Mock implementations for development
│ ├── config/ # Shared configs (ESLint, TS, etc.)
│ └── design-system/ # Shared UI components (future)
├── docs/ # Documentation (already exists)
├── infrastructure/ # Docker, K8s configs (future)
├── scripts/ # Build/deploy scripts
├── .github/
│ └── workflows/ # CI/CD pipelines
├── package.json # Root package.json
├── pnpm-workspace.yaml # Workspace config
├── tsconfig.json # Base TypeScript config
├── .eslintrc.json # ESLint config
├── .prettierrc # Prettier config
└── .gitignore

````

### 2. TypeScript Configuration

**Root tsconfig.json** (strict mode):
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true
  }
}
````

Each app should extend this and add path aliases:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@tide/types": ["../../packages/shared-types/src"],
      "@tide/validation": ["../../packages/validation/src"],
      "@tide/contracts": ["../../packages/api-contracts/src"],
      "@tide/mocks": ["../../packages/mocks/src"]
    }
  }
}
```

### 3. Database Schema

Design ALL tables upfront. Reference `/Users/edwardzhong/Projects/tide/docs/06-data-models-flows.md` for complete schema.

Create these files:

**`packages/shared-types/src/database.types.ts`**:

- Branded types for IDs (UserId, EmailId, etc.)
- TypeScript interfaces for EVERY table row
- Export all types

**Required tables**:

- users
- user_preferences
- commands
- emails
- calendar_events
- drafts
- follow_ups
- contact_preferences
- feedback
- audit_logs

**Critical indices** (document in migration files):

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_emails_user_date ON emails(user_id, date DESC);
CREATE INDEX idx_calendar_user_start ON calendar_events(user_id, start);
CREATE INDEX idx_commands_user_timestamp ON commands(user_id, timestamp DESC);
-- ... all indices from docs/06-data-models-flows.md
```

### 4. Linting & Formatting

**ESLint** (`.eslintrc.json`):

- `@typescript-eslint/no-explicit-any`: "error"
- `@typescript-eslint/no-unused-vars`: "error"
- All strict rules from `/Users/edwardzhong/Projects/tide/docs/05-code-quality-standards.md`

**Prettier** (`.prettierrc`):

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**Husky pre-commit hook**:

```bash
#!/bin/sh
pnpm lint-staged
pnpm type-check
```

### 5. Package.json Scripts

Root `package.json` should have:

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "db:migrate": "pnpm --filter api db:migrate",
    "db:seed": "pnpm --filter api db:seed"
  }
}
```

## SUCCESS CRITERIA

- [ ] Monorepo structure created with all directories
- [ ] TypeScript compiles with zero errors in all packages
- [ ] ESLint runs with zero errors
- [ ] Prettier formats all files
- [ ] Git hooks prevent commits with errors
- [ ] All database types exported from `@tide/types`
- [ ] Database schema documented with ERD diagram (Mermaid)
- [ ] Can run `pnpm install` successfully
- [ ] Can run `pnpm type-check` successfully
- [ ] Can run `pnpm lint` successfully

## DELIVERABLES CHECKLIST

- [ ] Complete directory structure
- [ ] TypeScript configs for all packages
- [ ] ESLint + Prettier configured
- [ ] Husky pre-commit hooks working
- [ ] `packages/shared-types/src/database.types.ts` with all table types
- [ ] Root `package.json` with all scripts
- [ ] `pnpm-workspace.yaml` configured
- [ ] `.gitignore` comprehensive
- [ ] README.md with setup instructions
- [ ] All types exported and importable

## REFERENCE DOCUMENTS

Read these before starting:

- `/Users/edwardzhong/Projects/tide/docs/08-parallelized-roadmap-overview.md`
- `/Users/edwardzhong/Projects/tide/docs/06-data-models-flows.md`
- `/Users/edwardzhong/Projects/tide/docs/05-code-quality-standards.md`

## IMPORTANT NOTES

- Use pnpm (not npm or yarn)
- Node version: 20 LTS
- Zero `any` types allowed
- All database columns should map to TypeScript types
- Use branded types for IDs to prevent mixing
- Follow file naming conventions from code quality standards

Start with creating the directory structure, then TypeScript configs, then database types. Test that everything compiles before moving on.

````

---

### Instance 0B: API Contracts & Mock Services

```markdown
# PROJECT CONTEXT

You are creating the API contracts and mock services for "Tide" - an AI-powered assistant. These contracts enable other Claude instances to work in parallel by providing clear interfaces.

## YOUR MISSION

Define ALL API endpoints upfront using:
1. TypeScript types
2. Zod validation schemas
3. OpenAPI 3.0 specification
4. Mock service implementations

## PREREQUISITES

- Foundation setup complete (Instance 0A finished)
- All database types available in `@tide/types`

## DETAILED REQUIREMENTS

### 1. API Contract Structure

Create contracts for 4 modules:

**Email Module** (`packages/api-contracts/src/email.contracts.ts`):
- POST /api/email/send
- GET /api/email/search
- GET /api/email/:id
- GET /api/email/threads/:threadId
- POST /api/email/oauth/gmail/connect
- POST /api/email/oauth/gmail/callback
- POST /api/email/oauth/outlook/connect
- POST /api/email/oauth/outlook/callback

**Calendar Module** (`packages/api-contracts/src/calendar.contracts.ts`):
- POST /api/calendar/events
- GET /api/calendar/events
- GET /api/calendar/events/:id
- PUT /api/calendar/events/:id
- DELETE /api/calendar/events/:id
- POST /api/calendar/availability
- POST /api/calendar/oauth/google/connect
- POST /api/calendar/oauth/google/callback
- POST /api/calendar/oauth/outlook/connect
- POST /api/calendar/oauth/outlook/callback

**AI Module** (`packages/api-contracts/src/commands.contracts.ts`):
- POST /api/commands
- GET /api/commands/:id
- POST /api/commands/:id/approve
- POST /api/commands/:id/reject
- GET /api/commands

**Context Module** (`packages/api-contracts/src/context.contracts.ts`):
- GET /api/context/user
- GET /api/context/contact/:email
- GET /api/context/patterns/meetings
- POST /api/search/semantic

### 2. Contract Format (Example)

For EACH endpoint, define:

```typescript
import { z } from 'zod';

// Request schema (Zod)
export const SendEmailRequestSchema = z.object({
  to: z.array(z.string().email()),
  cc: z.array(z.string().email()).optional(),
  subject: z.string().min(1).max(200),
  body: z.string().min(1),
  reply_to_thread_id: z.string().optional()
});

// Response schema (Zod)
export const SendEmailResponseSchema = z.object({
  success: z.boolean(),
  message_id: z.string(),
  thread_id: z.string()
});

// Type inference
export type SendEmailRequest = z.infer<typeof SendEmailRequestSchema>;
export type SendEmailResponse = z.infer<typeof SendEmailResponseSchema>;

// Contract object
export const EmailContracts = {
  sendEmail: {
    method: 'POST' as const,
    path: '/api/email/send',
    request: SendEmailRequestSchema,
    response: SendEmailResponseSchema,
    description: 'Send an email via user\'s connected email account'
  },
  // ... all other endpoints
};
````

### 3. Mock Service Implementations

Create mock implementations for EVERY service:

**`packages/mocks/src/email.mocks.ts`**:

```typescript
import type { IEmailProvider } from '@tide/types';

export class MockEmailService implements IEmailProvider {
  async sendEmail(params: SendEmailParams): Promise<EmailResult> {
    // Return realistic mock data
    return {
      success: true,
      messageId: `mock_msg_${Date.now()}`,
      threadId: `mock_thread_${Date.now()}`,
    };
  }

  async searchEmails(query: SearchQuery): Promise<Email[]> {
    // Return mock emails
    return MOCK_EMAIL_DATA.filter(/* apply query */);
  }

  // ... all methods
}

// Realistic mock data
const MOCK_EMAIL_DATA: Email[] = [
  {
    id: 'email-1',
    from: 'sarah@example.com',
    to: ['user@example.com'],
    subject: 'Re: Lunch next week?',
    snippet: 'Tuesday at 12pm works great!',
    date: new Date('2024-01-15T10:00:00Z'),
    // ... complete email object
  },
  // ... 20+ mock emails covering different scenarios
];
```

Similar mocks for:

- Calendar service
- AI service (mock GPT responses)
- Context service

### 4. OpenAPI Spec Generation

Create script to generate OpenAPI 3.0 spec:

**`scripts/generate-openapi.ts`**:

```typescript
import { zodToJsonSchema } from 'zod-to-json-schema';
import fs from 'fs';
import {
  EmailContracts,
  CalendarContracts,
  CommandContracts,
  ContextContracts,
} from '@tide/contracts';

// Generate complete OpenAPI 3.0 spec
// Include all endpoints, request/response schemas, auth
// Write to docs/openapi.json

const spec = {
  openapi: '3.0.0',
  info: {
    /* ... */
  },
  servers: [
    /* dev, staging, prod */
  ],
  paths: {
    /* all endpoints */
  },
  components: {
    schemas: {
      /* all schemas */
    },
    securitySchemes: {
      /* JWT auth */
    },
  },
};

fs.writeFileSync('./docs/openapi.json', JSON.stringify(spec, null, 2));
```

### 5. Contract Tests

Create tests that validate contracts:

```typescript
describe('Email Contracts', () => {
  it('should validate valid send email request', () => {
    const validRequest = {
      to: ['test@example.com'],
      subject: 'Test',
      body: 'Test body',
    };

    const result = EmailContracts.sendEmail.request.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const invalidRequest = {
      to: ['not-an-email'],
      subject: 'Test',
      body: 'Test body',
    };

    const result = EmailContracts.sendEmail.request.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });
});
```

## SUCCESS CRITERIA

- [ ] All 40+ API endpoints defined with Zod schemas
- [ ] OpenAPI 3.0 spec generated and validates
- [ ] Mock services return realistic data
- [ ] Contract tests pass
- [ ] Swagger UI can render the spec
- [ ] All contracts exported from `@tide/contracts`
- [ ] All mocks exported from `@tide/mocks`
- [ ] Type inference works (no manual type definitions)

## DELIVERABLES CHECKLIST

- [ ] `packages/api-contracts/src/email.contracts.ts`
- [ ] `packages/api-contracts/src/calendar.contracts.ts`
- [ ] `packages/api-contracts/src/commands.contracts.ts`
- [ ] `packages/api-contracts/src/context.contracts.ts`
- [ ] `packages/api-contracts/src/index.ts` (exports all)
- [ ] `packages/mocks/src/email.mocks.ts`
- [ ] `packages/mocks/src/calendar.mocks.ts`
- [ ] `packages/mocks/src/ai.mocks.ts`
- [ ] `packages/mocks/src/context.mocks.ts`
- [ ] `packages/mocks/src/index.ts` (exports all)
- [ ] `scripts/generate-openapi.ts`
- [ ] `docs/openapi.json` (generated)
- [ ] Tests for all contracts

## REFERENCE DOCUMENTS

- `/Users/edwardzhong/Projects/tide/docs/08-parallelized-roadmap-overview.md`
- `/Users/edwardzhong/Projects/tide/docs/02-functionality-commands.md` (for function definitions)
- `/Users/edwardzhong/Projects/tide/docs/implementation/phase0-foundation-contracts.md`

## IMPORTANT NOTES

- Every endpoint must have request/response schemas
- Use realistic mock data (don't just return empty objects)
- Mock services should simulate delays: `await new Promise(r => setTimeout(r, 100))`
- Include error scenarios in mocks (e.g., rate limit, not found)
- Validate all contracts compile with TypeScript
- Test that mocks can be imported and used

This is CRITICAL work - all other Claude instances depend on these contracts being complete and correct.

````

---

## Phase 1: Core Modules (Parallel Execution)

### Instance 1: Email Module

```markdown
# YOUR ROLE: Email Module Developer

## PROJECT CONTEXT

You are building the Email Module for Tide - responsible for ALL email operations (Gmail + Outlook). You work INDEPENDENTLY using pre-defined contracts.

## YOUR MISSION

Implement complete email functionality:
1. Gmail OAuth & API integration
2. Outlook OAuth & API integration
3. Email CRUD operations (send, read, search, threads)
4. Real-time webhooks (Gmail Pub/Sub, Outlook webhooks)
5. Email synchronization (initial + incremental)
6. Email service facade (abstracts provider differences)

## MODULE BOUNDARY

You ONLY handle email operations. You do NOT:
- Make AI decisions (that's AI Module)
- Analyze contacts (that's Context Module)
- Manage calendar (that's Calendar Module)

## CONTRACTS YOU MUST IMPLEMENT

Import from `@tide/contracts`:
```typescript
import { EmailContracts } from '@tide/contracts';

// You must implement endpoints matching:
EmailContracts.sendEmail
EmailContracts.searchEmails
EmailContracts.getEmail
EmailContracts.getThread
EmailContracts.gmailConnect
EmailContracts.gmailCallback
EmailContracts.outlookConnect
EmailContracts.outlookCallback
````

## DETAILED REQUIREMENTS

### File Structure to Create

```
apps/api/src/services/email/
├── email.service.ts              # Main facade
├── email-provider.interface.ts   # Interface all providers implement
├── gmail/
│   ├── gmail-oauth.service.ts
│   ├── gmail-provider.service.ts
│   ├── gmail-webhook.service.ts
│   └── __tests__/
├── outlook/
│   ├── outlook-oauth.service.ts
│   ├── outlook-provider.service.ts
│   ├── outlook-webhook.service.ts
│   └── __tests__/
├── email-sync.service.ts
└── __tests__/
    └── email.service.test.ts

apps/api/src/routes/
├── email.routes.ts
├── email-oauth.routes.ts
└── webhooks.routes.ts
```

### 1. Provider Interface (Strategy Pattern)

```typescript
// email-provider.interface.ts
export interface IEmailProvider {
  sendEmail(params: SendEmailParams): Promise<EmailResult>;
  searchEmails(query: SearchQuery): Promise<Email[]>;
  getEmail(messageId: string): Promise<Email>;
  getThread(threadId: string): Promise<EmailThread>;
  setupWebhook(callbackUrl: string): Promise<WebhookInfo>;
}
```

### 2. Gmail Implementation

Reference: `/Users/edwardzhong/Projects/tide/docs/implementation/phase1-module-email.md`

**Gmail OAuth Service**:

- Get auth URL with proper scopes
- Exchange code for tokens (access + refresh)
- Automatic token refresh when expired
- Encrypted storage in database

**Gmail Provider Service**:

- Send email (create MIME message, base64 encode)
- Search emails (build Gmail query string)
- Get email by ID (parse Gmail message format)
- Get thread (fetch all messages in thread)

**Gmail Webhook Service**:

- Set up Google Cloud Pub/Sub
- Watch for new emails
- Handle webhook payload
- Incremental sync using historyId

### 3. Outlook Implementation

Similar to Gmail but using Microsoft Graph API:

- Use `@azure/msal-node` for OAuth
- Use `@microsoft/microsoft-graph-client` for API calls
- Outlook uses delta links for sync (not historyId)

### 4. Email Facade Service

```typescript
// email.service.ts
export class EmailService {
  async sendEmail(userId: string, params: SendEmailParams): Promise<EmailResult> {
    const provider = await this.getProviderForUser(userId);
    const result = await provider.sendEmail(params);

    // Store in database
    await this.storeEmailInDB(userId, result);

    // Create audit log
    await this.createAuditLog(userId, 'email_sent', result.messageId);

    return result;
  }

  private async getProviderForUser(userId: string): Promise<IEmailProvider> {
    const user = await db.user.findUnique({ where: { id: userId } });

    if (user.email_provider === 'gmail') {
      return new GmailProviderService(userId);
    } else if (user.email_provider === 'outlook') {
      return new OutlookProviderService(userId);
    }

    throw new Error('Unsupported email provider');
  }
}
```

### 5. API Routes

```typescript
// email.routes.ts
import { Router } from 'express';
import { EmailService } from '../services/email/email.service';
import { EmailContracts } from '@tide/contracts';

const router = Router();
const emailService = new EmailService();

router.post(
  '/send',
  authenticateRequest,
  validateRequest(EmailContracts.sendEmail.request),
  async (req, res, next) => {
    try {
      const result = await emailService.sendEmail(req.user.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ... all other routes
```

## ENVIRONMENT VARIABLES NEEDED

```env
# Gmail
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/email/oauth/gmail/callback

# Outlook
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_secret
MICROSOFT_REDIRECT_URI=http://localhost:3000/api/email/oauth/outlook/callback

# Google Cloud Pub/Sub (for Gmail webhooks)
GOOGLE_CLOUD_PROJECT=your_project_id
GOOGLE_PUBSUB_TOPIC=tide-gmail-notifications
```

## TESTING REQUIREMENTS

### Unit Tests (85%+ coverage):

```typescript
describe('GmailProviderService', () => {
  it('should send email successfully', async () => {
    // Mock Gmail API
    // Assert MIME message created correctly
    // Assert email stored in DB
  });

  it('should handle rate limiting with exponential backoff', async () => {
    // Mock 429 error
    // Assert retries with backoff
  });
});
```

### Integration Tests:

```typescript
describe('Email API Integration', () => {
  it('should complete OAuth flow', async () => {
    // Test full OAuth flow
    // Assert tokens stored encrypted
  });

  it('should send email via API', async () => {
    // Test API endpoint
    // Assert email sent via Gmail
  });
});
```

## SUCCESS CRITERIA

- [ ] Can authenticate with Gmail (OAuth working)
- [ ] Can authenticate with Outlook (OAuth working)
- [ ] Can send email via both providers
- [ ] Can search emails via both providers
- [ ] Can fetch single email and threads
- [ ] Webhooks trigger on new email
- [ ] Initial sync works (last 30 days)
- [ ] Incremental sync works (webhook-driven)
- [ ] All API contracts implemented
- [ ] 85%+ test coverage
- [ ] Zero `any` types
- [ ] All inputs validated with Zod
- [ ] Error handling comprehensive
- [ ] Logging structured (pino)

## DELIVERABLES CHECKLIST

- [ ] Gmail OAuth service
- [ ] Gmail provider service
- [ ] Gmail webhook service
- [ ] Outlook OAuth service
- [ ] Outlook provider service
- [ ] Outlook webhook service
- [ ] Email facade service
- [ ] Email sync service
- [ ] API routes (all endpoints)
- [ ] Unit tests (85%+ coverage)
- [ ] Integration tests
- [ ] README with OAuth setup instructions

## DEPENDENCIES

**What to use (already implemented)**:

- Database types from `@tide/types`
- API contracts from `@tide/contracts`
- Validation schemas from `@tide/validation`

**What to mock (not your responsibility)**:

- AI services (use `@tide/mocks`)
- Context services (use `@tide/mocks`)
- Calendar services (use `@tide/mocks`)

## REFERENCE DOCUMENTS

- `/Users/edwardzhong/Projects/tide/docs/implementation/phase1-module-email.md` (YOUR DETAILED GUIDE)
- `/Users/edwardzhong/Projects/tide/docs/05-code-quality-standards.md`
- `/Users/edwardzhong/Projects/tide/docs/06-data-models-flows.md`

## IMPORTANT NOTES

- Use Strategy pattern (IEmailProvider interface)
- Encrypt credentials before storing
- Handle token refresh automatically
- Implement exponential backoff for rate limits
- Store all sent/received emails in database
- Use structured logging (include userId, messageId in all logs)
- Follow Gmail/Outlook API best practices
- Test with real Gmail/Outlook accounts (manual testing)

Start with Gmail OAuth, then Gmail provider, then webhooks, then repeat for Outlook. Test each component thoroughly before moving to next.

````

---

### Instance 2: Calendar Module

```markdown
# YOUR ROLE: Calendar Module Developer

## PROJECT CONTEXT

You are building the Calendar Module for Tide - responsible for ALL calendar operations (Google Calendar + Outlook Calendar). You work INDEPENDENTLY using pre-defined contracts.

## YOUR MISSION

Implement complete calendar functionality:
1. Google Calendar OAuth & API integration
2. Outlook Calendar OAuth & API integration
3. Event CRUD operations
4. Availability calculation (free/busy)
5. Meeting scheduling logic
6. Time zone handling
7. Calendar sync

## MODULE BOUNDARY

You ONLY handle calendar operations. You do NOT:
- Send emails (that's Email Module)
- Make AI decisions (that's AI Module)
- Analyze meeting patterns (that's Context Module - though you provide the data)

## CONTRACTS YOU MUST IMPLEMENT

Import from `@tide/contracts`:
```typescript
import { CalendarContracts } from '@tide/contracts';

// You must implement endpoints matching:
CalendarContracts.createEvent
CalendarContracts.getEvents
CalendarContracts.updateEvent
CalendarContracts.deleteEvent
CalendarContracts.checkAvailability
CalendarContracts.googleConnect
CalendarContracts.googleCallback
CalendarContracts.outlookConnect
CalendarContracts.outlookCallback
````

## DETAILED REQUIREMENTS

### File Structure to Create

```
apps/api/src/services/calendar/
├── calendar.service.ts                # Main facade
├── calendar-provider.interface.ts     # Interface
├── availability-calculator.service.ts # Pure logic
├── google/
│   ├── google-calendar-oauth.service.ts
│   ├── google-calendar-provider.service.ts
│   └── __tests__/
├── outlook/
│   ├── outlook-calendar-oauth.service.ts
│   ├── outlook-calendar-provider.service.ts
│   └── __tests__/
└── __tests__/
    ├── calendar.service.test.ts
    └── availability-calculator.test.ts

apps/api/src/routes/
├── calendar.routes.ts
└── calendar-oauth.routes.ts
```

### 1. Provider Interface

```typescript
// calendar-provider.interface.ts
export interface ICalendarProvider {
  // Events
  createEvent(params: CreateEventParams): Promise<CalendarEvent>;
  getEvents(range: DateRange): Promise<CalendarEvent[]>;
  updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent>;
  deleteEvent(eventId: string): Promise<void>;

  // Availability
  getFreeBusy(range: DateRange): Promise<FreeBusyData>;
}
```

### 2. Google Calendar Implementation

**OAuth**:

- Scopes: `https://www.googleapis.com/auth/calendar`
- Same OAuth flow as Gmail (reuse pattern)

**Provider**:

```typescript
async createEvent(params: CreateEventParams): Promise<CalendarEvent> {
  const event = await this.calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: params.title,
      description: params.description,
      start: {
        dateTime: params.start.toISOString(),
        timeZone: params.timezone
      },
      end: {
        dateTime: params.end.toISOString(),
        timeZone: params.timezone
      },
      attendees: params.attendees.map(a => ({ email: a })),
      sendUpdates: params.sendNotifications ? 'all' : 'none'
    }
  });

  return this.parseGoogleEvent(event.data);
}
```

### 3. Availability Calculator (PURE FUNCTION)

This is CRITICAL - must be a pure function with NO side effects:

```typescript
// availability-calculator.service.ts
export class AvailabilityCalculator {
  /**
   * Pure function: Calculate free time slots
   * NO database calls, NO API calls, NO side effects
   */
  calculateFreeSlots(
    events: CalendarEvent[],
    timeframe: Timeframe,
    durationMinutes: number
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const duration = durationMinutes * 60 * 1000; // ms

    // Sort events by start time
    const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

    let currentTime = timeframe.start;

    for (const event of sorted) {
      // Gap before this event
      const gap = event.start.getTime() - currentTime.getTime();

      if (gap >= duration) {
        slots.push({
          start: new Date(currentTime),
          end: new Date(Math.min(event.start.getTime(), currentTime.getTime() + duration)),
          duration: durationMinutes,
        });
      }

      // Move past this event
      currentTime = new Date(Math.max(currentTime.getTime(), event.end.getTime()));
    }

    // Gap after last event
    const finalGap = timeframe.end.getTime() - currentTime.getTime();
    if (finalGap >= duration) {
      slots.push({
        start: new Date(currentTime),
        end: new Date(Math.min(timeframe.end.getTime(), currentTime.getTime() + duration)),
        duration: durationMinutes,
      });
    }

    return this.filterBusinessHours(slots);
  }

  /**
   * Score slots based on preferences
   * Pure function - takes preferences as input
   */
  scoreSlots(slots: TimeSlot[], preferences: MeetingPreferences): ScoredTimeSlot[] {
    return slots
      .map((slot) => {
        let score = 100; // Base score

        const hour = slot.start.getHours();

        // Prefer certain times
        if (preferences.preferredTimes.morning && hour >= 9 && hour < 12) score += 30;
        if (preferences.preferredTimes.lunch && hour >= 12 && hour < 14) score += 30;
        if (preferences.preferredTimes.afternoon && hour >= 14 && hour < 17) score += 30;

        // Prefer on-the-hour
        if (slot.start.getMinutes() === 0) score += 10;
        if (slot.start.getMinutes() === 30) score += 5;

        // Penalize early/late
        if (hour < 9) score -= 15;
        if (hour >= 17) score -= 10;

        return { ...slot, score };
      })
      .sort((a, b) => b.score - a.score);
  }
}
```

### 4. Calendar Facade Service

```typescript
// calendar.service.ts
export class CalendarService {
  constructor(private availabilityCalculator: AvailabilityCalculator) {}

  async checkAvailability(userId: string, params: AvailabilityParams): Promise<TimeSlot[]> {
    // Get user's events (I/O - imperative shell)
    const provider = await this.getProviderForUser(userId);
    const events = await provider.getEvents({
      start: params.timeframe.start,
      end: params.timeframe.end,
    });

    // Get user preferences (I/O)
    const preferences = await this.getUserPreferences(userId);

    // Calculate free slots (pure function - functional core)
    const freeSlots = this.availabilityCalculator.calculateFreeSlots(
      events,
      params.timeframe,
      params.duration
    );

    // Score slots (pure function)
    const scored = this.availabilityCalculator.scoreSlots(freeSlots, preferences);

    // Cache results (I/O)
    await this.cacheAvailability(userId, params, scored);

    return scored.slice(0, params.maxResults || 3);
  }
}
```

## TIME ZONE HANDLING

CRITICAL: All times must be timezone-aware:

```typescript
// Always store in UTC, convert for display
function parseUserTime(timeString: string, userTimezone: string): Date {
  // User says "tomorrow at 2pm"
  // Parse in their timezone, store as UTC
  const zonedTime = parseInTimeZone(timeString, userTimezone);
  return zonedTime; // Date object in UTC
}

// When displaying times
function formatForUser(date: Date, userTimezone: string): string {
  return formatInTimeZone(date, userTimezone, 'PPpp');
}
```

Use `date-fns-tz` library for timezone operations.

## TESTING REQUIREMENTS

### Unit Tests for Pure Functions:

```typescript
describe('AvailabilityCalculator.calculateFreeSlots', () => {
  it('should find gaps between meetings', () => {
    const events = [
      { start: new Date('2024-01-15T09:00:00Z'), end: new Date('2024-01-15T10:00:00Z') },
      { start: new Date('2024-01-15T14:00:00Z'), end: new Date('2024-01-15T15:00:00Z') },
    ];

    const timeframe = {
      start: new Date('2024-01-15T08:00:00Z'),
      end: new Date('2024-01-15T17:00:00Z'),
    };

    const slots = calculator.calculateFreeSlots(events, timeframe, 60);

    expect(slots).toHaveLength(3); // Before first, between, after last
    expect(slots[0].start).toEqual(new Date('2024-01-15T08:00:00Z'));
    expect(slots[1].start).toEqual(new Date('2024-01-15T10:00:00Z'));
  });

  it('should not suggest slots during existing meetings', () => {
    // Test no overlaps
  });

  it('should respect minimum duration', () => {
    // Test small gaps ignored
  });
});
```

### Integration Tests:

```typescript
describe('Calendar API', () => {
  it('should create event via API', async () => {
    const response = await request(app)
      .post('/api/calendar/events')
      .send({
        title: 'Test Meeting',
        start: '2024-01-15T14:00:00Z',
        end: '2024-01-15T15:00:00Z',
        attendees: ['test@example.com'],
      });

    expect(response.status).toBe(200);
    expect(response.body.event_id).toBeDefined();
  });
});
```

## SUCCESS CRITERIA

- [ ] Can authenticate with Google Calendar
- [ ] Can authenticate with Outlook Calendar
- [ ] Can create/read/update/delete events on both
- [ ] Availability calculator is PURE (no side effects)
- [ ] Time zones handled correctly
- [ ] All API contracts implemented
- [ ] 85%+ test coverage
- [ ] Integration tests pass with real calendars

## DELIVERABLES CHECKLIST

- [ ] Google Calendar OAuth service
- [ ] Google Calendar provider service
- [ ] Outlook Calendar OAuth service
- [ ] Outlook Calendar provider service
- [ ] Availability calculator (pure functions)
- [ ] Calendar facade service
- [ ] API routes
- [ ] Unit tests (pure functions 100% coverage)
- [ ] Integration tests
- [ ] Timezone tests

## REFERENCE DOCUMENTS

- `/Users/edwardzhong/Projects/tide/docs/08-parallelized-roadmap-overview.md`
- `/Users/edwardzhong/Projects/tide/docs/05-code-quality-standards.md` (see Functional Core pattern)
- `/Users/edwardzhong/Projects/tide/docs/06-data-models-flows.md`

## IMPORTANT NOTES

- Availability calculator must be PURE FUNCTION
- Test pure functions extensively (easy to test, no mocks needed)
- Handle recurring events properly
- Respect user's working hours preferences
- Cache availability results (invalidate on event changes)
- Use `date-fns` or `date-fns-tz` for date operations
- Never use `Date()` constructor with strings - parse properly

Start with Google Calendar OAuth, then provider, then availability calculator, then Outlook. The availability calculator is the most complex piece - get that right with comprehensive tests.

````

---

### Instance 3: AI Module

```markdown
# YOUR ROLE: AI Module Developer

## PROJECT CONTEXT

You are building the AI Module for Tide - the "brain" that orchestrates all other modules using GPT-5 function calling. This is the MOST CRITICAL module.

## YOUR MISSION

Implement AI intelligence layer:
1. OpenAI GPT-5 integration with retry logic & cost tracking
2. Function/tool definitions (type-safe with Zod)
3. Intent classification (voice/text → structured intent)
4. Function executor (calls other modules)
5. Command orchestrator (parallel/sequential execution)
6. Draft generation (emails, meeting requests)
7. Learning from user feedback

## MODULE BOUNDARY

You ORCHESTRATE other modules but do NOT:
- Send emails directly (call Email Module)
- Create calendar events directly (call Calendar Module)
- Store user context (call Context Module)

## CONTRACTS YOU IMPLEMENT

```typescript
import { CommandContracts } from '@tide/contracts';

CommandContracts.processCommand
CommandContracts.getCommand
CommandContracts.approveCommand
CommandContracts.rejectCommand
CommandContracts.listCommands
````

## DETAILED REQUIREMENTS

### File Structure

```
apps/api/src/services/ai/
├── openai-client.ts                  # OpenAI wrapper with retry
├── intent-classifier.service.ts      # GPT intent classification
├── function-executor.service.ts      # Execute function calls
├── command-orchestrator.service.ts   # Main orchestration
├── draft-generator.service.ts        # Generate email/meeting drafts
├── learning.service.ts               # Learn from feedback
├── tools/
│   ├── definitions.ts                # All tool definitions (Zod)
│   ├── email-tools.ts
│   ├── calendar-tools.ts
│   └── context-tools.ts
└── __tests__/

apps/api/src/routes/
└── commands.routes.ts
```

### 1. OpenAI Client with Cost Tracking

Reference: `/Users/edwardzhong/Projects/tide/docs/implementation/phase1-module-ai.md`

```typescript
// openai-client.ts
export async function callOpenAI<T>(
  userId: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  // Exponential backoff retry
  // Cost tracking (store in database)
  // Logging
  // Error handling
}
```

### 2. Function/Tool Definitions (ALL MUST BE ZOD)

```typescript
// tools/definitions.ts
import { z } from 'zod';

export const SearchEmailToolSchema = z.object({
  type: z.literal('function'),
  function: z.object({
    name: z.literal('search_email'),
    description: z.literal("Search user's emails"),
    parameters: z.object({
      type: z.literal('object'),
      properties: z.object({
        query: z
          .object({
            type: z.literal('string'),
            description: z.literal('Search query'),
          })
          .optional(),
        from: z
          .object({
            type: z.literal('string'),
            description: z.literal('Sender email'),
          })
          .optional(),
        limit: z
          .object({
            type: z.literal('number'),
            description: z.literal('Max results'),
          })
          .optional(),
      }),
    }),
  }),
});

// Define ALL tools:
// - search_email
// - draft_email
// - check_availability
// - create_calendar_event
// - analyze_contact
// - get_meeting_context

export const ALL_TOOLS = [
  SearchEmailToolSchema.parse({
    /* ... */
  }),
  DraftEmailToolSchema.parse({
    /* ... */
  }),
  // ... all tools
];
```

### 3. Intent Classifier

```typescript
// intent-classifier.service.ts
export class IntentClassifierService {
  async classifyIntent(
    userId: string,
    transcript: string,
    userContext: UserContext
  ): Promise<ClassifiedIntent> {
    const systemPrompt = this.buildSystemPrompt(userContext);

    const response = await callOpenAI(userId, 'classify', () =>
      openai.chat.completions.create({
        model: 'gpt-4-turbo-preview', // Use GPT-5 when available
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: transcript },
        ],
        tools: ALL_TOOLS,
        tool_choice: 'auto',
        temperature: 0.3, // Lower for consistent classification
      })
    );

    const toolCalls = response.choices[0].message.tool_calls || [];

    return {
      intent: this.determineIntent(toolCalls),
      confidence: this.calculateConfidence(response),
      toolCalls: toolCalls.map(this.parseToolCall),
      rawResponse: response,
    };
  }

  private buildSystemPrompt(ctx: UserContext): string {
    return `You are Tide, an AI executive assistant.

User: ${ctx.user.name} (${ctx.user.timezone})
Current time: ${new Date().toISOString()}

Recent activity:
${ctx.recentActivity.map((a) => `- ${a.intent}`).join('\n')}

Frequent contacts:
${ctx.frequentContacts.map((c) => c.email).join(', ')}

Understand the user's intent and determine which functions to call.`;
  }
}
```

### 4. Function Executor

```typescript
// function-executor.service.ts
export class FunctionExecutor {
  constructor(
    private emailService: EmailService,
    private calendarService: CalendarService,
    private contextService: ContextService
  ) {}

  async execute(toolCall: ToolCall, userId: string): Promise<ToolResult> {
    const { name, arguments: args } = toolCall;

    switch (name) {
      case 'search_email':
        return this.emailService.searchEmails(userId, args);

      case 'draft_email':
        return this.draftGenerator.draftEmail(userId, args);

      case 'check_availability':
        return this.calendarService.checkAvailability(userId, args);

      case 'create_calendar_event':
        return this.calendarService.createEvent(userId, args);

      case 'analyze_contact':
        return this.contextService.analyzeContact(userId, args.email);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
}
```

### 5. Command Orchestrator (THE BRAIN)

```typescript
// command-orchestrator.service.ts
export class CommandOrchestrator {
  async processCommand(userId: string, transcript: string): Promise<CommandResult> {
    // 1. Store command (status: processing)
    const command = await db.command.create({
      data: {
        user_id: userId,
        transcript,
        status: 'processing',
        timestamp: new Date(),
      },
    });

    try {
      // 2. Get user context
      const context = await this.contextService.getUserContext(userId);

      // 3. Classify intent
      const classified = await this.intentClassifier.classifyIntent(userId, transcript, context);

      // 4. Update command with intent
      await db.command.update({
        where: { id: command.id },
        data: {
          intent: classified.intent,
          intent_data: classified.toolCalls,
        },
      });

      // 5. Analyze dependencies (parallel vs sequential)
      const { parallel, sequential } = this.analyzeDependencies(classified.toolCalls);

      // 6. Execute parallel calls
      const parallelResults = await Promise.all(
        parallel.map((tc) => this.executor.execute(tc, userId))
      );

      // 7. Execute sequential calls
      const sequentialResults = [];
      for (const tc of sequential) {
        const result = await this.executor.execute(tc, userId);
        sequentialResults.push(result);
      }

      const allResults = [...parallelResults, ...sequentialResults];

      // 8. Determine if user approval needed
      if (this.requiresApproval(classified.intent)) {
        // Return draft
        await db.command.update({
          where: { id: command.id },
          data: {
            status: 'pending_approval',
            result: allResults,
          },
        });

        return {
          status: 'pending_approval',
          command_id: command.id,
          draft: allResults.find((r) => r.draft),
        };
      }

      // 9. Auto-execute
      await this.executeActions(allResults, userId);

      await db.command.update({
        where: { id: command.id },
        data: {
          status: 'completed',
          completed_at: new Date(),
        },
      });

      return {
        status: 'completed',
        command_id: command.id,
        message: 'Command executed successfully',
      };
    } catch (error) {
      // Handle error
      await db.command.update({
        where: { id: command.id },
        data: {
          status: 'failed',
          error: error.message,
        },
      });

      throw error;
    }
  }

  private analyzeDependencies(toolCalls: ToolCall[]): {
    parallel: ToolCall[];
    sequential: ToolCall[];
  } {
    // Tools that can run in parallel (no dependencies)
    const parallel = toolCalls.filter((tc) =>
      ['search_email', 'check_availability', 'analyze_contact'].includes(tc.name)
    );

    // Tools that must run sequentially (depend on parallel results)
    const sequential = toolCalls.filter((tc) =>
      ['draft_email', 'create_calendar_event', 'send_email'].includes(tc.name)
    );

    return { parallel, sequential };
  }

  private requiresApproval(intent: string): boolean {
    // Always require approval for actions that represent user externally
    return ['schedule_meeting', 'draft_email', 'send_email'].includes(intent);
  }
}
```

### 6. Draft Generator

```typescript
// draft-generator.service.ts
export class DraftGenerator {
  async draftEmail(userId: string, params: DraftEmailParams): Promise<EmailDraft> {
    // Get contact analysis
    const contactAnalyses = await Promise.all(
      params.recipients.map((email) => this.contextService.analyzeContact(userId, email))
    );

    // Determine tone
    const tone = this.determineTone(contactAnalyses);

    // Generate with GPT
    const draft = await callOpenAI(userId, 'draft_email', () =>
      openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are drafting an email on behalf of the user.

Recipients: ${params.recipients.join(', ')}
Relationship: ${contactAnalyses.map((a) => a.relationshipType).join(', ')}
Tone: ${tone}

Draft a ${tone} email covering these points:
${params.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Be concise, natural, and match the user's communication style.`,
          },
        ],
        temperature: 0.7,
      })
    );

    return {
      to: params.recipients,
      subject: params.subject,
      body: draft.choices[0].message.content,
      tone,
    };
  }
}
```

## TESTING REQUIREMENTS

### Unit Tests (Mock GPT Responses):

```typescript
describe('IntentClassifierService', () => {
  it('should classify meeting scheduling intent', async () => {
    // Mock OpenAI response
    jest.spyOn(openai.chat.completions, 'create').mockResolvedValue({
      choices: [
        {
          message: {
            tool_calls: [
              {
                id: '1',
                type: 'function',
                function: {
                  name: 'check_availability',
                  arguments: JSON.stringify({
                    timeframe: 'next_week',
                    duration_minutes: 60,
                  }),
                },
              },
            ],
          },
        },
      ],
    });

    const result = await classifier.classifyIntent(
      'user-123',
      'Schedule lunch with Sarah next week',
      mockContext
    );

    expect(result.intent).toBe('schedule_meeting');
    expect(result.toolCalls).toHaveLength(1);
  });
});
```

## SUCCESS CRITERIA

- [ ] OpenAI integration working with retry & cost tracking
- [ ] All tools defined in Zod (type-safe)
- [ ] Intent classification accurate (manually test 20+ commands)
- [ ] Function executor calls correct modules
- [ ] Command orchestrator manages full lifecycle
- [ ] Parallel execution working
- [ ] User approval flow working
- [ ] Draft generation matches tone to recipient
- [ ] 80%+ test coverage (with mocked GPT)
- [ ] Cost per command tracked

## DELIVERABLES CHECKLIST

- [ ] OpenAI client with retry/cost tracking
- [ ] All function/tool definitions (Zod)
- [ ] Intent classifier
- [ ] Function executor
- [ ] Command orchestrator
- [ ] Draft generator
- [ ] Learning service
- [ ] API routes
- [ ] Unit tests (mocked GPT)
- [ ] Integration tests

## DEPENDENCIES

**Use real implementations**:

- Email Service (once ready, use mocks until then)
- Calendar Service (once ready, use mocks until then)
- Context Service (once ready, use mocks until then)

**What you provide**:

- Command processing
- Intent classification
- Function orchestration
- Draft generation

## REFERENCE DOCUMENTS

- `/Users/edwardzhong/Projects/tide/docs/implementation/phase1-module-ai.md` (YOUR DETAILED GUIDE)
- `/Users/edwardzhong/Projects/tide/docs/02-functionality-commands.md` (GPT function specs)
- `/Users/edwardzhong/Projects/tide/docs/05-code-quality-standards.md`

## IMPORTANT NOTES

- This is the MOST CRITICAL module - take time to get it right
- Test intent classification with MANY examples
- Handle GPT errors gracefully (sometimes it doesn't return tool calls)
- Track costs carefully (GPT-5 will be expensive)
- Implement request deduplication (user might spam button)
- Log everything (user ID, command ID, intent, tool calls, duration)
- Use lower temperature (0.3) for classification, higher (0.7) for drafting

Start with OpenAI client + cost tracking, then tool definitions, then intent classifier, then executor, finally orchestrator. This is complex - build incrementally and test each piece.

```

---

(Due to length, I'm providing the structure for the remaining instances. Would you like me to continue with instances 4-5 and Phase 2 prompts, or is this sufficient to show the pattern?)
```
