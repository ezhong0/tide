# 🔐 Auth Service Template

A production-ready authentication service template for the Tide platform. This service demonstrates best practices for building microservices using the Week 0 foundation.

## Features

- ✅ User registration with email validation
- ✅ Login with bcrypt password hashing
- ✅ JWT access and refresh tokens
- ✅ Health check endpoint
- ✅ Database integration with transactions
- ✅ Structured logging
- ✅ Validation middleware
- ✅ Error handling
- ✅ Security headers (Helmet)
- ✅ CORS configured

## Quick Start

```bash
# Install dependencies
pnpm install

# Make sure infrastructure is running
pnpm dev:start

# Run migrations
pnpm db:migrate

# Start the service in development mode
cd packages/services/auth
pnpm dev

# The service will be available at:
# http://localhost:4001
```

## API Endpoints

### Health Check

```bash
GET /health

# Response:
{
  "status": "healthy",
  "service": "auth-service",
  "timestamp": "2025-10-06T...",
  "uptime": 123.45,
  "version": "0.1.0"
}
```

### Register

```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "timezone": "America/Los_Angeles"
}

# Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

# Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Refresh Token

```bash
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

# Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

## Architecture

### Layers

```
src/
├── index.ts                    # Express app setup
├── routes/                     # Route definitions
│   ├── health.ts               # Health check route
│   └── auth.ts                 # Auth routes
├── controllers/                # Business logic
│   └── auth.controller.ts      # Auth controller
└── middleware/                 # Middleware
    └── error-handler.ts        # Error handling
```

### Key Patterns Used

**1. Validation Middleware**
```typescript
import { validateBody } from '@tide/validation';
import { UserRegistrationSchema } from '@tide/validation';

authRouter.post('/register', validateBody(UserRegistrationSchema), register);
```

**2. Database Transactions**
```typescript
import { transaction } from '@tide/database';

const result = await transaction(async (client: PoolClient) => {
  await client.query('INSERT INTO tide.users ...');
  await client.query('INSERT INTO tide.user_profiles ...');
  return user;
});
```

**3. Structured Logging**
```typescript
import { logger } from '@tide/logger';

logger.info({ userId, email }, 'User registered successfully');
logger.error({ error }, 'Registration failed');
```

**4. Custom Error Handling**
```typescript
import { AuthErrors } from '@tide/errors';

throw AuthErrors.userAlreadyExists(email);
throw AuthErrors.invalidCredentials();
```

**5. Branded Types**
```typescript
import { createUserId } from '@tide/types';

const userId = createUserId(result.id);
```

## Security

- **Password Hashing**: bcrypt with cost factor 12
- **JWT**: Separate access and refresh tokens
- **Token Storage**: Refresh tokens stored in database
- **Token Expiry**: Access tokens expire in 15 minutes, refresh in 7 days
- **CORS**: Configurable via environment variables
- **Helmet**: Security headers enabled
- **Validation**: All inputs validated with Zod schemas
- **SQL Injection**: Prevented with parameterized queries

## Testing

```bash
# Run tests
pnpm test

# Test the API manually
curl -X GET http://localhost:4001/health

# Register a user
curl -X POST http://localhost:4001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User",
    "timezone": "UTC"
  }'
```

## Environment Variables

The service uses these variables from `.env`:

```bash
# Database
DATABASE_URL=postgresql://tide:tide_password@localhost:5432/tide

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Service
AUTH_SERVICE_PORT=4001

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:19006
```

## How This Template Helps Tracks

This template demonstrates:

1. **How to use shared packages** - All foundation packages integrated
2. **How to structure a service** - Clean architecture with layers
3. **How to handle authentication** - JWT with refresh tokens
4. **How to use the database** - Transactions, migrations, queries
5. **How to add validation** - Zod schemas and middleware
6. **How to handle errors** - Custom errors and global handler
7. **How to add logging** - Structured logging with context
8. **How to add health checks** - Simple but effective monitoring

## Extending This Template

### Add New Endpoints

1. Create new route in `src/routes/`
2. Add controller in `src/controllers/`
3. Add validation schema in `@tide/validation`
4. Register route in `src/index.ts`

### Add New Validations

```typescript
// In @tide/validation
export const MySchema = z.object({
  field: z.string(),
});

// In your route
authRouter.post('/endpoint', validateBody(MySchema), controller);
```

### Add Authentication Middleware

```typescript
// Create middleware to verify JWT
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw AuthErrors.missingToken();
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.accessTokenSecret);
    req.user = decoded;
    next();
  } catch (error) {
    throw AuthErrors.invalidToken();
  }
}

// Use in route
authRouter.get('/me', authenticate, getProfile);
```

## Production Considerations

Before deploying to production:

- [ ] Add rate limiting (use Redis)
- [ ] Add request ID tracking
- [ ] Add metrics collection (Prometheus)
- [ ] Add distributed tracing
- [ ] Add email verification flow
- [ ] Add password reset flow
- [ ] Add OAuth providers (Google, Microsoft)
- [ ] Add 2FA support
- [ ] Add session management
- [ ] Add account lockout after failed attempts
- [ ] Add GDPR compliance (data export, deletion)
- [ ] Add comprehensive test suite
- [ ] Add load testing
- [ ] Configure production secrets management
- [ ] Set up CI/CD pipeline

## Next Steps for Track 1 (Mobile Apps)

1. Use this template as reference for your auth service
2. Customize endpoints for mobile-specific needs
3. Add social login (Apple, Google)
4. Add device token management for push notifications
5. Integrate with WebSocket service for real-time updates

## Questions?

- See foundation documentation: `docs/guides/FOUNDATION-COMPLETE.md`
- Check shared packages: `packages/shared/*/README.md`
- Review Week 0 status: `WEEK-0-STATUS.md`
