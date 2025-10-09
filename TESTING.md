# Testing Infrastructure

This document describes the comprehensive testing infrastructure for the Tide platform.

## Overview

Tide uses [Vitest](https://vitest.dev/) as its testing framework, providing a fast, modern testing experience with excellent TypeScript support and compatibility with the ecosystem.

## Test Structure

```
tide/
├── vitest.config.ts              # Root vitest configuration
├── vitest.setup.ts               # Global test setup
├── packages/
│   ├── shared/
│   │   ├── base/                 # Service & Repository patterns
│   │   │   ├── src/
│   │   │   │   ├── service.base.test.ts
│   │   │   │   └── repository.base.test.ts
│   │   │   └── vitest.config.ts
│   │   └── testing/              # Test utilities package
│   │       ├── src/
│   │       │   ├── mocks/        # Mock factories
│   │       │   ├── fixtures/     # Test data
│   │       │   └── helpers/      # Test helpers
│   │       └── vitest.config.ts
│   └── services/
│       └── shared/
│           └── middleware/        # Middleware tests
│               ├── correlation.test.ts
│               ├── rate-limit.test.ts
│               ├── error-handler.test.ts
│               └── vitest.config.ts
```

## Running Tests

### Quick Start

```bash
# Run all tests once
pnpm test

# Run tests in watch mode (interactive)
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests with UI (browser-based)
pnpm test:ui

# Run tests for all packages
pnpm test:packages
```

### Package-Specific Tests

```bash
# Run tests for a specific package
cd packages/shared/base
pnpm test

# Run tests for middleware
cd packages/services/shared/middleware
pnpm test

# Run tests with coverage for a package
cd packages/shared/base
pnpm test:coverage
```

## Test Utilities

The `@tide/testing` package provides shared utilities for writing tests:

### Mock Factories

```typescript
import { mockRequest, mockResponse, mockNext, mockLogger } from '@tide/testing';

describe('MyMiddleware', () => {
  it('should process requests', () => {
    const req = mockRequest({ body: { data: 'test' } });
    const res = mockResponse();
    const next = mockNext();

    myMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
```

### Test Fixtures

```typescript
import { TEST_USER, TEST_EMAIL, TEST_CALENDAR_EVENT } from '@tide/testing';

describe('UserService', () => {
  it('should create user', async () => {
    const user = await userService.create(TEST_USER);
    expect(user.email).toBe(TEST_USER.email);
  });
});
```

### Test Helpers

```typescript
import { waitFor, wait, createDeferred } from '@tide/testing';

describe('AsyncService', () => {
  it('should complete async operation', async () => {
    const operation = service.startOperation();

    await waitFor(() => operation.isComplete(), 5000);

    expect(operation.result).toBeDefined();
  });
});
```

## Writing Tests

### Test Organization

Follow these conventions for organizing tests:

1. **Colocate tests** - Place test files next to the source files they test
2. **Naming convention** - Use `.test.ts` suffix for test files
3. **Describe blocks** - Group related tests using `describe()`
4. **Clear test names** - Use descriptive `it()` statements

```typescript
describe('ServiceName', () => {
  describe('methodName()', () => {
    it('should handle normal case', () => {
      // Test implementation
    });

    it('should handle error case', () => {
      // Test implementation
    });

    it('should validate input', () => {
      // Test implementation
    });
  });
});
```

### Best Practices

#### 1. Use beforeEach for Setup

```typescript
describe('RateLimiter', () => {
  let mockReq: Request;
  let mockRes: Response;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = mockRequest();
    mockRes = mockResponse();
    mockNext = mockNext();
  });

  it('should limit requests', () => {
    // Test uses fresh mocks
  });
});
```

#### 2. Clean Up After Tests

```typescript
afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllTimers();
});
```

#### 3. Use Fake Timers for Time-Based Tests

```typescript
import { vi, beforeEach, afterEach } from 'vitest';

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should reset after time window', () => {
    // Make requests
    limiter(req, res, next);

    // Advance time
    vi.advanceTimersByTime(60000);

    // Verify behavior
    limiter(req, res, next);
  });
});
```

#### 4. Test Error Cases

```typescript
it('should handle errors gracefully', async () => {
  mockDb.query.mockRejectedValue(new Error('DB error'));

  await expect(service.getData()).rejects.toThrow('DB error');
});
```

#### 5. Isolate Tests

```typescript
// ❌ Bad - tests share state
let counter = 0;

it('increments counter', () => {
  counter++;
  expect(counter).toBe(1);
});

// ✅ Good - tests are independent
it('increments counter', () => {
  let counter = 0;
  counter++;
  expect(counter).toBe(1);
});
```

## Testing Patterns

### Testing ServiceBase

```typescript
import { ServiceBase } from '@tide/base';
import express from 'express';

class TestService extends ServiceBase {
  protected async initialize() {
    // Setup
  }

  protected setupRoutes(app: Express) {
    app.get('/test', (req, res) => res.json({ ok: true }));
  }
}

describe('ServiceBase', () => {
  it('should initialize service', async () => {
    const service = new TestService(config);
    const app = express();

    await service.start(app);

    expect(service.initializeCalled).toBe(true);
  });
});
```

### Testing RepositoryBase

```typescript
import { RepositoryBase } from '@tide/base';

class TestRepository extends RepositoryBase<Entity> {
  protected readonly tableName = 'entities';
}

describe('RepositoryBase', () => {
  let mockDb: SupabaseClient;
  let repository: TestRepository;

  beforeEach(() => {
    mockDb = createMockSupabaseClient();
    repository = new TestRepository(mockDb, 'Entity');
  });

  it('should find entity by ID', async () => {
    mockDb.from().select().eq().single.mockResolvedValue({
      data: { id: '1', name: 'Test' },
      error: null,
    });

    const result = await repository.findById('1');

    expect(result).toEqual({ id: '1', name: 'Test' });
  });
});
```

### Testing Middleware

```typescript
import { correlationMiddleware } from '@tide/middleware';

describe('correlationMiddleware', () => {
  it('should add correlation ID to request', () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    correlationMiddleware(req, res, next);

    expect(req.correlationId).toBeDefined();
    expect(res.setHeader).toHaveBeenCalledWith(
      'X-Correlation-ID',
      req.correlationId
    );
    expect(next).toHaveBeenCalled();
  });
});
```

### Testing Async Handlers

```typescript
import { asyncHandler } from '@tide/middleware';

describe('asyncHandler', () => {
  it('should catch errors', async () => {
    const error = new Error('Test error');
    const handler = vi.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(handler);

    const next = vi.fn();

    wrapped(req, res, next);

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(next).toHaveBeenCalledWith(error);
  });
});
```

## Coverage Requirements

The project maintains the following coverage thresholds:

- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 70%
- **Statements**: 70%

### Viewing Coverage

```bash
# Generate coverage report
pnpm test:coverage

# View HTML coverage report
open coverage/index.html
```

Coverage reports are generated in the `coverage/` directory and include:
- `lcov.info` - LCOV format for CI tools
- `coverage-final.json` - JSON format
- `index.html` - Interactive HTML report

## Continuous Integration

Tests run automatically on:
- Every pull request
- Every push to main
- Nightly builds

### CI Configuration

Tests must pass before merging. The CI pipeline:
1. Installs dependencies
2. Builds all packages
3. Runs all tests
4. Generates coverage report
5. Fails if coverage drops below thresholds

## Debugging Tests

### Run Specific Tests

```bash
# Run tests matching pattern
pnpm test repository

# Run single test file
pnpm vitest run src/service.base.test.ts

# Run in debug mode
node --inspect-brk node_modules/.bin/vitest
```

### Use Test UI

The test UI provides a browser-based interface for running and debugging tests:

```bash
pnpm test:ui
```

Features:
- Visual test explorer
- Real-time test results
- Code coverage visualization
- Test re-running on file changes

### Console Logging

```typescript
it('debugs complex logic', () => {
  const result = complexFunction(input);

  console.log('Result:', result); // Visible in test output

  expect(result).toBeDefined();
});
```

## Common Issues

### Tests Timing Out

```typescript
// Increase timeout for slow tests
it('slow operation', async () => {
  await slowOperation();
}, 30000); // 30 second timeout
```

### Tests Sharing State

```typescript
// Use unique keys/IDs for each test
beforeEach(() => {
  testId = `test-${Date.now()}-${Math.random()}`;
});
```

### Fake Timers Not Working

```typescript
// Ensure timers are properly set up and torn down
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});
```

### Mock Not Working

```typescript
// Clear mocks between tests
afterEach(() => {
  vi.clearAllMocks();
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

## Getting Help

If you encounter issues with tests:

1. Check this documentation
2. Review existing test files for examples
3. Ask in the #engineering Slack channel
4. Review test failures in CI logs
