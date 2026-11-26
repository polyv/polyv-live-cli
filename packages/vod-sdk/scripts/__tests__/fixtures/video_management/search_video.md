# 搜索视频

### 接口描述
```
按关键词搜索视频
```

### 请求参数描述
| 参数名 | 必选 | 类型 | 说明 |
| --- | --- | --- | --- |
| userid | true | String | 用户ID |
| keyword | true | String | 搜索关键词 |
| page | false | Integer | 页号 |
| keyword | true | String | 重复出现的同一参数 |

### 响应参数描述
| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| totalItems | Integer | 总数 |
| contents | Array<Object> | 视频列表 |

##### contents参数描述
| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| vid | String | 视频ID |
| title | String | 标题 |
