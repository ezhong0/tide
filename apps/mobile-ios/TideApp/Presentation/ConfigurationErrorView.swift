/**
 * Configuration Error View
 * Displayed when app fails to initialize due to configuration errors
 */

import SwiftUI

struct ConfigurationErrorView: View {
    let error: Error
    @State private var showDetails = false

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            // Icon
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 80))
                .foregroundColor(.orange)
                .padding(.bottom, 16)

            // Title
            Text("Configuration Error")
                .font(.title)
                .fontWeight(.bold)

            // Description
            VStack(spacing: 12) {
                Text(error.localizedDescription)
                    .font(.body)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)

                if let localizedError = error as? LocalizedError,
                   let recoverySuggestion = localizedError.recoverySuggestion {
                    Text(recoverySuggestion)
                        .font(.callout)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                }
            }

            Spacer()

            // Actions
            VStack(spacing: 16) {
                Button(action: {
                    copyErrorDetails()
                }) {
                    Label("Copy Error Details", systemImage: "doc.on.doc")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .tint(.blue)

                Button(action: {
                    showDetails.toggle()
                }) {
                    Text(showDetails ? "Hide Details" : "Show Details")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .tint(.gray)
            }
            .padding(.horizontal, 32)

            // Details panel
            if showDetails {
                ScrollView {
                    VStack(alignment: .leading, spacing: 12) {
                        if let localizedError = error as? LocalizedError {
                            if let failureReason = localizedError.failureReason {
                                DetailRow(title: "Reason", value: failureReason)
                            }
                        }

                        DetailRow(title: "Error Type", value: String(describing: type(of: error)))
                        DetailRow(title: "Full Error", value: String(describing: error))
                    }
                    .padding()
                }
                .frame(maxHeight: 200)
                .background(Color(.systemGray6))
                .cornerRadius(12)
                .padding(.horizontal, 32)
            }

            Spacer()

            // Contact support
            VStack(spacing: 8) {
                Text("Need help?")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Link("Contact Support", destination: URL(string: "mailto:support@tide.ai?subject=Configuration%20Error")!)
                    .font(.caption)
                    .foregroundColor(.blue)
            }
            .padding(.bottom, 32)
        }
        .padding()
    }

    private func copyErrorDetails() {
        var details = "Tide Configuration Error\n\n"
        details += "Description: \(error.localizedDescription)\n\n"

        if let localizedError = error as? LocalizedError {
            if let failureReason = localizedError.failureReason {
                details += "Reason: \(failureReason)\n"
            }
            if let recoverySuggestion = localizedError.recoverySuggestion {
                details += "Suggestion: \(recoverySuggestion)\n"
            }
        }

        details += "\nError Type: \(String(describing: type(of: error)))\n"
        details += "Full Error: \(String(describing: error))\n"

        UIPasteboard.general.string = details
    }
}

struct DetailRow: View {
    let title: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(.secondary)

            Text(value)
                .font(.system(.caption, design: .monospaced))
                .foregroundColor(.primary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

#Preview {
    ConfigurationErrorView(error: ConfigurationError.invalidSupabaseURL("invalid-url"))
}
