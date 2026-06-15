/**
 * @fileoverview Integration tests for account management functionality
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

describe('Account Management Integration', () => {
  let tempDir: string;
  let configPath: string;
  let originalHome: string | undefined;

  beforeAll(() => {
    // Create temporary directory for tests
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'polyv-integration-'));
    configPath = path.join(tempDir, '.polyv', 'accounts.json');
    
    // Mock home directory
    originalHome = process.env['HOME'];
    process.env['HOME'] = tempDir;
  });

  afterAll(() => {
    // Restore original home directory
    if (originalHome) {
      process.env['HOME'] = originalHome;
    } else {
      delete process.env['HOME'];
    }
    
    // Clean up temporary files
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    // Clean up config file before each test
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
  });

  const runCLI = (args: string[]): { stdout: string; stderr: string; exitCode: number } => {
    try {
      const result = execSync(`node dist/index.js ${args.join(' ')}`, {
        cwd: path.join(__dirname, '../../'),
        encoding: 'utf8',
        stdio: 'pipe',
        env: { ...process.env, HOME: tempDir }
      });
      return { stdout: result, stderr: '', exitCode: 0 };
    } catch (error: any) {
      return {
        stdout: error.stdout || '',
        stderr: error.stderr || '',
        exitCode: error.status || 1
      };
    }
  };

  describe('account add command', () => {
    it('should add new account successfully', () => {
      const result = runCLI([
        'account', 'add', 'test-account',
        '--app-id', 'testappid12345678',
        '--app-secret', 'testsecret1234567890'
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('added successfully');
      expect(result.stdout).toContain('test-account');
      expect(result.stdout).toContain('testappid12345678');
      
      // Verify config file was created
      expect(fs.existsSync(configPath)).toBe(true);
    });

    it('should add account with user ID', () => {
      const result = runCLI([
        'account', 'add', 'test-account',
        '--app-id', 'testappid12345678',
        '--app-secret', 'testsecret1234567890',
        '--user-id', 'user123'
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('User ID: user123');
    });

    it('should reject duplicate account names', () => {
      // Add first account
      runCLI([
        'account', 'add', 'test-account',
        '--app-id', 'testappid12345678',
        '--app-secret', 'testsecret1234567890'
      ]);

      // Try to add duplicate
      const result = runCLI([
        'account', 'add', 'test-account',
        '--app-id', 'otherappid87654321',
        '--app-secret', 'othersecret0987654321abc'
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('already exists');
    });

    it('should validate required parameters', () => {
      const result = runCLI(['account', 'add', 'test-account']);
      
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('required option \'--app-id');
    });

    it('should validate app-id format', () => {
      const result = runCLI([
        'account', 'add', 'test-account',
        '--app-id', 'invalid-app-id!',
        '--app-secret', 'testsecret1234567890'
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('can only contain letters and numbers');
    });
  });

  describe('account list command', () => {
    beforeEach(() => {
      // Add test accounts
      runCLI([
        'account', 'add', 'account1',
        '--app-id', 'appid1234567890',
        '--app-secret', 'secret1234567890abc',
        '--user-id', 'user1'
      ]);
      runCLI([
        'account', 'add', 'account2',
        '--app-id', 'appid0987654321',
        '--app-secret', 'secret0987654321def'
      ]);
    });

    it('should list accounts in table format', () => {
      const result = runCLI(['account', 'list']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Configured Accounts');
      expect(result.stdout).toContain('account1');
      expect(result.stdout).toContain('account2');
      expect(result.stdout).toContain('appid1234567890');
      expect(result.stdout).toContain('appid0987654321');
      expect(result.stdout).toContain('user1');
      expect(result.stdout).toContain('Total: 2 accounts');
    });

    it('should list accounts in JSON format', () => {
      const result = runCLI(['account', 'list', '--output', 'json']);

      expect(result.exitCode).toBe(0);
      
      const accounts = JSON.parse(result.stdout);
      expect(Array.isArray(accounts)).toBe(true);
      expect(accounts).toHaveLength(2);
      expect(accounts[0]).toHaveProperty('name');
      expect(accounts[0]).toHaveProperty('appId');
      expect(accounts[0]).not.toHaveProperty('appSecret');
    });

    it('should handle empty account list', () => {
      // Remove all accounts first
      runCLI(['account', 'remove', 'account1', '--force']);
      runCLI(['account', 'remove', 'account2', '--force']);

      const result = runCLI(['account', 'list']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('No accounts configured');
      expect(result.stdout).toContain('Use "polyv-live-cli account add');
    });
  });

  describe('account remove command', () => {
    beforeEach(() => {
      runCLI([
        'account', 'add', 'test-account',
        '--app-id', 'testappid12345678',
        '--app-secret', 'testsecret1234567890'
      ]);
    });

    it('should remove account with force flag', () => {
      const result = runCLI(['account', 'remove', 'test-account', '--force']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('removed successfully');

      // Verify account is gone
      const listResult = runCLI(['account', 'list']);
      expect(listResult.stdout).toContain('No accounts configured');
    });

    it('should reject removal of non-existent account', () => {
      const result = runCLI(['account', 'remove', 'non-existent', '--force']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Account \'non-existent\' not found');
    });
  });

  describe('account current command', () => {
    it('should show current account status', () => {
      const result = runCLI(['account', 'current']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Current Account Status');
      expect(result.stdout).toContain('Authentication Source');
      expect(result.stdout).toContain('Session Information');
    });

    it('should list available accounts', () => {
      runCLI([
        'account', 'add', 'test-account',
        '--app-id', 'testappid12345678',
        '--app-secret', 'testsecret1234567890'
      ]);

      const result = runCLI(['account', 'current']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('test-account');
      expect(result.stdout).toContain('testappid12345678');
    });
  });

  describe('config file security', () => {
    it('should create config file with secure permissions', () => {
      runCLI([
        'account', 'add', 'test-account',
        '--app-id', 'testappid12345678',
        '--app-secret', 'testsecret1234567890'
      ]);

      expect(fs.existsSync(configPath)).toBe(true);
      
      // Check file permissions (on Unix systems)
      if (process.platform !== 'win32') {
        const stats = fs.statSync(configPath);
        const permissions = stats.mode & parseInt('777', 8);
        expect(permissions).toBe(parseInt('600', 8));
      }
    });

    it('should encrypt sensitive data in config file', () => {
      runCLI([
        'account', 'add', 'test-account',
        '--app-id', 'testappid12345678',
        '--app-secret', 'testsecret1234567890'
      ]);

      const configContent = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configContent);
      
      expect(config.accounts['test-account'].appSecret).toBeDefined();
      expect(config.accounts['test-account'].appSecret).not.toBe('testsecret1234567890');
      expect(config.accounts['test-account'].appSecret).not.toContain('testsecret');
    });
  });

  describe('error handling', () => {
    it('should handle invalid command arguments gracefully', () => {
      const result = runCLI(['account', 'invalid-command']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('error');
    });

    it('should handle corrupted config file', () => {
      // Create corrupted config file
      fs.mkdirSync(path.dirname(configPath), { recursive: true });
      fs.writeFileSync(configPath, 'invalid-json');

      const result = runCLI(['account', 'list']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Invalid JSON in accounts configuration file');
    });
  });

  describe('help and usage', () => {
    it('should show help for account command', () => {
      const result = runCLI(['account', '--help']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Manage PolyV account configurations');
      expect(result.stdout).toContain('add');
      expect(result.stdout).toContain('remove');
      expect(result.stdout).toContain('list');
      expect(result.stdout).toContain('current');
    });

    it('should show help for account add command', () => {
      const result = runCLI(['account', 'add', '--help']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Add a new account configuration');
      expect(result.stdout).toContain('--app-id');
      expect(result.stdout).toContain('--app-secret');
      expect(result.stdout).toContain('--user-id');
    });
  });
});
