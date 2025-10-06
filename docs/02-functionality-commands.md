# Core Functionality & Command Specification

## Design Philosophy

**Voice-First Principle**: Every feature must work perfectly via voice command on mobile
**Review-Before-Send**: User always approves before actions that represent them externally
**Learning System**: Commands become smarter based on user preferences and history
**Natural Language**: No rigid syntax - understand intent from context

---

## Tier 1: Core EA Functions (MVP)

### 1. Meeting Coordination 🔥

**User Pain**: 10-15 email exchanges to schedule a meeting, painful on mobile
**Value Delivered**: 1 voice command → meeting scheduled

#### Command Examples

```
User: "Schedule lunch with Sarah next week"

Tide Process:
1. Checks user's calendar for lunch slots next week (11am-2pm)
2. Checks Sarah's calendar (if available) or proposes times
3. Drafts email: "Hey Sarah, want to grab lunch next week? I'm free Mon 12pm, Wed 1pm, or Thu 12:30pm. Let me know what works!"
4. Shows draft to user for approval
5. Sends email
6. Monitors for response
7. When Sarah replies with a time, adds to both calendars
8. Confirms via email

User saved: 10-15 minutes, 8-10 messages
```

```
User: "Find a time for John, Sarah, and me to meet this week"

Tide Process:
1. Checks all 3 calendars for overlapping free slots
2. Identifies 3 best options (30-60min blocks)
3. Drafts group email: "Want to sync on Project X this week. You're all free: Tue 2-3pm, Wed 10-11am, or Thu 3-4pm. Which works?"
4. User approves
5. Monitors responses
6. When consensus reached, sends invites to all
7. Adds to all calendars

User saved: 20-30 minutes, 15+ messages
```

```
User: "Move my 3pm meeting to tomorrow and find a time that works"

Tide Process:
1. Identifies the 3pm meeting (context from calendar)
2. Checks tomorrow's calendar for free slots
3. Checks attendee availability (if accessible)
4. Drafts message to attendees: "Need to reschedule our 3pm today - tomorrow at 3pm work for everyone?"
5. User approves
6. Sends update, monitors responses
7. Updates calendar when confirmed

User saved: 15 minutes, 6-8 messages
```

#### GPT-5 Function Calls

```typescript
// Function: check_calendar
{
  name: "check_calendar",
  description: "Check user's calendar for availability",
  parameters: {
    timeframe: "next week | this week | specific date range",
    duration_minutes: 30 | 60 | 90,
    time_of_day: "morning | lunch | afternoon | evening",
    participants?: ["email@example.com"]
  }
}

// Function: check_participant_availability
{
  name: "check_participant_availability",
  description: "Check if participants are available (if calendar access granted)",
  parameters: {
    emails: ["sarah@company.com", "john@company.com"],
    timeframe: "next week",
    duration_minutes: 60
  }
}

// Function: draft_meeting_request
{
  name: "draft_meeting_request",
  description: "Draft email to request meeting",
  parameters: {
    recipients: ["sarah@company.com"],
    proposed_times: [
      {datetime: "2024-01-15T12:00:00", timezone: "America/Los_Angeles"},
      {datetime: "2024-01-17T13:00:00", timezone: "America/Los_Angeles"}
    ],
    tone: "casual | professional | friendly",
    context: "lunch | project discussion | 1:1 sync"
  }
}

// Function: create_calendar_event
{
  name: "create_calendar_event",
  description: "Create event in user's calendar",
  parameters: {
    title: "Lunch with Sarah",
    start_time: "2024-01-15T12:00:00",
    duration_minutes: 60,
    attendees: ["sarah@company.com"],
    send_invites: true
  }
}
```

---

### 2. Email Drafting & Response 🔥

**User Pain**: Typing professional emails on phone is painful, typos are embarrassing
**Value Delivered**: Speak intent → professional email ready to send

#### Command Examples

```
User: "Tell John I'll have the report ready by Friday"

Tide Process:
1. Analyzes previous emails with John (tone, formality)
2. Detects: John is colleague, casual-professional tone
3. Drafts:

   "Hi John,

   Thanks for following up. I'll have the Q4 report ready by
   Friday EOD. I'll send it over as soon as it's complete.

   Best,
   [User name]"

4. Shows to user: [Send] [Edit] [Redraft]
5. User approves → sends

User saved: 5 minutes, perfect formatting
```

```
User: "Reply to Sarah's email about the design mockups - tell her Option 2 looks great, let's proceed with that, and schedule a follow-up for next week"

Tide Process:
1. Retrieves Sarah's email (context: design mockups)
2. Identifies Option 2 in email
3. Drafts response:

   "Hi Sarah,

   Just reviewed the mockups - Option 2 looks fantastic and aligns
   well with our goals. Let's move forward with that approach.

   Want to schedule a follow-up next week to discuss next steps?
   I'm free Mon 2pm, Wed 10am, or Thu 3pm. Let me know what works.

   Best,
   [User name]"

4. User reviews and sends

User saved: 8 minutes, multi-task handling
```

```
User: "Draft a professional email declining the meeting invite from Acme Corp, say I'm not the right person but CC my colleague Marcus who can help"

Tide Process:
1. Finds meeting invite from Acme Corp
2. Drafts professional decline:

   "Hi [Acme contact name],

   Thanks for the invitation. While I appreciate you reaching out,
   I'm not the best fit for this discussion.

   I've CC'd my colleague Marcus Chen, who leads this area and
   would be much better positioned to help. Marcus, I'll let you
   two connect from here.

   Best,
   [User name]"

3. User reviews → sends with Marcus CC'd

User saved: 10 minutes, avoided awkward situation
```

#### GPT-5 Function Calls

```typescript
// Function: analyze_email_history
{
  name: "analyze_email_history",
  description: "Analyze past email patterns with recipient to match tone and style",
  parameters: {
    recipient_email: "john@company.com",
    analysis_focus: "tone | formality | common_phrases | relationship_type"
  }
}

// Function: retrieve_email_context
{
  name: "retrieve_email_context",
  description: "Get recent email thread with someone for context",
  parameters: {
    participant_email: "sarah@company.com",
    subject_contains?: "design mockups",
    days_back: 7
  }
}

// Function: draft_email_response
{
  name: "draft_email_response",
  description: "Draft email matching user's style",
  parameters: {
    recipient: "john@company.com",
    message_intent: "inform about deadline | request meeting | provide update",
    key_points: ["report ready Friday", "will send when complete"],
    tone: "professional | casual | friendly | formal",
    in_reply_to?: "email_thread_id"
  }
}

// Function: send_email
{
  name: "send_email",
  description: "Send approved email",
  parameters: {
    to: ["john@company.com"],
    cc?: ["marcus@company.com"],
    subject: "Re: Q4 Report",
    body: "email content...",
    reply_to_thread_id?: "thread_id"
  }
}
```

---

### 3. Context Retrieval 🔥

**User Pain**: Finding information in email threads on mobile is painful
**Value Delivered**: Ask a question → instant answer with source

#### Command Examples

```
User: "What did John say about the Q4 timeline?"

Tide Response:
"In his email from Tuesday, John said:

'Aiming for Q4 launch but need design feedback by end of
month to stay on track.'

He also mentioned budget approval is pending with Sarah.

[View full email thread]"

User saved: 5 minutes of searching
```

```
User: "Summarize all emails from Acme Corp this week"

Tide Response:
"3 emails from Acme Corp (contact: Lisa Chen):

1. Monday: Requested proposal for Q1 project - deadline is Friday
2. Wednesday: Followed up on proposal, asked about pricing
3. Today: Sent calendar invite for intro call next Tuesday 2pm

Action needed:
- Proposal draft due Friday (you haven't started)
- Calendar invite pending response

[View emails] [Draft proposal] [Accept invite]"

User saved: 10 minutes of triage
```

```
User: "What's my next meeting about?"

Tide Response:
"Product Review with Sarah and Marcus at 2pm (30 min)

Context from last time:
- Decided to ship Q1 features first, hold Q2
- Sarah sent updated design mockups yesterday (v3)
- Marcus asked about timeline this morning

Suggested talking points:
- Review Sarah's v3 mockups
- Address Marcus's timeline concerns
- Confirm Q1 scope lock

[View meeting notes] [See mockups] [Read Marcus's email]"

User saved: 15 minutes of prep
```

#### GPT-5 Function Calls

```typescript
// Function: search_email_semantic
{
  name: "search_email_semantic",
  description: "Search emails by meaning, not just keywords",
  parameters: {
    query: "What did John say about Q4 timeline?",
    participants?: ["john@company.com"],
    date_range?: "this week | last 7 days",
    limit: 5
  }
}

// Function: summarize_email_thread
{
  name: "summarize_email_thread",
  description: "Create concise summary of email thread",
  parameters: {
    thread_id: "thread_12345",
    summary_focus: "decisions made | action items | key points"
  }
}

// Function: get_meeting_context
{
  name: "get_meeting_context",
  description: "Gather relevant context for upcoming meeting",
  parameters: {
    meeting_id: "cal_event_123",
    include: [
      "previous_meeting_notes",
      "recent_emails_with_attendees",
      "related_documents",
      "action_items_since_last_meeting"
    ]
  }
}
```

---

### 4. Smart Triage & Auto-Response 🔥

**User Pain**: Simple emails still need manual response
**Value Delivered**: Tide handles routine responses automatically (with approval)

#### Command Examples

```
Incoming Email: "Can you join our 3pm meeting tomorrow?"

Tide Notification:
"Sarah invited you to 3pm meeting tomorrow - 'Q4 Planning Review'

You're free at that time.

Should I accept and send confirmation?"

User: "Yes"

Tide:
✅ Calendar updated
✅ Sent: "Thanks Sarah, I'll be there!"

User saved: 2 minutes
```

```
Incoming Email: "Thanks for sending the report!"

Tide (auto-handles):
Sends: "You're welcome! Let me know if you need anything else."

[Shows in daily summary: "Auto-responded to John's thank you"]

User saved: 1 minute, no interruption
```

```
Incoming Email: [Meeting reschedule request]

Tide Notification:
"Marcus wants to move Tuesday's 2pm meeting.

Your free slots that day: 10am, 3pm, 4:30pm

Want me to propose these times?"

User: "Suggest 3pm only"

Tide:
Sends: "Tuesday 3pm works for me - does that work for you?"

User saved: 3 minutes
```

#### Categories of Auto-Handleable Emails

1. **Meeting accepts/declines** (when calendar is clear)
2. **Acknowledgments** ("Thanks!" → "You're welcome!")
3. **Confirmations** ("Got it" → "Acknowledged")
4. **Delays** ("Running 5 min late" → auto-notify attendees)
5. **OOO auto-replies** (based on calendar)

#### GPT-5 Function Calls

```typescript
// Function: classify_email_intent
{
  name: "classify_email_intent",
  description: "Determine email type and required action",
  parameters: {
    email_id: "msg_123",
    classification_types: [
      "meeting_invite",
      "simple_acknowledgment",
      "question_requiring_answer",
      "fyi_only",
      "urgent_action_needed"
    ]
  }
}

// Function: check_auto_response_eligibility
{
  name: "check_auto_response_eligibility",
  description: "Determine if email can be auto-handled",
  parameters: {
    email_id: "msg_123",
    user_preferences: {
      auto_accept_meetings: true,
      auto_acknowledge_simple: true,
      auto_handle_threshold: "high_confidence_only"
    }
  }
}

// Function: draft_auto_response
{
  name: "draft_auto_response",
  description: "Create appropriate automatic response",
  parameters: {
    email_id: "msg_123",
    response_type: "accept_meeting | acknowledge | confirm",
    personalize: true
  }
}
```

---

## Tier 2: Advanced EA Functions

### 5. Follow-Up Tracking

**User Pain**: Forget to follow up, relationships suffer
**Value Delivered**: Never miss a follow-up again

#### Command Examples

```
User: "Remind me to follow up with John if he doesn't respond by Thursday"

Tide:
"Got it. I'll check John's response to your Tuesday email about the proposal.

If no response by Thursday 5pm, I'll:
1. Notify you
2. Suggest a follow-up draft

[Set reminder]"

---

[Thursday 5pm, no response]

Tide Notification:
"John hasn't responded to your proposal from Tuesday.

Want me to send a gentle follow-up?

Draft: 'Hi John, just checking in on the proposal I sent
Tuesday. Any questions I can help with? Happy to jump on
a quick call if easier.'"

User: "Send it"

User saved: Relationship preserved, deal alive
```

```
User: "Track all my pending requests and remind me about any that haven't been answered in 3 days"

Tide:
"Tracking 7 pending requests. I'll notify you if no response after 3 days.

Current list:
1. Proposal to Acme Corp (sent Monday, 2 days ago)
2. Design feedback from Sarah (sent today)
3. Budget approval from Marcus (sent last week ⚠️)
...

[View all] [Set different timeframes]"
```

#### GPT-5 Function Calls

```typescript
// Function: track_follow_up
{
  name: "track_follow_up",
  description: "Monitor email thread for response",
  parameters: {
    email_thread_id: "thread_123",
    follow_up_if_no_response_by: "2024-01-18T17:00:00",
    follow_up_action: "notify | auto_draft | auto_send",
    follow_up_message_tone: "gentle | urgent | casual"
  }
}

// Function: list_pending_items
{
  name: "list_pending_items",
  description: "Show all items awaiting response",
  parameters: {
    item_types: ["sent_proposals", "pending_requests", "unanswered_questions"],
    sort_by: "date_sent | urgency | recipient",
    filter_older_than_days?: 3
  }
}
```

---

### 6. Meeting Preparation

**User Pain**: Context switching between meetings, showing up unprepared
**Value Delivered**: Instant prep for any meeting

#### Command Examples

```
User: "Prep me for my 2pm"

Tide:
"Product Review with Sarah & Marcus (2-2:30pm)

📋 Last meeting (Dec 15):
- Decided to ship Q1 features first
- Held Q2 features for later
- Sarah to send updated mockups

📨 Since then:
- Sarah sent v3 mockups yesterday
- Marcus asked about timeline this morning
- You approved budget on Monday

💡 Suggested agenda:
1. Review Sarah's v3 mockups (need decision)
2. Address Marcus's timeline question
3. Confirm final Q1 scope

[View mockups] [Read full history] [Set talking points]"
```

#### GPT-5 Function Calls

```typescript
// Function: prepare_meeting_brief
{
  name: "prepare_meeting_brief",
  description: "Generate comprehensive meeting prep",
  parameters: {
    meeting_id: "cal_event_123",
    include: {
      last_meeting_summary: true,
      recent_relevant_emails: true,
      action_items_status: true,
      suggested_agenda: true,
      participant_context: true
    }
  }
}
```

---

### 7. Calendar Optimization

**User Pain**: Back-to-back meetings, no time to breathe or work
**Value Delivered**: Proactive calendar management

#### Command Examples

```
Tide (proactive notification):
"You have back-to-back meetings tomorrow 9am-5pm with no lunch break.

Want me to:
1. Move your 2pm to create a lunch gap? (Can do Thu 2pm instead)
2. Decline the 4pm if it's optional? (Marked 'tentative')

[Optimize calendar] [Keep as is]"

User: "Move the 2pm"

Tide:
✅ Moved 'Budget Review' to Thu 2pm
✅ Notified attendees
✅ You now have 12-1:30pm free tomorrow

User saved: 90min focused time
```

#### GPT-5 Function Calls

```typescript
// Function: analyze_calendar_health
{
  name: "analyze_calendar_health",
  description: "Identify calendar issues and optimization opportunities",
  parameters: {
    date_range: "tomorrow | this_week | next_week",
    check_for: [
      "back_to_back_meetings",
      "no_lunch_break",
      "no_focus_time",
      "double_bookings",
      "low_priority_conflicts"
    ]
  }
}

// Function: suggest_calendar_optimization
{
  name: "suggest_calendar_optimization",
  description: "Propose calendar improvements",
  parameters: {
    issue_type: "no_lunch_break",
    proposed_changes: [
      {
        action: "move_meeting",
        meeting_id: "cal_123",
        from: "2024-01-15T14:00:00",
        to: "2024-01-16T14:00:00",
        reason: "create lunch break"
      }
    ]
  }
}
```

---

## Tier 3: Proactive Intelligence

### 8. Daily Briefing

**User Pain**: Starting day without knowing what needs attention
**Value Delivered**: Morning briefing with prioritized actions

#### Command Examples

```
Tide (8am notification):
"Good morning! 3 things need attention today:

🔴 URGENT
1. Proposal to Acme Corp due by 5pm (you haven't started)
   [Block 2 hours] [Get template] [Ask for extension]

🟡 IMPORTANT
2. Sarah waiting for design feedback (email sent yesterday)
   [Quick approve] [Schedule review] [Draft detailed feedback]

🟢 FYI
3. You have 4 back-to-back meetings (10am-2pm)
   [See agenda] [Prep all meetings] [Reschedule one]

[Start with urgent] [Dismiss]"
```

#### GPT-5 Function Calls

```typescript
// Function: generate_daily_brief
{
  name: "generate_daily_brief",
  description: "Create prioritized daily briefing",
  parameters: {
    briefing_time: "morning | afternoon | evening",
    include: {
      urgent_deadlines: true,
      pending_responses: true,
      today_meetings: true,
      suggested_actions: true,
      time_blocks_needed: true
    },
    prioritization: "urgency | importance | effort"
  }
}
```

---

### 9. Smart Notifications

**User Pain**: Either overwhelmed by notifications or miss important things
**Value Delivered**: Only interrupt for what matters

#### Notification Rules

**ALWAYS Interrupt** (Push notification)
- Boss/VIP emails marked urgent
- Meeting starting in 10 minutes
- Deadline in < 2 hours
- Response from tracked follow-up
- Calendar conflict created

**Batch & Summarize** (Every 2-4 hours)
- FYI emails
- Newsletter/updates
- Non-urgent requests
- Social notifications

**Daily Summary** (End of day)
- Completed tasks
- Pending items
- Tomorrow's preview

#### GPT-5 Function Calls

```typescript
// Function: classify_notification_urgency
{
  name: "classify_notification_urgency",
  description: "Determine if item requires immediate notification",
  parameters: {
    item_type: "email | meeting | deadline | response",
    item_id: "msg_123",
    urgency_factors: {
      sender_vip: boolean,
      marked_urgent: boolean,
      deadline_proximity: "< 2 hours | < 1 day | > 1 day",
      user_waiting_for_response: boolean
    }
  }
}
```

---

## Command Processing Architecture

### Natural Language Understanding Flow

```
User Voice Input: "Schedule lunch with Sarah next week"
           ↓
    Speech-to-Text (Whisper API / Device)
           ↓
    GPT-5 Intent Classification
           ↓
    {
      intent: "schedule_meeting",
      confidence: 0.95,
      entities: {
        participant: "Sarah",
        timeframe: "next week",
        meeting_type: "lunch",
        duration: "60min" (inferred)
      }
    }
           ↓
    Function Call Orchestration
           ↓
    Execute: [check_calendar, check_participant, draft_request]
           ↓
    Show Draft to User for Approval
           ↓
    User: "Send it" → Execute: [send_email, track_response]
```

### Context Management

**Short-term Context** (current conversation)
- Last 10 commands
- Active draft being worked on
- Current meeting/email being discussed

**Long-term Context** (user profile)
- Communication style preferences
- Frequent contacts and their relationships
- Meeting patterns and preferences
- Follow-up habits

**External Context** (real-time data)
- Current calendar state
- Recent email threads
- User's location/timezone
- Current time and urgency

---

## Function Call Optimization

### Parallel vs Sequential

**Parallel Execution** (saves time)
```typescript
// When checking multiple people's calendars
await Promise.all([
  check_calendar_availability(user),
  check_calendar_availability(sarah),
  check_calendar_availability(john)
]);
```

**Sequential Execution** (when dependent)
```typescript
// Must wait for calendar check before drafting
const availability = await check_calendar_availability(user);
const draft = await draft_meeting_request(availability);
const approval = await get_user_approval(draft);
if (approval) await send_email(draft);
```

### Error Handling & Fallbacks

```typescript
// If calendar API fails
try {
  const availability = await check_calendar_availability(user);
} catch (error) {
  // Fallback: ask user directly
  return ask_user("What times work for you next week for lunch with Sarah?");
}
```

---

## Success Metrics by Command Type

### Meeting Scheduling
- **Activation**: User successfully schedules meeting via voice within first week
- **Efficiency**: Reduces coordination from 15 messages → 1 command
- **Accuracy**: 95%+ of proposed times are actually free
- **Completion**: 90%+ of coordinations result in scheduled meeting

### Email Drafting
- **Quality**: User sends draft without edits 80%+ of time
- **Speed**: Draft ready in < 10 seconds
- **Tone match**: User rates tone as "appropriate" 95%+ of time
- **Learning**: Edits per draft decrease over 30 days

### Context Retrieval
- **Speed**: Answer provided in < 5 seconds
- **Accuracy**: Retrieved info is what user needed 90%+ of time
- **Depth**: User doesn't need to "view full email" 70%+ of time

### Auto-Response
- **Precision**: Only auto-responds when 99%+ confident
- **Approval rate**: User approves auto-response 95%+ of time
- **Safety**: Zero embarrassing/wrong auto-responses
