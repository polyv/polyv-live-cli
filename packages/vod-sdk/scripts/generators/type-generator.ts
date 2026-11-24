/**
 * Type Generator
 *
 * Generates TypeScript type definitions from parsed API documentation.
 *
 * Story 1.9: implement-type-generator
 */

import { basename, extname } from 'path';

import { mapType, toValidIdentifier, generateInterfaceName } from './type-mapper.js';
import type { ParameterInfo, ParsedApiDoc } from '../parsers/markdown-parser.js';

export interface GeneratedType {
  name: string;
  content: string;
  description: string;
}

/**
 * Type Generator for TypeScript interfaces
 */
export class TypeGenerator {
  private indent = '  ';

  /**
   * Generate all types from a parsed API document
   *
   * @param sourcePath Doc path relative to the docs root. Type names are derived from its file
   *   stem (`search_video.md` -> `SearchVideoRequest`), so they stay stable and do not collide
   *   within a module (the live generator hashes the Chinese title into 4 hex chars, which
   *   collides once a module has many docs; colliding interfaces merge silently in TypeScript).
   */
  generate(apiDoc: ParsedApiDoc, sourcePath?: string): GeneratedType[] {
    const types: GeneratedType[] = [];
    const baseName = sourcePath ? this.stemToPascal(sourcePath) : this.getBaseName(apiDoc.metadata.title);
    const nameFor = (suffix: 'Request' | 'Response'): string =>
      sourcePath ? `${baseName}${suffix}` : generateInterfaceName(baseName, suffix);
    const requestName = nameFor('Request');
    const responseName = nameFor('Response');

    // Generate request type
    if (apiDoc.requestParams.length > 0) {
      types.push({
        name: requestName,
        content: this.generateInterface(
          requestName,
          apiDoc.requestParams,
          apiDoc.metadata.description
        ),
        description: `Request parameters for ${apiDoc.metadata.title}`,
      });
    }

    // Generate response type
    if (apiDoc.responseParams.length > 0) {
      types.push({
        name: responseName,
        content: this.generateInterface(
          responseName,
          apiDoc.responseParams,
          apiDoc.metadata.description
        ),
        description: `Response data for ${apiDoc.metadata.title}`,
      });
    }

    // Generate nested types. Nested names are generic (`data`, `basicInfo`), so with a file
    // stem they are prefixed to keep one interface per doc.
    for (const [nestedName, params] of Object.entries(apiDoc.nestedParams)) {
      if (params.length > 0) {
        const name = sourcePath ? `${baseName}${this.stemToPascal(nestedName)}` : nestedName;
        types.push({
          name,
          content: this.generateInterface(name, params, `${nestedName} nested object`),
          description: `Nested object for ${apiDoc.metadata.title}`,
        });
      }
    }

    return types;
  }

  /** `a/b/some_name.md` -> `SomeName` */
  private stemToPascal(pathLike: string): string {
    const stem = basename(pathLike, extname(pathLike));
    const pascal = stem
      .split(/[^a-zA-Z0-9]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    return /^[0-9]/.test(pascal) ? `_${pascal}` : pascal || 'Api';
  }

  /**
   * Generate a TypeScript interface
   */
  generateInterface(
    name: string,
    fields: ParameterInfo[],
    description?: string,
    options?: { nested?: Record<string, ParameterInfo[]> }
  ): string {
    const lines: string[] = [];

    // Add description as JSDoc comment
    if (description) {
      lines.push('/**');
      lines.push(` * ${description}`);
      lines.push(' */');
    }

    lines.push(`export interface ${name} {`);

    // A doc can list a parameter twice (a struck-through legacy row next to its replacement, or
    // a nested table flattened into the same list); the first mention wins.
    const emitted = new Set<string>();
    for (const field of fields) {
      const tsType = mapType(field.type);
      const fieldName = toValidIdentifier(field.name);
      if (emitted.has(fieldName)) continue;
      emitted.add(fieldName);
      const optional = field.required ? '' : '?';

      // Add field comment if description available
      if (field.description) {
        lines.push(`${this.indent}/** ${field.description} */`);
      }

      lines.push(`${this.indent}${fieldName}${optional}: ${tsType};`);
    }

    lines.push('}');

    return lines.join('\n');
  }

  /**
   * Generate module content with all types
   */
  generateModuleContent(types: GeneratedType[], moduleName: string): string {
    const header = this.generateFileHeader(moduleName);
    const typeContents = types.map((t) => t.content).join('\n');

    return `${header}${typeContents}`.trimEnd() + '\n';
  }

  /**
   * Generate file header comment
   */
  private generateFileHeader(moduleName: string): string {
    return `/**
 * ${moduleName} API Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs module ${moduleName} by scripts/generate-types.ts
 */

`;
  }

  /**
   * Get base name for type generation
   */
  private getBaseName(title: string): string {
    // Clean up the title
    return title
      .replace(/^(创建|删除|更新|查询|获取|设置|添加|移除|修改|批量)/, '')
      .replace(/(接口|API|接口文档)$/, '')
      .replace(/\(.*\)$/, '')
      .trim();
  }

  /**
   * Generate index content for all modules.
   *
   * Each module is exported as its own namespace (`generated.video_management`): two module
   * folders can hold the same doc (`ad` and `vert` do), and a star export would clash.
   */
  generateIndexContent(moduleNames: string[]): string {
    const header = `/**
 * PolyV VOD SDK Generated Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs by scripts/generate-types.ts
 */

`;

    const exports = moduleNames.map((m) => `export * as ${asIdentifier(m)} from './${m}.js';`).join('\n');

    return `${header}${exports}`.trimEnd() + '\n';
  }
}

/** Module folder name usable as an identifier; the docs have a folder called `private`. */
function asIdentifier(name: string): string {
  return RESERVED_WORDS.has(name) ? `_${name}` : name;
}

const RESERVED_WORDS = new Set([
  'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else',
  'enum', 'export', 'extends', 'false', 'finally', 'for', 'function', 'if', 'implements', 'import', 'in',
  'instanceof', 'interface', 'let', 'new', 'null', 'package', 'private', 'protected', 'public', 'return',
  'static', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield'
]);

export default TypeGenerator;
