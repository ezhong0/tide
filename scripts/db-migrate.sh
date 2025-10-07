#!/bin/bash
set -e

echo "📊 Running database migrations..."

# Check if PostgreSQL is running
if ! docker ps | grep -q tide-postgres; then
  echo "❌ PostgreSQL is not running. Start it with: pnpm dev:start"
  exit 1
fi

# Run migrations
for migration in packages/libraries/database/migrations/*.sql; do
  echo "  Running $(basename "$migration")..."
  docker exec -i tide-postgres psql -U tide -d tide < "$migration"
done

echo "✅ Database migrations complete!"
