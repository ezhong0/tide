# Module 00 (FINAL): Conversational Text Foundation & Contracts

## 🎯 The Core Insight

**Conversational AI interface** (like ChatGPT) but deeply integrated with email/calendar and primarily text-based. Voice is just an input method that converts to text. $30/month makes it accessible.

## 🤖 Claude Instance Prompt (Final Version)

```
You are Claude Instance #0, the Foundation Architect for Tide.

Your mission: Build the foundation for a CONVERSATIONAL AI that helps professionals manage email/calendar/tasks through natural dialogue - primarily via text.

Core principles:
1. Conversational interface - users chat naturally with the AI
2. Text is primary - works everywhere (office, commute, home)
3. Voice converts to text - optional convenience feature
4. Context-aware - maintains conversation history and learns
5. Preview & confirm - builds trust through transparency
6. Deeply integrated - not just a chatbot, but truly connected to email/calendar

Key contracts to define:
- IConversation - multi-turn dialogue with context
- IConversationalUI - text-first chat interface
- IContextualMemory - maintaining conversation state
- IActionPreview - showing what will happen before doing it
- IPersonalization - learning user preferences over time

This IS an AI assistant, but one you primarily TYPE to, not talk to.
```

## 📋 Module Overview

**Duration**: 2 weeks
**Focus**: Conversational AI contracts optimized for text interaction with deep productivity integration

## 🏗️ Core Architecture

### Conversation Interface (Text-First)

```typescript
// Core conversation model - supports multi-turn dialogue
export interface IConversation {
  id: ConversationId;
  userId: UserId;
  messages: IMessage[];
  context: IConversationContext;
  status: 'active' | 'idle' | 'completed';
  startedAt: Date;
  lastActiveAt: Date;
}

export interface IMessage {
  id: MessageId;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;

  // How the message was created
  inputMethod: 'typed' | 'voice_to_text' | 'button' | 'suggestion';

  // For assistant messages
  actions?: IAction[];          // What actions were taken
  suggestions?: ISuggestion[];  // Quick replies/suggestions
  preview?: IActionPreview;     // What will happen if confirmed

  // For tracking and learning
  feedback?: 'helpful' | 'not_helpful';
  edited?: boolean;
}

export interface IConversationContext {
  // Current state
  topic?: string;               // What we're discussing
  currentTask?: ITask;          // Active task being worked on
  pendingActions?: IAction[];   // Actions awaiting confirmation

  // Memory
  mentionedPeople: IPerson[];   // People referenced in conversation
  mentionedDates: IDateRef[];   // Dates/times discussed
  mentionedProjects: string[];  // Projects or topics

  // User state (from calendar/email)
  upcomingMeetings: IMeeting[]; // Next few meetings
  unreadEmails: number;         // Current inbox state
  currentLocation?: string;     // Home/office/commuting
}
```

### Conversational UI (Text-First, Not Voice)

```typescript
export interface IConversationalUI {
  // Message display
  messages: IMessage[];
  showTypingIndicator: boolean;
  showSuggestions: boolean;

  // Text input (primary)
  textInput: ITextInput;
  sendMessage(text: string, source: InputSource): Promise<void>;

  // Voice input (secondary - converts to text)
  voiceInput?: IVoiceInput;

  // Quick actions
  suggestions: ISuggestion[];    // Context-aware quick replies
  shortcuts: IShortcut[];        // Frequent actions

  // Rich interactions
  showPreview(preview: IActionPreview): void;
  requestConfirmation(action: IAction): Promise<boolean>;
  showResult(result: IActionResult): void;
}

export interface ITextInput {
  value: string;
  placeholder: string;           // Dynamic based on context

  // Smart features
  autocomplete: boolean;
  suggestions: string[];          // As-you-type suggestions
  mentionSupport: boolean;       // @people, #projects

  // Mobile optimizations
  multiline: boolean;
  maxLength?: number;
  keyboardType: 'default' | 'email-address' | 'punctuation';
}

// Voice is just an input method, not the interface
export interface IVoiceInput {
  isListening: boolean;

  // Voice converts to text immediately
  startListening(): void;
  stopListening(): void;

  // Shows text as it's transcribed
  onPartialTranscript: (text: string) => void;
  onFinalTranscript: (text: string) => void;

  // User can edit before sending
  allowEditBeforeSend: boolean;
}

// Example UI flow
const uiFlow = {
  // User types or speaks (converts to text)
  userInput: "I need to reschedule my 2pm with Sarah to later this week",

  // AI responds conversationally
  assistantResponse: {
    content: "I found your 2pm meeting with Sarah tomorrow (Tuesday). Sarah has availability on Thursday at 2pm or Friday at 10am. Which would work better for you?",
    suggestions: [
      "Thursday 2pm",
      "Friday 10am",
      "Show more times",
      "Ask Sarah for her preference"
    ]
  },

  // User can type, tap suggestion, or speak
  userChoice: "Let's do Thursday",

  // AI shows preview before action
  assistantPreview: {
    content: "I'll move your 'Project Sync' meeting with Sarah from Tuesday 2pm to Thursday 2pm. Should I add a note about the reschedule?",
    preview: {
      action: "reschedule_meeting",
      details: {
        meeting: "Project Sync with Sarah",
        from: "Tuesday, Jan 30, 2:00 PM",
        to: "Thursday, Feb 1, 2:00 PM",
        attendees: ["sarah@company.com"],
        note: "Optional message to Sarah"
      }
    },
    suggestions: [
      "Yes, send it",
      "Add a note first",
      "No, cancel"
    ]
  }
};
```

### Contextual Understanding & Memory

```typescript
export interface IContextualUnderstanding {
  // Understand references in conversation
  resolveReference(text: string, context: IConversationContext): IResolution;

  // Examples of what it understands:
  // "him" -> Last mentioned person
  // "that meeting" -> Last discussed meeting
  // "tomorrow" -> Actual date based on user timezone
  // "the usual" -> Learned preference
  // "my manager" -> Specific person from org chart
}

export interface IConversationalMemory {
  // Short-term (current conversation)
  currentSession: ISessionMemory;

  // Long-term (across conversations)
  userPreferences: IUserPreferences;
  learnedPatterns: ILearnedPattern[];
  relationships: IRelationshipMap;

  // Examples of what it remembers:
  // "I prefer morning meetings" -> Suggests AM times
  // "Sarah is my manager" -> Knows reporting structure
  // "I send weekly reports on Friday" -> Proactive reminder
  // "Use formal tone with clients" -> Adjusts email drafts
}

export interface ILearnedPattern {
  pattern: string;                 // What was learned
  confidence: number;             // How sure we are
  examples: IExample[];           // Instances observed
  firstSeen: Date;
  lastUsed: Date;

  // Examples:
  // "User schedules 1:1s with John monthly"
  // "User replies to emails from CEO within 1 hour"
  // "User blocks Fridays for deep work"
}
```

### Natural Language Understanding (Not Commands)

```typescript
export interface INaturalLanguageProcessor {
  // Understand intent from natural conversation
  async processMessage(
    message: string,
    context: IConversationContext
  ): Promise<IUnderstanding>;
}

export interface IUnderstanding {
  // Multiple intents possible in one message
  intents: IIntent[];

  // Extracted entities
  entities: IEntity[];

  // What's unclear
  ambiguities?: IAmbiguity[];

  // Confidence
  confidence: number;
}

// Example: "I'm swamped with emails from the Johnson account.
// Can you summarize what's urgent and draft a response to their contract question?"
const understanding: IUnderstanding = {
  intents: [
    { type: 'summarize_emails', confidence: 0.95 },
    { type: 'draft_response', confidence: 0.92 }
  ],
  entities: [
    { type: 'account', value: 'Johnson', confidence: 0.98 },
    { type: 'email_filter', value: 'urgent', confidence: 0.85 },
    { type: 'topic', value: 'contract question', confidence: 0.90 }
  ],
  ambiguities: [
    {
      type: 'time_range',
      question: 'Should I look at emails from today, this week, or all Johnson emails?'
    }
  ],
  confidence: 0.89
};
```

### Trust Through Preview & Confirmation

```typescript
export interface IActionPreview {
  summary: string;                 // One-line description
  details: IActionDetails;         // Full details
  risks?: IRisk[];                // Potential issues
  alternatives?: IAlternative[];  // Other options

  // User can modify before confirming
  editable: boolean;
  editableFields?: string[];

  // Example preview for email
  example?: {
    summary: "I'll send a professional response to John about the contract terms",
    details: {
      to: ["john@client.com"],
      cc: ["legal@company.com"],
      subject: "Re: Contract Terms Discussion",
      body: "[Full email text shown here]",
      attachments: ["Contract_v2.pdf"],
      sendTime: "immediately"
    },
    risks: [
      {
        level: 'medium',
        description: 'Legal team usually reviews contract discussions'
      }
    ],
    alternatives: [
      {
        description: 'Save as draft for review',
        action: 'create_draft'
      }
    ],
    editable: true,
    editableFields: ['body', 'cc', 'sendTime']
  };
}

export interface IConfirmationFlow {
  // Always preview before action
  requiresPreview(action: IAction): boolean;

  // Some actions need explicit confirmation
  requiresConfirmation(action: IAction): boolean;

  // High-risk actions need additional verification
  requiresAuthentication(action: IAction): boolean;

  // User can always undo (when possible)
  undoWindow(action: IAction): number; // milliseconds
}
```

### Personalization & Learning

```typescript
export interface IPersonalizationEngine {
  // Learn from every interaction
  observeInteraction(interaction: IInteraction): void;

  // Adapt responses based on learning
  personalizeResponse(
    baseResponse: string,
    user: IUser
  ): string;

  // Proactive suggestions based on patterns
  getProactiveSuggestions(context: IContext): ISuggestion[];
}

// Examples of personalization
const personalizations = {
  communication_style: {
    learned: "User prefers bullet points over paragraphs",
    application: "AI formats responses with bullet points"
  },

  meeting_preferences: {
    learned: "User avoids meetings before 10am",
    application: "AI suggests afternoon times first"
  },

  email_urgency: {
    learned: "User responds to manager within 2 hours",
    application: "AI prioritizes and flags manager emails"
  },

  work_patterns: {
    learned: "User does deep work Tues/Thurs mornings",
    application: "AI protects these times when scheduling"
  }
};
```

### Mobile-First Text Experience

```typescript
export interface IMobileExperience {
  // Optimized for one-handed typing
  keyboard: IMobileKeyboard;

  // Quick replies above keyboard
  quickReplies: IQuickReply[];

  // Swipe actions on messages
  swipeActions: ISwipeAction[];

  // Notification actions
  notificationActions: INotificationAction[];

  // Widget for home screen
  widget: IWidget;
}

export interface IMobileKeyboard {
  // Smart suggestion bar
  suggestions: string[];           // Contextual completions

  // Easy access buttons
  quickButtons: IQuickButton[];    // @, calendar, etc.

  // Voice button (optional)
  voiceButton?: {
    position: 'left' | 'right';
    behavior: 'hold_to_talk' | 'tap_to_toggle';
  };
}

// Example mobile interaction
const mobileFlow = {
  // User types with smart suggestions
  typing: "Can you ch",
  suggestions: [
    "check my calendar",
    "check for urgent emails",
    "change my 2pm meeting"
  ],

  // User taps suggestion
  selected: "check my calendar",

  // AI responds with rich cards
  response: {
    text: "You have 3 meetings today:",
    cards: [
      {
        type: 'meeting',
        title: '10am: Team Standup',
        subtitle: '15 min • Zoom',
        actions: ['Join', 'Reschedule']
      },
      {
        type: 'meeting',
        title: '2pm: Client Review',
        subtitle: '1 hour • Conference Room A',
        actions: ['Get directions', 'View agenda']
      }
    ]
  }
};
```

### Service Contracts (Conversational Wrapper)

```typescript
// Services are called by the conversational AI
export interface IEmailService {
  // Conversational interface wraps these
  sendEmail(params: SendEmailParams): Promise<EmailResult>;
  searchEmails(query: SearchQuery): Promise<Email[]>;
  draftEmail(params: DraftEmailParams): Promise<Draft>;

  // AI-specific methods
  summarizeThread(threadId: ThreadId): Promise<Summary>;
  suggestResponse(email: Email): Promise<ResponseSuggestion[]>;
  extractActionItems(email: Email): Promise<ActionItem[]>;
}

export interface ICalendarService {
  // Core operations
  scheduleEvent(params: ScheduleParams): Promise<Event>;
  findAvailability(params: AvailabilityParams): Promise<TimeSlot[]>;

  // AI-enhanced methods
  intelligentScheduling(
    request: string,          // Natural language request
    participants: Person[]
  ): Promise<SchedulingSuggestion[]>;

  suggestOptimalTime(
    event: EventParams,
    constraints: Constraint[]
  ): Promise<TimeSlot[]>;
}
```

### Integration Patterns

```typescript
// How the conversational AI orchestrates services
export interface IConversationalOrchestrator {
  async handleMessage(
    message: string,
    conversation: IConversation
  ): Promise<IResponse> {
    // 1. Understand what user wants
    const understanding = await this.understand(message, conversation.context);

    // 2. Check if clarification needed
    if (understanding.ambiguities?.length > 0) {
      return this.askClarification(understanding.ambiguities[0]);
    }

    // 3. Gather necessary information
    const data = await this.gatherData(understanding);

    // 4. Generate response with preview
    const response = await this.generateResponse(understanding, data);

    // 5. Add personalization
    const personalized = await this.personalize(response, conversation.userId);

    // 6. Add suggestions for next steps
    const withSuggestions = this.addSuggestions(personalized, conversation.context);

    return withSuggestions;
  }
}
```

### Performance Requirements (Conversational)

```typescript
const performanceRequirements = {
  conversation: {
    firstResponse: '<800ms',      // Initial response to message
    streamingStart: '<300ms',     // Start of streamed response
    fullResponse: '<2000ms',      // Complete response with preview
    contextLoad: '<100ms',        // Load conversation context
  },

  textInput: {
    keystrokeLatency: '<16ms',    // 60fps typing
    suggestionUpdate: '<100ms',   // Update suggestions as typing
    autoComplete: '<50ms',        // Inline completions
  },

  voiceToText: {
    startListening: '<100ms',     // Mic activation
    transcriptionLatency: '<500ms', // Chunks of transcription
    finalTranscript: '<1000ms',   // After stop speaking
  },

  actions: {
    previewGeneration: '<500ms',  // Generate action preview
    actionExecution: '<1000ms',   // Execute confirmed action
    undoWindow: '10000ms',        // 10 seconds to undo
  }
};
```

### Example Conversation Flows

```typescript
// Flow 1: Email Management
const emailFlow = {
  user: "I'm getting too many emails from vendors. Can you help me manage them better?",

  assistant: "I see you have 47 emails from various vendors this week. I notice 80% are promotional. Would you like me to:\n1. Create a filter to move vendor emails to a separate folder\n2. Unsubscribe from the promotional ones\n3. Set up a weekly digest of vendor communications\nWhat would be most helpful?",

  user: "Let's do the weekly digest",

  assistant: "I'll set up a weekly vendor digest for you. I'll:\n• Create a 'Vendors' label\n• Auto-archive vendor emails after capturing key info\n• Send you a summary every Friday at 9am with important updates and action items\n\nShould I apply this to existing vendor emails too?",

  user: "Yes please",

  assistant: "Done! I've processed 47 existing vendor emails and set up your weekly digest. You'll get your first summary this Friday. I've kept 3 emails in your inbox that need responses - would you like me to draft quick replies?"
};

// Flow 2: Meeting Scheduling
const schedulingFlow = {
  user: "I need to set up my quarterly reviews with the team",

  assistant: "I'll help you schedule quarterly reviews. Based on last quarter, you met with 6 direct reports for 1 hour each. Should I use the same list?",

  user: "Yes, but add Jennifer who just joined",

  assistant: "Got it, scheduling reviews with 7 people. Looking at everyone's calendars, I can fit all reviews between next Monday and Friday if we use these slots:\n• Mon: 2 slots available\n• Tue: 1 slot\n• Wed: 2 slots\n• Thu: 2 slots\n\nWould you prefer to spread them out over 2 weeks for better preparation time between reviews?",

  user: "One week is fine, book them",

  assistant: "I'm scheduling 7 quarterly reviews for next week. Each invite includes:\n• 1 hour duration\n• Your standard review agenda\n• Request for self-assessment\n\n[Preview of 7 calendar invites]\n\nShould I send these now?",

  user: "Perfect, send them"
};

// Flow 3: Complex Multi-Step Task
const complexFlow = {
  user: "The board meeting is next week and I'm behind on prep",

  assistant: "I see the board meeting is next Tuesday at 2pm. Let me help you prepare. Based on the agenda, you need:\n\n1. Q4 financial summary (your CFO sent this yesterday - I can summarize)\n2. Product roadmap update (3 emails from product team)\n3. Hiring update (HR dashboard shows 5 open roles)\n\nWhat would you like to tackle first?",

  user: "Start with the financial summary",

  assistant: "Here's the Q4 financial summary from your CFO:\n\n**Revenue**: $4.2M (+15% QoQ)\n**Key wins**: Enterprise deal closed, expansion revenue up 40%\n**Concerns**: OpEx up 20%, mainly from new hires\n\nThe CFO recommends highlighting the expansion revenue growth. Should I draft slides with these points?",

  user: "Yes, and flag any questions the board asked last time about finances",

  assistant: "Creating slides now. From last board meeting, they asked about:\n1. Customer acquisition cost trends (now answered in CFO's report)\n2. Path to profitability timeline (not addressed yet)\n3. R&D spend justification (partial data available)\n\nI'll add a slide addressing these. Should I request the missing data from your CFO?"
};
```

## 🧪 Test Cases for Conversational Text

```typescript
describe('Conversational AI', () => {
  it('should maintain context across multiple messages', async () => {
    const conversation = new Conversation();

    await conversation.send("What's on my calendar today?");
    expect(conversation.context.topic).toBe('calendar');

    await conversation.send("Move the 2pm to tomorrow");
    // Should understand "the 2pm" from context
    expect(conversation.lastAction.type).toBe('reschedule_meeting');
  });

  it('should handle ambiguity through clarification', async () => {
    const response = await ai.process("Schedule a meeting with Sarah");
    expect(response.type).toBe('clarification');
    expect(response.message).toContain('Which Sarah');
  });

  it('should learn preferences over time', async () => {
    // First time
    await ai.process("Schedule a meeting with John");
    expect(ai.response).toContain('What time works?');

    // After learning pattern
    await ai.process("Schedule a meeting with John");
    expect(ai.response).toContain('your usual 3pm Tuesday slot');
  });

  it('should work entirely through text', async () => {
    const flow = new TextOnlyFlow();
    flow.type("Check my email");
    expect(flow.response).toBeDefined();
    expect(flow.voiceUsed).toBe(false);
  });
});
```

## ✅ Key Deliverables

- [x] Conversational interface contracts (text-first)
- [x] Context management system
- [x] Natural language understanding (not commands)
- [x] Preview & confirmation flow
- [x] Personalization engine
- [x] Mobile text experience
- [x] Service orchestration patterns
- [x] Trust & safety mechanisms
- [x] Performance requirements

## 🎯 Why Conversational Text Works

1. **Natural Interaction** - People already know how to chat with AI
2. **Handles Complexity** - Multi-step tasks, ambiguity, context
3. **Builds Trust** - Preview, confirm, undo
4. **Works Everywhere** - Type in office, speak while driving
5. **Learns & Adapts** - Gets better over time
6. **$30 Price Point** - Accessible to broad market

## 💡 Key Principles

1. **Conversation Over Commands** - Natural dialogue beats memorizing syntax
2. **Text-First, Voice Optional** - Type anywhere, speak when convenient
3. **Preview Everything** - Build trust through transparency
4. **Learn Constantly** - Every interaction improves the experience
5. **Deep Integration** - Not just chat, but real actions in email/calendar

Remember: We're building **ChatGPT for productivity** - deeply integrated, action-oriented, and personalized.