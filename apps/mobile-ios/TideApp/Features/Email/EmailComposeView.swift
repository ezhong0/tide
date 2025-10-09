/**
 * Email Compose View
 * Create new emails or reply/forward to existing ones
 */

import SwiftUI

struct EmailComposeView: View {
    let replyTo: String?
    let mode: ComposeMode

    @StateObject private var viewModel: EmailComposeViewModel
    @EnvironmentObject var container: DependencyContainer
    @EnvironmentObject var navigationState: NavigationState
    @Environment(\.dismiss) private var dismiss

    @State private var showCancelConfirmation = false
    @FocusState private var focusedField: Field?

    enum Field {
        case to, cc, bcc, subject, body
    }

    init(replyTo: String? = nil, mode: ComposeMode = .new, dependencies: DependencyContainer = .shared) {
        self.replyTo = replyTo
        self.mode = mode
        self._viewModel = StateObject(wrappedValue: dependencies.makeEmailComposeViewModel(replyTo: replyTo, mode: mode))
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if viewModel.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    ScrollView {
                        VStack(spacing: 0) {
                            // Recipients Section
                            ComposeRecipientsSection(
                                viewModel: viewModel,
                                focusedField: $focusedField
                            )

                            Divider()

                            // Subject
                            subjectSection

                            Divider()

                            // Body
                            bodySection

                            // Original message (for reply/forward)
                            if viewModel.showOriginalMessage, let original = viewModel.originalEmail {
                                ComposeOriginalMessageSection(email: original, mode: mode)
                            }
                        }
                    }
                }
            }
            .navigationTitle(navigationTitle)
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                #if os(iOS)
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        if viewModel.hasChanges {
                            showCancelConfirmation = true
                        } else {
                            dismiss()
                        }
                    }
                    .accessibilityLabel("Cancel composing email")
                    .accessibilityHint("Double tap to discard this draft and close")
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        Task {
                            await viewModel.send()
                            if viewModel.sendSuccess {
                                dismiss()
                            }
                        }
                    } label: {
                        if viewModel.isSending {
                            ProgressView()
                                .scaleEffect(0.8)
                        } else {
                            Text("Send")
                        }
                    }
                    .disabled(!viewModel.canSend || viewModel.isSending)
                    .accessibilityLabel(viewModel.isSending ? "Sending email" : "Send email")
                    .accessibilityHint(viewModel.canSend ? "Double tap to send this email" : "Complete all required fields to send")
                    .accessibilityValue(viewModel.isSending ? "In progress" : "")
                }
                #else
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        if viewModel.hasChanges {
                            showCancelConfirmation = true
                        } else {
                            dismiss()
                        }
                    }
                    .accessibilityLabel("Cancel composing email")
                    .accessibilityHint("Double tap to discard this draft and close")
                }

                ToolbarItem(placement: .primaryAction) {
                    Button {
                        Task {
                            await viewModel.send()
                            if viewModel.sendSuccess {
                                dismiss()
                            }
                        }
                    } label: {
                        if viewModel.isSending {
                            ProgressView()
                                .scaleEffect(0.8)
                        } else {
                            Text("Send")
                        }
                    }
                    .disabled(!viewModel.canSend || viewModel.isSending)
                    .accessibilityLabel(viewModel.isSending ? "Sending email" : "Send email")
                    .accessibilityHint(viewModel.canSend ? "Double tap to send this email" : "Complete all required fields to send")
                    .accessibilityValue(viewModel.isSending ? "In progress" : "")
                }
                #endif
            }
            .alert("Discard Draft?", isPresented: $showCancelConfirmation) {
                Button("Discard", role: .destructive) {
                    dismiss()
                }
                Button("Keep Editing", role: .cancel) { }
            } message: {
                Text("Are you sure you want to discard this draft?")
            }
            .alert("Error", isPresented: $viewModel.showError) {
                Button("OK", role: .cancel) { }
            } message: {
                if let error = viewModel.error {
                    Text(error.localizedDescription)
                }
            }
            .task {
                await viewModel.loadOriginalEmail()
            }
        }
    }

    // MARK: - Subject Section
    @ViewBuilder
    private var subjectSection: some View {
        HStack(spacing: Design.Spacing.sm) {
            Text("Subject:")
                .font(Design.Typography.Body.regular)
                .foregroundColor(Design.Colors.Text.secondary)
                .frame(width: 50, alignment: .leading)

            TextField("Subject", text: $viewModel.subject)
                .font(Design.Typography.Body.regular)
                .focused($focusedField, equals: .subject)
                .accessibilityLabel("Email subject")
                .accessibilityValue(viewModel.subject.isEmpty ? "Empty" : viewModel.subject)
                .accessibilityHint("Enter the subject line of your email")
        }
        .padding(Design.Spacing.md)
    }

    // MARK: - Body Section
    @ViewBuilder
    private var bodySection: some View {
        VStack(alignment: .leading, spacing: 0) {
            TextEditor(text: $viewModel.body)
                .frame(minHeight: 200)
                .focused($focusedField, equals: .body)
                .padding(.horizontal)
                .padding(.top, 8)
                .accessibilityLabel("Email body")
                .accessibilityValue(viewModel.body.isEmpty ? "Empty" : viewModel.body)
                .accessibilityHint("Enter the main content of your email")

            // AI suggestions (if available)
            if !viewModel.suggestions.isEmpty {
                Divider()
                ComposeSuggestionsSection(viewModel: viewModel)
            }
        }
    }

    // MARK: - Helpers
    private var navigationTitle: String {
        switch mode {
        case .new:
            return "New Email"
        case .reply:
            return "Reply"
        case .replyAll:
            return "Reply All"
        case .forward:
            return "Forward"
        }
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        EmailComposeView(replyTo: nil, mode: .new)
            .environmentObject(NavigationState())
    }
}

#Preview("Reply Mode") {
    NavigationStack {
        EmailComposeView(replyTo: "test-email-123", mode: .reply)
            .environmentObject(NavigationState())
    }
}
