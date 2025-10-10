import SwiftUI
import Foundation

// MARK: - Calendar Event Model
struct CalendarEvent: Identifiable, Codable {
    let id: String
    let title: String
    let description: String?
    let startTime: Date
    let endTime: Date
    let location: String?
    let attendees: [Attendee]
    var color: CodableColor
    var hasPrep: Bool
    var meetingPrep: MeetingPrep?
    var status: EventStatus

    init(
        id: String = UUID().uuidString,
        title: String,
        description: String? = nil,
        startTime: Date,
        endTime: Date,
        location: String? = nil,
        attendees: [Attendee] = [],
        color: CodableColor = CodableColor(color: .blue),
        hasPrep: Bool = false,
        meetingPrep: MeetingPrep? = nil,
        status: EventStatus = .confirmed
    ) {
        self.id = id
        self.title = title
        self.description = description
        self.startTime = startTime
        self.endTime = endTime
        self.location = location
        self.attendees = attendees
        self.color = color
        self.hasPrep = hasPrep
        self.meetingPrep = meetingPrep
        self.status = status
    }

    var timeRange: String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return "\(formatter.string(from: startTime)) - \(formatter.string(from: endTime))"
    }

    var duration: String {
        let interval = endTime.timeIntervalSince(startTime)
        let hours = Int(interval) / 3600
        let minutes = (Int(interval) % 3600) / 60

        if hours > 0 {
            return "\(hours)h \(minutes)m"
        } else {
            return "\(minutes)m"
        }
    }
}

// MARK: - Attendee
struct Attendee: Identifiable, Codable {
    let id: UUID
    let name: String
    let email: String
    var status: AttendeeStatus

    init(id: UUID = UUID(), name: String, email: String, status: AttendeeStatus) {
        self.id = id
        self.name = name
        self.email = email
        self.status = status
    }

    enum CodingKeys: String, CodingKey {
        case name, email, status
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = UUID()
        self.name = try container.decode(String.self, forKey: .name)
        self.email = try container.decode(String.self, forKey: .email)
        self.status = try container.decode(AttendeeStatus.self, forKey: .status)
    }

    enum AttendeeStatus: String, Codable {
        case accepted
        case declined
        case tentative
        case pending
    }
}

// MARK: - Event Status
enum EventStatus: String, Codable {
    case confirmed
    case tentative
    case cancelled
}

// MARK: - Meeting Prep
struct MeetingPrep: Codable {
    let agenda: String
    let keyPoints: [String]
    let participants: [String]
    let requiredDocuments: [String]?
    let aiInsights: String?
}

// MARK: - Codable Color
struct CodableColor: Codable {
    let red: Double
    let green: Double
    let blue: Double
    let alpha: Double

    init(color: Color) {
        // Convert SwiftUI Color to components
        let uiColor = UIColor(color)
        var r: CGFloat = 0
        var g: CGFloat = 0
        var b: CGFloat = 0
        var a: CGFloat = 0
        uiColor.getRed(&r, green: &g, blue: &b, alpha: &a)

        self.red = Double(r)
        self.green = Double(g)
        self.blue = Double(b)
        self.alpha = Double(a)
    }

    var color: Color {
        Color(red: red, green: green, blue: blue, opacity: alpha)
    }
}

// MARK: - Mock Data
extension CalendarEvent {
    static let mockEvents: [CalendarEvent] = [
        CalendarEvent(
            title: "Q4 Strategy Meeting",
            description: "Quarterly planning session",
            startTime: Date().addingTimeInterval(3600),
            endTime: Date().addingTimeInterval(7200),
            location: "Conference Room A",
            attendees: [
                Attendee(name: "Sarah Chen", email: "sarah@company.com", status: .accepted),
                Attendee(name: "Mike Johnson", email: "mike@company.com", status: .tentative)
            ],
            color: CodableColor(color: .blue),
            hasPrep: true,
            meetingPrep: MeetingPrep(
                agenda: "Discuss Q4 priorities and resource allocation",
                keyPoints: ["Review Q3 results", "Set Q4 goals", "Assign responsibilities"],
                participants: ["Sarah Chen", "Mike Johnson", "You"],
                requiredDocuments: ["Q3 Report", "Budget Proposal"],
                aiInsights: "This meeting follows up on last quarter's strategic initiatives. Sarah will likely focus on marketing priorities."
            )
        ),
        CalendarEvent(
            title: "1:1 with Engineering Lead",
            description: "Weekly sync",
            startTime: Date().addingTimeInterval(10800),
            endTime: Date().addingTimeInterval(12600),
            location: "Zoom",
            attendees: [
                Attendee(name: "Alex Rodriguez", email: "alex@company.com", status: .accepted)
            ],
            color: CodableColor(color: .green)
        ),
        CalendarEvent(
            title: "Product Demo",
            description: "Showcase new features to stakeholders",
            startTime: Date().addingTimeInterval(18000),
            endTime: Date().addingTimeInterval(21600),
            location: "Main Conference Room",
            attendees: [
                Attendee(name: "Lisa Park", email: "lisa@company.com", status: .accepted),
                Attendee(name: "Tom Wilson", email: "tom@company.com", status: .accepted)
            ],
            color: CodableColor(color: .purple),
            hasPrep: true,
            meetingPrep: MeetingPrep(
                agenda: "Demo new AI features",
                keyPoints: ["Chat interface", "Email automation", "Calendar intelligence"],
                participants: ["Lisa Park", "Tom Wilson", "Engineering Team"],
                requiredDocuments: ["Feature Specs", "Demo Script"],
                aiInsights: "Key stakeholders are interested in ROI and user adoption metrics."
            )
        )
    ]
}
