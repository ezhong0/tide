# E2E Function Calling Tests

## Overview

This directory contains **end-to-end tests** that verify your GPT-5 function calling orchestrator actually executes the correct commands for given inputs.

These tests answer the question: **"Does the AI call the right tools with the right parameters?"**

## Test Suites

### 1. Comprehensive E2E Tests (`function-calling.e2e.test.ts`)

Tests all aspects of function calling:
- ✅ Single tool selection (email, calendar, tasks)
- ✅ Parameter extraction accuracy
- ✅ Multi-tool orchestration
- ✅ Edge cases and error handling
- ✅ Performance requirements
- ✅ Confidence scoring

**Example:**
```typescript
it('should call search_emails for email search requests', async () => {
  const request = {
    content: 'Search my emails from john@example.com in the last week'
  };

  const response = await orchestrator.process(request, context);

  // Verifies:
  expect(response.metadata.toolsUsed).toContain('search_emails');
  expect(response.metadata.executionLog[0].args).toMatchObject({
    from: 'john@example.com'
  });
});
```

### 2. Behavior Validation Tests (`behavior-validation.e2e.test.ts`)

Data-driven tests using scenarios from `function-calling-scenarios.json`.

**To add new test cases**, just add to the JSON file:

```json
{
  "id": "email-search-custom",
  "description": "Your test description",
  "input": "Search emails about project alpha",
  "expectedTool": "search_emails",
  "expectedParams": {
    "query": "project alpha"
  }
}
```

The test runner automatically generates tests from all scenarios.

## Running the Tests

### Quick Start

```bash
# From project root or packages/services/ai directory

# Run all E2E tests (requires OpenAI API key)
OPENAI_API_KEY=your-key pnpm test e2e

# Run specific test file
OPENAI_API_KEY=your-key pnpm vitest src/__tests__/e2e/function-calling.e2e.test.ts

# Run behavior validation only
OPENAI_API_KEY=your-key pnpm vitest src/__tests__/e2e/behavior-validation.e2e.test.ts
```

### Using .env file

```bash
# Make sure .env has OPENAI_API_KEY set
cd packages/services/ai
pnpm test src/__tests__/e2e/
```

### Skip E2E Tests (for CI)

```bash
# Set environment variable to skip
SKIP_E2E_TESTS=true pnpm test
```

## What Gets Validated

### ✅ Tool Selection

Verifies the AI picks the correct function:

| Input | Expected Tool |
|-------|---------------|
| "Search my emails from john@example.com" | `search_emails` |
| "What meetings do I have tomorrow?" | `get_calendar_events` |
| "Create a high priority task" | `create_task` |
| "Find a 30-min meeting slot" | `find_meeting_times` |

### ✅ Parameter Extraction

Verifies the AI extracts parameters correctly:

```typescript
Input:  "Create a high priority task to review Q4 budget, due next Friday"

Expected:
{
  tool: "create_task",
  args: {
    title: "review Q4 budget",
    priority: "high",
    dueDate: "2025-10-31"  // Calculated correctly!
  }
}
```

### ✅ Multi-Tool Orchestration

Verifies the AI chains multiple tools:

```typescript
Input: "Check my calendar for tomorrow and create a task for any gaps"

Expected:
- Call get_calendar_events first
- Then call create_task with the results
- iterations >= 2
```

### ✅ Edge Cases

- **General knowledge**: Should NOT call tools for "What is the capital of France?"
- **Ambiguous requests**: Handles "Help me with this" gracefully
- **Safety**: Does NOT call `send_email` without explicit confirmation

### ✅ Performance

- Simple requests: < 5 seconds
- Multi-tool requests: < 10 seconds

## Test Results Interpretation

### Success Example

```
✅ [email-search-01] Basic email search by sender
   Tool called: search_emails
   Parameters extracted: { from: "john@example.com" }
   Execution time: 2.3s
   Confidence: 1.0
```

### Failure Example

```
❌ [email-search-01] Basic email search by sender
   Expected tool 'search_emails' to be called
   Actual tools: ['compose_email']

   → This indicates the AI misunderstood the request
```

### Parameter Mismatch Example

```
⚠️  [task-create-01] Create high priority task
   Tool called: ✅ create_task
   Parameter mismatch:
     Expected priority: "high"
     Actual priority: "medium"

   → The AI called the right tool but extracted priority incorrectly
```

## Mock Backend Services

Since your email/calendar/workflow services don't exist yet, the tests **mock all backend API calls**.

This means:
- ✅ Tests verify function calling orchestration
- ✅ Tests verify parameter extraction
- ❌ Tests do NOT verify actual backend service behavior

**Location:** Both test files have a `mockBackendServices()` function that intercepts fetch calls.

## Adding New Test Cases

### Option 1: Add to JSON (Recommended)

Edit `function-calling-scenarios.json`:

```json
{
  "id": "your-test-id",
  "description": "What this test validates",
  "input": "Natural language command",
  "expectedTool": "tool_name",
  "expectedParams": {
    "param1": "expected_value"
  }
}
```

Run tests - new test is automatically included!

### Option 2: Add Programmatic Test

Edit `function-calling.e2e.test.ts`:

```typescript
it('should handle your specific case', async () => {
  const request: AIRequest = {
    userId: mockContext.userId,
    content: 'Your test input here',
    context: {},
  };

  const response = await orchestrator.process(request, mockContext);

  // Your assertions
  expect(response.metadata?.toolsUsed).toContain('expected_tool');
});
```

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/ai-tests.yml
name: AI Service Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm --filter @tide/ai-service test

      - name: Run E2E tests
        if: github.ref == 'refs/heads/main'  # Only on main branch
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: pnpm --filter @tide/ai-service vitest src/__tests__/e2e/
```

### Cost Considerations

E2E tests make real OpenAI API calls:
- ~25 test cases × $0.01 per call = **~$0.25 per test run**
- Run strategically (not on every commit)
- Use `SKIP_E2E_TESTS=true` for local development

## Debugging Failed Tests

### 1. Check Tool Selection

```typescript
console.log('Tools called:', response.metadata.toolsUsed);
console.log('Expected:', 'search_emails');
```

If wrong tool is called:
- **Fix:** Improve tool descriptions in `src/tools/*.tools.ts`
- **Fix:** Add more specific examples to tool descriptions

### 2. Check Parameter Extraction

```typescript
console.log('Execution log:', response.metadata.executionLog);
```

If parameters are wrong:
- **Fix:** Improve parameter descriptions in tool definitions
- **Fix:** Add validation in tool handlers
- **Fix:** Adjust system prompt in `gpt5-orchestrator.ts`

### 3. Enable Detailed Logging

```typescript
// In your test
process.env.LOG_LEVEL = 'debug';
```

View logs to see full conversation with GPT-5.

### 4. Test with Different Models

```typescript
orchestrator = new GPT5Orchestrator({
  apiKey: API_KEY!,
  model: 'gpt-4-turbo',  // Try: gpt-4, gpt-4-turbo, gpt-3.5-turbo
});
```

## Success Criteria

Your function calling system is working if:

- ✅ **95%+ tests pass** - High accuracy in tool selection
- ✅ **Correct parameters** - AI extracts values accurately
- ✅ **Multi-tool works** - Can chain operations
- ✅ **Fast enough** - Meets performance requirements
- ✅ **Safe** - Doesn't call destructive tools without confirmation

## Next Steps

1. **Run the tests** to establish baseline
2. **Fix failures** by improving tool descriptions
3. **Add your own scenarios** for your specific use cases
4. **Integrate into CI** for regression testing
5. **Build backend services** to enable real integration tests

## Questions?

- Tool not being called? → Check tool description clarity
- Wrong parameters? → Check parameter schema and descriptions
- Tests too slow? → Reduce test cases or use faster model
- Too expensive? → Mock more aggressively or skip E2E tests

---

**Remember:** These tests validate that your AI **understands and routes commands correctly**. Once backend services exist, you'll need separate integration tests for end-to-end validation with real data.
