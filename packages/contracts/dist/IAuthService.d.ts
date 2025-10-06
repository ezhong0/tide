/**
 * Auth Service Contract
 * Authentication and authorization for single-user system
 *
 * Performance Requirements:
 * - Token validation: <10ms
 * - Provider auth: <500ms
 * - Session operations: <50ms
 */
import { Result, UUID, UserId, Timestamp, Email } from '@tide/types';
export interface IAuthService {
    /**
     * Authenticate with email provider OAuth
     * @param provider OAuth provider
     * @param credentials OAuth credentials
     * @returns Authentication result with tokens
     * @performance <500ms including provider call
     */
    authenticateWithProvider(provider: AuthProvider, credentials: OAuthCredentials): Promise<Result<AuthResult>>;
    /**
     * Authenticate with magic link
     * @param email User email
     * @returns Success status (link sent)
     * @performance <200ms
     */
    sendMagicLink(email: Email): Promise<Result<void>>;
    /**
     * Verify magic link token
     * @param token Magic link token
     * @returns Authentication result
     * @performance <50ms
     */
    verifyMagicLink(token: string): Promise<Result<AuthResult>>;
    /**
     * Authenticate with biometrics
     * @param biometricData Biometric data
     * @returns Authentication result
     * @performance <100ms
     */
    authenticateWithBiometrics(biometricData: BiometricData): Promise<Result<AuthResult>>;
    /**
     * Validate access token
     * @param token Access token
     * @returns Token claims if valid
     * @performance <10ms
     */
    validateToken(token: string): Promise<Result<TokenClaims>>;
    /**
     * Refresh access token
     * @param refreshToken Refresh token
     * @returns New tokens
     * @performance <50ms
     */
    refreshToken(refreshToken: string): Promise<Result<TokenPair>>;
    /**
     * Revoke tokens
     * @param token Access or refresh token
     * @returns Success status
     * @performance <30ms
     */
    revokeToken(token: string): Promise<Result<void>>;
    /**
     * Create session
     * @param userId User identifier
     * @param device Device information
     * @returns Session details
     * @performance <50ms
     */
    createSession(userId: UserId, device?: DeviceInfo): Promise<Result<Session>>;
    /**
     * Get session
     * @param sessionId Session identifier
     * @returns Session details
     * @performance <30ms
     */
    getSession(sessionId: string): Promise<Result<Session | null>>;
    /**
     * Update session activity
     * @param sessionId Session identifier
     * @returns Success status
     * @performance <20ms
     */
    updateSessionActivity(sessionId: string): Promise<Result<void>>;
    /**
     * End session
     * @param sessionId Session identifier
     * @returns Success status
     * @performance <30ms
     */
    endSession(sessionId: string): Promise<Result<void>>;
    /**
     * List active sessions
     * @param userId User identifier
     * @returns Array of active sessions
     * @performance <50ms
     */
    listSessions(userId: UserId): Promise<Result<Session[]>>;
    /**
     * End all sessions except current
     * @param userId User identifier
     * @param currentSessionId Current session to keep
     * @returns Number of sessions ended
     * @performance <100ms
     */
    endAllOtherSessions(userId: UserId, currentSessionId: string): Promise<Result<number>>;
    /**
     * Store provider tokens
     * @param userId User identifier
     * @param provider Provider name
     * @param tokens Provider tokens
     * @returns Success status
     * @performance <50ms
     */
    storeProviderTokens(userId: UserId, provider: string, tokens: ProviderTokens): Promise<Result<void>>;
    /**
     * Get provider tokens
     * @param userId User identifier
     * @param provider Provider name
     * @returns Provider tokens
     * @performance <30ms
     */
    getProviderTokens(userId: UserId, provider: string): Promise<Result<ProviderTokens | null>>;
    /**
     * Refresh provider tokens
     * @param userId User identifier
     * @param provider Provider name
     * @returns Updated tokens
     * @performance <500ms including provider call
     */
    refreshProviderTokens(userId: UserId, provider: string): Promise<Result<ProviderTokens>>;
    /**
     * Check permissions
     * @param userId User identifier
     * @param resource Resource to access
     * @param action Action to perform
     * @returns Permission status
     * @performance <20ms
     */
    checkPermission(userId: UserId, resource: string, action: string): Promise<Result<boolean>>;
    /**
     * Get user permissions
     * @param userId User identifier
     * @returns User permissions
     * @performance <30ms
     */
    getUserPermissions(userId: UserId): Promise<Result<Permission[]>>;
    /**
     * Setup multi-factor authentication
     * @param userId User identifier
     * @param method MFA method
     * @returns Setup details
     * @performance <100ms
     */
    setupMFA(userId: UserId, method: MFAMethod): Promise<Result<MFASetup>>;
    /**
     * Verify MFA code
     * @param userId User identifier
     * @param code MFA code
     * @returns Verification result
     * @performance <50ms
     */
    verifyMFA(userId: UserId, code: string): Promise<Result<boolean>>;
    /**
     * Disable MFA
     * @param userId User identifier
     * @param code Verification code
     * @returns Success status
     * @performance <50ms
     */
    disableMFA(userId: UserId, code: string): Promise<Result<void>>;
    /**
     * Get auth audit log
     * @param userId User identifier
     * @param limit Maximum entries
     * @returns Audit log entries
     * @performance <100ms
     */
    getAuditLog(userId: UserId, limit?: number): Promise<Result<AuditLogEntry[]>>;
    /**
     * Verify device
     * @param deviceId Device identifier
     * @param challenge Challenge response
     * @returns Verification result
     * @performance <100ms
     */
    verifyDevice(deviceId: string, challenge: string): Promise<Result<boolean>>;
    /**
     * Register trusted device
     * @param userId User identifier
     * @param device Device information
     * @returns Device ID
     * @performance <50ms
     */
    registerDevice(userId: UserId, device: DeviceInfo): Promise<Result<string>>;
    /**
     * List trusted devices
     * @param userId User identifier
     * @returns Array of trusted devices
     * @performance <50ms
     */
    listDevices(userId: UserId): Promise<Result<TrustedDevice[]>>;
    /**
     * Remove trusted device
     * @param userId User identifier
     * @param deviceId Device to remove
     * @returns Success status
     * @performance <30ms
     */
    removeDevice(userId: UserId, deviceId: string): Promise<Result<void>>;
}
export type AuthProvider = 'google' | 'microsoft' | 'apple';
export interface OAuthCredentials {
    code?: string;
    accessToken?: string;
    idToken?: string;
    redirectUri?: string;
}
export interface AuthResult {
    userId: UserId;
    tokens: TokenPair;
    session: Session;
    requiresMFA?: boolean;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface TokenClaims {
    userId: UserId;
    sessionId: string;
    email: Email;
    iat: number;
    exp: number;
    scope?: string[];
}
export interface Session {
    sessionId: string;
    userId: UserId;
    createdAt: Timestamp;
    lastActivity: Timestamp;
    expiresAt: Timestamp;
    device?: DeviceInfo;
    ipAddress?: string;
    userAgent?: string;
}
export interface DeviceInfo {
    deviceId?: string;
    name: string;
    type: 'mobile' | 'tablet' | 'desktop' | 'web';
    os?: string;
    osVersion?: string;
    appVersion?: string;
    pushToken?: string;
}
export interface BiometricData {
    type: 'fingerprint' | 'face' | 'iris';
    data: string;
    deviceId: string;
}
export interface ProviderTokens {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Timestamp;
    scope?: string[];
}
export interface Permission {
    resource: string;
    actions: string[];
    conditions?: Record<string, unknown>;
}
export type MFAMethod = 'totp' | 'sms' | 'email' | 'backup-codes';
export interface MFASetup {
    method: MFAMethod;
    secret?: string;
    qrCode?: string;
    backupCodes?: string[];
    phoneNumber?: string;
    email?: Email;
}
export interface AuditLogEntry {
    id: UUID;
    userId: UserId;
    action: string;
    resource?: string;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    timestamp: Timestamp;
    metadata?: Record<string, unknown>;
}
export interface TrustedDevice {
    deviceId: string;
    name: string;
    type: DeviceInfo['type'];
    lastUsed: Timestamp;
    addedAt: Timestamp;
    trusted: boolean;
}
//# sourceMappingURL=IAuthService.d.ts.map