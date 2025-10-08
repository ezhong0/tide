/**
 * Automated Email Actions View
 * Shows what the AI has handled autonomously and allows review/undo
 */

import SwiftUI

struct AutomatedEmailActionsView: View {
    @StateObject private var viewModel = AutomatedEmailActionsViewModel()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Summary Card
                if let summary = viewModel.summary {
                    ActionsSummaryCard(
                        summary: summary,
                        onReviewAll: { viewModel.showingAllActions = true }
                    )
                }

                // Today's Actions
                if !viewModel.todayActions.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Today's Automated Actions")
                            .font(.headline)
                            .padding(.horizontal)

                        ForEach(viewModel.todayActions) { action in
                            AutomatedActionCard(
                                action: action,
                                onUndo: { viewModel.undoAction(action) },
                                onFeedback: { feedback in
                                    viewModel.provideFeedback(action, feedback: feedback)
                                }
                            )
                        }
                    }
                }

                // This Week's Actions
                if !viewModel.weekActions.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("This Week")
                            .font(.headline)
                            .padding(.horizontal)

                        ForEach(viewModel.weekActions.prefix(5)) { action in
                            AutomatedActionCard(
                                action: action,
                                onUndo: { viewModel.undoAction(action) },
                                onFeedback: { feedback in
                                    viewModel.provideFeedback(action, feedback: feedback)
                                }
                            )
                        }

                        if viewModel.weekActions.count > 5 {
                            Button("Show All (\(viewModel.weekActions.count))") {
                                viewModel.showingAllActions = true
                            }
                            .font(.subheadline)
                            .padding(.horizontal)
                        }
                    }
                }

                // Empty State
                if viewModel.todayActions.isEmpty && viewModel.weekActions.isEmpty && !viewModel.isLoading {
                    EmptyAutomatedActionsView()
                }

                // Learning Insights
                if !viewModel.learningInsights.isEmpty {
                    LearningInsightsCard(insights: viewModel.learningInsights)
                }
            }
            .padding(.vertical)
        }
        .navigationTitle("Automated Actions")
        .refreshable {
            await viewModel.refresh()
        }
        .task {
            await viewModel.loadActions()
        }
        .sheet(isPresented: $viewModel.showingAllActions) {
            AllAutomatedActionsView(actions: viewModel.allActions)
        }
        .alert("Action Undone", isPresented: $viewModel.showUndoSuccess) {
            Button("OK", role: .cancel) { }
        } message: {
            Text("The action has been reversed")
        }
        .alert("Error", isPresented: $viewModel.showError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(viewModel.errorMessage)
        }
    }
}

// MARK: - Actions Summary Card

struct ActionsSummaryCard: View {
    let summary: ActionsSummary
    let onReviewAll: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Image(systemName: "sparkles")
                    .font(.title2)
                    .foregroundColor(.purple)

                VStack(alignment: .leading, spacing: 4) {
                    Text("AI Handled")
                        .font(.headline)
                    Text("\(summary.totalCount) emails today")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }

                Spacer()

                Button("Review") {
                    onReviewAll()
                }
                .buttonStyle(.bordered)
            }

            // Category Breakdown
            VStack(spacing: 8) {
                ForEach(summary.categories) { category in
                    HStack {
                        Image(systemName: category.icon)
                            .foregroundColor(categoryColor(category.name))
                            .frame(width: 24)

                        Text(category.name)
                            .font(.subheadline)

                        Spacer()

                        Text("\(category.count)")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundColor(.secondary)
                    }
                }
            }

            // Time Saved
            HStack {
                Image(systemName: "clock.fill")
                    .foregroundColor(.green)
                Text("Estimated time saved: \(summary.timeSavedMinutes) minutes")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color.purple.opacity(0.1))
        .cornerRadius(16)
        .padding(.horizontal)
    }

    private func categoryColor(_ category: String) -> Color {
        switch category.lowercased() {
        case "archived": return .blue
        case "categorized": return .green
        case "deleted": return .red
        case "responded": return .purple
        default: return .gray
        }
    }
}

// MARK: - Automated Action Card

struct AutomatedActionCard: View {
    let action: AutomatedEmailAction
    let onUndo: () -> Void
    let onFeedback: (String) -> Void

    @State private var showingDetails = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: actionIcon)
                    .foregroundColor(actionColor)

                VStack(alignment: .leading, spacing: 2) {
                    Text(action.actionType.displayName)
                        .font(.subheadline)
                        .fontWeight(.semibold)

                    Text(action.emailSubject ?? "Email")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }

                Spacer()

                Text(action.executedAt.timeAgo)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }

            if showingDetails {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Reasoning")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(action.reasoning)
                        .font(.caption)

                    HStack(spacing: 4) {
                        Image(systemName: "sparkles")
                            .font(.caption2)
                        Text("Confidence: \(Int(action.confidence * 100))%")
                            .font(.caption2)
                    }
                    .foregroundColor(.secondary)
                }
                .padding(.top, 4)
            }

            // Actions
            HStack(spacing: 12) {
                Button(showingDetails ? "Hide" : "Details") {
                    withAnimation {
                        showingDetails.toggle()
                    }
                }
                .font(.caption)
                .buttonStyle(.bordered)

                if action.userFeedback == nil {
                    HStack(spacing: 8) {
                        Button(action: { onFeedback("approved") }) {
                            HStack(spacing: 4) {
                                Image(systemName: "hand.thumbsup")
                                Text("Good")
                            }
                        }
                        .font(.caption)
                        .buttonStyle(.bordered)
                        .tint(.green)

                        Button(action: { onFeedback("rejected") }) {
                            HStack(spacing: 4) {
                                Image(systemName: "hand.thumbsdown")
                                Text("Bad")
                            }
                        }
                        .font(.caption)
                        .buttonStyle(.bordered)
                        .tint(.red)
                    }
                }

                Spacer()

                if action.undoneAt == nil && action.canUndo {
                    Button("Undo") {
                        onUndo()
                    }
                    .font(.caption)
                    .buttonStyle(.bordered)
                    .tint(.orange)
                }
            }

            if let feedback = action.userFeedback {
                FeedbackBadge(feedback: feedback)
            }
        }
        .padding()
        .background(Color.tideSurface)
        .cornerRadius(12)
        .padding(.horizontal)
    }

    private var actionIcon: String {
        switch action.actionType {
        case .archive: return "archivebox.fill"
        case .categorize: return "folder.fill"
        case .delete: return "trash.fill"
        case .respond: return "arrowshape.turn.up.left.fill"
        case .forward: return "arrowshape.turn.up.right.fill"
        case .flag: return "flag.fill"
        case .delegate: return "person.2.fill"
        }
    }

    private var actionColor: Color {
        switch action.actionType {
        case .archive: return .blue
        case .categorize: return .green
        case .delete: return .red
        case .respond, .forward: return .purple
        case .flag: return .orange
        case .delegate: return .indigo
        }
    }
}

// MARK: - Learning Insights Card

struct LearningInsightsCard: View {
    let insights: [LearningInsight]

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Image(systemName: "brain.head.profile")
                    .foregroundColor(.blue)
                Text("Learning Insights")
                    .font(.headline)
            }

            ForEach(insights) { insight in
                HStack(alignment: .top, spacing: 12) {
                    Image(systemName: insight.icon)
                        .foregroundColor(.blue)
                        .frame(width: 24)

                    VStack(alignment: .leading, spacing: 4) {
                        Text(insight.title)
                            .font(.subheadline)
                            .fontWeight(.semibold)

                        Text(insight.description)
                            .font(.caption)
                            .foregroundColor(.secondary)

                        if let accuracy = insight.accuracy {
                            Text("Accuracy: \(Int(accuracy * 100))%")
                                .font(.caption2)
                                .foregroundColor(.green)
                        }
                    }

                    Spacer()
                }
            }
        }
        .padding()
        .background(Color.blue.opacity(0.1))
        .cornerRadius(12)
        .padding(.horizontal)
    }
}

// MARK: - Supporting Views

struct FeedbackBadge: View {
    let feedback: String

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: feedback == "approved" ? "checkmark.circle.fill" : "xmark.circle.fill")
                .font(.caption2)
            Text(feedback == "approved" ? "Helpful" : "Not helpful")
                .font(.caption2)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(feedback == "approved" ? Color.green.opacity(0.2) : Color.red.opacity(0.2))
        .foregroundColor(feedback == "approved" ? .green : .red)
        .cornerRadius(6)
    }
}

struct EmptyAutomatedActionsView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "tray.fill")
                .font(.system(size: 60))
                .foregroundColor(.secondary)

            Text("No Automated Actions Yet")
                .font(.title3)
                .fontWeight(.semibold)

            Text("The AI will start handling routine emails autonomously")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
        .padding(.horizontal)
    }
}

// MARK: - All Actions Sheet

struct AllAutomatedActionsView: View {
    let actions: [AutomatedEmailAction]
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            List(actions) { action in
                AutomatedActionRow(action: action)
            }
            .navigationTitle("All Automated Actions")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

struct AutomatedActionRow: View {
    let action: AutomatedEmailAction

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(action.actionType.displayName)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                Spacer()
                Text(action.executedAt.formatted(date: .abbreviated, time: .shortened))
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            if let subject = action.emailSubject {
                Text(subject)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
}

// MARK: - Models

struct AutomatedEmailAction: Codable, Identifiable {
    let id: String
    let emailId: String
    let emailSubject: String?
    let actionType: ActionType
    let reasoning: String
    let confidence: Double
    let executedAt: Date
    let undoneAt: Date?
    let userFeedback: String?

    var canUndo: Bool {
        actionType != .delete && undoneAt == nil
    }

    enum ActionType: String, Codable {
        case archive
        case respond
        case forward
        case categorize
        case flag
        case delete
        case delegate

        var displayName: String {
            switch self {
            case .archive: return "Archived"
            case .respond: return "Responded"
            case .forward: return "Forwarded"
            case .categorize: return "Categorized"
            case .flag: return "Flagged"
            case .delete: return "Deleted"
            case .delegate: return "Delegated"
            }
        }
    }
}

struct ActionsSummary: Codable {
    let totalCount: Int
    let timeSavedMinutes: Int
    let categories: [ActionCategory]

    struct ActionCategory: Codable, Identifiable {
        let name: String
        let count: Int
        let icon: String

        var id: String { name }
    }
}

struct LearningInsight: Codable, Identifiable {
    let id: String
    let title: String
    let description: String
    let icon: String
    let accuracy: Double?
}

// MARK: - View Model

@MainActor
class AutomatedEmailActionsViewModel: ObservableObject {
    @Published var todayActions: [AutomatedEmailAction] = []
    @Published var weekActions: [AutomatedEmailAction] = []
    @Published var allActions: [AutomatedEmailAction] = []
    @Published var summary: ActionsSummary?
    @Published var learningInsights: [LearningInsight] = []
    @Published var isLoading = false
    @Published var showError = false
    @Published var showUndoSuccess = false
    @Published var showingAllActions = false
    @Published var errorMessage = ""

    private let apiClient = APIClient.shared

    func loadActions() async {
        isLoading = true
        defer { isLoading = false }

        do {
            guard let userId = await getCurrentUserId() else { return }

            async let actionsTask = apiClient.getAutomatedEmailActions(userId: userId)
            async let summaryTask = apiClient.getAutomatedActionsSummary(userId: userId)
            async let insightsTask = apiClient.getLearningInsights(userId: userId)

            allActions = try await actionsTask
            summary = try? await summaryTask
            learningInsights = try? await insightsTask ?? []

            // Filter by date
            let today = Date().startOfDay()
            let weekAgo = today.adding(.day, value: -7)

            todayActions = allActions.filter {
                $0.executedAt.isSameDay(as: today)
            }

            weekActions = allActions.filter {
                $0.executedAt >= weekAgo && !$0.executedAt.isSameDay(as: today)
            }
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }

    func refresh() async {
        await loadActions()
    }

    func undoAction(_ action: AutomatedEmailAction) {
        Task {
            do {
                guard let userId = await getCurrentUserId() else { return }
                try await apiClient.undoAutomatedAction(actionId: action.id, userId: userId)
                showUndoSuccess = true
                await loadActions()
            } catch {
                errorMessage = "Failed to undo action"
                showError = true
            }
        }
    }

    func provideFeedback(_ action: AutomatedEmailAction, feedback: String) {
        Task {
            do {
                guard let userId = await getCurrentUserId() else { return }
                try await apiClient.provideActionFeedback(
                    actionId: action.id,
                    userId: userId,
                    feedback: feedback
                )
                await loadActions()
            } catch {
                errorMessage = "Failed to record feedback"
                showError = true
            }
        }
    }

    private func getCurrentUserId() async -> String? {
        return await SupabaseManager.shared.getCurrentUserId()
    }
}
