/**
 * Email Inbox View Model
 * Manages state and business logic for the email inbox
 */

import SwiftUI

@MainActor
final class EmailInboxViewModel: ObservableObject {
    @Published var emails: [EmailMessage] = []
    @Published var isLoading = false
    @Published var error: Error?

    // Filters
    @Published var showHighPriorityOnly = false
    @Published var showVIPOnly = false
    @Published var showUnreadOnly = false
    @Published var showWithAttachmentsOnly = false
    @Published var selectedTimeRange = 0

    private let apiClient: APIClientProtocol
    private let authManager: AuthManagerProtocol

    init(apiClient: APIClientProtocol, authManager: AuthManagerProtocol) {
        self.apiClient = apiClient
        self.authManager = authManager
    }

    func loadEmails(category: String) async {
        isLoading = true
        defer { isLoading = false }

        do {
            let fetchedEmails = try await apiClient.getEmails(category: category)
            // Convert Email to EmailMessage
            emails = fetchedEmails.map { email in
                EmailMessage(
                    id: email.id,
                    from: email.from,
                    fromName: extractName(from: email.from),
                    to: email.to,
                    subject: email.subject,
                    body: email.body,
                    receivedAt: email.receivedAt,
                    isRead: false, // TODO: Get from API
                    isVIP: false, // TODO: Get from API
                    hasAttachments: false, // TODO: Get from API
                    aiCategory: email.category,
                    aiPriority: email.priority,
                    aiSummary: nil
                )
            }
        } catch {
            Logger.error("Failed to load emails", error: error)
            self.error = error
        }
    }

    func filteredEmails(for category: EmailCategory, search: String) -> [EmailMessage] {
        var filtered = emails

        // Apply category filter
        switch category {
        case .inbox:
            break // Show all
        case .priority:
            filtered = filtered.filter { ($0.aiPriority ?? 0) >= 7 }
        case .sent:
            break // TODO: Filter sent emails
        case .important:
            filtered = filtered.filter { $0.aiCategory == "important" || $0.aiCategory == "urgent" }
        case .unread:
            filtered = filtered.filter { !$0.isRead }
        case .archived:
            break // TODO: Filter archived
        }

        // Apply additional filters
        if showHighPriorityOnly {
            filtered = filtered.filter { ($0.aiPriority ?? 0) >= 7 }
        }

        if showVIPOnly {
            filtered = filtered.filter { $0.isVIP }
        }

        if showUnreadOnly {
            filtered = filtered.filter { !$0.isRead }
        }

        if showWithAttachmentsOnly {
            filtered = filtered.filter { $0.hasAttachments }
        }

        // Apply time range filter
        if selectedTimeRange > 0 {
            if let cutoff = Date().safeAdd(.day, value: -selectedTimeRange) {
                filtered = filtered.filter { $0.receivedAt > cutoff }
            } else {
                Logger.warning("Failed to calculate time range cutoff for \(selectedTimeRange) days")
            }
        }

        // Apply search
        if !search.isEmpty {
            filtered = filtered.filter {
                $0.subject.localizedCaseInsensitiveContains(search) ||
                $0.from.localizedCaseInsensitiveContains(search) ||
                $0.body.localizedCaseInsensitiveContains(search)
            }
        }

        return filtered
    }

    func getCategoryCount(_ category: EmailCategory) -> Int {
        filteredEmails(for: category, search: "").count
    }

    func resetFilters() {
        showHighPriorityOnly = false
        showVIPOnly = false
        showUnreadOnly = false
        showWithAttachmentsOnly = false
        selectedTimeRange = 0
    }

    // Email Actions
    func deleteEmail(_ email: EmailMessage) async {
        do {
            // Remove optimistically
            emails.removeAll { $0.id == email.id }

            // Delete via API
            try await apiClient.deleteEmail(id: email.id)
        } catch {
            Logger.error("Failed to delete email", error: error)
            self.error = error
        }
    }

    func archiveEmail(_ email: EmailMessage) async {
        do {
            // Remove optimistically
            emails.removeAll { $0.id == email.id }

            // Archive via API
            try await apiClient.archiveEmail(id: email.id)
        } catch {
            Logger.error("Failed to archive email", error: error)
            self.error = error
        }
    }

    func toggleRead(_ email: EmailMessage) async {
        guard let index = emails.firstIndex(where: { $0.id == email.id }) else { return }

        let wasRead = emails[index].isRead

        // Optimistic update
        emails[index].isRead = !wasRead

        // API call
        do {
            if wasRead {
                try await apiClient.markEmailUnread(id: email.id)
            } else {
                try await apiClient.markEmailRead(id: email.id)
            }
        } catch {
            Logger.error("Failed to toggle read status", error: error)
            // Rollback on error
            emails[index].isRead = wasRead
        }
    }

    private func extractName(from email: String) -> String? {
        // Extract name from "Name <email@example.com>" format
        let components = email.components(separatedBy: "<")
        if components.count > 1 {
            return components[0].trimmingCharacters(in: .whitespaces)
        }
        return nil
    }
}
