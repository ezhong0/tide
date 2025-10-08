/**
 * Settings View
 * App settings and user preferences
 */

import SwiftUI

struct SettingsView: View {
    @StateObject private var viewModel = SettingsViewModel()
    @State private var showLogoutConfirmation = false

    var body: some View {
        List {
            // User Profile Section
            Section {
                HStack(spacing: 16) {
                    // Avatar
                    Circle()
                        .fill(Color.blue.gradient)
                        .frame(width: 60, height: 60)
                        .overlay {
                            Text(viewModel.userInitials)
                                .font(.title2)
                                .fontWeight(.semibold)
                                .foregroundColor(.white)
                        }

                    VStack(alignment: .leading, spacing: 4) {
                        Text(viewModel.userName)
                            .font(.headline)

                        Text(viewModel.userEmail)
                            .font(.callout)
                            .foregroundColor(.secondary)
                    }

                    Spacer()
                }
                .padding(.vertical, 8)
            }

            // Accounts Section
            Section {
                NavigationLink {
                    AccountsListView()
                } label: {
                    Label("Connected Accounts", systemImage: "link")
                }

                NavigationLink {
                    Text("Sync Settings")
                } label: {
                    Label("Sync Settings", systemImage: "arrow.triangle.2.circlepath")
                }
            } header: {
                Text("Accounts")
            }

            // Notifications Section
            Section {
                Toggle(isOn: $viewModel.notificationsEnabled) {
                    Label("Push Notifications", systemImage: "bell")
                }

                if viewModel.notificationsEnabled {
                    Toggle(isOn: $viewModel.emailNotifications) {
                        Label("Email Notifications", systemImage: "envelope")
                    }

                    Toggle(isOn: $viewModel.calendarNotifications) {
                        Label("Calendar Reminders", systemImage: "calendar.badge.clock")
                    }

                    Toggle(isOn: $viewModel.taskNotifications) {
                        Label("Task Reminders", systemImage: "checklist")
                    }
                }
            } header: {
                Text("Notifications")
            }

            // Appearance Section
            Section {
                Picker("Theme", selection: $viewModel.theme) {
                    ForEach(Theme.allCases, id: \.self) { theme in
                        Text(theme.title).tag(theme)
                    }
                }

                Picker("App Icon", selection: $viewModel.appIcon) {
                    ForEach(AppIcon.allCases, id: \.self) { icon in
                        Text(icon.title).tag(icon)
                    }
                }
            } header: {
                Text("Appearance")
            }

            // Privacy & Security Section
            Section {
                Toggle(isOn: $viewModel.biometricsEnabled) {
                    Label("Face ID / Touch ID", systemImage: "faceid")
                }

                NavigationLink {
                    Text("Privacy Settings")
                } label: {
                    Label("Privacy", systemImage: "hand.raised")
                }

                NavigationLink {
                    Text("Security Settings")
                } label: {
                    Label("Security", systemImage: "lock.shield")
                }
            } header: {
                Text("Privacy & Security")
            }

            // AI Settings Section
            Section {
                Toggle(isOn: $viewModel.aiSuggestionsEnabled) {
                    Label("AI Suggestions", systemImage: "sparkles")
                }

                if viewModel.aiSuggestionsEnabled {
                    Toggle(isOn: $viewModel.emailSuggestions) {
                        Text("Email Compose")
                    }

                    Toggle(isOn: $viewModel.smartScheduling) {
                        Text("Smart Scheduling")
                    }

                    Toggle(isOn: $viewModel.taskPrioritization) {
                        Text("Task Prioritization")
                    }
                }
            } header: {
                Text("AI Features")
            } footer: {
                Text("AI-powered features help you work more efficiently by providing intelligent suggestions and automations.")
            }

            // Data & Storage Section
            Section {
                HStack {
                    Label("Cache Size", systemImage: "externaldrive")
                    Spacer()
                    Text(viewModel.cacheSize)
                        .foregroundColor(.secondary)
                }

                Button {
                    Task {
                        await viewModel.clearCache()
                    }
                } label: {
                    Label("Clear Cache", systemImage: "trash")
                        .foregroundColor(.red)
                }

                Toggle(isOn: $viewModel.offlineModeEnabled) {
                    Label("Offline Mode", systemImage: "airplane")
                }
            } header: {
                Text("Data & Storage")
            }

            // About Section
            Section {
                HStack {
                    Text("Version")
                    Spacer()
                    Text(viewModel.appVersion)
                        .foregroundColor(.secondary)
                }

                NavigationLink {
                    Text("Terms of Service")
                } label: {
                    Label("Terms of Service", systemImage: "doc.text")
                }

                NavigationLink {
                    Text("Privacy Policy")
                } label: {
                    Label("Privacy Policy", systemImage: "hand.raised.shield")
                }

                Button {
                    // Open feedback form
                } label: {
                    Label("Send Feedback", systemImage: "envelope")
                }
            } header: {
                Text("About")
            }

            // Account Actions Section
            Section {
                Button(role: .destructive) {
                    showLogoutConfirmation = true
                } label: {
                    Label("Log Out", systemImage: "arrow.right.square")
                        .frame(maxWidth: .infinity, alignment: .center)
                }
            }
        }
        .alert("Log Out?", isPresented: $showLogoutConfirmation) {
            Button("Log Out", role: .destructive) {
                viewModel.logout()
            }
            Button("Cancel", role: .cancel) { }
        } message: {
            Text("Are you sure you want to log out?")
        }
    }
}

// MARK: - Accounts List View
struct AccountsListView: View {
    @StateObject private var viewModel = AccountsViewModel()

    var body: some View {
        List {
            Section {
                ForEach(viewModel.connectedAccounts) { account in
                    AccountRow(account: account)
                }
            } header: {
                Text("Connected")
            }

            Section {
                ForEach(viewModel.availableAccounts) { account in
                    Button {
                        Task {
                            await viewModel.connectAccount(account)
                        }
                    } label: {
                        HStack {
                            Image(systemName: account.icon)
                                .foregroundColor(account.color)

                            Text(account.name)

                            Spacer()

                            Image(systemName: "plus.circle.fill")
                                .foregroundColor(.blue)
                        }
                    }
                }
            } header: {
                Text("Available")
            }
        }
        .navigationTitle("Accounts")
    }
}

// MARK: - Account Row
struct AccountRow: View {
    let account: ConnectedAccount

    var body: some View {
        HStack {
            Image(systemName: account.icon)
                .foregroundColor(account.color)

            VStack(alignment: .leading, spacing: 2) {
                Text(account.name)
                    .font(.callout)

                Text(account.email)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            Circle()
                .fill(account.isActive ? Color.green : Color.gray)
                .frame(width: 8, height: 8)
        }
    }
}

// MARK: - View Models
@MainActor
class SettingsViewModel: ObservableObject {
    @Published var userName = "John Doe"
    @Published var userEmail = "john@example.com"
    @Published var notificationsEnabled = true
    @Published var emailNotifications = true
    @Published var calendarNotifications = true
    @Published var taskNotifications = true
    @Published var theme: Theme = .system
    @Published var appIcon: AppIcon = .default
    @Published var biometricsEnabled = false
    @Published var aiSuggestionsEnabled = true
    @Published var emailSuggestions = true
    @Published var smartScheduling = true
    @Published var taskPrioritization = true
    @Published var cacheSize = "42.5 MB"
    @Published var offlineModeEnabled = true

    var userInitials: String {
        userName.split(separator: " ")
            .compactMap { $0.first }
            .map(String.init)
            .joined()
            .uppercased()
    }

    var appVersion: String {
        "1.0.0 (Alpha)"
    }

    func clearCache() async {
        // TODO: Implement cache clearing
        try? await Task.sleep(nanoseconds: 500_000_000)
        cacheSize = "0 MB"
    }

    func logout() {
        // TODO: Implement logout
        print("Logging out...")
    }
}

@MainActor
class AccountsViewModel: ObservableObject {
    @Published var connectedAccounts: [ConnectedAccount] = [
        ConnectedAccount(
            id: "1",
            name: "Google",
            email: "john@gmail.com",
            icon: "envelope.fill",
            color: .red,
            isActive: true
        ),
        ConnectedAccount(
            id: "2",
            name: "Microsoft",
            email: "john@outlook.com",
            icon: "envelope.fill",
            color: .blue,
            isActive: true
        )
    ]

    @Published var availableAccounts: [AvailableAccount] = [
        AvailableAccount(
            id: "3",
            name: "iCloud",
            icon: "cloud.fill",
            color: .blue
        ),
        AvailableAccount(
            id: "4",
            name: "Yahoo",
            icon: "envelope.fill",
            color: .purple
        )
    ]

    func connectAccount(_ account: AvailableAccount) async {
        // TODO: Implement OAuth flow
        try? await Task.sleep(nanoseconds: 500_000_000)
    }
}

// MARK: - Models
struct ConnectedAccount: Identifiable {
    let id: String
    let name: String
    let email: String
    let icon: String
    let color: Color
    let isActive: Bool
}

struct AvailableAccount: Identifiable {
    let id: String
    let name: String
    let icon: String
    let color: Color
}

enum Theme: String, CaseIterable {
    case system = "System"
    case light = "Light"
    case dark = "Dark"

    var title: String { rawValue }
}

enum AppIcon: String, CaseIterable {
    case `default` = "Default"
    case blue = "Blue"
    case dark = "Dark"

    var title: String { rawValue }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        SettingsView()
            .navigationTitle("Settings")
    }
}
