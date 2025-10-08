# ✨ MVP Feature Completion

**Timeline**: Weeks 6-8 (3 weeks)
**Priority**: 🔴 P0 - Must Have for Launch
**Dependencies**: Architecture cleanup, GPT-5 integration
**Based on**: `MVP_FEATURE_LIST.md` - 1.0 features only

---

## 🎯 Goal: Complete All MVP Features

From `MVP_FEATURE_LIST.md`, we need **1.0 features only** (NOT 1.5+ intelligence features):

### In Scope for 1.0 ✅
- Email: Detail view, compose, basic actions
- Calendar: Grid views, event CRUD
- Tasks: List view, task CRUD
- Navigation: Tab bar structure
- Auth: Login, onboarding, settings

### Out of Scope (Defer to 1.5+) ❌
- Dashboard intelligence
- Multi-draft composition
- Meeting briefs & prep
- VIP detection
- Calendar optimization AI
- Task auto-decomposition
- Decision queue
- Action queue
- Analytics & insights

---

## 📋 Week 6: Email Features

**Current**: 50% complete (Inbox works, can browse)
**Target**: 100% complete (Read, compose, send, actions)

### Day 1-2: Email Detail & Thread View

#### Files to Create/Update
```swift
// TideApp/Features/Email/EmailDetailView.swift (already exists, needs completion)

struct EmailDetailView: View {
    @EnvironmentObject var container: DependencyContainer
    @StateObject private var viewModel: EmailDetailViewModel
    let emailId: String

    init(emailId: String, container: DependencyContainer) {
        self.emailId = emailId
        _viewModel = StateObject(wrappedValue: container.makeEmailDetailViewModel(emailId: emailId))
    }

    var body: some View {
        ScrollView {
            if viewModel.isLoading {
                LoadingView()
            } else if let email = viewModel.email {
                VStack(alignment: .leading, spacing: 16) {
                    // Header
                    EmailHeaderView(email: email)

                    Divider()

                    // Body
                    EmailBodyView(html: email.body)

                    // Attachments
                    if !email.attachments.isEmpty {
                        AttachmentsView(attachments: email.attachments)
                    }

                    // Thread (if part of conversation)
                    if viewModel.thread.count > 1 {
                        EmailThreadView(thread: viewModel.thread)
                    }
                }
                .padding()
            } else if let error = viewModel.error {
                TideErrorView(error: error) {
                    Task { await viewModel.load() }
                }
            }
        }
        .navigationTitle("Email")
        .toolbar {
            ToolbarItemGroup(placement: .navigationBarTrailing) {
                Button(action: { viewModel.showReply = true }) {
                    Label("Reply", systemImage: "arrowshape.turn.up.left")
                }

                Button(action: { viewModel.showForward = true }) {
                    Label("Forward", systemImage: "arrowshape.turn.up.right")
                }

                Menu {
                    Button(action: { Task { await viewModel.archive() } }) {
                        Label("Archive", systemImage: "archivebox")
                    }

                    Button(role: .destructive, action: { Task { await viewModel.delete() } }) {
                        Label("Delete", systemImage: "trash")
                    }

                    Button(action: { Task { await viewModel.toggleFlag() } }) {
                        Label(
                            viewModel.email?.isStarred == true ? "Unstar" : "Star",
                            systemImage: "star"
                        )
                    }
                } label: {
                    Label("More", systemImage: "ellipsis.circle")
                }
            }
        }
        .sheet(isPresented: $viewModel.showReply) {
            EmailComposeView(
                mode: .reply(to: viewModel.email!),
                container: container
            )
        }
        .sheet(isPresented: $viewModel.showForward) {
            EmailComposeView(
                mode: .forward(viewModel.email!),
                container: container
            )
        }
        .task {
            await viewModel.load()
        }
    }
}

// Supporting Views

struct EmailHeaderView: View {
    let email: Email

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(email.subject)
                .font(.title2)
                .fontWeight(.bold)

            HStack {
                AsyncImage(url: email.sender.avatarURL) { image in
                    image.resizable()
                } placeholder: {
                    Circle().fill(Color.gray.opacity(0.3))
                }
                .frame(width: 40, height: 40)
                .clipShape(Circle())

                VStack(alignment: .leading, spacing: 2) {
                    Text(email.sender.name)
                        .font(.subheadline)
                        .fontWeight(.medium)

                    Text(email.sender.email)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                Text(email.receivedAt, format: .relative(presentation: .named))
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            if email.recipients.count > 1 {
                Text("To: \(email.recipients.map(\.name).joined(separator: ", "))")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
}

struct EmailBodyView: View {
    let html: String
    @State private var attributedString: AttributedString?

    var body: some View {
        Group {
            if let attributedString {
                Text(attributedString)
                    .textSelection(.enabled)
            } else {
                ProgressView()
                    .task {
                        attributedString = try? AttributedString(
                            markdown: html.htmlToMarkdown()
                        )
                    }
            }
        }
    }
}

struct AttachmentsView: View {
    let attachments: [EmailAttachment]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Attachments")
                .font(.headline)

            ForEach(attachments) { attachment in
                AttachmentRow(attachment: attachment)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(8)
    }
}

struct AttachmentRow: View {
    let attachment: EmailAttachment

    var body: some View {
        HStack {
            Image(systemName: attachment.iconName)
                .foregroundColor(.blue)

            VStack(alignment: .leading) {
                Text(attachment.filename)
                    .font(.subheadline)

                Text(attachment.size.formatted(.byteCount(style: .file)))
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            Button("Download") {
                // Download attachment
            }
            .font(.caption)
        }
        .padding(8)
        .background(Color.white)
        .cornerRadius(4)
    }
}
```

#### ViewModel Implementation
```swift
// TideApp/Features/Email/EmailDetailViewModel.swift

@MainActor
class EmailDetailViewModel: ObservableObject {
    @Published var email: Email?
    @Published var thread: [Email] = []
    @Published var isLoading = false
    @Published var error: Error?
    @Published var showReply = false
    @Published var showForward = false

    private let emailId: String
    private let repository: EmailRepository
    private let apiClient: APIClientProtocol

    init(emailId: String, repository: EmailRepository, apiClient: APIClientProtocol) {
        self.emailId = emailId
        self.repository = repository
        self.apiClient = apiClient
    }

    func load() async {
        isLoading = true
        error = nil

        do {
            // Load email details
            email = try await apiClient.request(.email(id: emailId))

            // Load thread if part of conversation
            if let threadId = email?.threadId {
                thread = try await apiClient.request(.emailThread(id: threadId))
            }

            isLoading = false
        } catch {
            self.error = error
            isLoading = false
        }
    }

    func archive() async {
        do {
            try await apiClient.request(.emailArchive(id: emailId))
            // Navigate back
        } catch {
            self.error = error
        }
    }

    func delete() async {
        do {
            try await apiClient.request(.emailDelete(id: emailId))
            // Navigate back
        } catch {
            self.error = error
        }
    }

    func toggleFlag() async {
        guard let email else { return }

        do {
            let updated: Email = try await apiClient.request(
                .emailStar(id: emailId),
                body: ["starred": !email.isStarred]
            )
            self.email = updated
        } catch {
            self.error = error
        }
    }
}
```

**Checklist**:
- [ ] EmailDetailView UI complete
- [ ] EmailDetailViewModel with real API calls
- [ ] HTML to AttributedString rendering
- [ ] Attachment display and download
- [ ] Thread view for conversations
- [ ] Reply/Forward navigation
- [ ] Archive/Delete actions
- [ ] Star/Unstar action
- [ ] Error handling
- [ ] Loading states

---

### Day 3-4: Email Compose

#### Compose View
```swift
// TideApp/Features/Email/EmailComposeView.swift

enum EmailComposeMode {
    case new
    case reply(to: Email)
    case forward(Email)
}

struct EmailComposeView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var container: DependencyContainer
    @StateObject private var viewModel: EmailComposeViewModel

    init(mode: EmailComposeMode, container: DependencyContainer) {
        _viewModel = StateObject(wrappedValue: container.makeEmailComposeViewModel(mode: mode))
    }

    var body: some View {
        NavigationView {
            Form {
                Section {
                    // To field
                    HStack {
                        Text("To:")
                            .foregroundColor(.secondary)
                        TextField("Recipient", text: $viewModel.to)
                            .textContentType(.emailAddress)
                            .autocapitalization(.none)
                    }

                    // Cc (optional)
                    if viewModel.showCc {
                        HStack {
                            Text("Cc:")
                                .foregroundColor(.secondary)
                            TextField("Cc", text: $viewModel.cc)
                        }
                    }

                    // Subject
                    HStack {
                        Text("Subject:")
                            .foregroundColor(.secondary)
                        TextField("Subject", text: $viewModel.subject)
                    }
                }

                Section {
                    // Body
                    TextEditor(text: $viewModel.body)
                        .frame(minHeight: 200)
                }

                // AI Suggestions (using GPT-5)
                if !viewModel.aiSuggestions.isEmpty {
                    Section("AI Suggestions") {
                        ForEach(viewModel.aiSuggestions) { suggestion in
                            Button(action: {
                                viewModel.applySuggestion(suggestion)
                            }) {
                                VStack(alignment: .leading) {
                                    Text(suggestion.title)
                                        .font(.subheadline)
                                        .fontWeight(.medium)

                                    Text(suggestion.preview)
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                        .lineLimit(2)
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle(viewModel.navigationTitle)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Send") {
                        Task {
                            await viewModel.send()
                            if viewModel.sendSuccess {
                                dismiss()
                            }
                        }
                    }
                    .disabled(!viewModel.canSend)
                }

                ToolbarItem(placement: .bottomBar) {
                    Button(action: {
                        Task { await viewModel.generateAISuggestions() }
                    }) {
                        Label("AI Assist", systemImage: "sparkles")
                    }
                }
            }
            .alert("Error", isPresented: .constant(viewModel.error != nil)) {
                Button("OK") {
                    viewModel.error = nil
                }
            } message: {
                if let error = viewModel.error {
                    Text(error.localizedDescription)
                }
            }
        }
    }
}
```

#### Compose ViewModel
```swift
@MainActor
class EmailComposeViewModel: ObservableObject {
    @Published var to: String = ""
    @Published var cc: String = ""
    @Published var subject: String = ""
    @Published var body: String = ""
    @Published var showCc = false
    @Published var aiSuggestions: [AISuggestion] = []
    @Published var error: Error?
    @Published var sendSuccess = false

    private let mode: EmailComposeMode
    private let apiClient: APIClientProtocol

    var navigationTitle: String {
        switch mode {
        case .new: return "New Email"
        case .reply: return "Reply"
        case .forward: return "Forward"
        }
    }

    var canSend: Bool {
        !to.isEmpty && !subject.isEmpty && !body.isEmpty
    }

    init(mode: EmailComposeMode, apiClient: APIClientProtocol) {
        self.mode = mode
        self.apiClient = apiClient

        // Pre-fill based on mode
        switch mode {
        case .new:
            break

        case .reply(let email):
            to = email.sender.email
            subject = "Re: \(email.subject)"
            body = "\n\n---\nOn \(email.receivedAt.formatted()), \(email.sender.name) wrote:\n\(email.body)"

        case .forward(let email):
            subject = "Fwd: \(email.subject)"
            body = "\n\n---\nForwarded message:\nFrom: \(email.sender.name)\nDate: \(email.receivedAt.formatted())\nSubject: \(email.subject)\n\n\(email.body)"
        }
    }

    func send() async {
        do {
            let _: EmptyResponse = try await apiClient.request(
                .emailSend,
                body: EmailSendRequest(
                    to: to,
                    cc: cc.isEmpty ? nil : cc,
                    subject: subject,
                    body: body
                )
            )
            sendSuccess = true
        } catch {
            self.error = error
        }
    }

    func generateAISuggestions() async {
        // Call GPT-5 compose_email tool
        do {
            let suggestions: [AISuggestion] = try await apiClient.request(
                .aiEmailSuggest,
                body: AIEmailSuggestRequest(
                    to: to,
                    subject: subject,
                    context: body.isEmpty ? "Initial draft" : body
                )
            )
            aiSuggestions = suggestions
        } catch {
            self.error = error
        }
    }

    func applySuggestion(_ suggestion: AISuggestion) {
        body = suggestion.content
    }
}
```

**Checklist**:
- [ ] EmailComposeView UI complete
- [ ] Support new/reply/forward modes
- [ ] EmailComposeViewModel with send logic
- [ ] AI suggestions integration (GPT-5)
- [ ] Draft auto-save (optional for MVP)
- [ ] Validation and error handling
- [ ] Success confirmation

---

### Day 5: Email Actions & Polish

#### Actions to Implement
```swift
// In EmailInboxView.swift - swipe actions already exist, connect to real APIs

func deleteEmail(_ email: Email) async {
    do {
        try await apiClient.request(.emailDelete(id: email.id))
        // Remove from list
    } catch {
        // Show error
    }
}

func archiveEmail(_ email: Email) async {
    do {
        try await apiClient.request(.emailArchive(id: email.id))
        // Remove from list
    } catch {
        // Show error
    }
}

func toggleRead(_ email: Email) async {
    do {
        try await apiClient.request(.emailMarkRead(id: email.id), body: ["read": !email.isRead])
        // Update in list
    } catch {
        // Show error
    }
}
```

**Checklist**:
- [ ] Delete email action
- [ ] Archive email action
- [ ] Mark read/unread
- [ ] Star/unstar
- [ ] Batch actions (select multiple)
- [ ] Pull-to-refresh
- [ ] Optimistic UI updates
- [ ] Error recovery

---

## 📋 Week 7: Calendar & Tasks

### Day 1-2: Calendar Grid Views

#### Month/Week/Day Views
```swift
// TideApp/Features/Calendar/CalendarGridView.swift (already exists, complete it)

struct CalendarGridView: View {
    @EnvironmentObject var container: DependencyContainer
    @StateObject private var viewModel: CalendarGridViewModel
    @State private var selectedView: CalendarViewType = .month

    enum CalendarViewType {
        case month, week, day
    }

    init(container: DependencyContainer) {
        _viewModel = StateObject(wrappedValue: container.makeCalendarGridViewModel())
    }

    var body: some View {
        VStack(spacing: 0) {
            // View Picker
            Picker("View", selection: $selectedView) {
                Text("Month").tag(CalendarViewType.month)
                Text("Week").tag(CalendarViewType.week)
                Text("Day").tag(CalendarViewType.day)
            }
            .pickerStyle(.segmented)
            .padding()

            // Current view
            Group {
                switch selectedView {
                case .month:
                    MonthView(viewModel: viewModel)
                case .week:
                    WeekView(viewModel: viewModel)
                case .day:
                    DayView(viewModel: viewModel)
                }
            }
        }
        .navigationTitle(viewModel.currentMonth.formatted(.dateTime.month().year()))
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button("Today") {
                    viewModel.jumpToToday()
                }
            }

            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: { viewModel.showEventCreate = true }) {
                    Image(systemName: "plus")
                }
            }
        }
        .sheet(isPresented: $viewModel.showEventCreate) {
            EventEditView(mode: .create, container: container)
        }
        .task {
            await viewModel.loadEvents()
        }
    }
}

struct MonthView: View {
    @ObservedObject var viewModel: CalendarGridViewModel

    var body: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 7), spacing: 1) {
            // Day headers
            ForEach(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], id: \.self) { day in
                Text(day)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            // Calendar days
            ForEach(viewModel.monthDays, id: \.date) { day in
                DayCell(
                    day: day,
                    events: viewModel.events(for: day.date),
                    isToday: day.isToday,
                    isCurrentMonth: day.isCurrentMonth
                )
                .onTapGesture {
                    viewModel.selectedDate = day.date
                }
            }
        }
        .padding()
    }
}

struct DayCell: View {
    let day: CalendarDay
    let events: [CalendarEvent]
    let isToday: Bool
    let isCurrentMonth: Bool

    var body: some View {
        VStack(spacing: 2) {
            Text("\(Calendar.current.component(.day, from: day.date))")
                .font(.caption)
                .fontWeight(isToday ? .bold : .regular)
                .foregroundColor(isToday ? .white : (isCurrentMonth ? .primary : .secondary))
                .frame(width: 24, height: 24)
                .background(isToday ? Color.blue : Color.clear)
                .clipShape(Circle())

            // Event indicators (dots)
            HStack(spacing: 2) {
                ForEach(events.prefix(3)) { event in
                    Circle()
                        .fill(Color(event.color))
                        .frame(width: 4, height: 4)
                }
            }
        }
        .frame(height: 60)
        .frame(maxWidth: .infinity)
        .background(day.isSelected ? Color.blue.opacity(0.1) : Color.clear)
        .cornerRadius(4)
    }
}
```

**Checklist**:
- [ ] Month grid view with all days
- [ ] Week view (7 days, hourly slots)
- [ ] Day view (single day, detailed)
- [ ] Event indicators in grid
- [ ] Navigation (prev/next month)
- [ ] Jump to today
- [ ] Event tap to details
- [ ] Create event button
- [ ] Real API integration
- [ ] Loading states

---

### Day 3: Event CRUD

#### Event Edit View
```swift
struct EventEditView: View {
    enum Mode {
        case create
        case edit(CalendarEvent)
    }

    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var container: DependencyContainer
    @StateObject private var viewModel: EventEditViewModel

    init(mode: Mode, container: DependencyContainer) {
        _viewModel = StateObject(wrappedValue: container.makeEventEditViewModel(mode: mode))
    }

    var body: some View {
        NavigationView {
            Form {
                Section {
                    TextField("Title", text: $viewModel.title)

                    Toggle("All Day", isOn: $viewModel.isAllDay)

                    DatePicker("Starts", selection: $viewModel.startDate)

                    if !viewModel.isAllDay {
                        DatePicker("Ends", selection: $viewModel.endDate)
                    }
                }

                Section {
                    TextField("Location (optional)", text: $viewModel.location)

                    NavigationLink("Add Attendees") {
                        AttendeeSelectionView(selected: $viewModel.attendees)
                    }
                }

                Section {
                    TextEditor(text: $viewModel.description)
                        .frame(minHeight: 100)
                } header: {
                    Text("Description")
                }

                // Conflict warning
                if let conflicts = viewModel.conflicts, !conflicts.isEmpty {
                    Section {
                        ForEach(conflicts) { conflict in
                            ConflictWarningRow(conflict: conflict)
                        }
                    } header: {
                        Label("Schedule Conflicts", systemImage: "exclamationmark.triangle")
                            .foregroundColor(.orange)
                    }
                }
            }
            .navigationTitle(viewModel.isEditMode ? "Edit Event" : "New Event")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        Task {
                            await viewModel.save()
                            if viewModel.saveSuccess {
                                dismiss()
                            }
                        }
                    }
                    .disabled(!viewModel.canSave)
                }

                if viewModel.isEditMode {
                    ToolbarItem(placement: .bottomBar) {
                        Button(role: .destructive, action: {
                            Task {
                                await viewModel.delete()
                                if viewModel.deleteSuccess {
                                    dismiss()
                                }
                            }
                        }) {
                            Label("Delete Event", systemImage: "trash")
                        }
                    }
                }
            }
            .task {
                await viewModel.checkConflicts()
            }
        }
    }
}
```

**Checklist**:
- [ ] Event creation form
- [ ] Event editing
- [ ] Date/time pickers
- [ ] All-day event toggle
- [ ] Location field
- [ ] Attendee selection
- [ ] Description field
- [ ] Conflict detection
- [ ] Save/delete actions
- [ ] Real API integration

---

### Day 4-5: Tasks

#### Task List View
```swift
struct TaskListView: View {
    @EnvironmentObject var container: DependencyContainer
    @StateObject private var viewModel: TaskListViewModel
    @State private var filterStatus: TaskStatus?

    init(container: DependencyContainer) {
        _viewModel = StateObject(wrappedValue: container.makeTaskListViewModel())
    }

    var body: some View {
        VStack(spacing: 0) {
            // Filter picker
            Picker("Status", selection: $filterStatus) {
                Text("All").tag(TaskStatus?.none)
                Text("To Do").tag(TaskStatus?.some(.pending))
                Text("In Progress").tag(TaskStatus?.some(.inProgress))
                Text("Completed").tag(TaskStatus?.some(.completed))
            }
            .pickerStyle(.segmented)
            .padding()

            List {
                ForEach(viewModel.filteredTasks(status: filterStatus)) { task in
                    TaskRow(task: task) {
                        Task { await viewModel.toggleStatus(task) }
                    }
                    .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                        Button(role: .destructive) {
                            Task { await viewModel.delete(task) }
                        } label: {
                            Label("Delete", systemImage: "trash")
                        }
                    }
                    .onTapGesture {
                        viewModel.selectedTask = task
                    }
                }
            }
            .listStyle(.plain)
            .refreshable {
                await viewModel.load()
            }
        }
        .navigationTitle("Tasks")
        .toolbar {
            Button(action: { viewModel.showCreateTask = true }) {
                Image(systemName: "plus")
            }
        }
        .sheet(isPresented: $viewModel.showCreateTask) {
            TaskEditView(mode: .create, container: container)
        }
        .sheet(item: $viewModel.selectedTask) { task in
            TaskDetailView(task: task, container: container)
        }
        .task {
            await viewModel.load()
        }
    }
}

struct TaskRow: View {
    let task: Task
    let onToggle: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            // Checkbox
            Button(action: onToggle) {
                Image(systemName: task.status == .completed ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(task.status == .completed ? .green : .gray)
                    .font(.title3)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(task.title)
                    .strikethrough(task.status == .completed)
                    .foregroundColor(task.status == .completed ? .secondary : .primary)

                HStack {
                    // Priority badge
                    PriorityBadge(priority: task.priority)

                    // Due date
                    if let dueDate = task.dueDate {
                        Text(dueDate, style: .relative)
                            .font(.caption)
                            .foregroundColor(task.isOverdue ? .red : .secondary)
                    }
                }
            }

            Spacer()
        }
        .padding(.vertical, 4)
    }
}
```

**Checklist**:
- [ ] Task list view
- [ ] Filter by status
- [ ] Task row with checkbox
- [ ] Priority indicators
- [ ] Due date display
- [ ] Create task
- [ ] Edit task
- [ ] Delete task
- [ ] Toggle complete
- [ ] Real API integration

---

## 📋 Week 8: Navigation & Auth

### Day 1-2: Tab Bar Navigation

#### Root Navigation Structure
```swift
// TideApp/Presentation/RootView.swift

struct RootView: View {
    @EnvironmentObject var container: DependencyContainer
    @State private var selectedTab = 0

    var body: some View {
        if container.authManager.isAuthenticated {
            TabView(selection: $selectedTab) {
                // Chat
                NavigationView {
                    ChatView(container: container)
                }
                .tabItem {
                    Label("Chat", systemImage: "bubble.left.and.bubble.right.fill")
                }
                .tag(0)

                // Email
                NavigationView {
                    EmailInboxView(container: container)
                }
                .tabItem {
                    Label("Email", systemImage: "envelope.fill")
                }
                .tag(1)

                // Calendar
                NavigationView {
                    CalendarGridView(container: container)
                }
                .tabItem {
                    Label("Calendar", systemImage: "calendar")
                }
                .tag(2)

                // Tasks
                NavigationView {
                    TaskListView(container: container)
                }
                .tabItem {
                    Label("Tasks", systemImage: "checklist")
                }
                .tag(3)

                // Settings
                NavigationView {
                    SettingsView(container: container)
                }
                .tabItem {
                    Label("More", systemImage: "ellipsis")
                }
                .tag(4)
            }
        } else {
            LoginView(container: container)
        }
    }
}
```

**Checklist**:
- [ ] TabView with 5 tabs
- [ ] Tab icons and labels
- [ ] NavigationView wrappers
- [ ] Auth state check
- [ ] Tab bar styling
- [ ] Deep linking support (optional)

---

### Day 3-4: Authentication

#### Login Screen
```swift
struct LoginView: View {
    @EnvironmentObject var container: DependencyContainer
    @StateObject private var viewModel: LoginViewModel

    init(container: DependencyContainer) {
        _viewModel = StateObject(wrappedValue: container.makeLoginViewModel())
    }

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            // Logo
            Image(systemName: "water.waves")
                .font(.system(size: 80))
                .foregroundColor(.blue)

            Text("Tide")
                .font(.largeTitle)
                .fontWeight(.bold)

            Text("Your AI Chief of Staff")
                .font(.title3)
                .foregroundColor(.secondary)

            Spacer()

            // Login buttons
            VStack(spacing: 16) {
                Button(action: {
                    Task { await viewModel.signInWithGoogle() }
                }) {
                    HStack {
                        Image(systemName: "g.circle.fill")
                        Text("Sign in with Google")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.white)
                    .foregroundColor(.black)
                    .cornerRadius(12)
                    .shadow(radius: 2)
                }

                Button(action: {
                    Task { await viewModel.signInWithMicrosoft() }
                }) {
                    HStack {
                        Image(systemName: "microsoft.logo")
                        Text("Sign in with Microsoft")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }
            }
            .padding(.horizontal, 32)

            Spacer()

            // Privacy & Terms
            HStack {
                Button("Privacy Policy") { }
                Text("•")
                Button("Terms of Service") { }
            }
            .font(.caption)
            .foregroundColor(.secondary)
            .padding(.bottom, 32)
        }
        .disabled(viewModel.isLoading)
        .overlay {
            if viewModel.isLoading {
                ProgressView()
                    .scaleEffect(1.5)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color.black.opacity(0.2))
            }
        }
        .alert("Error", isPresented: .constant(viewModel.error != nil)) {
            Button("OK") { viewModel.error = nil }
        } message: {
            if let error = viewModel.error {
                Text(error.localizedDescription)
            }
        }
    }
}
```

**Checklist**:
- [ ] Login screen UI
- [ ] Google OAuth integration
- [ ] Microsoft OAuth (optional)
- [ ] OAuth callback handling
- [ ] Token storage in Keychain
- [ ] Error handling
- [ ] Loading states

---

### Day 5: Settings

#### Settings View
```swift
struct SettingsView: View {
    @EnvironmentObject var container: DependencyContainer
    @StateObject private var viewModel: SettingsViewModel

    init(container: DependencyContainer) {
        _viewModel = StateObject(wrappedValue: container.makeSettingsViewModel())
    }

    var body: some View {
        List {
            // Account
            Section("Account") {
                if let user = viewModel.currentUser {
                    HStack {
                        AsyncImage(url: user.avatarURL) { image in
                            image.resizable()
                        } placeholder: {
                            Circle().fill(Color.gray.opacity(0.3))
                        }
                        .frame(width: 50, height: 50)
                        .clipShape(Circle())

                        VStack(alignment: .leading) {
                            Text(user.name)
                                .font(.headline)
                            Text(user.email)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
            }

            // Connected Accounts
            Section("Connected Accounts") {
                ForEach(viewModel.connectedAccounts) { account in
                    HStack {
                        Image(systemName: account.provider.iconName)
                        Text(account.email)
                        Spacer()
                        Button("Disconnect") {
                            Task { await viewModel.disconnect(account) }
                        }
                        .font(.caption)
                    }
                }

                Button("Connect Gmail") {
                    Task { await viewModel.connectGmail() }
                }

                Button("Connect Google Calendar") {
                    Task { await viewModel.connectGoogleCalendar() }
                }
            }

            // App
            Section("App") {
                NavigationLink("Notifications") {
                    NotificationSettingsView()
                }

                Button("Clear Cache") {
                    viewModel.clearCache()
                }
            }

            // About
            Section("About") {
                HStack {
                    Text("Version")
                    Spacer()
                    Text(viewModel.appVersion)
                        .foregroundColor(.secondary)
                }

                Button("Privacy Policy") { }
                Button("Terms of Service") { }
                Button("Contact Support") { }
            }

            // Logout
            Section {
                Button(role: .destructive, action: {
                    Task { await viewModel.logout() }
                }) {
                    Text("Logout")
                        .frame(maxWidth: .infinity)
                }
            }
        }
        .navigationTitle("Settings")
    }
}
```

**Checklist**:
- [ ] Settings screen layout
- [ ] User profile display
- [ ] Connected accounts list
- [ ] Connect/disconnect Gmail
- [ ] Connect/disconnect Calendar
- [ ] Notification settings (basic)
- [ ] Clear cache
- [ ] App version
- [ ] Privacy/Terms links
- [ ] Logout functionality

---

## 📊 Success Metrics

### Feature Completeness
- [ ] All MVP features from `MVP_FEATURE_LIST.md` implemented
- [ ] Zero mock data in production code
- [ ] All API endpoints connected
- [ ] All user flows work end-to-end

### User Experience
- [ ] All screens have loading states
- [ ] All screens have error states
- [ ] All screens have empty states
- [ ] Navigation is smooth and intuitive
- [ ] Forms have validation

### Quality
- [ ] No crashes
- [ ] No force unwraps
- [ ] Proper error messages
- [ ] Optimistic UI updates
- [ ] Pull-to-refresh works

---

## 📅 Timeline Summary

### Week 6: Email
- Day 1-2: Email detail & thread
- Day 3-4: Email compose
- Day 5: Email actions

### Week 7: Calendar & Tasks
- Day 1-2: Calendar views
- Day 3: Event CRUD
- Day 4-5: Tasks

### Week 8: Navigation & Auth
- Day 1-2: Tab bar
- Day 3-4: Authentication
- Day 5: Settings

---

**With GPT-5 integration, these features become 10x smarter. Users can say "schedule a meeting" and Tide handles it intelligently.** 🚀
