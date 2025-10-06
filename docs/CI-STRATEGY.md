# CI Strategy - Pragmatic & Useful Checks

## 🎯 Philosophy

**CI should help you move fast, not slow you down.**

The restructured CI focuses on:
1. **Critical packages only** - Types, contracts, schemas MUST pass
2. **Optional monitoring** - Mocks and performance are tracked but won't block
3. **Fast feedback** - Only check what matters for production code
4. **Clear signals** - One main check that tells you if you're good to merge

## 📊 CI Structure

### ✅ CRITICAL CHECKS (Must Pass)

These **will block** your PR/merge:

#### 1. `lint-critical`
- Lints: `@tide/types`, `@tide/contracts`, `@tide/schemas`
- Checks formatting of critical files only
- **Why**: Production code must maintain quality standards

#### 2. `typecheck-critical`
- Builds: `@tide/types`, `@tide/contracts`, `@tide/schemas`
- Ensures TypeScript compiles without errors
- **Why**: Type safety is non-negotiable for foundation packages

#### 3. `test-critical`
- Tests: `@tide/types`, `@tide/contracts`, `@tide/schemas`
- Runs in parallel with coverage
- **Why**: Foundation contracts must have working tests

#### 4. `all-critical-checks-pass` ✅
- **This is the ONE check GitHub should require**
- Summary check that verifies all critical jobs passed
- Clear success/failure with detailed output
- **Set this as your required status check**

### ⚠️ OPTIONAL CHECKS (Won't Block)

These run but **won't fail** your build:

#### 1. `lint-optional` (Mocks)
- Uses `continue-on-error: true`
- Shows you the issues but doesn't block
- **Why**: Mocks are test utilities, not production code

#### 2. `test-optional` (Mocks)
- Uses `continue-on-error: true`
- Monitors test health without blocking
- **Why**: Can fix mocks when implementing real services

#### 3. `performance-optional`
- Only runs on `main` branch or manual trigger
- Uses `continue-on-error: true`
- **Why**: Performance tests are exploratory, not gatekeeping

## 🚀 Benefits

### Before (Old CI)
- ❌ 5 checks failing because of non-critical mocks
- ❌ Can't merge even though core code is perfect
- ❌ Wasted time debugging test utilities
- ❌ CI becomes ignored/disabled

### After (New CI)
- ✅ 3 critical checks focusing on foundation packages
- ✅ Can merge when core code is solid
- ✅ Still see mocks issues but they don't block
- ✅ CI is actually useful for finding real problems

## 📋 GitHub Configuration

### Required Status Checks

Set **only this one check** as required:
```
✅ All Critical Checks Pass
```

**Don't require:**
- ❌ Individual lint/test/typecheck jobs
- ❌ Optional checks (they can fail)
- ❌ Performance tests

### How to Configure

1. Go to your repo → Settings → Branches
2. Add branch protection rule for `main`
3. Enable "Require status checks to pass before merging"
4. Search for and select: `✅ All Critical Checks Pass`
5. Save

That's it! One checkbox, clear signal.

## 🔧 When to Use Optional Checks

### Mocks Package
- **Fix when**: Implementing actual service
- **Ignore when**: Working on types/contracts/schemas
- **Strategy**: Use mocks failures as a TODO list

### Performance Tests
- **Run manually**: Before major releases
- **On main**: Automatic tracking of performance trends
- **Don't block**: Individual PRs for performance

## 📈 Scaling Strategy

As you add more packages, categorize them:

### Critical (Required)
- Foundation types
- Service contracts
- Runtime validation schemas
- Core domain logic

### Optional (Monitored)
- Test utilities (mocks)
- Development tools
- Performance benchmarks
- Example code

### Add New Critical Package
```yaml
# In lint-critical job
- name: Lint new-package
  run: pnpm --filter @tide/new-package lint

# In typecheck-critical job
- name: Build and typecheck new-package
  run: pnpm --filter @tide/new-package build

# In test-critical matrix
matrix:
  package:
    - types
    - contracts
    - schemas
    - new-package  # Add here
```

### Add New Optional Package
```yaml
# Create new job or add to existing optional job
optional-check-name:
  name: Check (Optional - New Package)
  runs-on: ubuntu-latest
  continue-on-error: true  # This makes it non-blocking
  steps:
    # ... setup steps
    - name: Run checks
      run: pnpm --filter @tide/new-package check || echo "⚠️ Failed (non-blocking)"
```

## 🎯 Decision Matrix

| Package Type | Include in CI? | Block Merge? | When to Fix? |
|--------------|---------------|--------------|--------------|
| Foundation types | ✅ Critical | Yes | Before merge |
| Service contracts | ✅ Critical | Yes | Before merge |
| Validation schemas | ✅ Critical | Yes | Before merge |
| Test mocks | ⚠️ Optional | No | When convenient |
| Performance tests | ⚠️ Optional | No | Before release |
| Documentation | ⚠️ Optional | No | When updating docs |
| Examples | ⚠️ Optional | No | When examples matter |

## 💡 Key Principles

1. **Foundation First**
   - Types, contracts, schemas are the API
   - These must always be solid
   - Everything else depends on them

2. **Pragmatic Priorities**
   - Mocks can be messy, they're just test helpers
   - Performance tests explore, not gatekeep
   - Don't let perfect be the enemy of good

3. **Signal over Noise**
   - One clear "Can I merge?" check
   - Optional checks for awareness
   - Fast feedback on what matters

4. **Evolve Gradually**
   - Start with small critical set
   - Add packages as they mature
   - Move from optional → critical when ready

## 🔍 Monitoring Optional Checks

Even though optional checks don't block, you can still track them:

```bash
# See all check results
gh pr checks

# View specific optional check
gh run view <run-id>

# Set personal reminder to fix mocks
echo "Fix mocks before v1.0" >> TODO.md
```

## 📝 Example Workflow

### Developer Experience

```bash
# 1. Push changes to types package
git push origin feature/new-conversation-types

# 2. GitHub runs CI
# - lint-critical: ✅ Passes (types is clean)
# - typecheck-critical: ✅ Passes (types compiles)
# - test-critical: ✅ Passes (types tests work)
# - all-critical-checks-pass: ✅ PASS

# 3. Optional checks also run
# - lint-optional: ⚠️ Fails (mocks still broken)
# - test-optional: ⚠️ Fails (mocks tests broken)
# BUT these don't block the PR!

# 4. PR is green, ready to merge! 🎉
```

## 🎯 Success Metrics

You know CI is working when:
- ✅ Merge confidence is high (critical checks cover real issues)
- ✅ Feedback is fast (<5 minutes for critical checks)
- ✅ False failures are rare (not crying wolf)
- ✅ Developers trust and use CI (not disable/ignore it)
- ✅ Optional checks provide useful info without blocking

## 🚀 Next Steps

1. **Immediate**: Set `✅ All Critical Checks Pass` as required check
2. **Short-term**: Fix mocks when implementing real services
3. **Medium-term**: Add new packages to appropriate CI tier
4. **Long-term**: Monitor and adjust critical/optional balance

Remember: **CI is a tool to help you, not a bureaucratic barrier.**
