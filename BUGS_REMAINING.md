# 🐛 Remaining Bugs to Fix

**Status**: 22/47 bugs fixed (47% complete)
**Updated**: 2025-10-07

---

## ✅ Completed (22 bugs)

### Critical (2/2) ✅
1. ✅ Race Condition in Calendar Conflict Resolver
2. ✅ SQL Injection in Meeting Preparation

### High Severity (10/12) ✅
3. ✅ Missing Timeout in AI Model Client
4. ✅ Unhandled Promise Rejection in Chat ViewModel
5. ✅ Hardcoded Timezone in Calendar Provider
6. ✅ Integer Overflow in Duration Calculation
7. ✅ Unhandled Edge Case in Slot Intersection
8. ✅ Memory Leak in WebSocket Reconnection
9. ✅ Missing Default Case Error Handling
10. ✅ Missing Input Sanitization in Email Composer

### Previously Fixed (10 bugs)
11-20. ✅ See commits 9a22bd1, 56b3f8a, 3a65cf7

---

## 🔧 TODO: Medium Severity Bugs (18 remaining)

### 13. Off-by-One Error in Focus Block Counting
**File**: `calendar-optimizer.ts:218-228`
**Fix**: Add `currentTime = Math.min(currentTime, endOfDay)` before final gap check
```typescript
// After loop, check final gap
currentTime = Math.min(currentTime, endOfDay); // ADD THIS
const finalGap = (endOfDay.getTime() - currentTime.getTime()) / (1000 * 60);
if (finalGap >= 120) focusBlockCount++;
```

### 14. Weak Confidence Calculation
**File**: `triage-engine.ts:419-450`
**Fix**: Review and improve confidence weighting logic

### 15. Infinite Loop Risk in Slot Generation
**File**: `smart-scheduler.ts:324-348`
**Fix**: Add max iteration count
```typescript
const MAX_SLOTS = 1000;
let slotCount = 0;
while (current < end && slotCount < MAX_SLOTS) {
  // ...
  slotCount++;
}
```

### 16. Unsafe JSON Parsing
**File**: `reasoning-engine.ts:144-147`
**Fix**: Log parse failures
```typescript
} catch (error) {
  logger.warn({ error, content: response.content }, 'Failed to parse AI response as JSON');
  output = { result: response.content };
}
```

### 17. Missing Pagination in Email Fetch
**File**: `gmail.provider.ts:68`
**Fix**: Implement Gmail API pagination with nextPageToken
```typescript
let pageToken: string | undefined;
do {
  const response = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 50,
    pageToken
  });
  // Process messages...
  pageToken = response.data.nextPageToken;
} while (pageToken);
```

### 18. Race Condition in Message Append
**File**: `ChatViewModel.swift:56-79`
**Fix**: Use message queue or timestamp-based ordering
```swift
private var messageQueue: [ChatMessage] = []
private let messageQueue = DispatchQueue(label: "com.tide.messageQueue")
```

### 19. Weak Email Address Extraction
**File**: `smart-composer.ts:608-621`
**Fix**: Parse display name from email header
```typescript
private extractName(email: string): string {
  // Handle "Name <email@domain.com>" format
  const match = email.match(/^(.+)\s*<.*>$/);
  if (match) return match[1].trim();

  // Fall back to local part extraction
  const localPart = email.split('@')[0];
  // ... existing logic
}
```

### 20. No Validation on Meeting Duration
**File**: `email-automation.ts:297-303`
**Fix**: Add validation
```typescript
duration = Math.min(Math.max(value, 15), 480); // 15 min to 8 hours
```

### 21. Unhandled Error in Stream
**File**: `anthropic-client.ts:58-80`
**Fix**: Catch and re-throw streaming errors
```typescript
try {
  for await (const event of stream) {
    if (event.type === 'content_block_delta') {
      yield event.delta.text;
    }
  }
} catch (error) {
  logger.error({ error }, 'Streaming error occurred');
  throw new Error(`Stream failed: ${error.message}`);
}
```

### 22. Type Mismatch in AnyCodable
**File**: `WebSocketManager.swift:332-352`
**Fix**: Throw decoding error for unsupported types
```swift
} else {
    throw DecodingError.typeMismatch(
        AnyCodable.self,
        DecodingError.Context(codingPath: decoder.codingPath, debugDescription: "Unsupported type")
    )
}
```

### 23. Missing Timeout in HTTP Requests
**File**: `meeting-preparation.ts:94-114`
**Fix**: Use AbortController with timeout
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

const response = await fetch(url, {
  signal: controller.signal,
  // ... other options
});

clearTimeout(timeoutId);
```

### 24. Incorrect Timezone in Smart Scheduler
**File**: `smart-scheduler.ts:475-477`
**Fix**: Accept timezone parameter
```typescript
private getEndOfDay(date: Date, timezone: string = 'UTC'): Date {
  // Use timezone library to calculate EOD in user's timezone
}
```

### 25. Weak Alternative Generation
**File**: `reasoning-engine.ts:186-202`
**Fix**: Document null return value
```typescript
/**
 * Find alternative approach
 * @returns Alternative approach or null if none found
 */
async findAlternative(): Promise<Approach | null> {
  // ...
}
```

### 26. No Bounds Checking (Smart Composer)
**File**: `smart-composer.ts:174`
**Fix**: Add default fallback
```typescript
const acknowledgment = drafts.find((d) => d.approach === 'concise') || drafts[0] || {
  subject: 'Acknowledgment',
  body: 'Thank you for your message.',
  approach: 'concise',
  tone: 'professional',
  length: 30,
  confidence: 0.5
};
```

### 27. Unsafe Force Unwrap (APIClient)
**File**: `APIClient.swift:129`
**Fix**: Use guard let
```swift
guard let url = URL(string: baseURL + path) else {
    throw APIError.invalidURL
}
```

### 28. Missing Deduplication in Common Slots
**File**: `smart-scheduler.ts:78-83`
**Fix**: Add deduplication
```typescript
commonSlots = this.deduplicateSlots(commonSlots);
```

### 29. Mock Data in Production
**File**: `meeting-preparation.ts:269-274`
**Fix**: Remove mocks or add environment check
```typescript
if (process.env.NODE_ENV === 'development') {
  // Return mock data
} else {
  // Return real data or empty
}
```

### 30. Missing Validation on Time Slot
**File**: `conflict-resolver.ts:299-318`
**Fix**: Filter to future slots only
```typescript
const futureCandidates = candidates.filter(slot => slot.start > new Date());
```

---

## 🟢 TODO: Low Severity Bugs (10 remaining)

### 31-40. Quick Fixes (15-45 min each)

- **31**: Error boundary in reasoning chain (reasoning-engine.ts:240) - 30 min
- **32**: Attendee count validation (calendar-optimizer.ts:254) - 15 min
- **33**: Division by zero check (multi-model-router.ts:93) - 15 min
- **34**: Null check on thread length (smart-composer.ts:128) - 15 min
- **35**: External email detection (conflict-resolver.ts:278) - 30 min
- **36**: Slot duration validation (conflict-resolver.ts:291) - 15 min
- **37**: Alternatives bounds check (conflict-resolver.ts:318) - 15 min
- **38**: String concatenation optimization (base-agent.ts:93) - 30 min
- **39**: Token expiry check (AuthService.swift:84) - 45 min
- **40**: Content-Type validation (APIClient.swift:186) - 30 min

---

## 📊 Summary

**Total Bugs**: 47
- ✅ **Fixed**: 22 (47%)
- 🔧 **Remaining**: 25 (53%)
  - Medium: 18
  - Low: 7 (3 were already fixed)

**Estimated Time to Complete**:
- Medium bugs: ~14 hours
- Low bugs: ~4 hours
- **Total**: ~18 hours (2-3 days)

---

## 🎯 Next Steps

### Day 1: Medium Bugs #13-20 (8 bugs, ~6 hours)
### Day 2: Medium Bugs #21-30 (10 bugs, ~8 hours)
### Day 3: Low Bugs #31-40 (10 bugs, ~4 hours)

After completion, run comprehensive integration tests and update TODO.md with 100% completion status.
