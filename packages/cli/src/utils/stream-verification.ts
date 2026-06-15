/**
 * @fileoverview Stream verification utility functions
 * @author Development Team
 * @since 4.2.0
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import { 
  QualityMetrics, 
  QualityIssue, 
  VerificationPoint, 
  VerificationSummary, 
  StreamVerificationResult,
  VerificationReport,
  ViewerLink,
  StreamStatusInfo
} from '../types/stream';
import { formatBandwidth } from './formatter';

/**
 * Default quality thresholds for stream verification
 */
export const DEFAULT_QUALITY_THRESHOLDS = {
  FPS_MINIMUM: 15,
  BANDWIDTH_MINIMUM: 1000000, // 1 Mbps in bps
  LATENCY_MAXIMUM: 5000, // 5 seconds in ms
  LFR_MAXIMUM: 5 // 5% frame loss rate
} as const;

/**
 * Default verification settings
 */
export const DEFAULT_VERIFICATION_SETTINGS = {
  DURATION: 60, // seconds
  INTERVAL: 10, // seconds
  QUALITY_THRESHOLD: DEFAULT_QUALITY_THRESHOLDS.FPS_MINIMUM,
  MONITOR_REFRESH: 5 // seconds
} as const;

/**
 * Generates a unique verification ID
 */
export function generateVerificationId(): string {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(4).toString('hex');
  return `verify_${timestamp}_${random}`;
}

/**
 * Converts stream status info to quality metrics
 */
export function extractQualityMetrics(statusInfo: StreamStatusInfo): QualityMetrics {
  const metrics: QualityMetrics = {
    fps: statusInfo.metrics?.fps || 0,
    bandwidth: statusInfo.metrics?.bandwidth || 0,
    lfr: statusInfo.metrics?.lfr || 0
  };

  return metrics;
}

/**
 * Analyzes quality metrics and identifies issues
 */
export function analyzeQualityMetrics(
  metrics: QualityMetrics, 
  thresholds = DEFAULT_QUALITY_THRESHOLDS
): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const timestamp = new Date();

  // Check FPS
  if (metrics.fps < thresholds.FPS_MINIMUM) {
    issues.push({
      timestamp,
      type: 'fps_low',
      severity: metrics.fps < thresholds.FPS_MINIMUM / 2 ? 'critical' : 'warning',
      message: `FPS is below threshold: ${metrics.fps.toFixed(1)} < ${thresholds.FPS_MINIMUM}`,
      metrics: { fps: metrics.fps }
    });
  }

  // Check bandwidth
  if (metrics.bandwidth < thresholds.BANDWIDTH_MINIMUM) {
    issues.push({
      timestamp,
      type: 'bandwidth_low',
      severity: metrics.bandwidth < thresholds.BANDWIDTH_MINIMUM / 2 ? 'critical' : 'warning',
      message: `Bandwidth is below threshold: ${formatBandwidth(metrics.bandwidth)} < ${formatBandwidth(thresholds.BANDWIDTH_MINIMUM)}`,
      metrics: { bandwidth: metrics.bandwidth }
    });
  }

  // Check latency if available
  if (metrics.latency && metrics.latency > thresholds.LATENCY_MAXIMUM) {
    issues.push({
      timestamp,
      type: 'other',
      severity: metrics.latency > thresholds.LATENCY_MAXIMUM * 2 ? 'critical' : 'warning',
      message: `Latency is above threshold: ${metrics.latency}ms > ${thresholds.LATENCY_MAXIMUM}ms`,
      metrics: { latency: metrics.latency }
    });
  }

  // Check frame loss rate
  if (metrics.lfr && metrics.lfr > thresholds.LFR_MAXIMUM) {
    issues.push({
      timestamp,
      type: 'other',
      severity: metrics.lfr > thresholds.LFR_MAXIMUM * 2 ? 'critical' : 'warning',
      message: `Frame loss rate is above threshold: ${metrics.lfr.toFixed(1)}% > ${thresholds.LFR_MAXIMUM}%`,
      metrics: { lfr: metrics.lfr }
    });
  }

  return issues;
}

/**
 * Creates a verification point from status info
 */
export function createVerificationPoint(
  checkNumber: number,
  statusInfo: StreamStatusInfo,
  qualityThreshold: number = DEFAULT_QUALITY_THRESHOLDS.FPS_MINIMUM as number
): VerificationPoint {
  const metrics = extractQualityMetrics(statusInfo);
  const issues = analyzeQualityMetrics(metrics, {
    ...DEFAULT_QUALITY_THRESHOLDS,
    FPS_MINIMUM: qualityThreshold as 15
  });

  // Determine overall status
  let status: 'healthy' | 'warning' | 'error';
  if (issues.length === 0) {
    status = 'healthy';
  } else if (issues.some(issue => issue.severity === 'critical')) {
    status = 'error';
  } else {
    status = 'warning';
  }

  return {
    checkNumber,
    timestamp: new Date(),
    status,
    metrics,
    issues
  };
}

/**
 * Calculates average quality metrics from verification points
 */
export function calculateAverageMetrics(points: VerificationPoint[]): QualityMetrics {
  if (points.length === 0) {
    return { fps: 0, bandwidth: 0, lfr: 0 };
  }

  const totals = points.reduce((acc, point) => ({
    fps: acc.fps + point.metrics.fps,
    bandwidth: acc.bandwidth + point.metrics.bandwidth,
    lfr: acc.lfr + (point.metrics.lfr || 0),
    latency: acc.latency + (point.metrics.latency || 0)
  }), { fps: 0, bandwidth: 0, lfr: 0, latency: 0 });

  const count = points.length;
  return {
    fps: totals.fps / count,
    bandwidth: totals.bandwidth / count,
    lfr: totals.lfr / count,
    latency: totals.latency / count
  };
}

/**
 * Generates verification summary from verification points
 */
export function generateVerificationSummary(
  points: VerificationPoint[],
  qualityThreshold: number = DEFAULT_QUALITY_THRESHOLDS.FPS_MINIMUM
): VerificationSummary {
  if (points.length === 0) {
    return {
      overallStatus: 'poor',
      reliability: 0,
      averageQuality: { fps: 0, bandwidth: 0 },
      totalIssues: 0,
      recommendations: ['No data available for analysis']
    };
  }

  const healthyChecks = points.filter(p => p.status === 'healthy').length;
  const reliability = (healthyChecks / points.length) * 100;
  
  const allIssues = points.flatMap(p => p.issues);
  const criticalIssues = allIssues.filter(i => i.severity === 'critical').length;

  // Determine overall status
  let overallStatus: 'excellent' | 'good' | 'fair' | 'poor';
  if (reliability >= 95 && criticalIssues === 0) {
    overallStatus = 'excellent';
  } else if (reliability >= 80 && criticalIssues <= 1) {
    overallStatus = 'good';
  } else if (reliability >= 60 && criticalIssues <= 3) {
    overallStatus = 'fair';
  } else {
    overallStatus = 'poor';
  }

  const averageQuality = calculateAverageMetrics(points);
  
  // Generate recommendations
  const recommendations: string[] = [];
  if (averageQuality.fps < qualityThreshold) {
    recommendations.push('Consider increasing source video quality or encoding settings');
  }
  if (averageQuality.bandwidth < DEFAULT_QUALITY_THRESHOLDS.BANDWIDTH_MINIMUM) {
    recommendations.push('Check network connection and increase bitrate');
  }
  if (reliability < 90) {
    recommendations.push('Monitor network stability and FFmpeg configuration');
  }
  if (criticalIssues > 0) {
    recommendations.push('Address critical quality issues immediately');
  }
  if (recommendations.length === 0) {
    recommendations.push('Stream quality is performing well');
  }

  return {
    overallStatus,
    reliability,
    averageQuality,
    totalIssues: allIssues.length,
    recommendations
  };
}

/**
 * Generates viewer links for a channel
 */
export function generateViewerLinks(channelId: string): ViewerLink[] {
  const links: ViewerLink[] = [
    {
      protocol: 'HLS',
      url: `https://player.polyv.net/live/${channelId}`,
      description: 'Web player (recommended for browsers)'
    },
    {
      protocol: 'RTMP',
      url: `rtmp://live.polyv.net/live/${channelId}`,
      description: 'RTMP stream (for media players)'
    },
    {
      protocol: 'HTTP-FLV',
      url: `https://live.polyv.net/live/${channelId}.flv`,
      description: 'HTTP-FLV stream (low latency)'
    }
  ];

  return links;
}

/**
 * Creates a complete verification result
 */
export function createVerificationResult(
  channelId: string,
  verificationId: string,
  startTime: Date,
  points: VerificationPoint[],
  qualityThreshold: number = DEFAULT_QUALITY_THRESHOLDS.FPS_MINIMUM
): StreamVerificationResult {
  const endTime = new Date();
  const successfulChecks = points.filter(p => p.status === 'healthy').length;
  const failedChecks = points.length - successfulChecks;
  const averageMetrics = calculateAverageMetrics(points);
  const qualityIssues = points.flatMap(p => p.issues);
  const viewerLinks = generateViewerLinks(channelId);
  const summary = generateVerificationSummary(points, qualityThreshold);

  return {
    channelId,
    verificationId,
    startTime,
    endTime,
    totalChecks: points.length,
    successfulChecks,
    failedChecks,
    averageMetrics,
    qualityIssues,
    viewerLinks,
    summary
  };
}

/**
 * Creates a verification report for file export
 */
export function createVerificationReport(
  result: StreamVerificationResult,
  testDuration: number,
  testInterval: number,
  version: string = '1.0.0'
): VerificationReport {
  return {
    metadata: {
      channelId: result.channelId,
      testDuration,
      testInterval,
      timestamp: new Date(),
      version
    },
    summary: result.summary,
    timeline: [], // Will be populated with verification points
    issues: result.qualityIssues,
    viewerLinks: result.viewerLinks
  };
}

/**
 * Saves verification report to file
 */
export async function saveVerificationReport(
  report: VerificationReport,
  filePath: string
): Promise<void> {
  try {
    const jsonContent = JSON.stringify(report, null, 2);
    await fs.promises.writeFile(filePath, jsonContent, 'utf8');
  } catch (error) {
    throw new Error(`Failed to save verification report: ${error instanceof Error ? error.message : String(error)}`);
  }
}


/**
 * Formats FPS value for display
 */
export function formatFPS(fps: number): string {
  return `${fps.toFixed(1)} FPS`;
}

/**
 * Formats latency for display
 */
export function formatLatency(latency?: number): string {
  if (!latency) return 'N/A';
  return `${latency.toFixed(0)}ms`;
}

/**
 * Gets status emoji for verification point
 */
export function getStatusEmoji(status: 'healthy' | 'warning' | 'error'): string {
  switch (status) {
    case 'healthy': return '✅';
    case 'warning': return '⚠️';
    case 'error': return '❌';
    default: return '❓';
  }
}

/**
 * Gets severity emoji for quality issues
 */
export function getSeverityEmoji(severity: 'warning' | 'error' | 'critical'): string {
  switch (severity) {
    case 'warning': return '⚠️';
    case 'error': return '❌';
    case 'critical': return '🚨';
    default: return '❓';
  }
}