/**
 * Event Edit View
 * Create or edit calendar events
 */

import SwiftUI

struct EventEditView: View {
    let eventId: String?
    @StateObject private var viewModel: EventEditViewModel
    @EnvironmentObject var container: DependencyContainer
    @EnvironmentObject var navigationState: NavigationState
    @Environment(\.dismiss) private var dismiss
    @State private var showCancelConfirmation = false
    @FocusState private var focusedField: Field?

    enum Field {
        case title, location, description
    }

    init(eventId: String? = nil, dependencies: DependencyContainer = .shared) {
        self.eventId = eventId
        self._viewModel = StateObject(wrappedValue: dependencies.makeEventEditViewModel(eventId: eventId))
    }

    var body: some View {
        NavigationStack {
            Form {
                // Title
                Section {
                    TextField("Event Title", text: $viewModel.title)
                        .focused($focusedField, equals: .title)
                }

                // Date & Time
                Section {
                    DatePicker(
                        "Starts",
                        selection: $viewModel.startTime,
                        displayedComponents: [.date, .hourAndMinute]
                    )

                    DatePicker(
                        "Ends",
                        selection: $viewModel.endTime,
                        displayedComponents: [.date, .hourAndMinute]
                    )

                    Toggle("All Day", isOn: $viewModel.isAllDay)
                }

                // Location
                Section {
                    TextField("Location", text: $viewModel.location)
                        .focused($focusedField, equals: .location)
                } header: {
                    Text("Location")
                }

                // Attendees
                Section {
                    ForEach(viewModel.attendees, id: \.self) { attendee in
                        HStack {
                            Text(attendee)
                            Spacer()
                            Button {
                                viewModel.removeAttendee(attendee)
                            } label: {
                                Image(systemName: "minus.circle.fill")
                                    .foregroundColor(.red)
                            }
                        }
                    }

                    Button {
                        viewModel.showAddAttendee = true
                    } label: {
                        Label("Add Attendee", systemImage: "plus.circle.fill")
                    }
                } header: {
                    Text("Attendees")
                }

                // Description
                Section {
                    TextEditor(text: $viewModel.description)
                        .frame(minHeight: 100)
                        .focused($focusedField, equals: .description)
                } header: {
                    Text("Description")
                }

                // Conflict warning
                if viewModel.hasConflict {
                    Section {
                        HStack {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundColor(.orange)
                            Text("This event conflicts with another event")
                                .font(.callout)
                        }
                    }
                }
            }
            .navigationTitle(eventId == nil ? "New Event" : "Edit Event")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        if viewModel.hasChanges {
                            showCancelConfirmation = true
                        } else {
                            dismiss()
                        }
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        Task {
                            await viewModel.save()
                            if viewModel.saveSuccess {
                                dismiss()
                            }
                        }
                    }
                    .disabled(!viewModel.canSave || viewModel.isSaving)
                }
            }
            .alert("Discard Changes?", isPresented: $showCancelConfirmation) {
                Button("Discard", role: .destructive) {
                    dismiss()
                }
                Button("Keep Editing", role: .cancel) { }
            } message: {
                Text("Are you sure you want to discard your changes?")
            }
            .alert("Add Attendee", isPresented: $viewModel.showAddAttendee) {
                TextField("Email", text: $viewModel.newAttendeeEmail)
                Button("Add") {
                    viewModel.addAttendee()
                }
                Button("Cancel", role: .cancel) { }
            }
            .alert("Error", isPresented: $viewModel.showError) {
                Button("OK", role: .cancel) { }
            } message: {
                if let error = viewModel.error {
                    Text(error.localizedDescription)
                }
            }
            .task {
                if eventId != nil {
                    await viewModel.loadEvent()
                }
            }
        }
    }
}

// MARK: - View Model
@MainActor
class EventEditViewModel: ObservableObject {
    @Published var title: String = ""
    @Published var startTime: Date = Date()
    @Published var endTime: Date = Date().addingTimeInterval(3600) // 1 hour later
    @Published var isAllDay: Bool = false
    @Published var location: String = ""
    @Published var description: String = ""
    @Published var attendees: [String] = []
    @Published var showAddAttendee: Bool = false
    @Published var newAttendeeEmail: String = ""

    @Published var hasConflict: Bool = false
    @Published var isLoading: Bool = false
    @Published var isSaving: Bool = false
    @Published var saveSuccess: Bool = false
    @Published var showError: Bool = false
    @Published var error: Error?

    private let eventId: String?
    private let apiClient: APIClientProtocol
    private let authManager: AuthManagerProtocol
    private var initialState: String = ""

    init(eventId: String?, apiClient: APIClientProtocol, authManager: AuthManagerProtocol) {
        self.eventId = eventId
        self.apiClient = apiClient
        self.authManager = authManager
    }

    var canSave: Bool {
        !title.isEmpty && endTime > startTime
    }

    var hasChanges: Bool {
        let currentState = "\(title)\(startTime)\(endTime)\(isAllDay)\(location)\(description)\(attendees)"
        return currentState != initialState && currentState.count > 0
    }

    func loadEvent() async {
        guard let eventId = eventId else { return }

        isLoading = true
        defer { isLoading = false }

        do {
            // TODO: Implement actual API call
            try await Task.sleep(nanoseconds: 300_000_000) // 0.3s

            // Mock event
            title = "Team Standup"
            startTime = Date()
            endTime = Date().addingTimeInterval(1800) // 30 min
            location = "Conference Room A"
            description = "Daily standup to sync on progress and blockers"
            attendees = ["john@example.com", "sarah@example.com"]

            // Store initial state
            initialState = "\(title)\(startTime)\(endTime)\(isAllDay)\(location)\(description)\(attendees)"

        } catch {
            self.error = error
            self.showError = true
        }
    }

    func save() async {
        guard canSave else { return }

        isSaving = true
        defer { isSaving = false }

        do {
            // TODO: Implement actual API call
            try await Task.sleep(nanoseconds: 500_000_000) // 0.5s

            // Check for conflicts
            await checkConflicts()

            // Mock save
            saveSuccess = true

        } catch {
            self.error = error
            self.showError = true
        }
    }

    func addAttendee() {
        guard !newAttendeeEmail.isEmpty else { return }
        attendees.append(newAttendeeEmail)
        newAttendeeEmail = ""
    }

    func removeAttendee(_ attendee: String) {
        attendees.removeAll { $0 == attendee }
    }

    private func checkConflicts() async {
        // TODO: Implement actual conflict detection
        hasConflict = false
    }
}

// MARK: - Preview
#Preview("New Event") {
    EventEditView()
        .environmentObject(NavigationState())
}

#Preview("Edit Event") {
    EventEditView(eventId: "test-event-123")
        .environmentObject(NavigationState())
}
