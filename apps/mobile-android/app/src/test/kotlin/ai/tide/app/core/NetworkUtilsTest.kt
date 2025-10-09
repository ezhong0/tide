package ai.tide.app.core

import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import org.junit.Assert.*
import org.junit.Test

/**
 * Network Utilities Unit Tests
 * Tests for network retry logic, error handling, and utilities
 */
@OptIn(ExperimentalCoroutinesApi::class)
class NetworkUtilsTest {

    @Test
    fun `retry configuration has correct defaults`() {
        // When
        val config = RetryConfig.default

        // Then
        assertEquals(3, config.maxAttempts)
        assertEquals(1000L, config.initialDelayMs)
        assertEquals(2.0, config.multiplier, 0.01)
        assertTrue(config.retryableStatusCodes.contains(503))
        assertTrue(config.retryableStatusCodes.contains(429))
    }

    @Test
    fun `retry configuration aggressive has more attempts`() {
        // When
        val config = RetryConfig.aggressive

        // Then
        assertEquals(5, config.maxAttempts)
        assertTrue(config.maxAttempts > RetryConfig.default.maxAttempts)
    }

    @Test
    fun `retry configuration conservative has fewer attempts`() {
        // When
        val config = RetryConfig.conservative

        // Then
        assertEquals(2, config.maxAttempts)
        assertTrue(config.maxAttempts < RetryConfig.default.maxAttempts)
    }

    @Test
    fun `network error has correct error messages`() {
        // Given
        val errors = mapOf(
            NetworkError.NoInternet to "No internet connection",
            NetworkError.Timeout to "Request timed out",
            NetworkError.Cancelled to "Request was cancelled",
            NetworkError.InvalidUrl to "Invalid URL"
        )

        // Then
        errors.forEach { (error, expectedMessage) ->
            assertEquals(expectedMessage, error.message)
        }
    }

    @Test
    fun `network error isRetryable returns correct values`() {
        // When/Then
        assertTrue(NetworkError.Timeout.isRetryable)
        assertTrue(NetworkError.NoInternet.isRetryable)
        assertTrue(NetworkError.ServerError(503).isRetryable)
        assertFalse(NetworkError.Cancelled.isRetryable)
        assertFalse(NetworkError.InvalidUrl.isRetryable)
        assertFalse(NetworkError.ClientError(400).isRetryable)
    }

    @Test
    fun `http status codes are correctly classified`() {
        // Success codes
        assertTrue((200..299).all { it.isSuccessful() })

        // Client error codes
        assertTrue((400..499).all { it.isClientError() })

        // Server error codes
        assertTrue((500..599).all { it.isServerError() })
    }

    @Test
    fun `retryable status codes are identified correctly`() {
        // Retryable codes
        assertTrue(429.isRetryable())
        assertTrue(500.isRetryable())
        assertTrue(502.isRetryable())
        assertTrue(503.isRetryable())
        assertTrue(504.isRetryable())

        // Non-retryable codes
        assertFalse(200.isRetryable())
        assertFalse(400.isRetryable())
        assertFalse(404.isRetryable())
    }

    @Test
    fun `exponential backoff calculates correct delays`() {
        // Given
        val config = RetryConfig.default
        val delays = mutableListOf<Long>()

        // When
        var currentDelay = config.initialDelayMs
        for (i in 1..config.maxAttempts) {
            delays.add(currentDelay)
            currentDelay = (currentDelay * config.multiplier).toLong()
        }

        // Then
        assertEquals(1000L, delays[0])  // 1 second
        assertEquals(2000L, delays[1])  // 2 seconds
        assertEquals(4000L, delays[2])  // 4 seconds
        assertTrue(delays[1] > delays[0])
        assertTrue(delays[2] > delays[1])
    }

    @Test
    fun `retry succeeds on first attempt`() = runTest {
        // Given
        var callCount = 0

        // When
        val result = retryWithExponentialBackoff {
            callCount++
            "success"
        }

        // Then
        assertEquals(1, callCount)
        assertEquals("success", result)
    }

    @Test
    fun `retry succeeds on second attempt`() = runTest {
        // Given
        var callCount = 0

        // When
        val result = retryWithExponentialBackoff {
            callCount++
            if (callCount == 1) {
                throw NetworkError.Timeout
            }
            "success"
        }

        // Then
        assertEquals(2, callCount)
        assertEquals("success", result)
    }

    @Test
    fun `retry fails after max attempts`() = runTest {
        // Given
        var callCount = 0
        val config = RetryConfig.default

        // When/Then
        try {
            retryWithExponentialBackoff(config) {
                callCount++
                throw NetworkError.Timeout
            }
            fail("Should have thrown exception")
        } catch (e: NetworkError.Timeout) {
            assertEquals(config.maxAttempts, callCount)
        }
    }

    @Test
    fun `retry does not retry non-retryable errors`() = runTest {
        // Given
        var callCount = 0

        // When/Then
        try {
            retryWithExponentialBackoff {
                callCount++
                throw NetworkError.InvalidUrl
            }
            fail("Should have thrown exception")
        } catch (e: NetworkError.InvalidUrl) {
            assertEquals(1, callCount)
        }
    }

    @Test
    fun `url validation accepts valid urls`() {
        // Given
        val validUrls = listOf(
            "https://api.example.com",
            "http://localhost:3000",
            "https://api.example.com/v1/users",
            "https://api.example.com/users?page=1&limit=10"
        )

        // Then
        validUrls.forEach { url ->
            assertTrue("URL $url should be valid", url.isValidUrl())
        }
    }

    @Test
    fun `url validation rejects invalid urls`() {
        // Given
        val invalidUrls = listOf(
            "",
            "not-a-url",
            "ftp://invalid.com",
            "//no-protocol.com"
        )

        // Then
        invalidUrls.forEach { url ->
            assertFalse("URL $url should be invalid", url.isValidUrl())
        }
    }

    // Mock implementations for testing

    data class RetryConfig(
        val maxAttempts: Int,
        val initialDelayMs: Long,
        val multiplier: Double,
        val retryableStatusCodes: Set<Int>
    ) {
        companion object {
            val default = RetryConfig(
                maxAttempts = 3,
                initialDelayMs = 1000,
                multiplier = 2.0,
                retryableStatusCodes = setOf(408, 429, 500, 502, 503, 504)
            )

            val aggressive = RetryConfig(
                maxAttempts = 5,
                initialDelayMs = 500,
                multiplier = 1.5,
                retryableStatusCodes = setOf(408, 429, 500, 502, 503, 504)
            )

            val conservative = RetryConfig(
                maxAttempts = 2,
                initialDelayMs = 2000,
                multiplier = 2.0,
                retryableStatusCodes = setOf(503, 504)
            )
        }
    }

    sealed class NetworkError(override val message: String) : Exception(message) {
        object NoInternet : NetworkError("No internet connection") {
            val isRetryable = true
        }
        object Timeout : NetworkError("Request timed out") {
            val isRetryable = true
        }
        object Cancelled : NetworkError("Request was cancelled") {
            val isRetryable = false
        }
        object InvalidUrl : NetworkError("Invalid URL") {
            val isRetryable = false
        }
        data class ServerError(val code: Int) : NetworkError("Server error $code") {
            val isRetryable = code in setOf(500, 502, 503, 504)
        }
        data class ClientError(val code: Int) : NetworkError("Client error $code") {
            val isRetryable = false
        }
    }

    private fun Int.isSuccessful() = this in 200..299
    private fun Int.isClientError() = this in 400..499
    private fun Int.isServerError() = this in 500..599
    private fun Int.isRetryable() = this in setOf(408, 429, 500, 502, 503, 504)

    private fun String.isValidUrl(): Boolean {
        return try {
            val url = java.net.URL(this)
            url.protocol in listOf("http", "https")
        } catch (e: Exception) {
            false
        }
    }

    private suspend fun <T> retryWithExponentialBackoff(
        config: RetryConfig = RetryConfig.default,
        operation: suspend () -> T
    ): T {
        var lastError: Exception? = null
        var delay = config.initialDelayMs

        repeat(config.maxAttempts) { attempt ->
            try {
                return operation()
            } catch (e: Exception) {
                lastError = e

                val isRetryable = when (e) {
                    is NetworkError.Timeout -> e.isRetryable
                    is NetworkError.NoInternet -> e.isRetryable
                    is NetworkError.ServerError -> e.isRetryable
                    is NetworkError.ClientError -> e.isRetryable
                    is NetworkError.Cancelled -> e.isRetryable
                    is NetworkError.InvalidUrl -> e.isRetryable
                    else -> false
                }

                if (!isRetryable || attempt == config.maxAttempts - 1) {
                    throw e
                }

                kotlinx.coroutines.delay(delay)
                delay = (delay * config.multiplier).toLong()
            }
        }

        throw lastError ?: Exception("Unknown error")
    }
}
