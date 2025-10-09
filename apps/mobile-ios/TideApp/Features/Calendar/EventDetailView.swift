/**
 * Event Detail View
 * Display full event details with edit/delete actions
 */

import SwiftUI

struct EventDetailView: View {
    let eventId: String
    @StateObject private var viewModel: EventDetailViewModel
    @EnvironmentObject var container: DependencyContainer
    @EnvironmentObject var navigationState: NavigationState
    @Environment(\.dismiss) private var dismiss
    @State private var showDeleteConfirmation = false

    init(eventId: String, dependencies: DependencyContainer = .shared) {
        self.eventId = eventId
        self._viewModel = StateObject(wrappedValue: dependencies.makeEventDetailViewModel(eventId: eventId))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Design.Spacing.lg) {
                // Title
                if let event = viewModel.event {
                    Text(event.title)
                        .font(Design.Typography.Title.bold)

                    // Time
                    InfoRow(
                        icon: "clock",
                        title: "Time",
                        value: timeString(event.startTime, event.endTime)
                    )

                    // Location
                    if let location = event.location {
                        InfoRow(
                            icon: "location",
                            title: "Location",
                            value: location
                        )
                    }

                    // Attendees
                    if let attendees = event.attendees, !attendees.isEmpty {
                        VStack(alignment: .leading, spacing: Design.Spacing.sm) {
                            Label("Attendees", systemImage: "person.2")
                                .font(Design.Typography.Headline.semibold)
                                .foregroundColor(Design.Colors.Text.secondary)

                            ForEach(attendees, id: \.self) { attendee in
                                Text(attendee)
                                    .font(Design.Typography.Body.regular)
                                    .padding(.leading, 28)
                            }
                        }
                    }

                    // Description
                    if let description = event.description {
                        VStack(alignment: .leading, spacing: Design.Spacing.sm) {
                            Label("Description", systemImage: "doc.text")
                                .font(Design.Typography.Headline.semibold)
                                .foregroundColor(Design.Colors.Text.secondary)

                            Text(description)
                                .font(Design.Typography.Body.regular)
                                .padding(.leading, 28)
                        }
                    }

                    // Meeting Link (keeping safe URL unwrapping)
                    if let meetingLink = event.meetingLink,
                       let meetingURL = URL(string: meetingLink) {
                        Link(destination: meetingURL) {
                            HStack {
                                Image(systemName: "video.fill")
                                    .foregroundColor(.white)
                                Text("Join Meeting")
                                    .font(Design.Typography.Body.semibold)
                                    .foregroundColor(.white)
                                Spacer()
                                Image(systemName: "arrow.up.right")
                                    .font(Design.Typography.Caption.regular)
                                    .foregroundColor(.white)
                            }
                            .padding(Design.Spacing.md)
                            .background(Design.Colors.Semantic.primary)
                            .cornerRadius(Design.CornerRadius.lg)
                        }
                        .accessibilityLabel("Join meeting")
                        .accessibilityHint("Opens the meeting link in your default browser or app")
                    }

                    // Conflict warning
                    if event.hasConflict {
                        HStack(spacing: Design.Spacing.sm) {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundColor(Design.Colors.Semantic.warning)
                            Text("This event conflicts with another event")
                                .font(Design.Typography.Body.regular)
                        }
                        .padding(Design.Spacing.md)
                        .background(Design.Colors.Semantic.warning.opacity(0.1))
                        .cornerRadius(Design.CornerRadius.md)
                    }
                }
            }
            .padding(Design.Spacing.md)
        }
        .stateContent(
            isLoading: viewModel.isLoading,
            error: viewModel.error,
            isEmpty: viewModel.event == nil && !viewModel.isLoading,
            retryAction: {
                Task { await viewModel.loadEvent() }
            }
        ) {
            EmptyView(
                icon: "calendar.badge.exclamationmark",
                title: "Event Not Found",
                message: "This event could not be loaded",
                actionTitle: "Try Again",
                action: {
                    Task { await viewModel.loadEvent() }
                }
            )
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Menu {
                    Button {
                        navigateToEdit()
                    } label: {
                        Label("Edit", systemImage: "pencil")
                    }

                    Button(role: .destructive) {
                        showDeleteConfirmation = true
                    } label: {
                        Label("Delete", systemImage: "trash")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
                .accessibilityLabel("Event actions")
                .accessibilityHint("Edit or delete this event")
            }
        }
        .alert("Delete Event?", isPresented: $showDeleteConfirmation) {
            Button("Delete", role: .destructive) {
                Task {
                    await viewModel.deleteEvent()
                    dismiss()
                }
            }
            Button("Cancel", role: .cancel) { }
        } message: {
            Text("Are you sure you want to delete this event?")
        }
        .task {
            await viewModel.loadEvent()
        }
    }

    // MARK: - Helpers
    private func timeString(_ start: Date, _ end: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short

        let startStr = formatter.string(from: start)

        formatter.dateStyle = .none
        let endStr = formatter.string(from: end)

        return "\(startStr) - \(endStr)"
    }

    private func navigateToEdit() {
        navigationState.calendarPath.append(CalendarDestination.edit(eventId: eventId))
    }
}

// MARK: - Info Row
struct InfoRow: View {
    let icon: String
    let title: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: Design.Spacing.sm) {
            Label(title, systemImage: icon)
                .font(Design.Typography.Headline.semibold)
                .foregroundColor(Design.Colors.Text.secondary)

            Text(value)
                .font(Design.Typography.Body.regular)
                .padding(.leading, 28)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(title): \(value)")
    }
}

// MARK: - View Model
@MainActor
final class EventDetailViewModel: ObservableObject {
    @Published var event: EventDetail?
    @Published var isLoading = false
    @Published var error: Error?

    private let eventId: String
    private let apiClient: APIClientProtocol
    private let authManager: AuthManagerProtocol

    init(eventId: String, apiClient: APIClientProtocol, authManager: AuthManagerProtocol) {
        self.eventId = eventId
        self.apiClient = apiClient
        self.authManager = authManager
    }

    func loadEvent() async {
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            let calendarEvent = try await apiClient.getCalendarEvent(id: eventId)

            // Convert CalendarEvent to EventDetail
            event = EventDetail(
                id: calendarEvent.id,
                title: calendarEvent.title,
                startTime: calendarEvent.startTime,
                endTime: calendarEvent.endTime,
                location: calendarEvent.location,
                description: calendarEvent.description,
                attendees: calendarEvent.attendees?.map { $0.email },
                hasConflict: false, // TODO: Add conflict detection
                meetingLink: nil // TODO: Extract meeting link from description or location
            )

        } catch {
            Logger.error("Error loading event", error: error)
            self.error = error
        }
    }

    func deleteEvent() async {
        do {
            try await apiClient.deleteEvent(id: eventId)
        } catch {
            Logger.error("Error deleting event", error: error)
            self.error = error
        }
    }
}

// MARK: - Models
struct EventDetail: Identifiable {
    let id: String
    let title: String
    let startTime: Date
    let endTime: Date
    let location: String?
    let description: String?
    let attendees: [String]?
    let hasConflict: Bool
    let meetingLink: String?
}

// MARK: - Preview
#Preview {
    NavigationStack {
        EventDetailView(eventId: "test-event-123")
            .environmentObject(NavigationState())
    }
}
