# Infrastructure

This directory contains infrastructure-as-code templates and configurations for deploying Tide.

## Local Development

Use Docker Compose (in project root):

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Access services
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- RabbitMQ: localhost:5672
- RabbitMQ Management: http://localhost:15672
- pgAdmin: http://localhost:5050
```

## Deployment Options

### Option A: Railway (Recommended for MVP)

**Pros:**
- Extremely simple to set up
- Automatic deployments from GitHub
- Built-in PostgreSQL and Redis
- Generous free tier
- Excellent developer experience

**Setup:**
1. Connect GitHub repository
2. Add PostgreSQL and Redis plugins
3. Set environment variables
4. Deploy automatically on push to main

**Cost:** ~$20-50/month for MVP

### Option B: AWS (For Scale)

**Pros:**
- Full control and scalability
- Comprehensive service ecosystem
- Production-grade reliability

**Components:**
- **Compute**: ECS Fargate (containerized API)
- **Database**: RDS PostgreSQL
- **Cache**: ElastiCache Redis
- **Storage**: S3 (email archives, attachments)
- **Queue**: SQS + SNS
- **CDN**: CloudFront
- **Monitoring**: CloudWatch

**Cost:** ~$100-200/month for MVP

### Option C: Hybrid

Use Railway for API + Database, AWS for storage/queue:
- Railway: API server, PostgreSQL, Redis
- AWS: S3 (storage), SES (email sending), SQS (queues)

**Cost:** ~$30-80/month

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Random secret for JWT signing
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: OAuth credentials
- `OPENAI_API_KEY`: OpenAI API key
- `ENCRYPTION_KEY`: 32-byte hex key for credential encryption

Generate secrets:
```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Encryption Key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Migrations

```bash
# Generate migration
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

## Monitoring & Logging

- **Sentry**: Error tracking
- **DataDog/Axiom**: Logs and metrics
- **BetterStack**: Uptime monitoring

## Security

- All secrets stored in environment variables
- Credentials encrypted at rest (AES-256-GCM)
- TLS/HTTPS for all external communication
- Rate limiting on all API endpoints
- Input validation with Zod
- SQL injection prevention (Drizzle ORM)

## Scaling

**Horizontal Scaling:**
- API: Multiple instances behind load balancer
- Database: Read replicas for read-heavy queries
- Redis: Redis Cluster for high availability

**Vertical Scaling:**
- Increase instance sizes as needed
- PostgreSQL can scale to 1TB+ easily

**Sharding (10M+ users):**
- Shard by user ID hash
- See `docs/06-data-models-flows.md` for strategy
