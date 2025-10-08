/**
 * Meeting Briefs View
 * Displays AI-generated meeting preparation briefs
 */

import SwiftUI

struct MeetingBriefsView: View {
    @StateObject private var viewModel = MeetingBriefsViewModel()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Upcoming Meetings
                if !viewModel.upcomingBriefs.isEmpty {
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Upcoming Meetings")
                            .font(.title2)
                            .fontWeight(.bold)
                            .padding(.horizontal)

                        ForEach(viewModel.upcomingBriefs) { brief in
                            NavigationLink(destination: MeetingBriefDetailView(brief: brief)) {
                                MeetingBriefCard(brief: brief)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }

                // Calendar Optimizations
                if !viewModel.optimizations.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Optimization Suggestions")
                            .font(.headline)
                            .padding(.horizontal)

                        ForEach(viewModel.optimizations.prefix(3)) { optimization in
                            OptimizationCard(
                                optimization: optimization,
                                onAccept: { viewModel.acceptOptimization(optimization) },
                                onReject: { viewModel.rejectOptimization(optimization) }
                            )
                        }
                    }
                }

                // Conflicts
                if !viewModel.conflicts.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Scheduling Conflicts")
                            .font(.headline)
                            .padding(.horizontal)

                        ForEach(viewModel.conflicts) { conflict in
                            ConflictCard(
                                conflict: conflict,
                                onResolve: { option in
                                    viewModel.resolveConflict(conflict, with: option)
                                }
                            )
                        }
                    }
                }

                // Empty State
                if viewModel.upcomingBriefs.isEmpty && !viewModel.isLoading {
                    EmptyMeetingBriefsView()
                }
            }
            .padding(.vertical)
        }
        .navigationTitle("Meeting Briefs")
        .refreshable {
            await viewModel.refresh()
        }
        .task {
            await viewModel.loadBriefs()
        }
        .alert("Error", isPresented: $viewModel.showError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(viewModel.errorMessage)
        }
    }
}

// MARK: - Meeting Brief Card

struct MeetingBriefCard: View {
    let brief: MeetingBrief

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                Image(systemName: "calendar")
                    .foregroundColor(.tidePrimary)

                VStack(alignment: .leading, spacing: 4) {
                    Text(brief.title)
                        .font(.headline)
                        .foregroundColor(.primary)

                    Text(brief.timeUntilMeeting)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                ConfidenceBadge(confidence: brief.confidence)
            }

            // Quick Stats
            HStack(spacing: 16) {
                StatItem(
                    icon: "person.2.fill",
                    value: "\(brief.attendees.count)",
                    label: "attendees"
                )

                StatItem(
                    icon: "clock.fill",
                    value: "\(brief.durationMinutes)m",
                    label: "duration"
                )

                if !brief.keyDiscussionPoints.isEmpty {
                    StatItem(
                        icon: "list.bullet",
                        value: "\(brief.keyDiscussionPoints.count)",
                        label: "topics"
                    )
                }
            }
            .font(.caption)
            .foregroundColor(.secondary)

            // Preparation Status
            if !brief.preparationChecklist.isEmpty {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                        .font(.caption)
                    Text("Preparation guide available")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
        .background(Color.tideSurface)
        .cornerRadius(12)
        .padding(.horizontal)
    }
}

// MARK: - Meeting Brief Detail View

struct MeetingBriefDetailView: View {
    let brief: MeetingBrief

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Meeting Info
                MeetingInfoSection(brief: brief)

                // Attendees
                if !brief.attendeeInsights.isEmpty {
                    AttendeesSection(insights: brief.attendeeInsights)
                }

                // Key Discussion Points
                if !brief.keyDiscussionPoints.isEmpty {
                    DiscussionPointsSection(points: brief.keyDiscussionPoints)
                }

                // Suggested Time Allocation
                if !brief.suggestedTimeAllocation.isEmpty {
                    TimeAllocationSection(allocations: brief.suggestedTimeAllocation)
                }

                // Preparation Checklist
                if !brief.preparationChecklist.isEmpty {
                    PreparationChecklistSection(checklist: brief.preparationChecklist)
                }

                // Previous Meetings
                if !brief.previousMeetings.isEmpty {
                    PreviousMeetingsSection(meetings: brief.previousMeetings)
                }

                // Relevant Emails
                if !brief.relevantEmails.isEmpty {
                    RelevantEmailsSection(emails: brief.relevantEmails)
                }

                // Related Tasks
                if !brief.relatedTasks.isEmpty {
                    RelatedTasksSection(tasks: brief.relatedTasks)
                }
            }
            .padding()
        }
        .navigationTitle("Meeting Brief")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Supporting Sections

struct MeetingInfoSection: View {
    let brief: MeetingBrief

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(brief.title)
                .font(.title2)
                .fontWeight(.bold)

            HStack {
                Image(systemName: "clock")
                Text(brief.startTime.formatted(date: .abbreviated, time: .shortened))
                Text("•")
                Text("\(brief.durationMinutes) min")
            }
            .font(.subheadline)
            .foregroundColor(.secondary)

            if !brief.backgroundContext.isEmpty {
                Text(brief.backgroundContext)
                    .font(.body)
                    .padding()
                    .background(Color.tideSurface.opacity(0.5))
                    .cornerRadius(8)
            }
        }
    }
}

struct AttendeesSection: View {
    let insights: [AttendeeInsight]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Attendees")
                .font(.headline)

            ForEach(insights) { insight in
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(insight.name ?? insight.email)
                                .font(.subheadline)
                                .fontWeight(.semibold)

                            if insight.vipStatus {
                                Image(systemName: "star.fill")
                                    .font(.caption)
                                    .foregroundColor(.yellow)
                            }
                        }

                        if !insight.topics.isEmpty {
                            Text("Topics: \(insight.topics.prefix(3).joined(separator: ", "))")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }

                    Spacer()

                    Text(insight.strengthLevel)
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(strengthColor(insight.strengthColor).opacity(0.2))
                        .foregroundColor(strengthColor(insight.strengthColor))
                        .cornerRadius(6)
                }
                .padding()
                .background(Color.tideSurface.opacity(0.5))
                .cornerRadius(8)
            }
        }
    }

    private func strengthColor(_ colorName: String) -> Color {
        switch colorName {
        case "green": return .green
        case "blue": return .blue
        case "orange": return .orange
        default: return .gray
        }
    }
}

struct DiscussionPointsSection: View {
    let points: [String]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Key Discussion Points")
                .font(.headline)

            ForEach(Array(points.enumerated()), id: \.offset) { index, point in
                HStack(alignment: .top, spacing: 12) {
                    Text("\(index + 1).")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(.tidePrimary)

                    Text(point)
                        .font(.subheadline)
                }
                .padding()
                .background(Color.tideSurface.opacity(0.5))
                .cornerRadius(8)
            }
        }
    }
}

struct TimeAllocationSection: View {
    let allocations: [TimeAllocation]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Suggested Time Allocation")
                .font(.headline)

            ForEach(allocations) { allocation in
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(allocation.topic)
                            .font(.subheadline)
                            .fontWeight(.semibold)

                        Text(allocation.reasoning)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    Spacer()

                    Text("\(allocation.minutes)m")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(.tidePrimary)
                }
                .padding()
                .background(Color.tideSurface.opacity(0.5))
                .cornerRadius(8)
            }
        }
    }
}

struct PreparationChecklistSection: View {
    let checklist: [String]
    @State private var completed: Set<String> = []

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Preparation Checklist")
                .font(.headline)

            ForEach(checklist, id: \.self) { item in
                Button(action: {
                    if completed.contains(item) {
                        completed.remove(item)
                    } else {
                        completed.insert(item)
                    }
                }) {
                    HStack {
                        Image(systemName: completed.contains(item) ? "checkmark.circle.fill" : "circle")
                            .foregroundColor(completed.contains(item) ? .green : .gray)

                        Text(item)
                            .font(.subheadline)
                            .foregroundColor(.primary)
                            .strikethrough(completed.contains(item))

                        Spacer()
                    }
                    .padding()
                    .background(Color.tideSurface.opacity(0.5))
                    .cornerRadius(8)
                }
                .buttonStyle(.plain)
            }
        }
    }
}

struct PreviousMeetingsSection: View {
    let meetings: [PreviousMeeting]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Previous Meetings")
                .font(.headline)

            ForEach(meetings) { meeting in
                VStack(alignment: .leading, spacing: 8) {
                    Text(meeting.title)
                        .font(.subheadline)
                        .fontWeight(.semibold)

                    Text(meeting.date.formatted(date: .abbreviated, time: .omitted))
                        .font(.caption)
                        .foregroundColor(.secondary)

                    if !meeting.actionItems.isEmpty {
                        Text("\(meeting.actionItems.count) action items")
                            .font(.caption)
                            .foregroundColor(.orange)
                    }
                }
                .padding()
                .background(Color.tideSurface.opacity(0.5))
                .cornerRadius(8)
            }
        }
    }
}

struct RelevantEmailsSection: View {
    let emails: [RelevantEmail]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Relevant Emails")
                .font(.headline)

            ForEach(emails.prefix(3)) { email in
                VStack(alignment: .leading, spacing: 4) {
                    Text(email.subject)
                        .font(.subheadline)
                        .fontWeight(.semibold)

                    Text(email.snippet)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                }
                .padding()
                .background(Color.tideSurface.opacity(0.5))
                .cornerRadius(8)
            }
        }
    }
}

struct RelatedTasksSection: View {
    let tasks: [RelatedTask]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Related Tasks")
                .font(.headline)

            ForEach(tasks.prefix(3)) { task in
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(task.title)
                            .font(.subheadline)
                            .fontWeight(.semibold)

                        if let dueDate = task.dueDate {
                            Text("Due: \(dueDate.formatted(date: .abbreviated, time: .omitted))")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }

                    Spacer()

                    Text(task.priority)
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(priorityColor(task.priorityColor).opacity(0.2))
                        .foregroundColor(priorityColor(task.priorityColor))
                        .cornerRadius(6)
                }
                .padding()
                .background(Color.tideSurface.opacity(0.5))
                .cornerRadius(8)
            }
        }
    }

    private func priorityColor(_ colorName: String) -> Color {
        switch colorName {
        case "red": return .red
        case "orange": return .orange
        case "blue": return .blue
        default: return .gray
        }
    }
}

// MARK: - Supporting Views

struct StatItem: View {
    let icon: String
    let value: String
    let label: String

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
            Text(value)
            Text(label)
        }
    }
}

struct OptimizationCard: View {
    let optimization: CalendarOptimization
    let onAccept: () -> Void
    let onReject: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: optimization.type.icon)
                    .foregroundColor(.blue)

                Text(optimization.type.displayName)
                    .font(.subheadline)
                    .fontWeight(.semibold)

                Spacer()

                Text("Saves \(optimization.estimatedTimeSavedMinutes)min")
                    .font(.caption)
                    .foregroundColor(.green)
            }

            Text(optimization.reasoning)
                .font(.caption)
                .foregroundColor(.secondary)

            HStack(spacing: 12) {
                Button("Accept") { onAccept() }
                    .buttonStyle(.borderedProminent)
                    .font(.caption)

                Button("Dismiss") { onReject() }
                    .buttonStyle(.bordered)
                    .font(.caption)
            }
        }
        .padding()
        .background(Color.blue.opacity(0.1))
        .cornerRadius(12)
        .padding(.horizontal)
    }
}

struct ConflictCard: View {
    let conflict: MeetingConflict
    let onResolve: (ResolutionOption) -> Void

    @State private var showingOptions = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: conflict.type.icon)
                    .foregroundColor(conflictColor)

                Text(conflict.type.displayName)
                    .font(.subheadline)
                    .fontWeight(.semibold)

                Spacer()

                if conflict.autoResolvable {
                    Text("Auto-fix")
                        .font(.caption2)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.green.opacity(0.2))
                        .foregroundColor(.green)
                        .cornerRadius(4)
                }
            }

            Text(conflict.suggestedResolution)
                .font(.caption)
                .foregroundColor(.secondary)

            Button("Resolve") { showingOptions = true }
                .buttonStyle(.bordered)
                .font(.caption)
        }
        .padding()
        .background(conflictColor.opacity(0.1))
        .cornerRadius(12)
        .padding(.horizontal)
        .sheet(isPresented: $showingOptions) {
            ConflictResolutionSheet(
                conflict: conflict,
                onResolve: onResolve
            )
        }
    }

    private var conflictColor: Color {
        switch conflict.type.color {
        case "red": return .red
        case "orange": return .orange
        case "yellow": return .yellow
        case "purple": return .purple
        default: return .orange
        }
    }
}

struct ConflictResolutionSheet: View {
    let conflict: MeetingConflict
    let onResolve: (ResolutionOption) -> Void
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            List(conflict.resolutionOptions) { option in
                Button(action: {
                    onResolve(option)
                    dismiss()
                }) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(option.description)
                            .font(.subheadline)

                        Text("Impact: \(Int(option.impactScore * 100))%")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
            .navigationTitle("Resolve Conflict")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }
}

struct EmptyMeetingBriefsView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "calendar")
                .font(.system(size: 60))
                .foregroundColor(.secondary)

            Text("No Upcoming Meetings")
                .font(.title3)
                .fontWeight(.semibold)

            Text("Meeting briefs will appear here for your upcoming events")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
        .padding(.horizontal)
    }
}

// MARK: - View Model

@MainActor
class MeetingBriefsViewModel: ObservableObject {
    @Published var upcomingBriefs: [MeetingBrief] = []
    @Published var optimizations: [CalendarOptimization] = []
    @Published var conflicts: [MeetingConflict] = []
    @Published var isLoading = false
    @Published var showError = false
    @Published var errorMessage = ""

    private let apiClient = APIClient.shared

    func loadBriefs() async {
        isLoading = true
        defer { isLoading = false }

        do {
            guard let userId = await getCurrentUserId() else { return }

            async let briefsTask = apiClient.getMeetingBriefs(userId: userId)
            async let optimizationsTask = apiClient.getCalendarOptimizations(userId: userId)
            async let conflictsTask = apiClient.getMeetingConflicts(userId: userId)

            upcomingBriefs = try await briefsTask
            optimizations = try? await optimizationsTask ?? []
            conflicts = try? await conflictsTask ?? []

            // Sort briefs by start time
            upcomingBriefs.sort { $0.startTime < $1.startTime }
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }

    func refresh() async {
        await loadBriefs()
    }

    func acceptOptimization(_ optimization: CalendarOptimization) {
        Task {
            do {
                guard let userId = await getCurrentUserId() else { return }
                try await apiClient.acceptOptimization(optimizationId: optimization.id, userId: userId)
                await loadBriefs()
            } catch {
                errorMessage = "Failed to apply optimization"
                showError = true
            }
        }
    }

    func rejectOptimization(_ optimization: CalendarOptimization) {
        Task {
            do {
                guard let userId = await getCurrentUserId() else { return }
                try await apiClient.rejectOptimization(optimizationId: optimization.id, userId: userId)
                await loadBriefs()
            } catch {
                errorMessage = "Failed to dismiss optimization"
                showError = true
            }
        }
    }

    func resolveConflict(_ conflict: MeetingConflict, with option: ResolutionOption) {
        Task {
            do {
                guard let userId = await getCurrentUserId() else { return }
                try await apiClient.resolveConflict(
                    conflictId: conflict.id,
                    userId: userId,
                    resolution: option.action
                )
                await loadBriefs()
            } catch {
                errorMessage = "Failed to resolve conflict"
                showError = true
            }
        }
    }

    private func getCurrentUserId() async -> String? {
        return await SupabaseManager.shared.getCurrentUserId()
    }
}
