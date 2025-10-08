# 🧪 Testing Strategy

**Timeline**: Week 9 (1 week intensive)
**Priority**: 🔴 P0 - Cannot Ship Without Tests
**Target**: 60% code coverage minimum
**Current**: 5% coverage

---

## 🎯 Goals

1. **60% Code Coverage**: Focus on critical paths
2. **Zero Regressions**: All tests pass before merge
3. **Fast Feedback**: Tests run in < 5 minutes
4. **Confidence to Ship**: Know features work

---

## 📊 Testing Pyramid

```
        /\
       /E2E\         10% - End-to-end (5 critical flows)
      /------\
     /  API   \      30% - Integration (service + API)
    /----------\
   /    Unit    \    60% - Unit tests (pure logic)
  /--------------\
```

### Coverage Targets by Layer
- **Unit Tests**: 60% of codebase (ViewModels, Services, Utils)
- **Integration Tests**: 30% (API endpoints, repositories)
- **E2E Tests**: 10% (Critical user flows)

---

## 🧪 Unit Tests (60% of effort)

### iOS Unit Tests

#### 1. ViewModel Tests
**Purpose**: Test business logic without UI

**Example: ChatViewModel**
```swift
// TideAppTests/ViewModels/ChatViewModelTests.swift

import XCTest
@testable import TideApp

@MainActor
class ChatViewModelTests: XCTestCase {
    var sut: ChatViewModel!
    var mockAPIClient: MockAPIClient!
    var mockAuthManager: MockAuthManager!
    var mockRepository: MockChatRepository!

    override func setUp() {
        super.setUp()
        mockAPIClient = MockAPIClient()
        mockAuthManager = MockAuthManager()
        mockRepository = MockChatRepository()

        sut = ChatViewModel(
            apiClient: mockAPIClient,
            authManager: mockAuthManager,
            chatRepository: mockRepository
        )
    }

    override func tearDown() {
        sut = nil
        mockAPIClient = nil
        mockAuthManager = nil
        mockRepository = nil
        super.tearDown()
    }

    // MARK: - Message Sending

    func testSendMessage_AddsMessageToList() async {
        // Given
        let message = "Hello, Tide"

        // When
        await sut.sendMessage(message)

        // Then
        XCTAssertEqual(sut.messages.count, 1)
        XCTAssertEqual(sut.messages[0].content, message)
        XCTAssertEqual(sut.messages[0].role, .user)
    }

    func testSendMessage_CallsAPI() async {
        // Given
        let message = "Test message"
        mockAPIClient.chatResponse = ChatResponse(
            content: "AI response",
            intents: []
        )

        // When
        await sut.sendMessage(message)

        // Then
        XCTAssertEqual(mockAPIClient.postCallCount, 1)
        XCTAssertEqual(mockAPIClient.lastPath, "/api/chat/send")
    }

    func testSendMessage_AddsAIResponse() async {
        // Given
        mockAPIClient.chatResponse = ChatResponse(
            content: "AI response",
            intents: []
        )

        // When
        await sut.sendMessage("Hello")

        // Then
        XCTAssertEqual(sut.messages.count, 2) // User + AI
        XCTAssertEqual(sut.messages[1].content, "AI response")
        XCTAssertEqual(sut.messages[1].role, .assistant)
    }

    func testSendMessage_HandlesError() async {
        // Given
        mockAPIClient.shouldFail = true

        // When
        await sut.sendMessage("Hello")

        // Then
        XCTAssertNotNil(sut.error)
        XCTAssertEqual(sut.messages.count, 1) // Only user message
    }

    func testSendMessage_ClearsInput() async {
        // Given
        sut.inputText = "Test message"

        // When
        await sut.sendMessage(sut.inputText)

        // Then
        XCTAssertEqual(sut.inputText, "")
    }

    // MARK: - Conversation Loading

    func testLoadConversationHistory_PopulatesMessages() async {
        // Given
        let mockMessages = [
            ChatMessage(role: .user, content: "Message 1"),
            ChatMessage(role: .assistant, content: "Response 1"),
        ]
        mockRepository.messages = mockMessages

        // When
        await sut.loadConversationHistory(conversationId: "test-id")

        // Then
        XCTAssertEqual(sut.messages.count, 2)
        XCTAssertEqual(sut.messages, mockMessages)
    }

    func testLoadConversationHistory_SetsLoadingState() async {
        // Given
        mockRepository.delaySeconds = 0.5

        // When
        let loadTask = Task {
            await sut.loadConversationHistory(conversationId: "test-id")
        }

        // Then
        XCTAssertTrue(sut.isLoading)

        await loadTask.value
        XCTAssertFalse(sut.isLoading)
    }
}
```

**Mock Implementations**:
```swift
// TideAppTests/Mocks/MockAPIClient.swift

class MockAPIClient: APIClientProtocol {
    var postCallCount = 0
    var getCallCount = 0
    var lastPath: String?
    var shouldFail = false
    var chatResponse: ChatResponse?

    func get<T: Decodable>(_ path: String) async throws -> T {
        getCallCount += 1
        lastPath = path

        if shouldFail {
            throw APIError.serverError(message: "Mock error")
        }

        // Return mock response based on type
        if T.self == [Email].self {
            return [] as! T
        }

        fatalError("Unhandled type: \(T.self)")
    }

    func post<T: Decodable, U: Encodable>(_ path: String, body: U) async throws -> T {
        postCallCount += 1
        lastPath = path

        if shouldFail {
            throw APIError.serverError(message: "Mock error")
        }

        if let response = chatResponse as? T {
            return response
        }

        fatalError("No mock response configured")
    }

    // ... other methods
}
```

**ViewModels to Test** (Priority Order):
```
1. ChatViewModel (P0)
   - sendMessage
   - loadConversationHistory
   - error handling

2. EmailInboxViewModel (P0)
   - loadEmails
   - deleteEmail
   - archiveEmail
   - toggleRead

3. EmailDetailViewModel (P0)
   - loadEmail
   - loadThread
   - archive/delete
   - toggleStar

4. EmailComposeViewModel (P0)
   - send
   - generateAISuggestions
   - validation
   - draft saving

5. CalendarGridViewModel (P1)
   - loadEvents
   - jumpToToday
   - navigation

6. EventEditViewModel (P1)
   - save
   - delete
   - conflict detection

7. TaskListViewModel (P1)
   - loadTasks
   - toggleStatus
   - delete

8. LoginViewModel (P0)
   - signInWithGoogle
   - token storage
   - error handling
```

**Checklist**:
- [ ] 8 ViewModel test files created
- [ ] All critical methods tested
- [ ] Happy path tests
- [ ] Error path tests
- [ ] Loading state tests
- [ ] Mock implementations
- [ ] 60%+ ViewModel coverage

---

#### 2. Service Tests

**Example: AuthManager**
```swift
// TideAppTests/Services/AuthManagerTests.swift

class AuthManagerTests: XCTestCase {
    var sut: AuthManager!
    var mockSupabase: MockSupabaseManager!

    override func setUp() {
        super.setUp()
        mockSupabase = MockSupabaseManager()
        sut = AuthManager(supabaseManager: mockSupabase)
    }

    func testLogin_Success_SavesToken() async throws {
        // Given
        mockSupabase.authResponse = AuthResult(
            user: User(id: "123", email: "test@example.com", name: "Test"),
            accessToken: "access-token",
            refreshToken: "refresh-token"
        )

        // When
        let result = try await sut.login(email: "test@example.com", password: "password")

        // Then
        XCTAssertEqual(result.accessToken, "access-token")
        XCTAssertTrue(sut.isAuthenticated)
        XCTAssertNotNil(sut.currentUser)
    }

    func testLogin_InvalidCredentials_ThrowsError() async {
        // Given
        mockSupabase.shouldFail = true

        // When/Then
        do {
            _ = try await sut.login(email: "wrong@example.com", password: "wrong")
            XCTFail("Should throw error")
        } catch {
            XCTAssertTrue(error is AuthError)
        }
    }

    func testLogout_ClearsTokens() async throws {
        // Given
        mockSupabase.authResponse = AuthResult(
            user: User(id: "123", email: "test@example.com", name: "Test"),
            accessToken: "token",
            refreshToken: "refresh"
        )
        _ = try await sut.login(email: "test@example.com", password: "password")

        // When
        try await sut.logout()

        // Then
        XCTAssertFalse(sut.isAuthenticated)
        XCTAssertNil(sut.currentUser)
    }

    func testRefreshToken_UpdatesAccessToken() async throws {
        // Given
        mockSupabase.newAccessToken = "new-access-token"

        // When
        try await sut.refreshToken()

        // Then
        XCTAssertEqual(mockSupabase.refreshCallCount, 1)
    }
}
```

**Services to Test**:
```
1. AuthManager (P0)
   - login/logout
   - token refresh
   - token storage

2. APIClient (P0)
   - request construction
   - token injection
   - error mapping

3. SupabaseManager (P1)
   - CRUD operations
   - error handling

4. CacheManager (P2)
   - cache get/set
   - expiration

5. OfflineQueue (P2)
   - queue operations
   - retry logic
```

**Checklist**:
- [ ] 5 Service test files
- [ ] Core functionality tested
- [ ] Error handling tested
- [ ] 70%+ Service coverage

---

#### 3. Utility & Extension Tests

```swift
// TideAppTests/Extensions/DateExtensionsTests.swift

class DateExtensionsTests: XCTestCase {
    func testSafeAdd_AddsMonthCorrectly() {
        // Given
        let date = DateComponents(year: 2025, month: 1, day: 15)
        let startDate = Calendar.current.date(from: date)!

        // When
        let result = startDate.safeAdd(.month, value: 1)

        // Then
        let components = Calendar.current.dateComponents([.year, .month], from: result)
        XCTAssertEqual(components.year, 2025)
        XCTAssertEqual(components.month, 2)
    }

    func testStartOfMonth_ReturnsFirstDay() {
        // Given
        let date = DateComponents(year: 2025, month: 3, day: 15)
        let midMonth = Calendar.current.date(from: date)!

        // When
        let result = midMonth.startOfMonth()

        // Then
        let components = Calendar.current.dateComponents([.day], from: result)
        XCTAssertEqual(components.day, 1)
    }

    func testDaysInMonth_HandlesLeapYear() {
        // Given
        let feb2024 = DateComponents(year: 2024, month: 2, day: 1)
        let leapDate = Calendar.current.date(from: feb2024)!

        // When
        let days = leapDate.daysInMonth()

        // Then
        XCTAssertEqual(days, 29)
    }

    func testDaysInMonth_HandlesNonLeapYear() {
        // Given
        let feb2025 = DateComponents(year: 2025, month: 2, day: 1)
        let normalDate = Calendar.current.date(from: feb2025)!

        // When
        let days = normalDate.daysInMonth()

        // Then
        XCTAssertEqual(days, 28)
    }

    func testIsSameDay_ReturnsTrueForSameDay() {
        // Given
        let morning = DateComponents(year: 2025, month: 1, day: 15, hour: 9)
        let evening = DateComponents(year: 2025, month: 1, day: 15, hour: 18)
        let date1 = Calendar.current.date(from: morning)!
        let date2 = Calendar.current.date(from: evening)!

        // When
        let result = date1.isSameDay(as: date2)

        // Then
        XCTAssertTrue(result)
    }

    func testIsSameDay_ReturnsFalseForDifferentDays() {
        // Given
        let day1 = DateComponents(year: 2025, month: 1, day: 15)
        let day2 = DateComponents(year: 2025, month: 1, day: 16)
        let date1 = Calendar.current.date(from: day1)!
        let date2 = Calendar.current.date(from: day2)!

        // When
        let result = date1.isSameDay(as: date2)

        // Then
        XCTAssertFalse(result)
    }
}
```

**Checklist**:
- [ ] Date extensions tested
- [ ] String extensions tested
- [ ] Color extensions tested
- [ ] All edge cases covered

---

## 🔌 Integration Tests (30% of effort)

### Backend Service Tests

**Purpose**: Test API endpoints with real database

#### 1. AI Service Tests
```typescript
// packages/services/ai/src/__tests__/integration/chat.test.ts

import request from 'supertest';
import { app } from '../../server';
import { createTestUser, cleanupTestData } from '../helpers/test-db';

describe('POST /api/chat/send', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Create test user and get auth token
    const user = await createTestUser();
    userId = user.id;
    authToken = user.token;
  });

  afterAll(async () => {
    await cleanupTestData(userId);
  });

  it('sends message and returns AI response', async () => {
    // Arrange
    const message = {
      content: 'Show me my emails',
      conversationId: null,
    };

    // Act
    const response = await request(app)
      .post('/api/chat/send')
      .set('Authorization', `Bearer ${authToken}`)
      .send(message)
      .expect(200);

    // Assert
    expect(response.body).toHaveProperty('content');
    expect(response.body).toHaveProperty('intents');
    expect(response.body.intents).toBeInstanceOf(Array);
  });

  it('detects email intent', async () => {
    const response = await request(app)
      .post('/api/chat/send')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: 'Show me emails from john@example.com' })
      .expect(200);

    expect(response.body.intents).toContainEqual(
      expect.objectContaining({
        category: 'email_triage',
      })
    );
  });

  it('returns 401 without auth token', async () => {
    await request(app)
      .post('/api/chat/send')
      .send({ content: 'Hello' })
      .expect(401);
  });

  it('handles GPT-5 tool calling', async () => {
    const response = await request(app)
      .post('/api/chat/send')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: 'Search my emails for "meeting"' })
      .expect(200);

    expect(response.body).toHaveProperty('executionLog');
    expect(response.body.executionLog).toContainEqual(
      expect.objectContaining({
        tool: 'search_emails',
        success: true,
      })
    );
  });
});
```

#### 2. Email Service Tests
```typescript
// packages/services/email/src/__tests__/integration/email.test.ts

describe('Email API', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const user = await createTestUser();
    userId = user.id;
    authToken = user.token;
  });

  describe('GET /api/emails', () => {
    it('returns user emails', async () => {
      const response = await request(app)
        .get('/api/emails')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('filters by sender', async () => {
      const response = await request(app)
        .get('/api/emails?from=john@example.com')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.every((email: any) =>
        email.sender.email === 'john@example.com'
      )).toBe(true);
    });
  });

  describe('POST /api/emails/send', () => {
    it('sends email successfully', async () => {
      const email = {
        to: 'test@example.com',
        subject: 'Test Email',
        body: 'This is a test',
      };

      const response = await request(app)
        .post('/api/emails/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send(email)
        .expect(200);

      expect(response.body).toHaveProperty('messageId');
    });

    it('validates required fields', async () => {
      const invalidEmail = {
        subject: 'Test',
        // Missing 'to' and 'body'
      };

      await request(app)
        .post('/api/emails/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidEmail)
        .expect(400);
    });
  });

  describe('POST /api/emails/:id/archive', () => {
    it('archives email', async () => {
      // Create test email first
      const email = await createTestEmail(userId);

      await request(app)
        .post(`/api/emails/${email.id}/archive`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify archived
      const archived = await getEmail(email.id);
      expect(archived.isArchived).toBe(true);
    });
  });
});
```

**Services to Test**:
```
1. AI Service (P0)
   - /api/chat/send
   - Intent detection
   - GPT-5 tool calling

2. Email Service (P0)
   - CRUD operations
   - Search
   - Send
   - Triage

3. Calendar Service (P1)
   - Event CRUD
   - Conflict detection
   - Find slots

4. Workflow Service (P1)
   - Task CRUD
   - Prioritization

5. Gateway (P0)
   - Routing
   - Auth middleware
   - Rate limiting
```

**Checklist**:
- [ ] 5 integration test suites
- [ ] All CRUD endpoints tested
- [ ] Auth middleware tested
- [ ] Error responses tested
- [ ] 50%+ endpoint coverage

---

## 🎭 End-to-End Tests (10% of effort)

### Critical User Flows

**Purpose**: Test complete user journeys

#### 1. Login → Browse Emails Flow
```swift
// TideAppUITests/EmailFlowTests.swift

class EmailFlowTests: XCTestCase {
    var app: XCUIApplication!

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app = XCUIApplication()
        app.launchArguments = ["UI-Testing"]
        app.launch()
    }

    func testLoginAndBrowseEmails() {
        // Login
        let loginButton = app.buttons["Sign in with Google"]
        XCTAssertTrue(loginButton.waitForExistence(timeout: 5))
        loginButton.tap()

        // Wait for OAuth (mock in UI tests)
        sleep(2)

        // Should see email tab
        let emailTab = app.tabBars.buttons["Email"]
        XCTAssertTrue(emailTab.waitForExistence(timeout: 5))
        emailTab.tap()

        // Should see inbox
        let firstEmail = app.tables.cells.element(boundBy: 0)
        XCTAssertTrue(firstEmail.waitForExistence(timeout: 5))

        // Tap email
        firstEmail.tap()

        // Should see detail
        XCTAssertTrue(app.navigationBars["Email"].exists)
        XCTAssertTrue(app.buttons["Reply"].exists)
    }

    func testComposeAndSendEmail() {
        // Login and navigate to email
        loginAndNavigateToEmail()

        // Tap compose
        let composeButton = app.navigationBars.buttons.element(matching: .button, identifier: "compose")
        composeButton.tap()

        // Fill form
        app.textFields["To:"].tap()
        app.textFields["To:"].typeText("test@example.com")

        app.textFields["Subject:"].tap()
        app.textFields["Subject:"].typeText("Test Subject")

        app.textViews.firstMatch.tap()
        app.textViews.firstMatch.typeText("Test body")

        // Send
        app.navigationBars.buttons["Send"].tap()

        // Should return to inbox
        XCTAssertTrue(app.tabBars.buttons["Email"].isSelected)
    }
}
```

**Critical Flows to Test** (Priority):
```
1. Login → Browse Inbox (P0)
2. Read Email → Reply (P0)
3. Compose → Send Email (P0)
4. Create Calendar Event (P1)
5. Create Task → Mark Complete (P1)
6. Chat → AI Response (P0)
7. Logout → Login (P1)
```

**Checklist**:
- [ ] 7 E2E test scenarios
- [ ] UI test mocks configured
- [ ] Tests run in CI
- [ ] All critical flows covered

---

## ⚡ Testing Infrastructure

### Test Helpers

```swift
// TideAppTests/Helpers/TestHelpers.swift

extension XCTestCase {
    func wait(for duration: TimeInterval) async {
        try? await Task.sleep(nanoseconds: UInt64(duration * 1_000_000_000))
    }

    func waitForCondition(
        timeout: TimeInterval = 5,
        condition: @escaping () -> Bool
    ) async throws {
        let deadline = Date().addingTimeInterval(timeout)

        while !condition() {
            if Date() > deadline {
                XCTFail("Condition not met within \(timeout)s")
                return
            }
            await wait(for: 0.1)
        }
    }
}

// Test data builders
struct TestData {
    static func email(
        id: String = UUID().uuidString,
        subject: String = "Test Email",
        from: String = "test@example.com"
    ) -> Email {
        Email(
            id: id,
            subject: subject,
            sender: EmailSender(email: from, name: "Test User"),
            recipients: [],
            body: "Test body",
            receivedAt: Date(),
            isRead: false,
            isStarred: false
        )
    }

    static func calendarEvent(
        id: String = UUID().uuidString,
        title: String = "Test Event",
        startDate: Date = Date()
    ) -> CalendarEvent {
        CalendarEvent(
            id: id,
            title: title,
            startTime: startDate,
            endTime: startDate.addingTimeInterval(3600),
            description: nil,
            location: nil,
            attendees: []
        )
    }
}
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml

name: Tests

on:
  pull_request:
  push:
    branches: [main]

jobs:
  ios-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: |
          cd apps/mobile-ios
          pod install

      - name: Run unit tests
        run: |
          xcodebuild test \
            -workspace TideApp.xcworkspace \
            -scheme TideApp \
            -destination 'platform=iOS Simulator,name=iPhone 15 Pro' \
            -enableCodeCoverage YES

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 📊 Success Metrics

### Coverage Targets
- [ ] 60%+ overall code coverage
- [ ] 70%+ ViewModel coverage
- [ ] 70%+ Service coverage
- [ ] 50%+ backend endpoint coverage
- [ ] 100% critical flow coverage

### Quality Metrics
- [ ] All tests pass
- [ ] < 5 minute test suite runtime
- [ ] Zero flaky tests
- [ ] CI runs on every PR

### Confidence Metrics
- [ ] Can refactor with confidence
- [ ] Can catch regressions
- [ ] Can ship with confidence

---

## 📅 Week 9 Schedule

### Day 1-2: iOS Unit Tests
- ViewModel tests (8 files)
- Service tests (5 files)
- Mock implementations

### Day 3: iOS Integration & Utils
- Extension tests
- Utility tests
- Repository tests

### Day 4: Backend Integration Tests
- API endpoint tests (5 services)
- Auth middleware tests
- Error response tests

### Day 5: E2E & CI Setup
- 7 critical flow tests
- CI/CD pipeline
- Coverage reporting

---

**Testing is not optional. It's what gives us confidence to ship.** 🧪
