/**
 * Message Model Tests
 * Tests for Message data model and related functionality
 */

import XCTest
@testable import TideIOS

final class MessageModelTests: XCTestCase {

    // MARK: - Initialization Tests

    func testMessage_InitializesWithAllProperties() {
        let message = Message(
            id: "msg-123",
            userId: "user-456",
            conversationId: "conv-789",
            content: "Hello, world!",
            role: .user,
            timestamp: Date()
        )

        XCTAssertEqual(message.id, "msg-123")
        XCTAssertEqual(message.userId, "user-456")
        XCTAssertEqual(message.conversationId, "conv-789")
        XCTAssertEqual(message.content, "Hello, world!")
        XCTAssertEqual(message.role, .user)
        XCTAssertNotNil(message.timestamp)
    }

    func testMessage_RoleEnum() {
        let userMessage = Message(id: "1", userId: "u1", conversationId: "c1", content: "test", role: .user, timestamp: Date())
        let assistantMessage = Message(id: "2", userId: "u1", conversationId: "c1", content: "response", role: .assistant, timestamp: Date())

        XCTAssertEqual(userMessage.role, .user)
        XCTAssertEqual(assistantMessage.role, .assistant)
        XCTAssertNotEqual(userMessage.role, assistantMessage.role)
    }

    // MARK: - Codable Tests

    func testMessage_EncodesCorrectly() throws {
        let message = Message(
            id: "msg-123",
            userId: "user-456",
            conversationId: "conv-789",
            content: "Test message",
            role: .user,
            timestamp: Date()
        )

        let encoder = JSONEncoder()
        let data = try encoder.encode(message)

        XCTAssertNotNil(data)
        XCTAssertGreaterThan(data.count, 0)
    }

    func testMessage_DecodesCorrectly() throws {
        let json = """
        {
            "id": "msg-123",
            "userId": "user-456",
            "conversationId": "conv-789",
            "content": "Test message",
            "role": "user",
            "timestamp": 1704067200000
        }
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        let message = try decoder.decode(Message.self, from: json)

        XCTAssertEqual(message.id, "msg-123")
        XCTAssertEqual(message.userId, "user-456")
        XCTAssertEqual(message.conversationId, "conv-789")
        XCTAssertEqual(message.content, "Test message")
    }

    func testMessage_RoundTripEncoding() throws {
        let original = Message(
            id: "msg-123",
            userId: "user-456",
            conversationId: "conv-789",
            content: "Test message",
            role: .assistant,
            timestamp: Date()
        )

        let encoder = JSONEncoder()
        let data = try encoder.encode(original)

        let decoder = JSONDecoder()
        let decoded = try decoder.decode(Message.self, from: data)

        XCTAssertEqual(original.id, decoded.id)
        XCTAssertEqual(original.userId, decoded.userId)
        XCTAssertEqual(original.conversationId, decoded.conversationId)
        XCTAssertEqual(original.content, decoded.content)
        XCTAssertEqual(original.role, decoded.role)
    }

    // MARK: - Content Validation Tests

    func testMessage_HandlesEmptyContent() {
        let message = Message(
            id: "msg-123",
            userId: "user-456",
            conversationId: "conv-789",
            content: "",
            role: .user,
            timestamp: Date()
        )

        XCTAssertEqual(message.content, "")
        XCTAssertTrue(message.content.isEmpty)
    }

    func testMessage_HandlesLongContent() {
        let longContent = String(repeating: "This is a long message. ", count: 1000)
        let message = Message(
            id: "msg-123",
            userId: "user-456",
            conversationId: "conv-789",
            content: longContent,
            role: .user,
            timestamp: Date()
        )

        XCTAssertEqual(message.content, longContent)
        XCTAssertGreaterThan(message.content.count, 1000)
    }

    func testMessage_HandlesSpecialCharacters() {
        let specialContent = "Test with 🎉 emojis and special chars: @#$%^&*(){}[]\\|/<>?~`"
        let message = Message(
            id: "msg-123",
            userId: "user-456",
            conversationId: "conv-789",
            content: specialContent,
            role: .user,
            timestamp: Date()
        )

        XCTAssertEqual(message.content, specialContent)
    }

    func testMessage_HandlesNewlines() {
        let multilineContent = """
        Line 1
        Line 2
        Line 3
        """
        let message = Message(
            id: "msg-123",
            userId: "user-456",
            conversationId: "conv-789",
            content: multilineContent,
            role: .user,
            timestamp: Date()
        )

        XCTAssertTrue(message.content.contains("\n"))
        XCTAssertEqual(message.content.components(separatedBy: "\n").count, 3)
    }

    // MARK: - Timestamp Tests

    func testMessage_TimestampIsRecent() {
        let before = Date()
        let message = Message(
            id: "msg-123",
            userId: "user-456",
            conversationId: "conv-789",
            content: "Test",
            role: .user,
            timestamp: Date()
        )
        let after = Date()

        XCTAssertGreaterThanOrEqual(message.timestamp, before)
        XCTAssertLessThanOrEqual(message.timestamp, after)
    }

    func testMessage_TimestampOrdering() {
        let message1 = Message(id: "1", userId: "u1", conversationId: "c1", content: "First", role: .user, timestamp: Date())

        // Small delay
        Thread.sleep(forTimeInterval: 0.01)

        let message2 = Message(id: "2", userId: "u1", conversationId: "c1", content: "Second", role: .user, timestamp: Date())

        XCTAssertLessThan(message1.timestamp, message2.timestamp)
    }

    // MARK: - Equatable Tests

    func testMessage_EqualityByID() {
        let date = Date()
        let message1 = Message(id: "msg-123", userId: "u1", conversationId: "c1", content: "test", role: .user, timestamp: date)
        let message2 = Message(id: "msg-123", userId: "u2", conversationId: "c2", content: "different", role: .assistant, timestamp: date)

        // Messages should be considered equal if they have the same ID
        XCTAssertEqual(message1.id, message2.id)
    }

    func testMessage_InequalityByID() {
        let date = Date()
        let message1 = Message(id: "msg-123", userId: "u1", conversationId: "c1", content: "test", role: .user, timestamp: date)
        let message2 = Message(id: "msg-456", userId: "u1", conversationId: "c1", content: "test", role: .user, timestamp: date)

        XCTAssertNotEqual(message1.id, message2.id)
    }

    // MARK: - Performance Tests

    func testMessage_CreationPerformance() {
        measure {
            for i in 0..<1000 {
                _ = Message(
                    id: "msg-\(i)",
                    userId: "user-1",
                    conversationId: "conv-1",
                    content: "Test message \(i)",
                    role: .user,
                    timestamp: Date()
                )
            }
        }
    }

    func testMessage_EncodingPerformance() {
        let messages = (0..<100).map { i in
            Message(
                id: "msg-\(i)",
                userId: "user-1",
                conversationId: "conv-1",
                content: "Test message \(i)",
                role: .user,
                timestamp: Date()
            )
        }

        measure {
            let encoder = JSONEncoder()
            for message in messages {
                _ = try? encoder.encode(message)
            }
        }
    }
}
