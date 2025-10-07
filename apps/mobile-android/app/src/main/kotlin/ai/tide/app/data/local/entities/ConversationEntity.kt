package ai.tide.app.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey
import ai.tide.app.data.models.Conversation
import java.util.Date

@Entity(tableName = "conversations")
data class ConversationEntity(
    @PrimaryKey
    val id: String,
    val title: String,
    val createdAt: Date,
    val updatedAt: Date,
    val isActive: Boolean
) {
    fun toModel(messages: List<ai.tide.app.data.models.Message> = emptyList()): Conversation {
        return Conversation(
            id = id,
            title = title,
            messages = messages.toMutableList(),
            createdAt = createdAt,
            updatedAt = updatedAt,
            isActive = isActive
        )
    }

    companion object {
        fun fromModel(conversation: Conversation): ConversationEntity {
            return ConversationEntity(
                id = conversation.id,
                title = conversation.title,
                createdAt = conversation.createdAt,
                updatedAt = conversation.updatedAt,
                isActive = conversation.isActive
            )
        }
    }
}
