/**
 * Category Tab Component
 * Displays a single category tab with count
 */

import SwiftUI

struct CategoryTab: View {
    let category: EmailCategory
    let isSelected: Bool
    let count: Int
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: Design.Spacing.xxs) {
                Image(systemName: category.icon)
                    .font(Design.Typography.Caption.regular)

                Text(category.displayName)
                    .font(isSelected ? Design.Typography.Body.medium : Design.Typography.Body.regular)

                if count > 0 {
                    Text("\(count)")
                        .font(Design.Typography.Caption.semibold)
                        .padding(.horizontal, Design.Spacing.xs)
                        .padding(.vertical, 2)
                        .background(isSelected ? Color.white.opacity(0.3) : Design.ColorHelpers.Border.light)
                        .cornerRadius(Design.CornerRadius.sm)
                        .accessibilityHidden(true)
                }
            }
            .padding(.horizontal, Design.Spacing.md)
            .padding(.vertical, Design.Spacing.xs)
            .background(isSelected ? Design.Colors.Semantic.primary : Color.clear)
            .foregroundColor(isSelected ? .white : Design.Colors.Text.primary)
            .cornerRadius(Design.CornerRadius.xl)
        }
        .accessibilityLabel("\(category.displayName) category, \(count) emails")
        .accessibilityValue(isSelected ? "Selected" : "Not selected")
        .accessibilityHint("Double tap to view \(category.displayName) emails")
    }
}
