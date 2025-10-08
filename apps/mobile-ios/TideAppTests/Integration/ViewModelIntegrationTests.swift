/**
 * ViewModel Integration Tests
 * Tests complete user flows across multiple ViewModels and services
 */

import XCTest
@testable import TideIOS

@MainActor
final class ViewModelIntegrationTests: XCTestCase {

    var container: DependencyContainer!
    var mockAPIClient: MockAPIClient!
    var mockAuthManager: MockAuthManager!
    var mockSupabaseManager: MockSupabaseManager!

    override func setUp() {
        super.setUp()
        mockAPIClient = MockAPIClient()
        mockAuthManager = MockAuthManager(isAuthenticated: true)
        mockSupabaseManager = MockSupabaseManager()

        container = DependencyContainer.makeTestContainer(
            apiClient: mockAPIClient,
            authManager: mockAuthManager,
            supabaseManager: mockSupabaseManager
        )
    }

    override func tearDown() {
        container = nil
        mockAPIClient = nil
        mockAuthManager = nil
        mockSupabaseManager = nil
        super.tearDown()
    }

    // MARK: - Full Chat Flow Integration

    func testFullChatFlow_LoadConversationThenSendMessage() async {
        // Given
        let chatVM = container.makeChatViewModel()

        // When - Load existing conversation
        await chatVM.loadConversation()
        let initialConversationId = chatVM.currentConversationId
        let initialMessageCount = chatVM.messages.count

        // Then - Conversation should be loaded
        XCTAssertNotNil(initialConversationId, "Should load existing conversation")

        // When - Send a new message in the conversation
        await chatVM.sendMessage("How can you help me today?")

        // Then - Message should be added to same conversation
        XCTAssertEqual(chatVM.currentConversationId, initialConversationId, "Should use same conversation")
        XCTAssertGreaterThan(chatVM.messages.count, initialMessageCount, "Should have more messages")
        XCTAssertNil(chatVM.error, "Should not have errors")
    }

    func testFullChatFlow_MultipleMessagesInSequence() async {
        // Given
        let chatVM = container.makeChatViewModel()

        // When - Send multiple messages in sequence
        await chatVM.sendMessage("Hello")
        await chatVM.sendMessage("What's the weather?")
        await chatVM.sendMessage("Thanks!")

        // Then - All messages should be in conversation
        XCTAssertEqual(chatVM.messages.count, 6, "Should have 3 user + 3 assistant messages")
        XCTAssertNotNil(chatVM.currentConversationId, "Should maintain conversation ID")

        // Verify chronological order
        for i in 0..<(chatVM.messages.count - 1) {
            XCTAssertLessThanOrEqual(
                chatVM.messages[i].timestamp,
                chatVM.messages[i + 1].timestamp,
                "Messages should be in chronological order"
            )
        }
    }

    func testFullChatFlow_ErrorRecovery() async {
        // Given
        let chatVM = container.makeChatViewModel()

        // When - Send successful message
        await chatVM.sendMessage("First message")
        XCTAssertEqual(chatVM.messages.count, 2)

        // When - Trigger API failure
        mockAPIClient.shouldFail = true
        await chatVM.sendMessage("This will fail")

        // Then - Error should be shown, messages cleaned up
        XCTAssertNotNil(chatVM.error, "Should have error message")

        // When - Recover and send another message
        mockAPIClient.shouldFail = false
        await chatVM.sendMessage("Recovery message")

        // Then - Should work again
        XCTAssertNil(chatVM.error, "Error should be cleared")
        XCTAssertGreaterThan(chatVM.messages.count, 0, "Should have messages after recovery")
    }

    // MARK: - Full Calendar Flow Integration

    func testFullCalendarFlow_LoadNavigateAndReload() async {
        // Given
        let calendarVM = container.makeCalendarViewModel()

        // When - Load current month events
        await calendarVM.loadEvents()
        let initialEventCount = calendarVM.allEvents.count

        // Then - Events should be loaded
        XCTAssertEqual(calendarVM.calendarDays.count, 42, "Should have 6-week grid")

        // When - Navigate to next month
        calendarVM.nextMonth()
        await calendarVM.loadEvents()

        // Then - Should load different month's events
        XCTAssertEqual(calendarVM.calendarDays.count, 42, "Should maintain 6-week grid")
        // Events may differ (mock returns different data based on date range)

        // When - Navigate back to today
        calendarVM.goToToday()
        await calendarVM.loadEvents()

        // Then - Should be back to current month
        let calendar = Calendar.current
        let todayComponents = calendar.dateComponents([.year, .month], from: Date())
        let currentComponents = calendar.dateComponents([.year, .month], from: calendarVM.currentMonth)
        XCTAssertEqual(todayComponents.year, currentComponents.year)
        XCTAssertEqual(todayComponents.month, currentComponents.month)
    }

    func testFullCalendarFlow_MultiMonthNavigation() async {
        // Given
        let calendarVM = container.makeCalendarViewModel()
        await calendarVM.loadEvents()

        // When - Navigate through 12 months (full year)
        for _ in 0..<12 {
            calendarVM.nextMonth()
            await calendarVM.loadEvents()

            // Then - Each month should have valid calendar
            XCTAssertEqual(calendarVM.calendarDays.count, 42, "Each month should have 42 days")
            XCTAssertFalse(calendarVM.isLoading, "Should complete loading")
        }

        // Then - Should be back to same month (1 year later)
        let calendar = Calendar.current
        let originalMonth = calendar.component(.month, from: Date())
        let currentMonth = calendar.component(.month, from: calendarVM.currentMonth)
        XCTAssertEqual(originalMonth, currentMonth, "Should cycle back to same month")
    }

    func testFullCalendarFlow_EdgeCaseDates() async {
        // Given
        let calendarVM = container.makeCalendarViewModel()
        let calendar = Calendar.current

        // Test leap year February
        let feb2024 = calendar.date(from: DateComponents(year: 2024, month: 2, day: 1))!
        calendarVM.currentMonth = feb2024

        // When
        await calendarVM.loadEvents()

        // Then - Should handle leap year
        XCTAssertEqual(calendarVM.calendarDays.count, 42)
        XCTAssertFalse(calendarVM.isLoading)

        // Test year boundary (Dec → Jan)
        let dec2024 = calendar.date(from: DateComponents(year: 2024, month: 12, day: 31))!
        calendarVM.currentMonth = dec2024

        // When
        calendarVM.nextMonth() // Should cross to Jan 2025
        await calendarVM.loadEvents()

        // Then - Should handle year boundary
        XCTAssertEqual(calendarVM.calendarDays.count, 42)
        XCTAssertFalse(calendarVM.isLoading)
    }

    // MARK: - Full Task Flow Integration

    func testFullTaskFlow_LoadToggleAndVerify() async {
        // Given
        let taskVM = container.makeTaskListViewModel()

        // When - Load tasks
        await taskVM.loadTasks()

        // Then - Tasks should be loaded
        XCTAssertFalse(taskVM.isLoading)
        let initialCount = taskVM.allTasks.count

        // Given - Create a task to toggle
        if initialCount > 0 {
            let firstTask = taskVM.allTasks[0]
            let originalStatus = firstTask.status

            // When - Toggle task status
            await taskVM.toggleTaskStatus(firstTask)

            // Then - Status should change
            XCTAssertNotEqual(taskVM.allTasks[0].status, originalStatus, "Status should toggle")
            XCTAssertEqual(taskVM.allTasks[0].id, firstTask.id, "Should be same task")

            // When - Toggle again
            await taskVM.toggleTaskStatus(taskVM.allTasks[0])

            // Then - Should cycle through statuses
            XCTAssertNotEqual(taskVM.allTasks[0].status, originalStatus, "Should cycle to next status")
        }
    }

    func testFullTaskFlow_LoadFilterAndCount() async {
        // Given
        let taskVM = container.makeTaskListViewModel()

        // When - Load tasks
        await taskVM.loadTasks()
        let totalCount = taskVM.allTasks.count

        // Then - Filter by different statuses
        let todoTasks = taskVM.tasks(for: .todo, filter: .all)
        let inProgressTasks = taskVM.tasks(for: .inProgress, filter: .all)
        let doneTasks = taskVM.tasks(for: .done, filter: .all)

        // Then - Counts should add up
        XCTAssertEqual(todoTasks.count + inProgressTasks.count + doneTasks.count, totalCount,
                      "Filtered tasks should equal total")

        // When - Count tasks by filter
        let allCount = taskVM.taskCount(for: .all)
        let todayCount = taskVM.taskCount(for: .today)
        let priorityCount = taskVM.taskCount(for: .priority)

        // Then - Counts should be valid
        XCTAssertEqual(allCount, totalCount, "All count should match total")
        XCTAssertLessThanOrEqual(todayCount, totalCount, "Today count should be subset")
        XCTAssertLessThanOrEqual(priorityCount, totalCount, "Priority count should be subset")
    }

    func testFullTaskFlow_OptimisticUpdateWithRollback() async {
        // Given
        let taskVM = container.makeTaskListViewModel()
        let testTask = TideTask(
            id: "test-1",
            title: "Test Task",
            description: "Test Description",
            status: .todo,
            priority: .high,
            dueDate: Date(),
            tags: nil
        )
        taskVM.allTasks = [testTask]

        // When - Toggle with slow API
        mockAPIClient.mockDelay = 0.2
        let toggleTask = Task {
            await taskVM.toggleTaskStatus(testTask)
        }

        // Check immediately - should update optimistically
        try? await Task.sleep(nanoseconds: 10_000_000) // 0.01s
        XCTAssertEqual(taskVM.allTasks[0].status, .inProgress, "Should update optimistically")

        // Wait for API
        await toggleTask.value
        XCTAssertEqual(taskVM.allTasks[0].status, .inProgress, "Should maintain update on success")

        // When - Toggle with API failure
        mockAPIClient.shouldFail = true
        let originalStatus = taskVM.allTasks[0].status
        await taskVM.toggleTaskStatus(taskVM.allTasks[0])

        // Then - Should rollback on error
        XCTAssertEqual(taskVM.allTasks[0].status, originalStatus, "Should rollback on API failure")
    }

    func testFullTaskFlow_DeleteAndVerify() async {
        // Given
        let taskVM = container.makeTaskListViewModel()
        let task1 = TideTask(id: "1", title: "Task 1", description: nil, status: .todo, priority: .none, dueDate: nil, tags: nil)
        let task2 = TideTask(id: "2", title: "Task 2", description: nil, status: .todo, priority: .none, dueDate: nil, tags: nil)
        let task3 = TideTask(id: "3", title: "Task 3", description: nil, status: .done, priority: .high, dueDate: nil, tags: nil)
        taskVM.allTasks = [task1, task2, task3]

        // When - Delete middle task
        await taskVM.deleteTask(task2)

        // Then - Task should be removed
        XCTAssertEqual(taskVM.allTasks.count, 2, "Should have 2 tasks remaining")
        XCTAssertEqual(taskVM.allTasks[0].id, "1", "First task should remain")
        XCTAssertEqual(taskVM.allTasks[1].id, "3", "Last task should remain")

        // When - Delete first task
        await taskVM.deleteTask(task1)

        // Then - Only last task remains
        XCTAssertEqual(taskVM.allTasks.count, 1)
        XCTAssertEqual(taskVM.allTasks[0].id, "3")
    }

    // MARK: - Email Flow Integration

    func testFullEmailFlow_LoadAndFilter() async {
        // Given
        let emailVM = container.makeEmailInboxViewModel()

        // When - Load inbox
        await emailVM.loadEmails(category: "inbox")

        // Then - Emails should be loaded
        XCTAssertFalse(emailVM.isLoading)
        let inboxCount = emailVM.emails.count

        // When - Switch to different category
        await emailVM.loadEmails(category: "important")

        // Then - Should load different emails
        XCTAssertFalse(emailVM.isLoading)
        // Mock may return different counts for different categories

        // When - Load sent emails
        await emailVM.loadEmails(category: "sent")

        // Then - Should complete without errors
        XCTAssertFalse(emailVM.isLoading)
        XCTAssertNil(emailVM.error)
    }

    // MARK: - Cross-ViewModel Integration

    func testMultipleViewModelsShareAuthentication() async {
        // Given - All ViewModels created from same container
        let chatVM = container.makeChatViewModel()
        let calendarVM = container.makeCalendarViewModel()
        let taskVM = container.makeTaskListViewModel()
        let emailVM = container.makeEmailInboxViewModel()

        // When - Authenticate (simulate login)
        mockAuthManager.isAuthenticated = true
        mockAuthManager.currentUser = User(
            id: "test-user-123",
            email: "test@example.com",
            name: "Test User"
        )

        // Then - All ViewModels should use same auth state
        // Load data with authenticated user
        await chatVM.loadConversation()
        await calendarVM.loadEvents()
        await taskVM.loadTasks()
        await emailVM.loadEmails(category: "inbox")

        // All should complete without auth errors
        XCTAssertNil(chatVM.error, "Chat should work with auth")
        XCTAssertNil(calendarVM.error, "Calendar should work with auth")
        XCTAssertNil(taskVM.error, "Tasks should work with auth")
        XCTAssertNil(emailVM.error, "Email should work with auth")
    }

    func testMultipleViewModelsHandleUnauthenticated() async {
        // Given - Unauthenticated state
        mockAuthManager.isAuthenticated = false
        mockAuthManager.currentUser = nil

        let chatVM = container.makeChatViewModel()
        let calendarVM = container.makeCalendarViewModel()

        // When - Try to load data without auth
        await chatVM.sendMessage("Test")
        await calendarVM.loadEvents()

        // Then - Should handle gracefully (API returns 401, empty data)
        // ViewModels should not crash
        XCTAssertNotNil(chatVM, "ViewModel should exist")
        XCTAssertNotNil(calendarVM, "ViewModel should exist")
    }

    // MARK: - Concurrent Operations Integration

    func testConcurrentOperationsAcrossViewModels() async {
        // Given
        let chatVM = container.makeChatViewModel()
        let calendarVM = container.makeCalendarViewModel()
        let taskVM = container.makeTaskListViewModel()

        mockAPIClient.mockDelay = 0.1

        // When - Trigger concurrent operations across ViewModels
        await withTaskGroup(of: Void.self) { group in
            group.addTask { await chatVM.sendMessage("Hello") }
            group.addTask { await calendarVM.loadEvents() }
            group.addTask { await taskVM.loadTasks() }
        }

        // Then - All should complete successfully
        XCTAssertFalse(chatVM.isLoading, "Chat should complete")
        XCTAssertFalse(calendarVM.isLoading, "Calendar should complete")
        XCTAssertFalse(taskVM.isLoading, "Tasks should complete")

        XCTAssertNil(chatVM.error, "No errors in chat")
        XCTAssertNil(calendarVM.error, "No errors in calendar")
        XCTAssertNil(taskVM.error, "No errors in tasks")
    }

    // MARK: - Error Propagation Integration

    func testErrorPropagationDoesNotAffectOtherViewModels() async {
        // Given
        let chatVM = container.makeChatViewModel()
        let taskVM = container.makeTaskListViewModel()

        // When - Trigger error in one ViewModel
        mockAPIClient.shouldFail = true
        await chatVM.sendMessage("This will fail")

        // Then - Chat should have error
        XCTAssertNotNil(chatVM.error)

        // When - Other ViewModel operates normally
        mockAPIClient.shouldFail = false
        await taskVM.loadTasks()

        // Then - Task ViewModel should work fine
        XCTAssertNil(taskVM.error, "Task VM should not be affected by chat error")
        XCTAssertFalse(taskVM.isLoading)
    }

    // MARK: - State Consistency Integration

    func testStateConsistencyAfterMultipleOperations() async {
        // Given
        let taskVM = container.makeTaskListViewModel()

        // When - Perform multiple operations
        await taskVM.loadTasks()
        let initialCount = taskVM.allTasks.count

        if initialCount > 0 {
            // Toggle first task
            await taskVM.toggleTaskStatus(taskVM.allTasks[0])
            XCTAssertEqual(taskVM.allTasks.count, initialCount, "Count should stay same after toggle")

            // Toggle again
            await taskVM.toggleTaskStatus(taskVM.allTasks[0])
            XCTAssertEqual(taskVM.allTasks.count, initialCount, "Count should stay same after second toggle")

            // Delete task
            await taskVM.deleteTask(taskVM.allTasks[0])
            XCTAssertEqual(taskVM.allTasks.count, initialCount - 1, "Count should decrease after delete")
        }

        // Then - Reload and verify consistency
        await taskVM.loadTasks()
        XCTAssertFalse(taskVM.isLoading, "Should complete loading")
    }

    // MARK: - Performance Integration

    func testMultipleViewModelsPerformance() {
        measure {
            let expectation = expectation(description: "Multiple ViewModels load")
            mockAPIClient.mockDelay = 0.01

            Task {
                let chatVM = container.makeChatViewModel()
                let calendarVM = container.makeCalendarViewModel()
                let taskVM = container.makeTaskListViewModel()

                await withTaskGroup(of: Void.self) { group in
                    group.addTask { await chatVM.loadConversation() }
                    group.addTask { await calendarVM.loadEvents() }
                    group.addTask { await taskVM.loadTasks() }
                }

                expectation.fulfill()
            }

            wait(for: [expectation], timeout: 1.0)
        }
    }
}
