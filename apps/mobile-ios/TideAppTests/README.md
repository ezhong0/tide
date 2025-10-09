# Tide iOS App Tests

Test suite for the Tide iOS application using XCTest.

## Directory Structure

```
TideAppTests/
├── Core/               # Core utility tests (JWTDecoder, CacheManager, etc.)
├── Services/           # Service layer tests (APIClient, AuthManager, etc.)
├── ViewModels/         # ViewModel tests
├── Utilities/          # Utility and helper tests
└── Integration/        # Integration tests
```

## Current Test Coverage

**Status**: Foundation laid, comprehensive tests to be added post-1.0

### Implemented Tests
- ✅ `JWTDecoderTests.swift` - JWT decoding and validation
- ✅ `CacheManagerTests.swift` - Cache storage and retrieval

### Planned Tests (Post-1.0)

**Priority 1 - Core Services**:
- [ ] `APIClientTests.swift` - API request construction, response parsing, retry logic
- [ ] `AuthManagerTests.swift` - Token management, session handling
- [ ] `KeychainManagerTests.swift` - Secure storage operations

**Priority 2 - ViewModels**:
- [ ] `EmailInboxViewModelTests.swift`
- [ ] `ChatViewModelTests.swift`
- [ ] `CalendarGridViewModelTests.swift`
- [ ] `TaskListViewModelTests.swift`

**Priority 3 - Repositories**:
- [ ] `NetworkEmailRepositoryTests.swift`
- [ ] `NetworkCalendarRepositoryTests.swift`
- [ ] `NetworkTaskRepositoryTests.swift`
- [ ] `NetworkChatRepositoryTests.swift`

**Priority 4 - Utilities**:
- [ ] `NetworkUtilitiesTests.swift` - Retry logic, timeout handling
- [ ] `OfflineQueueTests.swift` - Queue operations
- [ ] `SyncEngineTests.swift` - Sync logic

## Writing Tests

### Basic Test Structure

```swift
import XCTest
@testable import TideApp

final class MyComponentTests: XCTestCase {
    // Setup before each test
    override func setUp() async throws {
        // Initialize test dependencies
    }

    // Cleanup after each test
    override func tearDown() async throws {
        // Clean up test state
    }

    // Test naming: test<WhatYouAreTesting>
    func testMyFeature() {
        // Given: Setup test conditions
        let input = "test"

        // When: Execute the code being tested
        let result = someFunction(input)

        // Then: Verify the results
        XCTAssertEqual(result, expectedValue)
    }
}
```

### Testing ViewModels

Use mock dependencies for isolation:

```swift
@MainActor
final class EmailInboxViewModelTests: XCTestCase {
    var viewModel: EmailInboxViewModel!
    var mockAPIClient: MockAPIClient!

    override func setUp() async throws {
        mockAPIClient = MockAPIClient()
        viewModel = EmailInboxViewModel(
            apiClient: mockAPIClient,
            authManager: MockAuthManager()
        )
    }

    func testLoadEmails() async {
        // Given: Mock data
        mockAPIClient.mockEmails = [/* test emails */]

        // When: Loading emails
        await viewModel.loadEmails()

        // Then: Verify state
        XCTAssertEqual(viewModel.emails.count, expectedCount)
        XCTAssertFalse(viewModel.isLoading)
    }
}
```

### Testing Async Code

Use `async` tests for async operations:

```swift
func testAsyncOperation() async {
    // When: Calling async function
    let result = await asyncFunction()

    // Then: Verify result
    XCTAssertNotNil(result)
}
```

### Testing Errors

```swift
func testErrorHandling() async {
    // Given: Setup to trigger error
    mockAPIClient.shouldFail = true

    // When: Executing operation
    await viewModel.performAction()

    // Then: Verify error is handled
    XCTAssertNotNil(viewModel.error)
    XCTAssertTrue(viewModel.showError)
}
```

## Running Tests

### From Xcode
1. Select Product > Test (⌘U)
2. Or click the test diamond next to a test method/class

### From Command Line
```bash
xcodebuild test \
  -workspace TideApp.xcworkspace \
  -scheme TideApp \
  -destination 'platform=iOS Simulator,name=iPhone 15 Pro'
```

### Run Specific Test Class
```bash
xcodebuild test \
  -workspace TideApp.xcworkspace \
  -scheme TideApp \
  -only-testing:TideAppTests/JWTDecoderTests
```

## Coverage Goals

- **Sprint 1-2**: 20% coverage (Core services)
- **Sprint 3-4**: 35% coverage (+ ViewModels)
- **Sprint 5-6**: 50% coverage (+ Repositories)
- **Sprint 7-8**: 60% coverage (+ Utilities + UI tests)

## Best Practices

1. **Test One Thing**: Each test should verify one specific behavior
2. **Use Given-When-Then**: Structure tests clearly
3. **Mock Dependencies**: Isolate the unit being tested
4. **Meaningful Names**: Test names should describe what they test
5. **Fast Tests**: Keep tests fast by using mocks, not real API calls
6. **Independent Tests**: Tests should not depend on each other
7. **Clean Up**: Always clean up test state in `tearDown()`

## CI/CD Integration

Tests will run automatically on:
- Every pull request
- Before merging to main
- On main branch commits

## Resources

- [XCTest Documentation](https://developer.apple.com/documentation/xctest)
- [Testing Guide](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/testing)
- [Async Testing in Swift](https://www.swift.org/blog/concurrency/)

---

**Last Updated**: October 8, 2025
**Status**: Foundation Complete - Comprehensive Suite Planned Post-1.0
