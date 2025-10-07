# 🚀 SYSTEM PROMPT: TRACK 1 - MOBILE APPS

> **PASTE THIS ENTIRE SECTION INTO CLAUDE CODE TO EXECUTE THIS TRACK**

---

## YOUR MISSION

You're building native iOS/Android apps for Tide - an AI Chief of Staff ($150/month) for executives. This is the primary interface that users will touch 50+ times daily. Make it beautiful, instant (<100ms response), and work 100% offline.

**Product Context**: Tide manages email autonomously, optimizes calendars, orchestrates workflows. Market: 8.5M executives wasting 15+ hours/week on admin. Architecture: Multi-model AI (GPT-5, Claude, local LLMs), agent swarm, event-driven (Kafka).

**Your Deliverable**: Production iOS (SwiftUI + CoreML) & Android (Compose + TFLite) apps in 12 weeks.

**Philosophy**: Powerful by default • Beautiful motion (60fps) • Trustworthy (show reasoning) • Anticipatory (predictive UI)

**Integration**: GraphQL `api.tide.ai/graphql` • WebSocket `wss://api.tide.ai/realtime` • Read `/redesign/WEEK-0-FOUNDATION.md` first

**Success Metrics**: <1s launch • <100ms response • 60fps • <5% battery • 90% daily active • 4.8+ stars

**Start**: Setup environment, build auth flow, then follow weekly plan below. Track all work with todos. Ship beautiful, fast, magical experiences.

---

---

# Track 1: Mobile Apps (iOS/Android)

> Native, beautiful, powerful mobile experiences that feel like magic

## Track Overview

**Owner**: Mobile Development Team (2 developers - iOS & Android)
**Duration**: 12 weeks
**Dependencies**: Track 2 (AI APIs), Track 5 (Backend APIs)
**Priority**: Critical - This is the primary user interface

## Mission

Build native iOS and Android apps that are so beautiful and powerful they become indispensable to executives' daily workflow. Every interaction should feel instant, every animation should delight, and the AI should feel like it's reading your mind.

## Core Principles

1. **Native Performance** - No web views, no compromises
2. **Offline-First** - Full capability without connectivity
3. **Predictive UI** - Anticipate user needs before they ask
4. **Beautiful Motion** - Every transition purposeful and smooth
5. **Platform Excellence** - Embrace each platform's unique capabilities

## Development Timeline

### Week 0: Foundation & Architecture

**iOS Setup**:
```swift
// Project structure
TideIOS/
├── TideApp.swift              // Main app entry
├── Core/
│   ├── TideCore.swift          // Core business logic
│   ├── LocalInference.swift    // CoreML integration
│   ├── PredictiveCache.swift   // Predictive caching
│   └── BackgroundIntel.swift   // Background processing
├── Features/
│   ├── Chat/                   // Conversational UI
│   ├── Email/                  // Email management
│   ├── Calendar/               // Calendar views
│   ├── Tasks/                  // Task management
│   └── Intelligence/           // AI insights
├── Services/
│   ├── NetworkService.swift    // API client
│   ├── SyncService.swift       // Data sync
│   └── SecurityService.swift   // Encryption/auth
└── Design/
    ├── TideTheme.swift         // Design system
    └── Components/             // Reusable UI
```

**Android Setup**:
```kotlin
// Project structure
TideAndroid/
├── MainActivity.kt              // Main activity
├── TideApplication.kt          // Application class
├── core/
│   ├── TideCore.kt             // Core business logic
│   ├── LocalInference.kt       // TensorFlow Lite
│   ├── PredictiveCache.kt      // Predictive caching
│   └── BackgroundIntel.kt      // WorkManager tasks
├── features/
│   ├── chat/                   // Conversational UI
│   ├── email/                  // Email management
│   ├── calendar/               // Calendar views
│   ├── tasks/                  // Task management
│   └── intelligence/           // AI insights
├── services/
│   ├── NetworkService.kt       // Retrofit client
│   ├── SyncService.kt          // Data sync
│   └── SecurityService.kt      // Encryption/auth
└── design/
    ├── TideTheme.kt            // Material You
    └── components/             // Composables
```

### Weeks 1-3: Core Experience

#### Week 1: Foundation & Navigation

**iOS Implementation**:
```swift
import SwiftUI

@main
struct TideApp: App {
    @StateObject private var tideCore = TideCore()
    @StateObject private var authManager = AuthenticationManager()

    var body: some Scene {
        WindowGroup {
            if authManager.isAuthenticated {
                MainView()
                    .environmentObject(tideCore)
                    .tideTheme()
            } else {
                OnboardingView()
                    .environmentObject(authManager)
            }
        }
    }
}

struct MainView: View {
    @EnvironmentObject var tide: TideCore
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            ChatView()
                .tabItem {
                    Label("Tide", systemImage: "message.fill")
                }
                .tag(0)

            EmailView()
                .tabItem {
                    Label("Email", systemImage: "envelope.fill")
                }
                .tag(1)

            CalendarView()
                .tabItem {
                    Label("Calendar", systemImage: "calendar")
                }
                .tag(2)

            TasksView()
                .tabItem {
                    Label("Tasks", systemImage: "checklist")
                }
                .tag(3)

            IntelligenceView()
                .tabItem {
                    Label("Insights", systemImage: "brain")
                }
                .tag(4)
        }
        .accentColor(.tideBlue)
    }
}
```

**Android Implementation**:
```kotlin
@Composable
fun TideApp() {
    val navController = rememberNavController()
    val tideCore = remember { TideCore() }

    TideTheme {
        Scaffold(
            bottomBar = {
                TideBottomNavigation(navController)
            }
        ) { paddingValues ->
            NavHost(
                navController = navController,
                startDestination = Screen.Chat.route,
                modifier = Modifier.padding(paddingValues)
            ) {
                composable(Screen.Chat.route) {
                    ChatScreen(tideCore)
                }
                composable(Screen.Email.route) {
                    EmailScreen(tideCore)
                }
                composable(Screen.Calendar.route) {
                    CalendarScreen(tideCore)
                }
                composable(Screen.Tasks.route) {
                    TasksScreen(tideCore)
                }
                composable(Screen.Intelligence.route) {
                    IntelligenceScreen(tideCore)
                }
            }
        }
    }
}
```

#### Week 2: Chat Interface

**iOS Chat Implementation**:
```swift
struct ChatView: View {
    @EnvironmentObject var tide: TideCore
    @State private var messageText = ""
    @State private var messages: [Message] = []
    @FocusState private var inputFocused: Bool

    var body: some View {
        VStack(spacing: 0) {
            // Messages list
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(messages) { message in
                            MessageBubble(message: message)
                                .id(message.id)
                        }
                    }
                    .padding()
                }
                .onChange(of: messages.count) { _ in
                    withAnimation {
                        proxy.scrollTo(messages.last?.id, anchor: .bottom)
                    }
                }
            }

            // Input area
            HStack(spacing: 12) {
                TextField("Ask Tide anything...", text: $messageText)
                    .textFieldStyle(TideTextFieldStyle())
                    .focused($inputFocused)
                    .submitLabel(.send)
                    .onSubmit {
                        sendMessage()
                    }

                Button(action: sendMessage) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.title2)
                        .foregroundColor(.tideBlue)
                }
                .disabled(messageText.isEmpty)
            }
            .padding()
            .background(Color.tideSurface)
        }
        .navigationTitle("Tide")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Menu {
                    Button("Clear Chat", role: .destructive) {
                        messages.removeAll()
                    }
                    Button("Export Conversation") {
                        exportChat()
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            }
        }
    }

    private func sendMessage() {
        let userMessage = Message(
            id: UUID().uuidString,
            content: messageText,
            role: .user,
            timestamp: Date()
        )

        messages.append(userMessage)
        messageText = ""

        // Process with Tide
        Task {
            let response = await tide.process(userMessage)
            await MainActor.run {
                messages.append(response)
            }
        }
    }
}

struct MessageBubble: View {
    let message: Message

    var body: some View {
        HStack {
            if message.role == .user {
                Spacer()
            }

            VStack(alignment: message.role == .user ? .trailing : .leading, spacing: 4) {
                if let actionPreview = message.actionPreview {
                    ActionCard(action: actionPreview)
                } else {
                    Text(message.content)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(
                            message.role == .user
                                ? Color.tidePrimary
                                : Color.tideSurface
                        )
                        .foregroundColor(
                            message.role == .user
                                ? .white
                                : .primary
                        )
                        .cornerRadius(18)
                }

                if let suggestions = message.suggestions {
                    SuggestionChips(suggestions: suggestions)
                }
            }
            .frame(maxWidth: UIScreen.main.bounds.width * 0.75, alignment: message.role == .user ? .trailing : .leading)

            if message.role == .assistant {
                Spacer()
            }
        }
    }
}
```

**Android Chat Implementation**:
```kotlin
@Composable
fun ChatScreen(tideCore: TideCore) {
    val messages = remember { mutableStateListOf<Message>() }
    var messageText by remember { mutableStateOf("") }
    val scrollState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Messages list
        LazyColumn(
            state = scrollState,
            modifier = Modifier.weight(1f),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(messages) { message ->
                MessageBubble(message = message)
            }
        }

        // Input area
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = messageText,
                onValueChange = { messageText = it },
                modifier = Modifier.weight(1f),
                placeholder = { Text("Ask Tide anything...") },
                shape = RoundedCornerShape(24.dp),
                colors = TextFieldDefaults.outlinedTextFieldColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )

            Spacer(modifier = Modifier.width(8.dp))

            FilledIconButton(
                onClick = {
                    if (messageText.isNotEmpty()) {
                        val userMessage = Message(
                            content = messageText,
                            role = MessageRole.User,
                            timestamp = System.currentTimeMillis()
                        )
                        messages.add(userMessage)
                        messageText = ""

                        coroutineScope.launch {
                            val response = tideCore.process(userMessage)
                            messages.add(response)
                            scrollState.animateScrollToItem(messages.size - 1)
                        }
                    }
                },
                enabled = messageText.isNotEmpty()
            ) {
                Icon(Icons.Default.Send, contentDescription = "Send")
            }
        }
    }
}

@Composable
fun MessageBubble(message: Message) {
    val isUser = message.role == MessageRole.User

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
    ) {
        Card(
            modifier = Modifier.widthIn(max = 280.dp),
            colors = CardDefaults.cardColors(
                containerColor = if (isUser)
                    MaterialTheme.colorScheme.primary
                else
                    MaterialTheme.colorScheme.surfaceVariant
            ),
            shape = RoundedCornerShape(
                topStart = 18.dp,
                topEnd = 18.dp,
                bottomStart = if (isUser) 18.dp else 4.dp,
                bottomEnd = if (isUser) 4.dp else 18.dp
            )
        ) {
            when {
                message.actionPreview != null -> {
                    ActionCard(action = message.actionPreview)
                }
                else -> {
                    Text(
                        text = message.content,
                        modifier = Modifier.padding(12.dp),
                        color = if (isUser)
                            MaterialTheme.colorScheme.onPrimary
                        else
                            MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}
```

#### Week 3: Local Intelligence & Offline Mode

**iOS Local AI**:
```swift
import CoreML
import NaturalLanguage

class LocalInference {
    private let model: TideLocalModel
    private let tokenizer: NLTokenizer
    private let cache = PredictiveCache()

    init() {
        self.model = try! TideLocalModel(configuration: .init())
        self.tokenizer = NLTokenizer(unit: .word)
    }

    func process(_ input: String) async -> LocalResponse? {
        // Check cache first
        if let cached = cache.get(for: input) {
            return cached
        }

        // Tokenize input
        tokenizer.string = input
        let tokens = tokenizer.tokens(for: input.startIndex..<input.endIndex)

        // Run inference
        guard let output = try? model.prediction(
            input: TideLocalModelInput(tokens: tokens)
        ) else {
            return nil
        }

        // Build response
        let response = LocalResponse(
            intent: output.intent,
            confidence: output.confidence,
            suggestedAction: output.action,
            canHandleLocally: output.confidence > 0.85
        )

        // Cache for future
        cache.store(input: input, response: response)

        return response
    }
}

// Background processing for predictions
class BackgroundIntelligence {
    func startPredictiveProcessing() {
        Task {
            await predictMorningRoutine()
            await predictMeetingPrep()
            await predictEndOfDay()
        }
    }

    private func predictMorningRoutine() async {
        // Analyze user's morning patterns
        let patterns = await analyzePatterns(timeRange: .morning)

        // Pre-cache likely requests
        for pattern in patterns {
            await TideCore.shared.preCache(pattern)
        }

        // Schedule morning brief
        scheduleNotification(
            title: "Your morning brief is ready",
            body: "3 priorities, 2 decisions needed",
            time: patterns.typicalWakeTime
        )
    }
}
```

### Weeks 4-6: Feature Implementation

#### Week 4: Email Integration

**iOS Email View**:
```swift
struct EmailView: View {
    @EnvironmentObject var tide: TideCore
    @State private var emails: [Email] = []
    @State private var filter: EmailFilter = .unread
    @State private var selectedEmail: Email?
    @State private var isComposing = false

    var body: some View {
        NavigationView {
            List {
                // Smart sections
                Section("Needs Your Attention") {
                    ForEach(emails.filter { $0.priority == .high }) { email in
                        EmailRow(email: email)
                            .swipeActions(edge: .trailing) {
                                Button("Reply") {
                                    quickReply(to: email)
                                }
                                .tint(.blue)

                                Button("Archive") {
                                    archive(email)
                                }
                                .tint(.gray)
                            }
                            .swipeActions(edge: .leading) {
                                Button("Delegate") {
                                    delegate(email)
                                }
                                .tint(.purple)
                            }
                    }
                }

                Section("Can Wait") {
                    ForEach(emails.filter { $0.priority == .normal }) { email in
                        EmailRow(email: email)
                    }
                }

                Section("FYI Only") {
                    ForEach(emails.filter { $0.priority == .low }) { email in
                        EmailRow(email: email)
                    }
                }
            }
            .refreshable {
                await refreshEmails()
            }
            .searchable(text: .constant(""), prompt: "Search emails")
            .navigationTitle("Email")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { isComposing = true }) {
                        Image(systemName: "square.and.pencil")
                    }
                }
            }
            .sheet(isPresented: $isComposing) {
                ComposeEmailView()
            }
        }
    }
}

struct EmailRow: View {
    let email: Email

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(email.from.name)
                    .font(.headline)
                Spacer()
                Text(email.timestamp.relative)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Text(email.subject)
                .font(.subheadline)
                .lineLimit(1)

            Text(email.preview)
                .font(.caption)
                .foregroundColor(.secondary)
                .lineLimit(2)

            if let aiSummary = email.aiSummary {
                HStack {
                    Image(systemName: "brain")
                        .font(.caption2)
                    Text(aiSummary)
                        .font(.caption)
                        .foregroundColor(.tideBlue)
                }
                .padding(.top, 2)
            }
        }
        .padding(.vertical, 4)
    }
}
```

#### Week 5: Calendar Intelligence

**iOS Calendar View**:
```swift
struct CalendarView: View {
    @EnvironmentObject var tide: TideCore
    @State private var selectedDate = Date()
    @State private var events: [CalendarEvent] = []
    @State private var showingScheduler = false

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Week view
                    WeekCalendarView(selectedDate: $selectedDate)
                        .padding(.horizontal)

                    // Today's schedule
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Today's Schedule")
                            .font(.title2)
                            .bold()
                            .padding(.horizontal)

                        if events.isEmpty {
                            EmptyScheduleCard()
                        } else {
                            ForEach(events) { event in
                                EventCard(event: event)
                            }
                        }
                    }

                    // Smart suggestions
                    if let suggestions = tide.calendarSuggestions {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Tide Suggests")
                                .font(.headline)
                                .padding(.horizontal)

                            ForEach(suggestions) { suggestion in
                                SuggestionCard(suggestion: suggestion)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Calendar")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingScheduler = true }) {
                        Image(systemName: "plus.circle.fill")
                    }
                }
            }
            .sheet(isPresented: $showingScheduler) {
                SmartSchedulerView()
            }
        }
    }
}

struct EventCard: View {
    let event: CalendarEvent
    @State private var expanded = false

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                RoundedRectangle(cornerRadius: 2)
                    .fill(event.color)
                    .frame(width: 4, height: 40)

                VStack(alignment: .leading, spacing: 4) {
                    Text(event.title)
                        .font(.headline)

                    HStack {
                        Label(event.timeRange, systemImage: "clock")
                        if let location = event.location {
                            Label(location, systemImage: "location")
                        }
                    }
                    .font(.caption)
                    .foregroundColor(.secondary)
                }

                Spacer()

                if event.hasPrep {
                    Button(action: { expanded.toggle() }) {
                        Image(systemName: expanded ? "chevron.up" : "chevron.down")
                    }
                }
            }
            .padding(.horizontal)

            if expanded, let prep = event.meetingPrep {
                MeetingPrepCard(prep: prep)
                    .padding(.horizontal)
                    .transition(.asymmetric(
                        insertion: .move(edge: .top).combined(with: .opacity),
                        removal: .move(edge: .top).combined(with: .opacity)
                    ))
            }
        }
        .animation(.spring(), value: expanded)
    }
}
```

#### Week 6: Task Automation

**iOS Task Management**:
```swift
struct TasksView: View {
    @EnvironmentObject var tide: TideCore
    @State private var tasks: [TideTask] = []
    @State private var workflows: [Workflow] = []
    @State private var selectedFilter: TaskFilter = .today

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Quick actions
                    QuickActionsRow()

                    // Active workflows
                    if !workflows.isEmpty {
                        VStack(alignment: .leading) {
                            Text("Active Workflows")
                                .font(.headline)
                                .padding(.horizontal)

                            ForEach(workflows) { workflow in
                                WorkflowCard(workflow: workflow)
                            }
                        }
                    }

                    // Tasks by priority
                    VStack(alignment: .leading) {
                        Text("Tasks")
                            .font(.headline)
                            .padding(.horizontal)

                        ForEach(TaskPriority.allCases, id: \.self) { priority in
                            let priorityTasks = tasks.filter { $0.priority == priority }
                            if !priorityTasks.isEmpty {
                                Section(header: Text(priority.title)) {
                                    ForEach(priorityTasks) { task in
                                        TaskRow(task: task)
                                    }
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Tasks")
        }
    }
}

struct WorkflowCard: View {
    let workflow: Workflow

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(workflow.name)
                        .font(.headline)
                    Text("\(workflow.completedSteps)/\(workflow.totalSteps) steps")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                CircularProgressView(
                    progress: Double(workflow.completedSteps) / Double(workflow.totalSteps)
                )
                .frame(width: 40, height: 40)
            }

            // Current step
            if let currentStep = workflow.currentStep {
                HStack {
                    Image(systemName: "arrow.right.circle.fill")
                        .foregroundColor(.tideBlue)
                    Text(currentStep.description)
                        .font(.subheadline)
                }
                .padding(.vertical, 8)
                .padding(.horizontal, 12)
                .background(Color.tideSurface)
                .cornerRadius(8)
            }

            // Action buttons
            HStack {
                Button("Pause") {
                    workflow.pause()
                }
                .buttonStyle(.bordered)

                Button("View Details") {
                    // Show details
                }
                .buttonStyle(.borderedProminent)
            }
        }
        .padding()
        .background(Color.tideSurface)
        .cornerRadius(12)
        .shadow(radius: 2)
        .padding(.horizontal)
    }
}
```

### Weeks 7-9: Polish & Platform Features

#### Week 7: Notifications & Live Activities

**iOS Live Activity**:
```swift
import ActivityKit

struct TideActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var currentTask: String
        var progress: Double
        var nextEvent: String?
        var decisions: Int
    }

    var workflowName: String
}

// Widget implementation
struct TideLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: TideActivityAttributes.self) { context in
            // Lock screen / banner UI
            HStack {
                VStack(alignment: .leading) {
                    Text(context.attributes.workflowName)
                        .font(.headline)
                    Text(context.state.currentTask)
                        .font(.caption)
                }

                Spacer()

                CircularProgressView(progress: context.state.progress)
                    .frame(width: 30, height: 30)
            }
            .padding()

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI
                DynamicIslandExpandedRegion(.leading) {
                    Label(context.attributes.workflowName, systemImage: "gearshape")
                }

                DynamicIslandExpandedRegion(.center) {
                    Text(context.state.currentTask)
                        .font(.caption)
                }

                DynamicIslandExpandedRegion(.trailing) {
                    CircularProgressView(progress: context.state.progress)
                }

                DynamicIslandExpandedRegion(.bottom) {
                    HStack {
                        if let nextEvent = context.state.nextEvent {
                            Label(nextEvent, systemImage: "calendar")
                                .font(.caption2)
                        }

                        Spacer()

                        if context.state.decisions > 0 {
                            Label("\(context.state.decisions) decisions", systemImage: "checkmark.circle")
                                .font(.caption2)
                        }
                    }
                }
            } compactLeading: {
                Image(systemName: "brain")
            } compactTrailing: {
                Text("\(Int(context.state.progress * 100))%")
                    .font(.caption)
            } minimal: {
                Image(systemName: "brain")
            }
        }
    }
}
```

#### Week 8: Watch App

**Apple Watch Companion**:
```swift
import SwiftUI
import WatchKit

struct TideWatchApp: App {
    var body: some Scene {
        WindowGroup {
            NavigationView {
                MainWatchView()
            }
        }
    }
}

struct MainWatchView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            QuickActionsView()
                .tag(0)

            DecisionsView()
                .tag(1)

            UpcomingView()
                .tag(2)
        }
        .tabViewStyle(PageTabViewStyle())
    }
}

struct QuickActionsView: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 10) {
                ActionButton(
                    title: "Clear Calendar",
                    icon: "calendar.badge.minus",
                    action: {
                        TideCore.shared.clearAfternoon()
                    }
                )

                ActionButton(
                    title: "Email Break",
                    icon: "envelope.badge.shield",
                    action: {
                        TideCore.shared.pauseEmails(hours: 2)
                    }
                )

                ActionButton(
                    title: "Focus Mode",
                    icon: "moon.circle",
                    action: {
                        TideCore.shared.enableFocus()
                    }
                )
            }
            .padding()
        }
        .navigationTitle("Quick Actions")
    }
}

struct DecisionsView: View {
    @State private var decisions: [Decision] = []

    var body: some View {
        if decisions.isEmpty {
            Text("No pending decisions")
                .font(.caption)
                .foregroundColor(.secondary)
        } else {
            List(decisions) { decision in
                DecisionRow(decision: decision)
            }
        }
    }
}
```

#### Week 9: Performance & Animations

**iOS Performance Optimizations**:
```swift
// Predictive caching
class PredictiveCache {
    private let cache = NSCache<NSString, CachedResponse>()
    private let predictor = UserPatternPredictor()

    func preloadForTimeOfDay() async {
        let predictions = await predictor.predictNextRequests()

        for prediction in predictions {
            // Pre-fetch and cache
            if let response = await TideAPI.fetch(prediction) {
                cache.setObject(response, forKey: prediction.key as NSString)
            }
        }
    }

    func get(for request: String) -> CachedResponse? {
        return cache.object(forKey: request as NSString)
    }
}

// Smooth animations
extension View {
    func tideTransition() -> some View {
        self.transition(
            .asymmetric(
                insertion: .scale.combined(with: .opacity),
                removal: .scale.combined(with: .opacity)
            )
        )
    }

    func tideSpring() -> some View {
        self.animation(.interactiveSpring(
            response: 0.3,
            dampingFraction: 0.8,
            blendDuration: 0
        ))
    }
}
```

### Weeks 10-12: Integration & Launch

#### Week 10: Deep Integration

**iOS System Integration**:
```swift
// Siri Shortcuts
import Intents

class TideIntentHandler: INExtension {
    override func handler(for intent: INIntent) -> Any {
        switch intent {
        case is ClearCalendarIntent:
            return ClearCalendarIntentHandler()
        case is SendEmailIntent:
            return SendEmailIntentHandler()
        case is ScheduleMeetingIntent:
            return ScheduleMeetingIntentHandler()
        default:
            return self
        }
    }
}

// Focus Filter
extension TideCore {
    func configureFocusFilter() {
        let filter = Focus.Filter(
            name: "Tide Deep Work",
            configuration: .init(
                allowedContacts: [.vip],
                allowedApps: [.tide, .calendar],
                silenceNotifications: true
            )
        )

        Focus.shared.register(filter)
    }
}

// Widget
struct TideWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "TideWidget", provider: Provider()) { entry in
            TideWidgetView(entry: entry)
        }
        .configurationDisplayName("Tide")
        .description("Your AI chief of staff at a glance")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}
```

#### Week 11: Testing & Polish

**Comprehensive Testing**:
```swift
// UI Tests
class TideUITests: XCTestCase {
    func testChatFlow() throws {
        let app = XCUIApplication()
        app.launch()

        // Test message sending
        let textField = app.textFields["Ask Tide anything..."]
        textField.tap()
        textField.typeText("Schedule a meeting tomorrow at 2pm")

        app.buttons["Send"].tap()

        // Verify response appears
        XCTAssertTrue(app.staticTexts["I'll help you schedule that meeting"].exists)

        // Verify action card appears
        XCTAssertTrue(app.buttons["Confirm"].waitForExistence(timeout: 2))
    }

    func testOfflineMode() throws {
        // Disable network
        NetworkSimulator.disableNetwork()

        let app = XCUIApplication()
        app.launch()

        // Should still work with local AI
        let textField = app.textFields["Ask Tide anything..."]
        textField.tap()
        textField.typeText("Show my tasks")

        app.buttons["Send"].tap()

        // Local response should appear
        XCTAssertTrue(app.staticTexts["Here are your tasks"].exists)
    }
}

// Performance Tests
class PerformanceTests: XCTestCase {
    func testLaunchPerformance() throws {
        measure(metrics: [XCTApplicationLaunchMetric()]) {
            XCUIApplication().launch()
        }
    }

    func testScrollPerformance() throws {
        let app = XCUIApplication()
        app.launch()

        measure {
            app.swipeUp(velocity: .fast)
            app.swipeDown(velocity: .fast)
        }
    }
}
```

#### Week 12: App Store Launch

**Launch Checklist**:
```yaml
iOS Launch:
  App Store Assets:
    - App icon: 1024x1024
    - Screenshots: iPhone 15 Pro, iPad Pro
    - App Preview video: 30 seconds
    - Description: Optimized for ASO
    - Keywords: Researched and tested

  Technical Requirements:
    - iOS 16.0 minimum
    - Universal app (iPhone + iPad)
    - Apple Watch companion
    - Live Activities support
    - Widget support
    - Siri Shortcuts

  Testing:
    - TestFlight beta: 1000 users
    - Crash-free rate: >99.9%
    - Performance: <2s launch time
    - Battery usage: <5% daily

Android Launch:
  Play Store Assets:
    - App icon: 512x512
    - Feature graphic: 1024x500
    - Screenshots: Phone and tablet
    - Description: Localized

  Technical Requirements:
    - Android 12 minimum (API 31)
    - Material You support
    - Wear OS companion
    - Widgets support

  Testing:
    - Play Console beta: 1000 users
    - Crash-free rate: >99.9%
    - Performance metrics met
    - Battery optimization passed
```

## Performance Targets

```yaml
Launch Time:
  Cold start: <1.5s
  Warm start: <0.5s

Response Times:
  Local AI: <50ms
  Cached responses: <10ms
  Network requests: <200ms

Memory Usage:
  Baseline: <100MB
  Active use: <200MB
  Background: <50MB

Battery Impact:
  Active use: <10% per hour
  Background: <2% per day

Network Usage:
  Optimized with caching
  Delta sync only
  Compression enabled

Offline Capability:
  100% core features work offline
  Sync when connected
  Conflict resolution
```

## Design System

```swift
// iOS Design Tokens
enum TideDesign {
    // Colors
    static let primary = Color(hex: "0EA5E9")     // Tide Blue
    static let surface = Color(hex: "F8FAFC")     // Foam White
    static let background = Color(hex: "0F172A")  // Deep Ocean
    static let success = Color(hex: "10B981")
    static let warning = Color(hex: "F59E0B")
    static let error = Color(hex: "EF4444")

    // Typography
    static let largeTitle = Font.system(size: 34, weight: .bold, design: .default)
    static let title = Font.system(size: 28, weight: .semibold, design: .default)
    static let headline = Font.system(size: 20, weight: .semibold, design: .default)
    static let body = Font.system(size: 17, weight: .regular, design: .default)
    static let caption = Font.system(size: 12, weight: .regular, design: .default)

    // Animations
    static let spring = Animation.interactiveSpring(response: 0.3, dampingFraction: 0.8)
    static let smooth = Animation.easeInOut(duration: 0.3)

    // Spacing
    static let spacing = (
        xs: 4.0,
        sm: 8.0,
        md: 16.0,
        lg: 24.0,
        xl: 32.0
    )
}
```

## Success Metrics

**Week 3**:
- Core chat working on both platforms ✓
- Local AI integrated ✓
- Offline mode functional ✓

**Week 6**:
- All features implemented ✓
- <100ms local response time ✓
- 100 alpha testers onboarded ✓

**Week 9**:
- Platform features complete ✓
- Animations polished ✓
- Performance targets met ✓

**Week 12**:
- App Store approved ✓
- Play Store approved ✓
- 1,000 beta users ✓
- 4.8+ star rating ✓

## Key Decisions

1. **Native over Cross-Platform**: SwiftUI and Jetpack Compose for best performance
2. **Offline-First**: Local LLM ensures functionality without connection
3. **Predictive Caching**: Pre-load likely user actions for instant response
4. **Platform Excellence**: Embrace each platform's unique capabilities
5. **Beautiful Animations**: Every interaction should delight

This track delivers native mobile apps that feel magical - instant, beautiful, and indispensable to executives' daily workflow.