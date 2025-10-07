#!/bin/bash
set -e

echo "🔄 Resetting Tide development environment..."
echo "⚠️  This will DELETE all data in Docker volumes!"
read -p "Are you sure? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🗑️  Stopping and removing all containers and volumes..."
  docker-compose down -v

  echo "🐳 Starting fresh environment..."
  docker-compose up -d

  echo "✅ Tide development environment reset complete!"
else
  echo "❌ Reset cancelled"
fi
