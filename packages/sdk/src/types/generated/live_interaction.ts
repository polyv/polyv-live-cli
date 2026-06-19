/**
 * live_interaction API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module live_interaction by scripts/generate-types.ts
 *
 * Last updated: 2026-06-19T06:33:52.925Z
 */

/**
 * 1、编辑或添加答题卡信息，为全量增加或修改
2、接口支持https协议
 */
export interface Api4c78Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 答题卡ID,修改答题卡时必填，不填则新增答题卡 */
  questionId: string;
  /** 类型：R单选, C多选, S评分, V投票 */
  _type: string;
  /** 正确答案, 类型为R单选和C多选时必填 */
  answer: string;
  /** 答题卡名称 */
  name: string;
  /** 类型: 0答题卡, 1问答 */
  itemType: number;
  /** 单选和多选最多15个选项A-O, 评分和投票类型最多只有5个 */
  option1_option15?: string;
  /** 提示信息，评分类型填写 */
  tips1_tips5?: string;
}
/**
 * 1、编辑或添加答题卡信息，为全量增加或修改
2、接口支持https协议
 */
export interface Api4c78Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功响应时为答题卡ID */
  data?: string;
}
/**
 * 1、编辑或添加问卷信息，为全量增加或修改
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api60a4Request {
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
 * 1、编辑或添加问卷信息，为全量增加或修改
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api60a4Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功响应时为问卷基本信息 【详见[data字段说明](/live/api/live_interaction/add_edit_questionnaire.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、提交中奖者填写的信息
2、只能成功保存一次观众中奖信息
3、中奖信息需在7天内提交保存，否则会失效
4、接口支持https协议
 */
export interface Api3437Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 抽奖场次ID，该参数获取自【[查询频道中奖记录](/live/api/live_interaction/list_lottery.md)】 */
  lotteryId: string;
  /** 中奖码 */
  winnerCode: string;
  /** 中奖者ID */
  viewerId: string;
  /** 中奖者姓名，如果传姓名，必须传中奖者手机号码，receiveInfo字段不需要传（无效） */
  name?: string;
  /** 中奖者手机号码，如果传手机号，必须传中奖者姓名，receiveInfo字段不需要传（无效） */
  telephone?: string;
  /** 自定义字段数据，数据类型为JSON数组</br>`[{"field":"姓名","value":"测试"},{"field":"手机","value":"13412345678"}]` </br>field：字段名称</br>value：字段值，如果传这个参数，name和telephone字段不需要传（无效） */
  receiveInfo?: unknown;
}
/**
 * 1、提交中奖者填写的信息
2、只能成功保存一次观众中奖信息
3、中奖信息需在7天内提交保存，否则会失效
4、接口支持https协议
 */
export interface Api3437Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回"保存成功"，失败返回空 */
  data?: string;
}
/**
 * 1、提交中奖者填写的信息
2、只能成功保存一次观众中奖信息
3、中奖信息需在7天内提交保存，否则会失效
4、接口支持https协议
 */
export interface Api3437Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 抽奖场次ID，该参数获取自【[查询频道中奖记录](/live/api/live_interaction/list_lottery.md)】 */
  lotteryId: string;
  /** 中奖码 */
  winnerCode: string;
  /** 中奖者ID */
  viewerId: string;
  /** 自定义字段数据，数据类型为JSON数组</br>`[{"field":"姓名","value":"测试"},{"field":"手机","value":"13412345678"}]` </br>field：字段名称</br>value：字段值，如果传这个参数，name和telephone字段不需要传（无效） */
  receiveInfo?: unknown;
}
/**
 * 1、提交中奖者填写的信息
2、只能成功保存一次观众中奖信息
3、中奖信息需在7天内提交保存，否则会失效
4、接口支持https协议
 */
export interface Api3437Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回"保存成功"，失败返回空 */
  data?: string;
}
/**
 * 1、支持批量创建问卷（支持多频道同时创建）
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api2462Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、支持批量创建问卷（支持多频道同时创建）
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api2462Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功响应时为问卷基本信息 【详见[data字段说明](/live/api/live_interaction/batch_create_questionnaire.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、创建问卷
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api60a4Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道ID */
  channelId: number;
}
/**
 * 1、创建问卷
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api60a4Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功响应时为问卷基本信息 【详见[data字段说明](/live/api/live_interaction/batch_create_questionnaire.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、删除频道答题卡信息
2、接口支持https协议
 */
export interface Api5693Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 答题卡ID */
  questionId: string;
}
/**
 * 1、删除频道答题卡信息
2、接口支持https协议
 */
export interface Api5693Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应信息 */
  data?: string;
}
/**
 * 1、导出频道的单抽奖的中奖用户列表的中奖文件
2、导出表格格式可具体参考直播后台的导出中奖记录功能
3、接口支持https协议
 */
export interface Apif618Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 抽奖场次ID，该参数获取自【[查询频道抽奖记录](/live/api/v4/channel/statistics/lottery_list)】 */
  lotteryId: string;
}
/**
 * 1、通过频道号，查询答题卡答题结果列表
2、接口支持https协议
3、参数场次号、查询时间同时存在多个时，按参数优先级从小到大，选其中一个参数作为查询条件
 */
export interface Api1a2cRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 场次号，优先级1 */
  sessionId?: string;
  /** 查询的开始时间，优先级2，格式是：yyyy-MM-dd，默认查最近7天数据 */
  startDate?: string;
  /** 查询的结束时间，优先级2，格式是：yyyy-MM-dd，默认查最近7天数据 */
  endDate?: string;
}
/**
 * 1、通过频道号，查询答题卡答题结果列表
2、接口支持https协议
3、参数场次号、查询时间同时存在多个时，按参数优先级从小到大，选其中一个参数作为查询条件
 */
export interface Api1a2cResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 答题结果的列表数据 【详见[data字段说明](/live/api/live_interaction/get_answer_list.md?id=data字段说明)】 */
  data?: unknown;
}
/**
 * 1、通过签到id查询签到记录（包括已签到与未签到记录）
2、接口支持https协议
 */
export interface Api5057Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 签到id，一场签到一个id，该参数获取自【[查询频道签到结果](/live/api/live_interaction/get_checkin_list.md)】 */
  checkinId: string;
}
/**
 * 1、通过签到id查询签到记录（包括已签到与未签到记录）
2、接口支持https协议
 */
export interface Api5057Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 签到记录的数据 【详见[data字段说明](/live/api/live_interaction/get_checkin_by_checkid.md?id=data字段说明)】 */
  data?: unknown;
}
/**
 * 1、通过直播场次id，查询签到发起记录
2、接口支持https协议
 */
export interface Api1106Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 场次号，该参数获取自【[查询频道场次信息](/live/api/channel/playback/get_channel_sessions.md)】 */
  sessionId: string;
}
/**
 * 1、通过直播场次id，查询签到发起记录
2、接口支持https协议
 */
export interface Api1106Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 签到记录的数据 【详见[data字段说明](/live/api/live_interaction/get_checkin_by_sessionid.md?id=data字段说明)】 */
  data?: unknown;
}
/**
 * 1、通过指定时间范围查询签到发起记录
2、接口支持https协议
 */
export interface Api60e7Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 开始日期，格式yyyy-MM-dd 开始结束时间在30天内 */
  startDate: string;
  /** 结束日期，格式yyyy-MM-dd */
  endDate: string;
}
/**
 * 1、通过指定时间范围查询签到发起记录
2、接口支持https协议
 */
export interface Api60e7Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 签到记录的数据 【详见[data字段说明](/live/api/live_interaction/get_checkin_by_sessionid.md?id=data字段说明)】 */
  data?: unknown;
}
/**
 * 1、查询频道号下，某天或某场直播的签到记录（仅返回已签到记录）
2、接口支持https协议
 */
export interface Api5fb9Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 页码，默认为1 */
  page?: number;
  /** 每一页的大小，默认为20 */
  pageSize?: number;
  /** 查询的指定日期，格式为yyyy-MM-dd，默认查询当天签到记录 */
  date?: string;
  /** 场次id<br />如果传sessionId，date无效<br />如果不传sessionId，date有效 */
  sessionId?: string;
}
/**
 * 1、查询频道号下，某天或某场直播的签到记录（仅返回已签到记录）
2、接口支持https协议
 */
export interface Api5fb9Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 签到记录的分页数据 【详见[data字段说明](/live/api/live_interaction/get_checkin_list.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过频道号，查询咨询提问记录
2、接口支持https协议
3、接口URL中的{channelId}为"频道号"
 */
export interface Api797aRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 起始下标，从0开始 */
  begin?: number;
  /** 结束下标，-1表示不分页 */
  end?: number;
}
/**
 * 1、通过频道号，查询咨询提问记录
2、接口支持https协议
3、接口URL中的{channelId}为"频道号"
 */
export interface Api797aResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 提问记录的列表数据 【详见[data字段说明](/live/api/live_interaction/get_question_list.md?id=data字段说明)】 */
  data?: unknown;
}
/**
 * 1、查询频道问卷题目与结果
2、问卷ID可以从获取频道问卷列表中获取
3、接口支持https协议
 */
export interface Api2d55Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 问卷id，该参数获取自【[查询频道问卷列表](/live/api/live_interaction/list_questionaire.md)】 */
  questionnaireId: string;
}
/**
 * 1、查询频道问卷题目与结果
2、问卷ID可以从获取频道问卷列表中获取
3、接口支持https协议
 */
export interface Api2d55Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功响应时为问卷基本信息 【详见[data字段说明](/live/api/live_interaction/get_questionnaire_detail.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、查询直播问卷的答题结果及统计
2、接口支持https协议
3、参数问卷ID、场次号、查询时间同时存在多个时，按参数优先级从小到大，选其中一个参数作为查询条件
 */
export interface Api70b8Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 问卷ID，优先级1，该参数获取自【[查询频道问卷列表](/live/api/live_interaction/list_questionaire.md)】 */
  questionnaireId?: string;
  /** 场次号，优先级2 */
  sessionId?: string;
  /** 开始时间，优先级3，格式：yyyy-MM-dd，默认查最近7天数据 */
  startDate?: string;
  /** 结束时间，优先级3，格式：yyyy-MM-dd，默认查最近7天数据 */
  endDate?: string;
}
/**
 * 1、查询直播问卷的答题结果及统计
2、接口支持https协议
3、参数问卷ID、场次号、查询时间同时存在多个时，按参数优先级从小到大，选其中一个参数作为查询条件
 */
export interface Api70b8Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功响应时为问卷基本信息 【详见[data字段说明](/live/api/live_interaction/get_questionnaire_result.md?id=data字段说明)】 */
  data?: unknown;
}
/**
 * 1、通过抽奖ID获取频道的单场抽奖的中奖用户列表
2、接口支持https协议
 */
export interface Api6ec1Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 抽奖ID，该参数获取自【[查询频道抽奖记录](/live/api/v4/channel/statistics/lottery_list)】 */
  lotteryId: string;
  /** 查询的页数，默认为1 */
  page?: number;
  /** 查询的每页大小，默认为10 */
  limit?: number;
}
/**
 * 1、通过抽奖ID获取频道的单场抽奖的中奖用户列表
2、接口支持https协议
 */
export interface Api6ec1Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 中间记录的分页结果，错误时返回空【详见[data字段说明](/live/api/live_interaction/get_winner_detail.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、获取一段时间内的多个直播频道发起抽奖记录列表
2、接口支持https协议
 */
export interface Api2165Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号,多个频道使用“,”进行分割 */
  channelIds: string;
  /** 查询的开始日期的13位时间戳 */
  startTime: number;
  /** 查询的结束日期的13位时间戳 */
  endTime: number;
  /** 要查询的直播场次ID，默认查询该频道中所有场次 */
  sessionId?: string;
  /** 查询的页数，默认为1 */
  page?: number;
  /** 查询的每页大小，默认为10 */
  limit?: number;
}
/**
 * 1、获取一段时间内的多个直播频道发起抽奖记录列表
2、接口支持https协议
 */
export interface Api2165Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 抽奖记录的分页结果 【详见[data字段说明](/live/api/live_interaction/list_lottery.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、获取一段时间内的直播频道抽奖记录列表
2、接口支持https协议
 */
export interface Api781aRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 要查询的直播场次ID，默认查询该频道中所有场次 */
  sessionId?: string;
  /** 查询的开始日期的13位时间戳 */
  startTime: number;
  /** 查询的结束日期的13位时间戳 */
  endTime: number;
  /** 查询的页数，默认为1 */
  page?: number;
  /** 查询的每页大小，默认为10 */
  limit?: number;
}
/**
 * 1、获取一段时间内的直播频道抽奖记录列表
2、接口支持https协议
 */
export interface Api781aResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 抽奖记录的分页结果 【详见[data字段说明](/live/api/live_interaction/list_lottery.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、获取频道的答题卡列表
2、接口支持https协议
 */
export interface Api19d7Request {
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
 * 1、获取频道的答题卡列表
2、接口支持https协议
 */
export interface Api19d7Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功响应时为答题卡列表信息 【详见[data字段说明](/live/api/live_interaction/question/list.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、获取频道的答题卡发送时间列表
2、接口支持https协议
 */
export interface Api606eRequest {
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
 * 1、获取频道的答题卡发送时间列表
2、接口支持https协议
 */
export interface Api606eResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功响应时为答题卡发送时间列表 */
  data?: unknown;
}
/**
 * 1、获取频道的问卷列表
2、接口支持https协议
 */
export interface Api70bdRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 查询的记录的开始时间，13位毫秒级时间戳 */
  startTime?: number;
  /** 查询的记录的结束时间，13位毫秒级时间戳 */
  endTime?: number;
  /** 页号，默认为1 */
  page?: number;
  /** 每页条数，默认为10 */
  pageSize?: number;
}
/**
 * 1、获取频道的问卷列表
2、接口支持https协议
 */
export interface Api70bdResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功响应时为问卷基本信息 【详见[data字段说明](/live/api/live_interaction/list_questionaire.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、分页查询频道问卷结果
2、接口支持https协议
3、参数场次号、查询时间同时存在多个时，按参数优先级从小到大，选其中一个参数作为查询条件
 */
export interface Api6f53Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 查询的页数，默认为1 */
  page?: number;
  /** 查询的每页大小，默认为10 */
  pageSize?: number;
  /** 场次号，优先级1 */
  sessionIdId?: string;
  /** 开始时间，优先级2，格式：yyyy-MM-dd，默认查最近7天数据 */
  startDate?: string;
  /** 结束时间，优先级2，格式：yyyy-MM-dd，默认查最近7天数据 */
  endDate?: string;
}
/**
 * 1、分页查询频道问卷结果
2、接口支持https协议
3、参数场次号、查询时间同时存在多个时，按参数优先级从小到大，选其中一个参数作为查询条件
 */
export interface Api6f53Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功响应时为问卷基本信息 【详见[data字段说明](/live/api/live_interaction/list_questionnaire_by_page.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、实现用户自开发观看页点赞效果，通过调用接口可以进行点赞，默认每次请求都是一次点赞
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api2844Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 点赞观众的ID */
  viewerId: string;
  /** 点赞的数目，不能超过30，提交后在times-1秒后才能再点赞 。默认为1 */
  times?: number;
}
/**
 * 1、实现用户自开发观看页点赞效果，通过调用接口可以进行点赞，默认每次请求都是一次点赞
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api2844Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为点赞数，请求错误时为空 */
  data?: string;
}
/**
 * 1、发送答题卡
2、接口支持https协议
 */
export interface Api1f88Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: number;
  /** 答题卡ID */
  questionId: string;
  /** 答题限时时必传，单位秒，范围1-99 */
  duration?: number;
}
/**
 * 1、发送答题卡结果
2、接口支持https协议
 */
export interface Api5eb4Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: number;
  /** 答题卡ID */
  questionId: string;
}
/**
 * 1、发送打赏消息
2、请求成功后，服务器会向聊天室的用户广播打赏消息，详见直播聊天室API接口
3、接口支持https协议
 */
export interface Api22f9Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 打赏者昵称 */
  nickname: string;
  /** 打赏者头像 */
  avatar: string;
  /** 打赏者ID，<span class="error">必须是在线用户的ID</span>，一般搭配白名单观看、自定义授权、外部授权或独立授权使用 */
  viewerId: string;
  /** 打赏类型<br/>cash：现金打赏<br/>good：道具打赏 */
  donateType: string;
  /** 打赏内容：礼物打赏为礼物名称，现金打赏为金额 */
  content: string;
  /** 礼物打赏时为礼物图片，现金打赏时为空 */
  goodImage?: string;
  /** 直播场次ID */
  sessionId?: string;
  /** 打赏数量，不传默认为1 */
  goodNum?: string;
  /** 是否socket消息需要用户图片，默认为N（是：Y，否：N） */
  needUserImage?: string;
}
/**
 * 1、发送打赏消息
2、请求成功后，服务器会向聊天室的用户广播打赏消息，详见直播聊天室API接口
3、接口支持https协议
 */
export interface Api22f9Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功和失败都为空 */
  data?: string;
}
/**
 * 1、停止答题卡
2、接口支持https协议
 */
export interface Api60e5Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: number;
  /** 答题卡ID */
  questionId: string;
}
/**
 * > 删除当前账号下的「学员提问」客户回调配置；删除后，学员提问成功时不再向原 URL POST 通知。
删除成功后清除对应 Redis 缓存。多次删除同一账号为幂等（无记录时亦返回成功）。
接口支持 HTTPS 协议。
 */
export interface Api754fRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号，用于校验该频道是否属于当前账号 */
  roomId: string;
}
/**
 * > 删除当前账号下的「学员提问」客户回调配置；删除后，学员提问成功时不再向原 URL POST 通知。
删除成功后清除对应 Redis 缓存。多次删除同一账号为幂等（无记录时亦返回成功）。
接口支持 HTTPS 协议。
 */
export interface Api754fResponse {
  /** 200 表示处理完成（含幂等无记录） */
  code?: number;
  /** `success` / `error` */
  status?: string;
  /** 如「删除成功」 */
  message?: string;
  /** 成功时多为空字符串 */
  data?: string;
}
/**
 * > 查询当前账号已配置的「学员提问」客户回调 URL；若从未配置或已删除，则 `data.callbackUrl` 为空字符串。
读取路径带 Redis 缓存（未命中时回源 MySQL 并写入缓存，过期时间 1 天）。
接口支持 HTTPS 协议。
 */
export interface Api754fRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 可选；传入时须为该账号下合法频道号 */
  roomId?: string;
}
/**
 * > 查询当前账号已配置的「学员提问」客户回调 URL；若从未配置或已删除，则 `data.callbackUrl` 为空字符串。
读取路径带 Redis 缓存（未命中时回源 MySQL 并写入缓存，过期时间 1 天）。
接口支持 HTTPS 协议。
 */
export interface Api754fResponse {
  /** 200 成功；500 多为查询异常 */
  code?: number;
  /** `success` / `error` */
  status?: string;
  /** 成功时多为空字符串 */
  message?: string;
  /** 含 `callbackUrl`（string，未配置时为 `""`） */
  data?: Record<string, unknown>;
}
/**
 * > 按账号维度保存或更新「学员提问」成功后，服务端异步 POST 通知的客户地址（Webhook URL）。
学员在聊天室通过 WebSocket 发送 S_QUESTION 且服务端完成入库与广播后，会向该 URL 推送一条 JSON（含签名）；客户可在收到后自行调用讲师 HTTP 回复等能力。
接口支持 HTTPS 协议。
 */
export interface Api2ca4Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号，用于校验该频道是否属于当前账号 */
  roomId: string;
  /** 客户接收学员提问通知的完整 URL（http 或 https） */
  callbackUrl: string;
}
/**
 * > 按账号维度保存或更新「学员提问」成功后，服务端异步 POST 通知的客户地址（Webhook URL）。
学员在聊天室通过 WebSocket 发送 S_QUESTION 且服务端完成入库与广播后，会向该 URL 推送一条 JSON（含签名）；客户可在收到后自行调用讲师 HTTP 回复等能力。
接口支持 HTTPS 协议。
 */
export interface Api2ca4Response {
  /** 200 成功；400 参数校验失败；500 业务或服务异常 */
  code?: number;
  /** `success` / `fail` / `error` */
  status?: string;
  /** 如「保存成功」或错误说明 */
  message?: string;
  /** 成功时多为空字符串 */
  data?: string;
}
/**
 * > 由业务服务端调用，在指定频道内以讲师身份回复某位观众的「提问私聊」记录；
行为与聊天室 WebSocket 事件 T_ANSWER 对齐（写入提问记录、更新列表数据、向仍在线的相关用户推送 message）。
接口支持 HTTPS 协议。
 */
export interface Api4544Response {
  /** 200 表示成功；400 多为参数校验失败；500 多为业务错误或服务端异常 */
  code?: number;
  /** `success` / `fail` / `error` */
  status?: string;
  /** 提示文案，如「发送成功」或具体错误说明 */
  message?: string;
  /** 成功时包含 `id`（回复记录 ID）；失败时可为空或附带校验信息 */
  data?: Record<string, unknown>;
}
