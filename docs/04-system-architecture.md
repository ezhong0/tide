# System Architecture & Technical Design

## Architectural Overview

### High-Level Architecture Pattern: **Event-Driven Microservices with AI Orchestration**

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  iOS App     │  │ Android App  │  │   Web App    │      │
│  │  (React      │  │  (React      │  │  (Next.js)   │      │
│  │   Native)    │  │   Native)    │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓ WebSocket/REST
┌─────────────────────────────────────────────────────────────┐
│                       API Gateway                            │
│              (Kong / AWS API Gateway)                        │
│  - Authentication (JWT)                                      │
│  - Rate Limiting                                             │
│  - Request Routing                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Core Services (Node.js/TypeScript)        │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │ Command        │  │ Email          │  │ Calendar      │ │
│  │ Processor      │  │ Service        │  │ Service       │ │
│  │                │  │                │  │               │ │
│  │ - Voice-to-    │  │ - Gmail API    │  │ - Google Cal  │ │
│  │   Intent       │  │ - Outlook API  │  │ - Outlook Cal │ │
│  │ - GPT-5        │  │ - Sending      │  │ - Scheduling  │ │
│  │   Orchestrator │  │ - Monitoring   │  │ - Availability│ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │ Context        │  │ Learning       │  │ Notification  │ │
│  │ Engine         │  │ Engine         │  │ Service       │ │
│  │                │  │                │  │               │ │
│  │ - Semantic     │  │ - User Style   │  │ - Push        │ │
│  │   Search       │  │ - Preferences  │  │ - Email       │ │
│  │ - Thread       │  │ - Personalize  │  │ - In-app      │ │
│  │   Analysis     │  │                │  │               │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Message Queue (RabbitMQ/SQS)              │
│  - Async job processing                                      │
│  - Event streaming                                           │
│  - Retry logic                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    AI/ML Services                            │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │ GPT-5 API      │  │ Vector DB      │  │ Speech        │ │
│  │ (OpenAI)       │  │ (Pinecone/     │  │ (Whisper/     │ │
│  │                │  │  Weaviate)     │  │  Deepgram)    │ │
│  │ - Function     │  │                │  │               │ │
│  │   Calling      │  │ - Semantic     │  │ - STT         │ │
│  │ - Intent       │  │   Search       │  │ - TTS         │ │
│  │ - Drafting     │  │ - Embeddings   │  │               │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │ PostgreSQL     │  │ Redis          │  │ S3 / Cloud    │ │
│  │                │  │                │  │ Storage       │ │
│  │ - Users        │  │ - Sessions     │  │               │ │
│  │ - Commands     │  │ - Cache        │  │ - Email       │ │
│  │ - Preferences  │  │ - Rate Limits  │  │   Archives    │ │
│  │ - Audit Logs   │  │ - Pub/Sub      │  │ - Attachments │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

**Mobile Apps**
- **Framework**: React Native (iOS + Android single codebase)
- **State Management**: Zustand (lightweight, performant)
- **Navigation**: React Navigation
- **Voice Input**: expo-speech / react-native-voice
- **Offline**: WatermelonDB (local-first database)
- **UI Components**: Custom design system built on React Native Paper
- **Type Safety**: TypeScript strict mode

**Web App**
- **Framework**: Next.js 14 (App Router)
- **UI**: React + TailwindCSS
- **State Management**: Zustand
- **Real-time**: Socket.io client
- **Voice**: Web Speech API / Deepgram SDK
- **Type Safety**: TypeScript strict mode

### Backend

**Core Services** (Node.js/TypeScript)
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js with async/await patterns
- **API Style**: RESTful + WebSocket for real-time
- **Validation**: Zod schemas for all inputs/outputs
- **Testing**: Jest + Supertest
- **Type Safety**: TypeScript 5.0+ strict mode

**API Gateway**
- **Option A**: Kong (self-hosted, feature-rich)
- **Option B**: AWS API Gateway (managed, scalable)
- **Features**: Auth, rate limiting, request transformation

**Message Queue**
- **Option A**: RabbitMQ (self-hosted, reliable)
- **Option B**: AWS SQS + SNS (managed, scalable)
- **Use Cases**: Async jobs, event streaming, retries

### AI/ML Stack

**LLM Orchestration**
- **Primary**: OpenAI GPT-5 API (function calling)
- **Fallback**: Anthropic Claude 3.5 Sonnet (if GPT-5 issues)
- **Framework**: LangChain.js (for complex chains)
- **Prompt Management**: Helicone (observability + caching)

**Speech**
- **STT**: Deepgram Nova (fast, accurate)
- **TTS**: ElevenLabs (natural voice) / OpenAI TTS
- **Fallback**: Native device STT (offline mode)

**Vector Database**
- **Option A**: Pinecone (managed, easy)
- **Option B**: Weaviate (self-hosted, cheaper at scale)
- **Use Case**: Semantic email search, context retrieval

**Embeddings**
- **Model**: OpenAI text-embedding-3-large
- **Dimension**: 3072 (high quality for semantic search)

### Data Layer

**Primary Database**
- **DB**: PostgreSQL 16 (ACID compliance, reliability)
- **ORM**: Drizzle ORM (type-safe, performant)
- **Hosting**: AWS RDS / Supabase (managed)
- **Migrations**: Drizzle Kit

**Caching & Sessions**
- **Cache**: Redis 7 (in-memory, fast)
- **Use Cases**: Session storage, rate limiting, pub/sub, cache
- **Hosting**: AWS ElastiCache / Upstash (serverless option)

**Object Storage**
- **Storage**: AWS S3 (reliable, cheap)
- **Use Cases**: Email archives, attachments, backups
- **CDN**: CloudFront (fast global delivery)

### Infrastructure

**Hosting**
- **Option A**: AWS (ECS Fargate for containers, RDS, S3, etc.)
- **Option B**: Railway (simpler, faster to start)
- **Frontend**: Vercel (Next.js) + Expo EAS (mobile)

**Monitoring**
- **APM**: Sentry (error tracking)
- **Logging**: Axiom / DataDog (structured logs)
- **Metrics**: Prometheus + Grafana / DataDog
- **Uptime**: BetterStack (status page + alerts)

**CI/CD**
- **Pipeline**: GitHub Actions
- **Testing**: Jest (unit), Playwright (e2e)
- **Deployment**: Docker containers → ECS/Railway
- **Mobile**: Expo EAS Build & Submit

---

## Service Architecture Details

### 1. Command Processor Service

**Responsibility**: Convert voice input → executed action

#### Key Components

```typescript
// src/services/command-processor/index.ts

class CommandProcessorService {
  async processVoiceCommand(userId: string, audioInput: Buffer): Promise<CommandResult> {
    // 1. Speech to Text
    const transcript = await this.speechService.transcribe(audioInput);

    // 2. Intent Classification (GPT-5)
    const intent = await this.classifyIntent(transcript, userId);

    // 3. Function Orchestration
    const result = await this.orchestrateFunctions(intent, userId);

    // 4. User Approval (if needed)
    if (result.requiresApproval) {
      return { status: 'pending_approval', draft: result.draft };
    }

    // 5. Execute Action
    return await this.executeAction(result, userId);
  }

  async classifyIntent(transcript: string, userId: string): Promise<Intent> {
    const context = await this.contextEngine.getUserContext(userId);

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: INTENT_CLASSIFICATION_PROMPT },
        { role: "user", content: transcript }
      ],
      tools: AVAILABLE_TOOLS, // Function definitions
      tool_choice: "auto",
      // GPT-5 specific params
      parallel_tool_calls: true,
      custom_tools: customToolDefinitions
    });

    return parseIntentFromResponse(response);
  }

  async orchestrateFunctions(intent: Intent, userId: string): Promise<ActionPlan> {
    const functionCalls = intent.toolCalls;

    // Determine if parallel or sequential
    const { parallel, sequential } = this.analyzeDependencies(functionCalls);

    // Execute parallel calls
    const parallelResults = await Promise.all(
      parallel.map(call => this.executeToolCall(call, userId))
    );

    // Execute sequential calls
    const sequentialResults = [];
    for (const call of sequential) {
      const result = await this.executeToolCall(call, userId, sequentialResults);
      sequentialResults.push(result);
    }

    return this.buildActionPlan([...parallelResults, ...sequentialResults]);
  }
}
```

#### Function Definitions (Zod Schemas)

```typescript
// src/services/command-processor/tools.ts

import { z } from 'zod';

export const CheckCalendarSchema = z.object({
  name: z.literal('check_calendar'),
  description: z.string(),
  parameters: z.object({
    timeframe: z.enum(['today', 'tomorrow', 'this_week', 'next_week', 'date_range']),
    duration_minutes: z.number().optional(),
    time_of_day: z.enum(['morning', 'lunch', 'afternoon', 'evening']).optional(),
    participants: z.array(z.string().email()).optional(),
    date_range: z.object({
      start: z.string().datetime(),
      end: z.string().datetime()
    }).optional()
  })
});

export const DraftEmailSchema = z.object({
  name: z.literal('draft_email'),
  description: z.string(),
  parameters: z.object({
    recipients: z.array(z.string().email()),
    message_intent: z.enum(['inform', 'request_meeting', 'provide_update', 'ask_question']),
    key_points: z.array(z.string()),
    tone: z.enum(['professional', 'casual', 'friendly', 'formal']),
    in_reply_to: z.string().optional(), // thread_id
    cc: z.array(z.string().email()).optional()
  })
});

// Convert Zod schemas to OpenAI function format
export const AVAILABLE_TOOLS = [
  zodToOpenAIFunction(CheckCalendarSchema),
  zodToOpenAIFunction(DraftEmailSchema),
  zodToOpenAIFunction(SendEmailSchema),
  zodToOpenAIFunction(CreateCalendarEventSchema),
  zodToOpenAIFunction(SearchEmailSemanticSchema),
  // ... more tools
];
```

---

### 2. Email Service

**Responsibility**: Email integration (Gmail, Outlook), sending, monitoring

#### Architecture

```typescript
// src/services/email/index.ts

interface EmailProvider {
  sendEmail(params: SendEmailParams): Promise<EmailResult>;
  searchEmails(query: SearchQuery): Promise<Email[]>;
  getThread(threadId: string): Promise<EmailThread>;
  monitorThread(threadId: string, callback: (email: Email) => void): void;
}

class GmailProvider implements EmailProvider {
  private gmail: gmail_v1.Gmail;

  constructor(credentials: OAuth2Credentials) {
    const auth = new google.auth.OAuth2(/*...*/);
    auth.setCredentials(credentials);
    this.gmail = google.gmail({ version: 'v1', auth });
  }

  async sendEmail(params: SendEmailParams): Promise<EmailResult> {
    const raw = this.createMimeMessage(params);

    const result = await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw }
    });

    // Store in audit log
    await db.emailLog.create({
      userId: params.userId,
      messageId: result.data.id,
      action: 'sent',
      recipients: params.to,
      subject: params.subject,
      timestamp: new Date()
    });

    return { success: true, messageId: result.data.id };
  }

  async monitorThread(threadId: string, callback: (email: Email) => void): Promise<void> {
    // Use Gmail Push Notifications (Pub/Sub)
    await this.gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName: `projects/${PROJECT_ID}/topics/gmail-notifications`,
        labelIds: ['INBOX']
      }
    });

    // Store callback in Redis for when notification arrives
    await redis.set(`thread:monitor:${threadId}`, JSON.stringify({ callback, threadId }));
  }
}

class OutlookProvider implements EmailProvider {
  // Similar implementation using Microsoft Graph API
}

// Factory pattern for provider selection
class EmailService {
  async getProvider(userId: string): Promise<EmailProvider> {
    const user = await db.user.findUnique({ where: { id: userId } });

    if (user.emailProvider === 'gmail') {
      return new GmailProvider(user.gmailCredentials);
    } else if (user.emailProvider === 'outlook') {
      return new OutlookProvider(user.outlookCredentials);
    }

    throw new Error('Unsupported email provider');
  }

  async sendEmail(userId: string, params: SendEmailParams): Promise<EmailResult> {
    const provider = await this.getProvider(userId);
    return provider.sendEmail(params);
  }
}
```

---

### 3. Calendar Service

**Responsibility**: Calendar integration, availability checking, scheduling

```typescript
// src/services/calendar/index.ts

class CalendarService {
  async checkAvailability(
    userId: string,
    params: AvailabilityParams
  ): Promise<TimeSlot[]> {
    const provider = await this.getProvider(userId);

    const events = await provider.getEvents({
      start: params.timeframe.start,
      end: params.timeframe.end
    });

    // Find free slots
    const freeSlots = this.calculateFreeSlots(
      events,
      params.duration_minutes,
      params.time_of_day
    );

    return freeSlots;
  }

  async findOverlappingSlots(
    userIds: string[],
    params: AvailabilityParams
  ): Promise<TimeSlot[]> {
    // Get availability for all users in parallel
    const availabilities = await Promise.all(
      userIds.map(id => this.checkAvailability(id, params))
    );

    // Find overlapping free slots
    return this.findOverlaps(availabilities);
  }

  async createEvent(userId: string, params: CreateEventParams): Promise<CalendarEvent> {
    const provider = await this.getProvider(userId);

    const event = await provider.createEvent({
      summary: params.title,
      start: { dateTime: params.start_time },
      end: { dateTime: this.calculateEndTime(params.start_time, params.duration_minutes) },
      attendees: params.attendees.map(email => ({ email })),
      sendNotifications: params.send_invites
    });

    // Emit event for other services
    await eventBus.publish('calendar.event.created', { userId, event });

    return event;
  }

  async optimizeCalendar(userId: string, date: Date): Promise<OptimizationSuggestion[]> {
    const events = await this.getEventsForDay(userId, date);

    const issues = this.analyzeCalendarHealth(events);
    const suggestions = this.generateOptimizations(issues, events);

    return suggestions;
  }

  private analyzeCalendarHealth(events: CalendarEvent[]): CalendarIssue[] {
    const issues: CalendarIssue[] = [];

    // Check for back-to-back meetings
    for (let i = 0; i < events.length - 1; i++) {
      const current = events[i];
      const next = events[i + 1];

      if (current.end.getTime() === next.start.getTime()) {
        issues.push({
          type: 'back_to_back',
          events: [current, next],
          severity: 'medium'
        });
      }
    }

    // Check for no lunch break
    const lunchSlot = events.find(e =>
      e.start.getHours() >= 12 && e.start.getHours() < 14
    );
    if (lunchSlot) {
      issues.push({
        type: 'no_lunch_break',
        severity: 'high'
      });
    }

    return issues;
  }
}
```

---

### 4. Context Engine

**Responsibility**: Semantic search, context retrieval, understanding user intent

```typescript
// src/services/context-engine/index.ts

class ContextEngineService {
  private vectorDB: VectorDatabase;

  async indexEmail(email: Email): Promise<void> {
    // Generate embedding for email content
    const embedding = await this.generateEmbedding(
      `${email.subject} ${email.body} ${email.from}`
    );

    // Store in vector DB
    await this.vectorDB.upsert({
      id: email.id,
      values: embedding,
      metadata: {
        userId: email.userId,
        subject: email.subject,
        from: email.from,
        to: email.to,
        date: email.date.toISOString(),
        snippet: email.body.substring(0, 200)
      }
    });
  }

  async semanticSearch(
    userId: string,
    query: string,
    limit: number = 5
  ): Promise<EmailSearchResult[]> {
    const queryEmbedding = await this.generateEmbedding(query);

    const results = await this.vectorDB.query({
      vector: queryEmbedding,
      filter: { userId },
      topK: limit,
      includeMetadata: true
    });

    return results.matches.map(match => ({
      email: match.metadata,
      score: match.score
    }));
  }

  async getUserContext(userId: string): Promise<UserContext> {
    // Aggregate user's recent activity, preferences, patterns
    const [recentCommands, preferences, frequentContacts] = await Promise.all([
      db.command.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 10
      }),
      db.userPreferences.findUnique({ where: { userId } }),
      this.getFrequentContacts(userId)
    ]);

    return {
      userId,
      recentActivity: recentCommands,
      preferences,
      frequentContacts,
      communicationStyle: await this.analyzeCommStyle(userId)
    };
  }

  async analyzeCommStyle(userId: string): Promise<CommunicationStyle> {
    // Analyze user's sent emails to learn their style
    const sentEmails = await db.email.findMany({
      where: { userId, direction: 'sent' },
      orderBy: { date: 'desc' },
      take: 50
    });

    // Use GPT to analyze style
    const analysis = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "Analyze these emails and determine the user's communication style, tone preferences, common phrases, and signature style."
        },
        {
          role: "user",
          content: JSON.stringify(sentEmails.map(e => ({
            to: e.to,
            subject: e.subject,
            body: e.body
          })))
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(analysis.choices[0].message.content);
  }

  async getMeetingContext(meetingId: string): Promise<MeetingContext> {
    const meeting = await db.calendarEvent.findUnique({
      where: { id: meetingId },
      include: { attendees: true }
    });

    // Get previous meeting with same attendees
    const previousMeeting = await db.calendarEvent.findFirst({
      where: {
        attendees: { some: { email: { in: meeting.attendees.map(a => a.email) } } },
        start: { lt: meeting.start },
        id: { not: meetingId }
      },
      orderBy: { start: 'desc' },
      include: { notes: true }
    });

    // Get recent emails with attendees
    const recentEmails = await this.searchEmailsWithParticipants(
      meeting.userId,
      meeting.attendees.map(a => a.email),
      7 // last 7 days
    );

    return {
      meeting,
      previousMeeting,
      recentEmails,
      suggestedTopics: await this.generateMeetingTopics(meeting, previousMeeting, recentEmails)
    };
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
      dimensions: 3072
    });

    return response.data[0].embedding;
  }
}
```

---

### 5. Learning Engine

**Responsibility**: Personalization, learning user preferences, improving over time

```typescript
// src/services/learning-engine/index.ts

class LearningEngineService {
  async recordFeedback(
    userId: string,
    commandId: string,
    feedback: Feedback
  ): Promise<void> {
    await db.feedback.create({
      data: {
        userId,
        commandId,
        type: feedback.type, // 'edit', 'approve', 'reject'
        changes: feedback.changes, // what user edited
        timestamp: new Date()
      }
    });

    // Update user model
    await this.updateUserModel(userId, feedback);
  }

  async updateUserModel(userId: string, feedback: Feedback): Promise<void> {
    const userModel = await db.userModel.findUnique({ where: { userId } });

    // Analyze feedback to update preferences
    if (feedback.type === 'edit' && feedback.changes.includes('tone')) {
      // User changed tone -> update tone preference
      const newTone = this.extractToneFromEdit(feedback.changes);
      await db.userPreferences.update({
        where: { userId },
        data: {
          defaultTone: newTone,
          toneConfidence: userModel.toneConfidence + 0.1
        }
      });
    }

    // Track contact-specific preferences
    if (feedback.commandType === 'email_draft') {
      const recipient = feedback.metadata.recipient;
      await this.updateContactPreferences(userId, recipient, feedback);
    }
  }

  async getPersonalizedDraftStyle(
    userId: string,
    recipient: string
  ): Promise<DraftStyle> {
    // Check for contact-specific preferences
    const contactPref = await db.contactPreferences.findFirst({
      where: { userId, contactEmail: recipient }
    });

    if (contactPref) {
      return contactPref.style;
    }

    // Fallback to user's default
    const userPref = await db.userPreferences.findUnique({ where: { userId } });
    return userPref.defaultStyle;
  }

  async predictUserIntent(userId: string, partialInput: string): Promise<IntentPrediction[]> {
    // Get user's command history
    const history = await db.command.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    // Find patterns
    const patterns = this.analyzeCommandPatterns(history);

    // Predict likely completions
    return patterns
      .filter(p => p.trigger.startsWith(partialInput))
      .map(p => ({
        intent: p.intent,
        confidence: p.frequency / history.length
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }
}
```

---

## Data Models

### Database Schema (Drizzle ORM)

```typescript
// src/db/schema.ts

import { pgTable, uuid, text, timestamp, jsonb, boolean, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  emailProvider: text('email_provider').notNull(), // 'gmail' | 'outlook'
  emailCredentials: jsonb('email_credentials').notNull(), // encrypted
  calendarProvider: text('calendar_provider').notNull(),
  calendarCredentials: jsonb('calendar_credentials').notNull(), // encrypted
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastActiveAt: timestamp('last_active_at').notNull().defaultNow()
});

export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  defaultTone: text('default_tone').notNull().default('professional'),
  emailSignature: text('email_signature').notNull(),
  autoAcceptMeetings: boolean('auto_accept_meetings').notNull().default(false),
  autoRespondSimple: boolean('auto_respond_simple').notNull().default(false),
  notificationPreferences: jsonb('notification_preferences').notNull(),
  vipContacts: jsonb('vip_contacts').notNull().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const commands = pgTable('commands', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  transcript: text('transcript').notNull(),
  intent: text('intent').notNull(),
  intentData: jsonb('intent_data').notNull(),
  status: text('status').notNull(), // 'pending' | 'processing' | 'completed' | 'failed'
  result: jsonb('result'),
  error: text('error'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  completedAt: timestamp('completed_at')
});

export const emails = pgTable('emails', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  externalId: text('external_id').notNull(), // Gmail/Outlook message ID
  threadId: text('thread_id').notNull(),
  direction: text('direction').notNull(), // 'sent' | 'received'
  from: text('from').notNull(),
  to: jsonb('to').notNull(), // array of emails
  cc: jsonb('cc'),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  snippet: text('snippet').notNull(),
  labels: jsonb('labels'),
  date: timestamp('date').notNull(),
  indexed: boolean('indexed').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const calendarEvents = pgTable('calendar_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  externalId: text('external_id').notNull(), // Google/Outlook event ID
  title: text('title').notNull(),
  description: text('description'),
  start: timestamp('start').notNull(),
  end: timestamp('end').notNull(),
  attendees: jsonb('attendees').notNull(), // array of {email, name, status}
  location: text('location'),
  isAllDay: boolean('is_all_day').notNull().default(false),
  status: text('status').notNull(), // 'confirmed' | 'tentative' | 'cancelled'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const drafts = pgTable('drafts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  commandId: uuid('command_id').notNull().references(() => commands.id),
  type: text('type').notNull(), // 'email' | 'meeting_request'
  content: jsonb('content').notNull(),
  status: text('status').notNull(), // 'pending_review' | 'approved' | 'rejected' | 'edited' | 'sent'
  userEdits: jsonb('user_edits'), // track what user changed
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const followUps = pgTable('follow_ups', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  emailThreadId: text('email_thread_id').notNull(),
  followUpAt: timestamp('follow_up_at').notNull(),
  status: text('status').notNull(), // 'active' | 'completed' | 'cancelled'
  followUpAction: text('follow_up_action').notNull(), // 'notify' | 'draft_reminder' | 'auto_send'
  followUpMessage: text('follow_up_message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at')
});

export const feedback = pgTable('feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  commandId: uuid('command_id').notNull().references(() => commands.id),
  feedbackType: text('feedback_type').notNull(), // 'approve' | 'edit' | 'reject'
  changes: jsonb('changes'), // what user changed
  timestamp: timestamp('timestamp').notNull().defaultNow()
});

export const contactPreferences = pgTable('contact_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  contactEmail: text('contact_email').notNull(),
  preferredTone: text('preferred_tone').notNull(),
  relationshipType: text('relationship_type'), // 'colleague' | 'client' | 'friend' | 'boss'
  customInstructions: text('custom_instructions'),
  interactionCount: integer('interaction_count').notNull().default(0),
  lastInteraction: timestamp('last_interaction').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(), // 'email' | 'calendar_event' | 'command'
  entityId: text('entity_id').notNull(),
  metadata: jsonb('metadata'),
  timestamp: timestamp('timestamp').notNull().defaultNow()
});
```

---

## Data Flow Examples

### Flow 1: Voice Command → Meeting Scheduled

```
1. User speaks: "Schedule lunch with Sarah next week"
   ↓
2. Mobile app → Speech-to-Text (Deepgram) → Transcript
   ↓
3. Mobile app → WebSocket → Command Processor Service
   ↓
4. Command Processor → GPT-5 API (intent classification)
   Response: {
     intent: "schedule_meeting",
     tools: [
       { name: "check_calendar", params: {...} },
       { name: "draft_meeting_request", params: {...} }
     ]
   }
   ↓
5. Command Processor → Parallel Execution:
   - Calendar Service → Check user availability (next week, lunch time)
   - Context Engine → Get relationship with Sarah (casual tone)
   ↓
6. Command Processor → Email Service → Draft email with times
   ↓
7. Command Processor → WebSocket → Mobile app
   Shows draft for user approval
   ↓
8. User approves → "Send it"
   ↓
9. Email Service → Gmail API → Send email
   ↓
10. Email Service → Follow-up Service → Monitor thread for response
   ↓
11. (Later) Sarah replies with time
    ↓
12. Gmail Webhook → Pub/Sub → Email Service
    ↓
13. Email Service → Command Processor → GPT-5 → Extract chosen time
    ↓
14. Calendar Service → Create event for both calendars
    ↓
15. Email Service → Send confirmation email
    ↓
16. Notification Service → Push to user: "Lunch with Sarah confirmed Wed 1pm"
```

### Flow 2: Context Retrieval

```
1. User asks: "What did John say about Q4 timeline?"
   ↓
2. Command Processor → GPT-5 → Intent: semantic_search
   ↓
3. Context Engine → Generate query embedding
   ↓
4. Context Engine → Vector DB → Search (user's emails, participant: John, semantic: "Q4 timeline")
   ↓
5. Vector DB returns top 3 matches with scores
   ↓
6. Context Engine → Fetch full email content from PostgreSQL
   ↓
7. Context Engine → GPT-5 → Summarize relevant parts
   ↓
8. Return answer with source citations to user
```

---

## Security & Privacy

### Authentication & Authorization

```typescript
// src/middleware/auth.ts

import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWTPayloadSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  iat: z.number(),
  exp: z.number()
});

export async function authenticateRequest(req: Request): Promise<User> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new UnauthorizedError('No token provided');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!);
  const payload = JWTPayloadSchema.parse(decoded);

  const user = await db.user.findUnique({ where: { id: payload.userId } });

  if (!user) {
    throw new UnauthorizedError('Invalid token');
  }

  return user;
}
```

### Data Encryption

**At Rest**:
- Email credentials: AES-256-GCM encryption with user-specific keys
- Stored emails: Not encrypted (searchable), but access-controlled
- Backups: Encrypted with rotating keys

**In Transit**:
- All API calls: HTTPS/TLS 1.3
- WebSocket: WSS (TLS)
- Internal services: mTLS (mutual TLS)

### Sensitive Data Handling

```typescript
// src/utils/encryption.ts

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes

export function encryptCredentials(credentials: any, userId: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(credentials), 'utf8'),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  // Return: iv + authTag + encrypted (all base64)
  return JSON.stringify({
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    encrypted: encrypted.toString('base64'),
    userId // for key derivation
  });
}

export function decryptCredentials(encryptedData: string): any {
  const { iv, authTag, encrypted } = JSON.parse(encryptedData);

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(iv, 'base64')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'base64')),
    decipher.final()
  ]);

  return JSON.parse(decrypted.toString('utf8'));
}
```

### Compliance

- **SOC 2 Type II**: Implement controls, annual audit
- **GDPR**: Data deletion, export, consent management
- **CCPA**: California privacy rights
- **Data Retention**: 90-day retention policy (configurable)

---

## Scalability Considerations

### Horizontal Scaling

**Stateless Services**:
- All core services are stateless (session in Redis)
- Can scale to N instances behind load balancer
- Auto-scaling based on CPU/memory metrics

**Database**:
- PostgreSQL read replicas for read-heavy queries
- Connection pooling (PgBouncer)
- Sharding strategy (if >10M users): Shard by userId hash

**Caching Strategy**:
```typescript
// Multilevel caching
// L1: In-memory (Node.js app)
// L2: Redis (shared)
// L3: Database

async function getCachedUserPreferences(userId: string): Promise<UserPreferences> {
  // L1: Check in-memory cache
  const memCached = inMemoryCache.get(`user:${userId}:prefs`);
  if (memCached) return memCached;

  // L2: Check Redis
  const redisCached = await redis.get(`user:${userId}:prefs`);
  if (redisCached) {
    const parsed = JSON.parse(redisCached);
    inMemoryCache.set(`user:${userId}:prefs`, parsed, 60); // 1 min TTL
    return parsed;
  }

  // L3: Database
  const dbValue = await db.userPreferences.findUnique({ where: { userId } });

  // Store in caches
  await redis.setex(`user:${userId}:prefs`, 3600, JSON.stringify(dbValue)); // 1 hour
  inMemoryCache.set(`user:${userId}:prefs`, dbValue, 60);

  return dbValue;
}
```

### Rate Limiting

```typescript
// src/middleware/rate-limit.ts

import { RateLimiterRedis } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rl',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60 * 10 // Block for 10 minutes if exceeded
});

export async function rateLimitMiddleware(req: Request): Promise<void> {
  const userId = req.user.id;

  try {
    await rateLimiter.consume(userId);
  } catch (rejRes) {
    throw new TooManyRequestsError('Rate limit exceeded');
  }
}

// Different limits for different tiers
const tierLimits = {
  free: { points: 50, duration: 60 },
  pro: { points: 200, duration: 60 },
  enterprise: { points: 1000, duration: 60 }
};
```

### Cost Optimization

**GPT-5 API**:
- Cache common intents (Redis, 1 hour TTL)
- Use cheaper model for classification, GPT-5 only for complex tasks
- Implement prompt caching (Helicone)
- Budget: $0.02 per command avg → $1/user/month at 50 commands

**Vector DB**:
- Index only recent emails (90 days) for semantic search
- Archive older to cheaper storage
- Budget: $0.10/user/month (Pinecone)

**Infrastructure**:
- Use spot instances for non-critical workloads
- Auto-scale down during off-hours
- CDN for static assets
- Budget: $5/user/month at scale

---

## Monitoring & Observability

### Key Metrics

```typescript
// src/utils/metrics.ts

import { Counter, Histogram, Gauge } from 'prom-client';

// Business Metrics
export const commandsProcessed = new Counter({
  name: 'tide_commands_processed_total',
  help: 'Total number of voice commands processed',
  labelNames: ['intent', 'status']
});

export const commandLatency = new Histogram({
  name: 'tide_command_latency_seconds',
  help: 'Command processing latency',
  labelNames: ['intent'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

export const activeUsers = new Gauge({
  name: 'tide_active_users',
  help: 'Number of active users',
  labelNames: ['timeframe'] // 'daily', 'weekly', 'monthly'
});

// Technical Metrics
export const apiRequestDuration = new Histogram({
  name: 'api_request_duration_seconds',
  help: 'API request duration',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

export const gptApiCalls = new Counter({
  name: 'gpt_api_calls_total',
  help: 'Total GPT API calls',
  labelNames: ['model', 'status']
});

export const gptTokensUsed = new Counter({
  name: 'gpt_tokens_used_total',
  help: 'Total GPT tokens consumed',
  labelNames: ['model', 'type'] // 'prompt' | 'completion'
});
```

### Error Tracking

```typescript
// src/utils/error-tracking.ts

import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Scrub sensitive data
    if (event.request) {
      delete event.request.cookies;
      if (event.request.headers) {
        delete event.request.headers['Authorization'];
      }
    }
    return event;
  }
});

export function captureError(error: Error, context?: any): void {
  Sentry.captureException(error, {
    extra: context,
    tags: {
      service: 'tide-backend'
    }
  });
}
```

### Logging

```typescript
// src/utils/logger.ts

import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label })
  },
  redact: {
    paths: ['email', 'password', 'credentials', 'token'],
    remove: true
  },
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined
});

// Structured logging
logger.info({
  userId: 'user-123',
  commandId: 'cmd-456',
  intent: 'schedule_meeting'
}, 'Processing command');
```

---

## Disaster Recovery

### Backup Strategy

```yaml
# Daily backups
PostgreSQL:
  - Full backup: Daily at 2am UTC
  - Point-in-time recovery: Enabled (WAL archiving)
  - Retention: 30 days
  - Cross-region replication: Yes

Redis:
  - RDB snapshots: Every 6 hours
  - AOF: Enabled (every second)
  - Retention: 7 days

S3:
  - Versioning: Enabled
  - Cross-region replication: Yes
  - Lifecycle: Archive to Glacier after 90 days
```

### Failover Procedures

1. **Database Failover** (RTO: 5 minutes):
   - Primary fails → Automatic promotion of read replica
   - DNS update to new primary
   - Application reconnects automatically

2. **Service Failover** (RTO: 2 minutes):
   - Health checks detect failure
   - Load balancer removes unhealthy instance
   - Auto-scaling launches replacement

3. **Region Failover** (RTO: 30 minutes):
   - Manual trigger or automated based on region health
   - Traffic routed to secondary region
   - Data sync from backups/replication

---

## Development Workflow

### Local Development Setup

```bash
# Clone repo
git clone https://github.com/your-org/tide.git
cd tide

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Fill in: DATABASE_URL, REDIS_URL, OPENAI_API_KEY, etc.

# Start infrastructure (Docker Compose)
docker-compose up -d postgres redis

# Run database migrations
pnpm db:migrate

# Seed development data
pnpm db:seed

# Start development servers
pnpm dev # Starts all services + frontend
```

### Testing Strategy

```typescript
// Unit Tests (Jest)
// src/services/__tests__/command-processor.test.ts

describe('CommandProcessorService', () => {
  it('should classify intent correctly', async () => {
    const service = new CommandProcessorService();
    const intent = await service.classifyIntent(
      "Schedule lunch with Sarah next week",
      "user-123"
    );

    expect(intent.intent).toBe('schedule_meeting');
    expect(intent.entities.participant).toBe('Sarah');
    expect(intent.entities.timeframe).toBe('next week');
  });
});

// Integration Tests (Supertest)
// src/__tests__/integration/api.test.ts

describe('POST /api/commands', () => {
  it('should process voice command end-to-end', async () => {
    const response = await request(app)
      .post('/api/commands')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        transcript: "Schedule lunch with Sarah next week"
      })
      .expect(200);

    expect(response.body.status).toBe('pending_approval');
    expect(response.body.draft).toBeDefined();
  });
});

// E2E Tests (Playwright)
// e2e/voice-command.spec.ts

test('user can schedule meeting via voice', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="voice-button"]');
  await page.fill('[data-testid="voice-input"]',
    'Schedule lunch with Sarah next week'
  );
  await page.click('[data-testid="send-command"]');

  await expect(page.locator('[data-testid="draft-preview"]'))
    .toContainText('Sarah');

  await page.click('[data-testid="approve-button"]');

  await expect(page.locator('[data-testid="success-message"]'))
    .toBeVisible();
});
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml

name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install

      - run: pnpm lint

      - run: pnpm type-check

      - run: pnpm test:unit

      - run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/tide_test
          REDIS_URL: redis://localhost:6379

      - run: pnpm build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to production
        run: |
          # Build Docker images
          docker build -t tide-api:${{ github.sha }} .

          # Push to registry
          docker push tide-api:${{ github.sha }}

          # Deploy to ECS/Railway
          # ... deployment commands
```

---

## Performance Targets

### API Latency (p95)
- Voice command processing: < 3s
- Email search: < 500ms
- Calendar availability: < 300ms
- Draft generation: < 2s

### Throughput
- 1000 concurrent users per instance
- 10,000 commands/minute per cluster
- 100,000 emails indexed/hour

### Availability
- **Uptime SLA**: 99.9% (43 minutes downtime/month)
- **Data durability**: 99.999999999% (11 nines)
- **RPO (Recovery Point Objective)**: < 1 minute
- **RTO (Recovery Time Objective)**: < 5 minutes
