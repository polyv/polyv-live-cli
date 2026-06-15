/**
 * @fileoverview Unit tests for channel types and interfaces
 */

import {
  ChannelCreateRequest,
  ChannelCreateResponse,
  ChannelModel,
  ChannelCreateOptions,
  ChannelValidationError,
  ChannelServiceConfig
} from './channel';

describe('Channel Types', () => {
  describe('ChannelCreateRequest', () => {
    it('should accept valid channel creation request', () => {
      const request: ChannelCreateRequest = {
        name: 'Test Channel',
        newScene: 'topclass',
        template: 'ppt'
      };

      expect(request.name).toBe('Test Channel');
      expect(request.newScene).toBe('topclass');
      expect(request.template).toBe('ppt');
    });

    it('should accept optional parameters', () => {
      const request: ChannelCreateRequest = {
        name: 'Test Channel',
        newScene: 'alone',
        template: 'portrait_alone',
        channelPasswd: 'test123',
        pureRtcEnabled: true,
        linkMicLimit: 10,
        categoryId: 'cat123',
        startTime: Date.now(),
        endTime: Date.now() + 3600000
      };

      expect(request.channelPasswd).toBe('test123');
      expect(request.pureRtcEnabled).toBe(true);
      expect(request.linkMicLimit).toBe(10);
    });
  });

  describe('ChannelCreateResponse', () => {
    it('should structure API response correctly', () => {
      const response: ChannelCreateResponse = {
        code: 200,
        status: 'success',
        message: 'Channel created successfully',
        data: {
          channelId: 'ch123456',
          userId: 'user123',
          channelPasswd: 'abc123'
        }
      };

      expect(response.code).toBe(200);
      expect(response.status).toBe('success');
      expect(response.data.channelId).toBe('ch123456');
    });
  });

  describe('ChannelModel', () => {
    it('should represent internal channel model', () => {
      const channel: ChannelModel = {
        channelId: 'ch123456',
        name: 'Test Channel',
        userId: 'user123',
        channelPasswd: 'abc123',
        newScene: 'topclass',
        template: 'ppt',
        status: 'waiting'
      };

      expect(channel.channelId).toBe('ch123456');
      expect(channel.status).toBe('waiting');
    });

    it('should accept optional fields', () => {
      const channel: ChannelModel = {
        channelId: 'ch123456',
        name: 'Test Channel',
        userId: 'user123',
        channelPasswd: 'abc123',
        newScene: 'topclass',
        template: 'ppt',
        description: 'Test description',
        maxViewers: 100,
        autoRecord: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(channel.description).toBe('Test description');
      expect(channel.maxViewers).toBe(100);
      expect(channel.autoRecord).toBe(true);
    });
  });

  describe('ChannelCreateOptions', () => {
    it('should represent CLI command options', () => {
      const options: ChannelCreateOptions = {
        name: 'CLI Channel',
        description: 'Created via CLI',
        maxViewers: 50,
        autoRecord: false,
        output: 'table',
        scene: 'seminar',
        template: 'seminar',
        password: 'secure123'
      };

      expect(options.name).toBe('CLI Channel');
      expect(options.output).toBe('table');
      expect(options.scene).toBe('seminar');
    });
  });

  describe('ChannelValidationError', () => {
    it('should structure validation errors', () => {
      const error: ChannelValidationError = {
        field: 'name',
        message: 'Channel name is required',
        value: '',
        rule: 'required'
      };

      expect(error.field).toBe('name');
      expect(error.rule).toBe('required');
    });
  });

  describe('ChannelServiceConfig', () => {
    it('should configure channel service', () => {
      const config: ChannelServiceConfig = {
        baseUrl: 'https://api.polyv.net',
        timeout: 30000,
        maxRetries: 3,
        debug: true
      };

      expect(config.baseUrl).toBe('https://api.polyv.net');
      expect(config.timeout).toBe(30000);
    });
  });
});

// Type checking tests
describe('Channel Type Constraints', () => {
  it('should enforce newScene enum values', () => {
    // This test verifies TypeScript compilation
    const validScenes: Array<ChannelCreateRequest['newScene']> = [
      'topclass',
      'alone',
      'seminar',
      'train',
      'double',
      'guide'
    ];

    expect(validScenes.length).toBe(6);
  });

  it('should enforce template enum values', () => {
    // This test verifies TypeScript compilation
    const validTemplates: Array<ChannelCreateRequest['template']> = [
      'ppt',
      'portrait_ppt',
      'alone',
      'portrait_alone',
      'topclass',
      'portrait_topclass',
      'seminar'
    ];

    expect(validTemplates.length).toBe(7);
  });

  it('should enforce status enum values', () => {
    // This test verifies TypeScript compilation
    const validStatuses: Array<NonNullable<ChannelModel['status']>> = [
      'live',
      'waiting',
      'end',
      'unStart'
    ];

    expect(validStatuses.length).toBe(4);
  });
});