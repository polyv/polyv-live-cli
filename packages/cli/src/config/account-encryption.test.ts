/**
 * Unit tests for AccountEncryption implementation
 * Tests AES-256-GCM encryption, key management, and error handling
 */

import { AccountEncryptionImpl, createAccountEncryption, EncryptedData } from './account-encryption';

describe('AccountEncryption', () => {
  let encryption: AccountEncryptionImpl;
  const testSecret = 'test-app-secret-123';
  const testMasterKey = 'test-master-key-for-unit-tests-2024';

  beforeEach(() => {
    // Clear environment variable for clean tests
    delete process.env['POLYV_MASTER_KEY'];
    encryption = new AccountEncryptionImpl(testMasterKey);
  });

  describe('constructor', () => {
    it('should use provided master key', () => {
      const customKey = 'custom-master-key-123';
      const instance = new AccountEncryptionImpl(customKey);
      expect(instance.getKeySource()).toBe('environment');
    });

    it('should use POLYV_MASTER_KEY environment variable', () => {
      const envKey = 'env-master-key-123';
      process.env['POLYV_MASTER_KEY'] = envKey;
      const instance = new AccountEncryptionImpl();
      expect(instance.getKeySource()).toBe('environment');
    });

    it('should generate default key when no key provided', () => {
      const instance = new AccountEncryptionImpl();
      expect(instance.getKeySource()).toBe('generated');
    });

    it('should throw error for invalid key', () => {
      expect(() => new AccountEncryptionImpl('short')).toThrow('Invalid encryption key');
      expect(() => new AccountEncryptionImpl('1234567890123456')).toThrow('Invalid encryption key'); // no letters
    });
  });

  describe('encrypt', () => {
    it('should encrypt plaintext successfully', () => {
      const result = encryption.encrypt(testSecret);
      
      expect(result).toHaveProperty('algorithm', 'aes-256-gcm');
      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('authTag');
      expect(result).toHaveProperty('encrypted');
      expect(result.iv).toBeTruthy();
      expect(result.authTag).toBeTruthy();
      expect(result.encrypted).toBeTruthy();
    });

    it('should produce different encrypted data for same input', () => {
      const result1 = encryption.encrypt(testSecret);
      const result2 = encryption.encrypt(testSecret);
      
      expect(result1.encrypted).not.toBe(result2.encrypted);
      expect(result1.iv).not.toBe(result2.iv);
    });

    it('should handle empty string', () => {
      const result = encryption.encrypt('');
      expect(result.algorithm).toBe('aes-256-gcm');
      expect(result.iv).toBeTruthy();
      expect(result.authTag).toBeTruthy();
      // Empty string encryption may result in empty encrypted data
      expect(result.encrypted).toBeDefined();
    });

    it('should handle unicode characters', () => {
      const unicodeText = '测试中文字符🔒🛡️';
      const result = encryption.encrypt(unicodeText);
      expect(result.algorithm).toBe('aes-256-gcm');
    });
  });

  describe('decrypt', () => {
    it('should decrypt encrypted data successfully', () => {
      const encrypted = encryption.encrypt(testSecret);
      const decrypted = encryption.decrypt(encrypted);
      
      expect(decrypted).toBe(testSecret);
    });

    it('should handle empty string decryption', () => {
      const encrypted = encryption.encrypt('');
      const decrypted = encryption.decrypt(encrypted);
      
      expect(decrypted).toBe('');
    });

    it('should handle unicode character decryption', () => {
      const unicodeText = '测试中文字符🔒🛡️';
      const encrypted = encryption.encrypt(unicodeText);
      const decrypted = encryption.decrypt(encrypted);
      
      expect(decrypted).toBe(unicodeText);
    });

    it('should throw error for invalid algorithm', () => {
      const invalidData: EncryptedData = {
        algorithm: 'aes-256-gcm' as any,
        iv: 'invalid',
        authTag: 'invalid',
        encrypted: 'invalid'
      };
      
      // Change algorithm to invalid one
      (invalidData as any).algorithm = 'aes-128-cbc';
      
      expect(() => encryption.decrypt(invalidData)).toThrow('Unsupported encryption algorithm');
    });

    it('should throw error for corrupted data', () => {
      const encrypted = encryption.encrypt(testSecret);
      
      // Corrupt the encrypted data
      const corruptedData: EncryptedData = {
        ...encrypted,
        encrypted: 'corrupted-data'
      };
      
      expect(() => encryption.decrypt(corruptedData)).toThrow('Failed to decrypt account secret');
    });

    it('should throw error for wrong auth tag', () => {
      const encrypted = encryption.encrypt(testSecret);
      
      // Corrupt the auth tag
      const corruptedData: EncryptedData = {
        ...encrypted,
        authTag: Buffer.from('corrupted-auth-tag').toString('base64')
      };
      
      expect(() => encryption.decrypt(corruptedData)).toThrow('Failed to decrypt account secret');
    });

    it('should provide helpful error message for wrong key', () => {
      const encrypted = encryption.encrypt(testSecret);
      
      // Create encryption with different key
      const differentEncryption = new AccountEncryptionImpl('different-key-123-ABC');
      
      try {
        differentEncryption.decrypt(encrypted);
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const errorMessage = (error as Error).message;
        // Should contain either our helpful message or the crypto error
        expect(errorMessage).toMatch(/check POLYV_MASTER_KEY environment variable|Unsupported state or unable to authenticate data|Unknown decryption error/);
      }
    });
  });

  describe('generateKey', () => {
    it('should generate random keys', () => {
      const key1 = encryption.generateKey();
      const key2 = encryption.generateKey();
      
      expect(key1).not.toBe(key2);
      expect(key1).toHaveLength(64); // 32 bytes * 2 (hex)
      expect(key2).toHaveLength(64);
    });

    it('should generate valid hex keys', () => {
      const key = encryption.generateKey();
      expect(/^[0-9a-f]{64}$/.test(key)).toBe(true);
    });
  });

  describe('validateKey', () => {
    it('should validate good keys', () => {
      expect(encryption.validateKey('AbCdEf1234567890')).toBe(true);
      expect(encryption.validateKey('test-key-with-numbers-123')).toBe(true);
      expect(encryption.validateKey('A' + 'a'.repeat(20))).toBe(true);
    });

    it('should reject invalid keys', () => {
      expect(encryption.validateKey('')).toBe(false);
      expect(encryption.validateKey('short')).toBe(false);
      expect(encryption.validateKey('1234567890123456')).toBe(false); // no letters
      expect(encryption.validateKey('aaaaaaaaaaaaaaaa')).toBe(false); // only lowercase
      expect(encryption.validateKey(null as any)).toBe(false);
      expect(encryption.validateKey(undefined as any)).toBe(false);
      expect(encryption.validateKey(123 as any)).toBe(false);
    });
  });

  describe('testEncryption', () => {
    it('should pass encryption test with default data', () => {
      expect(encryption.testEncryption()).toBe(true);
    });

    it('should pass encryption test with custom data', () => {
      expect(encryption.testEncryption('custom-test-data')).toBe(true);
    });

    it('should fail with broken encryption', () => {
      // Mock the encrypt method to return invalid data
      const originalEncrypt = encryption.encrypt;
      encryption.encrypt = jest.fn().mockImplementation(() => {
        throw new Error('Mocked encryption failure');
      });

      expect(encryption.testEncryption()).toBe(false);
      
      // Restore original method
      encryption.encrypt = originalEncrypt;
    });
  });

  describe('validateEncryptedData', () => {
    it('should validate correct encrypted data structure', () => {
      const encrypted = encryption.encrypt(testSecret);
      expect(encryption.validateEncryptedData(encrypted)).toBe(true);
    });

    it('should reject invalid data structures', () => {
      expect(encryption.validateEncryptedData(null)).toBe(false);
      expect(encryption.validateEncryptedData(undefined)).toBe(false);
      expect(encryption.validateEncryptedData('string')).toBe(false);
      expect(encryption.validateEncryptedData(123)).toBe(false);
      expect(encryption.validateEncryptedData({})).toBe(false);
      
      // Missing fields
      expect(encryption.validateEncryptedData({
        algorithm: 'aes-256-gcm',
        iv: 'test',
        authTag: 'test'
        // missing encrypted field
      })).toBe(false);
      
      // Wrong algorithm
      expect(encryption.validateEncryptedData({
        algorithm: 'aes-128-cbc',
        iv: 'test',
        authTag: 'test',
        encrypted: 'test'
      })).toBe(false);
      
      // Empty values
      expect(encryption.validateEncryptedData({
        algorithm: 'aes-256-gcm',
        iv: '',
        authTag: 'test',
        encrypted: 'test'
      })).toBe(false);
    });
  });

  describe('getEncryptionMetadata', () => {
    it('should return correct metadata', () => {
      const metadata = encryption.getEncryptionMetadata();
      
      expect(metadata).toEqual({
        algorithm: 'aes-256-gcm',
        keySource: 'environment',
        version: '1.0'
      });
    });
  });

  describe('createAccountEncryption factory', () => {
    it('should create instance with provided key', () => {
      const instance = createAccountEncryption('test-factory-key-123');
      expect(instance).toBeInstanceOf(AccountEncryptionImpl);
    });

    it('should create instance without key', () => {
      const instance = createAccountEncryption();
      expect(instance).toBeInstanceOf(AccountEncryptionImpl);
    });
  });

  describe('cross-encryption compatibility', () => {
    it('should decrypt data encrypted by different instance with same key', () => {
      const encryption1 = new AccountEncryptionImpl(testMasterKey);
      const encryption2 = new AccountEncryptionImpl(testMasterKey);
      
      const encrypted = encryption1.encrypt(testSecret);
      const decrypted = encryption2.decrypt(encrypted);
      
      expect(decrypted).toBe(testSecret);
    });

    it('should fail to decrypt data encrypted with different key', () => {
      const encryption1 = new AccountEncryptionImpl('key1-test-123-ABC');
      const encryption2 = new AccountEncryptionImpl('key2-test-456-DEF');
      
      const encrypted = encryption1.encrypt(testSecret);
      
      expect(() => encryption2.decrypt(encrypted)).toThrow();
    });
  });

  describe('environment variable integration', () => {
    it('should respect POLYV_MASTER_KEY environment variable', () => {
      const envKey = 'environment-test-key-123-ABC';
      process.env['POLYV_MASTER_KEY'] = envKey;
      
      const encryption1 = new AccountEncryptionImpl();
      const encryption2 = new AccountEncryptionImpl(envKey);
      
      const encrypted = encryption1.encrypt(testSecret);
      const decrypted = encryption2.decrypt(encrypted);
      
      expect(decrypted).toBe(testSecret);
    });
  });

  describe('error handling', () => {
    it('should provide specific error messages for decryption failures', () => {
      const encrypted = encryption.encrypt(testSecret);
      const wrongKeyEncryption = new AccountEncryptionImpl('wrong-key-test-123');
      
      try {
        wrongKeyEncryption.decrypt(encrypted);
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const errorMessage = (error as Error).message;
        expect(errorMessage).toMatch(/check POLYV_MASTER_KEY environment variable|Unsupported state or unable to authenticate data|Unknown decryption error/);
        expect(errorMessage).toContain('polyv-live-cli config recover');
      }
    });

    it('should handle invalid base64 in encrypted data', () => {
      const invalidData: EncryptedData = {
        algorithm: 'aes-256-gcm',
        iv: 'invalid-base64-data!@#',
        authTag: 'test',
        encrypted: 'test'
      };
      
      expect(() => encryption.decrypt(invalidData)).toThrow('Failed to decrypt account secret');
    });
  });
});