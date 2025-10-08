/**
 * Chat View Model
 * Handles chat logic and API communication
 */

import Foundation
import Combine

@MainActor
class ChatViewModel: ObservableObject {
    @Published var messages: [ChatMessage] = []
    @Published var isLoading = false
    @Published var error: String?
    @Published var currentConversationId: String?

    private let apiClient = APIClient.shared
    private var cancellables = Set<AnyCancellable>()

    // Serial queue for message operations to prevent race conditions
    private let messageQueue = DispatchQueue(label: "com.tide.chat.messageQueue")

    func loadConversation() async {
        // Load most recent conversation or create new one
        do {
            let conversations = try await apiClient.getConversations()
            if let latest = conversations.first {
                currentConversationId = latest.id
                await loadMessages(conversationId: latest.id)
            }
        } catch {
            self.error = "Failed to load conversation: \(error.localizedDescription)"
        }
    }

    func loadMessages(conversationId: String) async {
        do {
            messages = try await apiClient.getConversationMessages(conversationId: conversationId)
        } catch {
            self.error = "Failed to load messages: \(error.localizedDescription)"
        }
    }

    func sendMessage(_ text: String) async {
        guard !text.isEmpty else { return }

        isLoading = true
        defer { isLoading = false }

        // Add user message immediately
        let userMessage = ChatMessage(
            id: UUID().uuidString,
            conversationId: currentConversationId ?? "",
            role: .user,
            content: text,
            timestamp: Date(),
            confidence: nil,
            suggestedActions: nil
        )
        messages.append(userMessage)
        // Sort messages by timestamp to handle race conditions
        messages.sort { $0.timestamp < $1.timestamp }

        do {
            let response = try await apiClient.sendChatMessage(
                message: text,
                conversationId: currentConversationId
            )

            // Update conversation ID if this was first message
            if currentConversationId == nil {
                currentConversationId = response.conversationId
            }

            // Add AI response
            let aiMessage = ChatMessage(
                id: UUID().uuidString,
                conversationId: response.conversationId,
                role: .assistant,
                content: response.content,
                timestamp: Date(),
                confidence: response.confidence,
                suggestedActions: response.suggestedActions
            )
            messages.append(aiMessage)
            // Sort again to ensure correct order
            messages.sort { $0.timestamp < $1.timestamp }

        } catch {
            self.error = "Failed to send message: \(error.localizedDescription)"
            // Remove optimistic user message on error
            messages.removeAll { $0.id == userMessage.id }
        }
    }

    @MainActor
    func executeAction(_ action: SuggestedAction) async {
        do {
            try await apiClient.executeAction(action)
            // Refresh relevant data based on action type
            switch action.type {
            case "email":
                // Notify email view to refresh
                NotificationCenter.default.post(name: .emailActionExecuted, object: nil)
            case "calendar":
                NotificationCenter.default.post(name: .calendarActionExecuted, object: nil)
            case "task":
                NotificationCenter.default.post(name: .taskActionExecuted, object: nil)
            default:
                break
            }
        } catch {
            // Error is set on main actor, ensuring UI is in valid state
            self.error = "Failed to execute action: \(error.localizedDescription)"
        }
    }

    func startNewConversation() {
        currentConversationId = nil
        messages = []
    }
}

// Notification names
extension Notification.Name {
    static let emailActionExecuted = Notification.Name("emailActionExecuted")
    static let calendarActionExecuted = Notification.Name("calendarActionExecuted")
    static let taskActionExecuted = Notification.Name("taskActionExecuted")
}
