# 🚨 CRITICAL SECURITY ALERT 🚨

**Date**: 2025-01-09
**Severity**: CRITICAL
**Status**: ⚠️ IMMEDIATE ACTION REQUIRED

---

## Issue Discovered

During a comprehensive codebase security audit, **sensitive credentials were found committed to the git repository** in the `.env` file.

### Exposed Credentials

The following sensitive credentials were exposed in git history:

1. ✅ **Supabase Service Role Key** - Full database access, bypasses Row Level Security
2. ✅ **Anthropic API Key** - Unauthorized AI API usage
3. ✅ **OpenAI API Key** - Unauthorized AI API usage
4. ✅ **Google OAuth Client Secret** - OAuth token compromise
5. ✅ **Azure OAuth Client Secret** - OAuth token compromise
6. ✅ **Supabase JWT Secret** - JWT token forgery

### Impact Assessment

**CRITICAL** - These exposed credentials could allow an attacker to:

- Access and modify all data in the Supabase database
- Bypass Row Level Security policies
- Forge authentication tokens
- Make unauthorized AI API calls (costly $$$)
- Compromise user OAuth tokens
- Impersonate any user in the system

---

## ✅ Immediate Actions Taken

### 1. Prevent Future Exposure

- ✅ Added `.env` to `.gitignore`
- ✅ Created `.env.example` with placeholder values
- ✅ This security alert document created

### 2. What You Must Do NOW

#### Step 1: Rotate ALL Exposed Credentials

**⚠️ DO THIS IMMEDIATELY - Do not delay!**

##### Supabase Credentials

1. Go to: https://app.supabase.com/project/ozrocykjomgcuphicqpg/settings/api
2. Click "Reset JWT secret" (this will rotate both anon and service role keys)
3. Update your local `.env` with new values
4. Deploy new values to Railway/production

##### Anthropic API Key

1. Go to: https://console.anthropic.com/settings/keys
2. Delete the exposed key: `sk-ant-api03-tB9ej...`
3. Create a new API key
4. Update your local `.env` with new value

##### OpenAI API Key

1. Go to: https://platform.openai.com/api-keys
2. Revoke the exposed key: `sk-proj-jWwgGa...`
3. Create a new API key
4. Update your local `.env` with new value

##### Google OAuth Credentials

1. Go to: https://console.cloud.google.com/apis/credentials
2. Delete the exposed OAuth 2.0 Client ID
3. Create a new OAuth 2.0 Client ID
4. Update your local `.env` and Supabase Auth settings

##### Azure OAuth Credentials

1. Go to: https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps
2. Navigate to your app registration
3. Go to "Certificates & secrets"
4. Delete the exposed client secret: `00p8Q~~VF15y...`
5. Create a new client secret
6. Update your local `.env` and Supabase Auth settings

#### Step 2: Remove Secrets from Git History

**Choose ONE method:**

##### Option A: BFG Repo-Cleaner (Recommended - Easiest)

```bash
# Install BFG
brew install bfg  # macOS
# or download from https://rtyley.github.io/bfg-repo-cleaner/

# Clone a fresh copy
git clone --mirror git@github.com:ezhong0/tide.git tide-cleanup.git
cd tide-cleanup.git

# Remove the .env file from ALL history
bfg --delete-files .env

# Cleanup and force push
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force

# Clean up
cd ..
rm -rf tide-cleanup.git
```

##### Option B: git-filter-repo (More Control)

```bash
# Install git-filter-repo
brew install git-filter-repo  # macOS
# or: pip install git-filter-repo

# Clone a fresh copy
cd /tmp
git clone git@github.com:ezhong0/tide.git tide-cleanup
cd tide-cleanup

# Remove .env from all history
git filter-repo --path .env --invert-paths

# Force push
git push origin --force --all
git push origin --force --tags

# Clean up
cd ..
rm -rf tide-cleanup
```

#### Step 3: Verify Removal

```bash
# Search git history for exposed secrets
git log --all --full-history --source --find-object=\
  $(git hash-object .env 2>/dev/null || echo "none")

# Should return nothing if successfully removed
```

#### Step 4: Update Production Deployments

1. **Railway Services**: Update environment variables with new credentials
   ```bash
   railway variables set SUPABASE_SERVICE_ROLE_KEY=new-value
   railway variables set ANTHROPIC_API_KEY=new-value
   railway variables set OPENAI_API_KEY=new-value
   # ... etc for all exposed credentials
   ```

2. **Redeploy all services** to pick up new credentials

#### Step 5: Notify Your Team

If you're working with a team:
- Notify all team members about the credential rotation
- Ensure everyone pulls the latest .gitignore changes
- Ensure everyone updates their local .env files
- Review team access to the repository

---

## 🔒 Long-term Security Improvements

### Implemented in this Fix

✅ **Environment Variable Protection**
- `.env` now in `.gitignore`
- `.env.example` provided as template
- Clear documentation in place

✅ **Input Validation**
- Zod schemas added to all API endpoints
- Request validation middleware implemented

✅ **OAuth Token Encryption**
- Encryption layer added before database storage
- Decryption on retrieval

### Recommended Next Steps

1. **Secret Management Service**
   - Migrate to Railway secrets, AWS Secrets Manager, or HashiCorp Vault
   - Eliminate .env files entirely in production

2. **Pre-commit Hooks**
   - Install pre-commit hook to prevent .env commits
   - Use tools like `git-secrets` or `truffleHog`

3. **Security Scanning**
   - Enable Dependabot alerts on GitHub
   - Add Snyk security scanning to CI/CD

4. **Regular Security Audits**
   - Schedule quarterly security reviews
   - Monitor for leaked credentials using GitGuardian

---

## Verification Checklist

- [ ] All credentials rotated (Supabase, Anthropic, OpenAI, Google, Azure)
- [ ] .env removed from git history (using BFG or git-filter-repo)
- [ ] New credentials deployed to Railway/production
- [ ] All services redeployed and tested
- [ ] Team notified (if applicable)
- [ ] .gitignore updated and committed
- [ ] .env.example created and committed
- [ ] No secrets found in `git log` search

---

## Questions or Issues?

If you encounter any problems during credential rotation:

1. Check the service-specific documentation links above
2. Ensure you have admin access to all platforms
3. Test each service after rotation to ensure it still works
4. Monitor error logs for authentication failures

---

## Prevention for the Future

**Before committing any code:**

```bash
# Check for secrets before committing
git diff --cached | grep -E "(API_KEY|SECRET|PASSWORD|TOKEN)"

# Use git hooks to prevent commits with secrets
# Install pre-commit hook: https://pre-commit.com
```

**Best practices:**

1. ✅ Never commit `.env` files
2. ✅ Use `.env.example` with placeholder values
3. ✅ Store production secrets in secure secret managers
4. ✅ Rotate credentials regularly (every 90 days)
5. ✅ Use different credentials for dev/staging/production
6. ✅ Enable 2FA on all service accounts
7. ✅ Limit API key scopes to minimum required permissions

---

**Remember**: Security is not a one-time task. It's an ongoing process.
