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
                if viewModel.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .padding(.top, 100)
                } else if let email = viewModel.email {
                    // Email Header
                    emailHeader(email)

                    Divider()

                    // Email Body
                    emailBody(email)

                    // Attachments (if any)
                    if let attachments = email.attachments, !attachments.isEmpty {
                        attachmentsSection(attachments)
                    }

                    // Previous messages in thread
                    if let threadMessages = viewModel.threadMessages, !threadMessages.isEmpty {
                        threadSection(threadMessages)
                    }
                } else if let error = viewModel.error {
                    ErrorView(error: error) {
                        Task {
                            await viewModel.loadEmail()
                        }
                    }
                }
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

                    Button {
                        Task { await viewModel.toggleStar() }
                    } label: {
                        Label(
                            viewModel.email?.isStarred == true ? "Unstar" : "Star",
                            systemImage: viewModel.email?.isStarred == true ? "star.slash" : "star"
                        )
                    }

                    Divider()

                    Button {
                        Task {
                            await viewModel.archive()
                            dismiss()
                        }
                    } label: {
                        Label("Archive", systemImage: "archivebox")
                    }

                    Button(role: .destructive) {
                        Task {
                            await viewModel.delete()
                            dismiss()
                        }
                    } label: {
                        Label("Delete", systemImage: "trash")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            }
        }
        .safeAreaInset(edge: .bottom) {
            if viewModel.email != nil {
                actionButtons
            }
        }
        .task {
            await viewModel.loadEmail()
        }
    }

    // MARK: - Email Header
    @ViewBuilder
    private func emailHeader(_ email: EmailDetail) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            // From
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(email.fromName ?? email.from)
                        .font(.headline)

                    Text(email.from)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                if email.isVIP {
                    Image(systemName: "star.fill")
                        .foregroundColor(.yellow)
                }
            }

            // To
            if !email.to.isEmpty {
                VStack(alignment: .leading, spacing: 2) {
                    Text("To: \(email.to.joined(separator: ", "))")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            // CC (if present)
            if let cc = email.cc, !cc.isEmpty {
                Text("CC: \(cc.joined(separator: ", "))")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            // Date
            Text(email.receivedAt, style: .relative)
                .font(.caption)
                .foregroundColor(.secondary)

            // Subject
            Text(email.subject)
                .font(.title3)
                .fontWeight(.semibold)
        }
        .padding()
    }

    // MARK: - Email Body
    @ViewBuilder
    private func emailBody(_ email: EmailDetail) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            // AI Summary (if available)
            if let summary = email.aiSummary {
                HStack {
                    Image(systemName: "sparkles")
                        .foregroundColor(.blue)
                    Text(summary)
                        .font(.callout)
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color.blue.opacity(0.1))
                .cornerRadius(8)
            }

            // Body text
            Text(email.body)
                .font(.body)
                .textSelection(.enabled)
        }
        .padding()
    }

    // MARK: - Attachments
    @ViewBuilder
    private func attachmentsSection(_ attachments: [Attachment]) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Attachments (\(attachments.count))")
                .font(.caption)
                .foregroundColor(.secondary)
                .textCase(.uppercase)

            ForEach(attachments) { attachment in
                HStack {
                    Image(systemName: "doc.fill")
                        .foregroundColor(.blue)

                    VStack(alignment: .leading) {
                        Text(attachment.filename)
                            .font(.callout)

                        Text(formatFileSize(attachment.size))
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    Spacer()

                    Button {
                        // Download attachment
                    } label: {
                        Image(systemName: "arrow.down.circle")
                    }
                }
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(8)
            }
        }
        .padding()
    }

    // MARK: - Thread Section
    @ViewBuilder
    private func threadSection(_ messages: [EmailDetail]) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Divider()

            Text("Previous Messages (\(messages.count))")
                .font(.caption)
                .foregroundColor(.secondary)
                .textCase(.uppercase)
                .padding(.horizontal)

            ForEach(messages) { message in
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text(message.fromName ?? message.from)
                            .font(.subheadline)
                            .fontWeight(.medium)

                        Spacer()

                        Text(message.receivedAt, style: .relative)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    Text(message.body)
                        .font(.callout)
                        .foregroundColor(.secondary)
                        .lineLimit(3)
                }
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(8)
                .padding(.horizontal)
            }
        }
        .padding(.vertical)
    }

    // MARK: - Action Buttons
    private var actionButtons: some View {
        HStack(spacing: 12) {
            Button {
                navigateToCompose(mode: .reply)
            } label: {
                Label("Reply", systemImage: "arrowshape.turn.up.left")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)

            Button {
                navigateToCompose(mode: .replyAll)
            } label: {
                Label("Reply All", systemImage: "arrowshape.turn.up.left.2")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)

            Button {
                navigateToCompose(mode: .forward)
            } label: {
                Label("Forward", systemImage: "arrowshape.turn.up.right")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)
        }
        .padding()
        .background(Color(.systemBackground))
        .shadow(color: Color.black.opacity(0.05), radius: 5, y: -2)
    }

    // MARK: - Helpers
    private func navigateToCompose(mode: ComposeMode) {
        navigationState.emailPath.append(EmailDestination.compose(replyTo: emailId, mode: mode))
    }

    private func formatFileSize(_ bytes: Int) -> String {
        let formatter = ByteCountFormatter()
        formatter.countStyle = .file
        return formatter.string(fromByteCount: Int64(bytes))
    }
}

// MARK: - Email Detail Model
struct EmailDetail: Identifiable {
    let id: String
    let from: String
    let fromName: String?
    let to: [String]
    let cc: [String]?
    let subject: String
    let body: String
    let receivedAt: Date
    let isRead: Bool
    let isStarred: Bool
    let isVIP: Bool
    let aiSummary: String?
    let attachments: [Attachment]?
}

struct Attachment: Identifiable {
    let id: String
    let filename: String
    let size: Int
    let mimeType: String
}

// MARK: - View Model
@MainActor
class EmailDetailViewModel: ObservableObject {
    @Published var email: EmailDetail?
    @Published var threadMessages: [EmailDetail]?
    @Published var isLoading = false
    @Published var error: Error?

    private let emailId: String
    private let apiClient: APIClientProtocol
    private let authManager: AuthManagerProtocol

    init(emailId: String, apiClient: APIClientProtocol, authManager: AuthManagerProtocol) {
        self.emailId = emailId
        self.apiClient = apiClient
        self.authManager = authManager
    }

    func loadEmail() async {
        isLoading = true
        defer { isLoading = false }

        do {
            // TODO: Implement actual API call
            // For now, mock data
            try await Task.sleep(nanoseconds: 500_000_000) // 0.5s

            // Mock email
            email = EmailDetail(
                id: emailId,
                from: "john@example.com",
                fromName: "John Doe",
                to: ["me@example.com"],
                cc: nil,
                subject: "Re: Project Update",
                body: "Thanks for the update! Everything looks good. Let's schedule a follow-up meeting next week.\n\nBest,\nJohn",
                receivedAt: Date(),
                isRead: true,
                isStarred: false,
                isVIP: false,
                aiSummary: "John approves the project update and suggests scheduling a follow-up meeting.",
                attachments: nil
            )
        } catch {
            self.error = error
        }
    }

    func toggleRead() async {
        guard var email = email else { return }
        email = EmailDetail(
            id: email.id,
            from: email.from,
            fromName: email.fromName,
            to: email.to,
            cc: email.cc,
            subject: email.subject,
            body: email.body,
            receivedAt: email.receivedAt,
            isRead: !email.isRead,
            isStarred: email.isStarred,
            isVIP: email.isVIP,
            aiSummary: email.aiSummary,
            attachments: email.attachments
        )
        self.email = email
        // TODO: API call
    }

    func toggleStar() async {
        guard var email = email else { return }
        email = EmailDetail(
            id: email.id,
            from: email.from,
            fromName: email.fromName,
            to: email.to,
            cc: email.cc,
            subject: email.subject,
            body: email.body,
            receivedAt: email.receivedAt,
            isRead: email.isRead,
            isStarred: !email.isStarred,
            isVIP: email.isVIP,
            aiSummary: email.aiSummary,
            attachments: email.attachments
        )
        self.email = email
        // TODO: API call
    }

    func archive() async {
        // TODO: API call
    }

    func delete() async {
        // TODO: API call
    }
}

// MARK: - Error View
struct ErrorView: View {
    let error: Error
    let retry: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 48))
                .foregroundColor(.orange)

            Text("Error loading email")
                .font(.headline)

            Text(error.localizedDescription)
                .font(.callout)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)

            Button("Try Again", action: retry)
                .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        EmailDetailView(emailId: "test-email-123")
            .environmentObject(NavigationState())
    }
}
