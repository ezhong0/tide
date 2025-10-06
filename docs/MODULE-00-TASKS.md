# Module 00 - Execution Tasks (Day by Day)

## 🎯 Quick Start

```bash
# Get started immediately
git checkout -b feat/complete-module-00
cd /Users/edwardzhong/Projects/tide
```

---

## 📅 DAY 1: Validation Foundation

### Task 1.1: Create Conversation Schemas (2 hours)
**File**: `packages/schemas/src/conversation.schemas.ts`

```bash
# Create the file
touch packages/schemas/src/conversation.schemas.ts
```

**Implementation checklist:**
- [ ] Import base schemas from primitives
- [ ] Create ConversationSchema
- [ ] Create MessageSchema
- [ ] Create ConversationContextSchema
- [ ] Create ActionSchema
- [ ] Create ActionPreviewSchema
- [ ] Export all schemas

**Code template to start with:**
```typescript
/**
 * Conversation validation schemas
 * Runtime validation for Module 00 conversational AI
 */

import { z } from 'zod';
import { UUIDSchema, TimestampSchema, EmailSchema } from './primitives.schemas';

// Message Schema
export const MessageSchema = z.object({
  id: UUIDSchema,
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(10000),
  timestamp: TimestampSchema,
  inputMethod: z.enum(['typed', 'voice_to_text', 'button', 'suggestion']),
  feedback: z.enum(['helpful', 'not_helpful']).optional(),
  edited: z.boolean().optional()
});

// ... continue with others
```

**Verify:**
```bash
pnpm --filter @tide/schemas build
# Should compile without errors
```

---

### Task 1.2: Create Request/Response Schemas (2 hours)
**File**: Same file, add request/response schemas

**Implementation checklist:**
- [ ] CreateConversationRequestSchema
- [ ] SendMessageRequestSchema
- [ ] ProcessIntentRequestSchema
- [ ] ConversationResponseSchema
- [ ] MessageResponseSchema

**Code template:**
```typescript
// Request schemas
export const SendMessageRequestSchema = z.object({
  conversationId: UUIDSchema,
  message: z.string().min(1, 'Message cannot be empty').max(10000),
  inputMethod: z.enum(['typed', 'voice_to_text', 'button', 'suggestion'])
});

export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;
```

---

### Task 1.3: Write Schema Tests (2 hours)
**File**: `packages/schemas/src/conversation.schemas.test.ts`

**Implementation checklist:**
- [ ] Test valid conversation data
- [ ] Test invalid data (should reject)
- [ ] Test edge cases (empty strings, max length)
- [ ] Test type inference

**Code template:**
```typescript
import { describe, it, expect } from '@jest/globals';
import { MessageSchema, SendMessageRequestSchema } from './conversation.schemas';

describe('Conversation Schemas', () => {
  describe('MessageSchema', () => {
    it('should validate correct message', () => {
      const validMessage = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        role: 'user',
        content: 'Hello',
        timestamp: Date.now(),
        inputMethod: 'typed'
      };

      const result = MessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    it('should reject empty content', () => {
      const invalidMessage = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        role: 'user',
        content: '',
        timestamp: Date.now(),
        inputMethod: 'typed'
      };

      const result = MessageSchema.safeParse(invalidMessage);
      expect(result.success).toBe(false);
    });
  });
});
```

**Verify:**
```bash
pnpm --filter @tide/schemas test
# All schema tests should pass
```

---

### Task 1.4: Export Schemas (30 min)
**File**: `packages/schemas/src/index.ts`

**Implementation:**
```typescript
// Add to existing exports
export * from './conversation.schemas';
```

**Verify:**
```bash
pnpm --filter @tide/schemas build
pnpm --filter @tide/schemas test
# Everything should still pass
```

---

## 📅 DAY 2: Mock Conversation Service

### Task 2.1: Setup Mock Structure (30 min)
**Files to create:**
```bash
mkdir -p packages/mocks/src/conversation
touch packages/mocks/src/conversation/MockConversationService.ts
touch packages/mocks/src/conversation/MockConversationService.test.ts
touch packages/mocks/src/conversation/index.ts
```

---

### Task 2.2: Implement Core Methods (3 hours)
**File**: `packages/mocks/src/conversation/MockConversationService.ts`

**Implementation checklist:**
- [ ] Class structure with IConversationService
- [ ] In-memory storage (Map)
- [ ] createConversation()
- [ ] getConversation()
- [ ] sendMessage() with basic responses
- [ ] Helper methods for data generation

**Code template:**
```typescript
import {
  IConversationService,
  Result,
  IConversation,
  IResponse,
  IConversationContext,
  ConversationId,
  MessageId,
  UserId,
  InputMethod,
  UUID,
  Timestamp,
  ok,
  err
} from '@tide/types';

export class MockConversationService implements IConversationService {
  private conversations = new Map<string, IConversation>();
  private messageCount = 0;

  async createConversation(userId: UserId): Promise<Result<IConversation>> {
    const id = UUID(crypto.randomUUID());
    const now = Date.now() as Timestamp;

    const conversation: IConversation = {
      id,
      userId,
      messages: [],
      context: {
        mentionedPeople: [],
        mentionedDates: [],
        mentionedProjects: [],
        upcomingMeetings: [],
        unreadEmails: 0
      },
      status: 'active',
      startedAt: now,
      lastActiveAt: now
    };

    this.conversations.set(id, conversation);
    return ok(conversation);
  }

  async getConversation(conversationId: ConversationId): Promise<Result<IConversation>> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return err(new Error(`Conversation ${conversationId} not found`));
    }
    return ok(conversation);
  }

  async sendMessage(
    conversationId: ConversationId,
    message: string,
    inputMethod: InputMethod
  ): Promise<Result<IResponse>> {
    // Simulate processing time
    await this.delay(300);

    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return err(new Error(`Conversation ${conversationId} not found`));
    }

    // Create user message
    const userMessage: IMessage = {
      id: UUID(crypto.randomUUID()),
      role: 'user',
      content: message,
      timestamp: Date.now() as Timestamp,
      inputMethod
    };

    conversation.messages.push(userMessage);

    // Generate AI response
    const aiResponse = this.generateResponse(message, conversation);
    conversation.messages.push(aiResponse);

    // Update conversation state
    conversation.lastActiveAt = Date.now() as Timestamp;
    this.conversations.set(conversationId, conversation);

    return ok({
      messageId: aiResponse.id,
      content: aiResponse.content,
      role: 'assistant',
      actions: aiResponse.actions,
      suggestions: aiResponse.suggestions
    });
  }

  private generateResponse(userMessage: string, conversation: IConversation): IMessage {
    const lower = userMessage.toLowerCase();
    let content = '';
    let suggestions: ISuggestion[] = [];
    let actions: IAction[] = [];

    // Simple pattern matching for demo
    if (lower.includes('calendar') || lower.includes('schedule') || lower.includes('meeting')) {
      content = "I can help you with your calendar. What would you like to do?";
      suggestions = [
        { id: '1', text: "Show today's meetings", type: 'action' },
        { id: '2', text: "Schedule a new meeting", type: 'action' },
        { id: '3', text: "Find available time", type: 'action' }
      ];
    } else if (lower.includes('email')) {
      content = "I can help you with email. What would you like to do?";
      suggestions = [
        { id: '1', text: "Check unread emails", type: 'action' },
        { id: '2', text: "Draft an email", type: 'action' },
        { id: '3', text: "Search emails", type: 'action' }
      ];
      actions = [{
        type: 'search_emails',
        description: 'Search your emails',
        params: {},
        requiresConfirmation: false
      }];
    } else {
      content = "I'm here to help! I can assist with email, calendar, and scheduling. What would you like to do?";
      suggestions = [
        { id: '1', text: "Check my calendar", type: 'action' },
        { id: '2', text: "Check my email", type: 'action' }
      ];
    }

    return {
      id: UUID(crypto.randomUUID()),
      role: 'assistant',
      content,
      timestamp: Date.now() as Timestamp,
      inputMethod: 'typed',
      suggestions,
      actions
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Implement other interface methods...
  async getContext(conversationId: ConversationId): Promise<Result<IConversationContext>> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return err(new Error(`Conversation ${conversationId} not found`));
    }
    return ok(conversation.context);
  }

  async updateContext(
    conversationId: ConversationId,
    context: Partial<IConversationContext>
  ): Promise<Result<IConversation>> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return err(new Error(`Conversation ${conversationId} not found`));
    }

    conversation.context = { ...conversation.context, ...context };
    this.conversations.set(conversationId, conversation);
    return ok(conversation);
  }

  // ... other methods
}
```

**Verify:**
```bash
pnpm --filter @tide/mocks build
# Should compile
```

---

### Task 2.3: Write Tests (3 hours)
**File**: `packages/mocks/src/conversation/MockConversationService.test.ts`

**Implementation checklist:**
- [ ] Test createConversation
- [ ] Test sendMessage
- [ ] Test context tracking
- [ ] Test error cases
- [ ] Test performance (<800ms)

**Code template:**
```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { MockConversationService } from './MockConversationService';
import { UUID, UserId } from '@tide/types';

describe('MockConversationService', () => {
  let service: MockConversationService;
  const testUserId = UUID('123e4567-e89b-12d3-a456-426614174000') as UserId;

  beforeEach(() => {
    service = new MockConversationService();
  });

  describe('createConversation', () => {
    it('should create a new conversation', async () => {
      const result = await service.createConversation(testUserId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userId).toBe(testUserId);
        expect(result.data.messages).toHaveLength(0);
        expect(result.data.status).toBe('active');
      }
    });
  });

  describe('sendMessage', () => {
    it('should send message and get response', async () => {
      const conv = await service.createConversation(testUserId);
      if (!conv.success) throw new Error('Failed to create conversation');

      const result = await service.sendMessage(
        conv.data.id,
        "What's on my calendar?",
        'typed'
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBeDefined();
        expect(result.data.role).toBe('assistant');
      }
    });

    it('should respond within performance SLA', async () => {
      const conv = await service.createConversation(testUserId);
      if (!conv.success) throw new Error('Failed');

      const start = Date.now();
      await service.sendMessage(conv.data.id, "test", 'typed');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(800); // SLA: <800ms
    });
  });
});
```

**Verify:**
```bash
pnpm --filter @tide/mocks test
# All tests should pass
```

---

### Task 2.4: Export Service (15 min)
**File**: `packages/mocks/src/index.ts`

```typescript
// Add to exports
export * from './conversation/MockConversationService';
```

---

## 📅 DAY 3: Supporting Mock Services

### Task 3.1: MockActionPreviewService (2 hours)
**Files:**
```bash
mkdir -p packages/mocks/src/action
touch packages/mocks/src/action/MockActionPreviewService.ts
touch packages/mocks/src/action/MockActionPreviewService.test.ts
```

**Quick implementation:**
```typescript
export class MockActionPreviewService implements IActionPreviewService {
  async generatePreview(action: IAction, userId: UserId): Promise<Result<IActionPreview>> {
    await this.delay(200); // <500ms SLA

    return ok({
      summary: `Preview: ${action.description}`,
      details: {
        action: action.type,
        changes: action.params
      },
      editable: true,
      editableFields: ['description']
    });
  }

  async executeAction(
    action: IAction,
    userId: UserId,
    modifications?: Record<string, unknown>
  ): Promise<Result<IActionResult>> {
    await this.delay(500); // <1000ms SLA

    return ok({
      success: true,
      action,
      result: { executed: true },
      undoable: true,
      undoWindow: 10000
    });
  }

  // ... implement other methods
}
```

**Test + export same as Task 2.3-2.4**

---

### Task 3.2: MockNaturalLanguageProcessor (2 hours)
**Files:**
```bash
mkdir -p packages/mocks/src/nlp
touch packages/mocks/src/nlp/MockNaturalLanguageProcessor.ts
touch packages/mocks/src/nlp/MockNaturalLanguageProcessor.test.ts
```

**Quick implementation:**
```typescript
export class MockNaturalLanguageProcessor implements INaturalLanguageProcessor {
  async processMessage(
    message: string,
    context: IConversationContext
  ): Promise<Result<IUnderstanding>> {
    await this.delay(150); // <300ms SLA

    const intents = this.classifyIntent(message);
    const entities = this.extractEntities(message);

    return ok({
      intents: [intents],
      entities,
      confidence: 0.85
    });
  }

  private classifyIntent(message: string): IIntent {
    const lower = message.toLowerCase();

    if (lower.match(/\bschedule\b.*\bmeet(ing)?\b/)) {
      return { type: 'schedule_meeting', confidence: 0.9 };
    }
    if (lower.match(/\bemail\b/)) {
      return { type: 'draft_email', confidence: 0.85 };
    }

    return { type: 'unknown', confidence: 0.5 };
  }

  private extractEntities(message: string): IEntity[] {
    const entities: IEntity[] = [];
    // Simple regex-based extraction
    const emailRegex = /\b[\w.-]+@[\w.-]+\.\w+\b/g;
    const matches = message.match(emailRegex);

    if (matches) {
      matches.forEach(email => {
        entities.push({
          type: 'email',
          value: email,
          position: [0, 0],
          confidence: 0.95
        });
      });
    }

    return entities;
  }
}
```

**Test + export**

---

### Task 3.3: MockPersonalizationEngine (2 hours)
**Files:**
```bash
mkdir -p packages/mocks/src/personalization
touch packages/mocks/src/personalization/MockPersonalizationEngine.ts
touch packages/mocks/src/personalization/MockPersonalizationEngine.test.ts
```

**Quick implementation:**
```typescript
export class MockPersonalizationEngine implements IPersonalizationEngine {
  private preferences = new Map<string, IUserPreferences>();
  private patterns = new Map<string, ILearnedPattern[]>();

  async observeInteraction(interaction: IInteraction): Promise<Result<void>> {
    // Store for later use
    return ok(undefined);
  }

  async getUserPreferences(userId: UserId): Promise<Result<IUserPreferences>> {
    const prefs = this.preferences.get(userId) || {
      communicationStyle: 'concise'
    };
    return ok(prefs);
  }

  async personalizeResponse(baseResponse: string, userId: UserId): Promise<Result<string>> {
    const prefs = await this.getUserPreferences(userId);
    if (!prefs.success) return ok(baseResponse);

    // Apply personalization
    if (prefs.data.communicationStyle === 'bullet_points') {
      return ok(this.toBulletPoints(baseResponse));
    }

    return ok(baseResponse);
  }

  private toBulletPoints(text: string): string {
    return text.split('. ').map(s => `• ${s.trim()}`).join('\n');
  }
}
```

**Test + export**

---

### Task 3.4: MockContextualMemory (1 hour)
**Simple implementation for completeness**

---

## 📅 DAY 4: Integration & CLI

### Task 4.1: Integration Test Suite (4 hours)
**File**: `packages/mocks/src/__tests__/integration/conversation-flow.test.ts`

Use the template from the main completion plan - test these flows:
1. Email drafting flow
2. Meeting scheduling flow
3. Context tracking across turns
4. Personalization
5. Error handling
6. Performance

**Verify:**
```bash
pnpm --filter @tide/mocks test:integration
# All integration tests passing
```

---

### Task 4.2: Basic CLI (3 hours)
**Files:**
```bash
mkdir -p packages/cli/src
touch packages/cli/src/index.ts
touch packages/cli/package.json
touch packages/cli/tsconfig.json
```

**package.json:**
```json
{
  "name": "@tide/cli",
  "version": "1.0.0",
  "bin": {
    "tide": "./dist/index.js"
  },
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@tide/types": "workspace:*",
    "@tide/mocks": "workspace:*"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "typescript": "^5.3.0"
  }
}
```

**Implementation**: Use template from main plan

**Test:**
```bash
cd packages/cli
pnpm dev
# Should start interactive CLI
```

---

## 📅 DAY 5: Polish & Documentation

### Task 5.1: Write PATTERNS.md (3 hours)
**File**: `docs/PATTERNS.md`

Document:
1. How to implement a service contract
2. How to write schemas
3. How to create mock services
4. Testing patterns
5. Common pitfalls

---

### Task 5.2: Create Examples (2 hours)
**Directory**: `packages/mocks/examples/`

Create 3 examples:
1. `basic-conversation.ts` - Simple chat flow
2. `action-preview.ts` - Preview and execute action
3. `context-tracking.ts` - Multi-turn with context

---

### Task 5.3: Verification Script (2 hours)
**File**: `scripts/verify-module-00.sh`

Use template from main plan.

**Run:**
```bash
chmod +x scripts/verify-module-00.sh
./scripts/verify-module-00.sh
# Should pass all checks
```

---

### Task 5.4: Final Commit (1 hour)
```bash
# Stage everything
git add -A

# Commit with comprehensive message
git commit -m "feat: complete Module 00 conversational foundation

Complete implementation of Module 00 with:
- Conversation Zod schemas
- 5 mock service implementations
- Integration test suite
- CLI tool for manual testing
- PATTERNS.md documentation
- Example code

All tests passing, coverage >80%, CI green.

Closes #module-00"

# Push
git push origin feat/complete-module-00
```

---

## ✅ Daily Checklist

### End of Day 1
- [ ] Conversation schemas created
- [ ] Schema tests passing
- [ ] Types can be inferred from schemas
- [ ] `pnpm --filter @tide/schemas test` passes

### End of Day 2
- [ ] MockConversationService implemented
- [ ] Core methods working (create, send, get)
- [ ] Tests passing with >80% coverage
- [ ] Performance within SLA (<800ms)

### End of Day 3
- [ ] 3 additional mock services complete
- [ ] All services have tests
- [ ] All services exported
- [ ] `pnpm --filter @tide/mocks test` passes

### End of Day 4
- [ ] Integration tests cover 5+ flows
- [ ] CLI tool works interactively
- [ ] Can have multi-turn conversation
- [ ] Context tracking demonstrated

### End of Day 5
- [ ] PATTERNS.md complete
- [ ] Examples created
- [ ] Verification script passes
- [ ] Documentation updated
- [ ] Code committed and pushed

---

## 🚀 Quick Commands

```bash
# Day 1: Start schemas
cd packages/schemas/src
touch conversation.schemas.ts conversation.schemas.test.ts

# Day 2: Start mock service
cd packages/mocks/src
mkdir conversation
touch conversation/MockConversationService.ts

# Day 3: Start supporting services
mkdir action nlp personalization
# ... create files

# Day 4: Integration tests
mkdir -p __tests__/integration
touch __tests__/integration/conversation-flow.test.ts

# Day 5: Documentation
cd ../../docs
touch PATTERNS.md

# Verify everything
./scripts/verify-module-00.sh
```

---

## 📈 Progress Tracking

Update this file as you complete tasks:

```
DAY 1: [====================] 100%
DAY 2: [====================] 100%
DAY 3: [====================] 100%
DAY 4: [====================] 100%
DAY 5: [====================] 100%

MODULE 00: COMPLETE ✅
```

---

## 💪 You Got This!

5 focused days = Solid foundation for entire project.

One task at a time. Ship it! 🚀
