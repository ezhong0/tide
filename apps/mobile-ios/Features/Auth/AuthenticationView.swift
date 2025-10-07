import SwiftUI

struct AuthenticationView: View {
    @State private var isLogin = true

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
                        .frame(width: 80, height: 80)
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

                // Auth form
                if isLogin {
                    LoginView()
                } else {
                    RegisterView()
                }

                Spacer()

                // Toggle between login/register
                Button {
                    withAnimation(.easeInOut) {
                        isLogin.toggle()
                    }
                } label: {
                    HStack(spacing: 4) {
                        Text(isLogin ? "Don't have an account?" : "Already have an account?")
                            .foregroundColor(TideTheme.textSecondary)
                        Text(isLogin ? "Sign Up" : "Sign In")
                            .foregroundColor(TideTheme.primary)
                            .fontWeight(.semibold)
                    }
                    .font(TideTheme.Typography.callout)
                }
                .padding(.bottom, TideTheme.Spacing.xl)
            }
            .padding(.horizontal, TideTheme.Spacing.lg)
        }
    }
}

// MARK: - Login View
struct LoginView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = LoginViewModel()

    var body: some View {
        VStack(spacing: TideTheme.Spacing.md) {
            // Email field
            TideTextField(
                text: $viewModel.email,
                placeholder: "Email",
                icon: "envelope"
            )
            .textInputAutocapitalization(.never)
            .keyboardType(.emailAddress)

            // Password field
            TideSecureField(
                text: $viewModel.password,
                placeholder: "Password"
            )

            // Error message
            if let error = viewModel.errorMessage {
                Text(error)
                    .font(TideTheme.Typography.footnote)
                    .foregroundColor(TideTheme.error)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }

            // Login button
            Button {
                Task {
                    await viewModel.login()
                    if viewModel.isAuthenticated {
                        appState.isAuthenticated = true
                    }
                }
            } label: {
                if viewModel.isLoading {
                    ProgressView()
                        .tint(.white)
                } else {
                    Text("Sign In")
                }
            }
            .tidePrimaryButton()
            .disabled(viewModel.isLoading || !viewModel.isValid)
            .opacity(viewModel.isValid ? 1.0 : 0.6)

            // Forgot password
            Button("Forgot Password?") {
                // TODO: Implement forgot password
            }
            .font(TideTheme.Typography.callout)
            .foregroundColor(TideTheme.textSecondary)
        }
    }
}

// MARK: - Register View
struct RegisterView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = RegisterViewModel()

    var body: some View {
        VStack(spacing: TideTheme.Spacing.md) {
            // Name field
            TideTextField(
                text: $viewModel.name,
                placeholder: "Full Name",
                icon: "person"
            )

            // Email field
            TideTextField(
                text: $viewModel.email,
                placeholder: "Email",
                icon: "envelope"
            )
            .textInputAutocapitalization(.never)
            .keyboardType(.emailAddress)

            // Password field
            TideSecureField(
                text: $viewModel.password,
                placeholder: "Password"
            )

            // Confirm password field
            TideSecureField(
                text: $viewModel.confirmPassword,
                placeholder: "Confirm Password"
            )

            // Error message
            if let error = viewModel.errorMessage {
                Text(error)
                    .font(TideTheme.Typography.footnote)
                    .foregroundColor(TideTheme.error)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }

            // Register button
            Button {
                Task {
                    await viewModel.register()
                    if viewModel.isAuthenticated {
                        appState.isAuthenticated = true
                    }
                }
            } label: {
                if viewModel.isLoading {
                    ProgressView()
                        .tint(.white)
                } else {
                    Text("Create Account")
                }
            }
            .tidePrimaryButton()
            .disabled(viewModel.isLoading || !viewModel.isValid)
            .opacity(viewModel.isValid ? 1.0 : 0.6)
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
        .environmentObject(AppState())
}
