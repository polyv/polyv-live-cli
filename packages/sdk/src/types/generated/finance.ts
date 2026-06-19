/**
 * finance API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module finance by scripts/generate-types.ts
 *
 * Last updated: 2026-06-19T06:33:52.917Z
 */

/**
 * 1、查询频道音频审核设置
2、接口支持https协议
 */
export interface Api5123Request {
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
 * 1、查询频道音频审核设置
2、接口支持https协议
 */
export interface Api5123Response {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 【详见[Data参数描述](#Data参数描述)】 */
  data?: Record<string, unknown>;
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
  /** 应用严禁词开关 */
  badwordEnabled?: string;
  /** 频道id */
  channelId?: number;
  /** 【详见[IllegalNotify参数描述](#IllegalNotify参数描述)】 */
  illegalNotify?: Record<string, unknown>;
  /** 审核开关 */
  moderationEnabled?: string;
  /** 审核策略<br/>easy：宽松审核策略<br/>normal：一般审核策略<br/>strict：严格审核策略 */
  moderationStrategy?: string;
  /** POLYV用户ID，和保利威官网一致，获取路径：官网->登录->直播（开发设置） */
  userId?: string;
}
/**
 * IllegalNotify nested object
 */
export interface IllegalNotify {
  /** 助理通知 */
  assistantEnabled?: string;
  /** 监播通知 */
  monitorEnabled?: string;
  /** 平台通知 */
  platformEnabled?: string;
  /** 主播通知 */
  talentEnabled?: string;
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
 * 1、<p>查询频道音频审核记录</p>

2、接口支持https协议
 */
export interface Apicc76Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 频道号 */
  channelId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
  /** 开始时间，毫秒级时间戳，默认值为最近3天，若传入该参数，则 在这一时间到 结束时间 之间的任务将会被筛选出来 */
  startTime?: number;
  /** 结束时间，毫秒级时间戳，默认值为空，若传入该参数，则 开始时间 到这一时间之间的任务将会被筛选出来 */
  endTime?: number;
  /** 审核策略，多个用','分隔开（pass：通过，block：违规，review：疑似） */
  moderationStrategy?: string;
  /** 当前页数，第几页 */
  pageNumber?: string;
  /** 分页大小 */
  pageSize?: string;
  /** 场次号 */
  sessionId?: string;
}
/**
 * 1、<p>查询频道音频审核记录</p>

2、接口支持https协议
 */
export interface Apicc76Response {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 【详见[Data参数描述](#Data参数描述)】 */
  data?: Record<string, unknown>;
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
  /** 分页数据集合【详见[Contents参数描述](#Contents参数描述)】 */
  contents?: unknown;
  /** 当前页数，第几页 */
  pageNumber?: number;
  /** 分页大小 */
  pageSize?: number;
  /** 总记录数 */
  totalItems?: number;
  /** 总页数 */
  totalPages?: number;
}
/**
 * Contents nested object
 */
export interface Contents {
  /** 音频转写文本 */
  audioText?: string;
  /** 音频切片链接 */
  audioUrl?: string;
  /** 严禁词 */
  badword?: string;
  /** 审核时间 */
  createTime?: string;
  /** 音频文件时长 */
  duration?: number;
  /** 审核任务的审核ID */
  id?: number;
  /** 违规文本 */
  keyword?: string;
  /** 识别类型，Normal：正常，Porn：色情，Abuse：谩骂，Ad：广告，Custom：自定义违规；以及其他令人反感、不安全或不适宜的内容类型 */
  label?: string;
  /** 识别类型描述 */
  labelDesc?: string;
  /** 审核策略 easy：宽松审核策略，normal：一般审核策略，strict：严格审核策略 */
  moderationStrategy?: string;
  /** 审核策略描述 */
  moderationStrategyDesc?: string;
  /** 审核结果（1：通过，2：违规，3：疑似） */
  resultType?: number;
  /** 置信度 */
  score?: number;
  /** 场次id，可能为空，为空时表示当前审核结果还未确认归属到哪个场次 */
  sessionId?: string;
  /** 任务开始时间 */
  startTime?: string;
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
 * 1、<p>更新频道音频审核设置</p>

2、（timestamp, appId, channelId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】

3、接口支持https协议
 */
export interface Apicc78Request {
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
 * 1、<p>更新频道音频审核设置</p>

2、（timestamp, appId, channelId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】

3、接口支持https协议
 */
export interface Apicc78Response {
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
 * IllegalNotify nested object
 */
export interface IllegalNotify {
  /** 助理通知<br/>Y：开启<br/>N：关闭 */
  assistantEnabled?: string;
  /** 监播通知<br/>Y：开启<br/>N：关闭 */
  monitorEnabled?: string;
  /** 平台通知<br/>Y：开启<br/>N：关闭 */
  platformEnabled?: string;
  /** 主播通知<br/>Y：开启<br/>N：关闭 */
  talentEnabled?: string;
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
 * 1、查询用户账单详情数据

2、接口支持https协议
 */
export interface Api585aRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 计费项，必填;seminarDuration：研讨会参会时长；seminarRecordDuration：研讨会录制时长；duration:直播分钟数 */
  itemCategory: string;
  /** 开始日期，必填，格式：yyyy-MM-dd，不允许跨月查询 */
  startDate: string;
  /** 结束日期，必填，格式：yyyy-MM-dd，不允许跨月查询 */
  endDate: string;
  /** 当前页数，第几页 */
  pageNumber?: string;
  /** 分页大小 */
  pageSize?: string;
}
/**
 * 1、查询用户账单详情数据

2、接口支持https协议
 */
export interface Api585aResponse {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 【详见[Data参数描述](#Data参数描述)】 */
  data?: Record<string, unknown>;
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
  /** 分页数据集合【详见[Contents参数描述](#Contents参数描述)】 */
  contents?: unknown;
  /** 当前页数，第几页 */
  pageNumber?: number;
  /** 分页大小 */
  pageSize?: number;
  /** 总记录数 */
  totalItems?: number;
  /** 总页数 */
  totalPages?: number;
}
/**
 * Contents nested object
 */
export interface Contents {
  /** 账号 ID */
  userId?: string;
  /** 账期 ，例如：2026-01 */
  accountPeriod?: string;
  /** 出账日期，例如：2026-01-01 */
  statAt?: string;
  /** 使用日期，例如：2026-01-01 */
  useDate?: string;
  /** 用量 */
  itemConsumed?: unknown;
  /** 结算用量 */
  clearingItemConsumed?: unknown;
  /** 计费项，seminarDuration：研讨会参会时长；seminarRecordDuration：研讨会录制时长； */
  itemCategory?: string;
  /** 项目明细，如：1v6 会议等 */
  itemName?: string;
  /** 产品 */
  production?: string;
  /** 交易类型 */
  tradeType?: string;
  /** 费用 */
  cost?: unknown;
  /** 账单状态，例如：已支付 */
  status?: string;
  /** 单价 */
  univalence?: number;
  /** 单价单位 */
  univalenceUnit?: string;
  /** 用量单位 */
  itemConsumedUnit?: string;
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
 * 1、查询频道场次审核记录列表
2、接口支持https协议
 */
export interface Api6574Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
  /** 频道号 */
  channelId: string;
  /** 识别类型，Normal：正常，Porn：色情，Abuse：谩骂，Ad：广告，Custom：自定义违规；Badword：自定义严禁词；Illegal：违规；Polity：涉政；Moan：呻吟；Terror：暴恐；Religion：宗教；Sexy：性感；Teenager：青少年；Copyright：版权；多个使用英文逗号分隔 */
  label?: string;
  /** 当前页数，第几页 */
  pageNumber?: string;
  /** 分页大小，默认10，最大不超过1000 */
  pageSize?: string;
  /** 结果类型，1：通过，2：违规，3：疑似，多个使用英文逗号分隔 */
  resultType?: string;
  /** 频道场次id */
  sessionId?: string;
}
/**
 * 1、查询频道场次审核记录列表
2、接口支持https协议
 */
export interface Api6574Response {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 【详见[Data参数描述](#Data参数描述)】 */
  data?: Record<string, unknown>;
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
  /** 分页数据集合【详见[Contents参数描述](#Contents参数描述)】 */
  contents?: unknown;
  /** 当前页数，第几页 */
  pageNumber?: number;
  /** 分页大小 */
  pageSize?: number;
  /** 总记录数 */
  totalItems?: number;
  /** 总页数 */
  totalPages?: number;
}
/**
 * Contents nested object
 */
export interface Contents {
  /** 频道id */
  channelId?: number;
  /** 审核时间 */
  createTime?: string;
  /** 主键id */
  id?: number;
  /** 图片链接 */
  imageUrl?: string;
  /** 识别类型，Normal：正常，Porn：色情，Abuse：谩骂，Ad：广告，Custom：自定义违规；Badword：自定义严禁词；Illegal：违规；Polity：涉政；Moan：呻吟；Terror：暴恐；Religion：宗教；Sexy：性感；Teenager：青少年；Copyright：版权；多个使用英文逗号分隔 */
  label?: string;
  /** 识别类型描述 */
  labelDesc?: string;
  /** 策略描述 */
  moderationStrategyDesc?: string;
  /** ocr关键词 */
  ocrKeyword?: string;
  /** ocr文本 */
  ocrText?: string;
  /** 涉政人物 */
  politicalName?: string;
  /** 审核结果（1：通过，2：违规，3：疑似） */
  resultType?: number;
  /** 审核结果描述 */
  resultTypeDesc?: string;
  /** 场次id */
  sessionId?: string;
  /** 任务id */
  taskId?: number;
  /** POLYV用户ID，和保利威官网一致，获取路径：官网->登录->直播（开发设置） */
  userId?: string;
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
 * 1、查询频道视频审核设置
2、接口支持https协议
 */
export interface Api5cd6Request {
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
 * 1、查询频道视频审核设置
2、接口支持https协议
 */
export interface Api5cd6Response {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 查询视频审核返回实体【详见[Data参数描述](#Data参数描述)】 */
  data?: Record<string, unknown>;
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
  /** 当前配置任务所属频道号 */
  channelId?: number;
  /** 【详见[IllegalNotify参数描述](#IllegalNotify参数描述)】 */
  illegalNotify?: Record<string, unknown>;
  /** 截帧时长，单位：秒，取值：5、20、60，间隔X秒截取一帧 */
  imageFrequency?: number;
  /** 审核功能的开关，Y：开启，N：关闭 */
  moderationEnabled?: string;
  /** 审核策略，finance_easy：宽松审核策略，finance_normal：一般审核策略，finance_serious：严格审核策略 */
  moderationStrategy?: string;
}
/**
 * IllegalNotify nested object
 */
export interface IllegalNotify {
  /** 助理通知，Y：开启，N：关闭 */
  assistantEnabled?: string;
  /** 监播通知，Y：开启，N：关闭 */
  monitorEnabled?: string;
  /** 平台通知，Y：开启，N：关闭 */
  platformEnabled?: string;
  /** 主播通知，Y：开启，N：关闭 */
  talentEnabled?: string;
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
 * 1、更新频道视频审核设置
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api5cd6Request {
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
 * 1、更新频道视频审核设置
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api5cd6Response {
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
 * IllegalNotify nested object
 */
export interface IllegalNotify {
  /** 助理通知，Y：开启，N：关闭，默认为N */
  assistantEnabled?: string;
  /** 监播通知，Y：开启，N：关闭，默认为N */
  monitorEnabled?: string;
  /** 平台通知，Y：开启，N：关闭，默认为N */
  platformEnabled?: string;
  /** 主播通知，Y：开启，N：关闭，默认为N */
  talentEnabled?: string;
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
