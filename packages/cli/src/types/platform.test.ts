/**
 * @fileoverview Tests for platform types
 * @author Development Team
 * @since 13.1.0
 */

import {
  PlatformGetOptions,
  PlatformSwitchGetOptions,
  PlatformSwitchUpdateOptions,
  PlatformServiceConfig,
} from './platform';

describe('Platform Types', () => {
  // ========================================
  // TYP-001: PlatformGetOptions interface
  // ========================================
  describe('PlatformGetOptions', () => {
    it('[P1][TYP-001] should accept valid options', () => {
      const options: PlatformGetOptions = {
        output: 'table',
      };
      expect(options.output).toBe('table');
    });

    it('[P1] should accept json output format', () => {
      const options: PlatformGetOptions = {
        output: 'json',
      };
      expect(options.output).toBe('json');
    });

    it('[P1] should allow optional output field', () => {
      const options: PlatformGetOptions = {};
      expect(options.output).toBeUndefined();
    });
  });

  // ========================================
  // TYP-002: PlatformSwitchGetOptions interface
  // ========================================
  describe('PlatformSwitchGetOptions', () => {
    it('[P1][TYP-002] should accept valid options', () => {
      const options: PlatformSwitchGetOptions = {
        output: 'table',
      };
      expect(options.output).toBe('table');
    });

    it('[P1] should accept json output format', () => {
      const options: PlatformSwitchGetOptions = {
        output: 'json',
      };
      expect(options.output).toBe('json');
    });

    it('[P1] should allow optional output field', () => {
      const options: PlatformSwitchGetOptions = {};
      expect(options.output).toBeUndefined();
    });
  });

  // ========================================
  // TYP-003: PlatformSwitchUpdateOptions interface
  // ========================================
  describe('PlatformSwitchUpdateOptions', () => {
    it('[P1][TYP-003] should accept valid options', () => {
      const options: PlatformSwitchUpdateOptions = {
        param: 'authEnabled',
        enabled: 'Y',
        output: 'table',
      };
      expect(options.param).toBe('authEnabled');
      expect(options.enabled).toBe('Y');
      expect(options.output).toBe('table');
    });

    it('[P1] should accept N as enabled value', () => {
      const options: PlatformSwitchUpdateOptions = {
        param: 'recordEnabled',
        enabled: 'N',
        output: 'json',
      };
      expect(options.enabled).toBe('N');
    });

    it('[P1] should allow optional output field', () => {
      const options: PlatformSwitchUpdateOptions = {
        param: 'authEnabled',
        enabled: 'Y',
      };
      expect(options.output).toBeUndefined();
    });

    it('[P1] should accept all valid param values', () => {
      const validParams = [
        'globalSettingEnabled',
        'authEnabled',
        'recordEnabled',
        'playbackEnabled',
        'danmuEnabled',
      ];

      validParams.forEach((param) => {
        const options: PlatformSwitchUpdateOptions = {
          param,
          enabled: 'Y',
        };
        expect(options.param).toBe(param);
      });
    });
  });

  // ========================================
  // TYP-004: PlatformServiceConfig interface
  // ========================================
  describe('PlatformServiceConfig', () => {
    it('[P1][TYP-004] should accept valid config', () => {
      const config: PlatformServiceConfig = {
        baseUrl: 'https://api.polyv.net',
        timeout: 30000,
        debug: false,
      };
      expect(config.baseUrl).toBe('https://api.polyv.net');
      expect(config.timeout).toBe(30000);
      expect(config.debug).toBe(false);
    });

    it('[P1] should allow optional timeout field', () => {
      const config: PlatformServiceConfig = {
        baseUrl: 'https://api.polyv.net',
      };
      expect(config.timeout).toBeUndefined();
    });

    it('[P1] should allow optional debug field', () => {
      const config: PlatformServiceConfig = {
        baseUrl: 'https://api.polyv.net',
        timeout: 30000,
      };
      expect(config.debug).toBeUndefined();
    });

    it('[P1] should accept debug as true', () => {
      const config: PlatformServiceConfig = {
        baseUrl: 'https://api.polyv.net',
        debug: true,
      };
      expect(config.debug).toBe(true);
    });
  });

  // ========================================
  // Type compatibility tests
  // ========================================
  describe('type compatibility', () => {
    it('[P1] OutputFormat should be "table" or "json"', () => {
      const tableOutput: 'table' = 'table';
      const jsonOutput: 'json' = 'json';

      // These should compile without error
      const options1: PlatformGetOptions = { output: tableOutput };
      const options2: PlatformGetOptions = { output: jsonOutput };

      expect(options1.output).toBe('table');
      expect(options2.output).toBe('json');
    });

    it('[P1] EnabledValue should be "Y" or "N"', () => {
      const enabledY: 'Y' = 'Y';
      const enabledN: 'N' = 'N';

      const options1: PlatformSwitchUpdateOptions = {
        param: 'authEnabled',
        enabled: enabledY,
      };
      const options2: PlatformSwitchUpdateOptions = {
        param: 'authEnabled',
        enabled: enabledN,
      };

      expect(options1.enabled).toBe('Y');
      expect(options2.enabled).toBe('N');
    });
  });
});
