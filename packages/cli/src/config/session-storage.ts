/**
 * Session storage manager for cross-platform session state persistence
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { SessionState, SessionStorageConfig, DEFAULT_SESSION_CONFIG } from '../types/session.types';

/**
 * Session storage manager class
 */
export class SessionStorage {
  private config: SessionStorageConfig;
  private sessionDir: string;

  /**
   * Initialize SessionStorage
   * @param config Optional custom session storage configuration
   */
  constructor(config?: Partial<SessionStorageConfig>) {
    this.config = { ...DEFAULT_SESSION_CONFIG, ...config };
    this.sessionDir = this.getSessionDirectory();
  }

  /**
   * Get session storage directory path
   * @returns Session directory path
   */
  private getSessionDirectory(): string {
    // Respect HOME environment variable for testing isolation
    const homeDir = process.env['HOME'] || os.homedir();
    return path.join(homeDir, this.config.sessionDir);
  }

  /**
   * Ensure session directory exists
   */
  private ensureSessionDir(): void {
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true, mode: 0o700 });
    }
  }

  /**
   * Generate terminal ID based on stable terminal identifiers
   * @returns Terminal identifier string
   */
  private generateTerminalId(): string {
    // Use TERM_SESSION_ID as primary identifier if available (macOS Terminal.app)
    const sessionId = process.env['TERM_SESSION_ID'];
    if (sessionId) {
      const hash = this.simpleHash(sessionId);
      return `term-${hash}`;
    }
    
    // Fallback for other terminals
    const term = process.env['TERM'] || 'unknown';
    const shell = process.env['SHELL'] || '';
    const ppid = process.ppid || 0;
    
    // Create identifier based on parent process and terminal type
    const baseId = `${ppid}-${term}`;
    const hash = this.simpleHash(baseId + shell);
    
    return `term-${hash}`;
  }

  /**
   * Simple hash function for generating terminal ID
   * @param str String to hash
   * @returns Hash string
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get session file path for current terminal
   * @returns Session file path
   */
  private getSessionFilePath(): string {
    const terminalId = this.generateTerminalId();
    const fileName = `${this.config.filePrefix}-${terminalId}.json`;
    return path.join(this.sessionDir, fileName);
  }

  /**
   * Set session account for current terminal
   * @param accountName Account name to set
   * @returns True if successful, false otherwise
   */
  public setSessionAccount(accountName: string): boolean {
    try {
      // Set environment variable
      process.env[this.config.envVarName] = accountName;

      // Create session state
      const sessionState: SessionState = {
        accountName,
        processId: process.pid,
        terminalId: this.generateTerminalId(),
        setAt: new Date(),
        ...(this.config.expirationMs && {
          expiresAt: new Date(Date.now() + this.config.expirationMs)
        })
      };

      // Save to file as backup
      this.ensureSessionDir();
      const sessionFile = this.getSessionFilePath();
      fs.writeFileSync(sessionFile, JSON.stringify(sessionState, null, 2), { mode: 0o600 });

      return true;
    } catch (error) {
      console.warn(`Warning: Could not persist session state: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  /**
   * Get current session account
   * @returns Account name if set, null otherwise
   */
  public getSessionAccount(): string | null {
    try {
      // First check environment variable (primary source)
      const envAccount = process.env[this.config.envVarName];
      if (envAccount) {
        return envAccount;
      }

      // Fallback to session file
      const sessionFile = this.getSessionFilePath();
      if (fs.existsSync(sessionFile)) {
        const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
        const sessionState = this.parseSessionState(sessionData);
        
        if (sessionState && this.isSessionValid(sessionState)) {
          // Restore environment variable
          process.env[this.config.envVarName] = sessionState.accountName;
          return sessionState.accountName;
        }
      }

      return null;
    } catch (error) {
      console.warn(`Warning: Could not read session state: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }

  /**
   * Clear current session account
   * @returns True if successful, false otherwise
   */
  public clearSessionAccount(): boolean {
    try {
      // Clear environment variable
      delete process.env[this.config.envVarName];

      // Remove session file
      const sessionFile = this.getSessionFilePath();
      if (fs.existsSync(sessionFile)) {
        fs.unlinkSync(sessionFile);
      }

      return true;
    } catch (error) {
      console.warn(`Warning: Could not clear session state: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  /**
   * Get current session state
   * @returns Session state if exists, null otherwise
   */
  public getSessionState(): SessionState | null {
    try {
      const accountName = this.getSessionAccount();
      if (!accountName) {
        return null;
      }

      const sessionFile = this.getSessionFilePath();
      if (fs.existsSync(sessionFile)) {
        const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
        return this.parseSessionState(sessionData);
      }

      // Create minimal session state from environment
      return {
        accountName,
        processId: process.pid,
        terminalId: this.generateTerminalId(),
        setAt: new Date()
      };
    } catch (error) {
      console.warn(`Warning: Could not get session state: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }

  /**
   * Parse and validate session state from JSON data
   * @param data JSON data to parse
   * @returns Parsed session state or null if invalid
   */
  private parseSessionState(data: any): SessionState | null {
    try {
      if (!data || typeof data !== 'object') {
        return null;
      }

      const sessionState: SessionState = {
        accountName: data.accountName,
        processId: data.processId,
        terminalId: data.terminalId,
        setAt: new Date(data.setAt),
        ...(data.expiresAt && { expiresAt: new Date(data.expiresAt) })
      };

      return this.isSessionValid(sessionState) ? sessionState : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if session state is valid
   * @param sessionState Session state to validate
   * @returns True if valid, false otherwise
   */
  private isSessionValid(sessionState: SessionState): boolean {
    try {
      // Check required fields
      if (!sessionState.accountName || !sessionState.processId || !sessionState.terminalId) {
        return false;
      }

      // Check expiration
      if (sessionState.expiresAt && sessionState.expiresAt < new Date()) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clean up expired session files
   * @returns Number of cleaned files
   */
  public cleanupExpiredSessions(): number {
    try {
      if (!fs.existsSync(this.sessionDir)) {
        return 0;
      }

      const files = fs.readdirSync(this.sessionDir);
      let cleanedCount = 0;

      for (const file of files) {
        if (!file.startsWith(this.config.filePrefix)) {
          continue;
        }

        const filePath = path.join(this.sessionDir, file);
        try {
          const sessionData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const sessionState = this.parseSessionState(sessionData);

          if (!sessionState || !this.isSessionValid(sessionState)) {
            fs.unlinkSync(filePath);
            cleanedCount++;
          }
        } catch {
          // Remove corrupted files
          fs.unlinkSync(filePath);
          cleanedCount++;
        }
      }

      return cleanedCount;
    } catch (error) {
      console.warn(`Warning: Could not cleanup expired sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return 0;
    }
  }

  /**
   * Get session directory path
   * @returns Session directory path
   */
  public getSessionDir(): string {
    return this.sessionDir;
  }

  /**
   * Get environment variable name
   * @returns Environment variable name
   */
  public getEnvVarName(): string {
    return this.config.envVarName;
  }
}
