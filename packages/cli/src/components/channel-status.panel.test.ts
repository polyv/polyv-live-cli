/**
 * @fileoverview Unit tests for ChannelStatusPanel component
 * @author Development Team
 * @since 5.3.0
 */

import { EventEmitter } from 'events';
import { ChannelStatusPanel, ChannelStatusPanelConfig, WatchStatus } from './channel-status.panel';
import { ChannelDetailModel } from '../types/channel';

// Mock blessed to avoid terminal dependency in tests
jest.mock('blessed', () => ({
  box: jest.fn(() => ({
    setContent: jest.fn(),
    key: jest.fn(),
    hide: jest.fn(),
    show: jest.fn(),
    focus: jest.fn(),
    destroy: jest.fn(),
    screen: {
      render: jest.fn(),
      remove: jest.fn()
    }
  })),
  list: jest.fn(() => ({
    setItems: jest.fn(),
    select: jest.fn(),
    up: jest.fn(),
    down: jest.fn(),
    focus: jest.fn(),
    selected: 0
  })),
  progressbar: jest.fn(() => ({
    setProgress: jest.fn(),
    hide: jest.fn(),
    show: jest.fn()
  })),
  question: jest.fn(() => ({
    ask: jest.fn((_message, callback) => callback(null, true))
  })),
  screen: jest.fn(() => ({
    render: jest.fn(),
    append: jest.fn(),
    remove: jest.fn(),
    destroy: jest.fn()
  }))
}));

// Mock blessed-contrib
jest.mock('blessed-contrib', () => ({
  table: jest.fn(() => ({
    setData: jest.fn(),
    hide: jest.fn(),
    show: jest.fn(),
    focus: jest.fn(),
    destroy: jest.fn(),
    screen: {
      render: jest.fn()
    }
  }))
}));

describe('ChannelStatusPanel', () => {
  let eventBus: EventEmitter;
  let config: ChannelStatusPanelConfig;
  let panel: ChannelStatusPanel;

  beforeEach(() => {
    eventBus = new EventEmitter();
    config = {
      type: 'channel-status',
      position: { x: 0, y: 0, width: 100, height: 30 },
      size: { minWidth: 80, minHeight: 20 },
      config: {},
      visible: true,
      priority: 1,
      refreshInterval: 5000,
      maxChannels: 100,
      showColors: true,
      columnWidths: [20, 12, 10, 10, 15, 15],
      sortField: 'name',
      sortOrder: 'asc',
      filters: {}
    };
  });

  afterEach(() => {
    if (panel && !panel['isDestroyed']) {
      panel.destroy();
    }
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      panel = new ChannelStatusPanel(config, eventBus);
      
      expect(panel).toBeInstanceOf(ChannelStatusPanel);
      expect(panel.getState().type).toBe('channel-status');
      expect(panel.getState().status).toBe('running');
    });

    it('should set initial sort configuration', () => {
      panel = new ChannelStatusPanel(config, eventBus);
      
      expect(panel['sortConfig'].field).toBe('name');
      expect(panel['sortConfig'].order).toBe('asc');
    });

    it('should initialize empty channels array', () => {
      panel = new ChannelStatusPanel(config, eventBus);
      
      expect(panel['channels']).toEqual([]);
      expect(panel['filteredChannels']).toEqual([]);
      expect(panel.getSelectedChannels()).toEqual([]);
    });
  });

  describe('data conversion', () => {
    beforeEach(() => {
      panel = new ChannelStatusPanel(config, eventBus);
    });

    it('should convert ChannelDetailModel to ChannelStatusInfo', () => {
      const channelDetail: ChannelDetailModel = {
        channelId: 12345,
        name: 'Test Channel',
        scene: 'topclass',
        newScene: 'topclass',
        template: 'ppt',
        channelPasswd: 'password',
        publisher: 'Test Publisher',
        startTime: 1625000000000,
        endTime: 1625003600000,
        pureRtcEnabled: 'Y',
        pageView: 100,
        likes: 50,
        coverImg: 'https://example.com/cover.jpg',
        splashImg: 'https://example.com/splash.jpg',
        splashEnabled: 'Y',
        bgImg: null,
        desc: 'Test description',
        consultingMenuEnabled: 'N',
        maxViewerRestrict: 'N',
        maxViewer: 1000,
        watchStatus: 'live',
        watchStatusText: 'Live',
        userCategory: {
          categoryId: 1,
          categoryName: 'Default',
          userId: 'user123',
          rank: 1
        },
        authSettings: [],
        linkMicLimit: 16,
        createdAccountId: 'account123',
        createdAccountEmail: 'test@example.com',
        createdTime: 1624000000000,
        labelData: []
      };

      const statusInfo = panel['convertToStatusInfo'](channelDetail);

      expect(statusInfo).toEqual({
        channelId: '12345',
        name: 'Test Channel',
        status: 'live',
        statusText: 'Live',
        viewerCount: 100,
        maxViewer: 1000,
        publisher: 'Test Publisher',
        startTime: 1625000000000,
        endTime: 1625003600000,
        createdTime: 1624000000000,
        selected: false
      });
    });
  });

  describe('update method', () => {
    beforeEach(() => {
      panel = new ChannelStatusPanel(config, eventBus);
    });

    it('should handle single channel data', () => {
      const channelDetail: ChannelDetailModel = {
        channelId: 12345,
        name: 'Test Channel',
        scene: 'topclass',
        newScene: 'topclass',
        template: 'ppt',
        channelPasswd: 'password',
        publisher: 'Test Publisher',
        startTime: 1625000000000,
        endTime: 1625003600000,
        pageView: 100,
        likes: 50,
        coverImg: '',
        splashImg: '',
        splashEnabled: 'N',
        bgImg: null,
        desc: '',
        consultingMenuEnabled: 'N',
        maxViewerRestrict: 'N',
        maxViewer: 1000,
        watchStatus: 'live',
        watchStatusText: 'Live',
        userCategory: {
          categoryId: 1,
          categoryName: 'Default',
          userId: 'user123',
          rank: 1
        },
        authSettings: [],
        linkMicLimit: 16,
        createdAccountId: 'account123',
        createdAccountEmail: 'test@example.com',
        createdTime: 1624000000000,
        labelData: []
      };

      panel.update(channelDetail);

      expect(panel['channels']).toHaveLength(1);
      expect(panel['channels'][0]!.channelId).toBe('12345');
      expect(panel['channels'][0]!.name).toBe('Test Channel');
    });

    it('should handle array of channel data', () => {
      const channels: ChannelDetailModel[] = [
        {
          channelId: 12345,
          name: 'Channel 1',
          watchStatus: 'live',
          watchStatusText: 'Live',
          pageView: 100,
          maxViewer: 1000,
          publisher: 'Publisher 1',
          startTime: 1625000000000,
          endTime: 1625003600000,
          createdTime: 1624000000000
        } as ChannelDetailModel,
        {
          channelId: 67890,
          name: 'Channel 2',
          watchStatus: 'waiting',
          watchStatusText: 'Waiting',
          pageView: 50,
          maxViewer: 500,
          publisher: 'Publisher 2',
          startTime: 1625100000000,
          endTime: 1625103600000,
          createdTime: 1624100000000
        } as ChannelDetailModel
      ];

      panel.update(channels);

      expect(panel['channels']).toHaveLength(2);
      expect(panel['channels'][0]!.name).toBe('Channel 1');
      expect(panel['channels'][1]!.name).toBe('Channel 2');
    });

    it('should handle channels object format', () => {
      const channelData = {
        channels: [
          {
            channelId: 12345,
            name: 'Channel 1',
            watchStatus: 'live',
            watchStatusText: 'Live'
          } as ChannelDetailModel
        ]
      };

      panel.update(channelData);

      expect(panel['channels']).toHaveLength(1);
      expect(panel['channels'][0]!.name).toBe('Channel 1');
    });
  });

  describe('sorting functionality', () => {
    beforeEach(() => {
      panel = new ChannelStatusPanel(config, eventBus);
      
      // Add test data
      const channels: ChannelDetailModel[] = [
        {
          channelId: 12345,
          name: 'B Channel',
          watchStatus: 'live',
          watchStatusText: 'Live',
          pageView: 100,
          createdTime: 1624000000000
        } as ChannelDetailModel,
        {
          channelId: 67890,
          name: 'A Channel',
          watchStatus: 'waiting',
          watchStatusText: 'Waiting',
          pageView: 200,
          createdTime: 1624100000000
        } as ChannelDetailModel
      ];
      
      panel.update(channels);
    });

    it('should sort by name ascending by default', () => {
      expect(panel['filteredChannels'][0]!.name).toBe('A Channel');
      expect(panel['filteredChannels'][1]!.name).toBe('B Channel');
    });

    it('should toggle sort order', () => {
      panel['toggleSortOrder']();
      
      expect(panel['sortConfig'].order).toBe('desc');
      expect(panel['filteredChannels'][0]!.name).toBe('B Channel');
      expect(panel['filteredChannels'][1]!.name).toBe('A Channel');
    });

    it('should cycle through sort fields', () => {
      panel['cycleSortField']();
      expect(panel['sortConfig'].field).toBe('status');
      
      panel['cycleSortField']();
      expect(panel['sortConfig'].field).toBe('viewerCount');
    });

    it('should sort by viewer count', () => {
      panel.setSort({ field: 'viewerCount', order: 'desc' });
      
      expect(panel['filteredChannels'][0]!.viewerCount).toBe(200);
      expect(panel['filteredChannels'][1]!.viewerCount).toBe(100);
    });

    it('should support multi-field sorting', () => {
      const channels: ChannelDetailModel[] = [
        { channelId: 1, name: 'A Channel', watchStatus: 'live', pageView: 100 } as ChannelDetailModel,
        { channelId: 2, name: 'B Channel', watchStatus: 'live', pageView: 100 } as ChannelDetailModel,
        { channelId: 3, name: 'C Channel', watchStatus: 'waiting', pageView: 200 } as ChannelDetailModel
      ];
      
      panel.update(channels);
      panel.setMultiFieldSort('status', 'asc', 'name', 'desc');
      
      // Should sort by status first (live before waiting), then by name desc within same status
      expect(panel['filteredChannels'][0]!.name).toBe('B Channel'); // live, name desc
      expect(panel['filteredChannels'][1]!.name).toBe('A Channel'); // live, name desc
      expect(panel['filteredChannels'][2]!.name).toBe('C Channel'); // waiting
    });

    it('should handle comparison of different value types', () => {
      const result1 = panel['compareValues']('apple', 'banana');
      expect(result1).toBeLessThan(0);
      
      const result2 = panel['compareValues'](10, 5);
      expect(result2).toBeGreaterThan(0);
      
      const result3 = panel['compareValues'](undefined, 'test');
      expect(result3).toBeGreaterThan(0);
      
      const result4 = panel['compareValues']('test', undefined);
      expect(result4).toBeLessThan(0);
    });
  });

  describe('filtering functionality', () => {
    beforeEach(() => {
      panel = new ChannelStatusPanel(config, eventBus);
      
      // Add test data
      const channels: ChannelDetailModel[] = [
        {
          channelId: 12345,
          name: 'Live Channel',
          watchStatus: 'live',
          watchStatusText: 'Live',
          publisher: 'Alice'
        } as ChannelDetailModel,
        {
          channelId: 67890,
          name: 'Waiting Channel',
          watchStatus: 'waiting',
          watchStatusText: 'Waiting',
          publisher: 'Bob Smith'
        } as ChannelDetailModel,
        {
          channelId: 11111,
          name: 'Test Live Channel',
          watchStatus: 'live',
          watchStatusText: 'Live',
          publisher: 'Charlie Jones'
        } as ChannelDetailModel
      ];
      
      panel.update(channels);
    });

    it('should filter by status', () => {
      panel.setFilter({ status: ['live'] });
      
      expect(panel['filteredChannels']).toHaveLength(2);
      expect(panel['filteredChannels'].every(c => c.status === 'live')).toBe(true);
    });

    it('should filter by search term', () => {
      panel.setFilter({ searchTerm: 'Test' });
      
      expect(panel['filteredChannels']).toHaveLength(1);
      expect(panel['filteredChannels'][0]!.name).toBe('Test Live Channel');
    });

    it('should search by channel ID', () => {
      panel.setFilter({ searchTerm: '67890' });
      
      expect(panel['filteredChannels']).toHaveLength(1);
      expect(panel['filteredChannels'][0]!.channelId).toBe('67890');
    });

    it('should search by publisher', () => {
      panel.setFilter({ searchTerm: 'Bob Smith' });
      
      expect(panel['filteredChannels']).toHaveLength(1);
      expect(panel['filteredChannels'][0]!.publisher).toBe('Bob Smith');
    });

    it('should clear filters', () => {
      panel.setFilter({ status: ['live'] });
      expect(panel['filteredChannels']).toHaveLength(2);
      
      panel['clearFilters']();
      expect(panel['filteredChannels']).toHaveLength(3);
    });

    it('should combine multiple filters', () => {
      panel.setFilter({ 
        status: ['live'], 
        searchTerm: 'Test' 
      });
      
      expect(panel['filteredChannels']).toHaveLength(1);
      expect(panel['filteredChannels'][0]!.name).toBe('Test Live Channel');
    });

    it('should filter by viewer count range', () => {
      const channels: ChannelDetailModel[] = [
        { channelId: 1, name: 'Channel 1', watchStatus: 'live', pageView: 50 } as ChannelDetailModel,
        { channelId: 2, name: 'Channel 2', watchStatus: 'live', pageView: 150 } as ChannelDetailModel,
        { channelId: 3, name: 'Channel 3', watchStatus: 'live', pageView: 250 } as ChannelDetailModel
      ];
      
      panel.update(channels);
      panel.setAdvancedFilter({ viewerCountMin: 100, viewerCountMax: 200 });
      
      expect(panel['filteredChannels']).toHaveLength(1);
      expect(panel['filteredChannels'][0]!.viewerCount).toBe(150);
    });

    it('should filter by publisher', () => {
      const channels: ChannelDetailModel[] = [
        { channelId: 1, name: 'Channel 1', watchStatus: 'live', publisher: 'Alice' } as ChannelDetailModel,
        { channelId: 2, name: 'Channel 2', watchStatus: 'live', publisher: 'Bob Smith' } as ChannelDetailModel,
        { channelId: 3, name: 'Channel 3', watchStatus: 'live', publisher: 'Charlie' } as ChannelDetailModel
      ];
      
      panel.update(channels);
      panel.setAdvancedFilter({ publisherFilter: 'bob' });
      
      expect(panel['filteredChannels']).toHaveLength(1);
      expect(panel['filteredChannels'][0]!.publisher).toBe('Bob Smith');
    });

    it('should support multi-keyword search', () => {
      const channels: ChannelDetailModel[] = [
        { channelId: 1, name: 'Live Gaming Stream', watchStatus: 'live', publisher: 'Gamer123' } as ChannelDetailModel,
        { channelId: 2, name: 'Music Live Show', watchStatus: 'live', publisher: 'MusicFan' } as ChannelDetailModel,
        { channelId: 3, name: 'Gaming Tournament', watchStatus: 'live', publisher: 'ProGamer' } as ChannelDetailModel
      ];
      
      panel.update(channels);
      panel.setFilter({ searchTerm: 'Gaming Live' });
      
      expect(panel['filteredChannels']).toHaveLength(1);
      expect(panel['filteredChannels'][0]!.name).toBe('Live Gaming Stream');
    });

    it('should handle quick filter by status', () => {
      const channels: ChannelDetailModel[] = [
        { channelId: 1, name: 'Channel 1', watchStatus: 'live' } as ChannelDetailModel,
        { channelId: 2, name: 'Channel 2', watchStatus: 'waiting' } as ChannelDetailModel,
        { channelId: 3, name: 'Channel 3', watchStatus: 'live' } as ChannelDetailModel
      ];
      
      panel.update(channels);
      panel['quickFilterByStatus']('live');
      
      expect(panel['filteredChannels']).toHaveLength(2);
      expect(panel['filteredChannels'].every(c => c.status === 'live')).toBe(true);
    });

    it('should toggle quick filter when applied twice', () => {
      const channels: ChannelDetailModel[] = [
        { channelId: 1, name: 'Channel 1', watchStatus: 'live' } as ChannelDetailModel,
        { channelId: 2, name: 'Channel 2', watchStatus: 'waiting' } as ChannelDetailModel
      ];
      
      panel.update(channels);
      
      // Apply filter
      panel['quickFilterByStatus']('live');
      expect(panel['filteredChannels']).toHaveLength(1);
      
      // Toggle off filter
      panel['quickFilterByStatus']('live');
      expect(panel['filteredChannels']).toHaveLength(2);
    });
  });

  describe('selection functionality', () => {
    beforeEach(() => {
      panel = new ChannelStatusPanel(config, eventBus);
      
      const channels: ChannelDetailModel[] = [
        {
          channelId: 12345,
          name: 'Channel 1',
          watchStatus: 'live'
        } as ChannelDetailModel,
        {
          channelId: 67890,
          name: 'Channel 2',
          watchStatus: 'waiting'
        } as ChannelDetailModel
      ];
      
      panel.update(channels);
    });

    it('should toggle selection of current channel', () => {
      panel['currentIndex'] = 0;
      panel['toggleSelection']();
      
      expect(panel.getSelectedChannels()).toContain('12345');
      
      panel['toggleSelection']();
      expect(panel.getSelectedChannels()).not.toContain('12345');
    });

    it('should select all channels', () => {
      panel['selectAll']();
      
      expect(panel.getSelectedChannels()).toEqual(['12345', '67890']);
    });

    it('should deselect all channels', () => {
      panel['selectAll']();
      expect(panel.getSelectedChannels()).toHaveLength(2);
      
      panel['deselectAll']();
      expect(panel.getSelectedChannels()).toHaveLength(0);
    });

    it('should get current channel', () => {
      panel['currentIndex'] = 1;
      const currentChannel = panel.getCurrentChannel();
      
      expect(currentChannel?.channelId).toBe('67890');
    });
  });

  describe('navigation functionality', () => {
    beforeEach(() => {
      panel = new ChannelStatusPanel(config, eventBus);
      
      const channels: ChannelDetailModel[] = Array.from({ length: 5 }, (_, i) => ({
        channelId: 1000 + i,
        name: `Channel ${i}`,
        watchStatus: 'live'
      } as ChannelDetailModel));
      
      panel.update(channels);
    });

    it('should move selection down', () => {
      expect(panel['currentIndex']).toBe(0);
      
      panel['moveSelection'](1);
      expect(panel['currentIndex']).toBe(1);
      
      panel['moveSelection'](2);
      expect(panel['currentIndex']).toBe(3);
    });

    it('should move selection up', () => {
      panel['currentIndex'] = 3;
      
      panel['moveSelection'](-1);
      expect(panel['currentIndex']).toBe(2);
      
      panel['moveSelection'](-2);
      expect(panel['currentIndex']).toBe(0);
    });

    it('should respect bounds when moving selection', () => {
      panel['moveSelection'](-10);
      expect(panel['currentIndex']).toBe(0);
      
      panel['moveSelection'](100);
      expect(panel['currentIndex']).toBe(4); // Last index
    });

    it('should move to top', () => {
      panel['currentIndex'] = 3;
      panel['moveToTop']();
      
      expect(panel['currentIndex']).toBe(0);
    });

    it('should move to bottom', () => {
      panel['currentIndex'] = 1;
      panel['moveToBottom']();
      
      expect(panel['currentIndex']).toBe(4);
    });
  });

  describe('status color mapping', () => {
    beforeEach(() => {
      panel = new ChannelStatusPanel(config, eventBus);
    });

    it('should map live status to green with icon', () => {
      const colors = panel['getStatusColors']('live');
      expect(colors.fg).toBe('green');
      expect(colors.icon).toBe('●');
    });

    it('should map waiting status to yellow with icon', () => {
      const colors = panel['getStatusColors']('waiting');
      expect(colors.fg).toBe('yellow');
      expect(colors.icon).toBe('◯');
    });

    it('should map ended status to gray with icon', () => {
      const colors = panel['getStatusColors']('end');
      expect(colors.fg).toBe('gray');
      expect(colors.icon).toBe('◦');
    });

    it('should map banned status to red with icon', () => {
      const colors = panel['getStatusColors']('banpush');
      expect(colors.fg).toBe('red');
      expect(colors.icon).toBe('✖');
    });

    it('should map playback status to blue with icon', () => {
      const colors = panel['getStatusColors']('playback');
      expect(colors.fg).toBe('blue');
      expect(colors.icon).toBe('▶');
    });

    it('should default to white for unknown status with icon', () => {
      const colors = panel['getStatusColors']('unknown' as WatchStatus);
      expect(colors.fg).toBe('white');
      expect(colors.icon).toBe('?');
    });

    it('should return terminal-safe colors', () => {
      expect(panel['getTerminalSafeColor']('green')).toBe('green');
      expect(panel['getTerminalSafeColor']('unknown')).toBe('white');
    });

    it('should return white when colors disabled', () => {
      const disabledConfig = { ...config, showColors: false };
      const disabledPanel = new ChannelStatusPanel(disabledConfig, eventBus);
      expect(disabledPanel['getTerminalSafeColor']('green')).toBe('white');
      disabledPanel.destroy();
    });

    it('should classify status health levels correctly', () => {
      expect(panel['getStatusHealthLevel']('live')).toBe('healthy');
      expect(panel['getStatusHealthLevel']('waiting')).toBe('warning');
      expect(panel['getStatusHealthLevel']('playback')).toBe('warning');
      expect(panel['getStatusHealthLevel']('banpush')).toBe('error');
      expect(panel['getStatusHealthLevel']('end')).toBe('warning');
      expect(panel['getStatusHealthLevel']('unStart')).toBe('warning');
    });

    it('should generate health summary', () => {
      const channels: ChannelDetailModel[] = [
        { channelId: 1, name: 'Channel 1', watchStatus: 'live' } as ChannelDetailModel,
        { channelId: 2, name: 'Channel 2', watchStatus: 'waiting' } as ChannelDetailModel,
        { channelId: 3, name: 'Channel 3', watchStatus: 'banpush' } as ChannelDetailModel,
        { channelId: 4, name: 'Channel 4', watchStatus: 'live' } as ChannelDetailModel
      ];
      
      panel.update(channels);
      const health = panel['getChannelHealthSummary']();
      
      expect(health.healthy).toBe(2); // 2 live channels
      expect(health.warning).toBe(1); // 1 waiting channel
      expect(health.error).toBe(1);   // 1 banpush channel
    });

    it('should emit status change events', () => {
      const emitSpy = jest.spyOn(panel as any, 'emit');
      
      const channels: ChannelDetailModel[] = [
        { channelId: 1, name: 'Channel 1', watchStatus: 'live' } as ChannelDetailModel
      ];
      
      panel.update(channels);
      
      expect(emitSpy).toHaveBeenCalledWith('component:statusChanged', expect.objectContaining({
        componentId: panel.getState().id,
        healthSummary: expect.objectContaining({
          healthy: 1,
          warning: 0,
          error: 0
        })
      }));
    });
  });

  describe('event handling', () => {
    beforeEach(() => {
      panel = new ChannelStatusPanel(config, eventBus);
    });

    it('should emit channel details event', () => {
      const emitSpy = jest.spyOn(panel as any, 'emit');
      
      const channels: ChannelDetailModel[] = [
        {
          channelId: 12345,
          name: 'Test Channel',
          watchStatus: 'live'
        } as ChannelDetailModel
      ];
      
      panel.update(channels);
      panel['currentIndex'] = 0;
      panel['showChannelDetails']();
      
      expect(emitSpy).toHaveBeenCalledWith('component:showDetails', expect.objectContaining({
        componentId: panel.getState().id,
        channelId: '12345'
      }));
    });

    it('should emit batch operations event', () => {
      const emitSpy = jest.spyOn(panel as any, 'emit');
      
      const channels: ChannelDetailModel[] = [
        { channelId: 12345, name: 'Channel 1', watchStatus: 'live' } as ChannelDetailModel,
        { channelId: 67890, name: 'Channel 2', watchStatus: 'waiting' } as ChannelDetailModel
      ];
      
      panel.update(channels);
      panel['selectAll']();
      panel['showBatchOperations']();
      
      expect(emitSpy).toHaveBeenCalledWith('component:batchOperations', expect.objectContaining({
        componentId: panel.getState().id,
        selectedChannels: ['12345', '67890']
      }));
    });

    it('should emit filter dialog event', () => {
      const emitSpy = jest.spyOn(panel as any, 'emit');
      
      panel['showFilterDialog']();
      
      expect(emitSpy).toHaveBeenCalledWith('component:filterDialog', expect.objectContaining({
        componentId: panel.getState().id,
        currentFilter: {}
      }));
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      panel = new ChannelStatusPanel(config, eventBus);
    });

    it('should handle invalid data gracefully', () => {
      expect(() => {
        panel.update(null as any);
      }).not.toThrow();
    });

    it('should handle empty data arrays', () => {
      panel.update([]);
      
      expect(panel['channels']).toEqual([]);
      expect(panel['filteredChannels']).toEqual([]);
    });

    it('should handle update after destroy', () => {
      panel.destroy();
      
      expect(() => {
        panel.update([{ channelId: 12345 } as ChannelDetailModel]);
      }).not.toThrow();
    });
  });

  describe('additional edge cases', () => {
    beforeEach(() => {
      panel = new ChannelStatusPanel(config, eventBus);
    });

    it('should handle channel conversion with missing fields', () => {
      const channelWithMissingFields = {
        channelId: 12345,
        name: 'Test Channel'
        // Missing other required fields
      } as ChannelDetailModel;

      expect(() => {
        panel.update([channelWithMissingFields]);
      }).not.toThrow();
    });

    it('should handle filtering with null/undefined values', () => {
      const channels = [
        { channelId: 1, name: null, watchStatus: 'live' } as any,
        { channelId: 2, name: undefined, watchStatus: 'waiting' } as any,
        { channelId: 3, name: 'Valid', watchStatus: null } as any
      ] as ChannelDetailModel[];

      panel.update(channels);
      
      expect(() => {
        panel.setFilter({ searchTerm: 'Valid' });
        panel.setFilter({ status: ['live'] });
        panel.setFilter({ searchTerm: 'test' });
      }).not.toThrow();
    });

    it('should handle sorting with null/undefined values', () => {
      const channels = [
        { channelId: 1, name: null, watchStatus: 'live', realTimeViewerCount: null } as any,
        { channelId: 2, name: 'B', watchStatus: undefined, realTimeViewerCount: 100 } as any,
        { channelId: 3, name: 'A', watchStatus: 'waiting', realTimeViewerCount: undefined } as any
      ] as ChannelDetailModel[];

      panel.update(channels);
      
      expect(() => {
        panel['cycleSortField'](); // Cycle through sort fields
        panel['toggleSortOrder'](); // Toggle sort order
      }).not.toThrow();
    });

    it('should handle selection operations with empty filtered list', () => {
      panel.update([{ channelId: 1, name: 'Test', watchStatus: 'live', realTimeViewerCount: 100 } as unknown as ChannelDetailModel]);
      panel.setFilter({ searchTerm: 'nonexistent' });
      
      expect(() => {
        panel['selectAll']();
        panel['deselectAll']();
        panel['toggleSelection']();
        panel.getCurrentChannel();
      }).not.toThrow();
    });

    it('should handle range operations at boundaries', () => {
      const channels = [
        { channelId: 1, name: 'A', watchStatus: 'live', realTimeViewerCount: 100 } as unknown as ChannelDetailModel,
        { channelId: 2, name: 'B', watchStatus: 'waiting', realTimeViewerCount: 50 } as unknown as ChannelDetailModel,
        { channelId: 3, name: 'C', watchStatus: 'ended', realTimeViewerCount: 25 } as unknown as ChannelDetailModel
      ];
      panel.update(channels);
      
      // Test range filtering edge cases
      panel.setAdvancedFilter({ viewerCountMin: 0, viewerCountMax: 0 }); // Zero range
      panel.setAdvancedFilter({ viewerCountMin: 200, viewerCountMax: 300 }); // Range above all values
      panel.setAdvancedFilter({ viewerCountMin: -100, viewerCountMax: -50 }); // Negative range
      
      expect(panel['filteredChannels']).toBeDefined();
    });
  });

  describe('cleanup', () => {
    beforeEach(() => {
      panel = new ChannelStatusPanel(config, eventBus);
    });

    it('should clean up resources on destroy', () => {
      panel['selectAll']();
      expect(panel.getSelectedChannels()).toHaveLength(0); // No channels yet

      const channels: ChannelDetailModel[] = [
        { channelId: 12345, name: 'Channel 1', watchStatus: 'live' } as ChannelDetailModel
      ];
      panel.update(channels);
      panel['selectAll']();
      expect(panel.getSelectedChannels()).toHaveLength(1);

      panel.destroy();

      expect(panel['channels']).toEqual([]);
      expect(panel['filteredChannels']).toEqual([]);
      expect(panel.getSelectedChannels()).toEqual([]);
      expect(panel.getState().status).toBe('destroyed');
    });
  });

  describe('Navigation Methods', () => {
    beforeEach(() => {
      panel = new ChannelStatusPanel(config, eventBus);
      const channels = [
        { channelId: 1, name: 'Channel A', watchStatus: 'live', realTimeViewerCount: 100 } as unknown as ChannelDetailModel,
        { channelId: 2, name: 'Channel B', watchStatus: 'waiting', realTimeViewerCount: 50 } as unknown as ChannelDetailModel,
        { channelId: 3, name: 'Channel C', watchStatus: 'ended', realTimeViewerCount: 25 } as unknown as ChannelDetailModel,
        { channelId: 4, name: 'Channel D', watchStatus: 'live', realTimeViewerCount: 200 } as unknown as ChannelDetailModel,
        { channelId: 5, name: 'Channel E', watchStatus: 'banpush', realTimeViewerCount: 0 } as unknown as ChannelDetailModel,
      ];
      panel.update(channels);
    });

    it('should move selection up and down', () => {
      panel['moveSelection'](1);
      expect(panel['currentIndex']).toBe(1);

      panel['moveSelection'](-1);
      expect(panel['currentIndex']).toBe(0);
    });

    it('should clamp selection to bounds', () => {
      panel['moveSelection'](-10);
      expect(panel['currentIndex']).toBe(0);

      panel['moveSelection'](100);
      expect(panel['currentIndex']).toBe(4);
    });

    it('should move to top', () => {
      panel['currentIndex'] = 3;
      panel['moveToTop']();
      expect(panel['currentIndex']).toBe(0);
    });

    it('should move to bottom', () => {
      panel['moveToBottom']();
      expect(panel['currentIndex']).toBe(4);
    });

    it('should handle moveToBottom with empty list', () => {
      panel['filteredChannels'] = [];
      panel['moveToBottom']();
      expect(panel['currentIndex']).toBe(0);
    });

    it('should extend selection up', () => {
      panel['currentIndex'] = 2;
      panel['extendSelectionUp']();
      expect(panel['isRangeSelecting']).toBe(true);
      expect(panel['selectionStartIndex']).toBe(2);
    });

    it('should extend selection down', () => {
      panel['currentIndex'] = 2;
      panel['extendSelectionDown']();
      expect(panel['isRangeSelecting']).toBe(true);
      expect(panel['selectionStartIndex']).toBe(2);
    });

    it('should not extend selection up when at top', () => {
      panel['currentIndex'] = 0;
      panel['extendSelectionUp']();
      expect(panel['currentIndex']).toBe(0);
    });

    it('should not extend selection down when at bottom', () => {
      panel['currentIndex'] = 4;
      panel['extendSelectionDown']();
      expect(panel['currentIndex']).toBe(4);
    });

    it('should handle extend selection with empty list', () => {
      panel['filteredChannels'] = [];
      panel['extendSelectionUp']();
      panel['extendSelectionDown']();
      // Should not throw
    });

    it('should update range selection', () => {
      panel['selectionStartIndex'] = 2;
      panel['updateRangeSelection'](4);
      expect(panel['currentIndex']).toBe(4);
      expect(panel.getSelectedChannels().length).toBeGreaterThan(0);
    });

    it('should clear range selection', () => {
      panel['clearRangeSelection']();
      // Should not throw
    });

    it('should jump to line', () => {
      const result = panel.jumpToLine(3);
      expect(result).toBe(true);
      expect(panel['currentIndex']).toBe(2);
    });

    it('should return false for invalid line number', () => {
      const result = panel.jumpToLine(100);
      expect(result).toBe(false);
    });

    it('should jump to channel by ID', () => {
      const result = panel.jumpToChannel('3');
      expect(result).toBe(true);
      expect(panel['currentIndex']).toBe(2);
    });

    it('should jump to channel by name', () => {
      const result = panel.jumpToChannel('Channel D');
      expect(result).toBe(true);
      expect(panel['currentIndex']).toBe(3);
    });

    it('should return false for non-existent channel', () => {
      const result = panel.jumpToChannel('NonExistent');
      expect(result).toBe(false);
    });

    it('should save navigation history', () => {
      panel['currentIndex'] = 2;
      panel['lastJumpPosition'] = 0;
      panel['saveNavigationHistory']();
      expect(panel['navigationHistory']).toContain(0);
    });

    it('should limit navigation history to 10 items', () => {
      for (let i = 0; i < 15; i++) {
        panel['currentIndex'] = i;
        panel['lastJumpPosition'] = i - 1;
        panel['saveNavigationHistory']();
      }
      expect(panel['navigationHistory'].length).toBeLessThanOrEqual(10);
    });

    it('should emit navigation event', () => {
      const emitSpy = jest.spyOn(panel as any, 'emit');
      panel['emitNavigationEvent']('test');
      expect(emitSpy).toHaveBeenCalledWith('component:navigation', expect.objectContaining({
        action: 'test',
      }));
    });
  });

  describe('Selection Methods', () => {
    beforeEach(() => {
      panel = new ChannelStatusPanel(config, eventBus);
      const channels = [
        { channelId: 1, name: 'Channel A', watchStatus: 'live' } as unknown as ChannelDetailModel,
        { channelId: 2, name: 'Channel B', watchStatus: 'waiting' } as unknown as ChannelDetailModel,
        { channelId: 3, name: 'Channel C', watchStatus: 'ended' } as unknown as ChannelDetailModel,
      ];
      panel.update(channels);
    });

    it('should toggle selection', () => {
      panel['toggleSelection']();
      expect(panel.getSelectedChannels()).toContain('1');

      panel['toggleSelection']();
      expect(panel.getSelectedChannels()).not.toContain('1');
    });

    it('should select all channels', () => {
      panel['selectAll']();
      expect(panel.getSelectedChannels()).toHaveLength(3);
    });

    it('should deselect all channels', () => {
      panel['selectAll']();
      expect(panel.getSelectedChannels()).toHaveLength(3);

      panel['deselectAll']();
      expect(panel.getSelectedChannels()).toHaveLength(0);
    });

    it('should handle toggle selection with empty list', () => {
      panel['filteredChannels'] = [];
      panel['toggleSelection']();
      // Should not throw
    });
  });

  describe('Copy Operations', () => {
    beforeEach(() => {
      panel = new ChannelStatusPanel(config, eventBus);
      const channels = [
        { channelId: 1, name: 'Channel A', watchStatus: 'live', realTimeViewerCount: 100 } as unknown as ChannelDetailModel,
        { channelId: 2, name: 'Channel B', watchStatus: 'waiting', realTimeViewerCount: 50 } as unknown as ChannelDetailModel,
      ];
      panel.update(channels);
    });

    it('should copy current channel info when nothing selected', () => {
      const emitSpy = jest.spyOn(panel as any, 'emit');
      panel['copySelectionInfo']();
      expect(emitSpy).toHaveBeenCalledWith('component:copyToClipboard', expect.objectContaining({
        type: 'singleChannel',
      }));
    });

    it('should copy selected channels info', () => {
      panel['selectAll']();
      const emitSpy = jest.spyOn(panel as any, 'emit');
      panel['copySelectionInfo']();
      expect(emitSpy).toHaveBeenCalledWith('component:copyToClipboard', expect.objectContaining({
        type: 'multipleChannels',
      }));
    });

    it('should copy single channel info', () => {
      const emitSpy = jest.spyOn(panel as any, 'emit');
      const channel = { channelId: '1', name: 'Test', statusText: 'Live', viewerCount: 100 } as ChannelStatusInfo;
      panel['copyChannelInfo'](channel);
      expect(emitSpy).toHaveBeenCalledWith('component:copyToClipboard', expect.objectContaining({
        type: 'singleChannel',
        channel,
      }));
    });

    it('should copy multiple channels info', () => {
      const emitSpy = jest.spyOn(panel as any, 'emit');
      const channels = [
        { channelId: '1', name: 'Test 1', statusText: 'Live', viewerCount: 100 },
        { channelId: '2', name: 'Test 2', statusText: 'Ended', viewerCount: 50 },
      ] as ChannelStatusInfo[];
      panel['copyMultipleChannelsInfo'](channels);
      expect(emitSpy).toHaveBeenCalledWith('component:copyToClipboard', expect.objectContaining({
        type: 'multipleChannels',
        count: 2,
      }));
    });
  });

  describe('Sort Operations', () => {
    beforeEach(() => {
      panel = new ChannelStatusPanel(config, eventBus);
      const channels = [
        { channelId: 1, name: 'B Channel', watchStatus: 'live', realTimeViewerCount: 100 } as unknown as ChannelDetailModel,
        { channelId: 2, name: 'A Channel', watchStatus: 'waiting', realTimeViewerCount: 200 } as unknown as ChannelDetailModel,
        { channelId: 3, name: 'C Channel', watchStatus: 'ended', realTimeViewerCount: 50 } as unknown as ChannelDetailModel,
      ];
      panel.update(channels);
    });

    it('should cycle sort field', () => {
      panel['cycleSortField']();
      expect(panel['sortConfig'].field).toBe('status');
    });

    it('should cycle sort field with secondary sort', () => {
      panel['sortConfig'].secondaryField = 'viewerCount';
      panel['sortConfig'].secondaryOrder = 'desc';
      panel['cycleSortField']();
      expect(panel['sortConfig'].field).toBe('viewerCount');
      expect(panel['sortConfig'].secondaryField).toBeUndefined();
    });

    it('should toggle sort order', () => {
      const initialOrder = panel['sortConfig'].order;
      panel['toggleSortOrder']();
      expect(panel['sortConfig'].order).toBe(initialOrder === 'asc' ? 'desc' : 'asc');
    });

    it('should set multi-field sort', () => {
      panel.setMultiFieldSort('viewerCount', 'desc', 'name', 'asc');
      expect(panel['sortConfig'].field).toBe('viewerCount');
      expect(panel['sortConfig'].order).toBe('desc');
      expect(panel['sortConfig'].secondaryField).toBe('name');
      expect(panel['sortConfig'].secondaryOrder).toBe('asc');
    });

    it('should set sort configuration', () => {
      panel.setSort({ field: 'viewerCount', order: 'desc' });
      expect(panel['sortConfig'].field).toBe('viewerCount');
      expect(panel['sortConfig'].order).toBe('desc');
    });
  });

  describe('Filter Operations', () => {
    beforeEach(() => {
      panel = new ChannelStatusPanel(config, eventBus);
      const channels = [
        { channelId: 1, name: 'Live Channel', watchStatus: 'live', realTimeViewerCount: 100 } as unknown as ChannelDetailModel,
        { channelId: 2, name: 'Waiting Channel', watchStatus: 'waiting', realTimeViewerCount: 50 } as unknown as ChannelDetailModel,
        { channelId: 3, name: 'Ended Channel', watchStatus: 'ended', realTimeViewerCount: 25 } as unknown as ChannelDetailModel,
        { channelId: 4, name: 'Banpush Channel', watchStatus: 'banpush', realTimeViewerCount: 0 } as unknown as ChannelDetailModel,
      ];
      panel.update(channels);
    });

    it('should quick filter by status', () => {
      panel['quickFilterByStatus']('live');
      expect(panel['filterConfig'].status).toContain('live');
    });

    it('should toggle quick filter by status', () => {
      panel['quickFilterByStatus']('live');
      expect(panel['filterConfig'].status).toContain('live');

      panel['quickFilterByStatus']('live');
      // After toggling off, the status array might be empty or undefined
      expect(panel['filterConfig'].status?.includes('live')).toBeFalsy();
    });

    it('should clear filters', () => {
      panel['quickFilterByStatus']('live');
      expect(panel['filterConfig'].status).toBeDefined();

      panel['clearFilters']();
      expect(panel['filterConfig'].status).toBeUndefined();
    });

    it('should clear filters and emit event when filters existed', () => {
      panel['filterConfig'].status = ['live'];
      const emitSpy = jest.spyOn(panel as any, 'emit');
      panel['clearFilters']();
      expect(emitSpy).toHaveBeenCalledWith('component:filtersCleared', expect.any(Object));
    });

    it('should not emit event when clearing empty filters', () => {
      const emitSpy = jest.spyOn(panel as any, 'emit');
      panel['clearFilters']();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should set filter configuration', () => {
      panel.setFilter({ status: ['live'], searchTerm: 'test' });
      expect(panel['filterConfig'].status).toEqual(['live']);
      expect(panel['filterConfig'].searchTerm).toBe('test');
    });

    it('should set advanced filter', () => {
      panel.setAdvancedFilter({ viewerCountMin: 50, viewerCountMax: 200 });
      expect(panel['filterConfig'].viewerCountMin).toBe(50);
      expect(panel['filterConfig'].viewerCountMax).toBe(200);
    });

    it('should show filter dialog', () => {
      const emitSpy = jest.spyOn(panel as any, 'emit');
      panel['showFilterDialog']();
      expect(emitSpy).toHaveBeenCalledWith('component:filterDialog', expect.any(Object));
    });

    it('should show advanced filter dialog', () => {
      const emitSpy = jest.spyOn(panel as any, 'emit');
      panel['showAdvancedFilterDialog']();
      expect(emitSpy).toHaveBeenCalledWith('component:advancedFilterDialog', expect.any(Object));
    });
  });

  describe('Details and Batch Operations', () => {
    beforeEach(() => {
      panel = new ChannelStatusPanel(config, eventBus);
      const channels = [
        { channelId: 1, name: 'Channel A', watchStatus: 'live' } as unknown as ChannelDetailModel,
        { channelId: 2, name: 'Channel B', watchStatus: 'waiting' } as unknown as ChannelDetailModel,
      ];
      panel.update(channels);
    });

    it('should show channel details', () => {
      const emitSpy = jest.spyOn(panel as any, 'emit');
      panel['showChannelDetails']();
      expect(emitSpy).toHaveBeenCalledWith('component:showDetails', expect.any(Object));
    });

    it('should not show details with empty list', () => {
      panel['filteredChannels'] = [];
      const emitSpy = jest.spyOn(panel as any, 'emit');
      panel['showChannelDetails']();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should show batch operations dialog', () => {
      panel['selectAll']();
      const emitSpy = jest.spyOn(panel as any, 'emit');
      panel['showBatchOperations']();
      expect(emitSpy).toHaveBeenCalledWith('component:batchOperations', expect.any(Object));
    });

    it('should not show batch operations with no selection', () => {
      const emitSpy = jest.spyOn(panel as any, 'emit');
      panel['showBatchOperations']();
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('Quick Jump and Go To Line', () => {
    beforeEach(() => {
      panel = new ChannelStatusPanel(config, eventBus);
      const channels = [
        { channelId: 1, name: 'Channel A', watchStatus: 'live' } as unknown as ChannelDetailModel,
        { channelId: 2, name: 'Channel B', watchStatus: 'waiting' } as unknown as ChannelDetailModel,
      ];
      panel.update(channels);
    });

    it('should show quick jump dialog', () => {
      const emitSpy = jest.spyOn(panel as any, 'emit');
      panel['showQuickJumpDialog']();
      expect(emitSpy).toHaveBeenCalledWith('component:quickJumpDialog', expect.any(Object));
    });

    it('should show go to line dialog', () => {
      const emitSpy = jest.spyOn(panel as any, 'emit');
      panel['showGoToLineDialog']();
      expect(emitSpy).toHaveBeenCalledWith('component:goToLineDialog', expect.any(Object));
    });
  });

  describe('Get Config and Current Channel', () => {
    beforeEach(() => {
      panel = new ChannelStatusPanel(config, eventBus);
    });

    it('should get config', () => {
      const panelConfig = panel['getConfig']();
      expect(panelConfig.type).toBe('channel-status');
      expect(panelConfig.refreshInterval).toBe(5000);
    });

    it('should get current channel', () => {
      const channels = [
        { channelId: 1, name: 'Channel A', watchStatus: 'live' } as unknown as ChannelDetailModel,
      ];
      panel.update(channels);
      const current = panel.getCurrentChannel();
      expect(current).not.toBeNull();
      expect(current?.name).toBe('Channel A');
    });

    it('should return null for current channel with empty list', () => {
      const current = panel.getCurrentChannel();
      expect(current).toBeNull();
    });
  });
});