/**
 * Email Inbox View
 * Browse and manage emails with categories and filters
 */

import SwiftUI

struct EmailInboxView: View {
    @StateObject private var viewModel: EmailInboxViewModel
    @EnvironmentObject var container: DependencyContainer
    @State private var selectedCategory: EmailCategory = .inbox
    @State private var searchText = ""
    @State private var showingFilters = false

    init(dependencies: DependencyContainer = .shared) {
        self._viewModel = StateObject(wrappedValue: dependencies.makeEmailInboxViewModel())
    }

    var body: some View {
        VStack(spacing: 0) {
            // Category Tabs
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(EmailCategory.allCases, id: \.self) { category in
                        CategoryTab(
                            category: category,
                            isSelected: selectedCategory == category,
                            count: viewModel.getCategoryCount(category)
                        ) {
                            selectedCategory = category
                            Task {
                                await viewModel.loadEmails(category: category.rawValue)
                            }
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.vertical, 8)
            }
            .background(Color(.systemBackground))
            .shadow(color: Color.black.opacity(0.05), radius: 2, y: 1)

            // Email List
            if viewModel.isLoading && viewModel.emails.isEmpty {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if viewModel.emails.isEmpty {
                emptyStateView
            } else {
                List {
                    ForEach(viewModel.filteredEmails(for: selectedCategory, search: searchText)) { email in
                        EmailRow(email: email)
                            .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                Button(role: .destructive) {
                                    deleteEmail(email)
                                } label: {
                                    Label("Delete", systemImage: "trash")
                                }

                                Button {
                                    archiveEmail(email)
                                } label: {
                                    Label("Archive", systemImage: "archivebox")
                                }
                                .tint(.blue)
                            }
                            .swipeActions(edge: .leading, allowsFullSwipe: true) {
                                Button {
                                    toggleRead(email)
                                } label: {
                                    Label(
                                        email.isRead ? "Unread" : "Read",
                                        systemImage: email.isRead ? "envelope.badge" : "envelope.open"
                                    )
                                }
                                .tint(.purple)
                            }
                    }
                }
                .listStyle(.plain)
                .refreshable {
                    await viewModel.loadEmails(category: selectedCategory.rawValue)
                }
            }
        }
        .navigationTitle("Inbox")
        .navigationBarTitleDisplayMode(.large)
        .searchable(text: $searchText, prompt: "Search emails...")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Menu {
                    Button {
                        showingFilters = true
                    } label: {
                        Label("Filter", systemImage: "line.3.horizontal.decrease.circle")
                    }

                    Divider()

                    Button {
                        Task {
                            await viewModel.loadEmails(category: selectedCategory.rawValue)
                        }
                    } label: {
                        Label("Refresh", systemImage: "arrow.clockwise")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            }
        }
        .sheet(isPresented: $showingFilters) {
            FilterView(viewModel: viewModel)
        }
        .task {
            await viewModel.loadEmails(category: selectedCategory.rawValue)
        }
    }

    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: selectedCategory.icon)
                .font(.system(size: 64))
                .foregroundColor(.secondary.opacity(0.5))

            Text(selectedCategory.emptyMessage)
                .font(.headline)
                .foregroundColor(.secondary)

            if selectedCategory == .inbox {
                Text("You're all caught up!")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func deleteEmail(_ email: EmailMessage) {
        Task {
            await viewModel.deleteEmail(email)
        }
    }

    private func archiveEmail(_ email: EmailMessage) {
        Task {
            await viewModel.archiveEmail(email)
        }
    }

    private func toggleRead(_ email: EmailMessage) {
        Task {
            await viewModel.toggleRead(email)
        }
    }
}

// MARK: - Email Category
enum EmailCategory: String, CaseIterable {
    case inbox = "inbox"
    case priority = "priority"
    case sent = "sent"
    case important = "important"
    case unread = "unread"
    case archived = "archived"

    var displayName: String {
        switch self {
        case .inbox: return "Inbox"
        case .priority: return "Priority"
        case .sent: return "Sent"
        case .important: return "Important"
        case .unread: return "Unread"
        case .archived: return "Archived"
        }
    }

    var icon: String {
        switch self {
        case .inbox: return "tray"
        case .priority: return "star.fill"
        case .sent: return "paperplane.fill"
        case .important: return "exclamationmark.circle.fill"
        case .unread: return "envelope.badge"
        case .archived: return "archivebox"
        }
    }

    var emptyMessage: String {
        switch self {
        case .inbox: return "No emails in inbox"
        case .priority: return "No priority emails"
        case .sent: return "No sent emails"
        case .important: return "No important emails"
        case .unread: return "No unread emails"
        case .archived: return "No archived emails"
        }
    }
}

// MARK: - Category Tab
struct CategoryTab: View {
    let category: EmailCategory
    let isSelected: Bool
    let count: Int
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 4) {
                Image(systemName: category.icon)
                    .font(.caption)

                Text(category.displayName)
                    .font(.subheadline)
                    .fontWeight(isSelected ? .semibold : .regular)

                if count > 0 {
                    Text("\(count)")
                        .font(.caption2)
                        .fontWeight(.semibold)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(isSelected ? Color.white.opacity(0.3) : Color.secondary.opacity(0.2))
                        .cornerRadius(8)
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(isSelected ? Color.blue : Color.clear)
            .foregroundColor(isSelected ? .white : .primary)
            .cornerRadius(12)
        }
    }
}

// MARK: - Email Row
struct EmailRow: View {
    let email: EmailMessage

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            // Header
            HStack {
                Text(email.fromName ?? email.from)
                    .font(.subheadline)
                    .fontWeight(email.isRead ? .regular : .semibold)
                    .lineLimit(1)

                Spacer()

                if email.isVIP {
                    Image(systemName: "star.fill")
                        .font(.caption)
                        .foregroundColor(.yellow)
                }

                Text(email.timeAgo)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            // Subject
            Text(email.subject)
                .font(.body)
                .fontWeight(email.isRead ? .regular : .semibold)
                .lineLimit(1)

            // Preview
            Text(email.bodyPreview)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .lineLimit(2)

            // Metadata
            HStack(spacing: 8) {
                if let category = email.aiCategory {
                    CategoryBadge(category: category)
                }

                if let priority = email.aiPriority, priority >= 7 {
                    PriorityBadge(priority: priority)
                }

                if email.hasAttachments {
                    Label("", systemImage: "paperclip")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                if !email.isRead {
                    Circle()
                        .fill(Color.blue)
                        .frame(width: 8, height: 8)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Email Message Model
struct EmailMessage: Identifiable {
    let id: String
    let from: String
    let fromName: String?
    let to: [String]
    let subject: String
    let body: String
    let receivedAt: Date
    var isRead: Bool // Mutable for optimistic updates
    let isVIP: Bool
    let hasAttachments: Bool
    let aiCategory: String?
    let aiPriority: Int?
    let aiSummary: String?

    var timeAgo: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: receivedAt, relativeTo: Date())
    }

    var bodyPreview: String {
        String(body.prefix(120))
    }
}

// MARK: - Category Badge
struct CategoryBadge: View {
    let category: String

    var body: some View {
        Text(category.capitalized)
            .font(.caption2)
            .fontWeight(.medium)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(categoryColor.opacity(0.2))
            .foregroundColor(categoryColor)
            .cornerRadius(4)
    }

    var categoryColor: Color {
        switch category.lowercased() {
        case "urgent": return .red
        case "important": return .orange
        case "normal": return .blue
        case "low": return .gray
        default: return .blue
        }
    }
}

// MARK: - Priority Badge
struct PriorityBadge: View {
    let priority: Int

    var body: some View {
        HStack(spacing: 2) {
            Image(systemName: "exclamationmark.circle.fill")
                .font(.caption2)
            Text("P\(priority)")
                .font(.caption2)
                .fontWeight(.medium)
        }
        .foregroundColor(.red)
    }
}

// MARK: - Filter View
struct FilterView: View {
    @ObservedObject var viewModel: EmailInboxViewModel
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationView {
            List {
                Section("Priority") {
                    Toggle("High Priority Only", isOn: $viewModel.showHighPriorityOnly)
                    Toggle("VIP Senders", isOn: $viewModel.showVIPOnly)
                }

                Section("Status") {
                    Toggle("Unread Only", isOn: $viewModel.showUnreadOnly)
                    Toggle("Has Attachments", isOn: $viewModel.showWithAttachmentsOnly)
                }

                Section("Date Range") {
                    Picker("Time Range", selection: $viewModel.selectedTimeRange) {
                        Text("All Time").tag(0)
                        Text("Today").tag(1)
                        Text("This Week").tag(7)
                        Text("This Month").tag(30)
                    }
                }
            }
            .navigationTitle("Filters")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Reset") {
                        viewModel.resetFilters()
                    }
                }
            }
        }
    }
}

// MARK: - Email Inbox ViewModel
@MainActor
class EmailInboxViewModel: ObservableObject {
    @Published var emails: [EmailMessage] = []
    @Published var isLoading = false
    @Published var error: String?

    // Filters
    @Published var showHighPriorityOnly = false
    @Published var showVIPOnly = false
    @Published var showUnreadOnly = false
    @Published var showWithAttachmentsOnly = false
    @Published var selectedTimeRange = 0

    private let apiClient: APIClientProtocol
    private let authManager: AuthManagerProtocol

    init(apiClient: APIClientProtocol, authManager: AuthManagerProtocol) {
        self.apiClient = apiClient
        self.authManager = authManager
    }

    func loadEmails(category: String) async {
        isLoading = true
        defer { isLoading = false }

        do {
            let fetchedEmails = try await apiClient.getEmails(category: category)
            // Convert Email to EmailMessage
            emails = fetchedEmails.map { email in
                EmailMessage(
                    id: email.id,
                    from: email.from,
                    fromName: extractName(from: email.from),
                    to: email.to,
                    subject: email.subject,
                    body: email.body,
                    receivedAt: email.receivedAt,
                    isRead: false, // TODO: Get from API
                    isVIP: false, // TODO: Get from API
                    hasAttachments: false, // TODO: Get from API
                    aiCategory: email.category,
                    aiPriority: email.priority,
                    aiSummary: nil
                )
            }
        } catch {
            self.error = "Failed to load emails: \(error.localizedDescription)"
        }
    }

    func filteredEmails(for category: EmailCategory, search: String) -> [EmailMessage] {
        var filtered = emails

        // Apply category filter
        switch category {
        case .inbox:
            break // Show all
        case .priority:
            filtered = filtered.filter { ($0.aiPriority ?? 0) >= 7 }
        case .sent:
            break // TODO: Filter sent emails
        case .important:
            filtered = filtered.filter { $0.aiCategory == "important" || $0.aiCategory == "urgent" }
        case .unread:
            filtered = filtered.filter { !$0.isRead }
        case .archived:
            break // TODO: Filter archived
        }

        // Apply additional filters
        if showHighPriorityOnly {
            filtered = filtered.filter { ($0.aiPriority ?? 0) >= 7 }
        }

        if showVIPOnly {
            filtered = filtered.filter { $0.isVIP }
        }

        if showUnreadOnly {
            filtered = filtered.filter { !$0.isRead }
        }

        if showWithAttachmentsOnly {
            filtered = filtered.filter { $0.hasAttachments }
        }

        // Apply time range filter
        if selectedTimeRange > 0 {
            if let cutoff = Date().safeAdd(.day, value: -selectedTimeRange) {
                filtered = filtered.filter { $0.receivedAt > cutoff }
            } else {
                print("⚠️ Failed to calculate time range cutoff for \(selectedTimeRange) days")
            }
        }

        // Apply search
        if !search.isEmpty {
            filtered = filtered.filter {
                $0.subject.localizedCaseInsensitiveContains(search) ||
                $0.from.localizedCaseInsensitiveContains(search) ||
                $0.body.localizedCaseInsensitiveContains(search)
            }
        }

        return filtered
    }

    func getCategoryCount(_ category: EmailCategory) -> Int {
        filteredEmails(for: category, search: "").count
    }

    func resetFilters() {
        showHighPriorityOnly = false
        showVIPOnly = false
        showUnreadOnly = false
        showWithAttachmentsOnly = false
        selectedTimeRange = 0
    }

    // Email Actions
    func deleteEmail(_ email: EmailMessage) async {
        do {
            // Remove optimistically
            emails.removeAll { $0.id == email.id }

            // Delete via API
            try await apiClient.deleteEmail(id: email.id)
        } catch {
            print("Error deleting email: \(error)")
            self.error = "Failed to delete email"
            // Reload to restore if needed
            // await loadEmails(category: "inbox")
        }
    }

    func archiveEmail(_ email: EmailMessage) async {
        do {
            // Remove optimistically
            emails.removeAll { $0.id == email.id }

            // Archive via API
            try await apiClient.archiveEmail(id: email.id)
        } catch {
            print("Error archiving email: \(error)")
            self.error = "Failed to archive email"
            // Reload to restore if needed
        }
    }

    func toggleRead(_ email: EmailMessage) async {
        guard let index = emails.firstIndex(where: { $0.id == email.id }) else { return }

        let wasRead = emails[index].isRead

        // Optimistic update
        emails[index].isRead = !wasRead

        // API call
        do {
            if wasRead {
                try await apiClient.markEmailUnread(id: email.id)
            } else {
                try await apiClient.markEmailRead(id: email.id)
            }
        } catch {
            print("Error toggling read status: \(error)")
            // Rollback on error
            emails[index].isRead = wasRead
        }
    }

    private func extractName(from email: String) -> String? {
        // Extract name from "Name <email@example.com>" format
        let components = email.components(separatedBy: "<")
        if components.count > 1 {
            return components[0].trimmingCharacters(in: .whitespaces)
        }
        return nil
    }
}

// MARK: - Preview
#Preview {
    NavigationView {
        EmailInboxView()
    }
}
