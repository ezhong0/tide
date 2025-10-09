/**
 * Compose Recipients Section Component
 * Email recipient fields (To, CC, BCC)
 */

import SwiftUI

struct ComposeRecipientsSection: View {
    @ObservedObject var viewModel: EmailComposeViewModel
    @FocusState.Binding var focusedField: EmailComposeView.Field?

    var body: some View {
        VStack(spacing: 0) {
            // To field
            HStack(spacing: Design.Spacing.sm) {
                Text("To:")
                    .font(Design.Typography.Body.regular)
                    .foregroundColor(Design.Colors.Text.secondary)
                    .frame(width: 50, alignment: .leading)

                TextField("Recipients", text: $viewModel.to)
                    .font(Design.Typography.Body.regular)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .focused($focusedField, equals: .to)
                    .accessibilityLabel("To recipients")
                    .accessibilityValue(viewModel.to.isEmpty ? "Empty" : viewModel.to)
                    .accessibilityHint("Enter email addresses separated by commas")

                Button {
                    withAnimation(Design.Animation.standard) {
                        viewModel.showCc.toggle()
                    }
                } label: {
                    Text("Cc")
                        .font(Design.Typography.Label.regular)
                        .foregroundColor(viewModel.showCc ? Design.Colors.Semantic.primary : Design.Colors.Text.secondary)
                }
                .accessibilityLabel("CC field")
                .accessibilityValue(viewModel.showCc ? "Visible" : "Hidden")
                .accessibilityHint("Double tap to toggle CC field visibility")

                Button {
                    withAnimation(Design.Animation.standard) {
                        viewModel.showBcc.toggle()
                    }
                } label: {
                    Text("Bcc")
                        .font(Design.Typography.Label.regular)
                        .foregroundColor(viewModel.showBcc ? Design.Colors.Semantic.primary : Design.Colors.Text.secondary)
                }
                .accessibilityLabel("BCC field")
                .accessibilityValue(viewModel.showBcc ? "Visible" : "Hidden")
                .accessibilityHint("Double tap to toggle BCC field visibility")
            }
            .padding(Design.Spacing.md)

            // CC field
            if viewModel.showCc {
                Divider()
                    .padding(.leading, 62)

                HStack(spacing: Design.Spacing.sm) {
                    Text("Cc:")
                        .font(Design.Typography.Body.regular)
                        .foregroundColor(Design.Colors.Text.secondary)
                        .frame(width: 50, alignment: .leading)

                    TextField("Recipients", text: $viewModel.cc)
                        .font(Design.Typography.Body.regular)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                        .focused($focusedField, equals: .cc)
                        .accessibilityLabel("CC recipients")
                        .accessibilityValue(viewModel.cc.isEmpty ? "Empty" : viewModel.cc)
                        .accessibilityHint("Enter CC email addresses separated by commas")
                }
                .padding(Design.Spacing.md)
                .transition(.move(edge: .top).combined(with: .opacity))
            }

            // BCC field
            if viewModel.showBcc {
                Divider()
                    .padding(.leading, 62)

                HStack(spacing: Design.Spacing.sm) {
                    Text("Bcc:")
                        .font(Design.Typography.Body.regular)
                        .foregroundColor(Design.Colors.Text.secondary)
                        .frame(width: 50, alignment: .leading)

                    TextField("Recipients", text: $viewModel.bcc)
                        .font(Design.Typography.Body.regular)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                        .focused($focusedField, equals: .bcc)
                        .accessibilityLabel("BCC recipients")
                        .accessibilityValue(viewModel.bcc.isEmpty ? "Empty" : viewModel.bcc)
                        .accessibilityHint("Enter BCC email addresses separated by commas")
                }
                .padding(Design.Spacing.md)
                .transition(.move(edge: .top).combined(with: .opacity))
            }
        }
    }
}
