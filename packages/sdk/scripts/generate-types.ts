#!/usr/bin/env node
/**
 * Type Generator Script
 *
 * Generates TypeScript types from PolyV API documentation.
 * Run with: npm run prebuild
 *
 * Story 1.9: implement-type-generator
 */

import { existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { MarkdownParser } from './parsers/markdown-parser.js';
import { TypeGenerator } from './generators/type-generator.js';
import { FileProcessor, type DiscoveredFile, type ParseResult } from './processors/file-processor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const PACKAGE_ROOT = join(__dirname, '..');
const REPO_ROOT = join(PACKAGE_ROOT, '../..');
// Default API docs path is relative to the repository root, not packages/sdk.
const DEFAULT_API_DOCS_DIR = resolve(REPO_ROOT, '../document-center/docs/live/api');
const LEGACY_API_DOCS_DIR = resolve(REPO_ROOT, 'docs/api');
const DOCS_DIR = resolveApiDocsDir();
const OUTPUT_DIR = resolveGeneratedTypesDir();
const REPORT_PATH = resolveTypeGenerationReportPath();

function resolveApiDocsDir(): string {
  const configuredDocsDir = process.env['POLYV_API_DOCS_DIR'];
  if (configuredDocsDir) {
    return resolve(configuredDocsDir);
  }

  if (existsSync(DEFAULT_API_DOCS_DIR)) {
    return DEFAULT_API_DOCS_DIR;
  }

  return LEGACY_API_DOCS_DIR;
}

function resolveGeneratedTypesDir(): string {
  const configuredOutputDir = process.env['POLYV_GENERATED_TYPES_DIR'];
  if (configuredOutputDir) {
    return resolve(configuredOutputDir);
  }

  return join(PACKAGE_ROOT, 'src/types/generated');
}

function resolveTypeGenerationReportPath(): string {
  const configuredReportPath = process.env['POLYV_TYPE_GENERATION_REPORT_PATH'];
  if (configuredReportPath) {
    return resolve(configuredReportPath);
  }

  return join(PACKAGE_ROOT, '_bmad-output/type-generation-report.json');
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  console.log('🚀 Starting PolyV API Type Generator...\n');

  const parser = new MarkdownParser();
  const generator = new TypeGenerator();
  const processor = new FileProcessor(DOCS_DIR, OUTPUT_DIR, REPORT_PATH);

  try {
    // Discover API documentation files
    console.log(`📂 Scanning API docs from: ${DOCS_DIR}`);
    const files = await processor.getApiMarkdownFiles();
    console.log(`   Found ${files.length} API documentation files\n`);

    if (files.length === 0) {
      console.log('⚠️  No API documentation files found. Exiting.');
      process.exit(0);
    }

    // Group by module
    const moduleGroups = processor.groupByModule(files);
    console.log(`📦 Organized into ${moduleGroups.size} modules:\n`);

    for (const [module, moduleFiles] of moduleGroups) {
      console.log(`   ${module}: ${moduleFiles.length} files`);
    }
    console.log('');

    // Clean and prepare output directory
    processor.cleanOutputDir();
    console.log(`📁 Created output directory: ${OUTPUT_DIR}\n`);

    // Process each module
    const allResults: ParseResult[] = [];
    const moduleNames: string[] = [];

    for (const [module, moduleFiles] of moduleGroups) {
      console.log(`\n📝 Processing module: ${module}`);
      console.log('   ' + '-'.repeat(40));

      const moduleResults = await processModule(
        module,
        moduleFiles,
        parser,
        generator,
        processor
      );

      allResults.push(...moduleResults);

      if (existsSync(join(OUTPUT_DIR, `${module}.ts`))) {
        moduleNames.push(module);
      }
    }

    // Generate index file
    console.log('\n📄 Generating index.ts...');
    const indexContent = generator.generateIndexContent(moduleNames);
    processor.writeIndexFile(indexContent);
    console.log('   Created: src/types/generated/index.ts\n');

    // Generate and save report
    const report = processor.createReport(allResults);
    processor.printReportSummary(report);

    // Exit with appropriate code
    if (report.failureCount > 0) {
      console.log('⚠️  Type generation completed with some failures.');
      console.log(`   See report: ${REPORT_PATH}\n`);
    } else {
      console.log('✅ Type generation completed successfully!\n');
    }

    // Always exit 0 to not block the build
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error during type generation:');
    console.error(error);

    // Still exit 0 to not block the build
    process.exit(0);
  }
}

/**
 * Process a single module
 */
async function processModule(
  moduleName: string,
  files: DiscoveredFile[],
  parser: MarkdownParser,
  generator: TypeGenerator,
  processor: FileProcessor
): Promise<ParseResult[]> {
  const results: ParseResult[] = [];
  const moduleTypes: Array<{ name: string; content: string; description: string }> = [];

  for (const file of files) {
    try {
      // Read and parse the file
      const content = processor.readFile(file.path);
      const apiDoc = parser.parse(content);

      // Generate types
      const types = generator.generate(apiDoc);

      if (types.length > 0) {
        moduleTypes.push(...types);

        results.push({
          file: file.relativePath,
          success: true,
          moduleName,
          requestType: types.find((t) => t.name.endsWith('Request'))?.name,
          responseType: types.find((t) => t.name.endsWith('Response'))?.name,
        });

        console.log(`   ✅ ${file.relativePath} (${types.length} types)`);
      } else {
        // No types generated - might be a non-API document
        results.push({
          file: file.relativePath,
          success: true,
          moduleName,
        });

        console.log(`   ⏭️  ${file.relativePath} (no parameters found)`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.push({
        file: file.relativePath,
        success: false,
        error: errorMessage,
        moduleName,
      });

      console.log(`   ❌ ${file.relativePath}: ${errorMessage}`);
    }
  }

  // Write module type file if we have types
  if (moduleTypes.length > 0) {
    const moduleContent = generator.generateModuleContent(moduleTypes, moduleName);
    processor.writeTypeFile(moduleName, moduleContent);
    console.log(`   📄 Created: ${moduleName}.ts`);
  }

  return results;
}

// Run the script
main().catch(console.error);
