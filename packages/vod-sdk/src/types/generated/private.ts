/**
 * private API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module private by scripts/generate-types.ts
 */

/**
 * 1、通过子账号id和视频id，获取视频临时链接
2、接口支持https协议
 */
export interface GetVideoTmpAccessUrlRequest {
  /** 保利威点播子账户appId，获取路径：保利威点播后台->设置->账号管理 */
  appId: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，32位大写MD5值【详见[MD5签名生成规则](/vod/api/buildSignMd5)】 */
  sign: string;
  /** 视频id，视频id，例如：<br />"1b448be32370f4822ac40fd926112a66_1"；<br />获取路径：保利威点播后台->视频列表；<br />也可以获取自【[上传视频](/vod/api/video_upload/upload_video.md)】；<br /> */
  vid: string;
}
/**
 * 1、通过子账号id和视频id，获取视频临时链接
2、接口支持https协议
 */
export interface GetVideoTmpAccessUrlResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 本次请求的业务流水号，便于客户端/服务器端排查问题 */
  requestId?: string;
  /** 响应失败时返回错误的详细信息【详见[error字段说明](/vod/api/sub_account/sub_move_video.md?id=error字段说明)】，响应成功时返回空 */
  error?: Record<string, unknown>;
  /** 响应失败返回空 */
  data?: Record<string, unknown>;
}
/**
 * 1、创建获取已发布视频的源文件下载链接的任务。当单个视频资源准备好就会[回调](/vod/api/private/video_source_task_callback.md)给用户，用户亦可以主动[查询任务](/vod/api/private/video_source_task_get.md)  
2、接口支持https协议
 */
export interface VideoSourceTaskCreateRequest {
  /** 保利威点播子账户appId，获取路径：保利威点播后台->设置->账号管理 */
  appId: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，32位大写MD5值【详见[MD5签名生成规则](/vod/api/buildSignMd5)】 */
  sign: string;
  /** 视频ID，多个用英文逗号隔开，上限是100个。例如：<br />"1b448be32370f4822ac40fd926112a66_1,1b448be32305bb29879b1eb06abd9fa1_1" */
  vids: string;
  /** 文件解冻有效天数。取值范围（包含）：1-7 */
  expireDays: number;
}
/**
 * 1、创建获取已发布视频的源文件下载链接的任务。当单个视频资源准备好就会[回调](/vod/api/private/video_source_task_callback.md)给用户，用户亦可以主动[查询任务](/vod/api/private/video_source_task_get.md)  
2、接口支持https协议
 */
export interface VideoSourceTaskCreateResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 本次请求的业务流水号，便于客户端/服务器端排查问题 */
  requestId?: string;
  /** 响应失败时返回错误的详细信息【详见[error字段说明](/vod/api/private/video_source_task_create.md?id=error字段说明)】，响应成功时返回空 */
  error?: Record<string, unknown>;
  /** 响应成功时返回任务ID【详见[data字段说明](/vod/api/private/video_source_task_create.md?id=data字段说明)】，响应失败时返回空 */
  data?: Record<string, unknown>;
}
/**
 * 1、查询已提交的任务情况  
2、接口支持https协议
 */
export interface VideoSourceTaskGetRequest {
  /** 保利威点播子账户appId，获取路径：保利威点播后台->设置->账号管理 */
  appId: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，32位大写MD5值【详见[MD5签名生成规则](/vod/api/buildSignMd5)】 */
  sign: string;
  /** 任务ID【详见[创建任务](/vod/api/private/video_source_task_create)】 */
  taskId: string;
}
/**
 * 1、查询已提交的任务情况  
2、接口支持https协议
 */
export interface VideoSourceTaskGetResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 本次请求的业务流水号，便于客户端/服务器端排查问题 */
  requestId?: string;
  /** 响应失败时返回错误的详细信息【详见[error字段说明](/vod/api/private/video_source_task_get.md?id=error字段说明)】，响应成功时返回空 */
  error?: Record<string, unknown>;
  /** 响应成功时返回视频信息列表【详见[data字段说明](/vod/api/private/video_source_task_get.md?id=data字段说明)】，响应失败时返回空 */
  data?: unknown;
}
