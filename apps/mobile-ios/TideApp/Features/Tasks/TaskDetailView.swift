/**
 * Task Detail View
 * Display full task details with edit/delete actions
 */

import SwiftUI

struct TaskDetailView: View {
    let taskId: String
    @StateObject private var viewModel: TaskDetailViewModel
    @EnvironmentObject var container: DependencyContainer
    @EnvironmentObject var navigationState: NavigationState
    @Environment(\.dismiss) private var dismiss
    @State private var showDeleteConfirmation = false

    init(taskId: String, dependencies: DependencyContainer = .shared) {
        self.taskId = taskId
        self._viewModel = StateObject(wrappedValue: dependencies.makeTaskDetailViewModel(taskId: taskId))
    }

    var body: some View {
        ScrollView {
            if viewModel.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(.top, 100)
            } else if let task = viewModel.task {
                VStack(alignment: .leading, spacing: 24) {
                    // Title with checkbox
                    HStack(alignment: .top, spacing: 12) {
                        Button {
                            Task {
                                await viewModel.toggleStatus()
                            }
                        } label: {
                            Image(systemName: task.status == .done ? "checkmark.circle.fill" : "circle")
                                .font(.title2)
                                .foregroundColor(task.status == .done ? .green : .gray)
                        }

                        Text(task.title)
                            .font(.title2)
                            .fontWeight(.bold)
                            .strikethrough(task.status == .done)
                    }

                    // Status
                    HStack(spacing: 12) {
                        Label(task.status.title, systemImage: task.status.icon)
                            .font(.callout)
                            .foregroundColor(task.status.color)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(task.status.color.opacity(0.1))
                            .cornerRadius(8)

                        // Priority
                        if task.priority != .none {
                            Label(task.priority.title, systemImage: "flag.fill")
                                .font(.callout)
                                .foregroundColor(task.priority.color)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(task.priority.color.opacity(0.1))
                                .cornerRadius(8)
                        }
                    }

                    // Due date
                    if let dueDate = task.dueDate {
                        VStack(alignment: .leading, spacing: 8) {
                            Label("Due Date", systemImage: "calendar")
                                .font(.headline)
                                .foregroundColor(.secondary)

                            Text(dueDateString(dueDate))
                                .font(.callout)
                                .foregroundColor(isDueDateOverdue(dueDate, status: task.status) ? .red : .primary)
                                .padding(.leading, 28)
                        }
                    }

                    // Description
                    if let description = task.description, !description.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Label("Description", systemImage: "doc.text")
                                .font(.headline)
                                .foregroundColor(.secondary)

                            Text(description)
                                .font(.callout)
                                .padding(.leading, 28)
                        }
                    }

                    // Tags
                    if let tags = task.tags, !tags.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Label("Tags", systemImage: "tag")
                                .font(.headline)
                                .foregroundColor(.secondary)

                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 8) {
                                    ForEach(tags, id: \.self) { tag in
                                        Text(tag)
                                            .font(.caption)
                                            .padding(.horizontal, 12)
                                            .padding(.vertical, 6)
                                            .background(Color.blue.opacity(0.1))
                                            .foregroundColor(.blue)
                                            .cornerRadius(16)
                                    }
                                }
                                .padding(.leading, 28)
                            }
                        }
                    }

                    // Created/Updated timestamps
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Created \(task.createdAt, style: .relative)")
                            .font(.caption)
                            .foregroundColor(.secondary)

                        if let updatedAt = task.updatedAt {
                            Text("Updated \(updatedAt, style: .relative)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                .padding()
            } else if let error = viewModel.error {
                ErrorView(error: error) {
                    Task {
                        await viewModel.loadTask()
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

                    Divider()

                    Button {
                        Task {
                            await viewModel.toggleStatus()
                        }
                    } label: {
                        if let task = viewModel.task {
                            Label(
                                task.status == .done ? "Mark Incomplete" : "Mark Complete",
                                systemImage: task.status == .done ? "circle" : "checkmark.circle"
                            )
                        }
                    }

                    Divider()

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
        .alert("Delete Task?", isPresented: $showDeleteConfirmation) {
            Button("Delete", role: .destructive) {
                Task {
                    await viewModel.deleteTask()
                    dismiss()
                }
            }
            Button("Cancel", role: .cancel) { }
        } message: {
            Text("Are you sure you want to delete this task?")
        }
        .task {
            await viewModel.loadTask()
        }
    }

    // MARK: - Helpers
    private func dueDateString(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .long
        formatter.timeStyle = .none
        return formatter.string(from: date)
    }

    private func isDueDateOverdue(_ date: Date, status: TaskStatus) -> Bool {
        date < Date() && status != .done
    }

    private func navigateToEdit() {
        navigationState.tasksPath.append(TaskDestination.edit(taskId: taskId))
    }
}

// MARK: - View Model
@MainActor
class TaskDetailViewModel: ObservableObject {
    @Published var task: TideTaskDetail?
    @Published var isLoading = false
    @Published var error: Error?

    private let taskId: String
    private let apiClient: APIClientProtocol
    private let authManager: AuthManagerProtocol

    init(taskId: String, apiClient: APIClientProtocol, authManager: AuthManagerProtocol) {
        self.taskId = taskId
        self.apiClient = apiClient
        self.authManager = authManager
    }

    func loadTask() async {
        isLoading = true
        defer { isLoading = false }

        do {
            let apiTask = try await apiClient.getTask(id: taskId)

            // Convert API Task to TideTaskDetail
            task = TideTaskDetail(
                id: apiTask.id,
                title: apiTask.title,
                description: apiTask.description,
                status: TaskStatus(rawValue: apiTask.status) ?? .todo,
                priority: TaskPriority(rawValue: apiTask.priority) ?? .none,
                dueDate: apiTask.dueDate,
                tags: nil, // TODO: Add tags support in API
                createdAt: apiTask.createdAt ?? Date(),
                updatedAt: apiTask.updatedAt
            )

        } catch {
            print("Error loading task: \(error)")
            self.error = error
        }
    }

    func toggleStatus() async {
        guard var task = task else { return }

        let newStatus: TaskStatus
        switch task.status {
        case .todo:
            newStatus = .inProgress
        case .inProgress:
            newStatus = .done
        case .done:
            newStatus = .todo
        }

        // Update locally optimistically
        task = TideTaskDetail(
            id: task.id,
            title: task.title,
            description: task.description,
            status: newStatus,
            priority: task.priority,
            dueDate: task.dueDate,
            tags: task.tags,
            createdAt: task.createdAt,
            updatedAt: Date()
        )
        self.task = task

        // Update via API
        do {
            try await apiClient.updateTaskStatus(taskId: taskId, status: newStatus.rawValue)
        } catch {
            print("Error updating task status: \(error)")
            // Reload on error
            await loadTask()
        }
    }

    func deleteTask() async {
        do {
            try await apiClient.deleteTask(id: taskId)
        } catch {
            print("Error deleting task: \(error)")
            self.error = error
        }
    }
}

// MARK: - Models
struct TideTaskDetail: Identifiable {
    let id: String
    let title: String
    let description: String?
    let status: TaskStatus
    let priority: TaskPriority
    let dueDate: Date?
    let tags: [String]?
    let createdAt: Date
    let updatedAt: Date?
}

// MARK: - Preview
#Preview {
    NavigationStack {
        TaskDetailView(taskId: "test-task-123")
            .environmentObject(NavigationState())
    }
}
