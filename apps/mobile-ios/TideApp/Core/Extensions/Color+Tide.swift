/**
 * Color Extensions
 * Custom colors for Tide app
 */

import SwiftUI

#if canImport(UIKit)
import UIKit
#endif

extension Color {
    // MARK: - Primary Brand Colors
    static let tidePrimary = Color.blue
    static let tideSecondary = Color.purple

    // MARK: - Surface Colors
    #if canImport(UIKit)
    static let tideSurface = Color(uiColor: .secondarySystemBackground)
    static let tideBackground = Color(uiColor: .systemBackground)
    #else
    static let tideSurface = Color(NSColor.controlBackgroundColor)
    static let tideBackground = Color(NSColor.windowBackgroundColor)
    #endif

    // MARK: - Semantic Colors
    static let tideSuccess = Color.green
    static let tideWarning = Color.orange
    static let tideError = Color.red
    static let tideInfo = Color.blue

    // MARK: - Text Colors
    static let tidePrimaryText = Color.primary
    static let tideSecondaryText = Color.secondary
    #if canImport(UIKit)
    static let tideTertiaryText = Color(uiColor: .tertiaryLabel)
    #else
    static let tideTertiaryText = Color(NSColor.tertiaryLabelColor)
    #endif

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
