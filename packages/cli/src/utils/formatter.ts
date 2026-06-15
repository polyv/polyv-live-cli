/**
 * @fileoverview Output formatting utilities for CLI display
 * @author Development Team
 * @since 3.4.0
 */

import { StreamStatusInfo } from '../types/stream';
const Table = require('cli-table3');

/**
 * Format stream status information for table display
 * @param status Stream status information
 * @returns Formatted object for table display
 */
export function formatStreamStatusForTable(status: StreamStatusInfo): Record<string, string> {
  const formattedStatus: Record<string, string> = {
    'Channel ID': status.channelId,
    'Status': formatStatusWithIcon(status.status, status.statusText),
    'Last Updated': status.lastUpdated.toLocaleString()
  };

  // Add duration if available
  if (status.isLive && status.durationText) {
    formattedStatus['Duration'] = status.durationText;
  }

  // Add metrics if available
  if (status.metrics) {
    formattedStatus['FPS'] = status.metrics.fps.toFixed(2);
    if (status.metrics.lfr > 0) {
      formattedStatus['Frame Loss'] = `${status.metrics.lfr.toFixed(2)}%`;
    }
    formattedStatus['Bandwidth'] = status.metrics.bandwidthText;
  }

  // Add network info if available
  if (status.network) {
    if (status.network.deployAddress) {
      formattedStatus['Deploy Address'] = status.network.deployAddress;
    }
    if (status.network.inAddress) {
      formattedStatus['Input Address'] = status.network.inAddress;
    }
    if (status.network.streamName) {
      formattedStatus['Stream Name'] = status.network.streamName;
    }
  }

  // Add error if present
  if (status.error) {
    formattedStatus['Error'] = `${status.error.code}: ${status.error.message}`;
  }

  return formattedStatus;
}

/**
 * Format stream status information for JSON output
 * @param status Stream status information
 * @returns Full status object for JSON output
 */
export function formatStreamStatusForJson(status: StreamStatusInfo): StreamStatusInfo {
  // Return the complete status object for JSON output
  return status;
}

/**
 * Format status with appropriate icon/color indicator
 * @param status Status value
 * @param statusText Status text
 * @returns Formatted status string with icon
 */
export function formatStatusWithIcon(
  status: 'live' | 'stopped' | 'waiting' | 'error' | 'unknown',
  statusText: string
): string {
  switch (status) {
    case 'live':
      return `🟢 ${statusText}`;
    case 'stopped':
      return `⚫ ${statusText}`;
    case 'waiting':
      return `🟡 ${statusText}`;
    case 'error':
      return `🔴 ${statusText}`;
    case 'unknown':
    default:
      return `⚪ ${statusText}`;
  }
}

/**
 * Format duration in milliseconds to human readable string
 * @param duration Duration in milliseconds
 * @returns Formatted duration string
 */
export function formatDuration(duration: number): string {
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Format bandwidth value for display
 * @param bandwidth Bandwidth in bps
 * @returns Formatted bandwidth string
 */
export function formatBandwidth(bandwidth: number): string {
  if (bandwidth === 0) return '0 bps';
  
  const units = ['bps', 'Kbps', 'Mbps', 'Gbps'];
  let unitIndex = 0;
  let value = bandwidth;
  
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  
  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Format compact status summary for inline display
 * @param status Stream status information
 * @returns Compact status string
 */
export function formatCompactStatus(status: StreamStatusInfo): string {
  const icon = formatStatusWithIcon(status.status, '').trim();
  let summary = `${icon} ${status.statusText}`;
  
  if (status.isLive && status.durationText) {
    summary += ` (${status.durationText})`;
  }
  
  return summary;
}

/**
 * Format data as a table
 * @param options Table options with headers and data
 * @returns Formatted table string
 */
export function formatTable(options: { headers: string[]; data: string[][] }): string {
  const table = new Table({
    head: options.headers,
    style: {
      head: ['cyan'],
      border: ['gray'],
    },
  });

  options.data.forEach(row => {
    table.push(row);
  });

  return table.toString();
}

/**
 * Format data as JSON
 * @param data Data to format
 * @returns Formatted JSON string
 */
export function formatJSON(data: any): string {
  return JSON.stringify(data, null, 2);
}