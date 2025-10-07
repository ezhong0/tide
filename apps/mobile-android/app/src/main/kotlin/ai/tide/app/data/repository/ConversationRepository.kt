package ai.tide.app.data.repository

import ai.tide.app.data.local.dao.ConversationDao
import ai.tide.app.data.local.dao.MessageDao
import ai.tide.app.data.local.entities.ConversationEntity
import ai.tide.app.data.local.entities.MessageEntity
import ai.tide.app.data.models.Conversation
import ai.tide.app.data.models.Message
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class ConversationRepository(
    private val conversationDao: ConversationDao,
    private val messageDao: MessageDao
) {
    // MARK: - Conversation Operations

    fun getAllConversations(): Flow<List<Conversation>> {
        return conversationDao.getAllConversations().map { conversations ->
            conversations.map { entity ->
                // Get messages for each conversation
                val messages = getMessagesForConversation(entity.id)
                entity.toModel(messages)
            }
        }
    }

    suspend fun getConversationById(id: String): Conversation? {
        val entity = conversationDao.getConversationById(id) ?: return null
        val messages = getMessagesForConversation(id)
        return entity.toModel(messages)
    }

    suspend fun saveConversation(conversation: Conversation) {
        // Save conversation
        val conversationEntity = ConversationEntity.fromModel(conversation)
        conversationDao.insertConversation(conversationEntity)

        // Save all messages
        val messageEntities = conversation.messages.map { message ->
            MessageEntity.fromModel(message, conversation.id)
        }
        messageDao.insertMessages(messageEntities)
    }

    suspend fun updateConversation(conversation: Conversation) {
        val conversationEntity = ConversationEntity.fromModel(conversation)
        conversationDao.updateConversation(conversationEntity)

        // Update messages
        val messageEntities = conversation.messages.map { message ->
            MessageEntity.fromModel(message, conversation.id)
        }
        messageDao.insertMessages(messageEntities)
    }

    suspend fun deleteConversation(conversationId: String) {
        conversationDao.deleteConversationById(conversationId)
        // Messages will be deleted automatically due to CASCADE
    }

    suspend fun clearConversationMessages(conversationId: String) {
        messageDao.deleteMessagesByConversation(conversationId)
    }

    // MARK: - Message Operations

    private suspend fun getMessagesForConversation(conversationId: String): List<Message> {
        // Use a one-time fetch instead of Flow for simplicity
        // In production, you might want to observe changes
        var messages: List<Message> = emptyList()
        messageDao.getMessagesByConversation(conversationId).collect { entities ->
            messages = entities.map { it.toModel() }
        }
        return messages
    }

    suspend fun saveMessage(message: Message, conversationId: String) {
        val messageEntity = MessageEntity.fromModel(message, conversationId)
        messageDao.insertMessage(messageEntity)
    }

    suspend fun updateMessage(message: Message, conversationId: String) {
        val messageEntity = MessageEntity.fromModel(message, conversationId)
        messageDao.updateMessage(messageEntity)
    }

    // MARK: - Cleanup

    suspend fun deleteAllData() {
        conversationDao.deleteAllConversations()
        messageDao.deleteAllMessages()
    }
}
