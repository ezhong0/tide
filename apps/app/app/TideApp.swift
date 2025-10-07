import SwiftUI

@main
struct TideApp: App {
    @StateObject private var appState = AppState()
    @StateObject private var tideCore = TideCore.shared

    init() {
        // Configure app on launch
        configureApp()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(appState)
                .environmentObject(tideCore)
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

// MARK: - App State
class AppState: ObservableObject {
    @Published var isAuthenticated: Bool = false
    @Published var currentUser: User?

    init() {
        checkAuthStatus()
    }

    private func checkAuthStatus() {
        // Check if we have valid tokens in Keychain
        if let token = KeychainService.shared.getAccessToken(),
           !token.isEmpty {
            isAuthenticated = true
        }
    }
}

// MARK: - Root View
struct RootView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        Group {
            if appState.isAuthenticated {
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
            ChatView()
                .tabItem {
                    Label("Chat", systemImage: "message.fill")
                }

            EmailView()
                .tabItem {
                    Label("Email", systemImage: "envelope.fill")
                }

            CalendarView()
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

// Feature views are now in their respective feature folders:
// - Features/Chat/ChatView.swift
// - Features/Email/EmailView.swift
// - Features/Calendar/CalendarView.swift

struct SettingsView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        NavigationView {
            List {
                Section {
                    Button("Sign Out", role: .destructive) {
                        signOut()
                    }
                }
            }
            .navigationTitle("Settings")
        }
    }

    private func signOut() {
        KeychainService.shared.deleteTokens()
        appState.isAuthenticated = false
        appState.currentUser = nil
    }
}
