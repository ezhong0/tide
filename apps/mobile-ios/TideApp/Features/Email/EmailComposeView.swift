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
                            recipientsSection

                            Divider()

                            // Subject
                            subjectSection

                            Divider()

                            // Body
                            bodySection

                            // Original message (for reply/forward)
                            if viewModel.showOriginalMessage, let original = viewModel.originalEmail {
                                originalMessageSection(original)
                            }
                        }
                    }
                }
            }
            .navigationTitle(navigationTitle)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        if viewModel.hasChanges {
                            showCancelConfirmation = true
                        } else {
                            dismiss()
                        }
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Send") {
                        Task {
                            await viewModel.send()
                            if viewModel.sendSuccess {
                                dismiss()
                            }
                        }
                    }
                    .disabled(!viewModel.canSend || viewModel.isSending)
                }
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

    // MARK: - Recipients Section
    @ViewBuilder
    private var recipientsSection: some View {
        VStack(spacing: 0) {
            // To field
            HStack(spacing: 12) {
                Text("To:")
                    .foregroundColor(.secondary)
                    .frame(width: 50, alignment: .leading)

                TextField("Recipients", text: $viewModel.to)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .focused($focusedField, equals: .to)

                Button {
                    withAnimation {
                        viewModel.showCc.toggle()
                    }
                } label: {
                    Text("Cc")
                        .foregroundColor(viewModel.showCc ? .blue : .secondary)
                }

                Button {
                    withAnimation {
                        viewModel.showBcc.toggle()
                    }
                } label: {
                    Text("Bcc")
                        .foregroundColor(viewModel.showBcc ? .blue : .secondary)
                }
            }
            .padding()

            // CC field
            if viewModel.showCc {
                Divider()
                    .padding(.leading, 62)

                HStack(spacing: 12) {
                    Text("Cc:")
                        .foregroundColor(.secondary)
                        .frame(width: 50, alignment: .leading)

                    TextField("Recipients", text: $viewModel.cc)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                        .focused($focusedField, equals: .cc)
                }
                .padding()
                .transition(.move(edge: .top).combined(with: .opacity))
            }

            // BCC field
            if viewModel.showBcc {
                Divider()
                    .padding(.leading, 62)

                HStack(spacing: 12) {
                    Text("Bcc:")
                        .foregroundColor(.secondary)
                        .frame(width: 50, alignment: .leading)

                    TextField("Recipients", text: $viewModel.bcc)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                        .focused($focusedField, equals: .bcc)
                }
                .padding()
                .transition(.move(edge: .top).combined(with: .opacity))
            }
        }
    }

    // MARK: - Subject Section
    @ViewBuilder
    private var subjectSection: some View {
        HStack(spacing: 12) {
            Text("Subject:")
                .foregroundColor(.secondary)
                .frame(width: 50, alignment: .leading)

            TextField("Subject", text: $viewModel.subject)
                .focused($focusedField, equals: .subject)
        }
        .padding()
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

            // AI suggestions (if available)
            if !viewModel.suggestions.isEmpty {
                Divider()
                suggestionsSection
            }
        }
    }

    // MARK: - Suggestions Section
    @ViewBuilder
    private var suggestionsSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: "sparkles")
                    .foregroundColor(.blue)
                Text("AI Suggestions")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .textCase(.uppercase)
            }
            .padding(.horizontal)
            .padding(.top, 8)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(viewModel.suggestions, id: \.self) { suggestion in
                        Button {
                            viewModel.applySuggestion(suggestion)
                        } label: {
                            Text(suggestion)
                                .font(.callout)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color.blue.opacity(0.1))
                                .foregroundColor(.blue)
                                .cornerRadius(16)
                        }
                    }
                }
                .padding(.horizontal)
            }
            .padding(.bottom, 8)
        }
    }

    // MARK: - Original Message Section
    @ViewBuilder
    private func originalMessageSection(_ email: EmailDetail) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Divider()

            Text(originalMessageHeader)
                .font(.caption)
                .foregroundColor(.secondary)
                .padding(.horizontal)
                .padding(.top, 8)

            VStack(alignment: .leading, spacing: 4) {
                Text("From: \(email.fromName ?? email.from)")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Text("Date: \(email.receivedAt, style: .date)")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Text("Subject: \(email.subject)")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Text("To: \(email.to.joined(separator: ", "))")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding()
            .background(Color(.secondarySystemBackground))
            .cornerRadius(8)
            .padding(.horizontal)

            Text(email.body)
                .font(.callout)
                .foregroundColor(.secondary)
                .padding()
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

// MARK: - View Model
@MainActor
class EmailComposeViewModel: ObservableObject {
    @Published var to: String = ""
    @Published var cc: String = ""
    @Published var bcc: String = ""
    @Published var subject: String = ""
    @Published var body: String = ""
    @Published var showCc: Bool = false
    @Published var showBcc: Bool = false

    @Published var originalEmail: EmailDetail?
    @Published var suggestions: [String] = []
    @Published var isLoading = false
    @Published var isSending = false
    @Published var sendSuccess = false
    @Published var showError = false
    @Published var error: Error?

    private let replyTo: String?
    private let mode: ComposeMode
    private let apiClient: APIClientProtocol
    private let authManager: AuthManagerProtocol

    private var draftTimer: Timer?
    private var initialState: String = ""

    init(replyTo: String?, mode: ComposeMode, apiClient: APIClientProtocol, authManager: AuthManagerProtocol) {
        self.replyTo = replyTo
        self.mode = mode
        self.apiClient = apiClient
        self.authManager = authManager

        // Start auto-save timer
        startAutoSave()
    }

    deinit {
        draftTimer?.invalidate()
    }

    var canSend: Bool {
        !to.isEmpty && !subject.isEmpty && !body.isEmpty
    }

    var hasChanges: Bool {
        let currentState = "\(to)\(cc)\(bcc)\(subject)\(body)"
        return currentState != initialState && currentState.count > 0
    }

    var showOriginalMessage: Bool {
        mode != .new && originalEmail != nil
    }

    func loadOriginalEmail() async {
        guard let emailId = replyTo, mode != .new else { return }

        isLoading = true
        defer { isLoading = false }

        do {
            // Fetch original email from API
            let fetchedEmail = try await apiClient.getEmailDetail(id: emailId)

            // Convert to EmailDetail
            originalEmail = EmailDetail(
                id: fetchedEmail.id,
                from: fetchedEmail.from.email,
                fromName: fetchedEmail.from.name,
                to: fetchedEmail.to.map { $0.email },
                cc: nil,
                subject: fetchedEmail.subject,
                body: fetchedEmail.body,
                receivedAt: fetchedEmail.timestamp,
                isRead: fetchedEmail.isRead,
                isStarred: fetchedEmail.isStarred,
                isVIP: false,
                aiSummary: fetchedEmail.aiSummary,
                attachments: nil
            )

            // Pre-fill fields based on mode
            prefillFields()

            // Generate AI suggestions
            generateSuggestions()

            // Store initial state
            initialState = "\(to)\(cc)\(bcc)\(subject)\(body)"

        } catch {
            print("Error loading original email: \(error)")
            self.error = error
            self.showError = true
        }
    }

    func send() async {
        guard canSend else { return }

        isSending = true
        defer { isSending = false }

        do {
            // Parse recipients
            let toRecipients = to.split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }

            switch mode {
            case .reply:
                // Reply to original email
                guard let emailId = replyTo else {
                    throw EmailError.invalidReplyContext
                }
                try await apiClient.replyToEmail(id: emailId, body: body)

            case .replyAll:
                // Reply all - same as reply for now (backend handles CC)
                guard let emailId = replyTo else {
                    throw EmailError.invalidReplyContext
                }
                try await apiClient.replyToEmail(id: emailId, body: body)

            case .forward:
                // Forward email
                guard let emailId = replyTo else {
                    throw EmailError.invalidForwardContext
                }
                try await apiClient.forwardEmail(id: emailId, to: toRecipients, body: body)

            case .new:
                // Send new email
                try await apiClient.sendEmail(to: toRecipients, subject: subject, body: body)
            }

            sendSuccess = true

            // Save as sent
            saveDraft(isSent: true)

        } catch {
            print("Error sending email: \(error)")
            self.error = error
            self.showError = true
        }
    }

    func applySuggestion(_ suggestion: String) {
        if body.isEmpty {
            body = suggestion
        } else {
            body += "\n\n" + suggestion
        }
    }

    // MARK: - Private Helpers
    private func prefillFields() {
        guard let email = originalEmail else { return }

        switch mode {
        case .new:
            break

        case .reply:
            to = email.from
            subject = email.subject.hasPrefix("Re:") ? email.subject : "Re: \(email.subject)"
            body = "\n\n"

        case .replyAll:
            to = email.from
            cc = email.to.filter { $0 != "me@example.com" }.joined(separator: ", ")
            if !cc.isEmpty {
                showCc = true
            }
            subject = email.subject.hasPrefix("Re:") ? email.subject : "Re: \(email.subject)"
            body = "\n\n"

        case .forward:
            subject = email.subject.hasPrefix("Fwd:") ? email.subject : "Fwd: \(email.subject)"
            body = "\n\n"
        }
    }

    private func generateSuggestions() {
        // Mock AI suggestions based on mode
        switch mode {
        case .reply:
            suggestions = [
                "Thank you for the update!",
                "I'll review and get back to you.",
                "Sounds good to me."
            ]
        case .replyAll:
            suggestions = [
                "Thanks everyone for the feedback.",
                "I agree with the proposed approach.",
                "Let's move forward with this."
            ]
        case .forward:
            suggestions = [
                "FYI - please review",
                "Thought this might interest you",
                "Please see below"
            ]
        case .new:
            suggestions = []
        }
    }

    private func startAutoSave() {
        draftTimer = Timer.scheduledTimer(withTimeInterval: 30.0, repeats: true) { [weak self] _ in
            self?.saveDraft()
        }
    }

    private func saveDraft(isSent: Bool = false) {
        guard hasChanges else { return }

        // TODO: Implement actual draft saving to local storage
        print("📝 Saving draft... (sent: \(isSent))")

        if !isSent {
            // Update initial state after saving
            initialState = "\(to)\(cc)\(bcc)\(subject)\(body)"
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

// MARK: - Email Error
enum EmailError: LocalizedError {
    case invalidReplyContext
    case invalidForwardContext

    var errorDescription: String? {
        switch self {
        case .invalidReplyContext:
            return "Cannot reply: Original email not found"
        case .invalidForwardContext:
            return "Cannot forward: Original email not found"
        }
    }
}
