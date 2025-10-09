/**
 * Optimization and Conflict Views
 * Components for calendar optimizations and conflict resolution
 */

import SwiftUI

// MARK: - Optimization Card

struct OptimizationCard: View {
    let optimization: CalendarOptimization
    let onAccept: () -> Void
    let onReject: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: optimization.type.icon)
                    .foregroundColor(.blue)

                Text(optimization.type.displayName)
                    .font(.subheadline)
                    .fontWeight(.semibold)

                Spacer()

                Text("Saves \(optimization.estimatedTimeSavedMinutes)min")
                    .font(.caption)
                    .foregroundColor(.green)
            }

            Text(optimization.reasoning)
                .font(.caption)
                .foregroundColor(.secondary)

            HStack(spacing: 12) {
                Button("Accept") { onAccept() }
                    .buttonStyle(.borderedProminent)
                    .font(.caption)

                Button("Dismiss") { onReject() }
                    .buttonStyle(.bordered)
                    .font(.caption)
            }
        }
        .padding()
        .background(Color.blue.opacity(0.1))
        .cornerRadius(12)
        .padding(.horizontal)
    }
}

// MARK: - Meeting Conflict Card

struct MeetingConflictCard: View {
    let conflict: MeetingConflict
    let onResolve: (ResolutionOption) -> Void

    @State private var showingOptions = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: conflict.type.icon)
                    .foregroundColor(conflictColor)

                Text(conflict.type.displayName)
                    .font(.subheadline)
                    .fontWeight(.semibold)

                Spacer()

                if conflict.autoResolvable {
                    Text("Auto-fix")
                        .font(.caption2)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.green.opacity(0.2))
                        .foregroundColor(.green)
                        .cornerRadius(4)
                }
            }

            Text(conflict.suggestedResolution)
                .font(.caption)
                .foregroundColor(.secondary)

            Button("Resolve") { showingOptions = true }
                .buttonStyle(.bordered)
                .font(.caption)
        }
        .padding()
        .background(conflictColor.opacity(0.1))
        .cornerRadius(12)
        .padding(.horizontal)
        .sheet(isPresented: $showingOptions) {
            ConflictResolutionSheet(
                conflict: conflict,
                onResolve: onResolve
            )
        }
    }

    private var conflictColor: Color {
        switch conflict.type.color {
        case "red": return .red
        case "orange": return .orange
        case "yellow": return .yellow
        case "purple": return .purple
        default: return .orange
        }
    }
}

// MARK: - Conflict Resolution Sheet

struct ConflictResolutionSheet: View {
    let conflict: MeetingConflict
    let onResolve: (ResolutionOption) -> Void
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            List(conflict.resolutionOptions) { option in
                Button(action: {
                    onResolve(option)
                    dismiss()
                }) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(option.description)
                            .font(.subheadline)

                        Text("Impact: \(Int(option.impactScore * 100))%")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
            .navigationTitle("Resolve Conflict")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                #if os(iOS)
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") { dismiss() }
                }
                #else
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                #endif
            }
        }
    }
}
