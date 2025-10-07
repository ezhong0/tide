#!/bin/bash

echo "🏥 Checking service health..."
echo ""

# Check Gateway
echo "📡 Gateway (port 4000):"
curl -sf http://localhost:4000/health | jq '.' || echo "❌ Gateway is not responding"
echo ""

# Check Auth Service
echo "🔐 Auth Service (port 4001):"
curl -sf http://localhost:4001/health | jq '.' || echo "❌ Auth service is not responding"
echo ""

# Check PostgreSQL
echo "🗄️  PostgreSQL (port 5432):"
psql postgresql://tide:tide_dev_password@localhost:5432/tide -c "SELECT 1" > /dev/null 2>&1 && echo "✅ PostgreSQL is healthy" || echo "❌ PostgreSQL is not responding"
echo ""

# Check Redis
echo "⚡ Redis (port 6379):"
redis-cli -a tide_redis_password ping > /dev/null 2>&1 && echo "✅ Redis is healthy" || echo "❌ Redis is not responding"
echo ""

# Check Kafka
echo "📨 Kafka (port 29092):"
nc -z localhost 29092 > /dev/null 2>&1 && echo "✅ Kafka is healthy" || echo "❌ Kafka is not responding"
echo ""

echo "✅ Health check complete!"
