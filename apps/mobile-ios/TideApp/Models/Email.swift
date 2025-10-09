/**
 * Email Model - Canonical Definition
 * Single source of truth for all email-related models
 */

import Foundation

// MARK: - Email Model
struct Email: Identifiable, Codable {
    let id: String
    let from: EmailContact
    let to: [EmailContact]
    let subject: String
    let preview: String
    let body: String
    let receivedAt: Date  // Canonical name (previously timestamp in some places)
    var isRead: Bool
    var isStarred: Bool
    var priority: EmailPriority
    var aiSummary: String?
    var suggestedActions: [EmailAction]?
    let category: String?  // For filtering (inbox, sent, etc.)

    // Convenience initializer for legacy code
    init(
        id: String = UUID().uuidString,
        from: EmailContact,
        to: [EmailContact],
        subject: String,
        preview: String = "",
        body: String,
        receivedAt: Date = Date(),
        isRead: Bool = false,
        isStarred: Bool = false,
        priority: EmailPriority = .normal,
        aiSummary: String? = nil,
        suggestedActions: [EmailAction]? = nil,
        category: String? = nil
    ) {
        self.id = id
        self.from = from
        self.to = to
        self.subject = subject
        self.preview = preview
        self.body = body
        self.receivedAt = receivedAt
        self.isRead = isRead
        self.isStarred = isStarred
        self.priority = priority
        self.aiSummary = aiSummary
        self.suggestedActions = suggestedActions
        self.category = category
    }

    // Convenience initializer from simple string format (for API responses)
    init(
        id: String,
        from: String,
        to: [String],
        subject: String,
        body: String,
        receivedAt: Date,
        category: String? = nil,
        priority: Int? = nil
    ) {
        self.id = id
        self.from = EmailContact(email: from, name: nil)
        self.to = to.map { EmailContact(email: $0, name: nil) }
        self.subject = subject
        self.preview = String(body.prefix(100))
        self.body = body
        self.receivedAt = receivedAt
        self.isRead = false
        self.isStarred = false
        self.priority = EmailPriority(rawValue: priority ?? 1) ?? .normal
        self.aiSummary = nil
        self.suggestedActions = nil
        self.category = category
    }

    // Backward compatibility - timestamp alias
    var timestamp: Date { receivedAt }
}

// MARK: - Email Contact
struct EmailContact: Codable, Hashable {
    let email: String
    let name: String?

    var displayName: String {
        name ?? email
    }
}

// MARK: - Email Priority
enum EmailPriority: Int, Codable {
    case low = 0
    case normal = 1
    case high = 2
    case urgent = 3

    var displayName: String {
        switch self {
        case .low: return "Low"
        case .normal: return "Normal"
        case .high: return "High"
        case .urgent: return "Urgent"
        }
    }

    var color: String {
        switch self {
        case .low: return "gray"
        case .normal: return "blue"
        case .high: return "orange"
        case .urgent: return "red"
        }
    }
}

// MARK: - Email Action
struct EmailAction: Identifiable, Codable {
    let id: String
    let type: ActionType
    let label: String

    enum ActionType: String, Codable {
        case reply
        case replyAll
        case forward
        case archive
        case delegate
        case schedule
        case markRead
        case markUnread
        case star
        case unstar
    }

    init(id: String = UUID().uuidString, type: ActionType, label: String) {
        self.id = id
        self.type = type
        self.label = label
    }
}

// MARK: - Email Filter
enum EmailFilter: String, CaseIterable {
    case all = "All"
    case unread = "Unread"
    case starred = "Starred"
    case high = "High Priority"
    case normal = "Normal"
    case low = "Low Priority"
}
