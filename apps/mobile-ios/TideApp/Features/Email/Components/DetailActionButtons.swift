/**
 * Detail Action Buttons Component
 * Reply, Reply All, and Forward action buttons
 */

import SwiftUI

struct DetailActionButtons: View {
    let emailId: String
    @EnvironmentObject var navigationState: NavigationState

    var body: some View {
        HStack(spacing: Design.Spacing.sm) {
            Button {
                navigateToCompose(mode: .reply)
            } label: {
                Label("Reply", systemImage: "arrowshape.turn.up.left")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(SecondaryButtonStyle())
            .accessibilityLabel("Reply to sender")
            .accessibilityHint("Double tap to compose a reply to this email")

            Button {
                navigateToCompose(mode: .replyAll)
            } label: {
                Label("Reply All", systemImage: "arrowshape.turn.up.left.2")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(SecondaryButtonStyle())
            .accessibilityLabel("Reply to all recipients")
            .accessibilityHint("Double tap to compose a reply to all recipients")

            Button {
                navigateToCompose(mode: .forward)
            } label: {
                Label("Forward", systemImage: "arrowshape.turn.up.right")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(SecondaryButtonStyle())
            .accessibilityLabel("Forward email")
            .accessibilityHint("Double tap to forward this email to others")
        }
        .padding(Design.Spacing.md)
        .background(Design.ColorHelpers.Background.primary)
        .shadow(
            color: Design.Shadow.md.color,
            radius: Design.Shadow.md.radius,
            x: Design.Shadow.md.x,
            y: -2
        )
    }

    private func navigateToCompose(mode: ComposeMode) {
        navigationState.emailPath.append(EmailDestination.compose(replyTo: emailId, mode: mode))
    }
}
