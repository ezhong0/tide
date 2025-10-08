# 🏗️ Architecture Improvements & Technical Debt Cleanup

**Timeline**: Weeks 1-2 (2 weeks)
**Priority**: 🔴 P0 - Foundation for Everything Else
**Impact**: Enables testing, removes crash risks, clean codebase

---

## 🎯 Goals

1. **Zero Crashes**: Remove all force unwraps and fatalError calls
2. **Testable Code**: Implement proper dependency injection
3. **Clean Code**: Remove duplication, use proper patterns
4. **Production Ready**: Security, error handling, logging

---

## 📋 Week 1: Critical Safety & DI

### Day 1-2: Eliminate Crash Points

#### 1. Remove All Force Unwraps (47 instances)

**Location**: Calendar date operations

**Problem**:
```swift
// ❌ CRASHES if calendar.date() returns nil
let nextMonth = calendar.date(byAdding: .month, value: 1, to: date)!
```

**Solution**: Create safe date utilities
```swift
// apps/mobile-ios/TideApp/Core/Extensions/Date+Tide.swift

import Foundation

extension Date {
    /// Safely add a date component
    func safeAdd(_ component: Calendar.Component, value: Int) -> Date {
        return Calendar.current.date(
            byAdding: component,
            value: value,
            to: self
        ) ?? self // Fallback to current date
    }

    /// Safely set time components
    func safeSet(hour: Int, minute: Int, second: Int = 0) -> Date {
        var components = Calendar.current.dateComponents([.year, .month, .day], from: self)
        components.hour = hour
        components.minute = minute
        components.second = second

        return Calendar.current.date(from: components) ?? self
    }

    /// Get start of month safely
    func startOfMonth() -> Date {
        let components = Calendar.current.dateComponents([.year, .month], from: self)
        return Calendar.current.date(from: components) ?? self
    }

    /// Get days in month safely
    func daysInMonth() -> Int {
        return Calendar.current.range(of: .day, in: .month, for: self)?.count ?? 30
    }
}
```

**Files to Update**:
```
1. CalendarGridView.swift (15 force unwraps)
   - Lines 362-509: Date calculations in month grid
   - Replace with safeAdd(), startOfMonth(), daysInMonth()

2. CalendarView.swift (3 force unwraps)
   - Lines 82-94: Week calculations
   - Replace with safe date methods

3. EmailInboxView.swift (2 force unwraps)
   - Lines 489-496: Date filtering
   - Use safeAdd() for date ranges

4. GoogleOAuthService.swift (URL construction)
   - Line 42-60: URL building
   - Use guard let for URL validation

5. OAuthService.swift (URL callbacks)
   - Lines 35-125: OAuth URL handling
   - Validate all URLs before use
```

**Testing**:
```swift
// TideAppTests/Extensions/DateExtensionsTests.swift

class DateExtensionsTests: XCTestCase {
    func testSafeAddDoesNotCrash() {
        let date = Date()
        let nextMonth = date.safeAdd(.month, value: 1)
        XCTAssertNotNil(nextMonth)
    }

    func testDaysInMonthHandlesEdgeCases() {
        // February
        let feb = DateComponents(year: 2024, month: 2)
        let febDate = Calendar.current.date(from: feb)!
        XCTAssertEqual(febDate.daysInMonth(), 29) // Leap year

        // February non-leap
        let feb2025 = DateComponents(year: 2025, month: 2)
        let feb2025Date = Calendar.current.date(from: feb2025)!
        XCTAssertEqual(feb2025Date.daysInMonth(), 28)
    }
}
```

**Checklist**:
- [ ] Create Date+Tide.swift extension
- [ ] Replace all 47 force unwraps
- [ ] Add unit tests for edge cases (leap years, DST, etc.)
- [ ] Verify no crashes in calendar navigation

---

#### 2. Remove fatalError Calls (3 instances)

**Location**: Configuration initialization

**Problem**:
```swift
// SupabaseManager.swift:22
guard let url = URL(string: supabaseUrl) else {
    fatalError("Invalid Supabase URL")  // ❌ CRASHES APP
}
```

**Solution**: Graceful error handling
```swift
// Create configuration error types
enum ConfigurationError: LocalizedError {
    case invalidSupabaseURL
    case invalidSupabaseKey
    case missingGoogleClientID

    var errorDescription: String? {
        switch self {
        case .invalidSupabaseURL:
            return "Supabase URL is not configured correctly. Please contact support."
        case .invalidSupabaseKey:
            return "Supabase API key is missing. Please reinstall the app."
        case .missingGoogleClientID:
            return "Google OAuth is not configured. Please contact support."
        }
    }
}

// TideApp/Services/SupabaseManager.swift
class SupabaseManager {
    private let client: SupabaseClient

    init() throws {
        guard let url = URL(string: Config.supabaseURL) else {
            throw ConfigurationError.invalidSupabaseURL
        }

        guard !Config.supabaseAnonKey.isEmpty else {
            throw ConfigurationError.invalidSupabaseKey
        }

        self.client = SupabaseClient(supabaseURL: url, supabaseKey: Config.supabaseAnonKey)
    }
}

// TideApp.swift - Handle errors gracefully
@main
struct TideApp: App {
    @StateObject private var container: DependencyContainer

    init() {
        do {
            _container = StateObject(wrappedValue: try DependencyContainer())
        } catch {
            // Show error screen instead of crashing
            _container = StateObject(wrappedValue: DependencyContainer.placeholder)
            Logger.shared.error("Configuration error: \(error)")
        }
    }

    var body: some Scene {
        WindowGroup {
            if container.isValid {
                RootView()
                    .environmentObject(container)
            } else {
                ConfigurationErrorView(error: container.error)
            }
        }
    }
}

// ConfigurationErrorView.swift
struct ConfigurationErrorView: View {
    let error: Error?

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 60))
                .foregroundColor(.orange)

            Text("Configuration Error")
                .font(.title)
                .fontWeight(.bold)

            Text(error?.localizedDescription ?? "An unknown error occurred")
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
                .padding(.horizontal)

            Button("Contact Support") {
                if let url = URL(string: "mailto:support@tide.app?subject=Configuration%20Error") {
                    UIApplication.shared.open(url)
                }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}
```

**Files to Update**:
```
1. SupabaseManager.swift:19-48
   - Replace fatalError with throw ConfigurationError
   - Add try? initialization with fallback

2. AuthManager.swift:23-51
   - Replace fatalError with proper error handling
   - Return nil or throw instead of crash

3. DataManager.swift:15-38
   - Log error and continue with degraded functionality
   - Don't block app from launching
```

**Checklist**:
- [ ] Create ConfigurationError enum
- [ ] Create ConfigurationErrorView
- [ ] Update all 3 fatalError instances
- [ ] Add placeholder/fallback for DependencyContainer
- [ ] Test with invalid configuration

---

### Day 3-4: Dependency Injection

#### 1. Remove Singleton Dependencies

**Current Problem**:
```swift
// ❌ 35 files use .shared pattern
class ChatViewModel {
    private let apiClient = APIClient.shared
    private let authManager = AuthManager.shared
}
```
**Impact**: Cannot test without mocking global state

**Solution**: Protocol-based dependency injection

**Step 1**: Define protocols
```swift
// TideApp/Core/Protocols/APIClientProtocol.swift
protocol APIClientProtocol {
    func get<T: Decodable>(_ path: String) async throws -> T
    func post<T: Decodable, U: Encodable>(_ path: String, body: U) async throws -> T
    func put<T: Decodable, U: Encodable>(_ path: String, body: U) async throws -> T
    func delete(_ path: String) async throws
}

// TideApp/Core/Protocols/AuthManagerProtocol.swift
protocol AuthManagerProtocol {
    var isAuthenticated: Bool { get }
    var currentUser: User? { get }
    func login(email: String, password: String) async throws -> AuthResult
    func logout() async throws
    func refreshToken() async throws
}

// TideApp/Core/Protocols/SupabaseManagerProtocol.swift
protocol SupabaseManagerProtocol {
    func query<T: Decodable>(table: String, userId: String) async throws -> [T]
    func insert<T: Encodable>(table: String, data: T) async throws
    func update<T: Encodable>(table: String, id: String, data: T) async throws
    func delete(table: String, id: String) async throws
}
```

**Step 2**: Update implementations
```swift
// TideApp/Services/APIClient.swift
class APIClient: APIClientProtocol {
    internal static let shared = APIClient()  // For DI container only

    private let baseURL: URL
    private let authManager: AuthManagerProtocol

    // Public initializer for DI
    init(baseURL: URL, authManager: AuthManagerProtocol) {
        self.baseURL = baseURL
        self.authManager = authManager
    }

    // Private for singleton
    private init() {
        self.baseURL = URL(string: Config.apiBaseURL)!
        self.authManager = AuthManager.shared
    }

    // ... existing methods
}
```

**Step 3**: Update DependencyContainer
```swift
// TideApp/Core/DI/DependencyContainer.swift
@MainActor
class DependencyContainer: ObservableObject {
    // Services
    lazy var authManager: AuthManagerProtocol = self.makeAuthManager()
    lazy var apiClient: APIClientProtocol = self.makeAPIClient()
    lazy var supabaseManager: SupabaseManagerProtocol = self.makeSupabaseManager()

    // Repositories
    lazy var emailRepository: EmailRepository = self.makeEmailRepository()
    lazy var calendarRepository: CalendarRepository = self.makeCalendarRepository()
    lazy var taskRepository: TaskRepository = self.makeTaskRepository()
    lazy var chatRepository: ChatRepository = self.makeChatRepository()

    // ViewModels Factory Methods
    func makeChatViewModel() -> ChatViewModel {
        ChatViewModel(
            apiClient: apiClient,
            authManager: authManager,
            chatRepository: chatRepository
        )
    }

    func makeEmailInboxViewModel() -> EmailInboxViewModel {
        EmailInboxViewModel(
            repository: emailRepository,
            apiClient: apiClient
        )
    }

    func makeCalendarViewModel() -> CalendarViewModel {
        CalendarViewModel(
            repository: calendarRepository,
            apiClient: apiClient
        )
    }

    // ... more factory methods

    // MARK: - Private Factories

    private func makeAuthManager() -> AuthManagerProtocol {
        do {
            return try AuthManager(
                supabaseURL: Config.supabaseURL,
                supabaseKey: Config.supabaseAnonKey
            )
        } catch {
            Logger.shared.error("Failed to create AuthManager: \(error)")
            return MockAuthManager() // Fallback
        }
    }

    private func makeAPIClient() -> APIClientProtocol {
        guard let baseURL = URL(string: Config.apiBaseURL) else {
            return MockAPIClient()
        }
        return APIClient(baseURL: baseURL, authManager: authManager)
    }

    private func makeSupabaseManager() -> SupabaseManagerProtocol {
        do {
            return try SupabaseManager()
        } catch {
            return MockSupabaseManager()
        }
    }

    private func makeEmailRepository() -> EmailRepository {
        NetworkEmailRepository(apiClient: apiClient, cache: CacheManager.shared)
    }

    private func makeCalendarRepository() -> CalendarRepository {
        NetworkCalendarRepository(apiClient: apiClient, cache: CacheManager.shared)
    }

    private func makeTaskRepository() -> TaskRepository {
        NetworkTaskRepository(apiClient: apiClient, cache: CacheManager.shared)
    }

    private func makeChatRepository() -> ChatRepository {
        NetworkChatRepository(apiClient: apiClient, cache: CacheManager.shared)
    }
}

// MARK: - Mock Implementations for Fallback

class MockAuthManager: AuthManagerProtocol {
    var isAuthenticated: Bool { false }
    var currentUser: User? { nil }

    func login(email: String, password: String) async throws -> AuthResult {
        throw ConfigurationError.invalidSupabaseURL
    }

    func logout() async throws {}
    func refreshToken() async throws {}
}

class MockAPIClient: APIClientProtocol {
    func get<T: Decodable>(_ path: String) async throws -> T {
        throw APIError.notConfigured
    }

    func post<T: Decodable, U: Encodable>(_ path: String, body: U) async throws -> T {
        throw APIError.notConfigured
    }

    func put<T: Decodable, U: Encodable>(_ path: String, body: U) async throws -> T {
        throw APIError.notConfigured
    }

    func delete(_ path: String) async throws {
        throw APIError.notConfigured
    }
}
```

**Step 4**: Update Views
```swift
// BEFORE
struct ChatView: View {
    @StateObject private var viewModel = ChatViewModel()

    var body: some View { ... }
}

// AFTER
struct ChatView: View {
    @EnvironmentObject var container: DependencyContainer
    @StateObject private var viewModel: ChatViewModel

    init(container: DependencyContainer) {
        _viewModel = StateObject(wrappedValue: container.makeChatViewModel())
    }

    var body: some View { ... }
}

// OR use @EnvironmentObject directly
struct ChatView: View {
    @EnvironmentObject var container: DependencyContainer
    @StateObject private var viewModel: ChatViewModel

    var body: some View {
        // Access viewModel
    }

    private func makeViewModel() -> ChatViewModel {
        container.makeChatViewModel()
    }
}
```

**Step 5**: Update TideApp entry point
```swift
// TideApp.swift
@main
struct TideApp: App {
    @StateObject private var container = DependencyContainer()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(container)
        }
    }
}
```

**Files to Update** (35 total):
```
Views using .shared:
1. ChatView.swift
2. EmailInboxView.swift
3. EmailDetailView.swift
4. EmailComposeView.swift
5. CalendarGridView.swift
6. CalendarView.swift
7. EventDetailView.swift
8. EventEditView.swift
9. TaskListView.swift
10. TaskDetailView.swift
11. TaskEditView.swift
12. SettingsView.swift
13. DailySnapshotView.swift
14. ActionsView.swift
15. DecisionsView.swift
... (20 more)

ViewModels using .shared:
1. ChatViewModel.swift
2. EmailInboxViewModel.swift
3. CalendarViewModel.swift
4. TaskListViewModel.swift
... (11 more)
```

**Testing Benefits**:
```swift
// NOW WE CAN TEST!
class ChatViewModelTests: XCTestCase {
    func testSendMessage() async throws {
        // Inject mock dependencies
        let mockAPI = MockAPIClient()
        let mockAuth = MockAuthManager()
        let mockRepo = MockChatRepository()

        let viewModel = ChatViewModel(
            apiClient: mockAPI,
            authManager: mockAuth,
            chatRepository: mockRepo
        )

        await viewModel.sendMessage("test")

        XCTAssertEqual(mockAPI.postCallCount, 1)
        XCTAssertEqual(viewModel.messages.count, 1)
    }
}
```

**Checklist**:
- [ ] Create protocol files for all services
- [ ] Update all 35 files to use DI
- [ ] Make .shared internal-only
- [ ] Update DependencyContainer with factories
- [ ] Create mock implementations for testing
- [ ] Update TideApp.swift entry point
- [ ] Verify app still works
- [ ] Write first unit tests to prove it works

---

## 📋 Week 2: Code Quality & Production Readiness

### Day 1: Remove Code Duplication

#### 1. Consolidate AnyCodable (500+ duplicate lines)

**Problem**: 4 different files have identical AnyCodable implementation

**Solution**: Keep one, import everywhere
```swift
// Keep: TideApp/Models/AnyCodable.swift ✅

// Delete from these files:
// 1. TideApp/Models/ChatMessage.swift
// 2. TideApp/Models/Decision.swift
// 3. TideApp/Models/DailySnapshot.swift

// Update imports:
import Foundation

// Add this line to each file that needs it:
// (AnyCodable is now in separate file)

// Example:
struct ChatMessage: Codable, Identifiable {
    // Use AnyCodable from Models/AnyCodable.swift
    var metadata: [String: AnyCodable]?
}
```

**Checklist**:
- [ ] Verify AnyCodable.swift has all needed functionality
- [ ] Delete duplicate implementations
- [ ] Update imports in affected files
- [ ] Verify build succeeds
- [ ] Run tests

---

#### 2. Consolidate Date Extensions

**Problem**: Date utility functions duplicated across 3 files

**Solution**: Single source in Date+Tide.swift
```swift
// TideApp/Core/Extensions/Date+Tide.swift

import Foundation

extension Date {
    // All date utilities in one place

    // Formatting
    func formatted(_ format: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = format
        return formatter.string(from: self)
    }

    // Relative time
    func timeAgo() -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: self, relativeTo: Date())
    }

    // Calendar operations (from Week 1)
    func safeAdd(_ component: Calendar.Component, value: Int) -> Date { ... }
    func startOfDay() -> Date { ... }
    func startOfMonth() -> Date { ... }
    func daysInMonth() -> Int { ... }

    // Comparison
    func isSameDay(as other: Date) -> Bool {
        Calendar.current.isDate(self, inSameDayAs: other)
    }

    func isSameMonth(as other: Date) -> Bool {
        let comp1 = Calendar.current.dateComponents([.year, .month], from: self)
        let comp2 = Calendar.current.dateComponents([.year, .month], from: other)
        return comp1.year == comp2.year && comp1.month == comp2.month
    }
}
```

**Delete from**:
- DailySnapshotView.swift (inline extensions)
- ActionsView.swift (inline extensions)
- CalendarGridView.swift (inline helpers)

**Checklist**:
- [ ] Move all date utilities to Date+Tide.swift
- [ ] Delete inline duplicates
- [ ] Verify all date operations still work
- [ ] Add unit tests for edge cases

---

### Day 2: Standardize API Calls

#### 1. Use Endpoint Enum Everywhere

**Problem**: 70+ hardcoded API endpoint strings

**Current**:
```swift
// ❌ Scattered everywhere
let emails = try await apiClient.get("/api/emails")
let tasks = try await apiClient.post("/api/tasks", body: task)
```

**Solution**: Centralized endpoint enum
```swift
// TideApp/Networking/Endpoint.swift (already exists, needs expansion)

enum Endpoint {
    // Email
    case emails
    case email(id: String)
    case emailSend
    case emailSearch
    case emailArchive(id: String)

    // Calendar
    case calendarEvents
    case calendarEvent(id: String)
    case calendarFindSlots

    // Tasks
    case tasks
    case task(id: String)
    case taskPrioritize

    // Chat
    case chatConversations
    case chatConversation(id: String)
    case chatSend

    var path: String {
        switch self {
        case .emails:
            return "/api/emails"
        case .email(let id):
            return "/api/emails/\(id)"
        case .emailSend:
            return "/api/emails/send"
        case .emailSearch:
            return "/api/emails/search"
        case .emailArchive(let id):
            return "/api/emails/\(id)/archive"

        case .calendarEvents:
            return "/api/calendar/events"
        case .calendarEvent(let id):
            return "/api/calendar/events/\(id)"
        case .calendarFindSlots:
            return "/api/calendar/find-slots"

        case .tasks:
            return "/api/tasks"
        case .task(let id):
            return "/api/tasks/\(id)"
        case .taskPrioritize:
            return "/api/tasks/prioritize"

        case .chatConversations:
            return "/api/chat/conversations"
        case .chatConversation(let id):
            return "/api/chat/conversations/\(id)"
        case .chatSend:
            return "/api/chat/send"
        }
    }

    var method: HTTPMethod {
        switch self {
        case .emails, .email, .calendarEvents, .calendarEvent, .tasks, .task, .chatConversations, .chatConversation:
            return .get
        case .emailSend, .emailSearch, .calendarFindSlots, .taskPrioritize, .chatSend:
            return .post
        case .emailArchive:
            return .post
        }
    }
}

enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case delete = "DELETE"
    case patch = "PATCH"
}
```

**Update APIClient**:
```swift
extension APIClient {
    func request<T: Decodable>(_ endpoint: Endpoint) async throws -> T {
        return try await self.request(
            path: endpoint.path,
            method: endpoint.method.rawValue
        )
    }

    func request<T: Decodable, U: Encodable>(
        _ endpoint: Endpoint,
        body: U
    ) async throws -> T {
        return try await self.request(
            path: endpoint.path,
            method: endpoint.method.rawValue,
            body: body
        )
    }
}
```

**Usage**:
```swift
// ✅ Clean and type-safe
let emails: [Email] = try await apiClient.request(.emails)
let email: Email = try await apiClient.request(.email(id: emailId))
try await apiClient.request(.emailArchive(id: emailId))
```

**Checklist**:
- [ ] Expand Endpoint enum with all API routes
- [ ] Add method property to Endpoint
- [ ] Update APIClient with endpoint-based methods
- [ ] Replace all 70+ hardcoded strings
- [ ] Verify all API calls work

---

### Day 3-4: Backend Security

#### 1. JWT Authentication Middleware

**Problem**: Services don't validate tokens

**Solution**: Add auth middleware to all services
```typescript
// packages/services/shared/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { createLogger } from '@tide/logger';

const logger = createLogger({ component: 'AuthMiddleware' });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AuthenticatedRequest extends Request {
  userId: string;
  userEmail?: string;
}

export async function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authorization header' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    // Verify JWT with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn('Invalid token', { error });
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Attach user to request
    (req as AuthenticatedRequest).userId = user.id;
    (req as AuthenticatedRequest).userEmail = user.email;

    logger.debug('Authenticated request', { userId: user.id });
    next();
  } catch (error) {
    logger.error('JWT verification failed', { error });
    res.status(401).json({ error: 'Authentication failed' });
  }
}

// Optional: Rate limiting per user
import rateLimit from 'express-rate-limit';

export const userRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per user
  keyGenerator: (req: Request) => {
    return (req as AuthenticatedRequest).userId || req.ip;
  },
  message: 'Too many requests from this user, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
```

**Apply to all services**:
```typescript
// packages/services/*/src/index.ts

import express from 'express';
import { authenticateJWT, userRateLimiter } from '@tide/shared/middleware/auth';

const app = express();

// Public routes (health check, etc.)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Apply auth to all API routes
app.use('/api/*', authenticateJWT, userRateLimiter);

// Now all routes have req.userId
app.get('/api/emails', async (req: AuthenticatedRequest, res) => {
  const emails = await emailService.getEmails(req.userId);
  res.json(emails);
});
```

**Checklist**:
- [ ] Create auth.ts middleware
- [ ] Add to all 9 services
- [ ] Update route handlers to use req.userId
- [ ] Test with valid/invalid tokens
- [ ] Add rate limiting
- [ ] Update API integration tests

---

### Day 5: Error Handling & Logging

#### 1. Standardized Error Responses

**Backend**:
```typescript
// packages/services/shared/errors/api-error.ts

export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }

  static badRequest(message: string, details?: any) {
    return new APIError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new APIError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message: string = 'Forbidden') {
    return new APIError(403, 'FORBIDDEN', message);
  }

  static notFound(message: string = 'Not found') {
    return new APIError(404, 'NOT_FOUND', message);
  }

  static internal(message: string = 'Internal server error') {
    return new APIError(500, 'INTERNAL_ERROR', message);
  }
}

// Error handler middleware
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof APIError) {
    logger.warn('API error', {
      code: err.code,
      message: err.message,
      statusCode: err.statusCode
    });

    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    });
  } else {
    logger.error('Unhandled error', { error: err });

    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    });
  }
}
```

**iOS**:
```swift
// TideApp/Networking/APIError.swift

enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case unauthorized
    case forbidden
    case notFound
    case serverError(message: String)
    case networkError(Error)
    case decodingError(Error)
    case unknown

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid request URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .unauthorized:
            return "Please log in again"
        case .forbidden:
            return "You don't have permission to do this"
        case .notFound:
            return "The requested resource was not found"
        case .serverError(let message):
            return message
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .decodingError:
            return "Failed to parse server response"
        case .unknown:
            return "An unknown error occurred"
        }
    }

    var recoverySuggestion: String? {
        switch self {
        case .unauthorized:
            return "Try logging out and logging back in"
        case .networkError:
            return "Check your internet connection and try again"
        case .serverError:
            return "Please try again later or contact support"
        default:
            return nil
        }
    }
}
```

**Checklist**:
- [ ] Create APIError classes (backend + iOS)
- [ ] Add error handler middleware to all services
- [ ] Update APIClient to map HTTP codes to errors
- [ ] Add user-friendly error messages
- [ ] Test error scenarios

---

## 📊 Success Metrics

### Code Quality
- [ ] Zero force unwraps in production code
- [ ] Zero fatalError calls
- [ ] Zero .shared singleton usage in Views
- [ ] < 1% code duplication
- [ ] All API endpoints use Endpoint enum

### Testing
- [ ] Can write unit tests (DI enables this)
- [ ] First 10 unit tests written and passing
- [ ] Mock implementations available

### Security
- [ ] All services have JWT authentication
- [ ] All routes validate userId
- [ ] Rate limiting active
- [ ] Error responses don't leak sensitive data

---

## 📅 Detailed Timeline

### Week 1
- **Day 1**: Force unwrap fixes
- **Day 2**: fatalError removal, error handling
- **Day 3**: Protocol definitions, DI container
- **Day 4**: Update 35 files to use DI
- **Day 5**: Testing, bug fixes

### Week 2
- **Day 1**: Remove code duplication
- **Day 2**: Standardize API calls
- **Day 3**: Backend JWT authentication
- **Day 4**: Error handling improvements
- **Day 5**: Testing, documentation

---

This cleanup enables everything else: GPT-5 integration, testing, and production deployment. **It's the foundation that makes the rest possible.** 🏗️
