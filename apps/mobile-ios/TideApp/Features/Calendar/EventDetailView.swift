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
            if viewModel.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(.top, 100)
            } else if let event = viewModel.event {
                VStack(alignment: .leading, spacing: 24) {
                    // Title
                    Text(event.title)
                        .font(.title2)
                        .fontWeight(.bold)

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
                        VStack(alignment: .leading, spacing: 8) {
                            Label("Attendees", systemImage: "person.2")
                                .font(.headline)
                                .foregroundColor(.secondary)

                            ForEach(attendees, id: \.self) { attendee in
                                Text(attendee)
                                    .font(.callout)
                                    .padding(.leading, 28)
                            }
                        }
                    }

                    // Description
                    if let description = event.description {
                        VStack(alignment: .leading, spacing: 8) {
                            Label("Description", systemImage: "doc.text")
                                .font(.headline)
                                .foregroundColor(.secondary)

                            Text(description)
                                .font(.callout)
                                .padding(.leading, 28)
                        }
                    }

                    // Meeting Link
                    if let meetingLink = event.meetingLink {
                        Link(destination: URL(string: meetingLink)!) {
                            HStack {
                                Image(systemName: "video.fill")
                                    .foregroundColor(.white)
                                Text("Join Meeting")
                                    .fontWeight(.semibold)
                                    .foregroundColor(.white)
                                Spacer()
                                Image(systemName: "arrow.up.right")
                                    .font(.caption)
                                    .foregroundColor(.white)
                            }
                            .padding()
                            .background(Color.blue)
                            .cornerRadius(12)
                        }
                    }

                    // Conflict warning
                    if event.hasConflict {
                        HStack {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundColor(.orange)
                            Text("This event conflicts with another event")
                                .font(.callout)
                        }
                        .padding()
                        .background(Color.orange.opacity(0.1))
                        .cornerRadius(8)
                    }
                }
                .padding()
            } else if let error = viewModel.error {
                ErrorView(error: error) {
                    Task {
                        await viewModel.loadEvent()
                    }
                }
            }
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
        VStack(alignment: .leading, spacing: 8) {
            Label(title, systemImage: icon)
                .font(.headline)
                .foregroundColor(.secondary)

            Text(value)
                .font(.callout)
                .padding(.leading, 28)
        }
    }
}

// MARK: - View Model
@MainActor
class EventDetailViewModel: ObservableObject {
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
            print("Error loading event: \(error)")
            self.error = error
        }
    }

    func deleteEvent() async {
        do {
            try await apiClient.deleteEvent(id: eventId)
        } catch {
            print("Error deleting event: \(error)")
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
