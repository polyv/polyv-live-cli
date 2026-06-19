/**
 * V4 User Service
 *
 * Service for managing PolyV V4 User operations.
 * Provides methods for sub-accounts, organizations, viewer records, products, labels, and more.
 *
 * @module services/v4/user
 */

import type { PolyVClient } from '../../client.js';
import type {
  // AC1: Sub-account types
  CreateChildAccountParams,
  ChildAccount,
  ListChildAccountsParams,
  ListChildAccountsResponse,
  GetChildAccountParams,
  UpdateChildAccountParams,
  DeleteChildAccountsParams,
  ChildAccountRole,
  GetBySaleParams,
  // AC2: Organization types
  ListOrganizationsResponse,
  CreateOrganizationParams,
  CreateOrganizationResponse,
  DeleteOrganizationParams,
  // AC3: Viewer Record types
  ListViewerRecordsParams,
  ListViewerRecordsResponse,
  GetViewerRecordParams,
  ViewerRecord,
  CreateViewerRecordParams,
  UpdateViewerRecordParams,
  DeleteViewerRecordParams,
  DirectAuthViewerParams,
  ImportExternalViewerParams,
  ImportExternalViewerResponse,
  UpdateViewerUserSystemConfigParams,
  // AC4: Viewer Label types
  ListViewerLabelsResponse,
  CreateViewerLabelParams,
  CreateViewerLabelResponse,
  UpdateViewerLabelParams,
  DeleteViewerLabelParams,
  AddViewerLabelParams,
  DeleteViewerLabelRefParams,
  // AC5: Product types
  ListProductsParams,
  ListProductsResponse,
  CreateProductParams,
  CreateProductResponse,
  UpdateProductParams,
  DeleteProductParams,
  // AC6: Product Tag types
  ListProductTagsResponse,
  CreateProductTagParams,
  CreateProductTagResponse,
  UpdateProductTagParams,
  DeleteProductTagParams,
  // AC7: Product Order types
  ListProductOrdersParams,
  ListProductOrdersResponse,
  GetProductOrderParams,
  ProductOrder,
  BatchUpdateOrderStatusParams,
  BatchUpdateOrderStatusResponse,
  // AC8: Label types
  ListLabelsParams,
  ListLabelsResponse,
  CreateLabelParams,
  CreateLabelResponse,
  UpdateLabelParams,
  DeleteLabelParams,
  AddChannelLabelRefsParams,
  // AC9: Invite Sales types
  ListInviteSalesParams,
  ListInviteSalesResponse,
  AddInviteSaleParams,
  AddInviteSaleResponse,
  UpdateInviteSaleParams,
  UpdateInviteSaleResponse,
  RemoveInviteSaleParams,
  RemoveInviteSaleResponse,
  ListFollowViewersParams,
  ListFollowViewersResponse,
  // AC10: Custom Field types
  ListCustomFieldsResponse,
  AddCustomFieldParams,
  AddCustomFieldResponse,
  AddCustomFieldValueParams,
  AddCustomFieldValueResponse,
  // AC11: Template types
  DonateTemplate,
  UpdateDonateTemplateParams,
  MarqueeTemplate,
  UpdateMarqueeTemplateParams,
  RoleConfigTemplate,
  UpdateRoleConfigTemplateParams,
  PlaybackSetting,
  UpdatePlaybackSettingParams,
  AudioModerationSetting,
  UpdateAudioModerationSettingParams,
  VideoModerationSetting,
  UpdateVideoModerationSettingParams,
  // AC12: User Settings types
  CallbackSettings,
  UpdateCallbackParams,
  GlobalSwitchSettings,
  UpdateGlobalSwitchParams,
  GlobalFooterSettings,
  UpdateGlobalFooterParams,
  PvShowEnableSettings,
  UpdatePvShowEnableParams,
  // AC13: Other User types
  GetMicDurationParams,
  MicDurationResponse,
  MrConcurrencyDetailResponse,
  SendSmsParams,
  GetBillUseDetailListParams,
  GetBillUseDetailListResponse,
  ViewerLotteryWinParams,
  ViewerLotteryWinResponse,
  GetWatchLogDetailParams,
  WatchLogDetailResponse,
  GetWatchLogListParams,
  GetWatchLogListResponse,
  // Story 13-3: Global Channel Settings
  GlobalChannelSettings,
  UpdateGlobalChannelSettingsParams,
} from '../../types/v4-user.js';
import { PolyVValidationError } from '../../errors/polyv-validation-error.js';

/**
 * V4UserService
 *
 * Provides methods to interact with PolyV V4 User APIs.
 *
 * @example
 * ```typescript
 * const client = new PolyVClient({ appId: 'xxx', appSecret: 'yyy' });
 * const accounts = await client.v4User.listChildAccounts({ pageNumber: 1, pageSize: 10 });
 * ```
 */
export class V4UserService {
  private client: PolyVClient;

  /**
   * Create a new V4UserService instance
   *
   * @param client - The PolyVClient instance to use for API calls
   */
  constructor(client: PolyVClient) {
    this.client = client;
  }

  // ============================================
  // AC1: Sub-account Management APIs (7 APIs)
  // ============================================

  /**
   * Create a child account (sub-account)
   *
   * @param params - Account creation parameters
   * @returns Created child account
   *
   * @example
   * ```typescript
   * const account = await client.v4User.createChildAccount({
   *   childEmail: 'test@example.com',
   *   childName: 'Test User',
   *   password: 'Password123',
   *   roleId: 1,
   * });
   * ```
   */
  async createChildAccount(params: CreateChildAccountParams): Promise<ChildAccount> {
    this.validateRequiredString(params.childEmail, 'childEmail');
    this.validateRequiredString(params.childName, 'childName');
    this.validateRequiredString(params.password, 'password');
    this.validateRequiredNumber(params.roleId, 'roleId');

    const response = await this.client.httpClient.post<ChildAccount>(
      '/live/v4/user/children/create',
      params
    );
    return response as unknown as ChildAccount;
  }

  /**
   * List child accounts with pagination
   *
   * @param params - Query parameters
   * @returns Paginated child account list
   *
   * @example
   * ```typescript
   * const result = await client.v4User.listChildAccounts({
   *   pageNumber: 1,
   *   pageSize: 10,
   * });
   * ```
   */
  async listChildAccounts(params: ListChildAccountsParams): Promise<ListChildAccountsResponse> {
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<ListChildAccountsResponse>(
      '/live/v4/user/children/list',
      { params }
    );
    return response as unknown as ListChildAccountsResponse;
  }

  /**
   * Get a child account by ID
   *
   * @param params - Query parameters
   * @returns Child account details
   *
   * @example
   * ```typescript
   * const account = await client.v4User.getChildAccount({
   *   childUserId: 'child_001',
   * });
   * ```
   */
  async getChildAccount(params: GetChildAccountParams): Promise<ChildAccount> {
    this.validateRequiredString(params.childUserId, 'childUserId');

    const response = await this.client.httpClient.get<ChildAccount>(
      '/live/v4/user/children/get',
      { params }
    );
    return response as unknown as ChildAccount;
  }

  /**
   * Update a child account
   *
   * @param params - Update parameters
   *
   * @example
   * ```typescript
   * await client.v4User.updateChildAccount({
   *   childUserId: 'child_001',
   *   childName: 'Updated Name',
   * });
   * ```
   */
  async updateChildAccount(params: UpdateChildAccountParams): Promise<void> {
    this.validateRequiredString(params.childUserId, 'childUserId');

    await this.client.httpClient.post(
      '/live/v4/user/children/update',
      params
    );
  }

  /**
   * Delete child accounts
   *
   * @param params - Delete parameters
   *
   * @example
   * ```typescript
   * await client.v4User.deleteChildAccounts({
   *   childUserIds: ['child_001', 'child_002'],
   * });
   * ```
   */
  async deleteChildAccounts(params: DeleteChildAccountsParams): Promise<void> {
    if (!params.childUserIds || params.childUserIds.length === 0) {
      throw new PolyVValidationError('childUserIds is required and cannot be empty');
    }

    await this.client.httpClient.post(
      '/live/v4/user/children/delete',
      params
    );
  }

  /**
   * List child account roles
   *
   * @returns List of roles
   *
   * @example
   * ```typescript
   * const roles = await client.v4User.listChildAccountRoles();
   * ```
   */
  async listChildAccountRoles(): Promise<ChildAccountRole[]> {
    const response = await this.client.httpClient.get<ChildAccountRole[]>(
      '/live/v4/user/children/roles',
      {}
    );
    return response as unknown as ChildAccountRole[];
  }

  /**
   * Get child account by sale
   *
   * @param params - Query parameters
   * @returns Child account details
   *
   * @example
   * ```typescript
   * const account = await client.v4User.getBySale({ sale: '100' });
   * ```
   */
  async getBySale(params: GetBySaleParams): Promise<ChildAccount> {
    this.validateRequiredString(params.sale, 'sale');

    const response = await this.client.httpClient.get<ChildAccount>(
      '/live/v4/user/children/get-by-sale',
      { params }
    );
    return response as unknown as ChildAccount;
  }

  // ============================================
  // AC2: Organization APIs (3 APIs)
  // ============================================

  /**
   * List organizations
   *
   * @returns List of organizations
   *
   * @example
   * ```typescript
   * const orgs = await client.v4User.listOrganizations();
   * ```
   */
  async listOrganizations(): Promise<ListOrganizationsResponse> {
    const response = await this.client.httpClient.get<ListOrganizationsResponse>(
      '/live/v4/user/organization/list',
      {}
    );
    return response as unknown as ListOrganizationsResponse;
  }

  /**
   * Create an organization
   *
   * @param params - Creation parameters
   * @returns Created organization
   *
   * @example
   * ```typescript
   * const org = await client.v4User.createOrganization({
   *   organizationName: 'New Org',
   * });
   * ```
   */
  async createOrganization(params: CreateOrganizationParams): Promise<CreateOrganizationResponse> {
    this.validateRequiredString(params.organizationName, 'organizationName');

    const response = await this.client.httpClient.post<CreateOrganizationResponse>(
      '/live/v4/user/organization/create',
      params
    );
    return response as unknown as CreateOrganizationResponse;
  }

  /**
   * Delete an organization
   *
   * @param params - Delete parameters
   *
   * @example
   * ```typescript
   * await client.v4User.deleteOrganization({ organizationId: 1 });
   * ```
   */
  async deleteOrganization(params: DeleteOrganizationParams): Promise<void> {
    this.validateRequiredNumber(params.organizationId, 'organizationId');

    await this.client.httpClient.post(
      '/live/v4/user/organization/delete',
      params
    );
  }

  // ============================================
  // AC3: Viewer Record APIs (7 APIs)
  // ============================================

  /**
   * List viewer records with pagination
   *
   * @param params - Query parameters
   * @returns Paginated viewer record list
   *
   * @example
   * ```typescript
   * const result = await client.v4User.listViewerRecords({
   *   pageNumber: 1,
   *   pageSize: 10,
   * });
   * ```
   */
  async listViewerRecords(params: ListViewerRecordsParams): Promise<ListViewerRecordsResponse> {
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<ListViewerRecordsResponse>(
      '/live/v4/user/viewer-record/list',
      { params }
    );
    return response as unknown as ListViewerRecordsResponse;
  }

  /**
   * Get a viewer record by ID
   *
   * @param params - Query parameters
   * @returns Viewer record details
   *
   * @example
   * ```typescript
   * const viewer = await client.v4User.getViewerRecord({
   *   viewerUnionId: 'viewer_001',
   * });
   * ```
   */
  async getViewerRecord(params: GetViewerRecordParams): Promise<ViewerRecord> {
    this.validateRequiredString(params.viewerUnionId, 'viewerUnionId');

    const response = await this.client.httpClient.get<ViewerRecord>(
      '/live/v4/user/viewer-record/get',
      { params }
    );
    return response as unknown as ViewerRecord;
  }

  /**
   * Create a viewer record
   *
   * @param params - Creation parameters
   * @returns Created viewer record
   *
   * @example
   * ```typescript
   * const viewer = await client.v4User.createViewerRecord({
   *   nickname: 'Test Viewer',
   *   mobile: '13800138000',
   * });
   * ```
   */
  async createViewerRecord(params: CreateViewerRecordParams): Promise<ViewerRecord> {
    this.validateRequiredString(params.nickname, 'nickname');
    this.validateRequiredString(params.mobile, 'mobile');

    const response = await this.client.httpClient.post<ViewerRecord>(
      '/live/v4/user/viewer-record/create',
      params
    );
    return response as unknown as ViewerRecord;
  }

  /**
   * Update a viewer record
   *
   * @param params - Update parameters
   *
   * @example
   * ```typescript
   * await client.v4User.updateViewerRecord({
   *   viewerUnionId: 'viewer_001',
   *   nickname: 'Updated Name',
   * });
   * ```
   */
  async updateViewerRecord(params: UpdateViewerRecordParams): Promise<void> {
    this.validateRequiredString(params.viewerUnionId, 'viewerUnionId');

    await this.client.httpClient.post(
      '/live/v4/user/viewer-record/update',
      params
    );
  }

  /**
   * Delete a viewer record
   *
   * @param params - Delete parameters
   *
   * @example
   * ```typescript
   * await client.v4User.deleteViewerRecord({
   *   viewerUnionId: 'viewer_001',
   * });
   * ```
   */
  async deleteViewerRecord(params: DeleteViewerRecordParams): Promise<void> {
    this.validateRequiredString(params.viewerUnionId, 'viewerUnionId');

    await this.client.httpClient.get(
      '/live/v4/user/viewer-record/delete',
      { params }
    );
  }

  /**
   * Direct auth viewer
   *
   * @param params - Auth parameters
   *
   * @example
   * ```typescript
   * await client.v4User.directAuthViewer({
   *   channelId: '123456',
   *   viewerId: 'viewer_001',
   *   nickname: 'Auth User',
   * });
   * ```
   */
  async directAuthViewer(params: DirectAuthViewerParams): Promise<void> {
    this.validateRequiredString(params.channelId, 'channelId');
    this.validateRequiredString(params.viewerId, 'viewerId');
    this.validateRequiredString(params.nickname, 'nickname');

    await this.client.httpClient.post(
      '/live/v4/user/viewer-record/direct-auth',
      params
    );
  }

  /**
   * Import external viewers
   *
   * @param params - Import parameters
   *
   * @example
   * ```typescript
   * await client.v4User.importExternalViewer([
   *   { externalViewerId: 'ext_001', nickname: 'User 1' },
   * ]);
   * ```
   */
  async importExternalViewer(params: ImportExternalViewerParams): Promise<ImportExternalViewerResponse> {
    this.validateNonEmptyArray(params, 'params');
    params.forEach((viewer, index) => {
      this.validateRequiredString(viewer.externalViewerId, `params[${index}].externalViewerId`);
      this.validateRequiredString(viewer.nickname, `params[${index}].nickname`);
    });

    const response = await this.client.httpClient.post<ImportExternalViewerResponse>(
      '/live/v4/user/viewer-record/import-external-viewer',
      params
    );
    return response as unknown as ImportExternalViewerResponse;
  }

  /**
   * Update viewer user system config
   *
   * @param params - Viewer user system config
   *
   * @example
   * ```typescript
   * await client.v4User.updateViewerUserSystemConfig({
   *   mobileLoginEnabled: 'Y',
   *   wxWorkLoginEnabled: 'N',
   * });
   * ```
   */
  async updateViewerUserSystemConfig(params: UpdateViewerUserSystemConfigParams): Promise<void> {
    this.validateYnValue(params.mobileLoginEnabled, 'mobileLoginEnabled');
    this.validateYnValue(params.wxWorkLoginEnabled, 'wxWorkLoginEnabled');
    this.validateOptionalYnValue(params.collectMobileEnabled, 'collectMobileEnabled');
    this.validateOptionalYnValue(params.guestModeEnabled, 'guestModeEnabled');
    this.validateOptionalYnValue(params.touristExternalHrefEnabled, 'touristExternalHrefEnabled');

    if (
      params.viewerWeixinAuthExpired !== undefined
      && (params.viewerWeixinAuthExpired < 0 || params.viewerWeixinAuthExpired > 180)
    ) {
      throw new PolyVValidationError(
        'viewerWeixinAuthExpired must be between 0 and 180',
        'viewerWeixinAuthExpired',
        params.viewerWeixinAuthExpired
      );
    }

    await this.client.httpClient.post(
      '/live/v4/user/viewer-user-system/update-config',
      params
    );
  }

  // ============================================
  // AC4: Viewer Label APIs (6 APIs)
  // ============================================

  /**
   * List viewer labels
   *
   * @returns List of viewer labels
   *
   * @example
   * ```typescript
   * const labels = await client.v4User.listViewerLabels();
   * ```
   */
  async listViewerLabels(): Promise<ListViewerLabelsResponse> {
    const response = await this.client.httpClient.get<ListViewerLabelsResponse>(
      '/live/v4/user/viewer-label/list',
      {}
    );
    return response as unknown as ListViewerLabelsResponse;
  }

  /**
   * Create a viewer label
   *
   * @param params - Creation parameters
   * @returns Created viewer label
   *
   * @example
   * ```typescript
   * const label = await client.v4User.createViewerLabel({
   *   labels: ['VIP'],
   * });
   * ```
   */
  async createViewerLabel(params: CreateViewerLabelParams): Promise<CreateViewerLabelResponse> {
    this.validateNonEmptyArray(params.labels, 'labels');
    params.labels.forEach((label, index) => {
      this.validateRequiredString(label, `labels[${index}]`);
    });

    const response = await this.client.httpClient.post<CreateViewerLabelResponse>(
      '/live/v4/user/viewer-label/create-batch',
      params
    );
    return response as unknown as CreateViewerLabelResponse;
  }

  /**
   * Update a viewer label
   *
   * @param params - Update parameters
   *
   * @example
   * ```typescript
   * await client.v4User.updateViewerLabel({
   *   id: 1,
   *   label: 'Updated Label',
   * });
   * ```
   */
  async updateViewerLabel(params: UpdateViewerLabelParams): Promise<void> {
    this.validateRequiredId(params.id, 'id');

    await this.client.httpClient.post(
      '/live/v4/user/viewer-label/update',
      params
    );
  }

  /**
   * Delete a viewer label
   *
   * @param params - Delete parameters
   *
   * @example
   * ```typescript
   * await client.v4User.deleteViewerLabel({ id: 1 });
   * ```
   */
  async deleteViewerLabel(params: DeleteViewerLabelParams): Promise<void> {
    this.validateRequiredId(params.id, 'id');

    await this.client.httpClient.post(
      '/live/v4/user/viewer-label/delete',
      null,
      { params }
    );
  }

  /**
   * Add a label to a viewer
   *
   * @param params - Add parameters
   *
   * @example
   * ```typescript
   * await client.v4User.addViewerLabel({
   *   viewerUnionId: 'viewer_001',
   *   labelId: 1,
   * });
   * ```
   */
  async addViewerLabel(params: AddViewerLabelParams): Promise<void> {
    this.validateRequiredString(params.viewerUnionId, 'viewerUnionId');
    this.validateRequiredNumber(params.labelId, 'labelId');

    // API only supports batch operation, convert single to array
    await this.client.httpClient.post(
      '/live/v4/user/viewer-label/add-viewers-label',
      {
        viewerUnionIds: [params.viewerUnionId],
        labelIds: [params.labelId],
      }
    );
  }

  /**
   * Delete a label from a viewer
   *
   * @param params - Delete parameters
   *
   * @example
   * ```typescript
   * await client.v4User.deleteViewerLabelRef({
   *   viewerUnionId: 'viewer_001',
   *   labelId: 1,
   * });
   * ```
   */
  async deleteViewerLabelRef(params: DeleteViewerLabelRefParams): Promise<void> {
    this.validateRequiredString(params.viewerUnionId, 'viewerUnionId');
    this.validateRequiredNumber(params.labelId, 'labelId');

    // API only supports batch operation, convert single to array
    await this.client.httpClient.post(
      '/live/v4/user/viewer-label/remove-viewers-label',
      {
        viewerUnionIds: [params.viewerUnionId],
        labelIds: [params.labelId],
      }
    );
  }

  // ============================================
  // AC5: Product APIs (4 APIs)
  // ============================================

  /**
   * List products with pagination
   *
   * @param params - Query parameters
   * @returns Paginated product list
   *
   * @example
   * ```typescript
   * const result = await client.v4User.listProducts({
   *   pageNumber: 1,
   *   pageSize: 10,
   * });
   * ```
   */
  async listProducts(params: ListProductsParams): Promise<ListProductsResponse> {
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<ListProductsResponse>(
      '/live/v4/user/product/list',
      { params }
    );
    return response as unknown as ListProductsResponse;
  }

  /**
   * Create a product
   *
   * @param params - Creation parameters
   * @returns Created product
   *
   * @example
   * ```typescript
   * const product = await client.v4User.createProduct({
   *   name: 'New Product',
   *   linkType: 10,
   *   link: 'https://example.com/product',
   * });
   * ```
   */
  async createProduct(params: CreateProductParams): Promise<CreateProductResponse> {
    this.validateRequiredString(params.name, 'name');
    this.validateRequiredNumber(params.linkType, 'linkType');
    this.validateRequiredString(params.link, 'link');

    const response = await this.client.httpClient.post<CreateProductResponse>(
      '/live/v4/user/product/save',
      params
    );
    return response as unknown as CreateProductResponse;
  }

  /**
   * Update a product
   *
   * @param params - Update parameters
   *
   * @example
   * ```typescript
   * await client.v4User.updateProduct({
   *   productId: 'prod_001',
   *   name: 'Updated Product',
   * });
   * ```
   */
  async updateProduct(params: UpdateProductParams): Promise<void> {
    this.validateRequiredString(params.productId, 'productId');

    await this.client.httpClient.post(
      '/live/v4/user/product/update',
      params
    );
  }

  /**
   * Delete a product
   *
   * @param params - Delete parameters
   *
   * @example
   * ```typescript
   * await client.v4User.deleteProduct({ productId: 'prod_001' });
   * ```
   */
  async deleteProduct(params: DeleteProductParams): Promise<void> {
    this.validateRequiredString(params.productId, 'productId');

    await this.client.httpClient.post(
      '/live/v4/user/product/delete',
      params
    );
  }

  // ============================================
  // AC6: Product Tag APIs (4 APIs)
  // ============================================

  /**
   * List product tags
   *
   * @returns List of product tags
   *
   * @example
   * ```typescript
   * const tags = await client.v4User.listProductTags();
   * ```
   */
  async listProductTags(): Promise<ListProductTagsResponse> {
    const response = await this.client.httpClient.get<ListProductTagsResponse>(
      '/live/v4/user/product/tag/list',
      {}
    );
    return response as unknown as ListProductTagsResponse;
  }

  /**
   * Create a product tag
   *
   * @param params - Creation parameters
   * @returns Created product tag
   *
   * @example
   * ```typescript
   * const tag = await client.v4User.createProductTag({
   *   tagName: 'Hot',
   * });
   * ```
   */
  async createProductTag(params: CreateProductTagParams): Promise<CreateProductTagResponse> {
    this.validateRequiredString(params.tagName, 'tagName');

    const response = await this.client.httpClient.post<CreateProductTagResponse>(
      '/live/v4/user/product/tag/create',
      params
    );
    return response as unknown as CreateProductTagResponse;
  }

  /**
   * Update a product tag
   *
   * @param params - Update parameters
   *
   * @example
   * ```typescript
   * await client.v4User.updateProductTag({
   *   tagId: 1,
   *   tagName: 'Updated Tag',
   * });
   * ```
   */
  async updateProductTag(params: UpdateProductTagParams): Promise<void> {
    this.validateRequiredNumber(params.tagId, 'tagId');

    await this.client.httpClient.post(
      '/live/v4/user/product/tag/update',
      params
    );
  }

  /**
   * Delete a product tag
   *
   * @param params - Delete parameters
   *
   * @example
   * ```typescript
   * await client.v4User.deleteProductTag({ tagId: 1 });
   * ```
   */
  async deleteProductTag(params: DeleteProductTagParams): Promise<void> {
    this.validateRequiredNumber(params.tagId, 'tagId');

    await this.client.httpClient.post(
      '/live/v4/user/product/tag/delete',
      params
    );
  }

  // ============================================
  // AC7: Product Order APIs (3 APIs)
  // ============================================

  /**
   * List product orders with pagination
   *
   * @param params - Query parameters
   * @returns Paginated product order list
   *
   * @example
   * ```typescript
   * const result = await client.v4User.listProductOrders({
   *   pageNumber: 1,
   *   pageSize: 10,
   * });
   * ```
   */
  async listProductOrders(params: ListProductOrdersParams): Promise<ListProductOrdersResponse> {
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<ListProductOrdersResponse>(
      '/live/v4/user/product/order/list',
      { params }
    );
    return response as unknown as ListProductOrdersResponse;
  }

  /**
   * Get a product order by ID
   *
   * @param params - Query parameters
   * @returns Product order details
   *
   * @example
   * ```typescript
   * const order = await client.v4User.getProductOrder({
   *   orderNo: 'order_001',
   * });
   * ```
   */
  async getProductOrder(params: GetProductOrderParams): Promise<ProductOrder> {
    this.validateRequiredString(params.orderNo, 'orderNo');

    const response = await this.client.httpClient.get<ProductOrder>(
      '/live/v4/user/product/order/get',
      { params }
    );
    return response as unknown as ProductOrder;
  }

  /**
   * Batch update order status
   *
   * @param params - Update parameters
   *
   * @example
   * ```typescript
   * await client.v4User.batchUpdateOrderStatus({
   *   orderNos: ['order_001', 'order_002'],
   *   status: 'delivering',
   * });
   * ```
   */
  async batchUpdateOrderStatus(params: BatchUpdateOrderStatusParams): Promise<BatchUpdateOrderStatusResponse | null> {
    this.validateNonEmptyArray(params.orderNos, 'orderNos');
    params.orderNos.forEach((orderNo, index) => {
      this.validateRequiredString(orderNo, `orderNos[${index}]`);
    });
    this.validateRequiredString(params.status, 'status');

    const response = await this.client.httpClient.post<BatchUpdateOrderStatusResponse | null>(
      '/live/v4/user/product/order/update-batch-status',
      params
    );
    return response as unknown as BatchUpdateOrderStatusResponse | null;
  }

  // ============================================
  // AC8: Label APIs (5 APIs)
  // ============================================

  /**
   * List labels
   *
   * @returns List of labels
   *
   * @example
   * ```typescript
   * const labels = await client.v4User.listLabels({
   *   pageNumber: 1,
   *   pageSize: 10,
   * });
   * ```
   */
  async listLabels(params: ListLabelsParams): Promise<ListLabelsResponse> {
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<ListLabelsResponse>(
      '/live/v4/user/label/page',
      { params }
    );
    return response as unknown as ListLabelsResponse;
  }

  /**
   * Create a label
   *
   * @param params - Creation parameters
   * @returns Created label
   *
   * @example
   * ```typescript
   * const label = await client.v4User.createLabel({
   *   labelName: 'Tech',
   * });
   * ```
   */
  async createLabel(params: CreateLabelParams): Promise<CreateLabelResponse> {
    this.validateRequiredString(params.labelName, 'labelName');

    const response = await this.client.httpClient.post<CreateLabelResponse>(
      '/live/v4/user/label/save',
      params
    );
    return response as unknown as CreateLabelResponse;
  }

  /**
   * Update a label
   *
   * @param params - Update parameters
   *
   * @example
   * ```typescript
   * await client.v4User.updateLabel({
   *   labelId: 1,
   *   labelName: 'Updated Label',
   * });
   * ```
   */
  async updateLabel(params: UpdateLabelParams): Promise<void> {
    this.validateRequiredString(params.labelId, 'labelId');
    this.validateRequiredString(params.labelName, 'labelName');

    await this.client.httpClient.post(
      '/live/v4/user/label/update',
      params
    );
  }

  /**
   * Delete a label
   *
   * @param params - Delete parameters
   *
   * @example
   * ```typescript
   * await client.v4User.deleteLabel({ labelId: 'label_001' });
   * ```
   */
  async deleteLabel(params: DeleteLabelParams): Promise<void> {
    this.validateRequiredString(params.labelId, 'labelId');

    await this.client.httpClient.get(
      '/live/v4/user/label/delete',
      { params }
    );
  }

  /**
   * Add channel label refs
   *
   * @param params - Add parameters
   *
   * @example
   * ```typescript
   * await client.v4User.addChannelLabelRefs({
   *   labelIds: ['label_001'],
   *   channelIds: ['123456', '789012'],
   * });
   * ```
   */
  async addChannelLabelRefs(params: AddChannelLabelRefsParams): Promise<void> {
    this.validateNonEmptyArray(params.channelIds, 'channelIds');
    this.validateNonEmptyArray(params.labelIds, 'labelIds');

    await this.client.httpClient.post(
      '/live/v4/channel/label-ref/save-batch',
      params
    );
  }

  // ============================================
  // AC9: Invite Sales APIs (5 APIs)
  // ============================================

  /**
   * List invite sales
   *
   * @returns List of invite sales
   *
   * @example
   * ```typescript
   * const sales = await client.v4User.listInviteSales();
   * ```
   */
  async listInviteSales(params: ListInviteSalesParams = {}): Promise<ListInviteSalesResponse> {
    this.validateOptionalPaginationParams(params);

    const response = await this.client.httpClient.get<ListInviteSalesResponse>(
      '/live/v4/user/invite-sales/list',
      { params }
    );
    return response as unknown as ListInviteSalesResponse;
  }

  /**
   * Add an invite sale
   *
   * @param params - Add parameters
   * @returns Created invite sale
   *
   * @example
   * ```typescript
   * const sale = await client.v4User.addInviteSale({
   *   viewerUnionIds: ['viewer_001', 'viewer_002'],
   *   organizationId: 123,
   * });
   * ```
   */
  async addInviteSale(params: AddInviteSaleParams): Promise<AddInviteSaleResponse> {
    this.validateNonEmptyArray(params.viewerUnionIds, 'viewerUnionIds');
    params.viewerUnionIds.forEach((viewerUnionId, index) => {
      this.validateRequiredString(viewerUnionId, `viewerUnionIds[${index}]`);
    });

    const response = await this.client.httpClient.post<AddInviteSaleResponse>(
      '/live/v4/user/invite-sales/add',
      params
    );
    return response as unknown as AddInviteSaleResponse;
  }

  /**
   * Update an invite sale
   *
   * @param params - Update parameters
   *
   * @example
   * ```typescript
   * await client.v4User.updateInviteSale({
   *   viewerUnionIds: ['viewer_001', 'viewer_002'],
   *   organizationId: 123,
   * });
   * ```
   */
  async updateInviteSale(params: UpdateInviteSaleParams): Promise<UpdateInviteSaleResponse> {
    this.validateNonEmptyArray(params.viewerUnionIds, 'viewerUnionIds');
    params.viewerUnionIds.forEach((viewerUnionId, index) => {
      this.validateRequiredString(viewerUnionId, `viewerUnionIds[${index}]`);
    });
    this.validateRequiredNumber(params.organizationId, 'organizationId');

    await this.client.httpClient.post(
      '/live/v4/user/invite-sales/update',
      params
    );
  }

  /**
   * Remove an invite sale
   *
   * @param params - Remove parameters
   *
   * @example
   * ```typescript
   * await client.v4User.removeInviteSale({ viewerUnionIds: ['viewer_001'] });
   * ```
   */
  async removeInviteSale(params: RemoveInviteSaleParams): Promise<RemoveInviteSaleResponse> {
    this.validateNonEmptyArray(params.viewerUnionIds, 'viewerUnionIds');
    params.viewerUnionIds.forEach((viewerUnionId, index) => {
      this.validateRequiredString(viewerUnionId, `viewerUnionIds[${index}]`);
    });
    if (params.newViewerUnionId !== undefined) {
      this.validateRequiredString(params.newViewerUnionId, 'newViewerUnionId');
    }
    if (params.followViewersToNewViewerUnionId !== undefined) {
      this.validateRequiredString(
        params.followViewersToNewViewerUnionId,
        'followViewersToNewViewerUnionId'
      );
    }

    await this.client.httpClient.post(
      '/live/v4/user/invite-sales/remove',
      params
    );
  }

  /**
   * List follow viewers
   *
   * @param params - Query parameters
   * @returns List of follow viewers
   *
   * @example
   * ```typescript
   * const viewers = await client.v4User.listFollowViewers({ inviteCustomerId: 'viewer_001' });
   * ```
   */
  async listFollowViewers(params: ListFollowViewersParams): Promise<ListFollowViewersResponse> {
    this.validateOptionalPaginationParams(params);

    const response = await this.client.httpClient.get<ListFollowViewersResponse>(
      '/live/v4/user/invite-sales/follow-viewer/list',
      { params }
    );
    return response as unknown as ListFollowViewersResponse;
  }

  // ============================================
  // AC10: Custom Field APIs (3 APIs)
  // ============================================

  /**
   * List custom fields
   *
   * @returns List of custom fields
   *
   * @example
   * ```typescript
   * const fields = await client.v4User.listCustomFields();
   * ```
   */
  async listCustomFields(): Promise<ListCustomFieldsResponse> {
    const response = await this.client.httpClient.get<ListCustomFieldsResponse>(
      '/live/v4/user/custom-field/list',
      {}
    );
    return response as unknown as ListCustomFieldsResponse;
  }

  /**
   * Add a custom field
   *
   * @param params - Add parameters
   * @returns Created custom field
   *
   * @example
   * ```typescript
   * const field = await client.v4User.addCustomField({
   *   customFieldId: 'PAY_STATUS',
   *   customFieldName: '支付状态',
   *   customFieldType: 'text',
   * });
   * ```
   */
  async addCustomField(params: AddCustomFieldParams): Promise<AddCustomFieldResponse> {
    this.validateRequiredString(params.customFieldId, 'customFieldId');
    this.validateRequiredString(params.customFieldName, 'customFieldName');
    this.validateRequiredString(params.customFieldType, 'customFieldType');

    const response = await this.client.httpClient.post<AddCustomFieldResponse>(
      '/live/v4/user/custom-field/save',
      params
    );
    return response as unknown as AddCustomFieldResponse;
  }

  /**
   * Add a custom field value
   *
   * @param params - Add parameters
   *
   * @example
   * ```typescript
   * await client.v4User.addCustomFieldValue([
   *   {
   *     viewerId: 'viewer_001',
   *     customFieldId: 'PAY_STATUS',
   *     customFieldValue: '已支付',
   *   },
   * ]);
   * ```
   */
  async addCustomFieldValue(params: AddCustomFieldValueParams): Promise<AddCustomFieldValueResponse> {
    this.validateNonEmptyArray(params, 'params');
    params.forEach((fieldValue, index) => {
      this.validateRequiredString(fieldValue.viewerId, `params[${index}].viewerId`);
      this.validateRequiredString(fieldValue.customFieldId, `params[${index}].customFieldId`);
      this.validateRequiredString(fieldValue.customFieldValue, `params[${index}].customFieldValue`);
    });

    await this.client.httpClient.post(
      '/live/v4/user/custom-field/viewer-value/save',
      params
    );
  }

  // ============================================
  // AC11: Template APIs (12 APIs)
  // ============================================

  /**
   * Get donate template settings
   *
   * @returns Donate template settings
   *
   * @example
   * ```typescript
   * const template = await client.v4User.getDonateTemplate();
   * ```
   */
  async getDonateTemplate(): Promise<DonateTemplate> {
    const response = await this.client.httpClient.get<DonateTemplate>(
      '/live/v4/user/template/donate/get',
      {}
    );
    return response as unknown as DonateTemplate;
  }

  /**
   * Update donate template settings
   *
   * @param params - Update parameters
   *
   * @example
   * ```typescript
   * await client.v4User.updateDonateTemplate({
   *   enabled: true,
   *   minAmount: 1,
   *   maxAmount: 10000,
   * });
   * ```
   */
  async updateDonateTemplate(params: UpdateDonateTemplateParams): Promise<void> {
    await this.client.httpClient.post(
      '/live/v4/user/template/donate/update',
      params
    );
  }

  /**
   * Get marquee template settings
   *
   * @returns Marquee template settings
   *
   * @example
   * ```typescript
   * const template = await client.v4User.getMarqueeTemplate();
   * ```
   */
  async getMarqueeTemplate(): Promise<MarqueeTemplate> {
    const response = await this.client.httpClient.get<MarqueeTemplate>(
      '/live/v4/user/template/marquee/get',
      {}
    );
    return response as unknown as MarqueeTemplate;
  }

  /**
   * Update marquee template settings
   *
   * @param params - Update parameters
   *
   * @example
   * ```typescript
   * await client.v4User.updateMarqueeTemplate({
   *   enabled: true,
   *   content: 'New message',
   * });
   * ```
   */
  async updateMarqueeTemplate(params: UpdateMarqueeTemplateParams): Promise<void> {
    await this.client.httpClient.post(
      '/live/v4/user/template/marquee/update',
      params
    );
  }

  /**
   * Get role config template settings
   *
   * @returns Role config template settings
   *
   * @example
   * ```typescript
   * const config = await client.v4User.getRoleConfigTemplate();
   * ```
   */
  async getRoleConfigTemplate(): Promise<RoleConfigTemplate> {
    const response = await this.client.httpClient.get<RoleConfigTemplate>(
      '/live/v4/user/template/role-config/get',
      {}
    );
    return response as unknown as RoleConfigTemplate;
  }

  /**
   * Update role config template settings
   *
   * @param params - Update parameters
   *
   * @example
   * ```typescript
   * await client.v4User.updateRoleConfigTemplate({
   *   roles: ['admin', 'moderator'],
   * });
   * ```
   */
  async updateRoleConfigTemplate(params: UpdateRoleConfigTemplateParams): Promise<void> {
    await this.client.httpClient.post(
      '/live/v4/user/template/role-config/update',
      params
    );
  }

  /**
   * Get playback setting
   *
   * @returns Playback setting
   *
   * @example
   * ```typescript
   * const setting = await client.v4User.getPlaybackSetting();
   * ```
   */
  async getPlaybackSetting(): Promise<PlaybackSetting> {
    const response = await this.client.httpClient.get<PlaybackSetting>(
      '/live/v4/user/template/playback/get',
      {}
    );
    return response as unknown as PlaybackSetting;
  }

  /**
   * Update playback setting
   *
   * @param params - Update parameters
   *
   * @example
   * ```typescript
   * await client.v4User.updatePlaybackSetting({
   *   autoPlay: false,
   *   quality: 'medium',
   * });
   * ```
   */
  async updatePlaybackSetting(params: UpdatePlaybackSettingParams): Promise<void> {
    await this.client.httpClient.post(
      '/live/v4/user/template/playback/update',
      params
    );
  }

  /**
   * Get audio moderation setting
   *
   * @returns Audio moderation setting
   *
   * @example
   * ```typescript
   * const setting = await client.v4User.getAudioModerationSetting();
   * ```
   */
  async getAudioModerationSetting(): Promise<AudioModerationSetting> {
    const response = await this.client.httpClient.get<AudioModerationSetting>(
      '/live/v4/user/template/audio-moderation/get',
      {}
    );
    return response as unknown as AudioModerationSetting;
  }

  /**
   * Update audio moderation setting
   *
   * @param params - Update parameters
   *
   * @example
   * ```typescript
   * await client.v4User.updateAudioModerationSetting({
   *   enabled: true,
   *   level: 'moderate',
   * });
   * ```
   */
  async updateAudioModerationSetting(params: UpdateAudioModerationSettingParams): Promise<void> {
    await this.client.httpClient.post(
      '/live/v4/user/template/audio-moderation/update',
      params
    );
  }

  /**
   * Get video moderation setting
   *
   * @returns Video moderation setting
   *
   * @example
   * ```typescript
   * const setting = await client.v4User.getVideoModerationSetting();
   * ```
   */
  async getVideoModerationSetting(): Promise<VideoModerationSetting> {
    const response = await this.client.httpClient.get<VideoModerationSetting>(
      '/live/v4/user/template/video-moderation/get',
      {}
    );
    return response as unknown as VideoModerationSetting;
  }

  /**
   * Update video moderation setting
   *
   * @param params - Update parameters
   *
   * @example
   * ```typescript
   * await client.v4User.updateVideoModerationSetting({
   *   enabled: true,
   *   level: 'moderate',
   * });
   * ```
   */
  async updateVideoModerationSetting(params: UpdateVideoModerationSettingParams): Promise<void> {
    await this.client.httpClient.post(
      '/live/v4/user/template/video-moderation/update',
      params
    );
  }

  // ============================================
  // AC12: User Settings APIs (8 APIs)
  // ============================================

  /**
   * Get callback settings
   *
   * @returns Callback settings
   *
   * @example
   * ```typescript
   * const callback = await client.v4User.getCallback();
   * ```
   */
  async getCallback(): Promise<CallbackSettings> {
    const response = await this.client.httpClient.get<CallbackSettings>(
      '/live/v4/user/callback/get',
      {}
    );
    return response as unknown as CallbackSettings;
  }

  /**
   * Update callback settings
   *
   * @param params - Update parameters
   *
   * @example
   * ```typescript
   * await client.v4User.updateCallback({
   *   url: 'https://example.com/new-callback',
   *   enabled: true,
   * });
   * ```
   */
  async updateCallback(params: UpdateCallbackParams): Promise<void> {
    await this.client.httpClient.post(
      '/live/v4/user/callback/update',
      params
    );
  }

  /**
   * Get global switch settings
   *
   * @returns Global switch settings
   *
   * @example
   * ```typescript
   * const switches = await client.v4User.getGlobalSwitch();
   * ```
   */
  async getGlobalSwitch(): Promise<GlobalSwitchSettings> {
    const response = await this.client.httpClient.get<GlobalSwitchSettings>(
      '/live/v4/user/global-switch/get',
      {}
    );
    return response as unknown as GlobalSwitchSettings;
  }

  /**
   * Update global switch settings
   *
   * @param params - Update parameters
   *
   * @example
   * ```typescript
   * await client.v4User.updateGlobalSwitch({
   *   chatEnabled: false,
   *   danmuEnabled: true,
   * });
   * ```
   */
  async updateGlobalSwitch(params: UpdateGlobalSwitchParams): Promise<void> {
    await this.client.httpClient.post(
      '/live/v4/user/global-switch/update',
      params
    );
  }

  /**
   * Get global footer settings
   *
   * @returns Global footer settings
   *
   * @example
   * ```typescript
   * const footer = await client.v4User.getGlobalFooter();
   * ```
   */
  async getGlobalFooter(): Promise<GlobalFooterSettings> {
    const response = await this.client.httpClient.get<GlobalFooterSettings>(
      '/live/v4/user/global-footer/get',
      {}
    );
    return response as unknown as GlobalFooterSettings;
  }

  /**
   * Update global footer settings
   *
   * @param params - Update parameters
   *
   * @example
   * ```typescript
   * await client.v4User.updateGlobalFooter({
   *   enabled: true,
   *   content: 'New footer text',
   * });
   * ```
   */
  async updateGlobalFooter(params: UpdateGlobalFooterParams): Promise<void> {
    await this.client.httpClient.post(
      '/live/v4/user/global-footer/update',
      params
    );
  }

  /**
   * Get PV show enable settings
   *
   * @returns PV show enable settings
   *
   * @example
   * ```typescript
   * const pvShow = await client.v4User.getPvShowEnable();
   * ```
   */
  async getPvShowEnable(): Promise<PvShowEnableSettings> {
    const response = await this.client.httpClient.get<PvShowEnableSettings>(
      '/live/v4/user/pv-show-enable/get',
      {}
    );
    return response as unknown as PvShowEnableSettings;
  }

  /**
   * Update PV show enable settings
   *
   * @param params - Update parameters
   *
   * @example
   * ```typescript
   * await client.v4User.updatePvShowEnable({ enabled: false });
   * ```
   */
  async updatePvShowEnable(params: UpdatePvShowEnableParams): Promise<void> {
    await this.client.httpClient.post(
      '/live/v4/user/pv-show-enable/update',
      params
    );
  }

  // ============================================
  // AC13: Other User APIs (7 APIs)
  // ============================================

  /**
   * Get mic duration
   *
   * @param params - Query parameters
   * @returns Mic duration info
   *
   * @example
   * ```typescript
   * const duration = await client.v4User.getMicDuration({
   *   channelId: '123456',
   *   sessionId: 'session_001',
   * });
   * ```
   */
  async getMicDuration(params: GetMicDurationParams): Promise<MicDurationResponse> {
    this.validateRequiredString(params.channelId, 'channelId');
    this.validateRequiredString(params.sessionId, 'sessionId');

    const response = await this.client.httpClient.get<MicDurationResponse>(
      '/live/v4/user/mic-duration/get',
      { params }
    );
    return response as unknown as MicDurationResponse;
  }

  /**
   * Get MR concurrency detail
   *
   * @returns MR concurrency detail
   *
   * @example
   * ```typescript
   * const detail = await client.v4User.getMrConcurrencyDetail();
   * ```
   */
  async getMrConcurrencyDetail(): Promise<MrConcurrencyDetailResponse> {
    const response = await this.client.httpClient.get<MrConcurrencyDetailResponse>(
      '/live/v4/user/mr-concurrency-detail/get',
      {}
    );
    return response as unknown as MrConcurrencyDetailResponse;
  }

  /**
   * Send SMS
   *
   * @param params - SMS parameters
   *
   * @example
   * ```typescript
   * await client.v4User.sendSms({
   *   mobile: '13800138000',
   *   content: 'Your verification code is 123456',
   * });
   * ```
   */
  async sendSms(params: SendSmsParams): Promise<void> {
    this.validateRequiredString(params.mobile, 'mobile');
    this.validateRequiredString(params.content, 'content');

    await this.client.httpClient.post(
      '/live/v4/user/sms/send',
      params
    );
  }

  /**
   * Get bill use detail list
   *
   * @param params - Query parameters
   * @returns Bill use detail list
   *
   * @example
   * ```typescript
   * const bills = await client.v4User.getBillUseDetailList({
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31',
   * });
   * ```
   */
  async getBillUseDetailList(params: GetBillUseDetailListParams): Promise<GetBillUseDetailListResponse> {
    this.validateRequiredString(params.startDate, 'startDate');
    this.validateRequiredString(params.endDate, 'endDate');

    const response = await this.client.httpClient.get<GetBillUseDetailListResponse>(
      '/live/v4/user/bill-use-detail/list',
      { params }
    );
    return response as unknown as GetBillUseDetailListResponse;
  }

  /**
   * Get viewer lottery win info
   *
   * @param params - Query parameters
   * @returns Viewer lottery win info
   *
   * @example
   * ```typescript
   * const win = await client.v4User.viewerLotteryWin({
   *   viewerId: 'viewer_001',
   *   pageNumber: 1,
   *   pageSize: 10,
   * });
   * ```
   */
  async viewerLotteryWin(params: ViewerLotteryWinParams): Promise<ViewerLotteryWinResponse> {
    this.validateRequiredString(params.viewerId, 'viewerId');
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<ViewerLotteryWinResponse>(
      '/live/v4/user/lottery/list-personal-win',
      { params }
    );
    return response as unknown as ViewerLotteryWinResponse;
  }

  /**
   * Get watch log detail
   *
   * @param params - Query parameters
   * @returns Watch log detail
   *
   * @example
   * ```typescript
   * const log = await client.v4User.getWatchLogDetail({ logId: 1 });
   * ```
   */
  async getWatchLogDetail(params: GetWatchLogDetailParams): Promise<WatchLogDetailResponse> {
    this.validateRequiredNumber(params.logId, 'logId');

    const response = await this.client.httpClient.get<WatchLogDetailResponse>(
      '/live/v4/user/watch-log/detail',
      { params }
    );
    return response as unknown as WatchLogDetailResponse;
  }

  /**
   * Get watch log list with pagination
   *
   * @param params - Query parameters
   * @returns Paginated watch log list
   *
   * @example
   * ```typescript
   * const logs = await client.v4User.getWatchLogList({
   *   pageNumber: 1,
   *   pageSize: 10,
   * });
   * ```
   */
  async getWatchLogList(params: GetWatchLogListParams): Promise<GetWatchLogListResponse> {
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<GetWatchLogListResponse>(
      '/live/v4/user/watch-log/list',
      { params }
    );
    return response as unknown as GetWatchLogListResponse;
  }

  // ============================================
  // Story 13-3: Global Channel Settings APIs
  // ============================================

  /**
   * Get global channel settings
   *
   * @returns Global channel settings
   *
   * @example
   * ```typescript
   * const settings = await client.v4User.getGlobalChannelSettings();
   * ```
   */
  async getGlobalChannelSettings(): Promise<GlobalChannelSettings> {
    const response = await this.client.httpClient.get<GlobalChannelSettings>(
      '/live/v4/user/global-setting/switch/get',
      {}
    );
    return response as unknown as GlobalChannelSettings;
  }

  /**
   * Update global channel settings
   *
   * @param params - Update parameters
   *
   * @example
   * ```typescript
   * await client.v4User.updateGlobalChannelSettings({
   *   channelConcurrencesEnabled: 'Y',
   *   donateEnabled: 'N',
   *   coverImgType: 'contain',
   * });
   * ```
   */
  async updateGlobalChannelSettings(params: UpdateGlobalChannelSettingsParams): Promise<void> {
    this.validateGlobalSettingsParams(params);

    await this.client.httpClient.post(
      '/live/v4/user/global-setting/switch/update',
      params
    );
  }

  // ============================================
  // Private Validation Helpers
  // ============================================

  /**
   * Validate pagination parameters
   */
  private validatePaginationParams(params: { pageNumber: number; pageSize: number }): void {
    if (params.pageNumber === undefined || params.pageNumber === null || params.pageNumber < 1) {
      throw new PolyVValidationError('pageNumber must be >= 1', 'pageNumber', params.pageNumber);
    }
    if (params.pageSize === undefined || params.pageSize === null || params.pageSize < 1 || params.pageSize > 1000) {
      throw new PolyVValidationError('pageSize must be between 1 and 1000', 'pageSize', params.pageSize);
    }
  }

  /**
   * Validate optional pagination parameters
   */
  private validateOptionalPaginationParams(params: { pageNumber?: number; pageSize?: number }): void {
    if (params.pageNumber !== undefined && params.pageNumber !== null && params.pageNumber < 1) {
      throw new PolyVValidationError('pageNumber must be >= 1', 'pageNumber', params.pageNumber);
    }
    if (
      params.pageSize !== undefined &&
      params.pageSize !== null &&
      (params.pageSize < 1 || params.pageSize > 1000)
    ) {
      throw new PolyVValidationError('pageSize must be between 1 and 1000', 'pageSize', params.pageSize);
    }
  }

  /**
   * Validate required string parameter
   */
  private validateRequiredString(value: string | undefined, fieldName: string): void {
    if (!value || value.trim() === '') {
      throw new PolyVValidationError(`${fieldName} is required and cannot be empty`, fieldName, value);
    }
  }

  /**
   * Validate required number parameter
   */
  private validateRequiredNumber(value: number | undefined, fieldName: string): void {
    if (value === undefined || value === null) {
      throw new PolyVValidationError(`${fieldName} is required`, fieldName, value);
    }
  }

  /**
   * Validate required string or number ID parameter
   */
  private validateRequiredId(value: string | number | undefined, fieldName: string): void {
    if (value === undefined || value === null) {
      throw new PolyVValidationError(`${fieldName} is required`, fieldName, value);
    }
    if (typeof value === 'string' && value.trim() === '') {
      throw new PolyVValidationError(`${fieldName} is required and cannot be empty`, fieldName, value);
    }
  }

  /**
   * Validate non-empty array parameter
   */
  private validateNonEmptyArray(value: unknown[] | undefined, fieldName: string): void {
    if (!Array.isArray(value) || value.length === 0) {
      throw new PolyVValidationError(`${fieldName} is required and cannot be empty`, fieldName, value);
    }
  }

  /**
   * Validate required Y/N switch value
   */
  private validateYnValue(value: string | undefined, fieldName: string): void {
    if (value !== 'Y' && value !== 'N') {
      throw new PolyVValidationError(`${fieldName} must be 'Y' or 'N'`, fieldName, value);
    }
  }

  /**
   * Validate optional Y/N switch value
   */
  private validateOptionalYnValue(value: string | undefined, fieldName: string): void {
    if (value !== undefined) {
      this.validateYnValue(value, fieldName);
    }
  }

  /**
   * Validate global settings update parameters
   */
  private validateGlobalSettingsParams(params: UpdateGlobalChannelSettingsParams): void {
    const booleanFields = [
      'channelConcurrencesEnabled',
      'timelyConvertEnabled',
      'donateEnabled',
      'rebirthAutoUploadEnabled',
      'rebirthAutoConvertEnabled',
      'pptCoveredEnabled',
      'testModeButtonEnabled',
    ] as const;

    // Validate Y/N values for boolean fields
    for (const field of booleanFields) {
      const value = params[field];
      if (value !== undefined && value !== 'Y' && value !== 'N') {
        throw new PolyVValidationError(`${field} must be 'Y' or 'N'`, field, value);
      }
    }

    // Validate coverImgType
    if (params.coverImgType !== undefined) {
      if (params.coverImgType !== 'contain' && params.coverImgType !== 'cover') {
        throw new PolyVValidationError("coverImgType must be 'contain' or 'cover'", 'coverImgType', params.coverImgType);
      }
    }
  }
}
