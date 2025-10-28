import SwiftUI

struct DashboardView: View {
    @State private var dashboardData: MobileBFFService.DashboardResponse?
    @State private var isLoading = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationView {
            ZStack {
                // Subtle gradient background
                TideTheme.Gradients.subtle
                    .ignoresSafeArea()

                ScrollView {
                    if isLoading && dashboardData == nil {
                        // Loading state with skeleton
                        VStack(spacing: TideTheme.Spacing.lg) {
                            SkeletonHeader()
                            SkeletonAICard()
                            SkeletonStatsRow()
                        }
                        .padding()
                    } else if let data = (PREVIEW_MODE ? MockData.mockDashboardResponse() : dashboardData) {
                        // Content
                        VStack(spacing: TideTheme.Spacing.lg) {
                            // Welcome header with animation
                            VStack(alignment: .leading, spacing: TideTheme.Spacing.sm) {
                                Text(greetingText)
                                    .font(TideTheme.Typography.largeTitle)
                                    .fontWeight(.bold)
                                    .foregroundColor(TideTheme.textPrimary)

                                if let user = data.user, let name = user.name {
                                    Text(name)
                                        .font(TideTheme.Typography.title2)
                                        .foregroundStyle(TideTheme.Gradients.ocean)
                                }
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.horizontal, TideTheme.Spacing.md)
                            .padding(.top, TideTheme.Spacing.sm)

                            // AI Summary Card - Premium Design
                            AICardView(summary: data.aiSummary)
                                .padding(.horizontal, TideTheme.Spacing.md)

                            // Stats cards with gradients
                            HStack(spacing: TideTheme.Spacing.md) {
                                StatCard(
                                    title: "Unread",
                                    value: "\(data.stats.unreadEmails)",
                                    icon: "envelope.fill",
                                    gradient: TideTheme.Gradients.primary
                                )

                                StatCard(
                                    title: "Events",
                                    value: "\(data.stats.upcomingEvents)",
                                    icon: "calendar",
                                    gradient: TideTheme.Gradients.secondary
                                )

                                StatCard(
                                    title: "Tasks",
                                    value: "\(data.stats.todayTasks)",
                                    icon: "checkmark.circle.fill",
                                    gradient: TideTheme.Gradients.sunset
                                )
                            }
                            .padding(.horizontal, TideTheme.Spacing.md)

                            // Priority Emails
                            if !data.priorityEmails.isEmpty {
                                VStack(alignment: .leading, spacing: TideTheme.Spacing.md) {
                                    Text("Priority Emails")
                                        .tideSectionHeader()
                                        .padding(.horizontal, TideTheme.Spacing.md)

                                    VStack(spacing: TideTheme.Spacing.sm) {
                                        ForEach(data.priorityEmails, id: \.id) { email in
                                            PriorityEmailRow(email: email)
                                        }
                                    }
                                    .padding(.horizontal, TideTheme.Spacing.md)
                                }
                            }

                            // Upcoming Events
                            if !data.upcomingEvents.isEmpty {
                                VStack(alignment: .leading, spacing: TideTheme.Spacing.md) {
                                    Text("Upcoming Events")
                                        .tideSectionHeader()
                                        .padding(.horizontal, TideTheme.Spacing.md)

                                    VStack(spacing: TideTheme.Spacing.sm) {
                                        ForEach(data.upcomingEvents, id: \.id) { event in
                                            UpcomingEventRow(event: event)
                                        }
                                    }
                                    .padding(.horizontal, TideTheme.Spacing.md)
                                }
                            }

                            // Today's Tasks
                            if !data.todayTasks.isEmpty {
                                VStack(alignment: .leading, spacing: TideTheme.Spacing.md) {
                                    Text("Today's Tasks")
                                        .tideSectionHeader()
                                        .padding(.horizontal, TideTheme.Spacing.md)

                                    VStack(spacing: TideTheme.Spacing.sm) {
                                        ForEach(data.todayTasks, id: \.id) { task in
                                            TodayTaskRow(task: task)
                                        }
                                    }
                                    .padding(.horizontal, TideTheme.Spacing.md)
                                }
                            }
                        }
                        .padding(.vertical, TideTheme.Spacing.md)
                    } else if let error = errorMessage {
                        // Error state
                        VStack(spacing: TideTheme.Spacing.lg) {
                            Image(systemName: "exclamationmark.triangle")
                                .font(.system(size: 48))
                                .foregroundStyle(TideTheme.Gradients.sunset)

                            Text(error)
                                .font(TideTheme.Typography.body)
                                .foregroundColor(TideTheme.textSecondary)
                                .multilineTextAlignment(.center)

                            Text("Retry")
                                .tidePrimaryButton()
                                .onTapGesture {
                                    _Concurrency.Task {
                                        await loadDashboard()
                                    }
                                }
                                .padding(.horizontal, TideTheme.Spacing.xxl)
                        }
                        .padding()
                    }
                }
                .refreshable {
                    await loadDashboard()
                }
            }
            .navigationTitle("Dashboard")
            .navigationBarTitleDisplayMode(.inline)
            .onAppear {
                if !PREVIEW_MODE && dashboardData == nil {
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
    @State private var isAnimating = false

    var body: some View {
        HStack(spacing: TideTheme.Spacing.md) {
            // Animated AI brain icon
            ZStack {
                Circle()
                    .fill(TideTheme.Gradients.primary)
                    .frame(width: 48, height: 48)
                    .scaleEffect(isAnimating ? 1.1 : 1.0)
                    .opacity(0.2)

                Image(systemName: "brain.head.profile")
                    .font(.system(size: 24, weight: .semibold))
                    .foregroundColor(.white)
            }

            VStack(alignment: .leading, spacing: TideTheme.Spacing.xs) {
                Text("AI Summary")
                    .font(TideTheme.Typography.caption1Emphasized)
                    .foregroundColor(.white.opacity(0.9))

                Text(summary)
                    .font(TideTheme.Typography.subheadline)
                    .foregroundColor(.white)
                    .lineLimit(3)
            }

            Spacer()
        }
        .padding(TideTheme.Spacing.md)
        .tideCardGradient(gradient: TideTheme.Gradients.ocean)
        .onAppear {
            withAnimation(
                .easeInOut(duration: 2.0)
                .repeatForever(autoreverses: true)
            ) {
                isAnimating = true
            }
        }
    }
}

// MARK: - Stat Card
struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let gradient: LinearGradient

    var body: some View {
        VStack(spacing: TideTheme.Spacing.sm) {
            // Icon with gradient background
            ZStack {
                Circle()
                    .fill(gradient)
                    .frame(width: 44, height: 44)
                    .opacity(0.15)

                Image(systemName: icon)
                    .font(.system(size: TideTheme.Size.iconMedium))
                    .foregroundStyle(gradient)
            }

            Text(value)
                .font(TideTheme.Typography.title2)
                .fontWeight(.bold)
                .foregroundColor(TideTheme.textPrimary)

            Text(title)
                .font(TideTheme.Typography.caption1)
                .foregroundColor(TideTheme.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, TideTheme.Spacing.md)
        .tideCardPremium()
    }
}

// MARK: - Priority Email Row
struct PriorityEmailRow: View {
    let email: MobileBFFService.PriorityEmail

    var body: some View {
        HStack(spacing: TideTheme.Spacing.md) {
            // Avatar placeholder with gradient
            ZStack {
                Circle()
                    .fill(TideTheme.Gradients.purple)
                    .frame(width: TideTheme.Size.avatarMedium, height: TideTheme.Size.avatarMedium)

                Text(email.from.prefix(1).uppercased())
                    .font(TideTheme.Typography.headline)
                    .foregroundColor(.white)
            }

            VStack(alignment: .leading, spacing: TideTheme.Spacing.xs) {
                HStack {
                    Text(email.from)
                        .font(TideTheme.Typography.subheadlineEmphasized)
                        .foregroundColor(TideTheme.textPrimary)

                    Spacer()

                    Text(email.receivedAt.relative)
                        .font(TideTheme.Typography.caption1)
                        .foregroundColor(TideTheme.textTertiary)
                }

                Text(email.subject)
                    .font(TideTheme.Typography.body)
                    .foregroundColor(TideTheme.textPrimary)
                    .lineLimit(1)

                if let summary = email.summary {
                    HStack(spacing: TideTheme.Spacing.xs) {
                        Image(systemName: "sparkles")
                            .font(TideTheme.Typography.caption2)
                        Text(summary)
                            .font(TideTheme.Typography.caption1)
                    }
                    .foregroundStyle(TideTheme.Gradients.primary)
                }
            }
        }
        .padding(TideTheme.Spacing.md)
        .tideCard()
    }
}

// MARK: - Upcoming Event Row
struct UpcomingEventRow: View {
    let event: MobileBFFService.UpcomingEvent

    var body: some View {
        HStack(spacing: TideTheme.Spacing.md) {
            // Time indicator with accent
            VStack(spacing: TideTheme.Spacing.xxs) {
                Text(event.start.formatted(date: .omitted, time: .shortened))
                    .font(TideTheme.Typography.footnoteEmphasized)
                    .foregroundStyle(TideTheme.Gradients.secondary)

                Rectangle()
                    .fill(TideTheme.Gradients.secondary)
                    .frame(width: 2, height: 24)
            }
            .frame(width: 60)

            VStack(alignment: .leading, spacing: TideTheme.Spacing.xs) {
                Text(event.title)
                    .font(TideTheme.Typography.subheadlineEmphasized)
                    .foregroundColor(TideTheme.textPrimary)
                    .lineLimit(2)

                if let location = event.location {
                    Label(location, systemImage: "location.fill")
                        .font(TideTheme.Typography.caption1)
                        .foregroundColor(TideTheme.textSecondary)
                }

                if event.attendeeCount > 0 {
                    Label("\(event.attendeeCount) attendees", systemImage: "person.2.fill")
                        .font(TideTheme.Typography.caption1)
                        .foregroundColor(TideTheme.textSecondary)
                }
            }

            Spacer()
        }
        .padding(TideTheme.Spacing.md)
        .tideCard()
    }
}

// MARK: - Today Task Row
struct TodayTaskRow: View {
    let task: MobileBFFService.TodayTask

    var body: some View {
        HStack(spacing: TideTheme.Spacing.md) {
            // Completion indicator
            ZStack {
                Circle()
                    .stroke(task.status == "completed" ? TideTheme.success : TideTheme.primary, lineWidth: 2)
                    .frame(width: 24, height: 24)

                if task.status == "completed" {
                    Image(systemName: "checkmark")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(TideTheme.success)
                }
            }

            VStack(alignment: .leading, spacing: TideTheme.Spacing.xs) {
                Text(task.title)
                    .font(TideTheme.Typography.subheadlineEmphasized)
                    .foregroundColor(TideTheme.textPrimary)
                    .strikethrough(task.status == "completed")

                if let dueAt = task.dueAt {
                    Label(
                        "Due: \(dueAt.formatted(date: .omitted, time: .shortened))",
                        systemImage: "clock"
                    )
                    .font(TideTheme.Typography.caption1)
                    .foregroundColor(TideTheme.textSecondary)
                }
            }

            Spacer()

            // Priority badge
            if task.priority == "high" {
                Text("High")
                    .tideBadge(color: TideTheme.error)
            }
        }
        .padding(TideTheme.Spacing.md)
        .tideCard()
    }
}

// MARK: - Skeleton Loaders
struct SkeletonHeader: View {
    var body: some View {
        VStack(alignment: .leading, spacing: TideTheme.Spacing.sm) {
            Rectangle()
                .fill(TideTheme.border)
                .frame(width: 200, height: 34)
                .cornerRadius(TideTheme.CornerRadius.small)

            Rectangle()
                .fill(TideTheme.border)
                .frame(width: 150, height: 28)
                .cornerRadius(TideTheme.CornerRadius.small)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .shimmering()
    }
}

struct SkeletonAICard: View {
    var body: some View {
        Rectangle()
            .fill(TideTheme.border)
            .frame(height: 100)
            .cornerRadius(TideTheme.CornerRadius.large)
            .shimmering()
    }
}

struct SkeletonStatsRow: View {
    var body: some View {
        HStack(spacing: TideTheme.Spacing.md) {
            ForEach(0..<3) { _ in
                Rectangle()
                    .fill(TideTheme.border)
                    .frame(height: 120)
                    .cornerRadius(TideTheme.CornerRadius.medium)
            }
        }
        .shimmering()
    }
}

// MARK: - Preview
#Preview {
    DashboardView()
}
