/**
 * Detail Attachments Section Component
 * Displays email attachments
 */

import SwiftUI

struct DetailAttachmentsSection: View {
    let attachments: [Attachment]

    var body: some View {
        VStack(alignment: .leading, spacing: Design.Spacing.sm) {
            Text("Attachments (\(attachments.count))")
                .font(Design.Typography.Caption.regular)
                .foregroundColor(Design.Colors.Text.secondary)
                .textCase(.uppercase)

            ForEach(attachments) { attachment in
                HStack {
                    Image(systemName: "doc.fill")
                        .foregroundColor(Design.Colors.Semantic.info)

                    VStack(alignment: .leading) {
                        Text(attachment.filename)
                            .font(Design.Typography.Body.regular)
                            .foregroundColor(Design.Colors.Text.primary)

                        Text(formatFileSize(attachment.size))
                            .font(Design.Typography.Caption.regular)
                            .foregroundColor(Design.Colors.Text.secondary)
                    }

                    Spacer()

                    Button {
                        // Download attachment
                    } label: {
                        Image(systemName: "arrow.down.circle")
                    }
                    .accessibilityLabel("Download \(attachment.filename)")
                    .accessibilityHint("Double tap to download this attachment")
                }
                .padding(Design.Spacing.md)
                .background(Design.Colors.Background.secondary)
                .cornerRadius(Design.CornerRadius.md)
                .accessibilityElement(children: .contain)
                .accessibilityLabel("Attachment: \(attachment.filename), \(formatFileSize(attachment.size))")
            }
        }
        .padding(Design.Spacing.md)
    }

    private func formatFileSize(_ bytes: Int) -> String {
        let formatter = ByteCountFormatter()
        formatter.countStyle = .file
        return formatter.string(fromByteCount: Int64(bytes))
    }
}
