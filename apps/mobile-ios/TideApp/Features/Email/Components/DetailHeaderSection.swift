/**
 * Detail Header Section Component
 * Displays email sender, recipients, and metadata
 */

import SwiftUI

struct DetailHeaderSection: View {
    let email: EmailDetail

    var body: some View {
        VStack(alignment: .leading, spacing: Design.Spacing.sm) {
            // From
            HStack {
                VStack(alignment: .leading, spacing: Design.Spacing.xxs) {
                    Text(email.fromName ?? email.from)
                        .font(Design.Typography.Headline.semibold)
                        .foregroundColor(Design.Colors.Text.primary)

                    Text(email.from)
                        .font(Design.Typography.Caption.regular)
                        .foregroundColor(Design.Colors.Text.secondary)
                }

                Spacer()

                if email.isVIP {
                    Image(systemName: "star.fill")
                        .foregroundColor(.yellow)
                        .accessibilityLabel("VIP sender")
                }
            }

            // To
            if !email.to.isEmpty {
                VStack(alignment: .leading, spacing: 2) {
                    Text("To: \(email.to.joined(separator: ", "))")
                        .font(Design.Typography.Caption.regular)
                        .foregroundColor(Design.Colors.Text.secondary)
                }
            }

            // CC (if present)
            if let cc = email.cc, !cc.isEmpty {
                Text("CC: \(cc.joined(separator: ", "))")
                    .font(Design.Typography.Caption.regular)
                    .foregroundColor(Design.Colors.Text.secondary)
            }

            // Date
            Text(email.receivedAt, style: .relative)
                .font(Design.Typography.Caption.regular)
                .foregroundColor(Design.Colors.Text.secondary)

            // Subject
            Text(email.subject)
                .font(Design.Typography.Title.semibold)
                .foregroundColor(Design.Colors.Text.primary)
        }
        .padding(Design.Spacing.md)
    }
}
