/**
 * Date Extensions
 * Common date formatting utilities for Tide
 */

import Foundation

extension Date {
    /// Returns a relative time string (e.g., "Just now", "5m ago", "2h ago", "3d ago")
    var timeAgo: String {
        let interval = Date().timeIntervalSince(self)

        if interval < 60 {
            return "Just now"
        } else if interval < 3600 {
            let minutes = Int(interval / 60)
            return "\(minutes)m ago"
        } else if interval < 86400 {
            let hours = Int(interval / 3600)
            return "\(hours)h ago"
        } else {
            let days = Int(interval / 86400)
            return "\(days)d ago"
        }
    }

    /// Returns a short relative time string (e.g., "Now", "5m", "2h", "3d")
    var timeAgoShort: String {
        let interval = Date().timeIntervalSince(self)

        if interval < 60 {
            return "Now"
        } else if interval < 3600 {
            let minutes = Int(interval / 60)
            return "\(minutes)m"
        } else if interval < 86400 {
            let hours = Int(interval / 3600)
            return "\(hours)h"
        } else {
            let days = Int(interval / 86400)
            return "\(days)d"
        }
    }

    /// Returns a localized relative date string using RelativeDateTimeFormatter
    var relative: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: self, relativeTo: Date())
    }

    /// Returns ISO8601 formatted string
    var iso8601: String {
        ISO8601DateFormatter().string(from: self)
    }

    // MARK: - Safe Calendar Operations

    /// Safely add components to date, returning nil if calculation fails
    func safeAdd(_ component: Calendar.Component, value: Int, calendar: Calendar = .current) -> Date? {
        return calendar.date(byAdding: component, value: value, to: self)
    }

    /// Safely set time components, returning nil if calculation fails
    func safeSet(hour: Int, minute: Int, second: Int, calendar: Calendar = .current) -> Date? {
        return calendar.date(bySettingHour: hour, minute: minute, second: second, of: self)
    }

    /// Safely get date from components, returning default date if calculation fails
    static func safeFrom(components: DateComponents, calendar: Calendar = .current, default defaultDate: Date = Date()) -> Date {
        return calendar.date(from: components) ?? defaultDate
    }

    /// Get start of month, safely
    func startOfMonth(calendar: Calendar = .current) -> Date? {
        let components = calendar.dateComponents([.year, .month], from: self)
        return calendar.date(from: components)
    }

    /// Get number of days in month, safely
    func daysInMonth(calendar: Calendar = .current) -> Int {
        guard let range = calendar.range(of: .day, in: .month, for: self) else {
            return 30 // Default fallback
        }
        return range.count
    }

    /// Check if date is same day as another date
    func isSameDay(as date: Date, calendar: Calendar = .current) -> Bool {
        return calendar.isDate(self, inSameDayAs: date)
    }

    /// Get start of day
    func startOfDay(calendar: Calendar = .current) -> Date {
        return calendar.startOfDay(for: self)
    }

    // MARK: - Additional Safe Calendar Operations (No Optionals)

    /// Safely add components to date with fallback (never returns nil)
    func adding(_ component: Calendar.Component, value: Int, calendar: Calendar = .current) -> Date {
        return calendar.date(byAdding: component, value: value, to: self) ?? self
    }

    /// Get end of day (23:59:59)
    func endOfDay(calendar: Calendar = .current) -> Date {
        return adding(.day, value: 1, calendar: calendar).startOfDay(calendar: calendar).adding(.second, value: -1, calendar: calendar)
    }

    /// Get start of week
    func startOfWeek(calendar: Calendar = .current) -> Date {
        let components = calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: self)
        return calendar.date(from: components) ?? self
    }

    /// Get end of week
    func endOfWeek(calendar: Calendar = .current) -> Date {
        return startOfWeek(calendar: calendar).adding(.day, value: 6, calendar: calendar).endOfDay(calendar: calendar)
    }

    /// Get end of month
    func endOfMonth(calendar: Calendar = .current) -> Date {
        guard let start = startOfMonth(calendar: calendar) else { return self }
        let nextMonth = start.adding(.month, value: 1, calendar: calendar)
        return nextMonth.adding(.second, value: -1, calendar: calendar)
    }

    /// Get weekday (1 = Sunday, 7 = Saturday)
    func weekday(calendar: Calendar = .current) -> Int {
        return calendar.component(.weekday, from: self)
    }

    /// Generate all dates for a calendar month grid (6 weeks × 7 days = 42 dates)
    func monthGridDates(calendar: Calendar = .current) -> [Date] {
        guard let startOfMonth = startOfMonth(calendar: calendar) else {
            return []
        }

        let firstWeekday = startOfMonth.weekday(calendar: calendar)
        let gridStartDate = startOfMonth.adding(.day, value: -(firstWeekday - 1), calendar: calendar)

        return (0..<42).map { offset in
            gridStartDate.adding(.day, value: offset, calendar: calendar)
        }
    }

    /// Generate all dates for the current week
    func weekDates(calendar: Calendar = .current) -> [Date] {
        let startOfWeek = self.startOfWeek(calendar: calendar)
        return (0..<7).map { offset in
            startOfWeek.adding(.day, value: offset, calendar: calendar)
        }
    }

    /// Check if date is in same month as another date
    func isSameMonth(as other: Date, calendar: Calendar = .current) -> Bool {
        let components1 = calendar.dateComponents([.year, .month], from: self)
        let components2 = calendar.dateComponents([.year, .month], from: other)
        return components1.year == components2.year && components1.month == components2.month
    }

    /// Check if date is in same week as another date
    func isSameWeek(as other: Date, calendar: Calendar = .current) -> Bool {
        let components1 = calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: self)
        let components2 = calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: other)
        return components1.yearForWeekOfYear == components2.yearForWeekOfYear &&
               components1.weekOfYear == components2.weekOfYear
    }

    /// Check if this date is today
    var isToday: Bool {
        return isSameDay(as: Date())
    }

    /// Check if this date is in the past
    var isPast: Bool {
        return self < Date().startOfDay()
    }

    /// Check if this date is in the future
    var isFuture: Bool {
        return self > Date().endOfDay()
    }

    /// Format date for display
    func formatted(dateStyle: DateFormatter.Style = .medium, timeStyle: DateFormatter.Style = .none) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = dateStyle
        formatter.timeStyle = timeStyle
        return formatter.string(from: self)
    }

    /// Relative date description (Today, Yesterday, Tomorrow, or formatted)
    var relativeDescription: String {
        if isToday {
            return "Today"
        } else if isSameDay(as: Date().adding(.day, value: -1)) {
            return "Yesterday"
        } else if isSameDay(as: Date().adding(.day, value: 1)) {
            return "Tomorrow"
        } else {
            return formatted()
        }
    }

    // MARK: - Component Extraction

    /// Get day of month (1-31)
    func day(calendar: Calendar = .current) -> Int {
        return calendar.component(.day, from: self)
    }

    /// Get month (1-12)
    func month(calendar: Calendar = .current) -> Int {
        return calendar.component(.month, from: self)
    }

    /// Get year
    func year(calendar: Calendar = .current) -> Int {
        return calendar.component(.year, from: self)
    }

    /// Get hour (0-23)
    func hour(calendar: Calendar = .current) -> Int {
        return calendar.component(.hour, from: self)
    }

    /// Get minute (0-59)
    func minute(calendar: Calendar = .current) -> Int {
        return calendar.component(.minute, from: self)
    }
}

// MARK: - Calendar Day Model

/// Represents a day in a calendar grid
struct CalendarDay: Identifiable {
    let id = UUID()
    let date: Date
    let isToday: Bool
    let isCurrentMonth: Bool
    let isSelected: Bool
    let isWeekend: Bool

    init(date: Date, currentMonth: Date, selectedDate: Date?, calendar: Calendar = .current) {
        self.date = date
        self.isToday = calendar.isDateInToday(date)
        self.isCurrentMonth = date.isSameMonth(as: currentMonth, calendar: calendar)
        self.isSelected = selectedDate.map { date.isSameDay(as: $0, calendar: calendar) } ?? false

        let weekday = calendar.component(.weekday, from: date)
        self.isWeekend = weekday == 1 || weekday == 7 // Sunday or Saturday
    }
}

// MARK: - Calendar Extensions

extension Calendar {
    /// Safely generate days for a month grid (including padding from prev/next months)
    /// Returns 42 days (6 weeks) for consistent grid display
    func generateMonthDays(for date: Date, selectedDate: Date? = nil) -> [CalendarDay] {
        guard let startOfMonth = date.startOfMonth(calendar: self) else {
            return []
        }

        // Find the first day to display (could be from previous month)
        let firstWeekday = component(.weekday, from: startOfMonth)
        let daysFromPrevMonth = firstWeekday - self.firstWeekday
        let firstDisplayDate = startOfMonth.adding(.day, value: -daysFromPrevMonth, calendar: self)

        // Generate 42 days (6 weeks) for consistent grid
        var days: [CalendarDay] = []
        var currentDate = firstDisplayDate

        for _ in 0..<42 {
            days.append(CalendarDay(date: currentDate, currentMonth: date, selectedDate: selectedDate, calendar: self))
            currentDate = currentDate.adding(.day, value: 1, calendar: self)
        }

        return days
    }

    /// Safely generate week days for a given date
    func generateWeekDays(for date: Date, selectedDate: Date? = nil) -> [CalendarDay] {
        let startOfWeek = date.startOfWeek(calendar: self)
        var days: [CalendarDay] = []
        var currentDate = startOfWeek

        for _ in 0..<7 {
            days.append(CalendarDay(date: currentDate, currentMonth: date, selectedDate: selectedDate, calendar: self))
            currentDate = currentDate.adding(.day, value: 1, calendar: self)
        }

        return days
    }

    /// Get weekday symbols starting from first day of week
    var orderedWeekdaySymbols: [String] {
        let symbols = shortWeekdaySymbols
        let firstWeekdayIndex = firstWeekday - 1
        return Array(symbols[firstWeekdayIndex...]) + Array(symbols[..<firstWeekdayIndex])
    }
}

// MARK: - Date Range

/// Represents a date range
struct DateRange {
    let start: Date
    let end: Date

    /// Check if a date falls within this range
    func contains(_ date: Date) -> Bool {
        return date >= start && date <= end
    }

    /// Check if this range overlaps with another range
    func overlaps(with other: DateRange) -> Bool {
        return start <= other.end && end >= other.start
    }

    /// Get all dates in the range
    func dates(calendar: Calendar = .current) -> [Date] {
        var dates: [Date] = []
        var currentDate = start.startOfDay(calendar: calendar)
        let endDate = end.startOfDay(calendar: calendar)

        while currentDate <= endDate {
            dates.append(currentDate)
            currentDate = currentDate.adding(.day, value: 1, calendar: calendar)
        }

        return dates
    }

    /// Duration in days
    func durationInDays(calendar: Calendar = .current) -> Int {
        let components = calendar.dateComponents([.day], from: start.startOfDay(calendar: calendar), to: end.startOfDay(calendar: calendar))
        return (components.day ?? 0) + 1
    }
}
