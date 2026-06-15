import { execSync } from 'child_process';
import { join } from 'path';
import { tmpdir } from 'os';
import { mkdirSync, rmSync, existsSync } from 'fs';

describe('CLI Integration Tests', () => {
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

  describe('Help Command', () => {
    it('should display help when --help flag is used', () => {
      try {
        const output = execSync(`node ${cliPath} --help`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
        
        expect(output).toContain('CLI tool for managing PolyV live streaming services');
        expect(output).toContain('Usage: polyv-live-cli [options] [command]');
        expect(output).toContain('--appId <id>');
        expect(output).toContain('--appSecret <secret>');
        expect(output).toContain('--userId <id>');
        expect(output).toContain('-h, --help');
        expect(output).toContain('-v, --version');
      } catch (error: any) {
        // Commander.js might exit with 0 for help, and output might be in stdout/stderr
        const output = error.stdout || error.stderr || '';
        if (error.status === 0 || output.includes('CLI tool for managing PolyV live streaming services')) {
          expect(output).toContain('CLI tool for managing PolyV live streaming services');
          expect(output).toContain('Usage: polyv-live-cli [options] [command]');
          expect(output).toContain('--appId <id>');
          expect(output).toContain('--appSecret <secret>');
          expect(output).toContain('--userId <id>');
          expect(output).toContain('-h, --help');
          expect(output).toContain('-v, --version');
        } else {
          throw error;
        }
      }
    });

    it('should display help when -h flag is used', () => {
      try {
        const output = execSync(`node ${cliPath} -h`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
        
        expect(output).toContain('CLI tool for managing PolyV live streaming services');
        expect(output).toContain('Usage: polyv-live-cli [options] [command]');
      } catch (error: any) {
        const output = error.stdout || error.stderr || '';
        if (error.status === 0 || output.includes('CLI tool for managing PolyV live streaming services')) {
          expect(output).toContain('CLI tool for managing PolyV live streaming services');
          expect(output).toContain('Usage: polyv-live-cli [options] [command]');
        } else {
          throw error;
        }
      }
    });

    it('should display help when no arguments are provided', () => {
      try {
        const output = execSync(`node ${cliPath}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
        
        expect(output).toContain('CLI tool for managing PolyV live streaming services');
        expect(output).toContain('Usage: polyv-live-cli [options] [command]');
      } catch (error: any) {
        const output = error.stdout || error.stderr || '';
        if (error.status === 0 || output.includes('CLI tool for managing PolyV live streaming services')) {
          expect(output).toContain('CLI tool for managing PolyV live streaming services');
          expect(output).toContain('Usage: polyv-live-cli [options] [command]');
        } else {
          throw error;
        }
      }
    });
  });

  describe('Version Command', () => {
    it('should display version when --version flag is used', () => {
      const output = execSync(`node ${cliPath} --version`, { encoding: 'utf8' });
      
      expect(output.trim()).toMatch(/^\d+\.\d+\.\d+$/); // Semantic version format
    });

    it('should display version when -v flag is used', () => {
      const output = execSync(`node ${cliPath} -v`, { encoding: 'utf8' });
      
      expect(output.trim()).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('Error Handling', () => {
    it('should require authentication before showing unknown command error', () => {
      const tempDir = join(tmpdir(), 'polyv-test-cli-' + Date.now());
      try {
        mkdirSync(tempDir, { recursive: true });
        
        const env = {
          PATH: process.env['PATH'],
          NODE_ENV: 'test',
          HOME: tempDir, // Use temp directory to isolate from user's account config
          POLYV_APP_ID: '',
          POLYV_APP_SECRET: '',
          POLYV_USER_ID: ''
        };
        
        execSync(`node ${cliPath} unknown-command`, { 
          encoding: 'utf8', 
          stdio: 'pipe',
          env
        });
        fail('Should have thrown an error for missing authentication');
      } catch (error: any) {
        expect(error.stderr).toContain('Auth configuration is incomplete');
        expect(error.status).toBe(1);
      } finally {
        if (existsSync(tempDir)) {
          rmSync(tempDir, { recursive: true, force: true });
        }
      }
    });

    it('should handle unknown commands gracefully with authentication', () => {
      try {
        execSync(`node ${cliPath} --appId valid-app-id-123456 --appSecret valid-app-secret-123456789 unknown-command`, { encoding: 'utf8', stdio: 'pipe' });
        fail('Should have thrown an error for unknown command');
      } catch (error: any) {
        expect(error.stderr).toContain('Unknown command: unknown-command');
        expect(error.stderr).toContain('Run --help to see available commands');
        expect(error.status).toBe(1);
      }
    });

    it('should handle invalid options gracefully', () => {
      try {
        execSync(`node ${cliPath} --invalid-option`, { encoding: 'utf8', stdio: 'pipe' });
        fail('Should have thrown an error for invalid option');
      } catch (error: any) {
        // Commander.js handles unknown options
        expect(error.status).toBe(1);
      }
    });
  });

  describe('Global Options', () => {
    it('should show authentication error for partial appId', () => {
      try {
        execSync(`node ${cliPath} --appId valid-app-id-123456`, { encoding: 'utf8', stdio: 'pipe' });
        fail('Should have thrown an error for incomplete authentication');
      } catch (error: any) {
        expect(error.status).toBe(1);
        const errorOutput = error.stderr || error.stdout || '';
        expect(errorOutput).toContain('Auth configuration is incomplete');
      }
    });

    it('should show authentication error for partial appSecret', () => {
      try {
        execSync(`node ${cliPath} --appSecret valid-app-secret-123456789`, { encoding: 'utf8', stdio: 'pipe' });
        fail('Should have thrown an error for incomplete authentication');
      } catch (error: any) {
        expect(error.status).toBe(1);
        const errorOutput = error.stderr || error.stdout || '';
        expect(errorOutput).toContain('Auth configuration is incomplete');
      }
    });

    it('should show authentication error for only userId', () => {
      const tempDir = join(tmpdir(), 'polyv-test-cli-userid-' + Date.now());
      try {
        mkdirSync(tempDir, { recursive: true });
        
        const env = {
          PATH: process.env['PATH'],
          NODE_ENV: 'test',
          HOME: tempDir, // Use temp directory to isolate from user's account config
          POLYV_APP_ID: '',
          POLYV_APP_SECRET: '',
          POLYV_USER_ID: ''
        };
        
        execSync(`node ${cliPath} --userId 12345`, { 
          encoding: 'utf8', 
          stdio: 'pipe',
          env
        });
        fail('Should have thrown an error for incomplete authentication');
      } catch (error: any) {
        expect(error.status).toBe(1);
        const errorOutput = error.stderr || error.stdout || '';
        expect(errorOutput).toContain('Auth configuration is incomplete');
      } finally {
        if (existsSync(tempDir)) {
          rmSync(tempDir, { recursive: true, force: true });
        }
      }
    });

    it('should accept multiple global options and show help', () => {
      try {
        const output = execSync(`node ${cliPath} --appId valid-app-id-123456 --appSecret valid-app-secret-123456789 --userId 12345`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
        
        expect(output).toContain('CLI tool for managing PolyV live streaming services');
        expect(output).toContain('Usage: polyv-live-cli [options] [command]');
      } catch (error: any) {
        const output = error.stdout || error.stderr || '';
        if (error.status === 0 || output.includes('CLI tool for managing PolyV live streaming services')) {
          expect(output).toContain('CLI tool for managing PolyV live streaming services');
          expect(output).toContain('Usage: polyv-live-cli [options] [command]');
        } else {
          throw error;
        }
      }
    });
  });
});