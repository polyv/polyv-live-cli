/**
 * web API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module web by scripts/generate-types.ts
 *
 * Last updated: 2026-06-19T06:33:53.018Z
 */

/**
 * 1、接口用于获取倒计时设置的相关信息
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api1b5eRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、接口用于获取倒计时设置的相关信息
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api1b5eResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为频道直播倒计时信息【详见[Data参数描述](/live/api/web/info/get_countdown.md?id=polyv1)】，请求失败时为空 */
  data?: Record<string, unknown>;
}
/**
 * 1、接口用于获取用户频道号引导图开关的状态，以及具体引导图的url
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api1706Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、接口用于获取用户频道号引导图开关的状态，以及具体引导图的url
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api1706Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为直播引导图开关状态及URL【详见[Data参数描述](/live/api/web/info/getsplash.md?id=polyv1)】，请求失败时为空 */
  data?: Record<string, unknown>;
}
/**
 * 1、接口用于获取一个或者多个频道点赞数和观看热度
2、接口支持https协议
 */
export interface Api5a57Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 用逗号隔开的频道号，如：10000,100001 最多20个 */
  channelIds: string;
}
/**
 * 1、接口用于获取一个或者多个频道点赞数和观看热度
2、接口支持https协议
 */
export interface Api5a57Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为频道点赞和观看次数信息【详见[Data参数描述](/live/api/web/info/live_likes.md?id=polyv1)】，请求失败时为空 */
  data?: unknown;
}
/**
 * 1、接口用于修改频道的倒计时设置
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Apic28eRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 预约观看开关，Y或N，默认不改变原来状态<br>Y：开启<br>N：关闭 */
  bookingEnabled?: string;
  /** 直播开始时间，如果不传该值，表示不显示直播时间和倒计时，格式：yyyy-MM-dd HH:mm:ss */
  startTime?: string;
}
/**
 * 1、接口用于修改频道的倒计时设置
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Apic28eResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为空，请求失败时为空 */
  data?: string;
}
/**
 * 1、设置单个或者所有频道的主持人姓名
2、接口URL中的{userId}为直播账号ID
3、接口支持https协议
 */
export interface Api6daeRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 主持人姓名，不超过50个字符 */
  publisher: string;
  /** 频道号，<span class="error">不提交或者传-1则修改该用户的所有频道号的主持人姓名</span> */
  channelId?: string;
}
/**
 * 1、设置单个或者所有频道的主持人姓名
2、接口URL中的{userId}为直播账号ID
3、接口支持https协议
 */
export interface Api6daeResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时，返回值是设置的频道号，请求失败时，返回值是空 */
  data?: string;
}
/**
 * 1、接口用于设置引导页开关以及引导图
2、接口URL中的{channelId}为频道号
3、（splashEnabled, timestamp, appId）参与sign签名，并和sign一起通过post表单传递，文件通过二进制流提交到服务器端。
4、接口支持https协议
 */
export interface Api1706Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 设置开启或关闭引导页<br>Y：开启<br>N：关闭 */
  splashEnabled: string;
  /** 支持jpg、jpeg、png三种格式，大小不能超过4Mb */
  imgfile?: File | Blob;
}
/**
 * 1、接口用于设置引导页开关以及引导图
2、接口URL中的{channelId}为频道号
3、（splashEnabled, timestamp, appId）参与sign签名，并和sign一起通过post表单传递，文件通过二进制流提交到服务器端。
4、接口支持https协议
 */
export interface Api1706Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时，如果上传图片则为图片url，无上传图片则为"success"，请求失败时返回空字符串 */
  data?: string;
}
/**
 * 1、设置频道的点赞数和观看热度
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api5a57Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 点赞数 */
  likes?: number;
  /** 观看热度（对应观看次数） */
  viewers?: number;
}
/**
 * 1、设置频道的点赞数和观看热度
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api5a57Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为success，请求错误时为空 */
  data?: string;
}
/**
 * 1、设置频道图标
2、接口URL中的{channelId}为频道号
3、建议直接上传分辨率为128X128的图片
4、（timestamp, appId）参与sign签名，并和sign一起通过post表单传递，文件通过二进制流提交到服务器端。
5、接口支持https协议
 */
export interface Api4783Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 图片为大小为2MB的JPG、JPEG、PNG图片 */
  imgfile: File | Blob;
}
/**
 * 1、设置频道图标
2、接口URL中的{channelId}为频道号
3、建议直接上传分辨率为128X128的图片
4、（timestamp, appId）参与sign签名，并和sign一起通过post表单传递，文件通过二进制流提交到服务器端。
5、接口支持https协议
 */
export interface Api4783Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时，返回值是上传成功后的图片地址，请求失败时，返回值是空 */
  data?: string;
}
/**
 * 1、设置频道名称
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
  /** 修改后的频道名称 */
  name: string;
}
/**
 * 1、设置频道名称
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
  /** 请求成功时，返回值是true，请求失败时，返回值是空 */
  data?: string;
}
/**
 * 1、添加一个频道菜单
2、接口支持https协议
 */
export interface Apic008Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 菜单名称 */
  name: string;
  /** 菜单类型 <br />desc：直播介绍 <br />chat：互动聊天 <br />quiz：咨询提问 <br />text：图文菜单 <br />iframe：推广外链<br />qa：问答<br />buy：商品列表<br />invite：邀请榜 */
  _type: string;
  /** 菜单内容<br />当菜单类型为直播介绍、图文菜单时，该值为菜单的内容。<br />当菜单类型为外链推广时，如果链接类型是通用链接, 该值为外链链接地址, 如果链接类型是多平台链接, 该值是json对象字符串, json对象的属性如下表说明。 <br />当菜单类型为互动聊天、咨询提问时，该值不需要传值，默认为null */
  content?: string;
  /** 菜单语言类型，不传该参数默认为中文<br />zh_CN：中文<br />EN：英文 */
  lang?: string;
  /** 打开方式（currentPage 当前页  menuDisplay 菜单显示  newPage 新页面）(次参数针对菜单类型为外链推广时有效) */
  iframeOpenType?: string;
  /** 外链推广菜单链接类型（10:通用链接,11:多平台链接，默认10）(次参数针对菜单类型为外链推广时有效) */
  linkType?: number;
}
/**
 * 1、添加一个频道菜单
2、接口支持https协议
 */
export interface Apic008Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功时为菜单详细数据 【详见[data字段说明](/live/api/web/menu/add_menu.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、查询频道页面菜单信息
2、接口支持https协议
 */
export interface Api141cRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 菜单语言类型，默认为中文<br />zh_CN：中文<br />EN：英文 */
  lang?: string;
}
/**
 * 1、查询频道页面菜单信息
2、接口支持https协议
 */
export interface Api141cResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功时为菜单列表详细数据 【详见[data字段说明](/live/api/web/menu/channel_menu_list.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、删除频道菜单
2、接口支持https协议
 */
export interface Api4788Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 菜单id，指定多个时用英文逗号分隔 【该参数获取自[查询频道页面菜单信息](/live/api/web/menu/channel_menu_list.md)】 */
  menuIds: string;
  /** 菜单语言类型，默认为中文<br />zh_CN：中文<br />EN：英文 */
  lang?: string;
}
/**
 * 1、删除频道菜单
2、接口支持https协议
 */
export interface Api4788Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功时为1，错误时为空 */
  data?: string;
}
/**
 * 1、设置自定义菜单中用户设置菜单的直播介绍
2、接口URL中的{userId}为直播账号ID
3、接口URL中的{channelId}为频道号
4、接口支持https协议
 */
export interface Api5356Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 直播介绍的内容（此处可以填html页面的相关内容，如增加图片、增加文字样式等） */
  content: string;
  /** 菜单类型，目前仅支持取值为desc */
  menuType: string;
}
/**
 * 1、设置自定义菜单中用户设置菜单的直播介绍
2、接口URL中的{userId}为直播账号ID
3、接口URL中的{channelId}为频道号
4、接口支持https协议
 */
export interface Api5356Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功时为success，错误时为空 */
  data?: string;
}
/**
 * 1、查询频道图文直播内容
2、接口支持https协议
 */
export interface Api71a8Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 图文内容的序列号：为空表示获取第一页数据，且同时会返回置顶数据。非空表示获取 id 比该值小的记录（也就是更早发布的内容），此时不返回置顶列表。 */
  id?: number;
  /** 是否为图片模式，默认为N<br/>Y：图片模式<br/>N：文字加图片的模式 */
  imageMode?: string;
}
/**
 * 1、查询频道图文直播内容
2、接口支持https协议
 */
export interface Api71a8Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功响应时为回放详情分页数据 【详见[data字段说明](/live/api/web/menu/tuwen_list.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、修改页面菜单信息
2、接口支持https协议
 */
export interface Api4545Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 菜单id（互动聊天或咨询提问的菜单id不允许设置）【该参数获取自[查询频道页面菜单信息](/live/api/web/menu/channel_menu_list.md)】 */
  menuId: string;
  /** 菜单的内容 */
  content: string;
  /** 菜单语言类型，默认为中文<br />zh_CN：中文<br />EN：英文 */
  lang?: string;
  /** 打开方式（currentPage 当前页  menuDisplay 菜单显示  newPage 新页面）(次参数针对菜单类型为外链推广时有效) */
  iframeOpenType?: string;
  /** 外链推广菜单链接类型（10:通用链接,11:多平台链接，默认10）(次参数针对菜单类型为外链推广时有效) */
  linkType?: number;
}
/**
 * 1、修改页面菜单信息
2、接口支持https协议
 */
export interface Api4545Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功时为success，错误时为空 */
  data?: string;
}
/**
 * 1、开启或关闭咨询提问功能开关
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api4503Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 咨询提问开关<br/>Y：开启<br/>N：关闭 */
  enabled: string;
}
/**
 * 1、开启或关闭咨询提问功能开关
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api4503Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功和失败都为空 */
  data?: Record<string, unknown>;
}
/**
 * 1、设置直播频道菜单的顺序
2、接口支持https协议
 */
export interface Api4542Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 频道菜单ID列表，必须是完整的列表（不能多也不能少），表示按该顺序排列菜单【该参数获取自[查询频道页面菜单信息](/live/api/web/menu/channel_menu_list.md)】 */
  menuIds: string;
  /** 菜单语言类型，默认为中文<br />zh_CN：中文<br />EN：英文 */
  lang?: string;
}
/**
 * 1、设置直播频道菜单的顺序
2、接口支持https协议
 */
export interface Api4542Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功时为success，错误时为空 */
  data?: string;
}
/**
 * 1、获取全局或当前生效的打赏设置
2、接口支持https协议
 */
export interface Api78adRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号，不传为获取全局设置，否则为当前生效设置 */
  channelId?: string;
}
/**
 * 1、获取全局或当前生效的打赏设置
2、接口支持https协议
 */
export interface Api78adResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 打赏设置的详细信息 【详见[data字段说明](/live/api/web/page_interaction/donate_get.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、查询频道微信分享信息
2、接口支持https协议
 */
export interface Api294dRequest {
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
 * 1、查询频道微信分享信息
2、接口支持https协议
 */
export interface Api294dResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功时为微信分享的详细信息，错误时为空 【详见[data字段说明](/live/api/web/page_interaction/get_weixin_share.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、设置频道或者全局现金打赏（带上频道号为设置频道现金打赏，不带频道号默认为全局现金打赏设置）
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api36c6Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号，不传为全局设置 */
  channelId?: string;
}
/**
 * 1、设置频道或者全局现金打赏（带上频道号为设置频道现金打赏，不带频道号默认为全局现金打赏设置）
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api36c6Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功时为true，错误时为空 */
  data?: string;
}
/**
 * 1、设置礼物打赏-现金支付礼物（旧版后台为：道具打赏）
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api38d6Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号，不传为修改通用设置（旧版后台通用设置） */
  channelId?: string;
}
/**
 * 1、设置礼物打赏-现金支付礼物（旧版后台为：道具打赏）
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api38d6Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功时为true，错误时为空 */
  data?: string;
}
/**
 * 1、修改频道的微信分享相关设置
2、接口支持https协议
 */
export interface Api294dRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 微信分享的标题（30字符内），默认为：频道标题 */
  weixinShareTitle?: string;
  /** 微信分享的描述（120字符内），默认为：正在直播，非常不错喔！快来看看吧! */
  weixinShareDesc?: string;
}
/**
 * 1、修改频道的微信分享相关设置
2、接口支持https协议
 */
export interface Api294dResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功时为success，错误时为空 */
  data?: string;
}
/**
 * 1、接口用于设置〔是否应用通用设置〕，包括的功能有打赏设置，广告设置，观看条件设置，跑马灯，功能开关，播放限制，观看页的皮肤设置
2、接口支持https协议
 */
export interface Api2c72Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 功能类型【详见[GlobalEnabledType参数描述](/live/api/web/setting/update_global_enabled.md?id=polyv1)】 */
  globalEnabledType: string;
  /** 功能开关，Y或N<br>Y：应用通用设置<br>N：不应用通用设置 */
  enabled: string;
}
/**
 * 1、接口用于设置〔是否应用通用设置〕，包括的功能有打赏设置，广告设置，观看条件设置，跑马灯，功能开关，播放限制，观看页的皮肤设置
2、接口支持https协议
 */
export interface Api2c72Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时，返回值是true，请求失败时，返回值是空 */
  data?: string;
}
/**
 * 1、接口用于上传图片素材，同时获取图片地址
2、（type, timestamp, appId）参与sign签名，并和sign一起通过post表单传递，文件通过二进制流提交到服务器端。
2、接口支持https协议
 */
export interface Api3d3fRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 图片文件，支持同时上传不超过6个 */
  file: File | Blob;
  /** 上传图片类型【详见[Type参数描述](/live/api/web/setting/uploadimage.md?id=polyv1)】 */
  _type: string;
}
/**
 * 1、接口用于上传图片素材，同时获取图片地址
2、（type, timestamp, appId）参与sign签名，并和sign一起通过post表单传递，文件通过二进制流提交到服务器端。
2、接口支持https协议
 */
export interface Api3d3fResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时，返回值是图片url列表，请求失败时，返回值是空 */
  data?: unknown;
}
/**
 * 1、接口用于添加单个观看白名单
2、接口支持https协议
 */
export interface Api3dd1Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 主要观看条件为1，次要观看条件为2 */
  rank: number;
  /** 会员码（最多为50个字符） */
  code: string;
  /** 昵称（最多为50个字符） */
  name?: string;
  /** 频道号（传频道号则添加频道观看白名单，不传频道号则添加全局观看白名单-仅旧版后台通用设置生效） */
  channelId?: string;
}
/**
 * 1、接口用于添加单个观看白名单
2、接口支持https协议
 */
export interface Api3dd1Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为success，请求失败时为空 */
  data?: string;
}
/**
 * 1、用于删除指定观看白名单（支持一键清空）
2、接口支持https协议
 */
export interface Api56adRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 主要观看条件为1，次要观看条件为2 */
  rank: number;
  /** 是否一键清空白名单<br>Y：清空白名单<br>N：根据请求参数code清除白名单 */
  isClear: string;
  /** 频道号（传频道号则删除频道观看白名单，不传频道号则删除全局观看白名单-仅旧版后台通用设置生效） */
  channelId?: string;
  /** 会员码（请求参数isClear 为N时为必传参数） */
  code?: string;
}
/**
 * 1、用于删除指定观看白名单（支持一键清空）
2、接口支持https协议
 */
export interface Api56adResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为success，请求失败时为空 */
  data?: string;
}
/**
 * 1、下载频道的登记观看列表，包含登记观看记录字段和数据内容
2、接口支持https协议
 */
export interface Api312cRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 1为首要条件，2为次要条件。影响导出的表格表头 */
  rank: number;
}
/**
 * 1、下载全局或频道的观看条件白名单列表
2、接口支持https协议
 */
export interface Api106cRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 1为首要条件，2为次要条件。 */
  rank: number;
  /** 频道号，不传为全局下载 */
  channelId?: string;
}
/**
 * 1、查询报名观看记录
2、接口支持https协议
 */
export interface Api3559Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 观众id列表用逗号隔开，上限20个 */
  viewerIds?: string;
}
/**
 * 1、查询报名观看记录
2、接口支持https协议
 */
export interface Api3559Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回报名观看记录【详见[data字段描述](/live/api/web/watch_condition/enroll_list.md?id=data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、获取频道或全局的登记观看字段
2、接口支持https协议
 */
export interface Api61dcRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 主要观看条件为1，次要观看条件为2 */
  rank: number;
  /** 频道号，不传为全局获取 */
  channelId?: string;
}
/**
 * 1、获取频道或全局的登记观看字段
2、接口支持https协议
 */
export interface Api61dcResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功为数据内容，错误为空串 【详见[data字段说明](/live/api/web/watch_condition/get_record_field.md?id=data字段说明)】 */
  data?: unknown;
}
/**
 * 1、获取频道的登记观看列表数据内容
2、接口支持https协议
 */
export interface Api4fc8Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 登记开始时间，仅查询晚于该时间的记录，13位毫秒级时间戳，为空则不限制 */
  startTime?: number;
  /** 登记结束时间，仅查询早于该时间的记录，13位毫秒级时间戳，为空则不限制 */
  endTime?: number;
  /** 要获取的页码，默认为1 */
  page?: number;
  /** 每页数据量，默认为10 */
  pageSize?: number;
}
/**
 * 1、获取频道的登记观看列表数据内容
2、接口支持https协议
 */
export interface Api4fc8Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 分页的登记观看列表数据 【详见[data字段说明](/live/api/web/watch_condition/get_record_info.md?id=data字段说明)】 */
  data?: unknown;
}
/**
 * 1、查询频道观看条件
2、接口支持https协议
 */
export interface Api75bdRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号，不传为全局查看 */
  channelId?: string;
}
/**
 * 1、查询频道观看条件
2、接口支持https协议
 */
export interface Api75bdResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功为数据内容，错误为空串 【详见[data字段说明](/live/api/web/watch_condition/get_watch_condition.md?id=data字段说明)】 */
  data?: unknown;
}
/**
 * 1、获取全局或频道的观看条件白名单列表
2、接口支持https协议
 */
export interface Api56adRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 1为首要条件，2为次要条件 */
  rank: number;
  /** 频道号，不传为获取全局设置 */
  channelId?: string;
  /** 要获取的页码，默认为1 */
  page?: number;
  /** 每页数据量，默认为10 */
  pageSize?: number;
  /** 关键词，可根据会员码和名称查询 */
  keyword?: string;
}
/**
 * 1、获取全局或频道的观看条件白名单列表
2、接口支持https协议
 */
export interface Api56adResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 分页的白名单列表数据 【详见[data字段说明](/live/api/web/watch_condition/get_white_list.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
export interface Api209aRequest {
  /** 用户昵称，作为登录后聊天昵称使用，**中文需URL编码**。 */
  name: string;
  /** 校验字符串。后台设置为无限制时，忽略该参数。后台设置为验证码观看时，该字段传入观看验证码，若不传入该参数，则跳转到用户引导页 */
  password?: string;
}
/**
 * 1、设置频道的观看条件
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api406aRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 观看条件类型，目前固定取值为“none” */
  authType: string;
}
/**
 * 1、设置频道的观看条件
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api406aResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功时返回修改成功，失败时返回空 */
  data?: string;
}
/**
 * 1、修改频道自定义授权设置
2、接口URL中的{userId}为直播账号ID
3、接口支持https协议
 */
export interface Api2004Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 自定义授权地址 */
  customUri: string;
  /** 要设置的频道号，<span class="error">不提交或者传0则设置所有频道</span> */
  channelId?: string;
}
/**
 * 1、修改频道自定义授权设置
2、接口URL中的{userId}为直播账号ID
3、接口支持https协议
 */
export interface Api2004Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功时为授权信息，失败时为空字符串 【详见[data字段说明](/live/api/web/watch_condition/set_authorized_address.md?id=data字段说明)】 */
  data?: unknown;
}
/**
 * 1、设置直播外部授权
2、接口URL中的{userId}为直播账号ID
3、接口支持https协议
 */
export interface Api5ed3Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 获取用户信息接口地址 */
  externalUri: string;
  /** 频道号，提交后对某频道号设置，<span class="error">不提交或者传0则对账号下所有频道号进行设置</span> */
  channelId?: string;
}
/**
 * 1、设置直播外部授权
2、接口URL中的{userId}为直播账号ID
3、接口支持https协议
 */
export interface Api5ed3Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功时为授权信息，失败时为空字符串 【详见[data字段说明](/live/api/web/watch_condition/set_externalauth.md?id=data字段说明)】 */
  data?: unknown;
}
/**
 * 1、修改频道或通用设置的观看条件（旧版直播后台-通用设置-观看条件）
2、主要观看条件为关闭时，次要观看条件不能为打开，否则返回参数错误
3、主要观看条件和次要观看条件为相同时，不能够同时打开，否则返回参数错误
4、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
5、接口支持https协议
 */
export interface Api75bdRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号，不传为通用设置 */
  channelId?: string;
}
/**
 * 1、修改频道或通用设置的观看条件（旧版直播后台-通用设置-观看条件）
2、主要观看条件为关闭时，次要观看条件不能为打开，否则返回参数错误
3、主要观看条件和次要观看条件为相同时，不能够同时打开，否则返回参数错误
4、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
5、接口支持https协议
 */
export interface Api75bdResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功时为true，错误时为空 */
  data?: string;
}
/**
 * 1、设置频道和全局播放限制的授权认证URL，通过是否传channelId进行频道和全局区分
2、接口支持https协议
 */
export interface Api2ce3Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号，不传为全局设置 */
  channelId?: string;
  /** 授权认证url，为空时清除设置 */
  url?: string;
}
/**
 * 1、设置频道和全局播放限制的授权认证URL，通过是否传channelId进行频道和全局区分
2、接口支持https协议
 */
export interface Api2ce3Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回null，失败时返回空 */
  data?: string;
}
/**
 * 1、用于更新观看白名单信息
2、接口支持https协议
 */
export interface Api5352Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 主要观看条件为1，次要观看条件为2 */
  rank: number;
  /** 旧会员码 */
  oldCode: string;
  /** 会员码（最多为50个字符） */
  code: string;
  /** 昵称（最多为50个字符） */
  name?: string;
  /** 频道号（传频道号则添加频道观看白名单，不传频道号则添加全局观看白名单-仅旧版后台通用设置生效） */
  channelId?: string;
}
/**
 * 1、用于更新观看白名单信息
2、接口支持https协议
 */
export interface Api5352Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时为success，请求失败时为空 */
  data?: string;
}
/**
 * 1、设置频道或全局观看条件中的白名单列表
2、（channelId, rank, timestamp, appId）参与sign签名，并和sign一起通过post表单传递，文件通过二进制流提交到服务器端。
3、接口支持https协议
 */
export interface Api77e8Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号，不传为全局设置-仅旧版后台通用设置生效 */
  channelId?: string;
  /** 1为首要条件，2为次要条件。影响导出的表格表头 */
  rank: number;
  /** 白名单文件（<a href="/live/api/web/watch_condition/file/WhiteListTemplate.xls" target="_blank">点击下载白名单模板</a>） */
  file: File | Blob;
}
/**
 * 1、设置频道或全局观看条件中的白名单列表
2、（channelId, rank, timestamp, appId）参与sign签名，并和sign一起通过post表单传递，文件通过二进制流提交到服务器端。
3、接口支持https协议
 */
export interface Api77e8Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功时为true，错误时为空 */
  data?: string;
}
