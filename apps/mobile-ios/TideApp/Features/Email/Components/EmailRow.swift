/**
 * Email Row Component
 * Displays a single email in the inbox list
 */

import SwiftUI

struct EmailRow: View {
    let email: EmailMessage

    var body: some View {
        VStack(alignment: .leading, spacing: Design.Spacing.xs) {
            // Header
            HStack {
                Text(email.fromName ?? email.from)
                    .font(email.isRead ? Design.Typography.Body.regular : Design.Typography.Body.medium)
                    .foregroundColor(Design.Colors.Text.primary)
                    .lineLimit(1)

                Spacer()

                if email.isVIP {
                    Image(systemName: "star.fill")
                        .font(Design.Typography.Caption.regular)
                        .foregroundColor(.yellow)
                        .accessibilityLabel("VIP sender")
                }

                Text(email.timeAgo)
                    .font(Design.Typography.Caption.regular)
                    .foregroundColor(Design.Colors.Text.secondary)
            }

            // Subject
            Text(email.subject)
                .font(email.isRead ? Design.Typography.Body.regular : Design.Typography.Body.medium)
                .foregroundColor(Design.Colors.Text.primary)
                .lineLimit(1)

            // Preview
            Text(email.bodyPreview)
                .font(Design.Typography.Body.regular)
                .foregroundColor(Design.Colors.Text.secondary)
                .lineLimit(2)

            // Metadata
            HStack(spacing: Design.Spacing.sm) {
                if let category = email.aiCategory {
                    CategoryBadge(category: category)
                }

                if let priority = email.aiPriority, priority >= 7 {
                    PriorityBadge(priority: priority)
                }

                if email.hasAttachments {
                    Label("", systemImage: "paperclip")
                        .font(Design.Typography.Caption.regular)
                        .foregroundColor(Design.Colors.Text.secondary)
                        .accessibilityLabel("Has attachments")
                }

                Spacer()

                if !email.isRead {
                    Circle()
                        .fill(Design.Colors.Semantic.primary)
                        .frame(width: 8, height: 8)
                        .accessibilityLabel("Unread indicator")
                        .accessibilityHidden(true)
                }
            }
        }
        .padding(.vertical, Design.Spacing.xxs)
    }
}
