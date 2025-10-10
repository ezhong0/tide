import SwiftUI

struct EmailComposeView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var toRecipients: String = ""
    @State private var subject: String = ""
    @State private var body: String = ""
    @State private var isSending = false
    @State private var errorMessage: String?

    let mode: ComposeMode
    let originalEmail: Email?

    enum ComposeMode {
        case new
        case reply
        case replyAll
        case forward
    }

    init(mode: ComposeMode, originalEmail: Email?) {
        self.mode = mode
        self.originalEmail = originalEmail

        // Pre-populate fields based on mode
        switch mode {
        case .new:
            break // Empty fields

        case .reply:
            if let email = originalEmail {
                _toRecipients = State(initialValue: email.from.email)
                _subject = State(initialValue: "Re: \(email.subject)")
                _body = State(initialValue: "\n\n---\nOn \(email.timestamp.formatted()), \(email.from.name) wrote:\n\(email.body)")
            }

        case .replyAll:
            if let email = originalEmail {
                let allRecipients = ([email.from] + email.to)
                    .map { $0.email }
                    .joined(separator: ", ")
                _toRecipients = State(initialValue: allRecipients)
                _subject = State(initialValue: "Re: \(email.subject)")
                _body = State(initialValue: "\n\n---\nOn \(email.timestamp.formatted()), \(email.from.name) wrote:\n\(email.body)")
            }

        case .forward:
            if let email = originalEmail {
                _subject = State(initialValue: "Fwd: \(email.subject)")
                _body = State(initialValue: "\n\n---\nForwarded message from \(email.from.name) <\(email.from.email)>:\n\(email.body)")
            }
        }
    }

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // To field
                    VStack(alignment: .leading, spacing: 8) {
                        Text("To")
                            .font(TideTheme.Typography.caption1)
                            .foregroundColor(TideTheme.textSecondary)

                        TextField("recipient@example.com", text: $toRecipients)
                            .textFieldStyle(ComposeTextFieldStyle())
                            .keyboardType(.emailAddress)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                    }

                    // Subject field
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Subject")
                            .font(TideTheme.Typography.caption1)
                            .foregroundColor(TideTheme.textSecondary)

                        TextField("Email subject", text: $subject)
                            .textFieldStyle(ComposeTextFieldStyle())
                    }

                    // Body field
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Message")
                            .font(TideTheme.Typography.caption1)
                            .foregroundColor(TideTheme.textSecondary)

                        TextEditor(text: $body)
                            .font(TideTheme.Typography.body)
                            .frame(minHeight: 200)
                            .padding(12)
                            .background(TideTheme.surface)
                            .cornerRadius(TideTheme.CornerRadius.medium)
                            .overlay(
                                RoundedRectangle(cornerRadius: TideTheme.CornerRadius.medium)
                                    .stroke(TideTheme.textTertiary.opacity(0.2), lineWidth: 1)
                            )
                    }

                    // Error message
                    if let error = errorMessage {
                        Text(error)
                            .font(TideTheme.Typography.caption1)
                            .foregroundColor(.red)
                            .padding(.horizontal)
                            .padding(.vertical, 8)
                            .background(TideTheme.error.opacity(0.1))
                            .cornerRadius(TideTheme.CornerRadius.small)
                    }
                }
                .padding()
            }
            .background(TideTheme.background)
            .navigationTitle(navigationTitle)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .disabled(isSending)
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: sendEmail) {
                        if isSending {
                            ProgressView()
                        } else {
                            Text("Send")
                                .fontWeight(.semibold)
                        }
                    }
                    .disabled(!canSend || isSending)
                }
            }
        }
    }

    // MARK: - Computed Properties

    private var navigationTitle: String {
        switch mode {
        case .new:
            return "New Email"
        case .reply:
            return "Reply"
        case .replyAll:
            return "Reply All"
        case .forward:
            return "Forward"
        }
    }

    private var canSend: Bool {
        !toRecipients.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !subject.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !body.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    // MARK: - Actions

    private func sendEmail() {
        isSending = true
        errorMessage = nil

        _Concurrency.Task {
            do {
                try await EmailService.shared.sendEmail(
                    to: toRecipients.split(separator: ",").map { String($0).trimmingCharacters(in: .whitespaces) },
                    subject: subject,
                    body: body
                )

                // Success - dismiss the view
                await MainActor.run {
                    dismiss()
                }

            } catch {
                await MainActor.run {
                    errorMessage = "Failed to send email: \(error.localizedDescription)"
                    isSending = false
                }
                print("❌ Error sending email: \(error)")
            }
        }
    }
}

// MARK: - Custom Text Field Style
struct ComposeTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .font(TideTheme.Typography.body)
            .padding(12)
            .background(TideTheme.surface)
            .cornerRadius(TideTheme.CornerRadius.medium)
            .overlay(
                RoundedRectangle(cornerRadius: TideTheme.CornerRadius.medium)
                    .stroke(TideTheme.textTertiary.opacity(0.2), lineWidth: 1)
            )
    }
}

// MARK: - Preview
#Preview {
    EmailComposeView(mode: .new, originalEmail: nil)
}

#Preview("Reply") {
    EmailComposeView(mode: .reply, originalEmail: Email.mockEmails[0])
}
