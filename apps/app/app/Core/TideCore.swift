import Foundation
import Combine

/// Core business logic for Tide app
@MainActor
class TideCore: ObservableObject {
    static let shared = TideCore()

    // MARK: - Published Properties
    @Published var conversations: [Conversation] = []
    @Published var currentConversation: Conversation?
    @Published var isProcessing: Bool = false
    @Published var errorMessage: String?
    @Published var isConnected: Bool = false
    @Published var connectionStatus: String = "Disconnected"

    // MARK: - Services
    private let apiClient = APIClient.shared
    // private let dataManager = DataManager.shared  // Excluded from build
    private let webSocketManager = WebSocketManager.shared
    private var cancellables = Set<AnyCancellable>()
    private var accessToken: String?

    // MARK: - Initialization
    init() {
        loadConversations()
        setupWebSocketHandlers()
    }

    // MARK: - WebSocket Setup

    private func setupWebSocketHandlers() {
        // Listen for connection status
        webSocketManager.$isConnected
            .sink { [weak self] connected in
                self?.isConnected = connected
                self?.connectionStatus = connected ? "Connected" : "Disconnected"
            }
            .store(in: &cancellables)

        // Handle incoming messages
        webSocketManager.onMessageReceived = { [weak self] wsMessage in
            Task { @MainActor in
                self?.handleWebSocketMessage(wsMessage)
            }
        }

        // Handle connection events
        webSocketManager.onConnected = { [weak self] in
            Task { @MainActor in
                self?.connectionStatus = "Connected"
                self?.errorMessage = nil
            }
        }

        webSocketManager.onDisconnected = { [weak self] in
            Task { @MainActor in
                self?.connectionStatus = "Disconnected"
            }
        }
    }

    /// Connect to WebSocket with access token
    func connectWebSocket(token: String) {
        self.accessToken = token
        webSocketManager.connect(token: token)
        connectionStatus = "Connecting..."
    }

    /// Disconnect WebSocket
    func disconnectWebSocket() {
        webSocketManager.disconnect()
    }

    /// Handle incoming WebSocket messages
    private func handleWebSocketMessage(_ wsMessage: WebSocketMessage) {
        guard wsMessage.type == "message",
              let payload = wsMessage.payload?.value as? [String: Any],
              let content = payload["content"] as? String,
              let roleString = payload["role"] as? String,
              let conversationId = payload["conversationId"] as? String else {
            return
        }

        // Find or create conversation
        var conversation: Conversation
        if let existing = conversations.first(where: { $0.id == conversationId }) {
            conversation = existing
        } else {
            // Message for unknown conversation, use current or create new
            conversation = currentConversation ?? createConversation(title: "Chat with Tide")
        }

        // Create message from WebSocket data
        let role: MessageRole = roleString == "user" ? .user : .assistant
        let message = Message(
            content: content,
            role: role,
            status: .delivered,
            suggestions: payload["suggestions"] as? [String]
        )

        // Add message to conversation
        conversation.messages.append(message)
        conversation.updatedAt = Date()
        updateConversation(conversation)

        isProcessing = false
    }

    // MARK: - Conversation Management

    /// Create a new conversation
    func createConversation(title: String = "New Chat") -> Conversation {
        let conversation = Conversation(title: title)
        conversations.insert(conversation, at: 0)
        currentConversation = conversation

        // Persist to CoreData
        // dataManager.saveConversation(conversation)  // Excluded from build

        return conversation
    }

    /// Load conversations from local storage/API
    private func loadConversations() {
        // Load from CoreData
        // let savedConversations = dataManager.fetchConversations()  // Excluded from build

        // if savedConversations.isEmpty {
            // Create default conversation if none exist
            _ = createConversation(title: "Chat with Tide")
        // } else {
        //     conversations = savedConversations
        //     currentConversation = savedConversations.first
        // }
    }

    /// Delete a conversation
    func deleteConversation(_ conversation: Conversation) {
        conversations.removeAll { $0.id == conversation.id }
        if currentConversation?.id == conversation.id {
            currentConversation = conversations.first
        }

        // Delete from CoreData
        // dataManager.deleteConversation(id: conversation.id)  // Excluded from build
    }

    /// Clear all messages in current conversation
    func clearCurrentConversation() {
        guard var conversation = currentConversation else { return }
        conversation.messages.removeAll()
        updateConversation(conversation)
    }

    // MARK: - Message Processing

    /// Process a user message and get AI response
    func process(_ userMessage: Message) async -> Message {
        guard var conversation = currentConversation else {
            return createErrorMessage("No active conversation")
        }

        isProcessing = true
        errorMessage = nil

        // Add user message to conversation
        conversation.messages.append(userMessage)
        updateConversation(conversation)

        do {
            // TODO: Implement actual API call
            // For now, simulate AI response
            let aiResponse = try await simulateAIResponse(to: userMessage.content)

            // Add AI response to conversation
            conversation.messages.append(aiResponse)
            conversation.updatedAt = Date()
            updateConversation(conversation)

            isProcessing = false
            return aiResponse

        } catch {
            isProcessing = false
            errorMessage = error.localizedDescription
            let errorMsg = createErrorMessage(error.localizedDescription)
            conversation.messages.append(errorMsg)
            updateConversation(conversation)
            return errorMsg
        }
    }

    /// Send a message in the current conversation
    func sendMessage(_ content: String) async -> Message {
        let userMessage = Message(
            content: content,
            role: .user,
            status: .sent
        )

        guard var conversation = currentConversation else {
            return createErrorMessage("No active conversation")
        }

        // Add user message to conversation immediately
        conversation.messages.append(userMessage)
        updateConversation(conversation)

        // If WebSocket is connected, send via WebSocket
        if isConnected {
            isProcessing = true
            webSocketManager.sendChatMessage(
                conversationId: conversation.id,
                content: content
            )
            // AI response will come via WebSocket callback
            return userMessage
        } else {
            // Fallback to simulated response if not connected
            return await process(userMessage)
        }
    }

    // MARK: - Private Helpers

    private func updateConversation(_ conversation: Conversation) {
        if let index = conversations.firstIndex(where: { $0.id == conversation.id }) {
            conversations[index] = conversation
        }
        currentConversation = conversation

        // Persist to CoreData
        // dataManager.saveConversation(conversation)  // Excluded from build
    }

    private func createErrorMessage(_ errorText: String) -> Message {
        Message(
            content: "Error: \(errorText)",
            role: .system,
            status: .failed
        )
    }

    // MARK: - Simulated AI Response (Temporary)

    private func simulateAIResponse(to input: String) async throws -> Message {
        // Simulate network delay
        try await Task.sleep(nanoseconds: 1_000_000_000) // 1 second

        // Simple response logic
        let response: String
        let actionPreview: ActionPreview?
        let suggestions: [String]?

        if input.lowercased().contains("meeting") || input.lowercased().contains("schedule") {
            response = "I can help you schedule that meeting. When would you like to meet?"
            actionPreview = ActionPreview(
                title: "Schedule Meeting",
                description: "Create a new calendar event",
                actionType: .scheduleEvent,
                requiresConfirmation: true,
                isConfirmed: false
            )
            suggestions = ["Tomorrow at 2pm", "Next Monday", "Cancel"]
        } else if input.lowercased().contains("email") {
            response = "I'll help you with your email. What would you like to do?"
            actionPreview = ActionPreview(
                title: "Send Email",
                description: "Compose and send an email",
                actionType: .sendEmail,
                requiresConfirmation: true,
                isConfirmed: false
            )
            suggestions = ["Draft email", "Check inbox", "Cancel"]
        } else if input.lowercased().contains("task") || input.lowercased().contains("todo") {
            response = "I can create a task for you. What should I add?"
            actionPreview = ActionPreview(
                title: "Create Task",
                description: "Add a new task to your list",
                actionType: .createTask,
                requiresConfirmation: true,
                isConfirmed: false
            )
            suggestions = ["Add task", "View tasks", "Cancel"]
        } else {
            response = "I'm Tide, your AI Chief of Staff. I can help you with:\n\n• Managing your calendar\n• Handling emails\n• Creating and tracking tasks\n• Scheduling meetings\n\nHow can I assist you today?"
            actionPreview = nil
            suggestions = ["Schedule a meeting", "Check my email", "Create a task"]
        }

        return Message(
            content: response,
            role: .assistant,
            status: .delivered,
            actionPreview: actionPreview,
            suggestions: suggestions
        )
    }

    // MARK: - Action Confirmation

    /// Confirm an action in a message
    func confirmAction(messageId: String, action: ActionPreview) async {
        guard var conversation = currentConversation else { return }

        // Find the message
        guard let messageIndex = conversation.messages.firstIndex(where: { $0.id == messageId }) else {
            return
        }

        var message = conversation.messages[messageIndex]

        // Update action to confirmed
        if var actionPreview = message.actionPreview {
            actionPreview.isConfirmed = true
            message.actionPreview = actionPreview
            conversation.messages[messageIndex] = message
            updateConversation(conversation)

            // Execute the action based on type
            await executeAction(action)
        }
    }

    /// Cancel an action
    func cancelAction(messageId: String) {
        guard var conversation = currentConversation else { return }

        // Find the message and clear its action preview
        guard let messageIndex = conversation.messages.firstIndex(where: { $0.id == messageId }) else {
            return
        }

        var message = conversation.messages[messageIndex]
        message.actionPreview = nil
        conversation.messages[messageIndex] = message
        updateConversation(conversation)
    }

    /// Execute a confirmed action
    private func executeAction(_ action: ActionPreview) async {
        // TODO: Implement actual action execution via API
        print("✅ Executing action: \(action.title) (\(action.actionType.rawValue))")

        // For now, just send a confirmation message
        let confirmationMessage = Message(
            content: "\(action.title) has been created successfully.",
            role: .system,
            status: .delivered
        )

        guard var conversation = currentConversation else { return }
        conversation.messages.append(confirmationMessage)
        updateConversation(conversation)
    }

    // MARK: - Predictions & Caching (Future)

    /// Pre-cache likely user requests
    func preCache(_ pattern: String) async {
        // TODO: Implement predictive caching
    }

    /// Predict morning routine actions
    func predictMorningRoutine() async {
        // TODO: Implement morning predictions
    }

    /// Predict meeting prep needs
    func predictMeetingPrep() async {
        // TODO: Implement meeting predictions
    }

    // MARK: - Calendar Suggestions (Future)
    var calendarSuggestions: [CalendarSuggestion]? {
        // TODO: Implement calendar suggestions
        nil
    }
}

// MARK: - Calendar Suggestion (Placeholder)
struct CalendarSuggestion: Identifiable {
    let id = UUID()
    let title: String
    let description: String
    let actionType: String
}
