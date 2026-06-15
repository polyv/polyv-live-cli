/**
 * @fileoverview Unit tests for ChannelDetailsPopup component
 * @author Development Team
 * @since 5.3.0
 */

import { EventEmitter } from 'events';
import { ChannelDetailsPopup, ChannelDetailsPopupConfig } from './channel-details.popup';
import { ChannelStatusInfo } from './channel-status.panel';

// Mock blessed to avoid terminal dependency in tests
jest.mock('blessed', () => ({
  box: jest.fn(() => ({
    setContent: jest.fn(),
    key: jest.fn(),
    hide: jest.fn(),
    show: jest.fn(),
    focus: jest.fn(),
    destroy: jest.fn(),
    scrollTo: jest.fn(),
    screen: {
      render: jest.fn(),
      append: jest.fn(),
      remove: jest.fn()
    }
  })),
  screen: jest.fn(() => ({
    render: jest.fn(),
    append: jest.fn(),
    remove: jest.fn(),
    destroy: jest.fn()
  }))
}));

describe('ChannelDetailsPopup', () => {
  let eventBus: EventEmitter;
  let config: ChannelDetailsPopupConfig;
  let popup: ChannelDetailsPopup;
  let mockScreen: any;

  beforeEach(() => {
    eventBus = new EventEmitter();
    mockScreen = {
      render: jest.fn(),
      append: jest.fn(),
      remove: jest.fn(),
      destroy: jest.fn()
    };
    
    config = {
      screen: mockScreen,
      eventBus,
      showColors: true,
      refreshInterval: 5000
    };
  });

  afterEach(() => {
    // Clean up any fake timers that might be left over
    if (jest.isMockFunction(setTimeout)) {
      jest.useRealTimers();
    }
    
    if (popup) {
      popup.destroy();
    }
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      popup = new ChannelDetailsPopup(config);
      
      expect(popup).toBeInstanceOf(ChannelDetailsPopup);
      expect(popup.isShowing()).toBe(false);
      expect(popup.getCurrentChannel()).toBeNull();
    });

    it('should setup event listeners', () => {
      const eventBusSpy = jest.spyOn(eventBus, 'on');
      popup = new ChannelDetailsPopup(config);
      
      expect(eventBusSpy).toHaveBeenCalledWith('channel:updated', expect.any(Function));
      expect(eventBusSpy).toHaveBeenCalledWith('dashboard:refresh', expect.any(Function));
    });
  });

  describe('show method', () => {
    beforeEach(() => {
      popup = new ChannelDetailsPopup(config);
    });

    it('should show popup with channel details', () => {
      const channel: ChannelStatusInfo = {
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
      };

      popup.show(channel);

      expect(popup.isShowing()).toBe(true);
      expect(popup.getCurrentChannel()).toEqual(channel);
      expect(mockScreen.render).toHaveBeenCalled();
    });

    it('should emit shown event', () => {
      const emitSpy = jest.spyOn(eventBus, 'emit');
      const channel: ChannelStatusInfo = {
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
      };

      popup.show(channel);

      expect(emitSpy).toHaveBeenCalledWith('channelDetails:shown', expect.objectContaining({
        channelId: '12345',
        timestamp: expect.any(Date)
      }));
    });

    it('should start auto-refresh when configured', () => {
      jest.useFakeTimers();
      const channel: ChannelStatusInfo = {
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
      };
      
      const emitSpy = jest.spyOn(eventBus, 'emit');
      popup.show(channel);

      // Fast-forward time to trigger refresh
      jest.advanceTimersByTime(5000);

      expect(emitSpy).toHaveBeenCalledWith('channel:requestRefresh', expect.objectContaining({
        channelId: '12345'
      }));

      jest.useRealTimers();
    });
  });

  describe('hide method', () => {
    beforeEach(() => {
      popup = new ChannelDetailsPopup(config);
    });

    it('should hide popup', () => {
      const channel: ChannelStatusInfo = {
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
      };

      popup.show(channel);
      expect(popup.isShowing()).toBe(true);

      popup.hide();

      expect(popup.isShowing()).toBe(false);
      expect(popup.getCurrentChannel()).toBeNull();
      expect(mockScreen.render).toHaveBeenCalled();
    });

    it('should emit hidden event', () => {
      const emitSpy = jest.spyOn(eventBus, 'emit');
      const channel: ChannelStatusInfo = {
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
      };

      popup.show(channel);
      popup.hide();

      expect(emitSpy).toHaveBeenCalledWith('channelDetails:hidden', expect.objectContaining({
        channelId: '12345',
        timestamp: expect.any(Date)
      }));
    });

    it('should stop auto-refresh', () => {
      jest.useFakeTimers();
      const channel: ChannelStatusInfo = {
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
      };

      popup.show(channel);
      popup.hide();

      const emitSpy = jest.spyOn(eventBus, 'emit');
      
      // Fast-forward time - should not trigger refresh after hide
      jest.advanceTimersByTime(10000);

      expect(emitSpy).not.toHaveBeenCalledWith('channel:requestRefresh', expect.any(Object));

      jest.useRealTimers();
    });
  });

  describe('updateChannel method', () => {
    beforeEach(() => {
      popup = new ChannelDetailsPopup(config);
    });

    it('should update channel data when visible', () => {
      const originalChannel: ChannelStatusInfo = {
        channelId: '12345',
        name: 'Test Channel',
        status: 'waiting',
        statusText: 'Waiting',
        viewerCount: 0,
        maxViewer: 1000,
        publisher: 'Test Publisher',
        startTime: 1625000000000,
        endTime: 1625003600000,
        createdTime: 1624000000000,
        selected: false
      };

      const updatedChannel: ChannelStatusInfo = {
        ...originalChannel,
        status: 'live',
        statusText: 'Live',
        viewerCount: 150
      };

      popup.show(originalChannel);
      popup.updateChannel(updatedChannel);

      expect(popup.getCurrentChannel()).toEqual(updatedChannel);
      expect(mockScreen.render).toHaveBeenCalled();
    });

    it('should update channel data when not visible', () => {
      const channel: ChannelStatusInfo = {
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
      };

      popup.updateChannel(channel);

      expect(popup.getCurrentChannel()).toEqual(channel);
      // Should not render when not visible
      expect(mockScreen.render).not.toHaveBeenCalled();
    });
  });

  describe('content generation', () => {
    beforeEach(() => {
      popup = new ChannelDetailsPopup(config);
    });

    it('should format timing information correctly', () => {
      const channel: ChannelStatusInfo = {
        channelId: '12345',
        name: 'Test Channel',
        status: 'live',
        statusText: 'Live',
        viewerCount: 100,
        maxViewer: 1000,
        publisher: 'Test Publisher',
        startTime: 1625000000000, // 2021-06-30T02:00:00.000Z
        endTime: 1625007200000,   // 2021-06-30T04:00:00.000Z (2 hours later)
        createdTime: 1624000000000,
        selected: false
      };

      popup.show(channel);

      // Verify duration calculation (2 hours)
      const content = popup['getDetailsContent']();
      expect(content).toContain('2h 0m'); // Duration should be 2 hours
    });

    it('should handle zero timestamps gracefully', () => {
      const channel: ChannelStatusInfo = {
        channelId: '12345',
        name: 'Test Channel',
        status: 'live',
        statusText: 'Live',
        viewerCount: 100,
        maxViewer: 1000,
        publisher: 'Test Publisher',
        startTime: 0,
        endTime: 0,
        createdTime: 1624000000000,
        selected: false
      };

      popup.show(channel);

      const content = popup['getDetailsContent']();
      expect(content).toContain('Not set');
      expect(content).toContain('N/A'); // Duration should be N/A when times are 0
    });

    it('should calculate viewer utilization percentage', () => {
      const channel: ChannelStatusInfo = {
        channelId: '12345',
        name: 'Test Channel',
        status: 'live',
        statusText: 'Live',
        viewerCount: 250,
        maxViewer: 1000,
        publisher: 'Test Publisher',
        startTime: 1625000000000,
        endTime: 1625003600000,
        createdTime: 1624000000000,
        selected: false
      };

      popup.show(channel);

      const content = popup['getDetailsContent']();
      expect(content).toContain('25.0%'); // 250/1000 = 25%
    });

    it('should handle zero max viewers', () => {
      const channel: ChannelStatusInfo = {
        channelId: '12345',
        name: 'Test Channel',
        status: 'live',
        statusText: 'Live',
        viewerCount: 100,
        maxViewer: 0,
        publisher: 'Test Publisher',
        startTime: 1625000000000,
        endTime: 1625003600000,
        createdTime: 1624000000000,
        selected: false
      };

      popup.show(channel);

      const content = popup['getDetailsContent']();
      expect(content).toContain('N/A'); // Utilization should be N/A when maxViewer is 0
    });
  });

  describe('status mapping', () => {
    beforeEach(() => {
      popup = new ChannelDetailsPopup(config);
    });

    it('should map live status correctly', () => {
      const colors = popup['getStatusColors']('live');
      expect(colors.fg).toBe('green');
      expect(colors.icon).toBe('●');
    });

    it('should map waiting status correctly', () => {
      const colors = popup['getStatusColors']('waiting');
      expect(colors.fg).toBe('yellow');
      expect(colors.icon).toBe('◯');
    });

    it('should map ended status correctly', () => {
      const colors = popup['getStatusColors']('end');
      expect(colors.fg).toBe('gray');
      expect(colors.icon).toBe('◦');
    });

    it('should map banned status correctly', () => {
      const colors = popup['getStatusColors']('banpush');
      expect(colors.fg).toBe('red');
      expect(colors.icon).toBe('✖');
    });

    it('should map playback status correctly', () => {
      const colors = popup['getStatusColors']('playback');
      expect(colors.fg).toBe('blue');
      expect(colors.icon).toBe('▶');
    });

    it('should handle unknown status', () => {
      const colors = popup['getStatusColors']('unknown' as any);
      expect(colors.fg).toBe('white');
      expect(colors.icon).toBe('?');
    });

    it('should return correct publishing status descriptions', () => {
      const testCases = [
        { status: 'live' as const, expected: 'Broadcasting Live' },
        { status: 'waiting' as const, expected: 'Waiting to Start' },
        { status: 'end' as const, expected: 'Broadcast Ended' },
        { status: 'banpush' as const, expected: 'Banned from Broadcasting' },
        { status: 'playback' as const, expected: 'Playing Back' },
        { status: 'unStart' as const, expected: 'Not Started' }
      ];

      testCases.forEach(({ status, expected }) => {
        const channel: ChannelStatusInfo = {
          channelId: '12345',
          name: 'Test Channel',
          status,
          statusText: status,
          viewerCount: 100,
          maxViewer: 1000,
          publisher: 'Test Publisher',
          startTime: 1625000000000,
          endTime: 1625003600000,
          createdTime: 1624000000000,
          selected: false
        };

        popup.show(channel);
        const publishingStatus = popup['getPublishingStatus']();
        expect(publishingStatus).toBe(expected);
      });
    });
  });

  describe('event handling', () => {
    beforeEach(() => {
      popup = new ChannelDetailsPopup(config);
    });

    it('should handle channel updated event when visible', () => {
      const channel: ChannelStatusInfo = {
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
      };

      popup.show(channel);

      const updatedChannel = { ...channel, viewerCount: 200 };
      eventBus.emit('channel:updated', { channelId: '12345', channel: updatedChannel });

      expect(popup.getCurrentChannel()?.viewerCount).toBe(200);
    });

    it('should ignore channel updated event for different channel', () => {
      const channel: ChannelStatusInfo = {
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
      };

      popup.show(channel);

      const otherChannel = { ...channel, channelId: '67890', viewerCount: 200 };
      eventBus.emit('channel:updated', { channelId: '67890', channel: otherChannel });

      expect(popup.getCurrentChannel()?.viewerCount).toBe(100); // Should remain unchanged
    });

    it('should handle dashboard refresh event', () => {
      const emitSpy = jest.spyOn(eventBus, 'emit');
      const channel: ChannelStatusInfo = {
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
      };

      popup.show(channel);
      eventBus.emit('dashboard:refresh');

      expect(emitSpy).toHaveBeenCalledWith('channel:requestRefresh', expect.objectContaining({
        channelId: '12345'
      }));
    });
  });

  describe('copy functionality', () => {
    beforeEach(() => {
      popup = new ChannelDetailsPopup(config);
    });

    it('should emit copy event with channel info', () => {
      // Use fake timers to avoid real setTimeout keeping Jest open
      jest.useFakeTimers();
      
      const emitSpy = jest.spyOn(eventBus, 'emit');
      const channel: ChannelStatusInfo = {
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
      };

      popup.show(channel);
      popup['copyChannelInfo']();

      expect(emitSpy).toHaveBeenCalledWith('channelDetails:copied', expect.objectContaining({
        channelId: '12345',
        info: expect.stringContaining('Channel: Test Channel'),
        timestamp: expect.any(Date)
      }));
      
      // Clean up fake timers
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should handle copy when no channel is selected', () => {
      const emitSpy = jest.spyOn(eventBus, 'emit');
      popup['copyChannelInfo']();

      expect(emitSpy).not.toHaveBeenCalledWith('channelDetails:copied', expect.any(Object));
    });
  });

  describe('destroy method', () => {
    beforeEach(() => {
      popup = new ChannelDetailsPopup(config);
    });

    it('should clean up resources', () => {
      const emitSpy = jest.spyOn(eventBus, 'emit');
      const channel: ChannelStatusInfo = {
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
      };

      popup.show(channel);
      popup.destroy();

      expect(popup.isShowing()).toBe(false);
      expect(popup.getCurrentChannel()).toBeNull();
      expect(emitSpy).toHaveBeenCalledWith('channelDetails:destroyed', expect.objectContaining({
        timestamp: expect.any(Date)
      }));
    });

    it('should stop auto-refresh on destroy', () => {
      jest.useFakeTimers();
      const channel: ChannelStatusInfo = {
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
      };

      popup.show(channel);
      popup.destroy();

      const emitSpy = jest.spyOn(eventBus, 'emit');
      
      // Fast-forward time - should not trigger refresh after destroy
      jest.advanceTimersByTime(10000);

      expect(emitSpy).not.toHaveBeenCalledWith('channel:requestRefresh', expect.any(Object));

      jest.useRealTimers();
    });
  });

  describe('configuration options', () => {
    it('should disable colors when showColors is false', () => {
      const noColorConfig = { ...config, showColors: false };
      popup = new ChannelDetailsPopup(noColorConfig);

      const channel: ChannelStatusInfo = {
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
      };

      popup.show(channel);
      const headerContent = popup['getHeaderContent']();
      
      // When colors are disabled, should not include color-specific content
      expect(headerContent).toContain('Live'); // Still shows status text
      expect(headerContent).not.toContain('●'); // But not the icon when colors disabled
    });

    it('should disable auto-refresh when refreshInterval is 0', () => {
      jest.useFakeTimers();
      const noRefreshConfig = { ...config, refreshInterval: 0 };
      popup = new ChannelDetailsPopup(noRefreshConfig);

      const channel: ChannelStatusInfo = {
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
      };

      const emitSpy = jest.spyOn(eventBus, 'emit');
      popup.show(channel);

      // Fast-forward time - should not trigger refresh when interval is 0
      jest.advanceTimersByTime(10000);

      expect(emitSpy).not.toHaveBeenCalledWith('channel:requestRefresh', expect.any(Object));

      jest.useRealTimers();
    });
  });
});