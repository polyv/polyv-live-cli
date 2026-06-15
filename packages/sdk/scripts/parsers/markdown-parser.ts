/**
 * Markdown Parser
 *
 * Parses PolyV API Markdown documentation to extract structured data.
 *
 * Story 1.9: implement-type-generator
 */

export interface ParameterInfo {
  name: string;
  required: boolean;
  type: string;
  description: string;
}

export interface ApiMetadata {
  title: string;
  description: string;
  url: string;
  method: string;
}

export interface ParsedApiDoc {
  metadata: ApiMetadata;
  requestParams: ParameterInfo[];
  responseParams: ParameterInfo[];
  nestedParams: Record<string, ParameterInfo[]>;
  rawContent: string;
}

/**
 * Markdown Parser for PolyV API documentation
 */
export class MarkdownParser {
  /**
   * Parse a Markdown API document
   */
  parse(markdown: string): ParsedApiDoc {
    const metadata = this.extractMetadata(markdown);
    const requestParams = this.parseRequestParams(markdown);
    const responseParams = this.parseResponseParams(markdown);
    const nestedParams = this.parseNestedParams(markdown);

    return {
      metadata,
      requestParams,
      responseParams,
      nestedParams,
      rawContent: markdown,
    };
  }

  /**
   * Extract API metadata from markdown
   */
  extractMetadata(markdown: string): ApiMetadata {
    const lines = markdown.split('\n');

    // Extract title (first h1)
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract description (from ### 接口描述 section)
    const description = this.extractSection(markdown, '接口描述');

    // Extract URL (from ### 接口URL section or code block)
    const urlSection = this.extractSection(markdown, '接口URL');
    const urlMatch = urlSection.match(/(?:```)?\s*(https?:\/\/[^\s`]+)\s*(?:```)?/);
    const url = urlMatch ? urlMatch[1].trim() : '';

    // Extract HTTP method (from ### 请求方式 section)
    const methodSection = this.extractSection(markdown, '请求方式');
    const methodMatch = methodSection.match(/(?:```)?\s*(GET|POST|PUT|DELETE|PATCH)\s*(?:```)?/i);
    const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';

    return {
      title,
      description: description.replace(/```/g, '').trim(),
      url,
      method,
    };
  }

  /**
   * Parse request parameters table
   */
  parseRequestParams(markdown: string): ParameterInfo[] {
    // Look for request params section with various Chinese headings
    const patterns = [
      /###\s*请求参数描述\s*\n([\s\S]*?)(?=\n###|\n##|$)/i,
      /###\s*请求参数\s*\n([\s\S]*?)(?=\n###|\n##|$)/i,
      /###\s*参数描述\s*\n([\s\S]*?)(?=\n###|\n##|$)/i,
    ];

    let section = '';
    for (const pattern of patterns) {
      const match = markdown.match(pattern);
      if (match) {
        section = match[1];
        break;
      }
    }

    if (!section) {
      return [];
    }

    return this.parseTable(section, 'request');
  }

  /**
   * Parse response parameters table
   */
  parseResponseParams(markdown: string): ParameterInfo[] {
    // Look for response params section with various Chinese headings
    const patterns = [
      /###\s*响应参数描述\s*\n([\s\S]*?)(?=\n###|\n##|\n<h6|$)/i,
      /###\s*响应参数\s*\n([\s\S]*?)(?=\n###|\n##|\n<h6|$)/i,
      /###\s*返回参数\s*\n([\s\S]*?)(?=\n###|\n##|\n<h6|$)/i,
    ];

    let section = '';
    for (const pattern of patterns) {
      const match = markdown.match(pattern);
      if (match) {
        section = match[1];
        break;
      }
    }

    if (!section) {
      return [];
    }

    return this.parseTable(section, 'response');
  }

  /**
   * Parse nested Data parameter tables (h6 sections)
   */
  parseNestedParams(markdown: string): Record<string, ParameterInfo[]> {
    const nested: Record<string, ParameterInfo[]> = {};

    // Match h6 sections with Data parameter descriptions
    const h6Pattern = /<h6[^>]*>.*?Data.*?参数.*?<\/h6>|###?\s*Data.*?参数.*?\n/gi;

    // Also look for named nested sections like "ChannelInfo参数描述"
    const namedPattern = /<h6[^>]*id="([^"]+)"[^>]*>.*?<\/h6>\n\n\|[\s\S]*?(?=\n\n###|\n\n<h6|$)/gi;
    const namedPattern2 = /###?\s*(\w+)参数描述\s*\n([\s\S]*?)(?=\n###|\n##|$)/gi;

    let match;
    while ((match = namedPattern2.exec(markdown)) !== null) {
      const name = match[1].trim();
      const table = match[2];
      const params = this.parseTable(table, 'response');
      if (params.length > 0) {
        nested[name] = params;
      }
    }

    return nested;
  }

  /**
   * Extract a section by heading name
   */
  private extractSection(markdown: string, heading: string): string {
    // Try to match the section with various heading formats
    const patterns = [
      new RegExp(`###\\s*${heading}\\s*\\n([\\s\\S]*?)(?=\\n###|\\n##|$)`, 'i'),
      new RegExp(`##\\s*${heading}\\s*\\n([\\s\\S]*?)(?=\\n##|$)`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = markdown.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return '';
  }

  /**
   * Parse a Markdown table
   */
  parseTable(tableText: string, tableType: 'request' | 'response' = 'request'): ParameterInfo[] {
    const params: ParameterInfo[] = [];
    const lines = tableText.split('\n').filter((line) => line.trim());

    // Find table rows (lines starting with |)
    const tableLines = lines.filter((line) => line.trim().startsWith('|'));

    if (tableLines.length < 2) {
      return [];
    }

    // Parse header to find column indices
    const header = tableLines[0];
    const headerCells = this.parseTableRow(header);

    // Find column indices
    const colMap = this.getColumnMapping(headerCells, tableType);

    // Skip header and separator rows
    for (let i = 1; i < tableLines.length; i++) {
      const line = tableLines[i].trim();

      // Skip separator rows
      if (line.match(/^\|[\s\-:|]+\|$/)) {
        continue;
      }

      const cells = this.parseTableRow(line);
      if (cells.length < Math.max(colMap.name, colMap.type) + 1) {
        continue;
      }

      const name = (cells[colMap.name] || '').trim();
      const type = (cells[colMap.type] || '').trim();

      // Skip empty or invalid rows
      if (!name || name === '参数名' || name === '参数' || name === '字段') {
        continue;
      }

      const param: ParameterInfo = {
        name,
        required: colMap.required >= 0 ? this.parseRequired(cells[colMap.required] || '') : false,
        type,
        description: colMap.description >= 0 ? (cells[colMap.description] || '').trim() : '',
      };

      params.push(param);
    }

    return params;
  }

  /**
   * Parse a table row
   */
  private parseTableRow(line: string): string[] {
    // Remove leading and trailing pipes
    const trimmed = line.replace(/^\||\|$/g, '');
    // Split by pipe and clean up
    return trimmed.split('|').map((cell) => cell.trim());
  }

  /**
   * Get column mapping based on header and table type
   */
  private getColumnMapping(headers: string[], tableType: 'request' | 'response'): Record<string, number> {
    const map: Record<string, number> = {
      name: -1,
      required: -1,
      type: -1,
      description: -1,
    };

    headers.forEach((header, index) => {
      const h = header.toLowerCase().trim();

      // Name column detection
      if (h.includes('参数名') || h.includes('参数') || h.includes('字段名') || h.includes('字段') || h === 'name') {
        map.name = index;
      }

      // Required column detection (only for request tables)
      if (tableType === 'request') {
        if (h.includes('必选') || h.includes('必填') || h.includes('required') || h === '必填') {
          map.required = index;
        }
      }

      // Type column detection
      if (h.includes('类型') || h.includes('type') || h.includes('类型及说明')) {
        map.type = index;
      }

      // Description column detection
      if (h.includes('说明') || h.includes('描述') || h.includes('desc') || h.includes('description')) {
        map.description = index;
      }
    });

    // Default mappings if not found
    if (map.name === -1) map.name = 0;
    if (map.type === -1) {
      // Try to find type column
      if (headers.length >= 3) {
        map.type = tableType === 'request' ? 2 : 1;
      }
    }
    if (map.description === -1) {
      map.description = headers.length - 1;
    }

    return map;
  }

  /**
   * Parse required field value
   */
  private parseRequired(value: string): boolean {
    const v = value.toLowerCase().trim();
    return v === 'true' || v === 'yes' || v === '是' || v === '必选' || v === '必填' || v === 'y' || v === '1';
  }
}

export default MarkdownParser;
