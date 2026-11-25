/**
 * video_upload API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module video_upload by scripts/generate-types.ts
 */

/**
 * 1、通过任务id删除视频同步任务
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface DeleteVideoSyncTaskRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 同步任务id【taskId可通过[查询视频同步任务](/vod/api/video_upload/get_video_sync_task)获取】 */
  taskId: string;
}
/**
 * 1、通过任务id删除视频同步任务
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface DeleteVideoSyncTaskResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回"成功"，响应失败时返回空 */
  data?: string;
}
/**
 * 1、导出视频同步任务列表中的单个任务，文件格式为csv
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface ExportVideoSyncTaskRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 同步任务id，该值来源可参考【[查询视频同步任务](/vod/api/video_upload/get_video_sync_task)】接口 */
  taskId: string;
}
/**
 * 1、分页查询账号下的视频同步任务详情
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetVideoSyncTaskRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 页数，默认为1 */
  page?: number;
  /** 每页数目，默认为10 */
  pageSize?: number;
}
/**
 * 1、分页查询账号下的视频同步任务详情
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetVideoSyncTaskResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回同步任务信息【详见[Data字段说明](/vod/api/video_upload/get_video_sync_task.md?id=polyv1)】，响应失败时返回空 */
  data?: Record<string, unknown>;
}
export interface UploadVideoRequest {
  /** 用户的写入数据密钥，获取方式可参考 【[获取密钥](/vod/api/getSecretKey)】 */
  writetoken: string;
  /** json格式，{"title": "标题", "tag":"标签","desc":"描述"} */
  JSONRPC: string;
  /** file类型，支持的文件格式为：.flv，.avi，.mpg，.mp4，.wmv，.mov，.3gp，.asf等 */
  Filedata: File | Blob;
  /** 当fcharset设为'ISO-8859-1'时，可以避免视频的文件名乱码 */
  fcharset?: string;
  /** 设定上传视频的分类，分类的id可以在管理后台的“分类视频列表”页面中获取，如下图所示。不传该参数时，新上传视频进入“默认分类”；**替换视频时则保持原视频的分类不变**。 */
  cataid?: number;
  /** 是否录屏优化。当值为1时，上传的视频不再采取默认的压缩编码机制，视频尺寸不再压缩，保证视频的清晰度。默认值为0 */
  luping?: number;
  /** 默认返回json格式，如果format=xml返回xml格式 */
  format?: string;
  /** 例如，正常情况{error:0,data:””}，加 jsonp=a后返回a({error:0,data:””}) */
  jsonp?: string;
  /** 文件校验码，为32位大写MD5的值 */
  fileMd5?: string;
  /** 自定义水印图片地址,图片格式必须是png格式，支持http、https。 */
  watermark?: string;
  /** 自定义水印图片位置，如没该参数，则自定义水印的显示情况跟随分类和账号。1：左上角；2：右上角；3：左下角；4：右下角 */
  watermarkLocation?: string;
  /** 用户自定义数据，如果提交了该字段，会在[上传完成回调](/vod/api/callBack)时透传返回。 */
  state?: string;
  /** 要替换的视频vid，传入该参数即执行**替换视频**（原vid不变），不传则上传为新视频。支持两种格式：完整vid（如 `36e77ba39cc4768ab541cb6bf4f775a0_3`）或32位视频id（如 `36e77ba39cc4768ab541cb6bf4f775a0`）。可放在URL参数中，也可放在JSONRPC报文中传入。详见下文[替换视频](#替换视频)。 */
  vid?: string;
}
/**
 * 1、通过视频URL链接，异步批量上传视频
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface UrlBatchUploadRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 设定上传视频的分类id，分类id通过【[获取分类及子类](/vod/api/video_management/category/get_categories)】接口获取 */
  cataid?: number;
  /** 是否录屏优化，默认为0：不优化<br/> 0：不优化 <br/> 1：优化 */
  luping?: number;
  /** 自定义水印图片链接，图片格式必须是png格式，支持http、https协议 */
  watermark?: string;
  /** 自定义水印图片位置，如没该参数，则自定义水印的显示情况跟随分类或账号设置<br>1：左上角<br>2：右上角<br>3：左下角<br>4：右下角 */
  watermarkLocation?: string;
  /** 上传视频信息json数组，最多100个，详见【[uploadInfos参数说明](/vod/api/video_upload/url_batch_upload.md?id=polyv)】 */
  uploadInfos?: unknown;
  /** 待批量上传视频的URL，多个URL之间使用英文逗号隔开，支持http、https协议，<span class="error">已不建议使用</span>，请使用 uploadInfos 参数 */
  fileUrl?: string;
  /** 标题，多个标题使用英文逗号隔开，标题数量必须和文件地址fileUrl数量一致，<span class="error">已不建议使用</span>，请使用 uploadInfos 参数 */
  title?: string;
  /** 自定义数据，长度限制：100 个字符，如果提交了该字段，会在上传完成回调时透传返回，详见【[回调通知使用说明](/vod/api/callBack.md)】 */
  state?: string;
  /** 视频标签，长度限制为200个字符，超过会被自动截断 */
  tag?: string;
}
/**
 * 1、通过视频URL链接，异步批量上传视频
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface UrlBatchUploadResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回成功，响应失败时返回空 */
  data?: string;
}
