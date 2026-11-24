/**
 * Encryption of the secrets kept in the account file.
 *
 * AES-256-CBC under a key derived with PBKDF2 from `POLYV_VOD_MASTER_KEY` (a fixed default
 * when unset), the same scheme the live CLI uses. It protects against reading the file by
 * accident or pasting it somewhere; the owner-only file permissions are what keep other users
 * out, so set a master key when that is not enough.
 */
import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-cbc';
const PREFIX = 'enc:v1:';
const DEFAULT_MASTER_KEY = 'polyv-vod-cli-default-master-key-2025';
const MASTER_KEY_ENV = 'POLYV_VOD_MASTER_KEY';

function deriveKey(): Buffer {
  const masterKey = process.env[MASTER_KEY_ENV] || DEFAULT_MASTER_KEY;
  return pbkdf2Sync(masterKey, 'polyv-vod-cli-salt-2025', 100_000, 32, 'sha256');
}

export function encryptSecret(plainText: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, deriveKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  return `${PREFIX}${iv.toString('hex')}:${encrypted.toString('base64')}`;
}

/** Decrypts a value produced by {@link encryptSecret}; anything else is returned as is. */
export function decryptSecret(value: string): string {
  if (!value.startsWith(PREFIX)) return value;
  const [ivHex, payload] = value.slice(PREFIX.length).split(':');
  if (!ivHex || !payload) throw new Error('Stored credential is malformed; add the account again');
  try {
    const decipher = createDecipheriv(ALGORITHM, deriveKey(), Buffer.from(ivHex, 'hex'));
    return Buffer.concat([decipher.update(Buffer.from(payload, 'base64')), decipher.final()]).toString('utf8');
  } catch {
    // Almost always a different POLYV_VOD_MASTER_KEY than the one the account was saved with.
    throw new Error(
      'Cannot decrypt a stored credential: it was saved with a different POLYV_VOD_MASTER_KEY. ' +
        'Run with the key it was saved with, or unset the key and add the account again.'
    );
  }
}
