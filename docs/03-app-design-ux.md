# App Design & User Experience

## Design Principles

### 1. Voice-First, Multimodal Always
- **Primary Input**: Voice (80% of interactions)
- **Visual Confirmation**: Always show what's happening
- **Quick Actions**: Tap alternatives for every voice command
- **Context Aware**: Switch modalities based on situation

### 2. Trust Through Transparency
- **Never Surprise**: Always show draft before sending
- **Explain Actions**: Clear confirmation of what was done
- **Easy Undo**: Reverse any action within 30 seconds
- **Privacy First**: Clear data usage, local processing where possible

### 3. Mobile-First, Desktop-Aware
- **Primary Platform**: iOS/Android mobile apps
- **Secondary**: Web app for desktop review
- **Sync**: All actions sync across devices
- **Offline**: Queue commands when offline, execute when online

### 4. Progressive Disclosure
- **Start Simple**: Core commands upfront
- **Learn Over Time**: Advanced features revealed as user progresses
- **Contextual Help**: Suggestions based on current situation
- **Never Overwhelm**: Maximum 3 choices at a time

---

## App Structure

### Information Architecture

```
Tide App
│
├── 🎤 Voice Input (Home)
│   ├── Active listening
│   ├── Recent commands history
│   └── Quick actions (tap shortcuts)
│
├── 📬 Inbox
│   ├── Needs Action (prioritized)
│   ├── Waiting On (tracking)
│   ├── FYI (batched)
│   └── Completed (archive)
│
├── 📅 Calendar
│   ├── Today/Week view
│   ├── AI suggestions (optimizations)
│   ├── Meeting prep (tap any meeting)
│   └── Schedule assistant
│
├── 🔍 Search
│   ├── Semantic search (natural language)
│   ├── Filter by person/date/type
│   └── Quick commands
│
└── ⚙️ Settings
    ├── Connected accounts (Gmail, Calendar)
    ├── Preferences (tone, auto-actions)
    ├── VIP contacts
    └── Privacy & data
```

---

## Core Screens

### 1. Home Screen - Voice Command Center

```
┌─────────────────────────────────────┐
│  9:41        🔋 85%        [👤]     │
├─────────────────────────────────────┤
│                                     │
│         Good morning, Marcus        │
│                                     │
│    ┌──────────────────────────┐    │
│    │                          │    │
│    │          🎤              │    │
│    │                          │    │
│    │   "How can I help you?"  │    │
│    │                          │    │
│    └──────────────────────────┘    │
│            [Tap to speak]           │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  💬 Recent                          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ✅ Scheduled lunch with Sarah│   │
│  │    10 min ago                │   │
│  │    Wed 1pm confirmed         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ✅ Sent report update to John│   │
│  │    1 hour ago                │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ⏳ Waiting: John to confirm  │   │
│  │    meeting time              │   │
│  │    [Follow up] [Cancel]      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  ⚡ Quick Actions                   │
│  [📅 Next meeting prep]             │
│  [📧 Check inbox]                   │
│  [🔍 Search emails]                 │
│                                     │
└─────────────────────────────────────┘
     [🎤]  [📬]  [📅]  [🔍]  [⚙️]
```

**Interactions**:
- **Tap microphone**: Start voice command
- **Tap recent item**: View details, undo, or follow-up
- **Tap quick action**: Execute common task
- **Swipe recent item**: Delete/archive
- **Pull to refresh**: Check for updates

---

### 2. Voice Input - Active State

```
┌─────────────────────────────────────┐
│  9:41        🔋 85%        [👤]     │
├─────────────────────────────────────┤
│                                     │
│    ┌──────────────────────────┐    │
│    │                          │    │
│    │      ●●●●●●●●●●●         │    │
│    │    (listening pulse)     │    │
│    │                          │    │
│    │  🎤 Listening...         │    │
│    │                          │    │
│    └──────────────────────────┘    │
│                                     │
│  "Schedule lunch with Sarah..."     │
│                                     │
│                                     │
│         [Tap to stop]               │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  💡 Try saying:                     │
│  • "Schedule a meeting with..."     │
│  • "Draft an email to..."           │
│  • "What's my next meeting?"        │
│  • "Follow up with..."              │
│                                     │
└─────────────────────────────────────┘
```

**Processing State**:

```
┌─────────────────────────────────────┐
│  Processing...                      │
├─────────────────────────────────────┤
│                                     │
│    ┌──────────────────────────┐    │
│    │                          │    │
│    │      ⚙️ Working on it... │    │
│    │                          │    │
│    │  Checking calendars...   │    │
│    │  Finding available times │    │
│    │                          │    │
│    └──────────────────────────┘    │
│                                     │
│  You said:                          │
│  "Schedule lunch with Sarah next    │
│   week"                             │
│                                     │
└─────────────────────────────────────┘
```

---

### 3. Draft Review - Email

```
┌─────────────────────────────────────┐
│  ← Back              Draft Ready    │
├─────────────────────────────────────┤
│                                     │
│  ✉️  To: Sarah Chen                 │
│      sarah@company.com              │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  Hey Sarah,                         │
│                                     │
│  Want to grab lunch next week?     │
│  I'm free:                          │
│                                     │
│  • Monday 12pm                      │
│  • Wednesday 1pm                    │
│  • Thursday 12:30pm                 │
│                                     │
│  Let me know what works!            │
│                                     │
│  Best,                              │
│  Marcus                             │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  💡 Based on your style with Sarah: │
│  Casual tone, friendly sign-off     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      ✅ Send                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  [✏️ Edit]  [🔄 Redraft]  [❌ Cancel]│
│                                     │
└─────────────────────────────────────┘
```

**Interactions**:
- **Tap Send**: Send email immediately
- **Tap Edit**: Open editor with draft pre-filled
- **Tap Redraft**: New voice command to regenerate
- **Voice**: Say "send it" or "make it more formal"

---

### 4. Draft Review - Meeting Coordination

```
┌─────────────────────────────────────┐
│  ← Back         Meeting Proposal    │
├─────────────────────────────────────┤
│                                     │
│  📅 Lunch with Sarah                │
│      Next Week                      │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  ✅ Your availability:              │
│                                     │
│  Mon Jan 15  │  12:00 - 1:00pm     │
│  Wed Jan 17  │  1:00 - 2:00pm      │
│  Thu Jan 18  │  12:30 - 1:30pm     │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  ✉️ Draft Email to Sarah:           │
│                                     │
│  "Hey Sarah, want to grab lunch     │
│   next week? I'm free Mon 12pm,     │
│   Wed 1pm, or Thu 12:30pm..."       │
│                                     │
│  [Preview full email ↓]             │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  📊 Next Steps:                     │
│  1. Send proposal to Sarah          │
│  2. I'll monitor for her response   │
│  3. When she picks, I'll:           │
│     • Add to both calendars         │
│     • Send confirmation             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   ✅ Send & Track           │   │
│  └─────────────────────────────┘   │
│                                     │
│  [✏️ Edit times]  [🔄 Redraft]      │
│                                     │
└─────────────────────────────────────┘
```

---

### 5. Inbox - Smart Triage

```
┌─────────────────────────────────────┐
│  Inbox                    [Filter ▼]│
├─────────────────────────────────────┤
│                                     │
│  🔴 Needs Action (3)                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔥 Proposal due today 5pm    │   │
│  │    From: Lisa Chen (Acme)    │   │
│  │    [Draft proposal] [Extend] │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📋 Design feedback needed    │   │
│  │    From: Sarah (yesterday)   │   │
│  │    [Quick approve] [Review]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📅 Meeting invite pending    │   │
│  │    From: Marcus (2 hours ago)│   │
│  │    Tue 3pm - you're free     │   │
│  │    [Accept] [Propose other]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  ⏳ Waiting On (2)                  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Lunch with Sarah (tracking)  │   │
│  │ Sent proposal, awaiting time │   │
│  │ Will follow up in 2 days     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  ℹ️  FYI (12) - [View batched]      │
│                                     │
└─────────────────────────────────────┘
```

**Smart Features**:
- **Auto-prioritization**: AI ranks by urgency/importance
- **Quick actions**: Context-aware buttons for each item
- **Batching**: Non-urgent items grouped
- **Follow-up tracking**: Automatic monitoring

---

### 6. Meeting Prep Screen

```
┌─────────────────────────────────────┐
│  ← Back        Next: 2pm (15 min)   │
├─────────────────────────────────────┤
│                                     │
│  📅 Product Review                  │
│      with Sarah & Marcus            │
│      2:00 - 2:30pm (30 min)         │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  📋 Last Meeting (Dec 15)           │
│  • Decided to ship Q1 first        │
│  • Hold Q2 features for later      │
│  • Sarah to send updated mockups   │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  📨 Since Then                      │
│                                     │
│  ✅ Sarah sent v3 mockups (yesterday)│
│      [View mockups →]               │
│                                     │
│  📧 Marcus asked about timeline     │
│      (this morning)                 │
│      [Read email →]                 │
│                                     │
│  💰 You approved budget (Monday)    │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  💡 Suggested Talking Points        │
│                                     │
│  1. Review Sarah's v3 mockups       │
│     → Need decision today           │
│                                     │
│  2. Address Marcus's timeline Q     │
│     → He seems concerned            │
│                                     │
│  3. Confirm final Q1 scope lock     │
│     → Get everyone aligned          │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  [🎤 Ask me anything about meeting] │
│  [📝 Add to talking points]         │
│                                     │
└─────────────────────────────────────┘
```

---

### 7. Context Retrieval - Search Results

```
┌─────────────────────────────────────┐
│  ← Back                   Search    │
├─────────────────────────────────────┤
│                                     │
│  🔍 "What did John say about Q4     │
│      timeline?"                     │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  📧 Most Relevant (Tuesday)         │
│                                     │
│  From: John Martinez                │
│  Subject: Re: Q4 Planning           │
│                                     │
│  "Aiming for Q4 launch but need     │
│   design feedback by end of month   │
│   to stay on track."                │
│                                     │
│  Also mentioned:                    │
│  → Budget approval pending (Sarah)  │
│  → Timeline depends on design done  │
│                                     │
│  [View full email →]                │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  📌 Related Context                 │
│                                     │
│  • Design mockups sent by Sarah     │
│    (yesterday)                      │
│                                     │
│  • Q4 budget approved (last week)   │
│                                     │
│  • Original Q4 plan from Nov        │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  💡 Quick Actions                   │
│  [Reply to John]                    │
│  [Schedule follow-up]               │
│  [See full Q4 thread]               │
│                                     │
└─────────────────────────────────────┘
```

---

### 8. Daily Briefing (Morning)

```
┌─────────────────────────────────────┐
│  Good morning, Marcus! ☀️           │
├─────────────────────────────────────┤
│                                     │
│  Thursday, January 15               │
│  3 things need attention            │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  🔴 URGENT                          │
│                                     │
│  1. Proposal to Acme Corp           │
│     Due: Today 5pm (9 hours left)   │
│     Status: Not started ⚠️          │
│                                     │
│     What I can do:                  │
│     ┌─────────────────────────┐    │
│     │ Block 2 hours to work   │    │
│     └─────────────────────────┘    │
│     [Get proposal template]         │
│     [Ask for deadline extension]    │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  🟡 IMPORTANT                       │
│                                     │
│  2. Sarah waiting on design feedback│
│     Sent: Yesterday                 │
│     She needs response soon         │
│                                     │
│     [Quick approve Option 2]        │
│     [Schedule detailed review]      │
│     [Draft thoughtful feedback]     │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  🟢 FYI                             │
│                                     │
│  3. Back-to-back meetings today     │
│     10am - 2pm (no break)           │
│                                     │
│     [See full schedule]             │
│     [Prep all meetings]             │
│     [Move one to create gap]        │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Start with urgent task     │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Dismiss] [See more details]       │
│                                     │
└─────────────────────────────────────┘
```

---

### 9. Settings - Preferences

```
┌─────────────────────────────────────┐
│  ← Settings           Preferences   │
├─────────────────────────────────────┤
│                                     │
│  🎨 Communication Style             │
│                                     │
│  Default tone:                      │
│  ◉ Professional but friendly        │
│  ○ Formal and concise              │
│  ○ Casual and conversational       │
│  ○ Adapt to each person            │
│                                     │
│  Email signature:                   │
│  [Best,                     ]       │
│  [Marcus                    ]       │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  🤖 Automation Level                │
│                                     │
│  Auto-accept meetings:              │
│  ◉ When calendar is free            │
│  ○ Only from VIP contacts          │
│  ○ Never (always ask me)           │
│                                     │
│  Auto-respond to simple emails:     │
│  ◉ Yes, but show me after           │
│  ○ Yes, don't notify me            │
│  ○ No, always ask first            │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  👥 VIP Contacts                    │
│                                     │
│  Always prioritize & notify:        │
│                                     │
│  • Sarah Chen (Manager)             │
│  • John Martinez (Direct Report)    │
│  • Lisa Chen (Key Client)          │
│                                     │
│  [+ Add VIP contact]                │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  🔔 Notification Preferences        │
│                                     │
│  Interrupt me for:                  │
│  ☑️ VIP emails (immediate)          │
│  ☑️ Meeting starting (10 min)       │
│  ☑️ Urgent deadlines (2 hours)      │
│  ☑️ Tracked responses received      │
│  ☐ All emails (not recommended)    │
│                                     │
│  Batch notifications every:         │
│  [2 hours ▼]                        │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  ⏰ Follow-up Defaults              │
│                                     │
│  Auto follow-up if no response:     │
│  [3 days ▼]                         │
│                                     │
│  Follow-up tone:                    │
│  ◉ Gentle reminder                  │
│  ○ Neutral check-in                │
│  ○ Urgent escalation               │
│                                     │
└─────────────────────────────────────┘
```

---

## Interaction Patterns

### Voice Command Variants

**Flexible Language Understanding**:
- "Schedule lunch with Sarah" ✅
- "Set up a lunch meeting with Sarah" ✅
- "Find time to have lunch with Sarah" ✅
- "Can you schedule me and Sarah for lunch?" ✅
- "Book lunch, Sarah, next week" ✅

**Context Continuation**:
```
User: "Schedule a meeting with John"
Tide: "When would you like to meet?"
User: "Next week, about an hour"
Tide: "Got it. Finding times next week for 1-hour meeting with John..."
```

**Quick Corrections**:
```
User: "Draft email to John-- wait, Sarah"
Tide: "Correcting - drafting email to Sarah instead"
```

### Gesture Controls

**Voice Trigger Alternatives**:
- Long-press microphone button
- Shake phone (opt-in setting)
- Custom phrase ("Hey Tide")
- Widget tap

**Quick Actions**:
- Swipe left on email: Draft reply
- Swipe right: Mark as handled
- Long press meeting: Get prep
- Pull down: Refresh & check

---

## Accessibility

### Voice Input Accessibility
- **Speech recognition**: Works with accents, speech patterns
- **Noise cancellation**: Filters background in meetings/transit
- **Voice alternatives**: Type commands if can't speak
- **Hands-free mode**: Fully navigable by voice

### Visual Accessibility
- **Large text support**: All text scales
- **High contrast mode**: WCAG AAA compliant
- **Screen reader**: Full VoiceOver/TalkBack support
- **Color blind**: Never rely on color alone

### Cognitive Accessibility
- **Simple language**: No jargon in UI
- **Progressive complexity**: Advanced features hidden initially
- **Undo everything**: Easy mistake recovery
- **Clear feedback**: Always confirm what happened

---

## Onboarding Flow

### Step 1: Value Proposition (15 seconds)
```
┌─────────────────────────────────────┐
│                                     │
│         Welcome to Tide 🌊          │
│                                     │
│    Your AI Executive Assistant      │
│                                     │
│  Handle email & meetings by voice   │
│  while you're on the go             │
│                                     │
│  💬 "Schedule lunch with Sarah"     │
│  ✅ Done in 10 seconds              │
│                                     │
│         [Get Started →]             │
│                                     │
└─────────────────────────────────────┘
```

### Step 2: Connect Email (30 seconds)
```
┌─────────────────────────────────────┐
│                                     │
│    Connect Your Email 📧            │
│                                     │
│  Tide needs access to:              │
│  ✓ Read emails (for context)       │
│  ✓ Send on your behalf (with approval)│
│  ✓ Access calendar (for scheduling)│
│                                     │
│  🔒 Your data:                      │
│  • Encrypted in transit & at rest   │
│  • Never shared or sold             │
│  • Delete anytime                   │
│                                     │
│  [Connect Gmail]                    │
│  [Connect Outlook]                  │
│  [Connect Other]                    │
│                                     │
│         [← Back]    [Skip for now]  │
│                                     │
└─────────────────────────────────────┘
```

### Step 3: Set Preferences (30 seconds)
```
┌─────────────────────────────────────┐
│                                     │
│    Quick Setup 🎨                   │
│                                     │
│  How should Tide write emails?      │
│                                     │
│  ◉ Professional but friendly        │
│  ○ Formal and concise              │
│  ○ Casual                          │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  Who are your VIP contacts?         │
│  (Tide will prioritize these)       │
│                                     │
│  [Add from contacts]                │
│  [I'll add later]                   │
│                                     │
│         [← Back]    [Continue →]    │
│                                     │
└─────────────────────────────────────┘
```

### Step 4: First Command (Interactive Tutorial)
```
┌─────────────────────────────────────┐
│                                     │
│    Try Your First Command 🎤        │
│                                     │
│  Let's schedule a meeting!          │
│                                     │
│  Tap the mic and say:               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  "Schedule a meeting with   │   │
│  │   [someone] next week"      │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│    ┌──────────────────────────┐    │
│    │          🎤              │    │
│    │     [Tap to speak]       │    │
│    └──────────────────────────┘    │
│                                     │
│  Or try:                            │
│  • "What's my next meeting?"        │
│  • "Draft email to [someone]"       │
│                                     │
│         [Skip tutorial]             │
│                                     │
└─────────────────────────────────────┘
```

### Step 5: Success & Next Steps
```
┌─────────────────────────────────────┐
│                                     │
│         Perfect! 🎉                 │
│                                     │
│  You just scheduled a meeting in    │
│  10 seconds with voice.             │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  💡 Pro Tips:                       │
│                                     │
│  • Tide learns your style over time │
│  • You always review before sending │
│  • Ask "What can you do?" anytime   │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  Try these next:                    │
│                                     │
│  🎤 "What's my schedule today?"     │
│  🎤 "Find me an email from [person]"│
│  🎤 "Remind me to follow up with..."│
│                                     │
│         [Start Using Tide →]        │
│                                     │
└─────────────────────────────────────┘
```

**Onboarding Metrics**:
- **Time to first command**: < 2 minutes
- **Completion rate**: > 80%
- **First week activation**: > 70% (3+ commands)

---

## Platform Considerations

### iOS App
- **Native integration**: Siri shortcuts, widgets, spotlight
- **Haptic feedback**: Confirm actions with haptics
- **Live Activities**: Show command processing in Dynamic Island
- **Shortcuts**: "Hey Siri, ask Tide to schedule..."

### Android App
- **Material Design 3**: Following Android guidelines
- **Google Assistant**: "Hey Google, ask Tide..."
- **Quick Settings**: Tile for voice command
- **Wear OS**: Companion watch app

### Web App (Desktop)
- **Full functionality**: All features available
- **Keyboard shortcuts**: Power user efficiency
- **Multi-window**: Email draft + calendar side-by-side
- **Browser extension**: Quick commands from any page

---

## Error States & Edge Cases

### Network Errors
```
┌─────────────────────────────────────┐
│  ⚠️ Can't connect right now         │
│                                     │
│  Your command is saved:             │
│  "Schedule lunch with Sarah"        │
│                                     │
│  I'll execute it when back online.  │
│                                     │
│  [View queued commands (3)]         │
│  [Retry now] [Cancel]               │
└─────────────────────────────────────┘
```

### Ambiguous Commands
```
┌─────────────────────────────────────┐
│  🤔 Need clarification              │
│                                     │
│  You said: "Email John"             │
│                                     │
│  I found 3 Johns in your contacts:  │
│                                     │
│  • John Martinez (most frequent)    │
│  • John Smith (Acme Corp)          │
│  • John Davis (last week)          │
│                                     │
│  Which one?                         │
│  [Tap one] [Say name] [View all]   │
└─────────────────────────────────────┘
```

### Failed Actions
```
┌─────────────────────────────────────┐
│  ❌ Couldn't send email             │
│                                     │
│  Sarah's email bounced (invalid).   │
│                                     │
│  Your draft is saved.               │
│                                     │
│  [Update Sarah's email]             │
│  [Try different contact method]     │
│  [Discard draft]                    │
└─────────────────────────────────────┘
```

---

## Delight Moments

### Intelligent Suggestions
```
[User drafts email at 11:30pm]

Tide: "📤 Draft ready to send.

💡 Note: It's late - send now or schedule
for 9am tomorrow so you don't seem
like you're working nights?"

[Send now] [Send 9am tomorrow]
```

### Proactive Help
```
[Calendar shows back-to-back meetings]

Tide: "Heads up: You have 6 meetings
tomorrow with no lunch break.

I can move your 2pm (flexible) to
Thursday to create space.

[Auto-optimize] [I'll handle it]"
```

### Learning & Improving
```
After 30 days:

Tide: "🎉 You've saved 12 hours this
month with Tide!

Also noticed: You prefer casual tone
with teammates but formal with clients.

I've updated my defaults - your drafts
should be even better now."

[View stats] [Adjust preferences]
```

---

## Design System

### Color Palette
```
Primary: #0066FF (Tide Blue)
Success: #00C48C (Green)
Warning: #FFB800 (Amber)
Error: #FF4444 (Red)
Neutral: #1A1A1A → #F5F5F5 (Dark to Light)
```

### Typography
```
Headings: SF Pro Display / Roboto (Bold)
Body: SF Pro Text / Roboto (Regular)
Monospace: SF Mono / Roboto Mono (Code/data)
```

### Voice Feedback
```
Listening: Gentle pulse sound
Processing: Soft "thinking" tone
Success: Satisfying "done" chime
Error: Apologetic "hmm" tone
```

### Animations
```
Voice input: Pulsing waveform (120ms)
Command processing: Shimmer effect (800ms)
Draft ready: Gentle slide-up (300ms)
Success: Micro-celebration (500ms)
```

---

## Success Metrics

### User Experience KPIs
- **Voice command success rate**: > 95%
- **Draft approval without edits**: > 80%
- **Time to complete task**: < 30 seconds average
- **User delight score**: NPS > 50
- **Daily active usage**: 5+ commands/day by week 4

### Technical Performance
- **Voice-to-action latency**: < 3 seconds
- **App launch time**: < 1 second
- **API response time**: < 500ms p95
- **Offline functionality**: Queue commands, sync later
- **Battery usage**: < 5% per hour active use
