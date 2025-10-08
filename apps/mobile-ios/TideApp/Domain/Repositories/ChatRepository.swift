/**
 * Chat Repository Protocol
 * Defines interface for chat data access
 */

import Foundation

protocol ChatRepository {
    // MARK: - Message Operations
    func sendMessage(message: String, conversationId: String?) async throws -> ChatResponse
    func getMessages(conversationId: String) async throws -> [ChatMessage]

    // MARK: - Conversation Operations
    func getConversations() async throws -> [Conversation]
    func getConversation(id: String) async throws -> Conversation
    func createConversation(title: String?) async throws -> Conversation
    func deleteConversation(id: String) async throws
}
