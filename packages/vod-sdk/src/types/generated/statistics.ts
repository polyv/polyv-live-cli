/**
 * statistics API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module statistics by scripts/generate-types.ts
 */

/**
 * 1、分页查询所有已发布视频的视频分析数据
2、接口支持https协议
 */
export interface BatchGetVideoAnalysisRequest {
  /** 直播appId。可在"云点播" -> "设置" -> "API接口" 中查看您的直播appId和appSecret */
  appId: string;
  /** 当前时间的毫秒级时间戳，30分钟内有效 */
  timestamp: number;
  /** 分页页码，从1开始，默认值为1 */
  page?: number;
  /** 分页大小，默认值为10，最大支持值为100 */
  pageSize?: number;
  /** vid集合，需要批量查询指定vid的视频分析数据时可以传此参数，多个vid用英文逗号隔开，一次接口调用最多支持传100个vid。如833584471db2eb2b9d0b582e7e755c66_8,833584471d0ed109bb261b104f584896_8 */
  vidList?: string;
  /** 签名，32位大写MD5值【详见[MD5签名生成规则](/live/api/buildSign)】 */
  sign: string;
}
/**
 * 1、分页查询所有已发布视频的视频分析数据
2、接口支持https协议
 */
export interface BatchGetVideoAnalysisResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 请求唯一标识，如遇接口调用失败情况，可发此id给客服辅助排查问题 */
  requestId?: string;
  /** 响应成功时返回视频分析详细数据 【详见[data字段说明](/vod/api/statistics/bigdata/batch_get_video_analysis.md.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
  /** 失败时的错误信息，【详见[error字段说明](/vod/api/statistics/bigdata/batch_get_video_analysis.md.md?id=error字段说明)】 */
  error?: Record<string, unknown>;
}
/**
 * 1、通过时间区间分页查询观看行为分析数据
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、观看完成度=用户观看有效时长/视频时长，例如：视频A时长为50分钟，用户观看了第0~20分钟，拖拽进度条后观看了第10~30分钟，此时用户有效观看时长为30分钟，则完成度为 30/50=60%
4、接口支持https协议
 */
export interface GetPlayAnalysisRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 开始时间，格式：yyyy-MM-dd或者yyyy-MM-dd HH:mm:ss，查询范围不超过31天 */
  start?: string;
  /** 结束时间，格式：yyyy-MM-dd或者yyyy-MM-dd HH:mm:ss，查询范围不超过31天 */
  end?: string;
  /** 每页取多少条数据（最大为20，超过则默认取20条数据） */
  pageSize?: number;
  /** 自定义观看者id */
  viewerId?: string;
  /** 观看者昵称 */
  viewerName?: string;
  /** 视频id，不传查当前账号下所有视频的观看行为分析数据 */
  vid?: string;
  /** 下一页的凭证，从当前页的返回数据里获取，第一页不需要传 */
  token?: string;
}
/**
 * 1、通过时间区间分页查询观看行为分析数据
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、观看完成度=用户观看有效时长/视频时长，例如：视频A时长为50分钟，用户观看了第0~20分钟，拖拽进度条后观看了第10~30分钟，此时用户有效观看时长为30分钟，则完成度为 30/50=60%
4、接口支持https协议
 */
export interface GetPlayAnalysisResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回观看行为分析详细数据 【详见[data字段说明](/vod/api/statistics/bigdata/get_play_analysis.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过视频id查询视频分析
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetVideoAnalysisRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id */
  vid: string;
}
/**
 * 1、通过视频id查询视频分析
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetVideoAnalysisResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回视频分析详细数据 【详见[data字段说明](/vod/api/statistics/bigdata/get_video_analysis.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过观众id查询观众分析
2、接口URL中的{userid}为点播账号userid，具体参考【获取密钥】
3、接口支持https协议
 */
export interface GetViewerAnalysisRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 自定义观众id */
  viewerId: string;
}
/**
 * 1、通过观众id查询观众分析
2、接口URL中的{userid}为点播账号userid，具体参考【获取密钥】
3、接口支持https协议
 */
export interface GetViewerAnalysisResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回观众分析详细数据 【详见[data字段说明](/vod/api/statistics/bigdata/get_viewer_analysis.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、查询分类下视频播放情况及消耗流量汇总数据
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、从播放行为产生到数据可查询的间隔时间为1~2小时，流量消耗（flowSize字段）的计算依赖于CDN日志，为了保证数据完整性，流量数据需要间隔一个自然日才会生成
4、分类统计功能需开通使用
5、接口支持https协议
 */
export interface GetCataStatsRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 分类id */
  cataid: string;
  /** 时间段，具体值为以下几个，默认值为7days<br>today：今天<br>yesterday：昨天<br>this_week：本周<br>last_week：上周<br>7days：最近7天<br>this_month：本月<br>last_month：上个月<br>this_year：今年 <br>last_year：去年 */
  dr?: string;
  /** 开始日期，格式为：yyyy-MM-dd，例如：2021-04-07 */
  startDate?: string;
  /** 结束日期，格式为：yyyy-MM-dd，例如：2021-04-10 */
  endDate?: string;
  /** 是否包含子分类的数据<br/>Y：是<br/>N：否 */
  containSubCategory?: string;
}
/**
 * 1、查询分类下视频播放情况及消耗流量汇总数据
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、从播放行为产生到数据可查询的间隔时间为1~2小时，流量消耗（flowSize字段）的计算依赖于CDN日志，为了保证数据完整性，流量数据需要间隔一个自然日才会生成
4、分类统计功能需开通使用
5、接口支持https协议
 */
export interface GetCataStatsResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回分类统计数据【详见[data字段描述](/vod/api/statistics/get_cata_stats.md?id=data字段描述)】 */
  data?: unknown;
}
/**
 * 1、通过分类id查询分类目录的空间占用情况
2、接口支持https协议
 */
export interface GetCategorySpaceUsageRequest {
  /** 保利威点播账户id，可以参考【[获取密匙](/vod/api/getSecretKey)】获取，获取路径：官网->登录->点播（API接口） */
  userid: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 目录分类id，默认为1，表示默认分类 */
  cataid: string;
}
/**
 * 1、通过分类id查询分类目录的空间占用情况
2、接口支持https协议
 */
export interface GetCategorySpaceUsageResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回分类目录下的占用空间大小，单位：字节 */
  data?: number;
}
/**
 * 1、通过具体时间查询观看日志
2、从播放行为产生到数据可查询的间隔时间为1~2小时
3、响应参数消耗流量（flowSize字段）的计算依赖于CDN日志，为了保证数据完整性，流量数据需要间隔一个自然日才会生成
4、接口URL中的{userid}为点播账号userid，具体参考【获取密钥】
5、接口支持https协议
 */
export interface GetDailyViewlogRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 需查询日志信息的具体时间，格式：yyyyMMdd，例如：20210407 */
  day: string;
  /** 范围查询，需查询日志信息的具体时分秒，格式：HHmmss，例如：000000，timeStart和timeEnd需要搭配使用 */
  timeStart?: string;
  /** 范围查询，需查询日志信息的具体时分秒，格式：HHmmss，例如：235959，timeStart和timeEnd需要搭配使用 */
  timeEnd?: string;
  /** 返回的数据格式，默认返回json格式<br/>xml：返回xml格式<br/>json：返回json格式 */
  _type?: string;
  /** 视频id */
  vid?: string;
  /** 分类id，注意视频id和分类id为空时，获取账号当天所有视频日志；当视频id为空、分类id不为空时，查询对应分类下的日志；当视频id不为空时查询对应视频的日志 */
  cataid?: string;
  /** 用户自定义id */
  sessionId?: string;
  /** 用户自定义id，当和sessionId同时传递时，会以viewerId为准 */
  viewerId?: string;
}
/**
 * 1、通过具体时间查询观看日志
2、从播放行为产生到数据可查询的间隔时间为1~2小时
3、响应参数消耗流量（flowSize字段）的计算依赖于CDN日志，为了保证数据完整性，流量数据需要间隔一个自然日才会生成
4、接口URL中的{userid}为点播账号userid，具体参考【获取密钥】
5、接口支持https协议
 */
export interface GetDailyViewlogResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回日志详细信息【详见[data字段说明](/vod/api/statistics/get_daily_viewlog.md?id=data字段说明)】 */
  data?: unknown;
}
/**
 * 1、查询视频终端环境统计数据，包括浏览器环境，操作系统环境，终端环境。从播放行为产生到数据可查询的间隔时间为1~2小时
2、接口URL中的{userid}为点播账号userid，具体参考【获取密钥】
3、接口支持https协议
 */
export interface GetDeviceStatRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 时间段，具体值为以下几个，默认值为7days<br>today：今天<br>yesterday：昨天<br>this_week：本周<br>last_week：上周<br>7days：最近7天<br>this_month：本月<br>last_month：上个月<br>this_year：今年 <br>last_year：去年 */
  dr?: string;
  /** 开始日期，格式为：yyyy-MM-dd，例如：2021-04-07 */
  start?: string;
  /** 结束日期，格式为：yyyy-MM-dd，例如：2021-04-10 */
  end?: string;
}
/**
 * 1、查询视频终端环境统计数据，包括浏览器环境，操作系统环境，终端环境。从播放行为产生到数据可查询的间隔时间为1~2小时
2、接口URL中的{userid}为点播账号userid，具体参考【获取密钥】
3、接口支持https协议
 */
export interface GetDeviceStatResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回域名统计信息【详见[Data字段说明](/vod/api/statistics/get_device_stat.md?id=polyv1)】,响应失败时返回空 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过视频id查询视频播放域名分布数据
2、从播放行为产生到数据可查询的间隔时间为1~2小时
3、响应参数消耗流量（PCFlowSize字段）的计算依赖于CDN日志，为了保证数据完整性，流量数据需要间隔一个自然日才会生成
4、接口URL中的{userid}为点播账号userid，具体参考【获取密钥】
5、接口支持https协议
 */
export interface GetDomainStatRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id */
  vid?: string;
  /** 时间段，具体值为以下几个，默认值为7days<br>today：今天<br>yesterday：昨天<br>this_week：本周<br>last_week：上周<br>7days：最近7天<br>this_month：本月<br>last_month：上个月<br>this_year：今年 <br>last_year：去年 */
  dr?: string;
  /** 开始日期，格式为：yyyy-MM-dd，例如：2021-04-07 */
  start?: string;
  /** 结束日期，格式为：yyyy-MM-dd，例如：2021-04-10 */
  end?: string;
}
/**
 * 1、通过视频id查询视频播放域名分布数据
2、从播放行为产生到数据可查询的间隔时间为1~2小时
3、响应参数消耗流量（PCFlowSize字段）的计算依赖于CDN日志，为了保证数据完整性，流量数据需要间隔一个自然日才会生成
4、接口URL中的{userid}为点播账号userid，具体参考【获取密钥】
5、接口支持https协议
 */
export interface GetDomainStatResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回域名统计信息【详见[Data字段说明](/vod/api/statistics/get_domain_stat.md?id=polyv1)】，响应失败时返回空 */
  data?: unknown;
}
/**
 * 1、查询观众累计观看单个视频的完成度情况
2、数据的查询需要间隔一天,该接口需联系客服开通后才能使用
3、观看完成度=用户观看有效时长/视频时长，例如：视频A时长为50分钟，用户使用PC H5观看了第0~20分钟，又使用APP观看了第10~30分钟，此时用户有效观看时长为30分钟，则完成度为 30/50=60%
4、接口URL中的{userid}为点播账号userid，具体参考【获取密钥】
5、接口支持https协议
 */
export interface GetEngageStatRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id */
  vid: string;
  /** 自定义观众id */
  viewerId: string;
  /** 是否查询倍速下的观看完成度，Y/N，默认为N */
  queryBySpeed?: string;
}
/**
 * 1、查询观众累计观看单个视频的完成度情况
2、数据的查询需要间隔一天,该接口需联系客服开通后才能使用
3、观看完成度=用户观看有效时长/视频时长，例如：视频A时长为50分钟，用户使用PC H5观看了第0~20分钟，又使用APP观看了第10~30分钟，此时用户有效观看时长为30分钟，则完成度为 30/50=60%
4、接口URL中的{userid}为点播账号userid，具体参考【获取密钥】
5、接口支持https协议
 */
export interface GetEngageStatResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回视频已完成进度比例，响应失败时返回空 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过视频id和时间范围查询单个视频播放的流量，流量数据需要间隔一个自然日生成
2、自2018年7月10日起，才可以统计到单个视频的移动端流量数据，在此之前没有移动端流量数据
3、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
4、接口URL中的{vid}为视频id
5、接口支持https协议
 */
export interface GetFlowUsageRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id */
  vid: string;
  /** 时间段，默认值为7days，最近7天<br/>today：今天<br/>yesterday：昨天<br/>this_week：本周<br/>last_week：上周<br/>7days：最近7天<br/>this_month：本月<br/>last_month：上个月<br/>this_year：今年<br/>last_year：去年 */
  dr?: string;
  /** 开始日期，格式为yyyy-MM-dd，例如：2021-03-31 */
  start?: string;
  /** 结束日期，格式为yyyy-MM-dd，例如：2021-04-02 */
  end?: string;
}
/**
 * 1、通过视频id和时间范围查询单个视频播放的流量，流量数据需要间隔一个自然日生成
2、自2018年7月10日起，才可以统计到单个视频的移动端流量数据，在此之前没有移动端流量数据
3、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
4、接口URL中的{vid}为视频id
5、接口支持https协议
 */
export interface GetFlowUsageResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功返回视频播放流量统计数据，响应失败返回空【详见[data字段说明](/vod/api/statistics/get_flow_usage.md.md?id=data参数描述)】 */
  data?: unknown;
}
/**
 * data nested object
 */
export interface GetFlowUsageData {
  /** 数据生成日期，格式为：yyyy-MM-dd */
  currentDay?: string;
  /** pc端消耗流量，单位字节 */
  pcFlowSize?: number;
  /** 移动端消耗流量，单位字节 */
  mobileFlowSize?: number;
  /** 总消耗流量，单位字节 */
  totalFlowSize?: number;
}
/**
 * 1、通过日期区间查询视频播放地理位置统计数据
2、从播放行为产生到数据可查询的间隔时间为1~2小时
3、响应参数消耗流量（PCFlowSize字段）的计算依赖于CDN日志，为了保证数据完整性，流量数据需要间隔一个自然日才会生成
4、接口URL中的{userid}为点播账号userid，具体参考【获取密钥】
5、接口支持https协议
 */
export interface GetGeoStatRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 时间段，具体值为以下几个，默认值为7days<br>today：今天<br>yesterday：昨天<br>this_week：本周<br>last_week：上周<br>7days：最近7天<br>this_month：本月<br>last_month：上个月<br>this_year：今年 <br>last_year：去年 */
  dr?: string;
  /** 开始日期，格式为：yyyy-MM-dd，例如：2021-04-07 */
  start?: string;
  /** 结束日期，格式为：yyyy-MM-dd，例如：2021-04-10 */
  end?: string;
}
/**
 * 1、通过日期区间查询视频播放地理位置统计数据
2、从播放行为产生到数据可查询的间隔时间为1~2小时
3、响应参数消耗流量（PCFlowSize字段）的计算依赖于CDN日志，为了保证数据完整性，流量数据需要间隔一个自然日才会生成
4、接口URL中的{userid}为点播账号userid，具体参考【获取密钥】
5、接口支持https协议
 */
export interface GetGeoStatResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回地理位置统计信息【详见[Data字段说明](/vod/api/statistics/get_geo_stat.md?id=polyv1)】，响应失败时返回空 */
  data?: unknown;
}
/**
 * 1、通过日期区间查询单个视频的观看热点统计数据，从播放行为产生到数据可查询的间隔时间为1~2小时
2、接口URL中的{userid}为点播账号userid，具体参考【获取密钥】
3、接口支持https协议
 */
export interface GetHotspotStatRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id */
  vid: string;
  /** 时间段，具体值为以下几个，默认值为7days<br>today：今天<br>yesterday：昨天<br>this_week：本周<br>last_week：上周<br>7days：最近7天<br>this_month：本月<br>last_month：上个月<br>this_year：今年 <br>last_year：去年 */
  dr?: string;
  /** 开始日期，格式为：yyyy-MM-dd，例如：2021-03-31 */
  start?: string;
  /** 结束日期，格式为：yyyy-MM-dd，例如：2021-04-08 */
  end?: string;
}
/**
 * 1、通过日期区间查询单个视频的观看热点统计数据，从播放行为产生到数据可查询的间隔时间为1~2小时
2、接口URL中的{userid}为点播账号userid，具体参考【获取密钥】
3、接口支持https协议
 */
export interface GetHotspotStatResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回观看热点统计信息【详见[Data字段说明](/vod/api/statistics/get_hotspot_stat.md?id=polyv1)】,响应失败时返回空 */
  data?: unknown;
}
/**
 * 1、通过视频id和时间范围查询单个或全部视频的播放时长统计数据，播放后生成数据需间隔一到两小时
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetPlayDurationRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，不传则查询用户所有视频的播放时长数据 */
  vid?: string;
  /** 时间段，默认值为7days，最近7天<br/>today：今天<br/>yesterday：昨天<br/>this_week：本周<br/>last_week：上周<br/>7days：最近7天<br/>this_month：本月<br/>last_month：上个月<br/>this_year：今年<br/>last_year：去年 */
  dr?: string;
  /** 开始日期，格式为yyyy-MM-dd，例如：2021-03-30 */
  start?: string;
  /** 结束日期，格式为yyyy-MM-dd，例如：2021-04-01 */
  end?: string;
}
/**
 * 1、通过视频id和时间范围查询单个或全部视频的播放时长统计数据，播放后生成数据需间隔一到两小时
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetPlayDurationResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功返回视频播放时长统计数据，响应失败返回空【详见[data字段说明](/vod/api/statistics/get_play_duration.md?id=data参数描述)】 */
  data?: unknown;
}
/**
 * data nested object
 */
export interface GetPlayDurationData {
  /** 数据生成日期，格式为：yyyy-MM-dd */
  currentDay?: string;
  /** pc端播放时长，单位秒 */
  pcPlayDuration?: number;
  /** 格式化的pc端播放时长，格式为：时:分:秒 */
  formatPcPlayDuration?: string;
  /** pc端视频平均播放时长，单位秒 */
  pcPlayDurationVideoAvg?: number;
  /** 格式化的pc端视频平均播放时长，格式为：时:分:秒 */
  formatPcPlayDurationVideoAvg?: string;
  /** pc端人均播放时长，单位秒 */
  pcPlayDurationPersonAvg?: number;
  /** 格式化的pc端人均播放时长，格式为：时:分:秒 */
  formatPcPlayDurationPersonAvg?: string;
  /** 移动端播放时长，单位秒 */
  mobilePlayDuration?: number;
  /** 格式化的移动端播放时长，格式为：时:分:秒 */
  formatMobilePlayDuration?: string;
  /** 移动端视频平均播放时长，单位秒 */
  mobilePlayDurationVideoAvg?: number;
  /** 格式化的移动端视频平均播放时长，格式为：时:分:秒 */
  formatMobilePlayDurationVideoAvg?: string;
  /** 移动端人均播放时长，单位秒 */
  mobilePlayDurationPersonAvg?: number;
  /** 格式化的移动端人均播放时长，格式为：时:分:秒 */
  formatMobilePlayDurationPersonAvg?: string;
}
/**
 * 1、查询视频播放量在不同终端的统计数据，从播放行为产生到数据可查询的间隔时间为1~2小时
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetPlaytimesRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，不填会查所有视频的播放量统计数据 */
  vid?: string;
  /** 时间段，不传默认为7days<br/>today：今天<br/>yesterday：昨天<br/>this_week：本周<br/>last_week：上周<br/>7days：最近7天<br/>this_month：本月<br/>last_month：上个月<br/>this_year：今年<br/>last_year：去年 */
  dr?: string;
  /** 显示周期，不传默认为daily<br/>daily：按日显示<br/>weekly：按周显示<br/>monthly：按月显示<br/> */
  period?: string;
}
/**
 * 1、查询视频播放量在不同终端的统计数据，从播放行为产生到数据可查询的间隔时间为1~2小时
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetPlaytimesResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回视频播放统计数据的数组【详见[data字段说明](/vod/api/statistics/get_playtimes.md?id=polyv1)】 */
  data?: unknown;
}
/**
 * 1、通过时间范围查询用户视频播放时段统计数据，播放后生成数据需间隔一到两小时，其中流量数据间隔一个自然日生成
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetPlaytimesByPeriodRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 时间段，默认值为7days，最近7天<br/>today：今天<br/>yesterday：昨天<br/>this_week：本周<br/>last_week：上周<br/>7days：最近7天<br/>this_month：本月<br/>last_month：上个月<br/>this_year：今年<br/>last_year：去年 */
  dr?: string;
  /** 开始日期，格式为yyyy-MM-dd，例如：2021-03-31 */
  start?: string;
  /** 结束日期，格式为yyyy-MM-dd，例如：2021-04-02 */
  end?: string;
}
/**
 * 1、通过时间范围查询用户视频播放时段统计数据，播放后生成数据需间隔一到两小时，其中流量数据间隔一个自然日生成
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetPlaytimesByPeriodResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功返回视频播放时段统计数据，响应失败返回空【详见[data字段说明](/vod/api/statistics/get_playtimes_by_period.md?id=data参数描述)】 */
  data?: unknown;
}
/**
 * data nested object
 */
export interface GetPlaytimesByPeriodData {
  /** 播放时段，单位小时 */
  currentHour?: number;
  /** pc播放时长，格式为：时:分:秒 */
  formatPcPlayDuration?: string;
  /** pc播放时长，单位为秒 */
  pcPlayDuration?: number;
  /** pc消耗流量，单位为字节 */
  pcFlowSize?: number;
  /** pc端播放量 */
  pcVideoView?: number;
  /** pc端唯一观众量 */
  pcUniqueViewer?: number;
  /** 移动端播放时长，格式为：时:分:秒 */
  formatMobilePlayDuration?: string;
  /** 移动端播放时长，单位为秒 */
  mobilePlayDuration?: number;
  /** 移动端消耗流量，单位为字节 */
  mobileFlowSize?: number;
  /** 移动端播放量 */
  mobileVideoView?: number;
  /** 移动端唯一观众量 */
  mobileUniqueViewer?: number;
}
/**
 * 1、通过视频id和时间范围查询单个视频或全部视频的观看比例统计数据，播放后生成数据需间隔一到两小时
2、接口URL中的{userid}为点播账号userid，具体参考【获取密钥】
3、接口支持https协议
 */
export interface GetPlaytimesByRatioRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，不传则查询用户所有视频的观看比例统计数据 */
  vid?: string;
  /** 时间段，默认值为7days，最近7天<br/>today：今天<br/>yesterday：昨天<br/>this_week：本周<br/>last_week：上周<br/>7days：最近7天<br/>this_month：本月<br/>last_month：上个月<br/>this_year：今年<br/>last_year：去年 */
  dr?: string;
  /** 开始日期，格式为yyyy-MM-dd，例如：2021-03-01 */
  start?: string;
  /** 结束日期，格式为yyyy-MM-dd，例如：2021-04-02 */
  end?: string;
}
/**
 * 1、通过视频id和时间范围查询单个视频或全部视频的观看比例统计数据，播放后生成数据需间隔一到两小时
2、接口URL中的{userid}为点播账号userid，具体参考【获取密钥】
3、接口支持https协议
 */
export interface GetPlaytimesByRatioResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功返回视频观看比例数据，响应失败返回空【详见[data字段说明](/vod/api/statistics/get_playtimes_by_ratio.md?id=data参数描述)】 */
  data?: unknown;
}
/**
 * data nested object
 */
export interface GetPlaytimesByRatioData {
  /** 播放比例范围，单位百分比 */
  percentage?: string;
  /** 播放量 */
  playCount?: number;
}
/**
 * 1、查询视频在不同终端的播放量排行，从播放行为产生到数据可查询的间隔时间为1~2小时
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetPlaytimesRankRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 开始日期，格式为yyyy-MM-dd，例如：2019-11-11 */
  start?: string;
  /** 结束日期，格式为yyyy-MM-dd，例如：2019-11-11 */
  end?: string;
  /** 时间段，默认值为7days<br/>today：今天<br/>yesterday：昨天<br/>7days：最近7天<br/>30days：最近30天 */
  dr?: string;
}
/**
 * 1、查询视频在不同终端的播放量排行，从播放行为产生到数据可查询的间隔时间为1~2小时
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetPlaytimesRankResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回视频播放量排行信息【详见[data字段说明](/vod/api/statistics/get_playtimes_rank.md?id=polyv1)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、按日期查询子账号统计汇总数据
2、接口userid为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetSubAccountStatsAggregateRequest {
  /** 保利威点播账户id，可以参考【[获取密匙](/vod/api/getSecretKey)】获取，获取路径：官网->登录->点播（开发设置） */
  userid: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 开始日期，格式为：yyyy-MM-dd，例如：2021-04-07，时间跨度不能超过一年 */
  startDate: string;
  /** 结束日期，格式为：yyyy-MM-dd，例如：2021-04-10，时间跨度不能超过一年 */
  endDate: string;
  /** 页码，默认为1 */
  page?: number;
  /** 每页条数，默认为20，最大100 */
  pageSize?: number;
  /** 要查询的子账号邮箱，如果同时传了email和appId，则优先使用email */
  email?: string;
  /** 要查询的子账号appId */
  appId?: string;
}
/**
 * 1、按日期查询子账号统计汇总数据
2、接口userid为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetSubAccountStatsAggregateResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回子账号统计汇总信息【详见[data字段说明](/vod/api/statistics/get_sub_account_stats_aggregate.md?id=polyv1)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、按日期查询子账号统计详情列表
2、接口userid为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetSubAccountStatsDetailRequest {
  /** 保利威点播账户id，可以参考【[获取密匙](/vod/api/getSecretKey)】获取，获取路径：官网->登录->点播（开发设置） */
  userid: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 开始日期，格式为：yyyy-MM-dd，例如：2021-04-07，时间跨度不能超过一年 */
  startDate: string;
  /** 结束日期，格式为：yyyy-MM-dd，例如：2021-04-10，时间跨度不能超过一年 */
  endDate: string;
  /** 要查询的子账号邮箱，如果同时传了email和appId，则优先使用email */
  email?: string;
  /** 要查询的子账号appId */
  appId?: string;
}
/**
 * 1、按日期查询子账号统计详情列表
2、接口userid为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetSubAccountStatsDetailResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回子账号每天的详情数据列表【详见[data字段说明](/vod/api/statistics/get_sub_account_stats_detail.md?id=polyv1)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、批量查询视频播放统计汇总数据
2、从播放行为产生到数据可查询的间隔时间为1~2小时，流量消耗（flowSize字段）的计算依赖于CDN日志，为了保证数据完整性，流量数据需要间隔一个自然日才会生成
3、接口支持https协议
 */
export interface GetSummaryDataRequest {
  /** 保利威点播账户id，可以参考【[获取密匙](/vod/api/getSecretKey)】获取，获取路径：官网->登录->点播（API接口） */
  userid: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，多个视频以英文逗号分隔，例如：a2dc4f25179499d6586362672838cc2d_a,a2dc4f25179499d6586362672838cc2d_a 一次最多只能传100个视频id<br/>不传时则查整个账号的数据 */
  vids?: string;
  /** 时间段，默认值为7days（7days包含今天）<br>today：今天<br>yesterday：昨天<br>this_week：本周<br>last_week：上周<br>7days：最近7天<br>this_month：本月<br>last_month：上个月<br>this_year：今年 <br>last_year：去年 */
  dr?: string;
  /** 开始日期，格式为：yyyy-MM-dd，例如：2021-03-01 */
  startDate?: string;
  /** 结束日期，格式为：yyyy-MM-dd，例如：2021-03-30，跨度最大为一年，可跨年查询 */
  endDate?: string;
}
/**
 * 1、批量查询视频播放统计汇总数据
2、从播放行为产生到数据可查询的间隔时间为1~2小时，流量消耗（flowSize字段）的计算依赖于CDN日志，为了保证数据完整性，流量数据需要间隔一个自然日才会生成
3、接口支持https协议
 */
export interface GetSummaryDataResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回视频统计汇总数据【详见[data字段描述](/vod/api/statistics/get_summary_data.md?id=data字段描述)】 */
  data?: unknown;
}
/**
 * 1、通过日期查询用户账号的空间及流量使用情况
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetTotalUsageRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 要查询的日期，为空时默认查询账号最新套餐起始日至今所有的空间及流量使用情况，格式：yyyy-MM-dd，例如：2019-11-11 */
  date?: string;
}
/**
 * 1、通过日期查询用户账号的空间及流量使用情况
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetTotalUsageResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回用户账号空间和流量信息【详见[data字段说明](/vod/api/statistics/get_total_usage.md?id=polyv1)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过视频id批量查询视频总播放次数
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetVideoPlaytimesRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，多个用英文逗号隔开 */
  vids: string;
  /** 查询是否实时，不传默认为0<br/>1：表示实时<br/>0：表示非实时 */
  realTime?: string;
}
/**
 * 1、通过视频id批量查询视频总播放次数
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetVideoPlaytimesResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回视频播放信息数组【详见[data字段说明](/vod/api/statistics/get_video_playtimes.md?id=polyv1)】 */
  data?: unknown;
}
/**
 * 1、通过视频id和时间范围查询单个视频或全部视频的观众量统计数据，播放后生成数据需间隔一到两小时
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetViewerNumberRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，不传则查询用户所有视频的观众量数据 */
  vid?: string;
  /** 时间段，默认为7days，最近7天<br/>today：今天<br/>yesterday：昨天<br/>this_week：本周<br/>last_week：上周<br/>7days：最近7天<br/>this_month：本月<br/>last_month：上个月<br/>this_year：今年<br/>last_year：去年 */
  dr?: string;
  /** 开始日期，格式为yyyy-MM-dd，例如：2021-03-30 */
  startDate?: string;
  /** 结束日期，格式为yyyy-MM-dd，例如：2021-04-01 */
  endDate?: string;
}
/**
 * 1、通过视频id和时间范围查询单个视频或全部视频的观众量统计数据，播放后生成数据需间隔一到两小时
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetViewerNumberResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功返回视频观众量统计数据，响应失败返回空【详见[data字段说明](/vod/api/statistics/get_viewer_number.md.md?id=data参数描述)】 */
  data?: unknown;
}
/**
 * data nested object
 */
export interface GetViewerNumberData {
  /** 数据生成日期，格式为yyyy-MM-dd */
  date?: string;
  /** pc端唯一观众量 */
  pcUniqueViewer?: number;
  /** 移动端唯一观众量 */
  mobileUniqueViewer?: number;
  /** 总唯一观众量 */
  totalUniqueViewer?: number;
}
/**
 * 1、通过自然月批量获取视频观看日志
2、从播放行为产生到数据可查询的间隔时间为1~2小时
3、响应参数消耗流量（flowSize字段）的计算依赖于CDN日志，为了保证数据完整性，流量数据需要间隔一个自然日才会生成
4、接口URL中的{userid}为点播账号userid，具体参考【获取密钥】
5、接口URL中的{month}为查询月份，格式：yyyyMM
6、接口支持https协议
 */
export interface GetViewlogRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 查询月份数据，格式：yyyyMM，例如：202101 */
  month: number;
  /** 每一页的大小，默认为99 */
  numPerPage?: number;
  /** 第几页，默认为1 */
  pageNum?: number;
  /** 查询开始日期，格式：yyyy-MM-dd，例如：2021-01-01 */
  start?: string;
  /** 查询结束日期，格式：yyyy-MM-dd，例如：2021-01-05 */
  end?: string;
  /** 视频id，当视频id为空时，查询该用户所有视频的日志 */
  vid?: string;
  /** 用户自定义id */
  sessionId?: string;
  /** 月内某一天的数据，格式：yyyy-MM-dd，例如：2021-01-01 */
  currentDay?: string;
}
/**
 * 1、通过自然月批量获取视频观看日志
2、从播放行为产生到数据可查询的间隔时间为1~2小时
3、响应参数消耗流量（flowSize字段）的计算依赖于CDN日志，为了保证数据完整性，流量数据需要间隔一个自然日才会生成
4、接口URL中的{userid}为点播账号userid，具体参考【获取密钥】
5、接口URL中的{month}为查询月份，格式：yyyyMM
6、接口支持https协议
 */
export interface GetViewlogResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回日志详细信息【详见[data字段说明](/vod/api/statistics/get_viewlog.md?id=data字段说明)】 */
  data?: unknown;
  /** 总记录数 */
  total?: number;
}
