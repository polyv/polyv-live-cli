/**
 * v5 API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module v5 by scripts/generate-types.ts
 */

/**
 * 根据用户ID列表向指定频道内的用户广播消息
接口支持https协议
 */
export interface Api1543Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 根据用户ID列表向指定频道内的用户广播消息
接口支持https协议
 */
export interface Api1543Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应消息 */
  message?: string;
  /** 成功时返回空对象 {} */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
}
/**
 * Error nested object
 */
export interface Error {
  /** 错误代码，用于确定具体的错误原因 */
  code?: number;
  /** 错误描述，与 error.code 对应 */
  desc?: string;
}
