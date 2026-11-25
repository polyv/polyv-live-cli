import { classifyVerb } from './verb';

describe('verb classification', () => {
  it.each([
    ['list', 'read'],
    ['get', 'read'],
    ['show', 'read'],
    ['export', 'read'],
    ['basic-list', 'read'],
    ['detail-list', 'read'],
    ['live-data', 'read'],
    ['session-summary-list', 'read'],
  ] as const)('classifies %s as %s', (leaf, expected) => {
    expect(classifyVerb(leaf, 'some description')).toBe(expected);
  });

  it.each([
    ['create', 'write'],
    ['update', 'write'],
    ['set', 'write'],
    ['add', 'write'],
    ['delete', 'write'],
    ['batch-delete', 'write'],
    ['update-name', 'write'],
    ['mr-create', 'write'],
    ['create-init', 'write'],
    ['shelf', 'write'],
    ['batch-shelf', 'write'],
    ['type-set', 'write'],
  ] as const)('classifies %s as %s', (leaf, expected) => {
    expect(classifyVerb(leaf, 'some description')).toBe(expected);
  });

  it('falls back to the first word of the description', () => {
    expect(classifyVerb('foo', 'Get channel detail')).toBe('read');
    expect(classifyVerb('bar', '创建直播间')).toBe('write');
    expect(classifyVerb('baz', '修改频道设置')).toBe('write');
    expect(classifyVerb('qux', '查看历史并发数据')).toBe('read');
  });

  it('returns unknown when nothing matches', () => {
    expect(classifyVerb('setup', 'Initialize a scene')).toBe('unknown');
  });
});
