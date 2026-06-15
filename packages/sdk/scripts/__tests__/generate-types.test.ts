/**
 * Unit Tests for Type Generator
 *
 * Story 1.9: implement-type-generator
 * TDD RED Phase - All tests are designed to FAIL until implementation is complete
 */

import { describe, it, expect } from 'vitest';

describe('Type Generator', () => {
  describe('MarkdownParser', () => {
    describe('parseTable', () => {
      it('should parse markdown table correctly', async () => {
        // Arrange
        const { MarkdownParser } = await import('../parsers/markdown-parser.js');
        const parser = new MarkdownParser();
        const markdown = `
### 请求参数描述
| 参数名 | 必选 | 类型 | 说明 |
| --- | --- | --- | --- |
| appId | true | String | 账号appId |
| timestamp | true | Long | 当前13位毫秒级时间戳 |
| name | true | String | 频道名称 |
| categoryId | false | Integer | 分类ID |
`;

        // Act
        const result = parser.parseTable(markdown);

        // Assert
        expect(result).toBeDefined();
        expect(result).toHaveLength(4);
        expect(result[0]).toEqual({
          name: 'appId',
          required: true,
          type: 'String',
          description: '账号appId',
        });
        expect(result[3]).toEqual({
          name: 'categoryId',
          required: false,
          type: 'Integer',
          description: '分类ID',
        });
      });
    });

    describe('extractMetadata', () => {
      it('should extract API metadata from markdown', async () => {
        // Arrange
        const { MarkdownParser } = await import('../parsers/markdown-parser.js');
        const parser = new MarkdownParser();
        const markdown = `
# 创建频道

### 接口描述
创建频道并进行相关设置

### 接口URL
\`\`\`
http://api.polyv.net/live/v2/channels/
\`\`\`

### 请求方式
\`\`\`
POST
\`\`\`
`;

        // Act
        const metadata = parser.extractMetadata(markdown);

        // Assert
        expect(metadata.title).toBe('创建频道');
        expect(metadata.description).toBe('创建频道并进行相关设置');
        expect(metadata.url).toBe('http://api.polyv.net/live/v2/channels/');
        expect(metadata.method).toBe('POST');
      });
    });
  });

  describe('TypeMapper', () => {
    it('should map types correctly (String -> string, Integer -> number)', async () => {
      // Arrange
      const { mapType } = await import('../generators/type-mapper.js');

      // Assert
      expect(mapType('String')).toBe('string');
      expect(mapType('Integer')).toBe('number');
      expect(mapType('Long')).toBe('number');
      expect(mapType('Double')).toBe('number');
      expect(mapType('Boolean')).toBe('boolean');
      expect(mapType('Object')).toBe('Record<string, unknown>');
      expect(mapType('Array<String>')).toBe('string[]');
      expect(mapType('File')).toBe('File | Blob');
    });
  });

  describe('TypeGenerator', () => {
    it('should generate TypeScript interface from parsed data', async () => {
      // Arrange
      const { TypeGenerator } = await import('../generators/type-generator.js');
      const generator = new TypeGenerator();
      const fields = [
        { name: 'appId', required: true, type: 'String', description: '账号ID' },
        { name: 'name', required: true, type: 'String', description: '频道名称' },
        { name: 'categoryId', required: false, type: 'Integer', description: '分类ID' },
      ];

      // Act
      const result = generator.generateInterface('CreateChannelRequest', fields);

      // Assert
      expect(result).toContain('export interface CreateChannelRequest');
      expect(result).toContain('appId: string;');
      expect(result).toContain('name: string;');
      expect(result).toContain('categoryId?: number;');
    });

    it('should handle optional vs required fields', async () => {
      // Arrange
      const { TypeGenerator } = await import('../generators/type-generator.js');
      const generator = new TypeGenerator();
      const fields = [
        { name: 'required', required: true, type: 'String', description: '必填字段' },
        { name: 'optional', required: false, type: 'String', description: '可选字段' },
      ];

      // Act
      const result = generator.generateInterface('TestInterface', fields);

      // Assert
      expect(result).toContain('required: string;');
      expect(result).toContain('optional?: string;');
    });

    it('should handle nested object types', async () => {
      // Arrange - Use the generate method which handles nested types from ParsedApiDoc
      const { TypeGenerator } = await import('../generators/type-generator.js');
      const generator = new TypeGenerator();

      // Simulate a parsed API document with nested params
      const apiDoc = {
        metadata: { title: 'Channel', description: 'Get channel', url: 'http://api.example.com', method: 'GET' },
        requestParams: [],
        responseParams: [
          { name: 'data', required: true, type: 'Object', description: '响应数据' },
        ],
        nestedParams: {
          'ChannelResponseData': [
            { name: 'channelId', required: true, type: 'String', description: '频道号' },
            { name: 'name', required: true, type: 'String', description: '频道名称' },
          ],
        },
        rawContent: '',
      };

      // Act
      const types = generator.generate(apiDoc);

      // Assert - Should generate the nested type
      const nestedType = types.find(t => t.name === 'ChannelResponseData');
      expect(nestedType).toBeDefined();
      expect(nestedType?.content).toContain('export interface ChannelResponseData');
      expect(nestedType?.content).toContain('channelId: string');
    });
  });

  describe('ParseReport', () => {
    it('should generate parse report on failure', async () => {
      // Arrange - Use FileProcessor to create report
      const { FileProcessor } = await import('../processors/file-processor.js');
      const processor = new FileProcessor(
        'docs/api',
        'src/types/generated',
        '_bmad-output/type-generation-report.json'
      );

      // Act - Create report from results
      const results = [
        { file: 'docs/api/account/channels.md', success: true, moduleName: 'account', requestType: 'AccountChannelsRequest', responseType: 'AccountChannelsResponse' },
        { file: 'docs/api/account/invalid.md', success: false, error: 'No tables found in document', moduleName: 'account' },
      ];
      const report = processor.createReport(results as any);

      // Assert
      expect(report.totalFiles).toBe(2);
      expect(report.successCount).toBe(1);
      expect(report.failureCount).toBe(1);
      expect(report.failures).toHaveLength(1);
      expect(report.failures[0].file).toBe('docs/api/account/invalid.md');
      expect(report.failures[0].reason).toBe('No tables found in document');
    });
  });

  describe('FileProcessor', () => {
    it('should process all markdown files in test fixtures directory', async () => {
      // Arrange - use test fixtures directory instead of docs/api
      const { FileProcessor } = await import('../processors/file-processor.js');
      const processor = new FileProcessor('scripts/__tests__/fixtures', 'src/types/generated', '_bmad-output/report.json');

      // Act
      const files = await processor.getApiMarkdownFiles();

      // Assert - fixtures directory has sample-api.md and malformed-api.md
      expect(files.length).toBeGreaterThanOrEqual(2);
      // Should include our sample files
      expect(files.find((f) => f.relativePath.includes('sample-api.md'))).toBeDefined();
      expect(files.find((f) => f.relativePath.includes('malformed-api.md'))).toBeDefined();
    });

    it('should handle empty directory gracefully', async () => {
      // Arrange - use non-existent directory
      const { FileProcessor } = await import('../processors/file-processor.js');
      const processor = new FileProcessor('non-existent-dir', 'src/types/generated', '_bmad-output/report.json');

      // Act
      const files = await processor.getApiMarkdownFiles();

      // Assert
      expect(files.length).toBe(0);
    });
  });
});
