/**
 * Settings View
 * App settings and user preferences
 */

import SwiftUI
import Supabase

struct SettingsView: View {
    @StateObject private var viewModel: SettingsViewModel
    @State private var showLogoutConfirmation = false

    init(dependencies: DependencyContainer = .shared) {
        _viewModel = StateObject(wrappedValue: SettingsViewModel(
            cacheManager: CacheManager.shared
        ))
    }

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
    @StateObject private var viewModel: AccountsViewModel
    @Environment(\.dependencies) private var dependencies

    init(dependencies: DependencyContainer = .shared) {
        _viewModel = StateObject(wrappedValue: AccountsViewModel(
            supabaseManager: dependencies.supabaseManager,
            keychainManager: KeychainManager.shared
        ))
    }

    var body: some View {
        ZStack {
            List {
                if !viewModel.connectedAccounts.isEmpty {
                    Section {
                        ForEach(viewModel.connectedAccounts) { account in
                            AccountRow(account: account, onDisconnect: {
                                Task {
                                    await viewModel.disconnectAccount(account)
                                }
                            })
                        }
                    } header: {
                        Text("Connected")
                    }
                }

                Section {
                    ForEach(viewModel.availableAccounts.filter { available in
                        !viewModel.connectedAccounts.contains { $0.name == available.name }
                    }) { account in
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

                                if viewModel.isLoading {
                                    ProgressView()
                                } else {
                                    Image(systemName: "plus.circle.fill")
                                        .foregroundColor(.blue)
                                }
                            }
                        }
                        .disabled(viewModel.isLoading)
                    }
                } header: {
                    Text("Available")
                }
            }

            if viewModel.isLoading {
                Color.black.opacity(0.2)
                    .ignoresSafeArea()
                ProgressView()
                    .scaleEffect(1.5)
            }
        }
        .navigationTitle("Accounts")
        .alert("Error", isPresented: $viewModel.showError) {
            Button("OK", role: .cancel) {
                viewModel.showError = false
            }
        } message: {
            if let error = viewModel.error {
                Text(error.localizedDescription)
            }
        }
    }
}

// MARK: - Account Row
struct AccountRow: View {
    let account: ConnectedAccount
    let onDisconnect: () -> Void

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

            Button(action: onDisconnect) {
                Image(systemName: "xmark.circle.fill")
                    .foregroundColor(.red.opacity(0.6))
            }
            .buttonStyle(.plain)

            Circle()
                .fill(account.isActive ? Color.green : Color.gray)
                .frame(width: 8, height: 8)
        }
    }
}

// MARK: - View Models
@MainActor
final class SettingsViewModel: ObservableObject {
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
    @Published var cacheSize = "0 MB"
    @Published var offlineModeEnabled = true

    private let cacheManager: CacheManager

    init(cacheManager: CacheManager) {
        self.cacheManager = cacheManager
        updateCacheSize()
    }

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

    func updateCacheSize() {
        cacheSize = cacheManager.getCacheSize()
    }

    func clearCache() async {
        cacheManager.clearAll()
        updateCacheSize()
    }

    func logout() {
        Logger.authEvent("User logging out...")
        // Logout via AuthManager (handles token cleanup and Supabase signout)
        Task {
            do {
                // Get AuthManager from environment or use shared instance
                // Note: ViewModels should ideally get AuthManager via DI, but SettingsViewModel
                // currently only has CacheManager. This is acceptable for 1.0.
                AuthManager.shared.logout()
            }
        }
    }
}

@MainActor
final class AccountsViewModel: ObservableObject {
    @Published var connectedAccounts: [ConnectedAccount] = []
    @Published var isLoading = false
    @Published var error: Error?
    @Published var showError = false

    @Published var availableAccounts: [AvailableAccount] = [
        AvailableAccount(
            id: "google",
            name: "Google",
            icon: "envelope.fill",
            color: .red
        ),
        AvailableAccount(
            id: "microsoft",
            name: "Microsoft",
            icon: "envelope.fill",
            color: .blue
        ),
        AvailableAccount(
            id: "icloud",
            name: "iCloud",
            icon: "cloud.fill",
            color: .blue
        )
    ]

    private let oauthService: OAuthService
    private let keychainManager: KeychainManagerProtocol

    init(
        supabaseManager: SupabaseManagerProtocol,
        keychainManager: KeychainManagerProtocol
    ) {
        self.keychainManager = keychainManager
        // Get the SupabaseClient from SupabaseManager
        if let manager = supabaseManager as? SupabaseManager {
            // Access the private client through the manager's auth methods
            // For now, we'll create the OAuthService with the shared instance
            self.oauthService = OAuthService(supabaseClient: SupabaseClient(
                supabaseURL: URL(string: Config.supabaseURL)!,
                supabaseKey: Config.supabaseAnonKey ?? ""
            ))
        } else {
            // Fallback for mock/test scenarios
            self.oauthService = OAuthService(supabaseClient: SupabaseClient(
                supabaseURL: URL(string: "https://placeholder.supabase.co")!,
                supabaseKey: "placeholder"
            ))
        }

        loadConnectedAccounts()
    }

    func loadConnectedAccounts() {
        var accounts: [ConnectedAccount] = []

        // Check for Google OAuth tokens
        if keychainManager.exists(for: .googleAccessToken) {
            accounts.append(ConnectedAccount(
                id: "google_connected",
                name: "Google",
                email: "Connected",
                icon: "envelope.fill",
                color: .red,
                isActive: true
            ))
        }

        // Check for Microsoft OAuth tokens (we'll add this to KeychainManager if needed)
        // For now, this is a placeholder

        connectedAccounts = accounts
    }

    func connectAccount(_ account: AvailableAccount) async {
        isLoading = true
        defer { isLoading = false }

        do {
            switch account.id {
            case "google":
                try await connectGoogleAccount()
            case "microsoft":
                try await connectMicrosoftAccount()
            case "icloud":
                // iCloud integration would be handled differently
                error = NSError(domain: "AccountsViewModel", code: 1, userInfo: [
                    NSLocalizedDescriptionKey: "iCloud integration coming soon"
                ])
                showError = true
            default:
                break
            }

            // Reload connected accounts
            loadConnectedAccounts()
        } catch {
            self.error = error
            self.showError = true
            Logger.authError("Failed to connect \(account.name) account", error: error)
        }
    }

    private func connectGoogleAccount() async throws {
        Logger.authEvent("Starting Google OAuth flow")

        let session = try await oauthService.signInWithGoogle()

        // Store tokens in Keychain
        try keychainManager.save(session.accessToken, for: .googleAccessToken)
        if let refreshToken = session.refreshToken {
            try keychainManager.save(refreshToken, for: .googleRefreshToken)
        }

        Logger.authEvent("Google OAuth flow completed successfully")
    }

    private func connectMicrosoftAccount() async throws {
        Logger.authEvent("Starting Microsoft OAuth flow")

        let session = try await oauthService.signInWithMicrosoft()

        // Store tokens in Keychain
        try keychainManager.save(session.accessToken, for: .accessToken)
        if let refreshToken = session.refreshToken {
            try keychainManager.save(refreshToken, for: .refreshToken)
        }

        Logger.authEvent("Microsoft OAuth flow completed successfully")
    }

    func disconnectAccount(_ account: ConnectedAccount) async {
        isLoading = true
        defer { isLoading = false }

        do {
            // Remove tokens from Keychain
            if account.name == "Google" {
                try keychainManager.delete(for: .googleAccessToken)
                try keychainManager.delete(for: .googleRefreshToken)
            } else if account.name == "Microsoft" {
                try keychainManager.delete(for: .accessToken)
                try keychainManager.delete(for: .refreshToken)
            }

            // Reload connected accounts
            loadConnectedAccounts()

            Logger.authEvent("\(account.name) account disconnected")
        } catch {
            self.error = error
            self.showError = true
            Logger.authError("Failed to disconnect \(account.name) account", error: error)
        }
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
