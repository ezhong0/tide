/**
 * Meeting Brief Models
 * Models for meeting intelligence and preparation
 */

import Foundation

struct MeetingBrief: Codable, Identifiable {
    let id: String?
    let eventId: String
    let title: String
    let startTime: Date
    let endTime: Date
    let attendees: [String]
    let attendeeInsights: [AttendeeInsight]
    let relevantEmails: [RelevantEmail]
    let previousMeetings: [PreviousMeeting]
    let relatedTasks: [RelatedTask]
    let keyDiscussionPoints: [String]
    let backgroundContext: String
    let preparationChecklist: [String]
    let suggestedTimeAllocation: [TimeAllocation]
    let confidence: Double
    let generatedAt: Date

    var durationMinutes: Int {
        Int((endTime.timeIntervalSince(startTime)) / 60)
    }

    var isUpcoming: Bool {
        startTime > Date()
    }

    var timeUntilMeeting: String {
        let interval = startTime.timeIntervalSince(Date())
        if interval < 0 { return "In progress" }
        if interval < 3600 { return "In \(Int(interval / 60))min" }
        if interval < 86400 { return "In \(Int(interval / 3600))h" }
        return "In \(Int(interval / 86400))d"
    }
}

struct AttendeeInsight: Codable, Identifiable {
    let email: String
    let name: String?
    let relationshipStrength: Double
    let lastInteraction: Date?
    let vipStatus: Bool
    let topics: [String]
    let sentiment: String
    let recentInteractions: Int

    var id: String { email }

    var strengthLevel: String {
        if relationshipStrength >= 0.8 { return "Strong" }
        if relationshipStrength >= 0.5 { return "Moderate" }
        if relationshipStrength >= 0.3 { return "Developing" }
        return "New"
    }

    var strengthColor: String {
        if relationshipStrength >= 0.8 { return "green" }
        if relationshipStrength >= 0.5 { return "blue" }
        if relationshipStrength >= 0.3 { return "orange" }
        return "gray"
    }
}

struct RelevantEmail: Codable, Identifiable {
    let id: String
    let from: String
    let subject: String
    let snippet: String
    let receivedAt: Date
    let relevanceScore: Double
}

struct PreviousMeeting: Codable, Identifiable {
    let id: String
    let title: String
    let date: Date
    let attendees: [String]
    let keyPoints: [String]
    let actionItems: [MeetingActionItem]
    let decisionsMade: [String]
}

struct MeetingActionItem: Codable, Identifiable {
    let id: String
    let description: String
    let assignedTo: String?
    let status: String
    let dueDate: Date?

    var statusColor: String {
        switch status.lowercased() {
        case "completed": return "green"
        case "in_progress", "in progress": return "blue"
        case "pending": return "orange"
        default: return "gray"
        }
    }
}

struct RelatedTask: Codable, Identifiable {
    let id: String
    let title: String
    let description: String?
    let status: String
    let priority: String
    let dueDate: Date?

    var priorityColor: String {
        switch priority.lowercased() {
        case "critical": return "red"
        case "high": return "orange"
        case "medium": return "blue"
        case "low": return "gray"
        default: return "gray"
        }
    }
}

struct TimeAllocation: Codable, Identifiable {
    let topic: String
    let minutes: Int
    let reasoning: String

    var id: String { topic }
}

// Calendar Optimization Models
struct CalendarOptimization: Codable, Identifiable {
    let id: String
    let type: OptimizationType
    let currentState: [String: AnyCodable]
    let suggestedState: [String: AnyCodable]
    let reasoning: String
    let impactScore: Double
    let estimatedTimeSavedMinutes: Int
    let affectedEvents: [String]
    let status: String

    enum OptimizationType: String, Codable {
        case batchMeetings = "batch_meetings"
        case reduceConflicts = "reduce_conflicts"
        case protectFocusTime = "protect_focus_time"
        case balanceLoad = "balance_load"
        case reschedulesuggestion = "reschedule_suggestion"

        var displayName: String {
            switch self {
            case .batchMeetings: return "Batch Meetings"
            case .reduceConflicts: return "Reduce Conflicts"
            case .protectFocusTime: return "Protect Focus Time"
            case .balanceLoad: return "Balance Load"
            case .reschedulesuggestion: return "Reschedule Suggestion"
            }
        }

        var icon: String {
            switch self {
            case .batchMeetings: return "square.stack.3d.up.fill"
            case .reduceConflicts: return "exclamationmark.triangle.fill"
            case .protectFocusTime: return "brain.head.profile"
            case .balanceLoad: return "chart.bar.fill"
            case .reschedulesuggestion: return "calendar.badge.clock"
            }
        }
    }
}

struct MeetingConflict: Codable, Identifiable {
    let id: String
    let type: ConflictType
    let event1Details: SimpleEvent
    let event2Details: SimpleEvent?
    let priority1: Int
    let priority2: Int?
    let suggestedResolution: String
    let resolutionOptions: [ResolutionOption]
    let autoResolvable: Bool
    let resolved: Bool

    enum ConflictType: String, Codable {
        case doubleBooking = "double_booking"
        case overlapping
        case backToBack = "back_to_back"
        case violatesFocusTime = "violates_focus_time"
        case exceedsDailyLimit = "exceeds_daily_limit"

        var displayName: String {
            switch self {
            case .doubleBooking: return "Double Booking"
            case .overlapping: return "Overlapping"
            case .backToBack: return "Back-to-Back"
            case .violatesFocusTime: return "Focus Time Violation"
            case .exceedsDailyLimit: return "Too Many Meetings"
            }
        }

        var icon: String {
            switch self {
            case .doubleBooking: return "exclamationmark.2"
            case .overlapping: return "arrow.triangle.2.circlepath"
            case .backToBack: return "arrow.right.arrow.left"
            case .violatesFocusTime: return "brain.head.profile"
            case .exceedsDailyLimit: return "calendar.badge.exclamationmark"
            }
        }

        var color: String {
            switch self {
            case .doubleBooking: return "red"
            case .overlapping: return "orange"
            case .backToBack: return "yellow"
            case .violatesFocusTime: return "purple"
            case .exceedsDailyLimit: return "orange"
            }
        }
    }
}

struct SimpleEvent: Codable {
    let id: String
    let title: String
    let startTime: Date
    let endTime: Date
}

struct ResolutionOption: Codable, Identifiable {
    let action: String
    let description: String
    let impactScore: Double
    let newTime: NewTimeSlot?

    var id: String { action + description }

    struct NewTimeSlot: Codable {
        let start: Date
        let end: Date
    }
}
