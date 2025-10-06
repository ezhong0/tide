# 🌊 Tide - Your Conversational AI Assistant

> ChatGPT that actually manages your work life - $30/month

## What is Tide?

Tide is a **conversational AI assistant** that handles your email, calendar, and tasks through natural text conversation. Unlike ChatGPT, Tide can take real actions. Unlike Siri, it works everywhere professionals actually work.

**Just type** (or speak - we'll convert to text):
- "Schedule a meeting with Sarah next week"
- "Draft a response to John's proposal"
- "What's my day look like?"
- "Move my 3pm to tomorrow"
- "Find that contract from last month"

**Tide shows you what it will do, then does it.** Full transparency. Full control.

## Why Tide Exists

**The Problem:**
- Knowledge workers waste 2+ hours daily on email/calendar
- Voice assistants don't work in offices (too disruptive)
- ChatGPT can't actually do anything
- Human assistants cost $5,000+/month

**The Solution:**
- Natural text conversation (works everywhere)
- Real actions on your actual email/calendar
- See and edit before anything happens
- Just $30/month

## Core Features

### 📧 Email Management
- Intelligent drafting with your tone
- Smart categorization and prioritization
- Automatic follow-up tracking
- Meeting extraction and scheduling

### 📅 Calendar Intelligence
- Natural language scheduling
- Conflict detection and resolution
- Time zone management
- Meeting preparation automation

### ✅ Task Orchestration
- Complex multi-step workflows
- Deadline tracking and reminders
- Priority management
- Progress reporting

### 🧠 Learning & Personalization
- Learns your communication style
- Remembers important contacts
- Adapts to your preferences
- Improves with every interaction

## How It Works

1. **You type** naturally, like messaging a colleague
2. **Tide understands** and shows what it will do
3. **You confirm** (or edit) the action
4. **Tide executes** and updates you on progress

```
You: "Can you find a time for me to meet with the product team next week?"

Tide: "I'll check calendars for you and the product team (John, Maria, David).
Looking at next week...

Found these options where everyone is free:
📅 Monday 2-3pm
📅 Tuesday 10-11am
📅 Thursday 3-4pm

Which works best for you?"

You: "Tuesday at 10"

Tide: "Perfect! Here's the meeting I'll create:

Product Team Sync
Tuesday, Jan 16, 10:00-11:00am
Attendees: You, John, Maria, David
Location: Conference Room A

Should I add an agenda or Zoom link?"

You: "Add zoom"

Tide: "✓ Meeting created with Zoom link! Invites sent to all attendees."
```

## Technology Stack

### Core Architecture
- **Interface**: React Native (iOS/Android), Next.js (Web)
- **AI Engine**: GPT-4 + Claude for understanding, Mixtral for speed
- **Backend**: Node.js with event sourcing architecture
- **Database**: PostgreSQL with pgvector for semantic search
- **Infrastructure**: Edge computing for <200ms responses

### Key Innovations
- **Conversational Context Manager**: Maintains conversation state
- **Action Preview System**: Shows before doing
- **Trust Layer**: All actions reviewable and reversible
- **Learning Engine**: Personalizes to each user

## Getting Started

### For Users

1. **Sign up** at [tide.ai](https://tide.ai)
2. **Connect** your email and calendar (Gmail, Outlook, Google Calendar)
3. **Start chatting** - just type what you need
4. **7-day free trial**, then $30/month

### For Developers

```bash
# Clone the repository
git clone https://github.com/tide-ai/tide.git

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Run development server
pnpm dev

# Run tests
pnpm test
```

## Project Structure

```
/
├── apps/
│   ├── web/          # Next.js web application
│   ├── mobile/       # React Native mobile app
│   └── api/          # Core API service
├── packages/
│   ├── contracts/    # TypeScript interfaces
│   ├── conversation/ # Conversation engine
│   ├── actions/      # Action execution layer
│   └── ai/          # AI integration layer
├── docs/
│   ├── modules/      # Module documentation
│   └── architecture/ # System design docs
└── infrastructure/   # Deployment configs
```

## Documentation

- [Architecture Overview](./docs/STREAMLINED-ARCHITECTURE-FINAL.md)
- [Business Strategy](./docs/BUSINESS-STRATEGY-TEXT-FIRST.md)
- [Module Documentation](./docs/modules/)
- [Complex Task Handling](./docs/COMPLEX-TASK-ARCHITECTURE.md)

## Roadmap

### Phase 1: Foundation (Weeks 1-4) ✅
- [x] Core conversation engine
- [x] Natural language understanding
- [x] Action preview system
- [x] Basic email/calendar integration

### Phase 2: Integration (Weeks 5-8) 🚧
- [ ] Gmail/Outlook deep integration
- [ ] Google Calendar/Outlook Calendar
- [ ] Contact management
- [ ] File search capabilities

### Phase 3: Intelligence (Weeks 9-12) 📅
- [ ] Learning system
- [ ] Personalization engine
- [ ] Complex task orchestration
- [ ] Proactive suggestions

### Phase 4: Launch (Weeks 13-16) 📅
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Beta testing program
- [ ] Public launch

## Pricing

- **Free Trial**: 7 days, full features
- **Professional**: $30/month
- **Team**: $25/user/month (5+ seats)
- **Enterprise**: Custom pricing

## Security & Privacy

- **End-to-end encryption** for sensitive data
- **SOC 2 Type II** compliance (in progress)
- **GDPR compliant** with data controls
- **Your data is yours** - export anytime

## Support

- 📧 Email: support@tide.ai
- 💬 Discord: [discord.gg/tide](https://discord.gg/tide)
- 📚 Docs: [docs.tide.ai](https://docs.tide.ai)
- 🐦 Twitter: [@tideai](https://twitter.com/tideai)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

Copyright © 2024 Tide AI, Inc. All rights reserved.

Private and confidential. This software is proprietary and not open source.

---

## Why $30/month?

**Simple math:** If Tide saves you just 1 hour per week, that's 4 hours per month. At any professional hourly rate, Tide pays for itself immediately.

But most users save 5-10 hours per week.

**The real value:** Never miss an important email. Never double-book. Never forget a follow-up. Always be prepared for meetings. Get your evenings back.

## The Vision

We believe the future of work isn't about voice commands in quiet rooms - it's about natural conversation that works everywhere you do.

Tide is building that future. One conversation at a time.

---

**Ready to get your time back?**

[Start your free trial →](https://tide.ai)