/**
 * uncategorized API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module uncategorized by scripts/generate-types.ts
 *
 * Last updated: 2026-06-19T17:20:59.347Z
 */

/**
 * 1、给部分账号提供设置重点直播列表，仅开通功能的账号可以使用
2、接口支持https协议
 */
export interface Api3892Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 重点直播的频道号列表，使用,分隔，会将原有设置的重点频道号进行覆盖，不传会清空重点直播 */
  channelIds?: string;
}
/**
 * 1、给部分账号提供设置重点直播列表，仅开通功能的账号可以使用
2、接口支持https协议
 */
export interface Api3892Response {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
  /** 返回null */
  data?: string;
  /** 错误信息【详见[Error参数描述](#Error参数描述)】 */
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
/**
 * 1、根据人员获取观看时长变化数据
2、接口支持https协议
 */
export interface Api4832Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 场次Id */
  sessionId: string;
  /** 学员观众Id */
  viewerId: string;
}
/**
 * 1、根据人员获取观看时长变化数据
2、接口支持https协议
 */
export interface Api4832Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回分发列表信息【详见[Data字段说明](#Data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#Error参数描述)】 */
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
 * Data nested object
 */
export interface Data {
  /** 学员观众Id */
  viewerId?: string;
  /** 频道号 */
  channelId?: string;
  /** 场次号 */
  sessionId?: string;
  /** 应学时长 */
  shouldStudyTime?: number;
  /** 已学时长 */
  grandTotalTime?: number;
  /** 学习状态，如果学习时长不低于90%，则学习状态为已完成<br/>Y：已完成<br/>N：未完成 */
  studyStatus?: string;
}
/**
 * 1、获取某个频道号下的对应学习观看记录
2、接口支持https协议
 */
export interface Api59c6Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 场次Id，多个使用英文逗号分隔 */
  sessionIds?: string;
  /** 学员观众Id，多个使用英文逗号分隔 */
  viewerIds?: string;
  /** 每页数据大小，默认每页显示10条数据，最大200 */
  pageSize?: number;
  /** 下一页的凭证，从当前页的返回数据里获取，第一页不需要传 */
  token?: string;
}
/**
 * 1、获取某个频道号下的对应学习观看记录
2、接口支持https协议
 */
export interface Api59c6Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回分发列表信息【详见[Data字段说明](#Data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#Error参数描述)】 */
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
 * Data nested object
 */
export interface Data {
  /** 每页数据量 */
  pageSize?: number;
  /** 查询下一页的凭证 */
  token?: string;
  /** 当前页内容【详见[Contents字段说明](#Contents参数描述)】 */
  contents?: unknown;
}
/**
 * Contents nested object
 */
export interface Contents {
  /** 学员观众Id */
  viewerId?: string;
  /** 频道号 */
  channelId?: string;
  /** 场次号 */
  sessionId?: string;
  /** 应学时长 */
  shouldStudyTime?: number;
  /** 已学时长 */
  grandTotalTime?: number;
  /** 学习状态，如果学习时长不低于90%，则学习状态为已完成<br/>Y：已完成<br/>N：未完成 */
  studyStatus?: string;
}
/**
 * 1、根据频道id和场次id获取用户发言次数统计
2、搭配富德定制化开播端使用
3、接口支持https协议
 */
export interface Api391aRequest {
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
 * 1、根据频道id和场次id获取用户发言次数统计
2、搭配富德定制化开播端使用
3、接口支持https协议
 */
export interface Api391aResponse {
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
  /** 分公司id */
  id?: string;
  /** 分公司名称 */
  name?: string;
  /** 登录人数 */
  total?: number;
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
 * 1、获取某时间段内有变化人员
2、接口支持https协议
 */
export interface Api23d7Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 开始时间，格式为：yyyy-MM-dd，仅支持前30天数据，不支持获取当天数据 */
  startTime: string;
  /** 结束时间，格式为：yyyy-MM-dd */
  endTime: string;
  /** 每页数据大小，默认每页显示10条数据，最大200 */
  pageSize?: number;
  /** 下一页的凭证，从当前页的返回数据里获取，第一页不需要传 */
  token?: string;
}
/**
 * 1、获取某时间段内有变化人员
2、接口支持https协议
 */
export interface Api23d7Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回分发列表信息【详见[Data字段说明](#Data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#Error参数描述)】 */
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
 * Data nested object
 */
export interface Data {
  /** 每页数据量 */
  pageSize?: number;
  /** 查询下一页的凭证 */
  token?: string;
  /** 当前页内容【详见[Contents字段说明](#Contents参数描述)】 */
  contents?: unknown;
}
/**
 * Contents nested object
 */
export interface Contents {
  /** 学员观众Id */
  viewerId?: string;
  /** 频道号 */
  channelId?: string;
  /** 场次号 */
  sessionId?: string;
  /** 应学时长 */
  shouldStudyTime?: number;
  /** 已学时长 */
  grandTotalTime?: number;
  /** 学习状态，如果学习时长不低于90%，则学习状态为已完成<br/>Y：已完成<br/>N：未完成 */
  studyStatus?: string;
}
/**
 * 1、集团账号查询主账号账单
2、接口支持https协议
 */
export interface Apib8ccRequest {
  /** 集团主账号appId */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 账期，格式yyyyMM，比如202205，时间需要在202204以后 */
  billingDate: string;
  /** 隔离区ID，使用创建账号返回的【用户全局ID】，即userId<br/>隔离区ID不能跨集团账号使用 */
  isolationId: string;
  /** 每页数据大小，默认10，最大值1000 */
  pageSize?: number;
  /** 当前的页数，默认1 */
  pageNumber?: number;
}
/**
 * 1、集团账号查询主账号账单
2、接口支持https协议
 */
export interface Apib8ccResponse {
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
  /** 账单列表【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
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
  /** 集团主帐号ID */
  unionId?: string;
  /** 账期 */
  accountPeriod?: string;
  /** 产品 云直播/云点播 */
  production?: string;
  /** 用量类型<br/>云直播：观看分钟数/连麦分钟数/无延迟分钟数/导播时长<br/>云点播：视频播放/存储空间 */
  category?: string;
  /** 用量 */
  itemConsumed?: number;
  /** 用量单位 */
  itemConsumedUnit?: string;
  /** 结算日期，天，格式为YYYY-MM-DD */
  statAt?: string;
  /** 交易类型<br/>1：用量结算<br/>2：金额结算<br/>3：补扣调账<br/>4：退费调账 */
  tradeType?: number;
}
/**
 * 1、查询频道合法状态
2、接口支持https协议
 */
export interface Api7f77Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号，多个使用英文逗号分开，最多100个，例如：`100000,100001` */
  channels: string;
}
/**
 * 1、查询频道合法状态
2、接口支持https协议
 */
export interface Api7f77Response {
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
  /** 【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
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
 * data nested object
 */
export interface data {
  /** 频道列表【详见[channels字段描述](#channels参数描述)】 */
  channels?: unknown;
}
/**
 * channels nested object
 */
export interface channels {
  /** 频道号 */
  channelId?: number;
  /** 频道是否已删除<br/>1：已删除<br/>0：未删除 */
  delete?: number;
  /** 是否属于当前用户<br/>1：是<br/>0：否 */
  currentUser?: number;
}
/**
 * 1、创建集团分帐号
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api756aRequest {
  /** 集团主账号appId */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、创建集团分帐号
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api756aResponse {
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
  /** 【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
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
 * Data nested object
 */
export interface Data {
  /** 应用ID */
  appId?: string;
  /** 应用Secret */
  appSecret?: string;
  /** 用户全局ID */
  userId?: string;
}
/**
 * 1、创建隔离区
2、接口支持https协议
 */
export interface Api2445Request {
  /** 集团主账号appId */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 用户全局ID，即userId */
  userId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、创建隔离区
2、接口支持https协议
 */
export interface Api2445Response {
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
  /** 【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
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
 * Data nested object
 */
export interface Data {
  /** 隔离区ID */
  isolationId?: string;
}
/**
 * 1、通过健康检查来判断后端服务的可用性
2、接口支持https协议
 */
export interface Api25fdRequest {
  /** 集团主账号appId */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、通过健康检查来判断后端服务的可用性
2、接口支持https协议
 */
export interface Api25fdResponse {
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
  /** 【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
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
 * Data nested object
 */
export interface Data {
  /** 健康状态，保留两位小数，分值范围0\~100<br/>(0,30] ：低负载<br/>(30,60] ：中负载<br/>(60,90] ：高负载<br/>(90,100] ：危险 */
  health?: number;
}
/**
 * 1、查询隔离区ID下面所有分账号
2、接口支持https协议
 */
export interface Api7d7cRequest {
  /** 集团主账号appId */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 隔离区ID，使用创建账号返回的【用户全局ID】，即userId<br/>隔离区ID不能跨集团账号使用 */
  isolationId: string;
}
/**
 * 1、查询隔离区ID下面所有分账号
2、接口支持https协议
 */
export interface Api7d7cResponse {
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
  /** 【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
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
 * Data nested object
 */
export interface Data {
  /** 用户全局ID */
  userId?: string;
  /** 邮箱 */
  email?: string;
  /** 密码，需要同时包含数字、英文，长度8~32位 */
  password?: string;
  /** 联系人 */
  contacts?: string;
  /** 手机号码，手机号不能绑定超过3个邮箱 */
  phone?: string;
  /** 最多可创建频道数量 */
  maxChannels?: number;
  /** 分钟数，主账号为分钟数计费，该用量值必填 */
  minutes?: number;
  /** 并发数，主账号为并发计费，该用量值必填 */
  concurrent?: number;
  /** 金额，不能小于0 */
  balance?: number;
  /** 备注，50字符长度 */
  memo?: string;
  /** 到期时间类型<br/>group：跟随主账号<br/>custom：自定义 */
  expireType?: string;
  /** 账号过期时间，格式MMMMYYDD，如20220428 */
  expireDate?: string;
  /** 点播流量，单位G，默认分配100G */
  remainFlow?: number;
  /** 点播空间，单位G，默认分配100G */
  remainSpace?: number;
}
/**
 * 1、集团账号查询分账号剩余资源
2、接口支持https协议
 */
export interface Api618eRequest {
  /** 集团主账号appId */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 分账号邮箱，多个用英文逗号分隔，最多100个 */
  emails?: string;
  /** 每页数据大小，默认10，最大值50 */
  pageSize?: number;
  /** 当前的页数，默认1 */
  pageNumber?: number;
}
/**
 * 1、集团账号查询分账号剩余资源
2、接口支持https协议
 */
export interface Api618eResponse {
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
  /** 账单列表【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
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
  /** 用户ID */
  userId?: string;
  /** 分帐号应用ID */
  appId?: string;
  /** 分帐号应用secret */
  appSecret?: string;
  /** 分帐号邮箱 */
  email?: string;
  /** 剩余金额 */
  balance?: string;
  /** 手机号码 */
  phone?: string;
  /** 备注 */
  memo?: string;
  /** 联系人 */
  contacts?: string;
  /** 云直播计费类型<br/>minutes：分钟数<br/>parallelConcurrent：并行并发<br/>totalConcurrent：累计并发 */
  chargeType?: string;
  /** 云直播并发数剩余资源【详见[Resource字段说明](#Resource参数描述)】 */
  concurrent?: unknown;
  /** 云直播分钟数剩余资源 【详见[Resource字段说明](#Resource参数描述)】 */
  minutes?: unknown;
  /** 云点播流量(bytes)剩余资源【详见[Resource字段说明](#Resource参数描述)】 */
  flow?: unknown;
  /** 云点播空间(bytes)剩余资源【详见[Resource字段说明](#Resource参数描述)】 */
  space?: unknown;
  /** 到期时间类型<br/>group：跟随主账号<br/>custom：自定义 */
  expireType?: string;
  /** 账号到期时间，十三位时间戳 */
  expireDate?: number;
  /** 状态<br/>normal：正常使用<br/>expired：已过期<br/>frozen：已冻结 */
  status?: string;
  /** 可用连麦分钟数 */
  linkMicMinutes?: number;
  /** 可用云导播台分钟数 */
  guideMinutes?: number;
  /** 可创建频道数 */
  maxChannels?: number;
  /** 连麦人数 */
  linkMicLimit?: number;
}
/**
 * Resource nested object
 */
export interface Resource {
  /** 开始时间，格式为yyyy-MM-dd，例如：2022-12-01 */
  start?: string;
  /** 到期时间，格式为yyyy-MM-dd，例如：2022-12-10 */
  end?: string;
  /** 资源可用量<br/>流量：字节<br/>空间：字节 */
  available?: number;
}
/**
 * 1、分配分帐号资源
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api619dRequest {
  /** 集团主账号appId */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、分配分帐号资源
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api619dResponse {
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
export interface Error {
  /** 错误代码，用于确定具体的错误原因 */
  code?: number;
  /** 错误描述，与 error.code 对应 */
  desc?: string;
}
/**
 * 1、重置分账号应用密匙
2、（timestamp, appId, sign）签名参数需通过url传递
3、接口支持https协议
 */
export interface Api7a31Request {
  /** 集团主账号appId */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 分账号邮箱 */
  email: string;
}
/**
 * 1、重置分账号应用密匙
2、（timestamp, appId, sign）签名参数需通过url传递
3、接口支持https协议
 */
export interface Api7a31Response {
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
  /** 【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
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
 * Data nested object
 */
export interface Data {
  /** 应用ID */
  appId?: string;
  /** 重置后的应用Secret */
  appSecret?: string;
  /** 用户全局ID */
  userId?: string;
}
/**
 * 1、分页查询邀请海报邀请数据
2、接口支持https协议
 */
export interface Api2dfdRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 页数默认为1 */
  pageNumber?: number;
  /** 每页显示的数据条数，默认每页显示10条数据 */
  pageSize?: number;
  /** 受邀开始时间，支持到时分秒，13位毫秒级时间戳 */
  startTime?: number;
  /** 受邀结束时间，支持到时分秒，13位毫秒级时间戳 */
  endTime?: number;
}
/**
 * 1、分页查询邀请海报邀请数据
2、接口支持https协议
 */
export interface Api2dfdResponse {
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
  /** 【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
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
  /** 邀请人微信openId */
  openId?: string;
  /** 邀请人Id */
  viewerId?: string;
  /** 邀请人昵称 */
  nickname?: string;
  /** 邀请海报生成时间，13位毫秒级时间戳 */
  createdTime?: number;
  /** 受邀人微信openId */
  receiverOpenId?: string;
  /** 受邀人Id */
  receiverViewerId?: string;
  /** 受邀人昵称 */
  receiverNickname?: string;
  /** 受邀时间，13位毫秒级时间戳 */
  receiverTime?: number;
  /** 用户自定义参数param4 */
  param4?: string;
  /** 用户自定义参数param5 */
  param5?: string;
}
/**
 * 1、根据时间范围获取多频道下用户学习时长表
2、接口支持https协议
 */
export interface Api6cacRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 开始时间，格式为：yyyy-MM-dd HH:mm:ss */
  startTime: string;
  /** 结束时间，格式为：yyyy-MM-dd HH:mm:ss */
  endTime: string;
  /** 频道号，多个使用英文逗号分开，如：100000,100001 */
  channelIds?: string;
  /** 页码，默认为1 */
  pageNumber?: number;
  /** 每页数据大小，默认每页显示10条数据，最大1000 */
  pageSize?: number;
}
/**
 * 1、根据时间范围获取多频道下用户学习时长表
2、接口支持https协议
 */
export interface Api6cacResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回分发列表信息【详见[Data字段说明](#Data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#Error参数描述)】 */
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
  /** 当前页内容【详见[Contents字段说明](#Contents参数描述)】 */
  contents?: unknown;
}
/**
 * Contents nested object
 */
export interface Contents {
  /** 学员观众Id */
  viewerId?: string;
  /** 频道号 */
  channelId?: string;
  /** 场次号 */
  sessionId?: string;
  /** 应学时长 */
  shouldStudyTime?: number;
  /** 已学时长 */
  grandTotalTime?: number;
  /** 学习状态，如果学习时长不低于90%，则学习状态为已完成<br/>Y：已完成<br/>N：未完成 */
  studyStatus?: string;
}
/**
 * 1、查询频道的直播推流信息
2、接口支持https协议
 */
export interface Apifce4Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 频道号 */
  channelId: string;
  /** 开始时间，默认为3小时前 */
  startTime?: string;
  /** 结束时间，默认为当前时间，支持查询最近7天数据 */
  endTime?: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询频道的直播推流信息
2、接口支持https协议
 */
export interface Apifce4Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 状态码非200时的错误信息【详见[Error字段描述](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 响应成功时返回回放视频列表信息【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
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
 * Data nested object
 */
export interface Data {
  /** 推流路径 */
  streamUrl?: string;
  /** 视频码率，单位: bps */
  bitRate?: number;
  /** 音频帧率 */
  audioFrameRate?: number;
  /** 视频帧率 */
  videoFrameRate?: number;
  /** 数据时间，格式: %Y-%m-%d %H:%M:%S.%ms，精确到毫秒级 */
  time?: unknown;
}
