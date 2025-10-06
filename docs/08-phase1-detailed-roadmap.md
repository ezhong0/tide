# Phase 1+ Detailed Implementation Roadmap

## Philosophy Alignment

This roadmap embodies the core philosophy from the README:

**Think First, Build Better**: Each sub-phase is designed with complete architectural clarity before implementation
**Thoroughness Over Speed**: We establish patterns, schemas, and infrastructure properly from day one
**Quality From The Start**: Type safety (Zod), testing, linting, and architectural patterns are built in, not added later
**Ambitious Vision**: We build production-grade systems, not prototypes

**Core Principle**: With AI-assisted development, there's no excuse for technical debt. Every line of code follows best practices, is type-safe, tested, and architecturally sound.

---

## Phase 1 Overview: Foundation + Core Email & Calendar (Weeks 1-6)

**Goal**: Build production-ready foundation with email/calendar integration and basic command processing

**Success Criteria**:
- ✅ Monorepo setup with all tooling configured
- ✅ Type-safe database with migrations and seeders
- ✅ OAuth flows for Gmail/Google Calendar working end-to-end
- ✅ Basic voice command → GPT-5 → function execution works
- ✅ 80%+ test coverage on all services
- ✅ CI/CD pipeline deploying to staging
- ✅ Zero TypeScript `any` types, all inputs/outputs validated with Zod

---

## Phase 1.0: Foundation & Infrastructure (Weeks 1-2)

### Sub-Phase 1.0.A: Monorepo & Development Environment (Days 1-3)
**Owner**: Lead Engineer
**Dependencies**: None
**Can be done in parallel with**: Nothing (foundational)

#### Tasks:

**Day 1: Project Structure Setup**
```bash
# Initialize monorepo
pnpm init
mkdir -p apps/api apps/mobile apps/web packages/{shared-types,validation,config,design-system}

# Setup pnpm workspace
# pnpm-workspace.yaml
```

**Deliverables**:
- [ ] `pnpm-workspace.yaml` configured
- [ ] `.npmrc` with proper settings
- [ ] `.node-version` and `.nvmrc` (Node 20 LTS)
- [ ] Root `package.json` with workspace scripts
- [ ] Directory structure matching architecture doc
- [ ] `.gitignore` comprehensive for Node/TS/IDEs

**Configuration Files to Create**:
```
tide/
├── .gitignore
├── .node-version (20)
├── .nvmrc (20)
├── .npmrc
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json (base)
└── turbo.json (optional: for build caching)
```

**Day 2: TypeScript Configuration**
```json
// Root tsconfig.json (base config)
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

**Deliverables**:
- [ ] Base `tsconfig.json` with strict mode enabled
- [ ] Per-app `tsconfig.json` extending base
- [ ] Path aliases configured (`@tide/types`, `@/services`, etc.)
- [ ] No compilation errors on empty project

**Day 3: Linting, Formatting, Git Hooks**
```bash
# ESLint + Prettier + Husky setup
pnpm add -Dw eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
pnpm add -Dw prettier eslint-config-prettier
pnpm add -Dw husky lint-staged
```

**Deliverables**:
- [ ] `.eslintrc.json` configured with strict rules (no `any`, unused vars, etc.)
- [ ] `.prettierrc` configured (100 char width, single quotes, etc.)
- [ ] `.husky/pre-commit` hook running lint-staged
- [ ] `lint-staged` config in package.json
- [ ] Pre-commit hook running: lint, format, type-check
- [ ] All rules documented in `/docs/05-code-quality-standards.md`

**Testing**: Run `git commit` with intentional errors, verify hooks catch them

---

### Sub-Phase 1.0.B: Shared Packages (Days 2-4)
**Owner**: Lead Engineer
**Dependencies**: 1.0.A (Day 1-2)
**Can be done in parallel with**: 1.0.C, 1.0.D

#### Package: `@tide/shared-types`

**Purpose**: Common TypeScript types shared across all apps

**Files to Create**:
```typescript
// packages/shared-types/src/index.ts
export * from './user.types';
export * from './email.types';
export * from './calendar.types';
export * from './command.types';
export * from './common.types';

// packages/shared-types/src/user.types.ts
export type UserId = string & { readonly __brand: 'UserId' };
export type EmailAddress = string & { readonly __brand: 'EmailAddress' };

export type User = {
  id: UserId;
  email: EmailAddress;
  name: string;
  emailProvider: 'gmail' | 'outlook';
  calendarProvider: 'google' | 'outlook';
  timezone: string;
  createdAt: Date;
  lastActiveAt: Date;
};

export type UserPreferences = {
  id: string;
  userId: UserId;
  defaultTone: 'professional' | 'casual' | 'friendly' | 'formal';
  emailSignature: string;
  autoAcceptMeetings: boolean;
  autoRespondSimple: boolean;
  notificationPreferences: NotificationPreferences;
  vipContacts: VIPContact[];
  createdAt: Date;
  updatedAt: Date;
};

// ... (complete type definitions from data models doc)
```

**Deliverables**:
- [ ] All types from `/docs/06-data-models-flows.md` implemented
- [ ] Branded types for IDs (UserId, EmailId, CommandId, etc.)
- [ ] Discriminated unions for state machines (CommandState, DraftState)
- [ ] JSDoc comments for all exported types
- [ ] `package.json` with proper exports

**Testing**: Import types in API app, verify no compilation errors

---

#### Package: `@tide/validation`

**Purpose**: Zod schemas for all data validation

**Files to Create**:
```typescript
// packages/validation/src/index.ts
export * from './user.schemas';
export * from './email.schemas';
export * from './calendar.schemas';
export * from './command.schemas';
export * from './api.schemas';

// packages/validation/src/user.schemas.ts
import { z } from 'zod';

// Primitives
export const EmailSchema = z.string().email();
export const UUIDSchema = z.string().uuid();
export const TimezoneSchema = z.string().regex(/^[A-Za-z]+\/[A-Za-z_]+$/);

// User schemas
export const UserSchema = z.object({
  id: UUIDSchema,
  email: EmailSchema,
  name: z.string().min(1).max(100),
  emailProvider: z.enum(['gmail', 'outlook']),
  calendarProvider: z.enum(['google', 'outlook']),
  timezone: TimezoneSchema,
  createdAt: z.date(),
  lastActiveAt: z.date()
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  lastActiveAt: true
});

export const UpdateUserSchema = UserSchema.partial().required({ id: true });

// Type inference
export type UserSchemaType = z.infer<typeof UserSchema>;

// ... (complete schemas for all entities)
```

**Best Practices**:
- Reusable primitive schemas (EmailSchema, UUIDSchema, DateTimeSchema)
- `.parse()` for throwing validation, `.safeParse()` for error handling
- Helper functions for transformations (e.g., `parseDate`, `normalizeEmail`)
- Comprehensive error messages

**Deliverables**:
- [ ] Schema for every entity in data models doc
- [ ] API request/response schemas
- [ ] Helper utilities (validators, transformers)
- [ ] 100% type coverage (all schemas export inferred types)

**Testing**: Unit tests for each schema with valid/invalid inputs

---

#### Package: `@tide/config`

**Purpose**: Shared configurations (ESLint, TypeScript, etc.)

**Files to Create**:
```
packages/config/
├── eslint-preset.js      # Shared ESLint config
├── tsconfig.base.json    # Base TS config
├── tsconfig.node.json    # Node-specific
└── tsconfig.react.json   # React-specific
```

**Deliverables**:
- [ ] Shared ESLint preset
- [ ] Shared TypeScript configs
- [ ] Jest config base (if using Jest)

---

### Sub-Phase 1.0.C: Infrastructure Provisioning (Days 3-5)
**Owner**: Senior Engineer / DevOps
**Dependencies**: None (can start immediately)
**Can be done in parallel with**: 1.0.A, 1.0.B

#### Tasks:

**Day 3: Database Setup (PostgreSQL)**

**Decision**: Railway vs AWS RDS vs Supabase
- **Recommendation**: Start with **Supabase** (managed Postgres, built-in auth, good DX)
- **Why**: Fast setup, generous free tier, easy migrations, built-in admin UI
- **Migration path**: Can move to RDS later if needed

**Steps**:
1. Create Supabase project
2. Save connection string to `.env.example`
3. Configure connection pooling (PgBouncer)
4. Set up read replicas (if on paid plan)

**Deliverables**:
- [ ] PostgreSQL 16 database provisioned
- [ ] Connection string saved (encrypted in secrets manager)
- [ ] Database accessible from local dev
- [ ] Admin credentials stored securely
- [ ] Connection pooling configured

**Day 4: Redis Cache Setup**

**Decision**: Upstash vs AWS ElastiCache vs Railway Redis
- **Recommendation**: **Upstash** (serverless Redis, pay-per-request)
- **Why**: Zero infrastructure, instant scaling, generous free tier, REST API

**Steps**:
1. Create Upstash Redis database
2. Save connection URL to `.env.example`
3. Test connection from local

**Deliverables**:
- [ ] Redis 7 instance provisioned
- [ ] Connection URL saved
- [ ] Latency < 50ms from app region
- [ ] Basic key-value test successful

**Day 5: Object Storage (S3)**

**Decision**: AWS S3 vs Cloudflare R2 vs DigitalOcean Spaces
- **Recommendation**: **AWS S3** (industry standard, reliable)
- **Why**: Best compatibility, reliable, pay-per-use, global CDN

**Steps**:
1. Create S3 bucket: `tide-email-attachments-{env}`
2. Create S3 bucket: `tide-email-archives-{env}`
3. Configure bucket policies (private access)
4. Create IAM user with S3 access only
5. Set up lifecycle policies (archive to Glacier after 90 days)

**Deliverables**:
- [ ] S3 buckets created (dev, staging, prod)
- [ ] IAM credentials generated
- [ ] Bucket policies configured (least privilege)
- [ ] CloudFront CDN configured (optional for MVP)
- [ ] Lifecycle policies set up

**Day 5: Monitoring Setup**

**Tools**:
- **Error tracking**: Sentry (free tier)
- **Logging**: Axiom (generous free tier, better than DataDog for startups)
- **Uptime**: BetterStack (free tier)

**Steps**:
1. Create Sentry project
2. Create Axiom account
3. Save API keys

**Deliverables**:
- [ ] Sentry project created
- [ ] Axiom dataset created
- [ ] API keys saved in secrets
- [ ] Basic test event sent to each service

---

### Sub-Phase 1.0.D: Database Schema & ORM Setup (Days 4-6)
**Owner**: Backend Engineer
**Dependencies**: 1.0.C (Database provisioned), 1.0.B (Types & Validation)
**Can be done in parallel with**: 1.0.E

#### ORM Choice: Drizzle vs Prisma

**Decision**: **Drizzle ORM**
**Why**:
- Type-safe without code generation (Prisma requires `prisma generate`)
- Lighter weight, faster
- SQL-like syntax (easier to optimize)
- Better for serverless (no engine)

**Alternative**: Prisma is also excellent, more mature, better docs. Choose based on team preference.

#### Tasks:

**Day 4: Drizzle Setup**

```typescript
// apps/api/src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client);
```

```typescript
// apps/api/src/db/schema.ts
import { pgTable, uuid, text, timestamp, jsonb, boolean, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  emailProvider: text('email_provider').notNull(),
  emailCredentials: jsonb('email_credentials').notNull(), // encrypted
  calendarProvider: text('calendar_provider').notNull(),
  calendarCredentials: jsonb('calendar_credentials').notNull(), // encrypted
  timezone: text('timezone').notNull().default('America/Los_Angeles'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastActiveAt: timestamp('last_active_at').notNull().defaultNow()
});

// ... (complete schema from architecture doc)
```

**Best Practices**:
- One file per entity (users.schema.ts, emails.schema.ts, etc.)
- Use branded types from `@tide/shared-types`
- Add NOT NULL constraints where appropriate
- Use JSONB for flexible data (credentials, metadata)

**Deliverables**:
- [ ] Drizzle installed and configured
- [ ] `schema.ts` with all tables from data models doc
- [ ] Type inference working (TypeScript knows table shapes)
- [ ] No compilation errors

**Day 5: Migrations Setup**

```bash
# Install Drizzle Kit
pnpm add -D drizzle-kit

# Generate initial migration
pnpm drizzle-kit generate:pg --schema=./src/db/schema.ts
```

**Migration Best Practices**:
- Version all migrations in git
- Never edit migrations after they're run in production
- Test migrations on copy of production data
- Include rollback migrations

**Deliverables**:
- [ ] `drizzle.config.ts` configured
- [ ] Initial migration generated (`0000_initial.sql`)
- [ ] Migration applied to dev database
- [ ] All tables exist in database
- [ ] Script to apply migrations: `pnpm db:migrate`

**Day 6: Database Indices & Seeder**

```sql
-- migrations/0001_indices.sql

-- Critical indices from data models doc
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_emails_user_date ON emails(user_id, date DESC);
CREATE INDEX idx_emails_thread ON emails(thread_id);
CREATE INDEX idx_calendar_user_start ON calendar_events(user_id, start);
CREATE INDEX idx_commands_user_timestamp ON commands(user_id, timestamp DESC);
CREATE INDEX idx_followups_due ON follow_ups(user_id, follow_up_at) WHERE status = 'active';
```

**Seeder for Development**:
```typescript
// apps/api/src/db/seed.ts
import { db } from './index';
import { users, userPreferences } from './schema';
import { encryptCredentials } from '../utils/encryption';

export async function seed() {
  // Create test user
  const [user] = await db.insert(users).values({
    email: 'test@example.com',
    name: 'Test User',
    emailProvider: 'gmail',
    emailCredentials: encryptCredentials({
      accessToken: 'mock_token',
      refreshToken: 'mock_refresh',
      expiresAt: new Date(Date.now() + 3600000),
      scope: ['https://www.googleapis.com/auth/gmail.modify']
    }),
    calendarProvider: 'google',
    calendarCredentials: encryptCredentials({
      accessToken: 'mock_token',
      refreshToken: 'mock_refresh',
      expiresAt: new Date(Date.now() + 3600000),
      scope: ['https://www.googleapis.com/auth/calendar']
    }),
    timezone: 'America/Los_Angeles'
  }).returning();

  // Create preferences
  await db.insert(userPreferences).values({
    userId: user.id,
    defaultTone: 'professional',
    emailSignature: 'Best,\nTest User',
    autoAcceptMeetings: false,
    autoRespondSimple: false,
    notificationPreferences: {
      interruptions: {
        vipEmails: true,
        meetingReminders: true,
        urgentDeadlines: true,
        trackedResponses: true
      },
      batchInterval: 120,
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      }
    },
    vipContacts: []
  });

  console.log('✅ Database seeded');
}
```

**Deliverables**:
- [ ] All critical indices created
- [ ] Seeder script creates valid test data
- [ ] Script to run seeder: `pnpm db:seed`
- [ ] Script to reset database: `pnpm db:reset` (drop, migrate, seed)

**Testing**: Run `pnpm db:reset`, verify all tables and indices exist

---

### Sub-Phase 1.0.E: API Server Boilerplate (Days 5-7)
**Owner**: Backend Engineer
**Dependencies**: 1.0.B (Shared packages), 1.0.D (Database)
**Can be done in parallel with**: 1.0.D (days 4-5)

#### Framework Choice: Express vs Fastify vs Hono

**Decision**: **Express.js**
**Why**:
- Most mature ecosystem
- GPT-5 has extensive training data on Express
- Easy to find help/examples
- Plenty of middleware

**Alternative**: Fastify is faster but less ecosystem. Choose based on team preference.

#### Tasks:

**Day 5: Express Setup**

```typescript
// apps/api/src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS
app.use(express.json()); // Body parser
app.use(requestLogger); // Log all requests

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/commands', commandRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/calendar', calendarRoutes);

// Error handling (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
```

**Deliverables**:
- [ ] Express server starts on port 3000
- [ ] `/health` endpoint returns 200
- [ ] Middleware configured (helmet, cors, body-parser)
- [ ] Error handling middleware
- [ ] Request logging middleware
- [ ] Graceful shutdown handler

**Day 6: Middleware & Utilities**

**Error Handler**:
```typescript
// apps/api/src/middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import * as Sentry from '@sentry/node';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  logger.error({
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  });

  // Send to Sentry
  Sentry.captureException(error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.format()
    });
  }

  // Handle custom app errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code
    });
  }

  // Generic error
  res.status(500).json({
    error: 'Internal server error'
  });
}
```

**Logger**:
```typescript
// apps/api/src/utils/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label })
  },
  redact: {
    paths: ['email', 'password', 'credentials', 'token', 'accessToken', 'refreshToken'],
    remove: true
  },
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined
});
```

**Deliverables**:
- [ ] Custom error classes (AppError, ValidationError, NotFoundError, etc.)
- [ ] Error handler middleware
- [ ] Request logger middleware (logs method, path, duration, status)
- [ ] Structured logger (pino) with redaction
- [ ] Sentry integration for error tracking

**Day 7: Testing Setup**

**Jest Configuration**:
```typescript
// apps/api/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.types.ts',
    '!src/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

export default config;
```

**Example Test**:
```typescript
// apps/api/src/__tests__/health.test.ts
import request from 'supertest';
import { app } from '../index';

describe('Health Check', () => {
  it('should return 200 OK', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});
```

**Deliverables**:
- [ ] Jest configured
- [ ] Supertest installed for API testing
- [ ] Test for health endpoint
- [ ] Test coverage reporting
- [ ] Script: `pnpm test` runs all tests
- [ ] Script: `pnpm test:coverage` shows coverage report

---

### Sub-Phase 1.0.F: CI/CD Pipeline (Days 6-7)
**Owner**: Senior Engineer / DevOps
**Dependencies**: 1.0.A-E (all previous work)
**Can be done in parallel with**: Nothing (needs working tests)

#### GitHub Actions Setup

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: tide_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check

      - name: Run migrations
        run: pnpm db:migrate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/tide_test

      - name: Run tests
        run: pnpm test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/tide_test
          REDIS_URL: redis://localhost:6379
          NODE_ENV: test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

      - name: Build
        run: pnpm build

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway (Staging)
        run: |
          # Railway deploy commands
          echo "Deploy to staging"
```

**Deliverables**:
- [ ] CI workflow runs on every PR
- [ ] All checks must pass (lint, type-check, tests)
- [ ] Coverage report uploaded to Codecov
- [ ] Staging deployment on merge to `develop`
- [ ] Production deployment on merge to `main`

---

## Phase 1.1: Email Integration (Weeks 3-4, Days 8-21)

### Sub-Phase 1.1.A: Gmail OAuth & API Integration (Days 8-12)
**Owner**: Backend Engineer #1
**Dependencies**: 1.0 (Foundation complete)
**Can be done in parallel with**: 1.1.B (Outlook), 1.2.A (Google Calendar), 1.3.A (GPT-5)

#### Design Decisions:

**OAuth Flow**:
1. User clicks "Connect Gmail" in app
2. Backend generates OAuth URL with state token
3. User redirects to Google consent screen
4. Google redirects back with auth code
5. Backend exchanges code for tokens
6. Backend encrypts and stores tokens
7. Backend syncs initial emails

**Architecture Pattern**: Provider abstraction (Strategy pattern)

```typescript
// apps/api/src/services/email/email-provider.interface.ts
export interface EmailProvider {
  // Authentication
  getOAuthUrl(redirectUri: string, state: string): string;
  exchangeCodeForTokens(code: string, redirectUri: string): Promise<OAuthTokens>;
  refreshAccessToken(refreshToken: string): Promise<OAuthTokens>;

  // Email operations
  sendEmail(params: SendEmailParams): Promise<EmailResult>;
  searchEmails(query: SearchQuery): Promise<Email[]>;
  getEmail(messageId: string): Promise<Email>;
  getThread(threadId: string): Promise<EmailThread>;

  // Real-time
  setupWebhook(callbackUrl: string): Promise<WebhookInfo>;
  parseWebhookPayload(payload: unknown): WebhookEvent;
}
```

#### Tasks:

**Day 8: Google OAuth Setup**

1. Create Google Cloud Project
2. Enable Gmail API and Google Calendar API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs
5. Save client ID/secret in `.env`

```typescript
// apps/api/src/services/email/gmail/oauth.ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GmailOAuth {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  getAuthUrl(state: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      state,
      prompt: 'consent' // Force to get refresh token
    });
  }

  async exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
    const { tokens } = await this.oauth2Client.getToken(code);

    return {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token!,
      expiresAt: new Date(tokens.expiry_date!),
      scope: tokens.scope!.split(' ')
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await this.oauth2Client.refreshAccessToken();

    return {
      accessToken: credentials.access_token!,
      refreshToken: credentials.refresh_token || refreshToken,
      expiresAt: new Date(credentials.expiry_date!),
      scope: credentials.scope!.split(' ')
    };
  }
}
```

**Deliverables**:
- [ ] Google Cloud project created
- [ ] OAuth credentials configured
- [ ] `GmailOAuth` class implemented
- [ ] Unit tests for OAuth flow
- [ ] Integration test (manual): Complete OAuth flow

**Day 9-10: Gmail Provider Implementation**

```typescript
// apps/api/src/services/email/gmail/gmail-provider.ts
import { gmail_v1, google } from 'googleapis';
import { EmailProvider } from '../email-provider.interface';
import { GmailOAuth } from './oauth';

export class GmailProvider implements EmailProvider {
  private gmail: gmail_v1.Gmail;
  private oauth: GmailOAuth;

  constructor(private credentials: OAuthCredentials) {
    this.oauth = new GmailOAuth();
    const auth = new google.auth.OAuth2();
    auth.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken
    });
    this.gmail = google.gmail({ version: 'v1', auth });
  }

  async sendEmail(params: SendEmailParams): Promise<EmailResult> {
    // Create MIME message
    const message = this.createMimeMessage(params);
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    try {
      const result = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedMessage }
      });

      return {
        success: true,
        messageId: result.data.id!,
        threadId: result.data.threadId!
      };
    } catch (error) {
      throw new EmailSendError('Failed to send email', params.to, error as Error);
    }
  }

  async searchEmails(query: SearchQuery): Promise<Email[]> {
    // Build Gmail query string
    const q = this.buildGmailQuery(query);

    const response = await this.gmail.users.messages.list({
      userId: 'me',
      q,
      maxResults: query.limit || 50
    });

    const messages = response.data.messages || [];

    // Fetch full message data in parallel
    const emails = await Promise.all(
      messages.map(msg => this.getEmail(msg.id!))
    );

    return emails;
  }

  async getEmail(messageId: string): Promise<Email> {
    const response = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    });

    return this.parseGmailMessage(response.data);
  }

  // ... other methods
}
```

**Best Practices**:
- Use connection pooling
- Implement exponential backoff for rate limits
- Cache frequently accessed data (Redis)
- Handle token refresh automatically
- Graceful degradation on API errors

**Deliverables**:
- [ ] `GmailProvider` class fully implemented
- [ ] All `EmailProvider` interface methods working
- [ ] Rate limiting handled (exponential backoff)
- [ ] Token refresh automatic on expiry
- [ ] Error handling (custom error types)
- [ ] Unit tests (80%+ coverage)
- [ ] Integration tests with Gmail API (manual)

**Day 11: Gmail Webhook Setup (Pub/Sub)**

Gmail uses Google Cloud Pub/Sub for real-time notifications.

```typescript
// apps/api/src/services/email/gmail/webhook.ts
import { google } from 'googleapis';

export class GmailWebhook {
  async setup(userEmail: string, topicName: string): Promise<void> {
    const gmail = google.gmail('v1');

    await gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName: `projects/${process.env.GOOGLE_CLOUD_PROJECT}/topics/${topicName}`,
        labelIds: ['INBOX']
      }
    });
  }

  async handleNotification(pubsubMessage: PubSubMessage): Promise<void> {
    // Decode message
    const data = JSON.parse(
      Buffer.from(pubsubMessage.data, 'base64').toString()
    );

    // Fetch new emails
    const historyId = data.historyId;
    // ... fetch changes since historyId
  }
}
```

**Deliverables**:
- [ ] Google Cloud Pub/Sub topic created
- [ ] Webhook endpoint `/api/webhooks/gmail` implemented
- [ ] Webhook signature verification
- [ ] Handle new email notifications
- [ ] Store history ID for incremental sync

**Day 12: Email Sync Service**

```typescript
// apps/api/src/services/email/email-sync.service.ts
export class EmailSyncService {
  async initialSync(userId: string): Promise<void> {
    const user = await db.user.findUnique({ where: { id: userId } });
    const provider = await this.getProvider(user);

    // Sync last 30 days of emails
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const emails = await provider.searchEmails({
      after: cutoff,
      limit: 500
    });

    // Store in database
    await db.email.createMany({
      data: emails.map(email => ({
        userId: user.id,
        externalId: email.id,
        threadId: email.threadId,
        from: email.from,
        to: email.to,
        subject: email.subject,
        body: email.body,
        snippet: email.snippet,
        direction: email.from === user.email ? 'sent' : 'received',
        date: email.date,
        labels: email.labels,
        isRead: email.isRead,
        indexed: false
      }))
    });

    logger.info({ userId, count: emails.length }, 'Initial email sync complete');
  }

  async incrementalSync(userId: string, historyId: string): Promise<void> {
    // Fetch changes since historyId
    // Update database with new/modified/deleted emails
  }
}
```

**Deliverables**:
- [ ] `EmailSyncService` implemented
- [ ] Initial sync (last 30 days)
- [ ] Incremental sync (webhook-triggered)
- [ ] Background job for periodic sync
- [ ] Progress tracking for long syncs

---

### Sub-Phase 1.1.B: Outlook OAuth & API Integration (Days 8-12)
**Owner**: Backend Engineer #2
**Dependencies**: 1.0 (Foundation complete)
**Can be done in parallel with**: 1.1.A (Gmail), 1.2.B (Outlook Calendar), 1.3.A (GPT-5)

**Note**: This is nearly identical to 1.1.A but uses Microsoft Graph API instead of Gmail API.

#### Tasks:

**Day 8: Microsoft OAuth Setup**

1. Create Azure AD App Registration
2. Add Microsoft Graph API permissions (Mail.ReadWrite, Mail.Send)
3. Create client secret
4. Save credentials in `.env`

```typescript
// apps/api/src/services/email/outlook/oauth.ts
import { ConfidentialClientApplication } from '@azure/msal-node';

export class OutlookOAuth {
  private msalClient: ConfidentialClientApplication;

  constructor() {
    this.msalClient = new ConfidentialClientApplication({
      auth: {
        clientId: process.env.MICROSOFT_CLIENT_ID!,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
        authority: 'https://login.microsoftonline.com/common'
      }
    });
  }

  getAuthUrl(state: string): string {
    return this.msalClient.getAuthCodeUrl({
      scopes: [
        'https://graph.microsoft.com/Mail.ReadWrite',
        'https://graph.microsoft.com/Mail.Send',
        'https://graph.microsoft.com/User.Read'
      ],
      redirectUri: process.env.MICROSOFT_REDIRECT_URI!,
      state
    });
  }

  async exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
    const response = await this.msalClient.acquireTokenByCode({
      code,
      redirectUri: process.env.MICROSOFT_REDIRECT_URI!,
      scopes: ['https://graph.microsoft.com/Mail.ReadWrite']
    });

    return {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken!,
      expiresAt: response.expiresOn!,
      scope: response.scopes
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    const response = await this.msalClient.acquireTokenByRefreshToken({
      refreshToken,
      scopes: ['https://graph.microsoft.com/Mail.ReadWrite']
    });

    return {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken || refreshToken,
      expiresAt: response.expiresOn!,
      scope: response.scopes
    };
  }
}
```

**Day 9-10: Outlook Provider Implementation**

```typescript
// apps/api/src/services/email/outlook/outlook-provider.ts
import { Client } from '@microsoft/microsoft-graph-client';
import { EmailProvider } from '../email-provider.interface';

export class OutlookProvider implements EmailProvider {
  private client: Client;

  constructor(private credentials: OAuthCredentials) {
    this.client = Client.init({
      authProvider: (done) => {
        done(null, credentials.accessToken);
      }
    });
  }

  async sendEmail(params: SendEmailParams): Promise<EmailResult> {
    const message = {
      subject: params.subject,
      body: {
        contentType: 'HTML',
        content: params.body
      },
      toRecipients: params.to.map(email => ({
        emailAddress: { address: email }
      })),
      ccRecipients: params.cc?.map(email => ({
        emailAddress: { address: email }
      }))
    };

    const result = await this.client
      .api('/me/sendMail')
      .post({ message });

    return {
      success: true,
      messageId: result.id,
      threadId: result.conversationId
    };
  }

  // ... other methods similar to Gmail
}
```

**Deliverables**: Same as 1.1.A but for Outlook

---

### Sub-Phase 1.1.C: Email Service Layer & Testing (Days 13-14)
**Owner**: Backend Engineer #1 or #2
**Dependencies**: 1.1.A and 1.1.B complete
**Cannot be done in parallel**: Needs both providers complete

#### Email Service (Facade Pattern)

```typescript
// apps/api/src/services/email/email.service.ts
export class EmailService {
  async getProviderForUser(userId: string): Promise<EmailProvider> {
    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const decryptedCreds = decryptCredentials(user.emailCredentials);

    if (user.emailProvider === 'gmail') {
      return new GmailProvider(decryptedCreds);
    } else if (user.emailProvider === 'outlook') {
      return new OutlookProvider(decryptedCreds);
    }

    throw new Error(`Unsupported email provider: ${user.emailProvider}`);
  }

  async sendEmail(userId: string, params: SendEmailParams): Promise<EmailResult> {
    const provider = await this.getProviderForUser(userId);

    try {
      const result = await provider.sendEmail(params);

      // Audit log
      await db.auditLog.create({
        data: {
          userId,
          action: 'email_sent',
          entityType: 'email',
          entityId: result.messageId,
          metadata: {
            to: params.to,
            subject: params.subject
          }
        }
      });

      return result;
    } catch (error) {
      logger.error({ userId, error }, 'Failed to send email');
      throw error;
    }
  }

  // ... other methods
}
```

**Deliverables**:
- [ ] `EmailService` facade implemented
- [ ] Automatic provider selection based on user
- [ ] Error handling and logging
- [ ] Audit logging for all actions
- [ ] Unit tests with mocked providers
- [ ] Integration tests with real Gmail/Outlook (manual)

---

## Phase 1.2: Calendar Integration (Weeks 3-4, Days 8-21)

**(Same structure as Email Integration, done in parallel)**

### Sub-Phase 1.2.A: Google Calendar OAuth & API (Days 8-12)
**Owner**: Backend Engineer #3
**Dependencies**: 1.0
**Parallel with**: 1.1.A, 1.1.B, 1.3.A

*(Implementation details similar to Gmail, using Google Calendar API)*

### Sub-Phase 1.2.B: Outlook Calendar OAuth & API (Days 8-12)
**Owner**: Backend Engineer #4 (or #2 if same as Outlook email)
**Dependencies**: 1.0
**Parallel with**: 1.1.A, 1.1.B, 1.2.A, 1.3.A

### Sub-Phase 1.2.C: Calendar Service Layer (Days 13-14)
**Owner**: Backend Engineer #3
**Dependencies**: 1.2.A and 1.2.B

```typescript
// apps/api/src/services/calendar/calendar.service.ts
export class CalendarService {
  async checkAvailability(
    userId: string,
    params: AvailabilityParams
  ): Promise<TimeSlot[]> {
    const provider = await this.getProviderForUser(userId);

    const events = await provider.getEvents({
      start: params.timeframe.start,
      end: params.timeframe.end
    });

    // Pure function for calculating free slots
    const freeSlots = calculateFreeSlots(
      events,
      params.duration_minutes,
      params.time_of_day
    );

    return freeSlots;
  }

  async createEvent(
    userId: string,
    params: CreateEventParams
  ): Promise<CalendarEvent> {
    const provider = await this.getProviderForUser(userId);

    const event = await provider.createEvent(params);

    // Store in database
    await db.calendarEvent.create({
      data: {
        userId,
        externalId: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        attendees: event.attendees,
        status: event.status
      }
    });

    // Invalidate cache
    await redis.del(`cal:${userId}:${formatDate(event.start)}`);

    return event;
  }
}
```

---

## Phase 1.3: Command Processor Foundation (Weeks 3-4, Days 8-21)

### Sub-Phase 1.3.A: GPT-5 Integration & Function Calling Setup (Days 8-10)
**Owner**: Backend Engineer #5 (or Senior Engineer)
**Dependencies**: 1.0
**Parallel with**: 1.1.A, 1.1.B, 1.2.A, 1.2.B

#### Tasks:

**Day 8: OpenAI SDK Setup**

```typescript
// apps/api/src/services/ai/openai.client.ts
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID
});

// Rate limiting wrapper
export async function callOpenAI<T>(
  fn: () => Promise<T>,
  retries: number = 3
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error.status === 429 && retries > 0) {
      // Rate limited, exponential backoff
      const delay = Math.pow(2, 4 - retries) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return callOpenAI(fn, retries - 1);
    }
    throw error;
  }
}
```

**Day 9: Function/Tool Definitions (Zod → OpenAI Format)**

```typescript
// apps/api/src/services/command-processor/tools/definitions.ts
import { z } from 'zod';
import { zodToOpenAIFunction } from '../utils/zod-to-openai';

// Zod schema for type safety
export const CheckCalendarSchema = z.object({
  name: z.literal('check_calendar'),
  description: z.literal('Check user calendar for availability'),
  parameters: z.object({
    timeframe: z.enum(['today', 'tomorrow', 'this_week', 'next_week', 'date_range']),
    duration_minutes: z.number().int().min(15).max(480).default(30),
    time_of_day: z.enum(['morning', 'lunch', 'afternoon', 'evening']).optional(),
    date_range: z.object({
      start: z.string().datetime(),
      end: z.string().datetime()
    }).optional()
  })
});

export const DraftEmailSchema = z.object({
  name: z.literal('draft_email'),
  description: z.literal('Draft an email matching user style'),
  parameters: z.object({
    recipients: z.array(z.string().email()),
    message_intent: z.enum(['inform', 'request_meeting', 'provide_update', 'ask_question']),
    key_points: z.array(z.string()),
    tone: z.enum(['professional', 'casual', 'friendly', 'formal']),
    in_reply_to: z.string().optional()
  })
});

// Convert to OpenAI format
export const AVAILABLE_TOOLS = [
  zodToOpenAIFunction(CheckCalendarSchema),
  zodToOpenAIFunction(DraftEmailSchema),
  // ... more tools
];
```

**Utility to convert Zod to OpenAI function format**:
```typescript
// apps/api/src/services/command-processor/utils/zod-to-openai.ts
import { z } from 'zod';

export function zodToOpenAIFunction(schema: z.ZodObject<any>) {
  const { name, description, parameters } = schema.shape;

  return {
    type: 'function',
    function: {
      name: name._def.value,
      description: description._def.value,
      parameters: zodSchemaToJsonSchema(parameters)
    }
  };
}

function zodSchemaToJsonSchema(schema: z.ZodType): any {
  // Convert Zod schema to JSON Schema format
  // (Use zod-to-json-schema library)
}
```

**Day 10: Intent Classification Service**

```typescript
// apps/api/src/services/command-processor/intent-classifier.ts
export class IntentClassifier {
  async classify(transcript: string, userId: string): Promise<ClassifiedIntent> {
    const context = await this.getUserContext(userId);

    const response = await callOpenAI(() =>
      openai.chat.completions.create({
        model: 'gpt-4-turbo-preview', // Use GPT-5 when available
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that classifies user voice commands.

User context:
- Name: ${context.userName}
- Timezone: ${context.timezone}
- Recent contacts: ${context.recentContacts.join(', ')}

Analyze the command and determine the intent, entities, and required actions.`
          },
          {
            role: 'user',
            content: transcript
          }
        ],
        tools: AVAILABLE_TOOLS,
        tool_choice: 'auto'
      })
    );

    const toolCalls = response.choices[0].message.tool_calls || [];

    return {
      intent: this.determineIntent(toolCalls),
      confidence: this.calculateConfidence(response),
      toolCalls: toolCalls.map(call => ({
        name: call.function.name,
        arguments: JSON.parse(call.function.arguments)
      })),
      rawResponse: response
    };
  }

  private async getUserContext(userId: string): Promise<UserContext> {
    // Fetch user data, preferences, recent activity
    const user = await db.user.findUnique({ where: { id: userId } });
    const recentCommands = await db.command.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 5
    });

    return {
      userName: user.name,
      timezone: user.timezone,
      recentContacts: [], // TODO: implement
      recentActivity: recentCommands
    };
  }
}
```

**Deliverables**:
- [ ] OpenAI client configured
- [ ] Function definitions in Zod (type-safe)
- [ ] Conversion utility: Zod → OpenAI function format
- [ ] Intent classifier using GPT-4
- [ ] User context retrieval
- [ ] Error handling for API failures
- [ ] Unit tests with mocked OpenAI responses

---

### Sub-Phase 1.3.B: Function Executor (Days 11-14)
**Owner**: Backend Engineer #5
**Dependencies**: 1.3.A, 1.1.C (Email), 1.2.C (Calendar)
**Parallel with**: Nothing (needs email/calendar services)

```typescript
// apps/api/src/services/command-processor/function-executor.ts
export class FunctionExecutor {
  constructor(
    private emailService: EmailService,
    private calendarService: CalendarService,
    private contextEngine: ContextEngine
  ) {}

  async execute(
    toolCall: ToolCall,
    userId: string
  ): Promise<ToolResult> {
    const { name, arguments: args } = toolCall;

    switch (name) {
      case 'check_calendar':
        return this.checkCalendar(userId, args);

      case 'draft_email':
        return this.draftEmail(userId, args);

      case 'search_email_semantic':
        return this.searchEmail(userId, args);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async checkCalendar(
    userId: string,
    args: CheckCalendarArgs
  ): Promise<AvailabilityResult> {
    const timeframe = this.parseTimeframe(args.timeframe, args.date_range);

    const slots = await this.calendarService.checkAvailability(userId, {
      timeframe,
      duration_minutes: args.duration_minutes,
      time_of_day: args.time_of_day
    });

    return {
      success: true,
      availableSlots: slots
    };
  }

  private async draftEmail(
    userId: string,
    args: DraftEmailArgs
  ): Promise<DraftResult> {
    // Get user's communication style
    const prefs = await db.userPreferences.findUnique({ where: { userId } });

    // Analyze relationship with recipients
    const contactPrefs = await Promise.all(
      args.recipients.map(email =>
        db.contactPreferences.findFirst({
          where: { userId, contactEmail: email }
        })
      )
    );

    // Generate draft using GPT-4
    const draft = await this.generateEmailDraft({
      recipients: args.recipients,
      intent: args.message_intent,
      keyPoints: args.key_points,
      tone: args.tone || contactPrefs[0]?.preferredTone || prefs.defaultTone,
      signature: prefs.emailSignature
    });

    // Store draft
    const draftRecord = await db.draft.create({
      data: {
        userId,
        type: 'email',
        emailDraft: draft,
        status: 'pending_review'
      }
    });

    return {
      success: true,
      draft: draftRecord
    };
  }
}
```

**Deliverables**:
- [ ] Function executor for all defined tools
- [ ] Integration with email service
- [ ] Integration with calendar service
- [ ] Error handling per function
- [ ] Logging for debugging
- [ ] Unit tests (mock services)

---

### Sub-Phase 1.3.C: Command Orchestrator (Days 15-18)
**Owner**: Backend Engineer #5
**Dependencies**: 1.3.B
**Parallel with**: Nothing

**Orchestrates entire command flow**: Voice → Intent → Execute → Draft → User Approval → Action

```typescript
// apps/api/src/services/command-processor/command-orchestrator.ts
export class CommandOrchestrator {
  constructor(
    private intentClassifier: IntentClassifier,
    private functionExecutor: FunctionExecutor
  ) {}

  async processCommand(
    userId: string,
    transcript: string
  ): Promise<CommandResult> {
    // Store command
    const command = await db.command.create({
      data: {
        userId,
        transcript,
        status: 'processing',
        timestamp: new Date()
      }
    });

    try {
      // Classify intent
      const classified = await this.intentClassifier.classify(transcript, userId);

      await db.command.update({
        where: { id: command.id },
        data: {
          intent: classified.intent,
          intentData: classified.toolCalls
        }
      });

      // Determine execution strategy (parallel vs sequential)
      const { parallel, sequential } = this.analyzeDependencies(classified.toolCalls);

      // Execute parallel calls
      const parallelResults = await Promise.all(
        parallel.map(call => this.functionExecutor.execute(call, userId))
      );

      // Execute sequential calls
      const sequentialResults = [];
      for (const call of sequential) {
        const result = await this.functionExecutor.execute(call, userId);
        sequentialResults.push(result);
      }

      const allResults = [...parallelResults, ...sequentialResults];

      // Determine if user approval needed
      const requiresApproval = this.requiresUserApproval(classified.intent);

      if (requiresApproval) {
        // Return draft for approval
        await db.command.update({
          where: { id: command.id },
          data: {
            status: 'pending_approval',
            result: allResults
          }
        });

        return {
          status: 'pending_approval',
          commandId: command.id,
          draft: allResults.find(r => r.draft)
        };
      }

      // Execute immediately (auto-handled)
      await this.executeActions(allResults, userId);

      await db.command.update({
        where: { id: command.id },
        data: {
          status: 'completed',
          completedAt: new Date()
        }
      });

      return {
        status: 'completed',
        commandId: command.id,
        message: 'Command executed successfully'
      };

    } catch (error) {
      await db.command.update({
        where: { id: command.id },
        data: {
          status: 'failed',
          error: {
            message: error.message,
            code: error.code
          }
        }
      });

      throw error;
    }
  }

  private analyzeDependencies(toolCalls: ToolCall[]): {
    parallel: ToolCall[];
    sequential: ToolCall[];
  } {
    // Analyze which calls can run in parallel
    // Example: check_calendar and get_contact_prefs can run in parallel
    //          but draft_email must wait for both

    const parallel = toolCalls.filter(call =>
      ['check_calendar', 'get_contact_prefs', 'search_email'].includes(call.name)
    );

    const sequential = toolCalls.filter(call =>
      ['draft_email', 'send_email', 'create_calendar_event'].includes(call.name)
    );

    return { parallel, sequential };
  }

  private requiresUserApproval(intent: string): boolean {
    // Always require approval for external actions
    return ['schedule_meeting', 'draft_email', 'send_email'].includes(intent);
  }
}
```

**Deliverables**:
- [ ] Full command orchestration
- [ ] Parallel vs sequential execution logic
- [ ] User approval flow
- [ ] Command state management
- [ ] Integration tests (end-to-end command flow)

---

### Sub-Phase 1.3.D: API Endpoints for Commands (Days 19-21)
**Owner**: Backend Engineer #5
**Dependencies**: 1.3.C
**Parallel with**: Nothing

```typescript
// apps/api/src/routes/commands.routes.ts
import { Router } from 'express';
import { authenticateRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { ProcessCommandSchema, ApproveCommandSchema } from '@tide/validation';

const router = Router();

// Process new command
router.post('/',
  authenticateRequest,
  validateRequest(ProcessCommandSchema),
  async (req, res, next) => {
    try {
      const { transcript } = req.body;
      const userId = req.user.id;

      const result = await commandOrchestrator.processCommand(userId, transcript);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Approve command
router.post('/:commandId/approve',
  authenticateRequest,
  validateRequest(ApproveCommandSchema),
  async (req, res, next) => {
    try {
      const { commandId } = req.params;
      const { edits } = req.body;

      const result = await commandOrchestrator.approveCommand(commandId, edits);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Reject command
router.post('/:commandId/reject',
  authenticateRequest,
  async (req, res, next) => {
    try {
      const { commandId } = req.params;

      await db.command.update({
        where: { id: commandId },
        data: { status: 'cancelled' }
      });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
```

**Deliverables**:
- [ ] POST `/api/commands` - Process voice command
- [ ] POST `/api/commands/:id/approve` - Approve draft
- [ ] POST `/api/commands/:id/reject` - Reject draft
- [ ] GET `/api/commands/:id` - Get command status
- [ ] GET `/api/commands` - List user's commands
- [ ] All endpoints validated with Zod
- [ ] All endpoints authenticated
- [ ] Integration tests for all endpoints

---

## Phase 1.4: Integration & Testing (Week 5, Days 22-28)

### Sub-Phase 1.4.A: End-to-End Testing (Days 22-24)
**Owner**: All Engineers
**Dependencies**: All Phase 1 work complete
**Parallel with**: 1.4.B (can test while polishing)

#### Test Scenarios:

**Scenario 1: Schedule Meeting via Voice**
```typescript
// apps/api/src/__tests__/e2e/schedule-meeting.test.ts
describe('Schedule Meeting Flow', () => {
  let testUser: User;

  beforeAll(async () => {
    testUser = await createTestUser();
  });

  it('should schedule meeting end-to-end', async () => {
    // 1. Submit command
    const response1 = await request(app)
      .post('/api/commands')
      .set('Authorization', `Bearer ${testUser.token}`)
      .send({
        transcript: 'Schedule lunch with sarah@example.com next week'
      })
      .expect(200);

    expect(response1.body.status).toBe('pending_approval');
    expect(response1.body.draft).toBeDefined();
    expect(response1.body.draft.emailDraft.to).toContain('sarah@example.com');

    const commandId = response1.body.commandId;

    // 2. Approve draft
    const response2 = await request(app)
      .post(`/api/commands/${commandId}/approve`)
      .set('Authorization', `Bearer ${testUser.token}`)
      .send({ edits: null })
      .expect(200);

    expect(response2.body.success).toBe(true);

    // 3. Verify email sent
    const command = await db.command.findUnique({ where: { id: commandId } });
    expect(command.status).toBe('completed');

    // 4. Verify follow-up created
    const followUp = await db.followUp.findFirst({
      where: { userId: testUser.id }
    });
    expect(followUp).toBeDefined();
  });
});
```

**Test Coverage Goals**:
- [ ] Schedule meeting (end-to-end)
- [ ] Draft email (end-to-end)
- [ ] Search email (end-to-end)
- [ ] Token refresh (OAuth)
- [ ] Error scenarios (API failures, invalid input)
- [ ] Concurrent commands (race conditions)

**Deliverables**:
- [ ] 10+ E2E test scenarios
- [ ] All critical paths covered
- [ ] Performance benchmarks (command latency < 3s)

---

### Sub-Phase 1.4.B: Polish & Bug Fixes (Days 25-28)
**Owner**: All Engineers
**Dependencies**: Testing complete
**Parallel with**: 1.4.A (test while fixing)

**Activities**:
- Fix bugs discovered in testing
- Improve error messages
- Add loading states
- Optimize slow queries
- Refactor duplicated code
- Documentation updates

**Deliverables**:
- [ ] All critical bugs fixed
- [ ] All tests passing
- [ ] Code coverage >80%
- [ ] API documentation complete (Swagger)
- [ ] README updated with setup instructions

---

## Phase 1.5: Mobile App Foundation (Week 6, Days 29-35)

**(Can be done in parallel with backend work if mobile team available)**

### Sub-Phase 1.5.A: React Native Setup (Days 29-30)
**Owner**: Mobile Engineer #1
**Dependencies**: None
**Parallel with**: All backend work

**Deliverables**:
- [ ] Expo app initialized
- [ ] Navigation setup (React Navigation)
- [ ] Authentication screens (OAuth webview)
- [ ] Basic UI components (Button, Input, Card)
- [ ] State management (Zustand)

### Sub-Phase 1.5.B: Voice Input (Days 31-32)
**Owner**: Mobile Engineer #1
**Dependencies**: 1.5.A
**Parallel with**: Backend work

**Deliverables**:
- [ ] Voice recording (expo-av)
- [ ] Speech-to-text (device STT or Deepgram)
- [ ] Voice input UI (animated waveform)
- [ ] Send to API endpoint

### Sub-Phase 1.5.C: Draft Review UI (Days 33-35)
**Owner**: Mobile Engineer #2 (or #1)
**Dependencies**: 1.5.A, Backend APIs
**Parallel with**: Backend polishing

**Deliverables**:
- [ ] Draft preview screen
- [ ] Edit draft functionality
- [ ] Approve/Reject buttons
- [ ] Real-time command status updates (WebSocket or polling)

---

## Summary: Phase 1+ Parallel Work Streams

### Week 1-2: Foundation (Everyone)
**All hands on deck**: Setup infrastructure, tooling, database, CI/CD

### Week 3-4: Parallel Development (4-5 Engineers)

**Stream 1**: Email Integration (Engineer #1, #2)
- Day 8-12: Gmail OAuth & API (Engineer #1)
- Day 8-12: Outlook OAuth & API (Engineer #2)
- Day 13-14: Email Service Layer (Engineer #1 or #2)

**Stream 2**: Calendar Integration (Engineer #3, #4)
- Day 8-12: Google Calendar (Engineer #3)
- Day 8-12: Outlook Calendar (Engineer #4)
- Day 13-14: Calendar Service Layer (Engineer #3)

**Stream 3**: Command Processor (Engineer #5 / Senior)
- Day 8-10: GPT-5 Integration
- Day 11-14: Function Executor (needs Stream 1 & 2)
- Day 15-18: Command Orchestrator
- Day 19-21: API Endpoints

**Stream 4**: Mobile (Mobile Engineer, if available)
- Day 8-35: Mobile app foundation (can work independently)

### Week 5: Integration & Testing (All)
- Day 22-24: E2E testing
- Day 25-28: Bug fixes, polish

### Week 6: Mobile Integration (Mobile Team)
- Connect mobile app to backend
- Complete OAuth flows
- Full end-to-end testing

---

## Key Metrics & Success Criteria

### Code Quality
- [ ] 0 TypeScript `any` types
- [ ] 80%+ test coverage (all packages)
- [ ] 0 ESLint errors
- [ ] 100% type safety (all inputs/outputs validated)

### Performance
- [ ] API latency (p95) < 500ms
- [ ] Command processing < 3s end-to-end
- [ ] OAuth flow < 30s start to finish
- [ ] Database query time (p95) < 100ms

### Functionality
- [ ] Gmail OAuth works end-to-end
- [ ] Outlook OAuth works end-to-end
- [ ] Google Calendar OAuth works end-to-end
- [ ] Voice command → email draft → send works
- [ ] Voice command → meeting scheduled works

### Infrastructure
- [ ] CI/CD pipeline deploying to staging on every merge
- [ ] Database migrations automated
- [ ] Monitoring configured (Sentry, Axiom)
- [ ] Secrets management secure

---

## Risk Mitigation

### Technical Risks

**Risk**: Gmail/Outlook API rate limits
**Mitigation**: Implement exponential backoff, caching, user quotas

**Risk**: GPT-5 API cost
**Mitigation**: Cache common patterns, use cheaper models for classification

**Risk**: OAuth token management complexity
**Mitigation**: Use battle-tested libraries, automated refresh, comprehensive testing

**Risk**: Data synchronization issues
**Mitigation**: Use history IDs for incremental sync, webhook validation, idempotent operations

### Team Risks

**Risk**: Too much parallel work, merge conflicts
**Mitigation**: Clear module boundaries, frequent communication, code reviews

**Risk**: Engineers blocked waiting for dependencies
**Mitigation**: Mock interfaces early, parallel work streams, clear APIs

---

## Next Steps After Phase 1

**Phase 2**: Meeting scheduling flow (full end-to-end)
**Phase 3**: Email drafting with learning
**Phase 4**: Context engine & semantic search
**Phase 5**: Auto-response & smart triage

Each phase builds on previous work with same quality standards and parallel execution strategy.
