/**
 * Unit tests for ConfigVersionManager
 * Tests version validation, migration, and compatibility checks
 */

import { ConfigVersionManager, CURRENT_VERSION, MINIMUM_SUPPORTED_VERSION } from './config-version-manager';

describe('ConfigVersionManager', () => {
  let manager: ConfigVersionManager;

  beforeEach(() => {
    manager = new ConfigVersionManager();
  });

  describe('version information', () => {
    it('should return current version', () => {
      expect(manager.getCurrentVersion()).toBe(CURRENT_VERSION);
    });

    it('should return supported versions', () => {
      const versions = manager.getSupportedVersions();
      expect(versions.length).toBeGreaterThan(0);
      expect(versions.map(v => v.version)).toContain(CURRENT_VERSION);
      expect(versions.map(v => v.version)).toContain(MINIMUM_SUPPORTED_VERSION);
    });

    it('should check if version is supported', () => {
      expect(manager.isVersionSupported('1.0')).toBe(true);
      expect(manager.isVersionSupported('0.9')).toBe(true);
      expect(manager.isVersionSupported('0.8')).toBe(true);
      expect(manager.isVersionSupported('999.0')).toBe(false);
      expect(manager.isVersionSupported('invalid')).toBe(false);
    });

    it('should get version info', () => {
      const info = manager.getVersionInfo('1.0');
      expect(info).toBeTruthy();
      expect(info!.version).toBe('1.0');
      expect(info!.description).toContain('AES-256-GCM');
      expect(info!.features).toContain('AES-256-GCM encryption for appSecret');

      expect(manager.getVersionInfo('invalid')).toBeNull();
    });
  });

  describe('version comparison', () => {
    it('should compare versions correctly', () => {
      expect(manager.compareVersions('1.0', '1.0')).toBe(0);
      expect(manager.compareVersions('1.0', '0.9')).toBe(1);
      expect(manager.compareVersions('0.9', '1.0')).toBe(-1);
      expect(manager.compareVersions('1.1', '1.0')).toBe(1);
      expect(manager.compareVersions('1.0', '1.1')).toBe(-1);
      expect(manager.compareVersions('2.0', '1.9')).toBe(1);
    });

    it('should handle different version formats', () => {
      expect(manager.compareVersions('1', '1.0')).toBe(0);
      expect(manager.compareVersions('1.0', '1')).toBe(0);
      expect(manager.compareVersions('1.0.0', '1.0')).toBe(0);
    });
  });

  describe('version detection', () => {
    it('should detect explicit version', () => {
      const config = {
        version: '1.0',
        accounts: {},
        metadata: {}
      };
      expect(manager.detectVersion(config)).toBe('1.0');
    });

    it('should detect v1.0 from structure (GCM encryption)', () => {
      const config = {
        accounts: {
          test: {
            name: 'test',
            appId: 'testId',
            appSecret: {
              algorithm: 'aes-256-gcm',
              iv: 'base64iv',
              authTag: 'base64tag',
              encrypted: 'base64data'
            }
          }
        },
        metadata: {}
      };
      expect(manager.detectVersion(config)).toBe('1.0');
    });

    it('should detect v0.9 from structure (base64 encoded)', () => {
      const legacyEncrypted = Buffer.from(JSON.stringify({
        data: 'encrypted',
        meta: { algorithm: 'aes-256-cbc' }
      })).toString('base64');

      const config = {
        accounts: {
          test: {
            name: 'test',
            appId: 'testId',
            appSecret: legacyEncrypted
          }
        },
        metadata: {}
      };
      expect(manager.detectVersion(config)).toBe('0.9');
    });

    it('should detect v0.8 from structure (plain text)', () => {
      const config = {
        accounts: {
          test: {
            name: 'test',
            appId: 'testId',
            appSecret: 'plain-text-secret'
          }
        },
        metadata: {}
      };
      expect(manager.detectVersion(config)).toBe('0.8');
    });

    it('should handle invalid config', () => {
      expect(() => manager.detectVersion(null)).toThrow('Invalid configuration object');
      expect(() => manager.detectVersion('string')).toThrow('Invalid configuration object');
      expect(() => manager.detectVersion(123)).toThrow('Invalid configuration object');
    });

    it('should fallback to minimum version for unknown structure', () => {
      const config = { unknown: 'structure' };
      expect(manager.detectVersion(config)).toBe(MINIMUM_SUPPORTED_VERSION);
    });
  });

  describe('version validation', () => {
    it('should validate current version as compatible', () => {
      const config = {
        version: '1.0',
        accounts: {},
        metadata: {}
      };

      const result = manager.validateVersion(config);
      expect(result.isValid).toBe(true);
      expect(result.compatibility).toBe('compatible');
      expect(result.detectedVersion).toBe('1.0');
      expect(result.requiredActions).toHaveLength(0);
    });

    it('should validate older version as upgradeable', () => {
      const config = {
        version: '0.9',
        accounts: {},
        metadata: {}
      };

      const result = manager.validateVersion(config);
      expect(result.isValid).toBe(true);
      expect(result.compatibility).toBe('upgradeable');
      expect(result.detectedVersion).toBe('0.9');
      expect(result.requiredActions).toContain('Run: polyv-live-cli config migrate --from 0.9 --to 1.0');
    });

    it('should validate newer version as incompatible', () => {
      const config = {
        version: '999.0',
        accounts: {},
        metadata: {}
      };

      const result = manager.validateVersion(config);
      expect(result.isValid).toBe(false);
      expect(result.compatibility).toBe('incompatible');
      expect(result.requiredActions.length).toBeGreaterThan(0);
    });

    it('should handle validation errors', () => {
      const result = manager.validateVersion(null);
      expect(result.isValid).toBe(false);
      expect(result.compatibility).toBe('incompatible');
      expect(result.message).toContain('Failed to validate version');
    });
  });

  describe('configuration migration', () => {
    it('should handle same version migration', () => {
      const config = { version: '1.0', accounts: {}, metadata: {} };
      const result = manager.migrateConfiguration(config, '1.0', '1.0');

      expect(result.success).toBe(true);
      expect(result.message).toContain('No migration needed');
      expect(result.steps).toContain('No migration required');
      expect(result.migratedConfig).toEqual(config);
    });

    it('should migrate from 0.8 to 0.9', () => {
      const config = {
        version: '0.8',
        accounts: {
          test: {
            name: 'test',
            appId: 'testId',
            appSecret: 'plain-secret'
          }
        }
      };

      const result = manager.migrateConfiguration(config, '0.8', '0.9');

      expect(result.success).toBe(true);
      expect(result.fromVersion).toBe('0.8');
      expect(result.toVersion).toBe('0.9');
      expect(result.steps).toContain('Migrated from v0.8 to v0.9: Added basic encryption');
      expect(result.warnings).toContain('App secrets have been encrypted using basic encryption');
      expect(result.migratedConfig!.version).toBe('0.9');
      expect((result.migratedConfig as any).accounts.test._needsEncryption).toBe(true);
    });

    it('should migrate from 0.9 to 1.0', () => {
      const config = {
        version: '0.9',
        accounts: {
          test: {
            name: 'test',
            appId: 'testId',
            appSecret: 'encrypted-secret'
          }
        }
      };

      const result = manager.migrateConfiguration(config, '0.9', '1.0');

      expect(result.success).toBe(true);
      expect(result.fromVersion).toBe('0.9');
      expect(result.toVersion).toBe('1.0');
      expect(result.steps).toContain('Migrated from v0.9 to v1.0: Upgraded to AES-256-GCM encryption');
      expect(result.warnings).toContain('Encryption has been upgraded to AES-256-GCM for better security');
      expect(result.migratedConfig!.version).toBe('1.0');
      expect(result.migratedConfig!.metadata).toBeDefined();
      expect((result.migratedConfig as any).accounts.test._needsReencryption).toBe(true);
    });

    it('should migrate from 0.8 to 1.0 (multi-step)', () => {
      const config = {
        version: '0.8',
        accounts: {
          test: {
            name: 'test',
            appId: 'testId',
            appSecret: 'plain-secret'
          }
        }
      };

      const result = manager.migrateConfiguration(config, '0.8', '1.0');

      expect(result.success).toBe(true);
      expect(result.steps.length).toBeGreaterThanOrEqual(3); // 0.8->0.9, 0.9->1.0, set version
      expect(result.steps).toContain('Migrated from v0.8 to v0.9: Added basic encryption');
      expect(result.steps).toContain('Migrated from v0.9 to v1.0: Upgraded to AES-256-GCM encryption');
      expect(result.migratedConfig!.version).toBe('1.0');
    });

    it('should handle unsupported source version', () => {
      const result = manager.migrateConfiguration({}, 'invalid', '1.0');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Source version invalid is not supported');
    });

    it('should handle unsupported target version', () => {
      const result = manager.migrateConfiguration({}, '1.0', 'invalid');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Target version invalid is not supported');
    });

    it('should handle migration errors', () => {
      // Mock a scenario that would cause migration to fail
      const circularConfig: any = { version: '0.8' };
      circularConfig.self = circularConfig; // Create circular reference

      const result = manager.migrateConfiguration(circularConfig, '0.8', '1.0');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Migration failed');
    });
  });

  describe('migration utilities', () => {
    it('should get migration path', () => {
      expect(manager.getMigrationPath('1.0', '1.0')).toEqual([]);
      
      const path08to09 = manager.getMigrationPath('0.8', '0.9');
      expect(path08to09).toContain('0.8 → 0.9: Encrypt plain text secrets');

      const path09to10 = manager.getMigrationPath('0.9', '1.0');
      expect(path09to10).toContain('0.9 → 1.0: Upgrade to AES-256-GCM encryption');

      const path08to10 = manager.getMigrationPath('0.8', '1.0');
      expect(path08to10).toHaveLength(2);
      expect(path08to10).toContain('0.8 → 0.9: Encrypt plain text secrets');
      expect(path08to10).toContain('0.9 → 1.0: Upgrade to AES-256-GCM encryption');
    });

    it('should create new configuration', () => {
      const config = manager.createNewConfiguration();
      expect(config.version).toBe(CURRENT_VERSION);
      expect(config.accounts).toEqual({});
      expect(config.metadata).toBeDefined();
      expect(config.metadata.createdAt).toBeDefined();
      expect(config.metadata.updatedAt).toBeDefined();
    });

    it('should check if migration is required', () => {
      const currentConfig = { version: '1.0', accounts: {}, metadata: {} };
      expect(manager.isMigrationRequired(currentConfig)).toBe(false);

      const oldConfig = { version: '0.9', accounts: {}, metadata: {} };
      expect(manager.isMigrationRequired(oldConfig)).toBe(true);

      const invalidConfig = null;
      expect(manager.isMigrationRequired(invalidConfig)).toBe(false);
    });

    it('should get breaking changes', () => {
      // No breaking changes in current versions
      expect(manager.getBreakingChanges('0.8', '1.0')).toEqual([]);
      expect(manager.getBreakingChanges('1.0', '1.0')).toEqual([]);
      expect(manager.getBreakingChanges('1.0', '0.8')).toEqual([]); // Downgrade
      expect(manager.getBreakingChanges('invalid', '1.0')).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty configuration', () => {
      const config = {};
      expect(manager.detectVersion(config)).toBe(MINIMUM_SUPPORTED_VERSION);
      
      const validation = manager.validateVersion(config);
      expect(validation.isValid).toBe(true);
      expect(validation.compatibility).toBe('upgradeable');
    });

    it('should handle configuration with null accounts', () => {
      const config = { accounts: null, metadata: {} };
      expect(manager.detectVersion(config)).toBe(MINIMUM_SUPPORTED_VERSION);
    });

    it('should handle configuration with empty accounts', () => {
      const config = { accounts: {}, metadata: {} };
      expect(manager.detectVersion(config)).toBe(MINIMUM_SUPPORTED_VERSION);
    });

    it('should preserve unknown fields during migration', () => {
      const config = {
        version: '0.9',
        accounts: {},
        metadata: {},
        customField: 'custom-value',
        nested: { field: 'value' }
      };

      const result = manager.migrateConfiguration(config, '0.9', '1.0');
      expect(result.success).toBe(true);
      expect((result.migratedConfig as any).customField).toBe('custom-value');
      expect((result.migratedConfig as any).nested.field).toBe('value');
    });
  });
});