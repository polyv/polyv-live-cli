/**
 * @fileoverview Product command definitions for CLI
 * @author Development Team
 * @since 7.1.0
 */

import { Command } from 'commander';
import { ProductHandler, ProductListOptions } from '../handlers/product.handler';
import {
  ProductServiceConfig,
  ProductAddOptions,
  ProductUpdateOptions,
  ProductDeleteOptions,
  ProductLibraryCreateOptions,
  ProductLibraryUpdateOptions
} from '../types/product';
import { configManager } from '../config/manager';
import { authAdapter } from '../config/auth-adapter';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';
import { parseJsonArray, parseNumberList } from '../utils/api-command';

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

export function validateProductSortType(value: string): 10 | 20 | 50 {
  const parsed = parseInt(value, 10);
  if (parsed !== 10 && parsed !== 20 && parsed !== 50) {
    throw new Error('Product sort type must be 10 (up), 20 (down), or 50 (rank)');
  }
  return parsed as 10 | 20 | 50;
}

export function validatePushCardType(value: string): 'smallCard' | 'bigCard' {
  if (value !== 'smallCard' && value !== 'bigCard') {
    throw new Error('Push card type must be smallCard or bigCard');
  }
  return value;
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
 * Validate user-level product link type
 */
export function validateUserProductLinkType(value: string): 10 | 11 | 12 {
  const parsed = parseInt(value, 10);
  if (parsed !== 10 && parsed !== 11 && parsed !== 12) {
    throw new Error('Link type must be 10 (通用链接), 11 (多平台链接), or 12 (原生方法)');
  }
  return parsed as 10 | 11 | 12;
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

function withProductHandler(program: Command, run: (handler: ProductHandler) => Promise<void>): Promise<void> {
  return (async () => {
    try {
      const parentOptions = program.opts();
      const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);
      await run(new ProductHandler(authConfig, serviceConfig));
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  })();
}

function addPaging(command: Command): Command {
  return command
    .option('-P, --page <number>', 'page number', parseInteger, 1)
    .option('-s, --size <number>', 'items per page', validateSize, 20)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table');
}

function addUserProductOptions<T extends Command>(command: T, update = false): T {
  if (update) {
    command.requiredOption('-p, --product-id <productId>', 'user product ID');
  }
  command
    .requiredOption('-n, --name <name>', 'product name')
    .requiredOption('--link-type <type>', 'link type: 10 | 11 | 12', validateUserProductLinkType)
    .requiredOption('-l, --link <url>', 'product link')
    .option('-t, --product-type <type>', 'product type: normal | finance | position', validateProductType)
    .option('--cover <url>', 'product cover URL')
    .option('--pc-link <url>', 'PC link')
    .option('--mobile-link <url>', 'mobile web link')
    .option('--wx-miniprogram-link <url>', 'WeChat miniprogram link')
    .option('--wx-miniprogram-original-id <id>', 'WeChat miniprogram original ID')
    .option('--mobile-app-link <url>', 'mobile app link')
    .option('--android-link <url>', 'Android native link')
    .option('--ios-link <url>', 'iOS native link')
    .option('--other-link <url>', 'other platform link')
    .option('--features <json>', 'features/tags as JSON array string')
    .option('--tag-ids <ids>', 'comma-separated product tag IDs')
    .option('--btn-show <text>', 'button text')
    .option('--product-desc <desc>', 'product description')
    .option('--product-detail <detail>', 'product detail')
    .option('--ext <json>', 'extended product info JSON string')
    .option('--price-type <type>', 'price type: AMOUNT | CUSTOM')
    .option('--real-price <amount>', 'real price amount', validatePrice)
    .option('--custom-price <text>', 'custom price text')
    .option('--original-price-type <type>', 'original price type: AMOUNT | CUSTOM')
    .option('--price <amount>', 'original price amount', validatePrice)
    .option('--custom-original-price <text>', 'custom original price text')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table');
  return command;
}

function toUserProductOptions(options: any): ProductLibraryCreateOptions | ProductLibraryUpdateOptions {
  return {
    ...(options.productId ? { productId: options.productId } : {}),
    name: options.name,
    linkType: options.linkType,
    link: options.link,
    productType: options.productType,
    cover: options.cover,
    pcLink: options.pcLink,
    mobileLink: options.mobileLink,
    wxMiniprogramLink: options.wxMiniprogramLink,
    wxMiniprogramOriginalId: options.wxMiniprogramOriginalId,
    mobileAppLink: options.mobileAppLink,
    androidLink: options.androidLink,
    iosLink: options.iosLink,
    otherLink: options.otherLink,
    features: options.features,
    tagIds: options.tagIds,
    btnShow: options.btnShow,
    productDesc: options.productDesc,
    productDetail: options.productDetail,
    ext: options.ext,
    priceType: options.priceType,
    realPrice: options.realPrice,
    customPrice: options.customPrice,
    originalPriceType: options.originalPriceType,
    price: options.price,
    customOrignalPrice: options.customOriginalPrice,
    force: options.force,
    output: options.output,
  };
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

  productCmd.command('enabled')
    .description('Get channel product library enabled status')
    .requiredOption('-c, --channel-id <channelId>', 'channel ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withProductHandler(program, handler => handler.getChannelProductEnabled(options)));

  productCmd.command('batch-add')
    .description('Batch add products to a channel')
    .requiredOption('-c, --channel-id <channelId>', 'channel ID')
    .requiredOption('--products-json <json>', 'products JSON array', parseJsonArray)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withProductHandler(program, handler => handler.batchAddChannelProducts({
      ...options,
      products: options.productsJson
    })));

  productCmd.command('batch-delete')
    .description('Batch delete channel products')
    .requiredOption('-c, --channel-id <channelId>', 'channel ID')
    .requiredOption('--product-ids <ids>', 'product IDs, comma-separated', parseNumberList)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withProductHandler(program, handler => handler.batchDeleteChannelProducts(options)));

  productCmd.command('batch-shelf')
    .description('Batch update channel product shelf status')
    .requiredOption('-c, --channel-id <channelId>', 'channel ID')
    .requiredOption('--product-ids <ids>', 'product IDs, comma-separated', parseNumberList)
    .requiredOption('--shelf <status>', 'shelf status: 1 (on shelf) | 2 (off shelf)', validateProductStatus)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withProductHandler(program, handler => handler.batchShelfChannelProducts(options)));

  productCmd.command('shelf')
    .description('Update one channel product shelf status')
    .requiredOption('-c, --channel-id <channelId>', 'channel ID')
    .requiredOption('-p, --product-id <productId>', 'product ID', parseInteger)
    .requiredOption('--shelf <status>', 'shelf status: 1 (on shelf) | 2 (off shelf)', validateProductStatus)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withProductHandler(program, handler => handler.shelfChannelProduct(options)));

  productCmd.command('sort')
    .description('Sort a channel product')
    .requiredOption('-c, --channel-id <channelId>', 'channel ID')
    .requiredOption('-p, --product-id <productId>', 'product ID', parseInteger)
    .requiredOption('--type <type>', '10 up, 20 down, 50 explicit rank', validateProductSortType)
    .option('--sort <rank>', 'target rank when type=50', parseInteger)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withProductHandler(program, handler => handler.sortChannelProduct(options)));

  productCmd.command('push')
    .description('Push a channel product to viewers')
    .requiredOption('-c, --channel-id <channelId>', 'channel ID')
    .requiredOption('-p, --product-id <productId>', 'product ID', parseInteger)
    .option('--push-card-type <type>', 'push card type: smallCard | bigCard', validatePushCardType)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withProductHandler(program, handler => handler.pushChannelProduct(options)));

  productCmd.command('cancel-push')
    .description('Cancel a pushed channel product')
    .requiredOption('-c, --channel-id <channelId>', 'channel ID')
    .requiredOption('-p, --product-id <productId>', 'product ID', parseInteger)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withProductHandler(program, handler => handler.cancelPushChannelProduct(options)));

  productCmd.command('reference')
    .description('Reference a platform product into a channel product library')
    .requiredOption('-c, --channel-id <channelId>', 'channel ID')
    .requiredOption('--origin-id <id>', 'platform product origin ID')
    .requiredOption('--status <status>', 'shelf status: 1 (on shelf) | 2 (off shelf)', validateProductStatus)
    .option('--with-tags', 'sync platform tags')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withProductHandler(program, handler => handler.referenceProduct(options)));

  // ========================================
  // product library - user-level product library
  // ========================================
  const libraryCmd = productCmd.command('library').description('Manage user-level product library');

  addPaging(libraryCmd.command('list').description('List user-level product library'))
    .option('-k, --keyword <keyword>', 'keyword search')
    .option('-t, --product-type <type>', 'product type filter')
    .action((options) => withProductHandler(program, handler => handler.listUserProducts({
      page: options.page,
      size: options.size,
      keyword: options.keyword,
      productType: options.productType,
      output: options.output,
    })));

  addUserProductOptions(libraryCmd.command('create').description('Create a user-level product'))
    .action((options) => withProductHandler(program, handler => handler.createUserProduct(
      toUserProductOptions(options) as ProductLibraryCreateOptions
    )));

  addUserProductOptions(libraryCmd.command('update').description('Update a user-level product'), true)
    .action((options) => withProductHandler(program, handler => handler.updateUserProduct(
      toUserProductOptions(options) as ProductLibraryUpdateOptions
    )));

  libraryCmd.command('delete')
    .description('Delete a user-level product')
    .requiredOption('-p, --product-id <productId>', 'user product ID')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withProductHandler(program, handler => handler.deleteUserProduct({
      productId: options.productId,
      force: options.force,
      output: options.output,
    })));

  // ========================================
  // product tag - user-level product tags
  // ========================================
  const tagCmd = productCmd.command('tag').description('Manage user-level product tags');

  addPaging(tagCmd.command('list').description('List user-level product tags'))
    .requiredOption('-c, --channel-id <channelId>', 'channel ID')
    .option('-k, --keyword <keyword>', 'keyword search')
    .action((options) => withProductHandler(program, handler => handler.listProductTags({
      channelId: options.channelId,
      page: options.page,
      size: options.size,
      keyword: options.keyword,
      output: options.output,
    })));

  tagCmd.command('create')
    .description('Create a user-level product tag')
    .requiredOption('-n, --name <name>', 'tag name')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withProductHandler(program, handler => handler.createProductTag({
      name: options.name,
      force: options.force,
      output: options.output,
    })));

  tagCmd.command('update')
    .description('Update a user-level product tag')
    .requiredOption('--id <id>', 'tag ID', parseInteger)
    .requiredOption('-n, --name <name>', 'tag name')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withProductHandler(program, handler => handler.updateProductTag({
      id: options.id,
      name: options.name,
      force: options.force,
      output: options.output,
    })));

  tagCmd.command('delete')
    .description('Delete a user-level product tag')
    .requiredOption('--id <id>', 'tag ID', parseInteger)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withProductHandler(program, handler => handler.deleteProductTag({
      id: options.id,
      force: options.force,
      output: options.output,
    })));

  // ========================================
  // product order - user-level product orders
  // ========================================
  const orderCmd = productCmd.command('order').description('Manage user-level product orders');

  addPaging(orderCmd.command('list').description('List user-level product orders'))
    .action((options) => withProductHandler(program, handler => handler.listProductOrders({
      page: options.page,
      size: options.size,
      output: options.output,
    })));

  orderCmd.command('get')
    .description('Get a user-level product order')
    .requiredOption('--order-no <orderNo>', 'order number')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withProductHandler(program, handler => handler.getProductOrder({
      orderNo: options.orderNo,
      output: options.output,
    })));

  orderCmd.command('batch-status')
    .description('Batch update user-level product order status')
    .requiredOption('--order-nos <orderNos>', 'comma-separated order numbers')
    .requiredOption('--status <status>', 'new order status')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withProductHandler(program, handler => handler.batchUpdateProductOrderStatus({
      orderNos: options.orderNos,
      status: options.status,
      force: options.force,
      output: options.output,
    })));
}
