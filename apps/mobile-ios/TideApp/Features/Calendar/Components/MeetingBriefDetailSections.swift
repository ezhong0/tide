/**
 * Meeting Brief Detail Sections
 * Section components for the meeting brief detail view
 */

import SwiftUI

// MARK: - Meeting Info Section

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

// MARK: - Attendees Section

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

// MARK: - Discussion Points Section

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

// MARK: - Time Allocation Section

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

// MARK: - Preparation Checklist Section

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

// MARK: - Previous Meetings Section

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

// MARK: - Relevant Emails Section

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

// MARK: - Related Tasks Section

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
