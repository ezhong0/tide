/**
 * Conflicts View
 * Display scheduling conflicts and overlapping events
 */

import SwiftUI

struct ConflictsView: View {
    @StateObject private var viewModel: ConflictsViewModel
    @EnvironmentObject var container: DependencyContainer
    @EnvironmentObject var navigationState: NavigationState

    init(dependencies: DependencyContainer = .shared) {
        self._viewModel = StateObject(wrappedValue: dependencies.makeConflictsViewModel())
    }

    var body: some View {
        VStack(spacing: 0) {
            // Header
            header

            Divider()

            // Conflicts list
            ScrollView {
                LazyVStack(spacing: Design.Spacing.md) {
                    ForEach(viewModel.conflicts) { conflict in
                        ConflictCard(conflict: conflict)
                            .onTapGesture {
                                // Navigate to first event in conflict
                                navigationState.calendarPath.append(CalendarDestination.detail(eventId: conflict.events.first?.id ?? ""))
                            }
                    }
                }
                .padding(Design.Spacing.md)
            }
            .stateContent(
                isLoading: viewModel.isLoading,
                error: viewModel.error,
                isEmpty: viewModel.conflicts.isEmpty,
                retryAction: {
                    Task { await viewModel.loadConflicts() }
                }
            ) {
                EmptyView(
                    icon: "checkmark.circle",
                    title: "No Conflicts",
                    message: "All your events are properly scheduled",
                    actionTitle: nil,
                    action: nil
                )
            }
        }
        .task {
            await viewModel.loadConflicts()
        }
    }

    // MARK: - Header
    @ViewBuilder
    private var header: some View {
        HStack {
            VStack(alignment: .leading, spacing: Design.Spacing.xxs) {
                Text("Schedule Conflicts")
                    .font(Design.Typography.Title.bold)

                if !viewModel.conflicts.isEmpty {
                    Text("\(viewModel.conflicts.count) conflict(s) found")
                        .font(Design.Typography.Caption.regular)
                        .foregroundColor(Design.Colors.Text.secondary)
                }
            }

            Spacer()
        }
        .padding(Design.Spacing.md)
        .background(Design.Colors.Background.primary)
    }
}

// MARK: - Conflict Card
struct ConflictCard: View {
    let conflict: EventConflict

    var body: some View {
        VStack(alignment: .leading, spacing: Design.Spacing.sm) {
            // Conflict indicator
            HStack(spacing: Design.Spacing.xs) {
                Image(systemName: "exclamationmark.triangle.fill")
                    .foregroundColor(Design.Colors.Semantic.warning)
                    .font(Design.Typography.Body.regular)

                Text("Scheduling Conflict")
                    .font(Design.Typography.Body.semibold)
                    .foregroundColor(Design.Colors.Semantic.warning)
            }

            // Time range
            HStack(spacing: Design.Spacing.xs) {
                Image(systemName: "clock")
                    .font(Design.Typography.Caption.regular)
                    .foregroundColor(Design.Colors.Text.secondary)

                Text(timeRangeString(conflict.startTime, conflict.endTime))
                    .font(Design.Typography.Caption.regular)
                    .foregroundColor(Design.Colors.Text.secondary)
            }

            Divider()
                .padding(.vertical, Design.Spacing.xs)

            // Conflicting events
            VStack(alignment: .leading, spacing: Design.Spacing.xs) {
                ForEach(conflict.events) { event in
                    HStack(spacing: Design.Spacing.sm) {
                        Circle()
                            .fill(Design.Colors.Semantic.primary)
                            .frame(width: 8, height: 8)

                        VStack(alignment: .leading, spacing: Design.Spacing.xxs) {
                            Text(event.title)
                                .font(Design.Typography.Body.medium)

                            Text("\(timeString(event.startTime)) - \(timeString(event.endTime))")
                                .font(Design.Typography.Caption.regular)
                                .foregroundColor(Design.Colors.Text.secondary)
                        }

                        Spacer()
                    }
                }
            }
        }
        .padding(Design.Spacing.md)
        .background(Design.Colors.Background.secondary)
        .cornerRadius(Design.CornerRadius.lg)
        .overlay(
            RoundedRectangle(cornerRadius: Design.CornerRadius.lg)
                .stroke(Design.Colors.Semantic.warning.opacity(0.3), lineWidth: 1)
        )
    }

    private func timeString(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }

    private func timeRangeString(_ start: Date, _ end: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        let startStr = formatter.string(from: start)
        formatter.dateStyle = .none
        let endStr = formatter.string(from: end)
        return "\(startStr) - \(endStr)"
    }
}

// MARK: - View Model
@MainActor
final class ConflictsViewModel: ObservableObject {
    @Published var conflicts: [EventConflict] = []
    @Published var isLoading = false
    @Published var error: Error?

    private let apiClient: APIClientProtocol
    private let authManager: AuthManagerProtocol

    init(apiClient: APIClientProtocol, authManager: AuthManagerProtocol) {
        self.apiClient = apiClient
        self.authManager = authManager
    }

    func loadConflicts() async {
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            // Fetch events for the next 30 days
            let startDate = Date()
            let endDate = Calendar.current.date(byAdding: .day, value: 30, to: startDate) ?? startDate

            let events = try await apiClient.getCalendarEvents(
                startDate: startDate,
                endDate: endDate
            )

            // Detect conflicts
            conflicts = detectConflicts(in: events)

        } catch {
            Logger.error("Error loading conflicts", error: error)
            self.error = error
        }
    }

    private func detectConflicts(in events: [CalendarEvent]) -> [EventConflict] {
        var conflictGroups: [EventConflict] = []
        var processedEvents = Set<String>()

        for i in 0..<events.count {
            guard !processedEvents.contains(events[i].id) else { continue }

            var conflictingEvents: [ConflictEvent] = []

            for j in 0..<events.count {
                guard i != j, !processedEvents.contains(events[j].id) else { continue }

                // Check if events overlap
                if eventsOverlap(events[i], events[j]) {
                    if conflictingEvents.isEmpty {
                        conflictingEvents.append(ConflictEvent(
                            id: events[i].id,
                            title: events[i].title,
                            startTime: events[i].startTime,
                            endTime: events[i].endTime
                        ))
                    }

                    conflictingEvents.append(ConflictEvent(
                        id: events[j].id,
                        title: events[j].title,
                        startTime: events[j].startTime,
                        endTime: events[j].endTime
                    ))

                    processedEvents.insert(events[j].id)
                }
            }

            if !conflictingEvents.isEmpty {
                processedEvents.insert(events[i].id)

                let startTime = conflictingEvents.map { $0.startTime }.min() ?? Date()
                let endTime = conflictingEvents.map { $0.endTime }.max() ?? Date()

                conflictGroups.append(EventConflict(
                    id: UUID().uuidString,
                    startTime: startTime,
                    endTime: endTime,
                    events: conflictingEvents
                ))
            }
        }

        return conflictGroups.sorted { $0.startTime < $1.startTime }
    }

    private func eventsOverlap(_ event1: CalendarEvent, _ event2: CalendarEvent) -> Bool {
        return event1.startTime < event2.endTime && event2.startTime < event1.endTime
    }
}

// MARK: - Models
struct EventConflict: Identifiable {
    let id: String
    let startTime: Date
    let endTime: Date
    let events: [ConflictEvent]
}

struct ConflictEvent: Identifiable {
    let id: String
    let title: String
    let startTime: Date
    let endTime: Date
}

// MARK: - Dependency Container Extension
extension DependencyContainer {
    func makeConflictsViewModel() -> ConflictsViewModel {
        ConflictsViewModel(apiClient: apiClient, authManager: authManager)
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        ConflictsView()
            .environmentObject(NavigationState())
    }
}
