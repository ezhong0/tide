import SwiftUI

/// Tide Design System - Colors, Typography, and Spacing
struct TideTheme {
    // MARK: - Colors
    static let primary = Color(hex: "0066FF")
    static let secondary = Color(hex: "00CC88")
    static let background = Color(hex: "FAFBFC")
    static let surface = Color.white
    static let error = Color(hex: "FF3B30")
    static let success = Color(hex: "34C759")
    static let warning = Color(hex: "FF9500")

    // Text colors
    static let textPrimary = Color(hex: "1C1C1E")
    static let textSecondary = Color(hex: "8E8E93")
    static let textTertiary = Color(hex: "C7C7CC")

    // MARK: - Typography
    struct Typography {
        static let largeTitle = Font.system(size: 34, weight: .bold)
        static let title1 = Font.system(size: 28, weight: .bold)
        static let title2 = Font.system(size: 22, weight: .bold)
        static let title3 = Font.system(size: 20, weight: .semibold)
        static let headline = Font.system(size: 17, weight: .semibold)
        static let body = Font.system(size: 17, weight: .regular)
        static let callout = Font.system(size: 16, weight: .regular)
        static let subheadline = Font.system(size: 15, weight: .regular)
        static let footnote = Font.system(size: 13, weight: .regular)
        static let caption1 = Font.system(size: 12, weight: .regular)
        static let caption2 = Font.system(size: 11, weight: .regular)
    }

    // MARK: - Spacing
    struct Spacing {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 16
        static let lg: CGFloat = 24
        static let xl: CGFloat = 32
        static let xxl: CGFloat = 48
    }

    // MARK: - Corner Radius
    struct CornerRadius {
        static let small: CGFloat = 8
        static let medium: CGFloat = 12
        static let large: CGFloat = 16
        static let xlarge: CGFloat = 24
    }

    // MARK: - Shadows
    struct Shadow {
        static let small = (color: Color.black.opacity(0.1), radius: 4.0, x: 0.0, y: 2.0)
        static let medium = (color: Color.black.opacity(0.15), radius: 8.0, x: 0.0, y: 4.0)
        static let large = (color: Color.black.opacity(0.2), radius: 16.0, x: 0.0, y: 8.0)
    }
}

// MARK: - Color Extension (Hex Support)
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - View Extensions
extension View {
    func tideCard() -> some View {
        self
            .background(TideTheme.surface)
            .cornerRadius(TideTheme.CornerRadius.medium)
            .shadow(
                color: TideTheme.Shadow.medium.color,
                radius: TideTheme.Shadow.medium.radius,
                x: TideTheme.Shadow.medium.x,
                y: TideTheme.Shadow.medium.y
            )
    }

    func tidePrimaryButton() -> some View {
        self
            .font(TideTheme.Typography.headline)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .background(TideTheme.primary)
            .cornerRadius(TideTheme.CornerRadius.medium)
    }

    func tideSecondaryButton() -> some View {
        self
            .font(TideTheme.Typography.headline)
            .foregroundColor(TideTheme.primary)
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .background(TideTheme.primary.opacity(0.1))
            .cornerRadius(TideTheme.CornerRadius.medium)
    }
}
