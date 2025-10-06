import { encrypt, decrypt } from '../../../utils/encryption.js';

describe('Encryption Utils', () => {
  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt data correctly', () => {
      const originalData = {
        accessToken: 'test_access_token_12345',
        refreshToken: 'test_refresh_token_67890',
        expiresAt: new Date('2025-12-31'),
        scope: ['gmail.modify', 'calendar'],
      };

      const encrypted = encrypt(originalData);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toEqual({
        ...originalData,
        expiresAt: originalData.expiresAt.toISOString(),
      });
    });

    it('should produce different ciphertext for same data', () => {
      const data = { test: 'value' };

      const encrypted1 = encrypt(data);
      const encrypted2 = encrypt(data);

      // Different ciphertext due to random IV
      expect(encrypted1).not.toBe(encrypted2);

      // But both decrypt to same value
      expect(decrypt(encrypted1)).toEqual(decrypt(encrypted2));
    });

    it('should handle complex nested objects', () => {
      const complexData = {
        user: {
          id: '123',
          profile: {
            name: 'Test User',
            settings: {
              theme: 'dark',
              notifications: true,
            },
          },
        },
        tokens: ['token1', 'token2'],
      };

      const encrypted = encrypt(complexData);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toEqual(complexData);
    });

    it('should throw error when decrypting invalid data', () => {
      expect(() => {
        decrypt('invalid-encrypted-data');
      }).toThrow();
    });
  });
});
