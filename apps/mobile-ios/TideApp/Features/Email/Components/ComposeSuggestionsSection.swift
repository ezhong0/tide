/**
 * Compose Suggestions Section Component
 * AI-powered email suggestions
 */

import SwiftUI

struct ComposeSuggestionsSection: View {
    @ObservedObject var viewModel: EmailComposeViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: Design.Spacing.sm) {
            HStack {
                Image(systemName: "sparkles")
                    .foregroundColor(Design.Colors.Semantic.info)
                Text("AI Suggestions")
                    .font(Design.Typography.Caption.regular)
                    .foregroundColor(Design.Colors.Text.secondary)
                    .textCase(.uppercase)
            }
            .padding(.horizontal, Design.Spacing.md)
            .padding(.top, Design.Spacing.sm)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Design.Spacing.sm) {
                    ForEach(viewModel.suggestions, id: \.self) { suggestion in
                        Button {
                            viewModel.applySuggestion(suggestion)
                        } label: {
                            Text(suggestion)
                                .font(Design.Typography.Body.regular)
                                .padding(.horizontal, Design.Spacing.md)
                                .padding(.vertical, Design.Spacing.xs)
                                .background(Design.Colors.Semantic.info.opacity(0.1))
                                .foregroundColor(Design.Colors.Semantic.info)
                                .cornerRadius(Design.CornerRadius.xl)
                        }
                        .accessibilityLabel("AI suggestion: \(suggestion)")
                        .accessibilityHint("Double tap to insert this suggested text into your email")
                    }
                }
                .padding(.horizontal, Design.Spacing.md)
            }
            .padding(.bottom, Design.Spacing.sm)
        }
    }
}
