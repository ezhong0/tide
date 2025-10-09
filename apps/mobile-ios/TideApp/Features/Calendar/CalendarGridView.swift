/**
 * Calendar Grid View
 * Monthly calendar view with events
 */

import SwiftUI

struct CalendarGridView: View {
    @StateObject private var viewModel: CalendarGridViewModel
    @EnvironmentObject var container: DependencyContainer
    @EnvironmentObject var navigationState: NavigationState
    @State private var selectedDate: Date?

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 2), count: 7)

    init(dependencies: DependencyContainer = .shared) {
        self._viewModel = StateObject(wrappedValue: dependencies.makeCalendarViewModel())
    }

    var body: some View {
        VStack(spacing: 0) {
            // Header with month/year and navigation
            CalendarHeader(
                monthYearString: viewModel.monthYearString,
                onPreviousMonth: { viewModel.previousMonth() },
                onNextMonth: { viewModel.nextMonth() },
                onGoToToday: { viewModel.goToToday() }
            )

            Divider()

            // Week day labels
            CalendarWeekDayLabels()

            // Calendar grid with state management
            ScrollView {
                VStack(spacing: Design.Spacing.md) {
                    // Calendar grid
                    calendarGrid

                    // Events for selected date
                    if let date = selectedDate ?? viewModel.today {
                        DateEventsView(
                            date: date,
                            events: viewModel.events(for: date),
                            onAddEvent: { navigateToCreateEvent(date: date) },
                            onEventTap: { eventId in navigateToEventDetail(eventId) }
                        )
                    }
                }
            }
            .stateContent(
                isLoading: viewModel.isLoading,
                error: viewModel.error,
                isEmpty: viewModel.calendarDays.isEmpty,
                retryAction: {
                    Task { await viewModel.loadEvents() }
                }
            ) {
                EmptyView(
                    icon: "calendar",
                    title: "No Calendar Data",
                    message: "Unable to load calendar events",
                    actionTitle: "Retry",
                    action: {
                        Task { await viewModel.loadEvents() }
                    }
                )
            }
        }
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    navigateToCreateEvent()
                } label: {
                    Image(systemName: "plus")
                }
                .accessibilityLabel("Create new event")
                .accessibilityHint("Opens a form to create a new calendar event")
            }
        }
        .task {
            await viewModel.loadEvents()
        }
    }

    // MARK: - Calendar Grid
    @ViewBuilder
    private var calendarGrid: some View {
        LazyVGrid(columns: columns, spacing: Design.Spacing.sm) {
            ForEach(viewModel.calendarDays, id: \.date) { day in
                CalendarDayCell(
                    day: day,
                    isSelected: selectedDate.map { day.date.isSameDay(as: $0) } ?? false,
                    isToday: day.isToday
                )
                .onTapGesture {
                    if day.isCurrentMonth {
                        withAnimation(Design.Animation.standard) {
                            selectedDate = day.date
                        }
                    }
                }
            }
        }
        .padding(.horizontal, Design.Spacing.md)
    }

    // MARK: - Navigation Helpers
    private func navigateToEventDetail(_ eventId: String) {
        navigationState.calendarPath.append(CalendarDestination.detail(eventId: eventId))
    }

    private func navigateToCreateEvent(date: Date? = nil) {
        // TODO: Pass date to create event with pre-filled date
        navigationState.calendarPath.append(CalendarDestination.edit(eventId: nil))
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        CalendarGridView()
            .navigationTitle("Calendar")
            .environmentObject(NavigationState())
    }
}
