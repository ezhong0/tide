/**
 * Daily Snapshot View
 * Main intelligence dashboard showing priority items, decisions, meetings, and predictions
 */

import SwiftUI

struct DailySnapshotView: View {
    @StateObject private var viewModel = DailySnapshotViewModel()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header
                if let snapshot = viewModel.snapshot {
                    HeaderView(snapshot: snapshot)
                }

                // Loading state
                if viewModel.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding()
                }

                // Priority Items
                if !viewModel.priorityItems.isEmpty {
                    SectionHeader(title: "Priority Items", icon: "star.fill")

                    ForEach(viewModel.priorityItems) { item in
                        PriorityItemCard(item: item)
                    }
                }

                // Pending Decisions
                if !viewModel.pendingDecisions.isEmpty {
                    SectionHeader(title: "Decisions Needed", icon: "questionmark.circle.fill")

                    ForEach(viewModel.pendingDecisions) { decision in
                        DecisionQueueCard(decision: decision, onAction: { action in
                            viewModel.handleDecision(decision, action: action)
                        })
                    }
                }

                // Today's Meetings
                if !viewModel.meetingPreviews.isEmpty {
                    SectionHeader(title: "Today's Meetings", icon: "calendar")

                    ForEach(viewModel.meetingPreviews) { meeting in
                        MeetingBriefCard(meeting: meeting)
                    }
                }

                // Predictions
                if !viewModel.predictions.isEmpty {
                    SectionHeader(title: "Tide Suggests", icon: "sparkles")

                    ForEach(viewModel.predictions) { prediction in
                        PredictiveActionCard(
                            prediction: prediction,
                            onAccept: { viewModel.acceptPrediction(prediction) },
                            onDismiss: { viewModel.dismissPrediction(prediction) }
                        )
                    }
                }

                // Empty state
                if !viewModel.isLoading && viewModel.isEmpty {
                    DashboardEmptyStateView()
                }
            }
            .padding()
        }
        .navigationTitle("Dashboard")
        .navigationBarTitleDisplayMode(.large)
        .refreshable {
            await viewModel.refresh()
        }
        .task {
            await viewModel.loadSnapshot()
        }
        .alert("Error", isPresented: $viewModel.showError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(viewModel.errorMessage)
        }
    }
}

// MARK: - Header View

struct HeaderView: View {
    let snapshot: DailySnapshot

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(greeting)
                .font(.title2)
                .fontWeight(.semibold)

            Text(dayDescription)
                .font(.body)
                .foregroundColor(.secondary)

            HStack(spacing: 16) {
                StatBadge(
                    icon: "envelope.fill",
                    count: snapshot.priorityItems.filter { $0.type == .email }.count,
                    label: "Urgent"
                )

                StatBadge(
                    icon: "calendar",
                    count: snapshot.meetingPreviews.count,
                    label: "Meetings"
                )

                StatBadge(
                    icon: "checkmark.circle.fill",
                    count: snapshot.predictions.count,
                    label: "Suggestions"
                )
            }
        }
        .padding(.vertical)
    }

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        if hour < 12 {
            return "Good morning"
        } else if hour < 18 {
            return "Good afternoon"
        } else {
            return "Good evening"
        }
    }

    private var dayDescription: String {
        let itemCount = snapshot.priorityItems.count
        if itemCount == 0 {
            return "You're all caught up!"
        } else if itemCount < 5 {
            return "You have a lighter day ahead."
        } else {
            return "You have a busy day ahead."
        }
    }
}

struct StatBadge: View {
    let icon: String
    let count: Int
    let label: String

    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.caption)
            Text("\(count)")
                .fontWeight(.semibold)
            Text(label)
                .font(.caption)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(Color.tideSurface)
        .cornerRadius(12)
    }
}

// MARK: - Section Header

struct SectionHeader: View {
    let title: String
    let icon: String

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .foregroundColor(.tidePrimary)
            Text(title)
                .font(.headline)
        }
        .padding(.top, 8)
    }
}

// MARK: - Priority Item Card

struct PriorityItemCard: View {
    let item: PriorityItem

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: item.urgency.icon)
                    .foregroundColor(urgencyColor)

                VStack(alignment: .leading, spacing: 4) {
                    Text(item.title)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .lineLimit(2)

                    Text(item.description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                }

                Spacer()

                if let deadline = item.deadline {
                    VStack(alignment: .trailing, spacing: 2) {
                        Image(systemName: "clock")
                            .font(.caption)
                        Text(deadline.timeAgo)
                            .font(.caption2)
                    }
                    .foregroundColor(.secondary)
                }
            }

            HStack(spacing: 8) {
                TypeBadge(type: item.type)

                Spacer()

                Button("View") {
                    // Navigate to item
                }
                .font(.caption)
                .buttonStyle(.bordered)
            }
        }
        .padding()
        .background(Color.tideSurface)
        .cornerRadius(12)
    }

    private var urgencyColor: Color {
        switch item.urgency {
        case .low: return .gray
        case .medium: return .blue
        case .high: return .orange
        case .critical: return .red
        }
    }
}

struct TypeBadge: View {
    let type: PriorityItem.ItemType

    var body: some View {
        Text(type.rawValue.capitalized)
            .font(.caption2)
            .fontWeight(.medium)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(Color.blue.opacity(0.1))
            .foregroundColor(.blue)
            .cornerRadius(6)
    }
}

// MARK: - Decision Queue Card

struct DecisionQueueCard: View {
    let decision: PendingDecision
    let onAction: (String) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "questionmark.circle.fill")
                    .foregroundColor(.orange)

                VStack(alignment: .leading, spacing: 4) {
                    Text(decision.title)
                        .font(.subheadline)
                        .fontWeight(.semibold)

                    if let requester = decision.requester {
                        Text("From: \(requester.name)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Spacer()
            }

            Text(decision.description)
                .font(.caption)
                .foregroundColor(.secondary)
                .lineLimit(3)

            if let recommendation = decision.recommendation {
                RecommendationView(recommendation: recommendation)
            }

            HStack(spacing: 12) {
                Button("Approve") { onAction("approve") }
                    .buttonStyle(.borderedProminent)

                Button("Decline") { onAction("decline") }
                    .buttonStyle(.bordered)

                Button("Discuss") { onAction("discuss") }
                    .buttonStyle(.borderless)
            }
            .font(.caption)
        }
        .padding()
        .background(Color.tideSurface)
        .cornerRadius(12)
    }
}

struct RecommendationView: View {
    let recommendation: AIRecommendation

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Image(systemName: "sparkles")
                    .font(.caption)
                Text("Tide recommends: \(recommendation.recommendation.rawValue.capitalized)")
                    .font(.caption)
                    .fontWeight(.semibold)
                Spacer()
                Text("\(Int(recommendation.confidence * 100))% confident")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }

            Text(recommendation.reasoning)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(10)
        .background(Color.purple.opacity(0.1))
        .cornerRadius(8)
    }
}

// MARK: - Meeting Brief Card

struct MeetingBriefCard: View {
    let meeting: MeetingPreview

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "calendar")
                    .foregroundColor(.blue)

                VStack(alignment: .leading, spacing: 4) {
                    Text(meeting.title)
                        .font(.subheadline)
                        .fontWeight(.semibold)

                    Text(meeting.startTime.formatted(date: .omitted, time: .shortened))
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                if meeting.briefGenerated {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                }
            }

            if let summary = meeting.briefSummary {
                Text(summary)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
            }

            HStack {
                Text("\(meeting.attendees.count) attendees")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Spacer()

                Button(meeting.briefGenerated ? "View Brief" : "Prepare") {
                    // Navigate to brief
                }
                .font(.caption)
                .buttonStyle(.bordered)
            }
        }
        .padding()
        .background(Color.tideSurface)
        .cornerRadius(12)
    }
}

// MARK: - Predictive Action Card

struct PredictiveActionCard: View {
    let prediction: Prediction
    let onAccept: () -> Void
    let onDismiss: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "sparkles")
                    .foregroundColor(.purple)

                Text(prediction.action)
                    .font(.subheadline)
                    .fontWeight(.semibold)

                Spacer()
            }

            Text(prediction.reasoning)
                .font(.caption)
                .foregroundColor(.secondary)

            if let preview = prediction.preview {
                Text(preview)
                    .font(.caption)
                    .padding(8)
                    .background(Color.white.opacity(0.05))
                    .cornerRadius(6)
            }

            HStack {
                HStack(spacing: 4) {
                    Image(systemName: "clock")
                    Text("Saves ~\(prediction.estimatedTimeSaved) min")
                }
                .font(.caption)
                .foregroundColor(.secondary)

                Spacer()

                Button("Do It") { onAccept() }
                    .buttonStyle(.borderedProminent)
                    .font(.caption)

                Button("Not Now") { onDismiss() }
                    .buttonStyle(.bordered)
                    .font(.caption)
            }
        }
        .padding()
        .background(Color.tideSurface)
        .cornerRadius(12)
    }
}

// MARK: - Empty State

struct DashboardEmptyStateView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 60))
                .foregroundColor(.green)

            Text("All Caught Up!")
                .font(.title2)
                .fontWeight(.semibold)

            Text("You have no urgent items right now.")
                .font(.body)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
    }
}

struct DailySnapshotView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            DailySnapshotView()
        }
    }
}
