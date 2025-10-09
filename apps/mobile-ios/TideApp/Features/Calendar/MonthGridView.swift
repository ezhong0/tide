/**
 * Month Grid View
 * Full month calendar grid with navigation
 */

import SwiftUI

struct MonthGridView: View {
    @StateObject private var viewModel: CalendarGridViewModel
    @EnvironmentObject var container: DependencyContainer
    @State private var selectedDate: Date?
    @State private var showingEventDetail = false
    @State private var showingNewEvent = false

    init(dependencies: DependencyContainer = .shared) {
        self._viewModel = StateObject(wrappedValue: dependencies.makeCalendarViewModel())
    }

    var body: some View {
        NavigationView {
            contentView
        }
    }

    private var contentView: some View {
        VStack(spacing: 0) {
            // Month navigation header
            monthNavigationHeader

            // Day of week labels
            dayOfWeekLabels

            Divider()

            // Calendar grid with state management
            calendarGridWithState
        }
        .navigationTitle("Calendar")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            toolbarContent
        }
        .sheet(isPresented: $showingNewEvent) {
            EventEditView(mode: .create)
                .environmentObject(container)
        }
        .sheet(item: $selectedDate) { date in
            DayAgendaView(date: date)
                .environmentObject(container)
        }
        .task {
            await viewModel.loadEvents()
        }
    }

    @ToolbarContentBuilder
    private var toolbarContent: some ToolbarContent {
        ToolbarItem(placement: .navigationBarTrailing) {
            Button {
                showingNewEvent = true
            } label: {
                Image(systemName: "plus.circle.fill")
                    .font(Design.Typography.Title.bold)
                    .foregroundColor(Design.Colors.Semantic.primary)
            }
        }

        ToolbarItem(placement: .navigationBarLeading) {
            Button {
                withAnimation(Design.Animation.standard) {
                    viewModel.goToToday()
                }
                Task {
                    await viewModel.loadEvents()
                }
            } label: {
                Text("Today")
                    .font(Design.Typography.Body.semibold)
            }
        }
    }

    private var calendarGridWithState: some View {
        calendarGrid
            .stateContent(
                isLoading: viewModel.isLoading,
                error: viewModel.error,
                isEmpty: viewModel.calendarDays.isEmpty,
                retryAction: retryAction,
                emptyContent: emptyStateView
            )
    }

    private func retryAction() {
        Task { await viewModel.loadEvents() }
    }

    private func emptyStateView() -> some View {
        EmptyView(
            icon: "calendar",
            title: "No Calendar Data",
            message: "Unable to load calendar",
            actionTitle: "Retry",
            action: {
                Task { await viewModel.loadEvents() }
            }
        )
    }

    // MARK: - Month Navigation Header
    private var monthNavigationHeader: some View {
        HStack {
            Button {
                withAnimation(Design.Animation.standard) {
                    viewModel.previousMonth()
                }
                Task {
                    await viewModel.loadEvents()
                }
            } label: {
                Image(systemName: "chevron.left")
                    .font(Design.Typography.Title.bold)
                    .foregroundColor(Design.Colors.Semantic.primary)
            }

            Spacer()

            Text(viewModel.monthYearString)
                .font(Design.Typography.Title.bold)

            Spacer()

            Button {
                withAnimation(Design.Animation.standard) {
                    viewModel.nextMonth()
                }
                Task {
                    await viewModel.loadEvents()
                }
            } label: {
                Image(systemName: "chevron.right")
                    .font(Design.Typography.Title.bold)
                    .foregroundColor(Design.Colors.Semantic.primary)
            }
        }
        .padding(Design.Spacing.md)
        .background(Design.ColorHelpers.Background.primary)
    }

    // MARK: - Day of Week Labels
    private var dayOfWeekLabels: some View {
        HStack(spacing: 0) {
            ForEach(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], id: \.self) { day in
                Text(day)
                    .font(Design.Typography.Caption.semibold)
                    .foregroundColor(Design.Colors.Text.secondary)
                    .frame(maxWidth: .infinity)
            }
        }
        .padding(.vertical, Design.Spacing.sm)
        .background(Design.ColorHelpers.Background.primary)
    }

    // MARK: - Calendar Grid
    private var calendarGrid: some View {
        ScrollView {
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: Design.Spacing.xxs), count: 7), spacing: Design.Spacing.xxs) {
                ForEach(viewModel.calendarDays) { calendarDay in
                    DayCell(calendarDay: calendarDay) {
                        withAnimation(Design.Animation.standard) {
                            selectedDate = calendarDay.date
                        }
                    }
                }
            }
            .padding(Design.Spacing.xxs)
        }
    }
}

// MARK: - Day Cell
struct DayCell: View {
    let calendarDay: CalendarDay
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(spacing: Design.Spacing.xxs) {
                Text("\(calendarDay.day)")
                    .font(.system(size: 16, weight: calendarDay.isToday ? .bold : .regular))
                    .foregroundColor(textColor)

                // Event indicator dots
                if calendarDay.hasEvents {
                    HStack(spacing: Design.Spacing.xxs) {
                        ForEach(0..<min(calendarDay.events.count, 3), id: \.self) { _ in
                            Circle()
                                .fill(Design.Colors.Semantic.primary)
                                .frame(width: 4, height: 4)
                        }
                    }
                } else {
                    Spacer()
                        .frame(height: 4)
                }
            }
            .frame(height: 60)
            .frame(maxWidth: .infinity)
            .background(backgroundColor)
            .cornerRadius(Design.CornerRadius.md)
            .overlay(
                RoundedRectangle(cornerRadius: Design.CornerRadius.md)
                    .stroke(calendarDay.isToday ? Design.Colors.Semantic.primary : Color.clear, lineWidth: 2)
            )
        }
    }

    private var textColor: Color {
        if !calendarDay.isCurrentMonth {
            return Design.Colors.Text.secondary.opacity(0.5)
        }
        if calendarDay.isToday {
            return Design.Colors.Semantic.primary
        }
        return Design.Colors.Text.primary
    }

    private var backgroundColor: Color {
        if calendarDay.isToday {
            return Design.Colors.Semantic.primary.opacity(0.1)
        }
        if !calendarDay.isCurrentMonth {
            return Design.ColorHelpers.Background.tertiary
        }
        return Design.ColorHelpers.Background.primary
    }
}

// MARK: - Day Agenda View (for modal)
struct DayAgendaView: View {
    let date: Date
    @StateObject private var viewModel: CalendarGridViewModel
    @EnvironmentObject var container: DependencyContainer
    @Environment(\.dismiss) private var dismiss

    init(date: Date, dependencies: DependencyContainer = .shared) {
        self.date = date
        self._viewModel = StateObject(wrappedValue: dependencies.makeCalendarViewModel())
    }

    var dayEvents: [CalendarEvent] {
        viewModel.events(for: date)
    }

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: Design.Spacing.md) {
                    // Date header
                    VStack(spacing: Design.Spacing.xs) {
                        Text(date, style: .date)
                            .font(Design.Typography.Title.bold)

                        Text("\(dayEvents.count) event(s)")
                            .font(Design.Typography.Body.regular)
                            .foregroundColor(Design.Colors.Text.secondary)
                    }
                    .padding(Design.Spacing.md)

                    // Event list
                    if dayEvents.isEmpty {
                        VStack(spacing: Design.Spacing.sm) {
                            Image(systemName: "calendar.badge.checkmark")
                                .font(.system(size: 48))
                                .foregroundColor(Design.Colors.Text.secondary)

                            Text("No events scheduled")
                                .font(Design.Typography.Headline.bold)
                                .foregroundColor(Design.Colors.Text.secondary)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Design.Spacing.xxl)
                    } else {
                        ForEach(dayEvents) { event in
                            EventCard(event: event)
                        }
                    }
                }
            }
            .navigationTitle("Day Agenda")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .font(Design.Typography.Body.semibold)
                }
            }
            .task {
                await viewModel.loadEvents()
            }
        }
    }
}

// MARK: - Date Identifiable Extension
extension Date: @retroactive Identifiable {
    public var id: TimeInterval {
        self.timeIntervalSince1970
    }
}

// MARK: - Preview
#Preview {
    MonthGridView()
        .environmentObject(DependencyContainer.shared)
}

#Preview("Day Agenda") {
    DayAgendaView(date: Date())
        .environmentObject(DependencyContainer.shared)
}
