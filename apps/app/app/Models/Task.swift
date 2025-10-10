import Foundation

// MARK: - Task Model
struct Task: Identifiable, Codable {
    let id: String
    var title: String
    var description: String?
    var status: TaskStatus
    var priority: TaskPriority
    var dueDate: Date?
    let createdAt: Date
    var completedAt: Date?

    init(
        id: String = UUID().uuidString,
        title: String,
        description: String? = nil,
        status: TaskStatus = .todo,
        priority: TaskPriority = .medium,
        dueDate: Date? = nil,
        createdAt: Date = Date(),
        completedAt: Date? = nil
    ) {
        self.id = id
        self.title = title
        self.description = description
        self.status = status
        self.priority = priority
        self.dueDate = dueDate
        self.createdAt = createdAt
        self.completedAt = completedAt
    }
}

// MARK: - Task Status
enum TaskStatus: String, Codable, CaseIterable {
    case todo = "todo"
    case inProgress = "in_progress"
    case completed = "completed"

    var displayName: String {
        switch self {
        case .todo:
            return "To Do"
        case .inProgress:
            return "In Progress"
        case .completed:
            return "Completed"
        }
    }

    var icon: String {
        switch self {
        case .todo:
            return "circle"
        case .inProgress:
            return "circle.lefthalf.filled"
        case .completed:
            return "checkmark.circle.fill"
        }
    }
}

// MARK: - Task Priority
enum TaskPriority: String, Codable, CaseIterable {
    case low
    case medium
    case high

    var displayName: String {
        switch self {
        case .low:
            return "Low"
        case .medium:
            return "Medium"
        case .high:
            return "High"
        }
    }

    var color: String {
        switch self {
        case .low:
            return "blue"
        case .medium:
            return "orange"
        case .high:
            return "red"
        }
    }
}

// MARK: - Task Filter
enum TaskFilter: String, CaseIterable {
    case all = "All"
    case todo = "To Do"
    case inProgress = "In Progress"
    case completed = "Completed"
}
