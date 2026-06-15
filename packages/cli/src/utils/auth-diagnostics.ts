/**
 * Authentication diagnostics utilities for troubleshooting and user guidance
 */

import {
  AuthenticationSource,
  AuthenticationContext,
  AuthenticationSourceType,
} from '../types/auth-source.types';
import { AuthenticationProvider } from '../types/auth-source.types';

/**
 * Authentication diagnostic result
 */
export interface AuthDiagnosticResult {
  /** Overall authentication status */
  status: 'success' | 'warning' | 'error';
  /** Summary message */
  summary: string;
  /** Detailed diagnostic information */
  details: {
    /** Available authentication sources */
    sources: AuthenticationSource[];
    /** Selected source (if any) */
    selectedSource?: AuthenticationSource;
    /** Issues found */
    issues: AuthDiagnosticIssue[];
    /** Recommendations */
    recommendations: string[];
  };
  /** Verbose diagnostic information */
  verbose?: {
    /** Source detection timeline */
    timeline: AuthDiagnosticEvent[];
    /** Environment information */
    environment: Record<string, any>;
    /** Configuration state */
    configuration: Record<string, any>;
  };
}

/**
 * Authentication diagnostic issue
 */
export interface AuthDiagnosticIssue {
  /** Issue severity */
  severity: 'error' | 'warning' | 'info';
  /** Issue type */
  type: string;
  /** Issue message */
  message: string;
  /** Affected source (if applicable) */
  source?: AuthenticationSourceType;
  /** Resolution suggestions */
  suggestions: string[];
}

/**
 * Authentication diagnostic event
 */
export interface AuthDiagnosticEvent {
  /** Event timestamp */
  timestamp: Date;
  /** Event type */
  type: 'source_detected' | 'source_validated' | 'source_selected' | 'error' | 'warning';
  /** Event message */
  message: string;
  /** Related source */
  source?: AuthenticationSourceType;
  /** Additional data */
  data?: Record<string, any>;
}

/**
 * Authentication diagnostics utility class
 */
export class AuthDiagnostics {
  private authProvider: AuthenticationProvider;
  private events: AuthDiagnosticEvent[] = [];

  constructor(authProvider: AuthenticationProvider) {
    this.authProvider = authProvider;
  }

  /**
   * Run comprehensive authentication diagnostics
   * @param options Optional command line options
   * @param includeVerbose Whether to include verbose information
   * @returns Diagnostic result
   */
  public runDiagnostics(
    options?: Record<string, unknown>,
    includeVerbose: boolean = false
  ): AuthDiagnosticResult {
    this.events = [];
    this.logEvent('source_detected', '开始认证诊断');

    const diagnostics = this.authProvider.getDiagnostics(options);
    const context = this.authProvider.getAuthenticationContext(options);
    const issues: AuthDiagnosticIssue[] = [];
    const recommendations: string[] = [];

    // Analyze authentication state
    if (context && context.source) {
      this.logEvent('source_selected', `选择认证源: ${context.source.metadata.source}`, context.source.type);
      
      // Check for potential issues with selected source
      this.analyzeSelectedSource(context.source, issues, recommendations);
    } else {
      this.logEvent('error', '未找到有效的认证源');
      this.analyzeNoAuthenticationFound(diagnostics, issues, recommendations);
    }

    // Analyze available sources for additional insights
    this.analyzeAvailableSources(diagnostics.availableSources, issues, recommendations);

    // Determine overall status
    const status = this.determineOverallStatus(context, issues);
    const summary = this.generateSummary(status, context, issues);

    const result: AuthDiagnosticResult = {
      status,
      summary,
      details: {
        sources: diagnostics.availableSources,
        ...(diagnostics.selectedSource && { selectedSource: diagnostics.selectedSource }),
        issues,
        recommendations,
      },
    };

    if (includeVerbose) {
      result.verbose = {
        timeline: [...this.events],
        environment: this.getEnvironmentInfo(),
        configuration: this.getConfigurationInfo(options),
      };
    }

    return result;
  }

  /**
   * Generate user-friendly diagnostic report
   * @param options Optional command line options
   * @param includeVerbose Whether to include verbose information
   * @returns Formatted diagnostic report
   */
  public generateReport(
    options?: Record<string, unknown>,
    includeVerbose: boolean = false
  ): string {
    const result = this.runDiagnostics(options, includeVerbose);
    const lines: string[] = [];

    // Header
    lines.push('=== PolyV CLI 认证诊断报告 ===\n');

    // Summary
    const statusIcon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    lines.push(`状态: ${statusIcon} ${result.summary}\n`);

    // Selected source
    if (result.details.selectedSource) {
      const source = result.details.selectedSource;
      lines.push('当前认证源:');
      lines.push(`  类型: ${source.metadata.source}`);
      if (source.metadata.accountName) {
        lines.push(`  账号: ${source.metadata.accountName}`);
      }
      lines.push(`  优先级: ${source.priority} (1=最高, 4=最低)`);
      lines.push('');
    }

    // Available sources
    if (result.details.sources.length > 0) {
      lines.push('可用认证源:');
      result.details.sources.forEach((source, index) => {
        const complete = !!(source.appId && source.appSecret);
        const status = complete ? '✅' : '❌';
        lines.push(`  ${index + 1}. ${status} ${source.metadata.source} (优先级 ${source.priority})`);
        if (source.metadata.accountName) {
          lines.push(`     账号: ${source.metadata.accountName}`);
        }
        if (!complete) {
          const missing = [];
          if (!source.appId) missing.push('appId');
          if (!source.appSecret) missing.push('appSecret');
          lines.push(`     缺少: ${missing.join(', ')}`);
        }
      });
      lines.push('');
    }

    // Issues
    if (result.details.issues.length > 0) {
      lines.push('发现的问题:');
      result.details.issues.forEach((issue, index) => {
        const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        lines.push(`  ${index + 1}. ${icon} ${issue.message}`);
        if (issue.suggestions.length > 0) {
          issue.suggestions.forEach(suggestion => {
            lines.push(`     建议: ${suggestion}`);
          });
        }
      });
      lines.push('');
    }

    // Recommendations
    if (result.details.recommendations.length > 0) {
      lines.push('建议操作:');
      result.details.recommendations.forEach((rec, index) => {
        lines.push(`  ${index + 1}. ${rec}`);
      });
      lines.push('');
    }

    // Verbose information
    if (includeVerbose && result.verbose) {
      lines.push('详细信息:');
      
      // Timeline
      if (result.verbose.timeline.length > 0) {
        lines.push('  诊断时间线:');
        result.verbose.timeline.forEach(event => {
          const time = event.timestamp.toLocaleTimeString();
          lines.push(`    ${time} - ${event.message}`);
        });
        lines.push('');
      }

      // Environment
      lines.push('  环境信息:');
      Object.entries(result.verbose.environment).forEach(([key, value]) => {
        lines.push(`    ${key}: ${value}`);
      });
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Log diagnostic event
   */
  private logEvent(
    type: AuthDiagnosticEvent['type'],
    message: string,
    source?: AuthenticationSourceType,
    data?: Record<string, any>
  ): void {
    const event: AuthDiagnosticEvent = {
      timestamp: new Date(),
      type,
      message,
    };
    
    if (source !== undefined) {
      event.source = source;
    }
    
    if (data !== undefined) {
      event.data = data;
    }
    
    this.events.push(event);
  }

  /**
   * Analyze selected authentication source
   */
  private analyzeSelectedSource(
    source: AuthenticationSource,
    issues: AuthDiagnosticIssue[],
    recommendations: string[]
  ): void {
    // Check for session account issues
    if (source.type === 'session' && source.metadata.context?.['error']) {
      issues.push({
        severity: 'warning',
        type: 'session_account_issue',
        message: source.metadata.context['message'] || '会话账号存在问题',
        source: source.type,
        suggestions: ['使用 \'polyv-live-cli use <account-name>\' 切换到有效账号'],
      });
    }

    // Check for incomplete authentication
    if (!source.appId || !source.appSecret) {
      issues.push({
        severity: 'error',
        type: 'incomplete_authentication',
        message: '认证信息不完整',
        source: source.type,
        suggestions: ['确保提供完整的 appId 和 appSecret'],
      });
    }

    // Add source-specific recommendations
    switch (source.type) {
      case 'command-line':
        recommendations.push('命令行参数具有最高优先级，将覆盖其他认证源');
        break;
      case 'session':
        recommendations.push('会话账号仅在当前终端有效，其他终端需要单独设置');
        break;
      case 'environment':
        recommendations.push('环境变量在整个系统会话中有效');
        break;
      case 'config':
        recommendations.push('全局配置是默认的认证方式');
        break;
    }
  }

  /**
   * Analyze case when no authentication is found
   */
  private analyzeNoAuthenticationFound(
    _diagnostics: { availableSources: AuthenticationSource[]; selectedSource?: AuthenticationSource; warnings: string[]; suggestions: string[]; },
    issues: AuthDiagnosticIssue[],
    recommendations: string[]
  ): void {
    issues.push({
      severity: 'error',
      type: 'no_authentication',
      message: '未找到有效的认证信息',
      suggestions: [
        '使用 \'polyv-live-cli account add <account-name>\' 添加账号',
        '设置环境变量: POLYV_APP_ID, POLYV_APP_SECRET',
        '使用命令行参数: --app-id, --app-secret',
      ],
    });

    recommendations.push('建议首先添加账号配置，然后使用会话切换功能');
    recommendations.push('对于临时使用，可以使用命令行参数或环境变量');
  }

  /**
   * Analyze available sources for insights
   */
  private analyzeAvailableSources(
    sources: AuthenticationSource[],
    issues: AuthDiagnosticIssue[],
    recommendations: string[]
  ): void {
    const incompleteCount = sources.filter(s => !s.appId || !s.appSecret).length;
    
    if (incompleteCount > 0) {
      issues.push({
        severity: 'info',
        type: 'incomplete_sources',
        message: `发现 ${incompleteCount} 个不完整的认证源`,
        suggestions: ['检查并完善认证配置'],
      });
    }

    // Check for multiple sources
    if (sources.length > 1) {
      recommendations.push('检测到多个认证源，系统将按优先级自动选择');
      recommendations.push('使用 --verbose 选项查看详细的认证源信息');
    }
  }

  /**
   * Determine overall diagnostic status
   */
  private determineOverallStatus(
    context: AuthenticationContext | null,
    issues: AuthDiagnosticIssue[]
  ): 'success' | 'warning' | 'error' {
    if (!context) {
      return 'error';
    }

    const hasErrors = issues.some(i => i.severity === 'error');
    const hasWarnings = issues.some(i => i.severity === 'warning');

    if (hasErrors) return 'error';
    if (hasWarnings) return 'warning';
    return 'success';
  }

  /**
   * Generate summary message
   */
  private generateSummary(
    status: 'success' | 'warning' | 'error',
    context: AuthenticationContext | null,
    issues: AuthDiagnosticIssue[]
  ): string {
    if (status === 'success' && context) {
      return `认证配置正常，使用 ${context.source.metadata.source}`;
    }

    if (status === 'warning' && context) {
      const warningCount = issues.filter(i => i.severity === 'warning').length;
      return `认证可用但存在 ${warningCount} 个警告，使用 ${context.source.metadata.source}`;
    }

    const errorCount = issues.filter(i => i.severity === 'error').length;
    return `认证配置存在 ${errorCount} 个错误，无法正常使用`;
  }

  /**
   * Get environment information
   */
  private getEnvironmentInfo(): Record<string, any> {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cwd: process.cwd(),
      envVarsSet: {
        POLYV_APP_ID: !!process.env['POLYV_APP_ID'],
        POLYV_APP_SECRET: !!process.env['POLYV_APP_SECRET'],
        POLYV_USER_ID: !!process.env['POLYV_USER_ID'],
      },
    };
  }

  /**
   * Get configuration information
   */
  private getConfigurationInfo(options?: Record<string, unknown>): Record<string, any> {
    return {
      commandLineOptions: {
        appId: !!(options?.['appId']),
        appSecret: !!(options?.['appSecret']),
        userId: !!(options?.['userId']),
      },
      timestamp: new Date().toISOString(),
    };
  }
}
