/**
 * Category (分类) endpoints.
 *
 * @module services/category
 */

import type { PolyVVodClient } from '../client.js';
import { PolyVVodError } from '../errors/index.js';
import type {
  AddCategoryParams,
  AddCategoryResult,
  CategoryNode,
  MoveCategoryParams,
  UpdateCategorySettingParams
} from '../types/category.js';

const CATEGORY_PATH = '/v2/video/{userid}';

function requireCataId(cataId: string | number | undefined): string | number {
  if (cataId === undefined || cataId === null || cataId === '') {
    throw new PolyVVodError('validation', 'cataId is required');
  }
  return cataId;
}

export class CategoryService {
  constructor(private readonly client: PolyVVodClient) {}

  /** The category tree below `cataId` (`1`, the root, by default). */
  async getCategories(cataId: string | number = 1): Promise<CategoryNode[]> {
    return this.client.request({
      method: 'GET',
      path: `${CATEGORY_PATH}/cataJson`,
      // `cataid` is sent but does not take part in the signature.
      auth: { scheme: 'sha1', keys: ['userid', 'ptime'] },
      params: { cataid: requireCataId(cataId) }
    });
  }

  async addCategory(params: AddCategoryParams): Promise<AddCategoryResult> {
    const name = params.cataname?.trim();
    if (!name) throw new PolyVVodError('validation', 'cataname is required');
    if (name.length > 40) throw new PolyVVodError('validation', 'cataname must not exceed 40 characters');
    return this.client.request({
      method: 'POST',
      path: `${CATEGORY_PATH}/addCata`,
      params: { cataname: name, parentid: requireCataId(params.parentid) },
      idempotent: false
    });
  }

  async renameCategory(params: { cataid: string | number; cataname: string }): Promise<unknown> {
    const name = params.cataname?.trim();
    if (!name) throw new PolyVVodError('validation', 'cataname is required');
    return this.client.request({
      method: 'POST',
      path: `${CATEGORY_PATH}/updateCata`,
      auth: { scheme: 'sha1', keys: ['userid', 'cataname', 'cataid', 'ptime'] },
      params: { cataid: requireCataId(params.cataid), cataname: name },
      idempotent: false
    });
  }

  /** Settings of a top-level category; they apply to videos uploaded afterwards. */
  async updateCategorySetting(params: UpdateCategorySettingParams): Promise<unknown> {
    const yn = (value: boolean | undefined): string | undefined => (value === undefined ? undefined : value ? 'Y' : 'N');
    return this.client.request({
      method: 'POST',
      path: `${CATEGORY_PATH}/updateCataProfile`,
      params: {
        cataid: requireCataId(params.cataid),
        isSettings: yn(params.isSettings),
        keepSource: params.keepSource === undefined ? undefined : params.keepSource ? 1 : 0,
        encrypt: params.encrypt === undefined ? undefined : params.encrypt ? 1 : 0,
        hlslevel: params.hlslevel,
        isEdu: params.isEdu === undefined ? undefined : params.isEdu ? 1 : 0,
        encode_aac: params.encodeAac === undefined ? undefined : params.encodeAac ? 1 : 0,
        playerId: params.playerId
      },
      idempotent: false
    });
  }

  async moveCategory(params: MoveCategoryParams): Promise<unknown> {
    return this.client.request({
      method: 'POST',
      path: '/v2/cata/{userid}/change',
      params: { cataid: requireCataId(params.cataid), destCataid: requireCataId(params.destCataid) },
      idempotent: false
    });
  }

  /** Deletes an empty category. */
  async deleteCategory(cataid: string | number): Promise<unknown> {
    return this.client.request({
      method: 'POST',
      path: `${CATEGORY_PATH}/deleteCata`,
      auth: { scheme: 'sha1', keys: ['userid', 'cataid', 'ptime'] },
      params: { cataid: requireCataId(cataid) },
      idempotent: false
    });
  }
}
