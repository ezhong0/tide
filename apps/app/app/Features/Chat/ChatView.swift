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
                        LazyVStack(spacing: 16) {
                            // Empty state
                            if tide.currentConversation?.messages.isEmpty == true {
                                EmptyChatState()
                                    .padding(.top, 60)
                            }

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

                // Error message
                if let error = tide.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                        .padding(.horizontal)
                        .padding(.vertical, 8)
                        .background(TideTheme.error.opacity(0.1))
                }

                // Input area
                HStack(spacing: 12) {
                    TextField("Ask about your emails, calendar, tasks...", text: $messageText, axis: .vertical)
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
            .navigationTitle("Chat")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Clear", role: .destructive) {
                        tide.clearCurrentConversation()
                    }
                    .font(.callout)
                }
            }
        }
    }

    private func sendMessage() {
        guard !messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }

        let text = messageText
        messageText = ""

        _Concurrency.Task {
            _ = await tide.sendMessage(text)
        }
    }
}

// MARK: - Empty Chat State
struct EmptyChatState: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "bubble.left.and.bubble.right")
                .font(.system(size: 48))
                .foregroundColor(TideTheme.textTertiary)

            Text("Ask Tide Anything")
                .font(TideTheme.Typography.title3)
                .fontWeight(.semibold)

            VStack(alignment: .leading, spacing: 8) {
                ExamplePrompt(text: "Show me urgent emails")
                ExamplePrompt(text: "What's on my calendar today?")
                ExamplePrompt(text: "Summarize my inbox")
            }
            .padding(.top, 8)
        }
    }
}

struct ExamplePrompt: View {
    let text: String

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "sparkle")
                .font(.caption)
                .foregroundColor(TideTheme.primary)
            Text(text)
                .font(TideTheme.Typography.callout)
                .foregroundColor(TideTheme.textSecondary)
        }
    }
}

// MARK: - Message Bubble
struct MessageBubble: View {
    let message: Message

    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            if message.role == .user {
                Spacer(minLength: 50)
            }

            VStack(alignment: message.role == .user ? .trailing : .leading, spacing: 4) {
                // Message content
                Text(message.content)
                    .font(TideTheme.Typography.body)
                    .padding(.horizontal, 14)
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
                    .cornerRadius(16)
                    .shadow(
                        color: message.role == .user
                            ? Color.clear
                            : TideTheme.Shadow.small.color,
                        radius: 2,
                        y: 1
                    )

                // Timestamp
                Text(message.timeString)
                    .font(TideTheme.Typography.caption2)
                    .foregroundColor(TideTheme.textSecondary)
                    .padding(.horizontal, 4)
            }
            .frame(maxWidth: .infinity, alignment: message.role == .user ? .trailing : .leading)

            if message.role == .assistant || message.role == .system {
                Spacer(minLength: 50)
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
