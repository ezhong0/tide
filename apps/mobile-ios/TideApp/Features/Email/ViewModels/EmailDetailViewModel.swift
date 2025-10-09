/**
 * Email Detail View Model
 * Manages state and business logic for email detail view
 */

import SwiftUI

@MainActor
final class EmailDetailViewModel: ObservableObject {
    @Published var email: EmailDetail?
    @Published var threadMessages: [EmailDetail]?
    @Published var isLoading = false
    @Published var error: Error?

    private let emailId: String
    private let apiClient: APIClientProtocol
    private let authManager: AuthManagerProtocol

    init(emailId: String, apiClient: APIClientProtocol, authManager: AuthManagerProtocol) {
        self.emailId = emailId
        self.apiClient = apiClient
        self.authManager = authManager
    }

    func loadEmail() async {
        isLoading = true
        defer { isLoading = false }

        do {
            // Fetch email details from API
            let fetchedEmail = try await apiClient.getEmailDetail(id: emailId)

            // Convert API Email to EmailDetail
            email = EmailDetail(
                id: fetchedEmail.id,
                from: fetchedEmail.from.email,
                fromName: fetchedEmail.from.name,
                to: fetchedEmail.to.map { $0.email },
                cc: nil, // TODO: Add CC support to Email model
                subject: fetchedEmail.subject,
                body: fetchedEmail.body,
                receivedAt: fetchedEmail.timestamp,
                isRead: fetchedEmail.isRead,
                isStarred: fetchedEmail.isStarred,
                isVIP: false, // TODO: Determine VIP status
                aiSummary: fetchedEmail.aiSummary,
                attachments: nil // TODO: Add attachments support
            )

            // Load thread messages
            await loadThread()

        } catch {
            Logger.error("Failed to load email", error: error)
            self.error = error
        }
    }

    func loadThread() async {
        do {
            let threadEmails = try await apiClient.getEmailThread(id: emailId)

            // Convert to EmailDetail array, excluding the current email
            threadMessages = threadEmails
                .filter { $0.id != emailId }
                .map { email in
                    EmailDetail(
                        id: email.id,
                        from: email.from.email,
                        fromName: email.from.name,
                        to: email.to.map { $0.email },
                        cc: nil,
                        subject: email.subject,
                        body: email.body,
                        receivedAt: email.timestamp,
                        isRead: email.isRead,
                        isStarred: email.isStarred,
                        isVIP: false,
                        aiSummary: email.aiSummary,
                        attachments: nil
                    )
                }
                .sorted { $0.receivedAt < $1.receivedAt } // Sort chronologically
        } catch {
            Logger.error("Failed to load thread", error: error)
            // Don't set error for thread - email is already loaded
            threadMessages = []
        }
    }

    func toggleRead() async {
        guard var email = email else { return }
        let wasRead = email.isRead

        // Optimistic update
        email = EmailDetail(
            id: email.id,
            from: email.from,
            fromName: email.fromName,
            to: email.to,
            cc: email.cc,
            subject: email.subject,
            body: email.body,
            receivedAt: email.receivedAt,
            isRead: !email.isRead,
            isStarred: email.isStarred,
            isVIP: email.isVIP,
            aiSummary: email.aiSummary,
            attachments: email.attachments
        )
        self.email = email

        // API call
        do {
            if wasRead {
                try await apiClient.markEmailUnread(id: emailId)
            } else {
                try await apiClient.markEmailRead(id: emailId)
            }
        } catch {
            Logger.error("Failed to toggle read status", error: error)
            // Rollback on error
            self.email?.isRead = wasRead
        }
    }

    func toggleStar() async {
        guard var email = email else { return }
        let wasStarred = email.isStarred

        // Optimistic update
        email = EmailDetail(
            id: email.id,
            from: email.from,
            fromName: email.fromName,
            to: email.to,
            cc: email.cc,
            subject: email.subject,
            body: email.body,
            receivedAt: email.receivedAt,
            isRead: email.isRead,
            isStarred: !email.isStarred,
            isVIP: email.isVIP,
            aiSummary: email.aiSummary,
            attachments: email.attachments
        )
        self.email = email

        // API call
        do {
            if wasStarred {
                try await apiClient.unstarEmail(id: emailId)
            } else {
                try await apiClient.starEmail(id: emailId)
            }
        } catch {
            Logger.error("Failed to toggle star", error: error)
            // Rollback on error
            self.email?.isStarred = wasStarred
        }
    }

    func archive() async {
        do {
            try await apiClient.archiveEmail(id: emailId)
        } catch {
            Logger.error("Failed to archive email", error: error)
            self.error = error
        }
    }

    func delete() async {
        do {
            try await apiClient.deleteEmail(id: emailId)
        } catch {
            Logger.error("Failed to delete email", error: error)
            self.error = error
        }
    }
}
