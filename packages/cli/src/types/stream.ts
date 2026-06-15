/**
 * @fileoverview Stream-related type definitions
 * Defines interfaces for stream operations including get-key functionality
 */

/**
 * Request interface for getting stream key
 */
export interface StreamGetKeyRequest {
  /** Channel ID to get stream key for */
  channelId: string;
}

/**
 * CLI options interface for stream get-key command
 */
export interface StreamGetKeyOptions {
  /** Channel ID parameter */
  channelId: string;
  /** Output format (table or json) */
  output?: 'table' | 'json';
}

/**
 * Stream information model from API response
 */
export interface StreamInfoModel {
  /** Deploy address for streaming */
  deployAddress: string;
  /** Input address for streaming */
  inAddress: string;
  /** Stream name/key */
  streamName: string;
  /** Frames per second */
  fps: number;
  /** Low frame rate */
  lfr: number;
  /** Input bandwidth */
  inBandWidth: number;
}

/**
 * Stream key display model for secure presentation
 */
export interface StreamKeyDisplayModel {
  /** Channel ID */
  channelId: string;
  /** RTMP URL */
  rtmpUrl: string;
  /** Stream key (potentially masked) */
  streamKey: string;
  /** Whether the stream key is masked */
  isMasked: boolean;
  /** Additional stream information */
  streamInfo?: {
    fps: number;
    bandwidth: number;
  };
}

/**
 * Stream credentials for complete information
 */
export interface StreamCredentials {
  /** Channel ID */
  channelId: string;
  /** Complete RTMP URL */
  rtmpUrl: string;
  /** Full stream key */
  streamKey: string;
  /** Deploy address */
  deployAddress: string;
  /** Input address */
  inAddress: string;
  /** Stream performance metrics */
  metrics: {
    fps: number;
    lfr: number;
    bandwidth: number;
  };
}

/**
 * Request interface for starting stream
 */
export interface StreamStartRequest {
  /** Channel ID to start stream for */
  channelId: string;
}

/**
 * CLI options interface for stream start command
 */
export interface StreamStartOptions {
  /** Channel ID parameter */
  channelId: string;
}

/**
 * Stream start response model from API
 */
export interface StreamStartResponse {
  /** Response status code */
  code: number;
  /** Response status */
  status: string;
  /** Response message */
  message: string;
  /** Response data - "success" on success, empty string on failure */
  data: string;
}

/**
 * Request interface for stopping stream
 */
export interface StreamStopRequest {
  /** Channel ID to stop stream for */
  channelId: string;
}

/**
 * CLI options interface for stream stop command
 */
export interface StreamStopOptions {
  /** Channel ID parameter */
  channelId: string;
}

/**
 * Stream stop response model from API
 */
export interface StreamStopResponse {
  /** Response status code */
  code: number;
  /** Response status */
  status: string;
  /** Response message */
  message: string;
  /** Response data - "success" on success, empty string on failure */
  data: string;
}

/**
 * Stream status request interface for monitoring operations
 */
export interface StreamStatusRequest {
  /** Channel ID to get status for */
  channelId: string;
}

/**
 * Stream monitor data interface for real-time information
 */
export interface StreamMonitorData {
  /** CDN node IP address for push stream */
  deployAddress?: string;
  /** Push stream exit IP address */
  inAddress?: string;
  /** Stream name identifier */
  streamName: string;
  /** Push stream frame rate */
  fps: string;
  /** Push stream frame loss rate */
  lfr?: string;
  /** Push stream bitrate in bps */
  inBandWidth: string;
  /** When this info was retrieved */
  retrievedAt: Date;
  /** Associated channel ID */
  channelId: string;
}

/**
 * Enhanced stream status information interface
 */
export interface StreamStatusInfo {
  /** Channel ID */
  channelId: string;
  /** Current stream status */
  status: 'live' | 'stopped' | 'waiting' | 'error' | 'unknown';
  /** Status description */
  statusText: string;
  /** Whether channel is currently streaming */
  isLive: boolean;
  /** Stream duration in milliseconds (if live) */
  duration?: number;
  /** Human readable duration string */
  durationText?: string;
  /** Stream performance metrics */
  metrics?: {
    fps: number;
    lfr: number;
    bandwidth: number;
    bandwidthText: string;
  };
  /** Network information */
  network?: {
    deployAddress?: string;
    inAddress?: string;
    streamName?: string;
  };
  /** Last update timestamp */
  lastUpdated: Date;
  /** Error information if status is 'error' */
  error?: {
    code: string;
    message: string;
  };
}

/**
 * CLI options interface for stream status command
 */
export interface StreamStatusOptions {
  /** Channel ID parameter */
  channelId: string;
  /** Output format (table or json) */
  output?: 'table' | 'json';
  /** Enable watch mode for continuous monitoring */
  watch?: boolean;
}

/**
 * CLI options interface for stream push command
 */
export interface StreamPushOptions {
  /** Channel ID parameter */
  channelId: string;
  /** File path to push */
  file: string;
  /** Enable verification mode */
  verify?: boolean;
  /** Verification check interval in seconds */
  verificationInterval?: number;
  /** Quality threshold for FPS warnings */
  qualityThreshold?: number;
  /** Show viewer links during streaming */
  showViewerLinks?: boolean;
}

/**
 * Stream verification options interface
 */
export interface StreamVerificationOptions {
  /** Channel ID to verify */
  channelId: string;
  /** Verification duration in seconds */
  duration?: number;
  /** Check interval in seconds */
  interval?: number;
  /** Quality threshold for warnings */
  qualityThreshold?: number;
  /** Show viewer links */
  showViewerLinks?: boolean;
  /** Save report to file path */
  saveReport?: string;
  /** Output format */
  output?: 'table' | 'json';
}

/**
 * Stream monitor options interface
 */
export interface StreamMonitorOptions {
  /** Channel ID to monitor */
  channelId: string;
  /** Refresh interval in seconds */
  refresh?: number;
  /** Enable quality alerts */
  alerts?: boolean;
  /** Output format */
  output?: 'table' | 'json';
}

/**
 * Quality metrics interface
 */
export interface QualityMetrics {
  /** Frames per second */
  fps: number;
  /** Bandwidth in bps */
  bandwidth: number;
  /** Latency in milliseconds */
  latency?: number;
  /** Frame loss rate */
  lfr?: number;
}

/**
 * Quality issue interface
 */
export interface QualityIssue {
  /** Issue timestamp */
  timestamp: Date;
  /** Issue type */
  type: 'fps_low' | 'bandwidth_low' | 'connection_lost' | 'encoding_error' | 'other';
  /** Issue severity */
  severity: 'warning' | 'error' | 'critical';
  /** Issue description */
  message: string;
  /** Affected metrics */
  metrics?: Partial<QualityMetrics>;
}

/**
 * Viewer link interface
 */
export interface ViewerLink {
  /** Protocol type */
  protocol: 'HLS' | 'RTMP' | 'WebRTC' | 'HTTP-FLV';
  /** Playback URL */
  url: string;
  /** Link description */
  description: string;
}

/**
 * Verification point interface for timeline
 */
export interface VerificationPoint {
  /** Check number */
  checkNumber: number;
  /** Check timestamp */
  timestamp: Date;
  /** Overall status */
  status: 'healthy' | 'warning' | 'error';
  /** Quality metrics at this point */
  metrics: QualityMetrics;
  /** Any issues detected */
  issues: QualityIssue[];
}

/**
 * Verification summary interface
 */
export interface VerificationSummary {
  /** Overall status assessment */
  overallStatus: 'excellent' | 'good' | 'fair' | 'poor';
  /** Reliability percentage (0-100) */
  reliability: number;
  /** Average quality metrics */
  averageQuality: QualityMetrics;
  /** Total issues found */
  totalIssues: number;
  /** Recommendations for improvement */
  recommendations: string[];
}

/**
 * Stream verification result interface
 */
export interface StreamVerificationResult {
  /** Channel ID */
  channelId: string;
  /** Unique verification ID */
  verificationId: string;
  /** Verification start time */
  startTime: Date;
  /** Verification end time */
  endTime: Date;
  /** Total number of checks performed */
  totalChecks: number;
  /** Number of successful checks */
  successfulChecks: number;
  /** Number of failed checks */
  failedChecks: number;
  /** Average metrics across all checks */
  averageMetrics: QualityMetrics;
  /** All quality issues found */
  qualityIssues: QualityIssue[];
  /** Available viewer links */
  viewerLinks: ViewerLink[];
  /** Verification summary */
  summary: VerificationSummary;
}

/**
 * Verification report interface for file export
 */
export interface VerificationReport {
  /** Report metadata */
  metadata: {
    /** Channel ID */
    channelId: string;
    /** Test duration in seconds */
    testDuration: number;
    /** Test interval in seconds */
    testInterval: number;
    /** Report generation timestamp */
    timestamp: Date;
    /** CLI version */
    version: string;
  };
  /** Report summary */
  summary: VerificationSummary;
  /** Verification timeline */
  timeline: VerificationPoint[];
  /** All issues found */
  issues: QualityIssue[];
  /** Available viewer links */
  viewerLinks: ViewerLink[];
}

/**
 * Stream activity event interface for monitoring
 */
export interface StreamActivity {
  /** Event timestamp */
  timestamp: Date;
  /** Event type */
  type: 'status_change' | 'quality_change' | 'viewer_change' | 'error' | 'info';
  /** Event message */
  message: string;
  /** Associated data */
  data?: Record<string, unknown>;
} 