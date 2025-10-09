/**
 * Category Badge Component
 * Displays email category with color coding
 */

import SwiftUI

struct CategoryBadge: View {
    let category: String

    var body: some View {
        Text(category.capitalized)
            .font(Design.Typography.Caption.medium)
            .padding(.horizontal, Design.Spacing.xs)
            .padding(.vertical, 2)
            .background(categoryColor.opacity(0.2))
            .foregroundColor(categoryColor)
            .cornerRadius(Design.CornerRadius.sm)
    }

    var categoryColor: Color {
        switch category.lowercased() {
        case "urgent": return .red
        case "important": return .orange
        case "normal": return .blue
        case "low": return .gray
        default: return .blue
        }
    }
}
