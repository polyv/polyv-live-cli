/**
 * V4 Material Service
 *
 * Service for managing PolyV V4 Material operations.
 * Provides methods for material library and category management.
 *
 * @module services/v4/material
 */

import type { PolyVClient } from '../../client.js';
import { PolyVValidationError } from '../../errors/polyv-validation-error.js';
import type {
  ListMaterialsParams,
  ListMaterialsResponse,
  DeleteMaterialsParams,
  DeleteMaterialsResult,
  ListMaterialCategoriesParams,
  ListMaterialCategoriesResponse,
  ListMaterialLabelsParams,
  ListMaterialLabelsResponse,
  CreateMaterialLabelParams,
  UpdateMaterialLabelParams,
  DeleteMaterialLabelParams,
} from '../../types/v4-material.js';

/** Valid material types */
const VALID_MATERIAL_TYPES = ['video', 'image', 'audio', 'document'] as const;

/**
 * V4 Material Service
 *
 * Provides methods for managing material library and categories.
 */
export class V4MaterialService {
  private client: PolyVClient;

  constructor(client: PolyVClient) {
    this.client = client;
  }

  /**
   * Validate pagination parameters
   */
  private validatePagination(pageNumber?: number, pageSize?: number): void {
    if (pageNumber !== undefined && pageNumber < 1) {
      throw new PolyVValidationError('pageNumber must be >= 1', 'pageNumber');
    }
    if (pageSize !== undefined && (pageSize < 1 || pageSize > 1000)) {
      throw new PolyVValidationError('pageSize must be between 1 and 1000', 'pageSize');
    }
  }

  /**
   * Validate material type
   */
  private validateMaterialType(type: string, fieldName: string = 'type'): void {
    if (!type || !VALID_MATERIAL_TYPES.includes(type as typeof VALID_MATERIAL_TYPES[number])) {
      throw new PolyVValidationError(
        `${fieldName} must be one of: ${VALID_MATERIAL_TYPES.join(', ')}`,
        fieldName
      );
    }
  }

  /**
   * Validate material label name
   */
  private validateLabelName(name: string): void {
    if (!name || name.trim() === '') {
      throw new PolyVValidationError('name is required and cannot be empty', 'name');
    }
  }

  /**
   * Validate material label ID
   */
  private validateLabelId(id: number): void {
    if (id === undefined || id === null) {
      throw new PolyVValidationError('id is required', 'id');
    }
    if (!Number.isInteger(id) || id <= 0) {
      throw new PolyVValidationError('id must be a positive integer', 'id');
    }
  }

  // ============================================
  // AC6: Material APIs
  // ============================================

  /**
   * List materials
   *
   * Get a paginated list of materials with optional filters.
   *
   * @param params - List params with type (required), category, title filters, and pagination
   * @returns Promise resolving to paginated list of materials
   *
   * @example
   * ```typescript
   * const result = await client.v4Material.listMaterials({
   *   type: 'video',
   *   pageNumber: 1,
   *   pageSize: 20
   * });
   * console.log(result.contents[0].title, result.contents[0].url);
   * ```
   */
  async listMaterials(params: ListMaterialsParams): Promise<ListMaterialsResponse> {
    this.validatePagination(params.pageNumber, params.pageSize);
    this.validateMaterialType(params.type);

    const response = await this.client.httpClient.get<ListMaterialsResponse>(
      '/live/v4/material/list',
      { params }
    );
    return response as unknown as ListMaterialsResponse;
  }

  /**
   * Delete materials
   *
   * Delete one or more materials from the library.
   * Supports partial delete if some materials fail.
   *
   * @param params - Delete params with materialIds (required, 1-1000 items)
   * @returns Promise resolving to delete result with failed IDs
   *
   * @example
   * ```typescript
   * const result = await client.v4Material.deleteMaterials({
   *   materialIds: ['mat001', 'mat002'],
   *   allowPartialDelete: 'Y'
   * });
   * if (result.failedMaterialIds.length > 0) {
   *   console.log('Failed to delete:', result.failedMaterialIds);
   * }
   * ```
   */
  async deleteMaterials(params: DeleteMaterialsParams): Promise<DeleteMaterialsResult> {
    if (!params.materialIds || params.materialIds.length < 1 || params.materialIds.length > 1000) {
      throw new PolyVValidationError('materialIds must contain 1-1000 items', 'materialIds');
    }

    const response = await this.client.httpClient.post<DeleteMaterialsResult>(
      '/live/v4/material/delete',
      params
    );
    return response as unknown as DeleteMaterialsResult;
  }

  // ============================================
  // AC7: Material Category APIs
  // ============================================

  /**
   * List material categories
   *
   * Get the category tree for a material type.
   *
   * @param params - List params with materialType (required) and optional parentId
   * @returns Promise resolving to list of material categories
   *
   * @example
   * ```typescript
   * const result = await client.v4Material.listMaterialCategories({
   *   materialType: 'video'
   * });
   * console.log(result.contents[0].title, result.contents[0].subCount);
   * ```
   */
  async listMaterialCategories(params: ListMaterialCategoriesParams): Promise<ListMaterialCategoriesResponse> {
    this.validateMaterialType(params.materialType, 'materialType');

    const response = await this.client.httpClient.get<ListMaterialCategoriesResponse>(
      '/live/v4/material/category/list',
      { params: { materialType: params.materialType, parentId: params.parentId } }
    );
    return response as unknown as ListMaterialCategoriesResponse;
  }

  // ============================================
  // Material Label APIs
  // ============================================

  /**
   * List material labels
   *
   * @param params - Pagination and optional keyword filter
   * @returns Promise resolving to paginated material labels
   */
  async listMaterialLabels(params: ListMaterialLabelsParams): Promise<ListMaterialLabelsResponse> {
    this.validatePagination(params.pageNumber, params.pageSize);

    const response = await this.client.httpClient.get<ListMaterialLabelsResponse>(
      '/live/v4/material/label/list',
      { params }
    );
    return response as unknown as ListMaterialLabelsResponse;
  }

  /**
   * Create a material label
   *
   * @param params - Label creation params
   * @returns Promise resolving to true when created
   */
  async createMaterialLabel(params: CreateMaterialLabelParams): Promise<boolean> {
    this.validateLabelName(params.name);

    const response = await this.client.httpClient.post<boolean>(
      '/live/v4/material/label/create',
      params
    );
    return response as unknown as boolean;
  }

  /**
   * Update a material label
   *
   * @param params - Label update params
   * @returns Promise resolving to true when updated
   */
  async updateMaterialLabel(params: UpdateMaterialLabelParams): Promise<boolean> {
    this.validateLabelId(params.id);
    this.validateLabelName(params.name);

    const response = await this.client.httpClient.post<boolean>(
      '/live/v4/material/label/update',
      params
    );
    return response as unknown as boolean;
  }

  /**
   * Delete a material label
   *
   * @param params - Label deletion params
   * @returns Promise resolving to true when deleted
   */
  async deleteMaterialLabel(params: DeleteMaterialLabelParams): Promise<boolean> {
    this.validateLabelId(params.id);

    const response = await this.client.httpClient.post<boolean>(
      '/live/v4/material/label/delete',
      params
    );
    return response as unknown as boolean;
  }
}
