# Tide - AI Chief of Staff Platform

Tide is an AI-powered executive assistant that helps ambitious professionals manage their work and personal life through intelligent automation, email triage, calendar optimization, and workflow management.

## Architecture

Tide is built as a modern microservices architecture:

- **Frontend**: Native iOS (SwiftUI) and Android (Jetpack Compose) apps
- **Backend**: Node.js microservices with TypeScript
- **AI**: Multi-model orchestration (GPT-5, Claude, Gemini)
- **Data**: PostgreSQL, Redis, Kafka event bus
- **Infrastructure**: Docker, Kubernetes, AWS

## Project Structure

```
tide/
├── packages/
│   ├── shared/
│   │   ├── types/          # Shared TypeScript types and Zod schemas
│   │   ├── contracts/      # API contracts using ts-rest
│   │   └── utils/          # Shared utilities
│   └── libraries/
│       └── event-bus/      # Kafka event bus wrapper
├── services/
│   ├── gateway/            # API Gateway (port 4000)
│   ├── auth/               # Authentication service (port 4001)
│   ├── events/             # Event processing service
│   └── realtime/           # WebSocket real-time service
├── infrastructure/
│   ├── docker/             # Docker configuration
│   └── k8s/                # Kubernetes manifests
├── docs/                   # Documentation
└── docker-compose.yml      # Local development environment
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker and Docker Compose

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd tide/redesign
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start infrastructure services**

   ```bash
   docker-compose up -d
   ```

   This starts:
   - PostgreSQL (port 5432)
   - Redis (port 6379)
   - Kafka (port 29092)
   - Zookeeper (port 2181)
   - Kafka UI (port 8080)
   - Prometheus (port 9090)
   - Grafana (port 3001)

5. **Build all packages**

   ```bash
   pnpm build
   ```

6. **Start development services**

   ```bash
   # In separate terminals:
   pnpm --filter @tide/gateway dev
   pnpm --filter @tide/auth-service dev
   ```

### Development

#### Available Scripts

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Type checking
pnpm type-check

# Lint code
pnpm lint

# Clean build artifacts
pnpm clean
```

#### Service URLs

- **API Gateway**: http://localhost:4000
- **Auth Service**: http://localhost:4001
- **Kafka UI**: http://localhost:8080
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)

#### Database

PostgreSQL is available at `localhost:5432`:
- Database: `tide`
- Username: `tide`
- Password: `tide_dev_password`

```bash
# Connect to database
psql postgresql://tide:tide_dev_password@localhost:5432/tide
```

#### Kafka

Kafka is available at `localhost:29092`. View topics and messages at http://localhost:8080

### Testing

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm --filter @tide/types test

# Run tests in watch mode
pnpm --filter @tide/types test:watch
```

### API Documentation

The API uses `ts-rest` for type-safe contracts between client and server. See the contracts in `packages/shared/contracts/`.

#### Authentication

**Register**
```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe",
    "timezone": "America/Los_Angeles"
  }'
```

**Login**
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Refresh Token**
```bash
curl -X POST http://localhost:4000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token"
  }'
```

## Architecture Highlights

### Event-Driven Architecture

All services communicate through domain events published to Kafka:

```typescript
import { EventBus } from '@tide/event-bus';

const eventBus = new EventBus({
  brokers: ['localhost:29092'],
  clientId: 'my-service',
  groupId: 'my-service-group',
});

await eventBus.connect();

// Publish event
await eventBus.publish({
  id: crypto.randomUUID(),
  type: 'user.created',
  aggregateId: userId,
  aggregateType: 'user',
  payload: { user },
  metadata: { timestamp: Date.now(), version: 1 },
});

// Subscribe to events
eventBus.subscribe('user.created', async (event) => {
  console.log('User created:', event.payload.user);
});
```

### Type Safety

All types are defined using Zod schemas and shared across services:

```typescript
import { UserSchema, MessageSchema } from '@tide/types';

// Runtime validation
const user = UserSchema.parse(data);

// TypeScript types
type User = z.infer<typeof UserSchema>;
```

### API Contracts

Services use `ts-rest` for type-safe API contracts:

```typescript
import { authContract } from '@tide/contracts';
import { createExpressEndpoints } from '@ts-rest/express';

createExpressEndpoints(authContract, router, app);
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `pnpm test`
4. Run type checking: `pnpm type-check`
5. Submit a pull request

## License

Proprietary - All rights reserved
