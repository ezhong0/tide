/**
 * Email Draft Selector View
 * Allows users to select from AI-generated email drafts or create custom
 */

import SwiftUI

struct EmailDraftSelectorView: View {
    let email: Email
    @StateObject private var viewModel: EmailDraftViewModel
    @Environment(\.dismiss) private var dismiss

    init(email: Email, dependencies: DependencyContainer = .shared) {
        self.email = email
        _viewModel = StateObject(wrappedValue: dependencies.makeEmailDraftViewModel(email: email))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Design.Spacing.lg) {
                // Original Email Context
                OriginalEmailCard(email: email)

                // Relationship Context (if available)
                if let relationship = viewModel.relationship {
                    RelationshipContextCard(relationship: relationship)
                }

                // Draft Options
                if !viewModel.drafts.isEmpty {
                    VStack(alignment: .leading, spacing: Design.Spacing.md) {
                        Text("Choose a Draft")
                            .font(Design.Typography.Title.bold)
                            .padding(.horizontal, Design.Spacing.md)

                        ForEach(viewModel.drafts) { draft in
                            DraftOptionCard(
                                draft: draft,
                                isSelected: viewModel.selectedDraft?.id == draft.id,
                                onSelect: { viewModel.selectDraft(draft) }
                            )
                        }
                    }
                }

                // Draft Editor
                if let selected = viewModel.selectedDraft {
                    DraftEditorCard(
                        draft: selected,
                        editedBody: $viewModel.editedBody,
                        editedSubject: $viewModel.editedSubject
                    )
                }

                // Actions
                if viewModel.selectedDraft != nil {
                    HStack(spacing: Design.Spacing.sm) {
                        Button(action: { dismiss() }) {
                            Text("Cancel")
                        }
                        .buttonStyle(SecondaryButtonStyle())

                        Button(action: { viewModel.sendEmail() }) {
                            Text("Send Email")
                        }
                        .buttonStyle(PrimaryButtonStyle(isLoading: viewModel.isSending))
                    }
                    .padding(.horizontal, Design.Spacing.md)
                }
            }
            .padding(.vertical)
        }
        .navigationTitle("Compose Reply")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.loadDrafts()
        }
        .alert("Error", isPresented: $viewModel.showError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(viewModel.errorMessage)
        }
        .alert("Email Sent", isPresented: $viewModel.showSuccess) {
            Button("OK") { dismiss() }
        } message: {
            Text("Your email has been sent successfully")
        }
    }
}

// MARK: - Original Email Card

struct OriginalEmailCard: View {
    let email: Email

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "envelope.fill")
                    .foregroundColor(.tidePrimary)
                Text("Replying to")
                    .font(Design.Typography.Body.regular)
                    .foregroundColor(.secondary)
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("From: \(email.from)")
                    .font(Design.Typography.Body.regular)

                Text("Subject: \(email.subject)")
                    .font(Design.Typography.Body.regular)
                    .fontWeight(.semibold)

                Text(email.body)
                    .font(Design.Typography.Caption.regular)
                    .foregroundColor(.secondary)
                    .lineLimit(3)
            }
        }
        .padding()
        .background(Color.tideSurface.opacity(0.5))
        .cornerRadius(Design.CornerRadius.lg)
        .padding(.horizontal)
    }
}

// MARK: - Relationship Context Card

struct RelationshipContextCard: View {
    let relationship: RelationshipIntelligence

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "person.fill")
                    .foregroundColor(.purple)
                Text("Relationship Insights")
                    .font(Design.Typography.Body.regular)
                    .fontWeight(.semibold)
            }

            HStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Strength")
                        .font(Design.Typography.Caption.regular)
                        .foregroundColor(.secondary)
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(Design.Typography.Caption.regular)
                            .foregroundColor(strengthColor)
                        Text(relationship.strengthDescription)
                            .font(Design.Typography.Caption.regular)
                            .fontWeight(.semibold)
                    }
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text("Frequency")
                        .font(Design.Typography.Caption.regular)
                        .foregroundColor(.secondary)
                    Text(relationship.interactionFrequency.capitalized)
                        .font(Design.Typography.Caption.regular)
                        .fontWeight(.semibold)
                }

                if relationship.vipStatus {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Status")
                            .font(Design.Typography.Caption.regular)
                            .foregroundColor(.secondary)
                        HStack(spacing: 4) {
                            Image(systemName: "star.circle.fill")
                                .font(Design.Typography.Caption.regular)
                                .foregroundColor(.yellow)
                            Text("VIP")
                                .font(Design.Typography.Caption.regular)
                                .fontWeight(.semibold)
                        }
                    }
                }
            }
        }
        .padding()
        .background(Color.purple.opacity(0.1))
        .cornerRadius(Design.CornerRadius.lg)
        .padding(.horizontal)
    }

    private var strengthColor: Color {
        switch relationship.strengthColor {
        case "green": return .green
        case "blue": return .blue
        case "orange": return .orange
        default: return .gray
        }
    }
}

// MARK: - Draft Option Card

struct DraftOptionCard: View {
    let draft: EmailDraft
    let isSelected: Bool
    let onSelect: () -> Void

    var body: some View {
        Button(action: onSelect) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Image(systemName: draft.version.icon)
                        .foregroundColor(.tidePrimary)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(draft.version.displayName)
                            .font(Design.Typography.Headline.semibold)
                        Text(draft.version.description)
                            .font(Design.Typography.Caption.regular)
                            .foregroundColor(.secondary)
                    }

                    Spacer()

                    if isSelected {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.tidePrimary)
                            .font(.title3)
                    }
                }

                Text(draft.body)
                    .font(Design.Typography.Body.regular)
                    .foregroundColor(.primary)
                    .lineLimit(isSelected ? nil : 3)

                HStack {
                    HStack(spacing: 4) {
                        Image(systemName: "text.word.spacing")
                            .font(.caption2)
                        Text("\(draft.wordCount) words")
                            .font(Design.Typography.Caption.regular)
                    }

                    Spacer()

                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                            .font(.caption2)
                        Text("\(draft.metadata.estimatedReadTime)s read")
                            .font(Design.Typography.Caption.regular)
                    }

                    Spacer()

                    ConfidenceBadge(confidence: draft.confidence)
                }
                .foregroundColor(.secondary)
            }
            .padding()
            .background(isSelected ? Color.tidePrimary.opacity(0.1) : Color.tideSurface)
            .cornerRadius(Design.CornerRadius.lg)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color.tidePrimary : Color.clear, lineWidth: 2)
            )
        }
        .buttonStyle(.plain)
        .padding(.horizontal)
    }
}

// MARK: - Draft Editor Card

struct DraftEditorCard: View {
    let draft: EmailDraft
    @Binding var editedBody: String
    @Binding var editedSubject: String
    @State private var isEditing = false

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Image(systemName: "pencil")
                    .foregroundColor(.tidePrimary)
                Text("Edit Draft")
                    .font(Design.Typography.Headline.semibold)
                Spacer()
                Button(isEditing ? "Done" : "Edit") {
                    isEditing.toggle()
                }
                .font(Design.Typography.Body.regular)
                .buttonStyle(.bordered)
            }

            if isEditing {
                VStack(alignment: .leading, spacing: 12) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Subject")
                            .font(Design.Typography.Caption.regular)
                            .foregroundColor(.secondary)
                        TextField("Subject", text: $editedSubject)
                            .textFieldStyle(.roundedBorder)
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        Text("Body")
                            .font(Design.Typography.Caption.regular)
                            .foregroundColor(.secondary)
                        TextEditor(text: $editedBody)
                            .frame(minHeight: 200)
                            .padding(8)
                            .background(Color.tideSurface.opacity(0.5))
                            .cornerRadius(Design.CornerRadius.md)
                    }
                }
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Subject: \(editedSubject)")
                        .font(Design.Typography.Body.regular)
                        .fontWeight(.semibold)

                    Text(editedBody)
                        .font(Design.Typography.Body.regular)
                }
            }
        }
        .padding()
        .background(Color.tideSurface.opacity(0.5))
        .cornerRadius(Design.CornerRadius.lg)
        .padding(.horizontal)
    }
}

// MARK: - View Model

@MainActor
final class EmailDraftViewModel: ObservableObject {
    @Published var drafts: [EmailDraft] = []
    @Published var selectedDraft: EmailDraft?
    @Published var relationship: RelationshipIntelligence?
    @Published var editedBody = ""
    @Published var editedSubject = ""
    @Published var isLoading = false
    @Published var isSending = false
    @Published var showError = false
    @Published var showSuccess = false
    @Published var errorMessage = ""

    private let email: Email
    private let apiClient: APIClientProtocol
    private let supabaseManager: SupabaseManagerProtocol

    init(
        email: Email,
        apiClient: APIClientProtocol,
        supabaseManager: SupabaseManagerProtocol
    ) {
        self.email = email
        self.apiClient = apiClient
        self.supabaseManager = supabaseManager
    }

    func loadDrafts() async {
        isLoading = true
        defer { isLoading = false }

        do {
            guard let userId = await getCurrentUserId() else { return }

            // Load drafts and relationship in parallel
            async let draftsTask = apiClient.generateEmailDrafts(
                emailId: email.id,
                userId: userId
            )
            async let relationshipTask = apiClient.getRelationship(
                userId: userId,
                contactEmail: email.from
            )

            drafts = try await draftsTask
            relationship = try? await relationshipTask

            // Auto-select balanced draft
            if let balanced = drafts.first(where: { $0.version == .balanced }) {
                selectDraft(balanced)
            } else if let first = drafts.first {
                selectDraft(first)
            }
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }

    func selectDraft(_ draft: EmailDraft) {
        selectedDraft = draft
        editedBody = draft.body
        editedSubject = draft.subject
    }

    func sendEmail() {
        guard let draft = selectedDraft else { return }

        Task {
            isSending = true
            defer { isSending = false }

            do {
                try await apiClient.sendEmail(
                    to: [email.from],
                    subject: editedSubject,
                    body: editedBody
                )
                showSuccess = true
            } catch {
                errorMessage = "Failed to send email"
                showError = true
            }
        }
    }

    private func getCurrentUserId() async -> String? {
        return await supabaseManager.getCurrentUserId()
    }
}
