/**
 * @fileoverview Tests for AccountCrypto utility
 */

import { AccountCrypto } from './account-crypto';

describe('AccountCrypto', () => {
  let crypto: AccountCrypto;

  beforeEach(() => {
    crypto = new AccountCrypto();
  });

  describe('constructor', () => {
    it('should initialize with default master key', () => {
      expect(crypto).toBeInstanceOf(AccountCrypto);
    });

    it('should initialize with custom master key', () => {
      const customCrypto = new AccountCrypto('custom-key');
      expect(customCrypto).toBeInstanceOf(AccountCrypto);
    });

    it('should use environment variable if available', () => {
      const originalEnv = process.env['POLYV_MASTER_KEY'];
      process.env['POLYV_MASTER_KEY'] = 'env-key';
      
      const envCrypto = new AccountCrypto();
      expect(envCrypto).toBeInstanceOf(AccountCrypto);
      
      // Restore original environment
      if (originalEnv) {
        process.env['POLYV_MASTER_KEY'] = originalEnv;
      } else {
        delete process.env['POLYV_MASTER_KEY'];
      }
    });
  });

  describe('encrypt and decrypt', () => {
    const testSecret = 'test-app-secret-12345';

    it('should encrypt and decrypt successfully', () => {
      const { encrypted, metadata } = crypto.encrypt(testSecret);
      
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(testSecret);
      expect(metadata).toBeDefined();
      expect(metadata.algorithm).toBe('aes-256-cbc');
      expect(metadata.iv).toBeDefined();
      expect(metadata.authTag).toBeDefined();

      const decrypted = crypto.decrypt(encrypted, metadata);
      expect(decrypted).toBe(testSecret);
    });

    it('should produce different encrypted values for same input', () => {
      const result1 = crypto.encrypt(testSecret);
      const result2 = crypto.encrypt(testSecret);
      
      expect(result1.encrypted).not.toBe(result2.encrypted);
      expect(result1.metadata.iv).not.toBe(result2.metadata.iv);
    });

    it('should throw error for invalid encrypted data', () => {
      const { metadata } = crypto.encrypt(testSecret);
      
      expect(() => {
        crypto.decrypt('invalid-encrypted-data', metadata);
      }).toThrow('Failed to decrypt account secret');
    });

    it('should throw error for invalid metadata', () => {
      const { encrypted } = crypto.encrypt(testSecret);
      const invalidMetadata = {
        algorithm: 'invalid-algorithm',
        iv: 'invalid-iv',
        authTag: 'invalid-tag'
      };
      
      expect(() => {
        crypto.decrypt(encrypted, invalidMetadata);
      }).toThrow('Unsupported encryption algorithm');
    });
  });

  describe('encryptSimple and decryptSimple', () => {
    const testSecret = 'simple-test-secret';

    it('should encrypt and decrypt with simple interface', () => {
      const encrypted = crypto.encryptSimple(testSecret);
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      
      const decrypted = crypto.decryptSimple(encrypted);
      expect(decrypted).toBe(testSecret);
    });

    it('should throw error for invalid base64 data', () => {
      expect(() => {
        crypto.decryptSimple('invalid-base64-data');
      }).toThrow('Failed to decrypt account secret: Invalid encrypted data format');
    });

    it('should throw error for malformed JSON', () => {
      const invalidBase64 = Buffer.from('invalid-json').toString('base64');
      expect(() => {
        crypto.decryptSimple(invalidBase64);
      }).toThrow('Failed to decrypt account secret: Invalid encrypted data format');
    });
  });

  describe('validateEncryptedData', () => {
    it('should validate correct encrypted data', () => {
      const encrypted = crypto.encryptSimple('test-data');
      expect(crypto.validateEncryptedData(encrypted)).toBe(true);
    });

    it('should reject invalid encrypted data', () => {
      expect(crypto.validateEncryptedData('invalid-data')).toBe(false);
    });
  });

  describe('testEncryption', () => {
    it('should pass encryption test with default data', () => {
      expect(crypto.testEncryption()).toBe(true);
    });

    it('should pass encryption test with custom data', () => {
      expect(crypto.testEncryption('custom-test-data')).toBe(true);
    });
  });

  describe('generateMasterKey', () => {
    it('should generate random master key', () => {
      const key1 = AccountCrypto.generateMasterKey();
      const key2 = AccountCrypto.generateMasterKey();
      
      expect(key1).toBeDefined();
      expect(key2).toBeDefined();
      expect(key1).not.toBe(key2);
      expect(key1.length).toBe(64); // 32 bytes * 2 (hex)
      expect(key2.length).toBe(64);
    });
  });

  describe('cross-instance compatibility', () => {
    it('should decrypt data encrypted by different instance with same key', () => {
      const masterKey = 'shared-master-key';
      const crypto1 = new AccountCrypto(masterKey);
      const crypto2 = new AccountCrypto(masterKey);
      
      const testData = 'cross-instance-test';
      const encrypted = crypto1.encryptSimple(testData);
      const decrypted = crypto2.decryptSimple(encrypted);
      
      expect(decrypted).toBe(testData);
    });

    it('should fail to decrypt with different master key', () => {
      const crypto1 = new AccountCrypto('key1');
      const crypto2 = new AccountCrypto('key2');
      
      const encrypted = crypto1.encryptSimple('test-data');
      
      expect(() => {
        crypto2.decryptSimple(encrypted);
      }).toThrow();
    });
  });
});
