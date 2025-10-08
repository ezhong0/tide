/**
 * Network Task Repository
 * Concrete implementation of TaskRepository using API Client
 */

import Foundation

class NetworkTaskRepository: TaskRepository {
    private let apiClient: APIClientProtocol

    init(apiClient: APIClientProtocol) {
        self.apiClient = apiClient
    }

    // MARK: - Task Operations

    func getTasks(status: String?) async throws -> [Task] {
        return try await apiClient.getTasks(status: status)
    }

    func getTask(id: String) async throws -> Task {
        // Get task from the list
        let tasks = try await getTasks(status: nil)
        guard let task = tasks.first(where: { $0.id == id }) else {
            throw RepositoryError.notFound
        }
        return task
    }

    func createTask(task: CreateTaskRequest) async throws -> Task {
        return try await apiClient.createTask(task: task)
    }

    func updateTask(id: String, task: CreateTaskRequest) async throws -> Task {
        // TODO: Implement update task endpoint when backend is ready
        throw RepositoryError.notImplemented
    }

    func updateTaskStatus(taskId: String, status: String) async throws {
        try await apiClient.updateTaskStatus(taskId: taskId, status: status)
    }

    func deleteTask(id: String) async throws {
        // TODO: Implement delete task endpoint when backend is ready
        throw RepositoryError.notImplemented
    }
}
