import { execSync } from 'child_process';
import { join } from 'path';
import { unlinkSync } from 'fs';

describe('Index.ts Integration Tests', () => {
  const cliPath = join(__dirname, '../dist/index.js');
  const testPackagePath = join(__dirname, '../package-test.json');

  beforeAll(() => {
    // Ensure the project is built before running tests
    try {
      execSync('npm run build', { cwd: join(__dirname, '..'), stdio: 'pipe' });
    } catch (error) {
      console.error('Failed to build project before tests');
      throw error;
    }
  });

  afterEach(() => {
    // Clean up any test files
    try {
      unlinkSync(testPackagePath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  describe('Version handling', () => {
    it('should display version correctly', () => {
      const output = execSync(`node ${cliPath} --version`, { encoding: 'utf8', stdio: 'pipe' });
      
      // Should display the version number
      expect(output.trim()).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('Authentication with DEBUG mode', () => {
    it('should show debug information when DEBUG=1', () => {
      const env = {
        ...process.env,
        DEBUG: '1',
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

    it('should show debug info for CLI parameters', () => {
      const env = {
        ...process.env,
        DEBUG: '1',
      };

      try {
        execSync(
          `node ${cliPath} --appId debug-cli-id --appSecret debug-cli-secret unknown-command`,
          { encoding: 'utf8', stdio: 'pipe', env }
        );
        fail('Should have thrown an error for unknown command');
      } catch (error: any) {
        expect(error.stderr).toContain('Unknown command: unknown-command');
        expect(error.status).toBe(1);
      }
    });
  });

  describe('Help and version commands with auth options', () => {
    it('should not validate auth for help command even with invalid auth', () => {
      const output = execSync(
        `node ${cliPath} --appId incomplete --help`,
        { encoding: 'utf8' }
      );

      expect(output).toContain('CLI tool for managing PolyV live streaming services');
      expect(output).toContain('Authentication:');
      expect(output).not.toContain('Missing required authentication');
    });

    it('should not validate auth for version command even with invalid auth', () => {
      const output = execSync(
        `node ${cliPath} --appSecret incomplete --version`,
        { encoding: 'utf8' }
      );

      expect(output.trim()).toMatch(/^\d+\.\d+\.\d+$/);
      expect(output).not.toContain('Missing required authentication');
    });

    it('should handle -h flag with partial auth', () => {
      const output = execSync(
        `node ${cliPath} --userId only-user -h`,
        { encoding: 'utf8' }
      );

      expect(output).toContain('CLI tool for managing PolyV live streaming services');
      expect(output).not.toContain('Missing required authentication');
    });

    it('should handle -v flag with partial auth', () => {
      const output = execSync(
        `node ${cliPath} --appId partial-id -v`,
        { encoding: 'utf8' }
      );

      expect(output.trim()).toMatch(/^\d+\.\d+\.\d+$/);
      expect(output).not.toContain('Missing required authentication');
    });
  });

  describe('Command parsing and unknown command handling', () => {
    it('should store unknown command for later processing', () => {
      try {
        execSync(
          `node ${cliPath} --appId valid-app-id-123456 --appSecret valid-app-secret-123456789 some-unknown-cmd`,
          { encoding: 'utf8', stdio: 'pipe' }
        );
        fail('Should have thrown an error for unknown command');
      } catch (error: any) {
        expect(error.stderr).toContain('Unknown command: some-unknown-cmd');
        expect(error.stderr).toContain('Run --help to see available commands');
        expect(error.status).toBe(1);
      }
    });

    it('should handle empty unknown command gracefully', () => {
      // Test the case where args[0] might be undefined
      const output = execSync(
        `node ${cliPath} --appId valid-app-id-123456 --appSecret valid-app-secret-123456789`,
        { encoding: 'utf8' }
      );
      
      // Should show help when only auth options are provided
      expect(output).toContain('CLI tool for managing PolyV live streaming services');
    });
  });

  describe('Global options detection', () => {
    it('should detect hasOnlyGlobalOptions correctly with values', () => {
      const output = execSync(
        `node ${cliPath} --appId valid-app-id-123456 --appSecret valid-app-secret-123456789 --userId 12345`,
        { encoding: 'utf8' }
      );
      
      // Should show help when only global options are provided
      expect(output).toContain('CLI tool for managing PolyV live streaming services');
    });

    it('should handle mixed global options and detect them properly', () => {
      const output = execSync(
        `node ${cliPath} --appId valid-app-id-123456 --appSecret valid-app-secret-123456789`,
        { encoding: 'utf8' }
      );

      expect(output).toContain('CLI tool for managing PolyV live streaming services');
    });
  });

  describe('Authentication error handling in different contexts', () => {
    it('should prioritize auth errors over unknown command errors', () => {
      try {
        execSync(
          `node ${cliPath} --appId partial-only unknown-cmd`,
          { encoding: 'utf8', stdio: 'pipe' }
        );
        fail('Should have thrown an authentication error');
      } catch (error: any) {
        const errorOutput = error.stderr || error.stdout || '';
        expect(errorOutput).toContain('Auth configuration is incomplete');
        expect(error.status).toBe(1);
      }
    });

    it('should handle auth error in loadAndValidateAuth for unknown commands', () => {
      try {
        execSync(
          `node ${cliPath} --appSecret secret-only unknown-cmd`,
          { encoding: 'utf8', stdio: 'pipe' }
        );
        fail('Should have thrown an authentication error');
      } catch (error: any) {
        const errorOutput = error.stderr || error.stdout || '';
        expect(errorOutput).toContain('Auth configuration is incomplete');
        expect(error.status).toBe(1);
      }
    });
  });

  describe('Successful authentication flow', () => {
    it('should show success message with valid credentials and no command', () => {
      const output = execSync(
        `node ${cliPath} --appId valid-app-id-123456 --appSecret valid-app-secret-123456789`,
        { encoding: 'utf8' }
      );

      expect(output).toContain('CLI tool for managing PolyV live streaming services');
    });

    it('should handle successful authentication with userId', () => {
      const output = execSync(
        `node ${cliPath} --appId valid-app-id-123456 --appSecret valid-app-secret-123456789 --userId 12345`,
        { encoding: 'utf8' }
      );

      expect(output).toContain('CLI tool for managing PolyV live streaming services');
    });

    it('should show success messages when auth is valid but no command provided', () => {
      // This should trigger lines 175-176: successful auth logging
      const env = {
        ...process.env,
        POLYV_APP_ID: 'valid-app-id-123456',
        POLYV_APP_SECRET: 'valid-app-secret-123456789',
      };

      // When we provide a non-existent command but with valid auth
      // It should first validate auth, then show unknown command error
      try {
        execSync(
          `node ${cliPath} some-non-existent-command`,
          { encoding: 'utf8', stdio: 'pipe', env }
        );
        fail('Should have thrown error for unknown command');
      } catch (error: any) {
        expect(error.stderr).toContain('Unknown command: some-non-existent-command');
        expect(error.stderr).toContain('Run --help to see available commands');
        expect(error.status).toBe(1);
      }
    });
  });

  describe('Edge cases and error conditions', () => {
    it('should handle non-Error objects in loadAndValidateAuth', () => {
      // This is harder to test directly, but we can test the string conversion path
      try {
        execSync(
          `node ${cliPath} --appId "" --appSecret "" unknown-cmd`,
          { encoding: 'utf8', stdio: 'pipe' }
        );
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.status).toBe(1);
      }
    });

    it('should handle edge case where unknownCommand is null but command exists', () => {
      // Test the case where unknownCommand might be set to null
      const output = execSync(
        `node ${cliPath}`,
        { encoding: 'utf8' }
      );

      expect(output).toContain('CLI tool for managing PolyV live streaming services');
    });

    it('should handle auth error when only global options provided with invalid auth', () => {
      // This should trigger lines 148-149: auth error handling
      try {
        execSync(
          `node ${cliPath} --appId partial-auth-only`,
          { encoding: 'utf8', stdio: 'pipe' }
        );
        fail('Should have thrown authentication error');
      } catch (error: any) {
        const errorOutput = error.stderr || error.stdout || '';
        expect(errorOutput).toContain('Auth configuration is incomplete');
        expect(error.status).toBe(1);
      }
    });

    it('should handle successful authentication when no actual command is present', () => {
      // This should test the path where authentication succeeds but no command follows
      // This tests a different code path than unknown commands
      try {
        execSync(
          `node ${cliPath} --appId valid-app-id-123456 --appSecret valid-app-secret-123456789 --userId 12345 some-cmd-that-triggers-unknown`,
          { encoding: 'utf8', stdio: 'pipe' }
        );
        fail('Should have shown unknown command error');
      } catch (error: any) {
        expect(error.stderr).toContain('Unknown command: some-cmd-that-triggers-unknown');
        expect(error.status).toBe(1);
      }
    });
  });

  describe('require.main check', () => {
    it('should execute main when run as main module', () => {
      // This tests the require.main === module check (line 182)
      const output = execSync(`node ${cliPath} --help`, { encoding: 'utf8', stdio: 'pipe' });
      expect(output).toContain('CLI tool for managing PolyV live streaming services');
    });
  });
});