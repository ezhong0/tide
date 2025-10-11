import Foundation

// MARK: - Email Model
struct Email: Identifiable, Codable {
    let id: String
    let from: EmailContact
    let to: [EmailContact]
    let subject: String
    let preview: String
    let body: String
    let timestamp: Date
    var isRead: Bool
    var isStarred: Bool
    var priority: EmailPriority
    var aiSummary: String?
    var suggestedActions: [EmailAction]?

    init(
        id: String = UUID().uuidString,
        from: EmailContact,
        to: [EmailContact],
        subject: String,
        preview: String,
        body: String,
        timestamp: Date = Date(),
        isRead: Bool = false,
        isStarred: Bool = false,
        priority: EmailPriority = .normal,
        aiSummary: String? = nil,
        suggestedActions: [EmailAction]? = nil
    ) {
        self.id = id
        self.from = from
        self.to = to
        self.subject = subject
        self.preview = preview
        self.body = body
        self.timestamp = timestamp
        self.isRead = isRead
        self.isStarred = isStarred
        self.priority = priority
        self.aiSummary = aiSummary
        self.suggestedActions = suggestedActions
    }
}

// MARK: - Email Contact
struct EmailContact: Codable {
    let email: String
    let name: String
}

// MARK: - Email Priority
enum EmailPriority: String, Codable {
    case high
    case normal
    case low
}

// MARK: - Email Action
struct EmailAction: Identifiable, Codable {
    let id: UUID
    let type: ActionType
    let label: String

    init(id: UUID = UUID(), type: ActionType, label: String) {
        self.id = id
        self.type = type
        self.label = label
    }

    enum CodingKeys: String, CodingKey {
        case type, label
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = UUID()
        self.type = try container.decode(ActionType.self, forKey: .type)
        self.label = try container.decode(String.self, forKey: .label)
    }

    enum ActionType: String, Codable {
        case reply
        case replyAll
        case forward
        case archive
        case delegate
        case schedule
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

// MARK: - Mock Data
extension Email {
    static let mockEmails: [Email] = [
        Email(
            from: EmailContact(email: "sarah@company.com", name: "Sarah Chen"),
            to: [EmailContact(email: "you@tide.ai", name: "You")],
            subject: "Q4 Strategy Meeting - Need Your Input",
            preview: "Hi, I wanted to get your thoughts on the Q4 roadmap before our meeting tomorrow...",
            body: "Hi, I wanted to get your thoughts on the Q4 roadmap before our meeting tomorrow. We need to finalize the priorities and I value your input on the engineering timeline.",
            timestamp: Date().addingTimeInterval(-3600),
            priority: .high,
            aiSummary: "Sarah needs your feedback on Q4 roadmap before tomorrow's meeting"
        ),
        Email(
            from: EmailContact(email: "mike@startup.io", name: "Mike Johnson"),
            to: [EmailContact(email: "you@tide.ai", name: "You")],
            subject: "Partnership Opportunity",
            preview: "We're interested in exploring a potential partnership with Tide...",
            body: "We're interested in exploring a potential partnership with Tide. Would you be available for a call next week?",
            timestamp: Date().addingTimeInterval(-7200),
            priority: .normal
        ),
        Email(
            from: EmailContact(email: "team@slack.com", name: "Slack"),
            to: [EmailContact(email: "you@tide.ai", name: "You")],
            subject: "Your weekly Slack digest",
            preview: "Here's what happened in your workspace this week...",
            body: "Here's what happened in your workspace this week...",
            timestamp: Date().addingTimeInterval(-86400),
            isRead: true,
            priority: .low
        )
    ]
}
