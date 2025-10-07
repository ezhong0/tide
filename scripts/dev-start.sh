#!/bin/bash
set -e

echo "🌊 Starting Tide development environment..."

# Check if .env exists
if [ ! -f .env ]; then
  echo "⚠️  No .env file found. Copying .env.example to .env..."
  cp .env.example .env
  echo "📝 Please update .env with your configuration"
fi

# Start infrastructure services
echo "🐳 Starting PostgreSQL, Redis, and Kafka..."
docker-compose up -d postgres redis zookeeper kafka

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 15

# Check service health
echo "🏥 Checking service health..."
docker-compose ps

echo "✅ Tide infrastructure is ready!"
echo ""
echo "📊 Service URLs:"
echo "  PostgreSQL: localhost:5432"
echo "  Redis: localhost:6379"
echo "  Kafka: localhost:9092"
echo ""
echo "🚀 To start building:"
echo "  pnpm install"
echo "  pnpm build"
echo ""
echo "🛑 To stop: pnpm dev:stop"
