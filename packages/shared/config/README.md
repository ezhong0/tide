# @tide/config

Type-safe configuration management with environment variable validation for the Tide platform.

## Features

- Environment variable validation with Zod
- Type-safe configuration objects
- Sensible defaults
- Feature flags
- Database, Redis, Kafka configuration
- Authentication and OAuth configuration
- AI service configuration
- Server and CORS configuration

## Installation

```bash
pnpm add @tide/config
```

## Usage

### Environment Variables

The config package automatically loads and validates environment variables on import:

```typescript
import { env, isProduction, isDevelopment } from '@tide/config';

console.log(env.PORT); // Type-safe access
console.log(env.DATABASE_URL);

if (isProduction) {
  // Production-specific logic
}
```

### Database Configuration

```typescript
import { databaseConfig, redisConfig, kafkaConfig } from '@tide/config';

// PostgreSQL configuration
const pool = new Pool({
  connectionString: databaseConfig.url,
  ssl: databaseConfig.ssl,
  ...databaseConfig.pool
});

// Redis configuration
const redis = new Redis(redisConfig.url, {
  maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
  retryStrategy: redisConfig.retryStrategy
});

// Kafka configuration
const kafka = new Kafka({
  brokers: kafkaConfig.brokers,
  clientId: kafkaConfig.clientId
});
```

### Authentication Configuration

```typescript
import { jwtConfig, passwordConfig, gmailOAuthConfig } from '@tide/config';

// JWT tokens
const accessToken = jwt.sign(payload, jwtConfig.accessSecret, {
  expiresIn: jwtConfig.accessExpiresIn
});

// Password hashing
const hash = await bcrypt.hash(password, passwordConfig.bcryptRounds);

// OAuth (null if not configured)
if (gmailOAuthConfig) {
  const oauth2Client = new OAuth2Client(
    gmailOAuthConfig.clientId,
    gmailOAuthConfig.clientSecret,
    gmailOAuthConfig.redirectUri
  );
}
```

### AI Service Configuration

```typescript
import { aiServiceConfig } from '@tide/config';

// OpenAI (undefined if not configured)
if (aiServiceConfig.openai) {
  const openai = new OpenAI({
    apiKey: aiServiceConfig.openai.apiKey,
    organization: aiServiceConfig.openai.orgId
  });
}

// Anthropic (undefined if not configured)
if (aiServiceConfig.anthropic) {
  const anthropic = new Anthropic({
    apiKey: aiServiceConfig.anthropic.apiKey
  });
}
```

### Feature Flags

```typescript
import { features, isFeatureEnabled, requireFeature } from '@tide/config';

// Check if feature is enabled
if (isFeatureEnabled('ai')) {
  // AI features enabled
}

// Require feature or throw error
requireFeature('workflowEngine'); // Throws if not enabled
```

### Server Configuration

```typescript
import { serverConfig, websocketConfig } from '@tide/config';

// HTTP server with CORS
app.use(cors({
  origin: serverConfig.cors.origins,
  credentials: serverConfig.cors.credentials,
  methods: serverConfig.cors.methods
}));

app.listen(serverConfig.port);

// WebSocket server
const io = new Server({
  cors: {
    origin: websocketConfig.cors.origins,
    credentials: websocketConfig.cors.credentials
  },
  pingTimeout: websocketConfig.pingTimeout,
  pingInterval: websocketConfig.pingInterval
});
```

## Required Environment Variables

### Application
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `KAFKA_BROKERS` - Comma-separated Kafka brokers
- `JWT_ACCESS_SECRET` - JWT access token secret (min 32 chars)
- `JWT_REFRESH_SECRET` - JWT refresh token secret (min 32 chars)

### Optional Environment Variables

#### Application
- `NODE_ENV` - Environment (development|test|staging|production)
- `PORT` - HTTP server port (default: 4000)
- `LOG_LEVEL` - Log level (debug|info|warn|error)

#### Database
- `DATABASE_POOL_MIN` - Min pool size (default: 2)
- `DATABASE_POOL_MAX` - Max pool size (default: 10)
- `DATABASE_SSL` - Enable SSL (default: false)

#### Redis
- `REDIS_MAX_RETRIES` - Max retry attempts (default: 3)

#### Kafka
- `KAFKA_CLIENT_ID` - Client identifier (default: tide-platform)
- `KAFKA_GROUP_ID` - Consumer group (default: tide-consumers)

#### Authentication
- `JWT_ACCESS_EXPIRES_IN` - Access token TTL (default: 15m)
- `JWT_REFRESH_EXPIRES_IN` - Refresh token TTL (default: 30d)
- `BCRYPT_ROUNDS` - Bcrypt rounds (default: 12)

#### OAuth - Gmail
- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_REDIRECT_URI`

#### OAuth - Microsoft Exchange
- `EXCHANGE_CLIENT_ID`
- `EXCHANGE_CLIENT_SECRET`
- `EXCHANGE_TENANT_ID`
- `EXCHANGE_REDIRECT_URI`

#### OAuth - Google Calendar
- `GOOGLE_CALENDAR_CLIENT_ID`
- `GOOGLE_CALENDAR_CLIENT_SECRET`
- `GOOGLE_CALENDAR_REDIRECT_URI`

#### AI Services
- `OPENAI_API_KEY`
- `OPENAI_ORG_ID`
- `ANTHROPIC_API_KEY`

#### Vector Database
- `PINECONE_API_KEY`
- `PINECONE_ENVIRONMENT`
- `PINECONE_INDEX_NAME` (default: tide-embeddings)

#### Monitoring
- `SENTRY_DSN`
- `DATADOG_API_KEY`

#### Feature Flags
- `ENABLE_AI_FEATURES` (default: true)
- `ENABLE_EMAIL_SYNC` (default: true)
- `ENABLE_CALENDAR_SYNC` (default: true)
- `ENABLE_WORKFLOW_ENGINE` (default: true)

#### CORS & Rate Limiting
- `ALLOWED_ORIGINS` - Comma-separated (default: http://localhost:3000)
- `RATE_LIMIT_WINDOW_MS` (default: 900000 - 15 min)
- `RATE_LIMIT_MAX_REQUESTS` (default: 100)

#### WebSocket
- `WEBSOCKET_PORT` (default: 4003)
- `WEBSOCKET_CORS_ORIGINS` (default: http://localhost:3000)

#### Email
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM`

## Environment File Example

Create `.env` in project root:

```env
# Application
NODE_ENV=development
PORT=4000
LOG_LEVEL=debug

# Database
DATABASE_URL=postgresql://tide:password@localhost:5432/tide
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_SSL=false

# Redis
REDIS_URL=redis://localhost:6379

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=tide-platform
KAFKA_GROUP_ID=tide-consumers

# Authentication
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
BCRYPT_ROUNDS=12

# AI Services (optional)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_EMAIL_SYNC=true
ENABLE_CALENDAR_SYNC=true
ENABLE_WORKFLOW_ENGINE=true

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Validation

The config package validates all environment variables on startup. If validation fails, it will print detailed error messages and exit:

```
❌ Environment validation failed:
  - DATABASE_URL: Required
  - JWT_ACCESS_SECRET: String must contain at least 32 character(s)
```

## Type Safety

All configuration is fully typed:

```typescript
import { env, DatabaseConfig, AIServiceConfig } from '@tide/config';

// env is typed as Env
const port: number = env.PORT;

// Configuration objects are typed
function setupDatabase(config: DatabaseConfig) {
  // ...
}

setupDatabase(databaseConfig); // Type-safe
```

## Best Practices

1. **Never commit secrets** - Use `.env` files (add to `.gitignore`)
2. **Use different configs per environment** - `.env.development`, `.env.production`
3. **Validate early** - Config loads on import, fails fast
4. **Use feature flags** - Enable/disable features without code changes
5. **Type-safe access** - Always use exported config objects

## License

MIT
