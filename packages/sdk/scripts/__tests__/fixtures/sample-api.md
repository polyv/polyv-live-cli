# 创建单个频道(旧版)

### 接口描述
```
1、创建频道并进行相关设置
2、接口支持https协议
```

### 接口URL
```
http://api.polyv.net/live/v2/channels/
```

### 请求方式
```
POST
```

### 接口约束
1、接口同时支持HTTP 、HTTPS ，建议使用HTTPS 确保接口安全，接口调用有频率限制，[详细请查看](/live/api/limit)

### 请求参数描述
| 参数名 | 必选    | 类型 | 说明                                                                                                                                                            |
| --- |-------| --- |---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| appId | true  | String | 账号appId【详见[获取密钥](/live/api/getSecretKey)】                                                                                                                     |
| timestamp | true  | Long | 当前13位毫秒级时间戳，3分钟内有效                                                                                                                                            |
| sign | true  | String | 签名，为32位大写的MD5值                                                                                                                       |
| userId               | true  | String | POLYV用户ID，和保利威官网一致，获取路径：官网->登录->直播（开发设置）                                                                                                                      |
| name               | true  | String | 频道名称，最大长度60                                                                                                                                                   |
| channelPasswd      | true  | String | 频道密码，长度不能超过16位                                                                                                                                                |
| scene              | false | String | 直播场景，默认alone<br/>alone：活动拍摄<br/>ppt：三分屏<br/>topclass：大班课<br/>seminar：研讨会                                                                                      |
| pureRtcEnabled     | false | String | 是否为无延时直播，默认为N<br/>Y：是<br/>N：否                                                                                                                                 |
| categoryId         | false | Integer | 新建频道的所属分类，如果不提交，则为默认分类                                                                                                                                            |
| maxViewer          | false | Integer | 最大同时在线人数，0和-1表示不限制观看人数                                                                                                                                        |
| playerColor        | false | String  | 播放器控制栏颜色，默认：#666666                                                                                                                                           |
| autoPlay           | false | Integer | 是否自动播放<br/>0：不自动播放<br/>1：自动播放，默认1                                                                                                                             |

### 响应参数描述
| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| code | Integer | 响应状态码，200为成功返回，非200为失败 |
| status | String | 响应状态文本信息 |
| message | String | 响应描述信息，当code为400或者500的时候，辅助描述错误原因 |
| data | Object | 成功响应时返回频道详细信息 |

<h6 id="polyv1"><a data-id="Data参数描述"class="anchor"><span>Data参数描述</span></a></h6>

| 参数名 | 类型 | 说明                                       |
| --- | --- |------------------------------------------|
| channelId      | String  | 直播频道号                                    |
| userId      | String  | POLYV用户ID，和保利威官网一致，获取路径：官网->登录->直播（开发设置） |
| name      | String  | 直播频道名称                                   |
| publisher      | String  | 主持人                                      |
| description      | String  | 直播频道描述                                   |
| url | String | 直播流的URL                                  |
| stream | String | 直播流名                                     |
| logoImage | String | LOGO的图片地址                                |
| playerColor | String | 播放器控制栏的颜色                                |
| autoPlay | Boolean | 是否自动播放                                   |
| scene | String | 频道的直播场景                                  |
| channelPasswd | String | 频道密码                                     |
| linkMicLimit | Integer | 连麦人数                                     |
| streamType | String | 直播方式                                     |

### 响应示例

成功示例

```json
{
    "code": 200,
    "status": "success",
    "message": "",
    "data": {
        "channelId": 11667086,
        "userId": "1b448be323",
        "name": "polyv小课堂",
        "publisher": "主持人",
        "description": "",
        "url": "rtmp://push-d1.videocc.net/recordf/1b448be32316715274020016771",
        "stream": "1b448be32316715274020016771",
        "logoImage": "https://liveimages.videocc.net/uploaded/images/2021/04/fy3ce1e8uh.png",
        "playerColor": "#666666",
        "autoPlay": false,
        "scene": "alone",
        "channelPasswd": "QIbGmAmhMJ1dq",
        "linkMicLimit": 16,
        "streamType": "client"
    }
}
```
