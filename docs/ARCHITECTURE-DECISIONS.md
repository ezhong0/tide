# Architecture Decisions Record

**Last Updated**: January 2025
**Status**: Active

This document records the key architectural decisions for Tide, explaining the reasoning and tradeoffs.

---

## Decision Summary

| Decision Area                  | Choice                           | Alternative Considered | Why                                                                                                                |
| ------------------------------ | -------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Architecture Pattern**       | Modular Monolith                 | Microservices          | GPT-5 latency dominates, not service boundaries. Simpler ops, shared transactions. Split at 100k+ users if needed. |
| **Email/Calendar Integration** | Custom (Gmail/Outlook APIs)      | Nylas                  | Core product functionality. $0 vs $9-49/user. No vendor lock-in. Full control.                                     |
| **Vector Search**              | pgvector in PostgreSQL           | Pinecone/Weaviate      | Unified DB, SQL + vector in one query, ACID guarantees. Sufficient for 100k users.                                 |
| **Job Queue**                  | BullMQ (Redis-based)             | RabbitMQ/AWS SQS       | Uses existing Redis, simpler, perfect scale for our use case.                                                      |
| **AI Orchestration**           | Custom TypeScript state machines | LangGraph/LangChain    | Domain-specific linear flows, not complex agent loops. More control, easier to debug.                              |
| **Hosting**                    | Railway → AWS                    | AWS from day 1         | Fast to market, then migrate. Focus on product, not DevOps initially.                                              |
| **Speech-to-Text**             | Native device + Deepgram         | Deepgram only          | Instant UX with native, server fallback for edge cases.                                                            |

---

## 1. Modular Monolith vs Microservices

### Decision: Start with Modular Monolith

**Context**: Need to build scalable architecture while maintaining velocity and operational simplicity.

**Reasoning**:

- Our bottleneck is GPT-5 API latency (2-5s), not internal service boundaries
- Command → Draft → Email → Audit flow requires shared transactions
- Team is small (3 engineers), microservices add significant overhead
- Architecture supports 100k+ users before needing to split

**Tradeoffs**:
| Modular Monolith ✅ | Microservices ❌ |
|---|---|
| Shared transactions (critical for consistency) | Distributed transactions (complex) |
| Simple deployment & debugging | Complex ops & debugging |
| Fast local development | Network calls between services |
| Lower infrastructure costs | Higher costs (more services) |
| All-or-nothing deploys | Independent deploys |
| Can't scale services independently | Can scale services independently |

**When to reconsider**: Team > 10 engineers OR users > 100k OR specific bottleneck identified

**Migration path**: Modules are cleanly separated and can be extracted to services with minimal changes.

---

## 2. Email/Calendar Integration

### Decision: Build Custom Integrations (Gmail & Outlook APIs)

**Context**: Email and calendar access is the foundation of the product.

**Reasoning**:

- **This IS our core product**, not infrastructure
- Gmail/Outlook APIs are mature, stable, well-documented
- Cost: $0 (free APIs) vs Nylas at $9-49/user/month = $90k-490k/year at 10k users
- No vendor lock-in on critical path
- No data middleman (privacy advantage)
- Full control over features and optimization

**Tradeoffs**:
| Custom ✅ | Nylas ❌ |
|---|---|
| Full control over core product | Fast integration (save 4-6 weeks) |
| $0 cost (free APIs) | $9-49/user/month |
| No vendor dependency | Vendor dependency on critical path |
| Privacy (direct API access) | Data flows through Nylas servers |
| Can optimize for our use cases | Limited by their API |
| 4-6 weeks to build | Ready immediately |

**Implementation timeline**: 4-6 weeks for OAuth, webhooks, rate limiting, and basic integration.

**Risk mitigation**: OAuth 2.0 and webhook handling are well-understood patterns. Gmail and Outlook APIs are reliable.

---

## 3. Vector Search Database

### Decision: pgvector Extension in PostgreSQL

**Context**: Need semantic email search for "What did John say about Q4 timeline?" type queries.

**Reasoning**:

- Unified database: SQL + vector search in single query
- Can filter by sender, date, VIP status AND semantic similarity
- ACID guarantees for consistency
- Performance: Handles 10M+ vectors with HNSW index
- Cost: $0 (part of PostgreSQL infrastructure)
- No data synchronization between databases

**Example of power**:

```sql
-- Find emails from VIP contacts about "Q4 timeline" in last 30 days
SELECT * FROM emails
WHERE user_id = $1
  AND from = ANY($vip_contacts)
  AND date > NOW() - INTERVAL '30 days'
  AND embedding <=> $query_embedding < 0.3
ORDER BY embedding <=> $query_embedding
LIMIT 10;
```

**Tradeoffs**:
| pgvector ✅ | Pinecone/Weaviate ❌ |
|---|---|
| SQL + vector in one query | Separate service |
| ACID guarantees | Eventual consistency |
| $0 additional cost | $70-500/month |
| Simpler operations (one DB) | Complex data sync |
| Sufficient for 100k users | Optimized for massive scale |
| PostgreSQL is multi-purpose | Dedicated vector workload |

**Performance envelope**:

- 10M vectors: ~50-100ms queries (HNSW index)
- Throughput: ~100-500 QPS per core
- Our expected load: ~50 searches/sec peak at 10k users

**Migration path**: If we hit >500 QPS or >50M vectors, switch to Pinecone. Clean abstraction layer makes this straightforward.

---

## 4. Job Queue System

### Decision: BullMQ with Redis

**Context**: Need async processing for email webhooks, indexing, follow-ups, notifications.

**Reasoning**:

- Redis-backed (we already have Redis for cache/sessions)
- Handles retries, scheduling, priorities out of the box
- Excellent developer experience (Bull Board for monitoring)
- Perfect scale: 100k users = ~5k jobs/hour (well within capacity)
- Much simpler than RabbitMQ or AWS SQS

**Tradeoffs**:
| BullMQ ✅ | RabbitMQ ❌ | AWS SQS ❌ |
|---|---|---|
| Uses existing Redis | Separate service | Separate service |
| Simple setup | Complex setup | AWS-specific |
| Great DX (Bull Board) | Steeper learning curve | Vendor lock-in |
| Sufficient scale | Over-engineered for our needs | Over-engineered for our needs |
| $0 additional cost | Additional hosting | Additional AWS costs |

**Use cases**:

- Email webhook processing (Gmail/Outlook push notifications)
- Email indexing (generate embeddings, async)
- Follow-up checking (periodic cron-like jobs)
- Notification delivery (push, email, in-app)

---

## 5. AI Orchestration

### Decision: Custom TypeScript State Machines

**Context**: Need to orchestrate multi-step AI workflows like "Schedule meeting" = Check calendar → Draft email → Get approval → Send.

**Reasoning**:

- Our flows are **domain-specific state machines**, not general reasoning agents
- They're mostly linear: Step 1 → Step 2 → Step 3
- Custom code gives complete control and clarity
- Easy to test (pure functions)
- Easy to debug (explicit flow)

**Example flow**:

```typescript
async executeScheduleMeeting(intent: ScheduleMeetingIntent) {
  // Explicit, testable, clear
  const availability = await this.calendarService.checkAvailability(...);
  const overlaps = findOverlappingSlots(availability, participantAvailability);
  const draft = await this.emailService.draftMeetingRequest(...);
  return { status: 'pending_approval', draft };
}
```

**Tradeoffs**:
| Custom ✅ | LangGraph ❌ |
|---|---|
| Complete control over execution | Abstraction layer |
| Domain-specific types (Zod) | Framework lock-in |
| Easy to test and debug | Opaque debugging |
| Matches our mental model exactly | Built for complex agent loops |
| ~500-1000 lines of code | Faster prototyping |

**When to reconsider**: If we add features that need true agent reasoning loops (e.g., "Research this person and draft appropriate email" with web search → analysis → drafting → self-critique).

---

## 6. Hosting Strategy

### Decision: Railway (MVP) → AWS (Post-PMF)

**Context**: Need to balance speed-to-market with long-term cost efficiency.

**Reasoning**:

- **MVP (0-6 months)**: Railway
  - Deploy in minutes (not days)
  - Built-in PostgreSQL, Redis, monitoring
  - Focus 100% on product iteration
  - Cost: ~$100-500/month

- **Growth (6-18 months)**: Stay on Railway while finding PMF
  - Migrate only when: Revenue > $50k MRR OR Infrastructure > $5k/month

- **Scale (18+ months)**: Migrate to AWS
  - ~2-3x cheaper at scale
  - Full control for enterprise customers
  - Team can afford dedicated DevOps

**Tradeoffs**:
| Railway (MVP) ✅ | AWS (Day 1) ❌ |
|---|---|
| Deploy in minutes | 1-2 weeks setup |
| Focus on product | Focus on infrastructure |
| Great DX | Steeper learning curve |
| Auto-scaling included | Manual configuration |
| ~$100-500/mo | Similar at small scale |
| 2-3x more expensive at scale | Cheaper at 100k+ users |

**Portability**: Use standard Docker, PostgreSQL, Redis. No platform-specific APIs. Migration is ~1 week of work.

---

## 7. Cost Structure Design

### Decision: Variable Costs Scale with Usage, Not User Count

**Principle**: Low users = Low costs. Costs grow linearly with actual usage.

**Cost per user per month** (at 10k active users):

- OpenAI GPT-5 (50 commands): **$1.00**
- OpenAI Embeddings: **$0.05**
- Deepgram STT (20 voice commands): **$0.10**
- Infrastructure: **$0.07**
- Monitoring: **$0.02**
- **Total: $1.24/user/month**

**Key architecture decisions for cost efficiency**:

1. **Free Gmail/Outlook APIs** (not Nylas at $9-49/user) = **Save $90k-490k/year at 10k users**
2. **pgvector in PostgreSQL** (not Pinecone at $0.10+/user) = **Save $1k-10k/mo at scale**
3. **BullMQ with Redis** (not separate queue service) = **Save $50-500/mo**
4. **Native device STT primary** (not Deepgram-only) = **Save $100-200/user/mo**
5. **Modular monolith** (fewer services) = **Lower ops costs**

**Cost scaling examples**:

- **100 users**: $174/month = **$1.74/user** (mostly AI, minimal infra)
- **1,000 users**: $1,390/month = **$1.39/user**
- **10,000 users**: $13,100/month = **$1.31/user**
- **100,000 users**: $125k/month = **$1.25/user**

**At $49/user pricing: 97.5% gross margin**

---

## 8. Speech-to-Text Strategy

### Decision: Native Device STT + Deepgram Fallback

**Context**: Voice-first mobile app requires instant, reliable transcription.

**Reasoning**:

- **Primary**: Native device STT
  - Instant (no network latency)
  - Free (no API costs)
  - Works offline
  - Great for 90% of use cases

- **Fallback**: Deepgram for server-side and complex audio
  - Webhook processing
  - Batch transcription
  - Higher accuracy for noisy environments

- **Tertiary**: OpenAI Whisper for historical/archival

**Tradeoffs**:
| Native + Deepgram ✅ | Deepgram Only ❌ |
|---|---|
| Instant UX (no network latency) | Network latency on every request |
| Free for most uses | Pay for every transcription |
| Works offline | Requires internet |
| Fallback for edge cases | Single point of failure |
| Slightly more complex integration | Simpler integration |

**Cost impact**: Saves ~$0.20-0.40/user/month by using native STT for 80%+ of transcriptions.

---

## Summary: Architecture Principles

1. **Quality From The Start**: TypeScript + Zod + tests + clean architecture from day 1
2. **Start Simple, Scale Smart**: Modular monolith → microservices only when needed
3. **Own Your Core**: Build custom integrations for email/calendar (our product)
4. **Variable Costs**: Architecture designed for low costs at low scale
5. **No Premature Optimization**: Use managed services (Railway) initially
6. **Clear Migration Paths**: All decisions have explicit "when to reconsider" criteria
7. **Beautiful Code**: Explicit > magical, testable > clever, simple > complex

**Target**: Support 100k users with current architecture before needing major changes.

**Gross Margin**: 97.5% at $49/user pricing with $1.24/user costs.

---

## Revision History

- **January 2025**: Initial architecture decisions documented
- Reviewed after deep analysis of tradeoffs and long-term implications
- Approved by: Engineering team
