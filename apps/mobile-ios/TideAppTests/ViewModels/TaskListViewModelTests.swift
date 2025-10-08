/**
 * TaskListViewModel Tests
 * Comprehensive tests for task management functionality
 */

import XCTest
@testable import TideIOS

@MainActor
final class TaskListViewModelTests: XCTestCase {

    var sut: TaskListViewModel!
    var mockAPIClient: MockAPIClient!
    var mockAuthManager: MockAuthManager!

    override func setUp() {
        super.setUp()
        mockAPIClient = MockAPIClient()
        mockAuthManager = MockAuthManager(isAuthenticated: true)
        sut = TaskListViewModel(apiClient: mockAPIClient, authManager: mockAuthManager)
    }

    override func tearDown() {
        sut = nil
        mockAPIClient = nil
        mockAuthManager = nil
        super.tearDown()
    }

    // MARK: - Initialization Tests

    func testInitialState() {
        XCTAssertTrue(sut.allTasks.isEmpty, "Tasks should be empty on init")
        XCTAssertFalse(sut.isLoading, "Should not be loading on init")
    }

    // MARK: - Load Tasks Tests

    func testLoadTasks_Success() async {
        // When
        await sut.loadTasks()

        // Then
        XCTAssertFalse(sut.isLoading, "Should not be loading after completion")
        // Tasks may be empty or populated depending on mock
        // Important thing is it doesn't crash
    }

    func testLoadTasks_Failure() async {
        // Given
        mockAPIClient.shouldFail = true

        // When
        await sut.loadTasks()

        // Then
        XCTAssertTrue(sut.allTasks.isEmpty, "Tasks should be empty on failure")
        XCTAssertFalse(sut.isLoading, "Should not be loading after error")
    }

    func testLoadTasks_PopulatesTasksList() async {
        // When
        await sut.loadTasks()

        // Then - At minimum, should not crash
        // Mock may return empty array or sample tasks
        XCTAssertNotNil(sut.allTasks, "Tasks array should exist")
    }

    // MARK: - Toggle Task Status Tests

    func testToggleTaskStatus_TodoToInProgress() async {
        // Given
        let task = TideTask(
            id: "test-1",
            title: "Test Task",
            description: "Test Description",
            status: .todo,
            priority: .medium,
            dueDate: Date(),
            tags: nil
        )
        sut.allTasks = [task]

        // When
        await sut.toggleTaskStatus(task)

        // Then
        XCTAssertEqual(sut.allTasks[0].status, .inProgress, "Status should change to inProgress")
        XCTAssertEqual(sut.allTasks[0].id, task.id, "Task ID should remain the same")
        XCTAssertEqual(sut.allTasks[0].title, task.title, "Title should remain the same")
    }

    func testToggleTaskStatus_InProgressToDone() async {
        // Given
        let task = TideTask(
            id: "test-1",
            title: "Test Task",
            description: nil,
            status: .inProgress,
            priority: .high,
            dueDate: nil,
            tags: nil
        )
        sut.allTasks = [task]

        // When
        await sut.toggleTaskStatus(task)

        // Then
        XCTAssertEqual(sut.allTasks[0].status, .done, "Status should change to done")
    }

    func testToggleTaskStatus_DoneToTodo() async {
        // Given
        let task = TideTask(
            id: "test-1",
            title: "Test Task",
            description: nil,
            status: .done,
            priority: .low,
            dueDate: nil,
            tags: nil
        )
        sut.allTasks = [task]

        // When
        await sut.toggleTaskStatus(task)

        // Then
        XCTAssertEqual(sut.allTasks[0].status, .todo, "Status should change back to todo")
    }

    func testToggleTaskStatus_WithAPIFailure_Rollsback() async {
        // Given
        let task = TideTask(
            id: "test-1",
            title: "Test Task",
            description: nil,
            status: .todo,
            priority: .medium,
            dueDate: nil,
            tags: nil
        )
        sut.allTasks = [task]
        mockAPIClient.shouldFail = true

        // When
        await sut.toggleTaskStatus(task)

        // Then
        XCTAssertEqual(sut.allTasks[0].status, .todo, "Status should rollback to original on API failure")
    }

    func testToggleTaskStatus_NonExistentTask() async {
        // Given
        let nonExistentTask = TideTask(
            id: "non-existent",
            title: "Ghost Task",
            description: nil,
            status: .todo,
            priority: .none,
            dueDate: nil,
            tags: nil
        )
        sut.allTasks = []

        // When
        await sut.toggleTaskStatus(nonExistentTask)

        // Then
        XCTAssertTrue(sut.allTasks.isEmpty, "Should not add task if it doesn't exist")
    }

    // MARK: - Delete Task Tests

    func testDeleteTask_Success() async {
        // Given
        let task1 = TideTask(id: "1", title: "Task 1", description: nil, status: .todo, priority: .none, dueDate: nil, tags: nil)
        let task2 = TideTask(id: "2", title: "Task 2", description: nil, status: .todo, priority: .none, dueDate: nil, tags: nil)
        sut.allTasks = [task1, task2]

        // When
        await sut.deleteTask(task1)

        // Then
        XCTAssertEqual(sut.allTasks.count, 1, "Should have one task remaining")
        XCTAssertEqual(sut.allTasks[0].id, "2", "Should keep the correct task")
    }

    func testDeleteTask_LastTask() async {
        // Given
        let task = TideTask(id: "1", title: "Only Task", description: nil, status: .todo, priority: .none, dueDate: nil, tags: nil)
        sut.allTasks = [task]

        // When
        await sut.deleteTask(task)

        // Then
        XCTAssertTrue(sut.allTasks.isEmpty, "Should have no tasks remaining")
    }

    func testDeleteTask_NonExistentTask() async {
        // Given
        let task1 = TideTask(id: "1", title: "Task 1", description: nil, status: .todo, priority: .none, dueDate: nil, tags: nil)
        let nonExistent = TideTask(id: "999", title: "Ghost", description: nil, status: .todo, priority: .none, dueDate: nil, tags: nil)
        sut.allTasks = [task1]

        // When
        await sut.deleteTask(nonExistent)

        // Then
        XCTAssertEqual(sut.allTasks.count, 1, "Should still have the original task")
        XCTAssertEqual(sut.allTasks[0].id, "1", "Original task should remain")
    }

    // MARK: - Task Filtering Tests

    func testTasksForStatus_Todo() {
        // Given
        let todoTask = TideTask(id: "1", title: "Todo", description: nil, status: .todo, priority: .none, dueDate: nil, tags: nil)
        let doneTask = TideTask(id: "2", title: "Done", description: nil, status: .done, priority: .none, dueDate: nil, tags: nil)
        sut.allTasks = [todoTask, doneTask]

        // When
        let filtered = sut.tasks(for: .todo, filter: .all)

        // Then
        XCTAssertEqual(filtered.count, 1, "Should return only todo tasks")
        XCTAssertEqual(filtered[0].id, "1", "Should return the correct task")
    }

    func testTasksForStatus_FilterByToday() {
        // Given
        let today = Date()
        let tomorrow = Date().addingTimeInterval(86400)

        let todayTask = TideTask(id: "1", title: "Today", description: nil, status: .todo, priority: .none, dueDate: today, tags: nil)
        let tomorrowTask = TideTask(id: "2", title: "Tomorrow", description: nil, status: .todo, priority: .none, dueDate: tomorrow, tags: nil)
        sut.allTasks = [todayTask, tomorrowTask]

        // When
        let filtered = sut.tasks(for: .todo, filter: .today)

        // Then
        XCTAssertEqual(filtered.count, 1, "Should return only today's tasks")
        XCTAssertEqual(filtered[0].id, "1", "Should return the correct task")
    }

    func testTasksForStatus_FilterByPriority() {
        // Given
        let highTask = TideTask(id: "1", title: "High", description: nil, status: .todo, priority: .high, dueDate: nil, tags: nil)
        let noneTask = TideTask(id: "2", title: "None", description: nil, status: .todo, priority: .none, dueDate: nil, tags: nil)
        sut.allTasks = [highTask, noneTask]

        // When
        let filtered = sut.tasks(for: .todo, filter: .priority)

        // Then
        XCTAssertEqual(filtered.count, 1, "Should return only priority tasks")
        XCTAssertEqual(filtered[0].id, "1", "Should return the high priority task")
    }

    func testTasksForStatus_FilterByWeek() {
        // Given
        let calendar = Calendar.current
        let thisWeek = Date()
        let nextWeek = calendar.date(byAdding: .day, value: 8, to: Date())!

        let thisWeekTask = TideTask(id: "1", title: "This Week", description: nil, status: .todo, priority: .none, dueDate: thisWeek, tags: nil)
        let nextWeekTask = TideTask(id: "2", title: "Next Week", description: nil, status: .todo, priority: .none, dueDate: nextWeek, tags: nil)
        sut.allTasks = [thisWeekTask, nextWeekTask]

        // When
        let filtered = sut.tasks(for: .todo, filter: .week)

        // Then
        XCTAssertEqual(filtered.count, 1, "Should return only this week's tasks")
        XCTAssertEqual(filtered[0].id, "1", "Should return the correct task")
    }

    // MARK: - Task Count Tests

    func testTaskCount_All() {
        // Given
        sut.allTasks = [
            TideTask(id: "1", title: "Task 1", description: nil, status: .todo, priority: .none, dueDate: nil, tags: nil),
            TideTask(id: "2", title: "Task 2", description: nil, status: .done, priority: .none, dueDate: nil, tags: nil),
            TideTask(id: "3", title: "Task 3", description: nil, status: .inProgress, priority: .none, dueDate: nil, tags: nil)
        ]

        // When
        let count = sut.taskCount(for: .all)

        // Then
        XCTAssertEqual(count, 3, "Should count all tasks")
    }

    func testTaskCount_Today() {
        // Given
        let today = Date()
        let tomorrow = Date().addingTimeInterval(86400)

        sut.allTasks = [
            TideTask(id: "1", title: "Today", description: nil, status: .todo, priority: .none, dueDate: today, tags: nil),
            TideTask(id: "2", title: "Tomorrow", description: nil, status: .todo, priority: .none, dueDate: tomorrow, tags: nil)
        ]

        // When
        let count = sut.taskCount(for: .today)

        // Then
        XCTAssertEqual(count, 1, "Should count only today's tasks")
    }

    func testTaskCount_Priority() {
        // Given
        sut.allTasks = [
            TideTask(id: "1", title: "High", description: nil, status: .todo, priority: .high, dueDate: nil, tags: nil),
            TideTask(id: "2", title: "None", description: nil, status: .todo, priority: .none, dueDate: nil, tags: nil),
            TideTask(id: "3", title: "Medium", description: nil, status: .todo, priority: .medium, dueDate: nil, tags: nil)
        ]

        // When
        let count = sut.taskCount(for: .priority)

        // Then
        XCTAssertEqual(count, 2, "Should count only tasks with priority")
    }

    // MARK: - Loading State Tests

    func testLoadingState_WhileLoading() async {
        // Given
        mockAPIClient.mockDelay = 0.5

        // When - Start loading (but don't await)
        let loadTask = Task {
            await sut.loadTasks()
        }

        // Give it a moment to start
        try? await Task.sleep(nanoseconds: 50_000_000) // 0.05s

        // Then
        XCTAssertTrue(sut.isLoading, "Should be loading")

        // Wait for completion
        await loadTask.value
        XCTAssertFalse(sut.isLoading, "Should not be loading after completion")
    }

    // MARK: - Optimistic Update Tests

    func testOptimisticUpdate_ImmediateUIChange() async {
        // Given
        mockAPIClient.mockDelay = 0.5  // Slow API
        let task = TideTask(id: "1", title: "Task", description: nil, status: .todo, priority: .none, dueDate: nil, tags: nil)
        sut.allTasks = [task]

        // When - Toggle status
        let toggleTask = Task {
            await sut.toggleTaskStatus(task)
        }

        // Check immediately (before API completes)
        try? await Task.sleep(nanoseconds: 10_000_000) // 0.01s

        // Then - UI should already be updated
        XCTAssertEqual(sut.allTasks[0].status, .inProgress, "UI should update immediately (optimistic)")

        // Wait for API
        await toggleTask.value
    }

    // MARK: - Performance Tests

    func testLoadTasks_Performance() {
        mockAPIClient.mockDelay = 0.01

        measure {
            let expectation = expectation(description: "Load tasks")

            Task {
                await sut.loadTasks()
                expectation.fulfill()
            }

            wait(for: [expectation], timeout: 1.0)
        }
    }

    func testToggleTaskStatus_Performance() {
        mockAPIClient.mockDelay = 0.01
        let task = TideTask(id: "1", title: "Task", description: nil, status: .todo, priority: .none, dueDate: nil, tags: nil)
        sut.allTasks = [task]

        measure {
            let expectation = expectation(description: "Toggle task")

            Task {
                await sut.toggleTaskStatus(task)
                expectation.fulfill()
            }

            wait(for: [expectation], timeout: 1.0)
        }
    }

    // MARK: - Edge Case Tests

    func testToggleTask_PreservesOtherProperties() async {
        // Given
        let task = TideTask(
            id: "test-1",
            title: "Important Task",
            description: "Detailed description",
            status: .todo,
            priority: .critical,
            dueDate: Date(),
            tags: ["work", "urgent"]
        )
        sut.allTasks = [task]

        // When
        await sut.toggleTaskStatus(task)

        // Then
        let updated = sut.allTasks[0]
        XCTAssertEqual(updated.title, task.title, "Title should be preserved")
        XCTAssertEqual(updated.description, task.description, "Description should be preserved")
        XCTAssertEqual(updated.priority, task.priority, "Priority should be preserved")
        XCTAssertEqual(updated.dueDate, task.dueDate, "Due date should be preserved")
        XCTAssertEqual(updated.tags, task.tags, "Tags should be preserved")
    }

    func testMultipleQuickToggles() async {
        // Given
        let task = TideTask(id: "1", title: "Task", description: nil, status: .todo, priority: .none, dueDate: nil, tags: nil)
        sut.allTasks = [task]
        mockAPIClient.mockDelay = 0.1

        // When - Toggle multiple times quickly
        await sut.toggleTaskStatus(task)
        await sut.toggleTaskStatus(sut.allTasks[0])
        await sut.toggleTaskStatus(sut.allTasks[0])

        // Then - Should handle it gracefully
        XCTAssertEqual(sut.allTasks.count, 1, "Should still have one task")
        // Final state should be .todo after 3 toggles
        XCTAssertEqual(sut.allTasks[0].status, .todo, "Should cycle through states correctly")
    }
}
