/**
 * channel API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module channel by scripts/generate-types.ts
 *
 * Last updated: 2026-06-20T00:51:38.526Z
 */

/**
 * 1、接口用于获取频道级别的API访问令牌（channel access token），以下简称token
2、token可以用于访问指定一个频道号的API，并且访问路径需符合以下模式：/live/v3/channel/**，未来会逐步扩展其功能
3、token可以用于接入直播平台一些特定的SDK
4、接口支持https协议
 */
export interface Api4a0eRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 是否一次性有效，true/false，默认为false */
  disposable?: boolean;
  /** token有效时长，单位为秒，取值范围：0 < expireSeconds <= 3600，默认为1800秒 */
  expireSeconds?: number;
}
/**
 * 1、接口用于获取频道级别的API访问令牌（channel access token），以下简称token
2、token可以用于访问指定一个频道号的API，并且访问路径需符合以下模式：/live/v3/channel/**，未来会逐步扩展其功能
3、token可以用于接入直播平台一些特定的SDK
4、接口支持https协议
 */
export interface Api4a0eResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为token信息【详见[Data参数描述](/live/api/channel/get_channel_api_access_token.md?id=polyv1)】，请求失败时为null */
  data?: Record<string, unknown>;
}
/**
 * 1、接口用于获取观看页测试模式的访问令牌
2、接口支持https协议
 */
export interface Api44dcRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** token有效时长，单位为秒，取值范围：0 < expireSeconds <= 30 * 24 * 3600，默认为 4 * 3600 秒 */
  expireTime?: number;
}
/**
 * 1、接口用于获取观看页测试模式的访问令牌
2、接口支持https协议
 */
export interface Api44dcResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为token信息 */
  data?: Record<string, unknown>;
}
/**
 * 1、取消频道的关联音视频文件
2、接口支持https协议
 */
export interface Api651eRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 音视频文件ID,多个文件用逗号分隔 */
  vids: string;
}
/**
 * 1、取消频道的关联音视频文件
2、接口支持https协议
 */
export interface Api651eResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应数据 */
  data?: Record<string, unknown>;
}
/**
 * 1、删除音视频文件
2、接口支持https协议
 */
export interface Api61d8Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 音视频文件ID,多个文件用逗号分隔 */
  vids: string;
}
/**
 * 1、删除音视频文件
2、接口支持https协议
 */
export interface Api61d8Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应数据 */
  data?: Record<string, unknown>;
}
/**
 * 1、删除频道文档接口
2、支持https协议
 */
export interface Apicb3bRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 文件ID，(如果有多个，可以用英文逗号隔开拼接成字符串)，该值来源参考【[查询频道已上传文档列表](/live/api/channel/doc/get_doc_list)】接口返回数据的data.contents[0].fileId */
  fileId: string;
  /** 新旧版文件类型，取值如下：<br/>old：旧版<br/>new：新版<br/>该值参考来源参考 【[查询频道已上传文档列表](/live/api/channel/doc/get_doc_list)】  接口返回数据的data.contents[0].type；<br>如fileId为多个，该值必须和fileId一一对应； */
  _type: string;
}
/**
 * 1、删除频道文档接口
2、支持https协议
 */
export interface Apicb3bResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时，返回值是空，请求失败时，返回值是空 */
  data?: string;
}
/**
 * 1、查询频道的关联音视频文件
2、接口支持https协议
 */
export interface Api1a28Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 分页页码，默认1 */
  pageNumber?: number;
  /** 分页大小，默认10 */
  pageSize?: number;
}
/**
 * 1、查询频道的关联音视频文件
2、接口支持https协议
 */
export interface Api1a28Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为频道直播场次信息 【详见[data字段描述](/live/api/channel/doc/get_channel_multimedia_resource.md?id=data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、查询频道的关联音视频文件详情
2、接口支持https协议
 */
export interface Api314eRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 分页页码，默认1 */
  pageNumber?: number;
  /** 分页大小，默认10, 每页不能超过100条 */
  pageSize?: number;
}
/**
 * 1、查询频道的关联音视频文件详情
2、接口支持https协议
 */
export interface Api314eResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为频道直播场次信息 【详见[data字段描述](/live/api/channel/doc/get_channel_multimedia_resource.md?id=data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * Contents nested object
 */
export interface Contents {
  /** 记录ID */
  id?: number;
  /** 频道ID */
  channelId?: number;
  /** 音视频ID */
  vid?: string;
  /** 资源名称 */
  title?: string;
  /** 状态，参考点播的视频状态码 */
  status?: number;
  /** 视频URL */
  url?: string;
}
/**
 * 1、查询频道文档转换状态接口
2、支持https协议
 */
export interface Api72ffRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 文件ID，(如果有多个，可以用英文逗号隔开拼接成字符串)，该值来源参考【[查询频道已上传文档列表](/live/api/channel/doc/get_doc_list)】接口返回数据的data.contents[0].fileId */
  fileId: string;
}
/**
 * 1、查询频道文档转换状态接口
2、支持https协议
 */
export interface Api72ffResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为频道转码有关信息【详见[Data参数描述](/live/api/channel/doc/get_doc_convert_status.md?id=polyv1)】，请求失败时为空 */
  data?: unknown;
}
/**
 * 1、获取频道文档列表
2、接口支持https协议
 */
export interface Api4ee2Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号，若开启了“讲义库”功能，则查询该频道对应的讲师所关联的讲义库文档 */
  channelId?: string;
  /** 文档状态，默认不传查询所有<br/>normal：正常<br/>waitUpload：等待上传<br/>failUpload：上传失败<br/>waitConvert：转换PPT中<br/>failConvert：转换PPT失败 */
  status?: string;
  /** 第几页，默认不传显示第一页 */
  page?: number;
  /** 每页显示几条数据，默认不传显示10条 */
  limit?: number;
  /** 是否展示文档原文件地址，默认不传不展示<br>Y：是<br>N：否 */
  isShowUrl?: string;
  /** 讲师ID，若开启了“讲义库”功能，则查询讲师关联的讲义库文档，channelId和teacherId不能同时为空，若同时传入且开启了“讲义库”功能，则优先用teacherId */
  teacherId?: string;
}
/**
 * 1、获取频道文档列表
2、接口支持https协议
 */
export interface Api4ee2Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为已上传文档的有关信息【详见[Data参数描述](/live/api/channel/doc/get_doc_list.md?id=polyv1)】，请求失败时为空 */
  data?: Record<string, unknown>;
}
/**
 * 1、查询音视频文件详情
2、接口支持https协议
 */
export interface Api4d65Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 音视频文件ID,多个文件用逗号分隔，不能超过100个文件 */
  vids: string;
}
/**
 * 1、查询音视频文件详情
2、接口支持https协议
 */
export interface Api4d65Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为频道直播场次信息 【详见[data字段描述](/live/api/channel/doc/get_channel_multimedia_resource.md?id=data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、关联音视频文件到频道
2、接口支持https协议
 */
export interface Api77a8Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 音视频文件ID,多个文件用逗号分隔, 不能超过100个文件 */
  vids: string;
}
/**
 * 1、关联音视频文件到频道
2、接口支持https协议
 */
export interface Api77a8Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应数据 */
  data?: Record<string, unknown>;
}
/**
 * 1、开启了“讲义库”功能后（如需开通请联系售后），通过此接口将讲师和公共讲义库中的文档关联起来，从而实现在不需要重复上传的情况下，多个讲师共用同一份文档
2、包括新增、解除讲师文档关系
3、接口支持https协议
 */
export interface Api2b5eRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 操作，<br/> 1：新增绑定关系，若绑定关系已经存在，则不再新增，只更新关联时间，查询列表时默认会根据此关联时间倒序排序 <br/> 2：解除绑定关系 */
  operation: number;
  /** 讲师ID，32个以内ASCII码可见字符，系【[创建频道接口](/live/api/v4/channel/create)】或【[更新频道接口](/live/api/channel/operate/update_channel_detail_setting)】所传入的 customTeacherId */
  teacherId: string;
  /** 文档ID，多个文档ID以,分隔，一次最多传入100个 */
  fileIds: string;
}
/**
 * 1、开启了“讲义库”功能后（如需开通请联系售后），通过此接口将讲师和公共讲义库中的文档关联起来，从而实现在不需要重复上传的情况下，多个讲师共用同一份文档
2、包括新增、解除讲师文档关系
3、接口支持https协议
 */
export interface Api2b5eResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 暂无 */
  data?: Record<string, unknown>;
}
/**
 * 1、上传频道文档接口
2、（channelId, type, docName, callbackUrl, timestamp, appId, url）参与sign签名，并和sign一起通过post表单传递，文件通过二进制流提交到服务器端。
3、接口支持https协议
 */
export interface Api5033Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 上传的文件不超过200M，格式限制为（ppt， pdf，pptx，doc，docx，wps），file和url只需要传递其中一个，如果传递了url和file，以file字段为准 */
  file?: File | Blob;
  /** 转换类型，默认不传转普通，因为只有ppt，pptx可以转动画，其他类型文件会自动转成普通；文件转动画转失败会直接把类型转为普通<br/>common：转普通图片<br/>animate：转动画效果 */
  _type?: string;
  /** 文档名称，默认不传使用ppt上传的文件获取到的文件名作为文档名称，文档名称不得超过100个字符 */
  docName?: string;
  /** 文档上传转换成功回调地址 */
  callbackUrl?: string;
  /** 文件地址url（需要可访问的地址），file和url只需要传递其中一个，如果传递了url和file，以file字段为准，上传的文件不超过200M */
  url?: string;
}
/**
 * 1、上传频道文档接口
2、（channelId, type, docName, callbackUrl, timestamp, appId, url）参与sign签名，并和sign一起通过post表单传递，文件通过二进制流提交到服务器端。
3、接口支持https协议
 */
export interface Api5033Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为上传文档的有关信息【详见[Data参数描述](/live/api/channel/doc/upload_doc.md?id=polyv1)】，请求失败时为空 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过接口可以设置播放器内容保护自定义url跑马灯开关，在开启时需提交url参数。
2、接口URL中的{channelId}为 频道ID
3、接口支持https协议
 */
export interface Api6245Request {
  /** 从API设置中获取，在直播系统登记的appId */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
  /** 自定义url内容保护跑马灯开关 */
  marqueeRestrict: unknown;
  /** 自定义url， 在开关为关时可为空，开启开关时为必填 */
  url: string;
  /** 签名，32位大写MD5值 */
  sign: string;
}
/**
 * 1、获取频道hls协议拉流地址
2、接口支持https协议
 */
export interface Api7d43Request {
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
 * 1、获取频道hls协议拉流地址
2、接口支持https协议
 */
export interface Api7d43Response {
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
 * 1、创建频道的助教或嘉宾角色
   助教：使用助教管理后台，能够观看直播、参与互动、进行聊天室管理，发送图文直播，监控直播等操作
   嘉宾：讲师和嘉宾可同时讲一堂课，支持连麦互动
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api2718Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 默认不传为助教<br>Assistant：助教<br>Guest：嘉宾 */
  role?: string;
  /** 昵称，默认随机生成昵称 */
  nickname?: string;
  /** 角色密码 */
  password?: string;
  /** 头衔，默认为助教 */
  actor?: string;
  /** 头像，默认初始头像 */
  avatar?: string;
}
/**
 * 1、创建频道的助教或嘉宾角色
   助教：使用助教管理后台，能够观看直播、参与互动、进行聊天室管理，发送图文直播，监控直播等操作
   嘉宾：讲师和嘉宾可同时讲一堂课，支持连麦互动
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api2718Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为频道的信息 【详见[data字段描述](/live/api/channel/operate/add_account.md?id=data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、添加频道商品库商品
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api4782Request {
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
 * 1、添加频道商品库商品
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api4782Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为商品信息【详见[Data参数描述](/live/api/channel/operate/add_channel_product.md?id=polyv1)】，请求失败时为空 */
  data?: Record<string, unknown>;
}
/**
 * 1、批量添加伪直播的视频，需预先将视频上传至点播系统或者视频来源于直播暂存录制
2、调用接口后，如果当前频道未在直播中，会自动设置直播方式为“伪直播“
3、如果当前使用其他直播推流方式直播中，则需要在直播结束后，调用”修改频道推流方式“接口修改为伪直播，才会在所设置的开始时间进行直播
4、接口支持https协议
 */
export interface Api137fRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号，<span class="error">仅支持正常延迟的纯视频频道设置伪直播</span> */
  channelId: string;
  /** 要设置伪直播的点播视频ID或者直播暂存文件fileId，多个以英文逗号分割 */
  vids: string;
  /** 伪直播开始时间列表，13位毫秒级时间戳，多个以英文逗号分割，需要与vids数量匹配。<br/>如果为空，则表示不设置直播时间<br/>如果不为空，需大于当前时间，当设置的vid为直播暂存文件的时候该字段不能为空。 */
  startTimes?: string;
  /** 伪直播视频来源，值为空或者是vod是点播视频，值为record时候代表是来自直播暂存文件 */
  origin?: string;
}
/**
 * 1、批量添加伪直播的视频，需预先将视频上传至点播系统或者视频来源于直播暂存录制
2、调用接口后，如果当前频道未在直播中，会自动设置直播方式为“伪直播“
3、如果当前使用其他直播推流方式直播中，则需要在直播结束后，调用”修改频道推流方式“接口修改为伪直播，才会在所设置的开始时间进行直播
4、接口支持https协议
 */
export interface Api137fResponse {
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
 * 1、批量添加伪直播的视频，需预先将视频上传至点播系统
2、调用接口后，如果当前频道未在直播中，会自动设置直播方式为“伪直播“
3、如果当前使用其他直播推流方式直播中，则需要在直播结束后，调用”修改频道推流方式“接口修改为伪直播，才会在所设置的开始时间进行直播
4、接口支持https协议
 */
export interface Api137fRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号，<span class="error">仅支持正常延迟的纯视频频道设置伪直播</span> */
  channelId: string;
  /** 视频来源，<br/>取值 vod 表示点播视频 <br/>取值material 表示素材库视频 <br/>取值record 表示直播暂存回放视频。<br/>默认为 vod。 */
  origin?: string;
  /** 要设置伪直播的视频ID，多个以英文逗号分割。<br/>如果origin传值为vod，需要传点播的视频ID <br/>如果origin传值为material，需要传素材库的视频素材ID <br/>如果origin传值为record,需要传直播回放暂存视频的fileId */
  vids: string;
  /** 伪直播开始时间列表，13位毫秒级时间戳，多个以英文逗号分割，需要与vid数量匹配。<br/>如果为空，则表示不设置直播时间<br/>如果不为空，需大于当前时间 */
  startTimes?: string;
}
/**
 * 1、批量添加伪直播的视频，需预先将视频上传至点播系统
2、调用接口后，如果当前频道未在直播中，会自动设置直播方式为“伪直播“
3、如果当前使用其他直播推流方式直播中，则需要在直播结束后，调用”修改频道推流方式“接口修改为伪直播，才会在所设置的开始时间进行直播
4、接口支持https协议
 */
export interface Api137fResponse {
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
 * 1、创建重制课件任务，需等候任务队列执行完成，不是实时重制
2、接口支持https协议
 */
export interface Api6c26Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 回放视频id 【videoId可通过[查询视频库列表](/live/api/channel/playback/get_playback_list)获取，支持素材库类型的回放视频】 */
  videoId: string;
}
/**
 * 1、创建重制课件任务，需等候任务队列执行完成，不是实时重制
2、接口支持https协议
 */
export interface Api6c26Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回true，失败时返回空字符串 */
  data?: string;
}
/**
 * 1、批量关联或者取消关联接收转播频道设置
2、接口支持https协议
 */
export interface Api1755Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 转播频道号 */
  channelId: string;
  /** 需要关联或者取消关联的接收频道ID，多个以英文逗号分割 */
  receiveChannelIds: string;
  /** 操作类型，取值：add 关联，cancel 取消关联，默认是 add 关联 */
  _type?: string;
}
/**
 * 1、批量关联或者取消关联接收转播频道设置
2、接口支持https协议
 */
export interface Api1755Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回操作成功的接收频道 ID 数组 */
  data?: string;
}
/**
 * 1、创建频道并进行相关设置
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api2719Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、创建频道并进行相关设置
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api2719Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功响应时返回频道详细信息【详见[data字段说明](/live/api/channel/operate/basic_create.md?id=polyv1)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、批量添加频道商品库商品
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api7f9bRequest {
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
 * 1、批量添加频道商品库商品
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api7f9bResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为商品信息【详见[Data参数描述](/live/api/channel/operate/add_channel_product.md?id=polyv1)】，请求失败时为空 */
  data?: unknown;
}
/**
 * 1、批量关联分会场
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api48a8Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 主会场频道号 */
  channelId: string;
}
/**
 * 1、批量关联分会场
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api48a8Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功创建的分会场频道数组 */
  data?: unknown;
}
/**
 * 1、根据发起转播的频道，批量创建接收转播的频道
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api6548Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号（发起转播的频道号） */
  channelId: string;
}
/**
 * 1、根据发起转播的频道，批量创建接收转播的频道
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api6548Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功创建的接收转播的频道信息列表【详见[ChannelInfo字段说明](#ChannelInfo参数描述)】 */
  data?: unknown;
}
/**
 * ChannelInfo nested object
 */
export interface ChannelInfo {
  /** 频道号 */
  channelId?: number;
  /** 频道名称 */
  name?: string;
  /** 频道密码 */
  channelPasswd?: string;
  /** 频道观看条件 */
  authType?: string;
  /** 频道是否开启回放，Y:开启，N:关闭 */
  playBackEnabled?: string;
  /** 频道推流方式 */
  streamType?: string;
  /** 频道是否开启调试，Y:开启，N:关闭 */
  debugEnabled?: string;
  /** 频道流名 */
  stream?: string;
  /** 频道状态 */
  status?: string;
  /** 频道所在分类Id */
  categoryId?: number;
  /** 频道所在分类名称 */
  categoryName?: string;
  /** 频道是否为小班课，Y:开启，N:关闭 */
  isSmallClass?: string;
  /** 频道直播场景，和发起转播的频道一致 */
  newScene?: string;
  /** 频道直播模板，和发起转播的频道一致 */
  template?: string;
  /** 频道创建时间 */
  createdTime?: number;
  /** 频道封面图片 */
  coverImage?: string;
  /** 频道类型，transmit：发起转播，normal：普通的频道，receive：接收转播 */
  _type?: string;
  /** 频道开始时间 */
  startTime?: number;
  /** 频道主持人 */
  publisher?: string;
  /** 频道引导图图片地址 */
  splashImg?: string;
  /** 频道引导图开关，Y:开启，N:关闭 */
  splashEnabled?: string;
  /** 频道无延迟直播开关，Y:开启，N:关闭 */
  pureRtcEnabled?: string;
  /** 频道分房间信息，没有则返回null */
  roomIds?: string;
}
/**
 * 1、批量创建角色，角色包括Guest(嘉宾)、Assistant(助教)
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api26c8Request {
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
 * 1、批量创建角色，角色包括Guest(嘉宾)、Assistant(助教)
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api26c8Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回角色信息【详见[data字段说明](/live/api/channel/operate/batch_create.md?id=polyv1)】 */
  data?: unknown;
}
/**
 * 1、批量创建直播频道
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api26caRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、批量创建直播频道
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api26caResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回批量频道信息【详见[data字段说明](/live/api/channel/operate/batch_create_channels.md?id=polyv2)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、批量删除频道商品
2、接口支持https协议
 */
export interface Api4d38Request {
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
 * 1、批量删除频道商品
2、接口支持https协议
 */
export interface Api4d38Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时返回SUCCESS，请求失败时为空 */
  data?: string;
}
/**
 * 1、批量删除直播频道
2、如果响应失败，则表示全部频道都失败，不会有部份成功、部份失败的结果
3、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
4、接口支持https协议
 */
export interface Api279cRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、批量删除直播频道
2、如果响应失败，则表示全部频道都失败，不会有部份成功、部份失败的结果
3、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
4、接口支持https协议
 */
export interface Api279cResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为true，请求失败为空字符串 */
  data?: string;
}
/**
 * 1、批量修改频道商品库商品上下架状态
2、接口支持https协议
 */
export interface Api4fa8Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 商品上下架状态<br>1：上架<br>2：下架 */
  shelf: number;
}
/**
 * 1、批量修改频道商品库商品上下架状态
2、接口支持https协议
 */
export interface Api4fa8Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时返回SUCCESS，请求失败时为空 */
  data?: string;
}
/**
 * 1、批量修改频道弹幕开关
2、调用后频道会关闭掉通用设置
3、接口支持https协议
 */
export interface Api2362Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 是否关闭弹幕功能<br/>Y：表示关闭<br/>N：表示开启 */
  closeDanmu: string;
  /** 是否显示弹幕信息开关，<br/>Y：表示显示<br/>N：表示不显示 */
  showDanmuInfoEnabled: string;
  /** 需要修改弹幕开关的频道号，多个频道号用半角逗号 , 隔开 */
  channelIds: string;
}
/**
 * 1、批量修改频道弹幕开关
2、调用后频道会关闭掉通用设置
3、接口支持https协议
 */
export interface Api2362Response {
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
 * 1、取消推送频道商品库商品
2、接口支持https协议
 */
export interface Api48f3Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 商品productId */
  productId: number;
}
/**
 * 1、取消推送频道商品库商品
2、接口支持https协议
 */
export interface Api48f3Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回null，失败时返回空字符串 */
  data?: string;
}
/**
 * 1、手动结束问卷
2、接口支持https
 */
export interface Api7d13Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号， 多个频道用英文逗号分隔 */
  channelIds: string;
}
/**
 * 1、手动结束问卷
2、接口支持https
 */
export interface Api7d13Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 处理结果，成功返回result，失败返回空字符串 【详见[data字段描述](/live/api/channel/operate/channels_stop_questionnaire.md?id=data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、获取频道聊天室在线人数接口
2、接口支持https协议
 */
export interface Api49bbRequest {
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
 * 1、获取频道聊天室在线人数接口
2、接口支持https协议
 */
export interface Api49bbResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 返回在线人数，比如 100 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过一个频道复制出一个新的频道
2、接口支持https协议
 */
export interface Api29c2Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 需要复制频道的频道号 */
  channelId: string;
  /** 新的频道名称，默认为复制频道的频道名称 */
  name?: string;
  /** 新的频道所属分类ID，默认为默认分类 */
  categoryId?: number;
  /** 频道开始时间，格式：yyyy-MM-DD HH:mm:ss，默认为复制频道的开始时间 */
  startTime?: string;
  /** 直播子账号邮箱，复制频道到子账号邮箱对应的组织下面，不传则创建在顶级组织下面 */
  subAccount?: string;
}
/**
 * 1、通过一个频道复制出一个新的频道
2、接口支持https协议
 */
export interface Api29c2Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为复制后生成频道的频道号 */
  data?: Record<string, unknown>;
}
/**
 * 1、创建频道并进行相关设置
2、接口支持https协议
 */
export interface Api2719Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** POLYV用户ID，和保利威官网一致，获取路径：官网->登录->直播（开发设置） */
  userId: string;
  /** 频道名称，最大长度60 */
  name: string;
  /** 频道密码，长度不能超过16位 */
  channelPasswd: string;
  /** 直播场景，默认alone<br/>alone：活动拍摄<br/>ppt：三分屏<br/>topclass：大班课<br/>seminar：研讨会 */
  scene?: string;
  /** 是否为无延时直播，默认为N<br/>Y：是<br/>N：否 */
  pureRtcEnabled?: string;
  /** 中英文直播间开关，默认为N<br/>Y：开启<br/>N：关闭 */
  cnAndEnLiveEnabled?: string;
  /** 英文直播间开关，默认为N<br/>Y：开启<br/>N：关闭 */
  englishSettingEnabled?: string;
  /** 英文主持人名称 */
  publisherEnglishName?: string;
  /** 英文频道名称 */
  channelEnglishName?: string;
  /** 新建频道的所属分类，如果不提交，则为默认分类（分类ID可通过[“查询直播分类”](/live/api/account/get_category_list)接口得到） */
  categoryId?: number;
  /** 最大同时在线人数，0和-1表示不限制观看人数 */
  maxViewer?: number;
  /** 连麦人数，最大16人（范围大于等于-1，小于等于全局设置的连麦人数），-1：使用全局设置的连麦人数 */
  linkMicLimit?: number;
  /** 播放器控制栏颜色，默认：#666666 */
  playerColor?: string;
  /** 是否自动播放<br/>0：不自动播放<br/>1：自动播放，默认1 */
  autoPlay?: number;
  /** 是否为接收转播频道，不填或者填其他值为发起转播频道（注：需要开启频道转播功能该参数才生效）<br/>Y：表示是<br/>N：表示否 */
  receive?: string;
  /** 接收转播频道号，多个频道号用半角逗号，隔开，如果receive参数值为Y时，此参数无效（注：需要开启频道转播功能该参数才生效） */
  receiveChannelIds?: string;
  /** 频道属性 */
  channelObject?: string;
  /** 双师频道属性，N不开启（默认为N）Y为双师频道 */
  doubleEnabled?: string;
  /** 预约的功能开关，默认为Y<br/> Y：开启<br/>N：关闭 */
  bookingEnabled?: string;
  /** 直播方式<br/>client：客户端推流<br/>pull：拉流<br/>thirdpull：第三方拉流<br/>disk：伪直播<br/>audio：音频直播 */
  streamType?: string;
  /** 普通直播观看页布局配置(普通:normal,竖屏:portrait)，默认普通直播 */
  aloneWatchLayout?: string;
}
/**
 * 1、创建频道并进行相关设置
2、接口支持https协议
 */
export interface Api2719Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功响应时返回频道详细信息【详见[data字段说明](/live/api/channel/operate/create.md?id=polyv1)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、删除频道内某个助教或嘉宾
3、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api1132Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 助教/嘉宾账号（不能以数字类型提交，否则可能去掉角色号前的00） */
  account: string;
}
/**
 * 1、删除频道内某个助教或嘉宾
3、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api1132Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时返回删除结果，删除成功为true，频道已被删除为false，请求错误返回空字符串 */
  data?: string;
}
/**
 * 1、删除单个直播频道
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api2719Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** POLYV用户ID，和保利威官网一致，获取路径：官网->登录->直播（开发设置） */
  userId: string;
}
/**
 * 1、删除单个直播频道
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api2719Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为true，请求失败为空字符串 */
  data?: string;
}
/**
 * 1、删除频道商品库商品
2、接口支持https协议
 */
export interface Api4782Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 商品productId */
  productId: number;
}
/**
 * 1、删除频道商品库商品
2、接口支持https协议
 */
export interface Api4782Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为SUCCESS，请求失败时为空 */
  data?: string;
}
/**
 * 1、删除伪直播中的视频，不允许删除正在伪直播中的视频
2、接口支持https协议
3、接口仅删除伪直播视频与频道的关联关系，并不会删除伪直播的视频
 */
export interface Api6cd1Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 要删除伪直播的点播视频ID,多个用逗号隔开。跟videoIds两个参数不能同时为空 */
  vids?: string;
  /** 频道号 */
  channelId: string;
  /** 要删除伪直播的ID列表，多个用逗号隔开。跟vids两个参数不能同时为空 */
  videoIds?: string;
}
/**
 * 1、删除伪直播中的视频，不允许删除正在伪直播中的视频
2、接口支持https协议
3、接口仅删除伪直播视频与频道的关联关系，并不会删除伪直播的视频
 */
export interface Api6cd1Response {
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
 * 1、删除重制课件任务, 可批量删除
2、正在进行重制中的任务不能删除
3、接口支持https协议
 */
export interface Api6c26Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道ID */
  channelId: string;
  /** 任务ID列表，多个任务ID使用”,”进行分隔 */
  taskIds: string;
}
/**
 * 1、删除重制课件任务, 可批量删除
2、正在进行重制中的任务不能删除
3、接口支持https协议
 */
export interface Api6c26Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应数据 */
  data?: Record<string, unknown>;
  /** 处理结果, true成功 */
  data_result?: boolean;
}
/**
 * 1、结束当前正在直播中的伪直播
2、接口支持https协议
 */
export interface Api2b64Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号，<span class="error">仅支持正常延迟的纯视频频道设置伪直播</span> */
  channelId: string;
  /** 伪直播id,不传则结束当前时间直播中的伪直播 */
  diskVideoId?: string;
}
/**
 * 1、结束当前正在直播中的伪直播
2、接口支持https协议
 */
export interface Api2b64Response {
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
 * 1、查询频道内某个助教或嘉宾的具体信息
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api3ea5Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 助教/嘉宾账号（不能以数字类型提交，否则可能去掉角色号前的00） */
  account: string;
}
/**
 * 1、查询频道内某个助教或嘉宾的具体信息
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api3ea5Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为角色的信息 【详见[data字段描述](/live/api/channel/operate/get_account.md?id=data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、查询频道内所有助教和嘉宾的具体信息
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api3a2aRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询频道内所有助教和嘉宾的具体信息
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api3a2aResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为角色的信息 【详见[data字段描述](/live/api/channel/operate/get_accounts.md?id=data字段描述)】 */
  data?: unknown;
}
/**
 * 1、获取观众观看调用接口token
2、该token用于观看端的sdk调用直播api的相关接口
3、接口支持https协议
 */
export interface Api27d6Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 观众viewerId，长度：1-64位字符 */
  viewerId: string;
  /** 昵称 */
  nickname?: string;
  /** 观众头像 */
  avatar?: string;
  /** 微信的openId */
  openid?: string;
  /** 用户头衔 */
  actor?: string;
}
/**
 * 1、获取观众观看调用接口token
2、该token用于观看端的sdk调用直播api的相关接口
3、接口支持https协议
 */
export interface Api27d6Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为频道的信息 【详见[data字段描述](#data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、查询频道回调设置接口
2、接口支持https协议
 */
export interface Api7373Request {
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
 * 1、查询频道回调设置接口
2、接口支持https协议
 */
export interface Api7373Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回回调设置信息【详见[data字段说明](/live/api/channel/operate/get_callback_setting.md?id=polyv1)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、截图功能，查询当前频道正在直播的截图（截图五分钟更新一次）
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api7e8fRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、截图功能，查询当前频道正在直播的截图（截图五分钟更新一次）
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api7e8fResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为截图地址，请求错误时为空 */
  data?: string;
}
/**
 * 1、查询频道广告列表信息，如频道广告设置了应用通用设置，则获取全局广告
2、管理系统广告列表设置入口：云直播-我的直播-频道设置-观看页管理-营销-广告
3、接口支持https协议
 */
export interface Api7612Request {
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
 * 1、查询频道广告列表信息，如频道广告设置了应用通用设置，则获取全局广告
2、管理系统广告列表设置入口：云直播-我的直播-频道设置-观看页管理-营销-广告
3、接口支持https协议
 */
export interface Api7612Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为频道广告的信息 【详见[data字段描述](/live/api/channel/operate/get_channel_adverts.md?id=data字段描述)】 */
  data?: unknown;
}
/**
 * 1、查询直播频道信息
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api4782Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询直播频道信息
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api4782Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为频道的信息 【详见[data字段描述](/live/api/channel/operate/get_channel_detail.md?id=data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、查询频道基本信息
2、接口支持https协议
 */
export interface Api4782Request {
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
 * 1、查询频道基本信息
2、接口支持https协议
 */
export interface Api4782Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为频道的详细设置信息 【详见[data字段说明](/live/api/channel/operate/get_channel_detail_setting.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、查询频道商品库开关状态
2、接口支持https协议
 */
export interface Api21e1Request {
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
 * 1、查询频道商品库开关状态
2、接口支持https协议
 */
export interface Api21e1Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时返回开关状态信息，请求失败时为空【详见[data字段描述](/live/api/channel/operate/get_channel_product_enabled.md?id=data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、获取频道商品库商品列表
2、支持分页
3、接口支持https协议
 */
export interface Api71e3Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 上下架状态【1：上架，2：下架】 */
  status?: number;
  /** 商品ID，多个用逗号分隔 */
  productIds?: string;
  /** 当前页，默认1 */
  page?: number;
  /** 每一页数据大小，默认10，最大值100 */
  size?: number;
}
/**
 * 1、获取频道商品库商品列表
2、支持分页
3、接口支持https协议
 */
export interface Api71e3Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为商品信息【详见[Data参数描述](/live/api/channel/operate/get_channel_product_list.md?id=polyv1)】，请求失败时为空 */
  data?: Record<string, unknown>;
}
/**
 * 1、获取频道聊天室的在线人数
2、接口支持https协议
 */
export interface Api4523Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: number;
}
/**
 * 1、获取频道聊天室的在线人数
2、接口支持https协议
 */
export interface Api4523Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为频道的聊天室在线人数 */
  data?: Record<string, unknown>;
}
/**
 * 1、获取授权和连麦的token
2、接口支持https协议
 */
export interface Api7081Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 观看者用户Id */
  userId: string;
  /** 角色<br/>teacher：讲师<br/>admin：管理员<br/>guest：嘉宾 <br/>assistant：助教 <br/>viewer：观看者 */
  role: string;
  /** 观看来源，可以自定义<br/>web：网页端<br/>client：客户端<br/>app：手机应用端 */
  origin?: string;
}
/**
 * 1、获取授权和连麦的token
2、接口支持https协议
 */
export interface Api7081Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为频道的信息 【详见[data字段描述](/live/api/channel/operate/get_chat_token.md?id=data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、查询频道重制课件设置
2、接口支持https协议
 */
export interface Api3af6Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道ID */
  channelId: string;
}
/**
 * 1、查询频道重制课件设置
2、接口支持https协议
 */
export interface Api3af6Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回重制课件结果集【详见[data字段说明](/live/api/channel/operate/get_pptrecord_setting.md?id=polyv1)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、获取频道推流URL，由于推流地址可能发生变化，所以请在使用时获取
2、接口支持https协议
 */
export interface Api60ecRequest {
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
 * 1、获取频道推流URL，由于推流地址可能发生变化，所以请在使用时获取
2、接口支持https协议
 */
export interface Api60ecResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功返回为推流地址 */
  data?: string;
}
/**
 * 1、获取频道免密登录URL
2、接口支持https协议
 */
export interface Api751dRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 角色账号 ID，角色如嘉宾等 */
  accountId?: string;
}
/**
 * 1、获取频道免密登录URL
2、接口支持https协议
 */
export interface Api751dResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为免密登录的 URL */
  data?: string;
}
/**
 * 1、查询账号或频道下的转播列表信息
2、接口支持https协议
 */
export interface Api707dRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 发起转播频道号，如果不传，则查询appId对应的账号下所有转播频道关联关系 */
  channelId?: string;
}
/**
 * 1、查询账号或频道下的转播列表信息
2、接口支持https协议
 */
export interface Api707dResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回账号下频道的转播列表信息数组【详见[data字段说明](/live/api/channel/operate/get_transmit_associations.md?id=polyv1)】 */
  data?: unknown;
}
/**
 * 1、查询子账号频道列表

2、接口支持https协议
 */
export interface Api21e4Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 子账号用户ID */
  childUserId: string;
  /** 频道创建时间-起始范围 */
  startTime?: number;
  /** 频道创建时间-结束范围 */
  endTime?: number;
  /** 当前页码 */
  pageNumber: number;
  /** 分页大小 */
  pageSize: number;
}
/**
 * 1、查询子账号频道列表

2、接口支持https协议
 */
export interface Api21e4Response {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 成功响应的数据 */
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
  /** 每页数据大小 */
  pageSize?: number;
  /** 当前页数 */
  pageNumber?: number;
  /** 总的条数 */
  totalItems?: number;
  /** 总页数 */
  totalPages?: number;
  /** 查询的结果列表【详见[Contents参数描述](#Contents参数描述)】 */
  contents?: unknown[];
}
/**
 * Contents nested object
 */
export interface Contents {
  /** 频道ID */
  channelId?: number;
  /** 组织架构ID */
  organizationId?: string;
  /** 创建时间 */
  createdTime?: number;
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
 * 1、获取观众观看调用接口token
2、该token用于观看页SDK调用watch-api相关接口
3、接口支持https协议
 */
export interface Api2ff8Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 观众viewerId，长度：1-64位字符 */
  viewerId: string;
  /** 昵称 */
  nickname?: string;
  /** 观众头像 */
  avatar?: string;
  /** 微信的openId */
  openid?: string;
  /** 用户头衔 */
  actor?: string;
}
/**
 * 1、获取观众观看调用接口token
2、该token用于观看页SDK调用watch-api相关接口
3、接口支持https协议
 */
export interface Api2ff8Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为频道的信息 【详见[data字段描述](#data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、查询关注公众号设置接口
2、支持多个频道查询
3、接口支持https协议
 */
export interface Api897dRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号,多个频道用“,”分隔 */
  channelIds: string;
}
/**
 * 1、查询关注公众号设置接口
2、支持多个频道查询
3、接口支持https协议
 */
export interface Api897dResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回结果集【详见[data字段说明](/live/api/channel/operate/list_channels_follow.md?id=list)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、查询频道重制课件参数设置信息
2、接口支持https协议
 */
export interface Api559fRequest {
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
 * 1、查询频道重制课件参数设置信息
2、接口支持https协议
 */
export interface Api559fResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回重制课件结果集【详见[data字段描述](/live/api/channel/operate/ppt_get_setting.md?id=data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、设置频道重制课件配置信息
2、接口支持https协议
 */
export interface Api559fRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 是否使用通用设置<br/>Y：是<br/>N：否 */
  globalSettingEnabled: string;
  /** 视频布局方式<br/>0：三分屏<br/>1：纯文档<br/>2：画中画 */
  _type: number;
  /** 摄像头画面比例，新版重制有效<br/>0：画面比例16:9<br/>1：画面比例4:3 */
  videoRatio?: number;
  /** 展示图片，新版重制有效，支持jpg和png格式<br/>摄像头画面比例为16:9时尺寸为480X810<br/>摄像头画面比例为4:3时尺寸为480X720 */
  brandImgFile?: File | Blob;
  /** 背景图片，旧版重制有效，尺寸为1280X720，支持jpg和png格式 */
  backgroundImgFile?: File | Blob;
}
/**
 * 1、设置频道重制课件配置信息
2、接口支持https协议
 */
export interface Api559fResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回重制课件结果集【详见[data字段描述](/live/api/channel/operate/ppt_setting.md?id=data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、查询课件重制任务列表
2、接口支持https协议
 */
export interface Api22f6Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 重制课件模块中的场次id */
  sessionId?: string;
  /** 状态值<br/>waiting：等待处理<br/>process：处理中<br/>success：重制成功<br/>fail：重制失败<br/>uploaded：上传点播成功<br/>uploadFailed：上传点播失败<br/>vodOweUploadFailed：点播欠费<br/>vodSpaceOverUploadFailed：点播空间不足<br/> */
  status?: string;
  /** 直播开始时间开始区间，格式为yyyyMMddHHmmss */
  startTime?: string;
  /** 直播开始时间结束区间，格式为yyyyMMddHHmmss */
  endTime?: string;
  /** 分页页码 */
  page?: number;
  /** 每页数据大小 */
  pageSize?: number;
}
/**
 * 1、查询课件重制任务列表
2、接口支持https协议
 */
export interface Api22f6Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回重制课件结果集【详见[data字段说明](/live/api/channel/operate/pptrecord_list.md?id=polyv1)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、推送频道商品库商品
2、接口支持https协议
 */
export interface Api605cRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 商品productId */
  productId: number;
  /** 商品推送卡片类型【可选值：smallCard：小卡片、bigCard：大卡片】 */
  pushCardType?: string;
}
/**
 * 1、推送频道商品库商品
2、接口支持https协议
 */
export interface Api605cResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回null，失败时返回空字符串 */
  data?: string;
}
/**
 * 1、将平台商品引用到指定频道（支持是否同步平台商品标签）
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api4826Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值 */
  sign: string;
  /** 频道号 */
  channelId: string;
}
/**
 * 1、将平台商品引用到指定频道（支持是否同步平台商品标签）
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api4826Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 错误或提示信息 */
  message?: string;
  /** 成功时返回新增频道商品信息 */
  data?: Record<string, unknown>;
}
/**
 * 1、根据聊天的id删除对应聊天记录
2、接口支持批量删除操作
3、接口支持https
 */
export interface Api3c82Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 聊天记录对应的id(多个id使用英文逗号隔开)，该参数获取自【[查询频道聊天记录](/live/api/chat/message/get_message_list.md)】 */
  ids: string;
}
/**
 * 1、根据聊天的id删除对应聊天记录
2、接口支持批量删除操作
3、接口支持https
 */
export interface Api3c82Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功返回"remove chat contents success"，失败返回空 */
  data?: string;
}
/**
 * 1、设置子频道单点登录的token
2、该接口在单点登录后台使用场景中配合使用，仅可进入助教页面，具体查看单点登录文档
3、接口URL中的{accountId}为助教角色号
4、接口支持https协议
 */
export interface Api6e6eRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 唯一的字符串，请勿过于简单，建议使用16位随机字符串；设置的token串，10秒内且一次验证有效【具体请查看[单点登录文档](/live/api/account/sso)】 */
  token: string;
}
/**
 * 1、设置子频道单点登录的token
2、该接口在单点登录后台使用场景中配合使用，仅可进入助教页面，具体查看单点登录文档
3、接口URL中的{accountId}为助教角色号
4、接口支持https协议
 */
export interface Api6e6eResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为success，请求失败为空字符串 */
  data?: string;
}
/**
 * 1、设置频道最大观看在线人数
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api8fd6Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** POLYV用户ID，和保利威官网一致，获取路径：官网->登录->直播（开发设置） */
  userId: string;
  /** 最大观看在线人数，等于0时表示关闭在线人数观看限制 */
  maxViewer: number;
}
/**
 * 1、设置频道最大观看在线人数
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api8fd6Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为设置成功，请求失败为空字符串 */
  data?: string;
}
/**
 * 1、设置频道单点登录的token
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api1eddRequest {
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
 * 1、设置频道单点登录的token
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api1eddResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为success，请求失败为空字符串 */
  data?: string;
}
/**
 * 1、修改频道商品库商品上下架状态
2、接口支持https协议
 */
export interface Apiaf92Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 商品ID */
  productId: number;
  /** 商品上下架状态<br>1：上架<br>2：下架 */
  shelf: number;
}
/**
 * 1、修改频道商品库商品上下架状态
2、接口支持https协议
 */
export interface Apiaf92Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时返回SUCCESS，请求失败时为空 */
  data?: string;
}
/**
 * 1、修改商品库商品列表顺序
2、接口支持https协议
 */
export interface Api1bf1Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 商品ID */
  productId: number;
  /** 商品上下移动操作<br>10：上移<br>20：下移<br>50：移动到指定位置 */
  _type: number;
  /** type为50时必传，移动到的指定位置（范围：1~商品总数） */
  sort?: number;
}
/**
 * 1、修改商品库商品列表顺序
2、接口支持https协议
 */
export interface Api1bf1Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时返回SUCCESS，请求失败时为空 */
  data?: string;
}
/**
 * 1、修改助教或嘉宾的信息
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api409aRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 助教/嘉宾账号（不能以数字类型提交，否则可能去掉角色号前的00） */
  account: string;
  /** 角色昵称 */
  nickname?: string;
  /** 角色密码 */
  password?: string;
  /** 角色头像链接，不超过200个字符长度，超过将返回400异常 */
  avatar?: string;
  /** 角色头衔 */
  actor?: string;
  /** 角色翻页权限，只能一个角色有，仅支持三分屏场景<br/>Y：开启<br/>N：关闭 */
  pageTurnEnabled?: string;
  /** 角色公告权限<br/>Y：开启<br/>N：关闭 */
  notifyEnabled?: string;
}
/**
 * 1、修改助教或嘉宾的信息
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api409aResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为success，请求失败为空字符串 */
  data?: string;
}
/**
 * 1、修改频道的相关设置
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https
 */
export interface Api4782Request {
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
 * 1、修改频道的相关设置
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https
 */
export interface Api4782Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功或失败时都返回空字符串 */
  data?: string;
}
/**
 * 1、编辑频道商品库商品信息
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api71e2Request {
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
 * 1、编辑频道商品库商品信息
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api71e2Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功返回SUCCESS，失败返回空 */
  data?: string;
}
/**
 * 1、修改频道商品库开关状态，如果没有开启商品库权限请联系客服
2、接口支持https协议
 */
export interface Api21e1Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 开关状态<br/>Y：开启<br/> N：关闭 */
  enabled: string;
}
/**
 * 1、修改频道商品库开关状态，如果没有开启商品库权限请联系客服
2、接口支持https协议
 */
export interface Api21e1Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回SUCCESS字符串，失败时返回空字符串 */
  data?: string;
}
/**
 * 1、更新关注公众号设置接口
2、支持多个频道查询
3、接口支持https协议
 */
export interface Api897dRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号，多个频道用“,”分隔 */
  channelIds: string;
  /** 图片链接地址 */
  qrCodeUrl: string;
  /** 关注公众号功能开关，为空不进行修改<br/>Y：开启<br/>N：关闭 */
  enabled?: string;
  /** 主动弹窗开关，为空不进行修改<br/>Y：开启<br/>N：关闭 */
  autoShowEnabled?: string;
  /** 入口文案，最大8个字符、为空是不进行修改 */
  entranceText?: string;
  /** 弹窗提示文案，最大30个字符、为空是不进行修改 */
  tips?: string;
  /** PC-弹窗文案, 最大30个字符 */
  pcFollowTips?: string;
}
/**
 * 1、更新关注公众号设置接口
2、支持多个频道查询
3、接口支持https协议
 */
export interface Api897dResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回null，失败时返回空字符串 */
  data?: string;
}
/**
 * 1、修改单个频道号的密码，或者修改账号下所有频道号的密码
2、接口URL中的{userId}为直播账号ID
3、接口支持https协议
 */
export interface Api4783Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 修改的密码 */
  passwd: string;
  /** 频道号，<span class="error">如果该参数为空，会对该用户所有的频道进行修改<span> */
  channelId?: string;
}
/**
 * 1、修改单个频道号的密码，或者修改账号下所有频道号的密码
2、接口URL中的{userId}为直播账号ID
3、接口支持https协议
 */
export interface Api4783Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为true，请求失败为空字符串 */
  data?: string;
}
/**
 * 1、更新频道重制课件设置
2、接口支持https协议
 */
export interface Api3af6Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道ID */
  channelId: string;
  /** 是否使用通用设置，Y是，N否 */
  globalSettingEnabled?: string;
  /** 视频布局方式，0.三分屏、1.纯文档 */
  _type?: number;
  /** 摄像头画面比例，新版重制有效，默认0，0表示16:9、1表示4:3 */
  videoRatio?: number;
  /** 展示图片，新版重制有效，摄像头画面比例为16:9时尺寸为480X810，摄像头画面比例为4:3时尺寸为480X720,支持jpg和png格式 */
  brandImgFile?: File | Blob;
  /** 背景图片，旧版重制有效，尺寸为1280X720,支持jpg和png格式 */
  backgroundImgFile?: File | Blob;
}
/**
 * 1、更新频道重制课件设置
2、接口支持https协议
 */
export interface Api3af6Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应数据 */
  data?: Record<string, unknown>;
  /** 处理结果, true成功 */
  data_result?: boolean;
}
/**
 * 1、修改频道回调设置接口
2、如频道需要跟随用户设置，可以调用设置频道默认项开关接口
3、接口支持https协议
 */
export interface Api7373Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 录制回调文件类型，可选值m3u8或mp4或m3u8,mp4 */
  recordCallbackVideoType?: string;
  /** 录制回调http(s)地址，需要url编码，如果要清空设置传入空串 */
  recordCallbackUrl?: string;
  /** 转存成功回调http(s)地址，需要url编码，如果要清空设置传入空串 */
  playbackCallbackUrl?: string;
  /** 流状态回调http(s)地址，需要url编码，如果要清空设置传入空串 */
  streamCallbackUrl?: string;
  /** 课件重制成功回调http(s)地址，需要url编码，如果要清空设置传入空串 */
  pptRecordCallbackUrl?: string;
  /** 直播内容鉴别回调http(s)地址，需要url编码，如果要清空设置传入空串 */
  liveScanCallbackUrl?: string;
  /** 回放转存回调http(s)地址，需要url编码，如果要清空设置传入空串 */
  playbackCacheCallbackUrl?: string;
  /** <span style="color:red">（规划中，预计2025Q2支持）</span>字幕生成回调http(s)地址，需要url编码，如果要清空设置传入空串 */
  subtitleCallbackUrl?: string;
  /** 直播违规断流回调http(s)地址，需要url编码，如果要清空设置传入空串 */
  liveViolationCutoffCallbackUrl?: string;
  /** 直播观众预约回调http(s)地址，需要url编码，如果要清空设置传入空串 */
  customBookingCallbackUrl?: string;
}
/**
 * 1、修改频道回调设置接口
2、如频道需要跟随用户设置，可以调用设置频道默认项开关接口
3、接口支持https协议
 */
export interface Api7373Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回空 */
  data?: string;
}
/**
 * 1、修改频道的直播推流方式
2、接口支持https协议
 */
export interface Api78cbRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 直播推流方式<br/>client：客户端推流<br/>disk：伪直播<br/>audio：音频直播<br/> pull：拉流直播 */
  streamType: string;
  /** 拉流url */
  pullUrl?: string;
  /** 开始拉流时间，streamType为pull时可传。如：1700558940000，表示在2023-11-21 17:29:00向pullUrl进行拉流 */
  pullStreamTime?: number;
  /** 频道号 */
  channelId: string;
}
/**
 * 1、修改频道的直播推流方式
2、接口支持https协议
 */
export interface Api78cbResponse {
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
 * 1、添加账号对应的点播视频到直播频道下的视频库
2、接口支持https协议
 */
export interface Api28ddRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 点播视频vid【可通过[点播API-搜索视频](/vod/api/video_management/search/search_video)获取】，如果跨频道请阅读[接口约束](#接口约束)第二点 */
  vid: string;
  /** 添加到视频库列表中的位置，默认为N<br/>Y：回放列表中置顶<br/>N：回放列表中置底 */
  setAsDefault?: string;
  /** 列表类型，普通直播场景默认为vod，三分屏默认为playback<br/>playback：回放列表<br/>vod：点播列表 */
  listType?: string;
}
/**
 * 1、添加账号对应的点播视频到直播频道下的视频库
2、接口支持https协议
 */
export interface Api28ddResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为频道录制视频信息 【详见[data字段描述](/live/api/channel/playback/add_vod_playback.md?id=data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、裁剪直播录制视频文件，裁剪文件过程为异步处理过程
2、裁剪视频的最小粒度仅支持到单位为秒(s)的裁剪
3、接口支持https协议
 */
export interface Api125fRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 文件ID【可通过[查询频道录制视频信息](/live/api/channel/playback/get_record_info)获取】 */
  fileId: string;
  /** 要裁剪移除的时间区间<br/>传入格式要求：<br/>（1）start、end值是单位为秒的数值，格式为：`[{"start":xx, "end":xx},{"start":xx, "end":xx}]`<br/>（2）多个区间请按照时间顺序从小到大排列<br/>（3）时间区间不允许重叠<br/>（4）时间区间不得超过100个限制<br/>【示例：要裁剪移除的是第1s到第14s，以及第25s到第30s的区间，则传入的字符串为 `[{"start":1, "end":14},{"start":25, "end":30}]` 】<br/>误差说明：<br/>（1）裁剪区间存在一定的时间误差<br/>（2）误差原因：回放默认为m3u8格式裁剪，由于m3u8的视频裁剪是精确到每片ts，所以裁剪时会判断裁剪要移除的时间区间所包含的ts片，进行裁剪移除，如需更精准的裁剪，可联系保利威客服人员开通mp4裁剪 */
  deleteTimeFrame: string;
  /** 裁剪成功或失败回调的url【详见[回调说明](/live/api/channel/playback/clip_record_file.md?id=回调说明)】 */
  callbackUrl?: string;
  /** 是否自动转存回放到点播，默认为N<br/>Y：是<br/>N：否 */
  autoConvert?: string;
  /** 裁剪后文件名 */
  fileName?: string;
}
/**
 * 1、裁剪直播录制视频文件，裁剪文件过程为异步处理过程
2、裁剪视频的最小粒度仅支持到单位为秒(s)的裁剪
3、接口支持https协议
 */
export interface Api125fResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时返回提交成功信息<br/>"submit success."：提交的视频正在裁剪处理中 */
  data?: string;
}
/**
 * 1、删除频道回放管理视频库中的某个视频，只是在频道视频库列表删除，点播后台中视频依然存在
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api2e1aRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 直播系统中视频id【videoId可通过[查询视频库列表](/live/api/channel/playback/get_playback_list)获取】 */
  videoId: string;
  /** 视频列表类型，普通直播场景默认为vod，三分屏默认为playback<br/>playback：回放列表<br/>vod：点播列表 */
  listType?: string;
}
/**
 * 1、删除频道回放管理视频库中的某个视频，只是在频道视频库列表删除，点播后台中视频依然存在
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api2e1aResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功返回success，请求失败返回空字符串 */
  data?: string;
}
/**
 * 1、删除频道视频库中直播暂存的录制视频
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api35adRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 录制视频的场次ID */
  sessionId?: string;
  /** 录制视频的开始录制时间，格式为：yyyyMMddHHmmss，如：20210317181043【可通过[查询频道录制视频信息](/live/api/channel/playback/get_record_info)获取】 */
  startTime?: string;
}
/**
 * 1、删除频道视频库中直播暂存的录制视频
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api35adResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功或失败都返回空字符串 */
  data?: string;
}
/**
 * 1、查询频道直播场次信息
2、接口支持https协议
 */
export interface Api731aRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 开始日期，格式：yyyy-MM-dd HH:mm:ss，如果时间为00:00:00也支持格式：yyyy-MM-dd */
  startDate?: string;
  /** 结束日期，格式：yyyy-MM-dd HH:mm:ss，如果时间为00:00:00也支持格式：yyyy-MM-dd */
  endDate?: string;
  /** 页数，默认为1 */
  page?: string;
  /** 每页显示的数据条数，默认20 */
  pageSize?: string;
}
/**
 * 1、查询频道直播场次信息
2、接口支持https协议
 */
export interface Api731aResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为频道直播场次信息 【详见[data字段描述](/live/api/channel/playback/get_channel_sessions.md?id=data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * Contents nested object
 */
export interface Contents {
  /** 频道号 */
  channelId?: string;
  /** 直播场次ID */
  sessionId?: string;
  /** POLYV用户ID，和保利威官网一致，获取路径：官网->登录->直播（开发设置） */
  userId?: string;
  /** 直播开始时间，13位毫秒级时间戳 */
  startTime?: number;
  /** 直播结束时间，13位毫秒级时间戳 */
  endTime?: number;
}
/**
 * 1、查询频道的回放开关状态
2、接口支持https协议
 */
export interface Api72dbRequest {
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
 * 1、查询频道的回放开关状态
2、接口支持https协议
 */
export interface Api72dbResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时返回频道回放开关状态<br/>Y：开启<br/>N：关闭 */
  data?: string;
}
/**
 * 1、管理系统视频列表信息入口：云直播-我的直播-频道设置-回放管理-视频库-回放列表/点播列表
2、接口URL中的{channelId}为频道号
3、接口支持https协议
4、素材库类型的频道仅查询回放列表视频
 */
export interface Api23bdRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 页数 */
  page?: string;
  /** 每页显示的数据条数 */
  pageSize?: string;
  /** 视频列表类型，普通直播场景默认为vod，三分屏默认为playback<br/>playback：回放列表<br/>vod：点播列表  <code style="color:red">频道为素材库类型下该参数无效，仅查询回放列表</code> */
  listType?: string;
  /** 场次ID，多个用英文逗号分割（仅查询转存文件来源为频道录制的视频） */
  sessionIds?: string;
  /** 回放视频标题，支持模糊查询 */
  title?: string;
}
/**
 * 1、管理系统视频列表信息入口：云直播-我的直播-频道设置-回放管理-视频库-回放列表/点播列表
2、接口URL中的{channelId}为频道号
3、接口支持https协议
4、素材库类型的频道仅查询回放列表视频
 */
export interface Api23bdResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为回放视频的视频列表信息 【详见[data字段描述](/live/api/channel/playback/get_playback_list.md?id=data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * Contents nested object
 */
export interface Contents {
  /** 直播系统生成的id */
  videoId?: string;
  /** 点播视频vid / 素材id */
  videoPoolId?: string;
  /** POLYV用户ID，和保利威官网一致，获取路径：官网->登录->直播（开发设置） */
  userId?: string;
  /** 回放视频对应的直播频道号 */
  channelId?: string;
  /** 视频标题 */
  title?: string;
  /** 视频首图 */
  firstImage?: string;
  /** 视频长度，格式为HH:mm:ss */
  duration?: string;
  /** 默认视频的播放清晰度<br/>1：流畅<br/>2：高清<br/>3：超清 */
  myBr?: string;
  /** 访客信息收集id */
  qid?: string;
  /** 视频加密状态<br/>1：加密<br/>0：非加密 */
  seed?: number;
  /** 关联点播视频的排序字段 */
  ordertime?: number;
  /** 添加为回放视频的日期，13位毫秒级时间戳 */
  createdTime?: number;
  /** 视频最后修改日期，13位毫秒级时间戳 */
  lastModified?: number;
  /** 排序值，值越大优先级越高 */
  rank?: number;
  /** 是否为默认播放视频<br/>Y：播放<br/>N：不播放 */
  asDefault?: string;
  /** 视频播放地址，注：如果视频为加密视频，则此地址无法访问 */
  url?: string;
  /** 用于PPT请求数据，与PPT直播的回放相关，普通直播回放值为null */
  channelSessionId?: string;
  /** 关联点播视频的状态 */
  status?: string;
  /** 视频地址 */
  fileUrl?: string;
  /** 回放视频转存前的暂存fileId */
  fileId?: string;
  /** 直播开始时间，格式为：yyyyMMddHHmmss */
  startTime?: string;
  /** 直播类型<br/>alone：活动直播<br/>ppt：三分屏<br/>topclass：大班课<br/>seminar：研讨会 */
  liveType?: string;
  /** 视频宽度 */
  width?: number;
  /** 视频高度 */
  height?: number;
  /** 转存文件来源<br/>manual：手动录制<br/>auto：自动录制<br/>merge：合并<br/>clip：裁剪<br/>smart-clip：智能裁剪 */
  origin?: string;
  /** 转存视频时设置的回调地址 */
  callbackUrl?: string;
  /** 处理失败的次数 */
  errorCount?: number;
  /** 语言类型，默认为中文<br/>zh_CN：中文<br/>EN：英文 */
  lang?: string;
  /** 英文回放videoId */
  videoIdEN?: string;
  /** 英文回放文件地址 */
  enFileUrl?: string;
  /** 视频合并信息 */
  mergeInfo?: string;
  /** 观看回放视频的地址 */
  watchUrl?: string;
  /** 来源场次Id */
  originSessionId?: string;
  /** 回放字幕列表【详见[subtitleList参数描述](/live/api/channel/playback/get_playback_list.md?id=subtitleList参数描述)】 */
  subtitleList?: unknown;
  /** mp4视频地址 （如果为素材库视频，则有防盗链过期时间为 1 天，过期后需要重新请求接口获取） */
  mp4?: string;
}
/**
 * subtitleList nested object
 */
export interface subtitleList {
  /** 字幕ID */
  id?: number;
  /** 字幕文件名称 */
  name?: string;
  /** 字幕文件URL */
  srtUrl?: string;
  /** 字幕语言 */
  language?: string;
  /** 字幕状态，publish--显示，finish-不显示 */
  status?: string;
}
/**
 * 1、查询频道回放设置
2、接口支持https协议
 */
export interface Api72e1Request {
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
 * 1、查询频道回放设置
2、接口支持https协议
 */
export interface Api72e1Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功返回频道回放设置【详见[data参数描述](#Data参数描述)】 */
  data?: Record<string, unknown>;
}
/**
 * Data nested object
 */
export interface Data {
  /** 频道号 */
  channelId?: string;
  /** 回放类型<br/>single：单个视频回放<br/>list：列表回放 */
  _type?: string;
  /** 回放的开关<br/>Y：开启<br/>N：关闭 */
  playbackEnabled?: string;
  /** 回放的视频来源<br/>record：录制文件<br/>playback：回放列表<br/>vod：点播列表 */
  origin?: string;
  /** 回放的视频ID */
  videoId?: string;
  /** 回放的视频名称 */
  videoName?: string;
  /** 回放设置，章节开关<br/>Y：开启<br/>N：关闭 */
  sectionEnabled?: string;
  /** 是否应用通用设置<br/>Y：是<br/>N：否 */
  globalSettingEnabled?: string;
  /** 定时回放类型<br/>timedOpen：定时打开，timedClosed：定时关闭，period：时间段内打开,custom-自定义,disable：关闭 */
  crontabType?: string;
  /** 放开回放的时间,13位毫秒级时间 */
  startTime?: number;
  /** 关闭回放的时间,13位毫秒级时间 */
  endTime?: number;
  /** 倍数播放开关<br/>Y：开启<br/>N：关闭 */
  playbackMultiplierEnabled?: string;
  /** 进度条开关<br/>Y：开启<br/>N：关闭 */
  playbackProgressBarEnabled?: string;
  /** 进度条操作方式<br/>drag 拖动,prohibitDrag 禁止拖动,dragHistoryOnly 只能拖动已观看内容 */
  playbackProgressBarOperationType?: string;
  /** 显示播放按钮开关<br/>Y：开启<br/>N：关闭 */
  showPlayButtonEnabled?: string;
  /** 定时回放：自定义时间,crontType为custom自定义时生效 */
  customOpenDuration?: number;
  /** 商品库开关<br/>Y：开启<br/>N：关闭,开启后，回放时观众将看到商品列表和推送商品，将读取后台最新的商品数据。 */
  productPlaybackEnabled?: string;
  /** 聊天互动重现开关<br/>Y：开启<br/>N：关闭 */
  chatPlaybackEnabled?: string;
  /** 商品库互动重现开关<br/>Y：开启<br/>N：关闭, 开启后，回放时观众将看到商品列表和推送商品，将读取后台最新的商品数据。 */
  productPlaybackEnabled?: string;
  /** 问卷互动重现开关<br/>Y：开启<br/>N：关闭 */
  questionnairePlaybackEnabled?: string;
  /** 答题卡互动重现开关<br/>Y：开启<br/>N：关闭 */
  qaPlaybackEnabled?: string;
  /** 卡片推送互动重现开关<br/>Y：开启<br/>N：关闭 */
  cardPushPlaybackEnabled?: string;
  /** 签到互动重现开关<br/>Y：开启<br/>N：关闭 */
  checkInPlaybackEnabled?: string;
}
/**
 * 1、通过文件ID查询频道内录制视频文件信息
2、接口支持https协议
 */
export interface Api6c92Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 文件ID【可通过[查询频道录制视频信息](/live/api/channel/playback/get_record_info)获取】 */
  fileId: string;
}
/**
 * 1、通过文件ID查询频道内录制视频文件信息
2、接口支持https协议
 */
export interface Api6c92Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为录制视频文件信息 【详见[data字段描述](/live/api/channel/playback/get_record_file.md?id=data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、管理系统频道录制视频信息入口：云直播-我的直播-频道设置-回放管理-视频库-直播暂存
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api17f1Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** POLYV用户ID，和保利威官网一致，获取路径：官网->登录->直播（开发设置） */
  userId: string;
  /** 开始日期，格式：yyyy-MM-dd */
  startDate?: string;
  /** 结束日期，格式：yyyy-MM-dd */
  endDate?: string;
  /** 直播场次ID，多个用英文逗号分割 */
  sessionIds?: string;
}
/**
 * 1、管理系统频道录制视频信息入口：云直播-我的直播-频道设置-回放管理-视频库-直播暂存
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api17f1Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为频道录制视频信息 【详见[data字段描述](/live/api/channel/playback/get_record_info.md?id=data字段描述)】 */
  data?: unknown;
}
/**
 * subtitleList nested object
 */
export interface subtitleList {
  /** 字幕ID */
  id?: number;
  /** 字幕文件名称 */
  name?: string;
  /** 字幕文件URL */
  srtUrl?: string;
  /** 字幕语言 */
  language?: string;
  /** 字幕状态，publish--显示，finish-不显示 */
  status?: string;
}
/**
 * 1、设置直播录制打点
2、接口支持https协议
 */
export interface Api67bfRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 打点类型，pause 暂停录制，resume继续录制 */
  _type: string;
  /** 是否从一开始就暂停录制，Y表示是，其他不是，只有在type为pause时生效。 */
  fromStartStop?: string;
}
/**
 * 1、设置直播录制打点
2、接口支持https协议
 */
export interface Api67bfResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功返回true，请求失败返回空 */
  data?: boolean;
}
/**
 * 1、将直播录制文件转存至点播后台中
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api5a50Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 直播账号ID */
  userId: string;
  /** 转存后的点播视频名称 */
  fileName: string;
  /** 转存到录制文件地址【可通过[查询频道录制视频信息](/live/api/channel/playback/get_record_info)获取】 */
  fileUrl?: string;
  /** 直播场次ID，只传此参数时，可将对应场次的直播录制视频转存到点播 */
  sessionId?: string;
  /** 目录ID，不填或者填写错误即为默认分类 */
  cataid?: string;
  /** 目录名称，默认为默认分类，当cataid设置为-1时，会新建一个名称为cataname的目录，并将视频放到该目录下 */
  cataname?: string;
  /** 是否存放到回放列表，默认为N，Y：存放到回放列表，N：不存放 */
  toPlayList?: string;
  /** 是否设为默认回放视频，默认为Y，Y：设置默认回放视频（转存后在回放列表中位于第一个），N：转存后在回放列表位于最后一个。此参数仅在toPlayList=Y时生效 */
  setAsDefault?: string;
}
/**
 * 1、将直播录制文件转存至点播后台中
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api5a50Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应结果，请求成功时返回转存成功后的点播视频的id（即vid） */
  data?: string;
}
/**
 * 1、批量转存直播暂存录制视频文件到点播列表，接口转存过程为异步处理过程
2、接口支持https协议
 */
export interface Api7b1cRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 要转存的录制视频文件ID，多个ID用英文逗号,分隔【fileId可通过[查询频道录制视频信息](/live/api/channel/playback/get_record_info)获取】 */
  fileIds: string;
  /** 转存后的文件名，目前暂不支持传多个文件名 */
  fileName?: string;
  /** 点播视频回收站存在视频时是否返回成功，默认值为1(注：参数为1时，接口返回成功，实际不会重新转存点播视频)，<span class="error">建议传0</span><br/>1：返回成功<br/>0：返回异常 */
  canRepeat?: number;
  /** 转存到点播的目录ID，默认为点播的根目录ID */
  cataId?: string;
  /** 转存成功时候回调通知的url【详见[回调说明](/live/api/channel/playback/record_convert_async.md?id=回调说明)】 */
  callbackUrl?: string;
}
/**
 * 1、批量转存直播暂存录制视频文件到点播列表，接口转存过程为异步处理过程
2、接口支持https协议
 */
export interface Api7b1cResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时返回提交成功信息<br/>"submit success."：转存任务提交成功<br/>"processing."：转存任务正在处理中 */
  data?: string;
}
/**
 * 1、合并频道的录制文件，保存至频道号内视频库
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api3b8dRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 要合并的录制文件URL，多个文件用英文逗号","分隔，urls必须为相同格式的文件，【url可通过[查询频道录制视频信息](/live/api/channel/playback/get_record_info)获取】 */
  urls?: string;
  /** 要合并的录制文件id，多个文件id用英文逗号","分隔，【fileId可通过[查询频道录制视频信息](/live/api/channel/playback/get_record_info)获取】 */
  fileIds?: string;
  /** 合并后的文件名 */
  fileName?: string;
}
/**
 * 1、合并频道的录制文件，保存至频道号内视频库
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api3b8dResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时返回合并后的文件地址，请求失败返回空 */
  data?: string;
}
/**
 * 1、合并直播录制文件，保存至频道号内视频库，接口合并过程为异步处理过程
2、接口支持https协议
 */
export interface Api308cRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 要合并的录制视频文件ID，多个id用英文逗号, 分隔【fileId可通过[查询频道录制视频信息](/live/api/channel/playback/get_record_info)获取】 */
  fileIds: string;
  /** 合并后的视频的文件名 */
  fileName?: string;
  /** 合并成功或失败回调的url，可以带上自定义参数【详见[回调说明](/live/api/channel/playback/record_file_merge_async.md?id=回调说明)】 */
  callbackUrl?: string;
  /** 是否自动转存到点播，默认为N<br/>Y：自动转存到对应点播分类下（点播保存路径：直播回放-频道号-场次）<br/>N：不自动转存 */
  autoConvert?: string;
  /** 合并后文件类型，默认为N<br/>Y：合并为MP4文件<br/>N：合并为m3u8文件 */
  mergeMp4?: string;
  /** 是否按照参数的fileIds顺序做合并, 取值Y或N, 不传默认N会按照开播时间顺序合并 */
  orderByCustom?: string;
}
/**
 * 1、合并直播录制文件，保存至频道号内视频库，接口合并过程为异步处理过程
2、接口支持https协议
 */
export interface Api308cResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时返回提交成功信息<br/>"processing."：合并任务正在处理中<br/>"submit success."：合并任务提交成功 */
  data?: string;
}
/**
 * 1、合并直播录制mp4文件，接口合并过程为异步处理过程
2、接口支持https协议
 */
export interface Api5e2dRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 录制文件创建时间最小值，与endTime最大不能超过8小时，为13位毫秒级时间戳 */
  startTime: string;
  /** 录制文件创建时间最大值，与startTime最大不能超过8小时，为13位毫秒级时间戳 */
  endTime: string;
  /** 合并成功或失败回调的url【详见[回调说明](/live/api/channel/playback/record_merge_mp4.md?id=回调说明)】 */
  callbackUrl?: string;
  /** 合并后的视频的文件名，长度不能超过64 */
  fileName?: string;
}
/**
 * 1、合并直播录制mp4文件，接口合并过程为异步处理过程
2、接口支持https协议
 */
export interface Api5e2dResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为相关的信息 【详见[data字段描述](/live/api/channel/playback/record_merge_mp4.md?id=data字段描述)】 */
  data?: string;
}
/**
 * 1、合并直播录制mp4文件，接口合并过程为异步处理过程
2、接口支持https协议
 */
export interface Api5e2dRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 录制文件直播开始时间最小值，与endTime最大不能超过8小时，为13位毫秒级时间戳 */
  startTime: string;
  /** 录制文件直播开始时间最大值，与startTime最大不能超过8小时，为13位毫秒级时间戳 */
  endTime: string;
  /** 合并成功或失败回调的url【详见[回调说明](/live/api/channel/playback/record_merge_mp4_start.md?id=回调说明)】 */
  callbackUrl?: string;
  /** 合并后的视频的文件名，长度不能超过64 */
  fileName?: string;
}
/**
 * 1、合并直播录制mp4文件，接口合并过程为异步处理过程
2、接口支持https协议
 */
export interface Api5e2dResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为相关的信息 【详见[data字段描述](/live/api/channel/playback/record_merge_mp4_start.md?id=data字段描述)】 */
  data?: string;
}
/**
 * 1、修改单个或全部频道的回放开关
2、接口URL中的{userId}为直播账号ID
3、接口支持https协议
 */
export interface Api72dbRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 回放开关状态<br/>Y：开启<br/>N：关闭 */
  playBackEnabled: string;
  /** 频道号，<span class="error">不提交或者传-1则修改该用户所有频道号的回放开关</span> */
  channelId?: string;
}
/**
 * 1、修改单个或全部频道的回放开关
2、接口URL中的{userId}为直播账号ID
3、接口支持https协议
 */
export interface Api72dbResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功返回频道号，请求失败返回空 */
  data?: string;
}
/**
 * 1、修改视频库单个视频的上移、下移（包括点播列表和回放列表）
2、接口支持https协议
 */
export interface Api1598Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 排序列表类型，普通直播场景默认为vod，三分屏默认为playback<br/>playback：回放列表<br/>vod：点播列表 */
  listType?: string;
  /** 移动类型，up上移，down下移 */
  _type: string;
  /** 视频库的视频ID */
  videoId: string;
}
/**
 * 1、修改视频库单个视频的上移、下移（包括点播列表和回放列表）
2、接口支持https协议
 */
export interface Api1598Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功或失败都返回空字符串 */
  data?: string;
}
/**
 * 1、修改视频库回放列表的视频排序
2、（channelId, listType, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api53d7Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 排序列表类型，普通直播场景默认为vod，三分屏默认为playback<br/>playback：回放列表<br/>vod：点播列表 */
  listType?: string;
}
/**
 * 1、修改视频库回放列表的视频排序
2、（channelId, listType, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api53d7Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功或失败都返回空字符串 */
  data?: string;
}
/**
 * 1、将回放列表中的某个视频设置为默认回放视频
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api4a6fRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 直播系统中视频id【videoId可通过[查询视频库列表](/live/api/channel/playback/get_playback_list)获取】 */
  videoId: string;
  /** 视频列表类型，普通直播场景默认为vod，三分屏默认为playback<br/>playback：回放列表<br/>vod：点播列表 */
  listType?: string;
}
/**
 * 1、将回放列表中的某个视频设置为默认回放视频
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api4a6fResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功返回success，请求失败返回空 */
  data?: string;
}
/**
 * 1、修改频道回放设置
2、接口支持https协议
 */
export interface Api72e1Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 是否使用通用设置，默认为N（新版后台频道设置不生效）<br/>Y：是<br/>N：否 */
  globalSettingEnabled?: string;
  /** 定时回放类型：timedOpen-定时打开，timedClosed-定时关闭，period-时间段内打开,custom-自定义，disable-关闭 */
  crontabType?: string;
  /** 放开回放的时间，13位时间戳 */
  startTime?: number;
  /** 关闭回放的时间，13位时间戳 */
  endTime?: number;
  /** 回放开关状态，默认为N<br/>Y：开启<br/>N：关闭 */
  playbackEnabled?: string;
  /** 回放方式<br/>single：单个回放<br/>list：列表回放 */
  _type?: string;
  /** 回放来源<br/>record：暂存<br/>playback：回放列表<br/>vod：点播列表<br/>material：素材库<br/> */
  origin?: string;
  /** 直播系统中视频id【可通过[查询视频库列表](/live/api/channel/playback/get_playback_list)获取】，如：73801f70c8，<br/><span class="error">注：不是指的点播vid</span><br/> */
  videoId?: string;
  /** 章节开关<br/>Y：开启<br/>N：关闭 */
  sectionEnabled?: string;
  /** 倍数播放开关<br/>Y：开启<br/>N：关闭 */
  playbackMultiplierEnabled?: string;
  /** 进度条开关<br/>Y：开启<br/>N：关闭 */
  playbackProgressBarEnabled?: string;
  /** 进度条操作方式<br/>drag 拖动,prohibitDrag 禁止拖动,dragHistoryOnly 只能拖动已观看内容 */
  playbackProgressBarOperationType?: string;
  /** 显示播放按钮开关<br/>Y：开启<br/>N：关闭 */
  showPlayButtonEnabled?: string;
  /** 商品库开关<br/>Y：开启<br/>N：关闭 */
  productPlaybackEnabled?: string;
  /** 定时回放：自定义时间,crontabType为custom自定义时生效 */
  customOpenDuration?: number;
  /** 聊天互动重现开关<br/>Y：开启<br/>N：关闭 */
  chatPlaybackEnabled?: string;
  /** 商品库互动重现开关<br/>Y：开启<br/>N：关闭 */
  productPlaybackEnabled?: string;
  /** 问卷互动重现开关<br/>Y：开启<br/>N：关闭 */
  questionnairePlaybackEnabled?: string;
  /** 答题卡互动重现开关<br/>Y：开启<br/>N：关闭 */
  qaPlaybackEnabled?: string;
  /** 卡片推送互动重现开关<br/>Y：开启<br/>N：关闭 */
  cardPushPlaybackEnabled?: string;
  /** 签到互动重现开关<br/>Y：开启<br/>N：关闭 */
  checkInPlaybackEnabled?: string;
}
/**
 * 1、修改频道回放设置
2、接口支持https协议
 */
export interface Api72e1Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功返回true，请求失败返回空 */
  data?: boolean;
}
/**
 * 1、修改频道视频库回放列表中某个视频的名称
2、接口支持https协议
 */
export interface Apif311Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 回放视频ID【videoId可通过[查询视频库列表](/live/api/channel/playback/get_playback_list)获取】 */
  videoId: string;
  /** 回放视频名称 */
  title: string;
}
/**
 * 1、修改频道视频库回放列表中某个视频的名称
2、接口支持https协议
 */
export interface Apif311Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功或失败都返回空字符串 */
  data?: string;
}
/**
 * 1、接口用于设置某频道播放器的片头广告
2、接口URL中的{channelId}为 频道ID
3、接口支持https
 */
export interface Api68eaRequest {
  /** 从API设置中获取，在直播系统登记的appId */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
  /** 签名，32位大写MD5值 */
  sign: string;
  /** Y-开启，N-关闭；设置开关时，其余设置参数无效 */
  enabled?: string;
  /** 广告类型,NONE-无广告，IMAGE-图片广告，FLV-视频广告 */
  headAdvertType?: string;
  /** 广告地址 */
  headAdvertMediaUrl?: string;
  /** 广告跳转地址 */
  headAdvertHref?: string;
  /** 广告时长 */
  headAdvertDuration?: number;
  /** 广告宽度 */
  headAdvertWidth?: number;
  /** 广告高度 */
  headAdvertHeight?: number;
}
/**
 * 1、修改播放器logo图片
2、接口URL中的{channelId}为 频道ID
3、接口支持https协议
 */
export interface Api33c1Request {
  /** 从API设置中获取，在直播系统登记的appId */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
  /** logo图片地址，建议大小为：长方形140x50或正方形50x50 */
  logoImage: string;
  /** logo透明度，取值范围为(0,1]，即大于0，并且小于等于1 */
  logoOpacity: string;
  /** logo位置，取值为为左上角(tl)、右上角(tr)、左下角(bl)、右下角(br) */
  logoPosition: string;
  /** logo图片点击跳转链接 */
  logoHref?: string;
  /** 签名，32位大写MD5值 */
  sign: string;
}
/**
 * 1、接口用于设置某频道播放器的暂停广告
2、接口URL中的{channelId}为 频道ID
3、接口支持https
 */
export interface Api636fRequest {
  /** 从API设置中获取，在直播系统登记的appId */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
  /** 签名，32位大写MD5值 */
  sign: string;
  /** Y-打开，N-关闭；设置开关时，其余设置参数无效 */
  enabled?: string;
  /** 图片地址，不填代表删除 */
  stopAdvertImage?: string;
  /** 点击图片跳转Url */
  stopAdvertHref?: string;
}
/**
 * 1、导出频道场次报表（图表）
3、接口支持https协议
 */
export interface Api6d9fRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 直播频道号 */
  channelId: string;
  /** 直播场次号 */
  sessionId: string;
}
/**
 * 1、导出频道场次报表（图表）
3、接口支持https协议
 */
export interface Api6d9fResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 直播场次报表的下载地址（地址的有效期是60天，过期后要重新调用接口生成） */
  data?: string;
}
/**
 * 1、查询根据自定义场次UUID查询直播场次
3、接口支持https协议
 */
export interface Api3c23Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 场次ID */
  channelId: string;
  /** 自定义直播场次UUID，该参数设置自【[直播场次关联自定义ID](/live/api/channel/session/relevance-session-by-external)】 */
  externalSessionId: string;
}
/**
 * 1、查询根据自定义场次UUID查询直播场次
3、接口支持https协议
 */
export interface Api3c23Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为角色的信息 【详见[data字段描述](/live/api/channel/session/get_session-by-external.md?id=data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、根据自定义场次ID查询频道暂存文件ID
2、接口支持https协议
 */
export interface Api7cf7Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 场次ID */
  channelId: string;
  /** 自定义直播场次UUID，该参数设置自【[直播场次关联自定义ID](/live/api/channel/session/relevance-session-by-external)】 */
  externalSessionId: string;
}
/**
 * 1、根据自定义场次ID查询频道暂存文件ID
2、接口支持https协议
 */
export interface Api7cf7Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 暂存文件列表 【详见[data字段描述](#data字段描述)】 */
  data?: unknown;
}
/**
 * 1、将直播场次关联自定义的直播场次UUID，关联频道之后开播的场次、以及这些开播场次衍生出来的裁剪和合并视频
3、接口支持https协议
 */
export interface Api5e89Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道ID */
  channelId: string;
  /** 自定义直播场次UUID，32位长度 */
  externalSessionId: string;
}
/**
 * 1、将直播场次关联自定义的直播场次UUID，关联频道之后开播的场次、以及这些开播场次衍生出来的裁剪和合并视频
3、接口支持https协议
 */
export interface Api5e89Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为true */
  data?: Record<string, unknown>;
}
/**
 * 1、查询频道直播场次信息
2、接口支持https协议
 */
export interface Api731aRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 直播场次的开始日期，格式：yyyy-MM-dd HH:mm:ss，如果时间为00:00:00也支持格式：yyyy-MM-dd */
  startDate?: string;
  /** 直播场次的结束日期，格式：yyyy-MM-dd HH:mm:ss，如果时间为00:00:00也支持格式：yyyy-MM-dd */
  endDate?: string;
  /** 页数，默认为1 */
  page?: string;
  /** 每页显示的数据条数，默认20 */
  pageSize?: string;
}
/**
 * 1、查询频道直播场次信息
2、接口支持https协议
 */
export interface Api731aResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为频道直播场次信息 【详见[data字段描述](#data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * Contents nested object
 */
export interface Contents {
  /** 频道号 */
  channelId?: string;
  /** 直播场次ID */
  sessionId?: string;
  /** POLYV用户ID，和保利威官网一致，获取路径：官网->登录->直播（开发设置） */
  userId?: string;
  /** 直播开始时间，13位毫秒级时间戳 */
  startTime?: number;
  /** 直播结束时间，13位毫秒级时间戳 */
  endTime?: number;
}
/**
 * 1、停止硬盘推流
2、接口支持https协议
 */
export interface Api426fRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 直播系统videoId */
  diskVideoId: string;
}
/**
 * 1、停止硬盘推流
2、接口支持https协议
 */
export interface Api426fResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功和请求失败为空字符串 */
  data?: string;
}
/**
 * 1、查询频道直播状态
2、接口支持https协议
 */
export interface Api4786Request {
  /** 可调用[查询频道信息](/live/api/channel/operate/get_channel_detail)接口，获取stream字段的值 */
  stream: string;
}
/**
 * 1、批量查询频道直播状态
2、接口支持https协议
 */
export interface Api57a2Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 用英文逗号隔开的频道号，如：10000,100001 最多20个 */
  channelIds: string;
}
/**
 * 1、批量查询频道直播状态
2、接口支持https协议
 */
export interface Api57a2Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为频道直播流状态信息【详见[data字段说明](/live/api/channel/state/get_live_status_list.md?id=data字段说明)】 */
  data?: unknown;
}
/**
 * 1、获取频道直播的实时推流信息
2、deployAddress、inAddress、lfr信息可能无法获取，返回值为null
3、接口支持https协议
 */
export interface Api18faRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 直播中的频道号 */
  channelId: string;
}
/**
 * 1、获取频道直播的实时推流信息
2、deployAddress、inAddress、lfr信息可能无法获取，返回值为null
3、接口支持https协议
 */
export interface Api18faResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为频道实时推流信息，无法获取时，返回值为null 【详见[data字段描述](/live/api/channel/state/get_stream_info.md?id=data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、批量获取频道直播的实时推流信息
2、deployAddress、inAddress、lfr信息可能无法获取，返回值为null
3、接口支持https协议
 */
export interface Api5eb1Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 直播中的频道号，多个频道用英文逗号分隔，最多100个 */
  channelIds: string;
}
/**
 * 1、批量获取频道直播的实时推流信息
2、deployAddress、inAddress、lfr信息可能无法获取，返回值为null
3、接口支持https协议
 */
export interface Api5eb1Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为频道实时推流信息列表【详见[data字段描述](#data字段描述)】 */
  data?: unknown;
}
/**
 * 1、获取硬盘推流(伪直播)视频列表
2、接口支持https协议
 */
export interface Api29b0Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 当前页码，默认为1 */
  page?: number;
  /** 分页大小，默认为10 */
  limit?: number;
}
/**
 * 1、获取硬盘推流(伪直播)视频列表
2、接口支持https协议
 */
export interface Api29b0Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 返回数据【详见[Data参数描述](#Data参数描述)】 */
  data?: string;
}
/**
 * data nested object
 */
export interface data {
  /** 每页数据大小 */
  pageSize?: number;
  /** 当前页数 */
  pageNumber?: number;
  /** 总的条数 */
  totalItems?: number;
  /** 频道详细信息列表【详见[Contents参数描述](#Content参数描述)】 */
  contents?: unknown;
}
/**
 * Content nested object
 */
export interface Content {
  /** 直播系统videoId */
  videoId?: string;
  /** 点播系统videoPoolId */
  videoPoolId?: string;
  /** 直播系统userId */
  userId?: string;
  /** 频道号 */
  channelId?: number;
  /** 伪直播视频标题 */
  title?: string;
  /** 伪直播首图，需拼接域名才能使用 */
  firstImage?: string;
  /** 视频长度，如：00:17:36 */
  duration?: string;
  /** 伪直播开始时间，13位时间戳 */
  startTime?: number;
  /** 伪直播结束时间，13位时间戳 */
  endTime?: number;
  /** 该记录保存时间 */
  createdTime?: number;
  /** 该记录最后修改时间 */
  lastModified?: number;
  /** 伪直播mp4地址 */
  url?: string;
  /** 伪直播流状态:waiting-未直播,live-直播中,end-已结束 */
  streamStatus?: string;
  /** 语言:CN-中文,EN-英文(频道开启双流直播可设置英文伪直播) */
  langType?: string;
}
/**
 * 1、禁止频道的直播推流，禁止有效期为24小时，24小时后会恢复频道推流
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api7024Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** POLYV用户ID，和保利威官网一致，获取路径：官网->登录->直播（开发设置） */
  userId: string;
  /** 禁播截至日期的十三位时间戳，最长禁播90天，不传默认禁播24小时 */
  forbidTime?: number;
  /** 断流后是否禁止观看页回放, 参数值支持Y和N, 不传默认N, 代表不禁止 */
  playbackForbidden?: string;
}
/**
 * 1、禁止频道的直播推流，禁止有效期为24小时，24小时后会恢复频道推流
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api7024Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为success，请求失败为空字符串 */
  data?: string;
}
/**
 * 1、恢复频道的直播推流
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api5de9Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** POLYV用户ID，和保利威官网一致，获取路径：官网->登录->直播（开发设置） */
  userId: string;
}
/**
 * 1、恢复频道的直播推流
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api5de9Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为success，请求失败为空字符串 */
  data?: string;
}
/**
 * 1、修改频道直播状态为无直播
2、接口URL中的{channelId}为频道号
3、接口支持https协议
4、该接口的状态修改不会触发直播状态改变回调。
 */
export interface Api5e2cRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** POLYV用户ID，和保利威官网一致，获取路径：官网->登录->直播（开发设置） */
  userId: string;
}
/**
 * 1、修改频道直播状态为无直播
2、接口URL中的{channelId}为频道号
3、接口支持https协议
4、该接口的状态修改不会触发直播状态改变回调。
 */
export interface Api5e2cResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为success，请求失败为空字符串 */
  data?: string;
}
/**
 * 1、修改频道直播状态为直播中
2、接口URL中的{channelId}为频道号
3、接口支持https协议
4、该接口的状态修改不会触发直播状态改变回调。
 */
export interface Api5e6aRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** POLYV用户ID，和保利威官网一致，获取路径：官网->登录->直播（开发设置） */
  userId: string;
}
/**
 * 1、修改频道直播状态为直播中
2、接口URL中的{channelId}为频道号
3、接口支持https协议
4、该接口的状态修改不会触发直播状态改变回调。
 */
export interface Api5e6aResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为success，请求失败为空字符串 */
  data?: string;
}
/**
 * 1、分页查询直播频道商品点击数据
2、接口支持https协议
 */
export interface Api6ca0Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 场次ID */
  sessionId?: string;
  /** 开始时间，13位毫秒级时间戳 */
  startTime?: number;
  /** 结束时间，13位毫秒级时间戳 */
  endTime?: number;
  /** 当前页数 */
  pageNumber?: number;
  /** 每页数据大小，默认10条数据，最大1000条 */
  pageSize?: number;
}
/**
 * 1、分页查询直播频道商品点击数据
2、接口支持https协议
 */
export interface Api6ca0Response {
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
 * contents nested object
 */
export interface contents {
  /** 频道号 */
  channelId?: string;
  /** 场次id */
  sessionId?: string;
  /** 商品id */
  productId?: number;
  /** 商品名字 */
  name?: number;
  /** 商品类型 normal:普通商品,finance:金融商品 */
  productType?: string;
  /** 商品点击总数，各渠道点击总和 */
  productClickNum?: number;
  /** 通用链接点击人数 */
  linkClickNum?: number;
  /** pc web点击人数 */
  pcClickNum?: number;
  /** 移动 web点击人数 */
  mobileClickNum?: number;
  /** 小程序点击人数 */
  wxMiniProgramClickNum?: number;
  /** app ios原生点击人数 */
  iosClickNum?: number;
  /** app 安卓原生点击人数 */
  androidClickNum?: number;
}
/**
 * 1、分页查询直播频道购物袋展开次数
2、接口支持https协议
 */
export interface Api12c5Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 场次ID */
  sessionId?: string;
  /** 开始时间，13位毫秒级时间戳 */
  startTime?: number;
  /** 结束时间，13位毫秒级时间戳 */
  endTime?: number;
  /** 当前页数 */
  pageNumber?: number;
  /** 每页数据大小，默认10条数据，最大1000条 */
  pageSize?: number;
}
/**
 * 1、分页查询直播频道购物袋展开次数
2、接口支持https协议
 */
export interface Api12c5Response {
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
 * contents nested object
 */
export interface contents {
  /** 频道号 */
  channelId?: string;
  /** 场次id */
  sessionId?: string;
  /** 商品列表点击次数 */
  productListClickNum?: number;
}
/**
 * 1、分页查询频道红包派发数据统计
2、接口支持https协议
 */
export interface Api7513Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 场次ID */
  sessionId?: string;
  /** 开始时间，13位毫秒级时间戳 */
  startTime?: number;
  /** 结束时间，13位毫秒级时间戳 */
  endTime?: number;
  /** 当前页数 */
  pageNumber?: number;
  /** 每页数据大小，默认10条数据，最大1000条 */
  pageSize?: number;
}
/**
 * 1、分页查询频道红包派发数据统计
2、接口支持https协议
 */
export interface Api7513Response {
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
 * contents nested object
 */
export interface contents {
  /** 红包ID */
  redPackId?: string;
  /** 用户微信OPENID */
  userId?: string;
  /** 频道号 */
  channelId?: string;
  /** 昵称 */
  nickName?: string;
  /** 红包金额 */
  amount?: number;
  /** 红包余额 */
  balance?: number;
  /** 分配方式名称： <br/>随机分配红包 <br/>平均分配红包 */
  allotType?: string;
  /** 创建时间，13位毫秒级时间戳 */
  createdTime?: number;
  /** 状态名称： <br/> 进行中<br/>已结束 <br/> 退款中<br/>已退款 */
  status?: string;
  /** 红包类型名称  <br/> 红包雨<br/>口令红包 <br/> 普通红包 */
  redPackType?: string;
  /** 领取用户列表【详见[receive字段说明](#receive参数描述)】 */
  redPackReceiveList?: unknown;
}
/**
 * receive nested object
 */
export interface receive {
  /** 红包ID */
  redPackId?: string;
  /** 用户微信OPENID */
  userId?: string;
  /** 昵称 */
  nickName?: string;
  /** 头像 */
  avatar?: string;
  /** 领取金额（小数点后两位） */
  amount?: number;
  /** 领取时间，13位毫秒级时间戳 */
  createdTime?: number;
}
/**
 * 1、根据提交的频道号，查询频道有关信息的统计数据，数据会根据频道号进行汇总，返回pc端播放时长、pc端播放流量、移动端播放时长、移动端播放流量等。
2、接口URL中的{userId}为直播账号ID
3、接口支持https协议
 */
export interface Api6df7Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 开始日期，格式：yyyy-MM-dd */
  startDate: string;
  /** 结束日期，格式：yyyy-MM-dd */
  endDate: string;
  /** 要查询的频道号，多个频道号以英文逗号“,”分开，如105420,104400，不提交默认为查询所有频道 */
  channelIds?: string;
}
/**
 * 1、根据提交的频道号，查询频道有关信息的统计数据，数据会根据频道号进行汇总，返回pc端播放时长、pc端播放流量、移动端播放时长、移动端播放流量等。
2、接口URL中的{userId}为直播账号ID
3、接口支持https协议
 */
export interface Api6df7Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为频道有关信息【详见[Data参数描述](/live/api/channel/viewdata/channel_play_summary.md?id=polyv1)】，请求失败时为空 */
  data?: unknown;
}
/**
 * 1、查询后台频道统计信息

2、接口支持https协议
 */
export interface Api53b0Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 结束日期，格式：yyyy-MM-dd */
  endDate: string;
  /** 开始日期，格式：yyyy-MM-dd */
  startDate: string;
}
/**
 * 1、查询后台频道统计信息

2、接口支持https协议
 */
export interface Api53b0Response {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 频道统计视图对象【详见[Data参数描述](#Data参数描述)】 */
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
  /** 人均观看时长，为(观看时长/观看人数ips)向下取整，单位:分钟 */
  averagePlayDuration?: number;
  /** 人均观看次数，为(观看次数/观看人数ips)*10后向下取整后再除10，所以有一位小数，单位：次 */
  averageTime?: number;
  /** 观看人数（根据ip地址去重） */
  ips?: number;
  /** 观看人数（根据viewerId计算） */
  viewers?: number;
  /** 观看时长，单位:分钟 */
  playDuration?: number;
  /** 观看次数 */
  plays?: number;
  /** 访问人数 */
  uniqueVisitor?: number;
  /** 是否根据viewerId统计平均观看时长和次数，Y是，N否 */
  statisticsByViewer?: string;
  /** 人均观看时长，为(观看时长/观看人数viewers)向下取整，单位:分钟 */
  averagePlayDurationByViewer?: number;
  /** 人均观看次数，为(观看次数/观看人数viewers)*10后向下取整后再除10，所以有一位小数，单位：次 */
  averageTimeByViewer?: number;
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
 * 1、获取频道在某个日期区间并发人数
2、接口支持https协议
 */
export interface Api7cc9Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 开始日期，格式：yyyy-MM-dd */
  startDate: string;
  /** 结束日期，格式：yyyy-MM-dd */
  endDate: string;
}
/**
 * 1、获取频道在某个日期区间并发人数
2、接口支持https协议
 */
export interface Api7cc9Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为日期区间内的并发信息【详见[Data参数描述](/live/api/channel/viewdata/concurrency.md?id=polyv1)】，请求失败时为空 */
  data?: unknown;
}
/**
 * 1、通过频道号获取该频道某段时间的直播观看的统计数据
2、接口支持https协议
 */
export interface Api3f63Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 开始日期，格式：yyyy-MM-dd */
  startDay: string;
  /** 结束日期，格式：yyyy-MM-dd */
  endDay: string;
}
/**
 * 1、通过频道号获取该频道某段时间的直播观看的统计数据
2、接口支持https协议
 */
export interface Api3f63Response {
  /** 状态值 */
  status?: string;
  /** 相应的结果 【详见[Result参数描述](/live/api/channel/viewdata/summary.md?id=Result参数描述)】 */
  result?: unknown;
}
/**
 * Result nested object
 */
export interface Result {
  /** 查询日期，格式：yyyy-MM-dd */
  currentDay?: string;
  /** 频道号 */
  channelId?: string;
  /** 直播账号ID */
  userId?: string;
  /** PC端播放时长，单位：分钟 */
  pcPlayDuration?: number;
  /** PC端总播放量，类似PV */
  pcVideoView?: number;
  /** PC端唯一观众数，类似UV */
  pcUniqueViewer?: number;
  /** 移动端播放时长，单位：分钟 */
  mobilePlayDuration?: number;
  /** 移动端总播放量，类似PV */
  mobileVideoView?: number;
  /** 移动端唯一观众数，类似UV */
  mobileUniqueViewer?: number;
  /** 记录添加的时间，13位毫秒级时间戳 */
  createdTime?: number;
  /** 记录修改的时间，13位毫秒级时间戳 */
  lastModified?: number;
  /** 创建账号的子账号用户ID（为空则为主账号创建） */
  creatorId?: string;
  /** 创建频道的子账号名称（主账号创建的则显示"主账号"） */
  creatorName?: string;
}
/**
 * 1、获取频道一定时间范围之内的历史最高并发人数
2、接口支持https协议
 */
export interface Api70f2Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 开始时间，13位毫秒级时间戳 */
  startTime: number;
  /** 结束时间，13位毫秒级时间戳 */
  endTime: number;
}
/**
 * 1、获取频道一定时间范围之内的历史最高并发人数
2、接口支持https协议
 */
export interface Api70f2Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 成功为success，失败为error */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为日期区间内最大的历史并发人数，请求失败时为空 */
  data?: string;
}
/**
 * 1、获取多个频道实时在线人数
2、接口支持https协议
 */
export interface Api2a5bRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 多个频道号，用逗号隔开 */
  channelIds: string;
}
/**
 * 1、获取多个频道实时在线人数
2、接口支持https协议
 */
export interface Api2a5bResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为频道实时在线人数信息【详见[Data参数描述](/live/api/channel/viewdata/get_realtime_viewers.md?id=polyv1)】，请求失败时为空 */
  data?: unknown;
}
/**
 * 1、接口用于统计直播间内多场次的直播的观看数据，数据会根据场次号进行汇总，返回观看UV、观看PV等。
2、接口支持https协议
3、需要在直播完成后一小时才生成最新场次的统计数据
 */
export interface Api7467Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 场次ID，多个场次使用逗号分隔，如：fw82mayhuy,fvipafupmh，场次ID和直播开始结束时间必填一项，场次ID和直播开始结束时间同时存在时，使用场次ID进行查询 */
  sessionIds?: string;
  /** 直播开始时间，13位毫秒级时间戳，开始时间和结束时间相隔不可以超过30天 */
  startTime?: number;
  /** 直播结束时间，13位毫秒级时间戳，<code style="color:red">场次ID和直播开始结束时间必填一项</code> */
  endTime?: number;
}
/**
 * 1、接口用于统计直播间内多场次的直播的观看数据，数据会根据场次号进行汇总，返回观看UV、观看PV等。
2、接口支持https协议
3、需要在直播完成后一小时才生成最新场次的统计数据
 */
export interface Api7467Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为直播观看数据信息【详见[Data参数描述](/live/api/channel/viewdata/get_session_stats.md?id=polyv1)】，请求失败时为空 */
  data?: Record<string, unknown>;
}
/**
 * 1、接口用于查询某个频道的一段时间区间内的连麦详情数据，支持分页
2、接口支持https协议
 */
export interface Api524dRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 开始日期，格式：yyyy-MM-dd，如2020-10-01，时间范围不能超过30天 */
  startDate: string;
  /** 结束日期，格式：yyyy-MM-dd，如2020-10-01，时间范围不能超过30天 */
  endDate: string;
  /** 当前页码，默认为1 */
  page?: number;
  /** 每页数据大小，默认500条，最大5000条，超过5000条可以分多批拉取，每次page加1，直到返回列表contents为空为止 */
  pageSize?: number;
}
/**
 * 1、接口用于查询某个频道的一段时间区间内的连麦详情数据，支持分页
2、接口支持https协议
 */
export interface Api524dResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为连麦详情信息【详见[Data参数描述](/live/api/channel/viewdata/link_mic_detail_list.md?id=polyv1)】，请求失败时为空 */
  data?: Record<string, unknown>;
}
/**
 * 1、分页获取频道连麦使用详情，默认查询账号下的所有频道
2、支持账号、批量频道获取连麦情况使用详情
3、接口支持https协议
 */
export interface Api25c2Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前页码，默认1 */
  page?: number;
  /** 每页数据大小，默认10，最大值1000 */
  size?: number;
  /** 频道号，使用英文逗号分开，如：100000,100001，默认查询所有频道 */
  channelIds?: string;
  /** 开始时间，格式：yyyy-MM-dd */
  startDay?: string;
  /** 结束时间，格式：yyyy-MM-dd */
  endDay?: string;
}
/**
 * 1、分页获取频道连麦使用详情，默认查询账号下的所有频道
2、支持账号、批量频道获取连麦情况使用详情
3、接口支持https协议
 */
export interface Api25c2Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为连麦使用有关信息【详见[Data参数描述](/live/api/channel/viewdata/mic_detail_list.md?id=polyv1)】，请求失败时为空 */
  data?: Record<string, unknown>;
}
/**
 * 1、在直播中，查询频道实时在线人数
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api50cfRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 直播账号ID */
  userId: string;
}
/**
 * 1、在直播中，查询频道实时在线人数
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api50cfResponse {
  /** 状态值 */
  status?: string;
  /** 相应的结果【详见[Result参数描述](/live/api/channel/viewdata/realviewers.md?id=polyv1)】 */
  result?: unknown;
}
/**
 * 1、通过频道号获取该频道某段时间的直播观看的统计数据
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api6555Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 开始日期，格式：yyyy-MM-dd */
  startDay: string;
  /** 结束日期，格式：yyyy-MM-dd */
  endDay: string;
}
/**
 * 1、通过频道号获取该频道某段时间的直播观看的统计数据
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api6555Response {
  /** 状态值 */
  status?: string;
  /** 相应的结果 【详见[Result参数描述](/live/api/channel/viewdata/summary.md?id=polyv1)】 */
  result?: unknown;
}
/**
 * 1、获取频道观看日志
2、接口URL中的{channelId}为频道号
3、接口支持https协议
4、直播观看详情数据支持查询最近3年内的历史数据，建议将历史数据导出到本地储存，以便后续查询。
 */
export interface Api1901Request {
  /** 账号appid【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 查询日期，格式：yyyy-MM-dd */
  currentDay: string;
  /** 直播账号ID */
  userId: string;
  /** 观看用户ID */
  param1?: string;
}
/**
 * 1、获取频道观看日志
2、接口URL中的{channelId}为频道号
3、接口支持https协议
4、直播观看详情数据支持查询最近3年内的历史数据，建议将历史数据导出到本地储存，以便后续查询。
 */
export interface Api1901Response {
  /** 状态值 */
  status?: string;
  /** 响应结果集 【详见[Result参数描述](/live/api/channel/viewdata/viewlog_2.md?id=polyv1)】 */
  result?: unknown;
}
/**
 * 1、分页获取频道的直播观看日志
2、接口URL中的{channelId}为频道号
3、接口支持https协议
4、直播观看详情数据支持查询最近3年内的历史数据，建议将历史数据导出到本地储存，以便后续查询。
 */
export interface Api4eb4Request {
  /** 账号appid【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前页码，默认为1 */
  page?: string;
  /** 每页显示的数据条数，默认每页显示1000条数据 */
  pageSize?: string;
  /** 查询开始时间，为13位毫秒级时间戳。<span style="color:red">留意，除非 currentDay 参数非空，否则 startTime 和 endTime 是必传参数。</span> */
  startTime?: string;
  /** 查询结束时间，13位毫秒级时间戳。<span style="color:red">留意，除非 currentDay 参数非空，否则 startTime 和 endTime 是必传参数。</span> */
  endTime?: string;
  /** 查询日期，格式：yyyy-MM-dd */
  currentDay?: string;
  /** 观看用户ID，默认查询全部 */
  param1?: string;
  /** 观看用户昵称，默认查询全部 */
  param2?: string;
  /** 观看日志类型，默认查询全部<br/>vod：观看回放<br/>live：直播 */
  param3?: string;
  /** 直播点播日志类型，默认为live<br/>vod：查询点播列表观看数据<br/>live：查询直播或回放列表观看数据 */
  viewLogType?: string;
  /** 场次ID, 多个场次使用,分隔 */
  sessionIds?: string;
}
/**
 * 1、分页获取频道的直播观看日志
2、接口URL中的{channelId}为频道号
3、接口支持https协议
4、直播观看详情数据支持查询最近3年内的历史数据，建议将历史数据导出到本地储存，以便后续查询。
 */
export interface Api4eb4Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为直播观看日志有关信息 【详见[Data参数描述](/live/api/channel/viewdata/viewlog_page.md?id=polyv1)】，请求失败时为空 */
  data?: Record<string, unknown>;
}
/**
 * 1、分页获取账号下所有频道观看详情数据
2、接口支持https协议
3、直播观看详情数据支持查询最近3年内的历史数据，建议将历史数据导出到本地储存，以便后续查询。
 */
export interface Api6fc0Request {
  /** 账号appid【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 查询开始时间，格式:yyyy-MM-dd HH:mm:ss */
  startDate: string;
  /** 查询结束时间，格式:yyyy-MM-dd HH:mm:ss */
  endDate: string;
  /** 频道ID，不传查询所有频道 */
  channelId?: string;
  /** 观看类型，<br/>live：直播，<br/>vod：回放 */
  watchType?: string;
  /** 当前页码，默认为1 */
  page?: string;
  /** 每页显示的数据条数，默认每页显示1000条数据 */
  pageSize?: string;
}
/**
 * 1、分页获取账号下所有频道观看详情数据
2、接口支持https协议
3、直播观看详情数据支持查询最近3年内的历史数据，建议将历史数据导出到本地储存，以便后续查询。
 */
export interface Api6fc0Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为直播观看日志有关信息 【详见[Data参数描述](#Data参数描述)】，请求失败时为空 */
  data?: Record<string, unknown>;
}
/**
 * Data nested object
 */
export interface Data {
  /** 每页显示的数据条数，默认每页显示1000条数据 */
  pageSize?: number;
  /** 当前的页数 */
  pageNumber?: number;
  /** 总的条数 */
  totalItems?: number;
  /** 查询的结果列表【详见[Contents参数描述](#Contents参数描述)】 */
  contents?: unknown;
  /** 当前页第一条记录在总结果集中的位置 */
  startRow?: number;
  /** 是否为第一页，值为：true/false */
  firstPage?: boolean;
  /** 是否为最后一页，值为：true/false */
  lastPage?: boolean;
  /** 上一页编号 */
  prePageNumber?: number;
  /** 下一页编号 */
  nextPageNumber?: number;
  /** 每页数量大小 */
  limit?: number;
  /** 总页数 */
  totalPages?: number;
  /** 当前页最后一条记录在总结果集中的位置 */
  endRow?: number;
  /** 分页起始记录 */
  offset?: number;
}
/**
 * Contents nested object
 */
export interface Contents {
  /** 表示此次播放动作的ID */
  playId?: string;
  /** 直播账号Id */
  userId?: string;
  /** 频道号 */
  channelId?: string;
  /** 播放时长，单位：秒 */
  playDuration?: number;
  /** 停留时长，单位：秒 */
  stayDuration?: number;
  /** 直播场次ID */
  sessionId?: string;
  /** 使用POLYV观看页的观众ID */
  param1?: string;
  /** 使用POLYV观看页的观众昵称 */
  param2?: string;
  /** 观看日志类型，默认为live<br/>vod：观看回放<br/>live：直播 */
  param3?: string;
  /** POLYV系统参数 */
  param4?: string;
  /** POLYV系统参数 */
  param5?: string;
  /** IP地址 */
  ipAddress?: string;
  /** 国家 */
  country?: string;
  /** 省份 */
  province?: string;
  /** 城市 */
  city?: string;
  /** ISP运营商 */
  isp?: string;
  /** 播放视频页面地址 */
  referer?: string;
  /** 用户设备 */
  userAgent?: string;
  /** 操作系统 */
  operatingSystem?: string;
  /** 浏览器 */
  browser?: string;
  /** 是否为移动端 */
  isMobile?: string;
  /** 查询日期，格式：yyyy-MM-dd */
  currentDay?: string;
  /** 日志创建日期，13位毫秒级时间戳 */
  createdTime?: number;
  /** 日志更新日期，13位毫秒级时间戳 */
  lastModified?: number;
  /** 0 或者不传：普通直播<br>1：超低延迟直播 rts （已经没有在使用）<br>2：PRTC直播（无延迟） */
  ptype?: number;
  /** 进入页面时间，13位毫秒级时间戳，部分情况返回为null，非特殊说明，请使用createdTime替代 */
  firstActiveTime?: number;
  /** 退出页面时间，13位毫秒级时间戳，部分情况返回为null，非特殊说明，请使用createdTime+stayDuration替代 */
  lastActiveTime?: number;
}
/**
 * 1、通过频道号，修改播放器的暖场图片
2、接口支持https协议
3、接口URL中的{channelId}为"频道号"
4、暖场视频和暖场图片是处于非直播状态时，播放器显示的画面，两者在同一时间只能显示一种，以最晚设置者为准
5、若想删除暖场画面，则将coverImage或warmUpFlv的值设为"http://"
 */
export interface Api2ff4Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 暖场图片地址，图片大小建议：800x450，支持PNG、JPEG、GIF格式 */
  coverImage: string;
  /** 暖场图片跳转地址 */
  coverHref?: string;
}
/**
 * 1、通过频道号，修改播放器的暖场图片
2、接口支持https协议
3、接口URL中的{channelId}为"频道号"
4、暖场视频和暖场图片是处于非直播状态时，播放器显示的画面，两者在同一时间只能显示一种，以最晚设置者为准
5、若想删除暖场画面，则将coverImage或warmUpFlv的值设为"http://"
 */
export interface Api2ff4Response {
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
 * 1、通过频道号，修改暖场开关
2、接口支持https协议
 */
export interface Api1ce4Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 开关值<br>Y：开启<br>N：关闭 */
  warmUpEnabled: string;
}
/**
 * 1、通过频道号，修改暖场开关
2、接口支持https协议
 */
export interface Api1ce4Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为"success" */
  data?: string;
}
/**
 * 1、通过频道号，修改播放器的暖场视频
2、接口支持https协议
3、接口URL中的{channelId}为"频道号"
4、暖场视频和暖场图片是处于非直播状态时，播放器显示的画面，两者在同一时间只能显示一种，以最晚设置者为准
5、若想删除暖场画面，则将coverImage或warmUpFlv的值设为"http://"
 */
export interface Api2ffaRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 暖场视频地址，移动端不支持FLV视频文件，建议使用MP4视频文件 */
  warmUpFlv: string;
}
/**
 * 1、通过频道号，修改播放器的暖场视频
2、接口支持https协议
3、接口URL中的{channelId}为"频道号"
4、暖场视频和暖场图片是处于非直播状态时，播放器显示的画面，两者在同一时间只能显示一种，以最晚设置者为准
5、若想删除暖场画面，则将coverImage或warmUpFlv的值设为"http://"
 */
export interface Api2ffaResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为true */
  data?: string;
}
