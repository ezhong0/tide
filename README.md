# 🌊 Tide - AI Executive Assistant

> Ultra-fast, context-aware AI assistant that handles email, calendar, and tasks through natural language.
> Built for <300ms responses with offline-first mobile and semantic understanding.

## 🎯 Project Vision

Tide transforms how executives and professionals interact with their digital workspace. Instead of switching between email, calendar, and task apps, users simply speak or type natural commands and Tide handles everything intelligently in the background.

**Key differentiators:**
- **<300ms response time** - Feels instant
- **Works offline** - Mobile app with Gemini Nano
- **Learns from you** - Improves with every interaction
- **Bank-grade security** - SOC 2 compliant, E2E encryption
- **No collaboration features** - Focused on individual productivity

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   User Interface                     │
│        Mobile App (RN) | Web App (Next.js)          │
└─────────────┬───────────────────────┬───────────────┘
              │                       │
         ┌────▼──────┐          ┌────▼──────┐
         │   Edge    │          │   Edge    │
         │  Worker   │          │  Worker   │
         │(Cloudflare)          │(Cloudflare)
         └────┬──────┘          └────┬──────┘
              │                       │
┌─────────────▼───────────────────────▼───────────────┐
│             API Gateway (Fastify)                   │
│         Rate Limiting | Auth | Routing              │
└─────────────┬───────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────┐
│           Multi-Agent AI System                      │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │
│  │Router  │ │Email   │ │Calendar│ │Task    │      │
│  │Agent   │ │Agent   │ │Agent   │ │Agent   │      │
│  └────────┘ └────────┘ └────────┘ └────────┘      │
└─────────────┬───────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────┐
│              Service Layer                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │Context  │ │Email    │ │Calendar │ │Learning │ │
│  │Engine   │ │Service  │ │Service  │ │Engine   │ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
└─────────────┬───────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────┐
│           Data Layer                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │Postgres │ │Redis    │ │Event    │ │Vector   │ │
│  │   +     │ │Cache    │ │Store    │ │Search   │ │
│  │pgvector │ │         │ │         │ │         │ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
└─────────────────────────────────────────────────────┘
```

## 📦 Module Structure

The project is organized into 11 independent modules that can be developed in parallel by separate Claude instances:

| Module | Instance | Focus | Duration | Dependencies |
|--------|----------|-------|----------|--------------|
| [00 - Foundation](docs/modules/MODULE-00-foundation.md) | #0 | Contracts, types, mocks, validation | 2 weeks | None |
| [01 - Email Service](docs/modules/MODULE-01-email-service.md) | #1 | Gmail/Outlook integration, smart drafts | 3 weeks | Module 00 |
| [02 - Calendar Service](docs/modules/MODULE-02-calendar-service.md) | #2 | Smart scheduling, availability engine | 3 weeks | Module 00 |
| [03 - AI Agent System](docs/modules/MODULE-03-ai-agent-system.md) | #3 | Multi-agent orchestration, ReAct pattern | 4 weeks | Module 00 |
| [04 - Event Sourcing](docs/modules/MODULE-04-event-sourcing.md) | #4 | CQRS, audit trail, time-travel | 4 weeks | Module 00 |
| [05 - Context Engine](docs/modules/MODULE-05-context-engine.md) | #5 | Semantic search, relationship mapping | 4 weeks | Modules 00, 04 |
| [06 - Mobile App](docs/modules/MODULE-06-mobile-app.md) | #6 | React Native, offline-first, voice | 4 weeks | Module 00 |
| [07 - Web App](docs/modules/MODULE-07-web-app.md) | #7 | Next.js, real-time updates, dashboard | 4 weeks | Module 00 |
| [08 - Learning & Analytics](docs/modules/MODULE-08-learning-analytics.md) | #8 | User behavior learning, insights | 4 weeks | Modules 00, 04 |
| [09 - Security & Auth](docs/modules/MODULE-09-security-auth.md) | #9 | OAuth2, JWT, encryption, SOC 2 | 3 weeks | Modules 00, 04 |
| [10 - Performance & Caching](docs/modules/MODULE-10-performance-caching.md) | #10 | Multi-tier cache, edge computing | 3 weeks | All modules |

## 🚀 Development Timeline (12 Weeks)

### Phase 0: Foundation (Weeks 1-2)
- **Module 00** - Contracts, types, mocks, database schema
- All other modules wait for foundation completion

### Phase 1: Core Infrastructure (Weeks 3-4)
- **Module 04** - Event Sourcing (parallel)
- **Module 09** - Security/OAuth (parallel - needed for Email/Calendar)
- Start Modules 01, 02, 03, 05 with mocks

### Phase 2: Core Services (Weeks 5-6)
- **Module 01** - Email Service (complete)
- **Module 02** - Calendar Service (complete)
- **Module 03** - AI Agent System (complete)
- **Module 05** - Context Engine (complete)
- Integration testing between services

### Phase 3: Applications (Weeks 7-9)
- **Module 06** - Mobile App (parallel)
- **Module 07** - Web App (parallel)
- **Module 09** - Complete security (RBAC, encryption)

### Phase 4: Polish & Optimization (Weeks 10-12)
- **Module 08** - Learning & Analytics
- **Module 10** - Performance & Caching
- Production preparation and deployment

## 🛠️ Tech Stack

### Core
- **Runtime**: Node.js 20+ with TypeScript
- **Database**: PostgreSQL 16 with pgvector
- **Cache**: Redis 7 with RedisJSON
- **Queue**: BullMQ for job processing

### Backend
- **API**: Fastify (3x faster than Express)
- **AI**: OpenAI GPT-4, Anthropic Claude, Gemini Nano
- **Email**: Direct Gmail/Outlook APIs
- **Auth**: OAuth2 with PKCE, JWT

### Frontend
- **Web**: Next.js 14 with App Router
- **Mobile**: React Native with Expo
- **Voice**: Web Speech API, iOS/Android native

### Infrastructure
- **Edge**: Cloudflare Workers
- **Monitoring**: OpenTelemetry + Grafana
- **CI/CD**: GitHub Actions
- **Hosting**: Railway/Render for backend, Vercel for web

## 💡 For Claude Instances

Each Claude instance should:

1. **Read your module document** in `/docs/modules/`
2. **Use the contracts** from Module 00 as interfaces
3. **Mock external dependencies** that aren't ready yet
4. **Write comprehensive tests** (>85% coverage)
5. **Follow the architecture** outlined in your module
6. **Optimize for latency** (<300ms is the goal)

### Working with Contracts

```typescript
// Import contracts from Module 00
import {
  EmailServiceContract,
  CalendarServiceContract,
  UserContext
} from '@tide/contracts';

// Implement your service
export class EmailService implements EmailServiceContract {
  // Your implementation here
}

// Use mocks for dependencies
import { MockCalendarService } from '@tide/contracts/mocks';

const calendar = new MockCalendarService();
```

### Communication Between Modules

All inter-module communication happens through:
1. **Contracts** - Type-safe interfaces
2. **Events** - Event sourcing for state changes
3. **API Gateway** - RESTful endpoints

Never directly import from another module's implementation.

## 📊 Success Metrics

- **Performance**: p95 latency <300ms
- **Availability**: 99.9% uptime
- **Accuracy**: >90% intent recognition
- **Security**: SOC 2 compliant
- **Scale**: 10,000+ concurrent users

## 🔒 Security & Compliance

- OAuth2 with PKCE for all auth
- End-to-end encryption for PII
- Complete audit trail via event sourcing
- GDPR & CCPA compliant
- SOC 2 Type II ready

## 📚 Documentation

### Core Documents
- [Architecture Decisions](docs/ARCHITECTURE-DECISIONS.md)
- [Core Philosophy](docs/CORE-PHILOSOPHY.md)
- [Streamlined Architecture](docs/STREAMLINED-ARCHITECTURE-FINAL.md)
- [Latency Optimization](docs/LATENCY-OPTIMIZATION-ARCHITECTURE.md)

### Module Guides
All module documentation is in `/docs/modules/`. Each guide includes:
- Claude instance prompt
- Success criteria
- Core architecture with code examples
- Key deliverables
- Integration points

## 🎯 Getting Started

### For Development Lead
1. Deploy Module 00 (Foundation) first
2. Assign Claude instances to remaining modules
3. Set up weekly integration checkpoints
4. Monitor progress via event store

### For Claude Instances
1. Read your assigned module guide
2. Import contracts from Module 00
3. Build according to specification
4. Write tests alongside code
5. Document all API endpoints

## 🌟 Key Principles

1. **Speed is a feature** - Every millisecond counts
2. **Offline-first** - Mobile should work without internet
3. **Learn and adapt** - Get smarter with each interaction
4. **Security by default** - Never compromise on security
5. **Developer experience** - Clean APIs and good documentation

---

Built with 🤖 by Claude Instances #0-10