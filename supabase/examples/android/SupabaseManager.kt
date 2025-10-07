package com.tide.core.supabase

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.providers.Google
import io.github.jan.supabase.gotrue.providers.Azure
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.realtime.channel
import io.github.jan.supabase.realtime.realtime
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.datetime.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Tide Supabase Manager for Android
 * Handles authentication, database, and realtime subscriptions
 */
@Singleton
class SupabaseManager @Inject constructor() {

    // MARK: - Properties
    private val client: SupabaseClient = createSupabaseClient(
        supabaseUrl = BuildConfig.SUPABASE_URL,
        supabaseKey = BuildConfig.SUPABASE_ANON_KEY
    ) {
        install(Auth)
        install(Postgrest)
        install(Realtime)
    }

    private val _currentUser = MutableStateFlow<User?>(null)
    val currentUser: StateFlow<User?> = _currentUser

    private val _isAuthenticated = MutableStateFlow(false)
    val isAuthenticated: StateFlow<Boolean> = _isAuthenticated

    init {
        setupAuthStateListener()
    }

    // MARK: - Authentication

    /**
     * Sign in with Google OAuth
     */
    suspend fun signInWithGoogle() {
        client.auth.signInWith(Google) {
            scopes.add("email")
            scopes.add("profile")
            scopes.add("https://www.googleapis.com/auth/gmail.modify")
            scopes.add("https://www.googleapis.com/auth/calendar")
            redirectUrl = "com.tide.app://"
        }
    }

    /**
     * Sign in with Microsoft OAuth
     */
    suspend fun signInWithMicrosoft() {
        client.auth.signInWith(Azure) {
            scopes.add("User.Read")
            scopes.add("Mail.ReadWrite")
            scopes.add("Calendars.ReadWrite")
            scopes.add("offline_access")
            redirectUrl = "com.tide.app://"
        }
    }

    /**
     * Handle OAuth callback
     */
    suspend fun handleOAuthCallback(url: String) {
        client.auth.handleDeeplink(url)
    }

    /**
     * Sign out
     */
    suspend fun signOut() {
        client.auth.signOut()
    }

    /**
     * Get current session
     */
    suspend fun getCurrentSession() = client.auth.currentSessionOrNull()

    // MARK: - User Profile

    /**
     * Fetch user profile
     */
    suspend fun fetchUserProfile(): UserProfile {
        val userId = _currentUser.value?.id
            ?: throw TideException.NotAuthenticated()

        return client.from("user_profiles")
            .select {
                filter {
                    eq("id", userId)
                }
            }
            .decodeSingle<UserProfile>()
    }

    /**
     * Update user profile
     */
    suspend fun updateUserProfile(profile: UserProfile) {
        client.from("user_profiles")
            .update(profile) {
                filter {
                    eq("id", profile.id)
                }
            }
    }

    // MARK: - Conversations

    /**
     * Fetch conversations
     */
    suspend fun fetchConversations(): List<Conversation> {
        return client.from("conversations")
            .select {
                order("created_at", ascending = false)
            }
            .decodeList<Conversation>()
    }

    /**
     * Create conversation
     */
    suspend fun createConversation(title: String): Conversation {
        val userId = _currentUser.value?.id
            ?: throw TideException.NotAuthenticated()

        val request = CreateConversationRequest(
            title = title,
            userId = userId
        )

        return client.from("conversations")
            .insert(request) {
                select()
            }
            .decodeSingle<Conversation>()
    }

    /**
     * Fetch messages for conversation
     */
    suspend fun fetchMessages(conversationId: String): List<Message> {
        return client.from("messages")
            .select {
                filter {
                    eq("conversation_id", conversationId)
                }
                order("created_at", ascending = true)
            }
            .decodeList<Message>()
    }

    /**
     * Send message
     */
    suspend fun sendMessage(
        conversationId: String,
        content: String,
        role: MessageRole
    ): Message {
        val request = CreateMessageRequest(
            conversationId = conversationId,
            content = content,
            role = role.value
        )

        return client.from("messages")
            .insert(request) {
                select()
            }
            .decodeSingle<Message>()
    }

    // MARK: - Realtime Subscriptions

    /**
     * Subscribe to new messages in a conversation
     */
    fun subscribeToMessages(
        conversationId: String,
        onMessage: (Message) -> Unit
    ) = client.realtime.channel("messages:$conversationId") {
        postgresChangeFlow<Message>("public") {
            table = "messages"
            filter = "conversation_id=eq.$conversationId"
            event = ChangeEvent.INSERT
        }.onEach { change ->
            when (change) {
                is Change.Insert -> onMessage(change.record)
                else -> {}
            }
        }
    }

    // MARK: - Calendar Events

    /**
     * Fetch calendar events
     */
    suspend fun fetchCalendarEvents(from: Instant, to: Instant): List<CalendarEvent> {
        return client.from("calendar_events")
            .select {
                filter {
                    gte("start_time", from.toString())
                    lte("end_time", to.toString())
                }
                order("start_time", ascending = true)
            }
            .decodeList<CalendarEvent>()
    }

    // MARK: - Tasks

    /**
     * Fetch tasks
     */
    suspend fun fetchTasks(status: TaskStatus? = null): List<Task> {
        return client.from("tasks")
            .select {
                status?.let {
                    filter {
                        eq("status", it.value)
                    }
                }
                order("created_at", ascending = false)
            }
            .decodeList<Task>()
    }

    /**
     * Create task
     */
    suspend fun createTask(
        title: String,
        description: String? = null,
        dueAt: Instant? = null
    ): Task {
        val userId = _currentUser.value?.id
            ?: throw TideException.NotAuthenticated()

        val request = CreateTaskRequest(
            title = title,
            description = description,
            dueAt = dueAt,
            userId = userId
        )

        return client.from("tasks")
            .insert(request) {
                select()
            }
            .decodeSingle<Task>()
    }

    /**
     * Update task status
     */
    suspend fun updateTaskStatus(taskId: String, status: TaskStatus) {
        client.from("tasks")
            .update(mapOf("status" to status.value)) {
                filter {
                    eq("id", taskId)
                }
            }
    }

    // MARK: - Private Helpers

    private fun setupAuthStateListener() {
        client.auth.onSessionChanged { session ->
            _currentUser.value = session?.user
            _isAuthenticated.value = session != null
        }
    }
}

// MARK: - Models

@Serializable
data class UserProfile(
    val id: String,
    @SerialName("full_name") val fullName: String,
    @SerialName("avatar_url") val avatarUrl: String? = null,
    @SerialName("primary_provider") val primaryProvider: String,
    val timezone: String = "UTC",
    val language: String = "en",
    val theme: String = "auto",
    @SerialName("created_at") val createdAt: Instant,
    @SerialName("updated_at") val updatedAt: Instant
)

@Serializable
data class Conversation(
    val id: String,
    @SerialName("user_id") val userId: String,
    val title: String? = null,
    val summary: String? = null,
    @SerialName("message_count") val messageCount: Int = 0,
    @SerialName("last_message_at") val lastMessageAt: Instant? = null,
    @SerialName("created_at") val createdAt: Instant,
    @SerialName("updated_at") val updatedAt: Instant
)

@Serializable
data class Message(
    val id: String,
    @SerialName("conversation_id") val conversationId: String,
    val role: String,
    val content: String,
    @SerialName("tokens_used") val tokensUsed: Int? = null,
    val model: String? = null,
    @SerialName("created_at") val createdAt: Instant
)

enum class MessageRole(val value: String) {
    USER("user"),
    ASSISTANT("assistant"),
    SYSTEM("system")
}

@Serializable
data class CalendarEvent(
    val id: String,
    @SerialName("user_id") val userId: String,
    val provider: String,
    val title: String,
    val description: String? = null,
    val location: String? = null,
    @SerialName("start_time") val startTime: Instant,
    @SerialName("end_time") val endTime: Instant,
    val timezone: String = "UTC",
    @SerialName("is_all_day") val isAllDay: Boolean = false
)

@Serializable
data class Task(
    val id: String,
    @SerialName("user_id") val userId: String,
    val title: String,
    val description: String? = null,
    val status: String,
    val priority: String,
    @SerialName("due_at") val dueAt: Instant? = null,
    @SerialName("completed_at") val completedAt: Instant? = null,
    @SerialName("created_at") val createdAt: Instant
)

enum class TaskStatus(val value: String) {
    PENDING("pending"),
    IN_PROGRESS("in_progress"),
    COMPLETED("completed"),
    CANCELLED("cancelled")
}

// MARK: - Request Models

@Serializable
data class CreateConversationRequest(
    val title: String?,
    @SerialName("user_id") val userId: String
)

@Serializable
data class CreateMessageRequest(
    @SerialName("conversation_id") val conversationId: String,
    val content: String,
    val role: String
)

@Serializable
data class CreateTaskRequest(
    val title: String,
    val description: String? = null,
    @SerialName("due_at") val dueAt: Instant? = null,
    @SerialName("user_id") val userId: String
)

// MARK: - Exceptions

sealed class TideException : Exception() {
    class NotAuthenticated : TideException()
}
