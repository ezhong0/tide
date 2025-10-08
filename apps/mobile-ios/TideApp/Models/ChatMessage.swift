/**
 * Chat Message Models
 * Models for chat conversations and AI responses
 */

import Foundation

// MARK: - Chat Message
struct ChatMessage: Identifiable, Codable {
    let id: String
    let conversationId: String
    let role: MessageRole
    let content: String
    let timestamp: Date
    let confidence: Double?
    let suggestedActions: [SuggestedAction]?

    enum MessageRole: String, Codable {
        case user
        case assistant
        case system
    }

    var timeString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        return formatter.string(from: timestamp)
    }
}

// MARK: - Suggested Action
struct SuggestedAction: Identifiable, Codable {
    let id: String
    let type: String
    let title: String
    let description: String
    let parameters: [String: AnyCodable]?
    let requiresConfirmation: Bool
    let confidence: Double?

    init(
        id: String = UUID().uuidString,
        type: String,
        title: String,
        description: String,
        parameters: [String: AnyCodable]? = nil,
        requiresConfirmation: Bool = true,
        confidence: Double? = nil
    ) {
        self.id = id
        self.type = type
        self.title = title
        self.description = description
        self.parameters = parameters
        self.requiresConfirmation = requiresConfirmation
        self.confidence = confidence
    }
}

// MARK: - Conversation
struct Conversation: Identifiable, Codable {
    let id: String
    let title: String?
    let createdAt: Date
    let updatedAt: Date

    init(
        id: String = UUID().uuidString,
        title: String? = nil,
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.title = title
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}
