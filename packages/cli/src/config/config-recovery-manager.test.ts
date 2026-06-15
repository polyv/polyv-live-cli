/**
 * Unit tests for ConfigRecoveryManager
 * Tests integrity checks, recovery strategies, and backup management
 */

import { ConfigRecoveryManager } from './config-recovery-manager';
import { ConfigVersionManager } from './config-version-manager';
import { FilePermissionManager } from './file-permission-manager';
import * as fs from 'fs';

// Mock dependencies
jest.mock('fs');
jest.mock('./config-version-manager');
jest.mock('./file-permission-manager');

const mockFs = fs as jest.Mocked<typeof fs>;
const MockConfigVersionManager = ConfigVersionManager as jest.MockedClass<typeof ConfigVersionManager>;
const MockFilePermissionManager = FilePermissionManager as jest.MockedClass<typeof FilePermissionManager>;

describe('ConfigRecoveryManager', () => {
  let manager: ConfigRecoveryManager;
  let mockVersionManager: jest.Mocked<ConfigVersionManager>;
  let mockPermissionManager: jest.Mocked<FilePermissionManager>;
  const testConfigPath = '/test/.polyv/accounts.json';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    mockVersionManager = new MockConfigVersionManager() as jest.Mocked<ConfigVersionManager>;
    mockPermissionManager = new MockFilePermissionManager() as jest.Mocked<FilePermissionManager>;
    
    manager = new ConfigRecoveryManager();
    
    // Replace the internal instances
    (manager as any).versionManager = mockVersionManager;
    (manager as any).permissionManager = mockPermissionManager;
  });

  describe('checkIntegrity', () => {
    it('should report file not found', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = manager.checkIntegrity(testConfigPath);

      expect(result.isValid).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('file_access');
      expect(result.issues[0].severity).toBe('critical');
      expect(result.issues[0].description).toContain('does not exist');
      expect(result.validationDetails.fileAccessible).toBe(false);
    });

    it('should report invalid JSON', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('invalid json {');

      const result = manager.checkIntegrity(testConfigPath);

      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.type === 'json_format')).toBe(true);
      expect(result.validationDetails.fileAccessible).toBe(true);
      expect(result.validationDetails.validJson).toBe(false);
    });

    it('should report invalid structure', () => {
      const invalidConfig = { invalid: 'structure' };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(invalidConfig));

      const result = manager.checkIntegrity(testConfigPath);

      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.type === 'structure')).toBe(true);
      expect(result.validationDetails.validJson).toBe(true);
      expect(result.validationDetails.validStructure).toBe(false);
    });

    it('should validate healthy configuration', () => {
      const validConfig = {
        version: '1.0',
        accounts: {
          test: {
            name: 'test',
            appId: 'testId',
            appSecret: {
              algorithm: 'aes-256-gcm',
              iv: 'testIv',
              authTag: 'testTag',
              encrypted: 'testData'
            },
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        },
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(validConfig));
      mockVersionManager.validateVersion.mockReturnValue({
        isValid: true,
        compatibility: 'compatible',
        requiredActions: []
      } as any);
      mockPermissionManager.validatePermissions.mockReturnValue({
        isValid: true,
        message: 'Secure',
        recommendations: []
      } as any);

      const result = manager.checkIntegrity(testConfigPath);

      expect(result.isValid).toBe(true);
      expect(result.message).toContain('healthy and valid');
      expect(result.issues).toHaveLength(0);
      expect(result.validationDetails.fileAccessible).toBe(true);
      expect(result.validationDetails.validJson).toBe(true);
      expect(result.validationDetails.validStructure).toBe(true);
      expect(result.validationDetails.validEncryption).toBe(true);
      expect(result.validationDetails.securePermissions).toBe(true);
    });

    it('should report permission warnings', () => {
      const validConfig = {
        version: '1.0',
        accounts: {},
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(validConfig));
      mockVersionManager.validateVersion.mockReturnValue({
        isValid: true,
        compatibility: 'compatible',
        requiredActions: []
      } as any);
      mockPermissionManager.validatePermissions.mockReturnValue({
        isValid: false,
        message: 'Insecure',
        recommendations: ['Fix permissions']
      } as any);

      const result = manager.checkIntegrity(testConfigPath);

      expect(result.isValid).toBe(true); // No critical issues
      expect(result.issues.some(i => i.type === 'permissions')).toBe(true);
      expect(result.issues.some(i => i.autoFixable)).toBe(true);
      expect(result.validationDetails.securePermissions).toBe(false);
    });

    it('should report version incompatibility', () => {
      const futureConfig = {
        version: '999.0',
        accounts: {},
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(futureConfig));
      mockVersionManager.validateVersion.mockReturnValue({
        isValid: false,
        compatibility: 'incompatible',
        detectedVersion: '999.0',
        requiredActions: []
      } as any);
      mockPermissionManager.validatePermissions.mockReturnValue({
        isValid: true,
        message: 'Secure',
        recommendations: []
      } as any);

      const result = manager.checkIntegrity(testConfigPath);

      expect(result.isValid).toBe(true); // Version issues are warnings, not critical
      expect(result.issues.some(i => i.type === 'version')).toBe(true);
      expect(result.issues.find(i => i.type === 'version')?.severity).toBe('warning');
    });

    it('should handle file read errors', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = manager.checkIntegrity(testConfigPath);

      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.type === 'file_access')).toBe(true);
      expect(result.issues.some(i => i.description.includes('Cannot read'))).toBe(true);
    });
  });

  describe('getRecoveryStrategies', () => {
    it('should provide auto-fix strategy for fixable issues', () => {
      const integrityResult = {
        isValid: true,
        message: 'Minor issues',
        issues: [{
          type: 'permissions' as const,
          severity: 'warning' as const,
          description: 'Insecure permissions',
          suggestedFix: 'Fix permissions',
          autoFixable: true
        }],
        validationDetails: {
          fileAccessible: true,
          validJson: true,
          validStructure: true,
          validEncryption: true,
          securePermissions: false
        }
      };

      const strategies = manager.getRecoveryStrategies(integrityResult);

      expect(strategies.some(s => s.id === 'auto_fix')).toBe(true);
      const autoFix = strategies.find(s => s.id === 'auto_fix');
      expect(autoFix?.riskLevel).toBe('low');
      expect(autoFix?.dataPreservation).toBe('full');
    });

    it('should always provide restore backup strategy', () => {
      const integrityResult = {
        isValid: false,
        message: 'Critical issues',
        issues: [],
        validationDetails: {
          fileAccessible: false,
          validJson: false,
          validStructure: false,
          validEncryption: false,
          securePermissions: false
        }
      };

      const strategies = manager.getRecoveryStrategies(integrityResult);

      expect(strategies.some(s => s.id === 'restore_backup')).toBe(true);
      const restoreBackup = strategies.find(s => s.id === 'restore_backup');
      expect(restoreBackup?.riskLevel).toBe('low');
      expect(restoreBackup?.dataPreservation).toBe('full');
    });

    it('should provide manual fix for accessible JSON files', () => {
      const integrityResult = {
        isValid: false,
        message: 'Structure issues',
        issues: [],
        validationDetails: {
          fileAccessible: true,
          validJson: true,
          validStructure: false,
          validEncryption: false,
          securePermissions: true
        }
      };

      const strategies = manager.getRecoveryStrategies(integrityResult);

      expect(strategies.some(s => s.id === 'manual_fix')).toBe(true);
      const manualFix = strategies.find(s => s.id === 'manual_fix');
      expect(manualFix?.riskLevel).toBe('medium');
      expect(manualFix?.dataPreservation).toBe('partial');
    });

    it('should always provide recreate strategy', () => {
      const integrityResult = {
        isValid: false,
        message: 'Critical issues',
        issues: [],
        validationDetails: {
          fileAccessible: false,
          validJson: false,
          validStructure: false,
          validEncryption: false,
          securePermissions: false
        }
      };

      const strategies = manager.getRecoveryStrategies(integrityResult);

      expect(strategies.some(s => s.id === 'recreate')).toBe(true);
      const recreate = strategies.find(s => s.id === 'recreate');
      expect(recreate?.riskLevel).toBe('high');
      expect(recreate?.dataPreservation).toBe('none');
    });

    it('should provide key recovery for encryption issues', () => {
      const integrityResult = {
        isValid: false,
        message: 'Encryption issues',
        issues: [{
          type: 'encryption' as const,
          severity: 'critical' as const,
          description: 'Encryption invalid',
          suggestedFix: 'Check key',
          autoFixable: false
        }],
        validationDetails: {
          fileAccessible: true,
          validJson: true,
          validStructure: true,
          validEncryption: false,
          securePermissions: true
        }
      };

      const strategies = manager.getRecoveryStrategies(integrityResult);

      expect(strategies.some(s => s.id === 'key_recovery')).toBe(true);
      const keyRecovery = strategies.find(s => s.id === 'key_recovery');
      expect(keyRecovery?.riskLevel).toBe('medium');
      expect(keyRecovery?.dataPreservation).toBe('full');
    });
  });

  describe('executeRecovery', () => {
    it('should execute auto_fix strategy', () => {
      mockPermissionManager.repairConfigurationFile.mockReturnValue({
        success: true,
        message: 'Fixed'
      } as any);

      const result = manager.executeRecovery('auto_fix', testConfigPath);

      expect(result.success).toBe(true);
      expect(result.strategyUsed).toBe('auto_fix');
      expect(result.stepsExecuted).toContain('Fixed file permissions');
      expect(mockPermissionManager.repairConfigurationFile).toHaveBeenCalledWith(testConfigPath);
    });

    it('should execute recreate strategy', () => {
      const newConfig = {
        version: '1.0',
        accounts: {},
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      };

      mockVersionManager.createNewConfiguration.mockReturnValue(newConfig as any);
      mockFs.existsSync
        .mockReturnValueOnce(true)  // Config file exists
        .mockReturnValueOnce(true); // Config dir exists
      mockFs.copyFileSync.mockImplementation(() => {});
      mockFs.writeFileSync.mockImplementation(() => {});
      mockPermissionManager.setSecurePermissions.mockReturnValue({
        success: true,
        message: 'Permissions set'
      } as any);

      const result = manager.executeRecovery('recreate', testConfigPath);

      expect(result.success).toBe(true);
      expect(result.strategyUsed).toBe('recreate');
      expect(result.recoveredConfig).toEqual(newConfig);
      expect(result.warnings).toContain('All previous account data has been lost');
      expect(mockVersionManager.createNewConfiguration).toHaveBeenCalled();
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        testConfigPath,
        JSON.stringify(newConfig, null, 2),
        'utf8'
      );
    });

    it('should handle unknown strategy', () => {
      const result = manager.executeRecovery('unknown_strategy', testConfigPath);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Unknown recovery strategy');
      expect(result.strategyUsed).toBe('unknown_strategy');
    });

    it('should handle recovery errors', () => {
      mockPermissionManager.repairConfigurationFile.mockImplementation(() => {
        throw new Error('Permission error');
      });

      const result = manager.executeRecovery('auto_fix', testConfigPath);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Recovery failed');
    });

    it('should execute restore_backup strategy with auto-discovery', () => {
      const backupPath = '/test/.polyv/accounts.json.backup.1234567890';
      
      // Mock findBackupFiles
      jest.spyOn(manager, 'findBackupFiles').mockReturnValue([{
        path: backupPath,
        createdAt: '2024-01-01T00:00:00.000Z',
        size: 1000,
        isValid: true
      }]);

      // Mock integrity check for backup
      jest.spyOn(manager, 'checkIntegrity')
        .mockReturnValueOnce({ isValid: true } as any); // backup integrity

      mockFs.existsSync.mockReturnValue(true);
      mockFs.copyFileSync.mockImplementation(() => {});
      mockPermissionManager.setSecurePermissions.mockReturnValue({
        success: true,
        message: 'Permissions set'
      } as any);

      const result = manager.executeRecovery('restore_backup', testConfigPath);

      expect(result.success).toBe(true);
      expect(result.strategyUsed).toBe('restore_backup');
      expect(result.stepsExecuted).toContain(`Found backup file: ${backupPath}`);
      expect(mockFs.copyFileSync).toHaveBeenCalledWith(backupPath, testConfigPath);
    });
  });

  describe('findBackupFiles', () => {
    it('should find and sort backup files', () => {
      const _configDir = '/test/.polyv';
      const files = [
        'accounts.json.backup.1000000000',
        'accounts.json.backup.2000000000',
        'accounts.json.backup.1500000000',
        'other-file.txt'
      ];

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(files as any);
      mockFs.statSync.mockImplementation((filePath) => {
        const filename = (filePath as string).split('/').pop();
        const timestamp = filename?.match(/\d+$/)?.[0] || '0';
        return {
          mtime: new Date(parseInt(timestamp)),
          size: 1000
        } as any;
      });

      // Mock integrity checks
      jest.spyOn(manager, 'checkIntegrity').mockReturnValue({
        isValid: true
      } as any);

      const backups = manager.findBackupFiles('/test/.polyv/accounts.json');

      expect(backups).toHaveLength(3);
      expect(backups[0].path).toContain('2000000000'); // Newest first
      expect(backups[1].path).toContain('1500000000');
      expect(backups[2].path).toContain('1000000000'); // Oldest last
      expect(backups.every(b => b.isValid)).toBe(true);
    });

    it('should handle directory not found', () => {
      mockFs.existsSync.mockReturnValue(false);

      const backups = manager.findBackupFiles('/nonexistent/.polyv/accounts.json');

      expect(backups).toHaveLength(0);
    });

    it('should handle read directory errors', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const backups = manager.findBackupFiles('/test/.polyv/accounts.json');

      expect(backups).toHaveLength(0);
    });
  });

  describe('createBackup', () => {
    it('should create backup successfully', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.copyFileSync.mockImplementation(() => {});
      mockPermissionManager.setSecurePermissions.mockReturnValue({
        success: true,
        message: 'Permissions set'
      } as any);

      const backupPath = manager.createBackup(testConfigPath);

      expect(backupPath).toContain('.backup.');
      expect(mockFs.copyFileSync).toHaveBeenCalled();
      expect(mockPermissionManager.setSecurePermissions).toHaveBeenCalledWith(backupPath);
    });

    it('should return null for non-existent file', () => {
      mockFs.existsSync.mockReturnValue(false);

      const backupPath = manager.createBackup(testConfigPath);

      expect(backupPath).toBeNull();
      expect(mockFs.copyFileSync).not.toHaveBeenCalled();
    });

    it('should handle backup errors', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.copyFileSync.mockImplementation(() => {
        throw new Error('Disk full');
      });

      const backupPath = manager.createBackup(testConfigPath);

      expect(backupPath).toBeNull();
    });
  });

  describe('getRecoveryGuidance', () => {
    it('should provide positive guidance for healthy config', () => {
      const healthyResult = {
        isValid: true,
        message: 'Healthy',
        issues: [],
        validationDetails: {
          fileAccessible: true,
          validJson: true,
          validStructure: true,
          validEncryption: true,
          securePermissions: true
        }
      };

      const guidance = manager.getRecoveryGuidance(healthyResult);

      expect(guidance[0]).toContain('✅');
      expect(guidance[0]).toContain('healthy');
    });

    it('should provide guidance for minor issues', () => {
      const minorIssueResult = {
        isValid: true,
        message: 'Minor issues',
        issues: [{
          type: 'permissions' as const,
          severity: 'warning' as const,
          description: 'Insecure permissions',
          suggestedFix: 'Fix permissions',
          autoFixable: true
        }],
        validationDetails: {
          fileAccessible: true,
          validJson: true,
          validStructure: true,
          validEncryption: true,
          securePermissions: false
        }
      };

      const guidance = manager.getRecoveryGuidance(minorIssueResult);

      expect(guidance[0]).toContain('✅');
      expect(guidance[1]).toContain('⚠️');
      expect(guidance.some(g => g.includes('Insecure permissions'))).toBe(true);
      expect(guidance.some(g => g.includes('Fix permissions'))).toBe(true);
    });

    it('should provide recovery guidance for critical issues', () => {
      const criticalResult = {
        isValid: false,
        message: 'Critical issues',
        issues: [
          {
            type: 'json_format' as const,
            severity: 'critical' as const,
            description: 'Invalid JSON',
            suggestedFix: 'Restore from backup',
            autoFixable: false
          },
          {
            type: 'permissions' as const,
            severity: 'warning' as const,
            description: 'Insecure permissions',
            suggestedFix: 'Fix permissions',
            autoFixable: true
          }
        ],
        validationDetails: {
          fileAccessible: true,
          validJson: false,
          validStructure: false,
          validEncryption: false,
          securePermissions: false
        }
      };

      const guidance = manager.getRecoveryGuidance(criticalResult);

      expect(guidance[0]).toContain('❌');
      expect(guidance.some(g => g.includes('🚨 Critical Issues'))).toBe(true);
      expect(guidance.some(g => g.includes('⚠️  Warnings'))).toBe(true);
      expect(guidance.some(g => g.includes('💡 Recovery Options'))).toBe(true);
      expect(guidance.some(g => g.includes('polyv-live-cli config recover --strategy auto_fix'))).toBe(true);
      expect(guidance.some(g => g.includes('backup your configuration'))).toBe(true);
    });
  });
});