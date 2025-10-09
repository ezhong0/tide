/**
 * Database Models
 * Supabase database entity models
 */

import Foundation

// MARK: - Conversation

struct DBConversation: Codable, Identifiable {
    let id: String
    let userId: String
    let title: String?
    let summary: String?
    let messageCount: Int
    let lastMessageAt: Date?
    let createdAt: Date
    let updatedAt: Date
}

// MARK: - Message

struct DBMessage: Codable, Identifiable {
    let id: String
    let conversationId: String
    let role: String
    let content: String
    let tokensUsed: Int?
    let model: String?
    let createdAt: Date
}

// MARK: - Calendar Event

struct DBCalendarEvent: Codable, Identifiable {
    let id: String
    let userId: String
    let provider: String
    let title: String
    let description: String?
    let location: String?
    let startTime: Date
    let endTime: Date
    let timezone: String
    let isAllDay: Bool
}

// MARK: - Task

struct DBTask: Codable, Identifiable {
    let id: String
    let userId: String
    let title: String
    let description: String?
    let status: String
    let priority: String?
    let dueAt: Date?
    let completedAt: Date?
    let createdAt: Date
}

// MARK: - DB Task Status

enum DBTaskStatus: String, Codable {
    case pending
    case inProgress = "in_progress"
    case completed
    case cancelled
}
