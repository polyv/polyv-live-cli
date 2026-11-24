/**
 * File Processor
 *
 * Discovers and organizes API documentation files for type generation.
 *
 * Story 1.9: implement-type-generator
 */

import { readdir, stat } from 'fs/promises';
import { join, basename, dirname, relative, extname } from 'path';
import { existsSync, readFileSync, mkdirSync, writeFileSync, rmSync } from 'fs';

export interface DiscoveredFile {
  path: string;
  module: string;
  relativePath: string;
}

export interface ParseResult {
  file: string;
  success: boolean;
  error?: string;
  moduleName?: string;
  requestType?: string;
  responseType?: string;
}

export interface ParseReport {
  timestamp: string;
  inputDirectory: string;
  outputDirectory: string;
  totalFiles: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  results: ParseResult[];
  failures: Array<{ file: string; reason: string }>;
}

/**
 * File Processor for API documentation discovery and organization
 */
export class FileProcessor {
  private docsDir: string;
  private outputDir: string;
  private reportPath: string;

  // Files to skip (non-API documentation)
  private static SKIP_PATTERNS = [
    'README.md',
    'CHANGELOG.md',
    '_sidebar.md',
    '_navbar.md',
    'index.md',
    'buildSign.md', // Signature rules, not API
  ];

  constructor(docsDir: string, outputDir: string, reportPath: string) {
    this.docsDir = docsDir;
    this.outputDir = outputDir;
    this.reportPath = reportPath;
  }

  /**
   * Recursively find all markdown files
   */
  private async findMarkdownFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    if (!existsSync(dir)) {
      return files;
    }

    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        const subFiles = await this.findMarkdownFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile() && extname(entry.name) === '.md') {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Get all API Markdown files in the docs directory
   */
  async getApiMarkdownFiles(): Promise<DiscoveredFile[]> {
    const files = await this.findMarkdownFiles(this.docsDir);

    const discovered: DiscoveredFile[] = [];

    for (const file of files) {
      const baseName = basename(file);

      // Skip files matching skip patterns
      if (FileProcessor.SKIP_PATTERNS.includes(baseName)) {
        continue;
      }

      const module = this.getModuleName(file);
      const relativePath = relative(this.docsDir, file);

      discovered.push({
        path: file,
        module,
        relativePath,
      });
    }

    return discovered;
  }

  /**
   * Get module name from file path
   */
  private getModuleName(filePath: string): string {
    const rel = relative(this.docsDir, filePath);
    const parts = rel.split(/[/\\]/);

    // First directory is the module (e.g., 'channel', 'account', 'v4')
    if (parts.length > 1) {
      return parts[0];
    }

    return 'common';
  }

  /**
   * Read file content
   */
  readFile(filePath: string): string {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    return readFileSync(filePath, 'utf-8');
  }

  /**
   * Group discovered files by module
   */
  groupByModule(files: DiscoveredFile[]): Map<string, DiscoveredFile[]> {
    const groups = new Map<string, DiscoveredFile[]>();

    for (const file of files) {
      const module = file.module;
      if (!groups.has(module)) {
        groups.set(module, []);
      }
      groups.get(module)!.push(file);
    }

    return groups;
  }

  /**
   * Ensure output directory exists
   */
  ensureOutputDir(): void {
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Clean output directory
   */
  cleanOutputDir(): void {
    if (existsSync(this.outputDir)) {
      rmSync(this.outputDir, { recursive: true, force: true });
    }
    this.ensureOutputDir();
  }

  /**
   * Write generated type file
   */
  writeTypeFile(moduleName: string, content: string): string {
    const filePath = join(this.outputDir, `${moduleName}.ts`);
    writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }

  /**
   * Write index file
   */
  writeIndexFile(content: string): string {
    const filePath = join(this.outputDir, 'index.ts');
    writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }

  /**
   * Create and save parse report
   */
  createReport(results: ParseResult[]): ParseReport {
    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);

    const report: ParseReport = {
      timestamp: new Date().toISOString(),
      inputDirectory: this.docsDir,
      outputDirectory: this.outputDir,
      totalFiles: results.length,
      successCount: successes.length,
      failureCount: failures.length,
      skippedCount: 0,
      results,
      failures: failures.map((f) => ({
        file: f.file,
        reason: f.error || 'Unknown error',
      })),
    };

    // Save report
    this.saveReport(report);

    return report;
  }

  /**
   * Save report to JSON file
   */
  private saveReport(report: ParseReport): void {
    // Ensure report directory exists
    const reportDir = dirname(this.reportPath);
    if (!existsSync(reportDir)) {
      mkdirSync(reportDir, { recursive: true });
    }

    writeFileSync(this.reportPath, JSON.stringify(report, null, 2), 'utf-8');
  }

  /**
   * Print report summary
   */
  printReportSummary(report: ParseReport): void {
    console.log('\n========================================');
    console.log('Type Generation Report');
    console.log('========================================\n');

    console.log(`Input Directory:  ${report.inputDirectory}`);
    console.log(`Output Directory: ${report.outputDirectory}`);
    console.log(`Timestamp:        ${report.timestamp}\n`);

    console.log('Summary:');
    console.log(`  Total Files:    ${report.totalFiles}`);
    console.log(`  Successful:     ${report.successCount}`);
    console.log(`  Failed:         ${report.failureCount}`);
    console.log(`  Skipped:        ${report.skippedCount}\n`);

    if (report.failures.length > 0) {
      console.log('Failures:');
      for (const failure of report.failures.slice(0, 10)) {
        console.log(`  - ${failure.file}`);
        console.log(`    ${failure.reason}`);
      }
      if (report.failures.length > 10) {
        console.log(`  ... and ${report.failures.length - 10} more failures`);
      }
      console.log(`\nSee full report: ${this.reportPath}\n`);
    }

    console.log('========================================\n');
  }
}

export default FileProcessor;
