import SwiftUI

struct CalendarView: View {
    @State private var selectedDate = Date()
    @State private var events: [CalendarEvent] = CalendarEvent.mockEvents
    @State private var showingScheduler = false

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

                    // Today's schedule
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Today's Schedule")
                            .font(TideTheme.Typography.title2)
                            .bold()
                            .padding(.horizontal)

                        if todaysEvents.isEmpty {
                            EmptyScheduleCard()
                        } else {
                            ForEach(todaysEvents) { event in
                                EventCard(event: event)
                            }
                        }
                    }

                    // Smart suggestions
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Tide Suggests")
                            .font(TideTheme.Typography.headline)
                            .padding(.horizontal)

                        SmartSuggestionCard(
                            title: "Clear afternoon for deep work",
                            description: "You have 3 hours free from 2-5 PM",
                            icon: "brain.head.profile",
                            action: "Block Time"
                        )

                        SmartSuggestionCard(
                            title: "Prep for Q4 Strategy Meeting",
                            description: "Review Q3 report and budget proposal",
                            icon: "doc.text.magnifyingglass",
                            action: "Start Prep"
                        )
                    }
                }
                .padding(.vertical)
            }
            .background(TideTheme.background)
            .navigationTitle("Calendar")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingScheduler = true }) {
                        Image(systemName: "plus.circle.fill")
                    }
                }
            }
            .sheet(isPresented: $showingScheduler) {
                Text("Smart Scheduler - Coming Soon")
            }
        }
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
    @State private var expanded = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Main event info
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

                // Expand button for prep
                if event.hasPrep {
                    Button(action: { withAnimation(.spring()) { expanded.toggle() } }) {
                        Image(systemName: expanded ? "chevron.up" : "chevron.down")
                            .foregroundColor(TideTheme.primary)
                    }
                }
            }
            .padding()

            // Expanded meeting prep
            if expanded, let prep = event.meetingPrep {
                MeetingPrepCard(prep: prep)
                    .transition(.asymmetric(
                        insertion: .move(edge: .top).combined(with: .opacity),
                        removal: .move(edge: .top).combined(with: .opacity)
                    ))
            }
        }
        .background(TideTheme.surface)
        .cornerRadius(TideTheme.CornerRadius.medium)
        .shadow(color: TideTheme.Shadow.small.color, radius: 2, y: 1)
        .padding(.horizontal)
    }
}

// MARK: - Meeting Prep Card
struct MeetingPrepCard: View {
    let prep: MeetingPrep

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Divider()

            // Agenda
            VStack(alignment: .leading, spacing: 6) {
                Label("Agenda", systemImage: "list.bullet")
                    .font(TideTheme.Typography.subheadline)
                    .fontWeight(.semibold)

                Text(prep.agenda)
                    .font(TideTheme.Typography.footnote)
                    .foregroundColor(TideTheme.textSecondary)
            }

            // Key points
            VStack(alignment: .leading, spacing: 6) {
                Label("Key Points", systemImage: "star.fill")
                    .font(TideTheme.Typography.subheadline)
                    .fontWeight(.semibold)

                ForEach(prep.keyPoints, id: \.self) { point in
                    HStack(alignment: .top, spacing: 6) {
                        Text("•")
                        Text(point)
                    }
                    .font(TideTheme.Typography.footnote)
                    .foregroundColor(TideTheme.textSecondary)
                }
            }

            // AI Insights
            if let insights = prep.aiInsights {
                VStack(alignment: .leading, spacing: 6) {
                    Label("AI Insights", systemImage: "brain.head.profile")
                        .font(TideTheme.Typography.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(TideTheme.primary)

                    Text(insights)
                        .font(TideTheme.Typography.footnote)
                        .foregroundColor(TideTheme.textSecondary)
                }
                .padding()
                .background(TideTheme.primary.opacity(0.1))
                .cornerRadius(TideTheme.CornerRadius.small)
            }
        }
        .padding()
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

// MARK: - Smart Suggestion Card
struct SmartSuggestionCard: View {
    let title: String
    let description: String
    let icon: String
    let action: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(TideTheme.primary)
                .frame(width: 40, height: 40)
                .background(TideTheme.primary.opacity(0.1))
                .cornerRadius(TideTheme.CornerRadius.small)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(TideTheme.Typography.subheadline)
                    .fontWeight(.semibold)

                Text(description)
                    .font(TideTheme.Typography.footnote)
                    .foregroundColor(TideTheme.textSecondary)
            }

            Spacer()

            Button(action) {
                // TODO: Handle action
            }
            .font(TideTheme.Typography.callout)
            .fontWeight(.semibold)
            .foregroundColor(TideTheme.primary)
        }
        .padding()
        .background(TideTheme.surface)
        .cornerRadius(TideTheme.CornerRadius.medium)
        .shadow(color: TideTheme.Shadow.small.color, radius: 2, y: 1)
        .padding(.horizontal)
    }
}

// MARK: - Preview
#Preview {
    CalendarView()
}
