import { CURATED_WHITELIST, applyCuration } from './curation';
import { ToolEntry, ToolManifest } from './types';

function entry(name: string, overrides: Partial<ToolEntry> = {}): ToolEntry {
  return {
    name,
    description: `${name} description`,
    commandPath: name.split('_').slice(2),
    verbClass: 'read',
    sourceExempt: false,
    serverInjected: ['source'],
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },
    ...overrides,
  };
}

function manifestWith(tools: ToolEntry[]): ToolManifest {
  return {
    formatVersion: '1',
    generator: { name: '@polyv/tool-manifest', version: 'test' },
    cli: { package: 'polyv-live-cli', version: 'test', commanderVersion: '11.1.0' },
    stats: {
      topLevelCommands: 0,
      treeNodes: 0,
      leafTools: tools.length,
      maxDepth: 1,
      toolsByVerbClass: { read: tools.length, write: 0, unknown: 0 },
      enumCoverage: { high: 0, medium: 0, low: 0, none: tools.length },
      sourceInjectedTools: tools.length,
      sourceExemptTools: 0,
      sourceParamShadowed: [],
      warnings: [],
    },
    curatedWhitelist: [],
    tools,
    generatedAt: '2026-11-07T00:00:00.000Z',
  };
}

function allTwenty(): ToolEntry[] {
  return CURATED_WHITELIST.map(name =>
    entry(name, {
      inputSchema: {
        type: 'object',
        properties: {
          channelId: { type: 'string', origin: 'option', flag: '--channel-id' },
          authType: {
            type: 'string',
            origin: 'option',
            flag: '--auth-type',
            enum: ['none', 'code', 'pay', 'phone', 'info', 'custom', 'external', 'direct'],
            enumConfidence: 'medium',
          },
          userId: { type: 'string', origin: 'option', flag: '--user-id' },
        },
        required: [],
        additionalProperties: false,
      },
    }),
  );
}

describe('curation (D3)', () => {
  it('ships exactly the 20 decided tools', () => {
    expect(CURATED_WHITELIST).toHaveLength(20);
    expect(new Set(CURATED_WHITELIST).size).toBe(20);
  });

  it('fills curatedWhitelist and stamps curation metadata', () => {
    const manifest = manifestWith(allTwenty());
    applyCuration(manifest);
    expect(manifest.curatedWhitelist).toEqual([...CURATED_WHITELIST]);
    expect(manifest.curation).toMatchObject({
      version: 1,
      decidedAt: '2026-11-07',
      overriddenTools: [
        'mcp_polyv_watch_condition_set',
        'mcp_polyv_playback_enabled_set',
        'mcp_polyv_product_reference',
      ],
    });
  });

  it('crops authType to the four allowed values and upgrades confidence to high', () => {
    const manifest = manifestWith(allTwenty());
    applyCuration(manifest);
    const tool = manifest.tools.find(t => t.name === 'mcp_polyv_watch_condition_set') as ToolEntry;
    const authType = tool.inputSchema.properties.authType as { enum?: string[]; enumConfidence?: string };
    expect(authType.enum).toEqual(['none', 'code', 'phone', 'info']);
    expect(authType.enumConfidence).toBe('high');
    expect(tool.description).toContain('上架边界');
  });

  it('moves playback userId to serverInjected and forces channelId required', () => {
    const manifest = manifestWith(allTwenty());
    applyCuration(manifest);
    const tool = manifest.tools.find(t => t.name === 'mcp_polyv_playback_enabled_set') as ToolEntry;
    expect(tool.inputSchema.properties.userId).toBeUndefined();
    expect(tool.inputSchema.required).not.toContain('userId');
    expect(tool.inputSchema.required).toContain('channelId');
    expect(tool.serverInjected).toEqual(expect.arrayContaining(['source', 'userId']));
    expect(tool.description).toContain('全局');
  });

  it('appends the reference-only note to product_reference', () => {
    const manifest = manifestWith(allTwenty());
    applyCuration(manifest);
    const tool = manifest.tools.find(t => t.name === 'mcp_polyv_product_reference') as ToolEntry;
    expect(tool.description).toContain('仅引用');
    expect(tool.description).toContain('不支持复制');
  });

  it('fails closed when the whitelist references an unknown tool', () => {
    const manifest = manifestWith([entry('mcp_polyv_channel_list')]);
    expect(() => applyCuration(manifest)).toThrow(/unknown tools/);
  });

  it('fails closed when cropEnum would empty the enum or the param has none', () => {
    const tools = allTwenty();
    const watch = tools.find(t => t.name === 'mcp_polyv_watch_condition_set') as ToolEntry;
    (watch.inputSchema.properties.authType as { enum?: string[] }).enum = ['pay', 'external'];
    const manifest = manifestWith(tools);
    expect(() => applyCuration(manifest)).toThrow(/would become empty/);
  });
});
