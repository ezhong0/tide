import SwiftUI

struct TaskView: View {
    @State private var tasks: [Task] = []
    @State private var filter: TaskFilter = .all
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showingCreateTask = false
    @State private var selectedTask: Task?

    var filteredTasks: [Task] {
        switch filter {
        case .all:
            return tasks
        case .todo:
            return tasks.filter { $0.status == .todo }
        case .inProgress:
            return tasks.filter { $0.status == .inProgress }
        case .completed:
            return tasks.filter { $0.status == .completed }
        }
    }

    var todoTasks: [Task] {
        tasks.filter { $0.status == .todo }
    }

    var inProgressTasks: [Task] {
        tasks.filter { $0.status == .inProgress }
    }

    var completedTasks: [Task] {
        tasks.filter { $0.status == .completed }
    }

    var body: some View {
        NavigationView {
            List {
                // Error message
                if let error = errorMessage {
                    Section {
                        Text(error)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                }

                // Empty state
                if tasks.isEmpty && !isLoading {
                    Section {
                        EmptyTaskState()
                    }
                }

                // To Do Section
                if !todoTasks.isEmpty && (filter == .all || filter == .todo) {
                    Section(header: Text("To Do")) {
                        ForEach(todoTasks) { task in
                            TaskRow(task: task, onToggleComplete: {
                                toggleTaskStatus(task)
                            }, onDelete: {
                                deleteTask(task)
                            }, onTap: {
                                selectedTask = task
                            })
                        }
                    }
                }

                // In Progress Section
                if !inProgressTasks.isEmpty && (filter == .all || filter == .inProgress) {
                    Section(header: Text("In Progress")) {
                        ForEach(inProgressTasks) { task in
                            TaskRow(task: task, onToggleComplete: {
                                toggleTaskStatus(task)
                            }, onDelete: {
                                deleteTask(task)
                            }, onTap: {
                                selectedTask = task
                            })
                        }
                    }
                }

                // Completed Section
                if !completedTasks.isEmpty && (filter == .all || filter == .completed) {
                    Section(header: Text("Completed")) {
                        ForEach(completedTasks) { task in
                            TaskRow(task: task, onToggleComplete: {
                                toggleTaskStatus(task)
                            }, onDelete: {
                                deleteTask(task)
                            }, onTap: {
                                selectedTask = task
                            })
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .refreshable {
                await refreshTasks()
            }
            .navigationTitle("Tasks")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Menu {
                        ForEach(TaskFilter.allCases, id: \.self) { filterOption in
                            Button(filterOption.rawValue) {
                                filter = filterOption
                            }
                        }
                    } label: {
                        Label("Filter", systemImage: "line.3.horizontal.decrease.circle")
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingCreateTask = true }) {
                        Image(systemName: "plus.circle.fill")
                    }
                }
            }
            .sheet(isPresented: $showingCreateTask) {
                TaskCreateView { newTask in
                    tasks.append(newTask)
                    tasks.sort { $0.createdAt > $1.createdAt }
                }
            }
            .sheet(item: $selectedTask) { task in
                TaskEditView(task: task) { updatedTask in
                    if let index = tasks.firstIndex(where: { $0.id == updatedTask.id }) {
                        tasks[index] = updatedTask
                    }
                }
            }
            .onAppear {
                _Concurrency.Task {
                    await refreshTasks()
                }
            }
        }
    }

    // MARK: - Actions

    private func refreshTasks() async {
        isLoading = true
        errorMessage = nil

        do {
            tasks = try await TaskService.shared.fetchTasks()
            tasks.sort { $0.createdAt > $1.createdAt }
            print("✅ Loaded \(tasks.count) tasks")

        } catch {
            errorMessage = "Failed to load tasks: \(error.localizedDescription)"
            print("❌ Error fetching tasks: \(error)")
        }

        isLoading = false
    }

    private func toggleTaskStatus(_ task: Task) {
        _Concurrency.Task {
            do {
                let updatedTask: Task
                if task.status == .completed {
                    updatedTask = try await TaskService.shared.uncompleteTask(id: task.id)
                } else {
                    updatedTask = try await TaskService.shared.completeTask(id: task.id)
                }

                // Update local state
                if let index = tasks.firstIndex(where: { $0.id == task.id }) {
                    await MainActor.run {
                        tasks[index] = updatedTask
                    }
                }

            } catch {
                await MainActor.run {
                    errorMessage = "Failed to update task: \(error.localizedDescription)"
                }
            }
        }
    }

    private func deleteTask(_ task: Task) {
        _Concurrency.Task {
            do {
                try await TaskService.shared.deleteTask(id: task.id)

                // Remove from local state
                await MainActor.run {
                    tasks.removeAll { $0.id == task.id }
                }

            } catch {
                await MainActor.run {
                    errorMessage = "Failed to delete task: \(error.localizedDescription)"
                }
            }
        }
    }
}

// MARK: - Task Row
struct TaskRow: View {
    let task: Task
    let onToggleComplete: () -> Void
    let onDelete: () -> Void
    let onTap: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            // Checkbox
            Button(action: onToggleComplete) {
                Image(systemName: task.status.icon)
                    .font(.title3)
                    .foregroundColor(task.status == .completed ? .green : TideTheme.textSecondary)
            }
            .buttonStyle(.plain)

            // Task info
            VStack(alignment: .leading, spacing: 4) {
                Text(task.title)
                    .font(TideTheme.Typography.headline)
                    .strikethrough(task.status == .completed)
                    .foregroundColor(task.status == .completed ? TideTheme.textSecondary : TideTheme.textPrimary)

                if let description = task.description, !description.isEmpty {
                    Text(description)
                        .font(TideTheme.Typography.caption1)
                        .foregroundColor(TideTheme.textSecondary)
                        .lineLimit(2)
                }

                HStack(spacing: 8) {
                    // Priority badge
                    Text(task.priority.displayName)
                        .font(TideTheme.Typography.caption2)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(priorityColor(task.priority).opacity(0.2))
                        .foregroundColor(priorityColor(task.priority))
                        .cornerRadius(4)

                    // Due date
                    if let dueDate = task.dueDate {
                        HStack(spacing: 4) {
                            Image(systemName: "calendar")
                            Text(dueDate.formatted(date: .abbreviated, time: .omitted))
                        }
                        .font(TideTheme.Typography.caption2)
                        .foregroundColor(isDueSoon(dueDate) ? .red : TideTheme.textSecondary)
                    }
                }
                .padding(.top, 2)
            }

            Spacer()
        }
        .padding(.vertical, 4)
        .contentShape(Rectangle())
        .onTapGesture {
            onTap()
        }
        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
            Button(role: .destructive, action: onDelete) {
                Label("Delete", systemImage: "trash")
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

    private func isDueSoon(_ date: Date) -> Bool {
        let daysUntilDue = Calendar.current.dateComponents([.day], from: Date(), to: date).day ?? 0
        return daysUntilDue <= 1
    }
}

// MARK: - Empty Task State
struct EmptyTaskState: View {
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "checklist")
                .font(.system(size: 48))
                .foregroundColor(TideTheme.textSecondary)

            Text("No tasks yet")
                .font(TideTheme.Typography.headline)
                .foregroundColor(TideTheme.textPrimary)

            Text("Tap + to create your first task")
                .font(TideTheme.Typography.footnote)
                .foregroundColor(TideTheme.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
    }
}

// MARK: - Preview
#Preview {
    TaskView()
}
