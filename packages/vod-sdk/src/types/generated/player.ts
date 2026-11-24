/**
 * player API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module player by scripts/generate-types.ts
 */

/**
 * 目前已有新版本的播口，建议使用新版本接口：[查询播放器列表](/vod/api/player/player_list)


1、通过用户id，查询播放器列表
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetPlayerListRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
}
/**
 * 目前已有新版本的播口，建议使用新版本接口：[查询播放器列表](/vod/api/player/player_list)


1、通过用户id，查询播放器列表
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetPlayerListResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回播放器列表信息【详见[data字段说明](/vod/api/player/get_player_list.md?id=data字段说明)】，响应失败时返回空 */
  data?: unknown;
}
/**
 * 查询账号下的全部播放器信息
 */
export interface PlayerListRequest {
  /** 账号id */
  userid: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
}
/**
 * 查询账号下的全部播放器信息
 */
export interface PlayerListResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回播放器列表信息【详见[data字段说明](/vod/api/player/player_list.md?id=data字段说明)】，响应失败时返回空 */
  data?: unknown;
}
/**
 * 1、通过视频id和播放器id，设置视频的播放器
2、接口支持https协议
 */
export interface SetPlayerRequest {
  /** 保利威点播账户id，可以参考【[获取密钥](/vod/api/getSecretKey)】获取，获取路径：官网->登录->点播（API接口） */
  userid: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，例如：1b448be3235552e5fafb16489eb01839_1，获取路径：保利威点播后台->视频列表； */
  vid: string;
  /** 播放器id，获取路径：保利威点播后台->播放器设置；<br />也可以获取自【[查询播放器列表](/vod/api/player/get_player_list.md)】；<br />当playerid的值为其他非法值时，视频的播放器id会设置为默认播放器id */
  playerId: string;
}
/**
 * 1、通过视频id和播放器id，设置视频的播放器
2、接口支持https协议
 */
export interface SetPlayerResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回播放器列表信息【详见[data字段说明](/vod/api/player/set_player.md?id=data字段说明)】，响应失败时返回空 */
  data?: unknown;
}
/**
 * 更新一个播放器的logo设置信息
 */
export interface UpdateLogoRequest {
  /** 账号id */
  userid: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 播放器id */
  playerId: string;
  /** logo图片文件，大小不超过5MB<br>支持的文件类型：jpg, jpeg, png, gif */
  logoImageFile?: File | Blob;
  /** logo点击跳转地址 */
  logoLinkUrl?: string;
  /** logo不透明度，0~100，必须为10的倍数，例如0、10、20等 */
  logoOpacity?: string;
  /** logo显示位置<br>0: 不显示<br>1: 左上角<br>2: 右上角<br>3: 左下角<br>4:右下角 */
  logoDisplayLocation?: string;
}
/**
 * 更新一个播放器的logo设置信息
 */
export interface UpdateLogoResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回更新后的播放器信息【详见[data字段说明](/vod/api/player/update_logo.md?id=data字段说明)】，响应失败时返回空 */
  data?: Record<string, unknown>;
}
