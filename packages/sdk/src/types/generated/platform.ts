/**
 * platform API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module platform by scripts/generate-types.ts
 *
 * Last updated: 2026-06-20T00:51:38.552Z
 */

/**
 * 1、创建主播
2、接口支持https协议
 */
export interface Api9dddRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、创建主播
2、接口支持https协议
 */
export interface Api9dddResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 标签数据 【[Data字段说明](#Data 参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * Data nested object
 */
export interface Data {
  /** 主播ID */
  Data自身?: number;
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
/**
 * 1、查询主播详情
2、接口支持https协议
 */
export interface Api251bRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 主播ID */
  anchorId: number;
}
/**
 * 1、查询主播详情
2、接口支持https协议
 */
export interface Api251bResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 标签数据 【[Data字段说明](#Data 参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * Data nested object
 */
export interface Data {
  /** 主播ID */
  anchorId?: number;
  /** 昵称 */
  nickname?: string;
  /** 性别: M-男，W-女 */
  sex?: string;
  /** 头像 */
  avatar?: string;
  /** 简介 */
  description?: string;
  /** 状态: 0-禁用, 1-启用 */
  status?: number;
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
/**
 * 1、查询主播列表
2、接口支持https协议
 */
export interface Api2514Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 页数默认为1 */
  pageNumber?: number;
  /** 每页显示的数据条数，默认每页显示10条数据，最大值不能超过1000 */
  pageSize?: number;
  /** 状态: 0-禁用, 1-启用 */
  status?: number;
  /** 性别，M-男，W-女 */
  sex?: string;
  /** 昵称，支持模糊搜索 */
  nickname?: string;
  /** 场次开播起始时间，13位毫秒级时间戳，起始-结束时间范围最大365天 */
  startTime?: number;
  /** 场次开播结束时间，13位毫秒级时间戳，起始-结束时间范围最大365天 */
  endTime?: number;
}
/**
 * 1、查询主播列表
2、接口支持https协议
 */
export interface Api2514Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 标签数据 【[Data字段说明](#Data 参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * Data nested object
 */
export interface Data {
  /** 当前页码 */
  pageNumber?: number;
  /** 每页数据量 */
  pageSize?: number;
  /** 页面总数 */
  totalPages?: number;
  /** 总数据量 */
  totalItems?: number;
  /** 当前页内容【详见[contents字段说明](#contents参数描述)】 */
  contents?: unknown;
}
/**
 * Contents nested object
 */
export interface Contents {
  /** 主播ID */
  anchorId?: number;
  /** 昵称 */
  nickname?: string;
  /** 性别: M-男，W-女 */
  sex?: string;
  /** 头像 */
  avatar?: string;
  /** 0-禁用, 1-启用 */
  status?: number;
  /** 关联频道数 */
  channelCount?: number;
  /** 开播场次数 */
  sessionCount?: number;
  /** 观看累计时长(分钟) */
  watchDuration?: number;
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
/**
 * 1、查询主播频道关联关系
2、接口支持https协议
 */
export interface Api42ddRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 页数默认为1 */
  pageNumber?: number;
  /** 每页显示的数据条数，默认每页显示10条数据，最大值不能超过1000 */
  pageSize?: number;
  /** 主播ID */
  anchorId: number;
}
/**
 * 1、查询主播频道关联关系
2、接口支持https协议
 */
export interface Api42ddResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 标签数据 【[Data字段说明](#Data 参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * Data nested object
 */
export interface Data {
  /** 当前页码 */
  pageNumber?: number;
  /** 每页数据量 */
  pageSize?: number;
  /** 页面总数 */
  totalPages?: number;
  /** 总数据量 */
  totalItems?: number;
  /** 当前页内容【详见[contents字段说明](#contents参数描述)】 */
  contents?: unknown;
}
/**
 * Contents nested object
 */
export interface Contents {
  /** 频道号 */
  channelId?: number;
  /** 直播名称 */
  name?: string;
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
/**
 * 1、查询未关联主播的频道
2、接口支持https协议
 */
export interface Api4631Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 页数默认为1 */
  pageNumber?: number;
  /** 每页显示的数据条数，默认每页显示10条数据，最大值不能超过1000 */
  pageSize?: number;
  /** 频道ID或名称搜索关键字，频道ID精准匹配、名称模糊匹配 */
  keyword?: string;
}
/**
 * 1、查询未关联主播的频道
2、接口支持https协议
 */
export interface Api4631Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 标签数据 【[Data字段说明](#Data 参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * Data nested object
 */
export interface Data {
  /** 当前页码 */
  pageNumber?: number;
  /** 每页数据量 */
  pageSize?: number;
  /** 页面总数 */
  totalPages?: number;
  /** 总数据量 */
  totalItems?: number;
  /** 当前页内容【详见[contents字段说明](#contents参数描述)】 */
  contents?: unknown;
}
/**
 * Contents nested object
 */
export interface Contents {
  /** 频道号 */
  channelId?: number;
  /** 直播名称 */
  name?: string;
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
/**
 * 1、修改主播
2、接口支持https协议
 */
export interface Api9dddRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、修改主播
2、接口支持https协议
 */
export interface Api9dddResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 标签数据 【[Data字段说明](#Data 参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
/**
 * 1、修改直播状态
2、接口支持https协议
 */
export interface Api2517Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、修改直播状态
2、接口支持https协议
 */
export interface Api2517Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 标签数据 【[Data字段说明](#Data 参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
/**
 * 1、平台内容库分组列表
2、接口支持https协议
 */
export interface Api551cRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 标签类型: script-内容库，robot-成员库 */
  _type: string;
}
/**
 * 1、平台内容库分组列表
2、接口支持https协议
 */
export interface Api551cResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 标签数据 【[Data字段说明](#Data 参数描述)】 */
  data?: unknown;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * Data nested object
 */
export interface Data {
  /** 分组(labelId或标签)ID */
  id?: number;
  /** 分组名称 */
  name?: string;
  /** 类型: SYS-系统素材，USER-个人素材 */
  _type?: string;
  /** 最后更新时间 */
  updateTime?: number;
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
