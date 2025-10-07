# 🤖 Tide Android App

Native Android application built with Jetpack Compose and TensorFlow Lite for the Tide AI Chief of Staff platform.

## 🎯 Goals

- **<1s launch time** - Instant app startup
- **<100ms response** - Blazing fast UI
- **60fps** - Smooth animations
- **<5% battery** - Efficient power usage
- **100% offline** - Full functionality without network

## 🏗️ Architecture

```
TideAndroid/
├── MainActivity.kt              // Main activity
├── TideApplication.kt          // Application class
├── core/
│   ├── TideCore.kt             // Core business logic
│   ├── LocalInference.kt       // TensorFlow Lite
│   ├── PredictiveCache.kt      // Predictive caching
│   └── BackgroundIntel.kt      // WorkManager tasks
├── features/
│   ├── auth/                   // Authentication
│   ├── chat/                   // Conversational UI
│   ├── email/                  // Email management
│   ├── calendar/               // Calendar views
│   ├── tasks/                  // Task management
│   └── intelligence/           // AI insights
├── services/
│   ├── NetworkService.kt       // API client (GraphQL + WebSocket)
│   ├── SyncService.kt          // Data sync
│   └── SecurityService.kt      // Encryption/auth
├── design/
│   ├── TideTheme.kt            // Material You theme
│   └── components/             // Composables
└── data/
    ├── local/                  // Room database
    ├── remote/                 // API clients
    └── models/                 // Data models
```

## 🚀 Getting Started

### Prerequisites

- Android Studio Hedgehog or later
- JDK 17+
- Kotlin 1.9+
- Gradle 8.0+

### Setup

```bash
# Open in Android Studio
studio .

# Or build from command line
./gradlew build

# Run on device/emulator
./gradlew installDebug
```

### Environment Configuration

`local.properties`:
```properties
# API Configuration
API_BASE_URL=https://api.tide.ai
GRAPHQL_ENDPOINT=https://api.tide.ai/graphql
WEBSOCKET_ENDPOINT=wss://api.tide.ai/realtime

# Development
API_BASE_URL_DEV=http://10.0.2.2:4000
GRAPHQL_ENDPOINT_DEV=http://10.0.2.2:4000/graphql
WEBSOCKET_ENDPOINT_DEV=ws://10.0.2.2:4000/realtime
```

## 📦 Dependencies (build.gradle.kts)

```kotlin
dependencies {
    // Jetpack Compose
    implementation("androidx.compose.ui:ui:1.5.4")
    implementation("androidx.compose.material3:material3:1.1.2")
    implementation("androidx.compose.ui:ui-tooling-preview:1.5.4")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation("androidx.navigation:navigation-compose:2.7.6")

    // Coroutines & Flow
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    // Networking
    implementation("com.apollographql.apollo3:apollo-runtime:3.8.2")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("io.ktor:ktor-client-websockets:2.3.7")

    // Room (offline storage)
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")

    // DataStore (preferences)
    implementation("androidx.datastore:datastore-preferences:1.0.0")

    // TensorFlow Lite (local AI)
    implementation("org.tensorflow:tensorflow-lite:2.14.0")
    implementation("org.tensorflow:tensorflow-lite-gpu:2.14.0")
    implementation("org.tensorflow:tensorflow-lite-support:0.4.4")

    // Hilt (DI)
    implementation("com.google.dagger:hilt-android:2.48.1")
    kapt("com.google.dagger:hilt-compiler:2.48.1")

    // WorkManager (background)
    implementation("androidx.work:work-runtime-ktx:2.9.0")

    // Security
    implementation("androidx.security:security-crypto:1.1.0-alpha06")

    // Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4:1.5.4")
}
```

## 🔐 Authentication Flow

```kotlin
// AuthService.kt
class AuthService @Inject constructor(
    private val apiClient: ApiClient,
    private val secureStorage: SecureStorage
) {
    suspend fun register(
        email: String,
        password: String,
        name: String
    ): Result<User> = withContext(Dispatchers.IO) {
        try {
            val response = apiClient.register(
                RegisterRequest(email, password, name)
            )

            // Store tokens securely
            secureStorage.saveTokens(
                accessToken = response.accessToken,
                refreshToken = response.refreshToken
            )

            Result.success(response.user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun login(
        email: String,
        password: String
    ): Result<Session> = withContext(Dispatchers.IO) {
        try {
            val response = apiClient.login(
                LoginRequest(email, password)
            )

            secureStorage.saveTokens(
                accessToken = response.accessToken,
                refreshToken = response.refreshToken
            )

            Result.success(
                Session(user = response.user, isAuthenticated = true)
            )
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun refreshToken(): Result<String> {
        val refreshToken = secureStorage.getRefreshToken() ?: return Result.failure(
            AuthException("No refresh token")
        )

        return try {
            val response = apiClient.refreshToken(refreshToken)
            secureStorage.saveAccessToken(response.accessToken)
            Result.success(response.accessToken)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

## 🌐 Networking

### GraphQL Client (Apollo)

```kotlin
// ApolloClient.kt
@Singleton
class ApolloClientProvider @Inject constructor(
    private val secureStorage: SecureStorage
) {
    val apolloClient: ApolloClient by lazy {
        ApolloClient.Builder()
            .serverUrl(BuildConfig.GRAPHQL_ENDPOINT)
            .addInterceptor(object : ApolloInterceptor {
                override fun <D : Operation.Data> intercept(
                    request: ApolloRequest<D>,
                    chain: ApolloInterceptorChain
                ): Flow<ApolloResponse<D>> {
                    return flow {
                        val token = secureStorage.getAccessToken()
                        val newRequest = request.newBuilder()
                            .addHttpHeader("Authorization", "Bearer $token")
                            .build()

                        emitAll(chain.proceed(newRequest))
                    }
                }
            })
            .build()
    }
}

// Usage
class ConversationRepository @Inject constructor(
    private val apolloClient: ApolloClient
) {
    suspend fun getConversations(): List<Conversation> {
        val response = apolloClient.query(GetConversationsQuery()).execute()
        return response.data?.conversations?.map { it.toConversation() } ?: emptyList()
    }
}
```

### WebSocket (Real-time)

```kotlin
// WebSocketService.kt
@Singleton
class WebSocketService @Inject constructor(
    private val secureStorage: SecureStorage
) {
    private val client = HttpClient {
        install(WebSockets)
    }

    private var session: DefaultClientWebSocketSession? = null

    suspend fun connect() {
        try {
            session = client.webSocketSession(BuildConfig.WEBSOCKET_ENDPOINT) {
                header("Authorization", "Bearer ${secureStorage.getAccessToken()}")
            }

            session?.incoming?.consumeAsFlow()?.collect { frame ->
                when (frame) {
                    is Frame.Text -> handleMessage(frame.readText())
                    else -> {}
                }
            }
        } catch (e: Exception) {
            // Reconnect logic
            delay(5000)
            connect()
        }
    }

    suspend fun send(message: String) {
        session?.send(Frame.Text(message))
    }

    private fun handleMessage(message: String) {
        // Parse and emit to flow
        val event = Json.decodeFromString<RealtimeEvent>(message)
        _events.emit(event)
    }
}
```

## 🎨 Design System (Material You)

```kotlin
// TideTheme.kt
@Composable
fun TideTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context)
            else dynamicLightColorScheme(context)
        }
        darkTheme -> TideDarkColorScheme
        else -> TideLightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = TideTypography,
        content = content
    )
}

// Colors
private val TideLightColorScheme = lightColorScheme(
    primary = Color(0xFF0066FF),
    secondary = Color(0xFF00CC88),
    background = Color(0xFFFFFBFE),
    surface = Color(0xFFFFFBFE),
)

// Typography
val TideTypography = Typography(
    titleLarge = TextStyle(
        fontWeight = FontWeight.Bold,
        fontSize = 28.sp,
        lineHeight = 36.sp
    ),
    bodyLarge = TextStyle(
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp
    )
)
```

## 🧠 Local AI (TensorFlow Lite)

```kotlin
// LocalInference.kt
@Singleton
class LocalInference @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val interpreter: Interpreter by lazy {
        val model = loadModelFile("intent_classifier.tflite")
        Interpreter(model)
    }

    fun classifyIntent(text: String): IntentPrediction {
        // Tokenize input
        val tokens = tokenize(text)
        val inputArray = Array(1) { tokens }

        // Run inference
        val outputArray = Array(1) { FloatArray(NUM_CLASSES) }
        interpreter.run(inputArray, outputArray)

        // Get prediction
        val probabilities = outputArray[0]
        val maxIndex = probabilities.indices.maxByOrNull { probabilities[it] } ?: 0

        return IntentPrediction(
            intent = INTENTS[maxIndex],
            confidence = probabilities[maxIndex]
        )
    }

    private fun loadModelFile(filename: String): MappedByteBuffer {
        val fileDescriptor = context.assets.openFd(filename)
        val inputStream = FileInputStream(fileDescriptor.fileDescriptor)
        val fileChannel = inputStream.channel
        val startOffset = fileDescriptor.startOffset
        val declaredLength = fileDescriptor.declaredLength
        return fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength)
    }
}
```

## 💾 Offline-First (Room)

```kotlin
// Database
@Database(
    entities = [
        ConversationEntity::class,
        MessageEntity::class,
        UserEntity::class
    ],
    version = 1
)
abstract class TideDatabase : RoomDatabase() {
    abstract fun conversationDao(): ConversationDao
    abstract fun messageDao(): MessageDao
    abstract fun userDao(): UserDao
}

// Repository with offline-first
class ConversationRepository @Inject constructor(
    private val conversationDao: ConversationDao,
    private val apiClient: ApiClient
) {
    fun getConversations(): Flow<List<Conversation>> = flow {
        // Emit cached data first
        emitAll(conversationDao.getAll().map { it.map { entity -> entity.toDomain() } })

        // Fetch from network
        try {
            val remote = apiClient.getConversations()
            conversationDao.insertAll(remote.map { it.toEntity() })
        } catch (e: Exception) {
            // Continue with cached data
        }
    }

    suspend fun sendMessage(text: String, conversationId: String) {
        // Save locally first
        val message = Message(
            id = UUID.randomUUID().toString(),
            text = text,
            conversationId = conversationId,
            status = MessageStatus.PENDING
        )
        messageDao.insert(message.toEntity())

        // Upload when online
        try {
            val response = apiClient.sendMessage(text, conversationId)
            messageDao.update(response.toEntity())
        } catch (e: Exception) {
            // Will retry later
        }
    }
}
```

## 🔔 Background Processing (WorkManager)

```kotlin
// SyncWorker.kt
@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val syncRepository: SyncRepository
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            syncRepository.sync()
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}

// Schedule periodic sync
fun scheduleSync(context: Context) {
    val syncRequest = PeriodicWorkRequestBuilder<SyncWorker>(
        15, TimeUnit.MINUTES
    ).setConstraints(
        Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
    ).build()

    WorkManager.getInstance(context).enqueueUniquePeriodicWork(
        "tide_sync",
        ExistingPeriodicWorkPolicy.KEEP,
        syncRequest
    )
}
```

## 📊 Performance Monitoring

```kotlin
// PerformanceMonitor.kt
object PerformanceMonitor {
    private val launchTime = SystemClock.elapsedRealtime()

    fun trackAppLaunch() {
        val duration = SystemClock.elapsedRealtime() - launchTime
        Analytics.track("app_launch_time", mapOf("duration" to duration))
        // Goal: <1000ms
    }

    fun trackResponseTime(operation: String, block: suspend () -> Unit) {
        val start = SystemClock.elapsedRealtime()
        runBlocking { block() }
        val duration = SystemClock.elapsedRealtime() - start
        Analytics.track("response_time", mapOf(
            "operation" to operation,
            "duration" to duration
        ))
        // Goal: <100ms
    }

    @Composable
    fun TrackFPS() {
        val frameNanos = remember { mutableStateOf(0L) }
        val fps = remember { mutableStateOf(0f) }

        LaunchedEffect(Unit) {
            while (true) {
                val currentNanos = System.nanoTime()
                if (frameNanos.value > 0) {
                    val delta = (currentNanos - frameNanos.value) / 1_000_000f
                    fps.value = 1000f / delta
                }
                frameNanos.value = currentNanos
                delay(16) // ~60fps
            }
        }

        // Goal: 60fps
    }
}
```

## 🧪 Testing

```kotlin
// Unit test
@Test
fun `test user registration`() = runTest {
    val authService = AuthService(mockApiClient, mockSecureStorage)

    val result = authService.register(
        email = "test@tide.ai",
        password = "TestPass123!",
        name = "Test User"
    )

    assertTrue(result.isSuccess)
    assertEquals("test@tide.ai", result.getOrNull()?.email)
}

// Compose UI test
@Test
fun testAuthFlow() {
    composeTestRule.setContent {
        TideTheme {
            AuthScreen()
        }
    }

    composeTestRule.onNodeWithText("Register").performClick()
    composeTestRule.onNodeWithTag("email_field").performTextInput("test@tide.ai")
    composeTestRule.onNodeWithTag("password_field").performTextInput("TestPass123!")
    composeTestRule.onNodeWithText("Create Account").performClick()

    composeTestRule.onNodeWithText("Welcome").assertIsDisplayed()
}
```

## 📈 Week 1-3 Milestones

### Week 1 ✅ COMPLETE
- [x] Project setup
- [x] Authentication flow (placeholder)
- [x] Navigation structure
- [x] Design system (Material You)
- [x] Hilt dependency injection setup
- [x] Project architecture

### Week 2 ✅ COMPLETE
- [x] Chat UI (Jetpack Compose)
- [x] Message sending/receiving (simulated)
- [x] Action preview cards
- [x] Suggestion chips
- [x] Typing indicator with animation
- [x] TideCore business logic with StateFlow

### Week 3 ✅ PHASE 1 COMPLETE (Persistence)
- [x] Core models (Message, Conversation)
- [x] Chat screen fully functional
- [x] Beautiful animations (60fps)
- [x] **Room database implementation** ✨ NEW
- [x] **ConversationRepository pattern** ✨ NEW
- [x] **Data persists across app restarts** ✨ NEW
- [x] **TideCore integration with Room** ✨ NEW
- [x] **DAO interfaces with Flow support** ✨ NEW
- [ ] Error handling UI with Snackbar (Week 3 Phase 2)
- [ ] Email screen (Week 4)
- [ ] Calendar screen (Week 4)
- [ ] WebSocket integration (Week 4)
- [ ] Local ML inference (TFLite) (Week 4)
- [ ] Push notifications (FCM) (Week 4)
- [ ] Unit tests (Week 4)
- [ ] Alpha testing (Week 5)

## 🐛 Debugging

```bash
# View logs
adb logcat | grep TideApp

# Network debugging
# Chrome: chrome://inspect

# Database inspection
adb shell
run-as ai.tide.debug
cd databases
sqlite3 tide.db
```

## 🚀 Deployment

```bash
# Build release APK
./gradlew assembleRelease

# Build AAB for Play Store
./gradlew bundleRelease

# Upload to Play Console
# Use fastlane or Google Play Console UI
```

## 📝 Next Steps

1. Implement authentication UI (Compose)
2. Build chat interface
3. Integrate WebSocket real-time
4. Add TensorFlow Lite models
5. Implement offline sync
6. Performance optimization
7. User testing

## 🔗 Resources

- [Jetpack Compose](https://developer.android.com/jetpack/compose)
- [TensorFlow Lite](https://www.tensorflow.org/lite/android)
- [Apollo Android](https://www.apollographql.com/docs/kotlin/)
- [Backend API Docs](../../packages/services/auth/README.md)
