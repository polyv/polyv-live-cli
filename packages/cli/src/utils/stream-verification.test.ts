/**
 * @fileoverview Unit tests for stream verification utilities
 * @author Development Team
 * @since 4.2.0
 */

import {
  generateVerificationId,
  extractQualityMetrics,
  analyzeQualityMetrics,
  createVerificationPoint,
  calculateAverageMetrics,
  generateVerificationSummary,
  generateViewerLinks,
  createVerificationResult,
  createVerificationReport,
  saveVerificationReport,
  formatFPS,
  formatLatency,
  getStatusEmoji,
  getSeverityEmoji,
  DEFAULT_QUALITY_THRESHOLDS,
  DEFAULT_VERIFICATION_SETTINGS
} from './stream-verification';
import { StreamStatusInfo, QualityMetrics, VerificationPoint } from '../types/stream';
import { formatBandwidth } from './formatter';
import * as fs from 'fs';

// Mock fs for saveVerificationReport tests
jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn()
  }
}));

describe('Stream Verification Utilities', () => {
  describe('generateVerificationId', () => {
    it('should generate unique verification ID with correct format', () => {
      const id1 = generateVerificationId();
      const id2 = generateVerificationId();
      
      expect(id1).toMatch(/^verify_\d+_[a-f0-9]{8}$/);
      expect(id2).toMatch(/^verify_\d+_[a-f0-9]{8}$/);
      expect(id1).not.toBe(id2);
    });

    it('should generate verification ID starting with verify_', () => {
      const id = generateVerificationId();
      expect(id).toMatch(/^verify_/);
    });
  });

  describe('extractQualityMetrics', () => {
    it('should extract metrics from complete status info', () => {
      const statusInfo: StreamStatusInfo = {
        channelId: '3151318',
        status: 'live',
        statusText: 'Live',
        isLive: true,
        lastUpdated: new Date(),
        metrics: {
          fps: 30,
          lfr: 1.5,
          bandwidth: 2048000,
          bandwidthText: '2.00 Mbps'
        }
      };

      const metrics = extractQualityMetrics(statusInfo);

      expect(metrics).toEqual({
        fps: 30,
        bandwidth: 2048000,
        lfr: 1.5
      });
    });

    it('should handle missing metrics with default values', () => {
      const statusInfo: StreamStatusInfo = {
        channelId: '3151318',
        status: 'stopped',
        statusText: 'Stopped',
        isLive: false,
        lastUpdated: new Date()
      };

      const metrics = extractQualityMetrics(statusInfo);

      expect(metrics).toEqual({
        fps: 0,
        bandwidth: 0,
        lfr: 0
      });
    });

    it('should handle partial metrics', () => {
      const statusInfo: StreamStatusInfo = {
        channelId: '3151318',
        status: 'live',
        statusText: 'Live',
        isLive: true,
        lastUpdated: new Date(),
        metrics: {
          fps: 25,
          lfr: 0,
          bandwidth: 1500000,
          bandwidthText: '1.50 Mbps'
        }
      };

      const metrics = extractQualityMetrics(statusInfo);

      expect(metrics).toEqual({
        fps: 25,
        bandwidth: 1500000,
        lfr: 0
      });
    });
  });

  describe('analyzeQualityMetrics', () => {
    it('should identify no issues for healthy metrics', () => {
      const metrics: QualityMetrics = {
        fps: 30,
        bandwidth: 2048000,
        lfr: 1
      };

      const issues = analyzeQualityMetrics(metrics);

      expect(issues).toHaveLength(0);
    });

    it('should identify low FPS warning', () => {
      const metrics: QualityMetrics = {
        fps: 12, // Below default threshold of 15
        bandwidth: 2048000,
        lfr: 1
      };

      const issues = analyzeQualityMetrics(metrics);

      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatchObject({
        type: 'fps_low',
        severity: 'warning',
        message: expect.stringContaining('FPS is below threshold: 12.0 < 15')
      });
    });

    it('should identify critical FPS issue', () => {
      const metrics: QualityMetrics = {
        fps: 5, // Below half of threshold (critical)
        bandwidth: 2048000,
        lfr: 1
      };

      const issues = analyzeQualityMetrics(metrics);

      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatchObject({
        type: 'fps_low',
        severity: 'critical',
        message: expect.stringContaining('FPS is below threshold: 5.0 < 15')
      });
    });

    it('should identify low bandwidth warning', () => {
      const metrics: QualityMetrics = {
        fps: 30,
        bandwidth: 500000, // Below default threshold of 1Mbps
        lfr: 1
      };

      const issues = analyzeQualityMetrics(metrics);

      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatchObject({
        type: 'bandwidth_low',
        severity: 'warning'
      });
    });

    it('should identify multiple issues', () => {
      const metrics: QualityMetrics = {
        fps: 10, // Low FPS
        bandwidth: 300000, // Low bandwidth
        lfr: 8 // High frame loss rate
      };

      const issues = analyzeQualityMetrics(metrics);

      expect(issues).toHaveLength(3);
      expect(issues.map(i => i.type)).toContain('fps_low');
      expect(issues.map(i => i.type)).toContain('bandwidth_low');
      expect(issues.map(i => i.type)).toContain('other'); // LFR issue
    });

    it('should use custom thresholds', () => {
      const metrics: QualityMetrics = {
        fps: 20,
        bandwidth: 1500000,
        lfr: 2
      };

      const customThresholds = {
        FPS_MINIMUM: 25 as 15,
        BANDWIDTH_MINIMUM: 2000000 as 1000000,
        LATENCY_MAXIMUM: 5000 as 5000,
        LFR_MAXIMUM: 3 as 5
      };

      const issues = analyzeQualityMetrics(metrics, customThresholds);

      expect(issues).toHaveLength(2); // FPS and bandwidth below custom thresholds
      expect(issues.map(i => i.type)).toContain('fps_low');
      expect(issues.map(i => i.type)).toContain('bandwidth_low');
    });
  });

  describe('createVerificationPoint', () => {
    it('should create healthy verification point', () => {
      const statusInfo: StreamStatusInfo = {
        channelId: '3151318',
        status: 'live',
        statusText: 'Live',
        isLive: true,
        lastUpdated: new Date(),
        metrics: {
          fps: 30,
          lfr: 1,
          bandwidth: 2048000,
          bandwidthText: '2.00 Mbps'
        }
      };

      const point = createVerificationPoint(1, statusInfo, 15);

      expect(point).toMatchObject({
        checkNumber: 1,
        status: 'healthy',
        metrics: {
          fps: 30,
          bandwidth: 2048000,
          lfr: 1
        },
        issues: []
      });
      expect(point.timestamp).toBeInstanceOf(Date);
    });

    it('should create warning verification point', () => {
      const statusInfo: StreamStatusInfo = {
        channelId: '3151318',
        status: 'live',
        statusText: 'Live',
        isLive: true,
        lastUpdated: new Date(),
        metrics: {
          fps: 12, // Below threshold
          lfr: 1,
          bandwidth: 2048000,
          bandwidthText: '2.00 Mbps'
        }
      };

      const point = createVerificationPoint(2, statusInfo, 15);

      expect(point).toMatchObject({
        checkNumber: 2,
        status: 'warning'
      });
      expect(point.issues).toHaveLength(1);
      expect(point.issues[0]?.severity).toBe('warning');
    });

    it('should create error verification point for critical issues', () => {
      const statusInfo: StreamStatusInfo = {
        channelId: '3151318',
        status: 'live',
        statusText: 'Live',
        isLive: true,
        lastUpdated: new Date(),
        metrics: {
          fps: 5, // Critical threshold
          lfr: 1,
          bandwidth: 200000, // Critical bandwidth
          bandwidthText: '0.20 Mbps'
        }
      };

      const point = createVerificationPoint(3, statusInfo, 15);

      expect(point).toMatchObject({
        checkNumber: 3,
        status: 'error'
      });
      expect(point.issues.some(i => i.severity === 'critical')).toBe(true);
    });
  });

  describe('calculateAverageMetrics', () => {
    it('should calculate average metrics from multiple points', () => {
      const points: VerificationPoint[] = [
        {
          checkNumber: 1,
          timestamp: new Date(),
          status: 'healthy',
          metrics: { fps: 30, bandwidth: 2000000, lfr: 1 },
          issues: []
        },
        {
          checkNumber: 2,
          timestamp: new Date(),
          status: 'healthy',
          metrics: { fps: 28, bandwidth: 1800000, lfr: 2 },
          issues: []
        },
        {
          checkNumber: 3,
          timestamp: new Date(),
          status: 'warning',
          metrics: { fps: 25, bandwidth: 1600000, lfr: 3 },
          issues: []
        }
      ];

      const averages = calculateAverageMetrics(points);

      expect(averages).toEqual({
        fps: (30 + 28 + 25) / 3,
        bandwidth: (2000000 + 1800000 + 1600000) / 3,
        lfr: (1 + 2 + 3) / 3,
        latency: 0 // No latency data
      });
    });

    it('should return zero metrics for empty points array', () => {
      const averages = calculateAverageMetrics([]);

      expect(averages).toEqual({
        fps: 0,
        bandwidth: 0,
        lfr: 0
      });
    });

    it('should handle points with missing optional metrics', () => {
      const points: VerificationPoint[] = [
        {
          checkNumber: 1,
          timestamp: new Date(),
          status: 'healthy',
          metrics: { fps: 30, bandwidth: 2000000 }, // No lfr or latency
          issues: []
        }
      ];

      const averages = calculateAverageMetrics(points);

      expect(averages.fps).toBe(30);
      expect(averages.bandwidth).toBe(2000000);
      expect(averages.lfr).toBe(0);
      expect(averages.latency).toBe(0);
    });
  });

  describe('generateVerificationSummary', () => {
    it('should generate excellent summary for all healthy checks', () => {
      const healthyPoints: VerificationPoint[] = Array.from({ length: 10 }, (_, i) => ({
        checkNumber: i + 1,
        timestamp: new Date(),
        status: 'healthy' as const,
        metrics: { fps: 30, bandwidth: 2000000, lfr: 1 },
        issues: []
      }));

      const summary = generateVerificationSummary(healthyPoints, 15);

      expect(summary).toMatchObject({
        overallStatus: 'excellent',
        reliability: 100,
        totalIssues: 0
      });
      expect(summary.recommendations).toContain('Stream quality is performing well');
    });

    it('should generate poor summary for many failed checks', () => {
      const poorPoints: VerificationPoint[] = Array.from({ length: 10 }, (_, i) => ({
        checkNumber: i + 1,
        timestamp: new Date(),
        status: 'error' as const,
        metrics: { fps: 5, bandwidth: 200000, lfr: 10 },
        issues: [
          {
            timestamp: new Date(),
            type: 'fps_low' as const,
            severity: 'critical' as const,
            message: 'Critical FPS issue',
            metrics: { fps: 5 }
          }
        ]
      }));

      const summary = generateVerificationSummary(poorPoints, 15);

      expect(summary).toMatchObject({
        overallStatus: 'poor',
        reliability: 0,
        totalIssues: 10
      });
      expect(summary.recommendations.length).toBeGreaterThan(1);
    });

    it('should generate recommendations based on issues', () => {
      const mixedPoints: VerificationPoint[] = [
        {
          checkNumber: 1,
          timestamp: new Date(),
          status: 'warning',
          metrics: { fps: 12, bandwidth: 500000, lfr: 1 },
          issues: [
            {
              timestamp: new Date(),
              type: 'fps_low',
              severity: 'warning',
              message: 'Low FPS',
              metrics: { fps: 12 }
            }
          ]
        }
      ];

      const summary = generateVerificationSummary(mixedPoints, 15);

      expect(summary.recommendations).toContain('Consider increasing source video quality or encoding settings');
      expect(summary.recommendations).toContain('Check network connection and increase bitrate');
    });

    it('should return no data message for empty points', () => {
      const summary = generateVerificationSummary([], 15);

      expect(summary).toMatchObject({
        overallStatus: 'poor',
        reliability: 0,
        totalIssues: 0
      });
      expect(summary.recommendations).toContain('No data available for analysis');
    });
  });

  describe('generateViewerLinks', () => {
    it('should generate correct viewer links for a channel', () => {
      const links = generateViewerLinks('3151318');

      expect(links).toHaveLength(3);
      expect(links).toEqual([
        {
          protocol: 'HLS',
          url: 'https://player.polyv.net/live/3151318',
          description: 'Web player (recommended for browsers)'
        },
        {
          protocol: 'RTMP',
          url: 'rtmp://live.polyv.net/live/3151318',
          description: 'RTMP stream (for media players)'
        },
        {
          protocol: 'HTTP-FLV',
          url: 'https://live.polyv.net/live/3151318.flv',
          description: 'HTTP-FLV stream (low latency)'
        }
      ]);
    });

    it('should handle different channel IDs correctly', () => {
      const links = generateViewerLinks('test123');

      expect(links[0]?.url).toBe('https://player.polyv.net/live/test123');
      expect(links[1]?.url).toBe('rtmp://live.polyv.net/live/test123');
      expect(links[2]?.url).toBe('https://live.polyv.net/live/test123.flv');
    });
  });

  describe('createVerificationResult', () => {
    it('should create complete verification result', () => {
      const channelId = '3151318';
      const verificationId = 'verify_123_abc';
      const startTime = new Date('2025-07-04T10:00:00Z');
      const points: VerificationPoint[] = [
        {
          checkNumber: 1,
          timestamp: new Date(),
          status: 'healthy',
          metrics: { fps: 30, bandwidth: 2000000, lfr: 1 },
          issues: []
        }
      ];

      const result = createVerificationResult(channelId, verificationId, startTime, points, 15);

      expect(result).toMatchObject({
        channelId,
        verificationId,
        startTime,
        totalChecks: 1,
        successfulChecks: 1,
        failedChecks: 0
      });
      expect(result.endTime).toBeInstanceOf(Date);
      expect(result.averageMetrics.fps).toBe(30);
      expect(result.viewerLinks).toHaveLength(3);
      expect(result.summary.overallStatus).toBe('excellent');
    });

    it('should calculate failed checks correctly', () => {
      const points: VerificationPoint[] = [
        {
          checkNumber: 1,
          timestamp: new Date(),
          status: 'healthy',
          metrics: { fps: 30, bandwidth: 2000000, lfr: 1 },
          issues: []
        },
        {
          checkNumber: 2,
          timestamp: new Date(),
          status: 'error',
          metrics: { fps: 5, bandwidth: 200000, lfr: 10 },
          issues: []
        }
      ];

      const result = createVerificationResult('3151318', 'verify_123', new Date(), points, 15);

      expect(result.totalChecks).toBe(2);
      expect(result.successfulChecks).toBe(1);
      expect(result.failedChecks).toBe(1);
    });
  });

  describe('createVerificationReport', () => {
    it('should create verification report with metadata', () => {
      const mockResult = {
        channelId: '3151318',
        verificationId: 'verify_123',
        startTime: new Date(),
        endTime: new Date(),
        totalChecks: 6,
        successfulChecks: 5,
        failedChecks: 1,
        averageMetrics: { fps: 28, bandwidth: 1800000, lfr: 1.5 },
        qualityIssues: [],
        viewerLinks: [],
        summary: {
          overallStatus: 'good' as const,
          reliability: 85,
          averageQuality: { fps: 28, bandwidth: 1800000 },
          totalIssues: 1,
          recommendations: []
        }
      };

      const report = createVerificationReport(mockResult, 60, 10, '4.2.0');

      expect(report.metadata).toMatchObject({
        channelId: '3151318',
        testDuration: 60,
        testInterval: 10,
        version: '4.2.0'
      });
      expect(report.metadata.timestamp).toBeInstanceOf(Date);
      expect(report.summary).toBe(mockResult.summary);
      expect(report.timeline).toEqual([]);
      expect(report.issues).toBe(mockResult.qualityIssues);
      expect(report.viewerLinks).toBe(mockResult.viewerLinks);
    });

    it('should use default version when not provided', () => {
      const mockResult = {
        channelId: '3151318',
        summary: {} as any,
        qualityIssues: [],
        viewerLinks: []
      } as any;

      const report = createVerificationReport(mockResult, 60, 10);

      expect(report.metadata.version).toBe('1.0.0');
    });
  });

  describe('saveVerificationReport', () => {
    let mockWriteFile: jest.MockedFunction<any>;

    beforeEach(() => {
      const fsMock = fs as any;
      mockWriteFile = fsMock.promises.writeFile as jest.MockedFunction<any>;
      mockWriteFile.mockClear();
    });

    it('should save verification report to file', async () => {
      const report = {
        metadata: {
          channelId: '3151318',
          testDuration: 60,
          testInterval: 10,
          timestamp: new Date(),
          version: '4.2.0'
        },
        summary: {} as any,
        timeline: [],
        issues: [],
        viewerLinks: []
      };

      mockWriteFile.mockResolvedValue(undefined);

      await saveVerificationReport(report, '/path/to/report.json');

      expect(mockWriteFile).toHaveBeenCalledWith(
        '/path/to/report.json',
        JSON.stringify(report, null, 2),
        'utf8'
      );
    });

    it('should throw error when file write fails', async () => {
      const report = {} as any;
      const writeError = new Error('Permission denied');

      mockWriteFile.mockRejectedValue(writeError);

      await expect(saveVerificationReport(report, '/invalid/path.json'))
        .rejects.toThrow('Failed to save verification report: Permission denied');
    });
  });

  describe('formatting utilities', () => {
    describe('formatBandwidth', () => {
      it('should format zero bandwidth', () => {
        expect(formatBandwidth(0)).toBe('0 bps');
      });

      it('should format bandwidth in bps', () => {
        expect(formatBandwidth(512)).toBe('512.00 bps');
      });

      it('should format bandwidth exactly at 1000 boundary', () => {
        expect(formatBandwidth(1000)).toBe('1000.00 bps');
      });

      it('should format bandwidth in Kbps', () => {
        expect(formatBandwidth(1024000)).toBe('1000.00 Kbps');
      });

      it('should format bandwidth in Mbps', () => {
        expect(formatBandwidth(2048000)).toBe('1.95 Mbps');
      });

      it('should format bandwidth in Gbps', () => {
        expect(formatBandwidth(2147483648)).toBe('2.00 Gbps');
      });

      it('should format very large bandwidth at maximum unit', () => {
        expect(formatBandwidth(999999999999)).toBe('931.32 Gbps');
      });
    });

    describe('formatFPS', () => {
      it('should format FPS with one decimal place', () => {
        expect(formatFPS(30)).toBe('30.0 FPS');
        expect(formatFPS(29.97)).toBe('30.0 FPS');
        expect(formatFPS(23.976)).toBe('24.0 FPS');
      });

      it('should handle zero FPS', () => {
        expect(formatFPS(0)).toBe('0.0 FPS');
      });
    });

    describe('formatLatency', () => {
      it('should format latency in milliseconds', () => {
        expect(formatLatency(150.7)).toBe('151ms');
        expect(formatLatency(1000)).toBe('1000ms');
      });

      it('should handle undefined latency', () => {
        expect(formatLatency(undefined)).toBe('N/A');
        expect(formatLatency()).toBe('N/A');
      });

      it('should handle zero and negative latency', () => {
        expect(formatLatency(0)).toBe('N/A'); // 0 is falsy, so returns 'N/A'
        expect(formatLatency(-5)).toBe('-5ms');
      });

      it('should handle fractional latency rounding', () => {
        expect(formatLatency(123.4)).toBe('123ms');
        expect(formatLatency(123.6)).toBe('124ms');
      });

      it('should handle all falsy latency values', () => {
        expect(formatLatency(null as any)).toBe('N/A');
        expect(formatLatency(false as any)).toBe('N/A');
        expect(formatLatency('' as any)).toBe('N/A');
        expect(formatLatency(NaN)).toBe('N/A');
      });
    });

    describe('getStatusEmoji', () => {
      it('should return correct emojis for status', () => {
        expect(getStatusEmoji('healthy')).toBe('✅');
        expect(getStatusEmoji('warning')).toBe('⚠️');
        expect(getStatusEmoji('error')).toBe('❌');
      });

      it('should return question mark for unknown status', () => {
        expect(getStatusEmoji('unknown' as any)).toBe('❓');
      });
    });

    describe('getSeverityEmoji', () => {
      it('should return correct emojis for severity', () => {
        expect(getSeverityEmoji('warning')).toBe('⚠️');
        expect(getSeverityEmoji('error')).toBe('❌');
        expect(getSeverityEmoji('critical')).toBe('🚨');
      });

      it('should return question mark for unknown severity', () => {
        expect(getSeverityEmoji('unknown' as any)).toBe('❓');
      });
    });
  });

  describe('constants', () => {
    it('should have correct default quality thresholds', () => {
      expect(DEFAULT_QUALITY_THRESHOLDS).toEqual({
        FPS_MINIMUM: 15,
        BANDWIDTH_MINIMUM: 1000000,
        LATENCY_MAXIMUM: 5000,
        LFR_MAXIMUM: 5
      });
    });

    it('should have correct default verification settings', () => {
      expect(DEFAULT_VERIFICATION_SETTINGS).toEqual({
        DURATION: 60,
        INTERVAL: 10,
        QUALITY_THRESHOLD: 15,
        MONITOR_REFRESH: 5
      });
    });
  });

  describe('Missing branch coverage tests', () => {
    it('should handle critical latency severity (line 96)', () => {
      const metrics: QualityMetrics = {
        fps: 30,
        bandwidth: 2000000,
        latency: 12000 // More than 2x the maximum (5000 * 2 = 10000)
      };

      const issues = analyzeQualityMetrics(metrics, DEFAULT_QUALITY_THRESHOLDS);
      
      // Should have a critical latency issue
      const latencyIssue = issues.find(issue => issue.message.includes('Latency'));
      expect(latencyIssue).toBeDefined();
      expect(latencyIssue?.severity).toBe('critical');
    });

    it('should handle warning latency severity (not critical)', () => {
      const metrics: QualityMetrics = {
        fps: 30,
        bandwidth: 2000000,
        latency: 7000 // Above threshold (5000) but less than 2x threshold (10000)
      };

      const issues = analyzeQualityMetrics(metrics, DEFAULT_QUALITY_THRESHOLDS);
      
      // Should have a warning latency issue (not critical)
      const latencyIssue = issues.find(issue => issue.message.includes('Latency'));
      expect(latencyIssue).toBeDefined();
      expect(latencyIssue?.severity).toBe('warning');
    });

    it('should handle critical LFR severity', () => {
      const metrics: QualityMetrics = {
        fps: 30,
        bandwidth: 2000000,
        lfr: 12 // More than 2x the maximum (5 * 2 = 10)
      };

      const issues = analyzeQualityMetrics(metrics, DEFAULT_QUALITY_THRESHOLDS);
      
      // Should have a critical LFR issue
      const lfrIssue = issues.find(issue => issue.message.includes('Frame loss rate'));
      expect(lfrIssue).toBeDefined();
      expect(lfrIssue?.severity).toBe('critical');
    });

    it('should handle warning LFR severity (not critical)', () => {
      const metrics: QualityMetrics = {
        fps: 30,
        bandwidth: 2000000,
        lfr: 7 // Above threshold (5) but less than 2x threshold (10)
      };

      const issues = analyzeQualityMetrics(metrics, DEFAULT_QUALITY_THRESHOLDS);
      
      // Should have a warning LFR issue (not critical)
      const lfrIssue = issues.find(issue => issue.message.includes('Frame loss rate'));
      expect(lfrIssue).toBeDefined();
      expect(lfrIssue?.severity).toBe('warning');
    });

    it('should handle critical bandwidth severity', () => {
      const metrics: QualityMetrics = {
        fps: 30,
        bandwidth: 400000, // Less than half of minimum (1000000 / 2 = 500000)
        lfr: 1
      };

      const issues = analyzeQualityMetrics(metrics, DEFAULT_QUALITY_THRESHOLDS);
      
      // Should have a critical bandwidth issue
      const bandwidthIssue = issues.find(issue => issue.message.includes('Bandwidth'));
      expect(bandwidthIssue).toBeDefined();
      expect(bandwidthIssue?.severity).toBe('critical');
    });

    it('should handle warning bandwidth severity (not critical)', () => {
      const metrics: QualityMetrics = {
        fps: 30,
        bandwidth: 750000, // Above half threshold but below threshold (between 500000 and 1000000)
        lfr: 1
      };

      const issues = analyzeQualityMetrics(metrics, DEFAULT_QUALITY_THRESHOLDS);
      
      // Should have a warning bandwidth issue (not critical)
      const bandwidthIssue = issues.find(issue => issue.message.includes('Bandwidth'));
      expect(bandwidthIssue).toBeDefined();
      expect(bandwidthIssue?.severity).toBe('warning');
    });

    it('should generate good overall status (line 204)', () => {
      // Create verification points with 80% reliability and 1 critical issue total
      const points: VerificationPoint[] = [];
      
      // 16 healthy points (80%)
      for (let i = 0; i < 16; i++) {
        points.push({
          checkNumber: i + 1,
          timestamp: new Date(),
          status: 'healthy',
          metrics: { fps: 30, bandwidth: 2000000 },
          issues: []
        });
      }
      
      // 4 error points (20% failure = 80% reliability)
      // Only ONE point has a critical issue
      for (let i = 16; i < 20; i++) {
        const hasCritical = i === 16; // Only first error point has critical issue
        points.push({
          checkNumber: i + 1,
          timestamp: new Date(),
          status: 'error',
          metrics: { fps: 30, bandwidth: 2000000 },
          issues: [
            {
              timestamp: new Date(),
              type: 'fps_low',
              severity: hasCritical ? 'critical' : 'warning', // Only 1 critical total
              message: hasCritical ? 'Critical FPS issue' : 'Warning FPS issue',
              metrics: { fps: 30 }
            }
          ]
        });
      }

      const summary = generateVerificationSummary(points, 15);
      expect(summary.overallStatus).toBe('good');
    });

    it('should generate fair overall status (line 206)', () => {
      // Create verification points with 60% reliability and 3 critical issues total
      const points: VerificationPoint[] = [];
      
      // 12 healthy points (60%)
      for (let i = 0; i < 12; i++) {
        points.push({
          checkNumber: i + 1,
          timestamp: new Date(),
          status: 'healthy',
          metrics: { fps: 30, bandwidth: 2000000 },
          issues: []
        });
      }
      
      // 8 error points (40% failure = 60% reliability)
      // Only 3 points have critical issues
      for (let i = 12; i < 20; i++) {
        const hasCritical = i < 15; // First 3 error points have critical issues
        points.push({
          checkNumber: i + 1,
          timestamp: new Date(),
          status: 'error',
          metrics: { fps: 30, bandwidth: 2000000 },
          issues: [
            {
              timestamp: new Date(),
              type: 'fps_low',
              severity: hasCritical ? 'critical' : 'warning', // Only 3 critical total
              message: hasCritical ? 'Critical FPS issue' : 'Warning FPS issue',
              metrics: { fps: 30 }
            }
          ]
        });
      }

      const summary = generateVerificationSummary(points, 15);
      expect(summary.overallStatus).toBe('fair');
    });

    it('should handle createVerificationReport with default version', () => {
      const mockResult: any = {
        channelId: 'test-channel',
        summary: { overallStatus: 'excellent', reliability: 100, totalIssues: 0 },
        qualityIssues: [],
        viewerLinks: { web: 'http://test.com', mobile: 'http://m.test.com' }
      };

      const report = createVerificationReport(mockResult, 60, 10);
      
      expect(report.metadata.version).toBe('1.0.0');
      expect(report.metadata.channelId).toBe('test-channel');
      expect(report.metadata.testDuration).toBe(60);
      expect(report.metadata.testInterval).toBe(10);
    });

    it('should handle createVerificationReport with custom version', () => {
      const mockResult: any = {
        channelId: 'test-channel',
        summary: { overallStatus: 'excellent', reliability: 100, totalIssues: 0 },
        qualityIssues: [],
        viewerLinks: { web: 'http://test.com', mobile: 'http://m.test.com' }
      };

      const report = createVerificationReport(mockResult, 60, 10, '2.0.0');
      
      expect(report.metadata.version).toBe('2.0.0');
    });
  });
});