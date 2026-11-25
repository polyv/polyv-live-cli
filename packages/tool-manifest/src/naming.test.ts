import { findNameCollisions, normalizeSegment, toolNameFromPath } from './naming';

describe('tool naming rules', () => {
  it('prefixes mcp_polyv_ and joins path segments with underscores', () => {
    expect(toolNameFromPath(['channel', 'list'])).toBe('mcp_polyv_channel_list');
    expect(toolNameFromPath(['viewer', 'list'])).toBe('mcp_polyv_viewer_list');
  });

  it('includes all four levels of deep paths', () => {
    expect(toolNameFromPath(['account', 'api', 'playback', 'list']))
      .toBe('mcp_polyv_account_api_playback_list');
    expect(toolNameFromPath(['account', 'api', 'channel', 'basic-list']))
      .toBe('mcp_polyv_account_api_channel_basic_list');
  });

  it('normalizes kebab-case segments to snake_case and lowercases', () => {
    expect(toolNameFromPath(['watch-condition', 'set'])).toBe('mcp_polyv_watch_condition_set');
    expect(toolNameFromPath(['platform-label', 'List'.toLowerCase()])).toBe('mcp_polyv_platform_label_list');
    expect(normalizeSegment('Card-Push')).toBe('card_push');
  });

  it('rejects empty paths', () => {
    expect(() => toolNameFromPath([])).toThrow();
  });

  it('detects collisions after normalization', () => {
    const collisions = findNameCollisions([
      ['watch-condition', 'get'],
      ['watch_condition', 'get'],
      ['channel', 'list'],
    ]);
    expect(collisions.size).toBe(1);
    expect(collisions.has('mcp_polyv_watch_condition_get')).toBe(true);
  });
});
