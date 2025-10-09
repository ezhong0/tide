/**
 * Priority Badge Component
 * Displays email priority level
 */

import SwiftUI

struct PriorityBadge: View {
    let priority: Int

    var body: some View {
        HStack(spacing: 2) {
            Image(systemName: "exclamationmark.circle.fill")
                .font(Design.Typography.Caption.regular)
            Text("P\(priority)")
                .font(Design.Typography.Caption.medium)
        }
        .foregroundColor(Design.Colors.Semantic.error)
    }
}
