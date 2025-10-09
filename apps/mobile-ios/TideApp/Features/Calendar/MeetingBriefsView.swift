/**
 * Meeting Briefs View
 * Displays AI-generated meeting preparation briefs
 */

import SwiftUI

struct MeetingBriefsView: View {
    @StateObject private var viewModel: MeetingBriefsViewModel

    init(dependencies: DependencyContainer = .shared) {
        _viewModel = StateObject(wrappedValue: dependencies.makeMeetingBriefsViewModel())
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Upcoming Meetings
                if !viewModel.upcomingBriefs.isEmpty {
                    upcomingMeetingsSection
                }

                // Calendar Optimizations
                if !viewModel.optimizations.isEmpty {
                    optimizationsSection
                }

                // Conflicts
                if !viewModel.conflicts.isEmpty {
                    conflictsSection
                }

                // Empty State
                if viewModel.upcomingBriefs.isEmpty && !viewModel.isLoading {
                    EmptyMeetingBriefsView()
                }
            }
            .padding(.vertical)
        }
        .navigationTitle("Meeting Briefs")
        .refreshable {
            await viewModel.refresh()
        }
        .task {
            await viewModel.loadBriefs()
        }
        .alert("Error", isPresented: $viewModel.showError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(viewModel.errorMessage)
        }
    }

    // MARK: - Upcoming Meetings Section
    @ViewBuilder
    private var upcomingMeetingsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Upcoming Meetings")
                .font(.title2)
                .fontWeight(.bold)
                .padding(.horizontal)

            ForEach(viewModel.upcomingBriefs) { brief in
                NavigationLink(destination: MeetingBriefDetailView(brief: brief)) {
                    MeetingBriefCard(brief: brief)
                }
                .buttonStyle(.plain)
            }
        }
    }

    // MARK: - Optimizations Section
    @ViewBuilder
    private var optimizationsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Optimization Suggestions")
                .font(.headline)
                .padding(.horizontal)

            ForEach(viewModel.optimizations.prefix(3)) { optimization in
                OptimizationCard(
                    optimization: optimization,
                    onAccept: { viewModel.acceptOptimization(optimization) },
                    onReject: { viewModel.rejectOptimization(optimization) }
                )
            }
        }
    }

    // MARK: - Conflicts Section
    @ViewBuilder
    private var conflictsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Scheduling Conflicts")
                .font(.headline)
                .padding(.horizontal)

            ForEach(viewModel.conflicts) { conflict in
                MeetingConflictCard(
                    conflict: conflict,
                    onResolve: { option in
                        viewModel.resolveConflict(conflict, with: option)
                    }
                )
            }
        }
    }
}
