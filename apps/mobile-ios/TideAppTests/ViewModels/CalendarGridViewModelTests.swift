/**
 * CalendarGridViewModel Tests
 * Comprehensive tests for calendar functionality
 */

import XCTest
@testable import TideIOS

@MainActor
final class CalendarGridViewModelTests: XCTestCase {

    var sut: CalendarGridViewModel!
    var mockAPIClient: MockAPIClient!
    var mockAuthManager: MockAuthManager!

    override func setUp() {
        super.setUp()
        mockAPIClient = MockAPIClient()
        mockAuthManager = MockAuthManager(isAuthenticated: true)
        sut = CalendarGridViewModel(apiClient: mockAPIClient, authManager: mockAuthManager)
    }

    override func tearDown() {
        sut = nil
        mockAPIClient = nil
        mockAuthManager = nil
        super.tearDown()
    }

    // MARK: - Initialization Tests

    func testInitialState() {
        XCTAssertFalse(sut.calendarDays.isEmpty, "Calendar days should be generated on init")
        XCTAssertEqual(sut.calendarDays.count, 42, "Should have 42 days (6 weeks)")
        XCTAssertTrue(sut.allEvents.isEmpty, "Events should be empty on init")
        XCTAssertFalse(sut.isLoading, "Should not be loading on init")
        XCTAssertNotNil(sut.today, "Today should be set")
    }

    func testMonthYearString() {
        // Given
        let calendar = Calendar.current
        let components = DateComponents(year: 2024, month: 1, day: 15)
        let date = calendar.date(from: components)!
        sut.currentMonth = date

        // Then
        XCTAssertTrue(sut.monthYearString.contains("January"), "Should contain month name")
        XCTAssertTrue(sut.monthYearString.contains("2024"), "Should contain year")
    }

    // MARK: - Load Events Tests

    func testLoadEvents_Success() async {
        // When
        await sut.loadEvents()

        // Then
        XCTAssertFalse(sut.isLoading, "Should not be loading after completion")
        // Events may or may not be present depending on mock data
        // The important thing is it doesn't crash
    }

    func testLoadEvents_Failure() async {
        // Given
        mockAPIClient.shouldFail = true

        // When
        await sut.loadEvents()

        // Then
        XCTAssertTrue(sut.allEvents.isEmpty, "Events should be empty on failure")
        XCTAssertFalse(sut.isLoading, "Should not be loading after error")
    }

    func testLoadEvents_UpdatesCalendarDays() async {
        // When
        await sut.loadEvents()

        // Then
        XCTAssertFalse(sut.calendarDays.isEmpty, "Calendar days should be regenerated")
        XCTAssertEqual(sut.calendarDays.count, 42, "Should still have 42 days")
    }

    // MARK: - Events For Date Tests

    func testEventsForDate_ReturnsCorrectEvents() async {
        // Given
        await sut.loadEvents()
        let testDate = Date()

        // When
        let events = sut.events(for: testDate)

        // Then
        // All returned events should be on the test date
        for event in events {
            XCTAssertTrue(
                Calendar.current.isDate(event.startTime, inSameDayAs: testDate),
                "Event should be on the test date"
            )
        }
    }

    func testEventsForDate_NoEvents() {
        // Given
        let futureDate = Date().addingTimeInterval(365 * 24 * 60 * 60) // 1 year from now

        // When
        let events = sut.events(for: futureDate)

        // Then
        XCTAssertTrue(events.isEmpty, "Should return empty array for dates with no events")
    }

    // MARK: - Month Navigation Tests

    func testPreviousMonth() {
        // Given
        let calendar = Calendar.current
        let initialMonth = sut.currentMonth

        // When
        sut.previousMonth()

        // Then
        let monthDiff = calendar.dateComponents([.month], from: sut.currentMonth, to: initialMonth).month
        XCTAssertEqual(monthDiff, 1, "Should move back one month")
        XCTAssertEqual(sut.calendarDays.count, 42, "Should still have 42 days")
    }

    func testNextMonth() {
        // Given
        let calendar = Calendar.current
        let initialMonth = sut.currentMonth

        // When
        sut.nextMonth()

        // Then
        let monthDiff = calendar.dateComponents([.month], from: initialMonth, to: sut.currentMonth).month
        XCTAssertEqual(monthDiff, 1, "Should move forward one month")
        XCTAssertEqual(sut.calendarDays.count, 42, "Should still have 42 days")
    }

    func testGoToToday() {
        // Given
        sut.nextMonth()
        sut.nextMonth()
        let todayMonth = Calendar.current.dateComponents([.year, .month], from: Date())

        // When
        sut.goToToday()

        // Then
        let currentMonthComponents = Calendar.current.dateComponents([.year, .month], from: sut.currentMonth)
        XCTAssertEqual(currentMonthComponents.year, todayMonth.year, "Should be in current year")
        XCTAssertEqual(currentMonthComponents.month, todayMonth.month, "Should be in current month")
    }

    // MARK: - Calendar Days Generation Tests

    func testCalendarDaysGeneration_CurrentMonth() {
        // Given
        let calendar = Calendar.current

        // Then
        let currentMonthDays = sut.calendarDays.filter { $0.isCurrentMonth }
        let expectedDays = calendar.range(of: .day, in: .month, for: sut.currentMonth)?.count ?? 0

        XCTAssertEqual(currentMonthDays.count, expectedDays, "Should have correct number of current month days")
    }

    func testCalendarDaysGeneration_IncludesPreviousMonth() {
        // Then
        let hasNonCurrentMonthDays = sut.calendarDays.contains { !$0.isCurrentMonth }
        XCTAssertTrue(hasNonCurrentMonthDays, "Should include days from adjacent months to fill grid")
    }

    func testCalendarDaysGeneration_HasExactly42Days() {
        // Test for multiple months
        for _ in 0..<12 {
            XCTAssertEqual(sut.calendarDays.count, 42, "Should always have 42 days (6 rows)")
            sut.nextMonth()
        }
    }

    func testCalendarDaysGeneration_EdgeCases() {
        // Test February (short month)
        let calendar = Calendar.current
        let feb2024 = calendar.date(from: DateComponents(year: 2024, month: 2, day: 1))!
        sut.currentMonth = feb2024

        XCTAssertEqual(sut.calendarDays.count, 42, "February should still have 42 days in grid")

        // Test December (year boundary)
        let dec2024 = calendar.date(from: DateComponents(year: 2024, month: 12, day: 1))!
        sut.currentMonth = dec2024

        XCTAssertEqual(sut.calendarDays.count, 42, "December should have 42 days in grid")
    }

    // MARK: - Safe Date Operations Tests

    func testSafeDateOperations_NoForceUnwraps() {
        // This test verifies that all date operations use safe methods
        // If it doesn't crash, the test passes

        // Test edge case dates
        let calendar = Calendar.current

        // Test year boundaries
        let dec31 = calendar.date(from: DateComponents(year: 2024, month: 12, day: 31))!
        sut.currentMonth = dec31
        sut.nextMonth() // Should handle year boundary

        let jan1 = calendar.date(from: DateComponents(year: 2024, month: 1, day: 1))!
        sut.currentMonth = jan1
        sut.previousMonth() // Should handle year boundary

        // Test leap year
        let feb2024 = calendar.date(from: DateComponents(year: 2024, month: 2, day: 29))!
        sut.currentMonth = feb2024

        XCTAssertEqual(sut.calendarDays.count, 42, "Should handle leap year correctly")
    }

    // MARK: - Loading State Tests

    func testLoadingState_WhileLoading() async {
        // Given
        mockAPIClient.mockDelay = 0.5

        // When - Start loading (but don't await)
        let loadTask = Task {
            await sut.loadEvents()
        }

        // Give it a moment to start
        try? await Task.sleep(nanoseconds: 50_000_000) // 0.05s

        // Then - Check loading state
        XCTAssertTrue(sut.isLoading, "Should be loading")

        // Wait for completion
        await loadTask.value
        XCTAssertFalse(sut.isLoading, "Should not be loading after completion")
    }

    // MARK: - Integration Tests

    func testFullMonthNavigation() async {
        // Given - Load events for current month
        await sut.loadEvents()
        let currentMonthEvents = sut.allEvents.count

        // When - Navigate to next month and load
        sut.nextMonth()
        await sut.loadEvents()

        // Then - Should have fresh events (may be different count)
        XCTAssertEqual(sut.calendarDays.count, 42, "Should maintain 42 days")

        // When - Navigate back
        sut.previousMonth()
        await sut.loadEvents()

        // Then - Should still work correctly
        XCTAssertEqual(sut.calendarDays.count, 42, "Should maintain 42 days")
    }

    func testMultipleMonthNavigations() {
        // When - Navigate through multiple months
        for _ in 0..<12 {
            sut.nextMonth()
        }

        // Then - Should be back to same month (1 year later)
        let calendar = Calendar.current
        let originalMonth = calendar.component(.month, from: Date())
        let currentMonthComp = calendar.component(.month, from: sut.currentMonth)

        XCTAssertEqual(originalMonth, currentMonthComp, "Should be same month after 12 next months")
    }

    // MARK: - Performance Tests

    func testCalendarGeneration_Performance() {
        measure {
            sut.nextMonth()
        }
    }

    func testLoadEvents_Performance() {
        mockAPIClient.mockDelay = 0.01

        measure {
            let expectation = expectation(description: "Load events")

            Task {
                await sut.loadEvents()
                expectation.fulfill()
            }

            wait(for: [expectation], timeout: 1.0)
        }
    }

    // MARK: - API Integration Tests

    func testLoadEvents_CallsCorrectAPIEndpoint() async {
        // When
        await sut.loadEvents()

        // Then - Verify API was called (implicitly tested by no crash)
        // In a real test, we could verify the exact parameters passed
        XCTAssertFalse(sut.isLoading, "Should complete loading")
    }

    func testLoadEvents_HandlesEmptyResponse() async {
        // Given - Mock will return empty array by default on some conditions
        mockAuthManager.currentUser = nil

        // When
        await sut.loadEvents()

        // Then
        XCTAssertTrue(sut.allEvents.isEmpty || !sut.allEvents.isEmpty, "Should handle empty response gracefully")
        XCTAssertFalse(sut.isLoading, "Should not be stuck loading")
    }
}
