# 📚 Tide Documentation Index

## Core Documents

### 🎯 Product & Strategy
- [**Business Strategy**](./BUSINESS-STRATEGY-TEXT-FIRST.md) - $30/month conversational AI strategy
- [**Architecture Overview**](./STREAMLINED-ARCHITECTURE-FINAL.md) - Text-first conversational architecture
- [**Complex Task Handling**](./COMPLEX-TASK-ARCHITECTURE.md) - How Tide handles multi-step workflows

### 🛠️ Development
- [**Development Guide**](./DEVELOPMENT-GUIDE.md) - How to build and deploy Tide
- [**Architecture Decisions**](./ARCHITECTURE-DECISIONS.md) - Key technical decisions and rationale
- [**Setup Guide**](./setup/EXTERNAL-SETUP-GUIDE.md) - External services setup (OAuth, APIs)

## 📦 Module Documentation

All modules follow the conversational text-first approach:

1. [**Module 00: Conversational Foundation**](./modules/MODULE-00-CONVERSATIONAL-TEXT.md)
   - Core contracts and interfaces for conversational AI
   - Preview-and-confirm pattern
   - Context management

2. [**Module 01: Email Service**](./modules/MODULE-01-email-service.md)
   - Gmail/Outlook integration
   - Natural language email management
   - Conversational email composition

3. [**Module 02: Calendar Service**](./modules/MODULE-02-calendar-service.md)
   - Smart scheduling through conversation
   - Meeting conflict resolution
   - Time zone handling

4. [**Module 03: AI Agent System**](./modules/MODULE-03-ai-agent-system.md)
   - Multi-agent orchestration
   - ReAct pattern implementation
   - Complex reasoning

5. [**Module 04: Event Sourcing**](./modules/MODULE-04-event-sourcing.md)
   - CQRS implementation
   - Audit trail
   - Time-travel debugging

6. [**Module 05: Context Engine**](./modules/MODULE-05-context-engine.md)
   - Semantic understanding
   - Reference resolution ("that email", "it")
   - Conversation memory

7. [**Module 06: Mobile App**](./modules/MODULE-06-mobile-app.md)
   - React Native implementation
   - Offline-first architecture
   - Conversational UI

8. [**Module 07: Web App**](./modules/MODULE-07-web-app.md)
   - Next.js implementation
   - Real-time updates
   - Chat interface

9. [**Module 08: Learning & Analytics**](./modules/MODULE-08-learning-analytics.md)
   - User behavior learning
   - Personalization engine
   - Insights generation

10. [**Module 09: Security & Auth**](./modules/MODULE-09-security-auth.md)
    - OAuth2 implementation
    - End-to-end encryption
    - SOC 2 compliance

11. [**Module 10: Performance & Caching**](./modules/MODULE-10-performance-caching.md)
    - Multi-tier caching strategy
    - Edge computing
    - <200ms response optimization

## 🚀 Quick Links

- [Main README](../README.md) - Product overview and vision
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute
- [API Documentation](https://docs.tide.ai) - API reference (when deployed)

## 📝 Document Status

✅ **Current & Updated:**
- Business Strategy (Text-First)
- Streamlined Architecture
- Module 00 (Conversational Foundation)
- Module 01 (Email - partially updated for text-first)

⚠️ **Needs Update for Text-First:**
- Modules 02-10 (still have voice-first references)

## 🎯 Key Concepts

### Conversational Text-First
- Users type naturally (or speak, which converts to text)
- AI shows what it will do before doing it
- Full conversation context maintained
- Works everywhere (offices, public transport, meetings)

### Preview & Confirm Pattern
1. User makes request in natural language
2. Tide shows preview of action
3. User can edit or confirm
4. Tide executes and reports progress

### $30/Month Pricing
- Accessible to millions of professionals
- 10x larger market than $99 price point
- Sustainable unit economics (53% margin)