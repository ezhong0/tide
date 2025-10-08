/**
 * Task List View
 * Display tasks grouped by status with filters
 */

import SwiftUI

struct TaskListView: View {
    @StateObject private var viewModel: TaskListViewModel
    @EnvironmentObject var container: DependencyContainer
    @EnvironmentObject var navigationState: NavigationState
    @State private var selectedFilter: TaskFilter = .all

    init(dependencies: DependencyContainer = .shared) {
        self._viewModel = StateObject(wrappedValue: dependencies.makeTaskListViewModel())
    }

    var body: some View {
        VStack(spacing: 0) {
            // Filter tabs
            filterTabs

            Divider()

            // Task list
            if viewModel.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if viewModel.filteredTasks.isEmpty {
                emptyState
            } else {
                ScrollView {
                    LazyVStack(spacing: 0, pinnedViews: [.sectionHeaders]) {
                        // Group by status
                        ForEach(TaskStatus.allCases, id: \.self) { status in
                            let tasks = viewModel.tasks(for: status, filter: selectedFilter)
                            if !tasks.isEmpty {
                                Section {
                                    ForEach(tasks) { task in
                                        TaskRow(task: task, viewModel: viewModel)
                                            .onTapGesture {
                                                navigateToTaskDetail(task.id)
                                            }
                                    }
                                } header: {
                                    TaskSectionHeader(status: status, count: tasks.count)
                                }
                            }
                        }
                    }
                }
            }
        }
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    navigateToCreateTask()
                } label: {
                    Image(systemName: "plus")
                }
            }
        }
        .task {
            await viewModel.loadTasks()
        }
    }

    // MARK: - Filter Tabs
    @ViewBuilder
    private var filterTabs: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(TaskFilter.allCases, id: \.self) { filter in
                    FilterChip(
                        title: filter.title,
                        count: viewModel.taskCount(for: filter),
                        isSelected: selectedFilter == filter
                    )
                    .onTapGesture {
                        withAnimation {
                            selectedFilter = filter
                        }
                    }
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 12)
        }
    }

    // MARK: - Empty State
    @ViewBuilder
    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.circle")
                .font(.system(size: 60))
                .foregroundColor(.green)

            Text("No tasks")
                .font(.title3)
                .fontWeight(.semibold)

            Text("Create a task to get started")
                .font(.callout)
                .foregroundColor(.secondary)

            Button {
                navigateToCreateTask()
            } label: {
                Label("New Task", systemImage: "plus")
            }
            .buttonStyle(.borderedProminent)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // MARK: - Helpers
    private func navigateToTaskDetail(_ taskId: String) {
        navigationState.tasksPath.append(TaskDestination.detail(taskId: taskId))
    }

    private func navigateToCreateTask() {
        navigationState.tasksPath.append(TaskDestination.edit(taskId: nil))
    }
}

// MARK: - Filter Chip
struct FilterChip: View {
    let title: String
    let count: Int
    let isSelected: Bool

    var body: some View {
        HStack(spacing: 6) {
            Text(title)
                .font(.subheadline)
                .fontWeight(.medium)

            if count > 0 {
                Text("\(count)")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(isSelected ? Color.white.opacity(0.3) : Color.primary.opacity(0.1))
                    .cornerRadius(8)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(isSelected ? Color.blue : Color(.secondarySystemBackground))
        .foregroundColor(isSelected ? .white : .primary)
        .cornerRadius(20)
    }
}

// MARK: - Task Section Header
struct TaskSectionHeader: View {
    let status: TaskStatus
    let count: Int

    var body: some View {
        HStack {
            Image(systemName: status.icon)
                .foregroundColor(status.color)

            Text(status.title)
                .font(.headline)

            Text("\(count)")
                .font(.subheadline)
                .foregroundColor(.secondary)

            Spacer()
        }
        .padding()
        .background(Color(.systemBackground))
    }
}

// MARK: - Task Row
struct TaskRow: View {
    let task: TideTask
    @ObservedObject var viewModel: TaskListViewModel

    var body: some View {
        HStack(spacing: 12) {
            // Checkbox
            Button {
                Task {
                    await viewModel.toggleTaskStatus(task)
                }
            } label: {
                Image(systemName: task.status == .done ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundColor(task.status == .done ? .green : .gray)
            }

            // Task content
            VStack(alignment: .leading, spacing: 4) {
                Text(task.title)
                    .font(.callout)
                    .fontWeight(.medium)
                    .strikethrough(task.status == .done)
                    .foregroundColor(task.status == .done ? .secondary : .primary)

                if let description = task.description {
                    Text(description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                }

                // Metadata row
                HStack(spacing: 12) {
                    // Priority
                    if task.priority != .none {
                        HStack(spacing: 4) {
                            Image(systemName: "flag.fill")
                                .font(.caption2)
                                .foregroundColor(task.priority.color)

                            Text(task.priority.title)
                                .font(.caption2)
                                .foregroundColor(task.priority.color)
                        }
                    }

                    // Due date
                    if let dueDate = task.dueDate {
                        HStack(spacing: 4) {
                            Image(systemName: "calendar")
                                .font(.caption2)

                            Text(dueDateString(dueDate))
                                .font(.caption2)
                        }
                        .foregroundColor(isDueDateOverdue(dueDate) ? .red : .secondary)
                    }

                    // Tags
                    if let tags = task.tags, !tags.isEmpty {
                        HStack(spacing: 4) {
                            Image(systemName: "tag")
                                .font(.caption2)

                            Text(tags.first ?? "")
                                .font(.caption2)

                            if tags.count > 1 {
                                Text("+\(tags.count - 1)")
                                    .font(.caption2)
                            }
                        }
                        .foregroundColor(.secondary)
                    }
                }
            }

            Spacer()

            // Status indicator
            Circle()
                .fill(task.status.color)
                .frame(width: 8, height: 8)
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(8)
        .padding(.horizontal)
        .padding(.vertical, 4)
        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
            Button(role: .destructive) {
                Task {
                    await viewModel.deleteTask(task)
                }
            } label: {
                Label("Delete", systemImage: "trash")
            }

            Button {
                Task {
                    await viewModel.toggleTaskStatus(task)
                }
            } label: {
                Label(
                    task.status == .done ? "Undo" : "Complete",
                    systemImage: task.status == .done ? "arrow.uturn.backward" : "checkmark"
                )
            }
            .tint(.green)
        }
    }

    private func dueDateString(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        return formatter.string(from: date)
    }

    private func isDueDateOverdue(_ date: Date) -> Bool {
        date < Date() && task.status != .done
    }
}

// MARK: - View Model
@MainActor
class TaskListViewModel: ObservableObject {
    @Published var allTasks: [TideTask] = []
    @Published var isLoading = false

    private let apiClient: APIClientProtocol
    private let authManager: AuthManagerProtocol

    init(apiClient: APIClientProtocol, authManager: AuthManagerProtocol) {
        self.apiClient = apiClient
        self.authManager = authManager
    }

    var filteredTasks: [TideTask] {
        allTasks
    }

    func loadTasks() async {
        isLoading = true
        defer { isLoading = false }

        do {
            // Fetch real tasks from API
            let fetchedTasks = try await apiClient.getTasks(status: nil)

            // Convert API Task to TideTask
            allTasks = fetchedTasks.map { apiTask in
                TideTask(
                    id: apiTask.id,
                    title: apiTask.title,
                    description: apiTask.description,
                    status: TaskStatus(rawValue: apiTask.status) ?? .todo,
                    priority: TaskPriority(rawValue: apiTask.priority) ?? .none,
                    dueDate: apiTask.dueDate,
                    tags: nil // TODO: Add tags support to API
                )
            }

        } catch {
            print("Error loading tasks: \(error)")
            // On error, show empty list instead of mock data
            allTasks = []
        }
    }

    func tasks(for status: TaskStatus, filter: TaskFilter) -> [TideTask] {
        allTasks.filter { task in
            // Status filter
            guard task.status == status else { return false }

            // Additional filter
            switch filter {
            case .all:
                return true
            case .today:
                guard let dueDate = task.dueDate else { return false }
                return Calendar.current.isDateInToday(dueDate)
            case .week:
                guard let dueDate = task.dueDate else { return false }
                return Calendar.current.isDate(dueDate, equalTo: Date(), toGranularity: .weekOfYear)
            case .priority:
                return task.priority != .none
            }
        }
    }

    func taskCount(for filter: TaskFilter) -> Int {
        switch filter {
        case .all:
            return allTasks.count
        case .today:
            return allTasks.filter { task in
                guard let dueDate = task.dueDate else { return false }
                return Calendar.current.isDateInToday(dueDate)
            }.count
        case .week:
            return allTasks.filter { task in
                guard let dueDate = task.dueDate else { return false }
                return Calendar.current.isDate(dueDate, equalTo: Date(), toGranularity: .weekOfYear)
            }.count
        case .priority:
            return allTasks.filter { $0.priority != .none }.count
        }
    }

    func toggleTaskStatus(_ task: TideTask) async {
        guard let index = allTasks.firstIndex(where: { $0.id == task.id }) else { return }

        let newStatus: TaskStatus
        switch task.status {
        case .todo:
            newStatus = .inProgress
        case .inProgress:
            newStatus = .done
        case .done:
            newStatus = .todo
        }

        // Update local state optimistically
        allTasks[index] = TideTask(
            id: task.id,
            title: task.title,
            description: task.description,
            status: newStatus,
            priority: task.priority,
            dueDate: task.dueDate,
            tags: task.tags
        )

        // Update via API
        do {
            try await apiClient.updateTaskStatus(taskId: task.id, status: newStatus.rawValue)
        } catch {
            print("Error updating task status: \(error)")
            // Revert on error
            allTasks[index] = task
        }
    }

    func deleteTask(_ task: TideTask) async {
        // Remove locally optimistically
        allTasks.removeAll { $0.id == task.id }

        // Delete via API
        do {
            try await apiClient.deleteTask(id: task.id)
        } catch {
            print("Error deleting task: \(error)")
            // Reload to restore on error
            await loadTasks()
        }
    }

}

// MARK: - Models
struct TideTask: Identifiable {
    let id: String
    let title: String
    let description: String?
    let status: TaskStatus
    let priority: TaskPriority
    let dueDate: Date?
    let tags: [String]?
}

enum TaskStatus: String, CaseIterable {
    case todo = "To Do"
    case inProgress = "In Progress"
    case done = "Done"

    var title: String { rawValue }

    var icon: String {
        switch self {
        case .todo: return "circle"
        case .inProgress: return "clock"
        case .done: return "checkmark.circle.fill"
        }
    }

    var color: Color {
        switch self {
        case .todo: return .gray
        case .inProgress: return .blue
        case .done: return .green
        }
    }
}

enum TaskPriority: String, CaseIterable {
    case none = "None"
    case low = "Low"
    case medium = "Medium"
    case high = "High"
    case critical = "Critical"

    var title: String { rawValue }

    var color: Color {
        switch self {
        case .none: return .gray
        case .low: return .green
        case .medium: return .orange
        case .high: return .red
        case .critical: return .purple
        }
    }
}

enum TaskFilter: String, CaseIterable {
    case all = "All"
    case today = "Today"
    case week = "This Week"
    case priority = "Priority"

    var title: String { rawValue }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        TaskListView()
            .navigationTitle("Tasks")
            .environmentObject(NavigationState())
    }
}
