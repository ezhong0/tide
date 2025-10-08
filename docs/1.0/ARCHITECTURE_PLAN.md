# Tide Architecture Cleanup Plan

**Timeline**: Weeks 1-4 (Phase 1)
**Goal**: Elegant, testable, crash-free foundation
**Philosophy**: Do it right, or don't do it at all

---

## Executive Summary

This document outlines the systematic approach to eliminating technical debt in the Tide iOS codebase. We prioritize **safety**, **testability**, and **elegance** over speed.

### Core Principles

1. **Zero Tolerance for Crashes**: No force unwraps, no fatalError
2. **Dependency Injection**: Protocol-based, testable architecture
3. **Clean Code**: SwiftLint compliant, readable, maintainable
4. **Comprehensive Testing**: Write tests as we build

---

## Week 1: Eliminate Crash Risks

### Day 1-2: Safe Date Utilities

#### Problem

**47 force unwraps** in date calculations, primarily in:
- `CalendarGridView.swift` (lines 362-509)
- `CalendarView.swift` (lines 82-94)
- `EmailInboxView.swift` (lines 489-496)

**Risk**: App crashes on:
- Daylight Saving Time transitions
- Leap years
- Invalid date inputs
- Calendar edge cases

#### Solution: Date+Tide Extensions

**File**: `TideApp/Core/Extensions/Date+Tide.swift`

```swift
import Foundation

extension Date {
    // MARK: - Safe Date Arithmetic

    /// Safely add a date component, returning original date if operation fails
    func safeAdd(_ component: Calendar.Component, value: Int, calendar: Calendar = .current) -> Date {
        return calendar.date(byAdding: component, value: value, to: self) ?? self
    }

    /// Safely subtract a date component
    func safeSubtract(_ component: Calendar.Component, value: Int, calendar: Calendar = .current) -> Date {
        return safeAdd(component, value: -value, calendar: calendar)
    }

    /// Safely set time components
    func safeSet(hour: Int? = nil, minute: Int? = nil, second: Int? = nil, calendar: Calendar = .current) -> Date {
        var components = calendar.dateComponents([.year, .month, .day, .hour, .minute, .second], from: self)

        if let hour = hour { components.hour = hour }
        if let minute = minute { components.minute = minute }
        if let second = second { components.second = second }

        return calendar.date(from: components) ?? self
    }

    // MARK: - Calendar Helpers

    /// Get start of day safely
    func startOfDay(calendar: Calendar = .current) -> Date {
        return calendar.startOfDay(for: self)
    }

    /// Get start of month safely
    func startOfMonth(calendar: Calendar = .current) -> Date {
        let components = calendar.dateComponents([.year, .month], from: self)
        return calendar.date(from: components) ?? self
    }

    /// Get end of month safely
    func endOfMonth(calendar: Calendar = .current) -> Date {
        let nextMonth = safeAdd(.month, value: 1, calendar: calendar).startOfMonth(calendar: calendar)
        return nextMonth.safeSubtract(.day, value: 1, calendar: calendar)
    }

    /// Get number of days in current month
    func daysInMonth(calendar: Calendar = .current) -> Int {
        return calendar.range(of: .day, in: .month, for: self)?.count ?? 30
    }

    /// Get start of week safely
    func startOfWeek(calendar: Calendar = .current) -> Date {
        let components = calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: self)
        return calendar.date(from: components) ?? self
    }

    // MARK: - Comparisons

    /// Check if date is in the same day as another date
    func isSameDay(as date: Date, calendar: Calendar = .current) -> Bool {
        return calendar.isDate(self, inSameDayAs: date)
    }

    /// Check if date is in the same month as another date
    func isSameMonth(as date: Date, calendar: Calendar = .current) -> Bool {
        let components1 = calendar.dateComponents([.year, .month], from: self)
        let components2 = calendar.dateComponents([.year, .month], from: date)
        return components1.year == components2.year && components1.month == components2.month
    }

    /// Check if date is today
    func isToday(calendar: Calendar = .current) -> Bool {
        return calendar.isDateInToday(self)
    }

    /// Check if date is in the past
    func isPast() -> Bool {
        return self < Date()
    }

    /// Check if date is in the future
    func isFuture() -> Bool {
        return self > Date()
    }

    // MARK: - Formatting Helpers

    /// Get relative date string (e.g., "Today", "Tomorrow", "2 days ago")
    func relativeString() -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .full
        return formatter.localizedString(for: self, relativeTo: Date())
    }

    /// Get short relative string (e.g., "2d ago")
    func shortRelativeString() -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .short
        return formatter.localizedString(for: self, relativeTo: Date())
    }
}

// MARK: - Calendar Day Model

struct CalendarDay {
    let date: Date
    let isToday: Bool
    let isCurrentMonth: Bool
    let isSelected: Bool

    init(date: Date, currentMonth: Date, selectedDate: Date?) {
        self.date = date
        self.isToday = date.isToday()
        self.isCurrentMonth = date.isSameMonth(as: currentMonth)
        self.isSelected = selectedDate.map { date.isSameDay(as: $0) } ?? false
    }
}

// MARK: - Calendar Helpers

extension Calendar {
    /// Safely generate days for a month grid (including padding from prev/next months)
    func generateMonthDays(for date: Date, selectedDate: Date? = nil) -> [CalendarDay] {
        let startOfMonth = date.startOfMonth(calendar: self)
        let endOfMonth = date.endOfMonth(calendar: self)

        // Find the first day to display (could be from previous month)
        let firstWeekday = component(.weekday, from: startOfMonth)
        let daysFromPrevMonth = firstWeekday - firstDayOfWeek
        let firstDisplayDate = startOfMonth.safeSubtract(.day, value: daysFromPrevMonth, calendar: self)

        // Generate 42 days (6 weeks) for consistent grid
        var days: [CalendarDay] = []
        var currentDate = firstDisplayDate

        for _ in 0..<42 {
            days.append(CalendarDay(date: currentDate, currentMonth: date, selectedDate: selectedDate))
            currentDate = currentDate.safeAdd(.day, value: 1, calendar: self)
        }

        return days
    }

    /// Safely generate week days
    func generateWeekDays(for date: Date) -> [CalendarDay] {
        let startOfWeek = date.startOfWeek(calendar: self)
        var days: [CalendarDay] = []
        var currentDate = startOfWeek

        for _ in 0..<7 {
            days.append(CalendarDay(date: currentDate, currentMonth: date, selectedDate: nil))
            currentDate = currentDate.safeAdd(.day, value: 1, calendar: self)
        }

        return days
    }

    var firstDayOfWeek: Int {
        return self.firstWeekday
    }
}
```

#### Tests

**File**: `TideAppTests/Extensions/DateExtensionsTests.swift`

```swift
import XCTest
@testable import TideApp

class DateExtensionsTests: XCTestCase {
    let calendar = Calendar.current

    // MARK: - Safe Arithmetic Tests

    func testSafeAddDoesNotCrash() {
        let date = Date()
        let nextMonth = date.safeAdd(.month, value: 1)
        XCTAssertNotNil(nextMonth)
        XCTAssertNotEqual(date, nextMonth)
    }

    func testSafeSubtractWorks() {
        let date = Date()
        let yesterday = date.safeSubtract(.day, value: 1)
        XCTAssertLessThan(yesterday, date)
    }

    func testSafeSetTimeWorks() {
        let date = Date()
        let noon = date.safeSet(hour: 12, minute: 0, second: 0)
        let components = calendar.dateComponents([.hour, .minute], from: noon)
        XCTAssertEqual(components.hour, 12)
        XCTAssertEqual(components.minute, 0)
    }

    // MARK: - Calendar Helper Tests

    func testStartOfMonth() {
        let date = DateComponents(year: 2025, month: 10, day: 15)
        let testDate = calendar.date(from: date)!
        let start = testDate.startOfMonth()

        let components = calendar.dateComponents([.day], from: start)
        XCTAssertEqual(components.day, 1)
    }

    func testEndOfMonth() {
        let date = DateComponents(year: 2025, month: 10, day: 15)
        let testDate = calendar.date(from: date)!
        let end = testDate.endOfMonth()

        let components = calendar.dateComponents([.day], from: end)
        XCTAssertEqual(components.day, 31) // October has 31 days
    }

    func testDaysInMonthFebruary() {
        // Leap year
        let feb2024 = DateComponents(year: 2024, month: 2, day: 1)
        let date2024 = calendar.date(from: feb2024)!
        XCTAssertEqual(date2024.daysInMonth(), 29)

        // Non-leap year
        let feb2025 = DateComponents(year: 2025, month: 2, day: 1)
        let date2025 = calendar.date(from: feb2025)!
        XCTAssertEqual(date2025.daysInMonth(), 28)
    }

    func testDaysInMonthOctober() {
        let oct2025 = DateComponents(year: 2025, month: 10, day: 1)
        let date = calendar.date(from: oct2025)!
        XCTAssertEqual(date.daysInMonth(), 31)
    }

    // MARK: - Comparison Tests

    func testIsSameDay() {
        let date1 = DateComponents(year: 2025, month: 10, day: 8, hour: 10)
        let date2 = DateComponents(year: 2025, month: 10, day: 8, hour: 15)

        let d1 = calendar.date(from: date1)!
        let d2 = calendar.date(from: date2)!

        XCTAssertTrue(d1.isSameDay(as: d2))
    }

    func testIsSameMonth() {
        let date1 = DateComponents(year: 2025, month: 10, day: 1)
        let date2 = DateComponents(year: 2025, month: 10, day: 31)

        let d1 = calendar.date(from: date1)!
        let d2 = calendar.date(from: date2)!

        XCTAssertTrue(d1.isSameMonth(as: d2))
    }

    func testIsNotSameMonth() {
        let date1 = DateComponents(year: 2025, month: 10, day: 31)
        let date2 = DateComponents(year: 2025, month: 11, day: 1)

        let d1 = calendar.date(from: date1)!
        let d2 = calendar.date(from: date2)!

        XCTAssertFalse(d1.isSameMonth(as: d2))
    }

    // MARK: - Calendar Day Generation Tests

    func testGenerateMonthDaysReturns42Days() {
        let date = DateComponents(year: 2025, month: 10, day: 1)
        let testDate = calendar.date(from: date)!

        let days = calendar.generateMonthDays(for: testDate)
        XCTAssertEqual(days.count, 42)
    }

    func testGenerateMonthDaysCorrectly() {
        let date = DateComponents(year: 2025, month: 10, day: 15)
        let testDate = calendar.date(from: date)!

        let days = calendar.generateMonthDays(for: testDate)

        // Check that October 1 is included
        let oct1 = DateComponents(year: 2025, month: 10, day: 1)
        let oct1Date = calendar.date(from: oct1)!

        let containsOct1 = days.contains { $0.date.isSameDay(as: oct1Date) }
        XCTAssertTrue(containsOct1)

        // Check that October days are marked as current month
        let octoberDays = days.filter { $0.isCurrentMonth }
        XCTAssertEqual(octoberDays.count, 31)
    }

    // MARK: - Edge Case Tests

    func testDSTTransition() {
        // Test around DST transition (varies by timezone, but shouldn't crash)
        let dstDate = DateComponents(year: 2025, month: 3, day: 9) // Example DST date
        let date = calendar.date(from: dstDate)!

        let nextDay = date.safeAdd(.day, value: 1)
        let prevDay = date.safeSubtract(.day, value: 1)

        XCTAssertNotNil(nextDay)
        XCTAssertNotNil(prevDay)
    }

    func testLeapYearEdgeCases() {
        // February 29, 2024 (leap year)
        let feb29 = DateComponents(year: 2024, month: 2, day: 29)
        let leapDate = calendar.date(from: feb29)!

        // Add a year (should handle going to non-leap year)
        let nextYear = leapDate.safeAdd(.year, value: 1)
        XCTAssertNotNil(nextYear)

        // The result should be Feb 28, 2025 (or March 1, depending on Calendar implementation)
        // Either way, it shouldn't crash
        let components = calendar.dateComponents([.year, .month], from: nextYear)
        XCTAssertEqual(components.year, 2025)
        XCTAssertTrue(components.month == 2 || components.month == 3)
    }
}
```

#### Migration Guide

**Before (Crashes)**:
```swift
let nextMonth = calendar.date(byAdding: .month, value: 1, to: date)!
let startOfMonth = calendar.dateComponents([.year, .month], from: date)
let firstDay = calendar.date(from: startOfMonth)!
```

**After (Safe)**:
```swift
let nextMonth = date.safeAdd(.month, value: 1)
let firstDay = date.startOfMonth()
```

#### Files to Update
1. `CalendarGridView.swift` - Replace all date arithmetic
2. `CalendarView.swift` - Replace week calculations
3. `EmailInboxView.swift` - Replace date filters
4. Any other files with date force unwraps

**Checklist**:
- [ ] Create `Date+Tide.swift` extension
- [ ] Write comprehensive tests
- [ ] Run tests and verify 100% pass
- [ ] Update `CalendarGridView.swift`
- [ ] Update `CalendarView.swift`
- [ ] Update `EmailInboxView.swift`
- [ ] Search for remaining `!` in date operations
- [ ] Verify no crashes in calendar navigation

---

### Day 3-4: Remove fatalError() Calls

#### Problem

**3 fatalError() calls** that crash the app on configuration errors:
1. `SupabaseManager.swift:22` - Invalid Supabase URL
2. `GoogleOAuthService.swift:45` - Missing OAuth client ID
3. (Potential in config loading)

#### Solution: Throwing Initializers + Error Types

**File**: `TideApp/Core/Errors/ConfigurationError.swift`

```swift
import Foundation

enum ConfigurationError: LocalizedError {
    case invalidSupabaseURL(String)
    case invalidSupabaseKey
    case missingGoogleClientID
    case missingAPIEndpoint
    case invalidEnvironment

    var errorDescription: String? {
        switch self {
        case .invalidSupabaseURL(let url):
            return "Invalid Supabase URL: \(url). Please check your configuration."
        case .invalidSupabaseKey:
            return "Supabase API key is missing or invalid. Please reinstall the app."
        case .missingGoogleClientID:
            return "Google OAuth is not configured properly. Please contact support."
        case .missingAPIEndpoint:
            return "API endpoint is not configured. Please check your environment."
        case .invalidEnvironment:
            return "Invalid environment configuration. Please contact support."
        }
    }

    var recoverySuggestion: String? {
        switch self {
        case .invalidSupabaseURL, .invalidSupabaseKey, .missingAPIEndpoint:
            return "Try reinstalling the app. If the problem persists, contact support@tide.ai"
        case .missingGoogleClientID:
            return "Please contact support@tide.ai for assistance."
        case .invalidEnvironment:
            return "This appears to be a development environment issue."
        }
    }
}
```

**File**: `TideApp/Services/SupabaseManager.swift`

```swift
import Foundation
import Supabase

protocol SupabaseManagerProtocol {
    var client: SupabaseClient { get }
    func signIn(email: String, password: String) async throws -> User
    func signOut() async throws
}

class SupabaseManager: SupabaseManagerProtocol {
    let client: SupabaseClient

    // Remove singleton pattern for testability
    init(url: String, key: String) throws {
        // Validate URL
        guard let validURL = URL(string: url), !url.isEmpty else {
            throw ConfigurationError.invalidSupabaseURL(url)
        }

        // Validate key
        guard !key.isEmpty else {
            throw ConfigurationError.invalidSupabaseKey
        }

        // Create client (can still throw, but we handle it)
        self.client = SupabaseClient(
            supabaseURL: validURL,
            supabaseKey: key
        )
    }

    // Convenience factory method
    static func production() throws -> SupabaseManager {
        return try SupabaseManager(
            url: Config.supabaseURL,
            key: Config.supabaseAnonKey
        )
    }

    func signIn(email: String, password: String) async throws -> User {
        let session = try await client.auth.signIn(email: email, password: password)
        return session.user
    }

    func signOut() async throws {
        try await client.auth.signOut()
    }
}
```

**File**: `TideApp/Core/Config/Config.swift`

```swift
import Foundation

struct Config {
    // MARK: - Supabase
    static var supabaseURL: String {
        return Bundle.main.object(forInfoDictionaryKey: "SUPABASE_URL") as? String
            ?? "https://ozrocykjomgcuphicqpg.supabase.co"
    }

    static var supabaseAnonKey: String {
        return Bundle.main.object(forInfoDictionaryKey: "SUPABASE_ANON_KEY") as? String
            ?? ""
    }

    // MARK: - API
    static var apiBaseURL: String {
        #if DEBUG
        return "http://localhost:3002"
        #else
        return Bundle.main.object(forInfoDictionaryKey: "API_BASE_URL") as? String
            ?? "https://gateway.tide.ai"
        #endif
    }

    // MARK: - Google OAuth
    static var googleClientID: String {
        return Bundle.main.object(forInfoDictionaryKey: "GOOGLE_CLIENT_ID") as? String
            ?? ""
    }

    // MARK: - Environment
    enum Environment {
        case development
        case staging
        case production

        static var current: Environment {
            #if DEBUG
            return .development
            #else
            return .production
            #endif
        }
    }

    static var isDebug: Bool {
        return Environment.current == .development
    }
}
```

**File**: `TideApp/Presentation/ConfigurationErrorView.swift`

```swift
import SwiftUI

struct ConfigurationErrorView: View {
    let error: Error
    @State private var showDetails = false

    var body: some View {
        VStack(spacing: 24) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 60))
                .foregroundColor(.orange)

            Text("Configuration Error")
                .font(.title)
                .fontWeight(.bold)

            Text(error.localizedDescription)
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
                .padding(.horizontal)

            if let recoverySuggestion = (error as? LocalizedError)?.recoverySuggestion {
                Text(recoverySuggestion)
                    .font(.caption)
                    .multilineTextAlignment(.center)
                    .foregroundColor(.secondary)
                    .padding(.horizontal)
            }

            Button("Copy Error Details") {
                UIPasteboard.general.string = """
                Error: \(error.localizedDescription)

                Details: \(String(describing: error))
                """
            }
            .buttonStyle(.bordered)

            if showDetails {
                Text(String(describing: error))
                    .font(.system(.caption, design: .monospaced))
                    .foregroundColor(.secondary)
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(8)
                    .padding(.horizontal)
            }

            Button(showDetails ? "Hide Details" : "Show Details") {
                showDetails.toggle()
            }
            .font(.caption)
        }
        .padding()
    }
}
```

**File**: `TideApp/TideApp.swift` (Updated)

```swift
import SwiftUI

@main
struct TideApp: App {
    @StateObject private var container: DependencyContainer
    @State private var configError: Error?

    init() {
        // Try to initialize container
        do {
            let container = try DependencyContainer.production()
            _container = StateObject(wrappedValue: container)
        } catch {
            // Create placeholder container
            _container = StateObject(wrappedValue: DependencyContainer.placeholder)
            _configError = State(initialValue: error)
        }
    }

    var body: some Scene {
        WindowGroup {
            if let error = configError {
                ConfigurationErrorView(error: error)
            } else {
                RootView()
                    .environmentObject(container)
            }
        }
    }
}
```

**Checklist**:
- [ ] Create `ConfigurationError.swift`
- [ ] Update `SupabaseManager.swift` to throw instead of fatalError
- [ ] Update `GoogleOAuthService.swift` to throw instead of fatalError
- [ ] Create `ConfigurationErrorView.swift`
- [ ] Update `TideApp.swift` to handle init errors
- [ ] Test with invalid configuration
- [ ] Verify app shows error screen instead of crashing

---

### Day 5: Error Handling Patterns

#### Standardize on async/await + throws

**Pattern**:
```swift
// For async operations that can fail
func fetchEmails() async throws -> [Email] {
    // Implementation
}

// For sync operations that can fail
func parseEmail(_ data: Data) throws -> Email {
    // Implementation
}

// For operations that have multiple outcomes
enum FetchResult<T> {
    case success(T)
    case failure(Error)
    case empty
}

// Usage
let result = await viewModel.fetch()
switch result {
case .success(let data):
    // Handle success
case .failure(let error):
    // Handle error
case .empty:
    // Handle empty state
}
```

**Checklist**:
- [ ] Audit all API methods for consistent error handling
- [ ] Replace Optional returns with throws where appropriate
- [ ] Update ViewModels to use async/await patterns
- [ ] Add proper error states to all views

---

## Week 2: Dependency Injection

### Goal: Remove Singletons, Enable Testing

#### Current Problem

```swift
// Tight coupling to singleton
class ChatViewModel {
    func sendMessage() {
        APIClient.shared.request(...)  // Can't mock for testing
    }
}
```

#### Solution: Protocol + Injection

**Step 1: Define Protocols**

**File**: `TideApp/Core/Protocols/ServiceProtocols.swift`

```swift
import Foundation

// MARK: - API Client Protocol

protocol APIClientProtocol {
    func sendChatMessage(message: String, conversationId: String?) async throws -> ChatResponse
    func getConversations() async throws -> [Conversation]
    func getEmails(category: String?) async throws -> [Email]
    func getEmailDetail(id: String) async throws -> Email
    func sendEmail(to: [String], subject: String, body: String) async throws
    // ... all other methods
}

// MARK: - Auth Manager Protocol

protocol AuthManagerProtocol {
    var isAuthenticated: Bool { get }
    var currentUser: User? { get }
    var accessToken: String? { get }

    func signIn(with provider: AuthProvider) async throws -> User
    func signOut() async throws
    func refreshToken() async throws -> String
}

// MARK: - Supabase Manager Protocol

protocol SupabaseManagerProtocol {
    func signIn(email: String, password: String) async throws -> User
    func signOut() async throws
}
```

**Step 2: Implement Protocols**

**File**: `TideApp/Services/APIClient.swift`

```swift
class APIClient: APIClientProtocol {
    private let baseURL: String
    private let session: URLSession
    private let authManager: AuthManagerProtocol

    // Dependency injection instead of singleton
    init(baseURL: String, authManager: AuthManagerProtocol, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.authManager = authManager
        self.session = session
    }

    // Implement all protocol methods...
    func sendChatMessage(message: String, conversationId: String?) async throws -> ChatResponse {
        // Implementation
    }

    // Factory method for production
    static func production(authManager: AuthManagerProtocol) -> APIClient {
        return APIClient(
            baseURL: Config.apiBaseURL,
            authManager: authManager
        )
    }
}
```

**Step 3: Update Dependency Container**

**File**: `TideApp/Core/DI/DependencyContainer.swift`

```swift
@MainActor
class DependencyContainer: ObservableObject {
    // MARK: - Services (no more singletons)
    let apiClient: APIClientProtocol
    let authManager: AuthManagerProtocol
    let supabaseManager: SupabaseManagerProtocol

    // MARK: - Production Initializer
    init(
        apiClient: APIClientProtocol,
        authManager: AuthManagerProtocol,
        supabaseManager: SupabaseManagerProtocol
    ) {
        self.apiClient = apiClient
        self.authManager = authManager
        self.supabaseManager = supabaseManager
    }

    // Factory method for production
    static func production() throws -> DependencyContainer {
        // Create services with dependencies
        let supabaseManager = try SupabaseManager.production()
        let authManager = AuthManager(supabaseManager: supabaseManager)
        let apiClient = APIClient.production(authManager: authManager)

        return DependencyContainer(
            apiClient: apiClient,
            authManager: authManager,
            supabaseManager: supabaseManager
        )
    }

    // Factory method for testing
    static func test(
        apiClient: APIClientProtocol? = nil,
        authManager: AuthManagerProtocol? = nil,
        supabaseManager: SupabaseManagerProtocol? = nil
    ) -> DependencyContainer {
        return DependencyContainer(
            apiClient: apiClient ?? MockAPIClient(),
            authManager: authManager ?? MockAuthManager(),
            supabaseManager: supabaseManager ?? MockSupabaseManager()
        )
    }

    // Placeholder for error cases
    static var placeholder: DependencyContainer {
        return DependencyContainer.test()
    }

    // MARK: - View Model Factories

    func makeChatViewModel() -> ChatViewModel {
        return ChatViewModel(
            apiClient: apiClient,
            authManager: authManager
        )
    }

    func makeEmailViewModel() -> EmailViewModel {
        return EmailViewModel(
            apiClient: apiClient
        )
    }

    // ... other factory methods
}
```

**Step 4: Update ViewModels**

**File**: `TideApp/Features/Chat/ChatViewModel.swift`

```swift
@MainActor
class ChatViewModel: ObservableObject {
    @Published var messages: [ChatMessage] = []
    @Published var isLoading = false
    @Published var error: Error?

    private let apiClient: APIClientProtocol
    private let authManager: AuthManagerProtocol

    // Dependency injection
    init(apiClient: APIClientProtocol, authManager: AuthManagerProtocol) {
        self.apiClient = apiClient
        self.authManager = authManager
    }

    func sendMessage(_ text: String) async {
        isLoading = true
        error = nil

        do {
            let response = try await apiClient.sendChatMessage(
                message: text,
                conversationId: nil
            )

            // Update messages
            messages.append(ChatMessage(role: "user", content: text))
            messages.append(ChatMessage(role: "assistant", content: response.content))

            isLoading = false
        } catch {
            self.error = error
            isLoading = false
        }
    }
}
```

**Step 5: Create Mock Implementations**

**File**: `TideAppTests/Mocks/MockAPIClient.swift`

```swift
import Foundation
@testable import TideApp

class MockAPIClient: APIClientProtocol {
    var mockEmails: [Email] = []
    var mockConversations: [Conversation] = []
    var shouldThrowError = false
    var errorToThrow: Error = APIError.unknown

    func sendChatMessage(message: String, conversationId: String?) async throws -> ChatResponse {
        if shouldThrowError { throw errorToThrow }

        return ChatResponse(
            content: "Mock response to: \(message)",
            conversationId: conversationId ?? UUID().uuidString
        )
    }

    func getEmails(category: String?) async throws -> [Email] {
        if shouldThrowError { throw errorToThrow }
        return mockEmails
    }

    // ... implement all other methods
}

class MockAuthManager: AuthManagerProtocol {
    var isAuthenticated: Bool = true
    var currentUser: User? = User(id: "test", email: "test@example.com")
    var accessToken: String? = "mock-token"

    func signIn(with provider: AuthProvider) async throws -> User {
        return currentUser!
    }

    func signOut() async throws {
        isAuthenticated = false
        currentUser = nil
    }

    func refreshToken() async throws -> String {
        return "refreshed-token"
    }
}
```

**Step 6: Write Tests**

**File**: `TideAppTests/ViewModels/ChatViewModelTests.swift`

```swift
import XCTest
@testable import TideApp

@MainActor
class ChatViewModelTests: XCTestCase {
    var viewModel: ChatViewModel!
    var mockAPIClient: MockAPIClient!
    var mockAuthManager: MockAuthManager!

    override func setUp() async throws {
        mockAPIClient = MockAPIClient()
        mockAuthManager = MockAuthManager()
        viewModel = ChatViewModel(
            apiClient: mockAPIClient,
            authManager: mockAuthManager
        )
    }

    func testSendMessageSuccess() async throws {
        // Given
        XCTAssertTrue(viewModel.messages.isEmpty)

        // When
        await viewModel.sendMessage("Hello")

        // Then
        XCTAssertEqual(viewModel.messages.count, 2)
        XCTAssertEqual(viewModel.messages[0].content, "Hello")
        XCTAssertEqual(viewModel.messages[0].role, "user")
        XCTAssertTrue(viewModel.messages[1].content.contains("Mock response"))
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.error)
    }

    func testSendMessageError() async throws {
        // Given
        mockAPIClient.shouldThrowError = true
        mockAPIClient.errorToThrow = APIError.networkError

        // When
        await viewModel.sendMessage("Hello")

        // Then
        XCTAssertNotNil(viewModel.error)
        XCTAssertFalse(viewModel.isLoading)
    }
}
```

**Checklist**:
- [ ] Define all service protocols
- [ ] Update APIClient to use DI
- [ ] Update AuthManager to use DI
- [ ] Update SupabaseManager to use DI
- [ ] Update DependencyContainer
- [ ] Update all ViewModels to use DI
- [ ] Create mock implementations
- [ ] Write ViewModel tests
- [ ] Remove all `.shared` singleton references
- [ ] Verify tests pass

---

## Week 3: Remove Mock Data

### Goal: Real API Integration

**Current**: ViewModels return hardcoded mock data
**Target**: ViewModels call real API endpoints

#### Step 1: Implement All API Endpoints

**File**: `TideApp/Networking/Endpoint.swift`

```swift
enum Endpoint {
    // Chat
    case aiChat
    case aiConversations
    case aiConversationMessages(conversationId: String)

    // Email
    case emailMessages(query: String?)
    case emailMessage(id: String)
    case emailSend
    case emailComposeDrafts(emailId: String)
    case emailArchive(id: String)
    case emailDelete(id: String)

    // Calendar
    case calendarEvents(start: Date, end: Date)
    case calendarEvent(id: String)
    case calendarEventCreate
    case calendarEventUpdate(id: String)
    case calendarEventDelete(id: String)

    // Tasks
    case tasks(status: String?)
    case task(id: String)
    case taskCreate
    case taskUpdate(id: String)
    case taskDelete(id: String)

    // Auth
    case authLogin
    case authLogout
    case authRefresh
    case authMe

    var path: String {
        switch self {
        case .aiChat: return "/api/ai/chat"
        case .aiConversations: return "/api/ai/conversations"
        case .aiConversationMessages(let id): return "/api/ai/conversations/\(id)/messages"
        // ... all other cases
        }
    }

    var method: String {
        switch self {
        case .aiChat, .emailSend, .calendarEventCreate, .taskCreate, .authLogin:
            return "POST"
        case .calendarEventUpdate, .taskUpdate:
            return "PUT"
        case .emailDelete, .calendarEventDelete, .taskDelete, .authLogout:
            return "DELETE"
        default:
            return "GET"
        }
    }
}
```

#### Step 2: Update ViewModels

Remove all mock data and implement real API calls.

**Before**:
```swift
func loadEmails() {
    emails = [
        Email(id: "1", subject: "Mock Email", ...),
        // More mock data
    ]
}
```

**After**:
```swift
func loadEmails() async {
    isLoading = true
    error = nil

    do {
        emails = try await apiClient.getEmails(category: selectedCategory)
        isLoading = false
    } catch {
        self.error = error
        isLoading = false
    }
}
```

**Checklist**:
- [ ] Implement all endpoints in APIClient
- [ ] Remove all mock data from ViewModels
- [ ] Update all ViewModels to call real APIs
- [ ] Add proper error handling
- [ ] Test each ViewModel with real backend (or staging)

---

## Week 4: Testing Foundation

### Goal: 40% Test Coverage

#### Test Categories

1. **Unit Tests** (Core utilities, extensions, models)
2. **ViewModel Tests** (Business logic, state management)
3. **Repository Tests** (Data layer)
4. **Integration Tests** (API client with mock server)

#### Test Structure

```
TideAppTests/
├── Extensions/
│   ├── DateExtensionsTests.swift
│   ├── ColorExtensionsTests.swift
│   └── StringExtensionsTests.swift
├── ViewModels/
│   ├── ChatViewModelTests.swift
│   ├── EmailViewModelTests.swift
│   ├── CalendarViewModelTests.swift
│   └── TaskViewModelTests.swift
├── Repositories/
│   ├── EmailRepositoryTests.swift
│   ├── CalendarRepositoryTests.swift
│   └── TaskRepositoryTests.swift
├── Networking/
│   └── APIClientTests.swift
├── Mocks/
│   ├── MockAPIClient.swift
│   ├── MockAuthManager.swift
│   └── MockSupabaseManager.swift
└── TestHelpers.swift
```

#### Coverage Goals

| Category | Target Coverage |
|----------|----------------|
| Extensions | 90% |
| ViewModels | 60% |
| Repositories | 70% |
| API Client | 50% |
| **Overall** | **40%** |

**Checklist**:
- [ ] Setup XCTest in project
- [ ] Create test targets
- [ ] Write extension tests
- [ ] Write ViewModel tests
- [ ] Write repository tests
- [ ] Setup CI to run tests
- [ ] Measure coverage
- [ ] Achieve 40% coverage

---

## Architecture Patterns

### MVVM with Repository Pattern

```
View
  ↓
ViewModel (Business Logic)
  ↓
Repository (Data Abstraction)
  ↓
APIClient / LocalStorage
```

### Clean Separation

```swift
// ✅ Good: ViewModel doesn't know about API details
class EmailViewModel {
    private let repository: EmailRepository

    func loadEmails() async {
        emails = try await repository.getEmails()
    }
}

// ✅ Good: Repository handles API/cache logic
class EmailRepository {
    private let apiClient: APIClient
    private let cache: CacheManager

    func getEmails() async throws -> [Email] {
        // Try cache first
        if let cached = cache.get("emails") {
            return cached
        }

        // Fetch from API
        let emails = try await apiClient.getEmails()
        cache.set("emails", value: emails)
        return emails
    }
}
```

---

## Code Quality Standards

### SwiftLint Rules

**File**: `.swiftlint.yml`

```yaml
disabled_rules:
  - trailing_whitespace

opt_in_rules:
  - empty_count
  - explicit_init

excluded:
  - Pods
  - build

line_length:
  warning: 120
  error: 150

identifier_name:
  min_length:
    warning: 2

force_unwrapping: error
force_cast: error
```

**Checklist**:
- [ ] Add SwiftLint to project
- [ ] Configure rules
- [ ] Fix all errors
- [ ] Fix all warnings
- [ ] Add SwiftLint to CI

---

## Success Criteria for Phase 1

After 4 weeks, we should have:

✅ **Zero Crash Risks**
- No force unwraps
- No fatalError calls
- Comprehensive error handling

✅ **Testable Architecture**
- Proper dependency injection
- Protocol-based abstractions
- No singletons (except truly global state)

✅ **Real Data**
- All mocks removed
- API integration complete
- Error states working

✅ **40% Test Coverage**
- Core utilities tested
- ViewModels tested
- Basic integration tests

✅ **Clean Code**
- SwiftLint passing
- Consistent patterns
- Readable and maintainable

---

**This foundation enables everything else. Do not skip Phase 1.**

*Last Updated: October 8, 2025*
