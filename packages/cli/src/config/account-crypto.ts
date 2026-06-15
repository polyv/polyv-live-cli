/**
 * Account encryption utility for secure storage of sensitive account information
 */

import * as crypto from 'crypto';
import { EncryptionMetadata } from '../types/account.types';

/**
 * Encryption configuration constants
 */
const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-cbc',
  keyLength: 32,
  ivLength: 16,
  defaultMasterKey: 'polyv-cli-default-master-key-2024'
} as const;

/**
 * Account crypto utility class for encrypting and decrypting account secrets
 */
export class AccountCrypto {
  private masterKey: Buffer;

  /**
   * Initialize AccountCrypto with master key
   * @param masterKey Optional master key, defaults to environment variable or default key
   */
  constructor(masterKey?: string) {
    const keySource = masterKey || process.env['POLYV_MASTER_KEY'] || ENCRYPTION_CONFIG.defaultMasterKey;
    this.masterKey = this.deriveKey(keySource);
  }

  /**
   * Derive encryption key from master key using PBKDF2
   * @param masterKey Master key string
   * @returns Derived key buffer
   */
  private deriveKey(masterKey: string): Buffer {
    const salt = Buffer.from('polyv-cli-salt-2024', 'utf8');
    return crypto.pbkdf2Sync(masterKey, salt, 100000, ENCRYPTION_CONFIG.keyLength, 'sha256');
  }

  /**
   * Encrypt account secret using AES-256-CBC
   * @param plaintext Plain text secret to encrypt
   * @returns Encrypted data with metadata
   */
  public encrypt(plaintext: string): { encrypted: string; metadata: EncryptionMetadata } {
    try {
      // Generate random IV
      const iv = crypto.randomBytes(ENCRYPTION_CONFIG.ivLength);
      
      // Create cipher
      const cipher = crypto.createCipheriv(ENCRYPTION_CONFIG.algorithm, this.masterKey, iv);
      
      // Encrypt the data
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const metadata: EncryptionMetadata = {
        algorithm: ENCRYPTION_CONFIG.algorithm,
        iv: iv.toString('hex'),
        authTag: '' // Not used in CBC mode
      };

      return {
        encrypted,
        metadata
      };
    } catch (error) {
      throw new Error(`Failed to encrypt account secret: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt account secret using AES-256-CBC
   * @param encrypted Encrypted data
   * @param metadata Encryption metadata
   * @returns Decrypted plain text secret
   */
  public decrypt(encrypted: string, metadata: EncryptionMetadata): string {
    try {
      // Validate metadata
      if (metadata.algorithm !== ENCRYPTION_CONFIG.algorithm) {
        throw new Error(`Unsupported encryption algorithm: ${metadata.algorithm}`);
      }

      // Create decipher
      const iv = Buffer.from(metadata.iv, 'hex');
      const decipher = crypto.createDecipheriv(metadata.algorithm, this.masterKey, iv);

      // Decrypt the data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Failed to decrypt account secret: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Encrypt account secret with simplified interface
   * @param plaintext Plain text secret to encrypt
   * @returns Base64 encoded encrypted data with embedded metadata
   */
  public encryptSimple(plaintext: string): string {
    const { encrypted, metadata } = this.encrypt(plaintext);
    const combined = {
      data: encrypted,
      meta: metadata
    };
    return Buffer.from(JSON.stringify(combined)).toString('base64');
  }

  /**
   * Decrypt account secret with simplified interface
   * @param encryptedData Base64 encoded encrypted data with embedded metadata
   * @returns Decrypted plain text secret
   */
  public decryptSimple(encryptedData: string): string {
    try {
      const combined = JSON.parse(Buffer.from(encryptedData, 'base64').toString('utf8'));
      return this.decrypt(combined.data, combined.meta);
    } catch (error) {
      throw new Error(`Failed to decrypt account secret: Invalid encrypted data format`);
    }
  }

  /**
   * Validate if encrypted data can be decrypted
   * @param encryptedData Encrypted data to validate
   * @returns True if data can be decrypted, false otherwise
   */
  public validateEncryptedData(encryptedData: string): boolean {
    try {
      this.decryptSimple(encryptedData);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate a secure random master key
   * @returns Random master key string
   */
  public static generateMasterKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Test encryption/decryption functionality
   * @param testData Test data to encrypt and decrypt
   * @returns True if test passes, false otherwise
   */
  public testEncryption(testData: string = 'test-secret-data'): boolean {
    try {
      const encrypted = this.encryptSimple(testData);
      const decrypted = this.decryptSimple(encrypted);
      return decrypted === testData;
    } catch {
      return false;
    }
  }
}
