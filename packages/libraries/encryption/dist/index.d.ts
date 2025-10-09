/**
 * Encryption Utilities
 * Provides AES-256-GCM encryption for sensitive data like OAuth tokens
 */
/**
 * Encryption configuration
 */
export interface EncryptionConfig {
    /**
     * Master encryption key - MUST be 32 bytes (64 hex characters)
     * Generate with: openssl rand -hex 32
     */
    masterKey: string;
}
/**
 * Encrypted data structure
 */
export interface EncryptedData {
    /** Encrypted content */
    encrypted: string;
    /** Initialization vector */
    iv: string;
    /** Authentication tag */
    authTag: string;
    /** Salt used for key derivation */
    salt: string;
}
/**
 * Encryption service for sensitive data
 */
export declare class EncryptionService {
    private masterKey;
    constructor(config: EncryptionConfig);
    /**
     * Encrypt sensitive data
     */
    encrypt(plaintext: string): EncryptedData;
    /**
     * Decrypt sensitive data
     */
    decrypt(encryptedData: EncryptedData): string;
    /**
     * Encrypt and return as single base64 string for easy storage
     */
    encryptToString(plaintext: string): string;
    /**
     * Decrypt from base64 string
     */
    decryptFromString(encryptedString: string): string;
}
/**
 * Helper function to generate a secure master key
 * Usage: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
export declare function generateMasterKey(): string;
/**
 * Initialize encryption service with master key from environment
 */
export declare function initializeEncryption(masterKey?: string): EncryptionService;
/**
 * Get encryption service instance (must call initializeEncryption first)
 */
export declare function getEncryptionService(): EncryptionService;
/**
 * Convenience functions
 */
export declare function encrypt(plaintext: string): Promise<string>;
export declare function decrypt(encryptedString: string): Promise<string>;
//# sourceMappingURL=index.d.ts.map