/**
 * Task Repository Protocol
 * Defines interface for task data access
 */

import Foundation

protocol TaskRepository {
    // MARK: - Task Operations
    func getTasks(status: String?) async throws -> [Task]
    func getTask(id: String) async throws -> Task
    func createTask(task: CreateTaskRequest) async throws -> Task
    func updateTask(id: String, task: CreateTaskRequest) async throws -> Task
    func updateTaskStatus(taskId: String, status: String) async throws
    func deleteTask(id: String) async throws
}
