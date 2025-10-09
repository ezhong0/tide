/**
 * Detail Body Section Component
 * Displays email body with AI summary
 */

import SwiftUI

struct DetailBodySection: View {
    let email: EmailDetail

    var body: some View {
        VStack(alignment: .leading, spacing: Design.Spacing.md) {
            // AI Summary (if available)
            if let summary = email.aiSummary {
                HStack {
                    Image(systemName: "sparkles")
                        .foregroundColor(Design.Colors.Semantic.info)
                        .accessibilityHidden(true)
                    Text(summary)
                        .font(Design.Typography.Body.regular)
                        .foregroundColor(Design.Colors.Text.secondary)
                }
                .padding(Design.Spacing.md)
                .background(Design.Colors.Semantic.info.opacity(0.1))
                .cornerRadius(Design.CornerRadius.md)
                .accessibilityElement(children: .combine)
                .accessibilityLabel("AI generated summary: \(summary)")
            }

            // Body text
            if #available(iOS 15.0, macOS 12.0, *) {
                Text(email.body)
                    .font(Design.Typography.Body.regular)
                    .foregroundColor(Design.Colors.Text.primary)
                    .textSelection(.enabled)
            } else {
                Text(email.body)
                    .font(Design.Typography.Body.regular)
                    .foregroundColor(Design.Colors.Text.primary)
            }
        }
        .padding(Design.Spacing.md)
    }
}
