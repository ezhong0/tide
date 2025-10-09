/**
 * Design System Extensions
 * Unified design tokens for consistent UI across the app
 */

import SwiftUI

#if canImport(UIKit)
import UIKit
#endif

// MARK: - Design System

enum Design {
    // MARK: - Spacing

    enum Spacing {
        /// 2pt - Extra extra small
        static let xxs: CGFloat = 2

        /// 4pt - Extra small
        static let xs: CGFloat = 4

        /// 8pt - Small
        static let sm: CGFloat = 8

        /// 16pt - Medium (default)
        static let md: CGFloat = 16

        /// 24pt - Large
        static let lg: CGFloat = 24

        /// 32pt - Extra large
        static let xl: CGFloat = 32

        /// 48pt - Extra extra large
        static let xxl: CGFloat = 48
    }

    // MARK: - Typography

    enum Typography {
        // Display styles
        enum Display {
            static let large = Font.system(size: 34, weight: .bold)
            static let medium = Font.system(size: 28, weight: .bold)
            static let regular = Font.system(size: 22, weight: .bold)
        }

        // Headline styles
        enum Headline {
            static let bold = Font.system(size: 17, weight: .bold)
            static let semibold = Font.system(size: 17, weight: .semibold)
            static let regular = Font.system(size: 17, weight: .regular)
        }

        // Title styles
        enum Title {
            static let bold = Font.system(size: 20, weight: .bold)
            static let semibold = Font.system(size: 20, weight: .semibold)
            static let regular = Font.system(size: 20, weight: .regular)
        }

        // Body styles
        enum Body {
            static let bold = Font.system(size: 15, weight: .bold)
            static let semibold = Font.system(size: 15, weight: .semibold)
            static let medium = Font.system(size: 15, weight: .medium)
            static let regular = Font.system(size: 15, weight: .regular)
        }

        // Label styles
        enum Label {
            static let bold = Font.system(size: 13, weight: .bold)
            static let semibold = Font.system(size: 13, weight: .semibold)
            static let medium = Font.system(size: 13, weight: .medium)
            static let regular = Font.system(size: 13, weight: .regular)
        }

        // Caption styles
        enum Caption {
            static let bold = Font.system(size: 12, weight: .bold)
            static let semibold = Font.system(size: 12, weight: .semibold)
            static let medium = Font.system(size: 12, weight: .medium)
            static let regular = Font.system(size: 12, weight: .regular)
        }
    }

    // MARK: - Colors

    enum Colors {
        // Semantic colors
        enum Semantic {
            static let primary = Color.tidePrimary
            static let secondary = Color.tideSecondary
            static let success = Color.tideSuccess
            static let warning = Color.tideWarning
            static let error = Color.tideError
            static let info = Color.tideInfo
        }

        // Background colors
        enum Background {
            static let primary = Color.tideBackground
            static let secondary = Color.tideSurface
            #if canImport(UIKit)
            static let tertiary = Color(uiColor: .tertiarySystemBackground)
            #else
            static let tertiary = Color(NSColor.controlBackgroundColor)
            #endif
        }

        // Text colors
        enum Text {
            static let primary = Color.tidePrimaryText
            static let secondary = Color.tideSecondaryText
            static let tertiary = Color.tideTertiaryText
        }

        // Border colors
        enum Border {
            #if canImport(UIKit)
            static let light = Color(uiColor: .separator)
            static let medium = Color(uiColor: .opaqueSeparator)
            static let dark = Color(uiColor: .tertiaryLabel)
            #else
            static let light = Color(NSColor.separatorColor)
            static let medium = Color(NSColor.separatorColor)
            static let dark = Color(NSColor.tertiaryLabelColor)
            #endif
        }

        // Legacy accessors for backwards compatibility
        static let primary = Semantic.primary
        static let error = Semantic.error
        static let background = Background.primary
        static let backgroundSecondary = Background.secondary
    }

    // MARK: - Corner Radius

    enum CornerRadius {
        /// 4pt - Small radius
        static let sm: CGFloat = 4

        /// 8pt - Medium radius (default)
        static let md: CGFloat = 8

        /// 12pt - Large radius
        static let lg: CGFloat = 12

        /// 16pt - Extra large radius
        static let xl: CGFloat = 16

        /// 24pt - Extra extra large radius
        static let xxl: CGFloat = 24
    }

    // MARK: - Shadows

    enum Shadow {
        static let sm = (color: Color.black.opacity(0.05), radius: CGFloat(2), x: CGFloat(0), y: CGFloat(1))
        static let md = (color: Color.black.opacity(0.1), radius: CGFloat(4), x: CGFloat(0), y: CGFloat(2))
        static let lg = (color: Color.black.opacity(0.15), radius: CGFloat(8), x: CGFloat(0), y: CGFloat(4))
        static let xl = (color: Color.black.opacity(0.2), radius: CGFloat(16), x: CGFloat(0), y: CGFloat(8))
    }

    // MARK: - Animation

    enum Animation {
        static let quick = SwiftUI.Animation.easeInOut(duration: 0.2)
        static let standard = SwiftUI.Animation.easeInOut(duration: 0.3)
        static let slow = SwiftUI.Animation.easeInOut(duration: 0.5)
        static let spring = SwiftUI.Animation.spring(response: 0.3, dampingFraction: 0.7)
    }

    // MARK: - Transitions

    enum Transition {
        static let fade = AnyTransition.opacity
        static let slide = AnyTransition.slide
        static let scale = AnyTransition.scale
        static let fadeAndSlide = AnyTransition.opacity.combined(with: .move(edge: .bottom))
    }
}

// MARK: - View Extensions

extension View {
    /// Apply standard card styling
    func tideCard(elevation: CardElevation = .medium) -> some View {
        self
            .background(Color.tideBackground)
            .cornerRadius(Design.CornerRadius.lg)
            .shadow(
                color: elevation.shadow.color,
                radius: elevation.shadow.radius,
                x: elevation.shadow.x,
                y: elevation.shadow.y
            )
    }

    /// Apply section styling
    func tideSection() -> some View {
        self
            .padding(Design.Spacing.md)
            .background(Color.tideSurface)
            .cornerRadius(Design.CornerRadius.md)
    }
}

// MARK: - Card Elevation

enum CardElevation {
    case low, medium, high

    var shadow: (color: Color, radius: CGFloat, x: CGFloat, y: CGFloat) {
        switch self {
        case .low: return Design.Shadow.sm
        case .medium: return Design.Shadow.md
        case .high: return Design.Shadow.lg
        }
    }
}
