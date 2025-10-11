import SwiftUI

/// Enhanced Calendar View using Mobile BFF
/// Provides optimized calendar with conflict detection and meeting briefs
struct EnhancedCalendarView: View {
    @State private var calendarData: MobileBFFService.CalendarResponse?
    @State private var selectedDate: Date = Date()
    @State private var isLoading = false
    @State private var errorMessage: String?

    private var dateRange: (start: Date, end: Date) {
        let calendar = Calendar.current
        let start = calendar.startOfDay(for: selectedDate)
        let end = calendar.date(byAdding: .day, value: 7, to: start) ?? start
        return (start, end)
    }

    var body: some View {
        NavigationView {
            Group {
                if isLoading && calendarData == nil {
                    ProgressView("Loading calendar...")
                } else if let data = calendarData {
                    ScrollView {
                        VStack(spacing: 16) {
                            // Stats Cards
                            statsSection(stats: data.stats)

                            // Conflicts Alert
                            if !data.conflicts.isEmpty {
                                conflictsSection(conflicts: data.conflicts, events: data.events)
                            }

                            // Upcoming Meeting Briefs
                            if !data.upcomingBriefs.isEmpty {
                                briefsSection(briefs: data.upcomingBriefs)
                            }

                            // Events List
                            if !data.events.isEmpty {
                                eventsSection(events: data.events)
                            } else {
                                emptyStateView
                            }
                        }
                        .padding()
                    }
                } else {
                    // Error state
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 48))
                            .foregroundColor(.orange)

                        if let error = errorMessage {
                            Text(error)
                                .font(TideTheme.Typography.body)
                                .foregroundColor(TideTheme.textSecondary)
                                .multilineTextAlignment(.center)
                        }

                        Button("Retry") {
                            _Concurrency.Task {
                                await loadCalendar()
                            }
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding()
                }
            }
            .refreshable {
                await loadCalendar()
            }
            .navigationTitle("Calendar")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button("Today") {
                            selectedDate = Date()
                            _Concurrency.Task { await loadCalendar() }
                        }
                        Button("Next 7 Days") {
                            selectedDate = Date()
                            _Concurrency.Task { await loadCalendar() }
                        }
                    } label: {
                        Label("Options", systemImage: "ellipsis.circle")
                    }
                }
            }
            .onAppear {
                if calendarData == nil {
                    _Concurrency.Task {
                        await loadCalendar()
                    }
                }
            }
        }
    }

    // MARK: - View Components

    private func statsSection(stats: MobileBFFService.CalendarStats) -> some View {
        HStack(spacing: 12) {
            StatCard(
                title: "Events",
                value: "\(stats.totalEvents)",
                icon: "calendar",
                color: .blue
            )

            StatCard(
                title: "Today",
                value: "\(stats.meetingsToday)",
                icon: "clock",
                color: .green
            )

            if stats.conflicts > 0 {
                StatCard(
                    title: "Conflicts",
                    value: "\(stats.conflicts)",
                    icon: "exclamationmark.triangle",
                    color: .red
                )
            }
        }
    }

    private func conflictsSection(conflicts: [MobileBFFService.CalendarConflict], events: [MobileBFFService.CalendarEvent]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "exclamationmark.triangle.fill")
                    .foregroundColor(.red)
                Text("Scheduling Conflicts")
                    .font(TideTheme.Typography.title3)
                    .fontWeight(.semibold)
            }

            ForEach(conflicts, id: \.eventIds.first) { conflict in
                ConflictCard(conflict: conflict, events: events)
            }
        }
        .padding()
        .background(Color.red.opacity(0.1))
        .cornerRadius(12)
    }

    private func briefsSection(briefs: [MobileBFFService.MeetingBrief]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "brain.head.profile")
                    .foregroundColor(TideTheme.primary)
                Text("Meeting Briefs")
                    .font(TideTheme.Typography.title3)
                    .fontWeight(.semibold)
            }

            ForEach(briefs, id: \.eventId) { brief in
                MeetingBriefCard(brief: brief)
            }
        }
        .padding()
        .background(TideTheme.primary.opacity(0.1))
        .cornerRadius(12)
    }

    private func eventsSection(events: [MobileBFFService.CalendarEvent]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Events")
                .font(TideTheme.Typography.title3)
                .fontWeight(.semibold)

            ForEach(events, id: \.id) { event in
                EventRow(event: event)
            }
        }
    }

    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "calendar.badge.plus")
                .font(.system(size: 64))
                .foregroundColor(TideTheme.primary)

            Text("No Events")
                .font(TideTheme.Typography.title2)
                .fontWeight(.semibold)

            Text("When you signed in, we requested Calendar access. It may take a moment to sync, or you may need to grant permissions during sign in.")
                .font(TideTheme.Typography.body)
                .foregroundColor(TideTheme.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            Text("Pull down to refresh")
                .font(TideTheme.Typography.caption1)
                .foregroundColor(TideTheme.textTertiary)
                .padding(.top, 8)
        }
        .padding(.vertical, 60)
    }

    // MARK: - Actions

    private func loadCalendar() async {
        isLoading = true
        errorMessage = nil

        do {
            let range = dateRange
            calendarData = try await MobileBFFService.shared.fetchCalendar(
                startDate: range.start,
                endDate: range.end
            )
        } catch {
            errorMessage = "Failed to load calendar: \(error.localizedDescription)"
            print("❌ Error loading calendar: \(error)")
        }

        isLoading = false
    }
}

// StatCard is defined in DashboardView.swift and shared across views

// MARK: - Conflict Card
struct ConflictCard: View {
    let conflict: MobileBFFService.CalendarConflict
    let events: [MobileBFFService.CalendarEvent]

    private var conflictingEvents: [MobileBFFService.CalendarEvent] {
        events.filter { conflict.eventIds.contains($0.id) }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(conflict.type.capitalized)
                    .font(TideTheme.Typography.caption1)
                    .fontWeight(.semibold)

                Spacer()

                Text(conflict.severity.uppercased())
                    .font(TideTheme.Typography.caption2)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(severityColor(conflict.severity))
                    .foregroundColor(.white)
                    .cornerRadius(4)
            }

            ForEach(conflictingEvents, id: \.id) { event in
                HStack {
                    Image(systemName: "clock")
                        .font(TideTheme.Typography.caption1)
                    Text(event.title)
                        .font(TideTheme.Typography.caption1)
                    Spacer()
                    Text(event.start.formatted(date: .omitted, time: .shortened))
                        .font(TideTheme.Typography.caption2)
                        .foregroundColor(TideTheme.textSecondary)
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(8)
    }

    private func severityColor(_ severity: String) -> Color {
        switch severity.lowercased() {
        case "high":
            return .red
        case "medium":
            return .orange
        default:
            return .yellow
        }
    }
}

// MARK: - Meeting Brief Card
struct MeetingBriefCard: View {
    let brief: MobileBFFService.MeetingBrief
    @State private var isExpanded = false

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Button(action: { isExpanded.toggle() }) {
                HStack {
                    if let summary = brief.summary {
                        Text(summary)
                            .font(TideTheme.Typography.subheadline)
                            .fontWeight(.medium)
                            .multilineTextAlignment(.leading)
                            .lineLimit(isExpanded ? nil : 2)
                    }

                    Spacer()

                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(TideTheme.Typography.caption1)
                        .foregroundColor(TideTheme.textSecondary)
                }
            }
            .buttonStyle(.plain)

            if isExpanded {
                if let keyPoints = brief.keyPoints, !keyPoints.isEmpty {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Key Points:")
                            .font(TideTheme.Typography.caption1)
                            .fontWeight(.semibold)
                            .foregroundColor(TideTheme.textSecondary)

                        ForEach(keyPoints, id: \.self) { point in
                            HStack(alignment: .top, spacing: 6) {
                                Text("•")
                                Text(point)
                                    .font(TideTheme.Typography.caption1)
                            }
                        }
                    }
                }

                if let participants = brief.participants, !participants.isEmpty {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Participants:")
                            .font(TideTheme.Typography.caption1)
                            .fontWeight(.semibold)
                            .foregroundColor(TideTheme.textSecondary)

                        Text(participants.joined(separator: ", "))
                            .font(TideTheme.Typography.caption1)
                    }
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(8)
    }
}

// MARK: - Event Row
struct EventRow: View {
    let event: MobileBFFService.CalendarEvent

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                // Time
                VStack(alignment: .leading, spacing: 2) {
                    Text(event.start.formatted(date: .omitted, time: .shortened))
                        .font(TideTheme.Typography.caption1)
                        .foregroundColor(TideTheme.textSecondary)

                    if !event.allDay {
                        Text(event.end.formatted(date: .omitted, time: .shortened))
                            .font(TideTheme.Typography.caption2)
                            .foregroundColor(TideTheme.textSecondary)
                    }
                }
                .frame(width: 60, alignment: .leading)

                // Event info
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(event.title)
                            .font(TideTheme.Typography.subheadline)
                            .fontWeight(.medium)

                        if event.hasConflict {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .font(TideTheme.Typography.caption2)
                                .foregroundColor(.red)
                        }

                        Spacer()

                        // Status badge
                        Text(event.status.capitalized)
                            .font(TideTheme.Typography.caption2)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(statusColor(event.status).opacity(0.2))
                            .foregroundColor(statusColor(event.status))
                            .cornerRadius(4)
                    }

                    if let location = event.location, !location.isEmpty {
                        HStack(spacing: 4) {
                            Image(systemName: "location.fill")
                                .font(TideTheme.Typography.caption2)
                            Text(location)
                                .font(TideTheme.Typography.caption1)
                        }
                        .foregroundColor(TideTheme.textSecondary)
                    }

                    if let attendees = event.attendees, !attendees.isEmpty {
                        HStack(spacing: 4) {
                            Image(systemName: "person.2.fill")
                                .font(TideTheme.Typography.caption2)
                            Text("\(attendees.count) attendees")
                                .font(TideTheme.Typography.caption1)
                        }
                        .foregroundColor(TideTheme.textSecondary)
                    }
                }
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
    }

    private func statusColor(_ status: String) -> Color {
        switch status.lowercased() {
        case "confirmed":
            return .green
        case "tentative":
            return .orange
        case "cancelled":
            return .red
        default:
            return .gray
        }
    }
}

// Date.relative extension is defined in EmailView.swift and shared across views

// MARK: - Preview
#Preview {
    EnhancedCalendarView()
}
