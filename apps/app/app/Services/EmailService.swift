import Foundation

/// Email Service - Minimal stub for sending emails
/// Note: Fetching emails is done through MobileBFFService
class EmailService {
    static let shared = EmailService()

    private init() {}

    /// Send an email
    /// TODO: Implement actual email sending through backend
    func sendEmail(to recipients: [String], subject: String, body: String) async throws {
        // Placeholder - would call email service API
        print("📧 Sending email to: \(recipients.joined(separator: ", "))")
        print("📧 Subject: \(subject)")

        // For now, just throw a not implemented error
        throw EmailServiceError.notImplemented
    }
}

enum EmailServiceError: LocalizedError {
    case notImplemented

    var errorDescription: String? {
        switch self {
        case .notImplemented:
            return "Email sending not yet implemented"
        }
    }
}
