import crypto from 'crypto';
import { env } from '../config/env.js';
const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(env.ENCRYPTION_KEY, 'hex');
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
/**
 * Encrypt sensitive data (OAuth credentials)
 */
export function encrypt(data) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    const plaintext = JSON.stringify(data);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    // Return: iv + authTag + encrypted (all base64)
    return JSON.stringify({
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        encrypted: encrypted.toString('base64'),
    });
}
/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedData) {
    const { iv, authTag, encrypted } = JSON.parse(encryptedData);
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encrypted, 'base64')),
        decipher.final(),
    ]);
    return JSON.parse(decrypted.toString('utf8'));
}
/**
 * Hash password (for future use if adding password auth)
 */
export async function hashPassword(password) {
    const bcrypt = await import('bcrypt');
    return bcrypt.hash(password, 10);
}
/**
 * Verify password
 */
export async function verifyPassword(password, hash) {
    const bcrypt = await import('bcrypt');
    return bcrypt.compare(password, hash);
}
//# sourceMappingURL=encryption.js.map