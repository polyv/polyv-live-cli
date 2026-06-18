/**
 * Type Generator
 *
 * Generates TypeScript type definitions from parsed API documentation.
 *
 * Story 1.9: implement-type-generator
 */

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
   */
  generate(apiDoc: ParsedApiDoc): GeneratedType[] {
    const types: GeneratedType[] = [];
    const baseName = this.getBaseName(apiDoc.metadata.title);

    // Generate request type
    if (apiDoc.requestParams.length > 0) {
      types.push({
        name: generateInterfaceName(baseName, 'Request'),
        content: this.generateInterface(
          generateInterfaceName(baseName, 'Request'),
          apiDoc.requestParams,
          apiDoc.metadata.description
        ),
        description: `Request parameters for ${apiDoc.metadata.title}`,
      });
    }

    // Generate response type
    if (apiDoc.responseParams.length > 0) {
      types.push({
        name: generateInterfaceName(baseName, 'Response'),
        content: this.generateInterface(
          generateInterfaceName(baseName, 'Response'),
          apiDoc.responseParams,
          apiDoc.metadata.description
        ),
        description: `Response data for ${apiDoc.metadata.title}`,
      });
    }

    // Generate nested types
    for (const [nestedName, params] of Object.entries(apiDoc.nestedParams)) {
      if (params.length > 0) {
        types.push({
          name: nestedName,
          content: this.generateInterface(nestedName, params, `${nestedName} nested object`),
          description: `Nested object for ${apiDoc.metadata.title}`,
        });
      }
    }

    return types;
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

    for (const field of fields) {
      const tsType = mapType(field.type);
      const fieldName = toValidIdentifier(field.name);
      const optional = field.required ? '' : '?';

      // Add field comment if description available
      if (field.description) {
        lines.push(`${this.indent}/** ${field.description} */`);
      }

      lines.push(`${this.indent}${fieldName}${optional}: ${tsType};`);
    }

    lines.push('}');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate module content with all types
   */
  generateModuleContent(types: GeneratedType[], moduleName: string): string {
    const header = this.generateFileHeader(moduleName);
    const typeContents = types.map((t) => t.content).join('\n');
    const exports = types.map((t) => t.name).join(',\n  ');

    return `${header}
${typeContents}
`;
  }

  /**
   * Generate index.ts content
   */
  generateIndexContent(modules: string[]): string {
    const header = `/**
 * PolyV SDK Generated Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs by scripts/generate-types.ts
 *
 * Last updated: ${new Date().toISOString()}
 */

`;

    const exports = modules
      .map((m) => `export * from './${m}.js';`)
      .join('\n');

    return header + exports + '\n';
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
 *
 * Last updated: ${new Date().toISOString()}
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
   * Generate index content for all modules
   */
  generateIndexContent(moduleNames: string[]): string {
    const header = `/**
 * PolyV SDK Generated Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from API docs by scripts/generate-types.ts
 *
 * Last updated: ${new Date().toISOString()}
 */

`;

    const exports = moduleNames.map((m) => `export * from './${m}.js';`).join('\n');

    return header + exports + '\n';
  }
}

export default TypeGenerator;
