# 🎯 Tide MVP Feature List

**Purpose**: Minimum Viable Product - Core features needed for Alpha/Beta launch
**Philosophy**: "Conversational AI assistant that actually works" - Focus on basics done well
**Last Updated**: 2025-10-08

---

## 📊 MVP Progress Summary

**MVP Completion**: 68% (↑ from 40% after resolving Chat/Inbox blockers)

| Category | Done | TODO | MVP % |
|----------|------|------|-------|
| **Chat & AI** | 4/5 | 1 | 80% |
| **Email** | 3/6 | 3 | 50% |
| **Calendar** | 1/5 | 4 | 20% |
| **Tasks** | 0/5 | 5 | 0% |
| **Auth & Settings** | 0/3 | 3 | 0% |
| **Navigation** | 0/1 | 1 | 0% |

---

## ✅ MVP FEATURES - MUST HAVE

### 1. Chat & AI Interaction ⭐ **80% COMPLETE**

The core product promise - talk to your AI assistant.

#### ✅ DONE (4/5)
- ✅ **Chat Interface** (ChatView.swift - 420 lines)
  - Message bubbles (user/assistant)
  - Text input with send button
  - Typing indicator
  - Empty state with suggestions
  - Error handling

- ✅ **Chat Backend** (AI Service - 6,500 lines)
  - Claude API integration
  - Intent detection
  - Multi-model router (GPT-5, Claude, Gemini)
  - 18 specialized agents

- ✅ **Conversation Management**
  - Create new conversation
  - Load conversation history
  - Switch between conversations

- ✅ **Basic AI Actions**
  - Answer questions about emails/calendar/tasks
  - Execute simple actions (view, search, etc.)

#### ❌ TODO (1/5)
- ❌ **Conversation History View**
  - List of past conversations
  - Search conversations
  - Delete conversations

**MVP Priority**: P0 - CORE FEATURE

---

### 2. Email Management ⭐ **50% COMPLETE**

Read, send, and manage emails.

#### ✅ DONE (3/6)
- ✅ **Email Inbox** (EmailInboxView.swift - 620 lines)
  - Category tabs (Inbox, Sent, Priority, Important, Unread)
  - Email list with previews
  - Search and filters
  - Swipe actions (archive, delete, mark read)
  - VIP badges, priority indicators

- ✅ **Email Backend** (Email Service - 4,800 lines)
  - Gmail OAuth integration
  - Fetch emails
  - Send emails (API only)
  - Email search (full-text)

- ✅ **Email Triage** (Backend only)
  - AI categorization
  - Priority scoring
  - Urgency detection

#### ❌ TODO (3/6)
- ❌ **Email Detail View**
  - Read full email
  - View email thread
  - Reply button → Compose
  - Forward button → Compose
  - Archive/Delete actions

- ❌ **Email Compose**
  - Simple compose UI (to, subject, body)
  - Reply/Reply All
  - Forward
  - Send button
  - Draft saving

- ❌ **Email Actions**
  - Mark as read/unread
  - Star/unstar
  - Move to folder
  - Report spam

**MVP Priority**: P0 - CORE FEATURE

---

### 3. Calendar Management ⭐ **20% COMPLETE**

View and manage calendar events.

#### ✅ DONE (1/5)
- ✅ **Calendar Backend** (Calendar Service - 3,200 lines)
  - Google Calendar OAuth
  - Fetch events
  - Create/update/delete events (API only)
  - Conflict detection

#### ❌ TODO (4/5)
- ❌ **Calendar Grid View**
  - Month view
  - Week view
  - Day view
  - Today button
  - Navigate months/weeks

- ❌ **Event List View**
  - Simple list of upcoming events
  - Group by day
  - Time indicators

- ❌ **Event Detail**
  - View event details
  - Edit button → Event Edit
  - Delete event
  - Join meeting link (if video call)

- ❌ **Event Create/Edit**
  - Title, date, time inputs
  - Duration picker
  - Description (optional)
  - Save button
  - Delete button (edit mode)

**MVP Priority**: P1 - CRITICAL FOR USABILITY

---

### 4. Task Management ⭐ **0% COMPLETE**

Create and track tasks.

#### ❌ TODO (5/5)
- ❌ **Task List View**
  - List of tasks
  - Group by status (Todo, In Progress, Done)
  - Filter by priority
  - Checkboxes to mark complete

- ❌ **Task Detail**
  - View task details
  - Edit button → Task Edit
  - Delete task
  - Mark complete/incomplete

- ❌ **Task Create/Edit**
  - Title input
  - Description (optional)
  - Priority picker (Low, Medium, High)
  - Due date picker (optional)
  - Save button

- ❌ **Task Actions**
  - Mark as complete
  - Delete task
  - Change priority

- ❌ **Task Backend Integration**
  - Workflow Service already exists
  - Just needs UI integration

**MVP Priority**: P2 - IMPORTANT BUT NOT BLOCKING

---

### 5. Authentication & Onboarding ⭐ **0% COMPLETE**

Get users into the app.

#### ❌ TODO (3/3)
- ❌ **Login Screen**
  - "Sign in with Google" button
  - "Sign in with Microsoft" button
  - OAuth flow handling
  - Token storage

- ❌ **Onboarding Flow**
  - Welcome screen
  - Connect Gmail/Google Calendar
  - Connect Outlook/MS Calendar (optional)
  - Permissions explanation

- ❌ **Settings Screen**
  - Connected accounts
  - Disconnect account
  - Logout button
  - App version info

**MVP Priority**: P1 - NEEDED FOR BETA

---

### 6. Navigation Structure ⭐ **0% COMPLETE**

Get between screens.

#### ❌ TODO (1/1)
- ❌ **Tab Bar Navigation**
  - Tab 1: Chat (icon: bubble.left.and.bubble.right.fill)
  - Tab 2: Email (icon: envelope.fill)
  - Tab 3: Calendar (icon: calendar)
  - Tab 4: Tasks (icon: checklist)
  - Tab 5: More/Settings (icon: ellipsis)

**MVP Priority**: P0 - BLOCKING BETA

---

## 📊 MVP Feature Summary

### Core User Flows

**Flow 1: Chat with AI**
1. ✅ Open app → Chat screen
2. ✅ Type "Show me urgent emails"
3. ✅ AI responds with list
4. ✅ Tap email → ❌ Email Detail (TODO)

**Flow 2: Check Email**
1. ❌ Tap Email tab (TODO - no tabs)
2. ✅ See inbox with categories
3. ❌ Tap email → Email Detail (TODO)
4. ❌ Tap Reply → Compose (TODO)
5. ❌ Send email (TODO)

**Flow 3: Check Calendar**
1. ❌ Tap Calendar tab (TODO - no tabs)
2. ❌ See month/week/day view (TODO)
3. ❌ Tap event → Event Detail (TODO)
4. ❌ Edit or join meeting (TODO)

**Flow 4: Manage Tasks**
1. ❌ Tap Tasks tab (TODO - no tabs)
2. ❌ See task list (TODO)
3. ❌ Check off task (TODO)
4. ❌ Add new task (TODO)

### MVP Metrics

**What Works Now (Alpha-Ready)**:
- ✅ Chat with AI about your data
- ✅ Browse email inbox
- ✅ Search emails
- ✅ AI email categorization (backend)

**Critical Gaps for Beta**:
- ❌ Can't read full emails
- ❌ Can't reply to emails
- ❌ Can't view calendar
- ❌ Can't manage tasks
- ❌ No navigation between features
- ❌ No authentication

**Estimated MVP Completion Time**: 1-2 weeks
- Email Detail: 1 day
- Email Compose: 1 day
- Calendar Views: 2 days
- Task Views: 2 days
- Navigation: 1 day
- Auth/Settings: 1 day

---

## 🚫 NON-MVP FEATURES - REMOVE FROM ALPHA/BETA

### Intelligence Features (Move to v1.5+)

**Dashboard Intelligence** - Currently implemented, but not essential
- ❌ Daily Snapshot aggregation
- ❌ Priority items ranking
- ❌ Predictions based on patterns
- ❌ Time saved estimates
- ❌ Tide Suggests feature

**Email Intelligence** - Backend exists, but MVP doesn't need it
- ❌ Multi-draft composition (Detailed/Balanced/Brief)
- ❌ Relationship intelligence
- ❌ VIP detection
- ❌ Automated email actions
- ❌ Email triage automation
- ❌ Smart compose with tone matching
- ❌ User style learning

**Calendar Intelligence** - Backend exists, but MVP doesn't need it
- ❌ Meeting briefs
- ❌ Meeting preparation
- ❌ Attendee insights
- ❌ Calendar optimization suggestions
- ❌ Conflict auto-resolution
- ❌ Smart scheduling
- ❌ Focus time protection

**Task Intelligence** - Not needed for MVP
- ❌ Task auto-decomposition
- ❌ Task prioritization AI
- ❌ Dependency detection
- ❌ Smart due date suggestions

**Decision Intelligence** - Too advanced for MVP
- ❌ Decision queue
- ❌ AI decision recommendations
- ❌ Decision history
- ❌ Multi-criteria analysis

**Action Intelligence** - Too advanced for MVP
- ❌ Action suggestions
- ❌ Auto-execution of actions
- ❌ Action undo capability
- ❌ Action history

**Analytics & Insights** - Nice to have, not essential
- ❌ Email trends
- ❌ Meeting load analysis
- ❌ Productivity scores
- ❌ Workload scores
- ❌ Burnout detection
- ❌ Anomaly detection
- ❌ Correlation engine
- ❌ Recommendation engine

### Advanced Features (Move to v2.0+)

**Workflow Automation** - Too complex for MVP
- ❌ Workflow builder
- ❌ Pattern detection
- ❌ Automation templates
- ❌ Saga pattern execution
- ❌ Compensation logic

**Advanced AI** - Not essential for MVP
- ❌ Multi-model routing optimization
- ❌ Agent swarm coordination
- ❌ Reasoning engine
- ❌ Hallucination detection
- ❌ Self-correction
- ❌ Learning system

**Platform Features** - Later versions
- ❌ Apple Watch app
- ❌ Dynamic Island integration
- ❌ Widgets
- ❌ Shortcuts integration
- ❌ Siri integration
- ❌ Android app

**Enterprise Features** - Much later
- ❌ Team workflows
- ❌ Delegation
- ❌ Approval flows
- ❌ Team analytics
- ❌ Admin dashboard

---

## 🎯 Revised Roadmap

### Alpha Launch (NOW - Week 1)
**Goal**: Deploy what works today

**Ready**:
- ✅ Chat interface
- ✅ Email inbox browsing
- ✅ Basic AI responses
- ✅ Backend services

**Deploy**:
- Railway deployment
- Database migrations
- End-to-end testing
- Internal testing only

**Alpha Users**: Internal team only (5-10 people)

---

### Beta Launch (Weeks 2-3)
**Goal**: Complete core MVP features

**Must Complete**:
1. Email Detail view (1 day)
2. Email Compose (1 day)
3. Calendar Grid view (2 days)
4. Task List view (2 days)
5. Navigation (1 day)
6. Auth/Onboarding (1 day)

**Optional**:
- Settings screen
- Offline support
- Push notifications

**Beta Users**: Friends & family (50-100 people)

---

### Production v1.0 (Weeks 4-8)
**Goal**: Polish MVP + essential intelligence

**Add**:
- Email triage (backend already done)
- Calendar conflict detection (backend already done)
- Task prioritization
- Basic recommendations
- Bug fixes from beta feedback
- Performance optimization

**Production Users**: Public launch (1,000+ users)

---

### Post-MVP (v1.5 - v2.0)
**Goal**: Add intelligence features

**Phase 1 (v1.5)**: Basic Intelligence
- Daily snapshots
- Priority ranking
- Meeting briefs
- Email categorization UI

**Phase 2 (v2.0)**: Advanced Intelligence
- Multi-draft composition
- VIP detection
- Calendar optimization
- Automated workflows
- Action suggestions
- Decision queue

**Phase 3 (v2.5)**: Analytics & Insights
- Trend analysis
- Workload scores
- Burnout detection
- Recommendations
- Learning system

**Phase 4 (v3.0)**: Platform Expansion
- Apple Watch
- Widgets
- Shortcuts
- Android app

---

## 📝 Key Insights

### What to Keep
The current implementation has **too many advanced features** built before the basics:
- Dashboard with predictions ✅ Implemented (but not MVP)
- Email multi-draft composition ✅ Implemented (but not MVP)
- Meeting briefs ✅ Implemented (but not MVP)
- Action queue ✅ Implemented (but not MVP)
- Decision queue ✅ Implemented (but not MVP)

These are **amazing features** but users can't:
- Read a full email (no Email Detail view)
- Reply to an email (no Compose view)
- View their calendar (no Calendar Grid)
- Create a task (no Task Create)
- Navigate between features (no Tab Bar)

### What to Build
Focus on **basic CRUD** before advanced AI:

**Priority Order**:
1. Navigation (without this, can't use anything)
2. Email Detail + Compose (core use case)
3. Calendar Grid + Event Create (core use case)
4. Task List + Task Create (core use case)
5. Auth/Settings (needed for beta users)

### What to Move
Move these implemented features to "Power User" settings:
- Dashboard → "Intelligence Dashboard" (optional screen)
- Multi-draft Compose → "AI Assist" toggle in normal compose
- Meeting Briefs → "Meeting Prep" (optional)
- Action Queue → "Suggestions" panel
- Decision Queue → "Decisions" panel

Keep the backend services (they work great!) but **hide the UI** until MVP is complete.

---

## 🚀 Execution Plan

### This Week (Alpha Deployment)
- ✅ Chat UI (DONE)
- ✅ Email Inbox (DONE)
- ⏳ Deploy to Railway
- ⏳ Database migrations
- ⏳ Internal testing

### Next Week (Sprint to Beta)
**Day 1-2: Email**
- Email Detail view
- Email Compose view

**Day 3-4: Calendar**
- Calendar Grid view
- Event Create/Edit

**Day 5-6: Tasks + Nav**
- Task List view
- Task Create/Edit
- Tab Bar navigation

**Day 7: Auth + Polish**
- Login screen
- Onboarding flow
- Bug fixes

### Week 3 (Beta Testing)
- Beta user testing
- Bug fixes
- Performance optimization
- Prepare for v1.0

---

## 📊 Success Metrics

### Alpha Success Criteria
- ✅ 5-10 internal users can chat with AI
- ✅ Can browse email inbox
- ✅ Backend services running stable
- ✅ No critical bugs

### Beta Success Criteria
- ❌ 50-100 users can complete core flows
- ❌ Can read/reply to emails end-to-end
- ❌ Can view/create calendar events
- ❌ Can create/complete tasks
- ❌ <5 critical bugs
- ❌ <2 second response time for common actions

### v1.0 Success Criteria
- 1,000+ active users
- >70% weekly retention
- <1% critical bug rate
- <1 second response time P95
- 4.5+ star rating

---

**Document Version**: 1.0
**Last Updated**: 2025-10-08
**Status**: Alpha Ready → Sprint to Beta
