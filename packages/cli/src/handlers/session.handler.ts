/**
 * @fileoverview Session command handler for CLI operations
 * @author Development Team
 * @since 9.6.0
 */

import { BaseHandler, OutputFormat } from './base.handler';
import { SessionServiceSdk } from '../services/session.service.sdk';
import {
  SessionServiceConfig,
  SessionListOptions,
  SessionDisplayItem,
  SessionGetOptions,
} from '../types/session';
import { AuthConfig } from '../types/auth';
import { confirmWrite } from '../utils/api-command';

/**
 * Session status mapping for display
 */
const SESSION_STATUS_MAP: Record<string, string> = {
  'unStart': '未开始',
  'live': '直播中',
  'end': '已结束',
  'playback': '回放中',
  'expired': '已过期',
};

/**
 * Interface for session service (enables dependency injection)
 */
export interface ISessionService {
  getSessionList(options: SessionListOptions): Promise<{
    contents: SessionDisplayItem[];
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }>;
  getSession(channelId: string, sessionId: string): Promise<SessionDisplayItem>;
  listLegacyChannelSessions(options: any): Promise<any>;
  getSessionDataList(options: any): Promise<any>;
  getSessionExternalBySession(channelId: string, sessionId: string): Promise<any>;
  createSession(options: any): Promise<any>;
  updateSession(options: any): Promise<void>;
  deleteSession(channelId: string, sessionId: string): Promise<void>;
  getSessionByExternal(channelId: string, externalSessionId: string): Promise<any>;
  listFileIdByExternal(channelId: string, externalSessionId: string): Promise<any>;
  relevanceSession(channelId: string, externalSessionId: string): Promise<string>;
}

/**
 * Handler for session-related CLI commands
 */
export class SessionHandler extends BaseHandler {
  private readonly sessionService: ISessionService;

  /**
   * Creates a new SessionHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   * @param sessionService Optional injected session service (for testing)
   */
  constructor(
    authConfig: AuthConfig,
    serviceConfig: SessionServiceConfig,
    sessionService?: ISessionService
  ) {
    super();
    this.sessionService = sessionService ?? new SessionServiceSdk(authConfig, serviceConfig);
  }

  /**
   * List sessions for a channel
   * @param options Session list options from CLI
   * @returns Promise that resolves when session list is displayed
   *
   * @throws {PolyVValidationError} When options are invalid
   * @throws {PolyVError} When session query fails
   *
   * @example
   * ```typescript
   * await sessionHandler.listSessions({
   *   channelId: '2588188',
   *   output: 'table'
   * });
   * ```
   */
  async listSessions(options: SessionListOptions): Promise<void> {
    try {
      // Call SDK service to get session list
      const result = await this.sessionService.getSessionList(options);

      // Display results
      this.displaySessionList(result.contents, options.channelId, options.output, result.totalItems);
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Get a single session by sessionId
   * @param options Session get options from CLI
   * @returns Promise that resolves when session details are displayed
   *
   * @throws {PolyVValidationError} When options are invalid
   * @throws {PolyVError} When session query fails
   *
   * @example
   * ```typescript
   * await sessionHandler.getSession({
   *   channelId: '2588188',
   *   sessionId: 'e9s2h3jd8f',
   *   output: 'table'
   * });
   * ```
   */
  async getSession(options: SessionGetOptions): Promise<void> {
    try {
      // Validate required channelId
      if (!options.channelId || options.channelId.trim() === '') {
        throw new Error('channelId is required');
      }

      // Validate required sessionId
      if (!options.sessionId || options.sessionId.trim() === '') {
        throw new Error('sessionId is required');
      }

      // Call SDK service to get session
      const session = await this.sessionService.getSession(
        options.channelId,
        options.sessionId
      );

      // Display the session details
      this.displaySessionDetail(session, options.channelId, options.output);
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : String(error);
      // session get queries the new-version (v4) session detail API, which only
      // covers sessions created via the new session system. Historical/legacy
      // sessions (returned by `session legacy-list` / `session data-list`) are a
      // different dataset and are reported as "场次不存在" here — point users at the
      // legacy commands so they are not misled into thinking the ID is invalid.
      const message =
        /场次不存在|not exist/i.test(rawMessage)
          ? `${rawMessage}\n` +
            `提示：\`session get\` 仅支持新版场次（v4 场次详情）。该 sessionId 可能是历史场次，` +
            `请使用 \`session legacy-list -c ${options.channelId}\` 或 \`session data-list -c ${options.channelId}\` 查询历史场次的详情。`
          : rawMessage;
      if (options.output === 'json') {
        console.error(JSON.stringify({ error: message }));
      } else {
        console.error(message);
      }
    }
  }

  async listLegacyChannelSessions(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.sessionService.listLegacyChannelSessions(this.compactOptions(options));
      this.displayResult(result, options.output);
    }, 'session.legacy-list');
  }

  async getSessionDataList(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.sessionService.getSessionDataList(this.compactOptions(options));
      this.displayResult(result, options.output);
    }, 'session.data-list');
  }

  async getSessionExternalBySession(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.sessionService.getSessionExternalBySession(options.channelId, options.sessionId);
      this.displayResult(result, options.output);
    }, 'session.external.get');
  }

  async createSession(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      await confirmWrite(options.force, `Create session "${options.name}" for channel ${options.channelId}?`);
      const result = await this.sessionService.createSession(this.compactOptions(options));
      this.displayResult(result, options.output);
    }, 'session.create');
  }

  async updateSession(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      await confirmWrite(options.force, `Update session ${options.sessionId}?`);
      await this.sessionService.updateSession(this.compactOptions(options));
      this.displayResult({ channelId: options.channelId, sessionId: options.sessionId, updated: true }, options.output);
    }, 'session.update');
  }

  async deleteSession(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      await confirmWrite(options.force, `Delete session ${options.sessionId} from channel ${options.channelId}?`);
      await this.sessionService.deleteSession(options.channelId, options.sessionId);
      this.displayResult({ channelId: options.channelId, sessionId: options.sessionId, deleted: true }, options.output);
    }, 'session.delete');
  }

  async getSessionByExternal(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.sessionService.getSessionByExternal(options.channelId, options.externalSessionId);
      this.displayResult(result, options.output);
    }, 'session.external.session-list');
  }

  async listFileIdByExternal(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.sessionService.listFileIdByExternal(options.channelId, options.externalSessionId);
      this.displayResult(result, options.output);
    }, 'session.external.file-ids');
  }

  async relevanceSession(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      await confirmWrite(options.force, `Bind external session ID ${options.externalSessionId} to channel ${options.channelId}?`);
      const result = await this.sessionService.relevanceSession(options.channelId, options.externalSessionId);
      this.displayResult({ channelId: options.channelId, externalSessionId: options.externalSessionId, result }, options.output);
    }, 'session.external.relevance');
  }

  /**
   * Displays session list in the specified format
   * @param contents Array of session items
   * @param channelId Channel ID for context (optional)
   * @param format Output format (table or json)
   * @param totalItems Total number of items (for display)
   */
  private displaySessionList(
    contents: SessionDisplayItem[],
    channelId: string | undefined,
    format: OutputFormat = 'table',
    totalItems?: number
  ): void {
    // For JSON format, output only the JSON data
    if (format === 'json') {
      const responseData = {
        contents,
        pageNumber: 1,
        pageSize: contents.length,
        totalItems: totalItems ?? contents.length,
        totalPages: 1,
      };
      console.log(JSON.stringify(responseData, null, 2));
      return;
    }

    if (contents.length === 0) {
      const contextInfo = channelId
        ? `暂无场次 - 频道: ${channelId}`
        : '暂无场次';
      this.displayInfo(contextInfo);
      return;
    }

    // Display context info
    const contextInfo = channelId
      ? `场次列表 - 频道: ${channelId}`
      : '场次列表 - 全部频道';
    this.displayInfo(contextInfo);
    this.displayInfo(`共 ${totalItems ?? contents.length} 个场次`);

    // Display session list as table
    this.displaySessionTable(contents);
  }

  private compactOptions(options: any): any {
    const { output, force, ...rest } = options;
    void output;
    void force;
    return Object.fromEntries(
      Object.entries(rest).filter(([, value]) => value !== undefined && value !== '')
    );
  }

  private displayResult(result: any, format: OutputFormat = 'table'): void {
    this.displayData(result ?? { success: true }, format);
  }

  /**
   * Displays session list as a formatted table
   * @param contents Array of session items
   */
  private displaySessionTable(contents: SessionDisplayItem[]): void {
    // Transform session data for table display
    const tableData = contents.map((item) => ({
      '场次ID': item.sessionId,
      '频道ID': item.channelId,
      '名称': item.name || '-',
      '状态': this.getStatusText(item.status),
      '开始时间': this.formatTime(item.startTime),
      '结束时间': this.formatTimestamp(item.endTime),
    }));

    this.displayAsTable(tableData);
  }

  /**
   * Displays a single session details
   * @param session Session item to display
   * @param channelId Channel ID for context
   * @param format Output format (table or json)
   */
  private displaySessionDetail(
    session: SessionDisplayItem,
    channelId: string,
    format: OutputFormat = 'table'
  ): void {
    // For JSON format, output only the JSON data
    if (format === 'json') {
      console.log(JSON.stringify(session, null, 2));
      return;
    }

    // Display context info
    this.displayInfo(`场次详情 - 频道: ${channelId}`);

    // Display session details as table
    this.displaySessionDetailTable(session);
  }

  /**
   * Displays a single session as a formatted table
   * @param session Session item to display
   */
  private displaySessionDetailTable(session: SessionDisplayItem): void {
    const tableData = [{
      '场次ID': session.sessionId,
      '频道ID': session.channelId,
      '名称': session.name || '-',
      '状态': this.getStatusText(session.status),
      '开始时间': this.formatTime(session.startTime),
      '结束时间': this.formatTimestamp(session.endTime),
      '计划开始': this.formatTimestamp(session.planStartTime),
      '计划结束': this.formatTimestamp(session.planEndTime),
      '推流类型': session.streamType || '-',
      '推流客户端': session.pushClient || '-',
      '观看地址': session.watchUrl || '-',
    }];

    this.displayAsTable(tableData);
  }

  /**
   * Get display text for session status
   * @param status Session status code
   * @returns Display text
   */
  private getStatusText(status: string): string {
    return SESSION_STATUS_MAP[status] || status;
  }

  /**
   * Formats a timestamp to readable date string
   * @param timestamp Unix timestamp in milliseconds or string
   * @returns Formatted date string
   */
  private formatTime(timestamp?: string | number): string {
    if (!timestamp) return '-';

    // Handle string timestamps
    if (typeof timestamp === 'string') {
      // If it's already a formatted string, return it
      if (timestamp.includes('-') || timestamp.includes('/')) {
        return timestamp;
      }
      // Try to parse as number
      const num = parseInt(timestamp, 10);
      if (!isNaN(num)) {
        return this.formatTimestamp(num);
      }
      return timestamp;
    }

    return this.formatTimestamp(timestamp);
  }

  /**
   * Formats a timestamp to readable date string
   * @param timestamp Unix timestamp in milliseconds
   * @returns Formatted date string
   */
  private formatTimestamp(timestamp?: number): string {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
