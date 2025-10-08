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
                            EventEditView(eventId: eventId)
                                .environmentObject(container)
                        }
                    }
            }
            .tabItem {
                Label(Tab.calendar.title, systemImage: Tab.calendar.icon)
            }
            .tag(Tab.calendar)

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
        }
        .environmentObject(navigationState)
    }
}

// MARK: - Preview
#Preview {
    RootView()
}
