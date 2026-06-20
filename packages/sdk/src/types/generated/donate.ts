/**
 * donate API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module donate by scripts/generate-types.ts
 *
 * Last updated: 2026-06-20T00:51:38.534Z
 */

/**
 * 1、保利威服务器通过传递观众的id和频道号等参数，对用户的积分查询接口URL 进行请求，获取学员在平台的积分
 */
export interface Api3d74Request {
  /** 频道号 */
  channelId?: string;
  /** 观众ID */
  viewerId?: string;
  /** 观众昵称 */
  viewerName?: string;
  /** 直播场次ID,在未直播时可能参数为空 */
  sessionId?: string;
  /** 当前13位毫秒级时间戳 */
  ts?: number;
  /** 保利威直播账号appId */
  appId?: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign?: string;
}
/**
 * 1、保利威服务器通过传递观众的id和频道号等参数，对用户的积分查询接口URL 进行请求，获取学员在平台的积分
 */
export interface Api3d74Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应状态文本信息，success 表示成功 */
  status?: string;
  /** 响应描述信息，注意：请求出错时，页面显示的提示为polyv 积分打赏所设置的提示 */
  message?: string;
  /** 请求成功时为观众的积分 */
  data?: number;
}
