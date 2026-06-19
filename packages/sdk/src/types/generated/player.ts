/**
 * player API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module player by scripts/generate-types.ts
 *
 * Last updated: 2026-06-19T06:33:52.930Z
 */

/**
 * 1、通过频道号，设置频道内容保护（防录屏信息）
2、接口支持https协议
 */
export interface Api3b29Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 内容保护开关，默认为开启<br/>Y：开启<br/>N：关闭 */
  enable?: string;
  /** 内容保护方式<br/>marquee：跑马灯<br/>watermark：水印 */
  antiRecordType: string;
  /** 内容保护类型，水印方式时设置自定义URL无效<br/>fixed：固定值<br/>nickname：登录用户名<br/>diyurl：URL自定义跑马灯 */
  modelType: string;
  /** 固定值时为设置内容<br/>URL自定义设置时为网址，需要携带 http:// 或 https:// 【[自定义跑马灯参考文档](/live/api/player/marquee_url_instruction)】<br/>内容保护类型为登录用户名时可不传 */
  content: string;
  /** 字体大小<br/>内容保护方式为跑马灯时：设置数值，范围1-256<br/>内容保护方式为水印时：<br/>small：小<br/>middle：中<br/>large：大 */
  fontSize: string;
  /** 透明度，不传默认为80，范围0-100 */
  opacity?: number;
  /** 跑马灯字体颜色，色值，例如：#FFFFFF */
  fontColor?: string;
  /** 跑马灯自定义缩放，默认为关闭<br/>Y：开启<br/>N：关闭 */
  autoZoomEnabled?: string;
  /** 双跑马灯，默认为关闭<br/>Y：开启<br/>N：关闭 */
  doubleEnabled?: string;
  /** 跑马灯显示方式，默认为滚动<br/>roll：滚动<br/>flicker：闪烁 */
  showMode?: string;
}
/**
 * 1、通过频道号，设置频道内容保护（防录屏信息）
2、接口支持https协议
 */
export interface Api3b29Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为"SUCCESS" */
  data?: string;
}
/**
 * 1、通过频道号，查询频道内容保护（防录屏信息）
2、接口支持https协议
 */
export interface Api3b29Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号<br/>传入频道号，查询频道内容保护信息<br/>不传频道号，查询账号内容保护默认模板 */
  channelId?: string;
}
/**
 * 1、通过频道号，查询频道内容保护（防录屏信息）
2、接口支持https协议
 */
export interface Api3b29Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回频道内容保护信息【详见[data字段描述](/live/api/player/get_anti_record.md?id=data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过频道号，修改播放器内容保护自定义url跑马灯开关，在开启时需提交url参数
2、接口支持https协议

具体请参考[自定义url跑马灯](/live/api/player/marquee_url_instruction.md)
 */
export interface Api11f1Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 填入"Y"或"N"，自定义url内容保护 */
  marqueeRestrict: string;
  /** 自定义url， 在开关为关时可为空，开启开关时为必填 */
  url: string;
}
/**
 * 1、通过频道号，修改播放器内容保护自定义url跑马灯开关，在开启时需提交url参数
2、接口支持https协议

具体请参考[自定义url跑马灯](/live/api/player/marquee_url_instruction.md)
 */
export interface Api11f1Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为"设置成功" */
  data?: string;
}
/**
 * 1、管理系统设置频道播放器的片头广告：频道管理-观看页设置-营销-广告
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api5cd5Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 设置开关状态<br/>Y：开启<br/>N：关闭 */
  enabled?: string;
  /** 广告类型<br/>NONE：无广告<br/>IMAGE：图片广告<br/>FLV：视频广告 */
  headAdvertType?: string;
  /** 广告地址 */
  headAdvertMediaUrl?: string;
  /** 广告跳转地址 */
  headAdvertHref?: string;
  /** 广告时长，单位秒 */
  headAdvertDuration?: number;
  /** 广告宽度 */
  headAdvertWidth?: number;
  /** 广告高度 */
  headAdvertHeight?: number;
}
/**
 * 1、管理系统设置频道播放器的片头广告：频道管理-观看页设置-营销-广告
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api5cd5Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时返回true，失败时返回空字符串 */
  data?: string;
}
/**
 * 1、管理系统修改播放器logo图片：频道管理-播放器管理-播放器-logo设置
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api6ddbRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** logo图片地址，建议大小为：长方形140x50或正方形50x50 */
  logoImage: string;
  /** Logo不透明度，取值范围为(0,1]，即大于0，并且小于等于1<br/>1：表示完全不透明<br/>0：表示完全透明 */
  logoOpacity: number;
  /** logo显示位置<br>tl：左上角<br>tr：右上角<br>bl：左下角<br>br：右下角 */
  logoPosition: string;
  /** logo图片点击后跳转链接 */
  logoHref?: string;
}
/**
 * 1、管理系统修改播放器logo图片：频道管理-播放器管理-播放器-logo设置
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api6ddbResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时返回true，失败时返回空字符串 */
  data?: string;
}
/**
 * 1、管理系统修改频道播放器的暂停广告：频道管理-观看页设置-营销-广告
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api575aRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 设置开关状态<br/>Y：开启<br/>N：关闭 */
  enabled?: string;
  /** 图片地址，不填代表删除 */
  stopAdvertImage?: string;
  /** 点击图片跳转Url */
  stopAdvertHref?: string;
}
/**
 * 1、管理系统修改频道播放器的暂停广告：频道管理-观看页设置-营销-广告
2、接口URL中的{channelId}为频道号
3、接口支持https协议
 */
export interface Api575aResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时返回true，失败时返回空字符串 */
  data?: string;
}
/**
 * 1、查询投诉反馈
2、支持https协议
 */
export interface Api2ee7Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号，不传则查询用户下的数据 */
  channelId?: string;
  /** 分页页码，默认1 */
  pageNumber?: number;
  /** 分页大小，默认10，最大不超过1000 */
  pageSize?: number;
}
/**
 * 1、查询投诉反馈
2、支持https协议
 */
export interface Api2ee7Response {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
  /** 状态码非200时的错误信息【详见[error字段说明](#error字段说明)】 */
  error?: Record<string, unknown>;
  /** 投诉信息列表【详见[data字段说明](#data字段说明)】 */
  data?: Record<string, unknown>;
}
