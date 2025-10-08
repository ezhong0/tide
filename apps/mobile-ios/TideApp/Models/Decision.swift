/**
 * Decision Models
 * Models for decision tracking and AI recommendations
 */

import Foundation

struct Decision: Codable, Identifiable {
    let id: String
    let userId: String
    let title: String
    let description: String
    let decisionType: DecisionType
    let context: DecisionContext
    let options: [DecisionOption]
    let aiRecommendation: AIRecommendation?
    let userDecision: UserDecision?
    let status: DecisionStatus
    let urgency: Urgency
    let deadline: Date?
    let requesterName: String?
    let requesterEmail: String?
    let decidedAt: Date?
    let createdAt: Date
    let updatedAt: Date

    enum DecisionType: String, Codable {
        case approval
        case choice
        case prioritization
        case scheduling
        case budget
        case hire
        case partnership
        case strategic
        case operational

        var displayName: String {
            switch self {
            case .approval: return "Approval"
            case .choice: return "Choice"
            case .prioritization: return "Prioritization"
            case .scheduling: return "Scheduling"
            case .budget: return "Budget"
            case .hire: return "Hiring"
            case .partnership: return "Partnership"
            case .strategic: return "Strategic"
            case .operational: return "Operational"
            }
        }

        var icon: String {
            switch self {
            case .approval: return "checkmark.seal.fill"
            case .choice: return "arrow.left.arrow.right"
            case .prioritization: return "list.number"
            case .scheduling: return "calendar.badge.clock"
            case .budget: return "dollarsign.circle.fill"
            case .hire: return "person.badge.plus"
            case .partnership: return "hands.sparkles"
            case .strategic: return "lightbulb.fill"
            case .operational: return "gearshape.fill"
            }
        }
    }

    enum DecisionStatus: String, Codable {
        case pending
        case approved
        case declined
        case deferred
        case discussed
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

        var displayName: String {
            rawValue.capitalized
        }
    }
}

struct DecisionContext: Codable {
    let background: String
    let stakeholders: [String]
    let impact: Impact
    let historicalContext: String?
    let relatedDecisions: [String]?
    let financialImplications: FinancialImplications?
    let timeConstraints: TimeConstraints?
    let risks: [String]?
    let dependencies: [String]?

    enum Impact: String, Codable {
        case low
        case medium
        case high
    }

    struct FinancialImplications: Codable {
        let amount: Double
        let currency: String
        let description: String?
    }

    struct TimeConstraints: Codable {
        let mustDecideBy: Date?
        let affectsDeadline: Date?
    }
}

struct DecisionOption: Codable, Identifiable {
    let id: String
    let option: String
    let pros: [String]
    let cons: [String]
    let estimatedImpact: String
    let feasibility: Double
    let cost: Double?
    let timeRequired: Int?
    let risks: [String]?
}

struct AIRecommendation: Codable {
    let recommendedOption: String
    let reasoning: String
    let confidence: Double
    let alternatives: [String]?
    let risks: [String]?
    let considerations: [String]?
    let historicalSimilarDecisions: [SimilarDecision]?
}

struct SimilarDecision: Codable, Identifiable {
    let decisionId: String
    let title: String
    let userChose: String
    let outcome: Outcome
    let similarity: Double

    var id: String { decisionId }

    enum Outcome: String, Codable {
        case positive
        case neutral
        case negative
    }
}

struct UserDecision: Codable {
    let chosenOption: String
    let reasoning: String?
    let modifications: [String: AnyCodable]?
    let followUpActions: [String]?
}
