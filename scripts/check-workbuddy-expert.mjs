#!/usr/bin/env node
// 校验 WorkBuddy 专家包的格式约束（依据 open.workbuddy.cn/docs/expert）
// 用法：node scripts/check-workbuddy-expert.mjs [expertDir]
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const expertDir = resolve(process.argv[2] ?? 'experts/polyv-live-ops');
const failures = [];
const check = (ok, message) => { if (!ok) failures.push(message); };

const pluginPath = resolve(expertDir, '.codebuddy-plugin/plugin.json');
check(existsSync(pluginPath), `缺少 ${pluginPath}`);
if (!existsSync(pluginPath)) {
  console.error(`\n❌ ${failures.length} 项未通过`);
  process.exit(1);
}

const plugin = JSON.parse(readFileSync(pluginPath, 'utf8'));
const cjk = (s) => (s.match(/[\u4e00-\u9fff]/g) ?? []).length;

// 基础字段
check(/^[a-z][a-z0-9-]*$/.test(plugin.name), `plugin.name 必须为小写字母/数字/连字符：${plugin.name}`);
check(plugin.expertType === 'agent', `expertType 必须为 "agent"：${plugin.expertType}`);
check(typeof plugin.version === 'string' && /^\d+\.\d+\.\d+$/.test(plugin.version), 'version 必须为语义化版本号');
check(plugin.author?.name && plugin.author?.email, '缺少 author.name / author.email');
check(Array.isArray(plugin.agents) && plugin.agents.length >= 1, '缺少 agents 列表');
check(plugin.plugin === plugin.name, `plugin 字段必须与 name 一致：${plugin.plugin}`);

// agent 定义文件
const agentPath = resolve(expertDir, plugin.agents[0]);
check(existsSync(agentPath), `agent 文件不存在：${plugin.agents[0]}`);
if (existsSync(agentPath)) {
  const raw = readFileSync(agentPath, 'utf8');
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n/);
  check(!!fm, 'agent 文件缺少 frontmatter');
  check(plugin.agentName === plugin.agents[0].split('/').pop().replace(/\.md$/, ''),
    `agentName 必须与 agents 文件名一致：${plugin.agentName}`);
  if (fm) check(fm[1].includes(`name: ${plugin.agentName}`), 'agent frontmatter name 必须与文件名一致');
}

// 展示字段
check(plugin.displayName?.zh && plugin.displayName?.en, '缺少 displayName 双语');
check(plugin.profession?.zh && plugin.profession?.en, '缺少 profession 双语');
const zhDesc = plugin.displayDescription?.zh ?? '';
const zhCount = cjk(zhDesc);
check(zhCount >= 40 && zhCount <= 50, `displayDescription.zh 中文字数须 40-50，当前 ${zhCount}：「${zhDesc}」`);
check(zhDesc.length > 0 && plugin.displayDescription?.en, 'displayDescription 缺少英文');

// 头像
const avatarPath = resolve(expertDir, plugin.avatar ?? 'avatars/expert.png');
check(existsSync(avatarPath), `头像不存在：${plugin.avatar}`);
if (existsSync(avatarPath)) {
  const size = statSync(avatarPath).size;
  check(size <= 500 * 1024, `头像超过 500KB：${size} bytes`);
}

// 分类与标签/提示词
check(typeof plugin.categoryId === 'string' && /^\d{2}-/.test(plugin.categoryId), `categoryId 格式异常：${plugin.categoryId}`);
check(Array.isArray(plugin.tags) && plugin.tags.length === 3, 'tags 必须固定 3 个');
check((plugin.tags ?? []).every(t => t.en && t.zh), 'tags 每项必须双语');
check(Array.isArray(plugin.quickPrompts) && plugin.quickPrompts.length === 3, 'quickPrompts 必须固定 3 个');
check(plugin.defaultInitPrompt?.zh === plugin.quickPrompts?.[0]?.zh &&
      plugin.defaultInitPrompt?.en === plugin.quickPrompts?.[0]?.en,
  'defaultInitPrompt 必须与 quickPrompts[0] 完全一致');
check(plugin.quickPrompts?.every(q => q.zh && q.en), 'quickPrompts 每项必须双语');

// 内置 skills
for (const skill of plugin.skills ?? []) {
  const skillMd = resolve(expertDir, skill, 'SKILL.md');
  check(existsSync(skillMd), `内置 skill 缺少 SKILL.md：${skill}`);
}

if (failures.length > 0) {
  console.error(`\n❌ ${failures.length} 项未通过：`);
  failures.forEach(f => console.error(`  - ${f}`));
  process.exit(1);
}
console.log(`✅ 专家包校验通过：${plugin.name} v${plugin.version}（displayDescription.zh ${zhCount} 字）`);
