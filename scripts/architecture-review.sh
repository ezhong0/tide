#!/bin/bash
# Comprehensive Architecture Review Script
# Checks for legacy code, architectural debt, and areas for improvement

set -e

ROOT_DIR="/Users/edwardzhong/Projects/tide"
cd "$ROOT_DIR"

echo "🔍 COMPREHENSIVE ARCHITECTURE REVIEW"
echo "===================================="
echo ""

# 1. Check for legacy table references
echo "1️⃣  Checking for legacy table references..."
LEGACY_TABLES=(
  "email_messages"
  "email_threads"
  "email_triage"
  "calendar_events"
  "meeting_briefs"
  "meeting_conflicts"
  "calendar_optimizations"
  "user_profiles"
  "scheduling_preferences"
  "relationship_intelligence"
  "subtasks"
  "task_dependencies"
  "patterns"
  "user_behaviors"
  "detected_patterns"
  "pattern_sequences"
  "temporal_patterns"
  "sequential_patterns"
  "automation_suggestions"
  "daily_snapshots"
)

LEGACY_FOUND=0
for table in "${LEGACY_TABLES[@]}"; do
  matches=$(grep -r "\.from(['\"]$table['\"])" packages/services --include="*.ts" 2>/dev/null | wc -l || echo "0")
  if [ "$matches" -gt 0 ]; then
    echo "  ⚠️  Found $matches references to legacy table '$table'"
    LEGACY_FOUND=$((LEGACY_FOUND + matches))
  fi
done

if [ "$LEGACY_FOUND" -eq 0 ]; then
  echo "  ✅ No legacy table references found"
else
  echo "  ⚠️  Total legacy references: $LEGACY_FOUND"
fi
echo ""

# 2. Check for TODO/FIXME comments
echo "2️⃣  Checking for TODO/FIXME comments..."
TODO_COUNT=$(grep -r "TODO\|FIXME\|HACK\|XXX" packages/services packages/libraries --include="*.ts" 2>/dev/null | wc -l || echo "0")
echo "  Found $TODO_COUNT TODO/FIXME comments"
if [ "$TODO_COUNT" -gt 10 ]; then
  echo "  ⚠️  Consider addressing high-priority TODOs"
  grep -r "TODO\|FIXME" packages/services --include="*.ts" 2>/dev/null | head -10
fi
echo ""

# 3. Check for 'any' types (type safety)
echo "3️⃣  Checking for 'any' types (type safety)..."
ANY_COUNT=$(grep -r ": any\|as any\|<any>" packages/services packages/libraries --include="*.ts" ! -path "*/node_modules/*" ! -path "*/dist/*" 2>/dev/null | wc -l || echo "0")
echo "  Found $ANY_COUNT uses of 'any' type"
if [ "$ANY_COUNT" -gt 50 ]; then
  echo "  ⚠️  Consider replacing 'any' with proper types"
fi
echo ""

# 4. Check for console.log (should use logger)
echo "4️⃣  Checking for console.log statements..."
CONSOLE_COUNT=$(grep -r "console\.\(log\|error\|warn\|info\)" packages/services packages/libraries --include="*.ts" ! -path "*/node_modules/*" ! -path "*/dist/*" ! -path "*/__tests__/*" 2>/dev/null | wc -l || echo "0")
if [ "$CONSOLE_COUNT" -gt 0 ]; then
  echo "  ⚠️  Found $CONSOLE_COUNT console statements (should use logger)"
else
  echo "  ✅ All logging uses structured logger"
fi
echo ""

# 5. Check for unused imports
echo "5️⃣  Checking TypeScript compilation..."
if pnpm tsc --noEmit 2>&1 | grep -q "error TS"; then
  echo "  ⚠️  TypeScript compilation has errors"
  pnpm tsc --noEmit 2>&1 | grep "error TS" | head -10
else
  echo "  ✅ TypeScript compilation successful"
fi
echo ""

# 6. Check for large files (>500 lines)
echo "6️⃣  Checking for large files (potential refactoring candidates)..."
LARGE_FILES=$(find packages/services packages/libraries -name "*.ts" ! -path "*/node_modules/*" ! -path "*/dist/*" -type f -exec wc -l {} \; | awk '$1 > 500 {print $2" ("$1" lines)"}' | head -10)
if [ -n "$LARGE_FILES" ]; then
  echo "  ⚠️  Files over 500 lines:"
  echo "$LARGE_FILES"
else
  echo "  ✅ No excessively large files"
fi
echo ""

# 7. Check for proper error handling
echo "7️⃣  Checking error handling patterns..."
UNHANDLED_PROMISES=$(grep -r "await.*\..*(" packages/services --include="*.ts" ! -path "*/node_modules/*" ! -path "*/dist/*" ! -path "*/__tests__/*" | grep -v "try\|catch\|\.catch\|Promise\." | wc -l || echo "0")
if [ "$UNHANDLED_PROMISES" -gt 0 ]; then
  echo "  ⚠️  Found $UNHANDLED_PROMISES potential unhandled promises"
else
  echo "  ✅ Promise handling looks good"
fi
echo ""

# 8. Check for security issues
echo "8️⃣  Checking for potential security issues..."
SECURITY_PATTERNS=(
  "eval("
  "Function("
  "innerHTML"
  "dangerouslySet"
  "password.*=.*['\"]"
  "token.*=.*['\"]"
)

SECURITY_ISSUES=0
for pattern in "${SECURITY_PATTERNS[@]}"; do
  matches=$(grep -r "$pattern" packages --include="*.ts" ! -path "*/node_modules/*" ! -path "*/dist/*" 2>/dev/null | wc -l || echo "0")
  if [ "$matches" -gt 0 ]; then
    echo "  ⚠️  Found $matches instances of potentially unsafe pattern: $pattern"
    SECURITY_ISSUES=$((SECURITY_ISSUES + matches))
  fi
done

if [ "$SECURITY_ISSUES" -eq 0 ]; then
  echo "  ✅ No obvious security issues found"
fi
echo ""

# 9. Check database schema compliance
echo "9️⃣  Checking database schema compliance..."
SCHEMA_ERRORS=0

# Check for old field names
OLD_FIELDS=("is_read" "received_at" "from_address" "all_day")
for field in "${OLD_FIELDS[@]}"; do
  matches=$(grep -r "\\.$field\|['\"]$field['\"]" packages/services --include="*.ts" ! -path "*/node_modules/*" ! -path "*/dist/*" 2>/dev/null | wc -l || echo "0")
  if [ "$matches" -gt 0 ]; then
    echo "  ⚠️  Found $matches uses of old field name '$field'"
    SCHEMA_ERRORS=$((SCHEMA_ERRORS + matches))
  fi
done

if [ "$SCHEMA_ERRORS" -eq 0 ]; then
  echo "  ✅ Schema compliance looks good"
fi
echo ""

# 10. Summary
echo "📊 REVIEW SUMMARY"
echo "=================="
echo "Legacy table references: $LEGACY_FOUND"
echo "TODO/FIXME comments: $TODO_COUNT"
echo "Type safety issues ('any'): $ANY_COUNT"
echo "Console.log statements: $CONSOLE_COUNT"
echo "Potential security issues: $SECURITY_ISSUES"
echo "Schema compliance issues: $SCHEMA_ERRORS"
echo ""

TOTAL_ISSUES=$((LEGACY_FOUND + CONSOLE_COUNT + SECURITY_ISSUES + SCHEMA_ERRORS))

if [ "$TOTAL_ISSUES" -eq 0 ]; then
  echo "✅ ✅ ✅ CODEBASE IS CLEAN! ✅ ✅ ✅"
  echo "No critical architectural debt or legacy code found."
else
  echo "⚠️  Found $TOTAL_ISSUES issues that should be addressed"
  echo "Run individual checks for details."
fi
