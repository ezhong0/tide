/**
 * Daily Snapshot Models
 * Models for daily intelligence snapshot
 */

import Foundation

struct DailySnapshot: Codable, Identifiable {
    let id: String
    let userId: String
    let snapshotDate: Date
    let priorityItems: [PriorityItem]
    let pendingDecisions: [PendingDecision]
    let meetingPreviews: [MeetingPreview]
    let predictions: [Prediction]
    let generatedAt: Date
}

struct PriorityItem: Codable, Identifiable {
    let id: String
    let type: ItemType
    let title: String
    let description: String
    let urgency: Urgency
    let importance: Double
    let deadline: Date?
    let source: String
    let metadata: [String: AnyCodable]

    enum ItemType: String, Codable {
        case email
        case task
        case meeting
        case decision
    }

    enum Urgency: String, Codable {
        case low
        case medium
        case high
        case critical

        var color: String {
            switch self {
            case .low: return "gray"
            case .medium: return "blue"
            case .high: return "orange"
            case .critical: return "red"
            }
        }

        var icon: String {
            switch self {
            case .low: return "circle"
            case .medium: return "circle.fill"
            case .high: return "exclamationmark.circle.fill"
            case .critical: return "exclamationmark.triangle.fill"
            }
        }
    }
}

struct PendingDecision: Codable, Identifiable {
    let id: String
    let title: String
    let description: String
    let context: DecisionContext
    let recommendation: AIRecommendation?
    let urgency: PriorityItem.Urgency
    let deadline: Date?
    let requester: Requester?

    struct Requester: Codable {
        let name: String
        let email: String
    }
}

// DecisionContext and AIRecommendation are defined in Decision.swift

struct MeetingPreview: Codable, Identifiable {
    let id: String
    let eventId: String
    let title: String
    let startTime: Date
    let endTime: Date
    let attendees: [Attendee]
    let briefGenerated: Bool
    let briefSummary: String?
    let preparation: [String]?

    struct Attendee: Codable {
        let name: String
        let email: String
    }
}

struct Prediction: Codable, Identifiable {
    let id: String
    let action: String
    let description: String
    let reasoning: String
    let confidence: Double
    let estimatedTimeSaved: Int
    let preview: String?
    let canExecuteAutonomously: Bool
    let basedOnPattern: PatternInfo

    struct PatternInfo: Codable {
        let type: PatternType
        let frequency: Int
        let observationPeriod: Int

        enum PatternType: String, Codable {
            case temporal
            case sequential
            case conditional
        }
    }
}
