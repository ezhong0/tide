/**
 * Calendar Week Day Labels
 * Week day header labels for the calendar grid
 */

import SwiftUI

struct CalendarWeekDayLabels: View {
    private let weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    var body: some View {
        HStack(spacing: Design.Spacing.xxs) {
            ForEach(weekDays, id: \.self) { day in
                Text(day)
                    .font(Design.Typography.Caption.semibold)
                    .foregroundColor(Design.Colors.Text.secondary)
                    .frame(maxWidth: .infinity)
            }
        }
        .padding(.horizontal, Design.Spacing.md)
        .padding(.vertical, Design.Spacing.sm)
    }
}
