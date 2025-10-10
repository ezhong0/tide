import Foundation

class EmailService {
    static let shared = EmailService()

    private init() {}

    // MARK: - API Response Models

    struct EmailResponse: Codable {
        let id: String
        let userId: String
        let provider: String
        let messageId: String
        let threadId: String?
        let from: String
        let to: [String]
        let subject: String
        let body: String
        let timestamp: Date
        let isRead: Bool
        let aiCategory: String?
        let aiPriority: Int?
        let aiSummary: String?

        enum CodingKeys: String, CodingKey {
            case id, userId, provider, messageId, threadId, from, to, subject, body, timestamp, isRead
            case aiCategory = "ai_category"
            case aiPriority = "ai_priority"
            case aiSummary = "ai_summary"
        }
    }

    struct FetchEmailsResponse: Codable {
        let emails: [EmailResponse]
        let count: Int
    }

    // MARK: - Public Methods

    /// Fetch emails from the API gateway
    func fetchEmails() async throws -> [Email] {
        // Get the actual logged-in user's ID from AuthManager
        guard let userId = AuthManager.shared.currentUser?.id.uuidString else {
            throw EmailServiceError.notAuthenticated
        }

        let provider = "gmail" // TODO: Support multiple providers

        let endpoint = "/api/email/emails/\(userId)/\(provider)?limit=50"

        let response: FetchEmailsResponse = try await APIClient.shared.get(endpoint: endpoint)

        // Convert API response to app Email models
        return response.emails.compactMap { emailResponse in
            convertToEmail(emailResponse)
        }
    }

    // MARK: - Private Helpers

    private func convertToEmail(_ response: EmailResponse) -> Email? {
        // Parse email addresses
        let fromContact = parseEmailAddress(response.from)
        let toContacts = response.to.compactMap { parseEmailAddress($0) }

        // Generate preview from body (first 100 chars)
        let preview = String(response.body.prefix(100))

        // Map AI category to priority
        let priority: EmailPriority
        if let aiCategory = response.aiCategory {
            switch aiCategory.lowercased() {
            case "urgent":
                priority = .high
            case "important":
                priority = .high
            case "low":
                priority = .low
            default:
                priority = .normal
            }
        } else {
            priority = .normal
        }

        return Email(
            id: response.id,
            from: fromContact,
            to: toContacts,
            subject: response.subject,
            preview: preview,
            body: response.body,
            timestamp: response.timestamp,
            isRead: response.isRead,
            isStarred: false,
            priority: priority,
            aiSummary: response.aiSummary
        )
    }

    private func parseEmailAddress(_ emailString: String) -> EmailContact {
        // Simple parser: "Name <email@example.com>" or just "email@example.com"
        if emailString.contains("<") && emailString.contains(">") {
            let parts = emailString.components(separatedBy: "<")
            let name = parts[0].trimmingCharacters(in: .whitespaces)
            let email = parts[1].replacingOccurrences(of: ">", with: "").trimmingCharacters(in: .whitespaces)
            return EmailContact(email: email, name: name.isEmpty ? email : name)
        } else {
            return EmailContact(email: emailString, name: emailString)
        }
    }
}

// MARK: - Errors
enum EmailServiceError: LocalizedError {
    case notAuthenticated
    case invalidProvider

    var errorDescription: String? {
        switch self {
        case .notAuthenticated:
            return "User not authenticated. Please login first."
        case .invalidProvider:
            return "Invalid email provider"
        }
    }
}
