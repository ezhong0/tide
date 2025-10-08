# Tide 1.0 MVP Features

**Philosophy**: Do less, do it perfectly
**Scope**: Essential CRUD only - Intelligence features deferred to 1.5+

---

## Feature Breakdown

### ✅ In Scope for 1.0

#### 1. Chat & AI (Basic) - P0

**Goal**: Talk to your AI assistant about your data

**Features**:
- Chat interface with message history
- Send text messages to AI
- AI responds using GPT-5 tools
- Conversation list (view past chats)
- Create new conversation
- Delete conversation

**Out of Scope**:
- Voice input
- Image attachments
- File uploads
- Conversation search
- Conversation sharing

**User Story**:
> "As a user, I want to ask my AI assistant questions about my emails, calendar, and tasks, so I can get quick answers without switching apps."

**Acceptance Criteria**:
- Can send a message and receive response in < 3s
- Can view conversation history
- Can start new conversations
- GPT-5 tools execute correctly (uses backend)

---

#### 2. Email Management - P0

**Goal**: Read and send emails

**Features**:
- **Inbox View**:
  - List emails with sender, subject, preview
  - Category tabs (Inbox, Sent, Important, Unread)
  - Pull to refresh
  - Search emails
  - Swipe actions (archive, delete, star)

- **Email Detail View**:
  - Full email content
  - Sender info and avatar
  - Thread view (if conversation)
  - Reply button
  - Forward button
  - Archive/Delete/Star actions

- **Email Compose**:
  - New email
  - Reply to email
  - Forward email
  - To, CC, Subject, Body
  - Send email
  - Discard draft (confirmation)

**Out of Scope**:
- Multi-draft AI composition UI
- Email templates
- Email scheduling
- Attachments
- Rich text formatting
- Signatures
- VIP badges/UI
- Auto-categorization UI
- Email rules/filters

**User Story**:
> "As a user, I want to read and reply to emails in the app, so I don't need to switch to Gmail."

**Acceptance Criteria**:
- Can view all emails from Gmail
- Can read full email thread
- Can compose and send new emails
- Can reply to and forward emails
- All actions work offline (queued)

---

#### 3. Calendar Management - P0

**Goal**: View and create events

**Features**:
- **Calendar Grid View**:
  - Month view (grid with event dots)
  - Week view (7-day horizontal scroll)
  - Day view (hourly slots)
  - Today button (jump to current date)
  - Navigate months/weeks

- **Event List View**:
  - Upcoming events list
  - Grouped by day
  - Time and title visible

- **Event Detail**:
  - Event title, time, location
  - Description
  - Attendees list
  - Edit button
  - Delete button
  - Join meeting link (if video call)

- **Event Create/Edit**:
  - Title (required)
  - Start date/time
  - End date/time
  - All-day toggle
  - Location (optional)
  - Description (optional)
  - Save/Cancel buttons

**Out of Scope**:
- Meeting briefs
- Meeting preparation
- Attendee insights
- Calendar optimization
- Conflict auto-resolution
- Smart scheduling
- Recurring events (complex)
- Multiple calendars
- Calendar sharing

**User Story**:
> "As a user, I want to see my calendar and create events, so I can manage my schedule in one place."

**Acceptance Criteria**:
- Can view calendar in month/week/day views
- Can see all events from Google Calendar
- Can create new events
- Can edit and delete events
- Events sync with Google Calendar

---

#### 4. Task Management - P0

**Goal**: Track tasks

**Features**:
- **Task List**:
  - All tasks list
  - Filter by status (To Do, In Progress, Done)
  - Filter by priority (High, Medium, Low)
  - Checkbox to mark complete
  - Swipe to delete

- **Task Detail**:
  - Task title
  - Description
  - Priority badge
  - Due date (if set)
  - Status indicator
  - Edit/Delete buttons

- **Task Create/Edit**:
  - Title (required)
  - Description (optional)
  - Priority picker
  - Due date picker (optional)
  - Status picker
  - Save/Cancel buttons

**Out of Scope**:
- Task auto-decomposition
- Smart prioritization UI
- Subtasks
- Task templates
- Recurring tasks
- Task assignments
- Task dependencies
- Project grouping

**User Story**:
> "As a user, I want to create and track tasks, so I can remember what I need to do."

**Acceptance Criteria**:
- Can view all tasks
- Can create new tasks
- Can mark tasks as complete
- Can edit and delete tasks
- Tasks persist

---

#### 5. Authentication - P1

**Goal**: Sign in with Google

**Features**:
- **Login Screen**:
  - "Sign in with Google" button
  - Tide logo and tagline
  - Privacy policy link
  - Terms of service link

- **Onboarding**:
  - Welcome screen
  - Connect Gmail (OAuth)
  - Connect Google Calendar (OAuth)
  - Permissions explanation
  - Skip button (for later setup)

- **Token Management**:
  - Store access/refresh tokens securely (Keychain)
  - Auto-refresh expired tokens
  - Handle token errors gracefully

**Out of Scope**:
- Microsoft/Outlook OAuth
- Email/password authentication
- Social login (Apple, Facebook, etc.)
- Multi-account support
- 2FA

**User Story**:
> "As a user, I want to sign in with my Google account, so I can access my Gmail and Calendar."

**Acceptance Criteria**:
- Can sign in with Google OAuth
- Tokens stored securely
- Tokens refresh automatically
- Can logout

---

#### 6. Settings - P1

**Goal**: Manage app preferences

**Features**:
- **Account Section**:
  - User profile (name, email, avatar)
  - Connected accounts list
  - Disconnect account button
  - Logout button

- **App Section**:
  - App version number
  - Privacy policy link
  - Terms of service link
  - Contact support link

**Out of Scope**:
- Notification preferences
- Appearance settings (dark mode)
- Language settings
- Data export
- Account deletion

**User Story**:
> "As a user, I want to see my connected accounts and logout, so I can manage my account."

**Acceptance Criteria**:
- Can see connected Google account
- Can disconnect account
- Can logout
- Can view app version

---

#### 7. Navigation - P0

**Goal**: Navigate between features

**Features**:
- **Tab Bar**:
  - 5 tabs: Chat, Email, Calendar, Tasks, Settings
  - Icons and labels
  - Active tab indicator

- **Navigation Stack**:
  - Push/pop for detail views
  - Back button
  - Navigation bar titles

**Out of Scope**:
- Deep linking
- Universal links
- Search across features
- Global command palette

**User Story**:
> "As a user, I want to easily switch between chat, email, calendar, and tasks."

**Acceptance Criteria**:
- All 5 tabs accessible
- Navigation is smooth
- Back button works correctly

---

### ❌ Out of Scope for 1.0 (Defer to 1.5+)

#### Intelligence Features (Backend Complete, UI Deferred)

**Why Deferred**: These require the core CRUD to work first. Users need to read/send emails before AI can automate them.

1. **Dashboard Intelligence**
   - Daily snapshot aggregation
   - Priority item ranking
   - Time saved estimates
   - Predictions
   - "Tide Suggests" feature

2. **Email Intelligence**
   - Multi-draft composition UI
   - Relationship intelligence UI
   - VIP detection badges
   - Automated email actions UI
   - Smart compose with tone matching
   - Email triage automation UI

3. **Calendar Intelligence**
   - Meeting briefs UI
   - Meeting preparation UI
   - Attendee insights
   - Calendar optimization suggestions
   - Conflict auto-resolution UI
   - Smart scheduling wizard

4. **Task Intelligence**
   - Task auto-decomposition UI
   - AI task prioritization
   - Dependency detection
   - Smart due date suggestions

5. **Decision Queue**
   - Decision management UI
   - AI decision recommendations
   - Decision history

6. **Action Queue**
   - Action suggestions UI
   - Auto-execution controls
   - Action history

7. **Analytics & Insights**
   - Email trends
   - Meeting load analysis
   - Productivity scores
   - Workload tracking
   - Burnout detection

---

#### Advanced Features (Not Even Planned)

**Why Deferred**: Way beyond MVP scope.

1. **Workflow Automation**
   - Workflow builder
   - Automation templates
   - Pattern detection

2. **Platform Features**
   - Apple Watch app
   - Widgets
   - Shortcuts integration
   - Siri integration
   - Dynamic Island
   - Android app

3. **Enterprise Features**
   - Team workflows
   - Delegation
   - Approval flows
   - Team analytics
   - Admin dashboard

4. **Advanced Integration**
   - Slack integration
   - Microsoft Teams
   - Notion sync
   - Linear integration

---

## Feature Comparison: 1.0 vs 1.5 vs 2.0

| Feature | 1.0 MVP | 1.5 Intelligence | 2.0 Advanced |
|---------|---------|------------------|--------------|
| **Chat** | Basic Q&A | Context-aware | Multi-modal |
| **Email** | Read/Send | AI triage | Automation |
| **Calendar** | View/Create | Meeting prep | Optimization |
| **Tasks** | CRUD | Prioritization | Workflows |
| **Auth** | Google OAuth | Multi-account | Enterprise SSO |
| **Settings** | Basic | Preferences | Admin panel |
| **Intelligence** | ❌ | ✅ Dashboard | ✅ Full |
| **Platform** | iOS only | iOS + iPad | iOS + Watch + Android |

---

## Success Metrics for 1.0

### Functional Metrics
- ✅ 100% of core features work end-to-end
- ✅ All user flows complete without errors
- ✅ 0 P0/P1 bugs

### Quality Metrics
- ✅ 60%+ test coverage
- ✅ 0 force unwraps in production code
- ✅ 0 fatalError() calls
- ✅ SwiftLint passing

### Performance Metrics
- ✅ App launch < 1 second
- ✅ API response time P95 < 500ms
- ✅ 60fps UI animations
- ✅ Offline support working

### User Metrics (Beta)
- ✅ 20+ daily active users
- ✅ 90%+ positive feedback on UX
- ✅ Users save measurable time

---

## User Flows (End-to-End)

### Flow 1: First-Time User
1. Open app → Login screen
2. Tap "Sign in with Google"
3. Complete OAuth flow
4. See onboarding: "Connect Gmail"
5. Grant Gmail permissions
6. See onboarding: "Connect Calendar"
7. Grant Calendar permissions
8. Land on Chat screen
9. See welcome message
10. Type "Show me my emails"
11. AI lists recent emails
12. Tap email → Email detail view
13. Tap Reply → Compose screen
14. Write reply, tap Send
15. Email sent successfully

**Success Criteria**: User goes from install to sending an email in < 3 minutes.

---

### Flow 2: Daily Usage
1. Open app → Chat screen (last used)
2. Ask "What's on my calendar today?"
3. AI shows today's events
4. Tap Calendar tab
5. See month view with today's events
6. Tap event → Event detail
7. Tap "Join Meeting" → Opens Zoom/Meet
8. Return to app → Tap Tasks tab
9. See task list
10. Check off completed task
11. Create new task
12. Task saved

**Success Criteria**: User completes common tasks in < 1 minute each.

---

### Flow 3: Offline Usage
1. Turn off WiFi/cellular
2. Open app → Works (cached data)
3. Read email → Works (cached)
4. Compose reply → Queued
5. Create task → Saved locally
6. Turn on network
7. Queued actions execute automatically
8. Everything syncs

**Success Criteria**: App is fully functional offline for reading, partial for writing.

---

## Acceptance Test Scenarios

### Email
- [ ] Can view inbox with 100+ emails
- [ ] Can open email and read full content
- [ ] Can view email thread (3+ messages)
- [ ] Can compose new email
- [ ] Can reply to email
- [ ] Can forward email
- [ ] Can send email successfully
- [ ] Can archive email
- [ ] Can delete email
- [ ] Can star/unstar email
- [ ] Can search emails

### Calendar
- [ ] Can view month grid
- [ ] Can navigate to next/prev month
- [ ] Can see today's events
- [ ] Can view event detail
- [ ] Can create new event
- [ ] Can edit event
- [ ] Can delete event
- [ ] Events sync with Google Calendar
- [ ] Can switch to week view
- [ ] Can switch to day view

### Tasks
- [ ] Can view all tasks
- [ ] Can filter by status
- [ ] Can filter by priority
- [ ] Can create new task
- [ ] Can edit task
- [ ] Can delete task
- [ ] Can mark task complete
- [ ] Can mark task incomplete
- [ ] Tasks persist after app restart

### Chat
- [ ] Can send message to AI
- [ ] Receives response in < 3s
- [ ] Can ask about emails
- [ ] Can ask about calendar
- [ ] Can ask about tasks
- [ ] Can view conversation history
- [ ] Can create new conversation
- [ ] Can delete conversation

### Auth
- [ ] Can sign in with Google
- [ ] OAuth flow completes
- [ ] Tokens stored securely
- [ ] Can logout
- [ ] Session persists across app restarts
- [ ] Token refresh works

---

## Dependencies

### Backend Services Required
1. ✅ AI Service with GPT-5 tools
2. ✅ Email Service with Gmail integration
3. ✅ Calendar Service with Google Calendar integration
4. ✅ Workflow Service for tasks
5. ✅ Gateway Service for routing

### Backend Endpoints Required

**Chat** (AI Service):
- POST `/api/ai/chat` - Send message
- GET `/api/ai/conversations` - List conversations
- GET `/api/ai/conversations/:id/messages` - Get messages
- DELETE `/api/ai/conversations/:id` - Delete conversation

**Email** (Email Service):
- GET `/api/email/messages?category=inbox` - List emails
- GET `/api/email/messages/:id` - Get email detail
- POST `/api/email/send` - Send email
- POST `/api/email/:id/archive` - Archive email
- DELETE `/api/email/:id` - Delete email
- POST `/api/email/:id/star` - Star email
- GET `/api/email/search?q=:query` - Search emails

**Calendar** (Calendar Service):
- GET `/api/calendar/events?start=:date&end=:date` - List events
- GET `/api/calendar/events/:id` - Get event detail
- POST `/api/calendar/events` - Create event
- PUT `/api/calendar/events/:id` - Update event
- DELETE `/api/calendar/events/:id` - Delete event

**Tasks** (Workflow Service):
- GET `/api/tasks?status=:status` - List tasks
- GET `/api/tasks/:id` - Get task detail
- POST `/api/tasks` - Create task
- PUT `/api/tasks/:id` - Update task
- DELETE `/api/tasks/:id` - Delete task

**Auth** (Gateway/Supabase):
- POST `/api/auth/google` - Google OAuth callback
- POST `/api/auth/refresh` - Refresh token
- POST `/api/auth/logout` - Logout
- GET `/api/auth/me` - Get current user

---

## Technical Requirements

### iOS App
- iOS 16.0+
- SwiftUI
- Swift 5.9+
- Xcode 15+

### Backend
- Node.js 20+
- TypeScript 5+
- PostgreSQL (Supabase)
- GPT-5 API access

### Infrastructure
- Railway (backend hosting)
- Supabase (database + auth)
- TestFlight (beta distribution)

---

## What Makes This MVP?

**It's truly minimal**:
- No intelligence features UI (backend ready for 1.5)
- No advanced AI (multi-draft, VIP, etc.)
- No analytics or insights
- No workflow automation UI
- No platform expansion

**It's viable**:
- Users can chat with AI about their data
- Users can read and send emails
- Users can view and create calendar events
- Users can manage tasks
- Everything works offline

**It's a product**:
- Clean, polished UI
- Fast and responsive
- Reliable and tested
- Secure OAuth
- Production-ready

---

**1.0 is the foundation. 1.5 adds the intelligence. 2.0 makes it magical.**

*Last Updated: October 8, 2025*
