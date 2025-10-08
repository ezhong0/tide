/**
 * Action Models
 * Models for action suggestions and execution
 */

import Foundation

struct ActionSuggestion: Codable, Identifiable {
    let id: String
    let userId: String
    let suggestionType: ActionType
    let context: ActionContext
    let preview: String
    let confidence: Double
    let requiresApproval: Bool
    let status: ActionStatus
    let createdAt: Date
    let estimatedTimeSaved: Int?

    enum ActionType: String, Codable {
        case sendEmail = "send_email"
        case scheduleMeeting = "schedule_meeting"
        case delegateTask = "delegate_task"
        case declineMeeting = "decline_meeting"
        case archiveEmail = "archive_email"
        case sendReminder = "send_reminder"
        case updateTask = "update_task"
        case rescheduleMeeting = "reschedule_meeting"

        var displayName: String {
            switch self {
            case .sendEmail: return "Send Email"
            case .scheduleMeeting: return "Schedule Meeting"
            case .delegateTask: return "Delegate Task"
            case .declineMeeting: return "Decline Meeting"
            case .archiveEmail: return "Archive Email"
            case .sendReminder: return "Send Reminder"
            case .updateTask: return "Update Task"
            case .rescheduleMeeting: return "Reschedule Meeting"
            }
        }

        var icon: String {
            switch self {
            case .sendEmail: return "envelope.fill"
            case .scheduleMeeting: return "calendar.badge.plus"
            case .delegateTask: return "person.2.fill"
            case .declineMeeting: return "calendar.badge.minus"
            case .archiveEmail: return "archivebox.fill"
            case .sendReminder: return "bell.fill"
            case .updateTask: return "checkmark.circle.fill"
            case .rescheduleMeeting: return "calendar.badge.clock"
            }
        }
    }

    enum ActionStatus: String, Codable {
        case pending
        case approved
        case rejected
        case executed
        case failed
        case undone
    }
}

struct ActionContext: Codable {
    let targetId: String?
    let targetType: String?
    let payload: [String: AnyCodable]
    let reasoning: String?
}

struct ExecutionResult: Codable {
    let success: Bool
    let message: String?
    let error: String?
}
