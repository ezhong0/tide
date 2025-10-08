/**
 * Onboarding View
 * Guides users through account connection setup
 */

import SwiftUI

struct OnboardingView: View {
    @StateObject private var viewModel: OnboardingViewModel
    @Environment(\.dismiss) private var dismiss

    init(dependencies: DependencyContainer) {
        _viewModel = StateObject(wrappedValue: OnboardingViewModel(
            apiClient: dependencies.apiClient,
            authManager: dependencies.authManager
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
        HStack(spacing: Spacing.sm) {
            ForEach(0..<4) { index in
                RoundedRectangle(cornerRadius: 2)
                    .fill(index <= viewModel.currentPage ? Color.tidePrimary : Color.gray.opacity(0.3))
                    .frame(height: 4)
            }
        }
        .padding(.horizontal, Spacing.xl)
        .padding(.top, Spacing.lg)
        .padding(.bottom, Spacing.md)
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
        VStack(spacing: Spacing.xl) {
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
                .padding(.horizontal, Spacing.xl)
            }
        }
    }

    // MARK: - Calendar Page

    private var calendarPage: some View {
        VStack(spacing: Spacing.xl) {
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
                .padding(.horizontal, Spacing.xl)
            }
        }
    }

    // MARK: - Complete Page

    private var completePage: some View {
        VStack(spacing: Spacing.xl) {
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
            .padding(.horizontal, Spacing.xl)
        }
    }

    // MARK: - Success Badge

    private func successBadge(text: String) -> some View {
        HStack(spacing: Spacing.sm) {
            Image(systemName: "checkmark.circle.fill")
            Text(text)
                .font(.tideLabelMedium)
        }
        .foregroundColor(.tideSuccess)
        .padding(.horizontal, Spacing.lg)
        .padding(.vertical, Spacing.md)
        .background(Color.tideSuccess.opacity(0.1))
        .cornerRadius(12)
    }

    // MARK: - Navigation Buttons

    private var navigationButtons: some View {
        HStack(spacing: Spacing.lg) {
            // Skip button
            if viewModel.currentPage < 3 {
                Button(action: { viewModel.skip() }) {
                    Text("Skip")
                        .font(.tideLabelMedium)
                        .foregroundColor(.tideSecondaryText)
                }
            }

            Spacer()

            // Next/Back buttons
            HStack(spacing: Spacing.md) {
                if viewModel.currentPage > 0 {
                    Button(action: { viewModel.goBack() }) {
                        Image(systemName: "chevron.left")
                    }
                    .tideCompactButton()
                }

                if viewModel.currentPage < 3 {
                    Button(action: { viewModel.goNext() }) {
                        Image(systemName: "chevron.right")
                    }
                    .tideCompactButton()
                }
            }
        }
        .padding(.horizontal, Spacing.xl)
        .padding(.vertical, Spacing.lg)
    }
}

// MARK: - Onboarding Page View

struct OnboardingPageView: View {
    let icon: String
    let title: String
    let description: String
    let iconColor: Color

    var body: some View {
        VStack(spacing: Spacing.xxl) {
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
            VStack(spacing: Spacing.md) {
                Text(title)
                    .font(.tideDisplayMedium)
                    .fontWeight(.bold)
                    .foregroundColor(.tidePrimaryText)

                Text(description)
                    .font(.tideBodyLarge)
                    .foregroundColor(.tideSecondaryText)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, Spacing.xl)
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
                let authURL = try await apiClient.getGmailAuthURL()
                // TODO: Open Safari or WebView to handle OAuth
                // For now, mark as connected
                isGmailConnected = true
            }
        }
    }

    func connectCalendar() {
        Task {
            await withLoadingState {
                // TODO: Implement calendar OAuth
                // For now, mark as connected
                try await Task.sleep(nanoseconds: 1_000_000_000) // 1 second
                isCalendarConnected = true
            }
        }
    }

    func completeOnboarding() {
        // Mark onboarding as completed
        UserDefaults.standard.set(true, forKey: "hasCompletedOnboarding")
        // The app entry point will handle navigation
    }
}

// MARK: - Previews

struct OnboardingView_Previews: PreviewProvider {
    static var previews: some View {
        OnboardingView(dependencies: .shared)
    }
}
