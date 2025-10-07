# 📱 Tide iOS App

Native iOS application built with SwiftUI and CoreML for the Tide AI Chief of Staff platform.

## 🎯 Goals

- **<1s launch time** - Instant app startup
- **<100ms response** - Blazing fast UI
- **60fps** - Smooth animations
- **<5% battery** - Efficient power usage
- **100% offline** - Full functionality without network

## 🏗️ Architecture

```
TideIOS/
├── TideApp.swift              // Main app entry point
├── Core/
│   ├── TideCore.swift          // Core business logic
│   ├── LocalInference.swift    // CoreML integration
│   ├── PredictiveCache.swift   // Predictive caching
│   └── BackgroundIntel.swift   // Background processing
├── Features/
│   ├── Auth/                   // Authentication
│   ├── Chat/                   // Conversational UI
│   ├── Email/                  // Email management
│   ├── Calendar/               // Calendar views
│   ├── Tasks/                  // Task management
│   └── Intelligence/           // AI insights
├── Services/
│   ├── NetworkService.swift    // API client (GraphQL + WebSocket)
│   ├── SyncService.swift       // Data sync
│   └── SecurityService.swift   // Encryption/auth
├── Design/
│   ├── TideTheme.swift         // Design system
│   └── Components/             // Reusable UI components
└── Models/
    ├── User.swift
    ├── Message.swift
    ├── Conversation.swift
    └── ...
```

## 🚀 Getting Started

### Prerequisites

- Xcode 15+
- iOS 17+ SDK
- Swift 5.9+
- CocoaPods or SPM

### Setup

```bash
# Open Xcode project
open TideIOS.xcodeproj

# Or use Xcode from command line
xed .
```

### Environment Configuration

Create `Config.xcconfig`:

```swift
// API Configuration
API_BASE_URL = https://api.tide.ai
GRAPHQL_ENDPOINT = https://api.tide.ai/graphql
WEBSOCKET_ENDPOINT = wss://api.tide.ai/realtime

// Development
API_BASE_URL_DEV = http://localhost:4000
GRAPHQL_ENDPOINT_DEV = http://localhost:4000/graphql
WEBSOCKET_ENDPOINT_DEV = ws://localhost:4000/realtime
```

## 📦 Dependencies

### Core
- **SwiftUI** - UI framework
- **Combine** - Reactive programming
- **CoreML** - Local AI inference
- **CoreData** - Offline storage

### Networking
- **Apollo iOS** - GraphQL client
- **Starscream** - WebSocket client
- **Alamofire** - HTTP client (fallback)

### AI/ML
- **CoreML** - On-device ML inference
- **NaturalLanguage** - Text processing
- **Vision** - Image processing

### Security
- **CryptoKit** - Encryption
- **Keychain** - Secure storage

## 🔐 Authentication Flow

```swift
// 1. Registration
let user = try await AuthService.register(
    email: "user@example.com",
    password: "SecurePass123!",
    name: "John Doe"
)

// 2. Login
let session = try await AuthService.login(
    email: "user@example.com",
    password: "SecurePass123!"
)

// 3. Token storage (Keychain)
try KeychainService.store(
    accessToken: session.accessToken,
    refreshToken: session.refreshToken
)

// 4. Auto-refresh
AuthService.shared.startTokenRefresh()
```

## 🌐 Networking

### GraphQL Queries

```swift
// Apollo Client setup
let apollo = ApolloClient(
    url: URL(string: Config.graphqlEndpoint)!,
    store: ApolloStore()
)

// Query example
apollo.fetch(query: GetConversationsQuery()) { result in
    switch result {
    case .success(let graphQLResult):
        let conversations = graphQLResult.data?.conversations
    case .failure(let error):
        print("Error: \(error)")
    }
}
```

### WebSocket (Real-time)

```swift
// WebSocket connection
let socket = WebSocket(url: URL(string: Config.websocketEndpoint)!)

socket.onEvent = { event in
    switch event {
    case .connected:
        print("WebSocket connected")
    case .text(let text):
        handleRealtimeMessage(text)
    case .disconnected:
        reconnect()
    }
}
```

## 🎨 Design System

```swift
// Tide Design Tokens
struct TideTheme {
    // Colors
    static let primary = Color("TidePrimary")      // #0066FF
    static let secondary = Color("TideSecondary")  // #00CC88
    static let background = Color("TideBackground")
    static let surface = Color("TideSurface")

    // Typography
    static let titleFont = Font.system(size: 28, weight: .bold)
    static let bodyFont = Font.system(size: 16, weight: .regular)

    // Spacing
    static let spacing1 = CGFloat(4)
    static let spacing2 = CGFloat(8)
    static let spacing3 = CGFloat(16)
    static let spacing4 = CGFloat(24)

    // Corner radius
    static let radiusSmall = CGFloat(8)
    static let radiusMedium = CGFloat(12)
    static let radiusLarge = CGFloat(16)
}
```

## 🧠 Local AI (CoreML)

```swift
// Load CoreML model
let model = try IntentClassifier(configuration: MLModelConfiguration())

// Inference
let prediction = try model.prediction(text: userMessage)

// Handle offline
if prediction.confidence > 0.8 {
    handleIntent(prediction.intent)
} else {
    // Queue for server processing when online
    offlineQueue.append(userMessage)
}
```

## 💾 Offline-First Data Layer

```swift
// CoreData stack
class DataManager {
    static let shared = DataManager()

    lazy var persistentContainer: NSPersistentContainer = {
        let container = NSPersistentContainer(name: "Tide")
        container.loadPersistentStores { description, error in
            if let error = error {
                fatalError("Unable to load persistent stores: \(error)")
            }
        }
        return container
    }()

    // Save context
    func save() {
        let context = persistentContainer.viewContext
        if context.hasChanges {
            do {
                try context.save()
            } catch {
                print("Error saving: \(error)")
            }
        }
    }
}

// Sync strategy
class SyncManager {
    func sync() async {
        // 1. Upload pending changes
        let pendingChanges = await fetchPendingChanges()
        try await uploadChanges(pendingChanges)

        // 2. Download server updates
        let serverUpdates = try await fetchServerUpdates()
        await applyUpdates(serverUpdates)

        // 3. Resolve conflicts
        await resolveConflicts()
    }
}
```

## 🔔 Background Processing

```swift
// Background tasks
import BackgroundTasks

func scheduleAppRefresh() {
    let request = BGAppRefreshTaskRequest(identifier: "ai.tide.refresh")
    request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60) // 15 minutes

    try? BGTaskScheduler.shared.submit(request)
}

func handleAppRefresh(task: BGAppRefreshTask) {
    // Sync data in background
    Task {
        await SyncManager.shared.sync()
        task.setTaskCompleted(success: true)
    }
}
```

## 📊 Performance Monitoring

```swift
// Metrics tracking
struct PerformanceMetrics {
    static func trackAppLaunch() {
        let launchTime = Date().timeIntervalSince(appStartTime)
        Analytics.track("app_launch_time", ["duration": launchTime])
        // Goal: <1 second
    }

    static func trackResponseTime(operation: String, duration: TimeInterval) {
        Analytics.track("response_time", [
            "operation": operation,
            "duration": duration
        ])
        // Goal: <100ms
    }

    static func trackFrameRate() {
        // Monitor 60fps
    }
}
```

## 🧪 Testing

```swift
// Unit tests
@testable import TideIOS
import XCTest

class AuthServiceTests: XCTestCase {
    func testRegistration() async throws {
        let service = AuthService(apiClient: MockAPIClient())
        let user = try await service.register(
            email: "test@tide.ai",
            password: "TestPass123!",
            name: "Test User"
        )
        XCTAssertEqual(user.email, "test@tide.ai")
    }
}

// UI tests
class TideUITests: XCTestCase {
    func testAuthFlow() {
        let app = XCUIApplication()
        app.launch()

        // Test registration flow
        app.buttons["Register"].tap()
        app.textFields["Email"].tap()
        app.textFields["Email"].typeText("test@tide.ai")
        // ... complete flow

        XCTAssert(app.staticTexts["Welcome"].exists)
    }
}
```

## 📈 Week 1-3 Milestones

### Week 1 ✅ COMPLETE
- [x] Project setup
- [x] Authentication flow (register, login, token refresh)
- [x] Navigation structure
- [x] Design system
- [x] ViewModels (Login, Register)
- [x] Services (Auth, API, Keychain)

### Week 2 ✅ COMPLETE
- [x] Chat UI with message bubbles
- [x] Message sending/receiving (simulated)
- [x] Action preview cards
- [x] Suggestion chips
- [x] Typing indicator
- [x] TideCore business logic

### Week 3 ✅ PHASE 1 COMPLETE (Persistence)
- [x] Core models (Message, Conversation, Email, CalendarEvent)
- [x] Email view with smart categorization
- [x] Calendar view with event cards
- [x] Meeting prep cards
- [x] **CoreData persistence layer** ✨ NEW
- [x] **DataManager with CRUD operations** ✨ NEW
- [x] **Data persists across app restarts** ✨ NEW
- [x] **TideCore integration with CoreData** ✨ NEW
- [ ] Error handling UI (Week 3 Phase 2)
- [ ] WebSocket integration (Week 4)
- [ ] Local ML inference (CoreML) (Week 4)
- [ ] Push notifications (Week 4)
- [ ] Unit tests (Week 4)
- [ ] Alpha testing (Week 5)

## 🐛 Debugging

```bash
# View console logs
xcrun simctl spawn booted log stream --predicate 'subsystem == "ai.tide"'

# Network debugging
# Enable in Xcode: Debug -> Network Link Conditioner

# CoreML debugging
# Xcode -> Product -> Scheme -> Edit Scheme -> Run -> Arguments
# Add: -com.apple.CoreML.logging 3
```

## 🚀 Deployment

```bash
# TestFlight
xcodebuild archive -scheme TideIOS -archivePath ./build/Tide.xcarchive
xcodebuild -exportArchive -archivePath ./build/Tide.xcarchive -exportPath ./build -exportOptionsPlist ExportOptions.plist

# App Store
# Use Xcode Organizer or fastlane
fastlane release
```

## 📝 Next Steps

1. Implement authentication UI
2. Build chat interface
3. Integrate WebSocket real-time
4. Add local ML models
5. Implement offline sync
6. Performance optimization
7. User testing

## 🔗 Resources

- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [CoreML Guide](https://developer.apple.com/documentation/coreml)
- [Apollo iOS](https://www.apollographql.com/docs/ios/)
- [Backend API Docs](../../packages/services/auth/README.md)
