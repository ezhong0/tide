/**
 * Event Edit View
 * Create or edit calendar events
 */

import SwiftUI

enum EventEditMode {
    case create
    case edit(CalendarEvent)
}

struct EventEditView: View {
    let mode: EventEditMode
    @StateObject private var viewModel: EventEditViewModel
    @EnvironmentObject var container: DependencyContainer
    @Environment(\.dismiss) private var dismiss

    @State private var showDeleteConfirmation = false
    @State private var showCancelConfirmation = false

    init(mode: EventEditMode, dependencies: DependencyContainer = .shared) {
        self.mode = mode
        self._viewModel = StateObject(wrappedValue: EventEditViewModel(
            mode: mode,
            apiClient: dependencies.apiClient,
            authManager: dependencies.authManager
        ))
    }

    var body: some View {
        NavigationView {
            Form {
                // Title
                Section(header: Text("Event Details")) {
                    TextField("Title", text: $viewModel.title)

                    TextField("Description (optional)", text: $viewModel.description, axis: .vertical)
                        .lineLimit(3...6)
                }

                // Date & Time
                Section(header: Text("Date & Time")) {
                    DatePicker("Start", selection: $viewModel.startTime, displayedComponents: [.date, .hourAndMinute])

                    DatePicker("End", selection: $viewModel.endTime, displayedComponents: [.date, .hourAndMinute])
                }

                // Location (optional)
                Section(header: Text("Location")) {
                    TextField("Add location", text: $viewModel.location)
                }

                // Delete button (edit mode only)
                if case .edit = mode {
                    Section {
                        Button(role: .destructive) {
                            showDeleteConfirmation = true
                        } label: {
                            HStack {
                                Spacer()
                                Label("Delete Event", systemImage: "trash")
                                Spacer()
                            }
                        }
                    }
                }

                // Validation error
                if let error = viewModel.validationError {
                    Section {
                        Text(error)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                }
            }
            .navigationTitle(navigationTitle)
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
            .alert("Delete Event?", isPresented: $showDeleteConfirmation) {
                Button("Delete", role: .destructive) {
                    Task {
                        await viewModel.delete()
                        if viewModel.deleteSuccess {
                            dismiss()
                        }
                    }
                }
                Button("Cancel", role: .cancel) { }
            } message: {
                Text("Are you sure you want to delete this event? This action cannot be undone.")
            }
            .alert("Discard Changes?", isPresented: $showCancelConfirmation) {
                Button("Discard", role: .destructive) {
                    dismiss()
                }
                Button("Keep Editing", role: .cancel) { }
            } message: {
                Text("You have unsaved changes. Are you sure you want to discard them?")
            }
            .alert("Error", isPresented: $viewModel.showError) {
                Button("OK", role: .cancel) { }
            } message: {
                if let error = viewModel.error {
                    Text(error.localizedDescription)
                }
            }
            .overlay {
                if viewModel.isSaving {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(Color.black.opacity(0.2))
                }
            }
        }
    }

    private var navigationTitle: String {
        switch mode {
        case .create:
            return "New Event"
        case .edit:
            return "Edit Event"
        }
    }
}

// MARK: - View Model
@MainActor
class EventEditViewModel: ObservableObject {
    @Published var title: String = ""
    @Published var description: String = ""
    @Published var startTime: Date = Date()
    @Published var endTime: Date
    @Published var location: String = ""

    @Published var isSaving = false
    @Published var saveSuccess = false
    @Published var deleteSuccess = false
    @Published var showError = false
    @Published var error: Error?
    @Published var validationError: String?

    private let mode: EventEditMode
    private let apiClient: APIClientProtocol
    private let authManager: AuthManagerProtocol
    private var initialState: String = ""

    init(mode: EventEditMode, apiClient: APIClientProtocol, authManager: AuthManagerProtocol) {
        self.mode = mode
        self.apiClient = apiClient
        self.authManager = authManager

        // Set default end time to 1 hour after start
        self.endTime = Date().addingTimeInterval(3600)

        // Pre-fill if editing
        if case .edit(let event) = mode {
            self.title = event.title
            self.description = event.description ?? ""
            self.startTime = event.startTime
            self.endTime = event.endTime
            self.location = event.location ?? ""
            self.initialState = "\(title)\(description)\(startTime)\(endTime)\(location)"
        }
    }

    var canSave: Bool {
        !title.isEmpty && endTime > startTime
    }

    var hasChanges: Bool {
        let currentState = "\(title)\(description)\(startTime)\(endTime)\(location)"
        return currentState != initialState
    }

    func save() async {
        // Validate
        guard !title.isEmpty else {
            validationError = "Title is required"
            return
        }

        guard endTime > startTime else {
            validationError = "End time must be after start time"
            return
        }

        validationError = nil
        isSaving = true
        defer { isSaving = false }

        do {
            let eventRequest = CreateEventRequest(
                title: title,
                startTime: startTime,
                endTime: endTime,
                description: description.isEmpty ? nil : description
            )

            switch mode {
            case .create:
                _ = try await apiClient.createEvent(event: eventRequest)
            case .edit(let event):
                _ = try await apiClient.updateEvent(id: event.id, event: eventRequest)
            }

            saveSuccess = true

        } catch {
            print("Error saving event: \(error)")
            self.error = error
            self.showError = true
        }
    }

    func delete() async {
        guard case .edit(let event) = mode else { return }

        isSaving = true
        defer { isSaving = false }

        do {
            try await apiClient.deleteEvent(id: event.id)
            deleteSuccess = true
        } catch {
            print("Error deleting event: \(error)")
            self.error = error
            self.showError = true
        }
    }
}

// MARK: - Preview
#Preview("Create") {
    EventEditView(mode: .create)
        .environmentObject(DependencyContainer.shared)
}

#Preview("Edit") {
    let mockEvent = CalendarEvent(
        id: "1",
        title: "Team Standup",
        startTime: Date(),
        endTime: Date().addingTimeInterval(1800),
        location: "Conference Room A",
        description: "Daily team sync",
        attendees: nil,
        color: .blue,
        hasConflict: false,
        hasPrep: false,
        meetingPrep: nil
    )

    return EventEditView(mode: .edit(mockEvent))
        .environmentObject(DependencyContainer.shared)
}
