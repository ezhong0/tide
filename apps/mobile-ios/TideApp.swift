import SwiftUI

@main
struct TideApp: App {
    // MARK: - Dependency Injection
    @StateObject private var container: DependencyContainer
    @StateObject private var appState = AppState()
    @State private var initializationError: Error?

    init() {
        // Try to create production container with validation
        var tempContainer: DependencyContainer
        var tempError: Error?

        do {
            tempContainer = try DependencyContainer.production()
            print("✅ Tide initialized successfully")
        } catch {
            print("❌ Configuration error: \(error.localizedDescription)")
            tempContainer = DependencyContainer.placeholder(error: error)
            tempError = error
        }

        _container = StateObject(wrappedValue: tempContainer)
        _initializationError = State(initialValue: tempError)

        // Configure app on launch
        configureApp()
    }

    var body: some Scene {
        WindowGroup {
            if let error = initializationError {
                // Show configuration error view
                ConfigurationErrorView(error: error)
            } else {
                // Normal app flow
                TideRootView()
                    .environmentObject(container)
                    .environmentObject(container.authManager as! AuthManager)
                    .environmentObject(appState)
                    .onOpenURL { url in
                        // Handle OAuth callback URLs
                        handleOAuthCallback(url)
                    }
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
            Task {
                do {
                    try await container.authManager.handleOAuthCallback(url: url)
                    print("✅ OAuth callback handled successfully")
                } catch {
                    print("❌ OAuth callback error: \(error.localizedDescription)")
                }
            }
        }
    }
}

// MARK: - App State
class AppState: ObservableObject {
    @Published var hasCompletedOnboarding: Bool

    init() {
        // Check if user has completed onboarding
        self.hasCompletedOnboarding = UserDefaults.standard.bool(forKey: "hasCompletedOnboarding")
    }

    func completeOnboarding() {
        hasCompletedOnboarding = true
        UserDefaults.standard.set(true, forKey: "hasCompletedOnboarding")
    }
}

// MARK: - Root View with Auth State
struct TideRootView: View {
    @EnvironmentObject var container: DependencyContainer
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var authManager: AuthManager

    var body: some View {
        Group {
            if authManager.isAuthenticated {
                // User is authenticated - show main app
                if !appState.hasCompletedOnboarding {
                    // First time user - show onboarding
                    OnboardingView(dependencies: container)
                        .environmentObject(appState)
                } else {
                    // Returning user - show main app with full navigation
                    RootView()
                }
            } else {
                // User not authenticated - show login
                LoginView(dependencies: container)
            }
        }
        .animation(.easeInOut, value: authManager.isAuthenticated)
        .animation(.easeInOut, value: appState.hasCompletedOnboarding)
    }
}

// Simple settings view - full implementation in TideApp/Features/Settings/SettingsView.swift
