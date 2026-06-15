/**
 * @fileoverview Tests for platform label type definitions
 * @author Development Team
 * @since 13.4.0
 */

import {
  PlatformLabelListOptions,
  PlatformLabelCreateOptions,
  PlatformLabelUpdateOptions,
  PlatformLabelDeleteOptions,
  PlatformLabelServiceConfig,
  ViewerLabel,
} from './platform-label';

describe('Platform Label Types', () => {
  describe('ViewerLabel', () => {
    it('should define labelId as number', () => {
      const label: ViewerLabel = {
        labelId: 1,
        labelName: 'VIP',
      };
      expect(label.labelId).toBe(1);
    });

    it('should define labelName as string', () => {
      const label: ViewerLabel = {
        labelId: 1,
        labelName: 'VIP',
      };
      expect(label.labelName).toBe('VIP');
    });

    it('should have optional createdTime', () => {
      const label: ViewerLabel = {
        labelId: 1,
        labelName: 'VIP',
        createdTime: '2024-01-01 00:00:00',
      };
      expect(label.createdTime).toBe('2024-01-01 00:00:00');
    });

    it('should have optional updatedTime', () => {
      const label: ViewerLabel = {
        labelId: 1,
        labelName: 'VIP',
        updatedTime: '2024-01-02 00:00:00',
      };
      expect(label.updatedTime).toBe('2024-01-02 00:00:00');
    });
  });

  describe('PlatformLabelListOptions', () => {
    it('should define output format', () => {
      const options: PlatformLabelListOptions = {
        output: 'table',
      };
      expect(options.output).toBe('table');
    });
  });

  describe('PlatformLabelCreateOptions', () => {
    it('should define labelName', () => {
      const options: PlatformLabelCreateOptions = {
        labelName: 'VIP',
        output: 'table',
      };
      expect(options.labelName).toBe('VIP');
    });
  });

  describe('PlatformLabelUpdateOptions', () => {
    it('should define labelId and labelName', () => {
      const options: PlatformLabelUpdateOptions = {
        labelId: 1,
        labelName: 'Updated VIP',
        output: 'table',
      };
      expect(options.labelId).toBe(1);
      expect(options.labelName).toBe('Updated VIP');
    });
  });

  describe('PlatformLabelDeleteOptions', () => {
    it('should define labelId', () => {
      const options: PlatformLabelDeleteOptions = {
        labelId: 1,
        output: 'table',
      };
      expect(options.labelId).toBe(1);
    });
  });

  describe('PlatformLabelServiceConfig', () => {
    it('should define service configuration', () => {
      const config: PlatformLabelServiceConfig = {
        baseUrl: 'https://api.polyv.net',
        timeout: 30000,
        debug: false,
      };
      expect(config.baseUrl).toBe('https://api.polyv.net');
      expect(config.timeout).toBe(30000);
      expect(config.debug).toBe(false);
    });
  });
});
