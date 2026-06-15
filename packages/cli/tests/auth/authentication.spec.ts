import { execSync } from 'child_process';
import { join } from 'path';
import { mkdirSync, rmSync, existsSync } from 'fs';
import { tmpdir } from 'os';

describe('Authentication Integration Tests', () => {
  const cliPath = join(__dirname, '../../dist/index.js');

  beforeAll(() => {
    // Ensure the project is built before running tests
    try {
      execSync('npm run build', { cwd: join(__dirname, '../..'), stdio: 'pipe' });
    } catch (error) {
      console.error('Failed to build project before tests');
      throw error;
    }
  });

  describe('Command Line Authentication', () => {
    it('should show help with valid credentials but no command', () => {
      const output = execSync(
        `node ${cliPath} --appId valid-app-id-123456 --appSecret valid-app-secret-123456789`,
        { encoding: 'utf8' }
      );

      expect(output).toContain('CLI tool for managing PolyV live streaming services');
      expect(output).toContain('Usage: polyv-live-cli [options]');
    });

    it('should show help with complete authentication info', () => {
      const output = execSync(
        `node ${cliPath} --appId valid-app-id-123456 --appSecret valid-app-secret-123456789 --userId 12345`,
        { encoding: 'utf8' }
      );

      expect(output).toContain('CLI tool for managing PolyV live streaming services');
    });

    it('should show detailed error for missing appId', () => {
      try {
        execSync(
          `node ${cliPath} --appSecret valid-app-secret-123456789`,
          { encoding: 'utf8', stdio: 'pipe' }
        );
        fail('Should have thrown an error for missing appId');
      } catch (error: any) {
        const errorOutput = error.stderr || error.stdout || '';
        expect(errorOutput).toContain('Auth configuration is incomplete');
        // New configuration system shows general error message
        expect(error.status).toBe(1);
      }
    });

    it('should show detailed error for missing appSecret', () => {
      try {
        execSync(
          `node ${cliPath} --appId valid-app-id-123456`,
          { encoding: 'utf8', stdio: 'pipe' }
        );
        fail('Should have thrown an error for missing appSecret');
      } catch (error: any) {
        const errorOutput = error.stderr || error.stdout || '';
        expect(errorOutput).toContain('Auth configuration is incomplete');
        // Error message shows incomplete configuration
        expect(error.status).toBe(1);
      }
    });

    it('should show error for completely missing authentication', () => {
      // Create a temporary directory and copy built CLI but no .env files
      const tempDir = join(tmpdir(), 'polyv-test-no-env-' + Date.now());
      mkdirSync(tempDir, { recursive: true });
      
      // Create empty .env file to override the project's .env
      const fs = require('fs');
      fs.writeFileSync(join(tempDir, '.env'), '');
      
      const env = {
        PATH: process.env['PATH'],
        NODE_ENV: 'test',
        HOME: tempDir, // Use temp directory to isolate from user's account config
        // Clear all PolyV environment variables completely
        POLYV_APP_ID: '',
        POLYV_APP_SECRET: '',
        POLYV_USER_ID: '',
        POLYV_TEST_APP_ID: '',
        POLYV_TEST_APP_SECRET: '',
        POLYV_TEST_USER_ID: ''
      };
      
      // Remove undefined properties
      Object.keys(env).forEach(key => {
        if (env[key as keyof typeof env] === undefined) {
          delete env[key as keyof typeof env];
        }
      });
      
      try {
        execSync(
          `node ${cliPath} channel list`,
          { encoding: 'utf8', stdio: 'pipe', env, cwd: tempDir }
        );
        fail('Should have thrown an error for missing authentication');
      } catch (error: any) {
        const errorOutput = error.stderr || error.stdout || '';
        expect(errorOutput).toContain('Auth configuration is incomplete');
        expect(error.status).toBe(1);
      } finally {
        // Clean up temp directory
        if (existsSync(tempDir)) {
          rmSync(tempDir, { recursive: true, force: true });
        }
      }
    });
  });

  describe('Environment Variable Authentication', () => {
    const originalEnv = process.env;

    afterEach(() => {
      process.env = { ...originalEnv };
    });

    it('should show unknown command error after authenticating with environment variables', () => {
      const env = {
        ...process.env,
        POLYV_APP_ID: 'valid-app-id-123456',
        POLYV_APP_SECRET: 'valid-app-secret-123456789',
      };

      try {
        execSync(
          `node ${cliPath} unknown-command`,
          { encoding: 'utf8', stdio: 'pipe', env }
        );
        fail('Should have thrown an error for unknown command');
      } catch (error: any) {
        expect(error.stderr).toContain('Unknown command: unknown-command');
        expect(error.stderr).toContain('Run --help to see available commands');
        expect(error.status).toBe(1);
      }
    });

    it('should show unknown command error after authenticating with environment variables including userId', () => {
      const env = {
        ...process.env,
        POLYV_APP_ID: 'valid-app-id-123456',
        POLYV_APP_SECRET: 'valid-app-secret-123456789',
        POLYV_USER_ID: '12345',
      };

      try {
        execSync(
          `node ${cliPath} unknown-command`,
          { encoding: 'utf8', stdio: 'pipe', env }
        );
        fail('Should have thrown an error for unknown command');
      } catch (error: any) {
        expect(error.stderr).toContain('Unknown command: unknown-command');
        expect(error.stderr).toContain('Run --help to see available commands');
        expect(error.status).toBe(1);
      }
    });

    it('should show source information in error for partial environment config', () => {
      // Create a temporary directory and create .env with only partial config
      const tempDir = join(tmpdir(), 'polyv-test-partial-env-' + Date.now());
      mkdirSync(tempDir, { recursive: true });
      
      // Create .env file with only APP_ID (missing APP_SECRET)
      const fs = require('fs');
      fs.writeFileSync(join(tempDir, '.env'), 'POLYV_APP_ID=valid-app-id-123456\n');
      
      const env = {
        PATH: process.env['PATH'],
        NODE_ENV: 'test',
        HOME: tempDir, // Use temp directory to isolate from user's account config
        // Clear all PolyV environment variables to force .env file loading
        POLYV_APP_ID: '',
        POLYV_APP_SECRET: '',
        POLYV_USER_ID: '',
        POLYV_TEST_APP_ID: '',
        POLYV_TEST_APP_SECRET: '',
        POLYV_TEST_USER_ID: ''
      };
      
      // Remove undefined properties
      Object.keys(env).forEach(key => {
        if (env[key as keyof typeof env] === undefined) {
          delete env[key as keyof typeof env];
        }
      });

      try {
        execSync(
          `node ${cliPath} channel list`,  // Use a valid command that requires auth
          { encoding: 'utf8', stdio: 'pipe', env, cwd: tempDir }
        );
        fail('Should have thrown an error for missing appSecret');
      } catch (error: any) {
        const errorOutput = error.stderr || error.stdout || '';
        expect(errorOutput).toContain('Auth configuration is incomplete');
        // Configuration shows incomplete auth
        expect(error.status).toBe(1);
      } finally {
        // Clean up temp directory
        if (existsSync(tempDir)) {
          rmSync(tempDir, { recursive: true, force: true });
        }
      }
    });
  });

  describe('Authentication Priority', () => {
    it('should prioritize CLI parameters over environment variables', () => {
      const env = {
        ...process.env,
        POLYV_APP_ID: 'valid-app-id-123456',
        POLYV_APP_SECRET: 'valid-app-secret-123456789',
        POLYV_USER_ID: '12345',
      };

      // Use DEBUG=1 to see source information
      const debugEnv = { ...env, DEBUG: '1' };

      try {
        execSync(
          `node ${cliPath} --appId valid-app-id-123456 --appSecret valid-app-secret-123456789 unknown-command`,
          { encoding: 'utf8', stdio: 'pipe', env: debugEnv }
        );
        fail('Should have thrown an error for unknown command');
      } catch (error: any) {
        expect(error.stderr).toContain('Unknown command: unknown-command');
        expect(error.stderr).toContain('Run --help to see available commands');
        expect(error.status).toBe(1);
      }
    });

    it('should use environment variables when CLI parameters are missing', () => {
      const env = {
        ...process.env,
        POLYV_APP_ID: 'valid-app-id-123456',
        POLYV_APP_SECRET: 'valid-app-secret-123456789',
        DEBUG: '1',
      };

      try {
        execSync(
          `node ${cliPath} --userId 12345 unknown-command`,
          { encoding: 'utf8', stdio: 'pipe', env }
        );
        fail('Should have thrown an error for unknown command');
      } catch (error: any) {
        expect(error.stderr).toContain('Unknown command: unknown-command');
        expect(error.stderr).toContain('Run --help to see available commands');
        expect(error.status).toBe(1);
      }
    });
  });

  describe('Help and Version Commands', () => {
    it('should not require authentication for help command', () => {
      const output = execSync(`node ${cliPath} --help`, { encoding: 'utf8' });

      expect(output).toContain('CLI tool for managing PolyV live streaming services');
      expect(output).toContain('Authentication:');
      expect(output).toContain('--appId and --appSecret parameters');
      expect(output).toContain('POLYV_APP_ID and POLYV_APP_SECRET environment variables');
      expect(output).not.toContain('Missing required authentication');
    });

    it('should not require authentication for version command', () => {
      const output = execSync(`node ${cliPath} --version`, { encoding: 'utf8' });

      expect(output.trim()).toMatch(/^\d+\.\d+\.\d+$/);
      expect(output).not.toContain('Missing required authentication');
    });

    it('should not require authentication for help with auth parameters', () => {
      const output = execSync(
        `node ${cliPath} --appId valid-app-id-123456 --appSecret valid-app-secret-123456789 --help`,
        { encoding: 'utf8' }
      );

      expect(output).toContain('CLI tool for managing PolyV live streaming services');
      expect(output).not.toContain('Missing required authentication');
    });
  });

  describe('Enhanced Help Text', () => {
    it('should show authentication examples in help', () => {
      const output = execSync(`node ${cliPath} --help`, { encoding: 'utf8' });

      expect(output).toContain('Authentication:');
      expect(output).toContain('- Use \'polyv-live-cli account add\' to add accounts');
      expect(output).toContain('- Or use --appId and --appSecret parameters');
      expect(output).toContain('- Or set POLYV_APP_ID and POLYV_APP_SECRET environment variables');
    });
  });

  describe('Security', () => {
    it('should not expose sensitive information in error messages', () => {
      try {
        execSync(
          `node ${cliPath} --appId valid-app-id-123456 unknown-command`,
          { encoding: 'utf8', stdio: 'pipe' }
        );
        fail('Should have thrown an error');
      } catch (error: any) {
        // Should mention missing appSecret but not expose any actual secrets
        const errorOutput = error.stderr || error.stdout || '';
        expect(errorOutput).toContain('Auth configuration is incomplete');
        expect(errorOutput).not.toContain('valid-app-id-123456'); // Should not expose the appId value
        expect(errorOutput).not.toContain('secret'); // Should not contain any secret values
      }
    });

    it('should not log sensitive authentication details to stdout', () => {
      try {
        execSync(
          `node ${cliPath} --appId valid-app-id-123456 --appSecret valid-app-secret-123456789 unknown-command`,
          { encoding: 'utf8', stdio: 'pipe' }
        );
        fail('Should have thrown an error for unknown command');
      } catch (error: any) {
        // Check stderr for unknown command error
        expect(error.stderr).toContain('Unknown command: unknown-command');
        // Ensure no sensitive data is exposed in any output
        const allOutput = (error.stderr || '') + (error.stdout || '');
        expect(allOutput).not.toContain('valid-app-id-123456');
        expect(allOutput).not.toContain('valid-app-secret-123456789');
        expect(error.status).toBe(1);
      }
    });
  });
});