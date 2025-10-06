# Branch Protection Setup

## Quick Setup (Recommended)

Set **only this check** as required on your `main` branch:

```
✅ All Critical Checks Pass
```

## Step-by-Step Instructions

### 1. Navigate to Branch Protection
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Branches** in the left sidebar
4. Click **Add rule** (or edit existing rule for `main`)

### 2. Configure Protection Rule

**Branch name pattern:**
```
main
```

**Required settings:**
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - ✅ Require branches to be up to date before merging
  - **Select:** `✅ All Critical Checks Pass`
- ✅ Require conversation resolution before merging
- ⚠️ Do not select these:
  - ❌ `CI / Lint (Critical Packages)` - covered by summary check
  - ❌ `CI / Type Check (Critical Packages)` - covered by summary check
  - ❌ `CI / Test (Critical Packages)` - covered by summary check
  - ❌ `CI / Lint (Optional - Mocks)` - intentionally non-blocking
  - ❌ `CI / Test (Optional - Mocks)` - intentionally non-blocking
  - ❌ `CI / Performance Tests (Optional)` - intentionally non-blocking

### 3. Optional Settings (Your Choice)

```
[ ] Require deployments to succeed before merging
[✓] Require linear history (recommended for clean history)
[ ] Require signed commits
[ ] Include administrators (recommended to exempt yourself during setup)
[ ] Allow force pushes (NOT recommended)
[ ] Allow deletions (NOT recommended)
```

### 4. Save Changes

Click **Create** (or **Save changes**)

## Why Only One Required Check?

The `✅ All Critical Checks Pass` check:
- Depends on: `lint-critical`, `typecheck-critical`, `test-critical`
- Will only pass if ALL critical jobs succeed
- Provides clear, single source of truth
- Won't fail due to optional checks (mocks, performance)

## Testing Your Setup

1. Create a test branch:
```bash
git checkout -b test-ci-setup
```

2. Make a small change to a critical package:
```bash
echo "// test" >> packages/types/src/index.ts
git add .
git commit -m "test: verify CI setup"
git push origin test-ci-setup
```

3. Open a PR on GitHub

4. Verify:
   - ✅ `✅ All Critical Checks Pass` appears
   - ✅ Individual checks run (lint-critical, typecheck-critical, test-critical)
   - ⚠️ Optional checks run but don't block
   - ✅ PR shows "All checks have passed" or "Required checks passing"

5. Close the test PR:
```bash
gh pr close test-ci-setup
git checkout main
git branch -D test-ci-setup
```

## Troubleshooting

### Check not appearing?
- Wait 2-3 minutes after first push (GitHub needs to see the check run once)
- Make sure CI workflow file is on `main` branch
- Check Actions tab to see if workflow ran

### Check always failing?
- Look at individual job outputs
- Verify critical packages (types, contracts, schemas) pass locally:
```bash
pnpm --filter @tide/types lint
pnpm --filter @tide/types build
pnpm --filter @tide/types test

pnpm --filter @tide/contracts lint
pnpm --filter @tide/contracts build
pnpm --filter @tide/contracts test

pnpm --filter @tide/schemas lint
pnpm --filter @tide/schemas build
pnpm --filter @tide/schemas test
```

### Optional checks blocking?
- They shouldn't! Check that they have `continue-on-error: true`
- Make sure you didn't add them to required checks
- Verify in workflow file: `.github/workflows/ci.yml`

## For Protected Main Branch

If `main` is already protected and you can't push directly:

1. Create feature branch: `git checkout -b feat/update-ci-config`
2. Commit CI changes: `git commit -m "ci: restructure to focus on critical packages"`
3. Push: `git push origin feat/update-ci-config`
4. Open PR
5. Temporarily disable branch protection OR merge despite failures
6. After merge, enable protection with new check

## Multiple Branches?

Apply same rules to `develop` or other protected branches:

1. Add another branch protection rule
2. Use same settings
3. Require same check: `✅ All Critical Checks Pass`

## Future-Proofing

As you add packages to critical checks:
- No need to update branch protection
- `✅ All Critical Checks Pass` automatically includes new jobs
- Just update `.github/workflows/ci.yml`

## Verification Checklist

Before considering setup complete:

- [ ] Branch protection rule created for `main`
- [ ] `✅ All Critical Checks Pass` is the only required check
- [ ] Test PR shows correct check status
- [ ] Optional checks visible but not blocking
- [ ] Can merge when critical checks pass
- [ ] Cannot merge when critical checks fail
- [ ] CI runs in under 5 minutes for critical checks

## Questions?

See `docs/CI-STRATEGY.md` for detailed explanation of CI philosophy and structure.
