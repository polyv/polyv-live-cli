/**
 * @fileoverview Unit tests for formatter utilities
 * @author Development Team
 * @since 3.4.0
 */

import {
  formatStreamStatusForTable,
  formatStreamStatusForJson,
  formatStatusWithIcon,
  formatDuration,
  formatBandwidth,
  formatCompactStatus,
  formatTable,
  formatJSON
} from './formatter';
import { StreamStatusInfo } from '../types/stream';

describe('Formatter Utilities', () => {
  describe('formatStreamStatusForTable', () => {
    it('should format basic stream status for table display', () => {
      const statusInfo: StreamStatusInfo = {
        channelId: '3151318',
        status: 'live',
        statusText: 'Live',
        isLive: true,
        lastUpdated: new Date('2025-07-04T10:30:00Z')
      };

      const result = formatStreamStatusForTable(statusInfo);

      expect(result).toEqual({
        'Channel ID': '3151318',
        'Status': '🟢 Live',
        'Last Updated': statusInfo.lastUpdated.toLocaleString()
      });
    });

    it('should format live stream with duration and metrics', () => {
      const statusInfo: StreamStatusInfo = {
        channelId: '3151318',
        status: 'live',
        statusText: 'Live',
        isLive: true,
        duration: 3661000, // 1 hour, 1 minute, 1 second
        durationText: '1h 1m 1s',
        metrics: {
          fps: 30,
          lfr: 0.5,
          bandwidth: 2048000,
          bandwidthText: '2.00 Mbps'
        },
        lastUpdated: new Date('2025-07-04T10:30:00Z')
      };

      const result = formatStreamStatusForTable(statusInfo);

      expect(result).toEqual({
        'Channel ID': '3151318',
        'Status': '🟢 Live',
        'Duration': '1h 1m 1s',
        'FPS': '30.00',
        'Frame Loss': '0.50%',
        'Bandwidth': '2.00 Mbps',
        'Last Updated': statusInfo.lastUpdated.toLocaleString()
      });
    });

    it('should format stream with network information', () => {
      const statusInfo: StreamStatusInfo = {
        channelId: '3151318',
        status: 'live',
        statusText: 'Live',
        isLive: true,
        network: {
          deployAddress: '10.1.1.1',
          inAddress: '10.1.1.2',
          streamName: 'test-stream'
        },
        lastUpdated: new Date('2025-07-04T10:30:00Z')
      };

      const result = formatStreamStatusForTable(statusInfo);

      expect(result).toEqual({
        'Channel ID': '3151318',
        'Status': '🟢 Live',
        'Deploy Address': '10.1.1.1',
        'Input Address': '10.1.1.2',
        'Stream Name': 'test-stream',
        'Last Updated': statusInfo.lastUpdated.toLocaleString()
      });
    });

    it('should format stream with error information', () => {
      const statusInfo: StreamStatusInfo = {
        channelId: '3151318',
        status: 'error',
        statusText: 'Channel Error',
        isLive: false,
        error: {
          code: 'CHANNEL_NOT_FOUND',
          message: 'Channel does not exist'
        },
        lastUpdated: new Date('2025-07-04T10:30:00Z')
      };

      const result = formatStreamStatusForTable(statusInfo);

      expect(result).toEqual({
        'Channel ID': '3151318',
        'Status': '🔴 Channel Error',
        'Error': 'CHANNEL_NOT_FOUND: Channel does not exist',
        'Last Updated': statusInfo.lastUpdated.toLocaleString()
      });
    });

    it('should skip frame loss when value is 0', () => {
      const statusInfo: StreamStatusInfo = {
        channelId: '3151318',
        status: 'live',
        statusText: 'Live',
        isLive: true,
        metrics: {
          fps: 30,
          lfr: 0,
          bandwidth: 2048000,
          bandwidthText: '2.00 Mbps'
        },
        lastUpdated: new Date('2025-07-04T10:30:00Z')
      };

      const result = formatStreamStatusForTable(statusInfo);

      expect(result['Frame Loss']).toBeUndefined();
      expect(result['FPS']).toBe('30.00');
      expect(result['Bandwidth']).toBe('2.00 Mbps');
    });
  });

  describe('formatStreamStatusForJson', () => {
    it('should return the complete status object for JSON', () => {
      const statusInfo: StreamStatusInfo = {
        channelId: '3151318',
        status: 'live',
        statusText: 'Live',
        isLive: true,
        duration: 3600000,
        durationText: '1h 0m 0s',
        lastUpdated: new Date('2025-07-04T10:30:00Z')
      };

      const result = formatStreamStatusForJson(statusInfo);

      expect(result).toBe(statusInfo);
      expect(result).toEqual(statusInfo);
    });
  });

  describe('formatStatusWithIcon', () => {
    it('should format live status with green icon', () => {
      const result = formatStatusWithIcon('live', 'Live');
      expect(result).toBe('🟢 Live');
    });

    it('should format stopped status with black icon', () => {
      const result = formatStatusWithIcon('stopped', 'Stopped');
      expect(result).toBe('⚫ Stopped');
    });

    it('should format waiting status with yellow icon', () => {
      const result = formatStatusWithIcon('waiting', 'Waiting');
      expect(result).toBe('🟡 Waiting');
    });

    it('should format error status with red icon', () => {
      const result = formatStatusWithIcon('error', 'Channel Error');
      expect(result).toBe('🔴 Channel Error');
    });

    it('should format unknown status with white icon', () => {
      const result = formatStatusWithIcon('unknown', 'Unknown Status');
      expect(result).toBe('⚪ Unknown Status');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds only', () => {
      const result = formatDuration(45000); // 45 seconds
      expect(result).toBe('45s');
    });

    it('should format minutes and seconds', () => {
      const result = formatDuration(125000); // 2 minutes 5 seconds
      expect(result).toBe('2m 5s');
    });

    it('should format hours, minutes and seconds', () => {
      const result = formatDuration(3661000); // 1 hour 1 minute 1 second
      expect(result).toBe('1h 1m 1s');
    });

    it('should format exact hours', () => {
      const result = formatDuration(7200000); // 2 hours
      expect(result).toBe('2h 0m 0s');
    });

    it('should format exact minutes', () => {
      const result = formatDuration(180000); // 3 minutes
      expect(result).toBe('3m 0s');
    });

    it('should handle zero duration', () => {
      const result = formatDuration(0);
      expect(result).toBe('0s');
    });
  });

  describe('formatBandwidth', () => {
    it('should format zero bandwidth', () => {
      const result = formatBandwidth(0);
      expect(result).toBe('0 bps');
    });

    it('should format bytes per second', () => {
      const result = formatBandwidth(500);
      expect(result).toBe('500.00 bps');
    });

    it('should format kilobytes per second', () => {
      const result = formatBandwidth(1536); // 1.5 Kbps
      expect(result).toBe('1.50 Kbps');
    });

    it('should format megabytes per second', () => {
      const result = formatBandwidth(2097152); // 2 Mbps
      expect(result).toBe('2.00 Mbps');
    });

    it('should format gigabytes per second', () => {
      const result = formatBandwidth(2147483648); // 2 Gbps
      expect(result).toBe('2.00 Gbps');
    });

    it('should handle fractional values', () => {
      const result = formatBandwidth(1638400); // 1.5625 Mbps
      expect(result).toBe('1.56 Mbps');
    });
  });

  describe('formatCompactStatus', () => {
    it('should format live status with duration', () => {
      const statusInfo: StreamStatusInfo = {
        channelId: '3151318',
        status: 'live',
        statusText: 'Live',
        isLive: true,
        durationText: '1h 30m 15s',
        lastUpdated: new Date()
      };

      const result = formatCompactStatus(statusInfo);
      expect(result).toBe('🟢 Live (1h 30m 15s)');
    });

    it('should format stopped status without duration', () => {
      const statusInfo: StreamStatusInfo = {
        channelId: '3151318',
        status: 'stopped',
        statusText: 'Stopped',
        isLive: false,
        lastUpdated: new Date()
      };

      const result = formatCompactStatus(statusInfo);
      expect(result).toBe('⚫ Stopped');
    });

    it('should format waiting status', () => {
      const statusInfo: StreamStatusInfo = {
        channelId: '3151318',
        status: 'waiting',
        statusText: 'Waiting to Start',
        isLive: false,
        lastUpdated: new Date()
      };

      const result = formatCompactStatus(statusInfo);
      expect(result).toBe('🟡 Waiting to Start');
    });

    it('should format error status', () => {
      const statusInfo: StreamStatusInfo = {
        channelId: '3151318',
        status: 'error',
        statusText: 'Push Banned',
        isLive: false,
        lastUpdated: new Date()
      };

      const result = formatCompactStatus(statusInfo);
      expect(result).toBe('🔴 Push Banned');
    });

    it('should handle live status without duration text', () => {
      const statusInfo: StreamStatusInfo = {
        channelId: '3151318',
        status: 'live',
        statusText: 'Live',
        isLive: true,
        // No durationText provided
        lastUpdated: new Date()
      };

      const result = formatCompactStatus(statusInfo);
      expect(result).toBe('🟢 Live');
    });
  });

  describe('formatTable', () => {
    it('should format data as a table with headers', () => {
      const options = {
        headers: ['Channel ID', 'Status', 'FPS'],
        data: [
          ['channel-1', 'Live', '30'],
          ['channel-2', 'Stopped', '0'],
          ['channel-3', 'Live', '25']
        ]
      };

      const result = formatTable(options);

      expect(result).toContain('Channel ID');
      expect(result).toContain('Status');
      expect(result).toContain('FPS');
      expect(result).toContain('channel-1');
      expect(result).toContain('Live');
      expect(result).toContain('30');
    });

    it('should handle empty data array', () => {
      const options = {
        headers: ['Column 1', 'Column 2'],
        data: []
      };

      const result = formatTable(options);

      expect(result).toContain('Column 1');
      expect(result).toContain('Column 2');
      // Should still create a table structure even with no data
      expect(typeof result).toBe('string');
    });

    it('should handle single row of data', () => {
      const options = {
        headers: ['ID', 'Name', 'Value'],
        data: [['1', 'Test Channel', '1500']]
      };

      const result = formatTable(options);

      expect(result).toContain('ID');
      expect(result).toContain('Name');
      expect(result).toContain('Value');
      expect(result).toContain('Test Channel');
      expect(result).toContain('1500');
    });

    it('should handle multiple columns and rows', () => {
      const options = {
        headers: ['A', 'B', 'C', 'D'],
        data: [
          ['1', '2', '3', '4'],
          ['5', '6', '7', '8'],
          ['9', '10', '11', '12']
        ]
      };

      const result = formatTable(options);

      expect(result).toContain('A');
      expect(result).toContain('B');
      expect(result).toContain('C');
      expect(result).toContain('D');
      expect(result).toContain('1');
      expect(result).toContain('12');
    });
  });

  describe('formatJSON', () => {
    it('should format a simple object as JSON', () => {
      const data = {
        channelId: 'test-123',
        status: 'live',
        fps: 30
      };

      const result = formatJSON(data);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual(data);
      expect(result).toContain('"channelId": "test-123"');
      expect(result).toContain('"status": "live"');
      expect(result).toContain('"fps": 30');
    });

    it('should format an array as JSON', () => {
      const data = ['item1', 'item2', 'item3'];

      const result = formatJSON(data);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual(data);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it('should format nested objects as JSON', () => {
      const data = {
        stream: {
          channelId: 'test-456',
          metrics: {
            fps: 30,
            bandwidth: 1500000
          },
          network: {
            address: '192.168.1.1'
          }
        }
      };

      const result = formatJSON(data);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual(data);
      expect(parsed.stream.metrics.fps).toBe(30);
      expect(parsed.stream.network.address).toBe('192.168.1.1');
    });

    it('should format primitive values as JSON', () => {
      expect(formatJSON('hello')).toBe('"hello"');
      expect(formatJSON(42)).toBe('42');
      expect(formatJSON(true)).toBe('true');
      expect(formatJSON(false)).toBe('false');
      expect(formatJSON(null)).toBe('null');
    });

    it('should format arrays with mixed types', () => {
      const data = ['string', 123, true, null, { key: 'value' }];

      const result = formatJSON(data);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual(data);
      expect(parsed[0]).toBe('string');
      expect(parsed[1]).toBe(123);
      expect(parsed[2]).toBe(true);
      expect(parsed[3]).toBe(null);
      expect(parsed[4]).toEqual({ key: 'value' });
    });

    it('should format empty object and array', () => {
      expect(formatJSON({})).toBe('{}');
      expect(formatJSON([])).toBe('[]');
    });

    it('should handle undefined values in objects', () => {
      const data = {
        defined: 'value',
        undefined: undefined
      };

      const result = formatJSON(data);
      const parsed = JSON.parse(result);

      // JSON.stringify removes undefined values
      expect(parsed.defined).toBe('value');
      expect('undefined' in parsed).toBe(false);
    });
  });
});