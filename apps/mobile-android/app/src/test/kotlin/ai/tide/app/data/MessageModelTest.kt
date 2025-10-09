package ai.tide.app.data

import ai.tide.app.data.models.Message
import org.junit.Assert.*
import org.junit.Test
import java.time.Instant

/**
 * Message Model Unit Tests
 * Tests for Message data class and serialization
 */
class MessageModelTest {

    @Test
    fun `message initializes with all properties`() {
        // Given
        val id = "msg-123"
        val userId = "user-456"
        val conversationId = "conv-789"
        val content = "Hello, world!"
        val role = "user"
        val timestamp = Instant.now().toEpochMilli()

        // When
        val message = Message(
            id = id,
            userId = userId,
            conversationId = conversationId,
            content = content,
            role = role,
            timestamp = timestamp
        )

        // Then
        assertEquals(id, message.id)
        assertEquals(userId, message.userId)
        assertEquals(conversationId, message.conversationId)
        assertEquals(content, message.content)
        assertEquals(role, message.role)
        assertEquals(timestamp, message.timestamp)
    }

    @Test
    fun `message handles empty content`() {
        // When
        val message = Message(
            id = "msg-123",
            userId = "user-456",
            conversationId = "conv-789",
            content = "",
            role = "user",
            timestamp = Instant.now().toEpochMilli()
        )

        // Then
        assertTrue(message.content.isEmpty())
    }

    @Test
    fun `message handles long content`() {
        // Given
        val longContent = "This is a long message. ".repeat(1000)

        // When
        val message = Message(
            id = "msg-123",
            userId = "user-456",
            conversationId = "conv-789",
            content = longContent,
            role = "user",
            timestamp = Instant.now().toEpochMilli()
        )

        // Then
        assertEquals(longContent, message.content)
        assertTrue(message.content.length > 1000)
    }

    @Test
    fun `message handles special characters`() {
        // Given
        val specialContent = "Test with 🎉 emojis and special chars: @#\$%^&*(){}[]\\|/<>?~`"

        // When
        val message = Message(
            id = "msg-123",
            userId = "user-456",
            conversationId = "conv-789",
            content = specialContent,
            role = "user",
            timestamp = Instant.now().toEpochMilli()
        )

        // Then
        assertEquals(specialContent, message.content)
    }

    @Test
    fun `message handles multiline content`() {
        // Given
        val multilineContent = """
            Line 1
            Line 2
            Line 3
        """.trimIndent()

        // When
        val message = Message(
            id = "msg-123",
            userId = "user-456",
            conversationId = "conv-789",
            content = multilineContent,
            role = "user",
            timestamp = Instant.now().toEpochMilli()
        )

        // Then
        assertTrue(message.content.contains("\n"))
        assertEquals(3, message.content.lines().size)
    }

    @Test
    fun `message distinguishes between user and assistant roles`() {
        // When
        val userMessage = Message(
            id = "1",
            userId = "u1",
            conversationId = "c1",
            content = "test",
            role = "user",
            timestamp = Instant.now().toEpochMilli()
        )
        val assistantMessage = Message(
            id = "2",
            userId = "u1",
            conversationId = "c1",
            content = "response",
            role = "assistant",
            timestamp = Instant.now().toEpochMilli()
        )

        // Then
        assertEquals("user", userMessage.role)
        assertEquals("assistant", assistantMessage.role)
        assertNotEquals(userMessage.role, assistantMessage.role)
    }

    @Test
    fun `message timestamp is valid`() {
        // Given
        val before = Instant.now().toEpochMilli()

        // When
        val message = Message(
            id = "msg-123",
            userId = "user-456",
            conversationId = "conv-789",
            content = "Test",
            role = "user",
            timestamp = Instant.now().toEpochMilli()
        )

        // Then
        val after = Instant.now().toEpochMilli()
        assertTrue(message.timestamp >= before)
        assertTrue(message.timestamp <= after)
    }

    @Test
    fun `messages can be compared by id`() {
        // Given
        val timestamp = Instant.now().toEpochMilli()
        val message1 = Message(
            id = "msg-123",
            userId = "u1",
            conversationId = "c1",
            content = "test",
            role = "user",
            timestamp = timestamp
        )
        val message2 = Message(
            id = "msg-123",
            userId = "u2",
            conversationId = "c2",
            content = "different",
            role = "assistant",
            timestamp = timestamp
        )

        // Then
        assertEquals(message1.id, message2.id)
    }

    @Test
    fun `messages with different ids are not equal`() {
        // Given
        val timestamp = Instant.now().toEpochMilli()
        val message1 = Message(
            id = "msg-123",
            userId = "u1",
            conversationId = "c1",
            content = "test",
            role = "user",
            timestamp = timestamp
        )
        val message2 = Message(
            id = "msg-456",
            userId = "u1",
            conversationId = "c1",
            content = "test",
            role = "user",
            timestamp = timestamp
        )

        // Then
        assertNotEquals(message1.id, message2.id)
    }

    @Test
    fun `message timestamp ordering is correct`() {
        // Given
        val timestamp1 = Instant.now().toEpochMilli()
        Thread.sleep(10) // Small delay
        val timestamp2 = Instant.now().toEpochMilli()

        val message1 = Message(
            id = "1",
            userId = "u1",
            conversationId = "c1",
            content = "First",
            role = "user",
            timestamp = timestamp1
        )
        val message2 = Message(
            id = "2",
            userId = "u1",
            conversationId = "c1",
            content = "Second",
            role = "user",
            timestamp = timestamp2
        )

        // Then
        assertTrue(message1.timestamp < message2.timestamp)
    }

    @Test
    fun `message data class generates correct toString`() {
        // When
        val message = Message(
            id = "msg-123",
            userId = "user-456",
            conversationId = "conv-789",
            content = "Test",
            role = "user",
            timestamp = 1704067200000L
        )

        // Then
        val string = message.toString()
        assertTrue(string.contains("msg-123"))
        assertTrue(string.contains("user-456"))
        assertTrue(string.contains("Test"))
    }

    @Test
    fun `message data class generates correct hashCode`() {
        // Given
        val message1 = Message(
            id = "msg-123",
            userId = "user-456",
            conversationId = "conv-789",
            content = "Test",
            role = "user",
            timestamp = 1704067200000L
        )
        val message2 = Message(
            id = "msg-123",
            userId = "user-456",
            conversationId = "conv-789",
            content = "Test",
            role = "user",
            timestamp = 1704067200000L
        )

        // Then
        assertEquals(message1.hashCode(), message2.hashCode())
    }

    @Test
    fun `message copy creates new instance with updated properties`() {
        // Given
        val original = Message(
            id = "msg-123",
            userId = "user-456",
            conversationId = "conv-789",
            content = "Original",
            role = "user",
            timestamp = 1704067200000L
        )

        // When
        val copy = original.copy(content = "Updated")

        // Then
        assertEquals("Original", original.content)
        assertEquals("Updated", copy.content)
        assertEquals(original.id, copy.id)
        assertEquals(original.userId, copy.userId)
    }
}
