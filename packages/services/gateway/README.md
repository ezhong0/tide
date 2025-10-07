# 🚪 API Gateway Template

A production-ready API Gateway using Apollo GraphQL Federation for the Tide platform. This gateway provides a unified GraphQL API that federates multiple microservices.

## Features

- ✅ Apollo Federation v2
- ✅ GraphQL schema stitching across services
- ✅ Health check endpoint
- ✅ CORS configuration
- ✅ Security headers (Helmet)
- ✅ Structured logging
- ✅ Error tracking
- ✅ JWT context extraction
- ✅ Service health monitoring
- ✅ Introspection (development only)

## Quick Start

```bash
# Install dependencies
pnpm install

# Make sure infrastructure is running
pnpm dev:start

# Start the gateway in development mode
cd packages/services/gateway
pnpm dev

# The gateway will be available at:
# http://localhost:4000
# GraphQL Playground: http://localhost:4000/graphql
```

## API Endpoints

### Health Check

```bash
GET /health

# Response:
{
  "status": "healthy",
  "service": "api-gateway",
  "timestamp": "2025-10-06T...",
  "uptime": 123.45,
  "version": "0.1.0"
}
```

### GraphQL Endpoint

```bash
POST /graphql
Content-Type: application/json

{
  "query": "query { ... }",
  "variables": {}
}
```

## Apollo Federation

### What is Apollo Federation?

Apollo Federation lets you combine multiple GraphQL services (subgraphs) into a single unified API (supergraph). Each service owns its data and schemas, but clients query them through one endpoint.

**Benefits:**
- Independent service development and deployment
- Type-safe schema composition
- Automatic query planning
- Cross-service relationships
- Distributed architecture

### Adding Subgraph Services

When your services implement GraphQL, add them to the gateway:

```typescript
// In src/index.ts
const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'auth', url: 'http://localhost:4001/graphql' },
      { name: 'ai', url: 'http://localhost:4002/graphql' },
      { name: 'email', url: 'http://localhost:4003/graphql' },
      { name: 'calendar', url: 'http://localhost:4004/graphql' },
      { name: 'workflow', url: 'http://localhost:4005/graphql' },
    ],
  }),
});
```

## Creating a Federated Subgraph

### 1. Install Dependencies

```bash
npm install @apollo/subgraph graphql
```

### 2. Define Your Schema

```typescript
// In your service (e.g., auth-service)
import { buildSubgraphSchema } from '@apollo/subgraph';
import gql from 'graphql-tag';

const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key"])

  type User @key(fields: "id") {
    id: ID!
    email: String!
    name: String!
  }

  type Query {
    me: User
  }

  type Mutation {
    register(email: String!, password: String!, name: String!): User!
    login(email: String!, password: String!): AuthPayload!
  }

  type AuthPayload {
    user: User!
    accessToken: String!
    refreshToken: String!
  }
`;

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      // Get user from database
      return user;
    },
  },
  Mutation: {
    register: async (_, { email, password, name }) => {
      // Your registration logic
    },
    login: async (_, { email, password }) => {
      // Your login logic
    },
  },
  User: {
    __resolveReference: async (user) => {
      // Resolve user by ID (for federation)
      return getUserById(user.id);
    },
  },
};

const schema = buildSubgraphSchema({ typeDefs, resolvers });
```

### 3. Create Apollo Server

```typescript
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';

const server = new ApolloServer({ schema });

await server.start();

app.use(
  '/graphql',
  expressMiddleware(server, {
    context: async ({ req }) => ({
      token: req.headers.authorization,
    }),
  })
);
```

## Cross-Service Relationships

Federation allows services to reference entities from other services:

```typescript
// In ai-service
const typeDefs = gql`
  extend type User @key(fields: "id") {
    id: ID! @external
    conversations: [Conversation!]!
  }

  type Conversation {
    id: ID!
    user: User!
    messages: [Message!]!
  }
`;

const resolvers = {
  User: {
    conversations: async (user) => {
      // Get conversations for this user
      return getConversationsByUserId(user.id);
    },
  },
};
```

Now clients can query:
```graphql
query {
  me {
    id
    name          # From auth service
    email         # From auth service
    conversations {  # From ai service
      id
      messages {
        text
      }
    }
  }
}
```

## Authentication Context

The gateway extracts JWT tokens and passes them to subgraphs:

```typescript
// In gateway
app.use(
  '/graphql',
  expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization?.replace('Bearer ', '');

      // Verify token and extract user
      let user = null;
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          user = decoded;
        } catch (error) {
          // Invalid token
        }
      }

      return { user, token };
    },
  })
);
```

Subgraphs receive this context:

```typescript
// In subgraph resolver
const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      return getUserById(user.userId);
    },
  },
};
```

## Error Handling

The gateway logs all GraphQL errors:

```typescript
plugins: [
  {
    async requestDidStart() {
      return {
        async didEncounterErrors(requestContext) {
          logger.error({
            errors: requestContext.errors,
            query: requestContext.request.query,
          }, 'GraphQL errors encountered');
        },
      };
    },
  },
],
```

## Environment Variables

```bash
# Gateway
GATEWAY_PORT=4000

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:19006

# Subgraph URLs (when services are ready)
AUTH_SERVICE_URL=http://localhost:4001/graphql
AI_SERVICE_URL=http://localhost:4002/graphql
EMAIL_SERVICE_URL=http://localhost:4003/graphql
CALENDAR_SERVICE_URL=http://localhost:4004/graphql
WORKFLOW_SERVICE_URL=http://localhost:4005/graphql
```

## Example Client Usage

### React/React Native

```typescript
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:4000/graphql',
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  }),
  cache: new InMemoryCache(),
});

// Query
const { data } = await client.query({
  query: gql`
    query {
      me {
        id
        name
        email
        conversations {
          id
          messages {
            text
          }
        }
      }
    }
  `,
});

// Mutation
const { data } = await client.mutate({
  mutation: gql`
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        user {
          id
          name
        }
        accessToken
        refreshToken
      }
    }
  `,
  variables: {
    email: 'user@example.com',
    password: 'SecurePass123!',
  },
});
```

### curl

```bash
# Query
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "query { me { id name email } }"
  }'

# Mutation
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Login($email: String!, $password: String!) { login(email: $email, password: $password) { user { id name } accessToken } }",
    "variables": {
      "email": "user@example.com",
      "password": "SecurePass123!"
    }
  }'
```

## Current State

**Status**: Template ready, waiting for subgraph services

The gateway is configured but has no subgraphs yet. As tracks implement GraphQL in their services, they can be added to the `subgraphs` array.

### Next Steps for Track 4 (Task & Workflow)

Track 4 is recommended to own the API Gateway:

1. Use this template as a starting point
2. Implement GraphQL in your workflow service
3. Add your service as the first subgraph
4. Coordinate with other tracks to add their services
5. Configure authentication middleware
6. Add rate limiting (using Redis)
7. Add query complexity limits
8. Add persisted queries for security
9. Set up monitoring and metrics

## Production Considerations

Before deploying:

- [ ] Add rate limiting per user/IP
- [ ] Add query complexity analysis
- [ ] Add query depth limiting
- [ ] Enable persisted queries
- [ ] Add request ID tracking
- [ ] Configure distributed tracing
- [ ] Set up metrics collection
- [ ] Add circuit breakers for subgraphs
- [ ] Configure caching (Redis)
- [ ] Add query whitelisting
- [ ] Set up CDN for static schema
- [ ] Configure load balancer
- [ ] Add DDoS protection
- [ ] Set up comprehensive logging
- [ ] Add performance monitoring

## Resources

- **Apollo Federation**: https://www.apollographql.com/docs/federation/
- **Apollo Server**: https://www.apollographql.com/docs/apollo-server/
- **GraphQL Best Practices**: https://graphql.org/learn/best-practices/
- **Schema Design**: https://www.apollographql.com/docs/federation/federated-types/overview/

## Questions?

- See foundation documentation: `docs/guides/FOUNDATION-COMPLETE.md`
- Check shared packages: `packages/shared/*/README.md`
- Review Week 0 status: `WEEK-0-STATUS.md`
