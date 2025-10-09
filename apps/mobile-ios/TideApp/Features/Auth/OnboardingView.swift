/**
 * Onboarding View
 * Guides users through account connection setup
 */

import SwiftUI
import Supabase

struct OnboardingView: View {
    @StateObject private var viewModel: OnboardingViewModel
    @Environment(\.dismiss) private var dismiss

    init(dependencies: DependencyContainer = .shared) {
        _viewModel = StateObject(wrappedValue: OnboardingViewModel(
            apiClient: dependencies.apiClient,
            authManager: dependencies.authManager,
            keychainManager: KeychainManager.shared
        ))
    }

    var body: some View {
        ZStack {
            // Background
            Color.tideBackground
                .ignoresSafeArea()

            VStack(spacing: 0) {
                // Progress indicator
                progressBar

                // Current page
                TabView(selection: $viewModel.currentPage) {
                    welcomePage.tag(0)
                    gmailPage.tag(1)
                    calendarPage.tag(2)
                    completePage.tag(3)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))

                // Navigation buttons
                navigationButtons
            }
        }
        .errorAlert(error: $viewModel.error, showError: $viewModel.showError)
    }

    // MARK: - Progress Bar

    private var progressBar: some View {
        HStack(spacing: Design.Spacing.sm) {
            ForEach(0..<4) { index in
                RoundedRectangle(cornerRadius: 2)
                    .fill(index <= viewModel.currentPage ? Color.tidePrimary : Color.gray.opacity(0.3))
                    .frame(height: 4)
            }
        }
        .padding(.horizontal, Design.Spacing.xl)
        .padding(.top, Design.Spacing.lg)
        .padding(.bottom, Design.Spacing.md)
    }

    // MARK: - Welcome Page

    private var welcomePage: some View {
        OnboardingPageView(
            icon: "sparkles",
            title: "Welcome to Tide",
            description: "Your AI-powered productivity assistant that helps you manage emails, calendar, and tasks effortlessly.",
            iconColor: .tidePrimary
        )
    }

    // MARK: - Gmail Page

    private var gmailPage: some View {
        VStack(spacing: Design.Spacing.xl) {
            OnboardingPageView(
                icon: "envelope.fill",
                title: "Connect Gmail",
                description: "Let Tide help you manage your emails with AI-powered insights and suggestions.",
                iconColor: .tideInfo
            )

            if viewModel.isGmailConnected {
                successBadge(text: "Gmail Connected")
            } else {
                Button(action: { viewModel.connectGmail() }) {
                    Text("Connect Gmail")
                }
                .tidePrimaryButton(isLoading: viewModel.isLoading)
                .padding(.horizontal, Design.Spacing.xl)
                .accessibilityLabel("Connect Gmail")
                .accessibilityHint("Double tap to connect your Gmail account")
            }
        }
    }

    // MARK: - Calendar Page

    private var calendarPage: some View {
        VStack(spacing: Design.Spacing.xl) {
            OnboardingPageView(
                icon: "calendar",
                title: "Connect Calendar",
                description: "Sync your Google Calendar to get smart scheduling and meeting insights.",
                iconColor: .tideWarning
            )

            if viewModel.isCalendarConnected {
                successBadge(text: "Calendar Connected")
            } else {
                Button(action: { viewModel.connectCalendar() }) {
                    Text("Connect Calendar")
                }
                .tidePrimaryButton(isLoading: viewModel.isLoading)
                .padding(.horizontal, Design.Spacing.xl)
                .accessibilityLabel("Connect Calendar")
                .accessibilityHint("Double tap to connect your Google Calendar")
            }
        }
    }

    // MARK: - Complete Page

    private var completePage: some View {
        VStack(spacing: Design.Spacing.xl) {
            OnboardingPageView(
                icon: "checkmark.circle.fill",
                title: "You're All Set!",
                description: "Start using Tide to boost your productivity with AI assistance.",
                iconColor: .tideSuccess
            )

            Button(action: { viewModel.completeOnboarding() }) {
                Text("Get Started")
            }
            .tidePrimaryButton()
            .padding(.horizontal, Design.Spacing.xl)
            .accessibilityLabel("Get Started")
            .accessibilityHint("Double tap to complete onboarding and start using Tide")
        }
    }

    // MARK: - Success Badge

    private func successBadge(text: String) -> some View {
        HStack(spacing: Design.Spacing.sm) {
            Image(systemName: "checkmark.circle.fill")
            Text(text)
                .font(.tideLabelMedium)
        }
        .foregroundColor(.tideSuccess)
        .padding(.horizontal, Design.Spacing.lg)
        .padding(.vertical, Design.Spacing.md)
        .background(Color.tideSuccess.opacity(0.1))
        .cornerRadius(12)
    }

    // MARK: - Navigation Buttons

    private var navigationButtons: some View {
        HStack(spacing: Design.Spacing.lg) {
            // Skip button
            if viewModel.currentPage < 3 {
                Button(action: { viewModel.skip() }) {
                    Text("Skip")
                        .font(.tideLabelMedium)
                        .foregroundColor(.tideSecondaryText)
                }
                .accessibilityLabel("Skip onboarding")
                .accessibilityHint("Double tap to skip account setup and go to the app")
            }

            Spacer()

            // Next/Back buttons
            HStack(spacing: Design.Spacing.md) {
                if viewModel.currentPage > 0 {
                    Button(action: { viewModel.goBack() }) {
                        Image(systemName: "chevron.left")
                    }
                    .tideCompactButton()
                    .accessibilityLabel("Go back")
                    .accessibilityHint("Double tap to go to the previous onboarding page")
                }

                if viewModel.currentPage < 3 {
                    Button(action: { viewModel.goNext() }) {
                        Image(systemName: "chevron.right")
                    }
                    .tideCompactButton()
                    .accessibilityLabel("Go next")
                    .accessibilityHint("Double tap to go to the next onboarding page")
                }
            }
        }
        .padding(.horizontal, Design.Spacing.xl)
        .padding(.vertical, Design.Spacing.lg)
    }
}

// MARK: - Onboarding Page View

struct OnboardingPageView: View {
    let icon: String
    let title: String
    let description: String
    let iconColor: Color

    var body: some View {
        VStack(spacing: Design.Spacing.xxl) {
            Spacer()

            // Icon
            Circle()
                .fill(iconColor.opacity(0.2))
                .frame(width: 120, height: 120)
                .overlay(
                    Image(systemName: icon)
                        .font(.system(size: 60))
                        .foregroundColor(iconColor)
                )

            // Content
            VStack(spacing: Design.Spacing.md) {
                Text(title)
                    .font(.tideDisplayMedium)
                    .fontWeight(.bold)
                    .foregroundColor(.tidePrimaryText)

                Text(description)
                    .font(.tideBodyLarge)
                    .foregroundColor(.tideSecondaryText)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, Design.Spacing.xl)
            }

            Spacer()
        }
    }
}

// MARK: - View Model

@MainActor
class OnboardingViewModel: BaseViewModel {
    @Published var currentPage = 0
    @Published var isGmailConnected = false
    @Published var isCalendarConnected = false

    private let oauthService: OAuthService
    private let keychainManager: KeychainManagerProtocol

    init(
        apiClient: APIClientProtocol,
        authManager: AuthManagerProtocol,
        keychainManager: KeychainManagerProtocol
    ) {
        // Initialize OAuth service with Supabase client
        self.oauthService = OAuthService(supabaseClient: SupabaseClient(
            supabaseURL: URL(string: Config.supabaseURL)!,
            supabaseKey: Config.supabaseAnonKey ?? ""
        ))
        self.keychainManager = keychainManager

        super.init(apiClient: apiClient, authManager: authManager)

        // Check if accounts are already connected
        checkConnectionStatus()
    }

    func checkConnectionStatus() {
        isGmailConnected = keychainManager.exists(for: .googleAccessToken)
        isCalendarConnected = isGmailConnected // Calendar uses same Google OAuth
    }

    func goNext() {
        withAnimation {
            currentPage = min(currentPage + 1, 3)
        }
    }

    func goBack() {
        withAnimation {
            currentPage = max(currentPage - 1, 0)
        }
    }

    func skip() {
        completeOnboarding()
    }

    func connectGmail() {
        Task {
            await withLoadingState {
                Logger.authEvent("Starting Gmail OAuth flow from onboarding")

                do {
                    let session = try await oauthService.signInWithGoogle()

                    // Store tokens in Keychain
                    try keychainManager.save(session.accessToken, for: .googleAccessToken)
                    if let refreshToken = session.refreshToken {
                        try keychainManager.save(refreshToken, for: .googleRefreshToken)
                    }

                    // Update connection status
                    isGmailConnected = true
                    isCalendarConnected = true // Google OAuth includes calendar access

                    Logger.authEvent("Gmail OAuth completed successfully from onboarding")

                    // Auto-advance to next page after successful connection
                    try? await Task.sleep(nanoseconds: 500_000_000)
                    goNext()
                } catch {
                    Logger.authError("Gmail OAuth failed in onboarding", error: error)
                    throw error
                }
            }
        }
    }

    func connectCalendar() {
        Task {
            await withLoadingState {
                // Calendar uses the same Google OAuth as Gmail
                // If Gmail is already connected, we just need to verify the token
                if isGmailConnected {
                    Logger.authEvent("Calendar already connected via Gmail OAuth")
                    isCalendarConnected = true

                    // Auto-advance to next page
                    try? await Task.sleep(nanoseconds: 500_000_000)
                    goNext()
                } else {
                    // If Gmail is not connected, connect it first
                    Logger.authEvent("Connecting Google Calendar via OAuth")

                    do {
                        let session = try await oauthService.signInWithGoogle()

                        // Store tokens in Keychain
                        try keychainManager.save(session.accessToken, for: .googleAccessToken)
                        if let refreshToken = session.refreshToken {
                            try keychainManager.save(refreshToken, for: .googleRefreshToken)
                        }

                        // Update connection status
                        isGmailConnected = true
                        isCalendarConnected = true

                        Logger.authEvent("Calendar OAuth completed successfully from onboarding")

                        // Auto-advance to next page
                        try? await Task.sleep(nanoseconds: 500_000_000)
                        goNext()
                    } catch {
                        Logger.authError("Calendar OAuth failed in onboarding", error: error)
                        throw error
                    }
                }
            }
        }
    }

    func completeOnboarding() {
        // Mark onboarding as completed
        UserDefaults.standard.set(true, forKey: "hasCompletedOnboarding")
        Logger.info("Onboarding completed")
        // The app entry point will handle navigation
    }
}

// MARK: - Previews

struct OnboardingView_Previews: PreviewProvider {
    static var previews: some View {
        OnboardingView(dependencies: .shared)
    }
}
