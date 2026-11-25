/**
 * sub_account API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module sub_account by scripts/generate-types.ts
 */

/**
 * 1、使用子账号创建视频分类
2、接口支持https协议
 */
export interface SubAddCategoryRequest {
  /** 子账号appId */
  appId: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，32位大写MD5值【详见[MD5签名生成规则](/vod/api/buildSignMd5)】 */
  sign: string;
  /** 分类名 */
  name: string;
  /** 父分类id，默认为1，表示默认分类 */
  parentId?: string;
}
/**
 * 1、使用子账号创建视频分类
2、接口支持https协议
 */
export interface SubAddCategoryResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应成功返回null，响应失败返回错误描述信息【详见[error参数描述](/vod/api/sub_account/sub_add_category?id=error参数描述)】 */
  error?: Record<string, unknown>;
  /** 每次请求的业务流水号，必须唯一，便于客户端/服务器端排查问题 */
  requestId?: string;
  /** 响应成功返回成功创建的分类id，响应失败返回null */
  data?: string;
}
/**
 * error nested object
 */
export interface SubAddCategoryError {
  /** 错误码 */
  code?: number;
  /** 错误描述 */
  desc?: string;
}
/**
 * 1、通过子账号id和视频id，创建加密视频的播放凭证，即 Playsafe Token
2、如果一个凭证token尚未过期，此时使用相同的 videoId、viewerId、viewerIp、iswxa 参数值请求该接口，
   会复用原来的凭证token，并延长原凭证token的有效期
3、接口支持https协议
 */
export interface SubCreateTokenResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回播放凭证的详细信息【详见[data字段说明](/vod/api/sub_account/sub_create_token.md?id=data字段说明)】，响应失败时返回错误原因 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过分类id删除视频信息
2、接口支持https协议
 */
export interface SubDeleteCategoryRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，32位大写MD5值【详见[MD5签名生成规则](/vod/api/buildSignMd5)】 */
  sign: string;
  /** 分类id【可通过[查询分类列表](/vod/api/sub_account/sub_get_categories)获取】 */
  cateId: string;
}
/**
 * 1、通过分类id删除视频信息
2、接口支持https协议
 */
export interface SubDeleteCategoryResponse {
  /** 每次请求的业务流水号，必须唯一，便于客户端/服务器端排查问题 */
  requestId?: string;
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应失败的错误信息，响应成功时返回null【详见[error字段说明](/vod/api/sub_account/sub_delete_category.md?id=error字段说明)】 */
  error?: Record<string, unknown>;
  /** 响应成功和响应失败都返回null */
  data?: Record<string, unknown>;
}
/**
 * 1、通过视频id删除视频
2、接口支持https协议
 */
export interface SubDeleteVideoRequest {
  /** 保利威点播子账户appId，获取路径：保利威点播后台->设置->账号管理 */
  appId: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值【详见[MD5签名生成规则](/vod/api/buildSignMd5)】 */
  sign: string;
  /** 视频id */
  vid: string;
}
/**
 * 1、通过视频id删除视频
2、接口支持https协议
 */
export interface SubDeleteVideoResponse {
  /** 每次请求的业务流水号，必须唯一，便于客户端/服务器端排查问题 */
  requestId?: string;
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应成功返回null，响应失败返回错误描述信息【详见[error参数描述](/vod/api/sub_account/sub_delete_video.md?id=polyv1)】 */
  error?: Record<string, unknown>;
  /** 响应成功或失败都返回null */
  data?: Record<string, unknown>;
}
/**
 * 1、通过分类id分页查询分类列表
2、接口支持https协议
 */
export interface SubGetCategoriesRequest {
  /** 保利威点播子账户appId，获取路径：保利威点播后台->设置->账号管理 */
  appId: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值【详见[MD5签名生成规则](/vod/api/buildSignMd5)】 */
  sign: string;
  /** 分类id，默认为1则查询所有分类列表 */
  cateId: number;
  /** 子分类列表页码 */
  page?: number;
  /** 子分类每页大小 */
  pageSize?: number;
}
/**
 * 1、通过分类id分页查询分类列表
2、接口支持https协议
 */
export interface SubGetCategoriesResponse {
  /** 每次请求的业务流水号，必须唯一，便于客户端/服务器端排查问题 */
  requestId?: string;
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应成功返回null，响应失败返回错误描述信息【详见[error参数描述](/vod/api/sub_account/sub_get_categories?id=polyv4)】 */
  error?: Record<string, unknown>;
  /** 响应成功时返回分类列表信息【详见[data字段说明](/vod/api/sub_account/sub_get_categories.md?id=polyv1)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过子账号id和视频id，查询视频的详细信息
2、接口支持https协议
 */
export interface SubGetVideoInfoRequest {
  /** 保利威点播子账户appId，获取路径：保利威点播后台->设置->账号管理 */
  appId: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，32位大写MD5值【详见[MD5签名生成规则](/vod/api/buildSignMd5)】 */
  sign: string;
  /** 视频id，多个视频id用英文逗号分隔，例如：<br />"1b448be32370f4822ac40fd926112a66_1,1b448be323d66f3dae8db5af9f1fdce6_1"；<br />获取路径：保利威点播后台->视频列表；<br />也可以获取自【[上传视频](/vod/api/video_upload/upload_video.md)】； */
  vids: string;
  /** 选择需要返回的视频信息，多个以英文逗号分隔，默认为基础信息<br />basicInfo：基础信息<br />metaData：元数据<br />transcodeInfo：转码信息<br />snapshotInfo：截图信息<br />例如："basicInfo,metaData,transcodeInfo,snapshotInfo" */
  filter?: string;
}
/**
 * 1、通过子账号id和视频id，查询视频的详细信息
2、接口支持https协议
 */
export interface SubGetVideoInfoResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 本次请求的业务流水号，便于客户端/服务器端排查问题 */
  requestId?: string;
  /** 响应失败时返回错误的详细信息【详见[error字段说明](/vod/api/sub_account/sub_get_video_info.md?id=error字段说明)】，响应成功时返回空 */
  error?: Record<string, unknown>;
  /** 响应成功时返回视频信息列表【详见[data字段说明](/vod/api/sub_account/sub_get_video_info.md?id=data字段说明)】，响应失败时返回空 */
  data?: unknown;
}
/**
 * 1、通过子账号修改视频分类名称
2、接口支持https协议
 */
export interface SubModifyCategoryNameRequest {
  /** 子账号appId */
  appId: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，32位大写MD5值【详见[MD5签名生成规则](/vod/api/buildSignMd5)】 */
  sign: string;
  /** 分类id【可通过[查询分类列表](/vod/api/sub_account/sub_get_categories)获取】 */
  cateId: string;
  /** 分类名称 */
  cateName: string;
}
/**
 * 1、通过子账号修改视频分类名称
2、接口支持https协议
 */
export interface SubModifyCategoryNameResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应成功返回null，响应失败返回错误描述信息【详见[error参数描述](/vod/api/sub_account/sub_modify_category_name.md?id=error参数描述)】 */
  error?: Record<string, unknown>;
  /** 每次请求的业务流水号，必须唯一，便于客户端/服务器端排查问题 */
  requestId?: string;
  /** 响应成功或失败都返回null */
  data?: Record<string, unknown>;
}
/**
 * error nested object
 */
export interface SubModifyCategoryNameError {
  /** 错误码 */
  code?: number;
  /** 错误描述 */
  desc?: string;
}
/**
 * 1、通过分类id修改视频分类属性设置
2、接口支持https协议
 */
export interface SubModifyCategorySettingRequest {
  /** 保利威点播账户id，可以参考【[获取密钥](/vod/api/getSecretKey)】获取，获取路径：官网->登录->点播（API接口） */
  userid: string;
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，32位大写MD5值【详见[MD5签名生成规则](/vod/api/buildSignMd5)】 */
  sign: string;
  /** 分类id【可通过[查询分类列表](/vod/api/sub_account/sub_get_categories)获取】 */
  cateId: number;
  /** 是否启用分类设置，默认为N：关闭<br/>关闭时，该分类的属性设置默认跟随账号视频属性设置。启用后，可对该分类的属性做单独的设置<br/>Y：启用<br/>N：关闭 */
  enabled?: string;
  /** 源文件播放设置开关（仅对新上传视频有效），默认值为0：非源文件播放<br />如果为源文件播放，encrypt、encryptLevel、isEdu、encodeAAC参数不生效<br />1：开启<br/>0：关闭 */
  keepSource?: string;
  /** 视频加密设置开关（仅对新上传视频有效），默认值为0：关闭<br />1：开启<br />0：关闭 */
  encrypt?: string;
  /** 加密等级（仅对新上传视频有效），默认值为open：非加密授权<br />open：非加密授权<br />web：WEB授权<br />app：APP授权<br />wxa_app：小程序授权 */
  encryptLevel?: string;
  /** 视频优化（仅对新上传视频有效），默认值为0：关闭<br />1：开启<br />0：关闭<br /> */
  isEdu?: string;
  /** 生成音频文件（仅对新上传视频有效），默认为0：关闭<br />该功能只对部分有权限用户开放<br />1：开启<br/>0：关闭 */
  encodeAAC?: string;
}
/**
 * 1、通过分类id修改视频分类属性设置
2、接口支持https协议
 */
export interface SubModifyCategorySettingResponse {
  /** 每次请求的业务流水号，必须唯一，便于客户端/服务器端排查问题 */
  requestId?: string;
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 错误信息【详见[error字段说明](/vod/api/sub_account/sub_modify_category_setting.md?id=error字段说明)】 */
  error?: Record<string, unknown>;
  /** 响应成功时返回true，响应失败返回null */
  data?: boolean;
}
/**
 * 1、通过子账号id和视频id，修改视频的信息
2、接口支持https协议
 */
export interface SubModifyVideoInfoRequest {
  /** 保利威点播子账户appId，获取路径：保利威点播后台->设置->账号管理 */
  appId: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，32位大写MD5值【详见[MD5签名生成规则](/vod/api/buildSignMd5)】 */
  sign: string;
  /** 视频id，获取路径：保利威点播后台->视频列表；也可以获取自【[上传视频](/vod/api/video_upload/upload_video.md)】 */
  vid: string;
  /** 视频标题 */
  title?: string;
  /** 视频描述 */
  describ?: string;
  /** 视频标签信息 */
  tag?: string;
  /** 外链地址 */
  publishUrl?: string;
}
/**
 * 1、通过子账号id和视频id，修改视频的信息
2、接口支持https协议
 */
export interface SubModifyVideoInfoResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 本次请求的业务流水号，便于客户端/服务器端排查问题 */
  requestId?: string;
  /** 响应失败时返回错误的详细信息【详见[error字段说明](/vod/api/sub_account/sub_modify_video_info.md?id=error字段说明)】，响应成功时返回空 */
  error?: Record<string, unknown>;
  /** 响应成功失败都返回空 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过子账号id和视频id，修改视频所属的分类，支持批量修改
2、接口支持https协议
 */
export interface SubMoveVideoRequest {
  /** 保利威点播子账户appId，获取路径：保利威点播后台->设置->账号管理 */
  appId: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，32位大写MD5值【详见[MD5签名生成规则](/vod/api/buildSignMd5)】 */
  sign: string;
  /** 视频id，多个视频id用英文逗号分隔，例如：<br />"1b448be32370f4822ac40fd926112a66_1,1b448be323d66f3dae8db5af9f1fdce6_1"；<br />获取路径：保利威点播后台->视频列表；<br />也可以获取自【[上传视频](/vod/api/video_upload/upload_video.md)】；<br /> */
  vids: string;
  /** 视频分类id，该参数获取自【[获取分类及子分类](/vod/api/video_management/category/get_categories.md)】 */
  cateId?: string;
}
/**
 * 1、通过子账号id和视频id，修改视频所属的分类，支持批量修改
2、接口支持https协议
 */
export interface SubMoveVideoResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 本次请求的业务流水号，便于客户端/服务器端排查问题 */
  requestId?: string;
  /** 响应失败时返回错误的详细信息【详见[error字段说明](/vod/api/sub_account/sub_move_video.md?id=error字段说明)】，响应成功时返回空 */
  error?: Record<string, unknown>;
  /** 响应成功失败都返回空 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过子账号id，搜索视频
2、接口支持https协议
 */
export interface SubSearchVideoRequest {
  /** 保利威点播子账户appId，获取路径：保利威点播后台->设置->账号管理 */
  appId: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，32位大写MD5值【详见[MD5签名生成规则](/vod/api/buildSignMd5)】 */
  sign: string;
  /** 视频分类id，该参数获取自【[获取分类及子分类](/vod/api/video_management/category/get_categories.md)】 */
  cataId?: string;
  /** 按标题搜索 */
  title?: string;
  /** 上传者，例如：主账号 */
  uploader?: string;
  /** 视频状态，可以参考【[status字段说明](/vod/api/sub_account/sub_search_video.md?id=status字段说明)】 */
  status?: string;
  /** 是否包含子分类<br />Y：包含<br />N：不包含 */
  containSubCate?: string;
  /** 按创建时间范围查询，起始时间戳，13位时间戳<br />例如：1617866563834 */
  startTime?: number;
  /** 结束时间戳，13位时间戳，例如：1617866563834 */
  endTime?: number;
  /** 页码，默认为1 */
  page?: number;
  /** 页面大小，默认为10 */
  pageSize?: number;
  /** 排序方式<br />creationTimeDesc：降序<br />creationTimeAsc：升序 */
  sort?: string;
}
/**
 * 1、通过子账号id，搜索视频
2、接口支持https协议
 */
export interface SubSearchVideoResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 本次请求的业务流水号，便于客户端/服务器端排查问题 */
  requestId?: string;
  /** 响应失败时返回错误的详细信息【详见[error字段说明](/vod/api/sub_account/sub_search_video.md?id=error字段说明)】，响应成功时返回空 */
  error?: Record<string, unknown>;
  /** 响应成功时返回搜索结果【详见[data字段说明](/vod/api/sub_account/sub_search_video.md?id=data字段说明)】，响应失败时返回空 */
  data?: Record<string, unknown>;
}
