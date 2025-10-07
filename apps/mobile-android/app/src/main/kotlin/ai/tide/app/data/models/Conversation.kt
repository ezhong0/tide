package ai.tide.app.data.models

import java.util.UUID
import java.util.Date

// MARK: - Conversation Model
data class Conversation(
    val id: String = UUID.randomUUID().toString(),
    val title: String,
    val messages: MutableList<Message> = mutableListOf(),
    val createdAt: Date = Date(),
    var updatedAt: Date = Date(),
    var isActive: Boolean = true,
    val context: ConversationContext? = null
) {
    val lastMessage: Message?
        get() = messages.lastOrNull()

    val lastMessagePreview: String
        get() = lastMessage?.content ?: "No messages"

    val unreadCount: Int
        get() = messages.count { it.status != MessageStatus.READ && it.role == MessageRole.ASSISTANT }
}

// MARK: - Conversation Context
data class ConversationContext(
    val userId: String,
    val preferences: Map<String, String> = emptyMap(),
    val metadata: Map<String, String> = emptyMap()
)
