/**
 * callback API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module callback by scripts/generate-types.ts
 *
 * Last updated: 2026-06-19T06:33:52.868Z
 */

export interface ApiRequest {
  /** 频道号（房间号） */
  roomId: string;
  /** 本场直播/会话 ID */
  sessionId: string;
  /** 字幕数组的 JSON 字符串（见下方字段说明） */
  subtitles: string;
  /** 请求13位时间戳（毫秒，`Date.now()`） */
  timestamp: number;
  /** 签名，用于鉴权与防篡改（见下方验签说明） */
  sign: string;
}
