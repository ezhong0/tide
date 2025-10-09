/**
 * Network Chat Repository
 * Concrete implementation of ChatRepository using API Client
 */

import Foundation

final class NetworkChatRepository: ChatRepository {
    private let apiClient: APIClientProtocol

    init(apiClient: APIClientProtocol) {
        self.apiClient = apiClient
    }

    // MARK: - Message Operations

    func sendMessage(message: String, conversationId: String?) async throws -> ChatResponse {
        return try await apiClient.sendChatMessage(message: message, conversationId: conversationId)
    }

    func getMessages(conversationId: String) async throws -> [ChatMessage] {
        return try await apiClient.getConversationMessages(conversationId: conversationId)
    }

    // MARK: - Conversation Operations

    func getConversations() async throws -> [Conversation] {
        return try await apiClient.getConversations()
    }

    func getConversation(id: String) async throws -> Conversation {
        // Get conversation from the list
        let conversations = try await getConversations()
        guard let conversation = conversations.first(where: { $0.id == id }) else {
            throw RepositoryError.notFound
        }
        return conversation
    }

    func createConversation(title: String?) async throws -> Conversation {
        // TODO: Implement create conversation endpoint when backend is ready
        throw RepositoryError.notImplemented
    }

    func deleteConversation(id: String) async throws {
        try await apiClient.deleteConversation(id: id)
    }
}
