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

            // Task list with state management
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
            .stateContent(
                isLoading: viewModel.isLoading,
                error: viewModel.error,
                isEmpty: viewModel.filteredTasks.isEmpty
            ) {
                EmptyView(
                    icon: "checkmark.circle",
                    title: "No tasks",
                    message: "Create a task to get started",
                    actionTitle: "New Task",
                    action: navigateToCreateTask
                )
            }
        }
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    navigateToCreateTask()
                } label: {
                    Image(systemName: "plus")
                }
                .accessibilityLabel("Create new task")
                .accessibilityHint("Opens a form to create a new task")
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
            HStack(spacing: Design.Spacing.sm) {
                ForEach(TaskFilter.allCases, id: \.self) { filter in
                    FilterChip(
                        title: filter.title,
                        count: viewModel.taskCount(for: filter),
                        isSelected: selectedFilter == filter
                    )
                    .onTapGesture {
                        withAnimation(Design.Animation.standard) {
                            selectedFilter = filter
                        }
                    }
                }
            }
            .padding(.horizontal, Design.Spacing.md)
            .padding(.vertical, Design.Spacing.sm)
        }
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
        HStack(spacing: Design.Spacing.xxs) {
            Text(title)
                .font(Design.Typography.Label.medium)

            if count > 0 {
                Text("\(count)")
                    .font(Design.Typography.Caption.semibold)
                    .padding(.horizontal, Design.Spacing.xxs)
                    .padding(.vertical, 2)
                    .background(isSelected ? Color.white.opacity(0.3) : Design.Colors.Border.light)
                    .cornerRadius(Design.CornerRadius.sm)
            }
        }
        .padding(.horizontal, Design.Spacing.md)
        .padding(.vertical, Design.Spacing.xs)
        .background(isSelected ? Design.Colors.Semantic.primary : Design.Colors.Background.secondary)
        .foregroundColor(isSelected ? .white : Design.Colors.Text.primary)
        .cornerRadius(Design.CornerRadius.xl)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(title) filter")
        .accessibilityValue("\(count) tasks")
        .accessibilityHint(isSelected ? "Currently selected" : "Tap to filter tasks by \(title.lowercased())")
        .accessibilityAddTraits(isSelected ? [.isSelected, .isButton] : .isButton)
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
                .font(Design.Typography.Headline.bold)

            Text("\(count)")
                .font(Design.Typography.Label.regular)
                .foregroundColor(Design.Colors.Text.secondary)

            Spacer()
        }
        .padding(Design.Spacing.md)
        .background(Design.Colors.Background.primary)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(status.title) section")
        .accessibilityValue("\(count) tasks")
        .accessibilityAddTraits(.isHeader)
    }
}

// MARK: - Task Row
struct TaskRow: View {
    let task: TideTask
    @ObservedObject var viewModel: TaskListViewModel

    var body: some View {
        HStack(spacing: Design.Spacing.sm) {
            // Checkbox
            Button {
                Task {
                    await viewModel.toggleTaskStatus(task)
                }
            } label: {
                Image(systemName: task.status == .done ? "checkmark.circle.fill" : "circle")
                    .font(Design.Typography.Title.bold)
                    .foregroundColor(task.status == .done ? .green : .gray)
            }
            .accessibilityLabel(task.status == .done ? "Mark task incomplete" : "Mark task complete")
            .accessibilityHint("Changes the completion status of this task")

            // Task content
            VStack(alignment: .leading, spacing: Design.Spacing.xxs) {
                Text(task.title)
                    .font(Design.Typography.Body.medium)
                    .strikethrough(task.status == .done)
                    .foregroundColor(task.status == .done ? Design.Colors.Text.secondary : Design.Colors.Text.primary)

                if let description = task.description {
                    Text(description)
                        .font(Design.Typography.Caption.regular)
                        .foregroundColor(Design.Colors.Text.secondary)
                        .lineLimit(2)
                }

                // Metadata row
                HStack(spacing: Design.Spacing.sm) {
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
        .padding(Design.Spacing.md)
        .background(Design.Colors.Background.secondary)
        .cornerRadius(Design.CornerRadius.md)
        .padding(.horizontal, Design.Spacing.md)
        .padding(.vertical, Design.Spacing.xxs)
        .accessibilityElement(children: .contain)
        .accessibilityLabel(accessibilityLabel)
        .accessibilityValue(accessibilityValue)
        .accessibilityHint("Tap to view task details, or swipe for more actions")
        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
            Button(role: .destructive) {
                Task {
                    await viewModel.deleteTask(task)
                }
            } label: {
                Label("Delete", systemImage: "trash")
            }
            .accessibilityLabel("Delete task")

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
            .accessibilityLabel(task.status == .done ? "Mark incomplete" : "Mark complete")
        }
    }

    private var accessibilityLabel: String {
        var label = task.title
        if let description = task.description {
            label += ", \(description)"
        }
        return label
    }

    private var accessibilityValue: String {
        var parts: [String] = []

        parts.append("Status: \(task.status.title)")

        if task.priority != .none {
            parts.append("Priority: \(task.priority.title)")
        }

        if let dueDate = task.dueDate {
            let dateStr = dueDateString(dueDate)
            if isDueDateOverdue(dueDate) {
                parts.append("Overdue: \(dateStr)")
            } else {
                parts.append("Due: \(dateStr)")
            }
        }

        if let tags = task.tags, !tags.isEmpty {
            parts.append("Tags: \(tags.joined(separator: ", "))")
        }

        return parts.joined(separator: ", ")
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
final class TaskListViewModel: ObservableObject {
    @Published var allTasks: [TideTask] = []
    @Published var isLoading = false
    @Published var error: Error?

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
        error = nil
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
            error = nil

        } catch {
            Logger.error("Error loading tasks", error: error)
            self.error = error
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
            Logger.error("Error updating task status", error: error)
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
            Logger.error("Error deleting task", error: error)
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
