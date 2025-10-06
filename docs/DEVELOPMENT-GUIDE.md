# 🛠️ Development Guide

## Overview

Tide is a conversational text-first AI assistant built with a modular architecture. This guide covers the development approach, setup, and best practices.

## Architecture

See [STREAMLINED-ARCHITECTURE-FINAL.md](./STREAMLINED-ARCHITECTURE-FINAL.md) for the complete architecture.

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
│   └── setup/        # Setup guides
└── infrastructure/   # Deployment configs
```

## Development Approach

### Phase 1: Foundation (Weeks 1-4)
- Core conversation engine
- Natural language understanding
- Action preview system
- Basic email/calendar integration

### Phase 2: Integration (Weeks 5-8)
- Gmail/Outlook deep integration
- Google Calendar/Outlook Calendar
- Contact management
- File search capabilities

### Phase 3: Intelligence (Weeks 9-12)
- Learning system
- Personalization engine
- Complex task orchestration
- Proactive suggestions

### Phase 4: Launch (Weeks 13-16)
- Performance optimization
- Security hardening
- Beta testing program
- Public launch

## Module Development

Each module can be developed independently:

| Module | Focus | Dependencies |
|--------|-------|--------------|
| [00 - Conversational Foundation](./modules/MODULE-00-CONVERSATIONAL-TEXT.md) | Core contracts and interfaces | None |
| [01 - Email Service](./modules/MODULE-01-email-service.md) | Gmail/Outlook integration | Module 00 |
| [02 - Calendar Service](./modules/MODULE-02-calendar-service.md) | Calendar management | Module 00 |
| [03 - AI Agent System](./modules/MODULE-03-ai-agent-system.md) | Multi-agent orchestration | Module 00 |
| [04 - Event Sourcing](./modules/MODULE-04-event-sourcing.md) | CQRS, audit trail | Module 00 |
| [05 - Context Engine](./modules/MODULE-05-context-engine.md) | Semantic understanding | Modules 00, 04 |
| [06 - Mobile App](./modules/MODULE-06-mobile-app.md) | React Native app | Module 00 |
| [07 - Web App](./modules/MODULE-07-web-app.md) | Next.js application | Module 00 |
| [08 - Learning & Analytics](./modules/MODULE-08-learning-analytics.md) | User learning | Modules 00, 04 |
| [09 - Security & Auth](./modules/MODULE-09-security-auth.md) | OAuth2, encryption | Modules 00, 04 |
| [10 - Performance & Caching](./modules/MODULE-10-performance-caching.md) | Multi-tier cache | All modules |

## Quick Start

```bash
# Clone repository
git clone https://github.com/tide-ai/tide.git

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env

# Run development
pnpm dev

# Run tests
pnpm test
```

## Development Standards

### Code Quality
- TypeScript strict mode enabled
- 90% test coverage minimum
- ESLint + Prettier formatting
- Conventional commits

### Performance Targets
- Response time: <200ms p95
- API latency: <500ms for external calls
- Cache hit rate: >80%
- Error rate: <0.1%

### Security Requirements
- OAuth2 with PKCE
- End-to-end encryption for PII
- SOC 2 compliance
- Regular security audits

## Testing Strategy

```bash
# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# Performance tests
pnpm test:perf
```

## Deployment

### Environments
- **Development**: Auto-deploy from `develop` branch
- **Staging**: Manual deploy from `main` branch
- **Production**: Tagged releases only

### Infrastructure
- **API**: Railway/Render
- **Web**: Vercel
- **Mobile**: App Store / Google Play
- **Database**: PostgreSQL (Supabase)
- **Cache**: Redis (Upstash)

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## Support

- Internal Slack: #tide-dev
- Documentation: This guide
- Issues: GitHub Issues