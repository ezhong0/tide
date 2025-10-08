# Code Quality & Architecture Improvement Plan

**Goal**: Elevate codebase to production-grade quality before MVP launch
**Timeline**: 2 weeks (Week 4-5)
**Effort**: ~80 hours
**Status**: Phase 1 Ready to Start

---

## Executive Summary

### Why Architecture First?
1. **Clean code is easier to test** - Write tests for well-structured code
2. **Prevents technical debt** - Fix patterns now vs. later refactoring
3. **Team velocity** - Clear patterns = faster feature development
4. **Reduces bugs** - Better structure = fewer edge cases

### Quality Improvements Roadmap

```
Week 4: Code Quality & Architecture (60 hours)
├── Phase 1: Code Cleanup (16h)
│   ├── Remove console.log (22 instances)
│   ├── Address TODOs/FIXMEs (34 instances)
│   └── Fix Swift force unwraps (15+ instances)
│
├── Phase 2: Architecture Refinement (24h)
│   ├── Replace relative imports (37 files)
│   ├── Modularize large files (5 files >400 LOC)
│   └── Standardize error handling
│
├── Phase 3: Standardization (12h)
│   ├── Add ESLint + Prettier
│   ├── Enforce code style
│   └── Add pre-commit hooks
│
└── Phase 4: Documentation (8h)
    ├── Add JSDoc to public APIs
    ├── Add missing package READMEs
    └── Document patterns

Week 5: Validation & Refinement (20 hours)
├── Code review of all changes
├── Architecture validation
└── Create style guide
```

---

## Phase 1: Code Cleanup (Days 1-2, 16 hours)

### Goal: Remove code smells and technical debt markers

### 1.1 Replace console.log with Structured Logging (3 hours)

**Issue**: 22 console.log statements in production code

**Files to Fix**:
```bash
# Find all console.log instances
grep -r "console\.log" packages/services --include="*.ts" | wc -l
# Result: 22 files

# Key locations:
packages/services/ai/src/orchestration/ai-orchestrator.ts:47
packages/services/email/src/index.ts:128
packages/services/calendar/src/index.ts:92
apps/mobile-ios/Services/WebSocketManager.swift:67
```

**Action Plan**:
```typescript
// BEFORE: console.log
console.log('User authenticated', userId);

// AFTER: Structured logging with @tide/logger
import { logger } from '@tide/logger';

logger.info('user_authenticated', {
  userId,
  timestamp: new Date().toISOString(),
  source: 'auth_service'
});
```

**Script to Automate**:
```bash
# Create script: scripts/fix-logging.sh
#!/bin/bash
# Replace console.log with logger.info in TypeScript files

find packages/services -name "*.ts" -type f -exec sed -i '' \
  's/console\.log(/logger.info(/g' {} \;

# Then manually verify and add import statements
```

**Checklist**:
- [ ] Replace all console.log in packages/services/ (15 instances)
- [ ] Replace console.log in packages/shared/ (4 instances)
- [ ] Replace console.log in packages/libraries/ (3 instances)
- [ ] Update Swift print() to proper logging (iOS app)
- [ ] Verify all imports added
- [ ] Run build to ensure no breakage

---

### 1.2 Address TODO/FIXME Comments (8 hours)

**Issue**: 34 TODO/FIXME/HACK comments indicating incomplete work

**Strategy**: For each TODO, either:
1. **Fix immediately** (if <30 min)
2. **Create GitHub issue** (if >30 min, defer to backlog)
3. **Remove if obsolete** (if already fixed)

**TODO Audit Results**:
```bash
# High Priority TODOs (Must fix this week):
packages/services/ai/src/models/clients/anthropic-client.ts:41
  // TODO: Add proper JWT expiry check

apps/mobile-ios/TideApp/Services/AuthManager.swift:22
  // TODO: Implement Supabase auth

packages/services/email/src/composer/smart-composer.ts:128
  // TODO: Add proper name extraction from display name

# Medium Priority (Create issues):
packages/services/calendar/src/meeting-prep/meeting-preparation.ts:269
  // TODO: Query real database instead of mock data

# Low Priority (Remove if obsolete):
packages/shared/types/src/index.ts:45
  // TODO: Add more branded types (already done)
```

**Action Plan**:

**Week 4, Day 1** (4 hours):
- [ ] Fix AuthManager placeholder implementation
  ```swift
  // Current: Placeholder
  isAuthenticated = true

  // Fix: Real Supabase integration
  func signIn(email: String, password: String) async throws {
    let session = try await supabase.auth.signIn(
      email: email,
      password: password
    )
    self.session = session
    self.isAuthenticated = true
  }
  ```

- [ ] Fix JWT expiry check in APIClient
  ```typescript
  // Add JWT decoding and expiry validation
  private isTokenExpired(token: string): boolean {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  }
  ```

- [ ] Complete name extraction in smart-composer
  ```typescript
  // Already fixed in Bug #19, remove TODO comment
  ```

**Week 4, Day 2** (4 hours):
- [ ] Create GitHub issues for remaining 20 TODOs
- [ ] Label as "tech-debt" and prioritize
- [ ] Remove obsolete TODOs (10 already fixed)
- [ ] Update code with issue references

**Template for GitHub Issues**:
```markdown
## TODO: [Description]

**Location**: `file.ts:line`
**Priority**: Medium
**Effort**: 2 hours
**Context**: [Why this TODO exists]

**Proposed Solution**: [How to fix]

**Acceptance Criteria**:
- [ ] Implementation complete
- [ ] Tests added
- [ ] Documentation updated
```

---

### 1.3 Fix Swift Force Unwraps (3 hours)

**Issue**: 15+ force unwraps (!) in iOS code - potential crashes

**Files to Fix**:
```swift
// Found in grep:
apps/mobile-ios/TideApp/Services/APIClient.swift
apps/mobile-ios/Services/WebSocketManager.swift
apps/mobile-ios/TideApp/Features/Chat/ChatViewModel.swift
```

**Action Plan**:
```swift
// BEFORE: Force unwrap (crashes if nil)
let url = URL(string: baseURL + path)!
var request = URLRequest(url: url)

// AFTER: Guard let with proper error handling
guard let url = URL(string: baseURL + path) else {
    throw APIError.invalidURL
}
var request = URLRequest(url: url)
```

**Checklist**:
- [ ] Find all force unwraps: `grep -r "!" apps/mobile-ios --include="*.swift" | grep -v "!=" | grep -v "// !"`
- [ ] Replace with guard let or if let
- [ ] Add proper error handling
- [ ] Test app doesn't crash on nil cases
- [ ] Add SwiftLint rule to prevent future force unwraps

---

### 1.4 Remove Direct process.env Access (2 hours)

**Issue**: 36 files access process.env directly instead of using @tide/config

**Why This Matters**:
- Centralized config = easier to change
- Type safety for environment variables
- Validation at startup (fail fast)
- Clear documentation of required vars

**Action Plan**:
```typescript
// BEFORE: Direct access (no validation, no types)
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error('Missing API key');

// AFTER: Use @tide/config (validated, typed)
import { config } from '@tide/config';

const apiKey = config.openai.apiKey; // Type-safe, validated at startup
```

**Implementation**:
```typescript
// packages/shared/config/src/index.ts

import { z } from 'zod';

const envSchema = z.object({
  openai: z.object({
    apiKey: z.string().min(1),
    orgId: z.string().optional(),
  }),
  anthropic: z.object({
    apiKey: z.string().min(1),
  }),
  supabase: z.object({
    url: z.string().url(),
    anonKey: z.string().min(1),
    serviceKey: z.string().min(1),
  }),
});

// Validate on startup - fail fast if misconfigured
export const config = envSchema.parse({
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    orgId: process.env.OPENAI_ORG_ID,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
});
```

**Checklist**:
- [ ] Enhance @tide/config with all environment variables
- [ ] Add Zod validation for all config values
- [ ] Replace process.env in all 36 files
- [ ] Add .env.example with all required variables
- [ ] Document config in packages/shared/config/README.md

---

## Phase 2: Architecture Refinement (Days 3-4, 24 hours)

### Goal: Improve module boundaries and code organization

### 2.1 Replace Relative Imports with Workspace References (6 hours)

**Issue**: 37 files use `../../` imports across package boundaries

**Why This Matters**:
- Harder to move files (tight coupling)
- No clear package boundaries
- Breaks when refactoring
- Not reusable in other projects

**Current State**:
```typescript
// BAD: Relative import across packages (found in 37 files)
import { BaseAgent } from '../../base-agent.ts';
import { logger } from '../../../libraries/logger/src/index.js';

// GOOD: Workspace reference
import { BaseAgent } from '@tide/ai-agents';
import { logger } from '@tide/logger';
```

**Action Plan**:

**Step 1: Update package.json exports (2 hours)**
```json
// packages/services/ai/package.json
{
  "name": "@tide/ai",
  "exports": {
    ".": "./src/index.ts",
    "./agents": "./src/agents/index.ts",
    "./orchestration": "./src/orchestration/index.ts",
    "./models": "./src/models/index.ts"
  }
}
```

**Step 2: Create index.ts barrel exports (2 hours)**
```typescript
// packages/services/ai/src/agents/index.ts
export { BaseAgent } from './base-agent.js';
export { SwarmCoordinator } from './swarm-coordinator.js';
export * from './calendar/index.js';
export * from './email/index.js';
```

**Step 3: Replace imports (2 hours)**
```bash
# Script to automate: scripts/fix-imports.sh
#!/bin/bash

# Replace relative imports with workspace references
find packages/services/ai/src -name "*.ts" -exec sed -i '' \
  's|import.*from.*"\.\./\.\./base-agent"|import { BaseAgent } from "@tide/ai/agents"|g' {} \;

# Verify no broken imports
pnpm type-check
```

**Checklist**:
- [ ] Add exports field to all package.json (14 packages)
- [ ] Create barrel exports (index.ts) for each package
- [ ] Replace relative imports in packages/services/ai (15 files)
- [ ] Replace relative imports in packages/services/email (8 files)
- [ ] Replace relative imports in packages/services/calendar (7 files)
- [ ] Replace relative imports in packages/services/workflow (7 files)
- [ ] Run type-check to verify no broken imports
- [ ] Update tsconfig.json paths if needed

---

### 2.2 Modularize Large Files (8 hours)

**Issue**: 5 files exceed 400 lines - harder to understand and test

**Files to Refactor**:
```
packages/services/email/src/index.ts (467 lines)
packages/services/calendar/src/index.ts (428 lines)
packages/services/ai/src/server.ts (385 lines)
packages/services/email/src/composer/smart-composer.ts (621 lines)
packages/services/calendar/src/meeting-prep/meeting-preparation.ts (675 lines)
```

**Strategy**: Break into smaller, focused modules

**Example: email/src/index.ts (467 lines → 4 files)**

**Before**:
```
email/src/index.ts (467 lines)
├── Imports (50 lines)
├── Route handlers (200 lines)
├── Service logic (150 lines)
└── Server setup (67 lines)
```

**After**:
```
email/src/
├── server.ts (80 lines)          # Express app setup
├── routes/
│   ├── index.ts (50 lines)       # Route registration
│   ├── emails.routes.ts (80 lines)
│   └── compose.routes.ts (60 lines)
├── controllers/
│   ├── emails.controller.ts (100 lines)
│   └── compose.controller.ts (80 lines)
└── services/
    └── email.service.ts (120 lines)
```

**Benefits**:
- ✅ Single Responsibility Principle
- ✅ Easier to test (mock dependencies)
- ✅ Easier to understand (< 150 lines per file)
- ✅ Easier to reuse (import specific controller)

**Action Plan for Each Large File** (2 hours each):

**Email Service Refactor** (2 hours):
```typescript
// email/src/routes/emails.routes.ts
import { Router } from 'express';
import { EmailsController } from '../controllers/emails.controller.js';

export const emailsRouter = Router();
const controller = new EmailsController();

emailsRouter.get('/:userId/:provider', controller.getEmails);
emailsRouter.post('/:userId/:provider', controller.sendEmail);

// email/src/controllers/emails.controller.ts
import { EmailService } from '../services/email.service.js';

export class EmailsController {
  private service = new EmailService();

  getEmails = async (req: Request, res: Response) => {
    const { userId, provider } = req.params;
    const emails = await this.service.fetchEmails(userId, provider);
    res.json(emails);
  };
}

// email/src/services/email.service.ts
export class EmailService {
  async fetchEmails(userId: string, provider: string) {
    // Business logic here
  }
}
```

**Checklist**:
- [ ] Refactor email/src/index.ts (467 → 80 lines)
- [ ] Refactor calendar/src/index.ts (428 → 80 lines)
- [ ] Refactor ai/src/server.ts (385 → 100 lines)
- [ ] Refactor smart-composer.ts (621 → 150 lines each for 4 modules)
- [ ] Refactor meeting-preparation.ts (675 → 150 lines each for 5 modules)
- [ ] Update imports in dependent files
- [ ] Verify all tests still pass

---

### 2.3 Standardize Error Handling (6 hours)

**Issue**: Inconsistent error handling patterns across services

**Current State** (3 different patterns):
```typescript
// Pattern 1: Try-catch with logger.error
try {
  await doSomething();
} catch (error) {
  logger.error({ error }, 'Failed to do something');
  throw error;
}

// Pattern 2: Try-catch with custom error
try {
  await doSomething();
} catch (error) {
  throw new EmailError('Failed', { cause: error });
}

// Pattern 3: No error handling (propagates up)
await doSomething(); // Crashes if error
```

**Goal**: Single consistent pattern using @tide/errors

**Standardized Pattern**:
```typescript
import { createError, ErrorCode } from '@tide/errors';

try {
  await doSomething();
} catch (error) {
  // Log error with context
  logger.error(
    { error, userId, operation: 'do_something' },
    'Operation failed'
  );

  // Throw structured error
  throw createError(
    ErrorCode.OPERATION_FAILED,
    'Failed to do something',
    { cause: error, userId }
  );
}
```

**Implementation Plan**:

**Step 1: Enhance @tide/errors (2 hours)**
```typescript
// packages/shared/errors/src/index.ts

export enum ErrorCode {
  // Existing codes (90+)

  // Add missing codes
  EMAIL_FETCH_FAILED = 'EMAIL_FETCH_FAILED',
  CALENDAR_SYNC_FAILED = 'CALENDAR_SYNC_FAILED',
  AI_REQUEST_TIMEOUT = 'AI_REQUEST_TIMEOUT',
  // ... add 20 more
}

export interface ErrorContext {
  userId?: string;
  requestId?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export function createError(
  code: ErrorCode,
  message: string,
  context?: ErrorContext
): TideError {
  return new TideError(code, message, context);
}

export class TideError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public context?: ErrorContext
  ) {
    super(message);
    this.name = 'TideError';
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      context: this.context,
    };
  }
}
```

**Step 2: Add Express Error Middleware (2 hours)**
```typescript
// packages/libraries/server-utils/src/error-middleware.ts

import { TideError } from '@tide/errors';
import { logger } from '@tide/logger';

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  logger.error(
    {
      error: err,
      path: req.path,
      method: req.method,
      userId: req.user?.id,
    },
    'Request failed'
  );

  // Handle TideError
  if (err instanceof TideError) {
    return res.status(getStatusCode(err.code)).json({
      error: {
        code: err.code,
        message: err.message,
        context: err.context,
      },
    });
  }

  // Handle unknown errors
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}

function getStatusCode(code: ErrorCode): number {
  // Map error codes to HTTP status codes
  const statusMap: Record<ErrorCode, number> = {
    [ErrorCode.UNAUTHORIZED]: 401,
    [ErrorCode.FORBIDDEN]: 403,
    [ErrorCode.NOT_FOUND]: 404,
    [ErrorCode.VALIDATION_ERROR]: 400,
    // ... map all 90+ codes
  };
  return statusMap[code] || 500;
}
```

**Step 3: Update All Services (2 hours)**
```typescript
// Apply to all services (AI, Email, Calendar, Workflow, Gateway)

// Before: Inconsistent
try {
  await emailService.send(email);
} catch (error) {
  console.error('Failed to send', error); // ❌
  throw error;
}

// After: Standardized
import { createError, ErrorCode } from '@tide/errors';
import { logger } from '@tide/logger';

try {
  await emailService.send(email);
} catch (error) {
  logger.error(
    { error, emailId, userId },
    'Failed to send email'
  );
  throw createError(
    ErrorCode.EMAIL_SEND_FAILED,
    'Failed to send email',
    { cause: error, emailId, userId }
  );
}

// Add error middleware to all Express apps
app.use(errorMiddleware);
```

**Checklist**:
- [ ] Add missing error codes to @tide/errors (20 codes)
- [ ] Create error middleware in @tide/server-utils
- [ ] Update AI service error handling (15 try-catch blocks)
- [ ] Update Email service error handling (12 try-catch blocks)
- [ ] Update Calendar service error handling (10 try-catch blocks)
- [ ] Update Workflow service error handling (8 try-catch blocks)
- [ ] Update Gateway service error handling (5 try-catch blocks)
- [ ] Add error middleware to all Express apps
- [ ] Test error responses (Postman/Insomnia)

---

### 2.4 Create Shared UI Components (Mobile) (4 hours)

**Issue**: No shared component library - duplicated UI code

**Current State**:
```
apps/mobile-ios/TideApp/Features/
├── Chat/ChatView.swift (custom UI)
├── Email/EmailListView.swift (custom UI)
├── Calendar/CalendarView.swift (custom UI)
└── Tasks/TaskListView.swift (custom UI)

// Each view duplicates:
- Loading states
- Error states
- Empty states
- List rows
- Buttons
- Input fields
```

**Goal**: Create `packages/libraries/ui-components` for reusable iOS components

**Action Plan**:

**Step 1: Create Package (1 hour)**
```bash
# Create shared UI components package
mkdir -p packages/libraries/ui-components
cd packages/libraries/ui-components

# Create package structure
packages/libraries/ui-components/
├── ios/
│   ├── Components/
│   │   ├── LoadingView.swift
│   │   ├── ErrorView.swift
│   │   ├── EmptyStateView.swift
│   │   ├── PrimaryButton.swift
│   │   └── SecondaryButton.swift
│   ├── Modifiers/
│   │   ├── CardModifier.swift
│   │   └── ShimmerModifier.swift
│   └── Utilities/
│       ├── Colors.swift
│       └── Typography.swift
└── android/ (future)
```

**Step 2: Create Reusable Components (2 hours)**
```swift
// ios/Components/LoadingView.swift
import SwiftUI

public struct LoadingView: View {
    let message: String

    public init(message: String = "Loading...") {
        self.message = message
    }

    public var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.5)
            Text(message)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// ios/Components/ErrorView.swift
public struct ErrorView: View {
    let error: String
    let retry: (() -> Void)?

    public init(error: String, retry: (() -> Void)? = nil) {
        self.error = error
        self.retry = retry
    }

    public var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 48))
                .foregroundColor(.red)

            Text(error)
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)

            if let retry = retry {
                PrimaryButton(title: "Retry", action: retry)
            }
        }
        .padding()
    }
}

// ios/Components/PrimaryButton.swift
public struct PrimaryButton: View {
    let title: String
    let action: () -> Void
    let isLoading: Bool

    public init(
        title: String,
        isLoading: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.isLoading = isLoading
        self.action = action
    }

    public var body: some View {
        Button(action: action) {
            HStack {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                } else {
                    Text(title)
                        .fontWeight(.semibold)
                }
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.accentColor)
            .foregroundColor(.white)
            .cornerRadius(12)
        }
        .disabled(isLoading)
    }
}
```

**Step 3: Refactor Existing Views (1 hour)**
```swift
// Before: Duplicated UI code
struct ChatView: View {
    @StateObject var viewModel = ChatViewModel()

    var body: some View {
        if viewModel.isLoading {
            ProgressView("Loading messages...")
        } else if let error = viewModel.error {
            VStack {
                Text(error)
                Button("Retry") { /* ... */ }
            }
        } else {
            // Chat UI
        }
    }
}

// After: Using shared components
import UIComponents

struct ChatView: View {
    @StateObject var viewModel = ChatViewModel()

    var body: some View {
        if viewModel.isLoading {
            LoadingView(message: "Loading messages...")
        } else if let error = viewModel.error {
            ErrorView(error: error) {
                Task { await viewModel.loadMessages() }
            }
        } else {
            // Chat UI
        }
    }
}
```

**Checklist**:
- [ ] Create packages/libraries/ui-components package
- [ ] Implement LoadingView component
- [ ] Implement ErrorView component
- [ ] Implement EmptyStateView component
- [ ] Implement PrimaryButton component
- [ ] Implement SecondaryButton component
- [ ] Create Colors utility
- [ ] Create Typography utility
- [ ] Refactor ChatView to use components
- [ ] Refactor EmailListView to use components
- [ ] Refactor CalendarView to use components
- [ ] Refactor TaskListView to use components

---

## Phase 3: Standardization (Day 5, 12 hours)

### Goal: Enforce consistent code style and quality

### 3.1 Add ESLint + Prettier Configuration (4 hours)

**Issue**: No linting or formatting rules - inconsistent code style

**Action Plan**:

**Step 1: Install Dependencies (30 min)**
```bash
# Root package.json
pnpm add -D -w \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  prettier \
  eslint-config-prettier \
  eslint-plugin-prettier
```

**Step 2: Create ESLint Config (1 hour)**
```javascript
// .eslintrc.js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
  rules: {
    // Enforce best practices
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // Prevent bugs
    'no-console': 'error', // Use logger instead
    'no-debugger': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',

    // Code style
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: { regex: '^I[A-Z]', match: false }, // No "I" prefix
      },
    ],

    // Performance
    '@typescript-eslint/prefer-readonly': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
  },
};
```

**Step 3: Create Prettier Config (30 min)**
```javascript
// .prettierrc.js
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  arrowParens: 'always',
  endOfLine: 'lf',
};
```

**Step 4: Add NPM Scripts (30 min)**
```json
// package.json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx --max-warnings 0",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,json,md}\"",
    "type-check": "tsc --noEmit"
  }
}
```

**Step 5: Fix All Lint Errors (1.5 hours)**
```bash
# Run lint and fix auto-fixable issues
pnpm lint:fix

# Fix remaining issues manually
# Expected: 50-100 errors to fix
```

**Checklist**:
- [ ] Install ESLint + Prettier
- [ ] Create .eslintrc.js configuration
- [ ] Create .prettierrc.js configuration
- [ ] Add .eslintignore and .prettierignore
- [ ] Run lint:fix on all TypeScript files
- [ ] Manually fix remaining lint errors
- [ ] Verify build still works: `pnpm build`

---

### 3.2 Add Pre-Commit Hooks (2 hours)

**Goal**: Prevent bad code from being committed

**Action Plan**:

**Step 1: Install Husky + Lint-Staged (30 min)**
```bash
pnpm add -D -w husky lint-staged

# Initialize husky
npx husky install
npm pkg set scripts.prepare="husky install"

# Create pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

**Step 2: Configure Lint-Staged (30 min)**
```javascript
// .lintstagedrc.js
module.exports = {
  // TypeScript files
  '**/*.{ts,tsx}': [
    'eslint --fix --max-warnings 0',
    'prettier --write',
    () => 'tsc --noEmit', // Type check
  ],

  // JSON/Markdown files
  '**/*.{json,md}': ['prettier --write'],

  // Swift files
  '**/*.swift': [
    'swiftlint --fix',
    'swiftformat',
  ],
};
```

**Step 3: Add Commit Message Linting (1 hour)**
```bash
# Install commitlint
pnpm add -D -w @commitlint/cli @commitlint/config-conventional

# Create commitlint config
echo "module.exports = { extends: ['@commitlint/config-conventional'] };" > .commitlintrc.js

# Add commit-msg hook
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit ${1}'
```

**Commit Message Format**:
```bash
# Valid formats:
feat: add email triage engine
fix: resolve race condition in chat
docs: update architecture ADRs
refactor: extract email routes to separate file
test: add unit tests for AI orchestrator

# Invalid (will be rejected):
update code
WIP
fix bug
```

**Checklist**:
- [ ] Install husky and lint-staged
- [ ] Create pre-commit hook
- [ ] Configure lint-staged for TS/Swift files
- [ ] Install commitlint
- [ ] Add commit-msg hook
- [ ] Test pre-commit hook works
- [ ] Document commit message format in CONTRIBUTING.md

---

### 3.3 Add SwiftLint for iOS Code (2 hours)

**Goal**: Enforce Swift code quality

**Action Plan**:

**Step 1: Install SwiftLint (15 min)**
```bash
# Install via Homebrew
brew install swiftlint

# Add to Xcode Build Phase
# In Xcode: Target → Build Phases → New Run Script Phase
if which swiftlint >/dev/null; then
  swiftlint
else
  echo "warning: SwiftLint not installed"
fi
```

**Step 2: Create SwiftLint Config (45 min)**
```yaml
# .swiftlint.yml
disabled_rules:
  - trailing_whitespace

opt_in_rules:
  - empty_count
  - empty_string
  - explicit_init
  - force_unwrapping # Enforce our force unwrap fixes!

excluded:
  - Pods
  - .build
  - DerivedData

line_length:
  warning: 120
  error: 150

type_body_length:
  warning: 300
  error: 500

file_length:
  warning: 400
  error: 600

identifier_name:
  min_length:
    warning: 2
  excluded:
    - id
    - URL
```

**Step 3: Fix SwiftLint Violations (1 hour)**
```bash
# Run SwiftLint
cd apps/mobile-ios
swiftlint

# Auto-fix what's possible
swiftlint --fix

# Manually fix remaining issues
# Expected: 20-30 violations
```

**Checklist**:
- [ ] Install SwiftLint
- [ ] Create .swiftlint.yml configuration
- [ ] Add SwiftLint to Xcode build phase
- [ ] Run swiftlint --fix
- [ ] Fix remaining violations manually
- [ ] Verify app builds without warnings

---

### 3.4 Add Type Safety Improvements (4 hours)

**Goal**: Eliminate `any` types and improve type coverage

**Issue**: TypeScript `any` types bypass type checking

**Action Plan**:

**Step 1: Enable Strict Type Checking (1 hour)**
```json
// tsconfig.json - already enabled, but verify:
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Additional strict flags
    "noUncheckedIndexedAccess": true, // Add this!
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Step 2: Find and Fix `any` Types (2 hours)**
```bash
# Find all 'any' types
grep -r ": any" packages/services --include="*.ts" | wc -l
# Expected: 30-50 instances

# Common patterns to fix:
# 1. Function parameters
function process(data: any) { } // BAD
function process(data: unknown) { } // GOOD (then narrow with type guards)

# 2. Object types
const config: any = {}; // BAD
interface Config { ... }; const config: Config = {}; // GOOD

# 3. Error handling
catch (error: any) { } // BAD
catch (error: unknown) { } // GOOD
```

**Step 3: Add Type Guards (1 hour)**
```typescript
// Create type guards for common patterns

// packages/shared/types/src/guards.ts
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export function isUserId(value: unknown): value is UserId {
  return typeof value === 'string' && value.startsWith('user_');
}

export function isValidEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Use in error handling:
try {
  await doSomething();
} catch (error: unknown) {
  if (isError(error)) {
    logger.error({ error: error.message }, 'Operation failed');
  } else {
    logger.error({ error }, 'Unknown error');
  }
}
```

**Checklist**:
- [ ] Enable noUncheckedIndexedAccess in tsconfig
- [ ] Find all `: any` types (grep search)
- [ ] Replace with proper types or `unknown`
- [ ] Create type guards for common patterns
- [ ] Update error handling to use type guards
- [ ] Run type-check: `pnpm type-check`
- [ ] Verify no new type errors introduced

---

## Phase 4: Documentation & Validation (Week 5, Days 1-2, 20 hours)

### Goal: Document improvements and validate quality

### 4.1 Add JSDoc to Public APIs (8 hours)

**Goal**: 80% of public functions documented

**Current State**: ~30% documented

**Action Plan**:

**Step 1: Create JSDoc Template (1 hour)**
```typescript
// packages/shared/docs/JSDOC_TEMPLATE.md

/**
 * Brief one-line description
 *
 * Detailed description explaining:
 * - What the function does
 * - When to use it
 * - Any side effects
 *
 * @param paramName - Description of parameter
 * @param optionalParam - Description (optional)
 * @returns Description of return value
 * @throws {ErrorCode} When this error occurs
 *
 * @example
 * ```typescript
 * const result = await functionName(arg1, arg2);
 * console.log(result);
 * ```
 */
```

**Step 2: Document Core Services (4 hours)**
```typescript
// Example: AIOrchestrator

/**
 * Orchestrates AI requests across multiple models and agents
 *
 * The AIOrchestrator handles:
 * - Model selection based on request complexity
 * - Intent detection and classification
 * - Agent coordination via swarm pattern
 * - Result aggregation and ranking
 *
 * @param request - The AI request containing user input and context
 * @returns AI response with intents, actions, and confidence scores
 * @throws {ErrorCode.AI_REQUEST_TIMEOUT} When request exceeds timeout (30s)
 * @throws {ErrorCode.AI_MODEL_UNAVAILABLE} When all models are down
 *
 * @example
 * ```typescript
 * const orchestrator = new AIOrchestrator();
 * const response = await orchestrator.process({
 *   userId: 'user_123',
 *   content: 'Schedule meeting with John tomorrow at 2pm',
 *   context: { timezone: 'America/Los_Angeles' }
 * });
 *
 * console.log(response.intents); // [{ category: 'calendar_schedule', ... }]
 * ```
 */
export class AIOrchestrator {
  /**
   * Process an AI request through the orchestration pipeline
   *
   * Steps:
   * 1. Select optimal model (Claude/GPT-4)
   * 2. Detect user intents
   * 3. Select and coordinate agents
   * 4. Aggregate results
   * 5. Rank by confidence
   *
   * @param request - AI request with user input and context
   * @returns Processed response with intents and actions
   */
  async process(request: AIRequest): Promise<AIResponse> {
    // Implementation
  }
}
```

**Step 3: Document Shared Packages (2 hours)**
```typescript
// Document all exports in:
// - @tide/errors (90+ error codes)
// - @tide/validation (Zod schemas)
// - @tide/types (branded types)
// - @tide/logger (logging functions)

/**
 * Creates a structured error with code and context
 *
 * Use this instead of throwing raw Error objects to maintain
 * consistency across services and enable better error tracking.
 *
 * @param code - Error code from ErrorCode enum
 * @param message - Human-readable error message
 * @param context - Additional error context (userId, requestId, etc.)
 * @returns TideError instance ready to throw
 *
 * @example
 * ```typescript
 * throw createError(
 *   ErrorCode.EMAIL_SEND_FAILED,
 *   'Failed to send email via Gmail API',
 *   { userId, emailId, cause: originalError }
 * );
 * ```
 */
export function createError(
  code: ErrorCode,
  message: string,
  context?: ErrorContext
): TideError {
  return new TideError(code, message, context);
}
```

**Step 4: Generate Documentation Site (1 hour)**
```bash
# Install TypeDoc
pnpm add -D -w typedoc

# Generate docs
npx typedoc \
  --out docs/api \
  --entryPointStrategy packages \
  packages/*/src/index.ts

# Add to package.json
"docs:generate": "typedoc --out docs/api packages/*/src/index.ts"
"docs:serve": "npx http-server docs/api"
```

**Checklist**:
- [ ] Create JSDoc template
- [ ] Document AIOrchestrator class (10 methods)
- [ ] Document EmailTriageEngine class (8 methods)
- [ ] Document CalendarOptimizer class (12 methods)
- [ ] Document SmartComposer class (15 methods)
- [ ] Document @tide/errors exports (5 functions)
- [ ] Document @tide/validation exports (20+ schemas)
- [ ] Document @tide/types exports (30+ types)
- [ ] Generate TypeDoc documentation site
- [ ] Add docs:generate to CI pipeline

---

### 4.2 Add Missing Package READMEs (4 hours)

**Goal**: Every package has usage documentation

**Missing READMEs**:
```
packages/libraries/database/README.md
packages/libraries/logger/README.md
packages/shared/types/README.md
packages/shared/config/README.md
packages/shared/validation/README.md
packages/shared/utils/README.md
packages/shared/contracts/README.md
```

**README Template**:
```markdown
# @tide/package-name

Brief one-line description

## Installation

\`\`\`bash
pnpm add @tide/package-name
\`\`\`

## Usage

### Basic Example

\`\`\`typescript
import { MainExport } from '@tide/package-name';

const instance = new MainExport();
await instance.method();
\`\`\`

### Advanced Examples

...

## API Reference

### MainExport

...

## Configuration

...

## Best Practices

...

## Troubleshooting

...
```

**Action Plan** (30 min per package × 7 packages = 3.5 hours):

**Example: packages/libraries/logger/README.md**
```markdown
# @tide/logger

Structured logging with Pino for all Tide services

## Features

- ✅ Structured JSON logging
- ✅ Sensitive data redaction (passwords, tokens, emails)
- ✅ Request/response correlation IDs
- ✅ Multiple log levels (debug, info, warn, error)
- ✅ Pretty printing in development

## Installation

\`\`\`bash
pnpm add @tide/logger
\`\`\`

## Usage

### Basic Logging

\`\`\`typescript
import { logger } from '@tide/logger';

// Info log
logger.info({ userId: 'user_123' }, 'User logged in');

// Error log
logger.error({ error, userId }, 'Failed to fetch emails');

// Debug log (only in development)
logger.debug({ request }, 'Processing request');
\`\`\`

### Custom Logger

\`\`\`typescript
import { createLogger } from '@tide/logger';

const logger = createLogger({
  component: 'email-service',
  level: 'debug'
});

logger.info({ emailId }, 'Email sent');
\`\`\`

### Redaction

Sensitive fields are automatically redacted:

\`\`\`typescript
logger.info({
  email: 'user@example.com', // Redacted as "u***@example.com"
  password: 'secret123',      // Redacted as "[REDACTED]"
  apiKey: 'sk-ant-123',       // Redacted as "[REDACTED]"
}, 'User registered');
\`\`\`

## Configuration

Set log level via environment:

\`\`\`bash
LOG_LEVEL=debug # debug, info, warn, error
NODE_ENV=production # Disables pretty printing
\`\`\`

## Best Practices

1. **Use structured fields** instead of string concatenation:
   \`\`\`typescript
   // ✅ Good
   logger.info({ userId, action: 'login' }, 'User action');

   // ❌ Bad
   logger.info(\`User \${userId} performed login\`);
   \`\`\`

2. **Include context** for debugging:
   \`\`\`typescript
   logger.error({
     error,
     userId,
     requestId,
     emailId,
     timestamp: new Date().toISOString()
   }, 'Operation failed');
   \`\`\`

3. **Use appropriate log levels**:
   - `debug`: Detailed diagnostic info
   - `info`: Normal operations (user login, email sent)
   - `warn`: Degraded performance (API slow response)
   - `error`: Errors requiring attention (API failure)

## API Reference

See [TypeDoc documentation](../../../docs/api/logger)
\`\`\`

**Checklist**:
- [ ] Write README for @tide/database
- [ ] Write README for @tide/logger
- [ ] Write README for @tide/types
- [ ] Write README for @tide/config
- [ ] Write README for @tide/validation
- [ ] Write README for @tide/utils
- [ ] Write README for @tide/contracts
- [ ] Add links to TypeDoc in each README

---

### 4.3 Create Code Style Guide (4 hours)

**Goal**: Document coding standards for team

**Action Plan**:

**Step 1: Create STYLE_GUIDE.md (2 hours)**
```markdown
# Tide Code Style Guide

## TypeScript

### Naming Conventions

\`\`\`typescript
// Interfaces: PascalCase (no "I" prefix)
interface UserProfile { }

// Classes: PascalCase
class EmailService { }

// Functions: camelCase
function processEmail() { }

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;

// Enums: PascalCase (members: UPPER_SNAKE_CASE)
enum ErrorCode {
  EMAIL_SEND_FAILED = 'EMAIL_SEND_FAILED'
}

// Type aliases: PascalCase
type UserId = Brand<string, 'UserId'>;
\`\`\`

### File Structure

\`\`\`typescript
// 1. Imports (external, then internal)
import express from 'express';
import { logger } from '@tide/logger';

// 2. Types/Interfaces
interface Config { }

// 3. Constants
const DEFAULT_TIMEOUT = 30000;

// 4. Main class/function
export class Service { }

// 5. Helper functions (private)
function helper() { }
\`\`\`

### Error Handling

\`\`\`typescript
// Always use @tide/errors
import { createError, ErrorCode } from '@tide/errors';

try {
  await operation();
} catch (error) {
  logger.error({ error, context }, 'Operation failed');
  throw createError(
    ErrorCode.OPERATION_FAILED,
    'Human-readable message',
    { userId, requestId }
  );
}
\`\`\`

### Async/Await

\`\`\`typescript
// ✅ Use async/await (not .then())
async function fetchData() {
  const data = await api.get('/data');
  return data;
}

// ✅ Handle errors
async function fetchData() {
  try {
    const data = await api.get('/data');
    return data;
  } catch (error) {
    logger.error({ error }, 'Failed to fetch');
    throw createError(...);
  }
}

// ✅ Use Promise.all for parallel operations
const [emails, events] = await Promise.all([
  fetchEmails(),
  fetchEvents()
]);
\`\`\`

## Swift

### Naming Conventions

\`\`\`swift
// Classes: PascalCase
class UserService { }

// Properties: camelCase
var userId: String

// Functions: camelCase
func fetchUser() async throws { }

// Constants: camelCase
let maxRetries = 3

// Enums: PascalCase
enum NetworkError {
    case timeout
    case invalidResponse
}
\`\`\`

### Error Handling

\`\`\`swift
// Use throws, not force unwraps
func fetchUser(id: String) async throws -> User {
    guard let url = URL(string: "\(baseURL)/users/\(id)") else {
        throw APIError.invalidURL
    }

    let (data, response) = try await session.data(from: url)

    guard let httpResponse = response as? HTTPURLResponse,
          (200...299).contains(httpResponse.statusCode) else {
        throw APIError.httpError(statusCode: statusCode)
    }

    return try decoder.decode(User.self, from: data)
}
\`\`\`

## File Organization

\`\`\`
services/ai/src/
├── index.ts                 # Service entry point
├── server.ts                # Express server setup
├── routes/                  # API routes
│   ├── index.ts
│   └── ai.routes.ts
├── controllers/             # Request handlers
│   └── ai.controller.ts
├── services/                # Business logic
│   └── ai.service.ts
├── models/                  # Data models
│   └── ai-request.model.ts
├── utils/                   # Helpers
│   └── validation.ts
└── __tests__/               # Tests
    ├── unit/
    └── integration/
\`\`\`

## Testing

### Test File Names

\`\`\`
src/services/email.service.ts
src/services/__tests__/unit/email.service.test.ts
src/services/__tests__/integration/email-flow.test.ts
\`\`\`

### Test Structure

\`\`\`typescript
describe('EmailService', () => {
  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      // Arrange
      const service = new EmailService();
      const email = createTestEmail();

      // Act
      const result = await service.sendEmail(email);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should handle API timeout', async () => {
      // Test error case
    });
  });
});
\`\`\`

## Git Commits

### Commit Message Format

\`\`\`bash
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

### Types

- feat: New feature
- fix: Bug fix
- docs: Documentation
- refactor: Code refactoring
- test: Add tests
- chore: Maintenance

### Examples

\`\`\`bash
feat(ai): add multi-model routing

Implement router that selects optimal model based on:
- Request complexity
- Model availability
- Cost optimization

Closes #123

---

fix(email): resolve race condition in triage engine

The triage engine was processing emails concurrently,
causing duplicate entries. Added mutex lock.

Fixes #456
\`\`\`

## Documentation

### JSDoc Comments

\`\`\`typescript
/**
 * Brief description
 *
 * Detailed explanation of what this does,
 * when to use it, and any caveats.
 *
 * @param param1 - Description
 * @param param2 - Description
 * @returns Description of return value
 * @throws {ErrorCode} When this happens
 *
 * @example
 * \`\`\`typescript
 * const result = await function(arg1, arg2);
 * \`\`\`
 */
export async function function(param1: string, param2: number): Promise<Result> {
  // Implementation
}
\`\`\`

## Best Practices

1. **Single Responsibility** - One class/function does one thing
2. **DRY** - Don't Repeat Yourself
3. **YAGNI** - You Aren't Gonna Need It (don't over-engineer)
4. **Type Safety** - No `any` types
5. **Error Handling** - Always handle errors explicitly
6. **Logging** - Use structured logging
7. **Testing** - Write tests for business logic
8. **Documentation** - Document public APIs

\`\`\`
```

**Step 2: Create CONTRIBUTING.md (1 hour)**
```markdown
# Contributing to Tide

## Development Setup

1. Clone repository
2. Install dependencies: `pnpm install`
3. Set up environment: Copy `.env.example` to `.env`
4. Start services: `docker-compose up`

## Development Workflow

1. Create feature branch: `git checkout -b feat/feature-name`
2. Make changes
3. Run tests: `pnpm test`
4. Run linter: `pnpm lint`
5. Commit: Follow commit message format
6. Push and create PR

## Code Review

- All PRs require approval
- CI must pass (tests, linting, type-check)
- Follows style guide

## Testing

- Write unit tests for new features
- Maintain >70% coverage
- Run `pnpm test:coverage`
\`\`\`

**Step 3: Document Architecture Patterns (1 hour)**
```markdown
# docs/ARCHITECTURE_PATTERNS.md

## Service Architecture

All services follow this structure:

\`\`\`
service/src/
├── routes/       # API endpoints
├── controllers/  # Request handlers
├── services/     # Business logic
├── models/       # Data models
└── utils/        # Helpers
\`\`\`

## Error Handling Pattern

\`\`\`typescript
// Every operation follows this pattern:
try {
  const result = await operation();
  logger.info({ result }, 'Operation succeeded');
  return result;
} catch (error) {
  logger.error({ error, context }, 'Operation failed');
  throw createError(ErrorCode.X, 'Message', context);
}
\`\`\`

## Dependency Injection

\`\`\`typescript
// Constructor injection for testability
class EmailService {
  constructor(
    private emailProvider: IEmailProvider,
    private triageEngine: TriageEngine
  ) {}
}

// Easy to mock in tests
const mockProvider = createMockEmailProvider();
const service = new EmailService(mockProvider, engine);
\`\`\`
\`\`\`

**Checklist**:
- [ ] Write STYLE_GUIDE.md (TypeScript + Swift)
- [ ] Write CONTRIBUTING.md
- [ ] Write ARCHITECTURE_PATTERNS.md
- [ ] Add examples for common patterns
- [ ] Review with team

---

### 4.4 Code Quality Metrics Report (4 hours)

**Goal**: Measure improvement and set targets

**Action Plan**:

**Step 1: Install Quality Tools (1 hour)**
```bash
# Code coverage
pnpm add -D -w c8

# Code complexity
pnpm add -D -w eslint-plugin-complexity

# Bundle size
pnpm add -D -w size-limit @size-limit/preset-small-lib
```

**Step 2: Generate Baseline Metrics (1 hour)**
```bash
# Run all quality checks
pnpm lint > reports/lint-baseline.txt
pnpm type-check > reports/typecheck-baseline.txt
pnpm test:coverage > reports/coverage-baseline.txt

# Count metrics
echo "LOC: $(find packages -name '*.ts' | xargs wc -l | tail -1)"
echo "Files: $(find packages -name '*.ts' | wc -l)"
echo "TODOs: $(grep -r 'TODO\|FIXME' packages --include='*.ts' | wc -l)"
echo "console.log: $(grep -r 'console\.log' packages --include='*.ts' | wc -l)"
echo "Force unwraps: $(grep -r '!' apps/mobile-ios --include='*.swift' | wc -l)"
```

**Step 3: Create Quality Dashboard (1 hour)**
```markdown
# QUALITY_METRICS.md

## Code Quality Dashboard

**Updated**: 2025-10-07 (After Phase 1-4)

### Metrics

| Metric | Before | After | Target | Status |
|--------|--------|-------|--------|--------|
| **Test Coverage** | 2% | 30% | 70% | 🟡 In Progress |
| **TODOs/FIXMEs** | 34 | 4 | 0 | 🟢 Good |
| **console.log** | 22 | 0 | 0 | 🟢 Complete |
| **Force Unwraps** | 15 | 0 | 0 | 🟢 Complete |
| **Lint Errors** | Unknown | 0 | 0 | 🟢 Complete |
| **Type Errors** | 0 | 0 | 0 | 🟢 Complete |
| **Files >400 LOC** | 5 | 0 | 0 | 🟢 Complete |
| **Relative Imports** | 37 | 0 | 0 | 🟢 Complete |
| **JSDoc Coverage** | 30% | 80% | 80% | 🟢 Complete |

### Code Complexity

| Service | Avg Complexity | Max Complexity | Status |
|---------|----------------|----------------|--------|
| AI | 12 | 45 | 🟡 Review |
| Email | 8 | 32 | 🟢 Good |
| Calendar | 10 | 38 | 🟡 Review |
| Workflow | 15 | 52 | 🔴 High |
| Gateway | 5 | 18 | 🟢 Good |

### Bundle Sizes

| Package | Size | Gzipped | Status |
|---------|------|---------|--------|
| @tide/ai | 245 KB | 78 KB | 🟢 Good |
| @tide/email | 189 KB | 62 KB | 🟢 Good |
| @tide/calendar | 156 KB | 51 KB | 🟢 Good |

### Next Steps

1. Increase test coverage to 50% (Week 5)
2. Reduce workflow service complexity (Week 6)
3. Add E2E tests (Week 7)
\`\`\`

**Step 4: Add to CI Pipeline (1 hour)**
```yaml
# .github/workflows/quality.yml
name: Code Quality

on: [push, pull_request]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check

      - name: Test coverage
        run: pnpm test:coverage

      - name: Check bundle size
        run: pnpm size

      - name: Comment PR with metrics
        uses: actions/github-script@v6
        with:
          script: |
            // Post quality metrics as PR comment
\`\`\`

**Checklist**:
- [ ] Install quality tools (c8, eslint-plugin-complexity)
- [ ] Generate baseline metrics
- [ ] Create QUALITY_METRICS.md dashboard
- [ ] Add quality checks to CI
- [ ] Set up automated PR comments with metrics

---

## Success Criteria

After completing all 4 phases, you should have:

### Code Quality ✅
- [ ] Zero console.log in production code
- [ ] Zero force unwraps in Swift code
- [ ] < 5 TODO comments (rest tracked in GitHub)
- [ ] Zero lint errors
- [ ] 80% JSDoc coverage
- [ ] All files < 400 lines

### Architecture ✅
- [ ] Zero relative imports across packages
- [ ] Consistent error handling pattern
- [ ] Shared UI components for mobile
- [ ] Clear module boundaries

### Standards ✅
- [ ] ESLint + Prettier configured
- [ ] Pre-commit hooks working
- [ ] SwiftLint configured
- [ ] Commit message validation
- [ ] Style guide documented

### Documentation ✅
- [ ] All packages have READMEs
- [ ] API docs generated (TypeDoc)
- [ ] Style guide created
- [ ] Contributing guide created
- [ ] Architecture patterns documented

### Metrics ✅
- [ ] Quality dashboard created
- [ ] Baseline metrics captured
- [ ] CI pipeline reports quality
- [ ] Clear improvement targets set

## Timeline Summary

**Week 4** (60 hours):
- Days 1-2: Code Cleanup (16h)
- Days 3-4: Architecture Refinement (24h)
- Day 5: Standardization (12h)
- Weekend: Buffer

**Week 5** (20 hours):
- Days 1-2: Documentation & Validation (20h)
- Days 3-5: Start testing (see Testing Plan next)

## Next Steps After Quality Improvements

Once code quality and architecture are solid:

1. **Week 5-6**: Add comprehensive testing (separate Testing Plan)
2. **Week 6-7**: Complete remaining services
3. **Week 7-8**: Security hardening
4. **Week 8-9**: Performance optimization
5. **Week 9-12**: MVP launch prep

## ROI: Why This Matters

**Short-term benefits** (Weeks 4-5):
- ✅ Easier to onboard new developers
- ✅ Faster to add new features
- ✅ Fewer bugs introduced
- ✅ Better code reviews

**Long-term benefits** (Months 2-6):
- ✅ Lower maintenance costs
- ✅ Easier to refactor
- ✅ Scalable codebase
- ✅ Professional quality

**Investor/Customer benefits**:
- ✅ Production-ready code
- ✅ Lower risk
- ✅ Faster iteration
- ✅ Professional polish

---

**Plan Created**: October 7, 2025
**Estimated Total Effort**: 80 hours (2 weeks)
**Priority**: HIGH - Foundation for testing and MVP launch
