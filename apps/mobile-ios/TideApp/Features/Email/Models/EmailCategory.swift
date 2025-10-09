/**
 * Email Category Enumeration
 * Defines email categories for filtering
 */

import Foundation

enum EmailCategory: String, CaseIterable {
    case inbox = "inbox"
    case priority = "priority"
    case sent = "sent"
    case important = "important"
    case unread = "unread"
    case archived = "archived"

    var displayName: String {
        switch self {
        case .inbox: return "Inbox"
        case .priority: return "Priority"
        case .sent: return "Sent"
        case .important: return "Important"
        case .unread: return "Unread"
        case .archived: return "Archived"
        }
    }

    var icon: String {
        switch self {
        case .inbox: return "tray"
        case .priority: return "star.fill"
        case .sent: return "paperplane.fill"
        case .important: return "exclamationmark.circle.fill"
        case .unread: return "envelope.badge"
        case .archived: return "archivebox"
        }
    }

    var emptyMessage: String {
        switch self {
        case .inbox: return "No emails in inbox"
        case .priority: return "No priority emails"
        case .sent: return "No sent emails"
        case .important: return "No important emails"
        case .unread: return "No unread emails"
        case .archived: return "No archived emails"
        }
    }
}
