/**
 * Task API Models
 * Data transfer objects for task API endpoints
 */

import Foundation

// MARK: - Task API Response

struct TaskAPIModel: Codable, Identifiable {
    let id: String
    let title: String
    let description: String?
    let status: String
    let priority: String?
    let dueDate: Date?
    let createdAt: Date
    let updatedAt: Date?
    let userId: String?
    let isCompleted: Bool?

    enum CodingKeys: String, CodingKey {
        case id
        case title
        case description
        case status
        case priority
        case dueDate = "due_date"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case userId = "user_id"
        case isCompleted = "is_completed"
    }
}

// MARK: - Create Task Request

struct CreateTaskRequest: Codable {
    let title: String
    let description: String?
    let priority: String?
    let dueDate: Date?

    enum CodingKeys: String, CodingKey {
        case title
        case description
        case priority
        case dueDate = "due_date"
    }
}
