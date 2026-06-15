/**
 * V4 User Types
 *
 * Type definitions for V4 User APIs.
 *
 * @module types/v4-user
 */

// ============================================
// Common Types
// ============================================

/**
 * Pagination parameters
 */
export interface UserPaginationParams {
  /** Page number (>= 1) */
  pageNumber: number;
  /** Page size (1-1000) */
  pageSize: number;
}

/**
 * Paginated response
 */
export interface UserPaginatedResponse<T> {
  /** Current page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Total items */
  totalItems: number;
  /** Content list */
  contents: T[];
}

// ============================================
// AC1: Sub-account (Child Account) Types
// ============================================

/**
 * Child account status
 */
export type ChildAccountStatus = 'NORMAL' | 'FROZEN' | 'DELETE';

/**
 * Child account entity
 */
export interface ChildAccount {
  /** Sub-account user ID */
  childUserId: string;
  /** Sub-account name */
  childName: string;
  /** Sub-account email */
  childEmail: string;
  /** Description */
  description?: string;
  /** Phone number */
  telephone?: string;
  /** Status (NORMAL, FROZEN, DELETE) */
  status: ChildAccountStatus;
  /** Organization ID */
  organizationId?: number;
  /** Organization name */
  organizationName?: string;
  /** Role ID */
  roleId: number;
  /** Role name */
  roleName?: string;
  /** Created timestamp (13-digit ms) */
  createdTime: number;
}

/**
 * Parameters for creating a child account
 */
export interface CreateChildAccountParams {
  /** Sub-account email (required) */
  childEmail: string;
  /** Sub-account name (required, max 50 chars) */
  childName: string;
  /** Password (required, 8-16 chars with numbers and letters) */
  password: string;
  /** Role ID (required) */
  roleId: number;
  /** Organization ID */
  organizationId?: number;
  /** Phone number */
  telephone?: string;
  /** Description */
  description?: string;
}

/**
 * Parameters for listing child accounts
 */
export interface ListChildAccountsParams extends UserPaginationParams {
  /** Filter by email */
  childEmail?: string;
}

/**
 * Response for listing child accounts
 */
export interface ListChildAccountsResponse extends UserPaginatedResponse<ChildAccount> {}

/**
 * Parameters for getting a child account
 */
export interface GetChildAccountParams {
  /** Child user ID */
  childUserId: string;
}

/**
 * Parameters for updating a child account
 */
export interface UpdateChildAccountParams {
  /** Child user ID (required) */
  childUserId: string;
  /** Sub-account name */
  childName?: string;
  /** Phone number */
  telephone?: string;
  /** Description */
  description?: string;
  /** Organization ID */
  organizationId?: number;
  /** Role ID */
  roleId?: number;
}

/**
 * Parameters for deleting child accounts
 */
export interface DeleteChildAccountsParams {
  /** Array of child user IDs to delete */
  childUserIds: string[];
}

/**
 * Child account role entity
 */
export interface ChildAccountRole {
  /** Role ID */
  roleId: number;
  /** Role name */
  roleName: string;
}

/**
 * Parameters for getting child account by sale
 */
export interface GetBySaleParams {
  /** Sale identifier */
  sale: string;
}

// ============================================
// AC2: Organization Types
// ============================================

/**
 * Organization entity
 */
export interface Organization {
  /** Organization ID */
  organizationId: number;
  /** Organization name */
  organizationName: string;
}

/**
 * Parameters for creating an organization
 */
export interface CreateOrganizationParams {
  /** Organization name */
  organizationName: string;
}

/**
 * Response for creating an organization
 */
export interface CreateOrganizationResponse extends Organization {}

/**
 * Parameters for deleting an organization
 */
export interface DeleteOrganizationParams {
  /** Organization ID */
  organizationId: number;
}

/**
 * Response for listing organizations
 */
export interface ListOrganizationsResponse {
  /** Organization list */
  contents: Organization[];
}

// ============================================
// AC3: Viewer Record Types
// ============================================

/**
 * Viewer source type
 */
export type ViewerSource = 'IMPORT' | 'WX' | 'MOBILE';

/**
 * Viewer record entity
 */
export interface ViewerRecord {
  /** Viewer unique ID */
  viewerUnionId: string;
  /** Viewer nickname */
  nickname: string;
  /** Phone number */
  mobile: string;
  /** Source type */
  source?: ViewerSource;
  /** Collected name */
  name?: string;
  /** Email */
  email?: string;
  /** Address */
  area?: string;
  /** Watch duration */
  watchDuration?: number;
  /** Channel count watched */
  watchChannelCount?: number;
  /** Created timestamp */
  createTime?: number;
}

/**
 * Parameters for listing viewer records
 */
export interface ListViewerRecordsParams extends UserPaginationParams {
  /** Filter by source */
  source?: ViewerSource;
  /** Filter by mobile */
  mobile?: string;
  /** Filter by email */
  email?: string;
  /** Filter by area */
  area?: string;
}

/**
 * Response for listing viewer records
 */
export interface ListViewerRecordsResponse extends UserPaginatedResponse<ViewerRecord> {}

/**
 * Parameters for getting a viewer record
 */
export interface GetViewerRecordParams {
  /** Viewer union ID */
  viewerUnionId: string;
}

/**
 * Parameters for creating a viewer record
 */
export interface CreateViewerRecordParams {
  /** Viewer nickname (required, max 64 chars) */
  nickname: string;
  /** Phone number (required, max 20 chars) */
  mobile: string;
  /** Collected name */
  name?: string;
  /** Last collected mobile */
  lastCollectMobile?: string;
  /** Email */
  email?: string;
  /** Address */
  area?: string;
  /** Latest access IP */
  latestAccessIp?: string;
  /** Device info */
  device?: string;
  /** Follow users */
  followUsers?: string;
}

/**
 * Parameters for updating a viewer record
 */
export interface UpdateViewerRecordParams {
  /** Viewer union ID (required) */
  viewerUnionId: string;
  /** Viewer nickname */
  nickname?: string;
  /** Phone number */
  mobile?: string;
  /** Collected name */
  name?: string;
  /** Email */
  email?: string;
  /** Address */
  area?: string;
}

/**
 * Parameters for deleting a viewer record
 */
export interface DeleteViewerRecordParams {
  /** Viewer union ID */
  viewerUnionId: string;
}

/**
 * Parameters for direct auth viewer
 */
export interface DirectAuthViewerParams {
  /** Channel ID (required) */
  channelId: string;
  /** Viewer ID (required) */
  viewerId: string;
  /** Nickname (required) */
  nickname: string;
}

/**
 * External viewer item
 */
export interface ExternalViewerItem {
  /** Viewer nickname */
  nickname: string;
  /** Phone number */
  mobile: string;
  /** Name */
  name?: string;
  /** Email */
  email?: string;
  /** Area */
  area?: string;
}

/**
 * Parameters for importing external viewers
 */
export interface ImportExternalViewerParams {
  /** Array of viewers to import */
  viewers: ExternalViewerItem[];
}

// ============================================
// AC4: Viewer Label Types
// ============================================

/**
 * Viewer label entity
 */
export interface ViewerLabel {
  /** Label ID */
  labelId: number;
  /** Label name */
  labelName: string;
}

/**
 * Response for listing viewer labels
 */
export interface ListViewerLabelsResponse {
  /** Label list */
  contents: ViewerLabel[];
}

/**
 * Parameters for creating a viewer label
 */
export interface CreateViewerLabelParams {
  /** Label name */
  labelName: string;
}

/**
 * Response for creating a viewer label
 */
export interface CreateViewerLabelResponse extends ViewerLabel {}

/**
 * Parameters for updating a viewer label
 */
export interface UpdateViewerLabelParams {
  /** Label ID */
  labelId: number;
  /** Label name */
  labelName: string;
}

/**
 * Parameters for deleting a viewer label
 */
export interface DeleteViewerLabelParams {
  /** Label ID */
  labelId: number;
}

/**
 * Parameters for adding a label to viewer
 */
export interface AddViewerLabelParams {
  /** Viewer union ID */
  viewerUnionId: string;
  /** Label ID */
  labelId: number;
}

/**
 * Parameters for deleting a label from viewer
 */
export interface DeleteViewerLabelRefParams {
  /** Viewer union ID */
  viewerUnionId: string;
  /** Label ID */
  labelId: number;
}

// ============================================
// AC5: Product Types
// ============================================

/**
 * Product entity
 */
export interface Product {
  /** Product ID */
  productId: string;
  /** Product name */
  name: string;
  /** Cover image URL */
  cover?: string;
  /** Link type (10=universal, 11=multi-platform, 12=native) */
  linkType?: number;
  /** Product link */
  link?: string;
  /** Product type (normal, finance, position) */
  productType?: string;
  /** Original price */
  price?: number;
  /** Actual price */
  realPrice?: number;
  /** Product tag IDs */
  tagIds?: number[];
}

/**
 * Parameters for listing products
 */
export interface ListProductsParams extends UserPaginationParams {
  /** Keyword search */
  keyword?: string;
  /** Product type filter */
  productType?: string;
}

/**
 * Response for listing products
 */
export interface ListProductsResponse extends UserPaginatedResponse<Product> {}

/**
 * Parameters for creating a product
 */
export interface CreateProductParams {
  /** Product name (required) */
  name: string;
  /** Link type (10=universal, 11=multi-platform, 12=native) */
  linkType: number;
  /** Product link */
  link: string;
  /** Cover image URL */
  cover?: string;
  /** Product type */
  productType?: string;
  /** Original price */
  price?: number;
  /** Actual price */
  realPrice?: number;
  /** Product tag IDs */
  tagIds?: number[];
}

/**
 * Response for creating a product
 */
export interface CreateProductResponse extends Product {}

/**
 * Parameters for updating a product
 */
export interface UpdateProductParams {
  /** Product ID (required) */
  productId: string;
  /** Product name */
  name?: string;
  /** Link type */
  linkType?: number;
  /** Product link */
  link?: string;
  /** Cover image URL */
  cover?: string;
  /** Product type */
  productType?: string;
  /** Original price */
  price?: number;
  /** Actual price */
  realPrice?: number;
  /** Product tag IDs */
  tagIds?: number[];
}

/**
 * Parameters for deleting a product
 */
export interface DeleteProductParams {
  /** Product ID */
  productId: string;
}

// ============================================
// AC6: Product Tag Types
// ============================================

/**
 * Product tag entity
 */
export interface ProductTag {
  /** Tag ID */
  tagId: number;
  /** Tag name */
  tagName: string;
}

/**
 * Response for listing product tags
 */
export interface ListProductTagsResponse {
  /** Tag list */
  contents: ProductTag[];
}

/**
 * Parameters for creating a product tag
 */
export interface CreateProductTagParams {
  /** Tag name */
  tagName: string;
}

/**
 * Response for creating a product tag
 */
export interface CreateProductTagResponse extends ProductTag {}

/**
 * Parameters for updating a product tag
 */
export interface UpdateProductTagParams {
  /** Tag ID */
  tagId: number;
  /** Tag name */
  tagName: string;
}

/**
 * Parameters for deleting a product tag
 */
export interface DeleteProductTagParams {
  /** Tag ID */
  tagId: number;
}

// ============================================
// AC7: Product Order Types
// ============================================

/**
 * Product order entity
 */
export interface ProductOrder {
  /** Order ID */
  orderId: string;
  /** Product ID */
  productId: string;
  /** Status */
  status: string;
  /** Created timestamp */
  createTime?: number;
}

/**
 * Parameters for listing product orders
 */
export interface ListProductOrdersParams extends UserPaginationParams {}

/**
 * Response for listing product orders
 */
export interface ListProductOrdersResponse extends UserPaginatedResponse<ProductOrder> {}

/**
 * Parameters for getting a product order
 */
export interface GetProductOrderParams {
  /** Order ID */
  orderId: string;
}

/**
 * Parameters for batch updating order status
 */
export interface BatchUpdateOrderStatusParams {
  /** Order IDs */
  orderIds: string[];
  /** New status */
  status: string;
}

// ============================================
// AC8: Label Types
// ============================================

/**
 * Label entity
 */
export interface Label {
  /** Label ID */
  labelId: number;
  /** Label name */
  labelName: string;
}

/**
 * Response for listing labels
 */
export interface ListLabelsResponse {
  /** Label list */
  contents: Label[];
}

/**
 * Parameters for creating a label
 */
export interface CreateLabelParams {
  /** Label name */
  labelName: string;
}

/**
 * Response for creating a label
 */
export interface CreateLabelResponse extends Label {}

/**
 * Parameters for updating a label
 */
export interface UpdateLabelParams {
  /** Label ID */
  labelId: number;
  /** Label name */
  labelName: string;
}

/**
 * Parameters for deleting a label
 */
export interface DeleteLabelParams {
  /** Label ID */
  labelId: number;
}

/**
 * Parameters for adding channel label refs
 */
export interface AddChannelLabelRefsParams {
  /** Label ID */
  labelId: number;
  /** Channel IDs */
  channelIds: string[];
}

// ============================================
// AC9: Invite Sales Types
// ============================================

/**
 * Invite sale entity
 */
export interface InviteSale {
  /** Invite ID */
  inviteId: number;
  /** Nickname */
  nickname: string;
}

/**
 * Response for listing invite sales
 */
export interface ListInviteSalesResponse {
  /** Invite sales list */
  contents: InviteSale[];
}

/**
 * Parameters for adding an invite sale
 */
export interface AddInviteSaleParams {
  /** Nickname */
  nickname: string;
}

/**
 * Response for adding an invite sale
 */
export interface AddInviteSaleResponse extends InviteSale {}

/**
 * Parameters for updating an invite sale
 */
export interface UpdateInviteSaleParams {
  /** Invite ID */
  inviteId: number;
  /** Nickname */
  nickname: string;
}

/**
 * Parameters for removing an invite sale
 */
export interface RemoveInviteSaleParams {
  /** Invite ID */
  inviteId: number;
}

/**
 * Follow viewer entity
 */
export interface FollowViewer {
  /** Viewer ID */
  viewerId: string;
  /** Nickname */
  nickname: string;
}

/**
 * Parameters for listing follow viewers
 */
export interface ListFollowViewersParams {
  /** Invite ID */
  inviteId: number;
}

/**
 * Response for listing follow viewers
 */
export interface ListFollowViewersResponse {
  /** Follow viewers list */
  contents: FollowViewer[];
}

// ============================================
// AC10: Custom Field Types
// ============================================

/**
 * Custom field entity
 */
export interface CustomField {
  /** Field ID */
  fieldId: number;
  /** Field name */
  fieldName: string;
  /** Field type (text, select, etc.) */
  fieldType: string;
}

/**
 * Response for listing custom fields
 */
export interface ListCustomFieldsResponse {
  /** Custom fields list */
  contents: CustomField[];
}

/**
 * Parameters for adding a custom field
 */
export interface AddCustomFieldParams {
  /** Field name */
  fieldName: string;
  /** Field type */
  fieldType: string;
}

/**
 * Response for adding a custom field
 */
export interface AddCustomFieldResponse extends CustomField {}

/**
 * Parameters for adding a custom field value
 */
export interface AddCustomFieldValueParams {
  /** Field ID */
  fieldId: number;
  /** Viewer union ID */
  viewerUnionId: string;
  /** Field value */
  value: string;
}

// ============================================
// AC11: Template Types
// ============================================

/**
 * Donate template settings
 */
export interface DonateTemplate {
  /** Whether enabled */
  enabled: boolean;
  /** Minimum amount */
  minAmount?: number;
  /** Maximum amount */
  maxAmount?: number;
}

/**
 * Parameters for updating donate template
 */
export interface UpdateDonateTemplateParams {
  /** Whether enabled */
  enabled: boolean;
  /** Minimum amount */
  minAmount?: number;
  /** Maximum amount */
  maxAmount?: number;
}

/**
 * Marquee template settings
 */
export interface MarqueeTemplate {
  /** Whether enabled */
  enabled: boolean;
  /** Content */
  content?: string;
  /** Speed */
  speed?: number;
}

/**
 * Parameters for updating marquee template
 */
export interface UpdateMarqueeTemplateParams {
  /** Whether enabled */
  enabled: boolean;
  /** Content */
  content?: string;
  /** Speed */
  speed?: number;
}

/**
 * Role config template settings
 */
export interface RoleConfigTemplate {
  /** Roles list */
  roles: string[];
}

/**
 * Parameters for updating role config template
 */
export interface UpdateRoleConfigTemplateParams {
  /** Roles list */
  roles: string[];
}

/**
 * Playback setting
 */
export interface PlaybackSetting {
  /** Auto play */
  autoPlay?: boolean;
  /** Quality */
  quality?: string;
}

/**
 * Parameters for updating playback setting
 */
export interface UpdatePlaybackSettingParams {
  /** Auto play */
  autoPlay?: boolean;
  /** Quality */
  quality?: string;
}

/**
 * Audio moderation setting
 */
export interface AudioModerationSetting {
  /** Whether enabled */
  enabled: boolean;
  /** Moderation level */
  level?: string;
}

/**
 * Parameters for updating audio moderation setting
 */
export interface UpdateAudioModerationSettingParams {
  /** Whether enabled */
  enabled: boolean;
  /** Moderation level */
  level?: string;
}

/**
 * Video moderation setting
 */
export interface VideoModerationSetting {
  /** Whether enabled */
  enabled: boolean;
  /** Moderation level */
  level?: string;
}

/**
 * Parameters for updating video moderation setting
 */
export interface UpdateVideoModerationSettingParams {
  /** Whether enabled */
  enabled: boolean;
  /** Moderation level */
  level?: string;
}

// ============================================
// AC12: User Settings Types
// ============================================

/**
 * Callback settings
 */
export interface CallbackSettings {
  /** Callback URL */
  url?: string;
  /** Whether enabled */
  enabled?: boolean;
}

/**
 * Parameters for updating callback settings
 */
export interface UpdateCallbackParams {
  /** Callback URL */
  url?: string;
  /** Whether enabled */
  enabled?: boolean;
}

/**
 * Global switch settings
 */
export interface GlobalSwitchSettings {
  /** Chat enabled */
  chatEnabled?: boolean;
  /** Danmu enabled */
  danmuEnabled?: boolean;
}

/**
 * Parameters for updating global switch settings
 */
export interface UpdateGlobalSwitchParams {
  /** Chat enabled */
  chatEnabled?: boolean;
  /** Danmu enabled */
  danmuEnabled?: boolean;
}

/**
 * Global footer settings
 */
export interface GlobalFooterSettings {
  /** Whether enabled */
  enabled?: boolean;
  /** Footer content */
  content?: string;
}

/**
 * Parameters for updating global footer settings
 */
export interface UpdateGlobalFooterParams {
  /** Whether enabled */
  enabled?: boolean;
  /** Footer content */
  content?: string;
}

/**
 * PV show enable settings
 */
export interface PvShowEnableSettings {
  /** Whether enabled */
  enabled?: boolean;
}

/**
 * Parameters for updating PV show enable settings
 */
export interface UpdatePvShowEnableParams {
  /** Whether enabled */
  enabled?: boolean;
}

// ============================================
// AC13: Other User Types
// ============================================

/**
 * Parameters for getting mic duration
 */
export interface GetMicDurationParams {
  /** Channel ID */
  channelId: string;
  /** Session ID */
  sessionId: string;
}

/**
 * Mic duration response
 */
export interface MicDurationResponse {
  /** Duration */
  duration: number;
  /** Unit */
  unit?: string;
}

/**
 * MR concurrency detail response
 */
export interface MrConcurrencyDetailResponse {
  /** Current concurrency */
  current: number;
  /** Max concurrency */
  max: number;
  /** Peak concurrency */
  peak: number;
}

/**
 * Parameters for sending SMS
 */
export interface SendSmsParams {
  /** Mobile number */
  mobile: string;
  /** SMS content */
  content: string;
}

/**
 * Parameters for getting bill use detail list
 */
export interface GetBillUseDetailListParams {
  /** Start date (YYYY-MM-DD) */
  startDate: string;
  /** End date (YYYY-MM-DD) */
  endDate: string;
}

/**
 * Bill use detail item
 */
export interface BillUseDetailItem {
  /** Bill ID */
  billId: number;
  /** Type */
  type: string;
  /** Amount */
  amount: number;
  /** Created timestamp */
  createTime: number;
}

/**
 * Response for getting bill use detail list
 */
export interface GetBillUseDetailListResponse {
  /** Bill use details list */
  contents: BillUseDetailItem[];
}

/**
 * Parameters for viewer lottery win
 */
export interface ViewerLotteryWinParams {
  /** Lottery ID */
  lotteryId: number;
  /** Viewer ID */
  viewerId: string;
}

/**
 * Viewer lottery win response
 */
export interface ViewerLotteryWinResponse {
  /** Lottery ID */
  lotteryId: number;
  /** Prize */
  prize?: string;
  /** Status */
  status?: string;
}

/**
 * Parameters for getting watch log detail
 */
export interface GetWatchLogDetailParams {
  /** Log ID */
  logId: number;
}

/**
 * Watch log detail response
 */
export interface WatchLogDetailResponse {
  /** Log ID */
  logId: number;
  /** Viewer ID */
  viewerId: string;
  /** Duration */
  duration: number;
  /** Start time */
  startTime: number;
}

/**
 * Parameters for getting watch log list
 */
export interface GetWatchLogListParams extends UserPaginationParams {}

// ============================================
// AC14: Global Channel Settings Types
// ============================================

/**
 * Global channel settings response
 */
export interface GlobalChannelSettings {
  /** Max concurrent viewers switch (Y/N) */
  channelConcurrencesEnabled?: string;
  /** Auto convert switch (Y/N) */
  timelyConvertEnabled?: string;
  /** Donation switch (Y/N) */
  donateEnabled?: string;
  /** Rebirth PPT auto-upload switch (Y/N) */
  rebirthAutoUploadEnabled?: string;
  /** Rebirth auto-convert switch (Y/N) */
  rebirthAutoConvertEnabled?: string;
  /** PPT full-screen switch (Y/N) */
  pptCoveredEnabled?: string;
  /** Player cover type (contain/cover) */
  coverImgType?: string;
  /** Test mode button switch (Y/N) */
  testModeButtonEnabled?: string;
}

/**
 * Parameters for updating global channel settings
 */
export interface UpdateGlobalChannelSettingsParams {
  /** Max concurrent viewers switch (Y/N) */
  channelConcurrencesEnabled?: string;
  /** Auto convert switch (Y/N) */
  timelyConvertEnabled?: string;
  /** Donation switch (Y/N) */
  donateEnabled?: string;
  /** Rebirth PPT auto-upload switch (Y/N) */
  rebirthAutoUploadEnabled?: string;
  /** Rebirth auto-convert switch (Y/N) */
  rebirthAutoConvertEnabled?: string;
  /** PPT full-screen switch (Y/N) */
  pptCoveredEnabled?: string;
  /** Player cover type (contain/cover) */
  coverImgType?: string;
  /** Test mode button switch (Y/N) */
  testModeButtonEnabled?: string;
}

/**
 * Watch log item
 */
export interface WatchLogItem {
  /** Log ID */
  logId: number;
  /** Viewer ID */
  viewerId: string;
  /** Channel ID */
  channelId: string;
  /** Duration */
  duration: number;
}

/**
 * Response for getting watch log list
 */
export interface GetWatchLogListResponse extends UserPaginatedResponse<WatchLogItem> {}
