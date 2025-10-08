/**
 * Event Card Component
 * Reusable card for displaying calendar events
 */

import SwiftUI

struct EventCard: View {
    let event: CalendarEvent

    var body: some View {
        HStack(spacing: 12) {
            // Time indicator stripe
            Rectangle()
                .fill(event.color.color)
                .frame(width: 4)

            VStack(alignment: .leading, spacing: 6) {
                // Title
                Text(event.title)
                    .font(.callout)
                    .fontWeight(.semibold)
                    .lineLimit(2)

                // Time
                HStack(spacing: 4) {
                    Image(systemName: "clock")
                        .font(.caption2)
                        .foregroundColor(.secondary)

                    Text(timeString)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                // Location
                if let location = event.location, !location.isEmpty {
                    HStack(spacing: 4) {
                        Image(systemName: "location")
                            .font(.caption2)
                            .foregroundColor(.secondary)

                        Text(location)
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .lineLimit(1)
                    }
                }

                // Attendees count
                if let attendees = event.attendees, !attendees.isEmpty {
                    HStack(spacing: 4) {
                        Image(systemName: "person.2")
                            .font(.caption2)
                            .foregroundColor(.secondary)

                        Text("\(attendees.count) attendee\(attendees.count == 1 ? "" : "s")")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }

            Spacer()

            // Status indicators
            VStack(spacing: 8) {
                // Conflict indicator
                if event.hasConflict {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundColor(.orange)
                        .font(.caption)
                }

                // Meeting prep indicator (1.5+ feature, keep for future)
                if event.hasPrep {
                    Image(systemName: "doc.text.fill")
                        .foregroundColor(.blue)
                        .font(.caption)
                }
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
    }

    private var timeString: String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short

        let startString = formatter.string(from: event.startTime)
        let endString = formatter.string(from: event.endTime)

        return "\(startString) - \(endString)"
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: 16) {
        EventCard(event: CalendarEvent(
            id: "1",
            title: "Team Standup",
            description: "Daily sync",
            startTime: Date(),
            endTime: Date().addingTimeInterval(1800),
            location: "Conference Room A",
            attendees: [
                Attendee(name: "John Doe", email: "john@example.com", status: .accepted),
                Attendee(name: "Jane Smith", email: "jane@example.com", status: .tentative)
            ],
            color: CodableColor(color: .blue),
            hasPrep: false,
            meetingPrep: nil
        ))

        EventCard(event: CalendarEvent(
            id: "2",
            title: "Q4 Strategy Meeting with Leadership Team",
            description: "Quarterly planning",
            startTime: Date().addingTimeInterval(3600),
            endTime: Date().addingTimeInterval(7200),
            location: "Executive Conference Room",
            attendees: [
                Attendee(name: "Sarah Chen", email: "sarah@example.com", status: .accepted),
                Attendee(name: "Mike Johnson", email: "mike@example.com", status: .accepted),
                Attendee(name: "Lisa Park", email: "lisa@example.com", status: .tentative)
            ],
            color: CodableColor(color: .purple),
            hasPrep: true,
            meetingPrep: nil
        ))

        EventCard(event: CalendarEvent(
            id: "3",
            title: "1:1 with Manager",
            description: nil,
            startTime: Date().addingTimeInterval(5400),
            endTime: Date().addingTimeInterval(7200),
            location: nil,
            attendees: [
                Attendee(name: "Alex Rodriguez", email: "alex@example.com", status: .accepted)
            ],
            color: CodableColor(color: .green),
            hasPrep: false,
            meetingPrep: nil
        ))
    }
    .padding()
}
