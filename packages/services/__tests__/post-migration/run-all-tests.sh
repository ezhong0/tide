#!/bin/bash

# Post-Migration Test Suite Runner
# Executes all migration verification tests

set -e

echo "=========================================="
echo "Post-Migration Test Suite"
echo "=========================================="
echo ""

# Change to project root
cd /Users/edwardzhong/Projects/tide

echo "Running test suite..."
echo ""

# Run tests with vitest
echo "1. Database Singleton Tests..."
pnpm vitest run packages/services/__tests__/post-migration/database-singleton.test.ts

echo ""
echo "2. ServiceBase Lifecycle Tests..."
pnpm vitest run packages/services/__tests__/post-migration/service-base.test.ts

echo ""
echo "3. AI Service Integration Tests..."
pnpm vitest run packages/services/__tests__/post-migration/ai-service.test.ts

echo ""
echo "4. Service Integration Tests..."
pnpm vitest run packages/services/__tests__/post-migration/service-integration.test.ts

echo ""
echo "5. Compilation Verification Tests..."
pnpm vitest run packages/services/__tests__/post-migration/compilation.test.ts

echo ""
echo "=========================================="
echo "All Tests Complete!"
echo "=========================================="
