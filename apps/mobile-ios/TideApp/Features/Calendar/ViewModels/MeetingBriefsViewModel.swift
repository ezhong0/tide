/**
 * Meeting Briefs View Model
 * Handles meeting briefs data loading and actions
 */

import SwiftUI

@MainActor
final class MeetingBriefsViewModel: ObservableObject {
    @Published var upcomingBriefs: [MeetingBrief] = []
    @Published var optimizations: [CalendarOptimization] = []
    @Published var conflicts: [MeetingConflict] = []
    @Published var isLoading = false
    @Published var showError = false
    @Published var errorMessage = ""

    private let apiClient: APIClientProtocol
    private let supabaseManager: SupabaseManagerProtocol

    init(
        apiClient: APIClientProtocol,
        supabaseManager: SupabaseManagerProtocol
    ) {
        self.apiClient = apiClient
        self.supabaseManager = supabaseManager
    }

    func loadBriefs() async {
        isLoading = true
        defer { isLoading = false }

        do {
            guard let userId = await getCurrentUserId() else { return }

            async let briefsTask = apiClient.getMeetingBriefs(userId: userId)
            async let optimizationsTask = apiClient.getCalendarOptimizations(userId: userId)
            async let conflictsTask = apiClient.getMeetingConflicts(userId: userId)

            upcomingBriefs = try await briefsTask
            optimizations = try? await optimizationsTask ?? []
            conflicts = try? await conflictsTask ?? []

            // Sort briefs by start time
            upcomingBriefs.sort { $0.startTime < $1.startTime }
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }

    func refresh() async {
        await loadBriefs()
    }

    func acceptOptimization(_ optimization: CalendarOptimization) {
        Task {
            do {
                guard let userId = await getCurrentUserId() else { return }
                try await apiClient.acceptOptimization(optimizationId: optimization.id, userId: userId)
                await loadBriefs()
            } catch {
                errorMessage = "Failed to apply optimization"
                showError = true
            }
        }
    }

    func rejectOptimization(_ optimization: CalendarOptimization) {
        Task {
            do {
                guard let userId = await getCurrentUserId() else { return }
                try await apiClient.rejectOptimization(optimizationId: optimization.id, userId: userId)
                await loadBriefs()
            } catch {
                errorMessage = "Failed to dismiss optimization"
                showError = true
            }
        }
    }

    func resolveConflict(_ conflict: MeetingConflict, with option: ResolutionOption) {
        Task {
            do {
                guard let userId = await getCurrentUserId() else { return }
                try await apiClient.resolveConflict(
                    conflictId: conflict.id,
                    userId: userId,
                    resolution: option.action
                )
                await loadBriefs()
            } catch {
                errorMessage = "Failed to resolve conflict"
                showError = true
            }
        }
    }

    private func getCurrentUserId() async -> String? {
        return await supabaseManager.getCurrentUserId()
    }
}
