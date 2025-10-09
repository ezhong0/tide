/**
 * Empty State View
 * Reusable empty state with icon, message, and optional action
 */

import SwiftUI

struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    let actionTitle: String?
    let action: (() -> Void)?

    init(
        icon: String,
        title: String,
        message: String,
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
                .foregroundColor(.tideSecondaryText)

            VStack(spacing: Design.Spacing.sm) {
                Text(title)
                    .font(.tideHeadlineLarge)
                    .foregroundColor(.tidePrimaryText)

                Text(message)
                    .font(.tideBodyMedium)
                    .foregroundColor(.tideSecondaryText)
                    .multilineTextAlignment(.center)
            }

            if let actionTitle = actionTitle, let action = action {
                Button(action: action) {
                    Text(actionTitle)
                        .font(.tideLabelMedium)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .padding(.horizontal, Design.Spacing.lg)
                        .padding(.vertical, Design.Spacing.md)
                        .background(Color.tidePrimary)
                        .cornerRadius(12)
                }
            }
        }
        .padding(Design.Spacing.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Common Empty States

extension EmptyStateView {
    static var noEmails: EmptyStateView {
        EmptyStateView(
            icon: "tray",
            title: "No Emails",
            message: "Your inbox is empty. New emails will appear here."
        )
    }

    static var noEvents: EmptyStateView {
        EmptyStateView(
            icon: "calendar",
            title: "No Events",
            message: "You have no events scheduled for this period."
        )
    }

    static var noTasks: EmptyStateView {
        EmptyStateView(
            icon: "checklist",
            title: "No Tasks",
            message: "You're all caught up! No tasks to display."
        )
    }

    static var noMessages: EmptyStateView {
        EmptyStateView(
            icon: "message",
            title: "No Messages",
            message: "Start a conversation to see your chat history here."
        )
    }

    static var noResults: EmptyStateView {
        EmptyStateView(
            icon: "magnifyingglass",
            title: "No Results",
            message: "Try adjusting your search or filters."
        )
    }
}

// MARK: - Previews

struct EmptyStateView_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            EmptyStateView.noEmails
                .previewDisplayName("No Emails")

            EmptyStateView(
                icon: "plus.circle",
                title: "Get Started",
                message: "Create your first item to begin.",
                actionTitle: "Create Item",
                action: { print("Action tapped") }
            )
            .previewDisplayName("With Action")
        }
    }
}
