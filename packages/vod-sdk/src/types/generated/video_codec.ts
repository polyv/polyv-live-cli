/**
 * video_codec API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module video_codec by scripts/generate-types.ts
 */

/**
 * 1、通过视频id合并视频
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface CombineVideoRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，多个用英文逗号隔开，支持合并上限为50个，但合并的视频时长不能超过5个小时。 */
  vids: string;
  /** 视频标题，默认为“合并-”+第一个视频的标题。标题长度超过128会被截取 */
  title?: string;
  /** 分类id，不传为默认分类，分类id通过【[获取分类及子类](/vod/api/video_management/category/get_categories)】接口获取 */
  cataId?: number;
  /** 是否开启录屏优化，默认为关闭 <br/>1：表示开启<br/>0：表示关闭 */
  luping?: number;
}
/**
 * 1、通过视频id合并视频
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface CombineVideoResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回合并后的视频信息【详见[data字段说明](/vod/api/video_codec/clip/combine_video.md?id=polyv1)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过视频id裁剪视频
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface CropVideoRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id */
  vid: string;
  /** 裁剪后的视频名称 */
  title: string;
  /** 特定时间段【详见[timeFrame字段说明](/vod/api/video_codec/clip/crop_video.md?id=polyv1)】，格式为json数组对象，例：`[{"start":1,"end":6},{"start":10,"end":16}]` 时间段数量不能超过5个，每个片段开始时间不能大于结束时间，开始与结束时间间隔大于或等于5秒，结束时间不能超过视频的播放时长 */
  timeFrame: string;
  start?: unknown;
  end?: unknown;
}
/**
 * 1、通过视频id裁剪视频
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface CropVideoResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回新的视频id，失败时返回空字符串 */
  data?: string;
}
/**
 * 1、通过任务id获取截图任务的状态
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetSnapshotTaskStatusRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 任务id【可通过[在视频指定时间点截图](/vod/api/video_codec/snapshot/snapshot_at_specific_time)获取】 */
  taskId: string;
}
/**
 * 1、通过任务id获取截图任务的状态
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetSnapshotTaskStatusResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 截图任务详细状态【详见[data字段说明](/vod/api/video_codec/snapshot/get_snapshot_task_status.md?id=data参数描述)】 */
  data?: Record<string, unknown>;
}
/**
 * data nested object
 */
export interface GetSnapshotTaskStatusData {
  /** 任务id */
  taskId?: number;
  /** 保利威点播账户id，可以参考【[获取密匙](/vod/api/getSecretKey)】获取，获取路径：官网->登录->点播（API接口） */
  userId?: string;
  /** 视频id */
  vid?: string;
  /** 任务状态<br/>waiting：等待截图<br/>processing：截图处理中<br/>success：任务成功<br/>fail：任务失败 */
  status?: string;
  /** 任务创建时间，13位毫秒级时间戳 */
  createTime?: number;
  /** 开始截图的时间，13位毫秒级时间戳，任务未开始为0 */
  beginProcessTime?: number;
  /** 完成截图的时间，13位毫秒级时间戳，任务未完成为0 */
  finishProcessTime?: number;
  /** 截图信息数组，任务失败或未开始时为空数组【详见[snapshots参数描述](/vod/api/video_codec/snapshot/get_snapshot_task_status.md?id=snapshots参数描述)】 */
  snapshots?: unknown;
}
/**
 * snapshots nested object
 */
export interface GetSnapshotTaskStatusSnapshots {
  /** 截图时间点 */
  offsetTime?: number;
  /** 截图的url地址 */
  imageUrl?: string;
}
/**
 * 1、通过视频id添加单个视频指定时间点截图任务
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface SnapshotAtSpecificTimeRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id */
  vid: string;
  /** 截图时间点，每个任务最多20个，多个时间点以英文逗号分隔，如：5,10,15,20 */
  offsetTimes: string;
  /** 截图的宽度，默认为原视频宽 */
  width?: string;
  /** 截图的高度，默认为原视频高 */
  height?: string;
  /** 截图完成后的回调地址，截图任务完成会通过post请求发送结果信息到回调地址【详见[回调说明](/vod/api/video_codec/snapshot/snapshot_at_specific_time?id=回调说明)】 */
  callbackUrl?: string;
}
/**
 * 1、通过视频id添加单个视频指定时间点截图任务
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface SnapshotAtSpecificTimeResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 任务id */
  data?: number;
}
/**
 * snapshots nested object
 */
export interface SnapshotAtSpecificTimeSnapshots {
  /** 截图时间点 */
  offsetTime?: number;
  /** 截图的url地址 */
  imageUrl?: string;
}
/**
 * 1、设置一级分类下或用户账号下所有视频的水印，设置成功后对新上传的视频生效
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface UploadWatermarkRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 上传的图片 */
  image: File | Blob;
  /** 分类id，仅给一级分类的视频设置水印。不传为设置用户级别视频的水印 */
  cataid?: string;
  /** 水印显示的位置，动态水印此值无效。<br/>1：左上角<br/>2：右上角<br/>3：左下角<br/>4：右下角 */
  watermarkLocation?: string;
  /** 水印状态，不传默认为0<br/>0：不显示<br/>1：显示 */
  watermarkShow?: string;
}
/**
 * 1、设置一级分类下或用户账号下所有视频的水印，设置成功后对新上传的视频生效
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface UploadWatermarkResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回true，失败时返回空字符串 */
  data?: Record<string, unknown>;
}
