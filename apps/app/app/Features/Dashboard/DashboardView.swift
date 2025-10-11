import SwiftUI

struct DashboardView: View {
    @State private var dashboardData: MobileBFFService.DashboardResponse?
    @State private var isLoading = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationView {
            ScrollView {
                if isLoading && dashboardData == nil {
                    // Loading state
                    ProgressView("Loading your day...")
                        .padding()
                } else if let data = dashboardData {
                    // Content
                    VStack(spacing: 20) {
                        // Welcome header
                        VStack(alignment: .leading, spacing: 8) {
                            Text(greetingText)
                                .font(TideTheme.Typography.largeTitle)
                                .fontWeight(.bold)

                            if let user = data.user, let name = user.name {
                                Text(name)
                                    .font(TideTheme.Typography.title2)
                                    .foregroundColor(TideTheme.primary)
                            }
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal)

                        // AI Summary Card
                        AICardView(summary: data.aiSummary)
                            .padding(.horizontal)

                        // Stats cards
                        HStack(spacing: 12) {
                            StatCard(
                                title: "Unread",
                                value: "\(data.stats.unreadEmails)",
                                icon: "envelope.fill",
                                color: TideTheme.primary
                            )

                            StatCard(
                                title: "Events",
                                value: "\(data.stats.upcomingEvents)",
                                icon: "calendar",
                                color: .green
                            )

                            StatCard(
                                title: "Tasks",
                                value: "\(data.stats.todayTasks)",
                                icon: "checkmark.circle.fill",
                                color: .orange
                            )
                        }
                        .padding(.horizontal)

                        // Priority Emails
                        if !data.priorityEmails.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Priority Emails")
                                    .font(TideTheme.Typography.headline)
                                    .fontWeight(.semibold)
                                    .padding(.horizontal)

                                ForEach(data.priorityEmails, id: \.id) { email in
                                    PriorityEmailRow(email: email)
                                        .padding(.horizontal)
                                }
                            }
                        }

                        // Upcoming Events
                        if !data.upcomingEvents.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Upcoming Events")
                                    .font(TideTheme.Typography.headline)
                                    .fontWeight(.semibold)
                                    .padding(.horizontal)

                                ForEach(data.upcomingEvents, id: \.id) { event in
                                    UpcomingEventRow(event: event)
                                        .padding(.horizontal)
                                }
                            }
                        }

                        // Today's Tasks
                        if !data.todayTasks.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Today's Tasks")
                                    .font(TideTheme.Typography.headline)
                                    .fontWeight(.semibold)
                                    .padding(.horizontal)

                                ForEach(data.todayTasks, id: \.id) { task in
                                    TodayTaskRow(task: task)
                                        .padding(.horizontal)
                                }
                            }
                        }
                    }
                    .padding(.vertical)
                } else if let error = errorMessage {
                    // Error state
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 48))
                            .foregroundColor(.orange)

                        Text(error)
                            .font(TideTheme.Typography.body)
                            .foregroundColor(TideTheme.textSecondary)
                            .multilineTextAlignment(.center)

                        Button("Retry") {
                            _Concurrency.Task {
                                await loadDashboard()
                            }
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding()
                }
            }
            .refreshable {
                await loadDashboard()
            }
            .navigationTitle("Dashboard")
            .onAppear {
                if dashboardData == nil {
                    _Concurrency.Task {
                        await loadDashboard()
                    }
                }
            }
        }
    }

    // MARK: - Helpers

    private var greetingText: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 0..<12:
            return "Good Morning"
        case 12..<17:
            return "Good Afternoon"
        default:
            return "Good Evening"
        }
    }

    private func loadDashboard() async {
        isLoading = true
        errorMessage = nil

        do {
            dashboardData = try await MobileBFFService.shared.fetchDashboard()
        } catch {
            errorMessage = "Failed to load dashboard: \(error.localizedDescription)"
            print("❌ Error loading dashboard: \(error)")
        }

        isLoading = false
    }
}

// MARK: - AI Card View
struct AICardView: View {
    let summary: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "brain.head.profile")
                .font(.system(size: 24))
                .foregroundColor(TideTheme.primary)

            Text(summary)
                .font(TideTheme.Typography.body)
                .foregroundColor(TideTheme.textPrimary)

            Spacer()
        }
        .padding()
        .background(TideTheme.primary.opacity(0.1))
        .cornerRadius(12)
    }
}

// MARK: - Stat Card
struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundColor(color)

            Text(value)
                .font(TideTheme.Typography.title2)
                .fontWeight(.bold)

            Text(title)
                .font(TideTheme.Typography.caption1)
                .foregroundColor(TideTheme.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(uiColor: .systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}

// MARK: - Priority Email Row
struct PriorityEmailRow: View {
    let email: MobileBFFService.PriorityEmail

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(email.from)
                    .font(TideTheme.Typography.subheadline)
                    .fontWeight(.semibold)

                Spacer()

                Text(email.receivedAt.relative)
                    .font(TideTheme.Typography.caption1)
                    .foregroundColor(TideTheme.textSecondary)
            }

            Text(email.subject)
                .font(TideTheme.Typography.body)
                .lineLimit(1)

            if let summary = email.summary {
                HStack(spacing: 4) {
                    Image(systemName: "brain.head.profile")
                        .font(TideTheme.Typography.caption2)
                    Text(summary)
                        .font(TideTheme.Typography.caption1)
                }
                .foregroundColor(TideTheme.primary)
            }
        }
        .padding()
        .background(Color(uiColor: .systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}

// MARK: - Upcoming Event Row
struct UpcomingEventRow: View {
    let event: MobileBFFService.UpcomingEvent

    var body: some View {
        HStack(spacing: 12) {
            VStack {
                Text(event.start.formatted(date: .omitted, time: .shortened))
                    .font(TideTheme.Typography.caption1)
                    .fontWeight(.semibold)
            }
            .frame(width: 60)

            VStack(alignment: .leading, spacing: 4) {
                Text(event.title)
                    .font(TideTheme.Typography.subheadline)
                    .fontWeight(.medium)

                if let location = event.location {
                    HStack(spacing: 4) {
                        Image(systemName: "location.fill")
                            .font(TideTheme.Typography.caption2)
                        Text(location)
                            .font(TideTheme.Typography.caption1)
                    }
                    .foregroundColor(TideTheme.textSecondary)
                }

                if event.attendeeCount > 0 {
                    HStack(spacing: 4) {
                        Image(systemName: "person.2.fill")
                            .font(TideTheme.Typography.caption2)
                        Text("\(event.attendeeCount) attendees")
                            .font(TideTheme.Typography.caption1)
                    }
                    .foregroundColor(TideTheme.textSecondary)
                }
            }

            Spacer()
        }
        .padding()
        .background(Color(uiColor: .systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}

// MARK: - Today Task Row
struct TodayTaskRow: View {
    let task: MobileBFFService.TodayTask

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: task.status == "completed" ? "checkmark.circle.fill" : "circle")
                .font(.system(size: 20))
                .foregroundColor(task.status == "completed" ? .green : TideTheme.primary)

            VStack(alignment: .leading, spacing: 4) {
                Text(task.title)
                    .font(TideTheme.Typography.subheadline)
                    .fontWeight(.medium)
                    .strikethrough(task.status == "completed")

                if let dueAt = task.dueAt {
                    Text("Due: \(dueAt.formatted(date: .omitted, time: .shortened))")
                        .font(TideTheme.Typography.caption1)
                        .foregroundColor(TideTheme.textSecondary)
                }
            }

            Spacer()

            // Priority badge
            if task.priority == "high" {
                Text("High")
                    .font(TideTheme.Typography.caption2)
                    .fontWeight(.semibold)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(TideTheme.error.opacity(0.1))
                    .foregroundColor(TideTheme.error)
                    .cornerRadius(8)
            }
        }
        .padding()
        .background(Color(uiColor: .systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}

// MARK: - Preview
#Preview {
    DashboardView()
}
