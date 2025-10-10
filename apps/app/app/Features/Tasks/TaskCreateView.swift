import SwiftUI

struct TaskCreateView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var title: String = ""
    @State private var description: String = ""
    @State private var priority: TaskPriority = .medium
    @State private var dueDate: Date = Date()
    @State private var hasDueDate: Bool = false
    @State private var isCreating = false
    @State private var errorMessage: String?

    let onTaskCreated: (Task) -> Void

    var body: some View {
        NavigationView {
            Form {
                // Title
                Section(header: Text("Title")) {
                    TextField("Task title", text: $title)
                }

                // Description
                Section(header: Text("Description (Optional)")) {
                    TextEditor(text: $description)
                        .frame(minHeight: 100)
                }

                // Priority
                Section(header: Text("Priority")) {
                    Picker("Priority", selection: $priority) {
                        ForEach(TaskPriority.allCases, id: \.self) { priority in
                            HStack {
                                Circle()
                                    .fill(priorityColor(priority))
                                    .frame(width: 12, height: 12)
                                Text(priority.displayName)
                            }
                            .tag(priority)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                // Due Date
                Section(header: Text("Due Date (Optional)")) {
                    Toggle("Set due date", isOn: $hasDueDate)

                    if hasDueDate {
                        DatePicker("Due date", selection: $dueDate, displayedComponents: [.date, .hourAndMinute])
                    }
                }

                // Error message
                if let error = errorMessage {
                    Section {
                        Text(error)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                }
            }
            .navigationTitle("New Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .disabled(isCreating)
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: createTask) {
                        if isCreating {
                            ProgressView()
                        } else {
                            Text("Create")
                                .fontWeight(.semibold)
                        }
                    }
                    .disabled(!canCreate || isCreating)
                }
            }
        }
    }

    // MARK: - Computed Properties

    private var canCreate: Bool {
        !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    // MARK: - Actions

    private func createTask() {
        isCreating = true
        errorMessage = nil

        _Concurrency.Task {
            do {
                let newTask = try await TaskService.shared.createTask(
                    title: title.trimmingCharacters(in: .whitespacesAndNewlines),
                    description: description.isEmpty ? nil : description,
                    priority: priority,
                    dueDate: hasDueDate ? dueDate : nil
                )

                await MainActor.run {
                    onTaskCreated(newTask)
                    dismiss()
                }

            } catch {
                await MainActor.run {
                    errorMessage = "Failed to create task: \(error.localizedDescription)"
                    isCreating = false
                }
                print("❌ Error creating task: \(error)")
            }
        }
    }

    private func priorityColor(_ priority: TaskPriority) -> Color {
        switch priority {
        case .low:
            return .blue
        case .medium:
            return .orange
        case .high:
            return .red
        }
    }
}

// MARK: - Task Edit View
struct TaskEditView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var title: String
    @State private var description: String
    @State private var priority: TaskPriority
    @State private var status: TaskStatus
    @State private var dueDate: Date
    @State private var hasDueDate: Bool
    @State private var isUpdating = false
    @State private var errorMessage: String?

    let task: Task
    let onTaskUpdated: (Task) -> Void

    init(task: Task, onTaskUpdated: @escaping (Task) -> Void) {
        self.task = task
        self.onTaskUpdated = onTaskUpdated

        _title = State(initialValue: task.title)
        _description = State(initialValue: task.description ?? "")
        _priority = State(initialValue: task.priority)
        _status = State(initialValue: task.status)
        _dueDate = State(initialValue: task.dueDate ?? Date())
        _hasDueDate = State(initialValue: task.dueDate != nil)
    }

    var body: some View {
        NavigationView {
            Form {
                // Title
                Section(header: Text("Title")) {
                    TextField("Task title", text: $title)
                }

                // Description
                Section(header: Text("Description (Optional)")) {
                    TextEditor(text: $description)
                        .frame(minHeight: 100)
                }

                // Status
                Section(header: Text("Status")) {
                    Picker("Status", selection: $status) {
                        ForEach(TaskStatus.allCases, id: \.self) { status in
                            HStack {
                                Image(systemName: status.icon)
                                Text(status.displayName)
                            }
                            .tag(status)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                // Priority
                Section(header: Text("Priority")) {
                    Picker("Priority", selection: $priority) {
                        ForEach(TaskPriority.allCases, id: \.self) { priority in
                            HStack {
                                Circle()
                                    .fill(priorityColor(priority))
                                    .frame(width: 12, height: 12)
                                Text(priority.displayName)
                            }
                            .tag(priority)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                // Due Date
                Section(header: Text("Due Date (Optional)")) {
                    Toggle("Set due date", isOn: $hasDueDate)

                    if hasDueDate {
                        DatePicker("Due date", selection: $dueDate, displayedComponents: [.date, .hourAndMinute])
                    }
                }

                // Error message
                if let error = errorMessage {
                    Section {
                        Text(error)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                }
            }
            .navigationTitle("Edit Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .disabled(isUpdating)
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: updateTask) {
                        if isUpdating {
                            ProgressView()
                        } else {
                            Text("Save")
                                .fontWeight(.semibold)
                        }
                    }
                    .disabled(!canSave || isUpdating)
                }
            }
        }
    }

    // MARK: - Computed Properties

    private var canSave: Bool {
        !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    // MARK: - Actions

    private func updateTask() {
        isUpdating = true
        errorMessage = nil

        _Concurrency.Task {
            do {
                let updatedTask = try await TaskService.shared.updateTask(
                    id: task.id,
                    title: title.trimmingCharacters(in: .whitespacesAndNewlines),
                    description: description.isEmpty ? nil : description,
                    status: status,
                    priority: priority,
                    dueDate: hasDueDate ? dueDate : nil
                )

                await MainActor.run {
                    onTaskUpdated(updatedTask)
                    dismiss()
                }

            } catch {
                await MainActor.run {
                    errorMessage = "Failed to update task: \(error.localizedDescription)"
                    isUpdating = false
                }
                print("❌ Error updating task: \(error)")
            }
        }
    }

    private func priorityColor(_ priority: TaskPriority) -> Color {
        switch priority {
        case .low:
            return .blue
        case .medium:
            return .orange
        case .high:
            return .red
        }
    }
}

// MARK: - Preview
#Preview {
    TaskCreateView { _ in }
}
