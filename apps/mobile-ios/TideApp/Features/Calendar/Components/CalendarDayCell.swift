/**
 * Calendar Day Cell
 * Individual day cell in the calendar grid
 */

import SwiftUI

struct CalendarDayCell: View {
    let day: CalendarDay
    let isSelected: Bool
    let isToday: Bool

    var body: some View {
        VStack(spacing: Design.Spacing.xs) {
            Text("\(day.day)")
                .font(.system(size: 16, weight: isToday ? .bold : .regular))
                .foregroundColor(textColor)
                .frame(width: 40, height: 40)
                .background(backgroundColor)
                .clipShape(Circle())

            // Event indicators (dots)
            if !day.events.isEmpty {
                HStack(spacing: Design.Spacing.xxs) {
                    ForEach(0..<min(day.events.count, 3), id: \.self) { index in
                        Circle()
                            .fill(day.events[index].color)
                            .frame(width: 4, height: 4)
                    }
                }
            }
        }
        .frame(height: 60)
        .opacity(day.isCurrentMonth ? 1.0 : 0.3)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(accessibilityLabel)
        .accessibilityHint(day.isCurrentMonth ? "Tap to view events for this day" : "")
        .accessibilityValue(accessibilityValue)
    }

    private var accessibilityLabel: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMMM d"
        let dateStr = formatter.string(from: day.date)

        if isToday {
            return "Today, \(dateStr)"
        } else if isSelected {
            return "\(dateStr), selected"
        } else {
            return dateStr
        }
    }

    private var accessibilityValue: String {
        let eventCount = day.events.count
        if eventCount == 0 {
            return "No events"
        } else if eventCount == 1 {
            return "1 event"
        } else {
            return "\(eventCount) events"
        }
    }

    private var textColor: Color {
        if isSelected {
            return .white
        } else if isToday {
            return Design.Colors.Semantic.primary
        } else {
            return Design.Colors.Text.primary
        }
    }

    private var backgroundColor: Color {
        if isSelected {
            return Design.Colors.Semantic.primary
        } else if isToday {
            return Design.Colors.Semantic.primary.opacity(0.1)
        } else {
            return .clear
        }
    }
}
