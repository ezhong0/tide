# Phase 2: Core Features (Weeks 5-8)

**Status:** Starting Now
**Duration:** 4 weeks
**Goal:** Complete CRUD operations for Email, Calendar, and Tasks

---

## Phase 1 Review & Fixes Applied

### Issues Found During Review:
1. ❌ **CalendarGridViewModel was missing** - Tests referenced a ViewModel that didn't exist
2. ❌ **Week 3 Summary was inaccurate** - Claimed to remove mock data from CalendarGridViewModel, but it didn't exist
3. ✅ **TaskListViewModel existed** - Was embedded in TaskListView.swift (line 307-442)
4. ✅ **EmailInboxViewModel existed** - Was embedded in EmailInboxView.swift (line 415+)
5. ✅ **ChatViewModel existed** - In its own file as expected

### Fixes Applied (Pre-Phase 2):
1. ✅ Created `CalendarGridViewModel.swift` with full implementation
   - 42-day grid generation (6 weeks)
   - Month navigation (previous, next, goToToday)
   - Real API integration for events
   - Safe date operations
   - Events filtering by date

2. ✅ Updated `CalendarView.swift` to use `CalendarGridViewModel`
   - Removed mock data (`CalendarEvent.mockEvents`)
   - Added ViewModel integration
   - Added loading states
   - Added `.task` modifier to load events on appear

3. ✅ Verified `DependencyContainer` has all factory methods
   - `makeChatViewModel()` ✓
   - `makeEmailInboxViewModel()` ✓
   - `makeTaskListViewModel()` ✓
   - `makeCalendarViewModel()` ✓

### Current Test Coverage:
- **123 total tests** (81 new in Week 4 + 42 from Week 1)
- **~60% estimated coverage** (exceeds 40% target)
- **Major ViewModels:** ChatViewModel, CalendarGridViewModel, TaskListViewModel
- **Integration tests:** 17 tests covering end-to-end flows

---

## Phase 2 Objectives

Per ROADMAP.md, Phase 2 focuses on:

### Week 5: Email Features
- Email detail view with thread support
- Email compose (new, reply, forward)
- Send email functionality
- Email actions (archive, delete, star)
- **Milestone**: Can manage email end-to-end

### Week 6: Calendar Features
- Month/week/day grid views ← **Partially done (week view exists)**
- Event detail view
- Create/edit/delete events
- Conflict detection UI
- **Milestone**: Can manage calendar end-to-end

### Week 7: Tasks & Navigation
- Task list with filters ← **Already done**
- Create/edit/delete tasks ← **Partially done (edit/delete UI exist)**
- Mark tasks complete ← **Already done**
- Tab bar navigation ← **Need to verify**
- **Milestone**: All major features accessible

### Week 8: Polish & Refine
- Consistent UI/UX across features
- Loading states everywhere
- Error states everywhere
- Empty states everywhere
- **Milestone**: Feature-complete MVP

---

## Week 5 Execution Plan: Email Features

### Current State Assessment

**What Exists:**
- ✅ `EmailInboxView.swift` - Email list with categories
- ✅ `EmailInboxViewModel` - Loads emails from API
- ✅ `EmailDetailView.swift` - Email detail display
- ✅ `EmailComposeView.swift` - Email composition UI
- ✅ `EmailDraftSelectorView.swift` - Draft selection (advanced feature)
- ✅ `EmailViewModel` - Basic email operations

**What's Missing:**
- ❌ Email thread support (show conversation)
- ❌ Reply/Forward functionality
- ❌ Send email API integration
- ❌ Archive/Delete/Star actions with API calls
- ❌ Email search functionality
- ❌ Attachment support

### Day-by-Day Breakdown

#### Day 1: Email Detail + Thread Support
**Tasks:**
1. Read existing `EmailDetailView.swift`
2. Add thread/conversation support
   - Load all messages in thread
   - Display messages chronologically
   - Show participants
3. Add reply/forward buttons
4. Test email detail loading

**Deliverable:** Email detail shows full conversation

#### Day 2: Email Reply Implementation
**Tasks:**
1. Update `EmailComposeView` for reply mode
   - Pre-fill recipient
   - Quote original message
   - Set subject with "Re:"
2. Implement reply API call in `APIClient`
3. Connect reply flow from detail → compose → send
4. Test reply functionality

**Deliverable:** Can reply to emails

#### Day 3: Email Forward + Send
**Tasks:**
1. Update `EmailComposeView` for forward mode
   - Include original message
   - Set subject with "Fwd:"
2. Implement forward API call
3. Implement generic send email API call
4. Add error handling for send failures
5. Test all send modes (new, reply, forward)

**Deliverable:** Can forward and send new emails

#### Day 4: Email Actions
**Tasks:**
1. Implement archive action
   - API call to archive endpoint
   - Remove from inbox list
   - Show undo snackbar
2. Implement delete action
   - API call to delete endpoint
   - Remove from list
   - Show confirmation dialog
3. Implement star/unstar action
   - Toggle star state
   - Update UI immediately
4. Test all actions

**Deliverable:** All email actions work

#### Day 5: Email Polish
**Tasks:**
1. Add email search in `EmailInboxView`
   - Search by subject, sender, content
   - Update search results in real-time
2. Add loading states to all email operations
3. Add error states with retry
4. Add empty states for no emails
5. Write tests for email features
6. Create Week 5 summary

**Deliverable:** Polished email experience

---

## Week 6 Execution Plan: Calendar Features

### Current State Assessment

**What Exists:**
- ✅ `CalendarView.swift` - Week view with today's schedule
- ✅ `CalendarGridViewModel` - Calendar grid with 42 days ← **Just created**
- ✅ Week calendar component
- ✅ Event cards with details
- ✅ Mock event detail and edit views

**What's Missing:**
- ❌ Month grid view (use CalendarGridViewModel)
- ❌ Day agenda view
- ❌ Event create/edit with API integration
- ❌ Event delete functionality
- ❌ Conflict detection UI
- ❌ Calendar switching (multiple calendars)

### Day-by-Day Breakdown

#### Day 1: Month Grid View
**Tasks:**
1. Create `CalendarMonthView` using `CalendarGridViewModel`
   - Display 42-day grid (6 weeks)
   - Show current month header
   - Highlight today
   - Show event dots on days with events
2. Add month navigation buttons
3. Add "Today" button to jump to current date
4. Test month navigation

**Deliverable:** Month grid view working

#### Day 2: Day Agenda View
**Tasks:**
1. Create `CalendarDayView`
   - Show hourly timeline (e.g., 8am-8pm)
   - Display events as time blocks
   - Show event titles and durations
2. Add swipe gesture to navigate days
3. Connect day view from month tap
4. Test day view display

**Deliverable:** Day agenda view working

#### Day 3: Event Create/Edit
**Tasks:**
1. Update `EventEditView` (or create new)
   - Title, date/time pickers
   - Location, description fields
   - Calendar selection
2. Implement create event API call
3. Implement update event API call
4. Add validation (end after start, etc.)
5. Test create and edit flows

**Deliverable:** Can create and edit events

#### Day 4: Event Delete + Conflicts
**Tasks:**
1. Implement delete event API call
2. Add delete confirmation dialog
3. Implement conflict detection
   - Check overlapping events
   - Show conflict indicator
   - Suggest alternatives
4. Test conflict detection

**Deliverable:** Can delete events, conflicts detected

#### Day 5: Calendar Polish
**Tasks:**
1. Add view switcher (Month/Week/Day tabs)
2. Add calendar sync button
3. Add loading states to all calendar operations
4. Add error states with retry
5. Add empty states for no events
6. Write tests for calendar features
7. Create Week 6 summary

**Deliverable:** Polished calendar experience

---

## Week 7 Execution Plan: Tasks & Navigation

### Current State Assessment

**What Exists:**
- ✅ `TaskListView.swift` - Task list with filters
- ✅ `TaskListViewModel` - CRUD operations with API
- ✅ `TaskDetailView.swift` - Task detail display
- ✅ `TaskEditView.swift` - Task create/edit UI
- ✅ Task filters (all, today, week, priority)
- ✅ Toggle task status (optimistic updates)
- ✅ Delete task functionality

**What's Missing:**
- ❌ Task create API integration (edit view not connected)
- ❌ Task update API integration (edit save not connected)
- ❌ Task tags support
- ❌ Task subtasks
- ❌ Tab bar navigation verification
- ❌ Deep linking between features

### Day-by-Day Breakdown

#### Day 1: Complete Task CRUD
**Tasks:**
1. Read existing `TaskEditView.swift`
2. Implement create task API call in `APIClient`
3. Connect TaskEditView save button to create/update
4. Add validation (title required, etc.)
5. Test create, update, delete flows
6. Add success/error feedback

**Deliverable:** Full task CRUD working

#### Day 2: Task Enhancements
**Tasks:**
1. Add task tags support
   - UI for adding/removing tags
   - Filter by tags
   - Display tags in list
2. Add task notes/description field
3. Add task recurrence (optional)
4. Test enhanced task features

**Deliverable:** Enhanced task features

#### Day 3: Navigation Architecture
**Tasks:**
1. Verify tab bar navigation exists
2. Implement `NavigationState` or coordinator pattern
3. Connect all major views to navigation
   - Chat
   - Email (Inbox → Detail → Compose)
   - Calendar (List → Month → Day → Event)
   - Tasks (List → Detail → Edit)
4. Test navigation flows

**Deliverable:** Navigation architecture complete

#### Day 4: Deep Linking
**Tasks:**
1. Implement deep linking for emails
   - Open specific email from notification
2. Implement deep linking for events
   - Open specific event from notification
3. Implement deep linking for tasks
   - Open specific task from notification
4. Test deep link navigation

**Deliverable:** Deep linking working

#### Day 5: Tasks & Navigation Polish
**Tasks:**
1. Add consistent back button behavior
2. Add navigation breadcrumbs if needed
3. Add smooth transitions between views
4. Write tests for navigation
5. Write tests for remaining task features
6. Create Week 7 summary

**Deliverable:** Polished navigation and tasks

---

## Week 8 Execution Plan: Polish & Refine

### Objectives
- Ensure consistent UI/UX across all features
- Complete loading, error, and empty states
- Fix any bugs found in Weeks 5-7
- Prepare for Phase 3 (Authentication & Integration)

### Day-by-Day Breakdown

#### Day 1: UI/UX Consistency Audit
**Tasks:**
1. Audit all views for consistent spacing, colors, fonts
2. Ensure all buttons use same style
3. Ensure all cards use same corner radius
4. Ensure all lists use same row style
5. Fix inconsistencies found

**Deliverable:** Consistent UI across app

#### Day 2: Loading States
**Tasks:**
1. Audit all async operations
2. Add ProgressView to all loading states
3. Add skeleton screens where appropriate
4. Add pull-to-refresh where appropriate
5. Test all loading states

**Deliverable:** Loading states everywhere

#### Day 3: Error States
**Tasks:**
1. Audit all error handling
2. Add error banners/alerts to all failures
3. Add retry buttons to recoverable errors
4. Add helpful error messages
5. Test all error scenarios

**Deliverable:** Error states everywhere

#### Day 4: Empty States
**Tasks:**
1. Audit all list views
2. Add empty state illustrations
3. Add helpful empty state messages
4. Add CTA buttons in empty states (e.g., "Create Task")
5. Test all empty states

**Deliverable:** Empty states everywhere

#### Day 5: Phase 2 Summary & Planning
**Tasks:**
1. Test full app end-to-end
2. Fix any remaining bugs
3. Measure test coverage (should be ~60-65%)
4. Write comprehensive Phase 2 summary
5. Plan Phase 3 execution

**Deliverable:** Phase 2 complete, ready for Phase 3

---

## Success Metrics for Phase 2

### Feature Completion:
- ✅ Email: View, compose, send, reply, forward, archive, delete, star
- ✅ Calendar: Month/week/day views, create/edit/delete events, conflict detection
- ✅ Tasks: Full CRUD, filters, tags, status updates
- ✅ Navigation: Tab bar, deep linking, smooth transitions

### Quality Metrics:
- **Test Coverage:** 60-65% (up from 60%)
- **Loading States:** 100% of async operations
- **Error States:** 100% of failure scenarios
- **Empty States:** 100% of list views
- **UI Consistency:** All views follow design system

### Technical Debt:
- **Force Unwraps:** 0 (maintained from Phase 1)
- **Mock Data:** 0 (maintained from Phase 1)
- **TODOs:** < 20 (down from 107)
- **fatalError() calls:** 0 (maintained from Phase 1)

---

## Risk Assessment

### High Risk:
1. **Email Send API** - May not be implemented in backend yet
   - Mitigation: Check backend first, use mock if needed
2. **Calendar Conflict Detection** - Complex logic
   - Mitigation: Start with simple overlap detection, enhance later

### Medium Risk:
1. **Deep Linking** - May require significant navigation refactoring
   - Mitigation: Keep simple, use NavigationStack paths
2. **Task Tags** - API may not support tags yet
   - Mitigation: Store locally first, sync later

### Low Risk:
1. **UI Polish** - Straightforward but time-consuming
   - Mitigation: Use existing design system, don't create new components

---

## Handoff to Phase 3

After Phase 2 completion, Phase 3 will focus on:
1. **Authentication:** Google OAuth, token management, session handling
2. **Backend Integration:** Real API calls for all operations
3. **Offline Support:** Local caching, sync queue, conflict resolution
4. **Performance:** Optimize loading times, reduce memory usage
5. **Testing:** Reach 70-80% test coverage

**Prerequisites for Phase 3:**
- All CRUD operations working (even with mocks if needed)
- Navigation architecture stable
- UI patterns established
- Test infrastructure robust

---

## Notes

### Differences from Original Phase 2 Plan:
- Original plan assumed all ViewModels existed ← **Fixed in pre-Phase 2**
- Original plan didn't account for embedded ViewModels ← **Now documented**
- Original plan was too aggressive on features ← **Focused on CRUD first**

### Key Learnings from Phase 1:
1. Always verify code exists before writing tests
2. Summaries should reflect actual work, not planned work
3. ViewModels can be embedded in View files (not ideal but acceptable)
4. DI infrastructure makes adding features much easier
5. Tests give confidence to refactor

### Recommendations:
1. **Create ViewModels in separate files** going forward for better organization
2. **Write integration tests** for each major feature as it's completed
3. **Do daily git commits** to track progress
4. **Update summaries in real-time** to avoid inaccuracies
5. **Test on real device** weekly to catch UI issues early

---

**Ready to start Week 5!** 🚀
