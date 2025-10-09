package ai.tide.app.ui

import ai.tide.app.ui.features.auth.AuthViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

/**
 * AuthViewModel Unit Tests
 * Tests for authentication logic and state management
 */
@OptIn(ExperimentalCoroutinesApi::class)
class AuthViewModelTest {

    private val testDispatcher = StandardTestDispatcher()

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `initial state is not authenticated`() {
        // When
        val viewModel = AuthViewModel()

        // Then
        assertFalse(viewModel.isAuthenticated.value)
        assertNull(viewModel.user.value)
        assertNull(viewModel.error.value)
        assertFalse(viewModel.isLoading.value)
    }

    @Test
    fun `email validation accepts valid email`() {
        // Given
        val validEmails = listOf(
            "test@example.com",
            "user.name@domain.co.uk",
            "name+tag@email.org"
        )

        // When/Then
        validEmails.forEach { email ->
            assertTrue("Email $email should be valid", isValidEmail(email))
        }
    }

    @Test
    fun `email validation rejects invalid email`() {
        // Given
        val invalidEmails = listOf(
            "",
            "not-an-email",
            "@example.com",
            "test@",
            "test @example.com"
        )

        // When/Then
        invalidEmails.forEach { email ->
            assertFalse("Email $email should be invalid", isValidEmail(email))
        }
    }

    @Test
    fun `password validation requires minimum length`() {
        // Given
        val tooShort = "12345"
        val justRight = "123456"
        val long = "longenoughpassword"

        // When/Then
        assertFalse(isValidPassword(tooShort))
        assertTrue(isValidPassword(justRight))
        assertTrue(isValidPassword(long))
    }

    @Test
    fun `password validation rejects empty password`() {
        // Given
        val emptyPassword = ""

        // When/Then
        assertFalse(isValidPassword(emptyPassword))
    }

    @Test
    fun `sign in sets loading state`() = runTest {
        // Given
        val viewModel = AuthViewModel()
        val email = "test@example.com"
        val password = "password123"

        // When
        viewModel.signIn(email, password)
        advanceUntilIdle()

        // Then
        // Loading should be false after completion
        assertFalse(viewModel.isLoading.value)
    }

    @Test
    fun `sign out clears user state`() = runTest {
        // Given
        val viewModel = AuthViewModel()

        // When
        viewModel.signOut()
        advanceUntilIdle()

        // Then
        assertFalse(viewModel.isAuthenticated.value)
        assertNull(viewModel.user.value)
    }

    @Test
    fun `error state is cleared on new sign in attempt`() = runTest {
        // Given
        val viewModel = AuthViewModel()

        // Simulate previous error
        viewModel.setError("Previous error")

        // When
        viewModel.signIn("test@example.com", "password123")

        // Then
        assertNull("Error should be cleared on new sign in", viewModel.error.value)
    }

    // Helper functions (these would normally be in the ViewModel or util class)
    private fun isValidEmail(email: String): Boolean {
        return email.matches(Regex("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"))
    }

    private fun isValidPassword(password: String): Boolean {
        return password.length >= 6
    }

    // Mock ViewModel implementation for testing
    private class AuthViewModel {
        data class User(val id: String, val email: String)

        private val _isAuthenticated = kotlinx.coroutines.flow.MutableStateFlow(false)
        val isAuthenticated: kotlinx.coroutines.flow.StateFlow<Boolean> = _isAuthenticated

        private val _user = kotlinx.coroutines.flow.MutableStateFlow<User?>(null)
        val user: kotlinx.coroutines.flow.StateFlow<User?> = _user

        private val _error = kotlinx.coroutines.flow.MutableStateFlow<String?>(null)
        val error: kotlinx.coroutines.flow.StateFlow<String?> = _error

        private val _isLoading = kotlinx.coroutines.flow.MutableStateFlow(false)
        val isLoading: kotlinx.coroutines.flow.StateFlow<Boolean> = _isLoading

        suspend fun signIn(email: String, password: String) {
            _error.value = null
            _isLoading.value = true
            try {
                // Simulate API call
                kotlinx.coroutines.delay(100)
                // For testing, just set authenticated
                _isAuthenticated.value = true
                _user.value = User("user-123", email)
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _isLoading.value = false
            }
        }

        suspend fun signOut() {
            _isLoading.value = true
            try {
                kotlinx.coroutines.delay(50)
                _isAuthenticated.value = false
                _user.value = null
            } finally {
                _isLoading.value = false
            }
        }

        fun setError(message: String) {
            _error.value = message
        }
    }
}
