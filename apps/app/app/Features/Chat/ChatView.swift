import SwiftUI

struct ChatView: View {
    @EnvironmentObject var tide: TideCore
    @State private var messageText = ""
    @FocusState private var inputFocused: Bool

    var body: some View {
        NavigationView {
            ZStack {
                // Subtle gradient background
                TideTheme.Gradients.subtle
                    .ignoresSafeArea()

                VStack(spacing: 0) {
                    // Messages list
                    ScrollViewReader { proxy in
                        ScrollView {
                            LazyVStack(spacing: TideTheme.Spacing.md) {
                                // Empty state
                                if tide.currentConversation?.messages.isEmpty == true {
                                    EmptyChatState()
                                        .padding(.top, 60)
                                }

                                ForEach(tide.currentConversation?.messages ?? []) { message in
                                    MessageBubble(message: message)
                                        .id(message.id)
                                        .transition(.asymmetric(
                                            insertion: .scale.combined(with: .opacity),
                                            removal: .opacity
                                        ))
                                }

                                if tide.isProcessing {
                                    TypingIndicator()
                                        .transition(.scale.combined(with: .opacity))
                                }
                            }
                            .padding(TideTheme.Spacing.md)
                        }
                        .onChange(of: tide.currentConversation?.messages.count) { oldValue, newValue in
                            if let lastMessage = tide.currentConversation?.messages.last {
                                withAnimation(TideTheme.Animation.smooth) {
                                    proxy.scrollTo(lastMessage.id, anchor: .bottom)
                                }
                            }
                        }
                    }

                    // Error message
                    if let error = tide.errorMessage {
                        HStack(spacing: TideTheme.Spacing.sm) {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .font(TideTheme.Typography.caption1)
                            Text(error)
                                .font(TideTheme.Typography.caption1)
                        }
                        .foregroundColor(TideTheme.error)
                        .padding(.horizontal, TideTheme.Spacing.md)
                        .padding(.vertical, TideTheme.Spacing.sm)
                        .background(TideTheme.errorLight.opacity(0.15))
                        .cornerRadius(TideTheme.CornerRadius.medium)
                        .padding(.horizontal, TideTheme.Spacing.md)
                        .padding(.bottom, TideTheme.Spacing.sm)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                    }

                    // Input area
                    HStack(spacing: TideTheme.Spacing.sm) {
                        TextField("Ask about your emails, calendar, tasks...", text: $messageText, axis: .vertical)
                            .font(TideTheme.Typography.body)
                            .padding(.horizontal, TideTheme.Spacing.md)
                            .padding(.vertical, TideTheme.Spacing.sm)
                            .background(TideTheme.surface)
                            .cornerRadius(TideTheme.CornerRadius.large)
                            .overlay(
                                RoundedRectangle(cornerRadius: TideTheme.CornerRadius.large)
                                    .stroke(inputFocused ? TideTheme.primary : TideTheme.border, lineWidth: inputFocused ? 2 : 1)
                            )
                            .focused($inputFocused)
                            .lineLimit(1...5)
                            .submitLabel(.send)
                            .onSubmit {
                                sendMessage()
                            }
                            .animation(TideTheme.Animation.quick, value: inputFocused)

                        // Send button with gradient
                        Button(action: sendMessage) {
                            ZStack {
                                if messageText.isEmpty || tide.isProcessing {
                                    Circle()
                                        .fill(TideTheme.border)
                                        .frame(width: 44, height: 44)
                                } else {
                                    Circle()
                                        .fill(TideTheme.Gradients.primary)
                                        .frame(width: 44, height: 44)
                                        .shadow(
                                            color: TideTheme.Shadow.primaryGlow.color,
                                            radius: 8,
                                            x: 0,
                                            y: 2
                                        )
                                }

                                Image(systemName: tide.isProcessing ? "stop.fill" : "arrow.up")
                                    .font(.system(size: 18, weight: .semibold))
                                    .foregroundColor(.white)
                            }
                        }
                        .disabled(messageText.isEmpty && !tide.isProcessing)
                        .scaleEffect((messageText.isEmpty && !tide.isProcessing) ? 1.0 : 1.0)
                        .animation(TideTheme.Animation.bouncy, value: messageText.isEmpty)
                    }
                    .padding(TideTheme.Spacing.md)
                    .background(TideTheme.surface)
                    .shadow(
                        color: TideTheme.Shadow.medium.color,
                        radius: TideTheme.Shadow.medium.radius,
                        x: 0,
                        y: -4
                    )
                }
            }
            .navigationTitle("Chat")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        tide.clearCurrentConversation()
                    }) {
                        Image(systemName: "trash")
                            .font(TideTheme.Typography.body)
                            .foregroundColor(TideTheme.error)
                    }
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
    @State private var isAnimating = false

    var body: some View {
        VStack(spacing: TideTheme.Spacing.lg) {
            // Animated icon
            ZStack {
                Circle()
                    .fill(TideTheme.Gradients.ocean)
                    .frame(width: 100, height: 100)
                    .scaleEffect(isAnimating ? 1.1 : 1.0)
                    .opacity(0.15)

                Image(systemName: "sparkles")
                    .font(.system(size: 40, weight: .semibold))
                    .foregroundStyle(TideTheme.Gradients.ocean)
            }
            .onAppear {
                withAnimation(
                    .easeInOut(duration: 2.0)
                    .repeatForever(autoreverses: true)
                ) {
                    isAnimating = true
                }
            }

            VStack(spacing: TideTheme.Spacing.sm) {
                Text("Ask Tide Anything")
                    .font(TideTheme.Typography.title2)
                    .fontWeight(.bold)
                    .foregroundColor(TideTheme.textPrimary)

                Text("Your AI assistant is ready to help")
                    .font(TideTheme.Typography.body)
                    .foregroundColor(TideTheme.textSecondary)
            }

            VStack(spacing: TideTheme.Spacing.sm) {
                ExamplePrompt(text: "Show me urgent emails", icon: "envelope.fill")
                ExamplePrompt(text: "What's on my calendar today?", icon: "calendar")
                ExamplePrompt(text: "Summarize my inbox", icon: "list.bullet.clipboard")
            }
            .padding(.top, TideTheme.Spacing.sm)
        }
    }
}

struct ExamplePrompt: View {
    let text: String
    let icon: String

    var body: some View {
        HStack(spacing: TideTheme.Spacing.sm) {
            Image(systemName: icon)
                .font(TideTheme.Typography.caption1)
                .foregroundStyle(TideTheme.Gradients.primary)
                .frame(width: 20)

            Text(text)
                .font(TideTheme.Typography.callout)
                .foregroundColor(TideTheme.textSecondary)

            Spacer()
        }
        .padding(TideTheme.Spacing.md)
        .background(TideTheme.surface)
        .cornerRadius(TideTheme.CornerRadius.medium)
        .overlay(
            RoundedRectangle(cornerRadius: TideTheme.CornerRadius.medium)
                .stroke(TideTheme.border, lineWidth: 1)
        )
    }
}

// MARK: - Message Bubble
struct MessageBubble: View {
    let message: Message

    var body: some View {
        HStack(alignment: .bottom, spacing: TideTheme.Spacing.sm) {
            if message.role == .user {
                Spacer(minLength: 50)
            } else {
                // AI avatar
                ZStack {
                    Circle()
                        .fill(TideTheme.Gradients.ocean)
                        .frame(width: 32, height: 32)

                    Image(systemName: "sparkles")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                }
            }

            VStack(alignment: message.role == .user ? .trailing : .leading, spacing: TideTheme.Spacing.xs) {
                // Message content with modern bubble
                Text(message.content)
                    .font(TideTheme.Typography.body)
                    .padding(.horizontal, TideTheme.Spacing.md)
                    .padding(.vertical, TideTheme.Spacing.sm)
                    .foregroundColor(
                        message.role == .user
                            ? .white
                            : TideTheme.textPrimary
                    )
                    .background(
                        Group {
                            if message.role == .user {
                                RoundedRectangle(cornerRadius: TideTheme.CornerRadius.large)
                                    .fill(TideTheme.Gradients.primary)
                                    .shadow(
                                        color: TideTheme.Shadow.primaryGlow.color,
                                        radius: 8,
                                        x: 0,
                                        y: 2
                                    )
                            } else {
                                RoundedRectangle(cornerRadius: TideTheme.CornerRadius.large)
                                    .fill(TideTheme.surface)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: TideTheme.CornerRadius.large)
                                            .stroke(TideTheme.border, lineWidth: 1)
                                    )
                                    .shadow(
                                        color: TideTheme.Shadow.small.color,
                                        radius: 4,
                                        x: 0,
                                        y: 2
                                    )
                            }
                        }
                    )

                // Action Preview
                if let actionPreview = message.actionPreview, message.role == .assistant {
                    ActionPreviewCard(actionPreview: actionPreview)
                }

                // Suggestions
                if let suggestions = message.suggestions, !suggestions.isEmpty, message.role == .assistant {
                    HStack(spacing: TideTheme.Spacing.xs) {
                        ForEach(suggestions, id: \.self) { suggestion in
                            Text(suggestion)
                                .font(TideTheme.Typography.caption1)
                                .foregroundColor(TideTheme.primary)
                                .padding(.horizontal, TideTheme.Spacing.sm)
                                .padding(.vertical, TideTheme.Spacing.xs)
                                .background(TideTheme.primary.opacity(0.1))
                                .cornerRadius(TideTheme.CornerRadius.medium)
                        }
                    }
                }

                // Timestamp
                Text(message.timeString)
                    .font(TideTheme.Typography.caption2)
                    .foregroundColor(TideTheme.textTertiary)
                    .padding(.horizontal, TideTheme.Spacing.xs)
            }
            .frame(maxWidth: .infinity, alignment: message.role == .user ? .trailing : .leading)

            if message.role == .user {
                // User avatar placeholder
                ZStack {
                    Circle()
                        .fill(TideTheme.Gradients.purple)
                        .frame(width: 32, height: 32)

                    Image(systemName: "person.fill")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                }
            } else {
                Spacer(minLength: 50)
            }
        }
    }
}

// MARK: - Typing Indicator
struct TypingIndicator: View {
    @State private var animating = false

    var body: some View {
        HStack(alignment: .bottom, spacing: TideTheme.Spacing.sm) {
            // AI avatar
            ZStack {
                Circle()
                    .fill(TideTheme.Gradients.ocean)
                    .frame(width: 32, height: 32)

                Image(systemName: "sparkles")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.white)
            }

            HStack(spacing: 6) {
                ForEach(0..<3) { index in
                    Circle()
                        .fill(TideTheme.primary)
                        .frame(width: 8, height: 8)
                        .scaleEffect(animating ? 1.2 : 0.8)
                        .opacity(animating ? 1.0 : 0.4)
                        .animation(
                            Animation
                                .easeInOut(duration: 0.6)
                                .repeatForever()
                                .delay(Double(index) * 0.2),
                            value: animating
                        )
                }
            }
            .padding(.horizontal, TideTheme.Spacing.md)
            .padding(.vertical, TideTheme.Spacing.sm)
            .background(
                RoundedRectangle(cornerRadius: TideTheme.CornerRadius.large)
                    .fill(TideTheme.surface)
                    .overlay(
                        RoundedRectangle(cornerRadius: TideTheme.CornerRadius.large)
                            .stroke(TideTheme.border, lineWidth: 1)
                    )
                    .shadow(
                        color: TideTheme.Shadow.small.color,
                        radius: 4,
                        x: 0,
                        y: 2
                    )
            )

            Spacer(minLength: 50)
        }
        .onAppear {
            animating = true
        }
    }
}

// MARK: - Action Preview Card
struct ActionPreviewCard: View {
    let actionPreview: ActionPreview

    var body: some View {
        HStack(spacing: TideTheme.Spacing.md) {
            // Icon
            ZStack {
                Circle()
                    .fill(actionIconGradient)
                    .frame(width: 40, height: 40)
                    .opacity(0.2)

                Image(systemName: actionIcon)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(actionIconGradient)
            }

            VStack(alignment: .leading, spacing: TideTheme.Spacing.xxs) {
                Text(actionPreview.title)
                    .font(TideTheme.Typography.subheadlineEmphasized)
                    .foregroundColor(TideTheme.textPrimary)

                Text(actionPreview.description)
                    .font(TideTheme.Typography.caption1)
                    .foregroundColor(TideTheme.textSecondary)
                    .lineLimit(2)
            }

            Spacer()

            // Confirm button if needed
            if actionPreview.requiresConfirmation && !actionPreview.isConfirmed {
                Button(action: {
                    // Handle confirmation
                }) {
                    Text("Confirm")
                        .font(TideTheme.Typography.caption1Emphasized)
                        .foregroundColor(.white)
                        .padding(.horizontal, TideTheme.Spacing.md)
                        .padding(.vertical, TideTheme.Spacing.xs)
                        .background(TideTheme.Gradients.primary)
                        .cornerRadius(TideTheme.CornerRadius.medium)
                }
            }
        }
        .padding(TideTheme.Spacing.md)
        .background(TideTheme.surface)
        .cornerRadius(TideTheme.CornerRadius.medium)
        .overlay(
            RoundedRectangle(cornerRadius: TideTheme.CornerRadius.medium)
                .stroke(actionIconGradient, lineWidth: 1)
        )
        .shadow(
            color: TideTheme.Shadow.small.color,
            radius: 4,
            x: 0,
            y: 2
        )
    }

    private var actionIcon: String {
        switch actionPreview.actionType {
        case .scheduleEvent:
            return "calendar.badge.plus"
        case .sendEmail:
            return "paperplane.fill"
        case .createTask:
            return "checkmark.circle.fill"
        case .updateCalendar:
            return "calendar"
        case .delegateTask:
            return "person.2.fill"
        case .analyzeDocument:
            return "doc.text.magnifyingglass"
        }
    }

    private var actionIconGradient: LinearGradient {
        switch actionPreview.actionType {
        case .scheduleEvent, .updateCalendar:
            return TideTheme.Gradients.secondary
        case .sendEmail:
            return TideTheme.Gradients.primary
        case .createTask:
            return TideTheme.Gradients.sunset
        case .delegateTask:
            return TideTheme.Gradients.purple
        case .analyzeDocument:
            return TideTheme.Gradients.ocean
        }
    }
}

// MARK: - Preview
#Preview {
    ChatView()
        .environmentObject(TideCore.shared)
}
