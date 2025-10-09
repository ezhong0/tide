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
            categoryTabs

            Divider()

            // Email List with state management
            List {
                ForEach(viewModel.filteredEmails(for: selectedCategory, search: searchText)) { email in
                    EmailRow(email: email)
                        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                            Button(role: .destructive) {
                                deleteEmail(email)
                            } label: {
                                Label("Delete", systemImage: "trash")
                            }
                            .accessibilityLabel("Delete email")
                            .accessibilityHint("Double tap to permanently delete this email")

                            Button {
                                archiveEmail(email)
                            } label: {
                                Label("Archive", systemImage: "archivebox")
                            }
                            .tint(Design.Colors.Semantic.info)
                            .accessibilityLabel("Archive email")
                            .accessibilityHint("Double tap to move this email to archive")
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
                            .tint(Design.Colors.Semantic.secondary)
                            .accessibilityLabel(email.isRead ? "Mark as unread" : "Mark as read")
                            .accessibilityHint("Double tap to toggle read status")
                        }
                        .accessibilityElement(children: .combine)
                        .accessibilityLabel("Email from \(email.fromName ?? email.from), subject: \(email.subject)")
                        .accessibilityValue(email.isRead ? "Read" : "Unread")
                        .accessibilityHint("Double tap to view email details")
                }
            }
            .listStyle(.plain)
            .refreshable {
                await viewModel.loadEmails(category: selectedCategory.rawValue)
            }
            .stateContent(
                isLoading: viewModel.isLoading,
                error: viewModel.error,
                isEmpty: viewModel.filteredEmails(for: selectedCategory, search: searchText).isEmpty,
                retryAction: {
                    Task {
                        await viewModel.loadEmails(category: selectedCategory.rawValue)
                    }
                }
            ) {
                EmptyView(
                    icon: selectedCategory.icon,
                    title: selectedCategory.emptyMessage,
                    message: selectedCategory == .inbox ? "You're all caught up!" : nil
                )
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
                    .accessibilityLabel("Show filters")
                    .accessibilityHint("Double tap to open email filter options")

                    Divider()

                    Button {
                        Task {
                            await viewModel.loadEmails(category: selectedCategory.rawValue)
                        }
                    } label: {
                        Label("Refresh", systemImage: "arrow.clockwise")
                    }
                    .accessibilityLabel("Refresh emails")
                    .accessibilityHint("Double tap to reload emails from server")
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
                .accessibilityLabel("More options")
                .accessibilityHint("Double tap to show additional actions")
            }
        }
        .sheet(isPresented: $showingFilters) {
            FilterView(viewModel: viewModel)
        }
        .task {
            await viewModel.loadEmails(category: selectedCategory.rawValue)
        }
    }

    // MARK: - Category Tabs
    @ViewBuilder
    private var categoryTabs: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Design.Spacing.sm) {
                ForEach(EmailCategory.allCases, id: \.self) { category in
                    CategoryTab(
                        category: category,
                        isSelected: selectedCategory == category,
                        count: viewModel.getCategoryCount(category)
                    ) {
                        withAnimation(Design.Animation.standard) {
                            selectedCategory = category
                        }
                        Task {
                            await viewModel.loadEmails(category: category.rawValue)
                        }
                    }
                }
            }
            .padding(.horizontal, Design.Spacing.md)
            .padding(.vertical, Design.Spacing.sm)
        }
        .background(Design.Colors.Background.primary)
        .shadow(
            color: Design.Shadow.sm.color,
            radius: Design.Shadow.sm.radius,
            x: Design.Shadow.sm.x,
            y: Design.Shadow.sm.y
        )
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

// MARK: - Preview
#Preview {
    NavigationView {
        EmailInboxView()
    }
}
