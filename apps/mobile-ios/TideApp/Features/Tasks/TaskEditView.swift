/**
 * Task Edit View
 * Create or edit tasks
 */

import SwiftUI

struct TaskEditView: View {
    let taskId: String?
    @StateObject private var viewModel: TaskEditViewModel
    @EnvironmentObject var container: DependencyContainer
    @EnvironmentObject var navigationState: NavigationState
    @Environment(\.dismiss) private var dismiss
    @State private var showCancelConfirmation = false
    @FocusState private var focusedField: Field?

    enum Field {
        case title, description, newTag
    }

    init(taskId: String? = nil, dependencies: DependencyContainer = .shared) {
        self.taskId = taskId
        self._viewModel = StateObject(wrappedValue: dependencies.makeTaskEditViewModel(taskId: taskId))
    }

    var body: some View {
        NavigationStack {
            Form {
                // Title
                Section {
                    TextField("Task Title", text: $viewModel.title)
                        .focused($focusedField, equals: .title)
                        .accessibilityLabel("Task title")
                        .accessibilityHint("Enter a title for this task")
                }

                // Status & Priority
                Section {
                    Picker("Status", selection: $viewModel.status) {
                        ForEach(TaskStatus.allCases, id: \.self) { status in
                            Label(status.title, systemImage: status.icon)
                                .tag(status)
                        }
                    }
                    .accessibilityLabel("Task status")
                    .accessibilityHint("Select the current status of this task")
                    .accessibilityValue(viewModel.status.title)

                    Picker("Priority", selection: $viewModel.priority) {
                        ForEach(TaskPriority.allCases, id: \.self) { priority in
                            Text(priority.title)
                                .tag(priority)
                        }
                    }
                    .accessibilityLabel("Task priority")
                    .accessibilityHint("Select the priority level for this task")
                    .accessibilityValue(viewModel.priority.title)
                }

                // Due Date
                Section {
                    Toggle("Set Due Date", isOn: $viewModel.hasDueDate)
                        .accessibilityLabel("Set due date")
                        .accessibilityHint(viewModel.hasDueDate ? "Turn off to remove due date" : "Turn on to add a due date")

                    if viewModel.hasDueDate {
                        DatePicker(
                            "Due Date",
                            selection: $viewModel.dueDate,
                            displayedComponents: [.date]
                        )
                        .accessibilityLabel("Task due date")
                        .accessibilityHint("Select the date when this task is due")
                    }
                } header: {
                    Text("Due Date")
                }

                // Description
                Section {
                    TextEditor(text: $viewModel.description)
                        .frame(minHeight: 100)
                        .focused($focusedField, equals: .description)
                        .accessibilityLabel("Task description")
                        .accessibilityHint("Enter an optional description for this task")
                } header: {
                    Text("Description")
                }

                // Tags
                Section {
                    // Existing tags
                    if !viewModel.tags.isEmpty {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(viewModel.tags, id: \.self) { tag in
                                    HStack(spacing: 4) {
                                        Text(tag)
                                            .font(.callout)

                                        Button {
                                            viewModel.removeTag(tag)
                                        } label: {
                                            Image(systemName: "xmark.circle.fill")
                                                .font(.caption)
                                                .foregroundColor(.secondary)
                                        }
                                        .accessibilityLabel("Remove tag \(tag)")
                                        .accessibilityHint("Removes this tag from the task")
                                    }
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(Color.blue.opacity(0.1))
                                    .foregroundColor(.blue)
                                    .cornerRadius(16)
                                }
                            }
                        }
                    }

                    // Add new tag
                    Button {
                        viewModel.showAddTag = true
                    } label: {
                        Label("Add Tag", systemImage: "plus.circle.fill")
                    }
                    .accessibilityLabel("Add tag")
                    .accessibilityHint("Add a new tag to this task")
                } header: {
                    Text("Tags")
                }
            }
            .navigationTitle(taskId == nil ? "New Task" : "Edit Task")
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
                    .accessibilityLabel("Cancel")
                    .accessibilityHint(viewModel.hasChanges ? "Discard changes and return to previous screen" : "Return to previous screen")
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
                    .accessibilityLabel("Save task")
                    .accessibilityHint(viewModel.canSave ? "Save this task" : "Enter a title to save this task")
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
            .alert("Add Tag", isPresented: $viewModel.showAddTag) {
                TextField("Tag name", text: $viewModel.newTag)
                    .focused($focusedField, equals: .newTag)

                Button("Add") {
                    viewModel.addTag()
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
                if taskId != nil {
                    await viewModel.loadTask()
                }
            }
        }
    }
}

// MARK: - View Model
@MainActor
final class TaskEditViewModel: ObservableObject {
    @Published var title: String = ""
    @Published var description: String = ""
    @Published var status: TaskStatus = .todo
    @Published var priority: TaskPriority = .none
    @Published var hasDueDate: Bool = false
    @Published var dueDate: Date = Date().addingTimeInterval(86400) // Tomorrow
    @Published var tags: [String] = []
    @Published var showAddTag: Bool = false
    @Published var newTag: String = ""

    @Published var isLoading: Bool = false
    @Published var isSaving: Bool = false
    @Published var saveSuccess: Bool = false
    @Published var showError: Bool = false
    @Published var error: Error?

    private let taskId: String?
    private let apiClient: APIClientProtocol
    private let authManager: AuthManagerProtocol
    private var initialState: String = ""

    init(taskId: String?, apiClient: APIClientProtocol, authManager: AuthManagerProtocol) {
        self.taskId = taskId
        self.apiClient = apiClient
        self.authManager = authManager
    }

    var canSave: Bool {
        !title.isEmpty
    }

    var hasChanges: Bool {
        let currentState = "\(title)\(description)\(status)\(priority)\(hasDueDate)\(dueDate)\(tags)"
        return currentState != initialState && currentState.count > 0
    }

    func loadTask() async {
        guard let taskId = taskId else { return }

        isLoading = true
        defer { isLoading = false }

        do {
            let apiTask = try await apiClient.getTask(id: taskId)

            // Load task data into form
            title = apiTask.title
            description = apiTask.description ?? ""
            status = TaskStatus(rawValue: apiTask.status) ?? .todo
            priority = TaskPriority(rawValue: apiTask.priority) ?? .none
            hasDueDate = apiTask.dueDate != nil
            if let dueDate = apiTask.dueDate {
                self.dueDate = dueDate
            }
            tags = [] // TODO: Add tags support in API

            // Store initial state
            initialState = "\(title)\(description)\(status)\(priority)\(hasDueDate)\(dueDate)\(tags)"

        } catch {
            Logger.error("Error loading task", error: error)
            self.error = error
            self.showError = true
        }
    }

    func save() async {
        guard canSave else { return }

        isSaving = true
        defer { isSaving = false }

        do {
            let taskRequest = CreateTaskRequest(
                title: title,
                description: description.isEmpty ? nil : description,
                status: status.rawValue,
                priority: priority.rawValue,
                dueDate: hasDueDate ? dueDate : nil
            )

            if let taskId = taskId {
                // Update existing task
                _ = try await apiClient.updateTask(id: taskId, task: taskRequest)
            } else {
                // Create new task
                _ = try await apiClient.createTask(task: taskRequest)
            }

            saveSuccess = true

        } catch {
            Logger.error("Error saving task", error: error)
            self.error = error
            self.showError = true
        }
    }

    func addTag() {
        guard !newTag.isEmpty else { return }
        tags.append(newTag)
        newTag = ""
    }

    func removeTag(_ tag: String) {
        tags.removeAll { $0 == tag }
    }
}

// MARK: - Preview
#Preview("New Task") {
    TaskEditView()
        .environmentObject(NavigationState())
}

#Preview("Edit Task") {
    TaskEditView(taskId: "test-task-123")
        .environmentObject(NavigationState())
}
