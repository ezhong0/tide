/**
 * Calendar Grid View Model
 * Handles calendar display, navigation, and event loading
 */

import Foundation
import Combine

@MainActor
class CalendarGridViewModel: ObservableObject {
    @Published var calendarDays: [CalendarDay] = []
    @Published var allEvents: [CalendarEvent] = []
    @Published var currentMonth: Date
    @Published var isLoading = false
    @Published var error: String?

    let today: Date
    private let calendar = Calendar.current
    private let apiClient: APIClientProtocol
    private let authManager: AuthManagerProtocol

    // MARK: - Initialization

    init(apiClient: APIClientProtocol, authManager: AuthManagerProtocol) {
        self.apiClient = apiClient
        self.authManager = authManager
        self.today = Date()
        self.currentMonth = Date()
        generateCalendarDays()
    }

    // MARK: - Computed Properties

    var monthYearString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM yyyy"
        return formatter.string(from: currentMonth)
    }

    // MARK: - Event Loading

    func loadEvents() async {
        isLoading = true
        defer { isLoading = false }

        do {
            // Calculate start and end of month for API call
            guard let startOfMonth = currentMonth.startOfMonth(calendar: calendar),
                  let endOfMonth = currentMonth.endOfMonth(calendar: calendar) else {
                print("⚠️ Failed to calculate month boundaries")
                error = "Failed to calculate month boundaries"
                return
            }

            // Fetch real events from API
            let fetchedEvents = try await apiClient.getCalendarEvents(
                startDate: startOfMonth,
                endDate: endOfMonth
            )

            // Convert API events to local CalendarEvent model
            allEvents = fetchedEvents.map { apiEvent in
                CalendarEvent(
                    id: apiEvent.id,
                    title: apiEvent.title,
                    startTime: apiEvent.startTime,
                    endTime: apiEvent.endTime,
                    location: apiEvent.location,
                    description: nil,
                    attendees: nil,
                    color: .blue, // TODO: Add color logic based on event type
                    hasConflict: false, // TODO: Check for conflicts
                    hasPrep: false,
                    meetingPrep: nil
                )
            }

            // Regenerate calendar days with new events
            generateCalendarDays()
            error = nil

        } catch {
            print("Error loading events: \(error)")
            self.error = "Failed to load events"
            allEvents = []
            generateCalendarDays()
        }
    }

    // MARK: - Event Filtering

    func events(for date: Date) -> [CalendarEvent] {
        return allEvents.filter { event in
            calendar.isDate(event.startTime, inSameDayAs: date)
        }.sorted { $0.startTime < $1.startTime }
    }

    // MARK: - Month Navigation

    func previousMonth() {
        guard let newMonth = currentMonth.safeAdd(.month, value: -1, calendar: calendar) else {
            print("⚠️ Failed to navigate to previous month")
            return
        }
        currentMonth = newMonth
        generateCalendarDays()
    }

    func nextMonth() {
        guard let newMonth = currentMonth.safeAdd(.month, value: 1, calendar: calendar) else {
            print("⚠️ Failed to navigate to next month")
            return
        }
        currentMonth = newMonth
        generateCalendarDays()
    }

    func goToToday() {
        currentMonth = today
        generateCalendarDays()
    }

    // MARK: - Calendar Generation

    func generateCalendarDays() {
        calendarDays = []

        // Get first day of the month
        guard let startOfMonth = currentMonth.startOfMonth(calendar: calendar) else {
            print("⚠️ Failed to get start of month")
            return
        }

        // Get weekday of first day (1 = Sunday, 7 = Saturday)
        let firstWeekday = calendar.component(.weekday, from: startOfMonth)

        // Calculate how many days from previous month to show
        let daysFromPreviousMonth = firstWeekday - 1

        // Get start date (may be in previous month)
        guard let gridStartDate = startOfMonth.safeAdd(
            .day,
            value: -daysFromPreviousMonth,
            calendar: calendar
        ) else {
            print("⚠️ Failed to calculate grid start date")
            return
        }

        // Generate 42 days (6 weeks × 7 days)
        for dayOffset in 0..<42 {
            guard let date = gridStartDate.safeAdd(.day, value: dayOffset, calendar: calendar) else {
                print("⚠️ Failed to generate day \(dayOffset)")
                continue
            }

            let isCurrentMonth = calendar.isDate(date, equalTo: currentMonth, toGranularity: .month)
            let isToday = calendar.isDate(date, inSameDayAs: today)
            let dayEvents = events(for: date)
            let hasEvents = !dayEvents.isEmpty

            let calendarDay = CalendarDay(
                date: date,
                day: calendar.component(.day, from: date),
                isCurrentMonth: isCurrentMonth,
                isToday: isToday,
                hasEvents: hasEvents,
                events: dayEvents
            )

            calendarDays.append(calendarDay)
        }
    }
}

// MARK: - Supporting Models

struct CalendarDay: Identifiable, Equatable {
    let id = UUID()
    let date: Date
    let day: Int
    let isCurrentMonth: Bool
    let isToday: Bool
    let hasEvents: Bool
    let events: [CalendarEvent]

    static func == (lhs: CalendarDay, rhs: CalendarDay) -> Bool {
        return lhs.id == rhs.id
    }
}
