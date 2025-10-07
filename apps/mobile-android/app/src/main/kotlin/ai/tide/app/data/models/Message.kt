package ai.tide.app.data.models

import java.util.UUID
import java.util.Date

// MARK: - Message Model
data class Message(
    val id: String = UUID.randomUUID().toString(),
    val content: String,
    val role: MessageRole,
    val timestamp: Date = Date(),
    val status: MessageStatus = MessageStatus.SENT,
    val actionPreview: ActionPreview? = null,
    val suggestions: List<String>? = null,
    val aiSummary: String? = null
)

// MARK: - Message Role
enum class MessageRole {
    USER,
    ASSISTANT,
    SYSTEM
}

// MARK: - Message Status
enum class MessageStatus {
    SENDING,
    SENT,
    DELIVERED,
    READ,
    FAILED
}

// MARK: - Action Preview
data class ActionPreview(
    val title: String,
    val description: String,
    val actionType: ActionType,
    val requiresConfirmation: Boolean,
    val isConfirmed: Boolean = false
) {
    enum class ActionType {
        SCHEDULE_EVENT,
        SEND_EMAIL,
        CREATE_TASK,
        UPDATE_CALENDAR,
        DELEGATE_TASK,
        ANALYZE_DOCUMENT
    }
}
