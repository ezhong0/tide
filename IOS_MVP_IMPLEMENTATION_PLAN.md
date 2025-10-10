# iOS MVP Implementation Plan
## Making Tide App Work With Real Data

**Created**: October 10, 2025
**Goal**: Connect iOS app to real backends and complete MVP features

---

## 🎯 PRIORITY ORDER

### Phase 1: Connect Chat to Real AI Backend ⚡ **IN PROGRESS**
**Blocking**: Users can't actually use AI with their data
**Time**: 1-2 hours

**What to Build**:
1. Create `AIService.swift` - calls `/api/ai/chat` endpoint
2. Update `TideCore.swift` - remove `simulateAIResponse()`, use real API
3. Test with actual user data

**API Endpoint**: `POST /api/ai/chat`
```json
{
  "userId": "uuid",
  "content": "user message",
  "context": {
    "userEmail": "user@example.com"
  }
}
```

**Response**:
```json
{
  "requestId": "req-xxx",
  "content": "AI response",
  "tokensUsed": 150,
  "executionTime": 1200
}
```

---

### Phase 2: Connect Calendar to Real Backend ⚡
**Blocking**: Calendar shows mock data, not user's actual calendar
**Time**: 1 hour

**What to Build**:
1. Create `CalendarService.swift` - calls calendar backend
2. Update `CalendarView.swift` - fetch real events, remove mock data
3. Handle empty state properly

**API Endpoints**:
- `GET /api/calendar/events/:userId` - fetch events
- `POST /api/calendar/events` - create event

---

### Phase 3: Build Email Detail View 📧
**Blocking**: Can't read full emails
**Time**: 2 hours

**What to Build**:
1. Create `EmailDetailView.swift` with:
   - Full email body
   - Reply/Forward/Delete actions
   - Thread view (if applicable)

**Design Pattern**: Similar to `CalendarView` event cards

---

### Phase 4: Build Email Compose View 📧
**Blocking**: Can't reply to emails
**Time**: 2-3 hours

**What to Build**:
1. Create `EmailComposeView.swift` with:
   - To/Subject/Body fields
   - Send button → calls backend
   - Draft saving (nice to have)

**API Endpoint**: `POST /api/email/send/:userId/:provider`

---

### Phase 5: Build Task Management 📝
**Status**: Nice to have, not blocking
**Time**: 3 hours

**What to Build**:
1. Create `TaskListView.swift` - list of tasks
2. Create `TaskCreateView.swift` - create/edit tasks
3. Create `TaskService.swift` - calls workflow backend

**API Endpoints**:
- Workflow service already has full CRUD

---

## 📝 DETAILED IMPLEMENTATION

### Phase 1: Chat Integration (CURRENT)

**Step 1: Create AIService**
```swift
// File: app/Services/AIService.swift
class AIService {
    static let shared = AIService()

    func chat(message: String) async throws -> AIResponse {
        // Call /api/ai/chat endpoint
    }
}
```

**Step 2: Update TideCore**
```swift
// Remove: simulateAIResponse()
// Add: Call AIService.shared.chat()
```

**Step 3: Test**
- User types "Show me my emails"
- AI responds with real data from backend
- Actions actually execute

---

### Phase 2: Calendar Integration

**Step 1: Create CalendarService**
```swift
class CalendarService {
    func fetchEvents() async throws -> [CalendarEvent]
    func createEvent(_ event: CalendarEvent) async throws
}
```

**Step 2: Update CalendarView**
```swift
// Remove: CalendarEvent.mockEvents
// Add: @State private var events = []
// onAppear: fetch real events
```

---

## ✅ SUCCESS CRITERIA

### Phase 1 Success
- [x] Chat calls real AI backend
- [x] AI responses use user's actual email/calendar data
- [x] Actions execute real API calls

### Phase 2 Success
- [ ] Calendar shows user's actual Google Calendar events
- [ ] Can create new events
- [ ] Events sync with Google Calendar

### Phase 3 Success
- [ ] Can tap email → see full content
- [ ] Can reply to email
- [ ] Email sends successfully

### Phase 4 Success
- [ ] Can compose new email
- [ ] Can forward emails
- [ ] Emails send successfully

### Phase 5 Success
- [ ] Can view task list
- [ ] Can create tasks
- [ ] Can mark tasks complete

---

## 🚀 DEPLOYMENT READINESS

**After Phase 1-2**: Alpha-ready (core chat + calendar work)
**After Phase 3-4**: Beta-ready (email fully functional)
**After Phase 5**: MVP-complete (all core features working)

---

**Status**: Phase 1 in progress
**Next**: Create AIService.swift
