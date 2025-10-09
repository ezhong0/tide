/**
 * Email Message Model
 * Represents an email in list views
 */

import Foundation

struct EmailMessage: Identifiable {
    let id: String
    let from: String
    let fromName: String?
    let to: [String]
    let subject: String
    let body: String
    let receivedAt: Date
    var isRead: Bool // Mutable for optimistic updates
    let isVIP: Bool
    let hasAttachments: Bool
    let aiCategory: String?
    let aiPriority: Int?
    let aiSummary: String?

    var timeAgo: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: receivedAt, relativeTo: Date())
    }

    var bodyPreview: String {
        String(body.prefix(120))
    }
}
