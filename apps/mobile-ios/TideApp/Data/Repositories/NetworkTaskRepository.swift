/**
 * Network Task Repository
 * Concrete implementation of TaskRepository using API Client
 */

import Foundation

final class NetworkTaskRepository: TaskRepository {
    private let apiClient: APIClientProtocol

    init(apiClient: APIClientProtocol) {
        self.apiClient = apiClient
    }

    // MARK: - Task Operations

    func getTasks(status: String?) async throws -> [TaskAPIModel] {
        return try await apiClient.getTasks(status: status)
    }

    func getTask(id: String) async throws -> TaskAPIModel {
        return try await apiClient.getTask(id: id)
    }

    func createTask(task: CreateTaskRequest) async throws -> TaskAPIModel {
        return try await apiClient.createTask(task: task)
    }

    func updateTask(id: String, task: CreateTaskRequest) async throws -> TaskAPIModel {
        return try await apiClient.updateTask(id: id, task: task)
    }

    func updateTaskStatus(taskId: String, status: String) async throws {
        try await apiClient.updateTaskStatus(taskId: taskId, status: status)
    }

    func deleteTask(id: String) async throws {
        try await apiClient.deleteTask(id: id)
    }
}
