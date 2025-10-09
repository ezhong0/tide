/**
 * Email Draft Models
 * Models for multi-draft email composition
 */

import Foundation

struct EmailDraft: Codable, Identifiable {
    let id: String?
    let version: DraftVersion
    let subject: String
    let body: String
    let wordCount: Int
    let confidence: Double
    let tone: EmailTone
    let metadata: DraftMetadata

    enum DraftVersion: String, Codable {
        case detailed
        case balanced
        case brief
        case custom

        var displayName: String {
            switch self {
            case .detailed: return "Detailed"
            case .balanced: return "Balanced"
            case .brief: return "Brief"
            case .custom: return "Custom"
            }
        }

        var description: String {
            switch self {
            case .detailed: return "400-500 words • Thorough"
            case .balanced: return "150-250 words • Moderate"
            case .brief: return "50-100 words • Concise"
            case .custom: return "Your version"
            }
        }

        var icon: String {
            switch self {
            case .detailed: return "doc.text.fill"
            case .balanced: return "doc.text"
            case .brief: return "doc.plaintext"
            case .custom: return "pencil"
            }
        }
    }

    enum EmailTone: String, Codable {
        case professional
        case friendly
        case formal
        case casual

        var displayName: String {
            rawValue.capitalized
        }

        var icon: String {
            switch self {
            case .professional: return "briefcase.fill"
            case .friendly: return "hand.wave.fill"
            case .formal: return "building.columns.fill"
            case .casual: return "face.smiling"
            }
        }
    }

    struct DraftMetadata: Codable {
        let generatedAt: Date
        let includesSignature: Bool
        let estimatedReadTime: Int // seconds
    }
}

struct EmailComposeContext: Codable {
    let relationship: RelationshipContext?
    let previousEmails: [Email]?
    let urgency: String?
    let tone: String?

    struct RelationshipContext: Codable {
        let contactEmail: String
        let contactName: String?
        let relationshipStrength: Double
        let interactionFrequency: String
        let vipStatus: Bool
    }
}

struct DraftRequest: Codable {
    let emailId: String
    let userId: String
    let context: EmailComposeContext?
}

struct DraftResponse: Codable {
    let drafts: [EmailDraft]
    let generatedAt: Date
}

// Email model imported from canonical Email.swift

struct RelationshipIntelligence: Codable, Identifiable {
    let id: String
    let contactEmail: String
    let contactName: String?
    let relationshipStrength: Double
    let interactionFrequency: String
    let lastInteractionAt: Date?
    let totalEmailsSent: Int
    let totalEmailsReceived: Int
    let topics: [String]
    let sentiment: String
    let vipStatus: Bool

    var strengthDescription: String {
        let percentage = Int(relationshipStrength * 100)
        if percentage >= 80 { return "Strong" }
        if percentage >= 50 { return "Moderate" }
        if percentage >= 30 { return "Developing" }
        return "New"
    }

    var strengthColor: String {
        let percentage = Int(relationshipStrength * 100)
        if percentage >= 80 { return "green" }
        if percentage >= 50 { return "blue" }
        if percentage >= 30 { return "orange" }
        return "gray"
    }
}
