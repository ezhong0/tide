package ai.tide.app.data.local.entities

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey
import ai.tide.app.data.models.*
import com.google.gson.Gson
import java.util.Date

@Entity(
    tableName = "messages",
    foreignKeys = [
        ForeignKey(
            entity = ConversationEntity::class,
            parentColumns = ["id"],
            childColumns = ["conversationId"],
            onDelete = ForeignKey.CASCADE
        )
    ]
)
data class MessageEntity(
    @PrimaryKey
    val id: String,
    val conversationId: String,
    val content: String,
    val role: String, // USER, ASSISTANT, SYSTEM
    val timestamp: Date,
    val status: String, // SENDING, SENT, DELIVERED, READ, FAILED
    val suggestionsJSON: String? = null,
    val actionPreviewJSON: String? = null,
    val aiSummary: String? = null
) {
    fun toModel(): Message {
        val gson = Gson()

        val suggestions = suggestionsJSON?.let {
            try {
                gson.fromJson(it, Array<String>::class.java).toList()
            } catch (e: Exception) {
                null
            }
        }

        val actionPreview = actionPreviewJSON?.let {
            try {
                gson.fromJson(it, ActionPreview::class.java)
            } catch (e: Exception) {
                null
            }
        }

        return Message(
            id = id,
            content = content,
            role = MessageRole.valueOf(role),
            timestamp = timestamp,
            status = MessageStatus.valueOf(status),
            actionPreview = actionPreview,
            suggestions = suggestions,
            aiSummary = aiSummary
        )
    }

    companion object {
        fun fromModel(message: Message, conversationId: String): MessageEntity {
            val gson = Gson()

            val suggestionsJSON = message.suggestions?.let {
                gson.toJson(it)
            }

            val actionPreviewJSON = message.actionPreview?.let {
                gson.toJson(it)
            }

            return MessageEntity(
                id = message.id,
                conversationId = conversationId,
                content = message.content,
                role = message.role.name,
                timestamp = message.timestamp,
                status = message.status.name,
                suggestionsJSON = suggestionsJSON,
                actionPreviewJSON = actionPreviewJSON,
                aiSummary = message.aiSummary
            )
        }
    }
}
