# Module 09: Security & Authentication

## 🤖 Claude Instance Prompt

```
You are Claude Instance #9, the Security Architect for Tide.

Your mission: Build bank-grade security with OAuth2, JWT tokens, E2E encryption, and SOC 2 compliance while maintaining <50ms auth checks.

Core responsibilities:
1. Implement OAuth2 with PKCE for all providers
2. Build JWT token management with refresh
3. Add end-to-end encryption for sensitive data
4. Create permission system with RBAC
5. Ensure SOC 2 compliance

Security is non-negotiable. Zero compromises.
```

## 📋 Module Overview

**Duration**: 3 weeks (OAuth in Week 3-4, Rest in Weeks 7-9)
**Dependencies**: Database from Module 00
**Note**: OAuth must be implemented in Week 3-4 for Email/Calendar services

## 🎯 Success Criteria

```typescript
const successCriteria = {
  performance: "Auth checks <50ms, token refresh <100ms",
  security: "No plaintext secrets, E2E encryption for PII",
  compliance: "SOC 2 Type II ready, GDPR compliant",
  reliability: "99.99% auth availability"
};
```

## 🏗️ Core Architecture

### OAuth2 Implementation with PKCE

```typescript
class OAuth2Service {
  async initiateAuth(provider: 'google' | 'microsoft'): Promise<AuthUrl> {
    // Generate PKCE challenge
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    // Store verifier in secure session
    await this.sessionStore.set({
      verifier: codeVerifier,
      state: crypto.randomBytes(16).toString('hex'),
      nonce: crypto.randomBytes(16).toString('hex'),
      expires: Date.now() + 600000 // 10 minutes
    });

    // Build auth URL
    const params = new URLSearchParams({
      client_id: this.config[provider].clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.getScopes(provider),
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
      nonce
    });

    return `${this.config[provider].authUrl}?${params}`;
  }

  async handleCallback(code: string, state: string): Promise<TokenPair> {
    // Verify state
    const session = await this.sessionStore.get(state);
    if (!session || session.expires < Date.now()) {
      throw new SecurityError('Invalid or expired state');
    }

    // Exchange code for tokens
    const tokens = await this.exchangeCode(code, session.verifier);

    // Validate ID token
    await this.validateIdToken(tokens.idToken, session.nonce);

    // Clean up session
    await this.sessionStore.delete(state);

    return tokens;
  }
}
```

### JWT Token Management

```typescript
class TokenService {
  private readonly accessTokenTTL = 15 * 60; // 15 minutes
  private readonly refreshTokenTTL = 30 * 24 * 60 * 60; // 30 days

  async generateTokenPair(userId: string, claims: Claims): Promise<TokenPair> {
    // Access token - short lived
    const accessToken = jwt.sign(
      {
        sub: userId,
        ...claims,
        type: 'access',
        jti: crypto.randomUUID()
      },
      this.privateKey,
      {
        algorithm: 'RS256',
        expiresIn: this.accessTokenTTL,
        issuer: 'tide.auth',
        audience: 'tide.api'
      }
    );

    // Refresh token - long lived, stored in DB
    const refreshTokenId = crypto.randomUUID();
    const refreshToken = jwt.sign(
      {
        sub: userId,
        type: 'refresh',
        jti: refreshTokenId,
        family: crypto.randomUUID() // Token family for rotation
      },
      this.privateKey,
      {
        algorithm: 'RS256',
        expiresIn: this.refreshTokenTTL
      }
    );

    // Store refresh token metadata
    await this.storeRefreshToken(refreshTokenId, userId);

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    // Verify refresh token
    const payload = jwt.verify(refreshToken, this.publicKey) as RefreshPayload;

    // Check if token is revoked
    const stored = await this.getRefreshToken(payload.jti);
    if (!stored || stored.revoked) {
      // Possible token reuse - revoke entire family
      await this.revokeTokenFamily(payload.family);
      throw new SecurityError('Token reuse detected');
    }

    // Generate new pair
    const newTokens = await this.generateTokenPair(payload.sub, stored.claims);

    // Rotate refresh token
    await this.rotateRefreshToken(payload.jti, newTokens.refreshToken);

    return newTokens;
  }
}
```

### End-to-End Encryption

```typescript
class EncryptionService {
  // Field-level encryption for sensitive data
  async encryptField(data: string, userId: string): Promise<EncryptedData> {
    // Generate unique data encryption key
    const dek = crypto.randomBytes(32);

    // Encrypt data with DEK
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', dek, iv);
    const encrypted = Buffer.concat([
      cipher.update(data, 'utf8'),
      cipher.final()
    ]);
    const authTag = cipher.getAuthTag();

    // Encrypt DEK with user's key encryption key (KEK)
    const kek = await this.getUserKEK(userId);
    const wrappedDek = await this.wrapKey(dek, kek);

    return {
      ciphertext: encrypted.toString('base64'),
      wrappedKey: wrappedDek,
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      algorithm: 'AES-256-GCM'
    };
  }

  // Envelope encryption for documents
  async encryptDocument(document: Buffer, recipients: string[]): Promise<EncryptedDocument> {
    // Generate document encryption key
    const dek = crypto.randomBytes(32);

    // Encrypt document
    const encrypted = await this.encryptWithDEK(document, dek);

    // Create key slots for each recipient
    const keySlots = await Promise.all(
      recipients.map(async (recipientId) => {
        const recipientKey = await this.getRecipientPublicKey(recipientId);
        const encryptedDek = crypto.publicEncrypt(recipientKey, dek);
        return {
          recipientId,
          encryptedKey: encryptedDek.toString('base64')
        };
      })
    );

    return {
      ...encrypted,
      keySlots
    };
  }
}
```

### Permission System (RBAC)

```typescript
class PermissionService {
  async checkPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    // Fast path - check cache
    const cacheKey = `perm:${userId}:${resource}:${action}`;
    const cached = await this.cache.get(cacheKey);
    if (cached !== null) return cached;

    // Get user's roles
    const roles = await this.getUserRoles(userId);

    // Check permissions for each role
    const hasPermission = await this.db.query(sql`
      SELECT EXISTS(
        SELECT 1 FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ANY($1::uuid[])
          AND p.resource = $2
          AND p.action = $3
          AND (p.conditions IS NULL OR jsonb_matches($4, p.conditions))
      )
    `, [roles, resource, action, { userId }]);

    // Cache result
    await this.cache.set(cacheKey, hasPermission, 300); // 5 min TTL

    return hasPermission;
  }

  // Policy-based access control
  async evaluatePolicy(
    subject: Subject,
    resource: Resource,
    action: Action,
    context: Context
  ): Promise<Decision> {
    const policies = await this.getPolicies(subject, resource);

    for (const policy of policies) {
      const decision = await this.evaluateRule(policy, {
        subject,
        resource,
        action,
        context
      });

      if (decision === 'DENY') {
        return { allowed: false, reason: policy.denyReason };
      }
    }

    return { allowed: true };
  }
}
```

### Security Middleware

```typescript
class SecurityMiddleware {
  // Rate limiting per user
  rateLimiter = new RateLimiter({
    points: 100, // requests
    duration: 60, // per minute
    blockDuration: 600 // 10 min block
  });

  // Auth validation
  async authenticate(req: FastifyRequest): Promise<void> {
    const token = this.extractToken(req);
    if (!token) throw new AuthError('No token provided');

    try {
      // Verify token
      const payload = jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
        audience: 'tide.api',
        issuer: 'tide.auth'
      });

      // Check token type
      if (payload.type !== 'access') {
        throw new AuthError('Invalid token type');
      }

      // Check revocation
      if (await this.isRevoked(payload.jti)) {
        throw new AuthError('Token revoked');
      }

      // Attach user context
      req.user = {
        id: payload.sub,
        claims: payload
      };
    } catch (error) {
      throw new AuthError('Invalid token');
    }
  }

  // CSRF protection
  async validateCSRF(req: FastifyRequest): Promise<void> {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return;

    const token = req.headers['x-csrf-token'];
    const sessionToken = await this.getSessionCSRF(req.session.id);

    if (!token || token !== sessionToken) {
      throw new SecurityError('Invalid CSRF token');
    }
  }

  // Security headers
  setSecurityHeaders(res: FastifyReply): void {
    res.headers({
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Content-Security-Policy': this.getCSP(),
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });
  }
}
```

### Audit Logging

```typescript
class AuditLogger {
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const auditEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      eventType: event.type,
      severity: event.severity,
      userId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      resource: event.resource,
      action: event.action,
      outcome: event.outcome,
      details: event.details,
      // Hash for tamper detection
      hash: this.calculateHash(event)
    };

    // Store in append-only audit log
    await this.db.insert(auditLogs).values(auditEntry);

    // Alert on critical events
    if (event.severity === 'CRITICAL') {
      await this.alertService.sendSecurityAlert(auditEntry);
    }
  }
}
```

## ✅ Key Deliverables

- [ ] OAuth2 with PKCE for Google/Microsoft
- [ ] JWT token management with rotation
- [ ] End-to-end encryption for PII
- [ ] RBAC permission system
- [ ] Security middleware (rate limit, CSRF, headers)
- [ ] Audit logging for compliance
- [ ] Session management
- [ ] 95% test coverage

## 🔒 Security Checklist

- [ ] No secrets in code (use env vars)
- [ ] All PII encrypted at rest
- [ ] TLS 1.3 only
- [ ] Key rotation implemented
- [ ] Rate limiting on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Security headers set
- [ ] Audit trail complete

Remember: Security is binary. Either it's secure or it's not.