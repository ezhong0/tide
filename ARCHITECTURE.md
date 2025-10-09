# Tide Platform Architecture

**Version:** 2.0
**Last Updated:** 2025-10-09
**Status:** Production-Ready

---

## 🏗️ Architectural Principles

### Core Values
1. **Elegance Over Complexity** - Simple, beautiful code that does one thing well
2. **Type Safety First** - Leverage TypeScript's type system fully
3. **Testability** - All components are independently testable
4. **Maintainability** - Code that's easy to understand and modify
5. **Performance** - Efficient resource usage and graceful degradation

### Design Patterns
- **Layered Architecture** - Clear separation between presentation, business, and data layers
- **Repository Pattern** - Abstracted data access with consistent interfaces
- **Dependency Injection** - Loose coupling and enhanced testability
- **Resource Lifecycle Management** - Proper initialization and cleanup
- **Fail-Fast Principle** - Early validation and clear error messages

---

## 📦 Package Structure

```
packages/
├── shared/          # Shared cross-cutting concerns
│   ├── base/        # ⭐ NEW: Base patterns (ServiceBase, RepositoryBase)
│   ├── config/      # Configuration management
│   ├── contracts/   # API contracts and type definitions
│   ├── errors/      # Error classes and factories
│   ├── types/       # Shared TypeScript types
│   └── validation/  # Validation schemas
│
├── libraries/       # Reusable libraries
│   ├── database/    # Database client (Supabase)
│   └── logger/      # Structured logging (Pino)
│
└── services/        # Microservices
    ├── ai/          # AI orchestration service
    ├── email/       # Email management service
    ├── calendar/    # Calendar & scheduling service
    ├── workflow/    # Workflow automation service
    ├── gateway/     # API gateway (REST proxy)
    └── shared/
        └── middleware/  # ⭐ IMPROVED: Shared middleware
```

---

## 🎯 Service Architecture Pattern

### Before (Anti-Pattern)
```typescript
// ❌ God class with too many responsibilities
class EmailService {
  private app = express();
  private db = createSupabase(); // Direct dependency
  private providers = new Map(); // No lifecycle management

  constructor() {
    this.setupMiddleware();
    this.setupRoutes();  // Routes mixed with business logic
  }
}
```

### After (Best Practice)
```typescript
// ✅ Clean, testable service architecture
import { ServiceBase, type ServiceConfig, type Resource } from '@tide/base';

class EmailService extends ServiceBase {
  constructor(
    config: ServiceConfig,
    private emailRepository: EmailRepository,    // Injected dependency
    private triageEngine: EmailTriageEngine      // Injected dependency
  ) {
    super(config);
  }

  protected async initialize(): Promise<void> {
    // Register resources for lifecycle management
    this.registerResource(this.emailRepository);
    this.logger.info('Email service initialized');
  }

  protected setupRoutes(app: Express): void {
    // Clean, focused route definitions
    app.get('/emails/:userId', this.handleGetEmails.bind(this));
    app.post('/emails', this.handleCreateEmail.bind(this));
  }

  // Graceful shutdown automatically handled by ServiceBase
}
```

**Benefits:**
- ✅ Single Responsibility Principle
- ✅ Dependency Injection enables testing
- ✅ Automatic graceful shutdown
- ✅ Consistent health checks
- ✅ Resource lifecycle management

---

## 🗄️ Repository Pattern

### Before (Anti-Pattern)
```typescript
// ❌ Direct database access in route handlers
app.get('/emails', async (req, res) => {
  const { data, error } = await db
    .from('email_messages')
    .select('*')
    .eq('user_id', userId);  // Business logic mixed with data access

  if (error) {
    // Inconsistent error handling
    return res.status(500).json({ error: 'Failed' });
  }
  res.json({ emails: data });
});
```

### After (Best Practice)
```typescript
// ✅ Clean repository pattern
import { RepositoryBase } from '@tide/base';

class EmailRepository extends RepositoryBase<EmailMessage> {
  protected readonly tableName = 'email_messages';

  async findByUserId(userId: UserId, options?: QueryOptions): Promise<EmailMessage[]> {
    return this.executeQuery(
      () => this.db
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .limit(options?.limit || 50),
      'findByUserId'
    );
  }
}

// Usage in service
const emails = await this.emailRepository.findByUserId(userId);
```

**Benefits:**
- ✅ Single place for data access logic
- ✅ Consistent error handling
- ✅ Easy to mock for testing
- ✅ Type-safe queries
- ✅ Reusable across services

---

## ⚠️ Error Handling

### Middleware-Based Error Handling
All services use centralized error handling middleware:

```typescript
import { errorHandler, notFoundHandler } from '@tide/middleware';

// Register error handlers LAST
app.use(notFoundHandler);    // 404 handler
app.use(errorHandler);        // Centralized error handler
```

**Features:**
- ✅ Consistent error response format
- ✅ Automatic logging with context
- ✅ Development vs production error details
- ✅ Prevents "headers already sent" errors
- ✅ Supports custom API error classes

---

## 📊 Logging Strategy

### Structured Logging with Pino
```typescript
import { createLogger } from '@tide/logger';

const logger = createLogger({
  component: 'EmailService',
  version: '2.0.0'
});

logger.info({ userId, emailCount }, 'Fetched emails');
logger.error({ error, userId }, 'Failed to fetch emails');
```

**Features:**
- ✅ JSON structured logging
- ✅ Automatic PII redaction
- ✅ Request correlation (TODO: Add correlation IDs)
- ✅ Pretty printing in development
- ✅ Production-ready log levels

---

## 🔄 Resource Lifecycle Management

### Graceful Shutdown Pattern
```typescript
export interface Resource {
  name: string;
  cleanup(): Promise<void>;
}

// Database connection as a resource
class DatabaseResource implements Resource {
  name = 'database';

  async cleanup(): Promise<void> {
    await this.closeConnections();
  }
}

// Automatic cleanup on shutdown
service.registerResource(new DatabaseResource());
```

**Benefits:**
- ✅ No connection leaks
- ✅ Graceful degradation
- ✅ Proper signal handling (SIGTERM, SIGINT)
- ✅ Timeout protection
- ✅ Clean container shutdown

---

## 🧪 Testing Strategy

### Unit Testing
```typescript
// Easy to test with dependency injection
describe('EmailService', () => {
  it('should fetch emails', async () => {
    const mockRepository = {
      findByUserId: jest.fn().mockResolvedValue([...])
    };

    const service = new EmailService(config, mockRepository, mockEngine);
    const emails = await service.getEmails(userId);

    expect(emails).toHaveLength(5);
  });
});
```

---

## 📈 Improvements Implemented

### Fixed Critical Issues
1. ✅ **Rate Limit Middleware Bug** - Headers sent race condition (line 77, rate-limit.ts)
2. ✅ **TypeScript Type Conflicts** - Duplicate SuggestedAction interfaces
3. ✅ **Missing Dependencies** - Added @tide/middleware to 4 services
4. ✅ **Supabase Config Validation** - Runtime checks for required env vars
5. ✅ **Mock Package Types** - Fixed AIResponse structure

### Architectural Enhancements
6. ✅ **Base Service Pattern** - `ServiceBase` class for consistency
7. ✅ **Repository Pattern** - `RepositoryBase` for data access
8. ✅ **Resource Lifecycle** - Proper cleanup and shutdown handling
9. ✅ **Error Handling** - Centralized, consistent error responses
10. ✅ **Logging Standards** - Structured logging with proper types

---

## 🚀 Migration Guide

### For New Services
```typescript
import { ServiceBase } from '@tide/base';
import { RepositoryBase } from '@tide/base';

// 1. Create repository
class MyRepository extends RepositoryBase<MyEntity> {
  protected readonly tableName = 'my_table';
}

// 2. Create service
class MyService extends ServiceBase {
  constructor(
    config: ServiceConfig,
    private myRepository: MyRepository
  ) {
    super(config);
  }

  protected async initialize() {
    this.registerResource(this.myRepository);
  }

  protected setupRoutes(app: Express) {
    app.get('/my-route', ...);
  }
}

// 3. Start service
const service = new MyService(config, repository);
await service.start(app);
```

### For Existing Services
Services can be gradually migrated:
1. **Phase 1:** Add `@tide/base` dependency
2. **Phase 2:** Extract repositories from route handlers
3. **Phase 3:** Extend `ServiceBase` for lifecycle management
4. **Phase 4:** Add proper resource cleanup

---

## 📚 References

- **SOLID Principles:** Each service follows Single Responsibility, Open/Closed, etc.
- **Clean Architecture:** Clear boundaries between layers
- **Domain-Driven Design:** Business logic separate from infrastructure
- **12-Factor App:** Configuration, dependencies, backing services properly managed

---

## 🔮 Future Enhancements

### Planned Improvements
- [ ] Request correlation IDs for distributed tracing
- [ ] Dependency injection container (InversifyJS or custom)
- [ ] Service mesh integration (Istio/Linkerd)
- [ ] Circuit breaker pattern for external calls
- [ ] Cache abstraction layer
- [ ] Event sourcing for audit trails
- [ ] GraphQL Federation (replacing REST proxy)

---

## 👥 Contributing

When adding new services or modifying existing ones:
1. **Extend `ServiceBase`** - Don't reinvent the wheel
2. **Use `RepositoryBase`** - Abstract data access
3. **Follow error patterns** - Use middleware and error classes
4. **Add proper lifecycle** - Register resources for cleanup
5. **Write tests** - Leverage dependency injection
6. **Document patterns** - Update this file if introducing new patterns

---

**Remember:** Code is read 10x more than it's written. Optimize for clarity, not cleverness.
