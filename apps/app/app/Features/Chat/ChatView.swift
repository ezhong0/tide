import SwiftUI

struct ChatView: View {
    @EnvironmentObject var tide: TideCore
    @State private var messageText = ""
    @FocusState private var inputFocused: Bool

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Messages list
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(tide.currentConversation?.messages ?? []) { message in
                                MessageBubble(message: message)
                                    .id(message.id)
                            }

                            if tide.isProcessing {
                                TypingIndicator()
                            }
                        }
                        .padding()
                    }
                    .onChange(of: tide.currentConversation?.messages.count) { oldValue, newValue in
                        if let lastMessage = tide.currentConversation?.messages.last {
                            withAnimation {
                                proxy.scrollTo(lastMessage.id, anchor: .bottom)
                            }
                        }
                    }
                }

                // Input area
                HStack(spacing: 12) {
                    TextField("Ask Tide anything...", text: $messageText, axis: .vertical)
                        .textFieldStyle(TideInputFieldStyle())
                        .focused($inputFocused)
                        .lineLimit(1...5)
                        .submitLabel(.send)
                        .onSubmit {
                            sendMessage()
                        }

                    Button(action: sendMessage) {
                        Image(systemName: "arrow.up.circle.fill")
                            .font(.title2)
                            .foregroundColor(messageText.isEmpty ? TideTheme.textTertiary : TideTheme.primary)
                    }
                    .disabled(messageText.isEmpty || tide.isProcessing)
                }
                .padding()
                .background(TideTheme.surface)
                .shadow(color: TideTheme.Shadow.small.color, radius: TideTheme.Shadow.small.radius, y: -2)
            }
            .navigationTitle("Tide AI")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button("New Conversation") {
                            _ = tide.createConversation()
                        }
                        Button("Clear Chat", role: .destructive) {
                            tide.clearCurrentConversation()
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
        }
    }

    private func sendMessage() {
        guard !messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }

        let text = messageText
        messageText = ""

        Task {
            _ = await tide.sendMessage(text)
        }
    }
}

// MARK: - Message Bubble
struct MessageBubble: View {
    let message: Message

    var body: some View {
        HStack {
            if message.role == .user {
                Spacer(minLength: 60)
            }

            VStack(alignment: message.role == .user ? .trailing : .leading, spacing: 4) {
                // Action preview card
                if let actionPreview = message.actionPreview {
                    ActionCard(action: actionPreview)
                } else {
                    // Regular message bubble
                    Text(message.content)
                        .font(TideTheme.Typography.body)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(
                            message.role == .user
                                ? TideTheme.primary
                                : TideTheme.surface
                        )
                        .foregroundColor(
                            message.role == .user
                                ? .white
                                : TideTheme.textPrimary
                        )
                        .cornerRadius(18)
                        .shadow(
                            color: message.role == .user
                                ? Color.clear
                                : TideTheme.Shadow.small.color,
                            radius: 2,
                            y: 1
                        )
                }

                // Suggestion chips
                if let suggestions = message.suggestions {
                    SuggestionChips(suggestions: suggestions)
                }

                // Timestamp
                Text(message.timeString)
                    .font(TideTheme.Typography.caption2)
                    .foregroundColor(TideTheme.textSecondary)
            }
            .frame(maxWidth: 280, alignment: message.role == .user ? .trailing : .leading)

            if message.role == .assistant || message.role == .system {
                Spacer(minLength: 60)
            }
        }
    }
}

// MARK: - Action Card
struct ActionCard: View {
    let action: ActionPreview

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(action.title)
                        .font(TideTheme.Typography.headline)
                        .foregroundColor(TideTheme.textPrimary)

                    Text(action.description)
                        .font(TideTheme.Typography.footnote)
                        .foregroundColor(TideTheme.textSecondary)
                }

                Spacer()

                Image(systemName: actionIcon(for: action.actionType))
                    .font(.title2)
                    .foregroundColor(TideTheme.primary)
            }

            if action.requiresConfirmation {
                HStack {
                    Button("Confirm") {
                        // TODO: Handle confirmation
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(TideTheme.primary)

                    Button("Cancel") {
                        // TODO: Handle cancellation
                    }
                    .buttonStyle(.bordered)
                    .tint(TideTheme.textSecondary)
                }
            }
        }
        .padding()
        .background(TideTheme.surface)
        .cornerRadius(TideTheme.CornerRadius.medium)
        .shadow(color: TideTheme.Shadow.medium.color, radius: TideTheme.Shadow.medium.radius, y: 2)
    }

    private func actionIcon(for type: ActionPreview.ActionType) -> String {
        switch type {
        case .scheduleEvent:
            return "calendar.badge.plus"
        case .sendEmail:
            return "envelope.fill"
        case .createTask:
            return "checklist"
        case .updateCalendar:
            return "calendar"
        case .delegateTask:
            return "person.2.fill"
        case .analyzeDocument:
            return "doc.text.magnifyingglass"
        }
    }
}

// MARK: - Suggestion Chips
struct SuggestionChips: View {
    let suggestions: [String]
    @EnvironmentObject var tide: TideCore

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(suggestions, id: \.self) { suggestion in
                    Button(suggestion) {
                        Task {
                            await tide.sendMessage(suggestion)
                        }
                    }
                    .font(TideTheme.Typography.callout)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(TideTheme.primary.opacity(0.1))
                    .foregroundColor(TideTheme.primary)
                    .cornerRadius(16)
                }
            }
        }
    }
}

// MARK: - Typing Indicator
struct TypingIndicator: View {
    @State private var animating = false

    var body: some View {
        HStack(spacing: 4) {
            ForEach(0..<3) { index in
                Circle()
                    .fill(TideTheme.textSecondary)
                    .frame(width: 8, height: 8)
                    .scaleEffect(animating ? 1.0 : 0.5)
                    .animation(
                        Animation
                            .easeInOut(duration: 0.6)
                            .repeatForever()
                            .delay(Double(index) * 0.2),
                        value: animating
                    )
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(TideTheme.surface)
        .cornerRadius(18)
        .shadow(color: TideTheme.Shadow.small.color, radius: 2, y: 1)
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.leading, 60)
        .onAppear {
            animating = true
        }
    }
}

// MARK: - Custom Text Field Style
struct TideInputFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .font(TideTheme.Typography.body)
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(TideTheme.background)
            .cornerRadius(TideTheme.CornerRadius.large)
    }
}

// MARK: - Preview
#Preview {
    ChatView()
        .environmentObject(TideCore.shared)
}
