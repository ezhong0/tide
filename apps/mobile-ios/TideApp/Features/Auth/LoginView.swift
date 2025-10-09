/**
 * Login View
 * OAuth authentication with Google and Microsoft
 */

import SwiftUI
import AuthenticationServices

struct LoginView: View {
    @StateObject private var viewModel: LoginViewModel
    @Environment(\.colorScheme) private var colorScheme

    init(dependencies: DependencyContainer) {
        _viewModel = StateObject(wrappedValue: LoginViewModel(
            apiClient: dependencies.apiClient,
            authManager: dependencies.authManager
        ))
    }

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                gradient: Gradient(colors: [
                    Color.tidePrimary.opacity(0.1),
                    Color.tideBackground
                ]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: Design.Spacing.xxxl) {
                Spacer()

                // Logo and title
                logoSection

                Spacer()

                // Login buttons
                loginButtons

                // Privacy notice
                privacyNotice
                    .padding(.bottom, Design.Spacing.lg)
            }
            .padding(.horizontal, Design.Spacing.xl)

            // Loading overlay
            if viewModel.isLoading {
                LoadingOverlay()
            }
        }
        .errorAlert(error: $viewModel.error, showError: $viewModel.showError)
    }

    // MARK: - Logo Section

    private var logoSection: some View {
        VStack(spacing: Design.Spacing.lg) {
            // App icon placeholder
            Circle()
                .fill(Color.tidePrimary.opacity(0.2))
                .frame(width: 120, height: 120)
                .overlay(
                    Image(systemName: "brain.head.profile")
                        .font(.system(size: 60))
                        .foregroundColor(.tidePrimary)
                )
                .accessibilityLabel("Tide app logo")

            VStack(spacing: Design.Spacing.sm) {
                Text("Welcome to Tide")
                    .font(.tideDisplayLarge)
                    .fontWeight(.bold)
                    .foregroundColor(.tidePrimaryText)

                Text("Your AI-powered productivity assistant")
                    .font(.tideBodyLarge)
                    .foregroundColor(.tideSecondaryText)
                    .multilineTextAlignment(.center)
            }
        }
    }

    // MARK: - Login Buttons

    private var loginButtons: some View {
        VStack(spacing: Design.Spacing.md) {
            // Google Sign In
            Button(action: { viewModel.loginWithGoogle() }) {
                HStack(spacing: Design.Spacing.md) {
                    Image(systemName: "g.circle.fill")
                        .font(.system(size: 24))

                    Text("Continue with Google")
                        .font(.tideLabelMedium)
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, Design.Spacing.md)
                .background(Color.white)
                .foregroundColor(.black)
                .cornerRadius(12)
                .shadow(color: Color.black.opacity(0.1), radius: 4, x: 0, y: 2)
            }
            .accessibilityLabel("Sign in with Google")
            .accessibilityHint("Double tap to sign in using your Google account")
            .disabled(viewModel.isLoading)

            // Microsoft Sign In (optional)
            Button(action: { viewModel.loginWithMicrosoft() }) {
                HStack(spacing: Design.Spacing.md) {
                    Image(systemName: "microsoft.logo")
                        .font(.system(size: 24))

                    Text("Continue with Microsoft")
                        .font(.tideLabelMedium)
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, Design.Spacing.md)
                .background(Color.black)
                .foregroundColor(.white)
                .cornerRadius(12)
            }
            .accessibilityLabel("Sign in with Microsoft")
            .accessibilityHint("Double tap to sign in using your Microsoft account")
            .disabled(viewModel.isLoading)

            // Apple Sign In
            SignInWithAppleButton(
                onRequest: { request in
                    request.requestedScopes = [.email, .fullName]
                },
                onCompletion: { result in
                    viewModel.handleAppleSignIn(result)
                }
            )
            .signInWithAppleButtonStyle(colorScheme == .dark ? .white : .black)
            .frame(height: 50)
            .cornerRadius(12)
        }
    }

    // MARK: - Privacy Notice

    private var privacyNotice: some View {
        Text("By continuing, you agree to our Terms of Service and Privacy Policy")
            .font(.tideCaption)
            .foregroundColor(.tideSecondaryText)
            .multilineTextAlignment(.center)
            .padding(.horizontal, Design.Spacing.lg)
    }
}

// MARK: - View Model

@MainActor
class LoginViewModel: BaseViewModel {
    func loginWithGoogle() {
        Task {
            await withLoadingState {
                try await authManager.loginWithOAuth(provider: .google)
            }
        }
    }

    func loginWithMicrosoft() {
        Task {
            await withLoadingState {
                try await authManager.loginWithOAuth(provider: .microsoft)
            }
        }
    }

    func handleAppleSignIn(_ result: Result<ASAuthorization, Error>) {
        switch result {
        case .success(let authorization):
            if let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential {
                Task {
                    await withLoadingState {
                        // Extract identity token
                        guard let identityToken = appleIDCredential.identityToken,
                              let tokenString = String(data: identityToken, encoding: .utf8) else {
                            throw LoginError.invalidCredentials
                        }

                        // Use the new loginWithApple method
                        try await authManager.loginWithApple(identityToken: tokenString)
                    }
                }
            }
        case .failure(let error):
            // Check if user cancelled
            if (error as NSError).code == ASAuthorizationError.canceled.rawValue {
                // Don't show error for cancellation
                return
            }
            handleError(error)
        }
    }
}

// MARK: - Login Error

enum LoginError: LocalizedError {
    case invalidCredentials
    case networkError
    case cancelled

    var errorDescription: String? {
        switch self {
        case .invalidCredentials:
            return "Invalid credentials. Please try again."
        case .networkError:
            return "Network error. Please check your connection and try again."
        case .cancelled:
            return "Login was cancelled."
        }
    }
}

// MARK: - Previews

struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView(dependencies: .shared)
    }
}
