package ai.tide.app.ui.features.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import ai.tide.app.core.TideCore
import ai.tide.app.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AuthUiState(
    val name: String = "",
    val email: String = "",
    val password: String = "",
    val confirmPassword: String = "",
    val isLoading: Boolean = false,
    val error: String? = null,
    val isValid: Boolean = false
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    private val _isAuthenticated = MutableStateFlow(false)
    val isAuthenticated: StateFlow<Boolean> = _isAuthenticated.asStateFlow()

    init {
        checkAuthStatus()
    }

    private fun checkAuthStatus() {
        viewModelScope.launch {
            _isAuthenticated.value = authRepository.isAuthenticated()
        }
    }

    fun updateName(name: String) {
        _uiState.update { it.copy(name = name) }
        validateForm()
    }

    fun updateEmail(email: String) {
        _uiState.update { it.copy(email = email) }
        validateForm()
    }

    fun updatePassword(password: String) {
        _uiState.update { it.copy(password = password) }
        validateForm()
    }

    fun updateConfirmPassword(confirmPassword: String) {
        _uiState.update { it.copy(confirmPassword = confirmPassword) }
        validateForm()
    }

    private fun validateForm() {
        val state = _uiState.value
        val isValid = state.email.isNotBlank() &&
                state.email.contains("@") &&
                state.password.length >= 8

        _uiState.update { it.copy(isValid = isValid) }
    }

    fun login() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }

            try {
                val result = authRepository.login(
                    email = _uiState.value.email,
                    password = _uiState.value.password
                )

                if (result.isSuccess) {
                    _isAuthenticated.value = true

                    // TODO: Get access token from result and connect WebSocket
                    // For now, using a placeholder. AuthRepository should return:
                    // data class AuthResult(val accessToken: String, val refreshToken: String)
                    //
                    // Then uncomment this:
                    // val token = result.getOrNull()?.accessToken
                    // if (token != null) {
                    //     TideCore.getInstance().connectWebSocket(token)
                    // }
                } else {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = result.exceptionOrNull()?.message ?: "Login failed"
                        )
                    }
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.message ?: "An error occurred"
                    )
                }
            }
        }
    }

    fun register() {
        val state = _uiState.value

        // Validate passwords match
        if (state.password != state.confirmPassword) {
            _uiState.update { it.copy(error = "Passwords do not match") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }

            try {
                val result = authRepository.register(
                    email = state.email,
                    password = state.password,
                    name = state.name
                )

                if (result.isSuccess) {
                    // Auto-login after successful registration
                    login()
                } else {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = result.exceptionOrNull()?.message ?: "Registration failed"
                        )
                    }
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.message ?: "An error occurred"
                    )
                }
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            // Disconnect WebSocket
            TideCore.getInstance().disconnectWebSocket()

            authRepository.logout()
            _isAuthenticated.value = false
        }
    }
}
