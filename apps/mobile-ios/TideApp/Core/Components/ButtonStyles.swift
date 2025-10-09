/**
 * Button Styles
 * Consistent button styles across the app
 */

import SwiftUI

// MARK: - Primary Button Style

struct TidePrimaryButtonStyle: ButtonStyle {
    let isLoading: Bool

    init(isLoading: Bool = false) {
        self.isLoading = isLoading
    }

    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: Design.Spacing.sm) {
            if isLoading {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    .scaleEffect(0.8)
            }

            configuration.label
        }
        .font(.tideLabelMedium)
        .fontWeight(.semibold)
        .foregroundColor(.white)
        .padding(.horizontal, Design.Spacing.lg)
        .padding(.vertical, Design.Spacing.md)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(configuration.isPressed ? Color.tidePrimary.opacity(0.8) : Color.tidePrimary)
        )
        .opacity(isLoading ? 0.6 : 1.0)
        .disabled(isLoading)
    }
}

// MARK: - Secondary Button Style

struct TideSecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.tideLabelMedium)
            .fontWeight(.semibold)
            .foregroundColor(.tidePrimary)
            .padding(.horizontal, Design.Spacing.lg)
            .padding(.vertical, Design.Spacing.md)
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.tidePrimary, lineWidth: 2)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(configuration.isPressed ? Color.tidePrimary.opacity(0.1) : Color.clear)
                    )
            )
    }
}

// MARK: - Destructive Button Style

struct TideDestructiveButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.tideLabelMedium)
            .fontWeight(.semibold)
            .foregroundColor(.white)
            .padding(.horizontal, Design.Spacing.lg)
            .padding(.vertical, Design.Spacing.md)
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(configuration.isPressed ? Color.tideError.opacity(0.8) : Color.tideError)
            )
    }
}

// MARK: - Compact Button Style

struct TideCompactButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.tideLabelSmall)
            .fontWeight(.medium)
            .foregroundColor(.tidePrimary)
            .padding(.horizontal, Design.Spacing.md)
            .padding(.vertical, Design.Spacing.sm)
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .fill(configuration.isPressed ? Color.tidePrimary.opacity(0.1) : Color.tideSurface)
            )
    }
}

// MARK: - View Extensions

extension View {
    func tidePrimaryButton(isLoading: Bool = false) -> some View {
        self.buttonStyle(TidePrimaryButtonStyle(isLoading: isLoading))
    }

    func tideSecondaryButton() -> some View {
        self.buttonStyle(TideSecondaryButtonStyle())
    }

    func tideDestructiveButton() -> some View {
        self.buttonStyle(TideDestructiveButtonStyle())
    }

    func tideCompactButton() -> some View {
        self.buttonStyle(TideCompactButtonStyle())
    }
}

// MARK: - Previews

struct ButtonStyles_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: Design.Spacing.lg) {
            Button("Primary Button") {}
                .tidePrimaryButton()

            Button("Primary Loading") {}
                .tidePrimaryButton(isLoading: true)

            Button("Secondary Button") {}
                .tideSecondaryButton()

            Button("Destructive Button") {}
                .tideDestructiveButton()

            Button("Compact Button") {}
                .tideCompactButton()
        }
        .padding(Design.Spacing.lg)
    }
}
