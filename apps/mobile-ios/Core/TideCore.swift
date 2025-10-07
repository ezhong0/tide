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

    // MARK: - Services
    private let apiClient = APIClient.shared
    private let dataManager = DataManager.shared
    private var cancellables = Set<AnyCancellable>()

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
        dataManager.saveConversation(conversation)

        return conversation
    }

    /// Load conversations from local storage/API
    private func loadConversations() {
        // Load from CoreData
        let savedConversations = dataManager.fetchConversations()

        if savedConversations.isEmpty {
            // Create default conversation if none exist
            _ = createConversation(title: "Chat with Tide")
        } else {
            conversations = savedConversations
            currentConversation = savedConversations.first
        }
    }

    /// Delete a conversation
    func deleteConversation(_ conversation: Conversation) {
        conversations.removeAll { $0.id == conversation.id }
        if currentConversation?.id == conversation.id {
            currentConversation = conversations.first
        }

        // Delete from CoreData
        dataManager.deleteConversation(id: conversation.id)
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
        return await process(userMessage)
    }

    // MARK: - Private Helpers

    private func updateConversation(_ conversation: Conversation) {
        if let index = conversations.firstIndex(where: { $0.id == conversation.id }) {
            conversations[index] = conversation
        }
        currentConversation = conversation

        // Persist to CoreData
        dataManager.saveConversation(conversation)
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
