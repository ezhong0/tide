import SwiftUI

struct AuthenticationView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var isAnimating = false

    var body: some View {
        ZStack {
            // Premium background gradient
            TideTheme.Gradients.ocean
                .ignoresSafeArea()

            // Floating circles for depth
            GeometryReader { geometry in
                Circle()
                    .fill(TideTheme.secondary.opacity(0.2))
                    .frame(width: 200, height: 200)
                    .blur(radius: 60)
                    .offset(x: -50, y: -100)

                Circle()
                    .fill(TideTheme.accent.opacity(0.2))
                    .frame(width: 250, height: 250)
                    .blur(radius: 80)
                    .offset(x: geometry.size.width - 150, y: geometry.size.height - 100)
            }

            VStack(spacing: 0) {
                Spacer()

                // Logo and title with animation
                VStack(spacing: TideTheme.Spacing.lg) {
                    ZStack {
                        // Pulsing background
                        Circle()
                            .fill(Color.white.opacity(0.2))
                            .frame(width: 130, height: 130)
                            .scaleEffect(isAnimating ? 1.1 : 1.0)
                            .opacity(isAnimating ? 0.5 : 0.8)

                        // Icon
                        Image(systemName: "waveform.circle.fill")
                            .resizable()
                            .frame(width: 100, height: 100)
                            .foregroundColor(.white)
                            .shadow(color: .black.opacity(0.2), radius: 10, x: 0, y: 5)
                    }
                    .onAppear {
                        withAnimation(
                            .easeInOut(duration: 2.0)
                            .repeatForever(autoreverses: true)
                        ) {
                            isAnimating = true
                        }
                    }

                    VStack(spacing: TideTheme.Spacing.sm) {
                        Text("Tide")
                            .font(TideTheme.Typography.display)
                            .fontWeight(.bold)
                            .foregroundColor(.white)

                        Text("Your AI Chief of Staff")
                            .font(TideTheme.Typography.title3)
                            .foregroundColor(.white.opacity(0.9))
                    }
                }
                .padding(.bottom, TideTheme.Spacing.xxxl)

                // OAuth buttons
                VStack(spacing: TideTheme.Spacing.md) {
                    // Sign in with Google
                    Button {
                        _Concurrency.Task {
                            await signInWithGoogle()
                        }
                    } label: {
                        HStack(spacing: TideTheme.Spacing.md) {
                            Image(systemName: "envelope.fill")
                                .font(.title3)
                            Text("Sign in with Google")
                                .font(TideTheme.Typography.headline)
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: TideTheme.Size.buttonLarge)
                        .background(Color.white)
                        .foregroundColor(.black)
                        .cornerRadius(TideTheme.CornerRadius.large)
                        .shadow(
                            color: .black.opacity(0.15),
                            radius: 12,
                            x: 0,
                            y: 4
                        )
                    }
                    .disabled(authManager.isAuthenticated)
                    .opacity(authManager.isAuthenticated ? 0.6 : 1.0)

                    // Sign in with Microsoft
                    Button {
                        _Concurrency.Task {
                            await signInWithMicrosoft()
                        }
                    } label: {
                        HStack(spacing: TideTheme.Spacing.md) {
                            Image(systemName: "cloud.fill")
                                .font(.title3)
                            Text("Sign in with Microsoft")
                                .font(TideTheme.Typography.headline)
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: TideTheme.Size.buttonLarge)
                        .background(Color(red: 0/255, green: 164/255, blue: 239/255))
                        .foregroundColor(.white)
                        .cornerRadius(TideTheme.CornerRadius.large)
                        .shadow(
                            color: Color(red: 0/255, green: 164/255, blue: 239/255).opacity(0.3),
                            radius: 12,
                            x: 0,
                            y: 4
                        )
                    }
                    .disabled(authManager.isAuthenticated)
                    .opacity(authManager.isAuthenticated ? 0.6 : 1.0)

                    // Loading indicator
                    if authManager.isAuthenticated {
                        HStack(spacing: TideTheme.Spacing.sm) {
                            ProgressView()
                                .tint(.white)
                            Text("Connecting...")
                                .foregroundColor(.white)
                        }
                        .padding()
                    }

                    // Error message
                    if showError {
                        HStack(spacing: TideTheme.Spacing.sm) {
                            Image(systemName: "exclamationmark.triangle.fill")
                            Text(errorMessage)
                                .font(TideTheme.Typography.footnote)
                        }
                        .foregroundColor(.white)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.white.opacity(0.2))
                        .cornerRadius(TideTheme.CornerRadius.medium)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                    }
                }
                .padding(.horizontal, TideTheme.Spacing.lg)

                Spacer()

                // Info text with permissions
                VStack(spacing: TideTheme.Spacing.md) {
                    VStack(spacing: TideTheme.Spacing.xs) {
                        Text("When you sign in, Tide will request access to:")
                            .font(TideTheme.Typography.caption1)
                            .foregroundColor(.white.opacity(0.8))
                            .multilineTextAlignment(.center)

                        Text("📧 Gmail • 📅 Calendar • ✓ Basic profile info")
                            .font(TideTheme.Typography.caption1)
                            .fontWeight(.medium)
                            .foregroundColor(.white)
                    }

                    VStack(spacing: TideTheme.Spacing.xxs) {
                        Text("You'll see the permission screen during sign in")
                            .font(TideTheme.Typography.caption2)
                            .foregroundColor(.white.opacity(0.7))
                            .multilineTextAlignment(.center)

                        Text("We take your privacy seriously. Your data stays secure.")
                            .font(TideTheme.Typography.caption2)
                            .foregroundColor(.white.opacity(0.7))
                            .multilineTextAlignment(.center)
                    }
                }
                .padding(.horizontal, TideTheme.Spacing.xl)
                .padding(.bottom, TideTheme.Spacing.xl)
            }
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
