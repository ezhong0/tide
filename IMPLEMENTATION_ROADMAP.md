# 🗺️ Comprehensive Implementation Roadmap

**Status**: In Progress (Phase 1 Complete)
**Last Updated**: 2025-01-09
**Timeline**: 4-6 weeks for complete implementation

---

## ✅ Phase 1: Critical Security Fixes (COMPLETED)

### 1.1 Environment Variable Protection ✅
- ✅ Added `.env` to `.gitignore`
- ✅ Created `.env.example` template
- ✅ Created `SECURITY_ALERT.md` with rotation guide
- ⏳ **Action Required**: Manually rotate all exposed credentials (see SECURITY_ALERT.md)

### 1.2 OAuth Token Encryption ✅
- ✅ Created `@tide/encryption` library with AES-256-GCM
- ✅ Integrated encryption into email service
- ⏳ **Next**: Apply to calendar and workflow services

### 1.3 Security Documentation ✅
- ✅ Comprehensive credential rotation guide
- ✅ Git history cleanup instructions
- ✅ Long-term security recommendations

---

## 🚀 Phase 2: Input Validation & Authentication (2-3 days)

### 2.1 Add Input Validation to API Endpoints

**Status**: Not Started
**Priority**: 🔴 CRITICAL
**Affected Files**: All service endpoints

#### Implementation Tasks:

**Email Service** (`packages/services/email/src/index.ts`):
```typescript
import { z } from 'zod';

// Add validation schemas
const ConnectProviderSchema = z.object({
  userId: z.string().uuid(),
  tokens: z.object({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
    expiresAt: z.date(),
    scope: z.array(z.string()).optional(),
  }),
});

const ComposeRequestSchema = z.object({
  userId: z.string().uuid(),
  recipient: z.string().email(),
  subject: z.string().min(1).max(200),
  body: z.string().max(10000),
  context: z.string().optional(),
});

// Apply to routes
app.post('/connect/:provider', authenticateJWT, async (req, res) => {
  const validated = ConnectProviderSchema.parse(req.body);
  // ... rest of logic
});
```

**Calendar Service** (`packages/services/calendar/src/index.ts`):
```typescript
const MeetingRequestSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  attendees: z.array(z.string().email()).min(1),
  description: z.string().max(5000).optional(),
});
```

**Workflow Service** (`packages/services/workflow/src/index.ts`):
```typescript
const CreateWorkflowSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1).max(100),
  trigger: z.object({
    type: z.enum(['email', 'calendar', 'time', 'webhook']),
    config: z.record(z.any()),
  }),
  actions: z.array(z.object({
    type: z.string(),
    config: z.record(z.any()),
  })),
});
```

**Checklist**:
- [ ] Email service - 7 endpoints
- [ ] Calendar service - 6 endpoints
- [ ] Workflow service - 8 endpoints
- [ ] Gateway service - pass-through validation
- [ ] AI service - 4 endpoints

---

### 2.2 Fix JWT Secret Startup Validation

**Status**: Not Started
**Priority**: 🟠 HIGH
**File**: `packages/services/shared/middleware/auth.ts`

**Current Issue**:
```typescript
// ❌ Validates at request time
const jwtSecret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET;
if (!jwtSecret) {
  console.error('❌ JWT_SECRET not configured');
  return res.status(500).json({ error: 'Internal Server Error' });
}
```

**Fix**:
```typescript
// ✅ Validate at startup
import { z } from 'zod';

const AuthConfigSchema = z.object({
  JWT_SECRET: z.string().min(32),
  SUPABASE_JWT_SECRET: z.string().min(32),
});

// In service initialization
export function initializeAuth() {
  try {
    AuthConfigSchema.parse(process.env);
  } catch (error) {
    logger.error({ error }, 'JWT configuration invalid');
    throw new Error('CRITICAL: JWT_SECRET must be at least 32 characters');
  }
}

// Call in each service's main file
initializeAuth();
```

**Checklist**:
- [ ] Create `initializeAuth()` function
- [ ] Add to email service startup
- [ ] Add to calendar service startup
- [ ] Add to workflow service startup
- [ ] Add to gateway service startup
- [ ] Add to AI service startup

---

### 2.3 Update CORS Configuration

**Status**: Not Started
**Priority**: 🟡 MEDIUM
**File**: `packages/services/gateway/src/index.ts`

**Current Issue**:
```typescript
// ❌ Too permissive
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));
```

**Fix**:
```typescript
// ✅ Strict CORS in production
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];

if (env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  throw new Error('CORS_ORIGIN must be set in production');
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  maxAge: 86400, // 24 hours
}));
```

**Checklist**:
- [ ] Update gateway CORS config
- [ ] Update email service CORS
- [ ] Update calendar service CORS
- [ ] Update workflow service CORS
- [ ] Test with mobile apps

---

## 🔧 Phase 3: Infrastructure Improvements (3-4 days)

### 3.1 Implement Redis-Based Rate Limiting

**Status**: Not Started
**Priority**: 🟠 HIGH
**File**: `packages/services/shared/middleware/rate-limit.ts`

**Current Issue**:
```typescript
// ❌ In-memory rate limiting (doesn't scale)
const rateLimitStore = new Map<string, RateLimitEntry>();
```

**Implementation**:

1. **Install Dependencies**:
```bash
pnpm add rate-limiter-flexible ioredis @types/ioredis
```

2. **Create Redis Rate Limiter**:
```typescript
// packages/services/shared/middleware/redis-rate-limit.ts
import Redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import type { Request, Response, NextFunction } from 'express';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60, // Block for 60 seconds if exceeded
  keyPrefix: 'rate_limit',
});

export const redisRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const key = req.user?.userId || req.ip;
    await rateLimiter.consume(key);
    next();
  } catch (error) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: 60,
    });
  }
};
```

3. **Apply to Services**:
```typescript
// Replace moderateRateLimit with redisRateLimit
import { redisRateLimit } from '@tide/middleware';

app.use(redisRateLimit);
```

**Checklist**:
- [ ] Create Redis rate limiter
- [ ] Add to email service
- [ ] Add to calendar service
- [ ] Add to workflow service
- [ ] Add to gateway service
- [ ] Add to AI service
- [ ] Test rate limiting behavior
- [ ] Deploy Redis to Railway

---

### 3.2 Add Service-to-Service Authentication

**Status**: Not Started
**Priority**: 🟠 HIGH
**Files**: Create new `@tide/service-auth` package

**Implementation**:

1. **Create Service Auth Package**:
```bash
mkdir -p packages/libraries/service-auth/src
```

2. **Implement Service Auth**:
```typescript
// packages/libraries/service-auth/src/index.ts
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

export interface ServiceToken {
  service: string;
  role: 'service';
  iat: number;
  exp: number;
}

export function generateServiceToken(serviceName: string): string {
  const secret = process.env.SERVICE_JWT_SECRET;
  if (!secret) {
    throw new Error('SERVICE_JWT_SECRET not configured');
  }

  return jwt.sign(
    {
      service: serviceName,
      role: 'service',
    },
    secret,
    { expiresIn: '1h' }
  );
}

export function verifyServiceToken(token: string): ServiceToken {
  const secret = process.env.SERVICE_JWT_SECRET;
  if (!secret) {
    throw new Error('SERVICE_JWT_SECRET not configured');
  }

  return jwt.verify(token, secret) as ServiceToken;
}

export const authenticateService = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const serviceName = req.headers['x-service-name'];

  if (!authHeader || !serviceName) {
    return res.status(401).json({ error: 'Service authentication required' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = verifyServiceToken(token);
    if (decoded.service !== serviceName) {
      return res.status(403).json({ error: 'Service name mismatch' });
    }
    req.service = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid service token' });
  }
};
```

3. **Use in Inter-Service Calls**:
```typescript
// When email service calls calendar service
import { generateServiceToken } from '@tide/service-auth';

const serviceToken = generateServiceToken('email-service');

const response = await fetch('http://calendar-service/api/events', {
  headers: {
    'Authorization': `Bearer ${serviceToken}`,
    'X-Service-Name': 'email-service',
  },
});
```

**Checklist**:
- [ ] Create `@tide/service-auth` package
- [ ] Implement token generation/verification
- [ ] Add to gateway → service calls
- [ ] Add to service → service calls
- [ ] Update all inter-service HTTP requests
- [ ] Add SERVICE_JWT_SECRET to .env.example

---

### 3.3 Implement Caching Layer

**Status**: Not Started
**Priority**: 🟡 MEDIUM
**Files**: Create new `@tide/cache` package

**Implementation**:

```typescript
// packages/libraries/cache/src/index.ts
import Redis from 'ioredis';
import { logger } from '@tide/logger';

export class CacheService {
  private redis: Redis;

  constructor(redisUrl?: string) {
    this.redis = new Redis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error({ error, key }, 'Cache get failed');
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      logger.error({ error, key }, 'Cache set failed');
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      logger.error({ error, key }, 'Cache delete failed');
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      logger.error({ error, pattern }, 'Cache invalidation failed');
    }
  }
}

export const cache = new CacheService();
```

**Use Cases**:
```typescript
// Cache user profiles
async getUserProfile(userId: string) {
  const cacheKey = `user:${userId}`;
  const cached = await cache.get<UserProfile>(cacheKey);
  if (cached) return cached;

  const profile = await db.from('user_profiles').select('*').eq('id', userId).single();
  await cache.set(cacheKey, profile, 300); // 5 min TTL
  return profile;
}

// Cache OAuth tokens (decrypted)
async getOAuthToken(userId: string, provider: string) {
  const cacheKey = `oauth:${userId}:${provider}`;
  const cached = await cache.get<OAuthTokens>(cacheKey);
  if (cached) return cached;

  const tokenData = await db.from('oauth_tokens').select('*').eq('user_id', userId).single();
  const decrypted = {
    accessToken: await decrypt(tokenData.access_token),
    refreshToken: await decrypt(tokenData.refresh_token),
    expiresAt: new Date(tokenData.expires_at),
  };
  await cache.set(cacheKey, decrypted, 60); // 1 min TTL
  return decrypted;
}
```

**Checklist**:
- [ ] Create `@tide/cache` package
- [ ] Cache user profiles
- [ ] Cache OAuth tokens (decrypted, short TTL)
- [ ] Cache email lists
- [ ] Cache calendar events
- [ ] Add cache invalidation on updates

---

### 3.4 Add Correlation IDs for Distributed Tracing

**Status**: Not Started
**Priority**: 🟡 MEDIUM
**File**: `packages/services/shared/middleware/correlation.ts`

**Implementation**:

```typescript
// packages/services/shared/middleware/correlation.ts
import { v4 as uuidv4 } from 'uuid';
import type { Request, Response, NextFunction } from 'express';

export const correlationId = (req: Request, res: Response, next: NextFunction) => {
  req.correlationId = req.headers['x-correlation-id'] as string || uuidv4();
  res.setHeader('X-Correlation-ID', req.correlationId);
  next();
};

// Update logger to include correlation ID
import { logger } from '@tide/logger';

export const correlationLogger = (req: Request, res: Response, next: NextFunction) => {
  req.log = logger.child({ correlationId: req.correlationId });
  next();
};
```

**Apply to All Services**:
```typescript
app.use(correlationId);
app.use(correlationLogger);

// Use in routes
app.post('/emails', authenticateJWT, async (req, res) => {
  req.log.info({ userId: req.user.userId }, 'Fetching emails');
  // ...
});
```

**Inter-Service Propagation**:
```typescript
// When service A calls service B, propagate correlation ID
const response = await fetch('http://service-b/api/endpoint', {
  headers: {
    'X-Correlation-ID': req.correlationId,
  },
});
```

**Checklist**:
- [ ] Create correlation middleware
- [ ] Add to all services
- [ ] Update logger calls to use req.log
- [ ] Propagate in inter-service calls
- [ ] Add to error responses

---

## 🎨 Phase 4: Code Quality Improvements (4-5 days)

### 4.1 Remove 'any' Types

**Status**: Not Started
**Priority**: 🟡 MEDIUM
**Affected Files**: 20+ files

**Systematic Approach**:

1. **Find All 'any' Types**:
```bash
grep -r "any" packages/services --include="*.ts" | grep -v "node_modules"
```

2. **Common Patterns to Fix**:

**Workflow Service** (`packages/services/workflow/src/index.ts:63`):
```typescript
// ❌ Before
const taskEngine = new TaskEngine(taskRepository as any, prioritizer, decomposer);

// ✅ After
interface TaskEngineOptions {
  repository: TaskRepository;
  prioritizer: TaskPrioritizer;
  decomposer: TaskDecomposer;
}

const taskEngine = new TaskEngine({
  repository: taskRepository,
  prioritizer,
  decomposer,
});
```

**Email Service** (`packages/services/email/src/index.ts:112`):
```typescript
// ❌ Before
.insert(data as any)

// ✅ After
interface OAuthTokenInsert {
  user_id: string;
  provider: string;
  service: string;
  access_token: string;
  refresh_token: string;
  expires_at: string | null;
  scope: string | null;
}

const insertData: OAuthTokenInsert = {
  user_id: userId,
  provider: provider === 'gmail' ? 'google' : 'microsoft',
  service: 'email',
  access_token: encryptedAccessToken,
  refresh_token: encryptedRefreshToken,
  expires_at: tokens.expiresAt ? new Date(tokens.expiresAt).toISOString() : null,
  scope: tokens.scope || null,
};

.insert(insertData)
```

**Calendar Service** (`packages/services/calendar/src/index.ts:162`):
```typescript
// ❌ Before
const availabilities: any[] = [];

// ✅ After
interface Availability {
  start: Date;
  end: Date;
  status: 'free' | 'busy' | 'tentative';
}

const availabilities: Availability[] = [];
```

**Checklist by Service**:
- [ ] AI service (4 instances)
- [ ] Email service (3 instances)
- [ ] Calendar service (5 instances)
- [ ] Workflow service (6 instances)
- [ ] Gateway service (2 instances)

---

### 4.2 Replace console.log with Structured Logging

**Status**: Not Started
**Priority**: 🟢 LOW
**Files**: 6 files

**Find All console.log**:
```bash
grep -r "console\." packages/services --include="*.ts" | grep -v "node_modules"
```

**Replacements**:

**AI Service** (`packages/services/ai/src/server-gpt5.ts:113`):
```typescript
// ❌ Before
console.log('=== RAILWAY DEBUG ===');

// ✅ After
import { logger } from '@tide/logger';
logger.debug('Railway debugging information', { context: 'startup' });
```

**Auth Middleware** (`packages/services/shared/middleware/auth.ts:44`):
```typescript
// ❌ Before
console.error('❌ JWT_SECRET not configured');

// ✅ After
logger.error('JWT secret not configured', { service: 'auth' });
```

**Gateway Start Script** (`packages/services/gateway/start.js:12`):
```typescript
// ❌ Before
console.log(`Starting gateway on port ${port}`);

// ✅ After - Convert to TypeScript
// packages/services/gateway/src/start.ts
import { logger } from '@tide/logger';
logger.info({ port }, 'Starting gateway');
```

**Checklist**:
- [ ] AI service (3 instances)
- [ ] Auth middleware (2 instances)
- [ ] Gateway start script (convert to TS)
- [ ] Email service (check for any)
- [ ] Calendar service (check for any)
- [ ] Workflow service (check for any)

---

### 4.3 Fix N+1 Query Patterns

**Status**: Not Started
**Priority**: 🟠 HIGH
**File**: `packages/services/email/src/index.ts:191-260`

**Current Issue**:
```typescript
// ❌ N+1 pattern: 50 emails = 50 AI calls + 100 DB writes
await Promise.all(
  emails.map(async (email) => {
    const triageResult = await this.triageEngine.analyze(email); // AI call per email!

    await Promise.all([
      this.db.from('email_threads').upsert(...), // DB call per email
      this.db.from('email_messages').upsert(...), // DB call per email
    ]);
  })
);
```

**Fix with Batch Processing**:

1. **Batch AI Triage**:
```typescript
// Add batch method to EmailTriageEngine
async analyzeBatch(emails: Email[]): Promise<TriageResult[]> {
  // Send all emails in a single AI request
  const batchPrompt = emails.map((email, i) =>
    `Email ${i}:\nFrom: ${email.from}\nSubject: ${email.subject}\nBody: ${email.body}\n---`
  ).join('\n\n');

  const response = await this.ai.createMessage({
    model: 'claude-3-5-sonnet-20241022',
    messages: [{
      role: 'user',
      content: `Analyze and categorize these ${emails.length} emails. Return JSON array with {category, importance, urgency, strategy} for each.`,
    }],
  });

  return JSON.parse(response.content);
}
```

2. **Bulk Database Insert**:
```typescript
// ✅ Optimized: 1 AI call + 2 DB bulk inserts
const triageResults = await this.triageEngine.analyzeBatch(emails);

const threads = emails.map((email, i) => ({
  user_id: userId,
  provider: provider === 'gmail' ? 'google' : 'microsoft',
  external_thread_id: email.threadId || email.id,
  subject: email.subject,
  participants: email.from ? [email.from] : [],
  last_message_at: email.timestamp,
}));

const messages = emails.map((email, i) => ({
  user_id: userId,
  provider: provider === 'gmail' ? 'google' : 'microsoft',
  external_message_id: email.id,
  thread_id: email.threadId || email.id,
  from_address: email.from,
  to_addresses: email.to || [],
  cc_addresses: email.cc || [],
  subject: email.subject,
  body_text: email.body,
  body_html: email.htmlBody || null,
  received_at: email.timestamp,
  is_read: email.isRead || false,
  ai_category: triageResults[i].category,
  ai_priority: Math.round(triageResults[i].importance * 10),
  ai_summary: `${triageResults[i].category} - ${triageResults[i].strategy.reasoning}`,
}));

// Bulk insert
await Promise.all([
  this.db.from('email_threads').upsert(threads, { onConflict: 'user_id,external_thread_id' }),
  this.db.from('email_messages').upsert(messages, { onConflict: 'user_id,external_message_id' }),
]);
```

**Performance Gain**:
- Before: 50 emails = ~60 seconds (50 AI calls + 100 DB writes)
- After: 50 emails = ~3 seconds (1 AI call + 2 DB writes)

**Checklist**:
- [ ] Implement batch AI triage
- [ ] Implement bulk DB inserts for emails
- [ ] Apply similar pattern to calendar events
- [ ] Apply similar pattern to tasks
- [ ] Test with large datasets

---

### 4.4 Consolidate iOS/macOS AuthManager Code

**Status**: Not Started
**Priority**: 🟡 MEDIUM
**Files**:
- `apps/mobile-ios/TideApp/Services/AuthManager.swift` (373 lines)
- `apps/app/app/Services/AuthManager.swift` (167 lines)

**Duplication**: ~90% code overlap

**Implementation Plan**:

1. **Create Shared Swift Package**:
```bash
mkdir -p packages/swift/TideAuth
cd packages/swift/TideAuth
swift package init --type library
```

2. **Extract Common Code**:
```swift
// packages/swift/TideAuth/Sources/TideAuth/AuthManager.swift
import Foundation
import Supabase
import KeychainAccess

@MainActor
public final class AuthManager: ObservableObject {
  // All common authentication logic
  // OAuth methods
  // Token management
  // Session handling
}
```

3. **Platform-Specific Extensions**:
```swift
// iOS-specific in mobile-ios
#if os(iOS)
extension AuthManager {
  // iOS-specific methods (e.g., biometric auth)
}
#endif

// macOS-specific in app
#if os(macOS)
extension AuthManager {
  // macOS-specific methods
}
#endif
```

**Checklist**:
- [ ] Create TideAuth Swift package
- [ ] Extract common authentication logic
- [ ] Extract OAuth methods
- [ ] Extract token management
- [ ] Add platform-specific extensions
- [ ] Update iOS app to use package
- [ ] Update macOS app to use package
- [ ] Test on both platforms

---

## 🚀 Phase 5: Testing & Documentation (3-4 days)

### 5.1 Add Comprehensive Test Coverage

**Status**: Not Started
**Priority**: 🟠 HIGH
**Current Coverage**: ~5% (12 test files)
**Target Coverage**: 80%

**Testing Strategy**:

1. **Service Layer Tests** (Priority 1):
```typescript
// packages/services/email/src/__tests__/email.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmailService } from '../index';

describe('EmailService', () => {
  let service: EmailService;
  let mockDB: any;
  let mockProvider: any;

  beforeEach(() => {
    mockDB = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };

    mockProvider = {
      fetchEmails: vi.fn(),
      sendEmail: vi.fn(),
    };

    service = new EmailService();
    // Inject mocks
  });

  describe('fetchEmails', () => {
    it('should fetch emails from provider', async () => {
      const mockEmails = [{ id: '1', subject: 'Test' }];
      mockProvider.fetchEmails.mockResolvedValue(mockEmails);

      const result = await service.fetchEmails('user-id', 'gmail');

      expect(mockProvider.fetchEmails).toHaveBeenCalledWith({
        limit: 50,
        unreadOnly: false,
      });
      expect(result).toEqual(mockEmails);
    });

    it('should handle provider errors gracefully', async () => {
      mockProvider.fetchEmails.mockRejectedValue(new Error('API error'));

      await expect(
        service.fetchEmails('user-id', 'gmail')
      ).rejects.toThrow('API error');
    });

    it('should cache fetched emails', async () => {
      // Test caching logic
    });
  });

  describe('sendEmail', () => {
    it('should send email via provider', async () => {
      // Test implementation
    });

    it('should store sent email in database', async () => {
      // Test implementation
    });
  });
});
```

2. **API Endpoint Tests** (Priority 2):
```typescript
// packages/services/email/src/__tests__/api.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { EmailService } from '../index';

describe('Email API', () => {
  const app = new EmailService().app;

  describe('POST /connect/:provider', () => {
    it('should reject invalid provider', async () => {
      const response = await request(app)
        .post('/connect/invalid')
        .send({ userId: 'test', tokens: {} });

      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/connect/gmail')
        .send({ userId: 'test', tokens: {} });

      expect(response.status).toBe(401);
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/connect/gmail')
        .set('Authorization', 'Bearer valid-token')
        .send({ userId: 'not-a-uuid' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('validation');
    });
  });
});
```

3. **Integration Tests** (Priority 3):
```typescript
// packages/services/email/src/__tests__/integration.test.ts
describe('Email Service Integration', () => {
  it('should fetch, triage, and store emails end-to-end', async () => {
    // Full workflow test
  });
});
```

**Test Checklist**:

**Email Service**:
- [ ] EmailService class (core logic)
- [ ] GmailProvider
- [ ] ExchangeProvider
- [ ] EmailTriageEngine
- [ ] SmartComposer
- [ ] API endpoints (7 endpoints)
- [ ] Integration tests

**Calendar Service**:
- [ ] CalendarService class
- [ ] Google Calendar provider
- [ ] Microsoft Calendar provider
- [ ] Conflict resolver
- [ ] API endpoints (6 endpoints)

**Workflow Service**:
- [ ] WorkflowEngine
- [ ] TaskEngine
- [ ] TaskPrioritizer
- [ ] TaskDecomposer
- [ ] API endpoints (8 endpoints)

**AI Service**:
- [ ] GPT-5 Orchestrator
- [ ] Tool registry
- [ ] Context management
- [ ] API endpoints (4 endpoints)

**Shared Packages**:
- [ ] @tide/encryption
- [ ] @tide/cache
- [ ] @tide/service-auth
- [ ] Middleware functions

---

### 5.2 Implement Circuit Breaker Pattern

**Status**: Not Started
**Priority**: 🟡 MEDIUM
**Use Case**: Protect against cascading failures when external APIs fail

**Implementation**:

```typescript
// packages/libraries/circuit-breaker/src/index.ts
export enum CircuitState {
  CLOSED = 'closed',     // Normal operation
  OPEN = 'open',         // Failing, reject requests
  HALF_OPEN = 'half_open', // Testing if service recovered
}

export interface CircuitBreakerOptions {
  failureThreshold: number;      // Failures before opening
  successThreshold: number;      // Successes to close again
  timeout: number;               // Time to wait before retry (ms)
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt = Date.now();

  constructor(private options: CircuitBreakerOptions) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = CircuitState.HALF_OPEN;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.options.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
      }
    }
  }

  private onFailure() {
    this.failureCount++;
    this.successCount = 0;

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.options.timeout;
    }
  }
}
```

**Usage**:
```typescript
// Protect Gmail API calls
const gmailCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000, // 1 minute
});

async fetchEmailsFromGmail() {
  return gmailCircuitBreaker.execute(async () => {
    return await gmail.users.messages.list({ userId: 'me' });
  });
}
```

**Checklist**:
- [ ] Create circuit breaker package
- [ ] Apply to Gmail API calls
- [ ] Apply to Microsoft Graph calls
- [ ] Apply to OpenAI API calls
- [ ] Apply to Anthropic API calls
- [ ] Add monitoring/alerting

---

### 5.3 Add API Documentation with OpenAPI

**Status**: Not Started
**Priority**: 🟢 LOW

**Implementation**:

```typescript
// packages/services/email/src/openapi.ts
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

const registry = new OpenAPIRegistry();

registry.registerPath({
  method: 'post',
  path: '/connect/{provider}',
  summary: 'Connect email provider',
  request: {
    params: z.object({
      provider: z.enum(['gmail', 'exchange']),
    }),
    body: {
      content: {
        'application/json': {
          schema: ConnectProviderSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Provider connected successfully',
    },
    400: {
      description: 'Invalid request',
    },
  },
});

// Generate OpenAPI spec
export const openApiSpec = registry.generateOpenAPIDocument({
  info: {
    title: 'Tide Email Service API',
    version: '1.0.0',
  },
});
```

**Checklist**:
- [ ] Email service OpenAPI spec
- [ ] Calendar service OpenAPI spec
- [ ] Workflow service OpenAPI spec
- [ ] AI service OpenAPI spec
- [ ] Host Swagger UI at /docs
- [ ] Generate client SDKs

---

## 📊 Phase 6: Performance & Optimization (2-3 days)

### 6.1 Optimize Database Queries

**Status**: Not Started
**Priority**: 🟡 MEDIUM

**Add Database Indexes**:

```sql
-- Supabase migration: packages/database/migrations/add_performance_indexes.sql

-- Email messages - frequently queried by user_id and provider
CREATE INDEX IF NOT EXISTS idx_email_messages_user_provider
ON email_messages(user_id, provider, received_at DESC);

-- OAuth tokens - frequently queried by user_id and provider
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_provider_service
ON oauth_tokens(user_id, provider, service);

-- Calendar events - frequently queried by user_id and time range
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_time
ON calendar_events(user_id, start_time, end_time);

-- Tasks - frequently queried by user_id and status
CREATE INDEX IF NOT EXISTS idx_tasks_user_status
ON tasks(user_id, status, due_at);

-- Search optimization
CREATE INDEX IF NOT EXISTS idx_email_messages_search
ON email_messages USING gin(to_tsvector('english', subject || ' ' || body_text));
```

**Checklist**:
- [ ] Analyze slow queries with EXPLAIN
- [ ] Add indexes for common queries
- [ ] Add compound indexes
- [ ] Add full-text search indexes
- [ ] Test query performance
- [ ] Deploy migrations

---

## ✅ Summary & Progress Tracking

### Completion Status

| Phase | Tasks | Completed | Remaining | Priority |
|-------|-------|-----------|-----------|----------|
| Phase 1: Critical Security | 3 | 3 | 0 | 🔴 CRITICAL |
| Phase 2: Validation & Auth | 3 | 0 | 3 | 🔴 CRITICAL |
| Phase 3: Infrastructure | 4 | 0 | 4 | 🟠 HIGH |
| Phase 4: Code Quality | 4 | 0 | 4 | 🟡 MEDIUM |
| Phase 5: Testing & Docs | 3 | 0 | 3 | 🟠 HIGH |
| Phase 6: Performance | 1 | 0 | 1 | 🟡 MEDIUM |
| **TOTAL** | **18** | **3** | **15** | |

### Priority Order for Next Steps

1. 🔴 **IMMEDIATE** (This Week):
   - [ ] Manually rotate all exposed credentials (SECURITY_ALERT.md)
   - [ ] Add input validation to all endpoints
   - [ ] Fix JWT secret startup validation

2. 🟠 **HIGH PRIORITY** (Next Week):
   - [ ] Implement Redis-based rate limiting
   - [ ] Add service-to-service authentication
   - [ ] Fix N+1 query patterns

3. 🟡 **MEDIUM PRIORITY** (Week 3-4):
   - [ ] Remove 'any' types
   - [ ] Replace console.log
   - [ ] Implement caching layer
   - [ ] Add correlation IDs
   - [ ] Consolidate iOS/macOS code

4. 🟢 **LOW PRIORITY** (Week 5-6):
   - [ ] Add comprehensive tests
   - [ ] Implement circuit breaker
   - [ ] Add API documentation
   - [ ] Optimize database queries

---

## 🎯 Success Metrics

After completing all phases, the codebase should achieve:

- ✅ **Security**: A+ rating, no exposed secrets, encrypted sensitive data
- ✅ **Type Safety**: 0 'any' types, 100% TypeScript strict mode
- ✅ **Test Coverage**: 80%+ code coverage
- ✅ **Performance**: <500ms p95 response time
- ✅ **Scalability**: Redis-based rate limiting, caching
- ✅ **Observability**: Correlation IDs, structured logging
- ✅ **Documentation**: OpenAPI specs for all services
- ✅ **Code Quality**: No console.log, no code duplication

---

## 📝 Notes

- This roadmap is a living document - update as priorities change
- Each phase can be worked on in parallel by different team members
- Test each phase thoroughly before moving to the next
- Deploy incrementally to catch issues early

---

**Last Updated**: 2025-01-09
**Next Review**: 2025-01-16
