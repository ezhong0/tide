/**
 * Colors
 * Complete color system for Tide
 */

import SwiftUI

#if canImport(UIKit)
import UIKit
#endif

// MARK: - Design Colors
extension Design {
    enum Colors {
        // Primary colors
        static let primary = Color.blue
        static let secondary = Color.purple
        static let accent = Color.green

        // Surface colors
        static let surface = Color(UIColor.secondarySystemBackground)
        static let background = Color(UIColor.systemBackground)

        // Text colors
        static let primaryText = Color(UIColor.label)
        static let secondaryText = Color(UIColor.secondaryLabel)
        static let tertiaryText = Color(UIColor.tertiaryLabel)

        // System grays
        static let systemGray5 = Color(UIColor.systemGray5)
        static let systemGray6 = Color(UIColor.systemGray6)
        static let systemGray4 = Color(UIColor.systemGray4)
        static let systemGray3 = Color(UIColor.systemGray3)
        static let systemGray2 = Color(UIColor.systemGray2)
        static let systemGray = Color(UIColor.systemGray)

        // Semantic colors
        static let success = Color.green
        static let warning = Color.orange
        static let error = Color.red
        static let info = Color.blue

        // Priority colors
        static let priorityCritical = Color.purple
        static let priorityHigh = Color.red
        static let priorityMedium = Color.orange
        static let priorityLow = Color.green

        // Status colors
        static let statusTodo = Color.gray
        static let statusInProgress = Color.blue
        static let statusDone = Color.green

        // Nested namespaces for backward compatibility
        enum Text {
            static let primary = Color.tidePrimaryText
            static let secondary = Color.tideSecondaryText
            static let tertiary = Color.tideTertiaryText
        }

        enum Semantic {
            static let success = Color.tideSuccess
            static let warning = Color.tideWarning
            static let error = Color.tideError
            static let info = Color.tideInfo
        }
    }
}

// MARK: - Color Convenience Extensions
extension Color {
    // Tide brand colors
    static var tidePrimary: Color { Design.Colors.primary }
    static var tideSecondary: Color { Design.Colors.secondary }
    static var tideAccent: Color { Design.Colors.accent }

    // Surface
    static var tideSurface: Color { Design.Colors.surface }
    static var tideBackground: Color { Design.Colors.background }

    // Text
    static var tidePrimaryText: Color { Design.Colors.primaryText }
    static var tideSecondaryText: Color { Design.Colors.secondaryText }
    static var tideTertiaryText: Color { Design.Colors.tertiaryText }

    // System grays
    static var tideSystemGray5: Color { Design.Colors.systemGray5 }
    static var tideSystemGray6: Color { Design.Colors.systemGray6 }
    static var tideSystemGray4: Color { Design.Colors.systemGray4 }
    static var tideSystemGray3: Color { Design.Colors.systemGray3 }
    static var tideSystemGray2: Color { Design.Colors.systemGray2 }
    static var tideSystemGray: Color { Design.Colors.systemGray }

    // Semantic
    static var tideSuccess: Color { Design.Colors.success }
    static var tideWarning: Color { Design.Colors.warning }
    static var tideError: Color { Design.Colors.error }
    static var tideInfo: Color { Design.Colors.info }

    // Priority
    static var priorityCritical: Color { Design.Colors.priorityCritical }
    static var priorityHigh: Color { Design.Colors.priorityHigh }
    static var priorityMedium: Color { Design.Colors.priorityMedium }
    static var priorityLow: Color { Design.Colors.priorityLow }

    // Status
    static var statusTodo: Color { Design.Colors.statusTodo }
    static var statusInProgress: Color { Design.Colors.statusInProgress }
    static var statusDone: Color { Design.Colors.statusDone }

    // Helper Methods
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
