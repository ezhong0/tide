/**
 * Meeting Brief Card
 * Card component displaying a meeting brief summary
 */

import SwiftUI

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
