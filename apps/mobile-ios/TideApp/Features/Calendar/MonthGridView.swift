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
            VStack(spacing: 0) {
                // Month navigation header
                monthNavigationHeader

                // Day of week labels
                dayOfWeekLabels

                Divider()

                // Calendar grid
                if viewModel.isLoading && viewModel.calendarDays.isEmpty {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    calendarGrid
                }
            }
            .navigationTitle("Calendar")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showingNewEvent = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title3)
                    }
                }

                ToolbarItem(placement: .navigationBarLeading) {
                    Button {
                        viewModel.goToToday()
                        Task {
                            await viewModel.loadEvents()
                        }
                    } label: {
                        Text("Today")
                            .fontWeight(.semibold)
                    }
                }
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
    }

    // MARK: - Month Navigation Header
    private var monthNavigationHeader: some View {
        HStack {
            Button {
                viewModel.previousMonth()
                Task {
                    await viewModel.loadEvents()
                }
            } label: {
                Image(systemName: "chevron.left")
                    .font(.title2)
                    .foregroundColor(.blue)
            }

            Spacer()

            Text(viewModel.monthYearString)
                .font(.title2)
                .fontWeight(.bold)

            Spacer()

            Button {
                viewModel.nextMonth()
                Task {
                    await viewModel.loadEvents()
                }
            } label: {
                Image(systemName: "chevron.right")
                    .font(.title2)
                    .foregroundColor(.blue)
            }
        }
        .padding()
        .background(Color(.systemBackground))
    }

    // MARK: - Day of Week Labels
    private var dayOfWeekLabels: some View {
        HStack(spacing: 0) {
            ForEach(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], id: \.self) { day in
                Text(day)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity)
            }
        }
        .padding(.vertical, 8)
        .background(Color(.systemBackground))
    }

    // MARK: - Calendar Grid
    private var calendarGrid: some View {
        ScrollView {
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 2), count: 7), spacing: 2) {
                ForEach(viewModel.calendarDays) { calendarDay in
                    DayCell(calendarDay: calendarDay) {
                        selectedDate = calendarDay.date
                    }
                }
            }
            .padding(2)
        }
    }
}

// MARK: - Day Cell
struct DayCell: View {
    let calendarDay: CalendarDay
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 2) {
                Text("\(calendarDay.day)")
                    .font(.system(size: 16, weight: calendarDay.isToday ? .bold : .regular))
                    .foregroundColor(textColor)

                // Event indicator dots
                if calendarDay.hasEvents {
                    HStack(spacing: 2) {
                        ForEach(0..<min(calendarDay.events.count, 3), id: \.self) { _ in
                            Circle()
                                .fill(Color.blue)
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
            .cornerRadius(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(calendarDay.isToday ? Color.blue : Color.clear, lineWidth: 2)
            )
        }
    }

    private var textColor: Color {
        if !calendarDay.isCurrentMonth {
            return .secondary.opacity(0.5)
        }
        if calendarDay.isToday {
            return .blue
        }
        return .primary
    }

    private var backgroundColor: Color {
        if calendarDay.isToday {
            return Color.blue.opacity(0.1)
        }
        if !calendarDay.isCurrentMonth {
            return Color(.systemGray6)
        }
        return Color(.systemBackground)
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
                VStack(spacing: 16) {
                    // Date header
                    VStack(spacing: 4) {
                        Text(date, style: .date)
                            .font(.title2)
                            .fontWeight(.bold)

                        Text("\(dayEvents.count) event(s)")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding()

                    // Event list
                    if dayEvents.isEmpty {
                        VStack(spacing: 12) {
                            Image(systemName: "calendar.badge.checkmark")
                                .font(.system(size: 48))
                                .foregroundColor(.secondary)

                            Text("No events scheduled")
                                .font(.headline)
                                .foregroundColor(.secondary)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 40)
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
                }
            }
            .task {
                await viewModel.loadEvents()
            }
        }
    }
}

// MARK: - Date Identifiable Extension
extension Date: Identifiable {
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
