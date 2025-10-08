/**
 * Color Extensions
 * Custom colors for Tide app
 */

import SwiftUI

extension Color {
    // MARK: - Primary Brand Colors
    static let tidePrimary = Color.blue
    static let tideSecondary = Color.purple

    // MARK: - Surface Colors
    static let tideSurface = Color(.secondarySystemBackground)
    static let tideBackground = Color(.systemBackground)

    // MARK: - Semantic Colors
    static let tideSuccess = Color.green
    static let tideWarning = Color.orange
    static let tideError = Color.red
    static let tideInfo = Color.blue

    // MARK: - Text Colors
    static let tidePrimaryText = Color.primary
    static let tideSecondaryText = Color.secondary
    static let tideTertiaryText = Color(.tertiaryLabel)

    // MARK: - Priority Colors
    static let priorityCritical = Color.purple
    static let priorityHigh = Color.red
    static let priorityMedium = Color.orange
    static let priorityLow = Color.green

    // MARK: - Status Colors
    static let statusTodo = Color.gray
    static let statusInProgress = Color.blue
    static let statusDone = Color.green

    // MARK: - Helper Methods
    static func priorityColor(for priority: String) -> Color {
        switch priority.lowercased() {
        case "critical":
            return .priorityCritical
        case "high":
            return .priorityHigh
        case "medium":
            return .priorityMedium
        case "low":
            return .priorityLow
        default:
            return .gray
        }
    }
}
