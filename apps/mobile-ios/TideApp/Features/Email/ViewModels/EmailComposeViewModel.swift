/**
 * Email Compose View Model
 * Manages state and business logic for email composition
 */

import SwiftUI

@MainActor
final class EmailComposeViewModel: ObservableObject {
    @Published var to: String = ""
    @Published var cc: String = ""
    @Published var bcc: String = ""
    @Published var subject: String = ""
    @Published var body: String = ""
    @Published var showCc: Bool = false
    @Published var showBcc: Bool = false

    @Published var originalEmail: EmailDetail?
    @Published var suggestions: [String] = []
    @Published var isLoading = false
    @Published var isSending = false
    @Published var sendSuccess = false
    @Published var showError = false
    @Published var error: Error?

    private let replyTo: String?
    private let mode: ComposeMode
    private let apiClient: APIClientProtocol
    private let authManager: AuthManagerProtocol

    private var draftTimer: Timer?
    private var initialState: String = ""

    init(replyTo: String?, mode: ComposeMode, apiClient: APIClientProtocol, authManager: AuthManagerProtocol) {
        self.replyTo = replyTo
        self.mode = mode
        self.apiClient = apiClient
        self.authManager = authManager

        // Start auto-save timer
        startAutoSave()
    }

    deinit {
        draftTimer?.invalidate()
    }

    var canSend: Bool {
        !to.isEmpty && !subject.isEmpty && !body.isEmpty
    }

    var hasChanges: Bool {
        let currentState = "\(to)\(cc)\(bcc)\(subject)\(body)"
        return currentState != initialState && currentState.count > 0
    }

    var showOriginalMessage: Bool {
        mode != .new && originalEmail != nil
    }

    func loadOriginalEmail() async {
        guard let emailId = replyTo, mode != .new else { return }

        isLoading = true
        defer { isLoading = false }

        do {
            // Fetch original email from API
            let fetchedEmail = try await apiClient.getEmailDetail(id: emailId)

            // Convert to EmailDetail
            originalEmail = EmailDetail(
                id: fetchedEmail.id,
                from: fetchedEmail.from.email,
                fromName: fetchedEmail.from.name,
                to: fetchedEmail.to.map { $0.email },
                cc: nil,
                subject: fetchedEmail.subject,
                body: fetchedEmail.body,
                receivedAt: fetchedEmail.timestamp,
                isRead: fetchedEmail.isRead,
                isStarred: fetchedEmail.isStarred,
                isVIP: false,
                aiSummary: fetchedEmail.aiSummary,
                attachments: nil
            )

            // Pre-fill fields based on mode
            prefillFields()

            // Generate AI suggestions
            generateSuggestions()

            // Store initial state
            initialState = "\(to)\(cc)\(bcc)\(subject)\(body)"

        } catch {
            Logger.error("Failed to load original email", error: error)
            self.error = error
            self.showError = true
        }
    }

    func send() async {
        guard canSend else { return }

        isSending = true
        defer { isSending = false }

        do {
            // Parse recipients
            let toRecipients = to.split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }

            switch mode {
            case .reply:
                // Reply to original email
                guard let emailId = replyTo else {
                    throw EmailError.invalidReplyContext
                }
                try await apiClient.replyToEmail(id: emailId, body: body)

            case .replyAll:
                // Reply all - same as reply for now (backend handles CC)
                guard let emailId = replyTo else {
                    throw EmailError.invalidReplyContext
                }
                try await apiClient.replyToEmail(id: emailId, body: body)

            case .forward:
                // Forward email
                guard let emailId = replyTo else {
                    throw EmailError.invalidForwardContext
                }
                try await apiClient.forwardEmail(id: emailId, to: toRecipients, body: body)

            case .new:
                // Send new email
                try await apiClient.sendEmail(to: toRecipients, subject: subject, body: body)
            }

            sendSuccess = true

            // Save as sent
            saveDraft(isSent: true)

        } catch {
            Logger.error("Failed to send email", error: error)
            self.error = error
            self.showError = true
        }
    }

    func applySuggestion(_ suggestion: String) {
        if body.isEmpty {
            body = suggestion
        } else {
            body += "\n\n" + suggestion
        }
    }

    // MARK: - Private Helpers
    private func prefillFields() {
        guard let email = originalEmail else { return }

        switch mode {
        case .new:
            break

        case .reply:
            to = email.from
            subject = email.subject.hasPrefix("Re:") ? email.subject : "Re: \(email.subject)"
            body = "\n\n"

        case .replyAll:
            to = email.from
            cc = email.to.filter { $0 != "me@example.com" }.joined(separator: ", ")
            if !cc.isEmpty {
                showCc = true
            }
            subject = email.subject.hasPrefix("Re:") ? email.subject : "Re: \(email.subject)"
            body = "\n\n"

        case .forward:
            subject = email.subject.hasPrefix("Fwd:") ? email.subject : "Fwd: \(email.subject)"
            body = "\n\n"
        }
    }

    private func generateSuggestions() {
        // Mock AI suggestions based on mode
        switch mode {
        case .reply:
            suggestions = [
                "Thank you for the update!",
                "I'll review and get back to you.",
                "Sounds good to me."
            ]
        case .replyAll:
            suggestions = [
                "Thanks everyone for the feedback.",
                "I agree with the proposed approach.",
                "Let's move forward with this."
            ]
        case .forward:
            suggestions = [
                "FYI - please review",
                "Thought this might interest you",
                "Please see below"
            ]
        case .new:
            suggestions = []
        }
    }

    private func startAutoSave() {
        draftTimer = Timer.scheduledTimer(withTimeInterval: 30.0, repeats: true) { [weak self] _ in
            self?.saveDraft()
        }
    }

    private func saveDraft(isSent: Bool = false) {
        guard hasChanges else { return }

        // TODO: Implement actual draft saving to local storage
        Logger.debug("Saving draft... (sent: \(isSent))")

        if !isSent {
            // Update initial state after saving
            initialState = "\(to)\(cc)\(bcc)\(subject)\(body)"
        }
    }
}

// MARK: - Email Error
enum EmailError: LocalizedError {
    case invalidReplyContext
    case invalidForwardContext

    var errorDescription: String? {
        switch self {
        case .invalidReplyContext:
            return "Cannot reply: Original email not found"
        case .invalidForwardContext:
            return "Cannot forward: Original email not found"
        }
    }
}
