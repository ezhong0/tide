/**
 * Conversation History View
 * Displays past chat conversations with search and delete functionality
 */

import SwiftUI

struct ConversationHistoryView: View {
    @StateObject private var viewModel: ConversationHistoryViewModel
    @Environment(\.dismiss) private var dismiss

    init(dependencies: DependencyContainer) {
        _viewModel = StateObject(wrappedValue: ConversationHistoryViewModel(
            apiClient: dependencies.apiClient,
            authManager: dependencies.authManager
        ))
    }

    var body: some View {
        VStack(spacing: 0) {
            // Search bar
            searchBar

            // Conversation list
            if viewModel.isLoading && viewModel.conversations.isEmpty {
                LoadingView()
            } else if viewModel.conversations.isEmpty {
                EmptyStateView(
                    icon: "message",
                    title: "No Conversations",
                    message: "Your past conversations will appear here.",
                    actionTitle: "Start Chatting",
                    action: { dismiss() }
                )
            } else {
                conversationList
            }
        }
        .navigationTitle("Conversations")
        .navigationBarTitleDisplayMode(.large)
        .errorAlert(error: $viewModel.error, showError: $viewModel.showError)
        .task {
            await viewModel.loadConversations()
        }
    }

    // MARK: - Search Bar

    private var searchBar: some View {
        HStack(spacing: Design.Spacing.sm) {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.tideSecondaryText)

            TextField("Search conversations", text: $viewModel.searchQuery)
                .font(.tideBodyMedium)
                .textFieldStyle(.plain)

            if !viewModel.searchQuery.isEmpty {
                Button(action: { viewModel.searchQuery = "" }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.tideSecondaryText)
                }
            }
        }
        .padding(Design.Spacing.md)
        .background(Color.tideSurface)
        .cornerRadius(12)
        .padding(.horizontal, Design.Spacing.md)
        .padding(.vertical, Design.Spacing.sm)
    }

    // MARK: - Conversation List

    private var conversationList: some View {
        ScrollView {
            LazyVStack(spacing: Design.Spacing.md) {
                ForEach(viewModel.filteredConversations) { conversation in
                    ConversationRow(conversation: conversation)
                        .onTapGesture {
                            viewModel.selectConversation(conversation)
                            dismiss()
                        }
                        .contextMenu {
                            Button(role: .destructive) {
                                viewModel.deleteConversation(conversation)
                            } label: {
                                Label("Delete", systemImage: "trash")
                            }
                        }
                }
            }
            .padding(Design.Spacing.md)
        }
        .refreshable {
            await viewModel.loadConversations()
        }
    }
}

// MARK: - Conversation Row

struct ConversationRow: View {
    let conversation: Conversation

    var body: some View {
        HStack(spacing: Design.Spacing.md) {
            // Icon
            Circle()
                .fill(Color.tidePrimary.opacity(0.1))
                .frame(width: 50, height: 50)
                .overlay(
                    Image(systemName: "message.fill")
                        .foregroundColor(.tidePrimary)
                )

            // Content
            VStack(alignment: .leading, spacing: Design.Spacing.xs) {
                Text(conversation.title ?? "Untitled Conversation")
                    .font(.tideHeadlineMedium)
                    .foregroundColor(.tidePrimaryText)
                    .lineLimit(1)

                Text(conversation.updatedAt.timeAgo)
                    .font(.tideCaption)
                    .foregroundColor(.tideSecondaryText)
            }

            Spacer()

            // Chevron
            Image(systemName: "chevron.right")
                .foregroundColor(.tideSecondaryText)
                .font(.system(size: 14))
        }
        .padding(Design.Spacing.md)
        .background(Color.tideSurface)
        .cornerRadius(12)
    }
}

// MARK: - View Model

@MainActor
class ConversationHistoryViewModel: BaseViewModel {
    @Published var conversations: [Conversation] = []
    @Published var searchQuery = ""
    @Published var selectedConversation: Conversation?

    var filteredConversations: [Conversation] {
        if searchQuery.isEmpty {
            return conversations
        }
        return conversations.filter { conversation in
            conversation.title?.localizedCaseInsensitiveContains(searchQuery) ?? false
        }
    }

    func loadConversations() async {
        await withLoadingState {
            let conversations = try await apiClient.getConversations()
            self.conversations = conversations.sorted { $0.updatedAt > $1.updatedAt }
        }
    }

    func selectConversation(_ conversation: Conversation) {
        selectedConversation = conversation
    }

    func deleteConversation(_ conversation: Conversation) {
        // Optimistic update
        conversations.removeAll { $0.id == conversation.id }

        Task {
            // TODO: Implement delete API when backend is ready
            // try await apiClient.deleteConversation(id: conversation.id)
        }
    }
}

// MARK: - Previews

struct ConversationHistoryView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack {
            ConversationHistoryView(dependencies: .shared)
        }
    }
}
