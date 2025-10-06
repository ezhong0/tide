/**
 * Encrypt sensitive data (OAuth credentials)
 */
export declare function encrypt(data: unknown): string;
/**
 * Decrypt sensitive data
 */
export declare function decrypt(encryptedData: string): unknown;
/**
 * Hash password (for future use if adding password auth)
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Verify password
 */
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
//# sourceMappingURL=encryption.d.ts.map