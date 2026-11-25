/**
 * account API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module account by scripts/generate-types.ts
 */

/**
 * 1、查询用户点播账户的空间及流量使用情况
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetAccountSpaceFlowRequest {
  /** 保利威点播账户id，可以参考【[获取密钥](/vod/api/getSecretKey)】获取，获取路径：官网->登录->点播（API接口） */
  userid: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 要查询的日期，格式 ：yyyy-MM-dd */
  date: string;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
}
/**
 * 1、查询用户点播账户的空间及流量使用情况
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetAccountSpaceFlowResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回频道详细信息【详见[data字段说明](/vod/api/account/get_account_space_flow.md?id=polyv1)】 */
  data?: Record<string, unknown>;
}
