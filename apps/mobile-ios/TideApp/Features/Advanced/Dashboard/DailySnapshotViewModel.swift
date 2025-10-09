/**
 * Daily Snapshot View Model
 * Manages state and data loading for daily intelligence dashboard
 */

import Foundation

@MainActor
final class DailySnapshotViewModel: ObservableObject {
    @Published var snapshot: DailySnapshot?
    @Published var priorityItems: [PriorityItem] = []
    @Published var pendingDecisions: [PendingDecision] = []
    @Published var meetingPreviews: [MeetingPreview] = []
    @Published var predictions: [Prediction] = []

    @Published var isLoading = false
    @Published var showError = false
    @Published var errorMessage = ""

    private let apiClient: APIClientProtocol
    private let authManager: AuthManagerProtocol

    init(apiClient: APIClientProtocol, authManager: AuthManagerProtocol) {
        self.apiClient = apiClient
        self.authManager = authManager
    }

    var isEmpty: Bool {
        priorityItems.isEmpty &&
        pendingDecisions.isEmpty &&
        meetingPreviews.isEmpty &&
        predictions.isEmpty
    }

    func loadSnapshot() async {
        guard !isLoading else { return }

        isLoading = true
        defer { isLoading = false }

        do {
            // Get current user
            guard let userId = await getCurrentUserId() else {
                throw NSError(domain: "DailySnapshot", code: 401, userInfo: [NSLocalizedDescriptionKey: "Not authenticated"])
            }

            // Fetch snapshot from intelligence service
            snapshot = try await apiClient.getDailySnapshot(userId: userId)

            // Update lists
            if let snapshot = snapshot {
                priorityItems = snapshot.priorityItems
                pendingDecisions = snapshot.pendingDecisions
                meetingPreviews = snapshot.meetingPreviews
                predictions = snapshot.predictions
            }
        } catch {
            errorMessage = "Failed to load daily snapshot: \(error.localizedDescription)"
            showError = true
        }
    }

    func refresh() async {
        await loadSnapshot()
    }

    func handleDecision(_ decision: PendingDecision, action: String) {
        // Handle decision action (approve/decline/discuss)
        Task {
            do {
                // TODO: Call decision service API
                Logger.debug("Decision \(decision.id): \(action)")

                // Remove from list
                pendingDecisions.removeAll { $0.id == decision.id }
            } catch {
                errorMessage = "Failed to process decision: \(error.localizedDescription)"
                showError = true
            }
        }
    }

    func acceptPrediction(_ prediction: Prediction) {
        Task {
            do {
                // Execute prediction action
                // TODO: Call action execution API
                Logger.debug("Accepting prediction: \(prediction.action)")

                // Remove from list
                predictions.removeAll { $0.id == prediction.id }
            } catch {
                errorMessage = "Failed to execute prediction: \(error.localizedDescription)"
                showError = true
            }
        }
    }

    func dismissPrediction(_ prediction: Prediction) {
        // Remove prediction from list
        predictions.removeAll { $0.id == prediction.id }
    }

    private func getCurrentUserId() async -> String? {
        return authManager.currentUser?.id
    }
}
