import SwiftUI

struct EmailView: View {
    @State private var emails: [Email] = []
    @State private var filter: EmailFilter = .unread
    @State private var selectedEmail: Email?
    @State private var isComposing = false
    @State private var searchText = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showConnectGmail = true
    @State private var isConnectingGmail = false
    @StateObject private var authManager = AuthManager.shared

    var filteredEmails: [Email] {
        var filtered = emails

        // Apply filter
        switch filter {
        case .unread:
            filtered = filtered.filter { !$0.isRead }
        case .starred:
            filtered = filtered.filter { $0.isStarred }
        case .high:
            filtered = filtered.filter { $0.priority == .high }
        case .normal:
            filtered = filtered.filter { $0.priority == .normal }
        case .low:
            filtered = filtered.filter { $0.priority == .low }
        case .all:
            break
        }

        // Apply search
        if !searchText.isEmpty {
            filtered = filtered.filter {
                $0.subject.localizedCaseInsensitiveContains(searchText) ||
                $0.from.name.localizedCaseInsensitiveContains(searchText) ||
                $0.preview.localizedCaseInsensitiveContains(searchText)
            }
        }

        return filtered
    }

    var body: some View {
        NavigationView {
            List {
                // Connect Gmail button (shown when no emails)
                if emails.isEmpty && !isLoading {
                    Section {
                        Button(action: {
                            _Concurrency.Task {
                                await connectGmail()
                            }
                        }) {
                            HStack {
                                Image(systemName: "envelope.badge")
                                    .foregroundColor(.blue)
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Connect Gmail")
                                        .font(.headline)
                                    Text("Access your emails with AI-powered triage")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                Spacer()
                                if isConnectingGmail {
                                    ProgressView()
                                } else {
                                    Image(systemName: "chevron.right")
                                        .foregroundColor(.secondary)
                                }
                            }
                            .padding(.vertical, 8)
                        }
                        .disabled(isConnectingGmail)
                    }
                }

                // Error message
                if let error = errorMessage {
                    Section {
                        Text(error)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                }

                // Smart sections
                if !emails.isEmpty && (filter == .all || filter == .unread) {
                    Section("Needs Your Attention") {
                        ForEach(filteredEmails.filter { $0.priority == .high }) { email in
                            NavigationLink(destination: EmailDetailView(email: email)) {
                                EmailRow(email: email)
                            }
                            .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                Button("Archive") {
                                    archive(email)
                                }
                                .tint(.gray)
                            }
                        }
                    }
                }

                Section("Inbox") {
                    ForEach(filteredEmails.filter { $0.priority != .high }) { email in
                        NavigationLink(destination: EmailDetailView(email: email)) {
                            EmailRow(email: email)
                        }
                        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                            Button("Archive") {
                                archive(email)
                            }
                            .tint(.gray)
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .refreshable {
                await refreshEmails()
            }
            .searchable(text: $searchText, prompt: "Search emails")
            .navigationTitle("Email")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Menu {
                        ForEach(EmailFilter.allCases, id: \.self) { filterOption in
                            Button(filterOption.rawValue) {
                                filter = filterOption
                            }
                        }
                    } label: {
                        Label("Filter", systemImage: "line.3.horizontal.decrease.circle")
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { isComposing = true }) {
                        Image(systemName: "square.and.pencil")
                    }
                }
            }
            .sheet(isPresented: $isComposing) {
                EmailComposeView(mode: .new, originalEmail: nil)
            }
            .onAppear {
                // Load emails on first appear
                _Concurrency.Task {
                    await refreshEmails()
                }
            }
        }
    }

    // MARK: - Actions

    private func archive(_ email: Email) {
        withAnimation {
            emails.removeAll { $0.id == email.id }
        }
    }

    private func connectGmail() async {
        isConnectingGmail = true
        defer { isConnectingGmail = false }

        do {
            // Sign in with Google OAuth via Supabase
            try await authManager.loginWithOAuth(provider: .google)

            // After successful connection, fetch emails
            await refreshEmails()

            // Hide the connect button
            showConnectGmail = false
        } catch {
            errorMessage = "Failed to connect Gmail: \(error.localizedDescription)"
            print("❌ Error connecting Gmail: \(error)")
        }
    }

    private func refreshEmails() async {
        isLoading = true
        errorMessage = nil

        do {
            // Fetch emails from live backend
            emails = try await EmailService.shared.fetchEmails()
        } catch {
            errorMessage = "Failed to load emails: \(error.localizedDescription)"
            print("❌ Error fetching emails: \(error)")
        }

        isLoading = false
    }
}

// MARK: - Email Row
struct EmailRow: View {
    let email: Email

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                // Sender name
                Text(email.from.name)
                    .font(TideTheme.Typography.headline)
                    .fontWeight(email.isRead ? .regular : .semibold)

                Spacer()

                // Timestamp
                Text(email.timestamp.relative)
                    .font(TideTheme.Typography.caption1)
                    .foregroundColor(TideTheme.textSecondary)

                // Priority indicator
                if email.priority == .high {
                    Image(systemName: "exclamationmark.circle.fill")
                        .foregroundColor(TideTheme.error)
                }
            }

            // Subject
            Text(email.subject)
                .font(TideTheme.Typography.subheadline)
                .fontWeight(email.isRead ? .regular : .semibold)
                .lineLimit(1)

            // Preview
            Text(email.preview)
                .font(TideTheme.Typography.footnote)
                .foregroundColor(TideTheme.textSecondary)
                .lineLimit(2)

            // AI Summary
            if let aiSummary = email.aiSummary {
                HStack(spacing: 6) {
                    Image(systemName: "brain.head.profile")
                        .font(TideTheme.Typography.caption2)
                    Text(aiSummary)
                        .font(TideTheme.Typography.caption1)
                }
                .foregroundColor(TideTheme.primary)
                .padding(.top, 2)
            }
        }
        .padding(.vertical, 4)
        .opacity(email.isRead ? 0.7 : 1.0)
    }
}

// MARK: - Date Extension
extension Date {
    var relative: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: self, relativeTo: Date())
    }
}

// MARK: - Mock Data
extension Email {
    static let mockEmails: [Email] = [
        Email(
            from: EmailContact(email: "sarah@company.com", name: "Sarah Chen"),
            to: [EmailContact(email: "you@tide.ai", name: "You")],
            subject: "Q4 Strategy Meeting - Need Your Input",
            preview: "Hi, I wanted to get your thoughts on the Q4 roadmap before our meeting tomorrow...",
            body: "Hi, I wanted to get your thoughts on the Q4 roadmap before our meeting tomorrow. We need to finalize the priorities and I value your input on the engineering timeline.",
            timestamp: Date().addingTimeInterval(-3600),
            priority: .high,
            aiSummary: "Sarah needs your feedback on Q4 roadmap before tomorrow's meeting"
        ),
        Email(
            from: EmailContact(email: "mike@startup.io", name: "Mike Johnson"),
            to: [EmailContact(email: "you@tide.ai", name: "You")],
            subject: "Partnership Opportunity",
            preview: "We're interested in exploring a potential partnership with Tide...",
            body: "We're interested in exploring a potential partnership with Tide. Would you be available for a call next week?",
            timestamp: Date().addingTimeInterval(-7200),
            priority: .normal
        ),
        Email(
            from: EmailContact(email: "team@slack.com", name: "Slack"),
            to: [EmailContact(email: "you@tide.ai", name: "You")],
            subject: "Your weekly Slack digest",
            preview: "Here's what happened in your workspace this week...",
            body: "Here's what happened in your workspace this week...",
            timestamp: Date().addingTimeInterval(-86400),
            isRead: true,
            priority: .low
        )
    ]
}

// MARK: - Preview
#Preview {
    EmailView()
}
