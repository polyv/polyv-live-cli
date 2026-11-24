/**
 * ad API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module ad by scripts/generate-types.ts
 */

/**
 * 1、通过分类id为分类下的所有视频创建广告
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface AddAdRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 广告开始日期，格式为：yyyy-MM-dd，例如：2021-04-07 */
  startDate: string;
  /** 广告结束日期，格式为：yyyy-MM-dd，例如：2021-04-10 */
  endDate: string;
  /** 广告标题 */
  title: string;
  /** 广告素材<br>片头、片尾广告支持：JPEG，GIF，PNG，FLV，MP4<br>暂停广告支持：SWF，PNG，JPEG，GIF<br>弹窗广告支持：PNG，JPEG，GIF */
  file: File | Blob;
  /** 广告时长，除请求参数location为暂停广告外，其他广告类型都为必填参数，单位秒 */
  size?: number;
  /** 分类id，多个分类id，以英文逗号分隔，默认值为1，1是默认分类 */
  cataids?: string;
  /** 广告类型，默认为片头<br/>1：片头<br/>2：暂停<br/>3：片尾<br/>4：弹窗 */
  location?: number;
  /** 广告弹窗位置，当请求参数location为弹窗时必填<br/>1：右下角<br/>2：右上角<br/>3：左下角<br/>4：左上角 */
  popLocation?: number;
  /** 弹窗出现的时间，单位秒，当请求参数location为弹窗时必填 */
  popUpTime?: number;
  /** 广告状态，默认为已上线<br/>10：已上线<br/>1：待上线<br/>0：已下线 */
  status?: number;
  /** 广告开始时间，格式为：HH:mm:ss，默认为：00:00:00 */
  upTime?: string;
  /** 广告结束时间，格式为：HH:mm:ss，默认为：23:59:59 */
  offTime?: string;
  /** 广告描述 */
  note?: string;
  /** 是否开启跳过广告，仅当请求参数location为片头广告有效，默认值为N<br>Y：开启<br>N：关闭 */
  skipAd?: string;
  /** 多少秒后允许跳过，当请求参数skipAd为Y时，该字段为必填参数 */
  skipOffset?: string;
  /** 跳过按钮标签描述，默认为跳过 */
  skipButtonLabel?: string;
}
/**
 * 1、通过分类id为分类下的所有视频创建广告
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface AddAdResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回广告id，响应失败时返回空 */
  data?: string;
}
/**
 * 1、通过广告id删除对应广告
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface DeleteAdRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 广告id，该值可以参考【[查询广告列表](/vod/api/ad/get_ad)】获取 */
  adid: string;
}
/**
 * 1、通过广告id删除对应广告
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface DeleteAdResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回true，响应失败时返回空 */
  data?: Record<string, unknown>;
}
/**
 * 1、分页获取广告列表详情
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetAdRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 第几页，默认第一页 */
  page?: string;
  /** 每页显示几条，默认10条 */
  pageSize?: string;
}
/**
 * 1、分页获取广告列表详情
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetAdResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回广告信息【详见[Data字段说明](/vod/api/ad/get_ad.md?id=polyv1)】，响应失败时返回空 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过广告id修改广告设置
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface ModifyAdRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 广告id，该值可以参考【[查询广告列表](/vod/api/ad/get_ad)】获取 */
  adid: string;
  /** 广告开始日期，格式为：yyyy-MM-dd，例如：2021-04-07 */
  startDate?: string;
  /** 广告结束日期，格式为：yyyy-MM-dd，例如：2021-04-10 */
  endDate?: string;
  /** 广告标题 */
  title?: string;
  /** 广告素材<br>片头、片尾广告支持：JPEG，GIF，PNG，FLV，MP4<br>暂停广告支持：SWF，PNG，JPEG，GIF<br>弹窗广告支持：PNG，JPEG，GIF */
  file?: File | Blob;
  /** 广告时长，除请求参数location为暂停广告外，其他广告类型都为必填参数，单位秒 */
  size?: number;
  /** 分类id，关联多分类时，以英文逗号分隔，默认值为1，1是默认分类 */
  cataids?: string;
  /** 广告类型，默认为片头<br>1：片头<br>2：暂停<br>3：片尾<br>4：弹窗 */
  location?: number;
  /** 广告弹窗位置，当请求参数location为弹窗时必填<br>1：右下角<br>2：右上角<br>3：左下角<br>4：左上角 */
  popLocation?: number;
  /** 弹窗出现的时间，单位秒，当请求参数location为弹窗时必填 */
  popUpTime?: number;
  /** 广告状态，默认为已上线<br>10：已上线<br>1：待上线<br>0：已下线 */
  status?: number;
  /** 广告开始时间，格式为：HH:mm:ss，默认为：00:00:00 */
  upTime?: string;
  /** 广告结束时间，格式为：HH:mm:ss，默认为：23:59:59 */
  offTime?: string;
  /** 广告描述 */
  note?: string;
  /** 是否开启跳过广告，仅当请求参数location为片头广告有效，默认值为N<br>Y：开启<br>N：关闭 */
  skipAd?: string;
  /** 多少秒后允许跳过，当请求参数skipAd为Y时，该字段为必填参数 */
  skipOffset?: string;
  /** 跳过按钮标签，默认为跳过 */
  skipButtonLabel?: string;
}
/**
 * 1、通过广告id修改广告设置
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface ModifyAdResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回true，响应失败时返回空 */
  data?: Record<string, unknown>;
}
