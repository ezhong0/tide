/**
 * Chat View
 * Main conversational AI interface
 */

import SwiftUI

struct ChatView: View {
    @EnvironmentObject var container: DependencyContainer
    @StateObject private var viewModel: ChatViewModel
    @State private var messageText = ""
    @State private var isKeyboardVisible = false
    @State private var showHistory = false
    @FocusState private var inputFocused: Bool

    init(dependencies: DependencyContainer = .shared) {
        // Create viewModel using provided dependencies
        _viewModel = StateObject(wrappedValue: dependencies.makeChatViewModel())
    }

    var body: some View {
        VStack(spacing: 0) {
            // Messages ScrollView
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 16) {
                        if viewModel.messages.isEmpty {
                            emptyStateView
                        } else {
                            ForEach(viewModel.messages) { message in
                                MessageBubble(message: message, viewModel: viewModel)
                                    .id(message.id)
                            }
                        }

                        if viewModel.isLoading {
                            TypingIndicator()
                        }
                    }
                    .padding()
                }
                .onChange(of: viewModel.messages.count) { _ in
                    if let lastMessage = viewModel.messages.last {
                        withAnimation {
                            proxy.scrollTo(lastMessage.id, anchor: .bottom)
                        }
                    }
                }
            }

            // Input Area
            HStack(spacing: 12) {
                TextField("Ask Tide anything...", text: $messageText, axis: .vertical)
                    .textFieldStyle(.plain)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(Color(.systemGray6))
                    .cornerRadius(20)
                    .focused($inputFocused)
                    .lineLimit(1...5)
                    .submitLabel(.send)
                    .onSubmit {
                        sendMessage()
                    }

                Button(action: sendMessage) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.system(size: 32))
                        .foregroundColor(messageText.isEmpty ? .gray : .blue)
                }
                .disabled(messageText.isEmpty || viewModel.isLoading)
            }
            .padding()
            .background(Color(.systemBackground))
            .shadow(color: Color.black.opacity(0.05), radius: 5, y: -2)
        }
        .navigationTitle("Chat")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button {
                    showHistory = true
                } label: {
                    Label("History", systemImage: "clock")
                }
            }

            ToolbarItem(placement: .navigationBarTrailing) {
                Menu {
                    Button {
                        viewModel.startNewConversation()
                    } label: {
                        Label("New Conversation", systemImage: "plus.bubble")
                    }

                    Button(role: .destructive) {
                        viewModel.messages = []
                    } label: {
                        Label("Clear Chat", systemImage: "trash")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            }
        }
        .sheet(isPresented: $showHistory) {
            NavigationStack {
                ConversationHistoryView(dependencies: container)
                    .toolbar {
                        ToolbarItem(placement: .navigationBarTrailing) {
                            Button("Done") {
                                showHistory = false
                            }
                        }
                    }
            }
        }
        .alert("Error", isPresented: .constant(viewModel.error != nil)) {
            Button("OK") {
                viewModel.error = nil
            }
        } message: {
            if let error = viewModel.error {
                Text(error)
            }
        }
        .task {
            await viewModel.loadConversation()
        }
    }

    private var emptyStateView: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "bubble.left.and.bubble.right.fill")
                .font(.system(size: 64))
                .foregroundColor(.blue.opacity(0.3))

            VStack(spacing: 8) {
                Text("Welcome to Tide AI")
                    .font(.title2)
                    .fontWeight(.semibold)

                Text("Your conversational AI assistant")
                    .font(.body)
                    .foregroundColor(.secondary)
            }

            VStack(alignment: .leading, spacing: 12) {
                Text("Try asking:")
                    .font(.caption)
                    .foregroundColor(.secondary)

                SuggestionChip(text: "Show me my priority emails") {
                    messageText = "Show me my priority emails"
                }
                SuggestionChip(text: "What's on my calendar today?") {
                    messageText = "What's on my calendar today?"
                }
                SuggestionChip(text: "Summarize my recent meetings") {
                    messageText = "Summarize my recent meetings"
                }
            }
            .padding(.horizontal, 32)

            Spacer()
        }
        .frame(maxWidth: .infinity)
    }

    private func sendMessage() {
        guard !messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }

        let text = messageText
        messageText = ""
        inputFocused = false

        Task {
            await viewModel.sendMessage(text)
        }
    }
}

// MARK: - Message Bubble
struct MessageBubble: View {
    let message: ChatMessage
    let viewModel: ChatViewModel

    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            if message.role == .user {
                Spacer(minLength: 60)
            }

            VStack(alignment: message.role == .user ? .trailing : .leading, spacing: 6) {
                // Message content
                Text(message.content)
                    .font(.body)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(
                        message.role == .user
                            ? Color.blue
                            : Color(.systemGray5)
                    )
                    .foregroundColor(
                        message.role == .user
                            ? .white
                            : .primary
                    )
                    .cornerRadius(20)

                // Suggested actions
                if let actions = message.suggestedActions, !actions.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        ForEach(actions) { action in
                            ActionButton(action: action, viewModel: viewModel)
                        }
                    }
                }

                // Timestamp and confidence
                HStack(spacing: 4) {
                    Text(message.timeString)
                        .font(.caption2)
                        .foregroundColor(.secondary)

                    if let confidence = message.confidence {
                        Text("•")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                        Text("\(Int(confidence * 100))% confident")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
            }

            if message.role != .user {
                Spacer(minLength: 60)
            }
        }
    }
}

// MARK: - Action Button
struct ActionButton: View {
    let action: SuggestedAction
    let viewModel: ChatViewModel
    @State private var isExecuting = false

    var body: some View {
        Button {
            executeAction()
        } label: {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(action.title)
                        .font(.subheadline)
                        .fontWeight(.medium)

                    Text(action.description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                if isExecuting {
                    ProgressView()
                        .scaleEffect(0.8)
                } else {
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding(12)
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.1), radius: 2, y: 1)
        }
        .disabled(isExecuting)
    }

    private func executeAction() {
        isExecuting = true
        Task {
            await viewModel.executeAction(action)
            isExecuting = false
        }
    }
}

// MARK: - Suggestion Chip
struct SuggestionChip: View {
    let text: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                Text(text)
                    .font(.subheadline)
                Spacer()
                Image(systemName: "arrow.right")
                    .font(.caption)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(Color.blue.opacity(0.1))
            .foregroundColor(.blue)
            .cornerRadius(12)
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
                    .fill(Color.secondary)
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
        .padding(.vertical, 12)
        .background(Color(.systemGray5))
        .cornerRadius(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.leading, 60)
        .onAppear {
            animating = true
        }
    }
}

// MARK: - Preview
#Preview {
    NavigationView {
        ChatView()
    }
}
