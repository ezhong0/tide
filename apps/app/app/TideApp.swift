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
                .onOpenURL { url in
                    // Handle OAuth callback URLs
                    handleOAuthCallback(url)
                }
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

    private func handleOAuthCallback(_ url: URL) {
        print("🔐 Received OAuth callback: \(url)")

        // Handle Supabase OAuth callbacks
        if url.scheme == "com.tide.app" {
            _Concurrency.Task {
                do {
                    try await authManager.handleOAuthCallback(url: url)
                    print("✅ OAuth callback handled successfully")
                } catch {
                    print("❌ OAuth callback error: \(error.localizedDescription)")
                }
            }
        }
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
