/**
 * Compose Original Message Section Component
 * Displays original email in reply/forward context
 */

import SwiftUI

struct ComposeOriginalMessageSection: View {
    let email: EmailDetail
    let mode: ComposeMode

    var body: some View {
        VStack(alignment: .leading, spacing: Design.Spacing.sm) {
            Divider()

            Text(originalMessageHeader)
                .font(Design.Typography.Caption.regular)
                .foregroundColor(Design.Colors.Text.secondary)
                .padding(.horizontal, Design.Spacing.md)
                .padding(.top, Design.Spacing.sm)

            VStack(alignment: .leading, spacing: Design.Spacing.xxs) {
                Text("From: \(email.fromName ?? email.from)")
                    .font(Design.Typography.Caption.regular)
                    .foregroundColor(Design.Colors.Text.secondary)

                Text("Date: \(email.receivedAt, style: .date)")
                    .font(Design.Typography.Caption.regular)
                    .foregroundColor(Design.Colors.Text.secondary)

                Text("Subject: \(email.subject)")
                    .font(Design.Typography.Caption.regular)
                    .foregroundColor(Design.Colors.Text.secondary)

                Text("To: \(email.to.joined(separator: ", "))")
                    .font(Design.Typography.Caption.regular)
                    .foregroundColor(Design.Colors.Text.secondary)
            }
            .padding(Design.Spacing.md)
            .background(Design.ColorHelpers.Background.secondary)
            .cornerRadius(Design.CornerRadius.md)
            .padding(.horizontal, Design.Spacing.md)

            Text(email.body)
                .font(Design.Typography.Body.regular)
                .foregroundColor(Design.Colors.Text.secondary)
                .padding(Design.Spacing.md)
        }
    }

    private var originalMessageHeader: String {
        switch mode {
        case .reply, .replyAll:
            return "---------- Original Message ----------"
        case .forward:
            return "---------- Forwarded Message ----------"
        case .new:
            return ""
        }
    }
}
