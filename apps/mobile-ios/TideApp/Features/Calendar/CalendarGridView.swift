/**
 * Calendar Grid View
 * Monthly calendar view with events
 */

import SwiftUI

struct CalendarGridView: View {
    @StateObject private var viewModel: CalendarGridViewModel
    @EnvironmentObject var container: DependencyContainer
    @EnvironmentObject var navigationState: NavigationState
    @State private var selectedDate: Date?

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 2), count: 7)
    private let weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    init(dependencies: DependencyContainer = .shared) {
        self._viewModel = StateObject(wrappedValue: dependencies.makeCalendarViewModel())
    }

    var body: some View {
        VStack(spacing: 0) {
            // Header with month/year and navigation
            header

            Divider()

            // Week day labels
            weekDayLabels

            // Calendar grid
            if viewModel.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                ScrollView {
                    VStack(spacing: 16) {
                        // Calendar grid
                        calendarGrid

                        // Events for selected date
                        if let date = selectedDate ?? viewModel.today {
                            eventsForDate(date)
                        }
                    }
                }
            }
        }
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    navigateToCreateEvent()
                } label: {
                    Image(systemName: "plus")
                }
            }
        }
        .task {
            await viewModel.loadEvents()
        }
    }

    // MARK: - Header
    @ViewBuilder
    private var header: some View {
        HStack {
            Button {
                viewModel.previousMonth()
            } label: {
                Image(systemName: "chevron.left")
                    .font(.title3)
            }

            Spacer()

            VStack(spacing: 2) {
                Text(viewModel.monthYearString)
                    .font(.headline)

                Button {
                    viewModel.goToToday()
                } label: {
                    Text("Today")
                        .font(.caption)
                        .foregroundColor(.blue)
                }
            }

            Spacer()

            Button {
                viewModel.nextMonth()
            } label: {
                Image(systemName: "chevron.right")
                    .font(.title3)
            }
        }
        .padding()
    }

    // MARK: - Week Day Labels
    @ViewBuilder
    private var weekDayLabels: some View {
        HStack(spacing: 2) {
            ForEach(weekDays, id: \.self) { day in
                Text(day)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity)
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
    }

    // MARK: - Calendar Grid
    @ViewBuilder
    private var calendarGrid: some View {
        LazyVGrid(columns: columns, spacing: 8) {
            ForEach(viewModel.calendarDays, id: \.date) { day in
                CalendarDayCell(
                    day: day,
                    isSelected: selectedDate.map { day.date.isSameDay(as: $0) } ?? false,
                    isToday: Calendar.current.isDate(day.date, inSameDayAs: viewModel.today)
                )
                .onTapGesture {
                    if day.isCurrentMonth {
                        selectedDate = day.date
                    }
                }
            }
        }
        .padding(.horizontal)
    }

    // MARK: - Events for Date
    @ViewBuilder
    private func eventsForDate(_ date: Date) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(dateString(date))
                    .font(.headline)

                Spacer()

                Button {
                    navigateToCreateEvent(date: date)
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .font(.title3)
                        .foregroundColor(.blue)
                }
            }
            .padding(.horizontal)

            let events = viewModel.events(for: date)

            if events.isEmpty {
                Text("No events")
                    .font(.callout)
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding()
            } else {
                ForEach(events) { event in
                    EventRow(event: event)
                        .onTapGesture {
                            navigateToEventDetail(event.id)
                        }
                }
            }
        }
        .padding(.top)
    }

    // MARK: - Helpers
    private func dateString(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMMM d"
        return formatter.string(from: date)
    }

    private func navigateToEventDetail(_ eventId: String) {
        navigationState.calendarPath.append(CalendarDestination.detail(eventId: eventId))
    }

    private func navigateToCreateEvent(date: Date? = nil) {
        // TODO: Pass date to create event with pre-filled date
        navigationState.calendarPath.append(CalendarDestination.edit(eventId: nil))
    }
}

// MARK: - Calendar Day Cell
struct CalendarDayCell: View {
    let day: CalendarDay
    let isSelected: Bool
    let isToday: Bool

    var body: some View {
        VStack(spacing: 4) {
            Text("\(Calendar.current.component(.day, from: day.date))")
                .font(.system(size: 16, weight: isToday ? .bold : .regular))
                .foregroundColor(textColor)
                .frame(width: 40, height: 40)
                .background(backgroundColor)
                .clipShape(Circle())

            // Event indicators (dots)
            if !day.events.isEmpty {
                HStack(spacing: 2) {
                    ForEach(0..<min(day.events.count, 3), id: \.self) { index in
                        Circle()
                            .fill(day.events[index].color)
                            .frame(width: 4, height: 4)
                    }
                }
            }
        }
        .frame(height: 60)
        .opacity(day.isCurrentMonth ? 1.0 : 0.3)
    }

    private var textColor: Color {
        if isSelected {
            return .white
        } else if isToday {
            return .blue
        } else {
            return .primary
        }
    }

    private var backgroundColor: Color {
        if isSelected {
            return .blue
        } else if isToday {
            return .blue.opacity(0.1)
        } else {
            return .clear
        }
    }
}

// MARK: - Event Row
struct EventRow: View {
    let event: CalendarEvent

    var body: some View {
        HStack(spacing: 12) {
            // Time indicator
            Rectangle()
                .fill(event.color)
                .frame(width: 4)

            VStack(alignment: .leading, spacing: 4) {
                Text(event.title)
                    .font(.callout)
                    .fontWeight(.medium)

                HStack(spacing: 4) {
                    Image(systemName: "clock")
                        .font(.caption2)

                    Text(timeString(event.startTime, event.endTime))
                        .font(.caption)
                }
                .foregroundColor(.secondary)

                if let location = event.location {
                    HStack(spacing: 4) {
                        Image(systemName: "location")
                            .font(.caption2)

                        Text(location)
                            .font(.caption)
                    }
                    .foregroundColor(.secondary)
                }
            }

            Spacer()

            if event.hasConflict {
                Image(systemName: "exclamationmark.triangle.fill")
                    .foregroundColor(.orange)
                    .font(.caption)
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(8)
        .padding(.horizontal)
    }

    private func timeString(_ start: Date, _ end: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return "\(formatter.string(from: start)) - \(formatter.string(from: end))"
    }
}

// MARK: - View Model
@MainActor
class CalendarGridViewModel: ObservableObject {
    @Published var currentMonth: Date = Date()
    @Published var calendarDays: [CalendarDay] = []
    @Published var allEvents: [CalendarEvent] = []
    @Published var isLoading = false

    let today = Date()
    private let calendar = Calendar.current
    private let apiClient: APIClientProtocol
    private let authManager: AuthManagerProtocol

    var monthYearString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM yyyy"
        return formatter.string(from: currentMonth)
    }

    init(apiClient: APIClientProtocol, authManager: AuthManagerProtocol) {
        self.apiClient = apiClient
        self.authManager = authManager
        generateCalendarDays()
    }

    func loadEvents() async {
        isLoading = true
        defer { isLoading = false }

        do {
            // Calculate start and end of month for API call
            guard let startOfMonth = currentMonth.startOfMonth(calendar: calendar),
                  let endOfMonth = currentMonth.endOfMonth(calendar: calendar) else {
                print("⚠️ Failed to calculate month boundaries")
                return
            }

            // Fetch real events from API
            let fetchedEvents = try await apiClient.getCalendarEvents(
                startDate: startOfMonth,
                endDate: endOfMonth
            )

            // Convert API CalendarEvent to local CalendarEvent model
            allEvents = fetchedEvents.map { apiEvent in
                CalendarEvent(
                    id: apiEvent.id,
                    title: apiEvent.title,
                    startTime: apiEvent.startTime,
                    endTime: apiEvent.endTime,
                    location: apiEvent.location,
                    color: .blue, // TODO: Add color logic based on event type
                    hasConflict: false // TODO: Check for conflicts
                )
            }

            generateCalendarDays()

        } catch {
            print("Error loading events: \(error)")
            // On error, show empty calendar instead of mock data
            allEvents = []
            generateCalendarDays()
        }
    }

    func events(for date: Date) -> [CalendarEvent] {
        allEvents.filter { event in
            calendar.isDate(event.startTime, inSameDayAs: date)
        }
    }

    func previousMonth() {
        currentMonth = calendar.date(byAdding: .month, value: -1, to: currentMonth) ?? currentMonth
        generateCalendarDays()
    }

    func nextMonth() {
        currentMonth = calendar.date(byAdding: .month, value: 1, to: currentMonth) ?? currentMonth
        generateCalendarDays()
    }

    func goToToday() {
        currentMonth = today
        generateCalendarDays()
    }

    // MARK: - Private Helpers
    private func generateCalendarDays() {
        var days: [CalendarDay] = []

        // Get first day of month (safe)
        guard let firstOfMonth = currentMonth.startOfMonth(calendar: calendar) else {
            print("⚠️ Failed to calculate first of month for \(currentMonth)")
            calendarDays = []
            return
        }
        let firstWeekday = calendar.component(.weekday, from: firstOfMonth)

        // Get days in month (safe with fallback)
        let daysInMonth = currentMonth.daysInMonth(calendar: calendar)

        // Add days from previous month
        if firstWeekday > 1 {
            guard let previousMonth = currentMonth.safeAdd(.month, value: -1, calendar: calendar) else {
                print("⚠️ Failed to calculate previous month")
                // Continue without previous month days
            }

            if let previousMonth = previousMonth {
                let daysInPrevMonth = previousMonth.daysInMonth(calendar: calendar)
                let startDay = daysInPrevMonth - firstWeekday + 2

                for day in startDay...daysInPrevMonth {
                    let components = DateComponents(
                        year: calendar.component(.year, from: previousMonth),
                        month: calendar.component(.month, from: previousMonth),
                        day: day
                    )
                    let date = Date.safeFrom(components: components, calendar: calendar, default: previousMonth)

                    days.append(CalendarDay(
                        date: date,
                        isCurrentMonth: false,
                        events: events(for: date)
                    ))
                }
            }
        }

        // Add days from current month
        for day in 1...daysInMonth {
            let components = DateComponents(
                year: calendar.component(.year, from: currentMonth),
                month: calendar.component(.month, from: currentMonth),
                day: day
            )
            let date = Date.safeFrom(components: components, calendar: calendar, default: currentMonth)

            days.append(CalendarDay(
                date: date,
                isCurrentMonth: true,
                events: events(for: date)
            ))
        }

        // Add days from next month to complete the grid (42 cells = 6 rows)
        let remainingDays = 42 - days.count
        if remainingDays > 0 {
            guard let nextMonth = currentMonth.safeAdd(.month, value: 1, calendar: calendar) else {
                print("⚠️ Failed to calculate next month")
                calendarDays = days
                return
            }

            for day in 1...remainingDays {
                let components = DateComponents(
                    year: calendar.component(.year, from: nextMonth),
                    month: calendar.component(.month, from: nextMonth),
                    day: day
                )
                let date = Date.safeFrom(components: components, calendar: calendar, default: nextMonth)

                days.append(CalendarDay(
                    date: date,
                    isCurrentMonth: false,
                    events: events(for: date)
                ))
            }
        }

        calendarDays = days
    }

}

// MARK: - Models
struct CalendarDay {
    let date: Date
    let isCurrentMonth: Bool
    let events: [CalendarEvent]
}

struct CalendarEvent: Identifiable {
    let id: String
    let title: String
    let startTime: Date
    let endTime: Date
    let location: String?
    let color: Color
    let hasConflict: Bool
}

// MARK: - Preview
#Preview {
    NavigationStack {
        CalendarGridView()
            .navigationTitle("Calendar")
            .environmentObject(NavigationState())
    }
}
