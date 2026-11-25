/**
 * video_management API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module video_management by scripts/generate-types.ts
 */

/**
 * 1、创建视频分类
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
4、每个账户预设根目录，名字为默认分类
 */
export interface AddCategoryRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 分类名称，不超过40个字符 */
  cataname: string;
  /** 新建的分类目录的上一级目录，值为1时表示根目录，该参数获取自【[获取分类及子分类](/vod/api/video_management/category/get_categories.md)】 */
  parentid: string;
  /** 返回的数据格式，默认返回json格式<br />xml：返回xml格式<br />json：返回json格式 */
  format?: string;
}
/**
 * 1、创建视频分类
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
4、每个账户预设根目录，名字为默认分类
 */
export interface AddCategoryResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回分类的详细信息【详见[data字段说明](/vod/api/video_management/category/add_category.md?id=data字段说明)】，响应失败时返回空 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过分类id，删除分类
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
4、每个账户预设根目录，名字为默认分类
 */
export interface DeleteCategoryRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频分类id，该参数获取自【[获取分类及子分类](/vod/api/video_management/category/get_categories.md)】 */
  cataid: string;
}
/**
 * 1、通过分类id，删除分类
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
4、每个账户预设根目录，名字为默认分类
 */
export interface DeleteCategoryResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回true，错误返回空字符串 */
  data?: string;
}
/**
 * 1、查询分类目录
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
4、每个账户预设根目录，名字为默认分类
 */
export interface GetCategoriesRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】，ptime参与签名，cataid不参与 */
  sign: string;
  /** 分类id，默认为1根目录 */
  cataid?: string;
}
/**
 * 1、查询分类目录
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
4、每个账户预设根目录，名字为默认分类
 */
export interface GetCategoriesResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回视频分类列表【详见[data字段说明](/vod/api/video_management/category/get_categories.md?id=data字段说明)】 */
  data?: unknown;
}
/**
 * 1、通过分类id，修改分类的名称
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
4、每个账户预设根目录，名字为默认分类
 */
export interface ModifyCategoryNameRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 修改后的分类名称 */
  cataname: string;
  /** 视频分类id，该参数获取自【[获取分类及子分类](/vod/api/video_management/category/get_categories.md)】 */
  cataid: string;
}
/**
 * 1、通过分类id，修改分类的名称
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
4、每个账户预设根目录，名字为默认分类
 */
export interface ModifyCategoryNameResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回true，错误返回空字符串 */
  data?: string;
}
/**
 * 1、通过分类id，修改一级分类的属性，例如是否源文件播放等
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
4、每个账户预设根目录，名字为默认分类
 */
export interface ModifyCategorySettingRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 分类id，仅能设置一级分类的属性，该参数获取自【[获取分类及子分类](/vod/api/video_management/category/get_categories.md)】 */
  cataid: string;
  /** 是否启用设置，默认值为Y：开启<br />Y为开启<br />N为关闭 */
  isSettings?: string;
  /** 源文件播放设置开关（仅对新上传视频有效），默认值为0：非源文件播放<br />如果为源文件播放，encrypt、encryptLevel、isEdu、encodeAAC参数不生效<br />1：开启<br/>0：关闭 */
  keepSource?: string;
  /** 视频加密设置开关（仅对新上传视频有效），默认值为0：关闭<br />1：开启<br />0：关闭 */
  encrypt?: string;
  /** 移动端加密设置（仅对新上传视频有效），默认值为open：非加密授权<br />open：非加密授权；<br />web：WEB授权；<br />app：APP授权；<br />wxa_app：小程序授权； */
  hlslevel?: string;
  /** 视频优化（仅对新上传视频有效），默认值为0：关闭<br />1：开启<br />0：关闭<br /> */
  isEdu?: string;
  /** 生成音频文件（仅对新上传视频有效），默认为0：关闭<br />该功能只对部分有权限用户开放<br />1：开启<br/>0：关闭 */
  encode_aac?: string;
  /** 播放器id, 用于设置当前分类下的视频使用哪个播放器进行播放 */
  playerId?: string;
}
/**
 * 1、通过分类id，修改一级分类的属性，例如是否源文件播放等
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
4、每个账户预设根目录，名字为默认分类
 */
export interface ModifyCategorySettingResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回true，错误返回空字符串 */
  data?: string;
}
/**
 * 1、通过分类id，移动分类的位置
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
4、每个账户预设根目录，名字为默认分类
 */
export interface MoveCategoryRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 需要移动的目录分类id，id为1时表示默认分类，该参数获取自【[获取分类及子分类](/vod/api/video_management/category/get_categories.md)】 */
  cataid: string;
  /** 移动到的目录分类id，id为1时表示默认分类，该参数获取自【[获取分类及子分类](/vod/api/video_management/category/get_categories.md)】 */
  destCataid: string;
}
/**
 * 1、通过分类id，移动分类的位置
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
4、每个账户预设根目录，名字为默认分类
 */
export interface MoveCategoryResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回true，错误返回空字符串 */
  data?: string;
}
/**
 * 1、通过视频id设置单个视频的打点信息
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口仅userid、ptime、vid参与签名，其他参数不参与签名
4、接口支持https协议
 */
export interface AddChapterMarkerRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id */
  vid: string;
  /** 打点描述，如果上传多个打点，请用英文逗号","隔开 */
  desc: string;
  /** 打点秒数，如果上传多个打点，请用英文逗号","隔开 */
  seconds: string;
  /** 打点按钮设置开关，不传表示关闭<br/>Y：为开启<br/>N：为关闭 */
  btnsettingswitch?: string;
  /** 按钮描述，按钮开关开启时必填 */
  btndesc?: string;
  /** 按钮跳转地址，按钮开关开启时必填 */
  btnhref?: string;
}
/**
 * 1、通过视频id设置单个视频的打点信息
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口仅userid、ptime、vid参与签名，其他参数不参与签名
4、接口支持https协议
 */
export interface AddChapterMarkerResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时返回设置成功信息 */
  data?: string;
}
/**
 * 1、通过视频id删除单个视频的打点信息
2、接口支持https协议
 */
export interface DeleteChapterMarkerRequest {
  /** 保利威点播账户id，可以参考【[获取密钥](/vod/api/getSecretKey)】获取，获取路径：官网->登录->点播（API接口） */
  userid: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id */
  vid: string;
  /** 时间点，单位：秒，多个以英文逗号分隔，如"1,2", 如果不传则删除视频的所有打点信息 */
  timePoints?: string;
}
/**
 * 1、通过视频id删除单个视频的打点信息
2、接口支持https协议
 */
export interface DeleteChapterMarkerResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回success，响应失败为空 */
  data?: string;
}
/**
 * 1、通过视频id删除单个视频指定时间点的打点信息
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface DeleteChapterMarkerbytimeRequest {
  /** 保利威点播账户id，可以参考【[获取密钥](/vod/api/getSecretKey)】获取，获取路径：官网->登录->点播（API接口） */
  userid: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id */
  vid: string;
  /** 需要删除的打点秒数，多个用英文逗号隔开，例如：20,30,50 */
  times: string;
}
/**
 * 1、通过视频id删除单个视频指定时间点的打点信息
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface DeleteChapterMarkerbytimeResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回success，响应失败返回空 */
  data?: string;
}
/**
 * 1、通过视频id获取单个视频的全部打点信息
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口URL中的{vid}为视频id
4、接口支持https协议
 */
export interface GetChapterMarkerRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id */
  vid: string;
}
/**
 * 1、通过视频id获取单个视频的全部打点信息
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口URL中的{vid}为视频id
4、接口支持https协议
 */
export interface GetChapterMarkerResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 请求成功时返回视频打点信息【详见[data字段说明](/vod/api/video_management/chapter_marker/get_chapter_marker.md?id=data参数描述)】 */
  data?: Record<string, unknown>;
}
/**
 * data nested object
 */
export interface GetChapterMarkerData {
  /** 视频时长，格式为：HH:mm:ss，如：00:02:19 */
  duration?: string;
  /** 打点信息列表【详见[keyframeList字段说明](/vod/api/video_management/chapter_marker/get_chapter_marker.md?id=keyframeList参数描述)】 */
  keyframeList?: unknown;
}
/**
 * keyframeList nested object
 */
export interface GetChapterMarkerKeyframeList {
  /** 打点ID */
  id?: number;
  /** 打点时间点，单位秒 */
  seconds?: number;
  /** 打点详情内容 */
  keyContent?: string;
  /** 打点按钮设置开关，不传表示关闭<br/>Y：为开启<br/>N：为关闭 */
  btnsettingswitch?: string;
  /** 按钮描述 */
  btndesc?: string;
  /** 按钮跳转地址 */
  btnhref?: string;
}
/**
 * 1、通过视频id删除视频关联课件
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface DeleteCoursewareRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，例如：1b448be323dec2a7bed6db61bd7d8a77_1 */
  vid: string;
}
/**
 * 1、通过视频id删除视频关联课件
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface DeleteCoursewareResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
}
/**
 * 1、通过视频id获取视频关联课件信息
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetCoursewareRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，例如：1b448be323dec2a7bed6db61bd7d8a77_1 */
  vid: string;
}
/**
 * 1、通过视频id获取视频关联课件信息
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetCoursewareResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回课件信息【详见[Data字段说明](/vod/api/video_management/courseware/get_courseware.md?id=polyv1)】，响应失败时返回空 */
  data?: unknown;
}
/**
 * 1、通过视频id异步上传课件，支持ppt、pptx及pdf文件格式
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface UploadCoursewareAsyncRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，例如：1b448be323dec2a7bed6db61bd7d8a77_1 */
  vid: string;
  /** 课件文件，支持ppt、pptx、pdf格式，文件大小不能超过50M */
  courseware: File | Blob;
  /** 控制视频播放到第几秒时显示课件的某页，文件格式为txt，txt文件必须是UTF-8的编码格式，否则课件的章节标题会显示为乱码 */
  txt?: File | Blob;
}
/**
 * 1、通过视频id异步上传课件，支持ppt、pptx及pdf文件格式
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface UploadCoursewareAsyncResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回ppt上传成功，响应失败时返回空 */
  data?: string;
}
/**
 * 1、通过视频id上传课件，支持ppt、pptx及pdf文件格式
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface UploadCoursewareSyncRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，例如：1b448be323dec2a7bed6db61bd7d8a77_1 */
  vid: string;
  /** 课件文件，支持ppt、pptx、pdf格式，文件大小不能超过50M */
  ppt: File | Blob;
  /** 控制视频播放到第几秒时显示课件的某页，文件格式为txt，txt文件必须是UTF-8的编码格式，否则课件的章节标题会显示为乱码 */
  txt: File | Blob;
}
/**
 * 1、通过视频id上传课件，支持ppt、pptx及pdf文件格式
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface UploadCoursewareSyncResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回ppt上传成功，响应失败时返回空 */
  data?: string;
}
/**
 * 1、通过视频id创建弹幕信息，弹幕暂不支持特殊字符与表情符号
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface AddDanmuRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id */
  vid: string;
  /** 弹幕信息 */
  msg: string;
  /** 弹幕出现的时间，格式：HH:mm:ss，例：00:00:20 */
  time: string;
  /** 场次号，自定义参数，比如：表示学员信息的学员id */
  sessionId?: string;
  /** 自定义参数 */
  param2?: string;
  /** 字体大小，默认：18 */
  fontSize?: number;
  /** 出现位置，默认为roll<br/>roll：滚动<br/>top：顶部<br/>bottom：底部 */
  fontMode?: string;
  /** 字体颜色，格式：0xFFFFFF，默认：0xFFFFFF（白色） */
  fontColor?: string;
}
/**
 * 1、通过视频id创建弹幕信息，弹幕暂不支持特殊字符与表情符号
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface AddDanmuResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回弹幕id，失败返回空【详见[data字段说明](/vod/api/video_management/danmu/add_danmu.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过弹幕id批量删除弹幕信息
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface DeleteDanmuRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 弹幕id，多个用英文逗号隔开，参数获取自【[查询弹幕](/vod/api/video_management/danmu/get_danmu.md)】 */
  danmuIds: string;
}
/**
 * 1、通过弹幕id批量删除弹幕信息
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface DeleteDanmuResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功返回success，响应失败返回空 */
  data?: string;
}
/**
 * 1、分页查询用户下所有的弹幕信息
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetDanmuRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，传入则查询该视频下所有弹幕，不传则查询用户所有弹幕 */
  vid?: string;
  /** 单页显示的记录条数 */
  numPerPage?: number;
  /** 查询的页数 */
  pageNum?: number;
}
/**
 * 1、分页查询用户下所有的弹幕信息
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetDanmuResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回视频弹幕详细信息【详见[data字段说明](/vod/api/video_management/danmu/get_danmu.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * user nested object
 */
export interface GetDanmuUser {
  /** 头衔 */
  actor?: string;
  /** 是否禁言，true/false */
  banned?: boolean;
  /** 频道id */
  channelId?: string;
  /** 用户ip */
  clientIp?: string;
  /** 用户昵称 */
  nick?: string;
  /** 用户头像 */
  pic?: string;
  /** 房间号 */
  roomId?: string;
  /** 直播的场次id */
  sessionId?: string;
  /** 聊天室socketid */
  uid?: string;
  /** POLYV用户ID，和保利威官网一致，获取路径：官网->登录->点播（API接口） */
  userId?: string;
  /** 用户类型，默认为student，三分屏场景下学员需设置为slice<br>student：普通学员<br>slice：云课堂学员<br>teacher：讲师<br>manager：管理员<br>assistant：助教<br>guest：嘉宾 */
  userType?: string;
}
/**
 * 1、通过视频id上传弹幕文件
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface UploadDanmuFileRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id */
  vid: string;
  /** 弹幕文件，支持utf-8编码 */
  file: File | Blob;
}
/**
 * 1、通过视频id上传弹幕文件
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface UploadDanmuFileResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功返回上传成功的弹幕条数，响应失败返回空 */
  data?: number;
}
/**
 * 1、根据分类id或者视频id批量查询视频的时长和大小
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、支持https协议
 */
export interface BatchGetDurationAndSizeRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，多个视频以英文逗号分隔，例如：a2dc4f25179499d6586362672838cc2d_a,a2dc4f25179499d6586362672838cc2d_a 一次最多只能传500个视频id */
  vids: string;
  /** 多个分类id以英文逗号分隔，例如：23,34 */
  cataid?: string;
}
/**
 * 1、根据分类id或者视频id批量查询视频的时长和大小
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、支持https协议
 */
export interface BatchGetDurationAndSizeResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回频道详细信息【详见[data字段说明](/vod/api/video_management/manage/batch_get_duration_and_size.md?id=polyv1)】，失败时返回空 */
  data?: unknown;
}
/**
 * 1、通过视频id删除视频，支持批量删除
2、接口支持https协议
 */
export interface DeleteVideoRequest {
  /** 保利威点播账户id，可以参考【[获取密钥](/vod/api/getSecretKey)】获取，获取路径：官网->登录->点播（API接口） */
  userid: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，多个视频以英文逗号隔开，一次最多提交500个 */
  vids: string;
  /** 删除方式，默认为1<br/>1：删除到回收站<br/>2：彻底删除 */
  deleteType?: string;
  /** 是否忽略错误视频ID，值为Y或N。默认为N<br/> Y：忽略错误的视频ID，正确的视频ID会正常进行处理； <br/> N：如果存在错误视频ID，则不进行任何删除操作，返回错误信息； */
  ignoreInvalidVids?: string;
}
/**
 * 1、通过视频id删除视频，支持批量删除
2、接口支持https协议
 */
export interface DeleteVideoResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 如果 ignoreInvalidVids 参数值为Y，且参数中包含错误的视频ID，则 data 中会包含错误的视频ID列表；否则，data 值为空字符串。 */
  data?: string;
}
/**
 * 1、通过视频id查询视频的播放预览时长
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetPreviewDurationRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id */
  vid: string;
}
/**
 * 1、通过视频id查询视频的播放预览时长
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetPreviewDurationResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功响应时返回预览的时长，单位秒；失败时返回错误描述 */
  data?: string;
}
/**
 * 1、通过视频id查询视频信息
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetVideoInfoRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id（可以支持多个，用英文逗号隔开），最多同时传100个视频id */
  vid: string;
}
/**
 * 1、通过视频id查询视频信息
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetVideoInfoResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回视频详细信息【详见[data字段说明](/vod/api/video_management/manage/get_video_info.md?id=data参数描述)】 */
  data?: unknown;
}
/**
 * data nested object
 */
export interface GetVideoInfoData {
  /** 视频id */
  vid?: string;
  /** 视频基础信息【详见[basicInfo参数描述](/vod/api/video_management/manage/get_video_info.md?id=basicInfo参数描述)】 */
  basicInfo?: Record<string, unknown>;
  /** 视频元数据【详见[metaData参数描述](/vod/api/video_management/manage/get_video_info.md?id=metaData参数描述)】 */
  metaData?: Record<string, unknown>;
  /** 转码信息【详见[transcodeInfos参数描述](/vod/api/video_management/manage/get_video_info.md?id=transcodeInfos参数描述)】 */
  transcodeInfos?: unknown;
  /** 截图信息【详见[snapshotInfo参数描述](/vod/api/video_management/manage/get_video_info.md?id=snapshotInfo参数描述)】 */
  snapshotInfo?: Record<string, unknown>;
}
/**
 * basicInfo nested object
 */
export interface GetVideoInfoBasicInfo {
  /** 视频标题 */
  title?: string;
  /** 视频描述 */
  description?: string;
  /** 视频时长，单位：秒 */
  duration?: number;
  /** 首图地址，大图 */
  coverURL?: string;
  /** 首图地址，小图 */
  miniCoverURL?: string;
  /** 首图地址，大图，同coverURL */
  largeCoverURL?: string;
  /** 音频地址, 如果视频没有音频, 返回空字符串 */
  audioUrl?: string;
  /** 创建时间，格式：yyyy-MM-dd HH:mm:ss */
  creationTime?: string;
  /** 更新时间，格式：yyyy-MM-dd HH:mm:ss */
  updateTime?: string;
  /** 源文件大小，单位：字节 */
  size?: number;
  /** 视频状态码<br/>60/61：已发布<br/>10：等待编码<br/>20：正在编码<br/>40：编码失败<br/>50：等待审核<br/>51：审核不通过<br/>-1：已删除 */
  status?: number;
  /** 分类id，如1为默认分类 */
  cateId?: number;
  /** 分类名称 */
  cateName?: string;
  /** 视频标签 */
  tags?: string;
  /** 上传者 */
  uploader?: string;
  /** 自定义标识（在直播后台频道设置并经回放转存传递到点播中） */
  courseId?: string;
}
/**
 * metaData nested object
 */
export interface GetVideoInfoMetaData {
  /** 源文件大小，单位：字节 */
  size?: number;
  /** 视频容器类型，如mp4、flv等 */
  format?: string;
  /** 源视频时长，单位：秒 */
  duration?: number;
  /** 视频码率，单位：bps */
  bitrate?: number;
  /** 视频帧率 */
  fps?: number;
  /** 分辨率高，单位：像素 */
  height?: number;
  /** 分辨率宽，单位：像素 */
  width?: number;
  /** 编码格式，如h264、h265等 */
  codec?: string;
}
/**
 * transcodeInfos nested object
 */
export interface GetVideoInfoTranscodeInfos {
  /** 播放地址 */
  playUrl?: string;
  /** 清晰度<br/>SOURCE：原清晰度<br/>LD：普清<br/>SD：标清<br/>HD：高清 */
  definition?: string;
  /** 视频码率，单位：kbps */
  bitrate?: number;
  /** 时长，单位：秒 */
  duration?: number;
  /** 视频是否加密<br/>true：加密视频<br/>false：非加密 */
  encrypt?: boolean;
  /** 转码格式，如mp4、flv、pdx、hls */
  format?: string;
  /** 视频帧率 */
  fps?: number;
  /** 分辨率高，单位：像素 */
  height?: number;
  /** 分辨率宽，单位：像素 */
  width?: number;
  /** 视频状态<br/>normal：正常播放<br/>unavailable：不能正常播放 */
  status?: string;
  /** 编码后视频大小，单位：字节 */
  fileSize?: number;
}
/**
 * snapshotInfo nested object
 */
export interface GetVideoInfoSnapshotInfo {
  /** 视频截图url */
  imageUrl?: string[];
}
/**
 * 1、通过视频id批量移动视频到指定分类下
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface MoveVideoRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，多个视频以英文逗号隔开 */
  vids: string;
  /** 目标分类id，该参数获取自【[获取分类及子分类](/vod/api/video_management/category/get_categories.md)】 */
  cataid: string;
}
/**
 * 1、通过视频id批量移动视频到指定分类下
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface MoveVideoResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回true，失败返回空 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过视频id恢复回收站中的视频到视频列表，支持批量恢复，一次性最多支持恢复100个视频
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface RecoverVideoRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，多个视频以英文逗号隔开，一次最多提交100个 */
  vids: string;
}
/**
 * 1、通过视频id恢复回收站中的视频到视频列表，支持批量恢复，一次性最多支持恢复100个视频
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface RecoverVideoResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功和失败都返回空 */
  data?: string;
}
/**
 * 1、通过视频id设置视频的播放预览时长
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface SetPreviewDurationRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id */
  vid: string;
  /** 预览的时长（单位是秒），例如：20 */
  duration: number;
}
/**
 * 1、通过视频id设置视频的播放预览时长
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface SetPreviewDurationResponse {
  /** 响应状态码，200为成功返回，非20A0为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回成功信息，失败时返回错误描述 */
  data?: string;
}
/**
 * 1、通过视频id修改视频信息
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface UpdateVideoInfoRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id */
  vid: string;
  /** 视频描述 */
  describ?: string;
  /** 返回的数据格式，默认返回json格式<br/>xml：返回xml格式<br/>json：返回json格式 */
  format?: string;
  /** 视频首发外链地址 */
  publishUrl?: string;
  /** 视频标签 */
  tag?: string;
  /** 视频标题 */
  title?: string;
}
/**
 * 1、通过视频id修改视频信息
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface UpdateVideoInfoResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回视频详细信息【详见[data字段说明](/vod/api/video_management/manage/update_video_info.md?id=data字段说明)】 */
  data?: unknown;
}
/**
 * 1、通过视频id将视频修改为解禁状态或禁播状态，解禁状态的视频可以正常播放，禁播状态的视频无法播放，一次最多只能操作500个视频id
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、支持https协议
 */
export interface UpdateVideoStatusRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，多个视频以英文逗号分隔，如a2dc4f25179499d6586362672838cc2d_a,a2dc4f25179499d6586362672838cc2d_a 一次最多只能传500个视频id */
  vids: string;
  /** 视频状态<br/>1：禁播<br/>0：解禁 */
  forbidden: number;
}
/**
 * 1、通过视频id将视频修改为解禁状态或禁播状态，解禁状态的视频可以正常播放，禁播状态的视频无法播放，一次最多只能操作500个视频id
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、支持https协议
 */
export interface UpdateVideoStatusResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功和失败都返回空字符串 */
  data?: string;
}
/**
 * 1、创建点播视频播放列表
2、接口支持https协议
 */
export interface AddPlaylistRequest {
  /** 保利威点播账户id，可以参考【[获取密匙](/vod/api/getSecretKey)】获取，获取路径：官网->登录->点播（API接口） */
  userid: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 播放列表标题 */
  title: string;
  /** 描述 */
  description?: string;
  /** 标签 */
  tag?: string;
}
/**
 * 1、创建点播视频播放列表
2、接口支持https协议
 */
export interface AddPlaylistResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回播放列表ID，失败返回空【详见[data字段说明](/vod/api/video_management/playlist/add_playlist.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过视频id添加视频到播放列表
2、接口支持https协议
 */
export interface AddVideoToPlaylistRequest {
  /** 保利威点播账户id，可以参考【[获取密匙](/vod/api/getSecretKey)】获取，获取路径：官网->登录->点播（API接口） */
  userid: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 播放列表ID */
  playListId: string;
  /** 视频ID */
  vid: string;
}
/**
 * 1、通过视频id添加视频到播放列表
2、接口支持https协议
 */
export interface AddVideoToPlaylistResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回success，失败返回空 */
  data?: string;
}
/**
 * 1、通过播放列表id查询用户视频播放列表详情信息
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口URL中的{id}为点播账号播放列表id，具体参考【获取所有播放列表】
4、接口支持https协议
 */
export interface GetPlaylistDetailRequest {
  /** 保利威点播账户id，可以参考【[获取密钥](/vod/api/getSecretKey)】获取，获取路径：官网->登录->点播（API接口） */
  userid: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 播放列表id【可通过[获取所有播放列表](/vod/api/video_management/playlist/get_playlists)获取】 */
  id: string;
  /** 返回的数据格式，默认返回json格式<br/>xml：返回xml格式<br/>json：返回json格式 */
  format?: string;
}
/**
 * 1、通过播放列表id查询用户视频播放列表详情信息
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口URL中的{id}为点播账号播放列表id，具体参考【获取所有播放列表】
4、接口支持https协议
 */
export interface GetPlaylistDetailResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回视频详细信息【详见[data字段说明](/vod/api/video_management/playlist/get_playlist_detail.md?id=data参数描述)】 */
  data?: unknown;
}
/**
 * data nested object
 */
export interface GetPlaylistDetailData {
  /** 播放列表描述 */
  describ?: string;
  /** 播放列表标签 */
  tag?: string;
  /** 播放列表标题 */
  title?: string;
  /** 最后修改时间，格式为：yyyy-MM-dd HH:mm:ss */
  lmodify?: string;
  /** 播放列表视频数量 */
  video_count?: string;
  /** 播放列表id */
  videoid?: string;
  /** 创建时间，格式为：yyyy-MM-dd HH:mm:ss */
  ptime?: string;
  /** 视频集合【详见[videolist参数描述](/vod/api/video_management/playlist/get_playlist_detail.md?id=videolist参数描述)】 */
  videolist?: unknown;
}
/**
 * videolist nested object
 */
export interface GetPlaylistDetailVideolist {
  /** 视频id */
  vid?: string;
  /** 视频标题 */
  title?: string;
  /** 视频时长，格式为：HH:mm:ss，例如：00:03:11 */
  duration?: string;
  /** 外链地址 */
  publish_url?: string;
  /** 视频首图 */
  first_image?: string;
  /** 默认视频链接地址 */
  default_videolink?: string;
}
/**
 * 1、获取播放列表详细信息
2、接口支持https协议
 */
export interface GetPlaylistsRequest {
  /** 保利威点播账户id，可以参考【[获取密匙](/vod/api/getSecretKey)】获取，获取路径：官网->登录->点播（API接口） */
  userid: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 播放列表ID，多个以英文逗号分隔，最大1000个如"1620153765497,1620142496099" */
  playListIds?: string;
  /** 标题，按标题模糊搜索 */
  title?: string;
  /** vid样式, 当传值是LONG_STYLE时, 接口返回的vid携带下横线和userId首字母, 如e4f34f779d7b2933adf2ef91419e15fc_e, 传SIMPLE或者不传此参数时, vid格式如下: e4f34f779d7b2933adf2ef91419e15fc */
  vidStyle?: string;
  /** 当前页码，默认为1 */
  page?: number;
  /** 每页大小，最大1000条，默认为10 */
  pageSize?: number;
}
/**
 * 1、获取播放列表详细信息
2、接口支持https协议
 */
export interface GetPlaylistsResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回播放列表信息，失败返回空【详见[data字段说明](/vod/api/video_management/playlist/get_playlists.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过播放列表ID修改播放列表信息
2、接口支持https协议
 */
export interface ModifyPlaylistRequest {
  /** 保利威点播账户id，可以参考【[获取密匙](/vod/api/getSecretKey)】获取，获取路径：官网->登录->点播（API接口） */
  userid: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 播放列表ID */
  playListId: string;
  /** 标题 */
  title: string;
  /** 描述 */
  description?: string;
  /** 标签 */
  tag?: string;
}
/**
 * 1、通过播放列表ID修改播放列表信息
2、接口支持https协议
 */
export interface ModifyPlaylistResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回被修改的播放列表ID，失败返回空【详见[data字段说明](/vod/api/video_management/playlist/modify_playlist.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过播放列表id和视频id将视频从播放列表移除
2、接口支持https协议
 */
export interface RemoveVideoFromPlaylistRequest {
  /** 保利威点播账户id，可以参考【[获取密钥](/vod/api/getSecretKey)】获取，获取路径：官网->登录->点播（API接口） */
  userid: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 播放列表ID */
  playListId: string;
  /** 视频id */
  vid: string;
}
/**
 * 1、通过播放列表id和视频id将视频从播放列表移除
2、接口支持https协议
 */
export interface RemoveVideoFromPlaylistResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
}
/**
 * 1、通过视频id获取单个视频的封面图片链接
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetPosterRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，例如：1b448be3235552e5fafb16489eb01839_1 */
  vid: string;
  /** 值为1时，表示获取视频首图的缩略图 */
  t?: number;
}
/**
 * 1、通过视频id获取单个视频的封面图片链接
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetPosterResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回图片链接，响应失败时返回空 */
  data?: string;
}
/**
 * 1、通过分类id或者视频id上传视频封面图
2、接口支持https协议
 */
export interface UploadPosterRequest {
  /** 保利威点播账户id，可以参考【[获取密钥](/vod/api/getSecretKey)】获取,获取路径：官网->登录->点播（API接口） */
  userid: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，例如：1b448be3235552e5fafb16489eb01839_1，多个视频id用英文逗号隔开 */
  vids: string;
  /** 分类id，例如：1615536384688，该参数获取自【[获取分类及子分类](/vod/api/video_management/category/get_categories.md)】，多个分类id用英文逗号隔开 */
  cateIds?: string;
  /** 图片文件 */
  imageFile?: File | Blob;
  /** 图片链接，支持http、https协议 */
  imageUrl?: string;
  /** 图片数据的base64形式 */
  imageBase64?: string;
}
/**
 * 1、通过分类id或者视频id上传视频封面图
2、接口支持https协议
 */
export interface UploadPosterResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回图片的大图和小图链接【详见[data字段说明](/vod/api/video_management/poster/upload_poster.md?id=data字段说明)】，响应失败时返回空 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过视频id创建视频的问答题目
2、接口支持https协议
 */
export interface AddQuizRequest {
  /** 保利威点播账户id，可以参考【[获取密匙](/vod/api/getSecretKey)】获取，获取路径：官网->登录->点播（API接口） */
  userid: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id */
  vid: string;
  /** 问答ID，为空时会新增一个题目。不为空时会修改已有的问答题目 */
  examId?: string;
  /** 问答出现的时间，单位：秒 */
  showTime: number;
  /** 问题描述 */
  question: string;
  /** 问答选项，格式为json数组对象，每个题目最多5个选项；例如：[{"index":0,"content":"a","isRight":true},{"index":2,"content":"b","isRight":false},{"index":3,"content":"c","isRight":false}] */
  choices: string;
  /** 设置是否可以跳过问答，默认不能跳过问答<br/>true：表示可以跳过<br/>false：表示不能跳过 */
  canSkip?: boolean;
  /** 回答正确后的解答详情 */
  explanationIfRight?: string;
  /** 回答答错误后是否显示解答详情，默认为true<br/>true：显示<br/>false：不显示 */
  showExplanationIfWrong?: boolean;
  /** 回答错误后的解答详情 */
  explanationIfWrong?: string;
  /** 答错后回退到第几秒，-1代表不回退，默认为-1 */
  backTime?: number;
}
/**
 * 1、通过视频id创建视频的问答题目
2、接口支持https协议
 */
export interface AddQuizResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回examId，【详见[data字段描述](/vod/api/video_management/quiz/add_quiz.md?id=data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过视频id删除单个视频的问答题目
2、接口支持https协议
 */
export interface DeleteQuizRequest {
  /** 保利威点播账户id，可以参考【[获取密匙](/vod/api/getSecretKey)】获取，获取路径：官网->登录->点播（API接口） */
  userid: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id */
  vid: string;
  /** 问答id，多个以逗号分隔，如果不传则删除视频的所有问答题目 */
  examIds?: string;
}
/**
 * 1、通过视频id删除单个视频的问答题目
2、接口支持https协议
 */
export interface DeleteQuizResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
}
/**
 * 1、通过视频id查询单个视频的问答题目
2、接口支持https协议
 */
export interface GetQuizRequest {
  /** 保利威点播账户id，可以参考【[获取密匙](/vod/api/getSecretKey)】获取,获取路径：官网->登录->点播（API接口） */
  userid: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id */
  vid: string;
}
/**
 * 1、通过视频id查询单个视频的问答题目
2、接口支持https协议
 */
export interface GetQuizResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回答题记录数组，失败时返回空【详见[data字段说明](/vod/api/video_management/quiz/get_quiz_result.md?id=data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过视频id和时间区间查询该时间区间内对应视频下的答题记录，默认每页显示20条记录
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetQuizResultRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，多个id用英文逗号隔开（不传递会查询整个账号下的答题记录） */
  vids?: string;
  /** 当前页数，默认为1 */
  pageNum?: string;
  /** 查询的开始日期，格式 yyyy-MM-dd，例如：2019-11-12 */
  start?: string;
  /** 查询的结束日期，格式 yyyy-MM-dd，例如：2019-11-15 */
  end?: string;
}
/**
 * 1、通过视频id和时间区间查询该时间区间内对应视频下的答题记录，默认每页显示20条记录
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetQuizResultResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回答题记录数组【详见[data字段说明](/vod/api/video_management/quiz/get_quiz_result.md?id=polyv1)】，失败时返回空 */
  data?: unknown;
}
/**
 * 1、分页查询账号的问答题目，支持按视频筛选
2、接口支持https协议
 */
export interface ListQuizRequest {
  /** 保利威点播账户id，可以参考【[获取密匙](/vod/api/getSecretKey)】获取,获取路径：官网->登录->点播（API接口） */
  userid: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，该参数为空则查询该账号下所有的问答题目 */
  vid?: string;
  /** 页码，从1开始，默认1 */
  page?: number;
  /** 每页条数，默认10，最大1000 */
  pageSize?: number;
}
/**
 * 1、分页查询账号的问答题目，支持按视频筛选
2、接口支持https协议
 */
export interface ListQuizResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回分页数据，失败时返回空【详见[data字段说明](#data字段描述)】 */
  data?: Record<string, unknown>;
}
/**
 * 1、搜索视频详细内容
2、接口支持https协议
 */
export interface SearchVideoRequest {
  /** 保利威点播账户id，可以参考【[获取密钥](/vod/api/getSecretKey)】获取，获取路径：官网->登录->点播（API接口） */
  userid: string;
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 需要返回的视频信息，多个以英文逗号分隔，默认仅返回基础信息<br />basicInfo：基础信息<br />metaData：元数据<br />transcodeInfo：转码信息<br />snapshotInfo：截图信息 */
  filters?: string;
  /** 视频分类id，该参数获取自【[获取分类及子分类](/vod/api/video_management/category/get_categories.md)】 */
  cateId?: number;
  /** 按标题/视频vid模糊搜索 */
  title?: string;
  /** 按视频标签模糊搜索 */
  tag?: string;
  /** 上传者，例如：主账号 */
  uploader?: string;
  /** 视频状态，默认搜索全部状态的视频，多个状态以英文逗号分隔，查询已发布状态的视频只需传61/60其中一个即可，如"61,50"，可以参考【[status字段说明](/vod/api/video_management/search/search_video.md.md?id=status字段说明)】 */
  status?: string;
  /** 是否包含子分类<br />true：包含<br />false：不包含，默认为true */
  containSubCate?: boolean;
  /** 按创建时间范围查询，起始时间戳，13位时间戳 */
  startTime?: number;
  /** 结束时间戳，13位时间戳 */
  endTime?: number;
  /** 按修改时间范围查询，起始时间戳，13位时间戳 */
  startModifyTime?: number;
  /** 修改时间的结束时间戳，13位时间戳 */
  endModifyTime?: number;
  /** 是否加密 */
  encrypted?: boolean;
  /** 是否开启了播放授权 */
  playAuthEnable?: boolean;
  /** 结果排序，可以按创建时间或播放次数降序/升序排序<br />creationTimeAsc：创建时间升序<br />creationTimeDesc：创建时间降序<br />playTimesAsc：播放次数升序<br />playTimesDesc：播放次数降序 */
  sort?: string;
  /** 页码，默认为1 */
  page?: number;
  /** 页面大小，默认为10，最大1000 */
  pageSize?: number;
}
/**
 * 1、搜索视频详细内容
2、接口支持https协议
 */
export interface SearchVideoResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回搜索结果【详见[data字段说明](/vod/api/video_management/search/search_video.md?id=data字段说明)】，响应失败时返回空 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过视频id，创建该视频的字幕任务，自动为该视频生成一份字幕文件，字幕文件可通过接口查询，或在点播后台智能字幕模块中使用。详见：[智能字幕](/vod/product/manual/manage/video_subtitle)
2、接口支持https协议
 */
export interface CreateSmartSubtitleTaskRequest {
  /** 直播appId。可在"云点播" -> "设置" -> "API接口" 中查看您的直播appId和appSecret */
  appId: string;
  /** 当前时间的毫秒级时间戳，30分钟内有效 */
  timestamp: number;
  /** 签名，32位大写MD5值【详见[MD5签名生成规则](/vod/api/buildSignMd5)】 */
  sign: string;
  /** 视频id */
  vid: string;
  /** 是否在字幕生成后自动应用字幕到对应的视频上, 参数值为Y或者N, Y代表自动应用字幕, N或者不传该参数代表不自动应用字幕 */
  autoApplyEnabled?: string;
  /** 如果不传或者传了不支持的语言会默认当成chinese(中文)处理【详见[language字段说明](/vod/api/video_management/smart_subtitle/create_smart_subtitle_task.md?id=language字段说明)】 */
  language?: string;
  /** 是否允许重复任务, Y-允许，N-不允许,  默认Y */
  repetitionEnabled?: string;
}
/**
 * 1、通过视频id，创建该视频的字幕任务，自动为该视频生成一份字幕文件，字幕文件可通过接口查询，或在点播后台智能字幕模块中使用。详见：[智能字幕](/vod/product/manual/manage/video_subtitle)
2、接口支持https协议
 */
export interface CreateSmartSubtitleTaskResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 请求唯一标识，如遇接口调用失败情况，可发此id给客服辅助排查问题 */
  requestId?: string;
  /** true代表接口调用成功，false代表接口调用失败 */
  success?: boolean;
  /** 成功返回字幕任务id，失败返回null。待字幕生成后可根据此字幕任务id查询字幕文件链接和字幕数据 */
  data?: number;
  /** 接口调用失败时的描述信息，【详见[error字段说明](/vod/api/video_management/smart_subtitle/create_smart_subtitle_task.md?id=error字段说明)】 */
  error?: Record<string, unknown>;
}
/**
 * 1、删除字幕任务，对应的字幕文件也会同时删除。
2、接口支持https协议
 */
export interface DeleteSmartSubtitleTaskRequest {
  /** 直播appId。可在"云点播" -> "设置" -> "API接口" 中查看您的直播appId和appSecret */
  appId: string;
  /** 当前时间的毫秒级时间戳，30分钟内有效 */
  timestamp: number;
  /** 签名，32位大写MD5值【详见[MD5签名生成规则](/vod/api/buildSignMd5)】 */
  sign: string;
  /** 字幕任务id，创建字幕任务时会返回此id */
  taskId: string;
}
/**
 * 1、删除字幕任务，对应的字幕文件也会同时删除。
2、接口支持https协议
 */
export interface DeleteSmartSubtitleTaskResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 请求唯一标识，如遇接口调用失败情况，可发此id给客服辅助排查问题 */
  requestId?: string;
  /** true代表接口调用成功，false代表接口调用失败 */
  success?: boolean;
  /** 删除成功返回true，删除失败返回false */
  data?: boolean;
}
/**
 * 1、当智能字幕生成成功或者校验完成后, 发布字幕应用到视频上，或在点播后台智能字幕模块中使用。详见：[智能字幕](/vod/product/manual/manage/video_subtitle)
2、接口支持https协议
 */
export interface PublishSmartSubtitleTaskRequest {
  /** 直播appId。可在"云点播" -> "设置" -> "API接口" 中查看您的直播appId和appSecret */
  appId: string;
  /** 当前时间的毫秒级时间戳，30分钟内有效 */
  timestamp: number;
  /** 签名，32位大写MD5值【详见[MD5签名生成规则](/vod/api/buildSignMd5)】 */
  sign: string;
  /** 字幕任务ID */
  taskId: number;
  /** 字幕发布后，视频是否默认首选当前字幕。Y表示默认首选，字幕发布后会对应的视频会优先使用当前字幕，N则相反。如果不传此参数，会读取当前字幕任务预先配置的值 */
  preferenceEnabled?: string;
}
/**
 * 1、当智能字幕生成成功或者校验完成后, 发布字幕应用到视频上，或在点播后台智能字幕模块中使用。详见：[智能字幕](/vod/product/manual/manage/video_subtitle)
2、接口支持https协议
 */
export interface PublishSmartSubtitleTaskResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 请求唯一标识，如遇接口调用失败情况，可发此id给客服辅助排查问题 */
  requestId?: string;
  /** true代表接口调用成功，false代表接口调用失败 */
  success?: boolean;
  /** 成功返回true, 失败返回null, 失败描述信息请查看error字段 */
  data?: boolean;
  /** 接口调用失败时的描述信息，【详见[error字段说明](/vod/api/video_management/smart_subtitle/create_smart_subtitle_task.md?id=error字段说明)】 */
  error?: Record<string, unknown>;
}
/**
 * 1、通过字幕任务id，查询视频字幕的链接和字幕内容（需先创建字幕任务）
2、接口支持https协议
 */
export interface QuerySmartSubtitleRequest {
  /** 直播appId。可在"云点播" -> "设置" -> "API接口" 中查看您的直播appId和appSecret */
  appId: string;
  /** 当前时间的毫秒级时间戳，30分钟内有效 */
  timestamp: number;
  /** 字幕任务id，创建字幕任务时会返回此id */
  taskId: number;
  /** 签名，32位大写MD5值【详见[MD5签名生成规则](/vod/api/buildSignMd5)】 */
  sign: string;
}
/**
 * 1、通过字幕任务id，查询视频字幕的链接和字幕内容（需先创建字幕任务）
2、接口支持https协议
 */
export interface QuerySmartSubtitleResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 请求唯一标识，如遇接口调用失败情况，可发此id给客服辅助排查问题 */
  requestId?: string;
  /** true代表接口调用成功，false代表接口调用失败 */
  success?: boolean;
  /** 成功时返回字幕数据【详见[data字段说明](/vod/api/video_management/smart_subtitle/query_smart_subtitle.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
  /** 接口调用失败时的描述信息，【详见[error字段说明](/vod/api/video_management/smart_subtitle/query_smart_subtitle.md?id=error字段说明)】 */
  error?: Record<string, unknown>;
}
/**
 * 1、查询视频字幕的链接（需先创建智能字幕任务）
2、接口支持https协议
 */
export interface QuerySmartSubtitleLinkRequest {
  /** 直播appId。可在"云点播" -> "设置" -> "API接口" 中查看您的直播appId和appSecret */
  appId: string;
  /** 当前时间的毫秒级时间戳，30分钟内有效 */
  timestamp: number;
  /** 视频vid */
  vid: string;
  /** 签名，32位大写MD5值【详见[MD5签名生成规则](/vod/api/buildSignMd5)】 */
  sign: string;
}
/**
 * 1、查询视频字幕的链接（需先创建智能字幕任务）
2、接口支持https协议
 */
export interface QuerySmartSubtitleLinkResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 请求唯一标识，如遇接口调用失败情况，可发此id给客服辅助排查问题 */
  requestId?: string;
  /** true代表接口调用成功，false代表接口调用失败 */
  success?: boolean;
  /** 成功时返回字幕数据【详见[data字段说明](/vod/api/video_management/smart_subtitle/query_smart_subtitle.md?id=data字段说明)】 */
  data?: unknown;
  /** 接口调用失败时的描述信息，【详见[error字段说明](/vod/api/video_management/smart_subtitle/query_smart_subtitle.md?id=error字段说明)】 */
  error?: Record<string, unknown>;
}
/**
 * 1、更新智能字幕生成的字幕内容（需先创建字幕任务）
2、接口支持https协议
 */
export interface UpdateSmartSubtitleRequest {
  /** 直播appId。可在"云点播" -> "设置" -> "API接口" 中查看您的直播appId和appSecret */
  appId: string;
  /** 当前时间的毫秒级时间戳，30分钟内有效 */
  timestamp: number;
  /** 签名，32位大写MD5值【详见[MD5签名生成规则](/vod/api/buildSignMd5)】 */
  sign: string;
  /** 字幕任务id，创建字幕任务时会返回此id */
  taskId: string;
  /** 是否在修改完字幕内容后自动发布该字幕，Y表示自动发布，N则相反。如果不传此参数, 会读取当前字幕任务预先配置的值 */
  autoApplyEnabled?: string;
  /** 字幕标题，长度限制20个字符。如果不传此参数，会读取当前字幕任务预先配置的值 */
  subtitleName?: string;
  /** 字幕发布后，视频是否默认首选当前字幕。Y表示默认首选，字幕发布后会对应的视频会优先使用当前字幕，N则相反。如果不传此参数，会读取当前字幕任务预先配置的值 */
  preferenceEnabled?: string;
  /** 【详见[data字段说明](/vod/api/video_management/smart_subtitle/update_smart_subtitle.md?id=字幕内容字段说明)】 */
  subtitles: unknown;
}
/**
 * 1、更新智能字幕生成的字幕内容（需先创建字幕任务）
2、接口支持https协议
 */
export interface UpdateSmartSubtitleResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 请求唯一标识，如遇接口调用失败情况，可发此id给客服辅助排查问题 */
  requestId?: string;
  /** true代表接口调用成功，false代表接口调用失败 */
  success?: boolean;
  /** true代表接口调用成功，false代表接口调用失败 */
  data?: boolean;
  /** 接口调用失败时的描述信息，【详见[error字段说明](/vod/api/video_management/smart_subtitle/update_smart_subtitle.md?id=error字段说明)】 */
  error?: Record<string, unknown>;
}
/**
 * 1、通过视频id删除视频字幕文件
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface DeleteSubtitleRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，例如：1b448be3235552e5fafb16489eb01839_1 */
  vid: string;
  /** 该值可参考【[查询字幕列表](/vod/api/video_management/subtitle/get_subtitle)】字幕文件上传序号列表，序号从1开始，多个以英文逗号分隔，例如 2,3 */
  ranks: string;
}
/**
 * 1、通过视频id删除视频字幕文件
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface DeleteSubtitleResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回{}，响应失败时返回空 */
  data?: string;
}
/**
 * 1、通过视频id获取视频字幕文件详情列表
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetSubtitleRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，例如：1b448be3235552e5fafb16489eb01839_1 */
  vid: string;
}
/**
 * 1、通过视频id获取视频字幕文件详情列表
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetSubtitleResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 成功返回字幕文件信息【详见[Data字段说明](/vod/api/video_management/subtitle/get_subtitle.md?id=polyv1)】，响应失败时返回空 */
  data?: Record<string, unknown>;
}
/**
 * 1、通过视频id上传视频字幕文件，该接口会自动检测字幕语言
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface UploadSubtitleRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id，例如：1b448be3235552e5fafb16489eb01839_1 */
  vid: string;
  /** 字幕文件名称 */
  title: string;
  /** 字幕文件，支持utf-8编码 */
  file: File | Blob;
  /** 是否作为默认字幕<br>Y：是<br>N：否 */
  asDefault?: string;
  /** 说明字幕文件是什么语言，默认自动检测，支持语言：中文、繁体中文 、英语、日语、韩语、法语、德语、俄语、西班牙语、阿拉伯语、葡萄牙语、其他 */
  language?: string;
}
/**
 * 1、通过视频id上传视频字幕文件，该接口会自动检测字幕语言
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface UploadSubtitleResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
}
/**
 * 1、通过视频id，创建该视频的视频大纲分析任务，分析完成会以http回调的方式把分析结果回调回去，回调地址暂时请您联系保利威客服人员帮您配置
2、接口支持https协议
3、如果视频没有已发布的字幕，会先使用保利威的智能字幕生成字幕。默认自动发布并应用到该视频；传入 autoApplyEnabled="N" 时，字幕正常生成，但不自动发布，状态为“待校验”
4、autoApplyEnabled 仅控制本次新生成字幕的自动发布行为，不会撤下视频已有的字幕。视频已有可用字幕时，直接使用已有字幕生成大纲
 */
export interface CreateVideoOutlineTaskRequest {
  /** 直播appId。可在"云点播" -> "设置" -> "API接口" 中查看您的直播appId和appSecret */
  appId: string;
  /** 当前时间的毫秒级时间戳，30分钟内有效 */
  timestamp: number;
  /** 签名，32位大写MD5值【详见[MD5签名生成规则](/vod/api/buildSignMd5)】 */
  sign: string;
  /** 视频id */
  vid: string;
  /** 是否在字幕生成后自动发布并应用到视频。取值为大写 Y 或 N：Y 表示自动发布；N 表示不自动发布，生成后处于“待校验”状态。不传时默认为 Y */
  autoApplyEnabled?: string;
}
/**
 * 1、通过视频id，创建该视频的视频大纲分析任务，分析完成会以http回调的方式把分析结果回调回去，回调地址暂时请您联系保利威客服人员帮您配置
2、接口支持https协议
3、如果视频没有已发布的字幕，会先使用保利威的智能字幕生成字幕。默认自动发布并应用到该视频；传入 autoApplyEnabled="N" 时，字幕正常生成，但不自动发布，状态为“待校验”
4、autoApplyEnabled 仅控制本次新生成字幕的自动发布行为，不会撤下视频已有的字幕。视频已有可用字幕时，直接使用已有字幕生成大纲
 */
export interface CreateVideoOutlineTaskResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 请求唯一标识，如遇接口调用失败情况，可发此id给客服辅助排查问题 */
  requestId?: string;
  /** true代表接口调用成功，false代表接口调用失败 */
  success?: boolean;
  /** 成功返回视频大纲任务id，失败返回null。 */
  data?: number;
  /** 接口调用失败时的描述信息，【详见[error字段说明](/vod/api/video_management/video_outline/create_video_outline_task.md?id=error字段说明)】 */
  error?: Record<string, unknown>;
}
/**
 * 1、通过视频id查询微信分享页的视频相关信息
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetWechatShareSettingRequest {
  /** 当前时间的毫秒级时间戳，3分钟内有效 */
  ptime: number;
  /** 签名，为40位大写的SHA1值,<code style="color:red">生成签名的secretkey密钥作为通信数据安全的关键信息，严禁保存在客户端直接使用，所有API都必须通过客户自己服务器中转调用POLYV服务器获取响应数据</code>【详见[签名生成规则](/vod/api/buildSign)】 */
  sign: string;
  /** 视频id */
  vid: string;
}
/**
 * 1、通过视频id查询微信分享页的视频相关信息
2、接口URL中的{userid}为点播账号userid，具体参考菜单【使用须知】->【获取密钥】
3、接口支持https协议
 */
export interface GetWechatShareSettingResponse {
  /** 响应状态码，200为成功返回，非200为失败【详见[全局错误说明](/vod/api/errorInfo)】 */
  code?: number;
  /** 响应状态文本信息 */
  status?: string;
  /** 响应描述信息，当code为400或者500的时候，辅助描述错误原因 */
  message?: string;
  /** 响应成功时返回微信分享页的视频相关信息，响应失败返回空【详见[data字段说明](/vod/api/video_management/wechat_share/get_wechat_share_setting.md?id=data字段说明)】 */
  data?: Record<string, unknown>;
}
