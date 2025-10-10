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
            Group {
                if isLoading && inboxData == nil {
                    ProgressView("Loading inbox...")
                } else if let data = inboxData {
                    List {
                        // Priority section
                        let priorityEmails = filteredEmails.filter { $0.priority >= 7 && !$0.isRead }
                        if !priorityEmails.isEmpty {
                            Section("Needs Your Attention") {
                                ForEach(priorityEmails, id: \.id) { email in
                                    EnhancedEmailRow(email: email)
                                }
                            }
                        }

                        // VIP section
                        let vipEmails = filteredEmails.filter { $0.isVIP && !$0.isRead }
                        if !vipEmails.isEmpty {
                            Section("From VIPs") {
                                ForEach(vipEmails, id: \.id) { email in
                                    EnhancedEmailRow(email: email)
                                }
                            }
                        }

                        // Regular inbox
                        Section("Inbox") {
                            ForEach(filteredEmails.filter { $0.priority < 7 && !$0.isVIP }, id: \.id) { email in
                                EnhancedEmailRow(email: email)
                            }
                        }

                        // Pagination
                        if data.pagination.hasMore {
                            Button("Load More") {
                                _Concurrency.Task {
                                    await loadMore()
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                        }
                    }
                    .listStyle(.insetGrouped)
                } else {
                    // Error state
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 48))
                            .foregroundColor(.orange)

                        if let error = errorMessage {
                            Text(error)
                                .font(TideTheme.Typography.body)
                                .foregroundColor(TideTheme.textSecondary)
                                .multilineTextAlignment(.center)
                        }

                        Button("Retry") {
                            _Concurrency.Task {
                                await loadInbox()
                            }
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding()
                }
            }
            .refreshable {
                await loadInbox()
            }
            .searchable(text: $searchText, prompt: "Search emails")
            .navigationTitle("Email")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Menu {
                        Button("All") { filter = "all"; _Concurrency.Task { await loadInbox() } }
                        Button("Unread") { filter = "unread"; _Concurrency.Task { await loadInbox() } }
                        Button("Flagged") { filter = "flagged"; _Concurrency.Task { await loadInbox() } }
                        Button("Priority") { filter = "priority"; _Concurrency.Task { await loadInbox() } }
                        Button("Today") { filter = "today"; _Concurrency.Task { await loadInbox() } }
                    } label: {
                        Label("Filter", systemImage: "line.3.horizontal.decrease.circle")
                    }
                }
            }
            .onAppear {
                if inboxData == nil {
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
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                // VIP badge
                if email.isVIP {
                    Image(systemName: "star.fill")
                        .font(TideTheme.Typography.caption2)
                        .foregroundColor(.yellow)
                }

                // Sender
                Text(email.from)
                    .font(TideTheme.Typography.headline)
                    .fontWeight(email.isRead ? .regular : .semibold)

                Spacer()

                // Timestamp
                Text(email.receivedAt.relative)
                    .font(TideTheme.Typography.caption1)
                    .foregroundColor(TideTheme.textSecondary)

                // Priority indicator
                if email.priority >= 7 {
                    Image(systemName: "exclamationmark.circle.fill")
                        .foregroundColor(TideTheme.error)
                }

                // Flagged
                if email.isFlagged {
                    Image(systemName: "flag.fill")
                        .foregroundColor(.orange)
                }

                // Attachment
                if email.hasAttachment {
                    Image(systemName: "paperclip")
                        .foregroundColor(TideTheme.textSecondary)
                }
            }

            // Subject
            Text(email.subject)
                .font(TideTheme.Typography.subheadline)
                .fontWeight(email.isRead ? .regular : .semibold)
                .lineLimit(1)

            // Snippet/Preview
            if !email.snippet.isEmpty {
                HStack(spacing: 4) {
                    Image(systemName: "brain.head.profile")
                        .font(TideTheme.Typography.caption2)
                    Text(email.snippet)
                        .font(TideTheme.Typography.caption1)
                }
                .foregroundColor(TideTheme.primary)
                .lineLimit(2)
            }

            // Category
            if let category = email.category {
                Text(category.capitalized)
                    .font(TideTheme.Typography.caption2)
                    .fontWeight(.medium)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(categoryColor(category).opacity(0.2))
                    .foregroundColor(categoryColor(category))
                    .cornerRadius(4)
            }
        }
        .padding(.vertical, 4)
        .opacity(email.isRead ? 0.7 : 1.0)
    }

    private func categoryColor(_ category: String) -> Color {
        switch category.lowercased() {
        case "urgent", "important":
            return .red
        case "work":
            return .blue
        case "personal":
            return .green
        case "finance":
            return .orange
        default:
            return .gray
        }
    }
}

// MARK: - Preview
#Preview {
    EnhancedEmailView()
}
