/**
 * Filter View Component
 * Email filtering interface
 */

import SwiftUI

struct FilterView: View {
    @ObservedObject var viewModel: EmailInboxViewModel
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationView {
            List {
                Section("Priority") {
                    Toggle("High Priority Only", isOn: $viewModel.showHighPriorityOnly)
                        .accessibilityLabel("Show high priority emails only")
                        .accessibilityValue(viewModel.showHighPriorityOnly ? "Enabled" : "Disabled")
                        .accessibilityHint("Double tap to toggle high priority filter")
                    Toggle("VIP Senders", isOn: $viewModel.showVIPOnly)
                        .accessibilityLabel("Show VIP senders only")
                        .accessibilityValue(viewModel.showVIPOnly ? "Enabled" : "Disabled")
                        .accessibilityHint("Double tap to toggle VIP senders filter")
                }

                Section("Status") {
                    Toggle("Unread Only", isOn: $viewModel.showUnreadOnly)
                        .accessibilityLabel("Show unread emails only")
                        .accessibilityValue(viewModel.showUnreadOnly ? "Enabled" : "Disabled")
                        .accessibilityHint("Double tap to toggle unread filter")
                    Toggle("Has Attachments", isOn: $viewModel.showWithAttachmentsOnly)
                        .accessibilityLabel("Show emails with attachments only")
                        .accessibilityValue(viewModel.showWithAttachmentsOnly ? "Enabled" : "Disabled")
                        .accessibilityHint("Double tap to toggle attachments filter")
                }

                Section("Date Range") {
                    Picker("Time Range", selection: $viewModel.selectedTimeRange) {
                        Text("All Time").tag(0)
                        Text("Today").tag(1)
                        Text("This Week").tag(7)
                        Text("This Month").tag(30)
                    }
                    .accessibilityLabel("Time range filter")
                    .accessibilityHint("Double tap to select date range")
                }
            }
            .navigationTitle("Filters")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                #if os(iOS)
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .accessibilityLabel("Done")
                    .accessibilityHint("Double tap to close filters and apply selections")
                }

                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Reset") {
                        viewModel.resetFilters()
                    }
                    .accessibilityLabel("Reset filters")
                    .accessibilityHint("Double tap to clear all filter selections")
                }
                #else
                ToolbarItem(placement: .primaryAction) {
                    Button("Done") {
                        dismiss()
                    }
                    .accessibilityLabel("Done")
                    .accessibilityHint("Double tap to close filters and apply selections")
                }

                ToolbarItem(placement: .cancellationAction) {
                    Button("Reset") {
                        viewModel.resetFilters()
                    }
                    .accessibilityLabel("Reset filters")
                    .accessibilityHint("Double tap to clear all filter selections")
                }
                #endif
            }
        }
    }
}
