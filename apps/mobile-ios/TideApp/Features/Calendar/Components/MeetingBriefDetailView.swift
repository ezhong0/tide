/**
 * Meeting Brief Detail View
 * Detailed view of a meeting brief with all sections
 */

import SwiftUI

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
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
    }
}
