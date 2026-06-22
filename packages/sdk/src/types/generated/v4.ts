/**
 * v4 API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module v4 by scripts/generate-types.ts
 */

/**
 * 1、查询数字人列表
2、接口支持https协议
 */
export interface Api1882Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 分页参数, 页码 */
  pageNumber: number;
  /** 分页参数, 每页数据量, 最大1000 */
  pageSize: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询数字人列表
2、接口支持https协议
 */
export interface Api1882Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回频道详细信息【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * data nested object
 */
export interface data {
  /** 分页参数, 页码 */
  pageNumber?: number;
  /** 分页参数, 每页数据量 */
  pageSize?: number;
  /** 分页参数, 总页数 */
  totalPages?: number;
  /** 分页参数, 总数据量 */
  totalItems?: number;
  /** 数字人详细信息, 【详见[contents参数描述](#contents参数描述)】 */
  contents?: unknown;
}
/**
 * contents nested object
 */
export interface contents {
  /** 数字人id */
  id?: number;
  /** 数字人名称 */
  name?: string;
  /** 数字人模型id */
  thirdRoleCode?: string;
  /** 数字人封面图 */
  coverPhoto?: string;
  /** 数字人真实的图 */
  fullBodyPhoto?: string;
  /** 数字人服装 */
  clothesDesc?: string;
  /** 数字人默认使用的声音id */
  defaultTtsVoiceId?: number;
  /** 数字人创建时间, 13位时间戳 */
  createTime?: number;
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
 * 1、查询数字人关联的组织，最多支持100个数字人ID
2、接口支持https协议
 */
export interface Api3fd3Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 数字人ID，多个用英文逗号隔开，最多100个ID */
  aiDigitalHumanIds: string;
}
/**
 * 1、查询数字人关联的组织，最多支持100个数字人ID
2、接口支持https协议
 */
export interface Api3fd3Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回频道详细信息【详见[data字段说明](#data参数描述)】 */
  data?: unknown;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
  /** 数字人ID */
  aiDigitalHumanId?: number;
  /** 组织ID列表 */
  organizationIds?: unknown;
  /** 是否包含子节点 */
  includeChildren?: boolean;
}
/**
 * 1、将数字人和组织架构关联，单次请求最多100个数字人，对应子账号
2、接口支持https协议
 */
export interface Api57ffRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、将数字人和组织架构关联，单次请求最多100个数字人，对应子账号
2、接口支持https协议
 */
export interface Api57ffResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回频道详细信息【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、创建视频创作任务, 接口支持批量创建任务, 单次最多支持20个
2、接口支持https协议
 */
export interface Api59bcResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应true, 失败请从error参数中获取详细的失败信息 */
  data?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * digitalHumanInfos nested object
 */
export interface digitalHumanInfos {
  /** 数字人id, 如果为空, 代表当前页素材不需要显示数字人 */
  digitalHumanId?: number;
  /** 数字人位置(x轴坐标), 数字人id不为空时此参数必传 */
  x?: number;
  /** 数字人位置(y轴坐标), 数字人id不为空时此参数必传 */
  y?: number;
  /** 数字人大小(宽度), 数字人id不为空时此参数必传 */
  w?: number;
  /** 数字人大小(高度), 数字人id不为空时此参数必传 */
  h?: number;
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
 * 1、创建视频创作任务, 接口支持批量创建任务, 单次最多支持20个
2、接口支持https协议
 */
export interface Api59bcResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应true, 失败请从error参数中获取详细的失败信息 */
  data?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * digitalHumanInfos nested object
 */
export interface digitalHumanInfos {
  /** 数字人id, 如果为空, 代表当前页素材不需要显示数字人 */
  digitalHumanId?: number;
  /** 数字人位置(x轴坐标), 数字人id不为空时此参数必传 */
  x?: number;
  /** 数字人位置(y轴坐标), 数字人id不为空时此参数必传 */
  y?: number;
  /** 数字人大小(宽度), 数字人id不为空时此参数必传 */
  w?: number;
  /** 数字人大小(高度), 数字人id不为空时此参数必传 */
  h?: number;
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
 * 1、接口支持https协议
 */
export interface Api59bcResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 删除成功响应true, 失败请从error参数中获取详细的失败信息 */
  data?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * status nested object
 */
export interface status {
  /** 视频等待制作 */
  _10?: number;
  /** 视频制作中 */
  _15?: number;
  /** 视频制作成功 */
  _20?: number;
  /** 视频制作失败 */
  _30?: number;
  /** 视频制作任务已过期 */
  _50?: number;
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
 * 1、查询视频创作任务
2、接口支持https协议
 */
export interface Api59bcRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 视频创作任务ID */
  aiPPTVideoId: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询视频创作任务
2、接口支持https协议
 */
export interface Api59bcResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回详细信息【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * data nested object
 */
export interface data {
  /** 任务ID */
  id?: number;
  /** 视频名称 */
  videoName?: string;
  /** 1: 无数字人任务, 3: 有数字人任务 */
  _type?: number;
  /** 【详见[status参数描述](#status参数描述)】 */
  status?: number;
  /** 视频地址 */
  videoPath?: string;
  /** 字幕地址 */
  subtitlePath?: string;
  /** 视频封面图地址 */
  videoImage?: string;
  /** 视频文件大小, 单位是byte */
  videoFileSize?: number;
  /** 视频时长, 单位是秒 */
  duration?: number;
  /** 当前任务使用的数字人id */
  digitalHumanId?: number;
  /** 任务制作完成时间(时间戳) */
  dealTime?: number;
  /** 任务创建时间(时间戳) */
  createTime?: number;
  /** 任务最后修改时间(时间戳) */
  modifyTime?: number;
  /** 字幕地址 */
  subtitlePath?: string;
  /** 标签, 字符串数组格式 */
  tags?: unknown;
}
/**
 * status nested object
 */
export interface status {
  /** 草稿状态 */
  _5?: number;
  /** 视频等待制作 */
  _10?: number;
  /** 视频制作中 */
  _15?: number;
  /** 视频制作成功 */
  _20?: number;
  /** 视频制作失败 */
  _30?: number;
  /** 视频制作任务已过期 */
  _50?: number;
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
 * 1、分页查询视频创作任务列表
2、接口支持https协议
 */
export interface Api21b0Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 分页参数, 页码 */
  pageNumber: number;
  /** 分页参数, 每页数据量, 最大1000 */
  pageSize: number;
  /** 视频名称, 限制60个字符 */
  videoName?: string;
  /** 状态, 【详见[status参数描述](#status参数描述)】 */
  status?: number;
  /** 任务创建时间范围查询左边界(时间戳) */
  createTimeStart?: number;
  /** 任务创建时间范围查询右边界(时间戳) */
  createTimeEnd?: number;
  /** 标签, 格式是字符串数组, 最多支持10个标签 */
  tags?: unknown;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、分页查询视频创作任务列表
2、接口支持https协议
 */
export interface Api21b0Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回详细信息【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * data nested object
 */
export interface data {
  /** 分页参数, 页码 */
  pageNumber?: number;
  /** 分页参数, 每页数据量 */
  pageSize?: number;
  /** 分页参数, 总页数 */
  totalPages?: number;
  /** 分页参数, 总数据量 */
  totalItems?: number;
  /** 数字人详细信息, 【详见[contents参数描述](#contents参数描述)】 */
  contents?: unknown;
}
/**
 * contents nested object
 */
export interface contents {
  /** 任务ID */
  id?: number;
  /** 视频名称 */
  videoName?: string;
  /** 1: 无数字人任务, 3: 有数字人任务 */
  _type?: number;
  /** 【详见[status参数描述](#status参数描述)】 */
  status?: number;
  /** 视频地址 */
  videoPath?: string;
  /** 视频封面图地址 */
  videoImage?: string;
  /** 视频文件大小, 单位是byte */
  videoFileSize?: number;
  /** 视频时长, 单位是秒 */
  duration?: number;
  /** 当前任务使用的数字人id */
  digitalHumanId?: number;
  /** 任务制作完成时间(时间戳) */
  dealTime?: number;
  /** 任务创建时间(时间戳) */
  createTime?: number;
  /** 任务最后修改时间(时间戳) */
  modifyTime?: number;
  /** 字幕地址 */
  subtitlePath?: string;
  /** 标签, 字符串数组格式 */
  tags?: unknown;
}
/**
 * status nested object
 */
export interface status {
  /** 草稿状态 */
  _5?: number;
  /** 视频等待制作 */
  _10?: number;
  /** 视频制作中 */
  _15?: number;
  /** 视频制作成功 */
  _20?: number;
  /** 视频制作失败 */
  _30?: number;
  /** 视频制作任务已过期 */
  _50?: number;
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
 * 1、异步上传制课ppt, 调用接口后，直接返回结果，异步获取ppt并上传
2、可通过回调或调用查询视频创作任务接口获取上传状态及转码解析结果, 转码完成后即可将该ppt用于视频创作
3、接口支持https协议
4、支持200M以内ppt大文件上传
 */
export interface Api6d96Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回频道详细信息【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * data nested object
 */
export interface data {
  /** 文件id, 注意保利威对于内容完全相同的ppt文件, 不会重复创建ppt转码解析任务, 如您使用同一份ppt重复上传, 返回的fileId是一样的（通过[查询用于视频创作的ppt](/live/api/v4/ai/video-produce/video-produce-ppt-get)接口可以获取ppt文档状态） */
  fileId?: string;
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
 * 1、根据ppt文件id查询用于视频创作的ppt信息
2、接口支持https协议
 */
export interface Api65f7Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** ppt文件id */
  fileId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、根据ppt文件id查询用于视频创作的ppt信息
2、接口支持https协议
 */
export interface Api65f7Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回详细信息【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * data nested object
 */
export interface data {
  /** ppt文件id */
  fileId?: string;
  /** 文件名称 */
  fileName?: string;
  /** ppt文件地址 */
  fileUrl?: string;
  /** ppt总页数, 转码完成才有此值 */
  totalPage?: number;
  /** ppt文档状态【详见[ppt文档状态描述](#ppt文档状态描述)】 */
  status?: string;
  /** ppt转码类型; common: 静态转码; animate: 动画ppt转码 */
  convertType?: string;
  /** ppt文件预览图片地址(小图) */
  previewImage?: string;
  /** ppt文件预览图片地址(大图) */
  previewBigImage?: string;
  /** ppt文档创建时间, 13位时间戳 */
  createTime?: number;
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
 * 1、查询用于视频创作的ppt列表
2、接口支持https协议
 */
export interface Api13adRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 分页参数, 页码 */
  pageNumber: number;
  /** 分页参数, 每页数据量, 最大1000 */
  pageSize: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询用于视频创作的ppt列表
2、接口支持https协议
 */
export interface Api13adResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回详细信息【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * data nested object
 */
export interface data {
  /** 分页参数, 页码 */
  pageNumber?: number;
  /** 分页参数, 每页数据量 */
  pageSize?: number;
  /** 分页参数, 总页数 */
  totalPages?: number;
  /** 分页参数, 总数据量 */
  totalItems?: number;
  /** 数字人详细信息, 【详见[contents参数描述](#contents参数描述)】 */
  contents?: unknown;
}
/**
 * contents nested object
 */
export interface contents {
  /** ppt文件id */
  fileId?: string;
  /** 文件名称 */
  fileName?: string;
  /** ppt文件地址 */
  fileUrl?: string;
  /** ppt总页数, 转码完成才有此值 */
  totalPage?: number;
  /** ppt文档状态【详见[ppt文档状态描述](#ppt文档状态描述)】 */
  status?: string;
  /** ppt文档创建时间, 13位时间戳 */
  createTime?: number;
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
 * 1、上传用于视频创作的ppt, 等待ppt转码解析完成后, 即可将该ppt用于视频创作
2、接口支持https协议
 */
export interface Api5c8dResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回频道详细信息【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * data nested object
 */
export interface data {
  /** 文件id, 注意保利威对于内容完全相同的ppt文件, 不会重复创建ppt转码解析任务, 如您使用同一份ppt重复上传, 返回的fileId是一样的 */
  fileId?: string;
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
 * 1、查询可用于视频创作的声音列表
2、接口支持https协议
 */
export interface Api487cRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 分页参数, 页码 */
  pageNumber: number;
  /** 分页参数, 每页数据量, 最大1000 */
  pageSize: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询可用于视频创作的声音列表
2、接口支持https协议
 */
export interface Api487cResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回频道详细信息【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * data nested object
 */
export interface data {
  /** 分页参数, 页码 */
  pageNumber?: number;
  /** 分页参数, 每页数据量 */
  pageSize?: number;
  /** 分页参数, 总页数 */
  totalPages?: number;
  /** 分页参数, 总数据量 */
  totalItems?: number;
  /** 数字人详细信息, 【详见[contents参数描述](#contents参数描述)】 */
  contents?: unknown;
}
/**
 * contents nested object
 */
export interface contents {
  /** 声音id */
  id?: number;
  /** 声音名称 */
  voiceName?: string;
  /** 声音试听音频地址 */
  voiceDemoUrl?: string;
  /** 声音标签【详见[声音标签描述](#声音标签描述)】 */
  tag?: string;
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
 * 1、根据请求参数与默认模板创建频道
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api1fddRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、根据请求参数与默认模板创建频道
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api1fddResponse {
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
 * basicSetting nested object
 */
export interface basicSetting {
  /** 直播名称，最大长度50 */
  name?: string;
  /** 直播场景<br/> topclass（大班课） <br/> double（双师课，该场景需开通） <br/> train（企业培训） <br/> alone（活动营销） <br/> seminar（研讨会） <br/> smallclass（小班课） */
  newScene?: string;
  /** 直播模板<br/> ppt（三分屏-横屏） <br/> portrait_ppt（三分屏-竖屏） <br/> alone（纯视频-横屏） <br/>portrait_alone（纯视频-竖屏）<br/> topclass（纯视频极速-横屏）<br/> portrait_topclass（纯视频极速-竖屏） <br/> seminar（研讨会）<br/>字段约束：<br/> 直播场景（newScene字段）为 <span class="error">topclass</span>（大班课）时，字段支持ppt（三分屏-横屏）、portrait_ppt（三分屏-竖屏）、alone（纯视频-横屏）、portrait_alone（纯视频-竖屏）、topclass（纯视频极速-横屏）、portrait_topclass（纯视频极速-竖屏）<br/>直播场景（newScene字段）为 <span class="error">train</span>（企业培训）或 <span class="error">alone</span>（活动营销）时，该字段支持ppt（三分屏-横屏）、portrait_ppt（三分屏-竖屏）、alone（纯视频-横屏）、portrait_alone（纯视频-竖屏）<br/>直播场景（newScene字段）为 <span class="error">double</span>（双师课）时，该字段支持ppt（三分屏-横屏）、alone（纯视频-横屏）<br/>直播场景（newScene字段）为 <span class="error">seminar</span>（研讨会）时，该字段支持seminar（研讨会）<br/>直播场景（newScene字段）为 <span class="error">guide</span>（导播）时，该字段支持alone（纯视频-横屏）、portrait_alone（纯视频-竖屏） */
  template?: string;
  /** 直播方式<br/> client: 普通直播（默认值）<br/>disk: 伪直播 */
  streamType?: string;
  /** 讲师登录密码，直播场景不是研讨会时有效，长度6-16位，必须同时包含字母和数字，不传则由系统随机生成 */
  channelPasswd?: string;
  /** 研讨会主持人密码，仅直播场景是研讨会时有效，长度6-16位，必须同时包含字母和数字，不传则由系统随机生成 */
  seminarHostPassword?: string;
  /** 研讨会参会人密码，仅直播场景是研讨会时有效，长度6-16位，必须同时包含字母和数字，不传则由系统随机生成 */
  seminarAttendeePassword?: string;
  /** 分类ID */
  categoryId?: number;
  /** 直播开始时间，13位毫秒级时间戳【注：仅做直播前倒计时显示，不对讲师开播操作产生影响】 */
  startTime?: number;
  /** 结束时间，时间戳，如：1629845600000【注：仅做未开播时直播状态判断显示，不对讲师开播操作产生影响】 */
  endTime?: number;
  /** 无延迟直播开关，Y：开启，N：关闭 */
  pureRtcEnabled?: string;
  /** 频道类型<br/>发起转播：transmit<br/>接收转播：receive<br/>普通频道：normal */
  _type?: string;
  /** 创建接收转播频道数量（仅当创建频道类型为发起转播，即type值为transmit时生效；最多支持同时创建100个转播频道） */
  createReceiveChannelCount?: number;
  /** 线上双师房间类型 transmit大房间、receive小房间 */
  doubleTeacherType?: string;
  /** 中英双语直播开关Y开、N关 */
  cnAndEnLiveEnabled?: string;
  /** 连麦人数限制，最多16人。为0表示关闭连麦。<br/>该值为空时，则默认使用账号的最大连麦人数（可联系商务修改） */
  linkMicLimit?: number;
  /** 直播介绍，最多1024字符长度（不支持富文本，建议用menuDesc代替） */
  description?: string;
  /** 菜单管理，直播介绍（支持富文本，代替description） */
  menuDesc?: string;
  /** 直播间图标地址，如果为空则使用默认模板设置 */
  logoImg?: string;
  /** 引导页图片地址，非保利威域名下的图片需先调用[上传频道所有装修图片素材](/live/api/web/setting/uploadimage)上传，如果为空则使用默认模板设置 */
  splashImg?: string;
  /** 播放器封面图片，没有直播和回放的时候显示，不传使用默认模板设置 */
  coverImg?: string;
  /** 子账号邮箱，填写时频道会创建在该子账号下（子账号不能被删除或者禁用），暂无法通过接口获取 */
  subAccount?: string;
  /** 自定义讲师ID，32个以内ASCII码可见字符 */
  customTeacherId?: string;
  /** 观看页语言(zh_CN:中文/en:英文 /ja:日文 /ko:韩文 /zh_TW:繁体中文 /follow_browser:跟随浏览器) */
  watchLangType?: string;
  /** 允许观众切换语言开关br/>Y：允许<br/>N：不允许 */
  allowSwitchLangEnabled?: string;
  /** 小班课班型，仅直播场景是小班课时必填，可选值：1，6，12 */
  smallClassSizeLimit?: number;
  /** 小班课录制开关，仅直播场景是小班课时有效，Y：开启，N：关闭，不传则默认关闭 */
  isRecord?: string;
}
/**
 * masterAuthSetting nested object
 */
export interface masterAuthSetting {
  /** 是否开启观看条件<br/>Y：开启<br/>N：关闭 */
  enabled?: string;
  /** 观看条件类型<br/>code：验证码观看 <br/>pay：付费观看<br/>custom：自定义授权观看<br/>external：外部授权观看<br/>direct：独立授权观看 */
  authType?: string;
  /** authType为code时，设置参数，必填。观看验证码，长度不超过8位 */
  authCode?: string;
  /** authType为code时，设置参数，非必填。欢迎标题，长度不超过20位，默认：欢迎观看本次直播 */
  codeAuthTips?: string;
  /** authType为code时，设置参数，非必填。验证码提示文案，长度不超过30位，默认：扫描二维码获得验证码 */
  qCodeTips?: string;
  /** authType为code时，设置参数，非必填。二维码图片地址 */
  qCodeImg?: string;
  /** 当authType为pay时，设置参数，必填。欢迎语标题，长度不超过20位 */
  payAuthTips?: string;
  /** 当authType为pay时，设置参数，必填。价格，单位为元 */
  price?: number;
  /** 当authType为pay时，设置参数，非必填。付费有效截止日期，十三位毫秒级时间戳， */
  watchEndTime?: number;
  /** 当authType为pay时，设置参数，非必填。付费有效时长，单位天。当watchEndTime和validTimePeriod都为空时，表示付费永久有效 */
  validTimePeriod?: number;
  /** 当authType为custom时，设置参数，必填。SecretKey，长度不超过10位 */
  customKey?: string;
  /** 当authType为custom时，设置参数，必填。自定义url */
  customUri?: string;
  /** 当authType为external时，设置参数，必填。SecretKey，长度不超过10位 */
  externalKey?: string;
  /** 当authType为external时，设置参数，必填。自定义url */
  externalUri?: string;
  /** 当authType为external时，设置参数，非必填。失败跳转地址 */
  externalRedirectUri?: string;
  /** 当authType为external时，设置参数，非必填。入口文本，默认为：登录观看 */
  externalEntryText?: string;
  /** 当authType为direct时，设置参数，必填。独立授权SecretKey，长度不超过10位 */
  directKey?: string;
}
/**
 * playbackSetting nested object
 */
export interface playbackSetting {
  /** 回放开关<br/>Y：开启<br/>N：关闭 */
  playbackEnabled?: string;
  /** 回放设置，章节开关，Y:开启，N:关闭 */
  sectionEnabled?: string;
  /** 回放方式<br/>single：单个回放<br/>list：列表回放 */
  _type?: string;
  /** 回放来源<br/>record：暂存<br/>playback：回放列表<br/>vod：点播列表<br/><span class="error">注：type为single时，该值只能为record；type为list时，该值只能为playback或vod；</span> */
  origin?: string;
}
/**
 * roles nested object
 */
export interface roles {
  /** 角色类型<br/>Teacher：讲师<br/>Assistant：助教<br/>Guest：嘉宾 */
  role?: string;
  /** 角色昵称，长度限制为30位 */
  nickName?: string;
  /** 角色头衔，长度限制为10位 */
  actor?: string;
  /** 角色密码，密码长度6-16位，必须包含数字和英文 */
  passwd?: string;
  /** 角色头像图片地址，需包含协议 */
  avatar?: string;
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
 * 1、修改频道聊天室发言开关
2、接口支持https协议
 */
export interface Api4b14Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、修改频道聊天室发言开关
2、接口支持https协议
 */
export interface Api4b14Response {
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
  /** 操作结果，true表示成功，false表示失败 */
  data?: boolean;
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
 * Data nested object
 */
export interface Data {
  /** 操作结果，true表示成功，false表示失败 */
  field?: boolean;
}
/**
 * 1、将平台优惠券添加到频道中
2、接口支持https协议
 */
export interface Api147dRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、将平台优惠券添加到频道中
2、接口支持https协议
 */
export interface Api147dResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功返回true */
  data?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#Error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、批量删除频道优惠券
2、接口支持https协议
 */
export interface Api573fRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、批量删除频道优惠券
2、接口支持https协议
 */
export interface Api573fResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功返回true */
  data?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#Error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、查询频道优惠券开关状态
2、接口支持https协议
 */
export interface Api7b20Request {
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
 * 1、查询频道优惠券开关状态
2、接口支持https协议
 */
export interface Api7b20Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 优惠券开关状态：Y-开启，N-关闭 */
  data?: string;
  /** 状态码非200时的错误信息【详见[Error字段说明](#Error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、查询频道优惠券列表
2、接口支持https协议
 */
export interface Api78edRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道ID */
  channelId: string;
  /** 页码，默认为1 */
  pageNumber?: number;
  /** 每页数据大小，默认10，最大1000 */
  pageSize?: number;
  /** 优惠券名称（支持模糊搜索） */
  name?: string;
}
/**
 * 1、查询频道优惠券列表
2、接口支持https协议
 */
export interface Api78edResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 分页数据【详见[Data字段说明](#Data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#Error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * Data nested object
 */
export interface Data {
  /** 当前页码 */
  pageNumber?: number;
  /** 每页数据量 */
  pageSize?: number;
  /** 页面总数 */
  totalPages?: number;
  /** 总数据量 */
  totalItems?: number;
  /** 当前页内容【详见[Contents字段说明](#Contents字段说明)】 */
  contents?: unknown;
  /** 扩展字段（可能为空） */
  ext?: Record<string, unknown>;
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
 * 1、修改频道优惠券开关状态
2、接口支持https协议
 */
export interface Api7b20Request {
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
 * 1、修改频道优惠券开关状态
2、接口支持https协议
 */
export interface Api7b20Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功时通常为空 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#Error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、根据直播默认模板创建频道
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api1309Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、根据直播默认模板创建频道
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api1309Response {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
  /** 频道响应对象【详见[data字段说明](/live/api/v4/channel/create.md?id=polyv1)】 */
  data?: Record<string, unknown>;
  /** 错误信息【详见[data字段说明](/live/api/v4/channel/create.md?id=polyv2)】 */
  error?: Record<string, unknown>;
}
/**
 * 1、批量创建频道
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
 * 1、批量创建频道
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api26caResponse {
  code?: number;
  status?: string;
  requestId?: string;
  error?: unknown;
  /** 【详见[data字段说明](#data参数描述)】 */
  data?: unknown[];
}
/**
 * data nested object
 */
export interface data {
  /** 【详见[element字段说明](#element参数描述)】 */
  element?: unknown;
}
/**
 * element nested object
 */
export interface element {
  /** 频道ID */
  channelId?: number;
  /** 校验信息 */
  userId?: string;
  /** 直播场景 */
  scene?: string;
  /** 讲师登录密码，非研讨会场景使用，长度6-16位 */
  channelPasswd?: string;
  /** 研讨会主持人密码，仅直播场景是研讨会时返回，长度6-16位 */
  seminarHostPassword?: string;
  /** 研讨会参会人密码，仅直播场景是研讨会时返回，长度6-16位 */
  seminarAttendeePassword?: string;
}
/**
 * 1、创建MR频道
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api373eRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、创建MR频道
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api373eResponse {
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
  /** 频道ID */
  channelId?: string;
  /** 频道名称 */
  name?: string;
  /** 直播账号userId */
  userId?: string;
  /** MR直播-控制台登录密码 */
  channelPasswd?: string;
  /** MR直播-直播助理账号 */
  assistantAccount?: string;
  /** MR直播-直播助理登录密码 */
  assistantPasswd?: string;
}
/**
 * 1、查询频道的页面装修设置
2、接口支持https协议
 */
export interface Api6e91Request {
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
 * 1、查询频道的页面装修设置
2、接口支持https协议
 */
export interface Api6e91Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回频道详细信息【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
  /** 皮肤，black：时尚黑，red：喜庆红，blue：科技蓝，white：经典白，green：薄荷绿，golden：富贵金 */
  skin?: string;
  /** 普通直播观看页布局配置(普通:normal,竖屏:portrait) */
  aloneWatchLayout?: string;
  /** 装修里聊天对象【详见[TemplateDecorateChatBO字段说明](#TemplateDecorateChatBO参数描述)】 */
  chat?: Record<string, unknown>;
  /** 装修中文直播介绍页对象【详见[TemplateDecorateDescBO字段说明](#TemplateDecorateDescBO参数描述)】 */
  desc?: Record<string, unknown>;
  /** 中文菜单列表对象【详见[TemplateDecorateMenuBO字段说明](#TemplateDecorateMenuBO参数描述)】 */
  menus?: unknown;
  /** 装修播放器对象【详见[TemplateDecoratePlayerBO字段说明](#TemplateDecoratePlayerBO参数描述)】 */
  player?: Record<string, unknown>;
  /** 三分屏移动端观看布局,normal:常规直播,portrait:直播带货 */
  pptMobileWatchLayout?: string;
  /** 装修引导页对象【详见[TemplateDecorateSplashBO字段说明](#TemplateDecorateSplashBO参数描述)】 */
  splash?: Record<string, unknown>;
  /** 引导页开关，Y：开启，N：关闭 */
  splashEnabled?: string;
  /** 双语直播间开关，Y：开启，N：关闭 */
  englishSettingEnabled?: string;
  /** 英文菜单列表对象【详见[TemplateDecorateMenuBO字段说明](#TemplateDecorateMenuBO参数描述)】 */
  enMenus?: unknown;
  /** 模板-装修英文直播介绍页对象【详见[TemplateDecorateDescEnBO字段说明](#TemplateDecorateDescEnBO参数描述)】 */
  descEn?: Record<string, unknown>;
}
/**
 * TemplateDecorateChatBO nested object
 */
export interface TemplateDecorateChatBO {
  /** 累计点赞人数 (点赞基数) */
  baseLikes?: number;
  /** 在线人数开关，Y：开启，N：关闭 */
  chatOnlineNumberEnable?: string;
  /** 情绪直播间开关，情绪开关和点赞开关同时只能开启一个，Y：开启，N：关闭 */
  emotionEnabled?: string;
  /** 红包开关，Y：开启，N：关闭 */
  redPackEnabled?: string;
  /** 点赞开关，Y：开启，N：关闭 */
  sendFlowersEnabled?: string;
  /** 发送图片开关，Y：开启，N：关闭 */
  viewerSendImgEnabled?: string;
  /** 欢迎语开关，Y：开启，N：关闭 */
  welcomeEnabled?: string;
  /** 提现开关，Y：开启，N：关闭 */
  withdrawEnabled?: string;
  /** 竖屏聊天室背景图 */
  portraitChatBgImg?: string;
  /** 竖屏聊天室背景图模糊度，0~50，值越大越模糊 */
  portraitChatBgImgOpacity?: string;
}
/**
 * TemplateDecorateDescBO nested object
 */
export interface TemplateDecorateDescBO {
  /** 暖场图片 -> 封面图片 */
  coverImageUrl?: string;
  /** 图标URL */
  iconUrl?: string;
  /** 主持人名称，最大长度50 */
  publisher?: string;
  /** 标题 -> 直播名称，最大长度100 */
  title?: string;
}
/**
 * TemplateDecorateDescEnBO nested object
 */
export interface TemplateDecorateDescEnBO {
  /** 主持人英文名称，最大长度50 */
  publisher?: string;
  /** 直播英文名称，最大长度100 */
  title?: string;
}
/**
 * TemplateDecorateMenuBO nested object
 */
export interface TemplateDecorateMenuBO {
  /** 菜单内容 */
  content?: string;
  /** 菜单ID */
  menuId?: string;
  /** 菜单名称 */
  name?: string;
  /** 菜单类型<br/>desc：直播介绍<br/>chat：互动聊天<br/>quiz：提问<br/>qa：问答<br/>invite：邀请海报<br/>text：图文菜单<br/>iframe：推广外链<br/>tuwen：图文直播<br/>previous：往期<br/>buy：边看边买<br/>members：成员列表<br/>seat：坐席<br/>multiMeeting：多会场 */
  _type?: string;
}
/**
 * TemplateDecoratePlayerBO nested object
 */
export interface TemplateDecoratePlayerBO {
  /** 实际累计观看次数 (真实次数) */
  actualPV?: number;
  /** PC背景图片 */
  backgroundUrl?: string;
  /** 基础观看次数 */
  basePV?: number;
  /** 封面(暖场)跳转链接 */
  coverJumpUrl?: string;
  /** 水印链接 */
  iconLink?: string;
  /** 图标位置 (水印位置) */
  iconPosition?: string;
  /** 水印图片URL */
  iconUrl?: string;
  /** 水印不透明度，0：完全透明，1：完全不透明 */
  logoOpacity?: number;
  /** 暖场开关，Y：开启，N：关闭 */
  warmUpEnabled?: string;
  /** 暖场图片地址 (直播封面图) */
  warmUpImageUrl?: string;
  /** 水印开关,Y：开启，N：关闭 */
  watermarkEnabled?: string;
}
/**
 * TemplateDecorateSplashBO nested object
 */
export interface TemplateDecorateSplashBO {
  /** 引导页图片 */
  splashImageUrl?: string;
}
/**
 * 1、批量修改频道装修皮肤
2、接口支持https协议
 */
export interface Api3eeaRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 用英文逗号隔开的频道号，如：10000,100001 最多500个 */
  channelIds: string;
  /** 皮肤<br/>black：时尚黑<br/>red：喜庆红<br/>blue：科技蓝<br/>white：经典白<br/>green：薄荷绿<br/>golden：富贵金 */
  skin: string;
}
/**
 * 1、批量修改频道装修皮肤
2、接口支持https协议
 */
export interface Api3eeaResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回true，失败时返回false */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、修改频道的页面装修设置，建议将 查询频道的页面装修设置 接口的返回值进行修改作为入参调用该接口
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api76bfRequest {
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
 * 1、修改频道的页面装修设置，建议将 查询频道的页面装修设置 接口的返回值进行修改作为入参调用该接口
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api76bfResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回频道详细信息 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * TemplateDecorateChat nested object
 */
export interface TemplateDecorateChat {
  /** 聊天室背景图url地址，不传则不改变，传空字符串则为清空（为了保证显示效果，请上传 1125 * 1416 px 大小的图片） */
  chatBackgroundImage?: string;
  /** 聊天室背景图模糊程度，0-50，数字越大越模糊，不传或者传空则不修改 */
  chatBackgroundImageOpacity?: number;
  /** 纯视频竖屏聊天室背景图url地址，不传则不改变，传空字符串则为清空（为了保证显示效果，请上传 1125 * 2436 px 大小的图标） */
  portraitChatBgImg?: string;
  /** 纯视频竖屏聊天室背景图模糊程度，0-50，数字越大越模糊，不传或者传空则不修改 */
  portraitChatBgImgOpacity?: number;
  /** 累计点赞人数 (点赞基数) */
  baseLikes?: number;
  /** 在线人数开关，Y：开启，N：关闭 */
  chatOnlineNumberEnable?: string;
  /** 情绪直播间开关，情绪开关和点赞开关同时只能开启一个 */
  emotionEnabled?: string;
  /** 红包开关，Y：开启，N：关闭 */
  redPackEnabled?: string;
  /** 点赞开关，Y：开启，N：关闭 */
  sendFlowersEnabled?: string;
  /** 发送图片开关，Y：开启，N：关闭 */
  viewerSendImgEnabled?: string;
  /** 欢迎语开关，Y：开启，N：关闭 */
  welcomeEnabled?: string;
  /** 提现开关，Y：开启，N：关闭 */
  withdrawEnabled?: string;
}
/**
 * TemplateDecorateDesc nested object
 */
export interface TemplateDecorateDesc {
  /** 图标URL */
  iconUrl?: string;
  /** 主持人名称，最大长度50 */
  publisher?: string;
  /** 标题 -> 直播名称，最大长度100 */
  title?: string;
}
/**
 * TemplateDecorateDescEn nested object
 */
export interface TemplateDecorateDescEn {
  /** 主持人英文名称，最大长度50 */
  publisher?: string;
  /** 直播英文名称，最大长度100 */
  title?: string;
}
/**
 * TemplateDecorateMenu nested object
 */
export interface TemplateDecorateMenu {
  /** 菜单ID */
  menuId?: string;
  /** 菜单名称 */
  name?: string;
  /** 菜单类型<br/>desc：直播介绍<br/>chat：互动聊天<br/>quiz：提问<br/>qa：问答<br/>invite：邀请海报<br/>text：图文菜单<br/>iframe：推广外链<br/>tuwen：图文直播<br/>previous：往期<br/>buy：边看边买<br/>members：成员列表<br/>seat：坐席<br/>multiMeeting：多会场 */
  _type?: string;
  /** 菜单内容 */
  content?: string;
}
/**
 * TemplateDecoratePlayer nested object
 */
export interface TemplateDecoratePlayer {
  /** 实际累计观看次数 (真实次数) */
  actualPV?: number;
  /** PC背景图片 */
  backgroundUrl?: string;
  /** 基础观看次数 */
  basePV?: number;
  /** 封面(暖场)跳转链接 */
  coverJumpUrl?: string;
  /** 水印链接 */
  iconLink?: string;
  /** 水印开关,Y：开启，N：关闭 */
  watermarkEnabled?: string;
  /** 水印位置，tl：左上角，tr：右上角，bl：左下角，br：右下角 */
  iconPosition?: string;
  /** 水印图片URL */
  iconUrl?: string;
  /** 水印不透明度，0：完全透明，1：完全不透明 */
  logoOpacity?: number;
  /** 暖场开关 */
  warmUpEnabled?: string;
  /** 暖场图片地址 (直播封面图) */
  warmUpImageUrl?: string;
}
/**
 * TemplateDecorateSplash nested object
 */
export interface TemplateDecorateSplash {
  /** 引导页图片 */
  splashImageUrl?: string;
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
 * 1、批量添加分发地址
2、接口支持https协议
 */
export interface Api5f70Request {
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
 * 1、批量添加分发地址
2、接口支持https协议
 */
export interface Api5f70Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功返回true */
  data?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * contents nested object
 */
export interface contents {
  /** 分发地址名称，长度不能超过20 */
  name?: string;
  /** 推流地址（不可存在相同的推流地址），例：rtmp://polyv.net，必须以 rtmp://、http://、https:// 开头 */
  distributeUrl?: string;
  /** 直播码 */
  distributeLiveCode?: string;
  /** 分发直播推流开关，不传则默认关闭 <br/>Y：打开<br/>N：关闭 */
  status?: string;
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
 * 1、批量删除分发地址
2、接口支持https协议
 */
export interface Api6e2cRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 分发ID，以英文逗号分割 */
  distributeIds: string;
}
/**
 * 1、批量删除分发地址
2、接口支持https协议
 */
export interface Api6e2cResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功返回true */
  data?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、查询分发地址信息
2、接口支持https协议
 */
export interface Api424cRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 分发ID，以英文逗号分割，不传默认查询频道下全部分发地址 */
  distributeIds?: string;
}
/**
 * 1、查询分发地址信息
2、接口支持https协议
 */
export interface Api424cResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回分发列表信息【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
  /** 频道分发直播总开关<br/>Y：开启<br/>N：关闭 */
  distributeEnable?: string;
  /** 分发地址响应对象列表【详见[result字段说明](#result参数描述)】 */
  result?: unknown;
}
/**
 * result nested object
 */
export interface result {
  /** 云分发ID */
  id?: number;
  /** 频道号 */
  channelId?: number;
  /** 分发地址名称 */
  name?: string;
  /** 推流地址 */
  distributeUrl?: string;
  /** 直播码 */
  distributeLiveCode?: string;
  /** 分发直播开关 <br/>Y：打开<br/>N：关闭 */
  status?: string;
  /** 连接状态 <br/> completed：已结束 <br/> processing：转推中 <br/> waiting：等待连接中 <br/> error：转推失败 */
  connectionStatus?: string;
}
/**
 * 1、查询频道云分发数据信息
2、接口支持https协议
 */
export interface Api1f2eRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 频道场次ID，多个使用,分隔，场次ID和直播开始结束时间不能同时为空 */
  sessionIds?: string;
  /** 直播开始时间，时间戳，场次ID和直播开始结束时间不能同时为空 */
  startTime?: number;
  /** 直播结束时间，时间戳，场次ID和直播开始结束时间不能同时为空 */
  endTime?: number;
}
/**
 * 1、查询频道云分发数据信息
2、接口支持https协议
 */
export interface Api1f2eResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回数据信息【详见[Data参数描述](#Data参数描述)】 */
  data?: unknown;
  /** 状态码非200时的错误信息【详见[Error参数描述](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * Data nested object
 */
export interface Data {
  /** 频道ID */
  channelId?: number;
  /** 场次号 */
  sessionId?: string;
  /** 直播开始时间，时间戳 */
  liveStartTime?: number;
  /** 直播结束时间，时间戳 */
  liveEndTime?: number;
  /** 云分发推流地址 */
  distributeUrl?: string;
  /** 推流开始时间，时间戳 */
  distributeStartTime?: number;
  /** 推流结束时间，时间戳 */
  distributeEndTime?: number;
  /** 云分发持续时间，单位：秒 */
  duration?: number;
  /** 错误描述，与 error.code 对应 */
  desc?: string;
}
/**
 * 1、修改单个频道云分发总开关，该功能需要超管开通才生效
2、接口支持https协议
 */
export interface Api1e77Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 频道云分发总开关，Y：开启，N：关闭，默认为Y */
  distributeEnabled?: string;
  /** 是否强制关闭，Y：强制关闭，N：非强制关闭，默认为N。非强制关闭时，频道如果正常直播中，接口会抛出异常 */
  enforce?: string;
}
/**
 * 1、修改单个频道云分发总开关，该功能需要超管开通才生效
2、接口支持https协议
 */
export interface Api1e77Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回true，失败时返回null */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、批量修改频道云分发开关，该功能需要超管开通才生效
2、接口支持https协议
 */
export interface Api587dRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 云分发列表id，多个使用,分隔 */
  distributeIds: string;
  /** 云分发开关，Y：开启，N：关闭，默认为N */
  distributeEnabled?: string;
}
/**
 * 1、批量修改频道云分发开关，该功能需要超管开通才生效
2、接口支持https协议
 */
export interface Api587dResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回true，失败时返回null */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、修改分发地址
2、接口支持https协议
 */
export interface Api6086Request {
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
 * 1、修改分发地址
2、接口支持https协议
 */
export interface Api6086Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功返回true */
  data?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * contents nested object
 */
export interface contents {
  /** 云分发ID */
  id?: string;
  /** 分发地址名称，长度不能超过20 */
  name?: string;
  /** 推流地址，例：rtmp://polyv.net，必须以 rtmp://、http://、https:// 开头 */
  distributeUrl?: string;
  /** 直播码 */
  distributeLiveCode?: string;
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
 * 1、查询频道打赏设置，包括现金打赏、礼物打赏，礼物打赏又分为现金支付和积分支付
2、接口支持https协议
 */
export interface Api78adRequest {
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
 * 1、查询频道打赏设置，包括现金打赏、礼物打赏，礼物打赏又分为现金支付和积分支付
2、接口支持https协议
 */
export interface Api78adResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回频道详细信息【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
  /** 现金红包打赏开关，Y：开启，N：关闭 */
  donateCashEnabled?: string;
  /** 现金红包【详见[TemplateCashDonateBO字段说明](#TemplateCashDonateBO参数描述)】 */
  cashDonate?: Record<string, unknown>;
  /** 礼物打赏开关，Y：开启，N：关闭 */
  donateGiftEnabled?: string;
  /** 礼物打赏（现金支付或积分支付）【详见[TemplateGiftDonateBO字段说明](#TemplateGiftDonateBO参数描述)】 */
  giftDonate?: Record<string, unknown>;
}
/**
 * TemplateCashDonateBO nested object
 */
export interface TemplateCashDonateBO {
  /** 固定打赏金额，数组长度在1-6，最小值0.01，最大值9999.99 */
  cashs?: number[];
  /** 自定义打赏金额-最低金额，最小值0.01，最大值9999.99 */
  cashMin?: number;
}
/**
 * TemplateGiftDonateBO nested object
 */
export interface TemplateGiftDonateBO {
  /** 支付方式，CASH：现金支付，POINT：积分支付 */
  payWay?: string;
  /** 现金单位 */
  cashUnit?: string;
  /** 积分单位 */
  pointUnit?: string;
  /** 现金支付列表【详见[GiftDonate字段说明](#GiftDonate参数描述)】 */
  cashPays?: unknown;
  /** 积分支付列表【详见[GiftDonate字段说明](#GiftDonate参数描述)】 */
  pointPays?: unknown;
}
/**
 * GiftDonate nested object
 */
export interface GiftDonate {
  /** 礼物名称 */
  name?: string;
  /** 礼物图片地址 */
  img?: string;
  /** 礼物价格 */
  price?: number;
  /** 开关，Y：开启，N：关闭 */
  enabled?: string;
}
/**
 * 1、修改频道礼物打赏设置，礼物打赏又分为现金支付和积分支付
2、接口支持https协议
 */
export interface Api72fcRequest {
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
 * 1、修改频道礼物打赏设置，礼物打赏又分为现金支付和积分支付
2、接口支持https协议
 */
export interface Api72fcResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回频道详细信息 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * TemplateGiftDonate nested object
 */
export interface TemplateGiftDonate {
  /** 支付方式，CASH：现金支付，POINT：积分支付 */
  payWay?: string;
  /** 积分单位 */
  pointUnit?: string;
  /** 现金支付列表，数组长度为1-18【详见[GiftDonate字段说明](#GiftDonate参数描述)】 */
  cashPays?: unknown;
  /** 积分支付列表，数组长度为1-16【详见[GiftDonate字段说明](#GiftDonate参数描述)】 */
  pointPays?: unknown;
}
/**
 * GiftDonate nested object
 */
export interface GiftDonate {
  /** 礼物名称 */
  name?: string;
  /** 开关，Y：开启，N：关闭，默认为N */
  enabled?: string;
  /** 礼物类型 STATIC-静态礼物 DYNAMIC-动态礼物，默认为静态礼物 */
  imgType?: string;
  /** 礼物图片地址，礼物类型为STATIC时必填 */
  img?: string;
  /** 动效缩略图，PNG格式、图片尺寸500 x 500p，礼物类型为DYNAMIC时必填 */
  dynamicImg?: string;
  /** 动效文件，文件类型为SVGA格式，礼物类型为DYNAMIC时必填 */
  dynamicFile?: string;
  /** 礼物价格，默认0.01 */
  price?: number;
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
 * 1、批量查询频道直播状态（不支持研讨会）
2、接口支持https协议
 */
export interface Api43a6Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 用英文逗号隔开的频道号，如：10000,100001 最多200个 */
  channelIds: string;
}
/**
 * 1、批量查询频道直播状态（不支持研讨会）
2、接口支持https协议
 */
export interface Api43a6Response {
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
  /** 【详见[data参数描述](#data参数描述)】 */
  data?: unknown;
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
  /** 频道ID */
  channelId?: number;
  /** 直播状态<br/>unStart：未开始<br/>live：直播中<br/>end：已结束<br/>waiting：等待中<br/>playback：回放中<br/>banpush：已禁播 */
  liveStatus?: string;
}
/**
 * 1、邀请海报-创建邀请者
2、appId、timestamp、sign必须通过url传递
3、接口支持https协议
 */
export interface Api22feRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值，仅query参数参与签名【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 邀请者用户ID */
  openId: string;
  /** 邀请者昵称 */
  nickname: string;
  /** 邀请者头像url地址，如果为空，则使用默认头像 */
  avatar?: string;
  /** 邀请者观众ID */
  viewerId?: string;
  /** 自定义邀请ID */
  invitee?: string;
}
/**
 * 1、邀请海报-创建邀请者
2、appId、timestamp、sign必须通过url传递
3、接口支持https协议
 */
export interface Api22feResponse {
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
  /** 邀请海报ID */
  invitePosterId?: string;
  /** 频道ID */
  channelId?: number;
  /** 邀请者用户ID */
  openId?: string;
  /** 自定义邀请ID */
  invitee?: string;
}
/**
 * 1、查询指定福袋活动的中奖者分页列表
2、接口支持https协议
 */
export interface Api49f8Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 福袋活动ID */
  activityId: number;
  /** 场次ID，不传则查询所有场次 */
  sessionId?: string;
  /** 页码，默认1 */
  currentPage?: number;
  /** 每页条数，默认10 */
  pageSize?: number;
}
/**
 * 1、查询指定福袋活动的中奖者分页列表
2、接口支持https协议
 */
export interface Api49f8Response {
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
  /** 中奖者分页数据【详见[data字段说明](#data参数描述)】 */
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
  /** 中奖者记录列表【详见[contents字段说明](#contents参数描述)】 */
  contents?: unknown;
  /** 总记录数 */
  totalItems?: number;
  /** 总页数 */
  totalPages?: number;
  /** 当前页码 */
  pageNumber?: number;
  /** 每页条数 */
  pageSize?: number;
}
/**
 * contents nested object
 */
export interface contents {
  /** 记录ID */
  id?: number;
  /** 观众ID */
  viewerId?: string;
  /** 观众昵称 */
  viewerNickName?: string;
  /** 奖品类型：cash-现金红包<br/>custom-自定义奖品 */
  prizeType?: string;
  /** 奖品信息，JSON字符串，结构见[prizeInfo字段说明](#prizeinfo参数描述) */
  prizeInfo?: string;
  /** 发放状态：0-待发放 */
  issueStatus?: number;
  /** 发放错误码 */
  outTradeErrCode?: string;
  /** 发放错误描述 */
  outTradeErrDesc?: string;
  /** 创建时间 */
  createTime?: string;
}
/**
 * prizeInfo nested object
 */
export interface prizeInfo {
  /** 奖品类型：cash-现金红包<br/>custom-自定义奖品 */
  _type?: string;
  /** 现金金额，单位：元（type=cash时返回） */
  amount?: unknown;
  /** 自定义奖品名称（type=custom时返回） */
  name?: string;
  /** 自定义奖品图片URL（type=custom时返回） */
  image?: string;
}
/**
 * 1、删除互动脚本
2、接口支持https协议
 */
export interface Api24fdRequest {
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
 * 1、查询伪直播自定义互动脚本
2、接口支持https协议
 */
export interface Api1aafRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: number;
  /** 伪直播视频 */
  diskVideoId: string;
}
/**
 * 1、上传伪直播互动脚本精准发言文件
2、伪直播脚本不存时，会自动创建
3、文件内容解析添加到该互动脚本下
4、接口支持https协议
 */
export interface Api3072Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 伪直播视频id */
  diskVideoId: string;
  /** 平台内容库-成员库-成员组ID，通过 【[平台内容库分组列表](/live/api/platform/content_group_list)】获取 */
  labelId?: number;
  /** 上传的模板文件不超过10M */
  file: File | Blob;
}
/**
 * 1、上传伪直播互动脚本精准发言文件
2、伪直播脚本不存时，会自动创建
3、文件内容解析添加到该互动脚本下
4、接口支持https协议
 */
export interface Api3072Response {
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
 * 1、删除互动监听事件
2、接口支持https协议
 */
export interface Api28ccRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、删除互动监听事件
2、接口支持https协议
 */
export interface Api28ccResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 删掉监听是否成功 */
  data?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 由业务服务端调用，查询指定频道下当前仍挂在监听队列中的互动监听任务列表；
接口支持 HTTPS 协议。
 */
export interface Api284fRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号（query 参数） */
  roomId: unknown;
}
/**
 * 由业务服务端调用，查询指定频道下当前仍挂在监听队列中的互动监听任务列表；
接口支持 HTTPS 协议。
 */
export interface Api284fResponse {
  /** 200 表示成功；400 多为参数校验失败；500 多为业务错误或服务端异常 */
  code?: number;
  /** `success` / `fail` / `error` */
  status?: string;
  /** 如「获取成功」或具体错误说明 */
  message?: string;
  /** 含 `list`（任务对象数组） */
  data?: Record<string, unknown>;
}
/**
 * 1、创建互动监听事件
2、接口支持https协议
 */
export interface Api28ccRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、创建互动监听事件
2、接口支持https协议
 */
export interface Api28ccResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 里面返回taskId */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * tasks nested object
 */
export interface tasks {
  /** 开始时间 */
  startTime?: number;
  /** 结束时间 */
  endTime?: number;
  /** 任务条件(在线、签到)type为onlineTime时有onlineTime；type为signCount时有signCount；type为speakCount时有speakCount和speakContent，表示达到speakCount次，且评论内容为speakContent；type为customCount时有customCount；type为customCount时有eventType；type可以取值loginList；type为taskEndTimeOnline表示任务完成时，且用户在线，则触发任务 */
  _type?: string;
  /** 在线时长(单位为毫秒) */
  onlineTime?: number;
  /** 签到次数 */
  signCount?: number;
  /** 用户标签 */
  userTags?: unknown;
  /** 评论次数 */
  speakCount?: number;
  /** 评论内容 */
  speakContent?: string;
  /** 自定义计数 */
  customCount?: number;
  /** 事件类型 */
  eventType?: string;
  /** 有效负载，500字符以内 */
  payload?: string;
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
 * 1、分页查询频道抽奖统计记录
2、接口支持https协议
 */
export interface Api2005Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,&lt;code style="color:red"&gt;生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据&lt;/code&gt;【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: number;
  /** 场次ID */
  sessionId?: string;
  /** 开始时间-起始范围，13位毫秒级时间戳 */
  startTimeBegin?: number;
  /** 开始时间-结束范围，13位毫秒级时间戳 */
  startTimeEnd?: number;
  /** 抽奖活动ID */
  lotteryId?: string;
  /** 分页页码 */
  pageNumber?: number;
  /** 分页大小 */
  pageSize?: number;
}
/**
 * 1、通过抽奖活动模板发起定时抽奖抽奖
2、接口支持https协议
 */
export interface Api633bRequest {
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
 * 1、查询观众中奖记录
2、接口支持https协议
 */
export interface Api6d97Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 抽奖ID */
  lotteryId: string;
  /** 观众ID */
  viewerId: string;
}
/**
 * 1、查询观众中奖记录
2、接口支持https协议
 */
export interface Api6d97Response {
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
  /** 中奖记录列表【详见[data字段说明](#data参数描述)】 */
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
  /** 中奖记录ID */
  recordId?: string;
  /** 频道号 */
  channelId?: number;
  /** 抽奖ID */
  lotteryId?: string;
  /** 抽奖时的直播场次ID */
  sessionId?: string;
  /** 观众ID */
  viewerId?: string;
  /** 观众昵称 */
  viewerName?: string;
  /** 中奖码 */
  winnerCode?: string;
  /** 奖品名称 */
  prize?: string;
  /** 中奖人姓名 */
  name?: string;
  /** 中奖人联系方式 */
  telephone?: string;
  /** 创建时间，可表示中奖时间，13位毫秒级时间戳 */
  createdTime?: number;
  /** 更新时间，13位毫秒级时间戳 */
  lastModified?: number;
  /** 中奖人地址 */
  address?: string;
  /** 中奖记录的额外拓展信息【详见[ext字段说明](#ext参数描述)】 */
  ext?: Record<string, unknown>;
  /** 用户自定义参数，在直接授权观看条件或独立授权时可能带过来的参数 */
  param4?: string;
  /** 用户自定义参数，在直接授权观看条件或独立授权时可能带过来的参数 */
  param5?: string;
  /** 账号ID */
  userId?: string;
  /** 头像 */
  avatar?: string;
  /** 参与抽奖的总人数 */
  totalUsers?: number;
}
/**
 * ext nested object
 */
export interface ext {
  /** 中奖记录的额外拓展信息【详见[receiveInfo字段说明](#receiveInfo参数描述)】 */
  receiveInfo?: unknown;
}
/**
 * receiveInfo nested object
 */
export interface receiveInfo {
  /** 字段名称 */
  field?: string;
  /** 字段值 */
  value?: string;
}
/**
 * 1、创建抽奖活动
2、接口支持https协议
 */
export interface Api2e3fRequest {
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
 * ReceiveInfo nested object
 */
export interface ReceiveInfo {
  /** 类型, userName:姓名、userPhone:手机号、custom:自定义 */
  _type?: string;
  /** 字段名 */
  field?: string;
  /** 提示语 */
  tips?: string;
  /** 是否必填，true/false */
  required?: boolean;
}
/**
 * PrizeInfo nested object
 */
export interface PrizeInfo {
  /** 奖项名称 */
  prizeItem?: string;
  /** 答对题目数 */
  correctAnswerCount?: number;
  /** 奖品名称 */
  prizeName?: string;
  /** 奖品图片 */
  thumbnail?: string;
  /** 优惠价格 */
  realPrice?: unknown;
  /** 奖品原价 */
  price?: unknown;
  /** 领奖方式，form:表单，link:外链，qrCode:识别二维码 */
  acceptType?: string;
  /** 领奖方式表单字段信息, 领奖方式为表单填写 【详见[ReceiveInfo](#ReceiveInfo参数描述)】 */
  formInfo?: unknown;
  /** 领奖方式奖品链接, 领奖方式为外链必填 */
  prizeUrl?: string;
  /** 领奖方式二维码链接, 领奖方式为二维码必填 */
  qrCode?: string;
  /** 领奖方式二维码提示语, 领奖方式为二维码填写 */
  qrCodeTips?: string;
  /** 中奖人数 */
  amount?: number;
  /** 是否隐藏中奖人数, 值:Y/N, 默认N */
  hiddenWinnerAmount?: string;
}
/**
 * 1、删除抽奖活动
2、接口支持https协议
 */
export interface Api2e3fRequest {
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
 * 1、查询抽奖活动
2、接口支持https协议
 */
export interface Api2e3fRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: number;
  /** 抽奖活动ID */
  id: number;
}
/**
 * 1、查询抽奖活动列表
2、接口支持https协议
 */
export interface Api64bfRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: number;
  /** 分页页码 */
  pageNumber?: number;
  /** 分页大小 */
  pageSize?: number;
}
/**
 * 1、更新抽奖活动
2、接口支持https协议
 */
export interface Api2e3fRequest {
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
 * ReceiveInfo nested object
 */
export interface ReceiveInfo {
  /** 类型, userName:姓名、userPhone:手机号、custom:自定义 */
  _type?: string;
  /** 字段名 */
  field?: string;
  /** 提示语 */
  tips?: string;
  /** 是否必填，true/false */
  required?: boolean;
}
/**
 * PrizeInfo nested object
 */
export interface PrizeInfo {
  /** 奖项名称 */
  prizeItem?: string;
  /** 答对题目数 */
  correctAnswerCount?: number;
  /** 奖品名称 */
  prizeName?: string;
  /** 奖品图片 */
  thumbnail?: string;
  /** 优惠价格 */
  realPrice?: unknown;
  /** 奖品原价 */
  price?: unknown;
  /** 领奖方式，form:表单，link:外链，qrCode:识别二维码 */
  acceptType?: string;
  /** 领奖方式表单字段信息, 领奖方式为表单填写 【详见[ReceiveInfo](#ReceiveInfo参数描述)】 */
  formInfo?: unknown;
  /** 领奖方式奖品链接, 领奖方式为外链必填 */
  prizeUrl?: string;
  /** 领奖方式二维码链接, 领奖方式为二维码必填 */
  qrCode?: string;
  /** 领奖方式二维码提示语, 领奖方式为二维码填写 */
  qrCodeTips?: string;
  /** 中奖人数 */
  amount?: number;
  /** 是否隐藏中奖人数, 值:Y/N, 默认N */
  hiddenWinnerAmount?: string;
}
/**
 * 1、黑名单添加观众
2、接口支持https协议
 */
export interface Api7f5dRequest {
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
 * 1、黑名单删除观众
2、接口支持https协议
 */
export interface Api73b2Request {
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
 * 1、查询黑名单观众列表
2、接口支持https协议
 */
export interface Api7415Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: number;
  /** 分页页码 */
  pageNumber?: number;
  /** 分页大小 */
  pageSize?: number;
}
/**
 * 1、新建分组
2、接口支持https协议
 */
export interface Api2fa8Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: number;
}
export interface ApiResponse {
  /** 响应状态码状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
  /** 状态码非200时的错误信息【详见[Error字段描述](#Error响应描述)】 */
  error?: Record<string, unknown>;
  /** 响应详细信息【详见[data字段说明](#data响应描述)】 */
  data?: unknown;
}
/**
 * viewerNames nested object
 */
export interface viewerNames {
  /** 观众 ID */
  viewerId?: string;
  /** 观众昵称，允许中文、英文、空串（代表无昵称） */
  viewerName?: string;
}
/**
 * 1、删除分组
2、接口支持https协议
 */
export interface Apia6d7Request {
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
 * 1、查询分组列表
2、接口支持https协议
 */
export interface Api272fRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: number;
  /** 分页页码 */
  pageNumber?: number;
  /** 分页大小 */
  pageSize?: number;
}
/**
 * 1、修改分组
2、接口支持https协议
 */
export interface Apia6d7Request {
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
 * 1、分组添加观众
2、接口支持https协议
 */
export interface Api2541Request {
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
 * 1、分组删除观众
2、接口支持https协议
 */
export interface Api1996Request {
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
 * 1、查询分组观众列表
2、接口支持https协议
 */
export interface Api31cdRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: number;
  /** 分组id */
  groupId: number;
  /** 分页页码 */
  pageNumber?: number;
  /** 分页大小 */
  pageSize?: number;
}
/**
 * 1、取消推送卡片，对应新版后台的 营销-卡片
2、接口支持https协议
 */
export interface Api465bRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 卡片推送主键ID */
  cardPushId: number;
}
/**
 * 1、取消推送卡片，对应新版后台的 营销-卡片
2、接口支持https协议
 */
export interface Api465bResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回null */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、创建频道卡片推送，对应新版后台的 营销-卡片
2、接口支持https协议
 */
export interface Api7177Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 卡片类型，common-普通卡片，qrCode-二维码，默认：common */
  cardType?: string;
  /** 卡片样式类型<br/>giftbox：礼物领取样式<br/>redpack：红包样式<br/>custom：自定义<br/>weixinWork：企微 */
  imageType: string;
  /** 卡片标题，最多16个字符 */
  title: string;
  /** 卡片跳转链接地址，需要带http:等协议头（当 hrefType=common 时使用） */
  link: string;
  /** 卡片倒计时时长，取值：0,5,10,20,30，单位：秒，0为不显示倒计时时长 */
  duration: number;
  /** 卡片倒计时时长显示位置，bottom-底部，top-右上角 */
  durationPosition?: string;
  /** 弹出方式<br/>PUSH：推送后立即弹出<br/>WATCH：观看后弹出 */
  showCondition: string;
  /** 观看后弹出的观看时长，showCondition为WATCH时生效 */
  conditionValue?: number;
  /** 观看后弹出的观看时长单位，showCondition为WATCH时，该值生效且必填<br/>SECONDS：秒<br/>MINUTES：分钟<br/> */
  conditionUnit?: string;
  /** 倒计时文案，showCondition为WATCH时生效，最多8个字符 */
  countdownMsg?: string;
  /** 卡片入口开关<br/>Y：开启<br/>N：关闭 */
  enterEnabled?: string;
  /** 卡片跳转开关<br/>Y：开启<br/>N：关闭 */
  linkEnabled?: string;
  /** 跳转方式<br/>iframe：页内显示<br/>tab：新开页面 */
  redirectType?: string;
  /** 卡片入口图片 */
  enterImage?: string;
  /** 卡片图片 */
  cardImage?: string;
  /** 企微渠道码ID（当 imageType=weixinWork 时生效） */
  weixinWordQrCodeId?: string;
  /** 二维码图片（当 cardType=qrCode 时生效） */
  qrCodeImage?: string;
  /** 跳转类型，common-普通（使用 link 字段），multiplatform-多平台（使用多端链接字段） */
  hrefType?: string;
  /** 电脑浏览器链接 */
  pcLink?: string;
  /** 手机浏览器链接 */
  mobileLink?: string;
  /** 微信小程序原始ID */
  wxMiniprogramOriginalId?: string;
  /** 微信小程序appId */
  wxMiniprogramAppId?: string;
  /** 微信小程序页面路径 */
  wxMiniprogramLink?: string;
  /** 手机App链接 */
  mobileAppLink?: string;
}
/**
 * 1、创建频道卡片推送，对应新版后台的 营销-卡片
2、接口支持https协议
 */
export interface Api7177Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回创建成功的卡片信息【详见[Data字段说明](#Data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * Data nested object
 */
export interface Data {
  /** 卡片推送ID */
  id?: number;
  /** 频道ID */
  channelId?: number;
  /** 卡片标题，最多16个字符 */
  title?: string;
  /** 卡片类型，common-普通卡片，qrCode-二维码 */
  cardType?: string;
  /** 卡片样式类型<br/>giftbox：礼物领取样式<br/>redpack：红包样式<br/>custom：自定义 */
  imageType?: string;
  /** 卡片倒计时时长，取值：0,5,10,20,30，单位：秒，0为不显示倒计时时长 */
  duration?: number;
  /** 卡片倒计时时长显示位置，bottom-底部，top-右上角 */
  durationPosition?: string;
  /** 卡片跳转链接地址，带http://等协议头 */
  link?: string;
  /** 推送结束时间，13位时间戳 */
  pushEndTime?: number;
  /** 创建时间，13位时间戳 */
  createdTime?: number;
  /** 修改时间，13位时间戳 */
  lastModified?: number;
  /** 推送状态<br/>Y：推送中<br/>N：未推送<br/>L：上次推送 */
  pushStatus?: string;
  /** 推送时间，13位时间戳 */
  pushTime?: number;
  /** 卡片入口<br/>Y：开启<br/>N：关闭 */
  enterEnabled?: string;
  /** 弹出方式<br/>PUSH：推送后立即弹出<br/>WATCH：观看后弹出 */
  showCondition?: string;
  /** 观看时长 */
  conditionValue?: number;
  /** 观看时长单位<br/>SECONDS：秒<br/>MINUTE：分钟 */
  conditionUnit?: string;
  /** 倒计时文案，showCondition为WATCH时生效，最多8个字符 */
  countdownMsg?: string;
  /** 卡片跳转开关<br/>Y：开启<br/>N：关闭 */
  linkEnabled?: string;
  /** 跳转方式<br/>iframe：页内显示<br/>tab：新开页面 */
  redirectType?: string;
  /** 卡片入口图片 */
  enterImage?: string;
  /** 卡片图片 */
  cardImage?: string;
  /** 企微渠道码ID */
  weixinWordQrCodeId?: string;
  /** 企微渠道码名称 */
  weixinwordQrCodeName?: string;
  /** 二维码图片 */
  qrCodeImage?: string;
  /** 跳转类型，common-普通，multiplatform-多平台 */
  hrefType?: string;
  /** 电脑浏览器链接 */
  pcLink?: string;
  /** 手机浏览器链接 */
  mobileLink?: string;
  /** 微信小程序原始ID */
  wxMiniprogramOriginalId?: string;
  /** 微信小程序appId */
  wxMiniprogramAppId?: string;
  /** 微信小程序页面路径 */
  wxMiniprogramLink?: string;
  /** 手机App链接 */
  mobileAppLink?: string;
}
/**
 * 1、删除卡片推送，对应新版后台的 营销-卡片
2、接口支持https协议
 */
export interface Api27a0Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 卡片推送主键ID */
  cardPushId: number;
}
/**
 * 1、删除卡片推送，对应新版后台的 营销-卡片
2、接口支持https协议
 */
export interface Api27a0Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回null */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、查询频道卡片推送，对应新版后台的 营销-卡片
2、接口支持https协议
 */
export interface Api7177Request {
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
 * 1、查询频道卡片推送，对应新版后台的 营销-卡片
2、接口支持https协议
 */
export interface Api7177Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回创建成功的卡片信息【详见[Data字段说明](#Data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * data nested object
 */
export interface data {
  /** 【详见[element字段说明](#element参数描述)】 */
  element?: unknown;
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
 * element nested object
 */
export interface element {
  /** 卡片推送ID */
  id?: number;
  /** 频道ID */
  channelId?: number;
  /** 卡片标题，最多16个字符 */
  title?: string;
  /** 卡片样式类型<br/>giftbox：礼物领取样式<br/>redpack：红包样式<br/>custom：自定义 */
  imageType?: string;
  /** 卡片倒计时时长，取值：0,5,10,20,30，单位：秒，0为不显示倒计时时长 */
  duration?: number;
  /** 卡片跳转链接地址，带http://等协议头 */
  link?: string;
  /** 推送结束时间，13位时间戳 */
  pushEndTime?: number;
  /** 创建时间，13位时间戳 */
  createdTime?: number;
  /** 修改时间，13位时间戳 */
  lastModified?: number;
  /** 推送状态<br/>Y：推送中<br/>N：未推送<br/>L：上次推送 */
  pushStatus?: string;
  /** 推送时间，13位时间戳 */
  pushTime?: number;
  /** 卡片入口<br/>Y：开启<br/>N：关闭 */
  enterEnabled?: string;
  /** 弹出方式<br/>PUSH：推送后立即弹出<br/>WATCH：观看后弹出 */
  showCondition?: string;
  /** 观看时长 */
  conditionValue?: number;
  /** 观看时长单位<br/>SECONDS：秒<br/>MINUTES：分钟 */
  conditionUnit?: string;
  /** 倒计时文案，showCondition为WATCH时生效，最多8个字符 */
  countdownMsg?: string;
  /** 卡片跳转开关<br/>Y：开启<br/>N：关闭 */
  linkEnabled?: string;
  /** 跳转方式<br/>iframe：页内显示<br/>tab：新开页面 */
  redirectType?: string;
  /** 卡片入口图片 */
  enterImage?: string;
  /** 卡片图片 */
  cardImage?: string;
}
/**
 * 1、推送频道卡片，对应新版后台的 营销-卡片
2、接口支持https协议
 */
export interface Api433cRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 卡片推送主键ID */
  cardPushId: number;
}
/**
 * 1、推送频道卡片，对应新版后台的 营销-卡片
2、接口支持https协议
 */
export interface Api433cResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回null */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、修改频道卡片推送，对应新版后台的 营销-卡片
2、接口支持https协议
 */
export interface Api7177Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 卡片推送主键ID */
  cardPushId: number;
}
/**
 * 1、修改频道卡片推送，对应新版后台的 营销-卡片
2、接口支持https协议
 */
export interface Api7177Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回null */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、查询频道微信分享信息，对应新版后台的 营销-分享设置
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
 * 1、查询频道微信分享信息，对应新版后台的 营销-分享设置
2、接口支持https协议
 */
export interface Api294dResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回频道分享信息【详见[Data字段说明](#Data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * Data nested object
 */
export interface Data {
  /** 是否开启分享，Y：开启，N：关闭 */
  shareBtnEnable?: string;
  /** 标题类型follow直播标题、custom自定义 */
  titleType?: string;
  /** 分享标题，最大长度50，标题类型为custom时，该字段生效 */
  weixinShareTitle?: string;
  /** 分享简介，最大长度120，标题类型为custom时，该字段生效 */
  weixinShareDesc?: string;
  /** 微信自定义分享地址，最大长度512 */
  weixinShareCustomUrl?: string;
  /** 网页观看自定义分享地址，最大长度512 */
  webShareCustomUrl?: string;
  /** 微信观看自定义地址携带分享者参数，Y：开启，N：关闭 */
  weixinShareCustomUrlWithParamEnabled?: string;
  /** 网页观看自定义地址携带分享者参数开关，Y：开启，N：关闭 */
  webShareCustomUrlWithParamEnabled?: string;
}
/**
 * 1、修改频道微信分享信息，对应新版后台的 营销-分享设置
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
  /** 是否开启分享，Y：开启，N：关闭 */
  shareBtnEnable: string;
  /** 标题类型follow直播标题、custom自定义 */
  titleType: string;
  /** 分享标题，最大长度50，<span class="error">标题类型为custom时，该字段必填</span> */
  weixinShareTitle?: string;
  /** 分享简介，最大长度120，<span class="error">标题类型为custom时，该字段必填</span> */
  weixinShareDesc?: string;
  /** 微信自定义分享地址，最大长度512，链接必须带协议，如：https://，链接需要进行encode */
  weixinShareCustomUrl?: string;
  /** 网页观看自定义分享地址，最大长度512，链接必须带协议，如：https://，链接需要进行encode */
  webShareCustomUrl?: string;
  /** 微信自定义分享地址携带分享者参数开关，Y：开启，N：关闭 , 默认为N) */
  weixinShareCustomUrlWithParamEnabled?: string;
  /** 网页观看自定义地址携带分享者参数开关，Y：开启，N：关闭 , 默认为N) */
  webShareCustomUrlWithParamEnabled?: string;
}
/**
 * 1、修改频道微信分享信息，对应新版后台的 营销-分享设置
2、接口支持https协议
 */
export interface Api294dResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回null */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、获取cdn频道的直播实时推流信息(阿里、腾讯cdn)
2、接口支持https协议
 */
export interface Api1242Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
  /** 频道号 */
  channelId: string;
  /** 结束时间 */
  endTime?: string;
  /** 开始时间 */
  startTime?: string;
}
/**
 * 1、获取cdn频道的直播实时推流信息(阿里、腾讯cdn)
2、接口支持https协议
 */
export interface Api1242Response {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 成功响应的数据【详见[Data参数描述](#Data参数描述)】 */
  data?: unknown;
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
  /** 直播流的音频帧率 */
  audioFrameRate?: string;
  /** 直播流的码率 */
  bitRate?: string;
  /** 直播流的URL */
  streamUrl?: string;
  /** 统计时刻 UTC时间 */
  time?: string;
  /** 当前13位毫秒级时间戳 */
  timestamp?: number;
  /** 直播流的视频帧率 */
  videoFrameRate?: string;
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
 * 1、创建频道的助教或嘉宾角色
   助教：使用助教管理后台，能够观看直播、参与互动、进行聊天室管理，发送图文直播，监控直播等操作
   嘉宾：讲师和嘉宾可同时讲一堂课，支持连麦互动
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api1132Request {
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
 * 1、创建频道的助教或嘉宾角色
   助教：使用助教管理后台，能够观看直播、参与互动、进行聊天室管理，发送图文直播，监控直播等操作
   嘉宾：讲师和嘉宾可同时讲一堂课，支持连麦互动
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api1132Response {
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
 * purviewList nested object
 */
export interface purviewList {
  /** 权限<br/>chatListEnabled：在线列表（仅支持助教）<br/>pageTurnEnabled：翻页（仅支持助教，且仅能设置一个助教有翻页权限）<br/>monitorEnabled：监播（仅支持助教，且仅能设置一个助教有监播权限）<br/>chatAuditEnabled：聊天审核（仅支持助教） */
  code?: string;
  /** 开关 <br/>Y：开启<br/>N：关闭 */
  enabled?: string;
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
  /** 助教/嘉宾账号 */
  account?: string;
  /** 用户ID */
  userId?: string;
  /** 频道号 */
  channelId?: number;
  /** 角色密码 */
  passwd?: string;
  /** 角色名称 */
  nickname?: string;
  /** 角色流名，单独使用无效 */
  stream?: string;
  /** 角色状态<br/>Y：开启<br/>N：关闭 */
  status?: string;
  /** 创建角色时间，13位毫秒级时间戳 */
  createdTime?: number;
  /** 角色最后修改时间，13位毫秒级时间戳 */
  lastModified?: number;
  /** 频道角色序号 */
  sort?: number;
  /** 角色头像 */
  avatar?: string;
  /** 角色头衔 */
  actor?: string;
  /** 角色<br/>Assistant：助教<br/>Guest：嘉宾 */
  role?: string;
  /** 监播权限<br/>Y：开启<br/>N：关闭 */
  monitorEnabled?: string;
  /** 翻页权限<br/>Y：开启<br/>N：关闭 */
  pageTurnEnabled?: string;
  /** 在线列表权限<br/>Y：开启<br/>N：关闭 */
  chatListEnabled?: string;
  /** 聊天审核权限<br/>Y：开启<br/>N：关闭 */
  chatAuditEnabled?: string;
}
/**
 * 1、批量删除角色
2、接口支持https协议
 */
export interface Api279aRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 助教/嘉宾账号，多个用英文逗号分割，最大150个 */
  accounts: string;
}
/**
 * 1、批量删除角色
2、接口支持https协议
 */
export interface Api279aResponse {
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
  /** 请求成功时返回删除结果，删除成功为true */
  data?: boolean;
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
 * 1、查询频道角色观众设置信息
2、接口支持https协议
 */
export interface Api68a8Request {
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
 * 1、查询频道角色观众设置信息
2、接口支持https协议
 */
export interface Api68a8Response {
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
  /** 【详见[data字段说明](#data字段说明)】 */
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
 * 1、修改助教或嘉宾的信息
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api409aRequest {
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
 * 1、修改助教或嘉宾的信息
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api409aResponse {
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
 * purviewList nested object
 */
export interface purviewList {
  /** 权限<br/>chatListEnabled：在线列表（仅支持助教）<br/>pageTurnEnabled：翻页（仅支持助教，且仅能设置一个助教有翻页权限）<br/>monitorEnabled：监播（仅支持助教，且仅能设置一个助教有监播权限）<br/>chatAuditEnabled：聊天审核（仅支持助教）<br/>chatInteractionEnabled：互动发言（仅支持助教）<br/>chatWhenBannedEnabled：禁言时可发言（仅支持嘉宾） */
  code?: string;
  /** 开关 <br/>Y：开启<br/>N：关闭 */
  enabled?: string;
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
  /** 助教/嘉宾账号 */
  account?: string;
  /** 用户ID */
  userId?: string;
  /** 频道号 */
  channelId?: number;
  /** 角色密码 */
  passwd?: string;
  /** 角色名称 */
  nickname?: string;
  /** 角色流名，单独使用无效 */
  stream?: string;
  /** 角色状态<br/>Y：开启<br/>N：关闭 */
  status?: string;
  /** 创建角色时间，13位毫秒级时间戳 */
  createdTime?: number;
  /** 角色最后修改时间，13位毫秒级时间戳 */
  lastModified?: number;
  /** 频道角色序号 */
  sort?: number;
  /** 角色头像 */
  avatar?: string;
  /** 角色头衔 */
  actor?: string;
  /** 角色<br/>Assistant：助教<br/>Guest：嘉宾 */
  role?: string;
  /** 监播权限<br/>Y：开启<br/>N：关闭 */
  monitorEnabled?: string;
  /** 翻页权限<br/>Y：开启<br/>N：关闭 */
  pageTurnEnabled?: string;
  /** 在线列表权限<br/>Y：开启<br/>N：关闭 */
  chatListEnabled?: string;
  /** 聊天审核权限<br/>Y：开启<br/>N：关闭 */
  chatAuditEnabled?: string;
}
/**
 * 1、修改角色观众设置信息
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api20bbRequest {
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
 * 1、修改角色观众设置信息
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api20bbResponse {
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
  /** 成功响应返回的结果内容 */
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
 * 1、查询账号下所有的频道基础信息列表
2、接口支持https协议
 */
export interface Api2489Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 分类ID，多个id用英文逗号分隔 */
  categoryIds?: string;
  /** 查询页数，默认1 */
  page?: number;
  /** 每页数据大小，默认20，最大20 */
  pageSize?: number;
}
/**
 * 1、查询账号下所有的频道基础信息列表
2、接口支持https协议
 */
export interface Api2489Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功响应时返回全账号频道基础信息【详见[data字段说明](#Data参数描述)】 */
  data?: Record<string, unknown>;
}
/**
 * Data nested object
 */
export interface Data {
  /** 每页数据大小，默认20，最大20 */
  pageSize?: number;
  /** 当前页数 */
  pageNumber?: number;
  /** 总的条数 */
  totalItems?: number;
  /** 查询的结果列表【详见[Contents参数描述](#Contents参数描述)】 */
  contents?: unknown;
  /** 当前页第一条记录在总结果集中的位置 */
  startRow?: number;
  /** 是否为第一页，值为：true/false，默认为false */
  firstPage?: boolean;
  /** 是否为最后一页，值为：true/false，默认为false */
  lastPage?: boolean;
  /** 上一页编号 */
  prePageNumber?: number;
  /** 每页数量大小 */
  limit?: number;
  /** 下一页编号 */
  nextPageNumber?: number;
  /** 当前页最后一条记录在总结果集中的位置 */
  endRow?: number;
  /** 总页数 */
  totalPages?: number;
  /** 分页起始记录 */
  offset?: number;
}
/**
 * Contents nested object
 */
export interface Contents {
  /** 频道号 */
  channelId?: string;
  /** 频道名称 */
  name?: string;
  /** 主持人名称 */
  publisher?: string;
  /** 直播开始时间，关闭时为0，开启时为13位毫秒级时间戳 */
  startTime?: number;
  /** 页面累计观看数 */
  pageView?: number;
  /** 观看页点赞数 */
  likes?: number;
  /** 频道图标url */
  coverImg?: string;
  /** 频道引导图url */
  splashImg?: string;
  /** 引导页开关，取值<br/>Y：开启<br/>N：关闭 */
  splashEnabled?: string;
  /** 直播介绍 */
  desc?: string;
  /** 最大在线观看人数 */
  maxViewer?: number;
  /** 频道的观看页状态，取值为<br/>live：直播中<br/>end：直播结束<br/>playback：回放中<br/>waiting：等待中<br/>unStart：未开始 */
  watchStatus?: string;
  /** 观看页状态描述，直播中，回放中，已结束，等待中，未开始 */
  watchStatusText?: string;
  /** 在线人数 */
  onlineNum?: number;
  /** 暖场图片URL */
  bgImg?: string;
  /** 回放视频列表，当有多个时按添加时间倒叙排列【详见[videoList参数描述](#VideoList参数描述)】 */
  videoList?: unknown;
  /** 分类ID */
  categoryId?: number;
}
/**
 * VideoList nested object
 */
export interface VideoList {
  /** 直播系统生成的id （视频库中的回放视频） */
  videoId?: string;
  /** 点播视频vid （视频库中的回放视频） */
  videoPoolId?: string;
}
/**
 * 1、查询账号下所有频道详细信息列表，观看页状态与新版后台一致
2、接口支持https协议
 */
export interface Api3c3bRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 页数默认为1 */
  pageNumber?: number;
  /** 每页显示的数据条数，默认每页显示10条数据，最大值不能超过1000 */
  pageSize?: number;
  /** 所属分类id */
  categoryId?: string;
  /** 观看页状态筛选<br/>live：直播中<br/>playback：回放中<br/>end：已结束<br/>waiting：等待中<br/>unStart：未开始 */
  watchStatus?: string;
  /** 频道名称，模糊查询 */
  keyword?: string;
  /** 排序字段，默认按频道创建时间升序<br/>startTimeDesc：开播时间降序<br/>startTimeAsc：开播时间升序<br/>channelCreatedTimeDesc：频道创建时间降序 */
  orderBy?: string;
}
/**
 * 1、查询账号下所有频道详细信息列表，观看页状态与新版后台一致
2、接口支持https协议
 */
export interface Api3c3bResponse {
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
 * Data nested object
 */
export interface Data {
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
 * Contents nested object
 */
export interface Contents {
  /** 频道号 */
  channelId?: string;
  /** 频道名称 */
  name?: string;
  /** 频道密码 */
  channelPasswd?: string;
  /** 分类ID */
  categoryId?: string;
  /** 场景<br/>alone：活动直播<br/>ppt：三分屏<br/>topclass：大班课<br/>seminar：研讨会 */
  scene?: string;
  /** 新版后台直播场景，若未定义则取scene<br/>undefined：未定义<br/>topclass：大班课<br/>double：双师课（需开通权限）<br/>train：企业培训<br/>seminar：研讨会<br/>alone：活动营销 */
  newScene?: string;
  /** 新版后台直播模板，若老版频道，该字段为未定义<br/>undefined：未定义<br/>ppt-三分屏(横屏) <br/> portrait_ppt-三分屏(竖屏) <br/> alone-纯视频(横屏) <br/>portrait_alone-纯视频(竖屏) <br/> topclass-纯视频-极速(横屏) <br/> portrait_topclass-纯视频-极速(竖屏) <br/> seminar-研讨会 */
  template?: string;
  /** 观看页状态<br/>live：直播中<br/>playback：回放中<br/>end：已结束<br/>waiting：等待中<br/>unStart：未开始<br/>banpush：已禁播 */
  watchStatus?: string;
  /** 观看页状态描述，直播中，回放中，已结束，等待中，未开始，已禁播 */
  watchStatusText?: string;
  /** 场景描述 */
  sceneText?: string;
  /** 观看页链接 */
  watchUrl?: string;
  /** 直播介绍 */
  content?: string;
  /** 直播开始时间，13位毫秒级时间戳 */
  startTime?: number;
  /** 直播延迟 Y无延时 N普通延迟 */
  pureRtcEnabled?: string;
  /** 频道图标 */
  channelLogo?: string;
  /** 频道引导图 */
  splashImg?: string;
  /** 引导页开关<br/>Y：开启<br/>N：关闭 */
  splashEnabled?: string;
  /** 主持人名称 */
  publisher?: string;
  /** 观看条件设置【详见[authSetting参数描述](#authSetting参数描述)】 */
  authSetting?: unknown;
  /** 直播方式. client: 使用开播端或第三方推流(常规); disk: 伪直播; */
  streamType?: string;
}
/**
 * authSetting nested object
 */
export interface authSetting {
  /** 频道号 */
  channelId?: string;
  /** 用于实现一个频道设置两个观看条件，为1或2<br/>1：主要条件<br/>2：次要条件 */
  rank?: number;
  /** POLYV用户ID，和保利威官网一致，获取路径：官网->登录->直播（开发设置） */
  userId?: string;
  /** 是否开启全局设置<br/>Y：开启<br/>N：关闭 */
  globalSettingEnabled?: string;
  /** 是否开启观看条件<br/>Y：开启<br/>N：关闭 */
  enabled?: string;
  /** 观看条件类型<br/>none：无限制 <br/>code：验证码观看 <br/>pay：付费观看<br/>phone：白名单观看<br/>info：登记观看<br/>wxshare：分享观看<br/>custom：自定义授权观看<br/>external：外部授权观看 */
  authType?: string;
  /** 付费观看提示信息 */
  payAuthTips?: string;
  /** 付费观看的价格 */
  price?: number;
  /** 付费观看，截止时间，13位毫秒级时间戳，为null表示：一次付费，永久有效 */
  watchEndTime?: number;
  /** 付费观看的截止时长（天） */
  validTimePeriod?: number;
  /** 登记观看提示信息 */
  infoAuthTips?: string;
  /** 登记观看的描述字段 */
  infoDesc?: string;
  /** 验证码观看提示信息 */
  codeAuthTips?: string;
  /** 验证码观看的验证码 */
  authCode?: string;
  /** 验证码观看的二维码提示 */
  qcodeTips?: string;
  /** 验证码观看的二维码图片 */
  qcodeImg?: string;
  /** 自定义授权观看的key */
  customKey?: string;
  /** 自定义授权观看的接口地址 */
  customUri?: string;
  /** 外部授权观看的key */
  externalKey?: string;
  /** 外部授权观看的接口地址 */
  externalUri?: string;
  /** 外部授权观看，用户直接访问观看页时的跳转地址 */
  externalRedirectUri?: string;
  /** 独立授权key */
  directKey?: string;
  /** 试看开关<br/>Y：开启试看<br/>N：关闭试看 */
  trialWatchEnabled?: string;
  /** 试看时间，单位为分钟 */
  trialWatchTime?: number;
  /** 试看截止日期，13位毫秒级时间戳，为null 表示对该频道永久有效 */
  trialWatchEndTime?: number;
  /** 白名单观看提示信息 */
  authTips?: string;
  /** 白名单输入提示 */
  whiteListInputTips?: string;
  /** 白名单入口文案 */
  whiteListEntryText?: string;
}
/**
 * 1、修改频道拉流码率
2、接口支持https协议
 */
export interface Api7868Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道ID */
  channelId: string;
  /** 频道拉流限制码率，取值详细参考“频道拉流限制码率pullBitRate取值说明” */
  pullBitRate: number;
}
/**
 * 1、修改频道拉流码率
2、接口支持https协议
 */
export interface Api7868Response {
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
  data?: Record<string, unknown>;
}
/**
 * 1、查询账号下所有的频道缩略信息列表，观看页状态与新版后台一致
2、列表信息仅包含频道缩略信息，如需频道具体信息，请使用【获取频道信息】接口
3、接口支持https协议
 */
export interface Api364eRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 页码，默认为1 */
  pageNumber?: number;
  /** 每页数据大小，默认每页显示10条数据，最大值不能超过1000 */
  pageSize?: number;
  /** 所属分类id */
  categoryId?: string;
  /** 观看页状态筛选<br/>live：直播中<br/>playback：回放中<br/>end：已结束<br/>waiting：等待中<br/>unStart：未开始 */
  watchStatus?: string;
  /** 频道名称，模糊查询 */
  keyword?: string;
  /** 排序字段，默认按频道创建时间升序<br/>startTimeDesc：开播时间降序<br/>startTimeAsc：开播时间升序<br/>channelCreatedTimeDesc：频道创建时间降序 */
  orderBy?: string;
}
/**
 * 1、查询账号下所有的频道缩略信息列表，观看页状态与新版后台一致
2、列表信息仅包含频道缩略信息，如需频道具体信息，请使用【获取频道信息】接口
3、接口支持https协议
 */
export interface Api364eResponse {
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
 * Data nested object
 */
export interface Data {
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
 * Contents nested object
 */
export interface Contents {
  /** 频道号 */
  channelId?: string;
  /** 频道名称 */
  name?: string;
  /** 频道密码 */
  channelPasswd?: string;
  /** 直播分类id */
  categoryId?: string;
  /** 场景<br/>alone：活动直播<br/>ppt：三分屏<br/>topclass：大班课<br/>seminar：研讨会 */
  scene?: string;
  /** 观看页状态描述<br/>直播中<br/>回放中<br/>已结束<br/>等待中<br/>未开始<br/>已禁播 */
  watchStatus?: string;
  /** 观看页状态<br/>live：直播中<br/>playback：回放中<br/>end：已结束<br/>waiting：等待中<br/>unStart：未开始<br/>banpush：已禁播 */
  watchStatusText?: string;
  /** 场景描述 */
  sceneText?: string;
  /** 观看页链接 */
  watchUrl?: string;
}
/**
 * 1、修改频道直播模板信息
2、接口支持https协议
 */
export interface Api7e8eRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道ID */
  channelId: string;
  /** 频道直播模板，取值详细参考“频道直播模板template 取值说明” */
  template: string;
}
/**
 * 1、修改频道直播模板信息
2、接口支持https协议
 */
export interface Api7e8eResponse {
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
 * 1、查询频道基本信息，观看页状态与新版后台一致
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
 * 1、查询频道基本信息，观看页状态与新版后台一致
2、接口支持https协议
 */
export interface Api4782Response {
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
  /** 【详见[data字段说明](#data字段说明)】 */
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
 * 1、查询账号下所有的频道基础信息列表，观看页状态与新版后台一致
2、接口支持https协议
 */
export interface Api2489Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 分类ID，多个id用英文逗号分隔，不超过200个 */
  categoryIds?: string;
  /** 频道号，多个频道用英文逗号分隔 */
  channelIds?: string;
  /** 观看页状态筛选<br/>live：直播中<br/>playback：回放中<br/>end：已结束<br/>waiting：等待中<br/>unStart：未开始 */
  watchStatus?: string;
  /** 直播开始时间，查询开始时间13位时间戳 */
  startTime?: number;
  /** 直播结束时间，查询结束时间13位时间戳 */
  endTime?: number;
  /** 查询页数，默认1 */
  pageNumber?: number;
  /** 每页数据大小，默认10，最大值不能超过1000 */
  pageSize?: number;
  /** 排序字段，默认按频道创建时间升序<br/>startTimeDesc：开播时间降序<br/>startTimeAsc：开播时间升序<br/>channelCreatedTimeDesc：频道创建时间降序 */
  orderBy?: string;
}
/**
 * 1、查询账号下所有的频道基础信息列表，观看页状态与新版后台一致
2、接口支持https协议
 */
export interface Api2489Response {
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
  /** 频道名称 */
  name?: string;
  /** 主持人名称 */
  publisher?: string;
  /** 直播开始时间，开启时为13位毫秒级时间戳 */
  startTime?: number;
  /** 页面累计观看数 */
  pageView?: number;
  /** 观看页点赞数 */
  likes?: number;
  /** 频道图标url */
  coverImg?: string;
  /** 频道引导图url */
  splashImg?: string;
  /** 引导页开关，取值<br/>Y：开启<br/>N：关闭 */
  splashEnabled?: string;
  /** 直播介绍 */
  desc?: string;
  /** 最大在线观看人数 */
  maxViewer?: number;
  /** 直播观看地址，例如 https://xxx.live.polyv.cn/watch/xxxx */
  watchUrl?: string;
  /** 频道的观看页状态，取值为<br/>live：直播中<br/>end：直播结束<br/>playback：回放中<br/>waiting：等待中<br/>unStart：未开始<br/>banpush：已禁播 */
  watchStatus?: string;
  /** 观看页状态描述，直播中，回放中，已结束，等待中，未开始，已禁播 */
  watchStatusText?: string;
  /** 在线人数 */
  onlineNum?: number;
  /** 暖场图片URL */
  bgImg?: string;
  /** 回放视频列表（回放列表+点播列表），当有多个时按添加时间倒叙排列【详见[videoList参数描述](#VideoList参数描述)】 */
  videoList?: unknown;
  /** 分类ID */
  categoryId?: number;
  /** 直播场景，新版直播不使用该字段<br/>alone：活动直播<br/>topclass：大班课<br/>ppt：三分屏<br/>seminar：研讨会 */
  scene?: string;
  /** 新版后台直播场景，若未定义则取scene<br/>undefined：未定义<br/>topclass：大班课<br/>double：双师课（需开通权限）<br/>train：企业培训<br/>seminar：研讨会<br/>alone：活动营销 */
  newScene?: string;
  /** 新版后台直播模板，若老版频道，该字段为未定义<br/>undefined：未定义<br/>ppt：三分屏(横屏)<br/>alone：纯视频(横屏) <br/>topclass：纯视频-极速(横屏) <br/>seminar：研讨会<br/>portrait_ppt：三分屏(竖屏)<br/>portrait_alone：纯视频(竖屏) */
  template?: string;
  /** 直播方式. client: 使用开播端或第三方推流(常规); disk: 伪直播; */
  streamType?: string;
}
/**
 * VideoList nested object
 */
export interface VideoList {
  /** 直播系统生成的id （视频库中的回放视频） */
  videoId?: string;
  /** 点播视频vid （视频库中的回放视频） */
  videoPoolId?: string;
  /** 视频时长（格式：00:01:29） */
  duration?: string;
}
/**
 * 1、查询账号下所有的频道基础信息列表，观看页状态与新版后台一致
2、接口支持https协议
 */
export interface Api2489Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号，多个频道用英文逗号分隔 */
  channelIds?: string;
  /** 排序字段，默认按频道创建时间降序<br/>startTimeDesc：开播时间降序<br/>startTimeAsc：开播时间升序 */
  orderBy?: string;
  /** 查询页数，默认1 */
  pageNumber?: number;
  /** 每页数据大小，默认10，最大值100 */
  pageSize?: number;
}
/**
 * 1、查询账号下所有的频道基础信息列表，观看页状态与新版后台一致
2、接口支持https协议
 */
export interface Api2489Response {
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
  /** 频道名称 */
  name?: string;
  /** 频道密码 */
  channelPasswd?: string;
  /** 主持人名称 */
  publisher?: string;
  /** 直播开始时间，关闭时为0，开启时为13位毫秒级时间戳 */
  startTime?: number;
  /** 页面累计观看数 */
  pageView?: number;
  /** 频道引导图url */
  splashImg?: string;
  /** 直播介绍 */
  desc?: string;
  /** 观看页链接 */
  watchUrl?: string;
  /** 频道的观看页状态，取值为<br/>live：直播中<br/>end：直播结束<br/>playback：回放中<br/>waiting：等待中<br/>unStart：未开始 */
  watchStatus?: string;
  /** 观看页状态描述，直播中，回放中，已结束，等待中，未开始 */
  watchStatusText?: string;
}
/**
 * 1、根据多个频道号查询每个频道设置的回放视频信息（仅支持非直播暂存的单个视频的回放查询）
2、接口支持https协议
 */
export interface Api62eaRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号列表，多个使用,分隔 */
  channelIds: string;
}
/**
 * 1、根据多个频道号查询每个频道设置的回放视频信息（仅支持非直播暂存的单个视频的回放查询）
2、接口支持https协议
 */
export interface Api62eaResponse {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
  /** 频道响应对象【详见[data参数描述](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 错误信息【详见[error参数描述](#error参数描述)】 */
  error?: Record<string, unknown>;
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
  /** 频道ID */
  channelId?: number;
  /** 点播系统VID（常用该字段） */
  vid?: string;
  /** 直播系统生成的id （不常用，视频库中的回放视频） */
  videoId?: string;
  /** 点播视频videoPoolId （不常用） */
  videoPoolId?: string;
  /** 视频名称 */
  videoName?: string;
  /** 视频首图 */
  firstImg?: string;
  /** 视频时间，如：05:15:01 */
  duration?: string;
}
/**
 * 1、查询多个频道回放设置
2、接口支持https协议
 */
export interface Api1c2dRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 用英文逗号隔开的频道号，如：10000,100001 最多100个 */
  channelIds: string;
}
/**
 * 1、查询多个频道回放设置
2、接口支持https协议
 */
export interface Api1c2dResponse {
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
  /** 视频列表【详见[data字段说明](#data参数描述)】 */
  data?: unknown;
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
  /** 频道号 */
  channelId?: number;
  /** 观看回放功能开关<br/>Y：开启<br/>N：关闭 */
  playBackEnabled?: string;
  /** 回放来源<br/>record：暂存<br/>playback：回放列表<br/>vod：点播列表 */
  origin?: string;
  /** 回放方式<br/>single：单个视频回放<br/>list：列表回放 */
  _type?: string;
  /** 视频列表，回放方式为单个视频时只会返回一个视频，列表回放时返回前10个视频，回放开关关闭时也会返回视频列表【详见[videoList字段说明](#videoList参数描述)】 */
  videoList?: unknown;
  /** 是否开启全局设置<br/>Y：开启<br/>N：关闭 */
  globalSettingEnabled?: string;
}
/**
 * videoList nested object
 */
export interface videoList {
  /** 直播系统生成的id （回放来源为回放列表或点播列表有值） */
  videoId?: string;
  /** 点播视频videoPoolId （回放来源为回放列表或点播列表有值） */
  videoPoolId?: string;
  /** 回放视频转存前的暂存文件ID（回放来源为暂存时有值） */
  fileId?: string;
  /** 视频时长，格式为HH:mm:ss */
  duration?: string;
  /** 视频名称 */
  name?: string;
  /** 回放视频的观看地址。留意，当“回放来源”不等于“暂存”时，该字段才有值 */
  watchUrl?: string;
}
/**
 * 1、批量修改频道回放字幕
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api1fafRequest {
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
 * 1、批量修改频道回放字幕
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api1fafResponse {
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
  /** 返回内容 */
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
 * 1、支持批量创建渠道推广
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api75ecRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、支持批量创建渠道推广
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api75ecResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功响应时为渠道基本信息列表 【详见[data字段说明](/live/api/v4/channel/popularization/batch_create_popularization.md?id=data字段说明)】 */
  data?: unknown;
}
/**
 * 1、查询渠道推广列表
2、接口支持https协议
 */
export interface Apic33eRequest {
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
 * 1、查询渠道推广列表
2、接口支持https协议
 */
export interface Apic33eResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回分发列表信息【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
  /** 当前页数，第几页 */
  pageNumber?: number;
  /** 分页大小 */
  pageSize?: number;
  /** 总页数 */
  totalPages?: number;
  /** 总记录数 */
  totalItems?: number;
  /** 分页数据集合: [ChannelPopularizationViewerVO](#ChannelPopularizationViewerVO参数描述) */
  contents?: unknown;
}
/**
 * ChannelPopularizationViewerVO nested object
 */
export interface ChannelPopularizationViewerVO {
  /** 渠道ID */
  promoteId?: string;
  /** 渠道名称 */
  popularizationName?: string;
  /** 总访问次数 */
  visitsNum?: number;
  /** 预约人数 */
  reservationNum?: number;
  /** 观看次数 */
  watchNum?: number;
  /** 观看人数 */
  viewerNum?: number;
  /** 人均观看时长 */
  averageWatchTime?: string;
  /** 报名观看人数 */
  enrollNum?: number;
  /** 创建时间 (13位毫秒时间戳) */
  createdTime?: number;
}
/**
 * 1、设置频道商品排序
2、接口支持https协议
 */
export interface Api697cRequest {
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
  /** 排序值，对应后台的排序列，大于0，数值与后台的排序显示值对应 */
  rank: number;
}
/**
 * 1、设置频道商品排序
2、接口支持https协议
 */
export interface Api697cResponse {
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
 * 1、将指定频道商品置顶
2、（timestamp, appId, channelId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api1f22Request {
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
 * 1、将指定频道商品置顶
2、（timestamp, appId, channelId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api1f22Response {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
  /** 响应数据，成功时通常为null */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
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
 * 1、取消指定频道商品的置顶状态
2、（timestamp, appId, channelId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api1874Request {
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
 * 1、取消指定频道商品的置顶状态
2、（timestamp, appId, channelId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api1874Response {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
  /** 响应数据，成功时通常为null */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
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
 * 1、查询频道商品配置
2、接口支持https协议
 */
export interface Api71eaRequest {
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
 * 1、查询频道商品配置
2、接口支持https协议
 */
export interface Api71eaResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为商品设置信息 【详见[data字段说明](/live/api/v4/channel/get_product_setting.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、修改频道商品配置
2、接口支持https协议
 */
export interface Api71eaRequest {
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
 * 1、分页查询频道商品统计列表
2、接口支持https协议
 */
export interface Api5aaeRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: number;
  /** 分页页码 */
  pageNumber?: number;
  /** 分页大小(最大不超过300) */
  pageSize?: number;
  /** 频道商品ID */
  productId?: string;
  /** 频道商品名称 */
  productName?: string;
  /** 场次Id */
  sessionId?: string;
}
/**
 * 1、查询频道商品整体统计数据概览（点击、下单、成交等指标汇总）
2、接口支持https协议
 */
export interface Api655bRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值，<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: number;
  /** 场次ID */
  sessionId?: string;
}
/**
 * 1、创建商品标签
2、接口支持https协议
 */
export interface Api280eRequest {
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
 * 1、删除商品标签
2、接口支持https协议
 */
export interface Api280eRequest {
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
 * 1、查询商品标签列表
2、接口支持https协议
 */
export interface Api5ed9Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: number;
  /** 分页页码 */
  pageNumber?: number;
  /** 分页大小 */
  pageSize?: number;
}
/**
 * 1、更新商品标签
2、接口支持https协议
 */
export interface Api280eRequest {
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
 * 1、用于批量设置暂存视频字幕文件的发布状态，控制字幕在观看页是否显示
2、接口支持https协议
 */
export interface Api241bRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 字幕发布信息列表 */
  subtitles: unknown;
  /** 字幕id */
  subtitles_id: number;
  /** 字幕状态，finish-观看页不显示，publish-观看页显示 */
  subtitles_status: string;
}
/**
 * 1、用于批量设置暂存视频字幕文件的发布状态，控制字幕在观看页是否显示
2、接口支持https协议
 */
export interface Api241bResponse {
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
  /** 【详见[Data字段说明](#data参数描述)】 */
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
 * - 用于创建暂存视频的 AI 大纲任务
- 可选开启知识测验、审核后发布与回放自动打点
- 接口支持 HTTPS 协议
 */
export interface Api3441Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值。<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 暂存文件ID */
  fileId: string;
  /** 知识测验开关，Y：开启，N：关闭，默认 N */
  aiKnowledgeQuizEnabled?: string;
  /** 大纲审核后发布开关，Y：开启，N：关闭，默认 N */
  aiSummaryAuditEnabled?: string;
  /** 回放自动打点开关，Y：开启，N：关闭，默认 N */
  syncToPlaybackDotEnabled?: string;
}
/**
 * - 用于创建暂存视频的 AI 大纲任务
- 可选开启知识测验、审核后发布与回放自动打点
- 接口支持 HTTPS 协议
 */
export interface Api3441Response {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 请求ID，每次请求生成的唯一 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
  /** 状态码非200时的错误信息【详见[Error字段描述](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 【详见[Data字段说明](#data参数描述)】 */
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
 * - 根据频道ID与暂存文件ID查询AI大纲与答题内容（若已生成）
- 接口支持 HTTPS 协议
 */
export interface ApiRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值。<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道ID */
  channelId: number;
  /** 暂存文件ID */
  fileId: string;
}
/**
 * - 根据频道ID与暂存文件ID查询AI大纲与答题内容（若已生成）
- 接口支持 HTTPS 协议
 */
export interface ApiResponse {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 请求ID，每次请求生成的唯一 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
  /** 状态码非200时的错误信息【详见[Error字段描述](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 【详见[Data字段说明](#data参数描述)】 */
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
 * Data nested object
 */
export interface Data {
  /** 大纲生成状态：init-初始化，srt_processing-字幕生成中，outline_processing-大纲生成中，audit-待审核，success-完成，fail-生成失败 */
  status?: string;
  /** 大纲JSON，未生成或生成失败时为空 */
  outline?: Record<string, unknown>;
  /** 答题JSON，未生成或生成失败时为空 */
  question?: Record<string, unknown>;
  /** 失败原因（status=fail时返回） */
  failReason?: string;
}
/**
 * 1、分页查询素材库频道直播回放列表
2、接口支持https协议
 */
export interface Apifd25Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: number;
  /** 分页页码，默认 1 */
  pageNumber?: number;
  /** 分页大小，默认 10 */
  pageSize?: number;
}
/**
 * 1、分页查询素材库频道直播回放列表
2、接口支持https协议
 */
export interface Apifd25Response {
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
 * 1、分页查询频道打赏记录
2、接口支持https协议
 */
export interface Api58b8Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: number;
  /** 分页页码 */
  pageNumber?: number;
  /** 分页大小(最大不超过300) */
  pageSize?: number;
  /** 查询的开始时间，13位时间戳 */
  start: number;
  /** 查询的结束时间，13位时间戳 */
  end: number;
}
/**
 * 1、分页查询频道点赞记录
2、接口支持https协议
 */
export interface Api5f44Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: number;
  /** 分页页码 */
  pageNumber?: number;
  /** 分页大小(最大不超过300) */
  pageSize?: number;
  /** 查询的开始时间，13位时间戳 */
  start?: number;
  /** 查询的结束时间，13位时间戳 */
  end?: number;
}
/**
 * 1、查询频道角色权限设置
2、接口支持https协议
 */
export interface Api4124Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道ID */
  channelId: number;
  /** 角色类型 Teacher：讲师、Guest：嘉宾 */
  role: string;
}
/**
 * 1、查询频道角色权限设置
2、接口支持https协议
 */
export interface Api4124Response {
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
  /** 视频列表【详见[data字段说明](#data参数描述)】 */
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
  /** 开播端签到功能显示开关 Y：开启、N：关闭 */
  webStartCheckInDisplayEnabled?: string;
  /** 开播端抽奖功能显示开关 Y：开启、N：关闭 */
  webStartLotteryDisplayEnabled?: string;
  /** 开播端问卷功能显示开关 Y：开启、N：关闭 */
  webStartQuestionnaireDisplayEnabled?: string;
  /** 开播端答题卡功能显示开关 Y：开启、N：关闭 */
  webStartAnswerDisplayEnabled?: string;
  /** 开播端定时器功能显示开关 (角色类型为讲师时有此字段)  Y：开启、N：关闭 */
  webStartTimerDisplayEnabled?: string;
  /** 开播端红包功能显示开关 Y：开启、N：关闭 */
  webStartRedPackDisplayEnabled?: string;
  /** 开播端卡片推送功能显示开关 Y：开启、N：关闭 */
  webStartCardPushDisplayEnabled?: string;
  /** 开播端公告功能显示开关 Y：开启、N：关闭 */
  webStartNotifyDisplayEnabled?: string;
  /** 开播端连麦功能显示开关 Y：开启、N：关闭 */
  webStartLinkMicDisplayEnabled?: string;
  /** 开播端多媒体功能显示开关 Y：开启、N：关闭 */
  webStartMultiMediaDisplayEnabled?: string;
  /** 开播端成员列表功能显示开关 Y：开启、N：关闭 */
  webStartMembersDisplayEnabled?: string;
  /** 共享保持摄像头状态开关 Y：开启、N：关闭 */
  screenShareRetainCameraEnabled?: string;
  /** 混流布局默认应用 (角色类型为讲师时有此字段)  1：单人模式、2：平铺模式、3：主讲模式 */
  multiplexingDefaultLayout?: string;
  /** 摄像头单人模式开关 Y：开启、N：关闭 */
  cameraSingleModeEnabled?: string;
  /** AI抠像背景图 */
  aiVirtualBgUrl?: string;
  /** 混音默认开关 Y：开启、N：关闭 */
  remixDefaultEnabled?: string;
  /** 是否显示场景模板开关 Y：开启、N：关闭 */
  showSceneTemplateEnabled?: string;
  /** 隐藏画面方向切换入口开关 Y：开启、N：关闭 */
  hideFramesDirectionEnabled?: string;
  /** 是连麦默认方式 (角色类型为讲师时有此字段) video：音视频、audio：音频 */
  defaultOpenMicLinkEnabled?: string;
}
/**
 * 1、批量查询主讲信息接口
2、接口支持https协议
 */
export interface Api22c7Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、批量查询主讲信息接口
2、接口支持https协议
 */
export interface Api22c7Response {
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
  /** 主讲信息列表【详见[data字段说明](#data参数描述)】 */
  data?: unknown;
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
 * Data nested object
 */
export interface Data {
  /** 频道ID */
  channelId?: number;
  /** 主讲密码 */
  passwd?: string;
  /** 主讲用户ID */
  userId?: string;
  /** 主讲昵称 */
  nickname?: string;
  /** 自定义主讲ID */
  customTeacherId?: string;
  /** 主讲标识 */
  actor?: string;
  /** 主讲头像URL */
  avatar?: string;
  /** 全局设置开关 Y：开启、N：关闭 */
  globalSettingEnabled?: string;
  /** 公告功能开关 Y：开启、N：关闭 */
  notifyEnabled?: string;
  /** 签到功能开关 Y：开启、N：关闭 */
  checkinEnabled?: string;
  /** 投票功能开关 Y：开启、N：关闭 */
  voteEnabled?: string;
  /** 抽奖功能开关 Y：开启、N：关闭 */
  lotteryEnabled?: string;
}
/**
 * 1、修改频道角色权限设置
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api4124Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: number;
  /** 角色类型 Teacher：讲师、Guest：嘉宾 */
  role: string;
}
/**
 * 1、修改频道角色权限设置
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api4124Response {
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
  /** 返回内容 */
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
 * 1、查询频道场次对应自定义场次ID
2、接口支持https协议
 */
export interface Api612dRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道ID */
  channelId: string;
  /** 场次ID */
  sessionId: string;
}
/**
 * 1、查询频道场次对应自定义场次ID
2、接口支持https协议
 */
export interface Api612dResponse {
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
  /** 自定义场次响应对象【详见[data字段说明](#data参数描述)】 */
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
  /** 频道ID */
  channelId?: number;
  /** 场次ID */
  sessionId?: string;
  /** 自定义场次ID */
  externalSessionId?: string;
}
/**
 * 1、创建频道新版场次
2、接口支持https协议
 */
export interface Api79c8Request {
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
 * 1、创建频道新版场次
2、接口支持https协议
 */
export interface Api79c8Response {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
  /** 场次响应对象【详见[data字段说明](/live/api/v4/channel/session/session_new_create.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
  /** 错误信息 */
  error?: Record<string, unknown>;
}
/**
 * 1、删除频道新版场次
2、接口支持https协议
 */
export interface Api79c8Request {
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
 * 1、删除频道新版场次
2、接口支持https协议
 */
export interface Api79c8Response {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
  /** 成功响应的数据，删除成功时为空对象 */
  data?: Record<string, unknown>;
  /** 错误信息 */
  error?: Record<string, unknown>;
}
/**
 * 1、获取频道新版场次信息
2、接口支持https协议
 */
export interface Api2aa5Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId?: number;
  /** 场次ID */
  sessionId?: string;
}
/**
 * 1、获取频道新版场次信息
2、接口支持https协议
 */
export interface Api2aa5Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为频道场次信息 【详见[data字段描述](/live/api/channel/session/session_new_get.md?id=data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、获取频道新版场次列表
2、接口支持https协议
 */
export interface Api2aa5Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号(不传默认获取整个账号下的所有场次) */
  channelId?: number;
  /** 分页页码，默认1 */
  pageNumber?: number;
  /** 分页大小，默认10 */
  pageSize?: number;
}
/**
 * 1、获取频道新版场次列表
2、接口支持https协议
 */
export interface Api2aa5Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为频道场次信息 【详见[data字段描述](/live/api/channel/session/session_new_list.md?id=data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、更新频道新版场次
2、接口支持https协议
 */
export interface Api79c8Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId?: number;
}
/**
 * 1、更新频道新版场次
2、接口支持https协议
 */
export interface Api79c8Response {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
  /** 场次响应对象【详见[data字段说明](/live/api/v4/channel/session/session_new_update.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
  /** 错误信息 */
  error?: Record<string, unknown>;
}
/**
 * 1、查询频道观看终端分布统计信息
2、接口支持https协议
 */
export interface Apib5faRequest {
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
 * 1、查询频道观看终端分布统计信息
2、接口支持https协议
 */
export interface Apib5faResponse {
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
  /** 终端名称 */
  name?: string;
  /** 终端类型<br/>pc：PC端<br/>mobile：移动端 */
  platform?: string;
  /** 观看次数 */
  plays?: number;
  /** 观看用户数（基于param1，即viewerId） */
  viewers?: number;
  /** 观看IP数 */
  ips?: number;
  /** 观看时长，单位:分钟 */
  playDuration?: number;
  /** 百分比，保留两位小数（基于观看次数） */
  percent?: number;
}
/**
 * 1、查询频道观看地域分布统计信息
2、接口支持https协议
 */
export interface Api309aRequest {
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
  /** 统计类型，默认为province<br/>country：按国家统计<br/>province：按省份统计<br/>city：按城市统计 */
  _type?: string;
}
/**
 * 1、查询频道观看地域分布统计信息
2、接口支持https协议
 */
export interface Api309aResponse {
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
  /** 观看次数 */
  plays?: number;
  /** 观看用户数（基于param1，即viewerId） */
  viewers?: number;
  /** 观看IP数 */
  ips?: number;
  /** 观看时长，单位:分钟 */
  playDuration?: number;
  /** 国家 */
  country?: string;
  /** 省份 */
  province?: string;
  /** 城市 */
  city?: string;
  /** 百分比，保留两位小数（基于观看次数） */
  percent?: number;
}
/**
 * 1、查询邀请海报排行
2、接口支持https协议
 */
export interface Api7be2Request {
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
 * 1、查询邀请海报排行
2、接口支持https协议
 */
export interface Api7be2Response {
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
  data?: unknown;
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
  /** 微信openId */
  openId?: string;
  /** 昵称 */
  nickname?: string;
  /** 头像url */
  avatar?: string;
  /** 邀请人数 */
  inviteNum?: number;
  /** 邀请排名 */
  rank?: number;
}
/**
 * 1、分页查询邀请海报明细数据统计
2、接口支持https协议
 */
export interface Apifd10Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 邀请人ID */
  senderViewerId?: string;
  /** 受邀开始时间，13位毫秒级时间戳 */
  startTime?: number;
  /** 受邀结束时间，13位毫秒级时间戳 */
  endTime?: number;
  /** 当前页数 */
  pageNumber?: number;
  /** 每页数据大小，默认10条数据，最大1000条 */
  pageSize?: number;
}
/**
 * 1、分页查询邀请海报明细数据统计
2、接口支持https协议
 */
export interface Apifd10Response {
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
  /** 自定义邀请Id（默认为空，需要配置才有值） */
  invitee?: string;
  /** 邀请人微信openId */
  openId?: string;
  /** 邀请人ViewerID */
  viewerId?: string;
  /** 邀请人昵称 */
  nickname?: string;
  /** 邀请人头像url */
  avatar?: string;
  /** 海报生成时间，13位毫秒级时间戳 */
  createdTime?: number;
  /** 受邀人昵称 */
  receiverNickname?: string;
  /** 受邀人微信openId */
  receiverOpenId?: string;
  /** 受邀人ViewerId */
  receiverViewerId?: string;
  /** 受邀时间，13位毫秒级时间戳 */
  receiverTime?: number;
  /** 受邀人头像url */
  receiverAvatar?: string;
  /** 受邀人观看时长 */
  receiverPlayDuration?: number;
  /** 受邀人直播观看时长 */
  receiverLivePlayDuration?: number;
  /** 受邀人回放观看时长 */
  receiverPlaybackPlayDuration?: number;
  /** 受邀人签到次数 */
  receiverCheckInCount?: number;
  /** 受邀人地区 */
  receiverRegion?: string;
  /** 受邀人城市 */
  receiverCity?: string;
}
/**
 * 1、查询频道直播数据
2、接口支持https协议
 */
export interface Api7e8fRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 查询开始时间，13位时间戳 */
  startTime?: number;
  /** 查询结束时间，13位时间戳，查询时间跨度不能超过180天 */
  endTime?: number;
}
/**
 * 1、查询频道直播数据
2、接口支持https协议
 */
export interface Api7e8fResponse {
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
  /** 直播观看数据统计【详见[watchData字段说明](#watchData参数描述)】 */
  watchData?: Record<string, unknown>;
  /** 直播实时活跃【详见[realTimeData字段说明](#realTimeData参数描述)】 */
  realTimeData?: Record<string, unknown>;
  /** 省份观看数据汇总【详见[provinceData字段说明](#provinceData参数描述)】 */
  provinceData?: unknown;
}
/**
 * watchData nested object
 */
export interface watchData {
  /** 观看用户数（基于param1，即viewerId） */
  viewers?: number;
  /** 观看次数 */
  plays?: number;
  /** 播放时长，单位：分钟 */
  playDuration?: number;
  /** 人均观看时长，单位:分钟 */
  averagePlayDuration?: number;
  /** 页面累计观看数，与时间范围无关 */
  pageView?: number;
  /** 频道累计点赞数，与时间范围无关 */
  likes?: number;
}
/**
 * realTimeData nested object
 */
export interface realTimeData {
  /** 最高在线人数 */
  maxConcurrent?: number;
  /** 发生最高在线人数的时间点，13位毫秒级时间戳 */
  date?: number;
}
/**
 * provinceData nested object
 */
export interface provinceData {
  /** 省份 */
  province?: string;
  /** 观看用户数 */
  viewers?: number;
  /** 省份平均观看时长，单位:分钟 */
  averagePlayDuration?: number;
}
/**
 * 1、查询频道发起抽奖记录
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
  /** 抽奖ID */
  lotteryId?: string;
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
 * 1、查询频道发起抽奖记录
2、接口支持https协议
 */
export interface Api781aResponse {
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
  /** 中奖记录列表【详见[data字段说明](#data参数描述)】 */
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
  /** 实际中奖人数 */
  winnerCount?: number;
  /** 参与抽奖的人数 */
  totalUsers?: number;
  /** 抽奖场次ID */
  lotteryId?: string;
  /** 频道号 */
  channelId?: number;
  /** 账号userId */
  userId?: string;
  /** 抽奖时的直播场次ID */
  sessionId?: string;
  /** 抽奖候选人范围 */
  lotteryRange?: string;
  /** 按头衔抽奖时的头衔名称 */
  actor?: string;
  /** 奖品名称 */
  prize?: string;
  /** 中奖人数 */
  amount?: number;
  /** 预设中奖者，以英文逗号隔开 */
  preset?: string;
  /** 抽奖的额外拓展信息【详见[lotteryExt字段说明](#lotteryExt参数描述)】 */
  lotteryExt?: Record<string, unknown>;
  /** 抽奖时间，十三位时间戳 */
  createdTime?: number;
}
/**
 * lotteryExt nested object
 */
export interface lotteryExt {
  /** 中奖用户领奖收集信息列表 */
  collectInfo?: unknown;
}
/**
 * collectInfo nested object
 */
export interface collectInfo {
  /** 字段名称 */
  field?: string;
  /** 填写提示 */
  tips?: string;
}
/**
 * 1、查询微信预约数据
2、接口支持https协议
 */
export interface Apidd1cRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 预约开始时间，13位毫秒级时间戳 */
  startTime?: number;
  /** 预约结束时间，13位毫秒级时间戳 */
  endTime?: number;
  /** 当前页数 */
  pageNumber?: number;
  /** 每页数据大小，默认10条数据，最大1000条 */
  pageSize?: number;
}
/**
 * 1、查询微信预约数据
2、接口支持https协议
 */
export interface Apidd1cResponse {
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
  /** 频道名称 */
  channelName?: string;
  /** 用户Id（微信openId） */
  openId?: string;
  /** 预约时间，13位毫秒级时间戳 */
  createdTime?: number;
}
/**
 * 1、查询频道字幕配置信息
2、接口支持https协议
 */
export interface Api7c1cRequest {
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
 * 1、查询频道字幕配置信息
2、接口支持https协议
 */
export interface Api7c1cResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为字幕设置信息 【详见[data字段说明](/live/api/v4/channel/get_subtitle.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、查询实时字幕语言类型枚举
2、接口支持https协议
 */
export interface Api6566Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询实时字幕语言类型枚举
2、接口支持https协议
 */
export interface Api6566Response {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为字幕语言列表 【详见[data字段说明](/live/api/v4/channel/get_subtitle.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、修改频道字幕配置信息
2、接口支持https协议
 */
export interface Api7c1cRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、修改频道字幕配置信息
2、接口支持https协议
 */
export interface Api7c1cResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/live/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求失败时为空，请求成功时为字幕设置信息 【详见[data字段说明](/live/api/v4/channel/get_subtitle.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、创建任务奖励活动
2、接口支持https协议
 */
export interface Api7c95Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、创建任务奖励活动
2、接口支持https协议
 */
export interface Api7c95Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 任务奖励活动id */
  data?: number;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * tasks nested object
 */
export interface tasks {
  /** 排序 */
  sort?: number;
  /** 达成条件设置 【详见[reachCondition](#reachCondition参数描述)】 */
  reachCondition?: Record<string, unknown>;
  /** 奖励设置 */
  rewardSetting?: Record<string, unknown>;
}
/**
 * reachCondition nested object
 */
export interface reachCondition {
  /** 达成条件（sign：签到，online：在线时长，questionnaire：答题，custom：自定义） */
  _type?: string;
  /** 达成数值 */
  amount?: number;
  /** 题目ID，达成条件为questionnaire时必传 */
  templateId?: number;
  /** 自定义任务事件，达成条件为custom时必传 */
  customEvent?: string;
  /** 自定义任务名 */
  customEventName?: string;
  /** 自定义任务图标 */
  customIcon?: string;
  /** 自定义任务单位 */
  customUnit?: string;
  /** 自定义任务按钮文案 */
  customButtonText?: string;
  /** 自定义任务达成文案，eg: {customEventName}完成：{amount}{customUnit} */
  customReachText?: string;
}
/**
 * rewardSetting nested object
 */
export interface rewardSetting {
  /** cash:现金,custom:自定义,nothing:无奖励,externalPoint:外部积分 */
  _type?: string;
  /** 奖励数值（type为cash时，现金单位是分；type为cash、externalPoint时需要传） */
  amount?: number;
  /** 奖励设置 */
  limit?: number;
  /** 自定义奖励，非必填 */
  customReward?: string;
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
 * 1、删除任务奖励活动
2、接口支持https协议
 */
export interface Api7c95Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 活动id */
  activityId: number;
}
/**
 * 1、删除任务奖励活动
2、接口支持https协议
 */
export interface Api7c95Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、查询任务奖励活动分页列表
2、接口支持https协议
 */
export interface Api5745Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道id */
  channelId: number;
  /** 页面大小（默认10，最大1000） */
  pageSize?: number;
  /** 页码（目前限制最大值1000页） */
  pageNumber?: number;
}
/**
 * 1、查询任务奖励活动分页列表
2、接口支持https协议
 */
export interface Api5745Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 任务奖励活动分页数据【详见[Data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * data nested object
 */
export interface data {
  /** 页码 */
  pageNumber?: number;
  /** 分页大小 */
  pageSize?: string;
  /** 总分页数量 */
  totalPages?: boolean;
  /** 总记录数 */
  totalItems?: Record<string, unknown>;
  /** 活动数据列表【详见[Contents字段说明](#contents参数描述)】 */
  contents?: unknown;
}
/**
 * contents nested object
 */
export interface contents {
  /** 频道id */
  channelId?: number;
  /** 活动id */
  activityId?: number;
  /** 活动名称，最大长度64个字符 */
  activityName?: string;
  /** 活动状态：0：已结束，1：未开始，2：进行中 */
  status?: number;
  /** 任务规则：1：解锁任务，2：并行任务 */
  taskRule?: number;
  /** 活动开始时间 */
  startTime?: number;
  /** 活动结束时间 */
  endTime?: number;
  /** 任务规则列表 【详见[tasks字段说明](#tasks参数描述)】 */
  tasks?: unknown;
}
/**
 * tasks nested object
 */
export interface tasks {
  /** 排序 */
  sort?: number;
  /** 达成条件设置 【详见[reachCondition](#reachCondition参数描述)】 */
  reachCondition?: Record<string, unknown>;
  /** 奖励设置 */
  rewardSetting?: Record<string, unknown>;
}
/**
 * reachCondition nested object
 */
export interface reachCondition {
  /** 达成条件（sign：签到，online：在线时长，questionnaire：答题，custom：自定义） */
  _type?: string;
  /** 达成数值 */
  amount?: number;
  /** 题目ID，达成条件为questionnaire时必传 */
  templateId?: number;
  /** 自定义任务事件，达成条件为custom时必传 */
  customEvent?: string;
  /** 自定义任务名 */
  customEventName?: string;
  /** 自定义任务图标 */
  customIcon?: string;
  /** 自定义任务单位 */
  customUnit?: string;
  /** 自定义任务按钮文案 */
  customButtonText?: string;
  /** 自定义任务达成文案，eg: {customEventName}完成：{amount}{customUnit} */
  customReachText?: string;
}
/**
 * rewardSetting nested object
 */
export interface rewardSetting {
  /** cash:现金,custom:自定义,nothing:无奖励,externalPoint:外部积分 */
  _type?: string;
  /** 奖励数值（type为cash时，现金单位是分） */
  amount?: number;
  /** 奖励设置 */
  limit?: number;
  /** 自定义奖励，非必填 */
  customReward?: string;
}
/**
 * error nested object
 */
export interface error {
  /** 错误代码，用于确定具体的错误原因 */
  code?: number;
  /** 错误描述，与 error.code 对应 */
  desc?: string;
}
/**
 * 1、查询任务奖励活动统计数据分页列表
2、接口支持https协议
 */
export interface Api5807Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道id */
  channelId: number;
  /** 页面大小（默认10，最大1000） */
  pageSize?: number;
  /** 页码（目前限制最大值1000页） */
  pageNumber?: number;
}
/**
 * 1、查询任务奖励活动统计数据分页列表
2、接口支持https协议
 */
export interface Api5807Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 任务奖励活动分页数据【详见[Data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * data nested object
 */
export interface data {
  /** 页码 */
  pageNumber?: number;
  /** 分页大小 */
  pageSize?: string;
  /** 总分页数量 */
  totalPages?: boolean;
  /** 总记录数 */
  totalItems?: Record<string, unknown>;
  /** 活动数据列表【详见[Contents字段说明](#contents参数描述)】 */
  contents?: unknown;
}
/**
 * contents nested object
 */
export interface contents {
  /** 频道id */
  channelId?: number;
  /** 活动id */
  activityId?: number;
  /** 活动名称，最大长度64个字符 */
  activityName?: string;
  /** 任务规则：1：解锁任务，2：并行任务 */
  taskRule?: number;
  /** 活动开始时间 */
  startTime?: number;
  /** 活动结束时间 */
  endTime?: number;
  /** 参与任务人数 */
  participantTask?: number;
  /** 达成所有任务人数 */
  reachAllTask?: number;
  /** 领取所有奖励人数 */
  reachAllReward?: number;
}
/**
 * error nested object
 */
export interface error {
  /** 错误代码，用于确定具体的错误原因 */
  code?: number;
  /** 错误描述，与 error.code 对应 */
  desc?: string;
}
/**
 * 1、提前结束正在进行中的任务奖励活动
2、接口支持https协议
 */
export interface Api5592Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 活动id */
  activityId: number;
}
/**
 * 1、提前结束正在进行中的任务奖励活动
2、接口支持https协议
 */
export interface Api5592Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、观众提交任务奖励表单
2、接口支持https协议
 */
export interface Api20f4Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、观众提交任务奖励表单
2、接口支持https协议
 */
export interface Api20f4Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 任务奖励活动id */
  data?: number;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * formInfo nested object
 */
export interface formInfo {
  /** 类型, userName:姓名、userPhone:手机号、custom:自定义 */
  _type?: string;
  /** 字段名 */
  field?: string;
  /** 填写内容 */
  value?: string;
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
 * 1、修改任务奖励活动
2、接口支持https协议
 */
export interface Api7c95Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、修改任务奖励活动
2、接口支持https协议
 */
export interface Api7c95Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 任务奖励活动是否修改成功 */
  data?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * tasks nested object
 */
export interface tasks {
  /** 排序 */
  sort?: number;
  /** 达成条件设置 【详见[reachCondition](#reachCondition参数描述)】 */
  reachCondition?: Record<string, unknown>;
  /** 奖励设置 【详见[rewardSetting](#rewardSetting参数描述)】 */
  rewardSetting?: Record<string, unknown>;
}
/**
 * reachCondition nested object
 */
export interface reachCondition {
  /** 达成条件（sign：签到，online：在线时长，questionnaire：答题，custom：自定义） */
  _type?: string;
  /** 达成数值 */
  amount?: number;
  /** 题目ID，达成条件为questionnaire时必传 */
  templateId?: number;
  /** 自定义任务事件，达成条件为custom时必传 */
  customEvent?: string;
  /** 自定义任务名 */
  customEventName?: string;
  /** 自定义任务图标 */
  customIcon?: string;
  /** 自定义任务单位 */
  customUnit?: string;
  /** 自定义任务按钮文案 */
  customButtonText?: string;
  /** 自定义任务达成文案，eg: {customEventName}完成：{amount}{customUnit} */
  customReachText?: string;
}
/**
 * rewardSetting nested object
 */
export interface rewardSetting {
  /** cash:现金,custom:自定义,nothing:无奖励,externalPoint:外部积分 */
  _type?: string;
  /** 奖励数值（type为cash时，现金单位是分；type为cash、externalPoint时需要传） */
  amount?: number;
  /** 奖励限制份额（-1不限制） */
  limit?: number;
  /** 自定义奖励内容，非必填 */
  customReward?: string;
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
 * 1、查询任务奖励活动观众奖励明细分页列表
2、接口支持https协议
 */
export interface Api49d9Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道id */
  channelId: number;
  /** 活动id */
  activityId: number;
  /** 观众id */
  viewerId?: string;
  /** 页面大小（默认10，最大1000） */
  pageSize?: number;
  /** 页码（目前限制最大值1000页） */
  pageNumber?: number;
}
/**
 * 1、查询任务奖励活动观众奖励明细分页列表
2、接口支持https协议
 */
export interface Api49d9Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 观众任务奖励明细【详见[Data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * data nested object
 */
export interface data {
  /** 页码 */
  pageNumber?: number;
  /** 分页大小 */
  pageSize?: string;
  /** 总分页数量 */
  totalPages?: boolean;
  /** 总记录数 */
  totalItems?: Record<string, unknown>;
  /** 活动数据列表【详见[Contents字段说明](#contents参数描述)】 */
  contents?: unknown;
}
/**
 * contents nested object
 */
export interface contents {
  /** 频道id */
  channelId?: number;
  /** 活动id */
  activityId?: number;
  /** 观众id */
  viewerId?: string;
  /** 任务id */
  taskId?: number;
  /** 排序 */
  sort?: number;
  /** 达成状态（0：未达成，1：已达成） */
  taskStatus?: number;
  /** 奖励发放状态（-1：无需发放，0：待发放，1：已发放，2：名额已满，3：发放失败，4：发放中） */
  rewardStatus?: number;
  /** 达成时间 */
  finishTime?: number;
  /** 达成条件 【详见[taskReach字段说明](#taskReach参数描述)】 */
  taskReach?: Record<string, unknown>;
  /** 奖励数据 【详见[taskReward字段说明](#taskReward参数描述)】 */
  taskReward?: Record<string, unknown>;
}
/**
 * taskReach nested object
 */
export interface taskReach {
  /** 达成条件（sign：签到，online：在线时长） */
  _type?: string;
  /** 达成数值 */
  amount?: number;
}
/**
 * taskReward nested object
 */
export interface taskReward {
  /** cash:现金,custom:自定义,nothing:无奖励,externalPoint:外部积分 */
  _type?: string;
  /** 奖励数值（type为cash时，现金单位是分） */
  amount?: number;
  /** 奖励限制份额 */
  limit?: number;
  /** 自定义奖励，非必填 */
  customReward?: string;
}
/**
 * error nested object
 */
export interface error {
  /** 错误代码，用于确定具体的错误原因 */
  code?: number;
  /** 错误描述，与 error.code 对应 */
  desc?: string;
}
/**
 * 1、观众查询奖励明细分页列表
2、接口支持https协议
 */
export interface Api3ea2Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 观众id */
  viewerId: string;
  /** 页面大小（默认10，最大1000） */
  pageSize?: number;
  /** 页码（目前限制最大值1000页） */
  pageNumber?: number;
}
/**
 * 1、观众查询奖励明细分页列表
2、接口支持https协议
 */
export interface Api3ea2Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 观众任务奖励明细【详见[Data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * data nested object
 */
export interface data {
  /** 页码 */
  pageNumber?: number;
  /** 分页大小 */
  pageSize?: string;
  /** 总分页数量 */
  totalPages?: boolean;
  /** 总记录数 */
  totalItems?: Record<string, unknown>;
  /** 活动数据列表【详见[Contents字段说明](#contents参数描述)】 */
  contents?: unknown;
}
/**
 * contents nested object
 */
export interface contents {
  /** 频道id */
  channelId?: number;
  /** 活动id */
  activityId?: number;
  /** 观众id */
  viewerId?: string;
  /** 任务id */
  taskId?: number;
  /** 排序 */
  sort?: number;
  /** 达成状态（0：未达成，1：已达成） */
  taskStatus?: number;
  /** 奖励发放状态（-1：无需发放，0：待发放，1：已发放，2：名额已满，3：发放失败，4：发放中） */
  rewardStatus?: number;
  /** 达成时间 */
  finishTime?: number;
  /** 达成条件 【详见[taskReach字段说明](#taskReach参数描述)】 */
  taskReach?: Record<string, unknown>;
  /** 奖励数据 【详见[taskReward字段说明](#taskReward参数描述)】 */
  taskReward?: Record<string, unknown>;
  /** 领取信息 【详见[acceptInfo字段说明](#acceptInfo参数描述)】 */
  acceptInfo?: Record<string, unknown>;
}
/**
 * taskReach nested object
 */
export interface taskReach {
  /** 达成条件（sign：签到，online：在线时长） */
  _type?: string;
  /** 达成数值 */
  amount?: number;
}
/**
 * taskReward nested object
 */
export interface taskReward {
  /** cash:现金,custom:自定义,nothing:无奖励,externalPoint:外部积分 */
  _type?: string;
  /** 奖励数值（type为cash时，现金单位是分） */
  amount?: number;
  /** 奖励限制份额 */
  limit?: number;
  /** 自定义奖励，非必填 */
  customReward?: string;
}
/**
 * acceptInfo nested object
 */
export interface acceptInfo {
  /** 自定义领取信息（Y:开启，N:关闭） */
  activeAcceptEnabled?: string;
  /** 领取方式（form,link,qrCode） */
  acceptType?: string;
  /** 是否已领取（Y:是，N:否） */
  received?: string;
  /** 领取表单信息【详见[formInfo字段说明](#formInfo参数描述)】 */
  formInfo?: unknown;
  /** 跳转链接 */
  prizeUrl?: string;
  /** 二维码链接 */
  qrCode?: string;
  /** 二维码提示 */
  qrCodeTips?: string;
}
/**
 * formInfo nested object
 */
export interface formInfo {
  /** 类型, userName:姓名、userPhone:手机号、custom:自定义 */
  _type?: string;
  /** 字段名 */
  field?: string;
  /** 提示语 */
  tips?: string;
  /** 是否必填，true/false */
  required?: boolean;
  /** 填写内容 */
  value?: string;
}
/**
 * error nested object
 */
export interface error {
  /** 错误代码，用于确定具体的错误原因 */
  code?: number;
  /** 错误描述，与 error.code 对应 */
  desc?: string;
}
/**
 * 1、修改频道设置
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api4789Request {
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
 * 1、修改频道设置
2、（channelId, timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api4789Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功或失败均返回null */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、查询时间内直播场次数据
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递
3、接口支持https协议
 */
export interface Api7027Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 开始时间，13位时间戳 */
  startTime?: number;
  /** 结束时间，13位时间戳 */
  endTime?: number;
  /** 当前页数 */
  pageNumber?: number;
  /** 每页数据大小，默认10条数据，最大值不能超过1000 */
  pageSize?: number;
}
/**
 * 1、查询时间内直播场次数据
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递
3、接口支持https协议
 */
export interface Api7027Response {
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
  /** 频道ID */
  channelId?: number;
  /** 直播场次ID */
  sessionId?: string;
  /** 场次名称 */
  name?: string;
  /** 直播开始时间，13位时间戳 */
  startTime?: number;
  /** 直播结束时间，13位时间戳 */
  endTime?: number;
  /** 直播账号ID */
  userId?: string;
}
/**
 * 1、频道观看页观众退出登录
2、接口支持https协议
 */
export interface Api5186Request {
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
 * 1、频道观看页观众退出登录
2、接口支持https协议
 */
export interface Api5186Response {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
  /** 响应数据对象 */
  data?: Record<string, unknown>;
  /** 错误信息 */
  error?: Record<string, unknown>;
}
/**
 * 1、批量设置签到功能
2、接口支持https协议
 */
export interface Api4d0fRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、批量设置签到功能
2、接口支持https协议
 */
export interface Api4d0fResponse {
  code?: number;
  status?: string;
  requestId?: string;
  error?: unknown;
  data?: boolean;
}
/**
 * 1、发布频道公告

2、接口支持https协议
 */
export interface Api2784Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 公告内容 */
  content: string;
  /** 是否置顶，值为Y/N，默认N */
  isTop?: string;
  /** 是否弹窗，值为Y/N，默认N */
  isPop?: string;
}
/**
 * 1、发布频道公告

2、接口支持https协议
 */
export interface Api2784Response {
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
 * Error nested object
 */
export interface Error {
  /** 错误代码，用于确定具体的错误原因 */
  code?: number;
  /** 错误描述，与 error.code 对应 */
  desc?: string;
}
/**
 * 1、清空频道公告信息

2、接口支持https协议
 */
export interface Api26c3Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
}
/**
 * 1、清空频道公告信息

2、接口支持https协议
 */
export interface Api26c3Response {
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
 * Error nested object
 */
export interface Error {
  /** 错误代码，用于确定具体的错误原因 */
  code?: number;
  /** 错误描述，与 error.code 对应 */
  desc?: string;
}
/**
 * 1、查询频道公告列表

2、接口支持https协议
 */
export interface Api7021Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 当前页码 */
  pageNumber: number;
  /** 分页大小 */
  pageSize: number;
  /** 根据创建时间排序，createTime:asc 升序，createTime:desc 降序 */
  sort?: string;
}
/**
 * 1、查询频道公告列表

2、接口支持https协议
 */
export interface Api7021Response {
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
  contents?: unknown;
}
/**
 * Contents nested object
 */
export interface Contents {
  /** 公告ID */
  id?: number;
  /** 公告内容 */
  content?: string;
  /** 是否置顶 : 0-否，1-是 */
  isTop?: number;
  /** 是否弹窗 : 0-否，1-是 */
  isPop?: number;
  /** 是否可关闭 : 0-否，1-是 */
  canClose?: number;
  /** 创建时间 */
  createTime?: number;
  /** 用户昵称 */
  nick?: string;
  /** 用户头像 */
  pic?: string;
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
 * 1、查询频道问答列表

2、接口支持https协议
 */
export interface Api7027Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 当前页码 */
  pageNumber: number;
  /** 分页大小 */
  pageSize: number;
}
/**
 * 1、查询频道问答列表

2、接口支持https协议
 */
export interface Api7027Response {
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
  contents?: unknown;
}
/**
 * Contents nested object
 */
export interface Contents {
  /** 问答ID */
  id?: number;
  /** 场次ID */
  sessionId?: string;
  /** 观众ID */
  viewerId?: string;
  /** 问题状态，0-未处理，1-暂不回复，10-已回复 */
  status?: number;
  /** 问题内容 */
  content?: string;
  /** 回答列表【详见[QAAnswer参数描述](#QAAnswer)】 */
  answers?: unknown;
  /** 创建时间 */
  createTime?: number;
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
 * 1、查询频道的虚拟人数设置
2、接口支持https协议
 */
export interface Apiabd8Request {
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
 * 1、查询频道的虚拟人数设置
2、接口支持https协议
 */
export interface Apiabd8Response {
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
  /** 频道号 */
  channelId?: number;
  /** 聊天室显示虚拟人数 */
  robotNumber?: number;
  /** 人数显示模式<br/>timely：立即生效<br/>fixed_time：分时生效 */
  addRobotModel?: string;
  /** 虚拟预约人数 */
  virtualBookingNumber?: number;
  /** 生效时间，单位毫秒 */
  changeTime?: number;
  /** 距离下次可设置时间，单位毫秒 */
  leftTime?: number;
}
/**
 * 1、查询虚拟人数统计情况
2、接口支持https协议
 */
export interface Apiabd6Request {
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
 * 1、查询虚拟人数统计情况
2、接口支持https协议
 */
export interface Apiabd6Response {
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
  /** 真实人数 */
  realViewerCount?: number;
  /** 虚拟人数 */
  robotCount?: number;
  /** 显示人数 */
  displayCount?: number;
  /** 真实预约人数 */
  realSubscribeCount?: number;
  /** 观看次数 */
  pv?: number;
}
/**
 * 1、设置虚拟人数分时生效后停止虚拟人数增加
2、接口支持https协议
 */
export interface Api49c0Request {
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
 * 1、设置虚拟人数分时生效后停止虚拟人数增加
2、接口支持https协议
 */
export interface Api49c0Response {
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
  /** 成功响应时返回null */
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
 * 1、设置频道虚拟人数及自定义虚拟人列表
2、接口支持https协议
 */
export interface Api3838Request {
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
 * 1、设置频道虚拟人数及自定义虚拟人列表
2、接口支持https协议
 */
export interface Api3838Response {
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
  /** 成功响应时返回null */
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
 * 1、设置频道虚拟人数
2、接口支持https协议
 */
export interface Api7798Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 聊天室显示虚拟人数 */
  robotNumber: number;
  /** 人数显示模式<br/>timely：立即生效<br/>fixed_time：分时生效 */
  addRobotModel: string;
  /** 生效时间，addRobotModel为fixed_time分时生效时必填，单位秒，最小值为20（20秒），最大值为18000（300分钟） */
  changeTime?: number;
  /** 虚拟预约人数 */
  virtualBookingNumber?: number;
}
/**
 * 1、设置频道虚拟人数
2、接口支持https协议
 */
export interface Api7798Response {
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
  /** 成功响应时返回null */
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
 * 1、发送聊天室自定义消息
2、接口支持https协议
 */
export interface Api1db4Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 发送文字内容，最大长度1000个字符，如果存在特殊字符，需经过urlEncode，<span class="error">不需要进行base64编码</span> */
  content?: string;
  /** 发送的图片url地址 */
  imgUrl?: string;
  /** 是否加入聊天历史数据，默认为1<br/>1：加入到聊天历史数据<br/>0：不加入 */
  joinHistoryList?: number;
  /** 此消息面向何种角色发送（默认为1，支持多选，如：4,5）<br/> 1：面向频道所有角色<br/>2：仅面向频道内观众角色<br/>3：仅面向特殊角色（讲师、嘉宾、助教、管理员）<br/>4：讲师<br/>5：嘉宾<br/>6：助教<br/> 7：管理员 */
  watchType?: number;
  /** 是否为重要消息，默认为N<br/>Y：重要消息<br/>N：普通消息。<br/><code style="color:red">当important为Y时，接口请求频率被限制频道每分钟最多请求30次，并保证消息不会丢失以及严重的延时。 </code> */
  important?: string;
}
/**
 * 1、发送聊天室自定义消息
2、接口支持https协议
 */
export interface Api1db4Response {
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
  /** 成功响应时返回null */
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
 * 1、发送聊天室自定义消息
2、接口支持https协议
 */
export interface Api1db4Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道号 */
  channelId: string;
  /** 发送文字内容，需要进行URL安全的base64编码，编码后最大长度1500个字符 */
  content?: string;
  /** 发送的图片url地址 */
  imgUrl?: string;
  /** 是否加入聊天历史数据，默认为1<br/>1：加入到聊天历史数据<br/>0：不加入 */
  joinHistoryList?: number;
  /** 此消息面向何种角色发送（默认为1）<br/>1：面向频道所有角色<br/>2：仅面向频道内观众角色<br/>3：仅面向特殊角色（讲师、嘉宾、助教、管理员） */
  watchType?: number;
}
/**
 * 1、发送聊天室自定义消息
2、接口支持https协议
 */
export interface Api1db4Response {
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
  /** 成功响应时返回null */
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
 * 1、查询默认模板-观看条件
2、接口支持https协议
 */
export interface Api2ad8Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
}
/**
 * 1、查询默认模板-观看条件
2、接口支持https协议
 */
export interface Api2ad8Response {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 成功响应的数据【详见[Data参数描述](#Data参数描述)】 */
  data?: unknown;
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
  /** 授权开关，Y：开启，N：关闭 */
  authEnabled?: string;
  /** 授权类型<br/>none：无限制 <br/>code：验证码观看 <br/>pay：付费观看<br/>phone：白名单观看<br/>info：登记观看<br/>custom：自定义授权观看<br/>external：外部授权观看<br/>direct：独立授权观看 */
  authType?: string;
  /** authType为none时对应的值，public-公开观看，wx-微信授权 */
  subAuthType?: string;
  /** 当authType为phone时使用，白名单入口文本，最大长度64 */
  whiteListEntryText?: string;
  /** 当authType为phone时使用，白名单输入提示，最大长度64 */
  whiteListInputTips?: string;
  /** 当authType为phone时使用，白名单欢迎标题，最大长度64 */
  authTips?: string;
  /** 当authType为pay时使用，付费观看欢迎标题，最大长度64 */
  payAuthTips?: string;
  /** 当authType为pay时使用，观看价格 */
  price?: number;
  /** 当authType为pay时使用，允许试看开关 */
  trialWatchEnabled?: string;
  /** 当authType为pay时使用，试看结束时间 */
  trialWatchEndTime?: string;
  /** 当authType为pay时使用，试看时长，单位分钟 */
  trialWatchTime?: number;
  /** 当authType为pay时使用，观看有效时长 */
  validTimePeriod?: number;
  /** 当authType为pay时使用，观看结束时间 */
  watchEndTime?: string;
  /** 当authType为code时使用，验证码，最大长度64 */
  authCode?: string;
  /** 当authType为code时使用，验证码欢迎标题，最大长度64 */
  codeAuthTips?: string;
  /** 当authType为code时使用，验证码公众号二维码，最大长度256 */
  qcodeImg?: string;
  /** 当authType为code时使用，验证码提示文案，最大长度256 */
  qcodeTips?: string;
  /** 当authType为info时使用，登记观看欢迎标题，最大长度64 */
  infoAuthTips?: string;
  /** 当authType为info时使用，登记观看提示信息，最大长度64 */
  infoDesc?: string;
  /** 当authType为info时使用，登记观看信息，最多10条【详见[InfoFields参数描述](#InfoFields参数描述)】 */
  infoFields?: unknown;
  /** 当authType为custom时使用，自定义授权Key，最大长度64 */
  customKey?: string;
  /** 当authType为custom时使用，自定义授权Url，最大长度128 */
  customUri?: string;
  /** 当authType为external时使用，外部授权入口文本，最大长度24 */
  externalEntryText?: string;
  /** 当authType为external时使用，外部授权Key，最大长度64 */
  externalKey?: string;
  /** 当authType为external时使用，外部授权调整Url，最大长度350 */
  externalRedirectUri?: string;
  /** 当authType为external时使用，外部授权Url，最大长度128 */
  externalUri?: string;
  /** 当authType为direct时使用，独立授权Key，最大长度64 */
  directKey?: string;
  /** 当authType为code、phone、info时使用，隐私声明数据，[{"authType":"phone" , "status":"Y" , "content":"隐私声明"}]【详见[PrivacyParam参数描述](#PrivacyParam参数描述)】 */
  privacyParam?: unknown;
  /** 当authType为phone时使用，到课名单开关，Y：开启，N：关闭 */
  expectedArrivalEnabled?: string;
  /** 白名单不允许重复使用，默认为N，Y:是、N:否 */
  onceWhitelistEnabled?: string;
}
/**
 * PrivacyParam nested object
 */
export interface PrivacyParam {
  /** 授权类型<br/>code：验证码观看 <br/>pay：付费观看<br/>phone：白名单观看<br/>info：登记观看<br/>custom：自定义授权观看<br/>external：外部授权观看<br/>direct：独立授权观看 */
  authType?: string;
  /** 频道号 */
  channelId?: number;
  /** 隐私声明内容 */
  content?: string;
  /** 隐私声明开关，Y：开启，N：关闭 */
  status?: string;
}
/**
 * InfoFields nested object
 */
export interface InfoFields {
  /** 信息标题 */
  name?: string;
  /** 选项 */
  options?: string;
  /** 信息描述 */
  placeholder?: string;
  /** 短信验证，Y：开启，N：关闭 */
  smsEnabled?: string;
  /** 类型,<br/>name：姓名，<br/>text：文本，<br/>mobile：手机号，<br/>number：数字，<br/>option：下拉选项 */
  _type?: string;
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
 * 1、修改默认模板-观看条件
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api2ad8Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
}
/**
 * 1、修改默认模板-观看条件
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api2ad8Response {
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
 * InfoFields nested object
 */
export interface InfoFields {
  /** 登记信息名，最多为8字符 */
  name?: string;
  /** 当authType为info时，设置参数，非必填。下拉选项时，下拉的选项值，以英文逗号分割。选项个数上限为8个；选项内容最多为8字符 */
  options?: string;
  /** 文本框输入提示，最多为8字符 */
  placeholder?: string;
  /** 短信验证，Y：开启，N：关闭 */
  smsEnabled?: string;
  /** 当authType为info时，非必填，登记类型，<br/>name：姓名，<br/>text：文本，<br/>mobile：手机号，<br/>number：数字，<br/>option：下拉选项 */
  _type?: string;
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
 * 1、查询观看页默认模板设置
2、接口支持https协议
 */
export interface Api11e4Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
}
/**
 * 1、查询观看页默认模板设置
2、接口支持https协议
 */
export interface Api11e4Response {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 模板-观看页设置响应对象【详见[Data参数描述](#Data参数描述)】 */
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
  /** 自动播放开关，Y：开启，N：关闭 */
  autoPlayEnabled?: string;
  /** 弹幕开关，Y：开启，N：关闭 */
  barrageEnabled?: string;
  /** 弹幕速度，340：缓慢，270：较慢，200：标准，130：较快，60：快速 */
  barrageSpeed?: string;
  /** 微信预约功能开关，Y：开启，N：关闭 */
  bookingEnabled?: string;
  /** 观看页开关，Y：不显示观看页（仅允许集成SDK观看），N：显示观看页 */
  closePreviewEnabled?: string;
  /** flash播放器开关，Y：开启，N：关闭 */
  flashPlayerEnabled?: string;
  /** 禁止Firefox开关，Y：开启，N：关闭 */
  forbidFirefoxEnabled?: string;
  /** 音视频切换开关，Y：开启，N：关闭 */
  mobileAudioEnabled?: string;
  /** 观看次数移动端显示位置，player：播放器，desc：直播介绍 */
  mobilePvShowLocation?: string;
  /** 移动观看页开关，Y：开启，N：关闭 */
  mobileWatchEnabled?: string;
  /** 观看次数开关，Y：开启，N：关闭 */
  pvShowEnabled?: string;
  /** 防弹窗播放开关，Y：开启，N：关闭 */
  recordingProtectEnabled?: string;
  /** 回放中显示“下一场次”倒计时 开关值，Y：开启，N：关闭 */
  showCountdownEnabled?: string;
  /** 允许观众切换h5及flash播放器，Y：允许，N：不允许；flash播放器开关为N时，该值不生效 */
  switchPlayerEnabled?: string;
  /** 观众实名认证开关，Y：开启，N：关闭 */
  viewerVerificationEnabled?: string;
  /** 观众投诉开关，Y：开启，N：关闭 */
  watchFeedbackEnabled?: string;
  /** 观看页语言，zh_CN：中文，en：英文，follow_browser：跟随浏览器 */
  watchLangType?: string;
  /** 观看页布局，ppt文档为主、video视频为主、only-video仅视频、followTeacher跟随讲师 */
  watchLayout?: string;
  /** 小窗播放开关，Y：开启，N：关闭 */
  pictureInPictureEnabled?: string;
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
 * 1、修改观看页默认模板设置
2、接口支持https协议
 */
export interface Api11e4Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
  /** 自动播放开关，Y：开启，N：关闭 */
  autoPlayEnabled?: string;
  /** 弹幕开关，Y：开启，N：关闭 */
  barrageEnabled?: string;
  /** 弹幕速度，340：缓慢，270：较慢，200：标准，130：较快，60：快速 */
  barrageSpeed?: string;
  /** 微信预约功能开关，Y：开启，N：关闭 */
  bookingEnabled?: string;
  /** 观看页开关，Y：不显示观看页（仅允许集成SDK观看），N：显示观看页 */
  closePreviewEnabled?: string;
  /** flash播放器开关，Y：开启，N：关闭 */
  flashPlayerEnabled?: string;
  /** 禁止Firefox开关，Y：开启，N：关闭 */
  forbidFirefoxEnabled?: string;
  /** 音视频切换开关，Y：开启，N：关闭 */
  mobileAudioEnabled?: string;
  /** 观看次数移动端显示位置，player：播放器，desc：直播介绍 */
  mobilePvShowLocation?: string;
  /** 移动观看页开关，Y：开启，N：关闭 */
  mobileWatchEnabled?: string;
  /** 观看次数开关，Y：开启，N：关闭 */
  pvShowEnabled?: string;
  /** 防弹窗播放开关，Y：开启，N：关闭 */
  recordingProtectEnabled?: string;
  /** 回放中显示“下一场次”倒计时 开关值，Y：开启，N：关闭 */
  showCountdownEnabled?: string;
  /** 允许观众切换h5及flash播放器，Y：允许，N：不允许；flash播放器开关为N时，该值不生效 */
  switchPlayerEnabled?: string;
  /** 观众实名认证开关，Y：开启，N：关闭 */
  viewerVerificationEnabled?: string;
  /** 观众投诉开关，Y：开启，N：关闭 */
  watchFeedbackEnabled?: string;
  /** 观看页语言，zh_CN：中文，en：英文，follow_browser：跟随浏览器 */
  watchLangType?: string;
  /** 观看页布局，ppt文档为主、video视频为主、only-video仅视频、followTeacher跟随讲师 */
  watchLayout?: string;
  /** 小窗播放开关，Y：开启，N：关闭 */
  pictureInPictureEnabled?: string;
}
/**
 * 1、修改观看页默认模板设置
2、接口支持https协议
 */
export interface Api11e4Response {
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
 * Error nested object
 */
export interface Error {
  /** 错误代码，用于确定具体的错误原因 */
  code?: number;
  /** 错误描述，与 error.code 对应 */
  desc?: string;
}
/**
 * 1、集团账号查询主账号账单
2、接口支持https协议
 */
export interface Api13efRequest {
  /** 集团主账号appId【详见[集团账号2.0获取密钥](/live/api/getGroupSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 账期，格式yyyyMM，比如202205，时间需要在202204以后 */
  billingDate: string;
  /** 每页数据大小，默认10，最大值1000 */
  pageSize?: number;
  /** 当前的页数，默认1 */
  pageNumber?: number;
}
/**
 * 1、集团账号查询主账号账单
2、接口支持https协议
 */
export interface Api13efResponse {
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
  /** 账单列表【详见[data字段说明](#data参数描述)】 */
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
 * Data nested object
 */
export interface Data {
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
 * Contents nested object
 */
export interface Contents {
  /** 集团主帐号ID */
  unionId?: string;
  /** 账期 */
  accountPeriod?: string;
  /** 产品 云直播/云点播 */
  production?: string;
  /** 用量类型<br/>云直播：观看分钟数/连麦分钟数/无延迟分钟数/导播时长<br/>云点播：视频播放/存储空间 */
  category?: string;
  /** 用量 */
  itemConsumed?: number;
  /** 用量单位 */
  itemConsumedUnit?: string;
  /** 结算日期，天，格式为yyyy-MM-dd */
  statAt?: string;
  /** 交易类型<br/>1：用量结算<br/>2：金额结算<br/>3：补扣调账<br/>4：退费调账 */
  tradeType?: number;
}
/**
 * 1、集团账号给分账号分配资源之后，能够通过接口获取分账号的资源
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api277bRequest {
  /** 集团主账号appId【详见[集团账号2.0获取密钥](/live/api/getGroupSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、集团账号给分账号分配资源之后，能够通过接口获取分账号的资源
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api277bResponse {
  email?: unknown;
  note?: unknown;
  depositTime?: unknown;
  /** balance:金额<br/>minutes:直播分钟数<br/>parallelConcurrent:直播并行并发<br/>totalConcurrent:直播累计并发<br/>channels:直播频道数<br/>linkMicDuration:连麦分钟数<br/>guideDuration:导播台分钟数<br/>vodFlow:点播流量<br/>vodSpace:点播空间<br/>groupUserCount:分帐号数量 */
  resourceCode?: unknown;
  /** 0：分配<br />1：回收<br />2：到期清零 */
  alterationType?: unknown;
  /** 点播流量、点播空间传GB */
  alteration?: unknown;
  pageNumber?: unknown;
  pageSize?: unknown;
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
 * 1、集团账号查询分账号账单统计列表
2、接口支持https协议
 */
export interface Api33dcRequest {
  /** 集团主账号appId【详见[集团账号2.0获取密钥](/live/api/getGroupSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 查询账期的开始时间，格式yyyyMM，比如202205，时间需要在202204以后 */
  startDate: string;
  /** 查询账期的结束时间，格式yyyyMM，比如202205，时间需要在202204以后 */
  endDate: string;
  /** 分账号邮箱 */
  email?: string;
  /** 每页数据大小，默认10，最大值1000 */
  pageSize?: number;
  /** 当前的页数，默认1 */
  pageNumber?: number;
}
/**
 * 1、集团账号查询分账号账单统计列表
2、接口支持https协议
 */
export interface Api33dcResponse {
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
  /** 账单列表【详见[data字段说明](#data参数描述)】 */
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
 * Data nested object
 */
export interface Data {
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
 * Contents nested object
 */
export interface Contents {
  /** 集团分帐号ID */
  unionId?: string;
  /** 账期 */
  accountPeriod?: string;
  /** 产品 云直播/云点播 */
  production?: string;
  /** 用量类型<br/>云直播：观看分钟数/连麦分钟数/无延迟分钟数/导播时长<br/>云点播：视频播放/存储空间 等等 */
  category?: string;
  /** 用量 */
  itemConsumed?: number;
  /** 用量单位 */
  itemConsumedUnit?: string;
  /** 结算日期，天，格式为yyyy-MM-dd */
  statAt?: string;
  /** 交易类型<br/>1：用量结算<br/>2：金额结算<br/>3：补扣调账<br/>4：退费调账 */
  tradeType?: number;
}
/**
 * 1、在集团账号2.0后台配置回调地址, 用于接收分账号的用量预警信息(套餐过期, 资源不足...)
 */
export interface Api9808Request {
  /** 公司名称 */
  company: string;
  /** 分账号邮箱 */
  email: string;
  /** 天数. noticeType=day的剩余天数类型的预警会有此值 */
  days?: string;
  /** 比例 （保留小数2位） noticeType=ratio的资源试用比例类型的预警会有此值 */
  ratio?: string;
  /** 金额, 待支付订单提醒有值 */
  amount?: string;
  /** 套餐名, 套餐到期预警会有值 */
  packageName?: string;
  /** 套餐名, 套餐到期预警会有值 */
  minutes?: string;
  /** 套餐名, 套餐到期预警会有值 */
  traffic?: string;
  /** 【详见[noticeCode字段描述](#noticeCode参数描述)】 */
  noticeCode: string;
  /** 【详见[noticeCode字段描述](#noticeCode参数描述)】 */
  noticeName: string;
  /** 【详见[noticeCode字段描述](#noticeCode参数描述)】 */
  noticeType: string;
  /** 过期时间, yyyy-MM-dd格式, 套餐到期类型的预警会有值 */
  time?: string;
}
/**
 * noticeCode nested object
 */
export interface noticeCode {
  /** expire（30,7,3,0天） */
  LIVE_PACKAGE_EXPIRED?: unknown;
  /** ratio（30,20,10,5,0%） */
  LIVE_CDN_MINUTES_INSUFFICIENT?: unknown;
  /** day （10,3,1天） */
  LIVE_CDN_MINUTES_DAY_INSUFFICIENT?: unknown;
  /** ratio（30,20,10,5,0%） */
  LIVE_MIC_AVAILABLE?: unknown;
  /** day  （10,3,1天） */
  LIVE_MIC_DAY?: unknown;
  /** day （10,3,1天） */
  LIVE_GUIDE_DAY?: unknown;
  /** expire （30,7,3,0天） */
  VOD_PACKAGE_EXPIRED?: unknown;
  /** ratio （100,90,80%） */
  VOD_PACKAGE_INSUFFICIENT?: unknown;
  /** null （0%） */
  VOD_FLOW_UNABLE_USE?: unknown;
  /** day （10,3,1天） */
  VOD_FLOW_DAY_INSUFFICIENT?: unknown;
  /** ratio （90,0%） */
  VOD_SPACE_INSUFFICIENT?: unknown;
  /** day （10,3,1天） */
  FINANCE_DAY_INSUFFICIENT?: unknown;
  /** ratio （30,20,10,5,0%） */
  FINANCE_AVAILABLE_INSUFFICIENT?: unknown;
  /** expire （30,7,3,0天） */
  FINANCE_EXPIRE?: unknown;
  /** day （10,3,1天） */
  RESOURCE_POINT_DAY_INSUFFICIENT?: unknown;
  /** ratio （30,20,10,5,0%） */
  RESOURCE_POINT_AVAILABLE_INSUFFICIENT?: unknown;
  /** expire （30,7,3,0天） */
  RESOURCE_POINT_EXPIRE?: unknown;
  /** null（1,7,15天） */
  FINANCE_PENDING_ORDER_REMINDER?: unknown;
  /** ratio （10,0%） */
  FINANCE_CREDIT_AVAILABLE_INSUFFICIENT?: unknown;
  /** number （50,30,10,0个） */
  LIVE_CHANNEL_INSUFFICIENT?: unknown;
  /** day （10,3,1天） */
  LIVE_FLOW_DAY_INSUFFICIENT?: unknown;
  /** ratio  （30,20,10,5,0%） */
  LIVE_FLOW_AVAILABLE_INSUFFICIENT?: unknown;
  /** ratio （0%） */
  LIVE_PEAK_CONCURRENCE_INSUFFICIENT?: unknown;
  /** number（0%） */
  LIVE_PEAK_CONCURRENCE_AVAILABLE?: unknown;
}
/**
 * 1、创建集团分帐号
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api756aRequest {
  /** 集团主账号appId【详见[集团账号2.0获取密钥](/live/api/getGroupSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、创建集团分帐号
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api756aResponse {
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
 * Data nested object
 */
export interface Data {
  /** 应用ID */
  appId?: string;
  /** 应用Secret */
  appSecret?: string;
  /** 用户全局ID */
  userId?: string;
}
/**
 * 1、集团账号查询分账号列表及分账号剩余资源
2、接口支持https协议
 */
export interface Api36b4Request {
  /** 集团主账号appId【详见[集团账号2.0获取密钥](/live/api/getGroupSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 分账号邮箱，多个用英文逗号分隔，最多100个 */
  emails?: string;
  /** 每页数据大小，默认10，最大值100 */
  pageSize?: number;
  /** 当前的页数，默认1 */
  pageNumber?: number;
}
/**
 * 1、集团账号查询分账号列表及分账号剩余资源
2、接口支持https协议
 */
export interface Api36b4Response {
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
  /** 账单列表【详见[data字段说明](#data参数描述)】 */
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
 * Data nested object
 */
export interface Data {
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
 * Contents nested object
 */
export interface Contents {
  /** 用户ID */
  userId?: string;
  /** 分帐号应用ID */
  appId?: string;
  /** 分帐号应用secret */
  appSecret?: string;
  /** 分帐号邮箱 */
  email?: string;
  /** 剩余金额 */
  balance?: string;
  /** 手机号码 */
  phone?: string;
  /** 备注 */
  memo?: string;
  /** 联系人 */
  contacts?: string;
  /** 云直播计费类型<br/>minutes：分钟数<br/>parallelConcurrent：并行并发<br/>totalConcurrent：累计并发 */
  chargeType?: string;
  /** 云直播剩余资源，并发 */
  remainConcurrent?: number;
  /** 云直播剩余资源，可用直播分钟数 */
  remainMinutes?: number;
  /** 云点播剩余资源，流量(G) */
  remainFlow?: number;
  /** 云点播剩余资源，空间(G) */
  remainSpace?: number;
  /** 到期时间类型<br/>group：跟随主账号<br/>custom：自定义 */
  expireType?: string;
  /** 账号到期时间，十三位时间戳 */
  expireDate?: number;
  /** 状态<br/>normal：正常使用<br/>expired：已过期<br/>frozen：已冻结 */
  status?: string;
  /** 可用连麦分钟数 */
  linkMicMinutes?: number;
  /** 可用云导播台分钟数 */
  guideMinutes?: number;
  /** 可创建频道数 */
  maxChannels?: number;
  /** 连麦人数 */
  linkMicLimit?: number;
  /** 点播secretkey */
  vodSecretKey?: string;
  /** 点播备用secretkey */
  vodBakSecretKey?: string;
  /** 点播writetoken */
  writeToken?: string;
  /** 点播readtoken */
  readToken?: string;
  /** 云直播剩余资源，视频创作可用分钟数 */
  remainAiPptVideoDuration?: number;
  /** 云直播剩余资源，视频创作(含数字人)可用分钟数 */
  remainAiPptVideoWithDigitalHumanDuration?: number;
}
/**
 * 1、分配分帐号资源
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api619dRequest {
  /** 集团主账号appId【详见[集团账号2.0获取密钥](/live/api/getGroupSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、分配分帐号资源
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api619dResponse {
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
  /** 请求成功返回true，请求失败返回空 */
  data?: boolean;
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
 * 1、查询账号下的素材库分类列表
2、接口支持https协议
 */
export interface Api13a0Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 素材类型<br/>video：视频<br/>image：图片<br/>document：文档<br/>text：图文 */
  materialType: string;
  /** 父分类节点id, 此参数用于查询子分类 */
  parentId?: number;
}
/**
 * 1、查询账号下的素材库分类列表
2、接口支持https协议
 */
export interface Api13a0Response {
  /** 响应状态码，200为成功返回，非200为失败 */
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
 * Data nested object
 */
export interface Data {
  /** 分类列表内容【详见[contents字段说明](#contents参数描述)】 */
  contents?: unknown;
}
/**
 * Contents nested object
 */
export interface Contents {
  /** 分类ID */
  id?: number;
  /** 分类名称 */
  title?: string;
  /** 分类类型<br/>DEFAULT：默认分类<br/>CUSTOM：自定义分类<br/>PLAYBACK：视频回放<br/>AI：AI视频<br/>DISK_VIDEO：伪直播视频<br/>TEMP_STORE：临时存储<br/>PRODUCT_EXPLAIN：商品讲解 */
  _type?: string;
  /** 子分类数量 */
  subCount?: number;
}
/**
 * 1、在账号下新增一个素材库标签
2、接口支持https协议
 */
export interface Api7f61Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值，<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、在账号下新增一个素材库标签
2、接口支持https协议
 */
export interface Api7f61Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
  /** 状态码非200时的错误信息【详见[Error字段描述](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 是否新增成功，true 为成功，false 为失败 */
  data?: boolean;
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
 * 1、删除账号下的素材库标签。
2、接口支持https协议
 */
export interface Api13a3Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、删除账号下的素材库标签。
2、接口支持https协议
 */
export interface Api13a3Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
  /** 状态码非200时的错误信息【详见[Error字段描述](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 删除结果，true 表示删除成功 */
  data?: boolean;
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
 * 1、分页查询账号下的素材库标签列表。
2、接口支持https协议
 */
export interface Api46c1Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值，<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 页码 */
  pageNumber: number;
  /** 每页数据大小 */
  pageSize: number;
  /** 关键字查询，支持按标签名称模糊查询 */
  keyword?: string;
}
/**
 * 1、分页查询账号下的素材库标签列表。
2、接口支持https协议
 */
export interface Api46c1Response {
  /** 响应状态码，200为成功返回，非200为失败 */
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
 * Data nested object
 */
export interface Data {
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
 * Contents nested object
 */
export interface Contents {
  /** 标签ID */
  id?: number;
  /** 素材库标签名称 */
  name?: string;
  /** 用户ID */
  userId?: string;
}
/**
 * 1、更新账号下的素材库标签信息。
2、接口支持https协议
 */
export interface Api13a3Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值，<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、更新账号下的素材库标签信息。
2、接口支持https协议
 */
export interface Api13a3Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
  /** 状态码非200时的错误信息【详见[Error字段描述](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 是否更新成功，true 为成功，false 为失败 */
  data?: boolean;
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
 * 1、删除账号下的素材，支持批量删除，支持删除到回收站或彻底删除。
2、接口支持https协议g't
 */
export interface Apif8e3Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、删除账号下的素材，支持批量删除，支持删除到回收站或彻底删除。
2、接口支持https协议g't
 */
export interface Apif8e3Response {
  /** 响应状态码，200为成功返回，非200为失败 */
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
 * Data nested object
 */
export interface Data {
  /** 删除失败的素材ID列表，空列表则表示没有失败的 */
  failedMaterialIds?: unknown;
}
/**
 * 1、查询账号下的素材列表，支持分页，支持按素材类型、分类等条件进行查询。
2、接口支持https协议
 */
export interface Api3a6fRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 页码 */
  pageNumber: number;
  /** 每页数据大小 */
  pageSize: number;
  /** 素材类型 <br/>image：图片<br/>video：视频<br/>audio：音频<br/>document：文档 */
  _type: string;
  /** 素材分类ID */
  categoryId?: number;
  /** 素材标题或频道号，支持模糊查询 */
  title?: string;
  /** 创建时间范围查询 - 起始值(13位时间戳) */
  startCreateTime?: number;
  /** 创建时间范围查询 - 终止值(13位时间戳) */
  endCreateTime?: number;
  /** 播放地址签名有效期（单位秒），不传默认一天时长。最大设置 30天时长（2592000） */
  expireSecond?: number;
}
/**
 * 1、查询账号下的素材列表，支持分页，支持按素材类型、分类等条件进行查询。
2、接口支持https协议
 */
export interface Api3a6fResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
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
 * Data nested object
 */
export interface Data {
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
 * Contents nested object
 */
export interface Contents {
  /** 素材ID */
  id?: string;
  /** 素材访问地址（带有效期） */
  url?: string;
  /** 素材标题 */
  title?: string;
  /** 素材类型<br/>video：视频<br/>image：图片<br/>document：文档<br/>text：图文 */
  _type?: string;
  /** 文件大小（字节） */
  fileSize?: number;
  /** 时长（秒），仅视频类型素材 */
  duration?: number;
  /** 素材来源<br/>upload：本地上传<br/>record：录制视频<br/>pptRecord：课件重制<br/>aiVideo：AI视频<br/>channelDocument：频道课件<br/>productExplain：商品讲解 */
  source?: string;
  /** 扩展数据，不同素材类型包含不同的扩展信息<br/>firstImg：首图地址<br/>screenshotList：视频截图列表<br/>subtitleList：字幕列表<br/>text：图文内容（仅图文类型） */
  extData?: Record<string, unknown>;
  /** 分类ID */
  categoryId?: number;
  /** 素材状态<br/>normal：正常<br/>temp_store：临时存储<br/>recycle：回收站<br/>wait_audit：待审核<br/>auditing：审核中<br/>audit_fail：审核失败<br/>wait_encode：待转码<br/>encoding：转码中<br/>encode_fail：转码失败<br/>expired：已过期 */
  status?: string;
  /** 素材过期时间戳（毫秒） */
  expireDate?: number;
  /** 创建用户ID */
  createUserId?: string;
  /** 创建用户名称 */
  createUserName?: string;
  /** 关联频道ID（仅部分素材有） */
  channelId?: number;
  /** 创建时间戳（毫秒） */
  createTime?: number;
  /** 更新时间戳（毫秒） */
  updateTime?: number;
}
/**
 * 1、创建优惠券
2、接口支持https协议
 */
export interface Api134fRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、创建优惠券
2、接口支持https协议
 */
export interface Api134fResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 标签数据 【[Data字段说明](#Data 参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * Data nested object
 */
export interface Data {
  /** 优惠券ID */
  Data自身?: string;
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
 * 1、删除优惠券
2、接口支持https协议
 */
export interface Api134fRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、删除优惠券
2、接口支持https协议
 */
export interface Api134fResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 标签数据 【[Data字段说明](#Data 参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、查询优惠券列表
2、接口支持https协议
 */
export interface Api7824Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 页数默认为1 */
  pageNumber?: number;
  /** 每页显示的数据条数，默认每页显示10条数据，最大值不能超过1000 */
  pageSize?: number;
  /** 优惠券ID */
  couponId?: string;
  /** 优惠券名称\ */
  name?: string;
  /** 状态: NOT_START-未开始、GOING-进行中、FINISHED-已结束、INVALID-已失效 */
  status?: string;
}
/**
 * 1、查询优惠券列表
2、接口支持https协议
 */
export interface Api7824Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 标签数据 【[Data字段说明](#Data 参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * Data nested object
 */
export interface Data {
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
 * Contents nested object
 */
export interface Contents {
  /** 优惠券ID */
  couponId?: string;
  /** 优惠券名称 */
  name?: string;
  /** 领券开始时间，13位毫秒时间戳 */
  receiveStartTime?: number;
  /** 领券结束时间，13位毫秒时间戳 */
  receiveEndTime?: number;
  /** 用券时间类型，RANGE-时间范围，DAY-天数 */
  useTimeType?: string;
  /** useTimeType为RANGE的参数：用券开始时间，13位毫秒时间戳 */
  useStartTime?: number;
  /** useTimeType为RANGE的参数：用券结束时间，13位毫秒时间戳 */
  useEndTime?: number;
  /** useTimeType为DAY的参数：领取后多少天内可用 */
  dayOfUse?: unknown;
  /** 发放数量，大于等于0 */
  availableAmount?: unknown;
  /** 优惠券规则【详情见[UserCouponRule](#UserCouponRule)】 */
  rule?: unknown;
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
 * 1、查询优惠券领取列表
2、接口支持https协议
 */
export interface Api1e8eRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 页数默认为1 */
  pageNumber?: number;
  /** 每页显示的数据条数，默认每页显示10条数据，最大值不能超过1000 */
  pageSize?: number;
  /** 优惠券ID */
  couponId: string;
  /** 搜索关键字，精准匹配观众ID、模糊匹配观众昵称 */
  keyword?: string;
  /** 领取渠道: CHANNEL-频道，AGGREGATE_PAGE-聚合页 */
  receiveSource?: string;
}
/**
 * 1、查询优惠券领取列表
2、接口支持https协议
 */
export interface Api1e8eResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 标签数据 【[Data字段说明](#Data 参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * Data nested object
 */
export interface Data {
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
 * Contents nested object
 */
export interface Contents {
  /** 观众ID */
  viewerId?: string;
  /** 观众昵称 */
  nickname?: string;
  /** 手机号 */
  mobile?: string;
  /** 头像 */
  avatar?: string;
  /** 领取渠道: CHANNEL-频道，AGGREGATE_PAGE-聚合页 */
  receiveSource?: string;
  /** 领取时间 */
  receiveTime?: number;
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
 * 1、修改优惠券
2、接口支持https协议
状态为已结束、已失效的优惠券无法修改，进行中的部分字段可以修改，未开始的可以修改
 */
export interface Api134fRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、修改优惠券
2、接口支持https协议
状态为已结束、已失效的优惠券无法修改，进行中的部分字段可以修改，未开始的可以修改
 */
export interface Api134fResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 标签数据 【[Data字段说明](#Data 参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、停止优惠券 (修改状态)
2、接口支持https协议
 */
export interface Api6192Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、停止优惠券 (修改状态)
2、接口支持https协议
 */
export interface Api6192Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 标签数据 【[Data字段说明](#Data 参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、批量删除机器人信息
2、接口支持https协议
 */
export interface Api2b8cRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
  /** 机器人信息的id，多个使用英文逗号分隔，一次性不能超过200个 */
  ids: string;
}
/**
 * 1、批量删除机器人信息
2、接口支持https协议
 */
export interface Api2b8cResponse {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 成功响应的数据，返回null */
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
 * Error nested object
 */
export interface Error {
  /** 错误代码，用于确定具体的错误原因 */
  code?: number;
  /** 错误描述，与 error.code 对应 */
  desc?: string;
}
/**
 * 1、分页查询机器人虚拟昵称
2、接口支持https协议
 */
export interface Api3a68Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
  /** 当前页数，第几页 */
  pageNumber?: string;
  /** 分页大小 */
  pageSize?: string;
}
/**
 * 1、分页查询机器人虚拟昵称
2、接口支持https协议
 */
export interface Api3a68Response {
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
  /** 机器人信息id */
  id?: number;
  /** 机器人信息头像 */
  avatar?: string;
  /** 机器人信息修改时间 */
  lastModified?: string;
  /** 机器人信息昵称 */
  name?: string;
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
 * 1、批量创建机器人虚拟昵称
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api535cRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
}
/**
 * 1、批量创建机器人虚拟昵称
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api535cResponse {
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
 * Error nested object
 */
export interface Error {
  /** 错误代码，用于确定具体的错误原因 */
  code?: number;
  /** 错误描述，与 error.code 对应 */
  desc?: string;
}
/**
 * 1、<p>查询直播场次汇总数据列表</p>

2、接口支持https协议
 */
export interface Api653aRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
  /** 频道id */
  channelId?: string;
  /** 场次名称或场次ID (模糊匹配) */
  keyword?: string;
  /** 结束时间 时间戳 */
  endTime?: string;
  /** 当前页数，第几页 */
  pageNumber?: string;
  /** 分页大小 */
  pageSize?: string;
  /** 开始时间 时间戳 */
  startTime?: string;
}
/**
 * 1、<p>查询直播场次汇总数据列表</p>

2、接口支持https协议
 */
export interface Api653aResponse {
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
  /** id */
  id?: number;
  /** 频道id */
  channelId?: number;
  /** 场次id */
  sessionId?: string;
  /** 场次名称 */
  name?: string;
  /** 实际到场人数 */
  attendanceActual?: number;
  /** 报名人数/白名单人数 */
  attendanceExpected?: number;
  /** 到场数量类型 0无数据 1报名观看 2白名单观看 */
  attendanceType?: number;
  /** 平均观看时长,分钟 */
  averagePlayDuration?: number;
  /** 直播结束时间 */
  endTime?: string;
  /** 最高并发数 */
  maxConcurrencyCount?: number;
  /** 移动端观看人数 */
  mobileUniqueViewer?: number;
  /** PC端观看人数 */
  pcUniqueViewer?: number;
  /** 回放播放量 */
  playCount?: number;
  /** 回放播放时长,分钟 */
  playDuration?: number;
  /** 开播时长，秒 */
  startDuration?: number;
  /** 直播开始时间 */
  startTime?: string;
  /** 直播总观看时长,分钟 */
  totalPlayDuration?: number;
  /** 观看人数 */
  uniqueViewer?: number;
  /** POLYV用户ID，和保利威官网一致，获取路径：官网->登录->直播（开发设置） */
  userId?: string;
  /** 观看次数 */
  videoView?: number;
  /** 回放人数 */
  viewerCount?: number;
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
 * 1、查询用户账单使用明细数据

2、接口支持https协议
 */
export interface Api4506Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 计费项，必填;duration：直播分钟数；concurrence：直播并发；mic_duration：连麦分钟数；ppt_anim：PPT动效转码；guide_duration：导播台；ppt_composite<br/> ：重制课件；distribute：云分发；aiPPTVideoEnabled：智能制课（不含数字人）；aiPPTVideoWithDigital：智能制课（含数字人）；aiAssistantEnabled：AI<br/> 助手答疑；aiSmartClipEnabled：智能裁剪 */
  itemCategory: string;
  /** 开始日期，必填，格式：yyyy-MM-dd，不允许跨月查询 */
  startDate: string;
  /** 结束日期，必填，格式：yyyy-MM-dd，不允许跨月查询 */
  endDate: string;
  /** 频道号，非必填 */
  channelId?: string;
  /** 当前页数，第几页 */
  pageNumber?: string;
  /** 分页大小 */
  pageSize?: string;
}
/**
 * 1、查询用户账单使用明细数据

2、接口支持https协议
 */
export interface Api4506Response {
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
  /** 频道号 */
  channelId?: number;
  /** 用量单位 */
  consumeUnit?: string;
  /** 用量 */
  consumed?: number;
  /** 结束时间 */
  endTime?: string;
  /** 计费项，duration：直播分钟数；concurrence：直播并发；mic_duration：连麦分钟数；<br/> ppt_anim：PPT动效转码；guide_duration：导播台；ppt_composite：重制课件；distribute：云分发 */
  itemCategory?: string;
  /** 项目明细，如：国内观看时长、1v1~6 连麦等 */
  itemName?: string;
  /** 产品，如：live */
  production?: string;
  /** 记录id */
  recordId?: string;
  /** 备注 */
  remark?: string;
  /** 场次号，无场次数据时为空 */
  sessionId?: string;
  /** 平均码率，单位：kbps，无码率数据时为空 */
  avgBitRate?: string;
  /** 开始时间 */
  startTime?: string;
  /** 出账日期 */
  statDate?: string;
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
 * 1、新增子账号
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api3d59Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、新增子账号
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api3d59Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 子账号信息【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
  /** 子账号用户Id */
  childUserId?: string;
  /** 子账号用户名 */
  childName?: string;
  /** 子账号邮箱 */
  childEmail?: string;
  /** 描述 */
  description?: string;
  /** 手机号码 */
  telephone?: string;
  /** 状态<br/>NORMAL：正常<br/>FROZEN：冻结<br/>DELETE：删除 */
  status?: string;
  /** 所属用户组织架构ID */
  organizationId?: number;
  /** 所属用户组织架构名称 */
  organizationName?: string;
  /** 所属角色ID */
  roleId?: number;
  /** 所属角色名称 */
  roleName?: string;
  /** 创建时间，13位毫秒级时间戳 */
  createdTime?: number;
}
/**
 * 1、通过子账号登录邮箱删除子账号
2、接口支持https协议
 */
export interface Api1683Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 子账号邮箱 */
  childEmail: string;
}
/**
 * 1、通过子账号登录邮箱删除子账号
2、接口支持https协议
 */
export interface Api1683Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功返回true */
  data?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、一客一码邀请销售信息查询
2、接口支持https协议
 */
export interface Api6bbfRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 销售id（跟saleCode参数二选一） */
  saleId?: string;
  /** 销售邀请码（跟saleId参数二选一） */
  saleCode?: string;
}
/**
 * 1、一客一码邀请销售信息查询
2、接口支持https协议
 */
export interface Api6bbfResponse {
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
  /** POLYV用户ID，和保利威官网一致，获取路径：官网->登录->直播（开发设置） */
  userId?: string;
  /** 子账号id */
  childUserId?: string;
  /** 子账号名称 */
  childName?: string;
  /** 子账号邮箱 */
  childEmail?: string;
  /** 子账号头像 */
  avatar?: string;
  /** 子账号手机号码 */
  telephone?: string;
}
/**
 * 1、查询用户子账号列表
2、接口支持https协议
 */
export interface Api5e06Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 页码，默认为1 */
  pageNumber?: number;
  /** 每页数据大小，默认每页显示10条数据，最大值不能超过1000 */
  pageSize?: number;
  /** 子账号邮箱，多个邮箱ID以,分隔，一次最多传入100个 */
  childEmail?: string;
}
/**
 * 1、查询用户子账号列表
2、接口支持https协议
 */
export interface Api5e06Response {
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
  /** 分页响应数据【详见[data字段说明](#data参数描述)】 */
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
 * Data nested object
 */
export interface Data {
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
 * Contents nested object
 */
export interface Contents {
  /** 子账号用户Id */
  childUserId?: string;
  /** 子账号用户名 */
  childName?: string;
  /** 子账号邮箱 */
  childEmail?: string;
  /** 描述 */
  description?: string;
  /** 手机号码 */
  telephone?: string;
  /** 状态<br/>NORMAL：正常<br/>FROZEN：冻结<br/>DELETE：删除 */
  status?: string;
  /** 所属用户组织架构ID */
  organizationId?: number;
  /** 所属用户组织架构名称 */
  organizationName?: string;
  /** 所属角色ID */
  roleId?: number;
  /** 所属角色名称 */
  roleName?: string;
  /** 创建时间，13位毫秒级时间戳 */
  createdTime?: number;
}
/**
 * 1、查询子账号角色权限列表
2、接口支持https协议
 */
export interface Api409aRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询子账号角色权限列表
2、接口支持https协议
 */
export interface Api409aResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 角色列表【详见[data字段说明](#data参数描述)】 */
  data?: unknown;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
  /** 角色ID */
  id?: number;
  /** 角色名称 */
  name?: string;
  /** 角色描述，备注 */
  description?: string;
  /** 权限名称，多个权限名称用英文逗号”,“分割 */
  permissionName?: string;
}
/**
 * 1、通过子账号登录邮箱修改子账号信息
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api1683Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、通过子账号登录邮箱修改子账号信息
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api1683Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功返回true */
  data?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、添加自定义字段
2、接口支持https协议
 */
export interface Api42b3Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、添加自定义字段
2、接口支持https协议
 */
export interface Api42b3Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 自定义字段数据 【[Data字段说明](#Data 参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、观众自定义信息同步
2、接口支持https协议
 */
export interface Apif9d8Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、观众自定义信息同步
2、接口支持https协议
 */
export interface Apif9d8Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 自定义字段数据 【[Data字段说明](#Data 参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、分页查询自定义字段
2、接口支持https协议
 */
export interface Api75aaRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、分页查询自定义字段
2、接口支持https协议
 */
export interface Api75aaResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 自定义字段数组数据【详见[data字段说明](#data参数描述)】 */
  data?: unknown;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、查询全局回调设置
2、接口支持https协议
 */
export interface Api2796Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询全局回调设置
2、接口支持https协议
 */
export interface Api2796Response {
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
  /** 录制生成回调URL */
  recordCallbackUrl?: string;
  /** 回调录制文件类型<br/>all：全部回放视频<br/>last：最终回放视频 */
  recordFileCallBackType?: string;
  /** 回调文件类型<br/>m3u8：m3u8文件<br/>mp4：mp4文件<br/>m3u8,mp4：m3u8和mp4文件 */
  recordCallbackVideoType?: string;
  /** 转存成功回调URL */
  playbackCallbackUrl?: string;
  /** 重制课件转存点播回调开关<br/>Y：开启<br/>N：关闭 */
  rebirthVodCallbackEnabled?: string;
  /** 课件重制成功回调URL */
  pptRecordCallbackUrl?: string;
  /** 直播状态改变回调URL */
  streamCallbackUrl?: string;
  /** 频道直播间信息修改回调URL */
  channelBasicUpdateCallbackUrl?: string;
  /** 直播内容审核不通过回调URL */
  liveScanCallbackUrl?: string;
  /** 直播间人员状态回调URL */
  chatUserStatusCallbackUrl?: string;
  /** 互动功能回调URL */
  interactionCallbackUrl?: string;
  /** 直播回放缓存生成回调通知URL */
  playbackCacheCallbackUrl?: string;
  /** 回放设置回调URL */
  playbackSettingCallbackUrl?: string;
  /** 视频创作信息回调 */
  aiPptVideoCallbackUrl?: string;
  /** 直播违规断流回调 */
  liveViolationCutoffCallbackUrl?: string;
}
/**
 * 1、查询全局页脚设置
2、接口支持https协议
 */
export interface Api4743Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询全局页脚设置
2、接口支持https协议
 */
export interface Api4743Response {
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
  /** POLYV用户ID，和保利威官网一致，获取路径：官网->登录->直播（开发设置） */
  userId?: string;
  /** 是否开启页脚<br/>Y：开启<br/>N：关闭 */
  showFooterEnabled?: string;
  /** 页脚文案 */
  footerText?: string;
  /** 页脚链接协议头 */
  footTextLinkProtocol?: string;
  /** 页脚链接地址 */
  footTextLinkUrl?: string;
}
/**
 * 1、查询全局频道设置
2、接口支持https协议
 */
export interface Api4584Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询全局频道设置
2、接口支持https协议
 */
export interface Api4584Response {
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
  /** 最高同时在线人数修改开关<br/>Y：开启<br/>N：关闭 */
  channelConcurrencesEnabled?: string;
  /** 自动转存开关<br/>Y：开启<br/>N：关闭 */
  timelyConvertEnabled?: string;
  /** 打赏开关<br/>Y：开启<br/>N：关闭 */
  donateEnabled?: string;
  /** 重制课件自动转存开关<br/>Y：开启<br/>N：关闭 */
  rebirthAutoUploadEnabled?: string;
  /** 重制课件自动重制开关<br/>Y：开启<br/>N：关闭 */
  rebirthAutoConvertEnabled?: string;
  /** 重制课件PPT铺满开关<br/>Y：开启<br/>N：关闭 */
  pptCoveredEnabled?: string;
  /** 播放器封面设置<br/>contain：等比例缩放<br/>cover：拉伸 */
  coverImgType?: string;
}
/**
 * 1、查询观看页观看次数显示开关
2、接口支持https协议
 */
export interface Api19aeRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询观看页观看次数显示开关
2、接口支持https协议
 */
export interface Api19aeResponse {
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
  /** 观看页观看次数显示开关<br/>Y：开启<br/>N：关闭 */
  enabled?: string;
}
/**
 * 1、将账号下的某些用户，添加、设置为邀请员
2、接口支持https协议
 */
export interface Api22fbRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、将账号下的某些用户，添加、设置为邀请员
2、接口支持https协议
 */
export interface Api22fbResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 状态码非200时的错误信息【详见[error对象说明](#error对象说明)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * 1、支持按特定的条件去过滤、获取账号下的邀请员的绑定观众列表
2、接口支持https协议
 */
export interface Api5ab8Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 邀请员用户ID，精准匹配 */
  inviteCustomerId?: string;
  /** 邀请员昵称关键字，支持模糊匹配 */
  inviteCustomerNickname?: string;
  /** 观众用户ID，精准匹配 */
  viewerId?: string;
  /** 观众昵称关键字，支持模糊匹配 */
  username?: string;
  /** 观众手机号码，精准匹配 */
  telephone?: string;
  /** 观众绑定状态列表，多个以英文逗号分隔。0-待跟进；1-已绑定；2-已解绑。 */
  followStatusList?: string;
  /** 每页记录数（默认10，最大1000） */
  pageSize?: number;
  /** 页码（最大1000页） */
  pageNumber?: number;
}
/**
 * 1、支持按特定的条件去过滤、获取账号下的邀请员的绑定观众列表
2、接口支持https协议
 */
export interface Api5ab8Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 具体的响应数据【详见[data对象说明](#data对象说明)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[error对象说明](#error对象说明)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * 1、支持按特定的条件去过滤、获取账号下的邀请员列表
2、接口支持https协议
 */
export interface Api352bRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 邀请员用户ID，精准匹配 */
  viewerUnionId?: string;
  /** 邀请员手机号码，精准匹配 */
  mobile?: string;
  /** 邀请员用户昵称关键字，支持模糊匹配 */
  keyword?: string;
  /** 邀请员所属组织ID */
  organizationId?: number;
  /** 每页记录数（默认10，最大1000） */
  pageSize?: number;
  /** 页码（最大1000页） */
  pageNumber?: number;
}
/**
 * 1、支持按特定的条件去过滤、获取账号下的邀请员列表
2、接口支持https协议
 */
export interface Api352bResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 具体的响应数据【详见[data对象说明](#data对象说明)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[error对象说明](#error对象说明)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * 1、将账号下的某些邀请员，移除邀请员身份
2、接口支持https协议
 */
export interface Api22fbRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、将账号下的某些邀请员，移除邀请员身份
2、接口支持https协议
 */
export interface Api22fbResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 状态码非200时的错误信息【详见[error对象说明](#error对象说明)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * 1、修改账号下的某些邀请员的信息
2、接口支持https协议
 */
export interface Api352aRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、修改账号下的某些邀请员的信息
2、接口支持https协议
 */
export interface Api352aResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 状态码非200时的错误信息【详见[error对象说明](#error对象说明)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * 1、频道批量添加标签
2、接口支持https协议
 */
export interface Api7486Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、频道批量添加标签
2、接口支持https协议
 */
export interface Api7486Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 标签数据 【[Data字段说明](#Data 参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * Data nested object
 */
export interface Data {
  /** 错误代码，用于确定具体的错误原因 */
  code?: number;
  /** 错误描述，与 error.code 对应 */
  desc?: string;
}
/**
 * 1、创建标签
2、接口支持https协议
 */
export interface Apid145Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、创建标签
2、接口支持https协议
 */
export interface Apid145Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 标签数据 【[Data字段说明](#Data 参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * Data nested object
 */
export interface Data {
  /** 标签id */
  id?: string;
  /** 标签名称 */
  name?: string;
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
 * 1、删除标签
2、接口支持https协议
 */
export interface Apid145Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 标签id */
  labelId: string;
}
/**
 * 1、删除标签
2、接口支持https协议
 */
export interface Apid145Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、分页查询标签
2、接口支持https协议
 */
export interface Api72a6Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前页码 */
  pageNumber: number;
  /** 分页大小 */
  pageSize: number;
}
/**
 * 1、分页查询标签
2、接口支持https协议
 */
export interface Api72a6Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 标签分页数据【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
  /** 分页页码 */
  pageNumber?: string;
  /** 分页大小 */
  pageSize?: number;
  /** 总页数 */
  totalPages?: string;
  /** 总记录数 */
  totalItems?: string;
  /** 标签数组 */
  contents?: unknown;
}
/**
 * contents nested object
 */
export interface contents {
  /** 标签id */
  id?: string;
  /** 标签名称 */
  name?: string;
}
/**
 * 1、编辑标签
2、接口支持https协议
 */
export interface Api3bedRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、编辑标签
2、接口支持https协议
 */
export interface Api3bedResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、查询账号时间范围连麦使用量
2、接口支持https协议
 */
export interface Api2314Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 开始时间，13位毫秒级时间戳（仅支持到日期） */
  startTime?: number;
  /** 结束时间，13位毫秒级时间戳（仅支持到日期） */
  endTime?: number;
}
/**
 * 1、查询账号时间范围连麦使用量
2、接口支持https协议
 */
export interface Api2314Response {
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
  /** 用户ID */
  userId?: string;
  /** 连麦使用分钟数 */
  history?: number;
}
/**
 * 1、获取账号MR并发详情信息
2、接口支持https协议
 */
export interface Api33c6Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、获取账号MR并发详情信息
2、接口支持https协议
 */
export interface Api33c6Response {
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
  /** 总并发数 */
  mrLiveConcurrency?: number;
  /** 当前正在使用的并发数 */
  usedCount?: number;
  /** 剩余并发数 */
  residualConcurrency?: number;
  /** 当前已占用并发的频道号列表，只返回前100个 */
  channelIds?: unknown;
}
/**
 * 1、组织架构新增子节点（排在第一位）
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api2f95Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、组织架构新增子节点（排在第一位）
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api2f95Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 组织架构信息【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
  /** 用户ID */
  userId?: string;
  /** 组织ID */
  id?: number;
  /** 组织名称 */
  name?: string;
  /** 组织描述 */
  description?: string;
  /** 图标 */
  icon?: string;
  /** 左节点 */
  lft?: number;
  /** 右节点 */
  rgt?: number;
  /** 父级组织的左节点ID */
  parentId?: number;
}
/**
 * 1、通过组织ID删除组织
2、接口支持https协议
 */
export interface Apifd88Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 组织ID，组织节点或子孙节点若存在子账号则不允许删除，若该组织节点存在子孙节点将全部删除【可通过[查询组织架构列表](/live/api/v4/user/organization/list)获取】 */
  organizationId: number;
}
/**
 * 1、通过组织ID删除组织
2、接口支持https协议
 */
export interface Apifd88Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功或失败均返回null */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、组织架构列表
2、接口支持https协议
 */
export interface Api7c4dRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、组织架构列表
2、接口支持https协议
 */
export interface Api7c4dResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 组织架构列表【详见[data字段说明](#data参数描述)】 */
  data?: unknown;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
  /** 用户ID */
  userId?: string;
  /** 组织ID */
  id?: number;
  /** 组织名称 */
  name?: string;
  /** 组织描述 */
  description?: string;
  /** 图标 */
  icon?: string;
  /** 左节点 */
  lft?: number;
  /** 右节点 */
  rgt?: number;
  /** 父级组织的左节点ID */
  parentId?: number;
}
/**
 * 1、量更新订单状态
2、接口支持https协议
 */
export interface Api779bRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * data nested object
 */
export interface data {
  /** 成功的订单号列表 */
  successOrderNos?: unknown;
  /** 失败的订单信息【详见[FailOrder字段说明](#FailOrder参数描述)】 */
  failOrderList?: unknown;
}
/**
 * FailOrder nested object
 */
export interface FailOrder {
  /** 订单号 */
  orderNo?: string;
  /** 失败错误码 */
  errCode?: number;
  /** 失败信息 */
  errMsg?: string;
}
/**
 * 1、查询商品订单详情
2、接口支持https协议
 */
export interface Api6e79Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 订单ID */
  orderNo: string;
}
/**
 * 1、查询商品订单列表
2、接口支持https协议
 */
export interface Api6e72Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 分页页码 */
  pageNumber?: number;
  /** 分页大小 */
  pageSize?: number;
  /** 频道ID */
  queryChannelId?: number;
  /** 订单状态，待支付:wait_pay、待发货:wait_delivery、待收货:delivering、已完成:finish、已关闭:close */
  status?: string;
  /** 物流方式，有物流:express、无物流:virtual */
  deliveryType?: string;
  /** 订单创建开始时间，格式yyyy-MM-dd HH:mm:ss */
  startCreateTime?: string;
  /** 订单创建结束时间，格式yyyy-MM-dd HH:mm:ss */
  endCreateTime?: string;
  /** 订单支付开始时间，格式yyyy-MM-dd HH:mm:ss */
  startPayTime?: string;
  /** 订单支付结束时间，格式yyyy-MM-dd HH:mm:ss */
  endPayTime?: string;
  /** 订单发货开始时间，格式yyyy-MM-dd HH:mm:ss */
  startDeliveryTime?: string;
  /** 订单发货结束时间，格式yyyy-MM-dd HH:mm:ss */
  endDeliveryTime?: string;
  /** 订单完成开始时间，格式yyyy-MM-dd HH:mm:ss */
  startFinishTime?: string;
  /** 订单完成结束时间，格式yyyy-MM-dd HH:mm:ss */
  endFinishTime?: string;
}
/**
 * 1、创建标签
2、接口支持https协议
 */
export interface Apiaa83Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、创建标签
2、接口支持https协议
 */
export interface Apiaa83Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 成功时，内容为商品id */
  data?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、删除标签
2、接口支持https协议
 */
export interface Apiaa83Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 商品id */
  productId: string;
}
/**
 * 1、删除标签
2、接口支持https协议
 */
export interface Apiaa83Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、编辑标签
2、接口支持https协议
 */
export interface Api3beaRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、编辑标签
2、接口支持https协议
 */
export interface Api3beaResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、分页查询标签
2、接口支持https协议
 */
export interface Api72a8Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前页码 */
  pageNumber: number;
  /** 分页大小 */
  pageSize: number;
  /** 关键字搜索 */
  keyword?: string;
  /** 商品类型（normal:普通商品,finance:金融商品） */
  productType?: string;
}
/**
 * 1、分页查询标签
2、接口支持https协议
 */
export interface Api72a8Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 标签分页数据【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
  /** 分页页码 */
  pageNumber?: string;
  /** 分页大小 */
  pageSize?: number;
  /** 总页数 */
  totalPages?: string;
  /** 总记录数 */
  totalItems?: string;
  /** 商品数组 */
  contents?: unknown;
}
/**
 * contents nested object
 */
export interface contents {
  /** 商品id */
  productId?: string;
  /** 商品名称 */
  name?: string;
  /** 封面图, normal类型商品值不为空 */
  cover?: string;
  /** 商品链接类型, 10:通用链接,11:多平台链接 ,12:调用原生方法 */
  linkType?: number;
  /** 商品链接不能为空 */
  link?: string;
  /** 商品类型，可能的值有：<br/>normal: 普通商品<br/>finance: 金融商品<br/>position:职位商品 */
  productType?: string;
  /** pc端链接 */
  pcLink?: string;
  /** 移动端链接 */
  mobileLink?: string;
  /** 微信小程序原始ID */
  wxMiniprogramOriginalId?: string;
  /** 微信小程序链接 */
  wxMiniprogramLink?: string;
  /** 手机APP链接 */
  mobileAppLink?: string;
  /** ios链接 */
  iosLink?: string;
  /** android链接 */
  androidLink?: string;
  /** 其他端链接 */
  otherLink?: string;
  /** 商品特色,卖点标签，可以多个,json数组 */
  features?: string;
  /** 商品标签ID列表 */
  tagIds?: number[];
  /** 按钮显示文案 */
  btnShow?: string;
  /** 商品描述 */
  productDesc?: string;
  /** 商品详情，返回的是个内容存放的地址：例如 https://liveimages.videocc.net/product-info/product-detail/4d57ea01de/704007d1fdfd4cb2a5b3d3a842418831.json url存放的就是商品详情内容 */
  productDetail?: string;
  /** 扩展信息：JSON对象字符串：{"coverList":["封面图地址，最多15个"], "videoList":[{"videoSource":"视频来源", "videoId":"视频ID"}]} 【详情见[EXT](#EXT)】 */
  ext?: string;
  /** **以下为普通商品专用参数** (productType=<span class="error">normal</span>) */
  field?: unknown;
  /** 商品实际价格类型，可能的值有：<br>AMOUNT: 金额<br>CUSTOM: 自定义 */
  priceType?: string;
  /** 商品实际价格-金额，最高精确度为两位小数，如 12.34 */
  realPrice?: number;
  /** 商品实际价格-自定义 */
  customPrice?: string;
  /** 商品原始价格（划线价格）类型，可能的值有：<br>AMOUNT: 金额<br>CUSTOM: 自定义 */
  originalPriceType?: string;
  /** 商品原始价格（划线价格）-金额，最高精确度为两位小数，如 12.34 */
  price?: number;
  /** 商品原始价格（划线价格）-自定义备注：如果 price 和 customOriginalPrice 都为空，则表示不启用原始价格（划线价格） */
  customOrignalPrice?: string;
  /** **以上为普通商品专用参数** (productType=<span class="error">normal</span>) */
  field?: unknown;
}
/**
 * 1、创建商品标签
2、接口支持https协议
 */
export interface Api280eRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、创建商品标签
2、接口支持https协议
 */
export interface Api280eResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 标签数据【详见[Data参数描述](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * Data nested object
 */
export interface Data {
  /** 标签名称 */
  name?: string;
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
 * 1、删除商品标签
2、接口支持https协议
 */
export interface Api280eRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、删除商品标签
2、接口支持https协议
 */
export interface Api280eResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、分页查询商品标签
2、接口支持https协议
 */
export interface Api6ac1Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 频道ID */
  channelId: number;
  /** 当前页码 */
  pageNumber: number;
  /** 分页大小 */
  pageSize: number;
  /** 关键字搜索 */
  keyword?: string;
}
/**
 * 1、分页查询商品标签
2、接口支持https协议
 */
export interface Api6ac1Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 标签分页数据【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
  /** 分页页码 */
  pageNumber?: number;
  /** 分页大小 */
  pageSize?: number;
  /** 总页数 */
  totalPages?: number;
  /** 总记录数 */
  totalItems?: number;
  /** 标签数组 */
  contents?: unknown;
}
/**
 * contents nested object
 */
export interface contents {
  /** 标签名称 */
  name?: string;
}
/**
 * 1、更新商品标签
2、接口支持https协议
 */
export interface Api280eRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、更新商品标签
2、接口支持https协议
 */
export interface Api280eResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、根据用户配置的模板发送短信通知
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api71efRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、根据用户配置的模板发送短信通知
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api71efResponse {
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
  data?: unknown;
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
  /** 手机号 */
  phoneNumber?: string;
  /** 短信状态<br/>-1：发送失败，手机号超过每日发送频次限制<br/>-2：发送失败，手机号不合法（非数字、长度错误）<br/>11：发送失败（调用阿里云短信接口失败）<br/>12：发送成功（调用阿里云短信接口成功，进入短信发送队列等待发送，并非成功发送到手机） */
  status?: number;
  /** 发送成功时返回阿里云回执ID流水号 */
  serialNo?: string;
}
/**
 * 1、查询直播模板打赏设置，包括现金打赏、礼物打赏，礼物打赏又分为现金支付和积分支付
2、接口支持https协议
 */
export interface Api7f5bRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询直播模板打赏设置，包括现金打赏、礼物打赏，礼物打赏又分为现金支付和积分支付
2、接口支持https协议
 */
export interface Api7f5bResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回频道详细信息【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
  /** 现金红包打赏开关，Y：开启，N：关闭 */
  donateCashEnabled?: string;
  /** 现金红包【详见[TemplateCashDonateBO字段说明](#TemplateCashDonateBO参数描述)】 */
  cashDonate?: Record<string, unknown>;
  /** 礼物打赏开关，Y：开启，N：关闭 */
  donateGiftEnabled?: string;
  /** 礼物打赏（现金支付或积分支付）【详见[TemplateGiftDonateBO字段说明](#TemplateGiftDonateBO参数描述)】 */
  giftDonate?: Record<string, unknown>;
}
/**
 * TemplateCashDonateBO nested object
 */
export interface TemplateCashDonateBO {
  /** 固定打赏金额，数组长度在1-6，最小值0.01，最大值9999.99 */
  cashs?: number[];
  /** 自定义打赏金额-最低金额，最小值0.01，最大值9999.99 */
  cashMin?: number;
}
/**
 * TemplateGiftDonateBO nested object
 */
export interface TemplateGiftDonateBO {
  /** 支付方式，CASH：现金支付，POINT：积分支付 */
  payWay?: string;
  /** 现金单位 */
  cashUnit?: string;
  /** 积分单位 */
  pointUnit?: string;
  /** 现金支付列表【详见[GiftDonate字段说明](#GiftDonate参数描述)】 */
  cashPays?: unknown;
  /** 积分支付列表【详见[GiftDonate字段说明](#GiftDonate参数描述)】 */
  pointPays?: unknown;
}
/**
 * GiftDonate nested object
 */
export interface GiftDonate {
  /** 礼物名称 */
  name?: string;
  /** 礼物图片地址 */
  img?: string;
  /** 动效缩略图 */
  dynamicImg?: string;
  /** 动效文件 */
  dynamicFile?: string;
  /** 礼物价格 */
  price?: number;
  /** 礼物顺序 */
  sequence?: number;
  /** 开关，Y：开启，N：关闭 */
  enabled?: string;
  /** 单位 */
  unit?: string;
  /** 单位 STATIC-静态图片 DYNAMIC-动态图片 */
  imgType?: string;
}
/**
 * 1、查询音频审核默认模板设置
2、接口支持https协议
 */
export interface Api66d7Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
}
/**
 * 1、查询音频审核默认模板设置
2、接口支持https协议
 */
export interface Api66d7Response {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 模板-音频审核设置对象【详见[Data参数描述](#Data参数描述)】 */
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
  /** 审核开关<br/>Y：开启<br/>N：关闭 */
  moderationEnabled?: string;
  /** 审核策略（easy：宽松，normal：一般，strict：严格） */
  moderationStrategy?: string;
  /** 严禁词开关<br/>Y：开启<br/>N：关闭 */
  badwordEnabled?: string;
  /** 违规通知设置 */
  illegalNotify?: Record<string, unknown>;
}
/**
 * illegalNotify nested object
 */
export interface illegalNotify {
  /** 开关<br/>Y：开启<br/>N：关闭 */
  monitorEnabled?: string;
  /** 开关<br/>Y：开启<br/>N：关闭 */
  talentEnabled?: string;
  /** 开关<br/>Y：开启<br/>N：关闭 */
  assistantEnabled?: string;
  /** 开关<br/>Y：开启<br/>N：关闭 */
  platformEnabled?: string;
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
 * 1、查询内容保护默认模板设置
2、接口支持https协议
 */
export interface Api6c6dRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
}
/**
 * 1、查询内容保护默认模板设置
2、接口支持https协议
 */
export interface Api6c6dResponse {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 模板-跑马灯响应对象【详见[Data参数描述](#Data参数描述)】 */
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
  /** 内容保护开关 <br/>Y：开启<br/>N：关闭 */
  enable?: string;
  /** 内容保护方式<br/>marquee：跑马灯<br/>watermark：水印 */
  antiRecordType?: string;
  /** 内容保护类型 <br/>fixed：固定<br/>nickname：用户名<br/>diyurl：url自定义设置 */
  modelType?: string;
  /** 自定义缩放开关 <br/>Y：开启<br/>N：关闭 */
  autoZoomEnabled?: string;
  /** 固定值时为设置内容<br/> URL自定义设置时为网址 */
  content?: string;
  /** 透明度<br/>跑马灯透明度，范围0-99<br/> 水印透明度，范围0-100 */
  opacity?: number;
  /** 双跑马灯开关 <br/>Y：开启<br/>N：关闭 */
  doubleEnabled?: string;
  /** 跑马灯字体颜色，色值，例如：#FFFFFF */
  fontColor?: string;
  /** 字体大小<br/> 内容保护方式为跑马灯时：设置数值，范围1-256<br/> 内容保护方式为水印时：<br/> small：小<br/> middle：中<br/> large：大 */
  fontSize?: string;
  /** 跑马灯显示方式<br/> roll：滚动<br/> flicker：闪烁 */
  showMode?: string;
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
 * 1、查询回放默认模板设置
2、接口支持https协议
 */
export interface Api7ad8Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
}
/**
 * 1、查询回放默认模板设置
2、接口支持https协议
 */
export interface Api7ad8Response {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 模板-回放设置对象【详见[Data参数描述](#Data参数描述)】 */
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
  /** 回放开关<br/>Y：开启<br/>N：关闭 */
  playbackEnabled?: string;
  /** 观看页回放方式 <br/>single：单个视频<br/>list：列表回放 */
  _type?: string;
  /** 回放视频来源 <br/>record：暂存<br/>playback：回放列表<br/>vod：点播列表 */
  origin?: string;
  /** 章节开关<br/>Y：开启<br/>N：关闭 */
  sectionEnabled?: string;
  /** 聊天回放开关<br/>Y：开启<br/>N：关闭 */
  chatPlaybackEnabled?: string;
  /** 倍数播放开关<br/>Y：开启<br/>N：关闭 */
  playbackMultiplierEnabled?: string;
  /** 进度条开关<br/>Y：开启<br/>N：关闭 */
  playbackProgressBarEnabled?: string;
  /** 进度条操作方式<br/>drag 拖动,prohibitDrag 禁止拖动,dragHistoryOnly 只能拖动已观看内容 */
  playbackProgressBarOperationType?: string;
  /** 显示播放按钮开关<br/>Y：开启<br/>N：关闭 */
  showPlayButtonEnabled?: string;
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
 * Error nested object
 */
export interface Error {
  /** 错误代码，用于确定具体的错误原因 */
  code?: number;
  /** 错误描述，与 error.code 对应 */
  desc?: string;
}
/**
 * 1、查询默认模板角色权限设置
2、接口支持https协议
 */
export interface Api5bbdRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
}
/**
 * 1、查询默认模板角色权限设置
2、接口支持https协议
 */
export interface Api5bbdResponse {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 模板-回放设置对象【详见[Data参数描述](#Data参数描述)】 */
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
  /** 讲师角色权限配置【详见[TeacherConfig参数描述](#TeacherConfig参数描述)】 */
  teacherConfig?: Record<string, unknown>;
  /** 嘉宾角色权限配置【详见[GuestConfig参数描述](#GuestConfig参数描述)】 */
  guestConfig?: Record<string, unknown>;
}
/**
 * TeacherConfig nested object
 */
export interface TeacherConfig {
  /** 开播端签到功能显示开关 Y：开启、N：关闭 */
  webStartCheckInDisplayEnabled?: string;
  /** 开播端抽奖功能显示开关 Y：开启、N：关闭 */
  webStartLotteryDisplayEnabled?: string;
  /** 开播端问卷功能显示开关 Y：开启、N：关闭 */
  webStartQuestionnaireDisplayEnabled?: string;
  /** 开播端答题卡功能显示开关 Y：开启、N：关闭 */
  webStartAnswerDisplayEnabled?: string;
  /** 开播端定时器功能显示开关 Y：开启、N：关闭 */
  webStartTimerDisplayEnabled?: string;
  /** 开播端红包功能显示开关 Y：开启、N：关闭 */
  webStartRedPackDisplayEnabled?: string;
  /** 开播端卡片推送功能显示开关 Y：开启、N：关闭 */
  webStartCardPushDisplayEnabled?: string;
  /** 开播端公告功能显示开关 Y：开启、N：关闭 */
  webStartNotifyDisplayEnabled?: string;
  /** 开播端连麦功能显示开关 Y：开启、N：关闭 */
  webStartLinkMicDisplayEnabled?: string;
  /** 开播端多媒体功能显示开关 Y：开启、N：关闭 */
  webStartMultiMediaDisplayEnabled?: string;
  /** 开播端成员列表功能显示开关 Y：开启、N：关闭 */
  webStartMembersDisplayEnabled?: string;
  /** 共享保持摄像头状态开关 Y：开启、N：关闭 */
  screenShareRetainCameraEnabled?: string;
  /** 混流布局默认应用 1：单人模式、2：平铺模式、3：主讲模式 */
  multiplexingDefaultLayout?: string;
  /** 摄像头单人模式开关 Y：开启、N：关闭 */
  cameraSingleModeEnabled?: string;
  /** AI抠像背景图 */
  aiVirtualBgUrl?: string;
  /** 混音默认开关 Y：开启、N：关闭 */
  remixDefaultEnabled?: string;
  /** 是否显示场景模板开关 Y：开启、N：关闭 */
  showSceneTemplateEnabled?: string;
  /** 隐藏画面方向切换入口开关 Y：开启、N：关闭 */
  hideFramesDirectionEnabled?: string;
  /** 是连麦默认方式 video：音视频、audio：音频 */
  defaultOpenMicLinkEnabled?: string;
}
/**
 * GuestConfig nested object
 */
export interface GuestConfig {
  /** 开播端签到功能显示开关 Y：开启、N：关闭 */
  webStartCheckInDisplayEnabled?: string;
  /** 开播端抽奖功能显示开关 Y：开启、N：关闭 */
  webStartLotteryDisplayEnabled?: string;
  /** 开播端问卷功能显示开关 Y：开启、N：关闭 */
  webStartQuestionnaireDisplayEnabled?: string;
  /** 开播端答题卡功能显示开关 Y：开启、N：关闭 */
  webStartAnswerDisplayEnabled?: string;
  /** 开播端红包功能显示开关 Y：开启、N：关闭 */
  webStartRedPackDisplayEnabled?: string;
  /** 开播端卡片推送功能显示开关 Y：开启、N：关闭 */
  webStartCardPushDisplayEnabled?: string;
  /** 开播端公告功能显示开关 Y：开启、N：关闭 */
  webStartNotifyDisplayEnabled?: string;
  /** 开播端连麦功能显示开关 Y：开启、N：关闭 */
  webStartLinkMicDisplayEnabled?: string;
  /** 开播端多媒体功能显示开关 Y：开启、N：关闭 */
  webStartMultiMediaDisplayEnabled?: string;
  /** 开播端成员列表功能显示开关 Y：开启、N：关闭 */
  webStartMembersDisplayEnabled?: string;
  /** 共享保持摄像头状态开关 Y：开启、N：关闭 */
  screenShareRetainCameraEnabled?: string;
  /** 摄像头单人模式开关 Y：开启、N：关闭 */
  cameraSingleModeEnabled?: string;
  /** AI抠像背景图 */
  aiVirtualBgUrl?: string;
  /** 混音默认开关 Y：开启、N：关闭 */
  remixDefaultEnabled?: string;
  /** 是否显示场景模板开关 Y：开启、N：关闭 */
  showSceneTemplateEnabled?: string;
  /** 隐藏画面方向切换入口开关 Y：开启、N：关闭 */
  hideFramesDirectionEnabled?: string;
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
 * 1、查询视频审核默认模板设置
2、接口支持https协议
 */
export interface Api6d48Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
}
/**
 * 1、查询视频审核默认模板设置
2、接口支持https协议
 */
export interface Api6d48Response {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 模板-视频审核设置对象【详见[Data参数描述](#Data参数描述)】 */
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
  /** 审核开关<br/>Y：开启<br/>N：关闭 */
  moderationEnabled?: string;
  /** 审核策略（finance_easy：宽松，finance_normal：一般，finance_serious：严格） */
  moderationStrategy?: string;
  /** 截帧时长（5s，20s，60s） */
  imageFrequency?: number;
  /** 违规通知设置 */
  illegalNotify?: Record<string, unknown>;
}
/**
 * illegalNotify nested object
 */
export interface illegalNotify {
  /** 开关<br/>Y：开启<br/>N：关闭 */
  monitorEnabled?: string;
  /** 开关<br/>Y：开启<br/>N：关闭 */
  talentEnabled?: string;
  /** 开关<br/>Y：开启<br/>N：关闭 */
  assistantEnabled?: string;
  /** 开关<br/>Y：开启<br/>N：关闭 */
  platformEnabled?: string;
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
 * 1、修改直播模板礼物打赏设置，礼物打赏又分为现金支付和积分支付
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api7269Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、修改直播模板礼物打赏设置，礼物打赏又分为现金支付和积分支付
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api7269Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 成功响应时返回频道详细信息 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * TemplateGiftDonate nested object
 */
export interface TemplateGiftDonate {
  /** 支付方式，CASH：现金支付，POINT：积分支付 */
  payWay?: string;
  /** 积分单位 */
  pointUnit?: string;
  /** 现金支付列表，数组长度为1-18【详见[GiftDonate字段说明](#GiftDonate参数描述)】 */
  cashPays?: unknown;
  /** 积分支付列表，数组长度为1-16【详见[GiftDonate字段说明](#GiftDonate参数描述)】 */
  pointPays?: unknown;
}
/**
 * GiftDonate nested object
 */
export interface GiftDonate {
  /** 礼物名称 */
  name?: string;
  /** 礼物图片地址 */
  img?: string;
  /** 礼物价格，默认0.01 */
  price?: number;
  /** 开关，Y：开启，N：关闭，默认为N */
  enabled?: string;
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
 * 1、修改音频审核默认模板设置
2、接口支持https协议
 */
export interface Api66d7Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
}
/**
 * 1、修改音频审核默认模板设置
2、接口支持https协议
 */
export interface Api66d7Response {
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
 * illegalNotify nested object
 */
export interface illegalNotify {
  /** 开关<br/>Y：开启<br/>N：关闭 */
  monitorEnabled?: string;
  /** 开关<br/>Y：开启<br/>N：关闭 */
  talentEnabled?: string;
  /** 开关<br/>Y：开启<br/>N：关闭 */
  assistantEnabled?: string;
  /** 开关<br/>Y：开启<br/>N：关闭 */
  platformEnabled?: string;
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
 * 1、更新内容保护默认模板设置
2、接口支持https协议
 */
export interface Api6c6dRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
}
/**
 * 1、更新内容保护默认模板设置
2、接口支持https协议
 */
export interface Api6c6dResponse {
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
 * Error nested object
 */
export interface Error {
  /** 错误代码，用于确定具体的错误原因 */
  code?: number;
  /** 错误描述，与 error.code 对应 */
  desc?: string;
}
/**
 * 1、修改回放默认模板设置
2、接口支持https协议
 */
export interface Api7ad8Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
}
/**
 * 1、修改回放默认模板设置
2、接口支持https协议
 */
export interface Api7ad8Response {
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
 * Error nested object
 */
export interface Error {
  /** 错误代码，用于确定具体的错误原因 */
  code?: number;
  /** 错误描述，与 error.code 对应 */
  desc?: string;
}
/**
 * 1、修改角色权限默认模板设置
2、接口支持https协议
 */
export interface Api5bbdRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
}
/**
 * 1、修改角色权限默认模板设置
2、接口支持https协议
 */
export interface Api5bbdResponse {
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
 * TeacherConfig nested object
 */
export interface TeacherConfig {
  /** 开播端签到功能显示开关 Y：开启、N：关闭 */
  webStartCheckInDisplayEnabled?: string;
  /** 开播端抽奖功能显示开关 Y：开启、N：关闭 */
  webStartLotteryDisplayEnabled?: string;
  /** 开播端问卷功能显示开关 Y：开启、N：关闭 */
  webStartQuestionnaireDisplayEnabled?: string;
  /** 开播端答题卡功能显示开关 Y：开启、N：关闭 */
  webStartAnswerDisplayEnabled?: string;
  /** 开播端定时器功能显示开关 Y：开启、N：关闭 */
  webStartTimerDisplayEnabled?: string;
  /** 开播端红包功能显示开关 Y：开启、N：关闭 */
  webStartRedPackDisplayEnabled?: string;
  /** 开播端卡片推送功能显示开关 Y：开启、N：关闭 */
  webStartCardPushDisplayEnabled?: string;
  /** 开播端公告功能显示开关 Y：开启、N：关闭 */
  webStartNotifyDisplayEnabled?: string;
  /** 开播端连麦功能显示开关 Y：开启、N：关闭 */
  webStartLinkMicDisplayEnabled?: string;
  /** 开播端多媒体功能显示开关 Y：开启、N：关闭 */
  webStartMultiMediaDisplayEnabled?: string;
  /** 开播端成员列表功能显示开关 Y：开启、N：关闭 */
  webStartMembersDisplayEnabled?: string;
  /** 共享保持摄像头状态开关 Y：开启、N：关闭 */
  screenShareRetainCameraEnabled?: string;
  /** 混流布局默认应用 1：单人模式、2：平铺模式、3：主讲模式 */
  multiplexingDefaultLayout?: string;
  /** 摄像头单人模式开关 Y：开启、N：关闭 */
  cameraSingleModeEnabled?: string;
  /** AI抠像背景图 */
  aiVirtualBgUrl?: string;
  /** 混音默认开关 Y：开启、N：关闭 */
  remixDefaultEnabled?: string;
  /** 是否显示场景模板开关 Y：开启、N：关闭 */
  showSceneTemplateEnabled?: string;
  /** 隐藏画面方向切换入口开关 Y：开启、N：关闭 */
  hideFramesDirectionEnabled?: string;
  /** 是连麦默认方式 video：音视频、audio：音频 */
  defaultOpenMicLinkEnabled?: string;
}
/**
 * GuestConfig nested object
 */
export interface GuestConfig {
  /** 开播端签到功能显示开关 Y：开启、N：关闭 */
  webStartCheckInDisplayEnabled?: string;
  /** 开播端抽奖功能显示开关 Y：开启、N：关闭 */
  webStartLotteryDisplayEnabled?: string;
  /** 开播端问卷功能显示开关 Y：开启、N：关闭 */
  webStartQuestionnaireDisplayEnabled?: string;
  /** 开播端答题卡功能显示开关 Y：开启、N：关闭 */
  webStartAnswerDisplayEnabled?: string;
  /** 开播端红包功能显示开关 Y：开启、N：关闭 */
  webStartRedPackDisplayEnabled?: string;
  /** 开播端卡片推送功能显示开关 Y：开启、N：关闭 */
  webStartCardPushDisplayEnabled?: string;
  /** 开播端公告功能显示开关 Y：开启、N：关闭 */
  webStartNotifyDisplayEnabled?: string;
  /** 开播端连麦功能显示开关 Y：开启、N：关闭 */
  webStartLinkMicDisplayEnabled?: string;
  /** 开播端多媒体功能显示开关 Y：开启、N：关闭 */
  webStartMultiMediaDisplayEnabled?: string;
  /** 开播端成员列表功能显示开关 Y：开启、N：关闭 */
  webStartMembersDisplayEnabled?: string;
  /** 共享保持摄像头状态开关 Y：开启、N：关闭 */
  screenShareRetainCameraEnabled?: string;
  /** 摄像头单人模式开关 Y：开启、N：关闭 */
  cameraSingleModeEnabled?: string;
  /** AI抠像背景图 */
  aiVirtualBgUrl?: string;
  /** 混音默认开关 Y：开启、N：关闭 */
  remixDefaultEnabled?: string;
  /** 是否显示场景模板开关 Y：开启、N：关闭 */
  showSceneTemplateEnabled?: string;
  /** 隐藏画面方向切换入口开关 Y：开启、N：关闭 */
  hideFramesDirectionEnabled?: string;
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
 * 1、修改视频审核默认模板设置
2、接口支持https协议
 */
export interface Api6d48Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
}
/**
 * 1、修改视频审核默认模板设置
2、接口支持https协议
 */
export interface Api6d48Response {
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
 * illegalNotify nested object
 */
export interface illegalNotify {
  /** 开关<br/>Y：开启<br/>N：关闭 */
  monitorEnabled?: string;
  /** 开关<br/>Y：开启<br/>N：关闭 */
  talentEnabled?: string;
  /** 开关<br/>Y：开启<br/>N：关闭 */
  assistantEnabled?: string;
  /** 开关<br/>Y：开启<br/>N：关闭 */
  platformEnabled?: string;
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
 * 1、修改全局回调设置
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api2796Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、修改全局回调设置
2、（timestamp, appId）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api2796Response {
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
  /** 成功返回true */
  data?: boolean;
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
 * 1、修改全局页脚设置
2、接口支持https协议
 */
export interface Api4743Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、修改全局页脚设置
2、接口支持https协议
 */
export interface Api4743Response {
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
  /** 请求成功返回true，请求失败返回空 */
  data?: boolean;
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
 * 1、修改全局频道设置
2、接口支持https协议
 */
export interface Api4584Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、修改全局频道设置
2、接口支持https协议
 */
export interface Api4584Response {
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
  /** 成功返回null */
  data?: string;
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
 * 1、修改观看页观看次数显示开关
2、观看页观看次数显示开关对所有频道生效
3、接口支持https协议
 */
export interface Api19aeRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 观看页观看次数显示开关<br/>Y：开启<br/>N：关闭 */
  enabled: string;
}
/**
 * 1、修改观看页观看次数显示开关
2、观看页观看次数显示开关对所有频道生效
3、接口支持https协议
 */
export interface Api19aeResponse {
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
  /** 请求成功返回true，请求失败返回空 */
  data?: boolean;
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
 * 1、查询用户中奖记录
2、接口支持https协议
 */
export interface Api7832Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 观众id */
  viewerId: string;
  /** 分页大小 */
  pageSize: string;
  /** 页码 */
  pageNumber: string;
}
/**
 * 1、查询用户中奖记录
2、接口支持https协议
 */
export interface Api7832Response {
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
  /** 页码 */
  pageNumber?: string;
  /** 页面大小 */
  pageSize?: string;
  /** 总页数 */
  totalPages?: string;
  /** 总记录数 */
  totalItems?: string;
  /** 抽奖信息数组 【详见[contents字段说明](#contents参数描述)】 */
  contents?: unknown;
}
/**
 * contents nested object
 */
export interface contents {
  /** 频道id */
  channelId?: number;
  /** 频道名称 */
  channelName?: string;
  /** 场次id */
  sessionId?: string;
  /** 收货信息JSON字符串 */
  collectInfo?: string;
  /** 领取方式（form：表单，link：链接，qrCode：二维码） */
  acceptType?: string;
  /** 抽奖id */
  lotteryId?: string;
  /** 奖品名称 */
  prize?: string;
  /** 是否已领取（true/false） */
  received?: boolean;
  /** 兑奖码 */
  winnerCode?: string;
  /** 活动名 */
  activityName?: string;
  /** 中奖时间 */
  createdTime?: number;
  /** 最后更新时间 */
  lastModified?: number;
  /** 是否收集信息（Y/N） */
  receiveEnabled?: boolean;
}
/**
 * 1、通过手机号导入用户
2、接口支持https协议
 */
export interface Api57f6Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、通过手机号导入用户
2、接口支持https协议
 */
export interface Api57f6Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 响应新建成功的用户信息【详见[Data字段说明](#Data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * followUsers nested object
 */
export interface followUsers {
  /** 跟进人ID */
  userId?: string;
  /** 默认wwork:企微跟进人 */
  _type?: string;
}
/**
 * Data nested object
 */
export interface Data {
  /** 观众id */
  viewerUnionId?: string;
  /** 观众昵称 */
  nickname?: string;
  /** 手机号码 */
  mobile?: string;
  /** 用户来源 */
  source?: string;
  /** 采集姓名 */
  name?: string;
  /** 采集手机号码 */
  lastCollectMobile?: string;
  /** 邮箱 */
  email?: string;
  /** 地址 */
  area?: string;
  /** 最后访问IP */
  latestAccessIp?: string;
  /** 设备信息 */
  device?: string;
  /** 观看时长 */
  watchDuration?: number;
  /** 观看频道数 */
  watchChannelCount?: number;
  /** 最后授权时间 */
  latestAuthTime?: unknown;
  /** 创建时间 */
  createTime?: unknown;
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
 * 1、删除观众信息
2、接口支持https协议
 */
export interface Api3fd1Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 观众id */
  viewerUnionId: string;
}
/**
 * 1、删除观众信息
2、接口支持https协议
 */
export interface Api3fd1Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、查询观众详情
2、接口支持https协议
 */
export interface Api3fd9Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 观众id */
  viewerUnionId: string;
}
/**
 * 1、查询观众详情
2、接口支持https协议
 */
export interface Api3fd9Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 观众详细数据【详见[data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * Data nested object
 */
export interface Data {
  /** 观众id */
  viewerUnionId?: string;
  /** 微信openId */
  wxOpenId?: string;
  /** 微信UnionId */
  wxUnionId?: string;
  /** 微信昵称 */
  wxNickName?: string;
  /** 微信头像 */
  wxAvatar?: string;
  /** 微信AppId */
  wxAppId?: string;
  /** 手机号码 */
  mobile?: string;
  /** 用户来源 */
  source?: string;
  /** 采集姓名 */
  name?: string;
  /** 采集手机号码 */
  lastCollectMobile?: string;
  /** 邮箱 */
  email?: string;
  /** 地址 */
  area?: string;
  /** 最后访问IP */
  latestAccessIp?: string;
  /** 设备 */
  device?: string;
  /** 观看时长 */
  watchDuration?: number;
  /** 观看频道数 */
  watchChannelCount?: number;
  /** 最后授权时间 */
  latestAuthTime?: unknown;
  /** 创建时间 */
  createTime?: unknown;
  /** 标签数组【详见[labels字段说明](#labels参数描述)】 */
  labels?: unknown;
}
/**
 * labels nested object
 */
export interface labels {
  /** 标签id */
  id?: string;
  /** 标签名称 */
  label?: string;
}
/**
 * 1、通过外部ID导入用户
2、接口支持https协议
 */
export interface Api1267Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、通过外部ID导入用户
2、接口支持https协议
 */
export interface Api1267Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 响应新建成功的用户信息【详见[Data字段说明](#Data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * followUsers nested object
 */
export interface followUsers {
  /** 跟进人ID */
  userId?: string;
  /** 默认wwork:企微跟进人 */
  _type?: string;
}
/**
 * Data nested object
 */
export interface Data {
  /** 观众id */
  viewerUnionId?: string;
  /** 观众昵称 */
  nickname?: string;
  /** 外部用户id */
  externalViewerId?: string;
  /** 用户来源 */
  source?: string;
  /** 最后授权时间 */
  latestAuthTime?: unknown;
  /** 创建时间 */
  createTime?: unknown;
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
 * 1、用户关联标签
2、接口支持https协议
 */
export interface Api7a3eRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、用户关联标签
2、接口支持https协议
 */
export interface Api7a3eResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 响应新建成功的用户信息【详见[Data字段说明](#Data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、创建标签
2、接口支持https协议
 */
export interface Apid145Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、创建标签
2、接口支持https协议
 */
export interface Apid145Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 响应新建成功的用户信息【详见[Data字段说明](#Data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * Data nested object
 */
export interface Data {
  /** 标签id */
  id?: string;
  /** 标签名称 */
  label?: string;
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
 * 1、删除用户标签关联
2、接口支持https协议
 */
export interface Api7b93Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、删除用户标签关联
2、接口支持https协议
 */
export interface Api7b93Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 响应新建成功的用户信息【详见[Data字段说明](#Data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、删除标签信息
2、接口支持https协议
 */
export interface Api3123Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 标签id */
  id: string;
}
/**
 * 1、删除标签信息
2、接口支持https协议
 */
export interface Api3123Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、分页获取标签列表
2、接口支持https协议
 */
export interface Api3123Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 标签 */
  keyword?: string;
  /** 页面大小（默认10，最大1000） */
  pageSize?: string;
  /** 页码（目前限制最大值1000页） */
  pageNumber?: number;
}
/**
 * 1、分页获取标签列表
2、接口支持https协议
 */
export interface Api3123Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 分页用户信息【详见[Data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * Data nested object
 */
export interface Data {
  /** 页面大小 */
  pageSize?: number;
  /** 剩余页码 */
  totalPages?: string;
  /** 剩余记录数 */
  totalItems?: boolean;
  /** 观众信息列表【详见[contents字段说明](#contents参数描述)】 */
  contents?: unknown;
}
/**
 * Contents nested object
 */
export interface Contents {
  /** 标签id */
  id?: string;
  /** 标签 */
  label?: string;
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
 * 1、更新标签信息
2、接口支持https协议
 */
export interface Api3123Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、更新标签信息
2、接口支持https协议
 */
export interface Api3123Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 响应新建成功的用户信息【详见[Data字段说明](#Data参数描述)】 */
  data?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、分页获取观众列表
2、接口支持https协议
 */
export interface Api3fd2Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 来源（IMPORT:导入，WX:微信；MOBILE:手机） */
  source?: string;
  /** 手机号码 */
  mobile?: string;
  /** 邮箱 */
  email?: string;
  /** 地址 */
  area?: string;
  /** 页面大小（默认10，最大1000） */
  pageSize?: string;
  /** 页码（目前限制最大值1000页） */
  pageNumber?: number;
}
/**
 * 1、分页获取观众列表
2、接口支持https协议
 */
export interface Api3fd2Response {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 分页用户信息【详见[Data字段说明](#data参数描述)】 */
  data?: Record<string, unknown>;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * Data nested object
 */
export interface Data {
  /** 页面大小 */
  pageSize?: number;
  /** 剩余页码 */
  totalPages?: string;
  /** 剩余记录数 */
  totalItems?: boolean;
  /** 观众信息列表【详见[contents字段说明](#contents参数描述)】 */
  contents?: unknown;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
}
/**
 * Contents nested object
 */
export interface Contents {
  /** 观众id */
  viewerUnionId?: string;
  /** 微信openId */
  wxOpenId?: string;
  /** 微信UnionId */
  wxUnionId?: string;
  /** 微信昵称 */
  wxNickName?: string;
  /** 微信头像 */
  wxAvatar?: string;
  /** 微信AppId */
  wxAppId?: string;
  /** 手机号码 */
  mobile?: string;
  /** 用户来源(IMPORT:导入) */
  source?: string;
  /** 采集姓名 */
  name?: string;
  /** 采集手机号码 */
  lastCollectMobile?: string;
  /** 邮箱 */
  email?: string;
  /** 地址 */
  area?: string;
  /** 最后访问IP */
  latestAccessIp?: string;
  /** 设备 */
  device?: string;
  /** 观看时长 */
  watchDuration?: number;
  /** 观看频道数 */
  watchChannelCount?: number;
  /** 最后授权时间 */
  latestAuthTime?: unknown;
  /** 创建时间 */
  createTime?: unknown;
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
 * 1、更新用户身份信息
2、接口支持https协议
 */
export interface Api6aaaRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、更新用户身份信息
2、接口支持https协议
 */
export interface Api6aaaResponse {
  /** 响应状态码，200为成功返回，非200为失败 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 响应结果，由业务决定，成功返回true，失败返回false */
  success?: boolean;
  /** 响应新建成功的用户信息【详见[Data字段说明](#Data参数描述)】 */
  data?: boolean;
  /** 状态码非200时的错误信息【详见[Error字段说明](#error参数描述)】 */
  error?: Record<string, unknown>;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
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
 * 1、修改配置信息
2、接口支持https协议
 */
export interface Api43f5Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、修改配置信息
2、接口支持https协议
 */
export interface Api43f5Response {
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
  /** 响应数据，成功时返回null */
  data?: Record<string, unknown>;
}
/**
 * touristExternalHrefConfig nested object
 */
export interface touristExternalHrefConfig {
  /** pc端链接 */
  pcLink?: string;
  /** 移动端链接 */
  mobileLink?: string;
  /** 安卓端链接 */
  androidLink?: string;
  /** ios端链接 */
  iosLink?: string;
  /** 其他端链接 */
  otherLink?: string;
  /** 微信小程序链接 */
  wxMiniprogramLink?: string;
  /** 微信小程序原始ID */
  wxMiniprogramOriginalId?: string;
  /** 微信小程序APP ID */
  wxMiniprogramAppId?: string;
  /** 手机APP端链接 */
  mobileAppLink?: string;
  /** 鸿蒙端链接 */
  harmonyLink?: string;
  /** 跳转方式，默认NEW_WINDOW */
  jumpWay?: string;
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
 * Data nested object
 */
export interface Data {
  /** 成功时返回null */
  field?: unknown;
}
/**
 * 1、获取观众观看详情列表

2、接口支持https协议

3、直播观看详情数据支持查询最近3年内的历史数据，建议将历史数据导出到本地储存，以便后续查询。
 */
export interface Api17d1Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 观众ID */
  viewerId: string;
  /** 开始日期。格式为yyyy-MM-dd */
  startDate?: string;
  /** 结束日期，必须和开始日期在同一个月。格式为yyyy-MM-dd */
  endDate?: string;
  /** 当前页数，第几页 */
  pageNumber?: string;
  /** 分页大小 */
  pageSize?: string;
}
/**
 * 1、获取观众观看详情列表

2、接口支持https协议

3、直播观看详情数据支持查询最近3年内的历史数据，建议将历史数据导出到本地储存，以便后续查询。
 */
export interface Api17d1Response {
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
  /** 地区 */
  area?: string;
  /** 观看终端 */
  browser?: string;
  /** 观众IP */
  ip?: string;
  /** 昵称 */
  nick?: string;
  /** 观看时长 */
  playDuration?: string;
  /** 频道号 */
  channelId?: number;
  /** 场次号 */
  sessionId?: string;
  /** 开始时间 */
  startTime?: string;
  /** 观看类型 */
  viewType?: string;
  /** 观众viewerId */
  viewerId?: string;
  /** 自定义参数param4 */
  param4?: string;
  /** 自定义参数param5 */
  param5?: string;
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
 * 1、查询观看记录

2、接口支持https协议

3、直播观看详情数据支持查询最近3年内的历史数据，建议将历史数据导出到本地储存，以便后续查询。

4、日期不传查当月数据
 */
export interface Api406fRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: string;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 开始日期。格式为yyyy-MM-dd */
  startDate?: string;
  /** 结束日期，必须和开始日期在同一个月。格式为yyyy-MM-dd */
  endDate?: string;
  /** 当前页数，第几页 */
  pageNumber?: string;
  /** 分页大小 */
  pageSize?: string;
  /** 观众ID */
  viewerId?: string;
  /** 频道ID */
  channelId?: number;
}
/**
 * 1、查询观看记录

2、接口支持https协议

3、直播观看详情数据支持查询最近3年内的历史数据，建议将历史数据导出到本地储存，以便后续查询。

4、日期不传查当月数据
 */
export interface Api406fResponse {
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
  /** 平均观看时长 */
  avgDuration?: string;
  /** 昵称 */
  nick?: string;
  /** 总观看时长 */
  totalDuration?: string;
  /** 观看次数 */
  viewCount?: number;
  /** 用户Id */
  viewerId?: string;
  /** 自定义参数param4 */
  param4?: string;
  /** 自定义参数param5 */
  param5?: string;
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
 * 1、应用权限列表
2、接口支持https协议
 */
export interface Api838aRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、应用权限列表
2、接口支持https协议
 */
export interface Api838aResponse {
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
  /** 权限列表【详见[Data字段说明](#data参数描述)】 */
  data?: unknown;
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
 * Data nested object
 */
export interface Data {
  /** 权限ID */
  id?: number;
  /** 权限名称 */
  name?: string;
}
/**
 * 1、添加应用角色
2、接口支持https协议
 */
export interface Api2cc7Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 角色名称 */
  name: string;
  /** 角色描述 */
  desc?: string;
  /** 角色类型(root:仅主账号可见， child:主账号和子账号都可见) */
  roleType: string;
  /** 权限ID列表，例如：[1,2,3] */
  permissionIds: unknown;
}
/**
 * 1、添加应用角色
2、接口支持https协议
 */
export interface Api2cc7Response {
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
  /** 请求成功返回空对象 */
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
 * 1、删除应用角色
2、接口支持https协议
 */
export interface Api2cc7Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 角色ID */
  id: number;
}
/**
 * 1、删除应用角色
2、接口支持https协议
 */
export interface Api2cc7Response {
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
  /** 请求成功返回空对象 */
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
 * 1、获取应用角色权限
2、接口支持https协议
 */
export interface Api17a6Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 角色ID */
  roleId: number;
}
/**
 * 1、获取应用角色权限
2、接口支持https协议
 */
export interface Api17a6Response {
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
  /** 角色权限信息【详见[Data参数描述](#data参数描述)】 */
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
 * Data nested object
 */
export interface Data {
  /** 角色信息【详见[Role参数描述](#role参数描述)】 */
  role?: Record<string, unknown>;
  /** 权限列表【详见[Permissions参数描述](#permissions参数描述)】 */
  permissions?: unknown;
}
/**
 * Role nested object
 */
export interface Role {
  /** 角色ID */
  id?: number;
  /** 角色名称 */
  name?: string;
  /** 用户ID */
  userId?: string;
  /** 角色描述 */
  description?: string;
  /** 角色状态 */
  status?: string;
  /** 创建时间（13位毫秒级时间戳） */
  createdTime?: number;
  /** 最后修改时间（13位毫秒级时间戳） */
  lastModified?: number;
  /** 权限名称 */
  permissionName?: string;
  /** 是否为旧角色 */
  isOldRole?: boolean;
  /** 角色类型(root:仅主账号可见， child:主账号和子账号都可见) */
  _type?: string;
}
/**
 * Permissions nested object
 */
export interface Permissions {
  /** 权限ID */
  id?: number;
  /** 权限类型 */
  _type?: string;
  /** 权限名称 */
  name?: string;
  /** 权限代码 */
  code?: string;
  /** 父权限ID */
  parentId?: number;
  /** 左节点值（用于树形结构） */
  lft?: number;
  /** 右节点值（用于树形结构） */
  rgt?: number;
  /** 创建时间（13位毫秒级时间戳） */
  createdTime?: number;
  /** 最后修改时间（13位毫秒级时间戳） */
  lastModified?: number;
  /** 权限层级深度 */
  depth?: number;
  /** 是否拥有该权限 */
  owned?: boolean;
}
/**
 * 1、查询应用角色列表
2、接口支持https协议
 */
export interface Api17a3Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 当前页数，第几页，默认为1 */
  pageNumber?: number;
  /** 分页大小，默认为10 */
  pageSize?: number;
}
/**
 * 1、查询应用角色列表
2、接口支持https协议
 */
export interface Api17a3Response {
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
  /** 【详见[Data字段说明](#data参数描述)】 */
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
 * Data nested object
 */
export interface Data {
  /** 分页数据集合【详见[Contents参数描述](#contents参数描述)】 */
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
  /** 角色ID */
  id?: number;
  /** 角色名称 */
  name?: string;
  /** 用户ID */
  userId?: string;
  /** 角色描述 */
  description?: string;
  /** 角色状态 */
  status?: boolean;
  /** 创建时间戳 */
  createdTime?: number;
  /** 最后修改时间戳 */
  lastModified?: number;
  /** 权限名称 */
  permissionName?: string;
  /** 是否为旧角色 */
  isOldRole?: boolean;
  /** 角色类型(root:仅主账号可见， child:主账号和子账号都可见) */
  _type?: string;
}
/**
 * 1、更新应用角色信息
2、接口支持https协议
 */
export interface Api17a3Request {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 角色ID */
  roleId: number;
  /** 角色名称 */
  name: string;
  /** 角色描述 */
  desc?: string;
  /** 角色类型(root:仅主账号可见， child:主账号和子账号都可见) */
  roleType: string;
  /** 权限ID列表，例如：[1,2,3] */
  permissionIds?: unknown;
}
/**
 * 1、更新应用角色信息
2、接口支持https协议
 */
export interface Api17a3Response {
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
  /** 请求成功返回空对象 */
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
