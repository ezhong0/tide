/**
 * Root View
 * Main app container with tab-based navigation
 */

import SwiftUI

struct RootView: View {
    @EnvironmentObject var container: DependencyContainer
    @StateObject private var navigationState = NavigationState()

    var body: some View {
        TabView(selection: $navigationState.selectedTab) {
            // Chat Tab
            NavigationStack(path: $navigationState.chatPath) {
                ChatView(dependencies: container)
                    .environmentObject(container)
                    .navigationTitle("Chat")
            }
            .tabItem {
                Label(Tab.chat.title, systemImage: Tab.chat.icon)
            }
            .tag(Tab.chat)
            .accessibilityLabel("Chat")
            .accessibilityHint("View and send messages to your AI assistant")

            // Email Tab
            NavigationStack(path: $navigationState.emailPath) {
                EmailInboxView()
                    .environmentObject(container)
                    .navigationTitle("Inbox")
                    .navigationDestination(for: EmailDestination.self) { destination in
                        switch destination {
                        case .detail(let emailId):
                            EmailDetailView(emailId: emailId)
                                .environmentObject(container)
                        case .compose(let replyTo, let mode):
                            EmailComposeView(replyTo: replyTo, mode: mode)
                                .environmentObject(container)
                        }
                    }
            }
            .tabItem {
                Label(Tab.email.title, systemImage: Tab.email.icon)
            }
            .tag(Tab.email)
            .accessibilityLabel("Email")
            .accessibilityHint("View and manage your emails")

            // Calendar Tab
            NavigationStack(path: $navigationState.calendarPath) {
                CalendarGridView()
                    .environmentObject(container)
                    .navigationTitle("Calendar")
                    .navigationDestination(for: CalendarDestination.self) { destination in
                        switch destination {
                        case .detail(let eventId):
                            EventDetailView(eventId: eventId)
                                .environmentObject(container)
                        case .edit(let eventId):
                            if let eventId = eventId {
                                // Edit existing event - load event and pass to edit mode
                                EventEditLoader(eventId: eventId, dependencies: container)
                                    .environmentObject(container)
                            } else {
                                // Create new event
                                EventEditView(mode: .create)
                                    .environmentObject(container)
                            }
                        }
                    }
            }
            .tabItem {
                Label(Tab.calendar.title, systemImage: Tab.calendar.icon)
            }
            .tag(Tab.calendar)
            .accessibilityLabel("Calendar")
            .accessibilityHint("View and manage your calendar events")

            // Tasks Tab
            NavigationStack(path: $navigationState.tasksPath) {
                TaskListView()
                    .environmentObject(container)
                    .navigationTitle("Tasks")
                    .navigationDestination(for: TaskDestination.self) { destination in
                        switch destination {
                        case .detail(let taskId):
                            TaskDetailView(taskId: taskId)
                                .environmentObject(container)
                        case .edit(let taskId):
                            TaskEditView(taskId: taskId)
                                .environmentObject(container)
                        }
                    }
            }
            .tabItem {
                Label(Tab.tasks.title, systemImage: Tab.tasks.icon)
            }
            .tag(Tab.tasks)
            .accessibilityLabel("Tasks")
            .accessibilityHint("View and manage your tasks")

            // More/Settings Tab
            NavigationStack(path: $navigationState.morePath) {
                SettingsView()
                    .environmentObject(container)
                    .navigationTitle("Settings")
            }
            .tabItem {
                Label(Tab.more.title, systemImage: Tab.more.icon)
            }
            .tag(Tab.more)
            .accessibilityLabel("Settings")
            .accessibilityHint("View and manage app settings and account")
        }
        .environmentObject(navigationState)
    }
}

// MARK: - Event Edit Loader
/// Helper view that loads an event and displays EventEditView in edit mode
struct EventEditLoader: View {
    let eventId: String
    let dependencies: DependencyContainer

    @State private var event: CalendarEvent?
    @State private var isLoading = true
    @State private var error: Error?

    var body: some View {
        Group {
            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let event = event {
                EventEditView(mode: .edit(event), dependencies: dependencies)
            } else if let error = error {
                ErrorView(
                    error: error,
                    retryAction: {
                        Task {
                            await loadEvent()
                        }
                    }
                )
            }
        }
        .task {
            await loadEvent()
        }
    }

    private func loadEvent() async {
        isLoading = true
        error = nil

        do {
            let loadedEvent = try await dependencies.apiClient.getCalendarEvent(id: eventId)
            event = loadedEvent
        } catch {
            Logger.error("Failed to load event for editing", error: error)
            self.error = error
        }

        isLoading = false
    }
}

// MARK: - Preview
#Preview {
    RootView()
}
