/**
 * Calendar Header
 * Header with month/year display and navigation controls
 */

import SwiftUI

struct CalendarHeader: View {
    let monthYearString: String
    let onPreviousMonth: () -> Void
    let onNextMonth: () -> Void
    let onGoToToday: () -> Void

    var body: some View {
        HStack {
            Button {
                withAnimation(Design.Animation.standard) {
                    onPreviousMonth()
                }
            } label: {
                Image(systemName: "chevron.left")
                    .font(Design.Typography.Title.bold)
                    .foregroundColor(Design.Colors.Semantic.primary)
            }
            .accessibilityLabel("Previous month")
            .accessibilityHint("Navigate to the previous month")

            Spacer()

            VStack(spacing: Design.Spacing.xxs) {
                Text(monthYearString)
                    .font(Design.Typography.Headline.bold)

                Button {
                    withAnimation(Design.Animation.standard) {
                        onGoToToday()
                    }
                } label: {
                    Text("Today")
                        .font(Design.Typography.Caption.semibold)
                        .foregroundColor(Design.Colors.Semantic.primary)
                }
                .accessibilityLabel("Go to today")
                .accessibilityHint("Returns the calendar to the current month and today's date")
            }

            Spacer()

            Button {
                withAnimation(Design.Animation.standard) {
                    onNextMonth()
                }
            } label: {
                Image(systemName: "chevron.right")
                    .font(Design.Typography.Title.bold)
                    .foregroundColor(Design.Colors.Semantic.primary)
            }
            .accessibilityLabel("Next month")
            .accessibilityHint("Navigate to the next month")
        }
        .padding(Design.Spacing.md)
    }
}
