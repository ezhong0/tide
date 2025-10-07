# 🌊 Tide Platform

**An AI-powered productivity platform** that unifies messaging, email, calendar, tasks, and workflows into a seamless experience.

**Current Status:** Week 3 Alpha - Supabase-First Architecture

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your configuration

# 3. Start infrastructure (PostgreSQL, Redis, Kafka, Monitoring)
pnpm dev:start

# 4. Run database migrations
pnpm db:migrate

# 5. Build all packages
pnpm build

# You're ready! 🎉
```

---

## 📁 Project Structure

```
tide/
├── packages/                    # Monorepo packages
│   ├── shared/                  # Shared packages (all tracks)
│   │   ├── config/              ✅ Environment & configuration
│   │   ├── types/               ✅ TypeScript type definitions
│   │   ├── errors/              ✅ Error handling
│   │   ├── validation/          ✅ Zod schemas
│   │   └── contracts/           ✅ Shared interfaces
│   │
│   ├── libraries/               # Reusable libraries
│   │   ├── logger/              ✅ Structured logging (Pino)
│   │   ├── database/            ✅ PostgreSQL client
│   │   │   └── migrations/      ✅ Database migrations (11 tables)
│   │   └── mocks/               ✅ Test mocks
│   │
│   └── services/                # Microservices (to be built by tracks)
│       ├── auth/                ⏳ Authentication service
│       ├── gateway/             ⏳ API Gateway (GraphQL Federation)
│       ├── events/              ⏳ Event bus service
│       └── realtime/            ⏳ WebSocket service
│
├── infrastructure/              # Infrastructure configuration
│   └── docker/                  # Docker configs
│       ├── prometheus/          # Metrics collection
│       └── grafana/             # Metrics visualization
│
├── scripts/                     # Development scripts
│   ├── dev-start.sh             # Start infrastructure
│   ├── dev-stop.sh              # Stop infrastructure
│   ├── dev-reset.sh             # Reset (wipes data)
│   ├── db-migrate.sh            # Run migrations
│   ├── check-health.sh          # Health checks
│   └── test-api.sh              # API testing
│
├── docs/                        # Documentation
│   ├── planning/                # Project planning docs
│   ├── architecture/            # Architecture docs
│   ├── guides/                  # Implementation guides
│   └── tracks/                  # Track-specific docs
│
├── docker-compose.yml           # Local development stack
├── .env.example                 # Environment template
├── package.json                 # Root package.json
└── pnpm-workspace.yaml          # Monorepo configuration
```

---

## 🎯 Available Commands

### Development

```bash
# Start/stop infrastructure
pnpm dev:start              # Start PostgreSQL, Redis, Kafka, Prometheus, Grafana
pnpm dev:stop               # Stop all services
pnpm dev:reset              # Reset (WARNING: deletes all data)

# Database
pnpm db:migrate             # Run database migrations

# Build & test
pnpm install                # Install all dependencies
pnpm build                  # Build all packages
pnpm dev                    # Watch mode (all packages)
pnpm test                   # Run all tests
pnpm lint                   # Lint all code
pnpm type-check             # Type check all packages
```

### Package-specific

```bash
# Build specific package
pnpm --filter @tide/config build
pnpm --filter @tide/logger build

# Test specific package
pnpm --filter @tide/database test
```

---

## 🐳 Infrastructure Services

After running `pnpm dev:start`, you'll have access to:

| Service | URL | Credentials |
|---------|-----|-------------|
| **PostgreSQL** | `localhost:5432` | tide / tide_password |
| **Redis** | `localhost:6379` | No password |
| **Kafka** | `localhost:9092` | No auth |
| **Kafka UI** | http://localhost:8080 | - |
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3001 | admin / admin |

---

## 📦 Core Packages

### Shared Packages

#### `@tide/config`
Environment variable validation and configuration management.
```typescript
import { env, databaseConfig, features } from '@tide/config';

console.log(env.DATABASE_URL);
console.log(features.emailSync); // Feature flags
```

#### `@tide/types`
TypeScript type definitions including branded types for ID safety.
```typescript
import { UserId, ConversationId, Paginated } from '@tide/types';

function getUser(id: UserId) { }
// getUser(conversationId); // ❌ Type error!
```

#### `@tide/errors`
Standardized error handling with 90+ error codes.
```typescript
import { AuthErrors, EmailErrors } from '@tide/errors';

throw AuthErrors.invalidCredentials();
throw EmailErrors.notFound('email_123');
```

#### `@tide/validation`
Zod schemas for all domain models with Express middleware.
```typescript
import { validate, UserRegistrationSchema, validateBody } from '@tide/validation';

const user = validate(UserRegistrationSchema, data);
app.post('/register', validateBody(UserRegistrationSchema), handler);
```

### Libraries

#### `@tide/logger`
Structured logging with automatic sensitive data redaction.
```typescript
import { logger, createRequestLogger } from '@tide/logger';

logger.info('Application started');
const reqLogger = createRequestLogger(requestId, userId);
```

#### `@tide/database`
PostgreSQL client with query helpers and transactions.
```typescript
import { query, queryOne, transaction } from '@tide/database';

const users = await query('SELECT * FROM tide.users');
const user = await queryOne('SELECT * FROM tide.users WHERE id = $1', [id]);
```

---

## 🗄️ Database Schema

11 production-ready tables across 5 migrations:

**Users & Authentication:**
- `tide.users` - User accounts
- `tide.user_profiles` - User profiles
- `tide.refresh_tokens` - JWT refresh tokens
- `tide.verification_tokens` - Email verification
- `tide.password_reset_tokens` - Password resets
- `tide.oauth_tokens` - OAuth credentials (encrypted)

**Conversations:**
- `tide.conversations` - User conversations
- `tide.messages` - Conversation messages

**Event Sourcing:**
- `tide.events` - Event log
- `tide.outbox` - Outbox pattern for reliable event publishing

**Migrations:** `packages/libraries/database/migrations/`

---

## 🏗️ Architecture

### Technology Stack

- **Runtime:** Node.js 20+
- **Language:** TypeScript (strict mode)
- **Package Manager:** pnpm (monorepo)
- **Database:** PostgreSQL 16
- **Cache:** Redis 7
- **Event Bus:** Kafka 7.5
- **API:** GraphQL (Apollo Federation)
- **Logging:** Pino
- **Monitoring:** Prometheus + Grafana

### Design Principles

1. **Event-Driven:** Kafka for inter-service communication
2. **Type-Safe:** TypeScript everywhere with branded types
3. **Validated:** Zod schemas for all inputs
4. **Monitored:** Structured logging, metrics, distributed tracing
5. **Testable:** Isolated packages, dependency injection
6. **Documented:** Comprehensive inline docs

---

## 🎯 Track Development

Each track can now develop independently:

### Track 1: Mobile Apps
- ✅ Authentication ready (user schema, JWT)
- ✅ Conversations ready (database tables)
- ✅ Real-time ready (Kafka topics)

### Track 2: AI Intelligence
- ✅ AI config ready (OpenAI, Anthropic)
- ✅ Event bus ready
- ✅ Conversation storage ready

### Track 3: Email & Calendar
- ✅ OAuth ready (Gmail, Microsoft)
- ✅ OAuth tokens table
- ✅ Email event types defined

### Track 4: Tasks & Workflow
- ✅ Event-driven architecture ready
- ✅ Task event types defined
- ✅ Database extensible

**See `docs/tracks/` for track-specific documentation.**

---

## 📚 Documentation

Complete docs at **[docs/](docs/)**:
- **[Current Architecture](docs/architecture/CURRENT-ARCHITECTURE.md)** - Week 3 Alpha system design
- **[Deployment Guide](docs/RAILWAY-DEPLOYMENT-GUIDE.md)** - Deploy to Railway
- **[Current Status](docs/current/)** - Services, stack, integration status
- **[Development Guides](docs/guides/)** - Testing and integration guides
- **[Planning & Roadmap](docs/tracks/)** - Track milestones and implementation plans

**Dashboards:**
- [Supabase Dashboard](https://app.supabase.com) - Auth, Database, Realtime
- [Railway Dashboard](https://railway.app/dashboard) - AI Service deployment

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Test specific package
pnpm --filter @tide/database test

# Integration tests (requires running infrastructure)
pnpm dev:start
pnpm test:integration
```

---

## 🔒 Security

- ✅ Bcrypt password hashing (cost factor 12)
- ✅ JWT with asymmetric signing
- ✅ OAuth tokens encrypted at rest (AES-256)
- ✅ Sensitive data redacted in logs
- ✅ SQL injection prevention (parameterized queries)
- ✅ Rate limiting configured
- ✅ CORS properly configured

**See `.env.example` for security-related configuration.**

---

## 🚨 Troubleshooting

### Services won't start
```bash
# Check if ports are in use
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :9092  # Kafka

# Reset everything
pnpm dev:reset
```

### Migrations fail
```bash
# Check PostgreSQL
docker exec -it tide-postgres psql -U tide -d tide -c "SELECT 1;"

# Re-run migrations
pnpm db:migrate
```

### Build errors
```bash
# Clean and rebuild
rm -rf packages/*/dist node_modules
pnpm install
pnpm build
```

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run tests: `pnpm test`
4. Build: `pnpm build`
5. Commit: `git commit -m "feat: add feature"`
6. Push: `git push origin feature/my-feature`
7. Create a Pull Request

---

## 📄 License

MIT

---

## 🆘 Support

- **Documentation:** [docs/](docs/) - Complete documentation index
- **Architecture:** [docs/architecture/CURRENT-ARCHITECTURE.md](docs/architecture/CURRENT-ARCHITECTURE.md) - System design
- **Issues:** Create a GitHub issue

---

**Built with ❤️ by the Tide Team**
