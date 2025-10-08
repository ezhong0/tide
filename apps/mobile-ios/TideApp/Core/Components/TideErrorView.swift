/**
 * Error View
 * Reusable error display with retry action
 */

import SwiftUI

struct TideErrorView: View {
    let error: Error
    let onRetry: (() -> Void)?

    init(error: Error, onRetry: (() -> Void)? = nil) {
        self.error = error
        self.onRetry = onRetry
    }

    var body: some View {
        VStack(spacing: Spacing.lg) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 64))
                .foregroundColor(.tideError)

            VStack(spacing: Spacing.sm) {
                Text("Something Went Wrong")
                    .font(.tideHeadlineLarge)
                    .foregroundColor(.tidePrimaryText)

                Text(error.localizedDescription)
                    .font(.tideBodyMedium)
                    .foregroundColor(.tideSecondaryText)
                    .multilineTextAlignment(.center)
            }

            if let onRetry = onRetry {
                Button(action: onRetry) {
                    HStack(spacing: Spacing.sm) {
                        Image(systemName: "arrow.clockwise")
                        Text("Try Again")
                    }
                    .font(.tideLabelMedium)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .padding(.horizontal, Spacing.lg)
                    .padding(.vertical, Spacing.md)
                    .background(Color.tidePrimary)
                    .cornerRadius(12)
                }
            }
        }
        .padding(Spacing.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Error Alert Modifier

struct ErrorAlert: ViewModifier {
    @Binding var error: Error?
    @Binding var showError: Bool

    func body(content: Content) -> some View {
        content
            .alert("Error", isPresented: $showError, presenting: error) { _ in
                Button("OK") {
                    error = nil
                }
            } message: { error in
                Text(error.localizedDescription)
            }
    }
}

extension View {
    func errorAlert(error: Binding<Error?>, showError: Binding<Bool>) -> some View {
        self.modifier(ErrorAlert(error: error, showError: showError))
    }
}

// MARK: - Previews

struct TideErrorView_Previews: PreviewProvider {
    static var previews: some View {
        TideErrorView(
            error: NSError(domain: "TideApp", code: -1, userInfo: [
                NSLocalizedDescriptionKey: "Failed to load data. Please check your internet connection and try again."
            ]),
            onRetry: { print("Retry tapped") }
        )
    }
}
