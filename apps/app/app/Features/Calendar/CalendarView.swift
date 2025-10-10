import SwiftUI

struct CalendarView: View {
    @State private var selectedDate = Date()
    @State private var events: [CalendarEvent] = []
    @State private var isLoading = false
    @State private var errorMessage: String?

    var todaysEvents: [CalendarEvent] {
        events.filter { event in
            Calendar.current.isDate(event.startTime, inSameDayAs: selectedDate)
        }.sorted { $0.startTime < $1.startTime }
    }

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Week calendar view
                    WeekCalendarView(selectedDate: $selectedDate)
                        .padding(.horizontal)

                    // Error message
                    if let error = errorMessage {
                        Text(error)
                            .foregroundColor(.red)
                            .font(.caption)
                            .padding()
                            .background(TideTheme.error.opacity(0.1))
                            .cornerRadius(8)
                            .padding(.horizontal)
                    }

                    // Today's schedule
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Today's Schedule")
                            .font(TideTheme.Typography.title2)
                            .bold()
                            .padding(.horizontal)

                        if isLoading {
                            ProgressView("Loading events...")
                                .padding()
                        } else if todaysEvents.isEmpty {
                            EmptyScheduleCard()
                        } else {
                            ForEach(todaysEvents) { event in
                                EventCard(event: event)
                            }
                        }
                    }

                }
                .padding(.vertical)
            }
            .background(TideTheme.background)
            .navigationTitle("Calendar")
            .refreshable {
                await refreshEvents()
            }
            .onAppear {
                _Concurrency.Task {
                    await refreshEvents()
                }
            }
        }
    }

    // MARK: - Actions

    private func refreshEvents() async {
        isLoading = true
        errorMessage = nil

        do {
            // Fetch events for current month
            let calendar = Calendar.current
            let startOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: selectedDate))!
            let endOfMonth = calendar.date(byAdding: DateComponents(month: 1, day: -1), to: startOfMonth)!

            events = try await CalendarService.shared.fetchEvents(from: startOfMonth, to: endOfMonth)
            print("✅ Loaded \(events.count) calendar events")

        } catch {
            errorMessage = "Failed to load events: \(error.localizedDescription)"
            print("❌ Error fetching events: \(error)")
        }

        isLoading = false
    }
}

// MARK: - Week Calendar View
struct WeekCalendarView: View {
    @Binding var selectedDate: Date

    private let calendar = Calendar.current
    private var weekDays: [Date] {
        let today = Date()
        let weekday = calendar.component(.weekday, from: today)
        let startOfWeek = calendar.date(byAdding: .day, value: -(weekday - 1), to: today)!

        return (0..<7).compactMap { day in
            calendar.date(byAdding: .day, value: day, to: startOfWeek)
        }
    }

    var body: some View {
        HStack(spacing: 12) {
            ForEach(weekDays, id: \.self) { date in
                VStack(spacing: 4) {
                    Text(dayOfWeek(date))
                        .font(TideTheme.Typography.caption1)
                        .foregroundColor(TideTheme.textSecondary)

                    Text("\(calendar.component(.day, from: date))")
                        .font(TideTheme.Typography.headline)
                        .foregroundColor(
                            calendar.isDate(date, inSameDayAs: selectedDate)
                                ? .white
                                : TideTheme.textPrimary
                        )
                }
                .frame(maxWidth: .infinity)
                .frame(height: 60)
                .background(
                    calendar.isDate(date, inSameDayAs: selectedDate)
                        ? TideTheme.primary
                        : TideTheme.surface
                )
                .cornerRadius(TideTheme.CornerRadius.medium)
                .shadow(
                    color: calendar.isDate(date, inSameDayAs: selectedDate)
                        ? TideTheme.primary.opacity(0.3)
                        : TideTheme.Shadow.small.color,
                    radius: calendar.isDate(date, inSameDayAs: selectedDate) ? 8 : 2,
                    y: 2
                )
                .onTapGesture {
                    withAnimation(.spring()) {
                        selectedDate = date
                    }
                }
            }
        }
    }

    private func dayOfWeek(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEE"
        return formatter.string(from: date).uppercased()
    }
}

// MARK: - Event Card
struct EventCard: View {
    let event: CalendarEvent

    var body: some View {
        HStack(spacing: 12) {
            // Color indicator
            RoundedRectangle(cornerRadius: 2)
                .fill(event.color.color)
                .frame(width: 4, height: 50)

            // Event details
            VStack(alignment: .leading, spacing: 4) {
                Text(event.title)
                    .font(TideTheme.Typography.headline)

                HStack(spacing: 12) {
                    Label(event.timeRange, systemImage: "clock")
                    if let location = event.location {
                        Label(location, systemImage: "location.fill")
                    }
                }
                .font(TideTheme.Typography.caption1)
                .foregroundColor(TideTheme.textSecondary)
            }

            Spacer()

            // Video call indicator
            if event.meetingUrl != nil {
                Image(systemName: "video.fill")
                    .foregroundColor(TideTheme.primary)
            }
        }
        .padding()
        .background(TideTheme.surface)
        .cornerRadius(TideTheme.CornerRadius.medium)
        .shadow(color: TideTheme.Shadow.small.color, radius: 2, y: 1)
        .padding(.horizontal)
    }
}

// MARK: - Empty Schedule Card
struct EmptyScheduleCard: View {
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "calendar.badge.checkmark")
                .font(.system(size: 48))
                .foregroundColor(TideTheme.textSecondary)

            Text("No events scheduled")
                .font(TideTheme.Typography.headline)
                .foregroundColor(TideTheme.textPrimary)

            Text("You have a clear schedule today")
                .font(TideTheme.Typography.footnote)
                .foregroundColor(TideTheme.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
        .background(TideTheme.surface)
        .cornerRadius(TideTheme.CornerRadius.medium)
        .padding(.horizontal)
    }
}

// MARK: - Preview
#Preview {
    CalendarView()
}
