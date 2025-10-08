# 📋 Tide Development TODO List

**Last Updated**: 2025-10-07
**Generated from**: Comprehensive system bug scan (47 bugs identified)
**Status**: 10 bugs fixed, 37 remaining + feature work

---

## 🎯 Quick Summary

| Priority | Fixed | Remaining | Total |
|----------|-------|-----------|-------|
| 🔴 Critical | 5 | 2 | 7 |
| 🟠 High | 2 | 10 | 12 |
| 🟡 Medium | 0 | 18 | 18 |
| 🟢 Low | 0 | 10 | 10 |
| **Total** | **7** | **40** | **47** |

---

## 🔴 CRITICAL BUGS (2 Remaining - Must Fix ASAP)

### 1. Race Condition in Calendar Conflict Auto-Resolve
**File**: `/packages/services/calendar/src/conflict/conflict-resolver.ts:457-497`
**Status**: ❌ NOT FIXED
**Severity**: CRITICAL

**Problem**: Multiple conflicts processed concurrently without state locking
```typescript
for (const conflict of conflicts) {
  if (conflict.severity === 'low' || conflict.severity === 'medium') {
    try {
      const resolution = await this.resolve(conflict);  // No locking!
```

**Impact**: Two concurrent resolutions could modify the same events → data corruption

**Fix Required**:
- Implement event-level locking mechanism
- OR process conflicts sequentially for same event
- Add transaction rollback on conflict

**Estimated Time**: 2-3 hours

---

### 2. SQL Injection Risk in Meeting Preparation
**File**: `/packages/services/calendar/src/meeting-prep/meeting-preparation.ts:369`
**Status**: ❌ NOT FIXED
**Severity**: CRITICAL (Security)

**Problem**: Unsafe string interpolation in database query
```typescript
.or(
  `from_address.in.(${attendeeEmails.join(',')}),subject.ilike.%${meeting.title.substring(0, 20)}%`
)
```

**Impact**: `meeting.title` is user-controlled → SQL injection possible

**Fix Required**:
```typescript
// Escape special characters
.or(`from_address.in.(${attendeeEmails.join(',')})`)
.or(`subject.ilike.%${meeting.title.substring(0, 20).replace(/[%_]/g, '\\$&')}%`)
```

**Estimated Time**: 30 minutes

---

## 🟠 HIGH SEVERITY BUGS (10 Remaining)

### 3. Missing Timeout in AI Model Client
**File**: `/packages/services/ai/src/models/clients/anthropic-client.ts:21-56`
**Status**: ❌ NOT FIXED

**Problem**: No timeout or retry logic for AI API calls
```typescript
const response = await this.client.messages.create({
  model: this.model,
  max_tokens: options.maxTokens ?? 1000,
  // No timeout specified
```

**Fix Required**:
```typescript
const response = await Promise.race([
  this.client.messages.create({...}),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), 30000)
  )
]);
```

**Estimated Time**: 1 hour

---

### 4. Unhandled Promise Rejection in Chat ViewModel
**File**: `/apps/mobile-ios/TideApp/Features/Chat/ChatViewModel.swift:88-108`
**Status**: ❌ NOT FIXED

**Problem**: Task executes action without proper error tracking
```swift
func executeAction(_ action: SuggestedAction) {
    Task {
        do {
            try await apiClient.executeAction(action)
```

**Fix Required**: Make this an async function and track Task lifecycle

**Estimated Time**: 45 minutes

---

### 5. Hardcoded Timezone in Calendar Provider
**File**: `/packages/services/calendar/src/providers/google-calendar.provider.ts:158,162`
**Status**: ❌ NOT FIXED

**Problem**: All events created in Pacific time
```typescript
start: {
  dateTime: event.start?.toISOString(),
  timeZone: 'America/Los_Angeles', // Should be configurable
},
```

**Fix Required**: Pass timezone from user settings or detect from event context

**Estimated Time**: 2 hours

---

### 6. Missing API Response Validation
**File**: `/apps/mobile-ios/TideApp/Services/APIClient.swift:186-194`
**Status**: ❌ NOT FIXED

**Problem**: Only validates status code, not response structure
```swift
private func validateResponse(_ response: URLResponse) throws {
    guard let httpResponse = response as? HTTPURLResponse else {
        throw APIError.invalidResponse
    }
```

**Fix Required**: Add Content-Type validation and better JSON error messages

**Estimated Time**: 1 hour

---

### 7. No Retry Logic for Network Failures
**File**: `/apps/mobile-ios/TideApp/Services/APIClient.swift:128-140`
**Status**: ❌ NOT FIXED

**Problem**: Transient network failures cause immediate errors
```swift
let (data, response) = try await session.data(for: request)
```

**Fix Required**: Implement exponential backoff retry for GET requests

**Estimated Time**: 2 hours

---

### 8. Missing Input Sanitization in Email Composer
**File**: `/packages/services/email/src/composer/smart-composer.ts:315`
**Status**: ❌ NOT FIXED

**Problem**: User input directly inserted without sanitization
```typescript
body: bodyLines.join('\n').trim() || this.generateBody('detailed', request, {...}, ''),
```

**Fix Required**: Sanitize and validate all user inputs before using in templates

**Estimated Time**: 1.5 hours

---

### 9. Potential Integer Overflow in Duration Calculation
**File**: `/packages/services/calendar/src/optimizer/calendar-optimizer.ts:136`
**Status**: ❌ NOT FIXED

**Problem**: No validation on duration calculation
```typescript
const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60);
return sum + duration;
```

**Fix Required**:
```typescript
const duration = Math.max(0, (event.end.getTime() - event.start.getTime()) / (1000 * 60));
```

**Estimated Time**: 15 minutes

---

### 10. Unhandled Edge Case in Slot Intersection
**File**: `/packages/services/calendar/src/scheduler/smart-scheduler.ts:95-111`
**Status**: ❌ NOT FIXED

**Problem**: Zero-duration slots silently dropped
```typescript
if (start < end) {
  intersections.push({ start, end });
}
```

**Fix Required**: Add logging for `start === end` case

**Estimated Time**: 15 minutes

---

### 11. Memory Leak in WebSocket Reconnection
**File**: `/apps/mobile-ios/Services/WebSocketManager.swift:75-85`
**Status**: ❌ NOT FIXED

**Problem**: Multiple Tasks created without tracking
```swift
func reconnect() {
    disconnect()

    if let token = accessToken {
        Task {
            try? await Task.sleep(nanoseconds: 2_000_000_000)
            await connect(token: token)
        }
    }
}
```

**Fix Required**: Track reconnection Task and cancel previous attempts

**Estimated Time**: 1 hour

---

### 12. Missing Default Case Error Handling
**File**: `/packages/services/email/src/automation/email-automation.ts:48-76`
**Status**: ❌ NOT FIXED

**Problem**: Unknown strategies silently queued instead of logging
```typescript
default:
  return {
    type: 'queue_for_review',
    confidence: 0.5,
    reasoning: 'Unknown strategy - queuing for manual review',
  };
```

**Fix Required**: Log unknown strategies and throw error in development

**Estimated Time**: 30 minutes

---

## 🟡 MEDIUM SEVERITY BUGS (18 Remaining)

### 13. Off-by-One Error in Focus Block Counting
**File**: `/packages/services/calendar/src/optimizer/calendar-optimizer.ts:218-228`
**Priority**: Medium
**Fix**: Add `currentTime = Math.min(currentTime, endOfDay)` before final gap check
**Time**: 30 minutes

---

### 14. Weak Confidence Calculation
**File**: `/packages/services/email/src/triage/triage-engine.ts:419-450`
**Priority**: Low
**Fix**: Review confidence weighting logic
**Time**: 1 hour

---

### 15. Infinite Loop Risk in Slot Generation
**File**: `/packages/services/calendar/src/scheduler/smart-scheduler.ts:324-348`
**Priority**: Medium
**Fix**: Add max iteration count (e.g., 1000 slots max)
**Time**: 30 minutes

---

### 16. Unsafe JSON Parsing
**File**: `/packages/services/ai/src/reasoning/reasoning-engine.ts:144-147`
**Priority**: Medium
**Fix**: Log parse failures with original content
**Time**: 15 minutes

---

### 17. Missing Pagination in Email Fetch
**File**: `/packages/services/email/src/providers/gmail.provider.ts:68`
**Priority**: Medium (Performance)
**Fix**: Implement Gmail API pagination with nextPageToken
**Time**: 2 hours

---

### 18. Race Condition in Message Append
**File**: `/apps/mobile-ios/TideApp/Features/Chat/ChatViewModel.swift:56-79`
**Priority**: Medium
**Fix**: Use message queue or timestamp-based ordering
**Time**: 1.5 hours

---

### 19. Weak Email Address Extraction
**File**: `/packages/services/email/src/composer/smart-composer.ts:608-621`
**Priority**: Low
**Fix**: Parse display name from email header properly
**Time**: 30 minutes

---

### 20. No Validation on Meeting Duration
**File**: `/packages/services/email/src/automation/email-automation.ts:297-303`
**Priority**: Medium
**Fix**: Add validation: `duration = Math.min(Math.max(value, 15), 480)`
**Time**: 15 minutes

---

### 21. Unhandled Error in Stream
**File**: `/packages/services/ai/src/models/clients/anthropic-client.ts:58-80`
**Priority**: Medium
**Fix**: Catch and re-throw streaming errors with context
**Time**: 30 minutes

---

### 22. Type Mismatch in AnyCodable
**File**: `/apps/mobile-ios/Services/WebSocketManager.swift:332-352`
**Priority**: Medium
**Fix**: Throw decoding error for unsupported types
**Time**: 30 minutes

---

### 23. Missing Timeout in HTTP Requests
**File**: `/packages/services/calendar/src/meeting-prep/meeting-preparation.ts:94-114`
**Priority**: Medium
**Fix**: Use AbortController with timeout
**Time**: 45 minutes

---

### 24. Incorrect Timezone in Smart Scheduler
**File**: `/packages/services/calendar/src/scheduler/smart-scheduler.ts:475-477`
**Priority**: Medium
**Fix**: Accept timezone parameter for all time operations
**Time**: 1.5 hours

---

### 25. Weak Alternative Generation
**File**: `/packages/services/ai/src/reasoning/reasoning-engine.ts:186-202`
**Priority**: Low
**Fix**: Document null return value and handle in caller
**Time**: 30 minutes

---

### 26. No Bounds Checking on Array Index (Smart Composer)
**File**: `/packages/services/email/src/composer/smart-composer.ts:174`
**Priority**: Medium
**Fix**: Add default fallback object if array is empty
**Time**: 15 minutes

---

### 27. Unsafe Force Unwrap in Swift (APIClient)
**File**: `/apps/mobile-ios/TideApp/Services/APIClient.swift:129`
**Priority**: Medium
**Fix**: Use guard let for URL creation
**Time**: 15 minutes

---

### 28. Missing Deduplication in Common Slots
**File**: `/packages/services/calendar/src/scheduler/smart-scheduler.ts:78-83`
**Priority**: Low
**Fix**: Add deduplication step after intersection
**Time**: 30 minutes

---

### 29. Weak Random Data in Mock Functions
**File**: `/packages/services/calendar/src/meeting-prep/meeting-preparation.ts:269-274`
**Priority**: Low
**Fix**: Add environment check or remove mocks from production
**Time**: 15 minutes

---

### 30. Missing Validation on Time Slot
**File**: `/packages/services/calendar/src/conflict/conflict-resolver.ts:299-318`
**Priority**: Medium
**Fix**: Filter candidates to only future slots
**Time**: 30 minutes

---

## 🟢 LOW SEVERITY BUGS (10 Remaining)

### 31-40. Additional Low-Priority Issues

- **31**: Missing error boundary in reasoning chain synthesis (reasoning-engine.ts:240-247) - 30 min
- **32**: No validation on attendee count in optimizer (calendar-optimizer.ts:254) - 15 min
- **33**: Potential division by zero in complexity calculation (multi-model-router.ts:93) - 15 min
- **34**: Missing null check on thread length (smart-composer.ts:128) - 15 min
- **35**: Weak external email detection (conflict-resolver.ts:278-282) - 30 min
- **36**: No validation on slot duration (conflict-resolver.ts:291) - 15 min
- **37**: Missing bounds check on alternatives (conflict-resolver.ts:318) - 15 min
- **38**: Inefficient string concatenation in buildPrompt (base-agent.ts:93-113) - 30 min
- **39**: No expiry check on cached tokens (AuthService.swift:84-101) - 45 min
- **40**: Missing Content-Type validation (APIClient.swift:186-194) - 30 min

---

## ✅ BUGS ALREADY FIXED (10 Total)

### Critical/High Fixed
1. ✅ OAuth Token Type Conversions - `packages/services/email/src/index.ts:257-258`
2. ✅ Missing AI Fields in Cached Responses - `packages/services/email/src/index.ts:223-226`
3. ✅ Supabase Anon Key - `apps/mobile-ios/Core/Config.swift:15`
4. ✅ Date Decoding Strategy - `apps/mobile-ios/Services/APIClient.swift:82`
5. ✅ Performance - Parallel Processing - `packages/services/email/src/index.ts:274-343`
6. ✅ Unsafe Type Cast in Gmail Provider - `gmail.provider.ts:77-79`
7. ✅ WebSocket Authentication Race - `WebSocketManager.swift:60`
8. ✅ Missing Null Checks on Email Headers - `gmail.provider.ts:132-136`
9. ✅ Invalid Date Parsing - `gmail.provider.ts:141-143`
10. ✅ Array Access Without Bounds - `email-automation.ts:121`

---

## 🚀 FEATURE DEVELOPMENT TASKS

### Track 1: Email Intelligence (95% Complete)
- [ ] Smart Compose Integration (iOS UI needed)
- [ ] VIP Detection Implementation
- [ ] Real-time Email Sync (Gmail push notifications)
- [ ] Full-text Search Backend
- [ ] Email Attachments UI
- [ ] Offline Email Reading

### Track 2: Calendar Intelligence (85% Complete)
- [ ] Meeting Prep UI Integration
- [ ] Smart Scheduling UI
- [ ] Calendar Optimization Insights
- [ ] Travel Time Calculation
- [ ] Energy-based Scheduling

### Track 3: AI Chat Interface (95% Complete)
- [ ] Wire iOS app to `/chat` endpoint
- [ ] Streaming Response UI (SSE)
- [ ] Voice Input Preprocessing
- [ ] File Attachments Support

### Track 4: Task & Workflow (90% Complete)
- [ ] Pattern Detection ML Integration
- [ ] Team Workflow Support
- [ ] Delegation UI
- [ ] Approval Workflows

---

## 🔧 INFRASTRUCTURE TASKS

### Database
- [ ] Run Supabase migration: `supabase/migrations/20251007_complete_schema.sql`
- [ ] Set up Row-Level Security (RLS) policies
- [ ] Configure database backups
- [ ] Add database indexes for performance

### Deployment
- [ ] Verify all Railway services healthy
- [ ] Configure environment variables across services
- [ ] Set up monitoring (Sentry/similar)
- [ ] Configure CI/CD pipeline

### Testing
- [ ] Unit tests for all edge cases
- [ ] Integration tests for email flow
- [ ] End-to-end OAuth testing
- [ ] Performance testing (50+ emails)

---

## 📊 TIME ESTIMATES

### Critical Bugs (Must Fix)
- **2 bugs remaining**: ~3.5 hours total

### High Severity Bugs (Should Fix)
- **10 bugs remaining**: ~12 hours total

### Medium Severity Bugs (Nice to Fix)
- **18 bugs remaining**: ~14 hours total

### Low Severity Bugs (Optional)
- **10 bugs remaining**: ~4 hours total

**Total Bug Fix Time**: ~33.5 hours

### Feature Development
- **Track 1-4 Completion**: ~40 hours
- **Infrastructure Setup**: ~20 hours

**Grand Total**: ~93.5 hours (~2.5 weeks)

---

## 🎯 RECOMMENDED EXECUTION ORDER

### Week 1: Critical Path (Security & Stability)
**Day 1-2**:
- Fix critical bugs #1-2 (3.5 hours)
- Fix high severity bugs #3-7 (7 hours)

**Day 3-4**:
- Fix high severity bugs #8-12 (5 hours)
- Fix top 5 medium bugs (#13, #15, #17, #18, #20)

**Day 5**:
- Run end-to-end testing
- Fix any showstoppers found

### Week 2: Feature Completion
**Day 1-3**:
- Complete Track 1 (Email) features
- Complete Track 3 (Chat) integration

**Day 4-5**:
- Complete Track 2 (Calendar) features
- Complete Track 4 (Workflow) features

### Week 3: Polish & Deploy
**Day 1-2**:
- Fix remaining medium/low bugs
- Add comprehensive error tracking

**Day 3-4**:
- Performance optimization
- Security audit

**Day 5**:
- Production deployment
- User acceptance testing

---

## 📝 NOTES

### Code Quality Improvements Needed
1. **Type Safety**: Stricter TypeScript config, eliminate force unwraps
2. **Error Handling**: Comprehensive error boundaries, better logging
3. **Input Validation**: Schema validation for all API inputs
4. **Security**: Parameterized queries, input sanitization
5. **Performance**: Caching strategy, query optimization

### Testing Strategy
1. Add unit tests for all bug fixes
2. Integration tests for critical flows
3. Load testing for 100+ concurrent users
4. Security penetration testing

### Monitoring & Observability
1. Set up error tracking (Sentry)
2. Add performance monitoring (APM)
3. Configure log aggregation
4. Set up alerting for critical errors

---

**Generated**: 2025-10-07
**Next Review**: After critical bugs fixed
**Status**: 🟡 In Progress - Focus on critical/high severity bugs first
