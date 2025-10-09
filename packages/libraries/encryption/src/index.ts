/**
 * Encryption Utilities
 * Provides AES-256-GCM encryption for sensitive data like OAuth tokens
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64;

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
export class EncryptionService {
  private masterKey: Buffer;

  constructor(config: EncryptionConfig) {
    if (!config.masterKey) {
      throw new Error('Master encryption key is required');
    }

    // Validate key length
    if (config.masterKey.length !== KEY_LENGTH * 2) {
      throw new Error(
        `Master key must be ${KEY_LENGTH * 2} hex characters (${KEY_LENGTH} bytes)`
      );
    }

    try {
      this.masterKey = Buffer.from(config.masterKey, 'hex');
    } catch (error) {
      throw new Error('Invalid master key format. Must be hex-encoded.');
    }
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(plaintext: string): EncryptedData {
    try {
      // Generate random IV and salt
      const iv = crypto.randomBytes(IV_LENGTH);
      const salt = crypto.randomBytes(SALT_LENGTH);

      // Derive encryption key from master key + salt
      const key = crypto.pbkdf2Sync(this.masterKey, salt, 100000, KEY_LENGTH, 'sha256');

      // Create cipher
      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

      // Encrypt data
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get authentication tag
      const authTag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        salt: salt.toString('hex'),
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${(error as Error).message}`);
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: EncryptedData): string {
    try {
      // Convert hex strings back to buffers
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const authTag = Buffer.from(encryptedData.authTag, 'hex');
      const salt = Buffer.from(encryptedData.salt, 'hex');

      // Derive same encryption key
      const key = crypto.pbkdf2Sync(this.masterKey, salt, 100000, KEY_LENGTH, 'sha256');

      // Create decipher
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);

      // Decrypt data
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${(error as Error).message}`);
    }
  }

  /**
   * Encrypt and return as single base64 string for easy storage
   */
  encryptToString(plaintext: string): string {
    const encrypted = this.encrypt(plaintext);
    return Buffer.from(JSON.stringify(encrypted)).toString('base64');
  }

  /**
   * Decrypt from base64 string
   */
  decryptFromString(encryptedString: string): string {
    const encrypted = JSON.parse(
      Buffer.from(encryptedString, 'base64').toString('utf8')
    ) as EncryptedData;
    return this.decrypt(encrypted);
  }
}

/**
 * Helper function to generate a secure master key
 * Usage: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
export function generateMasterKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Singleton encryption service instance
 */
let encryptionService: EncryptionService | null = null;

/**
 * Initialize encryption service with master key from environment
 */
export function initializeEncryption(masterKey?: string): EncryptionService {
  const key = masterKey || process.env.ENCRYPTION_MASTER_KEY;

  if (!key) {
    throw new Error(
      'ENCRYPTION_MASTER_KEY environment variable is required. ' +
      'Generate one with: openssl rand -hex 32'
    );
  }

  encryptionService = new EncryptionService({ masterKey: key });
  return encryptionService;
}

/**
 * Get encryption service instance (must call initializeEncryption first)
 */
export function getEncryptionService(): EncryptionService {
  if (!encryptionService) {
    throw new Error(
      'Encryption service not initialized. Call initializeEncryption() first.'
    );
  }
  return encryptionService;
}

/**
 * Convenience functions
 */
export async function encrypt(plaintext: string): Promise<string> {
  return getEncryptionService().encryptToString(plaintext);
}

export async function decrypt(encryptedString: string): Promise<string> {
  return getEncryptionService().decryptFromString(encryptedString);
}
