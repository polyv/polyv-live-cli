/**
 * group API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module group by scripts/generate-types.ts
 */

/**
 * 1、查询集团账号给分账号的分配记录
2、接口支持https协议
 */
export interface Api7c80Request {
  /** 集团主账号appId【详见[集团账号2.0获取密钥](/live/api/getGroupSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 分帐号邮箱，多个以英文逗号分隔 */
  emails: string;
  /** 查询的分配记录类型，all包括点播和直播, live-直播, vod-点播 */
  _type?: string;
  /** 查询记录的开始时间，格式为yyyy-MM-dd HH:mm:ss */
  startTime?: string;
  /** 查询记录的结束时间，格式为yyyy-MM-dd HH:mm:ss */
  endTime?: string;
  /** 请求的页面 */
  page?: number;
  /** 页面大小 */
  pageSize?: number;
}
/**
 * 1、查询集团账号给分账号的分配记录
2、接口支持https协议
 */
export interface Api7c80Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 分页数据【详见[data字段说明](#data参数描述)】 */
  data?: string;
}
/**
 * Data nested object
 */
export interface Data {
  /** 响应状态文本信息 */
  pageNumber?: number;
  /** 响应状态文本信息 */
  totalPages?: number;
  /** 响应状态文本信息 */
  pageSize?: number;
  /** 分页数据【详见[Content字段说明](#Content参数描述)】 */
  contents?: unknown;
}
/**
 * Content nested object
 */
export interface Content {
  /** 分帐号邮箱 */
  email?: string;
  /** 分配记录时间 */
  date?: string;
  /** 来源 */
  origin?: string;
  /** 来源描述 */
  originText?: string;
  /** 增加的点播空间，单位字节 */
  space?: string;
  /** 增加的点播流量，单位字节 */
  flow?: string;
  /** 频道分配值 */
  channels?: string;
  /** 并发分配值 */
  concurrences?: number;
  /** 分钟数分配值 */
  duration?: string;
}
/**
 * 1、接口用于分配直播的并发数
2、接口支持https协议
 */
export interface Api1ddaRequest {
  /** 集团主账号appId【详见[集团账号2.0获取密钥](/live/api/getGroupSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 分帐号邮箱 */
  email: string;
  /** 分配的类型，add：新增,recover:回收 默认为add新增 */
  _type?: string;
  /** 分配的并发数,大于0的整数 */
  concurrences?: number;
}
/**
 * 1、接口用于分配直播的并发数
2、接口支持https协议
 */
export interface Api1ddaResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功返回success，请求失败为空字符串 */
  data?: string;
}
/**
 * 1、集团账号给分账号分配或回收流量接口
2、接口支持https协议
 */
export interface Api443eRequest {
  /** 集团主账号appId【详见[集团账号2.0获取密钥](/live/api/getGroupSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 分帐号邮箱 */
  email: string;
  /** 添加-add,回收-recover。默认为add */
  _type?: string;
  /** 是否回收所有，1-为回收所有。仅type为recover有效 */
  all?: number;
}
/**
 * 1、集团账号给分账号分配或回收流量接口
2、接口支持https协议
 */
export interface Api443eResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功返回success，请求失败为空字符串 */
  data?: string;
}
/**
 * 1、接口用于分配直播的分钟数
2、接口支持https协议
 */
export interface Api130eRequest {
  /** 集团主账号appId【详见[集团账号2.0获取密钥](/live/api/getGroupSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 分配给的账号邮箱地址 */
  email: string;
  /** 分配的类型，add：新增,recover:回收 默认为add新增 */
  _type?: string;
  /** 分配的分钟数,大于0的整数 */
  duration: number;
}
/**
 * 1、接口用于分配直播的分钟数
2、接口支持https协议
 */
export interface Api130eResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功返回success，请求失败为空字符串 */
  data?: string;
}
/**
 * 1、集团账号给分账号分配或回收空间接口
2、接口支持https协议
 */
export interface Api7072Request {
  /** 集团主账号appId【详见[集团账号2.0获取密钥](/live/api/getGroupSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 分帐号邮箱 */
  email: string;
  /** 添加-add,回收-recover。默认为add */
  _type?: string;
  /** 空间数值，单位G */
  space?: number;
  /** 是否回收所有，1-为回收所有。仅type为recover有效 */
  all?: number;
}
/**
 * 1、集团账号给分账号分配或回收空间接口
2、接口支持https协议
 */
export interface Api7072Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
}
