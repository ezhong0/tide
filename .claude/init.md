# 🌊 Tide AI Assistant - Claude Development Context

## Project Overview
Tide is an AI-powered executive assistant that handles email, calendar, and tasks through natural language commands. Built for <300ms response times with offline-first mobile support.

## Current Phase
- ✅ Module 00 (Foundation) - COMPLETE
- 🚧 Ready to start Module 01-05 development (Week 3-6)

## Architecture Quick Reference

### System Architecture
```
User → Mobile/Web → Edge Workers → API Gateway → AI Agents → Services → Database
                                                      ↓
                                              Context Engine → pgvector
```

### Key Performance Targets
- API Response: <300ms p95
- Database queries: <10ms
- Cache hit rate: >90%
- Offline capability: 80% of features

## Module Development Guide

### Current Module Status
| Module | Owner | Status | Dependencies |
|--------|-------|--------|--------------|
| 00 - Foundation | DONE | ✅ Complete | None |
| 01 - Email Service | TBD | 🔜 Ready | Module 00 |
| 02 - Calendar Service | TBD | 🔜 Ready | Module 00 |
| 03 - AI Agent System | TBD | 🔜 Ready | Module 00 |
| 04 - Event Sourcing | TBD | 🔜 Ready | Module 00 |
| 05 - Context Engine | TBD | 🔜 Ready | Module 00 |
| 06 - Mobile App | TBD | ⏸️ Week 7 | Modules 01-05 |
| 07 - Web App | TBD | ⏸️ Week 7 | Modules 01-05 |
| 08 - Learning | TBD | ⏸️ Week 10 | Modules 01-05 |
| 09 - Security | TBD | 🔜 OAuth Week 3 | Module 00 |
| 10 - Performance | TBD | ⏸️ Week 10 | All modules |

### Working on a Module
When implementing a module:
1. Read the module guide: `/docs/modules/MODULE-XX-name.md`
2. Import contracts from Module 00: `@tide/contracts`
3. Use mocks for dependencies: `@tide/contracts/mocks`
4. Write tests alongside code (>85% coverage)
5. Follow the coding standards below

## Coding Standards

### TypeScript Configuration
```typescript
// Strict mode enabled
// Node.js 20+ target
// ESM modules
// Path aliases: @tide/*
```

### Code Style
```typescript
// ✅ Good: Explicit types, error handling, pure functions
export async function sendEmail(
  params: SendEmailParams
): Promise<Result<EmailResult, EmailError>> {
  try {
    const validated = validateEmailParams(params);
    const result = await emailService.send(validated);
    return Result.ok(result);
  } catch (error) {
    return Result.err(new EmailError(error.message));
  }
}

// ❌ Bad: Any types, no validation, throwing errors
export async function sendEmail(params: any) {
  return await emailService.send(params); // Throws on error
}
```

### Database Queries
```typescript
// ✅ Good: Prepared statements, proper indexing
const user = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// ❌ Bad: String concatenation
const user = await db.query(
  `SELECT * FROM users WHERE email = '${email}'` // SQL injection risk
);
```

### API Patterns
```typescript
// All APIs follow REST conventions
POST   /api/commands          // Execute command
GET    /api/emails            // List emails
POST   /api/emails            // Send email
GET    /api/emails/:id        // Get specific email
DELETE /api/emails/:id        // Delete email
PATCH  /api/emails/:id        // Update email

// All responses follow format:
{
  "success": boolean,
  "data": T | null,
  "error": ErrorDetails | null,
  "metadata": {
    "timestamp": string,
    "requestId": string,
    "version": string
  }
}
```

## Common Development Tasks

### Start Development Environment
```bash
# Start infrastructure
docker-compose up -d

# Install dependencies
pnpm install

# Run migrations
pnpm db:migrate

# Start development
pnpm dev
```

### Working with Email Module (Module 01)
```typescript
// Import contracts
import { IEmailService, SendEmailParams } from '@tide/contracts';
import { MockCalendarService } from '@tide/contracts/mocks';

// Implement service
export class EmailService implements IEmailService {
  constructor(
    private gmail: GmailAPI,
    private calendar: MockCalendarService // Use mock initially
  ) {}

  async sendEmail(params: SendEmailParams): Promise<EmailResult> {
    // Implementation
  }
}
```

### Working with AI Agents (Module 03)
```typescript
// Agent implementation pattern
export class EmailAgent extends BaseAgent {
  name = 'email';

  async plan(command: string, intent: Intent): Promise<Plan> {
    // 1. Parse command
    // 2. Generate steps
    // 3. Return execution plan
  }

  async execute(plan: Plan): Promise<Result> {
    // Execute each step
    for (const step of plan.steps) {
      await this.executeStep(step);
    }
  }
}
```

### Testing Patterns
```typescript
// Unit test
describe('EmailService', () => {
  it('should send email successfully', async () => {
    const service = new EmailService(mockGmail, mockCalendar);
    const result = await service.sendEmail(validParams);
    expect(result.success).toBe(true);
  });
});

// Integration test
describe('Email Flow', () => {
  it('should handle complete email flow', async () => {
    // Test with real services
  });
});
```

## Environment Variables

### Required for Development
```bash
# Database
DATABASE_URL=postgresql://localhost:5432/tide
REDIS_URL=redis://localhost:6379

# AI (get from OpenAI)
OPENAI_API_KEY=sk-...

# OAuth (from External Setup Guide)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
MICROSOFT_CLIENT_ID=xxx
MICROSOFT_CLIENT_SECRET=xxx
```

## Quick Commands

### Database
```bash
pnpm db:migrate              # Run migrations
pnpm db:seed                 # Seed test data
pnpm db:reset                # Reset database
```

### Testing
```bash
pnpm test                    # Run all tests
pnpm test:unit              # Unit tests only
pnpm test:integration       # Integration tests
pnpm test:coverage          # Coverage report
```

### Code Quality
```bash
pnpm lint                    # Run linter
pnpm format                  # Format code
pnpm typecheck              # TypeScript check
```

### Module-Specific
```bash
pnpm dev:email              # Start email service
pnpm dev:calendar           # Start calendar service
pnpm dev:ai                 # Start AI service
pnpm dev:api                # Start API gateway
```

## Error Handling Patterns

### Service Errors
```typescript
export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public retryable: boolean = false
  ) {
    super(message);
  }
}

// Usage
throw new ServiceError(
  'Failed to send email',
  'EMAIL_SEND_FAILED',
  500,
  true // Retryable
);
```

### Result Pattern
```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// Usage
function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return { ok: false, error: new Error('Division by zero') };
  }
  return { ok: true, value: a / b };
}
```

## Performance Optimization Checklist

- [ ] Database indexes on all foreign keys and WHERE columns
- [ ] Redis caching for hot paths
- [ ] Batch operations where possible
- [ ] Connection pooling configured
- [ ] N+1 query prevention
- [ ] Async/parallel operations
- [ ] Lazy loading for large datasets
- [ ] Pagination on all list endpoints

## Security Checklist

- [ ] Input validation with Zod
- [ ] SQL injection prevention (prepared statements)
- [ ] XSS prevention (sanitize HTML)
- [ ] CSRF tokens for state-changing operations
- [ ] Rate limiting on all endpoints
- [ ] JWT tokens with short expiry (15 min)
- [ ] Refresh tokens with rotation
- [ ] Audit logging for all actions
- [ ] PII encryption at rest

## Monitoring & Debugging

### Logging
```typescript
import { logger } from '@tide/logger';

logger.info('Operation started', { userId, action });
logger.error('Operation failed', { error, context });
```

### Metrics
```typescript
import { metrics } from '@tide/metrics';

metrics.increment('emails.sent');
metrics.timing('api.response', responseTime);
```

### Debugging Commands
```bash
# View logs
pnpm logs:api
pnpm logs:email

# Database console
pnpm db:console

# Redis CLI
redis-cli

# API testing
curl http://localhost:3001/health
```

## External Documentation

### API Documentation
- [Gmail API](https://developers.google.com/gmail/api)
- [Microsoft Graph](https://docs.microsoft.com/graph)
- [OpenAI API](https://platform.openai.com/docs)

### Project Documentation
- [Implementation Guide](/docs/IMPLEMENTATION-GUIDE.md)
- [External Setup Guide](/docs/EXTERNAL-SETUP-GUIDE.md)
- [Module Guides](/docs/modules/)
- [Architecture Decisions](/docs/ARCHITECTURE-DECISIONS.md)

## Getting Help

### Resources
- Implementation Guide: `/docs/IMPLEMENTATION-GUIDE.md`
- External Setup: `/docs/EXTERNAL-SETUP-GUIDE.md`
- Module Specs: `/docs/modules/MODULE-XX-*.md`
- Architecture: `/docs/STREAMLINED-ARCHITECTURE-FINAL.md`

### Common Issues
1. **OAuth not working**: Check redirect URIs match exactly
2. **Slow queries**: Add indexes, check query plan
3. **Type errors**: Ensure Module 00 contracts are up to date
4. **Test failures**: Run `pnpm db:reset` to clean state

## Development Philosophy

1. **Speed is a feature** - Optimize for <300ms always
2. **Offline-first** - Mobile must work without internet
3. **Security by default** - Never compromise on security
4. **Test as you code** - TDD where possible
5. **Document intent** - Code should explain why, not just what

---

Ready to code? Start with: `pnpm install && docker-compose up -d`