/**
 * @fileoverview Performance optimization module exports
 * @author Development Team
 * @since 1.0.0
 */

// Main performance optimizer
export { PerformanceOptimizer } from './performance-optimizer';
export type { PerformanceOptimizerConfig, PerformanceMetrics } from './performance-optimizer';

// Adaptive polling
export { AdaptivePollingManager } from './adaptive-polling';
export type { AdaptivePollingConfig, DataSourceStats, ApiCallStats } from './adaptive-polling';

// Render optimization
export { RenderOptimizer } from './render-optimizer';
export type { RenderOptimizerConfig, ComponentRenderState, RenderMetrics } from './render-optimizer';

// Memory management
export { MemoryManager } from './memory-manager';
export type { MemoryManagerConfig, MemorySnapshot, MemoryStats, LeakDetection, ManagedResource } from './memory-manager';

// API optimization
export { ApiOptimizer } from './api-optimizer';
export type { ApiOptimizerConfig, OptimizationStats } from './api-optimizer';

// Batch request management
export { BatchRequestManager } from './batch-request-manager';
export type { BatchRequestConfig, BatchRequestItem, BatchResult, BatchStats } from './batch-request-manager';

// API analytics
export { ApiAnalytics } from './api-analytics';
export type { ApiAnalyticsConfig, ApiRequestRecord, EndpointStats, PerformanceMetrics as ApiPerformanceMetrics, ErrorAnalysis, UsagePatterns } from './api-analytics';

// Change detection
export { ChangeDetector } from './change-detector';
export type { ChangeDetectionConfig, ChangeDetectionResult, PatternAnalysis, DataSourceActivity } from './change-detector';

// Connection pool management
export { ConnectionPoolManager } from './connection-pool-manager';
export type { ConnectionPoolConfig, ConnectionStats, HostConnectionStats } from './connection-pool-manager';

// Fallback and fault tolerance
export { FallbackManager } from './fallback-manager';
export type { FallbackManagerConfig, FallbackStats, ServiceHealthMetrics, FallbackResult } from './fallback-manager';

// Performance monitoring
export { PerformanceMonitor } from './performance-monitor';
export type { PerformanceMonitorConfig, PerformanceMetrics as MonitorPerformanceMetrics, PerformanceReport, PerformanceAlert } from './performance-monitor';

// Error recovery
export { ErrorRecoveryManager } from './error-recovery-manager';
export type { ErrorRecoveryConfig, ErrorRecord, ErrorStatistics, UserErrorMessage } from './error-recovery-manager';