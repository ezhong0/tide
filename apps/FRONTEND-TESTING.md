# Frontend Testing Infrastructure

Comprehensive testing guide for Tide mobile applications (iOS and Android).

## Overview

The Tide platform includes two native mobile applications with comprehensive test coverage:

- **iOS App** (Swift/SwiftUI) - Located in `apps/mobile-ios/`
- **Android App** (Kotlin/Jetpack Compose) - Located in `apps/mobile-android/`

## Test Architecture

### iOS Testing (XCTest)

**Framework**: XCTest + Swift Testing
**Test Target**: `TideAppTests`
**Coverage**: ViewModels, Services, Models, Core Utilities

#### iOS Test Structure

```
apps/mobile-ios/TideAppTests/
├── Core/
│   ├── NetworkUtilitiesTests.swift       # Network retry, timeout, error handling
│   ├── JWTDecoderTests.swift            # JWT token parsing
│   └── CacheManagerTests.swift          # Offline caching
├── Services/
│   └── APIClientTests.swift             # HTTP client, request building
├── Models/
│   └── MessageModelTests.swift          # Data models, serialization
├── ViewModels/
│   ├── ChatViewModelTests.swift         # Chat functionality
│   ├── CalendarGridViewModelTests.swift # Calendar management
│   └── TaskListViewModelTests.swift     # Task management
├── Integration/
│   └── ViewModelIntegrationTests.swift  # End-to-end flows
└── Extensions/
    └── DateExtensionsTests.swift        # Date utilities
```

#### Running iOS Tests

```bash
# Navigate to iOS app directory
cd apps/mobile-ios

# Run all tests
xcodebuild test \
  -scheme TideIOS \
  -destination 'platform=iOS Simulator,name=iPhone 15'

# Run specific test file
xcodebuild test \
  -scheme TideIOS \
  -destination 'platform=iOS Simulator,name=iPhone 15' \
  -only-testing:TideAppTests/ChatViewModelTests

# Run tests from Xcode
# 1. Open TideApp.xcodeproj
# 2. Press Cmd + U to run all tests
# 3. Or Cmd + 6 to view test navigator

# Generate coverage report
xcodebuild test \
  -scheme TideIOS \
  -destination 'platform=iOS Simulator,name=iPhone 15' \
  -enableCodeCoverage YES
```

#### iOS Test Patterns

**ViewModel Testing**

```swift
import XCTest
@testable import TideIOS

@MainActor
final class MyViewModelTests: XCTestCase {
    var sut: MyViewModel!
    var mockAPIClient: MockAPIClient!

    override func setUp() {
        super.setUp()
        mockAPIClient = MockAPIClient()
        sut = MyViewModel(apiClient: mockAPIClient)
    }

    override func tearDown() {
        sut = nil
        mockAPIClient = nil
        super.tearDown()
    }

    func testFetchData_Success() async {
        // Given
        mockAPIClient.mockDelay = 0.1

        // When
        await sut.fetchData()

        // Then
        XCTAssertFalse(sut.isLoading)
        XCTAssertNil(sut.error)
        XCTAssertFalse(sut.data.isEmpty)
    }
}
```

**Network Testing**

```swift
func testRetryLogic_SuccessOnSecondAttempt() async throws {
    var callCount = 0

    let result = try await RetryLogic.executeWithRetry {
        callCount += 1
        if callCount == 1 {
            throw NetworkError.timeout
        }
        return "success"
    }

    XCTAssertEqual(callCount, 2)
    XCTAssertEqual(result, "success")
}
```

**Model Testing**

```swift
func testMessage_RoundTripEncoding() throws {
    let original = Message(/*...*/)

    let data = try JSONEncoder().encode(original)
    let decoded = try JSONDecoder().decode(Message.self, from: data)

    XCTAssertEqual(original.id, decoded.id)
    XCTAssertEqual(original.content, decoded.content)
}
```

### Android Testing (JUnit + Kotlin Test)

**Framework**: JUnit 4 + Kotlin Coroutines Test
**Test Source**: `app/src/test/kotlin`
**Coverage**: ViewModels, Models, Utilities, Repositories

#### Android Test Structure

```
apps/mobile-android/app/src/test/kotlin/ai/tide/app/
├── data/
│   ├── MessageModelTest.kt           # Data class testing
│   ├── ConversationModelTest.kt      # Model serialization
│   └── repository/
│       └── ConversationRepositoryTest.kt
├── ui/
│   ├── AuthViewModelTest.kt          # Authentication logic
│   ├── ChatViewModelTest.kt          # Chat functionality
│   └── CalendarViewModelTest.kt      # Calendar management
├── core/
│   ├── NetworkUtilsTest.kt           # Network utilities
│   └── ValidationUtilsTest.kt        # Input validation
└── integration/
    └── EndToEndFlowTest.kt           # Full user flows
```

#### Running Android Tests

```bash
# Navigate to Android app directory
cd apps/mobile-android

# Run all unit tests
./gradlew test

# Run specific test class
./gradlew test --tests ai.tide.app.data.MessageModelTest

# Run tests with coverage
./gradlew testDebugUnitTest jacocoTestReport

# View coverage report
open app/build/reports/jacoco/testDebugUnitTest/html/index.html

# Run from Android Studio
# 1. Right-click test file or package
# 2. Select "Run Tests"
# 3. View results in Test panel
```

#### Android Test Patterns

**ViewModel Testing with Coroutines**

```kotlin
@OptIn(ExperimentalCoroutinesApi::class)
class MyViewModelTest {
    private val testDispatcher = StandardTestDispatcher()

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `fetchData updates state correctly`() = runTest {
        // Given
        val viewModel = MyViewModel()

        // When
        viewModel.fetchData()
        advanceUntilIdle()

        // Then
        assertFalse(viewModel.isLoading.value)
        assertNotNull(viewModel.data.value)
    }
}
```

**Model Testing**

```kotlin
@Test
fun `message initializes with all properties`() {
    // Given
    val id = "msg-123"
    val content = "Hello, world!"

    // When
    val message = Message(
        id = id,
        content = content,
        timestamp = Instant.now().toEpochMilli()
    )

    // Then
    assertEquals(id, message.id)
    assertEquals(content, message.content)
}
```

**Network Testing**

```kotlin
@Test
fun `retry succeeds on second attempt`() = runTest {
    var callCount = 0

    val result = retryWithExponentialBackoff {
        callCount++
        if (callCount == 1) {
            throw NetworkError.Timeout
        }
        "success"
    }

    assertEquals(2, callCount)
    assertEquals("success", result)
}
```

## Test Coverage Goals

### iOS Test Coverage
- **ViewModels**: 80%+ coverage (critical business logic)
- **Services**: 75%+ coverage (API integration, auth)
- **Models**: 90%+ coverage (data validation, serialization)
- **Core Utilities**: 85%+ coverage (network, caching, storage)

### Android Test Coverage
- **ViewModels**: 80%+ coverage
- **Repositories**: 75%+ coverage
- **Models**: 90%+ coverage
- **Utilities**: 85%+ coverage

## Mock Objects

### iOS Mocks

```swift
// Mock API Client
class MockAPIClient: APIClientProtocol {
    var mockDelay: TimeInterval = 0
    var shouldFail: Bool = false
    var mockResponse: Any?

    func sendMessage(_ message: String) async throws -> Message {
        try await Task.sleep(nanoseconds: UInt64(mockDelay * 1_000_000_000))

        if shouldFail {
            throw NetworkError.serverError(message: "Mock failure")
        }

        return mockResponse as? Message ?? Message(/*...*/)
    }
}

// Mock Auth Manager
class MockAuthManager: AuthManagerProtocol {
    var isAuthenticated: Bool = false
    var currentUser: User?

    func signIn(email: String, password: String) async throws {
        isAuthenticated = true
        currentUser = User(id: "mock-user", email: email)
    }
}
```

### Android Mocks

```kotlin
// Mock Repository
class MockConversationRepository : ConversationRepository {
    var shouldFail = false
    var mockData: List<Conversation> = emptyList()

    override suspend fun getConversations(): List<Conversation> {
        if (shouldFail) {
            throw Exception("Mock failure")
        }
        return mockData
    }
}

// Mock API Service
class MockApiService : ApiService {
    var mockDelay = 0L
    var mockResponse: Any? = null

    override suspend fun sendMessage(message: String): Result<Message> {
        delay(mockDelay)
        return Result.success(mockResponse as? Message ?: Message(/*...*/)
    }
}
```

## Testing Best Practices

### 1. Arrange-Act-Assert Pattern

```swift
func testExample() {
    // Arrange (Given)
    let input = "test"
    let expected = "TEST"

    // Act (When)
    let result = input.uppercased()

    // Assert (Then)
    XCTAssertEqual(result, expected)
}
```

### 2. Test Naming Conventions

**iOS**:
```swift
func testMethodName_Scenario_ExpectedResult()
func testSendMessage_WithEmptyText_DoesNotSend()
```

**Android**:
```kotlin
@Test
fun `method name scenario expected result`()
fun `send message with empty text does not send`()
```

### 3. Async Testing

**iOS**:
```swift
func testAsyncOperation() async {
    await viewModel.performOperation()
    XCTAssertTrue(viewModel.completed)
}
```

**Android**:
```kotlin
@Test
fun `async operation completes`() = runTest {
    viewModel.performOperation()
    advanceUntilIdle()
    assertTrue(viewModel.completed.value)
}
```

### 4. Testing Error Cases

Always test both success and failure paths:

```swift
func testFetchData_Success() async {
    // Test happy path
}

func testFetchData_Failure() async {
    // Test error handling
}

func testFetchData_EmptyResult() async {
    // Test edge case
}
```

### 5. Performance Testing

**iOS**:
```swift
func testPerformance() {
    measure {
        // Code to measure
        for i in 0..<1000 {
            _ = expensiveOperation()
        }
    }
}
```

**Android**:
```kotlin
@Test
fun `performance test`() {
    val startTime = System.currentTimeMillis()

    repeat(1000) {
        expensiveOperation()
    }

    val duration = System.currentTimeMillis() - startTime
    assertTrue(duration < 1000) // Should complete in < 1s
}
```

## UI Testing

### iOS UI Tests (XCUITest)

```bash
# Run UI tests
xcodebuild test \
  -scheme TideIOS \
  -destination 'platform=iOS Simulator,name=iPhone 15' \
  -only-testing:TideUITests
```

```swift
final class LoginUITests: XCTestCase {
    func testLoginFlow() {
        let app = XCUIApplication()
        app.launch()

        // Find and tap email field
        let emailField = app.textFields["email"]
        emailField.tap()
        emailField.typeText("test@example.com")

        // Enter password
        let passwordField = app.secureTextFields["password"]
        passwordField.tap()
        passwordField.typeText("password123")

        // Tap sign in button
        app.buttons["Sign In"].tap()

        // Verify navigation to home screen
        XCTAssertTrue(app.navigationBars["Home"].exists)
    }
}
```

### Android UI Tests (Espresso)

```bash
# Run instrumented tests
./gradlew connectedAndroidTest
```

```kotlin
@RunWith(AndroidJUnit4::class)
class LoginUITest {
    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun loginFlow_success() {
        composeTestRule.setContent {
            LoginScreen()
        }

        // Enter email
        composeTestRule
            .onNodeWithTag("email_field")
            .performTextInput("test@example.com")

        // Enter password
        composeTestRule
            .onNodeWithTag("password_field")
            .performTextInput("password123")

        // Click sign in
        composeTestRule
            .onNodeWithText("Sign In")
            .performClick()

        // Verify navigation
        composeTestRule
            .onNodeWithText("Home")
            .assertExists()
    }
}
```

## Continuous Integration

### iOS CI (GitHub Actions)

```yaml
name: iOS Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3

      - name: Select Xcode
        run: sudo xcode-select -s /Applications/Xcode_15.0.app

      - name: Run tests
        run: |
          cd apps/mobile-ios
          xcodebuild test \
            -scheme TideIOS \
            -destination 'platform=iOS Simulator,name=iPhone 15' \
            -enableCodeCoverage YES

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Android CI (GitHub Actions)

```yaml
name: Android Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up JDK
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'adopt'

      - name: Run tests
        run: |
          cd apps/mobile-android
          ./gradlew test jacocoTestReport

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./app/build/reports/jacoco/testDebugUnitTest/jacocoTestReport.xml
```

## Debugging Tests

### iOS Debugging

```bash
# Run single test with verbose output
xcodebuild test \
  -scheme TideIOS \
  -destination 'platform=iOS Simulator,name=iPhone 15' \
  -only-testing:TideAppTests/ChatViewModelTests/testSendMessage_Success \
  -verbose

# Enable test output logging
NSLog("Debug: \(value)")
print("Test checkpoint reached")
```

### Android Debugging

```bash
# Run tests with detailed output
./gradlew test --info

# Run specific test with stack traces
./gradlew test --tests MessageModelTest --stacktrace
```

## Test Data & Fixtures

### iOS Test Fixtures

```swift
extension Message {
    static func fixture(
        id: String = "test-id",
        content: String = "Test message",
        role: MessageRole = .user
    ) -> Message {
        Message(
            id: id,
            userId: "test-user",
            conversationId: "test-conversation",
            content: content,
            role: role,
            timestamp: Date()
        )
    }
}

// Usage
let message = Message.fixture(content: "Custom content")
```

### Android Test Fixtures

```kotlin
object TestFixtures {
    fun createMessage(
        id: String = "test-id",
        content: String = "Test message",
        role: String = "user"
    ) = Message(
        id = id,
        userId = "test-user",
        conversationId = "test-conversation",
        content = content,
        role = role,
        timestamp = Instant.now().toEpochMilli()
    )
}

// Usage
val message = TestFixtures.createMessage(content = "Custom content")
```

## Resources

- [XCTest Documentation](https://developer.apple.com/documentation/xctest)
- [Swift Testing](https://developer.apple.com/wwdc23/10175)
- [JUnit Documentation](https://junit.org/junit4/)
- [Kotlin Coroutines Testing](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-test/)
- [Jetpack Compose Testing](https://developer.android.com/jetpack/compose/testing)

## Getting Help

If you encounter testing issues:

1. Check the test output for specific error messages
2. Review this documentation for examples
3. Check existing test files for patterns
4. Ask in #mobile-engineering Slack channel
5. Review CI logs for failures in pull requests

---

**Last Updated**: 2025-10-09
**Maintained By**: Mobile Engineering Team
