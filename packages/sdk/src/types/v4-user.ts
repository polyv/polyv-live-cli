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
  id: number;
  /** Role name */
  name: string;
  /** Role description */
  description?: string;
  /** Comma-separated permission names */
  permissionName?: string;
}

/**
 * Parameters for getting child account by sale
 */
export interface GetBySaleParams {
  /** Sale ID. Required when saleCode is omitted. */
  saleId?: string;
  /** Sale invitation code. Required when saleId is omitted. */
  saleCode?: string;
}

/**
 * Invite customer sale account information
 */
export interface InviteCustomerInfo {
  /** PolyV user ID */
  userId?: string;
  /** Child account user ID */
  childUserId?: string;
  /** Child account name */
  childName?: string;
  /** Child account email */
  childEmail?: string;
  /** Child account avatar */
  avatar?: string;
  /** Child account telephone */
  telephone?: string;
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
  /** External viewer ID */
  externalViewerId: string;
  /** Viewer label IDs */
  labelIds?: Array<string | number>;
  /** Follow user info */
  followUsers?: ViewerFollowUser;
}

/**
 * Viewer follow user info
 */
export interface ViewerFollowUser {
  /** Follow user ID */
  userId: string;
  /** Follow user type, defaults to wxwork */
  type?: string;
}

/**
 * Parameters for importing external viewers
 */
export type ImportExternalViewerParams = ExternalViewerItem[];

/**
 * Imported external viewer item
 */
export interface ImportedExternalViewer {
  /** Viewer union ID */
  viewerUnionId: string;
  /** Viewer nickname */
  nickname: string;
  /** External viewer ID */
  externalViewerId: string;
  /** Viewer source */
  source?: ViewerSource;
  /** Latest auth timestamp */
  latestAuthTime?: number;
  /** Created timestamp */
  createTime?: number;
}

/**
 * Response for importing external viewers
 */
export type ImportExternalViewerResponse = ImportedExternalViewer[];

/**
 * Y/N switch value
 */
export type UserSwitchValue = 'Y' | 'N';

/**
 * Tourist external auth link config
 */
export interface TouristExternalHrefConfig {
  pcLink?: string;
  mobileLink?: string;
  androidLink?: string;
  iosLink?: string;
  otherLink?: string;
  wxMiniprogramLink?: string;
  wxMiniprogramOriginalId?: string;
  wxMiniprogramAppId?: string;
  mobileAppLink?: string;
  harmonyLink?: string;
  jumpWay?: string;
}

/**
 * Parameters for updating viewer user system config
 */
export interface UpdateViewerUserSystemConfigParams {
  /** Mobile login switch */
  mobileLoginEnabled: UserSwitchValue;
  /** WeCom login switch */
  wxWorkLoginEnabled: UserSwitchValue;
  /** WeChat auth validity period in days, 0-180 */
  viewerWeixinAuthExpired?: number;
  /** Collect mobile switch */
  collectMobileEnabled?: UserSwitchValue;
  /** Guest mode switch */
  guestModeEnabled?: UserSwitchValue;
  /** Tourist external login switch */
  touristExternalHrefEnabled?: UserSwitchValue;
  /** Tourist external login link config */
  touristExternalHrefConfig?: TouristExternalHrefConfig;
}

// ============================================
// AC4: Viewer Label Types
// ============================================

/**
 * Viewer label entity
 */
export interface ViewerLabel {
  /** Label ID */
  id: string | number;
  /** Label name */
  label: string;
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
  /** Label names */
  labels: string[];
}

/**
 * Response for creating a viewer label
 */
export type CreateViewerLabelResponse = ViewerLabel[];

/**
 * Parameters for updating a viewer label
 */
export interface UpdateViewerLabelParams {
  /** Label ID */
  id: string | number;
  /** Label name */
  label?: string;
}

/**
 * Parameters for deleting a viewer label
 */
export interface DeleteViewerLabelParams {
  /** Label ID */
  id: string | number;
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
  /** PC link */
  pcLink?: string;
  /** Mobile link */
  mobileLink?: string;
  /** WeChat mini program original ID */
  wxMiniprogramOriginalId?: string;
  /** WeChat mini program link */
  wxMiniprogramLink?: string;
  /** Mobile app link */
  mobileAppLink?: string;
  /** iOS link */
  iosLink?: string;
  /** Android link */
  androidLink?: string;
  /** Other platform link */
  otherLink?: string;
  /** Product features as a JSON array string */
  features?: string;
  /** Original price */
  price?: number;
  /** Actual price */
  realPrice?: number;
  /** Actual price type */
  priceType?: string;
  /** Custom actual price */
  customPrice?: string;
  /** Original price type */
  originalPriceType?: string;
  /** Custom original price */
  customOriginalPrice?: string;
  /** API typo preserved for compatibility with the source document */
  customOrignalPrice?: string;
  /** Product tag IDs */
  tagIds?: number[];
  /** Button label */
  btnShow?: string;
  /** Product description */
  productDesc?: string;
  /** Product detail */
  productDetail?: string;
  /** Extended product information as a JSON object string */
  ext?: string;
  /** Product rank */
  rank?: number;
  /** Legacy type field returned by some APIs */
  type?: string;
  /** Extra returned params */
  params?: unknown;
  /** Yield/rate for finance products */
  yield?: string | number | null;
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
  /** PC link */
  pcLink?: string;
  /** Mobile link */
  mobileLink?: string;
  /** WeChat mini program original ID */
  wxMiniprogramOriginalId?: string;
  /** WeChat mini program link */
  wxMiniprogramLink?: string;
  /** Mobile app link */
  mobileAppLink?: string;
  /** iOS link */
  iosLink?: string;
  /** Android link */
  androidLink?: string;
  /** Other platform link */
  otherLink?: string;
  /** Product features as a JSON array string */
  features?: string;
  /** Original price */
  price?: number;
  /** Actual price */
  realPrice?: number;
  /** Actual price type */
  priceType?: string;
  /** Custom actual price */
  customPrice?: string;
  /** Original price type */
  originalPriceType?: string;
  /** Custom original price */
  customOriginalPrice?: string;
  /** API typo preserved for compatibility with the source document */
  customOrignalPrice?: string;
  /** Product tag IDs */
  tagIds?: number[];
  /** Button label */
  btnShow?: string;
  /** Product description */
  productDesc?: string;
  /** Product detail */
  productDetail?: string;
  /** Extended product information as a JSON object string */
  ext?: string;
}

/**
 * Response for creating a product
 */
export type CreateProductResponse = string | null;

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
  /** PC link */
  pcLink?: string;
  /** Mobile link */
  mobileLink?: string;
  /** WeChat mini program original ID */
  wxMiniprogramOriginalId?: string;
  /** WeChat mini program link */
  wxMiniprogramLink?: string;
  /** Mobile app link */
  mobileAppLink?: string;
  /** iOS link */
  iosLink?: string;
  /** Android link */
  androidLink?: string;
  /** Other platform link */
  otherLink?: string;
  /** Product features as a JSON array string */
  features?: string;
  /** Original price */
  price?: number;
  /** Actual price */
  realPrice?: number;
  /** Actual price type */
  priceType?: string;
  /** Custom actual price */
  customPrice?: string;
  /** Original price type */
  originalPriceType?: string;
  /** Custom original price */
  customOriginalPrice?: string;
  /** API typo preserved for compatibility with the source document */
  customOrignalPrice?: string;
  /** Product tag IDs */
  tagIds?: number[];
  /** Button label */
  btnShow?: string;
  /** Product description */
  productDesc?: string;
  /** Product detail */
  productDetail?: string;
  /** Extended product information as a JSON object string */
  ext?: string;
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
  id: number;
  /** Tag name */
  name: string;
  /** Legacy alias for tag ID */
  tagId?: number;
  /** Legacy alias for tag name */
  tagName?: string;
  /** Tag type */
  type?: string;
  /** Number of linked products */
  productCount?: number;
  /** Created timestamp */
  createTime?: string | number;
  /** Updated timestamp */
  updateTime?: string | number | null;
}

/**
 * Parameters for listing product tags
 */
export interface ListProductTagsParams extends UserPaginationParams {
  /** Channel ID */
  channelId: string | number;
  /** Keyword search */
  keyword?: string;
}

/**
 * Response for listing product tags
 */
export interface ListProductTagsResponse extends UserPaginatedResponse<ProductTag> {}

/**
 * Parameters for creating a product tag
 */
export interface CreateProductTagParams {
  /** Tag name */
  name?: string;
  /** Legacy alias for tag name */
  tagName?: string;
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
  id?: number;
  /** Tag name */
  name?: string;
  /** Legacy alias for tag ID */
  tagId?: number;
  /** Legacy alias for tag name */
  tagName?: string;
}

/**
 * Parameters for deleting a product tag
 */
export interface DeleteProductTagParams {
  /** Tag ID */
  id?: number;
  /** Legacy alias for tag ID */
  tagId?: number;
}

// ============================================
// AC7: Product Order Types
// ============================================

/**
 * Product order entity
 */
export interface ProductOrder {
  /** Order number */
  orderNo: string;
  /** Channel ID */
  channelId?: number;
  /** Viewer ID */
  viewerId?: string;
  /** Viewer nickname */
  viewerNickName?: string;
  /** WeChat transaction ID */
  transactionId?: string;
  /** Order amount */
  amount?: number;
  /** Whether express delivery is enabled */
  expressEnabled?: string;
  /** Status */
  status: string;
  /** Created timestamp */
  createTime?: number;
  /** Paid timestamp */
  payTime?: number;
  /** Delivery timestamp */
  deliveryTime?: number;
  /** Finish timestamp */
  finishTime?: number;
  /** Shipping address */
  addressExt?: ProductOrderAddress;
  /** Ordered products */
  products?: ProductOrderProduct[];
}

/**
 * Product order address
 */
export interface ProductOrderAddress {
  /** Mobile phone number */
  mobile?: string;
  /** Receiver name */
  name?: string;
  /** Province/city/area */
  area?: string;
  /** Detailed address */
  address?: string;
}

/**
 * Product item in an order
 */
export interface ProductOrderProduct {
  /** Product snapshot ID */
  productSnapshotId?: number;
  /** Product amount */
  amount?: number;
  /** Quantity */
  quantity?: number;
  /** Total amount */
  totalAmount?: number;
  /** Product name */
  productName?: string;
  /** Product cover image */
  productCover?: string;
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
  /** Order number */
  orderNo: string;
}

/**
 * Parameters for batch updating order status
 */
export interface BatchUpdateOrderStatusParams {
  /** Order numbers, maximum 1000 */
  orderNos: string[];
  /** New status */
  status: string;
}

/**
 * Failed order status update result
 */
export interface BatchUpdateOrderStatusFailOrder {
  /** Order number */
  orderNo: string;
  /** Error code */
  errCode: number;
  /** Error message */
  errMsg: string;
}

/**
 * Response for batch updating order status
 */
export interface BatchUpdateOrderStatusResponse {
  /** Successfully updated order numbers */
  successOrderNos?: string[];
  /** Failed order updates */
  failOrderList?: BatchUpdateOrderStatusFailOrder[];
}

// ============================================
// AC8: Label Types
// ============================================

/**
 * Label entity
 */
export interface Label {
  /** Label ID */
  id: string;
  /** Label name */
  name: string;
}

/**
 * Parameters for listing labels
 */
export interface ListLabelsParams extends UserPaginationParams {}

/**
 * Response for listing labels
 */
export interface ListLabelsResponse extends UserPaginatedResponse<Label> {}

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
  labelId: string;
  /** Label name */
  labelName: string;
}

/**
 * Parameters for deleting a label
 */
export interface DeleteLabelParams {
  /** Label ID */
  labelId: string;
}

/**
 * Parameters for adding channel label refs
 */
export interface AddChannelLabelRefsParams {
  /** Label IDs */
  labelIds: string[];
  /** Channel IDs */
  channelIds: Array<string | number>;
}

// ============================================
// AC9: Invite Sales Types
// ============================================

/**
 * Invite sale entity
 */
export interface InviteSale {
  /** Invite sale user ID */
  viewerUnionId: string;
  /** Nickname */
  nickname: string;
  /** WeChat nickname */
  wxNickName?: string | null;
  /** WeChat avatar */
  wxAvatar?: string | null;
  /** Mobile phone number */
  mobile?: string | null;
  /** Source */
  inviteSalesSource?: string;
  /** Granted timestamp */
  inviteSalesGrantedTime?: number;
  /** Organization ID */
  organizationId?: number;
  /** Organization name */
  organizationName?: string;
  /** Whether the user is an invite sales admin */
  inviteSalesAdmin?: string;
  /** Bound customer count */
  customerNum?: number;
}

/**
 * Parameters for listing invite sales
 */
export interface ListInviteSalesParams {
  /** Invite sale user ID, exact match */
  viewerUnionId?: string;
  /** Mobile phone number, exact match */
  mobile?: string;
  /** Nickname keyword */
  keyword?: string;
  /** Organization ID */
  organizationId?: number;
  /** Page size */
  pageSize?: number;
  /** Page number */
  pageNumber?: number;
}

/**
 * Response for listing invite sales
 */
export interface ListInviteSalesResponse extends UserPaginatedResponse<InviteSale> {}

/**
 * Parameters for adding an invite sale
 */
export interface AddInviteSaleParams {
  /** User IDs to add as invite sales, maximum 200 */
  viewerUnionIds: string[];
  /** Organization ID, defaults to headquarters when omitted */
  organizationId?: number;
}

/**
 * Response for adding an invite sale
 */
export type AddInviteSaleResponse = void;

/**
 * Parameters for updating an invite sale
 */
export interface UpdateInviteSaleParams {
  /** Invite sale user IDs to update, maximum 200 */
  viewerUnionIds: string[];
  /** Organization ID */
  organizationId: number;
}

/**
 * Response for updating invite sales
 */
export type UpdateInviteSaleResponse = void;

/**
 * Parameters for removing an invite sale
 */
export interface RemoveInviteSaleParams {
  /** Invite sale user IDs to remove, maximum 100 */
  viewerUnionIds: string[];
  /** New invite sale user ID to receive followed viewers */
  newViewerUnionId?: string;
  /** Legacy/example field accepted by the API documentation examples */
  followViewersToNewViewerUnionId?: string;
}

/**
 * Response for removing invite sales
 */
export type RemoveInviteSaleResponse = void;

/**
 * Follow viewer entity
 */
export interface FollowViewer {
  /** Invite sale user ID */
  inviteCustomerId: string;
  /** Invite sale nickname */
  inviteCustomerNickname?: string;
  /** Viewer ID */
  viewerId: string;
  /** Nickname */
  nickname: string;
  /** Viewer phone number */
  telephone?: string;
  /** Follow status: 0=pending, 1=bound, 2=unbound */
  followStatus?: number;
  /** Follow timestamp */
  followTime?: number;
}

/**
 * Parameters for listing follow viewers
 */
export interface ListFollowViewersParams {
  /** Invite sale user ID, exact match */
  inviteCustomerId?: string;
  /** Invite sale nickname keyword */
  inviteCustomerNickname?: string;
  /** Viewer ID, exact match */
  viewerId?: string;
  /** Viewer nickname keyword */
  username?: string;
  /** Viewer phone number, exact match */
  telephone?: string;
  /** Follow statuses joined by commas, e.g. "0,1" */
  followStatusList?: string;
  /** Page size */
  pageSize?: number;
  /** Page number */
  pageNumber?: number;
}

/**
 * Response for listing follow viewers
 */
export interface ListFollowViewersResponse extends UserPaginatedResponse<FollowViewer> {}

// ============================================
// AC10: Custom Field Types
// ============================================

/**
 * Custom field entity
 */
export interface CustomField {
  /** Field ID */
  customFieldId: string;
  /** Field name */
  customFieldName: string;
  /** Field type (text, select, etc.) */
  customFieldType: string;
}

/**
 * Response for listing custom fields
 */
export type ListCustomFieldsResponse = CustomField[];

/**
 * Parameters for adding a custom field
 */
export interface AddCustomFieldParams {
  /** Custom field ID, maximum 64 characters */
  customFieldId: string;
  /** Custom field name, maximum 64 characters */
  customFieldName: string;
  /** Custom field type, such as text, image, or link */
  customFieldType: string;
}

/**
 * Response for adding a custom field
 */
export type AddCustomFieldResponse = void;

/**
 * Viewer custom field value
 */
export interface CustomFieldViewerValue {
  /** Viewer ID */
  viewerId: string;
  /** Custom field ID */
  customFieldId: string;
  /** Custom field value */
  customFieldValue: string;
}

/**
 * Parameters for adding a custom field value
 */
export type AddCustomFieldValueParams = CustomFieldViewerValue[];

/**
 * Response for adding custom field viewer values
 */
export type AddCustomFieldValueResponse = void;

// ============================================
// AC11: Template Types
// ============================================

/**
 * Donate template settings
 */
export interface DonateTemplate {
  /** Cash donate switch */
  donateCashEnabled?: UserSwitchValue;
  /** Cash donate settings */
  cashDonate?: TemplateCashDonate;
  /** Gift donate switch */
  donateGiftEnabled?: UserSwitchValue;
  /** Gift donate settings */
  giftDonate?: TemplateGiftDonate;
}

/**
 * Cash donate settings
 */
export interface TemplateCashDonate {
  /** Fixed donate amounts */
  cashs?: number[];
  /** Minimum custom donate amount */
  cashMin?: number;
}

/**
 * Gift donate settings
 */
export interface TemplateGiftDonate {
  /** Pay way */
  payWay?: 'CASH' | 'POINT' | string;
  /** Cash unit */
  cashUnit?: string | null;
  /** Point unit */
  pointUnit?: string | null;
  /** Cash pay gifts */
  cashPays?: GiftDonate[];
  /** Point pay gifts */
  pointPays?: GiftDonate[];
}

/**
 * Gift donate item
 */
export interface GiftDonate {
  /** Gift name */
  name?: string;
  /** Gift image URL */
  img: string;
  /** Dynamic thumbnail URL */
  dynamicImg?: string | null;
  /** Dynamic file URL */
  dynamicFile?: string | null;
  /** Gift price */
  price?: number;
  /** Gift sequence */
  sequence?: number;
  /** Gift switch */
  enabled?: UserSwitchValue;
  /** Gift unit */
  unit?: string | null;
  /** Image type */
  imgType?: 'STATIC' | 'DYNAMIC' | string | null;
}

/**
 * Parameters for updating donate template
 */
export interface UpdateDonateTemplateParams {
  /** Gift donate switch */
  donateGiftEnabled: UserSwitchValue;
  /** Gift donate settings */
  giftDonate?: TemplateGiftDonate;
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
  playbackEnabled?: UserSwitchValue;
  type?: 'single' | 'list' | string;
  origin?: 'record' | 'playback' | 'vod' | string;
  sectionEnabled?: UserSwitchValue;
  chatPlaybackEnabled?: UserSwitchValue;
  playbackMultiplierEnabled?: UserSwitchValue;
  playbackProgressBarEnabled?: UserSwitchValue;
  playbackProgressBarOperationType?: 'drag' | 'prohibitDrag' | 'dragHistoryOnly' | string;
  showPlayButtonEnabled?: UserSwitchValue;
  productPlaybackEnabled?: UserSwitchValue;
  questionnairePlaybackEnabled?: UserSwitchValue;
  qaPlaybackEnabled?: UserSwitchValue;
  cardPushPlaybackEnabled?: UserSwitchValue;
  checkInPlaybackEnabled?: UserSwitchValue;
}

/**
 * Parameters for updating playback setting
 */
export interface UpdatePlaybackSettingParams {
  playbackEnabled?: UserSwitchValue;
  type?: 'single' | 'list' | string;
  origin?: 'record' | 'playback' | 'vod' | string;
  sectionEnabled?: UserSwitchValue;
  playbackMultiplierEnabled?: UserSwitchValue;
  playbackProgressBarEnabled?: UserSwitchValue;
  playbackProgressBarOperationType?: 'drag' | 'prohibitDrag' | 'dragHistoryOnly' | string;
  showPlayButtonEnabled?: UserSwitchValue;
  chatPlaybackEnabled?: UserSwitchValue;
  productPlaybackEnabled?: UserSwitchValue;
  questionnairePlaybackEnabled?: UserSwitchValue;
  qaPlaybackEnabled?: UserSwitchValue;
  cardPushPlaybackEnabled?: UserSwitchValue;
  checkInPlaybackEnabled?: UserSwitchValue;
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
  recordCallbackUrl?: string;
  recordFileCallBackType?: 'all' | 'last' | string;
  recordCallbackVideoType?: 'm3u8' | 'mp4' | 'm3u8,mp4' | string;
  playbackCallbackUrl?: string;
  rebirthVodCallbackEnabled?: UserSwitchValue;
  pptRecordCallbackUrl?: string;
  streamCallbackUrl?: string;
  channelBasicUpdateCallbackUrl?: string;
  liveScanCallbackUrl?: string;
  chatUserStatusCallbackUrl?: string;
  interactionCallbackUrl?: string;
  playbackCacheCallbackUrl?: string;
  playbackSettingCallbackUrl?: string;
  aiPptVideoCallbackUrl?: string;
  liveViolationCutoffCallbackUrl?: string;
  liveStatsCallbackUrl?: string;
}

/**
 * Parameters for updating callback settings
 */
export interface UpdateCallbackParams {
  recordCallbackUrl?: string;
  recordFileCallBackType?: 'all' | 'last' | string;
  recordCallbackVideoType?: 'm3u8' | 'mp4' | 'm3u8,mp4' | string;
  playbackCallbackUrl?: string;
  rebirthVodCallbackEnabled?: UserSwitchValue;
  pptRecordCallbackUrl?: string;
  streamCallbackUrl?: string;
  channelBasicUpdateCallbackUrl?: string;
  liveScanCallbackUrl?: string;
  playbackCacheCallbackUrl?: string;
  aiPptVideoCallbackUrl?: string;
  liveViolationCutoffCallbackUrl?: string;
  liveStatsCallbackUrl?: string;
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
  /** PolyV user ID */
  userId?: string;
  /** Footer switch */
  showFooterEnabled?: UserSwitchValue;
  /** Footer text */
  footerText?: string;
  /** Footer link protocol */
  footTextLinkProtocol?: 'http://' | 'https://' | string;
  /** Footer link URL without protocol */
  footTextLinkUrl?: string;
}

/**
 * Parameters for updating global footer settings
 */
export interface UpdateGlobalFooterParams {
  showFooterEnabled?: UserSwitchValue;
  footerText?: string;
  footTextLinkProtocol?: 'http://' | 'https://' | string;
  footTextLinkUrl?: string;
}

/**
 * PV show enable settings
 */
export interface PvShowEnableSettings {
  /** PV show switch */
  enabled?: UserSwitchValue;
}

/**
 * Parameters for updating PV show enable settings
 */
export interface UpdatePvShowEnableParams {
  /** PV show switch */
  enabled: UserSwitchValue;
}

// ============================================
// AC13: Other User Types
// ============================================

/**
 * Parameters for getting mic duration
 */
export interface GetMicDurationParams {
  /** Start timestamp in milliseconds */
  startTime?: number;
  /** End timestamp in milliseconds */
  endTime?: number;
}

/**
 * Mic duration response
 */
export interface MicDurationResponse {
  /** User ID */
  userId: string;
  /** Used mic minutes */
  history: number;
}

/**
 * MR concurrency detail response
 */
export interface MrConcurrencyDetailResponse {
  /** Total MR concurrency */
  mrLiveConcurrency: number;
  /** Currently used concurrency */
  usedCount: number;
  /** Residual concurrency */
  residualConcurrency: number;
  /** Channel IDs occupying concurrency */
  channelIds: string[];
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
  /** Billing item category */
  itemCategory: string;
  /** Start date (YYYY-MM-DD) */
  startDate: string;
  /** End date (YYYY-MM-DD) */
  endDate: string;
  /** Channel ID */
  channelId?: string;
  /** Page number */
  pageNumber?: number;
  /** Page size */
  pageSize?: number;
}

/**
 * Bill use detail item
 */
export interface BillUseDetailItem {
  channelId?: number;
  consumeUnit?: string;
  consumed?: number;
  endTime?: string;
  itemCategory?: string;
  itemName?: string;
  production?: string;
  recordId?: string;
  remark?: string;
  sessionId?: string;
  avgBitRate?: string;
  startTime?: string;
  statDate?: string;
}

/**
 * Response for getting bill use detail list
 */
export interface GetBillUseDetailListResponse {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  contents: BillUseDetailItem[];
}

/**
 * Parameters for listing viewer lottery wins
 */
export interface ViewerLotteryWinParams extends UserPaginationParams {
  /** Viewer ID */
  viewerId: string;
}

/**
 * Viewer lottery win item
 */
export interface ViewerLotteryWinItem {
  /** Channel ID */
  channelId?: number;
  /** Channel name */
  channelName?: string;
  /** Session ID */
  sessionId?: string;
  /** Receive info JSON string */
  collectInfo?: string;
  /** Accept type */
  acceptType?: string;
  /** Lottery ID */
  lotteryId?: string;
  /** Prize name */
  prize?: string;
  /** Whether prize was received */
  received?: boolean;
  /** Winner code */
  winnerCode?: string;
  /** Activity name */
  activityName?: string;
  /** Win timestamp */
  createdTime?: number;
  /** Last modified timestamp */
  lastModified?: number;
  /** Whether receive info collection is enabled */
  receiveEnabled?: boolean;
}

/**
 * Response for listing viewer lottery wins
 */
export interface ViewerLotteryWinResponse extends UserPaginatedResponse<ViewerLotteryWinItem> {}

/**
 * Parameters for getting watch log detail
 */
export interface GetWatchLogDetailParams {
  /** Viewer ID */
  viewerId: string;
  /** Start date (YYYY-MM-DD) */
  startDate?: string;
  /** End date (YYYY-MM-DD) */
  endDate?: string;
  /** Page number */
  pageNumber?: number;
  /** Page size */
  pageSize?: number;
}

/**
 * Watch log detail item
 */
export interface WatchLogDetailItem {
  area?: string;
  browser?: string;
  ip?: string;
  nick?: string;
  playDuration?: string;
  channelId?: number;
  sessionId?: string;
  startTime?: string | number;
  viewType?: string;
  /** Viewer ID */
  viewerId: string;
  param4?: string;
  param5?: string;
}

/**
 * Watch log detail response
 */
export interface WatchLogDetailResponse extends UserPaginatedResponse<WatchLogDetailItem> {}

/**
 * Parameters for getting watch log list
 */
export interface GetWatchLogListParams {
  /** Start date (YYYY-MM-DD) */
  startDate?: string;
  /** End date (YYYY-MM-DD) */
  endDate?: string;
  /** Page number */
  pageNumber?: number;
  /** Page size */
  pageSize?: number;
  /** Viewer ID */
  viewerId?: string;
  /** Channel ID */
  channelId?: number;
}

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
  avgDuration?: string;
  nick?: string;
  totalDuration?: string;
  viewCount?: number;
  /** Viewer ID */
  viewerId: string;
  param4?: string;
  param5?: string;
}

/**
 * Response for getting watch log list
 */
export interface GetWatchLogListResponse extends UserPaginatedResponse<WatchLogItem> {}
