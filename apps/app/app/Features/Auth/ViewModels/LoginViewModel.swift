import SwiftUI
import Combine

@MainActor
class LoginViewModel: ObservableObject {
    @Published var email = ""
    @Published var password = ""
    @Published var errorMessage: String?
    @Published var isLoading = false
    @Published var isAuthenticated = false

    private let authManager = AuthManager.shared

    var isValid: Bool {
        !email.isEmpty &&
        email.contains("@") &&
        !password.isEmpty &&
        password.count >= 8
    }

    func login() async {
        guard isValid else {
            errorMessage = "Please fill in all fields correctly"
            return
        }

        isLoading = true
        errorMessage = nil

        do {
            // Use AuthManager which handles Supabase auth
            try await authManager.login(
                email: email,
                password: password
            )

            isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}

@MainActor
class RegisterViewModel: ObservableObject {
    @Published var name = ""
    @Published var email = ""
    @Published var password = ""
    @Published var confirmPassword = ""
    @Published var errorMessage: String?
    @Published var isLoading = false
    @Published var isAuthenticated = false

    private let authManager = AuthManager.shared

    var isValid: Bool {
        !name.isEmpty &&
        !email.isEmpty &&
        email.contains("@") &&
        !password.isEmpty &&
        password.count >= 8 &&
        password == confirmPassword
    }

    func register() async {
        guard isValid else {
            if password != confirmPassword {
                errorMessage = "Passwords do not match"
            } else {
                errorMessage = "Please fill in all fields correctly"
            }
            return
        }

        isLoading = true
        errorMessage = nil

        do {
            // Use AuthManager which handles Supabase auth
            try await authManager.signUp(
                email: email,
                password: password,
                name: name
            )

            isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}
