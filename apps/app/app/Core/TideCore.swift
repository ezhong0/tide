import Foundation

/// Core business logic for Tide app
@MainActor
class TideCore: ObservableObject {
    static let shared = TideCore()

    // MARK: - Published Properties
    @Published var conversations: [Conversation] = []
    @Published var currentConversation: Conversation?
    @Published var isProcessing: Bool = false
    @Published var errorMessage: String?

    // MARK: - Initialization
    init() {
        loadConversations()
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
        // Load mock data in preview mode
        if PREVIEW_MODE {
            let mockConv = MockData.mockConversation()
            conversations = [mockConv]
            currentConversation = mockConv
            return
        }

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
            // Call real AI backend
            let aiResponse = try await callAIBackend(message: userMessage.content, conversationId: conversation.id)

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

    /// Call real AI backend API
    private func callAIBackend(message: String, conversationId: String) async throws -> Message {
        // Call AIService
        let response = try await AIService.shared.chat(message: message, conversationId: conversationId)

        // Parse action preview from metadata if present
        var actionPreview: ActionPreview? = nil
        if let actions = response.metadata?.actions, let firstAction = actions.first {
            actionPreview = ActionPreview(
                title: firstAction.title,
                description: firstAction.description,
                actionType: mapActionType(firstAction.type),
                requiresConfirmation: firstAction.requiresConfirmation,
                isConfirmed: false
            )
        }

        // Create message from response
        return Message(
            content: response.content,
            role: .assistant,
            status: .delivered,
            actionPreview: actionPreview,
            suggestions: nil // Can add suggestions from metadata if needed
        )
    }

    /// Map action type from backend string to ActionType enum
    private func mapActionType(_ type: String) -> ActionPreview.ActionType {
        switch type.lowercased() {
        case "schedule_event", "scheduleevent":
            return .scheduleEvent
        case "send_email", "sendemail":
            return .sendEmail
        case "create_task", "createtask":
            return .createTask
        case "update_calendar", "updatecalendar":
            return .updateCalendar
        case "delegate_task", "delegatetask":
            return .delegateTask
        case "analyze_document", "analyzedocument":
            return .analyzeDocument
        default:
            return .createTask // Default fallback
        }
    }

    /// Send a message in the current conversation
    func sendMessage(_ content: String) async -> Message {
        let userMessage = Message(
            content: content,
            role: .user,
            status: .sent
        )

        // Process the message and get AI response
        return await process(userMessage)
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
}
