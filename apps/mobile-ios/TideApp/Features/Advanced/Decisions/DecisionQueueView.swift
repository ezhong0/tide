/**
 * Decision Queue View
 * Displays pending decisions with AI recommendations and approval options
 */

import SwiftUI

struct DecisionQueueView: View {
    @StateObject private var viewModel = DecisionQueueViewModel()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header
                if !viewModel.pendingDecisions.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Pending Decisions")
                            .font(.title2)
                            .fontWeight(.bold)

                        Text("\(viewModel.pendingDecisions.count) decisions awaiting your input")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding(.horizontal)
                }

                // Pending decisions
                if !viewModel.pendingDecisions.isEmpty {
                    ForEach(viewModel.pendingDecisions) { decision in
                        DecisionCard(
                            decision: decision,
                            onApprove: { option, reasoning in
                                viewModel.makeDecision(decision, chosenOption: option, reasoning: reasoning, status: "approved")
                            },
                            onDecline: {
                                viewModel.makeDecision(decision, chosenOption: nil, reasoning: "Declined", status: "declined")
                            },
                            onDefer: {
                                viewModel.makeDecision(decision, chosenOption: nil, reasoning: "Deferred for later", status: "deferred")
                            },
                            onDiscuss: {
                                viewModel.scheduleDiscussion(decision)
                            }
                        )
                    }
                    .padding(.horizontal)
                } else if !viewModel.isLoading {
                    EmptyDecisionsView()
                }

                // Decision history
                if !viewModel.decisionHistory.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Recent Decisions")
                            .font(.headline)
                            .padding(.horizontal)

                        ForEach(viewModel.decisionHistory.prefix(5)) { decision in
                            DecisionHistoryRow(decision: decision)
                        }
                    }
                    .padding(.top)
                }
            }
            .padding(.vertical)
        }
        .navigationTitle("Decisions")
        .refreshable {
            await viewModel.refresh()
        }
        .task {
            await viewModel.loadDecisions()
        }
        .alert("Error", isPresented: $viewModel.showError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(viewModel.errorMessage)
        }
    }
}

// MARK: - Decision Card

struct DecisionCard: View {
    let decision: Decision
    let onApprove: (String, String?) -> Void
    let onDecline: () -> Void
    let onDefer: () -> Void
    let onDiscuss: () -> Void

    @State private var showingOptions = false
    @State private var selectedOption: DecisionOption?
    @State private var reasoning = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Header
            HStack {
                Image(systemName: decision.decisionType.icon)
                    .foregroundColor(.tidePrimary)
                    .font(.title2)

                VStack(alignment: .leading, spacing: 4) {
                    Text(decision.title)
                        .font(.headline)

                    HStack(spacing: 12) {
                        Text(decision.decisionType.displayName)
                            .font(.caption)
                            .foregroundColor(.secondary)

                        UrgencyBadge(urgency: decision.urgency)
                    }
                }

                Spacer()

                if let deadline = decision.deadline {
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("Decide by")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                        Text(deadline.formatted(date: .abbreviated, time: .omitted))
                            .font(.caption)
                            .fontWeight(.semibold)
                    }
                }
            }

            // Description
            Text(decision.description)
                .font(.body)

            // Context
            if !decision.context.stakeholders.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Stakeholders")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(decision.context.stakeholders.joined(separator: ", "))
                        .font(.subheadline)
                }
            }

            if let financial = decision.context.financialImplications {
                HStack(spacing: 8) {
                    Image(systemName: "dollarsign.circle.fill")
                        .foregroundColor(.green)
                    Text("\(financial.currency) \(String(format: "%.2f", financial.amount))")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    if let desc = financial.description {
                        Text("• \(desc)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }

            Divider()

            // AI Recommendation
            if let recommendation = decision.aiRecommendation {
                AIRecommendationView(recommendation: recommendation)
            }

            // Options
            VStack(alignment: .leading, spacing: 12) {
                Text("Options")
                    .font(.subheadline)
                    .fontWeight(.semibold)

                ForEach(decision.options) { option in
                    OptionCard(
                        option: option,
                        isRecommended: option.option == decision.aiRecommendation?.recommendedOption,
                        isSelected: selectedOption?.id == option.id,
                        onSelect: { selectedOption = option }
                    )
                }
            }

            // Reasoning Input
            if selectedOption != nil {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Your Reasoning (optional)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    TextEditor(text: $reasoning)
                        .frame(height: 60)
                        .padding(8)
                        .background(Color.tideSurface.opacity(0.5))
                        .cornerRadius(8)
                }
            }

            // Actions
            HStack(spacing: 12) {
                if let selected = selectedOption {
                    Button(action: {
                        onApprove(selected.option, reasoning.isEmpty ? nil : reasoning)
                    }) {
                        Label("Approve", systemImage: "checkmark")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                } else {
                    Button(action: onDecline) {
                        Label("Decline", systemImage: "xmark")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                    .tint(.red)
                }

                Button(action: onDefer) {
                    Label("Defer", systemImage: "clock")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)

                Button(action: onDiscuss) {
                    Image(systemName: "message")
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

// MARK: - AI Recommendation View

struct AIRecommendationView: View {
    let recommendation: AIRecommendation

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "sparkles")
                    .foregroundColor(.purple)
                Text("AI Recommendation")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                Spacer()
                ConfidenceBadge(confidence: recommendation.confidence)
            }

            Text(recommendation.recommendedOption)
                .font(.body)
                .fontWeight(.semibold)

            Text(recommendation.reasoning)
                .font(.subheadline)
                .foregroundColor(.secondary)

            if let considerations = recommendation.considerations, !considerations.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Considerations")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    ForEach(considerations, id: \.self) { consideration in
                        HStack(alignment: .top, spacing: 6) {
                            Text("•")
                            Text(consideration)
                        }
                        .font(.caption)
                    }
                }
            }

            if let risks = recommendation.risks, !risks.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 4) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.caption)
                        Text("Risks")
                            .font(.caption)
                    }
                    .foregroundColor(.orange)

                    ForEach(risks, id: \.self) { risk in
                        HStack(alignment: .top, spacing: 6) {
                            Text("•")
                            Text(risk)
                        }
                        .font(.caption)
                        .foregroundColor(.secondary)
                    }
                }
            }
        }
        .padding()
        .background(Color.purple.opacity(0.1))
        .cornerRadius(12)
    }
}

// MARK: - Option Card

struct OptionCard: View {
    let option: DecisionOption
    let isRecommended: Bool
    let isSelected: Bool
    let onSelect: () -> Void

    var body: some View {
        Button(action: onSelect) {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(option.option)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    Spacer()
                    if isRecommended {
                        Text("AI Pick")
                            .font(.caption2)
                            .fontWeight(.semibold)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.purple.opacity(0.2))
                            .foregroundColor(.purple)
                            .cornerRadius(4)
                    }
                    if isSelected {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.tidePrimary)
                    }
                }

                if !option.pros.isEmpty {
                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: 4) {
                            Image(systemName: "plus.circle.fill")
                                .font(.caption2)
                                .foregroundColor(.green)
                            Text("Pros")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        ForEach(option.pros, id: \.self) { pro in
                            Text("• \(pro)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }

                if !option.cons.isEmpty {
                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: 4) {
                            Image(systemName: "minus.circle.fill")
                                .font(.caption2)
                                .foregroundColor(.red)
                            Text("Cons")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        ForEach(option.cons, id: \.self) { con in
                            Text("• \(con)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }

                HStack {
                    if let cost = option.cost {
                        Label("$\(String(format: "%.0f", cost))", systemImage: "dollarsign.circle")
                            .font(.caption2)
                    }
                    if let time = option.timeRequired {
                        Label("\(time)min", systemImage: "clock")
                            .font(.caption2)
                    }
                    Spacer()
                    Text("Feasibility: \(Int(option.feasibility * 100))%")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                .foregroundColor(.secondary)
            }
            .padding()
            .background(isSelected ? Color.tidePrimary.opacity(0.1) : Color.tideSurface.opacity(0.5))
            .cornerRadius(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(isSelected ? Color.tidePrimary : Color.clear, lineWidth: 2)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Urgency Badge

struct UrgencyBadge: View {
    let urgency: Decision.Urgency

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "exclamationmark.circle.fill")
                .font(.caption2)
            Text(urgency.displayName)
                .font(.caption)
                .fontWeight(.semibold)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(urgencyColor.opacity(0.2))
        .foregroundColor(urgencyColor)
        .cornerRadius(8)
    }

    private var urgencyColor: Color {
        switch urgency {
        case .low: return .gray
        case .medium: return .blue
        case .high: return .orange
        case .critical: return .red
        }
    }
}

// MARK: - Decision History Row

struct DecisionHistoryRow: View {
    let decision: Decision

    var body: some View {
        HStack {
            Image(systemName: decision.decisionType.icon)
                .foregroundColor(.secondary)

            VStack(alignment: .leading, spacing: 2) {
                Text(decision.title)
                    .font(.subheadline)

                if let userDecision = decision.userDecision {
                    Text("Chose: \(userDecision.chosenOption)")
                        .font(.caption)
                        .foregroundColor(.tidePrimary)
                }

                Text(decision.createdAt.timeAgo)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            DecisionStatusBadge(status: decision.status)
        }
        .padding()
        .background(Color.tideSurface.opacity(0.5))
        .cornerRadius(8)
        .padding(.horizontal)
    }
}

struct DecisionStatusBadge: View {
    let status: Decision.DecisionStatus

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
        case .approved: return .green
        case .declined: return .red
        case .deferred: return .orange
        case .discussed: return .blue
        case .pending: return .gray
        }
    }
}

// MARK: - Empty State

struct EmptyDecisionsView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 60))
                .foregroundColor(.green)

            Text("All Decisions Made!")
                .font(.title2)
                .fontWeight(.semibold)

            Text("No pending decisions right now")
                .font(.body)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
    }
}

// MARK: - View Model

@MainActor
class DecisionQueueViewModel: ObservableObject {
    @Published var pendingDecisions: [Decision] = []
    @Published var decisionHistory: [Decision] = []
    @Published var isLoading = false
    @Published var showError = false
    @Published var errorMessage = ""

    private let apiClient: APIClientProtocol
    private let authManager: AuthManagerProtocol

    init(apiClient: APIClientProtocol, authManager: AuthManagerProtocol) {
        self.apiClient = apiClient
        self.authManager = authManager
    }

    func loadDecisions() async {
        isLoading = true
        defer { isLoading = false }

        do {
            guard let userId = await getCurrentUserId() else { return }

            async let pending = apiClient.getPendingDecisions(userId: userId)
            async let history = apiClient.getDecisionHistory(userId: userId)

            pendingDecisions = try await pending
            decisionHistory = try await history
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }

    func refresh() async {
        await loadDecisions()
    }

    func makeDecision(_ decision: Decision, chosenOption: String?, reasoning: String?, status: String) {
        Task {
            do {
                guard let userId = await getCurrentUserId() else { return }
                try await apiClient.makeDecision(
                    decisionId: decision.id,
                    userId: userId,
                    chosenOption: chosenOption,
                    reasoning: reasoning,
                    status: status
                )
                await loadDecisions()
            } catch {
                errorMessage = "Failed to record decision"
                showError = true
            }
        }
    }

    func scheduleDiscussion(_ decision: Decision) {
        // TODO: Integrate with calendar service to schedule discussion
        makeDecision(decision, chosenOption: nil, reasoning: "Scheduled for discussion", status: "discussed")
    }

    private func getCurrentUserId() async -> String? {
        return authManager.currentUser?.id
    }
}
