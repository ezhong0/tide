/**
 * Email Detail View
 * Display full email content with reply/forward actions
 */

import SwiftUI

struct EmailDetailView: View {
    let emailId: String
    @StateObject private var viewModel: EmailDetailViewModel
    @EnvironmentObject var container: DependencyContainer
    @EnvironmentObject var navigationState: NavigationState
    @Environment(\.dismiss) private var dismiss

    init(emailId: String, dependencies: DependencyContainer = .shared) {
        self.emailId = emailId
        self._viewModel = StateObject(wrappedValue: dependencies.makeEmailDetailViewModel(emailId: emailId))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                if let email = viewModel.email {
                    // Email Header
                    DetailHeaderSection(email: email)

                    Divider()

                    // Email Body
                    DetailBodySection(email: email)

                    // Attachments (if any)
                    if let attachments = email.attachments, !attachments.isEmpty {
                        DetailAttachmentsSection(attachments: attachments)
                    }

                    // Previous messages in thread
                    if let threadMessages = viewModel.threadMessages, !threadMessages.isEmpty {
                        DetailThreadSection(messages: threadMessages)
                    }
                }
            }
            .stateContent(
                isLoading: viewModel.isLoading,
                error: viewModel.error,
                isEmpty: viewModel.email == nil,
                retryAction: {
                    Task {
                        await viewModel.loadEmail()
                    }
                }
            ) {
                EmptyView(
                    icon: "envelope",
                    title: "Email not found",
                    message: "This email may have been deleted"
                )
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Menu {
                    Button {
                        Task { await viewModel.toggleRead() }
                    } label: {
                        Label(
                            viewModel.email?.isRead == true ? "Mark Unread" : "Mark Read",
                            systemImage: viewModel.email?.isRead == true ? "envelope.badge" : "envelope.open"
                        )
                    }
                    .accessibilityLabel(viewModel.email?.isRead == true ? "Mark as unread" : "Mark as read")
                    .accessibilityHint("Double tap to toggle read status")

                    Button {
                        Task { await viewModel.toggleStar() }
                    } label: {
                        Label(
                            viewModel.email?.isStarred == true ? "Unstar" : "Star",
                            systemImage: viewModel.email?.isStarred == true ? "star.slash" : "star"
                        )
                    }
                    .accessibilityLabel(viewModel.email?.isStarred == true ? "Remove star" : "Add star")
                    .accessibilityHint("Double tap to toggle starred status")

                    Divider()

                    Button {
                        Task {
                            await viewModel.archive()
                            dismiss()
                        }
                    } label: {
                        Label("Archive", systemImage: "archivebox")
                    }
                    .accessibilityLabel("Archive email")
                    .accessibilityHint("Double tap to move this email to archive")

                    Button(role: .destructive) {
                        Task {
                            await viewModel.delete()
                            dismiss()
                        }
                    } label: {
                        Label("Delete", systemImage: "trash")
                    }
                    .accessibilityLabel("Delete email")
                    .accessibilityHint("Double tap to permanently delete this email")
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
                .accessibilityLabel("Email actions")
                .accessibilityHint("Double tap to show email actions menu")
            }
        }
        .safeAreaInset(edge: .bottom) {
            if viewModel.email != nil {
                DetailActionButtons(emailId: emailId)
            }
        }
        .task {
            await viewModel.loadEmail()
        }
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        EmailDetailView(emailId: "test-email-123")
            .environmentObject(NavigationState())
    }
}
