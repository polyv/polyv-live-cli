/**
 * Unit tests for the VOD type generator (scripts/generate-types.ts and its modules).
 *
 * The VOD generator deviates from the live SDK's on purpose; these tests pin the deviations:
 *
 * - Type names derive from the documentation file's stem (`search_video.md` ->
 *   `SearchVideoRequest`), not from a hash of the Chinese title, so they stay stable and unique
 *   per document (hashes collide, and colliding interfaces merge silently in TypeScript).
 * - Nested types are prefixed with the same stem (`contents` -> `SearchVideoContents`).
 * - A document may list a parameter twice (struck-through legacy row next to its replacement);
 *   the interface keeps the first mention.
 * - Module folder names become namespace identifiers in the generated index, and the docs have
 *   a folder called `private` — a reserved word.
 *
 * The remaining behaviour (table parsing, type mapping, required/optional) is shared with the
 * live SDK and covered here only as far as the generator depends on it.
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import { MarkdownParser, type ParsedApiDoc } from '../parsers/markdown-parser.js';
import { generateInterfaceName, mapType, toValidIdentifier } from '../generators/type-mapper.js';
import { TypeGenerator } from '../generators/type-generator.js';
import { FileProcessor } from '../processors/file-processor.js';

const FIXTURES = join(__dirname, 'fixtures');

/** The fixture document, parsed the way FileProcessor feeds it to the generator. */
const parsedSample = (): ParsedApiDoc => new MarkdownParser().parse(readFileSync(join(FIXTURES, 'video_management/search_video.md'), 'utf8'));

describe('MarkdownParser', () => {
  it('parses the sample document into request, response and nested params', () => {
    const doc = parsedSample();
    expect(doc.metadata.title).toBe('搜索视频');
    expect(doc.requestParams.map((p) => p.name)).toEqual(['userid', 'keyword', 'page', 'keyword']);
    expect(doc.requestParams[0]).toMatchObject({ required: true, type: 'String', description: '用户ID' });
    expect(doc.responseParams.map((p) => p.name)).toEqual(['totalItems', 'contents']);
    // A response table has no 必选 column, so nothing is required.
    expect(doc.responseParams.every((p) => !p.required)).toBe(true);
    expect(Object.keys(doc.nestedParams)).toEqual(['contents']);
    expect(doc.nestedParams.contents?.map((p) => p.name)).toEqual(['vid', 'title']);
  });

  it('returns empty params for a document without tables', () => {
    const doc = new MarkdownParser().parse('# 只有说明\n\n没有参数表。');
    expect(doc.requestParams).toEqual([]);
    expect(doc.responseParams).toEqual([]);
    expect(doc.nestedParams).toEqual({});
  });
});

describe('TypeGenerator type naming (from the documentation file stem)', () => {
  const generator = new TypeGenerator();

  it('derives request, response and nested names from the file stem', () => {
    const types = generator.generate(parsedSample(), 'video_management/search_video.md');
    expect(types.map((t) => t.name)).toEqual(['SearchVideoRequest', 'SearchVideoResponse', 'SearchVideoContents']);
    expect(types[0].content).toContain('export interface SearchVideoRequest');
  });

  it('keeps different documents apart even when their nested sections share a name', () => {
    // The live generator names nested types generically ("contents"), so two documents in one
    // module produced one silently-merged interface. With the stem prefix they stay distinct.
    const other = parsedSample();
    const types = generator.generate(other, 'video_management/list_video.md');
    expect(types.map((t) => t.name)).toEqual(['ListVideoRequest', 'ListVideoResponse', 'ListVideoContents']);
  });

  it('prefixes a stem that starts with a digit', () => {
    const doc = parsedSample();
    const types = generator.generate(doc, 'video_management/2fa_verify.md');
    expect(types[0].name).toBe('_2faVerifyRequest');
  });

  it('falls back to the title-based name when no source path is given', () => {
    const doc = parsedSample();
    doc.metadata.title = '获取访问令牌';
    const types = generator.generate(doc);
    // Without a stem, Request/Response hash the Chinese title (live-generator behaviour). The
    // nested type keeps its raw name in this mode — which can collide across documents; that is
    // exactly why the pipeline always passes the file path and the stem rules apply instead.
    for (const name of types.map((t) => t.name).filter((n) => /(Request|Response)$/.test(n))) {
      expect(name).toMatch(/^Api[0-9a-fA-F]+(Request|Response)$/);
    }
    expect(types.map((t) => t.name)).toContain('contents');
  });
});

describe('TypeGenerator interface body', () => {
  const generator = new TypeGenerator();

  it('keeps the first mention of a parameter listed twice', () => {
    const content = generator.generateInterface('SearchVideoRequest', parsedSample().requestParams);
    const keywordLines = content.split('\n').filter((line) => /keyword[?]?:/.test(line));
    expect(keywordLines).toHaveLength(1);
    expect(keywordLines[0]).toContain('keyword: string;');
  });

  it('marks optional parameters and maps their types', () => {
    const content = generator.generateInterface('SearchVideoRequest', parsedSample().requestParams);
    expect(content).toContain('userid: string;');
    expect(content).toContain('page?: number;');
  });

  it('sanitises field names through toValidIdentifier', () => {
    const content = generator.generateInterface('Sanitised', [
      { name: 'interface', required: true, type: 'String', description: '保留字' },
      { name: '1st_page', required: false, type: 'Integer', description: '数字开头' },
      { name: '视频标题', required: true, type: 'String', description: '中文保留' }
    ]);
    expect(content).toContain('_interface: string;');
    expect(content).toContain('_1st_page?: number;');
    expect(content).toContain('视频标题: string;');
  });
});

describe('TypeGenerator.generateIndexContent (module names as namespace identifiers)', () => {
  const generator = new TypeGenerator();

  it('keeps a normal module name and prefixes the reserved-word module `private`', () => {
    const index = generator.generateIndexContent(['video_management', 'private']);
    expect(index).toContain(`export * as video_management from './video_management.js';`);
    // The docs have a folder called `private`; `export * as private` would not parse.
    expect(index).toContain(`export * as _private from './private.js';`);
    expect(index).not.toContain('as private ');
  });

  it('references each module file once', () => {
    const index = generator.generateIndexContent(['a', 'b']);
    expect(index.match(/from '\.\/[a-z_]+\.js';/g)).toHaveLength(2);
  });
});

describe('generateInterfaceName (title-based names, live-generator behaviour)', () => {
  it('strips an 接口/API prefix from an otherwise ASCII title', () => {
    expect(generateInterfaceName('接口 Create Channel', 'Request')).toBe('CreateChannelRequest');
    expect(generateInterfaceName('api upload file (v1)', 'Response')).toBe('UploadFileResponse');
  });

  it('hashes a Chinese title into a stable ApiXXXX name', () => {
    const first = generateInterfaceName('获取访问令牌', 'Request');
    const again = generateInterfaceName('获取访问令牌', 'Request');
    expect(first).toMatch(/^Api[0-9a-fA-F]+Request$/);
    expect(first).toBe(again);
  });
});

describe('mapType', () => {
  it('maps the documentation types used by the VOD docs', () => {
    expect(mapType('String')).toBe('string');
    expect(mapType('Integer')).toBe('number');
    expect(mapType('Long')).toBe('number');
    expect(mapType('Boolean')).toBe('boolean');
    expect(mapType('Object')).toBe('Record<string, unknown>');
    expect(mapType('Array<String>')).toBe('string[]');
    expect(mapType('Array<Object>')).toBe('Record<string, unknown>[]');
  });
});

describe('FileProcessor', () => {
  it('discovers documentation files, grouped by their first directory', async () => {
    const processor = new FileProcessor(FIXTURES, join(FIXTURES, 'out'), join(FIXTURES, 'report.json'));
    const files = await processor.getApiMarkdownFiles();
    const names = files.map((f) => f.relativePath).sort();
    // README.md is not an API doc and is skipped.
    expect(names).toEqual(['private/get_token.md', 'video_management/search_video.md']);
    const groups = processor.groupByModule(files);
    expect([...groups.keys()].sort()).toEqual(['private', 'video_management']);
    expect(groups.get('video_management')).toHaveLength(1);
  });

  it('treats a document directly in the docs directory as module `common`', async () => {
    const root = join(FIXTURES, 'flat-tmp');
    mkdirSync(root, { recursive: true });
    writeFileSync(join(root, 'standalone.md'), '# 独立文档\n');
    try {
      const processor = new FileProcessor(root, join(root, 'out'), join(root, 'report.json'));
      const files = await processor.getApiMarkdownFiles();
      expect(files.map((f) => f.module)).toEqual(['common']);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('returns no files for a missing directory', async () => {
    const processor = new FileProcessor(join(FIXTURES, 'nope'), join(FIXTURES, 'out'), join(FIXTURES, 'report.json'));
    expect(await processor.getApiMarkdownFiles()).toEqual([]);
  });

  it('reports parse failures per file', () => {
    const processor = new FileProcessor(FIXTURES, join(FIXTURES, 'out'), join(FIXTURES, 'report.json'));
    const report = processor.createReport([
      { file: 'video_management/search_video.md', success: true, moduleName: 'video_management' },
      { file: 'video_management/broken.md', success: false, error: 'No tables found in document', moduleName: 'video_management' }
    ]);
    expect(report.totalFiles).toBe(2);
    expect(report.successCount).toBe(1);
    expect(report.failureCount).toBe(1);
    expect(report.failures[0]).toMatchObject({ file: 'video_management/broken.md', reason: 'No tables found in document' });
  });
});

afterAll(() => {
  // Nothing is written by these tests; remove the output dirs the constructor was handed.
  for (const dir of [join(FIXTURES, 'out'), join(FIXTURES, 'report.json')]) {
    if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  }
});
