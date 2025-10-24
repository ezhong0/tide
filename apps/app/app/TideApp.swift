import SwiftUI

@main
struct TideApp: App {
    @StateObject private var authManager = AuthManager.shared
    @StateObject private var tideCore = TideCore.shared

    init() {
        // Configure app on launch
        configureApp()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(authManager)
                .environmentObject(tideCore)
                // Note: OAuth callbacks are handled automatically by ASWebAuthenticationSession
                // No need to handle them here to avoid duplicate processing
        }
    }

    private func configureApp() {
        // Performance monitoring
        #if DEBUG
        print("🌊 Tide App Launching (Debug)")
        #else
        print("🌊 Tide App Launching (Release)")
        #endif
    }
}

// MARK: - Root View
struct RootView: View {
    @EnvironmentObject var authManager: AuthManager

    var body: some View {
        Group {
            if authManager.isAuthenticated {
                MainTabView()
            } else {
                AuthenticationView()
            }
        }
        .preferredColorScheme(.light) // Will be dynamic later
    }
}

// MARK: - Main Tab View (Placeholder)
struct MainTabView: View {
    var body: some View {
        TabView {
            DashboardView()
                .tabItem {
                    Label("Dashboard", systemImage: "house.fill")
                }

            ChatView()
                .tabItem {
                    Label("Chat", systemImage: "message.fill")
                }

            EnhancedEmailView()
                .tabItem {
                    Label("Email", systemImage: "envelope.fill")
                }

            EnhancedCalendarView()
                .tabItem {
                    Label("Calendar", systemImage: "calendar")
                }

            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gear")
                }
        }
        .tint(TideTheme.primary)
    }
}

// MARK: - Settings View
struct SettingsView: View {
    @EnvironmentObject var authManager: AuthManager

    var body: some View {
        NavigationView {
            List {
                Section {
                    Button("Sign Out", role: .destructive) {
                        _Concurrency.Task {
                            await signOut()
                        }
                    }
                }
            }
            .navigationTitle("Settings")
        }
    }

    private func signOut() async {
        await authManager.logout()
    }
}
