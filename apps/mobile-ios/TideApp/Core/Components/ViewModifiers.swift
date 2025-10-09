/**
 * View Modifiers
 * Elegant, reusable view modifiers for common patterns
 */

import SwiftUI

// MARK: - Loading Overlay Modifier

struct LoadingOverlayModifier: ViewModifier {
    let isLoading: Bool
    let message: String?

    func body(content: Content) -> some View {
        ZStack {
            content
                .disabled(isLoading)
                .blur(radius: isLoading ? 2 : 0)

            if isLoading {
                LoadingView(message: message)
            }
        }
        .animation(Design.Animation.standard, value: isLoading)
    }
}

// MARK: - Error Overlay Modifier

struct ErrorOverlayModifier: ViewModifier {
    let error: Error?
    let retryAction: (() -> Void)?

    func body(content: Content) -> some View {
        ZStack {
            content

            if let error = error {
                ErrorView(error: error, retryAction: retryAction)
            }
        }
        .animation(Design.Animation.standard, value: error != nil)
    }
}

// MARK: - State Content Modifier

/// Handles loading, error, and empty states elegantly
struct StateContentModifier<EmptyContent: View>: ViewModifier {
    let isLoading: Bool
    let error: Error?
    let isEmpty: Bool
    let retryAction: (() -> Void)?
    let emptyContent: () -> EmptyContent

    func body(content: Content) -> some View {
        Group {
            if isLoading {
                LoadingView()
            } else if let error = error {
                ErrorView(error: error, retryAction: retryAction)
            } else if isEmpty {
                emptyContent()
            } else {
                content
            }
        }
        .animation(Design.Animation.standard, value: isLoading)
        .animation(Design.Animation.standard, value: error != nil)
        .animation(Design.Animation.standard, value: isEmpty)
    }
}

// MARK: - Button Style Modifiers

struct PrimaryButtonStyle: ButtonStyle {
    let isLoading: Bool

    init(isLoading: Bool = false) {
        self.isLoading = isLoading
    }

    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: Design.Spacing.xs) {
            if isLoading {
                ProgressView()
                    .scaleEffect(0.8)
                    .tint(.white)
            }
            configuration.label
        }
        .font(Design.Typography.labelLarge)
        .foregroundColor(.white)
        .frame(maxWidth: .infinity)
        .padding(.vertical, Design.Spacing.md)
        .background(
            configuration.isPressed
                ? Design.Colors.primary.opacity(0.8)
                : Design.Colors.primary
        )
        .cornerRadius(Design.CornerRadius.md)
        .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
        .animation(Design.Animation.quick, value: configuration.isPressed)
        .disabled(isLoading)
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(Design.Typography.labelLarge)
            .foregroundColor(Design.Colors.primary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, Design.Spacing.md)
            .background(Design.ColorHelpers.Background.secondary)
            .cornerRadius(Design.CornerRadius.md)
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(Design.Animation.quick, value: configuration.isPressed)
    }
}

struct DestructiveButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(Design.Typography.labelLarge)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, Design.Spacing.md)
            .background(
                configuration.isPressed
                    ? Design.Colors.error.opacity(0.8)
                    : Design.Colors.error
            )
            .cornerRadius(Design.CornerRadius.md)
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(Design.Animation.quick, value: configuration.isPressed)
    }
}

// MARK: - Card Modifier

struct CardModifier: ViewModifier {
    let elevation: CardElevation

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

    func body(content: Content) -> some View {
        content
            .background(Design.Colors.background)
            .cornerRadius(Design.CornerRadius.lg)
            .shadow(
                color: elevation.shadow.color,
                radius: elevation.shadow.radius,
                x: elevation.shadow.x,
                y: elevation.shadow.y
            )
    }
}

// MARK: - Animated Appearance Modifier

struct AnimatedAppearanceModifier: ViewModifier {
    @State private var isVisible = false

    func body(content: Content) -> some View {
        content
            .opacity(isVisible ? 1 : 0)
            .offset(y: isVisible ? 0 : 20)
            .onAppear {
                withAnimation(Design.Animation.spring) {
                    isVisible = true
                }
            }
    }
}

// MARK: - View Extensions

extension View {
    /// Show loading overlay
    func loadingOverlay(isLoading: Bool, message: String? = nil) -> some View {
        modifier(LoadingOverlayModifier(isLoading: isLoading, message: message))
    }

    /// Show error overlay
    func errorOverlay(error: Error?, retryAction: (() -> Void)? = nil) -> some View {
        modifier(ErrorOverlayModifier(error: error, retryAction: retryAction))
    }

    /// Handle loading, error, and empty states
    func stateContent<EmptyContent: View>(
        isLoading: Bool,
        error: Error?,
        isEmpty: Bool,
        retryAction: (() -> Void)? = nil,
        @ViewBuilder emptyContent: @escaping () -> EmptyContent
    ) -> some View {
        modifier(StateContentModifier(
            isLoading: isLoading,
            error: error,
            isEmpty: isEmpty,
            retryAction: retryAction,
            emptyContent: emptyContent
        ))
    }

    /// Apply card styling with elevation
    func card(elevation: CardModifier.CardElevation = .medium) -> some View {
        modifier(CardModifier(elevation: elevation))
    }

    /// Animate appearance
    func animatedAppearance() -> some View {
        modifier(AnimatedAppearanceModifier())
    }
}

// MARK: - Previews

#Preview("Primary Button") {
    VStack(spacing: 16) {
        Button("Save") {}
            .buttonStyle(PrimaryButtonStyle())

        Button("Loading") {}
            .buttonStyle(PrimaryButtonStyle(isLoading: true))
    }
    .padding()
}

#Preview("Secondary Button") {
    Button("Cancel") {}
        .buttonStyle(SecondaryButtonStyle())
        .padding()
}

#Preview("Destructive Button") {
    Button("Delete") {}
        .buttonStyle(DestructiveButtonStyle())
        .padding()
}

#Preview("Card") {
    VStack {
        Text("Card Content")
            .padding()
    }
    .card(elevation: .medium)
    .padding()
}

// MARK: - Platform Compatibility Extensions

#if os(iOS)
import UIKit
#endif

extension View {
    /// Platform-compatible navigation bar title display mode
    /// On iOS: Sets the display mode, on macOS: No-op
    @ViewBuilder
    func navigationBarTitleDisplayModeCompat(_ displayMode: NavigationBarItem.TitleDisplayMode) -> some View {
        #if os(iOS)
        self.navigationBarTitleDisplayMode(displayMode)
        #else
        self
        #endif
    }

    /// Platform-compatible keyboard type
    /// On iOS: Sets keyboard type, on macOS: No-op
    @ViewBuilder
    func keyboardTypeCompat(_ keyboardType: UIKeyboardType) -> some View {
        #if os(iOS)
        self.keyboardType(keyboardType)
        #else
        self
        #endif
    }

    /// Platform-compatible text content type
    /// On iOS: Sets text content type for autofill, on macOS: No-op
    @ViewBuilder
    func textContentTypeCompat(_ textContentType: UITextContentType?) -> some View {
        #if os(iOS)
        self.textContentType(textContentType)
        #else
        self
        #endif
    }

    /// Platform-compatible autocapitalization
    /// On iOS: Sets autocapitalization, on macOS: No-op
    @ViewBuilder
    func autocapitalizationCompat(_ style: TextInputAutocapitalization) -> some View {
        #if os(iOS)
        self.autocapitalization(style)
        #else
        self
        #endif
    }

    /// Platform-compatible text case
    /// On iOS: Sets text case, on macOS: No-op
    @ViewBuilder
    func textCaseCompat(_ textCase: Text.Case?) -> some View {
        #if os(iOS)
        self.textCase(textCase)
        #else
        self
        #endif
    }
}
