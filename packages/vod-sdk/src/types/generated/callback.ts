/**
 * callback API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module callback by scripts/generate-types.ts
 */

/**
 * 1、查询用户回调设置
2、接口支持https协议
 */
export interface GetCallbackSettingRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询用户回调设置
2、接口支持https协议
 */
export interface GetCallbackSettingResponse {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
  /** 状态码非200时的错误信息【详见[Error字段描述](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 【详见[data字段说明](#data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * Error nested object
 */
export interface GetCallbackSettingError {
  /** 错误代码，用于确定具体的错误原因 */
  code?: number;
  /** 错误描述，与 error.code 对应 */
  desc?: string;
}
/**
 * 1、修改用户回调设置
2、接口支持https协议
 */
export interface UpdateCallbackSettingRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 回调url，不传则清空设置 */
  callbackUrl?: string;
}
/**
 * 1、修改用户回调设置
2、接口支持https协议
 */
export interface UpdateCallbackSettingResponse {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
  /** 状态码非200时的错误信息【详见[Error字段描述](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求成功返回true，请求失败返回空 */
  data?: boolean;
}
/**
 * Error nested object
 */
export interface UpdateCallbackSettingError {
  /** 错误代码，用于确定具体的错误原因 */
  code?: number;
  /** 错误描述，与 error.code 对应 */
  desc?: string;
}
