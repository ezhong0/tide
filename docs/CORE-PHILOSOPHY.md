# Tide Core Philosophy: Think First, Build Better

## The Central Thesis

**Build systems that can be understood, extended, and parallelized by thinking deeply before writing code.**

Software development typically moves fast and breaks things. We're doing the opposite: **move deliberately and build things right the first time.**

This isn't about being slow. It's about being **efficient** through **clarity**.

---

## 1. Contract-First Development: Coordination Through Interfaces

### The Problem

Multiple engineers working on a codebase step on each other's toes. Changes in one module break another. Integration happens at the end and reveals fundamental mismatches.

### Our Solution

**Define every interface, every type, every API contract BEFORE writing implementation.**

```typescript
// Week 1-2: Everyone agrees on THIS first
interface IEmailProvider {
  sendEmail(params: SendEmailParams): Promise<EmailResult>;
  searchEmails(query: SearchQuery): Promise<Email[]>;
}

// Week 3-6: Five engineers implement INDEPENDENTLY
// - Engineer 1: GmailProvider implements IEmailProvider
// - Engineer 2: OutlookProvider implements IEmailProvider
// - Engineer 3: Works with MOCK IEmailProvider
```

### Why This Matters

- **Enables parallelization**: Clear contracts mean no blocking dependencies
- **Prevents integration hell**: Interfaces match by design, not luck
- **Makes testing trivial**: Mock interfaces, test logic independently
- **Forces clarity**: If you can't define the interface, you don't understand the problem

### The Rule

**No implementation code is written until all contracts are defined and reviewed.**

---

## 2. Functional Core, Imperative Shell: Testability By Design

### The Problem

Most code mixes business logic with I/O, making it hard to test, hard to reason about, and hard to reuse.

```typescript
// ❌ BAD: Logic mixed with I/O
async function calculateAvailability(userId: string) {
  const events = await database.getEvents(userId); // I/O
  const slots = [];
  for (const event of events) {
    // Logic
    // ... complex availability calculation
  }
  await cache.set(userId, slots); // I/O
  return slots;
}
```

### Our Solution

**Pure functions for business logic. Side effects only at the edges.**

```typescript
// ✅ GOOD: Pure core
class AvailabilityCalculator {
  // PURE: No database, no API calls, no side effects
  calculateFreeSlots(events: CalendarEvent[], timeframe: Timeframe, duration: number): TimeSlot[] {
    // Pure computation - deterministic, testable
    return slots;
  }
}

// Imperative shell handles I/O
class CalendarService {
  async checkAvailability(userId: string, params: AvailabilityParams) {
    const events = await this.provider.getEvents(userId); // I/O
    const slots = this.calculator.calculateFreeSlots(events); // Pure
    await this.cache.set(userId, slots); // I/O
    return slots;
  }
}
```

### Why This Matters

- **Testing is trivial**: Pure functions need no mocks, no setup, no teardown
- **Reasoning is easy**: Input → Output, no hidden state
- **Reusability**: Pure functions work anywhere
- **Performance**: Pure functions can be memoized, cached, parallelized

### The Rule

**Business logic must be pure functions. I/O must be clearly separated at service boundaries.**

---

## 3. Type Safety: Make Invalid States Unrepresentable

### The Problem

Runtime errors from invalid data. Defensive null checks everywhere. Uncertainty about data shape.

```typescript
// ❌ BAD: Runtime disaster waiting to happen
function sendEmail(email: any) {
  const to = email.to; // Could be undefined, null, string, array?
  // ... hope for the best
}
```

### Our Solution

**Zero `any` types. Zod validation at boundaries. TypeScript in strict mode.**

```typescript
// ✅ GOOD: Invalid states are impossible
export const SendEmailParamsSchema = z.object({
  to: z.array(z.string().email()).min(1),
  subject: z.string().min(1).max(998),
  body: z.string(),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
});

export type SendEmailParams = z.infer<typeof SendEmailParamsSchema>;

// At API boundary
export async function sendEmailHandler(req: Request): Promise<Response> {
  const parsed = SendEmailParamsSchema.safeParse(req.body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  // From here on, params.to is GUARANTEED to be string[]
  return sendEmail(parsed.data);
}
```

### Why This Matters

- **Eliminates entire classes of bugs**: No undefined, no type mismatches
- **Self-documenting**: Types are always accurate
- **Refactoring confidence**: TypeScript catches breaks at compile time
- **Editor support**: IntelliSense works perfectly

### The Rule

**Zero `any` types. All external inputs validated with Zod. TypeScript strict mode always on.**

---

## 4. Multi-Level Caching: Performance By Design

### The Problem

Latency kills user experience. Database queries are slow. API calls are slower.

### Our Solution

**Design caching into the architecture from day one.**

```typescript
// L1: In-memory (1ms) - for hot data
// L2: Redis (10ms) - for shared data
// L3: Database (100ms) - source of truth

async getUserContext(userId: string): Promise<UserContext> {
  // Try L1 first
  const l1 = inMemoryCache.get(userId);
  if (l1) return l1;

  // Try L2
  const l2 = await redis.get(`user:${userId}`);
  if (l2) {
    const parsed = JSON.parse(l2);
    inMemoryCache.set(userId, parsed);
    return parsed;
  }

  // Build from L3
  const data = await database.buildContext(userId);
  await redis.set(`user:${userId}`, JSON.stringify(data), 600);
  inMemoryCache.set(userId, data, 60);
  return data;
}
```

### Why This Matters

- **Predictable performance**: Know exactly where latency comes from
- **Graceful degradation**: Redis down? Fall back to database
- **Cost efficiency**: Fewer database queries, lower AWS bills
- **Scale**: Hot data served from memory

### The Rule

**Every read path must have a caching strategy. Every write must invalidate correctly.**

---

## 5. Module Boundaries: Clear Ownership

### The Problem

Spaghetti code where everything depends on everything. Can't change one thing without breaking three others.

### Our Solution

**Each module owns its domain. No tight coupling. Communication via interfaces.**

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Email Module │  │Calendar Mod  │  │  AI Module   │
│              │  │              │  │              │
│ ✅ Owns:     │  │ ✅ Owns:     │  │ ✅ Owns:     │
│ - emails tbl │  │ - events tbl │  │ - commands   │
│ - OAuth      │  │ - OAuth      │  │ - GPT calls  │
│ - Providers  │  │ - Providers  │  │ - Intents    │
│              │  │              │  │              │
│ ❌ Doesn't:  │  │ ❌ Doesn't:  │  │ ❌ Doesn't:  │
│ - Create mtg │  │ - Send email │  │ - Store data │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Why This Matters

- **Parallel development**: Teams don't block each other
- **Focused testing**: Test one module at a time
- **Clear responsibility**: Know who owns what
- **Easier debugging**: Problem domain is isolated

### The Rule

**Each module has one clear responsibility. Cross-module communication only through defined interfaces.**

---

## 6. Strategy Pattern: Extensibility Through Polymorphism

### The Problem

Supporting multiple providers (Gmail, Outlook) leads to giant if/else chains and duplicated code.

### Our Solution

**Define common interface. Each provider implements it. Service layer doesn't care.**

```typescript
// Common interface
interface IEmailProvider {
  sendEmail(params: SendEmailParams): Promise<EmailResult>;
}

// Implementations
class GmailProvider implements IEmailProvider {
  async sendEmail(params: SendEmailParams): Promise<EmailResult> {
    // Gmail-specific logic
  }
}

class OutlookProvider implements IEmailProvider {
  async sendEmail(params: SendEmailParams): Promise<EmailResult> {
    // Outlook-specific logic
  }
}

// Service layer - provider agnostic
class EmailService {
  async sendEmail(userId: string, params: SendEmailParams) {
    const provider = await this.getProviderForUser(userId);
    return provider.sendEmail(params); // Works for ANY provider
  }
}
```

### Why This Matters

- **Easy to add providers**: New provider? Just implement the interface
- **No conditional logic**: No if (provider === 'gmail') everywhere
- **Testable**: Mock the interface, not the implementation
- **Swappable**: Switch providers without changing business logic

### The Rule

**When there are multiple ways to do something, use Strategy pattern.**

---

## 7. Dependency Injection: Testability & Flexibility

### The Problem

Hard-coded dependencies make testing impossible and changes risky.

```typescript
// ❌ BAD: Hard to test, hard to change
class EmailService {
  async sendEmail() {
    const db = new PostgresDatabase(); // Hard-coded
    const provider = new GmailProvider(); // Hard-coded
  }
}
```

### Our Solution

**Inject dependencies. Test with mocks. Run with real implementations.**

```typescript
// ✅ GOOD: Flexible and testable
class EmailService {
  constructor(
    private database: IDatabase,
    private providerFactory: IProviderFactory,
    private cache: ICache
  ) {}

  async sendEmail(userId: string, params: SendEmailParams) {
    // Uses injected dependencies
  }
}

// In production
const service = new EmailService(realDatabase, realProviderFactory, realCache);

// In tests
const service = new EmailService(mockDatabase, mockProviderFactory, mockCache);
```

### Why This Matters

- **Fast tests**: No need for real database or API calls
- **Easy changes**: Swap Redis for Memcached? Just inject different implementation
- **Clear dependencies**: Constructor shows exactly what's needed
- **Prevents hidden coupling**: Can't secretly import globals

### The Rule

**All services use constructor injection. No hard-coded dependencies.**

---

## 8. Test-Driven Quality: 80%+ Coverage

### The Problem

"I'll add tests later" means never. Bugs discovered in production. Fear of refactoring.

### Our Solution

**Tests are not optional. 80% coverage minimum. Write tests as you code.**

```typescript
// For every feature, write:

// 1. Unit tests (pure functions)
describe('AvailabilityCalculator', () => {
  it('finds free slots between meetings', () => {
    const events = [
      /* mock data */
    ];
    const slots = calculator.calculateFreeSlots(events, timeframe, 30);
    expect(slots).toHaveLength(3);
  });
});

// 2. Integration tests (with mocks)
describe('CalendarService', () => {
  it('returns cached availability', async () => {
    mockCache.get.mockResolvedValue(cachedSlots);
    const result = await service.checkAvailability('user-123', params);
    expect(mockProvider.getEvents).not.toHaveBeenCalled();
  });
});

// 3. E2E tests (real flow)
describe('Meeting Scheduling Flow', () => {
  it('schedules meeting end-to-end', async () => {
    // Voice input → Intent → Calendar check → Email draft → Approval → Send
  });
});
```

### Why This Matters

- **Confidence in changes**: Tests catch regressions
- **Documentation**: Tests show how code should be used
- **Quality gate**: Can't merge without tests
- **Faster debugging**: Tests narrow down where bugs are

### The Rule

**No PR merges without 80%+ test coverage. Write tests as you code, not after.**

---

## 9. Progressive Enhancement: Foundation First

### The Problem

Building features before infrastructure leads to inconsistent patterns and rework.

### Our Solution

**Phase 0: Build foundation. Phase 1+: Build on solid base.**

```
Week 1-2: EVERYONE works on foundation
- Monorepo structure
- Database schema (ALL tables)
- API contracts (ALL endpoints)
- Mock services
- CI/CD pipeline
- Infrastructure

Week 3+: Teams work in parallel
- Email team uses mock Calendar
- Calendar team uses mock Email
- AI team uses mock everything
- Integration happens naturally (contracts match!)
```

### Why This Matters

- **Consistent patterns**: Decisions made once, applied everywhere
- **No rework**: Foundation supports all features
- **Parallel work**: Teams don't wait for each other
- **Quality baseline**: Standards set before code written

### The Rule

**No feature code until Phase 0 complete. Foundation is NOT negotiable.**

---

## 10. Documentation as Code: Context for Humans AND AI

### The Problem

Documentation gets outdated. New developers struggle to understand. Context lives in people's heads.

### Our Solution

**Documentation is detailed, current, and executable by AI agents.**

Each implementation guide includes:

- **Module boundary**: What it does, what it doesn't do
- **Complete code examples**: Copy-paste ready
- **Success criteria**: Checklist of deliverables
- **Testing requirements**: Specific coverage expectations
- **Performance targets**: < 100ms cached, < 500ms cold
- **Day-by-day breakdown**: Clear progression

### Why This Matters

- **Onboarding**: New dev/AI reads doc and is productive immediately
- **Consistency**: Everyone builds the same way
- **AI-friendly**: Claude Code instances can work from docs alone
- **Knowledge preservation**: Context doesn't disappear when people leave

### The Rule

**Every module must have complete implementation guide before work starts.**

---

## The Payoff: 18 Weeks to Production-Ready

By following these principles:

✅ **5 engineers work in parallel** (not sequential)
✅ **Zero integration hell** (contracts defined upfront)
✅ **High quality from day one** (no technical debt)
✅ **Fast tests** (pure functions, dependency injection)
✅ **Confident refactoring** (TypeScript + tests catch breaks)
✅ **Predictable performance** (caching by design)
✅ **Easy debugging** (clear module boundaries)
✅ **Rapid AI development** (detailed docs enable Claude Code instances)

---

## The Anti-Patterns We Avoid

❌ **Move fast and break things** → Move deliberately and build right
❌ **We'll refactor later** → Build correctly the first time
❌ **Tests slow us down** → Tests give us speed and confidence
❌ **Documentation is overhead** → Documentation enables parallelization
❌ **Any type is fine** → Type safety prevents entire bug classes
❌ **Let's integrate at the end** → Integrate continuously via contracts

---

## The Mindset

### Before Writing Code, Ask:

1. **Is this interface well-defined?**
   - Can another developer implement this without asking questions?

2. **Is this logic pure?**
   - Can I test this without database/API/filesystem?

3. **Is this type-safe?**
   - Does TypeScript prevent invalid states?

4. **Is this cacheable?**
   - How will this perform under load?

5. **Is this boundary clear?**
   - Does this module own this responsibility?

6. **Is this testable?**
   - Can I write tests without heroic mocking?

If you can't answer "yes" to all six, **stop and redesign**.

---

## Conclusion: Quality is Faster

This philosophy isn't about being slow or over-engineering.

It's about recognizing that **thinking deeply upfront is faster than debugging later**.

It's about building systems that:

- Multiple people can work on simultaneously
- AI agents can understand and extend
- New developers can be productive in immediately
- Run reliably under load
- Are easy to test and debug
- Don't accumulate technical debt

**Think First, Build Better** isn't a slogan. It's a competitive advantage.

---

## For Claude Code Instances

When you're implementing a module:

1. **Read the contracts first** (Phase 0 docs)
2. **Understand your boundaries** (module implementation guide)
3. **Write interfaces before implementations**
4. **Make business logic pure**
5. **Validate all inputs with Zod**
6. **Design caching from the start**
7. **Write tests as you code**
8. **Use dependency injection**
9. **Check success criteria before considering yourself done**

If you follow these principles, your code will integrate seamlessly with the rest of the system.

---

**Remember: The goal isn't to write code quickly. The goal is to write code that works, that lasts, and that others can build on.**

**Think First, Build Better.** 🚀
