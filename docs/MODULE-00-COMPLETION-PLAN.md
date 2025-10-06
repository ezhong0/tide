# Module 00 Completion Plan - Solid Foundation

## 🎯 Goal

Complete Module 00 to **production-ready quality** that enables parallel development of all downstream modules with confidence.

## 📊 Current State (From EXECUTION-PLAN.md)

**Status: 60% Complete**

### ✅ What We Have
- Core types (conversation.types.ts) - Complete & solid
- All service contracts defined with performance SLAs
- Module documentation complete
- CI infrastructure working

### ❌ What's Missing (Critical for 100%)
1. **Conversation Schemas** - No Zod validation
2. **Mock Services** - Only email exists, need 5 more
3. **Integration Tests** - No end-to-end flows
4. **CLI Tool** - Can't manually test conversations
5. **Patterns & Examples** - No reference implementation

## 🎯 Why This Matters

**Module 00 is the CONTRACT for all other modules.**

If we ship it incomplete:
- ❌ Developers build against wrong assumptions
- ❌ Integration breaks during Phase 1
- ❌ Have to refactor contracts (breaks parallel work)
- ❌ Quality issues cascade to all modules

If we complete it properly:
- ✅ Clear, tested API for all developers
- ✅ Confidence in parallel development
- ✅ Mocks enable TDD for downstream modules
- ✅ Patterns established for Modules 01-10

## 📅 5-Day Execution Plan

### Day 1: Validation Foundation (Schemas)
**Goal**: Create comprehensive Zod schemas for runtime validation

#### Morning (4 hours): Core Conversation Schemas
```typescript
packages/schemas/src/conversation.schemas.ts

Create schemas for:
- ConversationSchema
- MessageSchema
- ConversationContextSchema
- ActionSchema
- ActionPreviewSchema
- IntentSchema
- EntitySchema
```

**Why these schemas matter:**
- Runtime validation at API boundaries
- Clear contract documentation
- Type-safe parsing from external sources
- Error messages for debugging

**Deliverable:**
```bash
pnpm --filter @tide/schemas test
# All conversation schema tests passing
```

#### Afternoon (4 hours): Request/Response Schemas
```typescript
Create schemas for:
- CreateConversationRequestSchema
- SendMessageRequestSchema
- ProcessIntentRequestSchema
- GetProactiveSuggestionsRequestSchema

Response schemas:
- ConversationResponseSchema
- MessageResponseSchema
- IntentClassificationResultSchema
```

**Pattern to establish:**
```typescript
// Request validation
export const SendMessageRequestSchema = z.object({
  conversationId: UUIDSchema,
  message: z.string().min(1).max(10000),
  inputMethod: z.enum(['typed', 'voice_to_text', 'button', 'suggestion'])
});

// Response validation
export const MessageResponseSchema = z.object({
  message: IMessageSchema,
  actions: z.array(ActionSchema).optional(),
  suggestions: z.array(SuggestionSchema).optional(),
  preview: ActionPreviewSchema.optional()
});

// Type inference
export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;
export type MessageResponse = z.infer<typeof MessageResponseSchema>;
```

**Deliverable:**
- 100% schema coverage for conversation types
- Tests for valid/invalid cases
- Export all schemas from index

---

### Day 2: Mock Conversation Service
**Goal**: Build reference implementation that others can follow

#### Morning (4 hours): MockConversationService Core
```typescript
packages/mocks/src/conversation/MockConversationService.ts

Implement:
- createConversation() - Generate realistic conversation
- getConversation() - Return with full context
- sendMessage() - Simulate AI response
- streamResponse() - Mock streaming with delays
- getContext() - Return conversation state
```

**Key Features:**
```typescript
export class MockConversationService implements IConversationService {
  private conversations = new Map<ConversationId, IConversation>();
  private messageHistory = new Map<ConversationId, IMessage[]>();

  // Realistic response simulation
  async sendMessage(
    conversationId: ConversationId,
    message: string,
    inputMethod: InputMethod
  ): Promise<Result<IResponse>> {
    // 1. Validate with schema
    const validation = SendMessageRequestSchema.safeParse({
      conversationId,
      message,
      inputMethod
    });

    if (!validation.success) {
      return err(new ValidationError(validation.error));
    }

    // 2. Simulate processing time (realistic)
    await delay(300); // First response target: <800ms

    // 3. Generate contextual response
    const response = this.generateResponse(conversationId, message);

    // 4. Update conversation state
    this.updateContext(conversationId, message, response);

    return ok(response);
  }

  // Pattern: Realistic data generation
  private generateResponse(
    conversationId: ConversationId,
    userMessage: string
  ): IResponse {
    // Use simple heuristics for now
    // Real implementation will use AI

    if (userMessage.toLowerCase().includes('calendar')) {
      return {
        messageId: UUID(crypto.randomUUID()),
        content: "I can help you with your calendar. What would you like to do?",
        role: 'assistant',
        suggestions: [
          { id: '1', text: "Show today's meetings", type: 'action' },
          { id: '2', text: "Schedule a meeting", type: 'action' },
          { id: '3', text: "Find time for...", type: 'action' }
        ]
      };
    }

    // ... more patterns
  }
}
```

**Why this pattern matters:**
- Shows how to implement contract correctly
- Demonstrates schema validation
- Realistic timing delays
- State management example

#### Afternoon (4 hours): Tests & Edge Cases
```typescript
packages/mocks/src/conversation/MockConversationService.test.ts

Test scenarios:
- Happy path: Create conversation, send messages
- Context tracking: Reference previous messages
- Edge cases: Empty messages, long messages
- Performance: Response within SLA (<800ms)
- State management: Concurrent conversations
```

**Deliverable:**
- MockConversationService fully tested
- 80%+ code coverage
- Performance tests passing

---

### Day 3: Supporting Mock Services
**Goal**: Complete the ecosystem of mocks

#### Morning (3 hours): MockActionPreviewService
```typescript
packages/mocks/src/action/MockActionPreviewService.ts

Implement:
- generatePreview() - Show action details
- executeAction() - Simulate execution
- validateAction() - Check parameters
- undoAction() - Simulate undo
- requiresConfirmation() - Risk assessment
```

**Pattern for action previews:**
```typescript
async generatePreview(
  action: IAction,
  userId: UserId
): Promise<Result<IActionPreview>> {
  await delay(200); // Target: <500ms

  // Generate preview based on action type
  switch (action.type) {
    case 'send_email':
      return ok({
        summary: `Send email to ${action.params.to}`,
        details: {
          action: 'send_email',
          changes: {
            recipients: action.params.to,
            subject: action.params.subject,
            body: action.params.body
          }
        },
        risks: this.assessRisks(action),
        editable: true,
        editableFields: ['subject', 'body', 'cc']
      });

    case 'schedule_meeting':
      return ok({
        summary: `Schedule ${action.params.title} for ${action.params.time}`,
        details: {
          action: 'schedule_meeting',
          changes: action.params,
          affectedItems: ['Your calendar', ...action.params.attendees]
        },
        alternatives: this.suggestAlternativeTimes(action.params),
        editable: true
      });
  }
}

private assessRisks(action: IAction): IRisk[] {
  // Pattern: Risk assessment logic
  const risks: IRisk[] = [];

  if (action.type === 'send_email' && !action.params.cc?.includes('legal@')) {
    risks.push({
      level: 'medium',
      description: 'Contract discussion without legal CC',
      mitigation: 'Add legal@company.com to CC'
    });
  }

  return risks;
}
```

#### Afternoon (3 hours): MockNaturalLanguageProcessor & MockPersonalizationEngine
```typescript
packages/mocks/src/nlp/MockNaturalLanguageProcessor.ts

Implement simple pattern matching:
- processMessage() - Extract intent & entities
- classifyIntent() - Use keyword matching
- extractEntities() - Find people, dates, actions
- detectAmbiguities() - Identify unclear references

packages/mocks/src/personalization/MockPersonalizationEngine.ts

Implement preferences storage:
- observeInteraction() - Track patterns
- getUserPreferences() - Return preferences
- personalizeResponse() - Apply user style
- getProactiveSuggestions() - Based on patterns
```

**Simple but functional:**
```typescript
// MockNaturalLanguageProcessor
async processMessage(
  message: string,
  context: IConversationContext
): Promise<Result<IUnderstanding>> {
  // Simple keyword-based intent classification
  const intents = this.classifyIntents(message);
  const entities = this.extractEntities(message);
  const ambiguities = this.detectAmbiguities(message, context);

  return ok({
    intents,
    entities,
    ambiguities,
    confidence: intents[0]?.confidence ?? 0.5
  });
}

private classifyIntents(message: string): IIntent[] {
  const lower = message.toLowerCase();
  const intents: IIntent[] = [];

  // Pattern matching (simple but effective for mocks)
  if (lower.match(/\b(schedule|book|set up)\b.*\bmeet(ing)?\b/)) {
    intents.push({
      type: 'schedule_meeting',
      confidence: 0.9
    });
  }

  if (lower.match(/\b(send|draft|compose)\b.*\bemail\b/)) {
    intents.push({
      type: 'draft_email',
      confidence: 0.85
    });
  }

  // ... more patterns

  return intents.sort((a, b) => b.confidence - a.confidence);
}
```

**Deliverable:**
- 3 mock services completed
- All tests passing
- Performance within SLAs

---

### Day 4: Integration Tests & CLI
**Goal**: Prove the whole system works together

#### Morning (4 hours): Integration Test Suite
```typescript
packages/mocks/src/__tests__/integration/conversation-flow.test.ts

Test complete user journeys:
```

```typescript
describe('Conversational AI Integration', () => {
  let conversationService: MockConversationService;
  let nlpService: MockNaturalLanguageProcessor;
  let actionPreviewService: MockActionPreviewService;
  let personalizationEngine: MockPersonalizationEngine;

  beforeEach(() => {
    // Setup integrated system
    conversationService = new MockConversationService();
    nlpService = new MockNaturalLanguageProcessor();
    actionPreviewService = new MockActionPreviewService();
    personalizationEngine = new MockPersonalizationEngine();
  });

  it('should handle complete email drafting flow', async () => {
    // 1. Create conversation
    const convResult = await conversationService.createConversation(userId);
    expect(convResult.success).toBe(true);
    const conversation = convResult.data;

    // 2. User requests email draft
    const msg1 = await conversationService.sendMessage(
      conversation.id,
      "I need to send an update email to the Johnson account",
      'typed'
    );

    expect(msg1.success).toBe(true);
    expect(msg1.data.content).toContain('draft');
    expect(msg1.data.actions).toHaveLength(1);
    expect(msg1.data.actions[0].type).toBe('draft_email');

    // 3. Preview the action
    const preview = await actionPreviewService.generatePreview(
      msg1.data.actions[0],
      userId
    );

    expect(preview.success).toBe(true);
    expect(preview.data.editable).toBe(true);
    expect(preview.data.editableFields).toContain('body');

    // 4. Execute action
    const execution = await actionPreviewService.executeAction(
      msg1.data.actions[0],
      userId
    );

    expect(execution.success).toBe(true);
    expect(execution.data.undoable).toBe(true);

    // 5. Verify conversation context updated
    const context = await conversationService.getContext(conversation.id);
    expect(context.success).toBe(true);
    expect(context.data.mentionedProjects).toContain('Johnson account');
  });

  it('should maintain context across multiple turns', async () => {
    const conv = await conversationService.createConversation(userId);

    // Turn 1: Ask about calendar
    await conversationService.sendMessage(
      conv.data.id,
      "What's on my calendar today?",
      'typed'
    );

    const ctx1 = await conversationService.getContext(conv.data.id);
    expect(ctx1.data.topic).toBe('calendar');

    // Turn 2: Reference "the 2pm" (should understand from context)
    const msg2 = await conversationService.sendMessage(
      conv.data.id,
      "Move the 2pm to tomorrow",
      'typed'
    );

    // NLP should understand "the 2pm" refers to meeting from previous context
    const understanding = await nlpService.processMessage(
      "Move the 2pm to tomorrow",
      ctx1.data
    );

    expect(understanding.data.intents[0].type).toBe('reschedule_meeting');
    expect(understanding.data.entities).toContainEqual(
      expect.objectContaining({ type: 'time', value: '2pm' })
    );
  });

  it('should learn and personalize over time', async () => {
    // First interaction
    await personalizationEngine.observeInteraction({
      userId,
      timestamp: Date.now(),
      type: 'preference_change',
      data: { communicationStyle: 'bullet_points' }
    });

    // Create conversation
    const conv = await conversationService.createConversation(userId);
    const msg = await conversationService.sendMessage(
      conv.data.id,
      "Summarize my emails",
      'typed'
    );

    // Response should be personalized with bullet points
    const prefs = await personalizationEngine.getUserPreferences(userId);
    expect(prefs.data.communicationStyle).toBe('bullet_points');

    const personalized = await personalizationEngine.personalizeResponse(
      msg.data.content,
      userId
    );

    expect(personalized.data).toMatch(/^[-•*]/m); // Starts with bullet point
  });

  it('should handle errors gracefully', async () => {
    // Invalid conversation ID
    const result = await conversationService.sendMessage(
      UUID('00000000-0000-0000-0000-000000000000'),
      "test",
      'typed'
    );

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should meet performance requirements', async () => {
    const conv = await conversationService.createConversation(userId);

    const start = Date.now();
    await conversationService.sendMessage(
      conv.data.id,
      "Schedule a meeting with John tomorrow at 2pm",
      'typed'
    );
    const duration = Date.now() - start;

    // SLA: First response < 800ms
    expect(duration).toBeLessThan(800);
  });
});
```

**Key test patterns established:**
- Complete user journeys
- Context tracking
- Personalization
- Error handling
- Performance validation

#### Afternoon (4 hours): Basic CLI Tool
```typescript
packages/cli/src/index.ts

Simple REPL for testing conversations:
```

```typescript
#!/usr/bin/env node
import * as readline from 'readline';
import { MockConversationService } from '@tide/mocks';
import { UUID } from '@tide/types';

const conversationService = new MockConversationService();
let currentConversation: ConversationId | null = null;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

async function main() {
  console.log('🌊 Tide Conversation CLI');
  console.log('Commands: /new, /exit, /context');
  console.log('Type a message to chat\n');

  // Create initial conversation
  const result = await conversationService.createConversation(
    UUID('user-123')
  );

  if (result.success) {
    currentConversation = result.data.id;
    console.log(`✅ Conversation started: ${currentConversation}\n`);
  }

  rl.prompt();

  rl.on('line', async (input) => {
    const line = input.trim();

    if (line === '/exit') {
      console.log('👋 Goodbye!');
      process.exit(0);
    }

    if (line === '/new') {
      const result = await conversationService.createConversation(
        UUID('user-123')
      );
      if (result.success) {
        currentConversation = result.data.id;
        console.log(`✅ New conversation: ${currentConversation}\n`);
      }
      rl.prompt();
      return;
    }

    if (line === '/context') {
      if (currentConversation) {
        const ctx = await conversationService.getContext(currentConversation);
        if (ctx.success) {
          console.log(JSON.stringify(ctx.data, null, 2));
        }
      }
      rl.prompt();
      return;
    }

    // Send message
    if (currentConversation && line) {
      const response = await conversationService.sendMessage(
        currentConversation,
        line,
        'typed'
      );

      if (response.success) {
        console.log(`\n🤖 ${response.data.content}\n`);

        if (response.data.suggestions) {
          console.log('💡 Suggestions:');
          response.data.suggestions.forEach((s, i) => {
            console.log(`  ${i + 1}. ${s.text}`);
          });
          console.log();
        }

        if (response.data.actions) {
          console.log('⚡ Actions available:');
          response.data.actions.forEach((a, i) => {
            console.log(`  ${i + 1}. ${a.description}`);
          });
          console.log();
        }
      } else {
        console.log(`❌ Error: ${response.error}\n`);
      }
    }

    rl.prompt();
  });
}

main().catch(console.error);
```

**Add to package.json:**
```json
{
  "name": "@tide/cli",
  "bin": {
    "tide": "./dist/index.js"
  },
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc"
  }
}
```

**Deliverable:**
- Integration tests covering 5+ user journeys
- CLI tool for manual testing
- Can run: `pnpm tide` to test conversations

---

### Day 5: Polish & Documentation
**Goal**: Make it bulletproof and developer-friendly

#### Morning (4 hours): Code Quality & Patterns
```typescript
1. Add JSDoc to all mock implementations
2. Create PATTERNS.md documenting:
   - How to implement a service contract
   - How to write mock services
   - How to use schemas for validation
   - How to write integration tests

3. Add examples/ directory:
   - example-conversation-flow.ts
   - example-action-preview.ts
   - example-personalization.ts
```

**PATTERNS.md structure:**
```markdown
# Module 00 Implementation Patterns

## 1. Implementing a Service Contract

### Step-by-Step Guide
1. Create schemas first (validation)
2. Implement mock service
3. Write unit tests
4. Write integration tests
5. Document usage

### Code Example
[Full example with explanations]

## 2. Schema Design Patterns

### Request/Response Validation
[Pattern example]

### Error Handling
[Pattern example]

## 3. Mock Service Patterns

### State Management
[How to manage in-memory state]

### Realistic Timing
[How to simulate async operations]

### Data Generation
[How to create realistic test data]

## 4. Testing Patterns

### Unit Tests
[What to test, how to test]

### Integration Tests
[How to test full flows]

### Performance Tests
[How to validate SLAs]
```

#### Afternoon (4 hours): Final Verification
```bash
# Run complete verification suite
./scripts/verify-module-00.sh
```

```bash
#!/bin/bash
# verify-module-00.sh

set -e

echo "🔍 Verifying Module 00 Completion..."
echo

# 1. Check all packages build
echo "📦 Building packages..."
pnpm --filter @tide/types build
pnpm --filter @tide/contracts build
pnpm --filter @tide/schemas build
pnpm --filter @tide/mocks build
echo "✅ All packages build successfully"
echo

# 2. Run all tests
echo "🧪 Running tests..."
pnpm --filter @tide/types test
pnpm --filter @tide/contracts test
pnpm --filter @tide/schemas test
pnpm --filter @tide/mocks test
echo "✅ All tests passing"
echo

# 3. Check coverage
echo "📊 Checking test coverage..."
pnpm --filter @tide/mocks test:coverage
echo "✅ Coverage meets threshold (80%)"
echo

# 4. Run integration tests
echo "🔗 Running integration tests..."
pnpm --filter @tide/mocks test:integration
echo "✅ Integration tests passing"
echo

# 5. Run performance benchmarks
echo "⚡ Running performance tests..."
pnpm --filter @tide/mocks test:performance
echo "✅ Performance SLAs met"
echo

# 6. Verify CLI works
echo "🖥️  Testing CLI..."
echo "Check my calendar" | pnpm tide > /tmp/tide-test.txt
if grep -q "calendar" /tmp/tide-test.txt; then
  echo "✅ CLI functional"
else
  echo "❌ CLI not working"
  exit 1
fi
echo

# 7. Check linting
echo "🔍 Running linters..."
pnpm lint
echo "✅ Linting passed"
echo

echo "🎉 Module 00 verification complete!"
echo
echo "📊 Summary:"
echo "  - All packages building"
echo "  - All tests passing"
echo "  - Coverage > 80%"
echo "  - Integration tests working"
echo "  - Performance SLAs met"
echo "  - CLI functional"
echo "  - Code quality verified"
echo
echo "✅ Module 00 is COMPLETE and ready for production use"
```

**Deliverable:**
- Verification script passing
- PATTERNS.md complete
- Examples documented
- README updated

---

## ✅ Definition of Done

Module 00 is complete when:

### Code Quality
- [ ] All TypeScript strict mode passes
- [ ] ESLint passes with zero warnings
- [ ] Prettier formatting consistent
- [ ] Zero `any` types (except explicitly disabled)

### Testing
- [ ] Unit test coverage > 80%
- [ ] All integration tests passing
- [ ] Performance tests meet SLAs
- [ ] Edge cases covered

### Functionality
- [ ] All 5 mock services implemented
- [ ] All schemas cover conversation types
- [ ] CLI tool works for manual testing
- [ ] Context tracking demonstrated

### Documentation
- [ ] PATTERNS.md explains how to implement contracts
- [ ] Examples directory has working code
- [ ] JSDoc on all public APIs
- [ ] README updated with usage

### Integration
- [ ] Can have multi-turn conversation
- [ ] Action preview flow works
- [ ] Personalization tracks preferences
- [ ] Errors handled gracefully

### CI/CD
- [ ] All CI checks passing
- [ ] Verification script automated
- [ ] Can run locally with `./verify-module-00.sh`

## 🎯 Success Criteria

After Day 5, a developer on Module 01 (Email) should be able to:

1. **Understand the contract** by reading types + PATTERNS.md
2. **Write tests** using mock services immediately
3. **Validate input** using schemas
4. **Follow patterns** established in Module 00
5. **Run integration tests** against mocks while building

## 🚀 Impact on Downstream Modules

### Module 01 (Email)
```typescript
// Can immediately start with:
import { MockConversationService } from '@tide/mocks';
import { SendEmailRequestSchema } from '@tide/schemas';

// Test email integration with conversation
const mockConv = new MockConversationService();
// ... build and test against solid foundation
```

### Module 03 (AI Agent)
```typescript
// Clear contract to implement:
import { INaturalLanguageProcessor } from '@tide/contracts';

// Can test against MockConversationService
// Can validate with ConversationSchemas
// Can follow patterns from PATTERNS.md
```

### All Modules
- ✅ Clear contracts (no ambiguity)
- ✅ Working mocks (can TDD)
- ✅ Validation (catch errors early)
- ✅ Patterns (consistency)
- ✅ Examples (reference)

## 📈 Risk Mitigation

### Risk: Schemas are incomplete
**Mitigation**: Use type-driven development
- Generate schemas from types
- Validate every type has schema
- Test round-trip (type → schema → type)

### Risk: Mocks are too simple
**Mitigation**: Make them realistic
- Proper state management
- Realistic timing delays
- Edge case handling
- Performance simulation

### Risk: Integration tests are brittle
**Mitigation**: Focus on contracts
- Test behavior, not implementation
- Use realistic data
- Test error paths
- Verify SLAs

### Risk: Takes longer than 5 days
**Mitigation**: Prioritize ruthlessly
- Day 1-2: Must have (schemas + core mock)
- Day 3: Should have (supporting mocks)
- Day 4: Integration proof
- Day 5: Polish (can slip if needed)

## 🎉 Final Deliverables

At end of Day 5, commit with message:

```
feat: complete Module 00 conversational foundation

This commit marks Module 00 as production-ready. All contracts are
implemented, tested, and documented. Downstream modules can begin
parallel development with confidence.

Deliverables:
✅ Conversation schemas (full Zod validation)
✅ MockConversationService (reference implementation)
✅ MockActionPreviewService
✅ MockNaturalLanguageProcessor
✅ MockPersonalizationEngine
✅ MockContextualMemory
✅ Integration test suite (5+ user journeys)
✅ CLI tool for manual testing
✅ PATTERNS.md (implementation guide)
✅ Examples directory
✅ Verification script

Quality metrics:
- Test coverage: >80%
- Performance SLAs: All met
- Code quality: Zero lint warnings
- Documentation: Complete

Ready for: Phase 1 parallel development (Modules 01-05)

Closes #module-00
```

## 🔄 Daily Standups

Track progress daily:

**Day 1:** "Completed conversation schemas. All validation working."
**Day 2:** "MockConversationService done. Tests passing. Meeting performance SLAs."
**Day 3:** "3 supporting mock services complete. System integration working."
**Day 4:** "Integration tests passing. CLI tool functional. Can test full flows."
**Day 5:** "Documentation complete. Verification passing. MODULE 00 DONE ✅"

---

## 💡 Key Principles

1. **Quality Over Speed**: Better to take 6 days and be solid than rush in 3 and have to refactor
2. **Patterns Matter**: Future modules will copy Module 00's patterns
3. **Test Everything**: Untested code is broken code
4. **Realistic Mocks**: Mocks should behave like real services
5. **Clear Contracts**: Ambiguity kills parallel development

## 🎯 Bottom Line

**Module 00 is the foundation for a $30M product.**

Do it right, and Modules 01-10 flow smoothly.
Do it wrong, and we'll be fixing it for months.

5 days of focused, quality work will save 50 days of rework.

Let's build it solid. 🏗️
