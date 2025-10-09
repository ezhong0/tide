/**
 * Task Repository Protocol
 * Defines interface for task data access
 */

import Foundation

protocol TaskRepository {
    // MARK: - Task Operations
    func getTasks(status: String?) async throws -> [TaskAPIModel]
    func getTask(id: String) async throws -> TaskAPIModel
    func createTask(task: CreateTaskRequest) async throws -> TaskAPIModel
    func updateTask(id: String, task: CreateTaskRequest) async throws -> TaskAPIModel
    func updateTaskStatus(taskId: String, status: String) async throws
    func deleteTask(id: String) async throws
}
