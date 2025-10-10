import Foundation

class TaskService {
    static let shared = TaskService()

    private init() {}

    // MARK: - API Response Models

    struct TaskResponse: Codable {
        let id: String
        let userId: String
        let title: String
        let description: String?
        let status: String
        let priority: String
        let dueDate: Date?
        let createdAt: Date
        let completedAt: Date?

        enum CodingKeys: String, CodingKey {
            case id, userId, title, description, status, priority, dueDate, createdAt, completedAt
        }
    }

    struct FetchTasksResponse: Codable {
        let tasks: [TaskResponse]
        let count: Int
    }

    struct CreateTaskRequest: Codable {
        let userId: String
        let title: String
        let description: String?
        let priority: String
        let dueDate: Date?
    }

    struct UpdateTaskRequest: Codable {
        let title: String?
        let description: String?
        let status: String?
        let priority: String?
        let dueDate: Date?
    }

    struct TaskActionResponse: Codable {
        let success: Bool
        let task: TaskResponse?
        let message: String?
    }

    // MARK: - Public Methods

    /// Fetch tasks from the API gateway
    func fetchTasks(status: TaskStatus? = nil) async throws -> [app.Task] {
        guard let userId = await AuthManager.shared.currentUser?.id.uuidString else {
            throw TaskServiceError.notAuthenticated
        }

        var endpoint = "/api/workflow/tasks/\(userId)"
        if let status = status {
            endpoint += "?status=\(status.rawValue)"
        }

        let response: FetchTasksResponse = try await APIClient.shared.get(endpoint: endpoint)

        return response.tasks.compactMap { convertToTask($0) }
    }

    /// Create a new task
    func createTask(title: String, description: String? = nil, priority: TaskPriority = .medium, dueDate: Date? = nil) async throws -> app.Task {
        guard let userId = await AuthManager.shared.currentUser?.id.uuidString else {
            throw TaskServiceError.notAuthenticated
        }

        let request = CreateTaskRequest(
            userId: userId,
            title: title,
            description: description,
            priority: priority.rawValue,
            dueDate: dueDate
        )

        let endpoint = "/api/workflow/tasks"

        let response: TaskActionResponse = try await APIClient.shared.post(
            endpoint: endpoint,
            body: request
        )

        guard let taskResponse = response.task else {
            throw TaskServiceError.createFailed(response.message ?? "Unknown error")
        }

        guard let task = convertToTask(taskResponse) else {
            throw TaskServiceError.createFailed("Failed to parse task response")
        }

        print("✅ Task created successfully: \(task.id)")
        return task
    }

    /// Update a task
    func updateTask(id: String, title: String? = nil, description: String? = nil, status: TaskStatus? = nil, priority: TaskPriority? = nil, dueDate: Date? = nil) async throws -> app.Task {
        guard await AuthManager.shared.currentUser != nil else {
            throw TaskServiceError.notAuthenticated
        }

        let request = UpdateTaskRequest(
            title: title,
            description: description,
            status: status?.rawValue,
            priority: priority?.rawValue,
            dueDate: dueDate
        )

        let endpoint = "/api/workflow/tasks/\(id)"

        let response: TaskActionResponse = try await APIClient.shared.patch(
            endpoint: endpoint,
            body: request
        )

        guard let taskResponse = response.task else {
            throw TaskServiceError.updateFailed(response.message ?? "Unknown error")
        }

        guard let task = convertToTask(taskResponse) else {
            throw TaskServiceError.updateFailed("Failed to parse task response")
        }

        print("✅ Task updated successfully: \(task.id)")
        return task
    }

    /// Delete a task
    func deleteTask(id: String) async throws {
        guard await AuthManager.shared.currentUser != nil else {
            throw TaskServiceError.notAuthenticated
        }

        let endpoint = "/api/workflow/tasks/\(id)"

        let response: TaskActionResponse = try await APIClient.shared.delete(endpoint: endpoint)

        if !response.success {
            throw TaskServiceError.deleteFailed(response.message ?? "Unknown error")
        }

        print("✅ Task deleted successfully: \(id)")
    }

    /// Mark a task as complete
    func completeTask(id: String) async throws -> app.Task {
        return try await updateTask(id: id, status: .completed)
    }

    /// Mark a task as incomplete
    func uncompleteTask(id: String) async throws -> app.Task {
        return try await updateTask(id: id, status: .todo)
    }

    // MARK: - Private Helpers

    private func convertToTask(_ response: TaskResponse) -> app.Task? {
        // Map status string to enum
        guard let status = TaskStatus(rawValue: response.status) else {
            print("⚠️ Invalid task status: \(response.status)")
            return nil
        }

        // Map priority string to enum
        guard let priority = TaskPriority(rawValue: response.priority) else {
            print("⚠️ Invalid task priority: \(response.priority)")
            return nil
        }

        return app.Task(
            id: response.id,
            title: response.title,
            description: response.description,
            status: status,
            priority: priority,
            dueDate: response.dueDate,
            createdAt: response.createdAt,
            completedAt: response.completedAt
        )
    }
}

// MARK: - Errors
enum TaskServiceError: LocalizedError {
    case notAuthenticated
    case createFailed(String)
    case updateFailed(String)
    case deleteFailed(String)

    var errorDescription: String? {
        switch self {
        case .notAuthenticated:
            return "User not authenticated. Please login first."
        case .createFailed(let message):
            return "Failed to create task: \(message)"
        case .updateFailed(let message):
            return "Failed to update task: \(message)"
        case .deleteFailed(let message):
            return "Failed to delete task: \(message)"
        }
    }
}
