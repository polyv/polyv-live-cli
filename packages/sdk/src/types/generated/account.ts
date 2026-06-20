/**
 * account API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module account by scripts/generate-types.ts
 *
 * Last updated: 2026-06-20T00:51:38.483Z
 */

/**
 * 1、查询账号下所有频道详细信息列表
2、接口支持https协议
 */
export interface Api3c3bRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 页数默认为1 */
  page?: number;
  /** 每页显示的数据条数，默认每页显示20条数据 */
  pageSize?: number;
  /** 所属分类id */
  categoryId?: string;
  /** 观看页状态筛选<br/>live：直播中<br/>playback：回放中<br/>end：已结束<br/>waiting：等待中 */
  watchStatus?: string;
  /** 频道名称，模糊查询 */
  keyword?: string;
}
/**
 * 1、查询账号下所有频道详细信息列表
2、接口支持https协议
 */
export interface Api3c3bResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回频道详细信息【详见[data字段说明](/live/api/account/channel_detail.md?id=polyv1)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、根据分类id和频道名称查询频道号列表
2、接口支持https协议
 */
export interface Api4782Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 返回指定分类ID下的频道号列表；不传，返回账号下所有的频道列表 */
  categoryId?: string;
  /** 频道名称，模糊查询 */
  keyword?: string;
  /** 标签id */
  labelId?: string;
}
/**
 * 1、根据分类id和频道名称查询频道号列表
2、接口支持https协议
 */
export interface Api4782Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回频道列表【详见[data字段说明](/live/api/account/channels.md?id=polyv1)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、创建直播分类
2、接口支持https协议
 */
export interface Api3797Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 分类名称 */
  categoryName: string;
}
/**
 * 1、创建直播分类
2、接口支持https协议
 */
export interface Api3797Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回分类信息【详见[data字段说明](/live/api/account/create_category.md?id=polyv1)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、删除直播频道分类
2、接口支持https协议
 */
export interface Api3797Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道分类id，可通过[查询直播分类](/live/api/account/get_category_list)获取频道分类id */
  categoryId: string;
}
/**
 * 1、删除直播频道分类
2、接口支持https协议
 */
export interface Api3797Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功或失败都是返回空字符串 */
  data?: string;
}
/**
 * 1、
2、接口支持https协议
 */
export interface DemoRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、
2、接口支持https协议
 */
export interface DemoResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  data?: unknown;
}
/**
 * 1、查询直播分类信息
2、接口支持https协议
 */
export interface Api3797Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询直播分类信息
2、接口支持https协议
 */
export interface Api3797Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回直播分类信息的数组【详见[data字段说明](/live/api/account/get_category_list.md?id=polyv1)】 */
  data?: unknown;
}
/**
 * 1、接口URL中的{userId}为直播账号ID
2、根据是否提交channelId来查询账号收入详细信息
3、接口支持https协议
 */
export interface Api555bRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 查询的开始日期 格式为yyyy-MM-dd */
  startDate: string;
  /** 查询的结束日期 格式为yyyy-MM-dd */
  endDate: string;
  /** 要查询的频道号，<span class="error">不提交或者传0则查询所有频道</span> */
  channelId?: string;
  /** 页码，不提交默认为1 */
  page?: number;
  /** 每页数据大小，不提交默认为12 */
  pageSize?: number;
}
/**
 * 1、接口URL中的{userId}为直播账号ID
2、根据是否提交channelId来查询账号收入详细信息
3、接口支持https协议
 */
export interface Api555bResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回收入详情信息【详见[data字段说明](/live/api/account/get_income_detail.md?id=polyv1)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、查询账号下所有的频道缩略信息列表
2、列表信息仅包含频道缩略信息，如需频道具体信息，请使用【获取频道信息】接口
3、接口支持https协议
 */
export interface Api364eRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 页码，默认为1 */
  page?: number;
  /** 每页数据大小，默认每页显示20条数据 */
  pageSize?: number;
  /** 所属分类id */
  categoryId?: string;
  /** 观看页状态筛选<br/>live：直播中<br/>playback：回放中<br/>end：已结束<br/>waiting：未开始 */
  watchStatus?: string;
  /** 频道名称，模糊查询 */
  keyword?: string;
}
/**
 * 1、查询账号下所有的频道缩略信息列表
2、列表信息仅包含频道缩略信息，如需频道具体信息，请使用【获取频道信息】接口
3、接口支持https协议
 */
export interface Api364eResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回频道缩略信息【详见[data字段说明](/live/api/account/get_simple_channel_list.md?id=polyv1)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、查询账号可用直播分钟数
2、接口支持https协议
 */
export interface Api622dRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询账号可用直播分钟数
2、接口支持https协议
 */
export interface Api622dResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回账号可用直播分钟数信息【详见[data字段说明](/live/api/account/get_user_durations.md?id=polyv1)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、查询用户账号信息接口
2、接口支持https协议
 */
export interface Api416eRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询用户账号信息接口
2、接口支持https协议
 */
export interface Api416eResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功响应时返回用户账号信息【详见[data字段说明](/live/api/account/get_user_info.md?id=polyv1)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、查询账号连麦分钟数
2、接口支持https协议
 */
export interface Api2545Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询账号连麦分钟数
2、接口支持https协议
 */
export interface Api2545Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功响应时返回连麦分钟数使用量和剩余量信息【详见[data字段说明](/live/api/account/mic_duration.md?id=polyv1)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过一个（发起转播的）频道分页查询能够被它设置接收转播的频道列表
2、接口支持https协议
 */
export interface Api6049Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** （发起转播的）频道号 */
  channelId: string;
  /** 频道名称，支持模糊搜索 */
  keyword?: string;
  /** 查询页数，默认1 */
  page?: number;
  /** 每页数据大小，默认10 */
  pageSize?: number;
}
/**
 * 1、通过一个（发起转播的）频道分页查询能够被它设置接收转播的频道列表
2、接口支持https协议
 */
export interface Api6049Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，成功响应时返回全账号频道基础信息【详见[data参数描述](#Data参数描述)】 */
  data?: Record<string, unknown>;
}
/**
 * Data nested object
 */
export interface Data {
  /** 每页数据大小，默认20，最大20 */
  pageSize?: number;
  /** 当前页数 */
  pageNumber?: number;
  /** 总的条数 */
  totalItems?: number;
  /** 查询的结果列表【详见[Contents参数描述](#Contents参数描述)】 */
  contents?: unknown;
  /** 当前页第一条记录在总结果集中的位置 */
  startRow?: number;
  /** 是否为第一页，值为：true/false，默认为false */
  firstPage?: boolean;
  /** 是否为最后一页，值为：true/false，默认为false */
  lastPage?: boolean;
  /** 上一页编号 */
  prePageNumber?: number;
  /** 每页数量大小 */
  limit?: number;
  /** 下一页编号 */
  nextPageNumber?: number;
  /** 当前页最后一条记录在总结果集中的位置 */
  endRow?: number;
  /** 总页数 */
  totalPages?: number;
  /** 分页起始记录 */
  offset?: number;
}
/**
 * Contents nested object
 */
export interface Contents {
  /** 频道号 */
  channelId?: string;
  /** 频道名称 */
  name?: string;
  /** 频道密码，非研讨会场景使用 */
  channelPasswd?: string;
  /** 研讨会主持人密码，研讨会场景使用 */
  hostPasswd?: string;
  /** 研讨会参会人密码，研讨会场景使用 */
  attendeePasswd?: string;
  /** 频道所属分类名称 */
  categoryName?: string;
  /** 观看条件，使用,分隔，如：none,none<br/>none：无条件，<br/>pay：付费观看，<br/>code：验证码观看，<br/>phone：白名单观看，<br/>info：登记观看，<br/>custom：自定义授权观看，<br/>external：外部授权,<br/>direct：直接授权 */
  authType?: string;
  /** 最近场次观看人数 */
  recentViewCount?: number;
  /** 第一个子频道号，如果没有子频道则为null */
  subChannelAccount?: string;
  /** 第一个子频道密码，如果没有子频道则为null */
  subChannelPasswd?: string;
  /** 直播开始时间 */
  startTime?: string;
  /** 关联转播的频道号，如果没有关联则为null */
  transmitChannelId?: string;
  /** 场景<br/>alone：活动直播<br/>ppt：三分屏<br/>topclass：大班课 */
  scene?: string;
}
/**
 * 1、设置账号下转存回放视频成功通知回调地址的接口
2、接口URL中的{userId}为直播账号ID
3、接口支持https协议
 */
export interface Api529dRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 回调地址url，不提交表示关闭回调功能，如果提交，必须以 http:// 或者 https:// 开头 */
  url?: string;
}
/**
 * 1、设置账号下转存回放视频成功通知回调地址的接口
2、接口URL中的{userId}为直播账号ID
3、接口支持https协议
 */
export interface Api529dResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功或失败都返回空字符串 */
  data?: string;
}
/**
 * 1、设置账号下录制视频通知回调地址的接口
2、接口URL中的{userId}为 直播账号ID
3、接口支持https协议
 */
export interface Api6059Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 回调地址url，不提交表示关闭回调功能，如果提交，必须以 http:// 或者 https:// 开头 */
  url?: string;
}
/**
 * 1、设置账号下录制视频通知回调地址的接口
2、接口URL中的{userId}为 直播账号ID
3、接口支持https协议
 */
export interface Api6059Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功或失败都返回空字符串 */
  data?: string;
}
/**
 * 1、设置账号下频道直播状态改变通知回调地址的接口
3、接口URL中的{userId}为 直播账号ID
2、接口支持https协议
 */
export interface Api3537Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 回调地址url，不提交表示关闭回调功能，如果提交，必须以 http:// 或者 https:// 开头 */
  url?: string;
}
/**
 * 1、设置账号下频道直播状态改变通知回调地址的接口
3、接口URL中的{userId}为 直播账号ID
2、接口支持https协议
 */
export interface Api3537Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功或失败都返回空字符串 */
  data?: string;
}
/**
 * 1、设置直播子账号单点登录的token
2、token参数请勿过于简单，建议使用16位随机字符串
3、token设置后需要10秒内及时使用
4、接口支持https协议
 */
export interface Api3daaRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 唯一的字符串 */
  token: string;
  /** 直播子账号对应邮箱账号 */
  childEmail: string;
}
/**
 * 1、设置直播子账号单点登录的token
2、token参数请勿过于简单，建议使用16位随机字符串
3、token设置后需要10秒内及时使用
4、接口支持https协议
 */
export interface Api3daaResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回success字符串，失败时返回空字符串 */
  data?: string;
}
/**
 * 1、设置账号单点登录的token
2、token参数请勿过于简单，建议使用16位随机字符串
3、token设置后需要10秒内及时使用
4、接口支持https协议
 */
export interface Api2f0aRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 唯一的字符串 */
  token: string;
}
/**
 * 1、设置账号单点登录的token
2、token参数请勿过于简单，建议使用16位随机字符串
3、token设置后需要10秒内及时使用
4、接口支持https协议
 */
export interface Api2f0aResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回success字符串，失败时返回空字符串 */
  data?: string;
}
export interface Api60f5Request {
  /** 从API设置中获取，在直播系统登记的appId */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
  /** 唯一的字符串 */
  token: string;
  /** 签名，为32位大写的MD5值 */
  sign: string;
  /** 直播子账号的邮箱账号（调用子账号单点登录时才需要提交该参数） */
  childEmail?: string;
}
/**
 * 1、查询开关状态，可查询全局开关状态或频道开关状态
2、接口支持https协议
3、isClosePreview当enabled值为Y时，表示的是关闭系统观看页；closeDanmu当enabled值为Y时，表示的是关闭弹幕；closeChaterList当enabled值为Y时，表示的是关闭在线列表
4、当频道非三分屏场景时才返回：mobileAudio移动端音频开关，redPack红包开关，praise点赞语开关，chatPlayBack聊天回放开关
 */
export interface Api633cRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号，不传该参数为查询全局设置 */
  channelId?: string;
}
/**
 * 1、查询开关状态，可查询全局开关状态或频道开关状态
2、接口支持https协议
3、isClosePreview当enabled值为Y时，表示的是关闭系统观看页；closeDanmu当enabled值为Y时，表示的是关闭弹幕；closeChaterList当enabled值为Y时，表示的是关闭在线列表
4、当频道非三分屏场景时才返回：mobileAudio移动端音频开关，redPack红包开关，praise点赞语开关，chatPlayBack聊天回放开关
 */
export interface Api633cResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功响应时返回开关状态信息数组【详见[data字段说明](/live/api/account/switch_get.md?id=polyv1)】 */
  data?: unknown;
}
/**
 * 1、修改功能开关设置，可修改全局开关设置或频道开关设置
2、接口支持https协议
3、开关类型若未注明默认Y表示开启；isClosePreview当enabled值为Y时，表示的是关闭系统观看页；closeDanmu当enabled值为Y时，表示的是关闭弹幕；closeChaterList当enabled值为Y时，表示的是关闭在线列表
 */
export interface Api633cRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号，不传该参数则表示修改全局设置 */
  channelId?: string;
  /** 开关类型【取值详见[type字段说明](/live/api/account/switch_update.md?id=polyv1)】 */
  _type: string;
  /** 开关值，取值Y/N，具体说明和类型相关【说明详见[type字段说明](/live/api/account/switch_update.md?id=polyv1)】 */
  enabled: string;
}
/**
 * 1、修改功能开关设置，可修改全局开关设置或频道开关设置
2、接口支持https协议
3、开关类型若未注明默认Y表示开启；isClosePreview当enabled值为Y时，表示的是关闭系统观看页；closeDanmu当enabled值为Y时，表示的是关闭弹幕；closeChaterList当enabled值为Y时，表示的是关闭在线列表
 */
export interface Api633cResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回true，返回失败时返回空字符串 */
  data?: string;
}
/**
 * 1、修改直播频道分类的名称
2、接口支持https协议
 */
export interface Api51ecRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道分类id */
  categoryId: string;
  /** 频道分类名称 */
  categoryName: string;
}
/**
 * 1、修改直播频道分类的名称
2、接口支持https协议
 */
export interface Api51ecResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功或失败都是返回空字符串 */
  data?: string;
}
/**
 * 1、修改直播频道分类的顺序
2、接口支持https协议
 */
export interface Api51e4Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 分类id */
  categoryId: string;
  /** 将分类id位置移动到该id对应的分类之后 */
  afterCategoryId: string;
}
/**
 * 1、修改直播频道分类的顺序
2、接口支持https协议
 */
export interface Api51e4Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功或失败都返回空字符串 */
  data?: string;
}
/**
 * 1、查询账号下所有的频道基础信息列表
2、接口支持https协议
 */
export interface Api2489Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 分类ID，多个id用英文逗号分隔 */
  categoryIds?: string;
  /** 查询页数，默认1 */
  page?: number;
  /** 每页数据大小，默认20，最大20 */
  pageSize?: number;
}
/**
 * 1、查询账号下所有的频道基础信息列表
2、接口支持https协议
 */
export interface Api2489Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功响应时返回全账号频道基础信息【详见[data字段说明](/live/api/account/user_channel_basic_list.md?id=polyv1)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、查询账号下回放列表和点播列表, 注意：不包括暂存列表
2、接口支持https协议
 */
export interface Api23c8Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 频道号，不传查询账号下所有回放视频 */
  channelId?: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 页码，默认为1 */
  page?: string;
  /** 每页数据大小，默认为20，合法范围为1-1000 */
  pageSize?: string;
  /** 排序规则，取值<br/>timeDesc：按createdTime降序<br/>rankDesc：按rank降序<br/>time：按createdTime升序<br/>rank：按rank升序，默认是timeDesc */
  order?: string;
  /** playback：回放列表<br/>vod：点播列表，默认是playback */
  listType?: string;
}
/**
 * 1、查询账号下回放列表和点播列表, 注意：不包括暂存列表
2、接口支持https协议
 */
export interface Api23c8Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回回放视频列表信息【详见[data字段说明](/live/api/account/user_playback_list.md?id=polyv1)】 */
  data?: Record<string, unknown>;
}
