# 🧪 Integration Testing Framework

Comprehensive guide for writing and running integration tests in the Tide platform.

## Overview

Integration tests verify that services work together correctly. The Tide platform provides:

1. **Week 0 Foundation Tests** - Verify infrastructure is ready
2. **Service Integration Tests** - Test service-to-service communication
3. **End-to-End Tests** - Test complete user workflows
4. **Load Tests** - Test performance under load

## Week 0 Foundation Tests

### Running Foundation Tests

```bash
# Run the Week 0 integration test
./scripts/test-week0-integration.sh

# This tests:
# ✅ PostgreSQL (running, schema, tables)
# ✅ Redis (running, basic operations)
# ✅ Kafka (running, topics)
# ✅ Monitoring (Kafka UI, Prometheus, Grafana)
# ✅ Packages (all build successfully)
# ✅ Service templates (Auth, Gateway)
# ✅ Environment (configs, docker-compose)
# ✅ Documentation (all required docs)
# ✅ Scripts (dev scripts exist and are executable)
```

### Expected Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌊 Week 0 Foundation Integration Test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━ Database Tests ━━━
✅ PASS PostgreSQL is running
✅ PASS PostgreSQL has tide schema
✅ PASS Database has at least 11 tables
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Test Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Passed: 45
❌ Failed: 0

✅ Week 0 Foundation: READY FOR PARALLEL TRACK DEVELOPMENT
```

## Service Integration Tests

### Test Structure

Create integration tests in `tests/integration/` directory:

```
tests/
├── integration/
│   ├── auth/
│   │   ├── registration.test.ts
│   │   ├── login.test.ts
│   │   └── token-refresh.test.ts
│   ├── ai/
│   │   ├── conversation.test.ts
│   │   └── intent-detection.test.ts
│   ├── email/
│   │   └── triage.test.ts
│   └── end-to-end/
│       ├── user-journey.test.ts
│       └── workflow.test.ts
└── load/
    └── stress-test.ts
```

### Example: Auth Service Integration Test

```typescript
// tests/integration/auth/registration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { query } from '@tide/database';

const API_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';

describe('Auth Service - Registration', () => {
  beforeAll(async () => {
    // Ensure database is clean
    await query('DELETE FROM tide.users WHERE email LIKE $1', ['test%@example.com']);
  });

  afterAll(async () => {
    // Cleanup
    await query('DELETE FROM tide.users WHERE email LIKE $1', ['test%@example.com']);
  });

  it('should register a new user successfully', async () => {
    const response = await request(API_URL)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
        timezone: 'UTC',
      })
      .expect(201);

    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.user.email).toBe('test@example.com');
    expect(response.body.user.name).toBe('Test User');
  });

  it('should reject duplicate email', async () => {
    const response = await request(API_URL)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User 2',
        timezone: 'UTC',
      })
      .expect(409);

    expect(response.body.error.code).toBe('USER_ALREADY_EXISTS');
  });

  it('should reject weak password', async () => {
    const response = await request(API_URL)
      .post('/auth/register')
      .send({
        email: 'test2@example.com',
        password: 'weak',
        name: 'Test User',
        timezone: 'UTC',
      })
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

### Example: Service-to-Service Integration

```typescript
// tests/integration/ai/conversation.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { publishEvent, consumeEvent } from '@tide/testing-utils';

const GATEWAY_URL = 'http://localhost:4000/graphql';

describe('AI Service - Conversation Flow', () => {
  it('should process message end-to-end', async () => {
    // 1. User sends message via Gateway
    const mutation = `
      mutation SendMessage($text: String!) {
        sendMessage(text: $text) {
          id
          text
          intent {
            type
            confidence
          }
        }
      }
    `;

    const response = await request(GATEWAY_URL)
      .post('/')
      .send({
        query: mutation,
        variables: {
          text: 'Schedule a meeting with Bob tomorrow at 2pm',
        },
      })
      .set('Authorization', `Bearer ${testAccessToken}`)
      .expect(200);

    const message = response.body.data.sendMessage;

    // 2. Verify AI detected intent
    expect(message.intent.type).toBe('schedule_meeting');
    expect(message.intent.confidence).toBeGreaterThan(0.8);

    // 3. Verify event was published to Kafka
    const event = await consumeEvent('message.events', {
      timeout: 5000,
      filter: (e) => e.type === 'message.processed' && e.payload.messageId === message.id,
    });

    expect(event).toBeDefined();
    expect(event.payload.intent).toBe('schedule_meeting');
  });
});
```

### Example: End-to-End Test

```typescript
// tests/integration/end-to-end/user-journey.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';

const GATEWAY_URL = 'http://localhost:4000/graphql';

describe('End-to-End User Journey', () => {
  let accessToken: string;
  let userId: string;

  it('should complete full user journey', async () => {
    // 1. Register
    const registerResponse = await request('http://localhost:4001')
      .post('/auth/register')
      .send({
        email: 'journey@example.com',
        password: 'SecurePass123!',
        name: 'Journey User',
        timezone: 'UTC',
      })
      .expect(201);

    accessToken = registerResponse.body.accessToken;
    userId = registerResponse.body.user.id;

    // 2. Send a message
    const sendMessageResponse = await request(GATEWAY_URL)
      .post('/')
      .send({
        query: `
          mutation {
            sendMessage(text: "What's my schedule today?") {
              id
              text
            }
          }
        `,
      })
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const messageId = sendMessageResponse.body.data.sendMessage.id;

    // 3. AI should process and respond
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for AI processing

    const messagesResponse = await request(GATEWAY_URL)
      .post('/')
      .send({
        query: `
          query {
            myConversations {
              messages {
                id
                text
                role
              }
            }
          }
        `,
      })
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const messages = messagesResponse.body.data.myConversations[0].messages;

    // Should have user message + AI response
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('user');
    expect(messages[1].role).toBe('assistant');

    // 4. Verify calendar was checked
    const calendarResponse = await request(GATEWAY_URL)
      .post('/')
      .send({
        query: `
          query {
            todayEvents {
              id
              title
              startTime
            }
          }
        `,
      })
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(calendarResponse.body.data.todayEvents).toBeDefined();
  });
});
```

## Load Testing

### Using Artillery

```bash
# Install Artillery
npm install -g artillery

# Create load test config
cat > tests/load/auth-load-test.yml <<EOF
config:
  target: "http://localhost:4001"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"

scenarios:
  - name: "Register and Login"
    flow:
      - post:
          url: "/auth/register"
          json:
            email: "{{ $randomString() }}@example.com"
            password: "SecurePass123!"
            name: "Load Test User"
            timezone: "UTC"
      - post:
          url: "/auth/login"
          json:
            email: "{{ email }}"
            password: "SecurePass123!"
EOF

# Run load test
artillery run tests/load/auth-load-test.yml
```

### Using k6

```javascript
// tests/load/api-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up
    { duration: '1m', target: 100 },  // Sustained load
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% errors
  },
};

export default function () {
  const url = 'http://localhost:4000/graphql';

  const query = `
    query {
      me {
        id
        name
        email
      }
    }
  `;

  const payload = JSON.stringify({ query });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${__ENV.ACCESS_TOKEN}`,
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has data': (r) => r.json('data') !== null,
  });

  sleep(1);
}
```

```bash
# Run k6 test
k6 run tests/load/api-load-test.js
```

## Test Utilities

### Event Testing Helpers

```typescript
// tests/utils/event-helpers.ts
import { Kafka, Consumer } from 'kafkajs';
import { kafkaConfig } from '@tide/config';

const kafka = new Kafka({
  clientId: 'test-client',
  brokers: [kafkaConfig.brokers],
});

export async function consumeEvent(
  topic: string,
  options: {
    timeout?: number;
    filter?: (event: any) => boolean;
  } = {}
): Promise<any> {
  const { timeout = 5000, filter } = options;

  const consumer: Consumer = kafka.consumer({ groupId: 'test-group' });
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      consumer.disconnect();
      reject(new Error(`Timeout waiting for event on topic ${topic}`));
    }, timeout);

    consumer.run({
      eachMessage: async ({ message }) => {
        const event = JSON.parse(message.value!.toString());

        if (!filter || filter(event)) {
          clearTimeout(timeoutId);
          await consumer.disconnect();
          resolve(event);
        }
      },
    });
  });
}

export async function publishEvent(topic: string, event: any): Promise<void> {
  const producer = kafka.producer();
  await producer.connect();

  await producer.send({
    topic,
    messages: [
      {
        value: JSON.stringify(event),
      },
    ],
  });

  await producer.disconnect();
}
```

### Database Helpers

```typescript
// tests/utils/db-helpers.ts
import { query } from '@tide/database';

export async function createTestUser(email: string, password: string) {
  const [user] = await query(
    `INSERT INTO tide.users (email, password_hash, name, status)
     VALUES ($1, $2, $3, 'active')
     RETURNING *`,
    [email, password, 'Test User']
  );

  return user;
}

export async function cleanupTestData() {
  await query('DELETE FROM tide.users WHERE email LIKE $1', ['test%@example.com']);
  await query('DELETE FROM tide.conversations WHERE user_id NOT IN (SELECT id FROM tide.users)');
}
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: tide
          POSTGRES_PASSWORD: tide_password
          POSTGRES_DB: tide
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

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Run migrations
        run: pnpm db:migrate

      - name: Build packages
        run: pnpm build

      - name: Run Week 0 integration tests
        run: ./scripts/test-week0-integration.sh

      - name: Run service integration tests
        run: pnpm test:integration
```

## Best Practices

### 1. Test Isolation

- Each test should be independent
- Clean up data after tests
- Don't rely on test execution order

### 2. Use Fixtures

```typescript
// tests/fixtures/users.ts
export const testUsers = {
  alice: {
    email: 'alice@example.com',
    password: 'AlicePass123!',
    name: 'Alice Smith',
  },
  bob: {
    email: 'bob@example.com',
    password: 'BobPass123!',
    name: 'Bob Jones',
  },
};
```

### 3. Mock External Services

```typescript
// tests/mocks/openai.ts
import nock from 'nock';

export function mockOpenAI() {
  nock('https://api.openai.com')
    .post('/v1/chat/completions')
    .reply(200, {
      choices: [
        {
          message: {
            content: 'Mocked AI response',
          },
        },
      ],
    });
}
```

### 4. Test Error Scenarios

```typescript
it('should handle database connection failure', async () => {
  // Simulate database down
  await stopPostgreSQL();

  const response = await request(API_URL)
    .get('/health')
    .expect(503);

  expect(response.body.status).toBe('unhealthy');

  await startPostgreSQL();
});
```

### 5. Performance Assertions

```typescript
it('should respond within 500ms', async () => {
  const start = Date.now();

  await request(API_URL)
    .post('/auth/login')
    .send({ email: 'test@example.com', password: 'pass' });

  const duration = Date.now() - start;

  expect(duration).toBeLessThan(500);
});
```

## Running Tests

```bash
# Run Week 0 foundation tests
./scripts/test-week0-integration.sh

# Run all integration tests
pnpm test:integration

# Run specific test file
pnpm test tests/integration/auth/registration.test.ts

# Run with coverage
pnpm test:integration --coverage

# Run in watch mode
pnpm test:integration --watch

# Run load tests
artillery run tests/load/auth-load-test.yml
k6 run tests/load/api-load-test.js
```

## Next Steps for Tracks

1. **Track 1 (Mobile Apps)**: Add auth integration tests, WebSocket tests
2. **Track 2 (AI)**: Add conversation tests, intent detection tests
3. **Track 3 (Email)**: Add OAuth flow tests, triage tests
4. **Track 4 (Workflow)**: Add workflow execution tests, API Gateway federation tests

## Resources

- **Vitest**: https://vitest.dev/
- **Supertest**: https://github.com/visionmedia/supertest
- **Artillery**: https://www.artillery.io/docs
- **k6**: https://k6.io/docs/
- **Testing Best Practices**: https://testingjavascript.com/

## Questions?

- See Week 0 status: `WEEK-0-STATUS.md`
- Check service templates: `packages/services/*/README.md`
- Review foundation guide: `docs/guides/FOUNDATION-COMPLETE.md`
