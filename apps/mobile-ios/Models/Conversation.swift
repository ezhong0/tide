import Foundation

// MARK: - Conversation Model
struct Conversation: Identifiable, Codable {
    let id: String
    let title: String
    var messages: [Message]
    let createdAt: Date
    var updatedAt: Date
    var isActive: Bool
    var context: ConversationContext?

    init(
        id: String = UUID().uuidString,
        title: String,
        messages: [Message] = [],
        createdAt: Date = Date(),
        updatedAt: Date = Date(),
        isActive: Bool = true,
        context: ConversationContext? = nil
    ) {
        self.id = id
        self.title = title
        self.messages = messages
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.isActive = isActive
        self.context = context
    }
}

// MARK: - Conversation Context
struct ConversationContext: Codable {
    let userId: String
    var preferences: [String: String]
    var metadata: [String: String]
}

// MARK: - Conversation Extensions
extension Conversation {
    var lastMessage: Message? {
        messages.last
    }

    var lastMessagePreview: String {
        lastMessage?.content ?? "No messages"
    }

    var unreadCount: Int {
        messages.filter { $0.status != .read && $0.role == .assistant }.count
    }
}
