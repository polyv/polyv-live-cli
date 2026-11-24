/**
 * playsafe API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module playsafe by scripts/generate-types.ts
 */

/**
 * 1、查询播放域名的限制
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetDomainRestrictSettingRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询播放域名的限制
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetDomainRestrictSettingResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回播放域名限制信息【详见[data字段说明](/vod/api/playsafe/domain_restrict/get_domain_restrict_setting.md?id=data字段说明)】，响应失败时返回空 */
  data?: Record<string, unknown>;
}
/**
 * 1、设置播放域名为黑名单或者白名单
2、接口支持https协议
 */
export interface SetDomainRestrictRequest {
  /** POLYV用户的点播写密钥，和保利威官网一致，获取路径：官网->登录->云点播（api接口） */
  writetoken: string;
  /** host字符串，用英文逗号隔开，例如：`www.baidu.com,www.163.com` */
  host: string;
  /** 设置类型<br />1：黑名单<br />2：白名单 */
  settingType: string;
}
/**
 * 1、设置播放域名为黑名单或者白名单
2、接口支持https协议
 */
export interface SetDomainRestrictResponse {
  /** 请求成功返回0，请求失败返回错误代码【详见[返回错误代码列表](/vod/api/playsafe/domain_restrict/set_domain_restrict.md?id=返回错误代码列表)】 */
  error?: string;
}
/**
 * 1、设置播放域名的限制规则
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface SetDomainRestrictRuleRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 域名限制类型<br/>0：无域名限制<br/>1：黑名单<br/>2：白名单<br/>3：白名单和黑名单复合限制（先判断白名单，再判断黑名单） */
  settingType: number;
  /** 域名配置，多个域名以英文逗号分隔，此参数仅在请求参数settingType值为1和2时且不为null时有效，最多设置5个 */
  host?: string;
}
/**
 * 1、设置播放域名的限制规则
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface SetDomainRestrictRuleResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回修改成功.，响应失败时返回空 */
  data?: string;
}
/**
 * 1、查询用户账号下的加密设置
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetEncryptionSettingRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询用户账号下的加密设置
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetEncryptionSettingResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回账号加密信息【详见[data字段说明](/vod/api/playsafe/encryption/get_encryption_setting.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过视频id修改视频的授权方式，支持批量修改
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface UpdateAuthLevelRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，多个时用英文逗号隔开 */
  vids: string;
  /** 视频加密设置<br/>open: 非加密授权<br/>web: WEB授权<br/>app: APP授权<br/>wxa_app：小程序授权 */
  hlslevel: string;
}
/**
 * 1、通过视频id修改视频的授权方式，支持批量修改
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface UpdateAuthLevelResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回修改成功的视频个数 */
  data?: Record<string, unknown>;
}
/**
 * 1、修改用户账号下的加密设置
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface UpdateEncryptionSettingRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 是否开启加密（仅对新上传视频有效）<br/>1：开启<br/>0：关闭 */
  encrypt: string;
  /** 视频加密设置<br/>open: 非加密授权<br/>web: WEB授权<br/>app: APP授权<br/>wxa_app：小程序授权 */
  hlslevel: string;
}
/**
 * 1、修改用户账号下的加密设置
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface UpdateEncryptionSettingResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回账号加密信息【详见[data字段说明](/vod/api/playsafe/encryption/update_encryption_setting.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过视频id查询视频播放密码
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetVideoPasswordRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，多个用英文逗号隔开 */
  vids: string;
}
/**
 * 1、通过视频id查询视频播放密码
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetVideoPasswordResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回视频播放密码信息【详见[data字段说明](/vod/api/playsafe/password/get_video_password.md?id=polyv1)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过视频id修改视频播放密码
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface SetVideoPasswordRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，多个使用英文逗号分隔 */
  vids: string;
  /** 视频描述 */
  describ?: string;
  /** 视频密码 */
  password?: string;
  /** 首发外链 */
  publishUrl?: string;
  /** 视频标签 */
  tag?: string;
  /** 视频标题 */
  title?: string;
}
/**
 * 1、通过视频id修改视频播放密码
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface SetVideoPasswordResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回修改视频个数，失败时返回空字符串 */
  data?: Record<string, unknown>;
}
/**
 * 1、查询授权播放和防录屏跑马灯接口设置
2、接口支持https协议
 */
export interface GetMarqueeSettingRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询授权播放和防录屏跑马灯接口设置
2、接口支持https协议
 */
export interface GetMarqueeSettingResponse {
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
export interface GetMarqueeSettingError {
  /** 错误代码，用于确定具体的错误原因 */
  code?: number;
  /** 错误描述，与 error.code 对应 */
  desc?: string;
}
/**
 * 1、通过视频id查询单个视频的授权播放开关状态
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetPlayAuthSettingRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id */
  vid: string;
}
/**
 * 1、通过视频id查询单个视频的授权播放开关状态
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetPlayAuthSettingResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功返回开关状态信息，响应失败返回空<br/>0：开关关闭<br/>1：开关开启 */
  data?: Record<string, unknown>;
}
/**
 * 1、修改授权播放和防录屏跑马灯接口设置
2、接口支持https协议
 */
export interface UpdateMarqueeSettingRequest {
  /** 账号appId【详见[获取密钥](/live/api/getSecretKey)】 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，为32位大写的MD5值,<code style="color:red">生成签名的appSecret密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 授权播放和防录屏跑马灯url，不传则清空设置 */
  marqueeUrl?: string;
}
/**
 * 1、修改授权播放和防录屏跑马灯接口设置
2、接口支持https协议
 */
export interface UpdateMarqueeSettingResponse {
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
export interface UpdateMarqueeSettingError {
  /** 错误代码，用于确定具体的错误原因 */
  code?: number;
  /** 错误描述，与 error.code 对应 */
  desc?: string;
}
/**
 * 1、通过视频id修改单个或多个视频的授权播放开关状态
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface UpdatePlayAuthSettingRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，多个用英文逗号隔开 */
  vids: string;
  /** 授权播放开关是否开启，默认为1，开启<br/>0：关闭<br/>1：开启 */
  playauth?: number;
}
/**
 * 1、通过视频id修改单个或多个视频的授权播放开关状态
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface UpdatePlayAuthSettingResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功返回成功修改的数量，响应失败返回空 */
  data?: Record<string, unknown>;
}
/**
 * 1、获取Playsafe Token（播放凭证），用于播放加密视频
2、如果一个token尚未过期，此时使用相同的videoId、viewerId、viewerIp、iswxa参数值请求该接口，则会复用原来的token，并延长原token的有效期
3、接口支持https协议
 */
export interface CreateTokenRequest {
  /** 保利威点播账户id，可以参考【[获取密钥](/vod/api/getSecretKey)】获取，获取路径：官网->登录->点播（API接口） */
  userid: string;
  /** 签名，为32位大写的MD5值【详见[MD5签名生成规则](/vod/api/buildSignMd5)】 */
  sign: string;
  /** 视频id，例如：e6b23c6f519c5906e54a13b8200d7bb0_e */
  videoId: string;
  /** 当前13位毫秒级时间戳，10分钟内有效 */
  ts: number;
  /** 观看者id，要求不同的观看者使用不同的id，由数字字母组成；移动端请求需对viewerId进行base64处理 */
  viewerId: string;
  /** 观看者ip，如果为空，会自动获取调用该接口时的ip */
  viewerIp?: string;
  /** 观看者名称 */
  viewerName?: string;
  /** token有效时长，单位为秒。为空时默认为10分钟，有效期为最长24小时。 */
  expires?: number;
  /** token有效期，默认为false<br/>true：token仅一次有效（验证一次后，token就失效了）<br/>false：在有效期内可以进行多次验证。 */
  disposable?: boolean;
  /** 是否微信小程序播放，默认为0<br/>1：是<br/>0：否 */
  iswxa?: number;
  /** 设备端类型，用于限制请求端，参数值：WEB-网页端，NATIVE-原生端。 */
  _type?: string;
  /** 自定义的其它参数 */
  extraParams?: string;
  /** 私有加密视频自定义token加密因子, 用于提高视频播放的安全性, 需搭配指定的播放器使用, 详细使用规则请咨询保利威客服 */
  securitySeed?: string;
}
/**
 * 1、获取Playsafe Token（播放凭证），用于播放加密视频
2、如果一个token尚未过期，此时使用相同的videoId、viewerId、viewerIp、iswxa参数值请求该接口，则会复用原来的token，并延长原token的有效期
3、接口支持https协议
 */
export interface CreateTokenResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回token相关数据 【详见[data字段说明](/vod/api/playsafe/token/create_token.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
