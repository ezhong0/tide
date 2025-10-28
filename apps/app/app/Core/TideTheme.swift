import SwiftUI

/// Tide Premium Design System - Colors, Typography, Spacing, and Animations
struct TideTheme {
    // MARK: - Colors

    // Primary Colors
    static let primary = Color(hex: "0066FF")
    static let primaryLight = Color(hex: "3385FF")
    static let primaryDark = Color(hex: "0052CC")
    static let primarySubtle = Color(hex: "0066FF").opacity(0.1)

    // Secondary Colors
    static let secondary = Color(hex: "00CC88")
    static let secondaryLight = Color(hex: "33D9A3")
    static let secondaryDark = Color(hex: "00A36B")

    // Accent Colors
    static let accent = Color(hex: "7C3AED") // Purple accent
    static let accentLight = Color(hex: "A78BFA")

    // Background Colors (Dark Mode)
    static let background = Color(hex: "000000")
    static let backgroundSecondary = Color(hex: "1C1C1E")
    static let surface = Color(hex: "2C2C2E")
    static let surfaceElevated = Color(hex: "3A3A3C")

    // Status Colors
    static let error = Color(hex: "FF3B30")
    static let errorLight = Color(hex: "FF6B6B")
    static let success = Color(hex: "34C759")
    static let successLight = Color(hex: "5DD97C")
    static let warning = Color(hex: "FF9500")
    static let warningLight = Color(hex: "FFB340")
    static let info = Color(hex: "007AFF")

    // Text Colors (Dark Mode)
    static let textPrimary = Color(hex: "FFFFFF")
    static let textSecondary = Color(hex: "98989D")
    static let textTertiary = Color(hex: "636366")
    static let textInverse = Color(hex: "1C1C1E")

    // Border Colors (Dark Mode)
    static let border = Color(hex: "38383A")
    static let borderLight = Color(hex: "2C2C2E")
    static let borderDark = Color(hex: "48484A")

    // Interactive States
    static let interactive = primary
    static let interactiveHover = primaryLight
    static let interactivePressed = primaryDark
    static let interactiveDisabled = Color(hex: "C7C7CC")

    // Dark Mode Colors
    struct Dark {
        static let background = Color(hex: "000000")
        static let backgroundSecondary = Color(hex: "1C1C1E")
        static let surface = Color(hex: "2C2C2E")
        static let surfaceElevated = Color(hex: "3A3A3C")
        static let textPrimary = Color(hex: "FFFFFF")
        static let textSecondary = Color(hex: "98989D")
        static let textTertiary = Color(hex: "636366")
        static let border = Color(hex: "38383A")
    }

    // MARK: - Gradients
    struct Gradients {
        static let primary = LinearGradient(
            colors: [TideTheme.primary, TideTheme.primaryLight],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )

        static let secondary = LinearGradient(
            colors: [TideTheme.secondary, TideTheme.secondaryLight],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )

        static let accent = LinearGradient(
            colors: [TideTheme.accent, TideTheme.accentLight],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )

        static let sunset = LinearGradient(
            colors: [Color(hex: "FF6B6B"), Color(hex: "FFB340"), Color(hex: "FFD93D")],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )

        static let ocean = LinearGradient(
            colors: [Color(hex: "0066FF"), Color(hex: "00CC88")],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )

        static let purple = LinearGradient(
            colors: [Color(hex: "7C3AED"), Color(hex: "EC4899")],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )

        static let subtle = LinearGradient(
            colors: [TideTheme.background, TideTheme.backgroundSecondary],
            startPoint: .top,
            endPoint: .bottom
        )

        static let shimmer = LinearGradient(
            colors: [
                Color.white.opacity(0),
                Color.white.opacity(0.3),
                Color.white.opacity(0)
            ],
            startPoint: .leading,
            endPoint: .trailing
        )
    }

    // MARK: - Typography
    struct Typography {
        // Display
        static let display = Font.system(size: 40, weight: .bold, design: .rounded)

        // Titles
        static let largeTitle = Font.system(size: 34, weight: .bold, design: .default)
        static let title1 = Font.system(size: 28, weight: .bold, design: .default)
        static let title2 = Font.system(size: 22, weight: .bold, design: .default)
        static let title3 = Font.system(size: 20, weight: .semibold, design: .default)

        // Body
        static let headline = Font.system(size: 17, weight: .semibold, design: .default)
        static let body = Font.system(size: 17, weight: .regular, design: .default)
        static let bodyEmphasized = Font.system(size: 17, weight: .medium, design: .default)
        static let callout = Font.system(size: 16, weight: .regular, design: .default)
        static let subheadline = Font.system(size: 15, weight: .regular, design: .default)
        static let subheadlineEmphasized = Font.system(size: 15, weight: .medium, design: .default)

        // Small
        static let footnote = Font.system(size: 13, weight: .regular, design: .default)
        static let footnoteEmphasized = Font.system(size: 13, weight: .semibold, design: .default)
        static let caption1 = Font.system(size: 12, weight: .regular, design: .default)
        static let caption1Emphasized = Font.system(size: 12, weight: .medium, design: .default)
        static let caption2 = Font.system(size: 11, weight: .regular, design: .default)

        // Special
        static let monoBody = Font.system(size: 17, weight: .regular, design: .monospaced)
        static let monoCaption = Font.system(size: 13, weight: .regular, design: .monospaced)
    }

    // MARK: - Spacing
    struct Spacing {
        static let xxs: CGFloat = 2
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 16
        static let lg: CGFloat = 24
        static let xl: CGFloat = 32
        static let xxl: CGFloat = 48
        static let xxxl: CGFloat = 64
    }

    // MARK: - Corner Radius
    struct CornerRadius {
        static let xsmall: CGFloat = 6
        static let small: CGFloat = 8
        static let medium: CGFloat = 12
        static let large: CGFloat = 16
        static let xlarge: CGFloat = 24
        static let xxlarge: CGFloat = 32
        static let pill: CGFloat = 999
    }

    // MARK: - Shadows
    struct Shadow {
        static let subtle = (color: Color.black.opacity(0.04), radius: 2.0, x: 0.0, y: 1.0)
        static let small = (color: Color.black.opacity(0.08), radius: 4.0, x: 0.0, y: 2.0)
        static let medium = (color: Color.black.opacity(0.12), radius: 8.0, x: 0.0, y: 4.0)
        static let large = (color: Color.black.opacity(0.16), radius: 16.0, x: 0.0, y: 8.0)
        static let xlarge = (color: Color.black.opacity(0.2), radius: 24.0, x: 0.0, y: 12.0)

        // Colored shadows for premium feel
        static let primaryGlow = (color: TideTheme.primary.opacity(0.3), radius: 12.0, x: 0.0, y: 4.0)
        static let successGlow = (color: TideTheme.success.opacity(0.3), radius: 12.0, x: 0.0, y: 4.0)
        static let errorGlow = (color: TideTheme.error.opacity(0.3), radius: 12.0, x: 0.0, y: 4.0)
    }

    // MARK: - Animation
    struct Animation {
        static let quick = SwiftUI.Animation.spring(response: 0.3, dampingFraction: 0.7)
        static let smooth = SwiftUI.Animation.spring(response: 0.4, dampingFraction: 0.8)
        static let bouncy = SwiftUI.Animation.spring(response: 0.5, dampingFraction: 0.6)
        static let gentle = SwiftUI.Animation.easeInOut(duration: 0.3)
        static let standard = SwiftUI.Animation.easeInOut(duration: 0.25)
        static let fast = SwiftUI.Animation.easeOut(duration: 0.2)
    }

    // MARK: - Sizing
    struct Size {
        // Icons
        static let iconXSmall: CGFloat = 16
        static let iconSmall: CGFloat = 20
        static let iconMedium: CGFloat = 24
        static let iconLarge: CGFloat = 32
        static let iconXLarge: CGFloat = 40

        // Buttons
        static let buttonSmall: CGFloat = 36
        static let buttonMedium: CGFloat = 44
        static let buttonLarge: CGFloat = 52

        // Avatar
        static let avatarSmall: CGFloat = 32
        static let avatarMedium: CGFloat = 40
        static let avatarLarge: CGFloat = 56
        static let avatarXLarge: CGFloat = 80
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
    // MARK: - Cards

    /// Standard card with subtle shadow
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
            .overlay(
                RoundedRectangle(cornerRadius: TideTheme.CornerRadius.medium)
                    .stroke(TideTheme.border, lineWidth: 0.5)
            )
    }

    /// Premium card with elevated shadow and gradient border
    func tideCardPremium() -> some View {
        self
            .background(TideTheme.surface)
            .cornerRadius(TideTheme.CornerRadius.large)
            .shadow(
                color: TideTheme.Shadow.large.color,
                radius: TideTheme.Shadow.large.radius,
                x: TideTheme.Shadow.large.x,
                y: TideTheme.Shadow.large.y
            )
            .overlay(
                RoundedRectangle(cornerRadius: TideTheme.CornerRadius.large)
                    .stroke(
                        LinearGradient(
                            colors: [TideTheme.primary.opacity(0.1), TideTheme.secondary.opacity(0.1)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            )
    }

    /// Gradient card with glow effect
    func tideCardGradient(gradient: LinearGradient = TideTheme.Gradients.ocean) -> some View {
        self
            .background(gradient)
            .cornerRadius(TideTheme.CornerRadius.large)
            .shadow(
                color: TideTheme.Shadow.primaryGlow.color,
                radius: TideTheme.Shadow.primaryGlow.radius,
                x: TideTheme.Shadow.primaryGlow.x,
                y: TideTheme.Shadow.primaryGlow.y
            )
    }

    /// Subtle card with minimal shadow
    func tideCardSubtle() -> some View {
        self
            .background(TideTheme.surface)
            .cornerRadius(TideTheme.CornerRadius.medium)
            .shadow(
                color: TideTheme.Shadow.subtle.color,
                radius: TideTheme.Shadow.subtle.radius,
                x: TideTheme.Shadow.subtle.x,
                y: TideTheme.Shadow.subtle.y
            )
    }

    // MARK: - Buttons

    /// Primary button with gradient
    func tidePrimaryButton() -> some View {
        self
            .font(TideTheme.Typography.headline)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .frame(height: TideTheme.Size.buttonLarge)
            .background(TideTheme.Gradients.primary)
            .cornerRadius(TideTheme.CornerRadius.medium)
            .shadow(
                color: TideTheme.Shadow.primaryGlow.color,
                radius: TideTheme.Shadow.primaryGlow.radius,
                x: TideTheme.Shadow.primaryGlow.x,
                y: TideTheme.Shadow.primaryGlow.y
            )
    }

    /// Secondary button with subtle background
    func tideSecondaryButton() -> some View {
        self
            .font(TideTheme.Typography.headline)
            .foregroundColor(TideTheme.primary)
            .frame(maxWidth: .infinity)
            .frame(height: TideTheme.Size.buttonLarge)
            .background(TideTheme.primarySubtle)
            .cornerRadius(TideTheme.CornerRadius.medium)
            .overlay(
                RoundedRectangle(cornerRadius: TideTheme.CornerRadius.medium)
                    .stroke(TideTheme.primary.opacity(0.2), lineWidth: 1)
            )
    }

    /// Compact button for inline actions
    func tideCompactButton() -> some View {
        self
            .font(TideTheme.Typography.footnoteEmphasized)
            .foregroundColor(.white)
            .padding(.horizontal, TideTheme.Spacing.md)
            .padding(.vertical, TideTheme.Spacing.sm)
            .background(TideTheme.primary)
            .cornerRadius(TideTheme.CornerRadius.small)
    }

    /// Icon button with circular background
    func tideIconButton(size: CGFloat = TideTheme.Size.buttonMedium) -> some View {
        self
            .frame(width: size, height: size)
            .background(TideTheme.primarySubtle)
            .clipShape(Circle())
    }

    // MARK: - Interactive States

    /// Adds press animation and haptic feedback
    func tideInteractive(scale: CGFloat = 0.95) -> some View {
        self
            .scaleEffect(1.0)
            .animation(TideTheme.Animation.quick, value: UUID())
    }

    /// Adds subtle hover effect
    func tideHoverable() -> some View {
        self
            .opacity(1.0)
            .animation(TideTheme.Animation.fast, value: UUID())
    }

    // MARK: - Badges & Tags

    /// Status badge with color
    func tideBadge(color: Color, size: CGFloat = TideTheme.Size.iconSmall) -> some View {
        self
            .font(TideTheme.Typography.caption1Emphasized)
            .foregroundColor(.white)
            .padding(.horizontal, TideTheme.Spacing.sm)
            .padding(.vertical, TideTheme.Spacing.xs)
            .background(color)
            .cornerRadius(TideTheme.CornerRadius.small)
    }

    /// Priority indicator dot
    func tidePriorityIndicator(color: Color) -> some View {
        Circle()
            .fill(color)
            .frame(width: 8, height: 8)
            .overlay(
                Circle()
                    .stroke(color.opacity(0.3), lineWidth: 3)
            )
    }

    // MARK: - Input Fields

    /// Styled text field with border
    func tideTextField() -> some View {
        self
            .font(TideTheme.Typography.body)
            .padding(TideTheme.Spacing.md)
            .background(TideTheme.surface)
            .cornerRadius(TideTheme.CornerRadius.medium)
            .overlay(
                RoundedRectangle(cornerRadius: TideTheme.CornerRadius.medium)
                    .stroke(TideTheme.border, lineWidth: 1)
            )
    }

    /// Text field with focus state
    func tideTextField(isFocused: Bool) -> some View {
        self
            .font(TideTheme.Typography.body)
            .padding(TideTheme.Spacing.md)
            .background(TideTheme.surface)
            .cornerRadius(TideTheme.CornerRadius.medium)
            .overlay(
                RoundedRectangle(cornerRadius: TideTheme.CornerRadius.medium)
                    .stroke(isFocused ? TideTheme.primary : TideTheme.border, lineWidth: isFocused ? 2 : 1)
            )
            .shadow(
                color: isFocused ? TideTheme.Shadow.primaryGlow.color : .clear,
                radius: isFocused ? TideTheme.Shadow.primaryGlow.radius : 0,
                x: 0,
                y: 0
            )
            .animation(TideTheme.Animation.quick, value: isFocused)
    }

    // MARK: - Lists & Dividers

    /// List row with subtle background
    func tideListRow() -> some View {
        self
            .listRowBackground(TideTheme.surface)
            .listRowSeparator(.hidden)
    }

    /// Section header styling
    func tideSectionHeader() -> some View {
        self
            .font(TideTheme.Typography.caption1Emphasized)
            .foregroundColor(TideTheme.textSecondary)
            .textCase(.uppercase)
            .tracking(0.5)
    }

    /// Custom divider with color
    func tideDivider() -> some View {
        Rectangle()
            .fill(TideTheme.border)
            .frame(height: 0.5)
    }

    // MARK: - Loading States

    /// Skeleton loading effect
    func tideSkeleton() -> some View {
        self
            .redacted(reason: .placeholder)
            .shimmering()
    }

    // MARK: - Utility

    /// Adds haptic feedback on tap
    func withHaptic(style: UIImpactFeedbackGenerator.FeedbackStyle = .light) -> some View {
        self.onTapGesture {
            let generator = UIImpactFeedbackGenerator(style: style)
            generator.impactOccurred()
        }
    }
}

// MARK: - Shimmer Effect
extension View {
    func shimmering() -> some View {
        self.modifier(ShimmerModifier())
    }
}

struct ShimmerModifier: ViewModifier {
    @State private var phase: CGFloat = 0

    func body(content: Content) -> some View {
        content
            .overlay(
                TideTheme.Gradients.shimmer
                    .rotationEffect(.degrees(70))
                    .offset(x: phase)
                    .mask(content)
            )
            .onAppear {
                withAnimation(
                    .linear(duration: 1.5)
                    .repeatForever(autoreverses: false)
                ) {
                    phase = 400
                }
            }
    }
}
