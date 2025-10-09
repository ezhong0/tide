/**
 * Event Row
 * Row component displaying a calendar event
 */

import SwiftUI

struct EventRow: View {
    let event: CalendarEvent

    var body: some View {
        HStack(spacing: Design.Spacing.sm) {
            // Time indicator
            Rectangle()
                .fill(event.color)
                .frame(width: 4)

            VStack(alignment: .leading, spacing: Design.Spacing.xs) {
                Text(event.title)
                    .font(Design.Typography.Body.medium)

                HStack(spacing: Design.Spacing.xs) {
                    Image(systemName: "clock")
                        .font(Design.Typography.Caption.regular)

                    Text(timeString(event.startTime, event.endTime))
                        .font(Design.Typography.Caption.regular)
                }
                .foregroundColor(Design.Colors.Text.secondary)

                if let location = event.location {
                    HStack(spacing: Design.Spacing.xs) {
                        Image(systemName: "location")
                            .font(Design.Typography.Caption.regular)

                        Text(location)
                            .font(Design.Typography.Caption.regular)
                    }
                    .foregroundColor(Design.Colors.Text.secondary)
                }
            }

            Spacer()

            if event.hasConflict {
                Image(systemName: "exclamationmark.triangle.fill")
                    .foregroundColor(Design.Colors.Semantic.warning)
                    .font(Design.Typography.Caption.regular)
            }
        }
        .padding(Design.Spacing.md)
        .background(Design.ColorHelpers.Background.secondary)
        .cornerRadius(Design.CornerRadius.md)
        .padding(.horizontal, Design.Spacing.md)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(accessibilityLabel)
        .accessibilityHint("Tap to view event details")
        .accessibilityValue(accessibilityValue)
    }

    private var accessibilityLabel: String {
        var label = event.title
        if let location = event.location {
            label += ", at \(location)"
        }
        return label
    }

    private var accessibilityValue: String {
        var value = timeString(event.startTime, event.endTime)
        if event.hasConflict {
            value += ", has scheduling conflict"
        }
        return value
    }

    private func timeString(_ start: Date, _ end: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return "\(formatter.string(from: start)) - \(formatter.string(from: end))"
    }
}
