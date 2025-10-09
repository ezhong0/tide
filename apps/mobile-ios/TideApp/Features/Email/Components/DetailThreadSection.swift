/**
 * Detail Thread Section Component
 * Displays previous messages in email thread
 */

import SwiftUI

struct DetailThreadSection: View {
    let messages: [EmailDetail]

    var body: some View {
        VStack(alignment: .leading, spacing: Design.Spacing.sm) {
            Divider()

            Text("Previous Messages (\(messages.count))")
                .font(Design.Typography.Caption.regular)
                .foregroundColor(Design.Colors.Text.secondary)
                .textCase(.uppercase)
                .padding(.horizontal, Design.Spacing.md)

            ForEach(messages) { message in
                VStack(alignment: .leading, spacing: Design.Spacing.sm) {
                    HStack {
                        Text(message.fromName ?? message.from)
                            .font(Design.Typography.Body.medium)
                            .foregroundColor(Design.Colors.Text.primary)

                        Spacer()

                        Text(message.receivedAt, style: .relative)
                            .font(Design.Typography.Caption.regular)
                            .foregroundColor(Design.Colors.Text.secondary)
                    }

                    Text(message.body)
                        .font(Design.Typography.Body.regular)
                        .foregroundColor(Design.Colors.Text.secondary)
                        .lineLimit(3)
                }
                .padding(Design.Spacing.md)
                .background(Design.Colors.Background.secondary)
                .cornerRadius(Design.CornerRadius.md)
                .padding(.horizontal, Design.Spacing.md)
            }
        }
        .padding(.vertical, Design.Spacing.md)
    }
}
