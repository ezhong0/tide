import Foundation

// MARK: - Message Model
struct Message: Identifiable, Codable, Hashable {
    let id: String
    var content: String
    let role: MessageRole
    let timestamp: Date
    var status: MessageStatus
    var actionPreview: ActionPreview?
    var suggestions: [String]?
    var aiSummary: String?

    init(
        id: String = UUID().uuidString,
        content: String,
        role: MessageRole,
        timestamp: Date = Date(),
        status: MessageStatus = .sent,
        actionPreview: ActionPreview? = nil,
        suggestions: [String]? = nil,
        aiSummary: String? = nil
    ) {
        self.id = id
        self.content = content
        self.role = role
        self.timestamp = timestamp
        self.status = status
        self.actionPreview = actionPreview
        self.suggestions = suggestions
        self.aiSummary = aiSummary
    }
}

// MARK: - Message Role
enum MessageRole: String, Codable {
    case user
    case assistant
    case system
}

// MARK: - Message Status
enum MessageStatus: String, Codable {
    case sending
    case sent
    case delivered
    case read
    case failed
}

// MARK: - Action Preview
struct ActionPreview: Codable, Hashable {
    let title: String
    let description: String
    let actionType: ActionType
    let requiresConfirmation: Bool
    var isConfirmed: Bool

    enum ActionType: String, Codable {
        case scheduleEvent
        case sendEmail
        case createTask
        case updateCalendar
        case delegateTask
        case analyzeDocument
    }
}

// MARK: - Message Extensions
extension Message {
    var timeString: String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: timestamp)
    }

    var dateString: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: timestamp)
    }
}
