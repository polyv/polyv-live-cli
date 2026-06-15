/**
 * Unit tests for FilePermissionManager
 * Tests permission validation, repair, and cross-platform behavior
 */

import { FilePermissionManager } from './file-permission-manager';
import * as fs from 'fs';
import * as os from 'os';

// Mock fs module for testing
jest.mock('fs');
jest.mock('os');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockOs = os as jest.Mocked<typeof os>;

describe('FilePermissionManager', () => {
  let manager: FilePermissionManager;
  const testFilePath = '/test/config/accounts.json';
  const testDirPath = '/test/config';

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new FilePermissionManager();
  });

  describe('constructor', () => {
    it('should initialize on Unix platform', () => {
      mockOs.platform.mockReturnValue('linux');
      const unixManager = new FilePermissionManager();
      expect(unixManager).toBeInstanceOf(FilePermissionManager);
    });

    it('should initialize on Windows platform', () => {
      mockOs.platform.mockReturnValue('win32');
      const windowsManager = new FilePermissionManager();
      expect(windowsManager).toBeInstanceOf(FilePermissionManager);
    });
  });

  describe('getPermissionInfo - Unix platforms', () => {
    beforeEach(() => {
      mockOs.platform.mockReturnValue('linux');
      manager = new FilePermissionManager();
    });

    it('should get permission info for secure file (600)', () => {
      const mockStats = {
        mode: 0o100600, // Regular file with 600 permissions
        isDirectory: () => false
      };
      mockFs.statSync.mockReturnValue(mockStats as any);

      const info = manager.getPermissionInfo(testFilePath);

      expect(info).toEqual({
        path: testFilePath,
        mode: 0o600,
        isSecure: true,
        description: 'Owner: rw-, Group: ---, Others: --- (600)',
        warnings: []
      });
    });

    it('should get permission info for insecure file (644)', () => {
      const mockStats = {
        mode: 0o100644, // Regular file with 644 permissions
        isDirectory: () => false
      };
      mockFs.statSync.mockReturnValue(mockStats as any);

      const info = manager.getPermissionInfo(testFilePath);

      expect(info).toEqual({
        path: testFilePath,
        mode: 0o644,
        isSecure: false,
        description: 'Owner: rw-, Group: r--, Others: r-- (644)',
        warnings: [
          'Group has access permissions - configuration file should be accessible only by owner',
          'Others have access permissions - configuration file should be accessible only by owner',
          'SECURITY RISK: Configuration file is world-readable'
        ]
      });
    });

    it('should get permission info for directory (700)', () => {
      const mockStats = {
        mode: 0o040700, // Directory with 700 permissions
        isDirectory: () => true
      };
      mockFs.statSync.mockReturnValue(mockStats as any);

      const info = manager.getPermissionInfo(testDirPath);

      expect(info).toEqual({
        path: testDirPath,
        mode: 0o700,
        isSecure: true,
        description: 'Owner: rwx, Group: ---, Others: --- (700)',
        warnings: []
      });
    });

    it('should handle world-writable file (666)', () => {
      const mockStats = {
        mode: 0o100666, // Regular file with 666 permissions
        isDirectory: () => false
      };
      mockFs.statSync.mockReturnValue(mockStats as any);

      const info = manager.getPermissionInfo(testFilePath);

      expect(info.warnings).toContain('CRITICAL SECURITY RISK: Configuration file is world-writable');
      expect(info.warnings).toContain('SECURITY RISK: Configuration file is world-readable');
      expect(info.isSecure).toBe(false);
    });

    it('should throw error for non-existent file', () => {
      mockFs.statSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      expect(() => manager.getPermissionInfo(testFilePath)).toThrow('Failed to get permission info');
    });
  });

  describe('getPermissionInfo - Windows platform', () => {
    beforeEach(() => {
      mockOs.platform.mockReturnValue('win32');
      manager = new FilePermissionManager();
    });

    it('should handle Windows permissions', () => {
      const mockStats = {
        mode: 0o100666, // On Windows, mode may not be meaningful
        isDirectory: () => false
      };
      mockFs.statSync.mockReturnValue(mockStats as any);

      const info = manager.getPermissionInfo(testFilePath);

      expect(info.isSecure).toBe(true); // Windows is always considered secure
      expect(info.description).toBe('Windows NTFS permissions (managed by system)');
      expect(info.warnings).toEqual([]);
    });
  });

  describe('validatePermissions', () => {
    beforeEach(() => {
      mockOs.platform.mockReturnValue('linux');
      manager = new FilePermissionManager();
    });

    it('should validate non-existent file', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = manager.validatePermissions(testFilePath);

      expect(result).toEqual({
        isValid: false,
        message: 'File does not exist: ' + testFilePath,
        recommendations: ['Create the configuration file first']
      });
    });

    it('should validate secure file', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({
        mode: 0o100600,
        isDirectory: () => false
      } as any);

      const result = manager.validatePermissions(testFilePath);

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('File permissions are secure');
      expect(result.recommendations).toEqual([]);
    });

    it('should validate insecure file', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({
        mode: 0o100644,
        isDirectory: () => false
      } as any);

      const result = manager.validatePermissions(testFilePath);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('File permissions are not secure');
      expect(result.recommendations).toContain('Run: chmod 600 ' + testFilePath);
      expect(result.recommendations).toContain('Or use: polyv-live-cli config fix-permissions');
    });

    it('should handle validation errors', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = manager.validatePermissions(testFilePath);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Failed to validate permissions');
      expect(result.recommendations).toContain('Check if file exists and is accessible');
    });
  });

  describe('setSecurePermissions', () => {
    beforeEach(() => {
      mockOs.platform.mockReturnValue('linux');
      manager = new FilePermissionManager();
    });

    it('should set secure permissions on file', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync
        .mockReturnValueOnce({ mode: 0o100644, isDirectory: () => false } as any) // Before
        .mockReturnValueOnce({ mode: 0o100600, isDirectory: () => false } as any); // After
      mockFs.chmodSync.mockImplementation(() => {});

      const result = manager.setSecurePermissions(testFilePath, false);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Successfully set secure permissions (600)');
      expect(mockFs.chmodSync).toHaveBeenCalledWith(testFilePath, 0o600);
    });

    it('should set secure permissions on directory', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync
        .mockReturnValueOnce({ mode: 0o040755, isDirectory: () => true } as any) // Before
        .mockReturnValueOnce({ mode: 0o040700, isDirectory: () => true } as any); // After
      mockFs.chmodSync.mockImplementation(() => {});

      const result = manager.setSecurePermissions(testDirPath, true);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Successfully set secure permissions (700)');
      expect(mockFs.chmodSync).toHaveBeenCalledWith(testDirPath, 0o700);
    });

    it('should handle non-existent file', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = manager.setSecurePermissions(testFilePath, false);

      expect(result.success).toBe(false);
      expect(result.message).toContain('File does not exist');
    });

    it('should handle chmod errors', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({ mode: 0o100644, isDirectory: () => false } as any);
      mockFs.chmodSync.mockImplementation(() => {
        throw new Error('Operation not permitted');
      });

      const result = manager.setSecurePermissions(testFilePath, false);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to set secure permissions');
    });
  });

  describe('setSecurePermissions - Windows', () => {
    beforeEach(() => {
      mockOs.platform.mockReturnValue('win32');
      manager = new FilePermissionManager();
    });

    it('should handle Windows permissions gracefully', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({ mode: 0o100666, isDirectory: () => false } as any);

      const result = manager.setSecurePermissions(testFilePath, false);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Windows NTFS permissions are managed by the system');
      expect(mockFs.chmodSync).not.toHaveBeenCalled();
    });
  });

  describe('ensureSecureDirectory', () => {
    beforeEach(() => {
      mockOs.platform.mockReturnValue('linux');
      manager = new FilePermissionManager();
    });

    it('should create directory if not exists', () => {
      mockFs.existsSync
        .mockReturnValueOnce(false) // Directory doesn't exist
        .mockReturnValueOnce(true)  // Parent exists
        .mockReturnValueOnce(true); // After creation
      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.statSync.mockReturnValue({ mode: 0o040700, isDirectory: () => true } as any);
      mockFs.chmodSync.mockImplementation(() => {});

      const result = manager.ensureSecureDirectory(testDirPath);

      expect(result.success).toBe(true);
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(testDirPath, { mode: 0o700 });
    });

    it('should create parent directories recursively', () => {
      const deepPath = '/test/config/subdir';
      mockFs.existsSync
        .mockReturnValueOnce(false) // Deep directory doesn't exist
        .mockReturnValueOnce(false) // Parent doesn't exist
        .mockReturnValueOnce(true); // After creation
      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.statSync.mockReturnValue({ mode: 0o040700, isDirectory: () => true } as any);
      mockFs.chmodSync.mockImplementation(() => {});

      const result = manager.ensureSecureDirectory(deepPath);

      expect(result.success).toBe(true);
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/test/config', { recursive: true, mode: 0o700 });
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(deepPath, { mode: 0o700 });
    });

    it('should handle existing directory', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync
        .mockReturnValueOnce({ mode: 0o040755, isDirectory: () => true } as any) // Before
        .mockReturnValueOnce({ mode: 0o040700, isDirectory: () => true } as any); // After
      mockFs.chmodSync.mockImplementation(() => {});

      const result = manager.ensureSecureDirectory(testDirPath);

      expect(result.success).toBe(true);
      expect(mockFs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('repairConfigurationFile', () => {
    beforeEach(() => {
      mockOs.platform.mockReturnValue('linux');
      manager = new FilePermissionManager();
    });

    it('should repair existing configuration file', () => {
      mockFs.existsSync
        .mockReturnValueOnce(true) // Parent directory exists
        .mockReturnValueOnce(true); // Config file exists
      mockFs.statSync
        .mockReturnValueOnce({ mode: 0o040700, isDirectory: () => true } as any) // Directory
        .mockReturnValueOnce({ mode: 0o100644, isDirectory: () => false } as any) // Before file
        .mockReturnValueOnce({ mode: 0o100600, isDirectory: () => false } as any); // After file
      mockFs.chmodSync.mockImplementation(() => {});

      const result = manager.repairConfigurationFile(testFilePath);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Successfully set secure permissions');
    });

    it('should handle non-existent configuration file', () => {
      // Mock ensureSecureDirectory to succeed
      jest.spyOn(manager, 'ensureSecureDirectory').mockReturnValue({
        success: true,
        message: 'Directory secured'
      } as any);
      
      mockFs.existsSync.mockReturnValue(false); // Config file doesn't exist

      const result = manager.repairConfigurationFile(testFilePath);

      expect(result.success).toBe(true);
      expect(result.message).toContain('will be created with secure permissions');
    });
  });

  describe('detectPotentialTampering', () => {
    beforeEach(() => {
      mockOs.platform.mockReturnValue('linux');
      manager = new FilePermissionManager();
    });

    it('should detect no tampering for secure file', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({ mode: 0o100600, isDirectory: () => false } as any);

      const result = manager.detectPotentialTampering(testFilePath);

      expect(result.isTampered).toBe(false);
      expect(result.reasons).toEqual([]);
      expect(result.recommendations).toEqual([]);
    });

    it('should detect tampering for world-writable file', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({ mode: 0o100666, isDirectory: () => false } as any);

      const result = manager.detectPotentialTampering(testFilePath);

      expect(result.isTampered).toBe(true);
      expect(result.reasons).toContain('File is world-writable - possible tampering risk');
      expect(result.recommendations).toContain('Immediately secure the file with: chmod 600 ' + testFilePath);
    });

    it('should detect tampering for group-writable file', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({ mode: 0o100620, isDirectory: () => false } as any);

      const result = manager.detectPotentialTampering(testFilePath);

      expect(result.isTampered).toBe(true);
      expect(result.reasons).toContain('File is group-writable - possible unauthorized access');
      expect(result.recommendations).toContain('Remove group write access');
    });

    it('should handle non-existent file', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = manager.detectPotentialTampering(testFilePath);

      expect(result.isTampered).toBe(false);
      expect(result.reasons).toEqual(['File does not exist']);
      expect(result.recommendations).toEqual(['Create configuration file if needed']);
    });
  });

  describe('getSecurityRecommendations', () => {
    it('should provide Unix-specific recommendations', () => {
      mockOs.platform.mockReturnValue('linux');
      const unixManager = new FilePermissionManager();

      const recommendations = unixManager.getSecurityRecommendations();

      expect(recommendations).toContain('Ensure configuration file permissions are set to 600 (owner read/write only)');
      expect(recommendations).toContain('Configuration directory permissions should be 700 (owner access only)');
      expect(recommendations).toContain('Use "ls -la" to check file permissions');
    });

    it('should provide Windows-specific recommendations', () => {
      mockOs.platform.mockReturnValue('win32');
      const windowsManager = new FilePermissionManager();

      const recommendations = windowsManager.getSecurityRecommendations();

      expect(recommendations).toContain('On Windows, ensure only your user account has access to the configuration file');
      expect(recommendations).toContain('Use Windows file properties to review and manage access permissions');
      expect(recommendations).toContain('Consider using Windows folder encryption for additional security');
    });

    it('should include common recommendations', () => {
      const recommendations = manager.getSecurityRecommendations();

      expect(recommendations).toContain('Keep your configuration file in a secure location');
      expect(recommendations).toContain('Regularly backup your configuration file');
      expect(recommendations).toContain('Use the POLYV_MASTER_KEY environment variable for additional security');
    });
  });
});