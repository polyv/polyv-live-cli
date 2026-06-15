/**
 * Enhanced account encryption system using AES-256-GCM for secure storage
 * 
 * Features:
 * - AES-256-GCM authenticated encryption
 * - POLYV_MASTER_KEY environment variable support
 * - Default key generation mechanism
 * - Comprehensive error handling
 * - Key validation and integrity checks
 * 
 * @fileoverview Account encryption implementation for story 6.4
 * @author Development Team
 * @since 1.0.0
 */

import * as crypto from 'crypto';
import * as os from 'os';

/**
 * Encrypted data structure with authentication
 */
export interface EncryptedData {
  /** Encryption algorithm identifier */
  algorithm: 'aes-256-gcm';
  /** Initialization vector (base64 encoded) */
  iv: string;
  /** Authentication tag (base64 encoded) */
  authTag: string;
  /** Encrypted data (base64 encoded) */
  encrypted: string;
}

/**
 * Account encryption interface
 */
export interface AccountEncryption {
  /**
   * Encrypt plaintext using AES-256-GCM
   * @param plaintext - Text to encrypt
   * @returns Encrypted data with authentication
   */
  encrypt(plaintext: string): EncryptedData;

  /**
   * Decrypt encrypted data using AES-256-GCM
   * @param encryptedData - Encrypted data to decrypt
   * @returns Decrypted plaintext
   */
  decrypt(encryptedData: EncryptedData): string;

  /**
   * Generate a secure master key
   * @returns Generated key string
   */
  generateKey(): string;

  /**
   * Validate encryption key strength and format
   * @param key - Key to validate
   * @returns True if key is valid
   */
  validateKey(key: string): boolean;
}

/**
 * Encryption configuration constants
 */
const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm' as const,
  keyLength: 32,
  ivLength: 16,
  authTagLength: 16,
  keyDerivationIterations: 100000,
  saltString: 'polyv-cli-security-salt-v1.0'
} as const;

/**
 * Enhanced account encryption implementation
 */
export class AccountEncryptionImpl implements AccountEncryption {
  private encryptionKey: Buffer;
  private keySource: 'environment' | 'generated';

  /**
   * Initialize AccountEncryption with master key
   * @param masterKey Optional master key, uses POLYV_MASTER_KEY env var or generates default
   */
  constructor(masterKey?: string) {
    const keyInfo = this.resolveEncryptionKey(masterKey);
    this.encryptionKey = keyInfo.key;
    this.keySource = keyInfo.source;
  }

  /**
   * Resolve encryption key from various sources
   * @param providedKey Optional provided key
   * @returns Key buffer and source information
   */
  private resolveEncryptionKey(providedKey?: string): { key: Buffer; source: 'environment' | 'generated' } {
    let keyString: string;
    let source: 'environment' | 'generated';

    if (providedKey) {
      // Use provided key
      keyString = providedKey;
      source = 'environment';
    } else if (process.env['POLYV_MASTER_KEY']) {
      // Use environment variable
      keyString = process.env['POLYV_MASTER_KEY'];
      source = 'environment';
    } else {
      // Generate default key based on user environment
      keyString = this.generateDefaultKey();
      source = 'generated';
    }

    // Validate key before using
    if (!this.validateKey(keyString)) {
      throw new Error('Invalid encryption key. Key must be at least 16 characters long and contain mixed case letters and numbers.');
    }

    // Derive strong encryption key using PBKDF2
    return {
      key: this.deriveEncryptionKey(keyString),
      source
    };
  }

  /**
   * Generate default encryption key based on user environment
   * @returns Generated key string
   */
  private generateDefaultKey(): string {
    // Create deterministic but unique key based on user environment
    let username = 'unknown';
    try {
      const userInfo = os.userInfo();
      username = userInfo && userInfo.username ? userInfo.username : 'unknown';
    } catch {
      username = 'unknown';
    }

    const machineInfo = {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      homedir: os.homedir(),
      username
    };

    // Create hash of machine information
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(machineInfo));
    hash.update('polyv-cli-default-key-v1.0');
    
    return hash.digest('hex');
  }

  /**
   * Derive encryption key using PBKDF2
   * @param masterKey Master key string
   * @returns Derived encryption key
   */
  private deriveEncryptionKey(masterKey: string): Buffer {
    const salt = Buffer.from(ENCRYPTION_CONFIG.saltString, 'utf8');
    return crypto.pbkdf2Sync(
      masterKey,
      salt,
      ENCRYPTION_CONFIG.keyDerivationIterations,
      ENCRYPTION_CONFIG.keyLength,
      'sha256'
    );
  }

  /**
   * Encrypt plaintext using AES-256-GCM
   * @param plaintext Text to encrypt
   * @returns Encrypted data with authentication
   * @throws Error if encryption fails
   */
  public encrypt(plaintext: string): EncryptedData {
    try {
      // Generate random IV
      const iv = crypto.randomBytes(ENCRYPTION_CONFIG.ivLength);
      
      // Create cipher
      const cipher = crypto.createCipheriv(ENCRYPTION_CONFIG.algorithm, this.encryptionKey, iv);
      
      // Encrypt the data
      let encrypted = cipher.update(plaintext, 'utf8');
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      
      // Get authentication tag
      const authTag = cipher.getAuthTag();

      return {
        algorithm: ENCRYPTION_CONFIG.algorithm,
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        encrypted: encrypted.toString('base64')
      };
    } catch (error) {
      throw new Error(
        `Failed to encrypt account secret. Please check your encryption key and try again. ` +
        `Error: ${error instanceof Error ? error.message : 'Unknown encryption error'}`
      );
    }
  }

  /**
   * Decrypt encrypted data using AES-256-GCM
   * @param encryptedData Encrypted data to decrypt
   * @returns Decrypted plaintext
   * @throws Error if decryption fails
   */
  public decrypt(encryptedData: EncryptedData): string {
    try {
      // Validate algorithm
      if (encryptedData.algorithm !== ENCRYPTION_CONFIG.algorithm) {
        throw new Error(`Unsupported encryption algorithm: ${encryptedData.algorithm}. Expected: ${ENCRYPTION_CONFIG.algorithm}`);
      }

      // Parse components
      const iv = Buffer.from(encryptedData.iv, 'base64');
      const authTag = Buffer.from(encryptedData.authTag, 'base64');
      const encrypted = Buffer.from(encryptedData.encrypted, 'base64');

      // Create decipher
      const decipher = crypto.createDecipheriv(ENCRYPTION_CONFIG.algorithm, this.encryptionKey, iv);
      decipher.setAuthTag(authTag);

      // Decrypt the data
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted.toString('utf8');
    } catch (error) {
      // Check for crypto-related errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('bad decrypt') || 
            errorMessage.includes('unsupported state or unable to authenticate data') ||
            errorMessage.includes('invalid authentication tag') ||
            errorMessage.includes('authentication failed')) {
          throw new Error(
            'Failed to decrypt account secret. This may be due to:\n' +
            '1. Incorrect encryption key (check POLYV_MASTER_KEY environment variable)\n' +
            '2. Corrupted configuration file\n' +
            '3. Configuration file created with different key\n\n' +
            'Try: polyv-live-cli config recover'
          );
        }
      }
      throw new Error(
        `Failed to decrypt account secret: ${error instanceof Error ? error.message : 'Unknown decryption error'}\n\n` +
        'Try: polyv-live-cli config recover'
      );
    }
  }

  /**
   * Generate a secure master key
   * @returns Generated key string
   */
  public generateKey(): string {
    // Generate cryptographically secure random key
    const randomBytes = crypto.randomBytes(32);
    return randomBytes.toString('hex');
  }

  /**
   * Validate encryption key strength and format
   * @param key Key to validate
   * @returns True if key is valid
   */
  public validateKey(key: string): boolean {
    if (!key || typeof key !== 'string') {
      return false;
    }

    // Minimum length requirement
    if (key.length < 16) {
      return false;
    }

    // Should contain mixed characters for better entropy
    const hasLowerCase = /[a-z]/.test(key);
    const hasUpperOrNumber = /[A-Z0-9]/.test(key);
    
    return hasLowerCase && hasUpperOrNumber;
  }

  /**
   * Test encryption/decryption functionality
   * @param testData Test data to encrypt and decrypt
   * @returns True if test passes, false otherwise
   */
  public testEncryption(testData: string = 'test-secret-data-2024'): boolean {
    try {
      const encrypted = this.encrypt(testData);
      const decrypted = this.decrypt(encrypted);
      return decrypted === testData;
    } catch {
      return false;
    }
  }

  /**
   * Get key source information
   * @returns Key source type
   */
  public getKeySource(): 'environment' | 'generated' {
    return this.keySource;
  }

  /**
   * Validate encrypted data integrity
   * @param encryptedData Encrypted data to validate
   * @returns True if data structure is valid
   */
  public validateEncryptedData(encryptedData: unknown): encryptedData is EncryptedData {
    if (!encryptedData || typeof encryptedData !== 'object') {
      return false;
    }

    const data = encryptedData as Record<string, unknown>;
    
    return (
      data['algorithm'] === ENCRYPTION_CONFIG.algorithm &&
      typeof data['iv'] === 'string' &&
      typeof data['authTag'] === 'string' &&
      typeof data['encrypted'] === 'string' &&
      data['iv'].length > 0 &&
      data['authTag'].length > 0 &&
      data['encrypted'].length > 0
    );
  }

  /**
   * Create encryption metadata for configuration versioning
   * @returns Encryption metadata
   */
  public getEncryptionMetadata(): {
    algorithm: string;
    keySource: 'environment' | 'generated';
    version: string;
  } {
    return {
      algorithm: ENCRYPTION_CONFIG.algorithm,
      keySource: this.keySource,
      version: '1.0'
    };
  }
}

/**
 * Factory function to create AccountEncryption instance
 * @param masterKey Optional master key
 * @returns AccountEncryption instance
 */
export function createAccountEncryption(masterKey?: string): AccountEncryption {
  return new AccountEncryptionImpl(masterKey);
}

/**
 * Default encryption instance for backward compatibility
 */
export const defaultAccountEncryption = createAccountEncryption();