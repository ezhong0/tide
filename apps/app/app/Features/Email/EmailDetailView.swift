import SwiftUI

struct EmailDetailView: View {
    let email: Email
    @Environment(\.dismiss) private var dismiss
    @State private var showingCompose = false
    @State private var composeMode: EmailComposeView.ComposeMode = .reply

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header
                VStack(alignment: .leading, spacing: 12) {
                    // Subject
                    Text(email.subject)
                        .font(TideTheme.Typography.title2)
                        .fontWeight(.bold)

                    // From
                    HStack(spacing: 8) {
                        Circle()
                            .fill(priorityColor(email.priority))
                            .frame(width: 36, height: 36)
                            .overlay(
                                Text(email.from.name.prefix(1).uppercased())
                                    .font(.headline)
                                    .foregroundColor(.white)
                            )

                        VStack(alignment: .leading, spacing: 2) {
                            Text(email.from.name)
                                .font(TideTheme.Typography.headline)

                            Text(email.from.email)
                                .font(TideTheme.Typography.caption1)
                                .foregroundColor(TideTheme.textSecondary)
                        }

                        Spacer()

                        Text(email.timestamp.formatted(date: .abbreviated, time: .shortened))
                            .font(TideTheme.Typography.caption1)
                            .foregroundColor(TideTheme.textSecondary)
                    }

                    // To
                    if !email.to.isEmpty {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("To:")
                                .font(TideTheme.Typography.caption1)
                                .foregroundColor(TideTheme.textSecondary)

                            Text(email.to.map { $0.email }.joined(separator: ", "))
                                .font(TideTheme.Typography.callout)
                                .foregroundColor(TideTheme.textPrimary)
                        }
                    }

                    // AI Summary (if available)
                    if let summary = email.aiSummary {
                        HStack(spacing: 8) {
                            Image(systemName: "sparkle")
                                .foregroundColor(TideTheme.primary)
                            Text(summary)
                                .font(TideTheme.Typography.callout)
                                .foregroundColor(TideTheme.textPrimary)
                        }
                        .padding()
                        .background(TideTheme.primary.opacity(0.1))
                        .cornerRadius(TideTheme.CornerRadius.medium)
                    }
                }
                .padding()
                .background(TideTheme.surface)

                Divider()

                // Body
                VStack(alignment: .leading, spacing: 12) {
                    Text(email.body)
                        .font(TideTheme.Typography.body)
                        .foregroundColor(TideTheme.textPrimary)
                        .textSelection(.enabled)
                }
                .padding()
            }
        }
        .background(TideTheme.background)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Menu {
                    Button(action: {
                        composeMode = .reply
                        showingCompose = true
                    }) {
                        Label("Reply", systemImage: "arrowshape.turn.up.left")
                    }

                    if email.to.count > 1 {
                        Button(action: {
                            composeMode = .replyAll
                            showingCompose = true
                        }) {
                            Label("Reply All", systemImage: "arrowshape.turn.up.left.2")
                        }
                    }

                    Button(action: {
                        composeMode = .forward
                        showingCompose = true
                    }) {
                        Label("Forward", systemImage: "arrowshape.turn.up.right")
                    }

                    Divider()

                    Button(role: .destructive, action: {
                        dismiss()
                    }) {
                        Label("Delete", systemImage: "trash")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            }
        }
        .sheet(isPresented: $showingCompose) {
            EmailComposeView(
                mode: composeMode,
                originalEmail: email
            )
        }
    }

    private func priorityColor(_ priority: EmailPriority) -> Color {
        switch priority {
        case .high:
            return .red
        case .normal:
            return TideTheme.primary
        case .low:
            return TideTheme.textSecondary
        }
    }
}

// MARK: - Preview
#Preview {
    NavigationView {
        EmailDetailView(email: Email.mockEmails[0])
    }
}
