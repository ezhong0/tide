/**
 * Actions View
 * Displays pending action suggestions with approve/reject/modify options
 */

import SwiftUI

struct ActionsView: View {
    @StateObject private var viewModel = ActionsViewModel()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header
                if !viewModel.pendingActions.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Pending Actions")
                            .font(.title2)
                            .fontWeight(.bold)

                        Text("\(viewModel.pendingActions.count) actions awaiting your approval")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding(.horizontal)
                }

                // Autonomous actions summary
                if viewModel.autonomousCount > 0 {
                    AutomatedActionsSummary(count: viewModel.autonomousCount)
                }

                // Pending actions
                if !viewModel.pendingActions.isEmpty {
                    ForEach(viewModel.pendingActions) { action in
                        ActionApprovalCard(
                            action: action,
                            onApprove: { viewModel.approve(action) },
                            onReject: { viewModel.reject(action) },
                            onModify: { viewModel.modify(action) }
                        )
                    }
                    .padding(.horizontal)
                } else if !viewModel.isLoading {
                    EmptyActionsView()
                }

                // Action history
                if !viewModel.actionHistory.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Recent Actions")
                            .font(.headline)
                            .padding(.horizontal)

                        ForEach(viewModel.actionHistory.prefix(5)) { action in
                            ActionHistoryRow(action: action, onUndo: {
                                viewModel.undo(action)
                            })
                        }
                    }
                    .padding(.top)
                }
            }
            .padding(.vertical)
        }
        .navigationTitle("Actions")
        .refreshable {
            await viewModel.refresh()
        }
        .task {
            await viewModel.loadActions()
        }
        .alert("Error", isPresented: $viewModel.showError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(viewModel.errorMessage)
        }
    }
}

// MARK: - Action Approval Card

struct ActionApprovalCard: View {
    let action: ActionSuggestion
    let onApprove: () -> Void
    let onReject: () -> Void
    let onModify: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Header
            HStack {
                Image(systemName: action.suggestionType.icon)
                    .foregroundColor(.tidePrimary)
                    .font(.title2)

                VStack(alignment: .leading, spacing: 4) {
                    Text(action.suggestionType.displayName)
                        .font(.headline)

                    if let timeSaved = action.estimatedTimeSaved {
                        HStack(spacing: 4) {
                            Image(systemName: "clock")
                                .font(.caption)
                            Text("Saves ~\(timeSaved) min")
                                .font(.caption)
                        }
                        .foregroundColor(.secondary)
                    }
                }

                Spacer()

                ConfidenceBadge(confidence: action.confidence)
            }

            // Preview
            Text(action.preview)
                .font(.body)

            // Reasoning
            if let reasoning = action.context.reasoning {
                HStack(spacing: 8) {
                    Image(systemName: "lightbulb.fill")
                        .font(.caption)
                        .foregroundColor(.yellow)

                    Text(reasoning)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(10)
                .background(Color.yellow.opacity(0.1))
                .cornerRadius(8)
            }

            // Actions
            HStack(spacing: 12) {
                Button(action: onApprove) {
                    Label("Approve", systemImage: "checkmark")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)

                Button(action: onReject) {
                    Label("Reject", systemImage: "xmark")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .tint(.red)

                Button(action: onModify) {
                    Image(systemName: "pencil")
                }
                .buttonStyle(.bordered)
            }
            .font(.subheadline)
        }
        .padding()
        .background(Color.tideSurface)
        .cornerRadius(16)
    }
}

struct ConfidenceBadge: View {
    let confidence: Double

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "sparkles")
                .font(.caption2)
            Text("\(Int(confidence * 100))%")
                .font(.caption)
                .fontWeight(.semibold)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(Color.purple.opacity(0.2))
        .foregroundColor(.purple)
        .cornerRadius(8)
    }
}

// MARK: - Automated Actions Summary

struct AutomatedActionsSummary: View {
    let count: Int

    var body: some View {
        HStack {
            Image(systemName: "bolt.fill")
                .foregroundColor(.green)

            VStack(alignment: .leading, spacing: 2) {
                Text("Handled Autonomously")
                    .font(.subheadline)
                    .fontWeight(.semibold)

                Text("\(count) actions completed automatically")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            Button("Review") {
                // Show autonomous actions
            }
            .font(.caption)
            .buttonStyle(.bordered)
        }
        .padding()
        .background(Color.green.opacity(0.1))
        .cornerRadius(12)
        .padding(.horizontal)
    }
}

// MARK: - Action History Row

struct ActionHistoryRow: View {
    let action: ActionSuggestion
    let onUndo: () -> Void

    var body: some View {
        HStack {
            Image(systemName: action.suggestionType.icon)
                .foregroundColor(.secondary)

            VStack(alignment: .leading, spacing: 2) {
                Text(action.preview)
                    .font(.subheadline)

                Text(action.createdAt.timeAgo)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            if action.status == .executed {
                Button("Undo") {
                    onUndo()
                }
                .font(.caption)
                .buttonStyle(.bordered)
            }

            StatusBadge(status: action.status)
        }
        .padding()
        .background(Color.tideSurface.opacity(0.5))
        .cornerRadius(8)
        .padding(.horizontal)
    }
}

struct StatusBadge: View {
    let status: ActionSuggestion.ActionStatus

    var body: some View {
        Text(status.rawValue.capitalized)
            .font(.caption2)
            .fontWeight(.semibold)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(backgroundColor)
            .foregroundColor(.white)
            .cornerRadius(6)
    }

    private var backgroundColor: Color {
        switch status {
        case .executed: return .green
        case .approved: return .blue
        case .rejected: return .red
        case .failed: return .red
        case .undone: return .orange
        case .pending: return .gray
        }
    }
}

// MARK: - Empty State

struct EmptyActionsView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 60))
                .foregroundColor(.green)

            Text("All Caught Up!")
                .font(.title2)
                .fontWeight(.semibold)

            Text("No pending actions right now")
                .font(.body)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
    }
}

// MARK: - View Model

@MainActor
class ActionsViewModel: ObservableObject {
    @Published var pendingActions: [ActionSuggestion] = []
    @Published var actionHistory: [ActionSuggestion] = []
    @Published var autonomousCount: Int = 0
    @Published var isLoading = false
    @Published var showError = false
    @Published var errorMessage = ""

    private let apiClient = APIClient.shared

    func loadActions() async {
        isLoading = true
        defer { isLoading = false }

        do {
            guard let userId = await getCurrentUserId() else { return }

            async let pending = apiClient.getPendingActions(userId: userId)
            async let history = apiClient.getActionHistory(userId: userId)

            pendingActions = try await pending
            actionHistory = try await history

            // Count autonomous actions from today
            let today = Calendar.current.startOfDay(for: Date())
            autonomousCount = actionHistory.filter {
                !$0.requiresApproval && $0.status == .executed &&
                Calendar.current.isDate($0.createdAt, inSameDayAs: today)
            }.count
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }

    func refresh() async {
        await loadActions()
    }

    func approve(_ action: ActionSuggestion) {
        Task {
            do {
                guard let userId = await getCurrentUserId() else { return }
                try await apiClient.approveAction(actionId: action.id, userId: userId, approved: true)
                await loadActions()
            } catch {
                errorMessage = "Failed to approve action"
                showError = true
            }
        }
    }

    func reject(_ action: ActionSuggestion) {
        Task {
            do {
                guard let userId = await getCurrentUserId() else { return }
                try await apiClient.approveAction(actionId: action.id, userId: userId, approved: false)
                await loadActions()
            } catch {
                errorMessage = "Failed to reject action"
                showError = true
            }
        }
    }

    func modify(_ action: ActionSuggestion) {
        // Show modification UI
        // For now, just approve
        approve(action)
    }

    func undo(_ action: ActionSuggestion) {
        Task {
            do {
                guard let userId = await getCurrentUserId() else { return }
                try await apiClient.undoAction(actionId: action.id, userId: userId)
                await loadActions()
            } catch {
                errorMessage = "Failed to undo action"
                showError = true
            }
        }
    }

    private func getCurrentUserId() async -> String? {
        return await SupabaseManager.shared.getCurrentUserId()
    }
}
