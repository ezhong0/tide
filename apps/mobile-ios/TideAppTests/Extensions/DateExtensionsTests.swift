/**
 * Date Extensions Tests
 * Comprehensive tests for Date+Tide.swift
 */

import XCTest
@testable import TideApp

class DateExtensionsTests: XCTestCase {
    let calendar = Calendar.current

    // MARK: - Safe Arithmetic Tests

    func testAddingDoesNotCrash() {
        let date = Date()
        let nextMonth = date.adding(.month, value: 1)
        XCTAssertNotNil(nextMonth)
        XCTAssertNotEqual(date, nextMonth)
    }

    func testAddingNegativeValue() {
        let date = Date()
        let yesterday = date.adding(.day, value: -1)
        XCTAssertLessThan(yesterday, date)
    }

    func testAddingZeroValue() {
        let date = Date()
        let sameDate = date.adding(.day, value: 0)
        XCTAssertEqual(date.timeIntervalSince1970, sameDate.timeIntervalSince1970, accuracy: 1.0)
    }

    func testAddingLargeValue() {
        let date = Date()
        let future = date.adding(.year, value: 100)
        XCTAssertGreaterThan(future, date)
    }

    // MARK: - Calendar Helper Tests

    func testStartOfDay() {
        let date = Date()
        let startOfDay = date.startOfDay()

        let components = calendar.dateComponents([.hour, .minute, .second], from: startOfDay)
        XCTAssertEqual(components.hour, 0)
        XCTAssertEqual(components.minute, 0)
        XCTAssertEqual(components.second, 0)
    }

    func testStartOfMonth() {
        let date = DateComponents(year: 2025, month: 10, day: 15)
        let testDate = calendar.date(from: date)!
        let start = testDate.startOfMonth()

        XCTAssertNotNil(start)
        let components = calendar.dateComponents([.day], from: start!)
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

    func testStartOfWeek() {
        let date = Date()
        let startOfWeek = date.startOfWeek()
        XCTAssertNotNil(startOfWeek)

        // Start of week should be earlier or same as the date
        XCTAssertLessThanOrEqual(startOfWeek, date)
    }

    func testEndOfWeek() {
        let date = Date()
        let endOfWeek = date.endOfWeek()
        XCTAssertNotNil(endOfWeek)

        // End of week should be later or same as the date
        XCTAssertGreaterThanOrEqual(endOfWeek, date)
    }

    // MARK: - Comparison Tests

    func testIsSameDay() {
        let date1 = DateComponents(year: 2025, month: 10, day: 8, hour: 10)
        let date2 = DateComponents(year: 2025, month: 10, day: 8, hour: 15)

        let d1 = calendar.date(from: date1)!
        let d2 = calendar.date(from: date2)!

        XCTAssertTrue(d1.isSameDay(as: d2))
    }

    func testIsNotSameDay() {
        let date1 = DateComponents(year: 2025, month: 10, day: 8)
        let date2 = DateComponents(year: 2025, month: 10, day: 9)

        let d1 = calendar.date(from: date1)!
        let d2 = calendar.date(from: date2)!

        XCTAssertFalse(d1.isSameDay(as: d2))
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

    func testIsSameWeek() {
        let date = Date()
        let sameDayNextHour = date.adding(.hour, value: 1)

        XCTAssertTrue(date.isSameWeek(as: sameDayNextHour))
    }

    func testIsToday() {
        let now = Date()
        XCTAssertTrue(now.isToday)

        let yesterday = now.adding(.day, value: -1)
        XCTAssertFalse(yesterday.isToday)
    }

    func testIsPast() {
        let yesterday = Date().adding(.day, value: -1)
        XCTAssertTrue(yesterday.isPast)

        let future = Date().adding(.day, value: 1)
        XCTAssertFalse(future.isPast)
    }

    func testIsFuture() {
        let tomorrow = Date().adding(.day, value: 1)
        XCTAssertTrue(tomorrow.isFuture)

        let yesterday = Date().adding(.day, value: -1)
        XCTAssertFalse(yesterday.isFuture)
    }

    // MARK: - Calendar Day Generation Tests

    func testMonthGridDatesReturns42Days() {
        let date = DateComponents(year: 2025, month: 10, day: 1)
        let testDate = calendar.date(from: date)!

        let days = testDate.monthGridDates()
        XCTAssertEqual(days.count, 42)
    }

    func testWeekDatesReturns7Days() {
        let date = Date()
        let days = date.weekDates()
        XCTAssertEqual(days.count, 7)
    }

    func testGenerateMonthDaysReturns42Days() {
        let date = DateComponents(year: 2025, month: 10, day: 1)
        let testDate = calendar.date(from: date)!

        let days = calendar.generateMonthDays(for: testDate)
        XCTAssertEqual(days.count, 42)
    }

    func testGenerateMonthDaysIncludesOctober1() {
        let date = DateComponents(year: 2025, month: 10, day: 15)
        let testDate = calendar.date(from: date)!

        let days = calendar.generateMonthDays(for: testDate)

        let oct1 = DateComponents(year: 2025, month: 10, day: 1)
        let oct1Date = calendar.date(from: oct1)!

        let containsOct1 = days.contains { $0.date.isSameDay(as: oct1Date) }
        XCTAssertTrue(containsOct1)
    }

    func testGenerateMonthDaysMarksCurrentMonth() {
        let date = DateComponents(year: 2025, month: 10, day: 15)
        let testDate = calendar.date(from: date)!

        let days = calendar.generateMonthDays(for: testDate)

        let octoberDays = days.filter { $0.isCurrentMonth }
        XCTAssertEqual(octoberDays.count, 31)
    }

    func testGenerateMonthDaysMarksTodayCorrectly() {
        let today = Date()
        let days = calendar.generateMonthDays(for: today)

        let todayDays = days.filter { $0.isToday }
        XCTAssertEqual(todayDays.count, 1)

        XCTAssertTrue(todayDays[0].date.isSameDay(as: today))
    }

    func testGenerateMonthDaysMarksWeekends() {
        let date = DateComponents(year: 2025, month: 10, day: 15)
        let testDate = calendar.date(from: date)!

        let days = calendar.generateMonthDays(for: testDate)

        let weekendDays = days.filter { $0.isWeekend }
        XCTAssertGreaterThan(weekendDays.count, 0)

        // Check that weekend days are actually Saturday or Sunday
        for day in weekendDays {
            let weekday = calendar.component(.weekday, from: day.date)
            XCTAssertTrue(weekday == 1 || weekday == 7)
        }
    }

    func testGenerateWeekDaysReturns7Days() {
        let date = Date()
        let days = calendar.generateWeekDays(for: date)
        XCTAssertEqual(days.count, 7)
    }

    // MARK: - CalendarDay Model Tests

    func testCalendarDayInitialization() {
        let date = Date()
        let currentMonth = date.startOfMonth() ?? date
        let calendarDay = CalendarDay(date: date, currentMonth: currentMonth, selectedDate: nil)

        XCTAssertEqual(calendarDay.date, date)
        XCTAssertTrue(calendarDay.isCurrentMonth)
        XCTAssertFalse(calendarDay.isSelected)
    }

    func testCalendarDaySelectedState() {
        let date = Date()
        let currentMonth = date.startOfMonth() ?? date
        let calendarDay = CalendarDay(date: date, currentMonth: currentMonth, selectedDate: date)

        XCTAssertTrue(calendarDay.isSelected)
    }

    // MARK: - Edge Case Tests

    func testDSTTransition() {
        // Test around DST transition (varies by timezone, but shouldn't crash)
        let dstDate = DateComponents(year: 2025, month: 3, day: 9)
        let date = calendar.date(from: dstDate)!

        let nextDay = date.adding(.day, value: 1)
        let prevDay = date.adding(.day, value: -1)

        XCTAssertNotNil(nextDay)
        XCTAssertNotNil(prevDay)
        XCTAssertGreaterThan(nextDay, date)
        XCTAssertLessThan(prevDay, date)
    }

    func testLeapYearEdgeCases() {
        // February 29, 2024 (leap year)
        let feb29 = DateComponents(year: 2024, month: 2, day: 29)
        let leapDate = calendar.date(from: feb29)!

        // Add a year (should handle going to non-leap year)
        let nextYear = leapDate.adding(.year, value: 1)
        XCTAssertNotNil(nextYear)

        // The result should be in 2025
        let components = calendar.dateComponents([.year, .month], from: nextYear)
        XCTAssertEqual(components.year, 2025)
        // Could be Feb 28 or March 1 depending on implementation
        XCTAssertTrue(components.month == 2 || components.month == 3)
    }

    func testEndOfYearTransition() {
        let dec31 = DateComponents(year: 2024, month: 12, day: 31)
        let date = calendar.date(from: dec31)!

        let nextDay = date.adding(.day, value: 1)
        let components = calendar.dateComponents([.year, .month, .day], from: nextDay)

        XCTAssertEqual(components.year, 2025)
        XCTAssertEqual(components.month, 1)
        XCTAssertEqual(components.day, 1)
    }

    // MARK: - Component Extraction Tests

    func testDayExtraction() {
        let dateComponents = DateComponents(year: 2025, month: 10, day: 15)
        let date = calendar.date(from: dateComponents)!

        XCTAssertEqual(date.day(), 15)
    }

    func testMonthExtraction() {
        let dateComponents = DateComponents(year: 2025, month: 10, day: 15)
        let date = calendar.date(from: dateComponents)!

        XCTAssertEqual(date.month(), 10)
    }

    func testYearExtraction() {
        let dateComponents = DateComponents(year: 2025, month: 10, day: 15)
        let date = calendar.date(from: dateComponents)!

        XCTAssertEqual(date.year(), 2025)
    }

    // MARK: - DateRange Tests

    func testDateRangeContains() {
        let start = Date()
        let end = start.adding(.day, value: 7)
        let range = DateRange(start: start, end: end)

        let middleDate = start.adding(.day, value: 3)
        XCTAssertTrue(range.contains(middleDate))

        let outsideDate = start.adding(.day, value: -1)
        XCTAssertFalse(range.contains(outsideDate))
    }

    func testDateRangeOverlaps() {
        let start1 = Date()
        let end1 = start1.adding(.day, value: 7)
        let range1 = DateRange(start: start1, end: end1)

        let start2 = start1.adding(.day, value: 3)
        let end2 = start2.adding(.day, value: 7)
        let range2 = DateRange(start: start2, end: end2)

        XCTAssertTrue(range1.overlaps(with: range2))

        let start3 = start1.adding(.day, value: 10)
        let end3 = start3.adding(.day, value: 7)
        let range3 = DateRange(start: start3, end: end3)

        XCTAssertFalse(range1.overlaps(with: range3))
    }

    func testDateRangeDurationInDays() {
        let start = Date()
        let end = start.adding(.day, value: 6)
        let range = DateRange(start: start, end: end)

        XCTAssertEqual(range.durationInDays(), 7)
    }

    func testDateRangeDates() {
        let start = Date().startOfDay()
        let end = start.adding(.day, value: 2)
        let range = DateRange(start: start, end: end)

        let dates = range.dates()
        XCTAssertEqual(dates.count, 3)
    }

    // MARK: - Formatting Tests

    func testRelativeDescription() {
        let today = Date()
        XCTAssertEqual(today.relativeDescription, "Today")

        let yesterday = today.adding(.day, value: -1)
        XCTAssertEqual(yesterday.relativeDescription, "Yesterday")

        let tomorrow = today.adding(.day, value: 1)
        XCTAssertEqual(tomorrow.relativeDescription, "Tomorrow")
    }

    // MARK: - Performance Tests

    func testMonthGridGenerationPerformance() {
        let date = Date()

        measure {
            for _ in 0..<100 {
                _ = calendar.generateMonthDays(for: date)
            }
        }
    }

    func testDateAdditionPerformance() {
        let date = Date()

        measure {
            for i in 0..<1000 {
                _ = date.adding(.day, value: i)
            }
        }
    }
}
