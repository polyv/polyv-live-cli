/**
 * @fileoverview Unit tests for AI Digital Human type definitions
 * @author Development Team
 * @since 14.4.0
 */

import {
  AIDigitalHuman,
  AIDigitalHumanListResponse,
  AIDigitalHumanOrganization,
  SetOrganizationParams,
  AIDigitalHumanServiceConfig,
  AIDigitalHumanListOptions,
  AIDigitalHumanListOrgOptions,
  AIDigitalHumanSetOrgOptions,
} from './ai-digital-human';

describe('AI Digital Human Types', () => {
  // ========================================
  // AC1: AIDigitalHuman interface
  // ========================================
  describe('AIDigitalHuman interface', () => {
    it('[AC1] should define AIDigitalHuman interface', () => {
      const digitalHuman: AIDigitalHuman = {
        id: 55,
        name: '萌萌',
        thirdRoleCode: '00024',
        coverPhoto: 'https://img.videocc.net/cover.png',
        fullBodyPhoto: 'https://img.videocc.net/full.png',
        defaultTtsVoiceId: 92,
        clothesDesc: '白色西装',
        createTime: 1704191006000,
      };

      expect(digitalHuman.id).toBe(55);
      expect(digitalHuman.name).toBe('萌萌');
      expect(digitalHuman.thirdRoleCode).toBe('00024');
      expect(digitalHuman.defaultTtsVoiceId).toBe(92);
      expect(digitalHuman.createTime).toBe(1704191006000);
    });
  });

  // ========================================
  // AC2, AC3: AIDigitalHumanOrganization interface
  // ========================================
  describe('AIDigitalHumanOrganization interface', () => {
    it('[AC2, AC3] should define AIDigitalHumanOrganization interface', () => {
      const organization: AIDigitalHumanOrganization = {
        aiDigitalHumanId: 1,
        organizationIds: [1, 2, 3],
        includeChildren: true,
      };

      expect(organization.aiDigitalHumanId).toBe(1);
      expect(organization.organizationIds).toEqual([1, 2, 3]);
      expect(organization.includeChildren).toBe(true);
    });
  });

  // ========================================
  // AC1: AIDigitalHumanListResponse interface
  // ========================================
  describe('AIDigitalHumanListResponse interface', () => {
    it('[AC1] should define AIDigitalHumanListResponse interface', () => {
      const response: AIDigitalHumanListResponse = {
        pageNumber: 1,
        pageSize: 10,
        totalPages: 2,
        totalItems: 16,
        contents: [
          {
            id: 55,
            name: '萌萌',
            thirdRoleCode: '00024',
            coverPhoto: 'https://img.videocc.net/cover.png',
            fullBodyPhoto: 'https://img.videocc.net/full.png',
            defaultTtsVoiceId: 92,
            clothesDesc: '白色西装',
            createTime: 1704191006000,
          },
        ],
      };

      expect(response.pageNumber).toBe(1);
      expect(response.pageSize).toBe(10);
      expect(response.totalPages).toBe(2);
      expect(response.totalItems).toBe(16);
      expect(response.contents).toHaveLength(1);
    });
  });

  // ========================================
  // AC3: SetOrganizationParams interface
  // ========================================
  describe('SetOrganizationParams interface', () => {
    it('[AC3] should define SetOrganizationParams interface', () => {
      const params: SetOrganizationParams = {
        aiDigitalHumanId: 1,
        organizationIds: [1, 2, 3],
        includeChildren: true,
      };

      expect(params.aiDigitalHumanId).toBe(1);
      expect(params.organizationIds).toEqual([1, 2, 3]);
      expect(params.includeChildren).toBe(true);
    });
  });

  // ========================================
  // AC1-3: AIDigitalHumanServiceConfig interface
  // ========================================
  describe('AIDigitalHumanServiceConfig interface', () => {
    it('[AC1-3] should define AIDigitalHumanServiceConfig interface', () => {
      const config: AIDigitalHumanServiceConfig = {
        baseUrl: 'https://api.polyv.net',
        timeout: 30000,
        debug: false,
      };

      expect(config.baseUrl).toBe('https://api.polyv.net');
      expect(config.timeout).toBe(30000);
      expect(config.debug).toBe(false);
    });

    it('[AC1-3] should allow optional config properties', () => {
      const partialConfig: AIDigitalHumanServiceConfig = {};
      expect(partialConfig.baseUrl).toBeUndefined();
      expect(partialConfig.timeout).toBeUndefined();
      expect(partialConfig.debug).toBeUndefined();
    });
  });

  // ========================================
  // Command Options interfaces
  // ========================================
  describe('AIDigitalHumanListOptions interface', () => {
    it('[AC1] should define AIDigitalHumanListOptions interface', () => {
      const options: AIDigitalHumanListOptions = {
        page: 1,
        size: 10,
        output: 'table',
      };
      expect(options.page).toBe(1);
      expect(options.size).toBe(10);
      expect(options.output).toBe('table');
    });

    it('[AC1] should allow optional output format', () => {
      const options: AIDigitalHumanListOptions = {
        page: 1,
        size: 10,
      };

      expect(options.output).toBeUndefined();
    });
  });

  describe('AIDigitalHumanListOrgOptions interface', () => {
    it('[AC2] should define AIDigitalHumanListOrgOptions interface', () => {
      const options: AIDigitalHumanListOrgOptions = {
        ids: '1,2,3',
        output: 'json',
      };
      expect(options.ids).toBe('1,2,3');
      expect(options.output).toBe('json');
    });
  });

  describe('AIDigitalHumanSetOrgOptions interface', () => {
    it('[AC3] should define AIDigitalHumanSetOrgOptions interface', () => {
      const options: AIDigitalHumanSetOrgOptions = {
        config: '[{"aiDigitalHumanId":1}]',
        output: 'table',
      };
      expect(options.config).toBe('[{"aiDigitalHumanId":1}]');
      expect(options.output).toBe('table');
    });

    it('[AC3] should allow individual CLI params', () => {
      const options: AIDigitalHumanSetOrgOptions = {
        aiDigitalHumanId: '1',
        organizationIds: '1,2,3',
        includeChildren: true,
        output: 'table',
      };
      expect(options.aiDigitalHumanId).toBe('1');
      expect(options.organizationIds).toBe('1,2,3');
      expect(options.includeChildren).toBe(true);
    });
  });
});