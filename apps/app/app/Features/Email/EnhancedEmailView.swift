import SwiftUI

/// Enhanced Email View using Mobile BFF
/// Provides optimized inbox with AI triage data
struct EnhancedEmailView: View {
    @State private var inboxData: MobileBFFService.InboxResponse?
    @State private var filter: String = "all"
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var searchText = ""

    var filteredEmails: [MobileBFFService.InboxEmail] {
        guard let emails = inboxData?.emails else { return [] }

        if searchText.isEmpty {
            return emails
        }

        return emails.filter {
            $0.subject.localizedCaseInsensitiveContains(searchText) ||
            $0.from.localizedCaseInsensitiveContains(searchText) ||
            $0.snippet.localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        NavigationView {
            ZStack {
                // Subtle gradient background
                TideTheme.Gradients.subtle
                    .ignoresSafeArea()

                Group {
                    if isLoading && inboxData == nil {
                        VStack(spacing: TideTheme.Spacing.md) {
                            ProgressView()
                                .scaleEffect(1.2)
                            Text("Loading inbox...")
                                .font(TideTheme.Typography.subheadline)
                                .foregroundColor(TideTheme.textSecondary)
                        }
                    } else if let data = (PREVIEW_MODE ? MockData.mockInboxResponse() : inboxData) {
                        ScrollView {
                            VStack(spacing: TideTheme.Spacing.lg) {
                                // Priority section
                                let priorityEmails = filteredEmails.filter { $0.priority >= 7 && !$0.isRead }
                                if !priorityEmails.isEmpty {
                                    VStack(alignment: .leading, spacing: TideTheme.Spacing.md) {
                                        HStack {
                                            Image(systemName: "exclamationmark.circle.fill")
                                                .foregroundColor(TideTheme.error)
                                            Text("Needs Your Attention")
                                        }
                                        .tideSectionHeader()
                                        .padding(.horizontal, TideTheme.Spacing.md)

                                        VStack(spacing: TideTheme.Spacing.sm) {
                                            ForEach(priorityEmails, id: \.id) { email in
                                                EnhancedEmailRow(email: email)
                                            }
                                        }
                                        .padding(.horizontal, TideTheme.Spacing.md)
                                    }
                                }

                                // VIP section
                                let vipEmails = filteredEmails.filter { $0.isVIP && !$0.isRead }
                                if !vipEmails.isEmpty {
                                    VStack(alignment: .leading, spacing: TideTheme.Spacing.md) {
                                        HStack {
                                            Image(systemName: "star.fill")
                                                .foregroundColor(.yellow)
                                            Text("From VIPs")
                                        }
                                        .tideSectionHeader()
                                        .padding(.horizontal, TideTheme.Spacing.md)

                                        VStack(spacing: TideTheme.Spacing.sm) {
                                            ForEach(vipEmails, id: \.id) { email in
                                                EnhancedEmailRow(email: email)
                                            }
                                        }
                                        .padding(.horizontal, TideTheme.Spacing.md)
                                    }
                                }

                                // Regular inbox
                                let regularEmails = filteredEmails.filter { $0.priority < 7 && !$0.isVIP }
                                if !regularEmails.isEmpty {
                                    VStack(alignment: .leading, spacing: TideTheme.Spacing.md) {
                                        Text("Inbox")
                                            .tideSectionHeader()
                                            .padding(.horizontal, TideTheme.Spacing.md)

                                        VStack(spacing: TideTheme.Spacing.sm) {
                                            ForEach(regularEmails, id: \.id) { email in
                                                EnhancedEmailRow(email: email)
                                            }
                                        }
                                        .padding(.horizontal, TideTheme.Spacing.md)
                                    }
                                }

                                // Empty state when no emails at all
                                if filteredEmails.isEmpty {
                                    VStack(spacing: TideTheme.Spacing.lg) {
                                        ZStack {
                                            Circle()
                                                .fill(TideTheme.Gradients.primary)
                                                .frame(width: 100, height: 100)
                                                .opacity(0.15)

                                            Image(systemName: "envelope.badge.shield.half.filled")
                                                .font(.system(size: 48))
                                                .foregroundStyle(TideTheme.Gradients.primary)
                                        }

                                        VStack(spacing: TideTheme.Spacing.sm) {
                                            Text("No Emails Yet")
                                                .font(TideTheme.Typography.title3)
                                                .fontWeight(.bold)
                                                .foregroundColor(TideTheme.textPrimary)

                                            Text("When you signed in, we requested Gmail access. It may take a moment to sync.")
                                                .font(TideTheme.Typography.body)
                                                .foregroundColor(TideTheme.textSecondary)
                                                .multilineTextAlignment(.center)
                                                .padding(.horizontal, TideTheme.Spacing.xl)
                                        }
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding(.top, 80)
                                }

                                // Pagination
                                if data.pagination.hasMore {
                                    Text("Load More")
                                        .tideCompactButton()
                                        .onTapGesture {
                                            _Concurrency.Task {
                                                await loadMore()
                                            }
                                        }
                                        .padding(.top, TideTheme.Spacing.md)
                                }
                            }
                            .padding(.vertical, TideTheme.Spacing.md)
                        }
                    } else {
                        // Error state
                        VStack(spacing: TideTheme.Spacing.lg) {
                            Image(systemName: "exclamationmark.triangle")
                                .font(.system(size: 48))
                                .foregroundStyle(TideTheme.Gradients.sunset)

                            if let error = errorMessage {
                                Text(error)
                                    .font(TideTheme.Typography.body)
                                    .foregroundColor(TideTheme.textSecondary)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal, TideTheme.Spacing.xl)
                            }

                            Text("Retry")
                                .tidePrimaryButton()
                                .onTapGesture {
                                    _Concurrency.Task {
                                        await loadInbox()
                                    }
                                }
                                .padding(.horizontal, TideTheme.Spacing.xxl)
                        }
                        .padding()
                    }
                }
            }
            .refreshable {
                await loadInbox()
            }
            .searchable(text: $searchText, prompt: "Search emails")
            .navigationTitle("Email")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button(action: { filter = "all"; _Concurrency.Task { await loadInbox() } }) {
                            Label("All", systemImage: filter == "all" ? "checkmark" : "")
                        }
                        Button(action: { filter = "unread"; _Concurrency.Task { await loadInbox() } }) {
                            Label("Unread", systemImage: filter == "unread" ? "checkmark" : "")
                        }
                        Button(action: { filter = "flagged"; _Concurrency.Task { await loadInbox() } }) {
                            Label("Flagged", systemImage: filter == "flagged" ? "checkmark" : "")
                        }
                        Button(action: { filter = "priority"; _Concurrency.Task { await loadInbox() } }) {
                            Label("Priority", systemImage: filter == "priority" ? "checkmark" : "")
                        }
                        Button(action: { filter = "today"; _Concurrency.Task { await loadInbox() } }) {
                            Label("Today", systemImage: filter == "today" ? "checkmark" : "")
                        }
                    } label: {
                        Image(systemName: "line.3.horizontal.decrease.circle")
                            .font(TideTheme.Typography.body)
                    }
                }
            }
            .onAppear {
                if !PREVIEW_MODE && inboxData == nil {
                    _Concurrency.Task {
                        await loadInbox()
                    }
                }
            }
        }
    }

    // MARK: - Actions

    private func loadInbox() async {
        isLoading = true
        errorMessage = nil

        do {
            inboxData = try await MobileBFFService.shared.fetchInbox(filter: filter, limit: 20, offset: 0)
        } catch {
            errorMessage = "Failed to load inbox: \(error.localizedDescription)"
            print("❌ Error loading inbox: \(error)")
        }

        isLoading = false
    }

    private func loadMore() async {
        guard let currentData = inboxData else { return }

        do {
            let newData = try await MobileBFFService.shared.fetchInbox(
                filter: filter,
                limit: 20,
                offset: currentData.emails.count
            )

            // Create new response with combined emails
            let combinedEmails = currentData.emails + newData.emails
            let updatedResponse = MobileBFFService.InboxResponse(
                emails: combinedEmails,
                total: newData.total,
                filter: newData.filter,
                pagination: newData.pagination,
                metadata: newData.metadata
            )
            inboxData = updatedResponse
        } catch {
            errorMessage = "Failed to load more emails: \(error.localizedDescription)"
            print("❌ Error loading more emails: \(error)")
        }
    }
}

// MARK: - Enhanced Email Row
struct EnhancedEmailRow: View {
    let email: MobileBFFService.InboxEmail

    var body: some View {
        HStack(spacing: TideTheme.Spacing.md) {
            // Avatar with gradient and initial
            ZStack {
                Circle()
                    .fill(avatarGradient)
                    .frame(width: TideTheme.Size.avatarMedium, height: TideTheme.Size.avatarMedium)

                Text(email.from.prefix(1).uppercased())
                    .font(TideTheme.Typography.headline)
                    .foregroundColor(.white)

                // VIP star overlay
                if email.isVIP {
                    Image(systemName: "star.fill")
                        .font(.system(size: 12))
                        .foregroundColor(.yellow)
                        .offset(x: 12, y: -12)
                        .shadow(color: .black.opacity(0.3), radius: 2)
                }
            }

            // Email content
            VStack(alignment: .leading, spacing: TideTheme.Spacing.xs) {
                HStack {
                    // Sender
                    Text(email.from)
                        .font(email.isRead ? TideTheme.Typography.subheadline : TideTheme.Typography.subheadlineEmphasized)
                        .foregroundColor(TideTheme.textPrimary)
                        .lineLimit(1)

                    Spacer()

                    // Indicators row
                    HStack(spacing: TideTheme.Spacing.xs) {
                        // Timestamp
                        Text(email.receivedAt.relative)
                            .font(TideTheme.Typography.caption1)
                            .foregroundColor(TideTheme.textTertiary)

                        // Priority indicator
                        if email.priority >= 7 {
                            Circle()
                                .fill(TideTheme.error)
                                .frame(width: 6, height: 6)
                        }

                        // Flagged
                        if email.isFlagged {
                            Image(systemName: "flag.fill")
                                .font(.system(size: 12))
                                .foregroundColor(.orange)
                        }

                        // Attachment
                        if email.hasAttachment {
                            Image(systemName: "paperclip")
                                .font(.system(size: 12))
                                .foregroundColor(TideTheme.textSecondary)
                        }
                    }
                }

                // Subject
                Text(email.subject)
                    .font(email.isRead ? TideTheme.Typography.body : TideTheme.Typography.bodyEmphasized)
                    .foregroundColor(TideTheme.textPrimary)
                    .lineLimit(1)

                // AI Snippet/Preview
                if !email.snippet.isEmpty {
                    HStack(spacing: TideTheme.Spacing.xs) {
                        Image(systemName: "sparkles")
                            .font(.system(size: 10))
                        Text(email.snippet)
                            .font(TideTheme.Typography.caption1)
                    }
                    .foregroundStyle(TideTheme.Gradients.primary)
                    .lineLimit(2)
                }

                // Category badge
                if let category = email.category {
                    Text(category.capitalized)
                        .tideBadge(color: categoryColor(category))
                }
            }
        }
        .padding(TideTheme.Spacing.md)
        .tideCard()
        .opacity(email.isRead ? 0.75 : 1.0)
    }

    private var avatarGradient: LinearGradient {
        // Generate consistent gradient based on sender name
        let hash = email.from.hash
        let gradients = [
            TideTheme.Gradients.primary,
            TideTheme.Gradients.secondary,
            TideTheme.Gradients.purple,
            TideTheme.Gradients.sunset,
            TideTheme.Gradients.ocean
        ]
        return gradients[abs(hash) % gradients.count]
    }

    private func categoryColor(_ category: String) -> Color {
        switch category.lowercased() {
        case "urgent", "important":
            return TideTheme.error
        case "work":
            return TideTheme.primary
        case "personal":
            return TideTheme.secondary
        case "finance":
            return TideTheme.warning
        default:
            return TideTheme.textSecondary
        }
    }
}

// MARK: - Preview
#Preview {
    EnhancedEmailView()
}
