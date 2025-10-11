import SwiftUI

struct AuthenticationView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var showError = false
    @State private var errorMessage = ""

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [TideTheme.primary.opacity(0.1), TideTheme.secondary.opacity(0.1)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                // Logo and title
                VStack(spacing: TideTheme.Spacing.md) {
                    Image(systemName: "waveform.circle.fill")
                        .resizable()
                        .frame(width: 100, height: 100)
                        .foregroundStyle(
                            LinearGradient(
                                colors: [TideTheme.primary, TideTheme.secondary],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )

                    Text("Tide")
                        .font(TideTheme.Typography.largeTitle)
                        .fontWeight(.bold)

                    Text("Your AI Chief of Staff")
                        .font(TideTheme.Typography.subheadline)
                        .foregroundColor(TideTheme.textSecondary)
                }
                .padding(.bottom, TideTheme.Spacing.xxl)

                // OAuth buttons
                VStack(spacing: TideTheme.Spacing.md) {
                    // Sign in with Google
                    Button {
                        _Concurrency.Task {
                            await signInWithGoogle()
                        }
                    } label: {
                        HStack {
                            Image(systemName: "envelope.fill")
                                .font(.title3)
                            Text("Sign in with Google")
                                .fontWeight(.semibold)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.white)
                        .foregroundColor(.black)
                        .cornerRadius(TideTheme.CornerRadius.medium)
                        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
                    }
                    .disabled(authManager.isAuthenticated)

                    // Sign in with Microsoft
                    Button {
                        _Concurrency.Task {
                            await signInWithMicrosoft()
                        }
                    } label: {
                        HStack {
                            Image(systemName: "cloud.fill")
                                .font(.title3)
                            Text("Sign in with Microsoft")
                                .fontWeight(.semibold)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(red: 0/255, green: 164/255, blue: 239/255))
                        .foregroundColor(.white)
                        .cornerRadius(TideTheme.CornerRadius.medium)
                        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
                    }
                    .disabled(authManager.isAuthenticated)

                    // Loading indicator
                    if authManager.isAuthenticated {
                        ProgressView("Connecting...")
                            .padding()
                    }

                    // Error message
                    if showError {
                        Text(errorMessage)
                            .font(TideTheme.Typography.footnote)
                            .foregroundColor(TideTheme.error)
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(TideTheme.error.opacity(0.1))
                            .cornerRadius(TideTheme.CornerRadius.small)
                    }
                }
                .padding(.horizontal, TideTheme.Spacing.lg)

                Spacer()

                // Info text with permissions
                VStack(spacing: 12) {
                    VStack(spacing: 4) {
                        Text("When you sign in, Tide will request access to:")
                            .font(TideTheme.Typography.caption1)
                            .foregroundColor(TideTheme.textSecondary)
                            .multilineTextAlignment(.center)

                        Text("📧 Gmail • 📅 Calendar • ✓ Basic profile info")
                            .font(TideTheme.Typography.caption1)
                            .fontWeight(.medium)
                            .foregroundColor(TideTheme.primary)
                    }

                    Text("You'll see Google's permission screen during sign in")
                        .font(TideTheme.Typography.caption2)
                        .foregroundColor(TideTheme.textTertiary)
                        .multilineTextAlignment(.center)

                    Text("We take your privacy seriously. Your data stays secure.")
                        .font(TideTheme.Typography.caption2)
                        .foregroundColor(TideTheme.textTertiary)
                        .multilineTextAlignment(.center)
                        .padding(.bottom, TideTheme.Spacing.xl)
                }
            }
            .padding(.horizontal, TideTheme.Spacing.lg)
        }
    }

    private func signInWithGoogle() async {
        do {
            try await authManager.loginWithOAuth(provider: .google)
            print("✅ Google login successful")
        } catch {
            let errorDesc = (error as? OAuthError)?.errorDescription ?? error.localizedDescription

            // Only show error if not cancelled
            if case OAuthError.cancelled = error {
                return
            }

            errorMessage = errorDesc
            showError = true
            print("❌ Google login error: \(errorDesc)")

            // Hide error after 5 seconds
            _Concurrency.Task {
                try? await _Concurrency.Task.sleep(nanoseconds: 5_000_000_000)
                showError = false
            }
        }
    }

    private func signInWithMicrosoft() async {
        do {
            try await authManager.loginWithOAuth(provider: .microsoft)
            print("✅ Microsoft login successful")
        } catch {
            let errorDesc = (error as? OAuthError)?.errorDescription ?? error.localizedDescription

            // Only show error if not cancelled
            if case OAuthError.cancelled = error {
                return
            }

            errorMessage = errorDesc
            showError = true
            print("❌ Microsoft login error: \(errorDesc)")

            // Hide error after 5 seconds
            _Concurrency.Task {
                try? await _Concurrency.Task.sleep(nanoseconds: 5_000_000_000)
                showError = false
            }
        }
    }
}

// MARK: - Custom Text Field
struct TideTextField: View {
    @Binding var text: String
    let placeholder: String
    let icon: String

    var body: some View {
        HStack(spacing: TideTheme.Spacing.sm) {
            Image(systemName: icon)
                .foregroundColor(TideTheme.textSecondary)
                .frame(width: 20)

            TextField(placeholder, text: $text)
                .font(TideTheme.Typography.body)
        }
        .padding(TideTheme.Spacing.md)
        .background(TideTheme.surface)
        .cornerRadius(TideTheme.CornerRadius.medium)
        .overlay(
            RoundedRectangle(cornerRadius: TideTheme.CornerRadius.medium)
                .stroke(TideTheme.textTertiary.opacity(0.3), lineWidth: 1)
        )
    }
}

// MARK: - Custom Secure Field
struct TideSecureField: View {
    @Binding var text: String
    let placeholder: String
    @State private var isSecure = true

    var body: some View {
        HStack(spacing: TideTheme.Spacing.sm) {
            Image(systemName: "lock")
                .foregroundColor(TideTheme.textSecondary)
                .frame(width: 20)

            if isSecure {
                SecureField(placeholder, text: $text)
                    .font(TideTheme.Typography.body)
            } else {
                TextField(placeholder, text: $text)
                    .font(TideTheme.Typography.body)
            }

            Button {
                isSecure.toggle()
            } label: {
                Image(systemName: isSecure ? "eye.slash" : "eye")
                    .foregroundColor(TideTheme.textSecondary)
            }
        }
        .padding(TideTheme.Spacing.md)
        .background(TideTheme.surface)
        .cornerRadius(TideTheme.CornerRadius.medium)
        .overlay(
            RoundedRectangle(cornerRadius: TideTheme.CornerRadius.medium)
                .stroke(TideTheme.textTertiary.opacity(0.3), lineWidth: 1)
        )
    }
}

// MARK: - Preview
#Preview {
    AuthenticationView()
        .environmentObject(AuthManager.shared)
}
