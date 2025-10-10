import Foundation

/// AI Service - Connects to Tide AI backend
class AIService {
    static let shared = AIService()

    private init() {}

    // MARK: - Request/Response Models

    struct ChatRequest: Codable {
        let userId: String
        let content: String
        let context: ChatContext?

        struct ChatContext: Codable {
            let userEmail: String?
            let conversationId: String?
        }
    }

    struct ChatResponse: Codable {
        let requestId: String
        let content: String
        let tokensUsed: Int?
        let executionTime: Int?
        let metadata: ChatMetadata?

        struct ChatMetadata: Codable {
            let toolsUsed: [String]?
            let actions: [ActionSuggestion]?
        }

        struct ActionSuggestion: Codable {
            let type: String
            let title: String
            let description: String
            let requiresConfirmation: Bool
        }
    }

    // MARK: - Public Methods

    /// Send a chat message to the AI backend
    func chat(message: String, conversationId: String? = nil) async throws -> ChatResponse {
        // Get the current user ID from AuthManager
        guard let userId = await AuthManager.shared.currentUser?.id.uuidString else {
            throw AIServiceError.notAuthenticated
        }

        let userEmail = await AuthManager.shared.currentUser?.email

        // Build request
        let request = ChatRequest(
            userId: userId,
            content: message,
            context: ChatRequest.ChatContext(
                userEmail: userEmail,
                conversationId: conversationId
            )
        )

        // Call backend
        let endpoint = "/api/ai/chat"

        do {
            let response: ChatResponse = try await APIClient.shared.post(
                endpoint: endpoint,
                body: request
            )

            print("✅ AI response received: \(response.content.prefix(100))...")
            return response

        } catch {
            print("❌ AI service error: \(error)")
            throw AIServiceError.requestFailed(error.localizedDescription)
        }
    }
}

// MARK: - Errors
enum AIServiceError: LocalizedError {
    case notAuthenticated
    case requestFailed(String)
    case invalidResponse

    var errorDescription: String? {
        switch self {
        case .notAuthenticated:
            return "User not authenticated. Please login first."
        case .requestFailed(let message):
            return "AI request failed: \(message)"
        case .invalidResponse:
            return "Invalid response from AI service"
        }
    }
}
