import SwiftUI

struct EmailView: View {
    @State private var emails: [Email] = Email.mockEmails
    @State private var filter: EmailFilter = .unread
    @State private var selectedEmail: Email?
    @State private var isComposing = false
    @State private var searchText = ""

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
                // Smart sections
                if filter == .all || filter == .unread {
                    Section("Needs Your Attention") {
                        ForEach(filteredEmails.filter { $0.priority == .high }) { email in
                            EmailRow(email: email)
                                .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                    Button("Archive") {
                                        archive(email)
                                    }
                                    .tint(.gray)

                                    Button("Reply") {
                                        quickReply(to: email)
                                    }
                                    .tint(.blue)
                                }
                                .swipeActions(edge: .leading, allowsFullSwipe: false) {
                                    Button("Delegate") {
                                        delegate(email)
                                    }
                                    .tint(.purple)
                                }
                                .onTapGesture {
                                    selectedEmail = email
                                }
                        }
                    }
                }

                Section("Inbox") {
                    ForEach(filteredEmails.filter { $0.priority != .high }) { email in
                        EmailRow(email: email)
                            .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                Button("Archive") {
                                    archive(email)
                                }
                                .tint(.gray)
                            }
                            .onTapGesture {
                                selectedEmail = email
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
                Text("Compose Email - Coming Soon")
            }
            .sheet(item: $selectedEmail) { email in
                EmailDetailView(email: email)
            }
        }
    }

    // MARK: - Actions

    private func archive(_ email: Email) {
        withAnimation {
            emails.removeAll { $0.id == email.id }
        }
    }

    private func quickReply(to email: Email) {
        // TODO: Implement quick reply
    }

    private func delegate(_ email: Email) {
        // TODO: Implement delegation
    }

    private func refreshEmails() async {
        // Simulate network refresh
        try? await Task.sleep(nanoseconds: 1_000_000_000)
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

// MARK: - Email Detail View
struct EmailDetailView: View {
    let email: Email
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    // Header
                    VStack(alignment: .leading, spacing: 8) {
                        Text(email.subject)
                            .font(TideTheme.Typography.title2)
                            .fontWeight(.bold)

                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("From: \(email.from.name)")
                                    .font(TideTheme.Typography.subheadline)
                                Text(email.from.email)
                                    .font(TideTheme.Typography.footnote)
                                    .foregroundColor(TideTheme.textSecondary)
                            }

                            Spacer()

                            Text(email.timestamp.formatted())
                                .font(TideTheme.Typography.caption1)
                                .foregroundColor(TideTheme.textSecondary)
                        }
                    }
                    .padding()
                    .background(TideTheme.surface)
                    .cornerRadius(TideTheme.CornerRadius.medium)

                    // AI Summary
                    if let aiSummary = email.aiSummary {
                        VStack(alignment: .leading, spacing: 8) {
                            Label("AI Summary", systemImage: "brain.head.profile")
                                .font(TideTheme.Typography.headline)
                                .foregroundColor(TideTheme.primary)

                            Text(aiSummary)
                                .font(TideTheme.Typography.body)
                        }
                        .padding()
                        .background(TideTheme.primary.opacity(0.1))
                        .cornerRadius(TideTheme.CornerRadius.medium)
                    }

                    // Body
                    Text(email.body)
                        .font(TideTheme.Typography.body)
                        .padding()
                        .background(TideTheme.surface)
                        .cornerRadius(TideTheme.CornerRadius.medium)
                }
                .padding()
            }
            .navigationTitle("Email")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button("Reply", systemImage: "arrowshape.turn.up.left") {}
                        Button("Reply All", systemImage: "arrowshape.turn.up.left.2") {}
                        Button("Forward", systemImage: "arrowshape.turn.up.right") {}
                        Divider()
                        Button("Archive", systemImage: "archivebox") {}
                        Button("Delete", systemImage: "trash", role: .destructive) {}
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
        }
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
