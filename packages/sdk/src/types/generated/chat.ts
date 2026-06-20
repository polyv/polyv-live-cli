/**
 * chat API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module chat by scripts/generate-types.ts
 *
 * Last updated: 2026-06-20T00:51:38.534Z
 */

/**
 * 1、批量导入频道或者通用的严禁词
2、接口支持https协议
3、接口URL中的{userId}为"直播账号ID"
 */
export interface Api366eRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 严禁词，json的数组格式，例如["forbiddenWords1","forbiddenWords2"]<br/>如果严禁词含有特殊字符，需要先encode一下，例：["*&#@"]需要encode为["*%26%23%40"] */
  words: string[];
  /** 频道号，非必填，<span class="error">不提交或者传-1则设置为账号级的严禁词，对该账号的所有频道都生效</span> */
  channelId?: string;
}
/**
 * 1、批量导入频道或者通用的严禁词
2、接口支持https协议
3、接口URL中的{userId}为"直播账号ID"
 */
export interface Api366eResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应结果【详见[data字段说明](/live/api/chat/banned/add_badwords.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、修改聊天室禁言ip
2、接口支持https协议
3、接口URL中的{channelId}为"频道号"
 */
export interface Api3941Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 禁言IP */
  ip: string;
}
/**
 * 1、修改聊天室禁言ip
2、接口支持https协议
3、接口URL中的{channelId}为"频道号"
 */
export interface Api3941Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功为当前设置的禁言ip数组 */
  data?: unknown;
}
/**
 * 1、取消被禁言的ip或者删除严禁词
2、接口支持https协议
3、接口URL中的{channelId}为"频道号"
 */
export interface Api6de8Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 请求类型<br/>ip：取消已禁言IP<br/>badword：删除严禁词 */
  _type: string;
  /** 要取消的ip或者严禁词，支持传入多个ip或者严禁词，通过英文逗号","分隔 */
  content: string;
}
/**
 * 1、取消被禁言的ip或者删除严禁词
2、接口支持https协议
3、接口URL中的{channelId}为"频道号"
 */
export interface Api6de8Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回“success”，错误返回空字符串 */
  data?: string;
}
/**
 * 1、删除账号通用设置的严禁词，支持批量删除多个严禁词
2、接口支持https协议
 */
export interface Api1396Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 要删除的严禁词，多个以英文逗号","分隔，例如："账号严禁词1,账号严禁词2" */
  words: string;
}
/**
 * 1、删除账号通用设置的严禁词，支持批量删除多个严禁词
2、接口支持https协议
 */
export interface Api1396Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功为删除后剩下的严禁词数组 */
  data?: unknown;
}
/**
 * 1、通过登录聊天室的userId，频道内踢出用户
2、接口支持https协议
 */
export interface Api5731Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
}
/**
 * 1、通过登录聊天室的userId，频道内踢出用户
2、接口支持https协议
 */
export interface Api5731Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回“SUCCESS”，错误返回空字符串 */
  data?: string;
}
/**
 * 1、通过登录聊天室的userId，频道内取消踢出用户
2、接口支持https协议
 */
export interface Api6a63Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
}
/**
 * 1、通过登录聊天室的userId，频道内取消踢出用户
2、接口支持https协议
 */
export interface Api6a63Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回“SUCCESS”，错误返回空字符串 */
  data?: string;
}
/**
 * 1、通过登录聊天室的userId，踢出用户
2、接口支持https协议
 */
export interface Api589aRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、通过登录聊天室的userId，踢出用户
2、接口支持https协议
 */
export interface Api589aResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回“SUCCESS”，错误返回空字符串 */
  data?: string;
}
/**
 * 1、通过登录聊天室的userId，取消踢出用户
2、接口支持https协议
 */
export interface Api48acRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、通过登录聊天室的userId，取消踢出用户
2、接口支持https协议
 */
export interface Api48acResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回“SUCCESS”，错误返回空字符串 */
  data?: string;
}
/**
 * 1、通过频道号，查询严禁词或者禁言ip列表
2、接口支持https协议
 */
export interface Api6de8Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 查询类型，不传默认为badword：严禁词<br/>ip：禁言ip<br />badword：严禁词 */
  _type?: string;
}
/**
 * 1、通过频道号，查询严禁词或者禁言ip列表
2、接口支持https协议
 */
export interface Api6de8Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功为严禁词数组或者禁言ip数组 */
  data?: unknown;
}
/**
 * 1、通过频道号，查询禁言的用户列表或者ip列表
2、接口支持https协议
 */
export interface Api75afRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 禁言类型<br />ip ：查询禁言IP <br />userId ：查询禁言用户Id */
  _type: string;
  /** 是否获取子频道<br />0：不获取<br />1：获取 */
  toGetSubRooms?: number;
}
/**
 * 1、通过频道号，查询禁言的用户列表或者ip列表
2、接口支持https协议
 */
export interface Api75afResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功为ip数组或userId数组 */
  data?: unknown;
}
/**
 * 1、通过频道号，查询踢人列表
2、接口支持https协议
 */
export interface Api745aRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
}
/**
 * 1、通过频道号，查询踢人列表
2、接口支持https协议
 */
export interface Api745aResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 被踢人的分页数据 【详见[data字段说明](/live/api/chat/banned/get_channel_kicked_user_list.md?id=data字段说明)】 */
  data?: unknown;
}
/**
 * 1、全平台（账号下）封禁的聊天室用户列表（包括禁言、踢人等）
2、接口支持https协议
 */
export interface Api5f1bRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 观众ID */
  viewerId?: string;
  /** 观众昵称 */
  nickName?: string;
  /** 分页页码，默认1 */
  pageNumber?: number;
  /** 分页大小，默认10，最大1000 */
  pageSize?: number;
}
/**
 * 1、全平台（账号下）封禁的聊天室用户列表（包括禁言、踢人等）
2、接口支持https协议
 */
export interface Api5f1bResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 禁言数据 【详见[data字段说明](/live/api/chat/banned/get_forbid_user_list.md?id=data字段说明)】 */
  data?: unknown;
}
/**
 * 1、查询账号下通用设置的严禁词列表
2、接口支持https协议
 */
export interface Api1396Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询账号下通用设置的严禁词列表
2、接口支持https协议
 */
export interface Api1396Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功为严禁词数组 */
  data?: unknown;
}
/**
 * 1、通过账号下的禁言列表
2、接口支持https协议
 */
export interface Api4b54Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 分页页码，默认1 */
  page?: number;
  /** 分页大小，默认10，最大1000 */
  size?: number;
}
/**
 * 1、通过账号下的禁言列表
2、接口支持https协议
 */
export interface Api4b54Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 禁言数据 【详见[data字段说明](/live/api/chat/banned/get_user_banned_list.md?id=data字段说明)】 */
  data?: unknown;
}
/**
 * 1、通过登录聊天室的userId，禁言或者解禁用户
2、接口支持https协议
 */
export interface Api39e6Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 聊天室用户ID（非直播账号ID），多个用户用半角逗号","隔开。 */
  userIds: string;
  /** Y表示禁言，N表示解除禁言 */
  toBanned?: string;
}
/**
 * 1、通过登录聊天室的userId，禁言或者解禁用户
2、接口支持https协议
 */
export interface Api39e6Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回“SUCCESS”，错误返回空字符串 */
  data?: string;
}
/**
 * 1、通过登录聊天室的userId，禁言或者解禁用户
2、接口支持https协议
 */
export interface Api57eaRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 聊天室用户ID（非直播账号ID），json数组格式 */
  viewerIds: string[];
  /** Y表示禁言，N表示解除禁言 */
  banned: string;
}
/**
 * 1、通过登录聊天室的userId，禁言或者解禁用户
2、接口支持https协议
 */
export interface Api57eaResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回“SUCCESS”，错误返回空字符串 */
  data?: string;
}
/**
 * 1、更新聊天审核开关
2、接口支持https协议
 */
export interface Api1c24Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: number;
  /** 开关 Y/N, 不传时根据当前开关值进行开启/关闭 */
  enabled?: string;
}
/**
 * 1、更新聊天审核开关
2、接口支持https协议
 */
export interface Api1c24Response {
  /** 响应代码，成功为200，失败为400，签名错误为403，异常错误500 */
  code?: string;
  /** 成功为success，失败为error */
  status?: string;
  /** 错误时为错误提示消息 */
  message?: string;
  /** 设置成功返回当前聊天审核开关类型，开启为true，没开启为false */
  data?: boolean;
}
/**
 * 1、用于直播中，给开播讲师以弹窗形式发送特定消息的能力（当前仅支持给讲师触发）
2、接口支持https协议
 */
export interface Api7a4aRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 频道号 */
  channelId: string;
  /** 消息说明<br/>长度大于等于1，长度小于等于500 */
  message: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
  /** 标题<br/>长度大于等于1，长度小于等于100 */
  title: string;
}
/**
 * 1、用于直播中，给开播讲师以弹窗形式发送特定消息的能力（当前仅支持给讲师触发）
2、接口支持https协议
 */
export interface Api7a4aResponse {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 成功响应的数据 */
  data?: boolean;
  /** 状态码非200时的错误信息【详见[Error参数描述](#Error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
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
 * 1、通过频道号，查询频道聊天室当前在线人数
2、接口支持https协议
 */
export interface Api3da6Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
}
/**
 * 1、通过频道号，查询频道聊天室当前在线人数
2、接口支持https协议
 */
export interface Api3da6Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 当前在线人数 */
  data?: number;
}
/**
 * 1、通过频道号，删除全部聊天记录
2、接口支持https协议
3、接口URL中的{channelId}为"频道号"
 */
export interface Api3c2bRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、通过频道号，删除全部聊天记录
2、接口支持https协议
3、接口URL中的{channelId}为"频道号"
 */
export interface Api3c2bResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为true */
  data?: string;
}
/**
 * 1、通过聊天id，删除聊天记录
2、接口支持https协议
3、接口URL中的{channelId}为"频道号"
 */
export interface Api50edRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 聊天记录对应的id，该参数获取自【[查询频道聊天记录](/live/api/chat/message/get_message_list.md)】 */
  id: string;
}
/**
 * 1、通过聊天id，删除聊天记录
2、接口支持https协议
3、接口URL中的{channelId}为"频道号"
 */
export interface Api50edResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功为"success" */
  data?: string;
}
/**
 * 1、查询账号下频道聊天记录
2、接口支持https协议
 */
export interface Api7038Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 查询的开始时间 13位毫秒级时间戳 */
  startTime?: number;
  /** 查询的结束时间 13位毫秒级时间戳 */
  endTime?: number;
  /** 第一次查询不传，后面的查询使用前一次返回的cursor即可，直到返回list没有数据 */
  cursor?: string;
  /** 每页大小，默认为10，最大值为1000 */
  size?: number;
}
/**
 * 1、查询账号下频道聊天记录
2、接口支持https协议
 */
export interface Api7038Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应的数据【详见[data字段说明](#data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过频道号，查询一段时间内的聊天记录
2、接口支持https协议
 */
export interface Api7a77Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 聊天记录的开始时间<br>格式为yyyy-MM-dd，例如：2021-03-01<br>或者格式为yyyy-MM-dd HH:mm:ss，例如：2021-03-01 16:30:12 */
  startDay: string;
  /** 聊天记录的结束时间，要求同上 */
  endDay: string;
  /** 频道号 */
  channelId: string;
  /** 获取第几页聊天记录，默认为1 */
  page?: number;
  /** 每页记录数，默认为1000，最大为1000，大于1000将不会返回contents数据 */
  pageSize?: number;
  /** 用户类型，可以选择多个类型，用英文逗号隔开<br>slice：云课堂学员<br>teacher：讲师<br>guest：嘉宾<br>manager：管理员<br>assistant：助教<br>viewer：特邀观众<br>monitor：场监<br>attendee：研讨会参与者<br>student：普通直播观众 */
  userType?: string;
  /** 聊天记录审核状态，默认pass：已审核<br>pass：已审核<br>censor：审核中和删除 */
  status?: string;
  /** 类型，不填默认公聊<br>extend：管理员私聊 */
  source?: string;
  /** 如果有房间号，需要传入房间号，默认不传 */
  roomId?: string;
  /** 是否返回当前查询总数，Y：是，N：否，默认为N <br> 注：此参数可能会影响接口响应性能，若非强烈需求，建议不要传此参数，可以根据返回结果中的 `contents` 数组长度来判断是否还有下一页 */
  hasTotal?: string;
}
/**
 * 1、通过频道号，查询一段时间内的聊天记录
2、接口支持https协议
 */
export interface Api7a77Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 聊天信息数组 【详见[data字段说明](/live/api/chat/message/get_message_list.md?id=data字段说明)】 */
  data?: unknown;
}
/**
 * 1、发送审核通过的聊天消息
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api465cRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 频道ID */
  channelId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
}
/**
 * 1、发送审核通过的聊天消息
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api465cResponse {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 成功响应的数据【详见[Data参数描述](#Data参数描述)】 */
  data?: unknown;
  /** 状态码非200时的错误信息【详见[Error参数描述](#Error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
}
/**
 * Data nested object
 */
export interface Data {
  /** 保利威聊天室消息id */
  id?: string;
  /** 错误或正常的提示，如：发送成功 */
  msg?: string;
  /** 外部消息Id，即请求参数中的msgId */
  msgId?: string;
  /** 发言是否成功，true：成功，false：失败 */
  status?: boolean;
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
 * 1、通过聊天室API，发送图文信息
2、接口支持https协议
3、接口URL中的{channelId}为"频道号"
 */
export interface Api1eb5Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 直播账号id */
  userId: string;
  /** 需要发送的图片或是文字，二者不能同时为空，可以同时提交, content需要进行base64编码，详见[url安全的base64编码规则](#url安全的base64编码规则)】 */
  content_imgUrl: string;
}
/**
 * 1、通过聊天室API，发送图文信息
2、接口支持https协议
3、接口URL中的{channelId}为"频道号"
 */
export interface Api1eb5Response {
  /** 响应状态文本信息 */
  status?: string;
  /** 响应数据 */
  result?: string;
}
/**
 * 1、通过管理员，发送聊天消息
2、接口支持https协议
 */
export interface Api30aeRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 聊天信息内容 */
  content: string;
  /** 发送人角色（目前为只提供管理员角色，值为"ADMIN"） */
  role: string;
}
/**
 * 1、通过管理员，发送聊天消息
2、接口支持https协议
 */
export interface Api30aeResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回“The message send success!”，错误返回空字符串 */
  data?: string;
}
/**
 * 1、通过HTTP接口发送聊天文本内容，可指定发言者的头像、头衔、昵称，无需连接聊天室
2、接口支持https协议
3、文本消息和图片消息必传一个
 */
export interface Api7d9dRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 发送的文本消息，文本消息和图片消息必传一个，最长为2000字符 */
  msg?: string;
  /** 发送的图片消息地址，url不支持带参数。文本消息和图片消息必传一个<br/>发送图片消息时，设置的昵称、头衔和头像暂不生效 */
  imgUrl?: string;
  /** 管理员头像，url不支持带参数。 */
  pic: string;
  /** 昵称，最大为8个长度，超出会被截断 */
  nickName: string;
  /** 管理员索引，可以指定多个管理员发送消息，默认只有一个管理员 */
  adminIndex?: number;
  /** 头衔，最大为4个长度，超出会被截断，不传参数则表示无头衔 */
  actor?: string;
  /** 当频道开启审核后消息是否需要经过审核，默认为N<br />Y：不需要<br />N：需要 */
  freeReview?: string;
  /** 接口版本，目前可选版本(3.2)，不同的版本返回数据会有细微差异，详情查看响应示例 */
  apiVersion: string;
}
/**
 * 1、通过HTTP接口发送聊天文本内容，可指定发言者的头像、头衔、昵称，无需连接聊天室
2、接口支持https协议
3、文本消息和图片消息必传一个
 */
export interface Api7d9dResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回“发送成功”或者消息id，取决于请求参数apiVersion，具体见返回示例；错误返回空字符串 */
  data?: string;
}
/**
 * 1、通过频道号，查询管理员身份信息
2、接口支持https协议
3、接口URL中的{channelId}为"频道号"
 */
export interface Api39bbRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、通过频道号，查询管理员身份信息
2、接口支持https协议
3、接口URL中的{channelId}为"频道号"
 */
export interface Api39bbResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 管理员身份信息 【详见[data字段说明](/live/api/chat/role/get_admin_info.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、获取讲师信息
2、接口支持https协议
 */
export interface Api40ebRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
}
/**
 * 1、获取讲师信息
2、接口支持https协议
 */
export interface Api40ebResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回true，错误返回空.【详见[Data字段说明](#Data参数描述)】 */
  data?: Record<string, unknown>;
}
/**
 * Data nested object
 */
export interface Data {
  /** 讲师id，同频道号 */
  account?: string;
  /** 讲师头衔 */
  actor?: string;
  /** 讲师头像，例：//liveimages.videocc.net/uploaded/images/2023/04/gjps9etdpx.jpg */
  avatar?: string;
  /** 频道号 */
  channelId?: string;
  /** 讲师昵称 */
  nickname?: string;
  /** 讲师登录密码 */
  passwd?: string;
  /** 该字段为null */
  loginCode?: string;
  /** 该字段为null */
  role?: string;
}
/**
 * 1、通过频道号，获取聊天室在线列表
 */
export interface Api3da5Request {
  /** 房间号 */
  roomId: string;
  /** 页码，默认1 */
  page?: number;
  /** 每一页条数，默认100，最多返回1000条 */
  len?: string;
  /** 是否获取子频道的用户，true为获取，false为不获取 */
  toGetSubRooms?: boolean;
  /** 回调函数，用于解决前端请求跨域问题 */
  callback?: unknown;
}
/**
 * 1、通过频道号，获取聊天室在线列表
 */
export interface Api3da5Response {
  /** 总人数 */
  count?: number;
  /** 用户对象（具体看下面用户对象说明） */
  userlist?: unknown;
}
/**
 * 1、通过频道号，修改管理员信息，提交参数都不能为空
2、接口URL中的{channelId}为"频道号"
3、（actor, nickname, timestamp, appId）参与sign签名，并和sign一起通过post表单传递，文件通过二进制流提交到服务器端。
4、接口支持https协议
 */
export interface Api39bbRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 管理员昵称，长度不能超过8 */
  nickname: string;
  /** 管理员头衔，长度不能超过4 */
  actor: string;
  /** 管理员头像，支持jpg、jpeg、png三种格式，大小不能超过2Mb */
  avatar: File | Blob;
}
/**
 * 1、通过频道号，修改管理员信息，提交参数都不能为空
2、接口URL中的{channelId}为"频道号"
3、（actor, nickname, timestamp, appId）参与sign签名，并和sign一起通过post表单传递，文件通过二进制流提交到服务器端。
4、接口支持https协议
 */
export interface Api39bbResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为"修改成功" */
  data?: string;
}
/**
 * 1、通过频道号，修改讲师的相关信息
2、接口支持https协议
 */
export interface Api2f83Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 讲师昵称 */
  nickname?: string;
  /** 讲师头衔 */
  actor?: string;
  /** 频道密码 */
  passwd?: string;
  /** 头像图片地址，如果为空，则使用默认头像 */
  avatar?: string;
}
/**
 * 1、通过频道号，修改讲师的相关信息
2、接口支持https协议
 */
export interface Api2f83Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回true，错误返回空字符串 */
  data?: string;
}
