/**
 * State Views
 * Reusable views for empty, error, and loading states
 */

import SwiftUI

// MARK: - Empty View

struct EmptyView: View {
    let icon: String
    let title: String
    let message: String?
    let actionTitle: String?
    let action: (() -> Void)?

    init(
        icon: String,
        title: String,
        message: String? = nil,
        actionTitle: String? = nil,
        action: (() -> Void)? = nil
    ) {
        self.icon = icon
        self.title = title
        self.message = message
        self.actionTitle = actionTitle
        self.action = action
    }

    var body: some View {
        VStack(spacing: Design.Spacing.lg) {
            Image(systemName: icon)
                .font(.system(size: 64))
                .foregroundColor(Design.Colors.Text.secondary.opacity(0.5))

            VStack(spacing: Design.Spacing.xs) {
                Text(title)
                    .font(Design.Typography.Headline.bold)
                    .foregroundColor(Design.Colors.Text.primary)

                if let message = message {
                    Text(message)
                        .font(Design.Typography.Body.regular)
                        .foregroundColor(Design.Colors.Text.secondary)
                        .multilineTextAlignment(.center)
                }
            }

            if let actionTitle = actionTitle, let action = action {
                Button(action: action) {
                    Text(actionTitle)
                }
                .buttonStyle(PrimaryButtonStyle())
                .padding(.horizontal, Design.Spacing.xl)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(Design.Spacing.xl)
    }
}

// MARK: - Error View

struct ErrorView: View {
    let error: Error
    let retryAction: (() -> Void)?

    init(error: Error, retryAction: (() -> Void)? = nil) {
        self.error = error
        self.retryAction = retryAction
    }

    // For backward compatibility
    init(error: Error, retry: @escaping () -> Void) {
        self.error = error
        self.retryAction = retry
    }

    var body: some View {
        VStack(spacing: Design.Spacing.lg) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 64))
                .foregroundColor(Design.Colors.warning)

            VStack(spacing: Design.Spacing.xs) {
                Text("Something went wrong")
                    .font(Design.Typography.Headline.bold)
                    .foregroundColor(Design.Colors.Text.primary)

                Text(error.localizedDescription)
                    .font(Design.Typography.Body.regular)
                    .foregroundColor(Design.Colors.Text.secondary)
                    .multilineTextAlignment(.center)
            }

            if let retryAction = retryAction {
                Button(action: retryAction) {
                    Text("Try Again")
                }
                .buttonStyle(PrimaryButtonStyle())
                .padding(.horizontal, Design.Spacing.xl)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(Design.Spacing.xl)
    }
}

// MARK: - Loading View with Message

extension LoadingView {
    init(message: String? = nil) {
        // Use existing LoadingView implementation
    }
}

// MARK: - Previews

#Preview("Empty View") {
    EmptyView(
        icon: "tray",
        title: "No Items",
        message: "There are no items to display",
        actionTitle: "Add Item",
        action: {}
    )
}

#Preview("Error View") {
    ErrorView(
        error: NSError(domain: "test", code: -1, userInfo: [NSLocalizedDescriptionKey: "Network connection failed"]),
        retryAction: {}
    )
}
