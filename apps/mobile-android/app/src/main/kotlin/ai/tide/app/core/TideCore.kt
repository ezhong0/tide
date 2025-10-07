package ai.tide.app.core

import ai.tide.app.data.models.*
import ai.tide.app.data.repository.ConversationRepository
import ai.tide.app.services.WebSocketManager
import ai.tide.app.services.WebSocketMessage
import kotlinx.coroutines.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/// Core business logic for Tide app
class TideCore(
    private val repository: ConversationRepository? = null
) {
    private val _conversations = MutableStateFlow<List<Conversation>>(emptyList())
    val conversations: StateFlow<List<Conversation>> = _conversations.asStateFlow()

    private val _currentConversation = MutableStateFlow<Conversation?>(null)
    val currentConversation: StateFlow<Conversation?> = _currentConversation.asStateFlow()

    private val _isProcessing = MutableStateFlow(false)
    val isProcessing: StateFlow<Boolean> = _isProcessing.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    private val _isConnected = MutableStateFlow(false)
    val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()

    private val _connectionStatus = MutableStateFlow("Disconnected")
    val connectionStatus: StateFlow<String> = _connectionStatus.asStateFlow()

    private val webSocketManager = WebSocketManager.getInstance()
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    private var accessToken: String? = null

    init {
        loadConversations()
        setupWebSocketHandlers()
    }

    // MARK: - WebSocket Setup

    private fun setupWebSocketHandlers() {
        // Observe connection status
        scope.launch {
            webSocketManager.isConnected.collect { connected ->
                _isConnected.value = connected
                _connectionStatus.value = if (connected) "Connected" else "Disconnected"
            }
        }

        // Handle incoming messages
        webSocketManager.onMessageReceived = { wsMessage ->
            scope.launch {
                handleWebSocketMessage(wsMessage)
            }
        }

        // Handle connection events
        webSocketManager.onConnected = {
            scope.launch {
                _connectionStatus.value = "Connected"
                _errorMessage.value = null
            }
        }

        webSocketManager.onDisconnected = {
            scope.launch {
                _connectionStatus.value = "Disconnected"
            }
        }
    }

    fun connectWebSocket(token: String) {
        accessToken = token
        webSocketManager.connect(token)
        _connectionStatus.value = "Connecting..."
    }

    fun disconnectWebSocket() {
        webSocketManager.disconnect()
    }

    private suspend fun handleWebSocketMessage(wsMessage: WebSocketMessage) {
        if (wsMessage.type != "message") return

        val payload = wsMessage.payload ?: return
        val content = payload["content"]?.toString() ?: return
        val roleString = payload["role"]?.toString() ?: return
        val conversationId = payload["conversationId"]?.toString() ?: return

        // Find or create conversation
        var conversation = _conversations.value.firstOrNull { it.id == conversationId }
            ?: _currentConversation.value
            ?: createConversation("Chat with Tide")

        // Create message from WebSocket data
        val role = if (roleString == "user") MessageRole.USER else MessageRole.ASSISTANT
        val suggestions = (payload["suggestions"] as? List<*>)?.mapNotNull { it?.toString() }

        val message = Message(
            content = content,
            role = role,
            status = MessageStatus.DELIVERED,
            suggestions = suggestions
        )

        // Add message to conversation
        conversation.messages.add(message)
        conversation.updatedAt = java.util.Date()
        updateConversation(conversation)

        _isProcessing.value = false
    }

    // MARK: - Conversation Management

    fun createConversation(title: String = "New Chat"): Conversation {
        val conversation = Conversation(title = title)
        val currentList = _conversations.value.toMutableList()
        currentList.add(0, conversation)
        _conversations.value = currentList
        _currentConversation.value = conversation
        return conversation
    }

    private fun loadConversations() {
        // Load from Room database if repository is available
        repository?.let { repo ->
            kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
                repo.getAllConversations().collect { savedConversations ->
                    if (savedConversations.isEmpty()) {
                        createConversation("Chat with Tide")
                    } else {
                        _conversations.value = savedConversations
                        _currentConversation.value = savedConversations.firstOrNull()
                    }
                }
            }
        } ?: run {
            // Fallback: create default conversation if no repository
            if (_conversations.value.isEmpty()) {
                createConversation("Chat with Tide")
            }
        }
    }

    fun deleteConversation(conversation: Conversation) {
        val currentList = _conversations.value.toMutableList()
        currentList.removeAll { it.id == conversation.id }
        _conversations.value = currentList

        if (_currentConversation.value?.id == conversation.id) {
            _currentConversation.value = currentList.firstOrNull()
        }

        // Delete from Room database
        repository?.let { repo ->
            kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
                repo.deleteConversation(conversation.id)
            }
        }
    }

    fun clearCurrentConversation() {
        val conversation = _currentConversation.value ?: return
        conversation.messages.clear()
        updateConversation(conversation)
    }

    // MARK: - Message Processing

    suspend fun process(userMessage: Message): Message {
        val conversation = _currentConversation.value ?: return createErrorMessage("No active conversation")

        _isProcessing.value = true
        _errorMessage.value = null

        // Add user message to conversation
        conversation.messages.add(userMessage)
        updateConversation(conversation)

        return try {
            // TODO: Implement actual API call
            // For now, simulate AI response
            val aiResponse = simulateAIResponse(userMessage.content)

            // Add AI response to conversation
            conversation.messages.add(aiResponse)
            conversation.updatedAt = java.util.Date()
            updateConversation(conversation)

            _isProcessing.value = false
            aiResponse
        } catch (e: Exception) {
            _isProcessing.value = false
            _errorMessage.value = e.localizedMessage
            val errorMsg = createErrorMessage(e.localizedMessage ?: "Unknown error")
            conversation.messages.add(errorMsg)
            updateConversation(conversation)
            errorMsg
        }
    }

    suspend fun sendMessage(content: String): Message {
        val userMessage = Message(
            content = content,
            role = MessageRole.USER,
            status = MessageStatus.SENT
        )

        val conversation = _currentConversation.value ?: return createErrorMessage("No active conversation")

        // Add user message to conversation immediately
        conversation.messages.add(userMessage)
        updateConversation(conversation)

        // If WebSocket is connected, send via WebSocket
        return if (_isConnected.value) {
            _isProcessing.value = true
            webSocketManager.sendChatMessage(
                conversationId = conversation.id,
                content = content
            )
            // AI response will come via WebSocket callback
            userMessage
        } else {
            // Fallback to simulated response if not connected
            process(userMessage)
        }
    }

    // MARK: - Private Helpers

    private fun updateConversation(conversation: Conversation) {
        val currentList = _conversations.value.toMutableList()
        val index = currentList.indexOfFirst { it.id == conversation.id }
        if (index != -1) {
            currentList[index] = conversation
            _conversations.value = currentList
        }
        _currentConversation.value = conversation

        // Persist to Room database
        repository?.let { repo ->
            kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
                repo.saveConversation(conversation)
            }
        }
    }

    private fun createErrorMessage(errorText: String): Message {
        return Message(
            content = "Error: $errorText",
            role = MessageRole.SYSTEM,
            status = MessageStatus.FAILED
        )
    }

    // MARK: - Simulated AI Response (Temporary)

    private suspend fun simulateAIResponse(input: String): Message {
        // Simulate network delay
        delay(1000)

        // Simple response logic
        val response: String
        val actionPreview: ActionPreview?
        val suggestions: List<String>?

        when {
            input.lowercase().contains("meeting") || input.lowercase().contains("schedule") -> {
                response = "I can help you schedule that meeting. When would you like to meet?"
                actionPreview = ActionPreview(
                    title = "Schedule Meeting",
                    description = "Create a new calendar event",
                    actionType = ActionPreview.ActionType.SCHEDULE_EVENT,
                    requiresConfirmation = true
                )
                suggestions = listOf("Tomorrow at 2pm", "Next Monday", "Cancel")
            }
            input.lowercase().contains("email") -> {
                response = "I'll help you with your email. What would you like to do?"
                actionPreview = ActionPreview(
                    title = "Send Email",
                    description = "Compose and send an email",
                    actionType = ActionPreview.ActionType.SEND_EMAIL,
                    requiresConfirmation = true
                )
                suggestions = listOf("Draft email", "Check inbox", "Cancel")
            }
            input.lowercase().contains("task") || input.lowercase().contains("todo") -> {
                response = "I can create a task for you. What should I add?"
                actionPreview = ActionPreview(
                    title = "Create Task",
                    description = "Add a new task to your list",
                    actionType = ActionPreview.ActionType.CREATE_TASK,
                    requiresConfirmation = true
                )
                suggestions = listOf("Add task", "View tasks", "Cancel")
            }
            else -> {
                response = "I'm Tide, your AI Chief of Staff. I can help you with:\n\n• Managing your calendar\n• Handling emails\n• Creating and tracking tasks\n• Scheduling meetings\n\nHow can I assist you today?"
                actionPreview = null
                suggestions = listOf("Schedule a meeting", "Check my email", "Create a task")
            }
        }

        return Message(
            content = response,
            role = MessageRole.ASSISTANT,
            status = MessageStatus.DELIVERED,
            actionPreview = actionPreview,
            suggestions = suggestions
        )
    }

    fun cleanup() {
        webSocketManager.cleanup()
        scope.cancel()
    }

    companion object {
        @Volatile
        private var instance: TideCore? = null

        fun getInstance(): TideCore {
            return instance ?: synchronized(this) {
                instance ?: TideCore().also { instance = it }
            }
        }
    }
}
