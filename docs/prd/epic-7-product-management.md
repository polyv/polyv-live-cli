# Product Management Commands - Brownfield Enhancement

## Epic Goal

Add comprehensive product management functionality to the PolyV CLI tool, enabling users to manage channel products (add, list, update, delete) through consistent command-line operations that integrate seamlessly with existing channel and stream management commands.

## Epic Description

**Existing System Context:**

- **Current relevant functionality:** The CLI provides channel management (create, list, get, update, delete) and stream control (get-key, start, stop) with consistent authentication and output patterns
- **Technology stack:** TypeScript/Node.js with Commander.js CLI framework, Axios HTTP client, layered architecture pattern
- **Integration points:** PolyV API service layer (`polyvService.ts`), authentication system (appId/appSecret), output formatter utilities, error handling patterns

**Enhancement Details:**

- **What's being added/changed:** Four new product management commands (`product add`, `product list`, `product update`, `product delete`) following existing channel command patterns
- **How it integrates:** Extends existing service layer, reuses authentication/signature system, follows established command registration patterns in `src/index.ts`  
- **Success criteria:** All product APIs accessible via CLI with table/json output support, proper error handling, and consistent user experience

## Stories

### Story 1: Implement Product List and Get Commands
- Add `product list` command with pagination support (page, size parameters)
- Support existing output formats (table/json) with proper column formatting
- Include filtering and sorting capabilities consistent with channel list patterns

### Story 2: Implement Product Create Command  
- Add `product add` command supporting all product types (normal, finance, position)
- Handle complex parameter validation for price types, link types, and required fields
- Support both CLI parameters and interactive prompts for complex product configurations

### Story 3: Implement Product Update and Delete Commands
- Add `product update` command with selective field updates
- Add `product delete` command with safety confirmation prompts
- Ensure proper validation and error handling for all operations

## API Reference

Based on PolyV API documentation:

### Add Product API
- **URL:** `POST /live/v3/channel/product/add`
- **Key Parameters:** productType (normal/finance/position), name, status, linkType, cover, price fields
- **Complex Features:** Multiple product types with different required fields, multi-platform links, custom pricing

### List Products API  
- **URL:** `GET /live/v3/channel/product/list`
- **Features:** Pagination (page, size), filtering, comprehensive product information

### Update Product API
- **URL:** `POST /live/v3/channel/product/update`
- **Key Parameters:** productId (required), selective field updates

### Delete Product API
- **URL:** `POST /live/v3/channel/product/delete`
- **Parameters:** channelId, productId

## Compatibility Requirements

- ✅ Existing APIs remain unchanged (purely additive)
- ✅ Database schema changes are backward compatible (N/A - no schema changes)
- ✅ UI changes follow existing patterns (consistent CLI command structure)
- ✅ Performance impact is minimal (follows existing service layer patterns)

## Risk Mitigation

- **Primary Risk:** Complex product API parameters may cause configuration errors or inconsistent user experience
- **Mitigation:** Implement comprehensive parameter validation, clear error messages, and interactive prompts for complex configurations following existing channel command patterns
- **Rollback Plan:** Commands can be disabled by removing from command registration in `src/index.ts` without affecting existing functionality

## Implementation Architecture

Following existing patterns:

```
src/
├── commands/
│   ├── channel.ts          (existing)
│   ├── stream.ts           (existing)  
│   └── product.ts          (NEW - product commands)
├── handlers/
│   ├── channelHandler.ts   (existing)
│   ├── streamHandler.ts    (existing)
│   └── productHandler.ts   (NEW - product business logic)
├── services/
│   └── polyvService.ts     (EXTEND - add product API methods)
└── types/
    └── polyv-types.ts      (EXTEND - add product type definitions)
```

## Definition of Done

- ✅ All stories completed with acceptance criteria met
- ✅ Existing functionality verified through testing (no impact on existing commands)
- ✅ Integration points working correctly (authentication, API service, output formatting)
- ✅ Documentation updated appropriately (command help text and usage examples)
- ✅ No regression in existing features (isolated command additions)

## Command Usage Examples

```bash
# List products with pagination
polyv-cli product list --channelId 123456 --page 1 --size 10 --output table

# Add a normal product
polyv-cli product add --channelId 123456 --name "Test Product" --status 1 --linkType 10 --link "https://example.com" --realPrice 99.99

# Update product
polyv-cli product update --channelId 123456 --productId 789 --name "Updated Product" --status 2

# Delete product with confirmation
polyv-cli product delete --channelId 123456 --productId 789
```

## Validation Status

**Scope Validation:** ✅
- Epic can be completed in 3 stories maximum
- No architectural documentation required
- Enhancement follows existing patterns
- Integration complexity is manageable

**Risk Assessment:** ✅  
- Risk to existing system is low
- Rollback plan is feasible
- Testing approach covers existing functionality
- Team has sufficient knowledge of integration points

**Completeness Check:** ✅
- Epic goal is clear and achievable
- Stories are properly scoped
- Success criteria are measurable
- Dependencies are identified

---

*Epic created following brownfield enhancement process for PolyV CLI tool product management functionality.*