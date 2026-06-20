/**
 * root API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module root by scripts/generate-types.ts
 *
 * Last updated: 2026-06-20T00:51:38.555Z
 */

/**
 * 1、给渠道提供保利威账号注册接口。
2、接口支持https协议
 */
export interface Api4ac9Request {
  /** 企业级appId，由保利威提供 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，其中appSecret为企业级appSecret，由保利威提供，为32位大写的MD5值【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
  /** 公司名称，最大长度32 */
  company: string;
  /** 手机号，最大长度11 */
  mobile: number;
  /** 联系人，最大长度12 */
  contact: string;
  /** 邮箱，作为保利威登录账号，同一邮箱不能重复注册 */
  email: string;
}
/**
 * 1、给渠道提供保利威账号注册接口。
2、接口支持https协议
 */
export interface Api4ac9Response {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
  /** 请求响应对象【详见[Data参数描述](#Data参数描述)】 */
  data?: boolean;
  /** 错误信息【详见[Error参数描述](#Error参数描述)】 */
  error?: Record<string, unknown>;
}
/**
 * Data nested object
 */
export interface Data {
  /** 保利威后台userId */
  userId?: string;
  /** 保利威后台登录密码 */
  password?: string;
  /** 保利威后台appId */
  appId?: string;
  /** 保利威后台appSecret，请妥善保管，该字段涉及账号安全 */
  appSecret?: string;
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
 * 1、该接口接收用户购买信息，通知保利威工作人员，由工作人员线下开通账号。
2、（timestamp, appId, signatureNonce）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api2e3bRequest {
  /** 企业级appId，由保利威提供 */
  appId: string;
  /** 当前13位毫秒级时间戳，3分钟内有效 */
  timestamp: number;
  /** 签名，其中appSecret为企业级appSecret，由保利威提供，为32位大写的MD5值【详见[签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、该接口接收用户购买信息，通知保利威工作人员，由工作人员线下开通账号。
2、（timestamp, appId, signatureNonce）参与sign签名，并和sign一起通过url传递，请求体参数不参与签名，通过post请求体传递【请设置请求头contentType:application/json】
3、接口支持https协议
 */
export interface Api2e3bResponse {
  /** 状态码，与 http 状态码相同，用于确定基本的响应状态 */
  code?: number;
  /** 响应结果，由业务决定，成功返回success，失败返回error */
  status?: string;
  /** 是否成功响应 */
  success?: boolean;
  /** 请求ID，每次请求生成的唯一的 UUID，仅可用于排查、调试，不应该和业务挂上钩 */
  requestId?: string;
  /** 请求响应对象，成功返回true，失败返回false */
  data?: boolean;
  /** 错误信息【详见[Error参数描述](#Error参数描述)】 */
  error?: Record<string, unknown>;
}
/**
 * BasicService nested object
 */
export interface BasicService {
  /** 基础服务类型【详见[基础服务类型说明](#基础服务类型说明)】，<br/>standard：标准版；<br/>enterprise：企业版；<br/>flagship：旗舰版； */
  _type?: string;
  _number?: unknown;
}
/**
 * PremiumService nested object
 */
export interface PremiumService {
  /** 增值服务类型【详见[增值服务类型说明](#增值服务类型说明)】，<br/>premium_package：增值扩容包，单位：个；<br/>group_account：集团账号，单位：年；<br/>quality_analysis：品质分析，单位：年；<br/>live_transfer：直播转推，单位：次；<br/>link_mic_time：云直播连麦，单位：分钟；<br/>playback_store：回放存储，单位：GB；<br/>playback_flow：回放流量，单位：GB；<br/>channel_number：频道个数，单位：个；<br/>live_time：直播分钟数，单位：分钟；<br/>monitoring_time：导播台分钟数，单位：分钟； */
  _type?: string;
  /** 续费数量 */
  _number?: number;
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
