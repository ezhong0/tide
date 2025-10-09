/**
 * Date Events View
 * Displays events for a selected date
 */

import SwiftUI

struct DateEventsView: View {
    let date: Date
    let events: [CalendarEvent]
    let onAddEvent: () -> Void
    let onEventTap: (String) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: Design.Spacing.sm) {
            HStack {
                Text(dateString(date))
                    .font(Design.Typography.Headline.bold)

                Spacer()

                Button {
                    onAddEvent()
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .font(Design.Typography.Title.bold)
                        .foregroundColor(Design.Colors.Semantic.primary)
                }
                .accessibilityLabel("Add event for \(dateString(date))")
                .accessibilityHint("Creates a new event for this date")
            }
            .padding(.horizontal, Design.Spacing.md)

            if events.isEmpty {
                Text("No events")
                    .font(Design.Typography.Body.regular)
                    .foregroundColor(Design.Colors.Text.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(Design.Spacing.md)
            } else {
                ForEach(events) { event in
                    EventRow(event: event)
                        .onTapGesture {
                            onEventTap(event.id)
                        }
                }
            }
        }
        .padding(.top, Design.Spacing.md)
    }

    private func dateString(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMMM d"
        return formatter.string(from: date)
    }
}
