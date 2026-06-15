/**
 * @fileoverview Product command definitions for CLI
 * @author Development Team
 * @since 7.1.0
 */

import { Command } from 'commander';
import { ProductHandler, ProductListOptions } from '../handlers/product.handler';
import { ProductServiceConfig, ProductAddOptions, ProductUpdateOptions, ProductDeleteOptions } from '../types/product';
import { configManager } from '../config/manager';
import { authAdapter } from '../config/auth-adapter';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';

/**
 * Load and prepare authentication and service configuration
 */
async function loadAuthAndServiceConfig(parentOptions: any): Promise<{
  authConfig: any;
  serviceConfig: ProductServiceConfig;
  isVerbose: boolean;
  authSource?: string;
  accountName?: string;
}> {
  // Get authentication using new priority system first
  const authResult = authAdapter.tryGetAuthConfig(parentOptions);
  if (!authResult) {
    // Throw error with authentication guidance
    throw new Error(authAdapter.getStatusMessage(parentOptions));
  }

  // Load app configuration for service settings (try-catch to handle missing auth in old config)
  let configResult;
  try {
    configResult = await configManager.load({
      cliOptions: parentOptions,
    });
  } catch (error) {
    // If config loading fails due to auth, use defaults for service config
    if (error instanceof Error && error.message.includes('Auth configuration is incomplete')) {
      configResult = {
        config: {
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false
        }
      };
    } else {
      throw error;
    }
  }

  // Create service configuration
  const serviceConfig: ProductServiceConfig = {
    baseUrl: configResult.config.baseUrl,
    timeout: configResult.config.timeout,
    debug: configResult.config.debug
  };

  // Display authentication source information if verbose
  const isVerbose = !!parentOptions.verbose;
  if (isVerbose) {
    console.log(`🔐 Authentication Source: ${authResult.source}`);
    if (authResult.accountName) {
      console.log(`👤 Account: ${authResult.accountName}`);
    }
    console.log(''); // Empty line for spacing
  }

  const result: {
    authConfig: AuthConfig;
    serviceConfig: ProductServiceConfig;
    isVerbose: boolean;
    authSource?: string;
    accountName?: string;
  } = {
    authConfig: authResult.config,
    serviceConfig,
    isVerbose,
  };

  if (authResult.source) {
    result.authSource = authResult.source;
  }

  if (authResult.accountName) {
    result.accountName = authResult.accountName;
  }

  return result;
}

/**
 * Parse integer string to number with validation
 * @param value String value to parse
 * @returns Parsed integer
 * @throws Error if value is not a valid integer
 */
export function parseInteger(value: string): number {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`"${value}" is not a valid integer`);
  }
  return parsed;
}

/**
 * Validate page size limit
 * @param value String value to validate
 * @returns Parsed and validated limit
 * @throws Error if value is out of range
 */
export function validateSize(value: string): number {
  const parsed = parseInteger(value);
  if (parsed < 1 || parsed > 100) {
    throw new Error('Size must be between 1 and 100');
  }
  return parsed;
}

/**
 * Validate output format
 * @param value Output format string
 * @returns Validated output format
 * @throws Error if format is invalid
 */
export function validateOutputFormat(value: string): 'table' | 'json' {
  if (!['table', 'json'].includes(value)) {
    throw new Error('Output format must be either "table" or "json"');
  }
  return value as 'table' | 'json';
}

/**
 * Validate product type
 * @param value Product type string
 * @returns Validated product type
 * @throws Error if type is invalid
 */
export function validateProductType(value: string): 'normal' | 'finance' | 'position' {
  const validTypes = ['normal', 'finance', 'position'];
  if (!validTypes.includes(value)) {
    throw new Error('Product type must be one of: normal, finance, position');
  }
  return value as 'normal' | 'finance' | 'position';
}

/**
 * Validate product status
 * @param value Status string
 * @returns Validated status number
 * @throws Error if status is invalid
 */
export function validateProductStatus(value: string): 1 | 2 {
  const parsed = parseInt(value, 10);
  if (parsed !== 1 && parsed !== 2) {
    throw new Error('Product status must be 1 (上架) or 2 (下架)');
  }
  return parsed as 1 | 2;
}

/**
 * Validate link type
 * @param value Link type string
 * @returns Validated link type number
 * @throws Error if link type is invalid
 */
export function validateLinkType(value: string): 10 | 11 {
  const parsed = parseInt(value, 10);
  if (parsed !== 10 && parsed !== 11) {
    throw new Error('Link type must be 10 (通用链接) or 11 (多平台链接)');
  }
  return parsed as 10 | 11;
}

/**
 * Validate price value
 * @param value Price string to validate
 * @returns Validated price number
 * @throws Error if price is invalid
 */
export function validatePrice(value: string): number {
  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    throw new Error(`"${value}" is not a valid price`);
  }
  if (parsed < 0) {
    throw new Error('Price cannot be negative');
  }
  return parsed;
}

/**
 * Registers product-related commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerProductCommands(program: Command): void {
  // Create product command group
  const productCmd = program.command('product');
  productCmd.description('Manage live streaming channel products');

  // Product list command
  const listCmd = productCmd
    .command('list')
    .description('List products with pagination')
    .option('-c, --channel-id <channelId>', 'channel ID (required unless --platform is specified)')
    .option('--platform', 'list platform products (user-level product library) instead of channel products')
    .option('-P, --page <number>', 'page number (optional, minimum 1, default 1)', parseInteger, 1)
    .option('-s, --size <number>', 'items per page (optional, 1-100, default 20)', validateSize, 20)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Validate: channelId is required unless --platform is specified
        if (!options.platform && !options.channelId) {
          console.error('Error: --channel-id is required unless --platform is specified');
          process.exit(1);
        }

        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create product handler instance
        const productHandler = new ProductHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const listOptions: ProductListOptions = {
          page: options.page,
          size: options.size,
          channelId: options.channelId,
          platform: options.platform,
          output: options.output
        };

        // Execute product listing
        await productHandler.listProducts(listOptions);

      } catch (error) {
        // Enhanced error handling with authentication context
        if (error instanceof Error && error.message.includes('Authentication')) {
          // Add authentication diagnostics for auth-related errors
          const diagnostics = authAdapter.getDiagnostics(program.opts());
          console.error('\n🔍 Authentication Diagnostics:');
          diagnostics.availableSources.forEach(source => {
            const status = source.appId && source.appSecret ? '✅' : '❌';
            console.error(`  ${status} ${source.metadata.source}: ${source.type}`);
          });
          if (diagnostics.errors.length > 0) {
            console.error('\n❌ Errors:');
            diagnostics.errors.forEach(error => console.error(`  - ${error}`));
          }
        }
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for product list command
  listCmd.addHelpText('after', `
Examples:
  # List channel products (requires channel ID)
  $ polyv-live-cli product list -c "3151318"
  $ polyv-live-cli product list -c "3151318" -P 2 -s 10
  $ polyv-live-cli product list -c "3151318" -o json

  # List platform products (user-level product library)
  $ polyv-live-cli product list --platform
  $ polyv-live-cli product list --platform -P 2 -s 10

Alternative (full parameter names):
  $ polyv-live-cli product list --channel-id "3151318" --page 2 --size 10 --output json
  $ polyv-live-cli product list --platform --page 2 --size 10

Modes:
  --channel-id, -c   List products for a specific channel (V3 API, includes channelId in response)
  --platform         List platform products from user-level product library (V4 API, no channelId)

Pagination:
  --page, -P      Page number (minimum 1, default 1)
  --size, -s      Items per page (1-100, default 20)

Output Formats:
  table       - Formatted table output (default)
  json        - JSON format for programmatic use

Notes:
  - Use --channel-id for channel-specific products
  - Use --platform for platform-level product library
  - Channel products include channelId in the response
  - All product prices are shown in Chinese Yuan (¥)
`);

  // ========================================
  // product add - 添加商品 (Story 8-2)
  // ========================================
  const addCmd = productCmd
    .command('add')
    .description('Add a new product to channel')
    .requiredOption('-c, --channel-id <channelId>', 'channel ID')
    .requiredOption('-n, --name <name>', 'product name')
    .requiredOption('--status <status>', 'product status: 1 (on-shelf) | 2 (off-shelf)', validateProductStatus)
    .requiredOption('--link-type <type>', 'link type: 10 (universal) | 11 (multi-platform)', validateLinkType)
    .option('-t, --product-type <type>', 'product type: normal | finance | position (default: normal)', validateProductType, 'normal')
    .option('--cover <url>', 'product cover URL')
    .option('-l, --link <url>', 'universal link (required when link-type=10)')
    .option('--pc-link <url>', 'PC link')
    .option('--mobile-link <url>', 'mobile web link')
    .option('--wx-miniprogram-link <url>', 'WeChat miniprogram link')
    .option('--wx-miniprogram-original-id <id>', 'WeChat miniprogram original ID')
    .option('--mobile-app-link <url>', 'mobile app link')
    .option('--android-link <url>', 'Android native link')
    .option('--ios-link <url>', 'iOS native link')
    .option('--params <json>', 'custom params as JSON string')
    .option('--product-desc <desc>', 'product description')
    .option('--features <json>', 'features/tags as JSON array string')
    .option('--btn-show <text>', 'button text')
    .option('--yield <value>', 'yield/rate for finance products')
    .option('--price-type <type>', 'price type: AMOUNT | CUSTOM')
    .option('--real-price <amount>', 'real price amount', validatePrice)
    .option('--custom-price <text>', 'custom price text')
    .option('--original-price-type <type>', 'original price type: AMOUNT | CUSTOM')
    .option('--price <amount>', 'original price amount', validatePrice)
    .option('--custom-original-price <text>', 'custom original price text')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const productHandler = new ProductHandler(authConfig, serviceConfig);

        const addOptions: ProductAddOptions = {
          channelId: options.channelId,
          name: options.name,
          status: options.status,
          linkType: options.linkType,
          productType: options.productType,
          cover: options.cover,
          link: options.link,
          pcLink: options.pcLink,
          mobileLink: options.mobileLink,
          wxMiniprogramLink: options.wxMiniprogramLink,
          wxMiniprogramOriginalId: options.wxMiniprogramOriginalId,
          mobileAppLink: options.mobileAppLink,
          androidLink: options.androidLink,
          iosLink: options.iosLink,
          params: options.params,
          productDesc: options.productDesc,
          features: options.features,
          btnShow: options.btnShow,
          yield: options.yield,
          priceType: options.priceType,
          realPrice: options.realPrice,
          customPrice: options.customPrice,
          originalPriceType: options.originalPriceType,
          price: options.price,
          customOrignalPrice: options.customOriginalPrice,
          output: options.output
        };

        await productHandler.addProduct(addOptions);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  addCmd.addHelpText('after', `
Examples:
  # Add a normal product
  $ polyv-live-cli product add -c "3151318" -n "测试商品" --status 1 --link-type 10 \\
      -l "https://example.com/product" --cover "https://example.com/cover.jpg" \\
      --real-price 99.9 --price 199.9

  # Add a finance product
  $ polyv-live-cli product add -c "3151318" -n "理财产品" --status 1 --link-type 10 \\
      -l "https://example.com/finance" --yield "5.5%" -t finance

Product Types:
  normal    - Regular product (default)
  finance   - Financial product
  position  - Job position

Status Values:
  1  - On shelf (上架)
  2  - Off shelf (下架)

Link Types:
  10  - Universal link (requires --link)
  11  - Multi-platform link (use --pc-link, --mobile-link, etc.)

Price Types:
  AMOUNT  - Numeric price (use --real-price, --price)
  CUSTOM  - Custom text price (use --custom-price)
`);

  // ========================================
  // product update - 更新商品 (Story 8-2)
  // AC#2: 支持选择性字段更新
  // ========================================
  const updateCmd = productCmd
    .command('update')
    .description('Update an existing product')
    .requiredOption('-c, --channel-id <channelId>', 'channel ID')
    .requiredOption('-p, --product-id <productId>', 'product ID', parseInteger)
    .option('-n, --name <name>', 'product name')
    .option('--status <status>', 'product status: 1 | 2', validateProductStatus)
    .option('--link-type <type>', 'link type: 10 | 11', validateLinkType)
    .option('-t, --product-type <type>', 'product type: normal | finance | position', validateProductType)
    .option('--cover <url>', 'product cover URL')
    .option('-l, --link <url>', 'universal link')
    .option('--pc-link <url>', 'PC link')
    .option('--mobile-link <url>', 'mobile web link')
    .option('--wx-miniprogram-link <url>', 'WeChat miniprogram link')
    .option('--wx-miniprogram-original-id <id>', 'WeChat miniprogram original ID')
    .option('--mobile-app-link <url>', 'mobile app link')
    .option('--android-link <url>', 'Android native link')
    .option('--ios-link <url>', 'iOS native link')
    .option('--params <json>', 'custom params as JSON string')
    .option('--product-desc <desc>', 'product description')
    .option('--features <json>', 'features/tags as JSON array string')
    .option('--btn-show <text>', 'button text')
    .option('--yield <value>', 'yield/rate for finance products')
    .option('--price-type <type>', 'price type: AMOUNT | CUSTOM')
    .option('--real-price <amount>', 'real price amount', validatePrice)
    .option('--custom-price <text>', 'custom price text')
    .option('--original-price-type <type>', 'original price type: AMOUNT | CUSTOM')
    .option('--price <amount>', 'original price amount', validatePrice)
    .option('--custom-original-price <text>', 'custom original price text')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const productHandler = new ProductHandler(authConfig, serviceConfig);

        const updateOptions: ProductUpdateOptions = {
          channelId: options.channelId,
          productId: options.productId,
          name: options.name,
          status: options.status,
          linkType: options.linkType,
          cover: options.cover,
          link: options.link,
          pcLink: options.pcLink,
          mobileLink: options.mobileLink,
          wxMiniprogramLink: options.wxMiniprogramLink,
          wxMiniprogramOriginalId: options.wxMiniprogramOriginalId,
          mobileAppLink: options.mobileAppLink,
          androidLink: options.androidLink,
          iosLink: options.iosLink,
          params: options.params,
          productDesc: options.productDesc,
          features: options.features,
          btnShow: options.btnShow,
          yield: options.yield,
          priceType: options.priceType,
          realPrice: options.realPrice,
          customPrice: options.customPrice,
          originalPriceType: options.originalPriceType,
          price: options.price,
          customOrignalPrice: options.customOriginalPrice,
          output: options.output
        };

        await productHandler.updateProduct(updateOptions);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  updateCmd.addHelpText('after', `
Examples:
  # Update product name
  $ polyv-live-cli product update -c "3151318" -p 12345 -n "新商品名" --status 1 --link-type 10

  # Change product status to off-shelf
  $ polyv-live-cli product update -c "3151318" -p 12345 -n "商品名" --status 2 --link-type 10
`);

  // ========================================
  // product delete - 删除商品 (Story 8-2)
  // ========================================
  const deleteCmd = productCmd
    .command('delete')
    .description('Delete a product from channel')
    .requiredOption('-c, --channel-id <channelId>', 'channel ID')
    .requiredOption('-p, --product-id <productId>', 'product ID', parseInteger)
    .option('-f, --force', 'force delete without confirmation')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const productHandler = new ProductHandler(authConfig, serviceConfig);

        const deleteOptions: ProductDeleteOptions = {
          channelId: options.channelId,
          productId: options.productId,
          force: options.force || false,
          output: options.output
        };

        await productHandler.deleteProduct(deleteOptions);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  deleteCmd.addHelpText('after', `
Examples:
  # Delete with confirmation
  $ polyv-live-cli product delete -c "3151318" -p 12345

  # Force delete without confirmation
  $ polyv-live-cli product delete -c "3151318" -p 12345 --force

Note:
  Deletion is permanent and cannot be undone.
  Use --force to skip the confirmation prompt.
`);
}
