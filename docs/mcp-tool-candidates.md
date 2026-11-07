# MCP 工具候选清单底稿（D3，Story 1 产出）

> 状态：**待业务勾选的底稿**，不是配置。最终上架子集以
> `packages/tool-manifest/generated/tools.manifest.json` 的 `curatedWhitelist`
> 字段为唯一事实源（AD-5：单一白名单，服务端不得另存可见性清单）。
> 本文件对应 spec-doubao-mcp-plugin 的 Story 1 / D3，勾选完成后由 Story 6 落地硬校验。

## 挑选取舍依据

1. **来源**：全量 manifest（572 个叶子工具，`pnpm --filter @polyv/tool-manifest generate` 产出）× 五大域任务清单（spec companion `tool-domains.md`）。域外能力（聊天禁言、问卷、签到、角色管理等）一律不进。
2. **读远多于写的配比**（11 读 + 9 写）：开放接口约 20 天请求量读远超写（查频道 57M vs 创建 95K），但写有稳定真实量（创建频道 95K / 改频道设置 62K），故 v1 读写并存；读优先覆盖后台 30 天点击最高的场景（观看条件 15,692 / 直播间统计 14,316 / 回放设置 14,260 / 新建直播 8,459 / 商品库 3,071）。
3. **排除项全部遵守**（tool-domains.md 排除项总表）：无删除/封禁/强制下播/推流密钥；无付费观看与外部授权（见下方 `watch-condition set` 的枚举裁剪校验点）；无角色管理；无问卷/签到；无"执行任意命令"入口。
4. **R1–R4 未核实项不承诺**：涉及 R1（登记字段范围）、R2（回放添加/最新视频策略/地址链路）、R3（被引用商品编辑限制）的工具在表中标注，工具描述在核实前不得写死对应能力。`playback add-vod` 因与"点播 VID 传入应报错"边界直接冲突（其语义就是点播 VID 入回放库），暂列备选不进 20。
5. **每域覆盖**：5.1 直播间 4 个、5.2 观看条件 5 个、5.3 回放 3 个、5.4 数据 3 个、5.5 商品 5 个。5.3 偏薄是刻意的——添加回放（R2）与设置观看回放（最新视频/整表循环）的 CLI 形态待核实后再补。
6. **destructive 标注口径**：`否` = 追加式/查询式；`部分` = 默认行为可能影响线上可见状态（如商品下架）；`是` = 单次调用即可造成大范围覆盖/全局生效，工具层必须加"先查后合并"或二次确认。

## 候选清单（20 = 11 读 + 9 写）

| # | 工具名 | CLI 命令 | 域 | 读/写 | destructive | 边界校验点（AD-10，Story 6 落地） | 依赖核实项 |
|---|---|---|---|---|---|---|---|
| 1 | `mcp_polyv_channel_list` | `channel list` | 5.1 直播间 | 读 | 否 | 分页参数（page/limit）默认值固定；返回必带总数与分页口径 | — |
| 2 | `mcp_polyv_channel_get` | `channel get` | 5.1 直播间 | 读 | 否 | channelId 必填；"未找到"是正常查询结果不是错误（AD-9） | — |
| 3 | `mcp_polyv_channel_create` | `channel create` | 5.1 直播间 | 写 | 否 | name 必填且 ≤100 字符；创建参数不含计划时间与主讲人显示名（走 create+update 两步，Skill 编排）；描述必须写明"计划时间仅用于展示与状态判断，不控制开播/结束" | — |
| 4 | `mcp_polyv_channel_update` | `channel update` | 5.1 直播间 | 写 | 部分 | 先查现值再合并、禁整表覆盖；`--publisher` = 主讲人显示名（自由文本，不绑账号）；时间戳格式校验 | — |
| 5 | `mcp_polyv_watch_condition_get` | `watch-condition get` | 5.2 观看条件 | 读 | 否 | channel-id 可选（不传=全局设置）——MCP 侧要求显式传频道或显式声明查全局，消除歧义 | — |
| 6 | `mcp_polyv_watch_condition_set` | `watch-condition set` | 5.2 观看条件 | 写 | 是（观看条件整组语义） | **auth-type 枚举生成期裁剪至放行值 `none/code/phone/info`，`pay/external` 类生成期排除 + 运行时拒绝兜底（AD-5/AD-10）**；rank=1/2 修改必须先查后合并、保留未要求改动的另一级条件；auth-type=code 时 auth-code 必填 | R1（info 登记字段范围） |
| 7 | `mcp_polyv_whitelist_list` | `whitelist list` | 5.2 观看条件 | 读 | 否 | rank 必填（1=主要/2=次要）；channel-id 可选→全局 | — |
| 8 | `mcp_polyv_whitelist_add` | `whitelist add` | 5.2 观看条件 | 写 | 否（追加式） | 同会员码再次添加覆盖昵称（描述写明）；不做整表替换；批量导入不承诺逐行失败明细（整体结果+汇总口径） | — |
| 9 | `mcp_polyv_web_auth_record_field_get` | `web auth record-field-get` | 5.2 观看条件 | 读 | 否 | 返回登记字段与是否必填；登记观看 ≠ 报名观看（描述写明，不扩展报名审核/短信） | R1（字段可选范围） |
| 10 | `mcp_polyv_playback_list` | `playback list` | 5.3 回放 | 读 | 否 | list-type 区分暂存/回放视频；必须用直播系统视频 ID，点播 VID 混用报错 | R2（回放列表与配置口径） |
| 11 | `mcp_polyv_playback_enabled_get` | `playback enabled get` | 5.3 回放 | 读 | 否 | channelId 必填 | — |
| 12 | `mcp_polyv_playback_enabled_set` | `playback enabled set` | 5.3 回放 | 写 | 是（channel-id 缺省时=账号级全局开关） | **user-id 必填参数应由服务端从 token→用户映射注入（与隐式 `--source` 同类处理），不接受模型传入他人 userId**；channel-id 缺省即全局生效，需在工具描述显著标注或强制必填 | — |
| 13 | `mcp_polyv_statistics_channel_summary` | `statistics channel-summary` | 5.4 数据 | 读 | 否 | 返回必带口径字段（直播/回放、时间范围、时长单位、去重口径）；失败/缺失返回明确状态**不写 0**；多场 UV 不得相加冒充跨场去重 | — |
| 14 | `mcp_polyv_statistics_export_session` | `statistics export session` | 5.4 数据 | 读 | 否 | 导出=异步任务 ID + 状态 + 签名下载 URL，不塞文件内容（AD-9） | R2（报表口径） |
| 15 | `mcp_polyv_statistics_product_click` | `statistics product-click` | 5.4 数据 | 读 | 否 | 商品成交只返回系统可得数据（外链购买不承诺齐全）；口径字段必带 | — |
| 16 | `mcp_polyv_product_list` | `product list` | 5.5 商品 | 读 | 否 | channel-id 与 `--platform`（平台商品库）二选一必须显式；返回上下架状态 | — |
| 17 | `mcp_polyv_product_add` | `product add` | 5.5 商品 | 写 | 否 | status（1 上架/2 下架）与 link-type（10 通用/11 多平台）枚举必填；link-type=10 时 link 必填（联动校验）；首版只做标准商品与普通购买链接 | — |
| 18 | `mcp_polyv_product_update` | `product update` | 5.5 商品 | 写 | 是（全字段覆盖语义） | **先查现值再合并、禁整表覆盖（AD-10）**；未传字段保持原值 | — |
| 19 | `mcp_polyv_product_shelf` | `product shelf` | 5.5 商品 | 写 | 部分（下架影响线上可见） | "要求不明确时默认下架准备"；shelf=1/2 枚举 | — |
| 20 | `mcp_polyv_product_reference` | `product reference` | 5.5 商品 | 写 | 部分 | tool-domains 要求"引用/复制方式为显式必填参数、缺失报错不默认"——**CLI 现状只有引用（reference）语义，无复制方式参数**：策展时要么按"仅引用"上架并在描述写明，要么等 CLI 补复制参数；关联方式不可猜测 | R3（被引用商品编辑限制） |

读（11）：#1, #2, #5, #7, #9, #10, #11, #13, #14, #15, #16
写（9）：#3, #4, #6, #8, #12, #17, #18, #19, #20

## 备选（核实/补齐后再议）

| 工具名 | CLI 命令 | 说明 |
|---|---|---|
| `mcp_polyv_playback_add_vod` | `playback add-vod` | 语义为"点播视频加入回放库"，与边界"点播 VID 传入应报错"冲突，且涉及转码异步（提交成功≠可看）。待 R2 核实"添加至回放列表"的正规链路后再定形态 |
| `mcp_polyv_channel_viewer_list` / `mcp_polyv_channel_viewer_export` | `channel viewer list/export` | 5.4 观众明细查询/导出主力，但导出链路（异步任务+链接）与字段口径待 R4 一并核实；若 D3 需要 5.4 明细可替换 #13/#14 之一 |
| `mcp_polyv_statistics_view` | `statistics view` | 每日观看统计（直播+回放），与 #13 二选一或都上，视 outputSchema 工作量 |

## 与生成器相关的已知事实（勾选时须知）

- **隐式全局 `--source`**：CLI 中由 `src/utils/source-context.ts` 在 program 级定义并强制校验，不出现在任何子命令 option 中；manifest 已对全部 526 个 API 绑定工具记录 `"serverInjected": ["source"]` 并从 inputSchema 排除（auth/account/use/config 前缀的 46 个工具豁免）。Story 4 服务端注入时注意：`viewer list` 与 `channel viewer unrelated-list` 自带同名 `--source` 参数，**在真实 CLI 中已被全局 `--source` 运行时遮蔽（实测传入值被 program 层捕获，本地过滤参数收不到值）**，manifest 已将二者排除出 inputSchema 并记录于 `stats.sourceParamShadowed`。
- **枚举推断**：572 个工具中 400 个拿到 parser 源码级枚举（confidence high）、154 个拿到描述文本枚举（medium）、18 个无枚举参数；`watch-condition set --auth-type` 的完整枚举（含 pay/external）已在 manifest 中如实记录，**策展裁剪发生在白名单落地时（Story 6 生成期注入）**，本底稿第 6 行已写明裁剪要求。
- 全部工具名/路径/参数以 `packages/tool-manifest/generated/tools.manifest.json`（formatVersion "1"）为准，重新生成 diff 即变更记录。
