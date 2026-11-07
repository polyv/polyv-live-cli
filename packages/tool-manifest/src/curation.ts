/**
 * @fileoverview Curation layer (D3): the decided whitelist plus generator-side
 * boundary rules that must live in the manifest itself (AD-5) — enum crops,
 * server-injected params, forced required params, description notes.
 *
 * D3 decision (2026-11-07): all 20 candidate tools ship; #20 product reference
 * ships reference-only (CLI has no copy mode).
 */

import { ToolEntry, ToolManifest } from './types';

export const CURATION_VERSION = 1;
export const CURATION_DECIDED_AT = '2026-11-07';
export const CURATION_DECISION = 'D3: all 20 candidates shipped; product_reference reference-only';

/** D3 whitelist (11 read + 9 write), grouped by domain. */
export const CURATED_WHITELIST: readonly string[] = [
  // 5.1 直播间（4）
  'mcp_polyv_channel_list',
  'mcp_polyv_channel_get',
  'mcp_polyv_channel_create',
  'mcp_polyv_channel_update',
  // 5.2 观看条件（5）
  'mcp_polyv_watch_condition_get',
  'mcp_polyv_watch_condition_set',
  'mcp_polyv_whitelist_list',
  'mcp_polyv_whitelist_add',
  'mcp_polyv_web_auth_record_field_get',
  // 5.3 回放（3）
  'mcp_polyv_playback_list',
  'mcp_polyv_playback_enabled_get',
  'mcp_polyv_playback_enabled_set',
  // 5.4 数据（3）
  'mcp_polyv_statistics_channel_summary',
  'mcp_polyv_statistics_export_session',
  'mcp_polyv_statistics_product_click',
  // 5.5 商品（5）
  'mcp_polyv_product_list',
  'mcp_polyv_product_add',
  'mcp_polyv_product_update',
  'mcp_polyv_product_shelf',
  'mcp_polyv_product_reference',
];

interface CurationOverride {
  /** Restrict an enum param to the allowed subset (intersected with the original). */
  cropEnum?: { param: string; allowed: readonly string[] };
  /** Move params out of inputSchema into serverInjected (server resolves them). */
  serverInjectParams?: readonly string[];
  /** Force params into required (must exist in properties). */
  requireParams?: readonly string[];
  /** Note appended to the tool description (business boundary, in Chinese for the model). */
  descriptionNote?: string;
}

export const CURATION_OVERRIDES: Readonly<Record<string, CurationOverride>> = {
  // 5.2: pay/external/custom/direct are out of plugin scope (AD-5/AD-10: crop at generation).
  mcp_polyv_watch_condition_set: {
    cropEnum: { param: 'authType', allowed: ['none', 'code', 'phone', 'info'] },
    descriptionNote:
      '（上架边界：仅支持 none/code/phone/info 四种观看条件；付费观看与外部授权不在本插件范围。）',
  },
  // 5.3: userId is resolved from the caller's token (never model-supplied); omitting
  // channelId flips the account-level global switch — force it explicit.
  mcp_polyv_playback_enabled_set: {
    serverInjectParams: ['userId'],
    requireParams: ['channelId'],
    descriptionNote:
      '（channelId 必填：不指定频道会对整个账号全局开关回放；操作以当前授权用户身份执行。）',
  },
  // 5.5: D3 decision — reference semantics only; copy mode does not exist in the CLI today.
  mcp_polyv_product_reference: {
    descriptionNote: '（仅引用：商品字段跟随平台商品库变化；本版本不支持复制为独立商品。）',
  },
};

/** Apply D3 curation in place: validate whitelist, apply overrides, stamp metadata. */
export function applyCuration(manifest: ToolManifest): void {
  const byName = new Map(manifest.tools.map(tool => [tool.name, tool]));

  const missing = CURATED_WHITELIST.filter(name => !byName.has(name));
  if (missing.length > 0) {
    throw new Error(`curation whitelist references unknown tools: ${missing.join(', ')}`);
  }
  for (const [name, override] of Object.entries(CURATION_OVERRIDES)) {
    if (!byName.has(name)) {
      throw new Error(`curation override references unknown tool: ${name}`);
    }
    applyOverride(byName.get(name) as ToolEntry, override);
  }

  manifest.curatedWhitelist = [...CURATED_WHITELIST];
  manifest.curation = {
    version: CURATION_VERSION,
    decidedAt: CURATION_DECIDED_AT,
    decision: CURATION_DECISION,
    overriddenTools: Object.keys(CURATION_OVERRIDES),
  };
}

function applyOverride(tool: ToolEntry, override: CurationOverride): void {
  if (override.cropEnum !== undefined) {
    const param = tool.inputSchema.properties[override.cropEnum.param];
    if (param?.enum === undefined) {
      throw new Error(`cropEnum: ${tool.name}.${override.cropEnum.param} has no enum to crop`);
    }
    const kept = param.enum.filter(value => (override.cropEnum as { allowed: readonly string[] }).allowed.includes(value));
    if (kept.length === 0) {
      throw new Error(`cropEnum: ${tool.name}.${override.cropEnum.param} would become empty`);
    }
    param.enum = kept;
    param.enumConfidence = 'high'; // curated decision, not inference
  }

  for (const param of override.serverInjectParams ?? []) {
    delete tool.inputSchema.properties[param];
    tool.inputSchema.required = tool.inputSchema.required.filter(name => name !== param);
    if (!tool.serverInjected.includes(param)) {
      tool.serverInjected.push(param);
    }
  }

  for (const param of override.requireParams ?? []) {
    if (tool.inputSchema.properties[param] === undefined) {
      throw new Error(`requireParams: ${tool.name}.${param} not in properties`);
    }
    if (!tool.inputSchema.required.includes(param)) {
      tool.inputSchema.required.push(param);
    }
  }

  if (override.descriptionNote !== undefined) {
    tool.description = `${tool.description} ${override.descriptionNote}`.trim();
  }
}
